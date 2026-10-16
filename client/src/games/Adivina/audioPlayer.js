let reproductorActual = null;
let temporizadorCorte = null;

/**
 * Reproduce el fragmento oficial durante exactamente 20 segundos
 */
export function reproducirClip(urlAudio, onTickSegundos, alTerminar) {
  detenerClip();

  if (!urlAudio) {
    if (alTerminar) alTerminar();
    return;
  }

  const audio = new Audio(urlAudio);
  reproductorActual = audio;
  audio.volume = 0.8;

  let segundosRestantes = 20;
  if (onTickSegundos) onTickSegundos(segundosRestantes);

  const intervaloReloj = setInterval(() => {
    segundosRestantes -= 1;
    if (onTickSegundos) onTickSegundos(Math.max(0, segundosRestantes));
    if (segundosRestantes <= 0) clearInterval(intervaloReloj);
  }, 1000);

  audio.play().catch(() => {
    clearInterval(intervaloReloj);
    if (alTerminar) alTerminar();
  });

  temporizadorCorte = setTimeout(() => {
    clearInterval(intervaloReloj);
    detenerClip();
    if (alTerminar) alTerminar();
  }, 20000);
}

export function detenerClip() {
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