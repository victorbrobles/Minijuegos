// Simulación del motor de «¡Descarta y Elimina!»: partidas aleatorias con abandonos y comprobaciones.
import * as E from '../descarte/engine.js';
import { TODAS_LAS_CATEGORIAS } from '../data/seeds/descarte/descarte.js';

let partidas = 0;
for (let k = 0; k < 400; k++) {
  const n = 3 + (k % 10);
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` })), { tableros: [3, 5, 7][k % 3] }, TODAS_LAS_CATEGORIAS);
  let t = 0; let pasos = 0;
  while (p.fase !== 'fin' && pasos++ < 5000) {
    t += 1000;
    const r = Math.random();
    if (r < 0.01) { const vivos = p.jugadores.filter((j) => !j.fuera); E.abandonar(p, vivos[Math.floor(Math.random() * vivos.length)].id); continue; }
    if (p.fase === 'retar') {
      const v = E.vistaDe(p, p.retadorId);
      if (!v.elegibles.length) throw new Error('sin elegibles');
      const res = E.retar(p, p.retadorId, { rivalId: v.elegibles[0], categoria: v.categorias[1] });
      if (!res.ok) throw new Error(res.error);
    } else if (p.fase === 'turno') {
      if (r < 0.05) E.pasar(p, p.rivalId); else E.empezar(p, p.rivalId, t);
    } else if (p.fase === 'responder') {
      if (r < 0.1) E.tick(p, t + 31000);
      else if (r < 0.15) E.pasar(p, p.rivalId);
      else if (k % 2) E.marcar(p, r < 0.3 ? null : p.letras[Math.floor(Math.random() * p.letras.length)], r > 0.95);
      else E.elegirLetra(p, p.rivalId, p.letras[Math.floor(Math.random() * p.letras.length)]);
    } else if (p.fase === 'validar') {
      if (r < 0.1) E.elegirLetra(p, p.rivalId, p.letras[0]); else E.validar(p, r < 0.7);
    } else if (p.fase === 'tablero') {
      E.siguienteTablero(p);
    }
    if (p.fase === 'retar') {
      const ret = p.jugadores.find((j) => j.id === p.retadorId);
      if (!ret || ret.fuera) throw new Error('retador fuera ' + p.fase);
    }
    if (['turno', 'responder', 'validar'].includes(p.fase)) {
      const riv = p.jugadores.find((j) => j.id === p.rivalId);
      if (!riv || riv.fuera || riv.id === p.retadorId) throw new Error('rival mal');
    }
  }
  if (p.fase !== 'fin') throw new Error('partida sin acabar');
  partidas++;
}
console.log(`OK: ${partidas} partidas simuladas sin bloqueos.`);
