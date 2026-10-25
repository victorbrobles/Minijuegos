import * as S from '../lobos/sala.js';
import assert from 'node:assert/strict';
const ok = (m) => console.log('  ✓', m);

function nueva(roles) {
  const { code, token } = S.crearSala('Admin');
  const sala = S.obtener(code);
  const toks = [token];
  for (let i = 1; i < roles.length; i++) toks.push(S.unirse(code, 'J' + i).token);
  S.accion(sala, 0, { tipo: 'config', config: { seleccion: { modo: 'personalizada', custom: roles.reduce((c, r) => ({ ...c, [r]: (c[r] || 0) + 1 }), {}) }, minutos: 0 } });
  S.accion(sala, 0, { tipo: 'empezar' });
  sala.jugadores.forEach((_, i) => S.accion(sala, i, { tipo: 'listo' }));
  return sala;
}
const idRol = (sala, r) => sala.e.jugadores.find((j) => j.rol === r).id;
const base = ['lobo', 'lobo_alfa', 'vidente', 'bruja', 'aldeano', 'aldeano', 'aldeano'];

// 1) Compañeros: objetos {id,nombre,vivo} visibles solo para los lobos
{
  const sala = nueva(base);
  const lobo = idRol(sala, 'lobo'), alfa = idRol(sala, 'lobo_alfa'), ald = idRol(sala, 'aldeano');
  const c = S.vista(sala, lobo).mi.companeros;
  assert.deepEqual(c.map((x) => x.id), [alfa]); ok('el lobo ve al Alfa como compañero');
  assert.equal(S.vista(sala, ald).mi.companeros.length, 0); ok('un aldeano no ve compañeros');
}
// 2) Alfa: convierte a la víctima elegida aunque el otro lobo vote a otro
{
  const sala = nueva(base);
  const lobo = idRol(sala, 'lobo'), alfa = idRol(sala, 'lobo_alfa'), vid = idRol(sala, 'vidente'), bruja = idRol(sala, 'bruja');
  const alds = sala.e.jugadores.filter((j) => j.rol === 'aldeano').map((j) => j.id);
  S.accion(sala, lobo, { tipo: 'noche', acc: { objetivo: alds[0] } });
  S.accion(sala, alfa, { tipo: 'noche', acc: { objetivo: alds[1], infectar: true } });
  assert.equal(S.vista(sala, bruja).noche.turno.victima, alds[1]); ok('la víctima final es la que elige el Alfa');
  S.accion(sala, bruja, { tipo: 'noche', acc: { salvar: false } });
  S.accion(sala, vid, { tipo: 'noche', acc: { objetivo: lobo } });
  alds.forEach((a) => S.accion(sala, a, { tipo: 'noche', acc: null }));
  assert.equal(sala.e.jugadores[alds[1]].rol, 'lobo'); assert.equal(sala.e.jugadores[alds[1]].vivo, true);
  ok('la víctima se convierte en lobo y no muere');
  assert.equal(S.vista(sala, alds[1]).mi.companeros.length, 2); ok('el convertido conoce a sus 2 compañeros');
  assert.equal(S.vista(sala, lobo).mi.companeros.length, 2); ok('la manada conoce al nuevo lobo');
  S.accion(sala, alds[1], { tipo: 'ackAvisos' }); assert.equal(sala.e.jugadores[alds[1]].avisos.length, 0); ok('ackAvisos funciona (antes lanzaba error)');
}
// 3) Bruja: sin pociones ya no recibe la víctima
{
  const sala = nueva(base);
  const lobo = idRol(sala, 'lobo'), alfa = idRol(sala, 'lobo_alfa'), bruja = idRol(sala, 'bruja'), ald = idRol(sala, 'aldeano');
  S.accion(sala, lobo, { tipo: 'noche', acc: { objetivo: ald } });
  S.accion(sala, alfa, { tipo: 'noche', acc: { objetivo: ald } });
  assert.equal(S.vista(sala, bruja).noche.turno.victima, ald); ok('con pociones, la bruja ve la víctima');
  sala.e.jugadores[bruja].estado.pocionVida = false; sala.e.jugadores[bruja].estado.pocionVeneno = false;
  assert.equal(S.vista(sala, bruja).noche.turno.victima, undefined); ok('sin pociones, el servidor no le envía la víctima');
}
// 4) Votación (7 jugadores; el señalado también vota, en blanco)
for (const [contra, linchado] of [[3, false], [4, true]]) {
  const sala = nueva(['lobo', 'lobo_alfa', 'vidente', 'aldeano', 'aldeano', 'aldeano', 'aldeano']);
  sala.fase = 'votacion'; sala.faseId += 1; sala.listos = new Set(); sala.vot = { segunda: false, primera: null, votos: {}, robado: null, avisoRepite: false };
  const objetivo = 6; const otros = [0, 1, 2, 3, 4, 5];
  otros.forEach((v, i) => S.accion(sala, v, { tipo: 'votar', voto: i < contra ? objetivo : null }));
  S.accion(sala, objetivo, { tipo: 'votar', voto: null });
  const r = sala.res;
  assert.equal(r.abstenciones, 7 - contra, JSON.stringify(r));
  assert.equal(r.victima != null, linchado, JSON.stringify(r));
  assert.equal(r.anuladaAbstencion, !linchado);
  ok(`${contra} votos contra ${r.abstenciones} abstenciones → ${linchado ? 'linchado' : 'nadie linchado (anulada por abstención)'}`);
}
// 5) Empate de abstenciones y votos: sí se linchea (solo anula si hay MÁS abstenciones)
{
  const sala = nueva(['lobo', 'lobo_alfa', 'vidente', 'aldeano', 'aldeano', 'aldeano', 'aldeano', 'aldeano']);
  sala.fase = 'votacion'; sala.faseId += 1; sala.listos = new Set(); sala.vot = { segunda: false, primera: null, votos: {}, robado: null, avisoRepite: false };
  [0, 1, 2, 3, 4, 5, 6].forEach((v, i) => S.accion(sala, v, { tipo: 'votar', voto: i < 4 ? 7 : null }));
  S.accion(sala, 7, { tipo: 'votar', voto: null });
  assert.equal(sala.res.abstenciones, 4); assert.equal(sala.res.victima, 7); ok('4 votos y 4 abstenciones (empate) → se linchea');
}
process.exit(0);
