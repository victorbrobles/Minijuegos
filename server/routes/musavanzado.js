// server/routes/musavanzado.js
// «Mus Avanzado» online: pacto de baraja, categorías y apuestas con faroles.
// Motor en ../musavanzado/engine.js; salas de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../musavanzado/engine.js';
import { montarSalas } from '../lib/salasJuego.js';

const router = express.Router();
const leerConfig = (b, c = { modo: 'individual', fichas: 20 }) => ({
  modo: E.OPCIONES.modo.includes(b.modo) ? b.modo : c.modo,
  fichas: E.OPCIONES.fichas.includes(Number(b.fichas)) ? Number(b.fichas) : c.fichas
});
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
      case 'proponer': return M.proponer(p, id, d.cambio || {});
      case 'aceptar': return M.aceptar(p, id, ahora);
      case 'cambiar': return M.cambiar(p, id, Array.isArray(d.ids) ? d.ids : [], ahora);
      case 'anunciar': return M.anunciar(p, id, d.nivel, d.subida, ahora);
      case 'pasar': return M.pasar(p, id, ahora);
      case 'desafiar': return M.desafiar(p, id);
      case 'siguiente': return esAdmin ? M.siguiente(p, ahora) : { ok: false, error: 'Solo el anfitrión.' };
      case 'terminar': return esAdmin ? M.terminar(p) : { ok: false, error: 'Solo el anfitrión.' };
      default: return null;
    }
  }
});

export default router;
