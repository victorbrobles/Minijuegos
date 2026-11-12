// Simulación del motor de «El club de los cuatro»: turnos con respuestas conocidas, desconocidas (juez), pases y tiempos.
import * as E from '../cuatroclubes/engine.js';
import { RETOS, NOMBRES_BASE } from '../data/seeds/cuatroclubes/index.js';

const azar = (a) => a[Math.floor(Math.random() * a.length)];
let plenos = 0; let juez = 0;
for (let k = 0; k < 200; k++) {
  const n = E.AJUSTES.min + (k % (E.AJUSTES.max - E.AJUSTES.min + 1));
  const retos = [...RETOS].sort(() => Math.random() - 0.5).slice(0, 3);
  let t = 1e6;
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` })), retos, NOMBRES_BASE, t);
  let pasos = 0;
  while (p.fase !== 'fin' && pasos++ < 2000) {
    t += 3000;
    E.tick(p, t);
    if (p.fase === 'resuelta') { E.siguiente(p, t); continue; }
    if (p.fase !== 'jugando') continue;
    if (Math.random() < 0.01 && p.jugadores.filter((j) => !j.fuera).length > 1) { E.abandonar(p, azar(p.jugadores.filter((j) => !j.fuera)).id); continue; }
    const v = E.vistaDe(p, 1);
    if (v.revision) { juez++; E.juzgar(p, [Math.random() < 0.5, false, true, false]); continue; }
    if (!v.listo) { E.listo(p, v.turno, t); continue; }
    const r = Math.random();
    if (r < 0.1) E.pasar(p, v.turno);
    else if (r < 0.15) E.tick(p, t + 100000);
    else {
      const reto = retos[p.ronda - 1];
      const nombre = r < 0.6 ? azar(reto.mejores).nombre : r < 0.8 ? azar(NOMBRES_BASE).nombre : 'Jugador Inventado';
      const res = E.responder(p, v.turno, nombre, t);
      if (!res.ok && !/ya se ha dicho/.test(res.error)) throw new Error(res.error);
      if (!res.ok) E.pasar(p, v.turno);
    }
  }
  if (p.fase !== 'fin') throw new Error('partida sin acabar');
  plenos += p.jugadores.reduce((a, j) => a + j.plenos, 0);
}
console.log(`OK: 200 partidas (plenos ${plenos}, decisiones del juez ${juez}).`);
