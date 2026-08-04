import api from "./axios";
import { snakeToCamelShallow } from "./caseUtils";

export async function listar(negocioId, estado) {
  const { data } = await api.get(`/negocios/${negocioId}/mensajes`, {
    params: estado ? { estado } : undefined,
  });
  return data.mensajes.map(snakeToCamelShallow);
}

export async function crear(negocioId, { tipo, contenido, canal, productoId, promocionId, fechaHoraEnvio, esRecurrente, diasRecurrencia }) {
  const { data } = await api.post(`/negocios/${negocioId}/mensajes`, {
    tipo,
    contenido,
    canal,
    productoId,
    promocionId,
    fechaHoraEnvio,
    esRecurrente,
    diasRecurrencia,
  });
  return snakeToCamelShallow(data.data);
}

export async function cancelar(negocioId, mensajeId) {
  const { data } = await api.patch(`/negocios/${negocioId}/mensajes/${mensajeId}/cancelar`);
  return snakeToCamelShallow(data.data);
}
