// server/routes/unapieza.js
// «Una Pieza Más» online: tablero compartido y turnos para colocar piezas en la silueta.
// Motor en ../unapieza/engine.js (las siluetas viven en el propio motor); salas de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../unapieza/engine.js';
import { montarSalas, elegirSinRepetir } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const router = express.Router();
const leerConfig = (b, c = { rondas: 3, segundos: 60 }) => ({
  rondas: E.OPCIONES.rondas.includes(Number(b.rondas)) ? Number(b.rondas) : c.rondas,
  segundos: E.OPCIONES.segundos.includes(Number(b.segundos)) ? Number(b.segundos) : c.segundos
});

montarSalas(router, {
  ...limitesOnline('unapieza'),
  engine: E,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: elegirSinRepetir(sala, E.FIGURAS, sala.config.rondas), reglas: { ...sala.config } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    const soloAdmin = { ok: false, error: 'Solo el anfitrión.' };
    switch (d.tipo) {
      case 'colocar': return M.colocar(p, id, d, ahora);
      case 'pasar': return M.pasar(p, id, d.cambiar ?? null, ahora);
      case 'siguiente': return esAdmin ? M.siguiente(p, ahora) : soloAdmin;
      case 'terminar': return esAdmin ? M.terminar(p) : soloAdmin;
      default: return null;
    }
  }
});

export default router;
