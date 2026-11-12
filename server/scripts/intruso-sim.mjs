// Simulación de «El Intruso Histórico»: rondas válidas y puntuación por rapidez.
import assert from 'assert';
import { M } from '../../client/src/games/Intruso/engine.js';
import { elegir } from '../routes/intruso.js';

for (let k = 0; k < 300; k++) elegir(15).forEach((it) => { assert.equal(it.opciones.length, 5); assert.equal(new Set(it.opciones).size, 5); assert.ok(it.intruso >= 0 && it.intruso < 5); });
const items = elegir(2);
const p = M.crearPartida([1, 2, 3].map((id) => ({ id, nombre: `J${id}` })), items, {}, 0);
const bien = items[0].intruso; const mal = (bien + 1) % 5;
assert.ok(M.responder(p, 1, { i: bien, ms: 1000 }, 1000).ok);
assert.ok(M.responder(p, 2, { i: bien, ms: 7000 }, 7000).ok);
assert.ok(M.responder(p, 3, { i: mal, ms: 500 }, 500).ok);
assert.deepEqual(p.jugadores.map((j) => j.puntos), [2, 1, 0]);
M.siguiente(p, 8000); M.tick(p, 8000 + 10001); assert.equal(p.fase, 'resuelta');
M.siguiente(p, 20000); assert.equal(p.fase, 'fin');
console.log('El Intruso Histórico: OK');
