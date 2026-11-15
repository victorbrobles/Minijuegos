// server/routes/solo.js
// Datos de los juegos de un jugador de trivia y fútbol (ver lib/solo.js).
//   GET  /api/solo/:juego            contenido de una partida nueva
//   POST /api/solo/conexion/enlace   { a, b } → ¿jugaron juntos? (con el motivo)
//   POST /api/solo/retos · GET /api/solo/retos/:codigo · POST /api/solo/retos/:codigo/resultado   retos entre amigos
import express from 'express';
import { JUEGOS_SOLO, enlace } from '../lib/solo.js';
import db from '../db.js';
import { existe, partidaPalabra, partidaLetras } from '../lib/palabras.js';
import { JUEGOS_DIARIO, estadoDiario, guardarDiario } from '../lib/diario.js';

// ---------------------------------------------------------------- Retos entre amigos
// Quien termina una partida de un jugador puede retar a otros: se guarda la partida exacta (sus datos) con un código;
// quien abre el enlace juega lo mismo y al final se comparan los resultados.
db.exec(`
  CREATE TABLE IF NOT EXISTS retos_amigo (codigo TEXT PRIMARY KEY, juego TEXT NOT NULL, datos TEXT NOT NULL, orden TEXT NOT NULL, creado INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS retos_amigo_resultados (codigo TEXT NOT NULL, jugador TEXT NOT NULL, puntos REAL NOT NULL, fecha INTEGER NOT NULL, retador INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (codigo, jugador));
`);
const JUEGOS_RETO = new Set(['escalera', 'cronologia', 'cadena', 'quiensoy', 'onceperdido', 'conexion', 'duelofutbol', 'manager', 'misterioso', 'crimen', 'palabra', 'letras']);
const nuevoCodigo = () => Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
const jugadorValido = (j) => /^.{1,15}#\d{4}$/.test(String(j || ''));
const leerReto = db.prepare('SELECT * FROM retos_amigo WHERE codigo = ?');
const resultadosDe = db.prepare('SELECT jugador, puntos, fecha, retador FROM retos_amigo_resultados WHERE codigo = ?');
const guardarResultado = db.prepare(`INSERT INTO retos_amigo_resultados (codigo, jugador, puntos, fecha, retador) VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(codigo, jugador) DO NOTHING`);
const clasificar = (reto) => resultadosDe.all(reto.codigo).sort((a, b) => (reto.orden === 'asc' ? a.puntos - b.puntos : b.puntos - a.puntos) || a.fecha - b.fecha);

const router = express.Router();

router.post('/conexion/enlace', (req, res) => {
  const { a, b } = req.body || {};
  res.json({ success: true, ...enlace(String(a || '').slice(0, 60), String(b || '').slice(0, 60)) });
});

router.post('/retos', (req, res) => {
  const { juego, datos, jugador, puntos, orden } = req.body || {};
  if (!JUEGOS_RETO.has(juego)) return res.status(400).json({ error: 'Este juego no admite retos.' });
  if (!jugadorValido(jugador) || !Number.isFinite(Number(puntos))) return res.status(400).json({ error: 'Datos no válidos.' });
  const texto = JSON.stringify(datos ?? null);
  if (texto.length > 200000) return res.status(400).json({ error: 'Partida demasiado grande.' });
  let codigo = nuevoCodigo(); while (leerReto.get(codigo)) codigo = nuevoCodigo();
  db.prepare('INSERT INTO retos_amigo (codigo, juego, datos, orden, creado) VALUES (?, ?, ?, ?, ?)').run(codigo, juego, texto, orden === 'asc' ? 'asc' : 'desc', Date.now());
  guardarResultado.run(codigo, jugador, Number(puntos), Date.now(), 1);
  res.json({ success: true, codigo });
});

router.get('/retos/:codigo', (req, res) => {
  const reto = leerReto.get(String(req.params.codigo || '').toUpperCase());
  if (!reto) return res.status(404).json({ error: 'Ese reto no existe.' });
  res.json({ success: true, juego: reto.juego, orden: reto.orden, datos: JSON.parse(reto.datos), resultados: clasificar(reto) });
});

router.post('/retos/:codigo/resultado', (req, res) => {
  const reto = leerReto.get(String(req.params.codigo || '').toUpperCase());
  if (!reto) return res.status(404).json({ error: 'Ese reto no existe.' });
  const { jugador, puntos } = req.body || {};
  if (!jugadorValido(jugador) || !Number.isFinite(Number(puntos))) return res.status(400).json({ error: 'Datos no válidos.' });
  guardarResultado.run(reto.codigo, jugador, Number(puntos), Date.now(), 0); // solo cuenta el primer intento de cada uno
  res.json({ success: true, orden: reto.orden, resultados: clasificar(reto) });
});

// ¿Existe la palabra en el diccionario? (para validar los intentos de los juegos de palabras)
router.post('/palabras/existe', (req, res) => {
  res.json({ success: true, existe: existe(String(req.body?.palabra || '').slice(0, 20)) });
});

// ---------------------------------------------------------------- Retos diarios (misma partida para todos cada día)
//   GET  /api/solo/diario/:juego?jugador=   partida de hoy (si aún no has jugado), tu intento, clasificación y racha
//   POST /api/solo/diario/:juego            { jugador, puntos, resumen }: guarda tu intento (solo el primero cuenta)
router.get('/diario/:juego', (req, res) => {
  const def = JUEGOS_DIARIO[req.params.juego];
  if (!def) return res.status(404).json({ error: 'Ese juego no tiene reto diario.' });
  const jugador = jugadorValido(req.query.jugador) ? String(req.query.jugador) : '';
  const e = estadoDiario(req.params.juego, jugador);
  res.json({ success: true, ...e, datos: e.intento ? null : def.partida(e.dia) });
});
router.post('/diario/:juego', (req, res) => {
  const def = JUEGOS_DIARIO[req.params.juego];
  if (!def) return res.status(404).json({ error: 'Ese juego no tiene reto diario.' });
  const { jugador, puntos, resumen } = req.body || {};
  if (!jugadorValido(jugador) || !Number.isFinite(Number(puntos))) return res.status(400).json({ error: 'Datos no válidos.' });
  const nuevo = guardarDiario(req.params.juego, jugador, Number(puntos), resumen);
  res.json({ success: true, nuevo, ...estadoDiario(req.params.juego, jugador) });
});

const PALABRAS = { palabra: () => partidaPalabra(), letras: () => partidaLetras() };
router.get('/:juego', (req, res) => {
  const f = JUEGOS_SOLO[req.params.juego] || PALABRAS[req.params.juego];
  if (!f) return res.status(404).json({ error: 'Juego desconocido.' });
  res.json({ success: true, ...f() });
});

export default router;
