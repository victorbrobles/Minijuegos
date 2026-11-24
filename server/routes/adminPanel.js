// server/routes/adminPanel.js
// Panel de administración (todo solo para el administrador), montado en /api/admin/panel:
//   Salas en directo · buzón de fallos y sugerencias · registro de errores · gestión de juegos y Top del Creador ·
//   anuncio de la portada · moderación (palabras prohibidas, grupos, preguntas, bloqueos) · cuentas ·
//   estado del servidor y copias · valoraciones y partidas por juego (con CSV) · reto diario.
import express from 'express';
import { readFileSync } from 'node:fs';
import os from 'node:os';
import db from '../db.js';
import { esAdmin } from '../lib/admin.js';
import { listarSalas, accionSala } from '../lib/registroSalas.js';
import {
  ajustesJuegos, cambiarJuego, topCreador, cambiarTop, anuncio, cambiarAnuncio, palabrasProhibidas, cambiarPalabras,
  listaBloqueados, bloquear, desbloquear
} from '../lib/ajustesWeb.js';
import { estadoDatos, hacerCopia, listarCopias, rutaCopia, restaurarCopia, subirAhora } from '../lib/replica.js';
import { BORRADOS } from './usuarios.js';
import { proximosRetos, cambiarReto, TIPOS_RETO } from './reto.js';

const router = express.Router();
router.use((req, res, next) => (esAdmin(req) ? next() : res.status(403).json({ error: 'Solo para el administrador.' })));

const CATALOGO = JSON.parse(readFileSync(new URL('../data/games.json', import.meta.url), 'utf8'));
const nombreJuego = Object.fromEntries(CATALOGO.map((g) => [g.id, g.name]));
const intentar = (f, defecto) => { try { return f(); } catch { return defecto; } };
const arrancado = Date.now();

/* ───────── Salas en directo ───────── */
router.get('/salas', (req, res) => res.json({ success: true, salas: listarSalas().map((s) => ({ ...s, nombre: nombreJuego[s.juego] || s.juego })) }));
router.post('/salas/:juego/:code/:accion', (req, res) => {
  const r = accionSala(req.params.juego, req.params.code, req.params.accion, req.body || {});
  if (!r.ok) return res.status(400).json({ error: r.error });
  res.json({ success: true, ...r });
});

/* ───────── Buzón: fallos y sugerencias ───────── */
router.get('/reportes', (req, res) => {
  const estado = ['nuevo', 'visto', 'resuelto'].includes(req.query.estado) ? req.query.estado : null;
  const lista = estado ? db.prepare('SELECT * FROM reportes WHERE estado = ? ORDER BY fecha DESC LIMIT 300').all(estado)
    : db.prepare('SELECT * FROM reportes ORDER BY fecha DESC LIMIT 300').all();
  const nuevos = db.prepare("SELECT COUNT(*) AS n FROM reportes WHERE estado = 'nuevo'").get().n;
  res.json({ success: true, reportes: lista.map((r) => ({ ...r, nombreJuego: nombreJuego[r.juego] || r.juego })), nuevos });
});
router.post('/reportes/:id', (req, res) => {
  const id = Number(req.params.id);
  if (req.body?.borrar) db.prepare('DELETE FROM reportes WHERE id = ?').run(id);
  else if (['nuevo', 'visto', 'resuelto'].includes(req.body?.estado)) db.prepare('UPDATE reportes SET estado = ? WHERE id = ?').run(req.body.estado, id);
  res.json({ success: true });
});

/* ───────── Registro de errores ───────── */
router.get('/errores', (req, res) => {
  const lista = db.prepare('SELECT * FROM errores_web ORDER BY ultima DESC LIMIT 300').all();
  res.json({ success: true, errores: lista.map((e) => ({ ...e, nombreJuego: nombreJuego[e.juego] || e.juego })) });
});
router.post('/errores/borrar', (req, res) => {
  if (req.body?.todos) db.prepare('DELETE FROM errores_web').run();
  else db.prepare('DELETE FROM errores_web WHERE firma = ?').run(String(req.body?.firma || ''));
  res.json({ success: true });
});

