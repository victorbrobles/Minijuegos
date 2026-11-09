// server/routes/cuentas.js
// Salas online de «Lleva la cuenta». Mismo esquema que el resto de juegos: salas en memoria + sondeo HTTP.
// La lógica vive en ../cuentas/engine.js; cada jugador recibe solo SU vista (nadie ve manos ajenas).
import express from 'express';
import * as E from '../cuentas/engine.js';

const router = express.Router();
const salas = {};
const MIN = E.AJUSTES.min;
const MAX = E.AJUSTES.max;
const CADUCIDAD_MS = 4 * 60 * 60 * 1000;

const codigoSala = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 4; i++) c += chars.charAt(Math.floor(Math.random() * chars.length));
  return c;
};
const nuevoToken = () => Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);

setInterval(() => {
  const ahora = Date.now();
  Object.keys(salas).forEach((c) => { if (ahora - salas[c].ultimaActividad > CADUCIDAD_MS) delete salas[c]; });
}, 10 * 60 * 1000).unref();

function sala_y_jugador(req, res) {
  const code = String(req.params.code || '').toUpperCase();
  const token = req.body?.token ?? req.query?.token;
  const sala = salas[code];
  if (!sala) { res.status(404).json({ error: 'La sala no existe o ha caducado.' }); return null; }
  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) { res.status(403).json({ error: 'No perteneces a esta sala.' }); return null; }
  sala.ultimaActividad = Date.now();
  jugador.visto = Date.now();
  return { sala, jugador, esAdmin: sala.adminToken === token };
}

function cerrarPartida(sala) {
  if (sala.puntosAplicados) return;
  sala.puntosAplicados = true;
  const pts = Object.fromEntries(sala.partida.fin.tabla.map((f) => [f.id, f.puntos]));
  sala.jugadores.forEach((j) => { j.puntos += pts[j.id] || 0; });
  sala.ultimaPartida = { partida: sala.numPartida, puntos: pts };
}
const revisar = (sala) => { if (sala.partida?.fase === 'fin') cerrarPartida(sala); };

function iniciarPartida(sala) {
  sala.numPartida += 1; sala.puntosAplicados = false;
  sala.partida = E.crearPartida(sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre })), sala.config);
  sala.estado = 'jugando';
}

// ---------------------------------------------------------------- Crear / unirse
router.post('/online/crear', (req, res) => {
  const nombre = String(req.body?.nombre || '').trim().slice(0, 20);
  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });
  let code = codigoSala();
  while (salas[code]) code = codigoSala();
  const token = nuevoToken();
  salas[code] = {
    code, adminToken: token, estado: 'lobby', contadorIds: 1, numPartida: 0, puntosAplicados: false,
    partida: null, ultimaPartida: null, ultimaActividad: Date.now(), config: {},
    jugadores: [{ id: 1, token, nombre, puntos: 0, visto: Date.now() }]
  };
  res.json({ success: true, code, token, jugadorId: 1 });
});

router.post('/online/unirse', (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  const nombre = String(req.body?.nombre || '').trim().slice(0, 20);
  const sala = salas[code];
  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });
  if (!sala) return res.status(404).json({ error: 'La sala no existe o el código es incorrecto.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= MAX) return res.status(400).json({ error: 'La sala está completa.' });
  if (sala.jugadores.some((j) => j.nombre.toLowerCase() === nombre.toLowerCase())) return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala.' });
  const token = nuevoToken();
  sala.contadorIds += 1;
  sala.jugadores.push({ id: sala.contadorIds, token, nombre, puntos: 0, visto: Date.now() });
  sala.ultimaActividad = Date.now();
  res.json({ success: true, code, token, jugadorId: sala.contadorIds });
});

// ---------------------------------------------------------------- Estado
router.get('/online/sala/:code', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  const { sala, jugador, esAdmin } = c;
  const base = {
    success: true, code: sala.code, estado: sala.estado, esAdmin, yoId: jugador.id, numPartida: sala.numPartida, config: sala.config,
    anfitrionId: sala.jugadores.find((j) => j.token === sala.adminToken)?.id ?? null, min: MIN, max: MAX,
    jugadores: sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, conectado: Date.now() - j.visto < 15000 })),
    ultimaPartida: sala.ultimaPartida
  };
  if (sala.estado === 'jugando' && sala.partida) {
    if (!sala.partida.jugadores.some((j) => j.id === jugador.id)) return res.status(403).json({ error: 'Ya no estás en la partida.' });
    base.vista = E.vistaDe(sala.partida, jugador.id);
  }
  res.json(base);
});

