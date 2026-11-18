// Prueba de «Curling»: lanzamientos al azar, mangas y puntuación (solo puntúa quien tiene la piedra más cercana).
import assert from 'assert';
import * as E from '../../client/src/games/Curling/engine.js';
// Puntuación
const s = (de, d) => ({ de, x: E.CASA.x, y: E.CASA.y - d });
assert.deepEqual(E.puntuarManga([s(1, 1), s(1, 2), s(2, 3), s(1, 5)]), { ganador: 1, puntos: 2 });
assert.deepEqual(E.puntuarManga([s(2, 20)]), { ganador: null, puntos: 0 });
// Una piedra con fuerza media llega cerca de la casa
const r = E.simularLanzamiento([], { vx: 0, vy: E.velocidad(50), efecto: 0 }, 1);
const y = r.cuerpos[0].y; console.log('fuerza 50 se para en y =', y.toFixed(1), '(casa en', E.CASA.y, ')');
assert.ok(Math.abs(y - E.CASA.y) < 25);
// El efecto curva
const r2 = E.simularLanzamiento([], { vx: 0, vy: E.velocidad(50), efecto: 1 }, 1);
console.log('con efecto x =', r2.cuerpos[0].x.toFixed(2));
assert.ok(r2.cuerpos[0].x > E.W / 2 + 0.5 || r2.cuerpos[0].fuera);
let puntos = 0;
for (let k = 0; k < 30; k++) {
  const n = 2 + (k % 4);
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i}` })), [], { mangas: 2 }, 0);
  let t = 0;
  while (p.fase !== 'fin' && t < 1e8) {
    if (p.fase === 'turno') assert.ok(E.accion(p, E.turnoDe(p), { tipo: 'lanzar', ang: (Math.random() - 0.5) * 6, pot: 40 + Math.random() * 25, efecto: [-1, 0, 1][k % 3] }, t).ok);
    t += 6000; E.tick(p, t);
  }
  assert.equal(p.fase, 'fin');
  puntos += p.jugadores.reduce((a, j) => a + j.puntos, 0);
}
console.log(`Curling: 30 partidas, ${puntos} puntos repartidos. OK`);
assert.ok(puntos > 20);
