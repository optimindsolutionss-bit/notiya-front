import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Alert,
  InputAdornment,
  CircularProgress,
  Link,
} from "@mui/material";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AuthCard from "../components/auth/AuthCard";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await login(correo, password);
      const destino = location.state?.from?.pathname ?? "/app";
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthCard
      title="Bienvenido de nuevo"
      subtitle="Ingresa a tu cuenta de NotiYa"
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link component={RouterLink} to="/registro" sx={{ fontWeight: 600 }}>
            Regístrate
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
          {cargando ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Ingresar"}
        </Button>
      </form>
    </AuthCard>
  );
}
