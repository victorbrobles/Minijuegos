// server/unapieza/engine.js
// «Una Pieza Más»: motor puro (sin red). Se copia al cliente con `npm run sync:unapieza`.
// Tablero compartido con una silueta que hay que rellenar. Por turnos, cada jugador coloca una de sus tres piezas
// (girándola o dándole la vuelta) dentro de los huecos libres. Puntúan las casillas, las filas y columnas que se
// cierran, el objetivo secreto, colocar la última pieza y dejar al siguiente sin poder colocar nada. Quien acaba la
// figura sin haber cerrado su objetivo pierde unos puntos.

export const AJUSTES = { min: 2, max: 6, mano: 3, segTurno: 60, ptsLinea: 2, ptsObjetivo: 4, ptsObjetivoFallo: 2, ptsUltima: 5, ptsBloqueo: 2, lado: 8 };
export const OPCIONES = { rondas: [3, 4, 5], segundos: [45, 60, 90] };

export const PIEZAS = {
  P1: { nombre: 'Comodín', celdas: [[0, 0]], peso: 1 },
  I2: { nombre: 'Dominó', celdas: [[0, 0], [0, 1]], peso: 4 },
  I3: { nombre: 'Barra de 3', celdas: [[0, 0], [0, 1], [0, 2]], peso: 4 },
  L3: { nombre: 'Codo', celdas: [[0, 0], [1, 0], [1, 1]], peso: 4 },
  I4: { nombre: 'Barra de 4', celdas: [[0, 0], [0, 1], [0, 2], [0, 3]], peso: 3 },
  O4: { nombre: 'Cuadrado', celdas: [[0, 0], [0, 1], [1, 0], [1, 1]], peso: 3 },
  T4: { nombre: 'Te', celdas: [[0, 0], [0, 1], [0, 2], [1, 1]], peso: 3 },
  S4: { nombre: 'Ese', celdas: [[0, 1], [0, 2], [1, 0], [1, 1]], peso: 3 },
  L4: { nombre: 'Ele', celdas: [[0, 0], [1, 0], [2, 0], [2, 1]], peso: 3 },
  P5: { nombre: 'Pe', celdas: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]], peso: 2 },
  U5: { nombre: 'U', celdas: [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]], peso: 2 },
  L5: { nombre: 'Ele larga', celdas: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]], peso: 2 },
  V5: { nombre: 'Uve', celdas: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]], peso: 1 }
};

