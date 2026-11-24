// server/routes/escondite.js
// «El Escondite» online y su contenido para el modo un dispositivo. Motor: client/src/games/Escondite/engine.js.
import express from 'express';
import { M, minimoOpciones, CAMBIOS } from '../../client/src/games/Escondite/engine.js';
import { accionSimultaneo } from '../../client/src/games/comun/simultaneo.js';
import { TODAS } from '../data/seeds/escondite/index.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';
import { rondasValidas, totalRondas } from '../../client/src/games/rondas.js';

const router = express.Router();
const barajar = (l) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/** n categorías para `jugadores` jugadores, sin repetir en la sala mientras queden. */
export function elegir(usados, n, jugadores) {
  const validas = TODAS.filter((c) => c.opciones.length >= minimoOpciones(jugadores));
  let libres = validas.filter((c) => !usados.has(c.id));
  if (libres.length < n) { validas.forEach((c) => usados.delete(c.id)); libres = validas; }
  // Como mucho una de cada cinco rondas es un once (son las más difíciles de escribir)
  const onces = barajar(libres.filter((c) => c.once)).slice(0, Math.max(1, Math.floor(n / 5)));
  const resto = barajar(libres.filter((c) => !c.once));
  const out = barajar([...onces, ...resto.slice(0, n - onces.length)]).slice(0, n);
  while (out.length < n) out.push(barajar(validas)[0]);
  out.forEach((c) => usados.add(c.id));
  return out.map(({ titulo, emoji, opciones }) => ({ titulo, emoji, opciones }));
}

/** Las categorías de la partida, cada una con CAMBIOS categorías de reserva (por si el escondido la cambia). */
export function elegirConReservas(usados, n, jugadores) {
  const items = elegir(usados, n, jugadores);
  const reservas = elegir(usados, n * CAMBIOS, jugadores);
  return items.map((it, i) => ({ ...it, alternativas: reservas.slice(i * CAMBIOS, (i + 1) * CAMBIOS) }));
}

router.get('/local', (req, res) => {
  const j = Math.max(1, Number(req.query.j) || 3);
  res.json({ success: true, items: elegirConReservas(new Set(), totalRondas('escondite', req.query.r, j), j) });
});

montarSalas(router, {
  ...limitesOnline('escondite'),
  engine: M,
  config: { rondas: rondasValidas('escondite') },
  validarConfig: (b, c) => ({ ...c, rondas: rondasValidas('escondite', b.rondas, c.rondas) }),
  reglas: () => ({}),
  prepararItems: async (sala) => elegirConReservas(sala.usados, totalRondas('escondite', sala.config.rondas, sala.jugadores.length), sala.jugadores.length),
  accion: (Mo, p, d, ctx) => (d.tipo === 'cambiar' ? Mo.cambiar(p, ctx.id, ctx.ahora) : accionSimultaneo(Mo, p, d, ctx))
});

export default router;
