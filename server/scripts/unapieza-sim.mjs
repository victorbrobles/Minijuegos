// Simulación de «Una Pieza Más»: bots que colocan piezas al azar donde caben.
import assert from 'assert';
import * as E from '../unapieza/engine.js';

// Geometría
assert.deepEqual(E.celdasDe('I2', 1), [[0, 0], [1, 0]]);
assert.equal(new Set([0, 1, 2, 3].flatMap((r) => [false, true].map((e) => JSON.stringify(E.celdasDe('O4', r, e))))).size, 1, 'el cuadrado es simétrico');
assert.equal(new Set([0, 1, 2, 3].flatMap((r) => [false, true].map((e) => JSON.stringify(E.celdasDe('L4', r, e))))).size, 8, 'la ele tiene 8 formas');
for (const f of E.FIGURAS) {
  assert.equal(f.forma.length, 8, f.id);
  f.forma.forEach((r) => assert.equal(r.length, 8, `${f.id}: ${r}`));
}

function jugadaAleatoria(p, id) {
  const j = p.jugadores.find((x) => x.id === id);
  const op = [];
  j.mano.forEach((t, pieza) => {
    for (let rot = 0; rot < 4; rot++) for (const espejo of [false, true]) {
      for (let fila = 0; fila < 8; fila++) for (let col = 0; col < 8; col++) if (E.encaja(p, t, rot, espejo, fila, col)) op.push({ pieza, rot, espejo, fila, col });
    }
  });
  if (op.length) return op[Math.floor(Math.random() * op.length)];
  for (let fila = 0; fila < 8; fila++) for (let col = 0; col < 8; col++) if (p.tablero[fila][col] === 0) return { pieza: -1, fila, col, suelta: true };
  return null;
}

const stats = { completas: 0, atascadas: 0, figuras: 0, bloqueos: 0, objetivos: 0, puntos: [] };
let t = 0;
for (let n = 0; n < 300; n++) {
  const nj = 2 + (n % 4);
  const figs = [...E.FIGURAS].sort(() => Math.random() - 0.5);
  const p = E.crearPartida(Array.from({ length: nj }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` })), figs, { rondas: 3, segundos: 60 }, t);
  let pasos = 0;
  while (p.fase !== 'fin') {
    assert(pasos++ < 5000, 'bucle infinito');
    if (p.fase === 'resultado') {
      stats.figuras++;
      if (p.motivo === 'completa') stats.completas++; else stats.atascadas++;
      E.siguiente(p, t);
      continue;
    }
    t += 1000;
    const id = p.turno;
    const v = E.vistaDe(p, id);
    const otro = E.vistaDe(p, id === 1 ? 2 : 1);
    assert.equal(otro.objetivos, null, 'objetivos ajenos ocultos');
    const jd = jugadaAleatoria(p, id);
    assert.equal(Boolean(jd && !jd.suelta), v.yo.cabe.some(Boolean), 'cabe coincide');
    if (!jd?.suelta) assert.equal(E.colocar(p, id, { pieza: -1, fila: 0, col: 0 }, t).ok, false, 'no hay casilla suelta si te cabe algo');
    if (jd && Math.random() < 0.97) {
      const antes = p.tablero.flat().filter((x) => x === 0).length;
      const r = E.colocar(p, id, jd, t);
      assert(r.ok, r.error);
      if (p.registro[0].bloqueo) stats.bloqueos++;
      if (r.detalle.includes('objetivo')) stats.objetivos++;
      assert(p.tablero.flat().filter((x) => x === 0).length < antes);
    } else if (Math.random() < 0.1) {
      E.tick(p, t + 61000);
    } else {
      assert(E.pasar(p, id, Math.random() < 0.5 ? 0 : null, t).ok);
    }
    assert.equal(E.colocar(p, -5, { pieza: 0, fila: 0, col: 0 }, t).ok, false);
  }
  p.fin.tabla.forEach((j) => stats.puntos.push(j.puntos));
}
const media = stats.puntos.reduce((a, b) => a + b, 0) / stats.puntos.length;
console.log(`Una Pieza Más: ${stats.figuras} figuras (${stats.completas} completas, ${stats.atascadas} atascadas), ${stats.bloqueos} bloqueos, ${stats.objetivos} objetivos, media ${media.toFixed(1)} pts. OK`);
