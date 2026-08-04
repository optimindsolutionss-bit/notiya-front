import { Box, Typography } from "@mui/material";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import { pantalla, fontDisplay, fontMono } from "./pantallaTokens";
import { formatPrecio } from "../../utils/currency";

const TAMANOS = {
  cerca: { width: 260, shadow: "0 30px 60px -15px rgba(239,68,68,0.35)" },
  media: { width: 220, shadow: "0 20px 45px -18px rgba(0,0,0,0.5)" },
  lejos: { width: 190, shadow: "0 12px 30px -15px rgba(0,0,0,0.4)" },
};

export default function ProductCard({ producto, profundidad = "media" }) {
  const { width, shadow } = TAMANOS[profundidad];

  return (
    <Box
      sx={{
        width,
        borderRadius: 4,
        overflow: "hidden",
        bgcolor: pantalla.surface,
        border: `1px solid ${pantalla.border}`,
        boxShadow: shadow,
      }}
    >
      <Box
        sx={{
          aspectRatio: "1",
          bgcolor: pantalla.surfaceMuted,
          backgroundImage: producto.imagenUrl ? `url(${producto.imagenUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!producto.imagenUrl && <RestaurantRoundedIcon sx={{ fontSize: 40, color: pantalla.textMuted }} />}
      </Box>
      <Box sx={{ p: 1.75 }}>
        <Typography
          sx={{
            fontFamily: fontDisplay,
            fontWeight: 700,
            color: pantalla.text,
            fontSize: "1rem",
            letterSpacing: "-0.01em",
          }}
          noWrap
        >
          {producto.nombre}
        </Typography>
        <Typography sx={{ fontFamily: fontMono, color: pantalla.accent, fontWeight: 700, fontSize: "1.15rem", mt: 0.25 }}>
          {formatPrecio(producto.precio)}
        </Typography>
      </Box>
    </Box>
  );
}
