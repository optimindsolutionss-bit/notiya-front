import axios from "axios";

export const TOKEN_KEY = "notiya_token";
export const USUARIO_KEY = "notiya_usuario";
export const NEGOCIO_KEY = "notiya_negocio_id";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const esPublica = url.includes("/auth/") || url.includes("/pantalla");
    if (error.response?.status === 401 && !esPublica) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USUARIO_KEY);
      localStorage.removeItem(NEGOCIO_KEY);
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
