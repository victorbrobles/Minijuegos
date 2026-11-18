// client/src/games/Artilleria/engine.js
// «Artillería»: motor puro (salas online en server/routes/artilleria.js y modo un móvil).
// Cada jugador tiene un tanque sobre un terreno de colinas que se puede destrozar. Por turnos se elige ángulo, fuerza y
// munición; el viento cambia en cada turno. Las explosiones hacen cráteres y quitan vida según la cercanía.
// Gana el último tanque en pie (o el que más vida tenga si se acaban los turnos).
export const W = 240;
export const H = 150;
export const PASO = 2; // metros entre puntos del terreno
export const G = 32;
export const SEG_TURNO = 35;
export const ARMAS = {
  normal: { nombre: 'Obús', emoji: '💣', radio: 11, dano: 45, usos: Infinity },
  gorda: { nombre: 'Megabomba', emoji: '💥', radio: 17, dano: 60, usos: 2 },
  triple: { nombre: 'Triple', emoji: '🎆', radio: 8, dano: 30, usos: 2 }
};
export const IDS_ARMAS = Object.keys(ARMAS);
const VIDA = 100;

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const vivos = (p) => p.jugadores.filter((j) => j.vida > 0 && !j.fuera);

/** Altura del terreno en x (interpolada). */
export function altura(terreno, x) {
  const i = x / PASO; const a = Math.floor(i);
  if (a < 0) return terreno[0];
  if (a >= terreno.length - 1) return terreno[terreno.length - 1];
  const f = i - a;
  return terreno[a] * (1 - f) + terreno[a + 1] * f;
}

function generarTerreno() {
  const n = W / PASO + 1;
  const f = [0.013 + Math.random() * 0.01, 0.035 + Math.random() * 0.02, 0.08 + Math.random() * 0.04];
  const fase = f.map(() => Math.random() * 6.28);
  const amp = [22 + Math.random() * 12, 9 + Math.random() * 6, 3 + Math.random() * 3];
  const base = 38 + Math.random() * 14;
  return Array.from({ length: n }, (_, i) => {
    const x = i * PASO;
    const h = base + f.reduce((s, fr, k) => s + amp[k] * Math.sin(x * fr + fase[k]), 0);
    return Math.round(Math.max(12, Math.min(95, h)) * 100) / 100;
  });
}

export function crearPartida(jugadores, items = [], reglas = {}, ahora = Date.now()) {
  const terreno = generarTerreno();
  const n = jugadores.length;
  const huecos = Array.from({ length: n }, (_, i) => 18 + (i * (W - 36)) / Math.max(1, n - 1));
  const orden = huecos.sort(() => Math.random() - 0.5);
  const p = {
    fase: 'turno', terreno, viento: 0, n: 0, turnos: 0, maxTurnos: Math.max(16, n * 10),
    jugadores: jugadores.map((j, i) => ({ id: j.id, nombre: j.nombre, x: Math.round(orden[i] * 10) / 10, vida: VIDA, armas: { gorda: 2, triple: 2 }, fuera: false, ang: orden[i] < W / 2 ? 50 : 130, pot: 60 })),
    turno: null, ultimo: null, fin: null, limite: 0
  };
  p.turno = p.jugadores[Math.floor(Math.random() * n)].id;
  nuevoTurno(p, ahora, 0);
  return p;
}
function nuevoTurno(p, ahora, espera) {
  p.viento = Math.round((Math.random() * 2 - 1) * 10);
  p.limite = ahora + espera + SEG_TURNO * 1000;
}
function siguiente(p) {
  const orden = p.jugadores.filter((j) => j.vida > 0 && !j.fuera);
  if (!orden.length) return null;
  const todos = p.jugadores;
  const i = todos.findIndex((j) => j.id === p.turno);
  for (let k = 1; k <= todos.length; k++) { const j = todos[(i + k) % todos.length]; if (j.vida > 0 && !j.fuera) return j.id; }
  return orden[0].id;
}

const posTanque = (terreno, j) => ({ x: j.x, y: altura(terreno, j.x) });

/**
 * Simula un disparo sobre un terreno (lo usan el servidor y los móviles para animarlo; mismo resultado en todos).
 * estado = { terreno, tanques: [{ id, x, vida }] }, tiro = { de, arma, vs: [[vx, vy]...], viento, x0, y0 }
 */
