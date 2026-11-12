// Simulación del motor de «Bingoball»: jugadores que marcan bien o mal hasta que alguien canta bingo.
import * as E from '../bingoball/engine.js';
import { BINGOS } from '../data/seeds/bingoball/bingoballData.js';

const bingos = Object.values(BINGOS);
let bingosCantados = 0; let futbolistas = 0; let lineas = 0;
for (let k = 0; k < 200; k++) {
  const bingo = bingos[k % bingos.length];
  const n = E.AJUSTES.min + (k % (E.AJUSTES.max - E.AJUSTES.min + 1));
  let t = 1e6;
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` })), bingo, t);
  let pasos = 0;
  while (p.fase !== 'fin' && pasos++ < 20000) {
    t += 3000 + Math.random() * 9000;
    E.tick(p, t);
    if (p.fase === 'linea') { E.decidirLinea(p, p.pausa.jugadorId, Math.random() < 0.7, t); lineas++; continue; }
    if (p.fase !== 'jugando') continue;
    // alguien con fila completa pide línea
    if (!p.lineaCantada) {
      for (const j of p.jugadores) {
        const f = [0, 1, 2, 3].find((x) => j.carton.filter((c) => c.fila === x).every((c) => c.marcada));
        if (f != null && Math.random() < 0.5) { const r = E.pedirLinea(p, j.id, f, t); if (!r.ok) throw new Error(r.error); break; }
      }
      if (p.fase === 'linea') continue;
    }
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
  if (p.jugadores.reduce((a, j) => a + j.lineas, 0) > 1) throw new Error('más de una línea');
  for (const j of p.jugadores) { const ids = j.carton.map((c) => c.categoriaId); if (new Set(ids).size !== ids.length) throw new Error('categoría repetida en un cartón'); }
}
// Pesos: el que acaba de salir pesa menos que uno que no ha salido; los que no sirven no aparecen.
{
  const bingo = bingos[0];
  const p = E.crearPartida([{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }], bingo, 0);
  E.tick(p, 11000);
  const w = E.pesos(p);
  const ultimo = p.futbolista.nombre;
  const otro = [...w.keys()].find((f) => f !== ultimo && w.get(f) > 0);
  if (!(w.get(ultimo) < w.get(otro) * 0.5 || w.get(ultimo) === undefined)) throw new Error('recencia');
  const abiertas = new Set(p.jugadores.flatMap((j) => j.carton.map((c) => c.categoriaId)));
  const inutil = bingo.categorias.filter((c) => !abiertas.has(c.id)).flatMap((c) => c.jugadores).find((f) => !bingo.categorias.some((c) => abiertas.has(c.id) && c.jugadores.includes(f)));
  if (inutil && w.has(inutil)) throw new Error('futbolista inútil con peso');
}
console.log(`OK: 200 partidas terminadas (bingos ${bingosCantados}, líneas decididas ${lineas}, media de ${Math.round(futbolistas / 200)} futbolistas por partida).`);
