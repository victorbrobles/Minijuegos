// server/routes/buscaminas.js
import express from 'express';
import cine from '../data/seeds/buscaminas/cine.js';
import musica from '../data/seeds/buscaminas/musica.js';
import futbol from '../data/seeds/buscaminas/futbol.js';
import deportes from '../data/seeds/buscaminas/deportes.js';
import geografia from '../data/seeds/buscaminas/geografia.js';
import historia from '../data/seeds/buscaminas/historia.js';
import ciencia from '../data/seeds/buscaminas/ciencia.js';
import videojuegos from '../data/seeds/buscaminas/videojuegos.js';
import gastronomia from '../data/seeds/buscaminas/gastronomia.js';
import culturaPop from '../data/seeds/buscaminas/culturaPop.js';

const router = express.Router();
const MAX_RONDAS = 10;
const TOTAL_CORRECTOS = 10;
const TOTAL_MINAS = 5;

const CATEGORIAS = {
  cine: { nombre: 'Cine y Series', data: cine, icono: 'clapperboard' },
  musica: { nombre: 'Música', data: musica, icono: 'letters' },
  futbol: { nombre: 'Fútbol', data: futbol, icono: 'trophy' },
  deportes: { nombre: 'Otros Deportes', data: deportes, icono: 'speedometer' },
  geografia: { nombre: 'Geografía y Países', data: geografia, icono: 'globe' },
  historia: { nombre: 'Historia y Arte', data: historia, icono: 'detective' },
  ciencia: { nombre: 'Ciencia y Naturaleza', data: ciencia, icono: 'whois' },
  videojuegos: { nombre: 'Videojuegos', data: videojuegos, icono: 'zap' },
  gastronomia: { nombre: 'Comida y Gastronomía', data: gastronomia, icono: 'star' },
  culturaPop: { nombre: 'Famosos y Cultura Pop', data: culturaPop, icono: 'users' }
};

function barajar(array) {
  const c = [...array];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

// GET /api/buscaminas/categorias
router.get('/categorias', (req, res) => {
  const lista = Object.entries(CATEGORIAS).map(([id, info]) => ({
    id,
    nombre: info.nombre,
    icono: info.icono,
    totalTableros: info.data.length
  }));
  res.json({ success: true, categorias: lista });
});

// POST /api/buscaminas/tablero { categoria, usados }
router.post('/tablero', (req, res) => {
  try {
    const { categoria, usados = [] } = req.body || {};
    const cat = CATEGORIAS[categoria] || CATEGORIAS.cine;
    const disponibles = cat.data.filter((t) => !usados.includes(t.id));
    const pool = disponibles.length > 0 ? disponibles : cat.data;
    const elegido = barajar(pool)[0];

    const casillas = [];
    elegido.correctos.faciles.forEach((txt) => casillas.push({ texto: txt, correcto: true, dificultad: 'facil', puntos: 1 }));
    elegido.correctos.medios.forEach((txt) => casillas.push({ texto: txt, correcto: true, dificultad: 'medio', puntos: 2 }));
    elegido.correctos.dificiles.forEach((txt) => casillas.push({ texto: txt, correcto: true, dificultad: 'dificil', puntos: 3 }));
    elegido.trampas.forEach((txt) => casillas.push({ texto: txt, correcto: false, dificultad: 'trampa', puntos: 0 }));

    res.json({
      success: true,
      tableroId: elegido.id,
      consigna: elegido.consigna,
      categoriaNombre: cat.nombre,
      casillas: barajar(casillas)
    });
  } catch (error) {
    console.error('Error al generar tablero buscaminas:', error);
    res.status(500).json({ success: false, error: 'Error del servidor' });
  }
});

// ==========================================
// RUTAS MODO ONLINE
// ==========================================
const salasOnline = new Map();

function generarCodigo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let cod = '';
  for (let i = 0; i < 4; i++) cod += letras[Math.floor(Math.random() * letras.length)];
  return cod;
}

