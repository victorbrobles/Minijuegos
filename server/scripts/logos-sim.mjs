// Simulación del motor de «Logo Mania»: simultáneo (online) y por turnos (un dispositivo).
import assert from 'node:assert/strict';
import * as E from '../logos/engine.js';

const J = [{ id: 1, nombre: 'Ana' }, { id: 2, nombre: 'Bea' }, { id: 3, nombre: 'Carlos' }];
const it = (n, ...s) => ({ imagen: 'x', nombre: n, validas: [n, ...s] });
let t = 1_000_000;
assert.ok(E.esCorrecta('coca cola', ['Coca-Cola']));
assert.ok(E.esCorrecta('Mcdonals', ["McDonald's"]));
assert.ok(!E.esCorrecta('Pepsi', ['Coca-Cola']));
// Online, a la vez
const p = E.crearPartida(J, [it('Nike'), it('Adidas')], {}, t);
assert.equal(E.vistaDe(p, 1).solucion, null);
t += 10_000;
assert.equal(E.responder(p, 1, 'nike', t).delta, 35);
assert.equal(E.vistaDe(p, 2).jugadas[1].texto, undefined, 'no se ve lo que ha dicho otro');
assert.equal(E.responder(p, 1, 'nike', t).ok, false, 'una vez por ronda');
E.responder(p, 2, 'puma', t);
assert.equal(p.jugadores[1].puntos, -35);
E.pasar(p, 3);
assert.equal(p.fase, 'resuelta');
assert.equal(E.vistaDe(p, 2).solucion, 'Nike');
E.siguiente(p, t);
E.responder(p, 2, 'adidas', t);
t += 46_000; E.tick(p, t);
assert.equal(p.fase, 'resuelta');
E.siguiente(p, t);
assert.equal(p.fase, 'fin');
assert.deepEqual(p.fin.ganadores, [1]);
// Un dispositivo, por turnos
const q = E.crearPartida(J, [it('Apple')], { porTurnos: true }, t);
assert.equal(E.responder(q, null, 'apple', t).ok, false, 'primero listo');
E.listo(q, null, t); t += 5000;
assert.equal(E.responder(q, null, 'apple', t).delta, 40);
assert.equal(q.listo, false, 'el siguiente tiene su propio reloj');
E.listo(q, null, t); t += 46_000; E.tick(q, t);
assert.ok(q.jugadas[2].tiempo);
E.abandonar(q, 3, t);
assert.equal(q.fase, 'resuelta');
console.log('logos-sim OK');
