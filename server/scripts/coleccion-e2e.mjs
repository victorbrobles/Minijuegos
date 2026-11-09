// Prueba de extremo a extremo de las salas online de Colecciona con cabeza.  node scripts/coleccion-e2e.mjs [jugadores]
import express from 'express';
import router from '../routes/coleccion.js';
const N = Number(process.argv[2] || 3);
const app = express(); app.use(express.json()); app.use('/api/coleccion', router);
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}/api/coleccion`;
const post = async (u, b) => { const r = await fetch(base + u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); return { status: r.status, data: await r.json() }; };
const get = async (u) => { const r = await fetch(base + u); return { status: r.status, data: await r.json() }; };
const assert = (c, m) => { if (!c) { console.error('FALLO:', m); process.exit(1); } };
const host = await post('/online/crear', { nombre: 'Host' }); const code = host.data.code;
const js = [{ token: host.data.token }];
for (let i = 2; i <= N; i++) js.push({ token: (await post('/online/unirse', { code, nombre: `P${i}` })).data.token });
assert((await post(`/online/sala/${code}/iniciar`, { token: host.data.token })).status === 200, 'iniciar');
const act = (j, b) => post(`/online/sala/${code}/accion`, { token: j.token, ...b });
let pasos = 0;
while (pasos++ < 2000) {
  const st = await Promise.all(js.map(async (j) => (await get(`/online/sala/${code}?token=${j.token}`)).data));
  st.forEach((s) => s.vista.jugadores.forEach((x) => { if (x.id !== s.yoId && s.vista.fase !== 'fin') assert(!x.mano, 'mano ajena visible'); }));
  if (st[0].vista.fase === 'fin') break;
  const i = st.findIndex((s) => s.vista.turno?.jugadorId === s.yoId);
  const v = st[i].vista; const j = js[i];
  if (v.turno.paso === 'descartar') { await act(j, { tipo: 'descartar', uid: v.yo.mano[0].uid }); continue; }
  const col = v.yo.mano.find((c) => c.clase !== 'accion');
  if (v.turno.jugadas > 0 && col && v.jugadores.find((x) => x.id === v.yo.id).vitrina.length < 6) { assert((await act(j, { tipo: 'colocar', uid: col.uid })).status === 200, 'colocar'); continue; }
  const acc = v.yo.mano.find((c) => c.clase === 'accion' && ['turbo', 'tornado', 'nuevoEncargo', 'iman'].includes(c.accion));
  if (v.turno.jugadas > 0 && acc) { const r = await act(j, { tipo: 'accion', uid: acc.uid, params: { palo: 'dino' } }); assert(r.status === 200, 'accion ' + JSON.stringify(r.data)); continue; }
  assert((await act(j, { tipo: 'terminar' })).status === 200, 'terminar');
}
const fin = (await get(`/online/sala/${code}?token=${js[0].token}`)).data;
assert(fin.vista.fase === 'fin', 'termina');
console.log('Ganador', fin.vista.fin.ganadorId, '· ronda', fin.vista.ronda, '· puntos', fin.jugadores.map((x) => `${x.nombre}=${x.puntos}`).join(' '));
console.log(`E2E OK con ${N} jugadores`);
server.close(); process.exit(0);
