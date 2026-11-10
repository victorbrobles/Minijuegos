// server/routes/pareja.js
// «La Pareja Perfecta»: sale un elemento y cuatro posibles parejas; quien pulsa primero elige una.
// La dificultad sube por tercios de la partida (nivel 1, 2 y 3) y los puntos se multiplican por el nivel.
// Motor común de pulsador (../pulsador/engine.js) y salas de ../lib/salasJuego.js.
import express from 'express';
import { CATEGORIAS } from '../data/seeds/pareja/parejas.js';
import { montarSalas } from '../lib/salasJuego.js';
import { REGLAS, OPCIONES_RONDAS } from '../pulsador/engine.js';

const router = express.Router();
const barajar = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const TODAS = CATEGORIAS.flatMap((c) => c.parejas.map(([elemento, pareja, nivel]) => ({ cat: c, elemento, pareja, nivel, clave: `${c.id}:${elemento}` })));
const NIVELES = ['', 'Fácil', 'Media', 'Difícil'];

/** Tres parejas falsas de la misma categoría (primero del mismo nivel, para que no canten). */
function distractores(x) {
  const otras = TODAS.filter((y) => y.cat === x.cat && y.pareja !== x.pareja);
  const mismas = barajar(otras.filter((y) => y.nivel === x.nivel));
  const resto = barajar(otras.filter((y) => y.nivel !== x.nivel));
  return [...mismas, ...resto].slice(0, 3).map((y) => y.pareja);
}
export const itemDe = (x) => ({
  pistas: [{ tipo: 'frase', etiqueta: `${x.cat.emoji} ${x.cat.nombre} · ${NIVELES[x.nivel]}${x.nivel > 1 ? ` (×${x.nivel})` : ''}`, valor: x.elemento }],
  opciones: barajar([x.pareja, ...distractores(x)]),
  correcta: x.pareja,
  multiplicador: x.nivel,
  pregunta: x.cat.pregunta,
  solucion: { titulo: x.pareja, detalle: `${x.elemento} → ${x.pareja}` }
});

/** n parejas sin repetir en la sala: el primer tercio fáciles, luego medias y al final difíciles. */
export function elegir(usados, n) {
  const cuantos = [Math.ceil(n / 3), Math.ceil((n - Math.ceil(n / 3)) / 2)];
  cuantos.push(n - cuantos[0] - cuantos[1]);
  const out = [];
  [1, 2, 3].forEach((nivel, i) => {
    let libres = TODAS.filter((x) => x.nivel === nivel && !usados.has(x.clave));
    if (libres.length < cuantos[i]) { TODAS.filter((x) => x.nivel === nivel).forEach((x) => usados.delete(x.clave)); libres = TODAS.filter((x) => x.nivel === nivel); }
    // Sin repetir categoría seguida si se puede
    const elegidos = [];
    for (const x of barajar(libres)) {
      if (elegidos.length >= cuantos[i]) break;
      if (elegidos.filter((y) => y.cat === x.cat).length < Math.ceil(cuantos[i] / CATEGORIAS.length)) elegidos.push(x);
    }
    for (const x of barajar(libres)) { if (elegidos.length >= cuantos[i]) break; if (!elegidos.includes(x)) elegidos.push(x); }
    elegidos.forEach((x) => usados.add(x.clave));
    out.push(...barajar(elegidos));
  });
  return out.map(itemDe);
}
const rondasValidas = (n, def = 10) => (OPCIONES_RONDAS.includes(Number(n)) ? Number(n) : def);

router.get('/local', (req, res) => {
  res.json({ success: true, reglas: REGLAS.pareja, items: elegir(new Set(), rondasValidas(req.query.n)) });
});

montarSalas(router, {
  config: { rondas: 10 },
  validarConfig: (b, c) => ({ ...c, rondas: rondasValidas(b.rondas, c.rondas) }),
  reglas: () => REGLAS.pareja,
  prepararItems: async (sala) => elegir(sala.usados, sala.config.rondas)
});

export default router;
