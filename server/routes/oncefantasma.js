// server/routes/oncefantasma.js
// «El Once Fantasma» online: por turnos, cada uno reconstruye un once de un partido histórico; si deja huecos, rebote.
// Motor en ../oncefantasma/engine.js; salas de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../oncefantasma/engine.js';
import { PARTIDOS } from '../data/seeds/oncefantasma/onces.js';
import { montarSalas, elegirSinRepetir } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';

const router = express.Router();
const leerConfig = (b, c = { onces: 3, segundos: 180 }) => ({
  onces: E.OPCIONES.onces.includes(Number(b.onces)) ? Number(b.onces) : c.onces,
  segundos: E.OPCIONES.segundos.includes(Number(b.segundos)) ? Number(b.segundos) : c.segundos
});
const barajar = (l) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const partidosPara = (n, onces) => Math.min(PARTIDOS.length, Math.ceil((n * onces) / 2));

// Un solo dispositivo: el cliente juega con el motor copiado y pide aquí los partidos.
router.get('/local', (req, res) => {
  const n = Math.max(1, Math.min(Number(req.query.n) || 2, PARTIDOS.length));
  res.json({ success: true, partidos: barajar(PARTIDOS).slice(0, n) });
});

montarSalas(router, {
  ...limitesOnline('oncefantasma'),
  engine: E,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({
    items: elegirSinRepetir(sala, PARTIDOS, partidosPara(sala.jugadores.length, sala.config.onces)),
    reglas: { ...sala.config }
  }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    const soloAdmin = { ok: false, error: 'Solo el anfitrión.' };
    const delTurno = p.turnos[p.ronda - 1]?.jugador === id;
    switch (d.tipo) {
      case 'adivinar': return M.adivinar(p, id, d.texto, ahora);
      case 'pista': return delTurno || esAdmin ? M.pista(p, Math.random, ahora) : { ok: false, error: 'Solo quien tiene el turno.' };
      case 'plantarse': return M.plantarse(p, delTurno ? id : (esAdmin ? null : id), ahora);
      case 'pasar': return M.pasarRebote(p, id);
      case 'cerrarRebote': return esAdmin ? M.pasarRebote(p, null) : soloAdmin;
      case 'siguiente': return esAdmin ? M.siguiente(p, ahora) : soloAdmin;
      case 'terminar': return esAdmin ? M.terminar(p) : soloAdmin;
      default: return null;
    }
  }
});

export default router;
