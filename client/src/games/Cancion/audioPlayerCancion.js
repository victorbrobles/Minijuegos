// client/src/games/Cancion/audioPlayerCancion.js

let reproductorActual = null;
let intervaloProgreso = null;
let tickGlobal = null;
let terminarGlobal = null;
let tiempoRestante = 30;

let audioContext = null;
let gainNode = null;
let sourceNode = null;

const DURACION_TOTAL = 30; // Adaptado a 30 segundos
const VOL_INICIAL = 0.02;  // Ligeramente audible al principio
const VOL_MAX = 0.50;      // Volumen máximo

function obtenerAudioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioContext) {
    audioContext = new AudioCtx();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

function aplicarGanancia(volumen) {
  const clampedVol = Math.min(VOL_MAX, Math.max(VOL_INICIAL, volumen));
  
  // Fallback estándar 
  if (reproductorActual) {
    try { reproductorActual.volume = clampedVol; } catch (e) {}
  }

  // API Web Audio (Vital para controlar volumen en iOS/Android)
  if (gainNode && gainNode.gain) {
    if (audioContext && audioContext.currentTime) {
      gainNode.gain.cancelScheduledValues(audioContext.currentTime);
      gainNode.gain.setValueAtTime(clampedVol, audioContext.currentTime);
    } else {
      gainNode.gain.value = clampedVol;
    }
  }
}

export function reproducir(urlAudio, onTick, onTerminar) {
  detenerReproduccion();

  if (!urlAudio) {
    if (onTerminar) onTerminar();
    return;
  }

  // Es crítico establecer crossOrigin y volume ANTES que el src
  reproductorActual = new Audio();
  reproductorActual.crossOrigin = 'anonymous';
  reproductorActual.volume = VOL_INICIAL;
  reproductorActual.src = urlAudio;
  reproductorActual.preload = 'auto';

  const ctx = obtenerAudioContext();
  if (ctx) {
    try {
      sourceNode = ctx.createMediaElementSource(reproductorActual);
      gainNode = ctx.createGain();
      gainNode.gain.value = VOL_INICIAL;
      sourceNode.connect(gainNode);
      gainNode.connect(ctx.destination);
    } catch (e) {
      console.warn('CORS bloqueó WebAudio, usando fallback estándar:', e);
    }
  }

  tiempoRestante = DURACION_TOTAL;
  tickGlobal = onTick;
  terminarGlobal = onTerminar;

  if (tickGlobal) tickGlobal(tiempoRestante);

  reproductorActual.play().then(() => {
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(()=>{});
    iniciarIntervalo();
  }).catch((err) => {
    console.error("Error reproduciendo:", err);
    if (onTerminar) onTerminar();
  });
}

function iniciarIntervalo() {
  if (intervaloProgreso) clearInterval(intervaloProgreso);
  
  intervaloProgreso = setInterval(() => {
    if (!reproductorActual) return;

    // Calculamos el volumen en tiempo real basado en el currentTime exacto
    const current = reproductorActual.currentTime;
    const progreso = Math.min(1, current / DURACION_TOTAL);
    
    // Curva exponencial (2.5) para una sensación natural de tensión
    const factor = Math.pow(progreso, 2.5);
    const vol = VOL_INICIAL + (VOL_MAX - VOL_INICIAL) * factor;
    
    aplicarGanancia(vol);

    tiempoRestante = Math.max(0, Math.ceil(DURACION_TOTAL - current));
    if (tickGlobal) tickGlobal(tiempoRestante);

    if (current >= DURACION_TOTAL || reproductorActual.ended) {
      detenerReproduccion();
      if (terminarGlobal) terminarGlobal();
    }
  }, 100);
}

export function pausarAudio() {
  if (reproductorActual) {
    try { reproductorActual.pause(); } catch (e) {}
  }
  if (intervaloProgreso) {
    clearInterval(intervaloProgreso);
    intervaloProgreso = null;
  }
}

export function reanudarAudio() {
  if (reproductorActual && tiempoRestante > 0) {
    const ctx = obtenerAudioContext();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(()=>{});

    reproductorActual.play().then(() => {
      iniciarIntervalo();
    }).catch(() => {});
  }
}

export function reproducirOReanudar(urlAudio, onTick, onTerminar) {
  if (reproductorActual && reproductorActual.src === urlAudio && tiempoRestante > 0) {
    if (onTick) tickGlobal = onTick;
    if (onTerminar) terminarGlobal = onTerminar;
    reanudarAudio();
  } else {
    reproducir(urlAudio, onTick, onTerminar);
  }
}

export function detenerReproduccion() {
  if (intervaloProgreso) {
    clearInterval(intervaloProgreso);
    intervaloProgreso = null;
  }
  if (reproductorActual) {
    try {
      reproductorActual.pause();
      reproductorActual.currentTime = 0;
    } catch (_) {}
    reproductorActual = null;
  }
  if (sourceNode) {
    try { sourceNode.disconnect(); } catch (_) {}
    sourceNode = null;
  }
  if (gainNode) {
    try { gainNode.disconnect(); } catch (_) {}
    gainNode = null;
  }
}