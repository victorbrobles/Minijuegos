// server/routes/traiciones.js
// Salas online de «Traiciones». Mismo esquema que el resto de juegos: salas en memoria + sondeo HTTP.
// Toda la lógica de la partida vive en ../traiciones/engine.js (el servidor es la única fuente de verdad
// y cada jugador solo recibe SU vista, así nadie puede leer roles ajenos desde el navegador).
import express from 'express';
import * as E from '../traiciones/engine.js';
import { limitesOnline } from '../../client/src/games/limites.js';
const LIM = limitesOnline('traiciones');

const router = express.Router();
const salas = {};

const MIN_JUGADORES = LIM.min;
const MAX_JUGADORES = LIM.max;
const CADUCIDAD_MS = 4 * 60 * 60 * 1000;

function codigoSala() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 4; i++) c += chars.charAt(Math.floor(Math.random() * chars.length));
  return c;
}
const nuevoToken = () => Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);

// Limpieza de salas abandonadas
setInterval(() => {
  const ahora = Date.now();
  Object.keys(salas).forEach((c) => { if (ahora - salas[c].ultimaActividad > CADUCIDAD_MS) delete salas[c]; });
}, 10 * 60 * 1000).unref();

// TRAICIONES_ESCALA acelera el reloj del juego (solo para pruebas automáticas; en producción vale 1)
const ESCALA = Number(process.env.TRAICIONES_ESCALA || 1);
const T0 = Date.now();
const reloj = () => T0 + (Date.now() - T0) * ESCALA;

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

// Avanza los temporizadores vencidos (se llama en cada petición, no hace falta ningún bucle)
function refrescar(sala) {
  if (sala.estado === 'jugando' && sala.partida) {
    E.tick(sala.partida, reloj());
    if (sala.partida.fase === 'fin' && !sala.puntosAplicados) cerrarPartida(sala);
  }
}

function cerrarPartida(sala) {
  sala.puntosAplicados = true;
  const pts = sala.partida.fin.puntos;
  sala.jugadores.forEach((j) => { j.puntos += pts[j.id] || 0; });
  sala.ultimaPartida = { partida: sala.numPartida, puntos: pts };
}

function iniciarPartida(sala) {
  sala.numPartida += 1;
  sala.puntosAplicados = false;
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
    config: { ...E.CONFIG_DEFECTO }, partida: null, ultimaPartida: null, ultimaActividad: Date.now(),
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
  if (sala.jugadores.length >= MAX_JUGADORES) return res.status(400).json({ error: 'La sala está completa.' });
  if (sala.jugadores.some((j) => j.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala.' });
  }
  const token = nuevoToken();
  sala.contadorIds += 1;
  sala.jugadores.push({ id: sala.contadorIds, token, nombre, puntos: 0, visto: Date.now() });
  sala.ultimaActividad = Date.now();
  res.json({ success: true, code, token, jugadorId: sala.contadorIds });
});

// ---------------------------------------------------------------- Estado
router.get('/online/sala/:code', (req, res) => {
  const ctxSala = sala_y_jugador(req, res);
  if (!ctxSala) return;
  const { sala, jugador, esAdmin } = ctxSala;
  refrescar(sala);

  const base = {
    success: true, code: sala.code, estado: sala.estado, esAdmin, yoId: jugador.id,
    config: sala.config, numPartida: sala.numPartida, ahora: reloj(),
    anfitrionId: sala.jugadores.find((j) => j.token === sala.adminToken)?.id ?? null,
    minJugadores: MIN_JUGADORES, maxJugadores: MAX_JUGADORES,
    jugadores: sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, conectado: Date.now() - j.visto < 15000 })),
    ultimaPartida: sala.ultimaPartida
  };
  if (sala.estado === 'jugando' && sala.partida && E.vistaDe) {
    // un jugador que se haya ido de la sala ya no está en la partida
    if (!sala.partida.jugadores.some((j) => j.id === jugador.id)) return res.status(403).json({ error: 'Ya no estás en la partida.' });
    base.vista = E.vistaDe(sala.partida, jugador.id, reloj());
  }
  res.json(base);
});

// ---------------------------------------------------------------- Configuración (anfitrión, en el lobby)
router.post('/online/sala/:code/config', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión.' });
  if (c.sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha empezado.' });
  const { rolesEspeciales, segDebate } = req.body || {};
  if (typeof rolesEspeciales === 'boolean') c.sala.config.rolesEspeciales = rolesEspeciales;
  if (E.OPCIONES_DEBATE.includes(Number(segDebate))) c.sala.config.segDebate = Number(segDebate);
  res.json({ success: true, config: c.sala.config });
});

// ---------------------------------------------------------------- Iniciar
router.post('/online/sala/:code/iniciar', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar.' });
  if (c.sala.estado === 'jugando') return res.status(400).json({ error: 'La partida ya está en marcha.' });
  if (c.sala.jugadores.length < MIN_JUGADORES) return res.status(400).json({ error: `Se necesitan al menos ${MIN_JUGADORES} jugadores.` });
  c.sala.jugadores.forEach((j) => { j.puntos = 0; });
  c.sala.ultimaPartida = null;
  c.sala.numPartida = 0;
  iniciarPartida(c.sala);
  res.json({ success: true });
});

