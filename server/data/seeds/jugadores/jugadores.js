// server/data/seeds/jugadores/jugadores.seed.js

const PARES_JUGADORES = [
  ["Sergio Ramos", "Robert Lewandowski"], // Toni Kroos, Xabi Alonso, James Rodríguez
  ["Paul Scholes", "Xavi Hernández"], // Gerard Piqué
  ["Giorgio Chiellini", "Neymar Jr"], // Dani Alves, Gianluigi Buffon
  ["Bastian Schweinsteiger", "Xavi Hernández"], // Thiago Alcántara
  ["Gianluigi Buffon", "Iker Casillas"], // Fabio Cannavaro, Álvaro Morata
  ["Jude Bellingham", "Steven Gerrard"], // Jordan Henderson
  ["Francesco Totti", "Xavi Hernández"], // Bojan Krkić, Seydou Keita
  ["Ángel Di María", "Gareth Bale"], // Cristiano Ronaldo, Luka Modrić, Pepe
  ["David Silva", "Andrés Iniesta"], // Yaya Touré, Jesús Navas, Nolito
  ["Gerard Piqué", "Sergio Agüero"], // Lionel Messi, Gabriel Milito
  ["Xavi Hernández", "Karim Benzema"], // Thierry Henry (Sel. Francia), Lassana Diarra
  ["Steven Gerrard", "Andrés Iniesta"], // Javier Mascherano, Luis Suárez, Fernando Torres
  ["Cesc Fàbregas", "Luka Modrić"], // Thibaut Courtois, Mateo Kovačić
  ["Andrés Iniesta", "Gareth Bale"], // Giovani dos Santos, Luka Modrić
  ["Pedri", "Xavi Hernández"], // Sergio Busquets, Jordi Alba
  ["Cristiano Ronaldo", "Sergio Agüero"], // Carlos Tevez, Ángel Di María
  ["Romelu Lukaku", "Harry Kane"], // Christian Eriksen, Jan Vertonghen
  ["Alessandro Del Piero", "Andrés Iniesta"], // Gianluca Zambrotta, Lilian Thuram
  ["Gabriel Batistuta", "Alan Shearer"], // Hernán Crespo
  ["Sergio Aguero", "Luis Suarez"], // Lionel Messi, Javier Mascherano
  ["Alisson Becker", "Antoine Griezmann"], // Philippe Coutinho, Fabinho
  ["Keylor Navas", "Wayne Rooney"], // Ángel Di María, Cristiano Ronaldo
  ["Pepe", "Zlatan Ibrahimović"], // Cristiano Ronaldo (Juve), Ángel Di María
  ["Lionel Messi", "Wayne Rooney"], // Gerard Piqué, Ángel Di María, Carlos Tevez
  ["Aubameyang", "Icardi"], // Ivan Perišić, Ousmane Dembélé
  ["Lionel Messi", "Gianluigi Buffon"], // Dani Alves, Arturo Vidal, Arthur
  ["Cristiano Ronaldo", "Franck Ribéry"], // Toni Kroos, Xabi Alonso, James Rodríguez
  ["Andrea Pirlo", "Luka Modrić"], // Álvaro Morata, Mario Mandžukić
  ["Neymar Jr", "Karim Benzema"], // Keylor Navas, Ángel Di María, Casemiro
  ["Olivier Giroud", "Gonzalo Higuain"], // Mesut Özil, Alexis Sánchez
  ["Petr Čech", "Karim Benzema"], // Thibaut Courtois, Lassana Diarra
  ["Cristiano Ronaldo", "Luis Suárez"], // Arthur Melo
  ["João Moutinho", "Ivan Rakitić"], // Radamel Falcao, James Rodríguez
  ["Lucas Moura", "Willian"], // Marquinhos, Thiago Silva
  ["Edin Dzeko", "Radamel Falcao"], // Miralem Pjanić, Sergio Agüero
  ["Paulo Dybala", "Antoine Griezmann"], // Cristiano Ronaldo, Álvaro Morata
  ["Rivaldo", "Dennis Bergkamp"], // Patrick Kluivert, Marc Overmars
  ["Ronaldo Nazário", "Thierry Henry"], // Zinedine Zidane, Lilian Thuram
  ["Gianluigi Buffon", "Sergio Agüero"], // Carlos Tevez, Ángel Di María
  ["Raheem Sterling", "Ousmane Dembele"], // Pierre-Emerick Aubameyang, İlkay Gündoğan
  ["Julian Draxler", "Isco"], // Raúl González, Jesé Rodríguez
  ["Manuel Neuer", "Luis Suárez"], // Thiago Alcántara, Arturo Vidal
  ["Thibaut Courtois", "Zlatan Ibrahimović"], // Eden Hazard, Romelu Lukaku
  ["Lionel Messi", "Frank Lampard"], // Deco, Cesc Fàbregas, Eidur Gudjohnsen
  ["Sadio Mane", "Son Heung-min"], // Roberto Firmino, Hugo Lloris
  ["Xherdan Shaqiri", "Pedro Rodríguez"], // Thiago Alcántara, Cesc Fàbregas
  ["Lionel Messi", "Didier Drogba"], // Deco, Samuel Eto'o, Cesc Fàbregas
  ["Dani Alves", "Iker Casillas"], // Sergio Ramos (PSG / Sel.)
  ["Mario Mandzukic", "Diego Costa"], // Luka Modrić, Arda Turan
  ["Thierry Henry", "Sergio Ramos"], // Zinedine Zidane, Iker Casillas (Sel. Francia/España)
  ["Lionel Messi", "Manuel Neuer"], // Thiago Alcántara, Arturo Vidal, Coutinho
  ["Kylian Mbappé", "Thierry Henry"], // Ousmane Dembélé, Olivier Giroud
  ["George Weah", "Hristo Stoichkov"], // Roberto Baggio, Demetrio Albertini
  ["Javier Zanetti", "Sergio Ramos"], // Wesley Sneijder, Walter Samuel
  ["Jordi Alba", "Marcelo"], // Neymar, Dani Alves (Sel. Brasil / Barça)
  ["Xabi Alonso", "Toni Kroos"], // Cristiano Ronaldo, Sergio Ramos
  ["Zlatan Ibrahimović", "Gareth Bale"], // Rafael van der Vaart, Hakan Çalhanoğlu
  ["Paolo Maldini", "Carles Puyol"], // Demetrio Albertini, Rivaldo
  ["Ciro Immobile", "Jamie Vardy"], // Luis Alberto, Pedro
  ["Mario Balotelli", "Karim Benzema"], // Patrick Vieira, Lassana Diarra
  ["Neymar Jr", "Sergio Agüero"], // Lionel Messi, Ángel Di María
  ["Vincent Kompany", "Kylian Mbappé"], // Bernardo Silva, Benjamin Mendy
  ["Didier Drogba", "Carles Puyol"], // Deco, Eidur Gudjohnsen
  ["Erling Haaland", "Wayne Rooney"], // Jadon Sancho
  ["Lionel Messi", "Francesco Totti"], // Bojan Krkić, Seydou Keita
  ["Vinícius Júnior", "Ronaldinho"], // Marcelo, Casemiro
  ["Cristiano Ronaldo", "Robert Lewandowski"], // Toni Kroos, Xabi Alonso, James Rodríguez
  ["Luis Figo", "Ryan Giggs"], // Cristiano Ronaldo, Carlos Tevez
  ["Iker Casillas", "Robert Lewandowski"], // Xabi Alonso, Arjen Robben
  ["Hatem Ben Arfa", "Santi Cazorla"], // Samir Nasri, Yohan Cabaye
  ["Sergio Agüero", "Karim Benzema"], // Ángel Di María, Gonzalo Higuaín
  ["Carles Puyol", "Pepe"], // Cristiano Ronaldo (con Puyol nunca), Deco (con Pepe en Sel., con Puyol en FCB)
  ["Mario Götze", "Oscar"], // Robert Lewandowski, André Schürrle
  ["Phil Foden", "Paul Scholes"], // Raheem Sterling
  ["Cristiano Ronaldo", "Zlatan Ibrahimović"], // Ángel Di María, Paul Pogba, Varane
  ["Lionel Messi", "Alessandro Del Piero"], // Gianluca Zambrotta, Lilian Thuram
  ["Neymar Jr", "Eden Hazard"], // Thibaut Courtois, Thomas Meunier
  ["Zlatan Ibrahimović", "Toni Kroos"], // Arturo Vidal
  ["Neymar Jr", "Wayne Rooney"], // Ángel Di María, Ander Herrera
  ["Zlatan Ibrahimović", "Karim Benzema"], // Paul Pogba, Raphaël Varane
  ["Neymar Jr", "Robert Lewandowski"], // Philippe Coutinho, Juan Bernat
  ["Bukayo Saka", "Thierry Henry"], // Pierre-Emerick Aubameyang
  ["Neymar Jr", "Kevin De Bruyne"], // Claudio Bravo, Fernandinho
  ["Gerard Piqué", "Luka Modrić"], // Ivan Rakitić
  ["Neymar Jr", "Gareth Bale"], // Keylor Navas
  ["Zlatan Ibrahimović", "Luka Modrić"], // Rafael van der Vaart, Mateo Kovačić
  ["Zinedine Zidane", "Ronaldinho"], // Ronaldo Nazário, Claude Makélélé
  ["Zlatan Ibrahimović", "Manuel Neuer"], // Thiago Alcántara, Eric Maxim Choupo-Moting
  ["Kaká", "Xavi Hernández"], // Ronaldinho, Zlatan Ibrahimović
  ["Thiago Silva", "Luis Suárez"], // Marquinhos, Neymar
  ["Wayne Rooney", "Andrés Iniesta"], // Gerard Piqué, Ángel Di María
  ["Javier Pastore", "Juan Mata"], // Zlatan Ibrahimović, Edinson Cavani
  ["Cristiano Ronaldo", "Neymar Jr"], // Di María, Keylor Navas, Casemiro, Arthur
  ["Sergio Busquets", "Toni Kroos"], // Arturo Vidal, Thiago Alcántara
  ["Zlatan Ibrahimović", "Sergio Agüero"], // Ángel Di María, Carlos Tevez
  ["Virgil van Dijk", "Karim Benzema"], // Georginio Wijnaldum, Memphis Depay
  ["Cristiano Ronaldo", "Cesc Fàbregas"], // Álvaro Morata, Gonzalo Higuaín
  ["Frank Lampard", "Xavi Hernández"], // Deco, Cesc Fàbregas
  ["David Beckham", "Pavel Nedvěd"], // Zinedine Zidane, Fabio Cannavaro
  ["Arturo Vidal", "Kevin De Bruyne"], // Claudio Bravo, Kingsley Coman
];

export default PARES_JUGADORES.map((pares, index) => ({
  id: `jug_${index + 1}`,
  jugador1: pares[0],
  jugador2: pares[1]
}));