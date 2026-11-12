// client/src/games/Crimen/generador.js
// Generador de casos de «Escena del Crimen» (puzle de deducción para 1 jugador).
// Cuadrícula N×N dividida en habitaciones y con muebles. Hay N personas (la víctima y N−1 sospechosos) y cada fila y
// cada columna tiene exactamente una persona. Nadie puede estar encima de una mesa, una planta o una estantería
// (sí en una silla, una alfombra o una cama). El asesino es el ÚNICO sospechoso que estaba en la misma habitación que
// la víctima. Se generan pistas verdaderas hasta que la solución es única y luego se quitan las que sobran.

export const MUEBLES = {
  mesa: { e: '🍽️', nombre: 'una mesa', bloquea: true },
  planta: { e: '🪴', nombre: 'una planta', bloquea: true },
  estanteria: { e: '📚', nombre: 'una estantería', bloquea: true },
  silla: { e: '🪑', nombre: 'una silla', sobre: 'sentado en una silla' },
  alfombra: { e: '🧶', nombre: 'una alfombra', sobre: 'de pie sobre una alfombra' },
  cama: { e: '🛏️', nombre: 'una cama', sobre: 'tumbado en una cama' }
};
const SALAS = ['Cocina', 'Salón', 'Biblioteca', 'Dormitorio', 'Baño', 'Jardín', 'Despacho', 'Comedor'];
const COLORES_SALA = ['#fde68a', '#bfdbfe', '#bbf7d0', '#fbcfe8', '#ddd6fe', '#fed7aa', '#a5f3fc', '#e5e7eb'];
export const PERSONAS = [
  { nombre: 'Víctor', e: '💀', victima: true },
  { nombre: 'Ana', e: '👩‍🦰' }, { nombre: 'Bruno', e: '🧔' }, { nombre: 'Carla', e: '👩‍🦱' },
  { nombre: 'Darío', e: '👨‍🦳' }, { nombre: 'Elsa', e: '👱‍♀️' }, { nombre: 'Fede', e: '🧑‍🦲' }
];
export const NIVELES = {
  facil: { n: 5, nombre: 'Fácil', directas: true },
  normal: { n: 6, nombre: 'Normal', directas: true },
  dificil: { n: 6, nombre: 'Difícil', directas: false }
};
export const COLUMNAS = 'ABCDEF';

