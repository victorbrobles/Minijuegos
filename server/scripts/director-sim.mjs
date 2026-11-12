// Simulación de «Director Deportivo»: mercados con pujas al azar, ligas completas y comprobaciones.
import assert from 'node:assert/strict';
import * as E from '../director/engine.js';
import { FUTBOLISTAS } from '../data/seeds/director/futbolistas.js';

const az = (n) => Math.floor(Math.random() * n);
assert.ok(E.precio({ media: 91, edad: 26, potencial: 92 }) > E.precio({ media: 80, edad: 26, potencial: 80 }));
assert.ok(E.precio({ media: 85, edad: 20, potencial: 91 }) > E.precio({ media: 85, edad: 34, potencial: 85 }), 'los jóvenes valen más');
const campeones = {};
for (let g = 0; g < 80; g++) {
  const n = E.AJUSTES.min + (g % (E.AJUSTES.max - E.AJUSTES.min + 1));
  const J = Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` }));
  let t = 0;
  const p = E.crearPartida(J, FUTBOLISTAS, { presupuesto: [150, 200, 300][g % 3], mercados: [3, 4, 5][g % 3] }, t);
  assert.ok(p.clubes.length >= E.AJUSTES.minClubes || p.clubes.length === n);
  J.forEach((j) => assert.ok(E.elegirFormacion(p, j.id, Object.keys(E.FORMACIONES)[az(5)]).ok));
  assert.equal(p.fase, 'mercado');
  let vueltas = 0;
  while (p.fase !== 'fin' && vueltas++ < 500) {
    if (p.fase === 'mercado') {
      for (const j of J) {
        const c = p.clubes.find((x) => x.id === j.id);
        const pujas = {};
        let caja = c.presupuesto;
        for (const f of [...p.oferta].sort(() => Math.random() - 0.5).map((id) => p.base.find((x) => x.id === id)).slice(0, 4)) {
          const m = f.precio + az(10);
          if (m <= caja && c.plantilla.length + Object.keys(pujas).length < 16) { pujas[f.id] = m; caja -= m; }
        }
        const r = E.pujar(p, j.id, pujas);
        assert.ok(r.ok, r.error);
      }
    } else if (p.fase === 'resultadoMercado') J.forEach((j) => E.seguir(p, j.id));
    else if (p.fase === 'tactica') J.forEach((j) => E.elegirTactica(p, j.id, Object.keys(E.TACTICAS)[az(5)], t));
    else if (p.fase === 'liga') { t += 4000; E.tick(p, t); }
    p.clubes.forEach((c) => {
      assert.ok(c.presupuesto >= 0, 'presupuesto negativo');
      assert.ok(c.plantilla.length <= E.AJUSTES.maxPlantilla);
      assert.equal(new Set(c.plantilla.map((f) => f.id)).size, c.plantilla.length);
    });
  }
  assert.equal(p.fase, 'fin');
  const todos = p.clubes.flatMap((c) => c.plantilla.map((f) => f.id));
  assert.equal(new Set(todos).size, todos.length, 'nadie ficha dos veces');
  const tabla = p.fin.tabla;
  assert.equal(tabla.length, p.clubes.length);
  const pj = (p.clubes.length - 1) * 2;
  assert.ok(tabla.every((r) => r.pj === pj), 'doble vuelta completa');
  const c = p.clubes.find((x) => x.id === p.fin.campeon);
  campeones[c.bot ? 'bot' : 'humano'] = (campeones[c.bot ? 'bot' : 'humano'] || 0) + 1;
}
// La vista no enseña las pujas ajenas
const q = E.crearPartida([{ id: 1, nombre: 'A' }, { id: 2, nombre: 'B' }], FUTBOLISTAS, {});
E.elegirFormacion(q, 1, '4-3-3'); E.elegirFormacion(q, 2, '4-4-2');
E.pujar(q, 1, { [q.oferta[0]]: q.base.find((f) => f.id === q.oferta[0]).precio });
assert.ok(E.vistaDe(q, 2).clubes.every((c) => !('pujas' in c)));
// Un buen equipo suele ganar a uno flojo
const fuerte = { formacion: '4-3-3', tactica: 'equilibrada', plantilla: FUTBOLISTAS.filter((f) => f.media >= 87).slice(0, 14) };
const flojo = { formacion: '4-3-3', tactica: 'equilibrada', plantilla: FUTBOLISTAS.filter((f) => f.media <= 80).slice(0, 14) };
assert.ok(E.fuerzaDe(fuerte).ata > E.fuerzaDe(flojo).ata);
console.log('director-sim OK (80 partidas; campeones:', JSON.stringify(campeones), ')');
