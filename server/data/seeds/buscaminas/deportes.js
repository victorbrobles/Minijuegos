// server/data/seeds/buscaminas/deportes.js

const plantillas = [
  // 1 - 10: Tenis, Baloncesto y Motor
  {
    c: 'Tenistas masculinos ganadores de torneos de Grand Slam individual',
    f: ['Rafael Nadal', 'Roger Federer', 'Novak Djokovic', 'Carlos Alcaraz'],
    m: ['Andy Murray', 'Andre Agassi', 'Pete Sampras'],
    d: ['Daniil Medvedev', 'Stan Wawrinka', 'Jannik Sinner'],
    t: ['Alexander Zverev', 'Stefanos Tsitsipas', 'Nick Kyrgios', 'Casper Ruud', 'David Ferrer']
  },
  {
    c: 'Tenistas femeninas ganadoras de torneos de Grand Slam individual',
    f: ['Serena Williams', 'Aryna Sabalenka', 'Iga Świątek', 'Garbiñe Muguruza'],
    m: ['Maria Sharapova', 'Venus Williams', 'Arantxa Sánchez Vicario'],
    d: ['Coco Gauff', 'Simona Halep', 'Angelique Kerber'],
    t: ['Paula Badosa', 'Ons Jabeur', 'Elina Svitolina', 'Jessica Pegula', 'Karolína Plíšková']
  },
  {
    c: 'Franquicias pertenecientes a la NBA (Baloncesto)',
    f: ['Los Angeles Lakers', 'Golden State Warriors', 'Boston Celtics', 'Chicago Bulls'],
    m: ['Miami Heat', 'San Antonio Spurs', 'Dallas Mavericks'],
    d: ['Denver Nuggets', 'Milwaukee Bucks', 'Phoenix Suns'],
    t: ['Real Madrid Baloncesto', 'Seattle Sounders', 'New York Yankees', 'Kansas City Chiefs', 'LA Galaxy']
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
    c: 'Circuitos del calendario oficial de Fórmula 1',
    f: ['Monza (Italia)', 'Silverstone (Reino Unido)', 'Mónaco', 'Spa-Francorchamps (Bélgica)'],
    m: ['Montmeló (España)', 'Suzuka (Japón)', 'Interlagos (Brasil)'],
    d: ['Zandvoort (Países Bajos)', 'Circuito de las Américas (EEUU)', 'Gilles Villeneuve (Canadá)'],
    t: ['Nürburgring Nordschleife', 'Le Mans (Sarthe)', 'Indianapolis 500', 'Daytona Speedway', 'Jerez Ángel Nieto']
  },
  {
    c: 'Pilotos campeones del mundo de MotoGP / 500cc',
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
    d: ['Inglaterra', 'Alemania Federal (RFA)', 'Argentina (1978)'],
    t: ['Países Bajos', 'Portugal', 'Bélgica', 'Croacia', 'Colombia']
  },
  {
    c: 'Clubes que han ganado la UEFA Champions League / Copa de Europa',
    f: ['Real Madrid', 'FC Barcelona', 'Bayern Múnich', 'Liverpool'],
    m: ['AC Milan', 'Manchester United', 'Chelsea'],
    d: ['Manchester City', 'Inter de Milán', 'Borussia Dortmund'],
    t: ['Paris Saint-Germain', 'Arsenal', 'Atlético de Madrid', 'Tottenham', 'Bayer Leverkusen']
  },
  {
    c: 'Selecciones ganadoras de la Eurocopa de la UEFA',
    f: ['España', 'Alemania', 'Italia', 'Francia'],
    m: ['Portugal', 'Países Bajos', 'Grecia'],
    d: ['Dinamarca', 'Rusia (Unión Soviética)', 'República Checa (Checoslovaquia)'],
    t: ['Inglaterra', 'Bélgica', 'Croacia', 'Suecia', 'Suiza']
  },
  {
    c: 'Futbolistas ganadores del Balón de Oro masculino',
    f: ['Lionel Messi', 'Cristiano Ronaldo', 'Karim Benzema', 'Luka Modrić'],
    m: ['Ronaldinho', 'Kaká', 'Zinedine Zidane'],
    d: ['Ronaldo Nazário', 'Andriy Shevchenko', 'Pavel Nedvěd'],
    t: ['Neymar', 'Andrés Iniesta', 'Xavi Hernández', 'Thierry Henry', 'Robert Lewandowski']
  },
  {
    c: 'Futbolistas con más de 100 goles en la UEFA Champions League',
    f: ['Cristiano Ronaldo', 'Lionel Messi', 'Robert Lewandowski', 'Karim Benzema'],
    m: ['Raúl González', 'Thomas Müller', 'Ruud van Nistelrooy'],
    d: ['Thierry Henry', 'Kylian Mbappé', 'Andriy Shevchenko'],
    t: ['Neymar', 'Zlatan Ibrahimović', 'Luis Suárez', 'Erling Haaland', 'Didier Drogba']
  },
  {
    c: 'Clubes campeones de la Copa Libertadores de América',
    f: ['Boca Juniors', 'River Plate', 'Flamengo', 'Santos FC'],
    m: ['Palmeiras', 'São Paulo', 'Independiente'],
    d: ['Grêmio', 'Peñarol', 'Nacional de Montevideo'],
    t: ['Club América', 'Cruz Azul', 'Chivas de Guadalajara', 'Inter Miami', 'Los Angeles FC']
  },
  {
    c: 'Clubes campeones de la Premier League inglesa (era moderna desde 1992)',
    f: ['Manchester United', 'Manchester City', 'Chelsea', 'Arsenal'],
    m: ['Liverpool', 'Leicester City', 'Blackburn Rovers'],
    d: ['Manchester City (cuatro seguidas)', 'Arsenal (Los Invencibles)', 'Chelsea (Mourinho)'],
    t: ['Tottenham Hotspur', 'Newcastle United', 'Everton', 'Aston Villa', 'West Ham']
  },
  {
    c: 'Clubes campeones de LaLiga española en el siglo XXI',
    f: ['Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Valencia CF'],
    m: ['Deportivo de La Coruña', 'Real Madrid (Liga de los 100 puntos)', 'Barça (Sextete)'],
    d: ['Valencia (Rafa Benítez)', 'Atlético (2013-14)', 'Atlético (2020-21)'],
    t: ['Sevilla FC', 'Athletic Club', 'Real Sociedad', 'Villarreal CF', 'Real Betis']
  },
  {
    c: 'Entrenadores ganadores de la UEFA Champions League',
    f: ['Carlo Ancelotti', 'Pep Guardiola', 'Zinedine Zidane', 'José Mourinho'],
    m: ['Jürgen Klopp', 'Alex Ferguson', 'Luis Enrique'],
    d: ['Thomas Tuchel', 'Hansi Flick', 'Vicente del Bosque'],
    t: ['Diego Simeone', 'Mauricio Pochettino', 'Arsène Wenger', 'Mikel Arteta', 'Unai Emery']
  },
  {
    c: 'Estadios que han acogido finales de la Copa del Mundo de la FIFA',
    f: ['Maracaná (Río de Janeiro)', 'Santiago Bernabéu (Madrid)', 'Estadio Lusail (Qatar)', 'Stade de France (París)'],
    m: ['Rose Bowl (Pasadena)', 'Olympiastadion (Berlín)', 'Estadio Azteca (México)'],
    d: ['Wembley histórico (Londres)', 'Estadio Centenario (Montevideo)', 'Estadio Internacional de Yokohama'],
    t: ['Camp Nou', 'San Siro', 'Allianz Arena', 'Anfield', 'Old Trafford']
  },

  // 21 - 30: Ciclismo, Atletismo y Juegos Olímpicos
  {
    c: 'Ciclistas ganadores de la clasificación general del Tour de Francia',
    f: ['Miguel Induráin', 'Tadej Pogačar', 'Alberto Contador', 'Jonas Vingegaard'],
    m: ['Chris Froome', 'Eddy Merckx', 'Bernard Hinault'],
    d: ['Egan Bernal', 'Geraint Thomas', 'Carlos Sastre'],
    t: ['Lance Armstrong (desposeído)', 'Peter Sagan', 'Alejandro Valverde', 'Nairo Quintana', 'Julian Alaphilippe']
  },
  {
    c: 'Ciclistas que han ganado las tres Grandes Vueltas (Tour, Giro y Vuelta)',
    f: ['Eddy Merckx', 'Bernard Hinault', 'Alberto Contador', 'Chris Froome'],
    m: ['Vincenzo Nibali', 'Jacques Anquetil', 'Felice Gimondi'],
    d: ['Contador (Giro-Tour-Vuelta)', 'Froome (cuatro Tours)', 'Nibali (Tour 2014)'],
    t: ['Miguel Induráin', 'Tadej Pogačar', 'Primož Roglič', 'Alejandro Valverde', 'Nairo Quintana']
  },
  {
    c: 'Atletas masculinos plusmarquistas mundiales en pruebas de pista',
    f: ['Usain Bolt (100m y 200m)', 'Carl Lewis (100m)', 'Michael Johnson (400m)', 'David Rudisha (800m)'],
    m: ['Hicham El Guerrouj (1500m)', 'Kenenisa Bekele (5000m)', 'Wayde van Niekerk (400m)'],
    d: ['Karsten Warholm (400m vallas)', 'Armand Duplantis (pértiga)', 'Kevin Mayer (decatlón)'],
    t: ['Mo Farah', 'Justin Gatlin', 'Tyson Gay', 'Asafa Powell', 'Yohan Blake']
  },
  {
    c: 'Ciudades que han sido sede de los Juegos Olímpicos de Verano',
    f: ['Barcelona (1992)', 'Londres (2012)', 'París (2024)', 'Tokio (2020)'],
    m: ['Río de Janeiro (2016)', 'Pekín (2008)', 'Sídney (2000)'],
    d: ['Atlanta (1996)', 'Seúl (1988)', 'Los Ángeles (1984)'],
    t: ['Madrid', 'Buenos Aires', 'Berlín (2000)', 'Roma (2004)', 'Nueva York']
  },
  {
    c: 'Ciudades que han sido sede de los Juegos Olímpicos de Invierno',
    f: ['Sochi (2014)', 'Vancouver (2010)', 'Turín (2006)', 'Salt Lake City (2002)'],
    m: ['Pyeongchang (2018)', 'Pekín (2022)', 'Nagano (1998)'],
    d: ['Lillehammer (1994)', 'Albertville (1992)', 'Calgary (1988)'],
    t: ['Madrid', 'Ginebra', 'Helsinki', 'Oslo (verano)', 'Estocolmo']
  },
  {
    c: 'Deportistas españoles ganadores de medalla de oro en Juegos Olímpicos',
    f: ['Rafael Nadal', 'Carolina Marín', 'Mireia Belmonte', 'Saúl Craviotto'],
    m: ['Ruth Beitia', 'Fermín Cacho', 'Joan Llaneras'],
    d: ['Marcus Cooper Walz', 'David Cal', 'Támara Echegoyen'],
    t: ['Fernando Alonso', 'Carlos Sainz', 'Marc Márquez', 'Dani Pedrosa', 'Pau Gasol (plata)']
  },
  {
    c: 'Deportes olímpicos oficiales de verano',
    f: ['Natación', 'Atletismo', 'Gimnasia artística', 'Judo'],
    m: ['Halterofilia', 'Tiro con arco', 'Esgrima'],
    d: ['Taekwondo', 'Piragüismo en eslalon', 'Pentatlón moderno'],
    t: ['Pádel', 'Fútbol sala', 'Críquet', 'Bolos', 'Squash']
  },
  {
    c: 'Deportes olímpicos oficiales de invierno',
    f: ['Esquí alpino', 'Patinaje artístico', 'Snowboard', 'Hockey sobre hielo'],
    m: ['Curling', 'Biatlón', 'Bobsleigh'],
    d: ['Luge', 'Skeleton', 'Salto de esquí'],
    t: ['Mushing', 'Raquetas de nieve', 'Alpinismo', 'Snowkiting', 'Polo sobre nieve']
  },
  {
    c: 'Golfistas ganadores del prestigioso Masters de Augusta',
    f: ['Tiger Woods', 'Jon Rahm', 'Sergio García', 'Jack Nicklaus'],
    m: ['Phil Mickelson', 'Seve Ballesteros', 'José María Olazábal'],
    d: ['Scottie Scheffler', 'Hideki Matsuyama', 'Dustin Johnson'],
    t: ['Rory McIlroy', 'Brooks Koepka', 'Collin Morikawa', 'Bryson DeChambeau', 'Justin Thomas']
  },
  {
    c: 'Boxeadores campeones del mundo en la categoría de peso pesado',
    f: ['Muhammad Ali', 'Mike Tyson', 'Evander Holyfield', 'Tyson Fury'],
    m: ['George Foreman', 'Lennox Lewis', 'Oleksandr Usyk'],
    d: ['Joe Frazier', 'Larry Holmes', 'Anthony Joshua'],
    t: ['Floyd Mayweather', 'Manny Pacquiao', 'Canelo Álvarez', 'Conor McGregor', 'Oscar De La Hoya']
  },

  // 31 - 40: Artes Marciales, Deportes de Contacto y Rugby
  {
    c: 'Luchadores que han sido campeones de la UFC',
    f: ['Conor McGregor', 'Khabib Nurmagomedov', 'Jon Jones', 'Ilia Topuria'],
    m: ['Israel Adesanya', 'Anderson Silva', 'Georges St-Pierre'],
    d: ['Francis Ngannou', 'Sean O\'Malley', 'Alexander Volkanovski'],
    t: ['Floyd Mayweather', 'Mike Tyson', 'Canelo Álvarez', 'Brock Lesnar (solo WWE)', 'The Rock']
  },
  {
    c: 'Selecciones nacionales campeonas de la Copa del Mundo de Rugby (XV)',
    f: ['Nueva Zelanda (All Blacks)', 'Sudáfrica (Springboks)', 'Australia (Wallabies)', 'Inglaterra'],
    m: ['Nueva Zelanda (2011)', 'Nueva Zelanda (2015)', 'Sudáfrica (2019)'],
    d: ['Sudáfrica (2023)', 'Inglaterra (2003)', 'Australia (1999)'],
    t: ['Francia', 'Irlanda', 'Gales', 'Escocia', 'Argentina']
  },
  {
    c: 'Selecciones participantes en el prestigioso Torneo de las Seis Naciones de Rugby',
    f: ['Inglaterra', 'Francia', 'Gales', 'Irlanda'],
    m: ['Escocia', 'Italia', 'Francia (Le XV de France)'],
    d: ['Irlanda (Trébol)', 'Gales (Dragones)', 'Escocia (Cardo)'],
    t: ['Nueva Zelanda', 'Sudáfrica', 'Australia', 'Argentina', 'Georgia']
  },
  {
    c: 'Disciplinas y artes marciales reconocidas como deportes olímpicos',
    f: ['Judo', 'Taekwondo', 'Boxeo', 'Lucha libre olímpica'],
    m: ['Lucha grecorromana', 'Esgrima', 'Karate (Tokio 2020)'],
    d: ['Judo femenino (-48kg)', 'Taekwondo (+80kg)', 'Lucha libre (-74kg)'],
    t: ['Kickboxing', 'Muay Thai', 'Jiu-jitsu brasileño', 'Aikido', 'Krav Maga']
  },
  {
    c: 'Estilos de natación oficiales reglamentados por la FINA / World Aquatics',
    f: ['Crol (estilo libre)', 'Espalda', 'Braza (pecho)', 'Mariposa'],
    m: ['Estilos individual (cuatro estilos)', 'Relevo libre', 'Relevo de estilos'],
    d: ['50 metros mariposa', '200 metros braza', '400 metros estilos'],
    t: ['Nado de perro', 'Buceo libre', 'Natación sincronizada (es artística)', 'Waterpolo', 'Salto de trampolín']
  },
  {
    c: 'Pruebas que integran la competición olímpica del Decatlón masculino',
    f: ['100 metros lisos', 'Salto de longitud', 'Lanzamiento de peso', 'Salto de altura'],
    m: ['400 metros lisos', '110 metros vallas', 'Lanzamiento de disco'],
    d: ['Salto con pértiga', 'Lanzamiento de jabalina', '1.500 metros lisos'],
    t: ['Maratón', 'Triple salto', 'Lanzamiento de martillo', '3.000 metros obstáculos', '200 metros lisos']
  },
  {
    c: 'Pruebas de lanzamientos en el atletismo de pista y campo',
    f: ['Lanzamiento de jabalina', 'Lanzamiento de peso (bala)', 'Lanzamiento de disco', 'Lanzamiento de martillo'],
    m: ['Jabalina masculina (800g)', 'Peso masculino (7.26kg)', 'Disco masculino (2kg)'],
    d: ['Martillo masculino (7.26kg)', 'Jabalina femenina (600g)', 'Disco femenino (1kg)'],
    t: ['Salto con pértiga', 'Salto de altura', 'Lanzamiento de granada', 'Lanzamiento de herradura', 'Tiro con arco']
  },
  {
    c: 'Equipos pertenecientes a la NHL (Liga Nacional de Hockey sobre Hielo)',
    f: ['Montreal Canadiens', 'New York Rangers', 'Toronto Maple Leafs', 'Boston Bruins'],
    m: ['Chicago Blackhawks', 'Detroit Red Wings', 'Vegas Golden Knights'],
    d: ['Edmonton Oilers', 'Pittsburgh Penguins', 'Tampa Bay Lightning'],
    t: ['Los Angeles Lakers', 'New England Patriots', 'Chicago Cubs', 'Miami Dolphins', 'Golden State Warriors']
  },
  {
    c: 'Nadadores con múltiples medallas de oro olímpicas en su palmarés',
    f: ['Michael Phelps', 'Mark Spitz', 'Ian Thorpe', 'Caeleb Dressel'],
    m: ['Ryan Lochte', 'Sun Yang', 'Pieter van den Hoogenband'],
    d: ['Alexander Popov', 'Matt Biondi', 'Léon Marchand'],
    t: ['Usain Bolt', 'Carl Lewis', 'Eliud Kipchoge', 'Mo Farah', 'David Popovici (un solo oro)']
  },
  {
    c: 'Grandes Monumentos del ciclismo en ruta (las cinco clásicas históricas)',
    f: ['Milán-San Remo', 'París-Roubaix', 'Tour de Flandes', 'Lieja-Bastoña-Lieja'],
    m: ['Giro de Lombardía', 'París-Roubaix (Infierno del Norte)', 'Lieja (La Decana)'],
    d: ['Flandes (Muros adoquinados)', 'San Remo (Primavera)', 'Lombardía (Hojas muertas)'],
    t: ['Amstel Gold Race', 'Flecha Valona', 'Clásica de San Sebastián', 'Strade Bianche', 'Giro de Emilia']
  },

  // 41 - 50: Baloncesto y FIBA
  {
    c: 'Selecciones nacionales campeonas de la Copa del Mundo de Baloncesto FIBA',
    f: ['Estados Unidos', 'España', 'Argentina', 'Yugoslavia'],
    m: ['Unión Soviética', 'Brasil', 'Alemania'],
    d: ['Serbia (heredera FIBA)', 'Alemania (2023)', 'España (2019)'],
    t: ['Francia', 'Australia', 'Lituania', 'Grecia', 'Canadá']
  },
  {
    c: 'Jugadores con anillos de campeón de la NBA como figuras principales',
    f: ['Michael Jordan (6 anillos)', 'Kobe Bryant (5 anillos)', 'LeBron James (4 anillos)', 'Stephen Curry (4 anillos)'],
    m: ['Magic Johnson (5 anillos)', 'Tim Duncan (5 anillos)', 'Shaquille O\'Neal (4 anillos)'],
    d: ['Bill Russell (11 anillos)', 'Larry Bird (3 anillos)', 'Hakeem Olajuwon (2 anillos)'],
    t: ['Charles Barkley (0 anillos)', 'Karl Malone (0 anillos)', 'Allen Iverson (0 anillos)', 'Steve Nash (0 anillos)', 'Chris Paul (0 anillos)']
  },
  {
    c: 'Clubes que han ganado la Euroliga de Baloncesto en la era moderna',
    f: ['Real Madrid', 'FC Barcelona', 'Panathinaikos', 'Olympiacos'],
    m: ['CSKA Moscú', 'Maccabi Tel Aviv', 'Anadolu Efes'],
    d: ['Fenerbahçe', 'Virtus Bolonia', 'Zalgiris Kaunas'],
    t: ['Boston Celtics', 'Valencia Basket', 'Bayern Múnich Baloncesto', 'ALBA Berlín', 'AS Mónaco Basket']
  },
  {
    c: 'Jugadores europeos que han sido All-Star en la NBA',
    f: ['Pau Gasol', 'Dirk Nowitzki', 'Luka Dončić', 'Giannis Antetokounmpo'],
    m: ['Nikola Jokić', 'Tony Parker', 'Marc Gasol'],
    d: ['Rudy Gobert', 'Kristaps Porziņģis', 'Domantas Sabonis'],
    t: ['Ricky Rubio', 'José Manuel Calderón', 'Juancho Hernangómez', 'Sergio Rodríguez', 'Facundo Campazzo']
  },
  {
    c: 'Posiciones y roles tácticos reglamentarios en el baloncesto',
    f: ['Base (Point Guard)', 'Escolta (Shooting Guard)', 'Alero (Small Forward)', 'Pívot (Center)'],
    m: ['Ala-pívot (Power Forward)', 'Combo guard', 'Point forward'],
    d: ['Cinco abierto (Stretch five)', 'Sexto hombre', 'Especialista defensivo'],
    t: ['Líbero', 'Delantero centro', 'Quarterback', 'Mediapunta', 'Pitcher']
  },
  {
    c: 'Equipos de fútbol que han logrado el Triplete europeo (Liga, Copa y Champions)',
    f: ['FC Barcelona (2009)', 'FC Barcelona (2015)', 'Bayern Múnich (2013)', 'Manchester City (2023)'],
    m: ['Manchester United (1999)', 'Inter de Milán (2010)', 'Bayern Múnich (2020)'],
    d: ['Celtic Glasgow (1967)', 'Ajax de Ámsterdam (1972)', 'PSV Eindhoven (1988)'],
    t: ['Real Madrid', 'Liverpool FC', 'Chelsea FC', 'AC Milan', 'Juventus']
  },
  {
    c: 'Futbolistas con más de 700 goles oficiales reconocidos en su carrera',
    f: ['Cristiano Ronaldo', 'Lionel Messi', 'Pelé', 'Romário'],
    m: ['Ferenc Puskás', 'Gerd Müller', 'Robert Lewandowski'],
    d: ['Josef Bican', 'Jimmy Jones', 'Eusébio'],
    t: ['Diego Maradona', 'Ronaldo Nazário', 'Thierry Henry', 'Zlatan Ibrahimović (rozó pero no llegó a 600 oficiales de club/país élite)', 'Karim Benzema']
  },
  {
    c: 'Porteros galardonados con el Trofeo Yashin de France Football',
    f: ['Alisson Becker (2019)', 'Gianluigi Donnarumma (2021)', 'Thibaut Courtois (2022)', 'Emiliano Martínez (2023)'],
    m: ['Emiliano Martínez (2024)', 'Alisson (Liverpool)', 'Courtois (Real Madrid)'],
    d: ['Donnarumma (Euro 2020)', 'Dibu Martínez (Mundial Qatar)', 'Courtois (Final París)'],
    t: ['Iker Casillas (no existía)', 'Gianluigi Buffon (no existía)', 'Manuel Neuer (no existía)', 'Petr Čech (no existía)', 'David de Gea']
  },
  {
    c: 'Selecciones masculinas ganadoras de la Copa América de fútbol',
    f: ['Argentina', 'Uruguay', 'Brasil', 'Chile'],
    m: ['Colombia', 'Perú', 'Paraguay'],
    d: ['Bolivia (1963)', 'Chile (2015)', 'Chile (2016)'],
    t: ['México (invitada)', 'Ecuador', 'Venezuela', 'Estados Unidos', 'Costa Rica']
  },
  {
    c: 'Jugadores que han marcado 5 goles en un solo partido de UEFA Champions League',
    f: ['Lionel Messi (vs Leverkusen)', 'Erling Haaland (vs Leipzig)', 'Luiz Adriano (vs BATE Borisov)', 'Lionel Messi (2012)'],
    m: ['Erling Haaland (2023)', 'Luiz Adriano (2014)', 'Haaland (Manchester City)'],
    d: ['Messi (5 goles en octavos)', 'Haaland (5 goles en 57 minutos)', 'Luiz Adriano (Shakhtar Donetsk)'],
    t: ['Cristiano Ronaldo', 'Robert Lewandowski', 'Kylian Mbappé', 'Karim Benzema', 'Neymar']
  },

  // 51 - 60: Deportes de Invierno, Extremos y Náutica
  {
    c: 'Modalidades oficiales del esquí alpino de competición',
    f: ['Descenso (Downhill)', 'Eslalon (Slalom)', 'Eslalon Gigante', 'Súper Gigante (Super-G)'],
    m: ['Combinada alpina', 'Paralelo', 'Eslalon nocturno'],
    d: ['Super-G de velocidad', 'Descenso de la Streif (Kitzbühel)', 'Gigante de Alta Badia'],
    t: ['Saltos de esquí (es esquí nórdico)', 'Esquí de fondo', 'Biatlón', 'Snowboard cross', 'Telemark olímpico']
  },
  {
    c: 'Tipos de embarcaciones a vela utilizadas en regatas olímpicas o internacionales',
    f: ['Laser (ILCA)', '49er', 'Nacra 17', '470'],
    m: ['Finn', 'Formula Kite', 'iQFoil'],
    d: ['49er FX', 'Star (histórico)', 'Tornado'],
    t: ['Kayak de mar', 'Canoa C1', 'Piragua K2', 'Yate de recreo', 'Moto de agua']
  },
  {
    c: 'Maniobras y trucos clásicos del skateboarding callejero y rampa',
    f: ['Ollie', 'Kickflip', 'Heelflip', 'Grind'],
    m: ['Boardslide', 'Pop Shove-it', 'Varial flip'],
    d: ['Hardflip', 'Tre flip (360 flip)', 'Noseslide'],
    t: ['Slam dunk', 'Smash cruzado', 'Touchdown', 'Drive cortado', 'Ace directo']
  },
  {
    c: 'Pruebas puntuables de la Triple Corona de la hípica estadounidense',
    f: ['Derby de Kentucky', 'Preakness Stakes', 'Belmont Stakes', 'Churchill Downs (sede Derby)'],
    m: ['Pimlico (sede Preakness)', 'Belmont Park (sede)', 'Secretariat (ganador)'],
    d: ['American Pharoah (ganador)', 'Justify (ganador)', 'Seattle Slew (ganador)'],
    t: ['Ascot Gold Cup', 'Prix de l\'Arc de Triomphe', 'Gran Premio de Madrid', 'Melbourne Cup', 'Dubai World Cup']
  },
  {
    c: 'Categorías de peso oficiales en el boxeo profesional masculino',
    f: ['Peso pesado', 'Peso wélter', 'Peso medio', 'Peso pluma'],
    m: ['Peso ligero', 'Peso mosca', 'Peso semipesado'],
    d: ['Peso superwélter', 'Peso crucero', 'Peso supergallo'],
    t: ['Peso atómico', 'Peso ultra', 'Peso gigante', 'Peso titanio', 'Peso galáctico']
  },
  {
    c: 'Superficies oficiales de las pistas de tenis del circuito ATP / WTA',
    f: ['Tierra batida (arcilla roja)', 'Pista dura (cemento / decoturf)', 'Hierba natural (césped)', 'Tierra batida verde (har-tru)'],
    m: ['Pista dura cubierta (indoor)', 'Moqueta (indoor carpet histórica)', 'Tierra batida azul (Madrid 2012)'],
    d: ['Hierba de Wimbledon (ryegrass 100%)', 'Pista rápida de plexicushion', 'GreenSet'],
    t: ['Arena de playa', 'Parqué flotante', 'Grava volcánica', 'Nieve prensada', 'Césped artificial con arena de pádel']
  },
  {
    c: 'Torneos de tenis de la categoría ATP Masters 1000',
    f: ['Madrid Open', 'Roma (Internazionali d\'Italia)', 'Montecarlo', 'Indian Wells'],
    m: ['Miami Open', 'Cincinnati', 'París-Bercy'],
    d: ['Canadá (Toronto/Montreal)', 'Shanghái', 'Hamburgo (hasta 2008)'],
    t: ['Roland Garros (Grand Slam)', 'Wimbledon (Grand Slam)', 'Open de Australia (Grand Slam)', 'US Open (Grand Slam)', 'Godó de Barcelona (ATP 500)']
  },
  {
    c: 'Fases y componentes de un triatlón de distancia olímpica',
    f: ['1.500 metros de natación', '40 kilómetros de ciclismo', '10 kilómetros de carrera a pie', 'Zona de transición 1 (T1)'],
    m: ['Zona de transición 2 (T2)', 'Salida desde pontón', 'Box de transición'],
    d: ['Drafting permitido', 'Giro en boya de natación', 'Meta en recta de tartán'],
    t: ['Prueba de tiro con pistola', 'Salto de obstáculos a caballo', 'Lanzamiento de jabalina', 'Remo en banco fijo', 'Patinaje en línea']
  },
  {
    c: 'Competiciones y pruebas del Ironman de larga distancia',
    f: ['3.86 km de natación', '180.2 km de bicicleta', '42.2 km de maratón a pie', 'Campeonato Mundial de Kona (Hawái)'],
    m: ['Corte de tiempo de 17 horas', 'Transición T1 natación-bici', 'Transición T2 bici-carrera'],
    d: ['Kona Ali\'i Drive', 'Subida a Hawi en bici', 'Energy Lab a pie'],
    t: ['Carrera de 100 metros lisos', 'Sprint en velódromo', 'Descenso en kayak', 'Prueba de escalada en búlder', 'Tiro con arco']
  },
  {
    c: 'Deportes acuáticos reconocidos por el Comité Olímpico Internacional',
    f: ['Natación en piscina', 'Natación sincronizada (artística)', 'Saltos de trampolín y plataforma', 'Waterpolo'],
    m: ['Aguas abiertas (maratón 10km)', 'Salto sincronizado', 'Plataforma de 10 metros'],
    d: ['Trampolín de 3 metros', 'Equipo acrobático artístico', 'Solo técnico artístico'],
    t: ['Aquagym de mantenimiento', 'Buceo recreativo con escafandra', 'Snorkel superficial', 'Pesca submarina', 'Motos acuáticas de carrera']
  },

  // 61 - 70: Atletismo, Gimnasia y Béisbol
  {
    c: 'Aparatos oficiales de la gimnasia artística masculina',
    f: ['Suelo (ejercicios de suelo)', 'Caballo con arcos', 'Anillas', 'Salto de potro'],
    m: ['Barras paralelas', 'Barra fija', 'Caballo con arcos de madera'],
    d: ['Anillas de suspensión', 'Salto sobre tabla de pique', 'Barra fija de acero'],
    t: ['Barra de equilibrio (femenino)', 'Barras asimétricas (femenino)', 'Cinta de rítmica', 'Mazas de rítmica', 'Aro de rítmica']
  },
  {
    c: 'Aparatos y elementos de la gimnasia rítmica individual y conjuntos',
    f: ['Cinta', 'Pelota', 'Aro', 'Mazas'],
    m: ['Cuerda', 'Conjunto mixto de dos aparatos', 'Ejercicio de cinco aros'],
    d: ['Cinta de seda de 6 metros', 'Mazas de plástico engarzables', 'Aro de polietileno'],
    t: ['Barra fija', 'Salto de potro', 'Anillas', 'Barras paralelas', 'Caballo con arcos']
  },
  {
    c: 'Posiciones defensivas en el terreno de juego de béisbol',
    f: ['Pitcher (lanzador)', 'Catcher (receptor)', 'Primera base', 'Campocorto (shortstop)'],
    m: ['Segunda base', 'Tercera base', 'Jardinero central (center field)'],
    d: ['Jardinero izquierdo (left field)', 'Jardinero derecho (right field)', 'Bateador designado'],
    t: ['Quarterback', 'Pívot bajo', 'Líbero de zona', 'Extremo izquierdo', 'Portero de línea']
  },
  {
    c: 'Estadios míticos de las Grandes Ligas de Béisbol (MLB)',
    f: ['Yankee Stadium (Nueva York)', 'Fenway Park (Boston)', 'Dodger Stadium (Los Ángeles)', 'Wrigley Field (Chicago)'],
    m: ['Oracle Park (San Francisco)', 'Minute Maid Park (Houston)', 'Busch Stadium (St. Louis)'],
    d: ['Kauffman Stadium (Kansas City)', 'PNC Park (Pittsburgh)', 'Camden Yards (Baltimore)'],
    t: ['Madison Square Garden', 'MetLife Stadium', 'Crypto.com Arena', 'United Center', 'Lambeau Field']
  },
  {
    c: 'Atletas ganadores de la medalla de oro olímpica en los 100 metros lisos masculinos',
    f: ['Usain Bolt', 'Carl Lewis', 'Jesse Owens', 'Maurice Greene'],
    m: ['Justin Gatlin', 'Linford Christie', 'Donovan Bailey'],
    d: ['Marcell Jacobs', 'Noah Lyles', 'Allan Wells'],
    t: ['Tyson Gay', 'Asafa Powell', 'Yohan Blake', 'Michael Johnson', 'David Rudisha']
  },
  {
    c: 'Maratones urbanos que integran los World Marathon Majors (los seis grandes)',
    f: ['Maratón de Boston', 'Maratón de Nueva York', 'Maratón de Londres', 'Maratón de Berlín'],
    m: ['Maratón de Chicago', 'Maratón de Tokio', 'Maratón de Sídney (candidato/séptimo)'],
    d: ['Boston (Heartbreak Hill)', 'Berlín (circuito más rápido del mundo)', 'Londres (Tower Bridge)'],
    t: ['Maratón de Madrid', 'Maratón de Valencia', 'Maratón de París', 'Maratón de Barcelona', 'Maratón de Roma']
  },
  {
    c: 'Equipos que han ganado la Super Bowl de la NFL en múltiples ocasiones',
    f: ['New England Patriots', 'Pittsburgh Steelers', 'Dallas Cowboys', 'San Francisco 49ers'],
    m: ['Kansas City Chiefs', 'Green Bay Packers', 'New York Giants'],
    d: ['Denver Broncos', 'Las Vegas / Oakland Raiders', 'Washington Commanders'],
    t: ['Buffalo Bills (0 títulos)', 'Minnesota Vikings (0 títulos)', 'Detroit Lions (0 títulos)', 'Cleveland Browns (0 títulos)', 'Atlanta Falcons (0 títulos)']
  },
  {
    c: 'Quarterbacks legendarios ganadores de la Super Bowl en la NFL',
    f: ['Tom Brady (7 títulos)', 'Patrick Mahomes', 'Peyton Manning', 'Joe Montana'],
    m: ['Aaron Rodgers', 'Drew Brees', 'Eli Manning'],
    d: ['John Elway', 'Terry Bradshaw', 'Brett Favre'],
    t: ['Dan Marino (0 títulos)', 'Jim Kelly (0 títulos)', 'Cam Newton (0 títulos)', 'Josh Allen', 'Lamar Jackson']
  },
  {
    c: 'Pilotos que han ganado las 500 Millas de Indianápolis (Indy 500)',
    f: ['Juan Pablo Montoya', 'Fernando Alonso (participante/lideró)', 'Hélio Castroneves', 'Takuma Sato'],
    m: ['Emerson Fittipaldi', 'Mario Andretti', 'Dario Franchitti'],
    d: ['A.J. Foyt', 'Rick Mears', 'Al Unser'],
    t: ['Lewis Hamilton', 'Michael Schumacher', 'Sebastian Vettel', 'Ayrton Senna', 'Max Verstappen']
  },
  {
    c: 'Pilotos ganadores de las prestigiosas 24 Horas de Le Mans en categoría reina',
    f: ['Fernando Alonso', 'Jacky Ickx', 'Tom Kristensen (9 victorias)', 'Graham Hill'],
    m: ['Brendon Hartley', 'Sébastien Buemi', 'Kazuki Nakajima'],
    d: ['Derek Bell', 'Emanuele Pirro', 'Frank Biela'],
    t: ['Michael Schumacher', 'Ayrton Senna', 'Lewis Hamilton', 'Niki Lauda', 'Alain Prost']
  },

  // 71 - 80: Tenis Histórico y Clásicos del Deporte
  {
    c: 'Tenistas masculinos que han ganado más de 5 títulos de Grand Slam',
    f: ['Novak Djokovic (24)', 'Rafael Nadal (22)', 'Roger Federer (20)', 'Pete Sampras (14)'],
    m: ['Björn Borg (11)', 'Andre Agassi (8)', 'Ivan Lendl (8)'],
    d: ['Jimmy Connors (8)', 'John McEnroe (7)', 'Mats Wilander (7)'],
    t: ['Andy Murray (3)', 'Stan Wawrinka (3)', 'Carlos Alcaraz (4 en 2024)', 'Gustavo Kuerten (3)', 'Lleyton Hewitt (2)']
  },
  {
    c: 'Tenistas masculinos que han completado el Career Grand Slam (ganar los cuatro)',
    f: ['Rafael Nadal', 'Roger Federer', 'Novak Djokovic', 'Andre Agassi'],
    m: ['Rod Laver', 'Roy Emerson', 'Fred Perry'],
    d: ['Don Budge', 'Nadal (oro olímpico + 4 grandes)', 'Agassi (Golden Slam de carrera)'],
    t: ['Pete Sampras (nunca ganó Roland Garros)', 'Björn Borg (nunca ganó US Open)', 'Ivan Lendl (nunca ganó Wimbledon)', 'John McEnroe (nunca ganó Roland Garros)', 'Boris Becker (nunca ganó Roland Garros)']
  },
  {
    c: 'Pabellones y sedes cubiertas donde se han disputado las ATP Finals de tenis',
    f: ['O2 Arena de Londres', 'Pala Alpitour de Turín', 'Madison Square Garden (Nueva York)', 'Qizhong Forest Sports City (Shanghái)'],
    m: ['Festhalle de Fráncfort', 'Palacio de Deportes de Hannover', 'Pavilhão Atlântico de Lisboa'],
    d: ['Astrodome de Houston', 'Kooyong Stadium de Melbourne', 'Sydney Entertainment Centre'],
    t: ['Arthur Ashe Stadium (pista descubierta)', 'Philippe Chatrier (Roland Garros)', 'Centre Court de Wimbledon', 'Rod Laver Arena', 'Caja Mágica (Masters 1000)']
  },
  {
    c: 'Deportistas ganadores del prestigioso Premio Laureus al Mejor Deportista Masculino',
    f: ['Roger Federer', 'Usain Bolt', 'Rafael Nadal', 'Lionel Messi'],
    m: ['Novak Djokovic', 'Lewis Hamilton', 'Michael Schumacher'],
    d: ['Tiger Woods', 'Sebastian Vettel', 'Max Verstappen'],
    t: ['Cristiano Ronaldo', 'LeBron James', 'Michael Phelps', 'Kobe Bryant', 'Fernando Alonso']
  },
  {
    c: 'Escuderías campeonas del Mundial de Constructores de Fórmula 1',
    f: ['Ferrari', 'Mercedes', 'Red Bull Racing', 'McLaren'],
    m: ['Williams', 'Renault', 'Lotus'],
    d: ['Brawn GP (2009)', 'Benetton', 'Brabham'],
    t: ['Sauber', 'Toro Rosso / AlphaTauri', 'Haas', 'Aston Martin (F1 moderna)', 'Toyota F1']
  },
  {
    c: 'Circuitos permanentes de motociclismo del Mundial de MotoGP en España',
    f: ['Circuito de Jerez-Ángel Nieto', 'Circuit de Barcelona-Catalunya (Montmeló)', 'Circuito Ricardo Tormo (Valencia)', 'MotorLand Aragón'],
    m: ['Jerez (Gran Premio de España)', 'Montmeló (Gran Premio de Cataluña)', 'Cheste (cierre de temporada)'],
    d: ['Alcañiz (Gran Premio de Aragón)', 'Trazado FIM de MotorLand', 'Curva Dry Sack de Jerez'],
    t: ['Circuito del Jarama (sin MotoGP actual)', 'Circuito de Albacete', 'Circuito de Navarra', 'Ascari Race Resort', 'Circuito de Calafat']
  },
  {
    c: 'Equipos de fútbol que han ganado la Copa de Europa / Champions League tres veces consecutivas',
    f: ['Real Madrid (1956-1960)', 'Ajax de Ámsterdam (1971-1973)', 'Bayern Múnich (1974-1976)', 'Real Madrid (2016-2018)'],
    m: ['Real Madrid de Di Stéfano (cinco seguidas)', 'Ajax de Johan Cruyff (tres seguidas)', 'Bayern de Franz Beckenbauer (tres seguidas)'],
    d: ['Real Madrid de Zinedine Zidane (tres seguidas)', 'Ajax de Kovács', 'Bayern de Udo Lattek y Cramer'],
    t: ['FC Barcelona de Guardiola (nunca consecutivas)', 'AC Milan de Sacchi (dos seguidas)', 'Liverpool de Paisley (dos seguidas)', 'Inter de Helenio Herrera (dos seguidas)', 'Nottingham Forest (dos seguidas)']
  },
  {
    c: 'Futbolistas que han ganado la Copa del Mundo como jugador y como entrenador',
    f: ['Mário Zagallo (Brasil)', 'Franz Beckenbauer (Alemania)', 'Didier Deschamps (Francia)', 'Zagallo (1958 y 1970)'],
    m: ['Beckenbauer (1974 y 1990)', 'Deschamps (1998 y 2018)', 'Zagallo (bicampeón jugador y DT)'],
    d: ['Beckenbauer (capitán y seleccionador)', 'Deschamps (capitán y seleccionador)', 'Zagallo (asistente en 1994)'],
    t: ['Diego Maradona', 'Johan Cruyff', 'Zinedine Zidane', 'Pelé', 'Carlo Ancelotti']
  },
  {
    c: 'Nombres o apodos oficiales de selecciones nacionales de fútbol',
    f: ['La Roja (España)', 'La Albiceleste (Argentina)', 'La Canarinha (Brasil)', 'Les Bleus (Francia)'],
    m: ['Gli Azzurri (Italia)', 'Die Mannschaft (Alemania)', 'La Oranje (Países Bajos)'],
    d: ['Los Charrúas (Uruguay)', 'Los Cafeteros (Colombia)', 'Los Leones del Atlas (Marruecos)'],
    t: ['Los Toros Rojos', 'Los Dragones Dorados', 'Las Águilas del Norte', 'Los Centuriones', 'La Furia Galáctica']
  },
  {
    c: 'Ligas de fútbol profesional que componen las "Cinco Grandes Ligas Europeas"',
    f: ['LaLiga (España)', 'Premier League (Inglaterra)', 'Serie A (Italia)', 'Bundesliga (Alemania)'],
    m: ['Ligue 1 (Francia)', 'Primera División de España', 'Premier League británica'],
    d: ['Serie A TIM', 'Bundesliga alemana', 'Ligue 1 McDonald\'s / Uber'],
    t: ['Primeira Liga (Portugal)', 'Eredivisie (Países Bajos)', 'MLS (Estados Unidos)', 'Brasileirão', 'Saudi Pro League']
  },

  // 81 - 90: Pádel, Balonmano y Deportes de Raqueta
  {
    c: 'Jugadores que han alcanzado el número 1 del ranking mundial de pádel',
    f: ['Fernando Belasteguín', 'Juan Lebrón', 'Alejandro Galán', 'Agustín Tapia'],
    m: ['Arturo Coello', 'Paquito Navarro', 'Juan Martín Díaz'],
    d: ['Sanyo Gutiérrez', 'Maxi Sánchez', 'Pablo Lima'],
    t: ['Rafael Nadal', 'Carlos Alcaraz', 'Novak Djokovic', 'Roger Federer', 'Andy Murray']
  },
  {
    c: 'Selecciones nacionales campeonas del Mundial de Balonmano masculino',
    f: ['Francia', 'España', 'Dinamarca', 'Suecia'],
    m: ['Alemania', 'Rusia', 'Croacia'],
    d: ['Dinamarca (tres consecutivas)', 'Francia (seis títulos)', 'España (2005 y 2013)'],
    t: ['Noruega', 'Islandia', 'Polonia', 'Egipto', 'Brasil']
  },
  {
    c: 'Clubes que han ganado la EHF Champions League de balonmano masculino',
    f: ['FC Barcelona Balonmano', 'THW Kiel', 'SC Magdeburgo', 'Ciudad Real (histórico)'],
    m: ['Veszprém', 'Montpellier Handball', 'RK Vardar'],
    d: ['SG Flensburg-Handewitt', 'Vive Kielce', 'Portland San Antonio'],
    t: ['Paris Saint-Germain (fútbol)', 'Real Madrid Balonmano (no existe)', 'Bayern Múnich Balonmano', 'Atlético de Madrid fútbol', 'Juventus']
  },
  {
    c: 'Elementos reglamentarios y puntuación en el juego del Rugby Unión (a 15)',
    f: ['Ensayo (Try / 5 puntos)', 'Transformación (Conversión / 2 puntos)', 'Golpe de castigo (Penalty / 3 puntos)', 'Drop goal (3 puntos)'],
    m: ['Melé (Scrum)', 'Saque de banda (Lineout)', 'Tackle o placaje'],
    d: ['Ensayo de castigo (Penalty try / 7 puntos)', 'Ruck (fase de suelo)', 'Maul (fase de avance)'],
    t: ['Touchdown (fútbol americano)', 'Home run (béisbol)', 'Corner corto (hockey)', 'Tiro libre de 1 punto', 'Penalti córner']
  },
  {
    c: 'Disciplinas oficiales del patinaje sobre hielo',
    f: ['Patinaje artístico individual', 'Danza sobre hielo', 'Patinaje de velocidad en pista larga', 'Patinaje de velocidad en pista corta (Short track)'],
    m: ['Patinaje artístico por parejas', 'Salto Axel cuádruple', 'Salto Lutz'],
    d: ['Salto Toe loop', 'Salto Salchow', 'Prueba de persecución por equipos'],
    t: ['Patinaje sobre ruedas en línea', 'Skateboard vert', 'Hockey sobre patines tradicional', 'Roller derby', 'Curling de escobas']
  },
  {
    c: 'Términos y golpes técnicos oficiales del juego del golf',
    f: ['Drive (golpe de salida)', 'Putt (golpe en green)', 'Birdie (-1 golpe)', 'Eagle (-2 golpes)'],
    m: ['Bogey (+1 golpe)', 'Albatros (-3 golpes)', 'Bunker (trampa de arena)'],
    d: ['Rough (hierba alta)', 'Fairway (calle despejada)', 'Green de hierba corta'],
    t: ['Smash de remate', 'Dejada a la red', 'Revés cortado', 'Touchdown', 'Strikeout']
  },
  {
    c: 'Pruebas de carreras en atletismo consideradas pruebas de velocidad pura',
    f: ['100 metros lisos', '200 metros lisos', '400 metros lisos', 'Relevo 4x100 metros'],
    m: ['60 metros lisos en pista cubierta', 'Relevo 4x400 metros', '110 metros vallas'],
    d: ['100 metros vallas (femenino)', '400 metros vallas', 'Relevo 4x400 metros mixto'],
    t: ['800 metros lisos (medio fondo)', '1.500 metros lisos (medio fondo)', '3.000 metros obstáculos', '5.000 metros fondo', '10.000 metros fondo']
  },
  {
    c: 'Pruebas de saltos en el atletismo de pista y campo',
    f: ['Salto de longitud', 'Salto de altura', 'Salto con pértiga', 'Triple salto'],
    m: ['Fosbury Flop (técnica de altura)', 'Pértiga de fibra de vidrio', 'Bateo de tabla en longitud'],
    d: ['Fase de hop-step-jump (triple)', 'Listón de altura', 'Colchoneta de caída de pértiga'],
    t: ['Salto de trampolín en piscina', 'Salto base con paracaídas', 'Salto de esquí en nieve', 'Lanzamiento de peso', 'Puenting recreativo']
  },
  {
    c: 'Nombres de equipos que han ganado la Copa del Rey de fútbol en España',
    f: ['FC Barcelona', 'Athletic Club', 'Real Madrid', 'Atlético de Madrid'],
    m: ['Valencia CF', 'Sevilla FC', 'Real Betis'],
    d: ['Real Sociedad', 'Deportivo de La Coruña', 'RCD Espanyol'],
    t: ['Villarreal CF (nunca la ganó)', 'Celta de Vigo (0 títulos)', 'Getafe CF (0 títulos)', 'CA Osasuna (0 títulos)', 'Girona FC (0 títulos)']
  },
  {
    c: 'Jugadores españoles que han ganado el anillo de campeón de la NBA',
    f: ['Pau Gasol (2009)', 'Pau Gasol (2010)', 'Marc Gasol (2019)', 'Serge Ibaka (2019)'],
    m: ['Pau Gasol (Los Angeles Lakers)', 'Marc Gasol (Toronto Raptors)', 'Serge Ibaka (Toronto Raptors)'],
    d: ['Gasol (anillo en Orlando 2009)', 'Gasol (anillo ante Boston 2010)', 'Marc Gasol (anillo ante Warriors)'],
    t: ['Ricky Rubio (0 anillos)', 'José Manuel Calderón (0 anillos)', 'Rudy Fernández (0 anillos)', 'Juancho Hernangómez (0 anillos)', 'Willy Hernangómez (0 anillos)']
  },

  // 91 - 100: Curiosidades, Récords y Grandes Figuras
  {
    c: 'Jugadores con récords de triples en la historia de la NBA',
    f: ['Stephen Curry', 'Ray Allen', 'James Harden', 'Reggie Miller'],
    m: ['Klay Thompson', 'Damian Lillard', 'Kyle Korver'],
    d: ['Vince Carter', 'Jason Terry', 'Paul George'],
    t: ['Shaquille O\'Neal (1 triple)', 'Kareem Abdul-Jabbar (1 triple)', 'Dwight Howard', 'Giannis Antetokounmpo', 'Ben Simmons']
  },
  {
    c: 'Futbolistas que han ganado el Mundial de fútbol en dos o más ocasiones',
    f: ['Pelé (3 títulos)', 'Cafú (2 títulos)', 'Ronaldo Nazário (2 títulos)', 'Garrincha (2 títulos)'],
    m: ['Daniel Passarella (2 títulos)', 'Zagallo (2 títulos jugador)', 'Vavá (2 títulos)'],
    d: ['Didi (2 títulos)', 'Gilmar (2 títulos)', 'Djalma Santos (2 títulos)'],
    t: ['Lionel Messi (1 título)', 'Diego Maradona (1 título)', 'Zinedine Zidane (1 título)', 'Andrés Iniesta (1 título)', 'Kylian Mbappé (1 título)']
  },
  {
    c: 'Deportistas que han superado los 20 títulos de Grand Slam en tenis (individual)',
    f: ['Novak Djokovic (24)', 'Rafael Nadal (22)', 'Roger Federer (20)', 'Margaret Court (24)'],
    m: ['Serena Williams (23)', 'Steffi Graf (22)', 'Novak Djokovic (masculino récord)'],
    d: ['Nadal (14 Roland Garros)', 'Federer (8 Wimbledon)', 'Court (era amateur/abierta)'],
    t: ['Pete Sampras (14)', 'Martina Navratilova (18)', 'Chris Evert (18)', 'Björn Borg (11)', 'Andre Agassi (8)']
  },
  {
    c: 'Clubes que han ganado la Copa de Europa de Baloncesto / Euroliga diez o más veces',
    f: ['Real Madrid Baloncesto (11 títulos)', 'Real Madrid (campeón 2023)', 'Real Madrid (campeón 2018)', 'Real Madrid (La Décima 2015)'],
    m: ['Real Madrid (era Ferrándiz)', 'Real Madrid de Lolo Sainz', 'Real Madrid de Laso'],
    d: ['Real Madrid (primer título 1964)', 'Real Madrid (campeón 1995 con Sabonis)', 'Real Madrid (más laureado FIBA/Euroliga)'],
    t: ['CSKA Moscú (8 títulos)', 'Maccabi Tel Aviv (6 títulos)', 'Panathinaikos (7 títulos)', 'Olympiacos (3 títulos)', 'FC Barcelona (2 títulos)']
  },
  {
    c: 'Pilotos españoles que han ganado el Rally Dakar en alguna categoría',
    f: ['Carlos Sainz (coches)', 'Marc Coma (motos)', 'Nani Roma (motos y coches)', 'Laia Sanz (féminas/motos)'],
    m: ['Nani Roma (doble categoría)', 'Carlos Sainz (cuatro Dakares)', 'Marc Coma (cinco Dakares)'],
    d: ['Cristina Gutiérrez (Challenger/T3)', 'Gerard Farrés (motos podio)', 'Oriol Mena'],
    t: ['Fernando Alonso (compitió sin ganar)', 'Pedro de la Rosa', 'Jorge Lorenzo', 'Dani Sordo (WRC pero no Dakar ganado)', 'Álex Crivillé']
  },
  {
    c: 'Pilotos españoles campeones del mundo de rallies (WRC)',
    f: ['Carlos Sainz (1990)', 'Carlos Sainz (1992)', 'Carlos Sainz (Toyota Celica)', 'Dani Sordo (campeón júnior JWRC)'],
    m: ['Carlos Sainz (bicampeón absoluto)', 'Luis Moya (copiloto campeón)', 'Sainz (Rally de los 1000 Lagos)'],
    d: ['Dani Sordo (subcampeonatos y victorias)', 'Nil Solans (JWRC)', 'Xevi Pons (SWRC)'],
    t: ['Fernando Alonso', 'Marc Márquez', 'Pedro Martínez de la Rosa', 'Jaime Alguersuari', 'Roberto Merhi']
  },
  {
    c: 'Atletas con más de ocho medallas de oro en los Juegos Olímpicos',
    f: ['Michael Phelps (23 oros)', 'Usain Bolt (8 oros)', 'Carl Lewis (9 oros)', 'Mark Spitz (9 oros)'],
    m: ['Paavo Nurmi (9 oros)', 'Larisa Latynina (9 oros)', 'Caeleb Dressel (9 oros)'],
    d: ['Ray Ewry (8 oros individuales)', 'Matt Biondi (8 oros)', 'Jenny Thompson (8 oros relevos)'],
    t: ['Mo Farah (4 oros)', 'Kipchoge Keino (2 oros)', 'Haile Gebrselassie (2 oros)', 'Eliud Kipchoge (2 oros)', 'Ian Thorpe (5 oros)']
  },
  {
    c: 'Grandes leyendas del baloncesto estadounidense del Dream Team de Barcelona 1992',
    f: ['Michael Jordan', 'Magic Johnson', 'Larry Bird', 'Charles Barkley'],
    m: ['Karl Malone', 'John Stockton', 'Patrick Ewing'],
    d: ['Scottie Pippen', 'David Robinson', 'Clyde Drexler'],
    t: ['Shaquille O\'Neal (no fue convocado)', 'Isiah Thomas (excluido)', 'Kobe Bryant (era niño)', 'Hakeem Olajuwon (no nacionalizado)', 'Reggie Miller']
  },
  {
    c: 'Clubes que han ganado la Copa de la UEFA / UEFA Europa League tres o más veces',
    f: ['Sevilla FC (7 títulos)', 'Inter de Milán (3 títulos)', 'Liverpool FC (3 títulos)', 'Juventus (3 títulos)'],
    m: ['Atlético de Madrid (3 títulos)', 'Sevilla (tres seguidas con Emery)', 'Atlético (2010, 2012, 2018)'],
    d: ['Sevilla (2006 y 2007)', 'Inter de Milán (años 90)', 'Liverpool (1973, 1976, 2001)'],
    t: ['Real Madrid (2 títulos)', 'FC Barcelona (0 títulos)', 'Arsenal (0 títulos)', 'Manchester United (1 título)', 'Chelsea (2 títulos)']
  },
  {
    c: 'Futbolistas que han ganado la Copa Mundial de la FIFA y la UEFA Champions League en su carrera',
    f: ['Lionel Messi', 'Zinedine Zidane', 'Ronaldinho', 'Rivaldo'],
    m: ['Andrés Iniesta', 'Xavi Hernández', 'Iker Casillas'],
    d: ['Sergio Ramos', 'Gerard Piqué', 'Manuel Neuer'],
    t: ['Cristiano Ronaldo (nunca ganó Mundial)', 'Diego Maradona (nunca ganó Champions)', 'Pelé (nunca jugó Champions)', 'Gianluigi Buffon (nunca ganó Champions)', 'Ronaldo Nazário (nunca ganó Champions)']
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