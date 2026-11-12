// client/src/games/Fichajes/engine.js
// «Fichaje exprés»: sale un futbolista y hay que decir su equipo actual en 15 segundos. Si aciertas, sale otro (cada
// vez menos conocido); si fallas o se acaba el tiempo, tu racha termina y sumas tantos puntos como aciertos llevabas.
// Cada ronda juegan todos, uno detrás de otro. Motor puro (servidor y modo un dispositivo).
// futbolistas: [{ nombre, club, media, pos, pais }] (temporada 2025/26)
import { buscarOpcion, nombreOpcion } from '../comun/simultaneo.js';

export const SEGUNDOS = 15;

// Club de la base → «Nombre completo|alias|alias»
export const CLUBES = {
  'Real Madrid': 'Real Madrid|madrid|rm', Barcelona: 'Barcelona|barça|fc barcelona|barsa', 'Atlético': 'Atlético de Madrid|atletico|atleti',
  Athletic: 'Athletic Club|athletic|athletic bilbao|bilbao', 'Real Sociedad': 'Real Sociedad|la real', Betis: 'Real Betis|betis', Villarreal: 'Villarreal',
  Celta: 'Celta de Vigo|celta', Osasuna: 'Osasuna', Valencia: 'Valencia', Mallorca: 'Mallorca', 'Rayo Vallecano': 'Rayo Vallecano|rayo',
  Girona: 'Girona', Espanyol: 'Espanyol', Sevilla: 'Sevilla',
  Liverpool: 'Liverpool', 'Man City': 'Manchester City|city|man city', 'Man United': 'Manchester United|united|man united|man utd',
  Arsenal: 'Arsenal', Chelsea: 'Chelsea', Tottenham: 'Tottenham|spurs|tottenham hotspur', 'Aston Villa': 'Aston Villa|villa', Newcastle: 'Newcastle',
  Brighton: 'Brighton', 'West Ham': 'West Ham', 'Nottingham Forest': 'Nottingham Forest|forest|nottingham', 'Crystal Palace': 'Crystal Palace|palace',
  Fulham: 'Fulham', Everton: 'Everton', Burnley: 'Burnley', Sunderland: 'Sunderland',
  Bayern: 'Bayern de Múnich|bayern|bayern munich', Dortmund: 'Borussia Dortmund|dortmund|borussia', Leverkusen: 'Bayer Leverkusen|leverkusen',
  Leipzig: 'RB Leipzig|leipzig', Stuttgart: 'Stuttgart', 'Eintracht Fráncfort': 'Eintracht Fráncfort|eintracht|frankfurt|francfort', Hoffenheim: 'Hoffenheim',
  Inter: 'Inter de Milán|inter|inter milan', Milan: 'Milan|ac milan', Juventus: 'Juventus|juve', 'Nápoles': 'Nápoles|napoli', Atalanta: 'Atalanta',
  Roma: 'Roma|as roma', Lazio: 'Lazio', Fiorentina: 'Fiorentina', Como: 'Como', Bolonia: 'Bolonia|bologna',
  PSG: 'PSG|paris saint germain|paris sg', 'Paris FC': 'Paris FC',
  Oporto: 'Oporto|porto|fc porto', Sporting: 'Sporting de Portugal|sporting|sporting lisboa', 'Fenerbahçe': 'Fenerbahçe|fenerbahce',
  Galatasaray: 'Galatasaray', Trabzonspor: 'Trabzonspor',
  'Al Hilal': 'Al-Hilal|al hilal', 'Al Nassr': 'Al-Nassr|al nassr', 'Al Ittihad': 'Al-Ittihad|al ittihad',
  'Inter Miami': 'Inter Miami|miami', 'Los Angeles FC': 'Los Angeles FC|lafc', Santos: 'Santos'
};
export const OPCIONES_CLUB = Object.values(CLUBES);
export const NOMBRES_CLUB = OPCIONES_CLUB.map(nombreOpcion).sort((a, b) => a.localeCompare(b));
const claveClub = Object.keys(CLUBES);

/** Media mínima del siguiente futbolista según la racha (cada vez menos conocidos). */
export const mediaMinima = (racha) => (racha < 3 ? 86 : racha < 6 ? 83 : racha < 10 ? 80 : 0);

const jug = (p, id) => p.jugadores.find((j) => j.id === id);
const azar = (p) => (typeof p.rng === 'function' ? p.rng() : Math.random());

export function crearPartida(jugadores, futbolistas, reglas = {}, ahora = Date.now(), rng = Math.random) {
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, aciertos: 0, mejor: 0, fuera: false })),
    futbolistas, usados: [], rondas: Math.max(1, Number(reglas.rondas) || 5), ronda: 1, turno: 0,
    fase: 'preparado', racha: 0, actual: null, hasta: null, ultimo: null, historial: [], nAviso: 0, fin: null
  };
  Object.defineProperty(p, 'rng', { value: rng, enumerable: false, writable: true });
  saltarFuera(p);
  return p;
}

function saltarFuera(p) {
  while (p.fase !== 'fin' && p.jugadores[p.turno]?.fuera) avanzarTurno(p);
}

