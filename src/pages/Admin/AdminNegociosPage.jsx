import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import * as adminApi from "../../api/admin.api";
import * as negociosApi from "../../api/negocios.api";
import AdminCrearNegocioDialog from "./AdminCrearNegocioDialog";
import AdminEditarNegocioDialog from "./AdminEditarNegocioDialog";
import PageHeader from "../../components/layout/PageHeader";
import EmptyState from "../../components/layout/EmptyState";
import { useStaggerReveal } from "../../hooks/useRevealAnimation";
import IconShield from "~icons/solar/shield-check-linear";

export default function AdminNegociosPage() {
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [negocioEditando, setNegocioEditando] = useState(null);
  const listRef = useStaggerReveal({ translateY: 10, duration: 350, staggerDelay: 50 });
  const navigate = useNavigate();

  const cargar = useCallback(async () => {
    const lista = await adminApi.listarTodosNegocios();
    setNegocios(lista);
    setLoading(false);
  }, []);

  const toggleActivo = async (negocio) => {
    const actualizado = await negociosApi.actualizar(negocio.id, { activo: !negocio.activo });
    setNegocios((prev) => prev.map((n) => (n.id === negocio.id ? { ...n, activo: actualizado.activo } : n)));
  };

  const eliminarNegocio = async (negocio) => {
    if (!window.confirm(`¿Eliminar "${negocio.nombre}"? Se ocultará de los listados, pero sus datos no se borran.`)) {
      return;
    }
    await adminApi.eliminarNegocio(negocio.id);
    setNegocios((prev) => prev.filter((n) => n.id !== negocio.id));
  };

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
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogAbierto(true)}>
            Crear negocio
          </Button>
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
            <Card key={negocio.id} sx={{ opacity: 0, p: 2 }}>
              <CardContent
                sx={{ p: "0 !important", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700 }}>{negocio.nombre}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {negocio.dueno ? `Dueño: ${negocio.dueno.nombre} (${negocio.dueno.correo})` : "Sin dueño asignado"}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {negocio.tipoNegocio && <Chip size="small" label={negocio.tipoNegocio} sx={{ mr: 0.5 }} />}
                  <Chip
                    size="small"
                    label={negocio.activo ? "Activo" : "Inactivo"}
                    color={negocio.activo ? "success" : "default"}
                    variant="outlined"
                    onClick={() => toggleActivo(negocio)}
                    sx={{ mr: 0.5, cursor: "pointer" }}
                  />
                  <Tooltip title="Ver panel del negocio">
                    <IconButton size="small" onClick={() => navigate(`/app/${negocio.id}/productos`)}>
                      <OpenInNewRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar negocio">
                    <IconButton size="small" onClick={() => setNegocioEditando(negocio)}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar negocio">
                    <IconButton size="small" color="error" onClick={() => eliminarNegocio(negocio)}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </CardContent>
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

      <AdminEditarNegocioDialog
        open={Boolean(negocioEditando)}
        negocio={negocioEditando}
        onClose={() => setNegocioEditando(null)}
        onGuardado={(actualizado) => {
          setNegocios((prev) => prev.map((n) => (n.id === actualizado.id ? { ...n, ...actualizado } : n)));
          setNegocioEditando(null);
        }}
      />
    </Container>
  );
}
