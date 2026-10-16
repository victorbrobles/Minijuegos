// Salas de «Luna de Sangre» (partida en red).
// El servidor es el ÚNICO árbitro: guarda el estado completo del motor y envía a cada jugador
// una "vista" con solo lo que puede saber. Reutiliza el motor del cliente (engine.js) sin cambios.

import crypto from 'node:crypto';
import * as E from '../../client/src/games/Lobos/engine.js';
import { ROLES } from '../../client/src/games/Lobos/roles.js';
import { componer, validar, deRecuento, MIN_JUGADORES, MAX_JUGADORES } from '../../client/src/games/Lobos/composiciones.js';
import { decidirDesdeVista } from './bots.js';

export const salas = new Map();

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LARGO_CODIGO = 5;
const ESPERA_LARGA = 25000; // long-polling

export class ErrorSala extends Error {
  constructor(mensaje, estado = 400) { super(mensaje); this.estado = estado; }
}
const falla = (m, c) => { throw new ErrorSala(m, c); };

const aleatorio = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ───────────────────────── Creación y acceso ───────────────────────── */

function codigoNuevo() {
  for (let i = 0; i < 50; i++) {
    const c = Array.from({ length: LARGO_CODIGO }, () => ALFABETO[crypto.randomInt(ALFABETO.length)]).join('');
    if (!salas.has(c)) return c;
  }
  throw new Error('Sin códigos libres');
}

const limpiarNombre = (n) => String(n ?? '').trim().replace(/\s+/g, ' ').slice(0, 20);

export function crearSala(nombre) {
  nombre = limpiarNombre(nombre);
  if (!nombre) falla('Escribe tu nombre.');
  const sala = {
    code: codigoNuevo(),
    jugadores: [{ nombre, token: crypto.randomBytes(12).toString('hex'), bot: false, visto: Date.now() }],
    fase: 'lobby',
    faseId: 0,
    ver: 1,
    config: {
      seleccion: { modo: 'recomendada', tipo: 'equilibrada', custom: {} },
      mec: { ...E.MEC_NINGUNA },
      minutos: 3, votosPublicos: true, nocheSeg: 120, votoSeg: 60
    },
    e: null,
    rolesPartida: [],
    listos: new Set(),
    infoNoche: {},
    origen: 'noche',
    objetoDia: null,
    debate: null,
    vot: null,
    res: null,
    ecoEnviado: false,
    timer: null,
    timerFin: null,
    esperas: [],
    botTimers: new Map(),
    creada: Date.now(),
    ultima: Date.now()
  };
  salas.set(sala.code, sala);
  return { code: sala.code, token: sala.jugadores[0].token };
}

export function unirse(code, nombre) {
  const sala = obtener(code);
  nombre = limpiarNombre(nombre);
  if (!nombre) falla('Escribe tu nombre.');
  // Reconexión: mismo nombre que un jugador que ahora mismo está desconectado (p. ej. cerró el navegador)
  const previo = sala.jugadores.find((p) => !p.bot && p.nombre.toLowerCase() === nombre.toLowerCase());
  if (previo && Date.now() - previo.visto > 40000) {
    previo.visto = Date.now();
    cambiar(sala);
    return { code: sala.code, token: previo.token, reconectado: true };
  }
  if (sala.fase !== 'lobby') falla(previo ? 'Ese jugador sigue conectado: si eres tú, espera unos segundos y reintenta.' : 'La partida ya ha empezado.', 409);
  if (sala.jugadores.length >= MAX_JUGADORES) falla(`La sala está llena (máximo ${MAX_JUGADORES}).`, 409);
  if (sala.jugadores.some((p) => p.nombre.toLowerCase() === nombre.toLowerCase())) falla('Ya hay un jugador con ese nombre.', 409);
  const token = crypto.randomBytes(12).toString('hex');
  sala.jugadores.push({ nombre, token, bot: false, visto: Date.now() });
  cambiar(sala);
  return { code: sala.code, token };
}

export function obtener(code) {
  const sala = salas.get(String(code ?? '').toUpperCase().trim());
  if (!sala) falla('No existe ninguna partida con ese código.', 404);
  return sala;
}

export function idDe(sala, token) {
  const i = sala.jugadores.findIndex((p) => !p.bot && p.token === token);
  if (i < 0) falla('Sesión no válida: vuelve a unirte a la partida.', 403);
  return i;
}

