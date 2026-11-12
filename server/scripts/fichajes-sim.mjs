// Simulación de «Fichaje exprés»: rachas, dificultad y fin.
import assert from 'assert';
import * as E from '../../client/src/games/Fichajes/engine.js';
import { BASE } from '../routes/fichajes.js';

assert.ok(BASE.length > 400);
BASE.forEach((f) => assert.ok(E.CLUBES[f.club], f.club));
const respuesta = (f) => E.CLUBES[f.club].split('|')[0];
for (let k = 0; k < 100; k++) {
  const n = 1 + (k % 10);
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i}` })), BASE, { rondas: 5 }, 0);
  let t = 0;
  while (p.fase !== 'fin') {
    const id = E.turnoDe(p);
    assert.ok(E.empezar(p, id, t).ok);
    let racha = 0;
    while (p.fase === 'pregunta' && racha < 30) {
      const f = BASE[p.actual];
      if (Math.random() < 0.8) { assert.equal(E.responder(p, id, respuesta(f), t).bien, true); racha += 1; } else if (Math.random() < 0.5) E.responder(p, id, 'equipo inventado', t); else { t += 16000; E.tick(p, t); }
    }
    if (p.fase === 'pregunta') { t += 16000; E.tick(p, t); }
    t += 1000;
  }
  assert.equal(p.fin.tabla.length, n);
}
// Alias de clubes
assert.ok(E.CLUBES['Atlético'].includes('atleti'));
console.log('Fichaje exprés: OK');
