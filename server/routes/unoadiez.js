import express from 'express';
import crypto from 'crypto';
import { CATEGORIAS_1_AL_10, getRandomCategoria } from '../data/seeds/unoadiez/unoadiez.js';

const router = express.Router();
const salas = {};

const generarCodigo = () => Math.random().toString(36).substring(2, 6).toUpperCase();

router.get('/categorias', (req, res) => {
  res.json({ success: true, categorias: CATEGORIAS_1_AL_10 });
});

router.post('/crear', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Falta nombre' });

  const code = generarCodigo();
  const token = crypto.randomUUID();

  salas[code] = {
    code,
    estado: 'lobby', // 'lobby' | 'jugando' | 'resolucion' | 'fin'
    adivinadorId: null,
    pistadorId: null,
    adivinadoresPendientes: [],
    numeroSecreto: null,
    categoriaActual: '',
    intentosRonda: 1,
    segundosRestantes: 60,
    ultimoGuess: null,
    puntosSumados: 0,
    intervaloTimer: null,
    jugadores: [{ id: 1, nombre: nombre.trim(), token, puntos: 0, esAdmin: true }]
  };

  res.json({ success: true, code, token });
});

router.post('/unirse', (req, res) => {
  const { nombre, joinCode } = req.body;
  const sala = salas[joinCode];
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'Partida ya empezada' });
  if (sala.jugadores.length >= 10) return res.status(400).json({ error: 'Sala llena (máximo 10)' });

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

  const esElAdivinador = sala.adivinadorId === yo.id;

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin: yo.esAdmin,
    yoId: yo.id,
    adivinadorId: sala.adivinadorId,
    pistadorId: sala.pistadorId,
    // El número secreto solo se le oculta al adivinador durante el juego activo
    numeroSecreto: (sala.estado === 'jugando' && esElAdivinador) ? null : sala.numeroSecreto,
    categoriaActual: sala.categoriaActual,
    intentosRonda: sala.intentosRonda,
    segundosRestantes: sala.segundosRestantes,
    ultimoGuess: sala.ultimoGuess,
    puntosSumados: sala.puntosSumados,
    jugadores: sala.jugadores.map(j => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      esTu: j.id === yo.id,
      esAdivinador: j.id === sala.adivinadorId,
      esPistador: j.id === sala.pistadorId
    }))
  });
});

const arrancarTimer = (sala) => {
  if (sala.intervaloTimer) clearInterval(sala.intervaloTimer);
  sala.segundosRestantes = 60;

  sala.intervaloTimer = setInterval(() => {
    sala.segundosRestantes -= 1;
    if (sala.segundosRestantes <= 0) {
      clearInterval(sala.intervaloTimer);
      // Al agotarse el tiempo cuenta como pasar automáticamente
      pasarTurnoPista(sala);
    }
  }, 1000);
};

const elegirNuevoPistador = (sala) => {
  const otros = sala.jugadores.filter(j => j.id !== sala.adivinadorId);
  if (otros.length === 0) return sala.adivinadorId;
  const elegibles = otros.filter(j => j.id !== sala.pistadorId);
  const candidatos = elegibles.length > 0 ? elegibles : otros;
  return candidatos[Math.floor(Math.random() * candidatos.length)].id;
};

const iniciarTurnoAdivinador = (sala) => {
  if (sala.adivinadoresPendientes.length === 0) {
    if (sala.intervaloTimer) clearInterval(sala.intervaloTimer);
    sala.estado = 'fin';
    return;
  }

  sala.adivinadorId = sala.adivinadoresPendientes.shift();
  sala.pistadorId = elegirNuevoPistador(sala);
  sala.numeroSecreto = Math.floor(Math.random() * 10) + 1; // 1 al 10
  sala.categoriaActual = getRandomCategoria();
  sala.intentosRonda = 1;
  sala.ultimoGuess = null;
  sala.puntosSumados = 0;
  sala.estado = 'jugando';

  arrancarTimer(sala);
};

const pasarTurnoPista = (sala) => {
  sala.intentosRonda += 1;
  sala.pistadorId = elegirNuevoPistador(sala);
  sala.categoriaActual = getRandomCategoria();
  arrancarTimer(sala);
};

router.post('/sala/:code/iniciar', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  if (!sala || !sala.jugadores.find(j => j.token === token)?.esAdmin) return res.status(403).json({ error: 'No autorizado' });
  if (sala.jugadores.length < 2) return res.status(400).json({ error: 'Mínimo 2 jugadores' });

  sala.jugadores.forEach(j => { j.puntos = 0; });
  // Se barajan todos los jugadores para que cada uno sea adivinador una vez
  sala.adivinadoresPendientes = [...sala.jugadores.map(j => j.id)].sort(() => Math.random() - 0.5);

  iniciarTurnoAdivinador(sala);
  res.json({ success: true });
});

router.post('/sala/:code/pasar', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.adivinadorId !== yo.id || sala.estado !== 'jugando') return res.status(400).json({ error: 'No puedes pasar ahora' });

  pasarTurnoPista(sala);
  res.json({ success: true });
});

router.post('/sala/:code/adivinar', (req, res) => {
  const { code, token, numero } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.adivinadorId !== yo.id || sala.estado !== 'jugando') return res.status(400).json({ error: 'No autorizado' });

  const num = parseInt(numero, 10);
  if (isNaN(num) || num < 1 || num > 10) return res.status(400).json({ error: 'Número inválido' });

  if (sala.intervaloTimer) clearInterval(sala.intervaloTimer);

  const diff = Math.abs(num - sala.numeroSecreto);
  let pts = 0;

  if (diff === 0) {
    pts = sala.intentosRonda;
  } else if (diff === 1) {
    pts = sala.intentosRonda + 1;
  } else {
    pts = sala.intentosRonda + 10;
  }

  yo.puntos += pts;
  sala.puntosSumados = pts;
  sala.ultimoGuess = num;
  sala.estado = 'resolucion';

  res.json({ success: true });
});

router.post('/sala/:code/siguiente', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'No autorizado' });

  iniciarTurnoAdivinador(sala);
  res.json({ success: true });
});

router.post('/sala/:code/salir', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  if (sala) {
    sala.jugadores = sala.jugadores.filter(j => j.token !== token);
    if (sala.jugadores.length === 0) {
      if (sala.intervaloTimer) clearInterval(sala.intervaloTimer);
      delete salas[code];
    }
  }
  res.json({ success: true });
});

export default router;