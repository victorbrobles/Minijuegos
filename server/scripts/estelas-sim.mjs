// Prueba de «Estelas»: rondas con bots hasta el final; los rastros no se pisan y la sincronización cuadra.
import assert from 'assert';
import * as E from '../../client/src/games/Estelas/engine.js';
for (let k = 0; k < 20; k++) {
  const n = 2 + (k % 7);
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i}`, bot: true })), [], { rondas: 3 }, 0);
  let t = 0; let pasos = 0;
  while (p.fase !== 'fin' && t < 5e6) {
    t += 50; E.tick(p, t);
    if (p.fase === 'jugando') {
      const celdas = new Set();
      p.jugadores.forEach((j) => j.rastro.forEach(([x, y]) => { const c = `${x},${y}`; assert.ok(!celdas.has(c), 'dos rastros en la misma casilla'); celdas.add(c); }));
      pasos = Math.max(pasos, p.paso);
    }
  }
  assert.equal(p.fase, 'fin');
  assert.ok(p.fin.ganadores.length >= 1);
}
// Sincronización: lo nuevo desde un paso
const p = E.crearPartida([{ id: 1, nombre: 'A', bot: true }, { id: 2, nombre: 'B', bot: true }], [], {}, 0);
E.tick(p, E.SEG_CUENTA * 1000 + 20 * E.PASO_MS);
const s1 = E.sincronizar(p, 1, { desde: -1, ronda: 0 });
const s2 = E.sincronizar(p, 1, { desde: 10, ronda: p.ronda });
assert.equal(s1.jugadores[0].nuevos.length, p.jugadores[0].rastro.length);
assert.equal(s2.jugadores[0].nuevos.length, p.jugadores[0].rastro.length - 11);
// giros: no se puede dar media vuelta
const j = p.jugadores[0]; const antes = j.dir; E.girar(p, 1, (antes + 2) % 4); assert.equal(j.cola.length, 0);
console.log('Estelas: 20 partidas con bots y sincronización. OK');
