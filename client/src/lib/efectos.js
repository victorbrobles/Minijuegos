// client/src/lib/efectos.js
// Sonido y vibración automáticos en todos los juegos, sin tocar cada juego uno a uno:
// - Toque suave al pulsar botones.
// - Acierto / fallo: cuando aparece en pantalla un elemento marcado como acierto o fallo (clases tipo «acierto»,
//   «correcta», «fallo», «incorrecta»…).
// - Cambio de turno: cuando aparece «Te toca», «Pasa el móvil a…» o «Es tu turno».
// - Pulsador: cuando alguien pulsa en los juegos de pulsador.
// - Cuenta atrás: los últimos 5 segundos de los relojes con número.
// Victoria, fin de partida, logros y reacciones los lanzan registros.js, AvisoLogros y Reacciones.
import { sonar, desbloquearAudio, prefsActuales } from './sonido.js';

const ACIERTO = new Set(['acierto', 'acertada', 'acertado', 'correcta', 'correcto', 'exito', 'acierto-flash']);
const FALLO = new Set(['fallo', 'fallada', 'fallado', 'incorrecta', 'incorrecto', 'fracaso', 'no-acertado', 'fallo-flash']);
const tipoClase = (c) => {
  if (ACIERTO.has(c) || /-(acierto|exito|correcta|correcto)$/.test(c)) return 'acierto';
  if (FALLO.has(c) || /-(fallo|incorrecta|incorrecto|fracaso|perdida)$/.test(c)) return 'fallo';
  if (c === 'pulsa') return 'pulsador';
  return null;
};
const TURNO = /^(te toca|pasa el móvil a|pasa el movil a|es tu turno|tu turno)\b/i;
const RELOJ = /(tiempo|timer|cuenta|reloj|crono|segundo)/i;

let silencioHasta = 0; // tras la victoria o el fin, no se mezclan aciertos/fallos de la pantalla de resultados
export function silenciarFeedback(ms = 1500) { silencioHasta = Date.now() + ms; }

function enJuego(el) { return el && el.closest && el.closest('.game-shell'); }

function revisarTexto(nodo, hallado) {
  const w = document.createTreeWalker(nodo, NodeFilter.SHOW_TEXT);
  let n = 0;
  for (let t = w.nextNode(); t && n < 400; t = w.nextNode(), n++) {
    const x = t.data.trim();
    if (x.length > 2 && x.length < 60 && TURNO.test(x)) { hallado.turno = true; return; }
  }
}

function procesar(muts) {
  const hallado = { acierto: 0, fallo: 0, pulsador: 0, turno: false, tic: null };
  for (const m of muts) {
    if (m.type === 'attributes') {
      const el = m.target;
      if (!enJuego(el)) continue;
      const antes = new Set(String(m.oldValue || '').split(/\s+/));
      el.classList.forEach((c) => { if (!antes.has(c)) { const t = tipoClase(c); if (t) hallado[t] += 1; } });
    } else if (m.type === 'childList') {
      m.addedNodes.forEach((nodo) => {
        if (nodo.nodeType === 3) { // texto nuevo (relojes que cambian el número)
          const p = nodo.parentElement;
          if (p && enJuego(p)) revisarReloj(p, nodo.data, hallado);
          return;
        }
        if (nodo.nodeType !== 1 || !enJuego(nodo)) return;
        [nodo, ...nodo.querySelectorAll('[class]')].slice(0, 300).forEach((el) => el.classList?.forEach((c) => { const t = tipoClase(c); if (t) hallado[t] += 1; }));
        revisarTexto(nodo, hallado);
      });
    } else if (m.type === 'characterData') {
      const p = m.target.parentElement;
      if (p && enJuego(p)) revisarReloj(p, m.target.data, hallado);
    }
  }
  const ahora = Date.now();
  if (hallado.turno) sonar('turno', { minimo: 1500 });
  if (hallado.pulsador) sonar('pulsador', { minimo: 800 });
  if (ahora > silencioHasta) {
    // Si aparecen aciertos y fallos a la vez es una lista de resultados: no suena nada
    if (hallado.acierto && !hallado.fallo) sonar('acierto', { minimo: 350 });
    else if (hallado.fallo && !hallado.acierto) sonar('fallo', { minimo: 350 });
  }
  if (hallado.tic) sonar(hallado.tic, { minimo: 600 });
}

function revisarReloj(el, texto, hallado) {
  const m = /^\s*(\d{1,2})\s*s?\s*$/.exec(texto || '');
  if (!m) return;
  const n = Number(m[1]);
  if (n < 1 || n > 5) return;
  // El número tiene que estar en un reloj (por la clase del elemento o de su contenedor)
  const clases = `${el.className || ''} ${el.parentElement?.className || ''}`;
  if (typeof clases === 'string' && RELOJ.test(clases)) hallado.tic = n === 1 ? 'ultimo' : 'tic';
}

let instalado = false;
export function instalarEfectos() {
  if (instalado || typeof window === 'undefined') return;
  instalado = true;
  // Toque al pulsar botones (y despertar el audio, que los navegadores bloquean hasta el primer gesto)
  document.addEventListener('pointerdown', (e) => {
    desbloquearAudio();
    if (!prefsActuales().toques) return;
    const b = e.target.closest?.('button, [role="button"], a.game-card, .gc-link, input[type="checkbox"], input[type="radio"]');
    if (b && !b.disabled && !b.closest('.snd-panel')) sonar('toque', { minimo: 40 });
  }, { capture: true, passive: true });
  const obs = new MutationObserver(procesar);
  obs.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true, characterData: true });
}
