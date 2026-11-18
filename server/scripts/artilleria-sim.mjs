// Prueba de «Artillería»: disparos al azar hasta que queda un tanque; cráteres y daño coherentes.
import assert from 'assert';
import * as E from '../../client/src/games/Artilleria/engine.js';
let fines = 0; let impactos = 0;
for (let k = 0; k < 40; k++) {
  const n = 2 + (k % 5);
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i}` })), [], {}, 0);
  let t = 0;
  while (p.fase !== 'fin' && t < 1e7) {
    const yo = p.jugadores.find((j) => j.id === p.turno);
    const obj = p.jugadores.find((j) => j.id !== yo.id && j.vida > 0);
    const ang = obj.x > yo.x ? 30 + Math.random() * 40 : 110 + Math.random() * 40;
    const arma = ['normal', 'gorda', 'triple'][Math.floor(Math.random() * 3)];
    const r = E.accion(p, yo.id, { tipo: 'disparar', ang, pot: 40 + Math.random() * 60, arma }, t);
    if (!r.ok) E.accion(p, yo.id, { tipo: 'disparar', ang, pot: 60, arma: 'normal' }, t);
    if (Object.keys(p.ultimo?.danos || {}).length) impactos += 1;
    p.terreno.forEach((h) => assert.ok(h >= 2 && h <= 100));
    t += 1000;
  }
  assert.equal(p.fase, 'fin'); fines += 1;
  assert.ok(p.fin.tabla.length === n);
}
console.log(`Artillería: ${fines}/40 partidas, ${impactos} disparos con daño. OK`);
assert.ok(impactos > 100);
