// client/src/games/Minigolf/engine.js
// «Minigolf»: motor de la partida (marcador y turnos). La bola la simula cada móvil (fisica.js) y avisa al motor
// con la acción 'estado' { golpes, pos, parada, embocada }.
// Online todos juegan el mismo hoyo a la vez; cuando todos acaban (o se agota el tiempo) se ve la tarjeta y se pasa
// al siguiente. En un solo móvil se juega por turnos, golpe a golpe.
import { generarHoyo } from './hoyos.js';

export const MAX_GOLPES = 10;
export const SEG_HOYO = 180;
export const SEG_RESUMEN = 10;
export const OPCIONES_HOYOS = [6, 9, 18];

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);

export function crearPartida(jugadores, items = [], reglas = {}, ahora = Date.now()) {
  const n = OPCIONES_HOYOS.includes(reglas.hoyos) ? reglas.hoyos : 18;
  // Del recorrido de 18 se toman n hoyos repartidos (si son 9, uno de cada dos; siempre acaba en el más difícil)
  const recorrido = items.length ? items.filter((_, i) => n === 18 || (n === 9 ? i % 2 === 1 : i % 3 === 2)).slice(0, n) : [];
  const p = {
    fase: 'jugando', hoyo: 0, recorrido, reglas: { online: Boolean(reglas.online) }, turno: 0, limite: null, fin: null,
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, golpes: 0, terminado: false, pos: null, tarjeta: [], total: 0, fuera: false }))
  };
  empezarHoyo(p, ahora);
  return p;
}

const parDe = (p, i) => generarHoyo(p.recorrido[i].n, p.recorrido[i].semilla).par;

function empezarHoyo(p, ahora) {
  p.fase = 'jugando';
  p.jugadores.forEach((j) => { j.golpes = 0; j.terminado = j.fuera; j.pos = null; });
  p.turno = Math.max(0, p.jugadores.findIndex((j) => !j.fuera));
  p.limite = p.reglas.online ? ahora + SEG_HOYO * 1000 : null;
}

function acabarJugador(j, golpes) {
  if (j.terminado) return;
  j.terminado = true;
  j.golpes = Math.min(MAX_GOLPES, golpes);
  j.tarjeta.push(j.golpes);
  j.total += j.golpes;
}

function revisarFinHoyo(p, ahora) {
  if (activos(p).every((j) => j.terminado)) {
    p.fase = 'resumen';
    p.limite = p.reglas.online ? ahora + SEG_RESUMEN * 1000 : null;
  }
}

function siguienteTurno(p) {
  const n = p.jugadores.length;
  for (let k = 1; k <= n; k++) { const i = (p.turno + k) % n; if (!p.jugadores[i].terminado) { p.turno = i; return; } }
}

/** El móvil cuenta cómo va su bola. */
export function estado(p, id, d = {}, ahora = Date.now()) {
  if (p.fase !== 'jugando') return { ok: false, error: 'Ahora no se juega.' };
  const local = !p.reglas.online;
  const j = local ? p.jugadores[p.turno] : jug(p, id);
  if (!j || j.fuera || j.terminado) return { ok: false, error: 'Ya has terminado este hoyo.' };
  const golpes = Math.max(j.golpes, Math.min(MAX_GOLPES + 1, Math.round(Number(d.golpes) || 0)));
  j.golpes = golpes;
  if (Array.isArray(d.pos) && d.pos.length === 3 && d.pos.every(Number.isFinite)) j.pos = d.pos.map((x) => Math.round(x * 100) / 100);
  if (d.embocada) acabarJugador(j, golpes);
  else if (d.parada && golpes >= MAX_GOLPES) acabarJugador(j, MAX_GOLPES);
  if (local && (d.parada || d.embocada)) siguienteTurno(p);
  revisarFinHoyo(p, ahora);
  return { ok: true };
}

export function siguiente(p, ahora = Date.now()) {
  if (p.fase !== 'resumen') return { ok: false, error: 'Ahora no.' };
  if (p.hoyo + 1 >= p.recorrido.length) return terminar(p);
  p.hoyo += 1;
  empezarHoyo(p, ahora);
  return { ok: true };
}

export function terminar(p) {
  const pares = p.recorrido.map((_, i) => parDe(p, i));
  const tabla = p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.total, golpes: j.total, tarjeta: j.tarjeta, fuera: j.fuera,
    vsPar: j.total - pares.slice(0, j.tarjeta.length).reduce((a, b) => a + b, 0) }))
    .sort((a, b) => Number(a.fuera) - Number(b.fuera) || a.puntos - b.puntos);
  let puesto = 0; let previo = null;
  tabla.forEach((t, i) => { if (t.puntos !== previo) { puesto = i + 1; previo = t.puntos; } t.puesto = puesto; });
  const min = Math.min(...tabla.filter((t) => !t.fuera).map((t) => t.puntos));
  p.fase = 'fin'; p.limite = null;
  p.fin = { tabla, max: min, ganadores: tabla.filter((t) => !t.fuera && t.puntos === min).map((t) => t.id), pares };
  return { ok: true };
}

/** Se acaba el tiempo del hoyo: quien no haya embocado se apunta el máximo. El anfitrión puede adelantarlo. */
export function forzar(p, ahora = Date.now()) {
  if (p.fase === 'jugando') { activos(p).forEach((j) => acabarJugador(j, MAX_GOLPES)); revisarFinHoyo(p, ahora); return { ok: true }; }
  if (p.fase === 'resumen') return siguiente(p, ahora);
  return { ok: true };
}
export function tick(p, ahora = Date.now()) {
  if (p.limite && ahora >= p.limite) forzar(p, ahora);
}
export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j || p.fase === 'fin') return;
  j.fuera = true; j.terminado = true;
  if (activos(p).length < 1) { terminar(p); return; }
  if (p.jugadores[p.turno]?.id === id) siguienteTurno(p);
  if (p.fase === 'jugando') revisarFinHoyo(p, ahora);
}

export function accion(p, id, d, ahora = Date.now()) {
  switch (d.tipo) {
    case 'estado': return estado(p, id, d, ahora);
    case 'siguiente': return siguiente(p, ahora);
    default: return null;
  }
}
export function turnoLocal() { return null; }

export function vistaDe(p, id, ahora = Date.now()) {
  const yo = jug(p, id);
  return {
    fase: p.fase, hoyo: p.hoyo, hoyos: p.recorrido.length, actual: p.recorrido[p.hoyo] || null, recorrido: p.recorrido, online: p.reglas.online,
    ronda: p.hoyo + 1, rondas: p.recorrido.length, ahora, limite: p.limite,
    turno: p.reglas.online ? null : p.jugadores[p.turno]?.id ?? null,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, golpes: j.golpes, terminado: j.terminado, pos: j.pos, tarjeta: j.tarjeta, total: j.total, puntos: j.total + (j.terminado ? 0 : j.golpes), fuera: j.fuera })),
    yo: yo ? { id: yo.id } : null, fin: p.fin
  };
}
