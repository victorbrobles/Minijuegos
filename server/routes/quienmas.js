// server/routes/quienmas.js
import express from 'express';
import { esAdmin } from '../lib/admin.js';
import preguntasNormalRaw from '../data/seeds/quienmas/preguntas.js';
import preguntasPicanteRaw from '../data/seeds/quienmas/incomodas.js';
import { barajar } from '../lib/barajar.js';
import { limitesOnline } from '../../client/src/games/limites.js';
import { totalRondas } from '../../client/src/games/rondas.js';
const LIM = limitesOnline('quienmas');

const router = express.Router();

const preguntasNormal = Array.isArray(preguntasNormalRaw) 
  ? preguntasNormalRaw 
  : (preguntasNormalRaw.default || preguntasNormalRaw.preguntas || []);

const preguntasPicante = Array.isArray(preguntasPicanteRaw) 
  ? preguntasPicanteRaw 
  : (preguntasPicanteRaw.default || preguntasPicanteRaw.incomodas || []);

// ==========================================
// ENDPOINT EXISTENTE (INTACTO)
// ==========================================
router.get('/preguntas', (req, res) => {
  const { categoria } = req.query;

  if (categoria === 'picante') {
    if (!esAdmin(req)) {
      return res.status(403).json({ 
        error: 'Acceso denegado: se requieren permisos de administrador para la categoría picante.' 
      });
    }

    return res.json({
      categoria: 'picante',
      total: preguntasPicante.length,
      preguntas: preguntasPicante
    });
  }

  return res.json({
    categoria: 'normal',
    total: preguntasNormal.length,
    preguntas: preguntasNormal
  });
});

// ==========================================
// SALAS ONLINE EN MEMORIA (VOTACIÓN SECRETA)
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

function procesarResultado(sala) {
  const nombresJugadores = sala.jugadores.map((j) => j.nombre);
  const recuento = Object.fromEntries(nombresJugadores.map((n) => [n, 0]));

  Object.values(sala.votos).forEach((candidato) => {
    if (recuento[candidato] !== undefined) {
      recuento[candidato] += 1;
    }
  });

  const maximo = Math.max(...Object.values(recuento));
  const masVotados = nombresJugadores.filter((n) => recuento[n] === maximo);
  const empate = masVotados.length > 1;
  const ganador = empate ? null : masVotados[0];

  const ganados = Object.fromEntries(
    nombresJugadores.map((n) => [n, !empate && sala.votos[n] === ganador ? 1 : 0])
  );

  // Actualizar puntos
  sala.jugadores.forEach((j) => {
    j.puntos = (j.puntos || 0) + (ganados[j.nombre] || 0);
  });

  sala.resultado = {
    recuento,
    maximo,
    masVotados,
    empate,
    ganador,
    votos: sala.votos,
    ganados
  };
  sala.estado = 'resultado';
}

// 1. Crear sala online
router.post('/online/crear', (req, res) => {
  const nombre = (req.body?.nombre || '').trim();
  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });

  let code = generarCodigoSala();
  while (salasOnline[code]) code = generarCodigoSala();

  const tokenAdmin = generarToken();

  salasOnline[code] = {
    code,
    adminToken: tokenAdmin,
    estado: 'lobby', // 'lobby' | 'votando' | 'resultado' | 'ranking'
    categoria: 'normal',
    rondaNum: 1,
    preguntaActual: '',
    reservaPreguntas: [],
    jugadores: [{ id: 1, token: tokenAdmin, nombre, puntos: 0, conectado: true }],
    votos: {}, // { [nombreJugador]: candidatoNombre }
    resultado: null
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
  if (sala.jugadores.length >= LIM.max) return res.status(400).json({ error: `La sala está llena (máx. ${LIM.max}).` });
  if (sala.jugadores.some((j) => j.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala.' });
  }

  const token = generarToken();
  const nuevoId = sala.jugadores.length + 1;
  sala.jugadores.push({ id: nuevoId, token, nombre, puntos: 0, conectado: true });

  res.json({ success: true, code, token, jugadorId: nuevoId });
});

// 3. Cambiar categoría (administrador)
router.post('/online/sala/:code/categoria', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, categoria } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  if (categoria === 'picante' && !esAdmin(req)) {
    return res.status(403).json({ error: 'Se requieren permisos de administrador.' });
  }

  sala.categoria = categoria === 'picante' ? 'picante' : 'normal';
  res.json({ success: true, categoria: sala.categoria });
});

