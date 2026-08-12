import { useEffect, useRef, useState } from "react";
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
  Avatar,
  Typography,
} from "@mui/material";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import BrokenImageRoundedIcon from "@mui/icons-material/BrokenImageRounded";
import * as productosApi from "../../api/productos.api";
import { useImagePreview } from "../../utils/useImagePreview";

const VACIO = { nombre: "", descripcion: "", precio: "", categoriaId: "", imagenUrl: "" };

export default function ProductoFormDialog({ open, onClose, negocioId, categorias, producto, onSaved }) {
  const [values, setValues] = useState(VACIO);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [errorImagen, setErrorImagen] = useState("");
  const fileInputRef = useRef(null);
  const previewStatus = useImagePreview(values.imagenUrl);

  useEffect(() => {
    if (open) {
      setValues(
        producto
          ? {
              nombre: producto.nombre,
              descripcion: producto.descripcion || "",
              precio: String(producto.precio),
              categoriaId: producto.categoriaId || "",
              imagenUrl: producto.imagenUrl || "",
            }
          : VACIO
      );
      setError("");
      setErrorImagen("");
    }
  }, [open, producto]);

  const set = (campo) => (e) => setValues((v) => ({ ...v, [campo]: e.target.value }));

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setErrorImagen("");
    setSubiendo(true);
    try {
      const url = await productosApi.subirImagen(negocioId, file);
      setValues((v) => ({ ...v, imagenUrl: url }));
    } catch (err) {
      setErrorImagen(err.response?.data?.mensaje || "No se pudo subir la imagen, intenta de nuevo");
    } finally {
      setSubiendo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      const payload = {
        nombre: values.nombre,
        descripcion: values.descripcion || null,
        precio: Number(values.precio),
        categoriaId: values.categoriaId || null,
        imagenUrl: values.imagenUrl || null,
      };
      if (producto) {
        await productosApi.actualizar(negocioId, producto.id, payload);
      } else {
        await productosApi.crear(negocioId, payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo guardar el producto");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{producto ? "Editar producto" : "Nuevo producto"}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2.5}>
            <TextField label="Nombre" required fullWidth value={values.nombre} onChange={set("nombre")} />

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
                label="Precio"
                required
                type="number"
                fullWidth
                value={values.precio}
                onChange={set("precio")}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
              <TextField select label="Categoría" fullWidth value={values.categoriaId} onChange={set("categoriaId")}>
                <MenuItem value="">Sin categoría</MenuItem>
                {categorias.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Stack spacing={0.5} sx={{ flex: 1 }}>
                <Button
                  variant="outlined"
                  disabled={subiendo}
                  onClick={() => fileInputRef.current.click()}
                >
                  {subiendo ? "Subiendo..." : values.imagenUrl ? "Cambiar foto" : "Tomar/subir foto"}
                </Button>
                {errorImagen && (
                  <Typography variant="caption" color="error">
                    {errorImagen}
                  </Typography>
                )}
              </Stack>
              <Avatar
                variant="rounded"
                src={!subiendo && previewStatus === "ok" ? values.imagenUrl : undefined}
                sx={{ width: 56, height: 56, bgcolor: "background.neutral" }}
              >
                {subiendo || previewStatus === "loading" ? (
                  <CircularProgress size={20} />
                ) : previewStatus === "error" ? (
                  <BrokenImageRoundedIcon color="disabled" />
                ) : (
                  <ImageRoundedIcon color="disabled" />
                )}
              </Avatar>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={guardando || subiendo} sx={{ px: 3 }}>
            {guardando ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Guardar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
