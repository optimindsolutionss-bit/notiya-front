// Frontend/src/pages/Pantalla/paletas.js
export const PALETAS = {
  medianoche: {
    nombre: "Medianoche",
    bg: "#020617",
    surface: "#0E1223",
    surfaceMuted: "#1A1E2F",
    border: "#334155",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    accent: "#EF4444",
    accentMuted: "#7F1D1D",
  },
  oceano: {
    nombre: "Océano",
    bg: "#020617",
    surface: "#0E1223",
    surfaceMuted: "#1A1E2F",
    border: "#334155",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    accent: "#3B82F6",
    accentMuted: "#1E3A8A",
  },
  bosque: {
    nombre: "Bosque",
    bg: "#020617",
    surface: "#0E1223",
    surfaceMuted: "#1A1E2F",
    border: "#334155",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    accent: "#22C55E",
    accentMuted: "#14532D",
  },
  ambar: {
    nombre: "Ámbar noche",
    bg: "#020617",
    surface: "#0E1223",
    surfaceMuted: "#1A1E2F",
    border: "#334155",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    accent: "#F59E0B",
    accentMuted: "#78350F",
  },
  "claro-clasico": {
    nombre: "Claro clásico",
    bg: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceMuted: "#E2E8F0",
    border: "#CBD5E1",
    text: "#0F172A",
    textMuted: "#64748B",
    accent: "#2563EB",
    accentMuted: "#BFDBFE",
  },
  arena: {
    nombre: "Arena cálida",
    bg: "#FBF7F0",
    surface: "#FFFFFF",
    surfaceMuted: "#F1E9DD",
    border: "#E7DCC8",
    text: "#3F2E1E",
    textMuted: "#8A7A64",
    accent: "#D97706",
    accentMuted: "#FDE7C7",
  },
};

export const PALETA_DEFAULT = "medianoche";

export function resolverPaleta(clave) {
  return PALETAS[clave] || PALETAS[PALETA_DEFAULT];
}