export const FIGURAS = [
  { id: 'casa', nombre: 'La casa', e: '🏠', forma: ['...##...', '..####..', '.######.', '########', '.######.', '.##..##.', '.##..##.', '.######.'] },
  { id: 'corazon', nombre: 'El corazón', e: '❤️', forma: ['.##..##.', '########', '########', '########', '.######.', '..####..', '...##...', '........'] },
  { id: 'arbol', nombre: 'El árbol', e: '🌲', forma: ['...##...', '..####..', '.######.', '..####..', '.######.', '########', '...##...', '...##...'] },
  { id: 'cohete', nombre: 'El cohete', e: '🚀', forma: ['...##...', '..####..', '..####..', '..####..', '..####..', '.######.', '##.##.##', '#..##..#'] },
  { id: 'pez', nombre: 'El pez', e: '🐟', forma: ['........', '...###..', '#.#####.', '########', '########', '#.#####.', '...###..', '........'] },
  { id: 'copa', nombre: 'La copa', e: '🏆', forma: ['########', '########', '.######.', '..####..', '...##...', '...##...', '..####..', '.######.'] },
  { id: 'estrella', nombre: 'La estrella', e: '⭐', forma: ['...##...', '...##...', '########', '.######.', '..####..', '.######.', '.##..##.', '##....##'] },
  { id: 'gato', nombre: 'El gato', e: '🐱', forma: ['#......#', '##....##', '########', '#.####.#', '########', '.######.', '..####..', '........'] },
  { id: 'barco', nombre: 'El barco', e: '⛵', forma: ['...#....', '...##...', '...###..', '...####.', '...#....', '########', '.######.', '..####..'] },
  { id: 'corona', nombre: 'La corona', e: '👑', forma: ['........', '#..##..#', '#..##..#', '##.##.##', '########', '########', '########', '........'] },
  { id: 'seta', nombre: 'La seta', e: '🍄', forma: ['..####..', '.######.', '########', '########', '...##...', '...##...', '..####..', '........'] },
  { id: 'llave', nombre: 'La llave', e: '🔑', forma: ['.###....', '#...#...', '#...####', '#...#.#.', '.###..#.', '........', '........', '........'] },
  { id: 'castillo', nombre: 'El castillo', e: '🏰', forma: ['#.#..#.#', '###..###', '########', '########', '###..###', '###..###', '###..###', '########'] },
  { id: 'flecha', nombre: 'La flecha', e: '➡️', forma: ['....#...', '....##..', '########', '########', '########', '....##..', '....#...', '........'] },
  { id: 'ancla', nombre: 'El ancla', e: '⚓', forma: ['...##...', '..####..', '...##...', '...##...', '#..##..#', '##.##.##', '.######.', '..####..'] },
  { id: 'paraguas', nombre: 'El paraguas', e: '☂️', forma: ['..####..', '.######.', '########', '...##...', '...##...', '...##...', '.#.##...', '..##....'] },
  { id: 'taza', nombre: 'La taza', e: '☕', forma: ['........', '######..', '######.#', '######.#', '######..', '.####...', '########', '........'] },
  { id: 'campana', nombre: 'La campana', e: '🔔', forma: ['...##...', '..####..', '..####..', '.######.', '.######.', '########', '########', '...##...'] },
  { id: 'pajaro', nombre: 'El pájaro', e: '🐦', forma: ['..##....', '.####...', '######..', '.#######', '..######', '...####.', '....#...', '...##...'] },
  { id: 'mariposa', nombre: 'La mariposa', e: '🦋', forma: ['##....##', '###..###', '########', '.######.', '.######.', '########', '###..###', '##....##'] },
  { id: 'tortuga', nombre: 'La tortuga', e: '🐢', forma: ['........', '..####..', '.######.', '########', '#######.', '.#.##.#.', '........', '........'] },
  { id: 'rayo', nombre: 'El rayo', e: '⚡', forma: ['....###.', '...###..', '..###...', '.######.', '...###..', '..###...', '.###....', '###.....'] },
  { id: 'luna', nombre: 'La luna', e: '🌙', forma: ['..###...', '.###....', '###.....', '###.....', '###.....', '###.....', '.###....', '..###...'] },
  { id: 'robot', nombre: 'El robot', e: '🤖', forma: ['..####..', '..#..#..', '..####..', '########', '#.####.#', '#.####.#', '..#..#..', '.##..##.'] },
  { id: 'coche', nombre: 'El coche', e: '🚗', forma: ['........', '..####..', '.######.', '########', '########', '.##..##.', '........', '........'] },
  { id: 'avion', nombre: 'El avión', e: '✈️', forma: ['...##...', '...##...', '.######.', '########', '...##...', '...##...', '..####..', '........'] },
  { id: 'peon', nombre: 'El peón', e: '♟️', forma: ['...##...', '..####..', '...##...', '..####..', '..####..', '.######.', '########', '........'] },
  { id: 'trofeo', nombre: 'La copa del mundo', e: '🏆', forma: ['.######.', '#.####.#', '#.####.#', '.######.', '..####..', '...##...', '..####..', '.######.'] },
  { id: 'reloj', nombre: 'El reloj de arena', e: '⌛', forma: ['########', '.######.', '..####..', '...##...', '...##...', '..####..', '.######.', '########'] },
  { id: 'cruz', nombre: 'La cruz', e: '➕', forma: ['...##...', '...##...', '...##...', '########', '########', '...##...', '...##...', '...##...'] }
];

