// server/routes/jugadas.js
// Montar en el servidor con:  app.use('/api/jugadas', jugadasRouter);
import express from 'express';
import crypto from 'node:crypto';
import { crearPartida, aplicar, vista, tick, marcarAusente } from '../lib/jugadasEngine.js';
import { limitesOnline, limitesLocal } from '../../client/src/games/limites.js';
const LIM = limitesOnline('jugadas');
const LIM_LOCAL = limitesLocal('jugadas');

const router = express.Router();

const MIN_JUGADORES = LIM.min;
const MAX_JUGADORES = LIM.max;
const ACCIONES_ANFITRION = new Set(['continuar', 'finalizar']);
const INACTIVIDAD_MAX_MS = 6 * 60 * 60 * 1000;

function limpiarNombre(n, max = 25) {
  return String(n ?? '').trim().slice(0, max);
}

// =====================================================================
// MODO LOCAL (un solo dispositivo)
// =====================================================================
router.post('/local/nueva', (req, res) => {
  const nombres = Array.isArray(req.body?.nombres) ? req.body.nombres : [];
  if (nombres.length < LIM_LOCAL.min || nombres.length > LIM_LOCAL.max) {
    return res.status(400).json({
      ok: false,
      error: `Debe haber entre ${LIM_LOCAL.min} y ${LIM_LOCAL.max} jugadores.`
    });
  }
  const jugadores = nombres.map((n, i) => ({
    id: i + 1,
    nombre: limpiarNombre(n) || `Jugador ${i + 1}`
  }));
  const partida = crearPartida(jugadores);
  res.json({ ok: true, partida, vista: vista(partida, null) });
});

router.post('/local/accion', (req, res) => {
  const { partida, accion } = req.body || {};
  if (!partida || typeof partida !== 'object' || !Array.isArray(partida.jugadores)) {
    return res.status(400).json({ ok: false, error: 'Partida no válida.' });
  }
  try {
    const resultado = aplicar(partida, accion);
    res.json({
      ok: resultado.ok,
      error: resultado.error,
      partida,
      vista: vista(partida, null)
    });
  } catch {
    res.status(400).json({ ok: false, error: 'No se ha podido procesar la acción.' });
  }
});

// =====================================================================
// MODO ONLINE (salas)
// =====================================================================
const salas = new Map();

function generarCodigo() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let c = '';
  for (let i = 0; i < 4; i++) c += letras[crypto.randomInt(letras.length)];
  return c;
}

function nuevoToken() {
  return crypto.randomBytes(16).toString('hex');
}

function purgarSalasViejas() {
  const ahora = Date.now();
  for (const [code, s] of salas) {
    if (ahora - s.ultimaActividad > INACTIVIDAD_MAX_MS) salas.delete(code);
  }
}

function obtenerSala(req) {
  const sala = salas.get(String(req.params.code || '').toUpperCase());
  if (sala) sala.ultimaActividad = Date.now();
  return sala;
}

function jugadorPorToken(sala, token) {
  const j = sala.jugadores.find((x) => x.token === token);
  if (j) j.visto = Date.now();
  return j;
}

router.post('/online/crear', (req, res) => {
  const nombre = limpiarNombre(req.body?.nombre, 20);
  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });

  purgarSalasViejas();
  let code = generarCodigo();
  while (salas.has(code)) code = generarCodigo();

  const token = nuevoToken();
  salas.set(code, {
    code,
    adminToken: token,
    estado: 'lobby', // 'lobby' | 'jugando'
    jugadores: [{ id: 1, nombre, token, visto: Date.now() }],
    siguienteId: 2,
    partida: null,
    ultimaActividad: Date.now()
  });

  res.json({ success: true, code, token, jugadorId: 1 });
});

router.post('/online/unirse', (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  const nombre = limpiarNombre(req.body?.nombre, 20);
  const sala = salas.get(code);

  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });
  if (!sala) return res.status(404).json({ error: 'La sala no existe o el código es incorrecto.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= MAX_JUGADORES) {
    return res.status(400).json({ error: `La sala está llena (máx. ${MAX_JUGADORES}).` });
  }
  if (sala.jugadores.some((j) => j.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala.' });
  }

  const token = nuevoToken();
  const id = sala.siguienteId++;
  sala.jugadores.push({ id, nombre, token, visto: Date.now() });
  sala.ultimaActividad = Date.now();
  res.json({ success: true, code: sala.code, token, jugadorId: id });
});

