import { Navigate, Outlet, useParams } from "react-router-dom";
import { useRolNegocio } from "../../hooks/useRolNegocio";

export default function RequireRolNegocio({ roles }) {
  const { negocioId } = useParams();
  const rol = useRolNegocio(negocioId);

  if (rol && !roles.includes(rol)) {
    return <Navigate to={`/app/${negocioId}/promociones`} replace />;
  }

  return <Outlet />;
}
