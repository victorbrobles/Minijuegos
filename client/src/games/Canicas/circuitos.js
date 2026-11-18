// client/src/games/Canicas/circuitos.js
// Circuitos de «Carrera de Canicas»: circuitos cerrados de varias vueltas, trazados «a lo tortuga» (rectas y curvas
// con subidas y bajadas) para que siempre queden suaves. Cada uno tiene caminos alternativos (atajos sin barandilla,
// rutas de turbos, saltos sobre el vacío), tramos sin barandilla, turbos, rampas de salto y filas de cajas de objetos.
// Todo se construye a partir de muestras cada metro: posición, tangente, lateral (con peralte), ancho y distancia.
import * as THREE from 'three';

/*
 * Trazado: lista de tramos. { r: metros } recta · { c: grados, rad: radio } curva (positivo = a la izquierda).
 * dy: subida/bajada del tramo · ancho: ancho desde ese tramo · sin: tramo sin barandilla (1 = derecha, -1 = izquierda, 2 = ambas).
 * Las posiciones de las cosas se dan como [tramo, fracción del tramo].
 */
export const CIRCUITOS = {
  valle: {
    nombre: 'Valle Verde', emoji: '🌿', cielo: 0x93c5fd, suelo: 0x8b95a5, borde: 0xf8fafc, campo: 0x3f9b4f, arbol: 0x166534, ancho: 9, vueltas: 3,
    trazado: [
      { r: 80 }, { c: 90, rad: 25 }, { r: 30, dy: 4 }, { c: -90, rad: 20 }, { r: 40 },
      { c: 180, rad: 18, sin: 2, ancho: 10 }, { r: 50, dy: -3, ancho: 9 }, { c: -90, rad: 20 }, { r: 40 }, { c: 90, rad: 30 },
      { r: 40, dy: 3 }, { c: -90, rad: 20 }, { r: 30, dy: -4 }, { c: 90, rad: 18 }, { c: 90, rad: 18 },
      { r: 30, dy: 4 }, { c: -90, rad: 20 }, { r: 40 }, { c: 90, rad: 40 }, { r: 100, dy: -4 },
      { c: 90, rad: 30 }
    ],
    ramas: [
      { nombre: 'Atajo del bosque', desde: [17, 0.3], hasta: [19, 0.3], tipo: 'cuerda', curva: 0, ancho: 4.5, barandillas: false, cajas: [0.5] },
      { nombre: 'Ruta de turbos', desde: [7, 0.9], hasta: [10, 0.5], tipo: 'paralela', lado: -1, sep: 15, dy: -3, ancho: 5.5, barandillas: true, turbos: [0.3, 0.55, 0.8] },
      { nombre: 'Salto del lago', desde: [10, 0.9], hasta: [16, 1], tipo: 'cuerda', curva: 0, ancho: 6, barandillas: false, hueco: [0.45, 0.58], saltos: [0.39], turbos: [0.2] }
    ],
    turbos: [[0, 0.7], [6, 0.6], [19, 0.6]], saltos: [], cajas: [[0, 0.35], [8, 0.3], [19, 0.2]], huecos: []
  },
  canon: {
    nombre: 'Cañón Rojo', emoji: '🏜️', cielo: 0xfdba74, suelo: 0xe8b86b, borde: 0x7c2d12, campo: 0x9a3412, arbol: 0x9a3412, ancho: 7.5, vueltas: 3,
    trazado: [
      { r: 60 }, { c: -90, rad: 24 }, { r: 50, dy: 4 }, { c: 90, rad: 22, sin: 2, ancho: 6.5 }, { r: 40, sin: 2 },
      { c: 135, rad: 18, ancho: 7.5 }, { r: 60, dy: -6 }, { c: -135, rad: 18, sin: 1 }, { r: 40 }, { c: 90, rad: 26 },
      { r: 80, dy: 4 }, { c: 90, rad: 30 }, { r: 60 }, { c: -90, rad: 20, sin: 2, ancho: 6.5 }, { r: 40, ancho: 7.5 },
      { c: 90, rad: 26, dy: -2 }
    ],
    ramas: [
      { nombre: 'Salto del cañón', desde: [9, 1], hasta: [13, 0.5], tipo: 'cuerda', curva: 0, ancho: 6, barandillas: false, hueco: [0.46, 0.54], saltos: [0.42], turbos: [0.2] },
      { nombre: 'Cornisa', desde: [17, 0.15], hasta: [17, 0.85], tipo: 'paralela', lado: 1, sep: 11, ancho: 3.6, barandillas: false, cajas: [0.5], turbos: [0.3, 0.7] }
    ],
    turbos: [[0, 0.5], [10, 0.15], [14, 0.6]], saltos: [[6, 0.42]], cajas: [[2, 0.5], [8, 0.5], [12, 0.5]], huecos: [[6, 0.5, 0.68]]
  },
  espiral: {
    nombre: 'Espiral Helada', emoji: '❄️', cielo: 0xe0f2fe, suelo: 0xbae6fd, borde: 0x0ea5e9, campo: 0xe2e8f0, arbol: 0xf8fafc, ancho: 10, vueltas: 2, hielo: true,
    trazado: [
      { r: 60 }, { c: 360, rad: 34, dy: -8 }, { c: 330, rad: 26, dy: -8 }, { r: 110, dy: -2 }, { c: -120, rad: 30, dy: 4 },
      { r: 80, dy: 6 }, { c: -150, rad: 30, dy: 4 }
    ],
    ramas: [
      { nombre: 'Tobogán', desde: [3, 0.3], hasta: [5, 1], tipo: 'cuerda', curva: 8, ancho: 4.5, barandillas: false, turbos: [0.3, 0.7] },
      { nombre: 'Pista de patinaje', desde: [0, 0.08], hasta: [0, 0.95], tipo: 'paralela', lado: -1, sep: 13, dy: 2, ancho: 6, barandillas: true, cajas: [0.5] }
    ],
    turbos: [[0, 0.6], [3, 0.7], [5, 0.5]], saltos: [], cajas: [[1, 0.6], [3, 0.2], [6, 0.5]], huecos: []
  },
  volcan: {
    nombre: 'Volcán', emoji: '🌋', cielo: 0x450a0a, suelo: 0x57534e, borde: 0xf97316, campo: 0x7f1d1d, arbol: 0x1c1917, ancho: 8, vueltas: 3, lava: true,
    trazado: [
      { r: 40 }, { r: 60, dy: 10 }, { c: 90, rad: 25 }, { r: 30, sin: 2 }, { c: 45, rad: 22 },
      { c: -60, rad: 20 }, { c: 150, rad: 22 }, { r: 170, dy: -2 }, { c: -90, rad: 25 }, { r: 30, sin: 2 },
      { c: -45, rad: 22 }, { c: 60, rad: 20 }, { c: -150, rad: 22 }, { r: 40, dy: -8 }
    ],
    ramas: [
      { nombre: 'Puente de lava', desde: [7, 0.5], hasta: [11, 1], tipo: 'cuerda', curva: 0, ancho: 4.2, barandillas: false, cajas: [0.5], turbos: [0.25, 0.75] },
      { nombre: 'Salto del cráter', desde: [3, 0], hasta: [7, 0.4], tipo: 'cuerda', curva: 0, ancho: 6, barandillas: false, hueco: [0.46, 0.56], saltos: [0.42], turbos: [0.15] }
    ],
    turbos: [[0, 0.5], [7, 0.3], [13, 0.5]], saltos: [[9, 0.3]], cajas: [[1, 0.5], [7, 0.15], [13, 0.2]], huecos: [[9, 0.45, 0.72]]
  }
};
export const IDS_CIRCUITOS = Object.keys(CIRCUITOS);

