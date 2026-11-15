// client/src/games/Canicas/engine.js
// «Carrera de Canicas» online: elegir canica → cuenta atrás → carrera → podio (y otra carrera o el final).
// Cada móvil simula su canica y se sincroniza ~8 veces por segundo (sincronizar): manda su posición y recibe la de
// los demás, los rayos lanzados y las manchas de aceite. El servidor reparte los puntos por puesto.
import { IDS_CANICAS } from './canicas.js';

export const SEG_ELEGIR = 25;
export const SEG_CUENTA = 4;
export const SEG_MAX = 240;
export const SEG_TRAS_PRIMERO = 35;
export const SEG_PODIO = 15;
export const PUNTOS = [10, 8, 6, 5, 4, 3, 2, 1];
export const OPCIONES_CARRERAS = [1, 3];

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);

export function crearPartida(jugadores, items = [], reglas = {}, ahora = Date.now()) {
  const n = OPCIONES_CARRERAS.includes(reglas.carreras) ? reglas.carreras : 3;
  const p = {
    fase: 'elegir', carrera: 0, circuitos: items.slice(0, n), limite: ahora + SEG_ELEGIR * 1000, inicio: null, primera: null,
    jugadores: jugadores.map((j, i) => ({ id: j.id, nombre: j.nombre, orden: i, canica: null, s: null, llegada: null, puntos: 0, resultados: [], fuera: false })),
    eventos: [], nEv: 0, trampas: [], nTr: 0, resultados: null, fin: null
  };
  return p;
}

function empezarCuenta(p, ahora) {
  p.jugadores.forEach((j) => { if (!j.canica) j.canica = IDS_CANICAS[Math.floor(Math.random() * IDS_CANICAS.length)]; j.s = null; j.llegada = null; });
  p.fase = 'cuenta'; p.inicio = ahora + SEG_CUENTA * 1000; p.limite = null; p.primera = null; p.trampas = []; p.eventos = [];
}

export function elegir(p, id, canica, ahora = Date.now()) {
  if (p.fase !== 'elegir') return { ok: false, error: 'Ya ha empezado.' };
  const j = jug(p, id);
  if (!j || !IDS_CANICAS.includes(canica)) return { ok: false, error: 'Canica no válida.' };
  j.canica = canica;
  if (activos(p).every((x) => x.canica)) empezarCuenta(p, ahora);
  return { ok: true };
}

export function llegada(p, id, ahora = Date.now()) {
  if (p.fase !== 'carrera') return { ok: false, error: 'No hay carrera.' };
  const j = jug(p, id);
  if (!j || j.llegada) return { ok: true };
  j.llegada = ahora - p.inicio;
  if (!p.primera) p.primera = ahora;
  if (activos(p).every((x) => x.llegada)) cerrarCarrera(p, ahora);
  return { ok: true };
}

function cerrarCarrera(p, ahora) {
  const orden = [...activos(p)].sort((a, b) => (a.llegada && b.llegada ? a.llegada - b.llegada : a.llegada ? -1 : b.llegada ? 1 : (b.s?.prog || 0) - (a.s?.prog || 0)));
  orden.forEach((j, i) => { const pts = PUNTOS[i] ?? 0; j.puntos += pts; j.resultados.push({ puesto: i + 1, tiempo: j.llegada, pts }); });
  p.resultados = orden.map((j, i) => ({ id: j.id, nombre: j.nombre, canica: j.canica, puesto: i + 1, tiempo: j.llegada, prog: j.s?.prog || 0, pts: PUNTOS[i] ?? 0 }));
  p.fase = 'podio'; p.limite = ahora + SEG_PODIO * 1000;
}

export function siguiente(p, ahora = Date.now()) {
  if (p.fase !== 'podio') return { ok: false, error: 'Ahora no.' };
  if (p.carrera + 1 >= p.circuitos.length) return terminar(p);
  p.carrera += 1; p.fase = 'elegir'; p.limite = ahora + SEG_ELEGIR * 1000; p.resultados = null;
  p.jugadores.forEach((j) => { j.canica = null; });
  return { ok: true };
}

export function terminar(p) {
  const tabla = p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, resultados: j.resultados, victorias: j.resultados.filter((r) => r.puesto === 1).length, fuera: j.fuera }))
    .sort((a, b) => Number(a.fuera) - Number(b.fuera) || b.puntos - a.puntos || b.victorias - a.victorias);
  let puesto = 0; let previo = null;
  tabla.forEach((t, i) => { if (t.puntos !== previo) { puesto = i + 1; previo = t.puntos; } t.puesto = puesto; });
  const max = Math.max(0, ...tabla.filter((t) => !t.fuera).map((t) => t.puntos));
  p.fase = 'fin'; p.limite = null;
  p.fin = { tabla, max, ganadores: tabla.filter((t) => !t.fuera && t.puntos === max).map((t) => t.id) };
  return { ok: true };
}

