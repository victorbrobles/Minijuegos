// Simulación del motor de «Logomanía» (las 7 fases): online y local, con respuestas al azar, ausencias y tiempos.
import assert from 'node:assert/strict';
import * as E from '../lib/logosEngine.js';
import { LOGOMANIACO } from '../data/seeds/logos/logomaniaco.js';
import { PINTOR } from '../data/seeds/logos/pintor.js';
import { RETRATO } from '../data/seeds/logos/retrato.js';
import { PASAPORTE, PAISES } from '../data/seeds/logos/pasaporte.js';
import { MENTIROSO } from '../data/seeds/logos/mentiroso.js';
import { ESLOGAN } from '../data/seeds/logos/eslogan.js';
import { EXPERTO } from '../data/seeds/logos/experto.js';

// ---------------------------------------------------------------- bancos
const tam = { LOGOMANIACO, PINTOR, RETRATO, PASAPORTE, MENTIROSO, ESLOGAN };
Object.entries(tam).forEach(([k, b]) => assert.ok(b.length >= 200, `${k} tiene ${b.length} registros`));
assert.ok(EXPERTO.length * 4 >= 280, 'Experto: preguntas suficientes');
LOGOMANIACO.forEach(([r, d, e]) => { assert.ok(r && [1, 2, 3].includes(d), r); assert.ok(e.split(',').length > E.OBJETIVO_LOGOMANIACO[d], `pocos ejemplos: ${r}`); });
RETRATO.forEach(([m, d]) => assert.ok(m && d.length > 10, m));
ESLOGAN.forEach(([e, m]) => { assert.ok(e && m, e); E.nombresDe(m).forEach((n) => assert.ok(!E.compacto(e).includes(E.compacto(n)) || E.compacto(n).length < 4, `El eslogan dice la marca: ${e}`)); });
PASAPORTE.forEach(([m, p, t]) => { assert.ok(m && p, m); assert.notEqual(p, t, m); });
MENTIROSO.forEach(([a, v, x]) => { assert.equal(typeof v, 'boolean', a); assert.ok(x, a); });
EXPERTO.forEach((par) => par.forEach(([m, f, d]) => [f, d].forEach((q) => { assert.equal(q.length, 5, m); assert.equal(new Set(q.slice(1)).size, 4, q[0]); })));
assert.ok(PAISES.length >= 4);

// ---------------------------------------------------------------- comparación de marcas
assert.ok(E.esMarca('mcdonalds', 'McDonald\'s|McDonalds'));
assert.ok(E.esMarca('Mc Donald\'s', 'McDonald\'s'));
assert.ok(E.esMarca('coca cola', 'Coca-Cola'));
assert.ok(E.esMarca('lamborgini', 'Lamborghini'));
assert.ok(E.esMarca('CITROEN', 'Citroën|Citroen'));
assert.ok(E.esMarca('h&m', 'H&M|HM'));
assert.ok(!E.esMarca('Pepsi', 'Coca-Cola'));
assert.ok(!E.esMarca('Kia', 'Kfc'));
assert.ok(!E.esMarca('a', 'Audi'));
assert.ok(!E.esMarca('Seat', 'Skoda'));