const PASO_TORTUGA = 2;
const suave = (u) => u * u * (3 - 2 * u);

const DOS_PI = Math.PI * 2;
const modA = (a) => ((a % DOS_PI) + DOS_PI) % DOS_PI;
/** Cierre automático (curva-recta-curva, el más corto) desde donde acaba el trazado hasta la salida. */
function cierre(x, z, h, r) {
  const centro = (px, pz, ph, izq) => (izq ? [px - r * Math.sin(ph), pz + r * Math.cos(ph)] : [px + r * Math.sin(ph), pz - r * Math.cos(ph)]);
  const sim = (ops) => {
    let X = x; let Z = z; let H = h;
    ops.forEach((o) => {
      if (o.r != null) { X += Math.cos(H) * o.r; Z += Math.sin(H) * o.r; return; }
      const g = (o.c * Math.PI) / 180; const izq = g > 0; const [cx, cz] = centro(X, Z, H, izq);
      const a0 = Math.atan2(Z - cz, X - cx) + g; X = cx + r * Math.cos(a0); Z = cz + r * Math.sin(a0); H += g;
    });
    return Math.hypot(X, Z) + Math.abs(Math.sin(H)) * 10 + (Math.cos(H) < 0 ? 10 : 0);
  };
  const opciones = [];
  [[true, true], [false, false], [true, false], [false, true]].forEach(([i1, i2]) => {
    const c1 = centro(x, z, h, i1); const c2 = centro(0, 0, 0, i2);
    const dx = c2[0] - c1[0]; const dz = c2[1] - c1[1]; const D = Math.hypot(dx, dz); const fi = Math.atan2(dz, dx);
    const cands = i1 === i2 ? [[fi, D]] : D > 2 * r ? [-1, 1].map((sg) => [fi + sg * Math.atan2(2 * r, Math.sqrt(D * D - 4 * r * r)), Math.sqrt(D * D - 4 * r * r)]) : [];
    cands.forEach(([th, L]) => {
      const g1 = i1 ? modA(th - h) : -modA(h - th); const g2 = i2 ? modA(0 - th) : -modA(th - 0);
      const ops = [{ c: (g1 * 180) / Math.PI, rad: r }, { r: L }, { c: (g2 * 180) / Math.PI, rad: r }];
      if (sim(ops) < 0.5) opciones.push({ ops, largo: L + r * (Math.abs(g1) + Math.abs(g2)) });
    });
  });
  opciones.sort((a, b) => a.largo - b.largo);
  return opciones[0]?.ops || [];
}

