// Simulación de «El Escondite»: partidas completas con jugadores al azar y comprobación de la puntuación.
import assert from 'assert';
import { M, minimoOpciones, CAMBIOS } from '../../client/src/games/Escondite/engine.js';
import { elegir, elegirConReservas } from '../routes/escondite.js';
import { TODAS } from '../data/seeds/escondite/index.js';
import { nombreOpcion } from '../../client/src/games/comun/simultaneo.js';

assert.equal(TODAS.length, 200);
TODAS.forEach((c) => assert.ok(c.opciones.length >= 5 && c.opciones.length <= 11, c.titulo));
for (const n of [3, 6, 12]) {
  const items = elegir(new Set(), n * 4, n);
  assert.equal(items.length, n * 4);
  items.forEach((c) => assert.ok(c.opciones.length >= minimoOpciones(n)));
}
// Reservas para cambiar de categoría
const conRes = elegirConReservas(new Set(), 4, 3);
conRes.forEach((c) => assert.equal(c.alternativas.length, CAMBIOS));
// Partida dirigida: 3 jugadores, la ronda 1 se esconde el 1
let p = M.crearPartida([1, 2, 3].map((id) => ({ id, nombre: `J${id}` })), [{ ...TODAS[0], alternativas: [TODAS[5], TODAS[6], TODAS[7], TODAS[8]] }, TODAS[1]], {}, 0);
assert.equal(p.ext.escondido, 1);
// Los buscadores esperan a que se esconda
assert.equal(M.responder(p, 2, 'Tajo', 1).ok, false);
// Cambia la categoría 3 veces como mucho
assert.ok(!M.cambiar(p, 2, 1).ok, 'solo el escondido cambia');
assert.ok(M.cambiar(p, 1, 1).ok); assert.equal(p.ext.cat.titulo, TODAS[5].titulo);
assert.ok(M.cambiar(p, 1, 1).ok); assert.ok(M.cambiar(p, 1, 1).ok);
assert.ok(!M.cambiar(p, 1, 1).ok, 'máximo 3 cambios');
assert.equal(p.ext.cat.titulo, TODAS[7].titulo);
// Vuelta a una partida limpia con la categoría de los ríos
p = M.crearPartida([1, 2, 3].map((id) => ({ id, nombre: `J${id}` })), [TODAS[0], TODAS[1]], {}, 0);
// La respuesta del escondido se da por buena aunque no esté en la lista (sin enseñarle las posibles)
const r = M.responder(p, 1, 'guadiana', 1);
assert.ok(r.ok && !r.opciones);
assert.ok(M.responder(p, 2, 'Tajo', 1).ok);
assert.ok(M.responder(p, 3, 'el guadiana', 1).ok);
assert.equal(p.fase, 'resuelta');
assert.deepEqual(p.jugadores.map((j) => j.puntos), [0, 0, 1], 'lo encuentra el 3');
M.siguiente(p, 2);
assert.equal(p.ext.escondido, 2);
// El escondido pone algo que no es de la categoría: él 0, los demás +1
M.responder(p, 2, 'Badajoz', 3); M.responder(p, 1, 'Badajoz', 3); M.responder(p, 3, 'Cádiz', 3);
assert.ok(p.resultado.fueraDeLista);
assert.deepEqual(p.jugadores.map((j) => j.puntos), [1, 0, 2]);
// Los buscadores pueden escribir cualquier cosa (no se les rechaza)
M.siguiente(p, 4);
assert.equal(p.fase, 'fin'); assert.deepEqual(p.fin.ganadores, [3]);
// Nadie lo encuentra: suma el escondido
p = M.crearPartida([1, 2, 3].map((id) => ({ id, nombre: `J${id}` })), [TODAS[0]], {}, 0);
M.responder(p, 1, 'Ebro', 1); M.responder(p, 2, 'Tajo', 1); M.responder(p, 3, 'algo raro', 1);
assert.deepEqual(p.jugadores.map((j) => j.puntos), [1, 0, 0]);
// Partidas al azar
for (let k = 0; k < 200; k++) {
  const n = 3 + (k % 10);
  const items = elegirConReservas(new Set(), n * 2, n);
  p = M.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i}` })), items, {}, 0);
  let t = 0;
  while (p.fase !== 'fin') {
    const it = p.items[p.ronda - 1];
    if (Math.random() < 0.3) M.cambiar(p, p.ext.escondido, t);
    const cat = p.ext.cat;
    const orden = [p.jugadores.find((j) => j.id === p.ext.escondido), ...p.jugadores.filter((j) => j.id !== p.ext.escondido)];
    orden.forEach((j) => { if (Math.random() < 0.05) return; M.responder(p, j.id, Math.random() < 0.1 ? 'Respuesta inventada' : nombreOpcion(cat.opciones[Math.floor(Math.random() * cat.opciones.length)]), t); });
    t += 61000; M.tick(p, t);
    assert.equal(p.fase, 'resuelta');
    M.vistaDe(p, 1);
    M.siguiente(p, t);
  }
}
console.log('El Escondite: OK');