// 4. Iniciar partida (sólo anfitrión)
router.post('/online/sala/:code/iniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar.' });
  if (sala.jugadores.length < LIM.min) return res.status(400).json({ error: `Se necesitan al menos ${LIM.min} jugadores.` });

  const lista = sala.categoria === 'picante' ? preguntasPicante : preguntasNormal;
  const barajadas = barajar([...lista]);

  if (!barajadas.length) return res.status(400).json({ error: 'No hay preguntas disponibles.' });

  sala.jugadores.forEach((j) => { j.puntos = 0; });
  sala.rondaNum = 1;
  sala.preguntaActual = barajadas[0];
  sala.maxRondas = totalRondas('quienmas', req.body?.rondas);
  sala.reservaPreguntas = barajadas.slice(1, sala.maxRondas);
  sala.votos = {};
  sala.resultado = null;
  sala.estado = 'votando';

  res.json({ success: true });
});

// 5. Estado de la sala (protege la confidencialidad de los votos hasta el recuento)
router.get('/online/sala/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const token = req.query.token;

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o ha caducado.' });

  const jugadorActual = sala.jugadores.find((j) => j.token === token);
  if (!jugadorActual) return res.status(403).json({ error: 'No perteneces a esta sala.' });

  const esAdminSala = sala.adminToken === token;
  const yaVoto = Boolean(sala.votos[jugadorActual.nombre]);

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    categoria: sala.categoria,
    esAdmin: esAdminSala,
    yoId: jugadorActual.id,
    miNombre: jugadorActual.nombre,
    miVoto: sala.votos[jugadorActual.nombre] || null,
    yaVoto,
    totalVotaron: Object.keys(sala.votos).length,
    totalJugadores: sala.jugadores.length,
    quienesVotaron: Object.keys(sala.votos),
    rondaNum: sala.rondaNum,
    maxRondas: sala.maxRondas || totalRondas('quienmas', null),
    preguntaActual: sala.preguntaActual,
    jugadores: sala.jugadores.map((j) => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      haVotado: Boolean(sala.votos[j.nombre])
    })),
    resultado: sala.estado === 'resultado' ? sala.resultado : null
  });
});

// 6. Emitir voto secreto
router.post('/online/sala/:code/votar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, candidato } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.estado !== 'votando') return res.status(400).json({ error: 'No hay votación activa.' });

  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(403).json({ error: 'Jugador no válido.' });

  if (!sala.jugadores.some((j) => j.nombre === candidato)) {
    return res.status(400).json({ error: 'Candidato no válido.' });
  }

  sala.votos[jugador.nombre] = candidato;

  // Si todos los jugadores han votado, se procesa el resultado automáticamente
  if (Object.keys(sala.votos).length >= sala.jugadores.length) {
    procesarResultado(sala);
  }

  res.json({ success: true, votoRegistrado: candidato });
});

// 7. Forzar cierre de votación (sólo anfitrión si alguien tarda demasiado)
router.post('/online/sala/:code/cerrar-votacion', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });
  if (sala.estado !== 'votando') return res.status(400).json({ error: 'No está en fase de votación.' });

  procesarResultado(sala);
  res.json({ success: true });
});

// 8. Siguiente pregunta (sólo anfitrión)
router.post('/online/sala/:code/siguiente-pregunta', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  if (sala.reservaPreguntas.length === 0) {
    sala.estado = 'ranking';
    return res.json({ success: true, ranking: true });
  }

  sala.rondaNum += 1;
  sala.preguntaActual = sala.reservaPreguntas.shift();
  sala.votos = {};
  sala.resultado = null;
  sala.estado = 'votando';

  res.json({ success: true });
});

// 9. Ver clasificación general (sólo anfitrión)
router.post('/online/sala/:code/ver-ranking', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'ranking';
  res.json({ success: true });
});

// 10. Reiniciar para nueva partida
router.post('/online/sala/:code/reiniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'lobby';
  sala.rondaNum = 1;
  sala.preguntaActual = '';
  sala.reservaPreguntas = [];
  sala.votos = {};
  sala.resultado = null;
  sala.jugadores.forEach((j) => { j.puntos = 0; });

  res.json({ success: true });
});

// 11. Salir
router.post('/online/sala/:code/salir', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.json({ success: true });

  const idx = sala.jugadores.findIndex((j) => j.token === token);
  if (idx !== -1) {
    const saliente = sala.jugadores.splice(idx, 1)[0];
    delete sala.votos[saliente.nombre];

    if (sala.jugadores.length === 0) {
      delete salasOnline[code];
    } else {
      if (sala.adminToken === token) {
        sala.adminToken = sala.jugadores[0].token;
      }
      if (sala.estado === 'votando' && Object.keys(sala.votos).length >= sala.jugadores.length) {
        procesarResultado(sala);
      }
    }
  }

  res.json({ success: true });
});

export default router;