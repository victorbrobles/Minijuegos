// server/routes/masmenos.js
import express from 'express';
import geo1 from '../data/seeds/masmenos/geografia1.js';
import geo2 from '../data/seeds/masmenos/geografia2.js';
import hist1 from '../data/seeds/masmenos/historia1.js';
import hist2 from '../data/seeds/masmenos/historia2.js';
import cine1 from '../data/seeds/masmenos/cine1.js';
import cine2 from '../data/seeds/masmenos/cine2.js';
import mus1 from '../data/seeds/masmenos/musica1.js';
import mus2 from '../data/seeds/masmenos/musica2.js';
import dep1 from '../data/seeds/masmenos/deportes1.js';
import dep2 from '../data/seeds/masmenos/deportes2.js';
import cien1 from '../data/seeds/masmenos/ciencia1.js';
import cien2 from '../data/seeds/masmenos/ciencia2.js';
import econ1 from '../data/seeds/masmenos/economia1.js';
import econ2 from '../data/seeds/masmenos/economia2.js';
import tec1 from '../data/seeds/masmenos/tecnologia1.js';
import tec2 from '../data/seeds/masmenos/tecnologia2.js';
import nat1 from '../data/seeds/masmenos/naturaleza1.js';
import nat2 from '../data/seeds/masmenos/naturaleza2.js';
import cult1 from '../data/seeds/masmenos/cultura1.js';
import cult2 from '../data/seeds/masmenos/cultura2.js';

const router = express.Router();

const CATEGORIAS = {
  geografia: { nombre: 'Geografía y Demografía', icono: 'globe', data: [...geo1, ...geo2] },
  historia: { nombre: 'Historia y Guerras', icono: 'hourglass', data: [...hist1, ...hist2] },
  cine: { nombre: 'Cine y Taquilla', icono: 'clapperboard', data: [...cine1, ...cine2] },
  musica: { nombre: 'Música y Ventas', icono: 'music', data: [...mus1, ...mus2] },
  deportes: { nombre: 'Deportes y Récords', icono: 'trophy', data: [...dep1, ...dep2] },
  ciencia: { nombre: 'Ciencia y Universo', icono: 'flask', data: [...cien1, ...cien2] },
  economia: { nombre: 'Economía y Riqueza', icono: 'chart', data: [...econ1, ...econ2] },
  tecnologia: { nombre: 'Tecnología y Redes', icono: 'chip', data: [...tec1, ...tec2] },
  naturaleza: { nombre: 'Animales y Naturaleza', icono: 'paw', data: [...nat1, ...nat2] },
  cultura: { nombre: 'Cultura y Arquitectura', icono: 'tower', data: [...cult1, ...cult2] }
};

function barajarArray(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// GET /api/masmenos/categorias
router.get('/categorias', (req, res) => {
  const lista = Object.entries(CATEGORIAS).map(([id, info]) => ({
    id,
    nombre: info.nombre,
    icono: info.icono,
    totalElementos: info.data.length
  }));
  res.json({ success: true, categorias: lista });
});

// POST /api/masmenos/partida { categoria: 'geografia' }
router.post('/partida', (req, res) => {
  const { categoria } = req.body || {};
  const cat = CATEGORIAS[categoria] || CATEGORIAS.geografia;
  const poolBarajado = barajarArray(cat.data);

  res.json({
    success: true,
    categoria: cat.nombre,
    elementos: poolBarajado
  });
});

export default router;