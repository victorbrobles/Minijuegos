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
  silla: { e: '🪑', nombre: 'una silla', sobre: ['sentado en una silla', 'sentada en una silla'] },
  alfombra: { e: '🧶', nombre: 'una alfombra', sobre: ['de pie sobre una alfombra', 'de pie sobre una alfombra'] },
  cama: { e: '🛏️', nombre: 'una cama', sobre: ['tumbado en una cama', 'tumbada en una cama'] }
};
const SALAS = ['Cocina', 'Salón', 'Biblioteca', 'Dormitorio', 'Baño', 'Jardín', 'Despacho', 'Comedor'];
const COLORES_SALA = ['#fde68a', '#bfdbfe', '#bbf7d0', '#fbcfe8', '#ddd6fe', '#fed7aa', '#a5f3fc', '#e5e7eb'];
export const PERSONAS = [
  { nombre: 'Víctor', e: '💀', victima: true },
  { nombre: 'Ana', e: '👩‍🦰', f: true }, { nombre: 'Bruno', e: '🧔' }, { nombre: 'Carla', e: '👩‍🦱', f: true },
  { nombre: 'Darío', e: '👨‍🦳' }, { nombre: 'Elsa', e: '👱‍♀️', f: true }, { nombre: 'Fede', e: '🧑‍🦲' },
  { nombre: 'Gloria', e: '👩‍🦳', f: true }
];
export const NIVELES = {
  facil: { n: 5, nombre: 'Fácil', directas: true },
  normal: { n: 6, nombre: 'Normal', directas: true },
  // 8×8 sin pistas de fila/columna y con las pistas más débiles primero: hay que encadenar muchas deducciones
  // 8×8 con UNA sola afirmación por personaje (algunas combinan dos datos) y una condición general
  experto: { n: 8, nombre: 'Experto', directas: false, unaPorPersona: true }
};
export const COLUMNAS = 'ABCDEFGH';

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
    const g = per.f ? 1 : 0; // concordancia: sentado / sentada
    if (mueble[c] && MUEBLES[mueble[c]].sobre) U(p, `${nom} estaba ${MUEBLES[mueble[c]].sobre[g]}.`, (x) => mueble[x] === mueble[c], 3);
    if (!mueble[c]) U(p, `${nom} estaba en el suelo, sin ningún mueble debajo.`, (x) => !mueble[x], 1);
    ['mesa', 'planta', 'estanteria', 'silla', 'cama'].forEach((t) => {
      if (junto(c, t)) U(p, `${nom} estaba junto a ${MUEBLES[t].nombre}.`, (x) => junto(x, t), 2);
    });
    const pegado = per.f ? 'pegada' : 'pegado';
    U(p, borde(c) ? `${nom} estaba ${pegado} a una pared exterior.` : `${nom} no estaba ${pegado} a ninguna pared exterior.`, (x) => borde(x) === borde(c), 1);
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
  if (cand.some((l) => !l.length)) return 0;
  const binarias = pistas.filter((q) => q.tipo === 'b');
  const globales = pistas.filter((q) => q.tipo === 'g');
  const porPersona = personas.map((_, p) => binarias.filter((q) => q.a === p || q.b === p));
  const pos = Array(personas.length).fill(-1);
  const filas = Array(n).fill(false); const cols = Array(n).fill(false);
  let total = 0;
  const sala = caso.sala;
  // Regla del asesino: en la habitación de la víctima hay exactamente un sospechoso más
  const victima = personas.findIndex((x) => x.victima);
  const vale = () => pos.filter((c, p) => p !== victima && sala[c] === sala[pos[victima]]).length === 1;
  const encaja = (p, c) => !filas[Math.floor(c / n)] && !cols[c % n]
    && porPersona[p].every((q) => { const x = q.a === p ? c : pos[q.a]; const y = q.b === p ? c : pos[q.b]; return x < 0 || y < 0 || q.f(x, y); });
  function rec(colocados) {
    if (total >= tope) return;
    if (colocados === personas.length) { if (vale() && globales.every((q) => q.f(pos))) total += 1; return; }
    // Se coloca primero a quien menos opciones le quedan (y si alguien no tiene ninguna, se corta aquí)
    let mejor = -1; let opciones = null;
    for (let p = 0; p < personas.length; p++) {
      if (pos[p] >= 0) continue;
      const o = cand[p].filter((c) => encaja(p, c));
      if (!o.length) return;
      if (!opciones || o.length < opciones.length) { mejor = p; opciones = o; if (o.length === 1) break; }
    }
    for (const c of opciones) {
      pos[mejor] = c; filas[Math.floor(c / n)] = true; cols[c % n] = true;
      rec(colocados + 1);
      pos[mejor] = -1; filas[Math.floor(c / n)] = false; cols[c % n] = false;
      if (total >= tope) return;
    }
  }
  rec(0);
  return total;
}


