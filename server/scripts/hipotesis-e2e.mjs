// Prueba de extremo a extremo de las salas online de La Hipótesis Ganadora con bots por HTTP.  node scripts/hipotesis-e2e.mjs [jugadores]
import express from 'express';
import router from '../routes/hipotesis.js';
const N = Number(process.argv[2] || 4);
const app = express(); app.use(express.json()); app.use('/api/hipotesis', router);
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}/api/hipotesis`;
const post = async (u, b) => { const r = await fetch(base + u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); return { status: r.status, data: await r.json() }; };
const get = async (u) => { const r = await fetch(base + u); return { status: r.status, data: await r.json() }; };
const assert = (c, m) => { if (!c) { console.error('FALLO:', m); process.exit(1); } };
const host = await post('/online/crear', { nombre: 'Host' }); const code = host.data.code;
const js = [{ token: host.data.token }];
for (let i = 2; i <= N; i++) js.push({ token: (await post('/online/unirse', { code, nombre: `P${i}` })).data.token });
assert((await post(`/online/sala/${code}/iniciar`, { token: js[1].token })).status === 403, 'solo el anfitrión inicia');
assert((await post(`/online/sala/${code}/config`, { token: host.data.token, rondas: 3 })).data.config.rondas === 3, 'config rondas');
assert((await post(`/online/sala/${code}/iniciar`, { token: host.data.token })).status === 200, 'iniciar');
const act = (j, b) => post(`/online/sala/${code}/accion`, { token: j.token, ...b });
let filtrado = false, pasos = 0;
while (pasos++ < 2000) {
  const st = await Promise.all(js.map(async (j) => (await get(`/online/sala/${code}?token=${j.token}`)).data));
  // privacidad: durante la formulación nadie ve hipótesis ajenas ni la verdad; en las apuestas no se ve la coartada ni la verdad
  st.forEach((s) => { const v = s.vista; if (v.fase === 'hipotesis' && (v.hipotesis || v.resultado)) filtrado = true; if (v.fase === 'apuestas' && (v.resultado || JSON.stringify(v.hipotesis).includes('coartada'))) filtrado = true; if (JSON.stringify(v).includes('"verdad"') && v.fase !== 'resolucion' && v.fase !== 'fin') filtrado = true; });
  if (st[0].vista.fase === 'fin') break;
  for (let i = 0; i < js.length; i++) {
    const v = st[i].vista, j = js[i];
    if (v.fase === 'hipotesis' && !v.miHipotesis) { const c = v.conocimiento[0]; const r = await act(j, { tipo: 'hipotesis', hipotesis: { forma: 'tipo', i: c.m, t: Math.random() < 0.6 ? c.t : (c.t + 1) % 4, coartada: v.yo.instrumento.tipo === 'coartada' && !v.yo.instrumento.usado } }); assert(r.status === 200, 'hipótesis ' + JSON.stringify(r.data)); }
    else if (v.fase === 'apuestas' && !v.listo) {
      const ajenas = v.hipotesis.filter((h) => h.autorId !== v.yo.id); const pos = {}; ajenas.forEach((h) => { if (Math.random() < 0.7) pos[h.autorId] = Math.random() < 0.5 ? 'si' : 'no'; }); if (!Object.keys(pos).length) pos[ajenas[0].autorId] = 'si';
      // poderes y reacciones nuevos
      if (v.yo.instrumento.tipo === 'detector' && !v.yo.instrumento.usado) { const r0 = await act(j, { tipo: 'detectar', a: ajenas[0].autorId }); assert(r0.status === 200, 'detectar ' + JSON.stringify(r0.data)); }
      const r1 = await act(j, { tipo: 'reaccion', a: ajenas[0].autorId, emoji: '🤥' }); assert(r1.status === 200, 'reaccion ' + JSON.stringify(r1.data));
      const body = { tipo: 'apostar', posiciones: pos }; if (v.yo.instrumento.tipo === 'doble' && !v.yo.instrumento.usado) body.doble = Number(Object.keys(pos)[0]);
      const r = await act(j, body); assert(r.status === 200, 'apuestas ' + JSON.stringify(r.data));
    } else if (v.fase === 'resolucion' && !v.listo) await act(j, { tipo: 'continuar' });
  }
}
const fin = (await get(`/online/sala/${code}?token=${host.data.token}`)).data;
assert(fin.vista.fase === 'fin', 'debería haber terminado'); assert(!filtrado, 'se ha filtrado información privada');
// validaciones del servidor
console.log('Ganadores:', fin.vista.fin.ganadores, '| rondas:', fin.vista.rondas, '| puntos sala:', fin.jugadores.map((j) => `${j.nombre}=${j.puntos}`).join(' '));
assert((await post(`/online/sala/${code}/siguiente-partida`, { token: host.data.token })).status === 200, 'siguiente partida');
const v1 = (await get(`/online/sala/${code}?token=${host.data.token}`)).data.vista;
assert((await act(js[0], { tipo: 'apostar', posiciones: { 2: 'si' } })).status === 400, 'no se puede apostar en fase de formulación');
assert((await act(js[0], { tipo: 'reaccion', a: 2, emoji: '🤥' })).status === 400, 'no se reacciona en fase de formulación');
assert((await act(js[0], { tipo: 'hipotesis', hipotesis: { forma: 'igual', i: 1, j: 1 } })).status === 400, 'hipótesis inválida rechazada');
await post(`/online/sala/${code}/salir`, { token: js[1].token });
assert((await get(`/online/sala/${code}?token=${js[1].token}`)).status === 403, 'quien sale no puede mirar');
assert((await post(`/online/sala/${code}/forzar`, { token: host.data.token })).status === 200, 'forzar');
console.log('E2E OK con', N, 'jugadores'); server.close();
