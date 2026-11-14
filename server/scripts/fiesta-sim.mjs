// Simula partidas al azar de Patata Caliente, Subasta a ciegas, El Dragón, Pirámides y Última Transmisión.
import assert from 'assert';
import * as Dr from '../../client/src/games/Dragon/engine.js';
import * as Su from '../../client/src/games/Subasta/engine.js';
import * as Pa from '../../client/src/games/Patata/engine.js';
import * as Pi from '../../client/src/games/Piramides/engine.js';
import * as Tr from '../../client/src/games/Transmision/engine.js';

const azar = (l) => l[Math.floor(Math.random() * l.length)];
const jugadores = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` }));
const cerrada = (p) => { assert.equal(p.fase, 'fin'); assert.ok(Array.isArray(p.fin.tabla) && Array.isArray(p.fin.ganadores)); };

// ---------------- El Dragón
let dragones = 0; let salas = 0;
for (let k = 0; k < 300; k++) {
  const n = 2 + (k % 7); const p = Dr.crearPartida(jugadores(n), [], { expediciones: azar([3, 5, 7]) });
  let pasos = 0;
  while (p.fase !== 'fin' && pasos++ < 5000) {
    const quien = Dr.turnoLocal(p);
    if (quien != null) assert.ok(Dr.accion(p, quien, { tipo: 'decidir', decision: Math.random() < 0.7 ? 'seguir' : 'volver' }).ok);
    else { if (p.motivo === 'dragon') dragones++; salas += p.salas.length; Dr.accion(p, null, { tipo: 'seguir' }); }
    if (k % 50 === 0 && pasos === 3) Dr.abandonar(p, 1);
  }
  cerrada(p);
  const total = p.jugadores.reduce((a, j) => a + j.cofre, 0);
  assert.ok(total >= 0 && p.jugadores.every((j) => j.mochila === 0 || p.fase === 'fin'));
}
console.log(`Dragón OK · ${dragones} dragones · ${(salas / 1500).toFixed(1)} salas por expedición (aprox.)`);

// ---------------- Subasta
for (let k = 0; k < 300; k++) {
  const n = 2 + (k % 7); const p = Su.crearPartida(jugadores(n), [], { lotes: azar([6, 8, 10]) });
  let pasos = 0;
  while (p.fase !== 'fin' && pasos++ < 2000) {
    const quien = Su.turnoLocal(p);
    if (quien != null) {
      const j = p.jugadores.find((x) => x.id === quien);
      assert.ok(Su.accion(p, quien, { tipo: 'pujar', cantidad: Math.floor(Math.random() * (j.monedas + 1) * 0.6) }).ok);
      const v = Su.vistaDe(p, quien);
      assert.ok(v.lote.contenido === undefined || v.yo.lotes.some((l) => l.efecto === 'lupa'), 'el contenido solo se ve con lupa');
    } else Su.accion(p, null, { tipo: 'seguir' });
  }
  cerrada(p);
  assert.ok(Su.accion(p, 1, { tipo: 'pujar', cantidad: 5 }).ok === false);
  p.jugadores.forEach((j) => assert.ok(j.monedas >= 0, `monedas negativas: ${j.monedas}`));
}
console.log('Subasta OK');

// ---------------- Patata Caliente (con reloj simulado)
let explosiones = 0;
for (let k = 0; k < 200; k++) {
  const n = 2 + (k % 7); let t = 0; const p = Pa.crearPartida(jugadores(n), [], { vidas: azar([2, 3, 4]) }, t);
  let pasos = 0;
  while (p.fase !== 'fin' && pasos++ < 20000) {
    t += 700 + Math.random() * 1500; const antes = p.fase; Pa.tick(p, t); if (antes === 'jugando' && p.fase !== 'jugando') explosiones++;
    if (p.fase !== 'jugando') continue;
    const id = Pa.turnoLocal(p); const j = p.jugadores.find((x) => x.id === id);
    const validas = [];
    j.mano.forEach((a) => { if (Pa.cumple(p.condicion, [a])) validas.push([a]); j.mano.forEach((b) => { if (a.uid < b.uid && Pa.cumple(p.condicion, [a, b])) validas.push([a, b]); }); });
    if (validas.length && Math.random() < 0.85) {
      const jug = azar(validas);
      const otros = p.jugadores.filter((x) => x.id !== id && !x.eliminado && !x.fuera);
      const r = Pa.accion(p, id, { tipo: 'jugar', cartas: jug.map((c) => c.uid), destino: azar(otros).id, color: azar(Pa.COLORES) }, t);
      assert.ok(r.ok, r.error);
    } else Pa.accion(p, id, { tipo: 'robar' }, t);
    assert.ok(Pa.accion(p, id === 1 ? 2 : 1, { tipo: 'robar' }, t).ok === false || p.portador === (id === 1 ? 2 : 1));
  }
  cerrada(p);
  assert.equal(p.fin.ganadores.length, 1);
}
console.log(`Patata OK · ${explosiones} explosiones`);

// ---------------- Pirámides (los jugadores verifican; categorías de un banco)
let eliminados = 0;
for (let k = 0; k < 300; k++) {
  const n = 2 + (k % 7); const p = Pi.crearPartida(jugadores(n), [], { vueltas: azar([5, 8, 12]) });
  assert.equal(new Set(p.jugadores.map((j) => j.categoria)).size, n, 'categorías distintas');
  Pi.accion(p, null, { tipo: 'visto' });
  let pasos = 0;
  while (p.fase !== 'fin' && pasos++ < 5000) {
    const v = Pi.vistaDe(p, -1);
    const act = v.jugadores.find((j) => j.id === v.turno);
    assert.ok(act && !act.eliminado, 'el turno es de alguien vivo');
    if (v.paso === 'adivinar') {
      const rivales = v.jugadores.filter((j) => j.id !== act.id && !j.eliminado && !j.fuera && !act.intentos[j.id]);
      if (rivales.length && Math.random() < 0.5) {
        const o = azar(rivales); const real = p.jugadores.find((j) => j.id === o.id).categoria;
        const cat = Math.random() < 0.35 ? real : 'c' + (1 + Math.floor(Math.random() * 200));
        const r = Pi.accion(p, null, { tipo: 'adivinar', objetivo: o.id, categoria: cat });
        assert.ok(r.ok, r.error);
        if (r.acierta) eliminados++;
        assert.equal(Pi.accion(p, null, { tipo: 'adivinar', objetivo: o.id, categoria: cat }).ok, false, 'solo un intento por turno y rival');
      } else assert.ok(Pi.accion(p, null, { tipo: 'noAdivinar' }).ok);
    } else {
      const pend = v.jugadores.filter((j) => j.id !== act.id && !j.eliminado && !j.fuera && !v.dichos.includes(j.id));
      const r = Pi.accion(p, null, { tipo: 'apuntar', por: pend[0].id, futbolista: `F${pasos}`, encaja: Math.random() < 0.5 });
      assert.ok(r.ok, r.error);
    }
    if (k % 40 === 0 && pasos === 5) Pi.abandonar(p, 2);
    // Nadie ve categorías ajenas sin descubrir
    const vy = Pi.vistaDe(p, 1);
    vy.jugadores.forEach((j) => assert.ok(j.categoria === null || j.eliminado || p.fase === 'fin'));
  }
  cerrada(p);
  const N = n; const vivos = p.jugadores.filter((j) => !j.eliminado && !j.fuera);
  vivos.forEach((j) => assert.equal(p.fin.tabla.find((t) => t.id === j.id).supervivencia, 2 * N));
}
console.log(`Pirámides OK · ${eliminados} eliminaciones`);

// ---------------- Última Transmisión (con reloj simulado)
let exitos = 0; let reparadas = 0;
for (let k = 0; k < 60; k++) {
  const n = 2 + (k % 5); let t = 0; const p = Tr.crearPartida(jugadores(n), [], { duracion: azar([120, 180, 240]) }, t);
  assert.ok(p.secciones.length >= 4);
  while (p.fase !== 'fin') {
    t += 1000; Tr.tick(p, t);
    // Tripulación «perfecta» la mitad de las veces: lee el manual y lo ejecuta
    for (const a of [...p.averias]) {
      if (k % 2 && t - a.creada > 6000) {
        const s = p.secciones.find((x) => x.id === a.seccion);
        for (const [cl, val] of Object.entries(a.req)) {
          if (cl === 'dial') Tr.accion(p, s.dueno, { tipo: 'dial', seccion: s.id, valor: val }, t);
          else if (cl === 'color') Tr.accion(p, s.dueno, { tipo: 'color', seccion: s.id, color: val }, t);
          else if (s.panel.palancas[cl.slice(1)] !== val) Tr.accion(p, s.dueno, { tipo: 'palanca', seccion: s.id, cual: cl.slice(1) }, t);
        }
      }
    }
    const v = Tr.vistaDe(p, 1, t);
    v.averias.forEach((a) => assert.ok(a.manual === null || p.averias.find((x) => x.id === a.id).lector === 1));
    assert.ok(Tr.accion(p, 99, { tipo: 'dial', seccion: p.secciones[0].id, valor: 3 }, t).ok === false);
  }
  cerrada(p);
  if (p.fin.exito) exitos++;
  if (k % 2) { assert.ok(p.fin.exito, 'una tripulación perfecta debe ganar'); reparadas += p.fin.reparadas; } else assert.ok(!p.fin.exito, 'sin hacer nada se pierde');
}
console.log(`Transmisión OK · ${exitos}/60 misiones superadas · ${reparadas} reparaciones de las tripulaciones perfectas`);
console.log('fiesta-sim OK');
