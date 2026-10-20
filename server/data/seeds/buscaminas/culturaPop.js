// server/data/seeds/buscaminas/culturaPop.js

const plantillas = [
  // 1 - 10: Cine de Superhéroes y Series de Comedia
  {
    c: 'Actores que han formado parte del elenco de la saga Vengadores (Marvel)',
    f: ['Robert Downey Jr.', 'Chris Evans', 'Chris Hemsworth', 'Scarlett Johansson'],
    m: ['Mark Ruffalo', 'Jeremy Renner', 'Tom Hiddleston'],
    d: ['Paul Rudd', 'Benedict Cumberbatch', 'Chadwick Boseman'],
    t: ['Christian Bale', 'Henry Cavill', 'Ben Affleck', 'Hugh Jackman', 'Ryan Reynolds']
  },
  {
    c: 'Personajes protagonistas de series de comedia estadounidenses',
    f: ['Michael Scott', 'Sheldon Cooper', 'Ross Geller', 'Ted Mosby'],
    m: ['Jake Peralta', 'Phil Dunphy', 'Barney Stinson'],
    d: ['Dwight Schrute', 'Chandler Bing', 'Eleanor Shellstrop'],
    t: ['Walter White', 'Thomas Shelby', 'Tony Soprano', 'Jon Snow', 'Dexter Morgan']
  },
  {
    c: 'Superhéroes pertenecientes a DC Comics',
    f: ['Batman', 'Superman', 'Wonder Woman', 'The Flash'],
    m: ['Aquaman', 'Green Lantern', 'Shazam'],
    d: ['Cyborg', 'Robin', 'Martian Manhunter'],
    t: ['Spider-Man', 'Iron Man', 'Thor', 'Capitán América', 'Hulk']
  },
  {
    c: 'Superhéroes pertenecientes a Marvel Comics',
    f: ['Spider-Man', 'Iron Man', 'Thor', 'Hulk'],
    m: ['Black Widow', 'Wolverine', 'Capitán América'],
    d: ['Daredevil', 'Hawkeye', 'Deadpool'],
    t: ['Batman', 'Superman', 'Wonder Woman', 'The Flash', 'Aquaman']
  },
  {
    c: 'Villanos icónicos del universo de Batman',
    f: ['Joker', 'Pingüino', 'Enigma (The Riddler)', 'Dos Caras'],
    m: ['Bane', 'Espantapájaros', 'Hiedra Venenosa'],
    d: ['Sr. Frío', 'Harley Quinn', 'Ra\'s al Ghul'],
    t: ['Duende Verde', 'Doctor Octopus', 'Venom', 'Loki', 'Thanos']
  },
  {
    c: 'Villanos icónicos del universo de Spider-Man',
    f: ['Duende Verde', 'Doctor Octopus', 'Venom', 'Electro'],
    m: ['Hombre de Arena', 'Misterio', 'Lagarto'],
    d: ['Buitre', 'Kraven el Cazador', 'Rhino'],
    t: ['Joker', 'Bane', 'Loki', 'Magneto', 'Crneo Rojo']
  },
  {
    c: 'Personajes principales de la serie Los Simpson',
    f: ['Homer Simpson', 'Marge Simpson', 'Bart Simpson', 'Lisa Simpson'],
    m: ['Maggie Simpson', 'Ned Flanders', 'Sr. Burns'],
    d: ['Moe Szyslak', 'Krusty el payaso', 'Milhouse Van Houten'],
    t: ['Peter Griffin', 'Stan Smith', 'Bender', 'Eric Cartman', 'Rick Sanchez']
  },
  {
    c: 'Personajes de la serie The Office (versión estadounidense)',
    f: ['Michael Scott', 'Dwight Schrute', 'Jim Halpert', 'Pam Beesly'],
    m: ['Ryan Howard', 'Andy Bernard', 'Angela Martin'],
    d: ['Stanley Hudson', 'Kevin Malone', 'Creed Bratton'],
    t: ['Ron Swanson', 'Leslie Knope', 'Chandler Bing', 'Ted Mosby', 'Jake Peralta']
  },
  {
    c: 'Personajes principales de la serie Friends',
    f: ['Rachel Green', 'Monica Geller', 'Phoebe Buffay', 'Joey Tribbiani'],
    m: ['Chandler Bing', 'Ross Geller', 'Gunther'],
    d: ['Mike Hannigan', 'Janice Hosenstein', 'Jack Geller'],
    t: ['Ted Mosby', 'Barney Stinson', 'Penny Hofstadter', 'Sheldon Cooper', 'Robin Scherbatsky']
  },
  {
    c: 'Personajes principales de Cómo conocí a vuestra madre (HIMYM)',
    f: ['Ted Mosby', 'Barney Stinson', 'Robin Scherbatsky', 'Marshall Eriksen'],
    m: ['Lily Aldrin', 'Tracy McConnell', 'Ranjit'],
    d: ['Victoria', 'Stella Zinman', 'Zoey Pierson'],
    t: ['Ross Geller', 'Joey Tribbiani', 'Michael Scott', 'Jim Halpert', 'Phil Dunphy']
  },

  // 11 - 20: Fantasía, Sagas Literarias y Animación
  {
    c: 'Personajes de Harry Potter pertenecientes a la casa Gryffindor',
    f: ['Harry Potter', 'Hermione Granger', 'Ron Weasley', 'Albus Dumbledore'],
    m: ['Sirius Black', 'Remus Lupin', 'Neville Longbottom'],
    d: ['Minerva McGonagall', 'Ginny Weasley', 'Rubeus Hagrid'],
    t: ['Draco Malfoy', 'Severus Snape', 'Lord Voldemort', 'Bellatrix Lestrange', 'Luna Lovegood']
  },
  {
    c: 'Personajes de Harry Potter pertenecientes a la casa Slytherin',
    f: ['Draco Malfoy', 'Severus Snape', 'Lord Voldemort', 'Bellatrix Lestrange'],
    m: ['Lucius Malfoy', 'Salazar Slytherin', 'Horace Slughorn'],
    d: ['Regulus Black', 'Narcissa Malfoy', 'Pansy Parkinson'],
    t: ['Harry Potter', 'Hermione Granger', 'Ron Weasley', 'Albus Dumbledore', 'Cedric Diggory']
  },
  {
    c: 'Personajes pertenecientes a la Comunidad del Anillo (El Señor de los Anillos)',
    f: ['Frodo Bolsón', 'Aragorn', 'Gandalf', 'Legolas'],
    m: ['Gimli', 'Sam Gamyi', 'Boromir'],
    d: ['Merry Brandigamo', 'Pippin Tuk', 'Trancos'],
    t: ['Gollum', 'Saruman', 'Elrond', 'Galadriel', 'Sauron']
  },
  {
    c: 'Personajes de Juego de Tronos pertenecientes a la Casa Stark',
    f: ['Jon Snow', 'Arya Stark', 'Sansa Stark', 'Ned Stark'],
    m: ['Robb Stark', 'Bran Stark', 'Catelyn Stark'],
    d: ['Rickon Stark', 'Benjen Stark', 'Lyanna Stark'],
    t: ['Cersei Lannister', 'Jaime Lannister', 'Daenerys Targaryen', 'Joffrey Baratheon', 'Ramsay Bolton']
  },
  {
    c: 'Personajes de Juego de Tronos pertenecientes a la Casa Lannister',
    f: ['Tyrion Lannister', 'Cersei Lannister', 'Jaime Lannister', 'Tywin Lannister'],
    m: ['Lancel Lannister', 'Kevan Lannister', 'Joffrey Baratheon (legítimo nominal)'],
    d: ['Myrcella Baratheon', 'Tommen Baratheon', 'Martyn Lannister'],
    t: ['Jon Snow', 'Arya Stark', 'Theon Greyjoy', 'Daenerys Targaryen', 'Stannis Baratheon']
  },
  {
    c: 'Personajes de animación del universo Toy Story (Pixar)',
    f: ['Woody', 'Buzz Lightyear', 'Mr. Potato', 'Rex'],
    m: ['Slinky', 'Jam (Hamm)', 'Jessie'],
    d: ['Perdigón (Bullseye)', 'Bo Peep', 'Lotso'],
    t: ['Shrek', 'Rayo McQueen', 'Mike Wazowski', 'Wall-E', 'Remy']
  },
  {
    c: 'Personajes de animación del universo Shrek (DreamWorks)',
    f: ['Shrek', 'Asno (Burro)', 'Princesa Fiona', 'Gato con Botas'],
    m: ['Lord Farquaad', 'Hada Madrina', 'Príncipe Encantador'],
    d: ['Jengi (Galleta de jengibre)', 'Pinocho', 'Dragona'],
    t: ['Woody', 'Buzz Lightyear', 'Manny el mamut', 'Po (Kung Fu Panda)', 'Alex el león']
  },
  {
    c: 'Princesas y heroínas clásicas de la factoría Disney',
    f: ['Cenicienta', 'Blancanieves', 'Ariel (Sirenita)', 'Bella'],
    m: ['Jasmine', 'Mulan', 'Pocahontas'],
    d: ['Aurora (Bella Durmiente)', 'Tiana', 'Rapunzel'],
    t: ['Fiona', 'Anastasia', 'Elsa (Reina)', 'Megara', 'Campanilla']
  },
  {
    c: 'Personajes del universo Star Wars (Lado Oscuro / Sith / Imperio)',
    f: ['Darth Vader', 'Emperador Palpatine', 'Darth Maul', 'Kylo Ren'],
    m: ['Conde Dooku', 'Gran Moff Tarkin', 'General Grievous'],
    d: ['Darth Plagueis', 'Gran Inquisidor', 'Capitana Phasma'],
    t: ['Luke Skywalker', 'Yoda', 'Obi-Wan Kenobi', 'Han Solo', 'Mace Windu']
  },
  {
    c: 'Personajes del universo Star Wars (Jedi y Alianza Rebelde)',
    f: ['Luke Skywalker', 'Yoda', 'Obi-Wan Kenobi', 'Princesa Leia'],
    m: ['Han Solo', 'Chewbacca', 'Mace Windu'],
    d: ['Ahsoka Tano', 'Qui-Gon Jinn', 'Plo Koon'],
    t: ['Darth Vader', 'Palpatine', 'Darth Maul', 'Boba Fett', 'Kylo Ren']
  },

  // 21 - 30: Series de TV Dramáticas y de Culto
  {
    c: 'Personajes principales de la serie Breaking Bad',
    f: ['Walter White', 'Jesse Pinkman', 'Saul Goodman', 'Hank Schrader'],
    m: ['Gustavo Fring', 'Mike Ehrmantraut', 'Skyler White'],
    d: ['Marie Schrader', 'Walter White Jr.', 'Tuco Salamanca'],
    t: ['Tony Soprano', 'Thomas Shelby', 'Dexter Morgan', 'Jax Teller', 'Marty Byrde']
  },
  {
    c: 'Personajes principales de la serie Stranger Things',
    f: ['Eleven (Once)', 'Mike Wheeler', 'Dustin Henderson', 'Lucas Sinclair'],
    m: ['Will Byers', 'Jim Hopper', 'Joyce Byers'],
    d: ['Steve Harrington', 'Nancy Wheeler', 'Jonathan Byers'],
    t: ['Wednesday Addams', 'Jughead Jones', 'Otis Milburn', 'Rue Bennett', 'Klaus Hargreeves']
  },
  {
    c: 'Personajes principales de la serie Peaky Blinders',
    f: ['Thomas Shelby', 'Arthur Shelby', 'Polly Gray', 'John Shelby'],
    m: ['Ada Thorne', 'Michael Gray', 'Alfies Solomons'],
    d: ['Lizzie Stark', 'Finn Shelby', 'Grace Burgess'],
    t: ['Tony Soprano', 'Walter White', 'Don Draper', 'Ragnar Lothbrok', 'Nucky Thompson']
  },
  {
    c: 'Personajes de la serie Los Soprano (HBO)',
    f: ['Tony Soprano', 'Carmela Soprano', 'Christopher Moltisanti', 'Silvio Dante'],
    m: ['Paulie Walnuts', 'Junior Soprano', 'Dr. Jennifer Melfi'],
    d: ['Meadow Soprano', 'A.J. Soprano', 'Bobby Baccalieri'],
    t: ['Walter White', 'Thomas Shelby', 'Jimmy McNulty', 'Don Draper', 'Dexter Morgan']
  },
  {
    c: 'Personajes de la serie The Boys (Amazon Prime)',
    f: ['Homelander (Patriota)', 'Billy Butcher', 'Hughie Campbell', 'Starlight (Luz Estelar)'],
    m: ['A-Train', 'The Deep (Profundo)', 'Queen Maeve'],
    d: ['Frenchie', 'Kimiko', 'Black Noir'],
    t: ['Peacemaker', 'Invincible', 'Omni-Man', 'Deadpool', 'Daredevil']
  },
  {
    c: 'Personajes de la serie La Casa de Papel (Netflix)',
    f: ['El Profesor', 'Tokio', 'Berlín', 'Denver'],
    m: ['Nairobi', 'Río', 'Helsinki'],
    d: ['Moscú', 'Arturito', 'Inspectora Murillo (Lisboa)'],
    t: ['Walter White', 'Tommy Shelby', 'Ciro Di Marzio', 'Aurelio Voltaire', 'Pablo Escobar']
  },
  {
    c: 'Series de televisión galardonadas con el premio Emmy a Mejor Serie Dramática',
    f: ['Juego de Tronos', 'Breaking Bad', 'Succession', 'Los Soprano'],
    m: ['Mad Men', 'The Crown', 'Homeland'],
    d: ['Lost (Perdidos)', '24', 'El cuento de la criada'],
    t: ['Stranger Things', 'Peaky Blinders', 'The Walking Dead', 'Vikingos', 'Prison Break']
  },
  {
    c: 'Personajes principales de la serie Dexter',
    f: ['Dexter Morgan', 'Debra Morgan', 'Rita Bennett', 'Angel Batista'],
    m: ['James Doakes', 'María LaGuerta', 'Harry Morgan'],
    d: ['Vince Masuka', 'Joey Quinn', 'Arthur Mitchell (Trinity)'],
    t: ['Hannibal Lecter', 'Joe Goldberg', 'Patrick Bateman', 'Norman Bates', 'Jigsaw']
  },
  {
    c: 'Personajes de la serie Succession (HBO)',
    f: ['Logan Roy', 'Kendall Roy', 'Shiv Roy', 'Roman Roy'],
    m: ['Tom Wambsgans', 'Greg Hirsch (Primo Greg)', 'Connor Roy'],
    d: ['Gerri Kellman', 'Frank Vernon', 'Lukas Matsson'],
    t: ['Don Draper', 'Michael Scott', 'Tony Soprano', 'Ted Mosby', 'Chuck McGill']
  },
  {
    c: 'Personajes de la serie The Walking Dead',
    f: ['Rick Grimes', 'Daryl Dixon', 'Glenn Rhee', 'Maggie Greene'],
    m: ['Michonne', 'Negan', 'Carol Peletier'],
    d: ['Carl Grimes', 'Hershel Greene', 'Shane Walsh'],
    t: ['Joel Miller', 'Ellie Williams', 'Tommy Miller', 'Leon S. Kennedy', 'Arthur Morgan']
  },

  // 31 - 40: Grandes Actores, Directores y Premios
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
    t: ['Avatar', 'Regreso al futuro', 'Alien', 'Blade Runner', 'Interstellar']
  },
  {
    c: 'Películas dirigidas por Martin Scorsese',
    f: ['Taxi Driver', 'Uno de los nuestros (Goodfellas)', 'El lobo de Wall Street', 'Infiltrados'],
    m: ['Casino', 'Toro Salvaje', 'Shutter Island'],
    d: ['El irlandés', 'Los asesinos de la luna', 'La edad de la inocencia'],
    t: ['El padrino', 'Scarface', 'Pulp Fiction', 'Heat', 'Pena de muerte']
  },
  {
    c: 'Actores que han encarnado a James Bond en el cine oficial (Eon Productions)',
    f: ['Sean Connery', 'Pierce Brosnan', 'Daniel Craig', 'Roger Moore'],
    m: ['Timothy Dalton', 'George Lazenby', 'David Niven (Casino Royale 67)'],
    d: ['Barry Nelson (TV)', 'Bob Holness (radio)', 'Michael Jayston (audio)'],
    t: ['Hugh Jackman', 'Clive Owen', 'Tom Hiddleston', 'Henry Cavill', 'Idris Elba']
  },
  {
    c: 'Actores que han interpretado a Batman / Bruce Wayne en cine de imagen real',
    f: ['Christian Bale', 'Ben Affleck', 'Robert Pattinson', 'Michael Keaton'],
    m: ['George Clooney', 'Val Kilmer', 'Adam West'],
    d: ['Lewis Wilson', 'Robert Lowery', 'Kevin Conroy (voz/cameo)'],
    t: ['Cillian Murphy', 'Tom Hardy', 'Heath Ledger', 'Joaquin Phoenix', 'Jake Gyllenhaal']
  },
  {
    c: 'Actores que han interpretado al Joker en cine o televisión',
    f: ['Heath Ledger', 'Joaquin Phoenix', 'Jack Nicholson', 'Jared Leto'],
    m: ['Cesar Romero', 'Cameron Monaghan', 'Barry Keoghan'],
    d: ['Mark Hamill (voz canónica)', 'Troy Baker (voz)', 'Kevin Michael Richardson (voz)'],
    t: ['Christian Bale', 'Willem Dafoe', 'Jim Carrey', 'Paul Dano', 'Colin Farrell']
  },
  {
    c: 'Actores ganadores del premio Oscar a Mejor Actor Principal',
    f: ['Leonardo DiCaprio', 'Joaquin Phoenix', 'Cillian Murphy', 'Will Smith'],
    m: ['Anthony Hopkins', 'Matthew McConaughey', 'Rami Malek'],
    d: ['Adrien Brody', 'Casey Affleck', 'Gary Oldman'],
    t: ['Brad Pitt', 'Tom Cruise', 'Johnny Depp', 'Harrison Ford', 'Christian Bale']
  },
  {
    c: 'Actrices ganadoras del premio Oscar a Mejor Actriz Principal',
    f: ['Meryl Streep', 'Emma Stone', 'Natalie Portman', 'Cate Blanchett'],
    m: ['Jennifer Lawrence', 'Sandra Bullock', 'Michelle Yeoh'],
    d: ['Jessica Chastain', 'Olivia Colman', 'Brie Larson'],
    t: ['Scarlett Johansson', 'Amy Adams', 'Margot Robbie', 'Helena Bonham Carter', 'Anne Hathaway']
  },
  {
    c: 'Actores que han protagonizado la saga Misión Imposible',
    f: ['Tom Cruise', 'Ving Rhames', 'Simon Pegg', 'Rebecca Ferguson'],
    m: ['Jeremy Renner', 'Henry Cavill', 'Vanessa Kirby'],
    d: ['Jean Reno', 'Jon Voight', 'Philip Seymour Hoffman'],
    t: ['Brad Pitt', 'Matt Damon', 'Leonardo DiCaprio', 'Keanu Reeves', 'Will Smith']
  },

  // 41 - 50: Música Pop, Estrellas Globales y Super Bowl
  {
    c: 'Artistas musicales que han encabezado el espectáculo de medio tiempo de la Super Bowl',
    f: ['Michael Jackson', 'Shakira', 'Rihanna', 'Eminem'],
    m: ['The Weeknd', 'Katy Perry', 'Bruno Mars'],
    d: ['Lady Gaga', 'Coldplay', 'Usher'],
    t: ['Taylor Swift', 'Drake', 'Adele', 'Ed Sheeran', 'Dua Lipa']
  },
  {
    c: 'Cantantes y celebridades con más de 200 millones de seguidores en Instagram',
    f: ['Cristiano Ronaldo', 'Lionel Messi', 'Selena Gomez', 'Kylie Jenner'],
    m: ['Dwayne Johnson', 'Ariana Grande', 'Kim Kardashian'],
    d: ['Beyoncé', 'Khloé Kardashian', 'Justin Bieber'],
    t: ['Fernando Alonso', 'Ibai Llanos', 'Rafael Nadal', 'Auronplay', 'El Rubius']
  },
  {
    c: 'Miembros de la familia Kardashian-Jenner protagonistas de telerrealidad',
    f: ['Kim Kardashian', 'Kylie Jenner', 'Kendall Jenner', 'Kourtney Kardashian'],
    m: ['Khloé Kardashian', 'Kris Jenner', 'Caitlyn Jenner'],
    d: ['Rob Kardashian', 'North West', 'Stormi Webster'],
    t: ['Paris Hilton', 'Hailey Bieber', 'Bella Hadid', 'Gigi Hadid', 'Britney Spears']
  },
  {
    c: 'Miembros fundadores de la legendaria banda británica The Beatles',
    f: ['John Lennon', 'Paul McCartney', 'George Harrison', 'Ringo Starr'],
    m: ['Pete Best (batería original)', 'Stuart Sutcliffe (bajista original)', 'Brian Epstein (mánager)'],
    d: ['George Martin (productor)', 'Jimmie Nicol (sustituto)', 'Tony Sheridan (colaborador)'],
    t: ['Mick Jagger', 'Keith Richards', 'Freddie Mercury', 'Eric Clapton', 'Roger Waters']
  },
  {
    c: 'Miembros fundadores de la banda de rock británica Queen',
    f: ['Freddie Mercury', 'Brian May', 'Roger Taylor', 'John Deacon'],
    m: ['Mike Grose (primer bajista)', 'Barry Mitchell (bajista)', 'Doug Bogie (bajista)'],
    d: ['Paul Rodgers (vocalista posterior)', 'Adam Lambert (vocalista actual)', 'Spike Edney (teclista)'],
    t: ['Mick Jagger', 'Robert Plant', 'Axl Rose', 'David Bowie', 'Elton John']
  },
  {
    c: 'Cantantes solistas femeninas con más premios Grammy ganados',
    f: ['Beyoncé', 'Taylor Swift', 'Adele', 'Aretha Franklin'],
    m: ['Alicia Keys', 'Lady Gaga', 'Billie Eilish'],
    d: ['Alison Krauss', 'Ella Fitzgerald', 'Barbra Streisand'],
    t: ['Katy Perry', 'Nicki Minaj', 'Jennifer Lopez', 'Avril Lavigne', 'Miley Cyrus']
  },
  {
    c: 'Miembros fundadores de la exitosa boyband británica One Direction',
    f: ['Harry Styles', 'Zayn Malik', 'Niall Horan', 'Louis Tomlinson'],
    m: ['Liam Payne', 'Simon Cowell (creador)', 'Dan Richards (guitarrista gira)'],
    d: ['Josh Devine (batería gira)', 'Jon Shave (productor)', 'Julian Bunetta (productor)'],
    t: ['Justin Bieber', 'Shawn Mendes', 'Nick Jonas', 'Joe Jonas', 'Robbie Williams']
  },
  {
    c: 'Artistas que han grabado sesiones musicales con Bizarrap (BZRP Music Sessions)',
    f: ['Quevedo', 'Shakira', 'Nathy Peluso', 'Residente'],
    m: ['Villano Antillano', 'Duki', 'Nicki Nicole'],
    d: ['Snow Tha Product', 'Tiago PZK', 'Milo J'],
    t: ['Bad Bunny', 'Rosalía', 'J Balvin', 'Maluma', 'Karol G']
  },
  {
    c: 'Grandes figuras de la música urbana y reggaeton latino',
    f: ['Bad Bunny', 'Daddy Yankee', 'J Balvin', 'Karol G'],
    m: ['Rauw Alejandro', 'Maluma', 'Ozuna'],
    d: ['Don Omar', 'Feid', 'Wisin & Yandel'],
    t: ['Pablo Alborán', 'Alejandro Sanz', 'Enrique Iglesias', 'David Bisbal', 'Ricky Martin']
  },
  {
    c: 'Grandes divas del pop internacional de los años 90 y 2000',
    f: ['Britney Spears', 'Madonna', 'Christina Aguilera', 'Beyoncé'],
    m: ['Shakira', 'Jennifer Lopez', 'Rihanna'],
    d: ['Gwen Stefani', 'Kylie Minogue', 'Avril Lavigne'],
    t: ['Dua Lipa', 'Billie Eilish', 'Olivia Rodrigo', 'Sabrina Carpenter', 'Camila Cabello']
  },

  // 51 - 60: Anime, Manga y Animación Japonesa
  {
    c: 'Personajes pertenecientes a la serie Dragon Ball Z',
    f: ['Goku', 'Vegeta', 'Gohan', 'Piccolo'],
    m: ['Freezer', 'Cell (Célula)', 'Majin Buu'],
    d: ['Trunks del futuro', 'Krilin', 'Tenshinhan'],
    t: ['Naruto Uzumaki', 'Monkey D. Luffy', 'Sasuke Uchiha', 'Ichigo Kurosaki', 'Tanjiro Kamado']
  },
  {
    c: 'Personajes pertenecientes a la tripulación de Sombrero de Paja (One Piece)',
    f: ['Monkey D. Luffy', 'Roronoa Zoro', 'Nami', 'Sanji'],
    m: ['Usopp', 'Tony Tony Chopper', 'Nico Robin'],
    d: ['Franky', 'Brook', 'Jinbe'],
    t: ['Portgas D. Ace', 'Trafalgar Law', 'Shanks', 'Buggy el Payaso', 'Gol D. Roger']
  },
  {
    c: 'Personajes principales del anime Naruto',
    f: ['Naruto Uzumaki', 'Sasuke Uchiha', 'Sakura Haruno', 'Kakashi Hatake'],
    m: ['Itachi Uchiha', 'Jiraiya', 'Gaara'],
    d: ['Orochimaru', 'Tsunade', 'Shikamaru Nara'],
    t: ['Goku', 'Luffy', 'Ichigo Kurosaki', 'Eren Jaeger', 'Tanjiro Kamado']
  },
  {
    c: 'Personajes de la serie Attack on Titan (Shingeki no Kyojin)',
    f: ['Eren Jaeger', 'Mikasa Ackerman', 'Armin Arlert', 'Levi Ackerman'],
    m: ['Erwin Smith', 'Hange Zoë', 'Reiner Braun'],
    d: ['Zeke Jaeger', 'Annie Leonhart', 'Jean Kirstein'],
    t: ['Goku', 'Naruto Uzumaki', 'Edward Elric', 'Ken Kaneki', 'Light Yagami']
  },
  {
    c: 'Películas producidas por el célebre estudio japonés Studio Ghibli',
    f: ['El viaje de Chihiro', 'Mi vecino Totoro', 'La princesa Mononoke', 'El castillo ambulante'],
    m: ['La tumba de las luciérnagas', 'Ponyo en el acantilado', 'Nicky, la aprendiz de bruja'],
    d: ['Porco Rosso', 'El viento se levanta', 'El cuento de la princesa Kaguya'],
    t: ['Your Name', 'Akira', 'A Silent Voice', 'El tiempo contigo', 'Ghost in the Shell']
  },
  {
    c: 'Personajes del anime y manga Death Note',
    f: ['Light Yagami', 'L (Lawliet)', 'Ryuk', 'Misa Amane'],
    m: ['Near (Nate River)', 'Mello (Mihael Keehl)', 'Soichiro Yagami'],
    d: ['Teru Mikami', 'Rem', 'Touta Matsuda'],
    t: ['Lelouch Lamperouge', 'Edward Elric', 'Levi Ackerman', 'Spike Spiegel', 'Roy Mustang']
  },
  {
    c: 'Personajes principales del anime Demon Slayer (Kimetsu no Yaiba)',
    f: ['Tanjiro Kamado', 'Nezuko Kamado', 'Zenitsu Agatsuma', 'Inosuke Hashibira'],
    m: ['Giyu Tomioka', 'Muzan Kibutsuji', 'Kyojuro Rengoku'],
    d: ['Shinobu Kocho', 'Akaza', 'Kanao Tsuyuri'],
    t: ['Naruto Uzumaki', 'Edward Elric', 'Satoru Gojo', 'Yuji Itadori', 'Megumi Fushiguro']
  },
  {
    c: 'Personajes principales del anime Jujutsu Kaisen',
    f: ['Satoru Gojo', 'Yuji Itadori', 'Megumi Fushiguro', 'Ryomen Sukuna'],
    m: ['Nobara Kugisaki', 'Kento Nanami', 'Suguru Geto'],
    d: ['Aoi Todo', 'Maki Zenin', 'Yuta Okkotsu'],
    t: ['Tanjiro Kamado', 'Nezuko Kamado', 'Levi Ackerman', 'Eren Jaeger', 'Kakashi Hatake']
  },
  {
    c: 'Personajes del anime clásico Pokémon que han sido compañeros de Ash Ketchum',
    f: ['Misty', 'Brock', 'Pikachu', 'May (Aura)'],
    m: ['Dawn (Maya)', 'Serena', 'Clemont (Lem)'],
    d: ['Tracey Sketchit', 'Iris', 'Cilan (Millo)'],
    t: ['Jessie', 'James', 'Giovanni', 'Profesor Oak', 'Gary Oak']
  },
  {
    c: 'Villanos y antagonistas emblemáticos del anime japonés',
    f: ['Freezer (Dragon Ball)', 'Madara Uchiha (Naruto)', 'Muzan Kibutsuji (Demon Slayer)', 'Light Yagami (Death Note)'],
    m: ['Griffith (Berserk)', 'Sosuke Aizen (Bleach)', 'Cell (Dragon Ball)'],
    d: ['Meruem (Hunter x Hunter)', 'Dio Brando (JoJo)', 'Doflamingo (One Piece)'],
    t: ['Goku', 'Naruto Uzumaki', 'Levi Ackerman', 'Luffy', 'Edward Elric']
  },

  // 61 - 70: Videojuegos y Cultura Gamer
  {
    c: 'Personajes de videojuegos creados por Nintendo',
    f: ['Mario Bros', 'Link (Zelda)', 'Donkey Kong', 'Kirby'],
    m: ['Samus Aran (Metroid)', 'Fox McCloud (Star Fox)', 'Yoshi'],
    d: ['Captain Falcon', 'Ness (EarthBound)', 'Pit (Kid Icarus)'],
    t: ['Sonic the Hedgehog', 'Crash Bandicoot', 'Kratos', 'Master Chief', 'Lara Croft']
  },
  {
    c: 'Personajes y criaturas del universo Pokémon (Primera Generación)',
    f: ['Pikachu', 'Charizard', 'Mewtwo', 'Bulbasaur'],
    m: ['Squirtle', 'Snorlax', 'Gengar'],
    d: ['Dragonite', 'Eevee', 'Mew'],
    t: ['Lucario (Gen 4)', 'Greninja (Gen 6)', 'Gengar Gigamax', 'Zacian (Gen 8)', 'Rayquaza (Gen 3)']
  },
  {
    c: 'Creadores de contenido y streamers de habla hispana en Twitch y YouTube',
    f: ['Ibai Llanos', 'Auronplay', 'El Rubius', 'TheGrefg'],
    m: ['IlloJuan', 'DjMaRiiO', 'ElMariana'],
    d: ['Rivers GG', 'Vegetta777', 'Knekro'],
    t: ['MrBeast', 'PewDiePie', 'Ninja', 'Kai Cenat', 'xQc']
  },
  {
    c: 'Creadores de contenido anglosajones más famosos de YouTube y Twitch',
    f: ['MrBeast', 'PewDiePie', 'Ninja', 'Kai Cenat'],
    m: ['xQc', 'IShowSpeed', 'Markiplier'],
    d: ['Jacksepticeye', 'Pokimane', 'Shroud'],
    t: ['Ibai Llanos', 'Auronplay', 'El Rubius', 'TheGrefg', 'IlloJuan']
  },
  {
    c: 'Videojuegos galardonados con el premio al Juego del Año (GOTY en The Game Awards)',
    f: ['The Witcher 3', 'The Legend of Zelda: Breath of the Wild', 'God of War (2018)', 'Elden Ring'],
    m: ['Sekiro: Shadows Die Twice', 'The Last of Us Part II', 'Baldur\'s Gate 3'],
    d: ['Dragon Age: Inquisition', 'Overwatch', 'It Takes Two'],
    t: ['Red Dead Redemption 2', 'Spider-Man PS4', 'Cyberpunk 2077', 'Bloodborne', 'Super Mario Odyssey']
  },
  {
    c: 'Franquicias de videojuegos que son exclusivas históricas de PlayStation',
    f: ['God of War', 'The Last of Us', 'Uncharted', 'Gran Turismo'],
    m: ['Ratchet & Clank', 'Bloodborne', 'Horizon Zero Dawn'],
    d: ['Ghost of Tsushima', 'Killzone', 'Infamous'],
    t: ['Halo', 'Gears of War', 'Forza Horizon', 'Super Mario', 'Starfield']
  },
  {
    c: 'Franquicias de videojuegos asociadas históricamente a Xbox (Microsoft)',
    f: ['Halo', 'Gears of War', 'Forza Horizon', 'Fable'],
    m: ['Forza Motorsport', 'Sea of Thieves', 'State of Decay'],
    d: ['Crackdown', 'Perfect Dark', 'Killer Instinct'],
    t: ['God of War', 'Uncharted', 'The Last of Us', 'Gran Turismo', 'Killzone']
  },
  {
    c: 'Personajes protagonistas de la saga Grand Theft Auto (GTA)',
    f: ['Michael De Santa', 'Franklin Clinton', 'Trevor Philips', 'CJ (Carl Johnson)'],
    m: ['Tommy Vercetti', 'Niko Bellic', 'Claude Speed'],
    d: ['Luis Fernando Lopez', 'Johnny Klebitz', 'Toni Cipriani'],
    t: ['Arthur Morgan', 'John Marston', 'Max Payne', 'Cole Phelps', 'Jimmy Hopkins']
  },
  {
    c: 'Videojuegos competitivos multijugador considerados deportes electrónicos (Esports)',
    f: ['League of Legends', 'Counter-Strike', 'Valorant', 'Dota 2'],
    m: ['Rocket League', 'Rainbow Six Siege', 'Overwatch'],
    d: ['StarCraft II', 'Apex Legends', 'Super Smash Bros. Melee'],
    t: ['God of War', 'The Last of Us', 'The Witcher 3', 'Red Dead Redemption 2', 'Elden Ring']
  },
  {
    c: 'Mobs o criaturas vivientes del videojuego Minecraft',
    f: ['Creeper', 'Zombie', 'Esqueleto', 'Enderman'],
    m: ['Aldeano', 'Araña', 'Piglin'],
    d: ['Ghast', 'Wither', 'Warden'],
    t: ['Goomba', 'Koopa Troopa', 'Chocobo', 'Bokoblin', 'Slime de Dragon Quest']
  },

  // 71 - 80: Televisión Española y Fenómenos Culturales
  {
    c: 'Personajes emblemáticos de la serie Aquí no hay quien viva (ANHQV)',
    f: ['Emilio Delgado', 'Juan Cuesta', 'Marisa Benito', 'Vicenta Benito'],
    m: ['Mauricio Hidalgo (Mauri)', 'Concha de la Fuente', 'Mariano Delgado'],
    d: ['Belén López', 'Paloma Hurtado', 'Andrés Guerra'],
    t: ['Antonio Recio', 'Amador Rivas', 'Coque Calatrava', 'Enrique Pastor', 'Fermín Trujillo']
  },
  {
    c: 'Personajes emblemáticos de la serie La que se avecina (LQSA)',
    f: ['Antonio Recio', 'Amador Rivas', 'Enrique Pastor', 'Coque Calatrava'],
    m: ['Fermín Trujillo', 'Berta Escobar', 'Maite Figueroa'],
    d: ['Lola Trujillo', 'Menchu', 'Vicente Maroto'],
    t: ['Emilio Delgado', 'Juan Cuesta', 'Paloma Hurtado', 'Marisa Benito', 'Mauri']
  },
  {
    c: 'Presentadores de televisión muy conocidos en España',
    f: ['Pablo Motos', 'Jorge Javier Vázquez', 'Carlos Sobera', 'Roberto Leal'],
    m: ['Arturo Valls', 'Jesús Vázquez', 'Andreu Buenafuente'],
    d: ['David Broncano', 'Risto Mejide', 'Jordi Évole'],
    t: ['Fernando Alonso', 'Ibai Llanos', 'Rafael Nadal', 'Gerard Piqué', 'Alejandro Sanz']
  },
  {
    c: 'Artistas que han participado como coaches o jueces en La Voz (España)',
    f: ['David Bisbal', 'Melendi', 'Malú', 'Alejandro Sanz'],
    m: ['Rosario Flores', 'Luis Fonsi', 'Antonio Orozco'],
    d: ['Pablo Alborán', 'Laura Pausini', 'Manuel Carrasco'],
    t: ['Julio Iglesias', 'Enrique Iglesias', 'Rosalía', 'C. Tangana', 'Bad Bunny']
  },
  {
    c: 'Cantantes salidos del concurso Operación Triunfo (España)',
    f: ['David Bisbal', 'Aitana', 'David Bustamante', 'Chenoa'],
    m: ['Manuel Carrasco', 'Rosa López', 'Amaia Romero'],
    d: ['Lola Índigo (Mimi)', 'Soraya Arnelas', 'Edurne'],
    t: ['Melendi', 'Pablo Alborán', 'Alejandro Sanz', 'Rosalía', 'Malú']
  },
  {
    c: 'Series de televisión clásicas producidas en España',
    f: ['Cuéntame cómo pasó', 'Los Serrano', 'Aquí no hay quien viva', 'Médico de familia'],
    m: ['Farmacia de guardia', 'Aída', 'El Barco'],
    d: ['Compañeros', 'Al salir de clase', 'Periodistas'],
    t: ['Juego de Tronos', 'Breaking Bad', 'Friends', 'The Office', 'Peaky Blinders']
  },
  {
    c: 'Películas ganadoras del premio Goya a la Mejor Película',
    f: ['Todo sobre mi madre', 'Mar adentro', 'La isla mínima', 'Campeones'],
    m: ['Tesis', 'Celda 211', 'Dolor y gloria'],
    d: ['As bestas', 'La sociedad de la nieve', 'El bola'],
    t: ['Ocho apellidos vascos', 'Torrente', 'El día de la bestia', 'Lo imposible', 'Relatos salvajes']
  },
  {
    c: 'Cómicos y humoristas célebres de la historia de España',
    f: ['Chiquito de la Calzada', 'Eugenio', 'José Mota', 'Gila'],
    m: ['Martes y Trece', 'Cruz y Raya', 'Paco León'],
    d: ['Faemino y Cansado', 'Berto Romero', 'Joaquín Reyes'],
    t: ['Pedro Almodóvar', 'Antonio Banderas', 'Javier Bardem', 'Penélope Cruz', 'Luis Buñuel']
  },
  {
    c: 'Actores españoles nominados o ganadores del premio Oscar',
    f: ['Javier Bardem', 'Penélope Cruz', 'Antonio Banderas', 'Paco Delgado (vestuario)'],
    m: ['Alberto Iglesias (banda sonora)', 'Pedro Almodóvar (guion/dirección)', 'Garci (película)'],
    d: ['Javier Navarrete (música)', 'David Martí (maquillaje)', 'Montse Ribé (maquillaje)'],
    t: ['Mario Casas', 'Dani Rovira', 'Hugo Silva', 'Santiago Segura', 'Blanca Suárez']
  },
  {
    c: 'Festivales de música multitudinarios celebrados en España',
    f: ['Mad Cool', 'Primavera Sound', 'Viña Rock', 'Arenal Sound'],
    m: ['Bilbao BBK Live', 'FIB (Benicàssim)', 'Resurrection Fest'],
    d: ['Rototom Sunsplash', 'Sonorama Ribera', 'Sónar'],
    t: ['Coachella', 'Tomorrowland', 'Glastonbury', 'Lollapalooza', 'Rock in Rio']
  },

  // 81 - 90: Clásicos del Cine, Terror y Sagas Taquilleras
  {
    c: 'Películas de terror y suspense consideradas clásicos mundiales',
    f: ['El exorcista', 'El resplandor', 'Psicosis', 'Halloween'],
    m: ['La matanza de Texas', 'Pesadilla en Elm Street', 'Alien, el octavo pasajero'],
    d: ['La semilla del diablo (Rosemary\'s Baby)', 'Suspiria', 'La noche de los muertos vivientes'],
    t: ['Se7en', 'El silencio de los corderos', 'Zodiac', 'El sexto sentido', 'Shutter Island']
  },
  {
    c: 'Asesinos y monstruos clásicos del cine de terror (Slashers)',
    f: ['Freddy Krueger', 'Jason Voorhees', 'Michael Myers', 'Ghostface'],
    m: ['Leatherface', 'Chucky el muñeco diabólico', 'Pinhead'],
    d: ['Pennywise', 'Jigsaw (John Kramer)', 'Candyman'],
    t: ['Hannibal Lecter', 'Norman Bates', 'Patrick Bateman', 'Darth Vader', 'Voldemort']
  },
  {
    c: 'Películas que han superado los 1.500 millones de dólares en taquilla mundial',
    f: ['Avatar', 'Vengadores: Endgame', 'Titanic', 'Star Wars: El despertar de la Fuerza'],
    m: ['Vengadores: Infinity War', 'Spider-Man: No Way Home', 'Jurassic World'],
    d: ['El Rey León (2019)', 'Los Vengadores (2012)', 'Fast & Furious 7'],
    t: ['Harry Potter y la piedra filosofal', 'Frozen 1', 'Joker', 'Oppenheimer', 'Barbie']
  },
  {
    c: 'Películas pertenecientes a la saga Fast & Furious (A todo gas)',
    f: ['A todo gas (2001)', 'Fast & Furious 5', 'Fast & Furious 7', 'Fast X'],
    m: ['A todo gas 2', 'Tokyo Race', 'Fast & Furious 6'],
    d: ['Fast & Furious 8', 'Fast & Furious 9', 'Hobbs & Shaw'],
    t: ['Need for Speed', 'Drive', 'Baby Driver', 'Taxi', 'Death Race']
  },
  {
    c: 'Películas de ciencia ficción ganadoras de múltiples premios Oscar',
    f: ['Origen (Inception)', 'Interstellar', 'Matrix', 'Gravity'],
    m: ['Mad Max: Furia en la carretera', 'Dune (2021)', 'Avatar'],
    d: ['Terminator 2', 'Alien', '2001: Una odisea del espacio'],
    t: ['Armageddon', 'Transformers', 'El núcleo', 'Independence Day 2', 'Godzilla']
  },
  {
    c: 'Películas que componen la Trilogía de El Padrino o vinculadas a la mafia de Coppola',
    f: ['El Padrino (1972)', 'El Padrino Parte II (1974)', 'El Padrino Parte III (1990)', 'El Padrino Epílogo (Coda)'],
    m: ['Vito Corleone (personaje)', 'Michael Corleone (personaje)', 'Sonny Corleone (personaje)'],
    d: ['Fredo Corleone', 'Connie Corleone', 'Tom Hagen'],
    t: ['Uno de los nuestros', 'Casino', 'Scarface', 'Infiltrados', 'El irlandés']
  },
  {
    c: 'Películas de animación ganadoras del Oscar a Mejor Película de Animación',
    f: ['Shrek', 'Buscando a Nemo', 'Up', 'Coco'],
    m: ['El viaje de Chihiro', 'Spider-Man: Un nuevo universo', 'Ratatouille'],
    d: ['Pinocho de Guillermo del Toro', 'Rango', 'Wallace & Gromit: La maldición de las verduras'],
    t: ['El rey león (1994)', 'Aladdín', 'La bella y la bestia', 'Toy Story 1 (no existía categoría)', 'Pesadilla antes de Navidad']
  },
  {
    c: 'Monstruos gigantes del cine (Kaijus)',
    f: ['Godzilla', 'King Kong', 'Mothra', 'King Ghidorah'],
    m: ['Rodan', 'Gamera', 'Mechagodzilla'],
    d: ['Destoroyah', 'Cloverfield (monstruo)', 'Anguirus'],
    t: ['Cthulhu', 'Kraken mitológico', 'Leviatán bíblico', 'Megodón', 'Smaug']
  },
  {
    c: 'Actores que han encarnado a Spiderman en cine (acción real o doblaje animado)',
    f: ['Tobey Maguire', 'Andrew Garfield', 'Tom Holland', 'Shameik Moore (Miles Morales)'],
    m: ['Jake Johnson (Peter B. Parker)', 'Nicolas Cage (Spider-Noir)', 'Chris Pine (Peter Parker)'],
    d: ['Yuri Lowenthal (voz videojuegos)', 'Drake Bell (serie animada)', 'Neil Patrick Harris (serie MTV)'],
    t: ['Tom Hardy', 'Willem Dafoe', 'Michael B. Jordan', 'Aaron Taylor-Johnson', 'Miles Teller']
  },
  {
    c: 'Películas pertenecientes al Universo Cinematográfico de Marvel (UCM / Fase 1 a 3)',
    f: ['Iron Man', 'Los Vengadores', 'Black Panther', 'Thor: Ragnarok'],
    m: ['Guardianes de la Galaxia', 'Doctor Strange', 'Capitana Marvel'],
    d: ['Ant-Man', 'Capitán América: El soldado de invierno', 'El increíble Hulk (2008)'],
    t: ['Venom', 'Morbius', 'The Batman', 'Logan', 'X-Men: Días del futuro pasado']
  },

  // 91 - 100: Cultura de Internet, Memes y Marcas Globales
  {
    c: 'Marcas globales de ropa deportiva y zapatillas de culto',
    f: ['Nike', 'Adidas', 'Puma', 'Jordan'],
    m: ['Reebok', 'New Balance', 'Under Armour'],
    d: ['Vans', 'Converse', 'ASICS'],
    t: ['Gucci', 'Zara', 'Louis Vuitton', 'Balenciaga', 'Rolex']
  },
  {
    c: 'Marcas de alta costura y moda de lujo internacional',
    f: ['Gucci', 'Prada', 'Chanel', 'Louis Vuitton'],
    m: ['Balenciaga', 'Dior', 'Versace'],
    d: ['Saint Laurent (YSL)', 'Hermès', 'Burberry'],
    t: ['Nike', 'Zara', 'H&M', 'Primark', 'Decathlon']
  },
  {
    c: 'Redes sociales y plataformas digitales con más de 500 millones de usuarios',
    f: ['Instagram', 'TikTok', 'WhatsApp', 'YouTube'],
    m: ['Facebook', 'Telegram', 'Snapchat'],
    d: ['Pinterest', 'X (Twitter)', 'Reddit'],
    t: ['Tuenti', 'Vine', 'MySpace', 'Google+', 'Clubhouse']
  },
  {
    c: 'Personajes y mascotas oficiales de consolas y videojuegos',
    f: ['Mario Bros', 'Sonic the Hedgehog', 'Pikachu', 'Crash Bandicoot'],
    m: ['Spyro el dragón', 'Pac-Man', 'Mega Man'],
    d: ['Rayman', 'Sackboy (LittleBigPlanet)', 'Klonoa'],
    t: ['Mickey Mouse', 'Bugs Bunny', 'Homer Simpson', 'Bob Esponja', 'Shrek']
  },
  {
    c: 'Personajes protagonistas de series animadas para adultos',
    f: ['Peter Griffin', 'Homer Simpson', 'Rick Sanchez', 'Eric Cartman'],
    m: ['Bender Doblador Rodríguez', 'Stan Smith', 'BoJack Horseman'],
    d: ['Sterling Archer', 'Randy Marsh', 'Morty Smith'],
    t: ['Mickey Mouse', 'Bob Esponja', 'Phineas Flynn', 'Steven Universe', 'Finn el humano']
  },
  {
    c: 'Fenómenos virales y memes legendarios de la historia de internet',
    f: ['Rickroll (Never Gonna Give You Up)', 'Doge (perro Shiba Inu)', 'Gangnam Style', 'Nyan Cat'],
    m: ['Novio distraído (Distracted Boyfriend)', 'Pepe the Frog', 'Harlem Shake'],
    d: ['Disaster Girl (niña del incendio)', 'Hide the Pain Harold', 'Grumpy Cat'],
    t: ['La Gioconda', 'El grito de Munch', 'Guernica', 'La noche estrellada', 'Las Meninas']
  },
  {
    c: 'Series de televisión de animación japonesa clásicas emitidas en España en los 80/90',
    f: ['Dragon Ball', 'Oliver y Benji (Captain Tsubasa)', 'Caballeros del Zodiaco', 'Sailor Moon'],
    m: ['Shin-chan', 'Doraemon', 'Ranma 1/2'],
    d: ['Mazinger Z', 'Heidi', 'Marco'],
    t: ['Los Simpson', 'Padre de familia', 'Futurama', 'South Park', 'Rugrats']
  },
  {
    c: 'Canciones en español que han superado los mil millones de reproducciones en streaming',
    f: ['Despacito (Luis Fonsi)', 'Bzrp Music Sessions #52 (Quédate)', 'Dákiti (Bad Bunny)', 'Bailando (Enrique Iglesias)'],
    m: ['Mi Gente (J Balvin)', 'Tusa (Karol G)', 'Hawái (Maluma)'],
    d: ['La Bachata (Manuel Turizo)', 'Todo de Ti (Rauw Alejandro)', 'Chantaje (Shakira)'],
    t: ['Macarena (versión original)', 'La raja de tu falda', 'Zapatillas', 'Ave María', 'Soldadito marinero']
  },
  {
    c: 'Grupos y solistas del fenómeno musical K-Pop surcoreano',
    f: ['BTS', 'Blackpink', 'PSY', 'TWICE'],
    m: ['Stray Kids', 'EXO', 'NewJeans'],
    d: ['Seventeen', 'Red Velvet', 'Big Bang'],
    t: ['One Direction', 'Backstreet Boys', 'Jonas Brothers', 'Coldplay', 'Maroon 5']
  },
  {
    c: 'Personajes del anime y manga JoJo\'s Bizarre Adventure',
    f: ['Jotaro Kujo', 'Dio Brando', 'Joseph Joestar', 'Jonathan Joestar'],
    m: ['Josuke Higashikata', 'Giorno Giovanna', 'Jolyne Cujoh'],
    d: ['Yoshikage Kira', 'Bruno Bucciarati', 'Diavolo'],
    t: ['Goku', 'Naruto Uzumaki', 'Monkey D. Luffy', 'Ichigo Kurosaki', 'Tanjiro Kamado']
  }
];

export default Array.from({ length: 100 }, (_, idx) => {
  const p = plantillas[idx];
  return {
    id: `cultura_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});