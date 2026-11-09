// Prueba de extremo a extremo de las salas online de La Hipótesis Ganadora con bots por HTTP.
//   node scripts/hipotesis-e2e.mjs [jugadores]
import express from 'express';
import router from '../routes/hipotesis.js';

const N = Number(process.argv[2] || 4);
const app = express(); app.use(express.json()); app.use('/api/hipotesis', router);
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}/api/hipotesis`;
const post = async (u, b) => { const r = await fetch(base + u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); return { status: r.status, data: await r.json() }; };
const get = async (u) => { const r = await fetch(base + u); return { status: r.status, data: await r.json() }; };
const assert = (c, m) => { if (!c) { console.error('FALLO:', m); process.exit(1); } };
const azar = (a) => a[Math.floor(Math.random() * a.length)];

const host = await post('/online/crear', { nombre: 'Host' }); const code = host.data.code;
const js = [{ token: host.data.token }];
for (let i = 2; i <= N; i++) js.push({ token: (await post('/online/unirse', { code, nombre: `P${i}` })).data.token });
assert((await post(`/online/sala/${code}/config`, { token: host.data.token, rondas: 3 })).status === 200, 'config');
assert((await post(`/online/sala/${code}/iniciar`, { token: host.data.token })).status === 200, 'iniciar');
const act = (j, b) => post(`/online/sala/${code}/accion`, { token: j.token, ...b });

let pasos = 0;
while (pasos++ < 400) {
  const st = await Promise.all(js.map(async (j) => (await get(`/online/sala/${code}?token=${j.token}`)).data));
  const v0 = st[0].vista;
  if (v0.fase === 'fin') break;
  // privacidad: nadie ve una casilla que no le toca antes de la revelación
  st.forEach((s) => { if (s.vista.fase !== 'revelacion') assert(s.vista.casillas.filter((c) => c.v != null).every((c) => c.mia || c.rumor), 'casilla ajena visible'); });
  for (let i = 0; i < js.length; i++) {
    const v = st[i].vista;
    if (v.fase === 'formular' && !v.yo.hipotesis) {
      const conocida = v.casillas.find((c) => c.v != null);
      const r = await act(js[i], { tipo: 'formular', hipotesis: { pl: 'es', p: { i: conocida.i, v: Math.random() < 0.5 ? conocida.v : (conocida.v + 1) % v.valores.length } } });
      assert(r.status === 200, 'formular: ' + JSON.stringify(r.data));
    } else if (v.fase === 'juicio' && !v.yo.listo) {
      const votos = {}; v.hipotesis.filter((h) => !h.mia).forEach((h) => { votos[h.hid] = Math.random() < 0.5 ? 'si' : 'no'; });
      if (v.hipotesis.length) await act(js[i], { tipo: 'reaccion', hid: v.hipotesis[0].hid, emoji: '🤔' });
      const r = await act(js[i], { tipo: 'juzgar', votos, seguro: Object.keys(votos).length ? azar(Object.keys(votos)) : null });
      assert(r.status === 200 || r.data.error === 'Ahora no se juzga.', 'juzgar: ' + JSON.stringify(r.data));
    } else if (v.fase === 'revelacion' && !v.yo.listo) {
      await act(js[i], { tipo: 'continuar' });
    }
  }
}
const fin = (await get(`/online/sala/${code}?token=${js[0].token}`)).data;
assert(fin.vista.fase === 'fin', 'la partida termina');
console.log('Ganador:', fin.vista.fin.ganadores.join(','), '· puntos', fin.vista.fin.tabla.map((t) => `${t.nombre}=${t.puntos}`).join(' '));
console.log(`E2E OK con ${N} jugadores`);
server.close();
process.exit(0);
