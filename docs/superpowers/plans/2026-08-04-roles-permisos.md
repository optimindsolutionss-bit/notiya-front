# Roles y Permisos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar un tercer rol de negocio ("promotor", limitado a promociones propias), completar la gestión de equipo del dueño, y sumar activar/desactivar negocio + gestión de usuarios al panel superadmin.

**Architecture:** Se construye sobre la infraestructura de roles ya existente (`negocio_usuarios.rol`, middleware `verificarAccesoNegocio`, flag `usuarios.es_superadmin`) en vez de un sistema de permisos genérico. Backend en `C:\Users\LENOVO\Documents\NotiYa\Backend` (Express + `pg`, estilo callback-free async/await, sin ORM). Frontend en `C:\Users\LENOVO\Documents\NotiYa\Frontend` (React 19 + React Router 7 + MUI + Context API, sin Redux).

**Tech Stack:** Node.js/Express/PostgreSQL (`pg`) en el backend. React 19/Vite/MUI/axios en el frontend. Sin framework de tests en ninguno de los dos repos — cada tarea se verifica manualmente (ver "Global Constraints").

## Global Constraints

- Roles válidos de `negocio_usuarios.rol`: `"dueño"`, `"editor"`, `"promotor"` (exactamente esos tres strings, con la ñ).
- Todo el body que el front envía va en camelCase; todo lo que el backend devuelve va en snake_case y se convierte con `snakeToCamelShallow` en el front (`src/api/caseUtils.js`). No romper esta convención en ningún endpoint nuevo.
- Todo error de la API responde `{ "mensaje": "..." }` con el código HTTP correspondiente (400 datos inválidos, 401 sin sesión, 403 sin permiso, 404 no existe, 500 error de servidor) — seguir el patrón `try { ... } catch (error) { console.error(error); return res.status(500).json({ mensaje: "Error del servidor" }); }` de todos los controladores existentes.
- Un negocio debe tener siempre al menos un usuario con rol `"dueño"` — ninguna operación (cambiar rol, quitar acceso) puede dejarlo sin ninguno.
- Sin framework de tests instalado (ni Jest/Mocha en backend, ni Vitest en frontend) y no se instala uno como parte de este plan (decisión explícita del usuario). Cada tarea se verifica manualmente: backend con `curl` contra el servidor local (`npm run dev`, puerto 4000) usando un token real obtenido de `POST /api/auth/login`; frontend arrancando `npm run dev` (puerto 5173) y probando en el navegador.
- Seguir los nombres de archivo y patrones ya establecidos (repositorio → controlador → rutas en el backend; `api/*.api.js` con `snakeToCamelShallow` en el frontend).

---

## Antes de empezar: cómo verificar el backend manualmente

Todas las tareas de backend se prueban con `curl` contra `http://localhost:4000`. El backend ya debe estar corriendo (`npm run dev` dentro de `Backend/`, ver `Servidor NotiYa corriendo en http://localhost:4000` en la consola).

Para obtener un token de un usuario existente:

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"TU_CORREO","password":"TU_PASSWORD"}'
```

Guardar el `token` de la respuesta en una variable de shell para reusarlo:

```bash
TOKEN="el-token-que-devolvió-el-login"
```

Y usarlo en cada request: `-H "Authorization: Bearer $TOKEN"`.

---

### Task 1: Migración SQL + repositorio — `contarDuenos`, `actualizarRol`, `eliminarUsuario`, `creado_por` en promociones

**Files:**
- Create: `Backend/db/manual/002_roles_y_permisos.sql`
- Modify: `Backend/src/repositories/negocioUsuarios.repository.js`

**Interfaces:**
- Consumes: nada (primera tarea).
- Produces: `negocioUsuariosRepo.contarDuenos(negocioId): Promise<number>`, `negocioUsuariosRepo.actualizarRol({negocioId, usuarioId, rol}): Promise<{id, negocio_id, usuario_id, rol}>`, `negocioUsuariosRepo.eliminarUsuario({negocioId, usuarioId}): Promise<boolean>` — usados por Task 2. Columna `promociones.creado_por` — usada por Task 3.

- [ ] **Step 1: Escribir la migración SQL**

```sql
-- Backend/db/manual/002_roles_y_permisos.sql
-- Aplicar manualmente contra la base Neon (no hay sistema de migraciones en este proyecto).

-- negocio_usuarios.rol ya es una columna de texto libre sin CHECK/ENUM que
-- enumere los valores permitidos (confirmado leyendo negocioUsuarios.repository.js
-- y negocios.controller.js: el único lugar donde se valida el rol es en
-- código de aplicación, con arrays literales ["dueño", "editor"]). El nuevo
-- valor "promotor" no requiere ALTER TABLE.
--
-- Si al aplicar esto en Neon el ALTER de abajo falla por un CHECK/ENUM que
-- no está reflejado en el código del repo, revisar el esquema real con
-- \d negocio_usuarios y agregar aquí el ALTER TYPE / DROP+ADD CONSTRAINT
-- necesario para permitir 'promotor' antes de seguir.

ALTER TABLE promociones
  ADD COLUMN IF NOT EXISTS creado_por INTEGER REFERENCES usuarios(id);
```

- [ ] **Step 2: Aplicar la migración contra la base real**

Conectarse a la base (con `psql` o el cliente que se use para Neon) y ejecutar el contenido del archivo. Verificar:

```sql
\d promociones
```

Debe listar la columna `creado_por` como `integer`, nullable, con foreign key a `usuarios(id)`.

- [ ] **Step 3: Agregar las tres funciones al repositorio**

En `Backend/src/repositories/negocioUsuarios.repository.js`, agregar antes de la línea `module.exports`:

```javascript
async function contarDuenos(negocioId) {
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS total FROM negocio_usuarios WHERE negocio_id = $1 AND rol = 'dueño'",
    [negocioId]
  );
  return rows[0].total;
}

async function actualizarRol({ negocioId, usuarioId, rol }) {
  const { rows } = await pool.query(
    `UPDATE negocio_usuarios SET rol = $3
     WHERE negocio_id = $1 AND usuario_id = $2
     RETURNING id, negocio_id, usuario_id, rol`,
    [negocioId, usuarioId, rol]
  );
  return rows[0];
}

