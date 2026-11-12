// server/routes/lapiz.js
// «¡Lápiz fuera!» online y contenido del modo un dispositivo. Motor: client/src/games/Lapiz/engine.js.
import express from 'express';
import { M } from '../../client/src/games/Lapiz/engine.js';
import { accionSimultaneo } from '../../client/src/games/comun/simultaneo.js';
import { montarSalas } from '../lib/salasJuego.js';
import { limitesOnline } from '../../client/src/games/limites.js';
import { rondasValidas, totalRondas } from '../../client/src/games/rondas.js';

const router = express.Router();
const barajar = (l) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// Letras con las que se puede jugar sin sufrir (sin K, Ñ, Q, W, X, Y, Z)
export const LETRAS = 'ABCDEFGHIJLMNOPRSTUV'.split('');
const FIJAS = ['Nombre', 'Animal', 'País o ciudad', 'Cosa u objeto'];
const VARIAS = [
  'Apellido', 'Fruta o verdura', 'Comida o plato', 'Color', 'Marca', 'Profesión', 'Futbolista', 'Equipo de fútbol', 'Película o serie',
  'Cantante o grupo', 'Deporte', 'Parte del cuerpo', 'Prenda de ropa', 'Personaje famoso', 'Algo de la cocina', 'Instrumento musical',
  'Verbo', 'Adjetivo', 'Algo que se lleva a la playa', 'Insulto cariñoso', 'Bebida', 'Personaje de ficción', 'Medio de transporte', 'Río, monte o mar'
];

export function elegir(n) {
  const letras = barajar(LETRAS).slice(0, n);
  return letras.map((letra) => ({ letra, categorias: [...FIJAS, ...barajar(VARIAS).slice(0, 4)] }));
}

router.get('/local', (req, res) => res.json({ success: true, items: elegir(totalRondas('lapiz', req.query.r)) }));

montarSalas(router, {
  ...limitesOnline('lapiz'),
  engine: M,
  config: { rondas: rondasValidas('lapiz') },
  validarConfig: (b, c) => ({ ...c, rondas: rondasValidas('lapiz', b.rondas, c.rondas) }),
  reglas: () => ({}),
  prepararItems: async (sala) => elegir(totalRondas('lapiz', sala.config.rondas)),
  accion: accionSimultaneo
});

export default router;
