// server/routes/constructores.js
// «El Laberinto · Constructores y corredores» online: de 2 a 8 jugadores, cada uno construye y corre en su móvil.
// Motor en ../constructores/engine.js; salas de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../constructores/engine.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const router = express.Router();
const BASE = { rondas: 3, segConstruir: 90, segCarrera: 90, niebla: true };
const leerConfig = (b, c = BASE) => ({
  rondas: E.OPCIONES.rondas.includes(Number(b.rondas)) ? Number(b.rondas) : c.rondas,
  segConstruir: E.OPCIONES.segConstruir.includes(Number(b.segConstruir)) ? Number(b.segConstruir) : c.segConstruir,
  segCarrera: E.OPCIONES.segCarrera.includes(Number(b.segCarrera)) ? Number(b.segCarrera) : c.segCarrera,
  niebla: typeof b.niebla === 'boolean' ? b.niebla : c.niebla
});
const MOTOR = { ...E, crearPartida: (jugadores, items, reglas, ahora) => E.crearPartida(jugadores, reglas, ahora) };

montarSalas(router, {
  ...limitesOnline('constructores'),
  engine: MOTOR,
  sinItems: true,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: [], reglas: { ...sala.config } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    switch (d.tipo) {
      case 'entregar': return M.entregar(p, id, d.lab || {}, ahora);
      case 'retirar': return M.retirarEntrega(p, id);
      case 'pos': return M.posicion(p, id, d.pos);
      case 'llegar': return M.llegar(p, id, Array.isArray(d.movs) ? d.movs : [], ahora);
      case 'rendirse': return M.rendirse(p, id, ahora);
      case 'siguiente': return esAdmin ? M.siguiente(p, ahora) : { ok: false, error: 'Solo el anfitrión.' };
      case 'terminar': return esAdmin ? M.terminar(p) : { ok: false, error: 'Solo el anfitrión.' };
      default: return null;
    }
  }
});

export default router;
