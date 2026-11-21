// server/routes/usuarios.js
// Cuentas: crear, entrar, salir, sincronizar los datos del navegador, cambiar contraseña y borrar la cuenta.
//   POST /api/usuarios/registro   { email, password, nick, tag? }  → si el «Nick#tag» ya existía sin cuenta, se reclama
//   POST /api/usuarios/entrar     { email, password }
//   POST /api/usuarios/salir
//   GET  /api/usuarios/yo         → { usuario: { email, jugador, nick, tag } | null, caducada? }
//   POST /api/usuarios/latido     → renueva la sesión (el móvil lo manda mientras se usa la app; 15 min sin usarla la cierran)
//   GET  /api/usuarios/datos      → { datos }  ·  PUT /api/usuarios/datos { datos }
//   POST /api/usuarios/password   { actual, nueva }
//   POST /api/usuarios/borrar     { password }   (borra la cuenta y todo lo guardado con su nombre)
//   GET  /api/usuarios/libre?jugador=Ana%231234 → { libre } (si ese nombre no tiene cuenta)
//   POST /api/usuarios/admin/restablecer { busca, nueva? } (solo administrador) → contraseña provisional
import express from 'express';
import { randomBytes } from 'node:crypto';
import db from '../db.js';
import { esAdmin } from '../lib/admin.js';
import { hashPassword, passwordCorrecta, crearSesion, cerrarSesion, tieneCuenta } from '../lib/usuarios.js';

