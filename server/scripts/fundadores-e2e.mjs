// Prueba de extremo a extremo de las salas online de Fundadores con bots por HTTP.  node scripts/fundadores-e2e.mjs [jugadores]
import express from 'express';
import router from '../routes/fundadores.js';
const N = Number(process.argv[2] || 4);
const app = express(); app.use(express.json()); app.use('/api/fundadores', router);
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}/api/fundadores`;
const post = async (u, b) => { const r = await fetch(base + u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); return { status: r.status, data: await r.json() }; };
const get = async (u) => { const r = await fetch(base + u); return { status: r.status, data: await r.json() }; };
const assert = (c, m) => { if (!c) { console.error('FALLO:', m); process.exit(1); } };
const host = await post('/online/crear', { nombre: 'Host' }); const code = host.data.code;
const js = [{ token: host.data.token }];
for (let i = 2; i <= N; i++) js.push({ token: (await post('/online/unirse', { code, nombre: `P${i}` })).data.token });
assert((await post(`/online/sala/${code}/iniciar`, { token: js[1].token })).status === 403, 'solo el anfitrión inicia');
assert((await post(`/online/sala/${code}/iniciar`, { token: host.data.token })).status === 200, 'iniciar');
const act = (j, b) => post(`/online/sala/${code}/accion`, { token: j.token, ...b });
let filtrado = false, pasos = 0; const probado = {};
while (pasos++ < 3000) {
  const st = await Promise.all(js.map(async (j) => (await get(`/online/sala/${code}?token=${j.token}`)).data));
  st.forEach((s, i) => { s.vista.jugadores.forEach((x) => { if (x.id !== s.vista.yo.id && (x.mano || x.eleccion !== undefined)) filtrado = true; }); if (s.vista.fase === 'elegir') s.vista.jugadores.forEach((x) => { if (x.id !== s.vista.yo.id && x.rolRevelado != null) filtrado = true; }); });
  if (st[0].vista.fase === 'fin') break;
  for (let i = 0; i < js.length; i++) {
    const v = st[i].vista, j = js[i];
    if (v.fase === 'elegir' && !v.yo.eleccion) { await act(j, { tipo: 'elegir-rol', rol: 1 + Math.floor(Math.random() * 8) }); continue; }
    if (v.fase !== 'turnos' || v.turno.jugadorId !== v.yo.id) continue;
    const t = v.turno;
    if (t.pendiente) { await act(j, { tipo: 'pendiente', uid: t.pendiente.cartas[0].uid }); continue; }
    if (!t.basica) { await act(j, { tipo: 'basica', basica: Math.random() < 0.5 ? 'jornal' : 'proyectar' }); continue; }
    if (!t.habilidadUsada && t.rol !== 0 && !t.bloqueada && probado[i] !== `${v.ronda}-${t.rol}`) { probado[i] = `${v.ronda}-${t.rol}`; const otro = v.jugadores.find((x) => x.id !== v.yo.id); await act(j, { tipo: 'habilidad', params: { rolObjetivo: 3 + Math.floor(Math.random() * 5), objetivo: otro.id, tipo: 'hogar', copiar: (t.libres || [])[0] } }); continue; }
    const c = v.yo.mano.find((x) => t.costes[x.uid] <= v.yo.monedas);
    if (c && t.construidos < t.maxConstruir) { const r = await act(j, { tipo: 'construir', uid: c.uid }); if (r.status === 200) continue; }
    await act(j, { tipo: 'terminar' });
  }
}
const fin = (await get(`/online/sala/${code}?token=${host.data.token}`)).data;
assert(fin.vista.fase === 'fin', 'debería haber terminado');
assert(!filtrado, 'se ha filtrado información privada');
console.log('Ganadores:', fin.vista.fin.ganadores, '| rondas:', fin.vista.ronda, '| puntos sala:', fin.jugadores.map((j) => `${j.nombre}=${j.puntos}`).join(' '));
assert((await post(`/online/sala/${code}/siguiente-partida`, { token: host.data.token })).status === 200, 'siguiente partida');
await post(`/online/sala/${code}/salir`, { token: js[1].token });
assert((await get(`/online/sala/${code}?token=${js[1].token}`)).status === 403, 'quien sale no puede mirar');
assert((await post(`/online/sala/${code}/forzar`, { token: host.data.token })).status === 200, 'forzar');
console.log('E2E OK con', N, 'jugadores'); server.close();
