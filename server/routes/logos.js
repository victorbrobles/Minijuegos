// server/routes/logos.js
import express from 'express';
import crypto from 'crypto';
import { getLogoAleatorio, TODOS_LOS_LOGOS } from '../data/seeds/logos/logosData.js';

const router = express.Router();
const salas = {};
const MAX_RONDAS = 30;

// Caché en memoria para no volver a descargar los logos ya servidos
const svgCache = {};

const generarCodigo = () => Math.random().toString(36).substring(2, 6).toUpperCase();

const normalizar = (t) =>
  String(t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

const distanciaLevenshtein = (a, b) => {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const coste = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + coste
      );
    }
  }
  return matrix[a.length][b.length];
};

const esRespuestaCorrecta = (intento, logo) => {
  const normIntento = normalizar(intento);
  if (!normIntento) return false;

  const candidatos = [logo.nombre, ...(logo.sinonimos || [])].map(normalizar);
  for (const c of candidatos) {
    if (normIntento === c) return true;
    const dist = distanciaLevenshtein(normIntento, c);
    const maxLen = Math.max(normIntento.length, c.length);
    if ((1 - dist / maxLen) >= 0.82 || (maxLen >= 5 && dist <= 1)) {
      return true;
    }
  }
  return false;
};

// ==========================================================
// RUTA PROXY INTERNA PARA ENTREGAR EL LOGO SIN BLOQUEOS
// ==========================================================
router.get('/imagen/:id', async (req, res) => {
  const id = Number(req.params.id);
  const logo = TODOS_LOS_LOGOS.find(l => l.id === id);
  if (!logo) return res.status(404).send('Logo no encontrado');

  // Si ya lo tenemos en caché en memoria, se entrega al instante
  if (svgCache[id]) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(svgCache[id]);
  }

  const slug = logo.slug || normalizar(logo.nombre);

  try {
    let resp = await fetch(`https://cdn.simpleicons.org/${slug}/ffffff`);
    if (!resp.ok) {
      resp = await fetch(`https://api.iconify.design/simple-icons:${slug}.svg?color=%23ffffff`);
    }
    if (resp.ok) {
      const svg = await resp.text();
      svgCache[id] = svg;
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(svg);
    }
  } catch {
    // Si no hay internet o falla el CDN, salta al vector de respaldo
  }

  // Respaldo garantizado: círculo con la inicial de la marca para que NUNCA aparezca rota
  const inicial = (logo.nombre || '?')[0].toUpperCase();
  const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff" stroke-width="6"/><text x="50" y="63" font-family="system-ui, sans-serif" font-size="38" font-weight="900" fill="#ffffff" text-anchor="middle">${inicial}</text></svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  return res.send(fallbackSvg);
});

router.post('/crear', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Falta nombre' });

  const code = generarCodigo();
  const token = crypto.randomUUID();

  salas[code] = {
    code,
    estado: 'lobby',
    rondaNum: 1,
    maxRondas: MAX_RONDAS,
    logoActual: null,
    logosUsados: [],
    segundosRestantes: 60,
    timer: null,
    jugadas: {},
    jugadores: [{ id: 1, nombre: nombre.trim(), token, puntos: 0, esAdmin: true }]
  };

  res.json({ success: true, code, token });
});

router.post('/unirse', (req, res) => {
  const { nombre, joinCode } = req.body;
  const sala = salas[joinCode];
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
  if (sala.estado !== 'lobby') return res.status(400).json({ error: 'Partida ya empezada' });
  if (sala.jugadores.length >= 10) return res.status(400).json({ error: 'Sala llena (máximo 10 jugadores)' });

  const token = crypto.randomUUID();
  const newId = sala.jugadores.length > 0 ? Math.max(...sala.jugadores.map(j => j.id)) + 1 : 1;
  sala.jugadores.push({ id: newId, nombre: nombre.trim(), token, puntos: 0, esAdmin: false });

  res.json({ success: true, code: joinCode, token });
});

