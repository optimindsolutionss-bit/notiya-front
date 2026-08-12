import { useRef } from "react";
import { useMotionValue, useSpring, useReducedMotion } from "framer-motion";

const MAX_DEG = 10;

export function useTilt3D() {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { stiffness: 60, damping: 14 });
  const rotateY = useSpring(rawRotateY, { stiffness: 60, damping: 14 });

  const handleMouseMove = (e) => {
    if (prefersReducedMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    rawRotateY.set(nx * MAX_DEG);
    rawRotateX.set(ny * -MAX_DEG);
  };

  const handleMouseLeave = () => {
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  return {
    ref,
    style: { rotateX, rotateY },
    handlers: { onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave },
  };
}
