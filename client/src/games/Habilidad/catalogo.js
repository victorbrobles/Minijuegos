// client/src/games/Habilidad/catalogo.js
// Datos de cada minijuego que también necesita el servidor (sin 3D): si gana el valor alto o el bajo y su duración.
export const CATALOGO = [
  ['cruzar', 'mas', 60], ['apilar', 'mas', 90], ['secuencia', 'mas', 120], ['semaforo', 'menos', 40], ['diana', 'mas', 30],
  ['diez', 'menos', 75], ['equilibrio', 'mas', 40], ['laberinto', 'menos', 90], ['topos', 'mas', 30], ['contar', 'mas', 75],
  ['parejas', 'menos', 90], ['saltar', 'mas', 60], ['meteoritos', 'mas', 45], ['canasta', 'mas', 30], ['ritmo', 'mas', 30],
  ['corte', 'menos', 60], ['circulo', 'mas', 60], ['numeros', 'menos', 60], ['frenada', 'menos', 40], ['petanca', 'menos', 60],
  ['stroop', 'mas', 30], ['encajar', 'mas', 60], ['pesca', 'mas', 40], ['trileros', 'mas', 75], ['veloz', 'mas', 25],
  ['ascensor', 'mas', 60], ['serpiente', 'mas', 60], ['sprint', 'menos', 40], ['cambio', 'mas', 75], ['cuchillos', 'mas', 60]
].map(([id, mejor, duracion]) => ({ id, mejor, duracion }));
export const IDS = CATALOGO.map((j) => j.id);
export const DATOS = Object.fromEntries(CATALOGO.map((j) => [j.id, j]));
export const OPCIONES_N = [3, 5, 8, 10, 15, 20, 30];
