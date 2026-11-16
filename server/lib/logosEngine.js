// server/lib/logosEngine.js
// Motor de «Logomanía»: el súper quiz de marcas. Lógica pura de la partida, compartida por el modo local (el
// cliente guarda el estado y lo reenvía) y por el online (las salas guardan el estado en el servidor).
//
// Fases: logomaniaco · pintor (solo online) · retrato · pasaporte · mentiroso · eslogan · experto
// Estados de la partida:  'intro' -> 'ronda' -> 'resultado' -> ... -> 'fin'
import { LOGOMANIACO } from '../data/seeds/logos/logomaniaco.js';
import { PINTOR } from '../data/seeds/logos/pintor.js';
import { RETRATO } from '../data/seeds/logos/retrato.js';
import { PASAPORTE, PAISES } from '../data/seeds/logos/pasaporte.js';
import { MENTIROSO } from '../data/seeds/logos/mentiroso.js';
import { ESLOGAN } from '../data/seeds/logos/eslogan.js';
import { EXPERTO } from '../data/seeds/logos/experto.js';
import { limpiarTrazos } from '../../client/src/games/Garabato/engine.js';

export const FASES = ['logomaniaco', 'pintor', 'retrato', 'pasaporte', 'mentiroso', 'eslogan', 'experto'];
export const SOLO_ONLINE = ['pintor'];
export const DURACIONES = { corto: 2, normal: 3, largo: 5 };

const BANCOS = { logomaniaco: LOGOMANIACO, pintor: PINTOR, retrato: RETRATO, pasaporte: PASAPORTE, mentiroso: MENTIROSO, eslogan: ESLOGAN, experto: EXPERTO };

// Tiempos (ms)
export const TIEMPO = {
  logomaniaco: 25000,
  pintor: 60000,
  retrato: 45000,
  pasaporte: 20000,
  mentirosoResponder: 25000,
  mentirosoVotar: 20000,
  eslogan: 30000,
  expertoElegir: 20000,
  expertoPregunta: 25000
};
// Cuántas marcas hay que decir en El Logomaníaco según la dificultad del requisito (1 fácil · 3 difícil)
export const OBJETIVO_LOGOMANIACO = { 1: 5, 2: 4, 3: 3 };

export const PUNTOS = {
  logomaniaco: 2,
  logomaniacoRebote: 1,
  pintorAdivina: 1,
  pintorPinta: 1,
  retrato: 2,
  pasaporte: 1,
  mentirosoAcierto: 1,
  mentirosoConfiaFalla: -1,
  mentirosoDesconfiaAcierta: 1,
  eslogan: 2,
  expertoFacil: 1,
  expertoDificil: 3
};

