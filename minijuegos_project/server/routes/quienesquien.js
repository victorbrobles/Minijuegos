// server/routes/quienesquien.js
import { Router } from 'express';
import SEED_DATA from '../data/seeds/quienesquien/quienesquien.seed.js';

const router = Router();

const ICONOS_MAP = {
  'Países': 'globe',
  'Futbolistas': 'trophy',
  'Animales': 'whois',
  'Marcas': 'star',
  'Películas y series': 'clapperboard',
  'Cantantes': 'mic',
  'Canciones míticas': 'letters',
  'Historia y política': 'landmark',
  'Atletas y otros deportes': 'speedometer',
  'Monumentos históricos': 'landmark',
  'Profesiones': 'briefcase',
  'YouTube y ese mundo': 'zap',
  'Videojuegos': 'dice',
  'Personajes de dibujos': 'whois',
  'Personajes de películas': 'mask',
  'Comida': 'star',
  'Leyendas del futbol': 'trophy',
  'Pokemon': 'orb'
};

const CATEGORIAS = Object.entries(SEED_DATA).map(([nombre, items], idx) => {
  const slug = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_');

  return {
    id: slug || `cat_${idx}`,
    nombre,
    icono: ICONOS_MAP[nombre] || 'star',
    personajes: items
  };
});

function buscarCategoria(idOCategoria) {
  if (!idOCategoria) return CATEGORIAS[0];
  const query = String(idOCategoria).toLowerCase().trim();
  return (
    CATEGORIAS.find((c) => c.id === query || c.nombre.toLowerCase() === query) ||
    CATEGORIAS[0]
  );
}

function barajar(arr) {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

const salas = {};

function generarCodigo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 4; i++) {
    c += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return c;
}

function generarToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 1. Obtener categorías
router.get('/categorias', (req, res) => {
  const lista = CATEGORIAS.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    icono: c.icono,
    totalPersonajes: c.personajes.length
  }));
  res.json({ success: true, categorias: lista });
});

// 2. Barajado para local
router.get('/personajes', (req, res) => {
  const cat = buscarCategoria(req.query.categoria);
  res.json({
    success: true,
    categoria: cat.nombre,
    personajes: barajar(cat.personajes)
  });
});

// 3. Crear sala
router.post('/crear', (req, res) => {
  const nombre = (req.body?.nombre || '').trim();
  if (!nombre) return res.status(400).json({ error: 'Debes indicar un nombre.' });

  let code = generarCodigo();
  while (salas[code]) code = generarCodigo();

  const tokenAdmin = generarToken();
  salas[code] = {
    code,
    adminToken: tokenAdmin,
    estado: 'lobby',
    categoria: null,
    jugadores: [{ id: 1, token: tokenAdmin, nombre, tarjeta: null, conectado: true }]
  };

  res.json({ success: true, code, token: tokenAdmin, jugadorId: 1 });
});

// 4. Unirse a sala
router.post('/unirse', (req, res) => {
  const code = (req.body?.code || '').trim().toUpperCase();
  const nombre = (req.body?.nombre || '').trim();

  const sala = salas[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o el código es incorrecto.' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'La partida ya ha comenzado.' });
  if (sala.jugadores.length >= 20) return res.status(400).json({ error: 'La sala está completa.' });
  if (sala.jugadores.some((j) => j.nombre.toLowerCase() === nombre.toLowerCase())) {
    return res.status(400).json({ error: 'Ya hay un jugador con ese nombre en la sala.' });
  }

  const token = generarToken();
  const nuevoId = sala.jugadores.length + 1;
  sala.jugadores.push({ id: nuevoId, token, nombre, tarjeta: null, conectado: true });

  res.json({ success: true, code, token, jugadorId: nuevoId });
});

// 5. Estado de la sala (El jugador nunca recibe su propia tarjeta)
router.get('/sala/:code', (req, res) => {
  const code = req.params.code.toUpperCase();
  const token = req.query.token;

  const sala = salas[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe o ha caducado.' });

  const jugadorActual = sala.jugadores.find((j) => j.token === token);
  if (!jugadorActual) return res.status(403).json({ error: 'No perteneces a esta sala.' });

  const esAdmin = sala.adminToken === token;

  const jugadoresVista = sala.jugadores.map((j) => ({
    id: j.id,
    nombre: j.nombre,
    esTu: j.token === token,
    tarjeta: j.token === token ? null : j.tarjeta
  }));

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    esAdmin,
    categoria: sala.categoria,
    jugadores: jugadoresVista
  });
});

// 6. Iniciar partida directamente con la categoría seleccionada
router.post('/sala/:code/iniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token, categoriaId } = req.body || {};

  const sala = salas[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede iniciar.' });

  const cat = buscarCategoria(categoriaId);
  const mazo = barajar(cat.personajes);

  sala.categoria = { id: cat.id, nombre: cat.nombre, icono: cat.icono };
  sala.estado = 'jugando';

  sala.jugadores.forEach((j, idx) => {
    j.tarjeta = mazo[idx % mazo.length];
  });

  // Devolver el estado actualizado directamente
  const jugadoresVista = sala.jugadores.map((j) => ({
    id: j.id,
    nombre: j.nombre,
    esTu: j.token === token,
    tarjeta: j.token === token ? null : j.tarjeta
  }));

  res.json({
    success: true,
    code: sala.code,
    estado: 'jugando',
    esAdmin: true,
    categoria: sala.categoria,
    jugadores: jugadoresVista
  });
});

// 7. Reiniciar partida (volver al lobby)
router.post('/sala/:code/reiniciar', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salas[code];
  if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
  if (sala.adminToken !== token) return res.status(403).json({ error: 'Solo el anfitrión puede reiniciar.' });

  sala.estado = 'lobby';
  sala.categoria = null;
  sala.jugadores.forEach((j) => {
    j.tarjeta = null;
  });

  res.json({ success: true });
});

// 8. Salir
router.post('/sala/:code/salir', (req, res) => {
  const code = req.params.code.toUpperCase();
  const { token } = req.body || {};

  const sala = salas[code];
  if (!sala) return res.json({ success: true });

  const idx = sala.jugadores.findIndex((j) => j.token === token);
  if (idx !== -1) {
    sala.jugadores.splice(idx, 1);
    if (sala.jugadores.length === 0) {
      delete salas[code];
    } else if (sala.adminToken === token) {
      sala.adminToken = sala.jugadores[0].token;
    }
  }

  res.json({ success: true });
});

export default router;