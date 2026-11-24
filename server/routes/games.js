import { Router } from 'express';
import { readFileSync } from 'node:fs';
import { JUEGOS_OCULTOS, puedeVerOcultos } from '../lib/ocultos.js';
import { esAdmin } from '../lib/admin.js';
import { ajustesJuegos } from '../lib/ajustesWeb.js';

const router = Router();
const games = JSON.parse(
  readFileSync(new URL('../data/games.json', import.meta.url), 'utf-8')
);

// Catálogo para pintar la portada (los juegos ocultos, solo para quien tiene acceso). Se aplican los ajustes del
// panel de administración: los juegos «ocultos» desde el panel solo los ve el administrador, y «Nuevo» se puede
// poner o quitar. Los que están en mantenimiento se marcan para avisar al entrar.
router.get('/', (req, res) => {
  const ajustes = ajustesJuegos();
  const admin = esAdmin(req);
  const verOcultos = puedeVerOcultos(req);
  res.set('Cache-Control', 'no-cache');
  res.json(games
    .filter((g) => (verOcultos || !JUEGOS_OCULTOS.includes(g.id)) && (admin || ajustes[g.id]?.estado !== 'oculto'))
    .map((g) => {
      const a = ajustes[g.id];
      if (!a) return g;
      return { ...g, ...(typeof a.nuevo === 'boolean' ? { isNew: a.nuevo } : {}), ...(a.estado && a.estado !== 'normal' ? { estadoPanel: a.estado } : {}) };
    }));
});

export default router;
