import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Alert } from "@mui/material";
import NegocioFormFields from "../../components/negocios/NegocioFormFields";
import * as negociosApi from "../../api/negocios.api";

export default function AdminEditarNegocioDialog({ open, negocio, onClose, onGuardado }) {
  const [values, setValues] = useState(null);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (open && negocio) {
      setValues({
        nombre: negocio.nombre,
        tipoNegocio: negocio.tipoNegocio || "",
        direccion: negocio.direccion || "",
        telefonoContacto: negocio.telefonoContacto || "",
        correoContacto: negocio.correoContacto || "",
        logoUrl: negocio.logoUrl || "",
        descripcion: negocio.descripcion || "",
      });
      setError("");
    }
  }, [open, negocio]);

  if (!values) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      const actualizado = await negociosApi.actualizar(negocio.id, values);
      onGuardado(actualizado);
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo guardar el negocio");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar negocio</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <NegocioFormFields values={values} onChange={setValues} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={guardando} sx={{ px: 3 }}>
            {guardando ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Guardar cambios"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