// ---------------------------------------------------------------- utilidades
function barajar(arr) {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

/** Forma comparable de un nombre de marca: sin tildes, sin signos y sin espacios («McDonald's» → «mcdonalds»). */
export function compacto(t) {
  return String(t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, 'y')
    .replace(/[^a-z0-9ñ]/g, '');
}

function lev(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[m][n];
}

/** Nombres aceptados de una marca escrita como «Nombre|alias|alias». */
export const nombresDe = (marca) => String(marca).split('|').map((s) => s.trim()).filter(Boolean);
export const nombreMarca = (marca) => nombresDe(marca)[0];

/** ¿La respuesta escrita es esa marca? Perdona tildes, mayúsculas, espacios, signos y erratas pequeñas. */
export function esMarca(respuesta, marca) {
  const r = compacto(respuesta);
  if (r.length < 2) return false;
  return nombresDe(marca).some((n) => {
    const c = compacto(n);
    if (!c) return false;
    if (r === c) return true;
    const largo = Math.max(r.length, c.length);
    const d = lev(r, c);
    if (largo >= 9) return d <= 2;
    if (largo >= 5) return d <= 1;
    return false;
  });
}

const err = (error) => ({ ok: false, error });
const ok = () => ({ ok: true });

const presentes = (p) => p.jugadores.filter((j) => !j.ausente);
const jugador = (p, id) => p.jugadores.find((j) => j.id === id);
function sumar(p, id, n) {
  const j = jugador(p, id);
  if (j) j.puntos += n;
}
function turnoDe(p, numRonda) {
  const pres = presentes(p);
  return pres[(numRonda - 1) % pres.length];
}
function siguienteDe(p, id) {
  const pres = presentes(p);
  if (pres.length < 2) return null;
  const i = pres.findIndex((j) => j.id === id);
  return pres[(i + 1) % pres.length].id;
}

/** Saca un registro del banco sin repetir hasta agotarlo. */
function elegir(p, clave) {
  const banco = BANCOS[clave];
  p.usados[clave] = p.usados[clave] || [];
  let libres = banco.map((_, i) => i).filter((i) => !p.usados[clave].includes(i));
  if (libres.length === 0) {
    p.usados[clave] = [];
    libres = banco.map((_, i) => i);
  }
  const idx = libres[Math.floor(Math.random() * libres.length)];
  p.usados[clave].push(idx);
  return banco[idx];
}

// En el modo local (un solo móvil que se pasa de mano en mano) no hay cuenta atrás, salvo en El Logomaníaco:
// el reloj correría mientras el móvil cambia de manos.
const CON_RELOJ_EN_LOCAL = new Set(['logomaniaco']);
function fijarTiempo(r, ahora, ms, p = null) {
  if (p?.local && !CON_RELOJ_EN_LOCAL.has(r.tipo)) return quitarTiempo(r);
  r.cierraEn = ahora + ms;
  r.totalMs = ms;
}
function quitarTiempo(r) {
  r.cierraEn = null;
  r.totalMs = null;
}

/** Opciones de país: la correcta, la «trampa» si la hay y otras de la lista, sin repetir. */
function opcionesPais(correcto, trampa) {
  const otros = barajar(PAISES.filter((x) => x !== correcto && x !== trampa));
  const malas = [trampa, ...otros].filter(Boolean).slice(0, 3);
  return barajar([correcto, ...malas]);
}

// ----------------------------------------------------------------- creación
function totalDeFase(p) {
  const n = presentes(p).length;
  return n * (DURACIONES[p.config.duracion] || DURACIONES.normal);
}

function empezarFase(p) {
  p.fase = p.config.fases[p.faseIdx];
  p.estado = 'intro';
  p.rondaNum = 0;
  p.totalRondas = totalDeFase(p);
  p.ronda = null;
}

export function limpiarConfig(c, { local = false } = {}) {
  const validas = FASES.filter((f) => !(local && SOLO_ONLINE.includes(f)));
  const fases = validas.filter((f) => Array.isArray(c?.fases) && c.fases.includes(f));
  return { fases: fases.length ? fases : validas, duracion: DURACIONES[c?.duracion] ? c.duracion : 'normal' };
}

/**
 * @param {{id:number,nombre:string}[]} jugadores
 * @param {{fases?:string[], duracion?:string}} config
 */
export function crearPartida(jugadores, config = {}, { local = false } = {}) {
  const p = {
    jugadores: jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: 0, ausente: false })),
    config: limpiarConfig(config, { local }),
    faseIdx: 0,
    fase: null,
    estado: 'intro',
    rondaNum: 0,
    totalRondas: 0,
    usados: {},
    ronda: null,
    local: Boolean(local)
  };
  empezarFase(p);
  return p;
}

// ------------------------------------------------------------------- rondas
const TODOS_A_LA_VEZ = new Set(['retrato', 'pasaporte', 'eslogan']);