/** Recorre el trazado (y lo cierra) y devuelve los puntos y dónde empieza cada tramo. */
export function trazar(def) {
  let x = 0; let z = 0; let y = 0; let h = 0; let ancho = def.ancho; let s = 0;
  const pts = [{ x, y, z, s, ancho, sin: 0 }];
  const inicioTramo = [];
  const recorrer = (op) => {
    inicioTramo.push(s);
    if (op.ancho) ancho = op.ancho;
    const largo = op.r != null ? op.r : (Math.abs(op.c) * Math.PI / 180) * op.rad;
    if (largo < 0.01) return;
    const n = Math.max(1, Math.round(largo / PASO_TORTUGA));
    const y0 = y; const dy = op.dy || 0; const h0 = h; const giro = op.c != null ? (op.c * Math.PI) / 180 : 0;
    for (let k = 1; k <= n; k++) {
      const u = k / n; const d = largo / n;
      const hm = h0 + giro * (u - 0.5 / n);
      x += Math.cos(hm) * d; z += Math.sin(hm) * d; s += d;
      y = y0 + dy * suave(u);
      pts.push({ x, y, z, s, ancho, sin: op.sin || 0 });
    }
    h = h0 + giro;
  };
  def.trazado.forEach(recorrer);
  const extra = cierre(x, z, h, def.radioCierre || 24);
  if (extra[1]) extra[1].dy = -y;
  extra.forEach(recorrer);
  const total = s;
  const fin = pts[pts.length - 1]; const err = { x: fin.x - pts[0].x, y: fin.y - pts[0].y, z: fin.z - pts[0].z };
  pts.forEach((p) => { const u = p.s / total; p.x -= err.x * u; p.y -= err.y * u; p.z -= err.z * u; });
  pts.pop();
  return { pts, inicioTramo, total, err, cierre: extra, giroTotal: (h * 180) / Math.PI };
}

