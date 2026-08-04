import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import * as adminApi from "../../api/admin.api";
import AdminCrearNegocioDialog from "./AdminCrearNegocioDialog";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/layout/PageHeader";
import EmptyState from "../../components/layout/EmptyState";
import { useStaggerReveal } from "../../hooks/useRevealAnimation";
import IconShield from "~icons/solar/shield-check-linear";

export default function AdminNegociosPage() {
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const listRef = useStaggerReveal({ translateY: 10, duration: 350, staggerDelay: 50 });
  const navigate = useNavigate();
  const { logout } = useAuth();

  const cargar = useCallback(async () => {
    const lista = await adminApi.listarTodosNegocios();
    setNegocios(lista);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const filtrados = negocios.filter((n) => n.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="Todos los negocios"
        subtitle={`${negocios.length} negocio${negocios.length !== 1 ? "s" : ""} en la plataforma`}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogAbierto(true)}>
              Crear negocio
            </Button>
            <IconButton onClick={logout} title="Cerrar sesión">
              <LogoutRoundedIcon />
            </IconButton>
          </Stack>
        }
      />

      <TextField
        fullWidth
        placeholder="Buscar por nombre..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ color: "text.disabled" }} />
            </InputAdornment>
          ),
        }}
      />

      {filtrados.length === 0 ? (
        <EmptyState icon={IconShield} title="No se encontraron negocios" description="Prueba con otro término de búsqueda." />
      ) : (
        <Stack ref={listRef} spacing={1.5}>
          {filtrados.map((negocio) => (
            <Card key={negocio.id} sx={{ opacity: 0 }}>
              <CardActionArea onClick={() => navigate(`/app/${negocio.id}/productos`)} sx={{ p: 2 }}>
                <CardContent sx={{ p: 0, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{negocio.nombre}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {negocio.dueno ? `Dueño: ${negocio.dueno.nombre} (${negocio.dueno.correo})` : "Sin dueño asignado"}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    {negocio.tipoNegocio && <Chip size="small" label={negocio.tipoNegocio} />}
                    <Chip size="small" label={negocio.activo ? "Activo" : "Inactivo"} color={negocio.activo ? "success" : "default"} variant="outlined" />
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      )}

      <AdminCrearNegocioDialog
        open={dialogAbierto}
        onClose={() => setDialogAbierto(false)}
        onCreado={() => {
          setDialogAbierto(false);
          cargar();
        }}
      />
    </Container>
  );
}
