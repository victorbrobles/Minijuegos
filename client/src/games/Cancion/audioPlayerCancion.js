// client/src/games/Cancion/audioPlayerCancion.js
let reproductorActual = null;
let temporizadorCorte = null;
let intervaloProgreso = null;

// Arranque en 0.1% (apenas un susurro) y tope medio cómodo al final (45%)
const VOL_INICIAL = 0.001;
const VOL_MAX_MEDIO = 0.45;
const DURACION_TOTAL = 30;

export function reproducirConRampa(urlAudio, onTickSegundos, onTerminar) {
  detenerReproduccion();

  if (!urlAudio) {
    console.warn('No se proporcionó URL de audio para reproducir.');
    return;
  }

  const audio = new Audio(urlAudio);
  reproductorActual = audio;

  // Fijar el volumen al mínimo antes de dar play
  audio.volume = VOL_INICIAL;

  let segundosRestantes = DURACION_TOTAL;
  if (onTickSegundos) onTickSegundos(segundosRestantes);

  audio.play()
    .then(() => {
      // Ajuste ultra-fino cada 100 ms (10 veces por segundo) para evitar cualquier salto
      const intervaloMs = 100;
      let tickActual = 0;

      intervaloProgreso = setInterval(() => {
        tickActual += 1;
        const tiempoTranscurrido = (tickActual * intervaloMs) / 1000;
        const segundosEnterosRestantes = Math.max(0, Math.ceil(DURACION_TOTAL - tiempoTranscurrido));

        const progreso = Math.min(1, tiempoTranscurrido / DURACION_TOTAL);
        
        // Curva cúbica (t^3): retraso drástico del volumen; los primeros 15s casi no se percibe
        const factorCurva = Math.pow(progreso, 3);
        const nuevoVolumen = VOL_INICIAL + (VOL_MAX_MEDIO - VOL_INICIAL) * factorCurva;

        if (reproductorActual) {
          reproductorActual.volume = Math.min(VOL_MAX_MEDIO, Math.max(VOL_INICIAL, nuevoVolumen));
        }

        // Notificar cada segundo cumplido al contador en pantalla
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
      console.error('Error al reproducir audio real:', error);
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
}