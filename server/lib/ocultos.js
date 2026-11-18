// server/lib/ocultos.js
// Juegos ocultos: solo los puede usar el administrador o quien esté con él en la sala de un grupo en ese momento.
// Los navegadores mandan en cada petición la cabecera X-Jugador («Ana#1234», codificada) para saber quién pregunta.
import { esAdmin } from './admin.js';
import { puedeActuarComo } from './usuarios.js';
import { accesoPorGrupo } from '../routes/social.js';

export const JUEGOS_OCULTOS = ['cancion', 'adivina', 'rasgos'];

export function jugadorDe(req) {
  try { return decodeURIComponent(String(req.get('x-jugador') || '')).slice(0, 25); } catch { return ''; }
}

/** ¿Puede esta petición ver y usar los juegos ocultos? */
export function puedeVerOcultos(req) {
  if (esAdmin(req)) return true;
  const jugador = jugadorDe(req);
  return Boolean(jugador) && puedeActuarComo(req, jugador) && accesoPorGrupo(jugador);
}

/** Middleware para las rutas de los juegos ocultos (los créditos de las fotos siguen siendo públicos). */
// Las imágenes y los audios los pide el navegador directamente (<img>, <audio>), sin cabeceras: pasan, porque sin
// acceso a la partida (bloqueada) no se sabe qué pedir. Los créditos de las fotos son públicos.
const LIBRE = /^\/(creditos\/?$|(.*\/)?(imagen|foto|audio)(\/|$))/;
export function soloConAcceso(req, res, next) {
  if (req.method === 'GET' && LIBRE.test(req.path)) return next();
  if (puedeVerOcultos(req)) return next();
  return res.status(403).json({ error: 'Este juego no está disponible.' });
}