function avanzarTurno(p) {
  p.turno += 1;
  if (p.turno >= p.jugadores.length) { p.turno = 0; p.ronda += 1; }
  if (p.ronda > p.rondas || p.jugadores.every((j) => j.fuera)) finalizar(p);
  else p.fase = 'preparado';
}

function siguienteFutbolista(p, ahora) {
  const min = mediaMinima(p.racha);
  const libres = p.futbolistas.map((f, i) => i).filter((i) => !p.usados.includes(i));
  let candidatos = libres.filter((i) => p.futbolistas[i].media >= min && (min === 0 || p.futbolistas[i].media < min + 6 || p.racha < 3));
  if (!candidatos.length) candidatos = libres;
  if (!candidatos.length) { p.usados = []; candidatos = p.futbolistas.map((f, i) => i); }
  const i = candidatos[Math.floor(azar(p) * candidatos.length)];
  p.usados.push(i);
  p.actual = i;
  p.hasta = ahora + SEGUNDOS * 1000;
}

export const turnoDe = (p) => p.jugadores[p.turno]?.id ?? null;

/** El jugador del turno está listo: sale su primer futbolista. */
export function empezar(p, id, ahora = Date.now()) {
  if (p.fase !== 'preparado') return { ok: false, error: 'Ahora no.' };
  if (turnoDe(p) !== id) return { ok: false, error: 'No es tu turno.' };
  p.fase = 'pregunta';
  p.racha = 0;
  siguienteFutbolista(p, ahora);
  return { ok: true };
}

function terminarRacha(p, respuesta, ahora) {
  const j = p.jugadores[p.turno];
  const f = p.futbolistas[p.actual];
  j.puntos += p.racha;
  j.aciertos += p.racha;
  j.mejor = Math.max(j.mejor, p.racha);
  p.ultimo = { id: j.id, racha: p.racha, nombre: f.nombre, club: nombreOpcion(CLUBES[f.club] || f.club), respuesta, ronda: p.ronda, n: ++p.nAviso };
  p.historial.push(p.ultimo);
  p.actual = null; p.hasta = null; p.racha = 0;
  avanzarTurno(p);
  saltarFuera(p);
}

export function responder(p, id, texto, ahora = Date.now()) {
  if (p.fase !== 'pregunta') return { ok: false, error: 'Ahora no se puede responder.' };
  if (turnoDe(p) !== id) return { ok: false, error: 'No es tu turno.' };
  const f = p.futbolistas[p.actual];
  const i = buscarOpcion(texto, OPCIONES_CLUB);
  const bien = i >= 0 && claveClub[i] === f.club;
  if (bien) {
    p.racha += 1;
    p.acierto = { nombre: f.nombre, club: nombreOpcion(CLUBES[f.club]), n: ++p.nAviso };
    siguienteFutbolista(p, ahora);
  } else terminarRacha(p, i >= 0 ? nombreOpcion(OPCIONES_CLUB[i]) : String(texto || '').trim() || null, ahora);
  return { ok: true, bien };
}

export function tick(p, ahora = Date.now()) {
  if (p.fase === 'pregunta' && p.hasta && ahora >= p.hasta) terminarRacha(p, null, ahora);
}

function finalizar(p) {
  p.fase = 'fin'; p.hasta = null; p.actual = null;
  const lista = [...p.jugadores].sort((a, b) => (a.fuera - b.fuera) || (b.puntos - a.puntos) || (b.mejor - a.mejor));
  const max = Math.max(0, ...lista.filter((j) => !j.fuera).map((j) => j.puntos));
  let puesto = 0; let previo = null;
  const tabla = lista.map((j, k) => {
    if (j.puntos !== previo) { puesto = k + 1; previo = j.puntos; }
    return { id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, mejor: j.mejor, fuera: j.fuera, puesto };
  });
  p.fin = { tabla, max, ganadores: max > 0 ? tabla.filter((j) => !j.fuera && j.puntos === max).map((j) => j.id) : [] };
}

export function terminar(p) { if (p.fase !== 'fin') finalizar(p); return { ok: true }; }

export function abandonar(p, id, ahora = Date.now()) {
  const j = jug(p, id);
  if (!j || p.fase === 'fin') return;
  const eraSuTurno = turnoDe(p) === id;
  j.fuera = true;
  if (eraSuTurno) {
    if (p.fase === 'pregunta') terminarRacha(p, null, ahora);
    else { avanzarTurno(p); saltarFuera(p); }
  }
  if (p.jugadores.every((x) => x.fuera)) finalizar(p);
}

export function vistaDe(p, id) {
  const f = p.actual != null ? p.futbolistas[p.actual] : null;
  return {
    fase: p.fase, ronda: Math.min(p.ronda, p.rondas), rondas: p.rondas, hasta: p.hasta, segundos: SEGUNDOS,
    turno: p.fase === 'fin' ? null : turnoDe(p), racha: p.racha,
    futbolista: f ? { nombre: f.nombre, pos: f.pos, pais: f.pais } : null,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, aciertos: j.aciertos, mejor: j.mejor, fuera: j.fuera })),
    yo: p.jugadores.some((j) => j.id === id) ? { id } : null,
    ultimo: p.ultimo, acierto: p.acierto ?? null,
    historial: p.historial.slice(-30),
    fin: p.fin
  };
}
