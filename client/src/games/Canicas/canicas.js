// client/src/games/Canicas/canicas.js
// Las canicas: cada una con su habilidad. Los números ajustan la física (aceleración, velocidad punta, agarre, masa).
export const CANICAS = {
  cometa: { nombre: 'Cometa', emoji: '☄️', color: 0xf97316, habilidad: 'Velocidad punta más alta.', acel: 1, vmax: 1.12, agarre: 1, masa: 1 },
  roca: { nombre: 'Roca', emoji: '🪨', color: 0x78716c, habilidad: 'Pesada: empuja a las demás y casi no la mueven los choques.', acel: 0.92, vmax: 1, agarre: 1, masa: 2.4 },
  saltarina: { nombre: 'Saltarina', emoji: '🐸', color: 0x22c55e, habilidad: 'Puede saltar (botón ⤴) cada 4 segundos.', acel: 1, vmax: 1, agarre: 1, masa: 1, salto: true },
  iman: { nombre: 'Imán', emoji: '🧲', color: 0xef4444, habilidad: 'Atrae las cajas de objetos desde lejos.', acel: 1, vmax: 1, agarre: 1, masa: 1, iman: true },
  fantasma: { nombre: 'Fantasma', emoji: '👻', color: 0xe2e8f0, habilidad: 'Atraviesa a las demás canicas y las manchas de aceite.', acel: 0.97, vmax: 1, agarre: 1, masa: 1, fantasma: true },
  turbina: { nombre: 'Turbina', emoji: '🚀', color: 0x3b82f6, habilidad: 'Sale con un turbo y los turbos le duran el doble.', acel: 1, vmax: 1, agarre: 1, masa: 1, turbo: true },
  garra: { nombre: 'Garra', emoji: '🦎', color: 0xa855f7, habilidad: 'Máximo agarre: gira sin derrapar (y en el hielo).', acel: 1.08, vmax: 0.98, agarre: 1.7, masa: 1 },
  recargable: { nombre: 'Batería', emoji: '🔋', color: 0xfacc15, habilidad: 'Recibe un objeto gratis cada 15 segundos.', acel: 1, vmax: 1, agarre: 1, masa: 1, recarga: true }
};
export const IDS_CANICAS = Object.keys(CANICAS);

export const OBJETOS = {
  turbo: { emoji: '🚀', nombre: 'Turbo', desc: 'Acelerón durante 2 segundos' },
  aceite: { emoji: '🛢️', nombre: 'Aceite', desc: 'Deja una mancha detrás: quien la pise derrapa' },
  rayo: { emoji: '⚡', nombre: 'Rayo', desc: 'Frena 2,5 s a todas las que van por delante' },
  escudo: { emoji: '🛡️', nombre: 'Escudo', desc: 'Te protege del próximo rayo o mancha' },
  muelle: { emoji: '🌀', nombre: 'Muelle', desc: 'Un gran salto (para atajar… o caerte)' }
};
export const IDS_OBJETOS = Object.keys(OBJETOS);
/** Objeto al azar: quien va detrás tiene más opciones de rayo y turbo. */
export function sortearObjeto(posicion, total, azar = Math.random) {
  const atras = total > 1 ? (posicion - 1) / (total - 1) : 0.5;
  const pesos = { turbo: 2 + atras * 3, aceite: 3 - atras * 1.5, rayo: atras * 3, escudo: 2, muelle: 1.5 };
  const suma = Object.values(pesos).reduce((a, b) => a + b, 0);
  let r = azar() * suma;
  for (const [k, w] of Object.entries(pesos)) { r -= w; if (r <= 0) return k; }
  return 'turbo';
}
