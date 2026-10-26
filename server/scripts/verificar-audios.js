// server/scripts/verificar-audios.js
// Uso:  node server/scripts/verificar-audios.js
// Usa Deezer (~2-4 min). Guarda el progreso en
// audios-verificados.json, así que si lo interrumpes puedes volver a lanzarlo.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { CANCIONES as CANCIONES_BASE } from '../data/seeds/adivina/adivina.js';
import { buscarPreview } from '../routes/adivina.js';

// Uso con archivos concretos:  node verificar-audios.js ../data/seeds/adivina/canciones5.js ../data/seeds/adivina/canciones6.js
// Sin argumentos revisa todo el catálogo actual.
const extra = process.argv.slice(2);
let CANCIONES = CANCIONES_BASE;
if (extra.length) {
  CANCIONES = [];
  for (const f of extra) {
    const mod = await import(pathToFileURL(path.resolve(f)).href);
    for (const v of Object.values(mod)) if (Array.isArray(v)) CANCIONES.push(...v);
  }
}

const ARCHIVO = new URL('./audios-verificados.json', import.meta.url);
const hecho = fs.existsSync(ARCHIVO) ? JSON.parse(fs.readFileSync(ARCHIVO, 'utf8')) : {};
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

let i = 0;
for (const c of CANCIONES) {
  i++;
  if (hecho[c.id] === 'ok' || hecho[c.id] === 'falta') continue; // ya resuelto
  let estado;
  try {
    const url = await buscarPreview(c.titulo, c.artista, c.alias);
    estado = url ? 'ok' : 'falta';
  } catch (e) {
    estado = 'error'; // limitación/red: se reintentará en la próxima ejecución
  }
  hecho[c.id] = estado;
  fs.writeFileSync(ARCHIVO, JSON.stringify(hecho, null, 2));
  console.log(`[${i}/${CANCIONES.length}] ${estado.toUpperCase().padEnd(5)} ${c.id} · ${c.titulo} — ${c.artista}`);
  await esperar(estado === 'error' ? 10000 : 400);
}

const lista = (e) => CANCIONES.filter((c) => hecho[c.id] === e);
console.log(`\nOK: ${lista('ok').length} | SIN AUDIO: ${lista('falta').length} | ERROR (relanza): ${lista('error').length}`);
for (const c of lista('falta')) console.log(` - ${c.id}\t${c.titulo}\t(${c.artista}, ${c.año})`);