function muestrear(curva, anchoDe, { cerrada = false, peralte: conPeralte = true } = {}) {
  const largo = curva.getLength();
  const n = Math.max(2, Math.round(largo / 1));
  const pts = curva.getSpacedPoints(n);
  if (cerrada) pts.pop();
  const total = pts.length;
  const muestras = pts.map((p, i) => ({ p, t: curva.getTangentAt(Math.min(1, i / n)).normalize(), s: (i / n) * largo }));
  const at = (i) => muestras[cerrada ? ((i % total) + total) % total : Math.max(0, Math.min(total - 1, i))];
  muestras.forEach((m, i) => {
    const a = at(i - 3).t; const b = at(i + 3).t;
    const giro = a.x * b.z - a.z * b.x;
    const peralte = conPeralte ? THREE.MathUtils.clamp(giro * 1.6, -0.3, 0.3) : 0;
    m.peralte = peralte;
    const lat = new THREE.Vector3().crossVectors(m.t, new THREE.Vector3(0, 1, 0)).normalize(); // a la derecha
    lat.applyAxisAngle(m.t, peralte);
    m.n = lat; m.u = new THREE.Vector3().crossVectors(lat, m.t).normalize();
    const info = anchoDe(i / n);
    m.ancho = info.ancho; m.sin = info.sin || 0; m.hueco = Boolean(info.hueco);
  });
  return { muestras, largo, cerrada };
}

