// client/src/lib/favoritos.js
// Juegos favoritos (❤️) y últimos juegos abiertos («Seguir jugando»). Se guardan en este navegador.
// «Seguir jugando» va ligado al jugador de la sesión (Nombre#1234): cada uno ve solo los juegos que ha abierto él.
import { useEffect, useState } from 'react';
import { leerIdentidad, textoIdentidad } from './identidad.js';

const FAVS = 'minijuegos_favoritos';
/** Prefijo de la lista de cada jugador: «minijuegos_jugados__Ana#1234». */
export const PREFIJO_JUGADOS = 'minijuegos_jugados__';
const claveJugados = () => { const yo = textoIdentidad(leerIdentidad()); return yo ? PREFIJO_JUGADOS + yo : null; };
// La lista antigua era común a todo el navegador y no se sabe de quién es: se descarta
try { localStorage.removeItem('minijuegos_jugados'); } catch { /* nada */ }
const EVENTO = 'minijuegos-favoritos';
const leer = (k) => { try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : []; } catch { return []; } };
const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } window.dispatchEvent(new Event(EVENTO)); };

export function alternarFavorito(id) {
  const l = leer(FAVS);
  escribir(FAVS, l.includes(id) ? l.filter((x) => x !== id) : [id, ...l]);
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
export const useFavoritos = () => useLista(FAVS);
export const useJugados = () => useLista(claveJugados);
