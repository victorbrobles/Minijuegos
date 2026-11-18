// client/src/games/Curling/engine.js
// «Curling»: motor puro (salas online en server/routes/curling.js y modo un móvil).
// Pista de hielo vista desde arriba con la diana («casa») al fondo. Por turnos, cada jugador lanza sus piedras:
// apunta, elige el efecto (la piedra se curva al frenar) y para la barra de fuerza en el punto justo. Se puede
// sacar de la diana las piedras de los rivales. Al acabar cada manga puntúa quien tenga la piedra más cerca del
// centro: un punto por cada piedra suya más cerca que la mejor de cualquier rival.
import { simular } from '../comun/fisica2d.js';

export const W = 34;
export const L = 150;
export const CASA = { x: W / 2, y: 125, r: 12 };
export const ANILLOS = [12, 8, 4, 1.4];
export const HOG = 92; // la piedra tiene que pasar esta línea
export const FONDO = 139; // pasada esta línea, fuera
export const R = 1.45;
export const SALIDA = { x: W / 2, y: 8 };
export const OPCIONES_MANGAS = [2, 3, 4];
export const SEG_TURNO = 35;
const ROCE = 2.6;

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);

function paredes(cs) {
  for (const c of cs) {
    if (c.fuera) continue;
    if (c.x < c.r || c.x > W - c.r || c.y > FONDO + c.r) { c.fuera = true; c.vx = 0; c.vy = 0; }
  }
}

/** Velocidad inicial a partir de la fuerza (0-100). */
export const velocidad = (pot) => 17 + (Math.max(0, Math.min(100, pot)) / 100) * 15;

/**
 * Simula un lanzamiento. piedras: [{ id, de, x, y }], tiro = { vx, vy, efecto (-1, 0, 1) }. Mismo resultado en todos lados.
 */
export function simularLanzamiento(piedras, tiro, de) {
  const cs = [{ id: 'nueva', de, x: SALIDA.x, y: SALIDA.y, vx: tiro.vx, vy: tiro.vy, r: R, m: 1 }, ...piedras.map((s) => ({ ...s, vx: 0, vy: 0, r: R, m: 1 }))];
  const efecto = tiro.efecto || 0;
  const fuerza = (c, dt) => {
    if (c.id !== 'nueva' || !efecto) return;
    const v = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
    if (v < 0.3) return;
    // Se curva más cuanto más despacio va (como en el hielo de verdad)
    const a = efecto * 0.22 * (1.35 - v / 32);
    const px = c.vy / v; const py = -c.vx / v; // perpendicular (hacia la derecha de la marcha)
    c.vx += px * a * dt; c.vy += py * a * dt;
  };
  const r = simular(cs, { roce: ROCE, rebote: 0.85, paredes, fuerza, pasosMax: 60 * 16, cadaFrame: 3 });
  // Si la lanzada no pasa la línea de juego, se retira
  const nueva = r.cuerpos[0];
  if (!nueva.fuera && nueva.y < HOG && !nueva.toco) nueva.fuera = true;
  return r;
}

export const distancia = (s) => Math.sqrt((s.x - CASA.x) * (s.x - CASA.x) + (s.y - CASA.y) * (s.y - CASA.y));

/** Puntos de la manga: { ganador, puntos } */
export function puntuarManga(piedras) {
  const en = piedras.filter((s) => distancia(s) <= CASA.r + R).sort((a, b) => distancia(a) - distancia(b));
  if (!en.length) return { ganador: null, puntos: 0 };
  const g = en[0].de;
  const mejorRival = en.find((s) => s.de !== g);
  const puntos = en.filter((s) => s.de === g && (!mejorRival || distancia(s) < distancia(mejorRival))).length;
  return { ganador: g, puntos };
}

export function crearPartida(jugadores, items = [], reglas = {}, ahora = Date.now()) {
  const mangas = OPCIONES_MANGAS.includes(reglas.mangas) ? reglas.mangas : 3;
  const porJugador = jugadores.length <= 2 ? 4 : jugadores.length <= 4 ? 3 : 2;
  const p = {
    fase: 'turno', manga: 1, mangas, porJugador, n: 0, piedras: [], lanzadas: 0, contador: 0,
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, fuera: false })),
    orden: [], ultimo: null, resumen: null, fin: null, limite: 0
  };
  prepararManga(p, ahora, 0);
  return p;
}
function prepararManga(p, ahora, espera) {
  // Orden de lanzamiento: rota en cada manga (el último en tirar tiene ventaja)
  const ids = activos(p).map((j) => j.id);
  const k = (p.manga - 1) % ids.length;
  const base = [...ids.slice(k), ...ids.slice(0, k)];
  p.orden = [];
  for (let r = 0; r < p.porJugador; r++) p.orden.push(...base);
  p.lanzadas = 0; p.piedras = [];
  p.limite = ahora + espera + SEG_TURNO * 1000;
}
export const turnoDe = (p) => p.orden[p.lanzadas] ?? null;

