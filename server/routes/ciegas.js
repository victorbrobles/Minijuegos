// server/routes/ciegas.js
import express from 'express';
import comida from '../data/seeds/ciegas/comida.js';
import deporte from '../data/seeds/ciegas/deporte.js';
import deportistas from '../data/seeds/ciegas/deportistas.js';
import famosos from '../data/seeds/ciegas/famosos.js';
import culturapop from '../data/seeds/ciegas/culturapop.js';
import geografia from '../data/seeds/ciegas/geografia.js';
import { limitesOnline } from '../../client/src/games/limites.js';
const LIM = limitesOnline('ciegas');

const router = express.Router();

const CATEGORIAS = {
  comida,
  deporte,
  deportistas,
  famosos,
  culturapop,
  geografia
};

function barajar(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// -------------------------------------------------------------
// ENDPOINTS MODO OFFLINE / LOCAL
// -------------------------------------------------------------

// POST /api/ciegas/iniciar-local
router.post('/iniciar-local', (req, res) => {
  const { categoria, usados = [] } = req.body || {};
  const lista = CATEGORIAS[categoria];

  if (!lista || lista.length === 0) {
    return res.status(400).json({ error: 'Categoría no válida o vacía.' });
  }

  const disponibles = lista.filter((r) => !usados.includes(r.id));
  const pool = disponibles.length > 0 ? disponibles : lista;
  const seleccionado = barajar(pool)[0];

  // Barajamos aleatoriamente el orden en que irán saliendo
  const itemsBarajados = barajar(seleccionado.items);

  res.json({
    success: true,
    rankingId: seleccionado.id,
    tema: seleccionado.tema,
    itemsSecuencia: itemsBarajados,
    itemsOriginales: seleccionado.items
  });
});

// -------------------------------------------------------------
// ENDPOINTS MODO ONLINE
// -------------------------------------------------------------
const salasCiegas = new Map();

function generarCodigo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let cod = '';
  for (let i = 0; i < 4; i++) cod += letras[Math.floor(Math.random() * letras.length)];
  return cod;
}

// POST /api/ciegas/online/crear
router.post('/online/crear', (req, res) => {
  const { nombre } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'Nombre requerido.' });

  let code = generarCodigo();
  while (salasCiegas.has(code)) code = generarCodigo();

  const tokenAdmin = 'tok_' + Math.random().toString(36).substring(2);
  const sala = {
    code,
    estado: 'lobby', // lobby, armando_ranking, votando, resultados, final
    adminToken: tokenAdmin,
    categoria: 'comida',
    jugadores: [
      { id: 1, nombre: nombre.trim(), token: tokenAdmin, puntos: 0 }
    ],
    jugadorActivoId: null,
    ronda: null,
    usados: []
  };

  salasCiegas.set(code, sala);
  res.json({ success: true, code, token: tokenAdmin });
});

// POST /api/ciegas/online/unirse
router.post('/online/unirse', (req, res) => {
  const { code, nombre } = req.body;
  const sala = salasCiegas.get(code?.toUpperCase());

  if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya comenzó.' });
  if (sala.jugadores.length >= LIM.max) return res.status(400).json({ error: `La sala está llena (máx. ${LIM.max}).` });

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

// GET /api/ciegas/online/sala/:code
router.get('/online/sala/:code', (req, res) => {
  const sala = salasCiegas.get(req.params.code?.toUpperCase());
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada.' });

  const token = req.query.token;
  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) return res.status(401).json({ error: 'Token no válido.' });

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin: sala.adminToken === token,
    yoId: jugador.id,
    categoria: sala.categoria,
    jugadorActivoId: sala.jugadorActivoId,
    jugadores: sala.jugadores.map((j) => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos
    })),
    ronda: sala.ronda
  });
});

// POST /api/ciegas/online/sala/:code/configurar
router.post('/online/sala/:code/configurar', (req, res) => {
  const sala = salasCiegas.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  const { categoria } = req.body;
  if (CATEGORIAS[categoria]) {
    sala.categoria = categoria;
  }
  res.json({ success: true, categoria: sala.categoria });
});

