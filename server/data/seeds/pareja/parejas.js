// server/data/seeds/pareja/parejas.js
// «La Pareja Perfecta»: [elemento, pareja, nivel]. Los distractores salen de otras parejas de la misma categoría.

export const CATEGORIAS = [
  { id: 'actor', nombre: 'Actor o actriz → su película más famosa', emoji: '🎬', pregunta: '¿Cuál es su película más famosa?', parejas: [
    ['Leonardo DiCaprio', 'Titanic', 1], ['Tom Hanks', 'Forrest Gump', 1], ['Sylvester Stallone', 'Rocky', 1],
    ['Arnold Schwarzenegger', 'Terminator', 1], ['Harrison Ford', 'Indiana Jones', 1], ['Daniel Radcliffe', 'Harry Potter', 1],
    ['Keanu Reeves', 'Matrix', 1], ['Johnny Depp', 'Piratas del Caribe', 1],
    ['Marlon Brando', 'El padrino', 2], ['Russell Crowe', 'Gladiator', 2], ['Jodie Foster', 'El silencio de los corderos', 2],
    ['Julie Andrews', 'Sonrisas y lágrimas', 2], ['Audrey Hepburn', 'Desayuno con diamantes', 2], ['Javier Bardem', 'No es país para viejos', 2],
    ['Humphrey Bogart', 'Casablanca', 3], ['Anthony Perkins', 'Psicosis', 3], ["Peter O'Toole", 'Lawrence de Arabia', 3],
    ['Gene Kelly', 'Cantando bajo la lluvia', 3], ['Vivien Leigh', 'Lo que el viento se llevó', 3], ['Charlton Heston', 'Ben-Hur', 3]
  ] },
  { id: 'inventor', nombre: 'Inventor → su invento', emoji: '💡', pregunta: '¿Qué inventó?', parejas: [
    ['Thomas Edison', 'La bombilla', 1], ['Alexander Graham Bell', 'El teléfono', 1], ['Johannes Gutenberg', 'La imprenta', 1],
    ['Los hermanos Wright', 'El avión', 1], ['Guglielmo Marconi', 'La radio', 1], ['Karl Benz', 'El automóvil', 1],
    ['Isaac Peral', 'El submarino eléctrico', 2], ['Alfred Nobel', 'La dinamita', 2], ['Tim Berners-Lee', 'La World Wide Web', 2],
    ['Juan de la Cierva', 'El autogiro', 2], ['Louis Braille', 'El sistema de lectura para ciegos', 2], ['John Logie Baird', 'La televisión', 2],
    ['Manuel Jalón', 'La fregona', 3], ['Enric Bernat', 'El Chupa Chups', 3], ['László Bíró', 'El bolígrafo', 3],
    ['Ángela Ruiz Robles', 'La enciclopedia mecánica', 3], ['Samuel Morse', 'El telégrafo eléctrico', 3], ['Willis Carrier', 'El aire acondicionado', 3]
  ] },
  { id: 'moneda', nombre: 'País → su moneda', emoji: '💰', pregunta: '¿Cuál es su moneda?', parejas: [
    ['Japón', 'Yen', 1], ['Reino Unido', 'Libra esterlina', 1], ['Estados Unidos', 'Dólar', 1], ['México', 'Peso mexicano', 1], ['China', 'Yuan', 1],
    ['Suiza', 'Franco suizo', 2], ['India', 'Rupia', 2], ['Rusia', 'Rublo', 2], ['Brasil', 'Real', 2], ['Suecia', 'Corona sueca', 2], ['Turquía', 'Lira turca', 2],
    ['Polonia', 'Esloti', 3], ['Hungría', 'Forinto', 3], ['Tailandia', 'Baht', 3], ['Sudáfrica', 'Rand', 3], ['Vietnam', 'Dong', 3], ['Corea del Sur', 'Won', 3], ['Marruecos', 'Dírham', 3]
  ] },
  { id: 'creador', nombre: 'Personaje → su creador', emoji: '✍️', pregunta: '¿Quién lo creó?', parejas: [
    ['Don Quijote', 'Miguel de Cervantes', 1], ['Harry Potter', 'J. K. Rowling', 1], ['Sherlock Holmes', 'Arthur Conan Doyle', 1],
    ['Mortadelo y Filemón', 'Francisco Ibáñez', 1], ['Bart Simpson', 'Matt Groening', 1], ['Mickey Mouse', 'Walt Disney', 1],
    ['Hércules Poirot', 'Agatha Christie', 2], ['Drácula', 'Bram Stoker', 2], ['Frankenstein', 'Mary Shelley', 2], ['Mafalda', 'Quino', 2],
    ['Tintín', 'Hergé', 2], ['Peter Pan', 'J. M. Barrie', 2], ['Spider-Man', 'Stan Lee y Steve Ditko', 2],
    ['El capitán Alatriste', 'Arturo Pérez-Reverte', 3], ['Pepe Carvalho', 'Manuel Vázquez Montalbán', 3], ['La Celestina', 'Fernando de Rojas', 3],
    ['Don Juan Tenorio', 'José Zorrilla', 3], ['Gregor Samsa', 'Franz Kafka', 3], ['El principito', 'Antoine de Saint-Exupéry', 3]
  ] },
  { id: 'grupo', nombre: 'Cantante → su grupo', emoji: '🎤', pregunta: '¿De qué grupo era la voz?', parejas: [
    ['Freddie Mercury', 'Queen', 1], ['Bono', 'U2', 1], ['Mick Jagger', 'The Rolling Stones', 1], ['John Lennon', 'The Beatles', 1],
    ['Amaia Montero', 'La Oreja de Van Gogh', 1], ['Chris Martin', 'Coldplay', 1],
    ['Kurt Cobain', 'Nirvana', 2], ['Axl Rose', "Guns N' Roses", 2], ['Brian Johnson', 'AC/DC', 2], ['Dani Martín', 'El Canto del Loco', 2],
    ['Pau Donés', 'Jarabe de Palo', 2], ['Ana Torroja', 'Mecano', 2], ['Leiva', 'Pereza', 2],
    ['Enrique Bunbury', 'Héroes del Silencio', 3], ['Robe Iniesta', 'Extremoduro', 3], ['Jim Morrison', 'The Doors', 3],
    ['Thom Yorke', 'Radiohead', 3], ['Anthony Kiedis', 'Red Hot Chili Peppers', 3], ['Ian Curtis', 'Joy Division', 3]
  ] },
  { id: 'pintor', nombre: 'Pintor → su cuadro', emoji: '🎨', pregunta: '¿Qué cuadro pintó?', parejas: [
    ['Leonardo da Vinci', 'La Gioconda', 1], ['Pablo Picasso', 'Guernica', 1], ['Diego Velázquez', 'Las meninas', 1],
    ['Vincent van Gogh', 'La noche estrellada', 1], ['Edvard Munch', 'El grito', 1],
    ['Salvador Dalí', 'La persistencia de la memoria', 2], ['Francisco de Goya', 'El tres de mayo de 1808', 2], ['Sandro Botticelli', 'El nacimiento de Venus', 2],
    ['Johannes Vermeer', 'La joven de la perla', 2], ['Gustav Klimt', 'El beso', 2],
    ['El Bosco', 'El jardín de las delicias', 3], ['El Greco', 'El entierro del conde de Orgaz', 3], ['Joaquín Sorolla', 'Paseo a orillas del mar', 3],
    ['Edward Hopper', 'Nighthawks', 3], ['Caspar David Friedrich', 'El caminante sobre el mar de nubes', 3], ['Georges Seurat', 'Tarde de domingo en la isla de la Grande Jatte', 3]
  ] }
];
