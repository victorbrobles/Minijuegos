// server/routes/invento.js
// «El Invento del Siglo» online: cada uno inventa desde su móvil y se vota en anónimo.
// Motor en ../invento/engine.js; salas de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../invento/engine.js';
import { OBJETOS, PROBLEMAS, RASGOS } from '../data/seeds/invento/cartas.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const router = express.Router();
export const MAZOS = { objeto: OBJETOS, problema: PROBLEMAS, rasgo: RASGOS };
const leerConfig = (b, c = { rondas: 3, segundos: 180 }) => ({
  rondas: E.OPCIONES.rondas.includes(Number(b.rondas)) ? Number(b.rondas) : c.rondas,
  segundos: E.OPCIONES.segundos.includes(Number(b.segundos)) ? Number(b.segundos) : c.segundos
});

// Un solo dispositivo: el cliente juega con el motor copiado y pide aquí las cartas.
router.get('/cartas', (req, res) => res.json({ success: true, mazos: MAZOS }));

const MOTOR = { ...E, crearPartida: (jugadores, items, reglas, ahora) => E.crearPartida(jugadores, MAZOS, reglas, ahora) };

montarSalas(router, {
  ...limitesOnline('invento'),
  engine: MOTOR,
  sinItems: true,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: [], reglas: { ...sala.config } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    const soloAdmin = { ok: false, error: 'Solo el anfitrión.' };
    switch (d.tipo) {
      case 'cambiar': return M.cambiarCarta(p, id, d.carta);
      case 'inventar': return M.inventar(p, id, d.nombre, d.desc, ahora);
      case 'retirar': return M.retirar(p, id);
      case 'votar': return M.votar(p, id, d.votos);
      case 'siguiente': return esAdmin ? M.siguiente(p, ahora) : soloAdmin;
      case 'forzar': return esAdmin ? M.forzar(p, ahora) : soloAdmin;
      case 'terminar': return esAdmin ? M.terminar(p) : soloAdmin;
      default: return null;
    }
  }
});

export default router;
