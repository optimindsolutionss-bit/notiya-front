import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring } from "framer-motion";
import ProductCard from "./ProductCard";
import "./productScene.css";

const TIERS = ["cerca", "media", "lejos", "media"];
const ENTER_EASE = [0.23, 1, 0.32, 1];
// Solo se renderiza un puñado de tarjetas a la vez (carrusel), nunca las 19+
// de golpe: así no hace falta recortar ni scrollear nada, cualquiera sea el
// tamaño del catálogo del negocio.
const VISIBLE_COUNT = 4;
const ROTACION_MS = 4200;

// Hash estable (no aleatorio en cada render) para variar duración/retardo por tarjeta.
function seedFrom(id) {
  const n = Number(id) || 0;
  return ((n * 9301 + 49297) % 233280) / 233280;
}

function CardFlotante({ producto, tier }) {
  const seed = seedFrom(producto.id);
  const amplitud = tier === "cerca" ? 16 : tier === "media" ? 11 : 7;
  const duracion = 9 + seed * 7; // 9–16s, distinto por tarjeta para que no se vea sincronizado
  const retardo = seed * 4;

  return (
    <div
      className="notiya-float"
      style={{
        "--amp-x": `${amplitud}px`,
        "--amp-y": `${amplitud}px`,
        "--amp-rot": `${seed > 0.5 ? 1.5 : -1.5}deg`,
        animationDuration: `${duracion}s`,
        animationDelay: `${retardo}s`,
      }}
    >
      <ProductCard producto={producto} profundidad={tier} />
    </div>
  );
}

// Ventana rotativa tipo cinta transportadora: cada tick avanza un producto,
// entra el siguiente de la cola y sale el más viejo — así el ingreso es
// "producto a producto" en vez de que aparezcan todos de una.
function useCarrusel(productos) {
  const [inicio, setInicio] = useState(0);
  const rota = productos.length > VISIBLE_COUNT;

  useEffect(() => {
    if (!rota) return;
    const id = setInterval(() => {
      setInicio((i) => (i + 1) % productos.length);
    }, ROTACION_MS);
    return () => clearInterval(id);
  }, [rota, productos.length]);

  if (!rota) return productos;
  return Array.from({ length: VISIBLE_COUNT }, (_, i) => productos[(inicio + i) % productos.length]);
}

function EscenaAnimada({ productos }) {
  const containerRef = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  // Parallax decorativo: se interpola con spring en vez de seguir el mouse
  // 1:1, que se sentiría artificial (ver guía de Emil Kowalski sobre mouse-tracking).
  const parallaxX = useSpring(rawX, { stiffness: 60, damping: 14 });
  const parallaxY = useSpring(rawY, { stiffness: 60, damping: 14 });
  const visibles = useCarrusel(productos);

  const handleMouseMove = (e) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    rawX.set(nx * -16);
    rawY.set(ny * -12);
  };

  return (
    <Box
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
      sx={{
        perspective: "1400px",
        px: { xs: 2, md: 5 },
        py: 5,
        minHeight: 460,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        component={motion.div}
        style={{ x: parallaxX, y: parallaxY }}
        sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 5 }}
      >
        <AnimatePresence mode="popLayout">
          {visibles.map((producto, index) => (
            <motion.div
              key={producto.id}
              layout
              initial={{ opacity: 0, scale: 0.85, x: 80 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: -80 }}
              transition={{ duration: 0.55, ease: ENTER_EASE }}
            >
              <CardFlotante producto={producto} tier={TIERS[index % TIERS.length]} />
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>
    </Box>
  );
}

function EscenaEstatica({ productos }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 3,
        px: { xs: 3, md: 6 },
        py: 4,
      }}
    >
      {productos.map((producto) => (
        <ProductCard key={producto.id} producto={producto} profundidad="media" />
      ))}
    </Box>
  );
}

export default function ProductScene3D({ productos }) {
  const prefersReducedMotion = useReducedMotion();

  if (productos.length === 0) return null;

  return prefersReducedMotion ? (
    <EscenaEstatica productos={productos} />
  ) : (
    <EscenaAnimada productos={productos} />
  );
}
