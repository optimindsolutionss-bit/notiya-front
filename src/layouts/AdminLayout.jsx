import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Box, Drawer, Typography, Divider, ButtonBase, useMediaQuery, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import IconAdmin from "~icons/solar/shield-check-linear";
import IconUsuarios from "~icons/solar/user-id-linear";
import IconLogout from "~icons/solar/logout-3-linear";

const DRAWER_WIDTH = 280;

const navLinkSx = {
  pl: 2,
  py: 1,
  gap: 2,
  pr: 1.5,
  minHeight: 44,
  borderRadius: 0.75,
  display: "flex",
  alignItems: "center",
  typography: "body2",
  fontWeight: 500,
  color: "text.secondary",
  textDecoration: "none",
  "&.active": {
    fontWeight: 600,
    color: "primary.main",
    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
    "&:hover": { bgcolor: (t) => alpha(t.palette.primary.main, 0.16) },
  },
  "&:not(.active):hover": { bgcolor: "action.hover" },
};

function NavIcon({ icon: IconComponent }) {
  return (
    <Box component="span" sx={{ width: 24, height: 24, display: "inline-flex" }}>
      <IconComponent width={24} height={24} />
    </Box>
  );
}

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const esMovil = useMediaQuery(theme.breakpoints.down("lg"));
  const [movilAbierto, setMovilAbierto] = useState(false);

  const contenidoDrawer = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", pt: 2.5, px: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
        <Box component="img" src={logo} alt="NotiYa" sx={{ width: 36, height: 36, objectFit: "contain" }} />
        <Typography sx={{ fontWeight: 700 }}>NotiYa</Typography>
      </Box>

      <Box component="nav" sx={{ flex: 1, overflowY: "auto" }}>
        <Box component="ul" sx={{ display: "flex", flexDirection: "column", gap: 0.5, listStyle: "none", m: 0, p: 0 }}>
          <Box component="li">
            <Box component={NavLink} to="/admin/negocios" onClick={() => setMovilAbierto(false)} sx={navLinkSx}>
              <NavIcon icon={IconAdmin} />
              <Box component="span" sx={{ flexGrow: 1 }}>
                Todos los negocios
              </Box>
            </Box>
          </Box>
          <Box component="li">
            <Box component={NavLink} to="/admin/usuarios" onClick={() => setMovilAbierto(false)} sx={navLinkSx}>
              <NavIcon icon={IconUsuarios} />
              <Box component="span" sx={{ flexGrow: 1 }}>
                Usuarios
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box component="li">
            <ButtonBase
              disableRipple
              onClick={() => navigate("/app/negocios")}
              sx={{ ...navLinkSx, width: 1, justifyContent: "flex-start" }}
            >
              <Box component="span" sx={{ flexGrow: 1, textAlign: "left" }}>
                ← Mis negocios
              </Box>
            </ButtonBase>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 1.5 }} />
      <ButtonBase
        disableRipple
        onClick={logout}
        sx={{ ...navLinkSx, width: 1, mb: 2, "&:hover": { bgcolor: "action.hover" } }}
      >
        <NavIcon icon={IconLogout} />
        <Box component="span">Cerrar sesión</Box>
      </ButtonBase>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {esMovil ? (
        <Drawer open={movilAbierto} onClose={() => setMovilAbierto(false)} sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}>
          {contenidoDrawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", bgcolor: "background.paper" },
          }}
        >
          {contenidoDrawer}
        </Drawer>
      )}

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {esMovil && (
          <ButtonBase
            disableRipple
            onClick={() => setMovilAbierto(true)}
            sx={{ p: 2, alignSelf: "flex-start", color: "text.secondary" }}
          >
            <Typography variant="body2">☰ Menú</Typography>
          </ButtonBase>
        )}
        <Box component="main" sx={{ flex: 1, bgcolor: "background.default" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
