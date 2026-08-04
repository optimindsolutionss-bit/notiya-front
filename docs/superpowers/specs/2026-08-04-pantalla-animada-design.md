# Pantalla animada (slides) — diseño

Fecha: 2026-08-04
Repo afectado: Frontend (React/MUI). Sin cambios de backend.

## Contexto

`PantallaPublica` (`/pantalla/:negocioId`) ya es una pantalla pública,
sin login, pensada para una TV/monitor en el local. Ya trae:

- `HeroHeader`: logo/nombre del negocio + indicador "En vivo" con pulso.
- `PromoRibbon`: marquee horizontal de promociones activas.
- `ProductScene3D`: cards de producto flotando con profundidad
  (parallax por mouse, animación de entrada/salida vía framer-motion,
  three-tier de profundidad simulada con CSS).
- `AvisosTicker`: marquee de los últimos avisos publicados.
- Polling cada 30s contra `GET /api/pantalla/:negocioId` (no hay
  WebSockets todavía; documentado como pendiente en el backend).

Esta base ya cumple el objetivo de "no estático, con movimiento" y no se
reescribe. Lo que falta es puntual: (1) nadie en el dashboard tiene forma
de encontrar la URL de esta pantalla para configurarla en la TV del
local, y (2) no hay ningún gancho para que el cliente que ve la pantalla
se suscriba a avisos por WhatsApp sin tener que ir al local.

Confirmado con el usuario: la pantalla es para un **monitor/TV pasivo**
con loop automático (no una pantalla táctil que el cliente opera) — la
interactividad la aporta el movimiento constante, no la navegación
manual.

## 1. Link de la pantalla, visible desde el dashboard

- `HeaderBar` (renderizado por `DashboardLayout` en todas las páginas
  de un negocio) recibe `negocioId`/`negocioActual` como prop y agrega
  un `IconButton` (ícono de TV/monitor, ej. `~icons/solar/tv-linear`)
  a la izquierda del ícono de notificaciones.
- Al hacer clic abre un `Popover` (no un `Dialog`, para que se sienta
  liviano) con:
  - El texto completo de la URL pública:
    `${window.location.origin}/pantalla/${negocioId}`.
  - Botón "Copiar link" (usa `navigator.clipboard.writeText`, feedback
    con un `Snackbar` breve "Link copiado").
  - Botón "Abrir en pestaña nueva" (`target="_blank"`) para que el
    dueño la pruebe antes de dejarla puesta en la TV.
- `DashboardLayout`: se agrega un último ítem fijo al final del listado
  de navegación, "Ver pantalla ↗", que abre la misma URL en pestaña
  nueva (no es una `Route` del router — es un link externo).
- Ambos puntos de entrada quedan visibles para cualquier rol con acceso
  al dashboard (dueño, editor, promotor) — es información pública, no
  hace falta restringirla.

## 2. QR de suscripción en la pantalla pública

- Ya existe `/suscribirse/:negocioId` (`SuscripcionPublica.jsx`), una
  página pública para que un cliente cargue su WhatsApp y quede
  suscrito a avisos — hoy no está enlazada desde ningún lado visible
  para el cliente final.
- Se agrega generación de QR **client-side** (paquete `qrcode.react` o
  equivalente que renderice a SVG/canvas sin llamar a un servicio
  externo — la TV puede estar en una red pobre o restringida, y no
  conviene depender de una API de terceros para algo que se ve todo el
  día).
- Ubicación: dentro de `HeroHeader`, en el bloque `ml: "auto"` que hoy
  solo tiene el indicador "En vivo" — se agrega el QR (~72–88px) a la
  izquierda de ese indicador, con un texto corto arriba: "Escaneá y
  recibí nuestras promos por WhatsApp".
- Es permanente (no rota como un slide): es una acción que el cliente
  puede tomar en cualquier momento, no un contenido informativo que
  compita por tiempo en pantalla.
- Apunta a `${window.location.origin}/suscribirse/${negocioId}`.

## 3. Ajuste a `PromoRibbon` cuando hay pocas promociones

- Hoy: si `promociones.length > 3`, hace marquee infinito; si no,
  se listan quietas en fila. Con 1 o 2 promociones activas (el caso más
  común para un negocio chico) el resultado es una fila estática que
  desentona con el resto de la pantalla, siempre en movimiento.
- Cambio: cuando `promociones.length <= 2`, en vez de listarlas quietas,
  cada `TarjetaPromo` se renderiza dentro de un contenedor con una
  animación de pulso/glow sutil en el borde (`boxShadow` animado entre
  `pantalla.accentMuted` y `pantalla.accent`, ciclo de ~2.5s,
  `repeat: Infinity`, respetando `useReducedMotion` igual que el resto
  del componente).
- Con 3 o más promociones, el comportamiento de marquee actual no
  cambia.

## Fuera de alcance

- Interacción táctil / navegación manual del cliente sobre la pantalla.
- Cualquier cambio relacionado a comandos de voz o auto-creación de
  productos/promos (spec aparte, pendiente).
- WebSockets / actualización en tiempo real (sigue en polling de 30s).
- Rediseño de `ProductScene3D` — se mantiene tal cual está.
