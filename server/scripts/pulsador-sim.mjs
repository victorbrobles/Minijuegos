// Simulación del motor de pulsador: rondas completas de los tres juegos con aciertos, fallos y tiempos.
import assert from 'node:assert/strict';
import * as E from '../pulsador/engine.js';

const J = [{ id: 1, nombre: 'Ana' }, { id: 2, nombre: 'Bea' }, { id: 3, nombre: 'Carlos' }];
let t = 1_000_000;

// --- coincide
assert.ok(E.coincide('cristiano', ['Cristiano Ronaldo', 'Cristiano']));
assert.ok(E.coincide('Rosalia', ['Rosalía']));
assert.ok(E.coincide('the rock', ['The Rock']));
assert.ok(E.coincide('therock', ['The Rock']));
assert.ok(E.coincide('Oppenhaimer', ['Oppenheimer']));
assert.ok(!E.coincide('Messi', ['Cristiano Ronaldo']));
assert.ok(!E.coincide('', ['x']));

// --- Rasgos: puntos por segundos y castigo igual
{
  const items = [{ pistas: [{ tipo: 'imagen', valor: 'x' }], respuestas: ['Lionel Messi', 'Messi'], solucion: { titulo: 'Lionel Messi' } },
    { pistas: [{ tipo: 'imagen', valor: 'y' }], respuestas: ['Shakira'], solucion: { titulo: 'Shakira' } }];
  const p = E.crearPartida(J, items, E.REGLAS.rasgos, t);
  assert.equal(E.pulsar(p, 1, t + 1000).ok, false, 'no se pulsa durante la cuenta atrás');
  t += E.CUENTA_ATRAS_MS + 10_000; // 10 s de ronda → quedan 50
  assert.ok(E.pulsar(p, 1, t).ok);
  assert.equal(E.pulsar(p, 2, t).ok, false, 'solo uno a la vez');
  assert.equal(E.vistaDe(p, 2, t).solucion, null, 'sin solución en juego');
  t += 5000; // el reloj de ronda está parado
  E.tick(p, t);
  assert.ok(E.responder(p, 1, 'Ronaldo', t).ok);
  assert.equal(p.jugadores[0].puntos, -50);
  assert.deepEqual(p.bloqueados, [1]);
  assert.equal(E.pulsar(p, 1, t).ok, false, 'bloqueado');
  assert.ok(E.pulsar(p, 2, t).ok);
  t += 16_000; // se pasa el tiempo de respuesta
  E.tick(p, t);
  assert.equal(p.jugadores[1].puntos, -50);
  assert.ok(E.pulsar(p, 3, t).ok);
  E.responder(p, 3, 'messi', t);
  assert.equal(p.fase, 'resuelta');
  assert.equal(p.jugadores[2].puntos, 50);
  assert.equal(E.vistaDe(p, 1, t).solucion.titulo, 'Lionel Messi');
  E.siguiente(p, t);
  t += E.CUENTA_ATRAS_MS + 61_000;
  E.tick(p, t);
  assert.equal(p.resultado.tipo, 'tiempo');
  E.siguiente(p, t);
  assert.equal(p.fase, 'fin');
  assert.deepEqual(p.fin.ganadores, [3]);
}

// --- Adivina: pistas que se destapan y puntos 10/5/3
{
  const it = () => ({ pistas: [{ valor: 'a' }, { valor: 'b' }, { valor: 'c' }], respuestas: ['Barbie'], solucion: { titulo: 'Barbie' } });
  const p = E.crearPartida(J, [it(), it(), it()], E.REGLAS.adivina, t);
  t += E.CUENTA_ATRAS_MS + 1000;
  assert.equal(E.vistaDe(p, 1, t).pistas.length, 1);
  assert.equal(E.vistaDe(p, 1, t).vale, 10);
  t += 20_000;
  assert.equal(E.vistaDe(p, 1, t).pistas.length, 2);
  assert.equal(E.vistaDe(p, 1, t).vale, 5);
  E.pulsar(p, 2, t);
  E.responder(p, 2, 'barbi', t);
  assert.equal(p.jugadores[1].puntos, 5);
  E.siguiente(p, t);
  t += E.CUENTA_ATRAS_MS;
  assert.ok(E.adelantarPista(p, t).ok);
  assert.ok(E.adelantarPista(p, t).ok);
  assert.equal(E.adelantarPista(p, t).ok, false);
  assert.equal(E.vistaDe(p, 1, t).vale, 3);
  // fallar no resta
  E.pulsar(p, 1, t); E.responder(p, 1, 'Ken', t);
  assert.equal(p.jugadores[0].puntos, 0);
  assert.ok(E.rendirse(p, t).ok);
  assert.equal(p.resultado.tipo, 'rendicion');
  E.siguiente(p, t);
  // un solo dispositivo: se pulsa sin saber quién
  t += E.CUENTA_ATRAS_MS + 100;
  assert.ok(E.pulsar(p, null, t).ok);
  assert.equal(E.responder(p, null, 'Barbie', t).ok, false);
  assert.ok(E.identificar(p, 3).ok);
  assert.ok(E.responder(p, null, 'Barbie', t).ok);
  assert.equal(p.jugadores[2].puntos, 10);
  E.siguiente(p, t);
  assert.equal(p.fase, 'fin');
  assert.deepEqual(p.fin.ganadores, [3]);
}

// --- Frases: opciones, +3 / −1, todos fallan
{
  const it = { pistas: [{ tipo: 'frase', valor: 'Veni, vidi, vici.' }], opciones: ['Nerón', 'Julio César', 'Marco Aurelio', 'Alejandro Magno'], correcta: 'Julio César', solucion: { titulo: 'Julio César' } };
  const p = E.crearPartida(J, [it], E.REGLAS.frasescelebres, t);
  t += E.CUENTA_ATRAS_MS;
  assert.equal(E.vistaDe(p, 1, t).correcta, null);
  for (const id of [1, 2, 3]) { E.pulsar(p, id, t); E.responder(p, id, 'Nerón', t); }
  assert.equal(p.resultado.tipo, 'todos');
  assert.deepEqual(p.jugadores.map((j) => j.puntos), [-1, -1, -1]);
  assert.equal(E.vistaDe(p, 1, t).correcta, 'Julio César');
  E.siguiente(p, t);
  assert.deepEqual(p.fin.ganadores, []);
}

// --- Abandonos
{
  const it = { pistas: [{ valor: 'x' }], respuestas: ['X'], solucion: { titulo: 'X' } };
  const p = E.crearPartida(J, [it], E.REGLAS.rasgos, t);
  t += E.CUENTA_ATRAS_MS;
  E.pulsar(p, 1, t); E.responder(p, 1, 'no', t);
  E.pulsar(p, 2, t);
  E.abandonar(p, 2, t);
  assert.equal(p.pulsado, null);
  E.abandonar(p, 3, t);
  assert.equal(p.fase, 'resuelta', 'si los que quedan ya fallaron, se resuelve');
}
console.log('pulsador-sim OK');
