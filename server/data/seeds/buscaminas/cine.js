export default Array.from({ length: 20 }, (_, idx) => {
  const plantillas = [
    {
      c: 'Películas ganadoras del Oscar a Mejor Película',
      f: ['Titanic', 'Gladiator', 'El Señor de los Anillos: El Retorno del Rey', 'Forrest Gump'],
      m: ['Oppenheimer', 'Parásitos', 'Braveheart'],
      d: ['Spotlight', 'Nomadland', 'The Artist'],
      t: ['Avatar', 'Interstellar', 'Pulp Fiction', 'El Caballero Oscuro', 'Inception']
    },
    {
      c: 'Actores que han interpretado a Spider-Man (Peter Parker o Miles)',
      f: ['Tobey Maguire', 'Andrew Garfield', 'Tom Holland', 'Shameik Moore'],
      m: ['Jake Johnson', 'Nicolas Cage', 'Chris Pine'],
      d: ['Yuri Lowenthal', 'Drake Bell', 'Neil Patrick Harris'],
      t: ['Tom Hardy', 'Willem Dafoe', 'Michael B. Jordan', 'Aaron Taylor-Johnson', 'Miles Teller']
    },
    {
      c: 'Películas dirigidas por Christopher Nolan',
      f: ['Origen (Inception)', 'Interstellar', 'Oppenheimer', 'El Caballero Oscuro'],
      m: ['Dunkerque', 'Memento', 'Tenet'],
      d: ['Following', 'Insomnio', 'El Truco Final'],
      t: ['Shutter Island', 'Seven', 'Zodiac', 'El Gran Truco de Houdini', 'Gravity']
    },
    {
      c: 'Personajes pertenecientes a Star Wars (Canon)',
      f: ['Darth Vader', 'Luke Skywalker', 'Yoda', 'Han Solo'],
      m: ['Mace Windu', 'Ahsoka Tano', 'Boba Fett'],
      d: ['Plo Koon', 'Grand Moff Tarkin', 'Bo-Katan Kryze'],
      t: ['Spock', 'Gandalf', 'Paul Atreides', 'Legolas', 'Thanos']
    },
    {
      c: 'Películas de animación producidas por Pixar',
      f: ['Toy Story', 'Buscando a Nemo', 'Monstruos S.A.', 'Coco'],
      m: ['Up', 'Inside Out', 'Los Increíbles'],
      d: ['Soul', 'Brave', 'Luca'],
      t: ['Shrek', 'Ice Age', 'Madagascar', 'Kung Fu Panda', 'Gru, mi villano favorito']
    },
    {
      c: 'Actores que han encarnado a James Bond en cine',
      f: ['Sean Connery', 'Pierce Brosnan', 'Daniel Craig', 'Roger Moore'],
      m: ['Timothy Dalton', 'George Lazenby', 'David Niven'],
      d: ['Barry Nelson', 'Bob Holness', 'Michael Jayston'],
      t: ['Hugh Jackman', 'Clive Owen', 'Tom Hiddleston', 'Henry Cavill', 'Idris Elba']
    },
    {
      c: 'Películas dirigidas por Quentin Tarantino',
      f: ['Pulp Fiction', 'Kill Bill: Vol. 1', 'Malditos Bastardos', 'Django Desencadenado'],
      m: ['Reservoir Dogs', 'Érase una vez en Hollywood', 'Los Odiosos Ocho'],
      d: ['Jackie Brown', 'Death Proof', 'Four Rooms'],
      t: ['El Lobo de Wall Street', 'Snatch', 'Taxi Driver', 'Scarface', 'Casino']
    },
    {
      c: 'Películas pertenecientes al Universo Cinematográfico de Marvel (UCM)',
      f: ['Iron Man', 'Los Vengadores', 'Black Panther', 'Thor: Ragnarok'],
      m: ['Guardianes de la Galaxia', 'Doctor Strange', 'Capitana Marvel'],
      d: ['Eternals', 'Shang-Chi', 'Ant-Man y la Avispa: Quantumania'],
      t: ['Venom', 'Morbius', 'The Batman', 'Logan', 'Deadpool 1']
    },
    {
      c: 'Series originales producidas por HBO',
      f: ['Juego de Tronos', 'Los Soprano', 'The Last of Us', 'Chernobyl'],
      m: ['Succession', 'Euphoria', 'The Wire'],
      d: ['Roma', 'A dos metros bajo tierra', 'Barry'],
      t: ['Breaking Bad', 'Stranger Things', 'Peaky Blinders', 'El juego del calamar', 'The Boys']
    },
    {
      c: 'Actores ganadores del Oscar a Mejor Actor Principal',
      f: ['Leonardo DiCaprio', 'Joaquin Phoenix', 'Cillian Murphy', 'Will Smith'],
      m: ['Anthony Hopkins', 'Matthew McConaughey', 'Rami Malek'],
      d: ['Adrien Brody', 'Casey Affleck', 'Gary Oldman'],
      t: ['Brad Pitt', 'Tom Cruise', 'Johnny Depp', 'Harrison Ford', 'Christian Bale']
    },
    {
      c: 'Películas dirigidas por Steven Spielberg',
      f: ['Parque Jurásico', 'Tiburón', 'E.T., el extraterrestre', 'La lista de Schindler'],
      m: ['Salvar al soldado Ryan', 'Atrápame si puedes', 'Ready Player One'],
      d: ['El puente de los espías', 'Minority Report', 'War Horse'],
      t: ['Avatar', 'Regreso al futuro', 'Alien', 'Blade Runner', 'Interstellar']
    },
    {
      c: 'Personajes principales de la serie Friends',
      f: ['Rachel Green', 'Monica Geller', 'Phoebe Buffay', 'Joey Tribbiani'],
      m: ['Chandler Bing', 'Ross Geller', 'Gunther'],
      d: ['Mike Hannigan', 'Janice Hosenstein', 'Jack Geller'],
      t: ['Ted Mosby', 'Barney Stinson', 'Penny Hofstadter', 'Sheldon Cooper', 'Robin Scherbatsky']
    },
    {
      c: 'Películas de la saga Harry Potter (principales)',
      f: ['La piedra filosofal', 'La cámara secreta', 'El prisionero de Azkaban', 'El cáliz de fuego'],
      m: ['La orden del fénix', 'El misterio del príncipe', 'Las reliquias de la muerte: Parte 1'],
      d: ['Las reliquias de la muerte: Parte 2', 'Los secretos de Dumbledore', 'Animales fantásticos'],
      t: ['Las crónicas de Narnia', 'Percy Jackson', 'La brújula dorada', 'Eragon', 'El laberinto del fauno']
    },
    {
      c: 'Actrices ganadoras del Oscar a Mejor Actriz Principal',
      f: ['Meryl Streep', 'Emma Stone', 'Natalie Portman', 'Cate Blanchett'],
      m: ['Jennifer Lawrence', 'Sandra Bullock', 'Michelle Yeoh'],
      d: ['Jessica Chastain', 'Olivia Colman', 'Brie Larson'],
      t: ['Scarlett Johansson', 'Amy Adams', 'Margot Robbie', 'Helena Bonham Carter', 'Anne Hathaway']
    },
    {
      c: 'Películas de animación de Disney (Clásicos oficiales)',
      f: ['El rey león', 'Aladdín', 'La bella y la bestia', 'Frozen'],
      m: ['Mulan', 'Hércules', 'Tarzán'],
      d: ['Zootrópolis', 'Enredados', 'Vaiana'],
      t: ['Shrek', 'Ice Age', 'Anastasia', 'El príncipe de Egipto', 'El gigante de hierro']
    },
    {
      c: 'Películas dirigidas por Martin Scorsese',
      f: ['Taxi Driver', 'Uno de los nuestros (Goodfellas)', 'El lobo de Wall Street', 'Infiltrados'],
      m: ['Casino', 'Toro Salvaje', 'Shutter Island'],
      d: ['El irlandés', 'Los asesinos de la luna', 'La edad de la inocencia'],
      t: ['El padrino', 'Scarface', 'Pulp Fiction', 'Heat', 'Pena de muerte']
    },
    {
      c: 'Series de comedia emitidas en televisión',
      f: ['The Office', 'Modern Family', 'Brooklyn Nine-Nine', 'Cómo conocí a vuestra madre'],
      m: ['Parks and Recreation', 'The Good Place', 'Scrubs'],
      d: ['Community', 'Arrested Development', 'Schitt\'s Creek'],
      t: ['Breaking Bad', 'Dark', 'Peaky Blinders', 'Fargo', 'Mindhunter']
    },
    {
      c: 'Películas de terror reconocidas mundialmente',
      f: ['El exorcista', 'El resplandor', 'Psicosis', 'Halloween'],
      m: ['Expediente Warren (The Conjuring)', 'Hereditary', 'Insidious'],
      d: ['La bruja', 'Midsommar', 'It Follows'],
      t: ['Se7en', 'El silencio de los corderos', 'El sexto sentido', 'Zodiac', 'El cisne negro']
    },
    {
      c: 'Actores que han ganado el Oscar a Mejor Actor de Reparto',
      f: ['Heath Ledger', 'Brad Pitt', 'Christoph Waltz', 'Javier Bardem'],
      m: ['Robert Downey Jr.', 'Christian Bale', 'J.K. Simmons'],
      d: ['Daniel Kaluuya', 'Mahershala Ali', 'Troy Kotsur'],
      t: ['Tom Cruise', 'Johnny Depp', 'Will Smith', 'Matt Damon', 'Harrison Ford']
    },
    {
      c: 'Películas españolas ganadoras del Goya a Mejor Película',
      f: ['Todo sobre mi madre', 'Mar adentro', 'La isla mínima', 'Campeones'],
      m: ['Tesis', 'Celda 211', 'Dolor y gloria'],
      d: ['As bestas', 'La sociedad de la nieve', 'El bola'],
      t: ['Ocho apellidos vascos', 'Torrente', 'El día de la bestia', 'Lo imposible', 'Relatos salvajes']
    }
  ];

  const p = plantillas[idx];
  return {
    id: `cine_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});