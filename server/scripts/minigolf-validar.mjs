// Valida los 200 hoyos de «Minigolf»: un bot juega cada hoyo y, si no lo emboca con soltura, se prueba otra semilla.
// Guarda las semillas buenas en client/src/games/Minigolf/semillas.json. Uso: node scripts/minigolf-validar.mjs [desde] [hasta]
import fs from 'fs';
import * as CANNON from 'cannon-es';
import { generarHoyo, TOTAL_HOYOS } from '../../client/src/games/Minigolf/hoyos.js';
import { crearSimulador, golpeBot } from '../../client/src/games/Minigolf/fisica.js';

const RUTA = new URL('../../client/src/games/Minigolf/semillas.json', import.meta.url);
const semillas = fs.existsSync(RUTA) ? JSON.parse(fs.readFileSync(RUTA, 'utf8')) : {};
const desde = Number(process.argv[2]) || 1; const hasta = Number(process.argv[3]) || TOTAL_HOYOS;
let azarS = 12345; const azar = () => { azarS = (azarS * 1103515245 + 12345) % 2147483648; return azarS / 2147483648; };

function partidaBot(h) {
  const s = crearSimulador(h, CANNON);
  for (let g = 1; g <= 16; g++) { const e = golpeBot(s, azar); if (e === 'embocada') return g; }
  return null;
}
const t0 = Date.now(); const intentosPorHoyo = [];
for (let n = desde; n <= hasta; n++) {
  let ok = false;
  for (let k = 0; k < 40 && !ok; k++) {
    const semilla = n * 7919 + k * 104729;
    const h = generarHoyo(n, semilla);
    const res = [partidaBot(h), partidaBot(h), partidaBot(h)];
    const buenos = res.filter((x) => x !== null);
    if (buenos.length >= 2) { semillas[n] = semilla; ok = true; intentosPorHoyo.push(k + 1); if (n % 20 === 0) console.log(`hoyo ${n}: semilla ${semilla} (${k + 1} intentos) golpes bot ${res.join(',')} par ${h.par}`); }
  }
  if (!ok) console.log(`¡Hoyo ${n} sin semilla válida!`);
}
fs.writeFileSync(RUTA, `${JSON.stringify(semillas, null, 0)}\n`);
console.log(`Validados ${Object.keys(semillas).length} hoyos en ${Math.round((Date.now() - t0) / 1000)} s · intentos medios ${(intentosPorHoyo.reduce((a, b) => a + b, 0) / intentosPorHoyo.length).toFixed(2)}`);
