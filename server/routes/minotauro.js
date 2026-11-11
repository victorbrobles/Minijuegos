// server/routes/minotauro.js
// «El Laberinto · El Minotauro» online: de 3 a 8 jugadores, cada uno con su móvil (lo que ve cada uno es secreto).
// Motor en ../minotauro/engine.js; salas de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../minotauro/engine.js';
import { montarSalas } from '../lib/salasJuego.js';

const router = express.Router();
const leerConfig = (b, c = { turnos: 25 }) => ({ turnos: E.OPCIONES.turnos.includes(Number(b.turnos)) ? Number(b.turnos) : c.turnos });
const MOTOR = { ...E, crearPartida: (jugadores, items, reglas, ahora) => E.crearPartida(jugadores, reglas, ahora) };

montarSalas(router, {
  engine: MOTOR,
  sinItems: true,
  min: E.AJUSTES.min,
  max: E.AJUSTES.max,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: [], reglas: { ...sala.config } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    switch (d.tipo) {
      case 'planificar': return M.planificar(p, id, Array.isArray(d.pasos) ? d.pasos : [], Boolean(d.trampa), ahora);
      case 'deshacer': return M.deshacer(p, id);
      case 'terminar': return esAdmin ? M.terminar(p) : { ok: false, error: 'Solo el anfitrión.' };
      default: return null;
    }
  }
});

export default router;
