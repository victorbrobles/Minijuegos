// Prueba de «Torre Inestable»: física (caídas, derribos), turnos, rondas y puntos.
import assert from 'assert';
import * as CANNON from 'cannon-es';
import * as E from '../../client/src/games/Torre/engine.js';
import { PIEZAS } from '../../client/src/games/Torre/piezas.js';
E.usarFisica(CANNON);

const jug = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` }));
// Una pieza en el centro se queda en la plataforma; todas las formas son simulables
for (const tipo of Object.keys(PIEZAS)) {
  const pz = { id: 1, tipo, escala: 1, por: 1 };
  pz.pose = E.poseInicial([], pz, 0, 0, 0, false);
  const r = E.simular([], pz);
  assert.ok(!r.derribo, `${tipo} en el centro no debería caer`);
  assert.ok(r.poses[0][1] > 0 && r.poses[0][1] < 2, `${tipo} reposa sobre la plataforma (${r.poses[0][1]})`);
}
// Soltar fuera de la plataforma = derribo
{
  const p = E.crearPartida(jug(3), [], { rondas: 3 }, 0);
  const a = p.jugadores[p.turno];
  const r = E.soltar(p, a.id, { x: 2.6, z: 2.6 }, 0);
  assert.ok(r.ok && r.derribo, 'fuera de la plataforma se cae');
  assert.equal(p.fase, 'derribo'); assert.equal(a.puntos, 0);
  assert.ok(p.jugadores.filter((j) => j.id !== a.id).every((j) => j.puntos === 1));
  E.seguir(p); assert.equal(p.ronda, 2); assert.equal(p.piezas.length, 0);
}
// Torre apilada en el centro: aguanta varias piezas grandes
{
  const p = E.crearPartida(jug(2), [], { rondas: 1 }, 0);
  let aguanta = 0;
  for (let i = 0; i < 5; i++) { p.proxima = { tipo: 'losa', escala: 1 }; const r = E.soltar(p, p.jugadores[p.turno].id, { x: 0, z: 0 }, 0); if (!r.derribo) aguanta++; }
  assert.equal(aguanta, 5, 'cinco losas centradas aguantan');
  assert.ok(p.altura > 1.3, `altura ${p.altura}`);
}
// Partidas al azar hasta el final
for (let k = 0; k < 6; k++) {
  const p = E.crearPartida(jug(2 + (k % 5)), [], { rondas: 1 + (k % 2) * 2, online: true }, 0);
  let n = 0;
  while (p.fase !== 'fin' && n++ < 200) {
    if (p.fase === 'derribo') E.seguir(p);
    else E.soltar(p, p.jugadores[p.turno].id, { x: (Math.random() - 0.5) * 2.2, z: (Math.random() - 0.5) * 2.2, rotY: Math.floor(Math.random() * 24) * 15, tumbar: Math.random() < 0.3 }, 0);
  }
  assert.equal(p.fase, 'fin', 'la partida termina');
  assert.ok(p.fin.ganadores.length >= 1);
}
// Reloj online: se suelta sola
{
  const p = E.crearPartida(jug(2), [], { online: true }, 0);
  E.tick(p, E.SEG_TURNO * 1000 + 1);
  assert.ok(p.piezas.length === 1 || p.fase === 'derribo');
}
console.log('Torre Inestable: OK');
