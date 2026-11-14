// server/routes/solo.js
// Datos de los juegos de un jugador de trivia y fútbol (ver lib/solo.js).
//   GET  /api/solo/:juego            contenido de una partida nueva
//   POST /api/solo/conexion/enlace   { a, b } → ¿jugaron juntos? (con el motivo)
import express from 'express';
import { JUEGOS_SOLO, enlace } from '../lib/solo.js';

const router = express.Router();

router.post('/conexion/enlace', (req, res) => {
  const { a, b } = req.body || {};
  res.json({ success: true, ...enlace(String(a || '').slice(0, 60), String(b || '').slice(0, 60)) });
});

router.get('/:juego', (req, res) => {
  const f = JUEGOS_SOLO[req.params.juego];
  if (!f) return res.status(404).json({ error: 'Juego desconocido.' });
  res.json({ success: true, ...f() });
});

export default router;
