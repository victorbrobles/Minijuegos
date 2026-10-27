// server/routes/jugadores.js
import express from 'express';
import duplas from '../data/seeds/jugadores/jugadores.js';

const router = express.Router();
const TIEMPO_S = 120; // 120s
const MAX_RONDAS = 20;

function barajarArray(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// MODO LOCAL
router.post('/reto-local', (req, res) => {
  const { usados = [] } = req.body || {};
  let libres = duplas.filter((d) => !usados.includes(d.id));
  if (libres.length === 0) libres = duplas;
  const elegida = libres[Math.floor(Math.random() * libres.length)];

  res.json({
    success: true,
    reto: elegida
  });
});

// MODO ONLINE
const salasJugadores = new Map();

function generarCodigo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let cod = '';
  for (let i = 0; i < 4; i++) cod += letras[Math.floor(Math.random() * letras.length)];
  return cod;
}

router.post('/online/crear', (req, res) => {
  const { nombre } = req.body || {};
  if (!nombre?.trim()) return res.status(400).json({ error: 'Nombre requerido.' });

  let code = generarCodigo();
  while (salasJugadores.has(code)) code = generarCodigo();

  const tokenAdmin = 'tok_' + Math.random().toString(36).substring(2);
  const sala = {
    code,
    estado: 'lobby', // 'lobby' | 'jugando' | 'resumen' | 'final'
    adminToken: tokenAdmin,
    rondaNum: 1,
    usados: [],
    jugadores: [{ id: 1, nombre: nombre.trim(), token: tokenAdmin, puntos: 0 }],
    ronda: null
  };

  salasJugadores.set(code, sala);
  res.json({ success: true, code, token: tokenAdmin });
});

router.post('/online/unirse', (req, res) => {
  const { code, nombre } = req.body || {};
  const sala = salasJugadores.get(code?.toUpperCase());

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= 15) return res.status(400).json({ error: 'Sala llena (máx 15).' });

  const token = 'tok_' + Math.random().toString(36).substring(2);
  const nuevoId = sala.jugadores.length + 1;

  sala.jugadores.push({
    id: nuevoId,
    nombre: nombre?.trim() || `Jugador ${nuevoId}`,
    token,
    puntos: 0
  });

  res.json({ success: true, code: sala.code, token });
});

router.get('/online/sala/:code', (req, res) => {
  const sala = salasJugadores.get(req.params.code?.toUpperCase());
  if (!sala) return res.status(404).json({ error: 'Sala no disponible.' });

  const token = req.query.token;
  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(401).json({ error: 'Token no válido.' });

  let infoRonda = null;
  const ahora = Date.now();

  if (sala.ronda) {
    let segsRestantes = 0;
    if (sala.estado === 'jugando') {
      segsRestantes = Math.max(0, Math.ceil((sala.ronda.finTurno - ahora) / 1000));
    }
    infoRonda = {
      reto: sala.ronda.reto,
      segsRestantes,
      ultimo: sala.ronda.ultimo
    };
  }

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin: sala.adminToken === token,
    yoId: jugador.id,
    rondaNum: sala.rondaNum,
    maxRondas: MAX_RONDAS,
    jugadores: sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos })),
    ronda: infoRonda
  });
});

router.post('/online/sala/:code/iniciar', (req, res) => {
  const sala = salasJugadores.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });
  if (sala.jugadores.length < 2) return res.status(400).json({ error: 'Mínimo 2 jugadores para iniciar.' });

  sala.estado = 'jugando';
  sala.rondaNum = 1;
  sala.usados = [];

  const elegida = barajarArray(duplas)[0];
  sala.usados.push(elegida.id);

  sala.ronda = {
    reto: elegida,
    finTurno: Date.now() + TIEMPO_S * 1000,
    ultimo: null
  };

  res.json({ success: true });
});

router.post('/online/sala/:code/asignar', (req, res) => {
  const sala = salasJugadores.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) {
    return res.status(403).json({ error: 'Solo el anfitrión tiene el rol de juez.' });
  }

  const { playerId, tipo } = req.body || {}; // tipo = 'acierto' | 'fallo' | 'rendirse'

  if (tipo === 'rendirse') {
    sala.ronda.ultimo = { tipo: 'rendido' };
    sala.estado = 'resumen';
    return res.json({ success: true });
  }

  const targetPlayer = sala.jugadores.find(j => j.id === parseInt(playerId, 10));
  if (!targetPlayer) return res.status(400).json({ error: 'Jugador no encontrado.' });

  const puntosCambiados = tipo === 'acierto' ? 3 : -1;
  targetPlayer.puntos += puntosCambiados;

  sala.ronda.ultimo = {
    tipo,
    jugador: targetPlayer.nombre,
    puntos: puntosCambiados
  };
  
  // Como asume un acierto o un fallo terminal, terminamos la ronda
  sala.estado = 'resumen';

  res.json({ success: true });
});

router.post('/online/sala/:code/siguiente-ronda', (req, res) => {
  const sala = salasJugadores.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  if (sala.rondaNum >= MAX_RONDAS) {
    sala.estado = 'final';
  } else {
    sala.rondaNum += 1;
    let libres = duplas.filter((d) => !sala.usados.includes(d.id));
    if (libres.length === 0) {
      sala.usados = [];
      libres = duplas;
    }
    const elegida = libres[Math.floor(Math.random() * libres.length)];
    sala.usados.push(elegida.id);

    sala.ronda = {
      reto: elegida,
      finTurno: Date.now() + TIEMPO_S * 1000,
      ultimo: null
    };
    sala.estado = 'jugando';
  }

  res.json({ success: true });
});

router.post('/online/sala/:code/finalizar', (req, res) => {
  const sala = salasJugadores.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'final';
  res.json({ success: true });
});

export default router;