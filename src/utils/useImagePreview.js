import { useEffect, useState } from "react";

/**
 * Prueba si una URL de imagen carga, con debounce — no hay endpoint de
 * subida de imágenes en el backend, así que esto es la única validación
 * posible antes de guardar.
 */
export function useImagePreview(url, delay = 400) {
  const [status, setStatus] = useState("idle"); // idle | loading | ok | error

  useEffect(() => {
    if (!url) {
      setStatus("idle");
      return;
    }
    setStatus("loading");
    const timeout = setTimeout(() => {
      const img = new Image();
      img.onload = () => setStatus("ok");
      img.onerror = () => setStatus("error");
      img.src = url;
    }, delay);
    return () => clearTimeout(timeout);
  }, [url, delay]);

  return status;
}
