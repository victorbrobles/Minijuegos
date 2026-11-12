// Simulación de «Mus Avanzado»: jugadas, comparaciones a 8 reyes y partidas enteras con envites, órdagos y abandonos.
import assert from 'assert';
import * as E from '../musavanzado/engine.js';

const P = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
let uid = 1000;
const c = (s) => s.split(' ').map((t) => ({ id: ++uid, n: Number(t.slice(0, -1)), p: P[t.slice(-1)], esp: null }));
const k = (s, cat, ctx) => E.evaluar(c(s), cat, ctx).clave;
const gana = (a, b, cat, ctx) => { const x = k(a, cat, ctx); const y = k(b, cat, ctx); for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) > (y[i] ?? 0); return false; };
const txt = (s, cat) => E.jugadaTexto(cat, E.evaluar(c(s), cat, {}));

// Treses = reyes, doses = ases
assert.ok(gana('3o 3c 4e 5b 6o', '12o 11c 7e 5b 6c', 'grande'), 'dos treses son dos reyes');
assert.ok(gana('2o 1c 4e 5b 6o', '1o 4c 4b 5e 6c', 'chica'), 'el dos es un as');
assert.equal(txt('3o 12c 3e 12b 5o', 'pares'), 'Póker de reyes');
assert.equal(txt('3o 12c 3e 1b 2o', 'pares'), 'Full de reyes y ases');
assert.equal(txt('11o 11c 10e 10b 5o', 'pares'), 'Duples de caballos y sotas');
assert.ok(gana('5o 5c 5e 1b 4o', '12o 12c 11e 11b 7o', 'pares') === false, 'duples gana a medias');
// Escalera A-4-5-6-7 vale (los doses son ases)
assert.equal(k('2o 4c 5e 6b 7o', 'escalera')[0], 5);
assert.equal(k('7o 10c 11e 3b 1o', 'escalera')[0], 4, '7-S-C-R');
assert.equal(E.extra('escalera', k('2o 4c 5e 6b 7o', 'escalera')), 5);
assert.equal(E.extra('color', k('2o 4o 5o 6o 7o', 'color')), 5);
// Juego: 31 > 32 > 40 > 37; más de 40 se pasa
assert.ok(gana('12o 11c 10e 1b 0o'.replace(' 0o', ''), '12o 11c 10e 2b', 'juego') === false, 'empate en 31');
assert.ok(gana('10o 10c 10e 1b 0o'.replace(' 0o', ''), '10o 10c 7e 5b', 'juego'));
assert.equal(txt('12o 11c 10e 10b 10o', 'juego'), 'Se pasa (50)');
assert.equal(txt('12o 11c 10e 1b 0o'.replace(' 0o', ''), 'juego'), 'Juego 31');
// Especiales
const com = [...c('12o 12c 11e 5b'), { id: 1, p: null, n: 0, esp: 'comodin' }];
assert.equal(E.evaluar(com, 'pares', {}).clave[0], 3, 'el comodín hace duples');
const bom = [...c('5o 5c 7e 4b'), { id: 2, p: null, n: 0, esp: 'bomba' }];
assert.equal(E.evaluar(bom, 'pares', {}).clave[0], 1);
assert.ok(gana('1o 1c 4e 5b 6o', '12o 11c 7e 5b 6c', 'grande', { invertidas: true }), 'invertidas: los ases son reyes');
assert.throws(() => E.crearPartida([1, 2, 3, 4, 5].map((id) => ({ id, nombre: `J${id}` })), { modo: 'parejas' }), /4 o 6/);
assert.throws(() => E.crearPartida([1, 2, 3, 4].map((id) => ({ id, nombre: `J${id}` })), { categorias: ['grande'] }), /3 categorías/);

// Caso a mano: envite, subida, no quiero y deje
let p = E.crearPartida([1, 2, 3, 4].map((id) => ({ id, nombre: `J${id}` })), { objetivo: 40, sinReloj: true }, 0, () => 0.3);
[1, 2, 3, 4].forEach((id) => E.cambiar(p, id, []));
assert.equal(p.fase, 'apuestas');
const t1 = E.quienHabla(p);
E.hablar(p, t1, { tipo: 'envido', cantidad: 3 });
const t2 = E.quienHabla(p);
E.hablar(p, t2, { tipo: 'envido', cantidad: 2 }); // sube a 5
assert.equal(p.L.apuesta.total, 5);
assert.equal(p.L.pendientes.length, 3, 'tras una subida vuelven a hablar todos los demás');
while (p.fase === 'apuestas' && p.L.cat === 'grande') E.hablar(p, E.quienHabla(p), { tipo: 'noquiero' });
assert.equal(p.cerradas[0].tipo, 'rechazado');
assert.equal(p.bandos.find((b) => b.miembros.includes(t2)).puntos, 3, 'el deje es lo que había antes de subir');
assert.equal(p.fase, 'cambio');
// Las cartas que te quedas siguen en la siguiente categoría
const antes = p.manos[1].map((x) => x.id);
E.cambiar(p, 1, [antes[0], antes[1]]);
assert.deepEqual(p.manos[1].slice(0, 3).map((x) => x.id), antes.slice(2));