// POST /api/ciegas/online/sala/:code/iniciar-ronda
router.post('/online/sala/:code/iniciar-ronda', (req, res) => {
  const sala = salasCiegas.get(req.params.code?.toUpperCase());
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });

  if (sala.jugadores.length < LIM.min) {
    return res.status(400).json({ error: `Se necesitan al menos ${LIM.min} jugadores.` });
  }

  // Elegir jugador activo al azar
  const elegido = sala.jugadores[Math.floor(Math.random() * sala.jugadores.length)];
  sala.jugadorActivoId = elegido.id;

  const lista = CATEGORIAS[sala.categoria] || CATEGORIAS.comida;
  const disponibles = lista.filter((r) => !sala.usados.includes(r.id));
  const pool = disponibles.length > 0 ? disponibles : lista;
  const seleccionado = barajar(pool)[0];
  sala.usados.push(seleccionado.id);

  // Barajamos los 5 elementos para que salgan en orden 100% aleatorio
  const secuenciaBarajada = barajar(seleccionado.items);

  sala.ronda = {
    id: seleccionado.id,
    tema: seleccionado.tema,
    itemsOriginales: seleccionado.items,
    itemsSecuencia: secuenciaBarajada, // Array de strings barajados
    indiceSecuencia: 0,
    topArmado: [null, null, null, null, null],
    votos: {},
    aciertosReales: 0
  };

  sala.estado = 'armando_ranking';
  res.json({ success: true });
});

// POST /api/ciegas/online/sala/:code/colocar-posicion
router.post('/online/sala/:code/colocar-posicion', (req, res) => {
  const sala = salasCiegas.get(req.params.code?.toUpperCase());
  if (!sala || sala.estado !== 'armando_ranking') {
    return res.status(400).json({ error: 'No se puede colocar en este momento.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  if (!jugador || jugador.id !== sala.jugadorActivoId) {
    return res.status(403).json({ error: 'Solo el jugador activo puede armar el top.' });
  }

  const { posicion } = req.body; // 1, 2, 3, 4 o 5
  const idx = posicion - 1;

  if (idx < 0 || idx > 4 || sala.ronda.topArmado[idx] !== null) {
    return res.status(400).json({ error: 'Posición inválida o ya ocupada.' });
  }

  const itemActual = sala.ronda.itemsSecuencia[sala.ronda.indiceSecuencia];
  sala.ronda.topArmado[idx] = itemActual;
  sala.ronda.indiceSecuencia += 1;

  // Si ya colocó los 5 elementos, pasa a fase de votación
  if (sala.ronda.indiceSecuencia >= 5) {
    let aciertos = 0;
    sala.ronda.topArmado.forEach((nombre, posIdx) => {
      // Comparación directa de strings con el array original
      if (sala.ronda.itemsOriginales[posIdx] === nombre) {
        aciertos += 1;
      }
    });
    sala.ronda.aciertosReales = aciertos;
    sala.estado = 'votando';
  }

  res.json({ success: true, topArmado: sala.ronda.topArmado });
});

// POST /api/ciegas/online/sala/:code/votar
router.post('/online/sala/:code/votar', (req, res) => {
  const sala = salasCiegas.get(req.params.code?.toUpperCase());
  if (!sala || sala.estado !== 'votando') {
    return res.status(400).json({ error: 'No es fase de votación.' });
  }

  const jugador = sala.jugadores.find((j) => j.token === req.body?.token);
  if (!jugador) return res.status(401).json({ error: 'No autenticado.' });
  if (jugador.id === sala.jugadorActivoId) {
    return res.status(400).json({ error: 'El jugador activo no vota su propio top.' });
  }

  const { prediccion } = req.body;
  sala.ronda.votos[jugador.id] = parseInt(prediccion, 10);

  // Comprobar si ya votaron todos los demás jugadores
  const votantesNecesarios = sala.jugadores.length - 1;
  const votosEmitidos = Object.keys(sala.ronda.votos).length;

  if (votosEmitidos >= votantesNecesarios) {
    const totalPuntos = Object.values(sala.ronda.votos).reduce(
      (acc, val) => acc + (Number(val) || 0),
      0
    );

    const activo = sala.jugadores.find((j) => j.id === sala.jugadorActivoId);
    if (activo) {
      activo.puntos += totalPuntos;
    }

    sala.ronda.totalPuntosGanados = totalPuntos;
    sala.estado = 'resultados';
  }

  res.json({ success: true });
});

export default router;