function iniciarRonda(p, ahora) {
  p.rondaNum += 1;
  p.estado = 'ronda';
  const base = { tipo: p.fase, resultado: null };

  switch (p.fase) {
    case 'logomaniaco': {
      const [requisito, dificultad, ejemplos] = elegir(p, 'logomaniaco');
      const activoId = turnoDe(p, p.rondaNum).id;
      p.ronda = {
        ...base, requisito, dificultad, objetivo: OBJETIVO_LOGOMANIACO[dificultad] || 4,
        ejemplos: String(ejemplos).split(',').map((s) => s.trim()).filter(Boolean),
        activoId, primeroId: activoId, reboteId: siguienteDe(p, activoId), rebote: false, fallos: [], etapa: 'preparado'
      };
      quitarTiempo(p.ronda);
      break;
    }
    case 'pintor':
      p.ronda = {
        ...base, pintorId: turnoDe(p, p.rondaNum).id, etapa: 'preparado',
        actual: null, trazos: [], trazosV: 0, historial: [], fallidas: [], aciertos: 0
      };
      quitarTiempo(p.ronda);
      break;
    case 'retrato': {
      const [marca, descripcion] = elegir(p, 'retrato');
      p.ronda = { ...base, marca, texto: descripcion, respuestas: {}, etapa: 'respondiendo' };
      fijarTiempo(p.ronda, ahora, TIEMPO.retrato, p);
      break;
    }
    case 'eslogan': {
      const [eslogan, marca] = elegir(p, 'eslogan');
      p.ronda = { ...base, marca, texto: eslogan, respuestas: {}, etapa: 'respondiendo' };
      fijarTiempo(p.ronda, ahora, TIEMPO.eslogan, p);
      break;
    }
    case 'pasaporte': {
      const [marca, pais, trampa] = elegir(p, 'pasaporte');
      const opciones = opcionesPais(pais, trampa);
      p.ronda = { ...base, marca, opciones, correcta: opciones.indexOf(pais), respuestas: {}, etapa: 'respondiendo' };
      fijarTiempo(p.ronda, ahora, TIEMPO.pasaporte, p);
      break;
    }
    case 'mentiroso': {
      const [afirmacion, verdad, explicacion] = elegir(p, 'mentiroso');
      p.ronda = {
        ...base, afirmacion, verdad: Boolean(verdad), explicacion: explicacion || '',
        activoId: turnoDe(p, p.rondaNum).id, respuesta: null, votos: {}, etapa: 'responder'
      };
      fijarTiempo(p.ronda, ahora, TIEMPO.mentirosoResponder, p);
      break;
    }
    case 'experto': {
      const par = elegir(p, 'experto');
      p.ronda = {
        ...base, marcas: [par[0][0], par[1][0]], par, dificilLado: Math.random() < 0.5 ? 0 : 1,
        activoId: turnoDe(p, p.rondaNum).id, lado: null, pregunta: null, opciones: null, correcta: null,
        respuesta: null, etapa: 'elegir'
      };
      fijarTiempo(p.ronda, ahora, TIEMPO.expertoElegir, p);
      break;
    }
    default:
      break;
  }
}

function terminarRonda(p) {
  quitarTiempo(p.ronda);
  p.ronda.etapa = 'revelado';
  p.estado = 'resultado';
}

// -- Retrato / Eslogan / Pasaporte (todos a la vez)
function revelarTodos(p) {
  const r = p.ronda;
  let ganadores;
  let puntos;
  if (r.tipo === 'pasaporte') {
    ganadores = Object.entries(r.respuestas).filter(([, op]) => op === r.correcta).map(([id]) => Number(id));
    puntos = PUNTOS.pasaporte;
  } else {
    ganadores = Object.entries(r.respuestas).filter(([, t]) => esMarca(t, r.marca)).map(([id]) => Number(id));
    puntos = PUNTOS[r.tipo];
  }
  ganadores.forEach((id) => sumar(p, id, puntos));
  r.resultado = { ganadores, puntos };
  terminarRonda(p);
}
const todosRespondieron = (p) => presentes(p).every((x) => p.ronda.respuestas[x.id] !== undefined);

// -- El Logomaníaco
function resolverLogomaniaco(p, conseguido, ahora, motivo = null) {
  const r = p.ronda;
  if (conseguido) {
    const pts = r.rebote ? PUNTOS.logomaniacoRebote : PUNTOS.logomaniaco;
    sumar(p, r.activoId, pts);
    r.resultado = { ganadorId: r.activoId, puntos: pts, rebote: r.rebote };
    return terminarRonda(p);
  }
  r.fallos.push({ id: r.activoId, motivo });
  const siguiente = r.reboteId != null ? jugador(p, r.reboteId) : null;
  if (!r.rebote && siguiente && !siguiente.ausente) {
    // Rebote: el siguiente jugador, y solo él, intenta el mismo requisito
    r.rebote = true;
    r.activoId = siguiente.id;
    r.etapa = 'preparado';
    quitarTiempo(r);
    return undefined;
  }
  r.resultado = { ganadorId: null, puntos: 0, rebote: r.rebote };
  return terminarRonda(p);
}

