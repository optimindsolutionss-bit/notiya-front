import { useCallback } from "react";
import { animate } from "animejs";

// Entrada suave (fade + translateY) con anime.js para el panel admin.
// La Pantalla pública sigue con framer-motion (decisión previa, loop de horas en kiosco).
export function useRevealAnimation({ translateY = 12, duration = 450, delay = 0 } = {}) {
  return useCallback((node) => {
    if (!node) return undefined;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      node.style.opacity = "1";
      return undefined;
    }

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

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      Array.from(node.children).forEach((child) => {
        child.style.opacity = "1";
      });
      return undefined;
    }

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