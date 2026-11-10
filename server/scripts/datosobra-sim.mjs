// Simulación de «El Dato que Sobra»: respuestas y desafíos al azar; comprueba la puntuación.
import assert from 'assert';
import * as E from '../datosobra/engine.js';
import { FUTBOLISTAS } from '../data/seeds/datosobra/futbolistas.js';
import { itemDe } from '../routes/datosobra.js';

for (const f of FUTBOLISTAS) {
  assert.equal(f.ciertas.length, 3, f.nombre);
  assert(f.falsa && f.porque, f.nombre);
  const it = itemDe(f);
  assert.equal(it.afirmaciones[it.falsa], f.falsa);
}
assert.equal(new Set(FUTBOLISTAS.map((f) => f.nombre)).size, FUTBOLISTAS.length, 'nombres repetidos');

// Caso a mano: A acierta, B desafía (pierde), C acepta
let p = E.crearPartida([{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }, { id: 3, nombre: 'C' }], FUTBOLISTAS.map(itemDe), { rondas: 4 }, 0);
const f = p.items[0].falsa;
assert(E.responder(p, 1, f, 0).ok);
assert.equal(E.vistaDe(p, 3).decisiones, null);
assert.equal(E.desafiar(p, 2, f, 0).ok, false, 'no se desafía con la misma');
E.desafiar(p, 2, (f + 1) % 4, 0);
E.desafiar(p, 3, null, 0);
assert.equal(p.fase, 'resultado');
assert.deepEqual(p.jugadores.map((j) => j.puntos), [E.AJUSTES.acierto + E.AJUSTES.aguante, E.AJUSTES.desafioPerdido, 0]);
// Ronda 2: le toca a B, falla; A desafía bien
E.siguiente(p, 0);
assert.equal(p.turno, 2);
const f2 = p.items[1].falsa;
E.responder(p, 2, (f2 + 1) % 4, 0);
E.desafiar(p, 1, f2, 0);
E.tick(p, E.AJUSTES.segDesafio * 1000 + 1);
assert.equal(p.fase, 'resultado');
assert.equal(p.sumas[1], E.AJUSTES.desafioGanado);

let partidas = 0;
for (let n = 0; n < 500; n++) {
  const nj = 2 + (n % 5);
  p = E.crearPartida(Array.from({ length: nj }, (_, i) => ({ id: i + 1, nombre: `J${i}` })), FUTBOLISTAS.map(itemDe), { rondas: 6 }, 0);
  let t = 0;
  while (p.fase !== 'fin') {
    t += 1000;
    if (p.fase === 'responder') { if (Math.random() < 0.9) E.responder(p, p.turno, Math.floor(Math.random() * 4), t); else E.tick(p, t + 60000); }
    else if (p.fase === 'desafiar') {
      for (const j of p.jugadores) if (j.id !== p.turno && Math.random() < 0.8) {
        const r = Math.random() < 0.5 ? null : Math.floor(Math.random() * 4);
        E.desafiar(p, j.id, r === p.respuesta ? null : r, t);
      }
      if (p.fase === 'desafiar') E.tick(p, t + 60000);
    } else E.siguiente(p, t);
  }
  assert.equal(p.fin.tabla.length, nj);
  partidas++;
}
console.log(`Dato que Sobra: ${FUTBOLISTAS.length} futbolistas revisados, ${partidas} partidas simuladas. OK`);
