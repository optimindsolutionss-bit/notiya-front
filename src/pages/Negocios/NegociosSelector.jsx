import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NegocioFormFields from "../../components/negocios/NegocioFormFields";
import { useAuth } from "../../context/AuthContext";
import { useNegocio } from "../../context/NegocioContext";
import { useRevealAnimation, useStaggerReveal } from "../../hooks/useRevealAnimation";
import heroImg from "../../assets/hero.png";

const NEGOCIO_VACIO = {
  nombre: "",
  tipoNegocio: "",
  direccion: "",
  telefonoContacto: "",
  correoContacto: "",
  logoUrl: "",
  descripcion: "",
};

function FormularioNegocio({ onCreado }) {
  const { crearNegocio } = useNegocio();
  const [values, setValues] = useState(NEGOCIO_VACIO);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      const negocio = await crearNegocio(values);
      onCreado(negocio);
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo crear el negocio");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <NegocioFormFields values={values} onChange={setValues} />
      <Button type="submit" variant="contained" fullWidth disabled={guardando} sx={{ mt: 3, py: 1.3 }}>
        {guardando ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Crear negocio"}
      </Button>
    </form>
  );
}

export default function NegociosSelector() {
  const { logout, esSuperAdmin } = useAuth();
  const { negocios, loading } = useNegocio();
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const navigate = useNavigate();
  const heroRef = useRevealAnimation({ translateY: 12, duration: 400 });
  const gridRef = useStaggerReveal({ translateY: 10, duration: 350, staggerDelay: 50 });

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const irAlNegocio = (id) => navigate(`/app/${id}/productos`);

  if (negocios.length === 0) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Container maxWidth="sm" sx={{ py: 6 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {esSuperAdmin ? (
              <Button size="small" onClick={() => navigate("/admin/negocios")}>
                ← Ir al panel de administración
              </Button>
            ) : (
              <span />
            )}
            <IconButton onClick={logout} title="Cerrar sesión">
              <LogoutRoundedIcon />
            </IconButton>
          </Stack>
          <Box ref={heroRef} sx={{ textAlign: "center", mb: 3, opacity: 0 }}>
            <Box component="img" src={heroImg} alt="" sx={{ width: 160, mx: "auto", mb: 2 }} />
            <Typography variant="h4" sx={{ fontSize: "1.7rem", mb: 1 }}>
              Crea tu primer negocio
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Registra tu negocio para empezar a gestionar tu catálogo y avisar a tus clientes por WhatsApp.
            </Typography>
          </Box>
          <Card sx={{ p: { xs: 3, sm: 4 } }}>
            <FormularioNegocio onCreado={(negocio) => irAlNegocio(negocio.id)} />
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontSize: "1.7rem" }}>
              Tus negocios
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Selecciona un negocio para gestionarlo
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            {esSuperAdmin && (
              <Button size="small" onClick={() => navigate("/admin/negocios")}>
                ← Panel de administración
              </Button>
            )}
            <IconButton onClick={logout} title="Cerrar sesión">
              <LogoutRoundedIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Box
          ref={gridRef}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2.5,
          }}
        >
          {negocios.map((negocio) => (
            <Card key={negocio.id} sx={{ opacity: 0 }}>
              <CardActionArea onClick={() => irAlNegocio(negocio.id)} sx={{ p: 2.5 }}>
                <CardContent sx={{ p: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {negocio.nombre}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {negocio.tipoNegocio && <Chip size="small" label={negocio.tipoNegocio} />}
                    {negocio.rol && (
                      <Chip size="small" label={negocio.rol} color="primary" variant="outlined" />
                    )}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}

          <Card
            sx={{
              border: "2px dashed",
              borderColor: "divider",
              boxShadow: "none",
              display: "flex",
              opacity: 0,
            }}
          >
            <CardActionArea onClick={() => setDialogAbierto(true)} sx={{ p: 2.5, height: "100%" }}>
              <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ height: "100%", minHeight: 88 }}>
                <AddRoundedIcon color="primary" />
                <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                  Crear otro negocio
                </Typography>
              </Stack>
            </CardActionArea>
          </Card>
        </Box>
      </Container>

      <Dialog open={dialogAbierto} onClose={() => setDialogAbierto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Crear negocio</DialogTitle>
        <DialogContent>
          <FormularioNegocio
            onCreado={(negocio) => {
              setDialogAbierto(false);
              irAlNegocio(negocio.id);
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
