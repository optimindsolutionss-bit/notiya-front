import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import NegocioFormFields from "../../components/negocios/NegocioFormFields";
import * as adminApi from "../../api/admin.api";

const VACIO = { nombre: "", tipoNegocio: "", direccion: "", telefonoContacto: "", correoContacto: "" };

export default function AdminCrearNegocioDialog({ open, onClose, onCreado }) {
  const [values, setValues] = useState(VACIO);
  const [busqueda, setBusqueda] = useState("");
  const [opciones, setOpciones] = useState([]);
  const [dueno, setDueno] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!open) {
      setValues(VACIO);
      setDueno(null);
      setBusqueda("");
      setOpciones([]);
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (busqueda.trim().length < 2) {
      setOpciones([]);
      return;
    }
    setBuscando(true);
    const timeout = setTimeout(async () => {
      try {
        const usuarios = await adminApi.buscarUsuarioPorCorreo(busqueda.trim());
        setOpciones(usuarios);
      } finally {
        setBuscando(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [busqueda]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dueno) {
      setError("Selecciona a qué usuario le pertenece este negocio");
      return;
    }
    setError("");
    setGuardando(true);
    try {
      const negocio = await adminApi.crearNegocioParaUsuario({ usuarioId: dueno.id, ...values });
      onCreado(negocio);
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo crear el negocio");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Crear negocio para un usuario</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Autocomplete
            options={opciones}
            getOptionLabel={(u) => `${u.nombre} (${u.correo})`}
            value={dueno}
            onChange={(_, value) => setDueno(value)}
            onInputChange={(_, value) => setBusqueda(value)}
            loading={buscando}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar dueño por correo"
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {buscando && <CircularProgress size={18} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <NegocioFormFields values={values} onChange={setValues} incluirExtendidos={false} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={guardando} sx={{ px: 3 }}>
            {guardando ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Crear negocio"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
