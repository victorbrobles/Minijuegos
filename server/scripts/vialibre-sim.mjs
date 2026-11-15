// Simulación de «Vía libre»: cada nivel generado tiene solución, no empieza resuelto y se genera rápido.
import { generarNivel, recorrer, trazo, parametros } from '../../client/src/games/ViaLibre/vias.js';
let mal = 0; const t0 = Date.now(); let peor = 0;
for (let nivel = 1; nivel <= 30; nivel++) {
  const tiempos = []; const largos = []; let cruces = 0;
  for (let k = 0; k < 40; k++) {
    const a = Date.now();
    const n = generarNivel(nivel);
    peor = Math.max(peor, Date.now() - a);
    if (recorrer(n).exito) { mal++; console.log('empieza resuelto', nivel); }
    for (const fila of n.celdas) for (const x of fila) { if (x.ruta && x.bien != null) x.rot = x.bien; if (x.tipo === 'cruce') cruces++; }
    const r = recorrer(n);
    if (!r.exito) { mal++; console.log('sin solución', nivel, r.motivo); }
    tiempos.push(n.tiempo); largos.push(n.largo);
  }
  if (nivel % 3 === 1) console.log(`nivel ${nivel}: N=${parametros(nivel).N} largo≈${(largos.reduce((a, b) => a + b) / 40).toFixed(1)} tiempo≈${(tiempos.reduce((a, b) => a + b) / 40).toFixed(1)}s cruces=${cruces}`);
}
const t = trazo(3, 0); if (Math.abs(t[0][0] + 0.5) > 1e-9 || Math.abs(t.at(-1)[1] + 0.5) > 1e-9) { mal++; console.log('trazo mal', t[0], t.at(-1)); }
console.log(`peor generación ${peor} ms, total ${Date.now() - t0} ms`);
if (mal) { console.log('FALLOS', mal); process.exit(1); }
console.log('Vía libre: OK');
