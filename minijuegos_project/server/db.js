import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import seedSiglas from './data/seeds/siglas/siglas.seed.js';
import seedQuienEsQuien from './data/seeds/quienesquien/quienesquien.seed.js';

// El archivo de la base de datos se crea solo la primera vez que arranca el servidor.
const dbPath = process.env.DB_PATH
  ?? fileURLToPath(new URL('./data/minigames.db', import.meta.url));
mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.exec(`
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

// Bases de datos creadas antes de existir las categorías ocultas: añade la columna
if (!db.prepare('PRAGMA table_info(quienes_quien)').all().some((c) => c.name === 'oculta')) {
  db.exec('ALTER TABLE quienes_quien ADD COLUMN oculta INTEGER NOT NULL DEFAULT 0');
}

// Sincroniza siglas
const upsertSigla = db.prepare(`
  INSERT INTO siglas (sigla, respuesta, alternativas, categoria)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(sigla) DO UPDATE SET
    respuesta = excluded.respuesta,
    alternativas = excluded.alternativas,
    categoria = excluded.categoria
`);
const borrarSigla = db.prepare('DELETE FROM siglas WHERE sigla = ?');

// Sincroniza quién es quién
const upsertQQ = db.prepare(`
  INSERT INTO quienes_quien (nombre, categoria, oculta)
  VALUES (?, ?, ?)
  ON CONFLICT(nombre) DO UPDATE SET
    categoria = excluded.categoria,
    oculta = excluded.oculta
`);
const borrarQQ = db.prepare('DELETE FROM quienes_quien WHERE nombre = ?');

db.transaction(() => {
  // Seed Siglas
  const enSeedSiglas = new Set();
  for (const [categoria, entradas] of Object.entries(seedSiglas)) {
    for (const [sigla, respuesta, alternativas = []] of entradas) {
      if (enSeedSiglas.has(sigla)) throw new Error(`Sigla duplicada en el seed: ${sigla}`);
      enSeedSiglas.add(sigla);
      upsertSigla.run(sigla, respuesta, JSON.stringify(alternativas), categoria);
    }
  }
  for (const { sigla } of db.prepare('SELECT sigla FROM siglas').all()) {
    if (!enSeedSiglas.has(sigla)) borrarSigla.run(sigla);
  }

  // Seed QuienEsQuien
  const enSeedQQ = new Set();
  // Las filas que ya no están en el seed (p. ej. las antiguas categorías ocultas) se borran más abajo
  for (const [categoria, nombres] of Object.entries(seedQuienEsQuien)) {
    for (const nombre of nombres) {
      if (enSeedQQ.has(nombre)) throw new Error(`Nombre duplicado en seed de Quién es Quién: ${nombre}`);
      enSeedQQ.add(nombre);
      upsertQQ.run(nombre, categoria, 0);
    }
  }
  for (const { nombre } of db.prepare('SELECT nombre FROM quienes_quien').all()) {
    if (!enSeedQQ.has(nombre)) borrarQQ.run(nombre);
  }
})();

export default db;
