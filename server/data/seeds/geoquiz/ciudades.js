// server/data/seeds/geoquiz/ciudades.js — Ciudades y capitales
import { R, O, E, P, ORD } from './_tipos.js';

export default {
  id: 'ciudades',
  nombre: 'Ciudades y capitales',
  icono: 'landmark',
  preguntas: [
    // Capitales del mundo
    R('Capitales del mundo', '¿Cuál es la capital de Islandia?', 'Reikiavik|Reykjavik'),
    R('Capitales del mundo', '¿Cuál es la capital de Etiopía?', 'Adís Abeba|Addis Abeba|Addis Ababa'),
    R('Capitales del mundo', '¿Cuál es la capital de Vietnam?', 'Hanói|Hanoi'),
    R('Capitales del mundo', '¿Cuál es la capital de Mongolia?', 'Ulán Bator|Ulaanbaatar'),
    R('Capitales del mundo', '¿Cuál es la capital de Kenia?', 'Nairobi'),
    R('Capitales del mundo', '¿Cuál es la capital de Filipinas?', 'Manila'),
    R('Capitales del mundo', '¿Cuál es la capital de Noruega?', 'Oslo'),
    R('Capitales del mundo', '¿Cuál es la capital de Colombia?', 'Bogotá'),
    R('Capitales del mundo', '¿Cuál es la capital de Brasil?', 'Brasilia', 'Río de Janeiro fue la capital hasta 1960.'),
    R('Capitales del mundo', '¿Cuál es la capital de Suiza?', 'Berna'),

    // Capitales por inicial
    E('Capitales por inicial', 'Capitales europeas que empiezan por B', [
      'Berlín', 'Bruselas', 'Berna', 'Budapest', 'Bucarest', 'Belgrado', 'Bratislava'
    ]),
    E('Capitales por inicial', 'Capitales del mundo que empiezan por L', [
      'Lima', 'Lisboa', 'Londres', 'Luanda', 'Lusaka', 'Libreville', 'Lilongüe|Lilongwe', 'Lomé', 'Liubliana|Ljubljana',
      'La Paz', 'La Habana', 'Luxemburgo'
    ]),

    // Ciudades singulares
    R('Ciudades singulares', '¿Qué gran ciudad está repartida entre Europa y Asia, a ambos lados del Bósforo?', 'Estambul|Istanbul'),
    O('Ciudades más pobladas', '¿Cuál de estas ciudades tiene más habitantes en su área metropolitana?', 'Tokio', ['París', 'Londres', 'Madrid']),
    ORD('Ciudades más pobladas', 'Ordena estas ciudades por población del área metropolitana', ['Tokio', 'Ciudad de México', 'Londres', 'Madrid', 'Lisboa'], 'de más a menos habitantes'),

    // Monumentos y ciudades
    R('Monumentos y ciudades', '¿En qué ciudad está la Puerta de Brandeburgo?', 'Berlín'),
    R('Monumentos y ciudades', '¿En qué ciudad está la Ópera con forma de velas de barco más famosa del mundo?', 'Sídney|Sydney'),
    R('Monumentos y ciudades', '¿En qué ciudad está el Cristo Redentor?', 'Río de Janeiro|Rio'),
    R('Monumentos y ciudades', '¿En qué ciudad está el Kremlin más famoso?', 'Moscú'),
    R('Monumentos y ciudades', '¿En qué ciudad está la Alhambra?', 'Granada'),
    R('Monumentos y ciudades', '¿En qué ciudad está el Taj Mahal?', 'Agra'),

    // Gentilicios de ciudades
    R('Gentilicios', '¿De qué ciudad es un «porteño»?', 'Buenos Aires'),
    R('Gentilicios', '¿De qué ciudad es un «carioca»?', 'Río de Janeiro|Rio'),
    R('Gentilicios', '¿De qué ciudad es un «tapatío»?', 'Guadalajara'),
    R('Gentilicios', '¿De qué ciudad es un «moscovita»?', 'Moscú'),
    R('Gentilicios', '¿De qué ciudad es un «limeño»?', 'Lima'),
    R('Gentilicios', '¿De qué ciudad es un «caraqueño»?', 'Caracas'),

    // Norte o sur
    O('Norte o sur', '¿Qué ciudad está más al norte?', 'Roma', ['Nueva York'], 'Roma está a 41,9º N y Nueva York a 40,7º N.'),
    O('Norte o sur', '¿Qué ciudad está más al norte?', 'París', ['Seattle'], 'París está a 48,9º N y Seattle a 47,6º N.'),
    O('Norte o sur', '¿Qué ciudad está más al norte?', 'Londres', ['Calgary']),
    O('Norte o sur', '¿Qué ciudad está más al sur?', 'Buenos Aires', ['Ciudad del Cabo'], 'Buenos Aires está a 34,6º S y Ciudad del Cabo a 33,9º S.'),
    O('Norte o sur', '¿Qué ciudad está más al norte?', 'Nueva York', ['Madrid']),

    // Ciudad por pistas
    P('Ciudad por pistas', [
      'Está en Europa',
      'Está construida sobre más de 100 islas',
      'No hay coches en su centro histórico',
      'Es famosa por sus góndolas',
      'Es la capital de la región del Véneto'
    ], 'Venecia'),
    P('Ciudad por pistas', [
      'Está en Asia',
      'Fue capital de su país durante más de mil años',
      'Tiene unos 1.600 templos budistas',
      'Su barrio de Gion es famoso por las geishas',
      'Está en Japón y no es Tokio'
    ], 'Kioto|Kyoto'),
    P('Ciudad por pistas', [
      'Está en América',
      'No es la capital de su país',
      'Se la conoce como «la Gran Manzana»',
      'Tiene un gran parque llamado Central Park',
      'En ella está la Estatua de la Libertad'
    ], 'Nueva York|New York'),
    P('Ciudad por pistas', [
      'Está en Europa',
      'Es la capital de una comunidad autónoma',
      'Tiene un templo en obras desde 1882',
      'Su arquitecto más famoso es Gaudí',
      'Su paseo más famoso son las Ramblas'
    ], 'Barcelona')
  ]
};
