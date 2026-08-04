import { Box, Typography } from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import { pantalla, fontDisplay, fontMono } from "./pantallaTokens";
import { formatPrecio } from "../../utils/currency";

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
