import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import api from "../api/axios";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const { data } = await api.post("/auth/login", { correo, password });
      localStorage.setItem("token", data.token);
      alert(`Bienvenido, ${data.usuario.nombre}`);
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 20% 20%, #EEF0FF 0%, #F8F9FC 45%, #F8F9FC 100%)",
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 380,
          bgcolor: "#fff",
          borderRadius: 4,
          p: { xs: 4, sm: 5 },
          boxShadow: "0 20px 60px -15px rgba(79, 70, 229, 0.15)",
        }}
      >
        {/* Logo / marca */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "14px",
            background: "linear-gradient(135deg, #6366F1, #4F46E5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1.3rem" }}>
            N
          </Typography>
        </Box>

        <Typography variant="h4" sx={{ fontSize: "1.6rem", mb: 0.5 }}>
          Bienvenido de nuevo
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
          Ingresa a tu cuenta de NotiYa
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
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

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disableElevation
            disabled={cargando}
            sx={{
              py: 1.4,
              borderRadius: 2.5,
              background: "linear-gradient(135deg, #6366F1, #4F46E5)",
              "&:hover": {
                background: "linear-gradient(135deg, #5457E5, #4338CA)",
              },
            }}
          >
            {cargando ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Ingresar"
            )}
          </Button>
        </form>

        <Typography
          variant="body2"
          align="center"
          sx={{ color: "text.secondary", mt: 3 }}
        >
          ¿No tienes cuenta?{" "}
          <Box component="span" sx={{ color: "primary.main", fontWeight: 600, cursor: "pointer" }}>
            Regístrate
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}