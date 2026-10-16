// server/routes/trayectoria.js
import express from 'express';
import { randomUUID } from 'node:crypto';
import { RETOS_TRAYECTORIAS } from '../data/seeds/trayectoria/trayectorias.seed.js';
import { normalizar } from '../lib/normalizar.js';
import { barajar } from '../lib/barajar.js';

const router = express.Router();

const MAX_RONDAS = 15;
const MIN_JUGADORES = 2;
const MAX_JUGADORES = 15;
const MIN_ENTRE_CLUBES_MS = 4000;
const CADUCIDAD_MS = 3 * 60 * 60 * 1000;
const MAX_PARTIDAS = 500;

// ==========================================
// PARTIDAS OFFLINE / LOCAL (INTACTO)
// ==========================================
const partidas = new Map();

function limpiarPartidas() {
  const ahora = Date.now();
  for (const [id, p] of partidas) {
    if (ahora - p.ultima > CADUCIDAD_MS) partidas.delete(id);
  }
  while (partidas.size >= MAX_PARTIDAS) {
    partidas.delete(partidas.keys().next().value);
  }
}

function cargar(body) {
  const { partidaId, retoId } = body ?? {};
  if (typeof partidaId !== 'string' || !Number.isInteger(retoId)) {
    return { status: 400, error: 'Petición no válida.' };
  }
  const partida = partidas.get(partidaId);
  if (!partida || Date.now() - partida.ultima > CADUCIDAD_MS) {
    partidas.delete(partidaId);
    return { status: 404, error: 'La partida ha caducado. Empieza una nueva.' };
  }
  const estado = partida.rondas.get(retoId);
  if (!estado) return { status: 404, error: 'Reto no encontrado.' };
  partida.ultima = Date.now();
  return { partida, estado, reto: estado.reto };
}

router.post('/partida', (req, res) => {
  const { jugadores, dificultad } = req.body ?? {};
  if (!Number.isInteger(jugadores) || jugadores < MIN_JUGADORES || jugadores > MAX_JUGADORES) {
    return res.status(400).json({ error: 'Número de jugadores no válido.' });
  }

  let lista = RETOS_TRAYECTORIAS;
  if (dificultad !== undefined) {
    if (!['baja', 'media', 'alta'].includes(dificultad)) {
      return res.status(400).json({ error: 'Dificultad no válida.' });
    }
    lista = lista.filter((r) => r.dificultad === dificultad);
  }
  const elegidos = barajar(lista).slice(0, MAX_RONDAS);
  if (!elegidos.length) return res.status(404).json({ error: 'No hay retos disponibles.' });

  limpiarPartidas();
  const partidaId = randomUUID();
  partidas.set(partidaId, {
    jugadores,
    ultima: Date.now(),
    rondas: new Map(
      elegidos.map((reto) => [
        reto.id,
        { reto, reveladas: 0, ultimaRevelacion: 0, fallidos: new Set(), cerrada: false }
      ])
    )
  });

  res.json({
    partidaId,
    retos: elegidos.map(({ id, dificultad, nacionalidad, clubes, pista }) => ({
      id,
      dificultad,
      nacionalidad,
      totalClubes: clubes.length,
      hayPista: dificultad === 'alta' && Boolean(pista)
    }))
  });
});

router.post('/club', (req, res) => {
  const r = cargar(req.body);
  if (r.error) return res.status(r.status).json({ error: r.error });
  const { estado, reto } = r;

  const { indice } = req.body;
  if (!Number.isInteger(indice) || indice < 0 || indice >= reto.clubes.length) {
    return res.status(400).json({ error: 'Club no válido.' });
  }
  if (indice > estado.reveladas) {
    return res.status(400).json({ error: 'Los clubes se revelan en orden.' });
  }
  if (indice === estado.reveladas) {
    if (indice > 0 && Date.now() - estado.ultimaRevelacion < MIN_ENTRE_CLUBES_MS) {
      return res.status(429).json({ error: 'Aún no toca el siguiente club.' });
    }
    estado.reveladas += 1;
    estado.ultimaRevelacion = Date.now();
  }
  res.json({ club: reto.clubes[indice] });
});

