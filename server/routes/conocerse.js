// server/routes/conocerse.js
// «Qué malo es conocerse» online: cada uno responde y elige desde su móvil. Motor puro en
// client/src/games/Conocerse/engine.js; salas comunes de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../../client/src/games/Conocerse/engine.js';
import { PREGUNTAS } from '../../client/src/games/Conocerse/preguntas.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const router = express.Router();
const leerConfig = (b, c = { vueltas: 3 }) => ({ vueltas: E.OPCIONES.vueltas.includes(Number(b.vueltas)) ? Number(b.vueltas) : c.vueltas });
const MOTOR = { ...E, crearPartida: (jugadores, items, reglas, ahora) => E.crearPartida(jugadores, PREGUNTAS, reglas, ahora) };

montarSalas(router, {
  ...limitesOnline('conocerse'),
  engine: MOTOR,
  sinItems: true,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: [], reglas: { ...sala.config } }),
  accion: (M, p, d, { id, esAdmin }) => {
    const soloAdmin = { ok: false, error: 'Solo el anfitrión.' };
    switch (d.tipo) {
      case 'siguiente': return esAdmin ? M.siguiente(p) : soloAdmin;
      case 'forzar': return esAdmin ? M.forzar(p) : soloAdmin;
      case 'terminar': return esAdmin ? M.terminar(p) : soloAdmin;
      default: return M.accion(p, id, d, { esAdmin }) ?? { ok: false, error: 'Acción desconocida.' };
    }
  }
});

export default router;
