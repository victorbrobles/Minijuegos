// server/routes/estelas.js
// Salas online de «Estelas» (tiempo real). El servidor avanza la cuadrícula; POST /online/sala/:code/sync es la
// sincronización rápida (~10 veces por segundo): recibe los giros y devuelve lo nuevo de cada rastro.
import express from 'express';
import * as E from '../../client/src/games/Estelas/engine.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const router = express.Router();
const leerConfig = (b, c = { rondas: 5 }) => ({ rondas: E.OPCIONES_RONDAS.includes(Number(b.rondas)) ? Number(b.rondas) : c.rondas });
const { salas } = montarSalas(router, {
  ...limitesOnline('estelas'),
  engine: E,
  sinItems: true,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: [], reglas: { ...sala.config } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    if (d.tipo === 'forzar') return esAdmin ? M.forzar(p, ahora) : { ok: false, error: 'Solo el anfitrión.' };
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
  const ahora = Date.now();
  if (Array.isArray(req.body?.giros)) req.body.giros.slice(0, 3).forEach((d) => E.girar(p, j.id, d));
  E.tick(p, ahora);
  res.json({ success: true, yo: j.id, ...E.sincronizar(p, j.id, { desde: Number(req.body?.desde ?? -1), ronda: Number(req.body?.ronda) || 0 }, ahora) });
});
export default router;
