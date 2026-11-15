// server/lib/diario.js
// Retos diarios de juegos de un jugador: la misma partida para todos cada día (semilla = fecha de España),
// un solo intento por jugador y día, clasificación del día y racha de días seguidos.
import db from '../db.js';
import { partidaPalabra, partidaLetras } from './palabras.js';

db.exec(`CREATE TABLE IF NOT EXISTS diario_resultados (
  juego TEXT NOT NULL, dia TEXT NOT NULL, jugador TEXT NOT NULL, puntos REAL NOT NULL, resumen TEXT, fecha INTEGER NOT NULL,
  PRIMARY KEY (juego, dia, jugador))`);

/** Fecha de hoy en España, AAAA-MM-DD. */
export function diaDeHoy(t = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(t));
}
const diaAnterior = (dia) => { const d = new Date(`${dia}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10); };
/** Número entero estable a partir de un texto (para sembrar el azar). */
export function semillaDe(texto) { let h = 2166136261; for (const c of String(texto)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
export function rngSemilla(semilla) {
  let a = semilla >>> 0 || 1;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Qué partida toca hoy en cada juego (el cliente usa los mismos datos que en una partida normal)
export const JUEGOS_DIARIO = {
  palabra: { orden: 'desc', partida: (dia) => partidaPalabra(rngSemilla(semillaDe(`palabra:${dia}`))) },
  letras: { orden: 'desc', partida: (dia) => partidaLetras(rngSemilla(semillaDe(`letras:${dia}`))) },
  vialibre: { orden: 'desc', partida: (dia) => ({ semilla: semillaDe(`vialibre:${dia}`) }) }
};

const resultado = db.prepare('SELECT puntos, resumen, fecha FROM diario_resultados WHERE juego = ? AND dia = ? AND jugador = ?');
const guardar = db.prepare('INSERT INTO diario_resultados (juego, dia, jugador, puntos, resumen, fecha) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING');
const tabla = db.prepare('SELECT jugador, puntos, resumen, fecha FROM diario_resultados WHERE juego = ? AND dia = ? ORDER BY puntos DESC, fecha ASC LIMIT 50');
const cuantos = db.prepare('SELECT COUNT(*) AS n FROM diario_resultados WHERE juego = ? AND dia = ?');
const dias = db.prepare('SELECT dia FROM diario_resultados WHERE juego = ? AND jugador = ? ORDER BY dia DESC LIMIT 400');

/** Días seguidos jugados hasta hoy (o hasta ayer, si hoy aún no ha jugado). */
export function racha(juego, jugador, hoy = diaDeHoy()) {
  const set = new Set(dias.all(juego, jugador).map((r) => r.dia));
  let d = set.has(hoy) ? hoy : diaAnterior(hoy); let n = 0;
  while (set.has(d)) { n++; d = diaAnterior(d); }
  return n;
}
export function estadoDiario(juego, jugador) {
  const dia = diaDeHoy();
  const mio = jugador ? resultado.get(juego, dia, jugador) : null;
  const clasificacion = tabla.all(juego, dia);
  const puesto = mio ? clasificacion.findIndex((r) => r.jugador === jugador) + 1 || null : null;
  return { dia, intento: mio || null, puesto, jugadores: cuantos.get(juego, dia).n, clasificacion: clasificacion.slice(0, 20), racha: jugador ? racha(juego, jugador, dia) : 0 };
}
export function guardarDiario(juego, jugador, puntos, resumen) {
  const dia = diaDeHoy();
  const r = guardar.run(juego, dia, jugador, Number(puntos), String(resumen || '').slice(0, 80), Date.now());
  return r.changes > 0;
}
