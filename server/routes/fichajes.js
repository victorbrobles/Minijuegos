// server/routes/fichajes.js
// «Fichaje exprés» online y contenido del modo un dispositivo. Motor: client/src/games/Fichajes/engine.js.
// Futbolistas de la temporada 2025/26 (los mismos de «Director Deportivo»).
import express from 'express';
import * as E from '../../client/src/games/Fichajes/engine.js';
import { FUTBOLISTAS } from '../data/seeds/director/futbolistas.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';
import { rondasValidas } from '../../client/src/games/rondas.js';

const router = express.Router();
export const BASE = FUTBOLISTAS.filter((f) => E.CLUBES[f.club]).map(({ nombre, club, media, pos, pais }) => ({ nombre, club, media, pos, pais }));

router.get('/local', (req, res) => res.json({ success: true, items: BASE, reglas: { rondas: rondasValidas('fichajes', req.query.r) } }));

const MOTOR = { ...E, crearPartida: (jugadores, items, reglas, ahora) => E.crearPartida(jugadores, items, reglas, ahora) };

montarSalas(router, {
  ...limitesOnline('fichajes'),
  engine: MOTOR,
  config: { rondas: rondasValidas('fichajes') },
  validarConfig: (b, c) => ({ ...c, rondas: rondasValidas('fichajes', b.rondas, c.rondas) }),
  prepararItems: async (sala) => ({ items: BASE, reglas: { rondas: sala.config.rondas } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    switch (d.tipo) {
      case 'empezar': return M.empezar(p, id, ahora);
      case 'responder': return M.responder(p, id, String(d.valor ?? '').slice(0, 60), ahora);
      case 'terminar': return esAdmin ? M.terminar(p) : { ok: false, error: 'Solo el anfitrión.' };
      default: return null;
    }
  }
});

export default router;
