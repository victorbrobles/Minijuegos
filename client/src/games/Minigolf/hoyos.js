// client/src/games/Minigolf/hoyos.js
// Generador de los 200 hoyos de «Minigolf». Cada hoyo sale de su número y una semilla (verificada por un bot que
// lo juega: ver server/scripts/minigolf-validar.mjs). La dificultad sube con el número: más casillas, más curvas,
// rampas y obstáculos cada vez más traicioneros (molinos, puentes sin barandilla, agua, saltos…).
//
// El recorrido es un camino de casillas de 4 × 4 en una cuadrícula. Coordenadas locales de cada casilla:
// u = hacia donde avanza el recorrido, v = a la derecha; ambas de −2 a 2.
export const CASILLA = 4;
export const TOTAL_HOYOS = 200;
export const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // N, E, S, O

function rng(semilla) {
  let a = semilla >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Del sistema local de una casilla (u, v) al mundo (x, z). */
export function aMundo(t, u, v) {
  const [fx, fz] = DIRS[t.dir]; const rx = -fz; const rz = fx;
  return [t.cx + u * fx + v * rx, t.cz + u * fz + v * rz];
}
/** Del mundo al sistema local de la casilla. */
export function aLocal(t, x, z) {
  const [fx, fz] = DIRS[t.dir]; const rx = -fz; const rz = fx; const dx = x - t.cx; const dz = z - t.cz;
  return [dx * fx + dz * fz, dx * rx + dz * rz];
}
/** Altura del suelo de la casilla en el punto local u (las rampas suben o bajan a lo largo de u). */
export const alturaEn = (t, u) => (t.tipo === 'rampa' ? t.h0 + ((u + 2) / 4) * (t.h1 - t.h0) : t.h0);

export function generarHoyo(n, semilla = n * 7919) {
  const r = rng(semilla);
  const azar = (a, b) => a + r() * (b - a);
  const d = (n - 1) / (TOTAL_HOYOS - 1); // 0 = el más fácil, 1 = el más difícil
  const largo = Math.min(10, 2 + Math.round(d * 6 + r() * 1.6));
  // 1) Camino de casillas sin cruzarse
  const ocupado = new Set(['0,0']);
  const celdas = [{ gx: 0, gz: 0, din: null, dout: 0 }];
  let dir = 0;
  for (let k = 1; k < largo; k++) {
    const prev = celdas[celdas.length - 1];
    const giro = r() < 0.25 + d * 0.3 && k > 1 ? (r() < 0.5 ? 1 : 3) : 0;
    const opciones = [(dir + giro) % 4, dir, (dir + 1) % 4, (dir + 3) % 4];
    let hecho = false;
    for (const nd of opciones) {
      const gx = prev.gx + DIRS[nd][0]; const gz = prev.gz + DIRS[nd][1];
      if (ocupado.has(`${gx},${gz}`)) continue;
      prev.dout = nd; dir = nd;
      celdas.push({ gx, gz, din: nd, dout: nd });
      ocupado.add(`${gx},${gz}`);
      hecho = true;
      break;
    }
    if (!hecho) break;
  }
  // 2) Alturas, rampas y rasgos de cada casilla
  let h = 0;
  const casillas = celdas.map((c, i) => {
    const recta = c.din === null || c.din === c.dout;
    const t = { i, gx: c.gx, gz: c.gz, cx: c.gx * CASILLA, cz: c.gz * CASILLA, dir: c.dout, din: c.din, dout: c.dout, tipo: 'llano', h0: h, h1: h, rasgo: null };
    const primera = i === 0; const ultima = i === celdas.length - 1;
    if (!primera && !ultima && recta && r() < 0.12 + d * 0.3) {
      t.tipo = 'rampa';
      t.h1 = h + (r() < 0.6 ? 0.8 : -0.8);
      if (t.h1 < -1.6) t.h1 = h + 0.8;
      h = t.h1;
    }
    if (!primera && !ultima && t.tipo === 'llano') t.rasgo = rasgo(r, azar, d, recta);
    if (ultima && d > 0.35 && r() < d) t.rasgo = { tipo: 'postes', postes: [[azar(-0.4, 0.4), azar(-1.4, 1.4) > 0 ? 1.3 : -1.3, 0.25]] };
    return t;
  });
  // 3) Salida, hoyo y puntos de paso (para el bot y la cámara)
  const ult = casillas[casillas.length - 1];
  const cupLocal = [azar(0.2, 1.1), azar(-1.1, 1.1)];
  if (ult.rasgo?.postes) ult.rasgo.postes = ult.rasgo.postes.filter(([u, v]) => Math.hypot(u - cupLocal[0], v - cupLocal[1]) > 0.9);
  const [hx, hz] = aMundo(ult, ...cupLocal);
  const [tx, tz] = aMundo(casillas[0], -1.2, 0);
  const paso = casillas.map((t) => {
    const pv = t.rasgo?.paso ?? 0;
    return aMundo(t, t.rasgo?.tipo === 'salto' ? 1.4 : 0, pv);
  });
  const dificiles = casillas.filter((t) => ['molino', 'puente', 'agua', 'salto', 'deslizante'].includes(t.rasgo?.tipo)).length;
  const par = Math.min(6, 2 + Math.floor(casillas.length / 3) + (dificiles >= 2 ? 1 : 0));
  return { n, semilla, d, casillas, salida: [tx, alturaEn(casillas[0], -1.2), tz], hoyo: [hx, ult.h0, hz], hoyoLocal: cupLocal, paso, par };
}

function rasgo(r, azar, d, recta) {
  const pool = ['nada', 'postes', 'arena', 'turbo'];
  if (recta) {
    pool.push('muro', 'postes');
    if (d > 0.12) pool.push('deslizante');
    if (d > 0.2) pool.push('molino', 'agua');
    if (d > 0.4) pool.push('puente', 'molino');
    if (d > 0.65) pool.push('salto', 'puente');
  }
  if (d < 0.1) pool.push('nada', 'nada');
  const tipo = pool[Math.floor(r() * pool.length)];
  switch (tipo) {
    case 'postes': {
      const postes = [];
      const n = 1 + Math.round(azar(0, 1 + d * 2));
      for (let k = 0; k < n * 4 && postes.length < n; k++) {
        const p = [azar(-1.2, 1.2), azar(-1.3, 1.3), 0.25];
        if (postes.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) > 1.1)) postes.push(p);
      }
      return { tipo, postes };
    }
    case 'muro': { const hueco = 1.7 - d * 0.6; const centro = azar(-2 + hueco / 2 + 0.2, 2 - hueco / 2 - 0.2); return { tipo, hueco, centro, paso: centro }; }
    case 'molino': return { tipo, w: (r() < 0.5 ? 1 : -1) * (0.9 + d * 1.6), largo: 3.3 };
    case 'deslizante': return { tipo, periodo: 3.6 - d * 1.6, ancho: 1.1 + d * 0.5 };
    case 'arena': { const u0 = azar(-1.2, 0.4); return { tipo, u0, u1: u0 + azar(0.8, 1.6) }; }
    case 'turbo': return { tipo, v: azar(-1, 1), fuerza: 5 + d * 3 };
    case 'agua': { const lado = r() < 0.5 ? 1 : -1; return { tipo, lado, paso: -lado * 1.1 }; }
    case 'puente': { const ancho = 1.5 - d * 0.5; const centro = azar(-0.9, 0.9); return { tipo, ancho, centro, paso: centro }; }
    case 'salto': return { tipo, hueco: 0.7 + d * 0.4, rampa: 0.3 };
    default: return null;
  }
}

/** Los 18 hoyos de una partida: uno de cada tramo de dificultad (el 18, de los más difíciles). */
export function elegirRecorrido(semillas = {}, azar = Math.random) {
  return Array.from({ length: 18 }, (_, i) => {
    const desde = Math.floor((i * TOTAL_HOYOS) / 18) + 1; const hasta = Math.floor(((i + 1) * TOTAL_HOYOS) / 18);
    const n = desde + Math.floor(azar() * (hasta - desde + 1));
    return { n, semilla: semillas[n] ?? n * 7919 };
  });
}
