// client/src/games/Chapas/engine.js
// «Fútbol chapas»: motor puro (salas online en server/routes/chapas.js y modo un móvil).
// Juego INDIVIDUAL de 2 a 5 jugadores: cada uno tiene 3 chapas y defiende su portería. Con 2 el campo es el de
// siempre (rectángulo, porterías arriba y abajo); con más, es un polígono regular con una portería en cada lado
// (triángulo, cuadrado, pentágono). Por turnos, cada jugador lanza una de sus chapas (arrastrar y soltar).
// Gol en la portería de otro: +1 para quien tira. Gol en propia: +1 para cada uno de los demás.
// Gana quien llegue antes a los goles pactados.
import { simular } from '../comun/fisica2d.js';

export const PORTERIA = 18;
export const RC = 3.2;
export const RB = 2.1;
export const VMAX = 62;
export const OPCIONES_GOLES = [2, 3, 5];
export const SEG_TURNO = 30;
export const MIN = 2; export const MAX = 5;
const MAX_TIROS = 90;
// Compatibilidad: medidas del campo de 2 jugadores
export const W = 60; export const H = 100;

// Vértices fijos (calculados una vez y redondeados: así el servidor y todos los móviles usan exactamente los mismos)
const POLIGONOS = {
  3: [[4.967, 89], [50, 11], [95.033, 89]],
  4: [[17.473, 82.527], [17.473, 17.473], [82.527, 17.473], [82.527, 82.527]],
  5: [[22.962, 87.215], [6.251, 35.785], [50, 4], [93.749, 35.785], [77.038, 87.215]]
};

/**
 * Campo para n jugadores: { W, H, centro, lados: [{ a, b, n (normal hacia dentro), t (tangente), largo, dueno }] }.
 * El lado `i` es la portería del jugador i (con 2: el 0 abajo y el 1 arriba). El lado 0 queda siempre abajo.
 */
export function campo(n = 2) {
  const lado = (a, b, dueno, cx, cy) => {
    const dx = b[0] - a[0]; const dy = b[1] - a[1]; const largo = Math.sqrt(dx * dx + dy * dy); const t = [dx / largo, dy / largo];
    let nn = [-t[1], t[0]]; const mx = (a[0] + b[0]) / 2; const my = (a[1] + b[1]) / 2;
    if ((cx - mx) * nn[0] + (cy - my) * nn[1] < 0) nn = [-nn[0], -nn[1]];
    return { a, b, t, n: nn, largo, medio: [mx, my], dueno };
  };
  if (n <= 2) {
    const c = [W / 2, H / 2];
    return { W, H, centro: c, n: 2, lados: [lado([0, H], [W, H], 0, ...c), lado([W, 0], [0, 0], 1, ...c), lado([0, 0], [0, H], null, ...c), lado([W, H], [W, 0], null, ...c)] };
  }
  // Polígonos de POLIGONOS (caja de 100) agrandados un 30 % para que haya sitio para todas las chapas
  const v = POLIGONOS[n].map(([x, y]) => [Math.round((65 + (x - 50) * 1.3) * 1000) / 1000, Math.round((65 + (y - 50) * 1.3) * 1000) / 1000]);
  let cx = 0; let cy = 0; v.forEach(([x, y]) => { cx += x / n; cy += y / n; });
  return { W: 130, H: 130, centro: [cx, cy], n, lados: v.map((p, i) => lado(v[(i - 1 + n) % n], p, i, cx, cy)) };
}
const ladoDe = (cp, i) => cp.lados.find((l) => l.dueno === i);

/** Colocación inicial: balón en el centro y 3 chapas por jugador delante de su portería; postes en las porterías. */
export function colocacion(n = 2) {
  const cp = campo(n); const c = [{ id: 'balon', x: cp.centro[0], y: cp.centro[1], r: RB, m: 0.45 }];
  for (let i = 0; i < Math.max(2, n); i++) {
    const l = ladoDe(cp, i); const [mx, my] = l.medio; const [nx, ny] = l.n; const [tx, ty] = l.t;
    const prof = n <= 2 ? [13, 30] : n === 3 ? [10, 18] : [10, 20]; const ancho = n <= 2 ? 15 : n === 3 ? 11 : 12;
    [[0, prof[0]], [-ancho, prof[1]], [ancho, prof[1]]].forEach(([s, d], k) => c.push({ id: `e${i}c${k}`, x: mx + nx * d + tx * s, y: my + ny * d + ty * s, r: RC, m: 1 }));
  }
  let k = 0;
  cp.lados.forEach((l) => {
    if (l.dueno == null) return;
    [-1, 1].forEach((s) => { c.push({ id: `poste${k++}`, x: l.medio[0] + l.t[0] * s * (PORTERIA / 2), y: l.medio[1] + l.t[1] * s * (PORTERIA / 2), r: 0.9, m: Infinity }); });
  });
  return c.map((x) => ({ ...x, vx: 0, vy: 0 }));
}
export const idsDe = (n = 2) => colocacion(n).map((c) => c.id);

