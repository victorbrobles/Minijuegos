// server/data/seeds/buscaminas/cine.js

const plantillas = [
  // 1 - 10: Premios de la Academia, Directores y Universos Cinematográficos
  {
    c: 'Películas ganadoras del premio Oscar a Mejor Película',
    f: ['Titanic', 'Gladiator', 'El Señor de los Anillos: El Retorno del Rey', 'Forrest Gump'],
    m: ['Oppenheimer', 'Parásitos', 'Braveheart'],
    d: ['Spotlight', 'Nomadland', 'The Artist'],
    t: ['Avatar', 'Interstellar', 'Pulp Fiction', 'El Caballero Oscuro', 'Origen (Inception)']
  },
  {
    c: 'Películas dirigidas por Christopher Nolan',
    f: ['Origen (Inception)', 'Interstellar', 'Oppenheimer', 'El Caballero Oscuro'],
    m: ['Dunkerque', 'Memento', 'Tenet'],
    d: ['Following', 'Insomnio', 'El Truco Final (The Prestige)'],
    t: ['Shutter Island', 'Seven', 'Zodiac', 'Gravity', 'Blade Runner 2049']
  },
  {
    c: 'Películas dirigidas por Quentin Tarantino',
    f: ['Pulp Fiction', 'Kill Bill: Vol. 1', 'Malditos Bastardos', 'Django Desencadenado'],
    m: ['Reservoir Dogs', 'Érase una vez en Hollywood', 'Los Odiosos Ocho'],
    d: ['Jackie Brown', 'Death Proof', 'Four Rooms (segmento)'],
    t: ['El Lobo de Wall Street', 'Snatch', 'Taxi Driver', 'Scarface', 'Casino']
  },
  {
    c: 'Películas dirigidas por Steven Spielberg',
    f: ['Parque Jurásico', 'Tiburón', 'E.T., el extraterrestre', 'La lista de Schindler'],
    m: ['Salvar al soldado Ryan', 'Atrápame si puedes', 'Ready Player One'],
    d: ['El puente de los espías', 'Minority Report', 'War Horse'],
    t: ['Avatar', 'Regreso al futuro', 'Alien, el octavo pasajero', 'Blade Runner', 'Interstellar']
  },
  {
    c: 'Películas dirigidas por Martin Scorsese',
    f: ['Taxi Driver', 'Uno de los nuestros (Goodfellas)', 'El lobo de Wall Street', 'Infiltrados'],
    m: ['Casino', 'Toro Salvaje', 'Shutter Island'],
    d: ['El irlandés', 'Los asesinos de la luna', 'La edad de la inocencia'],
    t: ['El Padrino', 'Scarface', 'Pulp Fiction', 'Heat', 'Pena de muerte']
  },
  {
    c: 'Actores que han ganado el premio Oscar a Mejor Actor Principal',
    f: ['Leonardo DiCaprio', 'Joaquin Phoenix', 'Cillian Murphy', 'Will Smith'],
    m: ['Anthony Hopkins', 'Matthew McConaughey', 'Rami Malek'],
    d: ['Adrien Brody', 'Casey Affleck', 'Gary Oldman'],
    t: ['Brad Pitt', 'Tom Cruise', 'Johnny Depp', 'Harrison Ford', 'Christian Bale']
  },
  {
    c: 'Actrices que han ganado el premio Oscar a Mejor Actriz Principal',
    f: ['Meryl Streep', 'Emma Stone', 'Natalie Portman', 'Cate Blanchett'],
    m: ['Jennifer Lawrence', 'Sandra Bullock', 'Michelle Yeoh'],
    d: ['Jessica Chastain', 'Olivia Colman', 'Brie Larson'],
    t: ['Scarlett Johansson', 'Amy Adams', 'Margot Robbie', 'Helena Bonham Carter', 'Anne Hathaway']
  },
  {
    c: 'Actores que han ganado el premio Oscar a Mejor Actor de Reparto',
    f: ['Heath Ledger', 'Brad Pitt', 'Christoph Waltz', 'Javier Bardem'],
    m: ['Robert Downey Jr.', 'Christian Bale', 'J.K. Simmons'],
    d: ['Daniel Kaluuya', 'Mahershala Ali', 'Troy Kotsur'],
    t: ['Tom Cruise', 'Johnny Depp', 'Will Smith', 'Matt Damon', 'Harrison Ford']
  },
  {
    c: 'Actores que han interpretado a Batman en cine de imagen real',
    f: ['Christian Bale', 'Ben Affleck', 'Robert Pattinson', 'Michael Keaton'],
    m: ['George Clooney', 'Val Kilmer', 'Adam West'],
    d: ['Lewis Wilson', 'Robert Lowery', 'Kevin Conroy (cameo acción real)'],
    t: ['Cillian Murphy', 'Tom Hardy', 'Heath Ledger', 'Joaquin Phoenix', 'Jake Gyllenhaal']
  },
  {
    c: 'Actores que han encarnado a James Bond en el cine oficial (Eon Productions)',
    f: ['Sean Connery', 'Pierce Brosnan', 'Daniel Craig', 'Roger Moore'],
    m: ['Timothy Dalton', 'George Lazenby', 'David Niven (Casino Royale 1967)'],
    d: ['Barry Nelson (Casino Royale 1954)', 'Bob Holness (versión radio)', 'Michael Jayston'],
    t: ['Hugh Jackman', 'Clive Owen', 'Tom Hiddleston', 'Henry Cavill', 'Idris Elba']
  },

  // 11 - 20: Animación, Sagas de Culto y Fantasía
  {
    c: 'Películas de animación producidas por Pixar Animation Studios',
    f: ['Toy Story', 'Buscando a Nemo', 'Monstruos S.A.', 'Coco'],
    m: ['Up', 'Del revés (Inside Out)', 'Los Increíbles'],
    d: ['Soul', 'Brave (Indomable)', 'Luca'],
    t: ['Shrek', 'Ice Age', 'Madagascar', 'Kung Fu Panda', 'Gru, mi villano favorito']
  },
  {
    c: 'Películas de animación pertenecientes al canon clásico de Walt Disney',
    f: ['El rey león', 'Aladdín', 'La bella y la bestia', 'Frozen'],
    m: ['Mulan', 'Hércules', 'Tarzán'],
    d: ['Zootrópolis', 'Enredados', 'Vaiana (Moana)'],
    t: ['Shrek', 'Ice Age', 'Anastasia', 'El príncipe de Egipto', 'El gigante de hierro']
  },
  {
    c: 'Películas de animación producidas por DreamWorks Animation',
    f: ['Shrek', 'Kung Fu Panda', 'Madagascar', 'Cómo entrenar a tu dragón'],
    m: ['El gato con botas', 'Megamind', 'El príncipe de Egipto'],
    d: ['Los Croods', 'Spirit: El corcel indomable', 'El espantatiburones'],
    t: ['Toy Story', 'Buscando a Nemo', 'Ice Age', 'Gru, mi villano favorito', 'Cars']
  },
  {
    c: 'Películas de la saga principal de Harry Potter',
    f: ['La piedra filosofal', 'La cámara secreta', 'El prisionero de Azkaban', 'El cáliz de fuego'],
    m: ['La orden del fénix', 'El misterio del príncipe', 'Las reliquias de la muerte: Parte 1'],
    d: ['Las reliquias de la muerte: Parte 2', 'Animales fantásticos y dónde encontrarlos', 'Los secretos de Dumbledore'],
    t: ['Las crónicas de Narnia', 'Percy Jackson y el ladrón del rayo', 'La brújula dorada', 'Eragon', 'El laberinto del fauno']
  },
  {
    c: 'Personajes pertenecientes a la saga cinematográfica de Star Wars (Canon)',
    f: ['Darth Vader', 'Luke Skywalker', 'Yoda', 'Han Solo'],
    m: ['Mace Windu', 'Ahsoka Tano', 'Boba Fett'],
    d: ['Plo Koon', 'Grand Moff Tarkin', 'Bo-Katan Kryze'],
    t: ['Spock', 'Gandalf', 'Paul Atreides', 'Legolas', 'Thanos']
  },
  {
    c: 'Películas que forman parte del Universo Cinematográfico de Marvel (UCM)',
    f: ['Iron Man', 'Los Vengadores', 'Black Panther', 'Thor: Ragnarok'],
    m: ['Guardianes de la Galaxia', 'Doctor Strange', 'Capitana Marvel'],
    d: ['Eternals', 'Shang-Chi y la leyenda de los diez anillos', 'Ant-Man y la Avispa: Quantumania'],
    t: ['Venom', 'Morbius', 'The Batman', 'Logan', 'Deadpool (2016 original Fox)']
  },
  {
    c: 'Películas de la saga James Bond protagonizadas por Daniel Craig',
    f: ['Casino Royale (2006)', 'Quantum of Solace', 'Skyfall', 'Spectre'],
    m: ['Sin tiempo para morir', 'Skyfall (canción de Adele)', 'Casino Royale (Mads Mikkelsen)'],
    d: ['Spectre (Christoph Waltz)', 'Sin tiempo para morir (Rami Malek)', 'Quantum of Solace (Mathieu Amalric)'],
    t: ['GoldenEye', 'El mañana nunca muere', 'Muere otro día', 'El mundo nunca es suficiente', 'Octopussy']
  },
  {
    c: 'Películas de la franquicia Misión Imposible protagonizadas por Tom Cruise',
    f: ['Misión Imposible (1996)', 'Misión Imposible 2', 'Misión Imposible III', 'Protocolo Fantasma'],
    m: ['Nación Secreta', 'Fallout', 'Sentencia Mortal'],
    d: ['Protocolo Fantasma (Burj Khalifa)', 'Fallout (Henry Cavill)', 'Nación Secreta (avión exterior)'],
    t: ['Jack Reacher', 'Top Gun: Maverick', 'Al filo del mañana', 'El caso Bourne', 'Minority Report']
  },
  {
    c: 'Películas de la saga Fast & Furious (A todo gas)',
    f: ['A todo gas (2001)', 'A todo gas 2 (2 Fast 2 Furious)', 'Fast & Furious 5', 'Fast & Furious 7'],
    m: ['A todo gas: Tokyo Race', 'Fast & Furious 6', 'Fast & Furious 8'],
    d: ['Fast & Furious 9', 'Fast X', 'Hobbs & Shaw'],
    t: ['Need for Speed', 'Drive', 'Baby Driver', 'Taxi', 'Death Race']
  },
  {
    c: 'Películas españolas ganadoras del premio Goya a la Mejor Película',
    f: ['Todo sobre mi madre', 'Mar adentro', 'La isla mínima', 'Campeones'],
    m: ['Tesis', 'Celda 211', 'Dolor y gloria'],
    d: ['As bestas', 'La sociedad de la nieve', 'El bola'],
    t: ['Ocho apellidos vascos', 'Torrente, el brazo tonto de la ley', 'El día de la bestia', 'Lo imposible', 'Relatos salvajes']
  },

  // 21 - 30: Terror, Ciencia Ficción y Clásicos Modernos
  {
    c: 'Películas de terror reconocidas como clásicos del cine',
    f: ['El exorcista', 'El resplandor', 'Psicosis', 'Halloween'],
    m: ['Expediente Warren (The Conjuring)', 'Hereditary', 'Insidious'],
    d: ['La bruja', 'Midsommar', 'It Follows'],
    t: ['Seven (Se7en)', 'El silencio de los corderos', 'El sexto sentido', 'Zodiac', 'El cisne negro']
  },
  {
    c: 'Villanos y monstruos del cine de terror slasher',
    f: ['Freddy Krueger', 'Jason Voorhees', 'Michael Myers', 'Ghostface'],
    m: ['Leatherface', 'Chucky el muñeco diabólico', 'Pinhead'],
    d: ['Pennywise', 'Jigsaw (John Kramer)', 'Candyman'],
    t: ['Hannibal Lecter', 'Norman Bates', 'Patrick Bateman', 'Darth Vader', 'Voldemort']
  },
  {
    c: 'Películas dirigidas por Denis Villeneuve',
    f: ['Dune (2021)', 'Dune: Parte Dos', 'Blade Runner 2049', 'La llegada (Arrival)'],
    m: ['Sicario', 'Prisioneros (Prisoners)', 'Enemy'],
    d: ['Incendies', 'Polytechnique', 'Maelström'],
    t: ['Origen (Inception)', 'Interstellar', 'Tenet', 'Prometheus', 'Ex Machina']
  },
  {
    c: 'Películas dirigidas por David Fincher',
    f: ['El club de la lucha (Fight Club)', 'Seven (Se7en)', 'La red social (The Social Network)', 'Perdida (Gone Girl)'],
    m: ['Zodiac', 'El curioso caso de Benjamin Button', 'Mank'],
    d: ['The Game', 'La habitación del pánico', 'Alien 3'],
    t: ['Infiltrados', 'Shutter Island', 'Memento', 'Drive', 'Prisioneros']
  },
  {
    c: 'Películas dirigidas por Guillermo del Toro',
    f: ['El laberinto del fauno', 'La forma del agua', 'Hellboy', 'Pacific Rim'],
    m: ['El espinazo del diablo', 'El callejón de las almas perdidas', 'Pinocho de Guillermo del Toro'],
    d: ['Cronos', 'Mimic', 'La cumbre escarlata'],
    t: ['El orfanato (productor, no director)', 'Los ojos de Julia', 'El silencio de los corderos', 'La novia cadáver', 'Sleepy Hollow']
  },
  {
    c: 'Películas dirigidas por Tim Burton',
    f: ['Eduardo Manostijeras', 'Pesadilla antes de Navidad (productor/diseño)', 'Bitelchús', 'Batman (1989)'],
    m: ['Charlie y la fábrica de chocolate', 'Sleepy Hollow', 'Sweeney Todd'],
    d: ['Big Fish', 'Ed Wood', 'Mars Attacks!'],
    t: ['Coraline', 'La muerte os sienta tan bien', 'La familia Addams (1991)', 'Casper', 'Una serie de catastróficas desdichas']
  },
  {
    c: 'Películas dirigidas por James Cameron',
    f: ['Titanic', 'Avatar', 'Avatar: El sentido del agua', 'Terminator 2: El juicio final'],
    m: ['Aliens: El regreso', 'Terminator (1984)', 'Mentiras arriesgadas (True Lies)'],
    d: ['Abyss', 'Piraña II: Los vampiros del mar', 'Solaris (productor)'],
    t: ['Parque Jurásico', 'Matrix', 'Gladiator', 'Alien, el octavo pasajero (Ridley Scott)', 'Waterworld']
  },
  {
    c: 'Películas dirigidas por Ridley Scott',
    f: ['Gladiator', 'Alien, el octavo pasajero', 'Blade Runner', 'Marte (The Martian)'],
    m: ['Black Hawk derribado', 'Thelma & Louise', 'American Gangster'],
    d: ['El reino de los cielos', 'El último duelo', 'Los duelistas'],
    t: ['Salvar al soldado Ryan', 'Braveheart', 'Dune', 'Terminator 2', 'Babel']
  },
  {
    c: 'Películas dirigidas por Pedro Almodóvar',
    f: ['Todo sobre mi madre', 'Volver', 'Hable con ella', 'Mujeres al borde de un ataque de nervios'],
    m: ['La piel que habito', 'Dolor y gloria', 'Madres paralelas'],
    d: ['Átame', 'Tacones lejanos', 'La ley del deseo'],
    t: ['Mar adentro', 'Tesis', 'Los otros', 'El laberinto del fauno', 'La isla mínima']
  },
  {
    c: 'Películas que han superado los 2.000 millones de dólares en taquilla mundial',
    f: ['Avatar', 'Vengadores: Endgame', 'Avatar: El sentido del agua', 'Titanic'],
    m: ['Star Wars: El despertar de la Fuerza', 'Vengadores: Infinity War', 'Avatar (reestrenos)'],
    d: ['Endgame (récord de fin de semana)', 'Titanic (versión 3D)', 'Avatar 2 (superando 2.300M$)'],
    t: ['Spider-Man: No Way Home', 'Jurassic World', 'El Rey León (2019)', 'Los Vengadores (2012)', 'Top Gun: Maverick']
  },

  // 31 - 40: Grandes Actores y Actrices de Hollywood
  {
    c: 'Películas protagonizadas por Leonardo DiCaprio',
    f: ['Titanic', 'Origen (Inception)', 'El lobo de Wall Street', 'El renacido (The Revenant)'],
    m: ['Shutter Island', 'Infiltrados (The Departed)', 'Atrápame si puedes'],
    d: ['Django Desencadenado (reparto)', 'Érase una vez en Hollywood', 'Gangs of New York'],
    t: ['Interstellar', 'El club de la lucha', 'American Psycho', 'Drive', 'Brokeback Mountain']
  },
  {
    c: 'Películas protagonizadas por Brad Pitt',
    f: ['El club de la lucha (Fight Club)', 'Malditos Bastardos', 'Seven (Se7en)', 'Troya'],
    m: ['Érase una vez en Hollywood', 'Guerra Mundial Z', 'Ocean\'s Eleven'],
    d: ['El curioso caso de Benjamin Button', 'Moneyball', 'Ad Astra'],
    t: ['Origen (Inception)', 'El lobo de Wall Street', 'Gladiator', 'American Psycho', 'Matrix']
  },
  {
    c: 'Películas protagonizadas por Tom Hanks',
    f: ['Forrest Gump', 'Salvar al soldado Ryan', 'Náufrago', 'La milla verde'],
    m: ['Atrápame si puedes', 'El código Da Vinci', 'Apolo 13'],
    d: ['Capitán Phillips', 'Sully', 'Philadelphia'],
    t: ['Cadena perpetua', 'El show de Truman', 'Gladiator', 'Braveheart', 'El gran Lebowski']
  },
  {
    c: 'Películas protagonizadas por Tom Cruise',
    f: ['Top Gun: Maverick', 'Misión Imposible', 'Minority Report', 'Al filo del mañana'],
    m: ['Jerry Maguire', 'La guerra de los mundos', 'El último samurái'],
    d: ['Magnolia', 'Eyes Wide Shut', 'Nacido el cuatro de julio'],
    t: ['Speed', 'El caso Bourne', 'Matrix', 'Armageddon', 'Pulp Fiction']
  },
  {
    c: 'Películas protagonizadas por Johnny Depp',
    f: ['Piratas del Caribe', 'Eduardo Manostijeras', 'Charlie y la fábrica de chocolate', 'Alicia en el país de las maravillas'],
    m: ['Sleepy Hollow', 'Sweeney Todd', 'Descubriendo Nunca Jamás'],
    d: ['Miedo y asco en Las Vegas', 'Donnie Brasco', 'Ed Wood'],
    t: ['El gran hotel Budapest', 'Joker', 'Sherlock Holmes', 'El curioso caso de Benjamin Button', 'Bitelchús']
  },
  {
    c: 'Películas protagonizadas por Keanu Reeves',
    f: ['Matrix', 'John Wick', 'Speed (Máxima velocidad)', 'Constantine'],
    m: ['Le llaman Bodhi (Point Break)', 'Pactar con el diablo', 'Matrix Reloaded'],
    d: ['Drácula de Bram Stoker', 'My Own Private Idaho', 'A Scanner Darkly'],
    t: ['Misión Imposible', 'Origen (Inception)', 'El club de la lucha', 'Blade Runner 2049', 'Seven']
  },
  {
    c: 'Películas protagonizadas por Christian Bale',
    f: ['El Caballero Oscuro', 'American Psycho', 'El maquinista', 'El truco final (The Prestige)'],
    m: ['Batman Begins', 'The Fighter', 'Le Mans \'66 (Ford v Ferrari)'],
    d: ['El imperio del sol', 'La gran apuesta (The Big Short)', 'Vice (El vicio del poder)'],
    t: ['Oppenheimer', 'Shutter Island', 'Infiltrados', 'El club de la lucha', 'Memento']
  },
  {
    c: 'Películas protagonizadas por Scarlett Johansson',
    f: ['Los Vengadores', 'Historia de un matrimonio (Marriage Story)', 'Lost in Translation', 'Lucy'],
    m: ['Jojo Rabbit', 'Her (voz)', 'El truco final (The Prestige)'],
    d: ['Bajo la piel (Under the Skin)', 'Match Point', 'La joven de la perla'],
    t: ['El diario de Noa', 'La La Land', 'Barbie', 'El cisne negro', 'Los juegos del hambre']
  },
  {
    c: 'Películas protagonizadas por Emma Stone',
    f: ['La La Land', 'Pobres criaturas (Poor Things)', 'The Amazing Spider-Man', 'Criadas y señoras (The Help)'],
    m: ['Cruella', 'Rumores y mentiras (Easy A)', 'La favorita'],
    d: ['Birdman', 'Zombieland', 'Crazy, Stupid, Love'],
    t: ['El diario de Noa', 'Los juegos del hambre', 'Barbie', 'El cisne negro', 'Historias de Filadelfia']
  },
  {
    c: 'Películas protagonizadas por Denzel Washington',
    f: ['Training Day', 'The Equalizer (El protector)', 'Gladiator II', 'American Gangster'],
    m: ['El vuelo (Flight)', 'Fences', 'El fuego de la venganza (Man on Fire)'],
    d: ['Malcolm X', 'Huracán Carter', 'Tiempos de gloria (Glory)'],
    t: ['Cadena perpetua', 'Pulp Fiction', 'Salvar al soldado Ryan', 'Infiltrados', 'Seven']
  },

  // 41 - 50: Cine Bélico, Wéstern y Thrillers Psicológicos
  {
    c: 'Películas bélicas consideradas obras maestras del cine',
    f: ['Salvar al soldado Ryan', 'Apocalypse Now', 'La chaqueta metálica (Full Metal Jacket)', '1917'],
    m: ['Platoon', 'La delgada línea roja', 'Dunkerque'],
    d: ['Senderos de gloria', 'Sin novedad en el frente (2022)', 'Cartas desde Iwo Jima'],
    t: ['Gladiator', 'Braveheart', 'Troya', '300', 'El reino de los cielos']
  },
  {
    c: 'Películas del género wéstern clásico y contemporáneo',
    f: ['El bueno, el feo y el malo', 'Django Desencadenado', 'Sin perdón (Unforgiven)', 'Por un puñado de dólares'],
    m: ['Hasta que llegó su hora', 'La muerte tenía un precio', 'Valor de ley (True Grit)'],
    d: ['Centauros del desierto (The Searchers)', 'Solo ante el peligro (High Noon)', 'Los odiosos ocho'],
    t: ['El padrino', 'Scarface', 'Uno de los nuestros', 'Taxi Driver', 'Toro Salvaje']
  },
  {
    c: 'Thrillers psicológicos y de misterio con giros de guion',
    f: ['El sexto sentido', 'Shutter Island', 'Seven (Se7en)', 'El silencio de los corderos'],
    m: ['Los otros', 'Memento', 'Perdida (Gone Girl)'],
    d: ['Prisioneros', 'Oldboy', 'Sospechosos habituales (The Usual Suspects)'],
    t: ['A todo gas', 'La jungla de cristal', 'Armageddon', 'Transformers', 'Fast & Furious 5']
  },
  {
    c: 'Películas sobre juicios, abogados y dramas legales',
    f: ['12 hombres sin piedad (12 Angry Men)', 'Matar a un ruiseñor', 'Philadelphia', 'Algunos hombres buenos'],
    m: ['El abogado del diablo', 'Las dos caras de la verdad (Primal Fear)', 'Cuestión de justicia (Just Mercy)'],
    d: ['Veredicto final', 'En el nombre del padre', 'Anatomía de un asesinato'],
    t: ['Uno de los nuestros', 'Pulp Fiction', 'El lobo de Wall Street', 'Cadena perpetua', 'Infiltrados']
  },
  {
    c: 'Películas sobre el espacio y la astronomía basadas o ambientadas fuera de la Tierra',
    f: ['Interstellar', 'Marte (The Martian)', 'Gravity', '2001: Una odisea del espacio'],
    m: ['Apolo 13', 'First Man (El primer hombre)', 'Armageddon'],
    d: ['Contact', 'Moon', 'Ad Astra'],
    t: ['Origen (Inception)', 'Matrix', 'Tenet', 'Parque Jurásico', 'Avatar: El sentido del agua']
  },
  {
    c: 'Películas sobre el crimen organizado y la mafia italiana en Norteamérica',
    f: ['El Padrino', 'Uno de los nuestros (Goodfellas)', 'Casino', 'El irlandés'],
    m: ['Una historia del Bronx', 'Donnie Brasco', 'Infiltrados'],
    d: ['Camino a la perdición', 'Los intocables de Eliot Ness', 'Muerte entre las flores (Miller\'s Crossing)'],
    t: ['Pulp Fiction', 'Reservoir Dogs', 'El club de la lucha', 'American Psycho', 'Seven']
  },
  {
    c: 'Películas ambientadas en la Antigua Roma o con gladiadores',
    f: ['Gladiator', 'Ben-Hur', 'Espartaco', 'Gladiator II'],
    m: ['La caída del imperio romano', 'Quo Vadis', 'La pasión de Cristo'],
    d: ['Julio César (1953)', 'Centurión', 'La legión del águila'],
    t: ['Troya (Antigua Grecia)', '300 (Esparta/Persia)', 'Alejandro Magno', 'Braveheart', 'El reino de los cielos']
  },
  {
    c: 'Películas de robos, atracos a bancos y grandes golpes (Heist movies)',
    f: ['Ocean\'s Eleven', 'Heat', 'La casa de papel (fenómeno/versión film)', 'The Italian Job'],
    m: ['Baby Driver', 'Atraco perfecto (The Killing)', 'Tarde de perros (Dog Day Afternoon)'],
    d: ['The Town (Ciudad de ladrones)', 'Plan oculto (Inside Man)', 'Reservoir Dogs'],
    t: ['El padrino', 'Scarface', 'Seven', 'Taxi Driver', 'Zodiac']
  },
  {
    c: 'Películas distópicas ambientadas en futuros sombríos',
    f: ['Matrix', 'Blade Runner', 'Los juegos del hambre', 'Mad Max: Furia en la carretera'],
    m: ['Hijos de los hombres', 'Minority Report', 'Fahrenheit 451'],
    d: ['Gattaca', '1984', 'Akira'],
    t: ['Regreso al futuro', 'E.T., el extraterrestre', 'Parque Jurásico', 'Avatar', 'Interstellar']
  },
  {
    c: 'Películas de catástrofes naturales y apocalipsis planetario',
    f: ['El día de mañana (The Day After Tomorrow)', '2012', 'Armageddon', 'Deep Impact (Impacto profundo)'],
    m: ['San Andrés', 'Twister', 'Geostorm'],
    d: ['La tormenta perfecta', 'El coloso en llamas', 'Poseidón'],
    t: ['Marte (The Martian)', 'Gravity', 'Apolo 13', 'Interstellar', 'Primera llegada']
  },

  // 51 - 60: Cine Europeo, Asiático y Grandes Festivales
  {
    c: 'Películas ganadoras de la Palma de Oro en el Festival de Cannes',
    f: ['Parásitos', 'Pulp Fiction', 'Taxi Driver', 'Apocalypse Now'],
    m: ['El pianista', 'Amour (Amor)', 'El árbol de la vida'],
    d: ['Anatomía de una caída', 'El triángulo de la tristeza', 'Danzando en la oscuridad'],
    t: ['El Padrino', 'Titanic', 'Gladiator', 'La lista de Schindler', 'Forrest Gump']
  },
  {
    c: 'Películas surcoreanas reconocidas internacionalmente',
    f: ['Parásitos (Parasite)', 'Oldboy', 'Tren a Busan (Train to Busan)', 'La doncella (The Handmaiden)'],
    m: ['Memories of Murder', 'Encontré al diablo (I Saw the Devil)', 'Decision to Leave'],
    d: ['Burning', 'Madre (Mother)', 'Primavera, verano, otoño, invierno... y primavera'],
    t: ['El viaje de Chihiro', 'Spirited Away', 'Your Name', 'Akira', 'Ip Man']
  },
  {
    c: 'Películas japonesas clásicas y de culto de imagen real',
    f: ['Los siete samuráis', 'Rashomon', 'Godzilla (1954)', 'Yojimbo'],
    m: ['Ran', 'Trono de sangre', 'Drive My Car'],
    d: ['Cuentos de Tokio', 'Ikiru (Vivir)', 'Harakiri (Seppuku)'],
    t: ['Oldboy', 'Parásitos', 'Tigre y dragón', 'Ip Man', 'Memories of Murder']
  },
  {
    c: 'Películas italianas consideradas obras cumbres del cine',
    f: ['La vida es bella', 'Cinema Paradiso', 'La gran belleza', 'El ladrón de bicicletas'],
    m: ['La dolce vita', 'Ocho y medio (8½)', 'El bueno, el feo y el malo'],
    d: ['Roma, ciudad abierta', 'El gatopardo', 'Rocco y sus hermanos'],
    t: ['Amélie', 'Todo sobre mi madre', 'El laberinto del fauno', 'La haine', 'Intocable']
  },
  {
    c: 'Películas francesas contemporáneas con gran éxito internacional',
    f: ['Amélie', 'Intocable (Intouchables)', 'El odio (La haine)', 'Anatomía de una caída'],
    m: ['La vida de Adèle', 'Los coristas (Les Choristes)', 'Retrato de una mujer en llamas'],
    d: ['El profesional (Léon)', 'La vie en rose (La Môme)', 'De óxido y hueso'],
    t: ['La vida es bella', 'Cinema Paradiso', 'Todo sobre mi madre', 'La gran belleza', 'El laberinto del fauno']
  },
  {
    c: 'Películas argentinas aclamadas internacionalmente',
    f: ['El secreto de sus ojos', 'Relatos salvajes', 'Nueve reinas', 'Argentina, 1985'],
    m: ['La historia oficial', 'El hijo de la novia', 'El clan'],
    d: ['Esperando la carroza', 'Carancho', 'Un cuento chino'],
    t: ['Amores perros', 'Y tu mamá también', 'Roma (Alfonso Cuarón)', 'El laberinto del fauno', 'Machuca']
  },
  {
    c: 'Películas mexicanas aclamadas y dirigidas por los "Tres Amigos"',
    f: ['El laberinto del fauno', 'Roma', 'Birdman', 'La forma del agua'],
    m: ['Amores perros', 'Hijos de los hombres', 'Gravity'],
    d: ['Y tu mamá también', 'El renacido (The Revenant)', 'Babel'],
    t: ['Relatos salvajes', 'El secreto de sus ojos', 'Nueve reinas', 'Argentina, 1985', 'Machuca']
  },
  {
    c: 'Actores que han protagonizado películas de Marvel y también de DC Comics',
    f: ['Christian Bale (Batman / Gorr)', 'Ryan Reynolds (Green Lantern / Deadpool)', 'Michael Keaton (Batman / Buitre)', 'Ben Affleck (Batman / Daredevil)'],
    m: ['Willem Dafoe (Duende Verde / Vulko)', 'Idris Elba (Heimdall / Bloodsport)', 'Colin Farrell (Bullseye / Pingüino)'],
    d: ['Hugo Weaving (Cráneo Rojo / V de Vendetta)', 'J.K. Simmons (J.J. Jameson / Gordon)', 'Djimon Hounsou (Korath / Shazam)'],
    t: ['Robert Downey Jr.', 'Hugh Jackman', 'Henry Cavill', 'Tobey Maguire', 'Cillian Murphy']
  },
  {
    c: 'Películas rodadas en blanco y negro en la era moderna (desde 1990)',
    f: ['La lista de Schindler', 'Roma (Alfonso Cuarón)', 'The Artist', 'Oppenheimer (secciones blanco y negro)'],
    m: ['El faro (The Lighthouse)', 'Ed Wood', 'Mank'],
    d: ['Ida', 'Cold War', 'Nebraska'],
    t: ['Pulp Fiction', 'Salvar al soldado Ryan', 'Seven', 'Titanic', 'Gladiator']
  },
  {
    c: 'Películas sobre boxing y deportes de combate galardonadas con el Oscar',
    f: ['Rocky', 'Million Dollar Baby', 'Toro Salvaje (Raging Bull)', 'The Fighter'],
    m: ['Creed', 'Ali', 'Cinderella Man'],
    d: ['Huracán Carter', 'Marcado por el odio (Somebody Up There Likes Me)', 'Fat City'],
    t: ['Karate Kid', 'Gladiator', 'Troya', 'Warrior', 'Sin perdón']
  },

  // 61 - 70: Comedia, Musicales y Romance
  {
    c: 'Películas musicales que han ganado el premio Oscar',
    f: ['La La Land', 'West Side Story (1961)', 'Sonrisas y lágrimas (The Sound of Music)', 'Chicago'],
    m: ['Oliver!', 'My Fair Lady', 'Cabaret'],
    d: ['Un americano en París', 'Gigi', 'All That Jazz'],
    t: ['El gran showman', 'Grease', 'Moulin Rouge!', 'Mamma Mia!', 'Bohemian Rhapsody']
  },
  {
    c: 'Comedias románticas clásicas de los años 80 y 90',
    f: ['Pretty Woman', 'Notting Hill', 'Cuando Harry encontró a Sally', 'Cuatro bodas y un funeral'],
    m: ['Algo para recordar (Sleepless in Seattle)', 'Tienes un e-mail', 'La boda de mi mejor amigo'],
    d: ['Jerry Maguire', 'Hechizo de luna (Moonstruck)', '10 razones para odiarte'],
    t: ['El diario de Noa', 'Titanic', 'Ghost', 'La La Land', 'Brokeback Mountain']
  },
  {
    c: 'Comedias disparatadas y gamberras de culto (Slapstick / Parodias)',
    f: ['Aterriza como puedas (Airplane!)', 'Scary Movie', 'La vida de Brian (Monty Python)', 'Dos tontos muy tontos (Dumb and Dumber)'],
    m: ['Agárralo como puedas (The Naked Gun)', 'Los caballeros de la mesa cuadrada', 'Resacón en Las Vegas (The Hangover)'],
    d: ['Top Secret!', 'El jovencito Frankenstein', 'Zoolander'],
    t: ['Pulp Fiction', 'El gran Lebowski', 'El lobo de Wall Street', 'Atrápame si puedes', 'Todo a la vez en todas partes']
  },
  {
    c: 'Películas navideñas tradicionales y familiares',
    f: ['Solo en casa (Home Alone)', '¡Qué bello es vivir! (It\'s a Wonderful Life)', 'El Grinch', 'Pesadilla antes de Navidad'],
    m: ['Elf', 'Love Actually', 'The Polar Express'],
    d: ['Klaus', 'Milagro en la calle 34', 'Santa Clausula'],
    t: ['La jungla de cristal (Die Hard debatida)', 'Gremlins', 'Eyes Wide Shut', 'Batman vuelve', 'Arma letal']
  },
  {
    c: 'Películas de comedia protagonizadas por Jim Carrey',
    f: ['La máscara (The Mask)', 'El show de Truman', 'Dos tontos muy tontos', 'Mentiroso compulsivo (Liar Liar)'],
    m: ['Ace Ventura', 'El Grinch', 'Como Dios (Bruce Almighty)'],
    d: ['¡Olvídate de mí! (Eternal Sunshine)', 'Man on the Moon', 'Di que sí (Yes Man)'],
    t: ['Padre de familia', 'La boda de mi mejor amigo', 'Austin Powers', 'Zoolander', 'Los padres de ella']
  },
  {
    c: 'Películas de espionaje y agentes secretos (excluyendo James Bond)',
    f: ['El caso Bourne (The Bourne Identity)', 'Kingsman: Servicio secreto', 'Misión Imposible', 'Múnich'],
    m: ['El ultimátum de Bourne', 'Spy Game', 'El topo (Tinker Tailor Soldier Spy)'],
    d: ['El puente de los espías', 'Gorrión rojo (Red Sparrow)', 'Ronin'],
    t: ['John Wick', 'Speed', 'La jungla de cristal', 'Heat', 'Infiltrados']
  },
  {
    c: 'Películas ambientadas en barcos, islas desiertas o naufragios',
    f: ['Titanic', 'Náufrago (Cast Away)', 'La vida de Pi', 'Piratas del Caribe'],
    m: ['Master and Commander', 'La tormenta perfecta', 'Poseidón'],
    d: ['El motín del Caine', 'La aventura del Poseidón', 'Capitán Phillips'],
    t: ['Tiburón (costa/mar abierto sin catástrofe naval total)', 'Abyss', 'Waterworld', 'Buscando a Nemo', 'Salvar al soldado Ryan']
  },
  {
    c: 'Películas de zombis y muertos vivientes',
    f: ['Guerra Mundial Z (World War Z)', '28 días después', 'Soy leyenda', 'Zombies Party (Shaun of the Dead)'],
    m: ['Tren a Busan', 'El amanecer de los muertos (2004)', 'Bienvenidos a Zombieland'],
    d: ['La noche de los muertos vivientes (1968)', 'REC', '28 semanas después'],
    t: ['El exorcista', 'El resplandor', 'Psicosis', 'Insidious', 'Expediente Warren']
  },
  {
    c: 'Películas de animación stop-motion reconocidas',
    f: ['Pesadilla antes de Navidad', 'La novia cadáver (Corpse Bride)', 'Coraline (Los mundos de Coraline)', 'Chicken Run (Evasión en la granja)'],
    m: ['Fantástico Sr. Fox (Fantastic Mr. Fox)', 'Pinocho de Guillermo del Toro', 'Isla de perros'],
    d: ['Kubo y las dos cuerdas mágicas', 'Frankenweenie', 'Wallace & Gromit'],
    t: ['Toy Story', 'Buscando a Nemo', 'Shrek', 'El viaje de Chihiro', 'Ice Age']
  },
  {
    c: 'Películas de atracos a casinos en Las Vegas',
    f: ['Ocean\'s Eleven', 'Casino', 'Ocean\'s Twelve', 'Ocean\'s Thirteen'],
    m: ['Resacón en Las Vegas', '21 Black Jack', 'Croupier'],
    d: ['El cerebro de 1.000 millones de dólares', 'Hard Eight (Sidney)', 'Golpe en Las Vegas'],
    t: ['Pulp Fiction', 'Heat', 'Atraco perfecto', 'Reservoir Dogs', 'Infiltrados']
  },

  // 71 - 80: Biopics, Drama Carcelario e Historia Real
  {
    c: 'Películas carcelarias y de fugas de prisiones',
    f: ['Cadena perpetua (The Shawshank Redemption)', 'La milla verde', 'Fuga de Alcatraz', 'Celda 211'],
    m: ['Papillón', 'La gran evasión (The Great Escape)', 'En el nombre del padre'],
    d: ['Un profeta', 'El conde de Montecristo', 'Bronson'],
    t: ['El lobo de Wall Street', 'Uno de los nuestros', 'Taxi Driver', 'Scarface', 'Infiltrados']
  },
  {
    c: 'Películas biográficas musicales sobre estrellas del rock y pop',
    f: ['Bohemian Rhapsody (Queen)', 'Rocketman (Elton John)', 'Elvis (Elvis Presley)', 'En la cuerda floja (Johnny Cash)'],
    m: ['Straight Outta Compton (N.W.A)', 'Ray (Ray Charles)', 'Bob Marley: One Love'],
    d: ['Control (Joy Division)', 'Love & Mercy (Brian Wilson)', 'Nowhere Boy (John Lennon)'],
    t: ['La La Land', 'Ha nacido una estrella (ficción)', 'Casi famosos (ficción)', 'Whiplash (ficción)', 'School of Rock (ficción)']
  },
  {
    c: 'Películas históricas sobre reyes, reinas y monarquías europeas',
    f: ['El discurso del rey', 'La reina (The Queen)', 'Maria Antonieta', 'Braveheart'],
    m: ['La favorita', 'Las hermanas Bolena', 'Elizabeth'],
    d: ['La locura del rey Jorge', 'El león en invierno', 'El rey (2019)'],
    t: ['Gladiator', 'Troya', 'El reino de los cielos', '300', 'Alexander']
  },
  {
    c: 'Películas sobre periodismo e investigaciones de prensa real',
    f: ['Todos los hombres del presidente (Watergate)', 'Spotlight', 'Los archivos del Pentágono (The Post)', 'Zodiac'],
    m: ['Buenas noches, y buena suerte', 'El dilema (The Insider)', 'Frost/Nixon'],
    d: ['Luna nueva (His Girl Friday)', 'Network (Un mundo implacable)', 'El reportero (Professione: reporter)'],
    t: ['Cadena perpetua', 'Infiltrados', 'El lobo de Wall Street', 'Seven', 'El club de la lucha']
  },
  {
    c: 'Películas de aventuras arqueológicas y tesoros perdidos',
    f: ['En busca del arca perdida (Indiana Jones)', 'La momia (1999)', 'La búsqueda (National Treasure)', 'Tomb Raider'],
    m: ['Indiana Jones y la última cruzada', 'Indiana Jones y el templo maldito', 'Uncharted'],
    d: ['El secreto de la pirámide', 'Las minas del rey Salomón', 'Tintín: El secreto del unicornio'],
    t: ['Parque Jurásico', 'Piratas del Caribe', 'El Señor de los Anillos', 'Gladiator', 'Troya']
  },
  {
    c: 'Películas sobre científicos y mentes prodigiosas basadas en hechos reales',
    f: ['Oppenheimer', 'Una mente maravillosa (A Beautiful Mind)', 'La teoría del todo (Stephen Hawking)', 'The Imitation Game (Alan Turing)'],
    m: ['Madame Curie', 'El hombre que conocía el infinito (Ramanujan)', 'Figuras ocultas (Hidden Figures)'],
    d: ['Radioactive', 'Edison (La guerra de las corrientes)', 'Creation (Charles Darwin)'],
    t: ['Origen (Inception)', 'Interstellar', 'Regreso al futuro', 'Matrix', 'Frankenstein']
  },
  {
    c: 'Películas ganadoras del Oscar a los Mejores Efectos Visuales',
    f: ['Avatar', 'Avatar: El sentido del agua', 'Interstellar', 'Matrix'],
    m: ['Origen (Inception)', 'Dune (2021)', 'El Señor de los Anillos: Las Dos Torres'],
    d: ['Hugo (La invención de Hugo)', '1917', 'Godzilla Minus One (2023)'],
    t: ['Oppenheimer', 'Parásitos', 'La La Land', 'Braveheart', 'Green Book']
  },
  {
    c: 'Películas ganadoras del Oscar a la Mejor Banda Sonora Original',
    f: ['La vida es bella', 'Star Wars: Una nueva esperanza', 'Tiburón', 'El Señor de los Anillos: La Comunidad del Anillo'],
    m: ['La La Land', 'Oppenheimer', 'Gladiator'],
    d: ['La lista de Schindler', 'El rey león (1994)', 'Memorias de África'],
    t: ['Avatar', 'Interstellar (Hans Zimmer nominada, perdió)', 'Pulp Fiction', 'El Padrino (descalificada en su año)', 'Inception']
  },
  {
    c: 'Compositores de bandas sonoras con premios Oscar ganados',
    f: ['John Williams', 'Hans Zimmer', 'Ennio Morricone', 'Howard Shore'],
    m: ['Alexandre Desplat', 'Ludwig Göransson', 'Michael Giacchino'],
    d: ['Bernard Herrmann', 'Max Steiner', 'Nino Rota'],
    t: ['Danny Elfman (0 Oscars ganados)', 'Thomas Newman (0 Oscars ganados)', 'Harry Gregson-Williams', 'John Powell', 'Clint Mansell']
  },
  {
    c: 'Películas ambientadas en la Primera Guerra Mundial (1914-1918)',
    f: ['1917', 'Senderos de gloria (Paths of Glory)', 'Sin novedad en el frente (All Quiet on the Western Front)', 'War Horse'],
    m: ['Caballo de batalla', 'La gran ilusión', 'Gallipoli'],
    d: ['Joyeux Noël (Feliz Navidad)', 'Paschendaele', 'Sargento York'],
    t: ['Salvar al soldado Ryan (Segunda Guerra)', 'La lista de Schindler', 'Dunkerque', 'Apocalypse Now', 'Platoon']
  },

  // 81 - 90: Sagas, Franquicias y Acción de Élite
  {
    c: 'Películas pertenecientes a la franquicia Parque Jurásico (Jurassic Park / World)',
    f: ['Parque Jurásico (1993)', 'El mundo perdido: Jurassic Park', 'Jurassic Park III', 'Jurassic World (2015)'],
    m: ['Jurassic World: El reino caído', 'Jurassic World: Dominion', 'Battle at Big Rock (corto canon)'],
    d: ['Jurassic Park 3D (reestreno)', 'Return to Jurassic Park', 'Jurassic World Camp Cretaceous'],
    t: ['Godzilla', 'King Kong', 'Viaje al centro de la Tierra', 'En busca del valle encantado', 'Megodón']
  },
  {
    c: 'Películas de la saga Alien protagonizadas por el xenomorfo',
    f: ['Alien, el octavo pasajero', 'Aliens: El regreso', 'Alien 3', 'Alien: Resurrección'],
    m: ['Prometheus', 'Alien: Covenant', 'Alien: Romulus'],
    d: ['Alien vs. Predator', 'Alien vs. Predator 2: Requiem', 'Alien Director\'s Cut'],
    t: ['Predator (Depredador solo)', 'Blade Runner', 'Terminator 2', 'La cosa (The Thing)', 'Species']
  },
  {
    c: 'Películas de la saga Terminator protagonizadas por Arnold Schwarzenegger',
    f: ['Terminator (1984)', 'Terminator 2: El juicio final', 'Terminator 3: La rebelión de las máquinas', 'Terminator: Destino oscuro'],
    m: ['Terminator Génesis', 'Terminator 2 3D', 'Terminator Salvation (cameo digital CGI)'],
    d: ['T2: 3D Battle Across Time', 'Terminator Special Edition', 'Dark Fate extended'],
    t: ['RoboCop', 'Depredador (Predator)', 'Desafío total (Total Recall)', 'Comando', 'Mentiras arriesgadas']
  },
  {
    c: 'Películas protagonizadas por Keanu Reeves como el asesino John Wick',
    f: ['John Wick (Otro día para matar)', 'John Wick: Capítulo 2 (Pacto de sangre)', 'John Wick: Capítulo 3 (Parabellum)', 'John Wick: Capítulo 4'],
    m: ['The Continental (serie spin-off)', 'Ballerina (spin-off)', 'John Wick 2 (Cameo Cassian)'],
    d: ['John Wick Chronicles', 'Parabellum (Halle Berry)', 'Capítulo 4 (Donnie Yen)'],
    t: ['Matrix', 'Constantine', 'Speed', 'Pactar con el diablo', 'Le llaman Bodhi']
  },
  {
    c: 'Películas de superhéroes dirigidas o protagonizadas por personajes de X-Men',
    f: ['X-Men (2000)', 'X-Men 2', 'X-Men: Días del futuro pasado', 'Logan'],
    m: ['X-Men: Primera generación', 'Deadpool', 'Deadpool & Wolverine'],
    d: ['X-Men: Apocalipsis', 'X-Men: Fénix Oscura', 'Los Nuevos Mutantes'],
    t: ['Los Vengadores (UCM)', 'The Batman', 'Aquaman', 'Man of Steel', 'Doctor Strange']
  },
  {
    c: 'Películas de artes marciales y kung-fu consideradas obras cumbres',
    f: ['Operación Dragón (Enter the Dragon)', 'Tigre y dragón (Crouching Tiger, Hidden Dragon)', 'Kill Bill: Vol. 1', 'Ip Man'],
    m: ['Furia oriental', 'El furor del dragón', 'Ong-Bak'],
    d: ['Drunken Master (El maestro borracho)', 'Hero', 'La casa de las dagas voladoras'],
    t: ['Karate Kid', 'Mortal Kombat', 'Cobra Kai', 'Gladiator', '300']
  },
  {
    c: 'Películas que adaptan novelas de Stephen King',
    f: ['El resplandor (The Shining)', 'Cadena perpetua (The Shawshank Redemption)', 'It (Eso)', 'La milla verde'],
    m: ['Carrie', 'Misery', 'Cuenta conmigo (Stand by Me)'],
    d: ['Cementerio de animales', 'La niebla (The Mist)', 'Doctor Sueño'],
    t: ['El exorcista', 'Psicosis', 'La profecía', 'Halloween', 'Viernes 13']
  },
  {
    c: 'Películas del cine español dirigidas por Álex de la Iglesia',
    f: ['El día de la bestia', 'La comunidad', 'Las brujas de Zugarramurdi', 'Balada triste de trompeta'],
    m: ['Acción mutante', 'El bar', 'Perfectos desconocidos (España)'],
    d: ['Crimen ferpecto', 'Muertos de risa', 'Perdita Durango'],
    t: ['Torrente', 'Ocho apellidos vascos', 'Tesis', 'Airbag', 'El milagro de P. Tinto']
  },
  {
    c: 'Películas del cine español dirigidas por Alejandro Amenábar',
    f: ['Tesis', 'Abre los ojos', 'Los otros', 'Mar adentro'],
    m: ['Ágora', 'Mientras dure la guerra', 'Regresión'],
    d: ['Himenóptero (corto)', 'Luna (corto)', 'Vale (corto Estrella Damm)'],
    t: ['El laberinto del fauno', 'La isla mínima', 'Celda 211', 'El orfanato', 'Dolor y gloria']
  },
  {
    c: 'Películas ganadoras del premio Oscar a la Mejor Película Internacional / Habla No Inglesa',
    f: ['Parásitos (Corea del Sur)', 'La vida es bella (Italia)', 'Cinema Paradiso (Italia)', 'Mar adentro (España)'],
    m: ['Todo sobre mi madre (España)', 'Amour (Austria/Francia)', 'La gran belleza (Italia)'],
    d: ['El secreto de sus ojos (Argentina)', 'Otra ronda (Druk, Dinamarca)', 'La zona de interés (Reino Unido)'],
    t: ['El laberinto del fauno (perdió ante La vida de los otros)', 'Amélie', 'Relatos salvajes', 'La sociedad de la nieve', 'Ciudad de Dios']
  },

  // 91 - 100: Festivales, Animación y Cine de Culto
  {
    c: 'Películas del universo cinematográfico de Batman dirigidas por Tim Burton o Christopher Nolan',
    f: ['Batman (1989)', 'Batman vuelve (1992)', 'Batman Begins', 'El Caballero Oscuro'],
    m: ['El Caballero Oscuro: La leyenda renace (The Dark Knight Rises)', 'Batman (Jack Nicholson)', 'El Caballero Oscuro (Heath Ledger)'],
    d: ['Batman vuelve (Danny DeVito Pingüino)', 'Batman Begins (Espantapájaros)', 'The Dark Knight Rises (Bane)'],
    t: ['Batman Forever (Joel Schumacher)', 'Batman & Robin (Joel Schumacher)', 'The Batman (Matt Reeves)', 'Batman v Superman (Zack Snyder)', 'Joker (Todd Phillips)']
  },
  {
    c: 'Películas de ciencia ficción basadas en novelas de Philip K. Dick',
    f: ['Blade Runner', 'Minority Report', 'Desafío total (Total Recall)', 'Paycheck'],
    m: ['A Scanner Darkly', 'Destino oculto (The Adjustment Bureau)', 'Infiltrado (Impostor)'],
    d: ['Blade Runner 2049 (personajes originales)', 'Next (El vidente)', 'Screamers (Asesinos cibernéticos)'],
    t: ['Matrix', 'Terminator', 'Yo, robot (Isaac Asimov)', 'Origen (Inception)', 'El show de Truman']
  },
  {
    c: 'Películas protagonizadas por el actor galés Anthony Hopkins',
    f: ['El silencio de los corderos', 'Thor (Odin)', 'El padre (The Father)', 'Hannibal'],
    m: ['Lo que queda del día', 'Drácula de Bram Stoker', 'Leyendas de pasión'],
    d: ['¿Conoces a Joe Black?', 'Nixon', 'Amistad'],
    t: ['El padrino', 'Seven', 'El gran Lebowski', 'Shutter Island', 'Cadena perpetua']
  },
  {
    c: 'Películas de animación japonesa dirigidas por Hayao Miyazaki',
    f: ['El viaje de Chihiro', 'Mi vecino Totoro', 'La princesa Mononoke', 'El castillo ambulante'],
    m: ['Ponyo en el acantilado', 'El viento se levanta', 'El chico y la garza'],
    d: ['Nausicaä del Valle del Viento', 'Porco Rosso', 'El castillo de Cagliostro'],
    t: ['Your Name (Makoto Shinkai)', 'La tumba de las luciérnagas (Isao Takahata)', 'Akira (Katsuhiro Otomo)', 'Ghost in the Shell (Mamoru Oshii)', 'A Silent Voice']
  },
  {
    c: 'Películas sobre periodos de la historia de España en el siglo XX',
    f: ['La lengua de las mariposas (Guerra Civil)', 'El laberinto del fauno (Posguerra)', 'Mientras dure la guerra (Unamuno)', 'La vaquilla'],
    m: ['Las bicicletas son para el verano', 'Ay, Carmela!', 'Tierra y libertad'],
    d: ['La trinchera infinita', 'Madres paralelas', 'El espinazo del diablo'],
    t: ['Gladiator', 'Mar adentro', 'Celda 211', 'Tesis', 'Ocho apellidos vascos']
  },
  {
    c: 'Películas de cine independiente que ganaron el Gran Premio del Jurado en Sundance',
    f: ['Whiplash', 'Precious', 'Beasts of the Southern Wild', 'Fruitvale Station'],
    m: ['Pequeña Miss Sunshine (Little Miss Sunshine)', 'Primer', 'Minari'],
    d: ['Winter\'s Bone', 'Me and Earl and the Dying Girl', 'CODA (triunfo Sundance y Oscar)'],
    t: ['Pulp Fiction (Cannes)', 'Parásitos (Cannes)', 'Titanic', 'Avatar', 'Origen']
  },
  {
    c: 'Películas protagonizadas por Morgan Freeman',
    f: ['Cadena perpetua (The Shawshank Redemption)', 'Seven (Se7en)', 'Million Dollar Baby', 'El Caballero Oscuro'],
    m: ['Invictus', 'Paseando a Miss Daisy', 'Como Dios (Bruce Almighty)'],
    d: ['Sin perdón (Unforgiven)', 'Tiempos de gloria (Glory)', 'Ahora o nunca (The Bucket List)'],
    t: ['Forrest Gump', 'Pulp Fiction', 'El padrino', 'Gladiator', 'Infiltrados']
  },
  {
    c: 'Películas de acción policíaca estilo "Buddy Cop" (parejas de detectives)',
    f: ['Arma letal (Lethal Weapon)', 'Dos policías rebeldes (Bad Boys)', 'Hora punta (Rush Hour)', 'Men in Black (Hombres de negro)'],
    m: ['Arma fatal (Hot Fuzz)', 'Límite: 48 horas', 'Infiltrados en clase (21 Jump Street)'],
    d: ['Tango y Cash', 'Dos sabuesos despistados (Dragnet)', 'The Nice Guys (Dos buenos tipos)'],
    t: ['La jungla de cristal (agente solo)', 'John Wick', 'Speed', 'Misión Imposible', 'El fugitivo']
  },
  {
    c: 'Películas que combinaron animación tradicional o 3D con actores reales de carne y hueso',
    f: ['¿Quién engañó a Roger Rabbit?', 'Space Jam (1996)', 'Mary Poppins', 'Space Jam: Nuevas leyendas'],
    m: ['Stuart Little', 'Paddington', 'Sonic: La película'],
    d: ['La bruja novata', 'Una rubia entre dos mundos (Cool World)', 'Looney Tunes: De nuevo en acción'],
    t: ['Toy Story (animación pura)', 'Shrek (animación pura)', 'El rey león (CGI puro)', 'Avatar (CGI fotorrealista/captura)', 'Buscando a Nemo']
  },
  {
    c: 'Películas clásicas del cine de suspense dirigidas por Alfred Hitchcock',
    f: ['Psicosis', 'La ventana indiscreta', 'Vértigo (De entre los muertos)', 'Los pájaros'],
    m: ['Con la muerte en los talones (North by Northwest)', 'Crimen perfecto (Dial M for Murder)', 'Extraños en un tren'],
    d: ['Rebeca', 'La soga', 'Encadenados (Notorious)'],
    t: ['El resplandor (Stanley Kubrick)', 'El cabo del miedo (Martin Scorsese)', 'Chinatown (Roman Polanski)', 'El exorcista (William Friedkin)', 'La semilla del diablo']
  }
];

export default Array.from({ length: 100 }, (_, idx) => {
  const p = plantillas[idx];
  return {
    id: `cine_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});