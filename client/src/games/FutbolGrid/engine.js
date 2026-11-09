// server/futbolgrid/engine.js
// Motor puro de «Fútbol en raya». Lo usan las salas online (server/routes/futbolgrid.js) y, copiado al cliente con
// `npm run sync:futbolgrid`, el modo «un solo dispositivo».
//
// Tres en raya por equipos (azul y rojo). Cada fila y cada columna es una categoría. En su turno, el equipo elige
// una casilla libre y tiene unos segundos para decir un futbolista que cumpla las dos categorías. Si acierta, la
// casilla es suya. Acierte o falle, el turno pasa al otro equipo. Un futbolista no se puede repetir en el tablero.

export const AJUSTES = { min: 2, max: 12, segRespuesta: 45 };
export const EQUIPOS = {
  X: { nombre: 'Azul', simbolo: '✕' },
  O: { nombre: 'Rojo', simbolo: '◯' }
};
const LINEAS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

// ---------------------------------------------------------------- Respuestas
const RELLENO = new Set(['de', 'del', 'la', 'el', 'da', 'do', 'dos', 'van', 'von', 'der', 'jr', 'junior']);
export function normalizar(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
const palabras = (t) => normalizar(t).split(' ').filter((p) => p && !RELLENO.has(p));
function distancia(a, b) {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}
const parecido = (a, b) => a === b || (b.length >= 6 && distancia(a, b) <= (b.length >= 12 ? 2 : 1));

/**
 * Busca el futbolista válido al que se refiere el texto: nombre completo (con pequeñas erratas), el apellido o
 * el nombre por el que se le conoce (última palabra), o varias palabras de su nombre. Devuelve el nombre o null.
 */
export function buscar(texto, validos) {
  const a = normalizar(texto);
  const pa = palabras(texto);
  if (!a || !pa.length) return null;
  for (const n of validos) if (parecido(a, normalizar(n))) return n;
  for (const n of validos) {
    const pn = palabras(n);
    if (!pn.length) continue;
    if (pa.length === 1) {
      const ultima = pn[pn.length - 1];
      if (pa[0].length >= 3 && (parecido(pa[0], ultima) || (pn.length === 1 && parecido(pa[0], pn[0])))) return n;
    } else if (pa.every((w) => pn.some((x) => parecido(w, x)))) return n;
  }
  return null;
}

// ---------------------------------------------------------------- Partida
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const equipoDe = (p, id) => jug(p, id)?.equipo;
const rival = (e) => (e === 'X' ? 'O' : 'X');

function anotar(p, texto, tipo = '') {
  p.nlog += 1;
  p.log.push({ n: p.nlog, texto, tipo });
  if (p.log.length > 60) p.log.shift();
}

/** jugadores: [{ id, nombre, equipo? }] — sin equipo, se reparten alternos. */
export function crearPartida(jugadores, grid, empieza = 'X') {
  const p = {
    grid: { id: grid.id, dificultad: grid.dificultad, filas: grid.filas, columnas: grid.columnas, respuestas: grid.respuestas },
    jugadores: jugadores.map((j, i) => ({ id: j.id, nombre: j.nombre, equipo: j.equipo || (i % 2 === 0 ? 'X' : 'O'), aciertos: 0, fuera: false })),
    tablero: Array(9).fill(null),
    usados: [],
    turno: empieza,
    fase: 'elegir', // elegir | responder | fin
    celda: null,
    hasta: null,
    ultimo: null,
    log: [],
    nlog: 0,
    fin: null
  };
  anotar(p, `Empieza el equipo ${EQUIPOS[empieza].nombre}.`);
  return p;
}

function cerrar(p, ganador, linea = null) {
  p.fase = 'fin';
  p.celda = null;
  p.hasta = null;
  const ejemplos = p.tablero.map((c, i) => (c ? null : (p.grid.respuestas[Math.floor(i / 3)][i % 3] || []).slice(0, 3)));
  p.fin = { ganador, linea, ejemplos };
  anotar(p, ganador ? `🏆 ¡Gana el equipo ${EQUIPOS[ganador].nombre}!` : '🤝 Empate: tablero lleno sin tres en raya.', 'bueno');
}

function comprobar(p) {
  for (const l of LINEAS) {
    const [a, b, c] = l;
    if (p.tablero[a] && p.tablero[a].equipo === p.tablero[b]?.equipo && p.tablero[a].equipo === p.tablero[c]?.equipo) {
      cerrar(p, p.tablero[a].equipo, l);
      return true;
    }
  }
  if (p.tablero.every(Boolean)) { cerrar(p, null); return true; }
  // Si en ninguna casilla libre queda un futbolista sin usar, la partida ya no puede avanzar: empate.
  const usados = new Set(p.usados.map(normalizar));
  const posible = p.tablero.some((c, i) => !c && (p.grid.respuestas[Math.floor(i / 3)][i % 3] || []).some((n) => !usados.has(normalizar(n))));
  if (!posible) { cerrar(p, null); return true; }
  return false;
}

function pasarTurno(p) {
  p.turno = rival(p.turno);
  p.fase = 'elegir';
  p.celda = null;
  p.hasta = null;
  if (!p.jugadores.some((j) => !j.fuera && j.equipo === p.turno) && p.jugadores.some((j) => !j.fuera)) p.turno = rival(p.turno);
}

export function elegirCasilla(p, id, celda, ahora = Date.now()) {
  if (p.fase !== 'elegir') return { ok: false, error: 'Ahora no se puede elegir casilla.' };
  if (id != null && equipoDe(p, id) !== p.turno) return { ok: false, error: 'No es el turno de tu equipo.' };
  const c = Number(celda);
  if (!Number.isInteger(c) || c < 0 || c > 8 || p.tablero[c]) return { ok: false, error: 'Esa casilla no está libre.' };
  p.fase = 'responder';
  p.celda = c;
  p.hasta = ahora + AJUSTES.segRespuesta * 1000;
  return { ok: true };
}

export function cancelarCasilla(p, id) {
  if (p.fase !== 'responder') return { ok: false, error: 'No hay casilla elegida.' };
  if (id != null && equipoDe(p, id) !== p.turno) return { ok: false, error: 'No es el turno de tu equipo.' };
  p.fase = 'elegir';
  p.celda = null;
  p.hasta = null;
  return { ok: true };
}

export function responder(p, id, texto, ahora = Date.now()) {
  if (p.fase !== 'responder') return { ok: false, error: 'No hay ninguna casilla elegida.' };
  if (id != null && equipoDe(p, id) !== p.turno) return { ok: false, error: 'No es el turno de tu equipo.' };
  if (ahora >= p.hasta) { tick(p, ahora); return { ok: true, correcto: false }; }
  if (!String(texto || '').trim()) return { ok: false, error: 'Escribe un futbolista.' };
  const c = p.celda;
  const validos = p.grid.respuestas[Math.floor(c / 3)][c % 3] || [];
  const nombre = buscar(texto, validos);
  const quien = id != null ? jug(p, id)?.nombre : null;
  if (nombre && p.usados.some((u) => normalizar(u) === normalizar(nombre))) {
    return { ok: false, error: `${nombre} ya está en el tablero: elige a otro.` };
  }
  if (nombre) {
    p.tablero[c] = { equipo: p.turno, futbolista: nombre, jugadorId: id };
    p.usados.push(nombre);
    if (id != null) jug(p, id).aciertos += 1;
    p.ultimo = { ok: true, equipo: p.turno, celda: c, futbolista: nombre, quien };
    anotar(p, `✅ ${quien ? `${quien} (${EQUIPOS[p.turno].nombre})` : `Equipo ${EQUIPOS[p.turno].nombre}`}: ${nombre}.`, 'bueno');
    if (!comprobar(p)) pasarTurno(p);
    return { ok: true, correcto: true, futbolista: nombre };
  }
  p.ultimo = { ok: false, equipo: p.turno, celda: c, texto: String(texto).trim().slice(0, 40), quien };
  anotar(p, `❌ «${String(texto).trim().slice(0, 40)}» no vale para esa casilla.`, 'malo');
  pasarTurno(p);
  return { ok: true, correcto: false };
}

export function pasar(p, id) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ha terminado.' };
  if (id != null && equipoDe(p, id) !== p.turno) return { ok: false, error: 'No es el turno de tu equipo.' };
  p.ultimo = { ok: false, equipo: p.turno, celda: p.celda, pasa: true };
  anotar(p, `⏭️ El equipo ${EQUIPOS[p.turno].nombre} pasa.`);
  pasarTurno(p);
  return { ok: true };
}

