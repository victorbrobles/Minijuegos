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
    c: 'Villanos icónicos del universo de Batman en los cómics',
    f: ['Joker', 'Pingüino', 'Enigma', 'Dos Caras'],
    m: ['Bane', 'Espantapájaros', 'Hiedra Venenosa'],
    d: ['Sr. Frío', 'Harley Quinn', 'Ra\'s al Ghul'],
    t: ['Duende Verde', 'Doctor Octopus', 'Venom', 'Loki', 'Thanos']
  },
  {
    c: 'Villanos icónicos del universo de Spider-Man en los cómics',
    f: ['Duende Verde', 'Doctor Octopus', 'Venom', 'Electro'],
    m: ['Hombre de Arena', 'Misterio', 'Lagarto'],
    d: ['Buitre', 'Kraven el Cazador', 'Rhino'],
    t: ['Joker', 'Bane', 'Loki', 'Magneto', 'Cráneo Rojo']
  },
  {
    c: 'Personajes recurrentes de la serie de animación Los Simpson',
    f: ['Homer Simpson', 'Marge Simpson', 'Bart Simpson', 'Lisa Simpson'],
    m: ['Maggie Simpson', 'Ned Flanders', 'Sr. Burns'],
    d: ['Moe Szyslak', 'Krusty el payaso', 'Milhouse Van Houten'],
    t: ['Peter Griffin', 'Stan Smith', 'Bender', 'Eric Cartman', 'Rick Sanchez']
  },
  {
    c: 'Personajes habituales de la serie The Office (versión estadounidense)',
    f: ['Michael Scott', 'Dwight Schrute', 'Jim Halpert', 'Pam Beesly'],
    m: ['Ryan Howard', 'Andy Bernard', 'Angela Martin'],
    d: ['Stanley Hudson', 'Kevin Malone', 'Creed Bratton'],
    t: ['Ron Swanson', 'Leslie Knope', 'Chandler Bing', 'Ted Mosby', 'Jake Peralta']
  },
  {
    c: 'Personajes con apariciones en la serie Friends',
    f: ['Rachel Green', 'Monica Geller', 'Phoebe Buffay', 'Joey Tribbiani'],
    m: ['Chandler Bing', 'Ross Geller', 'Gunther'],
    d: ['Mike Hannigan', 'Janice Hosenstein', 'Jack Geller'],
    t: ['Ted Mosby', 'Barney Stinson', 'Penny Hofstadter', 'Sheldon Cooper', 'Robin Scherbatsky']
  },
  {
    c: 'Personajes de la serie Cómo conocí a vuestra madre (HIMYM)',
    f: ['Ted Mosby', 'Barney Stinson', 'Robin Scherbatsky', 'Marshall Eriksen'],
    m: ['Lily Aldrin', 'Tracy McConnell', 'Ranjit'],
    d: ['Victoria', 'Stella Zinman', 'Zoey Pierson'],
    t: ['Ross Geller', 'Joey Tribbiani', 'Michael Scott', 'Jim Halpert', 'Phil Dunphy']
  },

  // 11 - 20: Fantasía, Sagas Literarias y Animación
  {
    c: 'Personajes de la saga Harry Potter asignados a la casa Gryffindor',
    f: ['Harry Potter', 'Hermione Granger', 'Ron Weasley', 'Albus Dumbledore'],
    m: ['Sirius Black', 'Remus Lupin', 'Neville Longbottom'],
    d: ['Minerva McGonagall', 'Ginny Weasley', 'Rubeus Hagrid'],
    t: ['Draco Malfoy', 'Severus Snape', 'Lord Voldemort', 'Bellatrix Lestrange', 'Luna Lovegood']
  },
  {
    c: 'Personajes de la saga Harry Potter asignados a la casa Slytherin',
    f: ['Draco Malfoy', 'Severus Snape', 'Lord Voldemort', 'Bellatrix Lestrange'],
    m: ['Lucius Malfoy', 'Salazar Slytherin', 'Horace Slughorn'],
    d: ['Regulus Black', 'Narcissa Malfoy', 'Pansy Parkinson'],
    t: ['Harry Potter', 'Hermione Granger', 'Ron Weasley', 'Albus Dumbledore', 'Cedric Diggory']
  },
  {
    c: 'Personajes que integran los nueve miembros de la Comunidad del Anillo',
    f: ['Frodo Bolsón', 'Aragorn', 'Gandalf', 'Legolas'],
    m: ['Gimli', 'Sam Gamyi', 'Boromir'],
    d: ['Merry Brandigamo', 'Pippin Tuk', 'Faramir'],
    t: ['Gollum', 'Saruman', 'Elrond', 'Galadriel', 'Sauron']
  },
  {
    c: 'Personajes pertenecientes por linaje a la Casa Stark en Juego de Tronos',
    f: ['Ned Stark', 'Arya Stark', 'Sansa Stark', 'Robb Stark'],
    m: ['Bran Stark', 'Catelyn Stark', 'Rickon Stark'],
    d: ['Benjen Stark', 'Lyanna Stark', 'Brandon Stark'],
    t: ['Cersei Lannister', 'Jaime Lannister', 'Daenerys Targaryen', 'Joffrey Baratheon', 'Ramsay Bolton']
  },
  {
    c: 'Personajes pertenecientes a la Casa Lannister en Juego de Tronos',
    f: ['Tyrion Lannister', 'Cersei Lannister', 'Jaime Lannister', 'Tywin Lannister'],
    m: ['Kevan Lannister', 'Lancel Lannister', 'Genna Lannister'],
    d: ['Martyn Lannister', 'Willem Lannister', 'Tytos Lannister'],
    t: ['Ned Stark', 'Jon Snow', 'Theon Greyjoy', 'Daenerys Targaryen', 'Stannis Baratheon']
  },
  {
    c: 'Juguetes y personajes pertenecientes al universo de Toy Story (Pixar)',
    f: ['Woody', 'Buzz Lightyear', 'Mr. Potato', 'Rex'],
    m: ['Slinky', 'Hamm', 'Jessie'],
    d: ['Perdigón', 'Bo Peep', 'Lotso'],
    t: ['Shrek', 'Rayo McQueen', 'Mike Wazowski', 'Wall-E', 'Remy']
  },
  {
    c: 'Personajes de la saga de animación Shrek (DreamWorks)',
    f: ['Shrek', 'Asno', 'Princesa Fiona', 'Gato con Botas'],
    m: ['Lord Farquaad', 'Hada Madrina', 'Príncipe Encantador'],
    d: ['Jengi', 'Doris', 'Dragona'],
    t: ['Woody', 'Buzz Lightyear', 'Manny', 'Po', 'Alex el león']
  },
  {
    c: 'Princesas y protagonistas principales de los largometrajes Disney',
    f: ['Cenicienta', 'Blancanieves', 'Ariel', 'Bella'],
    m: ['Jasmine', 'Mulan', 'Pocahontas'],
    d: ['Aurora', 'Tiana', 'Rapunzel'],
    t: ['Fiona', 'Anastasia', 'Coraline', 'Megara', 'Campanilla']
  },
  {
    c: 'Lores Sith, líderes imperiales o comandantes del Lado Oscuro en Star Wars',
    f: ['Darth Vader', 'Emperador Palpatine', 'Darth Maul', 'Kylo Ren'],
    m: ['Conde Dooku', 'Gran Moff Tarkin', 'General Grievous'],
    d: ['Darth Plagueis', 'Gran Inquisidor', 'Capitana Phasma'],
    t: ['Luke Skywalker', 'Yoda', 'Obi-Wan Kenobi', 'Han Solo', 'Mace Windu']
  },
  {
    c: 'Maestros Jedi y figuras de la Orden Jedi en Star Wars',
    f: ['Luke Skywalker', 'Yoda', 'Obi-Wan Kenobi', 'Mace Windu'],
    m: ['Qui-Gon Jinn', 'Ahsoka Tano', 'Anakin Skywalker'],
    d: ['Plo Koon', 'Kit Fisto', 'Ki-Adi-Mundi'],
    t: ['Darth Vader', 'Emperador Palpatine', 'Darth Maul', 'Boba Fett', 'Kylo Ren']
  },

  // 21 - 30: Series de TV Dramáticas y de Culto
  {
    c: 'Personajes que figuran en la trama de la serie Breaking Bad',
    f: ['Walter White', 'Jesse Pinkman', 'Saul Goodman', 'Hank Schrader'],
    m: ['Gustavo Fring', 'Mike Ehrmantraut', 'Skyler White'],
    d: ['Marie Schrader', 'Walter White Jr.', 'Tuco Salamanca'],
    t: ['Tony Soprano', 'Thomas Shelby', 'Dexter Morgan', 'Jax Teller', 'Marty Byrde']
  },
  {
    c: 'Personajes que componen el reparto de Stranger Things',
    f: ['Once (Eleven)', 'Mike Wheeler', 'Dustin Henderson', 'Lucas Sinclair'],
    m: ['Will Byers', 'Jim Hopper', 'Joyce Byers'],
    d: ['Steve Harrington', 'Nancy Wheeler', 'Jonathan Byers'],
    t: ['Wednesday Addams', 'Jughead Jones', 'Otis Milburn', 'Rue Bennett', 'Klaus Hargreeves']
  },
  {
    c: 'Personajes pertenecientes a la serie Peaky Blinders',
    f: ['Thomas Shelby', 'Arthur Shelby', 'Polly Gray', 'John Shelby'],
    m: ['Ada Thorne', 'Michael Gray', 'Alfie Solomons'],
    d: ['Lizzie Stark', 'Finn Shelby', 'Grace Burgess'],
    t: ['Tony Soprano', 'Walter White', 'Don Draper', 'Ragnar Lothbrok', 'Nucky Thompson']
  },
  {
    c: 'Personajes que forman parte de la serie Los Soprano',
    f: ['Tony Soprano', 'Carmela Soprano', 'Christopher Moltisanti', 'Silvio Dante'],
    m: ['Paulie Walnuts', 'Junior Soprano', 'Dr. Jennifer Melfi'],
    d: ['Meadow Soprano', 'Anthony Soprano Jr.', 'Bobby Baccalieri'],
    t: ['Walter White', 'Thomas Shelby', 'Jimmy McNulty', 'Don Draper', 'Dexter Morgan']
  },
  {
    c: 'Superhéroes o miembros de Los Siete en la serie The Boys',
    f: ['Homelander', 'Starlight', 'Queen Maeve', 'A-Train'],
    m: ['The Deep', 'Black Noir', 'Translucent'],
    d: ['Stormfront', 'Soldier Boy', 'Lamplighter'],
    t: ['Peacemaker', 'Invincible', 'Omni-Man', 'Deadpool', 'Daredevil']
  },
  {
    c: 'Miembros de la banda del atraco en la serie La Casa de Papel',
    f: ['El Profesor', 'Tokio', 'Berlín', 'Denver'],
    m: ['Nairobi', 'Río', 'Helsinki'],
    d: ['Moscú', 'Oslo', 'Bogotá'],
    t: ['Walter White', 'Tommy Shelby', 'Ciro Di Marzio', 'Nacho Varga', 'Lalo Salamanca']
  },
  {
    c: 'Series de televisión que han obtenido el premio Emmy a Mejor Serie Dramática',
    f: ['Juego de Tronos', 'Breaking Bad', 'Succession', 'Los Soprano'],
    m: ['Mad Men', 'The Crown', 'Homeland'],
    d: ['Perdidos (Lost)', '24', 'El cuento de la criada'],
    t: ['Stranger Things', 'Peaky Blinders', 'The Walking Dead', 'Vikingos', 'Prison Break']
  },
  {
    c: 'Personajes que aparecen en la serie Dexter',
    f: ['Dexter Morgan', 'Debra Morgan', 'Rita Bennett', 'Angel Batista'],
    m: ['James Doakes', 'María LaGuerta', 'Harry Morgan'],
    d: ['Vince Masuka', 'Joey Quinn', 'Arthur Mitchell'],
    t: ['Hannibal Lecter', 'Joe Goldberg', 'Patrick Bateman', 'Norman Bates', 'Jigsaw']
  },
  {
    c: 'Personajes que forman parte del drama familiar Succession',
    f: ['Logan Roy', 'Kendall Roy', 'Shiv Roy', 'Roman Roy'],
    m: ['Tom Wambsgans', 'Greg Hirsch', 'Connor Roy'],
    d: ['Gerri Kellman', 'Frank Vernon', 'Lukas Matsson'],
    t: ['Don Draper', 'Michael Scott', 'Tony Soprano', 'Ted Mosby', 'Chuck McGill']
  },
  {
    c: 'Personajes pertenecientes a la serie The Walking Dead',
    f: ['Rick Grimes', 'Daryl Dixon', 'Glenn Rhee', 'Maggie Greene'],
    m: ['Michonne', 'Negan', 'Carol Peletier'],
    d: ['Carl Grimes', 'Hershel Greene', 'Shane Walsh'],
    t: ['Joel Miller', 'Ellie Williams', 'Tommy Miller', 'Leon S. Kennedy', 'Arthur Morgan']
  },

  // 31 - 40: Grandes Actores, Directores y Premios
  {
    c: 'Largometrajes dirigidos por el cineasta Christopher Nolan',
    f: ['Origen', 'Interstellar', 'Oppenheimer', 'El Caballero Oscuro'],
    m: ['Dunkerque', 'Memento', 'Tenet'],
    d: ['Following', 'Insomnio', 'El Truco Final'],
    t: ['Shutter Island', 'Seven', 'Zodiac', 'Gravity', 'Blade Runner 2049']
  },
  {
    c: 'Largometrajes dirigidos por el cineasta Quentin Tarantino',
    f: ['Pulp Fiction', 'Kill Bill: Vol. 1', 'Malditos Bastardos', 'Django Desencadenado'],
    m: ['Reservoir Dogs', 'Érase una vez en Hollywood', 'Los Odiosos Ocho'],
    d: ['Jackie Brown', 'Death Proof', 'Kill Bill: Vol. 2'],
    t: ['El Lobo de Wall Street', 'Snatch', 'Taxi Driver', 'Scarface', 'Casino']
  },
  {
    c: 'Largometrajes dirigidos por el cineasta Steven Spielberg',
    f: ['Parque Jurásico', 'Tiburón', 'E.T., el extraterrestre', 'La lista de Schindler'],
    m: ['Salvar al soldado Ryan', 'Atrápame si puedes', 'Ready Player One'],
    d: ['El puente de los espías', 'Minority Report', 'War Horse'],
    t: ['Avatar', 'Regreso al futuro', 'Alien', 'Blade Runner', 'Interstellar']
  },
  {
    c: 'Largometrajes dirigidos por el cineasta Martin Scorsese',
    f: ['Taxi Driver', 'Uno de los nuestros', 'El lobo de Wall Street', 'Infiltrados'],
    m: ['Casino', 'Toro Salvaje', 'Shutter Island'],
    d: ['El irlandés', 'Los asesinos de la luna', 'La edad de la inocencia'],
    t: ['El Padrino', 'Scarface', 'Pulp Fiction', 'Heat', 'Carlito\'s Way']
  },
  {
    c: 'Actores que han encarnado a James Bond en la franquicia oficial (Eon)',
    f: ['Sean Connery', 'Pierce Brosnan', 'Daniel Craig', 'Roger Moore'],
    m: ['Timothy Dalton', 'George Lazenby', 'David Niven'],
    d: ['Barry Nelson', 'Bob Holness', 'Michael Jayston'],
    t: ['Hugh Jackman', 'Clive Owen', 'Tom Hiddleston', 'Henry Cavill', 'Idris Elba']
  },
  {
    c: 'Actores que han interpretado a Batman en producciones cinematográficas en imagen real',
    f: ['Christian Bale', 'Ben Affleck', 'Robert Pattinson', 'Michael Keaton'],
    m: ['George Clooney', 'Val Kilmer', 'Adam West'],
    d: ['Lewis Wilson', 'Robert Lowery', 'Kevin Conroy'],
    t: ['Cillian Murphy', 'Tom Hardy', 'Heath Ledger', 'Joaquin Phoenix', 'Jake Gyllenhaal']
  },
  {
    c: 'Actores que han interpretado al Joker en cine o televisión en imagen real',
    f: ['Heath Ledger', 'Joaquin Phoenix', 'Jack Nicholson', 'Jared Leto'],
    m: ['Cesar Romero', 'Cameron Monaghan', 'Barry Keoghan'],
    d: ['Mark Hamill', 'Troy Baker', 'Kevin Michael Richardson'],
    t: ['Christian Bale', 'Willem Dafoe', 'Jim Carrey', 'Paul Dano', 'Colin Farrell']
  },
  {
    c: 'Actores galardonados con el premio Oscar a Mejor Actor Principal',
    f: ['Leonardo DiCaprio', 'Joaquin Phoenix', 'Cillian Murphy', 'Will Smith'],
    m: ['Anthony Hopkins', 'Matthew McConaughey', 'Rami Malek'],
    d: ['Adrien Brody', 'Casey Affleck', 'Gary Oldman'],
    t: ['Brad Pitt', 'Tom Cruise', 'Johnny Depp', 'Harrison Ford', 'Christian Bale']
  },
  {
    c: 'Actrices galardonadas con el premio Oscar a Mejor Actriz Principal',
    f: ['Meryl Streep', 'Emma Stone', 'Natalie Portman', 'Cate Blanchett'],
    m: ['Jennifer Lawrence', 'Sandra Bullock', 'Michelle Yeoh'],
    d: ['Jessica Chastain', 'Olivia Colman', 'Brie Larson'],
    t: ['Scarlett Johansson', 'Amy Adams', 'Margot Robbie', 'Helena Bonham Carter', 'Anne Hathaway']
  },
  {
    c: 'Actores con papeles destacados en la franquicia Misión Imposible',
    f: ['Tom Cruise', 'Ving Rhames', 'Simon Pegg', 'Rebecca Ferguson'],
    m: ['Jeremy Renner', 'Henry Cavill', 'Vanessa Kirby'],
    d: ['Jean Reno', 'Jon Voight', 'Philip Seymour Hoffman'],
    t: ['Brad Pitt', 'Matt Damon', 'Leonardo DiCaprio', 'Keanu Reeves', 'Will Smith']
  },

  // 41 - 50: Música Pop, Estrellas Globales y Super Bowl
  {
    c: 'Artistas musicales que han liderado el intermedio de la Super Bowl en solitario o copresentación',
    f: ['Michael Jackson', 'Shakira', 'Rihanna', 'Eminem'],
    m: ['The Weeknd', 'Katy Perry', 'Bruno Mars'],
    d: ['Lady Gaga', 'Coldplay', 'Usher'],
    t: ['Taylor Swift', 'Drake', 'Adele', 'Ed Sheeran', 'Dua Lipa']
  },
  {
    c: 'Celebridades y figuras públicas con más de 200 millones de seguidores en Instagram',
    f: ['Cristiano Ronaldo', 'Lionel Messi', 'Selena Gomez', 'Kylie Jenner'],
    m: ['Dwayne Johnson', 'Ariana Grande', 'Kim Kardashian'],
    d: ['Beyoncé', 'Khloé Kardashian', 'Justin Bieber'],
    t: ['Fernando Alonso', 'Ibai Llanos', 'Rafael Nadal', 'Auronplay', 'El Rubius']
  },
  {
    c: 'Miembros de la familia Kardashian-Jenner protagonistas del reality show familiar',
    f: ['Kim Kardashian', 'Kylie Jenner', 'Kendall Jenner', 'Kourtney Kardashian'],
    m: ['Khloé Kardashian', 'Kris Jenner', 'Caitlyn Jenner'],
    d: ['Rob Kardashian', 'North West', 'Stormi Webster'],
    t: ['Paris Hilton', 'Hailey Bieber', 'Bella Hadid', 'Gigi Hadid', 'Britney Spears']
  },
  {
    c: 'Músicos que integraron la alineación de The Beatles en sus distintas etapas',
    f: ['John Lennon', 'Paul McCartney', 'George Harrison', 'Ringo Starr'],
    m: ['Pete Best', 'Stuart Sutcliffe', 'Brian Epstein'],
    d: ['George Martin', 'Jimmie Nicol', 'Tony Sheridan'],
    t: ['Mick Jagger', 'Keith Richards', 'Freddie Mercury', 'Eric Clapton', 'Roger Waters']
  },
  {
    c: 'Músicos y vocalistas asociados históricamente a la banda de rock Queen',
    f: ['Freddie Mercury', 'Brian May', 'Roger Taylor', 'John Deacon'],
    m: ['Mike Grose', 'Barry Mitchell', 'Doug Bogie'],
    d: ['Paul Rodgers', 'Adam Lambert', 'Spike Edney'],
    t: ['Mick Jagger', 'Robert Plant', 'Axl Rose', 'David Bowie', 'Elton John']
  },
  {
    c: 'Cantantes femeninas en el top de premios Grammy conseguidos en la historia',
    f: ['Beyoncé', 'Taylor Swift', 'Adele', 'Aretha Franklin'],
    m: ['Alicia Keys', 'Lady Gaga', 'Billie Eilish'],
    d: ['Alison Krauss', 'Ella Fitzgerald', 'Barbra Streisand'],
    t: ['Katy Perry', 'Nicki Minaj', 'Jennifer Lopez', 'Avril Lavigne', 'Miley Cyrus']
  },
  {
    c: 'Integrantes oficiales de la banda británica One Direction',
    f: ['Harry Styles', 'Zayn Malik', 'Niall Horan', 'Louis Tomlinson'],
    m: ['Liam Payne', 'Simon Cowell', 'Dan Richards'],
    d: ['Josh Devine', 'Jon Shave', 'Julian Bunetta'],
    t: ['Justin Bieber', 'Shawn Mendes', 'Nick Jonas', 'Joe Jonas', 'Robbie Williams']
  },
  {
    c: 'Artistas con temas propios grabados en las BZRP Music Sessions',
    f: ['Quevedo', 'Shakira', 'Nathy Peluso', 'Residente'],
    m: ['Villano Antillano', 'Duki', 'Nicki Nicole'],
    d: ['Snow Tha Product', 'Tiago PZK', 'Milo J'],
    t: ['Bad Bunny', 'Rosalía', 'J Balvin', 'Maluma', 'Karol G']
  },
  {
    c: 'Exponentes reconocidos de la música urbana latina y el reggaetón',
    f: ['Bad Bunny', 'Daddy Yankee', 'J Balvin', 'Karol G'],
    m: ['Rauw Alejandro', 'Maluma', 'Ozuna'],
    d: ['Don Omar', 'Feid', 'Anuel AA'],
    t: ['Pablo Alborán', 'Alejandro Sanz', 'Enrique Iglesias', 'David Bisbal', 'Ricky Martin']
  },
  {
    c: 'Estrellas consagradas del pop internacional durante los 90 y los 2000',
    f: ['Britney Spears', 'Madonna', 'Christina Aguilera', 'Beyoncé'],
    m: ['Shakira', 'Jennifer Lopez', 'Rihanna'],
    d: ['Gwen Stefani', 'Kylie Minogue', 'Avril Lavigne'],
    t: ['Dua Lipa', 'Billie Eilish', 'Olivia Rodrigo', 'Sabrina Carpenter', 'Camila Cabello']
  },

  // 51 - 60: Anime, Manga y Animación Japonesa
  {
    c: 'Personajes que forman parte de la serie de anime Dragon Ball Z',
    f: ['Goku', 'Vegeta', 'Gohan', 'Piccolo'],
    m: ['Freezer', 'Célula (Cell)', 'Majin Buu'],
    d: ['Trunks', 'Krilin', 'Tenshinhan'],
    t: ['Naruto Uzumaki', 'Monkey D. Luffy', 'Sasuke Uchiha', 'Ichigo Kurosaki', 'Tanjiro Kamado']
  },
  {
    c: 'Piratas miembros de la tripulación de los Sombrero de Paja en One Piece',
    f: ['Monkey D. Luffy', 'Roronoa Zoro', 'Nami', 'Sanji'],
    m: ['Usopp', 'Tony Tony Chopper', 'Nico Robin'],
    d: ['Franky', 'Brook', 'Jinbe'],
    t: ['Portgas D. Ace', 'Trafalgar Law', 'Shanks', 'Buggy el Payaso', 'Gol D. Roger']
  },
  {
    c: 'Personajes habituales en la trama del anime Naruto',
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
    c: 'Largometrajes de animación del catálogo de Studio Ghibli',
    f: ['El viaje de Chihiro', 'Mi vecino Totoro', 'La princesa Mononoke', 'El castillo ambulante'],
    m: ['La tumba de las luciérnagas', 'Ponyo en el acantilado', 'Nicky, la aprendiz de bruja'],
    d: ['Porco Rosso', 'El viento se levanta', 'El cuento de la princesa Kaguya'],
    t: ['Your Name', 'Akira', 'A Silent Voice', 'El tiempo contigo', 'Ghost in the Shell']
  },
  {
    c: 'Personajes con rol destacado en el anime Death Note',
    f: ['Light Yagami', 'L Lawliet', 'Ryuk', 'Misa Amane'],
    m: ['Near', 'Mello', 'Soichiro Yagami'],
    d: ['Teru Mikami', 'Rem', 'Touta Matsuda'],
    t: ['Lelouch Lamperouge', 'Edward Elric', 'Levi Ackerman', 'Spike Spiegel', 'Roy Mustang']
  },
  {
    c: 'Personajes del anime Kimetsu no Yaiba (Demon Slayer)',
    f: ['Tanjiro Kamado', 'Nezuko Kamado', 'Zenitsu Agatsuma', 'Inosuke Hashibira'],
    m: ['Giyu Tomioka', 'Muzan Kibutsuji', 'Kyojuro Rengoku'],
    d: ['Shinobu Kocho', 'Akaza', 'Kanao Tsuyuri'],
    t: ['Naruto Uzumaki', 'Edward Elric', 'Satoru Gojo', 'Yuji Itadori', 'Megumi Fushiguro']
  },
  {
    c: 'Personajes de la serie Jujutsu Kaisen',
    f: ['Satoru Gojo', 'Yuji Itadori', 'Megumi Fushiguro', 'Ryomen Sukuna'],
    m: ['Nobara Kugisaki', 'Kento Nanami', 'Suguru Geto'],
    d: ['Aoi Todo', 'Maki Zenin', 'Yuta Okkotsu'],
    t: ['Tanjiro Kamado', 'Nezuko Kamado', 'Levi Ackerman', 'Eren Jaeger', 'Kakashi Hatake']
  },
  {
    c: 'Compañeros de viaje de Ash Ketchum en el anime Pokémon',
    f: ['Misty', 'Brock', 'Aura (May)', 'Maya (Dawn)'],
    m: ['Serena', 'Lem (Clemont)', 'Kira'],
    d: ['Tracey Sketchit', 'Iris', 'Millo (Cilan)'],
    t: ['Jessie', 'James', 'Giovanni', 'Profesor Oak', 'Gary Oak']
  },
  {
    c: 'Antagonistas y villanos reconocibles del anime japonés',
    f: ['Freezer', 'Madara Uchiha', 'Muzan Kibutsuji', 'Light Yagami'],
    m: ['Griffith', 'Sosuke Aizen', 'Cell'],
    d: ['Meruem', 'Dio Brando', 'Donquixote Doflamingo'],
    t: ['Goku', 'Naruto Uzumaki', 'Levi Ackerman', 'Luffy', 'Edward Elric']
  },

  // 61 - 70: Videojuegos y Cultura Gamer
  {
    c: 'Personajes y mascotas originarias de franquicias de Nintendo',
    f: ['Mario', 'Link', 'Donkey Kong', 'Kirby'],
    m: ['Samus Aran', 'Fox McCloud', 'Yoshi'],
    d: ['Captain Falcon', 'Ness', 'Pit'],
    t: ['Sonic the Hedgehog', 'Crash Bandicoot', 'Kratos', 'Master Chief', 'Lara Croft']
  },
  {
    c: 'Criaturas de la región de Kanto en Pokémon (Primera Generación)',
    f: ['Pikachu', 'Charizard', 'Mewtwo', 'Bulbasaur'],
    m: ['Squirtle', 'Snorlax', 'Gengar'],
    d: ['Dragonite', 'Eevee', 'Mew'],
    t: ['Lucario', 'Greninja', 'Zacian', 'Rayquaza', 'Lugia']
  },
  {
    c: 'Creadores de contenido y streamers de habla hispana en Twitch/YouTube',
    f: ['Ibai Llanos', 'Auronplay', 'El Rubius', 'TheGrefg'],
    m: ['IlloJuan', 'DjMaRiiO', 'ElMariana'],
    d: ['Rivers GG', 'Vegetta777', 'Knekro'],
    t: ['MrBeast', 'PewDiePie', 'Ninja', 'Kai Cenat', 'xQc']
  },
  {
    c: 'Creadores de contenido anglosajones de YouTube o Twitch',
    f: ['MrBeast', 'PewDiePie', 'Ninja', 'Kai Cenat'],
    m: ['xQc', 'IShowSpeed', 'Markiplier'],
    d: ['Jacksepticeye', 'Pokimane', 'Shroud'],
    t: ['Ibai Llanos', 'Auronplay', 'El Rubius', 'TheGrefg', 'IlloJuan']
  },
  {
    c: 'Videojuegos galardonados con el premio al Juego del Año (GOTY en The Game Awards)',
    f: ['The Witcher 3: Wild Hunt', 'The Legend of Zelda: Breath of the Wild', 'God of War (2018)', 'Elden Ring'],
    m: ['Sekiro: Shadows Die Twice', 'The Last of Us Part II', 'Baldur\'s Gate 3'],
    d: ['Dragon Age: Inquisition', 'Overwatch', 'It Takes Two'],
    t: ['Red Dead Redemption 2', 'Marvel\'s Spider-Man', 'Cyberpunk 2077', 'Bloodborne', 'Super Mario Odyssey']
  },
  {
    c: 'Franquicias de videojuegos exclusivas o históricamente publicadas por Sony PlayStation',
    f: ['God of War', 'The Last of Us', 'Uncharted', 'Gran Turismo'],
    m: ['Ratchet & Clank', 'Bloodborne', 'Horizon Zero Dawn'],
    d: ['Ghost of Tsushima', 'Killzone', 'InFamous'],
    t: ['Halo', 'Gears of War', 'Forza Horizon', 'Super Mario', 'Starfield']
  },
  {
    c: 'Franquicias de videojuegos exclusivas o abanderadas de Microsoft Xbox',
    f: ['Halo', 'Gears of War', 'Forza Horizon', 'Fable'],
    m: ['Forza Motorsport', 'Sea of Thieves', 'State of Decay'],
    d: ['Crackdown', 'Perfect Dark', 'Killer Instinct'],
    t: ['God of War', 'Uncharted', 'The Last of Us', 'Gran Turismo', 'Killzone']
  },
  {
    c: 'Protagonistas jugables de la franquicia Grand Theft Auto (GTA)',
    f: ['Michael De Santa', 'Franklin Clinton', 'Trevor Philips', 'Carl Johnson (CJ)'],
    m: ['Tommy Vercetti', 'Niko Bellic', 'Claude'],
    d: ['Luis Fernando Lopez', 'Johnny Klebitz', 'Toni Cipriani'],
    t: ['Arthur Morgan', 'John Marston', 'Max Payne', 'Cole Phelps', 'Jimmy Hopkins']
  },
  {
    c: 'Videojuegos multijugador consolidados como deportes electrónicos (Esports)',
    f: ['League of Legends', 'Counter-Strike', 'Valorant', 'Dota 2'],
    m: ['Rocket League', 'Rainbow Six Siege', 'Overwatch'],
    d: ['StarCraft II', 'Apex Legends', 'Super Smash Bros. Melee'],
    t: ['God of War', 'The Last of Us', 'The Witcher 3', 'Red Dead Redemption 2', 'Elden Ring']
  },
  {
    c: 'Entidades y criaturas (mobs) nativas del videojuego Minecraft',
    f: ['Creeper', 'Zombi', 'Esqueleto', 'Enderman'],
    m: ['Aldeano', 'Araña', 'Piglin'],
    d: ['Ghast', 'Wither', 'Warden'],
    t: ['Goomba', 'Koopa Troopa', 'Chocobo', 'Bokoblin', 'Slime de Dragon Quest']
  },

  // 71 - 80: Televisión Española y Fenómenos Culturales
  {
    c: 'Personajes pertenecientes a la serie Aquí no hay quien viva (ANHQV)',
    f: ['Emilio Delgado', 'Juan Cuesta', 'Marisa Benito', 'Vicenta Benito'],
    m: ['Mauri Hidalgo', 'Concha de la Fuente', 'Mariano Delgado'],
    d: ['Belén López', 'Paloma Hurtado', 'Andrés Guerra'],
    t: ['Antonio Recio', 'Amador Rivas', 'Coque Calatrava', 'Enrique Pastor', 'Fermín Trujillo']
  },
  {
    c: 'Personajes pertenecientes a la serie La que se avecina (LQSA)',
    f: ['Antonio Recio', 'Amador Rivas', 'Enrique Pastor', 'Coque Calatrava'],
    m: ['Fermín Trujillo', 'Berta Escobar', 'Maite Figueroa'],
    d: ['Lola Trujillo', 'Menchu Carrascosa', 'Vicente Maroto'],
    t: ['Emilio Delgado', 'Juan Cuesta', 'Paloma Hurtado', 'Marisa Benito', 'Mauri Hidalgo']
  },
  {
    c: 'Presentadores habituales de la televisión en España',
    f: ['Pablo Motos', 'Jorge Javier Vázquez', 'Carlos Sobera', 'Roberto Leal'],
    m: ['Arturo Valls', 'Jesús Vázquez', 'Andreu Buenafuente'],
    d: ['David Broncano', 'Risto Mejide', 'Jordi Évole'],
    t: ['Fernando Alonso', 'Ibai Llanos', 'Rafael Nadal', 'Gerard Piqué', 'Alejandro Sanz']
  },
  {
    c: 'Artistas que han ejercido como coaches en las ediciones de La Voz en España',
    f: ['David Bisbal', 'Melendi', 'Malú', 'Alejandro Sanz'],
    m: ['Rosario Flores', 'Luis Fonsi', 'Antonio Orozco'],
    d: ['Pablo Alborán', 'Laura Pausini', 'Manuel Carrasco'],
    t: ['Julio Iglesias', 'Enrique Iglesias', 'Rosalía', 'C. Tangana', 'Bad Bunny']
  },
  {
    c: 'Concursantes surgidos de las diferentes ediciones de Operación Triunfo en España',
    f: ['David Bisbal', 'Aitana', 'David Bustamante', 'Chenoa'],
    m: ['Manuel Carrasco', 'Rosa López', 'Amaia Romero'],
    d: ['Lola Índigo', 'Soraya Arnelas', 'Edurne'],
    t: ['Melendi', 'Pablo Alborán', 'Alejandro Sanz', 'Rosalía', 'Malú']
  },
  {
    c: 'Series de ficción producidas y emitidas originariamente en España',
    f: ['Cuéntame cómo pasó', 'Los Serrano', 'Aquí no hay quien viva', 'Médico de familia'],
    m: ['Farmacia de guardia', 'Aída', 'El Barco'],
    d: ['Compañeros', 'Al salir de clase', 'Periodistas'],
    t: ['Juego de Tronos', 'Breaking Bad', 'Friends', 'The Office', 'Peaky Blinders']
  },
  {
    c: 'Producciones que han obtenido el premio Goya a la Mejor Película',
    f: ['Todo sobre mi madre', 'Mar adentro', 'La isla mínima', 'Campeones'],
    m: ['Tesis', 'Celda 211', 'Dolor y gloria'],
    d: ['As bestas', 'La sociedad de la nieve', 'El bola'],
    t: ['Ocho apellidos vascos', 'Torrente', 'El día de la bestia', 'Lo imposible', 'Relatos salvajes']
  },
  {
    c: 'Cómicos y figuras del humor en la historia de España',
    f: ['Chiquito de la Calzada', 'Eugenio', 'José Mota', 'Gila'],
    m: ['Millán Salcedo', 'Juan Muñoz', 'Paco León'],
    d: ['Javier Cansado', 'Berto Romero', 'Joaquín Reyes'],
    t: ['Pedro Almodóvar', 'Antonio Banderas', 'Javier Bardem', 'Penélope Cruz', 'Luis Buñuel']
  },
  {
    c: 'Actores y profesionales del cine español nominados o premiados en los Oscar',
    f: ['Javier Bardem', 'Penélope Cruz', 'Antonio Banderas', 'Paco Delgado'],
    m: ['Alberto Iglesias', 'Pedro Almodóvar', 'José Luis Garci'],
    d: ['Javier Navarrete', 'David Martí', 'Montse Ribé'],
    t: ['Mario Casas', 'Dani Rovira', 'Hugo Silva', 'Santiago Segura', 'Blanca Suárez']
  },
  {
    c: 'Festivales de música de gran formato que se organizan en España',
    f: ['Mad Cool', 'Primavera Sound', 'Viña Rock', 'Arenal Sound'],
    m: ['Bilbao BBK Live', 'FIB Benicàssim', 'Resurrection Fest'],
    d: ['Rototom Sunsplash', 'Sonorama Ribera', 'Sónar'],
    t: ['Coachella', 'Tomorrowland', 'Glastonbury', 'Lollapalooza', 'Rock in Rio']
  },

  // 81 - 90: Clásicos del Cine, Terror y Sagas Taquilleras
  {
    c: 'Títulos referentes de la historia del cine de terror y suspense',
    f: ['El exorcista', 'El resplandor', 'Psicosis', 'La noche de Halloween'],
    m: ['La matanza de Texas', 'Pesadilla en Elm Street', 'Alien, el octavo pasajero'],
    d: ['La semilla del diablo', 'Suspiria', 'La noche de los muertos vivientes'],
    t: ['Seven', 'El silencio de los corderos', 'Zodiac', 'El sexto sentido', 'Shutter Island']
  },
  {
    c: 'Monstruos y asesinos antagonistas del subgénero de terror slasher',
    f: ['Freddy Krueger', 'Jason Voorhees', 'Michael Myers', 'Ghostface'],
    m: ['Leatherface', 'Chucky', 'Pinhead'],
    d: ['Pennywise', 'Jigsaw', 'Candyman'],
    t: ['Hannibal Lecter', 'Norman Bates', 'Patrick Bateman', 'Darth Vader', 'Voldemort']
  },
  {
    c: 'Películas con una recaudación superior a los 1.500 millones de dólares en taquilla',
    f: ['Avatar', 'Vengadores: Endgame', 'Titanic', 'Star Wars: El despertar de la Fuerza'],
    m: ['Vengadores: Infinity War', 'Spider-Man: No Way Home', 'Jurassic World'],
    d: ['El Rey León (2019)', 'Los Vengadores (2012)', 'Fast & Furious 7'],
    t: ['Harry Potter y la piedra filosofal', 'Frozen', 'Joker', 'Oppenheimer', 'Barbie']
  },
  {
    c: 'Películas pertenecientes a la franquicia de acción Fast & Furious',
    f: ['A todo gas (2001)', '2 Fast 2 Furious', 'Fast & Furious 5', 'Fast & Furious 7'],
    m: ['Tokyo Drift', 'Fast & Furious 6', 'The Fate of the Furious'],
    d: ['F9', 'Fast X', 'Hobbs & Shaw'],
    t: ['Need for Speed', 'Drive', 'Baby Driver', 'Taxi', 'Death Race']
  },
  {
    c: 'Largometrajes de ciencia ficción reconocidos con varios premios Oscar',
    f: ['Origen', 'Interstellar', 'Matrix', 'Gravity'],
    m: ['Mad Max: Furia en la carretera', 'Dune (2021)', 'Avatar'],
    d: ['Terminator 2: El juicio final', 'Alien, el octavo pasajero', '2001: Una odisea del espacio'],
    t: ['Armageddon', 'Transformers', 'El núcleo', 'Independence Day 2', 'Godzilla']
  },
  {
    c: 'Personajes pertenecientes a la familia o allegados directos en la saga El Padrino',
    f: ['Vito Corleone', 'Michael Corleone', 'Sonny Corleone', 'Fredo Corleone'],
    m: ['Connie Corleone', 'Tom Hagen', 'Kay Adams'],
    d: ['Carmela Corleone', 'Vincent Mancini', 'Apollonia Vitelli'],
    t: ['Tony Montana', 'Henry Hill', 'Tommy DeVito', 'Jimmy Conway', 'Nicky Santoro']
  },
  {
    c: 'Películas galardonadas con el Oscar a Mejor Película de Animación',
    f: ['Shrek', 'Buscando a Nemo', 'Up', 'Coco'],
    m: ['El viaje de Chihiro', 'Spider-Man: Un nuevo universo', 'Ratatouille'],
    d: ['Pinocho de Guillermo del Toro', 'Rango', 'Wallace & Gromit: La maldición de las verduras'],
    t: ['El rey león (1994)', 'Aladdín', 'La bella y la bestia', 'Toy Story (1995)', 'Pesadilla antes de Navidad']
  },
  {
    c: 'Criaturas gigantes catalogadas como Kaijus en el cine',
    f: ['Godzilla', 'King Kong', 'Mothra', 'King Ghidorah'],
    m: ['Rodan', 'Gamera', 'Mechagodzilla'],
    d: ['Destoroyah', 'Cloverfield', 'Anguirus'],
    t: ['Cthulhu', 'Kraken', 'Leviatán', 'Megalodón', 'Smaug']
  },
  {
    c: 'Actores que han puesto voz o cuerpo a Peter Parker / Spiderman en cine',
    f: ['Tobey Maguire', 'Andrew Garfield', 'Tom Holland', 'Shameik Moore'],
    m: ['Jake Johnson', 'Nicolas Cage', 'Chris Pine'],
    d: ['Yuri Lowenthal', 'Drake Bell', 'Neil Patrick Harris'],
    t: ['Tom Hardy', 'Willem Dafoe', 'Michael B. Jordan', 'Aaron Taylor-Johnson', 'Miles Teller']
  },
  {
    c: 'Títulos de películas pertenecientes al Universo Cinematográfico de Marvel (UCM)',
    f: ['Iron Man', 'Los Vengadores', 'Black Panther', 'Thor: Ragnarok'],
    m: ['Guardianes de la Galaxia', 'Doctor Strange', 'Capitana Marvel'],
    d: ['Ant-Man', 'Capitán América: El soldado de invierno', 'El increíble Hulk'],
    t: ['Venom', 'Morbius', 'The Batman', 'Logan', 'X-Men: Días del futuro pasado']
  },

  // 91 - 100: Cultura de Internet, Memes y Marcas Globales
  {
    c: 'Marcas especializadas en calzado y equipamiento deportivo',
    f: ['Nike', 'Adidas', 'Puma', 'Jordan'],
    m: ['Reebok', 'New Balance', 'Under Armour'],
    d: ['Vans', 'Converse', 'ASICS'],
    t: ['Gucci', 'Zara', 'Louis Vuitton', 'Balenciaga', 'Rolex']
  },
  {
    c: 'Firmas de alta costura y moda de lujo internacional',
    f: ['Gucci', 'Prada', 'Chanel', 'Louis Vuitton'],
    m: ['Balenciaga', 'Dior', 'Versace'],
    d: ['Yves Saint Laurent', 'Hermès', 'Burberry'],
    t: ['Nike', 'Zara', 'H&M', 'Primark', 'Decathlon']
  },
  {
    c: 'Plataformas sociales activas con gran volumen de usuarios a nivel mundial',
    f: ['Instagram', 'TikTok', 'WhatsApp', 'YouTube'],
    m: ['Facebook', 'Telegram', 'Snapchat'],
    d: ['Pinterest', 'X (Twitter)', 'Reddit'],
    t: ['Tuenti', 'Vine', 'MySpace', 'Google+', 'Clubhouse']
  },
  {
    c: 'Mascotas y personajes insignia de la historia de los videojuegos',
    f: ['Mario', 'Sonic the Hedgehog', 'Pikachu', 'Crash Bandicoot'],
    m: ['Spyro', 'Pac-Man', 'Mega Man'],
    d: ['Rayman', 'Sackboy', 'Klonoa'],
    t: ['Mickey Mouse', 'Bugs Bunny', 'Homer Simpson', 'Bob Esponja', 'Shrek']
  },
  {
    c: 'Personajes protagonistas de series de animación orientadas al público adulto',
    f: ['Peter Griffin', 'Homer Simpson', 'Rick Sanchez', 'Eric Cartman'],
    m: ['Bender', 'Stan Smith', 'BoJack Horseman'],
    d: ['Sterling Archer', 'Randy Marsh', 'Morty Smith'],
    t: ['Mickey Mouse', 'Bob Esponja', 'Phineas Flynn', 'Steven Universe', 'Finn el humano']
  },
  {
    c: 'Formatos y memes que se volvieron virales en la historia de la web',
    f: ['Rickroll', 'Doge', 'Gangnam Style', 'Nyan Cat'],
    m: ['Novio distraído', 'Pepe the Frog', 'Harlem Shake'],
    d: ['Disaster Girl', 'Hide the Pain Harold', 'Grumpy Cat'],
    t: ['La Gioconda', 'El grito', 'Guernica', 'La noche estrellada', 'Las Meninas']
  },
  {
    c: 'Series de anime clásico emitidas con gran seguimiento en España durante los 80/90',
    f: ['Dragon Ball', 'Captain Tsubasa (Oliver y Benji)', 'Caballeros del Zodiaco', 'Sailor Moon'],
    m: ['Shin-chan', 'Doraemon', 'Ranma 1/2'],
    d: ['Mazinger Z', 'Heidi', 'Marco'],
    t: ['Los Simpson', 'Padre de familia', 'Futurama', 'South Park', 'Rugrats']
  },
  {
    c: 'Canciones en lengua española que alcanzaron hitos de mil millones de reproducciones en plataformas',
    f: ['Despacito', 'Bzrp Music Sessions #52', 'Dákiti', 'Bailando'],
    m: ['Mi Gente', 'Tusa', 'Hawái'],
    d: ['La Bachata', 'Todo de Ti', 'Chantaje'],
    t: ['La Macarena', 'La raja de tu falda', 'Zapatillas', 'Ave María', 'Soldadito marinero']
  },
  {
    c: 'Grupos e intérpretes de gran proyección dentro de la industria del K-Pop',
    f: ['BTS', 'Blackpink', 'PSY', 'TWICE'],
    m: ['Stray Kids', 'EXO', 'NewJeans'],
    d: ['Seventeen', 'Red Velvet', 'Big Bang'],
    t: ['One Direction', 'Backstreet Boys', 'Jonas Brothers', 'Coldplay', 'Maroon 5']
  },
  {
    c: 'Personajes con protagonismo en JoJo\'s Bizarre Adventure',
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