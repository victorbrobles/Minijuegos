// server/lib/usuarios.js
// Cuentas de usuario: correo + contraseña + nick («Nick#1234»).
//  - Contraseñas guardadas con scrypt (sal aleatoria), nunca en claro.
//  - Sesión en una cookie segura (HttpOnly, SameSite=Lax) firmada por el servidor: no hace falta guardarla en la base.
//  - Un «Nick#1234» que pertenece a una cuenta solo lo puede usar quien haya iniciado sesión con ella. Los que no
//    tienen cuenta (invitados) se pueden seguir usando como siempre.
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import db from '../db.js';

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    hash TEXT NOT NULL,
    jugador TEXT NOT NULL UNIQUE,
    version INTEGER NOT NULL DEFAULT 1,
    datos TEXT,
    creado INTEGER NOT NULL,
    acceso INTEGER
  );
  CREATE TABLE IF NOT EXISTS ajustes_servidor (clave TEXT PRIMARY KEY, valor TEXT NOT NULL);
`);

/* ───────── Contraseñas ───────── */
const N = 16384;
export function hashPassword(pw) {
  const sal = randomBytes(16).toString('hex');
  const h = scryptSync(String(pw), sal, 64, { N }).toString('hex');
  return `scrypt$${sal}$${h}`;
}
export function passwordCorrecta(pw, guardado) {
  const [tipo, sal, h] = String(guardado || '').split('$');
  if (tipo !== 'scrypt' || !sal || !h) return false;
  const a = Buffer.from(h, 'hex');
  const b = scryptSync(String(pw), sal, a.length, { N });
  return a.length === b.length && timingSafeEqual(a, b);
}

/* ───────── Sesión (cookie firmada) ───────── */
let secreto = process.env.SESION_SECRET || db.prepare("SELECT valor FROM ajustes_servidor WHERE clave = 'sesion'").get()?.valor;
if (!secreto) {
  db.prepare("INSERT OR IGNORE INTO ajustes_servidor (clave, valor) VALUES ('sesion', ?)").run(randomBytes(32).toString('hex'));
  secreto = db.prepare("SELECT valor FROM ajustes_servidor WHERE clave = 'sesion'").get().valor;
}
const COOKIE = 'mj_sesion';
const DURACION_MS = 180 * 24 * 60 * 60 * 1000; // 6 meses como máximo…
// …pero la sesión se cierra tras 15 minutos sin usar la app. El móvil avisa de que se está usando (POST /latido) como
// mucho una vez por minuto; damos 2 minutos de margen por si ese aviso se retrasa.
export const INACTIVIDAD_MS = 15 * 60 * 1000;
const MARGEN_MS = 2 * 60 * 1000;
const firmar = (s) => createHmac('sha256', secreto).update(s).digest('base64url');

// `adm`: hasta cuándo vale el modo administrador en ESTA sesión (solo lo pone /api/admin/entrar). Va dentro de la
// cookie firmada de la cuenta: es de quien lo activó y en este navegador; al cerrar la sesión desaparece con ella.
export function crearSesion(res, req, usuario, { adm = 0 } = {}) {
  const datos = Buffer.from(JSON.stringify({ u: usuario.id, v: usuario.version, exp: Date.now() + DURACION_MS, ult: Date.now(), ...(adm > Date.now() ? { adm } : {}) })).toString('base64url');
  res.cookie(COOKIE, `${datos}.${firmar(datos)}`, { httpOnly: true, sameSite: 'lax', secure: req.secure, maxAge: DURACION_MS, path: '/' });
}
export const cerrarSesion = (res) => res.clearCookie(COOKIE, { path: '/' });

function leerCookie(req, nombre) {
  const c = req.headers.cookie || '';
  for (const trozo of c.split(';')) {
    const i = trozo.indexOf('=');
    if (i > 0 && trozo.slice(0, i).trim() === nombre) return decodeURIComponent(trozo.slice(i + 1).trim());
  }
  return null;
}

const porId = db.prepare('SELECT id, email, jugador, version, creado FROM usuarios WHERE id = ?');
/** Middleware: pone en req.usuario la cuenta con sesión iniciada (o null). */
export function leerSesion(req, res, next) {
  req.usuario = null; req.admin = false; req.adminHasta = 0;
  const valor = leerCookie(req, COOKIE);
  if (valor) {
    const [datos, firma] = valor.split('.');
    const esperada = datos ? firmar(datos) : '';
    if (firma && esperada.length === firma.length && timingSafeEqual(Buffer.from(esperada), Buffer.from(firma))) {
      try {
        const s = JSON.parse(Buffer.from(datos, 'base64url').toString());
        const inactiva = !s.ult || Date.now() - s.ult > INACTIVIDAD_MS + MARGEN_MS;
        const u = s.exp > Date.now() && !inactiva ? porId.get(s.u) : null;
        if (u && u.version === s.v) { // cambiar la contraseña invalida las sesiones antiguas
          req.usuario = u;
          if (s.adm > Date.now()) { req.admin = true; req.adminHasta = s.adm; }
        }
        else if (inactiva) { req.sesionCaducada = true; cerrarSesion(res); }
      } catch { /* cookie rota */ }
    }
  }
  next();
}

/* ───────── ¿Puede esta petición actuar como este jugador? ───────── */
const dueno = db.prepare('SELECT id FROM usuarios WHERE jugador = ? COLLATE NOCASE');
export const tieneCuenta = (jugador) => Boolean(jugador && dueno.get(String(jugador)));
/**
 * true si `jugador` es un invitado (nadie tiene cuenta con ese Nick#número) o es la cuenta con la sesión iniciada.
 * Así nadie puede hacerse pasar por alguien con cuenta (unirse a sus grupos, guardar a su nombre…).
 */
export function puedeActuarComo(req, jugador) {
  if (!jugador) return true;
  if (req.usuario && req.usuario.jugador.toLowerCase() === String(jugador).toLowerCase()) return true;
  return !tieneCuenta(jugador);
}
/** Responde 403 si no puede; devuelve true si se ha respondido (para cortar la ruta). */
export function bloquearSiNoEs(req, res, jugador) {
  if (puedeActuarComo(req, jugador)) return false;
  res.status(403).json({ error: `«${jugador}» tiene cuenta: inicia sesión para jugar con ese nombre.`, necesitaSesion: true });
  return true;
}
