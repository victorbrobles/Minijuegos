// client/src/games/ViaLibre/vias.js
// Lógica de «Vía libre»: generar un nivel (cuadrícula de piezas de vía con un recorrido garantizado de la estación de
// salida a la de llegada) y recorrer las vías como lo haría el tren. Sin three.js, para poder probarla en Node.
//
// Lados de una casilla: 0 = norte (−z), 1 = este (+x), 2 = sur (+z), 3 = oeste (−x).
// Piezas: 'recta' une 0-2 (girada 1 vez: 1-3), 'curva' une 0-1 (cada giro suma 1 a los lados), 'cruce' une 0-2 y 1-3.
export const DX = [0, 1, 0, -1];
export const DZ = [-1, 0, 1, 0];
export const opuesto = (s) => (s + 2) % 4;

export function conexiones(celda) {
  if (!celda || !celda.tipo) return [];
  const r = celda.rot || 0;
  if (celda.tipo === 'recta') return [[r % 4, (r + 2) % 4]];
  if (celda.tipo === 'curva') return [[r % 4, (r + 1) % 4]];
  if (celda.tipo === 'cruce') return [[0, 2], [1, 3]];
  return [];
}
/** Lado por el que sale el tren si entra por `entrada` (o null si no hay vía). */
export function salidaDe(celda, entrada) {
  for (const [a, b] of conexiones(celda)) { if (a === entrada) return b; if (b === entrada) return a; }
  return null;
}
const rotRecta = (a) => (a % 2 === 0 ? 0 : 1);
const rotCurva = (a, b) => ((b - a + 4) % 4 === 1 ? a : b);

