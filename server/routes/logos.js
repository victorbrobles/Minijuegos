// server/routes/logos.js
import express from 'express';
import crypto from 'crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as simpleIcons from 'simple-icons';
import { getLogoAleatorio, TODOS_LOS_LOGOS } from '../data/seeds/logos/logosData.js';

const router = express.Router();
const salas = {};
const MAX_RONDAS = 30;

// Imágenes propias opcionales: server/data/seeds/logos/img/<slug>.(svg|png|webp|jpg)
// Tienen prioridad sobre Simple Icons. Quien las añade es responsable de tener derecho a usarlas.
const DIR_IMG = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/seeds/logos/img');
const EXT_IMG = { svg: 'image/svg+xml', png: 'image/png', webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg' };

// Simple Icons va incluido en el paquete npm: sin descargas ni dependencia de ningún CDN
const ICONOS = new Map(Object.values(simpleIcons).filter((i) => i && i.slug && i.svg).map((i) => [i.slug, i]));
const svgCache = {};

// SVG con el color oficial de la marca y sin <title> (el título contiene el nombre de la marca)
const luminosidad = (hex) => {
  const [r, g, b] = [0, 2, 4].map((k) => parseInt(hex.slice(k, k + 2), 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};
const svgDeMarca = (icono) => {
  // Los colores casi blancos no se verían sobre el fondo claro del logo
  const color = luminosidad(icono.hex) > 0.85 ? '1f2937' : icono.hex;
  return icono.svg.replace(/<title>.*?<\/title>/s, '').replace('<svg ', `<svg fill="#${color}" `);
};

const imagenLocal = (slug) => {
  for (const ext of Object.keys(EXT_IMG)) {
    const f = path.join(DIR_IMG, `${slug}.${ext}`);
    if (fs.existsSync(f)) return { f, tipo: EXT_IMG[ext] };
  }
  return null;
};

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
// IMAGEN DEL LOGO (sin CDN: imagen propia o Simple Icons del paquete npm)
// ==========================================================
router.get('/imagen/:id', (req, res) => {
  const id = Number(req.params.id);
  const logo = TODOS_LOS_LOGOS.find((l) => l.id === id);
  if (!logo) return res.status(404).send('Logo no encontrado');
  const slug = logo.slug || normalizar(logo.nombre);
  res.setHeader('Cache-Control', 'public, max-age=86400');

  const local = imagenLocal(slug);
  if (local) {
    res.setHeader('Content-Type', local.tipo);
    return res.sendFile(local.f);
  }
  const icono = ICONOS.get(slug);
  if (icono) {
    svgCache[slug] ??= svgDeMarca(icono);
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(svgCache[slug]);
  }
  // Sin imagen real no se inventa ninguna (antes salía un círculo con la inicial, que delataba la respuesta)
  return res.status(404).send('Sin imagen');
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