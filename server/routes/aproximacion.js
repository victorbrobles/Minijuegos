import { Router } from 'express';
import { PREGUNTAS } from '../data/seeds/aproximacion/aproximacion.seed.js';
import { barajar } from '../lib/barajar.js';

const router = Router();

// GET /api/aproximacion/preguntas
// Devuelve un lote barajado de preguntas
router.get('/preguntas', (req, res) => {
  const barajadas = barajar([...PREGUNTAS]);
  res.json(barajadas);
});

// GET /api/aproximacion/aleatoria
router.get('/aleatoria', (req, res) => {
  const index = Math.floor(Math.random() * PREGUNTAS.length);
  res.json(PREGUNTAS[index]);
});

export default router;