// ---------------------------------------------------------------- Configuración y expulsar (sala de espera)
router.post('/online/sala/:code/expulsar', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión.' });
  if (c.sala.estado !== 'lobby') return res.status(400).json({ error: 'Solo se puede quitar a alguien en la sala de espera.' });
  const id = Number(req.body?.id);
  if (id === c.jugador.id) return res.status(400).json({ error: 'No puedes quitarte a ti mismo.' });
  const idx = c.sala.jugadores.findIndex((j) => j.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Ese jugador ya no está en la sala.' });
  c.sala.jugadores.splice(idx, 1);
  res.json({ success: true });
});

// ---------------------------------------------------------------- Iniciar
router.post('/online/sala/:code/iniciar', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar.' });
  if (c.sala.estado === 'jugando') return res.status(400).json({ error: 'La partida ya está en marcha.' });
  if (c.sala.jugadores.length < MIN) return res.status(400).json({ error: `Se necesitan al menos ${MIN} jugadores.` });
  c.sala.jugadores.forEach((j) => { j.puntos = 0; });
  c.sala.ultimaPartida = null; c.sala.numPartida = 0;
  iniciarPartida(c.sala);
  res.json({ success: true });
});

// ---------------------------------------------------------------- Acciones
// tipo: soltar | accion | pasar
router.post('/online/sala/:code/accion', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  const { sala, jugador } = c;
  if (sala.estado !== 'jugando' || !sala.partida) return res.status(400).json({ error: 'No hay partida en marcha.' });
  const p = sala.partida; const d = req.body || {}; const id = jugador.id;
  let r;
  switch (d.tipo) {
    case 'soltar': r = E.soltar(p, id, Number(d.numero)); break;
    case 'accion': r = E.usarAccion(p, id); break;
    case 'pasar': r = E.pasar(p, id); break;
    default: return res.status(400).json({ error: 'Acción desconocida.' });
  }
  revisar(sala);
  if (!r.ok) return res.status(400).json({ error: r.error });
  res.json({ success: true, resultado: r });
});

router.post('/online/sala/:code/forzar', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión.' });
  if (c.sala.estado !== 'jugando' || !c.sala.partida) return res.status(400).json({ error: 'No hay partida en marcha.' });
  E.forzar(c.sala.partida);
  revisar(c.sala);
  res.json({ success: true });
});

// ---------------------------------------------------------------- Después de la partida
router.post('/online/sala/:code/siguiente-partida', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión.' });
  if (!c.sala.partida || c.sala.partida.fase !== 'fin') return res.status(400).json({ error: 'La partida aún no ha terminado.' });
  if (c.sala.jugadores.length < MIN) return res.status(400).json({ error: `Se necesitan al menos ${MIN} jugadores.` });
  iniciarPartida(c.sala);
  res.json({ success: true });
});

router.post('/online/sala/:code/finalizar', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión.' });
  if (c.sala.estado !== 'jugando' || c.sala.partida?.fase !== 'fin') return res.status(400).json({ error: 'La partida aún no ha terminado.' });
  c.sala.estado = 'final';
  res.json({ success: true });
});

router.post('/online/sala/:code/reiniciar', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión.' });
  Object.assign(c.sala, { estado: 'lobby', partida: null, numPartida: 0, ultimaPartida: null });
  c.sala.jugadores.forEach((j) => { j.puntos = 0; });
  res.json({ success: true });
});

router.post('/online/sala/:code/salir', (req, res) => {
  const code = String(req.params.code || '').toUpperCase();
  const sala = salas[code];
  if (!sala) return res.json({ success: true });
  const idx = sala.jugadores.findIndex((j) => j.token === req.body?.token);
  if (idx === -1) return res.json({ success: true });
  const [fuera] = sala.jugadores.splice(idx, 1);
  if (sala.estado === 'jugando' && sala.partida) { E.abandonar(sala.partida, fuera.id); revisar(sala); }
  if (sala.jugadores.length === 0) delete salas[code];
  else if (sala.adminToken === fuera.token) sala.adminToken = sala.jugadores[0].token;
  res.json({ success: true });
});

export default router;
