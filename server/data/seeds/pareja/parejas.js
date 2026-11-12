// server/data/seeds/pareja/parejas.js
// «La Pareja Perfecta»: [elemento, pareja, nivel]. Los distractores salen de otras parejas de la misma categoría,
// así que dentro de una categoría ninguna pareja se repite.

import { CATEGORIAS_EXTRA } from './parejas2.js';

const BASE = [
  { id: 'actor', nombre: 'Actor o actriz → su película más famosa', emoji: '🎬', pregunta: '¿Cuál es su película más famosa?', parejas: [
    ['Leonardo DiCaprio', 'Titanic', 1], ['Tom Hanks', 'Forrest Gump', 1], ['Sylvester Stallone', 'Rocky', 1],
    ['Arnold Schwarzenegger', 'Terminator', 1], ['Harrison Ford', 'Indiana Jones', 1], ['Daniel Radcliffe', 'Harry Potter', 1],
    ['Keanu Reeves', 'Matrix', 1], ['Johnny Depp', 'Piratas del Caribe', 1], ['Mike Myers', 'Shrek (voz)', 1],
    ['Will Smith', 'Men in Black', 1], ['Bruce Willis', 'La jungla de cristal', 1], ['Jim Carrey', 'La máscara', 1],
    ['Julia Roberts', 'Pretty Woman', 1], ['Macaulay Culkin', 'Solo en casa', 1], ['Michael J. Fox', 'Regreso al futuro', 1],
    ['Marlon Brando', 'El padrino', 2], ['Russell Crowe', 'Gladiator', 2], ['Jodie Foster', 'El silencio de los corderos', 2],
    ['Julie Andrews', 'Sonrisas y lágrimas', 2], ['Audrey Hepburn', 'Desayuno con diamantes', 2], ['Javier Bardem', 'No es país para viejos', 2],
    ['Ryan Gosling', 'La La Land', 2], ['Liam Neeson', 'La lista de Schindler', 2], ['Uma Thurman', 'Kill Bill', 2], ['Hugh Grant', 'Notting Hill', 2],
    ['Sigourney Weaver', 'Alien', 2], ['Penélope Cruz', 'Volver', 2], ['Antonio Banderas', 'La máscara del Zorro', 2],
    ['Humphrey Bogart', 'Casablanca', 3], ['Anthony Perkins', 'Psicosis', 3], ["Peter O'Toole", 'Lawrence de Arabia', 3],
    ['Gene Kelly', 'Cantando bajo la lluvia', 3], ['Vivien Leigh', 'Lo que el viento se llevó', 3], ['Charlton Heston', 'Ben-Hur', 3],
    ['Orson Welles', 'Ciudadano Kane', 3], ['Marilyn Monroe', 'Con faldas y a lo loco', 3], ['Fernando Fernán Gómez', 'El viaje a ninguna parte', 3]
  ] },
  { id: 'inventor', nombre: 'Inventor → su invento', emoji: '💡', pregunta: '¿Qué inventó?', parejas: [
    ['Thomas Edison', 'La bombilla', 1], ['Alexander Graham Bell', 'El teléfono', 1], ['Johannes Gutenberg', 'La imprenta', 1],
    ['Los hermanos Wright', 'El avión', 1], ['Guglielmo Marconi', 'La radio', 1], ['Karl Benz', 'El automóvil', 1],
    ['James Watt', 'La máquina de vapor mejorada', 1], ['Los hermanos Lumière', 'El cinematógrafo', 1], ['Galileo Galilei', 'El telescopio astronómico', 1],
    ['Isaac Peral', 'El submarino eléctrico', 2], ['Alfred Nobel', 'La dinamita', 2], ['Tim Berners-Lee', 'La World Wide Web', 2],
    ['Juan de la Cierva', 'El autogiro', 2], ['Louis Braille', 'El sistema de lectura para ciegos', 2], ['John Logie Baird', 'La televisión', 2],
    ['Nikola Tesla', 'El motor de corriente alterna', 2], ['Rudolf Diesel', 'El motor diésel', 2], ['Gottlieb Daimler', 'La motocicleta', 2],
    ['Benjamin Franklin', 'El pararrayos', 2], ['Alessandro Volta', 'La pila eléctrica', 2], ['Martin Cooper', 'El teléfono móvil', 2],
    ['Manuel Jalón', 'La fregona', 3], ['Enric Bernat', 'El Chupa Chups', 3], ['László Bíró', 'El bolígrafo', 3],
    ['Ángela Ruiz Robles', 'La enciclopedia mecánica', 3], ['Samuel Morse', 'El telégrafo eléctrico', 3], ['Willis Carrier', 'El aire acondicionado', 3],
    ['Percy Spencer', 'El microondas', 3], ['Hedy Lamarr', 'El salto de frecuencia', 3], ['Mary Anderson', 'El limpiaparabrisas', 3],
    ['Ernő Rubik', 'El cubo de Rubik', 3], ['Leo Baekeland', 'La baquelita', 3], ['Wilhelm Röntgen', 'Los rayos X', 3],
    ['Narcís Monturiol', 'El Ictíneo', 3], ['Earle Dickson', 'La tirita', 3]
  ] },
  { id: 'moneda', nombre: 'País → su moneda', emoji: '💰', pregunta: '¿Cuál es su moneda?', parejas: [
    ['Japón', 'Yen', 1], ['Reino Unido', 'Libra esterlina', 1], ['Estados Unidos', 'Dólar estadounidense', 1], ['México', 'Peso mexicano', 1], ['China', 'Yuan', 1],
    ['España', 'Euro', 1], ['Suiza', 'Franco suizo', 1], ['Rusia', 'Rublo', 1], ['India', 'Rupia india', 1], ['Brasil', 'Real', 1],
    ['Suecia', 'Corona sueca', 2], ['Turquía', 'Lira turca', 2], ['Argentina', 'Peso argentino', 2], ['Canadá', 'Dólar canadiense', 2],
    ['Australia', 'Dólar australiano', 2], ['Noruega', 'Corona noruega', 2], ['Dinamarca', 'Corona danesa', 2], ['Israel', 'Séquel', 2],
    ['Perú', 'Sol', 2], ['Venezuela', 'Bolívar', 2], ['Guatemala', 'Quetzal', 2], ['Paraguay', 'Guaraní', 2],
    ['Polonia', 'Esloti', 3], ['Hungría', 'Forinto', 3], ['Tailandia', 'Baht', 3], ['Sudáfrica', 'Rand', 3], ['Vietnam', 'Dong', 3],
    ['Corea del Sur', 'Won', 3], ['Marruecos', 'Dírham marroquí', 3], ['República Checa', 'Corona checa', 3], ['Indonesia', 'Rupia indonesia', 3],
    ['Costa Rica', 'Colón', 3], ['Nicaragua', 'Córdoba', 3], ['Honduras', 'Lempira', 3], ['Rumanía', 'Leu', 3], ['Ucrania', 'Grivna', 3]
  ] },
  { id: 'creador', nombre: 'Personaje → su creador', emoji: '✍️', pregunta: '¿Quién lo creó?', parejas: [
    ['Don Quijote', 'Miguel de Cervantes', 1], ['Harry Potter', 'J. K. Rowling', 1], ['Sherlock Holmes', 'Arthur Conan Doyle', 1],
    ['Mortadelo y Filemón', 'Francisco Ibáñez', 1], ['Bart Simpson', 'Matt Groening', 1], ['Mickey Mouse', 'Walt Disney', 1],
    ['Frodo Bolsón', 'J. R. R. Tolkien', 1], ['Romeo y Julieta', 'William Shakespeare', 1], ['Pinocho', 'Carlo Collodi', 1],
    ['Hércules Poirot', 'Agatha Christie', 2], ['Drácula', 'Bram Stoker', 2], ['Frankenstein', 'Mary Shelley', 2], ['Mafalda', 'Quino', 2],
    ['Tintín', 'Hergé', 2], ['Peter Pan', 'J. M. Barrie', 2], ['Spider-Man', 'Stan Lee y Steve Ditko', 2], ['Astérix', 'Goscinny y Uderzo', 2],
    ['Alicia en el País de las Maravillas', 'Lewis Carroll', 2], ['Tom Sawyer', 'Mark Twain', 2], ['Phileas Fogg', 'Julio Verne', 2],
    ['James Bond', 'Ian Fleming', 2], ['Snoopy', 'Charles M. Schulz', 2], ['Superman', 'Siegel y Shuster', 2],
    ['El capitán Alatriste', 'Arturo Pérez-Reverte', 3], ['Pepe Carvalho', 'Manuel Vázquez Montalbán', 3], ['La Celestina', 'Fernando de Rojas', 3],
    ['Don Juan Tenorio', 'José Zorrilla', 3], ['Gregor Samsa', 'Franz Kafka', 3], ['El principito', 'Antoine de Saint-Exupéry', 3],
    ['Manolito Gafotas', 'Elvira Lindo', 3], ['Ana Ozores', 'Leopoldo Alas «Clarín»', 3], ['Pippi Calzaslargas', 'Astrid Lindgren', 3],
    ['Bernarda Alba', 'Federico García Lorca', 3], ['Max Estrella', 'Ramón María del Valle-Inclán', 3], ['Zipi y Zape', 'Josep Escobar', 3]
  ] },
  { id: 'grupo', nombre: 'Cantante → su grupo', emoji: '🎤', pregunta: '¿De qué grupo era la voz?', parejas: [
    ['Freddie Mercury', 'Queen', 1], ['Bono', 'U2', 1], ['Mick Jagger', 'The Rolling Stones', 1], ['John Lennon', 'The Beatles', 1],
    ['Amaia Montero', 'La Oreja de Van Gogh', 1], ['Chris Martin', 'Coldplay', 1], ['Adam Levine', 'Maroon 5', 1], ['Mark Knopfler', 'Dire Straits', 2],
    ['Kurt Cobain', 'Nirvana', 2], ['Axl Rose', "Guns N' Roses", 2], ['Brian Johnson', 'AC/DC', 2], ['Dani Martín', 'El Canto del Loco', 2],
    ['Pau Donés', 'Jarabe de Palo', 2], ['Ana Torroja', 'Mecano', 2], ['Leiva', 'Pereza', 2], ['Steven Tyler', 'Aerosmith', 2],
    ['Gwen Stefani', 'No Doubt', 2], ['Chester Bennington', 'Linkin Park', 2], ['Fito Cabrales', 'Platero y Tú', 3], ['Bruce Dickinson', 'Iron Maiden', 3],
    ['Enrique Bunbury', 'Héroes del Silencio', 3], ['Robe Iniesta', 'Extremoduro', 3], ['Jim Morrison', 'The Doors', 3],
    ['Thom Yorke', 'Radiohead', 3], ['Anthony Kiedis', 'Red Hot Chili Peppers', 3], ['Ian Curtis', 'Joy Division', 3],
    ['Robert Plant', 'Led Zeppelin', 3], ['Morrissey', 'The Smiths', 3], ['Sting', 'The Police', 3], ['Liam Gallagher', 'Oasis', 3],
    ['Alaska', 'Fangoria', 3], ['Rosendo Mercado', 'Leño', 3], ['Andrés Calamaro', 'Los Rodríguez', 3],
    ['Joe Strummer', 'The Clash', 3], ['Ozzy Osbourne', 'Black Sabbath', 3]
  ] },
  { id: 'pintor', nombre: 'Pintor → su cuadro', emoji: '🎨', pregunta: '¿Qué cuadro pintó?', parejas: [
    ['Leonardo da Vinci', 'La Gioconda', 1], ['Pablo Picasso', 'Guernica', 1], ['Diego Velázquez', 'Las meninas', 1],
    ['Vincent van Gogh', 'La noche estrellada', 1], ['Edvard Munch', 'El grito', 1], ['Miguel Ángel', 'La creación de Adán', 1],
    ['Salvador Dalí', 'La persistencia de la memoria', 2], ['Francisco de Goya', 'El tres de mayo de 1808', 2], ['Sandro Botticelli', 'El nacimiento de Venus', 2],
    ['Johannes Vermeer', 'La joven de la perla', 2], ['Gustav Klimt', 'El beso', 2], ['Claude Monet', 'Impresión, sol naciente', 2],
    ['Rembrandt', 'La ronda de noche', 2], ['Eugène Delacroix', 'La libertad guiando al pueblo', 2], ['René Magritte', 'El hijo del hombre', 2],
    ['Grant Wood', 'Gótico americano', 2], ['Andy Warhol', 'Latas de sopa Campbell', 2], ['Frida Kahlo', 'Las dos Fridas', 2],
    ['Katsushika Hokusai', 'La gran ola de Kanagawa', 2], ['Rafael', 'La escuela de Atenas', 2],
    ['El Bosco', 'El jardín de las delicias', 3], ['El Greco', 'El entierro del conde de Orgaz', 3], ['Joaquín Sorolla', 'Paseo a orillas del mar', 3],
    ['Edward Hopper', 'Nighthawks', 3], ['Caspar David Friedrich', 'El caminante sobre el mar de nubes', 3], ['Georges Seurat', 'Tarde de domingo en la isla de la Grande Jatte', 3],
    ['Pieter Brueghel el Viejo', 'La torre de Babel', 3], ['Théodore Géricault', 'La balsa de la Medusa', 3], ['Jan van Eyck', 'El matrimonio Arnolfini', 3],
    ['Édouard Manet', 'Almuerzo sobre la hierba', 3], ['Henri Matisse', 'La danza', 3], ['Joan Miró', 'El carnaval de Arlequín', 3],
    ['Bartolomé Esteban Murillo', 'La Inmaculada de los Venerables', 3], ['Francisco de Zurbarán', 'San Hugo en el refectorio', 3], ['Tiziano', 'Venus de Urbino', 3]
  ] },
  { id: 'escritor', nombre: 'Escritor → su novela', emoji: '📚', pregunta: '¿Qué novela escribió?', parejas: [
    ['Gabriel García Márquez', 'Cien años de soledad', 1], ['Miguel de Cervantes', 'Don Quijote de la Mancha', 1], ['George Orwell', '1984', 1],
    ['J. D. Salinger', 'El guardián entre el centeno', 2], ['Carlos Ruiz Zafón', 'La sombra del viento', 1], ['Dan Brown', 'El código Da Vinci', 1],
    ['Julio Verne', 'Veinte mil leguas de viaje submarino', 1], ['Mark Twain', 'Las aventuras de Huckleberry Finn', 2], ['Victor Hugo', 'Los miserables', 1],
    ['León Tolstói', 'Guerra y paz', 2], ['Fiódor Dostoyevski', 'Crimen y castigo', 2], ['Jane Austen', 'Orgullo y prejuicio', 2],
    ['Herman Melville', 'Moby Dick', 2], ['F. Scott Fitzgerald', 'El gran Gatsby', 2], ['Umberto Eco', 'El nombre de la rosa', 2],
    ['Benito Pérez Galdós', 'Fortunata y Jacinta', 2], ['Camilo José Cela', 'La familia de Pascual Duarte', 2], ['Miguel Delibes', 'Los santos inocentes', 2],
    ['Isabel Allende', 'La casa de los espíritus', 2], ['Mario Vargas Llosa', 'La ciudad y los perros', 2], ['Ken Follett', 'Los pilares de la Tierra', 2],
    ['Stephen King', 'It', 1], ['Aldous Huxley', 'Un mundo feliz', 2], ['Ray Bradbury', 'Fahrenheit 451', 2],
    ['Emily Brontë', 'Cumbres borrascosas', 3], ['Gustave Flaubert', 'Madame Bovary', 3], ['Julio Cortázar', 'Rayuela', 3],
    ['Juan Rulfo', 'Pedro Páramo', 3], ['Carmen Laforet', 'Nada', 3], ['Luis Martín-Santos', 'Tiempo de silencio', 3],
    ['Albert Camus', 'El extranjero', 3], ['Franz Kafka', 'La metamorfosis', 2], ['Patrick Süskind', 'El perfume', 2],
    ['Almudena Grandes', 'El corazón helado', 3], ['Eduardo Mendoza', 'La ciudad de los prodigios', 3], ['Dolores Redondo', 'El guardián invisible', 3]
  ] },
  { id: 'monumento', nombre: 'Monumento → su ciudad', emoji: '🏛️', pregunta: '¿En qué ciudad está?', parejas: [
    ['La Torre Eiffel', 'París', 1], ['El Coliseo', 'Roma', 1], ['La Sagrada Familia', 'Barcelona', 1], ['La Estatua de la Libertad', 'Nueva York', 1],
    ['El Big Ben', 'Londres', 1], ['La Alhambra', 'Granada', 1], ['La Puerta de Brandeburgo', 'Berlín', 1], ['El Cristo Redentor', 'Río de Janeiro', 1],
    ['La Ópera', 'Sídney', 1], ['La Mezquita-Catedral', 'Córdoba', 1], ['La Torre de Belém', 'Lisboa', 2], ['El Atomium', 'Bruselas', 2],
    ['La Torre de Pisa', 'Pisa', 1], ['El Taj Mahal', 'Agra', 2], ['La Ciudad Prohibida', 'Pekín', 2], ['La plaza Roja', 'Moscú', 2],
    ['El Partenón', 'Atenas', 1], ['La Giralda', 'Sevilla', 1], ['El acueducto romano', 'Segovia', 1], ['El Museo Guggenheim', 'Bilbao', 1],
    ['La Puerta de Alcalá', 'Madrid', 1], ['La catedral de Notre Dame', 'París', 0], ['Santa Sofía', 'Estambul', 2], ['El Burj Khalifa', 'Dubái', 2],
    ['La Sirenita', 'Copenhague', 2], ['El Manneken Pis', 'Bruselas', 0], ['El puente Carlos', 'Praga', 2], ['El Palacio de Schönbrunn', 'Viena', 2],
    ['La Ciudad de las Artes y las Ciencias', 'Valencia', 2], ['El Templo de Debod', 'Madrid', 0], ['La Torre de Hércules', 'A Coruña', 2],
    ['El Puente de la Bahía', 'San Francisco', 0], ['El puente Golden Gate', 'San Francisco', 2], ['La Casa Blanca', 'Washington', 2],
    ['El Kremlin', 'Moscú', 0], ['El Santuario de Fushimi Inari', 'Kioto', 3], ['El Castillo de Praga', 'Praga', 0], ['La catedral de San Basilio', 'Moscú', 0],
    ['El Pilar', 'Zaragoza', 2], ['La Torre del Oro', 'Sevilla', 0], ['El teatro romano', 'Mérida', 3], ['La catedral de Santiago', 'Santiago de Compostela', 2],
    ['La muralla', 'Ávila', 3], ['Las Casas Colgadas', 'Cuenca', 3], ['El Templo de Angkor Wat', 'Siem Reap', 3],
    ['El Cristo de la Concordia', 'Cochabamba', 3], ['El Gran Buda', 'Kamakura', 3]
  ].filter(([, , n]) => n > 0) },
  { id: 'heroe', nombre: 'Superhéroe → su identidad secreta', emoji: '🦸', pregunta: '¿Quién es en realidad?', parejas: [
    ['Batman', 'Bruce Wayne', 1], ['Superman', 'Clark Kent', 1], ['Spider-Man', 'Peter Parker', 1], ['Iron Man', 'Tony Stark', 1],
    ['Wonder Woman', 'Diana Prince', 2], ['Hulk', 'Bruce Banner', 1], ['Capitán América', 'Steve Rogers', 2], ['Flash', 'Barry Allen', 2],
    ['Thor', 'Donald Blake', 3], ['Pantera Negra', "T'Challa", 2], ['Daredevil', 'Matt Murdock', 2], ['Linterna Verde', 'Hal Jordan', 3],
    ['Lobezno', 'Logan', 2], ['Catwoman', 'Selina Kyle', 2], ['Robin', 'Dick Grayson', 3], ['Batgirl', 'Barbara Gordon', 3],
    ['Ant-Man', 'Scott Lang', 2], ['Viuda Negra', 'Natasha Romanoff', 2], ['Doctor Extraño', 'Stephen Strange', 2], ['Ojo de Halcón', 'Clint Barton', 2],
    ['Aquaman', 'Arthur Curry', 2], ['Capitana Marvel', 'Carol Danvers', 2], ['Profesor X', 'Charles Xavier', 2], ['Magneto', 'Erik Lehnsherr', 3],
    ['Tormenta', 'Ororo Munroe', 3], ['Cíclope', 'Scott Summers', 3], ['Deadpool', 'Wade Wilson', 2], ['El Zorro', 'Diego de la Vega', 1],
    ['Supergirl', 'Kara Zor-El', 3], ['La Antorcha Humana', 'Johnny Storm', 3], ['La Cosa', 'Ben Grimm', 3], ['Mister Fantástico', 'Reed Richards', 3],
    ['Bestia', 'Hank McCoy', 3], ['El Castigador', 'Frank Castle', 3], ['Ms. Marvel', 'Kamala Khan', 3], ['Hombre Murciélago (El Chapulín)', 'sin identidad', 0]
  ].filter(([, , n]) => n > 0) }
];

export const CATEGORIAS = [...BASE, ...CATEGORIAS_EXTRA];
