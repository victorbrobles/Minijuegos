// client/src/games/Estelas/engine.js
// «Estelas»: motor puro en tiempo real (salas online en server/routes/estelas.js y práctica contra bots).
// Cada jugador es una moto de luz que avanza sola y deja una estela que se va apagando (dura VIDA pasos). Se dirige
// LIBREMENTE: la moto gira (con un límite de giro) hacia donde apuntas con el dedo o el cursor. Quien choca con una
// pared o con una estela (la suya también, salvo el trocito recién dejado) queda fuera. Gana la ronda el último en pie.
// El servidor manda: avanza el mundo según el tiempo (un paso cada PASO_MS) con el punto al que apunta cada uno.
export const C = 40;   // ancho de la arena
export const F = 56;   // alto de la arena
export const PASO_MS = 50;
export const VEL = 0.5;          // unidades por paso (10 u/s)
export const GIRO = 0.2;         // giro máximo por paso (4 rad/s)
export const VIDA = 70;          // pasos que dura cada punto de la estela (3,5 s)
export const GROSOR = 0.55;      // radio de choque contra una estela
const PROPIOS = 6;               // puntos propios recientes que no cuentan (los que acabas de dejar)
export const SEG_CUENTA = 3;
export const SEG_FIN_RONDA = 3.5;
export const OPCIONES_RONDAS = [3, 5, 7];

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const enJuego = (p) => p.jugadores.filter((j) => !j.fuera);
const r2 = (v) => Math.round(v * 100) / 100;
const difAng = (a, b) => { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };

/** Puestos de salida repartidos alrededor, mirando hacia el centro. */
function salidas(n) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + Math.PI / 4;
    const x = C / 2 + Math.cos(a) * (C / 2 - 6); const y = F / 2 + Math.sin(a) * (F / 2 - 7);
    return { x, y, ang: Math.atan2(F / 2 - y, C / 2 - x) };
  });
}

export function crearPartida(jugadores, items = [], reglas = {}, ahora = Date.now()) {
  const rondas = OPCIONES_RONDAS.includes(reglas.rondas) ? reglas.rondas : 5;
  const p = {
    fase: 'cuenta', ronda: 1, rondas, paso: 0, inicio: 0, hasta: 0, ultimoGanador: null, fin: null,
    jugadores: jugadores.map((j, i) => ({ id: j.id, nombre: j.nombre, color: i, puntos: 0, fuera: false, bot: Boolean(j.bot), vivo: true, x: 0, y: 0, ang: 0, objetivo: 0, rastro: [] }))
  };
  nuevaRonda(p, ahora);
  return p;
}

function nuevaRonda(p, ahora) {
  const js = enJuego(p); const pos = salidas(js.length);
  js.forEach((j, i) => { const s = pos[i]; Object.assign(j, { vivo: true, x: s.x, y: s.y, ang: s.ang, objetivo: s.ang, rastro: [[r2(s.x), r2(s.y), 0]], murio: null }); });
  p.paso = 0; p.fase = 'cuenta'; p.inicio = ahora + SEG_CUENTA * 1000; p.hasta = 0;
}

// Distancia del punto (px, py) al segmento a-b
function distSeg(px, py, a, b) {
  const dx = b[0] - a[0]; const dy = b[1] - a[1]; const l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - a[0]) * dx + (py - a[1]) * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
  const x = a[0] + dx * t - px; const y = a[1] + dy * t - py; return Math.sqrt(x * x + y * y);
}
/** ¿Choca un punto con algo? (paredes o estelas; de la propia, sin contar los últimos puntos) */
export function choca(p, j, x, y, margen = GROSOR) {
  if (x < 0.3 || y < 0.3 || x > C - 0.3 || y > F - 0.3) return true;
  for (const o of p.jugadores) {
    if (o.fuera) continue;
    const r = o.rastro; const hasta = o === j ? r.length - PROPIOS : r.length;
    for (let k = 1; k < hasta; k++) if (distSeg(x, y, r[k - 1], r[k]) < margen) return true;
  }
  return false;
}

/** Avanza un paso: cada moto gira hacia su objetivo (con límite), avanza y deja estela; la estela vieja se apaga. */
function avanzar(p) {
  p.paso += 1;
  const vivos = p.jugadores.filter((j) => j.vivo && !j.fuera);
  vivos.forEach((j) => {
    const d = difAng(j.objetivo, j.ang); j.ang += Math.max(-GIRO, Math.min(GIRO, d));
    j.x += Math.cos(j.ang) * VEL; j.y += Math.sin(j.ang) * VEL;
  });
  const muertos = new Set();
  vivos.forEach((j) => {
    if (choca(p, j, j.x, j.y)) muertos.add(j.id);
    vivos.forEach((o) => { if (o !== j && Math.hypot(o.x - j.x, o.y - j.y) < GROSOR * 2) muertos.add(j.id); });
  });
  vivos.forEach((j) => { if (muertos.has(j.id)) { j.vivo = false; j.murio = p.paso; } else j.rastro.push([r2(j.x), r2(j.y), p.paso]); });
  // La estela se va apagando: fuera los puntos más viejos que VIDA
  p.jugadores.forEach((j) => { while (j.rastro.length && j.rastro[0][2] < p.paso - VIDA) j.rastro.shift(); });
  if (muertos.size) p.jugadores.forEach((j) => { if (j.vivo && !j.fuera) j.puntos += muertos.size; });
}

