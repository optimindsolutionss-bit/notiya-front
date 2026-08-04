import { Box, Typography } from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import { pantalla, fontDisplay } from "./pantallaTokens";
import { formatRelativeTime } from "../../utils/date";

const ICONOS = {
  aviso: NotificationsActiveRoundedIcon,
  promocion: LocalOfferRoundedIcon,
  recordatorio: CampaignRoundedIcon,
  menu: RestaurantMenuRoundedIcon,
};

export default function AvisosTicker({ avisos }) {
  const prefersReducedMotion = useReducedMotion();
  if (avisos.length === 0) return null;

  const items = prefersReducedMotion ? avisos : [...avisos, ...avisos];

  return (
    <Box
      sx={{
        borderTop: `1px solid ${pantalla.border}`,
        bgcolor: pantalla.surface,
        overflow: "hidden",
        py: 1.25,
      }}
    >
      <Box
        component={motion.div}
        animate={prefersReducedMotion ? { x: 0 } : { x: ["0%", "-50%"] }}
        transition={prefersReducedMotion ? {} : { duration: avisos.length * 6, repeat: Infinity, ease: "linear" }}
        sx={{ display: "flex", gap: 5, px: 3, whiteSpace: "nowrap" }}
      >
        {items.map((aviso, i) => {
          const Icono = ICONOS[aviso.tipo] || NotificationsActiveRoundedIcon;
          return (
            <Box key={`${aviso.id}-${i}`} sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
              <Icono sx={{ color: pantalla.accent, fontSize: 18 }} />
              <Typography sx={{ fontFamily: fontDisplay, color: pantalla.text, fontSize: "0.9rem" }}>
                {aviso.contenido}
              </Typography>
              <Typography sx={{ color: pantalla.textMuted, fontSize: "0.78rem" }}>
                {formatRelativeTime(aviso.fechaHoraEnvio)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
