// server/jugadores/engine.js
// Motor puro de «¿Con quién he jugado?». Lo usan las salas online (server/routes/jugadores.js) y, copiado al cliente
// con `npm run sync:jugadores`, el modo «un solo dispositivo».
//
// Cada ronda salen dos futbolistas. Hay que decir un tercero que haya coincidido en algún club (no selección) con
// los dos, aunque fuera en clubes distintos. Quien lo sepa pulsa y escribe el nombre: si está en la lista, acierta;
// si no está, decide el anfitrión (o el grupo, en un dispositivo), por si es un acierto que nos falta en la lista.

export const AJUSTES = { min: 2, max: 15, segRonda: 120, segRespuesta: 30, puntosAcierto: 3, puntosFallo: 1, verSoluciones: 12 };
export const OPCIONES_RONDAS = [5, 10, 15];

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

/** Busca en la lista el futbolista al que se refiere el texto (nombre, apellido, alias, pequeñas erratas). */
export function buscar(texto, validos, alias = {}) {
  const a = normalizar(texto);
  const pa = palabras(texto);
  if (!a || !pa.length) return null;
  for (const n of validos) if (parecido(a, normalizar(n))) return n;
  for (const n of validos) if ((alias[n] || []).some((x) => parecido(a, normalizar(x)))) return n;
  for (const n of validos) {
    const pn = palabras(n);
    if (!pn.length) continue;
    if (pa.length === 1) {
      if (pa[0].length >= 4 && (parecido(pa[0], pn[pn.length - 1]) || (pn.length === 1 && parecido(pa[0], pn[0])))) return n;
    } else if (pa.every((w) => pn.some((x) => parecido(w, x)))) return n;
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

function empezarRonda(p, ahora) {
  p.fase = 'jugando';
  p.estado = { hasta: ahora + AJUSTES.segRonda * 1000, pausadoEn: null, pulsado: null, revision: null, bloqueados: [], sumas: {}, resultado: null, aceptada: null };
}

/** retos: [{ jugador1, jugador2, comunes, alias }] */
export function crearPartida(jugadores, retos, ahora = Date.now()) {
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, aciertos: 0, fuera: false })),
    retos, rondas: retos.length, ronda: 1, fase: 'jugando', estado: null, log: [], nlog: 0, fin: null
  };
  empezarRonda(p, ahora);
  anotar(p, `Empieza la partida: ${p.rondas} parejas.`);
  return p;
}

function pausar(p, ahora) { if (p.estado.pausadoEn == null) p.estado.pausadoEn = ahora; }
function reanudar(p, ahora) {
  const e = p.estado;
  if (e.pausadoEn != null) { e.hasta += ahora - e.pausadoEn; e.pausadoEn = null; }
}

function resolver(p, tipo, jugadorId = null, puntos = 0, respuesta = null) {
  const e = p.estado;
  e.pulsado = null;
  e.revision = null;
  e.pausadoEn = null;
  e.resultado = { tipo, jugadorId, puntos, respuesta };
  p.fase = 'resuelta';
  if (tipo === 'acierto') anotar(p, `✅ ${nombre(p, jugadorId)} acierta con ${respuesta} (+${puntos}).`, 'bueno');
  else anotar(p, '⏹️ Nadie lo ha sacado.');
}

function fallar(p, id, ahora, motivo) {
  const e = p.estado;
  const j = jug(p, id);
  if (j) {
    const antes = j.puntos;
    j.puntos = Math.max(0, j.puntos - AJUSTES.puntosFallo);
    e.sumas[id] = (e.sumas[id] || 0) + (j.puntos - antes);
  }
  if (!e.bloqueados.includes(id)) e.bloqueados.push(id);
  e.pulsado = null;
  e.revision = null;
  anotar(p, `❌ ${nombre(p, id)} falla${motivo ? ` (${motivo})` : ''}.`, 'malo');
  if (activos(p).every((x) => e.bloqueados.includes(x.id))) { resolver(p, 'nadie'); return; }
  reanudar(p, ahora);
}

function acertar(p, id, respuesta) {
  const e = p.estado;
  const j = jug(p, id);
  j.puntos += AJUSTES.puntosAcierto;
  j.aciertos += 1;
  e.sumas[id] = (e.sumas[id] || 0) + AJUSTES.puntosAcierto;
  resolver(p, 'acierto', id, AJUSTES.puntosAcierto, respuesta);
}

export function tick(p, ahora = Date.now()) {
  if (p.fase !== 'jugando') return false;
  const e = p.estado;
  if (e.revision) return false; // esperando al juez
  if (e.pulsado) {
    if (ahora >= e.pulsado.hasta) { fallar(p, e.pulsado.jugadorId, ahora, 'se le acabó el tiempo'); return true; }
    return false;
  }
  if (e.pausadoEn != null) return false;
  if (ahora >= e.hasta) { resolver(p, 'nadie'); return true; }
  return false;
}

export function pulsar(p, id, ahora = Date.now()) {
  tick(p, ahora);
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  const e = p.estado;
  const j = jug(p, id);
  if (!j || j.fuera) return { ok: false, error: 'No estás en la partida.' };
  if (e.pulsado || e.revision) return { ok: false, error: 'Otro jugador está respondiendo.' };
  if (e.bloqueados.includes(id)) return { ok: false, error: 'Ya has fallado en esta ronda.' };
  pausar(p, ahora);
  e.pulsado = { jugadorId: id, hasta: ahora + AJUSTES.segRespuesta * 1000 };
  return { ok: true };
}

