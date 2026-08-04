# Pantalla Animada Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer visible desde el dashboard el link de la Pantalla pública, agregar un QR de suscripción por WhatsApp en la propia pantalla, y evitar que el ribbon de promociones se vea estático cuando hay 1-2 promos activas.

**Architecture:** Extensión incremental de los componentes ya existentes de `src/pages/Pantalla/` (framer-motion) y de `HeaderBar`/`DashboardLayout` — sin reescribir la escena animada ni introducir un motor nuevo.

**Tech Stack:** React 19, MUI, framer-motion (ya en uso), `qrcode.react` (dependencia nueva, generación de QR 100% client-side sin llamadas de red).

## Global Constraints

- Repo único afectado: `Frontend` (`C:\Users\LENOVO\Documents\NotiYa\Frontend`). Sin cambios de backend.
- La pantalla pública (`/pantalla/:negocioId`) es un **monitor/TV pasivo**: ningún cambio de este plan agrega interacción táctil ni controles que el cliente deba operar.
- Toda animación nueva debe respetar `useReducedMotion()` de framer-motion, igual que el resto de `src/pages/Pantalla/*` — si el usuario tiene `prefers-reduced-motion`, no animar.
- Paleta y tipografía de la pantalla vienen de `src/pages/Pantalla/pantallaTokens.js` (`pantalla.bg`, `.surface`, `.accent`, `.accentMuted`, `.text`, `.textMuted`, fuente `fontDisplay`) — no hardcodear colores nuevos fuera de ese archivo.
- Sin framework de tests instalado; cada tarea se verifica manualmente en el navegador con `npm run dev` (frontend en `http://localhost:5173`, backend en `http://localhost:4000` ya debe estar corriendo para que `/pantalla/:negocioId` tenga datos reales).

---

### Task 1: Instalar `qrcode.react`

**Files:**
- Modify: `Frontend/package.json`
- Modify: `Frontend/package-lock.json` (generado por `npm install`)

**Interfaces:**
- Consumes: nada.
- Produces: paquete `qrcode.react` (exporta `QRCodeSVG`) disponible para Task 2.

- [ ] **Step 1: Instalar**

```bash
cd Frontend
npm install qrcode.react@^4.2.0
```

- [ ] **Step 2: Verificar**

```bash
node -e "console.log(require('qrcode.react/package.json').version)"
```
Expected: imprime `4.2.0` (o una versión `4.x` superior).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: agregar qrcode.react para el QR de suscripción en la pantalla"
```

---

### Task 2: QR de suscripción en `HeroHeader`

**Files:**
- Modify: `Frontend/src/pages/Pantalla/HeroHeader.jsx`
- Modify: `Frontend/src/pages/Pantalla/PantallaPublica.jsx:58`

**Interfaces:**
- Consumes: `QRCodeSVG` de `qrcode.react` (Task 1); ruta pública ya existente `/suscribirse/:negocioId` (`SuscripcionPublica.jsx`, sin cambios).
- Produces: `HeroHeader` ahora requiere una prop `negocioId` además de `negocio`.

- [ ] **Step 1: Pasar `negocioId` desde `PantallaPublica`**

En `Frontend/src/pages/Pantalla/PantallaPublica.jsx:58`, cambiar:

```jsx
      <HeroHeader negocio={negocio} />
```

por:

```jsx
      <HeroHeader negocio={negocio} negocioId={negocioId} />
