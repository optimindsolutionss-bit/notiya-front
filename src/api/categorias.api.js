import api from "./axios";
import { snakeToCamelShallow } from "./caseUtils";

function normalizeCategoria(row) {
  return snakeToCamelShallow(row);
}

export async function listar(negocioId) {
  const { data } = await api.get(`/negocios/${negocioId}/categorias`);
  return data.categorias.map(normalizeCategoria);
}

export async function crear(negocioId, { nombre }) {
  const { data } = await api.post(`/negocios/${negocioId}/categorias`, { nombre });
  return normalizeCategoria(data.categoria);
}

export async function actualizar(negocioId, categoriaId, { nombre }) {
  const { data } = await api.put(`/negocios/${negocioId}/categorias/${categoriaId}`, { nombre });
  return normalizeCategoria(data.categoria);
}

export async function eliminar(negocioId, categoriaId) {
  await api.delete(`/negocios/${negocioId}/categorias/${categoriaId}`);
}
