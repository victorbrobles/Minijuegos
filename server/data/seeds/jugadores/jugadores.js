// server/data/seeds/jugadores/jugadores.seed.js

const PARES_JUGADORES = [
  // --- Cristiano Ronaldo vs Resto del Mundo ---
  ["Cristiano Ronaldo", "Neymar Jr"], // Di María, Keylor Navas, Casemiro, Arthur
  ["Cristiano Ronaldo", "Luis Suárez"], // Arthur Melo
  ["Cristiano Ronaldo", "Zlatan Ibrahimović"], // Ángel Di María, Paul Pogba, Varane
  ["Cristiano Ronaldo", "Sergio Agüero"], // Carlos Tevez, Ángel Di María
  ["Cristiano Ronaldo", "Franck Ribéry"], // Toni Kroos, Xabi Alonso, James Rodríguez
  ["Cristiano Ronaldo", "Robert Lewandowski"], // Toni Kroos, Xabi Alonso, James Rodríguez
  ["Cristiano Ronaldo", "Cesc Fàbregas"], // Álvaro Morata, Gonzalo Higuaín
  ["Cristiano Ronaldo", "Francesco Totti"], // Antonio Cassano, Miralem Pjanić
  ["Cristiano Ronaldo", "Andrea Pirlo"], // Álvaro Morata, Paul Pogba, Carlos Tevez
  ["Cristiano Ronaldo", "Steven Gerrard"], // Xabi Alonso, Michael Owen, Álvaro Arbeloa
  ["Cristiano Ronaldo", "Frank Lampard"], // Ricardo Carvalho, Deco, Tiago
  ["Cristiano Ronaldo", "Thierry Henry"], // Gerard Piqué, Louis Saha
  ["Cristiano Ronaldo", "Eden Hazard"], // Thibaut Courtois, Álvaro Morata
  ["Cristiano Ronaldo", "Manuel Neuer"], // Toni Kroos, Xabi Alonso
  ["Cristiano Ronaldo", "Gianluigi Buffon"], // Álvaro Morata, Paul Pogba, Paulo Dybala
  ["Cristiano Ronaldo", "Erling Haaland"], // Jadon Sancho
  ["Cristiano Ronaldo", "Andrés Iniesta"], // Iker Casillas, Sergio Ramos (Selección)
  ["Cristiano Ronaldo", "Xavi Hernández"], // Iker Casillas, Sergio Ramos (Selección)
  ["Cristiano Ronaldo", "David Villa"], // Álvaro Morata

  // --- Lionel Messi vs Resto del Mundo ---
  ["Lionel Messi", "Wayne Rooney"], // Gerard Piqué, Ángel Di María, Carlos Tevez
  ["Lionel Messi", "Frank Lampard"], // Deco, Cesc Fàbregas, Eidur Gudjohnsen
  ["Lionel Messi", "Didier Drogba"], // Deco, Samuel Eto'o, Cesc Fàbregas
  ["Lionel Messi", "Gianluigi Buffon"], // Dani Alves, Arturo Vidal, Arthur
  ["Lionel Messi", "Manuel Neuer"], // Thiago Alcántara, Arturo Vidal, Coutinho
  ["Lionel Messi", "Alessandro Del Piero"], // Gianluca Zambrotta, Lilian Thuram
  ["Lionel Messi", "Francesco Totti"], // Bojan Krkić, Seydou Keita
  ["Lionel Messi", "Gareth Bale"], // Giovani dos Santos, Paulinho
  ["Lionel Messi", "Eden Hazard"], // Cesc Fàbregas, Thibaut Courtois
  ["Lionel Messi", "Kevin De Bruyne"], // Claudio Bravo, Sergio Agüero, Yaya Touré
  ["Lionel Messi", "Harry Kane"], // Giovani Lo Celso, Clement Lenglet
  ["Lionel Messi", "Bastian Schweinsteiger"], // Thiago Alcántara
  ["Lionel Messi", "Iker Casillas"], // Xavi, Iniesta, Puyol (Selección)
  ["Lionel Messi", "Karim Benzema"], // Antoine Griezmann, Ousmane Dembélé (Selección)
  ["Lionel Messi", "Paul Pogba"], // Arturo Vidal, Ángel Di María
  ["Lionel Messi", "N'Golo Kanté"], // Ousmane Dembélé, Antoine Griezmann (Selección)
  ["Lionel Messi", "Thibaut Courtois"], // Cesc Fàbregas
  ["Lionel Messi", "Marco Reus"], // Ousmane Dembélé, Marc Bartra
  ["Lionel Messi", "Luka Modrić"], // Ivan Rakitić (Selección)

  // --- Neymar Jr vs Resto del Mundo ---
  ["Neymar Jr", "Wayne Rooney"], // Ángel Di María, Ander Herrera
  ["Neymar Jr", "Sergio Agüero"], // Lionel Messi, Ángel Di María
  ["Neymar Jr", "Robert Lewandowski"], // Philippe Coutinho, Juan Bernat
  ["Neymar Jr", "Karim Benzema"], // Keylor Navas, Ángel Di María, Casemiro
  ["Neymar Jr", "Gareth Bale"], // Keylor Navas
  ["Neymar Jr", "Eden Hazard"], // Thibaut Courtois, Thomas Meunier
  ["Neymar Jr", "Kevin De Bruyne"], // Claudio Bravo, Fernandinho
  ["Neymar Jr", "Manuel Neuer"], // Juan Bernat, Eric Maxim Choupo-Moting
  ["Neymar Jr", "Gianluigi Buffon"], // Marquinhos, Thiago Silva, Dani Alves
  ["Neymar Jr", "Zlatan Ibrahimović"], // Thiago Silva, Marquinhos, Maxwell
  ["Neymar Jr", "Antoine Griezmann"], // Lionel Messi, Luis Suárez
  ["Neymar Jr", "Luka Modrić"], // Casemiro, Rodrygo, Vinícius (Selección)
  ["Neymar Jr", "Toni Kroos"], // Casemiro
  ["Neymar Jr", "Thomas Müller"], // Juan Bernat, Coutinho

  // --- Zlatan Ibrahimović vs Resto del Mundo ---
  ["Zlatan Ibrahimović", "Luka Modrić"], // Rafael van der Vaart, Mateo Kovačić
  ["Zlatan Ibrahimović", "Toni Kroos"], // Arturo Vidal
  ["Zlatan Ibrahimović", "Manuel Neuer"], // Thiago Alcántara, Eric Maxim Choupo-Moting
  ["Zlatan Ibrahimović", "Gareth Bale"], // Rafael van der Vaart, Hakan Çalhanoğlu
  ["Zlatan Ibrahimović", "Karim Benzema"], // Paul Pogba, Raphaël Varane
  ["Zlatan Ibrahimović", "Sergio Agüero"], // Ángel Di María, Carlos Tevez
  ["Zlatan Ibrahimović", "Luis Suárez"], // Maxwell, Lionel Messi
  ["Zlatan Ibrahimović", "Neymar Jr"], // Thiago Silva, Marquinhos, Maxwell
  ["Zlatan Ibrahimović", "Eden Hazard"], // Romelu Lukaku
  ["Zlatan Ibrahimović", "Didier Drogba"], // Hernán Crespo, Deco
  ["Zlatan Ibrahimović", "Frank Lampard"], // Deco, Hernán Crespo
  ["Zlatan Ibrahimović", "Steven Gerrard"], // Javier Mascherano, Fernando Torres
  ["Zlatan Ibrahimović", "Iker Casillas"], // Maxwell, Pepe
  ["Zlatan Ibrahimović", "Gianluigi Buffon"], // Lilian Thuram, Patrick Vieira, Pavel Nedved
  ["Zlatan Ibrahimović", "Wayne Rooney"], // (Ojo: jugaron juntos en el United un año, usamos otra dupla)
  ["Zlatan Ibrahimović", "Harry Kane"], // Christian Eriksen
  ["Zlatan Ibrahimović", "Kevin De Bruyne"], // Vincent Kompany, Romelu Lukaku

  // --- Leyendas del Barça vs Leyendas del Madrid (sin coincidir) ---
  ["Carles Puyol", "Pepe"], // Cristiano Ronaldo (con Puyol nunca), Deco (con Pepe en Sel., con Puyol en FCB)
  ["Andrés Iniesta", "Gareth Bale"], // Giovani dos Santos, Luka Modrić
  ["Xavi Hernández", "Karim Benzema"], // Thierry Henry (Sel. Francia), Lassana Diarra
  ["Gerard Piqué", "Luka Modrić"], // Ivan Rakitić
  ["Dani Alves", "Iker Casillas"], // Sergio Ramos (PSG / Sel.)
  ["Sergio Busquets", "Toni Kroos"], // Arturo Vidal, Thiago Alcántara
  ["Jordi Alba", "Marcelo"], // Neymar, Dani Alves (Sel. Brasil / Barça)
  ["David Villa", "Cristiano Ronaldo"], // Álvaro Morata
  ["Samuel Eto'o", "Sergio Ramos"], // Wesley Sneijder
  ["Ronaldinho", "Luka Modrić"], // Rafael van der Vaart, Giovani dos Santos
  ["Deco", "Karim Benzema"], // Cristiano Ronaldo (Sel. Portugal), Lassana Diarra
  ["Javier Mascherano", "Pepe"], // Cristiano Ronaldo (Sel. Portugal), Ángel Di María
  ["Victor Valdés", "Keylor Navas"], // Juan Bernat, Thiago Alcántara
  ["Pedro Rodríguez", "Gareth Bale"], // Thibaut Courtois, Eden Hazard
  ["Ivan Rakitić", "Xabi Alonso"], // Luka Modrić, Per Mertesacker

  // --- Leyendas de la Premier vs Leyendas de La Liga ---
  ["Steven Gerrard", "Andrés Iniesta"], // Javier Mascherano, Luis Suárez, Fernando Torres
  ["Frank Lampard", "Xavi Hernández"], // Deco, Cesc Fàbregas
  ["Paul Scholes", "Xavi Hernández"], // Gerard Piqué
  ["Wayne Rooney", "Andrés Iniesta"], // Gerard Piqué, Ángel Di María
  ["Thierry Henry", "Sergio Ramos"], // Zinedine Zidane, Iker Casillas (Sel. Francia/España)
  ["Didier Drogba", "Carles Puyol"], // Deco, Eidur Gudjohnsen
  ["Sergio Agüero", "Karim Benzema"], // Ángel Di María, Gonzalo Higuaín
  ["Kevin De Bruyne", "Luka Modrić"], // Mateo Kovačić, Ivan Perišić
  ["Eden Hazard", "Andrés Iniesta"], // Cesc Fàbregas, Pedro Rodríguez
  ["Harry Kane", "Gerard Piqué"], // Clement Lenglet, Giovani Lo Celso
  ["Mohamed Salah", "Sergio Ramos"], // Keylor Navas, Fabinho
  ["Virgil van Dijk", "Gerard Piqué"], // Memphis Depay, Georginio Wijnaldum
  ["Vincent Kompany", "Carles Puyol"], // Yaya Touré, Thierry Henry
  ["N'Golo Kanté", "Luka Modrić"], // Mateo Kovačić, Eduardo Camavinga
  ["Rio Ferdinand", "Carles Puyol"], // Gerard Piqué
  ["John Terry", "Sergio Ramos"], // Ricardo Carvalho, Thibaut Courtois
  ["Ashley Cole", "Marcelo"], // Robinho, Willian

  // --- Leyendas de la Serie A vs Resto ---
  ["Francesco Totti", "Xavi Hernández"], // Bojan Krkić, Seydou Keita
  ["Alessandro Del Piero", "Andrés Iniesta"], // Gianluca Zambrotta, Lilian Thuram
  ["Andrea Pirlo", "Luka Modrić"], // Álvaro Morata, Mario Mandžukić
  ["Gianluigi Buffon", "Iker Casillas"], // Fabio Cannavaro, Álvaro Morata
  ["Paolo Maldini", "Carles Puyol"], // Demetrio Albertini, Rivaldo
  ["Javier Zanetti", "Sergio Ramos"], // Wesley Sneijder, Walter Samuel
  ["Kaká", "Xavi Hernández"], // Ronaldinho, Zlatan Ibrahimović
  ["Andriy Shevchenko", "Andrés Iniesta"], // Ronaldinho, Demetrio Albertini
  ["Pavel Nedvěd", "Xavi Hernández"], // Gianluca Zambrotta, Lilian Thuram
  ["Fabio Cannavaro", "Gerard Piqué"], // Ruud van Nistelrooy, Gianluca Zambrotta
  ["Christian Vieri", "Wayne Rooney"], // Juan Sebastián Verón, Laurent Blanc
  ["Filippo Inzaghi", "Thierry Henry"], // Patrick Vieira, Zinedine Zidane
  ["Gennaro Gattuso", "Steven Gerrard"], // Suso, Alberto Aquilani
  ["Clarence Seedorf", "Frank Lampard"], // Andriy Shevchenko, Hernán Crespo
  ["Cafú", "Dani Alves"], // Dida, Kaká, Ronaldinho (Sel. Brasil)

  // --- Generación Moderna vs Clásicos ---
  ["Erling Haaland", "Wayne Rooney"], // Jadon Sancho
  ["Kylian Mbappé", "Thierry Henry"], // Ousmane Dembélé, Olivier Giroud
  ["Jude Bellingham", "Steven Gerrard"], // Jordan Henderson
  ["Vinícius Júnior", "Ronaldinho"], // Marcelo, Casemiro
  ["Pedri", "Xavi Hernández"], // Sergio Busquets, Jordi Alba
  ["Phil Foden", "Paul Scholes"], // Raheem Sterling
  ["Bukayo Saka", "Thierry Henry"], // Pierre-Emerick Aubameyang
  ["Jamal Musiala", "Michael Ballack"], // Thomas Müller, Manuel Neuer
  ["Rafael Leão", "Cristiano Ronaldo"], // Zlatan Ibrahimović, Pepe
  ["Victor Osimhen", "Didier Drogba"], // Kalidou Koulibaly
  ["Khvicha Kvaratskhelia", "Andriy Shevchenko"], // (Díficil, cruzados en Serie A) Tanguy Ndombélé
  ["Gavi", "Andrés Iniesta"], // Sergio Busquets, Jordi Alba
  ["Eduardo Camavinga", "Claude Makélélé"], // Karim Benzema, Raphaël Varane
  ["Lamine Yamal", "David Villa"], // Jordi Alba
  ["Florian Wirtz", "Toni Kroos"], // Antonio Rüdiger, İlkay Gündoğan

  // --- Porteros vs Delanteros ---
  ["Iker Casillas", "Robert Lewandowski"], // Xabi Alonso, Arjen Robben
  ["Manuel Neuer", "Luis Suárez"], // Thiago Alcántara, Arturo Vidal
  ["Gianluigi Buffon", "Sergio Agüero"], // Carlos Tevez, Ángel Di María
  ["Petr Čech", "Karim Benzema"], // Thibaut Courtois, Lassana Diarra
  ["Thibaut Courtois", "Zlatan Ibrahimović"], // Eden Hazard, Romelu Lukaku
  ["Keylor Navas", "Wayne Rooney"], // Ángel Di María, Cristiano Ronaldo
  ["Alisson Becker", "Antoine Griezmann"], // Philippe Coutinho, Fabinho
  ["Ederson", "Harry Kane"], // Kyle Walker, Raheem Sterling
  ["Jan Oblak", "Kylian Mbappé"], // Thomas Lemar, Antoine Griezmann
  ["Hugo Lloris", "Neymar Jr"], // Tanguy Ndombélé, Lucas Moura
  ["David de Gea", "Lionel Messi"], // Ángel Di María, Gerard Piqué
  ["Marc-André ter Stegen", "Cristiano Ronaldo"], // Arthur Melo, Miralem Pjanić

  // --- Defensas vs Delanteros ---
  ["Sergio Ramos", "Robert Lewandowski"], // Toni Kroos, Xabi Alonso, James Rodríguez
  ["Gerard Piqué", "Sergio Agüero"], // Lionel Messi, Gabriel Milito
  ["Virgil van Dijk", "Karim Benzema"], // Georginio Wijnaldum, Memphis Depay
  ["Thiago Silva", "Luis Suárez"], // Marquinhos, Neymar
  ["Giorgio Chiellini", "Neymar Jr"], // Dani Alves, Gianluigi Buffon
  ["Pepe", "Zlatan Ibrahimović"], // Cristiano Ronaldo (Juve), Ángel Di María
  ["Vincent Kompany", "Kylian Mbappé"], // Bernardo Silva, Benjamin Mendy
  ["Carles Puyol", "Wayne Rooney"], // Gerard Piqué, Henrik Larsson
  ["Nemanja Vidić", "Lionel Messi"], // Gerard Piqué, Carlos Tevez
  ["John Terry", "Cristiano Ronaldo"], // Ricardo Carvalho, Deco, Ashley Cole
  ["Rio Ferdinand", "Andrés Iniesta"], // Gerard Piqué
  ["Marcelo", "Mohamed Salah"], // Fabinho, Alisson Becker
  ["Dani Alves", "Harry Kane"], // Giovani dos Santos, Clement Lenglet
  ["Philipp Lahm", "Eden Hazard"], // Kevin De Bruyne, Claudio Pizarro

  // --- Miscelánea de Alta Dificultad (Cruces indirectos) ---
  ["Mario Balotelli", "Karim Benzema"], // Patrick Vieira, Lassana Diarra
  ["Arturo Vidal", "Kevin De Bruyne"], // Claudio Bravo, Kingsley Coman
  ["Cesc Fàbregas", "Luka Modrić"], // Thibaut Courtois, Mateo Kovačić
  ["Ángel Di María", "Gareth Bale"], // Cristiano Ronaldo, Luka Modrić, Pepe
  ["David Silva", "Andrés Iniesta"], // Yaya Touré, Jesús Navas, Nolito
  ["Xabi Alonso", "Toni Kroos"], // Cristiano Ronaldo, Sergio Ramos
  ["Bastian Schweinsteiger", "Xavi Hernández"], // Thiago Alcántara
  ["Thomas Müller", "Sergio Busquets"], // Thiago Alcántara, Arturo Vidal
  ["Wesley Sneijder", "Mesut Özil"], // Hamit Altintop, Klaas-Jan Huntelaar
  ["Juan Román Riquelme", "Andrés Iniesta"], // Diego Forlán, Juan Pablo Sorín
  ["Diego Forlán", "Wayne Rooney"], // Cristiano Ronaldo, Ruud van Nistelrooy
  ["Edinson Cavani", "Sergio Agüero"], // Ángel Di María, Ezequiel Lavezzi
  ["Radamel Falcao", "Luis Suárez"], // Diego Costa, Miranda
  ["Gonzalo Higuaín", "Robert Lewandowski"], // Xabi Alonso, Arturo Vidal
  ["Mario Mandžukić", "Karim Benzema"], // Luka Modrić, Sami Khedira
  ["Pierre-Emerick Aubameyang", "Zlatan Ibrahimović"], // Ousmane Dembélé, Henrikh Mkhitaryan
  ["Alexis Sánchez", "Neymar Jr"], // Lionel Messi, Dani Alves
  ["Coutinho", "Luka Modrić"], // Ivan Rakitić, Mateo Kovačić
  ["James Rodríguez", "Kevin De Bruyne"], // Radamel Falcao, João Moutinho
  ["Isco", "Andrés Iniesta"], // Santi Cazorla, Joaquín
  ["Marco Verratti", "Xavi Hernández"], // Lionel Messi, Neymar
  ["Miralem Pjanić", "Sergio Busquets"], // Dani Alves, Arthur
  ["Casemiro", "N'Golo Kanté"], // Raphaël Varane, Eden Hazard
  ["Fabinho", "Toni Kroos"], // Casemiro, Marcelo
  ["Jorginho", "Xabi Alonso"], // Gonzalo Higuaín, José Callejón
  ["Ivan Rakitić", "Toni Kroos"], // Luka Modrić, Manuel Neuer
  ["Paul Pogba", "Kevin De Bruyne"], // Romelu Lukaku, Arturo Vidal
  ["Naby Keïta", "İlkay Gündoğan"], // Sadio Mané, Dayot Upamecano
  ["Bruno Fernandes", "David Silva"], // Bernardo Silva, João Cancelo
  ["Christian Eriksen", "Mesut Özil"], // Jan Vertonghen, Toby Alderweireld
  ["Dele Alli", "Cesc Fàbregas"], // Hugo Lloris, Son Heung-min
  ["Raheem Sterling", "Gareth Bale"], // Joe Hart, Kyle Walker
  ["Riyad Mahrez", "Eden Hazard"], // N'Golo Kanté, Kevin De Bruyne
  ["Heung-min Son", "Karim Benzema"], // Hugo Lloris, Gareth Bale
  ["Leroy Sané", "Andrés Iniesta"], // Thiago Alcántara, Arturo Vidal
  ["Serge Gnabry", "Ousmane Dembélé"], // Robert Lewandowski, Pierre-Emerick Aubameyang
  ["Kingsley Coman", "Kylian Mbappé"], // Paul Pogba, Antoine Griezmann
  ["Marcus Rashford", "Harry Kane"], // Wayne Rooney, Raheem Sterling
  ["Ousmane Dembélé", "Eden Hazard"], // Thibaut Courtois, Pierre-Emerick Aubameyang
  ["Jadon Sancho", "Bukayo Saka"], // Jude Bellingham, Harry Kane
  ["João Félix", "Vinícius Júnior"], // Álvaro Morata, Marcos Llorente
  ["Lautaro Martínez", "Paulo Dybala"], // Lionel Messi, Mauro Icardi
  ["Romelu Lukaku", "Karim Benzema"], // Eden Hazard, Thibaut Courtois
  ["Dusan Vlahovic", "Federico Chiesa"], // Álvaro Morata, Cristiano Ronaldo
  ["Alphonso Davies", "Trent Alexander-Arnold"], // Sadio Mané, Thiago Alcántara
  ["Achraf Hakimi", "Reece James"], // Thiago Silva, Hakim Ziyech
  ["Theo Hernández", "Andrew Robertson"], // Olivier Giroud, Brahim Díaz
  ["Ruben Dias", "Virgil van Dijk"], // Bernardo Silva, Diogo Jota
  ["Marquinhos", "Eder Militão"], // Thiago Silva, Neymar
  ["Dayot Upamecano", "Ibrahima Konaté"], // Naby Keïta, Marcel Sabitzer
  ["Matthijs de Ligt", "Ronald Araújo"], // Frenkie de Jong, Memphis Depay
  ["Alessandro Bastoni", "Jules Koundé"], // Milan Škriniar, Ivan Perišić
  ["Milan Škriniar", "Presnel Kimpembe"], // Marquinhos, Achraf Hakimi
  ["David Alaba", "Jordi Alba"], // Toni Kroos, Thiago Alcántara
  ["Antonio Rüdiger", "Aymeric Laporte"], // Eden Hazard, Kepa Arrizabalaga
  ["Kalidou Koulibaly", "Raphaël Varane"], // Edouard Mendy, N'Golo Kanté
  ["Wojciech Szczęsny", "David de Gea"], // Cristiano Ronaldo, Paul Pogba
  ["Gianluigi Donnarumma", "Alisson Becker"], // Marquinhos, Thiago Silva
  ["Edouard Mendy", "Emiliano Martínez"], // N'Golo Kanté, Thiago Silva
  ["Mike Maignan", "Hugo Lloris"], // Olivier Giroud, Theo Hernández
  ["Aaron Ramsdale", "Jordan Pickford"], // Bukayo Saka, Declan Rice

  // --- Leyendas y Retirados (Cruces inesperados) ---
  ["Ronaldo Nazário", "Thierry Henry"], // Zinedine Zidane, Lilian Thuram
  ["Zinedine Zidane", "Ronaldinho"], // Ronaldo Nazário, Claude Makélélé
  ["Luis Figo", "Ryan Giggs"], // Cristiano Ronaldo, Carlos Tevez
  ["David Beckham", "Pavel Nedvěd"], // Zinedine Zidane, Fabio Cannavaro
  ["Rivaldo", "Dennis Bergkamp"], // Patrick Kluivert, Marc Overmars
  ["Gabriel Batistuta", "Alan Shearer"], // (Difícil) Hernán Crespo
  ["George Weah", "Hristo Stoichkov"], // Roberto Baggio, Demetrio Albertini
  ["Michael Owen", "Alessandro Del Piero"], // Jonathan Woodgate, Ian Rush
  ["Roberto Baggio", "Eric Cantona"], // Laurent Blanc, Didier Deschamps
  ["Romário", "Jürgen Klinsmann"], // Ronaldo Nazário, Lothar Matthäus
  ["Bebeto", "Davor Šuker"], // Roberto Carlos, Mauro Silva
  ["Ruud Gullit", "Gary Lineker"], // Franco Baresi, Paul Gascoigne
  ["Marco van Basten", "Ian Rush"], // Frank Rijkaard, Carlo Ancelotti
  ["Lothar Matthäus", "Paul Gascoigne"], // Jürgen Klinsmann, Andreas Brehme
  ["Hristo Stoichkov", "Roy Keane"], // (Dificil) Henrik Larsson
  ["Michael Laudrup", "Peter Schmeichel"], // Brian Laudrup, Romário
  ["Fernando Hierro", "Tony Adams"], // Steve McManaman, Nicolas Anelka
  ["Franco Baresi", "Ronald Koeman"], // Ruud Gullit, Marco van Basten
  ["Paolo Maldini", "Gary Neville"], // David Beckham, Jaap Stam
  ["Marcel Desailly", "Tony Adams"], // Emmanuel Petit, Patrick Vieira
  ["Lilian Thuram", "Sol Campbell"], // Patrick Vieira, Thierry Henry
  ["Cafú", "Javier Zanetti"], // Ronaldo Nazário, Roberto Carlos
  ["Roberto Carlos", "Ashley Cole"], // Nicolas Anelka, Claude Makélélé
  ["Javier Zanetti", "Gary Neville"], // Juan Sebastián Verón, Paul Ince
  ["Oliver Kahn", "Peter Schmeichel"], // (Difícil) Brian Laudrup
  ["Edwin van der Sar", "Fabien Barthez"], // Ruud van Nistelrooy, Laurent Blanc
  ["Dino Zoff", "Gordon Banks"], // (Históricos - muy difícil)
  ["Sepp Maier", "Lev Yashin"], // (Históricos - muy difícil)

  // --- Combinaciones Adicionales Modernas y Clásicas ---
  ["João Moutinho", "Ivan Rakitić"], // Radamel Falcao, James Rodríguez
  ["Xherdan Shaqiri", "Pedro Rodríguez"], // Thiago Alcántara, Cesc Fàbregas
  ["Julian Draxler", "Isco"], // Raúl González, Jesé Rodríguez
  ["Mario Götze", "Oscar"], // Robert Lewandowski, André Schürrle
  ["Lucas Moura", "Willian"], // Marquinhos, Thiago Silva
  ["Javier Pastore", "Juan Mata"], // Zlatan Ibrahimović, Edinson Cavani
  ["Hatem Ben Arfa", "Santi Cazorla"], // Samir Nasri, Yohan Cabaye
  ["Yohan Cabaye", "Mikel Arteta"], // Mathieu Debuchy, Moussa Sissoko
  ["Blaise Matuidi", "Nemanja Matić"], // Zlatan Ibrahimović, Paul Pogba
  ["Sami Khedira", "Ramires"], // Mesut Özil, Cristiano Ronaldo
  ["Nigel de Jong", "Michael Essien"], // Wesley Sneijder, Rafael van der Vaart
  ["Felipe Melo", "Alexandre Song"], // Diego Ribas, Wesley Sneijder
  ["Jérémy Toulalan", "Lassana Diarra"], // Hugo Lloris, Karim Benzema
  ["Marcos Senna", "Gareth Barry"], // Santi Cazorla, Joan Capdevila
  ["Daniele De Rossi", "Michael Carrick"], // Francesco Totti, Antonio Cassano
  ["Esteban Cambiasso", "Owen Hargreaves"], // Javier Zanetti, Diego Milito
  ["Gennaro Gattuso", "Roy Keane"], // Jaap Stam, Andrea Pirlo
  ["Edgar Davids", "Claude Makélélé"], // Zinedine Zidane, Alessandro Del Piero
  ["Patrick Vieira", "Roy Keane"], // Zlatan Ibrahimović, Nicolas Anelka
  ["Claude Makélélé", "Paul Scholes"], // Zinedine Zidane, Ruud van Nistelrooy
  ["Gareth Bale", "Arjen Robben"], // Xabi Alonso, Luka Modrić
  ["Angel Di Maria", "Franck Ribery"], // Toni Kroos, Xabi Alonso
  ["David Silva", "Mesut Ozil"], // Leroy Sané, İlkay Gündoğan
  ["Sergio Aguero", "Luis Suarez"], // Lionel Messi, Javier Mascherano
  ["Raheem Sterling", "Ousmane Dembele"], // Pierre-Emerick Aubameyang, İlkay Gündoğan
  ["Sadio Mane", "Son Heung-min"], // Roberto Firmino, Hugo Lloris
  ["Romelu Lukaku", "Harry Kane"], // Christian Eriksen, Jan Vertonghen
  ["Paulo Dybala", "Antoine Griezmann"], // Cristiano Ronaldo, Álvaro Morata
  ["Ciro Immobile", "Jamie Vardy"], // Luis Alberto, Pedro
  ["Aubameyang", "Icardi"], // Ivan Perišić, Ousmane Dembélé
  ["Edin Dzeko", "Radamel Falcao"], // Miralem Pjanić, Sergio Agüero
  ["Olivier Giroud", "Gonzalo Higuain"], // Mesut Özil, Alexis Sánchez
  ["Mario Mandzukic", "Diego Costa"], // Luka Modrić, Arda Turan
  ["Alvaro Morata", "Roberto Firmino"], // Cristiano Ronaldo, Fabinho
  ["Timo Werner", "Diogo Jota"], // Antonio Rüdiger, Kai Havertz
  ["Gabriel Jesus", "Roberto Firmino"], // Kevin De Bruyne, Fernandinho
  ["Richarlison", "Antony"], // Neymar, Casemiro
  ["Raphinha", "Vinicius Junior"], // Neymar, Casemiro
  ["Lucas Paqueta", "Bruno Guimaraes"], // Neymar, Casemiro
  ["Rodrygo", "Gabriel Martinelli"], // Casemiro, Vinícius Júnior
  ["Pedri", "Jude Bellingham"], // Ferran Torres, Joselu
  ["Gavi", "Jamal Musiala"], // Robert Lewandowski, İlkay Gündoğan
  ["Eduardo Camavinga", "Ryan Gravenberch"], // Aurélien Tchouaméni, Karim Benzema
  ["Aurelien Tchouameni", "Declan Rice"], // Karim Benzema, Bukayo Saka
  ["Frenkie de Jong", "Martin Odegaard"], // Memphis Depay, Matthijs de Ligt
  ["Federico Valverde", "Phil Foden"], // Casemiro, Rodri
  ["Sandro Tonali", "Nicolo Barella"], // Gianluigi Donnarumma, Federico Chiesa
  ["Enzo Fernandez", "Alexis Mac Allister"], // Lionel Messi, Julián Álvarez
  ["Moises Caicedo", "Romeo Lavia"], // Pervis Estupiñán, Marc Cucurella
  ["Kvaratskhelia", "Leao"], // Victor Osimhen, Olivier Giroud
  ["Osimhen", "Vlahovic"], // Piotr Zieliński, Federico Chiesa
  ["Isak", "Darwin Nunez"], // Martin Ødegaard, Bruno Guimarães
  ["Kolo Muani", "Goncalo Ramos"], // Kylian Mbappé, Ousmane Dembélé
  ["Julian Alvarez", "Lautaro Martinez"], // Lionel Messi, Enzo Fernández
  ["Beto", "Dominic Calvert-Lewin"], // Abdoulaye Doucouré, Dwight McNeil
  ["Evan Ferguson", "Danny Welbeck"], // Pascal Groß, Lewis Dunk
  ["Ollie Watkins", "Callum Wilson"], // Jack Grealish, Tyrone Mings
  ["Alexander Isak", "Callum Wilson"], // Bruno Guimarães, Miguel Almirón
  ["Rasmus Hojlund", "Joshua Zirkzee"], // Bruno Fernandes, Marcus Rashford
  ["Viktor Gyokeres", "Pedro Goncalves"], // Marcus Edwards, Ousmane Diomande
  ["Santiago Gimenez", "Luuk de Jong"], // Orkun Kökçü, Hirving Lozano
  ["Vangelis Pavlidis", "Chuba Akpom"], // Steven Bergwijn, Dusan Tadic
  ["Brian Brobbey", "Steven Bergwijn"], // Dusan Tadic, Mohammed Kudus
  ["Lois Openda", "Benjamin Sesko"], // Xavi Simons, Dani Olmo
  ["Serhou Guirassy", "Deniz Undav"], // Chris Führich, Waldemar Anton
  ["Victor Boniface", "Patrik Schick"], // Florian Wirtz, Granit Xhaka
  ["Harry Kane", "Mathys Tel"], // Thomas Müller, Leroy Sané
  ["Niclas Fullkrug", "Sebastien Haller"], // Marco Reus, Julian Brandt
  ["Ermedin Demirovic", "Mergim Berisha"], // Ruben Vargas, Arne Maier
  ["Omar Marmoush", "Hugo Ekitike"], // Mario Götze, Kevin Trapp
  ["Marcus Thuram", "Marko Arnautovic"], // Lautaro Martínez, Hakan Çalhanoğlu
  ["Olivier Giroud", "Luka Jovic"], // Rafael Leão, Christian Pulisic
  ["Arkadiusz Milik", "Moise Kean"], // Dušan Vlahović, Federico Chiesa
  ["Ademola Lookman", "Gianluca Scamacca"], // Teun Koopmeiners, Charles De Ketelaere
  ["Mbala Nzola", "Lucas Beltran"], // Nicolás González, Arthur Melo
  ["Joshua Zirkzee", "Sydney van Hooijdonk"], // Lewis Ferguson, Riccardo Orsolini
  ["Albert Gudmundsson", "Mateo Retegui"], // Ruslan Malinovskyi, Kevin Strootman
  ["Andrea Pinamonti", "Gregoire Defrel"], // Domenico Berardi, Armand Laurienté
  ["Milan Djuric", "Lorenzo Colombo"], // Matteo Pessina, Andrea Colpani
  ["M'Bala Nzola", "M'Baye Niang"], // (Empoli)
  ["Robert Lewandowski", "Vitor Roque"], // İlkay Gündoğan, Raphinha
  ["Alvaro Morata", "Memphis Depay"], // Antoine Griezmann, Koke
  ["Joselu", "Brahim Diaz"], // Jude Bellingham, Vinícius Júnior
  ["Artem Dovbyk", "Cristhian Stuani"], // Sávio, Aleix García
  ["Gorka Guruzeta", "Iñaki Williams"], // Oihan Sancet, Nico Williams
  ["Alexander Sorloth", "Gerard Moreno"], // Álex Baena, Dani Parejo
  ["Mikel Oyarzabal", "Umar Sadiq"], // Takefusa Kubo, Martín Zubimendi
  ["Borja Mayoral", "Juanmi Latasa"], // Mason Greenwood, Nemanja Maksimović
  ["Hugo Duro", "Roman Yaremchuk"], // Javi Guerra, José Gayà
  ["Willian Jose", "Ayoze Perez"], // Nabil Fekir, Isco
  ["Youssef En-Nesyri", "Isaac Romero"], // Lucas Ocampos, Jesús Navas
  ["Vedat Muriqi", "Abdon Prats"], // Sergi Darder, Dani Rodríguez
  ["Jonathan Bamba", "Iago Aspas"], // Jørgen Strand Larsen, Fran Beltrán
  ["Ante Budimir", "Raul Garcia de Haro"], // Aimar Oroz, Jon Moncayola
  ["Samu Omorodion", "Kike Garcia"], // Luis Rioja, Jon Guridi
  ["Chris Ramos", "Roger Marti"], // Ruben Alcaraz, Ivan Alejo
  ["Largie Ramazani", "Leo Baptistao"], // Sergio Arribas, Lucas Robertone
  ["Myrto Uzuni", "Lucas Boye"], // Bryan Zaragoza, Gonzalo Villar
  ["Sandro Ramirez", "Munir El Haddadi"], // Kirian Rodríguez, Alberto Moleiro
  ["Sergio Camello", "Radamel Falcao"], // Isi Palazón, Álvaro García
  ["Jonathan Viera", "Marc Cardona"] // Kirian Rodríguez, Alberto Moleiro
];

export default PARES_JUGADORES.map((pares, index) => ({
  id: `jug_${index + 1}`,
  jugador1: pares[0],
  jugador2: pares[1]
}));