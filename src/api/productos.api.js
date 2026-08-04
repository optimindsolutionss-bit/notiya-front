import api from "./axios";
import { snakeToCamelShallow } from "./caseUtils";

export function normalizeProducto(row) {
  const producto = snakeToCamelShallow(row);
  return { ...producto, precio: producto.precio != null ? Number(producto.precio) : undefined };
}

export async function listar(negocioId) {
  const { data } = await api.get(`/negocios/${negocioId}/productos`);
  return data.productos.map(normalizeProducto);
}

export async function obtener(negocioId, productoId) {
  const { data } = await api.get(`/negocios/${negocioId}/productos/${productoId}`);
  return normalizeProducto(data.producto);
}

export async function crear(negocioId, { categoriaId, nombre, descripcion, precio, imagenUrl }) {
  const { data } = await api.post(`/negocios/${negocioId}/productos`, {
    categoriaId,
    nombre,
    descripcion,
    precio,
    imagenUrl,
  });
  return normalizeProducto(data.producto);
}

export async function actualizar(negocioId, productoId, campos) {
  const { data } = await api.put(`/negocios/${negocioId}/productos/${productoId}`, campos);
  return normalizeProducto(data.producto);
}

export async function actualizarDisponibilidad(negocioId, productoId, disponible) {
  const { data } = await api.patch(`/negocios/${negocioId}/productos/${productoId}/disponibilidad`, {
    disponible,
  });
  return normalizeProducto(data.producto);
}

export async function eliminar(negocioId, productoId) {
  await api.delete(`/negocios/${negocioId}/productos/${productoId}`);
}