// ---------------------------------------------------------------- Nivel experto: una afirmación por personaje
/** Afirmaciones verdaderas posibles sobre cada persona (algunas combinan dos datos en una sola frase). */
function afirmacionesDe(caso) {
  const { n, sala, mueble, pos, personas } = caso;
  const fila = (c) => Math.floor(c / n); const col = (c) => c % n;
  const borde = (c) => fila(c) === 0 || col(c) === 0 || fila(c) === n - 1 || col(c) === n - 1;
  const junto = (c, t) => vecinos(c, n).some((v) => mueble[v] === t);
  return personas.map((per, p) => {
    const c = pos[p]; const nom = per.nombre; const g = per.f ? 1 : 0; const s = sala[c]; const enSala = art(caso.salas[s]);
    const pegado = per.f ? 'pegada' : 'pegado';
    const sobre = mueble[c] && MUEBLES[mueble[c]].sobre ? mueble[c] : null;
    const juntoA = ['mesa', 'planta', 'estanteria', 'silla', 'cama'].filter((t) => junto(c, t));
    const L = [];
    const U = (texto, f, fuerza) => L.push({ tipo: 'u', p, texto, f, fuerza });
    U(`${nom} estaba en ${enSala}.`, (x) => sala[x] === s, 2);
    if (sobre) {
      U(`${nom} estaba ${MUEBLES[sobre].sobre[g]}.`, (x) => mueble[x] === sobre, 2);
      U(`${nom} estaba en ${enSala}, ${MUEBLES[sobre].sobre[g]}.`, (x) => sala[x] === s && mueble[x] === sobre, 3);
    } else {
      U(`${nom} estaba en ${enSala}, de pie en el suelo.`, (x) => sala[x] === s && !mueble[x], 3);
    }
    juntoA.forEach((t) => {
      U(`${nom} estaba junto a ${MUEBLES[t].nombre}.`, (x) => junto(x, t), 1);
      U(`${nom} estaba en ${enSala}, junto a ${MUEBLES[t].nombre}.`, (x) => sala[x] === s && junto(x, t), 3);
      if (sobre) U(`${nom} estaba ${MUEBLES[sobre].sobre[g]}, junto a ${MUEBLES[t].nombre}.`, (x) => mueble[x] === sobre && junto(x, t), 3);
    });
    U(borde(c) ? `${nom} estaba en ${enSala}, ${pegado} a una pared exterior.` : `${nom} estaba en ${enSala}, lejos de las paredes exteriores.`,
      (x) => sala[x] === s && borde(x) === borde(c), 3);
    return L;
  });
}

