// server/routes/metricas.js
// Estadísticas de uso para el administrador, sin cookies ni nada guardado en el móvil.
// Para contar personas distintas al día, el servidor calcula una huella con la IP y el navegador mezclados con una
// clave que CAMBIA CADA DÍA: no se guarda la IP, y la huella de un día no se puede relacionar con la de otro.
//   POST /api/metricas { tipo: 'visita' | 'abrir' | 'fin' | 'instalada', juego?, app? }
//   GET  /api/metricas/resumen?dias=30   (solo administrador)
import express from 'express';
import { createHmac, randomBytes } from 'node:crypto';
import db from '../db.js';
import { esAdmin } from '../lib/admin.js';

db.exec(`
  CREATE TABLE IF NOT EXISTS metricas (id INTEGER PRIMARY KEY AUTOINCREMENT, tipo TEXT NOT NULL, juego TEXT, visitante TEXT NOT NULL,
    dia TEXT NOT NULL, app INTEGER NOT NULL DEFAULT 0, fecha INTEGER NOT NULL);
  CREATE INDEX IF NOT EXISTS idx_metricas_dia ON metricas (dia, tipo);
  CREATE TABLE IF NOT EXISTS ajustes_servidor (clave TEXT PRIMARY KEY, valor TEXT NOT NULL);
`);
const TIPOS = new Set(['visita', 'abrir', 'fin', 'instalada']);
const diaDe = (t = Date.now()) => new Date(t).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });

// Clave secreta del servidor (se crea una vez); con ella y el día sale la clave diaria
let secreto = db.prepare("SELECT valor FROM ajustes_servidor WHERE clave = 'metricas'").get()?.valor;
if (!secreto) {
  secreto = randomBytes(32).toString('hex');
  db.prepare("INSERT OR IGNORE INTO ajustes_servidor (clave, valor) VALUES ('metricas', ?)").run(secreto);
  secreto = db.prepare("SELECT valor FROM ajustes_servidor WHERE clave = 'metricas'").get()?.valor || secreto;
}
const huellaDelDia = (req, dia) => {
  const claveDia = createHmac('sha256', secreto).update(dia).digest();
  return createHmac('sha256', claveDia).update(`${req.ip}|${req.get('user-agent') || ''}`).digest('hex').slice(0, 24);
};

const insertar = db.prepare('INSERT INTO metricas (tipo, juego, visitante, dia, app, fecha) VALUES (?, ?, ?, ?, ?, ?)');
// Un evento igual del mismo visitante el mismo día no se repite (las visitas y aperturas se cuentan una vez al día)
const yaEsta = db.prepare('SELECT 1 FROM metricas WHERE tipo = ? AND visitante = ? AND dia = ? AND IFNULL(juego, \'\') = ? LIMIT 1');

const router = express.Router();
router.post('/', (req, res) => {
  const { tipo, juego, app } = req.body || {};
  const j = juego ? String(juego) : '';
  if (!TIPOS.has(tipo) || (j && !/^[a-z0-9-]{2,30}$/.test(j))) return res.status(400).json({ error: 'Evento no válido.' });
  const dia = diaDe();
  const v = huellaDelDia(req, dia);
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
  // Las huellas cambian cada día: todo se cuenta «por persona y día»
  const juegos = db.prepare(`SELECT juego,
      SUM(tipo = 'abrir') AS aperturas,
      COUNT(DISTINCT CASE WHEN tipo = 'abrir' THEN visitante || dia END) AS personas,
      COUNT(DISTINCT CASE WHEN tipo = 'fin' THEN visitante || dia END) AS acaban,
      COUNT(DISTINCT CASE WHEN tipo = 'abrir' THEN visitante || dia END) AS abren,
      SUM(tipo = 'fin') AS partidas
    FROM metricas WHERE juego IS NOT NULL AND dia >= ? GROUP BY juego ORDER BY aperturas DESC`).all(desde);
  const otros = db.prepare(`SELECT SUM(tipo = 'fin') AS partidas, SUM(tipo = 'instalada') AS instalaciones FROM metricas WHERE dia >= ?`).get(desde);
  const visitas = porDia.reduce((n, d) => n + d.visitantes, 0);
  const enApp = porDia.reduce((n, d) => n + d.enApp, 0);
  const mediaDiaria = porDia.length ? Math.round(visitas / porDia.length) : 0;
  res.json({ success: true, dias, desde, porDia, juegos, totales: { visitas, enApp, mediaDiaria, partidas: otros.partidas || 0, instalaciones: otros.instalaciones || 0 } });
});
export default router;
