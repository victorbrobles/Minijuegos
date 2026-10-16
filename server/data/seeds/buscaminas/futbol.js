export default Array.from({ length: 20 }, (_, idx) => {
  const plantillas = [
    {
      c: 'Futbolistas que han ganado el Balón de Oro',
      f: ['Lionel Messi', 'Cristiano Ronaldo', 'Zinedine Zidane', 'Ronaldinho'],
      m: ['Luka Modric', 'Karim Benzema', 'Kaká'],
      d: ['Michael Owen', 'Pavel Nedvěd', 'George Weah'],
      t: ['Neymar Jr', 'Andrés Iniesta', 'Xavi Hernández', 'Thierry Henry', 'Robert Lewandowski']
    },
    {
      c: 'Selecciones nacionales campeonas de la Copa del Mundo masculina',
      f: ['Brasil', 'Argentina', 'Alemania', 'Francia'],
      m: ['Italia', 'España', 'Inglaterra'],
      d: ['Uruguay', 'Alemania Federal', 'Francia (1998)'],
      t: ['Países Bajos', 'Portugal', 'Bélgica', 'Croacia', 'Colombia']
    },
    {
      c: 'Equipos que han ganado la UEFA Champions League / Copa de Europa',
      f: ['Real Madrid', 'FC Barcelona', 'Bayern Múnich', 'Liverpool FC'],
      m: ['Manchester United', 'AC Milan', 'Chelsea FC'],
      d: ['AFC Ajax', 'FC Porto', 'Inter de Milán'],
      t: ['Arsenal FC', 'Atlético de Madrid', 'Paris Saint-Germain', 'Tottenham Hotspur', 'AS Roma']
    },
    {
      c: 'Futbolistas que han jugado tanto en el Real Madrid como en el FC Barcelona',
      f: ['Luis Figo', 'Ronaldo Nazário', 'Luis Enrique', 'Michael Laudrup'],
      m: ['Samuel Eto\'o', 'Javier Saviola', 'Bernd Schuster'],
      d: ['Robert Prosinečki', 'Gheorghe Hagi', 'Albert Celades'],
      t: ['Zinedine Zidane', 'Lionel Messi', 'Cristiano Ronaldo', 'Raúl González', 'Carles Puyol']
    },
    {
      c: 'Entrenadores ganadores de la UEFA Champions League',
      f: ['Pep Guardiola', 'Carlo Ancelotti', 'Zinedine Zidane', 'José Mourinho'],
      m: ['Jürgen Klopp', 'Sir Alex Ferguson', 'Vicente del Bosque'],
      d: ['Rafa Benítez', 'Luis Enrique', 'Thomas Tuchel'],
      t: ['Diego Simeone', 'Arsène Wenger', 'Mauricio Pochettino', 'Mikel Arteta', 'Marcelo Bielsa']
    },
    {
      c: 'Clubes que disputan o han disputado LaLiga EA Sports (1ª División de España)',
      f: ['Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Sevilla FC'],
      m: ['Athletic Club', 'Valencia CF', 'Real Betis'],
      d: ['Girona FC', 'CA Osasuna', 'Getafe CF'],
      t: ['FC Porto', 'SL Benfica', 'Sporting CP', 'Celtic FC', 'Rangers FC']
    },
    {
      c: 'Goleadores históricos de la Copa del Mundo de fútbol',
      f: ['Miroslav Klose', 'Ronaldo Nazário', 'Gerd Müller', 'Lionel Messi'],
      m: ['Kylian Mbappé', 'Pelé', 'Just Fontaine'],
      d: ['Sandor Kocsis', 'Jürgen Klinsmann', 'Helmut Rahn'],
      t: ['Cristiano Ronaldo', 'Neymar Jr', 'Zlatan Ibrahimović', 'Wayne Rooney', 'Thierry Henry']
    },
    {
      c: 'Futbolistas brasileños campeones del Mundo',
      f: ['Pelé', 'Ronaldo Nazário', 'Ronaldinho', 'Cafú'],
      m: ['Roberto Carlos', 'Rivaldo', 'Romário'],
      d: ['Bebeto', 'Dunga', 'Garrincha'],
      t: ['Neymar Jr', 'Dani Alves', 'Thiago Silva', 'Vinicius Jr', 'Casemiro']
    },
    {
      c: 'Estadios de fútbol con capacidad superior a 75.000 espectadores',
      f: ['Camp Nou', 'Santiago Bernabéu', 'Wembley Stadium', 'San Siro'],
      m: ['Signal Iduna Park', 'Allianz Arena', 'Stade de France'],
      d: ['Estadio Azteca', 'Maracaná', 'FNB Stadium (Johannesburgo)'],
      t: ['Anfield', 'Stamford Bridge', 'Parc des Princes', 'Etihad Stadium', 'Juventus Stadium']
    },
    {
      c: 'Clubes que han ganado la Premier League inglesa (desde 1992)',
      f: ['Manchester United', 'Manchester City', 'Chelsea FC', 'Arsenal FC'],
      m: ['Liverpool FC', 'Leicester City', 'Blackburn Rovers'],
      d: ['Manchester United (13 títulos)', 'Arsenal (Invencibles)', 'Chelsea (Mourinho)'],
      t: ['Tottenham Hotspur', 'Newcastle United', 'Everton FC', 'Aston Villa', 'Leeds United']
    },
    {
      c: 'Futbolistas que han vestido la camiseta del Paris Saint-Germain',
      f: ['Lionel Messi', 'Kylian Mbappé', 'Neymar Jr', 'Zlatan Ibrahimović'],
      m: ['Sergio Ramos', 'David Beckham', 'Edinson Cavani'],
      d: ['Ronaldinho', 'Thiago Silva', 'Ángel Di María'],
      t: ['Cristiano Ronaldo', 'Robert Lewandowski', 'Erling Haaland', 'Karim Benzema', 'Luka Modric']
    },
    {
      c: 'Porteros galardonados con el Trofeo Yashin o Guante de Oro del Mundial',
      f: ['Thibaut Courtois', 'Emiliano Martínez', 'Manuel Neuer', 'Iker Casillas'],
      m: ['Gianluigi Buffon', 'Alisson Becker', 'Gianluigi Donnarumma'],
      d: ['Yassine Bounou', 'Oliver Kahn', 'Fabien Barthez'],
      t: ['David de Gea', 'Jan Oblak', 'Marc-André ter Stegen', 'Keylor Navas', 'Víctor Valdés']
    },
    {
      c: 'Clubes argentinos que han ganado la Copa Libertadores de América',
      f: ['Boca Juniors', 'River Plate', 'Independiente', 'Racing Club'],
      m: ['San Lorenzo', 'Estudiantes de La Plata', 'Vélez Sarsfield'],
      d: ['Argentinos Juniors', 'Newell\'s Old Boys (Finalista)', 'Lanús (Finalista)'],
      t: ['Rosario Central', 'Colón', 'Gimnasia La Plata', 'Huracán', 'Belgrano']
    },
    {
      c: 'Futbolistas con más de 100 partidos internacionales con España',
      f: ['Sergio Ramos', 'Iker Casillas', 'Sergio Busquets', 'Andrés Iniesta'],
      m: ['Xavi Hernández', 'Fernando Torres', 'Cesc Fàbregas'],
      d: ['David Silva', 'Xabi Alonso', 'Andoni Zubizarreta'],
      t: ['David Villa', 'Carles Puyol', 'Raúl González', 'Gerard Piqué', 'Álvaro Morata']
    },
    {
      c: 'Clubes italianos que han ganado la Serie A (Scudetto)',
      f: ['Juventus', 'Inter de Milán', 'AC Milan', 'SSC Napoli'],
      m: ['AS Roma', 'Lazio', 'Fiorentina'],
      d: ['Torino', 'Bologna', 'Cagliari'],
      t: ['Atalanta', 'Parma Calcio', 'Udinese', 'Sassuolo', 'Genoa (moderno)']
    },
    {
      c: 'Futbolistas que han ganado el premio The Best de la FIFA',
      f: ['Cristiano Ronaldo', 'Lionel Messi', 'Robert Lewandowski', 'Luka Modric'],
      m: ['Zinédine Zidane', 'Ronaldinho', 'Ronaldo Nazário'],
      d: ['Kaká', 'Fabio Cannavaro', 'George Weah'],
      t: ['Neymar Jr', 'Kylian Mbappé', 'Erling Haaland', 'Antoine Griezmann', 'Mohamed Salah']
    },
    {
      c: 'Dorsales históricos retirados en clubes de fútbol',
      f: ['Dorsal 3 en AC Milan (Maldini)', 'Dorsal 10 en Napoli (Maradona)', 'Dorsal 14 en Ajax (Cruyff)', 'Dorsal 6 en AC Milan (Baresi)'],
      m: ['Dorsal 10 en Brescia (Baggio)', 'Dorsal 4 en Inter (Zanetti)', 'Dorsal 10 en Chelsea (Zola)'],
      d: ['Dorsal 13 en Fiorentina (Astori)', 'Dorsal 23 en Man City (Foe)', 'Dorsal 16 en Sevilla (Puerta - temporal)'],
      t: ['Dorsal 7 en Real Madrid', 'Dorsal 10 en Barcelona', 'Dorsal 7 en Manchester United', 'Dorsal 10 en Arsenal', 'Dorsal 8 en Liverpool']
    },
    {
      c: 'Clubes de fútbol de la ciudad de Londres (Inglaterra)',
      f: ['Arsenal FC', 'Chelsea FC', 'Tottenham Hotspur', 'West Ham United'],
      m: ['Crystal Palace', 'Fulham FC', 'Brentford FC'],
      d: ['Millwall FC', 'Queens Park Rangers', 'Charlton Athletic'],
      t: ['Manchester City', 'Liverpool FC', 'Everton FC', 'Aston Villa', 'Leeds United']
    },
    {
      c: 'Futbolistas que han marcado más de 700 goles oficiales',
      f: ['Cristiano Ronaldo', 'Lionel Messi', 'Pelé', 'Romário'],
      m: ['Ferenc Puskás', 'Josef Bican', 'Gerd Müller'],
      d: ['Robert Lewandowski', 'Zlatan Ibrahimović', 'Jimmy Jones'],
      t: ['Ronaldo Nazário', 'Thierry Henry', 'Karim Benzema', 'Raúl González', 'Wayne Rooney']
    },
    {
      c: 'Clubes que han conquistado un "Triplete" (Liga, Copa y Champions)',
      f: ['FC Barcelona (2009)', 'FC Barcelona (2015)', 'Bayern Múnich (2013)', 'Manchester City (2023)'],
      m: ['Manchester United (1999)', 'Inter de Milán (2010)', 'Bayern Múnich (2020)'],
      d: ['Celtic FC (1967)', 'AFC Ajax (1972)', 'PSV Eindhoven (1988)'],
      t: ['Real Madrid', 'Liverpool FC', 'AC Milan', 'Chelsea FC', 'Juventus']
    }
  ];

  const p = plantillas[idx];
  return {
    id: `futbol_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});