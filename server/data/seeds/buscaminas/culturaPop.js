export default Array.from({ length: 20 }, (_, idx) => {
  const plantillas = [
    {
      c: 'Actores que han formado parte del elenco de la saga Vengadores (Marvel)',
      f: ['Robert Downey Jr.', 'Chris Evans', 'Chris Hemsworth', 'Scarlett Johansson'],
      m: ['Mark Ruffalo', 'Jeremy Renner', 'Tom Hiddleston'],
      d: ['Paul Rudd', 'Benedict Cumberbatch', 'Chadwick Boseman'],
      t: ['Christian Bale', 'Henry Cavill', 'Ben Affleck', 'Hugh Jackman', 'Ryan Reynolds']
    },
    {
      c: 'Personajes protagonistas de series de comedia estadounidenses',
      f: ['Michael Scott (The Office)', 'Sheldon Cooper (TBBT)', 'Ross Geller (Friends)', 'Ted Mosby (HIMYM)'],
      m: ['Jake Peralta (B99)', 'Phil Dunphy (Modern Family)', 'Barney Stinson (HIMYM)'],
      d: ['Dwight Schrute (The Office)', 'Chandler Bing (Friends)', 'Eleanor Shellstrop (The Good Place)'],
      t: ['Walter White', 'Thomas Shelby', 'Tony Soprano', 'Jon Snow', 'Dexter Morgan']
    },
    {
      c: 'Superhéroes pertenecientes a DC Comics',
      f: ['Batman', 'Superman', 'Wonder Woman', 'The Flash'],
      m: ['Aquaman', 'Green Lantern (Linterna Verde)', 'Joker (personaje)'],
      d: ['Robin (Dick Grayson)', 'Cyborg', 'Shazam'],
      t: ['Spider-Man', 'Iron Man', 'Thor', 'Capitán América', 'Hulk']
    },
    {
      c: 'Superhéroes pertenecientes a Marvel Comics',
      f: ['Spider-Man', 'Iron Man', 'Capitán América', 'Thor'],
      m: ['Hulk', 'Black Widow', 'Wolverine (Lobezno)'],
      d: ['Daredevil', 'Hawkeye (Ojo de Halcón)', 'Deadpool'],
      t: ['Batman', 'Superman', 'Wonder Woman', 'The Flash', 'Aquaman']
    },
    {
      c: 'Celebridades con más de 200 millones de seguidores en Instagram',
      f: ['Cristiano Ronaldo', 'Lionel Messi', 'Selena Gomez', 'Kylie Jenner'],
      m: ['Dwayne Johnson (The Rock)', 'Ariana Grande', 'Kim Kardashian'],
      d: ['Beyoncé', 'Khloé Kardashian', 'Justin Bieber'],
      t: ['Fernando Alonso', 'Ibai Llanos', 'Rafael Nadal', 'Auronplay', 'El Rubius']
    },
    {
      c: 'Creadores de contenido y streamers de habla hispana en Twitch/YouTube',
      f: ['Ibai Llanos', 'Auronplay', 'El Rubius', 'TheGrefg'],
      m: ['IlloJuan', 'DjMaRiiO', 'ElMariana'],
      d: ['Rivers GG', 'Vegetta777', 'Knekro'],
      t: ['MrBeast', 'PewDiePie', 'Ninja', 'Kai Cenat', 'xQc']
    },
    {
      c: 'Personajes de la saga Harry Potter pertenecientes a la casa Gryffindor',
      f: ['Harry Potter', 'Hermione Granger', 'Ron Weasley', 'Albus Dumbledore'],
      m: ['Sirius Black', 'Remus Lupin', 'Neville Longbottom'],
      d: ['Minerva McGonagall', 'Ginny Weasley', 'Fred Weasley'],
      t: ['Draco Malfoy', 'Severus Snape', 'Lord Voldemort', 'Bellatrix Lestrange', 'Luna Lovegood']
    },
    {
      c: 'Personajes ficticios de la factoría Disney (excluyendo Pixar)',
      f: ['Mickey Mouse', 'Pato Donald', 'Simba', 'Aladdín'],
      m: ['Goofy', 'Mulan', 'Peter Pan'],
      d: ['Campanilla', 'Pocahontas', 'Hércules'],
      t: ['Woody', 'Buzz Lightyear', 'Shrek', 'Rayo McQueen', 'Wall-E']
    },
    {
      c: 'Celebridades pertenecientes al clan Kardashian-Jenner',
      f: ['Kim Kardashian', 'Kylie Jenner', 'Kendall Jenner', 'Kourtney Kardashian'],
      m: ['Khloé Kardashian', 'Kris Jenner', 'Caitlyn Jenner'],
      d: ['Rob Kardashian', 'North West', 'Stormi Webster'],
      t: ['Paris Hilton', 'Hailey Bieber', 'Bella Hadid', 'Gigi Hadid', 'Britney Spears']
    },
    {
      c: 'Personajes principales de la serie Los Simpson',
      f: ['Homer Simpson', 'Marge Simpson', 'Bart Simpson', 'Lisa Simpson'],
      m: ['Maggie Simpson', 'Ned Flanders', 'Sr. Burns'],
      d: ['Moe Szyslak', 'Krusty el payaso', 'Milhouse Van Houten'],
      t: ['Peter Griffin', 'Stan Smith', 'Bender', 'Eric Cartman', 'Rick Sanchez']
    },
    {
      c: 'Actores que han protagonizado películas de la saga Misión Imposible',
      f: ['Tom Cruise', 'Ving Rhames', 'Simon Pegg', 'Rebecca Ferguson'],
      m: ['Jeremy Renner', 'Henry Cavill', 'Vanessa Kirby'],
      d: ['Jean Reno', 'Jon Voight', 'Philip Seymour Hoffman'],
      t: ['Brad Pitt', 'Matt Damon', 'Leonardo DiCaprio', 'Keanu Reeves', 'Will Smith']
    },
    {
      c: 'Series de televisión que han ganado el premio Emmy a Mejor Serie Dramática',
      f: ['Juego de Tronos', 'Breaking Bad', 'Succession', 'Los Soprano'],
      m: ['Mad Men', 'The Crown', 'Homeland'],
      d: ['Lost (Perdidos)', '24', 'El cuento de la criada'],
      t: ['Stranger Things', 'Peaky Blinders', 'The Walking Dead', 'Vikingos', 'Prison Break']
    },
    {
      c: 'Personajes de la saga El Señor de los Anillos pertenecientes a la Comunidad del Anillo',
      f: ['Frodo Bolsón', 'Aragorn', 'Gandalf', 'Legolas'],
      m: ['Gimli', 'Sam Gamyi', 'Boromir'],
      d: ['Merry Brandigamo', 'Pippin Tuk', 'Aragorn (Trancos)'],
      t: ['Gollum', 'Saruman', 'Elrond', 'Galadriel', 'Sauron']
    },
    {
      c: 'Artistas musicales que han actuado en el show de medio tiempo de la Super Bowl',
      f: ['Michael Jackson', 'Shakira', 'Rihanna', 'Eminem'],
      m: ['The Weeknd', 'Katy Perry', 'Bruno Mars'],
      d: ['Lady Gaga', 'Coldplay', 'Usher'],
      t: ['Taylor Swift', 'Drake', 'Adele', 'Ed Sheeran', 'Dua Lipa']
    },
    {
      c: 'Villanos icónicos del universo de Batman',
      f: ['Joker', 'Pingüino', 'Enigma (The Riddler)', 'Dos Caras'],
      m: ['Bane', 'Espantapájaros', 'Hiedra Venenosa'],
      d: ['Sr. Frío', 'Harley Quinn', 'Catwoman'],
      t: ['Duende Verde', 'Doctor Octopus', 'Venom', 'Loki', 'Thanos']
    },
    {
      c: 'Películas de la saga James Bond protagonizadas por Daniel Craig',
      f: ['Casino Royale (2006)', 'Skyfall', 'Spectre', 'Sin tiempo para morir'],
      m: ['Quantum of Solace', 'Skyfall (Adèle tema)', 'Casino Royale (Mads Mikkelsen)'],
      d: ['Spectre (Christoph Waltz)', 'Sin tiempo para morir (Rami Malek)', 'Quantum of Solace (Mathieu Amalric)'],
      t: ['GoldenEye', 'El mañana nunca muere', 'Muere otro día', 'El mundo nunca es suficiente', 'Octopussy']
    },
    {
      c: 'Cantantes y artistas que han participado como jueces o coaches en La Voz (España)',
      f: ['David Bisbal', 'Melendi', 'Malú', 'Alejandro Sanz'],
      m: ['Rosario Flores', 'Luis Fonsi', 'Antonio Orozco'],
      d: ['Pablo Alborán', 'Laura Pausini', 'Manuel Carrasco'],
      t: ['Julio Iglesias', 'Enrique Iglesias', 'Rosalía', 'C. Tangana', 'Aitana (edición adultos)']
    },
    {
      c: 'Personajes del anime y manga Dragon Ball Z',
      f: ['Goku', 'Vegeta', 'Gohan', 'Piccolo'],
      m: ['Freezer', 'Cell (Célula)', 'Majin Buu'],
      d: ['Trunks del futuro', 'Krilin', 'Tenshinhan'],
      t: ['Naruto Uzumaki', 'Monkey D. Luffy', 'Saskue Uchiha', 'Ichigo Kurosaki', 'Tanjiro Kamado']
    },
    {
      c: 'Películas que han superado los 1.500 millones de dólares en taquilla mundial',
      f: ['Avatar', 'Vengadores: Endgame', 'Titanic', 'Star Wars: El despertar de la Fuerza'],
      m: ['Vengadores: Infinity War', 'Spider-Man: No Way Home', 'Jurassic World'],
      d: ['El Rey León (2019)', 'Los Vengadores (2012)', 'Fast & Furious 7'],
      t: ['Harry Potter y la piedra filosofal', 'Frozen 1', 'Joker', 'Oppenheimer', 'Barbie']
    },
    {
      c: 'Presentadores reconocidos de la televisión en España',
      f: ['Pablo Motos', 'Jorge Javier Vázquez', 'Carlos Sobera', 'Roberto Leal'],
      m: ['Arturo Valls', 'Jesús Vázquez', 'Andreu Buenafuente'],
      d: ['David Broncano', 'Risto Mejide', 'Jordi Évole'],
      t: ['Fernando Alonso', 'Ibai Llanos', 'Rafael Nadal', 'Gerard Piqué', 'Alejandro Sanz']
    }
  ];

  const p = plantillas[idx];
  return {
    id: `cultura_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});