import express from 'express';
import crypto from 'crypto';
import { getTresCategorias } from '../data/seeds/descarte/descarte.js';

const router = express.Router();
const salas = {};

const LETRAS_CONFIG = [
  { l: 'A', pts: 1 }, { l: 'B', pts: 1 }, { l: 'C', pts: 1 }, { l: 'D', pts: 1 }, { l: 'E', pts: 1 },
  { l: 'F', pts: 2 }, { l: 'G', pts: 2 }, { l: 'H', pts: 2 }, { l: 'I', pts: 2 }, { l: 'J', pts: 3 },
  { l: 'K', pts: 3 }, { l: 'L', pts: 1 }, { l: 'M', pts: 1 }, { l: 'N', pts: 2 }, { l: 'Ñ', pts: 3 },
  { l: 'O', pts: 2 }, { l: 'P', pts: 1 }, { l: 'Q', pts: 3 }, { l: 'R', pts: 1 }, { l: 'S', pts: 1 },
  { l: 'T', pts: 1 }, { l: 'U', pts: 2 }, { l: 'V', pts: 2 }, { l: 'W', pts: 3 }, { l: 'X', pts: 3 },
  { l: 'Y', pts: 3 }, { l: 'Z', pts: 3 }
];

const ABECEDARIO = LETRAS_CONFIG.map(x => x.l);
const MAX_TABLEROS = 5;

const generarCodigo = () => Math.random().toString(36).substring(2, 6).toUpperCase();

router.post('/crear', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Falta nombre' });

  const code = generarCodigo();
  const token = crypto.randomUUID();

  salas[code] = {
    code,
    estado: 'lobby', // 'lobby' | 'eligiendo_rival' | 'eligiendo_cat' | 'respondiendo' | 'cambio_tablero' | 'fin'
    tableroActual: 1,
    jugadorRetadorId: null,
    jugadorActivoId: null,
    jugadosEnCiclo: [],
    letrasDisponibles: [...ABECEDARIO],
    tresCategorias: [],
    categoriaActiva: '',
    segundosRestantes: 30,
    fallosConsecutivos: 0,
    logTurno: '',
    timer: null,
    jugadores: [{ id: 1, nombre: nombre.trim(), token, puntos: 0, esAdmin: true }]
  };

  res.json({ success: true, code, token });
});

router.post('/unirse', (req, res) => {
  const { nombre, joinCode } = req.body;
  const sala = salas[joinCode];
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'Partida ya empezada' });
  if (sala.jugadores.length >= 12) return res.status(400).json({ error: 'Sala llena (máximo 12)' });

  const token = crypto.randomUUID();
  const newId = sala.jugadores.length > 0 ? Math.max(...sala.jugadores.map(j => j.id)) + 1 : 1;
  sala.jugadores.push({ id: newId, nombre: nombre.trim(), token, puntos: 0, esAdmin: false });

  res.json({ success: true, code: joinCode, token });
});

router.get('/sala/:code', (req, res) => {
  const { code } = req.params;
  const { token } = req.query;
  const sala = salas[code];
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });

  const yo = sala.jugadores.find(j => j.token === token);
  if (!yo) return res.status(403).json({ error: 'No autorizado' });

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    tableroActual: sala.tableroActual,
    jugadorRetadorId: sala.jugadorRetadorId,
    jugadorActivoId: sala.jugadorActivoId,
    jugadosEnCiclo: sala.jugadosEnCiclo,
    letrasDisponibles: sala.letrasDisponibles,
    tresCategorias: sala.tresCategorias,
    categoriaActiva: sala.categoriaActiva,
    segundosRestantes: sala.segundosRestantes,
    logTurno: sala.logTurno,
    esAdmin: yo.esAdmin,
    jugadores: sala.jugadores.map(j => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      esTu: j.id === yo.id,
      esAdmin: j.esAdmin
    }))
  });
});

const iniciarTimer30s = (sala) => {
  if (sala.timer) clearInterval(sala.timer);
  sala.segundosRestantes = 30;

  sala.timer = setInterval(() => {
    sala.segundosRestantes -= 1;
    if (sala.segundosRestantes <= 0) {
      clearInterval(sala.timer);
      procesarResolucion(sala, false, null, '¡Tiempo agotado!');
    }
  }, 1000);
};

const prepararSiguienteRetador = (sala) => {
  sala.jugadorRetadorId = sala.jugadorActivoId;

  if (sala.jugadosEnCiclo.length >= sala.jugadores.length) {
    sala.jugadosEnCiclo = [sala.jugadorActivoId];
  }

  sala.estado = 'eligiendo_rival';
};

