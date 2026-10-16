import { Router } from 'express';
import { readFileSync } from 'node:fs';

const router = Router();
const games = JSON.parse(
  readFileSync(new URL('../data/games.json', import.meta.url), 'utf-8')
);

// Catálogo para pintar la portada
router.get('/', (_req, res) => res.json(games));

export default router;