/* ───────── Juegos: estado, «Nuevo», Top del Creador, valoraciones y partidas ───────── */
function estadisticasJuegos() {
  const votos = Object.fromEntries(intentar(() => db.prepare('SELECT juego, SUM(voto = 1) AS si, SUM(voto = -1) AS no FROM valoraciones GROUP BY juego').all(), []).map((r) => [r.juego, r]));
  const hace30 = Date.now() - 30 * 86400000;
  const partidas = Object.fromEntries(intentar(() => db.prepare('SELECT juego, COUNT(*) AS total, SUM(fecha >= ?) AS mes FROM registros_partidas GROUP BY juego').all(hace30), []).map((r) => [r.juego, r]));
  const visitas = Object.fromEntries(intentar(() => db.prepare("SELECT juego, COUNT(*) AS n, COUNT(DISTINCT visitante) AS personas FROM metricas WHERE juego IS NOT NULL AND fecha >= ? GROUP BY juego").all(hace30), []).map((r) => [r.juego, r]));
  const ajustes = ajustesJuegos();
  return CATALOGO.map((g) => ({
    id: g.id, nombre: g.name, nuevoDeSerie: Boolean(g.isNew),
    estado: ajustes[g.id]?.estado || 'normal', nuevo: ajustes[g.id]?.nuevo ?? null,
    si: votos[g.id]?.si || 0, no: votos[g.id]?.no || 0,
    partidas: partidas[g.id]?.total || 0, partidasMes: partidas[g.id]?.mes || 0,
    visitasMes: visitas[g.id]?.n || 0, personasMes: visitas[g.id]?.personas || 0
  }));
}
router.get('/juegos', (req, res) => res.json({ success: true, juegos: estadisticasJuegos(), top: topCreador() }));
router.post('/juegos/:id', (req, res) => {
  const id = String(req.params.id);
  if (!nombreJuego[id]) return res.status(404).json({ error: 'Ese juego no existe.' });
  const cambios = {};
  if (['normal', 'mantenimiento', 'oculto'].includes(req.body?.estado)) cambios.estado = req.body.estado;
  if ('nuevo' in (req.body || {})) cambios.nuevo = req.body.nuevo === null ? null : Boolean(req.body.nuevo);
  cambiarJuego(id, cambios);
  res.json({ success: true, ajustes: ajustesJuegos()[id] || {} });
});
router.post('/top', (req, res) => {
  const lista = Array.isArray(req.body?.lista) ? req.body.lista.map(String).filter((id) => nombreJuego[id]) : null;
  res.json({ success: true, top: cambiarTop(lista) });
});

