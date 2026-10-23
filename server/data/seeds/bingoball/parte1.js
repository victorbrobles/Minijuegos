// server/data/seeds/bingoball/parte1.js

export const BINGOS_INTERNACIONAL = [
  {
    id: 'internacional_unico',
    grupo: 'internacional',
    titulo: 'Fútbol Internacional: Reto de Selecciones',
    categorias: [
      {
        id: 'bota_oro_mundial',
        nombre: 'Bota de Oro en un Mundial',
        jugadores: [
          'Kylian Mbappé',
          'Harry Kane',
          'James Rodríguez',
          'Thomas Müller',
          'Miroslav Klose',
          'Ronaldo Nazário',
          'Davor Šuker',
          'Gary Lineker',
          'Paolo Rossi',
          'Mario Kempes',
          'Gerd Müller',
          'Eusébio'
        ]
      },
      {
        id: 'hat_trick_en_mundial',
        nombre: 'Hat-trick en una Copa del Mundo',
        jugadores: [
          'Kylian Mbappé',
          'Gonçalo Ramos',
          'Harry Kane',
          'Xherdan Shaqiri',
          'Thomas Müller',
          'Miroslav Klose',
          'Pauleta',
          'Gabriel Batistuta',
          'Gary Lineker',
          'Paolo Rossi',
          'Geoff Hurst'
        ]
      },
      {
        id: 'gol_en_final_eurocopa',
        nombre: 'Ha marcado en una final de Eurocopa',
        jugadores: [
          'Nico Williams',
          'Mikel Oyarzabal',
          'Cole Palmer',
          'Luke Shaw',
          'Leonardo Bonucci',
          'Éder',
          'Fernando Torres',
          'David Silva',
          'Jordi Alba',
          'Juan Mata',
          'Angelos Charisteas',
          'David Trezeguet',
          'Sylvain Wiltord',
          'Marco van Basten'
        ]
      },
      {
        id: 'marcador_en_cuatro_torneos',
        nombre: 'Ha marcado en 4 o más torneos grandes (Mundial / Euro / Copa América)',
        jugadores: [
          'Luka Modrić',
          'Álvaro Morata',
          'Antoine Griezmann',
          'Romelu Lukaku',
          'Robert Lewandowski',
          'Luis Suárez',
          'Edinson Cavani',
          'Miroslav Klose',
          'Thierry Henry',
          'Zlatan Ibrahimović'
        ]
      },
      {
        id: 'campeon_ucl_y_mundial',
        nombre: 'Campeón de Champions League y de Copa del Mundo',
        jugadores: [
          'Julián Álvarez',
          'Ángel Di María',
          'Toni Kroos',
          'Manuel Neuer',
          'Thomas Müller',
          'Jérôme Boateng',
          'Philipp Lahm',
          'Bastian Schweinsteiger',
          'Iker Casillas',
          'Sergio Ramos',
          'Gerard Piqué',
          'Carles Puyol',
          'Sergio Busquets',
          'Andrés Iniesta',
          'Xavi Hernández',
          'David Villa',
          'Fernando Torres',
          'Pedro Rodríguez',
          'Zinedine Zidane',
          'Thierry Henry',
          'Roberto Carlos',
          'Rivaldo',
          'Ronaldinho'
        ]
      },
      {
        id: 'oro_olimpico',
        nombre: 'Medallista de Oro en Juegos Olímpicos',
        jugadores: [
          'Fermín López',
          'Pau Cubarsí',
          'Álex Baena',
          'Eric García',
          'Ángel Di María',
          'Sergio Agüero',
          'Javier Mascherano',
          'Neymar',
          'Gabriel Jesus',
          'Richarlison',
          'Dani Alves',
          'Marquinhos',
          'Samuel Eto\'o',
          'Pep Guardiola'
        ]
      },
      {
        id: 'campeon_nations_league',
        nombre: 'Campeón de la UEFA Nations League',
        jugadores: [
          'Rodri Hernández',
          'Dani Carvajal',
          'Álvaro Morata',
          'Dani Olmo',
          'Fabián Ruiz',
          'Unai Simón',
          'Gavi',
          'Mikel Merino',
          'Joselu Mato',
          'Nacho Fernández',
          'Kylian Mbappé',
          'Karim Benzema',
          'Paul Pogba',
          'Antoine Griezmann',
          'Hugo Lloris',
          'Theo Hernández',
          'Jules Koundé',
          'Aurélien Tchouaméni',
          'Bernardo Silva',
          'Rúben Dias',
          'Bruno Fernandes',
          'Diogo Jota',
          'Pepe',
          'Rui Patrício'
        ]
      },
      {
        id: '5_goles_1_mundial',
        nombre: 'Marcó 5 o más goles en una sola edición del Mundial',
        jugadores: [
          'Kylian Mbappé',
          'Harry Kane',
          'James Rodríguez',
          'Thomas Müller',
          'Wesley Sneijder',
          'David Villa',
          'Diego Forlán',
          'Miroslav Klose',
          'Ronaldo Nazário',
          'Rivaldo',
          'Davor Šuker',
          'Romário',
          'Salvatore Schillaci',
          'Gary Lineker',
          'Diego Maradona',
          'Paolo Rossi',
          'Mario Kempes',
          'Gerd Müller',
          'Pelé'
        ]
      },
      {
        id: 'capitan_campeon_mundial',
        nombre: 'Capitán que levantó la Copa del Mundo',
        jugadores: [
          'Hugo Lloris',
          'Philipp Lahm',
          'Iker Casillas',
          'Fabio Cannavaro',
          'Cafú',
          'Didier Deschamps',
          'Dunga',
          'Lothar Matthäus',
          'Diego Maradona',
          'Dino Zoff',
          'Daniel Passarella',
          'Franz Beckenbauer',
          'Bobby Moore'
        ]
      },
      {
        id: 'jugar_dos_selecciones',
        nombre: 'Ha jugado partidos internacionales con dos selecciones distintas',
        jugadores: [
          'Diego Costa',
          'Munir El Haddadi',
          'Declan Rice',
          'Jack Grealish',
          'Wilfried Zaha',
          'Geoffrey Kondogbia',
          'Thiago Motta',
          'Nacer Chadli',
          'Mário Fernandes',
          'Alfredo Di Stéfano',
          'Ferenc Puskás'
        ]
      },
      {
        id: 'jugar_mundial_portugal',
        nombre: 'Ha jugado un Mundial con la Selección de Portugal',
        jugadores: [
          'Pepe',
          'Bernardo Silva',
          'Bruno Fernandes',
          'Rúben Dias',
          'João Félix',
          'Rafael Leão',
          'Diogo Dalot',
          'Gonçalo Ramos',
          'Rui Patrício',
          'William Carvalho',
          'Raphaël Guerreiro',
          'João Cancelo',
          'Luís Figo',
          'Deco',
          'Pauleta',
          'Ricardo Carvalho',
          'Simão Sabrosa',
          'Eusébio'
        ]
      },
      {
        id: 'expulsado_mundial',
        nombre: 'Ha recibido tarjeta roja en una Copa del Mundo',
        jugadores: [
          'Zinedine Zidane',
          'David Beckham',
          'Wayne Rooney',
          'Luis Suárez',
          'Denzel Dumfries',
          'Vincent Aboubakar',
          'Mario Mandžukić',
          'Claudio Marchisio',
          'Ante Rebić',
          'Felipe Melo',
          'Daniele De Rossi',
          'Diego Maradona',
          'Marcel Desailly',
          'Gianfranco Zola',
          'Ronaldinho'
        ]
      },
      {
        id: 'penalti_fallado_importante',
        nombre: 'Ha fallado un penalti en Mundial o Eurocopa (partido o tanda)',
        jugadores: [
          'Harry Kane',
          'Kylian Mbappé',
          'Luka Modrić',
          'Neymar',
          'Bukayo Saka',
          'Jadon Sancho',
          'Marcus Rashford',
          'Rodrygo',
          'Marquinhos',
          'Álvaro Morata',
          'Pablo Sarabia',
          'Carlos Soler',
          'Sergio Busquets',
          'David Trezeguet',
          'Roberto Baggio',
          'Sergio Ramos',
          'Antoine Griezmann',
          'Asamoah Gyan'
        ]
      },
      {
        id: 'perdedor_final_eurocopa',
        nombre: 'Ha perdido una final de Eurocopa (Subcampeón)',
        jugadores: [
          'Harry Kane',
          'Jude Bellingham',
          'Phil Foden',
          'Bukayo Saka',
          'Declan Rice',
          'Cole Palmer',
          'John Stones',
          'Kyle Walker',
          'Jordan Pickford',
          'Luke Shaw',
          'Antoine Griezmann',
          'Hugo Lloris',
          'Paul Pogba',
          'Olivier Giroud',
          'Gianluigi Buffon',
          'Leonardo Bonucci',
          'Giorgio Chiellini',
          'Andrea Pirlo',
          'Michael Ballack'
        ]
      },
      {
        id: 'ganar_dos_mundiales',
        nombre: 'Ha ganado dos o más Copas del Mundo',
        jugadores: [
          'Pelé',
          'Cafú',
          'Ronaldo Nazário',
          'Garrincha',
          'Mário Zagallo',
          'Vavá',
          'Didi',
          'Gilmar',
          'Djalma Santos',
          'Nilton Santos',
          'Zito',
          'Daniel Passarella',
          'Giuseppe Meazza',
          'Giovanni Ferrari'
        ]
      },
      {
        id: 'balon_oro_mundial',
        nombre: 'Balón de Oro al Mejor Jugador del Mundial',
        jugadores: [
          'Luka Modrić',
          'Diego Forlán',
          'Zinedine Zidane',
          'Oliver Kahn',
          'Ronaldo Nazário',
          'Romário',
          'Salvatore Schillaci',
          'Diego Maradona',
          'Paolo Rossi'
        ]
      },
      {
        id: 'gol_a_españa_mundial',
        nombre: 'Le ha marcado gol a España en una Copa del Mundo',
        jugadores: [
          'Robin van Persie',
          'Arjen Robben',
          'Stefan de Vrij',
          'Georginio Wijnaldum',
          'Álvaro Saborío',
          'Zinedine Zidane',
          'Patrick Vieira',
          'Franck Ribéry',
          'Gelson Fernandes',
          'Antonio Di Natale',
          'Ritsu Doan',
          'Ao Tanaka',
          'Enner Valencia',
          'Niclas Füllkrug'
        ]
      },
      {
        id: 'gol_del_mundial',
        nombre: 'Autor del Gol del Torneo oficial de un Mundial (Premio FIFA)',
        jugadores: [
          'Richarlison',
          'Benjamin Pavard',
          'James Rodríguez',
          'Diego Forlán',
          'Maxi Rodríguez',
          'Robin van Persie',
          'Nacho Fernández',
          'Joe Cole'
        ]
      },
      {
        id: 'eliminado_fase_grupos',
        nombre: 'Ha quedado eliminado en fase de grupos de un Mundial',
        jugadores: [
          'Manuel Neuer',
          'Thomas Müller',
          'Joshua Kimmich',
          'İlkay Gündoğan',
          'Kai Havertz',
          'Antonio Rüdiger',
          'Romelu Lukaku',
          'Kevin De Bruyne',
          'Eden Hazard',
          'Thibaut Courtois',
          'Luis Suárez',
          'Edinson Cavani',
          'Federico Valverde',
          'Darwin Núñez',
          'Robert Lewandowski',
          'Iker Casillas',
          'Sergio Ramos',
          'Xavi Hernández',
          'Andrés Iniesta',
          'Diego Costa',
          'Gianluigi Buffon',
          'Andrea Pirlo',
          'Giorgio Chiellini'
        ]
      },
      {
        id: 'lesionado_en_mundial',
        nombre: 'Sufrió una lesión grave o fractura durante un Mundial',
        jugadores: [
          'Neymar',
          'Lucas Hernández',
          'Michael Owen',
          'Pelé',
          'Ángel Di María',
          'Marco Reus',
          'Sergio Agüero',
          'Nuno Mendes'
        ]
      }
    ]
  }
];