router.get('/sala/:code', (req, res) => {
  const { code } = req.params;
  const { token } = req.query;
  const sala = salas[code];
  if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });

  const yo = sala.jugadores.find(j => j.token === token);
  if (!yo) return res.status(403).json({ error: 'No autorizado' });

  const miJugada = sala.jugadas[yo.id] || null;

  res.json({
    success: true,
    code: sala.code,
    estado: sala.estado,
    rondaNum: sala.rondaNum,
    maxRondas: sala.maxRondas,
    segundosRestantes: sala.segundosRestantes,
    logoImagen: sala.logoActual ? `/api/logos/imagen/${sala.logoActual.id}` : null,
    logoNombre: (sala.estado === 'resultados' || sala.estado === 'fin') ? sala.logoActual?.nombre : null,
    esAdmin: yo.esAdmin,
    miJugada,
    jugadores: sala.jugadores.map(j => ({
      id: j.id,
      nombre: j.nombre,
      puntos: j.puntos,
      haJugado: Boolean(sala.jugadas[j.id]),
      jugada: sala.estado === 'resultados' ? sala.jugadas[j.id] : null,
      esTu: j.id === yo.id,
      esAdmin: j.esAdmin
    }))
  });
});

const iniciarRonda = (sala) => {
  if (sala.timer) clearInterval(sala.timer);

  const logo = getLogoAleatorio(sala.logosUsados);
  sala.logoActual = logo;
  sala.logosUsados.push(logo.id);
  sala.jugadas = {};
  sala.segundosRestantes = 60;
  sala.estado = 'jugando';

  sala.timer = setInterval(() => {
    sala.segundosRestantes -= 1;
    if (sala.segundosRestantes <= 0) {
      clearInterval(sala.timer);
      finalizarRonda(sala);
    }
  }, 1000);
};

const finalizarRonda = (sala) => {
  if (sala.timer) clearInterval(sala.timer);
  sala.estado = 'resultados';
};

router.post('/sala/:code/iniciar', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'No autorizado' });
  if (sala.jugadores.length < 2) return res.status(400).json({ error: 'Mínimo 2 jugadores' });

  sala.jugadores.forEach(j => { j.puntos = 0; });
  sala.rondaNum = 1;
  sala.logosUsados = [];

  iniciarRonda(sala);
  res.json({ success: true });
});

router.post('/sala/:code/responder', (req, res) => {
  const { code, token, respuesta } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.estado !== 'jugando') return res.status(400).json({ error: 'Ronda no activa' });
  if (sala.jugadas[yo.id]) return res.status(400).json({ error: 'Ya has actuado en esta ronda' });

  const seg = Math.max(1, sala.segundosRestantes);
  const acierto = esRespuestaCorrecta(respuesta, sala.logoActual);

  if (acierto) {
    yo.puntos += seg;
    sala.jugadas[yo.id] = { respondido: true, acierto: true, paso: false, delta: seg, texto: respuesta };
  } else {
    yo.puntos -= seg;
    sala.jugadas[yo.id] = { respondido: true, acierto: false, paso: false, delta: -seg, texto: respuesta };
  }

  const todosListos = sala.jugadores.every(j => Boolean(sala.jugadas[j.id]));
  if (todosListos) {
    finalizarRonda(sala);
  }

  res.json({ success: true, acierto, delta: sala.jugadas[yo.id].delta });
});

router.post('/sala/:code/pasar', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || sala.estado !== 'jugando') return res.status(400).json({ error: 'Ronda no activa' });
  if (sala.jugadas[yo.id]) return res.status(400).json({ error: 'Ya has actuado en esta ronda' });

  sala.jugadas[yo.id] = { respondido: true, acierto: false, paso: true, delta: 0, texto: 'Paso' };

  const todosListos = sala.jugadores.every(j => Boolean(sala.jugadas[j.id]));
  if (todosListos) {
    finalizarRonda(sala);
  }

  res.json({ success: true });
});

router.post('/sala/:code/siguiente-ronda', (req, res) => {
  const { code, token } = req.body;
  const sala = salas[code];
  const yo = sala?.jugadores.find(j => j.token === token);
  if (!yo || !yo.esAdmin) return res.status(403).json({ error: 'No autorizado' });

  if (sala.rondaNum >= sala.maxRondas) {
    sala.estado = 'fin';
    return res.json({ success: true, fin: true });
  }

  sala.rondaNum += 1;
  iniciarRonda(sala);
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