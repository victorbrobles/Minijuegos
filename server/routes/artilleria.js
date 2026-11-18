// server/routes/artilleria.js
// Salas online de «Artillería». Motor puro en client/src/games/Artilleria/engine.js; salas comunes de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../../client/src/games/Artilleria/engine.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const router = express.Router();
montarSalas(router, {
  ...limitesOnline('artilleria'),
  engine: E,
  sinItems: true,
  config: {},
  validarConfig: () => ({}),
  prepararItems: async () => ({ items: [], reglas: {} }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    if (d.tipo === 'forzar') return esAdmin ? M.forzar(p, ahora) : { ok: false, error: 'Solo el anfitrión.' };
    return M.accion(p, id, d, ahora);
  }
});
export default router;
