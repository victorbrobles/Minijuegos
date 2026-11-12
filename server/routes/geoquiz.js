// server/routes/geoquiz.js
// GeoQuiz: banco de preguntas (modo local) y salas online por turnos.
// Las reglas están en server/geoquiz/engine.js (el cliente usa una copia idéntica en el modo local).
import express from 'express';
import CATEGORIAS from '../data/seeds/geoquiz/index.js';
import * as E from '../geoquiz/engine.js';
import { limitesOnline } from '../../client/src/games/limites.js';
const LIM = limitesOnline('geoquiz');

const router = express.Router();

const MAX_JUGADORES = LIM.max;

// Banco de preguntas de las categorías pedidas (todas si no se indica ninguna)
function banco(categoriaId) {
  const cats = categoriaId ? CATEGORIAS.filter((c) => c.id === categoriaId) : CATEGORIAS;
  return (cats.length ? cats : CATEGORIAS).flatMap((c) => c.preguntas.map((p) => ({ ...p, categoria: c.nombre })));
}

// ==========================================
// CATÁLOGO Y MODO LOCAL
// ==========================================
router.get('/categorias', (req, res) => {
  res.json({
    success: true,
    categorias: CATEGORIAS.map((c) => ({ id: c.id, nombre: c.nombre, icono: c.icono, total: c.preguntas.length })),
    modos: E.MODOS
  });
});

// El modo local recibe las preguntas con sus soluciones (se juega en un solo dispositivo)
router.get('/preguntas', (req, res) => {
  const categoria = typeof req.query.categoria === 'string' ? req.query.categoria : null;
  res.json({ success: true, preguntas: banco(categoria) });
});

// ==========================================
// SALAS ONLINE
// ==========================================
const salas = {};

function generarCodigo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 4; i++) c += chars.charAt(Math.floor(Math.random() * chars.length));
  return c;
}

const generarToken = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

function configValida(cfg = {}) {
  const modo = E.MODOS[cfg.modo] ? cfg.modo : 'geomix';
  const info = E.MODOS[modo];
  const rondas = info.rondas ? (info.rondas.includes(Number(cfg.rondas)) ? Number(cfg.rondas) : info.rondasPorDefecto) : null;
  const categoria = modo === 'especialista' && CATEGORIAS.some((c) => c.id === cfg.categoria) ? cfg.categoria : (modo === 'especialista' ? CATEGORIAS[0].id : null);
  return { modo, rondas, categoria };
}

function obtenerSala(req, res, { admin = false } = {}) {
  const code = String(req.params.code || '').toUpperCase();
  const sala = salas[code];
  if (!sala) { res.status(404).json({ error: 'La sala no existe o ha caducado.' }); return null; }
  const token = req.body?.token ?? req.query?.token;
  const jugador = sala.jugadores.find((j) => j.token === token);
  if (!jugador) { res.status(403).json({ error: 'No perteneces a esta sala.' }); return null; }
  if (admin && sala.adminToken !== token) { res.status(403).json({ error: 'Solo el anfitrión puede hacerlo.' }); return null; }
  return { sala, jugador };
}

function estadoPara(sala, jugador) {
  const ahora = Date.now();
  if (sala.partida && sala.estado === 'juego') {
    E.tick(sala.partida, ahora);
  }
  return {
    success: true,
    code: sala.code,
    estado: sala.estado, // 'lobby' | 'juego'
    esAdmin: sala.adminToken === jugador.token,
    yoId: jugador.id,
    config: sala.config,
    partida: sala.partida ? E.vista(sala.partida, ahora) : null,
    jugadores: sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre }))
  };
}

// 1. Crear sala
router.post('/online/crear', (req, res) => {
  const nombre = String(req.body?.nombre || '').trim().slice(0, 20);
  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });
  let code = generarCodigo();
  while (salas[code]) code = generarCodigo();
  const token = generarToken();
  salas[code] = {
    code,
    adminToken: token,
    estado: 'lobby',
    siguienteId: 2,
    config: configValida({ modo: 'geomix' }),
    partida: null,
    jugadores: [{ id: 1, token, nombre }]
  };
  res.json({ success: true, code, token, jugadorId: 1 });
});

// 2. Unirse
router.post('/online/unirse', (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  const nombre = String(req.body?.nombre || '').trim().slice(0, 20);
  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });
  const sala = salas[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o el código es incorrecto.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= LIM.max) return res.status(400).json({ error: `La sala está llena (máx. ${LIM.max}).` });
  if (sala.jugadores.some((j) => j.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala.' });
  }
  const token = generarToken();
  const id = sala.siguienteId++;
  sala.jugadores.push({ id, token, nombre });
  res.json({ success: true, code, token, jugadorId: id });
});

