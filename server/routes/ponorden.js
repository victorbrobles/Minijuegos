// server/routes/ponorden.js
// «Ponlo en orden» online y contenido del modo un dispositivo. Motor: client/src/games/PonOrden/engine.js.
import express from 'express';
import { M } from '../../client/src/games/PonOrden/engine.js';
import { accionSimultaneo } from '../../client/src/games/comun/simultaneo.js';
import { TEMAS, separados } from '../data/seeds/ordenar/temas.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';
import { rondasValidas, totalRondas } from '../../client/src/games/rondas.js';

const router = express.Router();
const barajar = (l) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/** Seis elementos del tema con valores bien separados (así el orden no tiene dudas). */
export function ronda(tema) {
  for (let intento = 0; intento < 200; intento++) {
    const elegidos = [];
    for (const it of barajar(tema.items)) {
      if (elegidos.every((e) => separados(tema, e[1], it[1]))) elegidos.push(it);
      if (elegidos.length === 6) break;
    }
    if (elegidos.length === 6) {
      const desc = Math.random() < 0.35;
      return {
        titulo: tema.titulo, emoji: tema.emoji, criterio: desc ? tema.mayor : tema.criterio, unidad: tema.unidad, desc,
        elementos: barajar(elegidos).map(([nombre, valor]) => ({ nombre, valor }))
      };
    }
  }
  throw new Error(`Tema sin seis elementos separados: ${tema.id}`);
}

/** n rondas sin repetir tema seguido (y repartiendo los temas). */
export function elegir(n) {
  const out = [];
  let bolsa = [];
  while (out.length < n) {
    if (!bolsa.length) bolsa = barajar(TEMAS);
    const t = bolsa.shift();
    if (out.length && out[out.length - 1].titulo === t.titulo && bolsa.length) { bolsa.push(t); continue; }
    out.push(ronda(t));
  }
  return out;
}

router.get('/local', (req, res) => res.json({ success: true, items: elegir(totalRondas('ponorden', req.query.r)) }));

montarSalas(router, {
  ...limitesOnline('ponorden'),
  engine: M,
  config: { rondas: rondasValidas('ponorden') },
  validarConfig: (b, c) => ({ ...c, rondas: rondasValidas('ponorden', b.rondas, c.rondas) }),
  reglas: () => ({}),
  prepararItems: async (sala) => elegir(totalRondas('ponorden', sala.config.rondas)),
  accion: accionSimultaneo
});

export default router;
