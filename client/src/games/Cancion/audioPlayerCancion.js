// client/src/games/Cancion/audioPlayerCancion.js
// Reproductor de «Afina ese oído». El volumen depende de la posición dentro del fragmento
// (empieza casi inaudible y sube hasta el máximo a los 30 s), así que se puede saltar a
// cualquier punto (sincronización online) y el volumen siempre es el correcto.
// El audio llega desde nuestro servidor (/api/cancion/audio/…), así que Web Audio puede
// controlar el volumen también en iOS/Android.

export const DURACION_S = 30;
const VOL_INICIAL = 0.02;
const VOL_MAX = 0.6;

let audio = null;
let url = null;
let ctx = null;
let ganancia = null;
let fuente = null;
let intervalo = null;
let alTerminar = null;
let alTick = null;

export const volumenEn = (segundo) => {
  const p = Math.min(1, Math.max(0, segundo / DURACION_S));
  return VOL_INICIAL + (VOL_MAX - VOL_INICIAL) * Math.pow(p, 2.2);
};

function contexto() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function aplicarVolumen() {
  if (!audio) return;
  const v = volumenEn(audio.currentTime);
  if (ganancia) ganancia.gain.value = v;
  else audio.volume = v;
}

/** Desbloquea el audio del navegador (llamar dentro de un toque del usuario). */
export function desbloquearAudio() {
  const c = contexto();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
  try {
    const silencio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
    silencio.play().catch(() => {});
  } catch {
    /* nada */
  }
}

/** Prepara una canción (no suena hasta llamar a reproducirDesde). */
export function cargar(nuevaUrl, { onTick, onFin } = {}) {
  alTick = onTick || null;
  alTerminar = onFin || null;
  if (url === nuevaUrl && audio) return;
  detener();
  url = nuevaUrl;
  audio = new Audio();
  audio.preload = 'auto';
  audio.src = nuevaUrl;
  audio.volume = VOL_INICIAL;
  const c = contexto();
  if (c) {
    try {
      fuente = c.createMediaElementSource(audio);
      ganancia = c.createGain();
      ganancia.gain.value = VOL_INICIAL;
      fuente.connect(ganancia);
      ganancia.connect(c.destination);
    } catch {
      fuente = null;
      ganancia = null;
    }
  }
}

export function posicion() {
  return audio ? audio.currentTime : 0;
}

export const sonando = () => Boolean(audio && !audio.paused);

/**
 * Reproduce desde el segundo indicado. Devuelve una promesa que se resuelve a false si el
 * navegador ha bloqueado el sonido (hay que pedir un toque al usuario).
 */
export async function reproducirDesde(segundo = null) {
  if (!audio) return false;
  const c = contexto();
  if (c && c.state === 'suspended') await c.resume().catch(() => {});
  if (segundo != null && Math.abs(audio.currentTime - segundo) > 0.35) {
    try { audio.currentTime = Math.min(DURACION_S - 0.1, Math.max(0, segundo)); } catch { /* aún sin datos */ }
  }
  aplicarVolumen();
  try {
    await audio.play();
  } catch (e) {
    if (e?.name === 'NotAllowedError') return false;
  }
  clearInterval(intervalo);
  intervalo = setInterval(() => {
    if (!audio) return;
    aplicarVolumen();
    alTick?.(audio.currentTime);
    if (audio.currentTime >= DURACION_S || audio.ended) {
      pausar();
      alTerminar?.();
    }
  }, 100);
  return true;
}

export function pausar() {
  clearInterval(intervalo);
  intervalo = null;
  if (audio) {
    try { audio.pause(); } catch { /* nada */ }
  }
}

export function detener() {
  pausar();
  if (audio) {
    try { audio.removeAttribute('src'); audio.load(); } catch { /* nada */ }
  }
  try { fuente?.disconnect(); } catch { /* nada */ }
  try { ganancia?.disconnect(); } catch { /* nada */ }
  audio = null;
  url = null;
  fuente = null;
  ganancia = null;
}

/** Escucha si el audio no se puede cargar. */
export function alError(fn) {
  if (audio) audio.onerror = fn;
}
