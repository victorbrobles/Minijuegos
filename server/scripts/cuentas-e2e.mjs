// Prueba de extremo a extremo de las salas online de Lleva la cuenta.  node scripts/cuentas-e2e.mjs [jugadores]
import express from 'express';
import router from '../routes/cuentas.js';
const N = Number(process.argv[2] || 3);
const app = express(); app.use(express.json()); app.use('/api/cuentas', router);
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}/api/cuentas`;
const post = async (u, b) => { const r = await fetch(base + u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); return { status: r.status, data: await r.json() }; };
const get = async (u) => { const r = await fetch(base + u); return { status: r.status, data: await r.json() }; };
const assert = (c, m) => { if (!c) { console.error('FALLO:', m); process.exit(1); } };
const host = await post('/online/crear', { nombre: 'Host' }); const code = host.data.code;
const js = [{ token: host.data.token }];
for (let i = 2; i <= N; i++) js.push({ token: (await post('/online/unirse', { code, nombre: `P${i}` })).data.token });
assert((await post(`/online/sala/${code}/iniciar`, { token: host.data.token })).status === 200, 'iniciar');
const act = (j, b) => post(`/online/sala/${code}/accion`, { token: j.token, ...b });
let pasos = 0;
while (pasos++ < 1000) {
  const st = await Promise.all(js.map(async (j) => (await get(`/online/sala/${code}?token=${j.token}`)).data));
  st.forEach((s) => { if (s.vista.fase === 'juego') s.vista.jugadores.forEach((x) => assert(x.mano === undefined, 'mano ajena visible')); });
  if (st[0].vista.fase === 'fin') break;
  const i = st.findIndex((s) => s.vista.turno?.jugadorId === s.yoId);
  const v = st[i].vista; const bajo = v.yo.mano[0];
  const r = Math.random();
  if (bajo - v.ultimo < 15 || r < 0.3) assert((await act(js[i], { tipo: 'soltar', numero: bajo })).status === 200, 'soltar');
  else if (v.yo.acciones > 0 && r < 0.5) assert((await act(js[i], { tipo: 'accion' })).status === 200, 'accion');
  else assert((await act(js[i], { tipo: 'pasar' })).status === 200, 'pasar');
}
const fin = (await get(`/online/sala/${code}?token=${js[0].token}`)).data;
assert(fin.vista.fase === 'fin', 'termina');
console.log('Ganador', fin.vista.fin.ganadorId, '· tabla', fin.vista.fin.tabla.map((t) => `${t.nombre}#${t.puesto}${t.eliminado ? '💀' : ''}`).join(' '));
console.log(`E2E OK con ${N} jugadores`);
server.close(); process.exit(0);
