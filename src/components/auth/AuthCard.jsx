import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import logo from "../../assets/logo.png";
import { useRevealAnimation } from "../../hooks/useRevealAnimation";

function BrandPanel() {
  return (
    <Box
      sx={{
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "space-between",
        width: "42%",
        minWidth: 420,
        p: 6,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(160deg, #3730A3 0%, #4F46E5 55%, #6D5DFB 100%)`,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 15% 15%, ${alpha("#FFFFFF", 0.14)} 0%, transparent 40%),
            radial-gradient(circle at 85% 80%, ${alpha("#22D3EE", 0.18)} 0%, transparent 45%)`,
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box component="img" src={logo} alt="" sx={{ width: 40, height: 40, objectFit: "contain" }} />
        <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>NotiYa</Typography>
      </Box>

      <Box sx={{ position: "relative" }}>
        <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "2rem", lineHeight: 1.2, mb: 2 }}>
          Avisa a tus clientes por WhatsApp en segundos
        </Typography>
        <Typography sx={{ color: alpha("#FFFFFF", 0.72), fontSize: "0.95rem", maxWidth: 360 }}>
          Productos, promociones y mensajes automáticos desde un mismo panel.
        </Typography>
      </Box>
    </Box>
  );
}

export default function AuthCard({ title, subtitle, children, footer }) {
  const formRef = useRevealAnimation({ translateY: 10, duration: 400 });

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "background.default" }}>
      <BrandPanel />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: 6,
        }}
      >
        <Box ref={formRef} sx={{ width: "100%", maxWidth: 380, opacity: 0 }}>
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5, mb: 4 }}>
            <Box component="img" src={logo} alt="NotiYa" sx={{ width: 40, height: 40, objectFit: "contain" }} />
            <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>NotiYa</Typography>
          </Box>

          <Typography variant="h4" sx={{ fontSize: "1.6rem", mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
            {subtitle}
          </Typography>

          {children}

          {footer && (
            <Typography variant="body2" align="center" sx={{ color: "text.secondary", mt: 3 }}>
              {footer}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
