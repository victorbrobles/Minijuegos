// server/routes/perfil.js
// Perfil de cada jugador (Nombre#1234): avatar (emoji) y color. Lo ven los demás en podios y en su página de perfil.
//   GET  /api/perfil?nombres=Ana#1234,Pablo#5678   → { perfiles: { 'Ana#1234': { avatar, color } } }
//   POST /api/perfil { jugador, avatar, color }
import express from 'express';
import db from '../db.js';

export const AVATARES = ['😎', '🤓', '🥳', '😺', '🐶', '🦊', '🐼', '🐸', '🐵', '🦁', '🐯', '🐧', '🦄', '🐙', '🦖', '🐲', '👽', '🤖', '👻', '🎃',
  '🧙', '🥷', '🦸', '🧛', '🧑‍🚀', '🧑‍🍳', '⚽', '🏀', '🎸', '🎮', '🎲', '🃏', '♟️', '🚀', '🌵', '🍕', '🍩', '🌈', '🔥', '⭐'];
export const COLORES = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#64748b', '#0f172a'];

db.exec(`CREATE TABLE IF NOT EXISTS perfiles (jugador TEXT PRIMARY KEY, avatar TEXT NOT NULL, color TEXT NOT NULL, actualizado INTEGER NOT NULL)`);
const leer = db.prepare('SELECT avatar, color FROM perfiles WHERE jugador = ?');
const guardar = db.prepare(`INSERT INTO perfiles (jugador, avatar, color, actualizado) VALUES (?, ?, ?, ?)
  ON CONFLICT(jugador) DO UPDATE SET avatar = excluded.avatar, color = excluded.color, actualizado = excluded.actualizado`);
const valido = (j) => /^.{1,15}#\d{4}$/.test(j);

const router = express.Router();
router.get('/', (req, res) => {
  const nombres = String(req.query.nombres || '').split(',').map((x) => x.trim()).filter(valido).slice(0, 60);
  const perfiles = {};
  nombres.forEach((n) => { const p = leer.get(n); if (p) perfiles[n] = p; });
  res.json({ success: true, perfiles, avatares: AVATARES, colores: COLORES });
});
router.post('/', (req, res) => {
  const { jugador, avatar, color } = req.body || {};
  if (!valido(String(jugador || ''))) return res.status(400).json({ error: 'Jugador no válido.' });
  if (!AVATARES.includes(avatar) || !COLORES.includes(color)) return res.status(400).json({ error: 'Avatar o color no válido.' });
  guardar.run(jugador, avatar, color, Date.now());
  res.json({ success: true });
});
export default router;
