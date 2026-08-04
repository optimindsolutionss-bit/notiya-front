# NotiYa — Frontend

## Qué es NotiYa

NotiYa **no es una app de pedidos ni tiene carrito de compras.** Es una plataforma de **notificaciones por WhatsApp para negocios**:

- Un dueño de negocio ("negocio") gestiona un **catálogo de productos** (categorías, nombre, precio, imagen, disponibilidad).
- Desde ahí envía **avisos, promociones y recordatorios por WhatsApp** a sus clientes suscritos (stock agotado, nuevas promos, etc.).
- Existe además una **Pantalla pública** (sin login) por negocio — una cartelera digital tipo menú de tienda (inspirada en pantallas de KFC / El Corral) que muestra el negocio, sus productos disponibles y promociones activas en tiempo real. Pensada para correr en un kiosco/TV o compartirse como link público.
- Un **Super Admin** puede ver y administrar TODOS los negocios de la plataforma (crear negocios y asignarlos a cualquier usuario), mientras que cada negocio sigue teniendo su propio dueño/editor que solo gestiona lo suyo.

Repos hermanos en `C:\Users\LENOVO\Documents\NotiYa\`:
- `Frontend/` (este repo) — React 19 + Vite + MUI v9.
- `Backend/` — Node + Express 5 + PostgreSQL (Neon), sin ORM (SQL crudo), sin sistema de migraciones formal.

## Stack

- React 19, Vite, MUI v9 (`@mui/material`, `@mui/icons-material`), Emotion.
- `react-router-dom` para ruteo.
- `framer-motion` para animaciones (incluida la Pantalla pública animada).
- `axios` para llamadas HTTP.
- `@fontsource/inter` para la tipografía base (auto-hospedada, sin depender de un CDN externo).

## Cómo correr en desarrollo

```bash
npm install
npm run dev
```

Requiere el backend corriendo en paralelo:

```bash
cd ../Backend
npm run dev   # http://localhost:4000
```

Variables de entorno (`.env`, ver `.env.example`):

```
VITE_API_URL=http://localhost:4000/api
```

## Contrato de API (resumen para el frontend)

Base URL: `VITE_API_URL` (dev: `http://localhost:4000/api`). Sin versionado (`/api` a secas).

**Convención importante**: los *bodies* que envía el frontend van en **camelCase** (calzan 1:1 con lo que esperan los controllers). Las *respuestas* del backend vienen en **snake_case** crudo de Postgres — se normalizan a camelCase en la capa `src/api/*.api.js` antes de llegar a los componentes. Los precios (`precio`, `precio_promocional`) llegan como *strings* (`"5000.00"`) y se convierten a `Number` en esa misma capa.

Errores: siempre `{ "mensaje": "<texto>" }` con HTTP 400/401/403/404/409/500.

### Auth (`/api/auth`)
- `POST /registro` `{ nombre, correo, password }` → `{ mensaje, usuario }` (sin token).
- `POST /login` `{ correo, password }` → `{ mensaje, token, usuario: { id, nombre, correo, esSuperAdmin } }`.
- Rutas privadas requieren header `Authorization: Bearer <token>` (expira en 8h).

### Negocios (`/api/negocios`, privado)
- `POST /` — solo acepta `{ nombre, tipoNegocio, direccion, telefonoContacto, correoContacto }` (creador queda como `dueño`). **No acepta `logoUrl`/`descripcion` en la creación** — para eso hace falta `PUT /:id` después.
- `GET /` — negocios donde el usuario tiene acceso (con rol).
- `GET/PUT /:negocioId` — detalle/actualización (PUT sí acepta `logoUrl`, `descripcion`, etc.)

### Categorías / Productos (`/api/negocios/:negocioId/categorias` y `/productos`, privado)
- CRUD estándar. Producto: `{ categoriaId, nombre, descripcion, precio, imagenUrl }`. `PATCH /productos/:id/disponibilidad` alterna disponibilidad (poner `false` genera automáticamente un aviso de "agotado" en el backend). No hay endpoint de subida de imágenes — `imagenUrl` es un link ya hospedado en otro lado.

### Pantalla pública (`/api/pantalla/:negocioId`, público, sin auth)
- Devuelve `{ negocio, productos, promociones, avisos }`. `negocio` viene ya en camelCase; el resto en snake_case crudo. No incluye nombres de categoría (solo `categoria_id`), por eso la Pantalla no usa tabs de categoría.

### Admin / Super Admin (`/api/admin`, privado, requiere `esSuperAdmin`)
- `GET /negocios` — TODOS los negocios de la plataforma (no solo los propios).
- `POST /negocios` — crea un negocio asignándolo a un `usuarioId` específico.
- `GET /usuarios?correo=` — buscar usuario por correo (para asignar dueño al crear negocio).

Detalle completo de la API en `../Backend/docs/resumen-tecnico-front.txt`.

## Progreso

Ver [`PROGRESS.md`](./PROGRESS.md) para el checklist de fases de este build (auth, negocio, super admin, productos, pantalla pública) — pensado para retomar el trabajo entre sesiones sin perder contexto.