```

(`negocioId` ya existe en el scope del componente, viene de `useParams()` en la línea 15.)

- [ ] **Step 2: Agregar el QR en `HeroHeader`**

En `Frontend/src/pages/Pantalla/HeroHeader.jsx`, agregar el import al principio del archivo:

```javascript
import { QRCodeSVG } from "qrcode.react";
```

Cambiar la firma del componente:

```javascript
export default function HeroHeader({ negocio, negocioId }) {
```

Reemplazar el bloque final (líneas 58-68, el `Box` con `ml: "auto"` que hoy solo tiene el punto pulsante + "En vivo"):

```jsx
      <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 2.5, flexShrink: 0 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: "#fff", display: "flex", lineHeight: 0 }}>
            <QRCodeSVG value={`${window.location.origin}/suscribirse/${negocioId}`} size={64} />
          </Box>
          <Typography
            sx={{
              color: pantalla.textMuted,
              fontSize: "0.65rem",
              textAlign: "center",
              maxWidth: 92,
              lineHeight: 1.25,
            }}
          >
            Escaneá y recibí promos por WhatsApp
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            component={motion.div}
            animate={prefersReducedMotion ? {} : { opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: pantalla.accent }}
          />
          <Typography sx={{ color: pantalla.textMuted, fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            En vivo
          </Typography>
        </Box>
      </Box>
```

(El bloque del punto pulsante + "En vivo" es exactamente el que ya existía — solo se lo envuelve en un segundo `Box` hermano del QR, dentro del contenedor `ml: "auto"`.)

- [ ] **Step 3: Verificar en el navegador**

1. Con el backend corriendo y un negocio real con al menos un producto, abrir `http://localhost:5173/pantalla/:negocioId` (reemplazar por un id real).
2. Debe verse un QR pequeño con fondo blanco en la esquina superior derecha, junto al indicador "En vivo", con el texto "Escaneá y recibí promos por WhatsApp" debajo.
3. Escanear el QR con el celular (o copiar la URL codificada abriendo las devtools y revisando el `value` pasado) → debe apuntar a `http://localhost:5173/suscribirse/:negocioId` y abrir la página de suscripción pública.
4. Activar "reducir movimiento" en el sistema operativo y recargar → el punto pulsante deja de animarse (comportamiento ya existente, sin cambios); el QR se sigue mostrando (no es una animación, no depende de `prefersReducedMotion`).

- [ ] **Step 4: Commit**

```bash
git add src/pages/Pantalla/HeroHeader.jsx src/pages/Pantalla/PantallaPublica.jsx
git commit -m "feat: agregar QR de suscripción por WhatsApp a la pantalla pública"
```

---

### Task 3: `PromoRibbon` — destacar en vez de quedar estático con 1-2 promos

**Files:**
- Modify: `Frontend/src/pages/Pantalla/PromoRibbon.jsx`

**Interfaces:**
- Consumes: `pantalla` tokens (ya importados).
- Produces: n/a (componente hoja).

- [ ] **Step 1: `TarjetaPromo` acepta la prop `destacar`**

En `Frontend/src/pages/Pantalla/PromoRibbon.jsx`, reemplazar la función `TarjetaPromo` completa:

```jsx
function TarjetaPromo({ promo, productos, destacar }) {
  const producto = productos.find((p) => p.id === promo.productoId);

  return (
    <Box
      component={destacar ? motion.div : "div"}
      animate={
        destacar
          ? { boxShadow: [`0 0 0 1px ${pantalla.accentMuted}`, `0 0 0 1px ${pantalla.accent}`, `0 0 0 1px ${pantalla.accentMuted}`] }
          : undefined
      }
      transition={destacar ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : undefined}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2.5,
        py: 1.5,
        borderRadius: 3,
        bgcolor: pantalla.surface,
        border: `1px solid ${pantalla.accentMuted}`,
        flexShrink: 0,
        minWidth: 260,
      }}
    >
      <LocalFireDepartmentRoundedIcon sx={{ color: pantalla.accent }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: pantalla.text, fontWeight: 700, fontSize: "0.95rem" }} noWrap>
          {promo.titulo}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          <Typography sx={{ fontFamily: fontMono, color: pantalla.accent, fontWeight: 700, fontSize: "1.1rem" }}>
            {formatPrecio(promo.precioPromocional)}
          </Typography>
          {producto && (
            <Typography
              sx={{
                fontFamily: fontMono,
                color: pantalla.textMuted,
                fontSize: "0.85rem",
                textDecoration: "line-through",
              }}
            >
              {formatPrecio(producto.precio)}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
```

(Único cambio real: la prop `destacar` nueva, y el `Box` ahora se renderiza como `motion.div` con un `boxShadow` animado en loop cuando `destacar` es `true` — el resto del JSX interno es idéntico al original.)

- [ ] **Step 2: `PromoRibbon` decide cuándo destacar**

Reemplazar el cuerpo de `PromoRibbon`:

```jsx
export default function PromoRibbon({ promociones, productos }) {
  const prefersReducedMotion = useReducedMotion();
  if (promociones.length === 0) return null;

  const necesitaMarquee = promociones.length > 3 && !prefersReducedMotion;
  const destacar = promociones.length <= 2 && !prefersReducedMotion;
  const items = necesitaMarquee ? [...promociones, ...promociones] : promociones;

  return (
    <Box sx={{ overflow: "hidden", px: { xs: 3, md: 6 }, py: 1.5 }}>
      <Typography
        sx={{
          fontFamily: fontDisplay,
          color: pantalla.textMuted,
          fontSize: "0.75rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          mb: 1,
        }}
      >
        Promociones activas
      </Typography>
      <Box
        component={motion.div}
        animate={necesitaMarquee ? { x: ["0%", "-50%"] } : { x: 0 }}
        transition={necesitaMarquee ? { duration: promociones.length * 4, repeat: Infinity, ease: "linear" } : {}}
        sx={{ display: "flex", gap: 2 }}
      >
        {items.map((promo, i) => (
          <TarjetaPromo key={`${promo.id}-${i}`} promo={promo} productos={productos} destacar={destacar} />
        ))}
      </Box>
    </Box>
  );
}
```

(Único cambio: la línea `const destacar = ...` nueva, y se le pasa `destacar={destacar}` a cada `TarjetaPromo`.)

- [ ] **Step 3: Verificar en el navegador**

1. Con un negocio de prueba, dejar activa **una sola** promoción (desactivar o borrar las demás desde `/app/:negocioId/promociones`, o editar sus fechas para que no estén vigentes).
2. Abrir `/pantalla/:negocioId` → la tarjeta de esa promo debe tener un brillo/pulso sutil en el borde, en loop.
3. Agregar una segunda promoción activa → ambas deben pulsar (siguen siendo `<= 2`).
4. Agregar una tercera → deben dejar de pulsar y, si hay más de 3, empezar el marquee horizontal (comportamiento ya existente, sin cambios).
5. Con "reducir movimiento" activado en el sistema operativo, con 1-2 promos → no debe haber pulso (`destacar` se desactiva junto con `prefersReducedMotion`).

- [ ] **Step 4: Commit**

```bash
git add src/pages/Pantalla/PromoRibbon.jsx
git commit -m "feat: destacar con pulso las promos cuando hay pocas activas en la pantalla"
```

---

### Task 4: Botón "Pantalla" en `HeaderBar` — copiar/abrir el link público

**Files:**
- Modify: `Frontend/src/layouts/HeaderBar.jsx`

**Interfaces:**
- Consumes: nada nuevo (usa `window.location.origin` y `navigator.clipboard`).
- Produces: `HeaderBar` ahora requiere una prop `negocioId` además de `esMovil`/`onMenuClick` — la aporta Task 5.

- [ ] **Step 1: Imports nuevos**

En `Frontend/src/layouts/HeaderBar.jsx`, ampliar el import de MUI (línea 2) agregando `Popover`, `Stack`, `Snackbar`, `Button`:

```javascript
import { AppBar, Toolbar, IconButton, Typography, Tooltip, Badge, Avatar, Menu, MenuItem, ListItemIcon, Divider, Box, Popover, Stack, Snackbar, Button } from "@mui/material";
```

Agregar el import del ícono, junto a los demás `~icons/*`:

```javascript
import IconTv from "~icons/solar/tv-linear";
```

- [ ] **Step 2: Prop nueva y estado**

Cambiar la firma del componente:

```javascript
export default function HeaderBar({ esMovil, onMenuClick, negocioId }) {
```

Agregar, junto a `const [anchorEl, setAnchorEl] = useState(null);`:

```javascript
  const [pantallaAnchor, setPantallaAnchor] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const urlPantalla = `${window.location.origin}/pantalla/${negocioId}`;

  const copiarLink = async () => {
    await navigator.clipboard.writeText(urlPantalla);
    setCopiado(true);
  };
```

- [ ] **Step 3: Botón + Popover + Snackbar**

Agregar, justo antes del `<Tooltip title="Buscar (próximamente)">` existente:

```jsx
        <Tooltip title="Pantalla pública">
          <IconButton onClick={(e) => setPantallaAnchor(e.currentTarget)}>
            <IconTv width={22} height={22} />
          </IconButton>
        </Tooltip>
        <Popover
          open={Boolean(pantallaAnchor)}
          anchorEl={pantallaAnchor}
          onClose={() => setPantallaAnchor(null)}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
        >
          <Box sx={{ p: 2, maxWidth: 320 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Pantalla pública del negocio
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, wordBreak: "break-all" }}>
              {urlPantalla}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" onClick={copiarLink}>
                Copiar link
              </Button>
              <Button size="small" component="a" href={urlPantalla} target="_blank" rel="noopener noreferrer">
                Abrir
              </Button>
            </Stack>
          </Box>
        </Popover>
```

Y, justo antes del `</AppBar>` de cierre (después del `<Menu>` de la cuenta), agregar:

```jsx
      <Snackbar open={copiado} autoHideDuration={2000} onClose={() => setCopiado(false)} message="Link copiado" />
```

- [ ] **Step 4: Verificar en el navegador**

(Requiere Task 5 para que `negocioId` llegue realmente desde `DashboardLayout` — si se verifica antes, `negocioId` será `undefined` y el link se verá como `.../pantalla/undefined`, lo cual es esperado hasta completar Task 5.)

1. Entrar al dashboard de un negocio.
2. Hacer clic en el ícono de TV en el header → debe abrir un popover con la URL completa de la pantalla de ese negocio.
3. Clic en "Copiar link" → debe aparecer el snackbar "Link copiado" abajo, y pegar (Ctrl+V) en cualquier campo de texto debe traer la URL correcta.
4. Clic en "Abrir" → debe abrir la pantalla pública en una pestaña nueva.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/HeaderBar.jsx
git commit -m "feat: botón para copiar/abrir el link de la pantalla pública desde el header"
```

---

### Task 5: `DashboardLayout` — pasar `negocioId` al header + ítem "Ver pantalla" en el sidebar

**Files:**
- Modify: `Frontend/src/layouts/DashboardLayout.jsx`

**Interfaces:**
- Consumes: `<HeaderBar negocioId={...} />` (Task 4).
- Produces: n/a (última tarea de la cadena).

- [ ] **Step 1: Pasar `negocioId` al `HeaderBar`**

En `Frontend/src/layouts/DashboardLayout.jsx`, cambiar:

```jsx
        <HeaderBar esMovil={esMovil} onMenuClick={() => setMovilAbierto(true)} />
```

por:

```jsx
        <HeaderBar esMovil={esMovil} onMenuClick={() => setMovilAbierto(true)} negocioId={id} />
```

- [ ] **Step 2: Ícono nuevo para el sidebar**

Agregar el import junto a los demás `~icons/*`:

```javascript
import IconVerPantalla from "~icons/solar/tv-linear";
```

Y `verPantalla: IconVerPantalla,` al objeto `ICONS`.

- [ ] **Step 3: Ítem "Ver pantalla ↗" fijo en el sidebar**

Dentro de `contenidoDrawer`, agregar un nuevo bloque justo antes del `<Divider sx={{ mb: 1.5 }} />` que precede al botón de "Cerrar sesión" (después del `<Box component="nav">` que contiene `navItems` y el bloque de superadmin):

```jsx
      <Box
        component="a"
        href={`/pantalla/${id}`}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ ...navLinkSx, textDecoration: "none" }}
      >
        <NavIcon icon={ICONS.verPantalla} />
        <Box component="span" sx={{ flexGrow: 1 }}>
          Ver pantalla ↗
        </Box>
      </Box>
```

- [ ] **Step 4: Verificar en el navegador**

1. Entrar al dashboard de un negocio → el sidebar debe mostrar "Ver pantalla ↗" justo antes de "Cerrar sesión", con el mismo estilo visual que los demás ítems de navegación (pero sin quedar nunca "activo" como los `NavLink`, porque es un link externo).
2. Clic → debe abrir `/pantalla/:negocioId` en una pestaña nueva, sin perder el estado del dashboard en la pestaña original.
3. Repetir la verificación de Task 4, Step 4 (el popover del header ahora debe mostrar la URL real, no `.../pantalla/undefined`).

- [ ] **Step 5: Commit**

```bash
git add src/layouts/DashboardLayout.jsx
git commit -m "feat: acceso directo a la pantalla pública desde el sidebar del dashboard"
```
