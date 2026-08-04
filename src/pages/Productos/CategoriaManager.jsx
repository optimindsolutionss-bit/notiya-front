import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import * as categoriasApi from "../../api/categorias.api";

export default function CategoriaManager({ open, onClose, negocioId, categorias, onChange }) {
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [editandoNombre, setEditandoNombre] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const crear = async (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    setError("");
    setGuardando(true);
    try {
      await categoriasApi.crear(negocioId, { nombre: nuevoNombre.trim() });
      setNuevoNombre("");
      onChange();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo crear la categoría");
    } finally {
      setGuardando(false);
    }
  };

  const guardarEdicion = async (categoriaId) => {
    if (!editandoNombre.trim()) return;
    try {
      await categoriasApi.actualizar(negocioId, categoriaId, { nombre: editandoNombre.trim() });
      setEditandoId(null);
      onChange();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo actualizar la categoría");
    }
  };

  const eliminar = async (categoriaId) => {
    try {
      await categoriasApi.eliminar(negocioId, categoriaId);
      onChange();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo eliminar la categoría");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Categorías</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <List dense disablePadding>
          {categorias.map((cat) => (
            <ListItem
              key={cat.id}
              disableGutters
              secondaryAction={
                editandoId === cat.id ? (
                  <IconButton edge="end" onClick={() => guardarEdicion(cat.id)}>
                    <CheckRoundedIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <Stack direction="row">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => {
                        setEditandoId(cat.id);
                        setEditandoNombre(cat.nombre);
                      }}
                    >
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton edge="end" size="small" onClick={() => eliminar(cat.id)}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )
              }
            >
              {editandoId === cat.id ? (
                <TextField
                  size="small"
                  fullWidth
                  autoFocus
                  value={editandoNombre}
                  onChange={(e) => setEditandoNombre(e.target.value)}
                  sx={{ mr: 6 }}
                />
              ) : (
                <ListItemText primary={cat.nombre} />
              )}
            </ListItem>
          ))}
          {categorias.length === 0 && (
            <ListItemText primary="Aún no tienes categorías" sx={{ color: "text.secondary" }} />
          )}
        </List>

        <form onSubmit={crear}>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Nueva categoría"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
            />
            <IconButton type="submit" color="primary" disabled={guardando}>
              {guardando ? <CircularProgress size={20} /> : <AddRoundedIcon />}
            </IconButton>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
