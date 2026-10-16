export default Array.from({ length: 20 }, (_, idx) => {
  const plantillas = [
    {
      c: 'Bandas de rock británico históricas',
      f: ['The Beatles', 'Queen', 'The Rolling Stones', 'Pink Floyd'],
      m: ['Led Zeppelin', 'The Who', 'Coldplay'],
      d: ['The Clash', 'Deep Purple', 'Black Sabbath'],
      t: ['AC/DC', 'Nirvana', 'Guns N\' Roses', 'Metallica', 'U2']
    },
    {
      c: 'Artistas con álbumes que superan 50 millones de copias vendidas',
      f: ['Michael Jackson', 'AC/DC', 'Pink Floyd', 'Whitney Houston'],
      m: ['Meat Loaf', 'Eagles', 'Fleetwood Mac'],
      d: ['Shania Twain', 'Led Zeppelin', 'Celine Dion'],
      t: ['Beyoncé', 'Taylor Swift', 'Drake', 'Bruno Mars', 'Ed Sheeran']
    },
    {
      c: 'Cantantes solistas de Pop reconocidos internacionalmente',
      f: ['Madonna', 'Britney Spears', 'Dua Lipa', 'Katy Perry'],
      m: ['Lady Gaga', 'Ariana Grande', 'Justin Timberlake'],
      d: ['Kylie Minogue', 'Billie Eilish', 'Olivia Rodrigo'],
      t: ['Kurt Cobain', 'Freddie Mercury', 'Chester Bennington', 'Bono', 'Mick Jagger']
    },
    {
      c: 'Artistas o grupos del movimiento Hip-Hop y Rap',
      f: ['Eminem', 'Tupac Shakur', 'Snoop Dogg', '50 Cent'],
      m: ['The Notorious B.I.G.', 'Dr. Dre', 'Kendrick Lamar'],
      d: ['Nas', 'Jay-Z', 'J. Cole'],
      t: ['Bob Marley', 'Michael Jackson', 'Bruno Mars', 'The Weeknd', 'Jason Derulo']
    },
    {
      c: 'Compositores de música clásica occidental',
      f: ['Ludwig van Beethoven', 'Wolfgang Amadeus Mozart', 'Johann Sebastian Bach', 'Antonio Vivaldi'],
      m: ['Frédéric Chopin', 'Piotr Ilich Chaikovski', 'Johannes Brahms'],
      d: ['Franz Liszt', 'Claude Debussy', 'Richard Wagner'],
      t: ['Hans Zimmer', 'John Williams', 'Ennio Morricone', 'Ludovico Einaudi', 'Howard Shore']
    },
    {
      c: 'Canciones de la banda Queen',
      f: ['Bohemian Rhapsody', 'We Will Rock You', 'Don\'t Stop Me Now', 'Another One Bites the Dust'],
      m: ['Radio Ga Ga', 'Under Pressure', 'I Want to Break Free'],
      d: ['Somebody to Love', 'The Show Must Go On', 'Killer Queen'],
      t: ['Imagine', 'Hotel California', 'Stairway to Heaven', 'Sweet Child O\' Mine', 'Hey Jude']
    },
    {
      c: 'Cantantes masculinos de reggaeton / música urbana latina',
      f: ['Bad Bunny', 'Daddy Yankee', 'J Balvin', 'Maluma'],
      m: ['Rauw Alejandro', 'Ozuna', 'Anuel AA'],
      d: ['Feid', 'Don Omar', 'Nicky Jam'],
      t: ['Ricky Martin', 'Luis Miguel', 'Chayanne', 'Marc Anthony', 'Enrique Iglesias']
    },
    {
      c: 'Grupos y bandas del subgénero Grunge',
      f: ['Nirvana', 'Pearl Jam', 'Soundgarden', 'Alice in Chains'],
      m: ['Stone Temple Pilots', 'Silverchair', 'Mudhoney'],
      d: ['Screaming Trees', 'Temple of the Dog', 'Mad Season'],
      t: ['Green Day', 'Blink-182', 'The Offspring', 'Foo Fighters', 'Radiohead']
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
      t: ['Rihanna', 'Katy Perry', 'Nicki Minaj', 'Jennifer Lopez', 'Shakira']
    },
    {
      c: 'Bandas icónicas de Heavy Metal',
      f: ['Iron Maiden', 'Metallica', 'Judas Priest', 'Black Sabbath'],
      m: ['Megadeth', 'Slayer', 'Pantera'],
      d: ['Motorhead', 'Anthrax', 'Saxon'],
      t: ['Red Hot Chili Peppers', 'The Rolling Stones', 'U2', 'The Police', 'Aerosmith']
    },
    {
      c: 'Canciones del grupo The Beatles',
      f: ['Hey Jude', 'Yesterday', 'Let It Be', 'Help!'],
      m: ['Come Together', 'Yellow Submarine', 'Here Comes the Sun'],
      d: ['Eleanor Rigby', 'Something', 'A Day in the Life'],
      t: ['Imagine', 'Bohemian Rhapsody', 'Wonderwall', 'Angie', 'Paint It Black']
    },
    {
      c: 'Artistas españoles que han vendido millones de discos',
      f: ['Julio Iglesias', 'Rosalía', 'Alejandro Sanz', 'Enrique Iglesias'],
      m: ['David Bisbal', 'Joaquín Sabina', 'Melendi'],
      d: ['Camilo Sesto', 'Rocío Dúrcal', 'Raphael'],
      t: ['Luis Fonsi', 'Ricardo Arjona', 'Juanes', 'Chayanne', 'Ricky Martin']
    },
    {
      c: 'Bandas pertenecientes al Rock / Pop en español (Hispanoamérica y España)',
      f: ['Soda Stereo', 'Héroes del Silencio', 'Maná', 'El Canto del Loco'],
      m: ['Los Rodríguez', 'Enanitos Verdes', 'Estopa'],
      d: ['Café Tacvba', 'Los Fabulosos Cadillacs', 'Fito & Fitipaldis'],
      t: ['Gipsy Kings', 'Il Divo', 'Buena Vista Social Club', 'La Oreja de Van Gogh', 'Mecano']
    },
    {
      c: 'Instrumentos pertenecientes a la familia de viento-madera',
      f: ['Flauta travesera', 'Clarinete', 'Oboe', 'Saxofón'],
      m: ['Fagot', 'Flautín (Piccolo)', 'Corno inglés'],
      d: ['Contrafagot', 'Clarinete bajo', 'Oboe d\'amore'],
      t: ['Trompeta', 'Trombón', 'Tuba', 'Trompa', 'Violín']
    },
    {
      c: 'Canciones del álbum "Thriller" de Michael Jackson (1982)',
      f: ['Thriller', 'Billie Jean', 'Beat It', 'Wanna Be Startin\' Somethin\''],
      m: ['Human Nature', 'P.Y.T. (Pretty Young Thing)', 'The Girl Is Mine'],
      d: ['Baby Be Mine', 'The Lady in My Life', 'Carousel'],
      t: ['Bad', 'Smooth Criminal', 'Black or White', 'Man in the Mirror', 'Earth Song']
    },
    {
      c: 'Artistas o DJs de música electrónica / EDM',
      f: ['David Guetta', 'Avicii', 'Calvin Harris', 'Martin Garrix'],
      m: ['Tiësto', 'Skrillex', 'Marshmello'],
      d: ['Deadmau5', 'Armin van Buuren', 'Afrojack'],
      t: ['Daft Punk', 'Eminem', 'Drake', 'Bruno Mars', 'Justin Bieber']
    },
    {
      c: 'Canciones pertenecientes a la discografía de Taylor Swift',
      f: ['Shake It Off', 'Blank Space', 'Love Story', 'Bad Blood'],
      m: ['Cruel Summer', 'Anti-Hero', 'You Belong With Me'],
      d: ['Cardigan', 'All Too Well', 'Lover'],
      t: ['Roar', 'Firework', 'Single Ladies', 'Hello', 'Umbrella']
    },
    {
      c: 'Grupos pioneros del Punk Rock',
      f: ['The Ramones', 'Sex Pistols', 'The Clash', 'Green Day'],
      m: ['The Damned', 'Bad Religion', 'The Offspring'],
      d: ['Buzzcocks', 'Dead Kennedys', 'Minor Threat'],
      t: ['Nirvana', 'Metallica', 'Guns N\' Roses', 'Linkin Park', 'Oasis']
    },
    {
      c: 'Cantantes femeninas de Soul y R&B clásico',
      f: ['Aretha Franklin', 'Whitney Houston', 'Etta James', 'Amy Winehouse'],
      m: ['Diana Ross', 'Tina Turner', 'Nina Simone'],
      d: ['Roberta Flack', 'Gladys Knight', 'Dusty Springfield'],
      t: ['Celine Dion', 'Barbra Streisand', 'Madonna', 'Cher', 'Britney Spears']
    }
  ];

  const p = plantillas[idx];
  return {
    id: `musica_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});