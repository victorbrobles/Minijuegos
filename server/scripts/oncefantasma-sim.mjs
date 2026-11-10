// Simulación de «El Once Fantasma»: comprueba aciertos, pistas encadenadas, reloj y final.
import assert from 'assert';
import * as E from '../oncefantasma/engine.js';
import { ONCES } from '../data/seeds/oncefantasma/onces.js';

// Ningún alias de un once vale para dos jugadores del mismo once
for (const o of ONCES) {
  for (const j of o.jugadores) {
    for (const a of [j.nombre, ...j.alias]) {
      const otros = o.jugadores.filter((k) => k !== j && E.esJugador(a, k));
      assert.equal(otros.length, 0, `${o.id}: «${a}» también vale para ${otros.map((k) => k.nombre)}`);
      assert(E.esJugador(a, j), `${o.id}: «${a}» no reconoce a ${j.nombre}`);
    }
  }
}
assert(E.esJugador('Iniseta', ONCES[0].jugadores[8]), 'errata pequeña');
assert(!E.esJugador('In', ONCES[0].jugadores[8]), 'demasiado corto');

let t = 0;
let partidas = 0;
for (let n = 0; n < 200; n++) {
  const sorteo = [...ONCES].sort(() => Math.random() - 0.5);
  const p = E.crearPartida([{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }, { id: 3, nombre: 'C' }], sorteo, { rondas: 3, segundos: 180 }, t);
  assert.equal(p.huecos.filter((h) => h.nivel === 1).length, 2);
  while (p.fase !== 'fin') {
    if (p.fase === 'jugando') {
      t += 4000;
      E.tick(p, t);
      if (p.fase !== 'jugando') continue;
      const id = 1 + Math.floor(Math.random() * 3);
      const ocultos = p.huecos.filter((h) => !h.por);
      if (Math.random() < 0.4 && ocultos.length) {
        const h = ocultos[Math.floor(Math.random() * ocultos.length)];
        const antes = p.huecos.reduce((s, x) => s + x.nivel, 0);
        const r = E.adivinar(p, id, h.alias[0], t);
        if (r.ok && r.acierto) {
          assert.equal(h.por, id);
          if (p.fase === 'jugando' && r.pista !== null) assert(p.huecos.reduce((s, x) => s + x.nivel, 0) === antes + 1);
        }
      } else {
        const r = E.adivinar(p, id, 'Pelé', t);
        if (r.ok) assert.equal(r.acierto, false);
      }
      const v = E.vistaDe(p, 2);
      if (p.fase === 'jugando') v.huecos.forEach((h, i) => { if (!p.huecos[i].por) assert.equal(h.nombre, null, 'no se filtra el nombre'); });
    } else if (p.fase === 'resultado') {
      E.vistaDe(p, 1).huecos.forEach((h) => assert(h.nombre));
      E.siguiente(p, t);
    }
  }
  assert(p.fin.tabla.length === 3);
  const total = p.jugadores.reduce((s, j) => s + j.puntos, 0);
  assert(total >= 0);
  partidas++;
}
// Rendirse y reloj
const p = E.crearPartida([{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }], ONCES, { rondas: 2, segundos: 180 }, 0);
E.tick(p, 26000);
assert.equal(p.huecos.reduce((s, h) => s + h.nivel, 0), 3, 'pista por reloj');
E.tick(p, 181000);
assert.equal(p.fase, 'resultado');
E.siguiente(p, 182000);
assert.equal(E.rendirse(p).ok, true);
E.siguiente(p, 183000);
assert.equal(p.fase, 'fin');
console.log(`Once Fantasma: ${partidas} partidas simuladas, ${ONCES.length} onces revisados. OK`);