/** Rayo (frena a los que van por delante) o mancha de aceite. */
export function objeto(p, id, d, ahora = Date.now()) {
  if (p.fase !== 'carrera') return { ok: false, error: 'No hay carrera.' };
  const j = jug(p, id); if (!j) return { ok: false };
  if (d.objeto === 'rayo') { p.nEv += 1; p.eventos.push({ n: p.nEv, tipo: 'rayo', de: id, prog: j.s?.prog || 0, t: ahora }); }
  if (d.objeto === 'aceite' && Array.isArray(d.pos) && d.pos.length === 3) {
    p.nTr += 1; p.trampas.push({ id: p.nTr, pos: d.pos.map(Number), de: id, hasta: ahora + 40000 });
    if (p.trampas.length > 30) p.trampas.shift();
  }
  if (d.objeto === 'pisada') p.trampas = p.trampas.filter((t) => t.id !== Number(d.trampa));
  p.eventos = p.eventos.filter((e) => ahora - e.t < 10000);
  return { ok: true };
}

/** Sincronización rápida: el móvil manda su estado y recibe el de los demás. */
export function sincronizar(p, id, s, desde = 0, ahora = Date.now()) {
  const j = jug(p, id);
  if (j && s && Array.isArray(s.p) && s.p.length === 3 && p.fase === 'carrera') {
    j.s = { p: s.p.map((x) => Math.round(x * 100) / 100), v: (s.v || [0, 0, 0]).map((x) => Math.round(x * 100) / 100), prog: Math.max(0, Math.min(1, Number(s.prog) || 0)), t: ahora };
  }
  return {
    t: ahora, fase: p.fase, inicio: p.inicio,
    otros: p.jugadores.filter((x) => x.id !== id && !x.fuera).map((x) => ({ id: x.id, canica: x.canica, s: x.s, llegada: x.llegada })),
    eventos: p.eventos.filter((e) => e.n > desde), trampas: p.trampas.filter((t) => t.hasta > ahora)
  };
}

export function forzar(p, ahora = Date.now()) {
  if (p.fase === 'elegir') { empezarCuenta(p, ahora); return { ok: true }; }
  if (p.fase === 'carrera') { cerrarCarrera(p, ahora); return { ok: true }; }
  if (p.fase === 'podio') return siguiente(p, ahora);
  return { ok: true };
}
export function tick(p, ahora = Date.now()) {
  if (p.fase === 'elegir' && ahora >= p.limite) empezarCuenta(p, ahora);
  else if (p.fase === 'cuenta' && ahora >= p.inicio) p.fase = 'carrera';
  else if (p.fase === 'carrera' && ((p.primera && ahora - p.primera > SEG_TRAS_PRIMERO * 1000) || ahora - p.inicio > SEG_MAX * 1000)) cerrarCarrera(p, ahora);
  else if (p.fase === 'podio' && ahora >= p.limite) siguiente(p, ahora);
}
export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id); if (!j || p.fase === 'fin') return;
  j.fuera = true;
  if (!activos(p).length) { terminar(p); return; }
  if (p.fase === 'elegir' && activos(p).every((x) => x.canica)) empezarCuenta(p, ahora);
  if (p.fase === 'carrera' && activos(p).every((x) => x.llegada)) cerrarCarrera(p, ahora);
}
export function accion(p, id, d, ahora = Date.now()) {
  switch (d.tipo) {
    case 'canica': return elegir(p, id, d.canica, ahora);
    case 'llegada': return llegada(p, id, ahora);
    case 'objeto': return objeto(p, id, d, ahora);
    case 'siguiente': return siguiente(p, ahora);
    default: return null;
  }
}
export function turnoLocal() { return null; }
export function vistaDe(p, id, ahora = Date.now()) {
  const yo = jug(p, id);
  return {
    fase: p.fase, carrera: p.carrera, carreras: p.circuitos.length, circuito: p.circuitos[p.carrera], ronda: p.carrera + 1, rondas: p.circuitos.length,
    inicio: p.inicio, ahora, limite: p.limite, resultados: p.resultados, fin: p.fin,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, orden: j.orden, canica: j.canica, llegada: j.llegada, puntos: j.puntos, fuera: j.fuera })),
    yo: yo ? { id: yo.id, orden: yo.orden, canica: yo.canica } : null
  };
}
