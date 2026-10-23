// server/data/seeds/buscaminas/cine.js

const plantillas = [
  // 1 - 10: Premios de la Academia, Directores y Universos Cinematográficos
  {
    c: 'Películas ganadoras del premio Oscar a Mejor Película',
    f: ['Titanic', 'Gladiator', 'El Señor de los Anillos: El Retorno del Rey', 'Forrest Gump'],
    m: ['Oppenheimer', 'Parásitos', 'Braveheart'],
    d: ['Spotlight', 'Nomadland', 'The Artist'],
    t: ['Avatar', 'Interstellar', 'Pulp Fiction', 'El Caballero Oscuro', 'Origen']
  },
  {
    c: 'Películas dirigidas por Christopher Nolan',
    f: ['Origen', 'Interstellar', 'Oppenheimer', 'El Caballero Oscuro'],
    m: ['Dunkerque', 'Memento', 'Tenet'],
    d: ['Following', 'Insomnio', 'El Truco Final'],
    t: ['Shutter Island', 'Seven', 'Zodiac', 'Gravity', 'Blade Runner 2049']
  },
  {
    c: 'Películas dirigidas por Quentin Tarantino',
    f: ['Pulp Fiction', 'Kill Bill: Vol. 1', 'Malditos Bastardos', 'Django Desencadenado'],
    m: ['Reservoir Dogs', 'Érase una vez en Hollywood', 'Los Odiosos Ocho'],
    d: ['Jackie Brown', 'Death Proof', 'Kill Bill: Vol. 2'],
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
    f: ['Taxi Driver', 'Uno de los nuestros', 'El lobo de Wall Street', 'Infiltrados'],
    m: ['Casino', 'Toro Salvaje', 'Shutter Island'],
    d: ['El irlandés', 'Los asesinos de la luna', 'La edad de la inocencia'],
    t: ['El Padrino', 'Scarface', 'Pulp Fiction', 'Heat', 'Carlito\'s Way']
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
    d: ['Lewis Wilson', 'Robert Lowery', 'Kevin Conroy'],
    t: ['Cillian Murphy', 'Tom Hardy', 'Heath Ledger', 'Joaquin Phoenix', 'Jake Gyllenhaal']
  },
  {
    c: 'Actores que han encarnado a James Bond en el cine oficial (Eon Productions)',
    f: ['Sean Connery', 'Pierce Brosnan', 'Daniel Craig', 'Roger Moore'],
    m: ['Timothy Dalton', 'George Lazenby', 'David Niven'],
    d: ['Barry Nelson', 'Bob Holness', 'Michael Jayston'],
    t: ['Hugh Jackman', 'Clive Owen', 'Tom Hiddleston', 'Henry Cavill', 'Idris Elba']
  },

  // 11 - 20: Animación, Sagas de Culto y Fantasía
  {
    c: 'Películas de animación producidas por Pixar Animation Studios',
    f: ['Toy Story', 'Buscando a Nemo', 'Monstruos S.A.', 'Coco'],
    m: ['Up', 'Del revés', 'Los Increíbles'],
    d: ['Soul', 'Brave', 'Luca'],
    t: ['Shrek', 'Ice Age', 'Madagascar', 'Kung Fu Panda', 'Gru, mi villano favorito']
  },
  {
    c: 'Películas de animación pertenecientes al canon clásico de Walt Disney',
    f: ['El rey león', 'Aladdín', 'La bella y la bestia', 'Frozen'],
    m: ['Mulan', 'Hércules', 'Tarzán'],
    d: ['Zootrópolis', 'Enredados', 'Vaiana'],
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
    d: ['Las reliquias de la muerte: Parte 2', 'Animales fantásticos y dónde encontrarlos', 'Los crímenes de Grindelwald'],
    t: ['Las crónicas de Narnia', 'Percy Jackson y el ladrón del rayo', 'La brújula dorada', 'Eragon', 'El laberinto del fauno']
  },
  {
    c: 'Personajes pertenecientes a la saga cinematográfica de Star Wars',
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
    t: ['Venom', 'Morbius', 'The Batman', 'Logan', 'X-Men: Días del futuro pasado']
  },
  {
    c: 'Películas de la saga James Bond protagonizadas por Daniel Craig',
    f: ['Casino Royale', 'Quantum of Solace', 'Skyfall', 'Spectre'],
    m: ['Sin tiempo para morir', 'GoldenEye', 'El mañana nunca muere'], // Reposicionado para balance
    d: ['El mundo nunca es suficiente', 'Muere otro día', 'Licencia para matar'],
    t: ['Misión Imposible', 'El caso Bourne', 'Kingsman', 'Jack Reacher', 'Top Gun']
  },
  {
    c: 'Películas de la franquicia Misión Imposible protagonizadas por Tom Cruise',
    f: ['Misión Imposible (1996)', 'Misión Imposible 2', 'Misión Imposible III', 'Protocolo Fantasma'],
    m: ['Nación Secreta', 'Fallout', 'Sentencia Mortal'],
    d: ['Top Gun', 'Top Gun: Maverick', 'Al filo del mañana'],
    t: ['Jack Reacher', 'El caso Bourne', 'Minority Report', 'Oblivion', 'Noche y día']
  },
  {
    c: 'Películas de la saga de acción y automovilismo Fast & Furious',
    f: ['A todo gas (2001)', 'A todo gas 2', 'Fast & Furious 5', 'Fast & Furious 7'],
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
    f: ['El exorcista', 'El resplandor', 'Psicosis', 'La noche de Halloween'],
    m: ['Expediente Warren', 'Hereditary', 'Insidious'],
    d: ['La bruja', 'Midsommar', 'It Follows'],
    t: ['Seven', 'El silencio de los corderos', 'El sexto sentido', 'Zodiac', 'El cisne negro']
  },
  {
    c: 'Villanos y monstruos del cine de terror slasher',
    f: ['Freddy Krueger', 'Jason Voorhees', 'Michael Myers', 'Ghostface'],
    m: ['Leatherface', 'Chucky', 'Pinhead'],
    d: ['Pennywise', 'Jigsaw', 'Candyman'],
    t: ['Hannibal Lecter', 'Norman Bates', 'Patrick Bateman', 'Darth Vader', 'Voldemort']
  },
  {
    c: 'Películas dirigidas por el cineasta Denis Villeneuve',
    f: ['Dune (2021)', 'Dune: Parte Dos', 'Blade Runner 2049', 'La llegada'],
    m: ['Sicario', 'Prisioneros', 'Enemy'],
    d: ['Incendies', 'Polytechnique', 'Maelström'],
    t: ['Origen', 'Interstellar', 'Tenet', 'Prometheus', 'Ex Machina']
  },
  {
    c: 'Películas dirigidas por el cineasta David Fincher',
    f: ['El club de la lucha', 'Seven', 'La red social', 'Perdida'],
    m: ['Zodiac', 'El curioso caso de Benjamin Button', 'Mank'],
    d: ['The Game', 'La habitación del pánico', 'Alien 3'],
    t: ['Infiltrados', 'Shutter Island', 'Memento', 'Drive', 'Prisioneros']
  },
  {
    c: 'Películas dirigidas por el cineasta Guillermo del Toro',
    f: ['El laberinto del fauno', 'La forma del agua', 'Hellboy', 'Pacific Rim'],
    m: ['El espinazo del diablo', 'El callejón de las almas perdidas', 'Pinocho de Guillermo del Toro'],
    d: ['Cronos', 'Mimic', 'La cumbre escarlata'],
    t: ['El orfanato', 'Los ojos de Julia', 'El silencio de los corderos', 'La novia cadáver', 'Sleepy Hollow']
  },
  {
    c: 'Películas dirigidas por el cineasta Tim Burton',
    f: ['Eduardo Manostijeras', 'Bitelchús', 'Batman (1989)', 'Sleepy Hollow'],
    m: ['Charlie y la fábrica de chocolate', 'Sweeney Todd', 'Big Fish'],
    d: ['Ed Wood', 'Mars Attacks!', 'Frankenweenie'],
    t: ['Coraline', 'La muerte os sienta tan bien', 'La familia Addams', 'Casper', 'Una serie de catastróficas desdichas']
  },
  {
    c: 'Películas dirigidas por el cineasta James Cameron',
    f: ['Titanic', 'Avatar', 'Avatar: El sentido del agua', 'Terminator 2: El juicio final'],
    m: ['Aliens: El regreso', 'Terminator (1984)', 'Mentiras arriesgadas'],
    d: ['Abyss', 'Piraña II: Los vampiros del mar', 'Solaris'],
    t: ['Parque Jurásico', 'Matrix', 'Gladiator', 'Alien, el octavo pasajero', 'Waterworld']
  },
  {
    c: 'Películas dirigidas por el cineasta Ridley Scott',
    f: ['Gladiator', 'Alien, el octavo pasajero', 'Blade Runner', 'Marte (The Martian)'],
    m: ['Black Hawk derribado', 'Thelma & Louise', 'American Gangster'],
    d: ['El reino de los cielos', 'El último duelo', 'Los duelistas'],
    t: ['Salvar al soldado Ryan', 'Braveheart', 'Dune', 'Terminator 2', 'Babel']
  },
  {
    c: 'Películas dirigidas por el cineasta Pedro Almodóvar',
    f: ['Todo sobre mi madre', 'Volver', 'Hable con ella', 'Mujeres al borde de un ataque de nervios'],
    m: ['La piel que habito', 'Dolor y gloria', 'Madres paralelas'],
    d: ['Átame', 'Tacones lejanos', 'La ley del deseo'],
    t: ['Mar adentro', 'Tesis', 'Los otros', 'El laberinto del fauno', 'La isla mínima']
  },
  {
    c: 'Producciones que han superado los 2.000 millones de dólares en taquilla',
    f: ['Avatar', 'Vengadores: Endgame', 'Avatar: El sentido del agua', 'Titanic'],
    m: ['Star Wars: El despertar de la Fuerza', 'Vengadores: Infinity War', 'Spider-Man: No Way Home'],
    d: ['Jurassic World', 'El Rey León (2019)', 'Los Vengadores (2012)'],
    t: ['Top Gun: Maverick', 'Barbie', 'Oppenheimer', 'Joker', 'Frozen']
  },

  // 31 - 40: Grandes Actores y Actrices de Hollywood
  {
    c: 'Películas protagonizadas por Leonardo DiCaprio',
    f: ['Titanic', 'Origen', 'El lobo de Wall Street', 'El renacido'],
    m: ['Shutter Island', 'Infiltrados', 'Atrápame si puedes'],
    d: ['Django Desencadenado', 'Érase una vez en Hollywood', 'Gangs of New York'],
    t: ['Interstellar', 'El club de la lucha', 'American Psycho', 'Drive', 'Brokeback Mountain']
  },
  {
    c: 'Películas protagonizadas por Brad Pitt',
    f: ['El club de la lucha', 'Malditos Bastardos', 'Seven', 'Troya'],
    m: ['Érase una vez en Hollywood', 'Guerra Mundial Z', 'Ocean\'s Eleven'],
    d: ['El curioso caso de Benjamin Button', 'Moneyball', 'Ad Astra'],
    t: ['Origen', 'El lobo de Wall Street', 'Gladiator', 'American Psycho', 'Matrix']
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
    f: ['Matrix', 'John Wick', 'Speed', 'Constantine'],
    m: ['Le llaman Bodhi', 'Pactar con el diablo', 'Matrix Reloaded'],
    d: ['Drácula de Bram Stoker', 'My Own Private Idaho', 'A Scanner Darkly'],
    t: ['Misión Imposible', 'Origen', 'El club de la lucha', 'Blade Runner 2049', 'Seven']
  },
  {
    c: 'Películas protagonizadas por Christian Bale',
    f: ['El Caballero Oscuro', 'American Psycho', 'El maquinista', 'El truco final'],
    m: ['Batman Begins', 'The Fighter', 'Le Mans \'66'],
    d: ['El imperio del sol', 'La gran apuesta', 'Vice'],
    t: ['Oppenheimer', 'Shutter Island', 'Infiltrados', 'El club de la lucha', 'Memento']
  },
  {
    c: 'Películas protagonizadas por Scarlett Johansson',
    f: ['Los Vengadores', 'Historia de un matrimonio', 'Lost in Translation', 'Lucy'],
    m: ['Jojo Rabbit', 'Her', 'El truco final'],
    d: ['Bajo la piel', 'Match Point', 'La joven de la perla'],
    t: ['El diario de Noa', 'La La Land', 'Barbie', 'El cisne negro', 'Los juegos del hambre']
  },
  {
    c: 'Películas protagonizadas por Emma Stone',
    f: ['La La Land', 'Pobres criaturas', 'The Amazing Spider-Man', 'Criadas y señoras'],
    m: ['Cruella', 'Rumores y mentiras', 'La favorita'],
    d: ['Birdman', 'Zombieland', 'Crazy, Stupid, Love'],
    t: ['El diario de Noa', 'Los juegos del hambre', 'Barbie', 'El cisne negro', 'Historias de Filadelfia']
  },
  {
    c: 'Películas protagonizadas por Denzel Washington',
    f: ['Training Day', 'The Equalizer', 'Gladiator II', 'American Gangster'],
    m: ['El vuelo', 'Fences', 'El fuego de la venganza'],
    d: ['Malcolm X', 'Huracán Carter', 'Tiempos de gloria'],
    t: ['Cadena perpetua', 'Pulp Fiction', 'Salvar al soldado Ryan', 'Infiltrados', 'Seven']
  },

  // 41 - 50: Cine Bélico, Wéstern y Thrillers Psicológicos
  {
    c: 'Películas bélicas consideradas clásicos del cine contemporáneo',
    f: ['Salvar al soldado Ryan', 'Apocalypse Now', 'La chaqueta metálica', '1917'],
    m: ['Platoon', 'La delgada línea roja', 'Dunkerque'],
    d: ['Senderos de gloria', 'Sin novedad en el frente', 'Cartas desde Iwo Jima'],
    t: ['Gladiator', 'Braveheart', 'Troya', '300', 'El reino de los cielos']
  },
  {
    c: 'Películas destacadas pertenecientes al género wéstern',
    f: ['El bueno, el feo y el malo', 'Django Desencadenado', 'Sin perdón', 'Por un puñado de dólares'],
    m: ['Hasta que llegó su hora', 'La muerte tenía un precio', 'Valor de ley'],
    d: ['Centauros del desierto', 'Solo ante el peligro', 'Los odiosos ocho'],
    t: ['El Padrino', 'Scarface', 'Uno de los nuestros', 'Taxi Driver', 'Toro Salvaje']
  },
  {
    c: 'Thrillers psicológicos caracterizados por sus giros argumentales',
    f: ['El sexto sentido', 'Shutter Island', 'Seven', 'El silencio de los corderos'],
    m: ['Los otros', 'Memento', 'Perdida'],
    d: ['Prisioneros', 'Oldboy', 'Sospechosos habituales'],
    t: ['A todo gas', 'La jungla de cristal', 'Armageddon', 'Transformers', 'Fast & Furious 5']
  },
  {
    c: 'Dramas cinematográficos centrados en juicios y el sistema legal',
    f: ['12 hombres sin piedad', 'Matar a un ruiseñor', 'Philadelphia', 'Algunos hombres buenos'],
    m: ['El abogado del diablo', 'Las dos caras de la verdad', 'Cuestión de justicia'],
    d: ['Veredicto final', 'En el nombre del padre', 'Anatomía de un asesinato'],
    t: ['Uno de los nuestros', 'Pulp Fiction', 'El lobo de Wall Street', 'Cadena perpetua', 'Infiltrados']
  },
  {
    c: 'Películas de ciencia ficción ambientadas en misiones en el espacio exterior',
    f: ['Interstellar', 'Marte', 'Gravity', '2001: Una odisea del espacio'],
    m: ['Apolo 13', 'First Man', 'Armageddon'],
    d: ['Contact', 'Moon', 'Ad Astra'],
    t: ['Origen', 'Matrix', 'Tenet', 'Parque Jurásico', 'Avatar: El sentido del agua']
  },
  {
    c: 'Películas centradas en la mafia y el crimen organizado italiano en EE.UU.',
    f: ['El Padrino', 'Uno de los nuestros', 'Casino', 'El irlandés'],
    m: ['Una historia del Bronx', 'Donnie Brasco', 'Infiltrados'],
    d: ['Camino a la perdición', 'Los intocables de Eliot Ness', 'Muerte entre las flores'],
    t: ['Pulp Fiction', 'Reservoir Dogs', 'El club de la lucha', 'American Psycho', 'Seven']
  },
  {
    c: 'Producciones históricas ambientadas en la Antigua Roma',
    f: ['Gladiator', 'Ben-Hur', 'Espartaco', 'Gladiator II'],
    m: ['La caída del imperio romano', 'Quo Vadis', 'La pasión de Cristo'],
    d: ['Julio César', 'Centurión', 'La legión del águila'],
    t: ['Troya', '300', 'Alejandro Magno', 'Braveheart', 'El reino de los cielos']
  },
  {
    c: 'Películas del subgénero de atracos, golpes y robos planificados (Heist)',
    f: ['Ocean\'s Eleven', 'Heat', 'The Italian Job', 'Atraco perfecto'],
    m: ['Baby Driver', 'Tarde de perros', 'The Town'],
    d: ['Plan oculto', 'Reservoir Dogs', 'Rififí'],
    t: ['El Padrino', 'Scarface', 'Seven', 'Taxi Driver', 'Zodiac']
  },
  {
    c: 'Largometrajes de ciencia ficción de ambientación distópica',
    f: ['Matrix', 'Blade Runner', 'Los juegos del hambre', 'Mad Max: Furia en la carretera'],
    m: ['Hijos de los hombres', 'Minority Report', 'Fahrenheit 451'],
    d: ['Gattaca', '1984', 'Akira'],
    t: ['Regreso al futuro', 'E.T., el extraterrestre', 'Parque Jurásico', 'Avatar', 'Interstellar']
  },
  {
    c: 'Películas de cine de catástrofes naturales y fenómenos planetarios',
    f: ['El día de mañana', '2012', 'Armageddon', 'Deep Impact'],
    m: ['San Andrés', 'Twister', 'Geostorm'],
    d: ['La tormenta perfecta', 'El coloso en llamas', 'Poseidón'],
    t: ['Marte', 'Gravity', 'Apolo 13', 'Interstellar', 'La llegada']
  },

  // 51 - 60: Cine Europeo, Asiático y Grandes Festivales
  {
    c: 'Películas que han obtenido la Palma de Oro en el Festival de Cannes',
    f: ['Parásitos', 'Pulp Fiction', 'Taxi Driver', 'Apocalypse Now'],
    m: ['El pianista', 'Amour', 'El árbol de la vida'],
    d: ['Anatomía de una caída', 'El triángulo de la tristeza', 'Bailar en la oscuridad'],
    t: ['El Padrino', 'Titanic', 'Gladiator', 'La lista de Schindler', 'Forrest Gump']
  },
  {
    c: 'Producciones cinematográficas surcoreanas con impacto internacional',
    f: ['Parásitos', 'Oldboy', 'Tren a Busan', 'La doncella'],
    m: ['Memories of Murder', 'Encontré al diablo', 'Decision to Leave'],
    d: ['Burning', 'Mother', 'Primavera, verano, otoño, invierno... y primavera'],
    t: ['El viaje de Chihiro', 'Your Name', 'Akira', 'Ip Man', 'Ghost in the Shell']
  },
  {
    c: 'Películas japonesas de imagen real consagradas en la historia del cine',
    f: ['Los siete samuráis', 'Rashomon', 'Godzilla (1954)', 'Yojimbo'],
    m: ['Ran', 'Trono de sangre', 'Drive My Car'],
    d: ['Cuentos de Tokio', 'Ikiru', 'Harakiri'],
    t: ['Oldboy', 'Parásitos', 'Tigre y dragón', 'Ip Man', 'Memories of Murder']
  },
  {
    c: 'Largometrajes del cine italiano considerados obras maestras',
    f: ['La vida es bella', 'Cinema Paradiso', 'La gran belleza', 'El ladrón de bicicletas'],
    m: ['La dolce vita', 'Ocho y medio (8½)', 'El bueno, el feo y el malo'],
    d: ['Roma, ciudad abierta', 'El gatopardo', 'Rocco y sus hermanos'],
    t: ['Amélie', 'Todo sobre mi madre', 'El laberinto del fauno', 'La haine', 'Intocable']
  },
  {
    c: 'Películas del cine francés contemporáneo con amplia repercusión global',
    f: ['Amélie', 'Intocable', 'El odio (La haine)', 'Anatomía de una caída'],
    m: ['La vida de Adèle', 'Los coristas', 'Retrato de una mujer en llamas'],
    d: ['El profesional (Léon)', 'La vie en rose', 'De óxido y hueso'],
    t: ['La vida es bella', 'Cinema Paradiso', 'Todo sobre mi madre', 'La gran belleza', 'El laberinto del fauno']
  },
  {
    c: 'Producciones argentinas reconocidas en festivales y premios internacionales',
    f: ['El secreto de sus ojos', 'Relatos salvajes', 'Nueve reinas', 'Argentina, 1985'],
    m: ['La historia oficial', 'El hijo de la novia', 'El clan'],
    d: ['Esperando la carroza', 'Carancho', 'Un cuento chino'],
    t: ['Amores perros', 'Y tu mamá también', 'Roma', 'El laberinto del fauno', 'Machuca']
  },
  {
    c: 'Películas dirigidas por directores mexicanos galardonadas con el Oscar',
    f: ['El laberinto del fauno', 'Roma', 'Birdman', 'La forma del agua'],
    m: ['Amores perros', 'Hijos de los hombres', 'Gravity'],
    d: ['Y tu mamá también', 'El renacido', 'Babel'],
    t: ['Relatos salvajes', 'El secreto de sus ojos', 'Nueve reinas', 'Argentina, 1985', 'Machuca']
  },
  {
    c: 'Actores que han participado en adaptaciones tanto de Marvel como de DC',
    f: ['Christian Bale', 'Ryan Reynolds', 'Michael Keaton', 'Ben Affleck'],
    m: ['Willem Dafoe', 'Idris Elba', 'Colin Farrell'],
    d: ['Hugo Weaving', 'J.K. Simmons', 'Djimon Hounsou'],
    t: ['Robert Downey Jr.', 'Hugh Jackman', 'Henry Cavill', 'Tobey Maguire', 'Cillian Murphy']
  },
  {
    c: 'Películas contemporáneas (posteriores a 1990) rodadas íntegramente en blanco y negro',
    f: ['La lista de Schindler', 'Roma (Alfonso Cuarón)', 'The Artist', 'El faro'],
    m: ['Ed Wood', 'Mank', 'Ida'],
    d: ['Cold War', 'Nebraska', 'Control'],
    t: ['Pulp Fiction', 'Salvar al soldado Ryan', 'Seven', 'Titanic', 'Gladiator']
  },
  {
    c: 'Películas centradas en el mundo del boxeo con reconocimiento de la Academia',
    f: ['Rocky', 'Million Dollar Baby', 'Toro Salvaje', 'The Fighter'],
    m: ['Creed', 'Ali', 'Cinderella Man'],
    d: ['Huracán Carter', 'Marcado por el odio', 'Fat City'],
    t: ['Karate Kid', 'Gladiator', 'Troya', 'Warrior', 'Sin perdón']
  },

  // 61 - 70: Comedia, Musicales y Romance
  {
    c: 'Producciones del género musical galardonadas con el premio Oscar',
    f: ['La La Land', 'West Side Story (1961)', 'Sonrisas y lágrimas', 'Chicago'],
    m: ['Oliver!', 'My Fair Lady', 'Cabaret'],
    d: ['Un americano en París', 'Gigi', 'All That Jazz'],
    t: ['El gran showman', 'Grease', 'Moulin Rouge!', 'Mamma Mia!', 'Bohemian Rhapsody']
  },
  {
    c: 'Comedias románticas de gran éxito en las décadas de los 80 y 90',
    f: ['Pretty Woman', 'Notting Hill', 'Cuando Harry encontró a Sally', 'Cuatro bodas y un funeral'],
    m: ['Algo para recordar', 'Tienes un e-mail', 'La boda de mi mejor amigo'],
    d: ['Jerry Maguire', 'Hechizo de luna', '10 razones para odiarte'],
    t: ['El diario de Noa', 'Titanic', 'Ghost', 'La La Land', 'Brokeback Mountain']
  },
  {
    c: 'Títulos icónicos del cine de comedia paródica y disparatada',
    f: ['Aterriza como puedas', 'Scary Movie', 'La vida de Brian', 'Dos tontos muy tontos'],
    m: ['Agárralo como puedas', 'Los caballeros de la mesa cuadrada', 'Resacón en Las Vegas'],
    d: ['Top Secret!', 'El jovencito Frankenstein', 'Zoolander'],
    t: ['Pulp Fiction', 'El gran Lebowski', 'El lobo de Wall Street', 'Atrápame si puedes', 'Todo a la vez en todas partes']
  },
  {
    c: 'Películas clásicas ambientadas en la temporada navideña',
    f: ['Solo en casa', '¡Qué bello es vivir!', 'El Grinch', 'Pesadilla antes de Navidad'],
    m: ['Elf', 'Love Actually', 'The Polar Express'],
    d: ['Klaus', 'Milagro en la calle 34', 'Vaya Santa Claus'],
    t: ['La jungla de cristal', 'Gremlins', 'Eyes Wide Shut', 'Batman vuelve', 'Arma letal']
  },
  {
    c: 'Largometrajes de comedia protagonizados por el actor Jim Carrey',
    f: ['La máscara', 'El show de Truman', 'Dos tontos muy tontos', 'Mentiroso compulsivo'],
    m: ['Ace Ventura', 'El Grinch', 'Como Dios'],
    d: ['¡Olvídate de mí!', 'Man on the Moon', 'Di que sí'],
    t: ['Austin Powers', 'Zoolander', 'Los padres de ella', 'Scary Movie', 'Tropic Thunder']
  },
  {
    c: 'Películas destacadas del cine de espías y agentes secretos',
    f: ['El caso Bourne', 'Kingsman: Servicio secreto', 'Misión Imposible', 'Múnich'],
    m: ['El ultimátum de Bourne', 'Spy Game', 'El topo'],
    d: ['El puente de los espías', 'Gorrión rojo', 'Ronin'],
    t: ['John Wick', 'Speed', 'La jungla de cristal', 'Heat', 'Infiltrados']
  },
  {
    c: 'Películas cuya trama principal transcurre en alta mar, barcos o naufragios',
    f: ['Titanic', 'Náufrago', 'La vida de Pi', 'Piratas del Caribe'],
    m: ['Master and Commander', 'La tormenta perfecta', 'Poseidón'],
    d: ['El motín del Caine', 'La aventura del Poseidón', 'Capitán Phillips'],
    t: ['Tiburón', 'Abyss', 'Waterworld', 'Buscando a Nemo', 'Salvar al soldado Ryan']
  },
  {
    c: 'Películas consagradas del subgénero de zombis y muertos vivientes',
    f: ['Guerra Mundial Z', '28 días después', 'Soy leyenda', 'Zombies Party'],
    m: ['Tren a Busan', 'El amanecer de los muertos (2004)', 'Bienvenidos a Zombieland'],
    d: ['La noche de los muertos vivientes (1968)', 'REC', '28 semanas después'],
    t: ['El exorcista', 'El resplandor', 'Psicosis', 'Insidious', 'Expediente Warren']
  },
  {
    c: 'Producciones de animación realizadas mediante la técnica de stop-motion',
    f: ['Pesadilla antes de Navidad', 'La novia cadáver', 'Coraline', 'Chicken Run'],
    m: ['Fantástico Sr. Fox', 'Pinocho de Guillermo del Toro', 'Isla de perros'],
    d: ['Kubo y las dos cuerdas mágicas', 'Frankenweenie', 'Wallace & Gromit: La maldición de las verduras'],
    t: ['Toy Story', 'Buscando a Nemo', 'Shrek', 'El viaje de Chihiro', 'Ice Age']
  },
  {
    c: 'Películas de robos y tramas de apuestas desarrolladas en Las Vegas',
    f: ['Ocean\'s Eleven', 'Casino', 'Ocean\'s Twelve', 'Ocean\'s Thirteen'],
    m: ['Resacón en Las Vegas', '21 Blackjack', 'Croupier'],
    d: ['Hard Eight', 'Golpe en Las Vegas', 'Leaving Las Vegas'],
    t: ['Pulp Fiction', 'Heat', 'Atraco perfecto', 'Reservoir Dogs', 'Infiltrados']
  },

  // 71 - 80: Biopics, Drama Carcelario e Historia Real
  {
    c: 'Dramas cinematográficos ambientados en prisiones y fugas',
    f: ['Cadena perpetua', 'La milla verde', 'Fuga de Alcatraz', 'Celda 211'],
    m: ['Papillón', 'La gran evasión', 'En el nombre del padre'],
    d: ['Un profeta', 'El conde de Montecristo', 'Bronson'],
    t: ['El lobo de Wall Street', 'Uno de los nuestros', 'Taxi Driver', 'Scarface', 'Infiltrados']
  },
  {
    c: 'Biopics musicales centrados en la trayectoria de iconos del pop o del rock',
    f: ['Bohemian Rhapsody', 'Rocketman', 'Elvis', 'En la cuerda floja'],
    m: ['Straight Outta Compton', 'Ray', 'Bob Marley: One Love'],
    d: ['Control', 'Love & Mercy', 'Nowhere Boy'],
    t: ['La La Land', 'Ha nacido una estrella', 'Casi famosos', 'Whiplash', 'School of Rock']
  },
  {
    c: 'Producciones históricas sobre monarcas y reinos de Europa',
    f: ['El discurso del rey', 'La reina', 'Maria Antonieta', 'Braveheart'],
    m: ['La favorita', 'Las hermanas Bolena', 'Elizabeth'],
    d: ['La locura del rey Jorge', 'El león en invierno', 'El rey (2019)'],
    t: ['Gladiator', 'Troya', 'El reino de los cielos', '300', 'Alejandro Magno']
  },
  {
    c: 'Dramas de investigación periodística basados en casos reales',
    f: ['Todos los hombres del presidente', 'Spotlight', 'Los archivos del Pentágono', 'Zodiac'],
    m: ['Buenas noches, y buena suerte', 'El dilema', 'Frost/Nixon'],
    d: ['Luna nueva', 'Network', 'El reportero'],
    t: ['Cadena perpetua', 'Infiltrados', 'El lobo de Wall Street', 'Seven', 'El club de la lucha']
  },
  {
    c: 'Películas de aventuras con búsquedas arqueológicas y tesoros históricos',
    f: ['En busca del arca perdida', 'La momia (1999)', 'La búsqueda', 'Tomb Raider'],
    m: ['Indiana Jones y la última cruzada', 'Indiana Jones y el templo maldito', 'Uncharted'],
    d: ['El secreto de la pirámide', 'Las minas del rey Salomón', 'Tintín: El secreto del unicornio'],
    t: ['Parque Jurásico', 'Piratas del Caribe', 'El Señor de los Anillos', 'Gladiator', 'Troya']
  },
  {
    c: 'Biopics sobre figuras clave de la ciencia basados en hechos reales',
    f: ['Oppenheimer', 'Una mente maravillosa', 'La teoría del todo', 'The Imitation Game'],
    m: ['Madame Curie', 'El hombre que conocía el infinito', 'Figuras ocultas'],
    d: ['Radioactive', 'La guerra de las corrientes', 'Creation'],
    t: ['Origen', 'Interstellar', 'Regreso al futuro', 'Matrix', 'Frankenstein']
  },
  {
    c: 'Películas galardonadas con el premio Oscar a los Mejores Efectos Visuales',
    f: ['Avatar', 'Avatar: El sentido del agua', 'Interstellar', 'Matrix'],
    m: ['Origen', 'Dune (2021)', 'El Señor de los Anillos: Las Dos Torres'],
    d: ['La invención de Hugo', '1917', 'Godzilla Minus One'],
    t: ['Oppenheimer', 'Parásitos', 'La La Land', 'Braveheart', 'Green Book']
  },
  {
    c: 'Películas galardonadas con el premio Oscar a la Mejor Banda Sonora',
    f: ['La vida es bella', 'Star Wars: Una nueva esperanza', 'Tiburón', 'El Señor de los Anillos: La Comunidad del Anillo'],
    m: ['La La Land', 'Oppenheimer', 'Gladiator'],
    d: ['La lista de Schindler', 'El rey león (1994)', 'Memorias de África'],
    t: ['Avatar', 'Interstellar', 'Pulp Fiction', 'El Padrino', 'Origen']
  },
  {
    c: 'Compositores de bandas sonoras galardonados con la estatuilla del Oscar',
    f: ['John Williams', 'Hans Zimmer', 'Ennio Morricone', 'Howard Shore'],
    m: ['Alexandre Desplat', 'Ludwig Göransson', 'Michael Giacchino'],
    d: ['Bernard Herrmann', 'Max Steiner', 'Nino Rota'],
    t: ['Danny Elfman', 'Thomas Newman', 'Harry Gregson-Williams', 'John Powell', 'Clint Mansell']
  },
  {
    c: 'Películas bélicas cuya acción se ambienta en la Primera Guerra Mundial',
    f: ['1917', 'Senderos de gloria', 'Sin novedad en el frente (2022)', 'War Horse'],
    m: ['La gran ilusión', 'Gallipoli', 'Sargento York'],
    d: ['Feliz Navidad', 'Paschendaele', 'El barón rojo'],
    t: ['Salvar al soldado Ryan', 'La lista de Schindler', 'Dunkerque', 'Apocalypse Now', 'Platoon']
  },

  // 81 - 90: Sagas, Franquicias y Acción de Élite
  {
    c: 'Películas que componen la franquicia de dinosaurios Jurassic Park y Jurassic World',
    f: ['Parque Jurásico (1993)', 'El mundo perdido: Jurassic Park', 'Jurassic Park III', 'Jurassic World (2015)'],
    m: ['Jurassic World: El reino caído', 'Jurassic World: Dominion', 'Battle at Big Rock'],
    d: ['Jurassic Park: The Ride', 'Campamento Cretácico', 'Jurassic City'],
    t: ['Godzilla', 'King Kong', 'Viaje al centro de la Tierra', 'En busca del valle encantado', 'Megalodón']
  },
  {
    c: 'Películas de la saga Alien protagonizadas por el xenomorfo',
    f: ['Alien, el octavo pasajero', 'Aliens: El regreso', 'Alien 3', 'Alien: Resurrección'],
    m: ['Prometheus', 'Alien: Covenant', 'Alien: Romulus'],
    d: ['Alien vs. Predator', 'Alien vs. Predator 2', 'Alien: Out of the Shadows'],
    t: ['Depredador', 'Blade Runner', 'Terminator 2', 'La cosa', 'Species']
  },
  {
    c: 'Películas de la saga Terminator protagonizadas por Arnold Schwarzenegger',
    f: ['Terminator (1984)', 'Terminator 2: El juicio final', 'Terminator 3: La rebelión de las máquinas', 'Terminator: Destino oscuro'],
    m: ['Terminator Génesis', 'Terminator Salvation', 'T2 3-D: Battle Across Time'],
    d: ['Terminator Zero', 'Terminator: The Sarah Connor Chronicles', 'Terminator Dawn of Fate'],
    t: ['RoboCop', 'Depredador', 'Desafío total', 'Comando', 'Mentiras arriesgadas']
  },
  {
    c: 'Capítulos cinematográficos de la franquicia de acción John Wick',
    f: ['John Wick (2014)', 'John Wick: Pacto de sangre', 'John Wick: Parabellum', 'John Wick 4'],
    m: ['The Continental', 'Ballerina', 'John Wick: Capítulo 5'],
    d: ['John Wick Chronicles', 'John Wick Hex', 'Nobody'],
    t: ['Matrix', 'Constantine', 'Speed', 'Pactar con el diablo', 'Le llaman Bodhi']
  },
  {
    c: 'Largometrajes centrados en los mutantes de la franquicia X-Men',
    f: ['X-Men (2000)', 'X-Men 2', 'X-Men: Días del futuro pasado', 'Logan'],
    m: ['X-Men: Primera generación', 'Deadpool', 'Deadpool & Wolverine'],
    d: ['X-Men: Apocalipsis', 'X-Men: Fénix Oscura', 'Los Nuevos Mutantes'],
    t: ['Los Vengadores', 'The Batman', 'Aquaman', 'El hombre de acero', 'Doctor Strange']
  },
  {
    c: 'Clásicos y referentes del cine de artes marciales y kung-fu',
    f: ['Operación Dragón', 'Tigre y dragón', 'Kill Bill: Vol. 1', 'Ip Man'],
    m: ['Furia oriental', 'El furor del dragón', 'Ong-Bak'],
    d: ['El maestro borracho', 'Hero', 'La casa de las dagas voladoras'],
    t: ['Karate Kid', 'Mortal Kombat', 'Cobra Kai', 'Gladiator', '300']
  },
  {
    c: 'Películas que adaptan novelas y relatos del escritor Stephen King',
    f: ['El resplandor', 'Cadena perpetua', 'It', 'La milla verde'],
    m: ['Carrie', 'Misery', 'Cuenta conmigo'],
    d: ['Cementerio de animales', 'La niebla', 'Doctor Sueño'],
    t: ['El exorcista', 'Psicosis', 'La profecía', 'La noche de Halloween', 'Viernes 13']
  },
  {
    c: 'Largometrajes del cine español dirigidos por Álex de la Iglesia',
    f: ['El día de la bestia', 'La comunidad', 'Las brujas de Zugarramurdi', 'Balada triste de trompeta'],
    m: ['Acción mutante', 'El bar', 'Perfectos desconocidos'],
    d: ['Crimen ferpecto', 'Muertos de risa', 'Perdita Durango'],
    t: ['Torrente', 'Ocho apellidos vascos', 'Tesis', 'Airbag', 'El milagro de P. Tinto']
  },
  {
    c: 'Largometrajes del cine español dirigidos por Alejandro Amenábar',
    f: ['Tesis', 'Abre los ojos', 'Los otros', 'Mar adentro'],
    m: ['Ágora', 'Mientras dure la guerra', 'Regresión'],
    d: ['Himenóptero', 'Luna', 'La fortuna'],
    t: ['El laberinto del fauno', 'La isla mínima', 'Celda 211', 'El orfanato', 'Dolor y gloria']
  },
  {
    c: 'Películas premiadas con el Oscar a la Mejor Película Internacional',
    f: ['Parásitos', 'La vida es bella', 'Cinema Paradiso', 'Mar adentro'],
    m: ['Todo sobre mi madre', 'Amour', 'La gran belleza'],
    d: ['El secreto de sus ojos', 'Otra ronda', 'La zona de interés'],
    t: ['El laberinto del fauno', 'Amélie', 'Relatos salvajes', 'La sociedad de la nieve', 'Ciudad de Dios']
  },

  // 91 - 100: Festivales, Animación y Cine de Culto
  {
    c: 'Películas de Batman pertenecientes a las etapas de Tim Burton o Christopher Nolan',
    f: ['Batman (1989)', 'Batman vuelve', 'Batman Begins', 'El Caballero Oscuro'],
    m: ['El Caballero Oscuro: La leyenda renace', 'Batman del futuro', 'Batman: La máscara del fantasma'],
    d: ['Gotham Knight', 'Batman: Año Uno', 'Batman: El regreso del Caballero Oscuro'],
    t: ['Batman Forever', 'Batman & Robin', 'The Batman', 'Batman v Superman', 'Joker']
  },
  {
    c: 'Películas de ciencia ficción que adaptan relatos o novelas de Philip K. Dick',
    f: ['Blade Runner', 'Minority Report', 'Desafío total', 'Paycheck'],
    m: ['A Scanner Darkly', 'Destino oculto', 'Infiltrado'],
    d: ['Next', 'Asesinos cibernéticos', 'Radio Free Albemuth'],
    t: ['Matrix', 'Terminator', 'Yo, robot', 'Origen', 'El show de Truman']
  },
  {
    c: 'Películas destacadas con interpretaciones de Anthony Hopkins',
    f: ['El silencio de los corderos', 'Thor', 'El padre', 'Hannibal'],
    m: ['Lo que queda del día', 'Drácula de Bram Stoker', 'Leyendas de pasión'],
    d: ['¿Conoces a Joe Black?', 'Nixon', 'Amistad'],
    t: ['El Padrino', 'Seven', 'El gran Lebowski', 'Shutter Island', 'Cadena perpetua']
  },
  {
    c: 'Largometrajes de animación dirigidos por el maestro Hayao Miyazaki',
    f: ['El viaje de Chihiro', 'Mi vecino Totoro', 'La princesa Mononoke', 'El castillo ambulante'],
    m: ['Ponyo en el acantilado', 'El viento se levanta', 'El chico y la garza'],
    d: ['Nausicaä del Valle del Viento', 'Porco Rosso', 'El castillo de Cagliostro'],
    t: ['Your Name', 'La tumba de las luciérnagas', 'Akira', 'Ghost in the Shell', 'A Silent Voice']
  },
  {
    c: 'Películas del cine español ambientadas en la Guerra Civil o la posguerra',
    f: ['La lengua de las mariposas', 'El laberinto del fauno', 'Mientras dure la guerra', 'La vaquilla'],
    m: ['Las bicicletas son para el verano', '¡Ay, Carmela!', 'Tierra y libertad'],
    d: ['La trinchera infinita', 'El espinazo del diablo', 'Los girasoles ciegos'],
    t: ['Gladiator', 'Mar adentro', 'Celda 211', 'Tesis', 'Ocho apellidos vascos']
  },
  {
    c: 'Películas independientes distinguidas en el Festival de Cine de Sundance',
    f: ['Whiplash', 'Precious', 'Bestias del sur salvaje', 'Fruitvale Station'],
    m: ['Pequeña Miss Sunshine', 'Primer', 'Minari'],
    d: ['Winter\'s Bone', 'Yo, él y Raquel', 'CODA'],
    t: ['Pulp Fiction', 'Parásitos', 'Titanic', 'Avatar', 'Origen']
  },
  {
    c: 'Películas destacadas en la filmografía del actor Morgan Freeman',
    f: ['Cadena perpetua', 'Seven', 'Million Dollar Baby', 'El Caballero Oscuro'],
    m: ['Invictus', 'Paseando a Miss Daisy', 'Como Dios'],
    d: ['Sin perdón', 'Tiempos de gloria', 'Ahora o nunca'],
    t: ['Forrest Gump', 'Pulp Fiction', 'El Padrino', 'Gladiator', 'Infiltrados']
  },
  {
    c: 'Películas de acción policíaca bajo la fórmula de parejas detectivescas (Buddy Cop)',
    f: ['Arma letal', 'Dos policías rebeldes', 'Hora punta', 'Men in Black'],
    m: ['Arma fatal', 'Límite: 48 horas', 'Infiltrados en clase'],
    d: ['Tango y Cash', 'Dos sabuesos despistados', 'Dos buenos tipos'],
    t: ['La jungla de cristal', 'John Wick', 'Speed', 'Misión Imposible', 'El fugitivo']
  },
  {
    c: 'Películas que combinaron personajes de animación con intérpretes de imagen real',
    f: ['¿Quién engañó a Roger Rabbit?', 'Space Jam', 'Mary Poppins', 'Space Jam: Nuevas leyendas'],
    m: ['Stuart Little', 'Paddington', 'Sonic: La película'],
    d: ['La bruja novata', 'Una rubia entre dos mundos', 'Looney Tunes: De nuevo en acción'],
    t: ['Toy Story', 'Shrek', 'El rey león', 'Avatar', 'Buscando a Nemo']
  },
  {
    c: 'Clásicos del suspense dirigidos por el maestro Alfred Hitchcock',
    f: ['Psicosis', 'La ventana indiscreta', 'Vértigo', 'Los pájaros'],
    m: ['Con la muerte en los talones', 'Crimen perfecto', 'Extraños en un tren'],
    d: ['Rebeca', 'La soga', 'Encadenados'],
    t: ['El resplandor', 'El cabo del miedo', 'Chinatown', 'El exorcista', 'La semilla del diablo']
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