// ---------------------------------------------------------------- partidas
const azar = (n) => Math.floor(Math.random() * n);
const J = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` }));

function jugarPartida({ n, local, fases }) {
  let t = 1_000_000;
  const p = E.crearPartida(J(n), { fases, duracion: 'corto' }, { local });
  if (local) assert.ok(!p.config.fases.includes('pintor'), 'el pintor no se juega en local');
  let pasos = 0;
  const hacer = (a) => E.aplicar(p, a, t);
  while (p.estado !== 'fin') {
    if (++pasos > 5000) throw new Error(`Partida atascada en ${p.fase}/${p.ronda?.etapa}`);
    t += 300;
    if (p.estado === 'intro' || p.estado === 'resultado') { assert.ok(hacer({ tipo: 'continuar' }).ok); continue; }
    const r = p.ronda;
    const v = E.vista(p, 1, {}, t);
    // Nada secreto en la vista
    if (r.tipo === 'retrato' || r.tipo === 'eslogan') assert.equal(v.ronda.marca, undefined, 'la vista no da la respuesta');
    if (r.tipo === 'mentiroso') assert.equal(v.ronda.verdad, undefined);
    if (r.tipo === 'experto') assert.equal(v.ronda.correcta, undefined);
    if (r.tipo === 'pintor' && r.pintorId !== 1) assert.equal(v.ronda.actual, undefined, 'solo el pintor ve la marca');
    if (r.tipo === 'logomaniaco') assert.equal(v.ronda.ejemplos, undefined);

    // De vez en cuando, que corra el reloj
    if (r.cierraEn && Math.random() < 0.08) { t = r.cierraEn + 1; E.tick(p, t); continue; }
    const vivos = p.jugadores.filter((j) => !j.ausente);
    const alguien = vivos[azar(vivos.length)].id;
    switch (r.tipo) {
      case 'logomaniaco':
        if (r.etapa === 'preparado') assert.ok(hacer({ tipo: 'empezar', jugadorId: local ? null : r.activoId }).ok);
        else {
          if (!local) assert.equal(hacer({ tipo: 'veredicto', conseguido: true, jugadorId: r.activoId }).ok, false, 'no te validas a ti mismo');
          const juez = local ? null : vivos.find((j) => j.id !== r.activoId).id;
          assert.ok(hacer({ tipo: 'veredicto', conseguido: Math.random() < 0.5, jugadorId: juez }).ok);
        }
        break;
      case 'pintor':
        if (r.etapa === 'preparado') assert.ok(hacer({ tipo: 'empezar', jugadorId: r.pintorId }).ok);
        else {
          const x = Math.random();
          if (x < 0.2) assert.ok(hacer({ tipo: 'trazos', trazos: [{ c: 0, g: 1, p: [1, 2, 300, 400, 500, 600] }], jugadorId: r.pintorId }).ok);
          else if (x < 0.3) assert.ok(hacer({ tipo: 'pasar', jugadorId: r.pintorId }).ok);
          else {
            const otro = vivos.find((j) => j.id !== r.pintorId).id;
            const antes = p.jugadores.find((j) => j.id === otro).puntos;
            const acierta = Math.random() < 0.5;
            const res = hacer({ tipo: 'adivinar', texto: acierta ? E.nombreMarca(r.actual) : 'zzzz', jugadorId: otro });
            assert.ok(res.ok);
            assert.equal(res.acierto, acierta);
            assert.equal(p.jugadores.find((j) => j.id === otro).puntos, antes + (acierta ? 1 : 0));
          }
        }
        break;
      case 'retrato': case 'eslogan': case 'pasaporte': {
        const pend = vivos.filter((j) => r.respuestas[j.id] === undefined);
        const j = pend[azar(pend.length)];
        const bien = Math.random() < 0.5;
        const a = r.tipo === 'pasaporte'
          ? { tipo: 'responder', opcion: bien ? r.correcta : azar(4), jugadorId: j.id }
          : { tipo: 'responder', texto: bien ? E.nombreMarca(r.marca) : 'nada', jugadorId: j.id };
        assert.ok(hacer(a).ok);
        assert.equal(hacer(a).ok, false, 'no se responde dos veces');
        break;
      }
      case 'mentiroso':
        if (r.etapa === 'responder') assert.ok(hacer({ tipo: 'responder', verdad: Math.random() < 0.5, jugadorId: r.activoId }).ok);
        else {
          const pend = vivos.filter((j) => j.id !== r.activoId && r.votos[j.id] === undefined);
          assert.ok(hacer({ tipo: 'votar', voto: Math.random() < 0.5 ? 'confio' : 'desconfio', jugadorId: pend[0].id }).ok);
        }
        break;
      case 'experto':
        if (r.etapa === 'elegir') assert.ok(hacer({ tipo: 'elegir', lado: azar(2), jugadorId: r.activoId }).ok);
        else assert.ok(hacer({ tipo: 'responder', opcion: azar(4), jugadorId: r.activoId }).ok);
        break;
      default:
        throw new Error(`fase desconocida ${r.tipo}`);
    }
    // Alguien se va a mitad de partida (online)
    if (!local && n > 3 && Math.random() < 0.002) E.marcarAusente(p, alguien);
  }
  return p;
}

// Puntos exactos de El mentiroso
{
  const p = E.crearPartida(J(3), { fases: ['mentiroso'] });
  E.aplicar(p, { tipo: 'continuar' });
  const r = p.ronda;
  E.aplicar(p, { tipo: 'responder', verdad: !r.verdad, jugadorId: r.activoId }); // falla
  const [a, b] = p.jugadores.filter((j) => j.id !== r.activoId);
  E.aplicar(p, { tipo: 'votar', voto: 'confio', jugadorId: a.id });
  E.aplicar(p, { tipo: 'votar', voto: 'desconfio', jugadorId: b.id });
  assert.equal(p.estado, 'resultado');
  assert.equal(a.puntos, -1, 'confía y falla: −1');
  assert.equal(b.puntos, 1, 'desconfía y acierta: +1');
  assert.equal(p.jugadores.find((j) => j.id === r.activoId).puntos, 0);
}
// El logomaníaco: rebote solo para el siguiente
{
  const p = E.crearPartida(J(3), { fases: ['logomaniaco'] });
  E.aplicar(p, { tipo: 'continuar' });
  const r = p.ronda;
  const primero = r.activoId;
  E.aplicar(p, { tipo: 'empezar', jugadorId: primero });
  E.aplicar(p, { tipo: 'veredicto', conseguido: false, jugadorId: r.reboteId });
  assert.equal(r.rebote, true);
  assert.notEqual(r.activoId, primero);
  E.aplicar(p, { tipo: 'empezar', jugadorId: r.activoId });
  const juez = p.jugadores.find((j) => j.id !== r.activoId).id;
  E.aplicar(p, { tipo: 'veredicto', conseguido: false, jugadorId: juez });
  assert.equal(p.estado, 'resultado', 'tras el rebote, se acaba la ronda');
}
// El experto: 3 puntos la difícil
{
  const p = E.crearPartida(J(2), { fases: ['experto'] });
  E.aplicar(p, { tipo: 'continuar' });
  const r = p.ronda;
  E.aplicar(p, { tipo: 'elegir', lado: r.dificilLado, jugadorId: r.activoId });
  E.aplicar(p, { tipo: 'responder', opcion: r.correcta, jugadorId: r.activoId });
  assert.equal(p.jugadores.find((j) => j.id === r.activoId).puntos, 3);
}

let partidas = 0;
for (let i = 0; i < 300; i++) {
  const n = 2 + azar(6);
  const local = Math.random() < 0.4;
  const fases = E.FASES.filter(() => Math.random() < 0.6);
  jugarPartida({ n, local, fases });
  partidas++;
}
console.log(`✅ Logomanía: ${partidas} partidas simuladas sin atascos`);