export function simularDisparo(estado, tiro) {
  const terreno = [...estado.terreno];
  const tanques = estado.tanques.map((t) => ({ ...t }));
  const arma = ARMAS[tiro.arma] || ARMAS.normal;
  const dt = 1 / 120;
  const proyectiles = tiro.vs.map(([vx0, vy0]) => {
    let x = tiro.x0; let y = tiro.y0; let vx = vx0; let vy = vy0;
    const frames = [[x, y]]; let impacto = null;
    for (let s = 1; s <= 120 * 14; s++) {
      vx += tiro.viento * 0.55 * dt; vy -= G * dt;
      x += vx * dt; y += vy * dt;
      if (s % 4 === 0) frames.push([Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
      if (x < -8 || x > W + 8 || y < -30) break;
      const golpe = tanques.find((t) => t.vida > 0 && (s > 25 || t.id !== tiro.de) && (x - t.x) * (x - t.x) + (y - (altura(terreno, t.x) + 2.5)) * (y - (altura(terreno, t.x) + 2.5)) < 4.5 * 4.5);
      if (golpe || (x >= 0 && x <= W && y <= altura(terreno, x))) {
        impacto = { x: Math.round(x * 100) / 100, y: Math.round((golpe ? y : altura(terreno, x)) * 100) / 100, frame: frames.length };
        frames.push([impacto.x, impacto.y]);
        break;
      }
    }
    return { frames, impacto };
  });
  // Explosiones: cráteres y daño
  const danos = {};
  proyectiles.forEach(({ impacto }) => {
    if (!impacto) return;
    const r = arma.radio;
    for (let i = 0; i < terreno.length; i++) {
      const dx = i * PASO - impacto.x;
      if (dx * dx >= r * r) continue;
      const fondo = impacto.y - Math.sqrt(r * r - dx * dx);
      if (terreno[i] > fondo) terreno[i] = Math.max(2, Math.round(fondo * 100) / 100);
    }
    tanques.forEach((t) => {
      if (t.vida <= 0) return;
      const ty = altura(estado.terreno, t.x) + 2.5;
      const d = Math.sqrt((t.x - impacto.x) * (t.x - impacto.x) + (ty - impacto.y) * (ty - impacto.y));
      if (d < r) { const q = Math.round(arma.dano * (1 - d / r)); t.vida = Math.max(0, t.vida - q); danos[t.id] = (danos[t.id] || 0) + q; }
    });
  });
  const frames = Math.max(...proyectiles.map((x) => x.frames.length));
  return { terreno, tanques, proyectiles, danos, frames };
}

export function disparar(p, id, d, ahora = Date.now()) {
  if (p.fase !== 'turno') return { ok: false, error: 'Ahora no.' };
  const quien = id == null || id < 0 ? p.turno : id;
  if (quien !== p.turno) return { ok: false, error: 'No es tu turno.' };
  const j = jug(p, quien);
  const armaId = IDS_ARMAS.includes(d.arma) ? d.arma : 'normal';
  if (armaId !== 'normal' && !(j.armas[armaId] > 0)) return { ok: false, error: 'No te quedan de esas.' };
  const ang = Math.max(0, Math.min(180, Number(d.ang) || 0));
  const pot = Math.max(5, Math.min(100, Number(d.pot) || 0));
  j.ang = ang; j.pot = pot;
  if (armaId !== 'normal') j.armas[armaId] -= 1;
  const v = pot * 0.95;
  const angs = armaId === 'triple' ? [ang - 6, ang, ang + 6] : [ang];
  const vs = angs.map((a) => [Math.round(Math.cos((a * Math.PI) / 180) * v * 1000) / 1000, Math.round(Math.sin((a * Math.PI) / 180) * v * 1000) / 1000]);
  const { x, y } = posTanque(p.terreno, j);
  const tiro = { de: quien, arma: armaId, vs, viento: p.viento, x0: x, y0: y + 2.6, ang, pot };
  const antes = { terreno: p.terreno, tanques: p.jugadores.map((t) => ({ id: t.id, x: t.x, vida: t.vida })) };
  const r = simularDisparo(antes, tiro);
  p.terreno = r.terreno;
  r.tanques.forEach((t) => { const x2 = jug(p, t.id); x2.vida = t.vida; });
  p.n += 1; p.turnos += 1;
  const ms = Math.round((r.frames / 30) * 1000) + 900;
  p.ultimo = { n: p.n, de: quien, antes, tiro, danos: r.danos, ms };
  if (vivos(p).length <= 1 || p.turnos >= p.maxTurnos) return terminar(p);
  p.turno = siguiente(p);
  nuevoTurno(p, ahora, ms);
  return { ok: true };
}

export function terminar(p) {
  const tabla = p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.vida, fuera: j.fuera })).sort((a, b) => Number(a.fuera) - Number(b.fuera) || b.puntos - a.puntos);
  let puesto = 0; let previo = null;
  tabla.forEach((t, i) => { if (t.puntos !== previo) { puesto = i + 1; previo = t.puntos; } t.puesto = puesto; });
  const max = Math.max(0, ...tabla.filter((t) => !t.fuera).map((t) => t.puntos));
  p.fase = 'fin';
  p.fin = { tabla, max, ganadores: tabla.filter((t) => !t.fuera && t.puntos === max && max > 0).map((t) => t.id) };
  return { ok: true };
}

export function tick(p, ahora = Date.now()) {
  if (p.fase === 'turno' && ahora > p.limite) { p.n += 1; p.ultimo = { n: p.n, salto: true, de: p.turno }; p.turnos += 1; p.turno = siguiente(p); nuevoTurno(p, ahora, 0); if (p.turnos >= p.maxTurnos) terminar(p); }
}
export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id); if (!j || p.fase === 'fin') return;
  j.fuera = true;
  if (vivos(p).length <= 1) { terminar(p); return; }
  if (p.turno === id) { p.turno = siguiente(p); nuevoTurno(p, ahora, 0); }
}
export function accion(p, id, d, ahora = Date.now()) {
  if (d.tipo === 'disparar') return disparar(p, id, d, ahora);
  return null;
}
export const forzar = (p, ahora = Date.now()) => { if (p.fase === 'turno') { p.turno = siguiente(p); nuevoTurno(p, ahora, 0); } return { ok: true }; };
export const turnoLocal = () => null;

export function vistaDe(p, id, ahora = Date.now()) {
  const yo = jug(p, id);
  return {
    fase: p.fase, terreno: p.terreno, viento: p.viento, turno: p.turno, limite: p.limite, ahora, ultimo: p.ultimo,
    ronda: p.turnos + 1, rondas: p.maxTurnos,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, x: j.x, puntos: j.vida, vida: j.vida, armas: j.armas, fuera: j.fuera, ang: j.ang, pot: j.pot })),
    yo: yo ? { id: yo.id } : null, fin: p.fin
  };
}
