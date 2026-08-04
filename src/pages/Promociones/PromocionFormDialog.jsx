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
  InputAdornment,
} from "@mui/material";
import * as promocionesApi from "../../api/promociones.api";

function aInputLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const VACIO = { productoId: "", titulo: "", descripcion: "", precioPromocional: "", fechaInicio: "", fechaFin: "" };

export default function PromocionFormDialog({ open, onClose, negocioId, productos, promocion, onSaved }) {
  const [values, setValues] = useState(VACIO);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(
        promocion
          ? {
              productoId: promocion.productoId || "",
              titulo: promocion.titulo,
              descripcion: promocion.descripcion || "",
              precioPromocional: promocion.precioPromocional != null ? String(promocion.precioPromocional) : "",
              fechaInicio: aInputLocal(promocion.fechaInicio),
              fechaFin: aInputLocal(promocion.fechaFin),
            }
          : VACIO
      );
      setError("");
    }
  }, [open, promocion]);

  const set = (campo) => (e) => setValues((v) => ({ ...v, [campo]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      const payload = {
        productoId: values.productoId || null,
        titulo: values.titulo,
        descripcion: values.descripcion || null,
        precioPromocional: values.precioPromocional ? Number(values.precioPromocional) : null,
        fechaInicio: new Date(values.fechaInicio).toISOString(),
        fechaFin: new Date(values.fechaFin).toISOString(),
      };
      if (promocion) {
        await promocionesApi.actualizar(negocioId, promocion.id, payload);
      } else {
        await promocionesApi.crear(negocioId, payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo guardar la promoción");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{promocion ? "Editar promoción" : "Nueva promoción"}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2.5}>
            <TextField label="Título" required fullWidth value={values.titulo} onChange={set("titulo")} />
            <TextField
              label="Descripción"
              fullWidth
              multiline
              minRows={2}
              value={values.descripcion}
              onChange={set("descripcion")}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Precio promocional"
                type="number"
                fullWidth
                value={values.precioPromocional}
                onChange={set("precioPromocional")}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
              <TextField select label="Producto (opcional)" fullWidth value={values.productoId} onChange={set("productoId")}>
                <MenuItem value="">Sin producto vinculado</MenuItem>
                {productos.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Desde"
                type="datetime-local"
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={values.fechaInicio}
                onChange={set("fechaInicio")}
              />
              <TextField
                label="Hasta"
                type="datetime-local"
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={values.fechaFin}
                onChange={set("fechaFin")}
              />
            </Stack>
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
