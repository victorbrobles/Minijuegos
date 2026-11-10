// server/routes/hemeroteca.js
// «La Hemeroteca»: un titular con palabras ocultas; las pistas (época, protagonista, iniciales) se destapan solas.
// Motor común de pulsador (../pulsador/engine.js) y salas de ../lib/salasJuego.js.
import express from 'express';
import { TITULARES } from '../data/seeds/hemeroteca/titulares.js';
import { montarSalas, elegirSinRepetir } from '../lib/salasJuego.js';
import { REGLAS, OPCIONES_RONDAS } from '../pulsador/engine.js';

const router = express.Router();
const oculto = (t) => t.replace(/\{([^}]+)\}/g, (_, x) => x.replace(/[^\s,.]/g, '_').replace(/_/g, '＿'));
const iniciales = (t) => t.replace(/\{([^}]+)\}/g, (_, x) => x.split(' ').map((w) => (w ? `${w[0]}${'＿'.repeat(Math.max(0, w.length - 1))}` : w)).join(' '));
const decada = (a) => { const d = Math.floor(a / 10) * 10; return d < 2000 ? `Años ${String(d).slice(2)} del siglo ${a < 1500 ? 'XV' : a < 1900 ? 'XIX' : 'XX'}` : `Década de ${d}`; };
const completo = (t) => t.replace(/[{}]/g, '');
const hueco = (t) => (t.match(/\{([^}]+)\}/) || [])[1] || '';

export function itemDe(x) {
  return {
    pistas: [
      { tipo: 'frase', etiqueta: `📰 ${x.cat}`, valor: oculto(x.t) },
      { tipo: 'texto', etiqueta: 'Época', valor: decada(x.anio) },
      { tipo: 'texto', etiqueta: 'Pista', valor: `${x.pista} (${x.anio})` },
      { tipo: 'hueco', etiqueta: 'Las iniciales', valor: iniciales(x.t) }
    ],
    respuestas: [hueco(x.t)],
    claves: x.claves,
    solucion: { titulo: completo(x.t), detalle: `${x.cat} · ${x.anio}` }
  };
}
const rondasValidas = (n, def = 10) => (OPCIONES_RONDAS.includes(Number(n)) ? Number(n) : def);

router.get('/local', (req, res) => {
  const items = elegirSinRepetir({ usados: new Set() }, TITULARES, rondasValidas(req.query.n), (x) => x.t).map(itemDe);
  res.json({ success: true, reglas: REGLAS.hemeroteca, items });
});

montarSalas(router, {
  config: { rondas: 10 },
  validarConfig: (b, c) => ({ ...c, rondas: rondasValidas(b.rondas, c.rondas) }),
  reglas: () => REGLAS.hemeroteca,
  prepararItems: async (sala) => elegirSinRepetir(sala, TITULARES, sala.config.rondas, (x) => x.t).map(itemDe)
});

export default router;
