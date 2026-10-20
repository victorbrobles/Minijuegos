// server/data/seeds/buscaminas/musica.js

const plantillas = [
  // 1 - 10: Rock Clásico y Bandas Legendarias
  {
    c: 'Bandas de rock británico históricas',
    f: ['The Beatles', 'Queen', 'The Rolling Stones', 'Pink Floyd'],
    m: ['Led Zeppelin', 'The Who', 'Coldplay'],
    d: ['The Clash', 'Deep Purple', 'Black Sabbath'],
    t: ['AC/DC', 'Nirvana', 'Guns N\' Roses', 'Metallica', 'U2']
  },
  {
    c: 'Canciones de la banda Queen',
    f: ['Bohemian Rhapsody', 'We Will Rock You', 'Don\'t Stop Me Now', 'Another One Bites the Dust'],
    m: ['Radio Ga Ga', 'Under Pressure', 'I Want to Break Free'],
    d: ['Somebody to Love', 'The Show Must Go On', 'Killer Queen'],
    t: ['Imagine', 'Hotel California', 'Stairway to Heaven', 'Sweet Child O\' Mine', 'Hey Jude']
  },
  {
    c: 'Canciones del grupo The Beatles',
    f: ['Hey Jude', 'Yesterday', 'Let It Be', 'Help!'],
    m: ['Come Together', 'Yellow Submarine', 'Here Comes the Sun'],
    d: ['Eleanor Rigby', 'Something', 'A Day in the Life'],
    t: ['Imagine', 'Bohemian Rhapsody', 'Wonderwall', 'Angie', 'Paint It Black']
  },
  {
    c: 'Bandas icónicas de Heavy Metal',
    f: ['Iron Maiden', 'Metallica', 'Judas Priest', 'Black Sabbath'],
    m: ['Megadeth', 'Slayer', 'Pantera'],
    d: ['Motörhead', 'Anthrax', 'Saxon'],
    t: ['Red Hot Chili Peppers', 'The Rolling Stones', 'The Police', 'Aerosmith', 'U2']
  },
  {
    c: 'Grupos y bandas del subgénero Grunge',
    f: ['Nirvana', 'Pearl Jam', 'Soundgarden', 'Alice in Chains'],
    m: ['Stone Temple Pilots', 'Silverchair', 'Mudhoney'],
    d: ['Screaming Trees', 'Temple of the Dog', 'Mad Season'],
    t: ['Green Day', 'Blink-182', 'The Offspring', 'Foo Fighters', 'Radiohead']
  },
  {
    c: 'Grupos pioneros del Punk Rock clásico y skate punk',
    f: ['The Ramones', 'Sex Pistols', 'The Clash', 'Green Day'],
    m: ['The Damned', 'Bad Religion', 'The Offspring'],
    d: ['Buzzcocks', 'Dead Kennedys', 'Minor Threat'],
    t: ['Metallica', 'Guns N\' Roses', 'Linkin Park', 'Oasis', 'Led Zeppelin']
  },
  {
    c: 'Bandas pertenecientes al Rock / Pop en español',
    f: ['Soda Stereo', 'Héroes del Silencio', 'Maná', 'El Canto del Loco'],
    m: ['Los Rodríguez', 'Enanitos Verdes', 'Estopa'],
    d: ['Café Tacvba', 'Los Fabulosos Cadillacs', 'Fito & Fitipaldis'],
    t: ['Gipsy Kings', 'Il Divo', 'Buena Vista Social Club', 'La Oreja de Van Gogh (Pop)', 'Mecano (Tecnopop)']
  },
  {
    c: 'Canciones emblemáticas de la banda AC/DC',
    f: ['Highway to Hell', 'Back in Black', 'Thunderstruck', 'Hells Bells'],
    m: ['T.N.T.', 'You Shook Me All Night Long', 'Shoot to Thrill'],
    d: ['Dirty Deeds Done Dirt Cheap', 'For Those About to Rock', 'Whole Lotta Rosie'],
    t: ['Paranoid', 'Smoke on the Water', 'Iron Man', 'Master of Puppets', 'Sweet Child O\' Mine']
  },
  {
    c: 'Canciones de la banda Guns N\' Roses',
    f: ['Sweet Child O\' Mine', 'Welcome to the Jungle', 'November Rain', 'Paradise City'],
    m: ['Knockin\' on Heaven\'s Door (cover)', 'Don\'t Cry', 'Patience'],
    d: ['Civil War', 'Estranged', 'You Could Be Mine'],
    t: ['Livin\' on a Prayer', 'Smells Like Teen Spirit', 'Dream On', 'Poison', 'Always']
  },
  {
    c: 'Bandas de Rock Progresivo y Psicodélico',
    f: ['Pink Floyd', 'King Crimson', 'Yes', 'Genesis'],
    m: ['Rush', 'Jethro Tull', 'The Doors'],
    d: ['Emerson, Lake & Palmer', 'Camel', 'Marillion'],
    t: ['Sex Pistols', 'The Ramones', 'Blink-182', 'The Clash', 'Green Day']
  },

  // 11 - 20: Pop, R&B y Grandes Ventas
  {
    c: 'Artistas con álbumes que superan 40 millones de copias vendidas',
    f: ['Michael Jackson', 'AC/DC', 'Pink Floyd', 'Whitney Houston'],
    m: ['Meat Loaf', 'Eagles', 'Fleetwood Mac'],
    d: ['Shania Twain', 'Led Zeppelin', 'Celine Dion'],
    t: ['Beyoncé', 'Taylor Swift', 'Drake', 'Bruno Mars', 'Ed Sheeran']
  },
  {
    c: 'Cantantes solistas femeninas de Pop internacional',
    f: ['Madonna', 'Britney Spears', 'Dua Lipa', 'Katy Perry'],
    m: ['Lady Gaga', 'Ariana Grande', 'Rihanna'],
    d: ['Kylie Minogue', 'Billie Eilish', 'Olivia Rodrigo'],
    t: ['Kurt Cobain', 'Freddie Mercury', 'Chester Bennington', 'Bono', 'Mick Jagger']
  },
  {
    c: 'Canciones interpretadas por Michael Jackson',
    f: ['Billie Jean', 'Thriller', 'Beat It', 'Smooth Criminal'],
    m: ['Black or White', 'Bad', 'Man in the Mirror'],
    d: ['Earth Song', 'They Don\'t Care About Us', 'Rock With You'],
    t: ['Purple Rain', 'Stayin\' Alive', 'Superstition', 'Let\'s Dance', 'Like a Virgin']
  },
  {
    c: 'Artistas femeninas con más premios Grammy de la historia',
    f: ['Beyoncé', 'Taylor Swift', 'Adele', 'Alison Krauss'],
    m: ['Aretha Franklin', 'Alicia Keys', 'Ella Fitzgerald'],
    d: ['Emmylou Harris', 'Leontyne Price', 'CeCe Winans'],
    t: ['Katy Perry', 'Nicki Minaj', 'Jennifer Lopez', 'Avril Lavigne', 'Shakira']
  },
  {
    c: 'Canciones del álbum "Thriller" de Michael Jackson (1982)',
    f: ['Thriller', 'Billie Jean', 'Beat It', 'Wanna Be Startin\' Somethin\''],
    m: ['Human Nature', 'P.Y.T. (Pretty Young Thing)', 'The Girl Is Mine'],
    d: ['Baby Be Mine', 'The Lady in My Life', 'Carousel (bonus)'],
    t: ['Bad', 'Smooth Criminal', 'Black or White', 'Man in the Mirror', 'Earth Song']
  },
  {
    c: 'Canciones pertenecientes a la discografía de Taylor Swift',
    f: ['Shake It Off', 'Blank Space', 'Love Story', 'Bad Blood'],
    m: ['Cruel Summer', 'Anti-Hero', 'You Belong With Me'],
    d: ['Cardigan', 'All Too Well', 'Lover'],
    t: ['Roar', 'Firework', 'Single Ladies', 'Hello', 'Umbrella']
  },
  {
    c: 'Cantantes de Soul y R&B clásico',
    f: ['Aretha Franklin', 'Whitney Houston', 'Etta James', 'Amy Winehouse'],
    m: ['Diana Ross', 'Tina Turner', 'Nina Simone'],
    d: ['Roberta Flack', 'Gladys Knight', 'Dusty Springfield'],
    t: ['Celine Dion', 'Barbra Streisand', 'Madonna', 'Cher', 'Britney Spears']
  },
  {
    c: 'Canciones de la discografía de Madonna',
    f: ['Like a Virgin', 'Material Girl', 'Vogue', 'Like a Prayer'],
    m: ['La Isla Bonita', 'Hung Up', 'Papa Don\'t Preach'],
    d: ['Frozen', 'Ray of Light', 'Music'],
    t: ['Toxic', 'Bad Romance', 'Single Ladies', 'Genie in a Bottle', 'Believe']
  },
  {
    c: 'Boybands de pop exitosas a nivel global',
    f: ['Backstreet Boys', 'One Direction', 'NSYNC', 'Take That'],
    m: ['Boyz II Men', 'Jonas Brothers', 'New Kids on the Block'],
    d: ['Westlife', '5 Seconds of Summer', 'The Wanted'],
    t: ['Spice Girls', 'Destiny\'s Child', 'TLC', 'Little Mix', 'Fifth Harmony']
  },
  {
    c: 'Girlgroups o bandas femeninas de pop internacionales',
    f: ['Spice Girls', 'Destiny\'s Child', 'TLC', 'BLACKPINK'],
    m: ['Little Mix', 'Fifth Harmony', 'Pussycat Dolls'],
    d: ['Girls Aloud', 'The Supremes', 'All Saints'],
    t: ['Backstreet Boys', 'One Direction', 'NSYNC', 'Take That', 'Jonas Brothers']
  },

  // 21 - 30: Hip-Hop, Rap y Música Urbana
  {
    c: 'Artistas del movimiento Hip-Hop y Rap estadounidense clásico',
    f: ['Eminem', 'Tupac Shakur', 'Snoop Dogg', '50 Cent'],
    m: ['The Notorious B.I.G.', 'Dr. Dre', 'Kendrick Lamar'],
    d: ['Nas', 'Jay-Z', 'J. Cole'],
    t: ['Bob Marley', 'Michael Jackson', 'Bruno Mars', 'The Weeknd', 'Jason Derulo']
  },
  {
    c: 'Cantantes masculinos de reggaeton y música urbana latina',
    f: ['Bad Bunny', 'Daddy Yankee', 'J Balvin', 'Maluma'],
    m: ['Rauw Alejandro', 'Ozuna', 'Anuel AA'],
    d: ['Feid', 'Don Omar', 'Nicky Jam'],
    t: ['Ricky Martin', 'Luis Miguel', 'Chayanne', 'Marc Anthony', 'Enrique Iglesias']
  },
  {
    c: 'Cantantes femeninas destacadas del género urbano y reggaeton',
    f: ['Karol G', 'Becky G', 'Natti Natasha', 'Anitta'],
    m: ['Rosalía', 'Nathy Peluso', 'Nicki Nicole'],
    d: ['Ivy Queen', 'Young Miko', 'Cazzu'],
    t: ['Shakira', 'Thalía', 'Paulina Rubio', 'Gloria Estefan', 'Laura Pausini']
  },
  {
    c: 'Canciones icónicas de Daddy Yankee',
    f: ['Gasolina', 'Dura', 'Con Calma', 'Lo Que Pasó, Pasó'],
    m: ['Rompe', 'Ella Me Levantó', 'Llamado de Emergencia'],
    d: ['Pose', 'La Despedida', 'Impacto'],
    t: ['Dákiti', 'Mi Gente', 'Hawái', 'Safaera', 'Ginza']
  },
  {
    c: 'Canciones icónicas de Bad Bunny',
    f: ['Dákiti', 'Tití Me Preguntó', 'Safaera', 'Yo Perreo Sola'],
    m: ['Callaíta', 'Me Porto Bonito', 'Moscow Mule'],
    d: ['Chambea', 'Amorfoda', 'Vete'],
    t: ['Gasolina', 'Ginza', 'Pepas', 'Tusa', 'Despacito']
  },
  {
    c: 'Productores y beatmakers de rap y música urbana',
    f: ['Bizarrap', 'Dr. Dre', 'Metro Boomin', 'Pharrell Williams'],
    m: ['Timbaland', 'Tainy', 'DJ Khaled'],
    d: ['Kanye West (productor)', 'Rick Rubin', 'Murda Beatz'],
    t: ['David Guetta', 'Martin Garrix', 'Calvin Harris', 'Avicii', 'Tiësto']
  },
  {
    c: 'Canciones clásicas del Rap estadounidense de los 90',
    f: ['Lose Yourself', 'California Love', 'Juicy', 'Gangsta\'s Paradise'],
    m: ['Nuthin\' but a \'G\' Thang', 'Changes', 'C.R.E.A.M.'],
    d: ['Dear Mama', 'NY State of Mind', 'Hypnotize'],
    t: ['In Da Club (2003)', 'Empire State of Mind (2009)', 'God\'s Plan', 'Hotline Bling', 'HUMBLE.']
  },
  {
    c: 'Grupos o colectivos legendarios de Rap',
    f: ['Wu-Tang Clan', 'N.W.A', 'Run-DMC', 'Beastie Boys'],
    m: ['Outkast', 'A Tribe Called Quest', 'Cypress Hill'],
    d: ['Public Enemy', 'Mobb Deep', 'Fugees'],
    t: ['Linkin Park', 'Gorillaz', 'Red Hot Chili Peppers', 'Rage Against the Machine', 'The Black Eyed Peas']
  },
  {
    c: 'Artistas españoles de rap y música urbana',
    f: ['Kase.O', 'C. Tangana', 'Morad', 'Quevedo'],
    m: ['Natos y Waor', 'Ayax y Prok', 'SFDK'],
    d: ['Nach', 'ToteKing', 'Delaossa'],
    t: ['Melendi', 'Alejandro Sanz', 'David Bisbal', 'Pablo Alborán', 'Manuel Carrasco']
  },
  {
    c: 'Canciones producidas en BZRP Music Sessions',
    f: ['Quédate (Quevedo)', 'Session #53 (Shakira)', 'Session #36 (Nathy Peluso)', 'Session #49 (Residente)'],
    m: ['Session #52 (Quevedo)', 'Session #23 (Paulo Londra)', 'Session #50 (Duki)'],
    d: ['Session #40 (Eladio Carrión)', 'Session #57 (Milo J)', 'Session #39 (Snow Tha Product)'],
    t: ['Despacito', 'Dákiti', 'Hawái', 'Tusa', 'Todo de Ti']
  },

  // 31 - 40: Música Clásica y Bandas Sonoras
  {
    c: 'Compositores de música clásica occidental',
    f: ['Ludwig van Beethoven', 'Wolfgang Amadeus Mozart', 'Johann Sebastian Bach', 'Antonio Vivaldi'],
    m: ['Frédéric Chopin', 'Piotr Ilich Chaikovski', 'Johannes Brahms'],
    d: ['Franz Liszt', 'Claude Debussy', 'Richard Wagner'],
    t: ['Hans Zimmer', 'John Williams', 'Ennio Morricone', 'Ludovico Einaudi', 'Howard Shore']
  },
  {
    c: 'Compositores de bandas sonoras de cine',
    f: ['Hans Zimmer', 'John Williams', 'Ennio Morricone', 'Howard Shore'],
    m: ['Danny Elfman', 'Alan Silvestri', 'James Horner'],
    d: ['Alexandre Desplat', 'Thomas Newman', 'Max Steiner'],
    t: ['Wolfgang Amadeus Mozart', 'Ludwig van Beethoven', 'Johann Sebastian Bach', 'Frédéric Chopin', 'Antonio Vivaldi']
  },
  {
    c: 'Bandas sonoras compuestas por John Williams',
    f: ['Star Wars', 'Parque Jurásico (Jurassic Park)', 'Tiburón (Jaws)', 'Harry Potter (tema principal)'],
    m: ['Indiana Jones', 'E.T., el extraterrestre', 'La lista de Schindler'],
    d: ['Superman (1978)', 'Encuentros en la tercera fase', 'Solo en casa (Home Alone)'],
    t: ['Gladiator', 'El Señor de los Anillos', 'El Rey León', 'Piratas del Caribe', 'Inception']
  },
  {
    c: 'Bandas sonoras compuestas por Hans Zimmer',
    f: ['Gladiator', 'El Rey León (1994)', 'Piratas del Caribe (tema)', 'Origen (Inception)'],
    m: ['Interstellar', 'El Caballero Oscuro', 'Dune (2021)'],
    d: ['Dunkerque', 'La delgada línea roja', 'Rain Man'],
    t: ['Star Wars', 'Parque Jurásico', 'Tiburón', 'Indiana Jones', 'Harry Potter']
  },
  {
    c: 'Bandas sonoras compuestas por Ennio Morricone',
    f: ['El bueno, el feo y el malo', 'Cinema Paradiso', 'La misión', 'Por un puñado de dólares'],
    m: ['Hasta que llegó su hora', 'Los odiosos ocho', 'Érase una vez en América'],
    d: ['La muerte tenía un precio', 'Los intocables de Eliot Ness', 'Días de cielo'],
    t: ['El Padrino (Nino Rota)', 'Tiburón', 'Gladiator', 'Braveheart', 'Superman']
  },
  {
    c: 'Obras maestras de Ludwig van Beethoven',
    f: ['Quinta Sinfonía (Destino)', 'Novena Sinfonía (Himno de la Alegría)', 'Para Elisa (Für Elise)', 'Claro de Luna (Sonata)'],
    m: ['Tercera Sinfonía (Heroica)', 'Sonata Patética', 'Sexta Sinfonía (Pastoral)'],
    d: ['Séptima Sinfonía', 'Sonata Appassionata', 'Missa Solemnis'],
    t: ['Las Cuatro Estaciones (Vivaldi)', 'El lago de los cisnes (Chaikovski)', 'La flauta mágica (Mozart)', 'Rapsodia en azul (Gershwin)', 'El barbero de Sevilla (Rossini)']
  },
  {
    c: 'Óperas compuestas por Wolfgang Amadeus Mozart',
    f: ['La flauta mágica', 'Las bodas de Fígaro', 'Don Giovanni', 'Così fan tutte'],
    m: ['El rapto en el serrallo', 'Idomeneo, rey de Creta', 'La clemencia de Tito'],
    d: ['Mitridate, rey de Ponto', 'Bastien und Bastienne', 'Ascanio in Alba'],
    t: ['La Traviata (Verdi)', 'Carmen (Bizet)', 'El barbero de Sevilla (Rossini)', 'Tosca (Puccini)', 'Madama Butterfly (Puccini)']
  },
  {
    c: 'Ballets de Piotr Ilich Chaikovski',
    f: ['El lago de los cisnes', 'El cascanueces', 'La bella durmiente', 'Romeo y Julieta (obertura)'],
    m: ['Obertura 1812', 'Concierto para piano n.º 1', 'Sinfonía n.º 6 (Patética)'],
    d: ['Eugene Onegin (ópera)', 'Capricho italiano', 'Marcha eslava'],
    t: ['El pájaro de fuego (Stravinsky)', 'La consagración de la primavera (Stravinsky)', 'Bolero (Ravel)', 'Giselle (Adam)', 'Carmen (Bizet)']
  },
  {
    c: 'Compositores de música barroca',
    f: ['Johann Sebastian Bach', 'Antonio Vivaldi', 'Georg Friedrich Händel', 'Claudio Monteverdi'],
    m: ['Henry Purcell', 'Arcangelo Corelli', 'Jean-Philippe Rameau'],
    d: ['Georg Philipp Telemann', 'François Couperin', 'Heinrich Schütz'],
    t: ['Wolfgang Amadeus Mozart', 'Ludwig van Beethoven', 'Franz Joseph Haydn', 'Frédéric Chopin', 'Franz Liszt']
  },
  {
    c: 'Conciertos de violín de "Las cuatro estaciones" de Vivaldi',
    f: ['La primavera', 'El verano', 'El otoño', 'El invierno'],
    m: ['Concierto en mi mayor (Primavera)', 'Concierto en sol menor (Verano)', 'Concierto en fa mayor (Otoño)'],
    d: ['Concierto en fa menor (Invierno)', 'Opus 8 n.º 1', 'Opus 8 n.º 2'],
    t: ['El amanecer', 'El mediodía', 'La tormenta marina (separada)', 'El plenilunio', 'La noche oscura']
  },

  // 41 - 50: Instrumentos Musicales y Teoría
  {
    c: 'Instrumentos de la familia de viento-madera',
    f: ['Flauta travesera', 'Clarinete', 'Oboe', 'Saxofón'],
    m: ['Fagot', 'Flautín (Piccolo)', 'Corno inglés'],
    d: ['Contrafagot', 'Clarinete bajo', 'Oboe d\'amore'],
    t: ['Trompeta', 'Trombón', 'Tuba', 'Trompa (corno francés)', 'Violín']
  },
  {
    c: 'Instrumentos de la familia de viento-metal',
    f: ['Trompeta', 'Trombón', 'Tuba', 'Trompa (corno francés)'],
    m: ['Fliscorno', 'Bombardino (Eufonio)', 'Corneta'],
    d: ['Sousafón', 'Trompeta pícolo', 'Trombón bajo'],
    t: ['Clarinete', 'Flauta travesera', 'Saxofón', 'Oboe', 'Fagot']
  },
  {
    c: 'Instrumentos de cuerda frotada de orquesta sinfónica',
    f: ['Violín', 'Violonchelo', 'Viola', 'Contrabajo'],
    m: ['Violín primero', 'Violín segundo', 'Arco de cerdas'],
    d: ['Viola da gamba (antigua)', 'Octabajo', 'Viola d\'amore'],
    t: ['Guitarra clásica', 'Arpa', 'Piano', 'Mandolina', 'Ukelele']
  },
  {
    c: 'Instrumentos de percusión con afinación determinada (melódicos)',
    f: ['Xilófono', 'Marimba', 'Timbales de orquesta', 'Campanas tubulares'],
    m: ['Glockenspiel', 'Vibráfono', 'Celesta'],
    d: ['Crotales', 'Lira de marcha', 'Steelpan (tambor de acero)'],
    t: ['Bombo', 'Caja clara (tarola)', 'Platillos', 'Triángulo', 'Pandereta']
  },
  {
    c: 'Instrumentos de cuerda pulsada',
    f: ['Guitarra acústica', 'Arpa', 'Ukelele', 'Bajo eléctrico'],
    m: ['Laúd', 'Banjo', 'Mandolina'],
    d: ['Cítara', 'Sitar indio', 'Koto japonés'],
    t: ['Violín', 'Violonchelo', 'Flauta', 'Trompeta', 'Batería']
  },
  {
    c: 'Notas musicales de la escala diatónica natural',
    f: ['Do', 'Re', 'Mi', 'Fa'],
    m: ['Sol', 'La', 'Si'],
    d: ['C (cifrado)', 'D (cifrado)', 'A (cifrado)'],
    t: ['Fa sostenido (alterada)', 'Si bemol (alterada)', 'Do sostenido', 'Mi bemol', 'Sol sostenido']
  },
  {
    c: 'Figuras rítmicas de duración musical',
    f: ['Redonda', 'Blanca', 'Negra', 'Corchea'],
    m: ['Semicorchea', 'Fusa', 'Semifusa'],
    d: ['Garrapatea', 'Semigarrapatea', 'Cuadrada (breve)'],
    t: ['Sostenido', 'Bemol', 'Becuadro', 'Calderón', 'Puntillo']
  },
  {
    c: 'Tipos de voces humanas en el canto lírico',
    f: ['Soprano', 'Tenor', 'Barítono', 'Bajo'],
    m: ['Mezzosoprano', 'Contralto', 'Contratenor'],
    d: ['Soprano ligera', 'Bajo profundo', 'Tenor lírico'],
    t: ['Falsete (técnica)', 'Vibrato (técnica)', 'Voz de pecho', 'Autotune', 'Voz rota']
  },
  {
    c: 'Alteraciones musicales sobre el pentagrama',
    f: ['Sostenido (#)', 'Bemol (b)', 'Becuadro', 'Doble sostenido'],
    m: ['Doble bemol', 'Microtono', 'Sostenido y medio'],
    d: ['Semibemol', 'Sesquisostenido', 'Sesquibemol'],
    t: ['Clave de sol', 'Compás', 'Silencio', 'Puntillo', 'Ligadura']
  },
  {
    c: 'Partes que componen una batería acústica estándar',
    f: ['Bombo', 'Caja (redoblante)', 'Platillo Charles (Hi-hat)', 'Platillo Ride'],
    m: ['Tom aéreo (Tom 1)', 'Tom de suelo (Floor tom)', 'Platillo Crash'],
    d: ['Pedal de bombo', 'Bordón de caja', 'Platillo Splash'],
    t: ['Pastilla de sonido', 'Clavijero', 'Mástil', 'Puente de madera', 'Trastes']
  },

  // 51 - 60: Música Electrónica, Dance y DJs
  {
    c: 'Productores y DJs de música electrónica / EDM',
    f: ['David Guetta', 'Avicii', 'Calvin Harris', 'Martin Garrix'],
    m: ['Tiësto', 'Skrillex', 'Marshmello'],
    d: ['Deadmau5', 'Armin van Buuren', 'Afrojack'],
    t: ['Daft Punk', 'Eminem', 'Drake', 'Bruno Mars', 'Justin Bieber']
  },
  {
    c: 'Canciones emblemáticas del DJ sueco Avicii',
    f: ['Wake Me Up', 'Levels', 'Hey Brother', 'Waiting for Love'],
    m: ['The Nights', 'Addicted to You', 'I Could Be the One'],
    d: ['Silhouettes', 'Fade into Darkness', 'SOS'],
    t: ['Titanium (Guetta)', 'Animals (Garrix)', 'Summer (Harris)', 'Faded (Walker)', 'Clarity (Zedd)']
  },
  {
    c: 'Canciones emblemáticas de David Guetta',
    f: ['Titanium', 'Memories', 'Without You', 'Play Hard'],
    m: ['When Love Takes Over', 'Sexy Bitch', 'Hey Mama'],
    d: ['Love Is Gone', 'Dangerous', 'I\'m Good (Blue)'],
    t: ['Wake Me Up', 'Levels', 'Animals', 'Summer', 'One More Time']
  },
  {
    c: 'Subgéneros reconocidos de la música electrónica',
    f: ['Techno', 'House', 'Trance', 'Dubstep'],
    m: ['Drum and Bass', 'Synthwave', 'Hardstyle'],
    d: ['Ambient', 'Deep House', 'Psytrance'],
    t: ['Heavy Metal', 'Reggae', 'Bossa Nova', 'Flamenco', 'Country']
  },
  {
    c: 'Canciones de la banda electrónica Daft Punk',
    f: ['Get Lucky', 'One More Time', 'Around the World', 'Harder, Better, Faster, Stronger'],
    m: ['Da Funk', 'Instant Crush', 'Lose Yourself to Dance'],
    d: ['Technologic', 'Aerodynamic', 'Digital Love'],
    t: ['Titanium', 'Wake Me Up', 'Animals', 'Levels', 'Satisfaction']
  },
  {
    c: 'Festivales mundiales multitudinarios de música electrónica',
    f: ['Tomorrowland (Bélgica)', 'Ultra Music Festival (Miami)', 'EDC Las Vegas', 'Creamfields (Reino Unido)'],
    m: ['Defqon.1 (Países Bajos)', 'Awakenings (Ámsterdam)', 'Mysteryland'],
    d: ['Sonar (Barcelona)', 'Time Warp (Alemania)', 'Sunburn Festival (India)'],
    t: ['Glastonbury (rock/pop)', 'Woodstock', 'Coachella (general)', 'Wacken (metal)', 'Viña Rock']
  },
  {
    c: 'DJs referentes de la música Techno mundial',
    f: ['Carl Cox', 'Amelie Lens', 'Charlotte de Witte', 'Paul Kalkbrenner'],
    m: ['Richie Hawtin', 'Adam Beyer', 'Nina Kraviz'],
    d: ['Jeff Mills', 'Boris Brejcha', 'Sven Väth'],
    t: ['David Guetta', 'Martin Garrix', 'Avicii', 'Steve Aoki', 'Marshmello']
  },
  {
    c: 'Canciones del dúo francés Daft Punk del álbum "Random Access Memories"',
    f: ['Get Lucky', 'Instant Crush', 'Lose Yourself to Dance', 'Give Life Back to Music'],
    m: ['Giorgio by Moroder', 'Touch', 'Doin\' It Right'],
    d: ['Contact', 'Beyond', 'Within'],
    t: ['One More Time', 'Around the World', 'Harder, Better, Faster', 'Da Funk', 'Technologic']
  },
  {
    c: 'DJs o productores de música Trance internacional',
    f: ['Armin van Buuren', 'Tiësto (etapa clásica)', 'Paul van Dyk', 'Above & Beyond'],
    m: ['Ferry Corsten', 'Aly & Fila', 'ATB'],
    d: ['Cosmic Gate', 'John O\'Callaghan', 'Gareth Emery'],
    t: ['Skrillex (Dubstep)', 'Diplo', 'Carl Cox (Techno)', 'The Chainsmokers', 'Steve Aoki']
  },
  {
    c: 'Canciones de Calvin Harris que han liderado listas globales',
    f: ['Summer', 'This Is What You Came For', 'Feel So Close', 'One Kiss'],
    m: ['Blame', 'Sweet Nothing', 'We Found Love (con Rihanna)'],
    d: ['Outside', 'I Need Your Love', 'Acceptable in the 80s'],
    t: ['Wake Me Up', 'Titanium', 'Animals', 'Faded', 'Clarity']
  },

  // 61 - 70: Música Española y Flamenco
  {
    c: 'Artistas españoles con ventas millonarias de discos a nivel internacional',
    f: ['Julio Iglesias', 'Rosalía', 'Alejandro Sanz', 'Enrique Iglesias'],
    m: ['David Bisbal', 'Joaquín Sabina', 'Melendi'],
    d: ['Camilo Sesto', 'Rocío Dúrcal', 'Raphael'],
    t: ['Luis Fonsi', 'Ricardo Arjona', 'Juanes', 'Chayanne', 'Ricky Martin']
  },
  {
    c: 'Canciones populares del cantante Alejandro Sanz',
    f: ['Corazón Partío', 'Amiga Mía', 'Y, ¿Si Fuera Ella?', 'Mi Soledad y Yo'],
    m: ['Pisando Fuerte', 'La Fuerza del Corazón', 'No Es lo Mismo'],
    d: ['Looking for Paradise', 'Quisiera Ser', 'Viviendo Deprisa'],
    t: ['Bulería', 'Ave María', 'Bailando', '19 Días y 500 Noches', 'Caminando por la Vida']
  },
  {
    c: 'Grandes figuras del Flamenco y la guitarra flamenca',
    f: ['Paco de Lucía', 'Camarón de la Isla', 'Lola Flores', 'Enrique Morente'],
    m: ['Tomatito', 'Vicente Amigo', 'Carmen Amaya'],
    d: ['Niña de los Peines', 'Manolo Sanlúcar', 'Diego el Cigala'],
    t: ['Julio Iglesias', 'Joaquín Sabina', 'Joan Manuel Serrat', 'Plácido Domingo', 'Nino Bravo']
  },
  {
    c: 'Palo o estilos reconocidos del cante y baile Flamenco',
    f: ['Bulería', 'Soleá', 'Fandango', 'Seguirilla'],
    m: ['Alegrías', 'Tangos flamencos', 'Sevillanas'],
    d: ['Tarantas', 'Malagueñas', 'Tientos'],
    t: ['Salsa cubana', 'Bachata dominicana', 'Merengue', 'Cumbia', 'Reggaeton']
  },
  {
    c: 'Canciones del cantautor Joaquín Sabina',
    f: ['19 Días y 500 Noches', 'Y Nos Dieron las Diez', 'Princesa', 'Pacto Entre Caballeros'],
    m: ['Calle Melancolía', 'Por el Bulevar de los Sueños Rotos', 'Contigo'],
    d: ['¿Quién Me Ha Robado el Mes de Abril?', 'La del Pirata Cojo', 'Pongamos que Hablo de Madrid'],
    t: ['Corazón Partío', 'Mediterráneo', 'La Chica de Ayer', 'Bulería', 'Soldadito Marinero']
  },
  {
    c: 'Grupos emblemáticos del Pop Rock español de los años 80 ("La Movida")',
    f: ['Radio Futura', 'Nacha Pop', 'Los Secretos', 'Alaska y Dinarama'],
    m: ['Hombres G', 'Mecano', 'Zombies'],
    d: ['Parálisis Permanente', 'Danza Invisible', 'Gabinete Caligari'],
    t: ['El Canto del Loco', 'Estopa', 'Amaral', 'La Oreja de Van Gogh', 'Vetusta Morla']
  },
  {
    c: 'Canciones de la banda Mecano',
    f: ['Hijo de la Luna', 'Hoy No Me Puedo Levantar', 'Mujer Contra Mujer', 'Barco a Venus'],
    m: ['Me Cuesta Tanto Olvidarte', 'Cruz de Navajas', 'Un Año Más'],
    d: ['Maquillaje', 'La Fuerza del Destino', 'Ay Qué Pesado'],
    t: ['La Chica de Ayer', 'Devuélveme a mi Chica', 'A quién le importa', 'Déjame', 'Princesa']
  },
  {
    c: 'Canciones del dúo español Estopa',
    f: ['La Raja de Tu Falda', 'Tu Calorro', 'Vino Tinto', 'Como Camarón'],
    m: ['Pastillas de Freno', 'Cacho a Cacho', 'Partiendo la Pana'],
    d: ['Fuente de Energía', 'Me Falta el Aliento', 'El Run Run'],
    t: ['Soldadito Marinero', 'Zapatillas', 'La Flaca', 'Princesas', 'Ave María']
  },
  {
    c: 'Canciones de la banda Fito & Fitipaldis',
    f: ['Soldadito Marinero', 'Por la Boca Vive el Pez', 'La Casa por el Tejado', 'Antes de que Cuente Diez'],
    m: ['Me Equivocaría Otra Vez', 'Rojitas las Orejas', 'Acabo de Llegar'],
    d: ['Whisky Barato', 'Cerca de las Vías', 'Corazón Oxidado'],
    t: ['La Raja de Tu Falda', 'Vino Tinto', 'Entre Dos Tierras', 'Zapatillas', 'El Roce de tu Cuerpo']
  },
  {
    c: 'Bandas del Indie / Pop Rock español del siglo XXI',
    f: ['Vetusta Morla', 'Love of Lesbian', 'Lori Meyers', 'Izal'],
    m: ['Miss Caffeina', 'Dorian', 'Sidonie'],
    d: ['La Habitación Roja', 'Viva Suecia', 'León Benavente'],
    t: ['Mecano', 'Radio Futura', 'Nacha Pop', 'Héroes del Silencio', 'Los Secretos']
  },

  // 71 - 80: Música Latina, Salsa, Cumbia y Ritmos Tropicales
  {
    c: 'Grandes figuras de la Salsa clásica y tradicional',
    f: ['Celia Cruz', 'Héctor Lavoe', 'Rubén Blades', 'Marc Anthony'],
    m: ['Willie Colón', 'Cheo Feliciano', 'Ismael Rivera'],
    d: ['Tito Puente', 'Eddie Palmieri', 'Ray Barretto'],
    t: ['Romeo Santos (Bachata)', 'Daddy Yankee', 'J Balvin', 'Don Omar', 'Bad Bunny']
  },
  {
    c: 'Canciones de la "Reina de la Salsa" Celia Cruz',
    f: ['La Vida Es un Carnaval', 'Rie y Llora', 'Quimbara', 'Guantanamera'],
    m: ['La Negra Tiene Tumbao', 'Yo Viviré (I Will Survive)', 'Burundanga'],
    d: ['Toro Mata', 'Usted Abusó', 'Cúcala'],
    t: ['Vivir Mi Vida', 'Pedro Navaja', 'El Cantante', 'Idilio', 'Llorarás']
  },
  {
    c: 'Canciones icónicas del salsero Héctor Lavoe',
    f: ['El Cantante', 'Periódico de Ayer', 'Aguanilé', 'Todo Tiene Su Final'],
    m: ['Juanito Alimaña', 'Che Che Colé', 'Calle Luna, Calle Sol'],
    d: ['Triste y Vacía', 'De Ti Depende', 'Hacha y Machete'],
    t: ['La Vida Es un Carnaval', 'Pedro Navaja', 'Valió la Pena', 'Devórame Otra Vez', 'Procura']
  },
  {
    c: 'Artistas y grupos de Bachata dominicana',
    f: ['Romeo Santos', 'Aventura', 'Juan Luis Guerra', 'Prince Royce'],
    m: ['Frank Reyes', 'Anthony Santos', 'Zacarías Ferreira'],
    d: ['Raulín Rodríguez', 'Monchy & Alexandra', 'Luis Vargas'],
    t: ['Héctor Lavoe', 'Celia Cruz', 'Daddy Yankee', 'J Balvin', 'Rubén Blades']
  },
  {
    c: 'Canciones y éxitos de Juan Luis Guerra y 4.40',
    f: ['Burbujas de Amor', 'La Bilirrubina', 'Ojalá Que Llueva Café', 'Bachata Rosa'],
    m: ['El Niágara en Bicicleta', 'Visa Para un Sueño', 'Las Avispas'],
    d: ['Frío Frío', 'Rosalía (merengue)', 'A Pedir Su Mano'],
    t: ['La Vida Es un Carnaval', 'Obsesión', 'Danza Kuduro', 'Suavemente', 'Vivir Mi Vida']
  },
  {
    c: 'Grandes leyendas de la Bossa Nova brasileña',
    f: ['Antônio Carlos Jobim', 'João Gilberto', 'Astrud Gilberto', 'Vinícius de Moraes'],
    m: ['Stan Getz (jazz bossa)', 'Sérgio Mendes', 'Caetano Veloso'],
    d: ['Baden Powell', 'Chico Buarque', 'Elis Regina'],
    t: ['Ricky Martin', 'Enrique Iglesias', 'Bob Marley', 'Carlos Santana', 'Paco de Lucía']
  },
  {
    c: 'Canciones emblemáticas del cancionero mexicano tradicional (Rancheras y Mariachi)',
    f: ['Cielito Lindo', 'El Rey', 'La Bikina', 'Volver Volver'],
    m: ['México Lindo y Querido', 'La Llorona', 'Si Nos Dejan'],
    d: ['Cielito Lindo Huasteco', 'Échame a Mí la Culpa', 'Paloma Negra'],
    t: ['La Bamba (son jarocho)', 'Despacito', 'La Guantanamera', 'Ojalá Que Llueva Café', 'Burbujas de Amor']
  },
  {
    c: 'Canciones de la artista colombiana Shakira',
    f: ['Hips Don\'t Lie', 'Waka Waka', 'Whenever, Wherever (Suerte)', 'La Tortura'],
    m: ['Antología', 'Ciega, Sordomuda', 'Inevitable'],
    d: ['Ojos Así', 'Loca', 'Monotonía'],
    t: ['On the Floor', 'Bailando', 'Hero', 'Gasolina', 'Mayores']
  },
  {
    c: 'Artistas y bandas de Reggae y Ska reconocidos',
    f: ['Bob Marley', 'The Wailers', 'Peter Tosh', 'Jimmy Cliff'],
    m: ['UB40', 'Ska-P', 'Toots and the Maytals'],
    d: ['Burning Spear', 'Black Uhuru', 'Desmond Dekker'],
    t: ['Snoop Dogg (rapero habitual)', 'Eminem', 'Daddy Yankee', 'Bono', 'Red Hot Chili Peppers']
  },
  {
    c: 'Canciones del ícono del Reggae Bob Marley',
    f: ['No Woman, No Cry', 'Could You Be Loved', 'Three Little Birds', 'One Love'],
    m: ['Is This Love', 'Redemption Song', 'Buffalo Soldier'],
    d: ['Jamming', 'Get Up, Stand Up', 'I Shot the Sheriff'],
    t: ['Red Red Wine', 'Sweat (A La La La La Long)', 'Bad Boys', 'Dreadlock Holiday', 'Informador']
  },

  // 81 - 90: Eurovisión, K-Pop y Tendencias Globales
  {
    c: 'Países ganadores del Festival de Eurovisión en más de 4 ocasiones',
    f: ['Irlanda (7)', 'Suecia (7)', 'Reino Unido (5)', 'Francia (5)'],
    m: ['Luxemburgo (5)', 'Países Bajos (5)', 'Israel (4)'],
    d: ['Italia (3)', 'Dinamarca (3)', 'Ucrania (3)'],
    t: ['España (2 victorias)', 'Alemania (2 victorias)', 'Portugal (1 victoria)', 'Grecia (1 victoria)', 'Bélgica (1 victoria)']
  },
  {
    c: 'Artistas que representaron a España en el Festival de Eurovisión',
    f: ['Massiel (1968)', 'Salomé (1969)', 'Chanel (2022)', 'Rodolfo Chikilicuatre (2008)'],
    m: ['Rosa López (2002)', 'David Civera (2001)', 'Pastora Soler (2012)'],
    d: ['Sergio Dalma (1991)', 'Azúcar Moreno (1990)', 'Mocedades (1973)'],
    t: ['Rosalía', 'David Bisbal (fue corista, no titular)', 'Enrique Iglesias', 'Alejandro Sanz', 'Joaquín Sabina']
  },
  {
    c: 'Bandas y grupos del fenómeno K-Pop surcoreano',
    f: ['BTS', 'BLACKPINK', 'TWICE', 'EXO'],
    m: ['Stray Kids', 'Seventeen', 'NewJeans'],
    d: ['Red Velvet', 'NCT', 'TXT (Tomorrow X Together)'],
    t: ['One Direction', 'Jonas Brothers', 'Little Mix', 'Fifth Harmony', 'Backstreet Boys']
  },
  {
    c: 'Canciones internacionales que superan 2.000 millones de reproducciones en Spotify',
    f: ['Blinding Lights (The Weeknd)', 'Shape of You (Ed Sheeran)', 'Someone You Loved (Lewis Capaldi)', 'Sunflower (Post Malone)'],
    m: ['Starboy (The Weeknd)', 'As It Was (Harry Styles)', 'One Dance (Drake)'],
    d: ['Stay (Kid LAROI & Bieber)', 'Dance Monkey (Tones and I)', 'Rockstar (Post Malone)'],
    t: ['Macarena', 'Bohemian Rhapsody', 'Smells Like Teen Spirit', 'Billie Jean', 'Thriller']
  },
  {
    c: 'Canciones pertenecientes a la discografía de Adele',
    f: ['Rolling in the Deep', 'Someone Like You', 'Hello', 'Set Fire to the Rain'],
    m: ['Skyfall (tema Bond)', 'Easy on Me', 'Chasing Pavements'],
    d: ['When We Were Young', 'Send My Love', 'Hometown Glory'],
    t: ['Stay with Me (Sam Smith)', 'Shallow (Lady Gaga)', 'Bleeding Love', 'Halo (Beyoncé)', 'Roar']
  },
  {
    c: 'Canciones pertenecientes a la discografía de Coldplay',
    f: ['Yellow', 'Viva la Vida', 'Fix You', 'The Scientist'],
    m: ['Clocks', 'Paradise', 'A Sky Full of Stars'],
    d: ['Adventure of a Lifetime', 'In My Place', 'Speed of Sound'],
    t: ['Wonderwall', 'Creep', 'Radioactive', 'Counting Stars', 'Chasing Cars']
  },
  {
    c: 'Canciones pertenecientes a la discografía de Ed Sheeran',
    f: ['Shape of You', 'Thinking Out Loud', 'Perfect', 'Bad Habits'],
    m: ['Castle on the Hill', 'Photograph', 'Shivers'],
    d: ['The A Team', 'Galway Girl', 'Give Me Love'],
    t: ['Someone Like You', 'Stay With Me', 'All of Me', 'Stitches', 'Attention']
  },
  {
    c: 'Canciones de la banda irlandesa U2',
    f: ['With or Without You', 'Sunday Bloody Sunday', 'Where the Streets Have No Name', 'One'],
    m: ['Beautiful Day', 'I Still Haven\'t Found What I\'m Looking For', 'Pride (In the Name of Love)'],
    d: ['Vertigo', 'New Year\'s Day', 'Elevation'],
    t: ['Zombie (Cranberries)', 'Losing My Religion (R.E.M.)', 'Wonderwall', 'Sweet Child O\' Mine', 'Bitter Sweet Symphony']
  },
  {
    c: 'Canciones pertenecientes a la discografía de Bruno Mars',
    f: ['Uptown Funk (con Mark Ronson)', 'Just the Way You Are', 'Locked Out of Heaven', '24K Magic'],
    m: ['When I Was Your Man', 'Grenade', 'Treasure'],
    d: ['That\'s What I Like', 'The Lazy Song', 'Versace on the Floor'],
    t: ['Happy (Pharrell)', 'Can\'t Stop the Feeling', 'Sugar (Maroon 5)', 'Blinding Lights', 'Get Lucky']
  },
  {
    c: 'Canciones pertenecientes a la discografía de Lady Gaga',
    f: ['Bad Romance', 'Poker Face', 'Just Dance', 'Shallow (con Bradley Cooper)'],
    m: ['Born This Way', 'PaparaZZi', 'Alejandro'],
    d: ['Telephone (con Beyoncé)', 'Judas', 'Rain on Me (con Ariana Grande)'],
    t: ['Firework (Katy Perry)', 'Single Ladies', 'Toxic', 'Tik Tok (Kesha)', 'Wrecking Ball']
  },

  // 91 - 100: Álbumes Históricos y Curiosidades Musicales
  {
    c: 'Álbumes que han ganado el Grammy a Álbum del Año más de dos veces por su artista principal',
    f: ['Taylor Swift (4 veces)', 'Frank Sinatra (3 veces)', 'Stevie Wonder (3 veces)', 'Paul Simon (3 veces)'],
    m: ['Fearless (Taylor Swift)', '1989 (Taylor Swift)', 'Folklore (Taylor Swift)'],
    d: ['Midnights (Taylor Swift)', 'Innervisions (Stevie Wonder)', 'Graceland (Paul Simon)'],
    t: ['Michael Jackson (1 vez)', 'Beyoncé (0 veces como solista)', 'Adele (2 veces)', 'The Beatles (1 vez)', 'Madonna (0 veces)']
  },
  {
    c: 'Canciones que han ocupado el número 1 en Billboard Hot 100 por 16 o más semanas',
    f: ['Old Town Road (Lil Nas X - 19 semanas)', 'Despacito (Fonsi & Daddy Yankee - 16)', 'One Sweet Day (Carey & Boyz II Men - 16)', 'Last Night (Morgan Wallen - 16)'],
    m: ['As It Was (Harry Styles - 15 semanas)', 'Uptown Funk (14 semanas)', 'I Will Always Love You (14 semanas)'],
    d: ['I Gotta Feeling (14 semanas)', 'We Belong Together (14 semanas)', 'Candle in the Wind (14 semanas)'],
    t: ['Thriller', 'Billie Jean', 'Bohemian Rhapsody', 'Smells Like Teen Spirit', 'Like a Virgin']
  },
  {
    c: 'Canciones de la banda británica Oasis liderada por los hermanos Gallagher',
    f: ['Wonderwall', 'Don\'t Look Back in Anger', 'Champagne Supernova', 'Live Forever'],
    m: ['Stand by Me', 'Supersonic', 'Stop Crying Your Heart Out'],
    d: ['Acquiesce', 'Morning Glory', 'Roll With It'],
    t: ['Bitter Sweet Symphony (The Verve)', 'Song 2 (Blur)', 'Common People (Pulp)', 'Creep (Radiohead)', 'Parklife']
  },
  {
    c: 'Canciones pertenecientes a la banda estadounidense Nirvana',
    f: ['Smells Like Teen Spirit', 'Come as You Are', 'Lithium', 'In Bloom'],
    m: ['Heart-Shaped Box', 'The Man Who Sold the World (cover)', 'All Apologies'],
    d: ['Rape Me', 'About a Girl', 'Dumb'],
    t: ['Black Hole Sun (Soundgarden)', 'Alive (Pearl Jam)', 'Jeremy (Pearl Jam)', 'Plush', 'Man in the Box']
  },
  {
    c: 'Canciones pertenecientes a la banda estadounidense Metallica',
    f: ['Enter Sandman', 'Nothing Else Matters', 'Master of Puppets', 'One'],
    m: ['The Unforgiven', 'Fade to Black', 'For Whom the Bell Tolls'],
    d: ['Seek & Destroy', 'Battery', 'Creeping Death'],
    t: ['The Trooper (Iron Maiden)', 'Peace Sells (Megadeth)', 'Holy Wars', 'Raining Blood', 'Crazy Train']
  },
  {
    c: 'Canciones de la banda californiana Red Hot Chili Peppers',
    f: ['Californication', 'Under the Bridge', 'Can\'t Stop', 'Otherside'],
    m: ['Give It Away', 'Scar Tissue', 'By the Way'],
    d: ['Snow (Hey Oh)', 'Dani California', 'Around the World'],
    t: ['Basket Case', 'In the End', 'Learn to Fly', 'Drive', 'All the Small Things']
  },
  {
    c: 'Canciones de la banda de rock alternativo Linkin Park',
    f: ['In the End', 'Numb', 'Faint', 'Crawling'],
    m: ['What I\'ve Done', 'Breaking the Habit', 'Somewhere I Belong'],
    d: ['Papercut', 'Bleed It Out', 'One Step Closer'],
    t: ['Bring Me to Life (Evanescence)', 'Chop Suey! (SOAD)', 'Last Resort (Papa Roach)', 'Down with the Sickness', 'Bodies']
  },
  {
    c: 'Canciones pertenecientes al repertorio de Elvis Presley',
    f: ['Jailhouse Rock', 'Can\'t Help Falling in Love', 'Hound Dog', 'Suspicious Minds'],
    m: ['Love Me Tender', 'Heartbreak Hotel', 'Blue Suede Shoes (versión)'],
    d: ['In the Ghetto', 'All Shook Up', 'Burning Love'],
    t: ['Great Balls of Fire (Jerry Lee Lewis)', 'Johnny B. Goode (Chuck Berry)', 'Tutti Frutti (Little Richard)', 'Stand by Me', 'Peggy Sue']
  },
  {
    c: 'Canciones pertenecientes a la banda de rock británica The Rolling Stones',
    f: ['(I Can\'t Get No) Satisfaction', 'Paint It Black', 'Sympathy for the Devil', 'Angie'],
    m: ['Start Me Up', 'Gimme Shelter', 'Jumpin\' Jack Flash'],
    d: ['Wild Horses', 'Brown Sugar', 'Miss You'],
    t: ['Hey Jude (Beatles)', 'Baba O\'Riley (The Who)', 'Stairway to Heaven (Led Zeppelin)', 'Kashmir', 'Light My Fire']
  },
  {
    c: 'Canciones de la banda de rock británica Pink Floyd',
    f: ['Another Brick in the Wall (Part 2)', 'Wish You Were Here', 'Comfortably Numb', 'Money'],
    m: ['Time', 'Shine On You Crazy Diamond', 'Hey You'],
    d: ['Us and Them', 'The Great Gig in the Sky', 'Echoes'],
    t: ['Bohemian Rhapsody', 'Stairway to Heaven', 'Smoke on the Water', 'Hotel California', 'Riders on the Storm']
  }
];

export default Array.from({ length: 100 }, (_, idx) => {
  const p = plantillas[idx];
  return {
    id: `musica_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});