import { useEffect } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNegocio } from "../../context/NegocioContext";

export default function RequireNegocio() {
  const { negocioId } = useParams();
  const { esSuperAdmin } = useAuth();
  const { negocios, loading, seleccionarNegocio } = useNegocio();
  const id = Number(negocioId);

  const tieneAcceso = esSuperAdmin || negocios.some((n) => n.id === id);

  useEffect(() => {
    if (tieneAcceso) {
      seleccionarNegocio(id);
    }
  }, [tieneAcceso, id, seleccionarNegocio]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!tieneAcceso) {
    return <Navigate to="/app/negocios" replace />;
  }

  return <Outlet />;
}
