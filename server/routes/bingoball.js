// server/routes/bingoball.js
// Salas online de «Bingoball». Mismo esquema que el resto de juegos: salas en memoria + sondeo HTTP.
// La lógica vive en ../bingoball/engine.js; cada jugador recibe solo su cartón. El reloj avanza al consultar.
import express from 'express';
import * as E from '../bingoball/engine.js';
import { GRUPOS_BINGOS } from '../data/seeds/bingoball/bingoballData.js';

const bingoDeGrupo = (grupoId) => {
  const grupo = GRUPOS_BINGOS.find((g) => g.id === grupoId) || GRUPOS_BINGOS[0];
  return grupo.bingos[Math.floor(Math.random() * grupo.bingos.length)];
};

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
  const g = sala.partida.fin.ganadores;
  const pts = Object.fromEntries(sala.jugadores.map((j) => [j.id, g.includes(j.id) ? 3 : 0]));
  sala.jugadores.forEach((j) => { j.puntos += pts[j.id] || 0; });
  sala.ultimaPartida = { partida: sala.numPartida, puntos: pts };
}
const revisar = (sala) => {
  if (sala.estado === 'jugando' && sala.partida) E.tick(sala.partida, Date.now());
  if (sala.partida?.fase === 'fin') cerrarPartida(sala);
};

function iniciarPartida(sala) {
  sala.numPartida += 1; sala.puntosAplicados = false;
  sala.partida = E.crearPartida(sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre })), bingoDeGrupo(sala.config.grupo), Date.now());
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
    partida: null, ultimaPartida: null, ultimaActividad: Date.now(), config: { grupo: GRUPOS_BINGOS[0].id },
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
  revisar(sala);
  const base = {
    success: true, ahora: Date.now(), grupos: GRUPOS_BINGOS.map((g) => ({ id: g.id, nombre: g.nombre, categorias: g.bingos[0].categorias.length, ejemplos: g.bingos[0].categorias.slice(0, 3).map((x) => x.nombre) })), code: sala.code, estado: sala.estado, esAdmin, yoId: jugador.id, numPartida: sala.numPartida, config: sala.config,
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
router.post('/online/sala/:code/config', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión.' });
  if (c.sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha empezado.' });
  if (GRUPOS_BINGOS.some((g) => g.id === req.body?.grupo)) c.sala.config.grupo = req.body.grupo;
  res.json({ success: true, config: c.sala.config });
});

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
// El anfitrión pulsa «Jugar» (o «Otro bingo» al acabar): todos pasan a la pantalla de elegir tipo de bingo.
router.post('/online/sala/:code/elegir', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  const { sala } = c;
  if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión.' });
  const trasPartida = sala.estado === 'jugando' && sala.partida?.fase === 'fin';
  if (sala.estado !== 'lobby' && !trasPartida) return res.status(400).json({ error: 'Ahora no se puede elegir bingo.' });
  if (sala.jugadores.length < MIN) return res.status(400).json({ error: `Se necesitan al menos ${MIN} jugadores.` });
  sala.continuar = trasPartida;
  sala.estado = 'eligiendo';
  res.json({ success: true });
});

// Volver atrás desde la elección (a la sala de espera o a la clasificación del último bingo).
router.post('/online/sala/:code/volver', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión.' });
  if (c.sala.estado !== 'eligiendo') return res.json({ success: true });
  c.sala.estado = c.sala.continuar && c.sala.partida ? 'jugando' : 'lobby';
  res.json({ success: true });
});

router.post('/online/sala/:code/iniciar', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  const { sala } = c;
  if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar.' });
  if (sala.estado !== 'eligiendo' && sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya está en marcha.' });
  if (sala.jugadores.length < MIN) return res.status(400).json({ error: `Se necesitan al menos ${MIN} jugadores.` });
  if (GRUPOS_BINGOS.some((g) => g.id === req.body?.grupo)) sala.config.grupo = req.body.grupo;
  if (!(sala.estado === 'eligiendo' && sala.continuar)) {
    sala.jugadores.forEach((j) => { j.puntos = 0; });
    sala.ultimaPartida = null; sala.numPartida = 0;
  }
  sala.continuar = false;
  iniciarPartida(sala);
  res.json({ success: true });
});

// ---------------------------------------------------------------- Acciones
// tipo: marcar | linea | decidir | saltar (anfitrión) | terminar (anfitrión)
router.post('/online/sala/:code/accion', (req, res) => {
  const c = sala_y_jugador(req, res);
  if (!c) return;
  const { sala, jugador, esAdmin } = c;
  if (sala.estado !== 'jugando' || !sala.partida) return res.status(400).json({ error: 'No hay partida en marcha.' });
  revisar(sala);
  const p = sala.partida; const d = req.body || {}; const ahora = Date.now();
  const soloAdmin = { ok: false, error: 'Solo el anfitrión puede hacerlo.' };
  let r;
  switch (d.tipo) {
    case 'marcar': r = E.marcar(p, jugador.id, String(d.casillaId || ''), ahora); break;
    case 'linea': r = E.pedirLinea(p, jugador.id, Number(d.fila), ahora); break;
    case 'decidir': r = E.decidirLinea(p, jugador.id, Boolean(d.cantar), ahora); break;
    case 'saltar': r = esAdmin ? E.saltar(p, ahora) : soloAdmin; break;
    case 'terminar': r = esAdmin ? E.terminar(p) : soloAdmin; break;
    default: return res.status(400).json({ error: 'Acción desconocida.' });
  }
  revisar(sala);
  if (!r.ok) return res.status(400).json({ error: r.error });
  res.json({ success: true, resultado: r });
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