// ---------------------------------------------------------------- Acciones de juego (tiempo real)
// tipo: rol | mover | trabajar | tarea-hecha | cancelar | apagar | matar | sabotear | reportar | campana | ojear | chat | listo-votar | votar | continuar
router.post('/online/sala/:code/accion', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  const { sala, jugador } = c;
  if (sala.estado !== 'jugando' || !sala.partida) return res.status(400).json({ error: 'No hay partida en marcha.' });
  const p = sala.partida;
  const d = req.body || {};
  const t = reloj();
  const id = jugador.id;
  let r;
  switch (d.tipo) {
    case 'rol': r = E.confirmarRol(p, id, t); break;
    case 'mover': r = E.mover(p, id, String(d.sala), t); break;
    case 'trabajar': r = E.trabajar(p, id, t); break;
    case 'apagar': r = E.apagar(p, id, t); break;
    case 'tarea-hecha': r = E.tareaHecha(p, id, t); break;
    case 'cancelar': r = E.cancelarTarea(p, id, t); break;
    case 'matar': r = E.matar(p, id, Number(d.objetivo), t); break;
    case 'sabotear': r = E.sabotear(p, id, String(d.sabotaje), t); break;
    case 'reportar': r = E.reportar(p, id, t); break;
    case 'campana': r = E.campana(p, id, t); break;
    case 'ojear': r = E.ojear(p, id, String(d.sala), t); break;
    case 'chat': r = E.chat(p, id, d.texto, t); break;
    case 'listo-votar': r = E.listoVotar(p, id, t); break;
    case 'votar': r = E.votar(p, id, d.objetivo == null ? null : Number(d.objetivo), t); break;
    case 'continuar': r = E.continuar(p, id, t); break;
    default: return res.status(400).json({ error: 'Acción desconocida.' });
  }
  if (p.fase === 'fin' && !sala.puntosAplicados) cerrarPartida(sala);
  if (!r.ok) return res.status(400).json({ error: r.error });
  res.json({ success: true });
});

// El anfitrión fuerza el avance de una asamblea/votación si alguien está ausente
router.post('/online/sala/:code/forzar', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión.' });
  if (c.sala.estado !== 'jugando' || !c.sala.partida) return res.status(400).json({ error: 'No hay partida en marcha.' });
  E.forzar(c.sala.partida, reloj());
  if (c.sala.partida.fase === 'fin' && !c.sala.puntosAplicados) cerrarPartida(c.sala);
  res.json({ success: true });
});

// ---------------------------------------------------------------- Después de la partida
router.post('/online/sala/:code/siguiente-partida', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión.' });
  if (!c.sala.partida || c.sala.partida.fase !== 'fin') return res.status(400).json({ error: 'La partida aún no ha terminado.' });
  if (c.sala.jugadores.length < MIN_JUGADORES) return res.status(400).json({ error: `Se necesitan al menos ${MIN_JUGADORES} jugadores.` });
  iniciarPartida(c.sala);
  res.json({ success: true });
});

router.post('/online/sala/:code/finalizar', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión.' });
  // No se puede cerrar el marcador en mitad de una partida (los puntos de esa partida se perderían)
  if (c.sala.estado === 'jugando' && c.sala.partida?.fase !== 'fin') return res.status(400).json({ error: 'La partida aún no ha terminado.' });
  if (c.sala.estado === 'lobby') return res.status(400).json({ error: 'Todavía no se ha jugado ninguna partida.' });
  c.sala.estado = 'final';
  res.json({ success: true });
});

router.post('/online/sala/:code/reiniciar', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión.' });
  c.sala.estado = 'lobby';
  c.sala.partida = null;
  c.sala.numPartida = 0;
  c.sala.ultimaPartida = null;
  c.sala.jugadores.forEach((j) => { j.puntos = 0; });
  res.json({ success: true });
});

// El anfitrión quita de la sala de espera a alguien que se ha ido sin salir (móvil apagado, pestaña cerrada…)
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

router.post('/online/sala/:code/salir', (req, res) => {
  const code = String(req.params.code || '').toUpperCase();
  const sala = salas[code];
  if (!sala) return res.json({ success: true });
  const idx = sala.jugadores.findIndex((j) => j.token === req.body?.token);
  if (idx === -1) return res.json({ success: true });
  const [fuera] = sala.jugadores.splice(idx, 1);
  if (sala.estado === 'jugando' && sala.partida) {
    E.abandonar(sala.partida, fuera.id, reloj());
    if (sala.partida.fase === 'fin' && !sala.puntosAplicados) cerrarPartida(sala);
  }
  if (sala.jugadores.length === 0) delete salas[code];
  else if (sala.adminToken === fuera.token) sala.adminToken = sala.jugadores[0].token;
  res.json({ success: true });
});

export default router;
