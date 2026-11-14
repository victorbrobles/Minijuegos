// client/src/lib/favoritos.js
// Juegos favoritos (❤️) y últimos juegos abiertos («Seguir jugando»). Se guardan en este navegador.
import { useEffect, useState } from 'react';

const FAVS = 'minijuegos_favoritos';
const JUGADOS = 'minijuegos_jugados';
const EVENTO = 'minijuegos-favoritos';
const leer = (k) => { try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : []; } catch { return []; } };
const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } window.dispatchEvent(new Event(EVENTO)); };

export function alternarFavorito(id) {
  const l = leer(FAVS);
  escribir(FAVS, l.includes(id) ? l.filter((x) => x !== id) : [id, ...l]);
}
/** Al abrir un juego: pasa al principio de «Seguir jugando» (máx. 12). */
export function marcarJugado(id) {
  const l = leer(JUGADOS).filter((x) => x !== id);
  escribir(JUGADOS, [id, ...l].slice(0, 12));
}

function useLista(clave) {
  const [l, setL] = useState(() => leer(clave));
  useEffect(() => {
    const f = () => setL(leer(clave));
    window.addEventListener(EVENTO, f); window.addEventListener('storage', f);
    return () => { window.removeEventListener(EVENTO, f); window.removeEventListener('storage', f); };
  }, [clave]);
  return l;
}
export const useFavoritos = () => useLista(FAVS);
export const useJugados = () => useLista(JUGADOS);
