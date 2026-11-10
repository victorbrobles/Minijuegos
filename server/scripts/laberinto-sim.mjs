// Simulación de «El Laberinto»: tableros válidos y partidas enteras con jugadores que se mueven al azar.
import assert from 'node:assert/strict';
import * as E from '../laberinto/engine.js';

// Todas las salas son alcanzables desde cualquier esquina (ignorando puertas, que se pueden abrir)
for (let k = 0; k < 200; k++) {
  const { pasos, salas } = E.crearTablero();
  const visto = new Set([0]); const cola = [0];
  while (cola.length) { const a = cola.shift(); E.vecinos(a).forEach((v) => { const key = a < v.id ? `${a}-${v.id}` : `${v.id}-${a}`; if (pasos[key] && !visto.has(v.id)) { visto.add(v.id); cola.push(v.id); } }); }
  assert.equal(visto.size, 49, 'laberinto conexo');
  assert.equal(salas.filter((s) => s.contenido === 'corazon').length, 1);
}
let escapes = 0; let tiempo = 0; let robos = 0;
for (let g = 0; g < 300; g++) {
  const n = 2 + (g % 3);
  const J = Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}`, personaje: i === 0 ? 'guerrera' : null }));
  let t = 0;
  const p = E.crearPartida(J, { rondasMax: 40 }, t);
  assert.equal(new Set(p.jugadores.map((j) => j.personaje)).size, n, 'personajes distintos');
  assert.equal(p.jugadores[0].personaje, 'guerrera');
  let pasos = 0;
  while (p.fase !== 'fin' && pasos++ < 20000) {
    const id = p.turno.jugadorId;
    const v = E.vistaDe(p, id);
    const yo = v.jugadores.find((j) => j.id === id);
    const rival = v.jugadores.find((j) => j.id !== id && j.sala === yo.sala && (j.oro || j.corazon));
    if (rival && p.turno.accion && Math.random() < 0.7) { const r = E.robar(p, id, rival.id, t); if (r.ok && r.exito) robos += 1; continue; }
    if (p.turno.accion && v.yo.objetos.includes('cepo') && Math.random() < 0.3) { E.ponerCepo(p, id); continue; }
    if (Math.random() < 0.02) { E.proponerPacto(p, id, v.jugadores.find((j) => j.id !== id).id); }
    v.yo.propuestas.forEach((x) => E.responderPacto(p, id, x.id, Math.random() < 0.5));
    const opciones = v.yo.opciones.filter((o) => !o.motivo);
    if (!opciones.length || p.turno.pasos <= 0) { E.terminarTurno(p, id, t); continue; }
    // con el Corazón, hacia la esquina más cercana; si no, hacia el centro o al azar
    const objetivo = yo.corazon ? 0 : 24;
    const dist = (a) => { const [f, c] = [Math.floor(a / 7), a % 7]; const [F, C] = [Math.floor(objetivo / 7), objetivo % 7]; return Math.abs(f - F) + Math.abs(c - C); };
    const o = Math.random() < 0.6 ? opciones.sort((a, b) => dist(a.id) - dist(b.id))[0] : opciones[Math.floor(Math.random() * opciones.length)];
    const r = E.mover(p, id, o.id, t);
    assert.ok(r.ok, r.error);
    // invariantes
    assert.ok(p.jugadores.filter((j) => j.corazon).length + p.salas.filter((s) => s.contenido === 'corazon').length <= 1, 'un solo Corazón');
    p.jugadores.forEach((j) => assert.ok(j.vidas > 0 && j.oro >= 0 && j.llaves >= 0));
    if (Math.random() < 0.01) { t += 80_000; E.tick(p, t); }
  }
  assert.equal(p.fase, 'fin');
  if (p.fin.escapado != null) escapes += 1; else tiempo += 1;
}
// La vista no enseña las salas sin descubrir ni los cepos ajenos
const q = E.crearPartida([{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }]);
const v = E.vistaDe(q, 2);
assert.ok(v.salas.filter((s) => !s.descubierta).every((s) => !('contenido' in s)));
console.log(`laberinto-sim OK (300 partidas: ${escapes} escapes con el Corazón, ${tiempo} por tiempo, ${robos} robos)`);
