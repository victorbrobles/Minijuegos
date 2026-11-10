// server/routes/tablero.js
// «El Tablero de Puntos» online. Motor en ../tablero/engine.js; salas de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../tablero/engine.js';
import { CATEGORIAS, PREGUNTAS } from '../data/seeds/tablero/preguntas.js';
import { montarSalas } from '../lib/salasJuego.js';

const router = express.Router();
const barajar = (l) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const leerConfig = (b, c = { categorias: 5, segundos: 20 }) => ({
  categorias: E.OPCIONES.categorias.includes(Number(b.categorias)) ? Number(b.categorias) : c.categorias,
  segundos: E.OPCIONES.segundos.includes(Number(b.segundos)) ? Number(b.segundos) : c.segundos
});

/** Monta un tablero: n categorías al azar, una pregunta por valor (evitando las ya usadas en la sala) y una casilla doble. */
export function montarTablero(n, usados = new Set()) {
  const cats = barajar(CATEGORIAS).slice(0, n);
  const preguntas = {};
  cats.forEach((c) => E.AJUSTES.valores.forEach((v) => {
    const todas = PREGUNTAS.filter((q) => q.cat === c.id && q.v === v);
    let libres = todas.filter((q) => !usados.has(q.p));
    if (!libres.length) { todas.forEach((q) => usados.delete(q.p)); libres = todas; }
    const q = barajar(libres)[0];
    usados.add(q.p);
    preguntas[`${c.id}:${v}`] = { p: q.p, opciones: barajar(q.o), correcta: q.o[0] };
  }));
  // La casilla doble nunca es de 100
  const candidatas = Object.keys(preguntas).filter((k) => !k.endsWith(':100'));
  return { categorias: cats, preguntas, doble: candidatas[Math.floor(Math.random() * candidatas.length)] };
}

router.get('/local', (req, res) => {
  res.json({ success: true, tablero: montarTablero(leerConfig({ categorias: req.query.n }).categorias) });
});

const MOTOR = { ...E, crearPartida: (jugadores, items, reglas, ahora) => E.crearPartida(jugadores, reglas.tablero, reglas, ahora) };

montarSalas(router, {
  engine: MOTOR,
  sinItems: true,
  min: E.AJUSTES.min,
  max: E.AJUSTES.max,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: [], reglas: { ...sala.config, tablero: montarTablero(sala.config.categorias, sala.usados) } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    switch (d.tipo) {
      case 'elegir': return M.elegir(p, id, d.cat, d.v, ahora);
      case 'responder': return M.responder(p, id, d.opcion ?? null, ahora);
      case 'terminar': return esAdmin ? M.terminar(p) : { ok: false, error: 'Solo el anfitrión.' };
      default: return null;
    }
  }
});

export default router;
