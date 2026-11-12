import express from 'express';
import crypto from 'crypto';
import { limitesOnline } from '../../client/src/games/limites.js';
const LIM = limitesOnline('telepatia');

const router = express.Router();
const salas = {};

const PALABRAS_BASE = [
  'PLAYA', 'FÚTBOL', 'PIZZA', 'VERANO', 'VIAJE', 'NOCHE', 'CINE', 'MÚSICA',
  'CHOCOLATE', 'MONTAÑA', 'DINERO', 'FIESTA', 'PERRO', 'BODAS', 'UNIVERSO',
  'SUPERHÉROE', 'INVIERNO', 'CAFÉ', 'ISLA', 'CASTILLO', 'AVIÓN', 'BOSQUE',
  'MAGIA', 'HOSPITAL', 'NAVIDAD', 'LIBRO', 'PISCINA', 'ROBOT', 'TIEMPO'
];

const generarCodigo = () => Math.random().toString(36).substring(2, 6).toUpperCase();

const normalizar = (txt) => {
  return (txt || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

router.post('/crear', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Falta nombre' });

  const code = generarCodigo();
  const token = crypto.randomUUID();

  salas[code] = {
    code,
    estado: 'lobby', // 'lobby' | 'escribiendo' | 'resultado' | 'fin'
    rondaNum: 1,
    palabraActual: '',
    palabraSiguiente: '',
    segundosRestantes: 5,
    timer: null,
    logRonda: '',
    gruposCoincidentes: [],
    jugadores: [{ id: 1, nombre: nombre.trim(), token, puntos: 0, racha: 0, palabra: '', esAdmin: true }]
  };

  res.json({ success: true, code, token });
});

router.post('/unirse', (req, res) => {
  const { nombre, joinCode } = req.body;
  const sala = salas[joinCode];
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'Partida ya empezada' });
  if (sala.jugadores.length >= LIM.max) return res.status(400).json({ error: `La sala está llena (máx. ${LIM.max}).` });

  const token = crypto.randomUUID();
  const newId = sala.jugadores.length > 0 ? Math.max(...sala.jugadores.map(j => j.id)) + 1 : 1;
  sala.jugadores.push({ id: newId, nombre: nombre.trim(), token, puntos: 0, racha: 0, palabra: '', esAdmin: false });

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
    rondaNum: sala.rondaNum,
    palabraActual: sala.palabraActual,
    segundosRestantes: sala.segundosRestantes,
    logRonda: sala.logRonda,
    gruposCoincidentes: sala.gruposCoincidentes,
    esAdmin: yo.esAdmin,
    jugadores: sala.jugadores.map(j => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      racha: j.racha,
      esTu: j.id === yo.id,
      esAdmin: j.esAdmin
    }))
  });
});

const iniciarCuentaAtras = (sala) => {
  if (sala.timer) clearInterval(sala.timer);
  sala.segundosRestantes = 5;

  sala.timer = setInterval(() => {
    sala.segundosRestantes -= 1;
    if (sala.segundosRestantes <= 0) {
      clearInterval(sala.timer);
      evaluarRonda(sala);
    }
  }, 1000);
};

const evaluarRonda = (sala) => {
  if (sala.timer) clearInterval(sala.timer);

  // Agrupamos palabras normalizadas
  const grupos = {};
  sala.jugadores.forEach(j => {
    const raw = (j.palabra || '').trim().toUpperCase();
    const clave = normalizar(raw);
    if (!clave) return;

    if (!grupos[clave]) {
      grupos[clave] = { palabra: raw, jugadores: [] };
    }
    grupos[clave].jugadores.push(j);
  });

  const coincidentes = Object.values(grupos).filter(g => g.jugadores.length >= 2);

  // Ordenar de mayor a menor coincidencia
  coincidentes.sort((a, b) => b.jugadores.length - a.jugadores.length);

  const idsQueCoincidieron = new Set();
  let nuevaPalabra = '';

  if (coincidentes.length > 0) {
    // La palabra del grupo con más coincidencias se convierte en la siguiente palabra
    nuevaPalabra = coincidentes[0].palabra;

    coincidentes.forEach(g => {
      g.jugadores.forEach(j => {
        idsQueCoincidieron.add(j.id);
        const nuevaRacha = j.racha + 1;
        j.racha = nuevaRacha;
        j.puntos += nuevaRacha; // 1 punto si racha=1, 2 puntos si racha=2, etc.
      });
    });

    sala.logRonda = `¡Coincidencia con «${nuevaPalabra}»! Los jugadores conectados sumaron puntos por racha.`;
  } else {
    // Si nadie coincide, se toma una palabra al azar de todas las enviadas
    const todasLasDichas = sala.jugadores.map(j => (j.palabra || '').trim().toUpperCase()).filter(Boolean);
    if (todasLasDichas.length > 0) {
      nuevaPalabra = todasLasDichas[Math.floor(Math.random() * todasLasDichas.length)];
    } else {
      nuevaPalabra = PALABRAS_BASE[Math.floor(Math.random() * PALABRAS_BASE.length)];
    }
    sala.logRonda = `Nadie coincidió en esta ronda. Para la siguiente ronda se ha elegido «${nuevaPalabra}».`;
  }

  // Quienes no coincidieron pierden la racha
  sala.jugadores.forEach(j => {
    if (!idsQueCoincidieron.has(j.id)) {
      j.racha = 0;
    }
  });

  sala.palabraSiguiente = nuevaPalabra;

  // Preparar desglose público para la pantalla de resultados
  sala.gruposCoincidentes = Object.values(grupos).map(g => ({
    palabra: g.palabra,
    coincide: g.jugadores.length >= 2,
    puntosSumados: g.jugadores.length >= 2 ? g.jugadores[0].racha : 0,
    jugadores: g.jugadores.map(j => j.nombre)
  }));

  sala.estado = 'resultado';
};

router.post('/sala/:code/iniciar', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  if (!sala || !sala.jugadores.find(j => j.token === token)?.esAdmin) return res.status(403).json({ error: 'No autorizado' });
  if (sala.jugadores.length < LIM.min) return res.status(400).json({ error: `Se necesitan al menos ${LIM.min} jugadores.` });

  sala.jugadores.forEach(j => { j.puntos = 0; j.racha = 0; j.palabra = ''; });
  sala.rondaNum = 1;
  sala.palabraActual = PALABRAS_BASE[Math.floor(Math.random() * PALABRAS_BASE.length)];
  sala.estado = 'escribiendo';

  iniciarCuentaAtras(sala);
  res.json({ success: true });
});

router.post('/sala/:code/enviar-palabra', (req, res) => {
  const { code, token, palabra } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.estado !== 'escribiendo') return res.status(400).json({ error: 'No es momento de enviar' });

  yo.palabra = palabra;

  // Si todos los jugadores ya enviaron palabra, no hace falta esperar los 5s completos
  if (sala.jugadores.every(j => Boolean((j.palabra || '').trim()))) {
    evaluarRonda(sala);
  }

  res.json({ success: true });
});

router.post('/sala/:code/siguiente', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'No autorizado' });

  if (sala.rondaNum >= 15) {
    sala.estado = 'fin';
    return res.json({ success: true });
  }

  sala.rondaNum += 1;
  sala.palabraActual = sala.palabraSiguiente;
  sala.jugadores.forEach(j => { j.palabra = ''; });
  sala.estado = 'escribiendo';

  iniciarCuentaAtras(sala);
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