async function eliminarUsuario({ negocioId, usuarioId }) {
  const { rowCount } = await pool.query(
    "DELETE FROM negocio_usuarios WHERE negocio_id = $1 AND usuario_id = $2",
    [negocioId, usuarioId]
  );
  return rowCount > 0;
}
```

Y actualizar el `module.exports` final a:

```javascript
module.exports = {
  obtenerAcceso,
  agregarUsuario,
  listarPorNegocio,
  contarDuenos,
  actualizarRol,
  eliminarUsuario,
};
```

- [ ] **Step 4: Verificar manualmente**

```bash
node -e "
require('dotenv').config({ path: 'Backend/.env' });
const repo = require('./Backend/src/repositories/negocioUsuarios.repository');
repo.contarDuenos(1).then((n) => { console.log('dueños del negocio 1:', n); process.exit(0); });
"
```

Expected: imprime un número (0 o más, según los datos reales) sin lanzar excepción. Usar un `negocioId` real de tu base si `1` no existe.

- [ ] **Step 5: Commit**

```bash
cd Backend
git add db/manual/002_roles_y_permisos.sql src/repositories/negocioUsuarios.repository.js
git commit -m "feat: agregar creado_por a promociones y funciones de gestión de roles"
```

---

### Task 2: Endpoints `PUT`/`DELETE /negocios/:id/empleados/:usuarioId`

**Files:**
- Modify: `Backend/src/controllers/negocios.controller.js`
- Modify: `Backend/src/routes/negocios.routes.js:22-25`

**Interfaces:**
- Consumes: `negocioUsuariosRepo.contarDuenos`, `.actualizarRol`, `.eliminarUsuario` (Task 1); `negocioUsuariosRepo.obtenerAcceso` (ya existente).
- Produces: `PUT /api/negocios/:negocioId/empleados/:usuarioId` (body `{ rol }`), `DELETE /api/negocios/:negocioId/empleados/:usuarioId` — usados por el frontend en Task 6/10.

- [ ] **Step 1: Agregar los controladores**

En `Backend/src/controllers/negocios.controller.js`, agregar después de `listarEmpleados` (antes de `obtenerHorario`):

```javascript
async function actualizarRolEmpleado(req, res) {
  try {
    if (req.rolNegocio !== "dueño") {
      return res.status(403).json({ mensaje: "Solo el dueño puede cambiar roles" });
    }
    const { rol } = req.body;
    if (!["dueño", "editor", "promotor"].includes(rol)) {
      return res.status(400).json({ mensaje: "rol debe ser dueño, editor o promotor" });
    }
    const usuarioId = Number(req.params.usuarioId);
    const acceso = await negocioUsuariosRepo.obtenerAcceso(req.negocioId, usuarioId);
    if (!acceso) {
      return res.status(404).json({ mensaje: "Ese usuario no tiene acceso a este negocio" });
    }
    if (acceso.rol === "dueño" && rol !== "dueño") {
      const totalDuenos = await negocioUsuariosRepo.contarDuenos(req.negocioId);
      if (totalDuenos <= 1) {
        return res.status(400).json({ mensaje: "El negocio debe tener al menos un dueño" });
      }
    }
    const actualizado = await negocioUsuariosRepo.actualizarRol({
      negocioId: req.negocioId,
      usuarioId,
      rol,
    });
    return res.json({ mensaje: "Rol actualizado", acceso: actualizado });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
}

async function quitarEmpleado(req, res) {
  try {
    if (req.rolNegocio !== "dueño") {
      return res.status(403).json({ mensaje: "Solo el dueño puede quitar acceso" });
    }
    const usuarioId = Number(req.params.usuarioId);
    const acceso = await negocioUsuariosRepo.obtenerAcceso(req.negocioId, usuarioId);
    if (!acceso) {
      return res.status(404).json({ mensaje: "Ese usuario no tiene acceso a este negocio" });
    }
    if (acceso.rol === "dueño") {
      const totalDuenos = await negocioUsuariosRepo.contarDuenos(req.negocioId);
      if (totalDuenos <= 1) {
        return res.status(400).json({ mensaje: "El negocio debe tener al menos un dueño" });
      }
    }
    await negocioUsuariosRepo.eliminarUsuario({ negocioId: req.negocioId, usuarioId });
    return res.json({ mensaje: "Acceso eliminado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
}
```

Y agregar ambos al `module.exports` final (junto a `agregarEmpleado`, `listarEmpleados`, etc.):

```javascript
module.exports = {
  crear,
  listarMios,
  obtener,
  actualizar,
  agregarEmpleado,
  listarEmpleados,
  actualizarRolEmpleado,
  quitarEmpleado,
  obtenerHorario,
  actualizarHorario,
};
```

- [ ] **Step 2: Registrar las rutas**

En `Backend/src/routes/negocios.routes.js`, después de la línea `router.get("/:negocioId/empleados", verificarAccesoNegocio(), controlador.listarEmpleados);`, agregar:

```javascript
router.put("/:negocioId/empleados/:usuarioId", verificarAccesoNegocio(), controlador.actualizarRolEmpleado);
router.delete("/:negocioId/empleados/:usuarioId", verificarAccesoNegocio(), controlador.quitarEmpleado);
```

(`verificarAccesoNegocio()` sin argumentos exige `dueño` o `editor` para poder llamar el endpoint; el chequeo estricto de "solo dueño" ya lo hace el controlador — mismo patrón de doble capa que usa `agregarEmpleado`.)

- [ ] **Step 3: Verificar manualmente con curl**

Con un `$TOKEN` de un usuario `dueño` de un negocio real (`$NEGOCIO_ID`) y un `$USUARIO_ID` de otro miembro de ese negocio (agregarlo primero con `POST /empleados` si no hay ninguno):

```bash
# Cambiar rol
curl -s -X PUT "http://localhost:4000/api/negocios/$NEGOCIO_ID/empleados/$USUARIO_ID" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"rol":"promotor"}'
```
Expected: `{"mensaje":"Rol actualizado","acceso":{"id":...,"negocio_id":...,"usuario_id":...,"rol":"promotor"}}`

```bash
# Intentar quitar al único dueño (debe fallar)
curl -s -X DELETE "http://localhost:4000/api/negocios/$NEGOCIO_ID/empleados/$TU_PROPIO_USUARIO_ID" \
  -H "Authorization: Bearer $TOKEN"
```
Expected: `400` con `{"mensaje":"El negocio debe tener al menos un dueño"}` (asumiendo que sos el único dueño).

```bash
# Quitar acceso a alguien que no es el único dueño
curl -s -X DELETE "http://localhost:4000/api/negocios/$NEGOCIO_ID/empleados/$USUARIO_ID" \
  -H "Authorization: Bearer $TOKEN"
```
Expected: `{"mensaje":"Acceso eliminado"}`

- [ ] **Step 4: Commit**

```bash
cd Backend
git add src/controllers/negocios.controller.js src/routes/negocios.routes.js
git commit -m "feat: agregar endpoints para cambiar rol y quitar acceso a un empleado"
```

---

### Task 3: Rol `promotor` en promociones (crea/edita/borra solo las propias)

**Files:**
- Modify: `Backend/src/repositories/promociones.repository.js`
- Modify: `Backend/src/controllers/promociones.controller.js`
- Modify: `Backend/src/routes/promociones.routes.js`

**Interfaces:**
- Consumes: columna `promociones.creado_por` (Task 1); `req.rolNegocio` y `req.usuario.id` (ya los inyecta `auth.middleware.js`).
- Produces: `GET/POST /negocios/:id/promociones` accesibles para `promotor`; `PUT/DELETE /negocios/:id/promociones/:promocionId` accesibles para `promotor` solo si es el creador — usado por el frontend en Task 11.

- [ ] **Step 1: Repositorio — aceptar y usar `creadoPor`**

En `Backend/src/repositories/promociones.repository.js`, reemplazar la función `crear`:

```javascript
async function crear(negocioId, { productoId, titulo, descripcion, precioPromocional, fechaInicio, fechaFin, creadoPor }) {
  const { rows } = await pool.query(
    `INSERT INTO promociones (negocio_id, producto_id, titulo, descripcion, precio_promocional, fecha_inicio, fecha_fin, creado_por)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [negocioId, productoId || null, titulo, descripcion || null, precioPromocional || null, fechaInicio, fechaFin, creadoPor]
  );
  return rows[0];
}
```

(`buscarPorId`, usado en el Step 2 de abajo, ya existe sin cambios y ya devuelve `creado_por` porque hace `SELECT *`.)

- [ ] **Step 2: Controlador — grabar el creador y validar ownership**

En `Backend/src/controllers/promociones.controller.js`, reemplazar `crear`:

```javascript
async function crear(req, res) {
  try {
    const { productoId, titulo, descripcion, precioPromocional, fechaInicio, fechaFin } = req.body;
    if (!titulo || !fechaInicio || !fechaFin) {
      return res.status(400).json({ mensaje: "titulo, fechaInicio y fechaFin son obligatorios" });
    }
    const promocion = await promocionesRepo.crear(req.negocioId, {
      productoId,
      titulo,
      descripcion,
      precioPromocional,
      fechaInicio,
      fechaFin,
      creadoPor: req.usuario.id,
    });
    return res.status(201).json({ mensaje: "Promoción creada", promocion });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
}
```

Reemplazar `actualizar` y `eliminar` para agregar el chequeo de ownership al principio de cada una (antes del resto de la lógica existente):

```javascript
async function actualizar(req, res) {
  try {
    if (req.rolNegocio === "promotor") {
      const existente = await promocionesRepo.buscarPorId(req.negocioId, req.params.promocionId);
      if (!existente) {
        return res.status(404).json({ mensaje: "Promoción no encontrada" });
      }
      if (existente.creado_por !== req.usuario.id) {
        return res.status(403).json({ mensaje: "Solo puedes editar tus propias promociones" });
      }
    }
    const mapaCampos = {
      productoId: "producto_id",
      titulo: "titulo",
      descripcion: "descripcion",
      precioPromocional: "precio_promocional",
      fechaInicio: "fecha_inicio",
      fechaFin: "fecha_fin",
      activo: "activo",
    };
    const campos = {};
    for (const [campoBody, columna] of Object.entries(mapaCampos)) {
      if (req.body[campoBody] !== undefined) campos[columna] = req.body[campoBody];
    }
    const promocion = await promocionesRepo.actualizar(req.negocioId, req.params.promocionId, campos);
    if (!promocion) {
      return res.status(404).json({ mensaje: "Promoción no encontrada" });
    }
    return res.json({ mensaje: "Promoción actualizada", promocion });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
}

async function eliminar(req, res) {
  try {
    if (req.rolNegocio === "promotor") {
      const existente = await promocionesRepo.buscarPorId(req.negocioId, req.params.promocionId);
      if (!existente) {
        return res.status(404).json({ mensaje: "Promoción no encontrada" });
      }
      if (existente.creado_por !== req.usuario.id) {
        return res.status(403).json({ mensaje: "Solo puedes eliminar tus propias promociones" });
      }
    }
    const eliminada = await promocionesRepo.eliminar(req.negocioId, req.params.promocionId);
    if (!eliminada) {
      return res.status(404).json({ mensaje: "Promoción no encontrada" });
    }
    return res.json({ mensaje: "Promoción eliminada" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
}
```

- [ ] **Step 3: Rutas — permitir `promotor`**

En `Backend/src/routes/promociones.routes.js`, cambiar:

```javascript
router.use(verificarAccesoNegocio());
```

por:

```javascript
router.use(verificarAccesoNegocio(["dueño", "editor", "promotor"]));
```

- [ ] **Step 4: Verificar manualmente con curl**

Con `$TOKEN_PROMOTOR` de un usuario con `rol = "promotor"` en `$NEGOCIO_ID` (usar el `PUT /empleados` de Task 2 para dejar a un usuario de prueba como promotor):

```bash
# Crear promo como promotor
curl -s -X POST "http://localhost:4000/api/negocios/$NEGOCIO_ID/promociones" \
  -H "Authorization: Bearer $TOKEN_PROMOTOR" -H "Content-Type: application/json" \
  -d '{"titulo":"Promo de prueba","fechaInicio":"2026-08-04T00:00:00Z","fechaFin":"2026-08-10T00:00:00Z"}'
```
Expected: `201` con la promoción creada, `"creado_por"` igual al id del usuario promotor.

```bash
# Intentar editar una promo ajena (crear otra desde $TOKEN de un dueño, luego intentar editarla con $TOKEN_PROMOTOR)
curl -s -X PUT "http://localhost:4000/api/negocios/$NEGOCIO_ID/promociones/$ID_PROMO_AJENA" \
  -H "Authorization: Bearer $TOKEN_PROMOTOR" -H "Content-Type: application/json" \
  -d '{"titulo":"Intento de edición"}'
```
Expected: `403` con `{"mensaje":"Solo puedes editar tus propias promociones"}`.

```bash
# Promotor no puede tocar productos
curl -s -X POST "http://localhost:4000/api/negocios/$NEGOCIO_ID/productos" \
  -H "Authorization: Bearer $TOKEN_PROMOTOR" -H "Content-Type: application/json" \
  -d '{"nombre":"Intento","precio":1}'
```
Expected: sigue dando `403` como antes de este cambio (las rutas de productos no se tocan en esta tarea — se confirma que no se rompió nada).

- [ ] **Step 5: Commit**

```bash
cd Backend
git add src/repositories/promociones.repository.js src/controllers/promociones.controller.js src/routes/promociones.routes.js
git commit -m "feat: permitir rol promotor en promociones, limitado a las propias"
```

---

### Task 4: Rol `promotor` ve productos en modo solo-lectura (id + nombre) para el selector de promo

**Files:**
- Modify: `Backend/src/repositories/productos.repository.js`
- Modify: `Backend/src/controllers/productos.controller.js`
- Modify: `Backend/src/routes/productos.routes.js`

**Interfaces:**
- Consumes: `req.rolNegocio` (ya inyectado por el middleware).
- Produces: `productosRepo.listarBasico(negocioId): Promise<{id, nombre}[]>`. `GET /negocios/:id/productos` sigue en la misma URL pero devuelve el listado reducido cuando quien llama es `promotor`.

- [ ] **Step 1: Repositorio — `listarBasico`**

En `Backend/src/repositories/productos.repository.js`, agregar antes de `module.exports`:

```javascript
async function listarBasico(negocioId) {
  const { rows } = await pool.query(
    "SELECT id, nombre FROM productos WHERE negocio_id = $1 ORDER BY nombre",
    [negocioId]
  );
  return rows;
}
```

Y sumarla al `module.exports`:

```javascript
module.exports = {
  crear,
  listarPorNegocio,
  listarBasico,
  buscarPorId,
  actualizar,
  eliminar,
  buscarPorNombreAproximado,
};
```

- [ ] **Step 2: Controlador — bifurcar `listar`, bloquear el resto para `promotor`**

En `Backend/src/controllers/productos.controller.js`, reemplazar `listar`:

```javascript
async function listar(req, res) {
  try {
    if (req.rolNegocio === "promotor") {
      const productos = await productosRepo.listarBasico(req.negocioId);
      return res.json({ productos });
    }
    const productos = await productosRepo.listarPorNegocio(req.negocioId);
    return res.json({ productos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
}
```

Y agregar, como primera línea dentro del `try` de `obtener`, `crear`, `actualizar`, `actualizarDisponibilidad` y `eliminar` (las cinco funciones restantes), el mismo guard:

```javascript
    if (req.rolNegocio === "promotor") {
      return res.status(403).json({ mensaje: "No tienes acceso a productos" });
    }
```

- [ ] **Step 3: Rutas — permitir `promotor` a nivel de router**

En `Backend/src/routes/productos.routes.js`, cambiar:

```javascript
router.use(verificarAccesoNegocio());
```

por:

```javascript
router.use(verificarAccesoNegocio(["dueño", "editor", "promotor"]));
```

(El router ahora deja pasar a `promotor` para las cinco rutas; el guard agregado en el Step 2 es lo que realmente bloquea todo salvo `listar`.)

- [ ] **Step 4: Verificar manualmente con curl**

```bash
# Promotor: listado reducido
curl -s "http://localhost:4000/api/negocios/$NEGOCIO_ID/productos" -H "Authorization: Bearer $TOKEN_PROMOTOR"
```
Expected: `{"productos":[{"id":...,"nombre":"..."}, ...]}` — sin `precio`, `disponible`, etc.

```bash
# Dueño: listado completo (no debe haberse roto)
curl -s "http://localhost:4000/api/negocios/$NEGOCIO_ID/productos" -H "Authorization: Bearer $TOKEN"
```
Expected: cada producto trae todos los campos (`precio`, `disponible`, `categoria_id`, etc.) como antes.

```bash
# Promotor: intentar crear un producto
curl -s -X POST "http://localhost:4000/api/negocios/$NEGOCIO_ID/productos" \
  -H "Authorization: Bearer $TOKEN_PROMOTOR" -H "Content-Type: application/json" \
  -d '{"nombre":"Intento","precio":1}'
```
Expected: `403` con `{"mensaje":"No tienes acceso a productos"}`.

- [ ] **Step 5: Commit**

```bash
cd Backend
git add src/repositories/productos.repository.js src/controllers/productos.controller.js src/routes/productos.routes.js
git commit -m "feat: rol promotor accede a productos en modo solo-lectura reducido"
```

---

### Task 5: Panel superadmin — listar todos los usuarios y togglear superadmin

**Files:**
- Modify: `Backend/src/repositories/usuarios.repository.js`
- Modify: `Backend/src/controllers/admin.controller.js`
- Modify: `Backend/src/routes/admin.routes.js`

**Interfaces:**
- Consumes: nada nuevo (usa `pool` ya importado).
- Produces: `usuariosRepo.listarTodos({limit, offset}): Promise<{id, nombre, correo, es_superadmin}[]>`, `usuariosRepo.actualizarSuperAdmin(id, esSuperAdmin): Promise<{...}>`. `GET /admin/usuarios` (sin `?correo=`) y `PATCH /admin/usuarios/:id/superadmin` — usados por el frontend en Task 13.

- [ ] **Step 1: Repositorio**

En `Backend/src/repositories/usuarios.repository.js`, agregar antes de `module.exports`:

```javascript
async function listarTodos({ limit = 200, offset = 0 } = {}) {
  const { rows } = await pool.query(
    "SELECT id, nombre, correo, es_superadmin FROM usuarios ORDER BY id LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  return rows;
}

async function actualizarSuperAdmin(id, esSuperAdmin) {
  const { rows } = await pool.query(
    "UPDATE usuarios SET es_superadmin = $2 WHERE id = $1 RETURNING id, nombre, correo, es_superadmin",
    [id, esSuperAdmin]
  );
  return rows[0];
}
```

Y actualizar el `module.exports`:

```javascript
module.exports = {
  buscarPorCorreo,
  crearUsuario,
  buscarPorId,
  buscarPorCorreoParcial,
  listarTodos,
  actualizarSuperAdmin,
};
```

- [ ] **Step 2: Controlador**

En `Backend/src/controllers/admin.controller.js`, reemplazar `buscarUsuarios` para que liste todos cuando no viene `correo`, y agregar `actualizarSuperAdmin`:

```javascript
async function buscarUsuarios(req, res) {
  try {
    const { correo } = req.query;
    if (!correo) {
      const usuarios = await usuariosRepo.listarTodos();
      return res.json({ usuarios });
    }
    const usuarios = await usuariosRepo.buscarPorCorreoParcial(correo);
    return res.json({ usuarios });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
}

async function actualizarSuperAdmin(req, res) {
  try {
    const id = Number(req.params.id);
    if (id === req.usuario.id) {
      return res.status(400).json({ mensaje: "No puedes quitarte tu propio permiso de super admin" });
    }
    const { esSuperAdmin } = req.body;
    if (typeof esSuperAdmin !== "boolean") {
      return res.status(400).json({ mensaje: "esSuperAdmin debe ser booleano" });
    }
    const usuario = await usuariosRepo.actualizarSuperAdmin(id, esSuperAdmin);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    return res.json({ mensaje: "Usuario actualizado", usuario });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error del servidor" });
  }
}
```

Actualizar el `module.exports`:

```javascript
module.exports = { listarNegocios, crearNegocioParaUsuario, buscarUsuarios, actualizarSuperAdmin };
```

- [ ] **Step 3: Ruta nueva**

En `Backend/src/routes/admin.routes.js`, después de `router.get("/usuarios", controlador.buscarUsuarios);`, agregar:

```javascript
router.patch("/usuarios/:id/superadmin", controlador.actualizarSuperAdmin);
```

- [ ] **Step 4: Verificar manualmente con curl**

Con `$TOKEN_ADMIN` de un usuario `es_superadmin = true`:

```bash
# Listar todos (sin ?correo=)
curl -s "http://localhost:4000/api/admin/usuarios" -H "Authorization: Bearer $TOKEN_ADMIN"
```
Expected: `{"usuarios":[{"id":...,"nombre":"...","correo":"...","es_superadmin":false}, ...]}` con todos los usuarios de la plataforma.

```bash
# Búsqueda parcial sigue funcionando igual que antes (usada por el diálogo de crear negocio)
curl -s "http://localhost:4000/api/admin/usuarios?correo=algo" -H "Authorization: Bearer $TOKEN_ADMIN"
```
Expected: mismo comportamiento que antes de este cambio.

```bash
# Togglear superadmin de otro usuario
curl -s -X PATCH "http://localhost:4000/api/admin/usuarios/$OTRO_USUARIO_ID/superadmin" \
  -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"esSuperAdmin":true}'
```
Expected: `{"mensaje":"Usuario actualizado","usuario":{...,"es_superadmin":true}}`.

```bash
# Intentar quitarse el permiso a uno mismo
curl -s -X PATCH "http://localhost:4000/api/admin/usuarios/$TU_PROPIO_ID/superadmin" \
  -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"esSuperAdmin":false}'
```
Expected: `400` con `{"mensaje":"No puedes quitarte tu propio permiso de super admin"}`.

- [ ] **Step 5: Commit**

```bash
cd Backend
git add src/repositories/usuarios.repository.js src/controllers/admin.controller.js src/routes/admin.routes.js
git commit -m "feat: listar todos los usuarios y togglear superadmin desde el panel admin"
```

---

### Task 6: API del frontend — empleados, usuarios admin, y fix de seguridad en `normalizeProducto`

**Files:**
- Modify: `Frontend/src/api/negocios.api.js`
- Modify: `Frontend/src/api/admin.api.js`
- Modify: `Frontend/src/api/productos.api.js:4-7`

**Interfaces:**
- Consumes: endpoints de Tasks 2, 4, 5.
- Produces: `negociosApi.listarEmpleados(negocioId)`, `.agregarEmpleado(negocioId, {correo, rol})`, `.actualizarRolEmpleado(negocioId, usuarioId, rol)`, `.quitarEmpleado(negocioId, usuarioId)`; `adminApi.listarUsuarios()`, `.actualizarSuperAdmin(usuarioId, esSuperAdmin)` — usados por Tasks 10, 13.

- [ ] **Step 1: `negocios.api.js` — funciones de empleados**

Agregar al final de `Frontend/src/api/negocios.api.js` (después de `crearCompleto`):

```javascript
export async function listarEmpleados(negocioId) {
  const { data } = await api.get(`/negocios/${negocioId}/empleados`);
  return data.empleados.map(snakeToCamelShallow);
}

export async function agregarEmpleado(negocioId, { correo, rol }) {
  const { data } = await api.post(`/negocios/${negocioId}/empleados`, { correo, rol });
  return snakeToCamelShallow(data.acceso);
}

export async function actualizarRolEmpleado(negocioId, usuarioId, rol) {
  const { data } = await api.put(`/negocios/${negocioId}/empleados/${usuarioId}`, { rol });
  return snakeToCamelShallow(data.acceso);
}

export async function quitarEmpleado(negocioId, usuarioId) {
  await api.delete(`/negocios/${negocioId}/empleados/${usuarioId}`);
}
```

- [ ] **Step 2: `admin.api.js` — funciones de usuarios**

Agregar al final de `Frontend/src/api/admin.api.js`:

```javascript
export async function listarUsuarios() {
  const { data } = await api.get("/admin/usuarios");
  return data.usuarios.map(snakeToCamelShallow);
}

export async function actualizarSuperAdmin(usuarioId, esSuperAdmin) {
  const { data } = await api.patch(`/admin/usuarios/${usuarioId}/superadmin`, { esSuperAdmin });
  return snakeToCamelShallow(data.usuario);
}
```

- [ ] **Step 3: `productos.api.js` — `normalizeProducto` no debe romper con el listado reducido**

La Task 4 hace que `GET /productos` devuelva solo `{id, nombre}` cuando quien llama es `promotor` (sin `precio`). `normalizeProducto` hoy hace `Number(producto.precio)`, que da `NaN` si `precio` no vino. Reemplazar en `Frontend/src/api/productos.api.js:4-7`:

```javascript
export function normalizeProducto(row) {
  const producto = snakeToCamelShallow(row);
  return { ...producto, precio: producto.precio != null ? Number(producto.precio) : undefined };
}
```

- [ ] **Step 4: Verificar manualmente**

```bash
cd Frontend
npx eslint src/api/negocios.api.js src/api/admin.api.js src/api/productos.api.js
```
Expected: sin salida (sin errores de lint). El uso real de estas funciones se verifica en el navegador en las Tasks 9-13, que son las que las consumen.

- [ ] **Step 5: Commit**

```bash
cd Frontend
git add src/api/negocios.api.js src/api/admin.api.js src/api/productos.api.js
git commit -m "feat: wrappers de API para empleados, usuarios admin, y fix de normalizeProducto"
```

---

### Task 7: `useRolNegocio` hook + guard `RequireRolNegocio`

**Files:**
- Create: `Frontend/src/hooks/useRolNegocio.js`
- Create: `Frontend/src/router/guards/RequireRolNegocio.jsx`

**Interfaces:**
- Consumes: `useAuth()` (`esSuperAdmin`), `useNegocio()` (`negocios`) — ya existentes.
- Produces: `useRolNegocio(negocioId): "dueño"|"editor"|"promotor"|null` — usado por Tasks 9, 11. `<RequireRolNegocio roles={[...]} />` (componente de ruta) — usado por Task 8.

- [ ] **Step 1: Escribir el hook**

```javascript
// Frontend/src/hooks/useRolNegocio.js
import { useAuth } from "../context/AuthContext";
import { useNegocio } from "../context/NegocioContext";

export function useRolNegocio(negocioId) {
  const { esSuperAdmin } = useAuth();
  const { negocios } = useNegocio();
  if (esSuperAdmin) return "dueño";
  const id = Number(negocioId);
  return negocios.find((n) => n.id === id)?.rol || null;
}
```

- [ ] **Step 2: Escribir el guard**

```jsx
// Frontend/src/router/guards/RequireRolNegocio.jsx
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useRolNegocio } from "../../hooks/useRolNegocio";

export default function RequireRolNegocio({ roles }) {
  const { negocioId } = useParams();
  const rol = useRolNegocio(negocioId);

  if (rol && !roles.includes(rol)) {
    return <Navigate to={`/app/${negocioId}/promociones`} replace />;
  }

  return <Outlet />;
}
```

(Si `rol` todavía es `null` — datos de negocios cargando — deja pasar; `RequireNegocio`, que envuelve a este guard más arriba en el árbol de rutas, ya se encarga de mostrar el spinner mientras carga y de bloquear el acceso si no hay negocio.)

- [ ] **Step 3: Verificar manualmente**

```bash
cd Frontend
npx eslint src/hooks/useRolNegocio.js src/router/guards/RequireRolNegocio.jsx
```
Expected: sin errores. (El uso real se verifica en Task 8, una vez esté conectado al router.)

- [ ] **Step 4: Commit**

```bash
cd Frontend
git add src/hooks/useRolNegocio.js src/router/guards/RequireRolNegocio.jsx
git commit -m "feat: hook useRolNegocio y guard RequireRolNegocio"
```

---

### Task 8: Conectar el guard al router + ruta de Equipo

**Files:**
- Modify: `Frontend/src/router/AppRouter.jsx`

**Interfaces:**
- Consumes: `<RequireRolNegocio roles={[...]} />` (Task 7); `EquipoPage` (Task 10, se importa ya en esta tarea aunque el archivo se cree después — ver nota en Step 2).
- Produces: rutas `/app/:negocioId/productos|plantillas|clientes|mensajes|comandos` protegidas a `["dueño","editor"]`; `/app/:negocioId/equipo` protegida a `["dueño"]`; `/app/:negocioId/promociones` sigue abierta a los tres roles.

- [ ] **Step 1: Import del guard y de `EquipoPage`**

En `Frontend/src/router/AppRouter.jsx`, agregar a los imports (junto a `RequireNegocio`, `RequireSuperAdmin`):

```javascript
import RequireRolNegocio from "./guards/RequireRolNegocio";
import EquipoPage from "../pages/Equipo/EquipoPage";
```

- [ ] **Step 2: Reestructurar las rutas anidadas del dashboard**

Reemplazar el bloque completo:

```jsx
        <Route path="/app/:negocioId" element={<RequireNegocio />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="productos" replace />} />
            <Route path="productos" element={<ProductosPage />} />
            <Route path="promociones" element={<PromocionesPage />} />
            <Route path="plantillas" element={<PlantillasPage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="mensajes" element={<MensajesPage />} />
            <Route path="comandos" element={<ComandosIaPage />} />
          </Route>
        </Route>
```

por:

```jsx
        <Route path="/app/:negocioId" element={<RequireNegocio />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="promociones" replace />} />
            <Route path="promociones" element={<PromocionesPage />} />
            <Route element={<RequireRolNegocio roles={["dueño", "editor"]} />}>
              <Route path="productos" element={<ProductosPage />} />
              <Route path="plantillas" element={<PlantillasPage />} />
              <Route path="clientes" element={<ClientesPage />} />
              <Route path="mensajes" element={<MensajesPage />} />
              <Route path="comandos" element={<ComandosIaPage />} />
            </Route>
            <Route element={<RequireRolNegocio roles={["dueño"]} />}>
              <Route path="equipo" element={<EquipoPage />} />
            </Route>
          </Route>
        </Route>
```

Nota: la ruta `index` ahora redirige a `promociones` (accesible para los tres roles) en vez de `productos` — evita el doble-redirect para un `promotor` que entra a `/app/:id`. Para `dueño`/`editor` no cambia nada perceptible (van a ver Promociones como pantalla de entrada en vez de Productos).

- [ ] **Step 3: Verificar manualmente (requiere Task 10 para que `EquipoPage` exista — ver nota)**

Esta tarea deja un import roto (`../pages/Equipo/EquipoPage` no existe todavía) hasta que se complete la Task 10. Si se ejecuta este plan en orden, seguir directo a la Task 9 y 10 antes de verificar en el navegador. Si se quiere verificar el router de forma aislada antes de escribir `EquipoPage`, comentar temporalmente la línea del import y la ruta `equipo`, verificar que `/app/:id/productos` y `/app/:id/promociones` navegan bien, y luego descomentar al llegar a la Task 10.

- [ ] **Step 4: Commit**

```bash
cd Frontend
git add src/router/AppRouter.jsx
git commit -m "feat: proteger rutas del dashboard por rol y agregar ruta de equipo"
```

---

### Task 9: `DashboardLayout` — menú filtrado por rol

**Files:**
- Modify: `Frontend/src/layouts/DashboardLayout.jsx`

**Interfaces:**
- Consumes: `useRolNegocio(negocioId)` (Task 7).
- Produces: sidebar que solo muestra los ítems permitidos para el rol actual.

- [ ] **Step 1: Import y uso del hook**

En `Frontend/src/layouts/DashboardLayout.jsx`, agregar el import (junto a los demás):

```javascript
import { useRolNegocio } from "../hooks/useRolNegocio";
import IconEquipo from "~icons/solar/users-group-two-rounded-linear";
```

Dentro del componente, después de la línea `const id = Number(negocioId);`, agregar:

```javascript
  const rol = useRolNegocio(negocioId);
```

- [ ] **Step 2: Agregar el ícono nuevo al mapa `ICONS`**

En el objeto `ICONS` (arriba del componente), agregar la clave `equipo`:

```javascript
const ICONS = {
  productos: IconProductos,
  promociones: IconPromociones,
  plantillas: IconPlantillas,
  clientes: IconClientes,
  mensajes: IconMensajes,
  comandos: IconComandos,
  equipo: IconEquipo,
  admin: IconAdmin,
  logout: IconLogout,
  chevron: IconChevron,
};
```

- [ ] **Step 3: Filtrar `navItems` por rol**

Reemplazar el `useMemo` de `navItems`:

```javascript
  const navItems = useMemo(() => {
    const todos = [
      { label: "Promociones", to: `/app/${id}/promociones`, icon: ICONS.promociones, roles: ["dueño", "editor", "promotor"] },
      { label: "Productos", to: `/app/${id}/productos`, icon: ICONS.productos, roles: ["dueño", "editor"] },
      { label: "Plantillas", to: `/app/${id}/plantillas`, icon: ICONS.plantillas, roles: ["dueño", "editor"] },
      { label: "Clientes", to: `/app/${id}/clientes`, icon: ICONS.clientes, roles: ["dueño", "editor"] },
      { label: "Mensajes", to: `/app/${id}/mensajes`, icon: ICONS.mensajes, roles: ["dueño", "editor"] },
      { label: "Comandos IA", to: `/app/${id}/comandos`, icon: ICONS.comandos, roles: ["dueño", "editor"] },
      { label: "Equipo", to: `/app/${id}/equipo`, icon: ICONS.equipo, roles: ["dueño"] },
    ];
    return todos.filter((item) => !rol || item.roles.includes(rol));
  }, [id, rol]);
```

- [ ] **Step 4: Verificar en el navegador**

Con el frontend y backend corriendo:
1. Entrar como `dueño` de un negocio → el sidebar debe mostrar los 7 ítems (Promociones, Productos, Plantillas, Clientes, Mensajes, Comandos IA, Equipo) en ese orden.
2. Cambiar el rol de un usuario de prueba a `promotor` (con el endpoint de Task 2, o desde la UI de Task 10 si ya está lista) y entrar con ese usuario → el sidebar debe mostrar solo "Promociones".
3. Con ese mismo usuario `promotor`, escribir en la barra de direcciones `/app/:negocioId/productos` a mano → debe redirigir automáticamente a `/app/:negocioId/promociones` (el guard de Task 8 en acción).

- [ ] **Step 5: Commit**

```bash
cd Frontend
git add src/layouts/DashboardLayout.jsx
git commit -m "feat: filtrar menú del dashboard según el rol del usuario en el negocio"
```

---

### Task 10: Página nueva — Equipo (`/app/:negocioId/equipo`)

**Files:**
- Create: `Frontend/src/pages/Equipo/EquipoPage.jsx`

**Interfaces:**
- Consumes: `negociosApi.listarEmpleados`, `.agregarEmpleado`, `.actualizarRolEmpleado`, `.quitarEmpleado` (Task 6); `PageHeader`, `EmptyState` (componentes ya existentes); `useStaggerReveal` (`src/hooks/useRevealAnimation.js`, ya existente).
- Produces: componente `EquipoPage` — importado por `AppRouter.jsx` (Task 8).

- [ ] **Step 1: Escribir el componente**

```jsx
// Frontend/src/pages/Equipo/EquipoPage.jsx
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Stack,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Card,
  Box,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import * as negociosApi from "../../api/negocios.api";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/layout/PageHeader";
import EmptyState from "../../components/layout/EmptyState";
import { useStaggerReveal } from "../../hooks/useRevealAnimation";
import IconEquipo from "~icons/solar/users-group-two-rounded-linear";

const ROLES = ["dueño", "editor", "promotor"];

export default function EquipoPage() {
  const { negocioId } = useParams();
  const id = Number(negocioId);
  const { usuario } = useAuth();

  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [correo, setCorreo] = useState("");
  const [rolNuevo, setRolNuevo] = useState("editor");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const listRef = useStaggerReveal({ translateY: 10, duration: 350, staggerDelay: 50 });

  const cargar = useCallback(async () => {
    setEmpleados(await negociosApi.listarEmpleados(id));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    cargar();
  }, [cargar]);

  const handleAgregar = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await negociosApi.agregarEmpleado(id, { correo: correo.trim(), rol: rolNuevo });
      setCorreo("");
      setRolNuevo("editor");
      cargar();
    } catch (err) {
      const status = err.response?.status;
      setError(
        status === 404
          ? "No existe una cuenta con ese correo. La persona debe registrarse primero."
          : err.response?.data?.mensaje || "No se pudo agregar"
      );
    } finally {
      setGuardando(false);
    }
  };

  const cambiarRol = async (usuarioId, rol) => {
    await negociosApi.actualizarRolEmpleado(id, usuarioId, rol);
    cargar();
  };

  const quitar = async (usuarioId) => {
    if (!window.confirm("¿Quitar el acceso de esta persona al negocio?")) return;
    await negociosApi.quitarEmpleado(id, usuarioId);
    cargar();
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader title="Equipo" subtitle="Quién tiene acceso a este negocio y con qué rol." />

      <Card sx={{ p: 2.5, mb: 3 }}>
        <form onSubmit={handleAgregar}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              fullWidth
              label="Correo de la persona"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            <Select value={rolNuevo} onChange={(e) => setRolNuevo(e.target.value)} sx={{ minWidth: 160 }}>
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
            <Button type="submit" variant="contained" disabled={guardando} startIcon={<AddRoundedIcon />} sx={{ flexShrink: 0 }}>
              {guardando ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Agregar"}
            </Button>
          </Stack>
        </form>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Card>

      {empleados.length === 0 ? (
        <EmptyState icon={IconEquipo} title="Todavía no hay nadie más en el equipo" description="Agrega a alguien por correo arriba." />
      ) : (
        <Stack ref={listRef} spacing={1.5}>
          {empleados.map((emp) => (
            <Card key={emp.usuarioId} sx={{ p: 2, opacity: 0 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }} noWrap>
                    {emp.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {emp.correo}
                  </Typography>
                </Box>
                <Select
                  size="small"
                  value={emp.rol}
                  onChange={(e) => cambiarRol(emp.usuarioId, e.target.value)}
                  disabled={emp.usuarioId === usuario?.id}
                  sx={{ minWidth: 140 }}
                >
                  {ROLES.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
                <IconButton size="small" onClick={() => quitar(emp.usuarioId)} disabled={emp.usuarioId === usuario?.id}>
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
```

Nota: el `Select` de rol y el botón de quitar se deshabilitan en la propia fila del usuario logueado (`emp.usuarioId === usuario?.id`) para que nadie se quite su propio acceso por error desde esta pantalla — el backend igual lo rechazaría (Task 2) si fuera el único dueño, pero esto evita el error confuso en el caso más común.

- [ ] **Step 2: Verificar en el navegador**

1. Iniciar sesión como dueño de un negocio con al menos otra persona ya vinculada (o agregar una con un segundo usuario de prueba ya registrado).
2. Ir a `/app/:negocioId/equipo` (o hacer clic en "Equipo" en el sidebar).
3. Agregar a alguien con un correo que no existe → debe mostrar el mensaje "No existe una cuenta con ese correo...".
4. Agregar a alguien con un correo real ya registrado → debe aparecer en la lista.
5. Cambiar su rol a "promotor" con el `Select` de la fila → confirmar que el cambio persiste (recargar la página).
6. Quitarle el acceso con el ícono de basura → confirmar el diálogo, y que desaparece de la lista.
7. Confirmar que la propia fila del usuario logueado tiene el `Select` y el botón de basura deshabilitados.

- [ ] **Step 3: Commit**

```bash
cd Frontend
git add src/pages/Equipo/EquipoPage.jsx
git commit -m "feat: página Equipo para que el dueño gestione accesos y roles"
```

---

### Task 11: `PromocionesPage` — ocultar editar/eliminar de promos ajenas para `promotor`

**Files:**
- Modify: `Frontend/src/pages/Promociones/PromocionesPage.jsx`

**Interfaces:**
- Consumes: `useRolNegocio` (Task 7); `useAuth()` (ya existente, para `usuario.id`).
- Produces: n/a (última consumidora de la cadena de esta tarea).

- [ ] **Step 1: Import y cálculo de permisos**

En `Frontend/src/pages/Promociones/PromocionesPage.jsx`, agregar los imports:

```javascript
import { useAuth } from "../../context/AuthContext";
import { useRolNegocio } from "../../hooks/useRolNegocio";
```

Dentro del componente, después de `const id = Number(negocioId);`, agregar:

```javascript
  const { usuario } = useAuth();
  const rol = useRolNegocio(id);
  const puedeEditar = (promo) => rol !== "promotor" || promo.creadoPor === usuario?.id;
```

- [ ] **Step 2: Ocultar los botones según `puedeEditar`**

Reemplazar el bloque de los dos `IconButton` (editar/eliminar) dentro del `.map`:

```jsx
                {puedeEditar(promo) && (
                  <>
                    <IconButton size="small" onClick={() => setDialog({ open: true, promocion: promo })}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => eliminar(promo)}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
```

- [ ] **Step 3: Verificar en el navegador**

1. Como `dueño`, entrar a Promociones → ver editar/eliminar en todas las promos (comportamiento sin cambios).
2. Como `promotor`, crear una promo propia → debe verse con editar/eliminar habilitados.
3. Como ese mismo `promotor`, ver una promo creada por el dueño (`creadoPor` distinto) → no debe mostrar los botones de editar/eliminar en esa card.
4. Como `promotor`, abrir "Nueva promoción" → el selector de producto debe mostrar solo nombres (viene del `GET /productos` reducido de Task 4, sin cambios adicionales necesarios en `PromocionFormDialog` porque ya recibe `productos` como prop genérica).

- [ ] **Step 4: Commit**

```bash
cd Frontend
git add src/pages/Promociones/PromocionesPage.jsx
git commit -m "feat: ocultar editar/eliminar de promociones ajenas para el rol promotor"
```

---

### Task 12: Panel Superadmin — activar/desactivar negocio

**Files:**
- Modify: `Frontend/src/pages/Admin/AdminNegociosPage.jsx`

**Interfaces:**
- Consumes: `negociosApi.actualizar` (ya existe en `negocios.api.js`, acepta `{activo}`).
- Produces: n/a.

- [ ] **Step 1: Import**

`Chip` ya está importado en este archivo (se usa para el chip de `tipoNegocio`). Agregar solo el import que falta, junto al de `adminApi`:

```javascript
import * as negociosApi from "../../api/negocios.api";
```

- [ ] **Step 2: Handler de toggle**

Dentro del componente, agregar:

```javascript
  const toggleActivo = async (negocio) => {
    const actualizado = await negociosApi.actualizar(negocio.id, { activo: !negocio.activo });
    setNegocios((prev) => prev.map((n) => (n.id === negocio.id ? { ...n, activo: actualizado.activo } : n)));
  };
```

- [ ] **Step 3: Hacer clickeable el chip de Activo/Inactivo que ya existe**

El chip que muestra "Activo"/"Inactivo" ya existe en el `.map(filtrados)` (es solo texto, no hace nada al tocarlo):

```jsx
                    <Chip size="small" label={negocio.activo ? "Activo" : "Inactivo"} color={negocio.activo ? "success" : "default"} variant="outlined" />
```

Reemplazarlo por la misma línea agregando `onClick`:

```jsx
                    <Chip
                      size="small"
                      label={negocio.activo ? "Activo" : "Inactivo"}
                      color={negocio.activo ? "success" : "default"}
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActivo(negocio);
                      }}
                    />
```

(`onClick` con `e.stopPropagation()` porque la card entera ya tiene su propio `onClick` de navegación vía `CardActionArea` — sin esto, tocar el chip también navegaría al negocio.)

- [ ] **Step 4: Verificar en el navegador**

1. Entrar a `/admin/negocios` como superadmin.
2. Cada card debe mostrar un chip "Activo" (verde) por defecto.
3. Hacer clic en el chip → debe cambiar a "Inactivo" (gris) sin navegar ni recargar la página.
4. Recargar la página → el estado debe persistir (viene de `negocio.activo` real en la base).

- [ ] **Step 5: Commit**

```bash
cd Frontend
git add src/pages/Admin/AdminNegociosPage.jsx
git commit -m "feat: activar/desactivar negocio desde el panel superadmin"
```

---

### Task 13: Página nueva — Usuarios de la plataforma (superadmin)

**Files:**
- Create: `Frontend/src/pages/Admin/AdminUsuariosPage.jsx`
- Modify: `Frontend/src/router/AppRouter.jsx`
- Modify: `Frontend/src/layouts/DashboardLayout.jsx`

**Interfaces:**
- Consumes: `adminApi.listarUsuarios`, `.actualizarSuperAdmin` (Task 6).
- Produces: ruta `/admin/usuarios`, ítem de navegación "Usuarios" junto a "Todos los negocios" en el sidebar (visible solo para superadmin).

- [ ] **Step 1: Escribir el componente**

```jsx
// Frontend/src/pages/Admin/AdminUsuariosPage.jsx
import { useEffect, useState } from "react";
import {
  Container,
  Box,
  TextField,
  Stack,
  Card,
  CardContent,
  Typography,
  Switch,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import * as adminApi from "../../api/admin.api";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/layout/PageHeader";
import { useStaggerReveal } from "../../hooks/useRevealAnimation";

export default function AdminUsuariosPage() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const listRef = useStaggerReveal({ translateY: 10, duration: 350, staggerDelay: 50 });

  useEffect(() => {
    adminApi.listarUsuarios().then((lista) => {
      setUsuarios(lista);
      setLoading(false);
    });
  }, []);

  const toggleSuperAdmin = async (u) => {
    const actualizado = await adminApi.actualizarSuperAdmin(u.id, !u.esSuperAdmin);
    setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, esSuperAdmin: actualizado.esSuperAdmin } : x)));
  };

  const filtrados = usuarios.filter(
    (u) => u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || u.correo.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader title="Usuarios" subtitle={`${usuarios.length} usuarios registrados en la plataforma`} />

      <TextField
        fullWidth
        placeholder="Buscar por nombre o correo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ color: "text.disabled" }} />
            </InputAdornment>
          ),
        }}
      />

      <Stack ref={listRef} spacing={1.5}>
        {filtrados.map((u) => (
          <Card key={u.id} sx={{ opacity: 0 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700 }} noWrap>
                  {u.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {u.correo}
                </Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  Superadmin
                </Typography>
                <Switch checked={u.esSuperAdmin} onChange={() => toggleSuperAdmin(u)} disabled={u.id === usuario?.id} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
```

- [ ] **Step 2: Ruta en `AppRouter.jsx`**

Agregar el import:

```javascript
import AdminUsuariosPage from "../pages/Admin/AdminUsuariosPage";
```

Y, dentro del bloque `<Route element={<RequireSuperAdmin />}>`, junto a la ruta existente de `/admin/negocios`:

```jsx
        <Route element={<RequireSuperAdmin />}>
          <Route path="/admin/negocios" element={<AdminNegociosPage />} />
          <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
        </Route>
```

- [ ] **Step 3: Ítem de navegación en `DashboardLayout.jsx`**

En el bloque `{esSuperAdmin && ( ... )}` de `DashboardLayout.jsx`, agregar un segundo link junto al de "Todos los negocios":

```jsx
          {esSuperAdmin && (
            <>
              <Divider sx={{ my: 1 }} />
              <Box component="li">
                <Box component={NavLink} to="/admin/negocios" onClick={() => setMovilAbierto(false)} sx={navLinkSx}>
                  <NavIcon icon={ICONS.admin} />
                  <Box component="span" sx={{ flexGrow: 1 }}>
                    Todos los negocios
                  </Box>
                </Box>
              </Box>
              <Box component="li">
                <Box component={NavLink} to="/admin/usuarios" onClick={() => setMovilAbierto(false)} sx={navLinkSx}>
                  <NavIcon icon={ICONS.usuarios} />
                  <Box component="span" sx={{ flexGrow: 1 }}>
                    Usuarios
                  </Box>
                </Box>
              </Box>
            </>
          )}
```

Y agregar el ícono correspondiente: import `IconUsuarios from "~icons/solar/user-id-linear";` junto a los demás imports de íconos, y `usuarios: IconUsuarios,` en el objeto `ICONS`.

- [ ] **Step 4: Verificar en el navegador**

1. Entrar como superadmin → el sidebar debe mostrar "Todos los negocios" y "Usuarios" debajo del divisor.
2. Ir a `/admin/usuarios` → debe listar todos los usuarios registrados.
3. Buscar por nombre o correo en el campo de búsqueda → filtra en vivo sin llamar al backend de nuevo.
4. Togglear el switch de superadmin de otro usuario → debe persistir al recargar.
5. Confirmar que el switch de la propia fila (el usuario logueado) está deshabilitado.

- [ ] **Step 5: Commit**

```bash
cd Frontend
git add src/pages/Admin/AdminUsuariosPage.jsx src/router/AppRouter.jsx src/layouts/DashboardLayout.jsx
git commit -m "feat: página de gestión de usuarios de la plataforma para superadmin"
```