/* ───────── Anuncio en la portada ───────── */
router.get('/anuncio', (req, res) => res.json({ success: true, anuncio: anuncio() }));
router.post('/anuncio', (req, res) => {
  const texto = String(req.body?.texto || '').trim().slice(0, 300);
  if (!texto) { cambiarAnuncio(null); return res.json({ success: true, anuncio: null }); }
  const tipo = ['info', 'aviso', 'novedad'].includes(req.body?.tipo) ? req.body.tipo : 'info';
  const horas = Math.max(0, Math.min(24 * 60, Number(req.body?.horas) || 0));
  const enlace = /^\/[\w/#?=&.-]*$/.test(String(req.body?.enlace || '')) ? req.body.enlace : null;
  res.json({ success: true, anuncio: cambiarAnuncio({ texto, tipo, enlace, hasta: horas ? Date.now() + horas * 3600_000 : null }) });
});

/* ───────── Moderación ───────── */
router.get('/moderacion', (req, res) => {
  res.json({
    success: true,
    palabras: palabrasProhibidas(),
    bloqueados: listaBloqueados(),
    grupos: intentar(() => db.prepare('SELECT g.codigo, g.nombre, g.creador, g.creado, (SELECT COUNT(*) FROM grupo_miembros m WHERE m.codigo = g.codigo) AS miembros FROM grupos g ORDER BY g.creado DESC LIMIT 100').all(), []),
    preguntas: intentar(() => db.prepare('SELECT id, codigo, juego, texto, autor, creado FROM grupo_preguntas ORDER BY creado DESC LIMIT 150').all(), []),
    jugadores: intentar(() => db.prepare('SELECT jugador, MAX(fecha) AS ultima, COUNT(*) AS partidas FROM registros_resultados GROUP BY jugador ORDER BY ultima DESC LIMIT 150').all(), [])
  });
});
router.post('/moderacion/palabras', (req, res) => res.json({ success: true, palabras: cambiarPalabras(String(req.body?.texto || '').split(/[\n,]+/)) }));
router.post('/moderacion/bloquear', (req, res) => {
  const jugador = String(req.body?.jugador || '').trim();
  if (!/^.{1,15}#\d{4}$/.test(jugador)) return res.status(400).json({ error: 'Escribe el nombre completo, como Ana#1234.' });
  if (req.body?.quitar) desbloquear(jugador); else bloquear(jugador, req.body?.motivo);
  res.json({ success: true, bloqueados: listaBloqueados() });
});
router.post('/moderacion/borrar', (req, res) => {
  const { tipo, id } = req.body || {};
  if (tipo === 'pregunta') db.prepare('DELETE FROM grupo_preguntas WHERE id = ?').run(Number(id));
  else if (tipo === 'grupo') {
    const codigo = String(id);
    db.transaction(() => {
      ['grupo_preguntas', 'grupo_miembros', 'grupo_activo', 'grupo_expulsados', 'grupo_noches'].forEach((t) => { intentar(() => db.prepare(`DELETE FROM ${t} WHERE codigo = ?`).run(codigo)); });
      db.prepare('DELETE FROM grupos WHERE codigo = ?').run(codigo);
    })();
  } else if (tipo === 'renombrar') {
    const nombre = String(req.body?.nombre || '').trim().slice(0, 30);
    if (!nombre) return res.status(400).json({ error: 'Escribe el nombre nuevo.' });
    db.prepare('UPDATE grupos SET nombre = ? WHERE codigo = ?').run(nombre, String(id));
  } else return res.status(400).json({ error: 'No sé qué borrar.' });
  res.json({ success: true });
});

/* ───────── Cuentas (buscar y restablecer contraseña están en /api/usuarios/admin/…) ───────── */
router.post('/cuentas/borrar', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const u = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  if (!u) return res.status(404).json({ error: 'No hay ninguna cuenta con ese correo.' });
  db.transaction(() => {
    BORRADOS.forEach(([tabla, col]) => { intentar(() => db.prepare(`DELETE FROM ${tabla} WHERE ${col} = ?`).run(u.jugador)); });
    db.prepare('DELETE FROM usuarios WHERE id = ?').run(u.id);
  })();
  res.json({ success: true, jugador: u.jugador });
});
router.post('/cuentas/bloquear', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const u = db.prepare('SELECT jugador FROM usuarios WHERE email = ?').get(email);
  if (!u) return res.status(404).json({ error: 'No hay ninguna cuenta con ese correo.' });
  if (req.body?.quitar) desbloquear(u.jugador); else bloquear(u.jugador, req.body?.motivo || 'Cuenta bloqueada desde el panel');
  // Cerrar sus sesiones abiertas: cambiar la versión invalida las cookies
  db.prepare('UPDATE usuarios SET version = version + 1 WHERE email = ?').run(email);
  res.json({ success: true, jugador: u.jugador });
});

