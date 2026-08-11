import api from "./axios";
import { snakeToCamelShallow } from "./caseUtils";

function normalizeComando(row) {
  return snakeToCamelShallow(row);
}

export async function listar(negocioId) {
  const { data } = await api.get(`/negocios/${negocioId}/comandos`);
  return data.comandos.map(normalizeComando);
}

export async function crear(negocioId, { textoOriginal }) {
  const { data } = await api.post(`/negocios/${negocioId}/comandos`, { textoOriginal });
  return {
    mensaje: data.mensaje,
    comando: normalizeComando(data.comando),
    borrador: data.borrador ? snakeToCamelShallow(data.borrador) : null,
    requiereConfirmacion: data.requiere_confirmacion || false,
  };
}

export async function confirmar(negocioId, comandoId) {
  const { data } = await api.patch(`/negocios/${negocioId}/comandos/${comandoId}/confirmar`);
  return data;
}

export async function descartar(negocioId, comandoId) {
  await api.patch(`/negocios/${negocioId}/comandos/${comandoId}/descartar`);
}
