// server/data/seeds/geoquiz/logica.js — Retos de lógica y deducción geográfica
import { R, O, E, P } from './_tipos.js';

export default {
  id: 'logica',
  nombre: 'Lógica y deducción',
  icono: 'bulb',
  preguntas: [
    // El intruso
    O('El intruso', 'Tres de estos países no tienen salida al mar. ¿Cuál sí la tiene?', 'Uruguay', ['Bolivia', 'Paraguay', 'Suiza']),
    O('El intruso', 'Tres de estos países son monarquías. ¿Cuál no lo es?', 'Finlandia', ['Noruega', 'Suecia', 'Dinamarca']),
    O('El intruso', 'Tres de estos países están en África. ¿Cuál no?', 'Surinam', ['Senegal', 'Somalia', 'Sudán']),
    O('El intruso', 'Tres de estos países limitan con Brasil. ¿Cuál no?', 'Chile', ['Perú', 'Bolivia', 'Colombia']),
    O('El intruso', 'Tres de estos países tienen el portugués como idioma oficial. ¿Cuál no?', 'Senegal', ['Angola', 'Mozambique', 'Cabo Verde']),
    O('El intruso', 'Tres de estos países son islas. ¿Cuál no?', 'Uruguay', ['Islandia', 'Madagascar', 'Sri Lanka']),

    // ¿Qué tienen en común?
    O('¿Qué tienen en común?', 'Bolivia, Paraguay, Suiza y Austria…', 'No tienen salida al mar', ['Son monarquías', 'Tienen dos capitales', 'Usan el euro']),
    O('¿Qué tienen en común?', 'Japón, Reino Unido, Australia e India…', 'Se conduce por la izquierda', ['Son islas', 'Tienen el inglés como única lengua', 'Son monarquías']),
    O('¿Qué tienen en común?', 'Canadá, Bélgica, Suiza y Camerún…', 'El francés es idioma oficial', ['No tienen costa', 'Tienen bandera roja', 'Son monarquías']),
    O('¿Qué tienen en común?', 'Lesoto, San Marino y la Ciudad del Vaticano…', 'Están completamente rodeados por un único país', ['Son islas', 'No tienen capital', 'Usan el euro']),
    O('¿Qué tienen en común?', 'Chile, Argentina, Australia y Sudáfrica…', 'Están en el hemisferio sur', ['Limitan con el Pacífico', 'Son monarquías', 'Tienen el mismo huso horario']),

    // Vecinos comunes
    E('Vecinos comunes', '¿Qué países limitan a la vez con Brasil y con Chile?', ['Argentina', 'Bolivia', 'Perú']),
    E('Vecinos comunes', '¿Qué países limitan a la vez con Alemania y con Francia?', ['Bélgica', 'Luxemburgo', 'Suiza']),
    E('Vecinos comunes', '¿Qué países limitan a la vez con China y con India?', ['Nepal', 'Bután', 'Pakistán', 'Myanmar|Birmania']),

    // Frontera común
    R('Frontera común', '¿Qué país limita a la vez con Perú, Brasil, Paraguay, Argentina y Chile?', 'Bolivia'),
    R('Frontera común', '¿Qué país limita a la vez con Francia, Alemania, Austria, Italia y Liechtenstein?', 'Suiza'),

    // Distancia
    O('Distancia', '¿Qué capital está más cerca de Madrid?', 'París', ['Roma', 'Londres', 'Berlín']),
    O('Distancia', '¿Qué capital está más cerca de Buenos Aires?', 'Montevideo', ['Santiago', 'Asunción', 'Lima']),
    O('Distancia', '¿Qué ciudad está más cerca de Nueva York?', 'Lisboa', ['Madrid', 'Roma', 'Moscú']),

    // País misterioso
    P('País misterioso', [
      'Está en Asia',
      'No tiene salida al mar',
      'Limita con China y con Pakistán',
      'Su capital es una de las más altas de Asia',
      'Su capital es Kabul'
    ], 'Afganistán'),
    P('País misterioso', [
      'Está en Europa',
      'No tiene salida al mar',
      'Limita con siete países',
      'El Danubio lo atraviesa de norte a sur',
      'Su capital es Budapest'
    ], 'Hungría'),
    P('País misterioso', [
      'Está en África',
      'Es atravesado por el ecuador',
      'Tiene costa en el océano Índico',
      'El monte Kenia está en su territorio',
      'Su capital es Nairobi'
    ], 'Kenia')
  ]
};