export function lanzar(p, id, d, ahora = Date.now()) {
  if (p.fase !== 'turno') return { ok: false, error: 'Ahora no.' };
  const quien = id == null || id < 0 ? turnoDe(p) : id;
  if (quien !== turnoDe(p)) return { ok: false, error: 'No es tu turno.' };
  const ang = Math.max(-10, Math.min(10, Number(d.ang) || 0));
  const v = velocidad(Number(d.pot) || 0);
  const efecto = [-1, 0, 1].includes(Number(d.efecto)) ? Number(d.efecto) : 0;
  const rad = (ang * Math.PI) / 180;
  const tiro = { vx: Math.round(Math.sin(rad) * v * 1000) / 1000, vy: Math.round(Math.cos(rad) * v * 1000) / 1000, efecto, ang, pot: Number(d.pot) || 0 };
  const antes = p.piedras;
  const r = simularLanzamiento(antes, tiro, quien);
  p.contador += 1;
  const nuevas = r.cuerpos.filter((c) => !c.fuera).map((c) => ({ id: c.id === 'nueva' ? `p${p.contador}` : c.id, de: c.de, x: c.x, y: c.y }));
  p.piedras = nuevas; p.lanzadas += 1; p.n += 1;
  const ms = Math.round((r.frames.length / 40) * 1000); // los móviles lo reproducen a doble velocidad
  p.ultimo = { n: p.n, de: quien, antes, tiro, ms };
  if (p.lanzadas >= p.orden.length) cerrarManga(p, ahora, ms);
  else p.limite = ahora + ms + SEG_TURNO * 1000;
  return { ok: true };
}

function cerrarManga(p, ahora, espera = 0) {
  const res = puntuarManga(p.piedras);
  if (res.ganador != null) { const g = jug(p, res.ganador); if (g) g.puntos += res.puntos; }
  p.resumen = { manga: p.manga, ...res, nombre: res.ganador != null ? jug(p, res.ganador)?.nombre : null, piedras: p.piedras, hasta: ahora + espera + 5000 };
  p.fase = 'manga';
}

export function terminar(p) {
  const tabla = p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, fuera: j.fuera })).sort((a, b) => Number(a.fuera) - Number(b.fuera) || b.puntos - a.puntos);
  let puesto = 0; let previo = null;
  tabla.forEach((t, i) => { if (t.puntos !== previo) { puesto = i + 1; previo = t.puntos; } t.puesto = puesto; });
  const max = Math.max(0, ...tabla.filter((t) => !t.fuera).map((t) => t.puntos));
  p.fase = 'fin';
  p.fin = { tabla, max, ganadores: tabla.filter((t) => !t.fuera && t.puntos === max).map((t) => t.id) };
  return { ok: true };
}

export function tick(p, ahora = Date.now()) {
  if (p.fase === 'turno' && ahora > p.limite) {
    // Se le pasa el turno: pierde esa piedra
    p.n += 1; p.ultimo = { n: p.n, salto: true, de: turnoDe(p) }; p.lanzadas += 1;
    if (p.lanzadas >= p.orden.length) cerrarManga(p, ahora); else p.limite = ahora + SEG_TURNO * 1000;
  } else if (p.fase === 'manga' && ahora > p.resumen.hasta) {
    if (p.manga >= p.mangas) { terminar(p); return; }
    p.manga += 1; p.fase = 'turno'; p.resumen = null;
    prepararManga(p, ahora, 0);
  }
}
export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id); if (!j || p.fase === 'fin') return;
  j.fuera = true;
  if (activos(p).length < 2) { terminar(p); return; }
  p.orden = [...p.orden.slice(0, p.lanzadas), ...p.orden.slice(p.lanzadas).filter((x) => x !== id)];
  if (p.fase === 'turno' && p.lanzadas >= p.orden.length) cerrarManga(p, ahora);
}
export function accion(p, id, d, ahora = Date.now()) {
  if (d.tipo === 'lanzar') return lanzar(p, id, d, ahora);
  return null;
}
export function forzar(p, ahora = Date.now()) {
  if (p.fase === 'manga') { p.resumen.hasta = 0; tick(p, ahora); }
  else if (p.fase === 'turno') { p.limite = 0; tick(p, ahora); }
  return { ok: true };
}
export const turnoLocal = () => null;

export function vistaDe(p, id, ahora = Date.now()) {
  const yo = jug(p, id);
  const pendientes = Object.fromEntries(p.jugadores.map((j) => [j.id, p.orden.slice(p.lanzadas).filter((x) => x === j.id).length]));
  return {
    fase: p.fase, manga: p.manga, mangas: p.mangas, ronda: p.manga, rondas: p.mangas, piedras: p.piedras, turno: turnoDe(p), limite: p.limite, ahora,
    ultimo: p.ultimo, resumen: p.resumen, lanzadas: p.lanzadas, total: p.orden.length,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, fuera: j.fuera, quedan: pendientes[j.id] || 0 })),
    yo: yo ? { id: yo.id } : null, fin: p.fin
  };
}
