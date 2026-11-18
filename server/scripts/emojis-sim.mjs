// Prueba de «Biografía en emojis»: modos banco y autor, puntos según los emojis vistos.
import assert from 'assert';
import * as E from '../../client/src/games/Emojis/engine.js';
import { BANCO } from '../../client/src/games/Emojis/banco.js';
assert.equal(new Set(BANCO.map((b) => b.n)).size, BANCO.length, 'repetidos');
BANCO.forEach((b) => { assert.ok(b.e.length >= 4 && b.e.length <= 6, b.n); assert.ok(b.e.every((e) => E.limpiarEmojis(e).length >= 1 && E.limpiarEmojis(e).join('') === e), `emojis raros en ${b.n}: ${b.e.join(' ')}`); });
assert.deepEqual(E.limpiarEmojis('hola ⚽🇪🇸 x 🏆'), ['⚽', '🇪🇸', '🏆']);
// Banco: acertar con el primer emoji da 5, con el tercero 3
let p = E.crearPartida([{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }, { id: 3, nombre: 'C' }], [], { rondas: 6 }, 0);
const bien = p.opciones.indexOf(p.item.n);
E.accion(p, 1, { tipo: 'responder', opcion: bien }, 100);
E.accion(p, 2, { tipo: 'responder', opcion: bien }, 2 * E.MS_EMOJI + 100);
E.accion(p, 3, { tipo: 'responder', opcion: (bien + 1) % 6 }, 200);
assert.deepEqual(p.jugadores.map((j) => j.puntos), [5, 3, 0]);
assert.equal(p.fase, 'resultado');
let t = 0; while (p.fase !== 'fin') { t += 30000; E.tick(p, t); }
assert.equal(p.ronda, 6);
// Autor
p = E.crearPartida([{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }, { id: 3, nombre: 'C' }], [], { rondas: 3, modo: 'autor' }, 0);
assert.equal(p.fase, 'escribir'); assert.equal(p.autor, 1);
assert.equal(E.accion(p, 1, { tipo: 'escribir', elegido: 0, emojis: 'hola' }, 0).ok, false);
assert.ok(E.accion(p, 1, { tipo: 'escribir', elegido: 1, emojis: '🇪🇸⚽🏆' }, 0).ok);
const b2 = p.opciones.indexOf(p.item.n);
E.accion(p, 2, { tipo: 'responder', opcion: b2 }, 50); E.accion(p, 3, { tipo: 'responder', opcion: b2 }, 60);
assert.equal(p.jugadores[0].puntos, 4); // 2 por cada acierto
t = 0; while (p.fase !== 'fin') { t += 60000; E.tick(p, t); }
console.log(`Biografía en emojis: ${BANCO.length} famosos. OK`);
