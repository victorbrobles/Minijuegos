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
    d: ['Uruguay', 'Alemania Occidental', 'Checoslovaquia'],
    t: ['Países Bajos', 'Portugal', 'Bélgica', 'Croacia', 'Colombia']
  },
  {
    c: 'Goleadores históricos de la Copa del Mundo de la FIFA (10 o más goles)',
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
    c: 'Dorsales emblemáticos retirados oficialmente por clubes de fútbol como homenaje',
    f: ['Dorsal 3 en AC Milan', 'Dorsal 10 en Napoli', 'Dorsal 14 en Ajax', 'Dorsal 6 en AC Milan'],
    m: ['Dorsal 10 en Brescia', 'Dorsal 4 en Inter de Milán', 'Dorsal 25 en Chelsea'],
    d: ['Dorsal 13 en Fiorentina', 'Dorsal 23 en Manchester City', 'Dorsal 12 en Bayern Múnich'],
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
    c: 'Futbolistas con más de 70 goles en la historia de la UEFA Champions League',
    f: ['Cristiano Ronaldo', 'Lionel Messi', 'Robert Lewandowski', 'Karim Benzema'],
    m: ['Raúl González', 'Thomas Müller', 'Ruud van Nistelrooy'],
    d: ['Thierry Henry', 'Kylian Mbappé', 'Andriy Shevchenko'],
    t: ['Neymar Jr', 'Zlatan Ibrahimović', 'Luis Suárez', 'Erling Haaland', 'Didier Drogba']
  },
  {
    c: 'Clubes europeos que han conquistado el Triplete (Liga, Copa y Champions)',
    f: ['FC Barcelona', 'Bayern Múnich', 'Manchester City', 'Manchester United'],
    m: ['Inter de Milán', 'Celtic FC', 'AFC Ajax'],
    d: ['PSV Eindhoven', 'Liverpool FC', 'Chelsea FC'],
    t: ['Real Madrid', 'AC Milan', 'Juventus', 'Arsenal FC', 'Borussia Dortmund']
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
    c: 'Futbolistas que han marcado al menos un gol en una final de UEFA Champions League',
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
    d: ['Gabriel Heinze', 'Javier Hernández', 'Laurie Cunningham'],
    t: ['Wayne Rooney', 'Paul Scholes', 'Ryan Giggs', 'Sergio Ramos', 'Karim Benzema']
  },

  // 21 - 30: LaLiga y Fútbol Español
  {
    c: 'Clubes que han ganado LaLiga de Primera División en España',
    f: ['Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Valencia CF'],
    m: ['Athletic Club', 'Real Sociedad', 'Deportivo de La Coruña'],
    d: ['Sevilla FC', 'Real Betis', 'Valencia Mestalla'],
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
    c: 'Estadios de fútbol en España con capacidad superior a 45.000 espectadores',
    f: ['Santiago Bernabéu', 'Camp Nou', 'Cívitas Metropolitano', 'San Mamés'],
    m: ['Benito Villamarín', 'Mestalla', 'Ramón Sánchez-Pizjuán'],
    d: ['Reale Arena', 'La Cartuja', 'RCDE Stadium'],
    t: ['El Sadar', 'Coliseum', 'Montilivi', 'Vallecas', 'Estadio de la Cerámica']
  },

  // 31 - 40: Premier League e Inglaterra
  {
    c: 'Clubes que han ganado la Premier League inglesa (era moderna desde 1992)',
    f: ['Manchester United', 'Manchester City', 'Chelsea FC', 'Arsenal FC'],
    m: ['Liverpool FC', 'Leicester City', 'Blackburn Rovers'],
    d: ['Aston Villa', 'Everton FC', 'Newcastle United'],
    t: ['Tottenham Hotspur', 'West Ham United', 'Leeds United', 'Southampton', 'Fulham FC']
  },
  {
    c: 'Goleadores históricos con más de 150 goles en la Premier League',
    f: ['Alan Shearer', 'Harry Kane', 'Wayne Rooney', 'Sergio Agüero'],
    m: ['Thierry Henry', 'Mohamed Salah', 'Frank Lampard'],
    d: ['Andrew Cole', 'Robbie Fowler', 'Jermain Defoe'],
    t: ['Cristiano Ronaldo', 'Didier Drogba', 'Ruud van Nistelrooy', 'Fernando Torres', 'Luis Suárez']
  },
  {
    c: 'Clubes de fútbol profesionales situados en el área metropolitana de Londres',
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
    m: ['Gary Lineker', 'Paul Gascoigne', 'Alan Shearer'],
    d: ['Bryan Robson', 'Jimmy Greaves', 'Gordon Banks'],
    t: ['David Beckham', 'Wayne Rooney', 'Frank Lampard', 'Steven Gerrard', 'Harry Kane']
  },
  {
    c: 'Clubes ingleses campeones de la Copa de Europa / Champions League',
    f: ['Liverpool FC', 'Manchester United', 'Chelsea FC', 'Manchester City'],
    m: ['Nottingham Forest', 'Aston Villa', 'Arsenal FC'],
    d: ['Leeds United', 'Tottenham Hotspur', 'Newcastle United'],
    t: ['Everton FC', 'West Ham United', 'Leicester City', 'Wolverhampton', 'Southampton']
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
    t: ['Atalanta BC', 'Parma Calcio', 'Udinese Calcio', 'US Sassuolo', 'Palermo']
  },
  {
    c: 'Goleadores que han sido Capocannoniere de la Serie A italiana',
    f: ['Cristiano Ronaldo', 'Zlatan Ibrahimović', 'Ciro Immobile', 'Mauro Icardi'],
    m: ['Gonzalo Higuaín', 'Edinson Cavani', 'Luca Toni'],
    d: ['Victor Osimhen', 'Lautaro Martínez', 'Fabio Quagliarella'],
    t: ['Romelu Lukaku', 'Paulo Dybala', 'Dries Mertens', 'Álvaro Morata', 'Dusan Vlahovic']
  },
  {
    c: 'Futbolistas que han jugado en la Juventus, AC Milan e Inter de Milán',
    f: ['Zlatan Ibrahimović', 'Andrea Pirlo', 'Roberto Baggio', 'Leonardo Bonucci'],
    m: ['Christian Vieri', 'Edgar Davids', 'Patrick Vieira'],
    d: ['Giuseppe Meazza', 'Aldo Serena', 'Enrico Candiani'],
    t: ['Alessandro Del Piero', 'Paolo Maldini', 'Javier Zanetti', 'Gianluigi Buffon', 'Francesco Totti']
  },
  {
    c: 'Futbolistas italianos ganadores del Balón de Oro',
    f: ['Roberto Baggio', 'Fabio Cannavaro', 'Gianni Rivera', 'Paolo Rossi'],
    m: ['Omar Sívori', 'Dino Zoff', 'Giacinto Facchetti'],
    d: ['Sandro Mazzola', 'Franco Baresi', 'Salvatore Schillaci'],
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
    c: 'Clubes italianos que han disputado finales de la Copa de Europa / Champions League',
    f: ['Juventus', 'AC Milan', 'Inter de Milán', 'AS Roma'],
    m: ['UC Sampdoria', 'ACF Fiorentina', 'SS Lazio'],
    d: ['Parma Calcio', 'SSC Napoli', 'Torino FC'],
    t: ['Atalanta BC', 'Bologna FC', 'Genoa CFC', 'Udinese Calcio', 'Cagliari Calcio']
  },
  {
    c: 'Futbolistas que han disputado el Derbi de Milán con ambos clubes (Milan e Inter)',
    f: ['Zlatan Ibrahimović', 'Andrea Pirlo', 'Clarence Seedorf', 'Ronaldo Nazário'],
    m: ['Hakan Çalhanoğlu', 'Mario Balotelli', 'Hernán Crespo'],
    d: ['Antonio Cassano', 'Matteo Darmian', 'Francesco Acerbi'],
    t: ['Paolo Maldini', 'Javier Zanetti', 'Alessandro Nesta', 'Esteban Cambiasso', 'Gennaro Gattuso']
  },
  {
    c: 'Goleadores históricos de la Selección de Italia',
    f: ['Luigi Riva', 'Giuseppe Meazza', 'Silvio Piola', 'Roberto Baggio'],
    m: ['Alessandro Del Piero', 'Filippo Inzaghi', 'Alessandro Altobelli'],
    d: ['Christian Vieri', 'Francesco Graziani', 'Mario Balotelli'],
    t: ['Francesco Totti', 'Ciro Immobile', 'Andrea Pirlo', 'Gianluca Vialli', 'Lorenzo Insigne']
  },
  {
    c: 'Entrenadores italianos ganadores de la UEFA Champions League',
    f: ['Carlo Ancelotti', 'Arrigo Sacchi', 'Marcello Lippi', 'Fabio Capello'],
    m: ['Giovanni Trapattoni', 'Roberto Di Matteo', 'Nereo Rocco'],
    d: ['Claudio Ranieri', 'Massimiliano Allegri', 'Antonio Conte'],
    t: ['Luciano Spalletti', 'Maurizio Sarri', 'Simone Inzaghi', 'Gian Piero Gasperini', 'Stefano Pioli']
  },
  {
    c: 'Futbolistas que han marcado gol en finales de Copa del Mundo con la selección de Italia',
    f: ['Marco Materazzi', 'Paolo Rossi', 'Marco Tardelli', 'Alessandro Altobelli'],
    m: ['Silvio Piola', 'Gino Colaussi', 'Angelo Schiavio'],
    d: ['Raimundo Orsi', 'Luigi Riva', 'Roberto Baggio'],
    t: ['Alessandro Del Piero', 'Francesco Totti', 'Christian Vieri', 'Filippo Inzaghi', 'Gianluca Vialli']
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
    c: 'Futbolistas máximos goleadores de una temporada (Torjägerkanone) en la Bundesliga',
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
    c: 'Futbolistas alemanes galardonados con el Balón de Oro',
    f: ['Franz Beckenbauer', 'Gerd Müller', 'Karl-Heinz Rummenigge', 'Lothar Matthäus'],
    m: ['Matthias Sammer', 'Oliver Kahn', 'Bernd Schuster'],
    d: ['Paul Breitner', 'Uwe Seeler', 'Jürgen Klinsmann'],
    t: ['Manuel Neuer', 'Michael Ballack', 'Mesut Özil', 'Toni Kroos', 'Bastian Schweinsteiger']
  },
  {
    c: 'Goleadores históricos de la Selección de Alemania',
    f: ['Miroslav Klose', 'Gerd Müller', 'Lukas Podolski', 'Thomas Müller'],
    m: ['Jürgen Klinsmann', 'Rudi Völler', 'Karl-Heinz Rummenigge'],
    d: ['Uwe Seeler', 'Michael Ballack', 'Oliver Bierhoff'],
    t: ['Mario Götze', 'Mesut Özil', 'Toni Kroos', 'Bastian Schweinsteiger', 'Marco Reus']
  },
  {
    c: 'Futbolistas que formaron parte de la plantilla del Bayer Leverkusen campeón invicto (2023-24)',
    f: ['Florian Wirtz', 'Granit Xhaka', 'Jeremie Frimpong', 'Alejandro Grimaldo'],
    m: ['Victor Boniface', 'Jonathan Tah', 'Exequiel Palacios'],
    d: ['Lukáš Hrádecký', 'Robert Andrich', 'Piero Hincapié'],
    t: ['Kai Havertz', 'Moussa Diaby', 'Julian Brandt', 'Kevin Volland', 'Leon Bailey']
  },
  {
    c: 'Clubes alemanes que han ganado la Copa de Europa / Champions League',
    f: ['Bayern Múnich', 'Borussia Dortmund', 'Hamburgo SV', 'Borussia Mönchengladbach'],
    m: ['Eintracht Frankfurt', 'Bayer Leverkusen', 'RB Leipzig'],
    d: ['FC Schalke 04', 'Werder Bremen', 'VfB Stuttgart'],
    t: ['FC Colonia', 'Hertha Berlín', 'VfL Wolfsburgo', 'FSV Mainz 05', 'Hoffenheim']
  },
  {
    c: 'Estadios de fútbol en Alemania con capacidad superior a 50.000 espectadores',
    f: ['Signal Iduna Park', 'Allianz Arena', 'Olympiastadion de Berlín', 'Veltins-Arena'],
    m: ['Deutsche Bank Park', 'MHPArena', 'Borussia-Park'],
    d: ['RheinEnergieStadion', 'Volksparkstadion', 'Red Bull Arena'],
    t: ['BayArena', 'Weserstadion', 'Europa-Park Stadion', 'PreZero Arena', 'WWK Arena']
  },
  {
    c: 'Futbolistas extranjeros que han anotado más de 100 goles en la Bundesliga',
    f: ['Robert Lewandowski', 'Claudio Pizarro', 'Giovane Élber', 'Vedad Ibišević'],
    m: ['Aílton', 'Stéphane Chapuisat', 'Anthony Yeboah'],
    d: ['Pierre-Emerick Aubameyang', 'Wynton Rufer', 'Sergej Barbarez'],
    t: ['Erling Haaland', 'Harry Kane', 'Luka Jović', 'Raúl González', 'Paco Alcácer']
  },
  {
    c: 'Seleccionadores campeones de la Copa del Mundo con Alemania',
    f: ['Joachim Löw', 'Franz Beckenbauer', 'Helmut Schön', 'Sepp Herberger'],
    m: ['Jupp Derwall', 'Berti Vogts', 'Rudi Völler'],
    d: ['Jürgen Klinsmann', 'Hansi Flick', 'Julian Nagelsmann'],
    t: ['Jürgen Klopp', 'Ottmar Hitzfeld', 'Jupp Heynckes', 'Thomas Tuchel', 'Felix Magath']
  },

  // 61 - 70: Conmebol y Fútbol Sudamericano
  {
    c: 'Clubes que han ganado la Copa Libertadores tres o más veces',
    f: ['Independiente', 'Boca Juniors', 'Peñarol', 'River Plate'],
    m: ['Estudiantes de La Plata', 'Olimpia', 'Nacional de Montevideo'],
    d: ['São Paulo FC', 'Santos FC', 'Palmeiras'],
    t: ['Atlético Nacional', 'Cruzeiro', 'Internacional', 'Colo-Colo', 'San Lorenzo']
  },
  {
    c: 'Goleadores con 10 o más goles en la historia de la Copa América',
    f: ['Norberto Méndez', 'Zizinho', 'Lionel Messi', 'Eduardo Vargas'],
    m: ['Paolo Guerrero', 'Teodoro Fernández', 'Severino Varela'],
    d: ['Gabriel Batistuta', 'Héctor Scarone', 'Jairzinho'],
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
    c: 'Clubes que han ganado el título de la Copa Sudamericana',
    f: ['Boca Juniors', 'Independiente', 'Athletico Paranaense', 'Independiente del Valle'],
    m: ['Liga de Quito', 'River Plate', 'São Paulo FC'],
    d: ['San Lorenzo', 'Defensa y Justicia', 'Cienciano'],
    t: ['Flamengo', 'Palmeiras', 'Santos FC', 'Grêmio', 'Atlético Mineiro']
  },
  {
    c: 'Goleadores con más de 15 goles en Eliminatorias Sudamericanas (Conmebol)',
    f: ['Lionel Messi', 'Luis Suárez', 'Marcelo Moreno Martins', 'Alexis Sánchez'],
    m: ['Hernán Crespo', 'Edinson Cavani', 'Neymar Jr'],
    d: ['Joaquín Botero', 'Agustín Delgado', 'Jefferson Farfán'],
    t: ['Diego Maradona', 'Pelé', 'Ronaldo Nazário', 'Gabriel Batistuta', 'Radamel Falcao']
  },
  {
    c: 'Clubes de fútbol profesionales con sede en la ciudad de Buenos Aires (CABA)',
    f: ['Boca Juniors', 'River Plate', 'San Lorenzo', 'Vélez Sarsfield'],
    m: ['Huracán', 'Ferro Carril Oeste', 'Argentinos Juniors'],
    d: ['Barracas Central', 'All Boys', 'Nueva Chicago'],
    t: ['Racing Club', 'Independiente', 'Lanús', 'Banfield', 'Estudiantes de La Plata']
  },
  {
    c: 'Clubes brasileños que han ganado la Copa Mundial de Clubes de la FIFA (desde 2000)',
    f: ['São Paulo FC', 'Sport Club Internacional', 'Corinthians', 'Santos FC'],
    m: ['Flamengo', 'Palmeiras', 'Grêmio'],
    d: ['Atlético Mineiro', 'Cruzeiro', 'Fluminense'],
    t: ['Vasco da Gama', 'Botafogo', 'Bahia', 'Athletico Paranaense', 'Coritiba']
  },
  {
    c: 'Futbolistas uruguayos campeones de la Copa América',
    f: ['Luis Suárez', 'Diego Forlán', 'Edinson Cavani', 'Diego Godín'],
    m: ['Fernando Muslera', 'Enzo Francescoli', 'Álvaro Recoba'],
    d: ['Sebastián Coates', 'Diego Lugano', 'Rubén Paz'],
    t: ['Federico Valverde', 'Darwin Núñez', 'Ronald Araújo', 'José María Giménez', 'Rodrigo Bentancur']
  },
  {
    c: 'Futbolistas colombianos campeones de la Copa América (2001)',
    f: ['Iván Córdoba', 'Víctor Aristizábal', 'Mario Yepes', 'Óscar Córdoba'],
    m: ['Fabián Vargas', 'Giovanni Hernández', 'Gerardo Bedoya'],
    d: ['David Ferreira', 'Freddy Grisales', 'Mauricio Molina'],
    t: ['James Rodríguez', 'Radamel Falcao', 'Carlos Valderrama', 'Faustino Asprilla', 'Luis Díaz']
  },
  {
    c: 'Futbolistas chilenos campeones de la Copa América (2015 o 2016)',
    f: ['Alexis Sánchez', 'Arturo Vidal', 'Claudio Bravo', 'Gary Medel'],
    m: ['Eduardo Vargas', 'Charles Aránguiz', 'Mauricio Isla'],
    d: ['Marcelo Díaz', 'Jean Beausejour', 'Gonzalo Jara'],
    t: ['Marcelo Salas', 'Iván Zamorano', 'Humberto Suazo', 'Carlos Caszely', 'Jorge Valdivia']
  },

  // 71 - 80: Selecciones, Récords y Clásicos Mundiales
  {
    c: 'Futbolistas con más de 80 goles internacionales con su selección absoluta',
    f: ['Cristiano Ronaldo', 'Lionel Messi', 'Ali Daei', 'Sunil Chhetri'],
    m: ['Mokhtar Dahari', 'Ferenc Puskás', 'Robert Lewandowski'],
    d: ['Romelu Lukaku', 'Godfrey Chitalu', 'Hussein Saeed'],
    t: ['Neymar Jr', 'Pelé', 'Kylian Mbappé', 'Harry Kane', 'Zlatan Ibrahimović']
  },
  {
    c: 'Futbolistas que han disputado minutos en cinco ediciones distintas de la Copa del Mundo',
    f: ['Lionel Messi', 'Cristiano Ronaldo', 'Luka Modric', 'Andrés Guardado'],
    m: ['Rafael Márquez', 'Antonio Carbajal', 'Lothar Matthäus'],
    d: ['Guillermo Ochoa', 'Gianluigi Buffon', 'Hugo Lloris'],
    t: ['Pelé', 'Diego Maradona', 'Iker Casillas', 'Sergio Ramos', 'Ronaldo Nazário']
  },
  {
    c: 'Selecciones nacionales que han disputado una final de Copa del Mundo sin haber ganado el título',
    f: ['Países Bajos', 'Croacia', 'Hungría', 'Suecia'],
    m: ['Checoslovaquia', 'Polonia', 'Chile'],
    d: ['Bélgica', 'Austria', 'Turquía'],
    t: ['Portugal', 'Colombia', 'México', 'Dinamarca', 'Suiza']
  },
  {
    c: 'Selecciones masculinas que han ganado la medalla de oro en el torneo olímpico de fútbol',
    f: ['Brasil', 'Argentina', 'España', 'Uruguay'],
    m: ['Nigeria', 'Camerún', 'México'],
    d: ['Hungría', 'Gran Bretaña', 'Unión Soviética'],
    t: ['Alemania', 'Italia', 'Países Bajos', 'Portugal', 'Colombia']
  },
  {
    c: 'Futbolistas ganadores de la Bota de Oro en una Copa del Mundo masculina',
    f: ['Kylian Mbappé', 'Harry Kane', 'James Rodríguez', 'Thomas Müller'],
    m: ['Miroslav Klose', 'Ronaldo Nazário', 'Davor Šuker'],
    d: ['Oleg Salenko', 'Hristo Stoichkov', 'Salvatore Schillaci'],
    t: ['Lionel Messi', 'Cristiano Ronaldo', 'Neymar Jr', 'Zlatan Ibrahimović', 'Romelu Lukaku']
  },
  {
    c: 'Clubes que han conquistado los seis títulos oficiales posibles en un año natural (Sextete)',
    f: ['FC Barcelona', 'Bayern Múnich', 'Real Madrid', 'Manchester City'],
    m: ['Liverpool FC', 'Inter de Milán', 'Chelsea FC'],
    d: ['Paris Saint-Germain', 'Juventus', 'AC Milan'],
    t: ['Arsenal FC', 'Atlético de Madrid', 'Borussia Dortmund', 'Sevilla FC', 'FC Porto']
  },
  {
    c: 'Futbolistas que han marcado gol en finales de Champions League con clubes distintos',
    f: ['Cristiano Ronaldo', 'Mario Mandžukić', 'Velibor Vasović', 'Raúl González'],
    m: ['Samuel Eto\'o', 'Lionel Messi', 'Gareth Bale'],
    d: ['Sergio Ramos', 'Vinicius Jr', 'Hernán Crespo'],
    t: ['Karim Benzema', 'Didier Drogba', 'Arjen Robben', 'Diego Milito', 'Filippo Inzaghi']
  },
  {
    c: 'Futbolistas que han marcado de falta directa en una Copa del Mundo',
    f: ['David Beckham', 'Cristiano Ronaldo', 'Ronaldinho', 'Roberto Carlos'],
    m: ['Diego Maradona', 'Teófilo Cubillas', 'Pelé'],
    d: ['Keisuke Honda', 'Juan Fernando Quintero', 'Kieran Trippier'],
    t: ['Lionel Messi', 'Zinedine Zidane', 'Luka Modric', 'Thierry Henry', 'Kylian Mbappé']
  },
  {
    c: 'Árbitros que han dirigido la final de una Copa del Mundo masculina',
    f: ['Szymon Marciniak', 'Néstor Pitana', 'Nicola Rizzoli', 'Howard Webb'],
    m: ['Horacio Elizondo', 'Pierluigi Collina', 'Said Belqola'],
    d: ['Edgardo Codesal', 'Romualdo Arppi Filho', 'Jack Taylor'],
    t: ['Antonio Mateu Lahoz', 'Felix Brych', 'Mark Clattenburg', 'Cüneyt Çakır', 'Björn Kuipers']
  },
  {
    c: 'Futbolistas ganadores del premio Golden Boy al mejor jugador sub-21 de Europa',
    f: ['Lionel Messi', 'Kylian Mbappé', 'Erling Haaland', 'Pedri'],
    m: ['Gavi', 'Jude Bellingham', 'Wayne Rooney'],
    d: ['Cesc Fàbregas', 'Sergio Agüero', 'Paul Pogba'],
    t: ['Cristiano Ronaldo', 'Neymar Jr', 'Vinicius Jr', 'Eduardo Camavinga', 'Rodrygo']
  },

  // 81 - 90: Traspasos, Curiosidades y Tácticas
  {
    c: 'Futbolistas que han protagonizado traspasos por 100 millones de euros o más',
    f: ['Neymar Jr', 'Kylian Mbappé', 'Philippe Coutinho', 'Jude Bellingham'],
    m: ['Jack Grealish', 'Declan Rice', 'Moisés Caicedo'],
    d: ['Enzo Fernández', 'Eden Hazard', 'João Félix'],
    t: ['Erling Haaland', 'Zinedine Zidane', 'Luis Figo', 'Kaká', 'Virgil van Dijk']
  },
  {
    c: 'Futbolistas ganadores del Premio Puskás de la FIFA al mejor gol del año',
    f: ['Cristiano Ronaldo', 'Neymar Jr', 'Zlatan Ibrahimović', 'James Rodríguez'],
    m: ['Olivier Giroud', 'Mohamed Salah', 'Son Heung-min'],
    d: ['Hamit Altıntop', 'Miroslav Stoch', 'Erik Lamela'],
    t: ['Lionel Messi', 'Kylian Mbappé', 'Gareth Bale', 'Ronaldinho', 'Roberto Carlos']
  },
  {
    c: 'Futbolistas con más de 1.000 partidos oficiales disputados en su carrera',
    f: ['Cristiano Ronaldo', 'Lionel Messi', 'Gianluigi Buffon', 'Iker Casillas'],
    m: ['Roberto Carlos', 'Xavi Hernández', 'Dani Alves'],
    d: ['Peter Shilton', 'Rogério Ceni', 'František Plánička'],
    t: ['Diego Maradona', 'Zinedine Zidane', 'Ronaldo Nazário', 'Ronaldinho', 'Thierry Henry']
  },
  {
    c: 'Guardametas que han marcado 20 o más goles oficiales en su carrera',
    f: ['Rogério Ceni', 'José Luis Chilavert', 'Jorge Campos', 'Johnny Vegas'],
    m: ['René Higuita', 'Dimitar Ivankov', 'Márcio'],
    d: ['Hans-Jörg Butt', 'Vincent Enyeama', 'Dragan Pantelić'],
    t: ['Manuel Neuer', 'Iker Casillas', 'Gianluigi Buffon', 'Thibaut Courtois', 'Alisson Becker']
  },
  {
    c: 'Futbolistas que han marcado gol en cuatro o más ediciones distintas de la Copa del Mundo',
    f: ['Cristiano Ronaldo', 'Lionel Messi', 'Pelé', 'Miroslav Klose'],
    m: ['Uwe Seeler', 'Diego Maradona', 'Ronaldo Nazário'],
    d: ['Edinson Cavani', 'Luis Suárez', 'Gerd Müller'],
    t: ['Zinedine Zidane', 'Thierry Henry', 'David Villa', 'Neymar Jr', 'Kylian Mbappé']
  },
  {
    c: 'Países que han albergado la fase final de la Copa del Mundo masculina en dos o más ocasiones',
    f: ['México', 'Italia', 'Francia', 'Alemania'],
    m: ['Brasil', 'Estados Unidos', 'España'],
    d: ['Inglaterra', 'Argentina', 'Uruguay'],
    t: ['Sudáfrica', 'Rusia', 'Catar', 'Chile', 'Suecia']
  },
  {
    c: 'Futbolistas que han jugado en el Bayern Múnich y en el Real Madrid',
    f: ['Toni Kroos', 'Xabi Alonso', 'David Alaba', 'Arjen Robben'],
    m: ['James Rodríguez', 'Hamit Altıntop', 'Zé Roberto'],
    d: ['Paul Breitner', 'Álvaro Odriozola', 'Christoph Metzelder'],
    t: ['Robert Lewandowski', 'Thomas Müller', 'Manuel Neuer', 'Bastian Schweinsteiger', 'Franck Ribéry']
  },
  {
    c: 'Futbolistas que han jugado en el Inter de Milán y en el Real Madrid',
    f: ['Ronaldo Nazário', 'Roberto Carlos', 'Luís Figo', 'Wesley Sneijder'],
    m: ['Mateo Kovačić', 'Walter Samuel', 'Esteban Cambiasso'],
    d: ['Christian Panucci', 'Clarence Seedorf', 'Achraf Hakimi'],
    t: ['Javier Zanetti', 'Diego Milito', 'Zlatan Ibrahimović', 'Mauro Icardi', 'Adriano Leite']
  },
  {
    c: 'Futbolistas que han ganado la Copa Libertadores y la Copa del Mundo en su trayectoria',
    f: ['Pelé', 'Ronaldinho', 'Rivaldo', 'Julián Álvarez'],
    m: ['Dida', 'Cafú', 'Franco Armani'],
    d: ['Bebeto', 'Zito', 'Roque Júnior'],
    t: ['Lionel Messi', 'Cristiano Ronaldo', 'Neymar Jr', 'Carlos Tévez', 'Diego Maradona']
  },
  {
    c: 'Futbolistas expulsados con tarjeta roja en una final de Copa del Mundo masculina',
    f: ['Zinedine Zidane', 'Pedro Monzón', 'Gustavo Dezotti', 'Marcel Desailly'],
    m: ['John Heitinga', 'Marco Materazzi', 'Rigobert Song'],
    d: ['Wayne Rooney', 'David Beckham', 'Luis Suárez'],
    t: ['Diego Maradona', 'Ronaldo Nazário', 'Oliver Kahn', 'Gianluigi Buffon', 'Fabio Cannavaro']
  },

  // 91 - 100: Leyendas, Hat-tricks y Derbis
  {
    c: 'Futbolistas que han marcado un hat-trick en El Clásico (Real Madrid vs Barcelona)',
    f: ['Lionel Messi', 'Luis Suárez', 'Karim Benzema', 'Vinicius Jr'],
    m: ['Romário', 'Gary Lineker', 'Ferenc Puskás'],
    d: ['Jaime Lazcano', 'Santiago Bernabéu', 'Jesús Narro'],
    t: ['Cristiano Ronaldo', 'Raúl González', 'Ronaldinho', 'Neymar Jr', 'Gareth Bale']
  },
  {
    c: 'Futbolistas que han marcado dos o más goles en una misma final de Copa del Mundo',
    f: ['Kylian Mbappé', 'Geoff Hurst', 'Pelé', 'Zinedine Zidane'],
    m: ['Ronaldo Nazário', 'Lionel Messi', 'Mario Kempes'],
    d: ['Gino Colaussi', 'Silvio Piola', 'Helmut Rahn'],
    t: ['Diego Maradona', 'Miroslav Klose', 'Andrés Iniesta', 'Antoine Griezmann', 'Mario Götze']
  },
  {
    c: 'Clubes que han ganado el título de la Primera División de Uruguay',
    f: ['Club Nacional de Football', 'Club Atlético Peñarol', 'Defensor Sporting', 'Danubio FC'],
    m: ['Montevideo Wanderers', 'Bella Vista', 'Progreso'],
    d: ['Central Español', 'Rocha FC', 'Liverpool FC de Montevideo'],
    t: ['Cerro Porteño', 'Olimpia', 'Colo-Colo', 'Universidad de Chile', 'Bolívar']
  },
  {
    c: 'Clubes que han ganado el título de la Eredivisie holandesa',
    f: ['AFC Ajax', 'PSV Eindhoven', 'Feyenoord', 'AZ Alkmaar'],
    m: ['FC Twente', 'Sparta Rotterdam', 'Willem II'],
    d: ['DWS Amsterdam', 'DOS Utrecht', 'Rapid JC'],
    t: ['FC Utrecht', 'Vitesse Arnhem', 'SC Heerenveen', 'FC Groningen', 'ADO Den Haag']
  },
  {
    c: 'Futbolistas que han marcado 35 o más goles en una sola temporada de LaLiga',
    f: ['Lionel Messi', 'Cristiano Ronaldo', 'Luis Suárez', 'Hugo Sánchez'],
    m: ['Telmo Zarra', 'Baltazar', 'Pruden'],
    d: ['Romário', 'Ronaldo Nazário', 'Diego Forlán'],
    t: ['Karim Benzema', 'Robert Lewandowski', 'Raúl González', 'David Villa', 'Samuel Eto\'o']
  },
  {
    c: 'Futbolistas que han ganado la Champions League, la Premier League y LaLiga española',
    f: ['Cristiano Ronaldo', 'Thierry Henry', 'Gerard Piqué', 'Xabi Alonso'],
    m: ['Ricardo Carvalho', 'Cesc Fàbregas', 'David Silva'],
    d: ['Nicolas Anelka', 'Eidur Gudjohnsen', 'Álvaro Arbeloa'],
    t: ['Lionel Messi', 'Sergio Ramos', 'Karim Benzema', 'Wayne Rooney', 'Eden Hazard']
  },
  {
    c: 'Entrenadores que han ganado ligas nacionales en tres o más países europeos diferentes',
    f: ['Carlo Ancelotti', 'José Mourinho', 'Pep Guardiola', 'Giovanni Trapattoni'],
    m: ['Ernst Happel', 'Tomislav Ivić', 'Louis van Gaal'],
    d: ['Sven-Göran Eriksson', 'Béla Guttmann', 'Guus Hiddink'],
    t: ['Jürgen Klopp', 'Zinedine Zidane', 'Diego Simeone', 'Sir Alex Ferguson', 'Arsène Wenger']
  },
  {
    c: 'Futbolistas que han lucido el brazalete de capitán con la Selección Española en Mundiales o Eurocopas',
    f: ['Iker Casillas', 'Sergio Ramos', 'Sergio Busquets', 'Álvaro Morata'],
    m: ['Raúl González', 'Fernando Hierro', 'Andoni Zubizarreta'],
    d: ['José Antonio Camacho', 'Ferran Olivella', 'Emilio Butragueño'],
    t: ['Andrés Iniesta', 'Xavi Hernández', 'David Villa', 'Gerard Piqué', 'Carles Puyol']
  },
  {
    c: 'Clubes que han ganado la Copa Intercontinental de fútbol',
    f: ['Real Madrid', 'AC Milan', 'Boca Juniors', 'Peñarol'],
    m: ['Nacional de Montevideo', 'São Paulo FC', 'Santos FC'],
    d: ['Ajax de Ámsterdam', 'Bayern Múnich', 'Inter de Milán'],
    t: ['FC Barcelona', 'Liverpool FC', 'Arsenal FC', 'Paris Saint-Germain', 'Chelsea FC']
  },
  {
    c: 'Futbolistas nacionalizados que han jugado con la Selección Absoluta de España habiendo nacido fuera',
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