// -- El pintor
function nuevaMarcaPintor(p) {
  const r = p.ronda;
  r.actual = elegir(p, 'pintor');
  r.trazos = [];
  r.trazosV += 1;
}
function terminarPintor(p) {
  const r = p.ronda;
  if (r.actual && r.etapa === 'jugando') r.historial.push({ marca: nombreMarca(r.actual), adivinoId: null, pasada: true, sinTiempo: true });
  r.actual = null;
  r.resultado = { aciertos: r.aciertos };
  terminarRonda(p);
}

// -- El mentiroso
function cerrarRespuestaMentiroso(p, ahora) {
  const r = p.ronda;
  const votantes = presentes(p).filter((j) => j.id !== r.activoId);
  if (r.respuesta === null || votantes.length === 0) return revelarMentiroso(p);
  r.etapa = 'votar';
  fijarTiempo(r, ahora, TIEMPO.mentirosoVotar, p);
  return undefined;
}
function revelarMentiroso(p) {
  const r = p.ronda;
  const acierta = r.respuesta !== null && r.respuesta === r.verdad;
  if (acierta) sumar(p, r.activoId, PUNTOS.mentirosoAcierto);
  const delta = {};
  if (acierta) delta[r.activoId] = PUNTOS.mentirosoAcierto;
  Object.entries(r.votos).forEach(([id, voto]) => {
    let n = 0;
    if (voto === 'confio' && !acierta) n = PUNTOS.mentirosoConfiaFalla;
    if (voto === 'desconfio' && !acierta) n = PUNTOS.mentirosoDesconfiaAcierta;
    if (n) { sumar(p, Number(id), n); delta[id] = n; }
  });
  r.resultado = { acierta, delta };
  terminarRonda(p);
}

// -- El experto
function revelarExperto(p) {
  const r = p.ronda;
  const dificil = r.lado === r.dificilLado;
  const acierta = r.respuesta != null && r.respuesta === r.correcta;
  const puntos = acierta ? (dificil ? PUNTOS.expertoDificil : PUNTOS.expertoFacil) : 0;
  if (puntos) sumar(p, r.activoId, puntos);
  r.resultado = { acierta, dificil, puntos };
  terminarRonda(p);
}

// ------------------------------------------------------------------- tiempo
function cerrarPorTiempo(p, ahora) {
  const r = p.ronda;
  if (!r) return undefined;
  switch (r.tipo) {
    case 'logomaniaco': return r.etapa === 'jugando' ? resolverLogomaniaco(p, false, ahora, 'tiempo') : undefined;
    case 'pintor': return r.etapa === 'jugando' ? terminarPintor(p) : undefined;
    case 'retrato': case 'pasaporte': case 'eslogan': return revelarTodos(p);
    case 'mentiroso': return r.etapa === 'responder' ? cerrarRespuestaMentiroso(p, ahora) : revelarMentiroso(p);
    case 'experto':
      if (r.etapa === 'elegir') return elegirLado(p, Math.random() < 0.5 ? 0 : 1, ahora);
      return revelarExperto(p);
    default: return undefined;
  }
}

/** Resuelve las rondas cuyo tiempo ya ha vencido (el servidor lo llama al consultar). */
export function tick(p, ahora = Date.now()) {
  if (p.estado === 'ronda' && p.ronda && p.ronda.cierraEn && ahora >= p.ronda.cierraEn) cerrarPorTiempo(p, ahora);
}

function saltarRonda(p) {
  const r = p.ronda;
  if (!r) return;
  r.saltada = true;
  if (r.tipo === 'pintor') { r.actual = null; r.resultado = { aciertos: r.aciertos }; return terminarRonda(p); }
  r.resultado = r.tipo === 'mentiroso' ? { acierta: null, delta: {} } : { ganadores: [], puntos: 0, ganadorId: null };
  terminarRonda(p);
}

