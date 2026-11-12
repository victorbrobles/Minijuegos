// client/src/games/limites.js
// Número de jugadores que admite cada juego. Es la única fuente de verdad: la usan
// el servidor (salas online), los selectores de un dispositivo, las fichas y los textos.
//
// - `min`/`max`: límites del juego. Son los mismos en un dispositivo y online.
// - Si `min` es 1, en un dispositivo se puede jugar solo, pero online hacen falta al menos 2.
// - `local`/`online` permiten fijar límites distintos para un modo (solo el Mus los usa).

export const LIMITES = {
  bingoball: { min: 2, max: 16 },
  trayectoria: { min: 1, max: 10 },
  traiciones: { min: 4, max: 12 },
  fundadores: { min: 3, max: 9 },
  coleccion: { min: 3, max: 8 },
  golpe: { min: 3, max: 8 },
  sumacero: { min: 3, max: 10 },
  invento: { min: 2, max: 20 },
  director: { min: 2, max: 10 },
  musavanzado: { min: 3, max: 8 },
  datosobra: { min: 1, max: 12 },
  pareja: { min: 1, max: 12 },
  tablero: { min: 2, max: 12 },
  hemeroteca: { min: 1, max: 12 },
  acta: { min: 1, max: 12 },
  oncefantasma: { min: 1, max: 12 },
  unapieza: { min: 2, max: 6 },
  laberinto: { min: 2, max: 8 },
  minotauro: { min: 2, max: 8 },
  constructores: { min: 2, max: 8 },
  mus: { min: 1, max: 4, local: { min: 1, max: 1 }, online: { min: 4, max: 4 } },
  reinos: { min: 2, max: 8 },
  cuentas: { min: 2, max: 10 },
  descarte: { min: 3, max: 12 },
  lobos: { min: 7, max: 14 },
  impostor: { min: 4, max: 20 },
  conecta: { min: 3, max: 12 },
  buscaminas: { min: 2, max: 8 },
  'quien-es-quien': { min: 2, max: 20 },
  rasgos: { min: 1, max: 12 },
  adivina: { min: 1, max: 12 },
  cancion: { min: 1, max: 12 },
  frasescelebres: { min: 1, max: 12 },
  colores: { min: 2, max: 16 },
  siglas: { min: 1, max: 1 },
  rankings: { min: 1, max: 12 },
  aproximacion: { min: 3, max: 20 },
  velocidad: { min: 1, max: 12 },
  rapidfire: { min: 3, max: 16 },
  pistas: { min: 2, max: 12 },
  ubicacion: { min: 3, max: 12 },
  masmenos: { min: 1, max: 10 },
  conoce: { min: 4, max: 20 },
  ciegas: { min: 3, max: 12 },
  unoadiez: { min: 2, max: 16 },
  quienmas: { min: 3, max: 16 },
  telepatia: { min: 4, max: 20 },
  confianzaciega: { min: 3, max: 16 },
  popular: { min: 1, max: 12 },
  logos: { min: 1, max: 12 },
  hipotesis: { min: 3, max: 10 },
  trescientosuno: { min: 1, max: 8 },
  jugadores: { min: 1, max: 16 },
  furbo: { min: 3, max: 12 },
  futbolgrid: { min: 2, max: 6 },
  footballsplit: { min: 2, max: 12 },
  jugadas: { min: 1, max: 12 },
  cuatroclubes: { min: 2, max: 12 },
  geoquiz: { min: 3, max: 12 },
  verdaderofalso: { min: 1, max: 1 },
  pecera: { min: 1, max: 1 },
  criptohacker: { min: 1, max: 1 },
  anomalias: { min: 1, max: 1 },
  trinchera: { min: 1, max: 1 },
  ovejas: { min: 1, max: 1 },
  segundero: { min: 1, max: 1 },
  encadenada: { min: 1, max: 1 },
  mapamentiroso: { min: 1, max: 1 },
  ordenalos: { min: 1, max: 1 },
  excusas: { min: 1, max: 1 },
  semaforo: { min: 1, max: 1 },
  untrazo: { min: 1, max: 1 },
  escondite: { min: 3, max: 12 },
  lapiz: { min: 2, max: 12 },
  eco: { min: 1, max: 1 },
  crimen: { min: 1, max: 1 },
  fichajes: { min: 1, max: 10 },
  ponorden: { min: 1, max: 12 },
  intruso: { min: 1, max: 10 }
};

function base(id) {
  const l = LIMITES[id];
  if (!l) throw new Error(`Juego sin límites de jugadores: ${id}`);
  return l;
}

// Límites para jugar en un solo dispositivo.
export function limitesLocal(id) {
  const l = base(id);
  return l.local ? { ...l.local } : { min: l.min, max: l.max };
}

// Límites de las salas online: nunca menos de 2 personas.
export function limitesOnline(id) {
  const l = base(id);
  if (l.online) return { ...l.online };
  return { min: Math.max(2, l.min), max: l.max };
}

// Texto corto para fichas y menús: «2 a 8 jugadores», «1 jugador», «Online: 4 · Un dispositivo: 1».
export function textoJugadores(id) {
  const l = base(id);
  if (l.local || l.online) {
    const o = limitesOnline(id);
    const lo = limitesLocal(id);
    return `Online: ${rango(o.min, o.max)} · Un dispositivo: ${rango(lo.min, lo.max)}`;
  }
  return rango(l.min, l.max);
}

export function rango(min, max) {
  if (min === max) return `${min} ${min === 1 ? 'jugador' : 'jugadores'}`;
  return `${min} a ${max} jugadores`;
}

// Frase para las salas online: «de 2 a 8 jugadores».
export function textoSala(id) {
  const o = limitesOnline(id);
  return o.min === o.max ? `${o.min} jugadores` : `de ${o.min} a ${o.max} jugadores`;
}