// ---------- Geometría ----------
/** Celdas de una pieza girada (rot = 0..3 cuartos de vuelta) y, si espejo, volteada. Normalizadas y ordenadas. */
export function celdasDe(tipo, rot = 0, espejo = false) {
  let c = PIEZAS[tipo].celdas.map(([f, k]) => [f, espejo ? -k : k]);
  for (let i = 0; i < ((rot % 4) + 4) % 4; i++) c = c.map(([f, k]) => [k, -f]);
  const mf = Math.min(...c.map((x) => x[0]));
  const mk = Math.min(...c.map((x) => x[1]));
  return c.map(([f, k]) => [f - mf, k - mk]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}
/** Casillas que ocuparía la pieza con su primera celda en (fila, col). */
export function colocadas(tipo, rot, espejo, fila, col) {
  const c = celdasDe(tipo, rot, espejo);
  const [f0, k0] = c[0];
  return c.map(([f, k]) => [fila + f - f0, col + k - k0]);
}
const libre = (p, f, k) => f >= 0 && k >= 0 && f < AJUSTES.lado && k < AJUSTES.lado && p.tablero[f][k] === 0;
export function encaja(p, tipo, rot, espejo, fila, col) {
  return colocadas(tipo, rot, espejo, fila, col).every(([f, k]) => libre(p, f, k));
}
/** ¿Cabe la pieza en algún sitio y de alguna forma? */
export function cabeEnAlgunSitio(p, tipo) {
  for (let r = 0; r < 4; r++) for (const e of [false, true]) {
    for (let f = 0; f < AJUSTES.lado; f++) for (let k = 0; k < AJUSTES.lado; k++) if (p.tablero[f][k] === 0 && encaja(p, tipo, r, e, f, k)) return true;
  }
  return false;
}

// ---------- Partida ----------
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
function robar(rng) {
  const bolsa = Object.entries(PIEZAS).flatMap(([t, x]) => Array(x.peso).fill(t));
  return bolsa[Math.floor(rng() * bolsa.length)];
}
/** Filas y columnas con al menos 3 casillas de la silueta: las que dan puntos al cerrarse. */
function lineasDe(forma) {
  const l = [];
  for (let f = 0; f < AJUSTES.lado; f++) if ([...forma[f]].filter((x) => x === '#').length >= 3) l.push(`f${f}`);
  for (let k = 0; k < AJUSTES.lado; k++) if (forma.filter((r) => r[k] === '#').length >= 3) l.push(`c${k}`);
  return l;
}
const celdasLinea = (p, l) => {
  const n = Number(l.slice(1));
  const out = [];
  for (let i = 0; i < AJUSTES.lado; i++) {
    const [f, k] = l[0] === 'f' ? [n, i] : [i, n];
    if (p.tablero[f][k] !== null) out.push([f, k]);
  }
  return out;
};
export const nombreLinea = (l) => (l[0] === 'f' ? `la fila ${Number(l.slice(1)) + 1}` : `la columna ${Number(l.slice(1)) + 1}`);

/** figuras: lista de siluetas (ya sorteadas). reglas: { rondas, segundos } */
export function crearPartida(jugadores, figuras, reglas = {}, ahora = Date.now(), rng = Math.random) {
  const rondas = Math.max(1, Math.min(reglas.rondas || 3, figuras.length));
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, piezas: 0, objetivos: 0, fuera: false, mano: [] })),
    figuras: figuras.slice(0, rondas), rondas, segundos: reglas.segundos || AJUSTES.segTurno,
    ronda: 0, fase: 'jugando', turno: null, hasta: null, tablero: [], lineas: [], cerradas: [], objetivos: {},
    pasesSeguidos: 0, ultimo: null, registro: [], sumas: {}, fin: null, motivo: null, nturno: 0
  };
  p.jugadores.forEach((j) => { for (let i = 0; i < AJUSTES.mano; i++) j.mano.push(robar(rng)); });
  empezarRonda(p, ahora, rng);
  return p;
}

function empezarRonda(p, ahora, rng = Math.random) {
  p.ronda += 1;
  const fig = p.figuras[p.ronda - 1];
  p.tablero = fig.forma.map((r) => [...r].map((x) => (x === '#' ? 0 : null)));
  p.lineas = lineasDe(fig.forma);
  p.cerradas = [];
  p.objetivos = {};
  activos(p).forEach((j) => { p.objetivos[j.id] = { linea: p.lineas[Math.floor(rng() * p.lineas.length)], hecho: false }; });
  p.fase = 'jugando';
  p.pasesSeguidos = 0;
  p.ultimo = null;
  p.registro = [];
  p.sumas = {};
  p.desglose = Object.fromEntries(activos(p).map((j) => [j.id, { piezas: 0, casillas: 0, lineas: 0, nLineas: 0, objetivo: 0, ultima: 0, bloqueos: 0, fallo: 0 }]));
  p.motivo = null;
  const a = activos(p);
  p.turno = a[(p.ronda - 1) % a.length].id;
  p.hasta = ahora + p.segundos * 1000;
  p.nturno = (p.nturno || 0) + 1;
}

function siguienteTurno(p, ahora) {
  p.nturno += 1;
  const a = activos(p);
  if (!a.length) return;
  const i = a.findIndex((j) => j.id === p.turno);
  p.turno = a[(i + 1) % a.length].id;
  p.hasta = ahora + p.segundos * 1000;
}
const sumar = (p, j, n) => { j.puntos += n; p.sumas[j.id] = (p.sumas[j.id] || 0) + n; };
const dsg = (p, id) => (p.desglose[id] ||= { piezas: 0, casillas: 0, lineas: 0, nLineas: 0, objetivo: 0, ultima: 0, bloqueos: 0, fallo: 0 });
const quedanHuecos = (p) => p.tablero.some((r) => r.includes(0));