// Rebote contra los lados (el balón puede cruzar por la boca de una portería)
function paredesDe(cp) {
  return (cs) => {
    for (const c of cs) {
      if (c.m === Infinity) continue;
      for (const l of cp.lados) {
        const d = (c.x - l.a[0]) * l.n[0] + (c.y - l.a[1]) * l.n[1];
        if (d >= c.r) continue;
        const s = (c.x - l.medio[0]) * l.t[0] + (c.y - l.medio[1]) * l.t[1];
        if (c.id === 'balon' && l.dueno != null && Math.abs(s) < PORTERIA / 2 - 0.9) continue; // boca de la portería
        if (d < -c.r * 3) continue; // ya está fuera por otra portería
        const corr = c.r - d; c.x += l.n[0] * corr; c.y += l.n[1] * corr;
        const vn = c.vx * l.n[0] + c.vy * l.n[1];
        if (vn < 0) { c.vx -= 1.72 * vn * l.n[0]; c.vy -= 1.72 * vn * l.n[1]; }
      }
    }
  };
}
// Gol: el centro del balón cruza la línea de un lado con portería (dentro de la boca)
function eventoDe(cp) {
  return (cs) => {
    const b = cs[0];
    for (const l of cp.lados) {
      if (l.dueno == null) continue;
      const d = (b.x - l.a[0]) * l.n[0] + (b.y - l.a[1]) * l.n[1];
      const s = (b.x - l.medio[0]) * l.t[0] + (b.y - l.medio[1]) * l.t[1];
      if (d < 0 && Math.abs(s) < PORTERIA / 2) return { gol: l.dueno }; // gol EN la portería de `dueno`
    }
    return null;
  };
}

/** Simula un tiro (lo usan el servidor y los móviles para animarlo). tiro = { chapa, vx, vy }; n = jugadores. */
export function simularTiro(posiciones, tiro, n = 2) {
  const cp = campo(n);
  // (las chapas de quien abandonó no están en `posiciones`: quedan fuera del campo)
  const cs = colocacion(n).map((c) => ({ ...c, ...(posiciones[c.id] ? { x: posiciones[c.id][0], y: posiciones[c.id][1] } : c.id.startsWith('e') ? { fuera: true, x: -999, y: -999 } : {}) }));
  const c = cs.find((x) => x.id === tiro.chapa);
  if (c) { c.vx = tiro.vx; c.vy = tiro.vy; }
  return simular(cs, { roce: 24, rebote: 0.88, paredes: paredesDe(cp), evento: eventoDe(cp), pasosMax: 720 });
}
const aPosiciones = (cs) => Object.fromEntries(cs.filter((c) => c.m !== Infinity).map((c) => [c.id, [c.x, c.y]]));

export function crearPartida(jugadores, items = [], reglas = {}, ahora = Date.now()) {
  const goles = OPCIONES_GOLES.includes(reglas.goles) ? reglas.goles : 3;
  const lista = jugadores.slice(0, MAX);
  const n = Math.max(2, lista.length);
  return {
    fase: 'turno', goles, n, marcador: lista.map(() => 0), tiros: 0, ronda: 0, nu: 0,
    jugadores: lista.map((j, i) => ({ id: j.id, nombre: j.nombre, equipo: i, fuera: false })),
    posiciones: aPosiciones(colocacion(n)), turno: { equipo: 0 }, ultimo: null, fin: null,
    limite: ahora + SEG_TURNO * 1000
  };
}

export function jugadorDeTurno(p) { const j = p.jugadores[p.turno.equipo]; return j && !j.fuera ? j.id : null; }
function siguiente(p, desde) {
  for (let k = 1; k <= p.jugadores.length; k++) { const i = (desde + k) % p.jugadores.length; if (!p.jugadores[i].fuera) return i; }
  return desde;
}
function pasarTurno(p, equipo, ahora, espera = 0) { p.turno.equipo = equipo; p.limite = ahora + espera + SEG_TURNO * 1000; }

