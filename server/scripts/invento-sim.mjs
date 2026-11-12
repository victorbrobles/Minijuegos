// Simulación de «El Invento del Siglo»: rondas, votos por letra y puntos.
import assert from 'node:assert/strict';
import * as E from '../invento/engine.js';
import { OBJETOS, PROBLEMAS, RASGOS } from '../data/seeds/invento/cartas.js';

const M = { objeto: OBJETOS, problema: PROBLEMAS, rasgo: RASGOS };
const J = [1, 2, 3, 4].map((id) => ({ id, nombre: `J${id}` }));
let t = 0;
const p = E.crearPartida(J, M, { rondas: 2, segundos: 120 }, t);
assert.ok(p.cartas[1].objeto && p.cartas[1].problema && p.cartas[1].rasgo);
const antes = p.cartas[1].rasgo;
assert.ok(E.cambiarCarta(p, 1, 'rasgo').ok);
assert.notEqual(p.cartas[1].rasgo, antes);
assert.equal(E.cambiarCarta(p, 1, 'objeto').ok, false, 'solo un cambio');
assert.equal(E.inventar(p, 1, 'X', 'corto').ok, false);
for (const id of [1, 2, 3, 4]) assert.ok(E.inventar(p, id, `Invento ${id}`, 'Una descripción suficientemente larga', t).ok);
assert.equal(p.fase, 'votar');
const v = E.vistaDe(p, 2);
assert.ok(v.inventos.every((x) => x.autor === null && !('clave' in x)), 'anónimos');
const mia = v.inventos.find((x) => x.mio).letra;
const otra = v.inventos.find((x) => !x.mio).letra;
assert.equal(E.votar(p, 2, { compraria: mia, absurdo: otra, exito: otra }).ok, false, 'no a uno mismo');
// Todos votan al invento de J1 salvo él mismo
const letraDe = (id) => String.fromCharCode(65 + p.orden.indexOf(id));
for (const id of [2, 3, 4]) E.votar(p, id, { compraria: letraDe(1), absurdo: letraDe(1), exito: letraDe(1) });
E.votar(p, 1, { compraria: letraDe(2), absurdo: letraDe(3), exito: letraDe(4) });
assert.equal(p.fase, 'resultados');
assert.equal(p.jugadores[0].puntos, 9 + 3 * E.AJUSTES.bonusCategoria);
assert.equal(E.vistaDe(p, 3).inventos.find((x) => x.autor === 1).votos.compraria, 3);
E.siguiente(p, t);
// Ronda 2: se acaba el tiempo con solo dos inventos
E.inventar(p, 2, 'Algo', 'Una descripción suficientemente larga', t);
E.inventar(p, 3, 'Otro', 'Una descripción suficientemente larga', t);
E.tick(p, t + 121_000);
assert.equal(p.fase, 'votar');
assert.equal(p.orden.length, 3); // dos inventos + el de la casa
E.forzar(p);
E.siguiente(p, t);
assert.equal(p.fase, 'fin');
assert.deepEqual(p.fin.ganadores, [1]);
assert.ok(p.fin.mejor.nombre === 'Invento 1');
console.log('invento-sim OK');

// Con dos jugadores entra el invento de la casa; con veinte, todo cuadra
for (const n of [E.AJUSTES.min, E.AJUSTES.max]) {
  const JJ = Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` }));
  const q = E.crearPartida(JJ, M, { rondas: 2, segundos: 120 }, 0);
  for (let r = 0; r < 2; r++) {
    JJ.forEach((j) => assert.ok(E.inventar(q, j.id, `Invento ${j.id}`, 'Una descripción suficientemente larga', 0).ok));
    assert.equal(q.fase, 'votar');
    assert.equal(q.orden.length, n === 2 ? 3 : n);
    const vv = E.vistaDe(q, 1);
    if (n === 2) assert.ok(vv.inventos.some((x) => x.casa) && vv.inventos.find((x) => x.casa).nombre);
    JJ.forEach((j) => {
      const otras = E.vistaDe(q, j.id).inventos.filter((x) => !x.mio).map((x) => x.letra);
      const el = () => otras[Math.floor(Math.random() * otras.length)];
      assert.ok(E.votar(q, j.id, { compraria: el(), absurdo: el(), exito: el() }).ok);
    });
    assert.equal(q.fase, 'resultados');
    E.siguiente(q, 0);
  }
  assert.equal(q.fase, 'fin');
  assert.ok(q.fin.mejor === null || q.fin.mejor.autor !== E.CASA);
}
console.log('invento-sim OK (2 y 20 jugadores)');
