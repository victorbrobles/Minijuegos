// Simulación de «El Escondite»: partidas completas con jugadores al azar y comprobación de la puntuación.
import assert from 'assert';
import { M, minimoOpciones } from '../../client/src/games/Escondite/engine.js';
import { elegir } from '../routes/escondite.js';
import { TODAS } from '../data/seeds/escondite/index.js';
import { nombreOpcion } from '../../client/src/games/comun/simultaneo.js';

assert.equal(TODAS.length, 200);
TODAS.forEach((c) => assert.ok(c.opciones.length >= 5 && c.opciones.length <= 11, c.titulo));
for (const n of [3, 6, 12]) {
  const items = elegir(new Set(), n * 4, n);
  assert.equal(items.length, n * 4);
  items.forEach((c) => assert.ok(c.opciones.length >= minimoOpciones(n)));
}
// Partida dirigida: 3 jugadores, la ronda 1 se esconde el 1
let p = M.crearPartida([1, 2, 3].map((id) => ({ id, nombre: `J${id}` })), [TODAS[0], TODAS[1]], {}, 0);
assert.equal(p.ext.escondido, 1);
const r = M.responder(p, 1, 'el miño', 1);
assert.equal(r.ok, false); assert.ok(r.opciones.includes('Tajo'));
assert.ok(M.responder(p, 1, 'guadiana', 1).ok);
assert.ok(M.responder(p, 2, 'Tajo', 1).ok);
assert.ok(M.responder(p, 3, 'Ebro', 1).ok);
assert.equal(p.fase, 'resuelta');
assert.deepEqual(p.jugadores.map((j) => j.puntos), [1, 0, 0]);
M.siguiente(p, 2);
assert.equal(p.ext.escondido, 2);
M.responder(p, 2, 'Sevilla', 3); M.responder(p, 1, 'sevilla', 3); M.responder(p, 3, 'Cádiz', 3);
assert.deepEqual(p.jugadores.map((j) => j.puntos), [2, 0, 0]);
M.siguiente(p, 4);
assert.equal(p.fase, 'fin'); assert.deepEqual(p.fin.ganadores, [1]);
// Partidas al azar
for (let k = 0; k < 200; k++) {
  const n = 3 + (k % 10);
  const items = elegir(new Set(), n * 2, n);
  p = M.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i}` })), items, {}, 0);
  let t = 0;
  while (p.fase !== 'fin') {
    const it = p.items[p.ronda - 1];
    p.jugadores.forEach((j) => { if (Math.random() < 0.05) return; M.responder(p, j.id, nombreOpcion(it.opciones[Math.floor(Math.random() * it.opciones.length)]), t); });
    t += 61000; M.tick(p, t);
    assert.equal(p.fase, 'resuelta');
    M.vistaDe(p, 1);
    M.siguiente(p, t);
  }
}
console.log('El Escondite: OK');
