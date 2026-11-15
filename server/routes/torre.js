// server/routes/torre.js
// Salas online de «Torre Inestable». Motor puro en client/src/games/Torre/engine.js; la física (cannon-es) la
// simula el servidor en cada caída y los móviles la repiten para animarla.
import express from 'express';
import * as CANNON from 'cannon-es';
import * as E from '../../client/src/games/Torre/engine.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

E.usarFisica(CANNON);
const router = express.Router();
const leerConfig = (b, c = { rondas: 3 }) => ({ rondas: E.OPCIONES_RONDAS.includes(Number(b.rondas)) ? Number(b.rondas) : c.rondas });

montarSalas(router, {
  ...limitesOnline('torre'),
  engine: E,
  sinItems: true,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: [], reglas: { ...sala.config, online: true } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    if (d.tipo === 'forzar') return esAdmin ? M.forzar(p, ahora) : { ok: false, error: 'Solo el anfitrión.' };
    if (d.tipo === 'terminar') return esAdmin ? M.terminar(p) : { ok: false, error: 'Solo el anfitrión.' };
    return M.accion(p, id, d, ahora);
  }
});

export default router;
