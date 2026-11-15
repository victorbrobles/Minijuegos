// client/src/games/modos.js
// Cómo se puede jugar cada juego (comprobado en sus menús): online (cada uno en su móvil) y/o en un solo móvil.
// Si añades un juego nuevo y no está aquí, se supone que tiene los dos modos.
const SOLO_ONLINE = ['bingoball', 'cuentas', 'golpe', 'oncefantasma', 'traiciones', 'transmision'];
const SOLO_LOCAL = ['anomalias', 'cadena', 'conexion', 'crimen', 'criptohacker', 'cronologia', 'duelofutbol', 'eco', 'encadenada', 'escalera', 'excusas', 'letras', 'manager', 'mapamentiroso', 'misterioso', 'onceperdido', 'ordenalos', 'ovejas', 'palabra', 'pecera', 'quiensoy', 'rascacielos', 'segundero', 'semaforo', 'siglas', 'trinchera', 'untrazo', 'verdaderofalso', 'vialibre'];
export const MODOS = new Proxy({}, {
  get: (_, id) => ({ online: !SOLO_LOCAL.includes(id), local: !SOLO_ONLINE.includes(id) })
});
