// server/lib/replica.js
// La base de datos de la gente: un archivo SQLite local (rápido y sin depender de la red) + copia de seguridad.
//
//  1. Al arrancar se abre el archivo local. Si no existe (disco nuevo en Render) o está dañado, se recupera de Turso
//     y, si Turso no responde, de la última copia en fichero. Si nada funciona, la web arranca igualmente.
//  2. Cada cambio en una tabla queda apuntado por un disparador en el diario `_cambios` (tabla + fila).
//  3. Un proceso en segundo plano sube el diario a Turso en lotes (una transacción por lote) cada pocos segundos.
//     Si Turso falla se reintenta con esperas crecientes: los cambios no se pierden, esperan en el diario.
//  4. Cada 6 horas se guarda una copia completa con VACUUM INTO en server/data/copias (se conservan las 8 últimas).
//  5. Al apagar el servidor (despliegue, reinicio) se sube lo pendiente antes de salir: ver cerrarDatos().
//
// Seguridad de los datos de Turso: solo se suben cambios si la base local salió de ESTE Turso (o se creó vacía
// sabiendo que Turso estaba vacío). Si al arrancar Turso no responde y no hay datos locales, se trabaja en modo
// temporal SIN subir nada, para no pisar con filas nuevas las que ya hay en Turso; al siguiente arranque se recupera.
import Database from 'libsql';
import { createClient } from '@libsql/client';
import { existsSync, mkdirSync, readdirSync, renameSync, statSync, unlinkSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RUTA = process.env.DB_PATH ?? fileURLToPath(new URL('../data/minigames.db', import.meta.url));
const EN_MEMORIA = RUTA === ':memory:';
const DIR_COPIAS = process.env.DB_COPIAS ?? join(dirname(EN_MEMORIA ? fileURLToPath(new URL('../data/x', import.meta.url)) : RUTA), 'copias');
const TURSO_URL = process.env.TURSO_DATABASE_URL?.trim();
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN?.trim();
const COPIAS_A_GUARDAR = 8;
const CADA_COPIA_MS = 6 * 60 * 60 * 1000;
const LOTE = 1500;

const sinMeta = (f) => { if (f && typeof f === 'object') delete f._metadata; return f; };
const q = (nombre) => `"${String(nombre).replace(/"/g, '""')}"`;
const esTablaPropia = (n) => !/^(sqlite_|_|libsql_)/.test(n);

export const estadoDatos = {
  archivo: EN_MEMORIA ? 'memoria' : RUTA,
  origen: null,            // de dónde salieron los datos al arrancar
  turso: TURSO_URL ? 'pendiente' : 'sin configurar',
  subiendo: Boolean(TURSO_URL),
  pendientes: 0,
  ultimaSubida: null,
  ultimoError: null,
  ultimaCopia: null,
  copias: []
};

let local = null;
let remota = null;

function aplicarAjustes(b) {
  // WAL: lecturas y escrituras a la vez sin bloquearse; NORMAL: seguro ante cuelgues del proceso y mucho más rápido
  for (const p of ['journal_mode = WAL', 'synchronous = NORMAL', 'busy_timeout = 5000', 'temp_store = MEMORY', 'cache_size = -16000']) {
    try { b.exec(`PRAGMA ${p}`); } catch { /* en memoria algunos no aplican */ }
  }
}
function abrirArchivo(ruta) {
  const b = new Database(ruta);
  const ok = sinMeta(b.prepare('PRAGMA quick_check').get());
  if (!ok || Object.values(ok)[0] !== 'ok') { b.close(); throw new Error('el archivo está dañado'); }
  aplicarAjustes(b);
  return b;
}
const marca = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
function apartar(ruta, motivo) {
  for (const extra of ['', '-wal', '-shm']) {
    if (existsSync(ruta + extra)) { try { renameSync(ruta + extra, `${ruta}.${motivo}-${marca()}${extra}`); } catch { /* nada */ } }
  }
}
const tieneDatos = (ruta) => existsSync(ruta) && statSync(ruta).size > 0;

/* ───────── Leer y escribir el «quién soy» de la réplica ───────── */
function meta(b, clave, valor) {
  b.exec('CREATE TABLE IF NOT EXISTS _replica (clave TEXT PRIMARY KEY, valor TEXT)');
  if (valor === undefined) return sinMeta(b.prepare('SELECT valor FROM _replica WHERE clave = ?').get(clave))?.valor ?? null;
  b.prepare('INSERT OR REPLACE INTO _replica (clave, valor) VALUES (?, ?)').run(clave, String(valor));
  return valor;
}
// Identifica la base de Turso sin guardar el token (solo la URL, sin parámetros)
const idTurso = () => (TURSO_URL || '').split('?')[0];

/* ───────── Restaurar desde Turso a un archivo nuevo ───────── */
const valorLocal = (v) => {
  if (v instanceof ArrayBuffer) return Buffer.from(v).toString('base64'); // la app no guarda binarios
  if (typeof v === 'bigint') return Number(v);
  return v;
};
async function restaurarDeTurso(ruta) {
  const tmp = `${ruta}.restaurando`;
  for (const extra of ['', '-wal', '-shm']) if (existsSync(tmp + extra)) unlinkSync(tmp + extra);
  const b = new Database(tmp);
  try {
    const esquema = (await remota.execute("SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL AND type IN ('table', 'index') ORDER BY type DESC")).rows;
    const tablas = esquema.filter((r) => r.type === 'table' && esTablaPropia(r.name));
    let filas = 0;
    for (const t of tablas) b.exec(t.sql);
    for (const t of tablas) {
      let desde = -Infinity;
      for (;;) {
        const rs = await remota.execute({ sql: `SELECT rowid AS "__rid", * FROM ${q(t.name)} WHERE rowid > ? ORDER BY rowid LIMIT 5000`, args: [desde === -Infinity ? -9e15 : desde] });
        if (!rs.rows.length) break;
        const cols = rs.columns.filter((c) => c !== '__rid');
        const ins = b.prepare(`INSERT OR REPLACE INTO ${q(t.name)} (rowid, ${cols.map(q).join(', ')}) VALUES (${['?', ...cols.map(() => '?')].join(', ')})`);
        b.transaction(() => { for (const r of rs.rows) ins.run(valorLocal(r.__rid), ...cols.map((c) => valorLocal(r[c]))); })();
        filas += rs.rows.length;
        desde = Number(rs.rows[rs.rows.length - 1].__rid);
        if (rs.rows.length < 5000) break;
      }
    }
    for (const i of esquema.filter((r) => r.type === 'index' && esTablaPropia(r.name))) { try { b.exec(i.sql); } catch { /* índice de una tabla interna */ } }
    meta(b, 'turso', idTurso());
    meta(b, 'restaurada', new Date().toISOString());
    b.close();
    renameSync(tmp, ruta);
    console.log(`[datos] Recuperados de Turso: ${tablas.length} tablas, ${filas} filas.`);
    return filas;
  } catch (e) {
    try { b.close(); } catch { /* nada */ }
    for (const extra of ['', '-wal', '-shm']) if (existsSync(tmp + extra)) try { unlinkSync(tmp + extra); } catch { /* nada */ }
    throw e;
  }
}

function ultimaCopia() {
  if (!existsSync(DIR_COPIAS)) return null;
  const l = readdirSync(DIR_COPIAS).filter((f) => f.endsWith('.db')).sort();
  return l.length ? join(DIR_COPIAS, l[l.length - 1]) : null;
}

/** Abre la base de la gente. Nunca falla: en el peor caso devuelve una base en memoria. */
export async function abrirDatos() {
  if (TURSO_URL) remota = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
  if (EN_MEMORIA) { local = new Database(':memory:'); estadoDatos.origen = 'memoria'; estadoDatos.subiendo = false; return local; }
  mkdirSync(dirname(RUTA), { recursive: true });

  // ¿El archivo local sirve?
  let sirve = false;
  if (tieneDatos(RUTA)) {
    try {
      const b = abrirArchivo(RUTA);
      const deTurso = meta(b, 'turso');
      // Con Turso, el archivo solo vale si salió de esa misma base de Turso (si no, se aparta y se descarga)
      if (TURSO_URL && deTurso !== idTurso()) { b.close(); apartar(RUTA, 'antigua'); console.warn('[datos] El archivo local no salió de este Turso: se aparta y se descarga de Turso.'); }
      else { local = b; sirve = true; estadoDatos.origen = 'archivo local'; }
    } catch (e) {
      console.error(`[datos] ⚠️ El archivo local no se puede usar (${e.message}): se aparta.`);
      apartar(RUTA, 'danada');
    }
  }

  // Si no, de Turso (3 intentos)…
  if (!sirve && remota) {
    for (let intento = 1; intento <= 3 && !sirve; intento++) {
      try {
        await restaurarDeTurso(RUTA);
        local = abrirArchivo(RUTA); sirve = true; estadoDatos.origen = 'Turso'; estadoDatos.turso = 'ok';
      } catch (e) {
        console.error(`[datos] No se pudo descargar de Turso (intento ${intento}/3): ${e.message}`);
        estadoDatos.ultimoError = e.message;
        if (intento < 3) await new Promise((r) => setTimeout(r, 1500 * intento));
      }
    }
    if (!sirve) {
      // Turso no responde: se arranca SIN subir nada a Turso (no se pisa lo que tiene). Se recupera al reiniciar.
      estadoDatos.subiendo = false;
      estadoDatos.turso = 'sin conexión al arrancar';
      console.error('[datos] ⚠️ Turso no responde: se trabaja en modo temporal (lo de ahora no se subirá a Turso).');
    }
  }

  // …o de la última copia en fichero
  if (!sirve) {
    const copia = ultimaCopia();
    if (copia) {
      try {
        const destino = remota ? `${RUTA}.temporal` : RUTA;
        if (existsSync(destino)) apartar(destino, 'previa');
        copyFileSync(copia, destino);
        local = abrirArchivo(destino); sirve = true; estadoDatos.origen = `copia ${copia.split(/[\\/]/).pop()}`;
        if (remota) estadoDatos.archivo = destino;
        console.warn(`[datos] Recuperado de la copia ${copia}.`);
      } catch (e) { console.error(`[datos] La copia ${copia} tampoco sirve: ${e.message}`); }
    }
  }

  // …o vacía
  if (!sirve) {
    try {
      const destino = remota && !estadoDatos.subiendo ? `${RUTA}.temporal` : RUTA;
      if (existsSync(destino)) apartar(destino, 'previa');
      local = abrirArchivo(destino); estadoDatos.archivo = destino;
      // Base nueva y vacía con Turso accesible y vacío: sí se puede subir (no hay nada que pisar)
      if (remota && estadoDatos.subiendo) meta(local, 'turso', idTurso());
      estadoDatos.origen = 'nueva (vacía)';
    } catch (e) {
      console.error(`[datos] ⚠️ No se puede crear el archivo (${e.message}): los datos solo se guardan en memoria.`);
      local = new Database(':memory:'); estadoDatos.origen = 'memoria'; estadoDatos.subiendo = false;
    }
  }
  // Base nueva sin Turso configurado: queda marcada como «local» para que, si un día se configura Turso, se descargue
  if (!remota) try { if (!meta(local, 'turso')) meta(local, 'turso', 'local'); } catch { /* nada */ }

  local.exec('CREATE TABLE IF NOT EXISTS _cambios (id INTEGER PRIMARY KEY AUTOINCREMENT, tabla TEXT NOT NULL, fila INTEGER NOT NULL)');
  return local;
}

/* ───────── Diario de cambios: disparadores en cada tabla ───────── */
const tablasConDiario = new Set();
function prepararDiario() {
  const tablas = local.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((r) => sinMeta(r).name).filter(esTablaPropia);
  const nuevas = tablas.filter((t) => !tablasConDiario.has(t));
  for (const t of nuevas) {
    const lit = `'${t.replace(/'/g, "''")}'`;
    const n = (s) => q(`_rep_${t}_${s}`);
    local.exec(`
      CREATE TRIGGER IF NOT EXISTS ${n('i')} AFTER INSERT ON ${q(t)} BEGIN INSERT INTO _cambios (tabla, fila) VALUES (${lit}, NEW.rowid); END;
      CREATE TRIGGER IF NOT EXISTS ${n('u')} AFTER UPDATE ON ${q(t)} BEGIN
        INSERT INTO _cambios (tabla, fila) SELECT ${lit}, OLD.rowid WHERE OLD.rowid IS NOT NEW.rowid;
        INSERT INTO _cambios (tabla, fila) VALUES (${lit}, NEW.rowid); END;
      CREATE TRIGGER IF NOT EXISTS ${n('d')} AFTER DELETE ON ${q(t)} BEGIN INSERT INTO _cambios (tabla, fila) VALUES (${lit}, OLD.rowid); END;
    `);
    tablasConDiario.add(t);
  }
  return nuevas;
}

/* ───────── Mantener en Turso las mismas tablas y columnas ───────── */
const columnasEnTurso = new Map(); // tabla -> Set de columnas
async function igualarEsquema() {
  const remotas = new Map((await remota.execute("SELECT name, sql FROM sqlite_master WHERE type = 'table'")).rows.map((r) => [r.name, r.sql]));
  const tablas = local.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'table'").all().map(sinMeta).filter((r) => esTablaPropia(r.name));
  for (const t of tablas) {
    if (!remotas.has(t.name)) {
      // Tabla nueva: se crea en Turso y se sube entera
      await remota.execute(t.sql.replace(/^CREATE TABLE\s+(IF NOT EXISTS\s+)?/i, 'CREATE TABLE IF NOT EXISTS '));
      local.prepare(`INSERT INTO _cambios (tabla, fila) SELECT ?, rowid FROM ${q(t.name)}`).run(t.name);
      console.log(`[datos] Tabla nueva en Turso: ${t.name}`);
    }
    const enLocal = local.prepare(`PRAGMA table_info(${q(t.name)})`).all().map((c) => sinMeta(c).name);
    let enRemoto = columnasEnTurso.get(t.name);
    if (!enRemoto || enLocal.some((c) => !enRemoto.has(c))) {
      enRemoto = new Set((await remota.execute(`PRAGMA table_info(${q(t.name)})`)).rows.map((c) => c.name));
      for (const c of local.prepare(`PRAGMA table_info(${q(t.name)})`).all().map(sinMeta)) {
        if (enRemoto.has(c.name)) continue;
        const def = c.dflt_value != null ? ` DEFAULT ${c.dflt_value}` : '';
        await remota.execute(`ALTER TABLE ${q(t.name)} ADD COLUMN ${q(c.name)} ${c.type || ''}${def}`);
        enRemoto.add(c.name);
        console.log(`[datos] Columna nueva en Turso: ${t.name}.${c.name}`);
      }
      columnasEnTurso.set(t.name, enRemoto);
    }
  }
  // Índices que falten (no es grave si alguno no se puede crear)
  const idxRemotos = new Set((await remota.execute("SELECT name FROM sqlite_master WHERE type = 'index'")).rows.map((r) => r.name));
  for (const i of local.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL").all().map(sinMeta)) {
    if (esTablaPropia(i.name) && !idxRemotos.has(i.name)) { try { await remota.execute(i.sql); } catch { /* nada */ } }
  }
}

/* ───────── Subir el diario a Turso ───────── */
let esquemaListo = false;
let subiendoAhora = null;
let espera = 3000;
let temporizador = null;
async function subirLote() {
  const pend = local.prepare('SELECT id, tabla, fila FROM _cambios ORDER BY id LIMIT ?').all(LOTE).map(sinMeta);
  if (!pend.length) return 0;
  // Si una fila cambió varias veces, basta con subir cómo está ahora
  const ultimo = new Map();
  for (const c of pend) ultimo.set(`${c.tabla}\u0000${c.fila}`, c);
  const orden = [...ultimo.values()].sort((a, b) => a.id - b.id);
  const sentencias = [];
  for (const c of orden) {
    if (!tablasConDiario.has(c.tabla)) continue; // tabla borrada
    let fila = null;
    try { fila = sinMeta(local.prepare(`SELECT rowid AS "__rid", * FROM ${q(c.tabla)} WHERE rowid = ?`).get(c.fila)); } catch { continue; }
    if (fila) {
      const cols = Object.keys(fila).filter((k) => k !== '__rid');
      sentencias.push({ sql: `INSERT OR REPLACE INTO ${q(c.tabla)} (rowid, ${cols.map(q).join(', ')}) VALUES (${['?', ...cols.map(() => '?')].join(', ')})`, args: [c.fila, ...cols.map((k) => fila[k])] });
    } else {
      sentencias.push({ sql: `DELETE FROM ${q(c.tabla)} WHERE rowid = ?`, args: [c.fila] });
    }
  }
  if (sentencias.length) await remota.batch(sentencias, 'write'); // todo el lote o nada
  local.prepare('DELETE FROM _cambios WHERE id <= ?').run(pend[pend.length - 1].id);
  return pend.length;
}
async function subir() {
  if (!remota || !estadoDatos.subiendo) return;
  if (subiendoAhora) return subiendoAhora;
  subiendoAhora = (async () => {
    try {
      const nuevas = prepararDiario();
      if (!esquemaListo || nuevas.length) { await igualarEsquema(); esquemaListo = true; }
      let n;
      do { n = await subirLote(); } while (n === LOTE);
      estadoDatos.turso = 'ok'; estadoDatos.ultimaSubida = new Date().toISOString(); estadoDatos.ultimoError = null;
      espera = 3000;
    } catch (e) {
      if (estadoDatos.turso !== 'error') console.error(`[datos] ⚠️ No se pudo subir a Turso (se reintentará; la web sigue funcionando): ${e.message}`);
      estadoDatos.turso = 'error'; estadoDatos.ultimoError = e.message;
      if (/no such (table|column)|has no column/i.test(e.message)) { esquemaListo = false; columnasEnTurso.clear(); }
      espera = Math.min(espera * 2, 60_000);
    } finally {
      try { estadoDatos.pendientes = sinMeta(local.prepare('SELECT COUNT(*) AS n FROM _cambios').get()).n; } catch { /* nada */ }
      subiendoAhora = null;
    }
  })();
  return subiendoAhora;
}
function programar() {
  clearTimeout(temporizador);
  temporizador = setTimeout(async () => { await subir(); programar(); }, espera);
  temporizador.unref();
}

/* ───────── Copias en fichero ───────── */
export function hacerCopia() {
  if (!local || estadoDatos.origen === 'memoria') return null;
  try {
    mkdirSync(DIR_COPIAS, { recursive: true });
    let destino = join(DIR_COPIAS, `minigames-${marca()}.db`);
    for (let n = 2; existsSync(destino); n++) destino = join(DIR_COPIAS, `minigames-${marca()}-${n}.db`); // dos en el mismo segundo
    local.exec(`VACUUM INTO '${destino.replace(/'/g, "''")}'`);
    const todas = readdirSync(DIR_COPIAS).filter((f) => /^minigames-.*\.db$/.test(f)).sort();
    for (const f of todas.slice(0, Math.max(0, todas.length - COPIAS_A_GUARDAR))) { try { unlinkSync(join(DIR_COPIAS, f)); } catch { /* nada */ } }
    estadoDatos.ultimaCopia = new Date().toISOString();
    estadoDatos.copias = todas.slice(-COPIAS_A_GUARDAR);
    return destino;
  } catch (e) {
    console.error(`[datos] No se pudo guardar la copia: ${e.message}`);
    return null;
  }
}

/** Se llama cuando ya están creadas todas las tablas (tras cargar las rutas). */
export function arrancarCopias() {
  prepararDiario();
  if (remota && estadoDatos.subiendo) { subir(); programar(); }
  setTimeout(hacerCopia, 10 * 60 * 1000).unref();
  setInterval(hacerCopia, CADA_COPIA_MS).unref();
  try { estadoDatos.copias = existsSync(DIR_COPIAS) ? readdirSync(DIR_COPIAS).filter((f) => f.endsWith('.db')).sort().slice(-COPIAS_A_GUARDAR) : []; } catch { /* nada */ }
}

/** Antes de apagar: sube lo pendiente (como mucho `ms`) y deja el archivo bien cerrado. */
export async function cerrarDatos(ms = 8000) {
  clearTimeout(temporizador);
  if (remota && estadoDatos.subiendo) {
    await Promise.race([(async () => { await subiendoAhora; await subir(); })(), new Promise((r) => setTimeout(r, ms))]);
  }
  try { local.exec('PRAGMA wal_checkpoint(TRUNCATE)'); } catch { /* nada */ }
}

/** Fuerza una subida inmediata (pruebas y panel de administración). */
export const subirAhora = () => subir();

/* ───────── Panel de administración: copias guardadas y restaurar una ───────── */
const NOMBRE_COPIA = /^minigames-[\w.-]+\.db$/;
/** Copias en fichero que hay ahora (de la más nueva a la más vieja). */
export function listarCopias() {
  try {
    if (!existsSync(DIR_COPIAS)) return [];
    return readdirSync(DIR_COPIAS).filter((f) => NOMBRE_COPIA.test(f)).sort().reverse()
      .map((f) => { const st = statSync(join(DIR_COPIAS, f)); return { nombre: f, bytes: st.size, fecha: st.mtimeMs }; });
  } catch { return []; }
}
/** Ruta de una copia (solo si el nombre es de una copia de verdad). */
export function rutaCopia(nombre) {
  if (!NOMBRE_COPIA.test(String(nombre)) || nombre.includes('..')) return null;
  const r = join(DIR_COPIAS, nombre);
  return existsSync(r) ? r : null;
}
/**
 * Vuelve a dejar los datos como estaban en una copia, sin apagar la web. Antes guarda una copia de cómo está ahora
 * (por si hay que deshacerlo). Cada tabla se vacía y se rellena con la de la copia (mismas filas y mismo rowid);
 * los disparadores del diario apuntan esos cambios, así que Turso se actualiza solo. Las tablas que no estaban en la
 * copia (más nuevas) no se tocan.
 */
export function restaurarCopia(nombre) {
  const ruta = rutaCopia(nombre);
  if (!ruta) return { ok: false, error: 'Esa copia no existe.' };
  if (!local || estadoDatos.origen === 'memoria') return { ok: false, error: 'La base de datos está en memoria: no hay nada que restaurar.' };
  const seguridad = hacerCopia();
  if (!seguridad) return { ok: false, error: 'No se pudo guardar la copia de seguridad previa: no se restaura nada.' };
  const tablas = [];
  local.exec(`ATTACH DATABASE '${ruta.replace(/'/g, "''")}' AS copia`);
  try {
    const enCopia = new Set(local.prepare("SELECT name FROM copia.sqlite_master WHERE type = 'table'").all().map((r) => sinMeta(r).name).filter(esTablaPropia));
    const enLocal = local.prepare("SELECT name FROM main.sqlite_master WHERE type = 'table'").all().map((r) => sinMeta(r).name).filter(esTablaPropia);
    local.exec('BEGIN');
    try {
      for (const t of enLocal) {
        if (!enCopia.has(t)) continue;
        const cols = (b) => new Set(local.prepare(`PRAGMA ${b}.table_info(${q(t)})`).all().map((c) => sinMeta(c).name));
        const deLocal = cols('main'); const comunes = [...cols('copia')].filter((c) => deLocal.has(c));
        if (!comunes.length) continue;
        const lista = comunes.map(q).join(', ');
        local.exec(`DELETE FROM main.${q(t)}`);
        local.exec(`INSERT INTO main.${q(t)} (rowid, ${lista}) SELECT rowid, ${lista} FROM copia.${q(t)}`);
        tablas.push(t);
      }
      local.exec('COMMIT');
    } catch (e) {
      try { local.exec('ROLLBACK'); } catch { /* nada */ }
      throw e;
    }
  } catch (e) {
    return { ok: false, error: `No se pudo restaurar: ${e.message}` };
  } finally {
    try { local.exec('DETACH DATABASE copia'); } catch { /* nada */ }
  }
  if (remota && estadoDatos.subiendo) subir();
  return { ok: true, tablas: tablas.length, seguridad: seguridad.split(/[\\/]/).pop() };
}
