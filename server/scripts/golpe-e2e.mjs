// Prueba de extremo a extremo de las salas online de El Golpe.  node scripts/golpe-e2e.mjs [jugadores]
import express from 'express';
import router from '../routes/golpe.js';
const N = Number(process.argv[2] || 4);
const app = express(); app.use(express.json()); app.use('/api/golpe', router);
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}/api/golpe`;
const post = async (u, b) => { const r = await fetch(base + u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); return { status: r.status, data: await r.json() }; };
const get = async (u) => { const r = await fetch(base + u); return { status: r.status, data: await r.json() }; };
const assert = (c, m) => { if (!c) { console.error('FALLO:', m); process.exit(1); } };
const azar = (a) => a[Math.floor(Math.random() * a.length)];
const host = await post('/online/crear', { nombre: 'Host' }); const code = host.data.code;
const js = [{ token: host.data.token }];
for (let i = 2; i <= N; i++) js.push({ token: (await post('/online/unirse', { code, nombre: `P${i}` })).data.token });
assert((await post(`/online/sala/${code}/config`, { token: host.data.token, misiones: 3 })).status === 200, 'config');
assert((await post(`/online/sala/${code}/iniciar`, { token: host.data.token })).status === 200, 'iniciar');
const act = (j, b) => post(`/online/sala/${code}/accion`, { token: j.token, ...b });
let pasos = 0;
while (pasos++ < 300) {
  const st = await Promise.all(js.map(async (j) => (await get(`/online/sala/${code}?token=${j.token}`)).data));
  const v0 = st[0].vista;
  if (v0.fase === 'fin') break;
  // privacidad: nadie ve planes ajenos antes del debate ni objetivos ajenos antes de la resolución
  st.forEach((s) => { if (s.vista.fase === 'plan') assert(s.vista.planes.length === 0, 'planes visibles en fase plan'); if (s.vista.fase !== 'resolucion') assert(!s.vista.resultado, 'resultado visible'); });
  for (let i = 0; i < js.length; i++) {
    const v = st[i].vista;
    if (!v.faltan.includes(v.yo.id)) continue;
    if (v.fase === 'plan') assert((await act(js[i], { tipo: 'plan', plan: [azar([0, 1, 2, 3]), azar([0, 1, 2, 3]), azar([0, 1, 2, 3])] })).status === 200, 'plan');
    else if (v.fase === 'voto') {
      const otros = v.planes.filter((p) => p.autorId !== v.yo.id);
      if (!otros.length) continue;
      await act(js[i], { tipo: 'chat', texto: 'Yo voto este' });
      const r = await act(js[i], { tipo: 'votar', plan: azar(otros).autorId, traidor: azar(v.jugadores.filter((j) => j.id !== v.yo.id)).id });
      assert(r.status === 200 || r.data.error === 'Ahora no se vota.', 'votar ' + JSON.stringify(r.data));
    } else {
      const r = await act(js[i], { tipo: 'listo' });
      assert(r.status === 200 || r.data.error === 'Ahora no toca.', 'listo ' + JSON.stringify(r.data));
    }
  }
}
const fin = (await get(`/online/sala/${code}?token=${js[0].token}`)).data;
assert(fin.vista.fase === 'fin', 'termina');
console.log('Ganadores', fin.vista.fin.ganadores, '· tabla', fin.vista.fin.tabla.map((t) => `${t.nombre}=${t.puntos}`).join(' '));
console.log(`E2E OK con ${N} jugadores`);
server.close(); process.exit(0);
