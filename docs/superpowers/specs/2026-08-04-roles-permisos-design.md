# Roles y permisos por negocio — diseño

Fecha: 2026-08-04
Repos afectados: Backend (Express/Postgres) y Frontend (React/MUI)

## Contexto

NotiYa es multi-tenant: un usuario puede tener acceso a varios negocios, y
cada negocio puede tener varias personas vinculadas. Hoy existen tres
niveles reales de acceso pero solo dos están modelados:

- **Superadmin** (`usuarios.es_superadmin`): bypassa todo, ya implementado
  en `verificarAccesoNegocio` y en el guard `RequireSuperAdmin` del front.
  Tiene una página (`AdminNegociosPage`) para listar negocios, crear uno
  para cualquier usuario, y buscar usuarios por correo.
- **Dueño** (`negocio_usuarios.rol = "dueño"`): acceso completo a su
  negocio. Ya funciona así en el backend (todas las rutas de un negocio
  aceptan `dueño`), pero el frontend no tiene ninguna pantalla para que
  el dueño administre quién más tiene acceso a su negocio (el endpoint
  `POST/GET /negocios/:id/empleados` existe pero no se usa desde ningún
  lado del front).
- **Editor** (`negocio_usuarios.rol = "editor"`): existe en la base y en
  el middleware, pero hoy tiene exactamente los mismos permisos que
  `dueño` en todas las rutas — no hay ninguna restricción real.

Lo que falta es un cuarto rol, **promotor**: una persona vinculada al
negocio que únicamente puede crear/gestionar promociones, sin acceso a
productos, clientes, plantillas, mensajes ni comandos de IA.

## Modelo de datos

Cambios sobre el esquema actual (aplicar manualmente contra Neon, como
`db/manual/001_add_superadmin.sql`):

```sql
-- db/manual/002_add_rol_promotor_y_creado_por.sql

-- negocio_usuarios.rol ya es texto libre (no hay CHECK constraint que
-- enumere los valores permitidos), así que el nuevo valor "promotor" no
-- requiere ALTER TABLE. Solo se valida en el código de la aplicación.

ALTER TABLE promociones
  ADD COLUMN IF NOT EXISTS creado_por INTEGER REFERENCES usuarios(id);
```

Si en la práctica `negocio_usuarios.rol` tiene un `CHECK` o un tipo ENUM
que no vimos en el código explorado, el mismo archivo debe incluir el
`ALTER TYPE` / `DROP CONSTRAINT` + `ADD CONSTRAINT` correspondiente antes
de aplicarse — verificar el esquema real en Neon antes de ejecutar.

Roles válidos de aquí en adelante: `"dueño"`, `"editor"`, `"promotor"`.

## Backend

### Permisos por rol y por ruta

`verificarAccesoNegocio(rolesPermitidos)` sigue siendo la puerta de
entrada (¿tiene acceso a este negocio?), pero ahora cada grupo de rutas
declara explícitamente qué roles entran:

| Rutas | Roles permitidos |
|---|---|
| `productos`, `categorias`, `clientes` (privadas), `plantillas`, `mensajes`, `comandos` | `dueño`, `editor` |
| `promociones` (crear, listar) | `dueño`, `editor`, `promotor` |
| `promociones` (actualizar, eliminar) | `dueño`, `editor` sin restricción; `promotor` solo si `promocion.creado_por === req.usuario.id` (403 si no) |
| `negocios` (`PUT`, horarios, empleados) | `dueño` únicamente (ya está así en `agregarEmpleado`, se generaliza) |

El chequeo de "solo mis promos" se agrega dentro de
`promociones.controller.actualizar` / `eliminar`, comparando
`req.rolNegocio` y `promocion.creado_por` antes de llamar al repositorio
(un `SELECT` previo para obtener `creado_por`, ya que `buscarPorId` existe
en el repositorio).

`promociones.controller.crear` graba `creado_por: req.usuario.id`.

### Selector de producto para promotor

`promotor` no puede ver `GET /negocios/:id/productos` (trae precio,
disponibilidad, categoría — parte del inventario). Se agrega:

```
GET /negocios/:negocioId/productos?campos=basico
```

Reutiliza el mismo controlador/ruta existente; si `req.query.campos ===
"basico"`, el repositorio hace `SELECT id, nombre` en vez de `SELECT *`.
Esta variante queda accesible para `dueño`, `editor` y `promotor` (se
agrega una segunda entrada de ruta con su propio
`verificarAccesoNegocio(["dueño","editor","promotor"])` o se relaja el
chequeo dentro del controlador según `req.rolNegocio` y el querystring).

### Gestión de equipo (nuevos endpoints)

En `negocios.routes.js`, junto a los `POST/GET /:negocioId/empleados`
existentes:

```
PUT    /:negocioId/empleados/:usuarioId   Body: { rol }   [solo dueño]
DELETE /:negocioId/empleados/:usuarioId                    [solo dueño]
```

