// Prueba de «Estelas» (movimiento libre): rondas con bots hasta el final; las motos no salen de la arena, la estela
// se apaga (nunca más larga que VIDA pasos), apuntar gira con límite y la sincronización cuadra.
import assert from 'assert';
import * as E from '../../client/src/games/Estelas/engine.js';
for (let k = 0; k < 12; k++) {
  const n = 2 + (k % 6);
  const p = E.crearPartida(Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i}`, bot: true })), [], { rondas: 2 }, 0);
  let t = 0;
  while (p.fase !== 'fin' && t < 3e6) {
    t += 100; E.tick(p, t);
    if (p.fase === 'jugando') p.jugadores.forEach((j) => {
      assert.ok(j.rastro.length <= E.VIDA + 2, 'la estela se apaga');
      if (j.vivo) assert.ok(j.x > 0 && j.y > 0 && j.x < E.C && j.y < E.F, 'dentro de la arena');
    });
  }
  assert.equal(p.fase, 'fin'); assert.ok(p.fin.ganadores.length >= 1);
}
// Apuntar: gira hacia el punto, como mucho GIRO por paso
{
  const p = E.crearPartida([{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }], [], {}, 0);
  const j = p.jugadores[0]; const a0 = j.ang;
  E.apuntar(p, 1, { mira: [j.x + Math.cos(a0 + 1.5) * 10, j.y + Math.sin(a0 + 1.5) * 10] });
  E.tick(p, E.SEG_CUENTA * 1000 + E.PASO_MS + 1);
  const d = Math.abs(j.ang - a0); assert.ok(d > 0.15 && d <= E.GIRO + 1e-9, `giro limitado (${d})`);
  // Sincronización: posición y lo nuevo desde un paso
  E.tick(p, E.SEG_CUENTA * 1000 + 20 * E.PASO_MS + 1);
  const s1 = E.sincronizar(p, 1, { desde: -1, ronda: 0 });
  const s2 = E.sincronizar(p, 1, { desde: 10, ronda: p.ronda });
  assert.equal(s1.jugadores[0].nuevos.length, p.jugadores[0].rastro.length);
  assert.ok(s2.jugadores[0].nuevos.every((q) => q[2] > 10));
  assert.ok(Number.isFinite(s1.jugadores[0].x) && Number.isFinite(s1.jugadores[0].ang));
}
console.log('Estelas: 12 partidas con bots, giro libre y sincronización. OK');