export function rngSimple(semilla = Date.now()) {
  let a = (semilla >>> 0) || 1;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Tamaño, cruces, señuelos y tiempo de cada nivel. */
export function parametros(nivel) {
  const N = Math.min(7, 4 + Math.floor((nivel - 1) / 3));
  return {
    N,
    cruces: nivel >= 4,
    senuelos: Math.min(0.62, 0.22 + nivel * 0.04),
    minimo: Math.round(N * (1.5 + Math.min(0.9, nivel * 0.06))),
    factorTiempo: Math.max(0.62, 1 - (nivel - 1) * 0.025)
  };
}

/** Busca un recorrido aleatorio de la entrada (oeste de (0, fe)) a la salida (este de (N-1, fs)). */
function buscarRuta(N, fe, fs, minimo, cruces, rnd) {
  const ocup = new Map(); // "c,f" → { tipo, a, b }
  const ruta = [];
  let pasos = 0;
  const clave = (c, f) => `${c},${f}`;
  const dentro = (c, f) => c >= 0 && f >= 0 && c < N && f < N;
  const lados = () => { const l = [0, 1, 2, 3]; for (let i = 3; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return l; };
  function paso(c, f, entrada) {
    if (++pasos > 30000) return false;
    for (const s of lados()) {
      if (s === entrada) continue;
      const pieza = { c, f, a: entrada, b: s, tipo: s === opuesto(entrada) ? 'recta' : 'curva' };
      if (c === N - 1 && f === fs && s === 1) {
        if (ruta.length + 1 >= minimo) { ruta.push(pieza); ocup.set(clave(c, f), pieza); return true; }
        continue;
      }
      let nc = c + DX[s]; let nf = f + DZ[s];
      if (!dentro(nc, nf)) continue;
      let cruce = null;
      const o = ocup.get(clave(nc, nf));
      if (o) {
        // Cruzar por encima de una recta perpendicular y seguir recto
        if (!cruces || o.tipo !== 'recta' || o.a % 2 === s % 2) continue;
        const c2 = nc + DX[s]; const f2 = nf + DZ[s];
        if (!dentro(c2, f2) || ocup.has(clave(c2, f2))) continue;
        cruce = o; nc = c2; nf = f2;
      }
      ruta.push(pieza); ocup.set(clave(c, f), pieza);
      if (cruce) cruce.tipo = 'cruce';
      if (paso(nc, nf, opuesto(s))) return true;
      if (cruce) cruce.tipo = 'recta';
      ruta.pop(); ocup.delete(clave(c, f));
    }
    return false;
  }
  return paso(0, fe, 3) ? ruta : null;
}

/** Genera el nivel: { N, celdas[f][c], entrada, salida, ruta, tiempo }. */
export function generarNivel(nivel, rnd = Math.random) {
  const p = parametros(nivel);
  const { N } = p;
  let ruta = null; let fe = 0; let fs = 0; let minimo = p.minimo;
  for (let intento = 0; !ruta; intento++) {
    fe = Math.floor(rnd() * N); fs = Math.floor(rnd() * N);
    ruta = buscarRuta(N, fe, fs, minimo, p.cruces, rnd);
    if (intento % 6 === 5) minimo = Math.max(N, minimo - 1);
  }
  const celdas = Array.from({ length: N }, () => Array.from({ length: N }, () => null));
  for (const t of ruta) {
    const ya = celdas[t.f][t.c];
    if (t.tipo === 'cruce' || (ya && ya.tipo === 'cruce')) { celdas[t.f][t.c] = { tipo: 'cruce', rot: 0, ruta: true }; continue; }
    if (t.tipo === 'recta') celdas[t.f][t.c] = { tipo: 'recta', rot: rotRecta(t.a), bien: rotRecta(t.a), ruta: true };
    else celdas[t.f][t.c] = { tipo: 'curva', rot: rotCurva(t.a, t.b), bien: rotCurva(t.a, t.b), ruta: true };
  }
  // Rellenar: piezas señuelo o decoración
  for (let f = 0; f < N; f++) for (let c = 0; c < N; c++) {
    if (celdas[f][c]) continue;
    if (rnd() < p.senuelos) celdas[f][c] = { tipo: rnd() < 0.45 ? 'recta' : 'curva', rot: Math.floor(rnd() * 4) };
    else celdas[f][c] = { tipo: null, deco: ['arbol', 'arbol', 'roca', 'casa', 'lago', 'flores'][Math.floor(rnd() * 6)] };
  }
  // Desordenar las piezas de la ruta (al menos la mitad mal giradas)
  const girables = [];
  for (const fila of celdas) for (const x of fila) if (x.ruta && x.tipo !== 'cruce') girables.push(x);
  for (const x of girables) x.rot = Math.floor(rnd() * 4);
  const bienPuesta = (x) => (x.tipo === 'recta' ? x.rot % 2 === x.bien : x.rot === x.bien);
  for (const x of girables) if (girables.filter(bienPuesta).length > girables.length / 2 && bienPuesta(x)) x.rot = (x.rot + 1) % 4;
  const nivelObj = { N, celdas, entrada: fe, salida: fs, largo: ruta.length };
  if (recorrer(nivelObj).exito) { const x = girables[0]; x.rot = (x.rot + 1) % 4; } // nunca empieza resuelto
  const giros = girables.reduce((s, x) => s + (x.tipo === 'recta' ? (x.rot % 2 !== x.bien ? 1 : 0) : (x.bien - x.rot + 4) % 4), 0);
  nivelObj.tiempo = Math.round((10 + ruta.length * 1.3 + giros * 0.9) * p.factorTiempo + 4);
  return nivelObj;
}

/**
 * Recorre las vías desde la estación de salida. Devuelve { exito, pasos: [{ c, f, entrada, salida }], motivo, final }.
 * `final` es la casilla (quizá fuera del tablero) donde el tren se queda o descarrila.
 */
export function recorrer(nivel) {
  const { N, celdas } = nivel;
  let c = 0; let f = nivel.entrada; let entrada = 3;
  const pasos = [];
  const vistos = new Set();
  for (let i = 0; i < N * N * 3; i++) {
    const celda = celdas[f]?.[c];
    const s = salidaDe(celda, entrada);
    if (s === null) return { exito: false, pasos, motivo: 'vía cortada', final: { c, f, entrada } };
    const k = `${c},${f},${entrada}`;
    if (vistos.has(k)) return { exito: false, pasos, motivo: 'dando vueltas', final: { c, f, entrada } };
    vistos.add(k);
    pasos.push({ c, f, entrada, salida: s });
    const nc = c + DX[s]; const nf = f + DZ[s];
    if (nc < 0 || nf < 0 || nc >= N || nf >= N) {
      if (nc === N && nf === nivel.salida) return { exito: true, pasos, motivo: 'llegada' };
      return { exito: false, pasos, motivo: 'fuera de la vía', final: { c: nc, f: nf, entrada: opuesto(s) } };
    }
    c = nc; f = nf; entrada = opuesto(s);
  }
  return { exito: false, pasos, motivo: 'dando vueltas' };
}

/** Puntos por superar un nivel. */
export const puntosNivel = (nivel, segundosSobrantes) => 50 + nivel * 10 + Math.round(Math.max(0, segundosSobrantes) * 5);

/** Recorrido del tren por una casilla, como puntos (x, z) relativos al centro: recta o arco de cuarto de círculo. */
export function trazo(entrada, salida, n = 10) {
  const mid = (s) => [DX[s] * 0.5, DZ[s] * 0.5];
  const [ax, az] = mid(entrada); const [bx, bz] = mid(salida);
  const pts = [];
  if (salida === opuesto(entrada)) { for (let i = 0; i <= n; i++) pts.push([ax + (bx - ax) * (i / n), az + (bz - az) * (i / n)]); return pts; }
  const cx = ax + bx; const cz = az + bz; // esquina común
  const a0 = Math.atan2(az - cz, ax - cx); let a1 = Math.atan2(bz - cz, bx - cx);
  let d = a1 - a0; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; a1 = a0 + d;
  for (let i = 0; i <= n; i++) { const a = a0 + d * (i / n); pts.push([cx + Math.cos(a) * 0.5, cz + Math.sin(a) * 0.5]); }
  return pts;
}
