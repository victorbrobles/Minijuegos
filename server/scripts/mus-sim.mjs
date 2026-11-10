// Simulación del Mus: comparaciones de manos y partidas enteras entre bots.
import assert from 'node:assert/strict';
import * as E from '../mus/engine.js';

const c = (n, p = 'oros') => ({ id: Math.random(), p, n });
// Grande: rey-rey gana a rey-caballo; los treses son reyes
assert.ok(E.comparar('grande', [c(12), c(3), c(4), c(5)], [c(12), c(11), c(7), c(7)]) > 0);
// Chica: los doses son ases
assert.ok(E.comparar('chica', [c(1), c(2), c(4), c(5)], [c(1), c(4), c(4), c(5)]) > 0);
// Pares: duples > medias > pareja
assert.equal(E.paresDe([c(12), c(3), c(10), c(10)]).tipo, 'duples');
assert.equal(E.paresDe([c(7), c(7), c(7), c(1)]).tipo, 'medias');
assert.equal(E.paresDe([c(2), c(1), c(5), c(6)]).tipo, 'pareja');
assert.equal(E.paresDe([c(4), c(5), c(6), c(7)]), null);
assert.ok(E.comparar('pares', [c(4), c(4), c(5), c(5)], [c(12), c(12), c(12), c(1)]) > 0);
// Juego: 31 es lo mejor, luego 32, 40, 37…
assert.equal(E.sumaJuego([c(12), c(11), c(10), c(1)]), 31);
assert.ok(E.comparar('juego', [c(12), c(11), c(10), c(1)], [c(12), c(11), c(10), c(10)]) > 0);
assert.ok(E.comparar('juego', [c(12), c(11), c(7), c(5)], [c(12), c(11), c(10), c(10)]) > 0, '32 gana a 40');

// Partidas enteras con cuatro bots
let manos = 0; let ordagos = 0;
for (let k = 0; k < 120; k++) {
  const J = [0, 1, 2, 3].map((i) => ({ id: i + 1, nombre: `B${i}`, bot: true }));
  let t = 1_000_000;
  const p = E.crearPartida(J, { objetivo: k % 2 ? 30 : 40, vacas: k % 3 ? 1 : 3 }, t);
  let pasos = 0;
  while (p.fase !== 'fin' && pasos < 20000) {
    t += 2000; pasos += 1;
    E.tick(p, t);
    if (p.fase === 'conteo' || p.fase === 'finJuego') { manos += 1; if (p.conteo?.ordago) ordagos += 1; E.forzarSeguir(p, t); }
    // invariantes
    assert.ok(p.cartas.every((m) => m.length === 4), 'siempre cuatro cartas');
    const ids = p.cartas.flat().map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length, 'sin cartas repetidas');
  }
  assert.equal(p.fase, 'fin', 'la partida termina');
  assert.ok(p.juegos[p.fin.ganadora] >= Math.ceil(p.vacas / 2));
  const v = E.vistaDe(p, 1);
  assert.ok(v.jugadores.every((j) => j.cartas), 'al final se ven las cartas');
}
// Un humano no ve las cartas de los demás mientras se juega
const q = E.crearPartida([{ id: 1, nombre: 'Yo' }, { id: 2, nombre: 'B', bot: true }, { id: 3, nombre: 'C', bot: true }, { id: 4, nombre: 'D', bot: true }], {}, 0);
const v = E.vistaDe(q, 1);
assert.ok(v.jugadores[0].cartas && v.jugadores.slice(1).every((j) => j.cartas === null));
console.log(`mus-sim OK (${manos} manos, ${ordagos} órdagos queridos)`);