Ambos devuelven 404 si el usuario no tiene acceso al negocio. `PUT`
valida `rol` contra el enum de tres valores (mismo array que ya usa
`agregarEmpleado`).

Ambos protegen contra dejar un negocio sin dueño: antes de aplicar el
cambio, si el usuario objetivo tiene `rol = "dueño"`, se cuenta cuántos
accesos con `rol = "dueño"` tiene el negocio (`negocioUsuariosRepo` gana
un `contarDuenos(negocioId)`); si es 1, `PUT` con otro rol o `DELETE`
devuelven 400 ("el negocio debe tener al menos un dueño"). Esto cubre
tanto el caso de que el dueño se quite a sí mismo como que degrade/quite
a otro dueño quedando el negocio huérfano.

### Panel de administración de la plataforma

En `admin.routes.js` (ya protegido por `verificarSuperAdmin`):

```
GET   /admin/usuarios                    Lista todos los usuarios (id, nombre, correo, esSuperAdmin), paginado
PATCH /admin/usuarios/:id/superadmin     Body: { esSuperAdmin: boolean }
```

`PATCH .../superadmin` no permite que un superadmin se quite el permiso
a sí mismo (evita quedarse sin ningún superadmin por error humano) —
devuelve 400 si `req.usuario.id === Number(req.params.id)`.

La gestión de empleados de un negocio desde el panel admin **no** necesita
endpoints nuevos: como `verificarAccesoNegocio` ya bypassa la
verificación de membresía cuando `req.usuario.esSuperAdmin`, el superadmin
puede llamar a los mismos `GET/POST/PUT/DELETE
/negocios/:id/empleados` para cualquier negocio.

## Frontend

### Guards y navegación por rol

- `NegocioContext` ya trae `rol` por negocio en la lista de `negocios`
  (`GET /api/negocios` lo devuelve). Se agrega un helper
  `useRolNegocio(negocioId)` que busca ese rol (o `"dueño"` si
  `esSuperAdmin`).
- Nuevo guard `RequireRolNegocio({ roles })`, hermano de
  `RequireSuperAdmin`, para envolver las rutas de `productos`,
  `plantillas`, `clientes`, `mensajes`, `comandos` y `equipo` con
  `roles={["dueño","editor"]}` (y `equipo` con `["dueño"]`). Si el rol
  actual no está en la lista, redirige a
  `/app/:negocioId/promociones` (la única sección a la que un
  `promotor` sí tiene acceso).
- `DashboardLayout`: `navItems` se filtra según el rol antes de
  renderizarse — un `promotor` solo ve "Promociones" en el menú lateral
  (y no ve "Equipo", que además solo es visible para `dueño`/superadmin).

### Página nueva: Equipo (`/app/:negocioId/equipo`)

Estructura calcada de `AdminNegociosPage` (lista + diálogo de
creación), pero acotada a un negocio:

- Lista (`GET /empleados`): nombre, correo, rol, con un `Select` inline
  para cambiar el rol (`PUT`) y un botón quitar acceso (`DELETE`, con
  confirmación).
- Formulario "Agregar": campo correo (texto libre, sin autocomplete —
  el backend exige coincidencia exacta y usuario ya registrado) +
  `Select` de rol → `POST /empleados`. Error 404 del backend se muestra
  como "no existe una cuenta con ese correo, debe registrarse primero".

### `PromocionesPage`

- El formulario de alta usa `GET /productos?campos=basico` en vez de
  `GET /productos` cuando el rol actual es `promotor` (mismo componente
  `PromocionFormDialog`, ya recibe `productos` como prop — cambia solo
  qué llamada hace el padre).
- Los botones de editar/eliminar de cada card se ocultan si
  `promocion.creadoPor !== usuario.id` y el rol es `promotor`.

### Panel Superadmin

- `AdminNegociosPage`: cada card gana un `Chip`/`Switch` "Activo" que
  llama `PUT /negocios/:id` con `{ activo }`, optimista con rollback en
  error.
- Nueva página `/admin/usuarios`: tabla con buscador (filtra en
  cliente sobre el resultado de `GET /admin/usuarios`, no hace falta
  búsqueda server-side aparte de la ya usada al crear negocio) y un
  `Switch` por fila para `PATCH .../superadmin`. Deshabilitado en la
  fila del propio usuario logueado (refuerza la regla del backend).
- Ítem "Equipo" del negocio, accesible desde `AdminNegociosPage` (botón
  en cada card que navega a `/app/:negocioId/equipo` — ya funciona
  porque superadmin tiene acceso vía bypass).

## Fuera de alcance

- Invitar por correo a alguien sin cuenta todavía (queda la regla
  actual: la persona debe registrarse antes de que el dueño la agregue).
- Permisos configurables/granulares más allá de los tres roles fijos.
- Auditoría de cambios de rol (quién agregó/quitó a quién, cuándo).
