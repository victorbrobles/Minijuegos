// client/src/games/Habilidad/engine.js
// «Test de habilidad»: una serie de minijuegos elegidos por el anfitrión. Online todos juegan a la vez cada minijuego
// (con la misma semilla); en un solo móvil, por turnos. Tras cada uno, la tabla de ese juego y los puntos por puesto
// (10, 8, 6, 5, 4, 3, 2, 1) que se acumulan hasta el final.
import { IDS, DATOS, OPCIONES_N } from './catalogo.js';

export const PUNTOS = [10, 8, 6, 5, 4, 3, 2, 1];
export const MARGEN_ONLINE = 40; // segundos extra sobre la duración del minijuego (instrucciones, cuenta atrás…)
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);

/** Lista de juegos: los elegidos (en orden) y, si faltan, al azar sin repetir. */
export function completarLista(elegidos = [], n = 5, azar = Math.random) {
  const lista = [...new Set(elegidos.filter((id) => IDS.includes(id)))].slice(0, n);
  const resto = IDS.filter((id) => !lista.includes(id)).sort(() => azar() - 0.5);
  while (lista.length < n && resto.length) lista.push(resto.shift());
  return lista;
}

export function crearPartida(jugadores, items = [], reglas = {}, ahora = Date.now()) {
  const n = OPCIONES_N.includes(reglas.n) ? reglas.n : 5;
  const ids = items.length ? items : completarLista(reglas.juegos, n);
  const p = {
    fase: 'jugando', i: 0, lista: ids.map((id) => ({ id, semilla: Math.floor(Math.random() * 2 ** 31) })), reglas: { online: Boolean(reglas.online) },
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, victorias: 0, fuera: false })), res: {}, historial: [], ultimo: null, limite: null, fin: null
  };
  empezar(p, ahora);
  return p;
}

function empezar(p, ahora) {
  p.fase = 'jugando'; p.res = {};
  const d = DATOS[p.lista[p.i].id];
  p.limite = p.reglas.online ? ahora + (d.duracion + MARGEN_ONLINE) * 1000 : null;
}

export function resultado(p, id, valor, ahora = Date.now()) {
  if (p.fase !== 'jugando') return { ok: false, error: 'Ahora no.' };
  const actor = id ?? turnoLocal(p);
  const j = jug(p, actor);
  if (!j || j.fuera) return { ok: false, error: 'No estás en la partida.' };
  if (p.res[actor] !== undefined) return { ok: true };
  const v = Number(valor);
  p.res[actor] = Number.isFinite(v) ? Math.max(-1e6, Math.min(1e6, v)) : null;
  if (activos(p).every((x) => p.res[x.id] !== undefined)) cerrar(p);
  return { ok: true };
}

function cerrar(p) {
  const juego = p.lista[p.i]; const mejor = DATOS[juego.id].mejor;
  const conValor = activos(p).filter((j) => p.res[j.id] != null).sort((a, b) => (mejor === 'menos' ? p.res[a.id] - p.res[b.id] : p.res[b.id] - p.res[a.id]));
  let puesto = 0; let previo;
  const tabla = conValor.map((j, i) => { if (p.res[j.id] !== previo) { puesto = i + 1; previo = p.res[j.id]; } const pts = PUNTOS[puesto - 1] ?? 0; return { id: j.id, nombre: j.nombre, valor: p.res[j.id], puesto, pts }; });
  activos(p).filter((j) => p.res[j.id] == null).forEach((j) => tabla.push({ id: j.id, nombre: j.nombre, valor: null, puesto: null, pts: 0 }));
  tabla.forEach((t) => { const j = jug(p, t.id); j.puntos += t.pts; if (t.puesto === 1) j.victorias += 1; });
  p.ultimo = { juego: juego.id, tabla }; p.historial.push(p.ultimo);
  p.fase = 'resultados'; p.limite = null;
}

export function siguiente(p, ahora = Date.now()) {
  if (p.fase !== 'resultados') return { ok: false, error: 'Ahora no.' };
  if (p.i + 1 >= p.lista.length) return terminar(p);
  p.i += 1; empezar(p, ahora);
  return { ok: true };
}

export function terminar(p) {
  const tabla = p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, victorias: j.victorias, fuera: j.fuera }))
    .sort((a, b) => Number(a.fuera) - Number(b.fuera) || b.puntos - a.puntos || b.victorias - a.victorias);
  let puesto = 0; let previo = null;
  tabla.forEach((t, i) => { if (t.puntos !== previo) { puesto = i + 1; previo = t.puntos; } t.puesto = puesto; });
  const max = Math.max(0, ...tabla.filter((t) => !t.fuera).map((t) => t.puntos));
  p.fase = 'fin'; p.limite = null;
  p.fin = { tabla, max, ganadores: tabla.filter((t) => !t.fuera && t.puntos === max).map((t) => t.id) };
  return { ok: true };
}

export function forzar(p, ahora = Date.now()) {
  if (p.fase === 'jugando') { cerrar(p); return { ok: true }; }
  if (p.fase === 'resultados') return siguiente(p, ahora);
  return { ok: true };
}
export function tick(p, ahora = Date.now()) { if (p.fase === 'jugando' && p.limite && ahora >= p.limite) cerrar(p); }
export function abandonar(p, id) {
  const j = jug(p, id); if (!j || p.fase === 'fin') return;
  j.fuera = true;
  if (!activos(p).length) { terminar(p); return; }
  if (p.fase === 'jugando' && activos(p).every((x) => p.res[x.id] !== undefined)) cerrar(p);
}
export function accion(p, id, d, ahora = Date.now()) {
  switch (d.tipo) {
    case 'resultado': return resultado(p, id, d.valor, ahora);
    case 'siguiente': return siguiente(p, ahora);
    default: return null;
  }
}
/** En un solo móvil, cada uno juega su turno en privado (los demás no deberían mirar… ¡o sí!). */
export function turnoLocal(p) {
  if (p.fase !== 'jugando') return null;
  return activos(p).find((j) => p.res[j.id] === undefined)?.id ?? null;
}
export function vistaDe(p, id, ahora = Date.now()) {
  const yo = jug(p, id);
  return {
    fase: p.fase, i: p.i, total: p.lista.length, actual: p.lista[p.i], lista: p.lista.map((x) => x.id), ronda: p.i + 1, rondas: p.lista.length,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, victorias: j.victorias, fuera: j.fuera, hecho: p.res[j.id] !== undefined })),
    yo: yo ? { id: yo.id, hecho: p.res[yo.id] !== undefined } : null, ultimo: p.ultimo, limite: p.limite, ahora, fin: p.fin
  };
}