export function tirar(p, id, d, ahora = Date.now()) {
  if (p.fase !== 'turno') return { ok: false, error: 'Ahora no.' };
  const quien = id == null || id < 0 ? jugadorDeTurno(p) : id;
  if (quien !== jugadorDeTurno(p)) return { ok: false, error: 'No es tu turno.' };
  const yo = p.turno.equipo;
  const chapa = String(d.chapa || '');
  if (!chapa.startsWith(`e${yo}c`) || !p.posiciones[chapa]) return { ok: false, error: 'Esa chapa no es tuya.' };
  let vx = Number(d.vx) || 0; let vy = Number(d.vy) || 0;
  const v = Math.sqrt(vx * vx + vy * vy);
  if (v < 3) return { ok: false, error: 'Tira con algo más de fuerza.' };
  if (v > VMAX) { vx = (vx / v) * VMAX; vy = (vy / v) * VMAX; }
  const tiro = { chapa, vx: Math.round(vx * 1000) / 1000, vy: Math.round(vy * 1000) / 1000 };
  const antes = p.posiciones;
  const r = simularTiro(antes, tiro, p.n);
  p.tiros += 1; p.ronda = p.tiros; p.nu += 1;
  const anim = Math.round((r.frames.length / 30) * 1000);
  const encaja = r.evento ? r.evento.gol : null;
  p.ultimo = { n: p.nu, de: quien, quien: yo, antes, tiro, encaja, ms: anim };
  if (encaja != null) {
    // Gol en la portería de `encaja`: punto para quien tira; si es en propia, punto para cada uno de los demás
    if (encaja !== yo) p.marcador[yo] += 1; else p.jugadores.forEach((j, i) => { if (i !== yo && !j.fuera) p.marcador[i] += 1; });
    p.ultimo.gol = encaja !== yo ? yo : null; p.ultimo.propia = encaja === yo;
    p.posiciones = aPosiciones(colocacion(p.n));
    if (Math.max(...p.marcador) >= p.goles) return terminar(p), { ok: true };
    pasarTurno(p, siguiente(p, encaja === yo ? yo : encaja - 1 + p.jugadores.length), ahora, anim + 1500); // saca quien ha encajado
  } else {
    p.posiciones = aPosiciones(r.cuerpos);
    pasarTurno(p, siguiente(p, yo), ahora, anim);
  }
  if (p.tiros >= MAX_TIROS) terminar(p);
  return { ok: true };
}

export function terminar(p) {
  const max = Math.max(...p.marcador);
  const tabla = p.jugadores.map((j, i) => ({ id: j.id, nombre: j.nombre, puntos: p.marcador[i], equipo: i, fuera: j.fuera })).sort((x, y) => y.puntos - x.puntos);
  let puesto = 0; let ant = null; tabla.forEach((t, k) => { if (t.puntos !== ant) { puesto = k + 1; ant = t.puntos; } t.puesto = puesto; });
  p.fase = 'fin';
  p.fin = { tabla, max, ganadores: tabla.filter((t) => t.puntos === max && !t.fuera).map((t) => t.id) };
  return { ok: true };
}

export function tick(p, ahora = Date.now()) {
  if (p.fase === 'turno' && ahora > p.limite) { p.nu += 1; p.ultimo = { n: p.nu, salto: true, de: jugadorDeTurno(p) }; pasarTurno(p, siguiente(p, p.turno.equipo), ahora); }
}
export function abandonar(p, id, ahora = Date.now()) {
  const i = p.jugadores.findIndex((j) => j.id === id); if (i === -1 || p.fase === 'fin') return;
  p.jugadores[i].fuera = true;
  // Sus chapas desaparecen del campo
  [0, 1, 2].forEach((k) => { delete p.posiciones[`e${i}c${k}`]; });
  if (p.jugadores.filter((j) => !j.fuera).length < 2) { terminar(p); return; }
  if (p.turno.equipo === i) pasarTurno(p, siguiente(p, i), ahora);
}
export function accion(p, id, d, ahora = Date.now()) {
  if (d.tipo === 'tirar') return tirar(p, id, d, ahora);
  return null;
}
export const forzar = (p, ahora = Date.now()) => { if (p.fase === 'turno') pasarTurno(p, siguiente(p, p.turno.equipo), ahora); return { ok: true }; };
export const turnoLocal = () => null;

export function vistaDe(p, id, ahora = Date.now()) {
  const yo = p.jugadores.findIndex((j) => j.id === id);
  return {
    fase: p.fase, goles: p.goles, n: p.n, marcador: p.marcador, posiciones: p.posiciones, ultimo: p.ultimo, limite: p.limite, ahora, tiros: p.tiros,
    turnoEquipo: p.turno.equipo, turno: jugadorDeTurno(p), ronda: p.tiros + 1, rondas: MAX_TIROS,
    jugadores: p.jugadores.map((j, i) => ({ id: j.id, nombre: j.nombre, equipo: i, puntos: p.marcador[i], fuera: j.fuera })),
    yo: yo >= 0 ? { id: p.jugadores[yo].id, equipo: yo } : null, fin: p.fin
  };
}
