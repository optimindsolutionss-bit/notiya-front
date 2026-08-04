const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatPrecio(value) {
  const numero = Number(value);
  if (Number.isNaN(numero)) return "$0";
  return formatter.format(numero);
}
