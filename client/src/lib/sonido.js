// client/src/lib/sonido.js
// Efectos de sonido y vibración de toda la web. Los sonidos se sintetizan con Web Audio (sin archivos):
// toque de botón, acierto, fallo, cambio de turno, pulsador, cuenta atrás, victoria, fin, logro y reacción.
// Las preferencias (sonido, vibración, toques, volumen) se guardan en este navegador.
import { useEffect, useState } from 'react';

const CLAVE = 'minijuegos_sonido';
const EVENTO = 'minijuegos-sonido-prefs';
const POR_DEFECTO = { sonido: true, vibracion: true, toques: true, volumen: 0.7 };

export function leerPreferencias() {
  try { return { ...POR_DEFECTO, ...(JSON.parse(localStorage.getItem(CLAVE)) || {}) }; } catch { return { ...POR_DEFECTO }; }
}
let prefs = typeof window === 'undefined' ? POR_DEFECTO : leerPreferencias();
export function guardarPreferencias(cambios) {
  prefs = { ...prefs, ...cambios };
  try { localStorage.setItem(CLAVE, JSON.stringify(prefs)); } catch { /* nada */ }
  window.dispatchEvent(new Event(EVENTO));
}
export function usePreferenciasSonido() {
  const [p, setP] = useState(prefs);
  useEffect(() => { const f = () => setP({ ...prefs }); window.addEventListener(EVENTO, f); return () => window.removeEventListener(EVENTO, f); }, []);
  return p;
}

/* ───────── Motor de audio ───────── */
let ctx = null;
let maestro = null;
function audio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    maestro = ctx.createGain();
    maestro.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}
/** Los navegadores solo dejan sonar tras un gesto del usuario: se «despierta» el audio en el primer toque. */
export function desbloquearAudio() { audio(); }

function nota(freq, inicio, dur, { tipo = 'sine', vol = 0.3, hasta = null, ataque = 0.008 } = {}) {
  const c = audio(); if (!c) return;
  const t = c.currentTime + inicio;
  const osc = c.createOscillator(); const g = c.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, t);
  if (hasta) osc.frequency.exponentialRampToValueAtTime(hasta, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + ataque);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(maestro);
  osc.start(t); osc.stop(t + dur + 0.02);
}
function ruido(inicio, dur, vol = 0.15, filtro = 1800) {
  const c = audio(); if (!c) return;
  const t = c.currentTime + inicio;
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = c.createBufferSource(); src.buffer = buf;
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = filtro;
  const g = c.createGain(); g.gain.value = vol;
  src.connect(f); f.connect(g); g.connect(maestro);
  src.start(t);
}

// Notas (Hz)
const N = { C4: 261.6, E4: 329.6, G4: 392, A4: 440, C5: 523.3, D5: 587.3, E5: 659.3, G5: 784, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1568, C7: 2093 };

const SONIDOS = {
  toque: { vib: 8, f: () => nota(1900, 0, 0.035, { tipo: 'triangle', vol: 0.07, ataque: 0.002 }) },
  acierto: { vib: [25], f: () => { nota(N.E5, 0, 0.12, { tipo: 'triangle', vol: 0.28 }); nota(N.A5, 0.09, 0.22, { tipo: 'triangle', vol: 0.28 }); } },
  fallo: { vib: [70, 40, 70], f: () => { nota(320, 0, 0.18, { tipo: 'square', vol: 0.09, hasta: 220 }); nota(200, 0.16, 0.3, { tipo: 'square', vol: 0.09, hasta: 130 }); } },
  turno: { vib: [60, 50, 60], f: () => { nota(N.C6, 0, 0.18, { vol: 0.22 }); nota(N.E6, 0.12, 0.18, { vol: 0.22 }); nota(N.G6, 0.24, 0.35, { vol: 0.22 }); } },
  pulsador: { vib: 140, f: () => { nota(180, 0, 0.28, { tipo: 'sawtooth', vol: 0.13 }); nota(182, 0, 0.28, { tipo: 'square', vol: 0.08 }); } },
  tic: { vib: 15, f: () => nota(1250, 0, 0.05, { tipo: 'square', vol: 0.07, ataque: 0.002 }) },
  ultimo: { vib: [40], f: () => nota(1650, 0, 0.09, { tipo: 'square', vol: 0.1, ataque: 0.002 }) },
  tiempo: { vib: [200], f: () => { nota(880, 0, 0.5, { tipo: 'square', vol: 0.1, hasta: 440 }); } },
  victoria: {
    vib: [80, 60, 80, 60, 250],
    f: () => {
      [N.C5, N.E5, N.G5, N.C6].forEach((n, i) => nota(n, i * 0.11, 0.2, { tipo: 'triangle', vol: 0.26 }));
      [N.C5, N.E5, N.G5, N.C6].forEach((n) => nota(n, 0.48, 0.8, { tipo: 'triangle', vol: 0.16 }));
      ruido(0.48, 0.5, 0.05, 6000);
    }
  },
  fin: { vib: [120], f: () => { [N.G4, N.E4, N.C4].forEach((n, i) => nota(n, i * 0.16, 0.3, { tipo: 'triangle', vol: 0.2 })); } },
  logro: { vib: [30, 40, 30, 40, 120], f: () => { [N.C6, N.E6, N.G6, N.C7].forEach((n, i) => nota(n, i * 0.07, 0.3, { vol: 0.18 })); ruido(0.05, 0.35, 0.04, 8000); } },
  reaccion: { vib: 12, f: () => nota(500, 0, 0.1, { vol: 0.16, hasta: 1100 }) },
  carta: { vib: 10, f: () => ruido(0, 0.08, 0.12, 2500) },
  dados: { vib: [20, 30, 20], f: () => { for (let i = 0; i < 5; i++) ruido(i * 0.06, 0.05, 0.1, 1200 + i * 300); } }
};
export const NOMBRES_SONIDOS = Object.keys(SONIDOS);

const ultimo = {};
/** Reproduce un efecto (y su vibración). `minimo`: ms mínimos entre dos iguales. */
export function sonar(nombre, { minimo = 60, vibrar: conVib = true } = {}) {
  const s = SONIDOS[nombre];
  if (!s) return;
  const ahora = Date.now();
  if (ahora - (ultimo[nombre] || 0) < minimo) return;
  ultimo[nombre] = ahora;
  try { window.dispatchEvent(new CustomEvent('minijuegos-sonido', { detail: nombre })); } catch { /* nada */ }
  if (prefs.sonido && prefs.volumen > 0) {
    try { audio(); if (maestro) maestro.gain.value = prefs.volumen; s.f(); } catch { /* sin audio */ }
  }
  if (conVib) vibrar(s.vib);
}
export function vibrar(patron) {
  if (!prefs.vibracion || !patron) return;
  try { navigator.vibrate?.(patron); } catch { /* no soportado (iPhone) */ }
}
export const puedeVibrar = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
export const prefsActuales = () => prefs;