function cerrarRonda(p, motivo) {
  // Quien no ha cerrado su objetivo secreto pierde puntos
  activos(p).forEach((j) => {
    const o = p.objetivos[j.id];
    if (o && !o.hecho) { sumar(p, j, -AJUSTES.ptsObjetivoFallo); dsg(p, j.id).fallo -= AJUSTES.ptsObjetivoFallo; }
  });
  p.fase = 'resultado';
  p.motivo = motivo;
  p.hasta = null;
}

/** Coloca la pieza `pieza` (índice de la mano) con su primera celda en (fila, col). */
export function colocar(p, id, { pieza, rot = 0, espejo = false, fila, col } = {}, ahora = Date.now(), rng = Math.random) {
  const j = jug(p, id);
  if (!j || j.fuera) return { ok: false, error: 'No estás en la partida.' };
  if (p.fase !== 'jugando') return { ok: false, error: 'La figura ya está cerrada.' };
  if (p.turno !== id) return { ok: false, error: 'No es tu turno.' };
  // pieza = -1: casilla suelta del montón común, solo si no te cabe ninguna pieza de la mano
  const suelta = Number(pieza) === -1;
  if (suelta && j.mano.some((t) => cabeEnAlgunSitio(p, t))) return { ok: false, error: 'Todavía te cabe alguna de tus piezas.' };
  const tipo = suelta ? 'P1' : j.mano[pieza];
  if (!tipo) return { ok: false, error: 'Esa pieza no está en tu mano.' };
  const f0 = Number(fila); const k0 = Number(col);
  if (!encaja(p, tipo, Number(rot) || 0, Boolean(espejo), f0, k0)) return { ok: false, error: 'La pieza no cabe ahí: tiene que ir entera dentro de los huecos libres.' };
  const celdas = colocadas(tipo, Number(rot) || 0, Boolean(espejo), f0, k0);
  const a = activos(p);
  const sig = a[(a.findIndex((x) => x.id === id) + 1) % a.length];
  const sigPodia = sig.id !== id && sig.mano.some((t) => cabeEnAlgunSitio(p, t));
  celdas.forEach(([f, k]) => { p.tablero[f][k] = id; });
  if (!suelta) { j.mano.splice(pieza, 1); j.mano.push(robar(rng)); }
  j.piezas += 1;
  p.pasesSeguidos = 0;
  let pts = celdas.length;
  const detalle = [suelta ? 'casilla suelta' : `${celdas.length} casillas`];
  // Filas y columnas que se cierran con esta pieza
  const nuevas = p.lineas.filter((l) => !p.cerradas.includes(l) && celdasLinea(p, l).every(([f, k]) => p.tablero[f][k] !== 0));
  if (nuevas.length) { pts += nuevas.length * AJUSTES.ptsLinea; p.cerradas.push(...nuevas); detalle.push(`${nuevas.length} ${nuevas.length === 1 ? 'línea' : 'líneas'}`); }
  const obj = p.objetivos[id];
  if (obj && !obj.hecho && nuevas.includes(obj.linea)) { obj.hecho = true; pts += AJUSTES.ptsObjetivo; j.objetivos += 1; detalle.push('¡objetivo secreto!'); }
  const completa = !quedanHuecos(p);
  if (completa) { pts += AJUSTES.ptsUltima; detalle.push('última pieza'); }
  // ¿Deja al siguiente (que antes podía) sin poder colocar ninguna de sus piezas?
  let bloqueo = null;
  if (!completa && sigPodia) {
    if (!sig.mano.some((t) => cabeEnAlgunSitio(p, t))) { pts += AJUSTES.ptsBloqueo; bloqueo = sig.id; detalle.push(`bloquea a ${sig.nombre}`); }
  }
  sumar(p, j, pts);
  const d = dsg(p, id);
  d.piezas += 1; d.casillas += celdas.length; d.lineas += nuevas.length * AJUSTES.ptsLinea; d.nLineas += nuevas.length;
  if (obj?.hecho && nuevas.includes(obj.linea)) d.objetivo += AJUSTES.ptsObjetivo;
  if (completa) d.ultima += AJUSTES.ptsUltima;
  if (bloqueo != null) d.bloqueos += AJUSTES.ptsBloqueo;
  p.ultimo = { id, celdas, tipo };
  p.registro.unshift({ id, tipo, puntos: pts, detalle: detalle.join(' · '), lineas: nuevas, bloqueo });
  if (completa) cerrarRonda(p, 'completa');
  else siguienteTurno(p, ahora);
  return { ok: true, puntos: pts, detalle: detalle.join(' · ') };
}

