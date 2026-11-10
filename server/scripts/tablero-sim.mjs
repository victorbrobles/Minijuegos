// Simulación de «El Tablero de Puntos».
import assert from 'assert';
import * as E from '../tablero/engine.js';
import { CATEGORIAS, PREGUNTAS } from '../data/seeds/tablero/preguntas.js';
import { montarTablero } from '../routes/tablero.js';

for (const c of CATEGORIAS) for (const v of E.AJUSTES.valores) assert(PREGUNTAS.filter((q) => q.cat === c.id && q.v === v).length >= 2, `${c.id} ${v}`);
for (const q of PREGUNTAS) { assert.equal(q.o.length, 4, q.p); assert.equal(new Set(q.o).size, 4, q.p); }
assert.equal(new Set(PREGUNTAS.map((q) => q.p)).size, PREGUNTAS.length, 'preguntas repetidas');

let partidas = 0;
for (let n = 0; n < 400; n++) {
  const nj = 2 + (n % 4);
  const nc = E.OPCIONES.categorias[n % 4];
  const t0 = montarTablero(nc);
  assert.equal(Object.keys(t0.preguntas).length, nc * 4);
  assert(!t0.doble.endsWith(':100'));
  const p = E.crearPartida(Array.from({ length: nj }, (_, i) => ({ id: i + 1, nombre: `J${i}` })), t0, { segundos: 20 }, 0);
  let t = 0; let total = 0; let pasos = 0;
  while (p.fase !== 'fin') {
    assert(pasos++ < 500);
    t += 1000;
    const v = E.vistaDe(p, p.turno);
    if (p.fase === 'elegir') {
      if (Math.random() < 0.1) { E.tick(p, (t += 100000)); continue; }
      const libres = v.categorias.flatMap((c) => c.celdas.filter((x) => !x.usada).map((x) => [c.id, x.v]));
      const [c, val] = libres[Math.floor(Math.random() * libres.length)];
      assert.equal(E.elegir(p, p.turno === 1 ? 2 : 1, c, val, t).ok, false, 'fuera de turno');
      assert(E.elegir(p, p.turno, c, val, t).ok);
    } else {
      assert.equal(v.actual.opciones.length, 4);
      const antes = p.jugadores.reduce((s, j) => s + j.puntos, 0);
      if (Math.random() < 0.1) E.tick(p, (t += 100000));
      else E.responder(p, p.turno, v.actual.opciones[Math.floor(Math.random() * 4)], t);
      const d = p.jugadores.reduce((s, j) => s + j.puntos, 0) - antes;
      assert.equal(Math.abs(d), p.ultimo.v * (p.ultimo.doble ? 2 : 1));
      total += d;
    }
  }
  assert.equal(p.jugadas, nc * 4);
  assert.equal(p.jugadores.reduce((s, j) => s + j.puntos, 0), total);
  partidas++;
}
console.log(`Tablero de Puntos: ${PREGUNTAS.length} preguntas revisadas, ${partidas} partidas simuladas. OK`);
