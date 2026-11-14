// server/data/seeds/pareja/familias.js
// Familias de respuestas de «La Pareja Perfecta»: las opciones falsas salen primero de la MISMA familia que la buena
// (mismo origen, época o tipo), para que no se pueda descartar por pura intuición. Ej.: Steven Tyler → Aerosmith
// sale junto a otros grupos estadounidenses, no junto a Mecano o Héroes del Silencio.
// Formato: categoría → { 'amplia:fina': [respuestas] }. Si en la fina no hay bastantes, se completa con la amplia.

export const FAMILIAS = {
  actor: {
    'es:es': ['No es país para viejos', 'Volver', 'La máscara del Zorro', 'El viaje a ninguna parte'],
    'hollywood:clasico': ['El padrino', 'Sonrisas y lágrimas', 'Desayuno con diamantes', 'Casablanca', 'Psicosis', 'Lawrence de Arabia', 'Cantando bajo la lluvia', 'Lo que el viento se llevó', 'Ben-Hur', 'Ciudadano Kane', 'Con faldas y a lo loco'],
    'hollywood:80-90': ['Rocky', 'Terminator', 'Indiana Jones', 'La jungla de cristal', 'La máscara', 'Pretty Woman', 'Solo en casa', 'Regreso al futuro', 'Alien', 'Forrest Gump', 'La lista de Schindler', 'Notting Hill', 'El silencio de los corderos'],
    'hollywood:moderno': ['Titanic', 'Harry Potter', 'Matrix', 'Piratas del Caribe', 'Shrek (voz)', 'Men in Black', 'La La Land', 'Kill Bill', 'Gladiator']
  },
  inventor: {
    'es:es': ['El submarino eléctrico', 'El autogiro', 'La fregona', 'El Chupa Chups', 'La enciclopedia mecánica', 'El Ictíneo'],
    'ciencia:comunicacion': ['El teléfono', 'La radio', 'El telégrafo eléctrico', 'La televisión', 'La World Wide Web', 'El teléfono móvil', 'El salto de frecuencia', 'La imprenta'],
    'ciencia:transporte': ['El avión', 'El automóvil', 'La motocicleta', 'La máquina de vapor mejorada'],
    'ciencia:electricidad': ['La bombilla', 'El motor de corriente alterna', 'La pila eléctrica', 'El pararrayos', 'Los rayos X', 'El cinematógrafo', 'El telescopio astronómico', 'La dinamita'],
    'ciencia:cotidiano': ['El bolígrafo', 'El aire acondicionado', 'El microondas', 'El limpiaparabrisas', 'La baquelita', 'La tirita', 'El sistema de lectura para ciegos']
  },
  moneda: {
    'mundo:europa': ['Libra esterlina', 'Euro', 'Franco', 'Rublo', 'Corona', 'Lira', 'Esloti', 'Forinto', 'Leu', 'Grivna', 'Lev', 'Lek', 'Lari', 'Dram'],
    'mundo:america': ['Dólar', 'Peso', 'Real', 'Sol', 'Bolívar', 'Quetzal', 'Guaraní', 'Colón', 'Córdoba', 'Lempira'],
    'mundo:asia': ['Yen', 'Yuan', 'Rupia', 'Séquel', 'Baht', 'Dong', 'Won', 'Rand', 'Dírham', 'Naira', 'Ringgit', 'Taka']
  },
  creador: {
    'es:es': ['Miguel de Cervantes', 'Francisco Ibáñez', 'Arturo Pérez-Reverte', 'Manuel Vázquez Montalbán', 'Fernando de Rojas', 'José Zorrilla', 'Elvira Lindo', 'Leopoldo Alas «Clarín»', 'Federico García Lorca', 'Ramón María del Valle-Inclán', 'Josep Escobar'],
    'fuera:comic': ['Matt Groening', 'Walt Disney', 'Quino', 'Hergé', 'Stan Lee y Steve Ditko', 'Goscinny y Uderzo', 'Charles M. Schulz', 'Siegel y Shuster'],
    'fuera:literatura': ['J. K. Rowling', 'Arthur Conan Doyle', 'J. R. R. Tolkien', 'William Shakespeare', 'Carlo Collodi', 'Agatha Christie', 'Bram Stoker', 'Mary Shelley', 'J. M. Barrie', 'Lewis Carroll', 'Mark Twain', 'Julio Verne', 'Ian Fleming', 'Franz Kafka', 'Antoine de Saint-Exupéry', 'Astrid Lindgren']
  },
  grupo: {
    'es:es': ['La Oreja de Van Gogh', 'El Canto del Loco', 'Jarabe de Palo', 'Mecano', 'Pereza', 'Platero y Tú', 'Héroes del Silencio', 'Extremoduro', 'Fangoria', 'Leño', 'Los Rodríguez'],
    'anglo:britanico': ['Queen', 'U2', 'The Rolling Stones', 'The Beatles', 'Coldplay', 'Dire Straits', 'Iron Maiden', 'Radiohead', 'Joy Division', 'Led Zeppelin', 'The Smiths', 'The Police', 'Oasis', 'The Clash', 'Black Sabbath', 'AC/DC'],
    'anglo:estadounidense': ['Maroon 5', 'Nirvana', "Guns N' Roses", 'Aerosmith', 'No Doubt', 'Linkin Park', 'The Doors', 'Red Hot Chili Peppers']
  },
  pintor: {
    'es:es': ['Guernica', 'Las meninas', 'La persistencia de la memoria', 'El tres de mayo de 1808', 'El entierro del conde de Orgaz', 'Paseo a orillas del mar', 'El carnaval de Arlequín', 'La Inmaculada de los Venerables', 'San Hugo en el refectorio'],
    'fuera:clasico': ['La Gioconda', 'La creación de Adán', 'El nacimiento de Venus', 'La escuela de Atenas', 'Venus de Urbino', 'El jardín de las delicias', 'La torre de Babel', 'El matrimonio Arnolfini', 'La joven de la perla', 'La ronda de noche'],
    'fuera:moderno': ['La noche estrellada', 'El grito', 'El beso', 'Impresión, sol naciente', 'La libertad guiando al pueblo', 'El hijo del hombre', 'Gótico americano', 'Latas de sopa Campbell', 'Las dos Fridas', 'La gran ola de Kanagawa', 'Nighthawks', 'El caminante sobre el mar de nubes', 'Tarde de domingo en la isla de la Grande Jatte', 'La balsa de la Medusa', 'Almuerzo sobre la hierba', 'La danza']
  },
  escritor: {
    'hisp:es': ['Don Quijote de la Mancha', 'La sombra del viento', 'Fortunata y Jacinta', 'La familia de Pascual Duarte', 'Los santos inocentes', 'Nada', 'Tiempo de silencio', 'El corazón helado', 'La ciudad de los prodigios', 'El guardián invisible'],
    'hisp:latam': ['Cien años de soledad', 'La casa de los espíritus', 'La ciudad y los perros', 'Rayuela', 'Pedro Páramo'],
    'fuera:xix': ['Veinte mil leguas de viaje submarino', 'Las aventuras de Huckleberry Finn', 'Los miserables', 'Guerra y paz', 'Crimen y castigo', 'Orgullo y prejuicio', 'Moby Dick', 'Cumbres borrascosas', 'Madame Bovary'],
    'fuera:xx': ['1984', 'El guardián entre el centeno', 'El código Da Vinci', 'El gran Gatsby', 'El nombre de la rosa', 'Los pilares de la Tierra', 'It', 'Un mundo feliz', 'Fahrenheit 451', 'El extranjero', 'La metamorfosis', 'El perfume']
  },
  monumento: {
    'es:es': ['Barcelona', 'Granada', 'Córdoba', 'Sevilla', 'Segovia', 'Bilbao', 'Madrid', 'Valencia', 'A Coruña', 'Zaragoza', 'Mérida', 'Santiago de Compostela', 'Ávila', 'Cuenca'],
    'fuera:europa': ['París', 'Roma', 'Londres', 'Berlín', 'Lisboa', 'Bruselas', 'Moscú', 'Atenas', 'Estambul', 'Copenhague', 'Praga', 'Viena'],
    'fuera:mundo': ['Nueva York', 'Río de Janeiro', 'Sídney', 'Agra', 'Pekín', 'Dubái', 'San Francisco', 'Washington', 'Kioto', 'Siem Reap', 'Cochabamba', 'Kamakura']
  },
  heroe: {
    'comic:dc': ['Bruce Wayne', 'Clark Kent', 'Diana Prince', 'Barry Allen', 'Hal Jordan', 'Selina Kyle', 'Dick Grayson', 'Barbara Gordon', 'Arthur Curry', 'Kara Zor-El', 'Diego de la Vega'],
    'comic:marvel': ['Peter Parker', 'Tony Stark', 'Bruce Banner', 'Steve Rogers', 'Donald Blake', "T'Challa", 'Matt Murdock', 'Logan', 'Scott Lang', 'Natasha Romanoff', 'Stephen Strange', 'Clint Barton', 'Carol Danvers', 'Charles Xavier', 'Erik Lehnsherr', 'Ororo Munroe', 'Scott Summers', 'Wade Wilson', 'Johnny Storm', 'Ben Grimm', 'Reed Richards', 'Hank McCoy', 'Frank Castle', 'Kamala Khan']
  },
  capital: {
    'mundo:europa': ['París', 'Roma', 'Berlín', 'Lisboa', 'Londres', 'Moscú', 'Atenas', 'Dublín', 'Berna', 'Budapest', 'Varsovia', 'Oslo', 'Liubliana', 'La Valeta'],
    'mundo:america': ['Buenos Aires', 'Ottawa', 'Brasilia', 'Bogotá', 'Lima', 'Sucre'],
    'mundo:asia': ['Tokio', 'Ankara', 'Seúl', 'Astaná', 'Islamabad', 'Naipyidó', 'Ulán Bator', 'Sri Jayawardenapura Kotte', 'Canberra', 'Wellington'],
    'mundo:africa': ['El Cairo', 'Rabat', 'Abuya', 'Yamusukro', 'Dodoma']
  },
  estadio: {
    'es:es': ['Santiago Bernabéu', 'Spotify Camp Nou', 'Metropolitano', 'San Mamés', 'Mestalla', 'Benito Villamarín', 'Ramón Sánchez-Pizjuán', 'Anoeta', 'Estadio de la Cerámica', 'Balaídos', 'El Sadar', 'Coliseum', 'Estadio de Vallecas', 'Riazor', 'La Romareda', 'El Molinón', 'El Sardinero'],
    'fuera:europa': ['Old Trafford', 'Anfield', 'Allianz Arena', 'Signal Iduna Park', 'Emirates Stadium', 'Stamford Bridge', 'Parque de los Príncipes', 'San Siro', 'Allianz Stadium', 'Diego Armando Maradona', 'Johan Cruyff Arena', 'Estádio da Luz', 'Vélodrome', 'Celtic Park', 'Rams Park'],
    'fuera:america': ['La Bombonera', 'Monumental', 'Maracaná']
  },
  director: {
    'es:es': ['Todo sobre mi madre', 'Los otros', 'Lo imposible', 'Bienvenido, Mr. Marshall', 'Belle Époque', 'Viridiana', 'El espíritu de la colmena', 'Mi vida sin mí', 'As bestas', 'Alcarràs', 'El laberinto del fauno'],
    'fuera:clasico': ['Psicosis', 'El padrino', 'El resplandor', 'Taxi Driver', 'La dolce vita', 'Los siete samuráis', 'El bueno, el feo y el malo', 'El apartamento', 'Casablanca', 'Tiburón', 'La guerra de las galaxias'],
    'fuera:moderno': ['Avatar', 'Pulp Fiction', 'El señor de los anillos', 'Oppenheimer', 'Gladiator', 'Eduardo Manostijeras', 'Forrest Gump', 'Dune', 'Barbie', 'Parásitos', '1917', 'El viaje de Chihiro', 'Mulholland Drive']
  },
  cancion: {
    'es:actual': ['Luis Fonsi', 'Los del Río', 'Carlos Vives y Shakira', 'Enrique Iglesias', 'Alejandro Sanz', 'Jarabe de Palo', 'Héroes del Silencio', 'Rosalía', 'Mecano', 'Nacha Pop'],
    'es:clasica': ['Raphael', 'Camilo Sesto', 'Joan Manuel Serrat', 'Fórmula V', 'Luis Eduardo Aute', 'Mari Trini', 'Pablo Abraira', 'Mocedades', 'Nino Bravo'],
    'anglo:pop': ['Michael Jackson', 'Madonna', 'Ed Sheeran', 'Adele', 'Lady Gaga', 'Mark Ronson y Bruno Mars', 'The Weeknd', 'Eminem', 'John Lennon', 'a-ha'],
    'anglo:rock': ['Queen', 'The Beatles', 'Eagles', 'Oasis', 'Nirvana', "Guns N' Roses", 'Led Zeppelin', 'Toto']
  }
  // simbolo: la familia es la primera letra del símbolo (ver familiaDe)
};

const INDICE = {};
Object.entries(FAMILIAS).forEach(([cat, grupos]) => {
  INDICE[cat] = {};
  Object.entries(grupos).forEach(([clave, lista]) => lista.forEach((r) => { INDICE[cat][r] = clave; }));
});

/** 'amplia:fina' de una pareja (o null). En los símbolos químicos, la primera letra del símbolo. */
export function familiaDe(cat, elemento, pareja) {
  if (cat === 'simbolo') return `${elemento[0]}:${elemento[0]}`;
  return INDICE[cat]?.[pareja] ?? null;
}
