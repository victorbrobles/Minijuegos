// server/routes/tablero.js
// «El Tablero de Puntos» online. Motor en ../tablero/engine.js; salas de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../tablero/engine.js';
import { CATEGORIAS, PREGUNTAS } from '../data/seeds/tablero/preguntas.js';
import { montarSalas } from '../lib/salasJuego.js';

const router = express.Router();
const barajar = (l) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const leerConfig = (b, c = { categorias: 4, segundos: 20 }) => ({
  categorias: E.OPCIONES.categorias.includes(Number(b.categorias)) ? Number(b.categorias) : c.categorias,
  segundos: E.OPCIONES.segundos.includes(Number(b.segundos)) ? Number(b.segundos) : c.segundos
});

/**
 * Banco de la partida: TODAS las categorías con una pregunta por valor (evitando las ya usadas en la sala).
 * Los jugadores eligen después cuáles se juegan; el motor solo usa las de las categorías elegidas.
 */
export function montarBanco(usados = new Set()) {
  const preguntas = {};
  CATEGORIAS.forEach((c) => E.AJUSTES.valores.forEach((v) => {
    const todas = PREGUNTAS.filter((q) => q.cat === c.id && q.v === v);
    let libres = todas.filter((q) => !usados.has(q.p));
    if (!libres.length) { todas.forEach((q) => usados.delete(q.p)); libres = todas; }
    const q = barajar(libres)[0];
    usados.add(q.p);
    preguntas[`${c.id}:${v}`] = { p: q.p, opciones: barajar(q.o), correcta: q.o[0] };
  }));
  return { categorias: CATEGORIAS, preguntas };
}

router.get('/local', (req, res) => {
  res.json({ success: true, banco: montarBanco() });
});

const MOTOR = { ...E, crearPartida: (jugadores, items, reglas, ahora) => E.crearPartida(jugadores, reglas.banco, reglas, ahora) };

montarSalas(router, {
  engine: MOTOR,
  sinItems: true,
  min: E.AJUSTES.min,
  max: E.AJUSTES.max,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: [], reglas: { ...sala.config, banco: montarBanco(sala.usados) } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    switch (d.tipo) {
      case 'categoria': return M.elegirCategoria(p, id, d.cat, ahora);
      case 'elegir': return M.elegir(p, id, d.cat, d.v, ahora);
      case 'responder': return M.responder(p, id, d.opcion ?? null, ahora);
      case 'terminar': return esAdmin ? M.terminar(p) : { ok: false, error: 'Solo el anfitrión.' };
      default: return null;
    }
  }
});

export default router;
