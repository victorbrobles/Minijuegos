// client/src/games/Cancion/audioPlayerCancion.js

let reproductorActual = null;
let temporizadorCorte = null;
let intervaloProgreso = null;

// Contexto y nodos de la Web Audio API para compatibilidad móvil
let audioContext = null;
let gainNode = null;
let sourceNode = null;

// Rango de volumen interno (desde un 0.1% casi inaudible hasta el 45% máximo)
const VOL_INICIAL = 0.001;
const VOL_MAX_MEDIO = 0.45;
const DURACION_TOTAL = 30;

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
  const clampedVol = Math.min(VOL_MAX_MEDIO, Math.max(VOL_INICIAL, volumen));

  // 1. Modulación por Web Audio API (imprescindible en móviles iOS y Android)
  if (gainNode && gainNode.gain) {
    if (audioContext && audioContext.currentTime) {
      gainNode.gain.cancelScheduledValues(audioContext.currentTime);
      gainNode.gain.setValueAtTime(clampedVol, audioContext.currentTime);
    } else {
      gainNode.gain.value = clampedVol;
    }
  }

  // 2. Modulación clásica como fallback para navegadores de escritorio
  if (reproductorActual) {
    try {
      reproductorActual.volume = clampedVol;
    } catch (_) {}
  }
}

export function reproducirConRampa(urlAudio, onTickSegundos, onTerminar) {
  detenerReproduccion();

  if (!urlAudio) {
    console.warn('No se proporcionó URL de audio para reproducir.');
    return;
  }

  const audio = new Audio();
  // Permite que Web Audio API procese el audio sin restricciones de origen
  audio.crossOrigin = 'anonymous';
  audio.src = urlAudio;
  audio.preload = 'auto';
  reproductorActual = audio;

  // Configuración de la cadena Web Audio API
  const ctx = obtenerAudioContext();
  if (ctx) {
    try {
      sourceNode = ctx.createMediaElementSource(audio);
      gainNode = ctx.createGain();
      gainNode.gain.value = VOL_INICIAL;
      sourceNode.connect(gainNode);
      gainNode.connect(ctx.destination);
    } catch (e) {
      console.warn('Fallback a audio estándar:', e);
    }
  }

  aplicarGanancia(VOL_INICIAL);

  let segundosRestantes = DURACION_TOTAL;
  if (onTickSegundos) onTickSegundos(segundosRestantes);

  audio.play()
    .then(() => {
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const intervaloMs = 100;
      let tickActual = 0;

      intervaloProgreso = setInterval(() => {
        tickActual += 1;
        const tiempoTranscurrido = (tickActual * intervaloMs) / 1000;
        const segundosEnterosRestantes = Math.max(0, Math.ceil(DURACION_TOTAL - tiempoTranscurrido));

        const progreso = Math.min(1, tiempoTranscurrido / DURACION_TOTAL);
        // Curva cúbica (t^3) para una subida suave y progresiva
        const factorCurva = Math.pow(progreso, 3);
        const nuevoVolumen = VOL_INICIAL + (VOL_MAX_MEDIO - VOL_INICIAL) * factorCurva;

        aplicarGanancia(nuevoVolumen);

        if (tickActual % (1000 / intervaloMs) === 0) {
          if (onTickSegundos) onTickSegundos(segundosEnterosRestantes);
        }

        if (tiempoTranscurrido >= DURACION_TOTAL) {
          detenerReproduccion();
          if (onTerminar) onTerminar();
        }
      }, intervaloMs);

      temporizadorCorte = setTimeout(() => {
        detenerReproduccion();
        if (onTerminar) onTerminar();
      }, DURACION_TOTAL * 1000);
    })
    .catch((error) => {
      console.error('Error al reproducir audio:', error);
    });
}

export function pausarAudio() {
  if (reproductorActual) {
    try {
      reproductorActual.pause();
    } catch (_) {}
  }
  if (intervaloProgreso) {
    clearInterval(intervaloProgreso);
    intervaloProgreso = null;
  }
}

export function reanudarAudio() {
  const ctx = obtenerAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  if (reproductorActual) {
    try {
      reproductorActual.play().catch(() => {});
    } catch (_) {}
  }
}

export function detenerReproduccion() {
  if (intervaloProgreso) {
    clearInterval(intervaloProgreso);
    intervaloProgreso = null;
  }
  if (temporizadorCorte) {
    clearTimeout(temporizadorCorte);
    temporizadorCorte = null;
  }
  if (reproductorActual) {
    try {
      reproductorActual.pause();
      reproductorActual.currentTime = 0;
    } catch (_) {}
    reproductorActual = null;
  }
  if (sourceNode) {
    try {
      sourceNode.disconnect();
    } catch (_) {}
    sourceNode = null;
  }
  if (gainNode) {
    try {
      gainNode.disconnect();
    } catch (_) {}
    gainNode = null;
  }
}