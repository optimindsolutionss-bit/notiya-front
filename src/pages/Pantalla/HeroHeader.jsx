import { Box, Typography, Avatar } from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";
import { pantalla, fontDisplay } from "./pantallaTokens";

export default function HeroHeader({ negocio }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Box
      component={motion.div}
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2.5,
        px: { xs: 3, md: 6 },
        pt: { xs: 3, md: 5 },
        pb: 2,
      }}
    >
      <Avatar
        src={negocio.logoUrl || undefined}
        sx={{
          width: { xs: 56, md: 72 },
          height: { xs: 56, md: 72 },
          bgcolor: pantalla.surface,
          border: `1px solid ${pantalla.border}`,
          fontFamily: fontDisplay,
          fontWeight: 800,
        }}
      >
        {negocio.nombre?.[0]?.toUpperCase()}
      </Avatar>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: fontDisplay,
            fontWeight: 800,
            fontSize: { xs: "1.8rem", md: "2.6rem" },
            letterSpacing: "-0.02em",
            color: pantalla.text,
            lineHeight: 1.1,
          }}
          noWrap
        >
          {negocio.nombre}
        </Typography>
        {negocio.descripcion && (
          <Typography sx={{ color: pantalla.textMuted, fontSize: { xs: "0.9rem", md: "1.05rem" }, mt: 0.5 }} noWrap>
            {negocio.descripcion}
          </Typography>
        )}
      </Box>

      <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
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
  );
}
