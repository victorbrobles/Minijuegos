// server/lib/preguntasGrupo.js
// Preguntas propias de un grupo de amigos para los juegos de preguntas («¿Quién es más…?», «Conoce a tus amigos»).
// Al jugar se pueden usar solas o mezcladas con las normales.
import db from '../db.js';

export const JUEGOS_PREGUNTAS = {
  quienmas: { nombre: '¿Quién es más…?', ejemplo: '¿Quién es más probable que se duerma en la boda de Laura?' },
  conoce: { nombre: 'Conoce a tus amigos', ejemplo: '¿Cuál fue tu peor momento del viaje a Asturias?' }
};

db.exec(`
  CREATE TABLE IF NOT EXISTS grupo_preguntas (id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT NOT NULL, juego TEXT NOT NULL,
    texto TEXT NOT NULL, autor TEXT NOT NULL, creado INTEGER NOT NULL);
  CREATE INDEX IF NOT EXISTS idx_grupo_preguntas ON grupo_preguntas (codigo, juego);
`);
const deGrupo = db.prepare('SELECT texto FROM grupo_preguntas WHERE codigo = ? AND juego = ? ORDER BY id');

export const preguntasDelGrupo = (codigo, juego) => (codigo ? deGrupo.all(String(codigo).toUpperCase(), juego).map((p) => p.texto) : []);

const barajar = (l) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/**
 * Lista de preguntas ya barajada para una partida.
 * modo 'solo': solo las del grupo (si no hay, las normales). 'mezcla': una del grupo, una normal… mientras queden.
 */
export function combinarPreguntas(base, propias, modo) {
  const p = barajar([...new Set(propias)]);
  const b = barajar(base.filter((x) => !p.includes(x)));
  if (!p.length || !modo) return b;
  if (modo === 'solo') return p;
  const out = [];
  while (p.length || b.length) { if (p.length) out.push(p.shift()); if (b.length) out.push(b.shift()); }
  return out;
}

/** Lee { grupo, modo } que manda el cliente; devuelve null si no es válido. */
export function leerEleccion(x) {
  const codigo = String(x?.grupo || '').toUpperCase();
  const modo = x?.modo === 'solo' ? 'solo' : x?.modo === 'mezcla' ? 'mezcla' : null;
  return /^[A-Z0-9]{6}$/.test(codigo) && modo ? { codigo, modo } : null;
}
