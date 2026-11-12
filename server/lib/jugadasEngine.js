// server/lib/jugadasEngine.js
// Motor de Jugadas Icónicas: lógica pura compartida por el modo local y el online.

import { JUGADAS } from '../data/seeds/jugadas/jugadas.js';

export const RONDAS_POR_JUGADOR = 3;
export const TIEMPO_JUGADA_MS = 60000; // 60 s por jugada
export const TIEMPO_MIN_REBOTE_MS = 15000; // mínimo 15 s si el crono estaba casi agotado

const err = (error) => ({ ok: false, error });
const ok = () => ({ ok: true });

// ---------------------------------------------------------------- utilidades
function norm(t) {
  return String(t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function lev(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

/**
 * Comprueba si el texto introducido coincide con alguna respuesta válida de la jugada.
 * Admite erratas leves y frases que contengan las palabras clave ("gol de maradona a inglaterra").
 */
export function esRespuestaCorrecta(textoUsuario, respuestasValidas = []) {
  const x = norm(textoUsuario);
  if (!x || x.length < 3) return false;
  const palabrasUsuario = x.split(' ');

  for (const cand of respuestasValidas) {
    const y = norm(cand);
    if (!y) continue;
    if (x === y) return true;

    // Tolerancia a erratas (distancia de Levenshtein)
    const maxL = Math.max(x.length, y.length);
    const d = lev(x, y);
    if (maxL >= 5 && maxL <= 10 && d <= 1) return true;
    if (maxL > 10 && d <= 2) return true;

    // Si todas las palabras clave de la respuesta están contenidas en lo que escribió el jugador
    const palabrasCand = y.split(' ').filter((w) => w.length >= 2);
    if (
      palabrasCand.length > 0 &&
      palabrasCand.every((w) =>
        palabrasUsuario.some((u) => u === w || (w.length >= 5 && lev(u, w) <= 1))
      )
    ) {
      return true;
    }
  }
  return false;
}

function presentes(p) {
  return p.jugadores.filter((j) => !j.ausente);
}

function jugador(p, id) {
  return p.jugadores.find((j) => j.id === id);
}

function sumar(p, id, pts) {
  const j = jugador(p, id);
  if (j) j.puntos = Math.max(0, j.puntos + pts);
}

// Turnos estrictamente secuenciales según el orden de los jugadores
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

function elegirJugada(p) {
  p.usados = p.usados || [];
  let libres = JUGADAS.map((_, i) => i).filter((i) => !p.usados.includes(i));
  if (libres.length === 0) {
    p.usados = [];
    libres = JUGADAS.map((_, i) => i);
  }
  const idx = libres[Math.floor(Math.random() * libres.length)];
  p.usados.push(idx);
  return JUGADAS[idx];
}

function segundosRestantes(r, ahora) {
  if (!r.cierraEn) return 1;
  return Math.max(1, Math.ceil((r.cierraEn - ahora) / 1000));
}

// ----------------------------------------------------------------- creación
/** opciones.rondas: jugadas totales de la partida (si no, 3 por jugador). */
export function crearPartida(jugadores, opciones = {}) {
  const lista = jugadores.map((j) => ({
    id: j.id,
    nombre: j.nombre,
    puntos: 0,
    ausente: false
  }));

  const p = {
    jugadores: lista,
    estado: 'ronda', // 'ronda' | 'resultado' | 'fin'
    rondaNum: 0,
    rondasFijas: Number(opciones.rondas) > 0 ? Number(opciones.rondas) : null,
    totalRondas: Number(opciones.rondas) > 0 ? Number(opciones.rondas) : lista.length * RONDAS_POR_JUGADOR,
    usados: [],
    ronda: null
  };

  iniciarRonda(p, Date.now());
  return p;
}

export function marcarAusente(p, id) {
  const j = jugador(p, id);
  if (j) j.ausente = true;
  if (presentes(p).length < 2) {
    p.estado = 'fin';
    p.ronda = null;
  }
}

// ------------------------------------------------------------------- rondas
function iniciarRonda(p, ahora) {
  const pres = presentes(p);
  p.totalRondas = p.rondasFijas || pres.length * RONDAS_POR_JUGADOR;
  p.rondaNum += 1;
  p.estado = 'ronda';

  const jugada = elegirJugada(p);
  const activoId = turnoDe(p, p.rondaNum).id;

  p.ronda = {
    jugadaId: jugada.id,
    titulo: jugada.titulo,
    pista: jugada.pista,
    respuestas: jugada.respuestas,
    colores: jugada.colores,
    actores: jugada.actores,
    frames: jugada.frames,
    activoId,
    reboteId: siguienteDe(p, activoId),
    etapa: 'j1', // 'j1' | 'rebote' | 'revelado'
    intentoJ1: null,
    intentoRebote: null,
    cierraEn: ahora + TIEMPO_JUGADA_MS,
    totalMs: TIEMPO_JUGADA_MS,
    resultado: null
  };
}

function pasarARebote(p, ahora, motivoJ1) {
  const r = p.ronda;
  const reboteJugador = r.reboteId != null ? jugador(p, r.reboteId) : null;

  if (!reboteJugador || reboteJugador.ausente) {
    return revelarRonda(p, { ganadorId: null, puntos: 0, motivoJ1 });
  }

  r.etapa = 'rebote';
  r.motivoJ1 = motivoJ1; // 'fallo' | 'paso' | 'tiempo'
  const msRestantes = r.cierraEn ? r.cierraEn - ahora : 0;
  const nuevoTiempo = Math.max(TIEMPO_MIN_REBOTE_MS, msRestantes);
  r.cierraEn = ahora + nuevoTiempo;
  r.totalMs = TIEMPO_JUGADA_MS;
}

function revelarRonda(p, datos) {
  const r = p.ronda;
  r.cierraEn = null;
  r.etapa = 'revelado';
  r.resultado = {
    ganadorId: null,
    esRebote: false,
    puntos: 0,
    ...datos
  };
  p.estado = 'resultado';
}

// ------------------------------------------------------------------- tiempo
export function tick(p, ahora = Date.now()) {
  if (p.estado !== 'ronda' || !p.ronda || !p.ronda.cierraEn) return;
  if (ahora < p.ronda.cierraEn) return;

  if (p.ronda.etapa === 'j1') {
    pasarARebote(p, ahora, 'tiempo');
  } else if (p.ronda.etapa === 'rebote') {
    revelarRonda(p, { ganadorId: null, puntos: 0, tiempoAgotado: true });
  }
}

// ¿Se ha completado una vuelta entera de todos los jugadores activos?
function esFinDeVueltaCompleta(p) {
  const n = presentes(p).length;
  return n > 0 && p.rondaNum > 0 && p.rondaNum % n === 0;
}

// ------------------------------------------------------------------ acciones
export function aplicar(p, a, ahora = Date.now()) {
  if (!a || typeof a.tipo !== 'string') return err('Acción no válida.');
  if (p.estado === 'fin') return err('La partida ya ha terminado.');

  tick(p, ahora);

  switch (a.tipo) {
    case 'tiempo': {
      if (p.estado === 'ronda' && p.ronda?.cierraEn && ahora >= p.ronda.cierraEn - 2500) {
        if (p.ronda.etapa === 'j1') pasarARebote(p, ahora, 'tiempo');
        else if (p.ronda.etapa === 'rebote') revelarRonda(p, { ganadorId: null, puntos: 0, tiempoAgotado: true });
      }
      return ok();
    }

    case 'responder': {
      if (p.estado !== 'ronda' || !p.ronda) return err('La ronda ya ha terminado.');
      const r = p.ronda;
      const turnoActualId = r.etapa === 'j1' ? r.activoId : r.etapa === 'rebote' ? r.reboteId : null;
      if (a.jugadorId !== turnoActualId) return err('No es tu turno.');

      const texto = String(a.texto ?? '').trim().slice(0, 60);
      if (!texto) return err('Escribe una respuesta.');

      const acierta = esRespuestaCorrecta(texto, r.respuestas);
      const pts = segundosRestantes(r, ahora);

      if (r.etapa === 'j1') {
        r.intentoJ1 = texto;
        if (acierta) {
          sumar(p, r.activoId, pts);
          revelarRonda(p, { ganadorId: r.activoId, esRebote: false, puntos: pts, respuestaDada: texto });
        } else {
          pasarARebote(p, ahora, 'fallo');
        }
        return ok();
      }

      if (r.etapa === 'rebote') {
        r.intentoRebote = texto;
        if (acierta) {
          sumar(p, r.reboteId, pts);
          revelarRonda(p, { ganadorId: r.reboteId, esRebote: true, puntos: pts, respuestaDada: texto });
        } else {
          revelarRonda(p, { ganadorId: null, esRebote: true, puntos: 0 });
        }
        return ok();
      }

      return err('La ronda ya ha terminado.');
    }

    case 'pasar': {
      if (p.estado !== 'ronda' || !p.ronda) return err('La ronda ya ha terminado.');
      const r = p.ronda;
      const turnoActualId = r.etapa === 'j1' ? r.activoId : r.etapa === 'rebote' ? r.reboteId : null;
      if (a.jugadorId !== turnoActualId) return err('No es tu turno.');

      if (r.etapa === 'j1') {
        pasarARebote(p, ahora, 'paso');
        return ok();
      }
      if (r.etapa === 'rebote') {
        revelarRonda(p, { ganadorId: null, esRebote: true, puntos: 0, pasoRebote: true });
        return ok();
      }
      return err('No se puede pasar ahora.');
    }

    case 'continuar': {
      if (p.estado !== 'resultado') return err('Todavía no ha acabado la ronda.');
      if (p.rondaNum < p.totalRondas) {
        iniciarRonda(p, ahora);
      } else {
        p.estado = 'fin';
        p.ronda = null;
      }
      return ok();
    }

    case 'finalizar': {
      if (p.estado !== 'resultado' || (!p.rondasFijas && !esFinDeVueltaCompleta(p))) {
        return err('Solo se puede finalizar al terminar una vuelta completa de todos los jugadores.');
      }
      p.estado = 'fin';
      p.ronda = null;
      return ok();
    }

    default:
      return err('Acción desconocida.');
  }
}

// --------------------------------------------------------------------- vista
export function vista(p, viewerId = null, ahora = Date.now()) {
  const r = p.ronda;
  let ronda = null;

  if (r) {
    const rev = r.etapa === 'revelado';
    ronda = {
      jugadaId: r.jugadaId,
      pista: r.pista,
      colores: r.colores,
      actores: r.actores,
      frames: r.frames,
      activoId: r.activoId,
      reboteId: r.reboteId,
      etapa: r.etapa,
      motivoJ1: r.motivoJ1 || null,
      intentoJ1: r.intentoJ1,
      intentoRebote: r.intentoRebote,
      titulo: rev ? r.titulo : undefined,
      resultado: rev ? r.resultado : undefined,
      restanteMs: r.cierraEn ? Math.max(0, r.cierraEn - ahora) : null,
      totalMs: r.totalMs || TIEMPO_JUGADA_MS
    };
  }

  const pres = presentes(p);
  const vueltaActual = pres.length ? Math.ceil(p.rondaNum / pres.length) : 1;

  return {
    estado: p.estado,
    rondaNum: p.rondaNum,
    totalRondas: p.totalRondas,
    vueltaActual,
    totalVueltas: pres.length ? Math.ceil(p.totalRondas / pres.length) : RONDAS_POR_JUGADOR,
    puedeFinalizar: p.estado === 'resultado' && (p.rondasFijas || esFinDeVueltaCompleta(p)) && p.rondaNum < p.totalRondas,
    jugadores: p.jugadores.map((j) => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      ausente: j.ausente
    })),
    ronda
  };
}