/* ───────── Estado del servidor y copias ───────── */
router.get('/servidor', async (req, res) => {
  const m = process.memoryUsage();
  const { archivo, ...datos } = estadoDatos;
  res.json({
    success: true,
    servidor: {
      arrancado, encendidoMs: Date.now() - arrancado, node: process.version,
      memoriaMB: Math.round(m.rss / 1048576), heapMB: Math.round(m.heapUsed / 1048576),
      cargaCpu: os.loadavg()[0], memoriaLibreMB: Math.round(os.freemem() / 1048576), memoriaTotalMB: Math.round(os.totalmem() / 1048576),
      salas: listarSalas().length, jugadoresEnSalas: listarSalas().reduce((a, s) => a + s.jugadores.length, 0)
    },
    datos, copias: listarCopias()
  });
});
router.post('/servidor/subir', async (req, res) => { await subirAhora(); res.json({ success: true }); });
router.post('/copias/hacer', (req, res) => {
  const r = hacerCopia();
  if (!r) return res.status(500).json({ error: 'No se pudo guardar la copia.' });
  res.json({ success: true, copias: listarCopias() });
});
router.get('/copias/:nombre', (req, res) => {
  const r = rutaCopia(req.params.nombre);
  if (!r) return res.status(404).json({ error: 'Esa copia no existe.' });
  res.download(r, req.params.nombre);
});
router.post('/copias/restaurar', (req, res) => {
  if (req.body?.confirmar !== 'RESTAURAR') return res.status(400).json({ error: 'Falta la confirmación.' });
  const r = restaurarCopia(String(req.body?.nombre || ''));
  if (!r.ok) return res.status(400).json({ error: r.error });
  res.json({ success: true, ...r, copias: listarCopias() });
});

/* ───────── Exportar a CSV ───────── */
const csv = (filas, columnas) => [columnas.join(';'), ...filas.map((f) => columnas.map((c) => {
  const v = f[c] == null ? '' : String(f[c]);
  return /[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}).join(';'))].join('\n');
const fecha = (t) => (t ? new Date(t).toISOString().replace('T', ' ').slice(0, 16) : '');
router.get('/exportar/:tipo', (req, res) => {
  let texto;
  switch (req.params.tipo) {
    case 'juegos': texto = csv(estadisticasJuegos(), ['id', 'nombre', 'estado', 'si', 'no', 'partidas', 'partidasMes', 'visitasMes', 'personasMes']); break;
    case 'reportes': texto = csv(db.prepare('SELECT * FROM reportes ORDER BY fecha DESC').all().map((r) => ({ ...r, fecha: fecha(r.fecha) })), ['id', 'fecha', 'tipo', 'estado', 'juego', 'quien', 'mensaje', 'ruta', 'navegador']); break;
    case 'errores': texto = csv(db.prepare('SELECT * FROM errores_web ORDER BY ultima DESC').all().map((e) => ({ ...e, primera: fecha(e.primera), ultima: fecha(e.ultima) })), ['juego', 'mensaje', 'veces', 'primera', 'ultima', 'ruta', 'navegador']); break;
    case 'cuentas': texto = csv(db.prepare('SELECT email, jugador, creado, acceso FROM usuarios ORDER BY creado DESC').all().map((u) => ({ ...u, creado: fecha(u.creado), acceso: fecha(u.acceso) })), ['email', 'jugador', 'creado', 'acceso']); break;
    default: return res.status(404).json({ error: 'No sé exportar eso.' });
  }
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="${req.params.tipo}-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(`﻿${texto}`); // con BOM, para que Excel lea bien las tildes
});

/* ───────── Reto diario ───────── */
router.get('/reto', (req, res) => res.json({ success: true, dias: proximosRetos(8), tipos: TIPOS_RETO() }));
router.post('/reto', (req, res) => {
  const r = cambiarReto(String(req.body?.fecha || ''), req.body?.tipo ? String(req.body.tipo) : null);
  if (!r.ok) return res.status(400).json({ error: r.error });
  res.json({ success: true, ...r, dias: proximosRetos(8) });
});

export default router;
