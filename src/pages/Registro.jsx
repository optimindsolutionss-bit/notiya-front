import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Alert,
  InputAdornment,
  CircularProgress,
  Link,
} from "@mui/material";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AuthCard from "../components/auth/AuthCard";
import { useAuth } from "../context/AuthContext";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { registro } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setCargando(true);
    try {
      await registro(nombre, correo, password);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al crear la cuenta");
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthCard
      title="Crea tu cuenta"
      subtitle="Empieza a notificar a tus clientes por WhatsApp"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
            Inicia sesión
          </Link>
        </>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Nombre"
          fullWidth
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          sx={{ mb: 2.5 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlineRoundedIcon sx={{ color: "text.disabled", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Correo"
          type="email"
          fullWidth
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          sx={{ mb: 2.5 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MailOutlineRoundedIcon sx={{ color: "text.disabled", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Contraseña"
          type="password"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2.5 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon sx={{ color: "text.disabled", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Confirmar contraseña"
          type="password"
          fullWidth
          required
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          sx={{ mb: 3.5 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon sx={{ color: "text.disabled", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        <Button type="submit" variant="contained" fullWidth disabled={cargando} sx={{ py: 1.4 }}>
          {cargando ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Crear cuenta"}
        </Button>
      </form>
    </AuthCard>
  );
}
