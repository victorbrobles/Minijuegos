// server/routes/habilidad.js
// Salas online de «Test de habilidad». Cada móvil juega el minijuego (la misma semilla para todos) y manda su resultado.
import express from 'express';
import * as E from '../../client/src/games/Habilidad/engine.js';
import { IDS, OPCIONES_N } from '../../client/src/games/Habilidad/catalogo.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const router = express.Router();
const leerConfig = (b, c = { n: 5, juegos: [] }) => {
  const n = OPCIONES_N.includes(Number(b.n)) ? Number(b.n) : c.n;
  const juegos = Array.isArray(b.juegos) ? [...new Set(b.juegos.filter((id) => IDS.includes(id)))].slice(0, n) : (c.juegos || []).slice(0, n);
  return { n, juegos };
};

montarSalas(router, {
  ...limitesOnline('habilidad'),
  engine: E,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: E.completarLista(sala.config.juegos, sala.config.n), reglas: { ...sala.config, online: true } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    if (d.tipo === 'forzar') return esAdmin ? M.forzar(p, ahora) : { ok: false, error: 'Solo el anfitrión.' };
    if (d.tipo === 'siguiente' && !esAdmin) return { ok: false, error: 'Lo decide el anfitrión.' };
    return M.accion(p, id, d, ahora);
  }
});

export default router;
