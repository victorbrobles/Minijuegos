// Simulación del motor de «Del 1 al 10»: pistas, puntuación de golf, tiempos y abandono.
import assert from 'node:assert/strict';
import * as E from '../unoadiez/engine.js';

const J = [{ id: 1, nombre: 'Ana' }, { id: 2, nombre: 'Bea' }, { id: 3, nombre: 'Carlos' }];
const C = ['Series', 'Frutas', 'Deportes', 'Coches', 'Pizzas', 'Libros'];
let t = 1_000_000;
assert.deepEqual([E.puntosDe(1, 0), E.puntosDe(2, 1), E.puntosDe(3, 4)], [1, 3, 13]);
const p = E.crearPartida(J, C, { vueltas: 1 }, t);
assert.equal(p.adivinador, 1);
assert.notEqual(p.pistador, 1);
assert.equal(E.vistaDe(p, 1).numero, null, 'el que adivina no ve el número');
assert.equal(E.vistaDe(p, p.pistador).numero, p.numero);
assert.equal(E.darPista(p, p.pistador, '', t).ok, false, 'online hay que escribirla');
assert.ok(E.darPista(p, p.pistador, 'Breaking Bad', t).ok);
const primero = p.pistador;
assert.ok(E.otraPista(p, 1, t).ok);
assert.notEqual(p.pistador, primero, 'otra persona da la segunda pista');
E.darPista(p, p.pistador, 'Friends', t);
E.adivinar(p, 1, p.numero);
assert.equal(p.jugadores[0].puntos, 2, 'exacto con dos pistas = 2');
E.siguiente(p, t);
// Bea: no dan la pista a tiempo -> otro pistador, no cuenta
const pist = p.pistador;
t += E.AJUSTES.segPista * 1000; E.tick(p, t);
assert.equal(p.pistas.length, 0);
assert.equal(p.fase, 'pista');
void pist;
E.darPista(p, p.pistador, 'algo', t);
E.adivinar(p, 2, p.numero === 10 ? 9 : p.numero + 1);
assert.equal(p.jugadores[1].puntos, 2, 'a uno de distancia con una pista = 2');
E.siguiente(p, t);
// Carlos falla por mucho
E.darPista(p, p.pistador, 'x', t);
E.adivinar(p, 3, p.numero <= 5 ? 10 : 1);
assert.equal(p.jugadores[2].puntos, 11);
E.siguiente(p, t);
assert.equal(p.fase, 'fin');
assert.deepEqual(p.fin.ganadores.sort(), [1, 2], 'menos es mejor');
// Un dispositivo: la pista no se escribe; abandono del que adivina
const q = E.crearPartida(J, C, { vueltas: 2, local: true }, t);
assert.ok(E.darPista(q, null, '', t).ok);
E.abandonar(q, 1, t);
assert.equal(q.adivinador, 2);
E.abandonar(q, 3, t);
assert.equal(q.fase, 'fin', 'con uno solo se acaba');
console.log('unoadiez-sim OK');