function inicializarTableroOnline(sala, categoriaId) {
  const cat = CATEGORIAS[categoriaId] || CATEGORIAS.cine;
  const disponibles = cat.data.filter((t) => !sala.usados.includes(t.id));
  const pool = disponibles.length > 0 ? disponibles : cat.data;
  const elegido = barajar(pool)[0];

  sala.usados.push(elegido.id);

  const rawCasillas = [];
  elegido.correctos.faciles.forEach((txt) => rawCasillas.push({ texto: txt, correcto: true, dificultad: 'facil', puntos: 1 }));
  elegido.correctos.medios.forEach((txt) => rawCasillas.push({ texto: txt, correcto: true, dificultad: 'medio', puntos: 2 }));
  elegido.correctos.dificiles.forEach((txt) => rawCasillas.push({ texto: txt, correcto: true, dificultad: 'dificil', puntos: 3 }));
  elegido.trampas.forEach((txt) => rawCasillas.push({ texto: txt, correcto: false, dificultad: 'trampa', puntos: 0 }));

  const casillasMezcladas = barajar(rawCasillas).map((c, idx) => ({
    id: idx,
    texto: c.texto,
    correcto: c.correcto,
    dificultad: c.dificultad,
    puntos: c.puntos,
    descubierta: false
  }));

  const ordenIds = barajar(sala.jugadores.map((j) => j.id));

  sala.ronda = {
    categoriaId,
    categoriaNombre: cat.nombre,
    consigna: elegido.consigna,
    casillas: casillasMezcladas,
    ordenTurnos: ordenIds,
    indiceTurno: 0,
    eliminadosRonda: [],
    explosionModal: null, // { jugadorNombre, casillaTexto }
    motivoFinRonda: '',
    faseRonda: 'jugando' // 'jugando' | 'ronda_fin'
  };
}

function avanzarTurnoOnline(sala) {
  const vivos = sala.ronda.ordenTurnos.filter((id) => !sala.ronda.eliminadosRonda.includes(id));
  if (vivos.length === 0) return;

  let prox = (sala.ronda.indiceTurno + 1) % sala.ronda.ordenTurnos.length;
  while (sala.ronda.eliminadosRonda.includes(sala.ronda.ordenTurnos[prox])) {
    prox = (prox + 1) % sala.ronda.ordenTurnos.length;
  }
  sala.ronda.indiceTurno = prox;
}

// POST /api/buscaminas/online/crear
router.post('/online/crear', (req, res) => {
  const { nombre } = req.body || {};
  if (!nombre?.trim()) return res.status(400).json({ error: 'Nombre requerido.' });

  let code = generarCodigo();
  while (salasOnline.has(code)) code = generarCodigo();

  const tokenAdmin = 'tok_' + Math.random().toString(36).substring(2);
  const sala = {
    code,
    estado: 'lobby', // 'lobby' | 'categoria' | 'jugando' | 'final'
    adminToken: tokenAdmin,
    rondaNum: 1,
    usados: [],
    jugadores: [{ id: 1, nombre: nombre.trim(), token: tokenAdmin, puntos: 0 }],
    ronda: null
  };

  salasOnline.set(code, sala);
  res.json({ success: true, code, token: tokenAdmin });
});

// POST /api/buscaminas/online/unirse
router.post('/online/unirse', (req, res) => {
  const { code, nombre } = req.body || {};
  const sala = salasOnline.get(code?.toUpperCase());

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya comenzó.' });
  if (sala.jugadores.length >= 8) return res.status(400).json({ error: 'Sala llena (máx 8).' });

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

// GET /api/buscaminas/online/sala/:code
router.get('/online/sala/:code', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala) return res.status(404).json({ error: 'Sala no disponible.' });

  const token = req.query.token;
  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(401).json({ error: 'Token no válido.' });

  let jugadorActivo = null;
  if (sala.ronda) {
    const actId = sala.ronda.ordenTurnos[sala.ronda.indiceTurno];
    jugadorActivo = sala.jugadores.find((j) => j.id === actId);
  }

  // Filtrado de seguridad: si no ha sido descubierta, ocultamos si es trampa/correcta
  let casillasParaCliente = [];
  if (sala.ronda) {
    casillasParaCliente = sala.ronda.casillas.map((c) => {
      if (c.descubierta || sala.ronda.faseRonda === 'ronda_fin') {
        return c;
      }
      return { id: c.id, texto: c.texto, descubierta: false };
    });
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
    ronda: sala.ronda
      ? {
          categoriaId: sala.ronda.categoriaId,
          categoriaNombre: sala.ronda.categoriaNombre,
          consigna: sala.ronda.consigna,
          casillas: casillasParaCliente,
          jugadorActivoId: jugadorActivo?.id,
          jugadorActivoNombre: jugadorActivo?.nombre,
          eliminadosRonda: sala.ronda.eliminadosRonda,
          explosionModal: sala.ronda.explosionModal,
          motivoFinRonda: sala.ronda.motivoFinRonda,
          faseRonda: sala.ronda.faseRonda
        }
      : null
  });
});

