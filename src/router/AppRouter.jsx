import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RequireAuth from "./guards/RequireAuth";
import RequireNegocio from "./guards/RequireNegocio";
import RequireSuperAdmin from "./guards/RequireSuperAdmin";
import RequireRolNegocio from "./guards/RequireRolNegocio";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";
import Login from "../pages/Login";
import Registro from "../pages/Registro";
import NegociosSelector from "../pages/Negocios/NegociosSelector";
import ProductosPage from "../pages/Productos/ProductosPage";
import AdminNegociosPage from "../pages/Admin/AdminNegociosPage";
import AdminUsuariosPage from "../pages/Admin/AdminUsuariosPage";
import PantallaPublica from "../pages/Pantalla/PantallaPublica";
import PromocionesPage from "../pages/Promociones/PromocionesPage";
import PlantillasPage from "../pages/Plantillas/PlantillasPage";
import ClientesPage from "../pages/Clientes/ClientesPage";
import SuscripcionPublica from "../pages/Clientes/SuscripcionPublica";
import MensajesPage from "../pages/Mensajes/MensajesPage";
import ComandosIaPage from "../pages/ComandosIa/ComandosIaPage";
import EquipoPage from "../pages/Equipo/EquipoPage";
import AjustesPage from "../pages/Negocios/AjustesPage";

function RutaPublicaSoloInvitado({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/app" replace /> : children;
}

function RedirigirSegunSesion() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/app" : "/login"} replace />;
}

function RedirigirApp() {
  const { esSuperAdmin } = useAuth();
  return <Navigate to={esSuperAdmin ? "/admin/negocios" : "/app/negocios"} replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RutaPublicaSoloInvitado>
            <Login />
          </RutaPublicaSoloInvitado>
        }
      />
      <Route
        path="/registro"
        element={
          <RutaPublicaSoloInvitado>
            <Registro />
          </RutaPublicaSoloInvitado>
        }
      />

      <Route path="/pantalla/:negocioId" element={<PantallaPublica />} />
      <Route path="/suscribirse/:negocioId" element={<SuscripcionPublica />} />

      <Route element={<RequireAuth />}>
        <Route path="/app" element={<RedirigirApp />} />
        <Route path="/app/negocios" element={<NegociosSelector />} />

        <Route path="/app/:negocioId" element={<RequireNegocio />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="promociones" replace />} />
            <Route path="promociones" element={<PromocionesPage />} />
            <Route element={<RequireRolNegocio roles={["dueño", "editor"]} />}>
              <Route path="productos" element={<ProductosPage />} />
              <Route path="plantillas" element={<PlantillasPage />} />
              <Route path="clientes" element={<ClientesPage />} />
              <Route path="mensajes" element={<MensajesPage />} />
              <Route path="comandos" element={<ComandosIaPage />} />
            </Route>
            <Route element={<RequireRolNegocio roles={["dueño"]} />}>
              <Route path="equipo" element={<EquipoPage />} />
              <Route path="ajustes" element={<AjustesPage />} />
            </Route>
          </Route>
        </Route>

        <Route element={<RequireSuperAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/negocios" element={<AdminNegociosPage />} />
            <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<RedirigirSegunSesion />} />
    </Routes>
  );
}
