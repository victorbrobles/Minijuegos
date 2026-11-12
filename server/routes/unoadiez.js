// server/routes/unoadiez.js
// «Del 1 al 10...»: adivina el número secreto con los ejemplos que van dando los demás.
// Motor en ../unoadiez/engine.js; salas online de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../unoadiez/engine.js';
import { CATEGORIAS_1_AL_10 } from '../data/seeds/unoadiez/unoadiez.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const router = express.Router();
const barajar = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const CATEGORIAS = [...new Set(CATEGORIAS_1_AL_10)];
const leerConfig = (b, c = { vueltas: 3 }) => ({ vueltas: E.OPCIONES_VUELTAS.includes(Number(b.vueltas)) ? Number(b.vueltas) : c.vueltas });

router.get('/categorias', (req, res) => res.json({ success: true, categorias: barajar(CATEGORIAS) }));

montarSalas(router, {
  ...limitesOnline('unoadiez'),
  engine: E,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: barajar(CATEGORIAS), reglas: { vueltas: sala.config.vueltas } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    const soloAdmin = { ok: false, error: 'Solo el anfitrión puede hacerlo.' };
    switch (d.tipo) {
      case 'pista': return M.darPista(p, id, d.texto, ahora);
      case 'otra': return M.otraPista(p, id, ahora);
      case 'adivinar': return M.adivinar(p, id, d.numero);
      case 'siguiente': return esAdmin || p.adivinador === id ? M.siguiente(p, ahora) : { ok: false, error: 'Pasa de turno el anfitrión o quien ha adivinado.' };
      case 'terminar': return esAdmin ? M.terminar(p) : soloAdmin;
      default: return null;
    }
  }
});

export default router;
