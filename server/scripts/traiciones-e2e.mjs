// Prueba de extremo a extremo de las salas online de Traiciones con bots por HTTP, con el reloj del juego acelerado.
//   node scripts/traiciones-e2e.mjs [jugadores]
process.env.TRAICIONES_ESCALA = process.env.TRAICIONES_ESCALA || '25';
const { default: express } = await import('express');
const { default: router } = await import('../routes/traiciones.js');
const E = await import('../traiciones/engine.js');

const N = Number(process.argv[2] || 6);
const app = express(); app.use(express.json()); app.use('/api/traiciones', router);
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}/api/traiciones`;
const post = async (url, body) => { const r = await fetch(base + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return { status: r.status, data: await r.json() }; };
const get = async (url) => { const r = await fetch(base + url); return { status: r.status, data: await r.json() }; };
const assert = (c, m) => { if (!c) { console.error('FALLO:', m); process.exit(1); } };

const host = await post('/online/crear', { nombre: 'Host' });
const code = host.data.code;
const js = [{ nombre: 'Host', token: host.data.token }];
for (let i = 2; i <= N; i++) { const r = await post('/online/unirse', { code, nombre: `P${i}` }); assert(r.status === 200, 'unirse'); js.push({ nombre: `P${i}`, token: r.data.token }); }
assert((await post(`/online/sala/${code}/iniciar`, { token: js[1].token })).status === 403, 'solo el anfitrión inicia');
assert((await post(`/online/sala/${code}/iniciar`, { token: host.data.token })).status === 200, 'iniciar');

const sig = (desde, hasta) => { const prev = { [desde]: null }; const q = [desde]; while (q.length) { const s = q.shift(); for (const n of E.SALA[s].vecinos) if (!(n in prev)) { prev[n] = s; q.push(n); } } let s = hasta; while (prev[s] !== desde) s = prev[s]; return s; };
const dist = (a, b) => { let d = 0, s = a; while (s !== b) { s = sig(s, b); d++; } return d; };
const act = async (j, body) => (await post(`/online/sala/${code}/accion`, { token: j.token, ...body }));
let pasos = 0, filtrado = false;
while (pasos++ < 4000) {
  const estados = await Promise.all(js.map(async (j) => (await get(`/online/sala/${code}?token=${j.token}`)).data));
  const v0 = estados[0].vista;
  // Privacidad: durante el juego nadie ve roles ajenos ni quién está muerto
  estados.forEach((s) => { if (s.vista.fase === 'juego' && s.vista.yo.vivo) s.vista.jugadores.forEach((x) => { if (x.rol || !x.vivo) filtrado = true; }); });
  if (v0.fase === 'fin') break;
  for (let i = 0; i < js.length; i++) {
    const v = estados[i].vista, j = js[i];
    if (v.fase === 'roles' && !v.listo) { await act(j, { tipo: 'rol' }); continue; }
    if (v.fase === 'asamblea' && v.yo.vivo && !v.listo) { await act(j, { tipo: 'chat', texto: 'hola' }); await act(j, { tipo: 'listo-votar' }); continue; }
    if (v.fase === 'votacion' && v.yo.vivo && v.miVoto === undefined) { await act(j, { tipo: 'votar', objetivo: null }); continue; }
    if (v.fase === 'veredicto' && v.yo.vivo && !v.listo) { await act(j, { tipo: 'continuar' }); continue; }
    if (v.fase !== 'juego' || v.yo.mov || v.yo.trabajo) continue;
    if (v.yo.rol === 'traidor' && v.opciones?.puedeMatar) { await act(j, { tipo: 'matar', objetivo: v.opciones.objetivo }); continue; }
    if (v.yo.vivo && v.sala?.cuerpos.length) { await act(j, { tipo: 'reportar' }); continue; }
    if (v.incendio && v.yo.vivo) {
      const pend = v.incendio.salas.filter((x) => !x.apagado);
      if (pend.length) { if (v.sala?.fuego) await act(j, { tipo: 'apagar' }); else await act(j, { tipo: 'mover', sala: sig(v.sala.id, pend.sort((a, b) => dist(v.sala.id, a.id) - dist(v.sala.id, b.id))[0].id) }); continue; }
    }
    if (v.sala?.tarea && !v.incendio) { await act(j, { tipo: 'trabajar' }); continue; }
    const pend = v.yo.tareas.filter((t) => !t.hecha);
    if (v.sala && pend.length && !v.incendio) { await act(j, { tipo: 'mover', sala: sig(v.sala.id, pend.sort((a, b) => dist(v.sala.id, a.sala) - dist(v.sala.id, b.sala))[0].sala) }); continue; }
    if (v.sala && v.yo.rol === 'traidor') {
      if (v.opciones?.sabotaje && Math.random() < 0.05) { await act(j, { tipo: 'sabotear', sabotaje: 'tormenta' }); continue; }
      const vec = E.SALA[v.sala.id].vecinos; await act(j, { tipo: 'mover', sala: vec[Math.floor(Math.random() * vec.length)] });
    }
  }
  await new Promise((r) => setTimeout(r, 120));
}
const fin = (await get(`/online/sala/${code}?token=${host.data.token}`)).data;
assert(fin.vista.fase === 'fin', 'la partida debería haber terminado');
assert(!filtrado, 'se ha filtrado información (rol o estado de otro jugador) durante la partida');
console.log('Ganador:', fin.vista.fin.ganador, '| motivo:', fin.vista.fin.motivo, '| puntos:', fin.jugadores.map((j) => `${j.nombre}=${j.puntos}`).join(' '));
assert((await post(`/online/sala/${code}/siguiente-partida`, { token: host.data.token })).status === 200, 'siguiente partida');
await post(`/online/sala/${code}/salir`, { token: js[2].token });
assert((await get(`/online/sala/${code}?token=${js[2].token}`)).status === 403, 'quien sale no puede mirar');
console.log('E2E OK con', N, 'jugadores');
server.close();