export function marcarAusente(p, id) {
  const j = jugador(p, id);
  if (!j || j.ausente) return;
  j.ausente = true;
  if (presentes(p).length < 2) {
    p.estado = 'fin';
    p.ronda = null;
    return;
  }
  if (p.estado !== 'ronda' || !p.ronda) return;
  const r = p.ronda;
  const ahora = Date.now();
  switch (r.tipo) {
    case 'retrato': case 'pasaporte': case 'eslogan':
      if (todosRespondieron(p)) revelarTodos(p);
      break;
    case 'logomaniaco':
      if (r.activoId === id) resolverLogomaniaco(p, false, ahora, 'ausente');
      else if (r.reboteId === id && !r.rebote) r.reboteId = null;
      break;
    case 'pintor':
      if (r.pintorId === id) terminarPintor(p);
      break;
    case 'mentiroso':
      if (r.activoId === id) { r.respuesta = null; revelarMentiroso(p); } else if (r.etapa === 'votar' && votosCompletos(p)) revelarMentiroso(p);
      break;
    case 'experto':
      if (r.activoId === id) { r.respuesta = null; revelarExperto(p); }
      break;
    default:
      break;
  }
}

// ------------------------------------------------------------------ acciones
/**
 * Aplica una acción al estado (lo modifica). Devuelve { ok } o { ok:false, error }.
 * La acción lleva `jugadorId` (lo fija el servidor en el modo online).
 */
export function aplicar(p, a, ahora = Date.now()) {
  if (!a || typeof a.tipo !== 'string') return err('Acción no válida.');
  if (p.estado === 'fin') return err('La partida ha terminado.');
  tick(p, ahora);

  switch (a.tipo) {
    case 'tiempo':
      // Modo local: el cliente avisa de que su cuenta atrás ha llegado a 0
      if (p.estado === 'ronda' && p.ronda?.cierraEn && ahora >= p.ronda.cierraEn - 2500) cerrarPorTiempo(p, ahora);
      return ok();
    case 'continuar':
      if (p.estado === 'intro') { iniciarRonda(p, ahora); return ok(); }
      if (p.estado === 'resultado') {
        if (p.rondaNum < p.totalRondas) iniciarRonda(p, ahora);
        else if (p.faseIdx + 1 < p.config.fases.length) { p.faseIdx += 1; empezarFase(p); } else { p.estado = 'fin'; p.ronda = null; }
        return ok();
      }
      return err('Ahora no se puede continuar.');
    case 'saltar':
      if (p.estado !== 'ronda') return err('No hay ronda activa.');
      saltarRonda(p);
      return ok();
    case 'finalizar':
      p.estado = 'fin';
      p.ronda = null;
      return ok();
    default:
      break;
  }

  if (p.estado !== 'ronda' || !p.ronda) return err('La ronda ya ha terminado.');
  const r = p.ronda;
  const j = jugador(p, a.jugadorId);
  // En el modo local las acciones las hace «el móvil», no un jugador concreto, salvo las secretas
  const yo = j && !j.ausente ? j : null;

  switch (r.tipo) {
    case 'logomaniaco': return accionLogomaniaco(p, a, yo, ahora);
    case 'pintor': return accionPintor(p, a, yo, ahora);
    case 'retrato': case 'pasaporte': case 'eslogan': return responderTodos(p, a, yo);
    case 'mentiroso': return accionMentiroso(p, a, yo, ahora);
    case 'experto': return accionExperto(p, a, yo, ahora);
    default: return err('Acción desconocida.');
  }
}

function accionLogomaniaco(p, a, yo, ahora) {
  const r = p.ronda;
  if (a.tipo === 'empezar') {
    if (r.etapa !== 'preparado') return err('El turno ya ha empezado.');
    if (!p.local && yo?.id !== r.activoId) return err('Empieza quien tiene el turno.');
    r.etapa = 'jugando';
    fijarTiempo(r, ahora, TIEMPO.logomaniaco, p);
    return ok();
  }
  if (a.tipo === 'veredicto') {
    if (r.etapa !== 'jugando') return err('El turno no está en marcha.');
    // Validan los demás en voz alta: online, quien tiene el turno no puede darse por bueno a sí mismo
    if (!p.local && (!yo || yo.id === r.activoId)) return err('Lo deciden los demás jugadores.');
    resolverLogomaniaco(p, Boolean(a.conseguido), ahora, a.conseguido ? null : 'fallo');
    return ok();
  }
  return err('Acción desconocida.');
}

