// server/routes/intruso.js
// «El Intruso Histórico» online y contenido del modo un dispositivo. Motor: client/src/games/Intruso/engine.js.
// Mitad de las rondas por ÉPOCA (temas con año de ../data/seeds/ordenar/temas.js) y mitad por CATEGORÍA.
import express from 'express';
import { M } from '../../client/src/games/Intruso/engine.js';
import { accionSimultaneo } from '../../client/src/games/comun/simultaneo.js';
import { TEMAS } from '../data/seeds/ordenar/temas.js';
import { GRUPOS } from '../data/seeds/intruso/grupos.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';
import { rondasValidas, totalRondas } from '../../client/src/games/rondas.js';

const router = express.Router();
const barajar = (l) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const romano = (n) => [['M', 1000], ['CM', 900], ['D', 500], ['CD', 400], ['C', 100], ['XC', 90], ['L', 50], ['XL', 40], ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]]
  .reduce((acc, [r, v]) => { while (n >= v) { acc += r; n -= v; } return acc; }, '');
const siglo = (a) => (a > 0 ? Math.floor((a - 1) / 100) + 1 : -(Math.floor((-a - 1) / 100) + 1));
const textoAno = (a) => (a < 0 ? `${-a} a. C.` : `${a}`);
const EPOCAS = TEMAS.filter((t) => t.epoca);

/** Cuatro de la misma época (siglo o década) y uno de otra bien distinta. */
export function porEpoca(tema) {
  const clave = (a) => (tema.epoca === 'siglo' ? siglo(a) : Math.floor(a / 10));
  const grupos = {};
  tema.items.forEach((it) => { (grupos[clave(it[1])] ||= []).push(it); });
  const validos = barajar(Object.entries(grupos).filter(([, l]) => l.length >= 4));
  for (const [k, lista] of validos) {
    const cuatro = barajar(lista).slice(0, 4);
    const lejos = tema.epoca === 'siglo' ? 40 : 10;
    const fuera = barajar(tema.items.filter((it) => String(clave(it[1])) !== k && cuatro.every((c) => Math.abs(c[1] - it[1]) >= lejos)))[0];
    if (!fuera) continue;
    const opciones = barajar([...cuatro, fuera]);
    const nombreEpoca = tema.epoca === 'siglo'
      ? (Number(k) > 0 ? `del siglo ${romano(Number(k))}` : `del siglo ${romano(-Number(k))} a. C.`)
      : `de los años ${Number(k) * 10 >= 2000 ? Number(k) * 10 : String(Number(k) * 10).slice(-2)}`;
    return {
      titulo: tema.titulo, emoji: tema.emoji, pregunta: `Cuatro son ${nombreEpoca}. ¿Cuál no es de esa época?`,
      opciones: opciones.map((x) => x[0]), intruso: opciones.indexOf(fuera),
      explicacion: opciones.map((x) => `${x[0]}: ${textoAno(x[1])}`).join(' · ')
    };
  }
  return null;
}

export function porCategoria(g) {
  const cuatro = barajar(g.buenos).slice(0, 4);
  const fuera = barajar(g.intrusos)[0];
  const opciones = barajar([...cuatro, fuera]);
  return {
    titulo: g.titulo, emoji: g.emoji, pregunta: `${g.titulo}: ¿cuál no encaja?`,
    opciones, intruso: opciones.indexOf(fuera), explicacion: `${fuera} ${g.porque}.`
  };
}

export function elegir(n) {
  const out = [];
  let temas = []; let grupos = [];
  while (out.length < n) {
    if (out.length % 2 === 0) {
      if (!temas.length) temas = barajar(EPOCAS);
      const it = porEpoca(temas.shift());
      if (it) out.push(it);
    } else {
      if (!grupos.length) grupos = barajar(GRUPOS);
      out.push(porCategoria(grupos.shift()));
    }
  }
  return barajar(out);
}

router.get('/local', (req, res) => res.json({ success: true, items: elegir(totalRondas('intruso', req.query.r)) }));

montarSalas(router, {
  ...limitesOnline('intruso'),
  engine: M,
  config: { rondas: rondasValidas('intruso') },
  validarConfig: (b, c) => ({ ...c, rondas: rondasValidas('intruso', b.rondas, c.rondas) }),
  reglas: () => ({}),
  prepararItems: async (sala) => elegir(totalRondas('intruso', sala.config.rondas)),
  accion: accionSimultaneo
});

export default router;
