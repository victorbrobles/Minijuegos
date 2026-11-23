// Prueba de «Qué malo es conocerse»: puntuación de las reglas, turnos (cada uno protagonista «vueltas» veces),
// respuestas anónimas, cambio de pregunta, forzar, abandonos y partidas al azar de 4 a 20 jugadores.
import assert from 'assert';
import * as E from '../../client/src/games/Conocerse/engine.js';
import { PREGUNTAS } from '../../client/src/games/Conocerse/preguntas.js';

assert.ok(PREGUNTAS.length >= 300, 'al menos 300 preguntas');
assert.equal(new Set(PREGUNTAS.map((q) => q.texto.toLowerCase())).size, PREGUNTAS.length, 'sin preguntas repetidas');
assert.equal(new Set(PREGUNTAS.map((q) => q.id)).size, PREGUNTAS.length);

// Reglas de puntos: protagonista 1; elige la de 3
const r = E.puntuar([2, 3, 4, 5], { 1: 3, 2: 3, 3: 3, 4: 2, 5: 5 }, 1).puntos;
assert.equal(r[3].total, 4, 'autor de la elegida: +3 y +1 por votarla');
assert.equal(r[2].total, 2, 'acierta (+1) y se lleva un voto ajeno (+1)');
assert.equal(r[5].total, -1, 'se votó y no era la buena');
assert.equal(r[1], undefined, 'el protagonista no suma');
assert.equal(r[4], undefined);
// Sin elección del protagonista: nadie suma
assert.deepEqual(E.puntuar([2, 3], { 2: 3, 3: 3 }, 1).puntos, {});

const nombres = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` }));
// Una partida de 4 a mano
{
  const p = E.crearPartida(nombres(4), PREGUNTAS, { vueltas: 3 }, 0);
  assert.equal(p.rondas, 12);
  assert.equal(p.protagonista, 1);
  const q0 = p.pregunta.id;
  assert.ok(!E.otraPregunta(p, 2).ok, 'solo el protagonista o el anfitrión cambian la pregunta');
  assert.ok(E.otraPregunta(p, 1).ok); assert.notEqual(p.pregunta.id, q0);
  assert.ok(!E.responder(p, 1, 'x').ok, 'el protagonista no responde');
  assert.ok(!E.responder(p, 2, '   ').ok, 'respuesta vacía');
  E.responder(p, 2, 'Un perro'); E.responder(p, 3, 'Un gato');
  assert.ok(!E.otraPregunta(p, 1).ok, 'ya hay respuestas');
  const v2 = E.vistaDe(p, 2); assert.equal(v2.respuestas.length, 0, 'nada visible hasta que respondan todos');
  E.responder(p, 4, 'Un perezoso');
  assert.equal(p.fase, 'elegir');
  const v = E.vistaDe(p, 1);
  assert.equal(v.respuestas.length, 3); assert.ok(v.respuestas.every((x) => x.autor === null), 'anónimas al elegir');
  const letraDe = (autor) => String.fromCharCode(65 + p.orden.indexOf(autor));
  E.elegir(p, 1, letraDe(4)); E.elegir(p, 2, letraDe(4)); E.elegir(p, 3, letraDe(3)); E.elegir(p, 4, letraDe(2));
  assert.equal(p.fase, 'desglose');
  const d = E.vistaDe(p, 2);
  assert.ok(d.respuestas.every((x) => x.autor != null), 'con autor en el desglose');
  assert.ok(d.respuestas.find((x) => x.autor === 4).correcta);
  assert.deepEqual(p.jugadores.map((j) => j.puntos), [0, 2, -1, 3]); // 2 acierta +1 y le votan +1; 3 se vota −1; 4 elegida +3
  E.siguiente(p); assert.equal(p.fase, 'puntos');
  E.siguiente(p); assert.equal(p.fase, 'clasificacion');
  E.siguiente(p); assert.equal(p.fase, 'responder'); assert.equal(p.protagonista, 2);
  // Forzar sin respuestas: ronda sin puntos
  E.forzar(p); assert.equal(p.fase, 'desglose'); assert.ok(p.resultado.anulada);
  E.siguiente(p); E.siguiente(p); E.siguiente(p); assert.equal(p.protagonista, 3);
  // Se va el protagonista: ronda anulada
  E.responder(p, 1, 'a'); E.abandonar(p, 3); assert.equal(p.fase, 'desglose'); assert.ok(p.resultado.seFue);
  E.siguiente(p); E.siguiente(p); E.siguiente(p); assert.equal(p.protagonista, 4);
  // Al siguiente turno de J3 se le salta
  let vistos = [];
  while (p.fase !== 'fin') { if (p.fase === 'responder') { vistos.push(p.protagonista); E.forzar(p); } else E.siguiente(p); }
  assert.ok(!vistos.includes(3), 'quien se va no vuelve a ser protagonista');
}

// Partidas al azar
let total = 0;
for (let k = 0; k < 60; k++) {
  const n = 4 + (k % 17); const vueltas = E.OPCIONES.vueltas[k % 3];
  const p = E.crearPartida(nombres(n), PREGUNTAS, { vueltas }, 0);
  assert.equal(p.rondas, n * vueltas);
  const protas = {}; let pasos = 0;
  while (p.fase !== 'fin' && pasos++ < 5000) {
    if (p.fase === 'responder') {
      protas[p.protagonista] = (protas[p.protagonista] || 0) + 1;
      p.jugadores.filter((j) => !j.fuera && j.id !== p.protagonista).forEach((j) => { if (Math.random() < 0.97) E.responder(p, j.id, `Respuesta ${j.id}`); });
      if (p.fase === 'responder') E.forzar(p);
      if (k % 9 === 0 && Math.random() < 0.05) { const j = p.jugadores.find((x) => !x.fuera && x.id !== 1); if (j) E.abandonar(p, j.id); }
    } else if (p.fase === 'elegir') {
      const antes = p.jugadores.map((j) => j.puntos);
      p.jugadores.filter((j) => !j.fuera).forEach((j) => E.elegir(p, j.id, String.fromCharCode(65 + Math.floor(Math.random() * p.orden.length))));
      if (p.fase === 'elegir') E.forzar(p);
      // El protagonista nunca suma
      const pr = p.jugadores.findIndex((j) => j.id === p.protagonista);
      assert.equal(p.jugadores[pr].puntos, antes[pr]);
    } else E.siguiente(p);
  }
  assert.equal(p.fase, 'fin', 'la partida termina');
  if (k % 9 !== 0) Object.values(protas).forEach((c) => assert.equal(c, vueltas, 'cada uno es protagonista «vueltas» veces'));
  total += p.rondas;
}
console.log(`Qué malo es conocerse: ${PREGUNTAS.length} preguntas, 60 partidas (${total} rondas). OK`);
