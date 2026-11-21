import { Router } from 'express';
import { codigoCorrecto, esAdmin, mfaConfigurado, DURACION_ADMIN_MS } from '../lib/admin.js';
import { crearSesion } from '../lib/usuarios.js';

const router = Router();

// Intentos fallidos en una ventana de 15 minutos: máx. 5 por IP y máx. 10 en total (para que
// repartir los intentos entre muchas IPs tampoco permita adivinar el código de 6 dígitos).
// Importante: la IP real solo se ve si Express confía en el proxy (ver `trust proxy` en index.js);
// si no, online todos los visitantes compartirían la IP del proxy y un fallo bloquearía a todos.
const VENTANA_MS = 15 * 60 * 1000;
const MAX_POR_IP = 5;
const MAX_GLOBAL = 10;
const fallosIp = new Map(); // ip -> [instantes]
let fallosGlobal = [];

const recientes = (lista) => lista.filter((t) => Date.now() - t < VENTANA_MS);
function bloqueado(ip) {
  fallosGlobal = recientes(fallosGlobal);
  const deIp = recientes(fallosIp.get(ip) ?? []);
  if (deIp.length) fallosIp.set(ip, deIp);
  else fallosIp.delete(ip); // evita que el mapa crezca sin límite
  return deIp.length >= MAX_POR_IP || fallosGlobal.length >= MAX_GLOBAL;
}
function anotarFallo(ip) {
  fallosIp.set(ip, [...(fallosIp.get(ip) ?? []), Date.now()]);
  fallosGlobal.push(Date.now());
}

// POST /api/admin/login  { codigo }  ->  { admin: true }
// Hay que tener la sesión iniciada con una cuenta: el modo administrador se guarda en ESA sesión (cookie firmada).
router.post('/login', async (req, res) => {
  try {
    if (!mfaConfigurado) {
      return res.status(503).json({ error: 'El modo administrador no está configurado en el servidor.' });
    }
    if (!req.usuario) return res.status(403).json({ error: 'Inicia sesión con tu cuenta para activar el modo administrador.', necesitaSesion: true });
    const ip = req.ip;
    if (bloqueado(ip)) {
      return res.status(429).json({ error: 'Demasiados intentos. Prueba de nuevo en unos minutos.' });
    }
    if (!codigoCorrecto(req.body?.codigo)) {
      anotarFallo(ip);
      await new Promise((r) => setTimeout(r, 600)); // frena los intentos automáticos
      return res.status(401).json({ error: 'Código incorrecto.' });
    }
    fallosIp.delete(ip);
    crearSesion(res, req, req.usuario, { adm: Date.now() + DURACION_ADMIN_MS });
    res.json({ admin: true });
  } catch (err) {
    console.error('[admin] Error en /login:', err);
    res.status(500).json({ error: 'Error interno al comprobar el código.' });
  }
});

// POST /api/admin/salir: desactiva el modo administrador sin cerrar la sesión de la cuenta
router.post('/salir', (req, res) => {
  if (req.usuario) crearSesion(res, req, req.usuario);
  res.json({ admin: false });
});

// GET /api/admin/status  ->  { admin: true|false }
router.get('/status', (req, res) => res.json({ admin: esAdmin(req) }));

export default router;