const router = express.Router();
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
const limpiarNick = (n) => String(n || '').replace(/[#|]/g, '').replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 15);
const partir = (jugador) => { const m = /^(.*)#(\d{4})$/.exec(jugador); return m ? { nick: m[1], tag: m[2] } : { nick: jugador, tag: '' }; };
const publico = (u) => (u ? { email: u.email, jugador: u.jugador, ...partir(u.jugador), creado: u.creado } : null);

const porEmail = db.prepare('SELECT * FROM usuarios WHERE email = ?');
const porJugador = db.prepare('SELECT id FROM usuarios WHERE jugador = ? COLLATE NOCASE');

// Frena a quien prueba contraseñas: 8 fallos por correo o 20 por IP cada 15 minutos
const fallos = new Map();
const recientes = (k) => (fallos.get(k) || []).filter((t) => Date.now() - t < 15 * 60_000);
const bloqueado = (req, email) => recientes(`ip:${req.ip}`).length >= 20 || recientes(`email:${email}`).length >= 8;
const anotarFallo = (req, email) => { [`ip:${req.ip}`, `email:${email}`].forEach((k) => fallos.set(k, [...recientes(k), Date.now()])); };
setInterval(() => { for (const k of fallos.keys()) { const l = recientes(k); if (l.length) fallos.set(k, l); else fallos.delete(k); } }, 15 * 60_000).unref();

function validarPassword(pw) {
  const p = String(pw || '');
  if (p.length < 8) return 'La contraseña tiene que tener al menos 8 caracteres.';
  if (p.length > 200) return 'La contraseña es demasiado larga.';
  return null;
}

router.get('/yo', (req, res) => res.json({ success: true, usuario: publico(req.usuario), admin: req.admin, caducada: Boolean(req.sesionCaducada) }));

// Se está usando la app: la sesión sigue abierta otros 15 minutos
router.post('/latido', (req, res) => {
  if (!req.usuario) return res.status(401).json({ error: 'La sesión se ha cerrado.', caducada: Boolean(req.sesionCaducada) });
  crearSesion(res, req, req.usuario, { adm: req.adminHasta }); // el modo administrador sigue si estaba activo
  res.json({ success: true, admin: req.admin });
});

router.get('/libre', (req, res) => {
  const j = String(req.query.jugador || '');
  res.json({ success: true, libre: !tieneCuenta(j) });
});

router.post('/registro', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const nick = limpiarNick(req.body?.nick);
  const pw = req.body?.password;
  if (!EMAIL.test(email)) return res.status(400).json({ error: 'Escribe un correo válido.' });
  const malPw = validarPassword(pw);
  if (malPw) return res.status(400).json({ error: malPw });
  if (!nick) return res.status(400).json({ error: 'Elige un nick.' });
  if (porEmail.get(email)) return res.status(409).json({ error: 'Ya hay una cuenta con ese correo. Inicia sesión.' });
  // Número: el que pida (para quedarse con un «Nick#número» que ya usaba sin cuenta) o uno libre al azar
  let tag = /^\d{4}$/.test(String(req.body?.tag || '')) ? String(req.body.tag) : null;
  if (tag && porJugador.get(`${nick}#${tag}`)) return res.status(409).json({ error: `«${nick}#${tag}» ya pertenece a otra cuenta. Elige otro número.` });
  if (!tag) {
    for (let i = 0; i < 50 && !tag; i++) { const t = String(Math.floor(Math.random() * 10000)).padStart(4, '0'); if (!porJugador.get(`${nick}#${t}`)) tag = t; }
    if (!tag) return res.status(409).json({ error: 'Ese nick está muy cogido: prueba con otro.' });
  }
  const jugador = `${nick}#${tag}`;
  const ahora = Date.now();
  const r = db.prepare('INSERT INTO usuarios (email, hash, jugador, creado, acceso) VALUES (?, ?, ?, ?, ?)').run(email, hashPassword(pw), jugador, ahora, ahora);
  const u = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(r.lastInsertRowid);
  crearSesion(res, req, u);
  res.json({ success: true, usuario: publico(u) });
});

router.post('/entrar', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (bloqueado(req, email)) return res.status(429).json({ error: 'Demasiados intentos. Espera unos minutos.' });
  const u = porEmail.get(email);
  if (!u || !passwordCorrecta(req.body?.password, u.hash)) {
    anotarFallo(req, email);
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  }
  db.prepare('UPDATE usuarios SET acceso = ? WHERE id = ?').run(Date.now(), u.id);
  crearSesion(res, req, u);
  res.json({ success: true, usuario: publico(u) });
});

router.post('/salir', (req, res) => { cerrarSesion(res); res.json({ success: true }); });

/* ───────── Datos del navegador (favoritos, récords, logros, ajustes…) que viajan con la cuenta ───────── */
router.get('/datos', (req, res) => {
  if (!req.usuario) return res.status(401).json({ error: 'Inicia sesión.' });
  const fila = db.prepare('SELECT datos FROM usuarios WHERE id = ?').get(req.usuario.id);
  let datos = {};
  try { datos = JSON.parse(fila?.datos || '{}'); } catch { /* nada */ }
  res.json({ success: true, datos });
});
router.put('/datos', (req, res) => {
  if (!req.usuario) return res.status(401).json({ error: 'Inicia sesión.' });
  const d = req.body?.datos;
  if (!d || typeof d !== 'object' || Array.isArray(d)) return res.status(400).json({ error: 'Datos no válidos.' });
  const limpio = {};
  Object.entries(d).forEach(([k, v]) => { if (/^[\w.:#-]{1,80}$/.test(k) && typeof v === 'string') limpio[k] = v; });
  const texto = JSON.stringify(limpio);
  if (texto.length > 900000) return res.status(413).json({ error: 'Demasiados datos.' });
  db.prepare('UPDATE usuarios SET datos = ? WHERE id = ?').run(texto, req.usuario.id);
  res.json({ success: true });
});

router.post('/password', (req, res) => {
  if (!req.usuario) return res.status(401).json({ error: 'Inicia sesión.' });
  const u = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id);
  if (!passwordCorrecta(req.body?.actual, u.hash)) return res.status(401).json({ error: 'La contraseña actual no es correcta.' });
  const mal = validarPassword(req.body?.nueva);
  if (mal) return res.status(400).json({ error: mal });
  db.prepare('UPDATE usuarios SET hash = ?, version = version + 1 WHERE id = ?').run(hashPassword(req.body.nueva), u.id);
  crearSesion(res, req, { ...u, version: u.version + 1 }, { adm: req.adminHasta }); // las demás sesiones abiertas se cierran
  res.json({ success: true });
});

// Borrar la cuenta y lo guardado con su nombre (derecho de supresión)
const BORRADOS = [
  ['registros_resultados', 'jugador'], ['perfiles', 'jugador'], ['grupo_miembros', 'jugador'], ['valoraciones', 'quien'],
  ['diario_resultados', 'jugador'], ['retos_intentos', 'jugador'], ['retos_amigo_resultados', 'jugador'], ['grupo_preguntas', 'autor']
];
router.post('/borrar', (req, res) => {
  if (!req.usuario) return res.status(401).json({ error: 'Inicia sesión.' });
  const u = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id);
  if (!passwordCorrecta(req.body?.password, u.hash)) return res.status(401).json({ error: 'La contraseña no es correcta.' });
  db.transaction(() => {
    BORRADOS.forEach(([tabla, col]) => {
      try { db.prepare(`DELETE FROM ${tabla} WHERE ${col} = ?`).run(u.jugador); } catch { /* tabla que aún no existe */ }
    });
    db.prepare('DELETE FROM usuarios WHERE id = ?').run(u.id);
  })();
  cerrarSesion(res);
  res.json({ success: true });
});

/* ───────── Administrador: restablecer la contraseña de alguien que la ha olvidado ───────── */
router.get('/admin/buscar', (req, res) => {
  if (!esAdmin(req)) return res.status(403).json({ error: 'Solo para el administrador.' });
  const q = `%${String(req.query.q || '').trim().toLowerCase()}%`;
  const lista = db.prepare('SELECT email, jugador, creado, acceso FROM usuarios WHERE lower(email) LIKE ? OR lower(jugador) LIKE ? ORDER BY acceso DESC LIMIT 20').all(q, q);
  const total = db.prepare('SELECT COUNT(*) AS n FROM usuarios').get().n;
  res.json({ success: true, usuarios: lista, total });
});
router.post('/admin/restablecer', (req, res) => {
  if (!esAdmin(req)) return res.status(403).json({ error: 'Solo para el administrador.' });
  const email = String(req.body?.email || '').trim().toLowerCase();
  const u = porEmail.get(email);
  if (!u) return res.status(404).json({ error: 'No hay ninguna cuenta con ese correo.' });
  const provisional = randomBytes(6).toString('base64url'); // 8 caracteres
  db.prepare('UPDATE usuarios SET hash = ?, version = version + 1 WHERE id = ?').run(hashPassword(provisional), u.id);
  res.json({ success: true, jugador: u.jugador, provisional });
});

export default router;
