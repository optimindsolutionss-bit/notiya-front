# Progreso del build — NotiYa Frontend

> Checklist para retomar el trabajo entre sesiones. Marcar `[x]` al completar y agregar una nota corta si algo quedó a medias o con una decisión pendiente.
> Plan completo de referencia: `C:\Users\LENOVO\.claude\plans\listo-vamos-a-realizar-groovy-shamir.md`

## Fase 0 — Setup y documentación
- [x] README.md con contexto de negocio + contrato de API
- [x] PROGRESS.md (este archivo)
- [x] Instalar `react-router-dom`, `framer-motion`, `@fontsource/inter`
- [x] Limpiar `index.css` (quitar bloque `#root` del template de Vite)
- [x] `.env` / `.env.example` con `VITE_API_URL`

## Fase 1 — Backend: Super Admin ✅ (completada)
- [x] SQL manual: agregar `es_superadmin` a `usuarios` en Neon (`db/manual/001_add_superadmin.sql`, aplicado)
- [x] Marcar un usuario de prueba como super admin en BD (`superadmin.test@notiya.dev`)
- [x] `usuarios.repository.js` expone `es_superadmin` (+ `buscarPorId`, `buscarPorCorreoParcial`)
- [x] `auth.controller.js` incluye `esSuperAdmin` en respuesta de login + payload JWT
- [x] `verificarSuperAdmin` (nuevo middleware) + bypass en `verificarAccesoNegocio`
- [x] `negocios.repository.js`: `listarTodos()` (crear-para-usuario reutiliza `crearNegocio` + `negocioUsuarios.agregarUsuario` directo en el controller, sin duplicar lógica)
- [x] `admin.controller.js` + `admin.routes.js` (`GET/POST /api/admin/negocios`, `GET /api/admin/usuarios`)
- [x] Probado manualmente con curl (login super admin, listar todos, crear+asignar dueño, 403 para usuario normal, bypass de acceso a negocio ajeno)

## Fase 2 — Frontend: Fundación ✅ (completada)
- [x] `axios.js` refactorizado (interceptores + baseURL por env)
- [x] `caseUtils.js`, `auth.api.js`, `negocios.api.js`, `categorias.api.js`, `productos.api.js`, `pantalla.api.js`, `admin.api.js`
- [x] `AuthContext` (con `esSuperAdmin`), `NegocioContext`
- [x] Guards: `RequireAuth`, `RequireNegocio`, `RequireSuperAdmin`
- [x] `AppRouter` con árbol completo de rutas
- [x] `App.jsx`/`main.jsx` como composition root (providers + BrowserRouter + fuente)
- [x] `npm run build` y `npm run lint` en verde

## Fase 3 — Auth ✅ (completada)
- [x] Login refactorizado (usa `AuthContext`, mantiene diseño actual, extraído a `AuthCard` compartido)
- [x] Registro nuevo (mismo lenguaje visual)

## Fase 4 — Negocio (dueño/editor) ✅ (completada)
- [x] `NegociosSelector` (estado vacío + grid de negocios)
- [x] Creación de negocio (POST + PUT encadenado vía `negocios.api.crearCompleto`)

## Fase 5 — Dashboard shell ✅ (completada)
- [x] `DashboardLayout` (sidebar/topbar, nav condicional por `esSuperAdmin`, logout)

## Fase 6 — Productos + Categorías ✅ (completada)
- [x] CRUD de categorías (`CategoriaManager`)
- [x] CRUD de productos + preview de imagen por URL (`ProductoFormDialog`, `useImagePreview`)
- [x] Toggle de disponibilidad (optimista + snackbar del aviso automático)

## Fase 7 — Panel Super Admin (frontend) ✅ (completada)
- [x] `AdminNegociosPage` (todos los negocios + buscador)
- [x] `AdminCrearNegocioDialog` (form + buscador de dueño por correo, `Autocomplete` debounced)
- [ ] Verificado en navegador real (pendiente — este entorno no tiene automatización de navegador; probado a nivel API con curl, ver Fase 9)

