// server/routes/frasescelebres.js
// «Frases Célebres»: sale una frase y cuatro posibles autores; quien pulsa primero elige uno (+3 si acierta, −1 si falla).
// Motor común de pulsador (../pulsador/engine.js) y salas de ../lib/salasJuego.js.
import express from 'express';
import parte1 from '../data/seeds/frasescelebres/parte1.js';
import parte2 from '../data/seeds/frasescelebres/parte2.js';
import parte3 from '../data/seeds/frasescelebres/parte3.js';
import { montarSalas, elegirSinRepetir } from '../lib/salasJuego.js';
import { REGLAS, OPCIONES_RONDAS } from '../pulsador/engine.js';

const router = express.Router();
// Solo frases bien formadas: cuatro autores distintos y el bueno entre ellos.
const FRASES = [...parte1, ...parte2, ...parte3].filter((x) => x.frase && Array.isArray(x.opciones)
  && new Set(x.opciones).size === 4 && x.opciones.includes(x.autor));

const barajar = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const itemDe = (x) => ({
  pistas: [{ tipo: 'frase', etiqueta: '¿Quién lo dijo?', valor: x.frase }],
  opciones: barajar(x.opciones),
  correcta: x.autor,
  solucion: { titulo: x.autor, frase: x.frase }
});
const rondasValidas = (n, def = 10) => (OPCIONES_RONDAS.includes(Number(n)) ? Number(n) : def);

router.get('/local', (req, res) => {
  const items = elegirSinRepetir({ usados: new Set() }, FRASES, rondasValidas(req.query.n), (x) => x.frase).map(itemDe);
  res.json({ success: true, reglas: REGLAS.frasescelebres, items });
});

montarSalas(router, {
  config: { rondas: 10 },
  validarConfig: (b, c) => ({ ...c, rondas: rondasValidas(b.rondas, c.rondas) }),
  reglas: () => REGLAS.frasescelebres,
  prepararItems: async (sala) => elegirSinRepetir(sala, FRASES, sala.config.rondas, (x) => x.frase).map(itemDe)
});

export default router;
