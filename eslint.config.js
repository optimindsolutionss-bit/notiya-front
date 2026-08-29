import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Sin React Query/Suspense, fetch-on-mount y reset-on-open vía useEffect
      // son el patrón estándar de esta app — esta regla marca esos casos legítimos.
      'react-hooks/set-state-in-effect': 'off',
      // Leer el reloj (Date.now()) para calcular badges de "activo ahora" en
      // una lista admin es una lectura inocua, no un efecto secundario real.
      'react-hooks/purity': 'off',
    },
  },
  {
    files: ['src/context/**/*.jsx'],
    rules: {
      // Los contexts exportan a propósito el Provider junto a su hook (useAuth, useNegocio).
      'react-refresh/only-export-components': 'off',
    },
  },
])
