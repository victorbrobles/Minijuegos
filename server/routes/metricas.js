// server/routes/metricas.js
// Estadísticas de uso para el administrador. Cada navegador manda eventos anónimos con un identificador aleatorio
// (no lleva nombre ni datos personales):
//   POST /api/metricas { tipo: 'visita' | 'abrir' | 'fin' | 'instalada', juego?, visitante, app? }
//   GET  /api/metricas/resumen?dias=30   (solo administrador)
import express from 'express';
import db from '../db.js';
import { esAdmin } from '../lib/admin.js';

db.exec(`
  CREATE TABLE IF NOT EXISTS metricas (id INTEGER PRIMARY KEY AUTOINCREMENT, tipo TEXT NOT NULL, juego TEXT, visitante TEXT NOT NULL,
    dia TEXT NOT NULL, app INTEGER NOT NULL DEFAULT 0, fecha INTEGER NOT NULL);
  CREATE INDEX IF NOT EXISTS idx_metricas_dia ON metricas (dia, tipo);
`);
const TIPOS = new Set(['visita', 'abrir', 'fin', 'instalada']);
const diaDe = (t = Date.now()) => new Date(t).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
const insertar = db.prepare('INSERT INTO metricas (tipo, juego, visitante, dia, app, fecha) VALUES (?, ?, ?, ?, ?, ?)');
// Un evento igual del mismo visitante el mismo día no se repite (las visitas y aperturas se cuentan una vez al día)
const yaEsta = db.prepare('SELECT 1 FROM metricas WHERE tipo = ? AND visitante = ? AND dia = ? AND IFNULL(juego, \'\') = ? LIMIT 1');

const router = express.Router();
router.post('/', (req, res) => {
  const { tipo, juego, visitante, app } = req.body || {};
  const v = String(visitante || '');
  const j = juego ? String(juego) : '';
  if (!TIPOS.has(tipo) || !/^[a-z0-9]{8,40}$/i.test(v) || (j && !/^[a-z0-9-]{2,30}$/.test(j))) return res.status(400).json({ error: 'Evento no válido.' });
  const dia = diaDe();
  if (tipo !== 'fin' && yaEsta.get(tipo, v, dia, j)) return res.json({ success: true });
  insertar.run(tipo, j || null, v, dia, app ? 1 : 0, Date.now());
  res.json({ success: true });
});

router.get('/resumen', (req, res) => {
  if (!esAdmin(req)) return res.status(403).json({ error: 'Solo para el administrador.' });
  const dias = Math.max(1, Math.min(365, Number(req.query.dias) || 30));
  const desde = diaDe(Date.now() - (dias - 1) * 86400000);
  const porDia = db.prepare(`SELECT dia, COUNT(DISTINCT visitante) AS visitantes, COUNT(DISTINCT CASE WHEN app = 1 THEN visitante END) AS enApp
    FROM metricas WHERE tipo = 'visita' AND dia >= ? GROUP BY dia ORDER BY dia`).all(desde);
  const juegos = db.prepare(`SELECT juego,
      SUM(tipo = 'abrir') AS aperturas,
      COUNT(DISTINCT CASE WHEN tipo = 'abrir' THEN visitante END) AS personas,
      COUNT(DISTINCT CASE WHEN tipo = 'fin' THEN visitante || dia END) AS acaban,
      COUNT(DISTINCT CASE WHEN tipo = 'abrir' THEN visitante || dia END) AS abren,
      SUM(tipo = 'fin') AS partidas
    FROM metricas WHERE juego IS NOT NULL AND dia >= ? GROUP BY juego ORDER BY aperturas DESC`).all(desde);
  const totales = db.prepare(`SELECT COUNT(DISTINCT visitante) AS visitantes,
      COUNT(DISTINCT CASE WHEN app = 1 THEN visitante END) AS enApp,
      SUM(tipo = 'fin') AS partidas, SUM(tipo = 'instalada') AS instalaciones
    FROM metricas WHERE dia >= ?`).get(desde);
  const nuevos = db.prepare(`SELECT COUNT(*) AS n FROM (SELECT visitante, MIN(dia) AS primero FROM metricas GROUP BY visitante) WHERE primero >= ?`).get(desde).n;
  res.json({ success: true, dias, desde, porDia, juegos, totales: { ...totales, nuevos } });
});
export default router;
