// Frontend/src/pages/Pantalla/ProductCard.jsx
import { useContext } from "react";
import { Box, Typography } from "@mui/material";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import { fontDisplay, fontMono } from "./pantallaTokens";
import { PaletaContext } from "./PaletaContext";
import { formatPrecio } from "../../utils/currency";
import ImagenTilt3D from "./ImagenTilt3D";

const TAMANOS = {
  cerca: { width: 380, shadow: "0 30px 60px -15px rgba(239,68,68,0.35)" },
  media: { width: 320, shadow: "0 20px 45px -18px rgba(0,0,0,0.5)" },
  lejos: { width: 280, shadow: "0 12px 30px -15px rgba(0,0,0,0.4)" },
};

export default function ProductCard({ producto, profundidad = "media" }) {
  const { width, shadow } = TAMANOS[profundidad];
  const paleta = useContext(PaletaContext);

  return (
    <Box
      sx={{
        width,
        borderRadius: 4,
        overflow: "hidden",
        bgcolor: paleta.surface,
        border: `1px solid ${paleta.border}`,
        boxShadow: shadow,
      }}
    >
      <ImagenTilt3D
        imagenUrl={producto.imagenUrl}
        size={width}
        seed={producto.id}
        bgColor={paleta.surfaceMuted}
        fallback={<RestaurantRoundedIcon sx={{ fontSize: 56, color: paleta.textMuted }} />}
      />
      <Box sx={{ p: 2.5 }}>
        <Typography
          sx={{
            fontFamily: fontDisplay,
            fontWeight: 700,
            color: paleta.text,
            fontSize: "1.35rem",
            letterSpacing: "-0.01em",
          }}
          noWrap
        >
          {producto.nombre}
        </Typography>
        <Typography sx={{ fontFamily: fontMono, color: paleta.accent, fontWeight: 700, fontSize: "1.6rem", mt: 0.5 }}>
          {formatPrecio(producto.precio)}
        </Typography>
      </Box>
    </Box>
  );
}
