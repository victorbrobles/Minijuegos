// Prueba de «Garabato Encadenado»: reparto de cadenas (nadie repite cadena), privacidad, revelación, votos y puntos.
import assert from 'assert';
import * as E from '../../client/src/games/Garabato/engine.js';

const jug = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` }));
for (const n of [3, 4, 5, 8]) {
  for (const online of [true, false]) {
    const p = E.crearPartida(jug(n), [], { online, tiempo: 'normal' }, 0);
    assert.equal(p.pasos, n);
    while (p.fase === 'jugando') {
      for (const j of p.jugadores) {
        const v = E.vistaDe(p, j.id, 0);
        assert.ok(v.tarea, 'cada jugador tiene tarea');
        if (p.paso > 0) assert.ok(v.tarea.previo, 've la entrada anterior');
        assert.ok(!v.cadenas, 'no ve las cadenas mientras se juega');
        const valor = v.tarea.tipo === 'dibujo' ? [{ c: 1, g: 0, p: [0, 0, 500, 500, 1200, -5] }] : (v.tarea.tipo === 'frase' ? `Un gato astronauta ${j.id}` : 'gato en el espacio');
        if (p.fase === 'jugando') assert.ok(E.accion(p, online ? j.id : null, { tipo: 'entregar', valor }, 0).ok);
      }
    }
    assert.equal(p.fase, 'revelar');
    // Cada cadena: n entradas, alternando, cada una de un jugador distinto
    p.cadenas.forEach((c) => {
      assert.equal(c.entradas.length, n);
      assert.equal(new Set(c.entradas.map((e) => e.por)).size, n, 'nadie repite en una cadena');
      c.entradas.forEach((e, i) => assert.equal(e.tipo, i % 2 === 1 ? 'dibujo' : 'texto'));
    });
    const d = Object.values(p.dibujos)[0];
    assert.deepEqual(d.trazos[0].p, [0, 0, 500, 500, 1000, 0], 'coordenadas recortadas');
    let pasos = 0; while (p.fase === 'revelar') { E.siguiente(p); pasos++; }
    assert.equal(pasos, n * n);
    for (const j of p.jugadores) {
      const v = E.vistaDe(p, j.id);
      const dib = v.cadenas.flatMap((c) => c.entradas).find((e) => e.tipo === 'dibujo' && e.por !== j.id);
      const txt = v.cadenas.flatMap((c, ci) => c.entradas.map((e, ei) => ({ ...e, k: `${ci}-${ei}` }))).find((e) => e.tipo === 'texto' && e.por !== j.id);
      assert.ok(!E.votar(p, j.id, Object.keys(p.dibujos).find((k) => p.cadenas.flatMap((c) => c.entradas).find((e) => e.valor === k)?.por === j.id), txt.k).ok, 'no te votas a ti');
      assert.ok(E.accion(p, online ? j.id : null, { tipo: 'votar', dibujo: dib.dibujo.id, texto: txt.k }).ok);
    }
    assert.equal(p.fase, 'fin');
    const totalVotos = p.fin.tabla.reduce((s, t) => s + t.dibujo + t.texto, 0);
    assert.equal(totalVotos, 2 * n);
    assert.ok(p.fin.tabla.some((t) => t.pillados > 0), '«gato» de la descripción coincide con la frase');
  }
}
// Reloj: online se cierra solo; en un móvil no hay reloj
{
  const p = E.crearPartida(jug(4), [], { online: true }, 0);
  E.entregar(p, p.jugadores[0].id, 'Hola mundo', 0);
  E.tick(p, 46000);
  assert.equal(p.paso, 1, 'el reloj cierra el paso');
  assert.ok(p.cadenas.every((c) => c.entradas[0].valor), 'frase automática para quien no escribió');
  const l = E.crearPartida(jug(4), [], { online: false }, 0);
  assert.equal(l.limite, null);
}
// Abandono
{
  const p = E.crearPartida(jug(4), [], { online: true }, 0);
  E.abandonar(p, p.jugadores[1].id, 0);
  p.jugadores.filter((j) => !j.fuera).forEach((j) => E.entregar(p, j.id, 'Algo', 0));
  assert.equal(p.paso, 1);
}
console.log('Garabato Encadenado: OK');
