// server/data/seeds/oncefantasma/onces2.js
// «El Once Fantasma» · ampliación: más finales y partidos históricos con los DOS onces titulares.
// Mismo formato que onces.js: [nombre, alias, posición, dorsal, dato, pista]; `dato` es el club (selecciones) o el
// país (clubes). En cada línea, de IZQUIERDA a DERECHA vistos desde la portería propia (lateral izquierdo primero).

const J = (nombre, alias, pos, dorsal, dato, pista) => ({ nombre, alias, pos, dorsal, dato, pista });
const O = (equipo, entrenador, tipo, jugadores) => ({ equipo, entrenador, tipo, jugadores });

export default [
  { id: 'champions2017', partido: 'Final de la Champions 2017 · Real Madrid 4-1 Juventus', onces: [
    O('Real Madrid', 'Zinedine Zidane', 'club', [
      J('Keylor Navas', ['keylor', 'navas'], 'POR', 1, 'Costa Rica', 'Portero costarricense.'),
      J('Marcelo', ['marcelo'], 'DEF', 12, 'Brasil', 'Lateral izquierdo brasileño.'),
      J('Sergio Ramos', ['ramos'], 'DEF', 4, 'España', 'El capitán.'),
      J('Raphaël Varane', ['varane'], 'DEF', 5, 'Francia', 'Central francés.'),
      J('Dani Carvajal', ['carvajal'], 'DEF', 2, 'España', 'Lateral derecho canterano.'),
      J('Toni Kroos', ['kroos'], 'MED', 8, 'Alemania', 'Centrocampista alemán.'),
      J('Casemiro', ['casemiro'], 'MED', 14, 'Brasil', 'Marcó el 2-1 con un disparo desviado.'),
      J('Luka Modrić', ['modric'], 'MED', 19, 'Croacia', 'Dio la asistencia del 3-1.'),
      J('Isco', ['isco', 'isco alarcon'], 'MED', 22, 'España', 'Mediapunta malagueño.'),
      J('Karim Benzema', ['benzema'], 'DEL', 9, 'Francia', 'Delantero francés.'),
      J('Cristiano Ronaldo', ['cristiano', 'ronaldo', 'cr7'], 'DEL', 7, 'Portugal', 'Marcó dos goles.')
    ]),
    O('Juventus', 'Massimiliano Allegri', 'club', [
      J('Gianluigi Buffon', ['buffon'], 'POR', 1, 'Italia', 'Capitán; buscaba su primera Champions.'),
      J('Giorgio Chiellini', ['chiellini'], 'DEF', 3, 'Italia', 'Central zurdo.'),
      J('Leonardo Bonucci', ['bonucci'], 'DEF', 19, 'Italia', 'Central con gran salida de balón.'),
      J('Andrea Barzagli', ['barzagli'], 'DEF', 15, 'Italia', 'Central veterano.'),
      J('Alex Sandro', ['alex sandro', 'sandro'], 'DEF', 12, 'Brasil', 'Lateral izquierdo brasileño.'),
      J('Miralem Pjanić', ['pjanic'], 'MED', 5, 'Bosnia', 'Centrocampista bosnio; luego jugó en el Barça.'),
      J('Sami Khedira', ['khedira'], 'MED', 6, 'Alemania', 'Exjugador del Real Madrid.'),
      J('Dani Alves', ['alves', 'dani alves'], 'MED', 23, 'Brasil', 'Exjugador del Barça; jugó de carrilero.'),
      J('Mario Mandžukić', ['mandzukic'], 'DEL', 17, 'Croacia', 'Marcó un golazo de chilena.'),
      J('Paulo Dybala', ['dybala'], 'DEL', 21, 'Argentina', 'Mediapunta argentino.'),
      J('Gonzalo Higuaín', ['higuain', 'pipita'], 'DEL', 9, 'Argentina', 'Exjugador del Real Madrid.')
    ])
  ] },
  { id: 'champions2018', partido: 'Final de la Champions 2018 · Real Madrid 3-1 Liverpool', onces: [
    O('Real Madrid', 'Zinedine Zidane', 'club', [
      J('Keylor Navas', ['keylor', 'navas'], 'POR', 1, 'Costa Rica', 'Portero costarricense.'),
      J('Marcelo', ['marcelo'], 'DEF', 12, 'Brasil', 'Lateral izquierdo brasileño.'),
      J('Sergio Ramos', ['ramos'], 'DEF', 4, 'España', 'El capitán; chocó con Salah.'),
      J('Raphaël Varane', ['varane'], 'DEF', 5, 'Francia', 'Central francés; ese verano ganó el Mundial.'),
      J('Dani Carvajal', ['carvajal'], 'DEF', 2, 'España', 'Se lesionó en la primera parte.'),
      J('Toni Kroos', ['kroos'], 'MED', 8, 'Alemania', 'Centrocampista alemán.'),
      J('Casemiro', ['casemiro'], 'MED', 14, 'Brasil', 'Mediocentro brasileño.'),
      J('Luka Modrić', ['modric'], 'MED', 10, 'Croacia', 'Ese año ganó el Balón de Oro.'),
      J('Isco', ['isco', 'isco alarcon'], 'MED', 22, 'España', 'Mediapunta malagueño.'),
      J('Karim Benzema', ['benzema'], 'DEL', 9, 'Francia', 'Marcó el 1-0 tras un error del portero.'),
      J('Cristiano Ronaldo', ['cristiano', 'ronaldo', 'cr7'], 'DEL', 7, 'Portugal', 'Su último partido con el club.')
    ]),
    O('Liverpool', 'Jürgen Klopp', 'club', [
      J('Loris Karius', ['karius'], 'POR', 1, 'Alemania', 'Portero alemán; cometió dos errores.'),
      J('Andrew Robertson', ['robertson'], 'DEF', 26, 'Escocia', 'Lateral izquierdo escocés.'),
      J('Virgil van Dijk', ['van dijk', 'dijk'], 'DEF', 4, 'Países Bajos', 'Fichado en enero desde el Southampton.'),
      J('Dejan Lovren', ['lovren'], 'DEF', 6, 'Croacia', 'Central croata.'),
      J('Trent Alexander-Arnold', ['alexander arnold', 'trent', 'arnold'], 'DEF', 66, 'Inglaterra', 'Lateral derecho canterano.'),
      J('Georginio Wijnaldum', ['wijnaldum'], 'MED', 5, 'Países Bajos', 'Centrocampista neerlandés.'),
      J('Jordan Henderson', ['henderson'], 'MED', 14, 'Inglaterra', 'El capitán.'),
      J('James Milner', ['milner'], 'MED', 7, 'Inglaterra', 'Batió el récord de asistencias en una Champions.'),
      J('Sadio Mané', ['mane'], 'DEL', 19, 'Senegal', 'Marcó el gol del Liverpool.'),
      J('Roberto Firmino', ['firmino'], 'DEL', 9, 'Brasil', 'Delantero brasileño.'),
      J('Mohamed Salah', ['salah'], 'DEL', 11, 'Egipto', 'Se lesionó el hombro en la primera parte.')
    ])
  ] },
  { id: 'champions2022', partido: 'Final de la Champions 2022 · Real Madrid 1-0 Liverpool', onces: [
    O('Real Madrid', 'Carlo Ancelotti', 'club', [
      J('Thibaut Courtois', ['courtois'], 'POR', 1, 'Bélgica', 'Fue el mejor de la final.'),
      J('Ferland Mendy', ['mendy', 'ferland'], 'DEF', 23, 'Francia', 'Lateral izquierdo francés.'),
      J('David Alaba', ['alaba'], 'DEF', 4, 'Austria', 'Central austriaco que llegó del Bayern.'),
      J('Éder Militão', ['militao'], 'DEF', 3, 'Brasil', 'Central brasileño.'),
      J('Dani Carvajal', ['carvajal'], 'DEF', 2, 'España', 'Lateral derecho canterano.'),
      J('Toni Kroos', ['kroos'], 'MED', 8, 'Alemania', 'Centrocampista alemán.'),
      J('Casemiro', ['casemiro'], 'MED', 14, 'Brasil', 'Su último gran partido con el club.'),
      J('Luka Modrić', ['modric'], 'MED', 10, 'Croacia', 'Centrocampista croata.'),
      J('Vinícius Júnior', ['vinicius', 'vini'], 'DEL', 20, 'Brasil', 'Marcó el gol de la final.'),
      J('Karim Benzema', ['benzema'], 'DEL', 9, 'Francia', 'Ese año ganó el Balón de Oro.'),
      J('Federico Valverde', ['valverde', 'fede'], 'DEL', 15, 'Uruguay', 'Dio la asistencia del gol.')
    ]),
    O('Liverpool', 'Jürgen Klopp', 'club', [
      J('Alisson Becker', ['alisson'], 'POR', 1, 'Brasil', 'Portero brasileño.'),
      J('Andrew Robertson', ['robertson'], 'DEF', 26, 'Escocia', 'Lateral izquierdo escocés.'),
      J('Virgil van Dijk', ['van dijk', 'dijk'], 'DEF', 4, 'Países Bajos', 'Central neerlandés.'),
      J('Ibrahima Konaté', ['konate'], 'DEF', 5, 'Francia', 'Central francés.'),
      J('Trent Alexander-Arnold', ['alexander arnold', 'trent', 'arnold'], 'DEF', 66, 'Inglaterra', 'Lateral derecho canterano.'),
      J('Thiago Alcântara', ['thiago', 'thiago alcantara'], 'MED', 6, 'España', 'Centrocampista formado en el Barça.'),
      J('Fabinho', ['fabinho'], 'MED', 3, 'Brasil', 'Mediocentro brasileño.'),
      J('Jordan Henderson', ['henderson'], 'MED', 14, 'Inglaterra', 'El capitán.'),
      J('Luis Díaz', ['luis diaz', 'lucho'], 'DEL', 23, 'Colombia', 'Extremo colombiano fichado en enero.'),
      J('Sadio Mané', ['mane'], 'DEL', 10, 'Senegal', 'Su último partido con el club.'),
      J('Mohamed Salah', ['salah'], 'DEL', 11, 'Egipto', 'Buscaba la revancha de 2018.')
    ])
  ] },
  { id: 'champions2024', partido: 'Final de la Champions 2024 · Real Madrid 2-0 Borussia Dortmund', onces: [
    O('Real Madrid', 'Carlo Ancelotti', 'club', [
      J('Thibaut Courtois', ['courtois'], 'POR', 1, 'Bélgica', 'Volvía de una lesión larga.'),
      J('Ferland Mendy', ['mendy', 'ferland'], 'DEF', 23, 'Francia', 'Lateral izquierdo francés.'),
      J('Nacho Fernández', ['nacho'], 'DEF', 6, 'España', 'El capitán; su último partido con el club.'),
      J('Antonio Rüdiger', ['rudiger'], 'DEF', 22, 'Alemania', 'Central alemán.'),
      J('Dani Carvajal', ['carvajal'], 'DEF', 2, 'España', 'Marcó el 1-0 de cabeza.'),
      J('Eduardo Camavinga', ['camavinga'], 'MED', 12, 'Francia', 'Centrocampista francés.'),
      J('Toni Kroos', ['kroos'], 'MED', 8, 'Alemania', 'Su último partido de clubes.'),
      J('Federico Valverde', ['valverde', 'fede'], 'MED', 15, 'Uruguay', 'Centrocampista uruguayo.'),
      J('Jude Bellingham', ['bellingham', 'jude'], 'MED', 5, 'Inglaterra', 'Exjugador del rival.'),
      J('Vinícius Júnior', ['vinicius', 'vini'], 'DEL', 7, 'Brasil', 'Marcó el 2-0.'),
      J('Rodrygo', ['rodrygo'], 'DEL', 11, 'Brasil', 'Delantero brasileño.')
    ]),
    O('Borussia Dortmund', 'Edin Terzić', 'club', [
      J('Gregor Kobel', ['kobel'], 'POR', 1, 'Suiza', 'Portero suizo.'),
      J('Ian Maatsen', ['maatsen'], 'DEF', 22, 'Países Bajos', 'Lateral izquierdo cedido por el Chelsea.'),
      J('Nico Schlotterbeck', ['schlotterbeck'], 'DEF', 4, 'Alemania', 'Central zurdo alemán.'),
      J('Mats Hummels', ['hummels'], 'DEF', 15, 'Alemania', 'Central veterano campeón del mundo.'),
      J('Julian Ryerson', ['ryerson'], 'DEF', 26, 'Noruega', 'Lateral derecho noruego.'),
      J('Emre Can', ['can', 'emre can'], 'MED', 23, 'Alemania', 'El capitán.'),
      J('Marcel Sabitzer', ['sabitzer'], 'MED', 20, 'Austria', 'Centrocampista austriaco.'),
      J('Karim Adeyemi', ['adeyemi'], 'DEL', 27, 'Alemania', 'Se quedó solo ante Courtois y no marcó.'),
      J('Julian Brandt', ['brandt'], 'DEL', 19, 'Alemania', 'Mediapunta alemán.'),
      J('Jadon Sancho', ['sancho'], 'DEL', 10, 'Inglaterra', 'Cedido por el Manchester United.'),
      J('Niclas Füllkrug', ['fullkrug'], 'DEL', 14, 'Alemania', 'Estrelló un balón en el palo.')
    ])
  ] },
  { id: 'champions2021', partido: 'Final de la Champions 2021 · Chelsea 1-0 Manchester City', onces: [
    O('Chelsea', 'Thomas Tuchel', 'club', [
      J('Édouard Mendy', ['mendy', 'edouard'], 'POR', 16, 'Senegal', 'Portero senegalés.'),
      J('Antonio Rüdiger', ['rudiger'], 'DEF', 2, 'Alemania', 'Central alemán.'),
      J('Thiago Silva', ['thiago silva'], 'DEF', 6, 'Brasil', 'Central veterano; se lesionó en la primera parte.'),
      J('César Azpilicueta', ['azpilicueta', 'azpi'], 'DEF', 28, 'España', 'El capitán navarro.'),
      J('Ben Chilwell', ['chilwell'], 'MED', 21, 'Inglaterra', 'Carrilero izquierdo.'),
      J('Jorginho', ['jorginho'], 'MED', 5, 'Italia', 'Ese verano ganó también la Eurocopa.'),
      J("N'Golo Kanté", ['kante'], 'MED', 7, 'Francia', 'Fue el mejor de la final.'),
      J('Reece James', ['james', 'reece'], 'MED', 24, 'Inglaterra', 'Carrilero derecho canterano.'),
      J('Mason Mount', ['mount'], 'DEL', 19, 'Inglaterra', 'Dio la asistencia del gol.'),
      J('Timo Werner', ['werner'], 'DEL', 11, 'Alemania', 'Delantero alemán.'),
      J('Kai Havertz', ['havertz'], 'DEL', 29, 'Alemania', 'Marcó el gol de la final.')
    ]),
    O('Manchester City', 'Pep Guardiola', 'club', [
      J('Ederson', ['ederson'], 'POR', 31, 'Brasil', 'Portero brasileño.'),
      J('Oleksandr Zinchenko', ['zinchenko'], 'DEF', 11, 'Ucrania', 'Lateral izquierdo ucraniano.'),
      J('Rúben Dias', ['ruben dias', 'dias'], 'DEF', 3, 'Portugal', 'Central portugués.'),
      J('John Stones', ['stones'], 'DEF', 5, 'Inglaterra', 'Central inglés.'),
      J('Kyle Walker', ['walker'], 'DEF', 2, 'Inglaterra', 'Lateral derecho inglés.'),
      J('İlkay Gündoğan', ['gundogan'], 'MED', 8, 'Alemania', 'Jugó de mediocentro.'),
      J('Bernardo Silva', ['bernardo'], 'MED', 20, 'Portugal', 'Centrocampista portugués.'),
      J('Raheem Sterling', ['sterling'], 'DEL', 7, 'Inglaterra', 'Extremo inglés.'),
      J('Kevin De Bruyne', ['de bruyne', 'kdb'], 'DEL', 17, 'Bélgica', 'Se retiró lesionado tras un choque con Rüdiger.'),
      J('Phil Foden', ['foden'], 'DEL', 47, 'Inglaterra', 'Canterano inglés.'),
      J('Riyad Mahrez', ['mahrez'], 'DEL', 26, 'Argelia', 'Extremo argelino.')
    ])
  ] },
  { id: 'champions2023', partido: 'Final de la Champions 2023 · Manchester City 1-0 Inter', onces: [
    O('Manchester City', 'Pep Guardiola', 'club', [
      J('Ederson', ['ederson'], 'POR', 31, 'Brasil', 'Portero brasileño.'),
      J('Nathan Aké', ['ake'], 'DEF', 6, 'Países Bajos', 'Central zurdo neerlandés.'),
      J('Rúben Dias', ['ruben dias', 'dias'], 'DEF', 3, 'Portugal', 'Central portugués.'),
      J('Manuel Akanji', ['akanji'], 'DEF', 25, 'Suiza', 'Central suizo.'),
      J('John Stones', ['stones'], 'MED', 5, 'Inglaterra', 'Central que se incorporaba al centro del campo.'),
      J('Rodri', ['rodri', 'rodrigo hernandez'], 'MED', 16, 'España', 'Marcó el gol de la final.'),
      J('Jack Grealish', ['grealish'], 'MED', 10, 'Inglaterra', 'Extremo inglés.'),
      J('İlkay Gündoğan', ['gundogan'], 'MED', 8, 'Alemania', 'El capitán; luego fichó por el Barça.'),
      J('Kevin De Bruyne', ['de bruyne', 'kdb'], 'MED', 17, 'Bélgica', 'Se lesionó en la primera parte.'),
      J('Bernardo Silva', ['bernardo'], 'MED', 20, 'Portugal', 'Dio la asistencia del gol.'),
      J('Erling Haaland', ['haaland'], 'DEL', 9, 'Noruega', 'En su primera temporada batió el récord de la Premier.')
    ]),
    O('Inter', 'Simone Inzaghi', 'club', [
      J('André Onana', ['onana'], 'POR', 24, 'Camerún', 'Portero camerunés.'),
      J('Alessandro Bastoni', ['bastoni'], 'DEF', 95, 'Italia', 'Central zurdo con el 95.'),
      J('Francesco Acerbi', ['acerbi'], 'DEF', 15, 'Italia', 'Central veterano.'),
      J('Matteo Darmian', ['darmian'], 'DEF', 36, 'Italia', 'Defensa italiano.'),
      J('Federico Dimarco', ['dimarco'], 'MED', 32, 'Italia', 'Carrilero izquierdo; estrelló un cabezazo en el larguero.'),
      J('Hakan Çalhanoğlu', ['calhanoglu'], 'MED', 20, 'Turquía', 'Exjugador del Milan.'),
      J('Marcelo Brozović', ['brozovic'], 'MED', 77, 'Croacia', 'Mediocentro croata con el 77.'),
      J('Nicolò Barella', ['barella'], 'MED', 23, 'Italia', 'Centrocampista italiano.'),
      J('Denzel Dumfries', ['dumfries'], 'MED', 2, 'Países Bajos', 'Carrilero derecho neerlandés.'),
      J('Lautaro Martínez', ['lautaro'], 'DEL', 10, 'Argentina', 'Campeón del mundo seis meses antes.'),
      J('Edin Džeko', ['dzeko'], 'DEL', 9, 'Bosnia', 'Delantero bosnio veterano.')
    ])
  ] },
  { id: 'champions2020', partido: 'Final de la Champions 2020 · Bayern 1-0 PSG', onces: [
    O('Bayern de Múnich', 'Hansi Flick', 'club', [
      J('Manuel Neuer', ['neuer'], 'POR', 1, 'Alemania', 'El capitán.'),
      J('Alphonso Davies', ['davies'], 'DEF', 19, 'Canadá', 'Lateral izquierdo canadiense.'),
      J('David Alaba', ['alaba'], 'DEF', 27, 'Austria', 'Jugaba de central.'),
      J('Jérôme Boateng', ['boateng'], 'DEF', 17, 'Alemania', 'Se lesionó en la primera parte.'),
      J('Joshua Kimmich', ['kimmich'], 'DEF', 32, 'Alemania', 'Lateral derecho; dio la asistencia del gol.'),
      J('Leon Goretzka', ['goretzka'], 'MED', 18, 'Alemania', 'Centrocampista alemán.'),
      J('Thiago Alcântara', ['thiago', 'thiago alcantara'], 'MED', 6, 'España', 'Su último partido con el club.'),
      J('Kingsley Coman', ['coman'], 'DEL', 29, 'Francia', 'Formado en el rival; marcó el gol.'),
      J('Thomas Müller', ['muller'], 'DEL', 25, 'Alemania', 'Mediapunta alemán.'),
      J('Serge Gnabry', ['gnabry'], 'DEL', 22, 'Alemania', 'Extremo alemán.'),
      J('Robert Lewandowski', ['lewandowski', 'lewy'], 'DEL', 9, 'Polonia', 'Máximo goleador del torneo.')
    ]),
    O('PSG', 'Thomas Tuchel', 'club', [
      J('Keylor Navas', ['keylor', 'navas'], 'POR', 1, 'Costa Rica', 'Exportero del Real Madrid.'),
      J('Juan Bernat', ['bernat'], 'DEF', 14, 'España', 'Lateral izquierdo valenciano.'),
      J('Presnel Kimpembe', ['kimpembe'], 'DEF', 3, 'Francia', 'Central canterano.'),
      J('Thiago Silva', ['thiago silva'], 'DEF', 2, 'Brasil', 'El capitán; su último partido con el club.'),
      J('Thilo Kehrer', ['kehrer'], 'DEF', 4, 'Alemania', 'Lateral derecho alemán.'),
      J('Leandro Paredes', ['paredes'], 'MED', 8, 'Argentina', 'Mediocentro argentino.'),
      J('Marquinhos', ['marquinhos'], 'MED', 5, 'Brasil', 'Central que jugó en el centro del campo.'),
      J('Ander Herrera', ['herrera', 'ander'], 'MED', 21, 'España', 'Centrocampista vasco.'),
      J('Neymar', ['neymar'], 'DEL', 10, 'Brasil', 'Exjugador del Barça.'),
      J('Kylian Mbappé', ['mbappe'], 'DEL', 7, 'Francia', 'Delantero francés.'),
      J('Ángel Di María', ['di maria', 'fideo'], 'DEL', 11, 'Argentina', 'Exjugador del Real Madrid.')
    ])
  ] },
  { id: 'champions2013', partido: 'Final de la Champions 2013 · Bayern 2-1 Borussia Dortmund', onces: [
    O('Bayern de Múnich', 'Jupp Heynckes', 'club', [
      J('Manuel Neuer', ['neuer'], 'POR', 1, 'Alemania', 'Portero alemán.'),
      J('David Alaba', ['alaba'], 'DEF', 27, 'Austria', 'Lateral izquierdo austriaco.'),
      J('Dante', ['dante'], 'DEF', 4, 'Brasil', 'Central brasileño.'),
      J('Jérôme Boateng', ['boateng'], 'DEF', 17, 'Alemania', 'Central alemán.'),
      J('Philipp Lahm', ['lahm'], 'DEF', 21, 'Alemania', 'El capitán.'),
      J('Bastian Schweinsteiger', ['schweinsteiger'], 'MED', 31, 'Alemania', 'Centrocampista alemán.'),
      J('Javi Martínez', ['javi martinez'], 'MED', 8, 'España', 'Fichado del Athletic.'),
      J('Franck Ribéry', ['ribery'], 'MED', 7, 'Francia', 'Extremo francés; dio la asistencia del 2-1.'),
      J('Thomas Müller', ['muller'], 'MED', 25, 'Alemania', 'Mediapunta alemán.'),
      J('Arjen Robben', ['robben'], 'MED', 10, 'Países Bajos', 'Marcó el gol de la victoria en el 89.'),
      J('Mario Mandžukić', ['mandzukic'], 'DEL', 9, 'Croacia', 'Marcó el 1-0.')
    ]),
    O('Borussia Dortmund', 'Jürgen Klopp', 'club', [
      J('Roman Weidenfeller', ['weidenfeller'], 'POR', 1, 'Alemania', 'Portero veterano.'),
      J('Marcel Schmelzer', ['schmelzer'], 'DEF', 29, 'Alemania', 'Lateral izquierdo.'),
      J('Mats Hummels', ['hummels'], 'DEF', 15, 'Alemania', 'Central alemán.'),
      J('Neven Subotić', ['subotic'], 'DEF', 4, 'Serbia', 'Central serbio; salvó un gol sobre la línea.'),
      J('Łukasz Piszczek', ['piszczek'], 'DEF', 26, 'Polonia', 'Lateral derecho polaco.'),
      J('Sven Bender', ['bender'], 'MED', 6, 'Alemania', 'Mediocentro alemán.'),
      J('İlkay Gündoğan', ['gundogan'], 'MED', 8, 'Alemania', 'Marcó el empate de penalti.'),
      J('Kevin Großkreutz', ['grosskreutz'], 'MED', 19, 'Alemania', 'Extremo nacido en Dortmund.'),
      J('Marco Reus', ['reus'], 'MED', 11, 'Alemania', 'Mediapunta alemán.'),
      J('Jakub Błaszczykowski', ['blaszczykowski', 'kuba'], 'MED', 16, 'Polonia', 'Extremo polaco.'),
      J('Robert Lewandowski', ['lewandowski', 'lewy'], 'DEL', 9, 'Polonia', 'Al año siguiente fichó por el rival.')
    ])
  ] },
  { id: 'champions2012', partido: 'Final de la Champions 2012 · Bayern 1-1 Chelsea (penaltis)', onces: [
    O('Bayern de Múnich', 'Jupp Heynckes', 'club', [
      J('Manuel Neuer', ['neuer'], 'POR', 1, 'Alemania', 'Marcó un penalti en la tanda.'),
      J('Diego Contento', ['contento'], 'DEF', 26, 'Alemania', 'Lateral izquierdo.'),
      J('Anatoliy Tymoshchuk', ['tymoshchuk'], 'DEF', 44, 'Ucrania', 'Mediocentro que jugó de central.'),
      J('Jérôme Boateng', ['boateng'], 'DEF', 17, 'Alemania', 'Central alemán.'),
      J('Philipp Lahm', ['lahm'], 'DEF', 21, 'Alemania', 'El capitán.'),
      J('Bastian Schweinsteiger', ['schweinsteiger'], 'MED', 31, 'Alemania', 'Falló el último penalti del Bayern.'),
      J('Toni Kroos', ['kroos'], 'MED', 39, 'Alemania', 'Jugaba con el dorsal 39.'),
      J('Franck Ribéry', ['ribery'], 'MED', 7, 'Francia', 'Extremo francés.'),
      J('Thomas Müller', ['muller'], 'MED', 25, 'Alemania', 'Marcó de cabeza el 1-0.'),
      J('Arjen Robben', ['robben'], 'MED', 10, 'Países Bajos', 'Falló un penalti en la prórroga.'),
      J('Mario Gómez', ['gomez', 'mario gomez'], 'DEL', 33, 'Alemania', 'Delantero alemán.')
    ]),
    O('Chelsea', 'Roberto Di Matteo', 'club', [
      J('Petr Čech', ['cech'], 'POR', 1, 'República Checa', 'Paró un penalti a Robben en la prórroga.'),
      J('Ashley Cole', ['cole', 'ashley cole'], 'DEF', 3, 'Inglaterra', 'Lateral izquierdo inglés.'),
      J('David Luiz', ['david luiz'], 'DEF', 4, 'Brasil', 'Central brasileño.'),
      J('Gary Cahill', ['cahill'], 'DEF', 24, 'Inglaterra', 'Central inglés.'),
      J('José Bosingwa', ['bosingwa'], 'DEF', 17, 'Portugal', 'Lateral derecho portugués.'),
      J('Ryan Bertrand', ['bertrand'], 'MED', 34, 'Inglaterra', 'Debutó en Champions en la final.'),
      J('Frank Lampard', ['lampard'], 'MED', 8, 'Inglaterra', 'Capitán ese día.'),
      J('John Obi Mikel', ['mikel', 'obi mikel'], 'MED', 12, 'Nigeria', 'Mediocentro nigeriano.'),
      J('Salomon Kalou', ['kalou'], 'MED', 21, 'Costa de Marfil', 'Extremo marfileño.'),
      J('Juan Mata', ['mata'], 'MED', 10, 'España', 'Falló el primer penalti del Chelsea.'),
      J('Didier Drogba', ['drogba'], 'DEL', 11, 'Costa de Marfil', 'Empató en el 88 y marcó el penalti decisivo.')
    ])
  ] },
  { id: 'champions2010', partido: 'Final de la Champions 2010 · Inter 2-0 Bayern', onces: [
    O('Inter', 'José Mourinho', 'club', [
      J('Júlio César', ['julio cesar'], 'POR', 12, 'Brasil', 'Portero brasileño.'),
      J('Cristian Chivu', ['chivu'], 'DEF', 26, 'Rumanía', 'Lateral izquierdo con casco protector.'),
      J('Walter Samuel', ['samuel'], 'DEF', 25, 'Argentina', 'Central argentino; jugó en el Real Madrid.'),
      J('Lúcio', ['lucio'], 'DEF', 6, 'Brasil', 'Exjugador del rival.'),
      J('Maicon', ['maicon'], 'DEF', 13, 'Brasil', 'Lateral derecho brasileño.'),
      J('Esteban Cambiasso', ['cambiasso'], 'MED', 19, 'Argentina', 'Exjugador del Real Madrid.'),
      J('Javier Zanetti', ['zanetti', 'pupi'], 'MED', 4, 'Argentina', 'El capitán.'),
      J('Goran Pandev', ['pandev'], 'MED', 27, 'Macedonia del Norte', 'Llegó en enero desde la Lazio.'),
      J('Wesley Sneijder', ['sneijder'], 'MED', 10, 'Países Bajos', 'Dio la asistencia del 1-0.'),
      J("Samuel Eto'o", ['etoo', 'eto o'], 'MED', 9, 'Camerún', 'Ganaba su segundo triplete seguido.'),
      J('Diego Milito', ['milito', 'principe'], 'DEL', 22, 'Argentina', 'Marcó los dos goles.')
    ]),
    O('Bayern de Múnich', 'Louis van Gaal', 'club', [
      J('Hans-Jörg Butt', ['butt'], 'POR', 22, 'Alemania', 'Portero veterano que tiraba penaltis.'),
      J('Holger Badstuber', ['badstuber'], 'DEF', 28, 'Alemania', 'Lateral izquierdo joven.'),
      J('Martín Demichelis', ['demichelis'], 'DEF', 6, 'Argentina', 'Central argentino.'),
      J('Daniel Van Buyten', ['van buyten'], 'DEF', 5, 'Bélgica', 'Central belga.'),
      J('Philipp Lahm', ['lahm'], 'DEF', 21, 'Alemania', 'Lateral derecho alemán.'),
      J('Bastian Schweinsteiger', ['schweinsteiger'], 'MED', 31, 'Alemania', 'Centrocampista alemán.'),
      J('Mark van Bommel', ['van bommel'], 'MED', 17, 'Países Bajos', 'El capitán; exjugador del Barça.'),
      J('Hamit Altıntop', ['altintop'], 'MED', 8, 'Turquía', 'Centrocampista turco.'),
      J('Thomas Müller', ['muller'], 'MED', 25, 'Alemania', 'Ese verano fue Bota de Oro del Mundial.'),
      J('Arjen Robben', ['robben'], 'MED', 10, 'Países Bajos', 'Exjugador del Real Madrid.'),
      J('Ivica Olić', ['olic'], 'DEL', 11, 'Croacia', 'Delantero croata.')
    ])
  ] },
  { id: 'champions2008', partido: 'Final de la Champions 2008 · Manchester United 1-1 Chelsea (penaltis)', onces: [
    O('Manchester United', 'Alex Ferguson', 'club', [
      J('Edwin van der Sar', ['van der sar'], 'POR', 1, 'Países Bajos', 'Paró el penalti de Anelka.'),
      J('Patrice Evra', ['evra'], 'DEF', 3, 'Francia', 'Lateral izquierdo francés.'),
      J('Nemanja Vidić', ['vidic'], 'DEF', 15, 'Serbia', 'Central serbio.'),
      J('Rio Ferdinand', ['ferdinand'], 'DEF', 5, 'Inglaterra', 'Capitán ese día.'),
      J('Wes Brown', ['brown'], 'DEF', 6, 'Inglaterra', 'Lateral derecho; dio la asistencia del gol.'),
      J('Michael Carrick', ['carrick'], 'MED', 16, 'Inglaterra', 'Centrocampista inglés.'),
      J('Paul Scholes', ['scholes'], 'MED', 18, 'Inglaterra', 'Se había perdido la final de 1999 por sanción.'),
      J('Owen Hargreaves', ['hargreaves'], 'MED', 4, 'Inglaterra', 'Centrocampista nacido en Canadá.'),
      J('Cristiano Ronaldo', ['cristiano', 'ronaldo', 'cr7'], 'DEL', 7, 'Portugal', 'Marcó de cabeza y falló en la tanda.'),
      J('Wayne Rooney', ['rooney'], 'DEL', 10, 'Inglaterra', 'Delantero inglés.'),
      J('Carlos Tevez', ['tevez'], 'DEL', 32, 'Argentina', 'Delantero argentino.')
    ]),
    O('Chelsea', 'Avram Grant', 'club', [
      J('Petr Čech', ['cech'], 'POR', 1, 'República Checa', 'Portero con casco.'),
      J('Ashley Cole', ['cole', 'ashley cole'], 'DEF', 3, 'Inglaterra', 'Lateral izquierdo inglés.'),
      J('John Terry', ['terry'], 'DEF', 26, 'Inglaterra', 'Resbaló al tirar el penalti decisivo.'),
      J('Ricardo Carvalho', ['carvalho'], 'DEF', 6, 'Portugal', 'Central portugués.'),
      J('Michael Essien', ['essien'], 'DEF', 5, 'Ghana', 'Centrocampista que jugó de lateral derecho.'),
      J('Claude Makélélé', ['makelele'], 'MED', 4, 'Francia', 'Exjugador del Real Madrid.'),
      J('Michael Ballack', ['ballack'], 'MED', 13, 'Alemania', 'Capitán de Alemania.'),
      J('Frank Lampard', ['lampard'], 'MED', 8, 'Inglaterra', 'Marcó el empate días después de perder a su madre.'),
      J('Florent Malouda', ['malouda'], 'DEL', 15, 'Francia', 'Extremo francés.'),
      J('Didier Drogba', ['drogba'], 'DEL', 11, 'Costa de Marfil', 'Expulsado en la prórroga.'),
      J('Joe Cole', ['joe cole'], 'DEL', 10, 'Inglaterra', 'Mediapunta inglés.')
    ])
  ] },
  { id: 'champions2007', partido: 'Final de la Champions 2007 · Milan 2-1 Liverpool', onces: [
    O('Milan', 'Carlo Ancelotti', 'club', [
      J('Dida', ['dida'], 'POR', 1, 'Brasil', 'Portero brasileño.'),
      J('Marek Jankulovski', ['jankulovski'], 'DEF', 18, 'República Checa', 'Lateral izquierdo checo.'),
      J('Paolo Maldini', ['maldini'], 'DEF', 3, 'Italia', 'El capitán; su último título europeo.'),
      J('Alessandro Nesta', ['nesta'], 'DEF', 13, 'Italia', 'Central italiano.'),
      J('Massimo Oddo', ['oddo'], 'DEF', 44, 'Italia', 'Lateral derecho; campeón del mundo en 2006.'),
      J('Massimo Ambrosini', ['ambrosini'], 'MED', 23, 'Italia', 'Centrocampista italiano.'),
      J('Andrea Pirlo', ['pirlo'], 'MED', 21, 'Italia', 'Su falta, desviada, fue el 1-0.'),
      J('Gennaro Gattuso', ['gattuso'], 'MED', 8, 'Italia', 'Centrocampista combativo.'),
      J('Clarence Seedorf', ['seedorf'], 'MED', 10, 'Países Bajos', 'Ganó la Champions con tres clubes.'),
      J('Kaká', ['kaka'], 'MED', 22, 'Brasil', 'Ese año ganó el Balón de Oro.'),
      J('Filippo Inzaghi', ['inzaghi', 'pippo'], 'DEL', 9, 'Italia', 'Marcó los dos goles.')
    ]),
    O('Liverpool', 'Rafa Benítez', 'club', [
      J('Pepe Reina', ['reina'], 'POR', 25, 'España', 'Portero madrileño.'),
      J('John Arne Riise', ['riise'], 'DEF', 6, 'Noruega', 'Lateral izquierdo noruego.'),
      J('Daniel Agger', ['agger'], 'DEF', 5, 'Dinamarca', 'Central danés.'),
      J('Jamie Carragher', ['carragher'], 'DEF', 23, 'Inglaterra', 'Central de la casa.'),
      J('Steve Finnan', ['finnan'], 'DEF', 3, 'Irlanda', 'Lateral derecho irlandés.'),
      J('Boudewijn Zenden', ['zenden'], 'MED', 32, 'Países Bajos', 'Exjugador del Barça.'),
      J('Xabi Alonso', ['xabi', 'alonso'], 'MED', 14, 'España', 'Centrocampista vasco.'),
      J('Javier Mascherano', ['mascherano'], 'MED', 20, 'Argentina', 'Mediocentro argentino.'),
      J('Jermaine Pennant', ['pennant'], 'MED', 16, 'Inglaterra', 'Extremo derecho.'),
      J('Steven Gerrard', ['gerrard'], 'MED', 8, 'Inglaterra', 'El capitán.'),
      J('Dirk Kuyt', ['kuyt'], 'DEL', 18, 'Países Bajos', 'Marcó el gol del Liverpool.')
    ])
  ] },
  { id: 'champions2025', partido: 'Final de la Champions 2025 · PSG 5-0 Inter', onces: [
    O('PSG', 'Luis Enrique', 'club', [
      J('Gianluigi Donnarumma', ['donnarumma'], 'POR', 1, 'Italia', 'Portero italiano.'),
      J('Nuno Mendes', ['nuno mendes'], 'DEF', 25, 'Portugal', 'Lateral izquierdo portugués.'),
      J('Willian Pacho', ['pacho'], 'DEF', 51, 'Ecuador', 'Central ecuatoriano con el 51.'),
      J('Marquinhos', ['marquinhos'], 'DEF', 5, 'Brasil', 'El capitán.'),
      J('Achraf Hakimi', ['hakimi'], 'DEF', 2, 'Marruecos', 'Exjugador del rival; marcó el 1-0.'),
      J('Fabián Ruiz', ['fabian', 'fabian ruiz'], 'MED', 8, 'España', 'Centrocampista sevillano.'),
      J('Vitinha', ['vitinha'], 'MED', 17, 'Portugal', 'Mediocentro portugués.'),
      J('João Neves', ['joao neves'], 'MED', 87, 'Portugal', 'Centrocampista portugués con el 87.'),
      J('Khvicha Kvaratskhelia', ['kvaratskhelia', 'kvara'], 'DEL', 7, 'Georgia', 'Llegó en enero desde el Nápoles; marcó el 4-0.'),
      J('Ousmane Dembélé', ['dembele'], 'DEL', 10, 'Francia', 'Ese año ganó el Balón de Oro.'),
      J('Désiré Doué', ['doue'], 'DEL', 14, 'Francia', 'Marcó dos goles con 19 años.')
    ]),
    O('Inter', 'Simone Inzaghi', 'club', [
      J('Yann Sommer', ['sommer'], 'POR', 1, 'Suiza', 'Portero suizo.'),
      J('Alessandro Bastoni', ['bastoni'], 'DEF', 95, 'Italia', 'Central zurdo con el 95.'),
      J('Francesco Acerbi', ['acerbi'], 'DEF', 15, 'Italia', 'Central veterano.'),
      J('Benjamin Pavard', ['pavard'], 'DEF', 28, 'Francia', 'Central campeón del mundo en 2018.'),
      J('Federico Dimarco', ['dimarco'], 'MED', 32, 'Italia', 'Carrilero izquierdo.'),
      J('Henrikh Mkhitaryan', ['mkhitaryan'], 'MED', 22, 'Armenia', 'Centrocampista armenio.'),
      J('Hakan Çalhanoğlu', ['calhanoglu'], 'MED', 20, 'Turquía', 'Mediocentro turco.'),
      J('Nicolò Barella', ['barella'], 'MED', 23, 'Italia', 'Centrocampista italiano.'),
      J('Denzel Dumfries', ['dumfries'], 'MED', 2, 'Países Bajos', 'Carrilero derecho neerlandés.'),
      J('Marcus Thuram', ['thuram'], 'DEL', 9, 'Francia', 'Hijo de un campeón del mundo.'),
      J('Lautaro Martínez', ['lautaro'], 'DEL', 10, 'Argentina', 'El capitán.')
    ])
  ] },
  { id: 'mundial2018', partido: 'Final del Mundial 2018 · Francia 4-2 Croacia', onces: [
    O('Francia', 'Didier Deschamps', 'seleccion', [
      J('Hugo Lloris', ['lloris'], 'POR', 1, 'Tottenham', 'El capitán; regaló un gol con un error.'),
      J('Lucas Hernández', ['lucas', 'lucas hernandez'], 'DEF', 21, 'Atlético de Madrid', 'Lateral izquierdo nacido en Marsella.'),
      J('Samuel Umtiti', ['umtiti'], 'DEF', 5, 'Barcelona', 'Central del Barça.'),
      J('Raphaël Varane', ['varane'], 'DEF', 4, 'Real Madrid', 'Central del Real Madrid.'),
      J('Benjamin Pavard', ['pavard'], 'DEF', 2, 'Stuttgart', 'Lateral derecho; marcó un golazo a Argentina.'),
      J('Paul Pogba', ['pogba'], 'MED', 6, 'Manchester United', 'Marcó el 3-1.'),
      J("N'Golo Kanté", ['kante'], 'MED', 13, 'Chelsea', 'Mediocentro incansable.'),
      J('Blaise Matuidi', ['matuidi'], 'MED', 14, 'Juventus', 'Interior izquierdo.'),
      J('Antoine Griezmann', ['griezmann'], 'MED', 7, 'Atlético de Madrid', 'Marcó de penalti el 2-1.'),
      J('Kylian Mbappé', ['mbappe'], 'DEL', 10, 'PSG', 'Marcó el 4-1 con 19 años.'),
      J('Olivier Giroud', ['giroud'], 'DEL', 9, 'Chelsea', 'No marcó ni un gol en todo el Mundial.')
    ]),
    O('Croacia', 'Zlatko Dalić', 'seleccion', [
      J('Danijel Subašić', ['subasic'], 'POR', 23, 'Mónaco', 'Paró tres penaltis contra Dinamarca.'),
      J('Ivan Strinić', ['strinic'], 'DEF', 3, 'Sampdoria', 'Lateral izquierdo.'),
      J('Domagoj Vida', ['vida'], 'DEF', 21, 'Beşiktaş', 'Central que jugaba en Turquía.'),
      J('Dejan Lovren', ['lovren'], 'DEF', 6, 'Liverpool', 'Central del Liverpool.'),
      J('Šime Vrsaljko', ['vrsaljko'], 'DEF', 2, 'Atlético de Madrid', 'Lateral derecho del Atlético.'),
      J('Marcelo Brozović', ['brozovic'], 'MED', 11, 'Inter', 'Mediocentro del Inter.'),
      J('Ivan Rakitić', ['rakitic'], 'MED', 7, 'Barcelona', 'Centrocampista del Barça.'),
      J('Luka Modrić', ['modric'], 'MED', 10, 'Real Madrid', 'Fue el mejor jugador del torneo.'),
      J('Ivan Perišić', ['perisic'], 'DEL', 4, 'Inter', 'Marcó el empate a uno.'),
      J('Ante Rebić', ['rebic'], 'DEL', 18, 'Eintracht Fráncfort', 'Extremo del Eintracht.'),
      J('Mario Mandžukić', ['mandzukic'], 'DEL', 17, 'Juventus', 'Marcó en propia puerta y luego el 4-2.')
    ])
  ] },
  { id: 'mundial1986', partido: 'Final del Mundial 1986 · Argentina 3-2 Alemania Federal', onces: [
    O('Argentina', 'Carlos Bilardo', 'seleccion', [
      J('Nery Pumpido', ['pumpido'], 'POR', 18, 'River Plate', 'Portero de River.'),
      J('José Luis Cuciuffo', ['cuciuffo'], 'DEF', 9, 'Vélez Sarsfield', 'Defensa que llevaba el 9.'),
      J('José Luis Brown', ['brown', 'tata brown'], 'DEF', 5, 'Deportivo Español', 'Marcó el 1-0 de cabeza.'),
      J('Oscar Ruggeri', ['ruggeri'], 'DEF', 19, 'River Plate', 'Central; luego jugó en el Real Madrid.'),
      J('Julio Olarticoechea', ['olarticoechea'], 'MED', 16, 'Boca Juniors', 'Carrilero izquierdo.'),
      J('Sergio Batista', ['batista', 'checho'], 'MED', 2, 'Argentinos Juniors', 'Mediocentro que llevaba el 2.'),
      J('Ricardo Giusti', ['giusti'], 'MED', 14, 'Independiente', 'Centrocampista de Independiente.'),
      J('Héctor Enrique', ['enrique'], 'MED', 12, 'River Plate', 'Dio el pase del «gol del siglo».'),
      J('Jorge Burruchaga', ['burruchaga'], 'MED', 7, 'Nantes', 'Marcó el 3-2 a pase de Maradona.'),
      J('Diego Maradona', ['maradona', 'diego'], 'DEL', 10, 'Nápoles', 'El capitán y la estrella del torneo.'),
      J('Jorge Valdano', ['valdano'], 'DEL', 11, 'Real Madrid', 'Marcó el 2-0.')
    ]),
    O('Alemania Federal', 'Franz Beckenbauer', 'seleccion', [
      J('Harald Schumacher', ['schumacher'], 'POR', 1, 'Colonia', 'Portero que falló en el primer gol.'),
      J('Hans-Peter Briegel', ['briegel'], 'DEF', 2, 'Sampdoria', 'Defensa que había jugado en Italia.'),
      J('Karlheinz Förster', ['forster'], 'DEF', 4, 'Stuttgart', 'Central del Stuttgart.'),
      J('Ditmar Jakobs', ['jakobs'], 'DEF', 17, 'Hamburgo', 'Líbero del Hamburgo.'),
      J('Thomas Berthold', ['berthold'], 'DEF', 14, 'Eintracht Fráncfort', 'Lateral derecho.'),
      J('Andreas Brehme', ['brehme'], 'MED', 3, 'Kaiserslautern', 'Cuatro años después ganó el Mundial con su penalti.'),
      J('Lothar Matthäus', ['matthaus'], 'MED', 8, 'Bayern de Múnich', 'Se encargó de marcar a Maradona.'),
      J('Norbert Eder', ['eder'], 'MED', 6, 'Bayern de Múnich', 'Centrocampista del Bayern.'),
      J('Felix Magath', ['magath'], 'MED', 10, 'Hamburgo', 'Llevaba el 10.'),
      J('Karl-Heinz Rummenigge', ['rummenigge'], 'DEL', 11, 'Inter', 'El capitán; marcó el 2-1.'),
      J('Klaus Allofs', ['allofs'], 'DEL', 19, 'Colonia', 'Delantero del Colonia.')
    ])
  ] },
  { id: 'mundial1994', partido: 'Final del Mundial 1994 · Brasil 0-0 Italia (penaltis)', onces: [
    O('Brasil', 'Carlos Alberto Parreira', 'seleccion', [
      J('Cláudio Taffarel', ['taffarel'], 'POR', 1, 'Reggiana', 'Paró el penalti de Massaro.'),
      J('Branco', ['branco'], 'DEF', 6, 'Fluminense', 'Lateral izquierdo de gran disparo.'),
      J('Márcio Santos', ['marcio santos'], 'DEF', 15, 'Burdeos', 'Falló su penalti en la tanda.'),
      J('Aldair', ['aldair'], 'DEF', 13, 'Roma', 'Central de la Roma.'),
      J('Jorginho', ['jorginho'], 'DEF', 2, 'Bayern de Múnich', 'Lateral derecho; se lesionó en la primera parte.'),
      J('Zinho', ['zinho'], 'MED', 9, 'Palmeiras', 'Llevaba el 9 siendo centrocampista.'),
      J('Dunga', ['dunga'], 'MED', 8, 'Stuttgart', 'El capitán; levantó la copa.'),
      J('Mauro Silva', ['mauro silva'], 'MED', 5, 'Deportivo de La Coruña', 'Mediocentro del Deportivo.'),
      J('Mazinho', ['mazinho'], 'MED', 17, 'Palmeiras', 'Padre de Thiago y Rafinha Alcântara.'),
      J('Bebeto', ['bebeto'], 'DEL', 7, 'Deportivo de La Coruña', 'Famoso por la celebración de «la cuna».'),
      J('Romário', ['romario'], 'DEL', 11, 'Barcelona', 'Fue el mejor jugador del Mundial.')
    ]),
    O('Italia', 'Arrigo Sacchi', 'seleccion', [
      J('Gianluca Pagliuca', ['pagliuca'], 'POR', 1, 'Sampdoria', 'Portero de la Sampdoria.'),
      J('Paolo Maldini', ['maldini'], 'DEF', 5, 'Milan', 'Lateral y central del Milan.'),
      J('Franco Baresi', ['baresi'], 'DEF', 6, 'Milan', 'Jugó la final pocas semanas después de operarse de la rodilla.'),
      J('Antonio Benarrivo', ['benarrivo'], 'DEF', 3, 'Parma', 'Lateral del Parma.'),
      J('Roberto Mussi', ['mussi'], 'DEF', 8, 'Torino', 'Lateral derecho; se lesionó en la primera parte.'),
      J('Roberto Donadoni', ['donadoni'], 'MED', 16, 'Milan', 'Extremo del Milan.'),
      J('Demetrio Albertini', ['albertini'], 'MED', 11, 'Milan', 'Mediocentro del Milan.'),
      J('Dino Baggio', ['dino baggio'], 'MED', 14, 'Juventus', 'Centrocampista; sin parentesco con Roberto.'),
      J('Nicola Berti', ['berti'], 'MED', 13, 'Inter', 'Centrocampista del Inter.'),
      J('Roberto Baggio', ['baggio', 'roberto baggio'], 'DEL', 10, 'Juventus', 'Falló el último penalti.'),
      J('Daniele Massaro', ['massaro'], 'DEL', 19, 'Milan', 'Delantero del Milan.')
    ])
  ] },
  { id: 'mundial2014semi', partido: 'Semifinal del Mundial 2014 · Brasil 1-7 Alemania', onces: [
    O('Brasil', 'Luiz Felipe Scolari', 'seleccion', [
      J('Júlio César', ['julio cesar'], 'POR', 12, 'Toronto FC', 'Portero que jugaba en la MLS.'),
      J('Marcelo', ['marcelo'], 'DEF', 6, 'Real Madrid', 'Lateral izquierdo del Real Madrid.'),
      J('Dante', ['dante'], 'DEF', 13, 'Bayern de Múnich', 'Central del Bayern; jugaba contra sus compañeros.'),
      J('David Luiz', ['david luiz'], 'DEF', 4, 'Chelsea', 'Capitán por la sanción de Thiago Silva.'),
      J('Maicon', ['maicon'], 'DEF', 23, 'Roma', 'Lateral derecho de la Roma.'),
      J('Fernandinho', ['fernandinho'], 'MED', 5, 'Manchester City', 'Mediocentro del City.'),
      J('Luiz Gustavo', ['luiz gustavo'], 'MED', 17, 'Wolfsburgo', 'Mediocentro que jugaba en Alemania.'),
      J('Bernard', ['bernard'], 'DEL', 20, 'Shakhtar Donetsk', 'Sustituyó al lesionado Neymar.'),
      J('Oscar', ['oscar'], 'DEL', 11, 'Chelsea', 'Marcó el gol del honor.'),
      J('Hulk', ['hulk'], 'DEL', 7, 'Zenit', 'Delantero del Zenit.'),
      J('Fred', ['fred'], 'DEL', 9, 'Fluminense', 'Delantero centro muy criticado.')
    ]),
    O('Alemania', 'Joachim Löw', 'seleccion', [
      J('Manuel Neuer', ['neuer'], 'POR', 1, 'Bayern de Múnich', 'Ganó el Guante de Oro del Mundial.'),
      J('Benedikt Höwedes', ['howedes'], 'DEF', 4, 'Schalke 04', 'Central que jugó de lateral izquierdo.'),
      J('Mats Hummels', ['hummels'], 'DEF', 5, 'Borussia Dortmund', 'Central del Dortmund.'),
      J('Jérôme Boateng', ['boateng'], 'DEF', 20, 'Bayern de Múnich', 'Central del Bayern.'),
      J('Philipp Lahm', ['lahm'], 'DEF', 16, 'Bayern de Múnich', 'El capitán.'),
      J('Bastian Schweinsteiger', ['schweinsteiger'], 'MED', 7, 'Bayern de Múnich', 'Centrocampista del Bayern.'),
      J('Sami Khedira', ['khedira'], 'MED', 6, 'Real Madrid', 'Marcó el 5-0.'),
      J('Toni Kroos', ['kroos'], 'MED', 18, 'Bayern de Múnich', 'Marcó dos goles en dos minutos.'),
      J('Mesut Özil', ['ozil'], 'DEL', 8, 'Arsenal', 'Mediapunta del Arsenal.'),
      J('Thomas Müller', ['muller'], 'DEL', 13, 'Bayern de Múnich', 'Marcó el 1-0 tras un córner.'),
      J('Miroslav Klose', ['klose'], 'DEL', 11, 'Lazio', 'Con su gol batió el récord de goles en Mundiales.')
    ])
  ] },
  { id: 'mundial2010semi', partido: 'Semifinal del Mundial 2010 · España 1-0 Alemania', onces: [
    O('España', 'Vicente del Bosque', 'seleccion', [
      J('Iker Casillas', ['casillas', 'iker'], 'POR', 1, 'Real Madrid', 'El capitán.'),
      J('Joan Capdevila', ['capdevila'], 'DEF', 11, 'Villarreal', 'Lateral izquierdo del Villarreal.'),
      J('Carles Puyol', ['puyol'], 'DEF', 5, 'Barcelona', 'Marcó de cabeza el gol del partido.'),
      J('Gerard Piqué', ['pique'], 'DEF', 3, 'Barcelona', 'Central del Barça.'),
      J('Sergio Ramos', ['ramos'], 'DEF', 15, 'Real Madrid', 'Lateral derecho.'),
      J('Xabi Alonso', ['xabi', 'alonso'], 'MED', 14, 'Real Madrid', 'Mediocentro del Real Madrid.'),
      J('Sergio Busquets', ['busquets'], 'MED', 16, 'Barcelona', 'Mediocentro del Barça.'),
      J('Andrés Iniesta', ['iniesta'], 'MED', 6, 'Barcelona', 'Interior del Barça.'),
      J('Xavi Hernández', ['xavi'], 'MED', 8, 'Barcelona', 'Sacó el córner del gol.'),
      J('Pedro Rodríguez', ['pedro'], 'DEL', 18, 'Barcelona', 'Fue titular en lugar de Torres.'),
      J('David Villa', ['villa'], 'DEL', 7, 'Valencia', 'Ya había fichado por el Barça.')
    ]),
    O('Alemania', 'Joachim Löw', 'seleccion', [
      J('Manuel Neuer', ['neuer'], 'POR', 1, 'Schalke 04', 'Portero del Schalke.'),
      J('Jérôme Boateng', ['boateng'], 'DEF', 20, 'Hamburgo', 'Jugó de lateral izquierdo.'),
      J('Per Mertesacker', ['mertesacker'], 'DEF', 17, 'Werder Bremen', 'Central muy alto.'),
      J('Arne Friedrich', ['friedrich'], 'DEF', 3, 'Hertha de Berlín', 'Central del Hertha.'),
      J('Philipp Lahm', ['lahm'], 'DEF', 16, 'Bayern de Múnich', 'El capitán.'),
      J('Bastian Schweinsteiger', ['schweinsteiger'], 'MED', 7, 'Bayern de Múnich', 'Centrocampista del Bayern.'),
      J('Sami Khedira', ['khedira'], 'MED', 6, 'Stuttgart', 'Ese verano fichó por el Real Madrid.'),
      J('Lukas Podolski', ['podolski'], 'MED', 10, 'Colonia', 'Extremo izquierdo.'),
      J('Mesut Özil', ['ozil'], 'MED', 8, 'Werder Bremen', 'Ese verano fichó por el Real Madrid.'),
      J('Piotr Trochowski', ['trochowski'], 'MED', 15, 'Hamburgo', 'Sustituyó al sancionado Müller.'),
      J('Miroslav Klose', ['klose'], 'DEL', 11, 'Bayern de Múnich', 'Delantero centro.')
    ])
  ] },
  { id: 'euro2012', partido: 'Final de la Eurocopa 2012 · España 4-0 Italia', onces: [
    O('España', 'Vicente del Bosque', 'seleccion', [
      J('Iker Casillas', ['casillas', 'iker'], 'POR', 1, 'Real Madrid', 'El capitán.'),
      J('Jordi Alba', ['alba', 'jordi alba'], 'DEF', 18, 'Valencia', 'Marcó el 2-0 tras una carrera; ya había fichado por el Barça.'),
      J('Sergio Ramos', ['ramos'], 'DEF', 15, 'Real Madrid', 'Jugó de central.'),
      J('Gerard Piqué', ['pique'], 'DEF', 3, 'Barcelona', 'Central del Barça.'),
      J('Álvaro Arbeloa', ['arbeloa'], 'DEF', 17, 'Real Madrid', 'Lateral derecho.'),
      J('Sergio Busquets', ['busquets'], 'MED', 16, 'Barcelona', 'Mediocentro del Barça.'),
      J('Xabi Alonso', ['xabi', 'alonso'], 'MED', 14, 'Real Madrid', 'Mediocentro del Real Madrid.'),
      J('Xavi Hernández', ['xavi'], 'MED', 8, 'Barcelona', 'Dio dos asistencias.'),
      J('Andrés Iniesta', ['iniesta'], 'MED', 6, 'Barcelona', 'Mejor jugador del torneo.'),
      J('David Silva', ['silva', 'david silva'], 'MED', 21, 'Manchester City', 'Marcó el 1-0 de cabeza.'),
      J('Cesc Fàbregas', ['cesc', 'fabregas'], 'DEL', 10, 'Barcelona', 'Jugó de «falso nueve».')
    ]),
    O('Italia', 'Cesare Prandelli', 'seleccion', [
      J('Gianluigi Buffon', ['buffon'], 'POR', 1, 'Juventus', 'El capitán.'),
      J('Giorgio Chiellini', ['chiellini'], 'DEF', 3, 'Juventus', 'Se lesionó en la primera parte.'),
      J('Leonardo Bonucci', ['bonucci'], 'DEF', 19, 'Juventus', 'Central de la Juventus.'),
      J('Andrea Barzagli', ['barzagli'], 'DEF', 15, 'Juventus', 'Central de la Juventus.'),
      J('Ignazio Abate', ['abate'], 'DEF', 7, 'Milan', 'Lateral derecho del Milan.'),
      J('Riccardo Montolivo', ['montolivo'], 'MED', 18, 'Fiorentina', 'Centrocampista; fichó por el Milan.'),
      J('Daniele De Rossi', ['de rossi'], 'MED', 16, 'Roma', 'Centrocampista de la Roma.'),
      J('Andrea Pirlo', ['pirlo'], 'MED', 21, 'Juventus', 'Su penalti a lo Panenka eliminó a Inglaterra.'),
      J('Claudio Marchisio', ['marchisio'], 'MED', 8, 'Juventus', 'Centrocampista de la Juventus.'),
      J('Antonio Cassano', ['cassano'], 'DEL', 10, 'Milan', 'Exjugador del Real Madrid.'),
      J('Mario Balotelli', ['balotelli'], 'DEL', 9, 'Manchester City', 'Marcó dos goles a Alemania en semifinales.')
    ])
  ] },
  { id: 'euro2020', partido: 'Final de la Eurocopa 2020 · Italia 1-1 Inglaterra (penaltis)', onces: [
    O('Italia', 'Roberto Mancini', 'seleccion', [
      J('Gianluigi Donnarumma', ['donnarumma'], 'POR', 21, 'Milan', 'Fue el mejor jugador del torneo.'),
      J('Emerson Palmieri', ['emerson'], 'DEF', 13, 'Chelsea', 'Lateral izquierdo nacido en Brasil.'),
      J('Giorgio Chiellini', ['chiellini'], 'DEF', 3, 'Juventus', 'El capitán; agarró a Saka de la camiseta.'),
      J('Leonardo Bonucci', ['bonucci'], 'DEF', 19, 'Juventus', 'Marcó el empate.'),
      J('Giovanni Di Lorenzo', ['di lorenzo'], 'DEF', 2, 'Nápoles', 'Lateral derecho.'),
      J('Marco Verratti', ['verratti'], 'MED', 6, 'PSG', 'Centrocampista del PSG.'),
      J('Jorginho', ['jorginho'], 'MED', 8, 'Chelsea', 'Falló su penalti en la tanda.'),
      J('Nicolò Barella', ['barella'], 'MED', 18, 'Inter', 'Centrocampista del Inter.'),
      J('Lorenzo Insigne', ['insigne'], 'DEL', 10, 'Nápoles', 'Extremo del Nápoles.'),
      J('Ciro Immobile', ['immobile'], 'DEL', 17, 'Lazio', 'Delantero de la Lazio.'),
      J('Federico Chiesa', ['chiesa'], 'DEL', 14, 'Juventus', 'Se lesionó en la segunda parte.')
    ]),
    O('Inglaterra', 'Gareth Southgate', 'seleccion', [
      J('Jordan Pickford', ['pickford'], 'POR', 1, 'Everton', 'Paró dos penaltis.'),
      J('Luke Shaw', ['shaw'], 'DEF', 3, 'Manchester United', 'Marcó a los dos minutos.'),
      J('Harry Maguire', ['maguire'], 'DEF', 6, 'Manchester United', 'Central del United.'),
      J('John Stones', ['stones'], 'DEF', 5, 'Manchester City', 'Central del City.'),
      J('Kyle Walker', ['walker'], 'DEF', 2, 'Manchester City', 'Defensa del City.'),
      J('Kieran Trippier', ['trippier'], 'MED', 12, 'Atlético de Madrid', 'Carrilero que jugaba en el Atlético.'),
      J('Declan Rice', ['rice'], 'MED', 4, 'West Ham', 'Mediocentro del West Ham.'),
      J('Kalvin Phillips', ['phillips'], 'MED', 14, 'Leeds United', 'Mediocentro del Leeds.'),
      J('Mason Mount', ['mount'], 'MED', 19, 'Chelsea', 'Mediapunta del Chelsea.'),
      J('Raheem Sterling', ['sterling'], 'DEL', 10, 'Manchester City', 'Extremo del City.'),
      J('Harry Kane', ['kane'], 'DEL', 9, 'Tottenham', 'El capitán.')
    ])
  ] },
  { id: 'euro2024', partido: 'Final de la Eurocopa 2024 · España 2-1 Inglaterra', onces: [
    O('España', 'Luis de la Fuente', 'seleccion', [
      J('Unai Simón', ['unai simon', 'simon'], 'POR', 23, 'Athletic Club', 'Portero del Athletic.'),
      J('Marc Cucurella', ['cucurella'], 'DEF', 24, 'Chelsea', 'Dio la asistencia del 2-1.'),
      J('Aymeric Laporte', ['laporte'], 'DEF', 14, 'Al-Nassr', 'Central que jugaba en Arabia Saudí.'),
      J('Robin Le Normand', ['le normand'], 'DEF', 3, 'Real Sociedad', 'Central nacido en Francia.'),
      J('Dani Carvajal', ['carvajal'], 'DEF', 2, 'Real Madrid', 'Lateral derecho.'),
      J('Fabián Ruiz', ['fabian', 'fabian ruiz'], 'MED', 8, 'PSG', 'Centrocampista del PSG.'),
      J('Rodri', ['rodri', 'rodrigo hernandez'], 'MED', 16, 'Manchester City', 'Mejor jugador del torneo; se lesionó al descanso.'),
      J('Nico Williams', ['nico', 'nico williams'], 'DEL', 17, 'Athletic Club', 'Marcó el 1-0.'),
      J('Dani Olmo', ['olmo'], 'DEL', 10, 'Leipzig', 'Salvó un gol sobre la línea al final.'),
      J('Lamine Yamal', ['lamine', 'yamal'], 'DEL', 19, 'Barcelona', 'Cumplió 17 años la víspera.'),
      J('Álvaro Morata', ['morata'], 'DEL', 7, 'Atlético de Madrid', 'El capitán.')
    ]),
    O('Inglaterra', 'Gareth Southgate', 'seleccion', [
      J('Jordan Pickford', ['pickford'], 'POR', 1, 'Everton', 'Portero del Everton.'),
      J('Luke Shaw', ['shaw'], 'DEF', 3, 'Manchester United', 'Lateral izquierdo.'),
      J('Marc Guéhi', ['guehi'], 'DEF', 6, 'Crystal Palace', 'Central del Crystal Palace.'),
      J('John Stones', ['stones'], 'DEF', 5, 'Manchester City', 'Central del City.'),
      J('Kyle Walker', ['walker'], 'DEF', 2, 'Manchester City', 'Lateral derecho.'),
      J('Declan Rice', ['rice'], 'MED', 4, 'Arsenal', 'Mediocentro del Arsenal.'),
      J('Kobbie Mainoo', ['mainoo'], 'MED', 26, 'Manchester United', 'Joven mediocentro del United.'),
      J('Phil Foden', ['foden'], 'MED', 11, 'Manchester City', 'Mejor jugador de la Premier ese año.'),
      J('Jude Bellingham', ['bellingham', 'jude'], 'MED', 10, 'Real Madrid', 'Mediapunta del Real Madrid.'),
      J('Bukayo Saka', ['saka'], 'MED', 7, 'Arsenal', 'Extremo del Arsenal.'),
      J('Harry Kane', ['kane'], 'DEL', 9, 'Bayern de Múnich', 'El capitán.')
    ])
  ] },
  { id: 'euro2004', partido: 'Final de la Eurocopa 2004 · Portugal 0-1 Grecia', onces: [
    O('Portugal', 'Luiz Felipe Scolari', 'seleccion', [
      J('Ricardo', ['ricardo'], 'POR', 1, 'Sporting de Portugal', 'Portero del Sporting.'),
      J('Nuno Valente', ['nuno valente'], 'DEF', 14, 'Oporto', 'Lateral izquierdo del Oporto campeón de Europa.'),
      J('Ricardo Carvalho', ['carvalho'], 'DEF', 16, 'Oporto', 'Central; ese verano fichó por el Chelsea.'),
      J('Jorge Andrade', ['andrade'], 'DEF', 5, 'Deportivo de La Coruña', 'Central del Deportivo.'),
      J('Miguel', ['miguel'], 'DEF', 13, 'Benfica', 'Lateral derecho; se lesionó en la primera parte.'),
      J('Costinha', ['costinha'], 'MED', 6, 'Oporto', 'Mediocentro del Oporto.'),
      J('Maniche', ['maniche'], 'MED', 18, 'Oporto', 'Centrocampista del Oporto.'),
      J('Deco', ['deco'], 'MED', 20, 'Oporto', 'Ese verano fichó por el Barça.'),
      J('Cristiano Ronaldo', ['cristiano', 'ronaldo', 'cr7'], 'DEL', 17, 'Manchester United', 'Con 19 años, lloró tras la final.'),
      J('Pauleta', ['pauleta'], 'DEL', 9, 'PSG', 'Delantero del PSG.'),
      J('Luís Figo', ['figo'], 'DEL', 7, 'Real Madrid', 'El capitán.')
    ]),
    O('Grecia', 'Otto Rehhagel', 'seleccion', [
      J('Antonios Nikopolidis', ['nikopolidis'], 'POR', 1, 'Panathinaikos', 'Portero de pelo canoso.'),
      J('Takis Fyssas', ['fyssas'], 'DEF', 14, 'Benfica', 'Lateral izquierdo.'),
      J('Traianos Dellas', ['dellas'], 'DEF', 19, 'Roma', 'Central que marcó el gol de plata en semifinales.'),
      J('Michalis Kapsis', ['kapsis'], 'DEF', 5, 'AEK Atenas', 'Central del AEK.'),
      J('Giourkas Seitaridis', ['seitaridis'], 'DEF', 2, 'Panathinaikos', 'Lateral derecho; luego fichó por el Oporto.'),
      J('Kostas Katsouranis', ['katsouranis'], 'MED', 21, 'AEK Atenas', 'Centrocampista del AEK.'),
      J('Angelos Basinas', ['basinas'], 'MED', 6, 'Panathinaikos', 'Centrocampista; luego jugó en el Mallorca.'),
      J('Theodoros Zagorakis', ['zagorakis'], 'MED', 7, 'AEK Atenas', 'El capitán; mejor jugador del torneo.'),
      J('Stelios Giannakopoulos', ['giannakopoulos'], 'MED', 8, 'Bolton', 'Jugaba en el Bolton.'),
      J('Angelos Charisteas', ['charisteas'], 'DEL', 9, 'Werder Bremen', 'Marcó el gol de cabeza.'),
      J('Zisis Vryzas', ['vryzas'], 'DEL', 15, 'Fiorentina', 'Delantero de la Fiorentina.')
    ])
  ] },
  { id: 'clasico2010', partido: 'Liga 2010-11 · Barcelona 5-0 Real Madrid', onces: [
    O('Barcelona', 'Pep Guardiola', 'club', [
      J('Víctor Valdés', ['valdes'], 'POR', 1, 'España', 'Portero canterano.'),
      J('Éric Abidal', ['abidal'], 'DEF', 22, 'Francia', 'Lateral izquierdo francés.'),
      J('Carles Puyol', ['puyol'], 'DEF', 5, 'España', 'El capitán.'),
      J('Gerard Piqué', ['pique'], 'DEF', 3, 'España', 'Hizo con la mano el gesto de la «manita».'),
      J('Dani Alves', ['alves', 'dani alves'], 'DEF', 2, 'Brasil', 'Lateral derecho brasileño.'),
      J('Andrés Iniesta', ['iniesta'], 'MED', 8, 'España', 'Interior; meses antes marcó en la final del Mundial.'),
      J('Sergio Busquets', ['busquets'], 'MED', 16, 'España', 'Mediocentro canterano.'),
      J('Xavi Hernández', ['xavi'], 'MED', 6, 'España', 'Marcó el 1-0.'),
      J('David Villa', ['villa'], 'DEL', 7, 'España', 'Marcó dos goles en su primer Clásico.'),
      J('Lionel Messi', ['messi', 'leo'], 'DEL', 10, 'Argentina', 'Dio dos asistencias a Villa.'),
      J('Pedro Rodríguez', ['pedro'], 'DEL', 17, 'España', 'Marcó el 2-0.')
    ]),
    O('Real Madrid', 'José Mourinho', 'club', [
      J('Iker Casillas', ['casillas', 'iker'], 'POR', 1, 'España', 'El capitán.'),
      J('Marcelo', ['marcelo'], 'DEF', 12, 'Brasil', 'Lateral izquierdo brasileño.'),
      J('Ricardo Carvalho', ['carvalho'], 'DEF', 2, 'Portugal', 'Central portugués.'),
      J('Pepe', ['pepe'], 'DEF', 3, 'Portugal', 'Central portugués.'),
      J('Sergio Ramos', ['ramos'], 'DEF', 4, 'España', 'Fue expulsado al final.'),
      J('Xabi Alonso', ['xabi', 'alonso'], 'MED', 14, 'España', 'Mediocentro vasco.'),
      J('Sami Khedira', ['khedira'], 'MED', 24, 'Alemania', 'Fichado ese verano del Stuttgart.'),
      J('Cristiano Ronaldo', ['cristiano', 'ronaldo', 'cr7'], 'MED', 7, 'Portugal', 'Empujó a Guardiola en la banda.'),
      J('Mesut Özil', ['ozil'], 'MED', 23, 'Alemania', 'Fichado ese verano del Werder Bremen.'),
      J('Ángel Di María', ['di maria', 'fideo'], 'MED', 22, 'Argentina', 'Fichado ese verano del Benfica.'),
      J('Karim Benzema', ['benzema'], 'DEL', 9, 'Francia', 'Delantero francés.')
    ])
  ] },
  { id: 'copa2014', partido: 'Final de la Copa del Rey 2014 · Real Madrid 2-1 Barcelona', onces: [
    O('Real Madrid', 'Carlo Ancelotti', 'club', [
      J('Iker Casillas', ['casillas', 'iker'], 'POR', 1, 'España', 'Era el portero de las copas.'),
      J('Fábio Coentrão', ['coentrao'], 'DEF', 5, 'Portugal', 'Lateral izquierdo portugués.'),
      J('Sergio Ramos', ['ramos'], 'DEF', 4, 'España', 'Central sevillano.'),
      J('Pepe', ['pepe'], 'DEF', 3, 'Portugal', 'Central portugués.'),
      J('Dani Carvajal', ['carvajal'], 'DEF', 15, 'España', 'En su primera temporada tras volver del Leverkusen.'),
      J('Xabi Alonso', ['xabi', 'alonso'], 'MED', 14, 'España', 'Mediocentro vasco.'),
      J('Luka Modrić', ['modric'], 'MED', 19, 'Croacia', 'Centrocampista croata.'),
      J('Isco', ['isco', 'isco alarcon'], 'MED', 23, 'España', 'En su primera temporada en el club.'),
      J('Ángel Di María', ['di maria', 'fideo'], 'MED', 22, 'Argentina', 'Marcó el 1-0.'),
      J('Karim Benzema', ['benzema'], 'DEL', 9, 'Francia', 'Delantero francés.'),
      J('Gareth Bale', ['bale'], 'DEL', 11, 'Gales', 'Marcó el 2-1 tras una carrera de 50 metros.')
    ]),
    O('Barcelona', 'Gerardo Martino', 'club', [
      J('José Manuel Pinto', ['pinto'], 'POR', 13, 'España', 'Portero de las copas.'),
      J('Jordi Alba', ['alba', 'jordi alba'], 'DEF', 18, 'España', 'Lateral izquierdo.'),
      J('Javier Mascherano', ['mascherano'], 'DEF', 14, 'Argentina', 'Mediocentro que jugaba de central.'),
      J('Marc Bartra', ['bartra'], 'DEF', 15, 'España', 'Marcó el empate de cabeza.'),
      J('Dani Alves', ['alves', 'dani alves'], 'DEF', 2, 'Brasil', 'Lateral derecho brasileño.'),
      J('Andrés Iniesta', ['iniesta'], 'MED', 8, 'España', 'Interior manchego.'),
      J('Sergio Busquets', ['busquets'], 'MED', 16, 'España', 'Mediocentro.'),
      J('Xavi Hernández', ['xavi'], 'MED', 6, 'España', 'Centrocampista.'),
      J('Pedro Rodríguez', ['pedro'], 'DEL', 7, 'España', 'Extremo canario.'),
      J('Lionel Messi', ['messi', 'leo'], 'DEL', 10, 'Argentina', 'Delantero argentino.'),
      J('Neymar', ['neymar'], 'DEL', 11, 'Brasil', 'Estrelló un balón en el palo al final.')
    ])
  ] }
];
