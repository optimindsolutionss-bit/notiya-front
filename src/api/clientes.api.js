import api from "./axios";
import { snakeToCamelShallow } from "./caseUtils";

export async function listar(negocioId) {
  const { data } = await api.get(`/negocios/${negocioId}/clientes`);
  return data.clientes.map(snakeToCamelShallow);
}

export async function darDeBaja(negocioId, clienteId) {
  await api.delete(`/negocios/${negocioId}/clientes/${clienteId}`);
}

/** Público — usado desde la página de suscripción, sin auth. */
export async function suscribirse(negocioId, { nombre, whatsappNumero }) {
  const { data } = await api.post(`/negocios/${negocioId}/clientes/suscripcion`, {
    nombre,
    whatsappNumero,
  });
  return snakeToCamelShallow(data.cliente);
}
