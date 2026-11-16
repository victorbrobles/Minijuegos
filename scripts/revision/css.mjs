// scripts/revision/css.mjs
// Comprueba que todas las hojas de estilo tienen las llaves bien cerradas. Una llave sin cerrar en un archivo
// «se come» todos los estilos que van detrás al compilar (todos se juntan en uno), y en desarrollo no se nota.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const raiz = new URL('../../client/src/', import.meta.url).pathname;
const archivos = [];
const recorrer = (d) => readdirSync(d).forEach((f) => { const r = join(d, f); if (statSync(r).isDirectory()) recorrer(r); else if (f.endsWith('.css')) archivos.push(r); });
recorrer(raiz);

const mal = [];
for (const f of archivos) {
  const texto = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/"[^"\n]*"|'[^'\n]*'/g, '');
  let nivel = 0; let linea = 1; let abierta = 0;
  for (const c of texto) {
    if (c === '\n') linea += 1;
    else if (c === '{') { if (nivel === 0) abierta = linea; nivel += 1; } else if (c === '}') { nivel -= 1; if (nivel < 0) { mal.push(`${relative(raiz, f)}: «}» de más en la línea ${linea}`); nivel = 0; } }
  }
  if (nivel > 0) mal.push(`${relative(raiz, f)}: falta cerrar la llave abierta cerca de la línea ${abierta}`);
}
if (mal.length) { console.error('❌ Hojas de estilo mal cerradas:\n' + mal.map((m) => `  - ${m}`).join('\n')); process.exit(1); }
console.log(`✅ ${archivos.length} hojas de estilo bien cerradas`);
