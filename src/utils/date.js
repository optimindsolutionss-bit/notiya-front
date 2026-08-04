const UNIDADES = [
  { limite: 60, divisor: 1, sufijo: "s" },
  { limite: 3600, divisor: 60, sufijo: "min" },
  { limite: 86400, divisor: 3600, sufijo: "h" },
  { limite: 2592000, divisor: 86400, sufijo: "d" },
];

export function formatRelativeTime(iso) {
  if (!iso) return "";
  const segundos = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (segundos < 10) return "justo ahora";

  for (const { limite, divisor, sufijo } of UNIDADES) {
    if (segundos < limite) {
      return `hace ${Math.floor(segundos / divisor)}${sufijo}`;
    }
  }
  return new Date(iso).toLocaleDateString("es-CO");
}
