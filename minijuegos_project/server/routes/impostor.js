// server/routes/impostor.js
import express from 'express';
import parte1 from '../data/seeds/impostor/parte1.js';
import parte2 from '../data/seeds/impostor/parte2.js';
import parte3 from '../data/seeds/impostor/parte3.js';

const router = express.Router();
const TODAS_LAS_PALABRAS = [...parte1, ...parte2, ...parte3];

// ==========================================
// ENDPOINT OFFLINE / LOCAL (INTACTO)
// ==========================================
router.get('/palabra', (req, res) => {
  try {
    const elegido = TODAS_LAS_PALABRAS[Math.floor(Math.random() * TODAS_LAS_PALABRAS.length)];
    res.json({
      success: true,
      id: elegido.id,
      palabra: elegido.palabra,
      restriccion: elegido.restriccion
    });
  } catch (error) {
    console.error('Error al obtener palabra de Impostor:', error);
    res.status(500).json({ success: false, error: 'Error del servidor' });
  }
});

// ==========================================
// SALAS ONLINE (MULTIDISPOSITIVO CON ROLES)
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

function prepararPartidaOnline(sala) {
  const elegido = TODAS_LAS_PALABRAS[Math.floor(Math.random() * TODAS_LAS_PALABRAS.length)];
  const impElegido = sala.jugadores[Math.floor(Math.random() * sala.jugadores.length)];
  const inicialElegido = sala.jugadores[Math.floor(Math.random() * sala.jugadores.length)];

  sala.palabraSecreta = elegido.palabra;
  sala.restriccion = elegido.restriccion;
  sala.impostorId = impElegido.id;
  sala.jugadorInicialId = inicialElegido.id;
  sala.puntosRonda = {};
  sala.ganador = null;
  sala.rondasSobrevividas = 1;
  sala.estado = 'en_juego';
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
    estado: 'lobby', // 'lobby' | 'en_juego' | 'resolucion' | 'resultados' | 'final'
    rondaActual: 1,
    palabraSecreta: '',
    restriccion: '',
    impostorId: null,
    jugadorInicialId: null,
    ganador: null,
    rondasSobrevividas: 1,
    puntosRonda: {},
    jugadores: [{ id: 1, token: tokenAdmin, nombre, puntos: 0, conectado: true }]
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
  if (sala.jugadores.length >= 20) return res.status(400).json({ error: 'La sala está completa.' });
  if (sala.jugadores.some((j) => j.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala.' });
  }

  const token = generarToken();
  const nuevoId = sala.jugadores.length + 1;
  sala.jugadores.push({ id: nuevoId, token, nombre, puntos: 0, conectado: true });

  res.json({ success: true, code, token, jugadorId: nuevoId });
});

// 3. Iniciar partida (sólo anfitrión)
router.post('/online/sala/:code/iniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar.' });
  if (sala.jugadores.length < 3) return res.status(400).json({ error: 'Se necesitan al menos 3 jugadores.' });

  sala.jugadores.forEach((j) => { j.puntos = 0; });
  sala.rondaActual = 1;
  prepararPartidaOnline(sala);

  res.json({ success: true });
});

// 4. Estado sincronizado (reparto confidencial de palabra según el rol)
router.get('/online/sala/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const token = req.query.token;

  const sala = salasOnline[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o ha caducado.' });

  const jugadorActual = sala.jugadores.find((j) => j.token === token);
  if (!jugadorActual) return res.status(403).json({ error: 'No perteneces a esta sala.' });

  const esAdmin = sala.adminToken === token;
  const esImpostor = sala.impostorId === jugadorActual.id;
  const partidaTerminada = sala.estado === 'resultados' || sala.estado === 'final';

  // Si la partida está activa, el impostor recibe null en la palabra; el pueblo la ve completa
  const miPalabra = partidaTerminada
    ? sala.palabraSecreta
    : (esImpostor ? null : sala.palabraSecreta);

  const inicialJugador = sala.jugadores.find((j) => j.id === sala.jugadorInicialId);
  const impostorJugador = sala.jugadores.find((j) => j.id === sala.impostorId);

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    rondaActual: sala.rondaActual,
    esAdmin,
    yoId: jugadorActual.id,
    esImpostor,
    miPalabra,
    restriccion: sala.restriccion,
    nombreInicial: inicialJugador ? inicialJugador.nombre : null,
    nombreImpostor: partidaTerminada && impostorJugador ? impostorJugador.nombre : null,
    ganador: sala.ganador,
    rondasSobrevividas: sala.rondasSobrevividas,
    puntosRonda: sala.puntosRonda,
    jugadores: sala.jugadores.map((j) => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos
    }))
  });
});

// 5. Pasar a pantalla de resolución (sólo anfitrión)
router.post('/online/sala/:code/ir-resolucion', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'resolucion';
  res.json({ success: true });
});

// 6. Resolver partida y calcular puntos (+10 impostor, +3 por ronda, +3 pueblo)
router.post('/online/sala/:code/resolver', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, ganador, rondasSobrevividas } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  const g = ganador === 'pueblo' ? 'pueblo' : 'impostor';
  const rondas = parseInt(rondasSobrevividas, 10) || 0;

  const scores = {};
  sala.jugadores.forEach((j) => { scores[j.id] = 0; });

  const ptsImpostor = (g === 'impostor' ? 10 : 0) + (rondas * 3);
  scores[sala.impostorId] = ptsImpostor;

  if (g === 'pueblo') {
    sala.jugadores.forEach((j) => {
      if (j.id !== sala.impostorId) {
        scores[j.id] = 3;
      }
    });
  }

  sala.ganador = g;
  sala.rondasSobrevividas = rondas;
  sala.puntosRonda = scores;

  sala.jugadores.forEach((j) => {
    j.puntos = (j.puntos || 0) + (scores[j.id] || 0);
  });

  sala.estado = 'resultados';
  res.json({ success: true, scores });
});

// 7. Siguiente partida
router.post('/online/sala/:code/siguiente-partida', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.rondaActual += 1;
  prepararPartidaOnline(sala);
  res.json({ success: true });
});

// 8. Finalizar juego y ver podio
router.post('/online/sala/:code/finalizar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'final';
  res.json({ success: true });
});

// 9. Reiniciar partida
router.post('/online/sala/:code/reiniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salasOnline[code];
  if (!sala || sala.adminToken !== token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'lobby';
  sala.rondaActual = 1;
  sala.puntosRonda = {};
  sala.jugadores.forEach((j) => { j.puntos = 0; });

  res.json({ success: true });
});

// 10. Salir
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