// Prueba de «Curling»: barrido, hielos, piedra pesada, botón doble, simulación en directo = servidor y partidas al azar.
import assert from 'assert';
import * as E from '../../client/src/games/Curling/engine.js';
// Puntuación (con el botón doble)
const s = (de, d) => ({ de, x: E.CASA.x, y: E.CASA.y - d });
assert.deepEqual(E.puntuarManga([s(1, 2), s(1, 2.5), s(2, 3), s(1, 5)]), { ganador: 1, puntos: 2, boton: 0 });
assert.deepEqual(E.puntuarManga([s(1, 0.5), s(2, 3)]), { ganador: 1, puntos: 2, boton: 1 });
assert.deepEqual(E.puntuarManga([s(2, 20)]), { ganador: null, puntos: 0, boton: 0 });
const tira = (pot, ef = 0, b = [], h = 'normal', antes = [], pesada = false) => E.simularLanzamiento(antes, E.tiroDe(0, pot, ef, pesada, b), 1, h).cuerpos;
// Cada mapa pide una fuerza distinta: la mínima que llega al centro va de flojita a muy fuerte
const fuerzaCentro = (id) => { let pot = 0; while (pot < 100 && tira(pot, 0, [], id)[0].y < E.mapaDe(id).casa) pot += 1; return pot; };
const fuerzas = E.MAPAS.filter((m) => !m.obst.length).map((m) => fuerzaCentro(m.id));
console.log('fuerza para el centro según el mapa:', E.MAPAS.filter((m) => !m.obst.length).map((m, i) => `${m.id} ${fuerzas[i]}`).join(' · '));
assert.ok(Math.min(...fuerzas) < 30 && Math.max(...fuerzas) > 60, 'mapas flojos y fuertes');
const y = tira(44)[0].y; assert.ok(Math.abs(y - E.mapaDe('clasica').casa) < 12);
// Mapas con pilares: tirar recto choca, curvando se llega
for (const id of ['muralla', 'pilares']) {
  const m = E.mapaDe(id); let ok = 0;
  for (let ang = -6; ang <= 6; ang += 0.5) for (const ef of [-1, 1]) for (let pot = 40; pot <= 80; pot += 1) { const c = E.simularLanzamiento([], E.tiroDe(ang, pot, ef, false, []), 1, id).cuerpos[0]; if (!c.fuera && E.distancia(c, m.CASA) < 4) ok += 1; }
  assert.ok(ok > 0, `${id} se puede ganar curvando`);
}
// Rebota en el fondo y en las bandas (no desaparece)
const fuerte = tira(100)[0]; assert.ok(!fuerte.fuera && fuerte.y < E.L - E.R + 0.01 && fuerte.y > E.mapaDe('clasica').FONDO - 20, 'rebota en el fondo y se queda');
const lado = E.simularLanzamiento([], E.tiroDe(10, 100, 0, false, []), 1, 'clasica').cuerpos[0]; assert.ok(!lado.fuera && lado.x <= E.W - E.R + 0.01, 'rebota en la banda');
// Barrer: llega más lejos y se curva menos
const sinB = tira(32, 1); const conB = tira(32, 1, Array(400).fill(3));
assert.ok(tira(34, 0, Array(400).fill(3))[0].y > tira(34)[0].y + 25, 'barrer se nota');
console.log('sin barrer', sinB[0].x.toFixed(1), sinB[0].y.toFixed(1), '· barriendo', conB[0].x.toFixed(1), conB[0].y.toFixed(1));
assert.ok(conB[0].y > sinB[0].y + 10 || conB[0].y > E.L - 10, 'barrer alarga');
assert.ok(Math.abs(conB[0].x - E.SALIDA.x) < Math.abs(sinB[0].x - E.SALIDA.x), 'barrer endereza');
// El efecto curva
assert.ok(tira(45, 1)[0].x > E.W / 2 + 3 && tira(45, -1)[0].x < E.W / 2 - 3);
// Pesada: saca más lejos una piedra de la casa
const blanco = [{ id: 'b', de: 2, x: E.SALIDA.x, y: E.CASA.y }];
const normal = tira(50, 0, [], 'clasica', blanco).find((c) => c.id === 'b'); const fuerteP = tira(50, 0, [], 'clasica', blanco, true).find((c) => c.id === 'b');
assert.ok(fuerteP.y > normal.y, 'la pesada pega más fuerte');
// La simulación en directo (barrido que va llegando) da exactamente lo mismo que la del servidor
for (let k = 0; k < 20; k++) {
  const piedras = Array.from({ length: k % 5 }, (_, i) => ({ id: `q${i}`, de: 1 + (i % 2), x: 8 + Math.random() * 18, y: 100 + Math.random() * 35, pesada: i === 2 }));
  const b = []; const tiro = E.tiroDe((Math.random() - 0.5) * 10, 30 + Math.random() * 50, [-1, 0, 1][k % 3], k % 4 === 0, b);
  const sim = E.crearLanzamiento(piedras, tiro, 1, E.HIELOS[k % 3].id);
  while (!sim.acabado) { const slot = Math.floor(sim.f / E.BARRIDO_FRAMES); while (b.length <= slot) b.push(Math.floor(Math.random() * 4)); sim.paso(); }
  E.cerrarLanzamiento(sim.cs, E.HIELOS[k % 3].id);
  const srv = E.simularLanzamiento(piedras, { ...tiro, barrido: E.limpiarBarrido(b.slice()) }, 1, E.HIELOS[k % 3].id);
  assert.deepEqual(srv.cuerpos.map((c) => [c.x, c.y, Boolean(c.fuera)]), sim.cs.filter((c) => !c.obst).map((c) => [c.x, c.y, Boolean(c.fuera)]), 'directo = servidor');
}
// Partidas al azar
let puntos = 0;
for (let k = 0; k < 30; k++) {
  const n = 2 + (k % 4);
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i}` })), [], { mangas: 2 }, 0);
  let t = 0;
  while (p.fase !== 'fin' && t < 1e8) {
    if (p.fase === 'turno') {
      const b = Array.from({ length: 30 }, () => Math.floor(Math.random() * 4));
      assert.ok(E.accion(p, E.turnoDe(p), { tipo: 'lanzar', ang: (Math.random() - 0.5) * 6, pot: 28 + Math.random() * 30, efecto: [-1, 0, 1][k % 3], pesada: Math.random() < 0.3, barrido: b }, t).ok);
    }
    t += 6000; E.tick(p, t);
  }
  assert.equal(p.fase, 'fin');
  puntos += p.jugadores.reduce((a, j) => a + j.puntos, 0);
}
// Barrido con basura: se limpia
assert.deepEqual(E.limpiarBarrido([9, -2, 'x', 1.6]), [3, 0, 0, 2]);
console.log(`Curling: 30 partidas, ${puntos} puntos repartidos. OK`);
assert.ok(puntos > 20);