function rngDe(semilla) {
  let s = semilla >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const barajar = (l, r) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// ---------------------------------------------------------------- Plano
function habitaciones(n, r) {
  const total = n;
  for (let intento = 0; intento < 200; intento++) {
    const sala = Array(n * n).fill(-1);
    const semillas = barajar([...Array(n * n).keys()], r).slice(0, total);
    semillas.forEach((c, i) => { sala[c] = i; });
    let libres = n * n - total;
    while (libres > 0) {
      const c = Math.floor(r() * n * n);
      if (sala[c] !== -1) continue;
      const vec = vecinos(c, n).filter((v) => sala[v] !== -1);
      if (!vec.length) continue;
      sala[c] = sala[vec[Math.floor(r() * vec.length)]];
      libres -= 1;
    }
    const tam = Array(total).fill(0); sala.forEach((s) => { tam[s] += 1; });
    if (tam.every((t) => t >= 3)) return sala;
  }
  return null;
}
export function vecinos(c, n) {
  const f = Math.floor(c / n); const k = c % n; const v = [];
  if (f > 0) v.push(c - n); if (f < n - 1) v.push(c + n); if (k > 0) v.push(c - 1); if (k < n - 1) v.push(c + 1);
  return v;
}

// ---------------------------------------------------------------- Pistas
// Unarias: (persona, celda) → bool. Binarias: (celdaA, celdaB) → bool.
function pistasVerdaderas(caso, directas) {
  const { n, sala, mueble, pos, personas } = caso;
  const fila = (c) => Math.floor(c / n); const col = (c) => c % n;
  const borde = (c) => fila(c) === 0 || col(c) === 0 || fila(c) === n - 1 || col(c) === n - 1;
  const junto = (c, tipo) => vecinos(c, n).some((v) => mueble[v] === tipo);
  const out = [];
  const U = (p, texto, f, peso = 1) => out.push({ tipo: 'u', p, texto, f, peso });
  const B = (a, b, texto, f, peso = 1) => out.push({ tipo: 'b', a, b, texto, f, peso });
  personas.forEach((per, p) => {
    const c = pos[p]; const nom = per.nombre;
    const s = sala[c];
    U(p, `${nom} estaba en ${art(caso.salas[s])}.`, (x) => sala[x] === s, 3);
    caso.salas.forEach((nombreSala, k) => { if (k !== s) U(p, `${nom} no estaba en ${art(nombreSala)}.`, (x) => sala[x] !== k, 1); });
    if (mueble[c] && MUEBLES[mueble[c]].sobre) U(p, `${nom} estaba ${MUEBLES[mueble[c]].sobre}.`, (x) => mueble[x] === mueble[c], 3);
    if (!mueble[c]) U(p, `${nom} estaba en el suelo, sin ningún mueble debajo.`, (x) => !mueble[x], 1);
    ['mesa', 'planta', 'estanteria', 'silla', 'cama'].forEach((t) => {
      if (junto(c, t)) U(p, `${nom} estaba junto a ${MUEBLES[t].nombre}.`, (x) => junto(x, t), 2);
    });
    U(p, borde(c) ? `${nom} estaba pegado a una pared exterior.` : `${nom} no estaba pegado a ninguna pared exterior.`, (x) => borde(x) === borde(c), 1);
    if (directas) {
      U(p, `${nom} estaba en la fila ${fila(c) + 1}.`, (x) => fila(x) === fila(c), 1);
      U(p, `${nom} estaba en la columna ${COLUMNAS[col(c)]}.`, (x) => col(x) === col(c), 1);
    }
  });
  for (let a = 0; a < personas.length; a++) {
    for (let b = 0; b < personas.length; b++) {
      if (a === b) continue;
      const A = personas[a].nombre; const Bn = personas[b].nombre; const ca = pos[a]; const cb = pos[b];
      if (fila(ca) < fila(cb)) B(a, b, `${A} estaba más al norte (más arriba) que ${Bn}.`, (x, y) => fila(x) < fila(y), 2);
      if (col(ca) < col(cb)) B(a, b, `${A} estaba más al oeste (más a la izquierda) que ${Bn}.`, (x, y) => col(x) < col(y), 2);
      if (a < b && sala[ca] !== sala[cb]) B(a, b, `${A} y ${Bn} estaban en habitaciones distintas.`, (x, y) => sala[x] !== sala[y], 1);
    }
  }
  return out;
}
const art = (s) => ({ Cocina: 'la cocina', Salón: 'el salón', Biblioteca: 'la biblioteca', Dormitorio: 'el dormitorio', Baño: 'el baño', Jardín: 'el jardín', Despacho: 'el despacho', Comedor: 'el comedor' }[s] || s);

// ---------------------------------------------------------------- Resolutor (cuenta soluciones, hasta `tope`)
export function contarSoluciones(caso, pistas, tope = 2) {
  const { n, mueble, personas } = caso;
  const libres = [...Array(n * n).keys()].filter((c) => !mueble[c] || !MUEBLES[mueble[c]].bloquea);
  const cand = personas.map((_, p) => libres.filter((c) => pistas.every((q) => q.tipo !== 'u' || q.p !== p || q.f(c))));
  const orden = personas.map((_, p) => p).sort((a, b) => cand[a].length - cand[b].length);
  const binarias = pistas.filter((q) => q.tipo === 'b');
  const pos = Array(personas.length).fill(-1);
  const filas = new Set(); const cols = new Set();
  let total = 0;
  const salaDe = (c) => caso.sala[c];
  // Regla del asesino: en la habitación de la víctima hay exactamente un sospechoso más
  const victima = personas.findIndex((x) => x.victima);
  function vale() {
    const s = salaDe(pos[victima]);
    return pos.filter((c, p) => p !== victima && salaDe(c) === s).length === 1;
  }
  function rec(k) {
    if (total >= tope) return;
    if (k === orden.length) { if (vale()) total += 1; return; }
    const p = orden[k];
    for (const c of cand[p]) {
      const f = Math.floor(c / n); const col = c % n;
      if (filas.has(f) || cols.has(col)) continue;
      pos[p] = c;
      const ok = binarias.every((q) => (q.a !== p && q.b !== p) || pos[q.a] < 0 || pos[q.b] < 0 || q.f(pos[q.a], pos[q.b]));
      if (ok) { filas.add(f); cols.add(col); rec(k + 1); filas.delete(f); cols.delete(col); }
      pos[p] = -1;
      if (total >= tope) return;
    }
  }
  rec(0);
  return total;
}

// ---------------------------------------------------------------- Caso
export function generarCaso(nivel = 'normal', semilla = Date.now()) {
  const cfg = NIVELES[nivel] || NIVELES.normal;
  const n = cfg.n;
  const r = rngDe(semilla);
  for (let intento = 0; intento < 400; intento++) {
    const sala = habitaciones(n, r);
    if (!sala) continue;
    const salas = barajar(SALAS, r).slice(0, n);
    const mueble = Array(n * n).fill(null);
    const tipos = Object.keys(MUEBLES);
    barajar([...Array(n * n).keys()], r).slice(0, Math.round(n * n * 0.42)).forEach((c) => { mueble[c] = tipos[Math.floor(r() * tipos.length)]; });
    const personas = [PERSONAS[0], ...barajar(PERSONAS.slice(1), r).slice(0, n - 1)];
    // Solución: una persona por fila y columna, nunca encima de un mueble que bloquea
    const filasP = barajar([...Array(n).keys()], r); const colsP = barajar([...Array(n).keys()], r);
    const pos = personas.map((_, p) => filasP[p] * n + colsP[p]);
    if (pos.some((c) => mueble[c] && MUEBLES[mueble[c]].bloquea)) continue;
    const sv = sala[pos[0]];
    const conVictima = pos.slice(1).map((c, i) => [c, i + 1]).filter(([c]) => sala[c] === sv);
    if (conVictima.length !== 1) continue;
    const caso = { n, sala, salas, colores: COLORES_SALA, mueble, personas, pos, asesino: conVictima[0][1], semilla };
    const todas = barajar(pistasVerdaderas(caso, cfg.directas), r).sort((a, b) => b.peso - a.peso + (r() - 0.5) * 2.2);
    // Añadir pistas hasta que haya una sola solución
    const elegidas = [];
    let unica = false;
    for (const q of todas) {
      elegidas.push(q);
      if (elegidas.length >= n && contarSoluciones(caso, elegidas) === 1) { unica = true; break; }
    }
    if (!unica) continue;
    // Quitar las que sobran
    for (let i = elegidas.length - 1; i >= 0; i--) {
      const sin = elegidas.filter((_, k) => k !== i);
      if (contarSoluciones(caso, sin) === 1) elegidas.splice(i, 1);
    }
    caso.pistas = barajar(elegidas, r).map((q) => q.texto);
    return caso;
  }
  throw new Error('No se ha podido generar el caso.');
}
