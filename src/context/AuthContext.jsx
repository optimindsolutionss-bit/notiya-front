import { createContext, useContext, useState, useCallback } from "react";
import * as authApi from "../api/auth.api";
import { TOKEN_KEY, USUARIO_KEY, NEGOCIO_KEY } from "../api/axios";

const AuthContext = createContext(null);

function leerUsuarioGuardado() {
  try {
    const raw = localStorage.getItem(USUARIO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [usuario, setUsuario] = useState(leerUsuarioGuardado);

  const guardarSesion = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(data.usuario));
    setToken(data.token);
    setUsuario(data.usuario);
  }, []);

  const login = useCallback(
    async (correo, password) => {
      const data = await authApi.login({ correo, password });
      guardarSesion(data);
      return data.usuario;
    },
    [guardarSesion]
  );

  const registro = useCallback(
    async (nombre, correo, password) => {
      await authApi.registro({ nombre, correo, password });
      return login(correo, password);
    },
    [login]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    localStorage.removeItem(NEGOCIO_KEY);
    setToken(null);
    setUsuario(null);
  }, []);

  const value = {
    usuario,
    token,
    isAuthenticated: Boolean(token),
    esSuperAdmin: Boolean(usuario?.esSuperAdmin),
    login,
    registro,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
}
