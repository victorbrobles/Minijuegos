// server/cuatroclubes/engine.js
// Motor puro de «El club de los cuatro». Lo usan las salas online (server/routes/cuatroclubes.js) y, copiado al cliente
// con `npm run sync:cuatroclubes`, el modo «un solo dispositivo».
//
// Cada ronda salen cuatro clubes. Por turnos, cada jugador dice un futbolista y suma un punto por cada uno de los cuatro
// clubes en los que jugó (pleno = 4). Si el futbolista está en nuestra base se puntúa solo; si no, decide el juez
// (el anfitrión online, el grupo en un dispositivo). Un futbolista no se puede repetir en la misma ronda.

export const AJUSTES = { min: 2, max: 10, segTurno: 90, verMejores: 10 };
export const OPCIONES_RONDAS = [3, 5, 8];

// ---------------------------------------------------------------- Respuestas
const RELLENO = new Set(['de', 'del', 'la', 'el', 'da', 'do', 'dos', 'van', 'von', 'der', 'ter', 'jr', 'junior']);
export function normalizar(texto) {
  return String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
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

/** Busca el futbolista en una lista [{ nombre, alias }]: nombre completo, alias, apellido o varias palabras. */
export function buscar(texto, lista) {
  const a = normalizar(texto);
  const pa = palabras(texto);
  if (!a || !pa.length) return null;
  for (const x of lista) if (parecido(a, normalizar(x.nombre))) return x.nombre;
  for (const x of lista) if ((x.alias || []).some((y) => parecido(a, normalizar(y)))) return x.nombre;
  for (const x of lista) {
    const pn = palabras(x.nombre);
    if (!pn.length) continue;
    if (pa.length === 1) {
      if (pa[0].length >= 4 && (parecido(pa[0], pn[pn.length - 1]) || (pn.length === 1 && parecido(pa[0], pn[0])))) return x.nombre;
    } else if (pa.every((w) => pn.some((y) => parecido(w, y)))) return x.nombre;
  }
  return null;
}

// ---------------------------------------------------------------- Partida
const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const nombre = (p, id) => jug(p, id)?.nombre ?? '¿?';
const reto = (p) => p.retos[p.ronda - 1];

function anotar(p, texto, tipo = '') {
  p.nlog += 1;
  p.log.push({ n: p.nlog, texto, tipo });
  if (p.log.length > 60) p.log.shift();
}

/**
 * retos: [{ clubes:[{nombre,siglas,colores,escudo}×4], conocidos:{nombre:[bool×4]}, dudosos:[nombre], mejores:[{nombre,clubes}] }]
 * base: [{ nombre, alias }] — todos los futbolistas de la base (para saber si uno «no jugó en ninguno»).
 */
export function crearPartida(jugadores, retos, base = [], ahora = Date.now()) {
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, plenos: 0, fuera: false })),
    retos, base, rondas: retos.length, ronda: 0, fase: 'jugando', orden: [], turnoIdx: 0, listo: false, hasta: null,
    revision: null, respuestas: [], log: [], nlog: 0, fin: null
  };
  empezarRonda(p, ahora);
  return p;
}

function empezarRonda(p, ahora) {
  p.ronda += 1;
  const ids = activos(p).map((j) => j.id);
  const inicio = (p.ronda - 1) % ids.length;
  p.orden = [...ids.slice(inicio), ...ids.slice(0, inicio)];
  p.turnoIdx = 0;
  p.respuestas = [];
  p.revision = null;
  p.fase = 'jugando';
  p.listo = false;
  p.hasta = null;
  anotar(p, `Ronda ${p.ronda}: empieza ${nombre(p, p.orden[0])}.`);
  void ahora;
}

const turnoId = (p) => p.orden[p.turnoIdx] ?? null;

function siguienteTurno(p) {
  p.revision = null;
  p.listo = false;
  p.hasta = null;
  do { p.turnoIdx += 1; } while (p.turnoIdx < p.orden.length && jug(p, p.orden[p.turnoIdx])?.fuera);
  if (p.turnoIdx >= p.orden.length) {
    p.fase = 'resuelta';
    anotar(p, `⏹️ Fin de la ronda ${p.ronda}.`);
  }
}

function anotarRespuesta(p, id, texto, futbolista, clubes) {
  const pts = clubes.filter(Boolean).length;
  const j = jug(p, id);
  j.puntos += pts;
  if (pts === 4) j.plenos += 1;
  p.respuestas.push({ jugadorId: id, texto, futbolista, clubes, puntos: pts });
  anotar(p, pts === 4 ? `🎯 ¡PLENO de ${j.nombre} con ${futbolista}! (+4)` : `${j.nombre}: ${futbolista ?? texto} → ${pts}/4.`, pts ? 'bueno' : 'malo');
  siguienteTurno(p);
}

/** El jugador con el turno pulsa «listo»: empieza su reloj. */
export function listo(p, id, ahora = Date.now()) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  if (id != null && id !== turnoId(p)) return { ok: false, error: 'No es tu turno.' };
  if (!p.listo) { p.listo = true; p.hasta = ahora + AJUSTES.segTurno * 1000; }
  return { ok: true };
}

