import { Stack, TextField, MenuItem } from "@mui/material";

const TIPOS_NEGOCIO = [
  "Restaurante",
  "Panadería",
  "Cafetería",
  "Tienda",
  "Peluquería / Spa",
  "Farmacia",
  "Otro",
];

export default function NegocioFormFields({ values, onChange, incluirExtendidos = true }) {
  const set = (campo) => (e) => onChange({ ...values, [campo]: e.target.value });

  return (
    <Stack spacing={2.5} sx={{ mt: 1 }}>
      <TextField label="Nombre del negocio" required fullWidth value={values.nombre} onChange={set("nombre")} />

      <TextField select label="Tipo de negocio" fullWidth value={values.tipoNegocio || ""} onChange={set("tipoNegocio")}>
        {TIPOS_NEGOCIO.map((tipo) => (
          <MenuItem key={tipo} value={tipo}>
            {tipo}
          </MenuItem>
        ))}
      </TextField>

      <TextField label="Dirección" fullWidth value={values.direccion || ""} onChange={set("direccion")} />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField label="Teléfono de contacto" fullWidth value={values.telefonoContacto || ""} onChange={set("telefonoContacto")} />
        <TextField label="Correo de contacto" type="email" fullWidth value={values.correoContacto || ""} onChange={set("correoContacto")} />
      </Stack>

      {incluirExtendidos && (
        <>
          <TextField label="URL del logo (opcional)" fullWidth value={values.logoUrl || ""} onChange={set("logoUrl")} />
          <TextField
            label="Descripción (opcional)"
            fullWidth
            multiline
            minRows={2}
            value={values.descripcion || ""}
            onChange={set("descripcion")}
          />
        </>
      )}
    </Stack>
  );
}