// Limpieza de salas abandonadas
setInterval(() => {
  const ahora = Date.now();
  for (const [c, s] of salas) if (ahora - s.ultima > 6 * 3600 * 1000) { limpiarTimers(s); salas.delete(c); }
}, 10 * 60 * 1000).unref();

/* ───────────────────────── Notificación (long-polling) ───────────────────────── */

function cambiar(sala) {
  sala.ver += 1;
  sala.ultima = Date.now();
  const pendientes = sala.esperas;
  sala.esperas = [];
  pendientes.forEach((w) => { clearTimeout(w.timer); w.resolver(); });
  programarBots(sala);
}

// Devuelve cuando la versión supera `ver` o pasado el tiempo de espera
export function esperarCambio(sala, ver) {
  if (sala.ver > ver) return Promise.resolve();
  return new Promise((resolver) => {
    const w = { resolver };
    w.timer = setTimeout(() => { sala.esperas = sala.esperas.filter((x) => x !== w); resolver(); }, ESPERA_LARGA);
    sala.esperas.push(w);
  });
}

export function latido(sala, id) {
  if (sala.jugadores[id]) sala.jugadores[id].visto = Date.now();
}

/* ───────────────────────── Temporizadores de fase ───────────────────────── */

function limpiarTimers(sala) {
  if (sala.timer) clearTimeout(sala.timer);
  sala.timer = null;
  sala.timerFin = null;
  sala.botTimers.forEach((t) => clearTimeout(t));
  sala.botTimers.clear();
}

function temporizar(sala, ms, fn) {
  if (sala.timer) clearTimeout(sala.timer);
  const faseId = sala.faseId;
  sala.timerFin = ms == null ? null : Date.now() + ms;
  sala.timer = ms == null ? null : setTimeout(() => {
    if (sala.faseId !== faseId) return;
    try { fn(); } catch (err) { console.error('[lobos] error en temporizador:', err); }
    cambiar(sala);
  }, ms);
}

function nuevaFase(sala, fase) {
  sala.fase = fase;
  sala.faseId += 1;
  sala.listos = new Set();
  if (sala.timer) clearTimeout(sala.timer);
  sala.timer = null;
  sala.timerFin = null;
}

/* ───────────────────────── Configuración de la partida ───────────────────────── */

export function rolesDeConfig(sala) {
  const n = sala.jugadores.length;
  const { seleccion } = sala.config;
  if (seleccion.modo === 'personalizada') return deRecuento(seleccion.custom || {});
  return componer(seleccion.tipo, Math.min(MAX_JUGADORES, Math.max(MIN_JUGADORES, n)));
}

function saneaConfig(sala, c) {
  const cfg = sala.config;
  if (c.seleccion) {
    const s = c.seleccion;
    if (s.modo === 'personalizada') {
      const custom = {};
      Object.entries(s.custom || {}).forEach(([r, k]) => { if (ROLES[r] && Number.isInteger(k) && k > 0) custom[r] = Math.min(k, ROLES[r].unico ? 1 : 20); });
      cfg.seleccion = { modo: 'personalizada', tipo: cfg.seleccion.tipo, custom };
    } else {
      cfg.seleccion = { modo: 'recomendada', tipo: String(s.tipo), custom: cfg.seleccion.custom || {} };
      try { componer(cfg.seleccion.tipo, 10); } catch { cfg.seleccion.tipo = 'equilibrada'; }
    }
  }
  if (c.mec) Object.keys(E.MEC_NINGUNA).forEach((k) => { if (k in c.mec) cfg.mec[k] = !!c.mec[k]; });
  if (c.minutos != null && [0, 1, 2, 3, 5].includes(Number(c.minutos))) cfg.minutos = Number(c.minutos);
  if (c.votosPublicos != null) cfg.votosPublicos = !!c.votosPublicos;
  if (c.nocheSeg != null) cfg.nocheSeg = Math.min(300, Math.max(30, Number(c.nocheSeg) || 120));
  if (c.votoSeg != null) cfg.votoSeg = Math.min(180, Math.max(20, Number(c.votoSeg) || 60));
}

/* ───────────────────────── Acciones (punto de entrada) ───────────────────────── */

