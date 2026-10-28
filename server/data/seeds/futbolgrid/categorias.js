// server/data/seeds/futbolgrid/grids.seed.js

const GRIDS_PREESTABLECIDOS = [
  {
    id: "grid_1", dificultad: "Fácil",
    filas: ["Jugó en el Real Madrid", "Selección: Argentina", "Ganó el Mundial"],
    columnas: ["Jugó en el FC Barcelona", "Entrenado por Pep Guardiola", "Jugó con Neymar Jr"],
    respuestas: [
      [["Luis Figo", "Ronaldo Nazario", "Javier Saviola", "Samuel Eto'o", "Luis Enrique", "Julen Lopetegui"], ["Xabi Alonso", "Toni Kroos", "Brahim Diaz", "Danilo"], ["Casemiro", "Vinicius Junior", "Rodrygo", "Eder Militao", "Keylor Navas", "Sergio Ramos", "Angel Di Maria", "Achraf Hakimi"]],
      [["Leo Messi", "Javier Mascherano", "Diego Maradona", "Gabriel Milito", "Juan Roman Riquelme", "Sergio Aguero"], ["Leo Messi", "Javier Mascherano", "Sergio Aguero", "Nicolas Otamendi", "Julian Alvarez", "Pablo Zabaleta"], ["Leo Messi", "Angel Di Maria", "Leandro Paredes", "Mauro Icardi", "Giovani Lo Celso"]],
      [["Leo Messi", "Andres Iniesta", "Xavi Hernandez", "Sergio Busquets", "Gerard Pique", "Carles Puyol", "Ronaldinho", "Rivaldo", "Ousmane Dembele", "Antoine Griezmann", "Thierry Henry", "Cesc Fabregas", "Pedro"], ["Leo Messi", "Julian Alvarez", "Xavi Hernandez", "Andres Iniesta", "Sergio Busquets", "Gerard Pique", "Carles Puyol", "Pedro", "Manuel Neuer", "Thomas Muller", "Philipp Lahm", "Mario Gotze", "Jerome Boateng", "Bastian Schweinsteiger", "Toni Kroos", "Jesus Navas"], ["Leo Messi", "Angel Di Maria", "Leandro Paredes", "Kylian Mbappe", "Sergio Ramos", "Julian Draxler", "Presnel Kimpembe"]]
    ]
  },
  {
    id: "grid_2", dificultad: "Medio",
    filas: ["Jugó en el AC Milan", "Fichaje de más de 80M€", "Ganó la Copa Libertadores"],
    columnas: ["Jugó en la Juventus", "Jugó en la Premier League", "Balón de Oro"],
    respuestas: [
      [["Andrea Pirlo", "Zlatan Ibrahimovic", "Roberto Baggio", "Filippo Inzaghi", "Leonardo Bonucci", "Gonzalo Higuain", "Edgar Davids", "Patrick Vieira", "Gianluca Zambrotta", "Christian Abbiati"], ["Andriy Shevchenko", "Thiago Silva", "Olivier Giroud", "Zlatan Ibrahimovic", "Mario Balotelli", "Brahim Diaz", "Sandro Tonali", "Pierre-Emerick Aubameyang", "Alexandre Pato", "Hernan Crespo", "Suso"], ["Kaka", "Andriy Shevchenko", "Ronaldinho", "Ronaldo Nazario", "Marco van Basten", "Ruud Gullit", "George Weah", "Roberto Baggio", "Jean-Pierre Papin", "Rivaldo"]],
      [["Cristiano Ronaldo", "Gonzalo Higuain", "Matthijs de Ligt", "Dusan Vlahovic", "Arthur Melo"], ["Jack Grealish", "Declan Rice", "Enzo Fernandez", "Moises Caicedo", "Romelu Lukaku", "Paul Pogba", "Antony", "Harry Maguire", "Jadon Sancho", "Darwin Nunez", "Virgil van Dijk", "Kai Havertz", "Mykhailo Mudryk", "Josko Gvardiol", "Gareth Bale"], ["Cristiano Ronaldo"]],
      [["Carlos Tevez", "Arturo Vidal", "Danilo", "Alex Sandro", "Arthur Melo", "Kaio Jorge"], ["Julian Alvarez", "Ramires", "Carlos Tevez", "Oscar", "David Luiz", "Danilo", "Gabriel Jesus", "Fernandinho"], ["Ronaldinho"]]
    ]
  },
  {
    id: "grid_3", dificultad: "Difícil",
    filas: ["Jugó en el Bayern Múnich", "Entrenado por Jürgen Klopp", "Selección: Francia"],
    columnas: ["Jugó en el Chelsea", "Ganó la Champions League", "Jugó con Zlatan Ibrahimovic"],
    respuestas: [
      [["Michael Ballack", "Arjen Robben", "Claudio Pizarro", "Renato Sanches"], ["Manuel Neuer", "Thomas Muller", "Philipp Lahm", "Franck Ribery", "Arjen Robben", "Robert Lewandowski", "Toni Kroos", "David Alaba", "Alphonso Davies", "Joshua Kimmich", "Kingsley Coman", "Bastian Schweinsteiger"], ["Kingsley Coman", "Arturo Vidal", "Mark van Bommel"]],
      [["Mohamed Salah"], ["Mohamed Salah", "Sadio Mane", "Roberto Firmino", "Alisson Becker", "Virgil van Dijk", "Jordan Henderson", "Trent Alexander-Arnold", "Andrew Robertson", "Fabinho", "Robert Lewandowski", "Ilkay Gundogan", "Mats Hummels"], ["Henrikh Mkhitaryan"]],
      [["N'Golo Kante", "Olivier Giroud", "Nicolas Anelka", "Florent Malouda", "Marcel Desailly", "Claude Makelele", "William Gallas", "Emmanuel Petit", "Christopher Nkunku", "Axel Disasi", "Benoit Badiashile", "Wesley Fofana"], ["Karim Benzema", "Zinedine Zidane", "Thierry Henry", "Franck Ribery", "N'Golo Kante", "Raphael Varane", "Kingsley Coman", "Benjamin Pavard", "Lucas Hernandez", "Eduardo Camavinga", "Aurelien Tchouameni", "Ferland Mendy"], ["Paul Pogba", "Olivier Giroud", "Adrien Rabiot", "Blaise Matuidi", "Jeremy Menez", "Philippe Mexes", "Patrick Vieira", "Lilian Thuram", "David Trezeguet", "Lucas Digne", "Mike Maignan"]]
    ]
  },
  {
    id: "grid_4", dificultad: "Medio",
    filas: ["Jugó en el Arsenal", "Balón de Oro", "Entrenado por Diego Simeone"],
    columnas: ["Jugó en el Inter de Milán", "Jugó con Leo Messi", "Selección: Inglaterra"],
    respuestas: [
      [["Dennis Bergkamp", "Patrick Vieira", "Nwankwo Kanu", "Alexis Sanchez", "Lukas Podolski", "Henrikh Mkhitaryan"], ["Cesc Fabregas", "Thierry Henry", "Alexis Sanchez", "Hector Bellerin"], ["Bukayo Saka", "Declan Rice", "Tony Adams", "Sol Campbell", "Ashley Cole", "Jack Wilshere", "Theo Walcott", "Aaron Ramsdale", "Ian Wright"]],
      [["Lothar Matthaus", "Ronaldo Nazario", "Luis Figo", "George Weah"], ["Leo Messi", "Ronaldinho", "Luis Suarez"], ["Michael Owen", "Kevin Keegan", "Bobby Charlton", "Stanley Matthews"]],
      [["Diego Godin", "Miranda", "Joao Miranda", "Sime Vrsaljko", "Diego Forlan", "Christian Vieri", "Thiago Motta"], ["Luis Suarez", "Rodrigo De Paul", "Angel Correa", "Nahuel Molina", "Antoine Griezmann"], ["Kieran Trippier"]]
    ]
  },
  {
    id: "grid_5", dificultad: "Difícil",
    filas: ["Jugó en el Borussia Dortmund", "Selección: Brasil", "Ganó el triplete"],
    columnas: ["Entrenado por José Mourinho", "Selección: Alemania", "Jugó en el PSG"],
    respuestas: [
      [["Nuri Sahin", "Henrikh Mkhitaryan"], ["Marco Reus", "Mats Hummels", "Mario Gotze", "Ilkay Gundogan", "Karim Adeyemi", "Emre Can", "Julian Brandt", "Niclas Fullkrug", "Nico Schlotterbeck", "Matthias Ginter"], ["Achraf Hakimi", "Ousmane Dembele", "Abdou Diallo", "Thomas Meunier"]],
      [["Kaka", "Marcelo", "Casemiro", "Oscar", "Willian", "Julio Cesar", "Lucio", "Maicon", "Fabinho", "Fred"], ["Paulo Rink", "Cacau"], ["Neymar Jr", "Thiago Silva", "Marquinhos", "Dani Alves", "Ronaldinho", "Lucas Moura", "Maxwell", "Alex", "David Luiz", "Rai", "Leonardo"]],
      [["Samuel Eto'o", "Wesley Sneijder", "Julio Cesar", "Lucio", "Maicon", "Javier Zanetti", "Diego Milito", "Goran Pandev"], ["Manuel Neuer", "Thomas Muller", "Philipp Lahm", "Bastian Schweinsteiger", "Jerome Boateng", "Toni Kroos", "Marc-Andre ter Stegen", "Ilkay Gundogan"], ["Neymar Jr", "Leo Messi", "Kingsley Coman", "Angel Di Maria", "Dani Alves", "Thiago Motta", "Maxwell"]]
    ]
  },
  {
    id: "grid_6", dificultad: "Fácil",
    filas: ["Jugó en el Liverpool", "Jugó en el Ajax", "Entrenado por Carlo Ancelotti"],
    columnas: ["Jugó en el Real Madrid", "Bota de Oro", "Selección: Uruguay"],
    respuestas: [
      [["Xabi Alonso", "Michael Owen", "Steve McManaman", "Jerzy Dudek", "Alvaro Arbeloa", "Antonio Nunez", "Fabinho", "Nuri Sahin"], ["Luis Suarez", "Ian Rush"], ["Luis Suarez", "Darwin Nunez", "Sebastian Coates"]],
      [["Wesley Sneijder", "Rafael van der Vaart", "Klaas-Jan Huntelaar", "Clarence Seedorf"], ["Luis Suarez"], ["Luis Suarez"]],
      [["Cristiano Ronaldo", "Karim Benzema", "Gareth Bale", "Luka Modric", "Toni Kroos", "Sergio Ramos", "Pepe", "Marcelo", "Casemiro", "Vinicius Junior", "Rodrygo", "Federico Valverde", "Thibaut Courtois", "Xabi Alonso", "Angel Di Maria", "Iker Casillas", "James Rodriguez", "Kaka", "Jude Bellingham"], ["Cristiano Ronaldo", "Robert Lewandowski"], ["Federico Valverde", "Ronald Araujo"]]
    ]
  },
  {
    id: "grid_7", dificultad: "Difícil",
    filas: ["Jugó en el Napoli", "Ganó la Copa Libertadores", "Más de 100 partidos con su selección"],
    columnas: ["Jugó en el Chelsea", "Selección: Colombia", "Entrenado por Pep Guardiola"],
    respuestas: [
      [["Jorginho", "Kalidou Koulibaly", "Tiemoue Bakayoko", "Nathaniel Chalobah", "Gonzalo Higuain"], ["David Ospina", "Juan Camilo Zuniga", "Pablo Armero", "Duvan Zapata"], ["Pepe Reina", "Eduardo Vargas"]],
      [["Ramires", "Willy Caballero", "Kenedy"], ["Miguel Borja", "Franco Armani"], ["Julian Alvarez", "Fernandinho", "Danilo", "Rafinha"]],
      [["Frank Lampard", "Ashley Cole", "John Terry", "Petr Cech", "Eden Hazard", "Branislav Ivanovic", "Didier Drogba", "Thiago Silva", "Olivier Giroud", "Cesc Fabregas", "Romelu Lukaku"], ["David Ospina", "Juan Cuadrado", "Carlos Valderrama", "Radamel Falcao", "James Rodriguez", "Mario Yepes"], ["Leo Messi", "Andres Iniesta", "Xavi Hernandez", "Sergio Busquets", "Gerard Pique", "Carles Puyol", "Cesc Fabregas", "Thierry Henry", "Manuel Neuer", "Thomas Muller", "Philipp Lahm", "Toni Kroos", "Robert Lewandowski", "Kevin De Bruyne", "Vincent Kompany", "Claudio Bravo", "Alexis Sanchez"]]
    ]
  },
  {
    id: "grid_8", dificultad: "Medio",
    filas: ["Jugó en el Atlético de Madrid", "Selección: Portugal", "Premio Puskas"],
    columnas: ["Jugó en el Manchester City", "Entrenado por Diego Simeone", "Jugó en la Juventus"],
    respuestas: [
      [["Sergio Aguero", "Rodri", "Stefan Savic", "Martin Demichelis", "Julian Alvarez", "Kieran Trippier", "Renan Lodi", "Jose Antonio Reyes"], ["Antoine Griezmann", "Koke", "Jan Oblak", "Diego Godin", "Jose Maria Gimenez", "Angel Correa", "Saul Niguez", "Marcos Llorente", "Alvaro Morata", "Joao Felix", "Filipe Luis", "Juanfran", "Gabi", "Tiago", "Diego Costa", "Radamel Falcao", "Arda Turan", "Thibaut Courtois", "Yannick Carrasco"], ["Alvaro Morata", "Tiago", "Mario Mandzukic", "Christian Vieri", "Diego" ]],
      [["Bernardo Silva", "Ruben Dias", "Joao Cancelo", "Ederson", "Matheus Nunes"], ["Joao Felix", "Tiago"], ["Cristiano Ronaldo", "Joao Cancelo", "Francisco Conceicao"]],
      [["Erik Lamela", "Son Heung-min"], ["Falcao", "Antoine Griezmann"], ["Cristiano Ronaldo", "Mario Mandzukic"]]
    ]
  },
  {
    id: "grid_9", dificultad: "Difícil",
    filas: ["Jugó en el Tottenham", "Selección: Países Bajos", "Usó un dorsal mayor a 90"],
    columnas: ["Jugó en el Inter de Milán", "Jugó con Cristiano Ronaldo", "Jugó en el AC Milan"],
    respuestas: [
      [["Christian Eriksen", "Ivan Perisic", "Edgar Davids", "Jurgen Klinsmann", "Robbie Keane"], ["Gareth Bale", "Luka Modric", "Emmanuel Adebayor", "Dejan Kulusevski", "Rodrigo Bentancur"], ["Kevin-Prince Boateng", "Edgar Davids"]],
      [["Wesley Sneijder", "Stefan de Vrij", "Denzel Dumfries", "Clarence Seedorf", "Edgar Davids", "Dennis Bergkamp"], ["Matthijs de Ligt", "Ruud van Nistelrooy", "Edwin van der Sar"], ["Marco van Basten", "Ruud Gullit", "Frank Rijkaard", "Clarence Seedorf", "Nigel de Jong", "Mark van Bommel", "Klaas-Jan Huntelaar", "Urby Emanuelson", "Tijjani Reijnders"]],
      [["Gianluigi Donnarumma"], ["Cristiano Ronaldo", "Ronaldinho"], ["Ronaldinho", "Stephan El Shaarawy", "Gianluigi Donnarumma"]]
    ]
  },
  {
    id: "grid_10", dificultad: "Extremo",
    filas: ["Jugó en la Roma", "Selección: Bélgica", "Ganó la Copa Libertadores"],
    columnas: ["Jugó en el Liverpool", "Jugó en el PSG", "Entrenado por José Mourinho"],
    respuestas: [
      [["Alisson Becker", "Mohamed Salah", "John Arne Riise", "Doni"], ["Marquinhos", "Leandro Paredes", "Jeremy Menez", "Lucas Digne", "Renato Sanches", "Georginio Wijnaldum", "Javier Pastore"], ["Francesco Totti", "Daniele De Rossi", "Lorenzo Pellegrini", "Paulo Dybala", "Tammy Abraham", "Chris Smalling", "Rui Patricio", "Henrikh Mkhitaryan", "Stephan El Shaarawy", "Nicolo Zaniolo"]],
      [["Simon Mignolet", "Divock Origi", "Christian Benteke", "Kevin De Bruyne"], ["Thomas Meunier"], ["Eden Hazard", "Romelu Lukaku", "Thibaut Courtois", "Kevin De Bruyne", "Marouane Fellaini"]],
      [["Lucas Leiva"], ["Ronaldinho"], ["Carlos Tevez", "Lucio"]]
    ]
  }
];

export default GRIDS_PREESTABLECIDOS;
