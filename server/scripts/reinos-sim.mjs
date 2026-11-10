// Simulación de «Los Siete Reinos»: partidas enteras con órdenes al azar (válidas) y comprobaciones.
import assert from 'node:assert/strict';
import * as E from '../reinos/engine.js';

const azar = (n) => Math.floor(Math.random() * n);
function ordenesAlAzar(p, r) {
  const mios = p.mapa.filter((x) => x.dueno === r.id);
  const acc = [];
  const usados = {};
  for (let k = 0; k < 2; k++) {
    const t = ['conquistar', 'conquistar', 'entrenar', 'fortificar', 'comerciar', 'negociar'][azar(6)];
    const x = mios[azar(mios.length)];
    if (t === 'conquistar' && x && x.soldados - (usados[x.id] || 0) > 0) {
      const n = 1 + azar(x.soldados - (usados[x.id] || 0));
      usados[x.id] = (usados[x.id] || 0) + n;
      acc.push({ tipo: t, desde: x.id, hacia: x.vecinos[azar(x.vecinos.length)], soldados: n });
    } else if (t === 'entrenar' && x) acc.push({ tipo: t, en: x.id, soldados: 1 + azar(3) });
    else if (t === 'fortificar' && x) acc.push({ tipo: t, en: x.id });
    else if (t === 'comerciar') acc.push({ tipo: t, da: azar(2) ? 'oro' : 'alimento', lotes: 1 });
    else if (t === 'negociar') {
      const otros = p.reinos.filter((o) => o.id !== r.id && !o.fuera && !o.eliminado);
      if (otros.length) acc.push({ tipo: t, a: otros[azar(otros.length)].id, clase: ['alianza', 'intercambio'][azar(2)], doy: { oro: azar(2) }, pido: { alimento: 1 + azar(2) } });
    }
  }
  return acc;
}

let traiciones = 0; let porTronos = 0; let batallas = 0;
for (let g = 0; g < 150; g++) {
  const n = 2 + (g % 6);
  const J = Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` }));
  const p = E.crearPartida(J, { rondas: [6, 8, 10, 12][g % 4] });
  assert.equal(p.mapa.length, 37);
  assert.equal(p.mapa.filter((x) => x.tipo === 'trono').length, 7);
  assert.equal(p.mapa.filter((x) => x.tipo === 'capital').length, n);
  let vueltas = 0;
  while (p.fase !== 'fin' && vueltas < 200) {
    vueltas += 1;
    if (p.fase === 'ordenes') {
      for (const r of p.reinos.filter((x) => !x.listo)) {
        let res = E.ordenar(p, r.id, ordenesAlAzar(p, r));
        if (!res.ok) res = E.ordenar(p, r.id, []);
        assert.ok(res.ok, res.error);
        if (g % 7 === 0 && r.id === 1 && p.fase === 'ordenes' && p.ronda === 2) { E.retirar(p, r.id); E.ordenar(p, r.id, []); }
      }
    }
    if (p.fase === 'diplomacia') p.propuestas.filter((x) => x.estado === 'pendiente').forEach((x) => E.responder(p, x.a, x.id, Math.random() < 0.6));
    if (p.fase === 'cronica') {
      batallas += p.cronica.filter((e) => /cae|resiste|choque/.test(e.texto)).length;
      p.reinos.forEach((r) => E.seguir(p, r.id));
    }
    if (g % 11 === 0 && p.ronda === 3 && p.fase === 'ordenes') E.abandonar(p, n);
    // invariantes
    p.mapa.forEach((x) => { assert.ok(x.soldados >= 0 && x.muralla >= 0 && x.muralla <= 3); });
    p.reinos.forEach((r) => { assert.ok(r.oro >= 0 && r.alimento >= 0, `recursos negativos ${r.oro}/${r.alimento}`); });
  }
  assert.equal(p.fase, 'fin', 'termina');
  traiciones += p.reinos.reduce((a, r) => a + r.historia.traiciones, 0);
  if (p.fin.porTronos != null) porTronos += 1;
  const v = E.vistaDe(p, 1);
  assert.ok(v.fin.tabla.length === n);
  // la vista de otro no lleva mi oro mientras se juega
}
const q = E.crearPartida([{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }], {});
assert.equal(E.vistaDe(q, 1).reinos.find((r) => r.id === 2).oro, undefined, 'el oro ajeno es secreto');
assert.equal(E.vistaDe(q, 1).yo.objetivos.length, 2);
// Batalla concreta: 5 atacan a 3 sin muralla → entran con 5 - 2 = 3
const b = E.crearPartida([{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }], {});
const cap = b.mapa[b.reinos[0].capital];
const vec = b.mapa[cap.vecinos.find((v) => b.mapa[v].tipo !== 'trono' && b.mapa[v].dueno == null)];
vec.soldados = 3; vec.muralla = 0; cap.soldados = 6;
E.ordenar(b, 1, [{ tipo: 'conquistar', desde: cap.id, hacia: vec.id, soldados: 5 }]);
E.ordenar(b, 2, []);
assert.equal(vec.dueno, 1);
assert.equal(vec.soldados, 3);
console.log(`reinos-sim OK (150 partidas, ${batallas} batallas, ${traiciones} traiciones, ${porTronos} ganadas por tronos)`);
