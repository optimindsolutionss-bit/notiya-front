import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Icons from 'unplugin-icons/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Resuelve imports "~icons/<coleccion>/<nombre>" a componentes SVG en build time
    // (sin llamadas a la API de Iconify en el navegador).
    Icons({ compiler: 'jsx', jsx: 'react' }),
  ],
})
