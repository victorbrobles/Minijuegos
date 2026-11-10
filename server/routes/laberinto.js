// server/routes/laberinto.js
// «El Laberinto» online: de 2 a 4 exploradores, por turnos, cada uno desde su móvil.
// Motor en ../laberinto/engine.js; salas de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../laberinto/engine.js';
import { montarSalas } from '../lib/salasJuego.js';

const router = express.Router();
export const OPCIONES_RONDAS = [20, 30, 40];
const leerConfig = (b, c = { rondasMax: 30 }) => ({ rondasMax: OPCIONES_RONDAS.includes(Number(b.rondasMax)) ? Number(b.rondasMax) : c.rondasMax });
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
      case 'mover': return M.mover(p, id, d.sala, ahora);
      case 'robar': return M.robar(p, id, d.victima, ahora);
      case 'cepo': return M.ponerCepo(p, id);
      case 'barricada': return M.barricada(p, id, d.sala);
      case 'teletransporte': return M.teletransporte(p, id, d.sala, ahora);
      case 'pacto': return M.proponerPacto(p, id, d.a);
      case 'responderPacto': return M.responderPacto(p, id, d.propuesta, Boolean(d.acepta));
      case 'fin': return M.terminarTurno(p, id, ahora);
      case 'forzar': return esAdmin ? M.terminarTurno(p, p.turno?.jugadorId, ahora) : { ok: false, error: 'Solo el anfitrión.' };
      case 'terminar': return esAdmin ? M.terminar(p) : { ok: false, error: 'Solo el anfitrión.' };
      default: return null;
    }
  }
});

export default router;