// 3. Estado
router.get('/online/sala/:code', (req, res) => {
  const r = obtenerSala(req, res);
  if (!r) return;
  res.json(estadoPara(r.sala, r.jugador));
});

// 4. Configuración de la partida (anfitrión, en la sala de espera)
router.post('/online/sala/:code/config', (req, res) => {
  const r = obtenerSala(req, res, { admin: true });
  if (!r) return;
  if (r.sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha empezado.' });
  r.sala.config = configValida({ ...r.sala.config, ...(req.body?.config || {}) });
  res.json(estadoPara(r.sala, r.jugador));
});

// 5. Empezar partida
router.post('/online/sala/:code/iniciar', (req, res) => {
  const r = obtenerSala(req, res, { admin: true });
  if (!r) return;
  const { sala } = r;
  if (sala.jugadores.length < LIM.min) return res.status(400).json({ error: `Se necesitan al menos ${LIM.min} jugadores.` });
  const cfg = sala.config;
  sala.partida = E.crearPartida(
    sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre })),
    banco(cfg.modo === 'especialista' ? cfg.categoria : null),
    { modo: cfg.modo, rondas: cfg.rondas }
  );
  sala.estado = 'juego';
  res.json(estadoPara(sala, r.jugador));
});

// 6. Acciones de la partida
//    listo · responder { valor } · enumerar { texto } · pista · plantarse   [jugador con el turno]
//    continuar                                                              [jugador con el turno o anfitrión]
//    saltar-turno · finalizar                                               [anfitrión]
router.post('/online/sala/:code/accion', (req, res) => {
  const r = obtenerSala(req, res);
  if (!r) return;
  const { sala, jugador } = r;
  const p = sala.partida;
  if (sala.estado !== 'juego' || !p) return res.status(400).json({ error: 'No hay ninguna partida en juego.' });
  const ahora = Date.now();
  const esAdmin = sala.adminToken === jugador.token;
  const { tipo } = req.body || {};
  let resultado;
  switch (tipo) {
    case 'listo': resultado = E.empezarTurno(p, jugador.id, ahora); break;
    case 'responder': {
      const v = req.body?.valor;
      const valor = Array.isArray(v) ? v.slice(0, 10).map((x) => String(x).slice(0, 80)) : String(v ?? '').slice(0, 120);
      resultado = E.responder(p, jugador.id, valor, ahora);
      break;
    }
    case 'enumerar': resultado = E.enumerar(p, jugador.id, String(req.body?.texto ?? '').slice(0, 60), ahora); break;
    case 'pista': resultado = E.pedirPista(p, jugador.id, ahora); break;
    case 'plantarse': resultado = E.plantarse(p, jugador.id, ahora); break;
    case 'continuar':
      if (!esAdmin && p.turno?.jugadorId !== jugador.id) return res.status(403).json({ error: 'Solo quien juega o el anfitrión pueden continuar.' });
      resultado = E.continuar(p, ahora);
      break;
    case 'saltar-turno':
      if (!esAdmin) return res.status(403).json({ error: 'Solo el anfitrión puede saltar turnos.' });
      resultado = E.saltarTurno(p, ahora);
      break;
    case 'finalizar':
      if (!esAdmin) return res.status(403).json({ error: 'Solo el anfitrión puede terminar la partida.' });
      resultado = E.finalizar(p);
      break;
    default:
      return res.status(400).json({ error: 'Acción desconocida.' });
  }
  if (resultado?.error) return res.status(400).json({ error: resultado.error });
  res.json({ ...estadoPara(sala, jugador), resultado });
});

// 7. Volver a la sala de espera (misma gente)
router.post('/online/sala/:code/reiniciar', (req, res) => {
  const r = obtenerSala(req, res, { admin: true });
  if (!r) return;
  r.sala.estado = 'lobby';
  r.sala.partida = null;
  res.json(estadoPara(r.sala, r.jugador));
});

// 8. Salir
router.post('/online/sala/:code/salir', (req, res) => {
  const code = String(req.params.code || '').toUpperCase();
  const { token } = req.body || {};
  const sala = salas[code];
  if (!sala) return res.json({ success: true });
  const idx = sala.jugadores.findIndex((j) => j.token === token);
  if (idx !== -1) {
    const [saliente] = sala.jugadores.splice(idx, 1);
    if (!sala.jugadores.length) {
      delete salas[code];
      return res.json({ success: true });
    }
    if (sala.adminToken === token) sala.adminToken = sala.jugadores[0].token;
    if (sala.partida && sala.estado === 'juego') E.quitarJugador(sala.partida, saliente.id, Date.now());
  }
  res.json({ success: true });
});

export default router;
