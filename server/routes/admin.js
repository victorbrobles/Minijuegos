import { Router } from 'express';
import { codigoCorrecto, crearToken, esAdmin, mfaConfigurado } from '../lib/admin.js';

const router = Router();

// Intentos fallidos en una ventana de 15 minutos: máx. 5 por IP y máx. 10 en total (para que
// repartir los intentos entre muchas IPs tampoco permita adivinar el código de 6 dígitos).
const VENTANA_MS = 15 * 60 * 1000;
const MAX_POR_IP = 5;
const MAX_GLOBAL = 10;
const fallosIp = new Map(); // ip -> [instantes]
let fallosGlobal = [];

const recientes = (lista) => lista.filter((t) => Date.now() - t < VENTANA_MS);
function bloqueado(ip) {
  fallosGlobal = recientes(fallosGlobal);
  const deIp = recientes(fallosIp.get(ip) ?? []);
  fallosIp.set(ip, deIp);
  return deIp.length >= MAX_POR_IP || fallosGlobal.length >= MAX_GLOBAL;
}
function anotarFallo(ip) {
  fallosIp.get(ip)?.push(Date.now());
  fallosGlobal.push(Date.now());
}

// POST /api/admin/login  { codigo }  ->  { token }
router.post('/login', async (req, res) => {
  if (!mfaConfigurado) {
    return res.status(503).json({ error: 'El modo administrador no está configurado en el servidor.' });
  }
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
  res.json({ token: crearToken() });
});

// GET /api/admin/status  (cabecera X-Admin-Token)  ->  { admin: true|false }
router.get('/status', (req, res) => res.json({ admin: esAdmin(req) }));

export default router;
