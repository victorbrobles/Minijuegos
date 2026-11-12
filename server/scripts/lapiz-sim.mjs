// Simulación de «¡Lápiz fuera!»: cierre, borradores, revisión y puntuación.
import assert from 'assert';
import { M, PUNTOS, CIERRE } from '../../client/src/games/Lapiz/engine.js';
import { elegir } from '../routes/lapiz.js';

const it = { letra: 'P', categorias: ['Nombre', 'Animal', 'País o ciudad', 'Cosa u objeto'] };
const p = M.crearPartida([1, 2, 3].map((id) => ({ id, nombre: `J${id}` })), [it, ...elegir(1)], {}, 0);
assert.ok(M.responder(p, 1, ['Pablo', 'Perro', 'Perú', 'Pelota'], 1000).ok);
assert.equal(p.hasta, 1000 + CIERRE * 1000);
M.borrador(p, 2, ['pablo', 'Pato', 'Madrid', '']);
M.tick(p, 1000 + CIERRE * 1000);
assert.equal(p.fase, 'revision');
// El 3 no escribió nada; se anula «Pato» por mayoría (1 y 3 votan)
M.votar(p, 1, '2:1'); M.votar(p, 3, '2:1');
M.finRevision(p);
const r = p.resultado.celdas;
assert.equal(r['1:0'], PUNTOS.repetida); assert.equal(r['2:0'], PUNTOS.repetida); // Pablo repetido
assert.equal(r['1:1'], PUNTOS.sola); // Pato anulado → Perro es la única
assert.equal(r['2:2'], undefined); // Madrid no empieza por P
assert.equal(r['1:3'], PUNTOS.sola);
assert.deepEqual(p.jugadores.map((j) => j.puntos), [5 + 20 + 20 + 20, 5, 0]);
for (let k = 0; k < 50; k++) assert.equal(elegir(7).length, 7);
console.log('¡Lápiz fuera!: OK');
