// client/src/lib/identidad.js
// Identidad del jugador: «Nombre#1234». Se pide al entrar y se guarda durante la sesión (sessionStorage); la
// última usada se recuerda en el navegador para poder seguir con ella con un toque.
// Es el nombre que sale por defecto como primer jugador en los selectores y al crear o unirse a una sala, y con el
// que se guardan los registros del salón de la fama.
import { useEffect, useState } from 'react';

const SESION = 'minijuegos_identidad';
const ULTIMA = 'minijuegos_identidad_ultima';
export const MAX_NOMBRE = 15; // + «#1234» = 20, lo que admiten las salas
const evento = 'minijuegos-identidad';

const leer = (store, clave) => {
  try {
    const v = JSON.parse(store.getItem(clave));
    return v && typeof v.nombre === 'string' && /^\d{4}$/.test(v.tag) ? v : null;
  } catch {
    return null;
  }
};

export const leerIdentidad = () => (typeof sessionStorage === 'undefined' ? null : leer(sessionStorage, SESION));
export const ultimaIdentidad = () => (typeof localStorage === 'undefined' ? null : leer(localStorage, ULTIMA));
export const textoIdentidad = (i) => (i ? `${i.nombre}#${i.tag}` : '');
/** Nombre visible de la sesión («Ana»), o '' si no hay. Es el que se usa en las partidas. */
export const nombreIdentidad = () => leerIdentidad()?.nombre || '';
/** Nombre completo con etiqueta («Ana#1234»): solo para guardar los resultados. */
export const nombreCompleto = () => textoIdentidad(leerIdentidad());

// Etiquetas conocidas en esta sesión (jugadores elegidos de «recientes»): «pablo» → «Pablo#5678»
const ETIQUETAS = 'minijuegos_etiquetas';
const leerEtiquetas = () => { try { return JSON.parse(sessionStorage.getItem(ETIQUETAS)) || {}; } catch { return {}; } };
/** Recuerda que el nombre visible de `completo` («Pablo#5678») es «Pablo». */
export function recordarEtiqueta(completo) {
  const { nombre, tag } = partirNombre(completo);
  if (!tag) return;
  try { sessionStorage.setItem(ETIQUETAS, JSON.stringify({ ...leerEtiquetas(), [nombre.toLowerCase()]: completo })); } catch { /* nada */ }
}
/** Nombre con el que se guarda un jugador: tu identidad o un reciente conocido llevan su etiqueta. */
export function etiquetar(nombre) {
  const n = String(nombre || '').trim();
  if (!n || partirNombre(n).tag) return n;
  const yo = leerIdentidad();
  if (yo && yo.nombre.toLowerCase() === n.toLowerCase()) return textoIdentidad(yo);
  return leerEtiquetas()[n.toLowerCase()] || n;
}

export function limpiarNombre(n) {
  return String(n || '').replace(/[#|]/g, '').replace(/\s+/g, ' ').trim().slice(0, MAX_NOMBRE);
}
export const tagAlAzar = () => String(Math.floor(Math.random() * 10000)).padStart(4, '0');

export function guardarIdentidad(nombre, tag) {
  const i = { nombre: limpiarNombre(nombre), tag: String(tag).padStart(4, '0').slice(0, 4) };
  try { sessionStorage.setItem(SESION, JSON.stringify(i)); } catch { /* sin almacenamiento */ }
  try { localStorage.setItem(ULTIMA, JSON.stringify(i)); } catch { /* sin almacenamiento */ }
  window.dispatchEvent(new Event(evento));
  return i;
}

export function olvidarIdentidad() {
  try { sessionStorage.removeItem(SESION); } catch { /* nada */ }
  window.dispatchEvent(new Event(evento));
}

/** Identidad actual (se actualiza si cambia). */
export function useIdentidad() {
  const [i, setI] = useState(leerIdentidad);
  useEffect(() => {
    const f = () => setI(leerIdentidad());
    window.addEventListener(evento, f);
    return () => window.removeEventListener(evento, f);
  }, []);
  return i;
}

/** Separa «Ana#1234» en { nombre: 'Ana', tag: '1234' } (tag null si es un nombre sin etiqueta). */
export function partirNombre(texto) {
  const m = /^(.*)#(\d{4})$/.exec(String(texto || ''));
  return m ? { nombre: m[1], tag: m[2] } : { nombre: String(texto || ''), tag: null };
}
