// server/routes/mus.js
// Mus clásico online: de 2 a 4 personas; los asientos libres los ocupa la máquina.
// Motor en ../mus/engine.js; salas de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../mus/engine.js';
import { montarSalas } from '../lib/salasJuego.js';

const router = express.Router();
export const NOMBRES_BOT = ['Paco', 'Maite', 'Ramón', 'Pili'];

/**
 * Coloca a los jugadores: el anfitrión en el asiento 0 y su compañero (si lo eligió) en el 2; el resto en 1 y 3.
 * Los huecos, bots. Los asientos 0 y 2 forman pareja contra 1 y 3.
 */
export function asientos(jugadores, config) {
  const sitio = [null, null, null, null];
  const [anfitrion, ...resto] = jugadores;
  sitio[0] = anfitrion;
  const comp = resto.find((j) => j.id === config.companero);
  if (comp) sitio[2] = comp;
  const libres = [1, 3, 2].filter((k) => !sitio[k]);
  resto.filter((j) => j !== comp).forEach((j) => { sitio[libres.shift()] = j; });
  let b = 0;
  return sitio.map((j) => j || { id: `bot${++b}`, nombre: `${NOMBRES_BOT[b - 1]} 🤖`, bot: true });
}

const leerConfig = (b, c = { objetivo: 40, vacas: 1, companero: null }) => ({
  objetivo: E.OPCIONES.objetivo.includes(Number(b.objetivo)) ? Number(b.objetivo) : c.objetivo,
  vacas: E.OPCIONES.vacas.includes(Number(b.vacas)) ? Number(b.vacas) : c.vacas,
  companero: b.companero === null ? null : Number.isInteger(Number(b.companero)) && b.companero !== undefined ? Number(b.companero) : c.companero
});

// El motor del mus no usa «items»: se adapta la firma que esperan las salas comunes.
const MOTOR = {
  ...E,
  crearPartida: (jugadores, items, reglas, ahora) => E.crearPartida(asientos(jugadores, reglas), reglas, ahora)
};

montarSalas(router, {
  engine: MOTOR,
  sinItems: true,
  min: 2,
  max: 4,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: [], reglas: { ...sala.config } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    const s = p.jugadores.findIndex((j) => j.id === id);
    if (s === -1) return { ok: false, error: 'No juegas en esta mesa.' };
    switch (d.tipo) {
      case 'mus': return M.mus(p, s, Boolean(d.pide), ahora);
      case 'descartar': return M.descartar(p, s, Array.isArray(d.ids) ? d.ids : [], ahora);
      case 'hablar': return M.hablar(p, s, { tipo: d.accion, cantidad: d.cantidad }, ahora);
      case 'seguir': return M.seguir(p, s, ahora);
      case 'forzar': return esAdmin ? M.forzarSeguir(p, ahora) : { ok: false, error: 'Solo el anfitrión.' };
      case 'terminar': return esAdmin ? M.terminar(p) : { ok: false, error: 'Solo el anfitrión.' };
      default: return null;
    }
  }
});

export default router;