router.post('/pista', (req, res) => {
  const r = cargar(req.body);
  if (r.error) return res.status(r.status).json({ error: r.error });
  const { estado, reto } = r;

  if (reto.dificultad !== 'alta' || !reto.pista) {
    return res.status(404).json({ error: 'Este reto no tiene pista.' });
  }
  if (estado.reveladas < reto.clubes.length) {
    return res.status(403).json({ error: 'La pista se desbloquea al ver el último club.' });
  }
  res.json({ pista: reto.pista });
});

router.post('/validar', (req, res) => {
  const r = cargar(req.body);
  if (r.error) return res.status(r.status).json({ error: r.error });
  const { partida, estado, reto } = r;

  const { jugadorId, respuesta } = req.body;
  if (
    !Number.isInteger(jugadorId) || jugadorId < 1 || jugadorId > partida.jugadores ||
    typeof respuesta !== 'string' || !respuesta.trim() || respuesta.length > 100
  ) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }
  if (estado.fallidos.has(jugadorId)) {
    return res.status(403).json({ error: 'Ya has fallado en esta ronda.' });
  }

  const limpia = normalizar(respuesta.trim());
  const esCorrecto =
    reto.alias.some((alias) => normalizar(alias) === limpia) || normalizar(reto.nombre) === limpia;

  if (esCorrecto) {
    estado.cerrada = true;
  } else {
    estado.fallidos.add(jugadorId);
  }
  res.json({ correcto: esCorrecto, nombreReal: esCorrecto ? reto.nombre : undefined });
});

router.post('/solucion', (req, res) => {
  const r = cargar(req.body);
  if (r.error) return res.status(r.status).json({ error: r.error });
  const { partida, estado, reto } = r;

  const todosFallaron = estado.fallidos.size >= partida.jugadores;
  if (estado.reveladas < reto.clubes.length && !todosFallaron) {
    return res.status(403).json({ error: 'Aún no puedes ver la solución.' });
  }
  estado.cerrada = true;
  res.json({ nombre: reto.nombre });
});

// ==========================================
// SALAS ONLINE (MULTIDISPOSITIVO CON PULSADOR)
// ==========================================
const salasOnline = {};

function generarCodigoSala() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 4; i++) {
    c += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return c;
}

function generarToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function iniciarNuevaRondaOnline(sala) {
  const reto = sala.retos[sala.retoActualIdx];
  sala.ronda = {
    retoId: reto.id,
    dificultad: reto.dificultad,
    nacionalidad: reto.nacionalidad,
    totalClubes: reto.clubes.length,
    hayPista: reto.dificultad === 'alta' && Boolean(reto.pista),
    pistaTexto: null,
    pistaRevelada: false,
    clubesRevelados: [reto.clubes[0]],
    indiceClub: 0,
    ultimaRevelacionTs: Date.now(),
    estaPausado: false,
    segundosRestantes: 5,
    bloqueados: [],
    pulsado: null, // { jugadorId, nombre, texto }
    estadoRonda: 'activa', // 'activa' | 'resuelta'
    solucion: null,
    mensaje: null
  };
}

// 1. Crear sala online
router.post('/online/crear', (req, res) => {
  const nombre = (req.body?.nombre || '').trim();
  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });

  let code = generarCodigoSala();
  while (salasOnline[code]) code = generarCodigoSala();

  const tokenAdmin = generarToken();
  const elegidos = barajar(RETOS_TRAYECTORIAS).slice(0, MAX_RONDAS);

  salasOnline[code] = {
    code,
    adminToken: tokenAdmin,
    estado: 'lobby', // 'lobby' | 'jugando' | 'podio'
    retos: elegidos,
    retoActualIdx: 0,
    jugadores: [{ id: 1, token: tokenAdmin, nombre, puntos: 0, conectado: true }],
    ronda: null
  };

  res.json({ success: true, code, token: tokenAdmin, jugadorId: 1 });
});

// 2. Unirse a sala online
router.post('/online/unirse', (req, res) => {
  const code = (req.body?.code || '').trim().toUpperCase();
  const nombre = (req.body?.nombre || '').trim();

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o el código es incorrecto.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= MAX_JUGADORES) return res.status(400).json({ error: 'La sala está llena.' });
  if (sala.jugadores.some((j) => j.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala.' });
  }

  const token = generarToken();
  const nuevoId = sala.jugadores.length + 1;
  sala.jugadores.push({ id: nuevoId, token, nombre, puntos: 0, conectado: true });

  res.json({ success: true, code, token, jugadorId: nuevoId });
});

