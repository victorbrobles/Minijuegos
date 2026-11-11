// server/data/seeds/tablero/preguntas.js
// «El Tablero de Puntos»: preguntas por categoría y valor. En `o`, la primera opción es la correcta (se barajan al jugar).

export const CATEGORIAS = [
  { id: 'cine', nombre: 'Cine', emoji: '🎬' },
  { id: 'historia', nombre: 'Historia', emoji: '🏛️' },
  { id: 'ciencia', nombre: 'Ciencia', emoji: '🔬' },
  { id: 'musica', nombre: 'Música', emoji: '🎵' },
  { id: 'deporte', nombre: 'Deporte', emoji: '⚽' },
  { id: 'geografia', nombre: 'Geografía', emoji: '🌍' }
];
export const VALORES = [100, 200, 300, 500];

const Q = (cat, v, p, o) => ({ cat, v, p, o });
import cine from './extra/cine.js';
import historia from './extra/historia.js';
import ciencia from './extra/ciencia.js';
import musica from './extra/musica.js';
import deporte from './extra/deporte.js';
import geografia from './extra/geografia.js';

export const PREGUNTAS = [
  // ---- Cine
  Q('cine', 100, '¿Cómo se llama el muñeco vaquero protagonista de «Toy Story»?', ['Woody', 'Buzz', 'Andy', 'Slinky']),
  Q('cine', 100, '¿Qué animal es Simba en «El rey león»?', ['Un león', 'Un tigre', 'Un leopardo', 'Un guepardo']),
  Q('cine', 100, '¿Qué saga tiene a Luke Skywalker como protagonista?', ['Star Wars', 'Star Trek', 'Dune', 'Alien']),
  Q('cine', 200, '¿Quién dirigió «Parque Jurásico»?', ['Steven Spielberg', 'James Cameron', 'George Lucas', 'Ridley Scott']),
  Q('cine', 200, '¿En qué película dice Terminator «Sayonara, baby»… en su versión española?', ['Terminator 2: el juicio final', 'Depredador', 'Desafío total', 'Mentiras arriesgadas']),
  Q('cine', 200, '¿Qué director español ganó el Óscar a mejor guion por «Hable con ella»?', ['Pedro Almodóvar', 'Alejandro Amenábar', 'Fernando Trueba', 'José Luis Garci']),
  Q('cine', 300, '¿Cuál fue la primera película española en ganar el Óscar a mejor película de habla no inglesa?', ['Volver a empezar', 'Belle Époque', 'Todo sobre mi madre', 'Mar adentro']),
  Q('cine', 300, '¿Cuántos Óscar ganó «Titanic»?', ['11', '9', '7', '14']),
  Q('cine', 300, '¿Qué actor interpreta a Jack Sparrow?', ['Johnny Depp', 'Orlando Bloom', 'Brad Pitt', 'Javier Bardem']),
  Q('cine', 500, '¿Qué película ganó el primer Óscar a mejor película, en 1929?', ['Alas', 'Amanecer', 'Metrópolis', 'El cantor de jazz']),
  Q('cine', 500, '¿Cómo se llama el trineo de «Ciudadano Kane»?', ['Rosebud', 'Xanadu', 'Charlie', 'Kane']),
  Q('cine', 500, '¿Quién compuso la música de «El bueno, el feo y el malo»?', ['Ennio Morricone', 'John Williams', 'Hans Zimmer', 'Nino Rota']),
  // ---- Historia
  Q('historia', 100, '¿En qué año llegó Colón a América?', ['1492', '1512', '1478', '1500']),
  Q('historia', 100, '¿Quién fue el primer hombre en pisar la Luna?', ['Neil Armstrong', 'Buzz Aldrin', 'Yuri Gagarin', 'Michael Collins']),
  Q('historia', 100, '¿En qué año cayó el Muro de Berlín?', ['1989', '1991', '1985', '1961']),
  Q('historia', 200, '¿Qué emperador francés fue derrotado en Waterloo?', ['Napoleón Bonaparte', 'Luis XIV', 'Napoleón III', 'Carlomagno']),
  Q('historia', 200, '¿En qué año se aprobó la Constitución española vigente?', ['1978', '1975', '1981', '1977']),
  Q('historia', 200, '¿Qué civilización construyó Machu Picchu?', ['La inca', 'La azteca', 'La maya', 'La olmeca']),
  Q('historia', 300, '¿Qué reyes firmaron las Capitulaciones de Santa Fe con Colón?', ['Los Reyes Católicos', 'Carlos I y Isabel de Portugal', 'Felipe II y María Tudor', 'Juan II y Blanca de Navarra']),
  Q('historia', 300, '¿En qué año empezó la Primera Guerra Mundial?', ['1914', '1918', '1912', '1939']),
  Q('historia', 300, '¿Quién era el faraón cuya tumba descubrió Howard Carter en 1922?', ['Tutankamón', 'Ramsés II', 'Keops', 'Akenatón']),
  Q('historia', 500, '¿En qué batalla de 1571 luchó y fue herido Miguel de Cervantes?', ['Lepanto', 'Pavía', 'San Quintín', 'Las Navas de Tolosa']),
  Q('historia', 500, '¿Qué tratado de 1494 repartió el Nuevo Mundo entre Castilla y Portugal?', ['Tordesillas', 'Utrecht', 'Westfalia', 'Los Pirineos']),
  Q('historia', 500, '¿Cuántos años duró la Guerra de los Cien Años?', ['116', '100', '99', '124']),
  // ---- Ciencia
  Q('ciencia', 100, '¿Cuál es el símbolo químico del agua?', ['H₂O', 'CO₂', 'O₂', 'HO']),
  Q('ciencia', 100, '¿Cuál es el planeta más grande del sistema solar?', ['Júpiter', 'Saturno', 'Neptuno', 'La Tierra']),
  Q('ciencia', 100, '¿Cuántas patas tiene una araña?', ['8', '6', '10', '12']),
  Q('ciencia', 200, '¿Qué científico formuló la teoría de la relatividad?', ['Albert Einstein', 'Isaac Newton', 'Niels Bohr', 'Galileo Galilei']),
  Q('ciencia', 200, '¿Cuál es el hueso más largo del cuerpo humano?', ['El fémur', 'La tibia', 'El húmero', 'El peroné']),
  Q('ciencia', 200, '¿Qué gas absorben las plantas en la fotosíntesis?', ['Dióxido de carbono', 'Oxígeno', 'Nitrógeno', 'Hidrógeno']),
  Q('ciencia', 300, '¿Cuál es el símbolo químico del oro?', ['Au', 'Ag', 'Or', 'Go']),
  Q('ciencia', 300, '¿Quién descubrió la penicilina?', ['Alexander Fleming', 'Louis Pasteur', 'Robert Koch', 'Santiago Ramón y Cajal']),
  Q('ciencia', 300, '¿A cuántos grados Fahrenheit hierve el agua a nivel del mar?', ['212', '100', '180', '232']),
  Q('ciencia', 500, '¿Cuál es el elemento químico más abundante del universo?', ['Hidrógeno', 'Helio', 'Oxígeno', 'Carbono']),
  Q('ciencia', 500, '¿Por qué ganó Santiago Ramón y Cajal el Nobel en 1906?', ['Por sus estudios del sistema nervioso', 'Por descubrir la estructura del ADN', 'Por la vacuna del cólera', 'Por sus estudios de la sangre']),
  Q('ciencia', 500, '¿Cuántos cromosomas tiene una célula humana normal?', ['46', '23', '48', '44']),
  // ---- Música
  Q('musica', 100, '¿Cómo se llamaba el grupo de John Lennon y Paul McCartney?', ['The Beatles', 'The Rolling Stones', 'The Who', 'Queen']),
  Q('musica', 100, '¿Cuántas cuerdas tiene una guitarra española?', ['6', '4', '5', '7']),
  Q('musica', 100, '¿Qué cantante es conocido como «el Rey del Pop»?', ['Michael Jackson', 'Elvis Presley', 'Prince', 'Freddie Mercury']),
  Q('musica', 200, '¿De qué país es el grupo ABBA?', ['Suecia', 'Noruega', 'Dinamarca', 'Países Bajos']),
  Q('musica', 200, '¿Qué compositor siguió componiendo tras quedarse sordo?', ['Ludwig van Beethoven', 'Wolfgang Amadeus Mozart', 'Johann Sebastian Bach', 'Frédéric Chopin']),
  Q('musica', 200, '¿Quién canta «Despacito» junto a Daddy Yankee?', ['Luis Fonsi', 'Enrique Iglesias', 'Ricky Martin', 'J Balvin']),
  Q('musica', 300, '¿Qué grupo español publicó el disco «Entre el cielo y el suelo»?', ['Mecano', 'Hombres G', 'La Oreja de Van Gogh', 'Héroes del Silencio']),
  Q('musica', 300, '¿Qué compositor escribió «Las cuatro estaciones»?', ['Antonio Vivaldi', 'Johann Sebastian Bach', 'Georg Friedrich Händel', 'Joseph Haydn']),
  Q('musica', 300, '¿En qué año ganó Massiel Eurovisión con «La, la, la»?', ['1968', '1969', '1972', '1965']),
  Q('musica', 500, '¿Quién compuso el «Concierto de Aranjuez»?', ['Joaquín Rodrigo', 'Manuel de Falla', 'Isaac Albéniz', 'Enrique Granados']),
  Q('musica', 500, '¿Cuál fue el primer single de los Beatles?', ['Love Me Do', 'Please Please Me', 'She Loves You', 'Yesterday']),
  Q('musica', 500, '¿Cuántas sinfonías completó Beethoven?', ['9', '7', '12', '5']),
  // ---- Deporte
  Q('deporte', 100, '¿Cuántos jugadores tiene un equipo de fútbol en el campo?', ['11', '10', '9', '12']),
  Q('deporte', 100, '¿En qué deporte destaca Rafa Nadal?', ['Tenis', 'Pádel', 'Golf', 'Baloncesto']),
  Q('deporte', 100, '¿Qué selección ganó el Mundial de fútbol de 2010?', ['España', 'Países Bajos', 'Alemania', 'Brasil']),
  Q('deporte', 200, '¿Cada cuántos años se celebran los Juegos Olímpicos de verano?', ['4', '2', '3', '5']),
  Q('deporte', 200, '¿Cuántos puntos vale un triple en baloncesto?', ['3', '2', '4', '1']),
  Q('deporte', 200, '¿Qué piloto español ganó dos Mundiales de Fórmula 1?', ['Fernando Alonso', 'Carlos Sainz', 'Pedro de la Rosa', 'Marc Gené']),
  Q('deporte', 300, '¿Cuántos Roland Garros ha ganado Rafa Nadal?', ['14', '12', '10', '16']),
  Q('deporte', 300, '¿En qué ciudad se celebraron los Juegos Olímpicos de 1992?', ['Barcelona', 'Atlanta', 'Seúl', 'Madrid']),
  Q('deporte', 300, '¿Cuántos Tours de Francia seguidos ganó Miguel Induráin?', ['5', '4', '3', '6']),
  Q('deporte', 500, '¿Qué país ganó el primer Mundial de fútbol, en 1930?', ['Uruguay', 'Argentina', 'Brasil', 'Italia']),
  Q('deporte', 500, '¿Cuánto mide una maratón?', ['42,195 km', '40 km', '42 km', '43,5 km']),
  Q('deporte', 500, '¿Qué gimnasta logró el primer 10 de la historia olímpica?', ['Nadia Comăneci', 'Olga Korbut', 'Simone Biles', 'Larisa Latýnina']),
  // ---- Geografía
  Q('geografia', 100, '¿Cuál es la capital de Francia?', ['París', 'Lyon', 'Marsella', 'Bruselas']),
  Q('geografia', 100, '¿Cuál es el océano más grande?', ['El Pacífico', 'El Atlántico', 'El Índico', 'El Ártico']),
  Q('geografia', 100, '¿En qué continente está Egipto?', ['África', 'Asia', 'Europa', 'Oceanía']),
  Q('geografia', 200, '¿Cuál es el río más largo de España?', ['El Tajo', 'El Ebro', 'El Duero', 'El Guadalquivir']),
  Q('geografia', 200, '¿Cuál es la capital de Australia?', ['Canberra', 'Sídney', 'Melbourne', 'Perth']),
  Q('geografia', 200, '¿Cuál es la montaña más alta del mundo?', ['El Everest', 'El K2', 'El Kilimanjaro', 'El Aconcagua']),
  Q('geografia', 300, '¿Cuál es el país más pequeño del mundo?', ['El Vaticano', 'Mónaco', 'San Marino', 'Liechtenstein']),
  Q('geografia', 300, '¿Cuál es el pico más alto de España?', ['El Teide', 'El Mulhacén', 'El Aneto', 'El Veleta']),
  Q('geografia', 300, '¿Qué país tiene más habitantes?', ['India', 'China', 'Estados Unidos', 'Indonesia']),
  Q('geografia', 500, '¿Cuál es la capital de Kazajistán?', ['Astaná', 'Almaty', 'Biskek', 'Taskent']),
  Q('geografia', 500, '¿Cuántas comunidades autónomas tiene España?', ['17', '15', '19', '16']),
  Q('geografia', 500, '¿Qué estrecho separa Asia de América?', ['El estrecho de Bering', 'El estrecho de Magallanes', 'El estrecho de Ormuz', 'El estrecho de Malaca'])
];

// Ampliación (una pregunta por línea en extra/<categoría>.js): se añaden sin repetir enunciados
const EXTRA = { cine, historia, ciencia, musica, deporte, geografia };
for (const [cat, lista] of Object.entries(EXTRA)) {
  for (const [v, p, ...o] of lista) if (!PREGUNTAS.some((q) => q.p === p)) PREGUNTAS.push(Q(cat, v, p, o));
}