export function accion(sala, id, msg) {
  sala.ultima = Date.now();
  const esAdmin = id === 0;
  const tipo = msg?.tipo;
  const f = FASES[sala.fase] || {};

  // Acciones válidas en cualquier fase
  if (tipo === 'ackAvisos' && sala.e) {
    sala.e = E.limpiarSoloAvisos(sala.e, id);
    return cambiar(sala);
  }
  if (sala.fase === 'lobby') return accionLobby(sala, id, esAdmin, msg);
  if (tipo === 'abandonar' && esAdmin) falla('El anfitrión no puede abandonar.');

  if (tipo === 'reiniciar' && esAdmin && sala.fase === 'fin') return volverALobby(sala);
  const fn = f[tipo];
  if (!fn) falla('Acción no permitida ahora.');
  fn(sala, id, msg, esAdmin);
  cambiar(sala);
}

/* ───────────────────────── LOBBY ───────────────────────── */

function accionLobby(sala, id, esAdmin, msg) {
  switch (msg.tipo) {
    case 'config':
      if (!esAdmin) falla('Solo el anfitrión puede configurar la partida.', 403);
      saneaConfig(sala, msg.config || {});
      break;
    case 'addBot': {
      if (!esAdmin) falla('Solo el anfitrión puede añadir bots.', 403);
      if (sala.jugadores.length >= MAX_JUGADORES) falla('La sala está llena.');
      let k = 1;
      while (sala.jugadores.some((p) => p.nombre === `Bot ${k}`)) k++;
      sala.jugadores.push({ nombre: `Bot ${k}`, token: crypto.randomBytes(6).toString('hex'), bot: true, visto: Date.now() });
      break;
    }
    case 'expulsar': {
      if (!esAdmin) falla('Solo el anfitrión puede expulsar.', 403);
      const i = Number(msg.id);
      if (!Number.isInteger(i) || i <= 0 || i >= sala.jugadores.length) falla('Jugador no válido.');
      sala.jugadores.splice(i, 1);
      break;
    }
    case 'abandonar':
      if (esAdmin) falla('El anfitrión no puede abandonar: cierra la sala.');
      sala.jugadores.splice(id, 1);
      break;
    case 'empezar':
      if (!esAdmin) falla('Solo el anfitrión puede empezar.', 403);
      empezar(sala);
      return;
    default:
      falla('Acción no permitida en la sala de espera.');
  }
  cambiar(sala);
}

function empezar(sala) {
  const n = sala.jugadores.length;
  if (n < MIN_JUGADORES) falla(`Hacen falta al menos ${MIN_JUGADORES} jugadores (hay ${n}).`);
  const roles = rolesDeConfig(sala);
  const v = validar(roles, n);
  if (v.errores.length) falla(v.errores[0]);
  const { votosPublicos, mec } = sala.config;
  sala.e = E.crearPartida(sala.jugadores.map((p) => p.nombre), roles, { votosPublicos, mec: { ...mec } });
  sala.rolesPartida = [...roles].sort();
  sala.ecoEnviado = false;
  sala.res = null;
  sala.vot = null;
  nuevaFase(sala, 'reparto');
  temporizar(sala, 90000, () => entrarNoche(sala));
  cambiar(sala);
}

function volverALobby(sala) {
  limpiarTimers(sala);
  nuevaFase(sala, 'lobby');
  sala.e = null;
  sala.res = null;
  sala.vot = null;
  cambiar(sala);
}

/* ───────────────────────── Utilidades de juego ───────────────────────── */

const vivosIds = (sala) => E.vivos(sala.e).map((j) => j.id);
const todosListos = (sala, ids = vivosIds(sala)) => ids.every((i) => sala.listos.has(i));
const lobosVivos = (sala) => E.vivos(sala.e).filter(E.esLobo).map((j) => j.id);

/* ───────────────────────── REPARTO ───────────────────────── */

function entrarNoche(sala) {
  sala.e = E.iniciarNoche(sala.e);
  nuevaFase(sala, 'noche');
  sala.infoNoche = {};
  if (!lobosVivos(sala).length) sala.e = E.fijarVictima(sala.e);
  temporizar(sala, sala.config.nocheSeg * 1000, () => forzarNoche(sala));
}

/* ───────────────────────── NOCHE ───────────────────────── */

function victimaLista(sala) {
  return todosListos(sala, lobosVivos(sala));
}

function fijar(sala) {
  if (sala.e.noche.victima === undefined && victimaLista(sala)) sala.e = E.fijarVictima(sala.e);
}

