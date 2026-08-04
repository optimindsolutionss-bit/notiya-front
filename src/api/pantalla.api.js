import api from "./axios";
import { snakeToCamelShallow } from "./caseUtils";
import { normalizeProducto } from "./productos.api";

function normalizePromocion(row) {
  const promo = snakeToCamelShallow(row);
  return {
    ...promo,
    precioPromocional: promo.precioPromocional != null ? Number(promo.precioPromocional) : null,
  };
}

function normalizeAviso(row) {
  return snakeToCamelShallow(row);
}

export async function obtener(negocioId) {
  const { data } = await api.get(`/pantalla/${negocioId}`);
  return {
    // `negocio` ya viene en camelCase desde el backend (ver hallazgo #3 del plan) — no se normaliza de nuevo.
    negocio: data.negocio,
    productos: data.productos.map(normalizeProducto),
    promociones: data.promociones.map(normalizePromocion),
    avisos: data.avisos.map(normalizeAviso),
  };
}