/** Se acaba el tiempo para responder: el turno pasa al rival. */
export function tick(p, ahora = Date.now()) {
  if (p.fase !== 'responder' || ahora < p.hasta) return false;
  p.ultimo = { ok: false, equipo: p.turno, celda: p.celda, tiempo: true };
  anotar(p, `⏰ Se acabó el tiempo del equipo ${EQUIPOS[p.turno].nombre}.`, 'malo');
  pasarTurno(p);
  return true;
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  cerrar(p, null);
  return { ok: true };
}

export function abandonar(p, id) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  anotar(p, `🚪 ${j.nombre} abandona la partida.`, 'malo');
  const quedan = (e) => p.jugadores.some((x) => !x.fuera && x.equipo === e);
  if (!quedan('X') && !quedan('O')) { cerrar(p, null); return; }
  if (!quedan('X') || !quedan('O')) { cerrar(p, quedan('X') ? 'X' : 'O'); return; }
}

export function vistaDe(p, yoId) {
  const yo = jug(p, yoId);
  return {
    fase: p.fase,
    filas: p.grid.filas,
    columnas: p.grid.columnas,
    dificultad: p.grid.dificultad,
    tablero: p.tablero.map((c) => (c ? { equipo: c.equipo, futbolista: c.futbolista } : null)),
    turno: p.turno,
    celda: p.celda,
    hasta: p.hasta,
    ultimo: p.ultimo,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, equipo: j.equipo, aciertos: j.aciertos, fuera: j.fuera })),
    log: p.log.slice(-30),
    fin: p.fin,
    yo: yo ? { id: yo.id, equipo: yo.equipo } : null
  };
}
