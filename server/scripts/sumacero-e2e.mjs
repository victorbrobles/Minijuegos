// Prueba de extremo a extremo de las salas online de Suma Cero.  node scripts/sumacero-e2e.mjs [jugadores]
import express from 'express';
import router from '../routes/sumacero.js';
const N = Number(process.argv[2] || 3);
const app = express(); app.use(express.json()); app.use('/api/sumacero', router);
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}/api/sumacero`;
const post = async (u, b) => { const r = await fetch(base + u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); return { status: r.status, data: await r.json() }; };
const get = async (u) => { const r = await fetch(base + u); return { status: r.status, data: await r.json() }; };
const assert = (c, m) => { if (!c) { console.error('FALLO:', m); process.exit(1); } };
const host = await post('/online/crear', { nombre: 'Host' }); const code = host.data.code;
const js = [{ token: host.data.token }];
for (let i = 2; i <= N; i++) js.push({ token: (await post('/online/unirse', { code, nombre: `P${i}` })).data.token });
assert((await post(`/online/sala/${code}/config`, { token: host.data.token, rondas: 3 })).status === 200, 'config');
assert((await post(`/online/sala/${code}/iniciar`, { token: host.data.token })).status === 200, 'iniciar');
const act = (j, b) => post(`/online/sala/${code}/accion`, { token: j.token, ...b });
let pasos = 0;
while (pasos++ < 3000) {
  const st = await Promise.all(js.map(async (j) => (await get(`/online/sala/${code}?token=${j.token}`)).data));
  const v0 = st[0].vista;
  if (v0.fase === 'fin') break;
  if (v0.fase === 'resultado') { for (let i = 0; i < js.length; i++) if (!st[i].vista.jugadores.find((x) => x.id === st[i].yoId).listo) await act(js[i], { tipo: 'continuar' }); continue; }
  const i = st.findIndex((s) => s.vista.turno?.jugadorId === s.yoId);
  const v = st[i].vista; const j = js[i];
  if (v.turno.paso === 'robar') {
    if (v.plantado == null && Math.abs(v.yo.suma) <= 3 && pasos > 8) { assert((await act(j, { tipo: 'plantarse' })).status === 200, 'plantarse'); continue; }
    const r = await act(j, { tipo: 'robar', origen: 'mazo' }); if (r.status !== 200) await act(j, { tipo: 'robar', origen: 'descarte' });
    continue;
  }
  const esp = v.yo.mano.find((c) => c.tipo === 'especial' && ['espejo', 'avalancha'].includes(c.especial));
  if (esp) { assert((await act(j, { tipo: 'especial', uid: esp.uid })).status === 200, 'especial'); continue; }
  const s = v.yo.suma;
  const mejor = [...v.yo.mano].sort((a, b) => Math.abs(s - (a.tipo === 'numero' ? a.valor : 0)) - Math.abs(s - (b.tipo === 'numero' ? b.valor : 0)))[0];
  assert((await act(j, { tipo: 'descartar', uid: mejor.uid })).status === 200, 'descartar');
}
const fin = (await get(`/online/sala/${code}?token=${js[0].token}`)).data;
assert(fin.vista.fase === 'fin', 'termina');
console.log('Ganador', fin.vista.fin.ganadores, '· tabla', fin.vista.fin.tabla.map((t) => `${t.nombre}=${t.total}`).join(' '));
console.log(`E2E OK con ${N} jugadores`);
server.close(); process.exit(0);
