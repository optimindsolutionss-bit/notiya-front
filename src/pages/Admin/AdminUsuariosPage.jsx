import { useEffect, useState } from "react";
import {
  Container,
  Box,
  TextField,
  Stack,
  Card,
  CardContent,
  Typography,
  Switch,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import * as adminApi from "../../api/admin.api";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/layout/PageHeader";
import { useStaggerReveal } from "../../hooks/useRevealAnimation";

export default function AdminUsuariosPage() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const listRef = useStaggerReveal({ translateY: 10, duration: 350, staggerDelay: 50 });

  useEffect(() => {
    adminApi.listarUsuarios().then((lista) => {
      setUsuarios(lista);
      setLoading(false);
    });
  }, []);

  const toggleSuperAdmin = async (u) => {
    const actualizado = await adminApi.actualizarSuperAdmin(u.id, !u.esSuperAdmin);
    setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, esSuperAdmin: actualizado.esSuperAdmin } : x)));
  };

  const filtrados = usuarios.filter(
    (u) => u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || u.correo.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader title="Usuarios" subtitle={`${usuarios.length} usuarios registrados en la plataforma`} />

      <TextField
        fullWidth
        placeholder="Buscar por nombre o correo..."
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

      <Stack ref={listRef} spacing={1.5}>
        {filtrados.map((u) => (
          <Card key={u.id} sx={{ opacity: 0 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700 }} noWrap>
                  {u.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {u.correo}
                </Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  Superadmin
                </Typography>
                <Switch checked={u.esSuperAdmin} onChange={() => toggleSuperAdmin(u)} disabled={u.id === usuario?.id} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