## Fase 8 — Pantalla pública animada (pieza central) ✅ (completada)
- [x] Paleta/tipografía definida vía `ui-ux-pro-max` (paleta "Digital Signage/Kiosk": fondo #020617, superficie #0E1223, acento rojo #EF4444; tipografía Inter bold + JetBrains Mono para precios tabulares) — `pantallaTokens.js`
- [x] `HeroHeader`, `PromoRibbon`, `AvisosTicker`, `PantallaStates`
- [x] `ProductScene3D` (capas de profundidad cerca/media/lejos, deriva continua independiente, cruces por z-index, parallax sutil con mouse)
- [x] Fallback `prefers-reduced-motion` (grid estático real, no solo pausado)
- [x] Pulido con criterio de `emil-design-eng` + checklist de `review-animations`: deriva ambiental continua movida de framer-motion JS a `@keyframes` CSS puro (corre fuera del hilo principal, crítico para un loop de horas), duraciones de entrada ajustadas a ≤300-350ms, entradas nunca desde `scale(0)`

## Fase 9 — Pulido final ✅ (completada)
- [x] Reconciliar color de marca (favicon recoloreado de morado #863bff/#7e14ff a indigo #4F46E5/#4338CA)
- [x] `npm audit fix` (brace-expansion resuelto; la advisory de react-router es específica de "RSC Mode" — no aplica a esta SPA client-only con BrowserRouter, se deja documentado)
- [x] Verificación end-to-end vía curl contra backend real: registro, login (normal y super admin), crear negocio (POST+PUT encadenado), categorías/productos/promoción de prueba, `GET /api/pantalla/:id` con shape exacto verificado contra el normalizador del frontend, 403 de `/api/admin/*` para usuario normal, bypass de super admin a negocio ajeno
- [ ] **Pendiente del usuario**: verificación visual en navegador real (este entorno no tiene automatización de navegador disponible) — abrir `http://localhost:5173`, especialmente `/pantalla/2` para juzgar la sensación de la escena animada, que es la pieza más subjetiva/creativa del encargo

## Fase 10 — Módulos restantes: Promociones, Plantillas, Clientes, Mensajes, Comandos IA ✅ (completada)
- [x] `promociones.api.js`, `plantillas.api.js`, `clientes.api.js`, `mensajes.api.js`, `comandosIa.api.js`
- [x] `PromocionesPage` (CRUD, vínculo opcional a producto, badge activa/inactiva por fecha)
- [x] `PlantillasPage` (CRUD nombre/tipo/contenido, tipos en `src/constants/plantillas.js` compartido)
- [x] `ClientesPage` (listar suscriptores + dar de baja + enlace copiable) y `SuscripcionPublica` (`/suscribirse/:negocioId`, pública, sin auth — necesaria para poblar clientes reales)
- [x] `MensajesPage` (crear con plantilla opcional, envío inmediato o programado, filtro por estado, cancelar pendientes)
- [x] `ComandosIaPage` (texto libre → interpretación server-side, historial, confirmar/descartar borrador)
- [x] Nav del dashboard y `AppRouter` actualizados con las 5 rutas nuevas + la pública de suscripción
- [x] `npm run build`/`lint` en verde
- [x] Verificado end-to-end con curl: suscripción pública, listar clientes, crear plantilla/promoción/mensaje inmediato, comando IA con borrador generado y confirmado
- [x] **Bug encontrado y corregido durante la verificación**: `comandos_ia.estado` es literalmente `"pendiente"` (no `null` como asumí inicialmente) antes de confirmar/descartar — la condición para mostrar los botones de acción en `ComandosIaPage.jsx` estaba invertida y nunca se habría mostrado; corregido a `comando.estado === "pendiente"`.

Fuera de alcance todavía: horarios de atención, gestión de empleados/roles finos, subida real de imágenes (no hay endpoint), grabación de voz para Comandos IA (solo texto).

## Fase 11 — Tema del panel (historial de 3 intentos) ✅ (completada, en MUI)
Iteración larga por feedback repetido del usuario ("sigue igual"). Historial completo por si se retoma:
1. **Intento 1**: solo shell (sidebar/topbar) en Tailwind + reskin de `theme.js` de MUI, resto de páginas sin tocar. Rechazado: reskinear MUI vía theme no cambia la estructura Material Design (TextField con label flotante, ripples), "seguía viéndose igual".
2. **Intento 2**: migración completa del panel interno de MUI → Tailwind puro, con primitivos propios en `src/components/ui/` calcados de la plantilla `free-tailwind-admin-dashboard-template` (TailAdmin). También rechazado por el usuario.
3. **Intento 3 (estado final)**: el usuario pidió explícitamente usar `https://github.com/minimal-ui-kit/material-kit-react.git` como referencia — un template **MUI** (no Tailwind). Se revirtió todo Tailwind y se reconstruyó **`theme.js` calcado del tema real de ese repo** (clonado a un scratchpad para leer `theme/core/palette.ts`, `typography.ts`, `custom-shadows.ts`, `components.tsx`):
   - Paleta real: `primary #1877F2`, `secondary #8E33FF`, `info #00B8D9`, `success #22C55E`, `warning #FFAB00`, `error #FF5630`, escala de grises `GREY.50–900` (`#FCFDFD`→`#141A21`)
   - Tipografía: `DM Sans Variable` (body) + `Barlow` (headings, peso 700-800) — fuentes agregadas vía `@fontsource-variable/dm-sans` y `@fontsource/barlow`
   - `shape.borderRadius: 8`, `MuiCard` con `borderRadius: 16` y sombra "card" calculada igual que `custom-shadows.ts` (`0 0 2px rgba(145,158,171,.2), 0 12px 24px -4px rgba(145,158,171,.12)`)
   - Overrides de componente calcados 1:1: `MuiButton` (disableElevation, containedInherit gris), `MuiOutlinedInput`, `MuiPaper` (elevation 0), `MuiTableCell` head, `MuiCardHeader`, `MuiBackdrop`, `MuiLink` underline hover
   - Todas las páginas (Login/Registro/DashboardLayout/Productos/Promociones/Plantillas/Clientes/Mensajes/ComandosIa/Admin) reconstruidas en MUI puro otra vez, mismo JSX/lógica que la Fase 5-10 original, ahora sobre este theme
   - Tailwind, `@tailwindcss/vite`, `lucide-react` y `src/components/ui/` **eliminados** del proyecto
   - `@iconify/react` instalado (lo usa el repo de referencia) pero **no integrado todavía** — los iconos siguen en `@mui/icons-material` porque ya eran parte del proyecto y no era el foco del reclamo del usuario; queda pendiente si se quiere fidelidad total de iconografía
4. **Ajuste 4**: el usuario señaló `https://mui.com/store/previews/minimal-dashboard-free/` (preview en vivo del mismo producto) y dijo que "no se parecen en nada". Este entorno no tiene navegador (WebFetch no renderiza el SPA), así que en vez de adivinar de nuevo se leyó el código fuente real del clon local (autoritativo, no visual):
   - `layouts/dashboard/nav.tsx`: spec exacta del item de nav — `pl:2 py:1 gap:2 pr:1.5 minHeight:44 borderRadius:0.75(×8=6px)`, activo = `fontWeight 600 + color primary.main + bgcolor alpha(primary,.08)` (sin barra lateral, solo el fondo). `DashboardLayout.jsx` reescrito para calzar esto exacto (antes usaba el spacing por defecto de `ListItemButton`+`ListItemIcon`, no el de la plantilla).
   - `layouts/components/workspaces-popover.tsx`: spec del selector de negocio — `ButtonBase` con `pl:2 py:3 gap:1.5 borderRadius:1.5(×8=12px)`, `bgcolor: alpha(grey[500], .08)`, avatar circular 24-32px + nombre + chevron `carbon:chevron-sort` a la derecha. Aplicado al picker de "Negocio actual".
   - Iconos del sidebar migrados a `@iconify/react` con el set `solar:` (mismo lenguaje visual que usa la plantilla), reemplazando `@mui/icons-material` **solo en el sidebar** por ahora — el resto de iconos de la app (botones de páginas CRUD) siguen en Material Icons, pendiente si se quiere extender.
   - El usuario instaló `animejs` (v4) y pidió usarlo. Se creó `src/hooks/useRevealAnimation.js` (`useRevealAnimation` fade+translateY individual, `useStaggerReveal` para grids/listas) y se aplicó a `AuthCard`, `SuscripcionPublica` y `NegociosSelector`, reemplazando el `framer-motion` que tenían. **`framer-motion` se mantiene a propósito** en `ProductoList.jsx` (`AnimatePresence` para alta/baja de ítems, anime.js no tiene un equivalente declarativo limpio para eso) y en toda la Pantalla pública (decisión previa, loop de horas en kiosco).
- [x] **Pantalla pública (`src/pages/Pantalla/*`) sin tocar en los 4 ajustes** — diseño oscuro tipo kiosco independiente (`pantallaTokens.js`), no depende del `ThemeProvider` global
- [x] `npm run build` y `npm run lint` en verde en el estado final
- [x] **Resuelto en Fase 12**: el usuario compartió capturas reales (dashboard de referencia vs. panel propio) — permitió diagnosticar causas concretas en vez de seguir adivinando.

## Fase 12 — Diagnóstico con capturas reales + paleta oscura + logo real ✅ (completada)
El usuario compartió dos capturas (la referencia y su propio panel en `/promociones`) más el mensaje "no se parece en nada". Con capturas reales por primera vez, se encontraron causas concretas (no solo de gusto):

1. **Bug real de íconos**: `@iconify/react` (usado solo en `DashboardLayout.jsx`) pide el SVG a `api.iconify.design` en el navegador; sin paquete offline instalado, si esa red falla el ícono no dibuja nada — coincidía exacto con la captura (nav de solo texto). **Fix**: `unplugin-icons` + `@iconify-json/solar` + `@iconify-json/carbon` + `@svgr/core`/`@svgr/plugin-jsx` (peer deps del compilador React), registrado en `vite.config.js`. Los íconos ahora se resuelven en build time (`~icons/solar/...`), sin red en runtime. Confirmado: si un nombre de ícono no existe, `npm run build` falla — así que un build en verde ya es prueba de que los 11 íconos usados (sidebar + `HeaderBar`) existen y renderizan.
2. **No había header de escritorio**: `DashboardLayout.jsx` solo tenía `AppBar` en la rama móvil. Se creó `src/layouts/HeaderBar.jsx` (sticky, unificado móvil/escritorio): buscador y campana **decorativos** (sin backend todavía, decisión del usuario) + avatar real con datos de `useAuth()` y logout.
3. **Header de página y empty-state duplicados en las 6 páginas**: se centralizaron en `src/components/layout/PageHeader.jsx` y `src/components/layout/EmptyState.jsx`, aplicados a Productos/Promociones/Plantillas/Clientes/Mensajes/ComandosIa/AdminNegocios, con `useStaggerReveal`/`useRevealAnimation` (antes solo en `NegociosSelector`/`AuthCard`/`SuscripcionPublica`) para que las listas entren animadas con anime.js.
4. **Paleta de color**: el usuario pidió explícitamente alejarse del azul-Facebook (`#1877F2`) y de fondos blancos ("no quiero ni blanco ni azul"). Se reescribió `theme.js` a **modo oscuro** (`palette.mode: "dark"`, fondos `#0B0E14`/`#12161E`/`#1A1F2A`) con acento **índigo/violeta** (`primary main #6D5DFB`, `dark #4F46E5` — el mismo tono que ya tenía el favicon) y `secondary` rosa/magenta (`#EC4899`) para contraste. Dividers/bordes recalculados con `alpha("#FFFFFF", …)` en vez de `alpha(GREY[500], …)` (la fórmula de tema claro no funciona igual sobre fondo oscuro). `index.css`: `color-scheme: dark`.
5. **Login rediseñado a layout dividido** (decisión del usuario, viendo que la referencia lo tiene): `AuthCard.jsx` reescrito — panel izquierdo con gradiente de marca + tagline (oculto en móvil), formulario a la derecha sin card/sombra propia. Mismo API de props (`title`/`subtitle`/`children`/`footer`), así que `Login.jsx`/`Registro.jsx` no cambiaron.
6. **Logo real**: el usuario pegó el logo de la app (campana naranja + burbuja de chat azul con check) y luego confirmó que el archivo fuente está en `Descargas\Gemini_Generated_Image_wgrx7nwgrx7nwgrx.png`. Copiado a `src/assets/logo.png` (usado en sidebar, `HeaderBar` móvil, `AuthCard`) y `public/favicon.png` (reemplaza `favicon.svg`, eliminado). **Bug encontrado durante la verificación visual**: el PNG original traía un patrón de "cuadros de transparencia" **dibujado como píxeles reales opacos** (no alpha de verdad — confirmado leyendo los píxeles crudos: esquina `(219,221,220)` con alfa `255`), así que se veía un recuadro blanco sólido detrás del logo en vez de transparencia. Corregido con flood-fill desde los bordes del canvas (elimina solo los píxeles grisáceos conectados al borde, sin tocar el check/puntos blancos internos del logo, que quedan aislados por el azul de la burbuja) + recorte del margen transparente + reescalado a 512px. Optimizado de 1.4MB → ~210KB.
7. **Verificación real** (no "a ciegas" esta vez): se instaló Playwright localmente (`--no-save`, luego `npm install` para limpiar node_modules) y se levantó el dev server para tomar capturas reales de `/login` (escritorio y móvil) — confirmado visualmente el layout dividido, la paleta oscura y el logo sin el recuadro blanco. **No se pudo verificar el shell autenticado** (sidebar/header/páginas CRUD reales): el backend configurado en `VITE_API_URL` respondió `401` a un token falso (interceptor de `axios.js` lo limpia y redirige a `/login`), y no hay credenciales de prueba en este entorno — el build en verde + el mismo patrón de componentes que ya se confirmó visualmente en `/login` son la única evidencia indirecta para esa parte. **Pendiente del usuario**: entrar con una cuenta real y confirmar que el sidebar (íconos + logo + tema oscuro), el `HeaderBar` y al menos una página CRUD (Promociones/Productos) se ven bien.
- [x] `npm run build` y `npm run lint` en verde en el estado final de esta fase.

**Pendiente explícito, no resuelto en esta fase**: el usuario pidió grabación de audio en Comandos IA ("no veo para grabar audios"). `comandosIa.api.js` solo expone `crear({ textoOriginal })` — no hay endpoint de audio/transcripción en el backend. Ya estaba anotado como fuera de alcance (ver línea de "Fuera de alcance todavía" arriba). Implementarlo requiere: endpoint nuevo en el backend (subida de audio + transcripción, ej. Whisper) + UI de grabación (`MediaRecorder`) en el frontend — se dejó fuera de esta pasada porque es una función nueva de backend, no un ajuste visual, y no se tocó código de backend en esta sesión.

**Tarea explícita para la próxima sesión**: el usuario dijo "no veo donde aplicaste anime.js, hay muchas animaciones que puedes usar allí" y pidió dejarlo para después. Lo que quedó hecho en esta fase es sutil (fade + translateY de 350-400ms en `PageHeader` y en las listas vía `useStaggerReveal`/`useRevealAnimation`, `src/hooks/useRevealAnimation.js`) — fácil de no notar a simple vista. Ideas para ampliar con anime.js la próxima vez (evaluar con criterio de `emil-design-eng`/`review-animations`, no animar por animar): micro-interacciones en botones/`IconButton` (hover/press), transición al abrir/cerrar `Dialog`s de los formularios CRUD, entrada de los stat-cards si algún día hay un dashboard con métricas, feedback visual al togglear disponibilidad de producto (`Switch` en `ProductoList.jsx`), y posible animación de la barra de navegación activa en el sidebar al cambiar de sección.

---

## Decisiones tomadas (no volver a preguntar)
- Estilo "KFC/El Corral" aplica **solo** a la Pantalla pública, no al panel admin interno.
- Movimiento de productos en Pantalla: composición 3D-like con `framer-motion`/CSS (perspective/translateZ/loops que se cruzan), NO three.js/react-three-fiber (se reevalúa después del primer prototipo si no alcanza la sensación deseada).
- Estado global: Context API (Auth + Negocio), sin Redux/React Query en esta pasada.
- Super Admin requiere cambios reales de backend (no hay rol global hoy) — ver Fase 1.
- La deriva ambiental continua de `ProductScene3D` usa `@keyframes` CSS puro, no el loop `animate` de framer-motion, para que no pierda cuadros corriendo por horas en un kiosco (ver Fase 8).
- Panel interno en **modo oscuro** con acento índigo/violeta (no azul-Facebook, no fondo blanco) — decisión explícita del usuario en Fase 12, confirmada visualmente. No revertir a tema claro sin que el usuario lo pida de nuevo.
- Login/Registro en **layout dividido** (panel de marca + formulario), no tarjeta centrada — decisión explícita del usuario en Fase 12.
- Toda la app debe ser responsive (recordatorio explícito del usuario, Fase 12) — verificar mobile además de escritorio en cualquier cambio visual.
- Grabación de audio en Comandos IA: pedida por el usuario en Fase 12, **no implementada** — requiere endpoint nuevo de backend (no existe hoy), fuera de alcance de una sesión de frontend/estilos.
