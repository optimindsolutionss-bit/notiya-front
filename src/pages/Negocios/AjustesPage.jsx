import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Box, Typography, TextField, Button, Alert, CircularProgress } from "@mui/material";
import * as negociosApi from "../../api/negocios.api";
import NegocioFormFields from "../../components/negocios/NegocioFormFields";
import { useNegocio } from "../../context/NegocioContext";

const WHATSAPP_LINEA_REGEX = /^\+[1-9]\d{7,14}$/;

export default function AjustesPage() {
  const { negocioId } = useParams();
  const { refetchNegocios } = useNegocio();
  const [values, setValues] = useState(null);
  const [errorWhatsapp, setErrorWhatsapp] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    negociosApi.obtener(negocioId).then((negocio) => {
      if (!activo) return;
      setValues({ ...negocio, whatsappLinea: negocio.whatsappLinea || "" });
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, [negocioId]);

  const handleWhatsappChange = (e) => {
    const valor = e.target.value;
    setValues((v) => ({ ...v, whatsappLinea: valor }));
    setErrorWhatsapp(
      valor && !WHATSAPP_LINEA_REGEX.test(valor)
        ? "Formato inválido, debe incluir código de país (ej: +573001234567)"
        : ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errorWhatsapp) return;
    setError("");
    setGuardando(true);
    try {
      const actualizado = await negociosApi.actualizar(negocioId, values);
      setValues((v) => ({ ...v, ...actualizado }));
      refetchNegocios();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo guardar el negocio");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando || !values) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Ajustes del negocio
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <NegocioFormFields values={values} onChange={setValues} />

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Línea de WhatsApp
          </Typography>
          <TextField
            fullWidth
            placeholder="+573001234567"
            value={values.whatsappLinea}
            onChange={handleWhatsappChange}
            error={Boolean(errorWhatsapp)}
            helperText={errorWhatsapp || "Formato internacional, con código de país"}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          disabled={guardando || Boolean(errorWhatsapp)}
          sx={{ mt: 3, px: 3 }}
        >
          {guardando ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Guardar cambios"}
        </Button>
      </form>
    </Container>
  );
}
