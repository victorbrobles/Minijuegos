// Prueba de extremo a extremo de «Luna de Sangre» en red.
// Levanta el router real en un puerto libre y simula N jugadores HUMANOS que hablan solo por HTTP
// (crear/unirse, long-polling y acciones), usando la misma lógica de decisión que los bots.
//   node scripts/lobos-e2e.mjs                 → 6 partidas variadas
//   node scripts/lobos-e2e.mjs 10 caotica      → una partida de 10 jugadores del tipo «caotica»
import express from 'express';
import lobosRouter from '../routes/lobos.js';
import { decidirDesdeVista } from '../lobos/bots.js';

const app = express();
app.use(express.json());
app.use('/api/lobos', lobosRouter);
// LOBOS_BASE=http://localhost:5173/api/lobos → prueba a través del proxy de Vite con el servidor ya en marcha
const servidor = process.env.LOBOS_BASE ? { close() {} } : await new Promise((ok) => { const s = app.listen(0, () => ok(s)); });
const BASE = process.env.LOBOS_BASE || `http://localhost:${servidor.address().port}/api/lobos`;

const api = async (ruta, metodo = 'GET', cuerpo) => {
  const r = await fetch(BASE + ruta, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
  const j = await r.json();
  return { estado: r.status, ...j };
};

let fallos = 0;
const comprueba = (cond, msg) => { if (!cond) { fallos++; console.log('  ✗ FALLO:', msg); } };

const CLAVES_JUGADOR = new Set(['id', 'nombre', 'bot', 'conectado', 'vivo', 'rolRevelado', 'contagiado']);

async function partida(n, tipo, mec) {
  const admin = await api('/crear', 'POST', { nombre: 'Anfitrion' });
  comprueba(admin.code?.length === 5 && admin.token, 'crear sala devuelve código y token');
  const code = admin.code;
  const clientes = [{ nombre: 'Anfitrion', token: admin.token, id: 0 }];

  // Casos de error al unirse
  comprueba((await api('/ZZZZZ/unirse', 'POST', { nombre: 'X' })).estado === 404, 'código inexistente → 404');
  for (let i = 1; i < n; i++) {
    const r = await api(`/${code}/unirse`, 'POST', { nombre: `Jugador${i}` });
    comprueba(r.token, 'unirse devuelve token');
    clientes.push({ nombre: `Jugador${i}`, token: r.token, id: i });
  }
  comprueba((await api(`/${code.toLowerCase()}/unirse`, 'POST', { nombre: 'jugador1' })).estado === 409, 'nombre repetido → 409');
  const demasiados = await api(`/${code}/unirse`, 'POST', { nombre: 'Sobrante' });
  if (n >= 14) comprueba(demasiados.estado === 409, 'sala llena → 409');
  else await api(`/${code}/accion`, 'POST', { token: admin.token, tipo: 'expulsar', id: n }); // quita al sobrante

  // Empezar con pocos jugadores debe fallar
  const MIN = (await api(`/${code}/estado?token=${admin.token}&ver=0`)).vista.limites.min;
  if (n < MIN) comprueba((await api(`/${code}/accion`, 'POST', { token: admin.token, tipo: 'empezar' })).estado === 400, 'no se puede empezar con pocos');
  // Un jugador normal no puede configurar
  comprueba((await api(`/${code}/accion`, 'POST', { token: clientes[1].token, tipo: 'config', config: { minutos: 5 } })).estado === 403, 'solo el admin configura');
  await api(`/${code}/accion`, 'POST', { token: admin.token, tipo: 'config', config: { seleccion: { modo: 'recomendada', tipo }, mec, minutos: 0, nocheSeg: 60, votoSeg: 30 } });
  const emp = await api(`/${code}/accion`, 'POST', { token: admin.token, tipo: 'empezar' });
  comprueba(emp.ok, `empezar partida: ${emp.error ?? ''}`);
  comprueba((await api(`/${code}/unirse`, 'POST', { nombre: 'Tarde' })).estado === 409, 'no se puede unir una vez empezada');

  const fases = new Set();
  let ganador = null;
  let rondas = 0;
  let hecho = false;
  const t0 = Date.now();

  const bucle = async (c) => {
    let ver = 0;
    while (!hecho && Date.now() - t0 < 60000) {
      const r = await api(`/${code}/estado?token=${c.token}&ver=${ver}`);
      if (r.error) { comprueba(false, `estado: ${r.error}`); return; }
      if (r.sinCambios) continue;
      const v = r.vista;
      ver = v.ver;
      fases.add(v.fase);
      rondas = Math.max(rondas, v.ronda || 0);

      // Privacidad: ningún jugador debe recibir datos secretos de otros
      v.jugadores.forEach((p) => {
        comprueba(Object.keys(p).every((k) => CLAVES_JUGADOR.has(k)), `claves inesperadas en jugador: ${Object.keys(p)}`);
        if (v.fase !== 'fin' && p.vivo !== false && p.id !== v.yo) comprueba(!p.rolRevelado, 'rol revelado de un jugador vivo');
      });
      comprueba(!('e' in v), 'la vista no debe incluir el estado completo');
      if (v.mi && v.mi.bando !== 'lobos') comprueba(v.mi.companeros.length === 0, 'un no lobo no debe ver compañeros');

      if (v.fase === 'fin') { ganador = v.fin.ganador.bando; hecho = true; return; }

      // Avisos privados
      if (v.mi?.avisos?.length) await api(`/${code}/accion`, 'POST', { token: c.token, tipo: 'ackAvisos' });

      let msg = decidirDesdeVista(v);
      if (c.id === 0 && !msg) {
        if (v.fase === 'anuncio' && !v.cazador) msg = { tipo: 'continuar' };
        if (v.fase === 'resultado') msg = { tipo: 'continuar' };
        if (v.fase === 'objeto' && v.objeto.dueno == null && !v.puedoReclamar) msg = { tipo: 'saltar' };
      }
      if (msg) {
        const a = await api(`/${code}/accion`, 'POST', { token: c.token, ...msg });
        if (a.error && !/Ya has|No puedes|No es tu|no permitida|Espera/.test(a.error)) comprueba(false, `acción ${msg.tipo} (${v.fase}): ${a.error}`);
      }
    }
  };
  await Promise.all(clientes.map(bucle));
  comprueba(ganador, 'la partida debe terminar con un ganador');
  const fin = (await api(`/${code}/estado?token=${admin.token}&ver=0`)).vista;
  comprueba(fin.fase === 'fin' && fin.fin.roles.length === n, 'vista final con todos los roles');
  console.log(`  ${tipo.padEnd(11)} n=${n} → gana: ${ganador}, rondas: ${rondas}, ${((Date.now() - t0) / 1000).toFixed(1)}s, fases: ${[...fases].join(' ')}`);
}

// Un solo humano (el anfitrión) y el resto bots del servidor: así se puede probar la partida a solas
async function partidaConBots(n) {
  const admin = await api('/crear', 'POST', { nombre: 'Solo' });
  for (let i = 1; i < n; i++) await api(`/${admin.code}/accion`, 'POST', { token: admin.token, tipo: 'addBot' });
  await api(`/${admin.code}/accion`, 'POST', { token: admin.token, tipo: 'config', config: { mec: { eventos: true, objetos: true, rumores: true, modif: true }, minutos: 0, nocheSeg: 60, votoSeg: 30 } });
  comprueba((await api(`/${admin.code}/accion`, 'POST', { token: admin.token, tipo: 'empezar' })).ok, 'empezar con bots');
  let ver = 0; let fin = false; const t0 = Date.now(); const fases = new Set();
  while (!fin && Date.now() - t0 < 120000) {
    const r = await api(`/${admin.code}/estado?token=${admin.token}&ver=${ver}`);
    if (r.sinCambios) continue;
    const v = r.vista; ver = v.ver; fases.add(v.fase);
    if (v.fase === 'fin') { fin = true; break; }
    if (v.mi?.avisos?.length) await api(`/${admin.code}/accion`, 'POST', { token: admin.token, tipo: 'ackAvisos' });
    let msg = decidirDesdeVista(v);
    if (!msg && ['anuncio', 'resultado'].includes(v.fase) && !v.cazador) msg = { tipo: 'continuar' };
    if (msg) await api(`/${admin.code}/accion`, 'POST', { token: admin.token, ...msg });
  }
  comprueba(fin, 'la partida con bots debe terminar');
  console.log(`  con bots    n=${n} → terminó: ${fin}, ${((Date.now() - t0) / 1000).toFixed(1)}s, fases: ${[...fases].join(' ')}`);
}

const arg = process.argv.slice(2);
const MEC_TODAS = { eventos: true, objetos: true, rumores: true, modif: true };
const casos = arg.length
  ? [[Number(arg[0]), arg[1] || 'equilibrada', MEC_TODAS]]
  : [[8, 'clasica', {}], [10, 'equilibrada', MEC_TODAS], [12, 'caotica', MEC_TODAS], [9, 'traiciones', MEC_TODAS], [11, 'intrigas', MEC_TODAS], [10, 'plaga', MEC_TODAS], [8, 'estrategica', {}], [12, 'plaga', MEC_TODAS]];
for (const [n, tipo, mec] of casos) await partida(n, tipo, mec);
if (!arg.length) { await partidaConBots(8); await partidaConBots(11); }
console.log(fallos ? `\n${fallos} fallo(s)` : '\nTodo correcto ✔');
servidor.close();
process.exit(fallos ? 1 : 0);
