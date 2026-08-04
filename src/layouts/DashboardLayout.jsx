import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { Box, Drawer, Typography, Divider, ButtonBase, useMediaQuery, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { useNegocio } from "../context/NegocioContext";
import { useRolNegocio } from "../hooks/useRolNegocio";
import * as negociosApi from "../api/negocios.api";
import HeaderBar from "./HeaderBar";
import IconProductos from "~icons/solar/box-minimalistic-linear";
import IconPromociones from "~icons/solar/tag-price-linear";
import IconPlantillas from "~icons/solar/document-text-linear";
import IconClientes from "~icons/solar/users-group-rounded-linear";
import IconMensajes from "~icons/solar/chat-round-dots-linear";
import IconComandos from "~icons/solar/magic-stick-3-linear";
import IconEquipo from "~icons/solar/users-group-two-rounded-linear";
import IconAdmin from "~icons/solar/shield-check-linear";
import IconUsuarios from "~icons/solar/user-id-linear";
import IconLogout from "~icons/solar/logout-3-linear";
import IconChevron from "~icons/carbon/chevron-sort";

const DRAWER_WIDTH = 280;

// Iconos calcados del set "solar" que usa minimal-ui-kit/material-kit-react,
// empaquetados en build time con unplugin-icons (sin red en tiempo de ejecución).
const ICONS = {
  productos: IconProductos,
  promociones: IconPromociones,
  plantillas: IconPlantillas,
  clientes: IconClientes,
  mensajes: IconMensajes,
  comandos: IconComandos,
  equipo: IconEquipo,
  admin: IconAdmin,
  usuarios: IconUsuarios,
  logout: IconLogout,
  chevron: IconChevron,
};

function NavIcon({ icon: IconComponent }) {
  return (
    <Box component="span" sx={{ width: 24, height: 24, display: "inline-flex" }}>
      <IconComponent width={24} height={24} />
    </Box>
  );
}

export default function DashboardLayout() {
  const { negocioId } = useParams();
  const { esSuperAdmin, logout } = useAuth();
  const { negocios } = useNegocio();
  const navigate = useNavigate();
  const theme = useTheme();
  const esMovil = useMediaQuery(theme.breakpoints.down("lg"));
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [negocioAjeno, setNegocioAjeno] = useState(null);

  const id = Number(negocioId);
  const rol = useRolNegocio(negocioId);
  const negocioPropio = negocios.find((n) => n.id === id);
  const negocioActual = negocioPropio || negocioAjeno;

  useEffect(() => {
    if (!negocioPropio && id) {
      negociosApi.obtener(id).then(setNegocioAjeno).catch(() => setNegocioAjeno(null));
    } else {
      setNegocioAjeno(null);
    }
  }, [id, negocioPropio]);

  const navItems = useMemo(() => {
    const todos = [
      { label: "Promociones", to: `/app/${id}/promociones`, icon: ICONS.promociones, roles: ["dueño", "editor", "promotor"] },
      { label: "Productos", to: `/app/${id}/productos`, icon: ICONS.productos, roles: ["dueño", "editor"] },
      { label: "Plantillas", to: `/app/${id}/plantillas`, icon: ICONS.plantillas, roles: ["dueño", "editor"] },
      { label: "Clientes", to: `/app/${id}/clientes`, icon: ICONS.clientes, roles: ["dueño", "editor"] },
      { label: "Mensajes", to: `/app/${id}/mensajes`, icon: ICONS.mensajes, roles: ["dueño", "editor"] },
      { label: "Comandos IA", to: `/app/${id}/comandos`, icon: ICONS.comandos, roles: ["dueño", "editor"] },
      { label: "Equipo", to: `/app/${id}/equipo`, icon: ICONS.equipo, roles: ["dueño"] },
    ];
    return todos.filter((item) => !rol || item.roles.includes(rol));
  }, [id, rol]);

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

  const contenidoDrawer = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", pt: 2.5, px: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
        <Box component="img" src={logo} alt="NotiYa" sx={{ width: 36, height: 36, objectFit: "contain" }} />
        <Typography sx={{ fontWeight: 700 }}>NotiYa</Typography>
      </Box>

      <ButtonBase
        disableRipple
        onClick={() => navigate("/app/negocios")}
        sx={{
          pl: 2,
          py: 1.5,
          gap: 1.5,
          pr: 1.5,
          width: 1,
          mb: 2,
          borderRadius: 1.5,
          textAlign: "left",
          justifyContent: "flex-start",
          bgcolor: (t) => alpha(t.palette.grey[500], 0.08),
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            bgcolor: "primary.main",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {(negocioActual?.nombre || "?").charAt(0).toUpperCase()}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {negocioActual?.nombre || "Cargando..."}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Cambiar negocio
          </Typography>
        </Box>
        <Box sx={{ display: "flex", color: "text.disabled" }}>
          <ICONS.chevron width={16} height={16} />
        </Box>
      </ButtonBase>

      <Box component="nav" sx={{ flex: 1, overflowY: "auto" }}>
        <Box component="ul" sx={{ display: "flex", flexDirection: "column", gap: 0.5, listStyle: "none", m: 0, p: 0 }}>
          {navItems.map((item) => (
            <Box component="li" key={item.to}>
              <Box component={NavLink} to={item.to} onClick={() => setMovilAbierto(false)} sx={navLinkSx}>
                <NavIcon icon={item.icon} />
                <Box component="span" sx={{ flexGrow: 1 }}>
                  {item.label}
                </Box>
              </Box>
            </Box>
          ))}

          {esSuperAdmin && (
            <>
              <Divider sx={{ my: 1 }} />
              <Box component="li">
                <Box component={NavLink} to="/admin/negocios" onClick={() => setMovilAbierto(false)} sx={navLinkSx}>
                  <NavIcon icon={ICONS.admin} />
                  <Box component="span" sx={{ flexGrow: 1 }}>
                    Todos los negocios
                  </Box>
                </Box>
              </Box>
              <Box component="li">
                <Box component={NavLink} to="/admin/usuarios" onClick={() => setMovilAbierto(false)} sx={navLinkSx}>
                  <NavIcon icon={ICONS.usuarios} />
                  <Box component="span" sx={{ flexGrow: 1 }}>
                    Usuarios
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 1.5 }} />
      <ButtonBase
        disableRipple
        onClick={logout}
        sx={{ ...navLinkSx, width: 1, mb: 2, "&:hover": { bgcolor: "action.hover" } }}
      >
        <NavIcon icon={ICONS.logout} />
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
        <HeaderBar esMovil={esMovil} onMenuClick={() => setMovilAbierto(true)} />
        <Box component="main" sx={{ flex: 1, bgcolor: "background.default" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
