// server/routes/minigolf.js
// Salas online de «Minigolf». La bola la simula cada móvil; el servidor lleva el marcador, los turnos y el reloj.
import express from 'express';
import fs from 'fs';
import * as E from '../../client/src/games/Minigolf/engine.js';
import { elegirRecorrido } from '../../client/src/games/Minigolf/hoyos.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const SEMILLAS = JSON.parse(fs.readFileSync(new URL('../../client/src/games/Minigolf/semillas.json', import.meta.url), 'utf8'));
const router = express.Router();
const leerConfig = (b, c = { hoyos: 9 }) => ({ hoyos: E.OPCIONES_HOYOS.includes(Number(b.hoyos)) ? Number(b.hoyos) : c.hoyos });

montarSalas(router, {
  ...limitesOnline('minigolf'),
  engine: E,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: elegirRecorrido(SEMILLAS), reglas: { ...sala.config, online: true } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    if (d.tipo === 'forzar') return esAdmin ? M.forzar(p, ahora) : { ok: false, error: 'Solo el anfitrión.' };
    if (d.tipo === 'siguiente' && !esAdmin) return { ok: false, error: 'El anfitrión pasa de hoyo.' };
    return M.accion(p, id, d, ahora);
  }
});

export default router;