/** Construye el circuito: muestras del camino principal y de cada camino alternativo. */
export function construirCircuito(id) {
  const def = CIRCUITOS[id];
  const tr = trazar(def);
  const fr = ([op, u]) => (tr.inicioTramo[op] + u * ((tr.inicioTramo[op + 1] ?? tr.total) - tr.inicioTramo[op])) / tr.total;
  const huecosFr = (def.huecos || []).map(([op, a, b]) => [fr([op, a]), fr([op, b])]);
  const curva = new THREE.CatmullRomCurve3(tr.pts.map((p) => new THREE.Vector3(p.x, p.y, p.z)), true, 'centripetal');
  const infoDe = (u) => {
    const s = u * tr.total; let j = 0;
    while (j < tr.pts.length - 1 && tr.pts[j + 1].s <= s) j += 1;
    const p = tr.pts[j];
    return { ancho: p.ancho, sin: p.sin, hueco: huecosFr.some(([a, b]) => u >= a && u <= b) };
  };
  const principal = muestrear(curva, infoDe, { cerrada: true });
  const M = principal.muestras; const N = M.length;
  const enFr = (f) => M[((Math.round(f * N) % N) + N) % N];
  const idxFr = (f) => ((Math.round(f * N) % N) + N) % N;

  const ramas = def.ramas.map((r) => {
    const f0 = fr(r.desde); const f1 = fr(r.hasta);
    const i0 = idxFr(f0); const i1 = idxFr(f1);
    const a = M[i0]; const b = M[i1];
    let pts;
    if (r.tipo === 'paralela') {
      pts = [];
      const pasos = 16; const tramo = ((i1 - i0 + N) % N);
      for (let k = 0; k <= pasos; k++) {
        const u = k / pasos; const m = M[(i0 + Math.round(u * tramo)) % N];
        const env = suave(Math.min(1, Math.min(u, 1 - u) / 0.22));
        const envY = suave(Math.max(0, Math.min(1, (env - 0.6) / 0.4))); // sube o baja solo cuando ya va separado
        pts.push(m.p.clone().addScaledVector(m.n, r.lado * r.sep * env).add(new THREE.Vector3(0, (r.dy || 0) * envY, 0)));
      }
    } else {
      // Cuerda: curva de Bézier que sale y entra tangente a la pista (sin giros bruscos), algo curvada (curva = metros)
      const L = a.p.distanceTo(b.p);
      const dir = b.p.clone().sub(a.p).setY(0).normalize();
      const lat = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(r.curva || 0);
      const h = Math.min(16, L * 0.2);
      pts = new THREE.CubicBezierCurve3(a.p.clone(), a.p.clone().addScaledVector(a.t, h), b.p.clone().addScaledVector(b.t, -h), b.p.clone()).getPoints(24)
        .map((q, n) => q.addScaledVector(lat, Math.sin((Math.PI * n) / 24) ** 2)); // la curvatura extra no cambia la dirección de salida ni la de entrada
    }
    const curvaR = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const m = muestrear(curvaR, (u) => ({ ancho: r.ancho, sin: r.barandillas ? 0 : 2, hueco: r.hueco ? u >= r.hueco[0] && u <= r.hueco[1] : false }), { peralte: false });
    const lado = (mp, q) => Math.sign(q.clone().sub(mp.p).dot(mp.n)) || 1;
    const largoPpal = ((i1 - i0 + N) % N);
    return { ...r, ...m, i0, i1, s0: a.s, largoPpal, ladoSalida: lado(a, m.muestras[Math.min(8, m.muestras.length - 1)].p), ladoEntrada: lado(b, m.muestras[Math.max(0, m.muestras.length - 9)].p) };
  });

  // Sin peralte cerca de donde salen y entran los caminos (si no, el borde peraltado hace de rampa)
  const factor = new Array(N).fill(1);
  ramas.forEach((r) => [r.i0, r.i1].forEach((ic) => {
    for (let d = -40; d <= 40; d++) { const i = (ic + d + N) % N; factor[i] = Math.min(factor[i], Math.max(0, (Math.abs(d) - 18) / 22)); }
  }));
  M.forEach((m, i) => {
    if (factor[i] >= 1 || !m.peralte) return;
    const lat = new THREE.Vector3().crossVectors(m.t, new THREE.Vector3(0, 1, 0)).normalize();
    lat.applyAxisAngle(m.t, m.peralte * factor[i]);
    m.n = lat; m.u = new THREE.Vector3().crossVectors(lat, m.t).normalize();
  });
  // Huecos en las barandillas del principal donde salen y entran los caminos (y en el propio camino, hacia el principal)
  const huecos = [];
  const dist = (i, j) => Math.min(((j - i) % N + N) % N, ((i - j) % N + N) % N);
  ramas.forEach((r) => {
    const R = r.muestras;
    const junto = (q, centro, rango) => {
      let best = -1; let bd = Infinity;
      for (let d = -rango; d <= rango; d++) { const j = (centro + d + N) % N; const dd = M[j].p.distanceTo(q); if (dd < bd) { bd = dd; best = j; } }
      return { j: best, d: bd };
    };
    const limite = (m) => m.ancho / 2 + r.ancho / 2 + 2.5;
    let finSalida = r.i0; let kSalida = 0;
    for (let k = 0; k < R.length / 2; k++) { const { j, d } = junto(R[k].p, r.i0 + 30, 40); if (d > limite(M[j])) break; if (dist(r.i0, j) < 80) finSalida = j; kSalida = k; }
    let iniEntrada = r.i1; let kEntrada = R.length - 1;
    for (let k = R.length - 1; k > R.length / 2; k--) { const { j, d } = junto(R[k].p, r.i1 - 30, 40); if (d > limite(M[j])) break; if (dist(r.i1, j) < 80) iniEntrada = j; kEntrada = k; }
    huecos.push({ desde: r.i0 - 3, hasta: r.i0 + ((finSalida - r.i0 + N) % N) + 8, lado: r.ladoSalida });
    huecos.push({ desde: r.i1 - ((r.i1 - iniEntrada + N) % N) - 8, hasta: r.i1 + 3, lado: r.ladoEntrada });
    const ladoRama = (k, j) => Math.sign(M[j].p.clone().sub(R[k].p).dot(R[k].n)) || 1;
    r.huecos = [{ desde: 0, hasta: kSalida + 8, lado: ladoRama(Math.min(kSalida, R.length - 1), r.i0) }, { desde: kEntrada - 8, hasta: R.length, lado: ladoRama(kEntrada, r.i1) }];
    // En las rutas paralelas, sin barandilla por el lado del principal: así no queda una «V» entre las dos barandillas
    // donde encajarse al separarse (si te equivocas, caes al vacío y vuelves a la pista)
    if (r.tipo === 'paralela') { const kc = Math.floor(R.length / 2); r.huecos.push({ desde: 0, hasta: R.length, lado: ladoRama(kc, (r.i0 + Math.round(r.largoPpal / 2)) % N) }); }
  });
  // Tramos sin barandilla del principal
  M.forEach((m, i) => {
    if (m.sin === 1 || m.sin === 2) huecos.push({ desde: i, hasta: i, lado: 1 });
    if (m.sin === -1 || m.sin === 2) huecos.push({ desde: i, hasta: i, lado: -1 });
    if (m.hueco) huecos.push({ desde: i, hasta: i, lado: 1 }, { desde: i, hasta: i, lado: -1 });
  });

  const enRama = (r, f) => r.muestras[Math.round(f * (r.muestras.length - 1))];
  const fila = (m, n = 4) => Array.from({ length: n }, (_, k) => m.p.clone().addScaledVector(m.n, ((k + 0.5) / n - 0.5) * m.ancho * 0.8).addScaledVector(m.u, 0.8));
  const cajas = [...def.cajas.map((c) => fila(enFr(fr(c)))), ...ramas.flatMap((r) => (r.cajas || []).map((f) => fila(enRama(r, f), 2)))].flat();
  const turbos = [...def.turbos.map((c) => ({ m: enFr(fr(c)) })), ...ramas.flatMap((r) => (r.turbos || []).map((f) => ({ m: enRama(r, f) })))];
  // Rampas de salto: 3 m antes de cada hueco (del principal y de los caminos)
  const saltos = [];
  M.forEach((m, i) => { if (m.hueco && !M[(i - 1 + N) % N].hueco) saltos.push({ m: M[(i - 3 + N) % N] }); });
  ramas.forEach((r) => r.muestras.forEach((m, k) => { if (m.hueco && k > 0 && !r.muestras[k - 1].hueco) saltos.push({ m: r.muestras[Math.max(0, k - 3)] }); }));
  return { id, def, principal, ramas, huecos, cajas, turbos, saltos, vueltas: def.vueltas || 3, salida: M[0], meta: M[0], N };
}