/** Condiciones generales verdaderas («Solo una persona estaba tumbada en una cama», «Nadie estaba en el jardín»…). */
function condicionesGenerales(caso) {
  const { sala, mueble, pos, salas } = caso;
  const out = [];
  const G = (texto, f) => out.push({ tipo: 'g', texto, f });
  const cuenta = (ps, pred) => ps.filter((c) => c >= 0 && pred(c)).length;
  const nombre = { silla: ['nadie estaba sentado en una silla', 'solo una persona estaba sentada en una silla', 'exactamente dos personas estaban sentadas en una silla'],
    cama: ['nadie estaba tumbado en una cama', 'solo una persona estaba tumbada en una cama', 'exactamente dos personas estaban tumbadas en una cama'],
    alfombra: ['nadie estaba sobre una alfombra', 'solo una persona estaba sobre una alfombra', 'exactamente dos personas estaban sobre una alfombra'] };
  for (const t of ['silla', 'cama', 'alfombra']) {
    const k = cuenta(pos, (c) => mueble[c] === t);
    if (k <= 2) G(`Además, ${nombre[t][k]}.`, (ps) => cuenta(ps, (c) => mueble[c] === t) === k);
  }
  const enSuelo = cuenta(pos, (c) => !mueble[c]);
  G(`Además, exactamente ${enSuelo} ${enSuelo === 1 ? 'persona estaba' : 'personas estaban'} en el suelo, sin ningún mueble debajo.`, (ps) => cuenta(ps, (c) => !mueble[c]) === enSuelo);
  salas.forEach((nom, k) => {
    if (!pos.some((c) => sala[c] === k)) G(`Además, nadie estaba en ${art(nom)}.`, (ps) => !ps.some((c) => c >= 0 && sala[c] === k));
  });
  return out;
}

/** Elige una afirmación por persona (y una condición general) hasta que la solución sea única. */
function pistasUnaPorPersona(caso, r, limiteMs = 900) {
  const t0 = Date.now();
  const porPersona = afirmacionesDe(caso);
  const generales = condicionesGenerales(caso);
  // Comprobación rápida: con lo más fuerte de cada uno y todas las generales, ¿hay solución única?
  const fuertes = porPersona.map((l) => l.filter((q) => q.fuerza === 3));
  if (contarSoluciones(caso, [...porPersona.flat(), ...generales]) !== 1) return null;
  for (let intento = 0; Date.now() - t0 < limiteMs; intento++) {
    // Al principio se prueban pistas más débiles (más difícil); poco a poco se permiten más fuertes
    const debil = Math.max(0, 0.6 - intento * 0.004);
    const elegidas = porPersona.map((l, p) => {
      const pool = r() < debil ? l.filter((q) => q.fuerza < 3) : fuertes[p];
      const lista = pool.length ? pool : l;
      return lista[Math.floor(r() * lista.length)];
    });
    const g = generales[Math.floor(r() * generales.length)];
    if (contarSoluciones(caso, [...elegidas, g]) === 1) return [g, ...elegidas];
  }
  return null;
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
    if (cfg.unaPorPersona) {
      const pistas = pistasUnaPorPersona(caso, r);
      if (!pistas) continue;
      // La condición general va al final; las de los personajes, en orden de aparición
      caso.pistas = [...pistas.slice(1).map((q) => q.texto), pistas[0].texto];
      return caso;
    }
    const todas = barajar(pistasVerdaderas(caso, cfg.directas), r)
      .sort((a, b) => (cfg.debiles ? a.peso - b.peso : b.peso - a.peso) + (r() - 0.5) * 2.2);
    // Si ni con todas las pistas hay una sola solución, se descarta este plano
    const tIntento = Date.now();
    if (contarSoluciones(caso, todas) !== 1) continue;
    // Añadir pistas hasta que haya una sola solución (comprobando cada pocas pistas)
    const elegidas = [];
    const paso = cfg.debiles ? 3 : 1;
    let unica = false;
    let lento = false;
    for (const q of todas) {
      elegidas.push(q);
      if (elegidas.length >= n && elegidas.length % paso === 0 && contarSoluciones(caso, elegidas) === 1) { unica = true; break; }
      // Un plano que cuesta tanto resolver se cambia por otro (en el móvil no puede tardar)
      if (Date.now() - tIntento > 700) { lento = true; break; }
    }
    if (lento) continue;
    if (!unica) unica = contarSoluciones(caso, elegidas) === 1;
    if (!unica) continue;
    // Quitar las que sobran
    for (let i = elegidas.length - 1; i >= 0; i--) {
      if (Date.now() - tIntento > 1000) break; // sin pasarse de tiempo: alguna pista de más no rompe nada
      const sin = elegidas.filter((_, k) => k !== i);
      if (contarSoluciones(caso, sin) === 1) elegidas.splice(i, 1);
    }
    caso.pistas = barajar(elegidas, r).map((q) => q.texto);
    return caso;
  }
  throw new Error('No se ha podido generar el caso.');
}
