// server/routes/oncefantasma.js
// «El Once Fantasma» online: todos adivinan a la vez el once oculto de un partido histórico.
// Motor en ../oncefantasma/engine.js; salas de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../oncefantasma/engine.js';
import { ONCES } from '../data/seeds/oncefantasma/onces.js';
import { montarSalas, elegirSinRepetir } from '../lib/salasJuego.js';

const router = express.Router();
const leerConfig = (b, c = { rondas: 2, segundos: 240 }) => ({
  rondas: E.OPCIONES.rondas.includes(Number(b.rondas)) ? Number(b.rondas) : c.rondas,
  segundos: E.OPCIONES.segundos.includes(Number(b.segundos)) ? Number(b.segundos) : c.segundos
});
const barajar = (l) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// Un solo dispositivo: el cliente juega con el motor copiado y pide aquí los onces.
router.get('/local', (req, res) => {
  const n = Math.max(1, Math.min(Number(req.query.n) || 2, ONCES.length));
  res.json({ success: true, onces: barajar(ONCES).slice(0, n) });
});

montarSalas(router, {
  engine: E,
  min: E.AJUSTES.min,
  max: E.AJUSTES.max,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: elegirSinRepetir(sala, ONCES, sala.config.rondas), reglas: { ...sala.config } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    const soloAdmin = { ok: false, error: 'Solo el anfitrión.' };
    switch (d.tipo) {
      case 'adivinar': return M.adivinar(p, id, d.texto, ahora);
      case 'pista': return esAdmin ? M.pista(p, Math.random, ahora) : soloAdmin;
      case 'rendirse': return esAdmin ? M.rendirse(p) : soloAdmin;
      case 'siguiente': return esAdmin ? M.siguiente(p, ahora) : soloAdmin;
      case 'terminar': return esAdmin ? M.terminar(p) : soloAdmin;
      default: return null;
    }
  }
});

export default router;