/** Índice del principal con vuelta (0..N-1). */
export const envolver = (c, i) => ((i % c.N) + c.N) % c.N;

/**
 * Posición de un punto en el circuito: muestra del principal más cercana (buscando cerca de la última) o, si va por un
 * camino alternativo, la muestra de ese camino. Devuelve también la «s» equivalente en el principal (para el progreso).
 */
export function progresoDe(c, p, pista = { i: 0 }) {
  const M = c.principal.muestras; const N = c.N;
  let mejor = { d: Infinity, s: 0, i: pista.i, rama: null, k: 0, m: M[pista.i] };
  for (let d = -40; d <= 70; d++) {
    const i = (pista.i + d + N) % N; const dd = M[i].p.distanceToSquared(p);
    if (dd < mejor.d) mejor = { d: dd, s: M[i].s, i, rama: null, k: i, m: M[i] };
  }
  c.ramas.forEach((r, ri) => {
    const dentro = ((pista.i - r.i0 + N) % N) <= r.largoPpal + 25 || ((r.i0 - pista.i + N) % N) < 25;
    if (!dentro) return;
    const R = r.muestras;
    for (let k = 0; k < R.length; k += 1) {
      const dd = R[k].p.distanceToSquared(p);
      if (dd < mejor.d - 0.01) mejor = { d: dd, s: r.s0 + (k / (R.length - 1)) * r.largoPpal * (c.principal.largo / N), i: mejor.i, rama: ri, k, m: R[k] };
    }
  });
  if (mejor.rama === null) pista.i = mejor.i;
  else pista.i = envolver(c, c.ramas[mejor.rama].i0 + Math.round((mejor.k / (c.ramas[mejor.rama].muestras.length - 1)) * c.ramas[mejor.rama].largoPpal));
  return { s: mejor.s % c.principal.largo, dist: Math.sqrt(mejor.d), rama: mejor.rama, k: mejor.k, i: pista.i, m: mejor.m };
}
