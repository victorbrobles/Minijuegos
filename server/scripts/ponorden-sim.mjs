// Simulación de «Ponlo en orden»: rondas válidas y puntuación.
import assert from 'assert';
import { M, solucion, puntosOrden, PERFECTO } from '../../client/src/games/PonOrden/engine.js';
import { elegir } from '../routes/ponorden.js';
import { TEMAS } from '../data/seeds/ordenar/temas.js';

for (let k = 0; k < 300; k++) elegir(15).forEach((it) => { assert.equal(it.elementos.length, 6); assert.equal(new Set(it.elementos.map((e) => e.valor)).size, 6); });
TEMAS.forEach((t) => assert.ok(t.items.length >= 6, t.id));
const it = elegir(1)[0];
const s = solucion(it);
assert.equal(puntosOrden(it, s).puntos, PERFECTO);
assert.equal(puntosOrden(it, [...s].reverse()).aciertos, 0);
const p = M.crearPartida([1, 2].map((id) => ({ id, nombre: `J${id}` })), [it, ...elegir(1)], {}, 0);
assert.equal(M.responder(p, 1, [0, 1, 2], 1).ok, false);
assert.ok(M.responder(p, 1, s, 1).ok);
assert.ok(M.responder(p, 2, [...s].reverse(), 1).ok);
assert.equal(p.fase, 'resuelta');
assert.deepEqual(p.jugadores.map((j) => j.puntos), [PERFECTO, 0]);
M.siguiente(p, 2); M.tick(p, 2 + 76000); assert.equal(p.fase, 'resuelta'); M.siguiente(p, 3); assert.equal(p.fase, 'fin');
console.log('Ponlo en orden: OK');