function sanitizarNoche(sala, id, acc) {
  const e = sala.e;
  const j = e.jugadores[id];
  const est = j.estado;
  if (!acc || typeof acc !== 'object') return null;
  const vivo = (x) => Number.isInteger(x) && !!e.jugadores[x]?.vivo;
  const otro = (x) => vivo(x) && x !== id;
  const out = {};

  if (E.esLobo(j)) {
    if (!(e.flags.sinAtaque || e.noche.evento === 'paz') && vivo(acc.objetivo) && !E.esLobo(e.jugadores[acc.objetivo])) out.objetivo = acc.objetivo;
    if (j.rol === 'lobo_alfa' && !est.infeccionUsada && acc.infectar) out.infectar = true;
    if (j.rol === 'falsificador' && !est.falsificacionUsada && acc.falsificar && vivo(acc.falsificar.objetivo) && ROLES[acc.falsificar.rol]) {
      out.falsificar = { objetivo: acc.falsificar.objetivo, rol: acc.falsificar.rol };
    }
  } else {
    switch (j.rol) {
      case 'vidente': if (otro(acc.objetivo)) out.objetivo = acc.objetivo; break;
      case 'cartografo': if (vivo(acc.a) && vivo(acc.b) && acc.a !== acc.b) { out.a = acc.a; out.b = acc.b; } break;
      case 'protector': if (vivo(acc.objetivo) && acc.objetivo !== est.ultimoProtegido) out.objetivo = acc.objetivo; break;
      case 'bruja': {
        const v = e.noche.victima;
        out.salvar = !!(acc.salvar && est.pocionVida && v != null);
        if (acc.veneno != null && est.pocionVeneno && otro(acc.veneno)) out.veneno = acc.veneno;
        break;
      }
      case 'cupido': if (e.ronda === 1 && vivo(acc.a) && vivo(acc.b) && acc.a !== acc.b) { out.a = acc.a; out.b = acc.b; } break;
      case 'parasito': if (e.ronda === 1 && est.huesped == null && otro(acc.objetivo)) out.objetivo = acc.objetivo; break;
      case 'ladron': case 'viuda': case 'contagiado': if (otro(acc.objetivo)) out.objetivo = acc.objetivo; break;
      case 'juez': if (acc.armar && !est.juezUsado && !e.flags.juezArmado) out.armar = true; break;
      case 'hechicero': if (acc.rebobinar && !est.hechizoUsado) out.rebobinar = true; break;
      case 'piromano': {
        const vivosRoc = est.rociados.filter((x) => e.jugadores[x].vivo);
        if (acc.incendiar && !est.incendioUsado && vivosRoc.length) out.incendiar = true;
        else if (otro(acc.rociar) && !est.rociados.includes(acc.rociar)) out.rociar = acc.rociar;
        break;
      }
      case 'banquero': if (est.fichasBanquero > 0 && otro(acc.objetivo)) out.objetivo = acc.objetivo; break;
      case 'notario': if (est.notarioCartas < 3 && otro(acc.sobre) && ['pueblo', 'nopueblo'].includes(acc.veredicto)) { out.sobre = acc.sobre; out.veredicto = acc.veredicto; } break;
      default: break;
    }
  }
  const o = acc.objeto;
  if (o && est.objeto && o.tipo === est.objeto && ['daga', 'pergamino'].includes(o.tipo) && otro(o.objetivo)) out.objeto = { tipo: o.tipo, objetivo: o.objetivo };
  return Object.keys(out).length ? out : null;
}

const otroBando = (b) => aleatorio(['lobos', 'pueblo', 'solitario'].filter((x) => x !== b));

function calcularInfo(sala, id, acc) {
  const e = sala.e;
  const j = e.jugadores[id];
  const niebla = e.noche.evento === 'niebla';
  const info = [];
  if (!acc) return info;
  if (j.rol === 'vidente' && acc.objetivo != null) {
    let b = E.bandoVisible(e.jugadores[acc.objetivo]);
    if (niebla && Math.random() < 0.5) b = otroBando(b);
    info.push({ tipo: 'vidente', nombre: e.jugadores[acc.objetivo].nombre, bando: b, niebla });
  }
  if (j.rol === 'cartografo' && acc.a != null) {
    let d = E.distanciaAsientos(e, acc.a, acc.b);
    if (niebla && Math.random() < 0.5) d = Math.max(1, Math.min(Math.floor(e.jugadores.length / 2), d + (Math.random() < 0.5 ? -1 : 1)));
    info.push({ tipo: 'cartografo', a: e.jugadores[acc.a].nombre, b: e.jugadores[acc.b].nombre, dist: d, niebla });
  }
  if (j.rol === 'cupido' && acc.a != null) info.push({ tipo: 'cupido', a: e.jugadores[acc.a].nombre, b: e.jugadores[acc.b].nombre });
  if (acc.objeto?.tipo === 'pergamino') {
    const t = e.jugadores[acc.objeto.objetivo];
    info.push({ tipo: 'pergamino', nombre: t.nombre, rol: t.rol });
  }
  return info;
}

