// client/src/games/Canicas/canicas.js
// Las canicas (cada una con su habilidad) y los objetos. Los números ajustan la física: aceleración, velocidad punta,
// agarre en las curvas, masa (choques), duración de los golpes y de los turbos.
export const CANICAS = {
  cometa: { nombre: 'Cometa', emoji: '☄️', color: 0xf97316, habilidad: 'La más rápida en recta, pero derrapa más en las curvas.', acel: 1, vmax: 1.08, agarre: 0.85, masa: 1 },
  roca: { nombre: 'Roca', emoji: '🪨', color: 0x78716c, habilidad: 'Pesada: aparta a las demás y los golpes la frenan la mitad.', acel: 0.9, vmax: 1, agarre: 1, masa: 2.6, dura: true },
  saltarina: { nombre: 'Saltarina', emoji: '🐸', color: 0x22c55e, habilidad: 'Puede saltar (botón ⤴) cada 3 s: salva huecos y esquiva aceite.', acel: 1, vmax: 0.98, agarre: 1, masa: 1, salto: true },
  iman: { nombre: 'Imán', emoji: '🧲', color: 0xef4444, habilidad: 'Atrae las cajas desde lejos y a veces saca dos objetos.', acel: 1, vmax: 1, agarre: 1, masa: 1, iman: true },
  fantasma: { nombre: 'Fantasma', emoji: '👻', color: 0xe2e8f0, habilidad: 'Atraviesa a las demás canicas y las manchas de aceite.', acel: 0.97, vmax: 1, agarre: 1, masa: 1, fantasma: true },
  turbina: { nombre: 'Turbina', emoji: '🚀', color: 0x3b82f6, habilidad: 'Sale con un turbo y sus turbos y miniturbos duran un 50 % más.', acel: 1, vmax: 0.99, agarre: 1, masa: 1, turbo: true },
  garra: { nombre: 'Garra', emoji: '🦎', color: 0xa855f7, habilidad: 'Máximo agarre: traza las curvas sin irse fuera (también en el hielo).', acel: 1.05, vmax: 0.97, agarre: 1.6, masa: 1 },
  recargable: { nombre: 'Batería', emoji: '🔋', color: 0xfacc15, habilidad: 'Recibe un objeto gratis cada 12 segundos.', acel: 1, vmax: 0.99, agarre: 1, masa: 1, recarga: true }
};
export const IDS_CANICAS = Object.keys(CANICAS);

export const OBJETOS = {
  turbo: { emoji: '🚀', nombre: 'Turbo', desc: 'Acelerón de 2 segundos' },
  triple: { emoji: '🚀', nombre: 'Triple turbo', desc: 'Tres turbos seguidos (uno por toque)', usos: 3 },
  misil: { emoji: '🎯', nombre: 'Misil', desc: 'Persigue a la canica que va justo delante y la hace girar' },
  aceite: { emoji: '🛢️', nombre: 'Aceite', desc: 'Deja una mancha detrás: quien la pise trompea' },
  rayo: { emoji: '⚡', nombre: 'Rayo', desc: 'Frena 3 s a todas las que van por delante' },
  escudo: { emoji: '🛡️', nombre: 'Escudo', desc: 'Te protege del próximo golpe (misil, rayo o aceite)' },
  muelle: { emoji: '🌀', nombre: 'Muelle', desc: 'Un gran salto: cruza huecos o atajos por el aire' },
  estrella: { emoji: '⭐', nombre: 'Estrella', desc: '6 s invencible y más rápida; aparta a quien toques' }
};
export const IDS_OBJETOS = Object.keys(OBJETOS);
/** Objeto al azar según el puesto: quien va delante recibe defensas; quien va detrás, objetos para remontar. */
export function sortearObjeto(posicion, total, azar = Math.random) {
  const atras = total > 1 ? (posicion - 1) / (total - 1) : 0.5; // 0 = primero, 1 = último
  const pesos = {
    turbo: 2.5, triple: atras * 2.5, misil: 0.6 + atras * 2.2, aceite: 3 - atras * 2.5, rayo: atras > 0.5 ? (atras - 0.5) * 2.5 : 0,
    escudo: 2.4 - atras * 1.6, muelle: 1.2, estrella: atras > 0.6 ? (atras - 0.6) * 4 : 0
  };
  const suma = Object.values(pesos).reduce((a, b) => a + b, 0);
  let r = azar() * suma;
  for (const [k, w] of Object.entries(pesos)) { r -= w; if (r <= 0) return k; }
  return 'turbo';
}
