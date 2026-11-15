// client/src/lib/ayuda.js
// Abrir la ayuda común del juego (components/AyudaJuego.jsx) desde cualquier pantalla de un juego.
// GamePage reparte la función con AyudaContexto; fuera de un juego no hace nada.
import { createContext, useContext } from 'react';

export const AyudaContexto = createContext(() => {});
export const useAbrirAyuda = () => useContext(AyudaContexto);
