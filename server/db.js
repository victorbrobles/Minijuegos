// server/db.js
// Bases de datos del servidor (SQLite con libSQL, que funciona igual que better-sqlite3):
//
//  · `db` (por defecto) — lo que genera la gente: cuentas, récords, grupos, retos, valoraciones, estadísticas…
//      Siempre se lee y se escribe en un archivo SQLite LOCAL (DB_PATH o server/data/minigames.db): es instantáneo,
//      aguanta mucha gente a la vez y no depende de la red. Encima, para que nada se pierda:
//      - Turso (con TURSO_DATABASE_URL y TURSO_AUTH_TOKEN): cada cambio se apunta en un diario (`_cambios`, por
//        disparadores) y en segundo plano se sube a Turso en lotes cada pocos segundos. Si Turso se cae, la web sigue
//        igual y los cambios esperan en el diario hasta que vuelva. Al arrancar en un disco vacío (Render tras un
//        despliegue o tras dormirse) se descarga todo de Turso antes de abrir. Ver server/lib/replica.js.
//      - Copias en fichero: cada 6 horas se guarda una copia completa en server/data/copias (se conservan 8). Si el
//        archivo local aparece dañado al arrancar, se aparta y se recupera de Turso o de la última copia.
//      - Si ni siquiera se puede abrir el archivo, se usa una base en memoria: la web funciona (sin guardar).
//  · `contenido` — siglas y personajes de «¿Quién es quién?». Salen de los archivos del proyecto y se cargan en
//      memoria en cada arranque: no hace falta guardarlos en ningún sitio.
import Database from 'libsql';
import seedSiglas from './data/seeds/siglas/siglas.seed.js';
import seedQuienEsQuien from './data/seeds/quienesquien/quienesquien.js';
import { abrirDatos } from './lib/replica.js';

// libSQL añade un campo «_metadata» a cada fila: se quita para que todo funcione (y se responda) igual que antes
export const limpiar = (fila) => { if (fila && typeof fila === 'object') delete fila._metadata; return fila; };
function envolver(base) {
  return new Proxy(base, {
    get(objetivo, clave) {
      if (clave === 'prepare') {
        return (sql) => {
          const st = objetivo.prepare(sql);
          return new Proxy(st, {
            get(s, m) {
              if (m === 'get') return (...a) => limpiar(s.get(...a));
              if (m === 'all') return (...a) => s.all(...a).map(limpiar);
              const v = s[m];
              return typeof v === 'function' ? v.bind(s) : v;
            }
          });
        };
      }
      const v = objetivo[clave];
      return typeof v === 'function' ? v.bind(objetivo) : v;
    }
  });
}

/* ───────── Datos de la gente ───────── */
const db = envolver(await abrirDatos());

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
