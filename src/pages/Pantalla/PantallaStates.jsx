// Frontend/src/pages/Pantalla/PantallaStates.jsx
import { useContext } from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { fontDisplay } from "./pantallaTokens";
import { PALETAS, PALETA_DEFAULT } from "./paletas";
import { PaletaContext } from "./PaletaContext";
import heroImg from "../../assets/hero.png";

function Frame({ children, fullPage = true, paleta }) {
  return (
    <Box
      sx={{
        minHeight: fullPage ? "100vh" : "100%",
        height: fullPage ? undefined : "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: paleta.bg,
        color: paleta.text,
        textAlign: "center",
        px: 3,
        py: 6,
        fontFamily: fontDisplay,
      }}
    >
      {children}
    </Box>
  );
}

export function PantallaCargando() {
  const paleta = PALETAS[PALETA_DEFAULT];
  return (
    <Frame paleta={paleta}>
      <Box
        component={motion.div}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          width: 56,
          height: 56,
          borderRadius: "16px",
          background: `linear-gradient(135deg, ${paleta.accent}, ${paleta.accentMuted})`,
        }}
      />
    </Frame>
  );
}

export function PantallaVacia({ nombreNegocio }) {
  const paleta = useContext(PaletaContext);
  return (
    <Frame fullPage={false} paleta={paleta}>
      <Box component="img" src={heroImg} alt="" sx={{ width: 180, opacity: 0.85, mb: 3 }} />
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        {nombreNegocio || "Este negocio"} todavía no tiene productos para mostrar
      </Typography>
      <Typography sx={{ color: paleta.textMuted, mt: 1 }}>
        Cuando se agreguen productos disponibles, aparecerán aquí automáticamente.
      </Typography>
    </Frame>
  );
}

export function PantallaError() {
  const paleta = PALETAS[PALETA_DEFAULT];
  return (
    <Frame paleta={paleta}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        No encontramos este negocio
      </Typography>
      <Typography sx={{ color: paleta.textMuted, mt: 1 }}>
        Verifica el enlace o contacta al negocio para obtener el correcto.
      </Typography>
    </Frame>
  );
}
