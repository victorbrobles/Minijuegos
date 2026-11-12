// server/routes/reinos.js
// «Los Siete Reinos» online: de 2 a 7 reinos, cada uno desde su móvil y con sus órdenes en secreto.
// Motor en ../reinos/engine.js; salas de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../reinos/engine.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const router = express.Router();
const leerConfig = (b, c = { rondas: 8 }) => ({ rondas: E.OPCIONES_RONDAS.includes(Number(b.rondas)) ? Number(b.rondas) : c.rondas });

// El motor no usa «items»: se adapta la firma que esperan las salas comunes.
const MOTOR = { ...E, crearPartida: (jugadores, items, reglas, ahora) => E.crearPartida(jugadores, reglas, ahora) };

montarSalas(router, {
  ...limitesOnline('reinos'),
  engine: MOTOR,
  sinItems: true,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: [], reglas: { ...sala.config } }),
  accion: (M, p, d, { id, esAdmin }) => {
    const soloAdmin = { ok: false, error: 'Solo el anfitrión.' };
    switch (d.tipo) {
      case 'ordenar': return M.ordenar(p, id, Array.isArray(d.acciones) ? d.acciones.slice(0, 4) : []);
      case 'retirar': return M.retirar(p, id);
      case 'responder': return M.responder(p, id, d.propuesta, Boolean(d.acepta));
      case 'seguir': return M.seguir(p, id);
      case 'forzar': return esAdmin ? M.forzar(p) : soloAdmin;
      case 'terminar': return esAdmin ? M.terminar(p) : soloAdmin;
      default: return null;
    }
  }
});

export default router;
