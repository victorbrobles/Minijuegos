// server/data/seeds/buscaminas/musica.js

const plantillas = [
  // 1 - 10: Rock Clásico y Bandas Legendarias
  {
    c: 'Bandas de rock originarias del Reino Unido',
    f: ['The Beatles', 'Queen', 'The Rolling Stones', 'Pink Floyd'],
    m: ['Led Zeppelin', 'The Who', 'Coldplay'],
    d: ['The Clash', 'Deep Purple', 'Black Sabbath'],
    t: ['AC/DC', 'Nirvana', 'Guns N\' Roses', 'Metallica', 'U2']
  },
  {
    c: 'Canciones emblemáticas grabadas por la banda Queen',
    f: ['Bohemian Rhapsody', 'We Will Rock You', 'Don\'t Stop Me Now', 'Another One Bites the Dust'],
    m: ['Radio Ga Ga', 'Under Pressure', 'I Want to Break Free'],
    d: ['Somebody to Love', 'The Show Must Go On', 'Killer Queen'],
    t: ['Imagine', 'Hotel California', 'Stairway to Heaven', 'Sweet Child O\' Mine', 'Hey Jude']
  },
  {
    c: 'Canciones pertenecientes a la discografía de The Beatles',
    f: ['Hey Jude', 'Yesterday', 'Let It Be', 'Help!'],
    m: ['Come Together', 'Yellow Submarine', 'Here Comes the Sun'],
    d: ['Eleanor Rigby', 'Something', 'A Day in the Life'],
    t: ['Imagine', 'Bohemian Rhapsody', 'Wonderwall', 'Angie', 'Paint It Black']
  },
  {
    c: 'Bandas icónicas del género Heavy Metal tradicional y contemporáneo',
    f: ['Iron Maiden', 'Metallica', 'Judas Priest', 'Black Sabbath'],
    m: ['Megadeth', 'Slayer', 'Pantera'],
    d: ['Motörhead', 'Anthrax', 'Saxon'],
    t: ['Red Hot Chili Peppers', 'The Rolling Stones', 'The Police', 'Aerosmith', 'U2']
  },
  {
    c: 'Grupos y bandas que abanderaron el movimiento Grunge',
    f: ['Nirvana', 'Pearl Jam', 'Soundgarden', 'Alice in Chains'],
    m: ['Stone Temple Pilots', 'Silverchair', 'Mudhoney'],
    d: ['Screaming Trees', 'Temple of the Dog', 'Mad Season'],
    t: ['Green Day', 'Blink-182', 'The Offspring', 'Foo Fighters', 'Radiohead']
  },
  {
    c: 'Bandas pioneras del Punk Rock clásico y skate punk',
    f: ['The Ramones', 'Sex Pistols', 'The Clash', 'Green Day'],
    m: ['The Damned', 'Bad Religion', 'The Offspring'],
    d: ['Buzzcocks', 'Dead Kennedys', 'Minor Threat'],
    t: ['Metallica', 'Guns N\' Roses', 'Linkin Park', 'Oasis', 'Led Zeppelin']
  },
  {
    c: 'Bandas y agrupaciones clásicas de Rock en español',
    f: ['Soda Stereo', 'Héroes del Silencio', 'Maná', 'El Canto del Loco'],
    m: ['Los Rodríguez', 'Enanitos Verdes', 'Extremoduro'],
    d: ['Café Tacvba', 'Los Fabulosos Cadillacs', 'Fito & Fitipaldis'],
    t: ['Gipsy Kings', 'Il Divo', 'Buena Vista Social Club', 'La Oreja de Van Gogh', 'Mecano']
  },
  {
    c: 'Canciones pertenecientes a la discografía de AC/DC',
    f: ['Highway to Hell', 'Back in Black', 'Thunderstruck', 'Hells Bells'],
    m: ['T.N.T.', 'You Shook Me All Night Long', 'Shoot to Thrill'],
    d: ['Dirty Deeds Done Dirt Cheap', 'For Those About to Rock', 'Whole Lotta Rosie'],
    t: ['Paranoid', 'Smoke on the Water', 'Iron Man', 'Master of Puppets', 'Sweet Child O\' Mine']
  },
  {
    c: 'Canciones pertenecientes a la discografía de Guns N\' Roses',
    f: ['Sweet Child O\' Mine', 'Welcome to the Jungle', 'November Rain', 'Paradise City'],
    m: ['Knockin\' on Heaven\'s Door', 'Don\'t Cry', 'Patience'],
    d: ['Civil War', 'Estranged', 'You Could Be Mine'],
    t: ['Livin\' on a Prayer', 'Smells Like Teen Spirit', 'Dream On', 'Poison', 'Always']
  },
  {
    c: 'Bandas y agrupaciones de Rock Progresivo y Psicodélico',
    f: ['Pink Floyd', 'King Crimson', 'Yes', 'Genesis'],
    m: ['Rush', 'Jethro Tull', 'The Doors'],
    d: ['Emerson, Lake & Palmer', 'Camel', 'Marillion'],
    t: ['Sex Pistols', 'The Ramones', 'Blink-182', 'The Clash', 'Green Day']
  },

  // 11 - 20: Pop, R&B y Grandes Ventas
  {
    c: 'Artistas o bandas con álbumes de estudio que superan los 40 millones de copias vendidas',
    f: ['Michael Jackson', 'AC/DC', 'Pink Floyd', 'Whitney Houston'],
    m: ['Meat Loaf', 'Eagles', 'Fleetwood Mac'],
    d: ['Shania Twain', 'Led Zeppelin', 'Celine Dion'],
    t: ['Beyoncé', 'Taylor Swift', 'Drake', 'Bruno Mars', 'Ed Sheeran']
  },
  {
    c: 'Cantantes solistas femeninas del Pop internacional',
    f: ['Madonna', 'Britney Spears', 'Dua Lipa', 'Katy Perry'],
    m: ['Lady Gaga', 'Ariana Grande', 'Rihanna'],
    d: ['Kylie Minogue', 'Billie Eilish', 'Olivia Rodrigo'],
    t: ['Kurt Cobain', 'Freddie Mercury', 'Chester Bennington', 'Bono', 'Mick Jagger']
  },
  {
    c: 'Canciones célebres interpretadas por Michael Jackson',
    f: ['Billie Jean', 'Thriller', 'Beat It', 'Smooth Criminal'],
    m: ['Black or White', 'Bad', 'Man in the Mirror'],
    d: ['Earth Song', 'They Don\'t Care About Us', 'Rock With You'],
    t: ['Purple Rain', 'Stayin\' Alive', 'Superstition', 'Let\'s Dance', 'Like a Virgin']
  },
  {
    c: 'Artistas femeninas con mayor cantidad de premios Grammy ganados',
    f: ['Beyoncé', 'Taylor Swift', 'Adele', 'Alison Krauss'],
    m: ['Aretha Franklin', 'Alicia Keys', 'Ella Fitzgerald'],
    d: ['Emmylou Harris', 'Leontyne Price', 'CeCe Winans'],
    t: ['Katy Perry', 'Nicki Minaj', 'Jennifer Lopez', 'Avril Lavigne', 'Shakira']
  },
  {
    c: 'Pistas y canciones que integran el álbum Thriller de Michael Jackson (1982)',
    f: ['Thriller', 'Billie Jean', 'Beat It', 'Wanna Be Startin\' Somethin\''],
    m: ['Human Nature', 'P.Y.T. (Pretty Young Thing)', 'The Girl Is Mine'],
    d: ['Baby Be Mine', 'The Lady in My Life', 'Carousel'],
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
    c: 'Grandes vocalistas de la historia del Soul y R&B clásico',
    f: ['Aretha Franklin', 'Whitney Houston', 'Etta James', 'Amy Winehouse'],
    m: ['Diana Ross', 'Tina Turner', 'Nina Simone'],
    d: ['Roberta Flack', 'Gladys Knight', 'Dusty Springfield'],
    t: ['Celine Dion', 'Barbra Streisand', 'Madonna', 'Cher', 'Britney Spears']
  },
  {
    c: 'Canciones de éxito mundial de la cantante Madonna',
    f: ['Like a Virgin', 'Material Girl', 'Vogue', 'Like a Prayer'],
    m: ['La Isla Bonita', 'Hung Up', 'Papa Don\'t Preach'],
    d: ['Frozen', 'Ray of Light', 'Music'],
    t: ['Toxic', 'Bad Romance', 'Single Ladies', 'Genie in a Bottle', 'Believe']
  },
  {
    c: 'Grupos vocales masculinos (Boybands) de proyección internacional',
    f: ['Backstreet Boys', 'One Direction', 'NSYNC', 'Take That'],
    m: ['Boyz II Men', 'Jonas Brothers', 'New Kids on the Block'],
    d: ['Westlife', '5 Seconds of Summer', 'The Wanted'],
    t: ['Spice Girls', 'Destiny\'s Child', 'TLC', 'Little Mix', 'Fifth Harmony']
  },
  {
    c: 'Grupos vocales femeninos (Girlgroups) de Pop y R&B',
    f: ['Spice Girls', 'Destiny\'s Child', 'TLC', 'BLACKPINK'],
    m: ['Little Mix', 'Fifth Harmony', 'The Pussycat Dolls'],
    d: ['Girls Aloud', 'The Supremes', 'All Saints'],
    t: ['Backstreet Boys', 'One Direction', 'NSYNC', 'Take That', 'Jonas Brothers']
  },

  // 21 - 30: Hip-Hop, Rap y Música Urbana
  {
    c: 'Artistas pioneros y leyendas del Hip-Hop y Rap estadounidense',
    f: ['Eminem', 'Tupac Shakur', 'Snoop Dogg', '50 Cent'],
    m: ['The Notorious B.I.G.', 'Dr. Dre', 'Kendrick Lamar'],
    d: ['Nas', 'Jay-Z', 'J. Cole'],
    t: ['Bob Marley', 'Michael Jackson', 'Bruno Mars', 'The Weeknd', 'Jason Derulo']
  },
  {
    c: 'Intérpretes masculinos del reggaetón y la música urbana latina',
    f: ['Bad Bunny', 'Daddy Yankee', 'J Balvin', 'Maluma'],
    m: ['Rauw Alejandro', 'Ozuna', 'Anuel AA'],
    d: ['Feid', 'Don Omar', 'Nicky Jam'],
    t: ['Ricky Martin', 'Luis Miguel', 'Chayanne', 'Marc Anthony', 'Enrique Iglesias']
  },
  {
    c: 'Intérpretes femeninas destacadas del género urbano y reggaetón',
    f: ['Karol G', 'Becky G', 'Natti Natasha', 'Anitta'],
    m: ['Rosalía', 'Nathy Peluso', 'Nicki Nicole'],
    d: ['Ivy Queen', 'Young Miko', 'Cazzu'],
    t: ['Shakira', 'Thalía', 'Paulina Rubio', 'Gloria Estefan', 'Laura Pausini']
  },
  {
    c: 'Canciones emblemáticas grabadas por Daddy Yankee',
    f: ['Gasolina', 'Dura', 'Con Calma', 'Lo Que Pasó, Pasó'],
    m: ['Rompe', 'Ella Me Levantó', 'Llamado de Emergencia'],
    d: ['Pose', 'La Despedida', 'Impacto'],
    t: ['Dákiti', 'Mi Gente', 'Hawái', 'Safaera', 'Ginza']
  },
  {
    c: 'Canciones de éxito internacional de Bad Bunny',
    f: ['Dákiti', 'Tití Me Preguntó', 'Safaera', 'Yo Perreo Sola'],
    m: ['Callaíta', 'Me Porto Bonito', 'Moscow Mule'],
    d: ['Chambea', 'Amorfoda', 'Vete'],
    t: ['Gasolina', 'Ginza', 'Pepas', 'Tusa', 'Despacito']
  },
  {
    c: 'Productores discográficos de hip-hop y música urbana',
    f: ['Bizarrap', 'Dr. Dre', 'Metro Boomin', 'Pharrell Williams'],
    m: ['Timbaland', 'Tainy', 'DJ Khaled'],
    d: ['Kanye West', 'Rick Rubin', 'Murda Beatz'],
    t: ['David Guetta', 'Martin Garrix', 'Calvin Harris', 'Avicii', 'Tiësto']
  },
  {
    c: 'Himnos clásicos del Rap estadounidense lanzados en la década de los 90',
    f: ['Lose Yourself', 'California Love', 'Juicy', 'Gangsta\'s Paradise'],
    m: ['Nuthin\' but a \'G\' Thang', 'Changes', 'C.R.E.A.M.'],
    d: ['Dear Mama', 'NY State of Mind', 'Hypnotize'],
    t: ['In Da Club', 'Empire State of Mind', 'God\'s Plan', 'Hotline Bling', 'HUMBLE.']
  },
  {
    c: 'Colectivos y bandas legendarias de la historia del Hip-Hop',
    f: ['Wu-Tang Clan', 'N.W.A', 'Run-DMC', 'Beastie Boys'],
    m: ['Outkast', 'A Tribe Called Quest', 'Cypress Hill'],
    d: ['Public Enemy', 'Mobb Deep', 'Fugees'],
    t: ['Linkin Park', 'Gorillaz', 'Red Hot Chili Peppers', 'Rage Against the Machine', 'The Black Eyed Peas']
  },
  {
    c: 'Artistas españoles del género rap, trap y música urbana',
    f: ['Kase.O', 'C. Tangana', 'Morad', 'Quevedo'],
    m: ['Natos y Waor', 'Ayax', 'Zatu'],
    d: ['Nach', 'ToteKing', 'Delaossa'],
    t: ['Melendi', 'Alejandro Sanz', 'David Bisbal', 'Pablo Alborán', 'Manuel Carrasco']
  },
  {
    c: 'Artistas que han protagonizado una entrega de las BZRP Music Sessions',
    f: ['Quevedo', 'Shakira', 'Nathy Peluso', 'Residente'],
    m: ['Villano Antillano', 'Duki', 'Nicki Nicole'],
    d: ['Snow Tha Product', 'Tiago PZK', 'Milo J'],
    t: ['Bad Bunny', 'Rosalía', 'J Balvin', 'Maluma', 'Karol G']
  },

  // 31 - 40: Música Clásica y Bandas Sonoras
  {
    c: 'Compositores universales de la música clásica occidental',
    f: ['Ludwig van Beethoven', 'Wolfgang Amadeus Mozart', 'Johann Sebastian Bach', 'Antonio Vivaldi'],
    m: ['Frédéric Chopin', 'Piotr Ilich Chaikovski', 'Johannes Brahms'],
    d: ['Franz Liszt', 'Claude Debussy', 'Richard Wagner'],
    t: ['Hans Zimmer', 'John Williams', 'Ennio Morricone', 'Ludovico Einaudi', 'Howard Shore']
  },
  {
    c: 'Compositores de bandas sonoras para cine laureados internacionalmente',
    f: ['Hans Zimmer', 'John Williams', 'Ennio Morricone', 'Howard Shore'],
    m: ['Danny Elfman', 'Alan Silvestri', 'James Horner'],
    d: ['Alexandre Desplat', 'Thomas Newman', 'Max Steiner'],
    t: ['Wolfgang Amadeus Mozart', 'Ludwig van Beethoven', 'Johann Sebastian Bach', 'Frédéric Chopin', 'Antonio Vivaldi']
  },
  {
    c: 'Bandas sonoras orquestales compuestas por John Williams',
    f: ['Star Wars', 'Parque Jurásico', 'Tiburón', 'Harry Potter'],
    m: ['Indiana Jones', 'E.T., el extraterrestre', 'La lista de Schindler'],
    d: ['Superman', 'Encuentros en la tercera fase', 'Solo en casa'],
    t: ['Gladiator', 'El Señor de los Anillos', 'El Rey León', 'Piratas del Caribe', 'Origen']
  },
  {
    c: 'Bandas sonoras cinematográficas compuestas por Hans Zimmer',
    f: ['Gladiator', 'El Rey León', 'Piratas del Caribe', 'Origen'],
    m: ['Interstellar', 'El Caballero Oscuro', 'Dune'],
    d: ['Dunkerque', 'La delgada línea roja', 'Rain Man'],
    t: ['Star Wars', 'Parque Jurásico', 'Tiburón', 'Indiana Jones', 'Harry Potter']
  },
  {
    c: 'Bandas sonoras compuestas por el maestro italiano Ennio Morricone',
    f: ['El bueno, el feo y el malo', 'Cinema Paradiso', 'La misión', 'Por un puñado de dólares'],
    m: ['Hasta que llegó su hora', 'Los odiosos ocho', 'Érase una vez en América'],
    d: ['La muerte tenía un precio', 'Los intocables de Eliot Ness', 'Días de cielo'],
    t: ['El Padrino', 'Tiburón', 'Gladiator', 'Braveheart', 'Superman']
  },
  {
    c: 'Composiciones sinfónicas y para piano de Ludwig van Beethoven',
    f: ['Quinta Sinfonía', 'Novena Sinfonía', 'Para Elisa', 'Sonata Claro de Luna'],
    m: ['Tercera Sinfonía (Heroica)', 'Sonata Patética', 'Sexta Sinfonía (Pastoral)'],
    d: ['Séptima Sinfonía', 'Sonata Appassionata', 'Missa Solemnis'],
    t: ['Las Cuatro Estaciones', 'El lago de los cisnes', 'La flauta mágica', 'Rapsodia en azul', 'El barbero de Sevilla']
  },
  {
    c: 'Títulos de óperas compuestas por Wolfgang Amadeus Mozart',
    f: ['La flauta mágica', 'Las bodas de Fígaro', 'Don Giovanni', 'Così fan tutte'],
    m: ['El rapto en el serrallo', 'Idomeneo', 'La clemencia de Tito'],
    d: ['Mitridate', 'Bastien und Bastienne', 'Ascanio in Alba'],
    t: ['La Traviata', 'Carmen', 'El barbero de Sevilla', 'Tosca', 'Madama Butterfly']
  },
  {
    c: 'Obras orquestales y ballets compuestos por Piotr Ilich Chaikovski',
    f: ['El lago de los cisnes', 'El cascanueces', 'La bella durmiente', 'Obertura de Romeo y Julieta'],
    m: ['Obertura 1812', 'Concierto para piano n.º 1', 'Sinfonía n.º 6 (Patética)'],
    d: ['Eugene Onegin', 'Capricho italiano', 'Marcha eslava'],
    t: ['El pájaro de fuego', 'La consagración de la primavera', 'Bolero', 'Giselle', 'Carmen']
  },
  {
    c: 'Compositores pertenecientes al período de la música Barroca',
    f: ['Johann Sebastian Bach', 'Antonio Vivaldi', 'Georg Friedrich Händel', 'Claudio Monteverdi'],
    m: ['Henry Purcell', 'Arcangelo Corelli', 'Jean-Philippe Rameau'],
    d: ['Georg Philipp Telemann', 'François Couperin', 'Heinrich Schütz'],
    t: ['Wolfgang Amadeus Mozart', 'Ludwig van Beethoven', 'Franz Joseph Haydn', 'Frédéric Chopin', 'Franz Liszt']
  },
  {
    c: 'Movimientos o conciertos que integran Las Cuatro Estaciones de Vivaldi',
    f: ['La primavera', 'El verano', 'El otoño', 'El invierno'],
    m: ['Concierto en mi mayor', 'Concierto en sol menor', 'Concierto en fa mayor'],
    d: ['Concierto en fa menor', 'Opus 8 n.º 1', 'Opus 8 n.º 4'],
    t: ['El amanecer', 'El mediodía', 'La noche', 'El crepúsculo', 'La alborada']
  },

  // 41 - 50: Instrumentos Musicales y Teoría
  {
    c: 'Instrumentos orquestales pertenecientes a la familia de viento-madera',
    f: ['Flauta travesera', 'Clarinete', 'Oboe', 'Saxofón'],
    m: ['Fagot', 'Flautín (Piccolo)', 'Corno inglés'],
    d: ['Contrafagot', 'Clarinete bajo', 'Oboe d\'amore'],
    t: ['Trompeta', 'Trombón', 'Tuba', 'Trompa', 'Violín']
  },
  {
    c: 'Instrumentos pertenecientes a la familia de viento-metal',
    f: ['Trompeta', 'Trombón', 'Tuba', 'Trompa (corno francés)'],
    m: ['Fliscorno', 'Bombardino (Eufonio)', 'Corneta'],
    d: ['Sousafón', 'Trompeta pícolo', 'Trombón bajo'],
    t: ['Clarinete', 'Flauta travesera', 'Saxofón', 'Oboe', 'Fagot']
  },
  {
    c: 'Instrumentos orquestales pertenecientes a la cuerda frotada',
    f: ['Violín', 'Violonchelo', 'Viola', 'Contrabajo'],
    m: ['Viola da gamba', 'Octabajo', 'Viola d\'amore'],
    d: ['Violino piccolo', 'Violone', 'Hardanger'],
    t: ['Guitarra clásica', 'Arpa', 'Piano', 'Mandolina', 'Ukelele']
  },
  {
    c: 'Instrumentos de percusión con afinación cromática o melódica',
    f: ['Xilófono', 'Marimba', 'Timbales de orquesta', 'Campanas tubulares'],
    m: ['Glockenspiel', 'Vibráfono', 'Celesta'],
    d: ['Crotales', 'Lira de marcha', 'Steelpan'],
    t: ['Bombo', 'Caja clara', 'Platillos', 'Triángulo', 'Pandereta']
  },
  {
    c: 'Instrumentos de cuerda que se tocan mediante pulsación con dedos o púa',
    f: ['Guitarra acústica', 'Arpa', 'Ukelele', 'Bajo eléctrico'],
    m: ['Laúd', 'Banjo', 'Mandolina'],
    d: ['Cítara', 'Sitar indio', 'Koto japonés'],
    t: ['Violín', 'Violonchelo', 'Flauta', 'Trompeta', 'Batería']
  },
  {
    c: 'Notas naturales que integran la escala diatónica de Do mayor',
    f: ['Do', 'Re', 'Mi', 'Fa'],
    m: ['Sol', 'La', 'Si'],
    d: ['C', 'D', 'E'],
    t: ['Fa sostenido', 'Si bemol', 'Do sostenido', 'Mi bemol', 'Sol sostenido']
  },
  {
    c: 'Figuras rítmicas empleadas para medir la duración de los sonidos',
    f: ['Redonda', 'Blanca', 'Negra', 'Corchea'],
    m: ['Semicorchea', 'Fusa', 'Semifusa'],
    d: ['Garrapatea', 'Semigarrapatea', 'Cuadrada'],
    t: ['Sostenido', 'Bemol', 'Becuadro', 'Calderón', 'Puntillo']
  },
  {
    c: 'Tesituras y registros de la voz humana en el canto clásico',
    f: ['Soprano', 'Tenor', 'Barítono', 'Bajo'],
    m: ['Mezzosoprano', 'Contralto', 'Contratenor'],
    d: ['Soprano ligera', 'Bajo profundo', 'Tenor dramático'],
    t: ['Falsete', 'Vibrato', 'Voz de pecho', 'Autotune', 'Voz rota']
  },
  {
    c: 'Signos y alteraciones que modifican la altura de las notas en el pentagrama',
    f: ['Sostenido', 'Bemol', 'Becuadro', 'Doble sostenido'],
    m: ['Doble bemol', 'Microtono', 'Sostenido y medio'],
    d: ['Semibemol', 'Sesquisostenido', 'Sesquibemol'],
    t: ['Clave de sol', 'Compás', 'Silencio', 'Puntillo', 'Ligadura']
  },
  {
    c: 'Componentes e instrumentos que integran una batería acústica estándar',
    f: ['Bombo', 'Caja (redoblante)', 'Platillo Charles (Hi-hat)', 'Platillo Ride'],
    m: ['Tom aéreo', 'Tom de suelo', 'Platillo Crash'],
    d: ['Pedal de bombo', 'Bordón de caja', 'Platillo Splash'],
    t: ['Pastilla magnética', 'Clavijero', 'Mástil', 'Puente flotante', 'Trastes']
  },

  // 51 - 60: Música Electrónica, Dance y DJs
  {
    c: 'DJs y productores de música electrónica y EDM',
    f: ['David Guetta', 'Avicii', 'Calvin Harris', 'Martin Garrix'],
    m: ['Tiësto', 'Skrillex', 'Marshmello'],
    d: ['Deadmau5', 'Armin van Buuren', 'Afrojack'],
    t: ['Daft Punk', 'Eminem', 'Drake', 'Bruno Mars', 'Justin Bieber']
  },
  {
    c: 'Canciones emblemáticas producidas por el DJ sueco Avicii',
    f: ['Wake Me Up', 'Levels', 'Hey Brother', 'Waiting for Love'],
    m: ['The Nights', 'Addicted to You', 'I Could Be the One'],
    d: ['Silhouettes', 'Fade into Darkness', 'SOS'],
    t: ['Titanium', 'Animals', 'Summer', 'Faded', 'Clarity']
  },
  {
    c: 'Canciones y éxitos globales producidos por David Guetta',
    f: ['Titanium', 'Memories', 'Without You', 'Play Hard'],
    m: ['When Love Takes Over', 'Sexy Bitch', 'Hey Mama'],
    d: ['Love Is Gone', 'Dangerous', 'I\'m Good (Blue)'],
    t: ['Wake Me Up', 'Levels', 'Animals', 'Summer', 'One More Time']
  },
  {
    c: 'Subgéneros y vertientes de la música electrónica de baile',
    f: ['Techno', 'House', 'Trance', 'Dubstep'],
    m: ['Drum and Bass', 'Synthwave', 'Hardstyle'],
    d: ['Ambient', 'Deep House', 'Psytrance'],
    t: ['Heavy Metal', 'Reggae', 'Bossa Nova', 'Flamenco', 'Country']
  },
  {
    c: 'Canciones lanzadas por el dúo francés Daft Punk',
    f: ['Get Lucky', 'One More Time', 'Around the World', 'Harder, Better, Faster, Stronger'],
    m: ['Da Funk', 'Instant Crush', 'Lose Yourself to Dance'],
    d: ['Technologic', 'Aerodynamic', 'Digital Love'],
    t: ['Titanium', 'Wake Me Up', 'Animals', 'Levels', 'Satisfaction']
  },
  {
    c: 'Festivales masivos internacionales dedicados a la música electrónica',
    f: ['Tomorrowland', 'Ultra Music Festival', 'Electric Daisy Carnival (EDC)', 'Creamfields'],
    m: ['Defqon.1', 'Awakenings', 'Mysteryland'],
    d: ['Sónar', 'Time Warp', 'Sunburn Festival'],
    t: ['Glastonbury', 'Woodstock', 'Coachella', 'Wacken Open Air', 'Viña Rock']
  },
  {
    c: 'Productores y DJs referentes del sonido Techno internacional',
    f: ['Carl Cox', 'Amelie Lens', 'Charlotte de Witte', 'Paul Kalkbrenner'],
    m: ['Richie Hawtin', 'Adam Beyer', 'Nina Kraviz'],
    d: ['Jeff Mills', 'Boris Brejcha', 'Sven Väth'],
    t: ['David Guetta', 'Martin Garrix', 'Avicii', 'Steve Aoki', 'Marshmello']
  },
  {
    c: 'Canciones que componen el álbum Random Access Memories de Daft Punk',
    f: ['Get Lucky', 'Instant Crush', 'Lose Yourself to Dance', 'Give Life Back to Music'],
    m: ['Giorgio by Moroder', 'Touch', 'Doin\' It Right'],
    d: ['Contact', 'Beyond', 'Within'],
    t: ['One More Time', 'Around the World', 'Harder, Better, Faster', 'Da Funk', 'Technologic']
  },
  {
    c: 'DJs y productores de música Trance de renombre mundial',
    f: ['Armin van Buuren', 'Tiësto', 'Paul van Dyk', 'Above & Beyond'],
    m: ['Ferry Corsten', 'Aly & Fila', 'ATB'],
    d: ['Cosmic Gate', 'John O\'Callaghan', 'Gareth Emery'],
    t: ['Skrillex', 'Diplo', 'Carl Cox', 'The Chainsmokers', 'Steve Aoki']
  },
  {
    c: 'Canciones producidas por el DJ y cantante escocés Calvin Harris',
    f: ['Summer', 'This Is What You Came For', 'Feel So Close', 'One Kiss'],
    m: ['Blame', 'Sweet Nothing', 'We Found Love'],
    d: ['Outside', 'I Need Your Love', 'Acceptable in the 80s'],
    t: ['Wake Me Up', 'Titanium', 'Animals', 'Faded', 'Clarity']
  },

  // 61 - 70: Música Española y Flamenco
  {
    c: 'Artistas y cantantes de origen español con ventas millonarias de álbumes',
    f: ['Julio Iglesias', 'Rosalía', 'Alejandro Sanz', 'Enrique Iglesias'],
    m: ['David Bisbal', 'Joaquín Sabina', 'Melendi'],
    d: ['Camilo Sesto', 'Rocío Dúrcal', 'Raphael'],
    t: ['Luis Fonsi', 'Ricardo Arjona', 'Juanes', 'Chayanne', 'Ricky Martin']
  },
  {
    c: 'Canciones de gran repercusión compuestas o interpretadas por Alejandro Sanz',
    f: ['Corazón Partío', 'Amiga Mía', 'Y, ¿Si Fuera Ella?', 'Mi Soledad y Yo'],
    m: ['Pisando Fuerte', 'La Fuerza del Corazón', 'No Es lo Mismo'],
    d: ['Looking for Paradise', 'Quisiera Ser', 'Viviendo Deprisa'],
    t: ['Bulería', 'Ave María', 'Bailando', '19 Días y 500 Noches', 'Caminando por la Vida']
  },
  {
    c: 'Grandes figuras del Flamenco y la guitarra flamenca tradicional',
    f: ['Paco de Lucía', 'Camarón de la Isla', 'Lola Flores', 'Enrique Morente'],
    m: ['Tomatito', 'Vicente Amigo', 'Carmen Amaya'],
    d: ['Niña de los Peines', 'Manolo Sanlúcar', 'Diego el Cigala'],
    t: ['Julio Iglesias', 'Joaquín Sabina', 'Joan Manuel Serrat', 'Plácido Domingo', 'Nino Bravo']
  },
  {
    c: 'Palos y estilos musicales reglamentados del cante y toque Flamenco',
    f: ['Bulería', 'Soleá', 'Fandango', 'Seguirilla'],
    m: ['Alegrías', 'Tangos flamencos', 'Sevillanas'],
    d: ['Tarantas', 'Malagueñas', 'Tientos'],
    t: ['Salsa cubana', 'Bachata dominicana', 'Merengue', 'Cumbia', 'Reggaeton']
  },
  {
    c: 'Canciones representativas del repertorio de Joaquín Sabina',
    f: ['19 Días y 500 Noches', 'Y Nos Dieron las Diez', 'Princesa', 'Pacto Entre Caballeros'],
    m: ['Calle Melancolía', 'Por el Bulevar de los Sueños Rotos', 'Contigo'],
    d: ['¿Quién Me Ha Robado el Mes de Abril?', 'La del Pirata Cojo', 'Pongamos que Hablo de Madrid'],
    t: ['Corazón Partío', 'Mediterráneo', 'La Chica de Ayer', 'Bulería', 'Soldadito Marinero']
  },
  {
    c: 'Grupos y bandas del Pop Rock español surgidos en la década de los 80',
    f: ['Radio Futura', 'Nacha Pop', 'Los Secretos', 'Alaska y Dinarama'],
    m: ['Hombres G', 'Mecano', 'Gabinete Caligari'],
    d: ['Parálisis Permanente', 'Danza Invisible', 'Zombies'],
    t: ['El Canto del Loco', 'Estopa', 'Amaral', 'La Oreja de Van Gogh', 'Vetusta Morla']
  },
  {
    c: 'Canciones pertenecientes a la discografía del grupo Mecano',
    f: ['Hijo de la Luna', 'Hoy No Me Puedo Levantar', 'Mujer Contra Mujer', 'Barco a Venus'],
    m: ['Me Cuesta Tanto Olvidarte', 'Cruz de Navajas', 'Un Año Más'],
    d: ['Maquillaje', 'La Fuerza del Destino', 'Ay Qué Pesado'],
    t: ['La Chica de Ayer', 'Devuélveme a mi Chica', 'A quién le importa', 'Déjame', 'Princesa']
  },
  {
    c: 'Canciones compuestas e interpretadas por el dúo Estopa',
    f: ['La Raja de Tu Falda', 'Tu Calorro', 'Vino Tinto', 'Como Camarón'],
    m: ['Pastillas de Freno', 'Cacho a Cacho', 'Partiendo la Pana'],
    d: ['Fuente de Energía', 'Me Falta el Aliento', 'El Run Run'],
    t: ['Soldadito Marinero', 'Zapatillas', 'La Flaca', 'Princesas', 'Ave María']
  },
  {
    c: 'Canciones pertenecientes a la banda Fito & Fitipaldis',
    f: ['Soldadito Marinero', 'Por la Boca Vive el Pez', 'La Casa por el Tejado', 'Antes de que Cuente Diez'],
    m: ['Me Equivocaría Otra Vez', 'Rojitas las Orejas', 'Acabo de Llegar'],
    d: ['Whisky Barato', 'Cerca de las Vías', 'Corazón Oxidado'],
    t: ['La Raja de Tu Falda', 'Vino Tinto', 'Entre Dos Tierras', 'Zapatillas', 'El Roce de tu Cuerpo']
  },
  {
    c: 'Bandas representativas del circuito Indie y Pop Rock español del siglo XXI',
    f: ['Vetusta Morla', 'Love of Lesbian', 'Lori Meyers', 'Izal'],
    m: ['Miss Caffeina', 'Dorian', 'Sidonie'],
    d: ['La Habitación Roja', 'Viva Suecia', 'León Benavente'],
    t: ['Mecano', 'Radio Futura', 'Nacha Pop', 'Héroes del Silencio', 'Los Secretos']
  },

  // 71 - 80: Música Latina, Salsa, Cumbia y Ritmos Tropicales
  {
    c: 'Grandes leyendas e intérpretes de la Salsa clásica y tradicional',
    f: ['Celia Cruz', 'Héctor Lavoe', 'Rubén Blades', 'Marc Anthony'],
    m: ['Willie Colón', 'Cheo Feliciano', 'Ismael Rivera'],
    d: ['Tito Puente', 'Eddie Palmieri', 'Ray Barretto'],
    t: ['Romeo Santos', 'Daddy Yankee', 'J Balvin', 'Don Omar', 'Bad Bunny']
  },
  {
    c: 'Canciones emblemáticas grabadas por Celia Cruz',
    f: ['La Vida Es un Carnaval', 'Rie y Llora', 'Quimbara', 'Guantanamera'],
    m: ['La Negra Tiene Tumbao', 'Yo Viviré', 'Burundanga'],
    d: ['Toro Mata', 'Usted Abusó', 'Cúcala'],
    t: ['Vivir Mi Vida', 'Pedro Navaja', 'El Cantante', 'Idilio', 'Llorarás']
  },
  {
    c: 'Canciones de salsa interpretadas por el cantante Héctor Lavoe',
    f: ['El Cantante', 'Periódico de Ayer', 'Aguanilé', 'Todo Tiene Su Final'],
    m: ['Juanito Alimaña', 'Che Che Colé', 'Calle Luna, Calle Sol'],
    d: ['Triste y Vacía', 'De Ti Depende', 'Hacha y Machete'],
    t: ['La Vida Es un Carnaval', 'Pedro Navaja', 'Valió la Pena', 'Devórame Otra Vez', 'Procura']
  },
  {
    c: 'Artistas y formaciones destacadas de la Bachata dominicana',
    f: ['Romeo Santos', 'Aventura', 'Juan Luis Guerra', 'Prince Royce'],
    m: ['Frank Reyes', 'Anthony Santos', 'Zacarías Ferreira'],
    d: ['Raulín Rodríguez', 'Monchy & Alexandra', 'Luis Vargas'],
    t: ['Héctor Lavoe', 'Celia Cruz', 'Daddy Yankee', 'J Balvin', 'Rubén Blades']
  },
  {
    c: 'Canciones y éxitos compuestos por Juan Luis Guerra con 4.40',
    f: ['Burbujas de Amor', 'La Bilirrubina', 'Ojalá Que Llueva Café', 'Bachata Rosa'],
    m: ['El Niágara en Bicicleta', 'Visa Para un Sueño', 'Las Avispas'],
    d: ['Frío Frío', 'Rosalía', 'A Pedir Su Mano'],
    t: ['La Vida Es un Carnaval', 'Obsesión', 'Danza Kuduro', 'Suavemente', 'Vivir Mi Vida']
  },
  {
    c: 'Compositores e intérpretes fundamentales de la Bossa Nova brasileña',
    f: ['Antônio Carlos Jobim', 'João Gilberto', 'Astrud Gilberto', 'Vinícius de Moraes'],
    m: ['Stan Getz', 'Sérgio Mendes', 'Caetano Veloso'],
    d: ['Baden Powell', 'Chico Buarque', 'Elis Regina'],
    t: ['Ricky Martin', 'Enrique Iglesias', 'Bob Marley', 'Carlos Santana', 'Paco de Lucía']
  },
  {
    c: 'Canciones clásicas del cancionero ranchero y mariachi tradicional mexicano',
    f: ['Cielito Lindo', 'El Rey', 'La Bikina', 'Volver Volver'],
    m: ['México Lindo y Querido', 'La Llorona', 'Si Nos Dejan'],
    d: ['Cielito Lindo Huasteco', 'Échame a Mí la Culpa', 'Paloma Negra'],
    t: ['La Bamba', 'Despacito', 'Guantanamera', 'Ojalá Que Llueva Café', 'Burbujas de Amor']
  },
  {
    c: 'Canciones de éxito internacional de la cantautora Shakira',
    f: ['Hips Don\'t Lie', 'Waka Waka', 'Whenever, Wherever', 'La Tortura'],
    m: ['Antología', 'Ciega, Sordomuda', 'Inevitable'],
    d: ['Ojos Así', 'Loca', 'Monotonía'],
    t: ['On the Floor', 'Bailando', 'Hero', 'Gasolina', 'Mayores']
  },
  {
    c: 'Bandas e intérpretes reconocidos de los géneros Reggae y Ska',
    f: ['Bob Marley', 'The Wailers', 'Peter Tosh', 'Jimmy Cliff'],
    m: ['UB40', 'Ska-P', 'Toots and the Maytals'],
    d: ['Burning Spear', 'Black Uhuru', 'Desmond Dekker'],
    t: ['Snoop Dogg', 'Eminem', 'Daddy Yankee', 'Bono', 'Red Hot Chili Peppers']
  },
  {
    c: 'Canciones emblemáticas grabadas por Bob Marley & The Wailers',
    f: ['No Woman, No Cry', 'Could You Be Loved', 'Three Little Birds', 'One Love'],
    m: ['Is This Love', 'Redemption Song', 'Buffalo Soldier'],
    d: ['Jamming', 'Get Up, Stand Up', 'I Shot the Sheriff'],
    t: ['Red Red Wine', 'Sweat (A La La La La Long)', 'Bad Boys', 'Dreadlock Holiday', 'Informer']
  },

  // 81 - 90: Eurovisión, K-Pop y Tendencias Globales
  {
    c: 'Países ganadores del Festival de la Canción de Eurovisión en cuatro o más ediciones',
    f: ['Irlanda', 'Suecia', 'Reino Unido', 'Francia'],
    m: ['Luxemburgo', 'Países Bajos', 'Israel'],
    d: ['Italia', 'Dinamarca', 'Ucrania'],
    t: ['España', 'Alemania', 'Portugal', 'Grecia', 'Bélgica']
  },
  {
    c: 'Representantes titulares de España en el Festival de Eurovisión',
    f: ['Massiel', 'Salomé', 'Chanel', 'Rodolfo Chikilicuatre'],
    m: ['Rosa López', 'David Civera', 'Pastora Soler'],
    d: ['Sergio Dalma', 'Azúcar Moreno', 'Mocedades'],
    t: ['Rosalía', 'David Bisbal', 'Enrique Iglesias', 'Alejandro Sanz', 'Joaquín Sabina']
  },
  {
    c: 'Grupos y formaciones representativas de la industria del K-Pop',
    f: ['BTS', 'BLACKPINK', 'TWICE', 'EXO'],
    m: ['Stray Kids', 'Seventeen', 'NewJeans'],
    d: ['Red Velvet', 'NCT', 'TXT'],
    t: ['One Direction', 'Jonas Brothers', 'Little Mix', 'Fifth Harmony', 'Backstreet Boys']
  },
  {
    c: 'Canciones que superan los dos mil millones de reproducciones en Spotify',
    f: ['Blinding Lights', 'Shape of You', 'Someone You Loved', 'Sunflower'],
    m: ['Starboy', 'As It Was', 'One Dance'],
    d: ['Stay', 'Dance Monkey', 'Rockstar'],
    t: ['Macarena', 'Bohemian Rhapsody', 'Smells Like Teen Spirit', 'Billie Jean', 'Thriller']
  },
  {
    c: 'Canciones pertenecientes a la discografía de Adele',
    f: ['Rolling in the Deep', 'Someone Like You', 'Hello', 'Set Fire to the Rain'],
    m: ['Skyfall', 'Easy on Me', 'Chasing Pavements'],
    d: ['When We Were Young', 'Send My Love', 'Hometown Glory'],
    t: ['Stay with Me', 'Shallow', 'Bleeding Love', 'Halo', 'Roar']
  },
  {
    c: 'Canciones pertenecientes a la discografía de la banda Coldplay',
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
    c: 'Canciones pertenecientes a la banda irlandesa U2',
    f: ['With or Without You', 'Sunday Bloody Sunday', 'Where the Streets Have No Name', 'One'],
    m: ['Beautiful Day', 'I Still Haven\'t Found What I\'m Looking For', 'Pride (In the Name of Love)'],
    d: ['Vertigo', 'New Year\'s Day', 'Elevation'],
    t: ['Zombie', 'Losing My Religion', 'Wonderwall', 'Sweet Child O\' Mine', 'Bitter Sweet Symphony']
  },
  {
    c: 'Canciones pertenecientes a la discografía de Bruno Mars',
    f: ['Uptown Funk', 'Just the Way You Are', 'Locked Out of Heaven', '24K Magic'],
    m: ['When I Was Your Man', 'Grenade', 'Treasure'],
    d: ['That\'s What I Like', 'The Lazy Song', 'Versace on the Floor'],
    t: ['Happy', 'Can\'t Stop the Feeling', 'Sugar', 'Blinding Lights', 'Get Lucky']
  },
  {
    c: 'Canciones pertenecientes a la discografía de Lady Gaga',
    f: ['Bad Romance', 'Poker Face', 'Just Dance', 'Shallow'],
    m: ['Born This Way', 'Paparazzi', 'Alejandro'],
    d: ['Telephone', 'Judas', 'Rain on Me'],
    t: ['Firework', 'Single Ladies', 'Toxic', 'Tik Tok', 'Wrecking Ball']
  },

  // 91 - 100: Álbumes Históricos y Curiosidades Musicales
  {
    c: 'Artistas con tres o más galardones al Álbum del Año en los premios Grammy',
    f: ['Taylor Swift', 'Frank Sinatra', 'Stevie Wonder', 'Paul Simon'],
    m: ['John Lennon', 'Paul McCartney', 'George Harrison'],
    d: ['Tom Coyne', 'Serban Ghenea', 'Al Schmitt'],
    t: ['Michael Jackson', 'Beyoncé', 'Adele', 'The Beatles', 'Madonna']
  },
  {
    c: 'Canciones que permanecieron 14 o más semanas en el número 1 de Billboard Hot 100',
    f: ['Old Town Road', 'Despacito', 'One Sweet Day', 'Last Night'],
    m: ['As It Was', 'Uptown Funk', 'I Will Always Love You'],
    d: ['I Gotta Feeling', 'We Belong Together', 'Candle in the Wind 1997'],
    t: ['Thriller', 'Billie Jean', 'Bohemian Rhapsody', 'Smells Like Teen Spirit', 'Like a Virgin']
  },
  {
    c: 'Canciones de la banda británica Oasis',
    f: ['Wonderwall', 'Don\'t Look Back in Anger', 'Champagne Supernova', 'Live Forever'],
    m: ['Stand by Me', 'Supersonic', 'Stop Crying Your Heart Out'],
    d: ['Acquiesce', 'Morning Glory', 'Roll With It'],
    t: ['Bitter Sweet Symphony', 'Song 2', 'Common People', 'Creep', 'Parklife']
  },
  {
    c: 'Canciones pertenecientes a la banda estadounidense Nirvana',
    f: ['Smells Like Teen Spirit', 'Come as You Are', 'Lithium', 'In Bloom'],
    m: ['Heart-Shaped Box', 'The Man Who Sold the World', 'All Apologies'],
    d: ['Rape Me', 'About a Girl', 'Dumb'],
    t: ['Black Hole Sun', 'Alive', 'Jeremy', 'Plush', 'Man in the Box']
  },
  {
    c: 'Canciones pertenecientes a la banda estadounidense Metallica',
    f: ['Enter Sandman', 'Nothing Else Matters', 'Master of Puppets', 'One'],
    m: ['The Unforgiven', 'Fade to Black', 'For Whom the Bell Tolls'],
    d: ['Seek & Destroy', 'Battery', 'Creeping Death'],
    t: ['The Trooper', 'Peace Sells', 'Holy Wars', 'Raining Blood', 'Crazy Train']
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
    t: ['Bring Me to Life', 'Chop Suey!', 'Last Resort', 'Down with the Sickness', 'Bodies']
  },
  {
    c: 'Canciones grabadas por el cantante Elvis Presley',
    f: ['Jailhouse Rock', 'Can\'t Help Falling in Love', 'Hound Dog', 'Suspicious Minds'],
    m: ['Love Me Tender', 'Heartbreak Hotel', 'Blue Suede Shoes'],
    d: ['In the Ghetto', 'All Shook Up', 'Burning Love'],
    t: ['Great Balls of Fire', 'Johnny B. Goode', 'Tutti Frutti', 'Stand by Me', 'Peggy Sue']
  },
  {
    c: 'Canciones de la banda británica The Rolling Stones',
    f: ['(I Can\'t Get No) Satisfaction', 'Paint It Black', 'Sympathy for the Devil', 'Angie'],
    m: ['Start Me Up', 'Gimme Shelter', 'Jumpin\' Jack Flash'],
    d: ['Wild Horses', 'Brown Sugar', 'Miss You'],
    t: ['Hey Jude', 'Baba O\'Riley', 'Stairway to Heaven', 'Kashmir', 'Light My Fire']
  },
  {
    c: 'Canciones de la banda de rock progresivo Pink Floyd',
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