// POST /api/buscaminas/online/sala/:code/iniciar-partida
router.post('/online/sala/:code/iniciar-partida', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });
  if (sala.jugadores.length < 3) return res.status(400).json({ error: 'Mínimo 3 jugadores requeridos.' });

  sala.estado = 'categoria';
  sala.rondaNum = 1;
  sala.usados = [];

  res.json({ success: true });
});

// POST /api/buscaminas/online/sala/:code/elegir-categoria
router.post('/online/sala/:code/elegir-categoria', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  const { categoriaId } = req.body || {};
  inicializarTableroOnline(sala, categoriaId);
  sala.estado = 'jugando';

  res.json({ success: true });
});

// POST /api/buscaminas/online/sala/:code/seleccionar-casilla
router.post('/online/sala/:code/seleccionar-casilla', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda || sala.ronda.faseRonda !== 'jugando') {
    return res.status(400).json({ error: 'No se puede jugar ahora.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  const actId = sala.ronda.ordenTurnos[sala.ronda.indiceTurno];
  if (!jugador || jugador.id !== actId) {
    return res.status(403).json({ error: 'No es tu turno de pulsar.' });
  }

  const { casillaId } = req.body || {};
  const casilla = sala.ronda.casillas.find((c) => c.id === casillaId);
  if (!casilla || casilla.descubierta) {
    return res.status(400).json({ error: 'Casilla ya descubierta o no válida.' });
  }

  casilla.descubierta = true;

  const correctasDescubiertas = sala.ronda.casillas.filter((c) => c.descubierta && c.correcto).length;
  const minasExplotadas = sala.ronda.casillas.filter((c) => c.descubierta && !c.correcto).length;

  if (casilla.correcto) {
    jugador.puntos += casilla.puntos;
    if (correctasDescubiertas >= TOTAL_CORRECTOS) {
      sala.ronda.motivoFinRonda = '¡Se han descubierto los 10 aciertos del tablero!';
      sala.ronda.faseRonda = 'ronda_fin';
    } else {
      avanzarTurnoOnline(sala);
    }
  } else {
    sala.ronda.eliminadosRonda.push(jugador.id);
    sala.ronda.explosionModal = {
      jugadorNombre: jugador.nombre,
      casillaTexto: casilla.texto
    };

    if (minasExplotadas >= TOTAL_MINAS) {
      sala.ronda.motivoFinRonda = '¡Han explotado las 5 bombas del tablero!';
    } else if (sala.ronda.eliminadosRonda.length >= sala.jugadores.length) {
      sala.ronda.motivoFinRonda = '¡Todos los jugadores han caído eliminados!';
    }
  }

  res.json({ success: true });
});

// POST /api/buscaminas/online/sala/:code/cerrar-explosion
router.post('/online/sala/:code/cerrar-explosion', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || !sala.ronda) return res.status(400).json({ error: 'Ronda no activa.' });

  sala.ronda.explosionModal = null;
  if (sala.ronda.motivoFinRonda) {
    sala.ronda.faseRonda = 'ronda_fin';
  } else {
    avanzarTurnoOnline(sala);
  }

  res.json({ success: true });
});

// POST /api/buscaminas/online/sala/:code/siguiente-ronda
router.post('/online/sala/:code/siguiente-ronda', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  if (sala.rondaNum >= MAX_RONDAS) {
    sala.estado = 'final';
  } else {
    sala.rondaNum += 1;
    sala.ronda = null;
    sala.estado = 'categoria';
  }

  res.json({ success: true });
});

// POST /api/buscaminas/online/sala/:code/finalizar
router.post('/online/sala/:code/finalizar', (req, res) => {
  const sala = salasOnline.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  sala.estado = 'final';
  res.json({ success: true });
});

export default router;