const FASES = {
  reparto: {
    listo(sala, id) {
      sala.listos.add(id);
      if (todosListos(sala)) entrarNoche(sala);
    },
    saltar(sala, id, msg, esAdmin) {
      if (!esAdmin) falla('Solo el anfitrión.', 403);
      entrarNoche(sala);
    }
  },

  noche: {
    noche(sala, id, msg) {
      const e = sala.e;
      const j = e.jugadores[id];
      if (!j.vivo) falla('Estás eliminado.');
      if (sala.listos.has(id)) falla('Ya has terminado tu turno.');
      fijar(sala);
      if (j.rol === 'bruja' && !victimaLista(sala)) falla('Espera a que los lobos elijan a su víctima.');
      const acc = sanitizarNoche(sala, id, msg.acc);
      if (acc) sala.e = E.registrarAccion(sala.e, id, acc);
      sala.infoNoche[id] = calcularInfo(sala, id, acc);
      if (j.rol === 'eco') sala.e = E.consumirEco(sala.e);
      sala.listos.add(id);
      fijar(sala);
      if (todosListos(sala)) amanecer(sala);
    },
    saltar(sala, id, msg, esAdmin) {
      if (!esAdmin) falla('Solo el anfitrión.', 403);
      forzarNoche(sala);
    }
  },

  anuncio: {
    disparar(sala, id, msg) {
      const e = sala.e;
      if (e.pendientes[0] !== id) falla('No es tu disparo.');
      const objetivo = Number.isInteger(msg.objetivo) && e.jugadores[msg.objetivo]?.vivo && msg.objetivo !== id ? msg.objetivo : null;
      if (objetivo == null && vivosIds(sala).filter((x) => x !== id).length) falla('Elige a un jugador vivo.');
      sala.e = E.disparar(e, id, objetivo);
      anuncioContinuacion(sala);
    },
    eco(sala, id, msg) {
      const e = sala.e;
      const murio = sala.origen === 'noche' && e.anuncio?.muertes.some((m) => m.id === id);
      if (!murio || sala.ecoEnviado) falla('No puedes dejar un mensaje.');
      sala.e = E.dejarMensajeEco(e, String(msg.texto ?? ''));
      sala.ecoEnviado = true;
    },
    continuar(sala, id, msg, esAdmin) {
      if (!esAdmin) falla('Solo el anfitrión.', 403);
      if (sala.e.pendientes.length) falla('Falta el disparo del Cazador.');
      continuarTrasAnuncio(sala);
    }
  },

  objeto: {
    reclamar(sala, id) {
      const e = sala.e;
      const o = sala.objetoDia;
      if (!e.jugadores[id].vivo || e.jugadores[id].estado.objeto || o.dueno != null) falla('No puedes reclamarlo.');
      sala.e = E.reclamarObjeto(e, id, o.tipo);
      o.dueno = id;
      temporizar(sala, 5000, () => irADebate(sala));
    },
    saltar(sala, id, msg, esAdmin) {
      if (!esAdmin) falla('Solo el anfitrión.', 403);
      irADebate(sala);
    }
  },

  debate: {
    listoVotar(sala, id) {
      if (!sala.e.jugadores[id].vivo) falla('Estás eliminado.');
      sala.listos.add(id);
      if (todosListos(sala)) iniciarVotacion(sala, false);
    },
    eco: (sala, id, msg) => FASES.anuncio.eco(sala, id, msg),
    saltar(sala, id, msg, esAdmin) {
      if (!esAdmin) falla('Solo el anfitrión.', 403);
      iniciarVotacion(sala, false);
    }
  },

  votacion: {
    votar(sala, id, msg) {
      const e = sala.e;
      const j = e.jugadores[id];
      const v = sala.vot;
      if (!j.vivo) falla('Estás eliminado.');
      if (v.votos[id] !== undefined) falla('Ya has votado.');
      const valido = (x) => x === null || (Number.isInteger(x) && x !== id && e.jugadores[x]?.vivo);
      if (!valido(msg.voto ?? null)) falla('Voto no válido.');
      v.votos[id] = msg.voto ?? null;
      const l = e.flags.ladron;
      if (!v.segunda && l && l.ladron === id && e.jugadores[l.objetivo].vivo) {
        const r = msg.robado ?? null;
        if (r !== null && !(Number.isInteger(r) && r !== l.objetivo && e.jugadores[r]?.vivo)) falla('Voto robado no válido.');
        v.robado = { objetivo: l.objetivo, voto: r };
      }
      sala.listos.add(id);
      if (todosListos(sala)) cerrarVotacion(sala);
    },
    eco: (sala, id, msg) => FASES.anuncio.eco(sala, id, msg),
    saltar(sala, id, msg, esAdmin) {
      if (!esAdmin) falla('Solo el anfitrión.', 403);
      cerrarVotacion(sala);
    }
  },

  resultado: {
    continuar(sala, id, msg, esAdmin) {
      if (!esAdmin) falla('Solo el anfitrión.', 403);
      aplicarResultado(sala);
    }
  },

  fin: {}
};

