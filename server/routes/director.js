// server/routes/director.js
// «Director Deportivo» online: cada uno dirige su club y puja en secreto; los huecos los ocupan clubes de la máquina.
// Motor en ../director/engine.js; salas de ../lib/salasJuego.js.
import express from 'express';
import * as E from '../director/engine.js';
import { FUTBOLISTAS } from '../data/seeds/director/futbolistas.js';
import { montarSalas } from '../lib/salasJuego.js';

const router = express.Router();
const leerConfig = (b, c = { presupuesto: 200, mercados: 4 }) => ({
  presupuesto: E.OPCIONES.presupuesto.includes(Number(b.presupuesto)) ? Number(b.presupuesto) : c.presupuesto,
  mercados: E.OPCIONES.mercados.includes(Number(b.mercados)) ? Number(b.mercados) : c.mercados
});

// Un solo dispositivo: el cliente juega con el motor copiado y pide aquí la base de futbolistas.
router.get('/futbolistas', (req, res) => res.json({ success: true, futbolistas: FUTBOLISTAS }));

// Las salas comunes esperan partida.jugadores: aquí son los clubes humanos.
const MOTOR = {
  ...E,
  crearPartida: (jugadores, items, reglas, ahora) => {
    const p = E.crearPartida(jugadores, FUTBOLISTAS, reglas, ahora);
    Object.defineProperty(p, 'jugadores', { get: () => p.clubes.filter((c) => !c.bot || jugadores.some((j) => j.id === c.id)), enumerable: false });
    return p;
  }
};

montarSalas(router, {
  engine: MOTOR,
  sinItems: true,
  min: E.AJUSTES.min,
  max: E.AJUSTES.max,
  config: leerConfig({}),
  validarConfig: leerConfig,
  prepararItems: async (sala) => ({ items: [], reglas: { ...sala.config } }),
  accion: (M, p, d, { id, esAdmin, ahora }) => {
    const soloAdmin = { ok: false, error: 'Solo el anfitrión.' };
    switch (d.tipo) {
      case 'formacion': return M.elegirFormacion(p, id, d.formacion);
      case 'pujar': return M.pujar(p, id, d.pujas || {});
      case 'retirar': return M.retirar(p, id);
      case 'seguir': return M.seguir(p, id);
      case 'tactica': return M.elegirTactica(p, id, d.tactica, ahora);
      case 'jornada': return esAdmin ? M.avanzarJornada(p, ahora) : soloAdmin;
      case 'forzar': return esAdmin ? M.forzar(p, ahora) : soloAdmin;
      case 'terminar': return esAdmin ? M.terminar(p, ahora) : soloAdmin;
      default: return null;
    }
  }
});

export default router;
