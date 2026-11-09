// Simulación del motor de «Bingoball»: jugadores que marcan bien o mal hasta que alguien canta bingo.
import * as E from '../bingoball/engine.js';
import { BINGOS } from '../data/seeds/bingoball/bingoballData.js';

const bingos = Object.values(BINGOS);
let bingosCantados = 0; let futbolistas = 0;
for (let k = 0; k < 200; k++) {
  const bingo = bingos[k % bingos.length];
  const n = 2 + (k % 6);
  let t = 1e6;
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` })), bingo, t);
  let pasos = 0;
  while (p.fase !== 'fin' && pasos++ < 20000) {
    t += 3000 + Math.random() * 9000;
    E.tick(p, t);
    if (p.fase !== 'jugando') continue;
    for (const j of p.jugadores) {
      if (j.fuera) continue;
      const v = E.vistaDe(p, j.id);
      const f = v.futbolista.nombre;
      const buena = v.yo.carton.find((c) => !c.marcada && bingo.categorias.find((x) => x.nombre === c.nombre).jugadores.includes(f));
      if (buena && Math.random() < 0.8) E.marcar(p, j.id, buena.id, t);
      else if (Math.random() < 0.1) { const c = v.yo.carton.find((x) => !x.marcada); if (c) E.marcar(p, j.id, c.id, t); }
      if (p.fase === 'fin') break;
    }
  }
  if (p.fase !== 'fin') throw new Error('partida sin acabar ' + bingo.id);
  if (p.ganadorId) bingosCantados++;
  futbolistas += p.numero;
  if (p.jugadores.some((j) => j.puntos < 0)) throw new Error('puntos negativos');
}
console.log(`OK: 200 partidas terminadas (bingos ${bingosCantados}, media de ${Math.round(futbolistas / 200)} futbolistas por partida).`);
