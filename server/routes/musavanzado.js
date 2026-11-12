// server/routes/musavanzado.js
// «Mus Avanzado» online: la mano se conserva entre categorías y se habla como en el mus.
// Motor en ../musavanzado/engine.js; salas de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../musavanzado/engine.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const router = express.Router();
const BASE = { modo: 'individual', objetivo: 30, categorias: [...E.ORDEN_CATEGORIAS], especiales: {} };
/** El anfitrión configura modo, puntos, categorías (mínimo 3) y cartas especiales. */
const leerConfig = (b = {}, c = BASE) => {
  const cats = Array.isArray(b.categorias) ? E.ORDEN_CATEGORIAS.filter((x) => b.categorias.includes(x)) : c.categorias;
  return {
    modo: E.OPCIONES.modo.includes(b.modo) ? b.modo : c.modo,
    objetivo: E.OPCIONES.objetivo.includes(Number(b.objetivo)) ? Number(b.objetivo) : c.objetivo,
    categorias: cats.length >= 3 ? cats : c.categorias,
    especiales: b.especiales && typeof b.especiales === 'object'
      ? Object.fromEntries(Object.keys(E.ESPECIALES).map((k) => [k, Boolean(b.especiales[k])]))
      : c.especiales
  };
};
const MOTOR = { ...E, crearPartida: (jugadores, items, reglas, ahora) => E.crearPartida(jugadores, reglas, ahora) };

montarSalas(router, {
  ...limitesOnline('musavanzado'),
  engine: MOTOR,
  sinItems: true,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: [], reglas: { ...sala.config } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    switch (d.tipo) {
      case 'cambiar': return M.cambiar(p, id, Array.isArray(d.ids) ? d.ids : [], ahora);
      case 'hablar': return M.hablar(p, id, { tipo: d.accion, cantidad: d.cantidad }, ahora);
      case 'siguiente': return esAdmin ? M.siguiente(p, ahora) : { ok: false, error: 'Solo el anfitrión.' };
      case 'terminar': return esAdmin ? M.terminar(p) : { ok: false, error: 'Solo el anfitrión.' };
      default: return null;
    }
  }
});

export default router;
