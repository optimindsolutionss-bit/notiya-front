import { useAuth } from "../context/AuthContext";
import { useNegocio } from "../context/NegocioContext";

export function useRolNegocio(negocioId) {
  const { esSuperAdmin } = useAuth();
  const { negocios } = useNegocio();
  if (esSuperAdmin) return "dueño";
  const id = Number(negocioId);
  return negocios.find((n) => n.id === id)?.rol || null;
}
