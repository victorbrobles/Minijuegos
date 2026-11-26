// Prueba de «Biografía en emojis»: respuesta escrita (nombre, apellido o apodo), 3 intentos, puntos según los emojis
// vistos, modo autor, y el banco (5 emojis por famoso, sin la bandera la primera).
import assert from 'assert';
import * as E from '../../client/src/games/Emojis/engine.js';
import { BANCO } from '../../client/src/games/Emojis/banco.js';
assert.equal(new Set(BANCO.map((b) => b.n)).size, BANCO.length, 'repetidos');
BANCO.forEach((b) => {
  assert.equal(b.e.length, 5, b.n);
  assert.ok(b.e.every((e) => E.limpiarEmojis(e).length >= 1 && E.limpiarEmojis(e).join('') === e), `emojis raros en ${b.n}: ${b.e.join(' ')}`);
  assert.ok(!/\p{Regional_Indicator}/u.test(b.e[0]), `la bandera va la primera en ${b.n}`);
  assert.ok(E.esFamoso(b.n, b), `no se acepta su propio nombre: ${b.n}`);
  b.alias.forEach((a) => assert.ok(E.esFamoso(a, b), `alias ${a} de ${b.n}`));
});
assert.deepEqual(E.limpiarEmojis('hola ⚽🇪🇸 x 🏆'), ['⚽', '🇪🇸', '🏆']);
// Que un famoso no acepte el nombre de otro del banco
BANCO.forEach((a) => BANCO.forEach((b) => { if (a !== b) assert.ok(!E.esFamoso(b.n, a), `${b.n} se acepta como ${a.n}`); }));
const messi = BANCO.find((b) => b.n === 'Lionel Messi');
['messi', 'Leo Mesi', 'lionel messi'].forEach((t) => assert.ok(E.esFamoso(t, messi), t));
['lionel', 'maradona', 'me'].forEach((t) => assert.ok(!E.esFamoso(t, messi), t));

// Banco: acertar con el primer emoji da 5, con el tercero 3; tres fallos dejan fuera de la ronda
let p = E.crearPartida([{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }, { id: 3, nombre: 'C' }], [], { rondas: 6 }, 0);
const nombre = p.item.n;
assert.ok(E.vistaDe(p, 1, 0).emojis.length === 1, 'al principio solo se ve un emoji');
assert.ok(E.accion(p, 1, { tipo: 'responder', texto: nombre }, 100).bien);
const r1 = E.accion(p, 3, { tipo: 'responder', texto: 'Nadie Conocido' }, 150);
assert.ok(r1.ok && r1.bien === false && r1.quedan === 2);
assert.ok(E.accion(p, 2, { tipo: 'responder', texto: nombre.toLowerCase() }, 2 * E.MS_EMOJI + 100).bien);
E.accion(p, 3, { tipo: 'responder', texto: 'Otro Nombre' }, 200);
E.accion(p, 3, { tipo: 'responder', texto: 'Tampoco Este' }, 300);
assert.deepEqual(p.jugadores.map((j) => j.puntos), [5, 3, 0]);
assert.equal(p.fase, 'resultado');
let t = 0; while (p.fase !== 'fin') { t += 60000; E.tick(p, t); }
assert.equal(p.ronda, 6);
// Autor
p = E.crearPartida([{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }, { id: 3, nombre: 'C' }], [], { rondas: 3, modo: 'autor' }, 0);
assert.equal(p.fase, 'escribir'); assert.equal(p.autor, 1);
assert.equal(E.accion(p, 1, { tipo: 'escribir', elegido: 0, emojis: 'hola' }, 0).ok, false);
assert.ok(E.accion(p, 1, { tipo: 'escribir', elegido: 1, emojis: '🇪🇸⚽🏆' }, 0).ok);
E.accion(p, 2, { tipo: 'responder', texto: p.item.n }, 50); E.accion(p, 3, { tipo: 'responder', texto: p.item.n }, 60);
assert.equal(p.jugadores[0].puntos, 4); // 2 por cada acierto
t = 0; while (p.fase !== 'fin') { t += 60000; E.tick(p, t); }
console.log(`Biografía en emojis: ${BANCO.length} famosos, respuestas escritas. OK`);
