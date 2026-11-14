// Prueba de «Cuatro cuatros»: reglas de subida, recuento con comodines, privacidad y partidas al azar hasta el final.
import assert from 'assert';
import * as E from '../../client/src/games/CuatroCuatros/engine.js';

const ok = (a, b) => assert.ok(E.subidaValida(a, b), `${JSON.stringify(a)} → ${JSON.stringify(b)} debería valer`);
const no = (a, b) => assert.ok(!E.subidaValida(a, b), `${JSON.stringify(a)} → ${JSON.stringify(b)} no debería valer`);
ok(null, { cantidad: 1, valor: 2 });
ok({ cantidad: 3, valor: 4 }, { cantidad: 3, valor: 5 }); ok({ cantidad: 3, valor: 4 }, { cantidad: 4, valor: 2 });
no({ cantidad: 3, valor: 4 }, { cantidad: 3, valor: 4 }); no({ cantidad: 3, valor: 4 }, { cantidad: 3, valor: 2 });
ok({ cantidad: 5, valor: 4 }, { cantidad: 3, valor: 1 }); no({ cantidad: 5, valor: 4 }, { cantidad: 2, valor: 1 });
ok({ cantidad: 3, valor: 1 }, { cantidad: 7, valor: 2 }); no({ cantidad: 3, valor: 1 }, { cantidad: 6, valor: 6 });
ok({ cantidad: 3, valor: 1 }, { cantidad: 4, valor: 1 }); no({ cantidad: 3, valor: 1 }, { cantidad: 3, valor: 1 });
assert.equal(E.minimoPara({ cantidad: 5, valor: 4 }, 1), 3); assert.equal(E.minimoPara({ cantidad: 3, valor: 1 }, 6), 7);

// Recuento con comodines y resultado de «¡Mentiroso!»
const jug = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `J${i + 1}` }));
{
  const p = E.crearPartida(jug(2), [], { dados: 5 }); p.turno = 0;
  p.jugadores[0].dados = [4, 4, 1, 2, 3]; p.jugadores[1].dados = [4, 6, 6, 1, 5];
  assert.ok(E.accion(p, 1, { tipo: 'apostar', cantidad: 5, valor: 4 }).ok); // hay 4,4,1,4,1 = 5
  assert.ok(E.accion(p, 2, { tipo: 'dudar' }).ok);
  assert.equal(p.revelado.hay, 5); assert.equal(p.revelado.pierde, 2); assert.equal(p.jugadores[1].dados.length, 4);
  E.accion(p, 1, { tipo: 'seguir' }); E.accion(p, 2, { tipo: 'seguir' });
  assert.equal(p.fase, 'apostar'); assert.equal(p.jugadores[p.turno].id, 2, 'empieza quien perdió el dado');
}
{
  const p = E.crearPartida(jug(2), [], { dados: 5 }); p.turno = 0;
  p.jugadores[0].dados = [2, 3, 3, 1, 5]; p.jugadores[1].dados = [3, 6, 6, 2, 5]; p.jugadores[1].dados.pop();
  E.accion(p, 1, { tipo: 'apostar', cantidad: 4, valor: 3 }); // hay 3,3,1,3 = 4
  assert.ok(E.accion(p, 2, { tipo: 'exacto' }).ok);
  assert.equal(p.revelado.gana, 2); assert.equal(p.jugadores[1].dados.length, 5, '¡Exacto! acertado recupera un dado');
}

// Partidas al azar
let partidas = 0; let cantos = 0;
for (let k = 0; k < 400; k++) {
  const n = 2 + (k % 7); const p = E.crearPartida(jug(n), [], { dados: [3, 5, 6][k % 3] });
  let pasos = 0;
  while (p.fase !== 'fin' && pasos++ < 20000) {
    if (p.fase === 'revelar') { E.accion(p, null, { tipo: 'seguir' }); continue; }
    const id = E.turnoLocal(p);
    const v = E.vistaDe(p, id);
    // Privacidad: la vista de un jugador no incluye dados ajenos
    assert.ok(!JSON.stringify(v.jugadores).includes('"dados":['));
    if (v.apuesta && (Math.random() < 0.35 || v.apuesta.cantidad >= v.total)) {
      assert.ok(E.accion(p, id, { tipo: Math.random() < 0.15 ? 'exacto' : 'dudar' }).ok); cantos++;
    } else {
      const valor = 1 + Math.floor(Math.random() * 6);
      const c = E.minimoPara(v.apuesta, valor);
      const r = E.accion(p, id, { tipo: 'apostar', cantidad: c, valor });
      if (!r.ok) { assert.ok(c > v.total, r.error); E.accion(p, id, { tipo: 'dudar' }); cantos++; }
    }
    if (k % 50 === 0 && pasos === 7) E.abandonar(p, 1);
  }
  assert.equal(p.fase, 'fin', 'la partida termina');
  assert.equal(p.fin.ganadores.length, 1);
  assert.equal(p.jugadores.filter((j) => !j.eliminado && !j.fuera).length, 1);
  partidas++;
}
console.log(`cuatrocuatros-sim OK · ${partidas} partidas · ${cantos} «mentirosos/exactos»`);
