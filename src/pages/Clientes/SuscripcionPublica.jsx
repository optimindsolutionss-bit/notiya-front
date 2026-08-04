import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, TextField, Button, Typography, Alert, CircularProgress } from "@mui/material";
import * as clientesApi from "../../api/clientes.api";
import * as pantallaApi from "../../api/pantalla.api";
import { useRevealAnimation } from "../../hooks/useRevealAnimation";

export default function SuscripcionPublica() {
  const { negocioId } = useParams();
  const id = Number(negocioId);
  const cardRef = useRevealAnimation({ translateY: 10, duration: 400 });

  const [nombreNegocio, setNombreNegocio] = useState("");
  const [nombre, setNombre] = useState("");
  const [whatsappNumero, setWhatsappNumero] = useState("");
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    pantallaApi
      .obtener(id)
      .then((data) => setNombreNegocio(data.negocio.nombre))
      .catch(() => {});
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await clientesApi.suscribirse(id, { nombre, whatsappNumero });
      setEnviado(true);
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo completar la suscripción");
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
        background: "radial-gradient(circle at 20% 20%, #D0ECFE 0%, #F9FAFB 45%, #F9FAFB 100%)",
        px: 2,
      }}
    >
      <Box
        ref={cardRef}
        sx={{
          width: "100%",
          maxWidth: 380,
          bgcolor: "#fff",
          borderRadius: 4,
          p: { xs: 4, sm: 5 },
          boxShadow: "0 0 2px rgba(145,158,171,0.2), 0 20px 40px -4px rgba(145,158,171,0.24)",
          opacity: 0,
        }}
      >
        {enviado ? (
          <>
            <Typography variant="h4" sx={{ fontSize: "1.5rem", mb: 1 }}>
              ¡Listo!
            </Typography>
            <Typography color="text.secondary">
              Quedaste suscrito a los avisos de {nombreNegocio || "este negocio"} por WhatsApp.
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h4" sx={{ fontSize: "1.5rem", mb: 0.5 }}>
              Recibe avisos de {nombreNegocio || "este negocio"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Te avisaremos por WhatsApp de promociones y novedades
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Tu nombre"
                fullWidth
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                sx={{ mb: 2.5 }}
              />
              <TextField
                label="Número de WhatsApp"
                type="tel"
                required
                fullWidth
                placeholder="+57 300 000 0000"
                value={whatsappNumero}
                onChange={(e) => setWhatsappNumero(e.target.value)}
                sx={{ mb: 3.5 }}
              />
              <Button type="submit" variant="contained" fullWidth disabled={cargando} sx={{ py: 1.4 }}>
                {cargando ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Suscribirme"}
              </Button>
            </form>
          </>
        )}
      </Box>
    </Box>
  );
}