function cerrarRonda(p, ahora) {
  const vivos = p.jugadores.filter((j) => j.vivo && !j.fuera);
  if (vivos.length === 1) { vivos[0].puntos += 2; p.ultimoGanador = vivos[0].id; } else p.ultimoGanador = null;
  p.fase = 'finRonda'; p.hasta = ahora + SEG_FIN_RONDA * 1000;
}

export function tick(p, ahora = Date.now()) {
  if (p.fase === 'fin') return;
  if (p.fase === 'cuenta' && ahora >= p.inicio) p.fase = 'jugando';
  if (p.fase === 'jugando') {
    const objetivo = Math.floor((ahora - p.inicio) / PASO_MS);
    let n = 0;
    while (p.paso < objetivo && n < 400) {
      p.jugadores.forEach((j) => { if (j.bot && j.vivo) j.objetivo = angBot(p, j); });
      avanzar(p); n += 1;
      if (p.jugadores.filter((j) => j.vivo && !j.fuera).length <= 1) { cerrarRonda(p, ahora); break; }
    }
  } else if (p.fase === 'finRonda' && ahora >= p.hasta) {
    if (p.ronda >= p.rondas || enJuego(p).length < 2) terminar(p);
    else { p.ronda += 1; nuevaRonda(p, ahora); }
  }
}

/** Apuntar: la moto girará hacia el punto (x, y) de la arena (o hacia el ángulo `ang`). */
export function apuntar(p, id, d) {
  const j = jug(p, id);
  if (!j || !j.vivo) return { ok: false };
  if (Array.isArray(d.mira) && Number.isFinite(Number(d.mira[0])) && Number.isFinite(Number(d.mira[1]))) {
    const dx = Number(d.mira[0]) - j.x; const dy = Number(d.mira[1]) - j.y;
    if (dx * dx + dy * dy > 0.25) j.objetivo = Math.atan2(dy, dx);
  } else if (Number.isFinite(Number(d.ang))) j.objetivo = Number(d.ang);
  return { ok: true };
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

export function abandonar(p, id) {
  const j = jug(p, id); if (!j || p.fase === 'fin') return;
  j.fuera = true; j.vivo = false; j.rastro = [];
  if (enJuego(p).length < 2) terminar(p);
}
export function accion(p, id, d) {
  if (d.tipo === 'apuntar') return apuntar(p, id, d);
  return null;
}
export const forzar = (p, ahora = Date.now()) => { if (p.fase === 'jugando') cerrarRonda(p, ahora); else if (p.fase === 'finRonda') { p.hasta = 0; tick(p, ahora); } return { ok: true }; };
export const turnoLocal = () => null;

/** Vista lenta (la de la sala): marcador y fase. El dibujo va por `sincronizar`. */
export function vistaDe(p, id, ahora = Date.now()) {
  const yo = jug(p, id);
  return {
    fase: p.fase, ronda: p.ronda, rondas: p.rondas, inicio: p.inicio, hasta: p.hasta, ahora, ultimoGanador: p.ultimoGanador,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, color: j.color, puntos: j.puntos, vivo: j.vivo, fuera: j.fuera })),
    yo: yo ? { id: yo.id } : null, fin: p.fin
  };
}

/** Sincronización rápida: posición de cada moto y los puntos de estela posteriores al paso `desde`. */
export function sincronizar(p, id, { desde = -1, ronda = 0 } = {}, ahora = Date.now()) {
  const nueva = ronda !== p.ronda;
  return {
    ahora, fase: p.fase, ronda: p.ronda, rondas: p.rondas, paso: p.paso, inicio: p.inicio, hasta: p.hasta, ultimoGanador: p.ultimoGanador,
    jugadores: p.jugadores.map((j) => ({
      id: j.id, color: j.color, vivo: j.vivo, puntos: j.puntos, fuera: j.fuera, x: r2(j.x), y: r2(j.y), ang: Math.round(j.ang * 1000) / 1000,
      nuevos: j.rastro.filter((q) => nueva || q[2] > desde)
    })),
    fin: p.fin
  };
}

/* ───────── Bot (práctica): mira varias direcciones y elige la que tiene más camino libre ───────── */
function despejado(p, j, ang, max = 26) {
  let x = j.x; let y = j.y;
  for (let k = 1; k <= max; k++) { x += Math.cos(ang) * VEL * 1.5; y += Math.sin(ang) * VEL * 1.5; if (choca(p, j, x, y, GROSOR * 1.6)) return k; }
  return max + 4;
}
export function angBot(p, j) {
  if (p.paso % 3 !== 0 && j.objetivo != null && despejado(p, j, j.ang, 8) >= 8) return j.objetivo;
  let mejor = j.ang; let max = -1;
  [0, -0.35, 0.35, -0.8, 0.8, -1.3, 1.3, -1.9, 1.9].forEach((d) => {
    const a = j.ang + d; const v = despejado(p, j, a) + (d === 0 ? 3 : 0) + Math.random() * 3;
    if (v > max) { max = v; mejor = a; }
  });
  return mejor;
}
