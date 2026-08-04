import api from "./axios";
import { snakeToCamelShallow } from "./caseUtils";

export async function listar(negocioId) {
  const { data } = await api.get(`/negocios/${negocioId}/plantillas`);
  return data.plantillas.map(snakeToCamelShallow);
}

export async function crear(negocioId, { nombre, tipo, contenido }) {
  const { data } = await api.post(`/negocios/${negocioId}/plantillas`, { nombre, tipo, contenido });
  return snakeToCamelShallow(data.plantilla);
}

export async function actualizar(negocioId, plantillaId, campos) {
  const { data } = await api.put(`/negocios/${negocioId}/plantillas/${plantillaId}`, campos);
  return snakeToCamelShallow(data.plantilla);
}

export async function eliminar(negocioId, plantillaId) {
  await api.delete(`/negocios/${negocioId}/plantillas/${plantillaId}`);
}
