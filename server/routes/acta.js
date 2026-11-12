// server/routes/acta.js
// «Acta del Partido»: el acta de un partido histórico se destapa línea a línea; adivina qué partido es.
// Motor común de pulsador (../pulsador/engine.js) y salas de ../lib/salasJuego.js.
import express from 'express';
import { PARTIDOS } from '../data/seeds/acta/partidos.js';
import { montarSalas, elegirSinRepetir } from '../lib/salasJuego.js';
import { REGLAS, OPCIONES_RONDAS } from '../pulsador/engine.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const router = express.Router();
const itemDe = (x) => ({
  pistas: x.acta.map((linea, i) => ({ tipo: 'texto', etiqueta: `📋 Acta · dato ${i + 1}`, valor: linea })),
  respuestas: [x.nombre],
  claves: x.claves,
  solucion: { titulo: x.nombre, detalle: x.detalle }
});
const rondasValidas = (n, def = 10) => (OPCIONES_RONDAS.includes(Number(n)) ? Number(n) : def);

router.get('/local', (req, res) => {
  const items = elegirSinRepetir({ usados: new Set() }, PARTIDOS, rondasValidas(req.query.n), (x) => `${x.nombre}|${x.detalle}`).map(itemDe);
  res.json({ success: true, reglas: REGLAS.acta, items });
});

montarSalas(router, {
  ...limitesOnline('acta'),
  config: { rondas: 10 },
  validarConfig: (b, c) => ({ ...c, rondas: rondasValidas(b.rondas, c.rondas) }),
  reglas: () => REGLAS.acta,
  prepararItems: async (sala) => elegirSinRepetir(sala, PARTIDOS, sala.config.rondas, (x) => `${x.nombre}|${x.detalle}`).map(itemDe)
});

export default router;