/** Un solo dispositivo: para el reloj mientras se elige quién ha pulsado. */
export function pausa(p, ahora = Date.now()) {
  tick(p, ahora);
  if (p.fase !== 'jugando' || p.estado.pulsado || p.estado.revision) return { ok: false, error: 'No se puede pausar ahora.' };
  pausar(p, ahora);
  return { ok: true };
}
export function seguir(p, ahora = Date.now()) {
  if (p.fase !== 'jugando' || p.estado.pulsado || p.estado.revision) return { ok: false, error: 'No se puede seguir ahora.' };
  reanudar(p, ahora);
  return { ok: true };
}
export function cancelarPulsado(p, ahora = Date.now()) {
  if (p.fase !== 'jugando' || !p.estado.pulsado) return { ok: false, error: 'Nadie ha pulsado.' };
  p.estado.pulsado = null;
  reanudar(p, ahora);
  return { ok: true };
}

export function responder(p, id, texto, ahora = Date.now()) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  const e = p.estado;
  if (!e.pulsado || e.pulsado.jugadorId !== id) return { ok: false, error: 'No es tu turno de responder.' };
  if (ahora >= e.pulsado.hasta) { fallar(p, id, ahora, 'se le acabó el tiempo'); return { ok: true, resultado: 'fallo' }; }
  const t = String(texto || '').trim().slice(0, 60);
  if (!t) return { ok: false, error: 'Escribe un futbolista.' };
  const r = reto(p);
  if (buscar(t, [r.jugador1, r.jugador2])) return { ok: false, error: 'Ese es uno de los dos de la pareja: di un tercero.' };
  const encontrado = buscar(t, r.comunes, r.alias || {});
  if (encontrado) { acertar(p, id, encontrado); return { ok: true, resultado: 'acierto' }; }
  // No está en nuestra lista: decide el juez (puede ser un acierto que no tenemos)
  e.revision = { jugadorId: id, texto: t };
  e.pulsado = null;
  anotar(p, `🤔 ${nombre(p, id)} dice «${t}»: no está en la lista, decide el juez.`);
  return { ok: true, resultado: 'revision' };
}

/** El juez (anfitrión / grupo) decide si una respuesta que no está en la lista vale. */
export function juzgar(p, vale, ahora = Date.now()) {
  if (p.fase !== 'jugando' || !p.estado.revision) return { ok: false, error: 'No hay nada que juzgar.' };
  const { jugadorId, texto } = p.estado.revision;
  if (vale) { p.estado.aceptada = texto; acertar(p, jugadorId, texto); } else fallar(p, jugadorId, ahora, `«${texto}» no vale`);
  return { ok: true };
}

export function rendirse(p) {
  if (p.fase !== 'jugando') return { ok: false, error: 'La ronda ya ha terminado.' };
  resolver(p, 'nadie');
  return { ok: true };
}

export function siguiente(p, ahora = Date.now()) {
  if (p.fase !== 'resuelta') return { ok: false, error: 'La ronda aún no ha terminado.' };
  if (p.ronda >= p.rondas) { finalizar(p); return { ok: true }; }
  p.ronda += 1;
  empezarRonda(p, ahora);
  return { ok: true };
}

function finalizar(p) {
  p.fase = 'fin';
  const orden = [...p.jugadores].sort((a, b) => (a.fuera - b.fuera) || (b.puntos - a.puntos));
  const max = Math.max(0, ...activos(p).map((j) => j.puntos));
  let puesto = 0;
  let previo = null;
  const tabla = orden.map((j, i) => {
    if (j.puntos !== previo) { puesto = i + 1; previo = j.puntos; }
    return { id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, fuera: j.fuera, puesto: j.fuera ? null : puesto };
  });
  p.fin = { tabla, ganadores: max > 0 ? activos(p).filter((j) => j.puntos === max).map((j) => j.id) : [], max };
}

export function terminar(p) {
  if (p.fase === 'fin') return { ok: false, error: 'La partida ya ha terminado.' };
  finalizar(p);
  return { ok: true };
}

export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j || j.fuera || p.fase === 'fin') return;
  j.fuera = true;
  anotar(p, `🚪 ${j.nombre} abandona la partida.`, 'malo');
  if (!activos(p).length) { finalizar(p); return; }
  if (p.fase !== 'jugando') return;
  const e = p.estado;
  if (e.pulsado?.jugadorId === id || e.revision?.jugadorId === id) { e.pulsado = null; e.revision = null; reanudar(p, ahora); }
  if (activos(p).every((x) => e.bloqueados.includes(x.id))) resolver(p, 'nadie');
}

export function vistaDe(p, yoId) {
  const r = reto(p);
  const e = p.estado;
  const resuelta = p.fase !== 'jugando';
  return {
    fase: p.fase,
    ronda: p.ronda,
    rondas: p.rondas,
    pareja: [r.jugador1, r.jugador2],
    hasta: e.hasta,
    pausadoEn: e.pausadoEn,
    pulsado: e.pulsado ? { jugadorId: e.pulsado.jugadorId, hasta: e.pulsado.hasta } : null,
    revision: e.revision,
    bloqueados: [...e.bloqueados],
    sumas: { ...e.sumas },
    resultado: e.resultado,
    soluciones: resuelta ? { nombres: r.comunes.slice(0, AJUSTES.verSoluciones), total: r.comunes.length, aceptada: e.aceptada } : null,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, fuera: j.fuera })),
    log: p.log.slice(-30),
    fin: p.fin,
    yo: jug(p, yoId) ? { id: yoId } : null
  };
}
