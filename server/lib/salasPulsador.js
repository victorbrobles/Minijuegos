// server/lib/salasPulsador.js
// Salas online comunes a los juegos de pulsador (El paparazzi, Luces, Cámara... ¡Música! y Frases Célebres).
// Mismo esquema que el resto de juegos: salas en memoria + sondeo HTTP. La lógica vive en ../pulsador/engine.js.
//
// opciones = {
//   config: { rondas: 10, ... },            // configuración inicial de la sala
//   validarConfig(body, config) -> config,  // aplica lo que manda el anfitrión
//   reglas(config) -> reglas del motor,
//   prepararItems(sala) -> Promise<items>,  // ítems de la partida (con la solución dentro)
// }
import * as E from '../pulsador/engine.js';

export const MIN = 2;
export const MAX = 15;
const CADUCIDAD_MS = 4 * 60 * 60 * 1000;

const codigoSala = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 4; i++) c += chars.charAt(Math.floor(Math.random() * chars.length));
  return c;
};
const nuevoToken = () => Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);

export function montarSalas(router, opciones) {
  const salas = {};

  setInterval(() => {
    const ahora = Date.now();
    Object.keys(salas).forEach((c) => { if (ahora - salas[c].ultimaActividad > CADUCIDAD_MS) delete salas[c]; });
  }, 10 * 60 * 1000).unref();

  function salaYJugador(req, res) {
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

  async function iniciarPartida(sala) {
    sala.preparando = true;
    try {
      const items = await opciones.prepararItems(sala);
      if (!items.length) throw new Error('No hay contenido para jugar.');
      sala.numPartida += 1;
      sala.puntosAplicados = false;
      sala.partida = E.crearPartida(sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre })), items, opciones.reglas(sala.config), Date.now());
      sala.estado = 'jugando';
    } finally {
      sala.preparando = false;
    }
  }

  /** Para los recursos de la ronda (imagen, audio…): el ítem de la ronda `r` de la partida en curso. */
  function itemDe(req, res) {
    const sala = salas[String(req.params.code || '').toUpperCase()];
    const r = Number(req.query.r);
    if (!sala?.partida || !Number.isInteger(r) || r < 1 || r > sala.partida.ronda) { res.status(404).json({ error: 'No hay ronda.' }); return null; }
    const p = sala.partida;
    return { sala, item: p.items[r - 1], resuelta: r < p.ronda || p.fase !== 'jugando' };
  }

  router.post('/online/crear', (req, res) => {
    const nombre = String(req.body?.nombre || '').trim().slice(0, 20);
    if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });
    let code = codigoSala();
    while (salas[code]) code = codigoSala();
    const token = nuevoToken();
    salas[code] = {
      code, adminToken: token, estado: 'lobby', contadorIds: 1, numPartida: 0, puntosAplicados: false, preparando: false,
      partida: null, ultimaPartida: null, ultimaActividad: Date.now(), config: { ...opciones.config }, usados: new Set(),
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

  router.get('/online/sala/:code', (req, res) => {
    const c = salaYJugador(req, res);
    if (!c) return;
    const { sala, jugador, esAdmin } = c;
    revisar(sala);
    const ahora = Date.now();
    const base = {
      success: true, ahora, code: sala.code, estado: sala.estado, esAdmin, yoId: jugador.id, numPartida: sala.numPartida,
      config: sala.config, preparando: sala.preparando,
      anfitrionId: sala.jugadores.find((j) => j.token === sala.adminToken)?.id ?? null, min: MIN, max: MAX,
      jugadores: sala.jugadores.map((j) => ({ id: j.id, nombre: j.nombre, puntos: j.puntos, conectado: ahora - j.visto < 15000 })),
      ultimaPartida: sala.ultimaPartida
    };
    if (sala.estado === 'jugando' && sala.partida) {
      if (!sala.partida.jugadores.some((j) => j.id === jugador.id)) return res.status(403).json({ error: 'Ya no estás en la partida.' });
      base.vista = E.vistaDe(sala.partida, jugador.id, ahora);
    }
    res.json(base);
  });

  router.post('/online/sala/:code/config', (req, res) => {
    const c = salaYJugador(req, res);
    if (!c) return;
    if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión.' });
    if (c.sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha empezado.' });
    c.sala.config = opciones.validarConfig(req.body || {}, c.sala.config);
    res.json({ success: true, config: c.sala.config });
  });

  router.post('/online/sala/:code/expulsar', (req, res) => {
    const c = salaYJugador(req, res);
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

  const empezar = async (req, res, primera) => {
    const c = salaYJugador(req, res);
    if (!c) return;
    const { sala } = c;
    if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión.' });
    if (sala.preparando) return res.status(409).json({ error: 'Ya se está preparando la partida.' });
    if (primera && sala.estado === 'jugando') return res.status(400).json({ error: 'La partida ya está en marcha.' });
    if (!primera && sala.partida?.fase !== 'fin') return res.status(400).json({ error: 'La partida aún no ha terminado.' });
    if (sala.jugadores.length < MIN) return res.status(400).json({ error: `Se necesitan al menos ${MIN} jugadores.` });
    if (primera) {
      sala.jugadores.forEach((j) => { j.puntos = 0; });
      sala.ultimaPartida = null;
      sala.numPartida = 0;
    }
    try {
      await iniciarPartida(sala);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message || 'No se ha podido preparar la partida.' });
    }
  };
  router.post('/online/sala/:code/iniciar', (req, res) => empezar(req, res, true));
  router.post('/online/sala/:code/siguiente-partida', (req, res) => empezar(req, res, false));

  // tipo: pulsar | teclear | responder | pista (anfitrión) | rendirse (anfitrión) | siguiente (anfitrión) | terminar (anfitrión)
  router.post('/online/sala/:code/accion', (req, res) => {
    const c = salaYJugador(req, res);
    if (!c) return;
    const { sala, jugador, esAdmin } = c;
    if (sala.estado !== 'jugando' || !sala.partida) return res.status(400).json({ error: 'No hay partida en marcha.' });
    revisar(sala);
    const p = sala.partida; const d = req.body || {}; const id = jugador.id; const ahora = Date.now();
    const soloAdmin = { ok: false, error: 'Solo el anfitrión puede hacerlo.' };
    let r;
    switch (d.tipo) {
      case 'pulsar': r = E.pulsar(p, id, ahora); break;
      case 'teclear': r = E.teclear(p, id, d.texto); break;
      case 'responder': r = E.responder(p, id, String(d.respuesta ?? '').slice(0, 100), ahora); break;
      case 'pista': r = esAdmin ? E.adelantarPista(p, ahora) : soloAdmin; break;
      case 'rendirse': r = esAdmin ? E.rendirse(p, ahora) : soloAdmin; break;
      case 'siguiente': r = esAdmin ? E.siguiente(p, ahora) : soloAdmin; break;
      case 'terminar': r = esAdmin ? E.terminar(p) : soloAdmin; break;
      default: return res.status(400).json({ error: 'Acción desconocida.' });
    }
    revisar(sala);
    if (!r.ok) return res.status(400).json({ error: r.error });
    res.json({ success: true, resultado: r });
  });

  router.post('/online/sala/:code/finalizar', (req, res) => {
    const c = salaYJugador(req, res);
    if (!c) return;
    if (!c.esAdmin) return res.status(403).json({ error: 'Solo el anfitrión.' });
    if (c.sala.estado !== 'jugando' || c.sala.partida?.fase !== 'fin') return res.status(400).json({ error: 'La partida aún no ha terminado.' });
    c.sala.estado = 'final';
    res.json({ success: true });
  });

  router.post('/online/sala/:code/reiniciar', (req, res) => {
    const c = salaYJugador(req, res);
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
    if (sala.estado === 'jugando' && sala.partida) { E.abandonar(sala.partida, fuera.id, Date.now()); revisar(sala); }
    if (sala.jugadores.length === 0) delete salas[code];
    else if (sala.adminToken === fuera.token) sala.adminToken = sala.jugadores[0].token;
    res.json({ success: true });
  });

  return { salas, itemDe };
}

/** Baraja y evita repetir contenido entre partidas de la misma sala mientras quede. */
export function elegirSinRepetir(sala, lista, n, clave = (x) => x.id) {
  let libres = lista.filter((x) => !sala.usados.has(clave(x)));
  if (libres.length < n) { sala.usados.clear(); libres = lista; }
  const b = [...libres];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  const elegidos = b.slice(0, n);
  elegidos.forEach((x) => sala.usados.add(clave(x)));
  return elegidos;
}
