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
} from "@mui/material";
import * as plantillasApi from "../../api/plantillas.api";
import { TIPOS_PLANTILLA } from "../../constants/plantillas";

const VACIO = { nombre: "", tipo: "aviso", contenido: "" };

export default function PlantillaFormDialog({ open, onClose, negocioId, plantilla, onSaved }) {
  const [values, setValues] = useState(VACIO);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(plantilla ? { nombre: plantilla.nombre, tipo: plantilla.tipo, contenido: plantilla.contenido } : VACIO);
      setError("");
    }
  }, [open, plantilla]);

  const set = (campo) => (e) => setValues((v) => ({ ...v, [campo]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      if (plantilla) {
        await plantillasApi.actualizar(negocioId, plantilla.id, values);
      } else {
        await plantillasApi.crear(negocioId, values);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo guardar la plantilla");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{plantilla ? "Editar plantilla" : "Nueva plantilla"}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2.5}>
            <TextField label="Nombre" required fullWidth value={values.nombre} onChange={set("nombre")} />
            <TextField select label="Tipo" required fullWidth value={values.tipo} onChange={set("tipo")}>
              {TIPOS_PLANTILLA.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Contenido"
              required
              fullWidth
              multiline
              minRows={4}
              value={values.contenido}
              onChange={set("contenido")}
              helperText="Este es el texto que se enviará por WhatsApp"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={guardando} sx={{ px: 3 }}>
            {guardando ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Guardar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
