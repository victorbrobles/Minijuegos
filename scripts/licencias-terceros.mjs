// scripts/licencias-terceros.mjs
// Genera client/public/licencias-terceros.txt: los avisos de licencia (MIT, ISC, BSD, OFL…) de todo el código y las
// tipografías de terceros que se sirven dentro de la web (dependencias de producción del cliente y las suyas).
// Esas licencias piden que el aviso acompañe a las copias: este fichero se publica con la web y se enlaza en Créditos.
// Uso: node scripts/licencias-terceros.mjs  (también se lanza solo antes de `npm run build` del cliente)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLIENTE = path.join(RAIZ, 'client');
const SALIDA = path.join(CLIENTE, 'public', 'licencias-terceros.txt');

const leerJSON = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
/** Busca el paquete subiendo por los node_modules (como hace Node). */
function dirPaquete(nombre, desde) {
  let d = desde;
  for (;;) {
    const c = path.join(d, 'node_modules', nombre);
    if (fs.existsSync(path.join(c, 'package.json'))) return c;
    const arriba = path.dirname(d);
    if (arriba === d) return null;
    d = arriba;
  }
}
const vistos = new Map();
function recorrer(nombre, desde) {
  const dir = dirPaquete(nombre, desde);
  if (!dir || vistos.has(dir)) return;
  const pkg = leerJSON(path.join(dir, 'package.json'));
  const fich = fs.readdirSync(dir).find((f) => /^(licen[sc]e|copying)(\.|$)/i.test(f) || /^ofl\.txt$/i.test(f));
  vistos.set(dir, {
    nombre: pkg.name, version: pkg.version,
    licencia: typeof pkg.license === 'string' ? pkg.license : pkg.license?.type || (pkg.licenses || []).map((l) => l.type).join(', ') || 'ver texto',
    web: pkg.homepage || (typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url) || '',
    texto: fich ? fs.readFileSync(path.join(dir, fich), 'utf8').trim() : ''
  });
  Object.keys(pkg.dependencies || {}).forEach((d) => recorrer(d, dir));
}

const raiz = leerJSON(path.join(CLIENTE, 'package.json'));
Object.keys(raiz.dependencies || {}).forEach((d) => recorrer(d, CLIENTE));
const lista = [...vistos.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
const linea = '='.repeat(78);
const texto = [
  'Los 100+ minijuegos — Licencias de software y tipografías de terceros',
  '',
  'Esta web incluye el siguiente software libre y tipografías de terceros. Gracias a todos sus autores.',
  'Cada componente se distribuye bajo su propia licencia, cuyo texto se reproduce a continuación.',
  `(${lista.length} paquetes · generado automáticamente a partir de las dependencias de producción)`,
  '',
  ...lista.flatMap((p) => [linea, `${p.nombre} ${p.version} — ${p.licencia}`, p.web ? p.web.replace(/^git\+/, '') : '', linea, p.texto || `Licencia: ${p.licencia} (el paquete no incluye texto de licencia).`, ''])
].join('\n');
fs.writeFileSync(SALIDA, texto);
console.log(`licencias-terceros.txt: ${lista.length} paquetes (${Math.round(texto.length / 1024)} KB)`);
