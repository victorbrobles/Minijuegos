import { Router } from 'express';
import { readFileSync } from 'node:fs';
import { JUEGOS_OCULTOS, puedeVerOcultos } from '../lib/ocultos.js';

const router = Router();
const games = JSON.parse(
  readFileSync(new URL('../data/games.json', import.meta.url), 'utf-8')
);
const visibles = games.filter((g) => !JUEGOS_OCULTOS.includes(g.id));

// Catálogo para pintar la portada (los juegos ocultos, solo para quien tiene acceso)
router.get('/', (req, res) => res.json(puedeVerOcultos(req) ? games : visibles));

export default router;
