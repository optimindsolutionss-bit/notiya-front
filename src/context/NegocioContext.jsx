import { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as negociosApi from "../api/negocios.api";
import { NEGOCIO_KEY } from "../api/axios";
import { useAuth } from "./AuthContext";

const NegocioContext = createContext(null);

export function NegocioProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [negocios, setNegocios] = useState([]);
  const [negocioActualId, setNegocioActualId] = useState(() => {
    const guardado = localStorage.getItem(NEGOCIO_KEY);
    return guardado ? Number(guardado) : null;
  });
  const [loading, setLoading] = useState(true);

  const refetchNegocios = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await negociosApi.listar();
      setNegocios(lista);
      return lista;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refetchNegocios();
    } else {
      setNegocios([]);
      setLoading(false);
    }
  }, [isAuthenticated, refetchNegocios]);

  const seleccionarNegocio = useCallback((id) => {
    const numId = Number(id);
    localStorage.setItem(NEGOCIO_KEY, String(numId));
    setNegocioActualId(numId);
  }, []);

  const crearNegocio = useCallback(
    async (datos) => {
      const negocio = await negociosApi.crearCompleto(datos);
      await refetchNegocios();
      return negocio;
    },
    [refetchNegocios]
  );

  const value = {
    negocios,
    negocioActualId,
    loading,
    refetchNegocios,
    seleccionarNegocio,
    crearNegocio,
  };

  return <NegocioContext.Provider value={value}>{children}</NegocioContext.Provider>;
}

export function useNegocio() {
  const context = useContext(NegocioContext);
  if (!context) throw new Error("useNegocio debe usarse dentro de <NegocioProvider>");
  return context;
}
