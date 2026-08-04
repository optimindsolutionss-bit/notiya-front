import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireSuperAdmin() {
  const { esSuperAdmin } = useAuth();

  if (!esSuperAdmin) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
