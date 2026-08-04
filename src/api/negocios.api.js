import api from "./axios";
import { snakeToCamelShallow } from "./caseUtils";

function normalizeNegocio(row) {
  return snakeToCamelShallow(row);
}

export async function listar() {
  const { data } = await api.get("/negocios");
  return data.negocios.map(normalizeNegocio);
}

export async function crear({ nombre, tipoNegocio, direccion, telefonoContacto, correoContacto }) {
  const { data } = await api.post("/negocios", {
    nombre,
    tipoNegocio,
    direccion,
    telefonoContacto,
    correoContacto,
  });
  return normalizeNegocio(data.negocio);
}

export async function obtener(negocioId) {
  const { data } = await api.get(`/negocios/${negocioId}`);
  return normalizeNegocio(data.negocio);
}

export async function actualizar(negocioId, campos) {
  const { data } = await api.put(`/negocios/${negocioId}`, campos);
  return normalizeNegocio(data.negocio);
}

/**
 * Crea un negocio con solo los campos que acepta POST /negocios y,
 * si vienen logoUrl/descripcion (no soportados en creación), los aplica
 * en un PUT inmediato — ver hallazgo #1 del plan.
 */
export async function crearCompleto({ logoUrl, descripcion, ...datosBase }) {
  const negocio = await crear(datosBase);
  if (logoUrl || descripcion) {
    return actualizar(negocio.id, { logoUrl, descripcion });
  }
  return negocio;
}

export async function listarEmpleados(negocioId) {
  const { data } = await api.get(`/negocios/${negocioId}/empleados`);
  return data.empleados.map(snakeToCamelShallow);
}

export async function agregarEmpleado(negocioId, { correo, rol }) {
  const { data } = await api.post(`/negocios/${negocioId}/empleados`, { correo, rol });
  return snakeToCamelShallow(data.acceso);
}

export async function actualizarRolEmpleado(negocioId, usuarioId, rol) {
  const { data } = await api.put(`/negocios/${negocioId}/empleados/${usuarioId}`, { rol });
  return snakeToCamelShallow(data.acceso);
}

export async function quitarEmpleado(negocioId, usuarioId) {
  await api.delete(`/negocios/${negocioId}/empleados/${usuarioId}`);
}
