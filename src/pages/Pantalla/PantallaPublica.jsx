// Frontend/src/pages/Pantalla/PantallaPublica.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import * as pantallaApi from "../../api/pantalla.api";
import { fontDisplay } from "./pantallaTokens";
import { resolverPaleta } from "./paletas";
import { PaletaContext } from "./PaletaContext";
import { PantallaCargando, PantallaVacia, PantallaError } from "./PantallaStates";
import HeroHeader from "./HeroHeader";
import PromoRibbon from "./PromoRibbon";
import ProductScene3D from "./ProductScene3D";
import AvisosTicker from "./AvisosTicker";

const POLL_MS = 30000;

export default function PantallaPublica() {
  const { negocioId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try {
        const resultado = await pantallaApi.obtener(negocioId);
        if (activo) {
          setData(resultado);
          setError(false);
        }
      } catch {
        if (activo) setError(true);
      } finally {
        if (activo) setLoading(false);
      }
    };
    cargar();
    const interval = setInterval(cargar, POLL_MS);
    return () => {
      activo = false;
      clearInterval(interval);
    };
  }, [negocioId]);

  if (loading) return <PantallaCargando />;
  if (error || !data) return <PantallaError />;

  const { negocio, productos, promociones, avisos } = data;
  const paleta = resolverPaleta(negocio.paletaPantalla);

  return (
    <PaletaContext.Provider value={paleta}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: paleta.bg,
          fontFamily: fontDisplay,
        }}
      >
        <HeroHeader negocio={negocio} negocioId={negocioId} />
        <PromoRibbon promociones={promociones} productos={productos} />

        <Box sx={{ flex: 1 }}>
          {productos.length === 0 ? (
            <PantallaVacia nombreNegocio={negocio.nombre} />
          ) : (
            <ProductScene3D productos={productos} />
          )}
        </Box>

        <AvisosTicker avisos={avisos} />
      </Box>
    </PaletaContext.Provider>
  );
}
