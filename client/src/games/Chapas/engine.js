// client/src/games/Chapas/engine.js
// «Fútbol chapas»: motor puro (salas online en server/routes/chapas.js y modo un móvil).
// Dos equipos de 3 chapas y un balón en un campo visto desde arriba. Por turnos, cada equipo lanza una de sus chapas
// (arrastrar y soltar): rebotes, choques y goles. Gana quien llegue antes a los goles pactados.
// Con más de 2 jugadores se reparten en dos equipos y dentro de cada equipo lanzan por turnos.
import { simular } from '../comun/fisica2d.js';

export const W = 60;
export const H = 100;
export const PORTERIA = 18;
export const RC = 3.2;
export const RB = 2.1;
export const VMAX = 62;
export const OPCIONES_GOLES = [2, 3, 5];
export const SEG_TURNO = 30;
const MAX_TIROS = 70;

const jug = (p, id) => p.jugadores.find((j) => j.id === id);

/** Colocación inicial: el equipo 0 defiende la portería de abajo (y = H) y ataca hacia arriba. */
export function colocacion() {
  const c = [{ id: 'balon', x: W / 2, y: H / 2, r: RB, m: 0.45 }];
  const pos = [[W / 2, H - 13], [W / 2 - 15, H - 30], [W / 2 + 15, H - 30]];
  pos.forEach(([x, y], i) => c.push({ id: `e0c${i}`, x, y, r: RC, m: 1 }));
  pos.forEach(([x, y], i) => c.push({ id: `e1c${i}`, x: W - x, y: H - y, r: RC, m: 1 }));
  [[W / 2 - PORTERIA / 2, 0], [W / 2 + PORTERIA / 2, 0], [W / 2 - PORTERIA / 2, H], [W / 2 + PORTERIA / 2, H]]
    .forEach(([x, y], i) => c.push({ id: `poste${i}`, x, y, r: 0.9, m: Infinity }));
  return c.map((x) => ({ ...x, vx: 0, vy: 0 }));
}

function paredes(cs) {
  for (const c of cs) {
    if (c.m === Infinity) continue;
    if (c.x < c.r) { c.x = c.r; c.vx = Math.abs(c.vx) * 0.72; }
    if (c.x > W - c.r) { c.x = W - c.r; c.vx = -Math.abs(c.vx) * 0.72; }
    const enBoca = c.id === 'balon' && Math.abs(c.x - W / 2) < PORTERIA / 2 - 0.9;
    if (!enBoca) {
      if (c.y < c.r) { c.y = c.r; c.vy = Math.abs(c.vy) * 0.72; }
      if (c.y > H - c.r) { c.y = H - c.r; c.vy = -Math.abs(c.vy) * 0.72; }
    }
  }
}
const evento = (cs) => {
  const b = cs[0];
  if (b.y < 0) return { gol: 0 }; // el centro del balón cruza la línea de arriba: marca el equipo 0
  if (b.y > H) return { gol: 1 };
  return null;
};

/** Simula un tiro (lo usan el servidor y los móviles para animarlo). tiro = { chapa, vx, vy } */
export function simularTiro(posiciones, tiro) {
  const cs = colocacion().map((c) => ({ ...c, ...(posiciones[c.id] ? { x: posiciones[c.id][0], y: posiciones[c.id][1] } : {}) }));
  const c = cs.find((x) => x.id === tiro.chapa);
  if (c) { c.vx = tiro.vx; c.vy = tiro.vy; }
  return simular(cs, { roce: 24, rebote: 0.88, paredes, evento, pasosMax: 720 });
}
const aPosiciones = (cs) => Object.fromEntries(cs.filter((c) => c.m !== Infinity).map((c) => [c.id, [c.x, c.y]]));

export function crearPartida(jugadores, items = [], reglas = {}, ahora = Date.now()) {
  const goles = OPCIONES_GOLES.includes(reglas.goles) ? reglas.goles : 3;
  const p = {
    fase: 'turno', goles, marcador: [0, 0], tiros: 0, n: 0,
    jugadores: jugadores.map((j, i) => ({ id: j.id, nombre: j.nombre, equipo: i % 2, fuera: false })),
    posiciones: aPosiciones(colocacion()), turno: { equipo: 0, idx: [0, 0] }, ultimo: null, fin: null,
    limite: ahora + SEG_TURNO * 1000
  };
  return p;
}

