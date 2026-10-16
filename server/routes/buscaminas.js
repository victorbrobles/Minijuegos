// server/routes/buscaminas.js
import express from 'express';
import cine from '../data/seeds/buscaminas/cine.js';
import musica from '../data/seeds/buscaminas/musica.js';
import futbol from '../data/seeds/buscaminas/futbol.js';
import deportes from '../data/seeds/buscaminas/deportes.js';
import geografia from '../data/seeds/buscaminas/geografia.js';
import historia from '../data/seeds/buscaminas/historia.js';
import ciencia from '../data/seeds/buscaminas/ciencia.js';
import videojuegos from '../data/seeds/buscaminas/videojuegos.js';
import gastronomia from '../data/seeds/buscaminas/gastronomia.js';
import culturaPop from '../data/seeds/buscaminas/culturaPop.js';

const router = express.Router();

const CATEGORIAS = {
  cine: { nombre: 'Cine y Series', data: cine, icono: 'clapperboard' },
  musica: { nombre: 'Música', data: musica, icono: 'letters' },
  futbol: { nombre: 'Fútbol', data: futbol, icono: 'trophy' },
  deportes: { nombre: 'Otros Deportes', data: deportes, icono: 'speedometer' },
  geografia: { nombre: 'Geografía y Países', data: geografia, icono: 'globe' },
  historia: { nombre: 'Historia y Arte', data: historia, icono: 'detective' },
  ciencia: { nombre: 'Ciencia y Naturaleza', data: ciencia, icono: 'whois' },
  videojuegos: { nombre: 'Videojuegos', data: videojuegos, icono: 'zap' },
  gastronomia: { nombre: 'Comida y Gastronomía', data: gastronomia, icono: 'star' },
  culturaPop: { nombre: 'Famosos y Cultura Pop', data: culturaPop, icono: 'users' }
};

function barajar(array) {
  const c = [...array];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

// GET /api/buscaminas/categorias
router.get('/categorias', (req, res) => {
  const lista = Object.entries(CATEGORIAS).map(([id, info]) => ({
    id,
    nombre: info.nombre,
    icono: info.icono,
    totalTableros: info.data.length
  }));
  res.json({ success: true, categorias: lista });
});

// POST /api/buscaminas/tablero  { categoria, usados }
router.post('/tablero', (req, res) => {
  try {
    const { categoria, usados = [] } = req.body || {};
    const cat = CATEGORIAS[categoria] || CATEGORIAS.cine;
    const disponibles = cat.data.filter((t) => !usados.includes(t.id));
    const pool = disponibles.length > 0 ? disponibles : cat.data;
    const elegido = barajar(pool)[0];

    // Mapear elementos: 10 correctos clasificados + 5 trampas
    const casillas = [];

    elegido.correctos.faciles.forEach((txt) => casillas.push({ texto: txt, correcto: true, dificultad: 'facil', puntos: 1 }));
    elegido.correctos.medios.forEach((txt) => casillas.push({ texto: txt, correcto: true, dificultad: 'medio', puntos: 2 }));
    elegido.correctos.dificiles.forEach((txt) => casillas.push({ texto: txt, correcto: true, dificultad: 'dificil', puntos: 3 }));
    elegido.trampas.forEach((txt) => casillas.push({ texto: txt, correcto: false, dificultad: 'trampa', puntos: 0 }));

    res.json({
      success: true,
      tableroId: elegido.id,
      consigna: elegido.consigna,
      categoriaNombre: cat.nombre,
      casillas: barajar(casillas)
    });
  } catch (error) {
    console.error('Error al generar tablero buscaminas:', error);
    res.status(500).json({ success: false, error: 'Error del servidor' });
  }
});

export default router;