// Simulación de «Mus Avanzado»: pactos, cambios, anuncios, faroles y desafíos al azar.
import assert from 'assert';
import * as E from '../musavanzado/engine.js';

const c = (s) => s.split(' ').map((t, i) => ({ id: 100 + i, r: Number(t.slice(0, -1)), p: { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' }[t.slice(-1)], esp: null }));
assert.equal(E.evaluar(c('3o 3c 3e 7b 7o'), 'parejas', {}), 4);
assert.equal(E.evaluar(c('1o 1c 1e 7b 7o'), 'pequena', {}), 5);
assert.equal(E.evaluar(c('1o 1c 1e 7b 7o'), 'pequena', { invertidas: true }), 0, 'con invertidas los ases valen 10');
assert.equal(E.evaluar(c('2o 5o 9o 4o 1o'), 'colores', {}), 4);
assert.equal(E.evaluar(c('10o 10c 2e 3b 4o'), 'suma', { objetivo: 29 }), 5);
assert.equal(E.evaluar([...c('5o 5c 2e 9b'), { id: 1, esp: 'bomba' }], 'parejas', {}), 1);
assert.equal(E.evaluar([...c('5o 2e 9b 1c'), { id: 1, r: 5, p: 'copas', esp: 'doble' }], 'parejas', {}), 3, 'doble cuenta dos veces');
assert.equal(E.evaluar([...c('5o 2e 9b 1c'), { id: 1, esp: 'espejo' }], 'parejas', {}), 1, 'espejo copia una carta');
assert.throws(() => E.crearPartida([1, 2, 3, 4, 5].map((id) => ({ id, nombre: `J${id}` })), { modo: 'parejas' }), /4 o 6/);

// Pacto: cualquier cambio borra las aceptaciones
let p = E.crearPartida([1, 2, 3, 4].map((id) => ({ id, nombre: `J${id}` })), { modo: 'parejas', fichas: 20 }, 0);
E.aceptar(p, 1, 0); E.aceptar(p, 2, 0);
E.proponer(p, 3, { modificador: 'comodines' });
assert.deepEqual(p.pacto.aceptan, []);
assert.equal(E.proponer(p, 3, { categoria: 'grande' }).ok, true);
[1, 2, 3, 4].forEach((id) => E.aceptar(p, id, 0));
assert.equal(p.fase, 'cambio');
assert.equal(p.rondas, 5);
assert.equal(p.bandos[0].miembros.join(), '1,3');

// Caso a mano: un farol pillado
p = E.crearPartida([1, 2, 3, 4].map((id) => ({ id, nombre: `J${id}` })), { fichas: 20 }, 0);
p.pacto.categorias = ['parejas', 'grande', 'escalera'];
[1, 2, 3, 4].forEach((id) => E.aceptar(p, id, 0));
p.orden[0] = 'parejas'; p.ctx.cat = 'parejas';
p.manos[1] = c('1o 2c 4e 6b 9o'); // sin nada
[1, 2, 3, 4].forEach((id) => E.cambiar(p, id, [], 0));
assert.equal(p.fase, 'apuestas');
assert.equal(p.bote, 4);
assert.equal(E.quienHabla(p), 1);
assert(E.anunciar(p, 1, 3, 2, 0).ok); // «tengo trío», apuesta 2
assert.equal(E.anunciar(p, 2, 2, 1, 0).ok, false, 'no se puede anunciar menos');
E.pasar(p, 2, 0);
assert(E.desafiar(p, 3).ok);
assert.equal(p.fase, 'revelacion');
assert.equal(p.revelacion.verdad, false);
assert.equal(p.bandos[2].fichas, 20 - 1 - 2 + 8, 'quien pilla el farol se lleva el bote');

let partidas = 0; let desafios = 0; let faroles = 0; let sinDesafio = 0;
for (let n = 0; n < 300; n++) {
  const modo = n % 3 === 0 ? 'parejas' : 'individual';
  const nj = modo === 'parejas' ? (n % 2 ? 4 : 6) : 4 + (n % 5);
  p = E.crearPartida(Array.from({ length: nj }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` })), { modo, fichas: 20 }, 0);
  const total0 = p.bandos.reduce((s, b) => s + b.fichas, 0);
  let t = 0; let pasos = 0; let perdidas = 0;
  // Pacto al azar
  for (let k = 0; k < 4; k++) {
    const r = Math.random();
    if (r < 0.4) E.proponer(p, 1, { modificador: Object.keys(E.MODIFICADORES)[Math.floor(Math.random() * 6)] });
    else if (r < 0.6) E.proponer(p, 2, { regla: Object.keys(E.REGLAS_ESPECIALES)[Math.floor(Math.random() * 3)] });
    else E.proponer(p, 3, { categoria: Object.keys(E.CATEGORIAS)[Math.floor(Math.random() * 8)] });
  }
  p.jugadores.forEach((j) => E.aceptar(p, j.id, t));
  while (p.fase !== 'fin') {
    assert(pasos++ < 3000, 'bucle');
    t += 1000;
    if (p.fase === 'cambio') {
      p.jugadores.forEach((j) => { if (Math.random() < 0.9) E.cambiar(p, j.id, p.manos[j.id].slice(0, Math.floor(Math.random() * 3)).map((x) => x.id), t); });
      if (p.fase === 'cambio') E.tick(p, (t += 100000));
      p.jugadores.forEach((j) => assert.equal(p.manos[j.id].length, 5));
    } else if (p.fase === 'apuestas') {
      const id = E.quienHabla(p);
      const v = E.vistaDe(p, id);
      assert.equal(v.manos, null, 'manos ajenas ocultas');
      const r = Math.random();
      const niveles = E.CATEGORIAS[p.ctx.cat].niveles.length;
      if (p.apuesta && r < 0.3) { desafios++; const res = E.desafiar(p, id); if (res.ok && !res.verdad) faroles++; if (!res.ok) E.pasar(p, id, t); }
      else if (r < 0.65 && (!p.apuesta || p.apuesta.nivel < niveles)) {
        const nv = Math.min(niveles, (p.apuesta?.nivel || 0) + 1 + Math.floor(Math.random() * 2));
        if (!E.anunciar(p, id, nv, 1 + Math.floor(Math.random() * 3), t).ok) E.pasar(p, id, t);
      } else if (r < 0.95) E.pasar(p, id, t);
      else E.tick(p, (t += 100000));
    } else if (p.fase === 'revelacion') {
      if (p.revelacion.tipo === 'sinDesafio') sinDesafio++;
      perdidas += p.revelacion.bombas.reduce((s, b) => s + b.fichas, 0);
      p.bandos.forEach((b) => assert(b.fichas >= 0));
      E.siguiente(p, t);
    }
  }
  const total = p.bandos.reduce((s, b) => s + b.fichas, 0) + p.bote + perdidas;
  assert(total <= total0 && total >= total0 - p.bandos.length, `fichas: ${total} vs ${total0}`);
  partidas++;
}
console.log(`Mus Avanzado: ${partidas} partidas, ${desafios} desafíos (${faroles} faroles pillados), ${sinDesafio} botes sin desafío. OK`);
