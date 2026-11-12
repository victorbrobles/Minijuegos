// server/routes/datosobra.js
// «El Dato que Sobra» online: uno señala la mentira y los demás pueden desafiarle.
// Motor en ../datosobra/engine.js; salas de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../datosobra/engine.js';
import { FUTBOLISTAS } from '../data/seeds/datosobra/futbolistas.js';
import { montarSalas, elegirSinRepetir } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const router = express.Router();
const barajar = (l) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
/** Mezcla las cuatro afirmaciones y apunta dónde ha quedado la falsa. */
export function itemDe(f) {
  const afirmaciones = barajar([...f.ciertas, f.falsa]);
  return { nombre: f.nombre, afirmaciones, falsa: afirmaciones.indexOf(f.falsa), porque: f.porque };
}
const leerConfig = (b, c = { rondas: 3 }) => ({ rondas: E.OPCIONES.rondas.includes(Number(b.rondas)) ? Number(b.rondas) : c.rondas });

router.get('/local', (req, res) => {
  const n = leerConfig({ rondas: req.query.n }).rondas * Math.max(1, Math.min(20, Number(req.query.j) || 1));
  res.json({ success: true, items: barajar(FUTBOLISTAS).slice(0, n).map(itemDe) });
});

montarSalas(router, {
  ...limitesOnline('datosobra'),
  engine: E,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: elegirSinRepetir(sala, FUTBOLISTAS, sala.config.rondas * sala.jugadores.length, (x) => x.nombre).map(itemDe), reglas: { ...sala.config } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    const soloAdmin = { ok: false, error: 'Solo el anfitrión.' };
    switch (d.tipo) {
      case 'responder': return M.responder(p, id, d.indice, ahora);
      case 'desafiar': return M.desafiar(p, id, d.indice ?? null, ahora);
      case 'siguiente': return esAdmin ? M.siguiente(p, ahora) : soloAdmin;
      case 'terminar': return esAdmin ? M.terminar(p) : soloAdmin;
      default: return null;
    }
  }
});

export default router;
