// server/db.js
// Bases de datos del servidor (SQLite con libSQL, que funciona igual que better-sqlite3):
//
//  · `db` (por defecto) — lo que genera la gente: récords, grupos, retos, valoraciones, estadísticas…
//      - Con TURSO_DATABASE_URL y TURSO_AUTH_TOKEN (Render): es una réplica local de una base de datos de Turso
//        (gratis). Las escrituras van a Turso y al arrancar se descarga todo, así que NO se pierde nada al
//        desplegar una versión nueva ni cuando el servidor se duerme y se reinicia.
//      - Sin ellas (en local): un archivo normal (DB_PATH o server/data/minigames.db).
//  · `contenido` — siglas y personajes de «¿Quién es quién?». Salen de los archivos del proyecto y se cargan en
//      memoria en cada arranque: no hace falta guardarlos en ningún sitio.
import Database from 'libsql';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import seedSiglas from './data/seeds/siglas/siglas.seed.js';
import seedQuienEsQuien from './data/seeds/quienesquien/quienesquien.js';

// libSQL añade un campo «_metadata» a cada fila: se quita para que todo funcione (y se responda) igual que antes
const limpiar = (fila) => { if (fila && typeof fila === 'object') delete fila._metadata; return fila; };
// Con Turso, cada escritura va directa a Turso y la copia local no se entera hasta que se sincroniza. Para que lo
// recién guardado se vea al momento (estadísticas, salón de la fama…), tras cada escritura se trae de Turso.
// Dentro de una transacción se espera a que termine entera.
function envolver(base, { sincronizar = null } = {}) {
  let enTransaccion = 0;
  const traer = () => {
    if (!sincronizar || enTransaccion) return;
    try { sincronizar(); } catch (e) { console.error('[datos] Error al sincronizar con Turso:', e.message); }
  };
  return new Proxy(base, {
    get(objetivo, clave) {
      if (clave === 'prepare') {
        return (sql) => {
          const st = objetivo.prepare(sql);
          // Con Turso, cada uso prepara la consulta de nuevo: así nunca lee una «foto» antigua de la copia local
          const actual = () => (sincronizar ? objetivo.prepare(sql) : st);
          return new Proxy(st, {
            get(s, m) {
              if (m === 'get') return (...a) => limpiar(actual().get(...a));
              if (m === 'all') return (...a) => actual().all(...a).map(limpiar);
              if (m === 'run') return (...a) => { const r = actual().run(...a); if (r?.changes) traer(); return r; };
              const v = s[m];
              return typeof v === 'function' ? v.bind(s) : v;
            }
          });
        };
      }
      if (clave === 'exec') return (sql) => { const r = objetivo.exec(sql); traer(); return r; };
      if (clave === 'transaction') {
        return (fn) => {
          const tx = objetivo.transaction(fn);
          return (...a) => {
            enTransaccion += 1;
            try { return tx(...a); } finally { enTransaccion -= 1; traer(); }
          };
        };
      }
      const v = objetivo[clave];
      return typeof v === 'function' ? v.bind(objetivo) : v;
    }
  });
}

/* ───────── Datos de la gente ───────── */
const TURSO_URL = process.env.TURSO_DATABASE_URL?.trim();
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN?.trim();
let base;
let conTurso = false;
if (TURSO_URL) {
  // Réplica local de Turso: lecturas rápidas en local y escrituras guardadas en Turso
  const rutaReplica = process.env.DB_PATH ?? fileURLToPath(new URL('./data/turso-replica.db', import.meta.url));
  mkdirSync(dirname(rutaReplica), { recursive: true });
  try {
    // Al abrirla se descarga todo lo guardado en Turso
    base = new Database(rutaReplica, { syncUrl: TURSO_URL, authToken: TURSO_TOKEN, readYourWrites: true });
    conTurso = true;
    console.log('[datos] Conectado a Turso: los datos se guardan de forma permanente.');
    // Además de tras cada escritura, cada minuto se trae de Turso por si acaso
    setInterval(() => { try { base.sync(); } catch (e) { console.error('[datos] Error al sincronizar con Turso:', e.message); } }, 60 * 1000).unref();
  } catch (e) {
    // Turso no responde o la URL/token están mal: la web sigue funcionando, pero lo de ahora no se guardará para siempre
    console.error(`[datos] ⚠️ NO SE PUDO CONECTAR CON TURSO (${e.message}). Se usa un archivo local temporal: revisa TURSO_DATABASE_URL y TURSO_AUTH_TOKEN.`);
    base = new Database(fileURLToPath(new URL('./data/minigames-temporal.db', import.meta.url)));
  }
} else {
  const ruta = process.env.DB_PATH ?? fileURLToPath(new URL('./data/minigames.db', import.meta.url));
  if (ruta !== ':memory:') mkdirSync(dirname(ruta), { recursive: true });
  base = new Database(ruta);
  if (process.env.RENDER) console.warn('[datos] ⚠️ EN RENDER sin TURSO_DATABASE_URL: los datos se perderán al desplegar o reiniciar.');
}
const db = envolver(base, { sincronizar: conTurso ? () => base.sync() : null });

/* ───────── Contenido (en memoria, se carga en cada arranque) ───────── */
export const contenido = envolver(new Database(':memory:'));

contenido.exec(`
  CREATE TABLE IF NOT EXISTS siglas (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    sigla        TEXT NOT NULL UNIQUE,
    respuesta    TEXT NOT NULL,
    alternativas TEXT NOT NULL DEFAULT '[]',
    categoria    TEXT NOT NULL DEFAULT 'General'
  );

  CREATE TABLE IF NOT EXISTS quienes_quien (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre     TEXT NOT NULL UNIQUE,
    categoria  TEXT NOT NULL DEFAULT 'General',
    oculta     INTEGER NOT NULL DEFAULT 0
  )
`);

const insertarSigla = contenido.prepare('INSERT INTO siglas (sigla, respuesta, alternativas, categoria) VALUES (?, ?, ?, ?)');
const insertarQQ = contenido.prepare('INSERT INTO quienes_quien (nombre, categoria, oculta) VALUES (?, ?, 0)');
contenido.transaction(() => {
  const vistas = new Set();
  for (const [categoria, entradas] of Object.entries(seedSiglas)) {
    for (const [sigla, respuesta, alternativas = []] of entradas) {
      if (vistas.has(sigla)) throw new Error(`Sigla duplicada en el seed: ${sigla}`);
      vistas.add(sigla);
      insertarSigla.run(sigla, respuesta, JSON.stringify(alternativas), categoria);
    }
  }
  const nombres = new Set();
  for (const [categoria, lista] of Object.entries(seedQuienEsQuien)) {
    for (const nombre of lista) {
      if (nombres.has(nombre)) throw new Error(`Nombre duplicado en seed de Quién es Quién: ${nombre}`);
      nombres.add(nombre);
      insertarQQ.run(nombre, categoria);
    }
  }
})();

export default db;
