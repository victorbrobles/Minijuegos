// server/routes/valoraciones.js
// 👍/👎 de cada juego. Un voto por persona y juego (se puede cambiar).
//   GET  /api/valoraciones            → { valoraciones: { juego: { si, no } } }
//   POST /api/valoraciones { juego, quien, voto: 1 | -1 }
import express from 'express';
import db from '../db.js';

db.exec(`CREATE TABLE IF NOT EXISTS valoraciones (juego TEXT NOT NULL, quien TEXT NOT NULL, voto INTEGER NOT NULL, fecha INTEGER NOT NULL, PRIMARY KEY (juego, quien))`);
const votar = db.prepare(`INSERT INTO valoraciones (juego, quien, voto, fecha) VALUES (?, ?, ?, ?)
  ON CONFLICT(juego, quien) DO UPDATE SET voto = excluded.voto, fecha = excluded.fecha`);
const resumen = db.prepare(`SELECT juego, SUM(voto = 1) AS si, SUM(voto = -1) AS no FROM valoraciones GROUP BY juego`);

const router = express.Router();
router.get('/', (req, res) => {
  const valoraciones = {};
  resumen.all().forEach((r) => { valoraciones[r.juego] = { si: r.si, no: r.no }; });
  res.json({ success: true, valoraciones });
});
router.post('/', (req, res) => {
  const juego = String(req.body?.juego || '');
  const quien = String(req.body?.quien || '').slice(0, 40);
  const voto = Number(req.body?.voto);
  if (!/^[a-z0-9-]{2,30}$/.test(juego) || quien.length < 3 || ![1, -1].includes(voto)) return res.status(400).json({ error: 'Voto no válido.' });
  votar.run(juego, quien, voto, Date.now());
  res.json({ success: true });
});
export default router;
