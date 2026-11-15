// server/routes/garabato.js
// Salas online de «Garabato Encadenado». Motor puro en client/src/games/Garabato/engine.js.
// Los dibujos no van en cada consulta de la sala: se piden una vez con GET /online/sala/:code/dibujo/:id.
import express from 'express';
import * as E from '../../client/src/games/Garabato/engine.js';
import { FRASES } from '../../client/src/games/Garabato/frases.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const router = express.Router();
const tiempos = E.OPCIONES_TIEMPO.map(([k]) => k);
const leerConfig = (b, c = { tiempo: 'normal' }) => ({ tiempo: tiempos.includes(b.tiempo) ? b.tiempo : c.tiempo });

const { salas } = montarSalas(router, {
  ...limitesOnline('garabato'),
  engine: E,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: [...FRASES], reglas: { ...sala.config, online: true } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    if (d.tipo === 'forzar') return esAdmin ? M.forzar(p, ahora) : { ok: false, error: 'Solo el anfitrión.' };
    if (d.tipo === 'siguiente' && !esAdmin) return { ok: false, error: 'El anfitrión pasa las cadenas.' };
    return M.accion(p, id, d, ahora);
  }
});

router.get('/online/sala/:code/dibujo/:id', (req, res) => {
  const p = salas[String(req.params.code).toUpperCase()]?.partida;
  const d = p && E.dibujoPublico(p, String(req.params.id));
  if (!d) return res.status(404).json({ error: 'Dibujo no disponible.' });
  res.set('Cache-Control', 'private, max-age=3600');
  res.json({ success: true, trazos: d.trazos });
});

export default router;
