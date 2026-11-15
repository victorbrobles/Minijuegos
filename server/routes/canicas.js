// server/routes/canicas.js
// Salas online de «Carrera de Canicas». Cada móvil simula su canica; POST /online/sala/:code/sync es la
// sincronización rápida (posiciones, rayos y manchas de aceite), ~8 veces por segundo.
import express from 'express';
import * as E from '../../client/src/games/Canicas/engine.js';
import { IDS_CIRCUITOS } from '../../client/src/games/Canicas/circuitos.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const router = express.Router();
const leerConfig = (b, c = { carreras: 3 }) => ({ carreras: E.OPCIONES_CARRERAS.includes(Number(b.carreras)) ? Number(b.carreras) : c.carreras });
const barajar = (l) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const { salas } = montarSalas(router, {
  ...limitesOnline('canicas'),
  engine: E,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: barajar(IDS_CIRCUITOS), reglas: { ...sala.config, online: true } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    if (d.tipo === 'forzar') return esAdmin ? M.forzar(p, ahora) : { ok: false, error: 'Solo el anfitrión.' };
    if (d.tipo === 'siguiente' && !esAdmin) return { ok: false, error: 'Lo decide el anfitrión.' };
    return M.accion(p, id, d, ahora);
  }
});

router.post('/online/sala/:code/sync', (req, res) => {
  const sala = salas[String(req.params.code || '').toUpperCase()];
  const j = sala?.jugadores.find((x) => x.token === req.body?.token);
  if (!sala || !j) return res.status(404).json({ error: 'Sala no encontrada.' });
  j.visto = Date.now(); sala.ultimaActividad = Date.now();
  const p = sala.partida;
  if (!p || sala.estado !== 'jugando') return res.json({ success: true, fase: 'sala' });
  E.tick(p, Date.now());
  res.json({ success: true, ...E.sincronizar(p, j.id, req.body?.s, Number(req.body?.desde) || 0) });
});

export default router;
