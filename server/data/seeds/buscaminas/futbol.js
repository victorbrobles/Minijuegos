// server/data/seeds/buscaminas/futbol.js

const plantillas = [
  // 1 - 10: Grandes Premios Individuales y Copas del Mundo
  {
    c: 'Futbolistas que han ganado el Balón de Oro masculino',
    f: ['Lionel Messi', 'Cristiano Ronaldo', 'Zinedine Zidane', 'Ronaldinho'],
    m: ['Luka Modric', 'Karim Benzema', 'Kaká'],
    d: ['Michael Owen', 'Pavel Nedvěd', 'George Weah'],
    t: ['Neymar Jr', 'Andrés Iniesta', 'Xavi Hernández', 'Thierry Henry', 'Robert Lewandowski']
  },
  {
    c: 'Selecciones nacionales masculinas campeonas de la Copa del Mundo de la FIFA',
    f: ['Brasil', 'Argentina', 'Alemania', 'Francia'],
    m: ['Italia', 'España', 'Inglaterra'],
    d: ['Uruguay', 'Alemania Federal (RFA)', 'Argentina (1978)'],
    t: ['Países Bajos', 'Portugal', 'Bélgica', 'Croacia', 'Colombia']
  },
  {
    c: 'Goleadores históricos de la Copa del Mundo de la FIFA',
    f: ['Miroslav Klose', 'Ronaldo Nazário', 'Gerd Müller', 'Lionel Messi'],
    m: ['Kylian Mbappé', 'Pelé', 'Just Fontaine'],
    d: ['Sándor Kocsis', 'Jürgen Klinsmann', 'Helmut Rahn'],
    t: ['Cristiano Ronaldo', 'Neymar Jr', 'Zlatan Ibrahimović', 'Wayne Rooney', 'Thierry Henry']
  },
  {
    c: 'Futbolistas brasileños campeones de la Copa del Mundo',
    f: ['Pelé', 'Ronaldo Nazário', 'Ronaldinho', 'Cafú'],
    m: ['Roberto Carlos', 'Rivaldo', 'Romário'],
    d: ['Bebeto', 'Dunga', 'Garrincha'],
    t: ['Neymar Jr', 'Dani Alves', 'Thiago Silva', 'Vinicius Jr', 'Casemiro']
  },
  {
    c: 'Futbolistas argentinos campeones de la Copa del Mundo',
    f: ['Lionel Messi', 'Diego Maradona', 'Ángel Di María', 'Mario Kempes'],
    m: ['Emiliano Martínez', 'Julián Álvarez', 'Lautaro Martínez'],
    d: ['Daniel Passarella', 'Jorge Valdano', 'Enzo Fernández'],
    t: ['Sergio Agüero', 'Javier Mascherano', 'Gabriel Batistuta', 'Gonzalo Higuaín', 'Juan Román Riquelme']
  },
  {
    c: 'Futbolistas españoles campeones de la Copa del Mundo masculina',
    f: ['Iker Casillas', 'Andrés Iniesta', 'Xavi Hernández', 'Sergio Ramos'],
    m: ['Carles Puyol', 'David Villa', 'Fernando Torres'],
    d: ['Gerard Piqué', 'Sergio Busquets', 'Cesc Fàbregas'],
    t: ['Raúl González', 'Guti', 'Fernando Hierro', 'Santiago Cañizares', 'Joaquín Sánchez']
  },
  {
    c: 'Porteros galardonados con el Trofeo Yashin o el Guante de Oro del Mundial',
    f: ['Thibaut Courtois', 'Emiliano Martínez', 'Manuel Neuer', 'Iker Casillas'],
    m: ['Gianluigi Buffon', 'Alisson Becker', 'Gianluigi Donnarumma'],
    d: ['Yassine Bounou', 'Oliver Kahn', 'Fabien Barthez'],
    t: ['David de Gea', 'Jan Oblak', 'Marc-André ter Stegen', 'Keylor Navas', 'Víctor Valdés']
  },
  {
    c: 'Futbolistas que han ganado el premio The Best de la FIFA',
    f: ['Cristiano Ronaldo', 'Lionel Messi', 'Robert Lewandowski', 'Luka Modric'],
    m: ['Zinedine Zidane', 'Ronaldinho', 'Ronaldo Nazário'],
    d: ['Kaká', 'Fabio Cannavaro', 'George Weah'],
    t: ['Neymar Jr', 'Kylian Mbappé', 'Erling Haaland', 'Antoine Griezmann', 'Mohamed Salah']
  },
  {
    c: 'Futbolistas con más de 700 goles oficiales reconocidos en su carrera',
    f: ['Cristiano Ronaldo', 'Lionel Messi', 'Pelé', 'Romário'],
    m: ['Ferenc Puskás', 'Josef Bican', 'Gerd Müller'],
    d: ['Robert Lewandowski', 'Jimmy Jones', 'Eusébio'],
    t: ['Ronaldo Nazário', 'Thierry Henry', 'Karim Benzema', 'Raúl González', 'Wayne Rooney']
  },
  {
    c: 'Dorsales emblemáticos retirados oficialmente por clubes de fútbol',
    f: ['Dorsal 3 en AC Milan (Maldini)', 'Dorsal 10 en Napoli (Maradona)', 'Dorsal 14 en Ajax (Cruyff)', 'Dorsal 6 en AC Milan (Baresi)'],
    m: ['Dorsal 10 en Brescia (Baggio)', 'Dorsal 4 en Inter (Zanetti)', 'Dorsal 10 en West Ham / Chelsea (Moore/Zola)'],
    d: ['Dorsal 13 en Fiorentina (Astori)', 'Dorsal 23 en Man City (Foé)', 'Dorsal 12 en Bayern (Homenaje a la afición)'],
    t: ['Dorsal 7 en Real Madrid', 'Dorsal 10 en Barcelona', 'Dorsal 7 en Manchester United', 'Dorsal 10 en Arsenal', 'Dorsal 8 en Liverpool']
  },

  // 11 - 20: UEFA Champions League y Europa
  {
    c: 'Clubes que han ganado la UEFA Champions League / Copa de Europa',
    f: ['Real Madrid', 'FC Barcelona', 'Bayern Múnich', 'Liverpool FC'],
    m: ['Manchester United', 'AC Milan', 'Chelsea FC'],
    d: ['AFC Ajax', 'FC Porto', 'Inter de Milán'],
    t: ['Arsenal FC', 'Atlético de Madrid', 'Paris Saint-Germain', 'Tottenham Hotspur', 'AS Roma']
  },
  {
    c: 'Entrenadores ganadores de la UEFA Champions League',
    f: ['Pep Guardiola', 'Carlo Ancelotti', 'Zinedine Zidane', 'José Mourinho'],
    m: ['Jürgen Klopp', 'Sir Alex Ferguson', 'Vicente del Bosque'],
    d: ['Rafa Benítez', 'Luis Enrique', 'Thomas Tuchel'],
    t: ['Diego Simeone', 'Arsène Wenger', 'Mauricio Pochettino', 'Mikel Arteta', 'Marcelo Bielsa']
  },
  {
    c: 'Futbolistas con más de 100 goles en la UEFA Champions League',
    f: ['Cristiano Ronaldo', 'Lionel Messi', 'Robert Lewandowski', 'Karim Benzema'],
    m: ['Cristiano Ronaldo (140 goles)', 'Lionel Messi (129 goles)', 'Lewandowski (más de 100)'],
    d: ['Benzema (90 goles)', 'Raúl González (71 goles)', 'Ruud van Nistelrooy (56 goles)'],
    t: ['Neymar Jr', 'Zlatan Ibrahimović', 'Luis Suárez', 'Erling Haaland', 'Didier Drogba']
  },
  {
    c: 'Clubes que han conquistado un Triplete europeo (Liga, Copa y Champions League)',
    f: ['FC Barcelona (2009)', 'FC Barcelona (2015)', 'Bayern Múnich (2013)', 'Manchester City (2023)'],
    m: ['Manchester United (1999)', 'Inter de Milán (2010)', 'Bayern Múnich (2020)'],
    d: ['Celtic FC (1967)', 'AFC Ajax (1972)', 'PSV Eindhoven (1988)'],
    t: ['Real Madrid', 'Liverpool FC', 'AC Milan', 'Chelsea FC', 'Juventus']
  },
  {
    c: 'Clubes que han ganado la UEFA Europa League / Copa de la UEFA',
    f: ['Sevilla FC', 'Atlético de Madrid', 'Chelsea FC', 'Manchester United'],
    m: ['Villarreal CF', 'Inter de Milán', 'Liverpool FC'],
    d: ['FC Porto', 'Eintracht Frankfurt', 'Atalanta BC'],
    t: ['Arsenal FC', 'AS Roma', 'Borussia Dortmund', 'Athletic Club', 'Olympique de Marsella']
  },
  {
    c: 'Futbolistas que han ganado la Champions League con dos o más clubes distintos',
    f: ['Cristiano Ronaldo', 'Toni Kroos', 'Clarence Seedorf', 'Gerard Piqué'],
    m: ['Samuel Eto\'o', 'David Alaba', 'Mateo Kovačić'],
    d: ['Thiago Alcántara', 'Xabi Alonso', 'Marcel Desailly'],
    t: ['Lionel Messi', 'Sergio Ramos', 'Karim Benzema', 'Luka Modric', 'Andrés Iniesta']
  },
  {
    c: 'Futbolistas que han marcado en una final de UEFA Champions League',
    f: ['Lionel Messi', 'Cristiano Ronaldo', 'Zinedine Zidane', 'Gareth Bale'],
    m: ['Sergio Ramos', 'Vinicius Jr', 'Rodri Hernández'],
    d: ['Mario Mandžukić', 'Kingsley Coman', 'Diego Milito'],
    t: ['Kylian Mbappé', 'Thierry Henry', 'Robert Lewandowski', 'Erling Haaland', 'Antoine Griezmann']
  },
  {
    c: 'Futbolistas que han jugado tanto en el Real Madrid como en el FC Barcelona',
    f: ['Luis Figo', 'Ronaldo Nazário', 'Luis Enrique', 'Michael Laudrup'],
    m: ['Samuel Eto\'o', 'Javier Saviola', 'Bernd Schuster'],
    d: ['Robert Prosinečki', 'Gheorghe Hagi', 'Albert Celades'],
    t: ['Zinedine Zidane', 'Lionel Messi', 'Cristiano Ronaldo', 'Raúl González', 'Carles Puyol']
  },
  {
    c: 'Futbolistas que han vestido la camiseta del Paris Saint-Germain',
    f: ['Lionel Messi', 'Kylian Mbappé', 'Neymar Jr', 'Zlatan Ibrahimović'],
    m: ['Sergio Ramos', 'David Beckham', 'Edinson Cavani'],
    d: ['Ronaldinho', 'Thiago Silva', 'Ángel Di María'],
    t: ['Cristiano Ronaldo', 'Robert Lewandowski', 'Erling Haaland', 'Karim Benzema', 'Luka Modric']
  },
  {
    c: 'Futbolistas que han jugado en el Manchester United y en el Real Madrid',
    f: ['Cristiano Ronaldo', 'David Beckham', 'Ángel Di María', 'Casemiro'],
    m: ['Raphaël Varane', 'Ruud van Nistelrooy', 'Michael Owen'],
    d: ['Gabriel Heinze', 'Javier Chicharito Hernández', 'Laurie Cunningham'],
    t: ['Wayne Rooney', 'Paul Scholes', 'Ryan Giggs', 'Sergio Ramos', 'Karim Benzema']
  },

  // 21 - 30: LaLiga y Fútbol Español
  {
    c: 'Clubes que han ganado LaLiga de Primera División en España',
    f: ['Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Valencia CF'],
    m: ['Athletic Club', 'Real Sociedad', 'Deportivo de La Coruña'],
    d: ['Sevilla FC', 'Real Betis', 'Valencia (Rafa Benítez)'],
    t: ['Villarreal CF', 'Celta de Vigo', 'Getafe CF', 'RCD Espanyol', 'Girona FC']
  },
  {
    c: 'Goleadores que han ganado el Trofeo Pichichi de LaLiga',
    f: ['Lionel Messi', 'Cristiano Ronaldo', 'Karim Benzema', 'Robert Lewandowski'],
    m: ['Luis Suárez', 'Diego Forlán', 'Samuel Eto\'o'],
    d: ['Artem Dovbyk', 'Ruud van Nistelrooy', 'Daniel Güiza'],
    t: ['Neymar Jr', 'David Villa', 'Antoine Griezmann', 'Iago Aspas', 'Fernando Torres']
  },
  {
    c: 'Futbolistas españoles ganadores del Trofeo Zarra',
    f: ['David Villa', 'Iago Aspas', 'Aritz Aduriz', 'Gerard Moreno'],
    m: ['Álvaro Morata', 'Borja Mayoral', 'Roberto Soldado'],
    d: ['Daniel Güiza', 'Raúl Tamudo', 'Joselu Mato'],
    t: ['Fernando Torres', 'Raúl González', 'Fernando Morientes', 'Sergio Agüero', 'Diego Costa']
  },
  {
    c: 'Futbolistas con más de 100 partidos internacionales con la Selección Española',
    f: ['Sergio Ramos', 'Iker Casillas', 'Sergio Busquets', 'Andrés Iniesta'],
    m: ['Xavi Hernández', 'Fernando Torres', 'Cesc Fàbregas'],
    d: ['David Silva', 'Xabi Alonso', 'Andoni Zubizarreta'],
    t: ['David Villa', 'Carles Puyol', 'Raúl González', 'Gerard Piqué', 'Álvaro Morata']
  },
  {
    c: 'Clubes que han ganado la Copa del Rey de España',
    f: ['FC Barcelona', 'Athletic Club', 'Real Madrid', 'Atlético de Madrid'],
    m: ['Valencia CF', 'Sevilla FC', 'Real Betis'],
    d: ['Real Sociedad', 'Deportivo de La Coruña', 'RCD Espanyol'],
    t: ['Villarreal CF', 'Celta de Vigo', 'CA Osasuna', 'Getafe CF', 'Girona FC']
  },
  {
    c: 'Futbolistas formados en la cantera de La Masia del FC Barcelona',
    f: ['Lionel Messi', 'Andrés Iniesta', 'Xavi Hernández', 'Sergio Busquets'],
    m: ['Gerard Piqué', 'Carles Puyol', 'Lamine Yamal'],
    d: ['Cesc Fàbregas', 'Pedro Rodríguez', 'Gavi'],
    t: ['Neymar Jr', 'Luis Suárez', 'Dani Alves', 'Ronaldinho', 'Pedri']
  },
  {
    c: 'Futbolistas formados en la cantera de La Fábrica del Real Madrid',
    f: ['Raúl González', 'Iker Casillas', 'Dani Carvajal', 'Guti'],
    m: ['Nacho Fernández', 'Lucas Vázquez', 'Álvaro Morata'],
    d: ['Marcos Llorente', 'Dani Parejo', 'Emilio Butragueño'],
    t: ['Sergio Ramos', 'Cristiano Ronaldo', 'Karim Benzema', 'Fernando Hierro', 'Isco Alarcón']
  },
  {
    c: 'Futbolistas con más de 150 goles anotados en la historia de LaLiga',
    f: ['Lionel Messi', 'Cristiano Ronaldo', 'Telmo Zarra', 'Hugo Sánchez'],
    m: ['Raúl González', 'Karim Benzema', 'Alfredo Di Stéfano'],
    d: ['César Rodríguez', 'Quini', 'Pahiño'],
    t: ['Ronaldo Nazário', 'Neymar Jr', 'Diego Costa', 'Gareth Bale', 'Fernando Torres']
  },
  {
    c: 'Porteros galardonados con el Trofeo Zamora de LaLiga',
    f: ['Thibaut Courtois', 'Jan Oblak', 'Marc-André ter Stegen', 'Iker Casillas'],
    m: ['Víctor Valdés', 'Claudio Bravo', 'Yassine Bounou'],
    d: ['Unai Simón', 'Santiago Cañizares', 'Francisco Liaño'],
    t: ['David de Gea', 'Keylor Navas', 'Diego Alves', 'Pepe Reina', 'Andrés Palop']
  },
  {
    c: 'Estadios de fútbol españoles con capacidad superior a 45.000 espectadores',
    f: ['Santiago Bernabéu', 'Camp Nou', 'Cívitas Metropolitano', 'San Mamés'],
    m: ['Benito Villamarín', 'Mestalla', 'Ramón Sánchez-Pizjuán'],
    d: ['Reale Arena', 'La Cartuja', 'RCDE Stadium'],
    t: ['El Sadar', 'Coliseum Alfonso Pérez', 'Montilivi', 'Estadio de Vallecas', 'Estadio de la Cerámica']
  },

  // 31 - 40: Premier League e Inglaterra
  {
    c: 'Clubes campeones de la Premier League inglesa (era moderna desde 1992)',
    f: ['Manchester United', 'Manchester City', 'Chelsea FC', 'Arsenal FC'],
    m: ['Liverpool FC', 'Leicester City', 'Blackburn Rovers'],
    d: ['Manchester United (13 títulos)', 'Arsenal (Invencibles)', 'Chelsea (Mourinho)'],
    t: ['Tottenham Hotspur', 'Newcastle United', 'Everton FC', 'Aston Villa', 'Leeds United']
  },
  {
    c: 'Goleadores históricos con más de 150 goles en la Premier League',
    f: ['Alan Shearer', 'Harry Kane', 'Wayne Rooney', 'Sergio Agüero'],
    m: ['Thierry Henry', 'Mohamed Salah', 'Frank Lampard'],
    d: ['Andrew Cole', 'Robbie Fowler', 'Jermain Defoe'],
    t: ['Cristiano Ronaldo', 'Didier Drogba', 'Ruud van Nistelrooy', 'Fernando Torres', 'Luis Suárez']
  },
  {
    c: 'Clubes de fútbol profesionales situados en la ciudad de Londres',
    f: ['Arsenal FC', 'Chelsea FC', 'Tottenham Hotspur', 'West Ham United'],
    m: ['Crystal Palace', 'Fulham FC', 'Brentford FC'],
    d: ['Millwall FC', 'Queens Park Rangers', 'Charlton Athletic'],
    t: ['Manchester City', 'Liverpool FC', 'Everton FC', 'Aston Villa', 'Leeds United']
  },
  {
    c: 'Futbolistas que han ganado la Bota de Oro de la Premier League',
    f: ['Erling Haaland', 'Mohamed Salah', 'Harry Kane', 'Son Heung-min'],
    m: ['Sadio Mané', 'Sergio Agüero', 'Luis Suárez'],
    d: ['Robin van Persie', 'Dimitar Berbatov', 'Nicolas Anelka'],
    t: ['Wayne Rooney', 'Eden Hazard', 'Fernando Torres', 'Raheem Sterling', 'Romelu Lukaku']
  },
  {
    c: 'Entrenadores que han ganado el título de la Premier League',
    f: ['Sir Alex Ferguson', 'Pep Guardiola', 'José Mourinho', 'Jürgen Klopp'],
    m: ['Arsène Wenger', 'Claudio Ranieri', 'Antonio Conte'],
    d: ['Roberto Mancini', 'Manuel Pellegrini', 'Kenny Dalglish'],
    t: ['Mauricio Pochettino', 'Mikel Arteta', 'Rafael Benítez', 'Brendan Rodgers', 'David Moyes']
  },
  {
    c: 'Clubes que han ganado la FA Cup inglesa en cinco o más ocasiones',
    f: ['Arsenal FC', 'Manchester United', 'Chelsea FC', 'Liverpool FC'],
    m: ['Tottenham Hotspur', 'Manchester City', 'Aston Villa'],
    d: ['Newcastle United', 'Blackburn Rovers', 'Everton FC'],
    t: ['Leicester City', 'West Ham United', 'Leeds United', 'Southampton', 'Fulham FC']
  },
  {
    c: 'Futbolistas ingleses galardonados con el Balón de Oro',
    f: ['Michael Owen', 'Bobby Charlton', 'Kevin Keegan', 'Stanley Matthews'],
    m: ['Kevin Keegan (1978)', 'Kevin Keegan (1979)', 'Bobby Charlton (1966)'],
    d: ['Stanley Matthews (1956)', 'Michael Owen (2001)', 'Keegan (Hamburgo)'],
    t: ['David Beckham', 'Wayne Rooney', 'Frank Lampard', 'Steven Gerrard', 'Harry Kane']
  },
  {
    c: 'Clubes ingleses campeones de la Copa de Europa / Champions League',
    f: ['Liverpool FC', 'Manchester United', 'Chelsea FC', 'Manchester City'],
    m: ['Nottingham Forest', 'Aston Villa', 'Liverpool (6 títulos)'],
    d: ['Nottingham Forest (2 títulos)', 'Manchester United (3 títulos)', 'Chelsea (2 títulos)'],
    t: ['Arsenal FC', 'Tottenham Hotspur', 'Leeds United', 'Newcastle United', 'Everton FC']
  },
  {
    c: 'Futbolistas que han jugado en el Liverpool y en el Manchester City',
    f: ['Raheem Sterling', 'James Milner', 'Robbie Fowler', 'Nicolas Anelka'],
    m: ['Daniel Sturridge', 'Kolo Touré', 'Dietmar Hamann'],
    d: ['David James', 'Craig Bellamy', 'Steve McManaman'],
    t: ['Steven Gerrard', 'Sergio Agüero', 'Kevin De Bruyne', 'Mohamed Salah', 'Vincent Kompany']
  },
  {
    c: 'Futbolistas que han jugado en el Arsenal y en el Chelsea',
    f: ['Cesc Fàbregas', 'Ashley Cole', 'Petr Čech', 'Olivier Giroud'],
    m: ['David Luiz', 'Willian', 'Nicolas Anelka'],
    d: ['William Gallas', 'Yossi Benayoun', 'Jorginho'],
    t: ['Thierry Henry', 'Frank Lampard', 'John Terry', 'Dennis Bergkamp', 'Didier Drogba']
  },

  // 41 - 50: Serie A e Italia
  {
    c: 'Clubes italianos que han ganado la Serie A (Scudetto)',
    f: ['Juventus', 'Inter de Milán', 'AC Milan', 'SSC Napoli'],
    m: ['AS Roma', 'SS Lazio', 'ACF Fiorentina'],
    d: ['Torino FC', 'Bologna FC', 'Cagliari Calcio'],
    t: ['Atalanta BC', 'Parma Calcio', 'Udinese Calcio', 'US Sassuolo', 'Genoa (siglo XXI)']
  },
  {
    c: 'Goleadores que han sido Capocannoniere de la Serie A italiana',
    f: ['Cristiano Ronaldo', 'Zlatan Ibrahimović', 'Ciro Immobile', 'Mauro Icardi'],
    m: ['Gonzalo Higuaín', 'Edinson Cavani', 'Luca Toni'],
    d: ['Victor Osimhen', 'Lautaro Martínez', 'Fabio Quagliarella'],
    t: ['Romelu Lukaku', 'Paulo Dybala', 'Dries Mertens', 'Álvaro Morata', 'Dusan Vlahovic']
  },
  {
    c: 'Futbolistas que han vestido la camiseta de la Juventus, AC Milan e Inter de Milán',
    f: ['Zlatan Ibrahimović', 'Andrea Pirlo', 'Roberto Baggio', 'Leonardo Bonucci'],
    m: ['Christian Vieri', 'Edgar Davids', 'Patrick Vieira'],
    d: ['Giuseppe Meazza', 'Aldo Serena', 'Enrico Candiani'],
    t: ['Alessandro Del Piero', 'Paolo Maldini', 'Javier Zanetti', 'Gianluigi Buffon', 'Francesco Totti']
  },
  {
    c: 'Futbolistas italianos ganadores del Balón de Oro',
    f: ['Roberto Baggio', 'Fabio Cannavaro', 'Gianni Rivera', 'Paolo Rossi'],
    m: ['Omar Sívori (nacionalizado)', 'Cannavaro (2006)', 'Baggio (1993)'],
    d: ['Rossi (1982)', 'Rivera (1969)', 'Sívori (1961)'],
    t: ['Paolo Maldini', 'Gianluigi Buffon', 'Alessandro Del Piero', 'Francesco Totti', 'Andrea Pirlo']
  },
  {
    c: 'Futbolistas con más de 500 partidos disputados en la Serie A italiana',
    f: ['Paolo Maldini', 'Gianluigi Buffon', 'Francesco Totti', 'Javier Zanetti'],
    m: ['Gianluca Pagliuca', 'Dino Zoff', 'Samir Handanović'],
    d: ['Pietro Vierchowod', 'Roberto Mancini', 'Silvio Piola'],
    t: ['Alessandro Del Piero', 'Giorgio Chiellini', 'Mauro Icardi', 'Leonardo Bonucci', 'Ciro Immobile']
  },
  {
    c: 'Clubes italianos que han disputado finales de UEFA Champions League',
    f: ['Real Madrid rivales: Juventus', 'AC Milan', 'Inter de Milán', 'AS Roma'],
    m: ['UC Sampdoria', 'ACF Fiorentina', 'Juventus (9 finales)'],
    d: ['AC Milan (7 títulos)', 'Inter de Milán (3 títulos)', 'Sampdoria (1992)'],
    t: ['SSC Napoli', 'SS Lazio', 'Atalanta BC', 'Parma Calcio', 'Torino FC']
  },
  {
    c: 'Futbolistas que han jugado el Derby della Madonnina con ambos clubes (Milan e Inter)',
    f: ['Zlatan Ibrahimović', 'Andrea Pirlo', 'Clarence Seedorf', 'Ronaldo Nazário'],
    m: ['Hakan Çalhanoğlu', 'Mario Balotelli', 'Hernán Crespo'],
    d: ['Antonio Cassano', 'Matteo Darmian', 'Francesco Acerbi'],
    t: ['Paolo Maldini', 'Javier Zanetti', 'Alessandro Nesta', 'Esteban Cambiasso', 'Gennaro Gattuso']
  },
  {
    c: 'Goleadores históricos de la Selección de Italia (Azzurra)',
    f: ['Luigi Riva', 'Giuseppe Meazza', 'Silvio Piola', 'Roberto Baggio'],
    m: ['Alessandro Del Piero', 'Filippo Inzaghi', 'Alessandro Altobelli'],
    d: ['Christian Vieri', 'Francesco Graziani', 'Mario Balotelli'],
    t: ['Francesco Totti', 'Ciro Immobile', 'Andrea Pirlo', 'Gianluca Vialli', 'Lorenzo Insigne']
  },
  {
    c: 'Entrenadores italianos ganadores de la UEFA Champions League',
    f: ['Carlo Ancelotti', 'Arrigo Sacchi', 'Marcello Lippi', 'Fabio Capello'],
    m: ['Giovanni Trapattoni', 'Roberto Di Matteo', 'Ancelotti (5 títulos)'],
    d: ['Nereo Rocco', 'Sacchi (bicampeón)', 'Lippi (Juventus 1996)'],
    t: ['Antonio Conte', 'Massimiliano Allegri', 'Luciano Spalletti', 'Maurizio Sarri', 'Claudio Ranieri']
  },
  {
    c: 'Futbolistas que han marcado gol en finales de Copa del Mundo con Italia',
    f: ['Marco Materazzi (2006)', 'Paolo Rossi (1982)', 'Marco Tardelli (1982)', 'Alessandro Altobelli (1982)'],
    m: ['Silvio Piola (1938)', 'Gino Colaussi (1938)', 'Angelo Schiavio (1934)'],
    d: ['Raimundo Orsi (1934)', 'Gino Colaussi (doblete 1938)', 'Silvio Piola (doblete 1938)'],
    t: ['Roberto Baggio', 'Alessandro Del Piero', 'Francesco Totti', 'Christian Vieri', 'Filippo Inzaghi']
  },

  // 51 - 60: Bundesliga y Fútbol Alemán
  {
    c: 'Clubes que han ganado la Bundesliga alemana (desde 1963)',
    f: ['Bayern Múnich', 'Borussia Dortmund', 'Bayer Leverkusen', 'SV Werder Bremen'],
    m: ['VfB Stuttgart', 'VfL Wolfsburgo', 'Borussia Mönchengladbach'],
    d: ['Hamburgo SV', 'FC Kaiserslautern', 'FC Núremberg'],
    t: ['RB Leipzig', 'FC Schalke 04', 'Eintracht Frankfurt', 'Hertha Berlín', 'TSG Hoffenheim']
  },
  {
    c: 'Futbolistas que han sido máximos goleadores (Torjägerkanone) de la Bundesliga',
    f: ['Robert Lewandowski', 'Gerd Müller', 'Harry Kane', 'Erling Haaland'],
    m: ['Pierre-Emerick Aubameyang', 'Klaas-Jan Huntelaar', 'Mario Gómez'],
    d: ['Edin Džeko', 'Grafite', 'Alexander Meier'],
    t: ['Thomas Müller', 'Marco Reus', 'Timo Werner', 'Arjen Robben', 'Franck Ribéry']
  },
  {
    c: 'Futbolistas que han jugado tanto en el Bayern Múnich como en el Borussia Dortmund',
    f: ['Robert Lewandowski', 'Mario Götze', 'Mats Hummels', 'Raphaël Guerreiro'],
    m: ['Niklas Süle', 'Marcel Sabitzer', 'Sebastian Rode'],
    d: ['Torsten Frings', 'Thomas Helmer', 'Christian Nerlinger'],
    t: ['Marco Reus', 'Thomas Müller', 'Manuel Neuer', 'Arjen Robben', 'Bastian Schweinsteiger']
  },
  {
    c: 'Futbolistas alemanes ganadores del Balón de Oro',
    f: ['Franz Beckenbauer', 'Gerd Müller', 'Karl-Heinz Rummenigge', 'Lothar Matthäus'],
    m: ['Matthias Sammer', 'Beckenbauer (bicampeón)', 'Rummenigge (bicampeón)'],
    d: ['Matthäus (1990)', 'Sammer (1996)', 'Gerd Müller (1970)'],
    t: ['Manuel Neuer', 'Oliver Kahn', 'Michael Ballack', 'Mesut Özil', 'Toni Kroos']
  },
  {
    c: 'Goleadores históricos de la Selección de Alemania',
    f: ['Miroslav Klose', 'Gerd Müller', 'Lukas Podolski', 'Thomas Müller'],
    m: ['Jürgen Klinsmann', 'Rudi Völler', 'Karl-Heinz Rummenigge'],
    d: ['Uwe Seeler', 'Michael Ballack', 'Oliver Bierhoff'],
    t: ['Mario Götze', 'Mesut Özil', 'Toni Kroos', 'Bastian Schweinsteiger', 'Marco Reus']
  },
  {
    c: 'Futbolistas que integraron el Bayer Leverkusen campeón invicto de Bundesliga (2023-24)',
    f: ['Florian Wirtz', 'Granit Xhaka', 'Jeremie Frimpong', 'Alejandro Grimaldo'],
    m: ['Victor Boniface', 'Jonathan Tah', 'Exequiel Palacios'],
    d: ['Lukáš Hrádecký', 'Robert Andrich', 'Piero Hincapié'],
    t: ['Kai Havertz', 'Moussa Diaby', 'Julian Brandt', 'Kevin Volland', 'Leon Bailey']
  },
  {
    c: 'Clubes alemanes campeones de la Copa de Europa / Champions League',
    f: ['Bayern Múnich (6 títulos)', 'Borussia Dortmund (1997)', 'Hamburgo SV (1983)', 'Bayern Múnich (Sextete 2020)'],
    m: ['Bayern (tricampeón 70s)', 'Dortmund (Hitzfeld)', 'Hamburgo (Ernst Happel)'],
    d: ['Bayern (Milán 2001)', 'Bayern (Wembley 2013)', 'Dortmund (Ricken)'],
    t: ['Bayer Leverkusen', 'Borussia Mönchengladbach', 'RB Leipzig', 'FC Schalke 04', 'Eintracht Frankfurt']
  },
  {
    c: 'Estadios de la Bundesliga con capacidad superior a 50.000 espectadores',
    f: ['Signal Iduna Park (Dortmund)', 'Allianz Arena (Múnich)', 'Olympiastadion (Berlín)', 'Veltins-Arena (Gelsenkirchen)'],
    m: ['Deutsche Bank Park (Fráncfort)', 'Mercedes-Benz Arena (Stuttgart)', 'Borussia-Park (Mönchengladbach)'],
    d: ['RheinEnergieStadion (Colonia)', 'Volksparkstadion (Hamburgo)', 'Red Bull Arena (Leipzig)'],
    t: ['BayArena', 'Weserstadion', 'Europa-Park Stadion', 'PreZero Arena', 'WWK Arena']
  },
  {
    c: 'Futbolistas extranjeros con más de 100 goles en la Bundesliga',
    f: ['Robert Lewandowski', 'Claudio Pizarro', 'Giovane Élber', 'Vedad Ibišević'],
    m: ['Aílton', 'Stéphane Chapuisat', 'Anthony Yeboah'],
    d: ['Pierre-Emerick Aubameyang', 'Naldo (defensa)', 'Wynton Rufer'],
    t: ['Erling Haaland (86 goles)', 'Harry Kane (en camino)', 'Luka Jović', 'Raúl González', 'Paco Alcácer']
  },
  {
    c: 'Entrenadores campeones de la Copa del Mundo con Alemania',
    f: ['Joachim Löw (2014)', 'Franz Beckenbauer (1990)', 'Helmut Schön (1974)', 'Sepp Herberger (1954)'],
    m: ['Löw (Maracaná)', 'Beckenbauer (Olímpico de Roma)', 'Schön (Olympiastadion Múnich)'],
    d: ['Herberger (Milagro de Berna)', 'Beckenbauer (capitán y DT)', 'Schön (Euro y Mundial)'],
    t: ['Jürgen Klinsmann', 'Hansi Flick', 'Julian Nagelsmann', 'Rudi Völler', 'Berti Vogts']
  },

  // 61 - 70: Conmebol y Fútbol Sudamericano
  {
    c: 'Clubes que han ganado la Copa Libertadores de América tres o más veces',
    f: ['Independiente (7 títulos)', 'Boca Juniors (6 títulos)', 'Peñarol (5 títulos)', 'River Plate (4 títulos)'],
    m: ['Estudiantes de La Plata (4)', 'Olimpia de Asunción (3)', 'Nacional de Montevideo (3)'],
    d: ['São Paulo FC (3)', 'Santos FC (3)', 'Palmeiras (3)'],
    t: ['Flamengo (3 hasta 2022/empatado)', 'Atlético Nacional (2)', 'Cruzeiro (2)', 'Internacional (2)', 'Colo-Colo (1)']
  },
  {
    c: 'Goleadores históricos de la Copa América de selecciones',
    f: ['Norberto Méndez (17 goles)', 'Zizinho (17 goles)', 'Lionel Messi', 'Eduardo Vargas'],
    m: ['Paolo Guerrero', 'Teodoro Fernández', 'Severino Varela'],
    d: ['Gabriel Batistuta', 'Héctor Scarone', 'Jahirzinho'],
    t: ['Diego Maradona', 'Pelé', 'Neymar Jr', 'Radamel Falcao', 'Alexis Sánchez']
  },
  {
    c: 'Futbolistas que han ganado tanto la Copa Libertadores como la UEFA Champions League',
    f: ['Ronaldinho', 'Neymar Jr', 'Carlos Tévez', 'Julián Álvarez'],
    m: ['Cafú', 'Dida', 'Walter Samuel'],
    d: ['Marcelo', 'David Luiz', 'Danilo'],
    t: ['Lionel Messi', 'Cristiano Ronaldo', 'Ronaldo Nazário', 'Diego Maradona', 'Luis Suárez']
  },
  {
    c: 'Clubes que han ganado la Copa Sudamericana en dos ocasiones',
    f: ['Boca Juniors', 'Independiente', 'Athletico Paranaense', 'Independiente del Valle'],
    m: ['Liga de Quito', 'Boca (bicampeón 2004-2005)', 'Independiente (2010 y 2017)'],
    d: ['Paranaense (2018 y 2021)', 'Del Valle (2019 y 2022)', 'Liga de Quito (2009 y 2023)'],
    t: ['River Plate (1 título)', 'São Paulo (1 título)', 'San Lorenzo (1 título)', 'Flamengo (0 títulos)', 'Palmeiras (0 títulos)']
  },
  {
    c: 'Goleadores históricos de las Eliminatorias Sudamericanas (Conmebol)',
    f: ['Lionel Messi', 'Luis Suárez', 'Marcelo Moreno Martins', 'Alexis Sánchez'],
    m: ['Hernán Crespo', 'Edinson Cavani', 'Neymar Jr'],
    d: ['Joaquín Botero', 'Agustín Delgado', 'Jefferson Farfán'],
    t: ['Diego Maradona', 'Pelé', 'Ronaldo Nazário', 'Gabriel Batistuta', 'Radamel Falcao']
  },
  {
    c: 'Clubes que disputan el Superclásico del fútbol argentino o derbis clásicos de Buenos Aires',
    f: ['Boca Juniors', 'River Plate', 'Racing Club', 'Independiente'],
    m: ['San Lorenzo de Almagro', 'Huracán', 'Vélez Sarsfield'],
    d: ['Ferro Carril Oeste', 'Argentinos Juniors', 'Lanús'],
    t: ['Rosario Central (Rosario)', 'Newell\'s Old Boys (Rosario)', 'Colón (Santa Fe)', 'Belgrano (Córdoba)', 'Talleres (Córdoba)']
  },
  {
    c: 'Clubes brasileños campeones de la Copa Mundial de Clubes de la FIFA (formato moderno)',
    f: ['São Paulo FC (2005)', 'Sport Club Internacional (2006)', 'Corinthians (2000)', 'Corinthians (2012)'],
    m: ['São Paulo (vs Liverpool)', 'Internacional (vs Barcelona)', 'Corinthians (vs Chelsea)'],
    d: ['Corinthians (primera edición)', 'Internacional (gol de Adriano Gabiru)', 'São Paulo (gol de Mineiro)'],
    t: ['Flamengo', 'Palmeiras', 'Santos FC', 'Grêmio', 'Atlético Mineiro']
  },
  {
    c: 'Futbolistas uruguayos campeones de la Copa América',
    f: ['Luis Suárez (2011)', 'Diego Forlán (2011)', 'Edinson Cavani (2011)', 'Diego Godín (2011)'],
    m: ['Fernando Muslera (2011)', 'Enzo Francescoli (1983, 1987, 1995)', 'Álvaro Recoba'],
    d: ['Sebastián Coates (2011)', 'Diego Lugano (2011)', 'Rubén Paz'],
    t: ['Federico Valverde', 'Darwin Núñez', 'Ronald Araújo', 'José María Giménez', 'Rodrigo Bentancur']
  },
  {
    c: 'Futbolistas colombianos campeones de la Copa América (Colombia 2001)',
    f: ['Iván Córdoba', 'Víctor Aristizábal', 'Mario Yepes', 'Óscar Córdoba'],
    m: ['Fabián Vargas', 'Giovanni Hernández', 'Gerardo Bedoya'],
    d: ['David Ferreira', 'Freddy Totono Grisales', 'Mauricio Molina'],
    t: ['James Rodríguez', 'Radamel Falcao', 'Carlos Valderrama', 'Faustino Asprilla', 'Luis Díaz']
  },
  {
    c: 'Futbolistas chilenos bicampeones de la Copa América (2015 y 2016)',
    f: ['Alexis Sánchez', 'Arturo Vidal', 'Claudio Bravo', 'Gary Medel'],
    m: ['Eduardo Vargas', 'Charles Aránguiz', 'Mauricio Isla'],
    d: ['Marcelo Díaz', 'Jean Beausejour', 'Gonzalo Jara'],
    t: ['Marcelo Salas', 'Iván Zamorano', 'Matías Fernández (solo 2015)', 'Humberto Suazo', 'Carlos Caszely']
  },

  // 71 - 80: Selecciones, Récords y Clásicos Mundiales
  {
    c: 'Futbolistas con más de 100 goles internacionales con su selección nacional',
    f: ['Cristiano Ronaldo (Portugal)', 'Lionel Messi (Argentina)', 'Ali Daei (Irán)', 'Sunil Chhetri (India)'],
    m: ['Cristiano Ronaldo (más de 125)', 'Lionel Messi (más de 105)', 'Ali Daei (109)'],
    d: ['Mokhtar Dahari (Malasia, 89 homologado)', 'Ferenc Puskás (84 homologado FIFA)', 'Godfrey Chitalu (oficial regional)'],
    t: ['Neymar Jr', 'Pelé', 'Robert Lewandowski', 'Kylian Mbappé', 'Romelu Lukaku']
  },
  {
    c: 'Futbolistas que han disputado cinco ediciones de la Copa del Mundo de la FIFA',
    f: ['Lionel Messi', 'Cristiano Ronaldo', 'Luka Modric', 'Guillermo Ochoa'],
    m: ['Andrés Guardado', 'Rafael Márquez', 'Antonio Carbajal'],
    d: ['Gianluigi Buffon (en plantilla)', 'Lothar Matthäus', 'Messi (2006 a 2022)'],
    t: ['Pelé (4 Mundiales)', 'Diego Maradona (4 Mundiales)', 'Iker Casillas (4 Mundiales)', 'Sergio Ramos (4 Mundiales)', 'Ronaldo Nazário (4 Mundiales)']
  },
  {
    c: 'Selecciones nacionales que han disputado una final de Copa del Mundo sin ganarla',
    f: ['Países Bajos', 'Croacia', 'Hungría', 'Suecia'],
    m: ['Checoslovaquia', 'Países Bajos (tres finales)', 'Hungría (dos finales)'],
    d: ['Croacia (2018)', 'Suecia (1958)', 'Checoslovaquia (1934 y 1962)'],
    t: ['Portugal', 'Bélgica', 'Polonia', 'Chile', 'Colombia']
  },
  {
    c: 'Selecciones masculinas campeonas del torneo olímpico de fútbol (Juegos Olímpicos)',
    f: ['Brasil', 'Argentina', 'España', 'Uruguay'],
    m: ['Nigeria', 'Camerún', 'México'],
    d: ['Hungría', 'Gran Bretaña', 'Unión Soviética'],
    t: ['Alemania', 'Italia', 'Países Bajos', 'Portugal', 'Colombia']
  },
  {
    c: 'Futbolistas que han ganado la Bota de Oro de una Copa del Mundo de la FIFA',
    f: ['Kylian Mbappé (2022)', 'Harry Kane (2018)', 'James Rodríguez (2014)', 'Thomas Müller (2010)'],
    m: ['Miroslav Klose (2006)', 'Ronaldo Nazário (2002)', 'Davor Šuker (1998)'],
    d: ['Oleg Salenko (1994)', 'Hristo Stoichkov (1994)', 'Salvatore Schillaci (1990)'],
    t: ['Lionel Messi', 'Cristiano Ronaldo', 'Neymar Jr', 'Zlatan Ibrahimović', 'Romelu Lukaku']
  },
  {
    c: 'Clubes que han conquistado el Sextete de títulos en un mismo año natural',
    f: ['FC Barcelona (2009)', 'Bayern Múnich (2020)', 'Barça de Pep Guardiola', 'Bayern de Hansi Flick'],
    m: ['Barça (Liga, Copa, Champions)', 'Bayern (Bundesliga, Pokal, Champions)', 'Barça (Supercopas y Mundial)'],
    d: ['Bayern (Supercopa alemana y europea)', 'Barça (gol de Pedro en 6 torneos)', 'Bayern (victoria en Catar 2021)'],
    t: ['Real Madrid', 'Manchester City (perdió Community Shield)', 'Liverpool FC', 'Inter de Milán', 'Paris Saint-Germain']
  },
  {
    c: 'Futbolistas que han marcado gol en finales de Champions League con clubes distintos',
    f: ['Cristiano Ronaldo (United y Madrid)', 'Mario Mandžukić (Bayern y Juventus)', 'Cristiano Ronaldo (2008, 2014, 2017)', 'Mandžukić (2013 y 2017)'],
    m: ['Cristiano Ronaldo (tres finales con gol)', 'Mandžukić (gol de chilena con Juve)', 'Cristiano (gol de cabeza con United)'],
    d: ['Velibor Vasović (Partizán y Ajax)', 'Vasović (1966 y 1969)', 'Cristiano (primer futbolista moderno)'],
    t: ['Lionel Messi', 'Karim Benzema', 'Gareth Bale', 'Sergio Ramos', 'Vinicius Jr']
  },
  {
    c: 'Futbolistas que han marcado un gol olímpico (directo de córner) en una Copa del Mundo',
    f: ['Marcos Coll (Colombia vs URSS 1962)', 'Coll (único en la historia)', 'Marcos Coll (a Lev Yashin)', 'Arica 1962'],
    m: ['Mundial de Chile 1962', 'Partido 4-4 histórico', 'Gol al mejor portero del mundo'],
    d: ['Minuto 68 del partido', 'Saque de esquina cerrado', 'Histórica remontada colombiana'],
    t: ['Diego Maradona', 'Pelé', 'Ronaldinho', 'Roberto Carlos', 'David Beckham']
  },
  {
    c: 'Árbitros que han pitado una final de la Copa del Mundo de la FIFA',
    f: ['Szymon Marciniak (2022)', 'Néstor Pitana (2018)', 'Nicola Rizzoli (2014)', 'Howard Webb (2010)'],
    m: ['Horacio Elizondo (2006)', 'Pierluigi Collina (2002)', 'Said Belqola (1998)'],
    d: ['Edgardo Codesal (1990)', 'Romualdo Arppi Filho (1986)', 'Jack Taylor (1974)'],
    t: ['Mateu Lahoz', 'Felix Brych', 'Mark Clattenburg', 'Cüneyt Çakır', 'Björn Kuipers']
  },
  {
    c: 'Futbolistas que han ganado el premio Golden Boy al mejor sub-21 de Europa',
    f: ['Lionel Messi (2005)', 'Kylian Mbappé (2017)', 'Erling Haaland (2020)', 'Pedri (2021)'],
    m: ['Gavi (2022)', 'Jude Bellingham (2023)', 'Wayne Rooney (2004)'],
    d: ['Cesc Fàbregas (2006)', 'Sergio Agüero (2007)', 'Paul Pogba (2013)'],
    t: ['Cristiano Ronaldo', 'Neymar Jr', 'Vinicius Jr', 'Lamine Yamal (ganó Kopa)', 'Eduardo Camavinga']
  },

  // 81 - 90: Traspasos, Curiosidades y Tácticas
  {
    c: 'Futbolistas traspasados por una cifra superior a 100 millones de euros',
    f: ['Neymar Jr (222M€)', 'Kylian Mbappé (180M€)', 'Philippe Coutinho (135M€)', 'Jude Bellingham (103M€)'],
    m: ['Jack Grealish (117M€)', 'Declan Rice (116M€)', 'Moisés Caicedo (116M€)'],
    d: ['Enzo Fernández (121M€)', 'Eden Hazard (115M€)', 'João Félix (127M€)'],
    t: ['Erling Haaland (cláusula 60M€)', 'Zinedine Zidane (77M€)', 'Luis Figo (60M€)', 'Kaká (67M€)', 'Virgil van Dijk (85M€)']
  },
  {
    c: 'Futbolistas que han ganado el Premio Puskás de la FIFA al mejor gol del año',
    f: ['Cristiano Ronaldo (2009)', 'Neymar Jr (2011)', 'Zlatan Ibrahimović (2013)', 'James Rodríguez (2014)'],
    m: ['Olivier Giroud (2017)', 'Mohamed Salah (2018)', 'Son Heung-min (2020)'],
    d: ['Hamit Altıntop (2010)', 'Miroslav Stoch (2012)', 'Erik Lamela (2021)'],
    t: ['Lionel Messi', 'Kylian Mbappé', 'Gareth Bale', 'Ronaldinho', 'Roberto Carlos']
  },
  {
    c: 'Futbolistas que han disputado más de 1.000 partidos oficiales en su carrera',
    f: ['Cristiano Ronaldo', 'Lionel Messi', 'Gianluigi Buffon', 'Iker Casillas'],
    m: ['Roberto Carlos', 'Xavi Hernández', 'Dani Alves'],
    d: ['Peter Shilton (más de 1.300)', 'Rogério Ceni', 'František Plánička'],
    t: ['Diego Maradona', 'Zinedine Zidane', 'Ronaldo Nazário', 'Ronaldinho', 'Thierry Henry']
  },
  {
    c: 'Porteros que han marcado más de 40 goles oficiales en su carrera',
    f: ['Rogério Ceni (131 goles)', 'José Luis Chilavert (67 goles)', 'Jorge Campos (46 goles)', 'Johnny Vegas (45 goles)'],
    m: ['René Higuita (43 goles)', 'Dimitar Ivankov (42 goles)', 'Ceni (tiros libres y penaltis)'],
    d: ['Chilavert (hat-trick de penaltis)', 'Campos (jugó de delantero)', 'Higuita (especialista a balón parado)'],
    t: ['Manuel Neuer', 'Iker Casillas', 'Gianluigi Buffon', 'Thibaut Courtois', 'Alisson Becker']
  },
  {
    c: 'Futbolistas que han marcado gol en cinco ediciones distintas de la Copa del Mundo',
    f: ['Cristiano Ronaldo (2006, 2010, 2014, 2018, 2022)', 'Cristiano (único masculino en lograrlo)', 'Cristiano (penalti ante Ghana 2022)', 'Cristiano (primer gol en 2006 vs Irán)'],
    m: ['Marta Vieira (Mundial femenino en 5 ediciones)', 'Christine Sinclair (Mundial femenino en 5)', 'Marta (goleadora histórica absoluta)'],
    d: ['Cristiano (gol en Alemania 2006)', 'Cristiano (gol en Sudáfrica 2010)', 'Cristiano (gol en Brasil 2014)'],
    t: ['Lionel Messi (marcó en 4, no marcó en 2010)', 'Pelé (marcó en 4)', 'Miroslav Klose (marcó en 4)', 'Ronaldo Nazário (marcó en 3)', 'Diego Maradona (marcó en 3)']
  },
  {
    c: 'Países que han albergado la fase final de la Copa del Mundo de la FIFA en dos ocasiones',
    f: ['México (1970 y 1986)', 'Italia (1934 y 1990)', 'Francia (1938 y 1998)', 'Alemania (1974 y 2006)'],
    m: ['Brasil (1950 y 2014)', 'México (será tres en 2026)', 'Alemania (RFA y unificada)'],
    d: ['Brasil (Maracanazo y Mineirazo)', 'Francia (era clásica y moderna)', 'Italia (fascismo y noches mágicas)'],
    t: ['España (solo 1982)', 'Inglaterra (solo 1966)', 'Argentina (solo 1978)', 'Estados Unidos (solo 1994)', 'Uruguay (solo 1930)']
  },
  {
    c: 'Futbolistas que han vestido la camiseta del Bayern Múnich y del Real Madrid',
    f: ['Toni Kroos', 'Xabi Alonso', 'David Alaba', 'Arjen Robben'],
    m: ['James Rodríguez', 'Hamit Altıntop', 'Zé Roberto'],
    d: ['Paul Breitner', 'Álvaro Odriozola', 'Christoph Metzelder'],
    t: ['Robert Lewandowski', 'Thomas Müller', 'Manuel Neuer', 'Bastian Schweinsteiger', 'Franck Ribéry']
  },
  {
    c: 'Futbolistas que han vestido la camiseta del Inter de Milán y del Real Madrid',
    f: ['Ronaldo Nazário', 'Roberto Carlos', 'Luís Figo', 'Wesley Sneijder'],
    m: ['Mateo Kovačić', 'Walter Samuel', 'Esteban Cambiasso'],
    d: ['Christian Panucci', 'Clarence Seedorf', 'Achraf Hakimi'],
    t: ['Zavier Zanetti', 'Diego Milito', 'Zlatan Ibrahimović', 'Mauro Icardi', 'Adriano Leite']
  },
  {
    c: 'Futbolistas que han ganado la Copa Libertadores y la Copa del Mundo',
    f: ['Pelé', 'Ronaldinho', 'Rivaldo', 'Julián Álvarez'],
    m: ['Dida', 'Cafú', 'Franco Armani'],
    d: ['Ronaldo (en nómina)', 'Bebeto', 'Zito'],
    t: ['Lionel Messi', 'Cristiano Ronaldo', 'Neymar Jr', 'Carlos Tévez', 'Diego Maradona']
  },
  {
    c: 'Futbolistas expulsados con tarjeta roja directa en una final de Copa del Mundo',
    f: ['Zinedine Zidane (2006)', 'Zidane (cabezazo a Materazzi)', 'Pedro Monzón (1990)', 'Gustavo Dezotti (1990)'],
    m: ['Marcel Desailly (1998, doble amarilla)', 'Zidane (minuto 110)', 'Monzón (primer expulsado en final)'],
    d: ['Dezotti (segundo expulsado 1990)', 'Desailly (Francia vs Brasil)', 'Final Italia vs Francia 2006'],
    t: ['Diego Maradona', 'Ronaldo Nazário', 'Marco Materazzi', 'Oliver Kahn', 'Gianluigi Buffon']
  },

  // 91 - 100: Leyendas, Hat-tricks y Derbis
  {
    c: 'Futbolistas que han marcado un hat-trick en un Clásico (Real Madrid vs Barcelona)',
    f: ['Lionel Messi', 'Luis Suárez', 'Karim Benzema', 'Vinicius Jr'],
    m: ['Romário', 'Gary Lineker', 'Ferenc Puskás'],
    d: ['Jaime Lazcano', 'Santiago Bernabéu', 'Jesús Narro'],
    t: ['Cristiano Ronaldo (máximo 2 goles en un partido)', 'Raúl González', 'Ronaldinho', 'Neymar Jr', 'Gareth Bale']
  },
  {
    c: 'Futbolistas que han marcado un hat-trick en una final de Copa del Mundo',
    f: ['Geoff Hurst (Inglaterra 1966)', 'Kylian Mbappé (Francia 2022)', 'Hurst (vs Alemania Federal)', 'Mbappé (vs Argentina)'],
    m: ['Hurst (Wembley 1966)', 'Mbappé (Estadio Lusail 2022)', 'Mbappé (dos penaltis y volea)'],
    d: ['Hurst (gol fantasma)', 'Mbappé (máximo goleador en finales)', 'Hurst (prórroga 1966)'],
    t: ['Pelé (máximo 2 goles en 1958)', 'Zinedine Zidane (2 goles en 1998)', 'Ronaldo Nazário (2 goles en 2002)', 'Lionel Messi (2 goles en 2022)', 'Mario Kempes (2 goles en 1978)']
  },
  {
    c: 'Clubes que disputan el Clásico del fútbol uruguayo',
    f: ['Club Nacional de Football', 'Club Atlético Peñarol', 'Nacional (Tricolor)', 'Peñarol (Carbonero)'],
    m: ['Estadio Gran Parque Central', 'Estadio Campeón del Siglo', 'Estadio Centenario'],
    d: ['Clásico más antiguo fuera de islas británicas', 'Decanato del fútbol uruguayo', 'Copa de Honor'],
    t: ['Defensor Sporting', 'Danubio FC', 'Montevideo Wanderers', 'Cerro', 'River Plate (Uruguay)']
  },
  {
    c: 'Clubes que han ganado la Eredivisie holandesa diez o más veces',
    f: ['AFC Ajax', 'PSV Eindhoven', 'Feyenoord Rotterdam', 'Ajax (más de 30 títulos)'],
    m: ['PSV (más de 20 títulos)', 'Feyenoord (más de 15 títulos)', 'Los Tres Grandes de Holanda'],
    d: ['De Klassieker (Ajax vs Feyenoord)', 'De Topper (Ajax vs PSV)', 'HVV Den Haag (10 títulos históricos)'],
    t: ['AZ Alkmaar', 'FC Twente', 'FC Utrecht', 'Vitesse Arnhem', 'Willem II']
  },
  {
    c: 'Futbolistas que han superado los 40 goles en una sola temporada de LaLiga española',
    f: ['Lionel Messi', 'Cristiano Ronaldo', 'Messi (50 goles en 2011-12)', 'Cristiano (48 goles en 2014-15)'],
    m: ['Messi (46 goles en 2012-13)', 'Cristiano (41 goles en 2010-11)', 'Luis Suárez (40 goles en 2015-16)'],
    d: ['Messi (récord absoluto con 50)', 'Cristiano (Bota de Oro con 48)', 'Suárez (Pichichi 2016)'],
    t: ['Karim Benzema', 'Robert Lewandowski', 'Raúl González', 'Ronaldo Nazário', 'Hugo Sánchez (máximo 38)']
  },
  {
    c: 'Futbolistas que han ganado la Champions League, la Premier League y LaLiga',
    f: ['Cristiano Ronaldo', 'Thierry Henry', 'Gerard Piqué', 'Xabi Alonso'],
    m: ['Ricardo Carvalho', 'Cesc Fàbregas', 'David Silva'],
    d: ['Nicolas Anelka', 'Eidur Gudjohnsen', 'Álvaro Arbeloa'],
    t: ['Lionel Messi', 'Sergio Ramos', 'Karim Benzema', 'Wayne Rooney', 'Eden Hazard (no ganó Champions con Chelsea)']
  },
  {
    c: 'Entrenadores que han ganado títulos de liga en tres de las cinco grandes ligas europeas',
    f: ['Carlo Ancelotti (Italia, Inglaterra, Francia, Alemania, España)', 'José Mourinho (Inglaterra, Italia, España)', 'Pep Guardiola (España, Alemania, Inglaterra)', 'Ancelotti (único con las 5)'],
    m: ['Mourinho (Chelsea, Inter, Real Madrid)', 'Guardiola (Barça, Bayern, Man City)', 'Giovanni Trapattoni (Italia, Alemania, Portugal)'],
    d: ['Tomislav Ivić', 'Ernst Happel', 'Louis van Gaal (España, Alemania, Países Bajos)'],
    t: ['Jürgen Klopp', 'Zinedine Zidane', 'Diego Simeone', 'Sir Alex Ferguson', 'Arsène Wenger']
  },
  {
    c: 'Futbolistas que han sido capitanes de la Selección Española en fases finales',
    f: ['Iker Casillas', 'Sergio Ramos', 'Sergio Busquets', 'Álvaro Morata'],
    m: ['Raúl González', 'Fernando Hierro', 'Andoni Zubizarreta'],
    d: ['José Antonio Camacho', 'Ferran Olivella (Euro 1964)', 'Emilio Butragueño'],
    t: ['Andrés Iniesta', 'Xavi Hernández', 'David Villa', 'Gerard Piqué', 'Carles Puyol']
  },
  {
    c: 'Clubes que han ganado la Copa Intercontinental de fútbol en tres ocasiones',
    f: ['Real Madrid', 'AC Milan', 'Boca Juniors', 'Peñarol'],
    m: ['Nacional de Montevideo', 'Real Madrid (1960, 1998, 2002)', 'Milan (1969, 1989, 1990)'],
    d: ['Boca (1977, 2000, 2003)', 'Peñarol (1961, 1966, 1982)', 'Nacional (1971, 1980, 1988)'],
    t: ['FC Barcelona (0 Intercontinentales, solo Mundialitos)', 'Liverpool FC', 'Manchester United (1 título)', 'Juventus (2 títulos)', 'Santos FC (2 títulos)']
  },
  {
    c: 'Futbolistas que han jugado con la Selección Absoluta de España sin haber nacido en territorio español',
    f: ['Aymeric Laporte', 'Robin Le Normand', 'Diego Costa', 'Marcos Senna'],
    m: ['Thiago Alcántara', 'Rodrigo Moreno', 'Ansu Fati'],
    d: ['Alfredo Di Stéfano', 'Ferenc Puskás', 'László Kubala'],
    t: ['Sergio Ramos', 'Iker Casillas', 'Andrés Iniesta', 'Xavi Hernández', 'Carles Puyol']
  }
];

export default Array.from({ length: 100 }, (_, idx) => {
  const p = plantillas[idx];
  return {
    id: `futbol_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});