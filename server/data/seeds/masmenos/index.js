// server/data/seeds/masmenos/index.js
// Categorías de «Entre dos aguas»: en cada una se comparan dos elementos por la misma magnitud.
import geo1 from './geografia1.js';
import geo2 from './geografia2.js';
import hist1 from './historia1.js';
import hist2 from './historia2.js';
import ciencia from './ciencia.js';
import cine from './cine.js';
import cultura from './cultura.js';
import deportes from './deportes.js';
import economia from './economia.js';
import musica from './musica.js';
import naturaleza from './naturaleza.js';
import tecnologia from './tecnologia.js';

export const CATEGORIAS = {
  geografia: { nombre: 'Países y población', icono: 'globe', emoji: '🌍', pregunta: '¿Qué país tiene más habitantes?', data: [...geo1, ...geo2] },
  historia: { nombre: 'Historia', icono: 'hourglass', emoji: '📜', pregunta: '¿Qué pasó más tarde?', data: [...hist1, ...hist2] },
  cine: { nombre: 'Cine y taquilla', icono: 'clapperboard', emoji: '🎬', pregunta: '¿Qué película recaudó más?', data: cine },
  musica: { nombre: 'Canciones', icono: 'music', emoji: '🎵', pregunta: '¿Qué canción es más reciente?', data: musica },
  deportes: { nombre: 'Estadios', icono: 'trophy', emoji: '🏟️', pregunta: '¿Qué estadio tiene más aforo?', data: deportes },
  ciencia: { nombre: 'Puntos de fusión', icono: 'flask', emoji: '🧪', pregunta: '¿Qué se funde a más temperatura?', data: ciencia },
  economia: { nombre: 'Economía (PIB)', icono: 'chart', emoji: '💰', pregunta: '¿Qué país tiene más PIB?', data: economia },
  tecnologia: { nombre: 'Tecnología', icono: 'chip', emoji: '💻', pregunta: '¿Qué salió más tarde?', data: tecnologia },
  naturaleza: { nombre: 'Animales veloces', icono: 'paw', emoji: '🐆', pregunta: '¿Qué animal es más rápido?', data: naturaleza },
  cultura: { nombre: 'Monumentos y edificios', icono: 'tower', emoji: '🗼', pregunta: '¿Qué es más alto?', data: cultura }
};
