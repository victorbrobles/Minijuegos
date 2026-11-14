// server/data/seeds/pareja/parejas2.js
// «La Pareja Perfecta» · categorías nuevas. Mismo formato: [elemento, pareja, nivel]; sin parejas repetidas en una categoría.

export const CATEGORIAS_EXTRA = [
  { id: 'capital', nombre: 'País → su capital', emoji: '🏛️', pregunta: '¿Cuál es su capital?', parejas: [
    ['Francia', 'París', 1], ['Italia', 'Roma', 1], ['Alemania', 'Berlín', 1], ['Portugal', 'Lisboa', 1], ['Reino Unido', 'Londres', 1],
    ['Japón', 'Tokio', 1], ['Rusia', 'Moscú', 1], ['Argentina', 'Buenos Aires', 1], ['Grecia', 'Atenas', 1],
    ['Egipto', 'El Cairo', 1], ['Irlanda', 'Dublín', 1],
    ['Australia', 'Canberra', 2], ['Canadá', 'Ottawa', 2], ['Brasil', 'Brasilia', 2], ['Turquía', 'Ankara', 2], ['Suiza', 'Berna', 2],
    ['Marruecos', 'Rabat', 2], ['Colombia', 'Bogotá', 2], ['Perú', 'Lima', 2], ['Hungría', 'Budapest', 2], ['Polonia', 'Varsovia', 2],
    ['Noruega', 'Oslo', 2], ['Corea del Sur', 'Seúl', 2],
    ['Nueva Zelanda', 'Wellington', 3], ['Kazajistán', 'Astaná', 3], ['Nigeria', 'Abuya', 3], ['Pakistán', 'Islamabad', 3],
    ['Myanmar', 'Naipyidó', 3], ['Bolivia', 'Sucre', 3], ['Eslovenia', 'Liubliana', 3], ['Mongolia', 'Ulán Bator', 3],
    ['Costa de Marfil', 'Yamusukro', 3], ['Sri Lanka', 'Sri Jayawardenapura Kotte', 3], ['Tanzania', 'Dodoma', 3], ['Malta', 'La Valeta', 3]
  ] },
  { id: 'estadio', nombre: 'Club → su estadio', emoji: '🏟️', pregunta: '¿Cuál es su estadio?', parejas: [
    ['Real Madrid', 'Santiago Bernabéu', 1], ['FC Barcelona', 'Spotify Camp Nou', 1], ['Atlético de Madrid', 'Metropolitano', 1],
    ['Athletic Club', 'San Mamés', 1], ['Manchester United', 'Old Trafford', 1], ['Liverpool', 'Anfield', 1], ['Valencia', 'Mestalla', 1],
    ['Betis', 'Benito Villamarín', 1], ['Sevilla', 'Ramón Sánchez-Pizjuán', 1], ['Boca Juniors', 'La Bombonera', 1],
    ['Bayern de Múnich', 'Allianz Arena', 2], ['Borussia Dortmund', 'Signal Iduna Park', 2], ['Arsenal', 'Emirates Stadium', 2],
    ['Chelsea', 'Stamford Bridge', 2], ['PSG', 'Parque de los Príncipes', 2], ['Milan', 'San Siro', 2], ['Juventus', 'Allianz Stadium', 2],
    ['Real Sociedad', 'Anoeta', 2], ['Villarreal', 'Estadio de la Cerámica', 2], ['Celta', 'Balaídos', 2], ['River Plate', 'Monumental', 2],
    ['Nápoles', 'Diego Armando Maradona', 2], ['Ajax', 'Johan Cruyff Arena', 2], ['Benfica', 'Estádio da Luz', 2],
    ['Osasuna', 'El Sadar', 3], ['Getafe', 'Coliseum', 3], ['Rayo Vallecano', 'Estadio de Vallecas', 3], ['Deportivo de La Coruña', 'Riazor', 3],
    ['Real Zaragoza', 'La Romareda', 3], ['Sporting de Gijón', 'El Molinón', 3], ['Racing de Santander', 'El Sardinero', 3],
    ['Olympique de Marsella', 'Vélodrome', 3],
    ['Flamengo', 'Maracaná', 3], ['Celtic', 'Celtic Park', 3], ['Galatasaray', 'Rams Park', 3]
  ] },
  { id: 'director', nombre: 'Director → su película', emoji: '🎥', pregunta: '¿Qué película dirigió?', parejas: [
    ['Steven Spielberg', 'Tiburón', 1], ['James Cameron', 'Avatar', 1], ['George Lucas', 'La guerra de las galaxias', 1],
    ['Francis Ford Coppola', 'El padrino', 1], ['Quentin Tarantino', 'Pulp Fiction', 1], ['Peter Jackson', 'El señor de los anillos', 1],
    ['Christopher Nolan', 'Oppenheimer', 1], ['Alfred Hitchcock', 'Psicosis', 1], ['Pedro Almodóvar', 'Todo sobre mi madre', 1],
    ['Ridley Scott', 'Gladiator', 2], ['Martin Scorsese', 'Taxi Driver', 2], ['Stanley Kubrick', 'El resplandor', 2], ['Tim Burton', 'Eduardo Manostijeras', 2],
    ['Robert Zemeckis', 'Forrest Gump', 2], ['Alejandro Amenábar', 'Los otros', 2], ['Guillermo del Toro', 'El laberinto del fauno', 2],
    ['J. A. Bayona', 'Lo imposible', 2], ['Luis García Berlanga', 'Bienvenido, Mr. Marshall', 2], ['Denis Villeneuve', 'Dune', 2],
    ['Greta Gerwig', 'Barbie', 2], ['Bong Joon-ho', 'Parásitos', 2], ['Sam Mendes', '1917', 2],
    ['Fernando Trueba', 'Belle Époque', 3], ['Luis Buñuel', 'Viridiana', 3], ['Víctor Erice', 'El espíritu de la colmena', 3],
    ['Federico Fellini', 'La dolce vita', 3], ['Akira Kurosawa', 'Los siete samuráis', 3], ['Sergio Leone', 'El bueno, el feo y el malo', 3],
    ['Billy Wilder', 'El apartamento', 3], ['Michael Curtiz', 'Casablanca', 3], ['Hayao Miyazaki', 'El viaje de Chihiro', 3],
    ['David Lynch', 'Mulholland Drive', 3], ['Isabel Coixet', 'Mi vida sin mí', 3], ['Rodrigo Sorogoyen', 'As bestas', 3], ['Carla Simón', 'Alcarràs', 3]
  ] },
  { id: 'cancion', nombre: 'Canción → su intérprete', emoji: '🎤', pregunta: '¿Quién la canta?', parejas: [
    ['Thriller', 'Michael Jackson', 1], ['Despacito', 'Luis Fonsi', 1], ['Bohemian Rhapsody', 'Queen', 1], ['Macarena', 'Los del Río', 1],
    ['La bicicleta', 'Carlos Vives y Shakira', 1], ['Like a Prayer', 'Madonna', 1], ['Imagine', 'John Lennon', 1], ['Bailando', 'Enrique Iglesias', 1],
    ['Shape of You', 'Ed Sheeran', 1], ['Hey Jude', 'The Beatles', 1], ['Mi gran noche', 'Raphael', 1],
    ['Corazón partío', 'Alejandro Sanz', 2], ['Rolling in the Deep', 'Adele', 2],
    ['Hotel California', 'Eagles', 2], ['Wonderwall', 'Oasis', 2], ['Smells Like Teen Spirit', 'Nirvana', 2], ['La flaca', 'Jarabe de Palo', 2],
    ['Entre dos tierras', 'Héroes del Silencio', 2], ['Bad Romance', 'Lady Gaga', 2], ['Vivir así es morir de amor', 'Camilo Sesto', 2],
    ['Uptown Funk', 'Mark Ronson y Bruno Mars', 2], ['Malamente', 'Rosalía', 2], ['Blinding Lights', 'The Weeknd', 2], ['Lose Yourself', 'Eminem', 2],
    ['Mediterráneo', 'Joan Manuel Serrat', 3], ['La chica de ayer', 'Nacha Pop', 3], ['Cuéntame', 'Fórmula V', 3], ['Al Alba', 'Luis Eduardo Aute', 3],
    ['Yo no soy esa', 'Mari Trini', 3], ['Hijo de la luna', 'Mecano', 3], ['Sweet Child O\' Mine', "Guns N' Roses", 3],
    ['Stairway to Heaven', 'Led Zeppelin', 3], ['Africa', 'Toto', 3], ['Take On Me', 'a-ha', 3], ['Gavilán o paloma', 'Pablo Abraira', 3],
    ['Eres tú', 'Mocedades', 3], ['Libre', 'Nino Bravo', 3]
  ].filter(([, , n]) => n > 0) },
  { id: 'simbolo', nombre: 'Símbolo químico → su elemento', emoji: '⚗️', pregunta: '¿Qué elemento es?', parejas: [
    ['H', 'Hidrógeno', 1], ['O', 'Oxígeno', 1], ['C', 'Carbono', 1], ['N', 'Nitrógeno', 1], ['Fe', 'Hierro', 1], ['Au', 'Oro', 1],
    ['Ag', 'Plata', 1], ['Ca', 'Calcio', 1], ['He', 'Helio', 1], ['Cu', 'Cobre', 1],
    ['Na', 'Sodio', 2], ['K', 'Potasio', 2], ['Pb', 'Plomo', 2], ['Hg', 'Mercurio', 2], ['Zn', 'Cinc', 2], ['Mg', 'Magnesio', 2],
    ['Cl', 'Cloro', 2], ['S', 'Azufre', 2], ['P', 'Fósforo', 2], ['Sn', 'Estaño', 2], ['Al', 'Aluminio', 2], ['U', 'Uranio', 2],
    ['W', 'Wolframio', 3], ['Sb', 'Antimonio', 3], ['Pt', 'Platino', 3], ['Mn', 'Manganeso', 3], ['Ni', 'Níquel', 3], ['Co', 'Cobalto', 3],
    ['Cr', 'Cromo', 3], ['Si', 'Silicio', 3], ['Ti', 'Titanio', 3], ['Li', 'Litio', 3], ['Ne', 'Neón', 3], ['Pu', 'Plutonio', 3],
    ['Ra', 'Radio', 3], ['Pd', 'Paladio', 3]
  ] }
];
