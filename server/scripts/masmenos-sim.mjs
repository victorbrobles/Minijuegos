// Simulación del motor de «Entre dos aguas»: turnos, rachas, tiempo y abandono.
import assert from 'node:assert/strict';
import * as E from '../masmenos/engine.js';
import { CATEGORIAS } from '../data/seeds/masmenos/index.js';

const J = [{ id: 1, nombre: 'Ana' }, { id: 2, nombre: 'Bea' }];
let t = 1_000_000;
const pool = [...CATEGORIAS.cine.data];
const p = E.crearPartida(J, pool, { categoria: { nombre: 'Cine' }, vueltas: 1 }, t);
assert.equal(p.fase, 'turno');
assert.equal(E.listo(p, 2, t).ok, false);
E.listo(p, 1, t);
assert.equal(E.vistaDe(p, 2).cartas[0].valor, null, 'cifras ocultas');
// Ana acierta 5 veces y luego falla
for (let i = 0; i < 5; i++) {
  const [a, b] = p.cartas.map((c) => c.item.valor);
  assert.ok(Math.abs(a - b) > 0.03 * Math.max(a, b) * 0.99, 'sin casi empates');
  E.elegir(p, 1, a >= b ? 0 : 1, t);
  assert.notEqual(E.vistaDe(p, 2).cartas[0].valor, null, 'se revelan');
  t += E.AJUSTES.msRevelar; E.tick(p, t);
}
const [a, b] = p.cartas.map((c) => c.item.valor);
E.elegir(p, 1, a >= b ? 1 : 0, t);
t += E.AJUSTES.msFallo; E.tick(p, t);
assert.equal(p.jugadores[0].puntos, 5);
assert.equal(p.fase, 'turno');
// Bea se queda sin tiempo
E.listo(p, 2, t);
t += E.AJUSTES.segEleccion * 1000; E.tick(p, t);
assert.equal(p.fase, 'fin');
assert.deepEqual(p.fin.ganadores, [1]);
// La carta que más lleva en la mesa es la que sale
const q = E.crearPartida(J, pool, { categoria: {}, vueltas: 2 }, t);
assert.equal(q.orden.length, 4);
E.listo(q, 1, t);
const elegida = q.cartas[0].item.valor >= q.cartas[1].item.valor ? 0 : 1;
const queda = q.cartas[elegida].item.nombre;
E.elegir(q, 1, elegida, t); t += 2000; E.tick(q, t);
assert.equal(q.cartas[elegida].item.nombre, queda, 'en el primer acierto se queda la elegida');
E.abandonar(q, 1, t);
assert.equal(q.fase, 'turno');
assert.equal(q.orden[q.turnoIdx], 2);
console.log('masmenos-sim OK');
