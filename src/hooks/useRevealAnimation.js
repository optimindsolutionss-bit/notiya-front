import { useCallback } from "react";
import { animate } from "animejs";

// Entrada suave (fade + translateY) con anime.js para el panel admin.
// La Pantalla pública sigue con framer-motion (decisión previa, loop de horas en kiosco).
//
// Ref de callback (no useEffect con deps []): el nodo puede montarse recién
// después de un estado de loading (ej. spinner -> grid), y un efecto con deps
// vacías solo corre una vez tras el primer render, cuando el ref todavía es
// null. Con ref de callback la animación dispara siempre que el nodo real
// aparece en el DOM, sea en el primer render o en uno posterior.
export function useRevealAnimation({ translateY = 12, duration = 450, delay = 0 } = {}) {
  return useCallback((node) => {
    if (!node) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    const animation = animate(node, {
      opacity: [0, 1],
      translateY: [translateY, 0],
      duration,
      delay,
      ease: "outQuad",
    });

    return () => animation.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// Entrada escalonada para grids/listas (ítems hijos directos del ref).
export function useStaggerReveal({ translateY = 10, duration = 400, staggerDelay = 60 } = {}) {
  return useCallback((node) => {
    if (!node) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    const animation = animate(node.children, {
      opacity: [0, 1],
      translateY: [translateY, 0],
      duration,
      delay: (_, i) => i * staggerDelay,
      ease: "outQuad",
    });

    return () => animation.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