// Órdago querido: quien gana la categoría gana la partida
p = E.crearPartida([1, 2, 3, 4].map((id) => ({ id, nombre: `J${id}` })), { modo: 'parejas', sinReloj: true }, 0, () => 0.6);
[1, 2, 3, 4].forEach((id) => E.cambiar(p, id, []));
E.hablar(p, E.quienHabla(p), { tipo: 'ordago' });
E.hablar(p, E.quienHabla(p), { tipo: 'quiero' });
assert.equal(p.fase, 'conteo');
assert.ok(p.ganador != null);
assert.equal(E.vistaDe(p, 1).resumen[0].tipo, 'ordago');
E.siguiente(p);
assert.equal(p.fase, 'fin');
assert.ok(p.fin.ganadores.length === 2, 'por parejas ganan los dos');

// Partidas enteras al azar
let manos = 0; let partidas = 0;
for (let r = 0; r < 300; r++) {
  const n = E.AJUSTES.min + (r % (E.AJUSTES.max - E.AJUSTES.min + 1));
  const modo = r % 3 === 0 && (n === 4 || n === 6) ? 'parejas' : 'individual';
  const especiales = r % 4 === 0 ? { comodines: true, bombas: true, espejo: true, dobles: true, mutantes: true, invertidas: true } : {};
  const cats = r % 5 === 0 ? ['grande', 'pares', 'juego'] : undefined;
  let rnd = r * 7919 + 1;
  const rng = () => { rnd = (rnd * 16807) % 2147483647; return rnd / 2147483647; };
  const J = Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` }));
  const q = E.crearPartida(J, { modo, objetivo: E.OPCIONES.objetivo[r % 3], especiales, categorias: cats }, 0, rng);
  let t = 0; let pasos = 0;
  while (q.fase !== 'fin' && pasos < 30000) {
    pasos += 1; t += 1000;
    if (q.fase === 'cambio') {
      q.jugadores.filter((j) => !j.fuera && q.cambios[j.id] === undefined).forEach((j) => {
        const m = q.manos[j.id];
        E.cambiar(q, j.id, m.filter(() => rng() < 0.35).map((x) => x.id), t);
      });
    } else if (q.fase === 'apuestas') {
      const id = E.quienHabla(q);
      const x = rng();
      const a = q.L.apuesta;
      const acc = !a ? (x < 0.5 ? { tipo: 'paso' } : x < 0.97 ? { tipo: 'envido', cantidad: 2 + Math.floor(rng() * 5) } : { tipo: 'ordago' })
        : a.ordago ? { tipo: x < 0.3 ? 'quiero' : 'noquiero' }
          : (x < 0.45 ? { tipo: 'quiero' } : x < 0.85 ? { tipo: 'noquiero' } : x < 0.98 ? { tipo: 'envido', cantidad: 1 + Math.floor(rng() * 4) } : { tipo: 'ordago' });
      const res = E.hablar(q, id, acc, t);
      assert.ok(res.ok, res.error);
      if (rng() < 0.002) E.abandonar(q, q.jugadores[Math.floor(rng() * n)].id, t);
    } else if (q.fase === 'conteo') {
      manos += 1;
      const v = E.vistaDe(q, 1);
      assert.ok(v.resumen.length >= 1);
      v.resumen.forEach((l) => assert.ok(l.participantes.length >= 1 && l.ganador != null));
      E.siguiente(q, t);
    }
    // Invariantes
    const ids = Object.values(q.manos).flat().map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length, 'sin cartas repetidas');
    q.jugadores.filter((j) => !j.fuera && q.manos[j.id]).forEach((j) => assert.equal(q.manos[j.id].length, 5, 'siempre 5 cartas'));
    q.bandos.forEach((b) => assert.ok(b.puntos >= 0));
  }
  assert.equal(q.fase, 'fin', 'la partida termina');
  partidas += 1;
  // Nadie ve las cartas de los demás mientras se juega
}
const s = E.crearPartida([1, 2, 3, 4].map((id) => ({ id, nombre: `J${id}` })), {}, 0);
const vs = E.vistaDe(s, 1);
assert.equal(vs.resumen, null);
assert.ok(vs.yo.mano.length === 5 && !JSON.stringify(vs).includes('"manos"'));
console.log(`musavanzado-sim OK (${partidas} partidas, ${manos} manos)`);