function forzarNoche(sala) {
  vivosIds(sala).forEach((i) => sala.listos.add(i));
  fijar(sala);
  amanecer(sala);
}

function amanecer(sala) {
  sala.e = E.resolverNoche(sala.e);
  sala.origen = 'noche';
  sala.ecoEnviado = false;
  entrarAnuncio(sala);
}

/* ───────────────────────── ANUNCIO ───────────────────────── */

function entrarAnuncio(sala) {
  nuevaFase(sala, 'anuncio');
  anuncioContinuacion(sala);
}

// Si hay un cazador pendiente, se le espera (con límite); si no, se continúa solo pasado un rato
function anuncioContinuacion(sala) {
  const e = sala.e;
  if (e.pendientes.length) {
    const c = e.pendientes[0];
    temporizar(sala, 45000, () => {
      const cand = vivosIds(sala).filter((x) => x !== c);
      sala.e = E.disparar(sala.e, c, cand.length ? aleatorio(cand) : null);
      anuncioContinuacion(sala);
    });
  } else {
    temporizar(sala, 25000, () => continuarTrasAnuncio(sala));
  }
}

function continuarTrasAnuncio(sala) {
  const e = sala.e;
  const g = E.comprobarVictoria(e);
  if (g) return finalizar(sala, g);
  if (sala.origen === 'noche') {
    const tipo = E.sortearObjeto(e);
    if (tipo) {
      nuevaFase(sala, 'objeto');
      sala.objetoDia = { tipo, dueno: null };
      temporizar(sala, 25000, () => irADebate(sala));
      return undefined;
    }
    return irADebate(sala);
  }
  sala.e = E.siguienteRonda(e);
  return entrarNoche(sala);
}

function finalizar(sala, g) {
  limpiarTimers(sala);
  sala.e = { ...sala.e, ganador: g };
  nuevaFase(sala, 'fin');
}

/* ───────────────────────── DEBATE ───────────────────────── */

function irADebate(sala) {
  sala.e = { ...sala.e, modDia: E.generarModDia(sala.e) };
  nuevaFase(sala, 'debate');
  const eclipse = sala.e.noche?.evento === 'eclipse';
  const ms = eclipse ? 10000 : sala.config.minutos > 0 ? sala.config.minutos * 60000 : null;
  sala.debate = { eclipse, fin: ms == null ? null : Date.now() + ms };
  temporizar(sala, ms, () => iniciarVotacion(sala, false));
}

/* ───────────────────────── VOTACIÓN ───────────────────────── */

function iniciarVotacion(sala, segunda, primera = null) {
  nuevaFase(sala, 'votacion');
  sala.vot = { segunda, primera, votos: {}, robado: null, avisoRepite: segunda };
  temporizar(sala, sala.config.votoSeg * 1000, () => cerrarVotacion(sala));
}

