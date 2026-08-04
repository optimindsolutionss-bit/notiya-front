import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Stack,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Card,
  Box,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import * as negociosApi from "../../api/negocios.api";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/layout/PageHeader";
import EmptyState from "../../components/layout/EmptyState";
import { useStaggerReveal } from "../../hooks/useRevealAnimation";
import IconEquipo from "~icons/solar/users-group-two-rounded-linear";

const ROLES = ["dueño", "editor", "promotor"];

export default function EquipoPage() {
  const { negocioId } = useParams();
  const id = Number(negocioId);
  const { usuario } = useAuth();

  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [correo, setCorreo] = useState("");
  const [rolNuevo, setRolNuevo] = useState("editor");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const listRef = useStaggerReveal({ translateY: 10, duration: 350, staggerDelay: 50 });

  const cargar = useCallback(async () => {
    setEmpleados(await negociosApi.listarEmpleados(id));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    cargar();
  }, [cargar]);

  const handleAgregar = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await negociosApi.agregarEmpleado(id, { correo: correo.trim(), rol: rolNuevo });
      setCorreo("");
      setRolNuevo("editor");
      cargar();
    } catch (err) {
      const status = err.response?.status;
      setError(
        status === 404
          ? "No existe una cuenta con ese correo. La persona debe registrarse primero."
          : err.response?.data?.mensaje || "No se pudo agregar"
      );
    } finally {
      setGuardando(false);
    }
  };

  const cambiarRol = async (usuarioId, rol) => {
    await negociosApi.actualizarRolEmpleado(id, usuarioId, rol);
    cargar();
  };

  const quitar = async (usuarioId) => {
    if (!window.confirm("¿Quitar el acceso de esta persona al negocio?")) return;
    await negociosApi.quitarEmpleado(id, usuarioId);
    cargar();
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader title="Equipo" subtitle="Quién tiene acceso a este negocio y con qué rol." />

      <Card sx={{ p: 2.5, mb: 3 }}>
        <form onSubmit={handleAgregar}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              fullWidth
              label="Correo de la persona"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            <Select value={rolNuevo} onChange={(e) => setRolNuevo(e.target.value)} sx={{ minWidth: 160 }}>
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
            <Button type="submit" variant="contained" disabled={guardando} startIcon={<AddRoundedIcon />} sx={{ flexShrink: 0 }}>
              {guardando ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Agregar"}
            </Button>
          </Stack>
        </form>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Card>

      {empleados.length === 0 ? (
        <EmptyState icon={IconEquipo} title="Todavía no hay nadie más en el equipo" description="Agrega a alguien por correo arriba." />
      ) : (
        <Stack ref={listRef} spacing={1.5}>
          {empleados.map((emp) => (
            <Card key={emp.usuarioId} sx={{ p: 2, opacity: 0 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }} noWrap>
                    {emp.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {emp.correo}
                  </Typography>
                </Box>
                <Select
                  size="small"
                  value={emp.rol}
                  onChange={(e) => cambiarRol(emp.usuarioId, e.target.value)}
                  disabled={emp.usuarioId === usuario?.id}
                  sx={{ minWidth: 140 }}
                >
                  {ROLES.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
                <IconButton size="small" onClick={() => quitar(emp.usuarioId)} disabled={emp.usuarioId === usuario?.id}>
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
