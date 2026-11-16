// scripts/revision/simulaciones.mjs
// Ejecuta todas las simulaciones de los motores de juego (server/scripts/*-sim.mjs). Cada una juega muchas partidas
// automáticas y falla si algo no cuadra. Uso: node scripts/revision/simulaciones.mjs
import { readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';

const dir = new URL('../../server/scripts/', import.meta.url).pathname;
const sims = readdirSync(dir).filter((f) => f.endsWith('-sim.mjs')).sort();
const LIMITE = 5 * 60 * 1000; // 5 minutos por simulación

function ejecutar(f) {
  return new Promise((resolve) => {
    const inicio = Date.now();
    const p = spawn(process.execPath, [f], { cwd: dir, env: { ...process.env, DB_PATH: ':memory:' } });
    let salida = '';
    p.stdout.on('data', (d) => { salida += d; });
    p.stderr.on('data', (d) => { salida += d; });
    const t = setTimeout(() => { p.kill('SIGKILL'); salida += '\n(se pasó del tiempo límite)'; }, LIMITE);
    p.on('close', (codigo, senal) => {
      clearTimeout(t);
      if (codigo !== 0) salida += `\n(terminó con código ${codigo}${senal ? `, señal ${senal}` : ''})`;
      resolve({ f, codigo, salida, ms: Date.now() - inicio });
    });
  });
}

const fallos = [];
for (const f of sims) {
  const r = await ejecutar(f);
  const ok = r.codigo === 0;
  console.log(`${ok ? '✅' : '❌'} ${f} (${(r.ms / 1000).toFixed(1)} s)`);
  if (!ok) { fallos.push(f); console.log(r.salida.split('\n').slice(-25).join('\n')); }
}
console.log(`\n${sims.length - fallos.length}/${sims.length} simulaciones correctas`);
if (fallos.length) { console.error(`Fallan: ${fallos.join(', ')}`); process.exit(1); }