function cerrarVotacion(sala) {
  const v = sala.vot;
  const votos = { ...v.votos };
  vivosIds(sala).forEach((i) => { if (votos[i] === undefined) votos[i] = null; });
  if (v.robado) votos[v.robado.objetivo] = v.robado.voto ?? null;

  let e = E.convertirCamaleon(sala.e, votos);
  const r = E.contarVotos(e, votos, e.modDia);
  let victima = r.victima;
  let fichaDe = null;
  const f = E.aplicarFicha(e, victima);
  if (f.usada) { e = f.e; fichaDe = victima; victima = null; }

  if (!v.segunda && victima != null && E.juezActivo(e)) {
    sala.e = E.gastarJuez(e);
    return iniciarVotacion(sala, true, { victima });
  }
  let juezMuere = false;
  let identico = false;
  if (v.segunda && v.primera && victima != null && victima === v.primera.victima) { juezMuere = true; identico = true; }
  sala.e = e;
  sala.res = {
    conteo: r.conteo, max: r.max, empatados: r.empatados, modif: r.modif || null,
    votos: sala.config.votosPublicos ? votos : null,
    victima, juezMuere, identico, fichaDe, repeticion: v.segunda
  };
  nuevaFase(sala, 'resultado');
  temporizar(sala, 20000, () => aplicarResultado(sala));
  return undefined;
}

function aplicarResultado(sala) {
  const res = sala.res;
  sala.e = E.aplicarVotacion(sala.e, res.victima, { juezMuere: res.juezMuere });
  sala.origen = 'votacion';
  entrarAnuncio(sala);
}

/* ───────────────────────── VISTAS PRIVADAS ───────────────────────── */

function textoRol(r) { return ROLES[r]?.id || r; }

export function vista(sala, id) {
  const ahora = Date.now();
  const base = {
    code: sala.code, ver: sala.ver, ahora, fase: sala.fase, yo: id, esAdmin: id === 0,
    limites: { min: MIN_JUGADORES, max: MAX_JUGADORES },
    config: sala.config,
    finTs: sala.timerFin,
    jugadores: sala.jugadores.map((p, i) => ({ id: i, nombre: p.nombre, bot: p.bot, conectado: p.bot || ahora - p.visto < 40000 }))
  };

  if (sala.fase === 'lobby') {
    const roles = rolesDeConfig(sala);
    return { ...base, roles, validacion: validar(roles, sala.jugadores.length), puedeEmpezar: sala.jugadores.length >= MIN_JUGADORES };
  }

  const e = sala.e;
  const j = e.jugadores[id];
  const lobo = E.esLobo(j);
  const jugadores = base.jugadores.map((p) => {
    const q = e.jugadores[p.id];
    return { ...p, vivo: q.vivo, rolRevelado: q.vivo ? null : E.rolRevelado(e, p.id), contagiado: undefined };
  });
  const amante = e.amantes && e.amantes.includes(id) ? e.amantes.find((x) => x !== id) : null;

  const out = {
    ...base,
    jugadores,
    ronda: e.ronda,
    roles: sala.rolesPartida,
    modDia: e.modDia || null,
    mi: {
      rol: j.rol, rolInicial: j.rolInicial, vivo: j.vivo, estado: j.estado, avisos: j.avisos,
      bando: E.bandoDe(j), fichas: e.fichas[id] || 0, amante,
      juezArmado: e.flags.juezArmado,
      companeros: lobo ? e.jugadores.filter((x) => E.esLobo(x) && x.id !== id).map((x) => ({ id: x.id, nombre: x.nombre, vivo: x.vivo })) : []
    },
    victoriasPersonales: e.victoriasPersonales
  };

  switch (sala.fase) {
    case 'reparto':
      out.listo = sala.listos.has(id);
      out.faltan = vivosIds(sala).filter((i) => !sala.listos.has(i)).length;
      break;
    case 'noche': {
      fijar(sala);
      const bloqueada = j.rol === 'bruja' && !victimaLista(sala);
      const manadaVotos = {};
      if (lobo) lobosVivos(sala).forEach((i) => { const t = e.noche.acc[i]?.objetivo; if (t != null) manadaVotos[i] = t; });
      out.listo = sala.listos.has(id) || !j.vivo;
      out.faltan = vivosIds(sala).filter((i) => !sala.listos.has(i)).length;
      out.noche = {
        evento: e.noche.evento,
        info: sala.infoNoche[id] || [],
        turno: {
          bloqueada,
          victima: j.rol === 'bruja' && !bloqueada ? (e.noche.victima ?? null) : undefined,
          manadaVotos,
          sinAtaque: lobo && (e.flags.sinAtaque || e.noche.evento === 'paz'),
          eco: j.rol === 'eco' ? e.eco : null
        }
      };
      break;
    }
    case 'anuncio': case 'objeto': case 'debate': case 'votacion': case 'resultado': {
      out.origen = sala.origen;
      const an = e.anuncio;
      if (an) {
        out.anuncio = { muertes: an.muertes.map((m) => ({ id: m.id, nombre: e.jugadores[m.id].nombre, rol: m.rol, causa: m.causa })), cartas: an.cartas, rumor: an.rumor ? an.rumor.texto : null, evento: an.evento, rebobinada: an.rebobinada };
      }
      out.nocheEvento = e.noche?.evento || null;
      out.cazador = e.pendientes.length ? { id: e.pendientes[0], nombre: e.jugadores[e.pendientes[0]].nombre } : null;
      out.puedoEco = !j.vivo && sala.origen === 'noche' && !sala.ecoEnviado && !!an?.muertes.some((m) => m.id === id) && e.jugadores.some((x) => x.vivo && x.rol === 'eco');
      out.ecoEnviado = sala.ecoEnviado;
      if (sala.fase === 'objeto') {
        out.objeto = { ...sala.objetoDia, nombreDueno: sala.objetoDia.dueno != null ? e.jugadores[sala.objetoDia.dueno].nombre : null };
        out.puedoReclamar = j.vivo && !j.estado.objeto && sala.objetoDia.dueno == null;
      }
      if (sala.fase === 'debate') {
        out.debate = { ...sala.debate, listos: sala.listos.size, yoListo: sala.listos.has(id) };
        out.faltan = vivosIds(sala).filter((i) => !sala.listos.has(i)).length;
      }
      if (sala.fase === 'votacion') {
        const l = e.flags.ladron;
        out.listo = sala.listos.has(id) || !j.vivo;
        out.faltan = vivosIds(sala).filter((i) => !sala.listos.has(i)).length;
        out.votacion = { segunda: sala.vot.segunda, avisoRepite: sala.vot.avisoRepite, robadoDe: !sala.vot.segunda && l && l.ladron === id && e.jugadores[l.objetivo].vivo ? l.objetivo : null };
      }
      if (sala.fase === 'resultado') out.resultado = sala.res;
      break;
    }
    case 'fin':
      out.fin = {
        ganador: e.ganador,
        roles: e.jugadores.map((p) => ({ id: p.id, nombre: p.nombre, rolInicial: p.rolInicial, rol: p.rol, vivo: p.vivo })),
        ids: e.ganador.ids
      };
      break;
    default: break;
  }
  return out;
}

