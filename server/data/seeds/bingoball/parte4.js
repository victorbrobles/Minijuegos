// server/data/seeds/bingoball/parte4.js

export const BINGOS_GRANDES_LIGAS = [
  {
    id: 'grandes_ligas_unico',
    grupo: 'grandes_ligas',
    titulo: 'Grandes Ligas Europeas: Premier, Serie A, Bundesliga y Ligue 1',
    categorias: [
      {
        id: 'campeon_tres_ligas_top',
        nombre: 'Ha ganado el título de liga en 3 o más de las 5 grandes ligas',
        jugadores: [
          'Cristiano Ronaldo',
          'Zlatan Ibrahimović',
          'Kingsley Coman',
          'Arjen Robben',
          'Arturo Vidal',
          'Thiago Alcántara',
          'David Alaba',
          'Mark van Bommel',
          'Maxwell',
          'Danilo da Silva',
          'João Cancelo'
        ]
      },
      {
        id: 'bota_oro_premier_league',
        nombre: 'Ha sido Bota de Oro (máximo goleador) de la Premier League[cite: 33]',
        jugadores: [
          'Erling Haaland',
          'Mohamed Salah',
          'Son Heung-min',
          'Harry Kane',
          'Sadio Mané',
          'Sergio Agüero',
          'Luis Suárez',
          'Robin van Persie',
          'Cristiano Ronaldo',
          'Thierry Henry',
          'Didier Drogba',
          'Nicolas Anelka',
          'Dimitar Berbatov',
          'Ruud van Nistelrooy',
          'Michael Owen',
          'Alan Shearer',
          'Andy Cole'
        ]
      },
      {
        id: 'capocannoniere_serie_a',
        nombre: 'Ha sido Capocannoniere (máximo goleador) de la Serie A italiana[cite: 33]',
        jugadores: [
          'Lautaro Martínez',
          'Victor Osimhen',
          'Ciro Immobile',
          'Cristiano Ronaldo',
          'Mauro Icardi',
          'Gonzalo Higuaín',
          'Zlatan Ibrahimović',
          'Luca Toni',
          'Edin Džeko',
          'Fabio Quagliarella',
          'Edinson Cavani',
          'Antonio Di Natale',
          'Alessandro Del Piero',
          'Francesco Totti',
          'Andriy Shevchenko',
          'David Trezeguet',
          'Hernán Crespo',
          'Christian Vieri',
          'Filippo Inzaghi'
        ]
      },
      {
        id: 'mas_de_30_goles_bundesliga',
        nombre: 'Marcó 30 o más goles en una sola temporada de Bundesliga[cite: 33]',
        jugadores: [
          'Robert Lewandowski',
          'Harry Kane',
          'Gerd Müller',
          'Lothar Emmerich',
          'Dieter Müller'
        ]
      },
      {
        id: 'campeon_leicester_2016',
        nombre: 'Campeón de la milagrosa Premier League con el Leicester City (2015-16)[cite: 33]',
        jugadores: [
          'Jamie Vardy',
          'Riyad Mahrez',
          'N\'Golo Kanté',
          'Kasper Schmeichel',
          'Wes Morgan',
          'Robert Huth',
          'Danny Drinkwater',
          'Marc Albrighton',
          'Shinji Okazaki',
          'Christian Fuchs',
          'Leonardo Ulloa',
          'Andy King'
        ]
      },
      {
        id: 'jugo_milan_e_inter',
        nombre: 'Ha jugado tanto en el AC Milan como en el Inter de Milán[cite: 33]',
        jugadores: [
          'Zlatan Ibrahimović',
          'Hakan Çalhanoğlu',
          'Andrea Pirlo',
          'Clarence Seedorf',
          'Ronaldo Nazário',
          'Mario Balotelli',
          'Christian Vieri',
          'Hernán Crespo',
          'Antonio Cassano',
          'Leonardo Bonucci',
          'Matteo Darmian',
          'Francesco Acerbi',
          'Sulley Muntari',
          'Giuseppe Meazza',
          'Edgar Davids'
        ]
      },
      {
        id: 'jugo_united_y_city',
        nombre: 'Ha jugado tanto en el Manchester United como en el Manchester City[cite: 9]',
        jugadores: [
          'Carlos Tévez',
          'Peter Schmeichel',
          'Andy Cole',
          'Owen Hargreaves',
          'Denis Law',
          'Brian Kidd',
          'Andrei Kanchelskis',
          'Jadon Sancho'
        ]
      },
      {
        id: 'invencible_arsenal_o_leverkusen',
        nombre: 'Campeón invicto de liga con Arsenal (2003-04) o Bayer Leverkusen (2023-24)[cite: 33]',
        jugadores: [
          'Thierry Henry',
          'Patrick Vieira',
          'Robert Pirès',
          'Dennis Bergkamp',
          'Ashley Cole',
          'Sol Campbell',
          'Jens Lehmann',
          'Freddie Ljungberg',
          'Gilberto Silva',
          'Lauren Bisan-Etame',
          'Kolo Touré',
          'Sylvain Wiltord',
          'Florian Wirtz',
          'Granit Xhaka',
          'Jeremie Frimpong',
          'Alejandro Grimaldo',
          'Victor Boniface',
          'Jonathan Tah',
          'Exequiel Palacios',
          'Lukáš Hrádecký',
          'Patrik Schick',
          'Robert Andrich',
          'Piero Hincapié',
          'Edmond Tapsoba',
          'Josip Stanišić'
        ]
      },
      {
        id: 'fichaje_mas_100_millones',
        nombre: 'Ha protagonizado un traspaso de 100M€ o más en su carrera[cite: 33]',
        jugadores: [
          'Neymar',
          'Kylian Mbappé',
          'Philippe Coutinho',
          'Jack Grealish',
          'Declan Rice',
          'Moisés Caicedo',
          'Enzo Fernández',
          'Jude Bellingham',
          'Harry Kane',
          'Eden Hazard',
          'João Félix',
          'Antoine Griezmann',
          'Romelu Lukaku',
          'Paul Pogba',
          'Cristiano Ronaldo'
        ]
      },
      {
        id: 'triplete_inter_2010',
        nombre: 'Ganó el Triplete (Serie A, Coppa y Champions) con el Inter de Mourinho (2010)[cite: 33]',
        jugadores: [
          'Diego Milito',
          'Javier Zanetti',
          'Esteban Cambiasso',
          'Wesley Sneijder',
          'Samuel Eto\'o',
          'Júlio César',
          'Lúcio',
          'Walter Samuel',
          'Maicon',
          'Cristian Chivu',
          'Goran Pandev',
          'Dejan Stanković',
          'Iván Córdoba',
          'Marco Materazzi',
          'Thiago Motta',
          'Mario Balotelli'
        ]
      },
      {
        id: 'jugo_en_tres_o_mas_del_big_six',
        nombre: 'Ha jugado en 3 o más clubes del Big Six inglés (United, City, Chelsea, Arsenal, Liverpool, Spurs)',
        jugadores: [
          'Nicolas Anelka',
          'Raheem Sterling',
          'Kolo Touré',
          'William Gallas',
          'Emmanuel Adebayor',
          'Daniel Sturridge',
          'Yossi Benayoun'
        ]
      },
      {
        id: 'jugo_bayern_y_dortmund',
        nombre: 'Ha jugado tanto en el Bayern Múnich como en el Borussia Dortmund[cite: 33]',
        jugadores: [
          'Robert Lewandowski',
          'Mats Hummels',
          'Mario Götze',
          'Raphaël Guerreiro',
          'Niklas Süle',
          'Marcel Sabitzer',
          'Sebastian Rode',
          'Torsten Frings',
          'Thomas Helmer',
          'Christian Nerlinger',
          'Michael Rummenigge'
        ]
      },
      {
        id: 'mas_de_150_goles_premier',
        nombre: 'Ha marcado 150 o más goles en la historia de la Premier League',
        jugadores: [
          'Alan Shearer',
          'Harry Kane',
          'Wayne Rooney',
          'Andy Cole',
          'Sergio Agüero',
          'Frank Lampard',
          'Thierry Henry',
          'Robbie Fowler',
          'Jermain Defoe',
          'Mohamed Salah',
          'Michael Owen'
        ]
      },
      {
        id: 'campeon_scudetto_napoli',
        nombre: 'Campeón de la Serie A con el SSC Napoli[cite: 33]',
        jugadores: [
          'Victor Osimhen',
          'Khvicha Kvaratskhelia',
          'Kim Min-jae',
          'Giovanni Di Lorenzo',
          'Stanislav Lobotka',
          'Piotr Zieliński',
          'André-Frank Zambo Anguissa',
          'Alex Meret',
          'Matteo Politano',
          'Giacomo Raspadori',
          'Eljif Elmas',
          'Mathías Olivera',
          'Diego Maradona',
          'Careca',
          'Ciro Ferrara',
          'Fernando De Napoli',
          'Andrea Carnevale'
        ]
      },
      {
        id: 'goleador_cinco_goles_partido_ligas',
        nombre: 'Marcó 5 goles en un solo partido en Premier League o Bundesliga',
        jugadores: [
          'Robert Lewandowski',
          'Sergio Agüero',
          'Erling Haaland',
          'Dimitar Berbatov',
          'Jermain Defoe',
          'Alan Shearer',
          'Andy Cole',
          'Luka Jović'
        ]
      },
      {
        id: 'icono_one_club_roma',
        nombre: 'Leyenda One-Club Man de la AS Roma o capitán histórico romanista',
        jugadores: [
          'Francesco Totti',
          'Daniele De Rossi',
          'Giuseppe Giannini',
          'Lorenzo Pellegrini'
        ]
      },
      {
        id: 'campeon_ligue_1_con_monaco_o_lille',
        nombre: 'Ganó la Ligue 1 francesa rompiendo la hegemonía del PSG (Mónaco 2017 o Lille 2021)',
        jugadores: [
          'Kylian Mbappé',
          'Bernardo Silva',
          'Radamel Falcao',
          'Fabinho',
          'Thomas Lemar',
          'Benjamin Mendy',
          'Tiemoué Bakayoko',
          'João Moutinho',
          'Danijel Subašić',
          'Mike Maignan',
          'Jonathan David',
          'Renato Sanches',
          'Sven Botman',
          'Burak Yılmaz',
          'José Fonte',
          'Jonathan Bamba',
          'Boubakary Soumaré',
          'Reinildo Mandava'
        ]
      },
      {
        id: 'mas_de_20_asistencias_en_una_temporada',
        nombre: 'Ha dado 20 o más asistencias de gol en una sola temporada de liga[cite: 33]',
        jugadores: [
          'Kevin De Bruyne',
          'Thierry Henry',
          'Thomas Müller',
          'Lionel Messi',
          'Emil Forsberg'
        ]
      },
      {
        id: 'portero_guante_oro_premier',
        nombre: 'Ha ganado el Golden Glove (Guante de Oro) de la Premier League[cite: 33]',
        jugadores: [
          'Petr Čech',
          'Joe Hart',
          'Ederson Moraes',
          'Alisson Becker',
          'Pepe Reina',
          'David de Gea',
          'Thibaut Courtois',
          'David Raya',
          'Edwin van der Sar',
          'Wojciech Szczęsny'
        ]
      },
      {
        id: 'jugo_en_las_cuatro_grandes_ligas_extranjeras',
        nombre: 'Ha jugado en 3 o más de estas ligas: Premier, Serie A, Bundesliga o Ligue 1',
        jugadores: [
          'Zlatan Ibrahimović',
          'Pierre-Emerick Aubameyang',
          'Edin Džeko',
          'Arturo Vidal',
          'Kingsley Coman',
          'Xherdan Shaqiri',
          'Mario Balotelli',
          'Stevan Jovetić',
          'Henrikh Mkhitaryan',
          'Philippe Coutinho',
          'Edinson Cavani',
          'Alexis Sánchez',
          'Thiago Silva',
          'João Cancelo',
          'Thierry Henry',
          'Nicolas Anelka'
        ]
      }
    ]
  }
];