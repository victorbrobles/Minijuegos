// Prueba de los juegos de un jugador de trivia y fútbol: cada generador produce datos válidos.
import assert from 'assert';
import { JUEGOS_SOLO, enlace, buscarJugador } from '../lib/solo.js';

for (let n = 0; n < 5; n++) {
  const e = JUEGOS_SOLO.escalera();
  assert.equal(e.preguntas.length, 15); assert.equal(e.reservas.length, 5);
  e.preguntas.forEach((q) => assert.ok(q.opciones.includes(q.correcta) && q.opciones.length === 4));
  assert.equal(new Set(e.preguntas.map((q) => q.p)).size, 15);

  const c = JUEGOS_SOLO.cronologia();
  assert.ok(c.cartas.length >= 60); c.cartas.forEach((x) => assert.ok(Number.isFinite(x.anio) && x.texto));

  const k = JUEGOS_SOLO.cadena();
  assert.ok(k.categorias.length >= 40); k.categorias.forEach((x) => assert.ok(x.opciones.length >= 5));

  const q = JUEGOS_SOLO.quiensoy();
  assert.ok(q.objetivos.length >= 40);
  const firma = (i) => q.preguntas.map((p) => p.si.includes(i)).join();
  q.objetivos.forEach((o) => assert.equal(q.candidatos.filter((_, i) => firma(i) === firma(o)).length, 1));

  const o = JUEGOS_SOLO.onceperdido();
  assert.equal(o.rondas.length, 5); o.rondas.forEach((x) => { assert.equal(x.jugadores.length, 11); assert.equal(x.jugadores.filter((j) => j.oculto).length, 4); });

  const x = JUEGOS_SOLO.conexion();
  assert.equal(x.retos.length, 5);
  x.retos.forEach((rt) => {
    assert.equal(rt.solucion.length, rt.eslabones + 2);
    for (let i = 1; i < rt.solucion.length; i++) assert.ok(enlace(rt.solucion[i - 1].nombre, rt.solucion[i].nombre).ok, JSON.stringify(rt));
    assert.ok(!enlace(rt.desde, rt.hasta).ok);
  });

  const d = JUEGOS_SOLO.duelofutbol();
  assert.ok(d.duelos.length >= 100); d.duelos.forEach((y) => assert.ok(['a', 'b'].includes(y.gana) && y.a.nombre !== y.b.nombre));

  const s = JUEGOS_SOLO.escudo();
  assert.equal(s.rondas.length, 10); s.rondas.forEach((y) => { assert.ok(y.logo.startsWith('https://')); assert.equal(new Set(y.opciones).size, 4); assert.ok(y.opciones.includes(y.correcta)); });

  const m = JUEGOS_SOLO.manager();
  assert.equal(m.mercados.length, 3); m.mercados.forEach((mm) => assert.equal(mm.length, 12)); assert.equal(m.rivales.length, 19);

  const z = JUEGOS_SOLO.misterioso();
  assert.equal(z.secretos.length, 3); z.futbolistas.forEach((f) => assert.ok(f.liga !== 'Otra' && !f.pais.match(/^[A-Z]{3}$/), f.nombre));
}
assert.ok(buscarJugador('casillas'));
assert.ok(enlace('Iker Casillas', 'Xavi Hernández').ok);
const x = JUEGOS_SOLO.conexion(); console.log(x.nombres.length, 'jugadores en el grafo ·', x.retos.map((r) => `${r.desde} → ${r.hasta} (${r.eslabones})`).join(' | '));
console.log(JUEGOS_SOLO.escudo().rondas.length, 'escudos ok ·', JUEGOS_SOLO.duelofutbol().duelos.slice(0, 2).map((d) => d.pregunta + ' ' + d.a.nombre + ' vs ' + d.b.nombre).join(' | '));
console.log('solo-sim OK');
