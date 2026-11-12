// client/src/games/rondas.js
// Rondas que se pueden elegir en cada juego (menú de un dispositivo y sala online). Única fuente de verdad:
// la usan el servidor (para validar la configuración) y los menús.
//
// - `opciones`: rondas totales de la partida.
// - `porJugador`: las opciones son multiplicadores del número de jugadores (×2 con 4 jugadores = 8 rondas).
// - `defecto`: opción marcada al abrir el menú (si no se indica, la del medio).
// - `unidad`: cómo se llama cada ronda en ese juego («partidas», «tableros»…).

export const RONDAS = {
  bingoball: { opciones: [1, 3, 5], unidad: 'partidas' },
  trayectoria: { opciones: [10, 15, 20] },
  golpe: { opciones: [3, 5, 7], unidad: 'misiones' },
  sumacero: { opciones: [3, 5, 7] },
  invento: { opciones: [4, 7, 10] },
  datosobra: { opciones: [2, 3, 4], porJugador: true },
  pareja: { opciones: [10, 15, 20] },
  hemeroteca: { opciones: [10, 15, 20] },
  acta: { opciones: [10, 15, 20] },
  oncefantasma: { opciones: [2, 3, 4], porJugador: true, unidad: 'onces' },
  unapieza: { opciones: [3, 4, 5] },
  cuentas: { opciones: [3, 5, 10], unidad: 'partidas' },
  descarte: { opciones: [1, 3, 5], unidad: 'tableros' },
  impostor: { opciones: [5, 8, 12] },
  conecta: { opciones: [2, 5, 8] },
  buscaminas: { opciones: [3, 6, 9] },
  rasgos: { opciones: [10, 15, 20] },
  adivina: { opciones: [10, 15, 20] },
  cancion: { opciones: [10, 15, 20], unidad: 'canciones' },
  frasescelebres: { opciones: [10, 15, 20] },
  colores: { opciones: [10, 15, 20] },
  rankings: { opciones: [2, 3, 4], porJugador: true },
  aproximacion: { opciones: [5, 10, 15] },
  velocidad: { opciones: [3, 5, 7] },
  rapidfire: { opciones: [3, 5, 7], porJugador: true },
  pistas: { opciones: [10, 15, 20] },
  ubicacion: { opciones: [5, 7, 10] },
  masmenos: { opciones: [5, 10, 15], unidad: 'turnos' },
  conoce: { opciones: [10, 15, 20] },
  ciegas: { opciones: [2, 3, 5], porJugador: true },
  unoadiez: { opciones: [2, 3, 5], porJugador: true, unidad: 'turnos' },
  quienmas: { opciones: [10, 15, 20] },
  telepatia: { opciones: [10, 15, 20] },
  confianzaciega: { opciones: [2, 3, 5], porJugador: true },
  popular: { opciones: [5, 10, 15] },
  logos: { opciones: [10, 15, 20], unidad: 'logos' },
  hipotesis: { opciones: [5, 10, 15] },
  trescientosuno: { opciones: [3, 5, 7], unidad: 'partidas' },
  jugadores: { opciones: [10, 15, 20] },
  furbo: { opciones: [2, 3, 5], porJugador: true },
  futbolgrid: { opciones: [3, 5, 7], unidad: 'partidas' },
  footballsplit: { opciones: [2, 3, 5], porJugador: true },
  jugadas: { opciones: [5, 10, 15], unidad: 'jugadas' },
  cuatroclubes: { opciones: [10, 15, 20] },
  geoquiz: { opciones: [2, 3, 5], porJugador: true }
};

function base(id) {
  const r = RONDAS[id];
  if (!r) throw new Error(`Juego sin rondas configurables: ${id}`);
  return r;
}

export const opcionesRondas = (id) => base(id).opciones;
export const rondasPorJugador = (id) => Boolean(base(id).porJugador);
export const unidadRondas = (id) => base(id).unidad || 'rondas';

export function rondasPorDefecto(id) {
  const r = base(id);
  return r.defecto ?? r.opciones[Math.floor(r.opciones.length / 2)];
}

/** Valor elegido válido (o el de por defecto). Para los juegos «por jugador» es el multiplicador. */
export function rondasValidas(id, valor, actual) {
  const r = base(id);
  const n = Number(valor);
  if (r.opciones.includes(n)) return n;
  if (r.opciones.includes(Number(actual))) return Number(actual);
  return rondasPorDefecto(id);
}

/** Rondas totales de la partida. */
export function totalRondas(id, valor, numJugadores = 1) {
  const v = rondasValidas(id, valor);
  return rondasPorJugador(id) ? v * Math.max(1, numJugadores) : v;
}

/** Texto de una opción: «10», o «×2 · 8 rondas» si va por jugador. */
export function textoOpcionRondas(id, valor, numJugadores) {
  if (!rondasPorJugador(id)) return `${valor} ${unidadRondas(id)}`;
  return numJugadores ? `×${valor} · ${valor * numJugadores} ${unidadRondas(id)}` : `${valor} por jugador`;
}
