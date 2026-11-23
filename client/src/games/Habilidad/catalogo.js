// client/src/games/Habilidad/catalogo.js
// Datos de cada minijuego que también necesita el servidor (sin 3D): si gana el valor alto o el bajo y su duración.
export const CATALOGO = [
  ['cruzar', 'mas', 60], ['apilar', 'mas', 90], ['secuencia', 'mas', 120], ['semaforo', 'menos', 40], ['diana', 'mas', 30],
  ['diez', 'menos', 130], ['equilibrio', 'mas', 40], ['laberinto', 'menos', 120], ['topos', 'mas', 30], ['contar', 'mas', 75],
  ['parejas', 'menos', 90], ['saltar', 'mas', 60], ['meteoritos', 'mas', 45], ['canasta', 'mas', 45], ['ritmo', 'mas', 30],
  ['corte', 'menos', 90], ['circulo', 'mas', 90], ['numeros', 'menos', 60], ['frenada', 'menos', 75], ['petanca', 'menos', 60],
  ['stroop', 'mas', 30], ['encajar', 'mas', 240], ['pesca', 'mas', 40], ['trileros', 'mas', 150], ['veloz', 'mas', 25],
  ['ascensor', 'mas', 60], ['serpiente', 'mas', 60], ['sprint', 'menos', 40], ['cambio', 'mas', 75], ['cuchillos', 'mas', 60],
  ['toques', 'mas', 90], ['vuelo', 'mas', 120], ['anillos', 'mas', 120], ['vaso', 'menos', 75], ['ladrillos', 'mas', 60],
  ['bolos', 'mas', 75], ['penaltis', 'mas', 90], ['fruta', 'mas', 40], ['orbita', 'mas', 120], ['martillo', 'mas', 60]
].map(([id, mejor, duracion]) => ({ id, mejor, duracion }));
export const IDS = CATALOGO.map((j) => j.id);
export const DATOS = Object.fromEntries(CATALOGO.map((j) => [j.id, j]));
export const OPCIONES_N = [3, 5, 8, 10, 15, 20, 30, 40];
