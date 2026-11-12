// Simulación de «El Tablero de Puntos»: banco de preguntas, elección de categorías, rebotes y partidas enteras.
import assert from 'assert';
import * as E from '../tablero/engine.js';
import { CATEGORIAS, PREGUNTAS } from '../data/seeds/tablero/preguntas.js';
import { montarBanco } from '../routes/tablero.js';

assert.equal(CATEGORIAS.length, 25, '25 categorías');
for (const c of CATEGORIAS) {
  assert(PREGUNTAS.filter((q) => q.cat === c.id).length >= 100, `${c.id}: al menos 100 preguntas`);
  for (const v of E.AJUSTES.valores) assert(PREGUNTAS.filter((q) => q.cat === c.id && q.v === v).length >= 20, `${c.id} ${v}: al menos 20`);
}
for (const q of PREGUNTAS) { assert.equal(q.o.length, 4, q.p); assert.equal(new Set(q.o).size, 4, q.p); assert(CATEGORIAS.some((c) => c.id === q.cat), q.cat); }
assert.equal(new Set(PREGUNTAS.map((q) => q.p)).size, PREGUNTAS.length, 'preguntas repetidas');

// Caso a mano: rebote solo para el siguiente y sin restar
const banco = montarBanco();
let p = E.crearPartida([1, 2, 3].map((id) => ({ id, nombre: `J${id}` })), banco, { categorias: 3 }, 0, () => 0);
assert.equal(p.fase, 'categorias');
assert.equal(p.turno, 1);
assert.equal(E.elegirCategoria(p, 2, 'cine').ok, false, 'fuera de turno');
E.elegirCategoria(p, 1, 'cine');
assert.equal(E.elegirCategoria(p, 2, 'cine').ok, false, 'categoría repetida');
E.elegirCategoria(p, 2, 'futbol');
E.elegirCategoria(p, 3, 'arte');
assert.equal(p.fase, 'elegir');
assert.deepEqual(p.categorias.map((c) => c.id), ['cine', 'futbol', 'arte']);
const t1 = p.turno;
E.elegir(p, t1, 'cine', 300);
const q = p.preguntas['cine:300'];
const mala = q.opciones.find((o) => o !== q.correcta);
E.responder(p, t1, mala);
assert.equal(p.fase, 'rebote');
const r = p.rebote.id;
assert.notEqual(r, t1);
assert.equal(E.responder(p, t1, q.correcta).ok, false, 'el que falló no responde el rebote');
assert.equal(E.responder(p, r, mala).ok, false, 'la opción fallada está descartada');
const otra = q.opciones.find((o) => o !== q.correcta && o !== mala);
const antes = p.jugadores.find((j) => j.id === r).puntos;
E.responder(p, r, otra);
assert.equal(p.jugadores.find((j) => j.id === r).puntos, antes, 'fallar el rebote no resta');
assert.equal(p.fase, 'elegir');
assert.equal(p.turno, r, 'el turno sigue en orden');

// Partidas enteras
let partidas = 0; let rebotes = 0;
for (let n = 0; n < 300; n++) {
  const nj = E.AJUSTES.min + (n % (E.AJUSTES.max - E.AJUSTES.min + 1));
  const nc = E.OPCIONES.categorias[n % 4];
  const b = montarBanco();
  assert.equal(Object.keys(b.preguntas).length, 25 * 5);
  const g = E.crearPartida(Array.from({ length: nj }, (_, i) => ({ id: i + 1, nombre: `J${i}` })), b, { categorias: nc, segundos: 20 }, 0);
  let t = 0; let pasos = 0;
  while (g.fase !== 'fin') {
    assert(pasos++ < 1000);
    t += 1000;
    const v = E.vistaDe(g, g.turno);
    if (g.fase === 'categorias') {
      if (Math.random() < 0.2) { E.tick(g, (t += 100000)); continue; }
      const libres = v.disponibles.filter((c) => c.por == null);
      assert(E.elegirCategoria(g, g.turno, libres[Math.floor(Math.random() * libres.length)].id, t).ok);
    } else if (g.fase === 'elegir') {
      if (Math.random() < 0.1) { E.tick(g, (t += 100000)); continue; }
      const libres = v.categorias.flatMap((c) => c.celdas.filter((x) => !x.usada).map((x) => [c.id, x.v]));
      const [c, val] = libres[Math.floor(Math.random() * libres.length)];
      assert(E.elegir(g, g.turno, c, val, t).ok);
    } else {
      if (g.fase === 'rebote') rebotes += 1;
      const quien = v.responde;
      const ops = v.actual.opciones.filter((o) => o !== v.rebote?.quitada);
      if (Math.random() < 0.1) E.tick(g, (t += 100000));
      else assert(E.responder(g, quien, ops[Math.floor(Math.random() * ops.length)], t).ok);
    }
  }
  assert.equal(g.jugadas, nc * 5);
  assert.equal(g.categorias.length, nc);
  assert.equal(new Set(g.categorias.map((c) => c.id)).size, nc);
  partidas++;
}
console.log(`Tablero de Puntos: ${PREGUNTAS.length} preguntas en ${CATEGORIAS.length} categorías, ${partidas} partidas, ${rebotes} rebotes. OK`);