router.get('/online/sala/:code', (req, res) => {
  const sala = obtenerSala(req);
  if (!sala) return res.status(404).json({ error: 'La sala no existe o ha caducado.' });

  const yo = jugadorPorToken(sala, req.query.token);
  if (!yo) return res.status(403).json({ error: 'No perteneces a esta sala.' });

  let v = null;
  if (sala.partida) {
    tick(sala.partida);
    v = vista(sala.partida, yo.id);
  }

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin: sala.adminToken === req.query.token,
    yoId: yo.id,
    anfitrionId: sala.jugadores.find((j) => j.token === sala.adminToken)?.id ?? null,
    min: MIN_JUGADORES,
    max: MAX_JUGADORES,
    jugadores: sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, conectado: Date.now() - (j.visto || 0) < 15000 })),
    vista: v
  });
});

router.post('/online/sala/:code/iniciar', (req, res) => {
  const sala = obtenerSala(req);
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar.' });
  if (sala.estado === 'jugando') return res.status(400).json({ error: 'La partida ya está en marcha.' });
  if (sala.jugadores.length < MIN_JUGADORES) {
    return res.status(400).json({ error: `Se necesitan al menos ${MIN_JUGADORES} jugadores.` });
  }

  sala.partida = crearPartida(sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre })));
  sala.estado = 'jugando';
  res.json({ success: true });
});

router.post('/online/sala/:code/accion', (req, res) => {
  const sala = obtenerSala(req);
  if (!sala || !sala.partida) return res.status(404).json({ error: 'Partida no activa.' });

  const yo = jugadorPorToken(sala, req.body?.token);
  if (!yo) return res.status(403).json({ error: 'Jugador no válido.' });

  const accion = req.body?.accion;
  if (!accion || typeof accion.tipo !== 'string') return res.status(400).json({ error: 'Acción no válida.' });
  if (ACCIONES_ANFITRION.has(accion.tipo) && sala.adminToken !== req.body.token) {
    return res.status(403).json({ error: 'Solo el anfitrión puede hacer esto.' });
  }

  const resultado = aplicar(sala.partida, { ...accion, jugadorId: yo.id });
  if (!resultado.ok) return res.status(400).json({ error: resultado.error });
  res.json({ success: true });
});

router.post('/online/sala/:code/expulsar', (req, res) => {
  const sala = obtenerSala(req);
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'Solo el anfitrión.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'Solo se puede quitar a alguien en la sala de espera.' });
  const id = Number(req.body?.id);
  const idx = sala.jugadores.findIndex((j) => j.id === id && j.token !== sala.adminToken);
  if (idx === -1) return res.status(404).json({ error: 'Ese jugador ya no está en la sala.' });
  sala.jugadores.splice(idx, 1);
  res.json({ success: true });
});

router.post('/online/sala/:code/reiniciar', (req, res) => {
  const sala = obtenerSala(req);
  if (!sala || sala.adminToken !== req.body?.token) return res.status(403).json({ error: 'No autorizado.' });
  sala.estado = 'lobby';
  sala.partida = null;
  res.json({ success: true });
});

router.post('/online/sala/:code/salir', (req, res) => {
  const sala = obtenerSala(req);
  if (!sala) return res.json({ success: true });

  const idx = sala.jugadores.findIndex((j) => j.token === req.body?.token);
  if (idx === -1) return res.json({ success: true });

  const [saliente] = sala.jugadores.splice(idx, 1);
  if (sala.partida) marcarAusente(sala.partida, saliente.id);

  if (sala.jugadores.length === 0) {
    salas.delete(sala.code);
  } else if (sala.adminToken === req.body.token) {
    sala.adminToken = sala.jugadores[0].token;
  }
  res.json({ success: true });
});

export default router;