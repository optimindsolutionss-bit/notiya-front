import { useState } from "react";
import {
  Box,
  Card,
  Avatar,
  Typography,
  Switch,
  IconButton,
  Stack,
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import { motion, AnimatePresence } from "framer-motion";
import * as productosApi from "../../api/productos.api";
import { formatPrecio } from "../../utils/currency";
import EmptyState from "../../components/layout/EmptyState";
import IconBox from "~icons/solar/box-minimalistic-linear";

export default function ProductoList({ productos, categorias, negocioId, onEditar, onEliminado, onCambiado }) {
  const [snackbar, setSnackbar] = useState(null);
  const [pendientes, setPendientes] = useState({});

  const nombreCategoria = (categoriaId) => categorias.find((c) => c.id === categoriaId)?.nombre;

  const toggleDisponibilidad = async (producto) => {
    setPendientes((p) => ({ ...p, [producto.id]: true }));
    try {
      await productosApi.actualizarDisponibilidad(negocioId, producto.id, !producto.disponible);
      onCambiado();
      if (producto.disponible) {
        setSnackbar({
          severity: "info",
          mensaje: `"${producto.nombre}" marcado como agotado. Se generó un aviso automático.`,
        });
      }
    } catch (err) {
      setSnackbar({ severity: "error", mensaje: err.response?.data?.mensaje || "No se pudo actualizar" });
    } finally {
      setPendientes((p) => ({ ...p, [producto.id]: false }));
    }
  };

  const eliminar = async (producto) => {
    try {
      await productosApi.eliminar(negocioId, producto.id);
      onEliminado();
    } catch (err) {
      setSnackbar({ severity: "error", mensaje: err.response?.data?.mensaje || "No se pudo eliminar" });
    }
  };

  if (productos.length === 0) {
    return <EmptyState icon={IconBox} title="Aún no tienes productos" description="Agrega tu primer producto en esta categoría." />;
  }

  return (
    <>
      <Stack spacing={1.5}>
        <AnimatePresence initial={false}>
          {productos.map((producto) => (
            <Card
              key={producto.id}
              component={motion.div}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                opacity: producto.disponible ? 1 : 0.6,
              }}
            >
              <Avatar variant="rounded" src={producto.imagenUrl || undefined} sx={{ width: 56, height: 56 }}>
                <ImageRoundedIcon color="disabled" />
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }} noWrap>
                  {producto.nombre}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
                    {formatPrecio(producto.precio)}
                  </Typography>
                  {nombreCategoria(producto.categoriaId) && (
                    <Chip size="small" label={nombreCategoria(producto.categoriaId)} />
                  )}
                </Stack>
              </Box>

              <Switch
                checked={producto.disponible}
                disabled={pendientes[producto.id]}
                onChange={() => toggleDisponibilidad(producto)}
              />

              <IconButton onClick={() => onEditar(producto)} size="small">
                <EditRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => eliminar(producto)} size="small">
                <DeleteRoundedIcon fontSize="small" />
              </IconButton>
            </Card>
          ))}
        </AnimatePresence>
      </Stack>

      <Snackbar open={Boolean(snackbar)} autoHideDuration={4000} onClose={() => setSnackbar(null)}>
        {snackbar && (
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>
            {snackbar.mensaje}
          </Alert>
        )}
      </Snackbar>
    </>
  );
}
