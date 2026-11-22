// client/src/lib/favoritos.js
// Juegos favoritos (❤️) y últimos juegos abiertos («Seguir jugando»). Se guardan en este navegador.
// Las dos listas van ligadas al jugador de la sesión (Nombre#1234): cada uno ve solo sus favoritos y los juegos que ha abierto él.
import { useEffect, useState } from 'react';
import { leerIdentidad, textoIdentidad } from './identidad.js';

/** Prefijo de la lista de cada jugador: «minijuegos_jugados__Ana#1234». */
export const PREFIJO_JUGADOS = 'minijuegos_jugados__';
export const PREFIJO_FAVS = 'minijuegos_favoritos__';
const deJugador = (prefijo) => () => { const yo = textoIdentidad(leerIdentidad()); return yo ? prefijo + yo : null; };
const claveJugados = deJugador(PREFIJO_JUGADOS);
const claveFavs = deJugador(PREFIJO_FAVS);
// Las listas antiguas eran comunes a todo el navegador y no se sabe de quién son: se descartan
try { localStorage.removeItem('minijuegos_jugados'); localStorage.removeItem('minijuegos_favoritos'); } catch { /* nada */ }
const EVENTO = 'minijuegos-favoritos';
const leer = (k) => { try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : []; } catch { return []; } };
const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } window.dispatchEvent(new Event(EVENTO)); };

export function alternarFavorito(id) {
  const k = claveFavs(); if (!k) return;
  const l = leer(k);
  escribir(k, l.includes(id) ? l.filter((x) => x !== id) : [id, ...l]);
}
/** Al abrir un juego: pasa al principio de «Seguir jugando» (máx. 12). */
export function marcarJugado(id) {
  const k = claveJugados(); if (!k) return;
  const l = leer(k).filter((x) => x !== id);
  escribir(k, [id, ...l].slice(0, 12));
}

// `clave` puede ser una función: se vuelve a calcular cuando cambia el jugador de la sesión
function useLista(clave) {
  const actual = () => { const k = typeof clave === 'function' ? clave() : clave; return k ? leer(k) : []; };
  const [l, setL] = useState(actual);
  useEffect(() => {
    const f = () => setL(actual());
    f();
    ['minijuegos-identidad', EVENTO, 'storage'].forEach((ev) => window.addEventListener(ev, f));
    return () => ['minijuegos-identidad', EVENTO, 'storage'].forEach((ev) => window.removeEventListener(ev, f));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return l;
}
export const useFavoritos = () => useLista(claveFavs);
export const useJugados = () => useLista(claveJugados);
