import { Router } from 'express';
import { LUGARES } from '../data/seeds/ubicacion/ubicacion.seed.js';
import { barajar } from '../lib/barajar.js';

const router = Router();

// GET /api/ubicacion/lote?n=16
// Devuelve n lugares al azar (de más: el cliente descarta los que no tengan foto libre).
router.get('/lote', (req, res) => {
  const pedidos = parseInt(req.query.n, 10) || 16;
  const n = Math.min(Math.max(pedidos, 1), LUGARES.length);
  res.json(barajar(LUGARES).slice(0, n));
});

export default router;