const delEquipo = (p, e) => p.jugadores.filter((j) => j.equipo === e && !j.fuera);
export function jugadorDeTurno(p) {
  const lista = delEquipo(p, p.turno.equipo);
  if (!lista.length) return null;
  return lista[p.turno.idx[p.turno.equipo] % lista.length].id;
}
function pasarTurno(p, equipo, ahora, espera = 0) {
  p.turno.idx[p.turno.equipo] += 1;
  p.turno.equipo = equipo;
  p.limite = ahora + espera + SEG_TURNO * 1000;
}

export function tirar(p, id, d, ahora = Date.now()) {
  if (p.fase !== 'turno') return { ok: false, error: 'Ahora no.' };
  const quien = id == null || id < 0 ? jugadorDeTurno(p) : id;
  if (quien !== jugadorDeTurno(p)) return { ok: false, error: 'No es tu turno.' };
  const chapa = String(d.chapa || '');
  if (!chapa.startsWith(`e${p.turno.equipo}c`) || !p.posiciones[chapa]) return { ok: false, error: 'Esa chapa no es tuya.' };
  let vx = Number(d.vx) || 0; let vy = Number(d.vy) || 0;
  const v = Math.sqrt(vx * vx + vy * vy);
  if (v < 3) return { ok: false, error: 'Tira con algo más de fuerza.' };
  if (v > VMAX) { vx = (vx / v) * VMAX; vy = (vy / v) * VMAX; }
  const tiro = { chapa, vx: Math.round(vx * 1000) / 1000, vy: Math.round(vy * 1000) / 1000 };
  const antes = p.posiciones;
  const r = simularTiro(antes, tiro);
  p.n += 1; p.tiros += 1;
  const anim = Math.round((r.frames.length / 30) * 1000);
  p.ultimo = { n: p.n, de: quien, antes, tiro, gol: r.evento?.gol ?? null, ms: anim };
  if (r.evento) {
    const e = r.evento.gol;
    p.marcador[e] += 1;
    p.posiciones = aPosiciones(colocacion());
    if (p.marcador[e] >= p.goles) return terminar(p), { ok: true };
    pasarTurno(p, 1 - e, ahora, anim + 1500); // saca quien ha encajado
  } else {
    p.posiciones = aPosiciones(r.cuerpos);
    pasarTurno(p, 1 - p.turno.equipo, ahora, anim);
  }
  if (p.tiros >= MAX_TIROS) terminar(p);
  return { ok: true };
}

export function terminar(p) {
  const [a, b] = p.marcador;
  const ganador = a === b ? null : a > b ? 0 : 1;
  const tabla = p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: p.marcador[j.equipo], equipo: j.equipo, fuera: j.fuera }))
    .sort((x, y) => y.puntos - x.puntos);
  tabla.forEach((t) => { t.puesto = ganador === null || t.equipo === ganador ? 1 : 2; });
  p.fase = 'fin';
  p.fin = { tabla, max: Math.max(a, b), ganadores: p.jugadores.filter((j) => !j.fuera && (ganador === null || j.equipo === ganador)).map((j) => j.id) };
  return { ok: true };
}

export function tick(p, ahora = Date.now()) {
  if (p.fase === 'turno' && ahora > p.limite) { p.n += 1; p.ultimo = { n: p.n, salto: true, de: jugadorDeTurno(p) }; pasarTurno(p, 1 - p.turno.equipo, ahora); }
}
export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id); if (!j || p.fase === 'fin') return;
  j.fuera = true;
  if (!delEquipo(p, j.equipo).length) { p.marcador[1 - j.equipo] = Math.max(p.marcador[1 - j.equipo], p.marcador[j.equipo] + 1); terminar(p); return; }
  if (!jugadorDeTurno(p)) pasarTurno(p, 1 - p.turno.equipo, ahora);
}
export function accion(p, id, d, ahora = Date.now()) {
  if (d.tipo === 'tirar') return tirar(p, id, d, ahora);
  return null;
}
export const forzar = (p, ahora = Date.now()) => { if (p.fase === 'turno') pasarTurno(p, 1 - p.turno.equipo, ahora); return { ok: true }; };
export const turnoLocal = () => null;

export function vistaDe(p, id, ahora = Date.now()) {
  const yo = jug(p, id);
  return {
    fase: p.fase, goles: p.goles, marcador: p.marcador, posiciones: p.posiciones, ultimo: p.ultimo, limite: p.limite, ahora, tiros: p.tiros,
    turnoEquipo: p.turno.equipo, turno: jugadorDeTurno(p), ronda: p.tiros + 1, rondas: MAX_TIROS,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, equipo: j.equipo, puntos: p.marcador[j.equipo], fuera: j.fuera })),
    yo: yo ? { id: yo.id, equipo: yo.equipo } : null, fin: p.fin
  };
}