// 3. Estado de la sala (sincroniza tiempo y revela clubes cada 5s si no está pausada)
router.get('/online/sala/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const token = req.query.token;

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o ha caducado.' });

  const jugadorActual = sala.jugadores.find((j) => j.token === token);
  if (!jugadorActual) return res.status(403).json({ error: 'No perteneces a esta sala.' });

  const esAdmin = sala.adminToken === token;

  // Lógica de avance automático del reloj y clubes durante la ronda activa
  if (sala.estado === 'jugando' && sala.ronda && sala.ronda.estadoRonda === 'activa' && !sala.ronda.estaPausado && !sala.ronda.pulsado) {
    const reto = sala.retos[sala.retoActualIdx];
    const ahora = Date.now();
    const transcurrido = ahora - sala.ronda.ultimaRevelacionTs;

    if (sala.ronda.clubesRevelados.length < reto.clubes.length) {
      if (transcurrido >= 5000) {
        const sigIdx = sala.ronda.clubesRevelados.length;
        sala.ronda.clubesRevelados.push(reto.clubes[sigIdx]);
        sala.ronda.indiceClub = sigIdx;
        sala.ronda.ultimaRevelacionTs = ahora;
        sala.ronda.segundosRestantes = 5;
      } else {
        sala.ronda.segundosRestantes = Math.max(0, 5 - transcurrido / 1000);
      }
    } else {
      sala.ronda.segundosRestantes = 0;
    }
  }

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin,
    yoId: jugadorActual.id,
    retoActualIdx: sala.retoActualIdx,
    totalRetos: sala.retos.length,
    jugadores: sala.jugadores.map((j) => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      bloqueado: sala.ronda ? sala.ronda.bloqueados.includes(j.id) : false
    })),
    ronda: sala.ronda
  });
});

// 4. Iniciar partida desde el lobby
router.post('/online/sala/:code/iniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar.' });

  sala.estado = 'jugando';
  sala.retoActualIdx = 0;
  sala.jugadores.forEach((j) => { j.puntos = 0; });
  iniciarNuevaRondaOnline(sala);

  res.json({ success: true });
});

// 5. Pulsador rojo online: detiene el tiempo y asigna el turno a quien pulsó
router.post('/online/sala/:code/pulsar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.ronda) return res.status(404).json({ error: 'Partida no activa.' });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(403).json({ error: 'Jugador no válido.' });

  if (sala.ronda.estadoRonda !== 'activa') return res.status(400).json({ error: 'La ronda ya terminó.' });
  if (sala.ronda.pulsado !== null) return res.status(409).json({ error: 'Otro jugador ya ha pulsado el botón.' });
  if (sala.ronda.bloqueados.includes(jugador.id)) return res.status(403).json({ error: 'Estás bloqueado por fallar en esta ronda.' });

  sala.ronda.pulsado = {
    jugadorId: jugador.id,
    nombre: jugador.nombre,
    texto: ''
  };
  sala.ronda.estaPausado = true;
  sala.ronda.mensaje = {
    tipo: 'info',
    texto: `¡${jugador.nombre} ha pulsado el botón! Está respondiendo...`
  };

  res.json({ success: true });
});

// 6. Tecleo en tiempo real: sincroniza lo que escribe quien pulsó
router.post('/online/sala/:code/teclear', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, texto } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.ronda || !sala.ronda.pulsado) return res.json({ success: true });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador || sala.ronda.pulsado.jugadorId !== jugador.id) return res.json({ success: true });

  sala.ronda.pulsado.texto = String(texto || '').slice(0, 80);
  res.json({ success: true });
});

