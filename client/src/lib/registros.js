// client/src/lib/registros.js
// Envío de resultados al servidor (salón de la fama) y lectura del salón y de los jugadores recientes.
import { useEffect, useRef, useState } from 'react';
import { etiquetar, leerIdentidad, partirNombre } from './identidad.js';
import { sonar } from './sonido.js';
import { silenciarFeedback } from './efectos.js';
import { comprobarLogros } from './logros.js';
import { registrarEnNoche } from './noche.js';

/**
 * Guarda una partida terminada. jugadores: [{ nombre, puntos (o null), gana }]. orden: 'desc' (más es mejor) o 'asc'.
 * No bloquea ni avisa si falla: los registros son un extra.
 */
export function registrarPartida(juego, jugadores, { orden = 'desc' } = {}) {
  if (!juego || !Array.isArray(jugadores) || !jugadores.length) return;
  try { registrarEnNoche(juego, jugadores, orden); } catch { /* la noche es un extra */ }
  try { sonidoFinal(jugadores); } catch { /* el sonido es un extra */ }
  try {
    fetch('/api/registros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Los nombres se ven sin etiqueta; al guardar se añade la tuya (y la de los recientes elegidos)
      body: JSON.stringify({ juego, orden, jugadores: jugadores.map((j) => ({ nombre: etiquetar(j.nombre), puntos: j.puntos ?? null, gana: Boolean(j.gana) })) }),
      keepalive: true
    }).then(() => setTimeout(comprobarLogros, 300)).catch(() => {});
  } catch { /* sin red */ }
}

/** Fanfarria si has ganado (o, si no juegas tú, si alguien gana) y un cierre suave si no. */
function sonidoFinal(jugadores) {
  const yo = (leerIdentidad()?.nombre || '').toLowerCase();
  const mio = jugadores.find((j) => partirNombre(String(j.nombre || '')).nombre.trim().toLowerCase() === yo);
  const gana = mio ? Boolean(mio.gana) : jugadores.some((j) => j.gana);
  silenciarFeedback(2000);
  sonar(gana ? 'victoria' : 'fin', { minimo: 3000 });
}

/** Registra una sola vez mientras el componente esté montado (pantallas finales). `clave` cambia por partida. */
export function useRegistrarPartida(juego, jugadores, opciones = {}, activo = true) {
  const hecho = useRef(null);
  const clave = activo && jugadores?.length ? `${juego}|${jugadores.map((j) => `${j.nombre}:${j.puntos}:${j.gana ? 1 : 0}`).join(',')}` : null;
  useEffect(() => {
    if (!clave || hecho.current === clave) return;
    hecho.current = clave;
    registrarPartida(juego, jugadores, opciones);
  }, [clave]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** A partir de una tabla final con { nombre, puntos } y la lista de ids ganadores. */
export const desdeTabla = (tabla = [], ganadores = []) => tabla
  .filter((j) => !j.fuera)
  .map((j) => ({ nombre: j.nombre, puntos: j.puntos ?? null, gana: ganadores.includes(j.id) }));

/** Ganadores por puntos (todos los empatados en cabeza; nadie si nadie suma). */
export function ganadoresPorPuntos(jugadores, { orden = 'desc' } = {}) {
  const conPuntos = jugadores.filter((j) => Number.isFinite(Number(j.puntos)));
  if (!conPuntos.length) return jugadores.map((j) => ({ ...j, gana: false }));
  const mejor = orden === 'asc' ? Math.min(...conPuntos.map((j) => j.puntos)) : Math.max(...conPuntos.map((j) => j.puntos));
  const vale = orden === 'asc' || mejor > 0;
  return jugadores.map((j) => ({ ...j, gana: vale && j.puntos === mejor }));
}

export function useSalon(juego) {
  const [salon, setSalon] = useState(null);
  useEffect(() => {
    let vivo = true;
    if (!juego) return undefined;
    fetch(`/api/registros/salon/${juego}`).then((r) => (r.ok ? r.json() : null)).then((d) => { if (vivo && d) setSalon(d); }).catch(() => {});
    return () => { vivo = false; };
  }, [juego]);
  return salon;
}

export function useRecientes() {
  const [lista, setLista] = useState([]);
  useEffect(() => {
    let vivo = true;
    fetch('/api/registros/recientes').then((r) => (r.ok ? r.json() : null)).then((d) => { if (vivo && d) setLista(d.jugadores || []); }).catch(() => {});
    return () => { vivo = false; };
  }, []);
  return lista;
}

/**
 * Resultado de una partida a partir de su vista final (`v.fin`). Sirve para casi todos los motores:
 * tabla con puntos, lista de ganadores, un único ganador (ganadorId / bingoId) o puntos por jugador (fin.puntos).
 * `gana(j, v)` permite decidir quién gana en juegos por equipos.
 */
export function resultadoDesdeFin(v, { gana } = {}) {
  const f = v?.fin || {};
  const ids = new Set([...(Array.isArray(f.ganadores) ? f.ganadores : []), f.ganadorId, f.bingoId].filter((x) => x != null));
  const base = Array.isArray(f.tabla) && f.tabla.length ? f.tabla : (v?.jugadores || []);
  return base
    .filter((j) => !j.fuera && !j.abandono)
    .map((j) => {
      const nombre = j.nombre ?? v.jugadores?.find((x) => x.id === j.id)?.nombre;
      const puntos = j.puntos ?? f.puntos?.[j.id] ?? null;
      return { nombre, puntos, gana: gana ? Boolean(gana(j, v)) : ids.has(j.id) };
    })
    .filter((j) => j.nombre);
}
