// server/data/seeds/buscaminas/deportes.js

const plantillas = [
  // 1 - 10: Tenis, Baloncesto y Motor
  {
    c: 'Tenistas masculinos ganadores de torneos de Grand Slam individual',
    f: ['Rafael Nadal', 'Roger Federer', 'Novak Djokovic', 'Carlos Alcaraz'],
    m: ['Andy Murray', 'Andre Agassi', 'Pete Sampras'],
    d: ['Daniil Medvedev', 'Stan Wawrinka', 'Juan Martín Del Potro'],
    t: ['Gael Monfils', 'Stefanos Tsitsipas', 'Nick Kyrgios', 'Casper Ruud', 'David Ferrer']
  },
  {
    c: 'Tenistas femeninas ganadoras de torneos de Grand Slam individual',
    f: ['Serena Williams', 'Aryna Sabalenka', 'Iga Świątek', 'Garbiñe Muguruza'],
    m: ['Maria Sharapova', 'Venus Williams', 'Arantxa Sánchez Vicario'],
    d: ['Coco Gauff', 'Simona Halep', 'Angelique Kerber'],
    t: ['Paula Badosa', 'Ons Jabeur', 'Elina Svitolina', 'Jessica Pegula', 'Karolína Plíšková']
  },
  {
    c: 'Franquicias pertenecientes a la Conferencia Este de la NBA',
    f: ['Boston Celtics', 'Miami Heat', 'Chicago Bulls', 'New York Knicks'],
    m: ['Philadelphia 76ers', 'Milwaukee Bucks', 'Cleveland Cavaliers'],
    d: ['Indiana Pacers', 'Orlando Magic', 'Atlanta Hawks'],
    t: ['Los Angeles Lakers', 'Golden State Warriors', 'Dallas Mavericks', 'Denver Nuggets', 'Phoenix Suns']
  },
  {
    c: 'Jugadores con más de 25.000 puntos anotados en la historia de la NBA',
    f: ['LeBron James', 'Kareem Abdul-Jabbar', 'Kobe Bryant', 'Michael Jordan'],
    m: ['Dirk Nowitzki', 'Shaquille O\'Neal', 'Kevin Durant'],
    d: ['Wilt Chamberlain', 'Carmelo Anthony', 'Moses Malone'],
    t: ['Stephen Curry', 'Giannis Antetokounmpo', 'Magic Johnson', 'Larry Bird', 'Dwyane Wade']
  },
  {
    c: 'Jugadores galardonados con el MVP de la temporada regular de la NBA',
    f: ['Michael Jordan', 'LeBron James', 'Stephen Curry', 'Kobe Bryant'],
    m: ['Nikola Jokić', 'Giannis Antetokounmpo', 'Shaquille O\'Neal'],
    d: ['Joel Embiid', 'Dirk Nowitzki', 'Steve Nash'],
    t: ['Dwyane Wade', 'Kawhi Leonard', 'Carmelo Anthony', 'Chris Paul', 'Klay Thompson']
  },
  {
    c: 'Pilotos campeones del mundo de Fórmula 1',
    f: ['Fernando Alonso', 'Lewis Hamilton', 'Max Verstappen', 'Michael Schumacher'],
    m: ['Sebastian Vettel', 'Ayrton Senna', 'Niki Lauda'],
    d: ['Kimi Räikkönen', 'Nico Rosberg', 'Jenson Button'],
    t: ['Carlos Sainz Jr.', 'Charles Leclerc', 'Lando Norris', 'George Russell', 'Sergio Pérez']
  },
  {
    c: 'Circuitos permanentes o urbanos que forman parte del Mundial de Fórmula 1',
    f: ['Monza', 'Silverstone', 'Mónaco', 'Spa-Francorchamps'],
    m: ['Montmeló', 'Suzuka', 'Interlagos'],
    d: ['Zandvoort', 'Austin', 'Gilles Villeneuve'],
    t: ['Nürburgring Nordschleife', 'Le Mans', 'Indianapolis', 'Daytona', 'Jerez']
  },
  {
    c: 'Pilotos campeones del mundo en la categoría reina (MotoGP / 500cc)',
    f: ['Marc Márquez', 'Valentino Rossi', 'Jorge Lorenzo', 'Mick Doohan'],
    m: ['Casey Stoner', 'Francesco Bagnaia', 'Fabio Quartararo'],
    d: ['Joan Mir', 'Nicky Hayden', 'Kevin Schwantz'],
    t: ['Dani Pedrosa', 'Maverick Viñales', 'Aleix Espargaró', 'Sete Gibernau', 'Pol Espargaró']
  },
  {
    c: 'Equipos pertenecientes a la NFL (Fútbol Americano)',
    f: ['Kansas City Chiefs', 'New England Patriots', 'Dallas Cowboys', 'Green Bay Packers'],
    m: ['San Francisco 49ers', 'Philadelphia Eagles', 'Pittsburgh Steelers'],
    d: ['Buffalo Bills', 'Seattle Seahawks', 'Baltimore Ravens'],
    t: ['Boston Celtics', 'Los Angeles Dodgers', 'New York Yankees', 'Chicago White Sox', 'Golden State Warriors']
  },
  {
    c: 'Franquicias pertenecientes a la MLB (Grandes Ligas de Béisbol)',
    f: ['New York Yankees', 'Boston Red Sox', 'Los Angeles Dodgers', 'Chicago Cubs'],
    m: ['San Francisco Giants', 'Houston Astros', 'Atlanta Braves'],
    d: ['Toronto Blue Jays', 'St. Louis Cardinals', 'Philadelphia Phillies'],
    t: ['Chicago Bulls', 'Miami Heat', 'Green Bay Packers', 'Dallas Mavericks', 'Seattle Seahawks']
  },

  // 11 - 20: Fútbol de Selecciones y Clubes
  {
    c: 'Selecciones masculinas campeonas de la Copa del Mundo de la FIFA',
    f: ['Brasil', 'Alemania', 'Italia', 'Argentina'],
    m: ['Francia', 'Uruguay', 'España'],
    d: ['Inglaterra', 'Alemania Occidental', 'Argentina'],
    t: ['Países Bajos', 'Portugal', 'Bélgica', 'Croacia', 'Colombia']
  },
  {
    c: 'Clubes que han ganado la UEFA Champions League / Copa de Europa',
    f: ['Real Madrid', 'FC Barcelona', 'Bayern Múnich', 'Liverpool'],
    m: ['AC Milan', 'Manchester United', 'Chelsea'],
    d: ['Manchester City', 'Inter de Milán', 'Borussia Dortmund'],
    t: ['Paris Saint-Germain', 'Arsenal', 'Atlético de Madrid', 'Tottenham Hotspur', 'Bayer Leverkusen']
  },
  {
    c: 'Selecciones nacionales ganadoras de la Eurocopa de la UEFA',
    f: ['España', 'Alemania', 'Italia', 'Francia'],
    m: ['Portugal', 'Países Bajos', 'Grecia'],
    d: ['Dinamarca', 'Unión Soviética', 'Checoslovaquia'],
    t: ['Inglaterra', 'Bélgica', 'Croacia', 'Suecia', 'Suiza']
  },
  {
    c: 'Futbolistas galardonados con el Balón de Oro masculino',
    f: ['Lionel Messi', 'Cristiano Ronaldo', 'Karim Benzema', 'Luka Modrić'],
    m: ['Ronaldinho', 'Kaká', 'Zinedine Zidane'],
    d: ['Ronaldo Nazário', 'Andriy Shevchenko', 'Pavel Nedvěd'],
    t: ['Neymar Jr', 'Andrés Iniesta', 'Xavi Hernández', 'Thierry Henry', 'Robert Lewandowski']
  },
  {
    c: 'Máximos goleadores históricos de la UEFA Champions League (más de 60 goles)',
    f: ['Cristiano Ronaldo', 'Lionel Messi', 'Robert Lewandowski', 'Karim Benzema'],
    m: ['Raúl González', 'Thomas Müller', 'Ruud van Nistelrooy'],
    d: ['Thierry Henry', 'Kylian Mbappé', 'Andriy Shevchenko'],
    t: ['Neymar Jr', 'Zlatan Ibrahimović', 'Luis Suárez', 'Didier Drogba', 'Sergio Agüero']
  },
  {
    c: 'Clubes sudamericanos campeones de la Copa Libertadores',
    f: ['Boca Juniors', 'River Plate', 'Flamengo', 'Santos FC'],
    m: ['Palmeiras', 'São Paulo', 'Independiente'],
    d: ['Grêmio', 'Peñarol', 'Nacional de Montevideo'],
    t: ['Club América', 'Cruz Azul', 'Chivas de Guadalajara', 'Inter Miami', 'Los Angeles FC']
  },
  {
    c: 'Clubes que han conquistado la Premier League inglesa (desde 1992)',
    f: ['Manchester United', 'Manchester City', 'Chelsea', 'Arsenal'],
    m: ['Liverpool', 'Leicester City', 'Blackburn Rovers'],
    d: ['Leeds United', 'Aston Villa', 'Everton'],
    t: ['Tottenham Hotspur', 'Newcastle United', 'West Ham United', 'Southampton', 'Fulham']
  },
  {
    c: 'Clubes que han ganado LaLiga de España en el siglo XXI',
    f: ['Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Valencia CF'],
    m: ['Deportivo de La Coruña', 'Sevilla FC', 'Athletic Club'],
    d: ['Real Sociedad', 'Real Betis', 'Villarreal CF'],
    t: ['Celta de Vigo', 'RCD Espanyol', 'Getafe CF', 'CA Osasuna', 'Girona FC']
  },
  {
    c: 'Entrenadores ganadores de la UEFA Champions League',
    f: ['Carlo Ancelotti', 'Pep Guardiola', 'Zinedine Zidane', 'José Mourinho'],
    m: ['Jürgen Klopp', 'Alex Ferguson', 'Luis Enrique'],
    d: ['Thomas Tuchel', 'Hansi Flick', 'Vicente del Bosque'],
    t: ['Diego Simeone', 'Mauricio Pochettino', 'Arsène Wenger', 'Mikel Arteta', 'Unai Emery']
  },
  {
    c: 'Estadios de fútbol que han albergado finales de la Copa del Mundo masculina',
    f: ['Maracaná', 'Santiago Bernabéu', 'Lusail', 'Stade de France'],
    m: ['Rose Bowl', 'Olympiastadion de Berlín', 'Estadio Azteca'],
    d: ['Wembley', 'Estadio Centenario', 'Estadio Internacional de Yokohama'],
    t: ['Camp Nou', 'San Siro', 'Allianz Arena', 'Anfield', 'Old Trafford']
  },

  // 21 - 30: Ciclismo, Atletismo y Juegos Olímpicos
  {
    c: 'Ciclistas ganadores de la clasificación general del Tour de Francia',
    f: ['Miguel Induráin', 'Tadej Pogačar', 'Alberto Contador', 'Jonas Vingegaard'],
    m: ['Chris Froome', 'Eddy Merckx', 'Bernard Hinault'],
    d: ['Egan Bernal', 'Geraint Thomas', 'Carlos Sastre'],
    t: ['Peter Sagan', 'Alejandro Valverde', 'Nairo Quintana', 'Julian Alaphilippe', 'Rigoberto Urán']
  },
  {
    c: 'Ciclistas que han ganado las tres Grandes Vueltas (Tour, Giro y Vuelta)',
    f: ['Eddy Merckx', 'Bernard Hinault', 'Alberto Contador', 'Chris Froome'],
    m: ['Vincenzo Nibali', 'Jacques Anquetil', 'Felice Gimondi'],
    d: ['Primož Roglič', 'Laurent Fignon', 'Pedro Delgado'],
    t: ['Miguel Induráin', 'Tadej Pogačar', 'Alejandro Valverde', 'Nairo Quintana', 'Tony Rominger']
  },
  {
    c: 'Atletas masculinos plusmarquistas mundiales individuales en pruebas de pista o campo',
    f: ['Usain Bolt', 'Carl Lewis', 'Michael Johnson', 'David Rudisha'],
    m: ['Hicham El Guerrouj', 'Kenenisa Bekele', 'Wayde van Niekerk'],
    d: ['Karsten Warholm', 'Armand Duplantis', 'Kevin Mayer'],
    t: ['Mo Farah', 'Justin Gatlin', 'Tyson Gay', 'Asafa Powell', 'Yohan Blake']
  },
  {
    c: 'Ciudades que han sido sede de los Juegos Olímpicos de Verano',
    f: ['Barcelona', 'Londres', 'París', 'Tokio'],
    m: ['Río de Janeiro', 'Pekín', 'Sídney'],
    d: ['Atlanta', 'Seúl', 'Los Ángeles'],
    t: ['Madrid', 'Buenos Aires', 'Berlín Occidental', 'Roma 2004', 'Nueva York']
  },
  {
    c: 'Ciudades que han sido sede de los Juegos Olímpicos de Invierno',
    f: ['Sochi', 'Vancouver', 'Turín', 'Salt Lake City'],
    m: ['Pyeongchang', 'Pekín', 'Nagano'],
    d: ['Lillehammer', 'Albertville', 'Calgary'],
    t: ['Madrid', 'Ginebra', 'Helsinki', 'Oslo', 'Estocolmo']
  },
  {
    c: 'Deportistas españoles ganadores de medalla de oro en Juegos Olímpicos',
    f: ['Rafael Nadal', 'Carolina Marín', 'Mireia Belmonte', 'Saúl Craviotto'],
    m: ['Ruth Beitia', 'Fermín Cacho', 'Joan Llaneras'],
    d: ['Marcus Cooper Walz', 'David Cal', 'Támara Echegoyen'],
    t: ['Fernando Alonso', 'Carlos Sainz', 'Marc Márquez', 'Dani Pedrosa', 'Pau Gasol']
  },
  {
    c: 'Disciplinas que forman parte del programa olímpico de verano oficial',
    f: ['Natación', 'Atletismo', 'Gimnasia artística', 'Judo'],
    m: ['Halterofilia', 'Tiro con arco', 'Esgrima'],
    d: ['Taekwondo', 'Piragüismo en eslalon', 'Pentatlón moderno'],
    t: ['Pádel', 'Fútbol sala', 'Críquet', 'Bolos', 'Squash']
  },
  {
    c: 'Disciplinas que forman parte del programa olímpico de invierno oficial',
    f: ['Esquí alpino', 'Patinaje artístico sobre hielo', 'Snowboard', 'Hockey sobre hielo'],
    m: ['Curling', 'Biatlón', 'Bobsleigh'],
    d: ['Luge', 'Skeleton', 'Salto de esquí'],
    t: ['Mushing', 'Raquetas de nieve', 'Alpinismo', 'Snowkiting', 'Polo sobre nieve']
  },
  {
    c: 'Golfistas masculinos ganadores del Masters de Augusta',
    f: ['Tiger Woods', 'Jon Rahm', 'Sergio García', 'Jack Nicklaus'],
    m: ['Phil Mickelson', 'Seve Ballesteros', 'José María Olazábal'],
    d: ['Scottie Scheffler', 'Hideki Matsuyama', 'Dustin Johnson'],
    t: ['Rory McIlroy', 'Brooks Koepka', 'Collin Morikawa', 'Bryson DeChambeau', 'Justin Thomas']
  },
  {
    c: 'Boxeadores campeones del mundo en la categoría de los pesos pesados',
    f: ['Muhammad Ali', 'Mike Tyson', 'Evander Holyfield', 'Tyson Fury'],
    m: ['George Foreman', 'Lennox Lewis', 'Oleksandr Usyk'],
    d: ['Joe Frazier', 'Larry Holmes', 'Anthony Joshua'],
    t: ['Floyd Mayweather', 'Manny Pacquiao', 'Canelo Álvarez', 'Conor McGregor', 'Oscar De La Hoya']
  },

  // 31 - 40: Artes Marciales, Deportes de Contacto y Rugby
  {
    c: 'Luchadores que han ostentado el cinturón de campeón en la UFC',
    f: ['Conor McGregor', 'Khabib Nurmagomedov', 'Jon Jones', 'Ilia Topuria'],
    m: ['Israel Adesanya', 'Anderson Silva', 'Georges St-Pierre'],
    d: ['Francis Ngannou', 'Sean O\'Malley', 'Alexander Volkanovski'],
    t: ['Floyd Mayweather', 'Mike Tyson', 'Canelo Álvarez', 'Derrick Rose', 'Triple H']
  },
  {
    c: 'Selecciones nacionales campeonas de la Copa del Mundo de Rugby (a 15)',
    f: ['Nueva Zelanda', 'Sudáfrica', 'Australia', 'Inglaterra'],
    m: ['Francia', 'Irlanda', 'Gales'],
    d: ['Escocia', 'Argentina', 'Fiyi'],
    t: ['Italia', 'Japón', 'Samoa', 'Canadá', 'Estados Unidos']
  },
  {
    c: 'Selecciones participantes en el Torneo de las Seis Naciones de Rugby',
    f: ['Inglaterra', 'Francia', 'Gales', 'Irlanda'],
    m: ['Escocia', 'Italia', 'España'],
    d: ['Georgia', 'Portugal', 'Rumanía'],
    t: ['Nueva Zelanda', 'Sudáfrica', 'Australia', 'Argentina', 'Fiyi']
  },
  {
    c: 'Deportes de combate y artes marciales con presencia en Juegos Olímpicos',
    f: ['Judo', 'Taekwondo', 'Boxeo', 'Lucha libre'],
    m: ['Lucha grecorromana', 'Esgrima', 'Karate'],
    d: ['Wushu', 'Sambo', 'Savate'],
    t: ['Kickboxing', 'Muay Thai', 'Jiu-jitsu brasileño', 'Aikido', 'Krav Maga']
  },
  {
    c: 'Estilos de natación reglamentados en competiciones oficiales de piscina',
    f: ['Crol', 'Espalda', 'Braza', 'Mariposa'],
    m: ['Estilos individual', 'Relevo libre', 'Relevo combinado'],
    d: ['Nado subacuático', 'Viraje de campana', 'Salida de agarre'],
    t: ['Nado de perro', 'Buceo con botella', 'Natación sincronizada', 'Waterpolo', 'Salto de palanca']
  },
  {
    c: 'Pruebas que componen la competición olímpica del Decatlón masculino',
    f: ['100 metros lisos', 'Salto de longitud', 'Lanzamiento de peso', 'Salto de altura'],
    m: ['400 metros lisos', '110 metros vallas', 'Lanzamiento de disco'],
    d: ['Salto con pértiga', 'Lanzamiento de jabalina', '1.500 metros lisos'],
    t: ['Maratón', 'Triple salto', 'Lanzamiento de martillo', '3.000 metros obstáculos', '200 metros lisos']
  },
  {
    c: 'Pruebas de lanzamientos de peso o artefactos en atletismo oficial de pista y campo',
    f: ['Lanzamiento de jabalina', 'Lanzamiento de peso', 'Lanzamiento de disco', 'Lanzamiento de martillo'],
    m: ['Lanzamiento de pelota', 'Lanzamiento de sóftbol', 'Lanzamiento de vórtex'],
    d: ['Lanzamiento de granada deportiva', 'Lanzamiento de fardo', 'Lanzamiento de dardo'],
    t: ['Salto con pértiga', 'Salto de altura', 'Lanzamiento de herradura', 'Tiro con arco', 'Tiro al plato']
  },
  {
    c: 'Equipos pertenecientes a la NHL (Liga Nacional de Hockey sobre Hielo)',
    f: ['Montreal Canadiens', 'New York Rangers', 'Toronto Maple Leafs', 'Boston Bruins'],
    m: ['Chicago Blackhawks', 'Detroit Red Wings', 'Vegas Golden Knights'],
    d: ['Edmonton Oilers', 'Pittsburgh Penguins', 'Tampa Bay Lightning'],
    t: ['Los Angeles Lakers', 'New England Patriots', 'Chicago Cubs', 'Miami Dolphins', 'Golden State Warriors']
  },
  {
    c: 'Nadadores con múltiples medallas de oro en Juegos Olímpicos',
    f: ['Michael Phelps', 'Mark Spitz', 'Ian Thorpe', 'Caeleb Dressel'],
    m: ['Ryan Lochte', 'Sun Yang', 'Pieter van den Hoogenband'],
    d: ['Alexander Popov', 'Matt Biondi', 'Léon Marchand'],
    t: ['Usain Bolt', 'Carl Lewis', 'Eliud Kipchoge', 'Mo Farah', 'David Popovici']
  },
  {
    c: 'Monumentos clásicos históricos del ciclismo en ruta internacional',
    f: ['Milán-San Remo', 'París-Roubaix', 'Tour de Flandes', 'Lieja-Bastoña-Lieja'],
    m: ['Giro de Lombardía', 'Strade Bianche', 'Amstel Gold Race'],
    d: ['Flecha Valona', 'Clásica de San Sebastián', 'Giro de Emilia'],
    t: ['París-Niza', 'Tirreno-Adriático', 'Critérium del Dauphiné', 'Vuelta a Suiza', 'Vuelta a Cataluña']
  },

  // 41 - 50: Baloncesto y FIBA
  {
    c: 'Selecciones nacionales campeonas de la Copa del Mundo de Baloncesto FIBA',
    f: ['Estados Unidos', 'España', 'Argentina', 'Yugoslavia'],
    m: ['Unión Soviética', 'Brasil', 'Alemania'],
    d: ['Serbia', 'Grecia', 'Turquía'],
    t: ['Francia', 'Australia', 'Lituania', 'Eslovenia', 'Canadá']
  },
  {
    c: 'Jugadores con tres o más anillos de campeón de la NBA',
    f: ['Michael Jordan', 'Kobe Bryant', 'LeBron James', 'Stephen Curry'],
    m: ['Magic Johnson', 'Tim Duncan', 'Shaquille O\'Neal'],
    d: ['Bill Russell', 'Larry Bird', 'Klay Thompson'],
    t: ['Charles Barkley', 'Karl Malone', 'Allen Iverson', 'Steve Nash', 'Chris Paul']
  },
  {
    c: 'Clubes que han ganado la Euroliga de Baloncesto en la era moderna',
    f: ['Real Madrid', 'FC Barcelona', 'Panathinaikos', 'Olympiacos'],
    m: ['CSKA Moscú', 'Maccabi Tel Aviv', 'Anadolu Efes'],
    d: ['Fenerbahçe', 'Virtus Bolonia', 'Žalgiris Kaunas'],
    t: ['Valencia Basket', 'Bayern Múnich Baloncesto', 'ALBA Berlín', 'AS Mónaco Basket', 'Baskonia']
  },
  {
    c: 'Jugadores europeos seleccionados como All-Star en la NBA',
    f: ['Pau Gasol', 'Dirk Nowitzki', 'Luka Dončić', 'Giannis Antetokounmpo'],
    m: ['Nikola Jokić', 'Tony Parker', 'Marc Gasol'],
    d: ['Rudy Gobert', 'Kristaps Porziņģis', 'Domantas Sabonis'],
    t: ['Ricky Rubio', 'José Manuel Calderón', 'Juancho Hernangómez', 'Sergio Rodríguez', 'Facundo Campazzo']
  },
  {
    c: 'Posiciones y demarcaciones clásicas en el juego del baloncesto',
    f: ['Base', 'Escolta', 'Alero', 'Pívot'],
    m: ['Ala-pívot', 'Sexto hombre', 'Defensor perimetral'],
    d: ['Pívot tirador', 'Base anotador', 'Alero tirador'],
    t: ['Líbero', 'Delantero centro', 'Quarterback', 'Mediapunta', 'Receptor']
  },
  {
    c: 'Clubes que han ganado el Triplete continental europeo en una temporada (Liga, Copa y Copa de Europa)',
    f: ['FC Barcelona', 'Bayern Múnich', 'Manchester City', 'Manchester United'],
    m: ['Inter de Milán', 'Celtic de Glasgow', 'Ajax de Ámsterdam'],
    d: ['PSV Eindhoven', 'Liverpool', 'Chelsea'],
    t: ['Real Madrid', 'AC Milan', 'Juventus', 'Arsenal', 'Borussia Dortmund']
  },
  {
    c: 'Futbolistas con más de 700 goles oficiales reconocidos en su carrera profesional',
    f: ['Cristiano Ronaldo', 'Lionel Messi', 'Pelé', 'Romário'],
    m: ['Ferenc Puskás', 'Gerd Müller', 'Robert Lewandowski'],
    d: ['Josef Bican', 'Jimmy Jones', 'Eusébio'],
    t: ['Diego Maradona', 'Ronaldo Nazário', 'Thierry Henry', 'Karim Benzema', 'Raúl González']
  },
  {
    c: 'Porteros galardonados con el Trofeo Yashin al mejor guardameta del mundo',
    f: ['Alisson Becker', 'Gianluigi Donnarumma', 'Thibaut Courtois', 'Emiliano Martínez'],
    m: ['Ederson Moraes', 'Yassine Bounou', 'Marc-André ter Stegen'],
    d: ['Kepa Arrizabalaga', 'Jan Oblak', 'Mike Maignan'],
    t: ['Iker Casillas', 'Gianluigi Buffon', 'Manuel Neuer', 'Petr Čech', 'David de Gea']
  },
  {
    c: 'Selecciones nacionales masculinas ganadoras de la Copa América de fútbol',
    f: ['Argentina', 'Uruguay', 'Brasil', 'Chile'],
    m: ['Colombia', 'Perú', 'Paraguay'],
    d: ['Bolivia', 'Ecuador', 'Venezuela'],
    t: ['México', 'Estados Unidos', 'Costa Rica', 'Honduras', 'Jamaica']
  },
  {
    c: 'Futbolistas que han marcado 5 goles en un solo partido oficial de UEFA Champions League',
    f: ['Lionel Messi', 'Erling Haaland', 'Luiz Adriano', 'Robert Lewandowski'],
    m: ['Cristiano Ronaldo', 'Kylian Mbappé', 'Karim Benzema'],
    d: ['Neymar Jr', 'Ruud van Nistelrooy', 'Mario Gomez'],
    t: ['Zlatan Ibrahimović', 'Didier Drogba', 'Luis Suárez', 'Antoine Griezmann', 'Harry Kane']
  },

  // 51 - 60: Deportes de Invierno, Extremos y Náutica
  {
    c: 'Modalidades oficiales del esquí alpino de competición',
    f: ['Descenso', 'Eslalon', 'Eslalon Gigante', 'Súper Gigante'],
    m: ['Combinada alpina', 'Paralelo', 'Eslalon nocturno'],
    d: ['Súper Combinada', 'Descenso de velocidad', 'Eslalon por equipos'],
    t: ['Salto de esquí', 'Esquí de fondo', 'Biatlón', 'Snowboard cross', 'Telemark']
  },
  {
    c: 'Clases y categorías de embarcaciones a vela presentes en regatas olímpicas',
    f: ['Laser', '49er', 'Nacra 17', '470'],
    m: ['Finn', 'Formula Kite', 'iQFoil'],
    d: ['49er FX', 'Star', 'Tornado'],
    t: ['Kayak de mar', 'Canoa C1', 'Piragua K2', 'Yate a motor', 'Moto de agua']
  },
  {
    c: 'Maniobras y trucos técnicos del skateboarding de competición',
    f: ['Ollie', 'Kickflip', 'Heelflip', 'Grind'],
    m: ['Boardslide', 'Pop Shove-it', 'Varial flip'],
    d: ['Hardflip', 'Tre flip', 'Noseslide'],
    t: ['Smash cruzado', 'Touchdown', 'Drive cortado', 'Ace directo', 'Home run']
  },
  {
    c: 'Grandes carreras hípicas de caballos pura sangre internacionales',
    f: ['Derby de Kentucky', 'Preakness Stakes', 'Belmont Stakes', 'Prix de l\'Arc de Triomphe'],
    m: ['Ascot Gold Cup', 'Melbourne Cup', 'Dubai World Cup'],
    d: ['Epsom Derby', 'Breeders\' Cup Classic', 'Gran Premio de Madrid'],
    t: ['Torneo de Seis Naciones', 'Masters de Augusta', 'Regata Oxford-Cambridge', 'Rally Dakar', 'Isla de Man TT']
  },
  {
    c: 'Categorías oficiales por peso en el boxeo profesional masculino',
    f: ['Peso pesado', 'Peso wélter', 'Peso medio', 'Peso pluma'],
    m: ['Peso ligero', 'Peso mosca', 'Peso semipesado'],
    d: ['Peso superwélter', 'Peso crucero', 'Peso supergallo'],
    t: ['Peso atómico', 'Peso gigante', 'Peso titanio', 'Peso galáctico', 'Peso ultra']
  },
  {
    c: 'Superficies y tipos de pista homologados en el tenis profesional',
    f: ['Tierra batida roja', 'Pista dura de cemento', 'Hierba natural', 'Tierra batida verde'],
    m: ['Moqueta indoor', 'Resina sintética', 'Tierra batida azul'],
    d: ['Hierba sintética', 'Pista rápida de madera', 'Pista de goma'],
    t: ['Arena de playa', 'Grava volcánica', 'Nieve prensada', 'Césped artificial con arena de pádel', 'Asfalto rugoso']
  },
  {
    c: 'Torneos de tenis masculinos de la categoría oficial ATP Masters 1000',
    f: ['Madrid Open', 'Roma', 'Montecarlo', 'Indian Wells'],
    m: ['Miami Open', 'Cincinnati', 'París-Bercy'],
    d: ['Canadá', 'Shanghái', 'Hamburgo'],
    t: ['Roland Garros', 'Wimbledon', 'Abierto de Australia', 'Abierto de Estados Unidos', 'Trofeo Conde de Godó']
  },
  {
    c: 'Pruebas y fases reglamentarias de una competición de triatlón estándar',
    f: ['Natación en aguas abiertas', 'Ciclismo en carretera', 'Carrera a pie', 'Transición T1'],
    m: ['Transición T2', 'Salida de natación', 'Giro en boya'],
    d: ['Punto de avituallamiento', 'Línea de monte de bici', 'Meta en recta'],
    t: ['Tiro con pistola', 'Salto de obstáculos a caballo', 'Lanzamiento de jabalina', 'Remo de banco fijo', 'Patinaje en línea']
  },
  {
    c: 'Distancias y segmentos de la prueba del triatlón Ironman completo',
    f: ['3.8 kilómetros de natación', '180 kilómetros de ciclismo', '42.2 kilómetros de carrera', 'Corte de tiempo de 17 horas'],
    m: ['Transición de agua a bicicleta', 'Transición de bicicleta a carrera', 'Maratón final'],
    d: ['Natación en bahía abierta', 'Subida ciclista con viento cruzado', 'Avituallamiento cada 10 km'],
    t: ['Sprint de 100 metros', 'Descenso en kayak', 'Escalada en búlder', 'Tiro con arco', 'Carrera de vallas']
  },
  {
    c: 'Deportes náuticos y acuáticos disputados en superficie o piscina',
    f: ['Natación sincronizada', 'Saltos de trampolín', 'Waterpolo', 'Aguas abiertas'],
    m: ['Surf de olas', 'Vela ligera', 'Piragüismo en esprint'],
    d: ['Remo olímpico', 'Kitesurf', 'Esquí náutico'],
    t: ['Aquagym recreativo', 'Buceo recreativo con escafandra', 'Snorkel turístico', 'Pesca submarina', 'Paseo en moto de agua']
  },

  // 61 - 70: Atletismo, Gimnasia y Béisbol
  {
    c: 'Aparatos oficiales de la gimnasia artística masculina',
    f: ['Suelo', 'Caballo con arcos', 'Anillas', 'Salto de potro'],
    m: ['Barras paralelas', 'Barra fija', 'Mesa de salto'],
    d: ['Foso de recepción', 'Trampolín de salto', 'Magnesiero'],
    t: ['Barra de equilibrio', 'Barras asimétricas', 'Cinta de rítmica', 'Mazas de rítmica', 'Aro de rítmica']
  },
  {
    c: 'Aparatos oficiales de la gimnasia rítmica de competición',
    f: ['Cinta', 'Pelota', 'Aro', 'Mazas'],
    m: ['Cuerda', 'Conjunto mixto de dos aparatos', 'Tapiz de competición'],
    d: ['Estribillo gimnástico', 'Aro de polietileno', 'Maza engarzable'],
    t: ['Barra fija', 'Salto de potro', 'Anillas', 'Barras paralelas', 'Caballo con arcos']
  },
  {
    c: 'Posiciones defensivas en el terreno de juego del béisbol',
    f: ['Lanzador', 'Receptor', 'Primera base', 'Campocorto'],
    m: ['Segunda base', 'Tercera base', 'Jardinero central'],
    d: ['Jardinero izquierdo', 'Jardinero derecho', 'Bateador designado'],
    t: ['Quarterback', 'Pívot bajo', 'Líbero de zona', 'Extremo izquierdo', 'Portero de línea']
  },
  {
    c: 'Estadios emblemáticos de las Grandes Ligas de Béisbol (MLB)',
    f: ['Yankee Stadium', 'Fenway Park', 'Dodger Stadium', 'Wrigley Field'],
    m: ['Oracle Park', 'Minute Maid Park', 'Busch Stadium'],
    d: ['Kauffman Stadium', 'PNC Park', 'Camden Yards'],
    t: ['Madison Square Garden', 'MetLife Stadium', 'Crypto.com Arena', 'United Center', 'Lambeau Field']
  },
  {
    c: 'Atletas masculinos ganadores de la medalla de oro olímpica en los 100 metros lisos',
    f: ['Usain Bolt', 'Carl Lewis', 'Jesse Owens', 'Maurice Greene'],
    m: ['Justin Gatlin', 'Linford Christie', 'Donovan Bailey'],
    d: ['Marcell Jacobs', 'Noah Lyles', 'Allan Wells'],
    t: ['Tyson Gay', 'Asafa Powell', 'Yohan Blake', 'Michael Johnson', 'David Rudisha']
  },
  {
    c: 'Maratones urbanos que forman parte de los World Marathon Majors',
    f: ['Maratón de Boston', 'Maratón de Nueva York', 'Maratón de Londres', 'Maratón de Berlín'],
    m: ['Maratón de Chicago', 'Maratón de Tokio', 'Maratón de Sídney'],
    d: ['Medalla Six Star', 'Abbott World Marathon Majors', 'Clasificación por tiempos'],
    t: ['Maratón de Madrid', 'Maratón de Valencia', 'Maratón de París', 'Maratón de Barcelona', 'Maratón de Roma']
  },
  {
    c: 'Franquicias que han ganado el trofeo de la Super Bowl en la NFL',
    f: ['New England Patriots', 'Pittsburgh Steelers', 'Dallas Cowboys', 'San Francisco 49ers'],
    m: ['Kansas City Chiefs', 'Green Bay Packers', 'New York Giants'],
    d: ['Denver Broncos', 'Las Vegas Raiders', 'Washington Commanders'],
    t: ['Buffalo Bills', 'Minnesota Vikings', 'Detroit Lions', 'Cleveland Browns', 'Atlanta Falcons']
  },
  {
    c: 'Quarterbacks históricos ganadores de la Super Bowl de la NFL',
    f: ['Tom Brady', 'Patrick Mahomes', 'Peyton Manning', 'Joe Montana'],
    m: ['Aaron Rodgers', 'Drew Brees', 'Eli Manning'],
    d: ['John Elway', 'Terry Bradshaw', 'Brett Favre'],
    t: ['Dan Marino', 'Jim Kelly', 'Cam Newton', 'Josh Allen', 'Lamar Jackson']
  },
  {
    c: 'Pilotos que han ganado las 500 Millas de Indianápolis (Indy 500)',
    f: ['Juan Pablo Montoya', 'Hélio Castroneves', 'Takuma Sato', 'Emerson Fittipaldi'],
    m: ['Mario Andretti', 'Dario Franchitti', 'A.J. Foyt'],
    d: ['Rick Mears', 'Al Unser', 'Will Power'],
    t: ['Lewis Hamilton', 'Michael Schumacher', 'Sebastian Vettel', 'Ayrton Senna', 'Max Verstappen']
  },
  {
    c: 'Pilotos de automovilismo ganadores de las 24 Horas de Le Mans en la categoría reina',
    f: ['Fernando Alonso', 'Jacky Ickx', 'Tom Kristensen', 'Graham Hill'],
    m: ['Brendon Hartley', 'Sébastien Buemi', 'Kazuki Nakajima'],
    d: ['Derek Bell', 'Emanuele Pirro', 'Frank Biela'],
    t: ['Michael Schumacher', 'Ayrton Senna', 'Lewis Hamilton', 'Niki Lauda', 'Alain Prost']
  },

  // 71 - 80: Tenis Histórico y Clásicos del Deporte
  {
    c: 'Tenistas masculinos que han ganado más de 5 títulos de Grand Slam individual',
    f: ['Novak Djokovic', 'Rafael Nadal', 'Roger Federer', 'Pete Sampras'],
    m: ['Björn Borg', 'Andre Agassi', 'Ivan Lendl'],
    d: ['Jimmy Connors', 'John McEnroe', 'Mats Wilander'],
    t: ['Andy Murray', 'Stan Wawrinka', 'Carlos Alcaraz', 'Gustavo Kuerten', 'Lleyton Hewitt']
  },
  {
    c: 'Tenistas masculinos que han completado el Career Grand Slam individual',
    f: ['Rafael Nadal', 'Roger Federer', 'Novak Djokovic', 'Andre Agassi'],
    m: ['Rod Laver', 'Roy Emerson', 'Fred Perry'],
    d: ['Don Budge', 'Ken Rosewall', 'Lew Hoad'],
    t: ['Pete Sampras', 'Björn Borg', 'Ivan Lendl', 'John McEnroe', 'Boris Becker']
  },
  {
    c: 'Sedes y pabellones cerrados que han albergado las ATP Finals de tenis',
    f: ['O2 Arena de Londres', 'Pala Alpitour de Turín', 'Madison Square Garden', 'Qizhong Arena de Shanghái'],
    m: ['Festhalle de Fráncfort', 'Pabellón Atlántico de Lisboa', 'Palacio de Deportes de Hannover'],
    d: ['Astrodome de Houston', 'Kooyong Stadium', 'Tokyo Metropolitan Gymnasium'],
    t: ['Arthur Ashe Stadium', 'Philippe Chatrier', 'Pista Central de Wimbledon', 'Rod Laver Arena', 'Caja Mágica']
  },
  {
    c: 'Deportistas masculinos galardonados con el Premio Laureus al Mejor Deportista Mundial',
    f: ['Roger Federer', 'Usain Bolt', 'Rafael Nadal', 'Lionel Messi'],
    m: ['Novak Djokovic', 'Lewis Hamilton', 'Michael Schumacher'],
    d: ['Tiger Woods', 'Sebastian Vettel', 'Max Verstappen'],
    t: ['Cristiano Ronaldo', 'LeBron James', 'Michael Phelps', 'Kobe Bryant', 'Fernando Alonso']
  },
  {
    c: 'Escuderías campeonas del Mundial de Constructores de Fórmula 1',
    f: ['Ferrari', 'Mercedes', 'Red Bull Racing', 'McLaren'],
    m: ['Williams', 'Renault', 'Lotus'],
    d: ['Brawn GP', 'Benetton', 'Brabham'],
    t: ['Sauber', 'Toro Rosso', 'Haas', 'Aston Martin', 'Toyota F1']
  },
  {
    c: 'Circuitos del Mundial de MotoGP que se disputan o se han disputado en España',
    f: ['Circuito de Jerez', 'Circuit de Barcelona-Catalunya', 'Circuito Ricardo Tormo', 'MotorLand Aragón'],
    m: ['Circuito del Jarama', 'Circuito de Montjuïc', 'Circuito de Calafat'],
    d: ['Circuito de Albacete', 'Circuito de Los Arcos', 'Circuito de Guadalope'],
    t: ['Circuito de Mónaco', 'Silverstone', 'Mugello', 'Assen', 'Le Mans']
  },
  {
    c: 'Equipos que han ganado la Copa de Europa / Champions League tres o más veces consecutivas',
    f: ['Real Madrid', 'Ajax de Ámsterdam', 'Bayern Múnich', 'Liverpool'],
    m: ['AC Milan', 'Inter de Milán', 'Nottingham Forest'],
    d: ['Benfica', 'Juventus', 'Chelsea'],
    t: ['FC Barcelona', 'Manchester United', 'Arsenal', 'Paris Saint-Germain', 'Atlético de Madrid']
  },
  {
    c: 'Personalidades que han ganado la Copa del Mundo de fútbol como jugador y como seleccionador',
    f: ['Mário Zagallo', 'Franz Beckenbauer', 'Didier Deschamps', 'Diego Maradona'],
    m: ['Johan Cruyff', 'Carlo Ancelotti', 'Zinedine Zidane'],
    d: ['Pelé', 'Vicente del Bosque', 'Pep Guardiola'],
    t: ['Jürgen Klopp', 'José Mourinho', 'Alex Ferguson', 'Arsène Wenger', 'Diego Simeone']
  },
  {
    c: 'Apodos oficiales de selecciones nacionales de fútbol reconocidas',
    f: ['La Roja', 'La Albiceleste', 'La Canarinha', 'Les Bleus'],
    m: ['Gli Azzurri', 'Die Mannschaft', 'La Oranje'],
    d: ['Los Charrúas', 'Los Cafeteros', 'Los Leones del Atlas'],
    t: ['Los Toros Rojos', 'Los Dragones Dorados', 'Las Águilas del Norte', 'Los Centuriones', 'La Furia Galáctica']
  },
  {
    c: 'Competiciones oficiales que forman parte de las cinco grandes ligas europeas de fútbol',
    f: ['LaLiga', 'Premier League', 'Serie A', 'Bundesliga'],
    m: ['Ligue 1', 'Primeira Liga', 'Eredivisie'],
    d: ['Superliga de Turquía', 'Liga Belga', 'Premiership Escocesa'],
    t: ['MLS de Estados Unidos', 'Brasileirão', 'Saudi Pro League', 'Liga MX', 'Superliga Argentina']
  },

  // 81 - 90: Pádel, Balonmano y Deportes de Raqueta
  {
    c: 'Jugadores masculinos que han alcanzado el número 1 del ranking mundial de pádel',
    f: ['Fernando Belasteguín', 'Juan Lebrón', 'Alejandro Galán', 'Agustín Tapia'],
    m: ['Arturo Coello', 'Paquito Navarro', 'Juan Martín Díaz'],
    d: ['Sanyo Gutiérrez', 'Maxi Sánchez', 'Pablo Lima'],
    t: ['Rafael Nadal', 'Carlos Alcaraz', 'Novak Djokovic', 'Roger Federer', 'Andy Murray']
  },
  {
    c: 'Selecciones nacionales masculinas campeonas del Mundial de Balonmano',
    f: ['Francia', 'España', 'Dinamarca', 'Suecia'],
    m: ['Alemania', 'Rusia', 'Croacia'],
    d: ['Catar', 'Polonia', 'Islandia'],
    t: ['Noruega', 'Egipto', 'Brasil', 'Argentina', 'Hungría']
  },
  {
    c: 'Clubes que han ganado la EHF Champions League de balonmano masculino',
    f: ['FC Barcelona Balonmano', 'THW Kiel', 'SC Magdeburgo', 'BM Ciudad Real'],
    m: ['Veszprém', 'Montpellier Handball', 'RK Vardar'],
    d: ['SG Flensburg-Handewitt', 'Vive Kielce', 'Portland San Antonio'],
    t: ['Paris Saint-Germain Fútbol', 'Real Madrid Balonmano', 'Bayern Múnich Balonmano', 'Atlético de Madrid Fútbol', 'Juventus']
  },
  {
    c: 'Acciones de puntuación reglamentarias en el rugby a 15',
    f: ['Ensayo', 'Transformación', 'Golpe de castigo', 'Drop goal'],
    m: ['Ensayo de castigo', 'Melé cerrada', 'Tackle defensivo'],
    d: ['Ruck en suelo', 'Maul en avance', 'Saque de lateral'],
    t: ['Touchdown', 'Home run', 'Penalti córner', 'Canasta triple', 'Gol de córner']
  },
  {
    c: 'Modalidades oficiales del patinaje sobre hielo reconocidas por la ISU',
    f: ['Patinaje artístico individual', 'Danza sobre hielo', 'Patinaje de velocidad en pista larga', 'Patinaje de velocidad en pista corta'],
    m: ['Patinaje artístico por parejas', 'Patinaje sincronizado', 'Patinaje de fondo sobre hielo'],
    d: ['Salto Axel', 'Salto Lutz', 'Salto Salchow'],
    t: ['Patinaje en línea callejero', 'Skateboard vert', 'Hockey sobre patines tradicional', 'Roller derby', 'Curling']
  },
  {
    c: 'Puntuaciones y términos técnicos del juego del golf',
    f: ['Drive', 'Putt', 'Birdie', 'Eagle'],
    m: ['Bogey', 'Albatros', 'Bunker'],
    d: ['Rough', 'Fairway', 'Green'],
    t: ['Smash', 'Dejada a la red', 'Revés cortado', 'Touchdown', 'Strikeout']
  },
  {
    c: 'Pruebas de carreras en atletismo de velocidad pura al aire libre',
    f: ['100 metros lisos', '200 metros lisos', '400 metros lisos', 'Relevo 4x100 metros'],
    m: ['Relevo 4x400 metros', '110 metros vallas', '400 metros vallas'],
    d: ['100 metros vallas', 'Relevo 4x400 mixto', '60 metros lisos'],
    t: ['800 metros lisos', '1.500 metros lisos', '3.000 metros obstáculos', '5.000 metros lisos', '10.000 metros lisos']
  },
  {
    c: 'Pruebas oficiales de saltos del atletismo de pista y campo',
    f: ['Salto de longitud', 'Salto de altura', 'Salto con pértiga', 'Triple salto'],
    m: ['Técnica Fosbury Flop', 'Pértiga de fibra', 'Tabla de batida'],
    d: ['Fase de hop-step-jump', 'Colchoneta de caída', 'Listón de altura'],
    t: ['Salto de trampolín en piscina', 'Salto base', 'Salto de esquí en nieve', 'Lanzamiento de peso', 'Puenting']
  },
  {
    c: 'Clubes que han conquistado el título de la Copa del Rey de fútbol en España',
    f: ['FC Barcelona', 'Athletic Club', 'Real Madrid', 'Atlético de Madrid'],
    m: ['Valencia CF', 'Sevilla FC', 'Real Betis'],
    d: ['Real Sociedad', 'Deportivo de La Coruña', 'RCD Espanyol'],
    t: ['Villarreal CF', 'Celta de Vigo', 'Getafe CF', 'CA Osasuna', 'Girona FC']
  },
  {
    c: 'Jugadores de baloncesto españoles que han ganado el anillo de campeón de la NBA',
    f: ['Pau Gasol', 'Marc Gasol', 'Serge Ibaka', 'Ricky Rubio'],
    m: ['José Manuel Calderón', 'Rudy Fernández', 'Sergio Rodríguez'],
    d: ['Juancho Hernangómez', 'Willy Hernangómez', 'Víctor Claver'],
    t: ['Facundo Campazzo', 'Luka Dončić', 'Dirk Nowitzki', 'Tony Parker', 'Goran Dragić']
  },

  // 91 - 100: Curiosidades, Récords y Grandes Figuras
  {
    c: 'Líderes históricos en triples anotados en la temporada regular de la NBA',
    f: ['Stephen Curry', 'Ray Allen', 'James Harden', 'Reggie Miller'],
    m: ['Klay Thompson', 'Damian Lillard', 'Kyle Korver'],
    d: ['Vince Carter', 'Jason Terry', 'Paul George'],
    t: ['Shaquille O\'Neal', 'Kareem Abdul-Jabbar', 'Dwight Howard', 'Giannis Antetokounmpo', 'Ben Simmons']
  },
  {
    c: 'Futbolistas que han ganado la Copa del Mundo en dos o más ediciones',
    f: ['Pelé', 'Cafú', 'Ronaldo Nazário', 'Garrincha'],
    m: ['Daniel Passarella', 'Mário Zagallo', 'Vavá'],
    d: ['Didi', 'Gilmar', 'Djalma Santos'],
    t: ['Lionel Messi', 'Diego Maradona', 'Zinedine Zidane', 'Andrés Iniesta', 'Kylian Mbappé']
  },
  {
    c: 'Tenistas que han alcanzado 20 o más títulos individuales de Grand Slam',
    f: ['Novak Djokovic', 'Rafael Nadal', 'Roger Federer', 'Margaret Court'],
    m: ['Serena Williams', 'Steffi Graf', 'Martina Navratilova'],
    d: ['Chris Evert', 'Helen Wills Moody', 'Bill Tilden'],
    t: ['Pete Sampras', 'Björn Borg', 'Andre Agassi', 'Jimmy Connors', 'John McEnroe']
  },
  {
    c: 'Clubes que han conquistado la máxima competición de clubes de baloncesto en Europa (Euroliga)',
    f: ['Real Madrid', 'CSKA Moscú', 'Maccabi Tel Aviv', 'Panathinaikos'],
    m: ['Olympiacos', 'FC Barcelona', 'Anadolu Efes'],
    d: ['Virtus Bolonia', 'Žalgiris Kaunas', 'Fenerbahçe'],
    t: ['Paris Basketball', 'ALBA Berlín', 'Valencia Basket', 'Bayern Múnich Baloncesto', 'Baskonia']
  },
  {
    c: 'Pilotos españoles que han ganado el Rally Dakar en alguna de sus categorías',
    f: ['Carlos Sainz', 'Marc Coma', 'Nani Roma', 'Laia Sanz'],
    m: ['Cristina Gutiérrez', 'Gerard Farrés', 'Oriol Mena'],
    d: ['Isidre Esteve', 'Armand Monleón', 'Tosha Schareina'],
    t: ['Fernando Alonso', 'Pedro de la Rosa', 'Jorge Lorenzo', 'Dani Sordo', 'Álex Crivillé']
  },
  {
    c: 'Pilotos o copilotos españoles campeones del mundo en el Campeonato Mundial de Rally (WRC)',
    f: ['Carlos Sainz', 'Luis Moya', 'Dani Sordo', 'Marc Martí'],
    m: ['Xevi Pons', 'Nil Solans', 'Jan Solans'],
    d: ['Borja Rozada', 'Cándido Carrera', 'Carlos del Barrio'],
    t: ['Fernando Alonso', 'Marc Márquez', 'Pedro Martínez de la Rosa', 'Jaime Alguersuari', 'Roberto Merhi']
  },
  {
    c: 'Deportistas olímpicos con ocho o más medallas de oro en Juegos Olímpicos',
    f: ['Michael Phelps', 'Usain Bolt', 'Carl Lewis', 'Mark Spitz'],
    m: ['Paavo Nurmi', 'Larisa Latynina', 'Caeleb Dressel'],
    d: ['Ray Ewry', 'Matt Biondi', 'Jenny Thompson'],
    t: ['Mo Farah', 'Kipchoge Keino', 'Haile Gebrselassie', 'Eliud Kipchoge', 'Ian Thorpe']
  },
  {
    c: 'Jugadores que formaron parte del legendario Dream Team de baloncesto de EE.UU. en Barcelona 1992',
    f: ['Michael Jordan', 'Magic Johnson', 'Larry Bird', 'Charles Barkley'],
    m: ['Karl Malone', 'John Stockton', 'Patrick Ewing'],
    d: ['Scottie Pippen', 'David Robinson', 'Clyde Drexler'],
    t: ['Shaquille O\'Neal', 'Isiah Thomas', 'Kobe Bryant', 'Hakeem Olajuwon', 'Reggie Miller']
  },
  {
    c: 'Clubes que han ganado la Copa de la UEFA / UEFA Europa League en dos o más ocasiones',
    f: ['Sevilla FC', 'Inter de Milán', 'Liverpool FC', 'Juventus'],
    m: ['Atlético de Madrid', 'Chelsea FC', 'Tottenham Hotspur'],
    d: ['Borussia Mönchengladbach', 'Feyenoord', 'Eintracht Frankfurt'],
    t: ['FC Barcelona', 'Arsenal FC', 'AS Roma', 'Athletic Club', 'Paris Saint-Germain']
  },
  {
    c: 'Futbolistas que han ganado tanto la Copa del Mundo como la UEFA Champions League en su carrera',
    f: ['Lionel Messi', 'Zinedine Zidane', 'Ronaldinho', 'Rivaldo'],
    m: ['Andrés Iniesta', 'Xavi Hernández', 'Iker Casillas'],
    d: ['Sergio Ramos', 'Gerard Piqué', 'Manuel Neuer'],
    t: ['Cristiano Ronaldo', 'Diego Maradona', 'Pelé', 'Gianluigi Buffon', 'Ronaldo Nazário']
  }
];

export default Array.from({ length: 100 }, (_, idx) => {
  const p = plantillas[idx];
  return {
    id: `deportes_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});