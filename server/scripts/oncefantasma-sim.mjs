// Simulación de «El Once Fantasma»: turnos, rebote, bonus de once completo y reloj.
import assert from 'assert';
import * as E from '../oncefantasma/engine.js';
import { PARTIDOS } from '../data/seeds/oncefantasma/onces.js';

// Datos: dos onces de 11 por partido, un portero, dorsales sin repetir y ningún alias ambiguo dentro de un once
for (const m of PARTIDOS) {
  assert.equal(m.onces.length, 2, m.id);
  for (const o of m.onces) {
    assert.equal(o.jugadores.length, 11, `${m.id} ${o.equipo}`);
    assert.equal(o.jugadores.filter((j) => j.pos === 'POR').length, 1, `${m.id} ${o.equipo}: portero`);
    assert.equal(new Set(o.jugadores.map((j) => j.dorsal)).size, 11, `${m.id} ${o.equipo}: dorsales`);
    for (const j of o.jugadores) for (const a of [j.nombre, ...j.alias]) {
      assert(E.esJugador(a, j), `${o.equipo}: «${a}» no reconoce a ${j.nombre}`);
      const otros = o.jugadores.filter((k) => k !== j && E.esJugador(a, k));
      assert.equal(otros.length, 0, `${o.equipo}: «${a}» también vale para ${otros.map((k) => k.nombre)}`);
    }
  }
}
// Laterales izquierdos a la izquierda: el primer defensa de cada once no es el lateral derecho conocido
const esp = PARTIDOS[0].onces[0].jugadores.filter((j) => j.pos === 'DEF').map((j) => j.nombre);
assert.deepEqual(esp, ['Joan Capdevila', 'Carles Puyol', 'Gerard Piqué', 'Sergio Ramos']);

// Turnos: los dos onces de un partido, a jugadores seguidos
let p = E.crearPartida([{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }, { id: 3, nombre: 'C' }], PARTIDOS, { onces: 1, segundos: 120 }, 0);
assert.equal(p.rondas, 3);
assert.deepEqual(p.turnos.map((t) => t.jugador), [1, 2, 3]);
assert.equal(p.turnos[0].partido, p.turnos[1].partido);
assert.notEqual(p.turnos[0].equipo, p.turnos[1].equipo);
// Solo el del turno adivina
const nom = p.huecos[3].alias[0];
assert.equal(E.adivinar(p, 2, nom, 0).ok, false);
assert(E.adivinar(p, 1, nom, 0).acierto);
// Se planta: rebote para los demás, no para él
E.plantarse(p, 1, 1000);
assert.equal(p.fase, 'rebote');
assert.equal(E.adivinar(p, 1, p.huecos.find((h) => !h.por).alias[0], 1000).ok, false);
const h = p.huecos.find((x) => !x.por);
const r = E.adivinar(p, 2, h.alias[0], 1000);
assert(r.acierto);
assert.equal(r.puntos, E.AJUSTES.puntosRebote[h.nivel]);
E.pasarRebote(p, 2); E.pasarRebote(p, 3);
assert.equal(p.fase, 'resultado');
E.siguiente(p, 2000);
assert.equal(p.fase, 'turno');
assert.equal(E.vistaDe(p, 1).turno, 2);
// Once completo por el del turno: bonus
p.huecos.forEach((x) => { if (!x.por) E.adivinar(p, 2, x.alias[0], (p.esperas[2] || 0) + 3000); });
assert.equal(p.motivo, 'pleno');
assert(p.sumas[2] >= 11 * 3 + E.AJUSTES.bonusPleno);
// Reloj: pistas y paso al rebote
E.siguiente(p, 10000);
E.tick(p, 10000 + 21000);
assert.equal(p.huecos.reduce((s, x) => s + x.nivel, 0), 3, 'pista por reloj');
E.tick(p, 10000 + 121000);
assert.equal(p.fase, 'rebote');
E.tick(p, 10000 + 121000 + 41000);
assert.equal(p.fase, 'resultado');
E.siguiente(p, 200000);
assert.equal(p.fase, 'fin');

let partidas = 0;
for (let n = 0; n < 200; n++) {
  const nj = E.AJUSTES.min + (n % (E.AJUSTES.max - E.AJUSTES.min + 1));
  const k = E.OPCIONES.onces[n % 3];
  const ps = [...PARTIDOS].sort(() => Math.random() - 0.5).slice(0, Math.ceil((nj * k) / 2));
  p = E.crearPartida(Array.from({ length: nj }, (_, i) => ({ id: i + 1, nombre: `J${i}` })), ps, { onces: k, segundos: 120 }, 0);
  assert.equal(p.rondas, Math.max(Math.min(nj, ps.length * 2), Math.floor(Math.min(nj * k, ps.length * 2) / nj) * nj));
  assert.equal(p.rondas % nj === 0 || p.rondas === ps.length * 2, true);
  let t = 0; let pasos = 0;
  while (p.fase !== 'fin') {
    assert(pasos++ < 5000);
    t += 2000;
    if (p.fase === 'turno' || p.fase === 'rebote') {
      const quien = p.fase === 'turno' ? p.turnos[p.ronda - 1].jugador : 1 + Math.floor(Math.random() * nj);
      const oc = p.huecos.filter((x) => !x.por);
      const rr = Math.random();
      if (rr < 0.45 && oc.length) E.adivinar(p, quien, oc[Math.floor(Math.random() * oc.length)].alias[0], t);
      else if (rr < 0.6) E.adivinar(p, quien, 'Pelé', t);
      else if (rr < 0.65 && p.fase === 'turno') E.plantarse(p, quien, t);
      else if (rr < 0.7 && p.fase === 'rebote') E.pasarRebote(p, quien);
      else E.tick(p, (t += 30000));
      const v = E.vistaDe(p, 1);
      if (p.fase === 'turno' || p.fase === 'rebote') v.huecos.forEach((x, i) => { if (!p.huecos[i].por) assert.equal(x.nombre, null); });
    } else E.siguiente(p, t);
  }
  partidas++;
}
console.log(`Once Fantasma: ${PARTIDOS.length} partidos (${PARTIDOS.length * 2} onces) revisados, ${partidas} partidas simuladas. OK`);
