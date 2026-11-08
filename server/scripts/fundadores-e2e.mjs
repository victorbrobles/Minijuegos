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
const azar = (a) => a[Math.floor(Math.random() * a.length)];

const host = await post('/online/crear', { nombre: 'Host' }); const code = host.data.code;
const js = [{ token: host.data.token }];
for (let i = 2; i <= N; i++) js.push({ token: (await post('/online/unirse', { code, nombre: `P${i}` })).data.token });
assert((await post(`/online/sala/${code}/iniciar`, { token: js[1].token })).status === 403, 'solo el anfitrión inicia');
assert((await post(`/online/sala/${code}/config`, { token: host.data.token, duracion: 'corto' })).status === 200, 'config');
assert((await post(`/online/sala/${code}/iniciar`, { token: host.data.token })).status === 200, 'iniciar');
assert((await post(`/online/sala/${code}/iniciar`, { token: host.data.token })).status === 400, 'no se reinicia en marcha');
const act = (j, b) => post(`/online/sala/${code}/accion`, { token: j.token, ...b });

let pasos = 0;
while (pasos++ < 5000) {
  const st = await Promise.all(js.map(async (j) => (await get(`/online/sala/${code}?token=${j.token}`)).data));
  // Privacidad: nadie ve la mano ni el oficio oculto de otro, ni el bote de oficios si no le toca elegir
  st.forEach((s) => {
    const v = s.vista;
    v.jugadores.forEach((x) => { assert(!x.mano, 'mano ajena visible'); });
    if (v.eleccion && v.eleccion.turnoDe !== v.yo.id) assert(v.eleccion.pool === null, 'bote visible a quien no elige');
    if (v.fase === 'eleccion') v.jugadores.forEach((x) => { if (x.id !== v.yo.id) assert(x.rol === null, 'oficio ajeno visible durante la elección'); });
  });
  const v0 = st[0].vista;
  if (v0.fase === 'fin') break;
  if (v0.fase === 'eleccion') {
    const i = st.findIndex((s) => s.vista.eleccion.turnoDe === s.yoId);
    const r = await act(js[i], { tipo: 'elegir-rol', rol: azar(st[i].vista.eleccion.pool) });
    assert(r.status === 200, 'elegir: ' + JSON.stringify(r.data));
    continue;
  }
  const i = st.findIndex((s) => s.vista.turno?.jugadorId === s.yoId);
  const v = st[i].vista; const t = v.turno; const j = js[i];
  if (t.paso === 'recurso') { const r = await act(j, { tipo: 'recurso', recurso: Math.random() < 0.5 ? 'planos' : 'monedas' }); if (r.status !== 200) await act(j, { tipo: 'recurso', recurso: 'monedas' }); continue; }
  if (t.paso === 'planos') { assert(t.pendiente.length > 0, 'pendiente visible a su dueño'); await act(j, { tipo: 'plano', uid: t.pendiente[0].uid }); continue; }
  if (t.paso === 'habilidad') {
    const params = {};
    if (t.rol === 1) params.rol = azar(v.enJuego.filter((r) => r !== 1));
    if (t.rol === 2) params.rol = azar(v.enJuego.filter((r) => r > 2 && r !== v.saboteado));
    const r = await act(j, { tipo: 'habilidad', params });
    if (r.status !== 200) await act(j, { tipo: 'omitir' });
    continue;
  }
  const c = v.yo.mano.find((x) => !x.motivo);
  if (c) { assert((await act(j, { tipo: 'construir', uid: c.uid })).status === 200, 'construir'); continue; }
  assert((await act(j, { tipo: 'terminar' })).status === 200, 'terminar');
}
const fin = (await get(`/online/sala/${code}?token=${js[0].token}`)).data;
assert(fin.vista.fase === 'fin', 'la partida termina');
console.log('Ganador:', fin.vista.fin.ganadores.map((g) => fin.jugadores.find((x) => x.id === g)?.nombre).join(', '), '· rondas', fin.vista.ronda, '· puntos', fin.jugadores.map((x) => `${x.nombre}=${x.puntos}`).join(' '));
assert((await post(`/online/sala/${code}/finalizar`, { token: host.data.token })).status === 200, 'finalizar');
console.log(`E2E OK con ${N} jugadores`);
server.close();
process.exit(0);