function accionPintor(p, a, yo, ahora) {
  const r = p.ronda;
  const esPintor = yo?.id === r.pintorId;
  switch (a.tipo) {
    case 'empezar':
      if (r.etapa !== 'preparado') return err('El turno ya ha empezado.');
      if (!esPintor) return err('Empieza quien pinta.');
      r.etapa = 'jugando';
      nuevaMarcaPintor(p);
      fijarTiempo(r, ahora, TIEMPO.pintor, p);
      return ok();
    case 'trazos':
      if (r.etapa !== 'jugando' || !esPintor) return err('Ahora no puedes dibujar.');
      r.trazos = limpiarTrazos(a.trazos);
      r.trazosV += 1;
      return ok();
    case 'pasar':
      if (r.etapa !== 'jugando' || !esPintor) return err('Solo quien pinta puede pasar.');
      r.historial.push({ marca: nombreMarca(r.actual), adivinoId: null, pasada: true });
      nuevaMarcaPintor(p);
      return ok();
    case 'adivinar': {
      if (r.etapa !== 'jugando') return err('Ahora no se puede adivinar.');
      if (!yo || esPintor) return err('Adivinan los demás.');
      const texto = String(a.texto ?? '').trim().slice(0, 40);
      if (!texto) return err('Escribe una marca.');
      if (esMarca(texto, r.actual)) {
        sumar(p, yo.id, PUNTOS.pintorAdivina);
        sumar(p, r.pintorId, PUNTOS.pintorPinta);
        r.aciertos += 1;
        r.historial.push({ marca: nombreMarca(r.actual), adivinoId: yo.id });
        nuevaMarcaPintor(p);
        return { ok: true, acierto: true };
      }
      r.fallidas.push({ id: yo.id, texto });
      if (r.fallidas.length > 12) r.fallidas.shift();
      return { ok: true, acierto: false };
    }
    default:
      return err('Acción desconocida.');
  }
}

function responderTodos(p, a, yo) {
  const r = p.ronda;
  if (a.tipo !== 'responder') return err('Acción desconocida.');
  if (r.etapa !== 'respondiendo') return err('La ronda ya ha terminado.');
  if (!yo) return err('Jugador no válido.');
  if (r.respuestas[yo.id] !== undefined) return err('Ya has respondido.');
  if (r.tipo === 'pasaporte') {
    const op = Number(a.opcion);
    if (!Number.isInteger(op) || op < 0 || op >= r.opciones.length) return err('Opción no válida.');
    r.respuestas[yo.id] = op;
  } else {
    const texto = String(a.texto ?? '').trim().slice(0, 40);
    if (!texto) return err('Escribe una marca.');
    r.respuestas[yo.id] = texto;
  }
  if (todosRespondieron(p)) revelarTodos(p);
  return ok();
}

const votosCompletos = (p) => presentes(p).filter((x) => x.id !== p.ronda.activoId).every((x) => p.ronda.votos[x.id] !== undefined);

function accionMentiroso(p, a, yo, ahora) {
  const r = p.ronda;
  if (a.tipo === 'responder') {
    if (r.etapa !== 'responder') return err('Ya ha respondido.');
    if (yo?.id !== r.activoId) return err('No es tu turno.');
    if (typeof a.verdad !== 'boolean') return err('Elige verdadero o falso.');
    r.respuesta = a.verdad;
    cerrarRespuestaMentiroso(p, ahora);
    return ok();
  }
  if (a.tipo === 'votar') {
    if (r.etapa !== 'votar') return err('Ahora no se vota.');
    if (!yo || yo.id === r.activoId) return err('Votan los demás.');
    if (r.votos[yo.id] !== undefined) return err('Ya has votado.');
    if (a.voto !== 'confio' && a.voto !== 'desconfio') return err('Voto no válido.');
    r.votos[yo.id] = a.voto;
    if (votosCompletos(p)) revelarMentiroso(p);
    return ok();
  }
  return err('Acción desconocida.');
}

function elegirLado(p, lado, ahora) {
  const r = p.ronda;
  const [, facil, dificil] = r.par[lado];
  const [pregunta, buena, ...malas] = lado === r.dificilLado ? dificil : facil;
  const opciones = barajar([buena, ...malas]);
  Object.assign(r, { lado, pregunta, opciones, correcta: opciones.indexOf(buena), etapa: 'pregunta' });
  fijarTiempo(r, ahora, TIEMPO.expertoPregunta, p);
}

