// Prueba de «El Draft de Estrellas»: fichajes en serpiente, criterio desvelado y puntos.
import assert from 'assert';
import * as E from '../../client/src/games/Draft/engine.js';
import { FAMOSOS } from '../../client/src/games/Draft/famosos.js';
assert.equal(new Set(FAMOSOS.map((f) => f.n)).size, FAMOSOS.length, 'famosos repetidos');
FAMOSOS.forEach((f) => { assert.ok(Number.isInteger(f.a) && f.a < 2010, f.n); if (f.h != null) assert.ok(f.h > 130 && f.h < 230, f.n); });
for (let k = 0; k < 40; k++) {
  const n = 2 + (k % 5);
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i}` })), [], { rondas: 3 }, 0);
  let t = 0;
  while (p.fase !== 'fin') {
    if (p.fase === 'draft') {
      const turno = E.turnoDe(p);
      // serpiente: el orden de la segunda vuelta es el inverso
      const libres = p.pool.map((f, i) => (f.de == null ? i : -1)).filter((i) => i >= 0);
      assert.ok(E.accion(p, turno, { tipo: 'fichar', idx: libres[0] }, t).ok);
      if (k % 7 === 0 && p.fase === 'draft') { t += (E.SEG_PICK + 1) * 1000; E.tick(p, t); } // a veces, por tiempo
    } else { t += (E.SEG_REVELAR + 1) * 1000; E.tick(p, t); }
    if (p.fase === 'revelar') {
      assert.ok(p.candidatos.includes(p.criterio));
      p.jugadores.forEach((j) => assert.equal(j.equipo.length, E.POR_JUGADOR));
      const total = Object.values(p.resultado.puntos).reduce((a, b) => a + b, 0);
      assert.ok(total <= (n * (n - 1)) / 2);
    }
  }
  assert.ok(p.fin.ganadores.length);
}
console.log(`El Draft de Estrellas: 40 partidas, ${FAMOSOS.length} famosos. OK`);
