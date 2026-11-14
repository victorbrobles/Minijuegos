// server/routes/piramides.js
// Salas online de «Piramides». Motor puro en client/src/games/Piramides/engine.js; salas comunes de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../../client/src/games/Piramides/engine.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';
import { misterioso } from '../lib/solo.js';
const router = express.Router();
const leerConfig = (b, c = { vueltas: 4 }) => ({ vueltas: E.OPCIONES_VUELTAS.includes(Number(b.vueltas)) ? Number(b.vueltas) : c.vueltas });
montarSalas(router, {
  ...limitesOnline('piramides'),
  engine: E,
  sinItems: true,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: misterioso().futbolistas, reglas: { ...sala.config } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    if (d.tipo === 'forzar') return esAdmin ? M.forzar(p, ahora) : { ok: false, error: 'Solo el anfitrión.' };
    if (d.tipo === 'terminar') return esAdmin ? M.terminar(p) : { ok: false, error: 'Solo el anfitrión.' };
    return M.accion(p, id, d, ahora);
  }
});
// Futbolistas para el modo un dispositivo
router.get('/local', (req, res) => res.json({ success: true, futbolistas: misterioso().futbolistas }));
export default router;
