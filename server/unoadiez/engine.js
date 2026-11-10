// server/unoadiez/engine.js
// Motor puro de «Del 1 al 10...» (unoadiez). Lo usan las salas online (server/routes/unoadiez.js) y, copiado al cliente
// con `npm run sync:unoadiez`, el modo «un solo dispositivo».
//
// Por turnos, un jugador adivina un número secreto del 1 al 10. Otro jugador (el que da la pista) ve el número y una
// categoría y pone un ejemplo de esa categoría que encaje con ese número («del 1 al 10, un 8 en series: Breaking Bad»).
// El que adivina dice un número o pide otra pista (otro jugador, otra categoría). Puntuación de golf: menos es mejor.
//   exacto = nº de pistas usadas · a uno de distancia = pistas + 1 · más lejos = pistas + 10

export const AJUSTES = { min: 2, max: 12, segPista: 90, segAdivinar: 60, maxPistas: 5 };
export const OPCIONES_VUELTAS = [1, 2, 3];

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const activos = (p) => p.jugadores.filter((j) => !j.fuera);
const nombre = (p, id) => jug(p, id)?.nombre ?? '¿?';

function anotar(p, texto, tipo = 'info') {
  p.nlog += 1;
  p.log.push({ n: p.nlog, texto, tipo });
  if (p.log.length > 40) p.log.shift();
}

export const puntosDe = (pistas, diferencia) => (diferencia === 0 ? pistas : diferencia === 1 ? pistas + 1 : pistas + 10);

/**
 * categorias: lista de categorías (texto) ya barajada. reglas: { vueltas, local } — en local no se escribe la pista,
 * se dice en voz alta.
 */
export function crearPartida(jugadores, categorias, reglas = {}, ahora = Date.now()) {
  const ids = jugadores.map((j) => j.id);
  const vueltas = Math.max(1, reglas.vueltas || 1);
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, turnos: [], fuera: false })),
    categorias, cursor: 0, reglas: { vueltas, local: Boolean(reglas.local) },
    orden: Array.from({ length: vueltas }, () => ids).flat(), turnoIdx: -1,
    fase: 'pista', adivinador: null, pistador: null, usadosPista: [], numero: null, categoria: null,
    pistas: [], hasta: null, resultado: null, log: [], nlog: 0, fin: null
  };
  siguienteTurno(p, ahora);
  return p;
}

function nuevaCategoria(p) {
  const c = p.categorias[p.cursor % p.categorias.length];
  p.cursor += 1;
  return c;
}

/** Elige quién da la pista: alguien que no adivina y, si se puede, que aún no la haya dado en este turno. */
function nuevoPistador(p) {
  const otros = activos(p).filter((j) => j.id !== p.adivinador).map((j) => j.id);
  if (!otros.length) return null;
  let libres = otros.filter((id) => !p.usadosPista.includes(id));
  if (!libres.length) { p.usadosPista = p.pistador != null ? [p.pistador] : []; libres = otros.filter((id) => !p.usadosPista.includes(id)); }
  if (!libres.length) libres = otros;
  const id = libres[Math.floor(Math.random() * libres.length)];
  p.usadosPista.push(id);
  return id;
}

function pedirPista(p, ahora) {
  p.pistador = nuevoPistador(p);
  p.categoria = nuevaCategoria(p);
  p.fase = 'pista';
  p.hasta = p.reglas.local ? null : ahora + AJUSTES.segPista * 1000;
}

function siguienteTurno(p, ahora) {
  do { p.turnoIdx += 1; } while (p.turnoIdx < p.orden.length && jug(p, p.orden[p.turnoIdx])?.fuera);
  if (p.turnoIdx >= p.orden.length || activos(p).length < 2) { finalizar(p); return; }
  p.adivinador = p.orden[p.turnoIdx];
  p.pistador = null;
  p.usadosPista = [];
  p.numero = 1 + Math.floor(Math.random() * 10);
  p.pistas = [];
  p.resultado = null;
  pedirPista(p, ahora);
  anotar(p, `Adivina ${nombre(p, p.adivinador)}.`);
}

/** El que da la pista la escribe (online) o confirma que ya la ha dicho en voz alta (en un dispositivo). */
export function darPista(p, id, texto, ahora = Date.now()) {
  if (p.fase !== 'pista') return { ok: false, error: 'Ahora no toca dar pista.' };
  if (id != null && id !== p.pistador) return { ok: false, error: 'No te toca dar la pista.' };
  const t = String(texto ?? '').trim().slice(0, 80);
  if (!t && !p.reglas.local) return { ok: false, error: 'Escribe tu ejemplo.' };
  p.pistas.push({ pistador: p.pistador, categoria: p.categoria, texto: t || null });
  p.fase = 'adivinar';
  p.hasta = p.reglas.local ? null : ahora + AJUSTES.segAdivinar * 1000;
  return { ok: true };
}