/* ───────────────────────── BOTS ───────────────────────── */

// Necesita acción este bot en la fase actual
function botPendiente(sala, id) {
  if (sala.fase === 'lobby' || !sala.e) return false;
  const e = sala.e;
  const j = e.jugadores[id];
  switch (sala.fase) {
    case 'reparto': return !sala.listos.has(id);
    case 'noche': return j.vivo && !sala.listos.has(id) && !(j.rol === 'bruja' && !victimaLista(sala));
    case 'anuncio': return e.pendientes[0] === id;
    case 'objeto': return j.vivo && !j.estado.objeto && sala.objetoDia.dueno == null;
    case 'debate': return j.vivo && !sala.listos.has(id);
    case 'votacion': return j.vivo && !sala.listos.has(id);
    default: return false;
  }
}

function programarBots(sala) {
  if (sala.fase === 'lobby' || !sala.e) return;
  sala.jugadores.forEach((p, i) => {
    if (!p.bot || sala.botTimers.has(i) || !botPendiente(sala, i)) return;
    const faseId = sala.faseId;
    const t = setTimeout(() => {
      sala.botTimers.delete(i);
      if (sala.faseId !== faseId || !botPendiente(sala, i)) { programarBots(sala); return; }
      try {
        const msg = decidirDesdeVista(vista(sala, i));
        if (msg) { sala.ultima = Date.now(); FASES[sala.fase][msg.tipo]?.(sala, i, msg, false); }
      } catch (err) {
        console.error('[lobos] error de bot:', err.message);
        sala.listos.add(i); // para no bloquear la partida
      }
      cambiar(sala);
    }, 700 + Math.random() * 2600);
    sala.botTimers.set(i, t);
  });
}

export { vivosIds as _vivosIds };
export { textoRol as _textoRol };
