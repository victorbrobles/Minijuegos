// server/routes/masmenos.js
// «Entre dos aguas»: dos elementos con su cifra oculta, elige el que tiene más y encadena aciertos.
// Motor en ../masmenos/engine.js; salas online de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../masmenos/engine.js';
import { CATEGORIAS } from '../data/seeds/masmenos/index.js';
import { montarSalas } from '../lib/salasJuego.js';

const router = express.Router();
const barajar = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const LISTA = Object.entries(CATEGORIAS).map(([id, c]) => ({ id, nombre: c.nombre, icono: c.icono, emoji: c.emoji, pregunta: c.pregunta, total: c.data.length }));

/** Categoría elegida (o una al azar) y el mazo barajado. */
function preparar(config) {
  const id = CATEGORIAS[config.categoria] ? config.categoria : LISTA[Math.floor(Math.random() * LISTA.length)].id;
  const c = CATEGORIAS[id];
  return {
    items: barajar(c.data),
    reglas: { categoria: { id, nombre: c.nombre, pregunta: c.pregunta, emoji: c.emoji }, vueltas: config.vueltas }
  };
}
const leerConfig = (b, c = { categoria: 'azar', vueltas: 1 }) => ({
  categoria: b.categoria === 'azar' || CATEGORIAS[b.categoria] ? b.categoria : c.categoria,
  vueltas: E.OPCIONES_VUELTAS.includes(Number(b.vueltas)) ? Number(b.vueltas) : c.vueltas
});

router.get('/categorias', (req, res) => res.json({ success: true, categorias: LISTA }));

// Un solo dispositivo: el cliente juega con el motor copiado.
router.get('/local', (req, res) => {
  res.json({ success: true, ...preparar(leerConfig({ categoria: req.query.categoria, vueltas: req.query.vueltas })) });
});

montarSalas(router, {
  engine: E,
  min: 2,
  max: E.AJUSTES.max,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => preparar(sala.config),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    const soloAdmin = { ok: false, error: 'Solo el anfitrión puede hacerlo.' };
    switch (d.tipo) {
      case 'listo': return M.listo(p, id, ahora);
      case 'elegir': return M.elegir(p, id, Number(d.lado), ahora);
      case 'terminar': return esAdmin ? M.terminar(p) : soloAdmin;
      default: return null;
    }
  }
});

export default router;