/** El que adivina pide otra pista (cuenta como una pista más). */
export function otraPista(p, id, ahora = Date.now()) {
  if (p.fase !== 'adivinar') return { ok: false, error: 'Ahora no.' };
  if (id != null && id !== p.adivinador) return { ok: false, error: 'No eres quien adivina.' };
  if (p.pistas.length >= AJUSTES.maxPistas) return { ok: false, error: `Como mucho ${AJUSTES.maxPistas} pistas: ¡toca decir un número!` };
  pedirPista(p, ahora);
  return { ok: true };
}

function cerrarTurno(p, numero) {
  const dif = numero == null ? 99 : Math.abs(numero - p.numero);
  const n = Math.max(1, p.pistas.length);
  const pts = puntosDe(n, dif);
  const j = jug(p, p.adivinador);
  j.puntos += pts;
  j.turnos.push(pts);
  p.resultado = { adivinador: p.adivinador, numero: p.numero, dijo: numero, diferencia: dif, pistas: n, puntos: pts };
  p.fase = 'resultado';
  p.hasta = null;
  anotar(p, numero == null ? `⏰ ${j.nombre} no dijo ningún número (+${pts}).`
    : dif === 0 ? `🎯 ¡${j.nombre} clava el ${p.numero}! (+${pts})` : `${j.nombre} dice ${numero}; era ${p.numero} (+${pts}).`, dif === 0 ? 'bueno' : dif === 1 ? 'info' : 'malo');
}

export function adivinar(p, id, numero) {
  if (p.fase !== 'adivinar') return { ok: false, error: 'Ahora no se puede adivinar.' };
  if (id != null && id !== p.adivinador) return { ok: false, error: 'No eres quien adivina.' };
  const n = Number(numero);
  if (!Number.isInteger(n) || n < 1 || n > 10) return { ok: false, error: 'Elige un número del 1 al 10.' };
  cerrarTurno(p, n);
  return { ok: true };
}

export function siguiente(p, ahora = Date.now()) {
  if (p.fase !== 'resultado') return { ok: false, error: 'El turno aún no ha terminado.' };
  siguienteTurno(p, ahora);
  return { ok: true };
}

export function tick(p, ahora = Date.now()) {
  if (!p.hasta || ahora < p.hasta) return false;
  if (p.fase === 'pista') {
    // El que debía dar la pista no la dio: la da otro, sin que cuente para el que adivina
    anotar(p, `⏰ ${nombre(p, p.pistador)} no dio su pista a tiempo.`, 'malo');
    pedirPista(p, ahora);
    return true;
  }
  if (p.fase === 'adivinar') {
    if (p.pistas.length < AJUSTES.maxPistas) { anotar(p, `⏰ ${nombre(p, p.adivinador)} no decidió a tiempo: otra pista.`); pedirPista(p, ahora); } else cerrarTurno(p, null);
    return true;
  }
  return false;
}

function finalizar(p) {
  p.fase = 'fin';
  p.hasta = null;
  const orden = [...p.jugadores].sort((a, b) => (a.fuera - b.fuera) || (a.puntos - b.puntos));
  const vivos = activos(p).filter((j) => j.turnos.length);
  const min = vivos.length ? Math.min(...vivos.map((j) => j.puntos)) : null;
  let puesto = 0;
  let previo = null;
  const tabla = orden.map((j, i) => {
    if (j.puntos !== previo) { puesto = i + 1; previo = j.puntos; }
    return { id: j.id, nombre: j.nombre, puntos: j.puntos, turnos: [...j.turnos], fuera: j.fuera, puesto: j.fuera ? null : puesto };
  });
  p.fin = { tabla, ganadores: min == null ? [] : vivos.filter((j) => j.puntos === min).map((j) => j.id), min };
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
  if (activos(p).length < 2) { finalizar(p); return; }
  if (p.adivinador === id && p.fase !== 'resultado') siguienteTurno(p, ahora);
  else if (p.pistador === id && p.fase === 'pista') pedirPista(p, ahora);
}

/** El número solo lo ve quien no adivina (y todos al acabar el turno). */
export function vistaDe(p, yoId) {
  const veNumero = p.fase === 'resultado' || p.fase === 'fin' || (yoId != null && yoId !== p.adivinador);
  return {
    fase: p.fase,
    turnoN: p.turnoIdx + 1,
    turnos: p.orden.length,
    adivinador: p.adivinador,
    pistador: p.pistador,
    numero: veNumero ? p.numero : null,
    categoria: p.categoria,
    pistas: p.pistas.map((x) => ({ ...x })),
    maxPistas: AJUSTES.maxPistas,
    hasta: p.hasta,
    resultado: p.resultado,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, turnos: [...j.turnos], fuera: j.fuera })),
    log: p.log.slice(-10),
    fin: p.fin,
    yo: jug(p, yoId) ? { id: yoId } : null
  };
}