/** Pasar el turno: puedes cambiar una pieza de tu mano por otra de la bolsa. */
export function pasar(p, id, cambiar = null, ahora = Date.now(), rng = Math.random) {
  const j = jug(p, id);
  if (!j || j.fuera) return { ok: false, error: 'No estás en la partida.' };
  if (p.fase !== 'jugando') return { ok: false, error: 'La figura ya está cerrada.' };
  if (p.turno !== id) return { ok: false, error: 'No es tu turno.' };
  const i = Number(cambiar);
  if (cambiar !== null && cambiar !== undefined && j.mano[i]) j.mano[i] = robar(rng);
  p.pasesSeguidos += 1;
  p.registro.unshift({ id, tipo: null, puntos: 0, detalle: cambiar !== null && cambiar !== undefined ? 'pasa y cambia una pieza' : 'pasa' });
  p.ultimo = null;
  // Si todos pasan dos vueltas seguidas, la figura se queda así
  if (p.pasesSeguidos >= activos(p).length * 2) cerrarRonda(p, 'atascada');
  else siguienteTurno(p, ahora);
  return { ok: true };
}

export function siguiente(p, ahora = Date.now(), rng = Math.random) {
  if (p.fase !== 'resultado') return { ok: false, error: 'La figura no ha terminado.' };
  if (p.ronda >= p.rondas) { terminar(p); return { ok: true }; }
  empezarRonda(p, ahora, rng);
  return { ok: true };
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  p.fase = 'fin';
  p.hasta = null;
  p.turno = null;
  const tabla = [...p.jugadores].sort((a, b) => b.puntos - a.puntos || b.objetivos - a.objetivos);
  let puesto = 0;
  tabla.forEach((j, k) => { if (k === 0 || j.puntos !== tabla[k - 1].puntos) puesto = k + 1; j.puesto = puesto; });
  const max = Math.max(0, ...activos(p).map((j) => j.puntos));
  p.fin = {
    tabla: tabla.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, piezas: j.piezas, objetivos: j.objetivos, puesto: j.puesto, fuera: j.fuera })),
    ganadores: max > 0 ? activos(p).filter((j) => j.puntos === max).map((j) => j.id) : [], max
  };
  return { ok: true };
}

/** Si se acaba el tiempo del turno, el jugador pasa (sin cambiar pieza). */
export function tick(p, ahora = Date.now(), rng = Math.random) {
  if (p.fase !== 'jugando' || !p.hasta || ahora < p.hasta) return;
  pasar(p, p.turno, null, ahora, rng);
}

export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  const eraTurno = p.turno === id;
  if (eraTurno) siguienteTurno(p, ahora);
  j.fuera = true;
  if (activos(p).length < 2) terminar(p);
}

export function vistaDe(p, id) {
  const yo = jug(p, id);
  const abierto = p.fase !== 'jugando';
  const fig = p.figuras[p.ronda - 1];
  return {
    fase: p.fase, ronda: p.ronda, rondas: p.rondas, segundos: p.segundos, hasta: p.hasta, turno: p.turno, motivo: p.motivo, nturno: p.nturno,
    figura: fig ? { id: fig.id, nombre: fig.nombre, e: fig.e } : null,
    tablero: p.tablero, cerradas: p.cerradas, ultimo: p.ultimo,
    huecos: p.tablero.flat().filter((x) => x === 0).length,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, piezas: j.piezas, objetivos: j.objetivos, fuera: j.fuera, mano: j.mano.length })),
    yo: yo ? {
      id, mano: yo.mano,
      objetivo: p.objetivos[id] ? { ...p.objetivos[id], cerradaPorOtro: !p.objetivos[id].hecho && p.cerradas.includes(p.objetivos[id].linea) } : null,
      cabe: yo.mano.map((t) => cabeEnAlgunSitio(p, t))
    } : null,
    objetivos: abierto ? p.objetivos : null,
    registro: p.registro.slice(0, 5),
    sumas: p.sumas,
    desglose: abierto ? p.desglose : null,
    forma: fig ? fig.forma : null,
    fin: p.fin
  };
}