export function responder(p, id, texto, ahora = Date.now()) {
  if (p.fase !== 'jugando' || p.revision) return { ok: false, error: 'Ahora no se puede responder.' };
  if (id != null && id !== turnoId(p)) return { ok: false, error: 'No es tu turno.' };
  if (!p.listo) return { ok: false, error: 'Pulsa «listo» para empezar tu turno.' };
  const t = String(texto || '').trim().slice(0, 60);
  if (!t) return { ok: false, error: 'Escribe un futbolista.' };
  const quien = turnoId(p);
  const r = reto(p);
  const conocidos = Object.keys(r.conocidos).map((n) => ({ nombre: n, alias: (p.base.find((b) => b.nombre === n) || {}).alias || [] }));
  const encontrado = buscar(t, conocidos) || buscar(t, p.base);
  if (encontrado && p.respuestas.some((x) => x.futbolista === encontrado)) return { ok: false, error: `${encontrado} ya se ha dicho en esta ronda.` };
  if (encontrado && !r.dudosos.includes(encontrado)) {
    anotarRespuesta(p, quien, t, encontrado, r.conocidos[encontrado] || [false, false, false, false]);
    return { ok: true, auto: true };
  }
  // No lo tenemos (o pudo jugar en un club sin datos): decide el juez cuántos clubes valen
  p.revision = { jugadorId: quien, texto: t, futbolista: encontrado || null, sugerencia: encontrado ? (r.conocidos[encontrado] || [false, false, false, false]) : null };
  p.hasta = null;
  anotar(p, `🤔 ${nombre(p, quien)} dice «${t}»: decide el juez.`);
  return { ok: true, auto: false };
}

/** El juez marca en qué clubes de los cuatro jugó el futbolista dicho. */
export function juzgar(p, clubes) {
  if (p.fase !== 'jugando' || !p.revision) return { ok: false, error: 'No hay nada que juzgar.' };
  const marcas = [0, 1, 2, 3].map((k) => Boolean(clubes?.[k]));
  const { jugadorId, texto, futbolista } = p.revision;
  anotarRespuesta(p, jugadorId, texto, futbolista || texto, marcas);
  return { ok: true };
}

export function pasar(p, id) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  if (id != null && id !== turnoId(p)) return { ok: false, error: 'No es tu turno.' };
  const quien = turnoId(p);
  p.respuestas.push({ jugadorId: quien, texto: null, futbolista: null, clubes: [false, false, false, false], puntos: 0, pasa: true });
  anotar(p, `⏭️ ${nombre(p, quien)} pasa.`);
  siguienteTurno(p);
  return { ok: true };
}

export function tick(p, ahora = Date.now()) {
  if (p.fase !== 'jugando' || p.revision || !p.listo || !p.hasta || ahora < p.hasta) return false;
  const quien = turnoId(p);
  p.respuestas.push({ jugadorId: quien, texto: null, futbolista: null, clubes: [false, false, false, false], puntos: 0, tiempo: true });
  anotar(p, `⏰ A ${nombre(p, quien)} se le acabó el tiempo.`, 'malo');
  siguienteTurno(p);
  return true;
}

export function siguiente(p, ahora = Date.now()) {
  if (p.fase !== 'resuelta') return { ok: false, error: 'La ronda aún no ha terminado.' };
  if (p.ronda >= p.rondas) { finalizar(p); return { ok: true }; }
  empezarRonda(p, ahora);
  return { ok: true };
}

function finalizar(p) {
  p.fase = 'fin';
  const orden = [...p.jugadores].sort((a, b) => (a.fuera - b.fuera) || (b.puntos - a.puntos) || (b.plenos - a.plenos));
  const max = Math.max(0, ...activos(p).map((j) => j.puntos));
  let puesto = 0;
  let previo = null;
  const tabla = orden.map((j, i) => {
    if (j.puntos !== previo) { puesto = i + 1; previo = j.puntos; }
    return { id: j.id, nombre: j.nombre, puntos: j.puntos, plenos: j.plenos, fuera: j.fuera, puesto: j.fuera ? null : puesto };
  });
  p.fin = { tabla, ganadores: max > 0 ? activos(p).filter((j) => j.puntos === max).map((j) => j.id) : [], max };
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  finalizar(p);
  return { ok: true };
}

export function abandonar(p, id) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  anotar(p, `🚪 ${j.nombre} abandona la partida.`, 'malo');
  if (!activos(p).length) { finalizar(p); return; }
  if (p.fase === 'jugando' && turnoId(p) === id) siguienteTurno(p);
}

export function vistaDe(p, yoId) {
  const r = reto(p);
  const resuelta = p.fase !== 'jugando';
  return {
    fase: p.fase,
    ronda: p.ronda,
    rondas: p.rondas,
    clubes: r.clubes,
    turno: turnoId(p),
    orden: [...p.orden],
    listo: p.listo,
    hasta: p.hasta,
    revision: p.revision,
    respuestas: p.respuestas.map((x) => ({ ...x })),
    mejores: resuelta ? r.mejores.slice(0, AJUSTES.verMejores) : null,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, plenos: j.plenos, fuera: j.fuera })),
    log: p.log.slice(-30),
    fin: p.fin,
    yo: jug(p, yoId) ? { id: yoId } : null
  };
}
