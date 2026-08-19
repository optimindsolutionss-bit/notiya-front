import api from "./axios";

export async function generarCodigo(negocioId) {
  const { data } = await api.post(`/negocios/${negocioId}/whatsapp-vinculo/codigo`);
  return data;
}
