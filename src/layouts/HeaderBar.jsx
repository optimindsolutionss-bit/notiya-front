import { useState } from "react";
import { AppBar, Toolbar, IconButton, Typography, Tooltip, Badge, Avatar, Menu, MenuItem, ListItemIcon, Divider, Box, Popover, Stack, Snackbar, Button } from "@mui/material";
import { alpha } from "@mui/material/styles";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import IconMenu from "~icons/solar/hamburger-menu-outline";
import IconSearch from "~icons/solar/magnifer-linear";
import IconBell from "~icons/solar/bell-linear";
import IconLogout from "~icons/solar/logout-3-linear";
import IconTv from "~icons/solar/tv-linear";

export default function HeaderBar({ esMovil, onMenuClick, negocioId }) {
  const { usuario, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [pantallaAnchor, setPantallaAnchor] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const urlPantalla = `${window.location.origin}/pantalla/${negocioId}`;

  const copiarLink = async () => {
    await navigator.clipboard.writeText(urlPantalla);
    setCopiado(true);
  };

  const iniciales = (usuario?.nombre || usuario?.correo || "?").charAt(0).toUpperCase();

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        top: 0,
        bgcolor: "background.paper",
        borderBottom: (t) => `1px solid ${alpha(t.palette.grey[500], 0.12)}`,
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {esMovil && (
          <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 1 }}>
            <IconMenu width={22} height={22} />
          </IconButton>
        )}
        {esMovil && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box component="img" src={logo} alt="" sx={{ width: 26, height: 26, objectFit: "contain" }} />
            <Typography sx={{ fontWeight: 700 }}>NotiYa</Typography>
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title="Pantalla pública">
          <IconButton onClick={(e) => setPantallaAnchor(e.currentTarget)}>
            <IconTv width={22} height={22} />
          </IconButton>
        </Tooltip>
        <Popover
          open={Boolean(pantallaAnchor)}
          anchorEl={pantallaAnchor}
          onClose={() => setPantallaAnchor(null)}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
        >
          <Box sx={{ p: 2, maxWidth: 320 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Pantalla pública del negocio
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, wordBreak: "break-all" }}>
              {urlPantalla}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" onClick={copiarLink}>
                Copiar link
              </Button>
              <Button size="small" component="a" href={urlPantalla} target="_blank" rel="noopener noreferrer">
                Abrir
              </Button>
            </Stack>
          </Box>
        </Popover>

        <Tooltip title="Buscar (próximamente)">
          <IconButton>
            <IconSearch width={22} height={22} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Notificaciones (próximamente)">
          <IconButton>
            <Badge variant="dot" color="error">
              <IconBell width={22} height={22} />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Cuenta">
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5 }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: "0.85rem", fontWeight: 700 }}>{iniciales}</Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
            <Typography variant="subtitle2" noWrap>
              {usuario?.nombre || "Usuario"}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {usuario?.correo}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              logout();
            }}
          >
            <ListItemIcon>
              <IconLogout width={20} height={20} />
            </ListItemIcon>
            Cerrar sesión
          </MenuItem>
        </Menu>
        <Snackbar open={copiado} autoHideDuration={2000} onClose={() => setCopiado(false)} message="Link copiado" />
      </Toolbar>
    </AppBar>
  );
}
