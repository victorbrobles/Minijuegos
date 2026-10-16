export default Array.from({ length: 20 }, (_, idx) => {
  const plantillas = [
    {
      c: 'Tenistas masculinos ganadores de torneos de Grand Slam',
      f: ['Rafael Nadal', 'Roger Federer', 'Novak Djokovic', 'Carlos Alcaraz'],
      m: ['Andy Murray', 'Andre Agassi', 'Pete Sampras'],
      d: ['Daniil Medvedev', 'Stan Wawrinka', 'Jannik Sinner'],
      t: ['Alexander Zverev', 'Stefanos Tsitsipas', 'Nick Kyrgios', 'Casper Ruud', 'David Ferrer']
    },
    {
      c: 'Equipos pertenecientes a la NBA (Baloncesto)',
      f: ['Los Angeles Lakers', 'Golden State Warriors', 'Boston Celtics', 'Chicago Bulls'],
      m: ['Miami Heat', 'San Antonio Spurs', 'Dallas Mavericks'],
      d: ['Denver Nuggets', 'Milwaukee Bucks', 'Phoenix Suns'],
      t: ['Real Madrid Baloncesto', 'Seattle Sounders', 'New York Yankees', 'Kansas City Chiefs', 'LA Galaxy']
    },
    {
      c: 'Pilotos campeones del mundo de Fórmula 1',
      f: ['Fernando Alonso', 'Lewis Hamilton', 'Max Verstappen', 'Michael Schumacher'],
      m: ['Sebastian Vettel', 'Ayrton Senna', 'Niki Lauda'],
      d: ['Kimi Räikkönen', 'Nico Rosberg', 'Jenson Button'],
      t: ['Carlos Sainz Jr.', 'Charles Leclerc', 'Lando Norris', 'George Russell', 'Sergio Pérez']
    },
    {
      c: 'Deportes olímpicos oficiales de verano',
      f: ['Natación', 'Atletismo', 'Gimnasia artística', 'Judo'],
      m: ['Halterofilia', 'Tiro con arco', 'Esgrima'],
      d: ['Taekwondo', 'Piragüismo en eslalon', 'Hípica'],
      t: ['Pádel', 'Béisbol (permanente)', 'Fútbol sala', 'Críquet', 'Bolos']
    },
    {
      c: 'Jugadores con más de 25.000 puntos en la historia de la NBA',
      f: ['LeBron James', 'Kareem Abdul-Jabbar', 'Kobe Bryant', 'Michael Jordan'],
      m: ['Dirk Nowitzki', 'Shaquille O\'Neal', 'Kevin Durant'],
      d: ['Wilt Chamberlain', 'Carmelo Anthony', 'Moses Malone'],
      t: ['Stephen Curry', 'Giannis Antetokounmpo', 'Magic Johnson', 'Larry Bird', 'Dwyane Wade']
    },
    {
      c: 'Ciclistas ganadores del Tour de Francia',
      f: ['Miguel Induráin', 'Tadej Pogačar', 'Alberto Contador', 'Jonas Vingegaard'],
      m: ['Chris Froome', 'Eddy Merckx', 'Bernard Hinault'],
      d: ['Egan Bernal', 'Geraint Thomas', 'Carlos Sastre'],
      t: ['Lance Armstrong (desposeído)', 'Peter Sagan', 'Alejandro Valverde', 'Nairo Quintana', 'Julian Alaphilippe']
    },
    {
      c: 'Deportistas españoles ganadores de medalla de oro olímpica',
      f: ['Rafael Nadal', 'Pau Gasol', 'Mireia Belmonte', 'Carolina Marín'],
      m: ['Saúl Craviotto', 'Ruth Beitia', 'Fermín Cacho'],
      d: ['Joan Llaneras', 'David Cal', 'Marcus Cooper'],
      t: ['Fernando Alonso', 'Carlos Sainz', 'Marc Márquez', 'Sergio Ramos', 'Pedri']
    },
    {
      c: 'Pilotos campeones del mundo de MotoGP / 500cc',
      f: ['Marc Márquez', 'Valentino Rossi', 'Jorge Lorenzo', 'Dani Pedrosa (subcampeón)'],
      m: ['Mick Doohan', 'Casey Stoner', 'Francesco Bagnaia'],
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
      c: 'Atletas plusmarquistas mundiales en pruebas de pista',
      f: ['Usain Bolt', 'Carl Lewis', 'Haile Gebrselassie', 'Eliud Kipchoge'],
      m: ['Hicham El Guerrouj', 'David Rudisha', 'Michael Johnson'],
      d: ['Wayde van Niekerk', 'Kenenisa Bekele', 'Kevin Mayer'],
      t: ['Mo Farah', 'Kipchoge Keino', 'Justin Gatlin', 'Tyson Gay', 'Asafa Powell']
    },
    {
      c: 'Golfistas ganadores del Masters de Augusta',
      f: ['Tiger Woods', 'Jon Rahm', 'Sergio García', 'Jack Nicklaus'],
      m: ['Phil Mickelson', 'Seve Ballesteros', 'José María Olazábal'],
      d: ['Scottie Scheffler', 'Hideki Matsuyama', 'Dustin Johnson'],
      t: ['Rory McIlroy', 'Brooks Koepka', 'Collin Morikawa', 'Bryson DeChambeau', 'Justin Thomas']
    },
    {
      c: 'Franquicias pertenecientes a la MLB (Béisbol)',
      f: ['New York Yankees', 'Boston Red Sox', 'Los Angeles Dodgers', 'Chicago Cubs'],
      m: ['San Francisco Giants', 'Houston Astros', 'Atlanta Braves'],
      d: ['Toronto Blue Jays', 'St. Louis Cardinals', 'Philadelphia Phillies'],
      t: ['Chicago Bulls', 'Miami Heat', 'Green Bay Packers', 'Dallas Mavericks', 'Seattle Seahawks']
    },
    {
      c: 'Boxeadores campeones mundiales de peso pesado',
      f: ['Muhammad Ali', 'Mike Tyson', 'Evander Holyfield', 'Tyson Fury'],
      m: ['George Foreman', 'Lennox Lewis', 'Oleksandr Usyk'],
      d: ['Joe Frazier', 'Larry Holmes', 'Anthony Joshua'],
      t: ['Floyd Mayweather', 'Manny Pacquiao', 'Canelo Álvarez', 'Conor McGregor', 'Oscar De La Hoya']
    },
    {
      c: 'Jugadores galardonados con el MVP de la temporada de la NBA',
      f: ['Michael Jordan', 'LeBron James', 'Stephen Curry', 'Kobe Bryant'],
      m: ['Nikola Jokić', 'Giannis Antetokounmpo', 'Shaquille O\'Neal'],
      d: ['Joel Embiid', 'Dirk Nowitzki', 'Steve Nash'],
      t: ['Dwyane Wade', 'Kawhi Leonard', 'Carmelo Anthony', 'Chris Paul', 'Klay Thompson']
    },
    {
      c: 'Grandes premios (circuitos) del calendario oficial de Fórmula 1',
      f: ['Monza (Italia)', 'Silverstone (Reino Unido)', 'Mónaco', 'Spa-Francorchamps (Bélgica)'],
      m: ['Montmeló (España)', 'Suzuka (Japón)', 'Interlagos (Brasil)'],
      d: ['Zandvoort (Países Bajos)', 'Cota (Austin, EEUU)', 'Gilles Villeneuve (Canadá)'],
      t: ['Nürburgring Nordschleife', 'Le Mans', 'Indianapolis 500', 'Daytona', 'Jerez']
    },
    {
      c: 'Luchadores que han sido campeones de UFC',
      f: ['Conor McGregor', 'Khabib Nurmagomedov', 'Jon Jones', 'Ilia Topuria'],
      m: ['Israel Adesanya', 'Anderson Silva', 'Georges St-Pierre'],
      d: ['Francis Ngannou', 'Sean O\'Malley', 'Alexander Volkanovski'],
      t: ['Mike Tyson', 'Floyd Mayweather', 'Brock Lesnar (WWE)', 'Canelo Álvarez', 'The Rock']
    },
    {
      c: 'Tenistas femeninas ganadoras de torneos de Grand Slam',
      f: ['Serena Williams', 'Aryna Sabalenka', 'Iga Świątek', 'Garbiñe Muguruza'],
      m: ['Maria Sharapova', 'Venus Williams', 'Arantxa Sánchez Vicario'],
      d: ['Coco Gauff', 'Simona Halep', 'Angelique Kerber'],
      t: ['Paula Badosa', 'Ons Jabeur', 'Elina Svitolina', 'Jessica Pegula', 'Karolína Plíšková']
    },
    {
      c: 'Equipos pertenecientes a la NHL (Hockey sobre Hielo)',
      f: ['Montreal Canadiens', 'New York Rangers', 'Toronto Maple Leafs', 'Boston Bruins'],
      m: ['Chicago Blackhawks', 'Detroit Red Wings', 'Vegas Golden Knights'],
      d: ['Edmonton Oilers', 'Pittsburgh Penguins', 'Tampa Bay Lightning'],
      t: ['Los Angeles Lakers', 'New England Patriots', 'Chicago Cubs', 'Miami Dolphins', 'Golden State Warriors']
    },
    {
      c: 'Deportes olímpicos oficiales de invierno',
      f: ['Esquí alpino', 'Patinaje artístico', 'Snowboard', 'Hockey sobre hielo'],
      m: ['Curling', 'Biatlón', 'Bobsleigh'],
      d: ['Luge', 'Skeleton', 'Salto de esquí'],
      t: ['Mushing', 'Raquetas de nieve', 'Alpinismo', 'Snowkiting', 'Polo sobre nieve']
    },
    {
      c: 'Selecciones nacionales campeonas del Mundial de Baloncesto (FIBA)',
      f: ['Estados Unidos', 'España', 'Argentina', 'Yugoslavia'],
      m: ['Unión Soviética', 'Brasil', 'Alemania'],
      d: ['Serbia (heredera)', 'Rusia', 'Alemania (2023)'],
      t: ['Francia', 'Australia', 'Lituania', 'Grecia', 'Canadá']
    }
  ];

  const p = plantillas[idx];
  return {
    id: `deportes_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});