function accionExperto(p, a, yo, ahora) {
  const r = p.ronda;
  if (yo?.id !== r.activoId) return err('No es tu turno.');
  if (a.tipo === 'elegir') {
    if (r.etapa !== 'elegir') return err('Ya has elegido.');
    const lado = Number(a.lado);
    if (lado !== 0 && lado !== 1) return err('Marca no válida.');
    elegirLado(p, lado, ahora);
    return ok();
  }
  if (a.tipo === 'responder') {
    if (r.etapa !== 'pregunta') return err('Primero elige una marca.');
    const op = Number(a.opcion);
    if (!Number.isInteger(op) || op < 0 || op >= r.opciones.length) return err('Opción no válida.');
    r.respuesta = op;
    revelarExperto(p);
    return ok();
  }
  return err('Acción desconocida.');
}

// --------------------------------------------------------------------- vista
/**
 * Estado «seguro» para enviar al cliente: oculta soluciones y respuestas ajenas hasta que se revelan.
 * @param viewerId  id del jugador que mira (null en local)
 */
export function vista(p, viewerId = null, opts = {}, ahora = Date.now()) {
  const r = p.ronda;
  let ronda = null;

  if (r) {
    const rev = r.etapa === 'revelado';
    const base = { tipo: r.tipo, etapa: r.etapa, saltada: Boolean(r.saltada), resultado: rev ? r.resultado : undefined };
    switch (r.tipo) {
      case 'logomaniaco':
        ronda = {
          ...base, requisito: r.requisito, dificultad: r.dificultad, objetivo: r.objetivo, activoId: r.activoId,
          primeroId: r.primeroId, reboteId: r.reboteId, rebote: r.rebote, fallos: r.fallos,
          ejemplos: rev ? r.ejemplos : undefined
        };
        break;
      case 'pintor': {
        const veMarca = viewerId === r.pintorId || opts.todo;
        ronda = {
          ...base, pintorId: r.pintorId, aciertos: r.aciertos, trazos: r.trazos, trazosV: r.trazosV,
          actual: veMarca && r.actual ? nombreMarca(r.actual) : undefined,
          pista: r.actual ? nombreMarca(r.actual).replace(/[^\s]/g, '_') : '',
          historial: r.historial, fallidas: r.fallidas
        };
        break;
      }
      case 'retrato': case 'eslogan': case 'pasaporte':
        ronda = {
          ...base,
          texto: r.texto,
          marca: r.tipo === 'pasaporte' || rev ? nombreMarca(r.marca) : undefined,
          opciones: r.opciones,
          respondieron: Object.keys(r.respuestas).map(Number),
          miRespuesta: viewerId != null ? r.respuestas[viewerId] : undefined,
          respuestas: rev ? r.respuestas : undefined,
          correcta: rev ? r.correcta : undefined
        };
        break;
      case 'mentiroso':
        ronda = {
          ...base, afirmacion: r.afirmacion, activoId: r.activoId,
          respuesta: r.etapa === 'responder' ? undefined : r.respuesta,
          votaron: Object.keys(r.votos).map(Number),
          miVoto: viewerId != null ? r.votos[viewerId] : undefined,
          votos: rev ? r.votos : undefined,
          verdad: rev ? r.verdad : undefined,
          explicacion: rev ? r.explicacion : undefined
        };
        break;
      case 'experto':
        ronda = {
          ...base, marcas: r.marcas, activoId: r.activoId, lado: r.lado, pregunta: r.pregunta, opciones: r.opciones,
          respuesta: rev ? r.respuesta : undefined,
          correcta: rev ? r.correcta : undefined,
          dificilLado: rev ? r.dificilLado : undefined
        };
        break;
      default:
        break;
    }
    ronda.restanteMs = r.cierraEn ? Math.max(0, r.cierraEn - ahora) : null;
    ronda.totalMs = r.totalMs || null;
  }

  return {
    estado: p.estado,
    fase: p.fase,
    faseIdx: p.faseIdx,
    fases: p.config.fases,
    duracion: p.config.duracion,
    rondaNum: p.rondaNum,
    totalRondas: p.totalRondas,
    local: p.local,
    jugadores: p.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, ausente: j.ausente })),
    ronda
  };
}

export { TODOS_A_LA_VEZ };
