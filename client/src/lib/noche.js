// client/src/lib/noche.js
// «Noche de juegos»: una lista de juegos para jugar seguidos con los mismos jugadores y un marcador acumulado.
// El estado vive en sessionStorage. Cada partida que se registra (registrarPartida) del juego que toca suma puntos
// por puesto: el 1.º tantos como jugadores de la noche, el 2.º uno menos… (los empates comparten puesto).
import { useEffect, useState } from 'react';
import { partirNombre } from './identidad.js';

const CLAVE = 'minijuegos_noche';
const EVENTO = 'minijuegos-noche';
const plano = (n) => partirNombre(String(n || '')).nombre.trim().toLowerCase();

export function leerNoche() { try { return JSON.parse(sessionStorage.getItem(CLAVE)) || null; } catch { return null; } }
function guardar(n) {
  try { if (n) sessionStorage.setItem(CLAVE, JSON.stringify(n)); else sessionStorage.removeItem(CLAVE); } catch { /* nada */ }
  window.dispatchEvent(new Event(EVENTO));
}
export function useNoche() {
  const [n, setN] = useState(leerNoche);
  useEffect(() => { const f = () => setN(leerNoche()); window.addEventListener(EVENTO, f); return () => window.removeEventListener(EVENTO, f); }, []);
  return n;
}

export function crearNoche(jugadores, juegos) {
  guardar({ jugadores, juegos, actual: 0, resultados: juegos.map(() => null), creada: Date.now() });
}
export const terminarNoche = () => guardar(null);
export function avanzarNoche() { const n = leerNoche(); if (n) guardar({ ...n, actual: Math.min(n.actual + 1, n.juegos.length) }); }
export function saltarJuego() { const n = leerNoche(); if (n) { const r = [...n.resultados]; r[n.actual] = { saltado: true, puntos: {} }; guardar({ ...n, resultados: r, actual: n.actual + 1 }); } }

/** Puntos por puesto a partir de una clasificación [{ nombre, posicion }] (posicion empieza en 1). */
function puntosPorPuesto(n, clasif) {
  const N = n.jugadores.length;
  const pts = {};
  clasif.forEach(({ nombre, posicion }) => { pts[nombre] = Math.max(1, N - (posicion - 1)); });
  return pts;
}

/** La llama registrarPartida: si hay noche y es el juego que toca, apunta el resultado (una sola vez). */
export function registrarEnNoche(juego, jugadores, orden = 'desc') {
  const n = leerNoche();
  if (!n || n.actual >= n.juegos.length || n.juegos[n.actual] !== juego || n.resultados[n.actual]) return;
  const nuestros = jugadores
    .map((j) => ({ ...j, nombre: n.jugadores.find((x) => plano(x) === plano(j.nombre)) }))
    .filter((j) => j.nombre);
  if (!nuestros.length) return;
  const valor = (j) => (j.puntos == null ? -Infinity : orden === 'asc' ? -j.puntos : j.puntos);
  nuestros.sort((a, b) => Number(b.gana) - Number(a.gana) || valor(b) - valor(a));
  let pos = 0; let previo = null;
  const clasif = nuestros.map((j, i) => {
    const clave = `${Number(j.gana)}|${valor(j)}`;
    if (clave !== previo) { pos = i + 1; previo = clave; }
    return { nombre: j.nombre, posicion: pos };
  });
  const r = [...n.resultados];
  r[n.actual] = { clasif, puntos: puntosPorPuesto(n, clasif), auto: true };
  guardar({ ...n, resultados: r });
}

/** Resultado apuntado a mano: lista de nombres en orden de llegada. */
export function apuntarAMano(orden) {
  const n = leerNoche();
  if (!n) return;
  const clasif = orden.map((nombre, i) => ({ nombre, posicion: i + 1 }));
  const r = [...n.resultados];
  r[n.actual] = { clasif, puntos: puntosPorPuesto(n, clasif), auto: false };
  guardar({ ...n, resultados: r });
}

export function marcador(n) {
  const t = Object.fromEntries(n.jugadores.map((j) => [j, 0]));
  n.resultados.forEach((r) => { if (r?.puntos) Object.entries(r.puntos).forEach(([k, v]) => { t[k] = (t[k] || 0) + v; }); });
  return n.jugadores.map((j) => ({ nombre: j, puntos: t[j] })).sort((a, b) => b.puntos - a.puntos);
}
