// Frontend/src/pages/Pantalla/PaletaContext.js
import { createContext } from "react";
import { PALETAS, PALETA_DEFAULT } from "./paletas";

export const PaletaContext = createContext(PALETAS[PALETA_DEFAULT]);
