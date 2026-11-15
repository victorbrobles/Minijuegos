// client/src/games/Canicas/circuitos.js
// Circuitos de «Carrera de Canicas»: un camino principal en bajada (curva suave por puntos de control) con
// ramales que salen y vuelven a entrar: atajos estrechos sin barandilla, rampas de turbos… Todo se construye a
// partir de muestras cada metro: posición, tangente, lateral (con peralte), ancho y distancia recorrida.
import * as THREE from 'three';

export const CIRCUITOS = {
  valle: {
    nombre: 'Valle Verde', emoji: '🌿', cielo: 0x93c5fd, suelo: 0x4ade80, borde: 0xf8fafc, ancho: 7,
    puntos: [[0, 36, 10], [0, 35, 0], [0, 32, -30], [15, 30, -46], [35, 28, -48], [52, 26, -32], [54, 24, -5], [46, 22, 18], [25, 20, 30], [0, 18, 32],
      [-25, 16, 26], [-38, 14, 6], [-40, 12, -22], [-28, 10, -46], [-2, 8, -58], [26, 6, -64], [50, 4, -62]],
    ramas: [
      { desde: 2, hasta: 6, puntos: [[16, 30, -36], [38, 26, -18]], ancho: 3, barandillas: false, nombre: 'Atajo del puente' },
      { desde: 9, hasta: 12, puntos: [[-16, 16, 14], [-30, 13, -6]], ancho: 3.4, barandillas: false, nombre: 'Atajo del bosque' }
    ],
    cajas: [0.12, 0.33, 0.55, 0.78], turbos: [0.2, 0.47, 0.7, 0.9]
  },
  canon: {
    nombre: 'Cañón Rojo', emoji: '🏜️', cielo: 0xfdba74, suelo: 0xd97706, borde: 0x7c2d12, ancho: 6.5,
    puntos: [[0, 50, 0], [0, 49, -12], [0, 46, -40], [-20, 43, -55], [-45, 40, -48], [-52, 37, -25], [-35, 34, -8], [-5, 31, -2], [25, 28, -8], [45, 25, -25],
      [52, 22, -50], [40, 19, -72], [15, 16, -80], [-15, 13, -78], [-38, 10, -90], [-40, 7, -115], [-20, 4, -130], [10, 2, -128]],
    ramas: [
      { desde: 3, hasta: 6, puntos: [[-30, 41, -42], [-34, 37, -25]], ancho: 2.8, barandillas: false, nombre: 'Cornisa' },
      { desde: 9, hasta: 12, puntos: [[38, 23, -50], [28, 18, -70]], ancho: 3.6, barandillas: true, nombre: 'Túnel de turbos', turbos: [0.3, 0.7] },
      { desde: 13, hasta: 16, puntos: [[-24, 10, -98], [-28, 6, -118]], ancho: 3.2, barandillas: false, nombre: 'Barranco' }
    ],
    cajas: [0.1, 0.3, 0.5, 0.68, 0.85], turbos: [0.16, 0.42, 0.62, 0.93]
  },
  espiral: {
    nombre: 'Espiral Helada', emoji: '❄️', cielo: 0xe0f2fe, suelo: 0xbae6fd, borde: 0x0ea5e9, ancho: 7.5, hielo: true,
    puntos: (() => {
      const pts = [[32, 62, 34], [16, 60, 34]];
      for (let k = 0; k <= 26; k++) { const a = Math.PI / 2 + (k / 26) * Math.PI * 4.2; const r = 34 - k * 0.5; pts.push([Math.cos(a) * r, 58 - k * 2, Math.sin(a) * r]); }
      return pts;
    })(),
    ramas: [
      { desde: 8, hasta: 16, puntos: [[-4, 40, 6], [6, 32, -6]], ancho: 3, barandillas: false, nombre: 'Tobogán central' }
    ],
    cajas: [0.1, 0.28, 0.46, 0.64, 0.82], turbos: [0.18, 0.38, 0.58, 0.76]
  }
};
export const IDS_CIRCUITOS = Object.keys(CIRCUITOS);

const V = (a) => new THREE.Vector3(...a);
function muestrear(curva, ancho, conPeralte = true) {
  const largo = curva.getLength();
  const n = Math.max(2, Math.round(largo / 1));
  const pts = curva.getSpacedPoints(n);
  const muestras = pts.map((p, i) => {
    const t = curva.getTangentAt(i / n).normalize();
    return { p, t, s: (i / n) * largo };
  });
  // Peralte según la curvatura (hacia dentro de la curva)
  muestras.forEach((m, i) => {
    const a = muestras[Math.max(0, i - 3)].t; const b = muestras[Math.min(muestras.length - 1, i + 3)].t;
    const giro = a.x * b.z - a.z * b.x; // signo = sentido de giro
    const peralte = conPeralte ? THREE.MathUtils.clamp(giro * 1.4, -0.32, 0.32) : 0;
    const lat = new THREE.Vector3().crossVectors(m.t, new THREE.Vector3(0, 1, 0)).normalize(); // a la derecha
    lat.applyAxisAngle(m.t, peralte);
    m.n = lat; m.u = new THREE.Vector3().crossVectors(lat, m.t).normalize(); m.ancho = ancho;
  });
  return { muestras, largo };
}

