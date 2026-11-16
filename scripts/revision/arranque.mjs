// scripts/revision/arranque.mjs
// Abre en un navegador (Chromium, tamaño móvil) la portada y cada uno de los juegos de la versión compilada, entra en
// el primer modo de juego que haya y comprueba que no salta ningún error. Necesita el servidor en marcha.
// Uso: node scripts/revision/arranque.mjs [http://127.0.0.1:3001]
import { chromium, devices } from 'playwright';

const URL_BASE = process.argv[2] || 'http://127.0.0.1:3001';
// Si el servidor tiene contraseña (AUTH_USER y AUTH_PASSWORD), se usa la misma
const USUARIO = process.env.AUTH_USER || '';
const CLAVE = process.env.AUTH_PASSWORD || '';
// Errores que vienen de fuera (fotos o audios de internet, WebGL sin tarjeta gráfica) y no son fallos de la web
const IGNORAR = [/Failed to fetch/i, /NetworkError/i, /Load failed/i, /WebGL/i, /ResizeObserver loop/i];

const navegador = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const contexto = await navegador.newContext({ ...devices['iPhone 13'], ...(USUARIO ? { httpCredentials: { username: USUARIO, password: CLAVE } } : {}) });
const pagina = await contexto.newPage();
let errores = [];
pagina.on('pageerror', (e) => { if (!IGNORAR.some((r) => r.test(e.message))) errores.push(e.message); });
// Algo bloqueado por la política de seguridad (CSP) también es un fallo: la web dejaría de funcionar en parte
pagina.on('console', (m) => { if (m.type() === 'error' && /Content Security Policy/i.test(m.text())) errores.push(m.text().slice(0, 200)); });

const cabeceras = USUARIO ? { Authorization: 'Basic ' + Buffer.from(`${USUARIO}:${CLAVE}`).toString('base64') } : {};
const juegos = await (await fetch(`${URL_BASE}/api/games`, { headers: cabeceras })).json();
const ids = (Array.isArray(juegos) ? juegos : juegos.games || juegos.juegos || []).map((j) => j.id).filter(Boolean);
if (!ids.length) { console.error('❌ No se pudo leer la lista de juegos'); process.exit(1); }

const mal = [];
// Portada (con la entrada de nombre)
await pagina.goto(`${URL_BASE}/`);
await pagina.locator('.idn-campo.nombre input').fill('Revision');
await pagina.locator('.idn-campo.tag input').fill('0001');
await pagina.getByRole('button', { name: 'Entrar' }).click();
await pagina.waitForSelector('.home-carousel-item', { timeout: 15000 }).catch(() => mal.push('portada: no aparecen los juegos'));
if (errores.length) mal.push(`portada: ${errores[0]}`);

for (const id of ids) {
  errores = [];
  await pagina.goto(`${URL_BASE}/juego/${id}`);
  await pagina.waitForTimeout(900);
  const modo = pagina.getByText(/Jugar en un único dispositivo|^¡Jugar!$|Un solo móvil|Jugar$/).first();
  if (await modo.count()) { await modo.click().catch(() => {}); await pagina.waitForTimeout(900); }
  if (errores.length) mal.push(`${id}: ${errores[0]}`);
  process.stdout.write(errores.length ? 'x' : '.');
}
await navegador.close();
console.log(`\n${ids.length - mal.length}/${ids.length} juegos arrancan sin errores`);
if (mal.length) { console.error('❌ Fallos:\n' + mal.map((m) => `  - ${m}`).join('\n')); process.exit(1); }
console.log('✅ Todo arranca');
