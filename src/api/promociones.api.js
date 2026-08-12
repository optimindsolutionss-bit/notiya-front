import api from "./axios";
import { snakeToCamelShallow } from "./caseUtils";

function normalizePromocion(row) {
  const promo = snakeToCamelShallow(row);
  return {
    ...promo,
    precioPromocional: promo.precioPromocional != null ? Number(promo.precioPromocional) : null,
  };
}

export async function listar(negocioId, { soloActivas = false } = {}) {
  const { data } = await api.get(`/negocios/${negocioId}/promociones`, {
    params: soloActivas ? { activas: "true" } : undefined,
  });
  return data.promociones.map(normalizePromocion);
}

export async function crear(negocioId, { productoId, titulo, descripcion, precioPromocional, fechaInicio, fechaFin, imagenUrl }) {
  const { data } = await api.post(`/negocios/${negocioId}/promociones`, {
    productoId,
    titulo,
    descripcion,
    precioPromocional,
    fechaInicio,
    fechaFin,
    imagenUrl,
  });
  return normalizePromocion(data.promocion);
}

export async function actualizar(negocioId, promocionId, campos) {
  const { data } = await api.put(`/negocios/${negocioId}/promociones/${promocionId}`, campos);
  return normalizePromocion(data.promocion);
}

export async function eliminar(negocioId, promocionId) {
  await api.delete(`/negocios/${negocioId}/promociones/${promocionId}`);
}

export async function subirImagen(negocioId, file) {
  const form = new FormData();
  form.append("imagen", file);
  const { data } = await api.post(`/negocios/${negocioId}/promociones/imagen`, form);
  return data.url;
}
