import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import * as mensajesApi from "../../api/mensajes.api";
import { TIPOS_PLANTILLA } from "../../constants/plantillas";

const VACIO = { tipo: "aviso", contenido: "", canal: "ambos", plantillaId: "", envio: "ahora", fechaHoraEnvio: "" };

export default function MensajeFormDialog({ open, onClose, negocioId, plantillas, onSaved }) {
  const [values, setValues] = useState(VACIO);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(VACIO);
      setError("");
    }
  }, [open]);

  const set = (campo) => (e) => setValues((v) => ({ ...v, [campo]: e.target.value }));

  const usarPlantilla = (e) => {
    const plantillaId = e.target.value;
    const plantilla = plantillas.find((p) => p.id === plantillaId);
    setValues((v) => ({
      ...v,
      plantillaId,
      ...(plantilla ? { tipo: plantilla.tipo, contenido: plantilla.contenido } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await mensajesApi.crear(negocioId, {
        tipo: values.tipo,
        contenido: values.contenido,
        canal: values.canal,
        fechaHoraEnvio: values.envio === "programar" && values.fechaHoraEnvio ? new Date(values.fechaHoraEnvio).toISOString() : undefined,
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo crear el mensaje");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuevo mensaje</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2.5}>
            {plantillas.length > 0 && (
              <TextField select label="Usar plantilla (opcional)" fullWidth value={values.plantillaId} onChange={usarPlantilla}>
                <MenuItem value="">Escribir desde cero</MenuItem>
                {plantillas.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nombre}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <Stack direction="row" spacing={2}>
              <TextField select label="Tipo" fullWidth value={values.tipo} onChange={set("tipo")}>
                {TIPOS_PLANTILLA.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField select label="Canal" fullWidth value={values.canal} onChange={set("canal")}>
                <MenuItem value="ambos">WhatsApp + Pantalla</MenuItem>
                <MenuItem value="whatsapp">Solo WhatsApp</MenuItem>
                <MenuItem value="pantalla">Solo Pantalla</MenuItem>
              </TextField>
            </Stack>

            <TextField
              label="Contenido"
              required
              fullWidth
              multiline
              minRows={4}
              value={values.contenido}
              onChange={set("contenido")}
            />

            <ToggleButtonGroup
              exclusive
              fullWidth
              value={values.envio}
              onChange={(_, v) => v && setValues((val) => ({ ...val, envio: v }))}
            >
              <ToggleButton value="ahora">Enviar ahora</ToggleButton>
              <ToggleButton value="programar">Programar</ToggleButton>
            </ToggleButtonGroup>

            {values.envio === "programar" && (
              <TextField
                label="Fecha y hora de envío"
                type="datetime-local"
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={values.fechaHoraEnvio}
                onChange={set("fechaHoraEnvio")}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={guardando} sx={{ px: 3 }}>
            {guardando ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Crear mensaje"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
