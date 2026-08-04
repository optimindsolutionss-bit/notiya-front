import { useRef } from "react";
import { Box } from "@mui/material";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring } from "framer-motion";
import ProductCard from "./ProductCard";
import "./productScene.css";

const TIERS = ["media", "cerca", "lejos", "media", "lejos", "cerca"];
const ENTER_EASE = [0.23, 1, 0.32, 1];

// Hash estable (no aleatorio en cada render) para variar duración/retardo por tarjeta.
function seedFrom(id) {
  const n = Number(id) || 0;
  return ((n * 9301 + 49297) % 233280) / 233280;
}

function CardFlotante({ producto, index }) {
  const profundidad = TIERS[index % TIERS.length];
  const seed = seedFrom(producto.id);
  const amplitud = profundidad === "cerca" ? 22 : profundidad === "media" ? 15 : 9;
  const duracion = 9 + seed * 7; // 9–16s, distinto por tarjeta para que no se vea sincronizado
  const retardo = seed * 4;

  return (
    <div
      className="notiya-float"
      style={{
        zIndex: profundidad === "cerca" ? 3 : profundidad === "media" ? 2 : 1,
        "--amp-x": `${amplitud}px`,
        "--amp-y": `${amplitud}px`,
        "--amp-rot": `${seed > 0.5 ? 1.5 : -1.5}deg`,
        animationDuration: `${duracion}s`,
        animationDelay: `${retardo}s`,
      }}
    >
      <ProductCard producto={producto} profundidad={profundidad} />
    </div>
  );
}

function EscenaAnimada({ productos }) {
  const containerRef = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  // Parallax decorativo: se interpola con spring en vez de seguir el mouse
  // 1:1, que se sentiría artificial (ver guía de Emil Kowalski sobre mouse-tracking).
  const parallaxX = useSpring(rawX, { stiffness: 60, damping: 14 });
  const parallaxY = useSpring(rawY, { stiffness: 60, damping: 14 });

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
        py: 4,
        overflow: "hidden",
      }}
    >
      <Box
        component={motion.div}
        style={{ x: parallaxX, y: parallaxY }}
        sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignContent: "flex-start" }}
      >
        <AnimatePresence>
          {productos.map((producto, index) => (
            <motion.div
              key={producto.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: ENTER_EASE, delay: Math.min(index * 0.04, 0.6) }}
              style={{ margin: index % 2 === 0 ? "-10px -18px" : "10px -18px" }}
            >
              <CardFlotante producto={producto} index={index} />
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
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
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