const procesarResolucion = (sala, acierto, letra = null, motivo = '') => {
  if (sala.timer) clearInterval(sala.timer);

  const jActual = sala.jugadores.find(j => j.id === sala.jugadorActivoId);

  if (acierto && letra) {
    sala.letrasDisponibles = sala.letrasDisponibles.filter(l => l !== letra);
    const conf = LETRAS_CONFIG.find(x => x.l === letra);
    const pts = conf ? conf.pts : 1;
    jActual.puntos += pts;
    sala.fallosConsecutivos = 0;
    sala.logTurno = `✅ ¡Correcto! ${jActual.nombre} dijo una palabra por la "${letra}" (+${pts} pts).`;
  } else {
    sala.fallosConsecutivos += 1;
    sala.logTurno = `❌ ${jActual.nombre} falló el turno (${motivo || 'palabra incorrecta'}).`;
  }

  // Comprobar cambio de tablero
  const rondaCompletaFallada = sala.fallosConsecutivos >= sala.jugadores.length;
  const sinLetras = sala.letrasDisponibles.length === 0;

  if (sinLetras || rondaCompletaFallada) {
    if (sala.tableroActual >= MAX_TABLEROS) {
      sala.estado = 'fin';
    } else {
      sala.estado = 'cambio_tablero';
    }
  } else {
    prepararSiguienteRetador(sala);
  }
};

router.post('/sala/:code/iniciar', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  if (!sala || !sala.jugadores.find(j => j.token === token)?.esAdmin) return res.status(403).json({ error: 'No autorizado' });
  if (sala.jugadores.length < 3) return res.status(400).json({ error: 'Mínimo 3 jugadores' });

  sala.jugadores.forEach(j => { j.puntos = 0; });
  sala.tableroActual = 1;
  sala.letrasDisponibles = [...ABECEDARIO];
  sala.fallosConsecutivos = 0;

  // Primer jugador elegido al azar
  const primerId = sala.jugadores[Math.floor(Math.random() * sala.jugadores.length)].id;
  sala.jugadorActivoId = primerId;
  sala.jugadorRetadorId = null;
  sala.jugadosEnCiclo = [primerId];
  sala.tresCategorias = getTresCategorias();
  sala.estado = 'eligiendo_cat';

  res.json({ success: true });
});

router.post('/sala/:code/elegir-rival', (req, res) => {
  const { code, token, idRival } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.jugadorRetadorId !== yo.id || sala.estado !== 'eligiendo_rival') return res.status(400).json({ error: 'No autorizado' });

  sala.jugadorActivoId = idRival;
  sala.jugadosEnCiclo.push(idRival);
  sala.tresCategorias = getTresCategorias();
  sala.estado = 'eligiendo_cat';

  res.json({ success: true });
});

router.post('/sala/:code/elegir-cat', (req, res) => {
  const { code, token, categoria } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);

  // La categoría la elige el retador (o el jugador inicial si retador es null)
  const idQuienElige = sala.jugadorRetadorId || sala.jugadorActivoId;
  if (!yo || yo.id !== idQuienElige || sala.estado !== 'eligiendo_cat') return res.status(400).json({ error: 'No autorizado' });

  sala.categoriaActiva = categoria;
  sala.estado = 'respondiendo';
  iniciarTimer30s(sala);

  res.json({ success: true });
});

router.post('/sala/:code/verificar', (req, res) => {
  const { code, token, acierto, letra } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin || sala.estado !== 'respondiendo') return res.status(403).json({ error: 'Solo el anfitrión puede verificar' });

  procesarResolucion(sala, acierto, letra);
  res.json({ success: true });
});

router.post('/sala/:code/siguiente-tablero', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'No autorizado' });

  sala.tableroActual += 1;
  sala.letrasDisponibles = [...ABECEDARIO];
  sala.fallosConsecutivos = 0;
  prepararSiguienteRetador(sala);

  res.json({ success: true });
});

router.post('/sala/:code/terminar-ya', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'No autorizado' });

  if (sala.timer) clearInterval(sala.timer);
  sala.estado = 'fin';
  res.json({ success: true });
});

router.post('/sala/:code/salir', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  if (sala) {
    sala.jugadores = sala.jugadores.filter(j => j.token !== token);
    if (sala.jugadores.length === 0) {
      if (sala.timer) clearInterval(sala.timer);
      delete salas[code];
    }
  }
  res.json({ success: true });
});

export default router;