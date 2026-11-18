// server/routes/emojis.js
// Salas online de «Biografía en emojis». Motor puro en client/src/games/Emojis/engine.js.
import express from 'express';
import * as E from '../../client/src/games/Emojis/engine.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const router = express.Router();
const leerConfig = (b, c = { rondas: 10, modo: 'banco' }) => ({
  rondas: E.OPCIONES_RONDAS.includes(Number(b.rondas)) ? Number(b.rondas) : c.rondas,
  modo: E.MODOS.includes(b.modo) ? b.modo : c.modo
});
montarSalas(router, {
  ...limitesOnline('emojis'),
  engine: E,
  sinItems: true,
  config: leerConfig({}),
  validarConfig: (b, c) => leerConfig({ ...c, ...b }, c),
  prepararItems: async (sala) => ({ items: [], reglas: { ...sala.config } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    if (d.tipo === 'forzar') return esAdmin ? M.forzar(p, ahora) : { ok: false, error: 'Solo el anfitrión.' };
    return M.accion(p, id, d, ahora);
  }
});
export default router;
