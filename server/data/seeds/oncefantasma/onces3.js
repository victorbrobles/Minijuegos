// server/data/seeds/oncefantasma/onces3.js
// «El Once Fantasma» · ampliación 2: remontadas, goleadas y partidos de selecciones recientes.
// Mismo formato que onces.js (izquierda a derecha en cada línea; `dato` = club o país).

const J = (nombre, alias, pos, dorsal, dato, pista) => ({ nombre, alias, pos, dorsal, dato, pista });
const O = (equipo, entrenador, tipo, jugadores) => ({ equipo, entrenador, tipo, jugadores });

export default [
  { id: 'anfield2019', partido: 'Semifinal de la Champions 2019 · Liverpool 4-0 Barcelona', onces: [
    O('Liverpool', 'Jürgen Klopp', 'club', [
      J('Alisson Becker', ['alisson'], 'POR', 13, 'Brasil', 'Portero brasileño.'),
      J('Andrew Robertson', ['robertson'], 'DEF', 26, 'Escocia', 'Se lesionó al descanso.'),
      J('Virgil van Dijk', ['van dijk', 'dijk'], 'DEF', 4, 'Países Bajos', 'Central neerlandés.'),
      J('Joël Matip', ['matip'], 'DEF', 32, 'Camerún', 'Central camerunés.'),
      J('Trent Alexander-Arnold', ['alexander arnold', 'trent', 'arnold'], 'DEF', 66, 'Inglaterra', 'Sacó rápido el córner del 4-0.'),
      J('James Milner', ['milner'], 'MED', 7, 'Inglaterra', 'Centrocampista veterano.'),
      J('Fabinho', ['fabinho'], 'MED', 3, 'Brasil', 'Mediocentro brasileño.'),
      J('Jordan Henderson', ['henderson'], 'MED', 14, 'Inglaterra', 'El capitán.'),
      J('Sadio Mané', ['mane'], 'DEL', 10, 'Senegal', 'Extremo senegalés.'),
      J('Divock Origi', ['origi'], 'DEL', 27, 'Bélgica', 'Marcó el primero y el último.'),
      J('Xherdan Shaqiri', ['shaqiri'], 'DEL', 23, 'Suiza', 'Suplió al lesionado Salah.')
    ]),
    O('Barcelona', 'Ernesto Valverde', 'club', [
      J('Marc-André ter Stegen', ['ter stegen'], 'POR', 1, 'Alemania', 'Portero alemán.'),
      J('Jordi Alba', ['alba', 'jordi alba'], 'DEF', 18, 'España', 'Su error propició el 1-0.'),
      J('Clément Lenglet', ['lenglet'], 'DEF', 15, 'Francia', 'Central francés llegado del Sevilla.'),
      J('Gerard Piqué', ['pique'], 'DEF', 3, 'España', 'Central canterano.'),
      J('Sergi Roberto', ['sergi roberto'], 'DEF', 20, 'España', 'Lateral derecho.'),
      J('Arturo Vidal', ['vidal'], 'MED', 22, 'Chile', 'Centrocampista chileno.'),
      J('Sergio Busquets', ['busquets'], 'MED', 5, 'España', 'Mediocentro canterano.'),
      J('Ivan Rakitić', ['rakitic'], 'MED', 4, 'Croacia', 'Exjugador del Sevilla.'),
      J('Philippe Coutinho', ['coutinho'], 'DEL', 7, 'Brasil', 'Exjugador del rival.'),
      J('Luis Suárez', ['suarez'], 'DEL', 9, 'Uruguay', 'Exjugador del rival.'),
      J('Lionel Messi', ['messi', 'leo'], 'DEL', 10, 'Argentina', 'Había marcado dos en la ida.')
    ])
  ] },
  { id: 'remontada2017', partido: 'Octavos de la Champions 2017 · Barcelona 6-1 PSG', onces: [
    O('Barcelona', 'Luis Enrique', 'club', [
      J('Marc-André ter Stegen', ['ter stegen'], 'POR', 1, 'Alemania', 'Portero alemán.'),
      J('Samuel Umtiti', ['umtiti'], 'DEF', 23, 'Francia', 'Central francés.'),
      J('Javier Mascherano', ['mascherano'], 'DEF', 14, 'Argentina', 'Mediocentro reconvertido en central.'),
      J('Gerard Piqué', ['pique'], 'DEF', 3, 'España', 'Dijo que «se puede» tras la ida.'),
      J('Andrés Iniesta', ['iniesta'], 'MED', 8, 'España', 'Su taconazo provocó el gol en propia puerta.'),
      J('Sergio Busquets', ['busquets'], 'MED', 5, 'España', 'Mediocentro.'),
      J('Ivan Rakitić', ['rakitic'], 'MED', 4, 'Croacia', 'Centrocampista croata.'),
      J('Rafinha', ['rafinha'], 'MED', 12, 'Brasil', 'Hermano de Thiago Alcântara.'),
      J('Neymar', ['neymar'], 'DEL', 11, 'Brasil', 'Marcó dos goles al final y dio el último.'),
      J('Luis Suárez', ['suarez'], 'DEL', 9, 'Uruguay', 'Marcó el 1-0 a los tres minutos.'),
      J('Lionel Messi', ['messi', 'leo'], 'DEL', 10, 'Argentina', 'Marcó de penalti el 3-0.')
    ]),
    O('PSG', 'Unai Emery', 'club', [
      J('Kevin Trapp', ['trapp'], 'POR', 1, 'Alemania', 'Portero alemán.'),
      J('Layvin Kurzawa', ['kurzawa'], 'DEF', 20, 'Francia', 'Marcó en propia puerta.'),
      J('Thiago Silva', ['thiago silva'], 'DEF', 2, 'Brasil', 'El capitán.'),
      J('Marquinhos', ['marquinhos'], 'DEF', 5, 'Brasil', 'Central brasileño.'),
      J('Thomas Meunier', ['meunier'], 'DEF', 12, 'Bélgica', 'Lateral derecho belga.'),
      J('Adrien Rabiot', ['rabiot'], 'MED', 25, 'Francia', 'Canterano del club.'),
      J('Marco Verratti', ['verratti'], 'MED', 6, 'Italia', 'Centrocampista italiano.'),
      J('Blaise Matuidi', ['matuidi'], 'MED', 14, 'Francia', 'Centrocampista francés.'),
      J('Julian Draxler', ['draxler'], 'DEL', 23, 'Alemania', 'Llegó en enero desde el Wolfsburgo.'),
      J('Edinson Cavani', ['cavani'], 'DEL', 9, 'Uruguay', 'Marcó el gol del PSG.'),
      J('Lucas Moura', ['lucas', 'lucas moura'], 'DEL', 7, 'Brasil', 'Extremo brasileño.')
    ])
  ] },
  { id: 'lisboa2020', partido: 'Cuartos de la Champions 2020 · Barcelona 2-8 Bayern', onces: [
    O('Barcelona', 'Quique Setién', 'club', [
      J('Marc-André ter Stegen', ['ter stegen'], 'POR', 1, 'Alemania', 'Encajó ocho goles.'),
      J('Jordi Alba', ['alba', 'jordi alba'], 'DEF', 18, 'España', 'Lateral izquierdo.'),
      J('Clément Lenglet', ['lenglet'], 'DEF', 15, 'Francia', 'Central francés.'),
      J('Gerard Piqué', ['pique'], 'DEF', 3, 'España', 'Dijo que había que cambiar el club.'),
      J('Nélson Semedo', ['semedo'], 'DEF', 2, 'Portugal', 'Lateral derecho portugués.'),
      J('Arturo Vidal', ['vidal'], 'MED', 22, 'Chile', 'Exjugador del rival.'),
      J('Sergio Busquets', ['busquets'], 'MED', 5, 'España', 'Mediocentro.'),
      J('Frenkie de Jong', ['de jong', 'frenkie'], 'MED', 21, 'Países Bajos', 'Llegado del Ajax.'),
      J('Sergi Roberto', ['sergi roberto'], 'MED', 20, 'España', 'Jugó en la banda derecha.'),
      J('Luis Suárez', ['suarez'], 'DEL', 9, 'Uruguay', 'Marcó el segundo del Barça.'),
      J('Lionel Messi', ['messi', 'leo'], 'DEL', 10, 'Argentina', 'Ese verano pidió salir con un burofax.')
    ]),
    O('Bayern de Múnich', 'Hansi Flick', 'club', [
      J('Manuel Neuer', ['neuer'], 'POR', 1, 'Alemania', 'El capitán.'),
      J('Alphonso Davies', ['davies'], 'DEF', 19, 'Canadá', 'Su jugada por la banda acabó en el 5-2.'),
      J('David Alaba', ['alaba'], 'DEF', 27, 'Austria', 'Marcó en propia puerta.'),
      J('Jérôme Boateng', ['boateng'], 'DEF', 17, 'Alemania', 'Central alemán.'),
      J('Joshua Kimmich', ['kimmich'], 'DEF', 32, 'Alemania', 'Lateral derecho; marcó el 5-2.'),
      J('Leon Goretzka', ['goretzka'], 'MED', 18, 'Alemania', 'Centrocampista alemán.'),
      J('Thiago Alcântara', ['thiago', 'thiago alcantara'], 'MED', 6, 'España', 'Canterano del rival.'),
      J('Ivan Perišić', ['perisic'], 'DEL', 14, 'Croacia', 'Cedido por el Inter; marcó el 2-1.'),
      J('Thomas Müller', ['muller'], 'DEL', 25, 'Alemania', 'Marcó dos goles.'),
      J('Serge Gnabry', ['gnabry'], 'DEL', 22, 'Alemania', 'Extremo alemán.'),
      J('Robert Lewandowski', ['lewandowski', 'lewy'], 'DEL', 9, 'Polonia', 'Marcó el séptimo de cabeza.')
    ])
  ] },
  { id: 'mundial2014espana', partido: 'Mundial 2014 · España 1-5 Países Bajos', onces: [
    O('España', 'Vicente del Bosque', 'seleccion', [
      J('Iker Casillas', ['casillas', 'iker'], 'POR', 1, 'Real Madrid', 'El capitán; tuvo una noche negra.'),
      J('Jordi Alba', ['alba', 'jordi alba'], 'DEF', 18, 'Barcelona', 'Lateral izquierdo.'),
      J('Sergio Ramos', ['ramos'], 'DEF', 15, 'Real Madrid', 'Central sevillano.'),
      J('Gerard Piqué', ['pique'], 'DEF', 3, 'Barcelona', 'Central del Barça.'),
      J('César Azpilicueta', ['azpilicueta', 'azpi'], 'DEF', 22, 'Chelsea', 'Lateral derecho del Chelsea.'),
      J('Sergio Busquets', ['busquets'], 'MED', 16, 'Barcelona', 'Mediocentro del Barça.'),
      J('Xabi Alonso', ['xabi', 'alonso'], 'MED', 14, 'Real Madrid', 'Marcó de penalti el 1-0.'),
      J('Andrés Iniesta', ['iniesta'], 'MED', 6, 'Barcelona', 'Interior del Barça.'),
      J('Xavi Hernández', ['xavi'], 'MED', 8, 'Barcelona', 'Su último Mundial.'),
      J('David Silva', ['silva', 'david silva'], 'MED', 21, 'Manchester City', 'Falló un mano a mano con 1-0.'),
      J('Diego Costa', ['costa', 'diego costa'], 'DEL', 19, 'Atlético de Madrid', 'Nacido en Brasil; provocó el penalti.')
    ]),
    O('Países Bajos', 'Louis van Gaal', 'seleccion', [
      J('Jasper Cillessen', ['cillessen'], 'POR', 1, 'Ajax', 'Portero del Ajax.'),
      J('Daley Blind', ['blind'], 'DEF', 5, 'Ajax', 'Carrilero izquierdo; dio dos asistencias.'),
      J('Bruno Martins Indi', ['martins indi'], 'DEF', 4, 'Feyenoord', 'Central zurdo.'),
      J('Ron Vlaar', ['vlaar'], 'DEF', 2, 'Aston Villa', 'Central del Aston Villa.'),
      J('Stefan de Vrij', ['de vrij'], 'DEF', 3, 'Feyenoord', 'Marcó el 3-1 de cabeza.'),
      J('Daryl Janmaat', ['janmaat'], 'DEF', 7, 'Feyenoord', 'Carrilero derecho.'),
      J('Jonathan de Guzmán', ['de guzman'], 'MED', 8, 'Swansea', 'Nacido en Canadá; jugó en el Mallorca.'),
      J('Nigel de Jong', ['de jong', 'nigel'], 'MED', 6, 'Milan', 'Famoso por su patada en la final de 2010.'),
      J('Wesley Sneijder', ['sneijder'], 'MED', 10, 'Galatasaray', 'Exjugador del Real Madrid.'),
      J('Robin van Persie', ['van persie', 'rvp'], 'DEL', 9, 'Manchester United', 'Marcó un cabezazo en plancha.'),
      J('Arjen Robben', ['robben'], 'DEL', 11, 'Bayern de Múnich', 'Marcó dos goles.')
    ])
  ] },
  { id: 'mundial2018iberico', partido: 'Mundial 2018 · Portugal 3-3 España', onces: [
    O('Portugal', 'Fernando Santos', 'seleccion', [
      J('Rui Patrício', ['rui patricio', 'patricio'], 'POR', 1, 'Sporting de Portugal', 'Portero del Sporting.'),
      J('Raphaël Guerreiro', ['guerreiro'], 'DEF', 5, 'Borussia Dortmund', 'Lateral izquierdo nacido en Francia.'),
      J('José Fonte', ['fonte'], 'DEF', 6, 'Dalian Yifang', 'Central que jugaba en China.'),
      J('Pepe', ['pepe'], 'DEF', 3, 'Beşiktaş', 'Exjugador del Real Madrid.'),
      J('Cédric Soares', ['cedric'], 'DEF', 21, 'Southampton', 'Lateral derecho.'),
      J('William Carvalho', ['william carvalho', 'william'], 'MED', 14, 'Sporting de Portugal', 'Luego fichó por el Betis.'),
      J('João Moutinho', ['moutinho'], 'MED', 8, 'Mónaco', 'Centrocampista veterano.'),
      J('Bruno Fernandes', ['bruno fernandes', 'bruno'], 'MED', 16, 'Sporting de Portugal', 'Centrocampista del Sporting.'),
      J('Bernardo Silva', ['bernardo'], 'MED', 11, 'Manchester City', 'Centrocampista del City.'),
      J('Gonçalo Guedes', ['guedes'], 'DEL', 17, 'Valencia', 'Cedido por el PSG.'),
      J('Cristiano Ronaldo', ['cristiano', 'ronaldo', 'cr7'], 'DEL', 7, 'Real Madrid', 'Marcó un hat-trick, el último de falta.')
    ]),
    O('España', 'Fernando Hierro', 'seleccion', [
      J('David de Gea', ['de gea'], 'POR', 1, 'Manchester United', 'Se le escapó el disparo del 2-1.'),
      J('Jordi Alba', ['alba', 'jordi alba'], 'DEF', 18, 'Barcelona', 'Lateral izquierdo.'),
      J('Gerard Piqué', ['pique'], 'DEF', 3, 'Barcelona', 'Central del Barça.'),
      J('Sergio Ramos', ['ramos'], 'DEF', 15, 'Real Madrid', 'El capitán.'),
      J('Nacho Fernández', ['nacho'], 'DEF', 4, 'Real Madrid', 'Lateral derecho; marcó un golazo de volea.'),
      J('Sergio Busquets', ['busquets'], 'MED', 5, 'Barcelona', 'Dio de cabeza el pase del 2-2.'),
      J('Koke', ['koke'], 'MED', 8, 'Atlético de Madrid', 'Centrocampista del Atlético.'),
      J('Andrés Iniesta', ['iniesta'], 'MED', 6, 'Barcelona', 'Ya había anunciado su marcha a Japón.'),
      J('Isco', ['isco', 'isco alarcon'], 'MED', 22, 'Real Madrid', 'Mediapunta malagueño.'),
      J('David Silva', ['silva', 'david silva'], 'MED', 21, 'Manchester City', 'Centrocampista canario.'),
      J('Diego Costa', ['costa', 'diego costa'], 'DEL', 19, 'Atlético de Madrid', 'Marcó dos goles.')
    ])
  ] },
  { id: 'euro2024semi', partido: 'Semifinal de la Eurocopa 2024 · España 2-1 Francia', onces: [
    O('España', 'Luis de la Fuente', 'seleccion', [
      J('Unai Simón', ['unai simon', 'simon'], 'POR', 23, 'Athletic Club', 'Portero del Athletic.'),
      J('Marc Cucurella', ['cucurella'], 'DEF', 24, 'Chelsea', 'Lateral izquierdo.'),
      J('Aymeric Laporte', ['laporte'], 'DEF', 14, 'Al-Nassr', 'Central nacido en Francia.'),
      J('Nacho Fernández', ['nacho'], 'DEF', 4, 'Al-Qadsiah', 'Suplió al sancionado Le Normand.'),
      J('Jesús Navas', ['navas', 'jesus navas'], 'DEF', 22, 'Sevilla', 'Suplió al sancionado Carvajal con 38 años.'),
      J('Fabián Ruiz', ['fabian', 'fabian ruiz'], 'MED', 8, 'PSG', 'Centrocampista sevillano.'),
      J('Rodri', ['rodri', 'rodrigo hernandez'], 'MED', 16, 'Manchester City', 'Mediocentro; ese año ganó el Balón de Oro.'),
      J('Dani Olmo', ['olmo'], 'MED', 10, 'Leipzig', 'Marcó el 2-1.'),
      J('Nico Williams', ['nico', 'nico williams'], 'DEL', 17, 'Athletic Club', 'Extremo del Athletic.'),
      J('Álvaro Morata', ['morata'], 'DEL', 7, 'Atlético de Madrid', 'El capitán.'),
      J('Lamine Yamal', ['lamine', 'yamal'], 'DEL', 19, 'Barcelona', 'Marcó un golazo con 16 años.')
    ]),
    O('Francia', 'Didier Deschamps', 'seleccion', [
      J('Mike Maignan', ['maignan'], 'POR', 16, 'Milan', 'Portero del Milan.'),
      J('Theo Hernández', ['theo', 'theo hernandez'], 'DEF', 22, 'Milan', 'Lateral izquierdo nacido en Marsella.'),
      J('Dayot Upamecano', ['upamecano'], 'DEF', 4, 'Bayern de Múnich', 'Central del Bayern.'),
      J('William Saliba', ['saliba'], 'DEF', 17, 'Arsenal', 'Central del Arsenal.'),
      J('Jules Koundé', ['kounde'], 'DEF', 5, 'Barcelona', 'Lateral derecho del Barça.'),
      J('Eduardo Camavinga', ['camavinga'], 'MED', 6, 'Real Madrid', 'Suplió al sancionado Rabiot.'),
      J('Aurélien Tchouaméni', ['tchouameni'], 'MED', 8, 'Real Madrid', 'Mediocentro del Real Madrid.'),
      J("N'Golo Kanté", ['kante'], 'MED', 13, 'Al-Ittihad', 'Volvía a la selección desde Arabia Saudí.'),
      J('Ousmane Dembélé', ['dembele'], 'DEL', 11, 'PSG', 'Exjugador del Barça.'),
      J('Randal Kolo Muani', ['kolo muani'], 'DEL', 12, 'PSG', 'Marcó el 0-1 de cabeza.'),
      J('Kylian Mbappé', ['mbappe'], 'DEL', 10, 'Real Madrid', 'Jugó con máscara por una fractura de nariz.')
    ])
  ] },
  { id: 'mundial2022semi', partido: 'Semifinal del Mundial 2022 · Argentina 3-0 Croacia', onces: [
    O('Argentina', 'Lionel Scaloni', 'seleccion', [
      J('Emiliano Martínez', ['dibu', 'emiliano martinez'], 'POR', 23, 'Aston Villa', 'Portero del Aston Villa.'),
      J('Nicolás Tagliafico', ['tagliafico'], 'DEF', 3, 'Olympique Lyon', 'Lateral izquierdo.'),
      J('Nicolás Otamendi', ['otamendi'], 'DEF', 19, 'Benfica', 'Exjugador del Valencia.'),
      J('Cristian Romero', ['cuti', 'romero'], 'DEF', 13, 'Tottenham', 'Central del Tottenham.'),
      J('Nahuel Molina', ['molina'], 'DEF', 26, 'Atlético de Madrid', 'Lateral derecho del Atlético.'),
      J('Alexis Mac Allister', ['mac allister'], 'MED', 20, 'Brighton', 'Centrocampista del Brighton.'),
      J('Enzo Fernández', ['enzo', 'enzo fernandez'], 'MED', 24, 'Benfica', 'Ganó el premio al mejor joven.'),
      J('Leandro Paredes', ['paredes'], 'MED', 5, 'Juventus', 'Mediocentro de la Juventus.'),
      J('Rodrigo De Paul', ['de paul'], 'MED', 7, 'Atlético de Madrid', 'Centrocampista del Atlético.'),
      J('Lionel Messi', ['messi', 'leo'], 'DEL', 10, 'PSG', 'Marcó de penalti y dio el 3-0 tras regatear a Gvardiol.'),
      J('Julián Álvarez', ['julian', 'julian alvarez', 'arana'], 'DEL', 9, 'Manchester City', 'Marcó dos goles.')
    ]),
    O('Croacia', 'Zlatko Dalić', 'seleccion', [
      J('Dominik Livaković', ['livakovic'], 'POR', 1, 'Dinamo Zagreb', 'Paró tres penaltis a Japón.'),
      J('Borna Sosa', ['sosa'], 'DEF', 19, 'Stuttgart', 'Lateral izquierdo.'),
      J('Joško Gvardiol', ['gvardiol'], 'DEF', 20, 'Leipzig', 'Central que jugó con máscara.'),
      J('Dejan Lovren', ['lovren'], 'DEF', 6, 'Zenit', 'Exjugador del Liverpool.'),
      J('Josip Juranović', ['juranovic'], 'DEF', 22, 'Celtic', 'Lateral derecho del Celtic.'),
      J('Mateo Kovačić', ['kovacic'], 'MED', 8, 'Chelsea', 'Exjugador del Real Madrid.'),
      J('Marcelo Brozović', ['brozovic'], 'MED', 11, 'Inter', 'Mediocentro del Inter.'),
      J('Luka Modrić', ['modric'], 'MED', 10, 'Real Madrid', 'El capitán.'),
      J('Mario Pašalić', ['pasalic'], 'DEL', 15, 'Atalanta', 'Centrocampista de la Atalanta.'),
      J('Andrej Kramarić', ['kramaric'], 'DEL', 9, 'Hoffenheim', 'Delantero del Hoffenheim.'),
      J('Ivan Perišić', ['perisic'], 'DEL', 4, 'Tottenham', 'Extremo del Tottenham.')
    ])
  ] },
  { id: 'copa2011', partido: 'Final de la Copa del Rey 2011 · Real Madrid 1-0 Barcelona', onces: [
    O('Real Madrid', 'José Mourinho', 'club', [
      J('Iker Casillas', ['casillas', 'iker'], 'POR', 1, 'España', 'El capitán.'),
      J('Marcelo', ['marcelo'], 'DEF', 12, 'Brasil', 'Lateral izquierdo brasileño.'),
      J('Sergio Ramos', ['ramos'], 'DEF', 4, 'España', 'Se le cayó la copa desde el autobús.'),
      J('Ricardo Carvalho', ['carvalho'], 'DEF', 2, 'Portugal', 'Central portugués.'),
      J('Álvaro Arbeloa', ['arbeloa'], 'DEF', 17, 'España', 'Lateral derecho.'),
      J('Pepe', ['pepe'], 'MED', 3, 'Portugal', 'Central que jugó de mediocentro.'),
      J('Xabi Alonso', ['xabi', 'alonso'], 'MED', 14, 'España', 'Mediocentro vasco.'),
      J('Sami Khedira', ['khedira'], 'MED', 24, 'Alemania', 'Centrocampista alemán.'),
      J('Mesut Özil', ['ozil'], 'MED', 23, 'Alemania', 'Mediapunta alemán.'),
      J('Ángel Di María', ['di maria', 'fideo'], 'MED', 22, 'Argentina', 'Dio la asistencia del gol.'),
      J('Cristiano Ronaldo', ['cristiano', 'ronaldo', 'cr7'], 'DEL', 7, 'Portugal', 'Marcó de cabeza en la prórroga.')
    ]),
    O('Barcelona', 'Pep Guardiola', 'club', [
      J('José Manuel Pinto', ['pinto'], 'POR', 13, 'España', 'Portero de las copas.'),
      J('Adriano', ['adriano'], 'DEF', 21, 'Brasil', 'Lateral izquierdo brasileño.'),
      J('Javier Mascherano', ['mascherano'], 'DEF', 14, 'Argentina', 'Mediocentro que jugaba de central.'),
      J('Gerard Piqué', ['pique'], 'DEF', 3, 'España', 'Central canterano.'),
      J('Dani Alves', ['alves', 'dani alves'], 'DEF', 2, 'Brasil', 'Lateral derecho brasileño.'),
      J('Andrés Iniesta', ['iniesta'], 'MED', 8, 'España', 'Interior manchego.'),
      J('Sergio Busquets', ['busquets'], 'MED', 16, 'España', 'Mediocentro.'),
      J('Xavi Hernández', ['xavi'], 'MED', 6, 'España', 'Centrocampista.'),
      J('David Villa', ['villa'], 'DEL', 7, 'España', 'Exjugador del Valencia.'),
      J('Lionel Messi', ['messi', 'leo'], 'DEL', 10, 'Argentina', 'Jugó de «falso nueve».'),
      J('Pedro Rodríguez', ['pedro'], 'DEL', 17, 'España', 'Le anularon un gol por fuera de juego.')
    ])
  ] },
  { id: 'copaamerica2021', partido: 'Final de la Copa América 2021 · Brasil 0-1 Argentina', onces: [
    O('Brasil', 'Tite', 'seleccion', [
      J('Ederson', ['ederson'], 'POR', 23, 'Manchester City', 'Portero del City.'),
      J('Renan Lodi', ['lodi', 'renan lodi'], 'DEF', 16, 'Atlético de Madrid', 'Lateral izquierdo del Atlético.'),
      J('Marquinhos', ['marquinhos'], 'DEF', 4, 'PSG', 'Central del PSG.'),
      J('Thiago Silva', ['thiago silva'], 'DEF', 3, 'Chelsea', 'El capitán.'),
      J('Danilo', ['danilo'], 'DEF', 2, 'Juventus', 'Exjugador del Real Madrid.'),
      J('Fred', ['fred'], 'MED', 8, 'Manchester United', 'Centrocampista del United.'),
      J('Casemiro', ['casemiro'], 'MED', 5, 'Real Madrid', 'Mediocentro del Real Madrid.'),
      J('Lucas Paquetá', ['paqueta'], 'MED', 17, 'Olympique Lyon', 'Centrocampista del Lyon.'),
      J('Everton Soares', ['everton', 'cebolinha'], 'DEL', 19, 'Benfica', 'Apodado «Cebolinha».'),
      J('Richarlison', ['richarlison'], 'DEL', 7, 'Everton', 'Le anularon un gol.'),
      J('Neymar', ['neymar'], 'DEL', 10, 'PSG', 'Lloró abrazado a Messi al final.')
    ]),
    O('Argentina', 'Lionel Scaloni', 'seleccion', [
      J('Emiliano Martínez', ['dibu', 'emiliano martinez'], 'POR', 23, 'Aston Villa', 'Fue clave en la tanda de semifinales.'),
      J('Marcos Acuña', ['acuna'], 'DEF', 8, 'Sevilla', 'Lateral izquierdo del Sevilla.'),
      J('Nicolás Otamendi', ['otamendi'], 'DEF', 19, 'Benfica', 'Central veterano.'),
      J('Cristian Romero', ['cuti', 'romero'], 'DEF', 13, 'Atalanta', 'Central de la Atalanta.'),
      J('Gonzalo Montiel', ['montiel'], 'DEF', 4, 'River Plate', 'Lateral derecho de River.'),
      J('Giovani Lo Celso', ['lo celso'], 'MED', 20, 'Tottenham', 'Exjugador del Betis.'),
      J('Leandro Paredes', ['paredes'], 'MED', 5, 'PSG', 'Mediocentro del PSG.'),
      J('Rodrigo De Paul', ['de paul'], 'MED', 7, 'Udinese', 'Dio el pase largo del gol.'),
      J('Ángel Di María', ['di maria', 'fideo'], 'DEL', 11, 'PSG', 'Marcó el gol con una vaselina.'),
      J('Lionel Messi', ['messi', 'leo'], 'DEL', 10, 'Barcelona', 'Su primer título con la selección absoluta.'),
      J('Lautaro Martínez', ['lautaro'], 'DEL', 22, 'Inter', 'Delantero del Inter.')
    ])
  ] }
];