/** Construye el circuito: muestras del camino principal y de cada ramal (con su tramo equivalente del principal). */
export function construirCircuito(id) {
  const def = CIRCUITOS[id];
  const curva = new THREE.CatmullRomCurve3(def.puntos.map(V), false, 'centripetal');
  const principal = muestrear(curva, def.ancho);
  const cerca = (punto) => principal.muestras.reduce((best, m, i) => (m.p.distanceToSquared(punto) < principal.muestras[best].p.distanceToSquared(punto) ? i : best), 0);
  const ramas = def.ramas.map((r) => {
    const i0 = cerca(V(def.puntos[r.desde])); const i1 = cerca(V(def.puntos[r.hasta]));
    const a = principal.muestras[i0]; const b = principal.muestras[i1];
    const curvaR = new THREE.CatmullRomCurve3([a.p.clone(), ...r.puntos.map(V), b.p.clone()], false, 'centripetal');
    const m = muestrear(curvaR, r.ancho, false);
    // Lado del principal por el que sale y entra (para abrir la barandilla)
    const lado = (mp, q) => Math.sign(q.clone().sub(mp.p).dot(mp.n)) || 1;
    return { ...r, ...m, i0, i1, s0: a.s, s1: b.s, ladoSalida: lado(a, m.muestras[Math.min(6, m.muestras.length - 1)].p), ladoEntrada: lado(b, m.muestras[Math.max(0, m.muestras.length - 7)].p) };
  });
  // Huecos en las barandillas mientras el ramal y el principal van pegados (al salir y al entrar)
  const huecos = [];
  ramas.forEach((r) => {
    const R = r.muestras; const PM = principal.muestras;
    const junto = (q, desde, hasta) => {
      let best = -1; let bd = Infinity;
      for (let j = Math.max(0, desde); j <= Math.min(PM.length - 1, hasta); j++) { const d = PM[j].p.distanceTo(q); if (d < bd) { bd = d; best = j; } }
      return { j: best, d: bd };
    };
    const limite = def.ancho / 2 + r.ancho / 2 + 1.2;
    let finSalida = r.i0; let kSalida = 0;
    for (let k = 0; k < R.length / 2; k++) { const { j, d } = junto(R[k].p, r.i0 - 5, r.i0 + 80); if (d > limite) break; finSalida = Math.max(finSalida, j); kSalida = k; }
    let iniEntrada = r.i1; let kEntrada = R.length - 1;
    for (let k = R.length - 1; k > R.length / 2; k--) { const { j, d } = junto(R[k].p, r.i1 - 80, r.i1 + 5); if (d > limite) break; iniEntrada = Math.min(iniEntrada, j); kEntrada = k; }
    huecos.push({ desde: r.i0 - 2, hasta: finSalida + 3, lado: r.ladoSalida }, { desde: iniEntrada - 3, hasta: r.i1 + 2, lado: r.ladoEntrada });
    // En el propio ramal, abierto hacia el principal en esos tramos
    const ladoRama = (k, j) => Math.sign(PM[j].p.clone().sub(R[k].p).dot(R[k].n)) || 1;
    r.huecos = [{ desde: 0, hasta: kSalida + 3, lado: ladoRama(Math.min(kSalida, R.length - 1), r.i0) }, { desde: kEntrada - 3, hasta: R.length, lado: ladoRama(kEntrada, r.i1) }];
  });
  const enS = (frac) => principal.muestras[Math.round(frac * (principal.muestras.length - 1))];
  const cajas = def.cajas.map((f) => { const m = enS(f); return [-0.33, 0, 0.33].map((k) => m.p.clone().addScaledVector(m.n, k * m.ancho).addScaledVector(m.u, 0.8)); }).flat();
  const turbos = [...def.turbos.map((f) => ({ m: enS(f) })), ...ramas.flatMap((r) => (r.turbos || []).map((f) => ({ m: r.muestras[Math.round(f * (r.muestras.length - 1))] })))];
  return { id, def, principal, ramas, huecos, cajas, turbos, salida: principal.muestras[3], meta: principal.muestras[principal.muestras.length - 4] };
}

/** Progreso (0-1) de un punto: el del principal más cercano, o el equivalente si va por un ramal. */
export function progresoDe(c, p, pista = { i: 0 }) {
  const M = c.principal.muestras;
  let mejor = { d: Infinity, s: 0, i: pista.i, rama: null, k: 0 };
  const desde = Math.max(0, pista.i - 40); const hasta = Math.min(M.length - 1, pista.i + 60);
  for (let i = desde; i <= hasta; i++) { const d = M[i].p.distanceToSquared(p); if (d < mejor.d) mejor = { d, s: M[i].s, i, rama: null, k: i }; }
  c.ramas.forEach((r, ri) => {
    const R = r.muestras;
    for (let k = 0; k < R.length; k += 2) {
      const d = R[k].p.distanceToSquared(p);
      if (d < mejor.d) mejor = { d, s: r.s0 + (k / (R.length - 1)) * (r.s1 - r.s0), i: mejor.i, rama: ri, k };
    }
  });
  if (mejor.rama === null) pista.i = mejor.i;
  else pista.i = Math.round((mejor.s / c.principal.largo) * (M.length - 1));
  return { prog: mejor.s / c.principal.largo, dist: Math.sqrt(mejor.d), rama: mejor.rama, k: mejor.k, i: pista.i };
}