// 7. Enviar y validar respuesta online
router.post('/online/sala/:code/responder', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, respuesta } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || !sala.ronda || !sala.ronda.pulsado) return res.status(400).json({ error: 'No hay respuesta pendiente.' });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador || sala.ronda.pulsado.jugadorId !== jugador.id) return res.status(403).json({ error: 'No es tu turno de responder.' });

  const reto = sala.retos[sala.retoActualIdx];
  const limpia = normalizar(String(respuesta || '').trim());
  const esCorrecto = reto.alias.some((a) => normalizar(a) === limpia) || normalizar(reto.nombre) === limpia;

  if (esCorrecto) {
    let puntosGanados = 2;
    let motivo = "sin usar la pista (+2 pts)";

    if (sala.ronda.pistaRevelada) {
      puntosGanados = 1;
      motivo = "con pista revelada (+1 pt)";
    } else if (sala.ronda.clubesRevelados.length < reto.clubes.length) {
      puntosGanados = 4;
      motivo = "¡antes de ver el último club! (+4 pts)";
    }

    jugador.puntos += puntosGanados;
    sala.ronda.estadoRonda = 'resuelta';
    sala.ronda.solucion = reto.nombre;
    sala.ronda.mensaje = {
      tipo: 'success',
      texto: `¡Correcto! ${jugador.nombre} acertó: era ${reto.nombre} ${motivo}`
    };
    sala.ronda.pulsado = null;
  } else {
    jugador.puntos -= 1;
    sala.ronda.bloqueados.push(jugador.id);
    sala.ronda.pulsado = null;

    if (sala.ronda.bloqueados.length >= sala.jugadores.length) {
      sala.ronda.estadoRonda = 'resuelta';
      sala.ronda.solucion = reto.nombre;
      sala.ronda.mensaje = {
        tipo: 'error',
        texto: `Todos los jugadores han fallado. El futbolista era: ${reto.nombre}`
      };
    } else {
      sala.ronda.estaPausado = false;
      sala.ronda.ultimaRevelacionTs = Date.now();
      sala.ronda.mensaje = {
        tipo: 'error',
        texto: `¡${jugador.nombre} ha fallado! (-1 pt). Queda fuera de esta ronda.`
      };
    }
  }

  res.json({ success: true, correcto: esCorrecto });
});

// 8. Revelar pista online
router.post('/online/sala/:code/pista', (req, res) => {
  const code = req.params.code.toUpperCase();
  const sala = salasOnline[code];
  if (!sala || !sala.ronda) return res.status(404).json({ error: 'Ronda no activa.' });

  const reto = sala.retos[sala.retoActualIdx];
  if (reto.dificultad !== 'alta' || !reto.pista) return res.status(400).json({ error: 'No hay pista.' });

  sala.ronda.pistaRevelada = true;
  sala.ronda.pistaTexto = reto.pista;
  res.json({ success: true, pista: reto.pista });
});

// 9. Rendirse online
router.post('/online/sala/:code/rendirse', (req, res) => {
  const code = req.params.code.toUpperCase();
  const sala = salasOnline[code];
  if (!sala || !sala.ronda) return res.status(404).json({ error: 'Ronda no activa.' });

  const reto = sala.retos[sala.retoActualIdx];
  sala.ronda.estadoRonda = 'resuelta';
  sala.ronda.solucion = reto.nombre;
  sala.ronda.mensaje = {
    tipo: 'error',
    texto: `Fin de la ronda. El futbolista era: ${reto.nombre}`
  };
  sala.ronda.pulsado = null;

  res.json({ success: true });
});

// 10. Siguiente ronda online
router.post('/online/sala/:code/siguiente-ronda', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede avanzar.' });

  if (sala.retoActualIdx + 1 < sala.retos.length) {
    sala.retoActualIdx += 1;
    iniciarNuevaRondaOnline(sala);
  } else {
    sala.estado = 'podio';
  }

  res.json({ success: true });
});

// 11. Finalizar / reiniciar partida
router.post('/online/sala/:code/reiniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede reiniciar.' });

  sala.estado = 'lobby';
  sala.retoActualIdx = 0;
  sala.ronda = null;
  sala.jugadores.forEach((j) => { j.puntos = 0; });

  res.json({ success: true });
});

// 12. Salir
router.post('/online/sala/:code/salir', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.json({ success: true });

  const idx = sala.jugadores.findIndex((j) => j.token === token);
  if (idx !== -1) {
    sala.jugadores.splice(idx, 1);
    if (sala.jugadores.length === 0) {
      delete salasOnline[code];
    } else if (sala.adminToken === token) {
      sala.adminToken = sala.jugadores[0].token;
    }
  }

  res.json({ success: true });
});

export default router;