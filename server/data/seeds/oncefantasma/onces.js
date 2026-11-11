// server/data/seeds/oncefantasma/onces.js
// «El Once Fantasma»: partidos históricos con los DOS onces titulares.
// Cada futbolista: [nombre, alias, posición, dorsal, dato, pista]. `dato`: su club (selecciones) o su país (clubes).
// En cada línea, los jugadores van de IZQUIERDA a DERECHA vistos desde la portería propia (lateral izquierdo primero).

const J = (nombre, alias, pos, dorsal, dato, pista) => ({ nombre, alias, pos, dorsal, dato, pista });
const O = (equipo, entrenador, tipo, jugadores) => ({ equipo, entrenador, tipo, jugadores });

export const PARTIDOS = [
  { id: 'mundial2010', partido: 'Final del Mundial 2010 · España 1-0 Holanda', onces: [
    O('España', 'Vicente del Bosque', 'seleccion', [
      J('Iker Casillas', ['casillas', 'iker'], 'POR', 1, 'Real Madrid', 'Capitán; le paró un mano a mano a Robben.'),
      J('Joan Capdevila', ['capdevila'], 'DEF', 11, 'Villarreal', 'Lateral izquierdo catalán.'),
      J('Carles Puyol', ['puyol'], 'DEF', 5, 'Barcelona', 'Marcó de cabeza el gol de la semifinal contra Alemania.'),
      J('Gerard Piqué', ['pique'], 'DEF', 3, 'Barcelona', 'Central formado en La Masía y en el Manchester United.'),
      J('Sergio Ramos', ['ramos'], 'DEF', 15, 'Real Madrid', 'Jugaba de lateral derecho; luego fue central.'),
      J('Andrés Iniesta', ['iniesta'], 'MED', 6, 'Barcelona', 'Marcó el gol de la final en el 116.'),
      J('Xabi Alonso', ['xabi', 'alonso'], 'MED', 14, 'Real Madrid', 'Se llevó una patada en el pecho de De Jong.'),
      J('Sergio Busquets', ['busquets'], 'MED', 16, 'Barcelona', 'Mediocentro; su padre fue portero del Barça.'),
      J('Xavi Hernández', ['xavi'], 'MED', 8, 'Barcelona', 'El cerebro del tiqui-taca.'),
      J('David Villa', ['villa'], 'DEL', 7, 'Barcelona', 'Máximo goleador de España en el torneo.'),
      J('Pedro Rodríguez', ['pedro'], 'DEL', 18, 'Barcelona', 'Canario; delantero de banda.')
    ]),
    O('Holanda', 'Bert van Marwijk', 'seleccion', [
      J('Maarten Stekelenburg', ['stekelenburg'], 'POR', 1, 'Ajax', 'Portero alto del Ajax.'),
      J('Giovanni van Bronckhorst', ['van bronckhorst', 'bronckhorst', 'gio'], 'DEF', 5, 'Feyenoord', 'Capitán en su último partido; había jugado en el Barça.'),
      J('Joris Mathijsen', ['mathijsen'], 'DEF', 4, 'Hamburgo', 'Central zurdo que jugaba en Alemania.'),
      J('John Heitinga', ['heitinga'], 'DEF', 3, 'Everton', 'Central expulsado en la prórroga.'),
      J('Gregory van der Wiel', ['van der wiel'], 'DEF', 2, 'Ajax', 'Lateral derecho joven.'),
      J('Robin van Persie', ['van persie', 'persie'], 'DEL', 9, 'Arsenal', 'Delantero zurdo de los Gunners.'),
      J('Dirk Kuyt', ['kuyt'], 'MED', 7, 'Liverpool', 'Incansable extremo del Liverpool.'),
      J('Mark van Bommel', ['van bommel', 'bommel'], 'MED', 6, 'Bayern de Múnich', 'Mediocentro duro; yerno del seleccionador.'),
      J('Wesley Sneijder', ['sneijder'], 'MED', 10, 'Inter', 'Acababa de ganar el triplete con el Inter.'),
      J('Nigel de Jong', ['de jong'], 'MED', 8, 'Manchester City', 'Le dio una patada en el pecho a Xabi Alonso.'),
      J('Arjen Robben', ['robben'], 'MED', 11, 'Bayern de Múnich', 'Falló un mano a mano con Casillas.')
    ])
  ] },
  { id: 'champions2011', partido: 'Final de la Champions 2011 · Barcelona 3-1 Manchester United', onces: [
    O('Barcelona', 'Pep Guardiola', 'club', [
      J('Víctor Valdés', ['valdes'], 'POR', 1, 'España', 'Portero de la cantera.'),
      J('Éric Abidal', ['abidal'], 'DEF', 22, 'Francia', 'Levantó la copa tras superar un cáncer.'),
      J('Javier Mascherano', ['mascherano'], 'DEF', 14, 'Argentina', 'Mediocentro reconvertido a central.'),
      J('Gerard Piqué', ['pique'], 'DEF', 3, 'España', 'Central que volvió del Manchester United.'),
      J('Dani Alves', ['alves'], 'DEF', 2, 'Brasil', 'Lateral derecho que llegó del Sevilla.'),
      J('Andrés Iniesta', ['iniesta'], 'MED', 8, 'España', 'Manchego de Fuentealbilla.'),
      J('Sergio Busquets', ['busquets'], 'MED', 16, 'España', 'Mediocentro canterano.'),
      J('Xavi Hernández', ['xavi'], 'MED', 6, 'España', 'El cerebro del equipo.'),
      J('David Villa', ['villa'], 'DEL', 7, 'España', 'Marcó el tercero con una rosca a la escuadra.'),
      J('Lionel Messi', ['messi', 'leo'], 'DEL', 10, 'Argentina', 'Marcó el segundo gol desde fuera del área.'),
      J('Pedro Rodríguez', ['pedro'], 'DEL', 17, 'España', 'Marcó el primer gol de la final.')
    ]),
    O('Manchester United', 'Alex Ferguson', 'club', [
      J('Edwin van der Sar', ['van der sar'], 'POR', 1, 'Países Bajos', 'Portero veterano en su último partido.'),
      J('Patrice Evra', ['evra'], 'DEF', 3, 'Francia', 'Lateral izquierdo y capitán de su selección.'),
      J('Nemanja Vidić', ['vidic'], 'DEF', 15, 'Serbia', 'Central y capitán del equipo.'),
      J('Rio Ferdinand', ['ferdinand', 'rio'], 'DEF', 5, 'Inglaterra', 'Central elegante llegado del Leeds.'),
      J('Fábio da Silva', ['fabio'], 'DEF', 20, 'Brasil', 'Lateral derecho; tiene un hermano gemelo en el club.'),
      J('Park Ji-sung', ['park', 'ji sung'], 'MED', 13, 'Corea del Sur', 'Centrocampista incansable.'),
      J('Ryan Giggs', ['giggs'], 'MED', 11, 'Gales', 'Leyenda galesa con más de 900 partidos en el club.'),
      J('Michael Carrick', ['carrick'], 'MED', 16, 'Inglaterra', 'Mediocentro llegado del Tottenham.'),
      J('Antonio Valencia', ['valencia'], 'MED', 25, 'Ecuador', 'Extremo derecho ecuatoriano.'),
      J('Wayne Rooney', ['rooney'], 'DEL', 10, 'Inglaterra', 'Marcó el gol del United.'),
      J('Javier Hernández', ['chicharito', 'hernandez'], 'DEL', 14, 'México', 'El «Chicharito».')
    ])
  ] },
  { id: 'champions2014', partido: 'Final de la Champions 2014 · Real Madrid 4-1 Atlético', onces: [
    O('Real Madrid', 'Carlo Ancelotti', 'club', [
      J('Iker Casillas', ['casillas', 'iker'], 'POR', 1, 'España', 'Falló en el gol de Godín.'),
      J('Fábio Coentrão', ['coentrao'], 'DEF', 5, 'Portugal', 'Lateral izquierdo que llegó del Benfica.'),
      J('Sergio Ramos', ['ramos'], 'DEF', 4, 'España', 'Empató en el minuto 92:48.'),
      J('Raphaël Varane', ['varane'], 'DEF', 2, 'Francia', 'Central fichado del Lens con 18 años.'),
      J('Dani Carvajal', ['carvajal'], 'DEF', 15, 'España', 'Lateral canterano que volvió del Leverkusen.'),
      J('Ángel Di María', ['di maria', 'dimaria'], 'MED', 22, 'Argentina', 'Su jugada acabó en el 2-1 de Bale.'),
      J('Sami Khedira', ['khedira'], 'MED', 6, 'Alemania', 'Volvía de una lesión de rodilla.'),
      J('Luka Modrić', ['modric'], 'MED', 19, 'Croacia', 'Botó el córner del gol de Ramos.'),
      J('Cristiano Ronaldo', ['cristiano', 'ronaldo'], 'DEL', 7, 'Portugal', 'Marcó el 4-1 de penalti y se quitó la camiseta.'),
      J('Karim Benzema', ['benzema'], 'DEL', 9, 'Francia', 'Delantero centro llegado del Lyon.'),
      J('Gareth Bale', ['bale'], 'DEL', 11, 'Gales', 'Marcó de cabeza el 2-1 en la prórroga.')
    ]),
    O('Atlético de Madrid', 'Diego Simeone', 'club', [
      J('Thibaut Courtois', ['courtois'], 'POR', 13, 'Bélgica', 'Portero cedido por el Chelsea.'),
      J('Filipe Luís', ['filipe', 'filipe luis'], 'DEF', 3, 'Brasil', 'Lateral izquierdo brasileño.'),
      J('Diego Godín', ['godin'], 'DEF', 2, 'Uruguay', 'Marcó de cabeza el 1-0.'),
      J('Miranda', ['miranda'], 'DEF', 23, 'Brasil', 'Central brasileño conocido por su apellido.'),
      J('Juanfran Torres', ['juanfran'], 'DEF', 20, 'España', 'Lateral derecho que había sido extremo.'),
      J('Koke', ['koke'], 'MED', 6, 'España', 'Centrocampista canterano.'),
      J('Gabi Fernández', ['gabi'], 'MED', 14, 'España', 'Capitán del equipo.'),
      J('Tiago Mendes', ['tiago'], 'MED', 5, 'Portugal', 'Mediocentro portugués veterano.'),
      J('Raúl García', ['raul garcia'], 'MED', 8, 'España', 'Navarro; luego leyenda del Athletic.'),
      J('David Villa', ['villa'], 'DEL', 9, 'España', 'Máximo goleador histórico de España.'),
      J('Diego Costa', ['diego costa', 'costa'], 'DEL', 19, 'España', 'Se lesionó a los nueve minutos.')
    ])
  ] },
  { id: 'champions2005', partido: 'Final de la Champions 2005 · Liverpool 3-3 Milan (penaltis)', onces: [
    O('Liverpool', 'Rafa Benítez', 'club', [
      J('Jerzy Dudek', ['dudek'], 'POR', 1, 'Polonia', 'Hizo bailes en la línea en los penaltis.'),
      J('Djimi Traoré', ['traore'], 'DEF', 21, 'Mali', 'Lateral izquierdo nacido en Francia.'),
      J('Sami Hyypiä', ['hyypia'], 'DEF', 4, 'Finlandia', 'Central nórdico muy alto.'),
      J('Jamie Carragher', ['carragher'], 'DEF', 23, 'Inglaterra', 'Central de toda la vida del club.'),
      J('Steve Finnan', ['finnan'], 'DEF', 3, 'Irlanda', 'Lateral derecho; se lesionó en la primera parte.'),
      J('John Arne Riise', ['riise'], 'MED', 6, 'Noruega', 'Zurdo con un disparo tremendo.'),
      J('Xabi Alonso', ['xabi', 'alonso'], 'MED', 14, 'España', 'Marcó el 3-3 en el rechace de su penalti.'),
      J('Steven Gerrard', ['gerrard'], 'MED', 8, 'Inglaterra', 'Capitán; marcó el 3-1 de cabeza.'),
      J('Luis García', ['luis garcia', 'garcia'], 'MED', 10, 'España', 'Mediapunta catalán.'),
      J('Harry Kewell', ['kewell'], 'MED', 7, 'Australia', 'Se lesionó y lo cambiaron en la primera parte.'),
      J('Milan Baroš', ['baros'], 'DEL', 5, 'República Checa', 'Delantero; llevaba el dorsal 5.')
    ]),
    O('Milan', 'Carlo Ancelotti', 'club', [
      J('Dida', ['dida'], 'POR', 1, 'Brasil', 'Portero brasileño conocido por un solo nombre.'),
      J('Paolo Maldini', ['maldini'], 'DEF', 3, 'Italia', 'Capitán; marcó el 1-0 en el primer minuto.'),
      J('Alessandro Nesta', ['nesta'], 'DEF', 13, 'Italia', 'Central elegante llegado de la Lazio.'),
      J('Jaap Stam', ['stam'], 'DEF', 31, 'Países Bajos', 'Central holandés que había jugado en el United.'),
      J('Cafú', ['cafu'], 'DEF', 2, 'Brasil', 'Lateral derecho bicampeón del mundo.'),
      J('Clarence Seedorf', ['seedorf'], 'MED', 20, 'Países Bajos', 'Ganó la Champions con tres clubes distintos.'),
      J('Andrea Pirlo', ['pirlo'], 'MED', 21, 'Italia', 'Mediocentro organizador.'),
      J('Gennaro Gattuso', ['gattuso'], 'MED', 8, 'Italia', 'El «Rino», pulmón del equipo.'),
      J('Kaká', ['kaka'], 'MED', 22, 'Brasil', 'Mediapunta; Balón de Oro dos años después.'),
      J('Andriy Shevchenko', ['shevchenko'], 'DEL', 7, 'Ucrania', 'Falló el último penalti.'),
      J('Hernán Crespo', ['crespo'], 'DEL', 11, 'Argentina', 'Marcó dos goles en la primera parte.')
    ])
  ] },
  { id: 'mundial1998', partido: 'Final del Mundial 1998 · Francia 3-0 Brasil', onces: [
    O('Francia', 'Aimé Jacquet', 'seleccion', [
      J('Fabien Barthez', ['barthez'], 'POR', 16, 'Mónaco', 'Blanc le besaba la calva antes de cada partido.'),
      J('Bixente Lizarazu', ['lizarazu'], 'DEF', 3, 'Bayern de Múnich', 'Lateral vasco-francés que jugó en el Athletic.'),
      J('Frank Leboeuf', ['leboeuf'], 'DEF', 18, 'Chelsea', 'Sustituyó al sancionado Blanc.'),
      J('Marcel Desailly', ['desailly'], 'DEF', 8, 'Milan', 'Nacido en Ghana; expulsado en la final.'),
      J('Lilian Thuram', ['thuram'], 'DEF', 15, 'Parma', 'Marcó los dos goles de la semifinal.'),
      J('Youri Djorkaeff', ['djorkaeff'], 'MED', 6, 'Inter', 'Mediapunta de origen armenio.'),
      J('Emmanuel Petit', ['petit'], 'MED', 17, 'Arsenal', 'Marcó el 3-0 en el descuento.'),
      J('Zinedine Zidane', ['zidane', 'zizou'], 'MED', 10, 'Juventus', 'Dos goles de cabeza en la final.'),
      J('Didier Deschamps', ['deschamps'], 'MED', 7, 'Juventus', 'El capitán; luego fue campeón como seleccionador.'),
      J('Christian Karembeu', ['karembeu'], 'MED', 19, 'Real Madrid', 'Nacido en Nueva Caledonia.'),
      J("Stéphane Guivarc'h", ['guivarch'], 'DEL', 9, 'Auxerre', 'Delantero centro que no marcó en todo el Mundial.')
    ]),
    O('Brasil', 'Mário Zagallo', 'seleccion', [
      J('Cláudio Taffarel', ['taffarel'], 'POR', 1, 'Atlético Mineiro', 'Héroe de las tandas de penaltis de 1994 y 1998.'),
      J('Roberto Carlos', ['roberto carlos'], 'DEF', 6, 'Real Madrid', 'Lateral izquierdo de las faltas imposibles.'),
      J('Júnior Baiano', ['junior baiano', 'baiano'], 'DEF', 4, 'Flamengo', 'Central del Flamengo.'),
      J('Aldair', ['aldair'], 'DEF', 3, 'Roma', 'Central veterano de la Roma.'),
      J('Cafú', ['cafu'], 'DEF', 2, 'Roma', 'Lateral derecho; jugó tres finales seguidas.'),
      J('Leonardo', ['leonardo'], 'MED', 18, 'Milan', 'Zurdo elegante; luego directivo del PSG.'),
      J('Dunga', ['dunga'], 'MED', 8, 'Júbilo Iwata', 'Capitán; jugaba en Japón.'),
      J('César Sampaio', ['cesar sampaio', 'sampaio'], 'MED', 5, 'Yokohama Flügels', 'Mediocentro que marcó en el partido inaugural.'),
      J('Rivaldo', ['rivaldo'], 'MED', 10, 'Barcelona', 'Balón de Oro al año siguiente.'),
      J('Bebeto', ['bebeto'], 'DEL', 20, 'Botafogo', 'Famoso por celebrar meciendo a un bebé en 1994.'),
      J('Ronaldo', ['ronaldo nazario', 'ronaldo'], 'DEL', 9, 'Inter', 'Sufrió una convulsión horas antes de la final.')
    ])
  ] },
  { id: 'mundial2022', partido: 'Final del Mundial 2022 · Argentina 3-3 Francia (penaltis)', onces: [
    O('Argentina', 'Lionel Scaloni', 'seleccion', [
      J('Emiliano Martínez', ['dibu', 'martinez', 'emiliano'], 'POR', 23, 'Aston Villa', 'El «Dibu»; paró un mano a mano a Kolo Muani en el 123.'),
      J('Nicolás Tagliafico', ['tagliafico'], 'DEF', 3, 'Olympique de Lyon', 'Lateral izquierdo.'),
      J('Nicolás Otamendi', ['otamendi'], 'DEF', 19, 'Benfica', 'Central veterano; jugó en el Valencia.'),
      J('Cristian Romero', ['romero', 'cuti'], 'DEF', 13, 'Tottenham', 'El «Cuti»; central.'),
      J('Nahuel Molina', ['molina'], 'DEF', 26, 'Atlético', 'Lateral derecho.'),
      J('Alexis Mac Allister', ['mac allister', 'macallister'], 'MED', 20, 'Brighton', 'Dio el pase del 2-0.'),
      J('Enzo Fernández', ['enzo'], 'MED', 24, 'Benfica', 'Mejor jugador joven del torneo.'),
      J('Rodrigo De Paul', ['de paul', 'depaul'], 'MED', 7, 'Atlético', 'El «guardaespaldas» de Messi.'),
      J('Ángel Di María', ['di maria', 'dimaria'], 'DEL', 11, 'Juventus', 'Provocó un penalti y marcó el 2-0.'),
      J('Julián Álvarez', ['julian', 'alvarez'], 'DEL', 9, 'Manchester City', 'La «Araña».'),
      J('Lionel Messi', ['messi', 'leo'], 'DEL', 10, 'PSG', 'Marcó dos goles y fue el mejor del torneo.')
    ]),
    O('Francia', 'Didier Deschamps', 'seleccion', [
      J('Hugo Lloris', ['lloris'], 'POR', 1, 'Tottenham', 'Capitán y portero del Tottenham.'),
      J('Theo Hernández', ['theo'], 'DEF', 22, 'Milan', 'Lateral izquierdo formado en el Atlético; su hermano también jugaba.'),
      J('Dayot Upamecano', ['upamecano'], 'DEF', 18, 'Bayern de Múnich', 'Central del Bayern.'),
      J('Raphaël Varane', ['varane'], 'DEF', 4, 'Manchester United', 'Central excampeón con el Madrid.'),
      J('Jules Koundé', ['kounde'], 'DEF', 5, 'Barcelona', 'Central que jugó de lateral derecho; venía del Sevilla.'),
      J('Adrien Rabiot', ['rabiot'], 'MED', 14, 'Juventus', 'Centrocampista zurdo de la Juve.'),
      J('Aurélien Tchouaméni', ['tchouameni'], 'MED', 8, 'Real Madrid', 'Mediocentro; falló un penalti en la tanda.'),
      J('Kylian Mbappé', ['mbappe'], 'DEL', 10, 'PSG', 'Marcó un hat-trick y perdió la final.'),
      J('Antoine Griezmann', ['griezmann'], 'DEL', 7, 'Atlético', 'Jugó de interior en el torneo.'),
      J('Olivier Giroud', ['giroud'], 'DEL', 9, 'Milan', 'Máximo goleador histórico de Francia.'),
      J('Ousmane Dembélé', ['dembele'], 'DEL', 11, 'Barcelona', 'Hizo un penalti a Di María.')
    ])
  ] },
  { id: 'mundial2002', partido: 'Final del Mundial 2002 · Brasil 2-0 Alemania', onces: [
    O('Brasil', 'Luiz Felipe Scolari', 'seleccion', [
      J('Marcos', ['marcos'], 'POR', 1, 'Palmeiras', 'Portero conocido solo por su nombre.'),
      J('Roque Júnior', ['roque junior', 'roque'], 'DEF', 4, 'Milan', 'Central; ganó la Champions de 2003.'),
      J('Edmílson', ['edmilson'], 'DEF', 5, 'Olympique de Lyon', 'Central que luego jugó en el Barça.'),
      J('Lúcio', ['lucio'], 'DEF', 3, 'Bayer Leverkusen', 'Central que jugaba en Alemania.'),
      J('Roberto Carlos', ['roberto carlos'], 'MED', 6, 'Real Madrid', 'Carrilero izquierdo de las faltas imposibles.'),
      J('Kléberson', ['kleberson'], 'MED', 15, 'Atlético Paranaense', 'Mediocentro que fichó por el United.'),
      J('Gilberto Silva', ['gilberto'], 'MED', 8, 'Atlético Mineiro', 'Mediocentro; luego, «invencible» del Arsenal.'),
      J('Cafú', ['cafu'], 'MED', 2, 'Roma', 'Capitán; jugó tres finales de Mundial seguidas.'),
      J('Rivaldo', ['rivaldo'], 'DEL', 10, 'Milan', 'Balón de Oro 1999.'),
      J('Ronaldo', ['ronaldo nazario', 'ronaldo'], 'DEL', 9, 'Inter', 'Marcó los dos goles de la final con un corte de pelo famoso.'),
      J('Ronaldinho', ['ronaldinho'], 'DEL', 11, 'PSG', 'Le marcó una falta a Seaman en cuartos.')
    ]),
    O('Alemania', 'Rudi Völler', 'seleccion', [
      J('Oliver Kahn', ['kahn'], 'POR', 1, 'Bayern de Múnich', 'Mejor jugador del torneo, pero falló en el 1-0.'),
      J('Christoph Metzelder', ['metzelder'], 'DEF', 21, 'Borussia Dortmund', 'Central joven del Dortmund.'),
      J('Carsten Ramelow', ['ramelow'], 'DEF', 5, 'Bayer Leverkusen', 'Líbero del Leverkusen.'),
      J('Thomas Linke', ['linke'], 'DEF', 2, 'Bayern de Múnich', 'Central del Bayern.'),
      J('Marco Bode', ['bode'], 'MED', 17, 'Werder Bremen', 'Carrilero izquierdo del Werder.'),
      J('Jens Jeremies', ['jeremies'], 'MED', 16, 'Bayern de Múnich', 'Mediocentro defensivo.'),
      J('Dietmar Hamann', ['hamann'], 'MED', 8, 'Liverpool', 'Mediocentro del Liverpool.'),
      J('Bernd Schneider', ['schneider'], 'MED', 19, 'Bayer Leverkusen', 'El «brasileño blanco» por su técnica.'),
      J('Torsten Frings', ['frings'], 'MED', 22, 'Werder Bremen', 'Carrilero derecho.'),
      J('Miroslav Klose', ['klose'], 'DEL', 11, 'Kaiserslautern', 'Marcó cinco goles de cabeza en el torneo.'),
      J('Oliver Neuville', ['neuville'], 'DEL', 7, 'Bayer Leverkusen', 'Delantero nacido en Suiza; tiró una falta al palo.')
    ])
  ] },
  { id: 'champions1999', partido: 'Final de la Champions 1999 · Manchester United 2-1 Bayern', onces: [
    O('Manchester United', 'Alex Ferguson', 'club', [
      J('Peter Schmeichel', ['schmeichel'], 'POR', 1, 'Dinamarca', 'Capitán en su último partido con el club.'),
      J('Denis Irwin', ['irwin'], 'DEF', 3, 'Irlanda', 'Lateral izquierdo de toda la década.'),
      J('Jaap Stam', ['stam'], 'DEF', 6, 'Países Bajos', 'Central llegado del PSV.'),
      J('Ronny Johnsen', ['johnsen'], 'DEF', 5, 'Noruega', 'Central nórdico.'),
      J('Gary Neville', ['gary neville', 'neville'], 'DEF', 2, 'Inglaterra', 'Lateral derecho canterano.'),
      J('Jesper Blomqvist', ['blomqvist'], 'MED', 15, 'Suecia', 'Extremo izquierdo sueco.'),
      J('Nicky Butt', ['butt'], 'MED', 8, 'Inglaterra', 'Mediocentro de la «clase del 92».'),
      J('David Beckham', ['beckham'], 'MED', 7, 'Inglaterra', 'Jugó de mediocentro por las sanciones; sacó los córners de los goles.'),
      J('Ryan Giggs', ['giggs'], 'MED', 11, 'Gales', 'Jugó por la derecha en la final.'),
      J('Dwight Yorke', ['yorke'], 'DEL', 19, 'Trinidad y Tobago', 'Delantero caribeño.'),
      J('Andy Cole', ['cole'], 'DEL', 9, 'Inglaterra', 'Delantero que formaba pareja con Yorke.')
    ]),
    O('Bayern de Múnich', 'Ottmar Hitzfeld', 'club', [
      J('Oliver Kahn', ['kahn'], 'POR', 1, 'Alemania', 'Portero de carácter volcánico.'),
      J('Michael Tarnat', ['tarnat'], 'DEF', 18, 'Alemania', 'Lateral izquierdo.'),
      J('Thomas Linke', ['linke'], 'DEF', 25, 'Alemania', 'Central.'),
      J('Lothar Matthäus', ['matthaus', 'matthaeus'], 'DEF', 10, 'Alemania', 'Líbero veterano; Balón de Oro en 1990.'),
      J('Samuel Kuffour', ['kuffour'], 'DEF', 4, 'Ghana', 'Central que acabó llorando sobre el césped.'),
      J('Markus Babbel', ['babbel'], 'DEF', 2, 'Alemania', 'Defensa que luego jugó en el Liverpool.'),
      J('Mario Basler', ['basler'], 'MED', 14, 'Alemania', 'Marcó el 0-1 de falta en el minuto 6.'),
      J('Stefan Effenberg', ['effenberg'], 'MED', 11, 'Alemania', 'Capitán y cerebro del equipo.'),
      J('Jens Jeremies', ['jeremies'], 'MED', 16, 'Alemania', 'Mediocentro defensivo.'),
      J('Alexander Zickler', ['zickler'], 'DEL', 21, 'Alemania', 'Delantero alemán.'),
      J('Carsten Jancker', ['jancker'], 'DEL', 19, 'Alemania', 'Delantero centro muy alto; estrelló una chilena en el larguero.')
    ])
  ] },
  { id: 'mundial2006', partido: 'Final del Mundial 2006 · Italia 1-1 Francia (penaltis)', onces: [
    O('Italia', 'Marcello Lippi', 'seleccion', [
      J('Gianluigi Buffon', ['buffon'], 'POR', 1, 'Juventus', 'Paró un cabezazo de Zidane en la prórroga.'),
      J('Fabio Grosso', ['grosso'], 'DEF', 3, 'Palermo', 'Marcó el último penalti.'),
      J('Marco Materazzi', ['materazzi'], 'DEF', 23, 'Inter', 'Marcó el empate y recibió el cabezazo de Zidane.'),
      J('Fabio Cannavaro', ['cannavaro'], 'DEF', 5, 'Juventus', 'Capitán; Balón de Oro ese año.'),
      J('Gianluca Zambrotta', ['zambrotta'], 'DEF', 19, 'Juventus', 'Lateral que fichó por el Barça ese verano.'),
      J('Simone Perrotta', ['perrotta'], 'MED', 20, 'Roma', 'Nacido en Inglaterra.'),
      J('Andrea Pirlo', ['pirlo'], 'MED', 21, 'Milan', 'Mejor jugador de la final.'),
      J('Francesco Totti', ['totti'], 'MED', 10, 'Roma', 'El «Pupone», capitán de la Roma.'),
      J('Gennaro Gattuso', ['gattuso'], 'MED', 8, 'Milan', '«Rino», el pulmón del centro del campo.'),
      J('Mauro Camoranesi', ['camoranesi'], 'MED', 16, 'Juventus', 'Nacido en Argentina.'),
      J('Luca Toni', ['toni'], 'DEL', 9, 'Fiorentina', 'Delantero que celebraba girándose la mano junto a la oreja.')
    ]),
    O('Francia', 'Raymond Domenech', 'seleccion', [
      J('Fabien Barthez', ['barthez'], 'POR', 16, 'Olympique de Marsella', 'Portero campeón del mundo en 1998.'),
      J('Éric Abidal', ['abidal'], 'DEF', 3, 'Olympique de Lyon', 'Lateral izquierdo; luego jugó en el Barça.'),
      J('William Gallas', ['gallas'], 'DEF', 5, 'Chelsea', 'Central del Chelsea.'),
      J('Lilian Thuram', ['thuram'], 'DEF', 15, 'Juventus', 'Central; jugador con más partidos de Francia.'),
      J('Willy Sagnol', ['sagnol'], 'DEF', 19, 'Bayern de Múnich', 'Lateral derecho del Bayern.'),
      J('Florent Malouda', ['malouda'], 'MED', 7, 'Olympique de Lyon', 'Extremo izquierdo; provocó el penalti del 1-0.'),
      J('Claude Makélélé', ['makelele'], 'MED', 6, 'Chelsea', 'Mediocentro defensivo; jugó en el Madrid.'),
      J('Patrick Vieira', ['vieira'], 'MED', 4, 'Juventus', 'Mediocentro; se lesionó en la final.'),
      J('Franck Ribéry', ['ribery'], 'MED', 22, 'Olympique de Marsella', 'Extremo joven; luego estrella del Bayern.'),
      J('Zinedine Zidane', ['zidane', 'zizou'], 'MED', 10, 'Real Madrid', 'Marcó a lo Panenka y fue expulsado por un cabezazo.'),
      J('Thierry Henry', ['henry'], 'DEL', 12, 'Arsenal', 'Delantero estrella del Arsenal.')
    ])
  ] },
  { id: 'mundial2014', partido: 'Final del Mundial 2014 · Alemania 1-0 Argentina', onces: [
    O('Alemania', 'Joachim Löw', 'seleccion', [
      J('Manuel Neuer', ['neuer'], 'POR', 1, 'Bayern de Múnich', 'Portero-líbero; Guante de Oro del torneo.'),
      J('Benedikt Höwedes', ['howedes', 'hoewedes'], 'DEF', 4, 'Schalke 04', 'Central que jugó de lateral izquierdo.'),
      J('Mats Hummels', ['hummels'], 'DEF', 5, 'Borussia Dortmund', 'Central que marcó a Francia en cuartos.'),
      J('Jérôme Boateng', ['boateng'], 'DEF', 20, 'Bayern de Múnich', 'Central; su hermano jugó con Ghana.'),
      J('Philipp Lahm', ['lahm'], 'DEF', 16, 'Bayern de Múnich', 'Capitán; se retiró de la selección tras la final.'),
      J('Mesut Özil', ['ozil', 'oezil'], 'MED', 8, 'Arsenal', 'Mediapunta que había jugado en el Madrid.'),
      J('Toni Kroos', ['kroos'], 'MED', 18, 'Bayern de Múnich', 'Fichó por el Real Madrid ese verano.'),
      J('Bastian Schweinsteiger', ['schweinsteiger'], 'MED', 7, 'Bayern de Múnich', 'Acabó la final con la cara ensangrentada.'),
      J('Christoph Kramer', ['kramer'], 'MED', 23, 'Borussia Mönchengladbach', 'Se conmocionó y no recordaba la final.'),
      J('Miroslav Klose', ['klose'], 'DEL', 11, 'Lazio', 'Máximo goleador de la historia de los Mundiales.'),
      J('Thomas Müller', ['muller', 'mueller'], 'DEL', 13, 'Bayern de Múnich', 'Bota de Plata del torneo.')
    ]),
    O('Argentina', 'Alejandro Sabella', 'seleccion', [
      J('Sergio Romero', ['romero', 'chiquito'], 'POR', 1, 'Mónaco', 'El «Chiquito»; héroe en los penaltis de la semifinal.'),
      J('Marcos Rojo', ['rojo'], 'DEF', 16, 'Sporting de Portugal', 'Lateral izquierdo; luego fue al United.'),
      J('Ezequiel Garay', ['garay'], 'DEF', 2, 'Benfica', 'Central que había jugado en el Racing y el Madrid.'),
      J('Martín Demichelis', ['demichelis'], 'DEF', 15, 'Manchester City', 'Central veterano; jugó en el Málaga.'),
      J('Pablo Zabaleta', ['zabaleta'], 'DEF', 4, 'Manchester City', 'Lateral derecho; jugó en el Espanyol.'),
      J('Lucas Biglia', ['biglia'], 'MED', 6, 'Lazio', 'Mediocentro de la Lazio.'),
      J('Javier Mascherano', ['mascherano'], 'MED', 14, 'Barcelona', 'El «Jefecito»; hizo un cruce decisivo en semifinales.'),
      J('Enzo Pérez', ['enzo perez'], 'MED', 8, 'Benfica', 'Centrocampista del Benfica; luego fue al Valencia.'),
      J('Ezequiel Lavezzi', ['lavezzi', 'pocho'], 'DEL', 22, 'PSG', 'El «Pocho».'),
      J('Gonzalo Higuaín', ['higuain', 'pipita'], 'DEL', 9, 'Napoli', 'Falló un mano a mano clarísimo en la final.'),
      J('Lionel Messi', ['messi', 'leo'], 'DEL', 10, 'Barcelona', 'Mejor jugador del torneo pese a perder la final.')
    ])
  ] },
  { id: 'euro2008', partido: 'Final de la Eurocopa 2008 · España 1-0 Alemania', onces: [
    O('España', 'Luis Aragonés', 'seleccion', [
      J('Iker Casillas', ['casillas', 'iker'], 'POR', 1, 'Real Madrid', 'Capitán; paró dos penaltis a Italia en cuartos.'),
      J('Joan Capdevila', ['capdevila'], 'DEF', 11, 'Villarreal', 'Lateral izquierdo.'),
      J('Carles Puyol', ['puyol'], 'DEF', 5, 'Barcelona', 'Central de melena.'),
      J('Carlos Marchena', ['marchena'], 'DEF', 4, 'Valencia', 'Central sevillano.'),
      J('Sergio Ramos', ['ramos'], 'DEF', 15, 'Real Madrid', 'Lateral derecho.'),
      J('David Silva', ['silva'], 'MED', 21, 'Valencia', 'Canario; luego leyenda del City.'),
      J('Xavi Hernández', ['xavi'], 'MED', 8, 'Barcelona', 'Mejor jugador del torneo.'),
      J('Marcos Senna', ['senna'], 'MED', 19, 'Villarreal', 'Mediocentro nacido en Brasil.'),
      J('Cesc Fàbregas', ['cesc', 'fabregas'], 'MED', 10, 'Arsenal', 'Marcó el último penalti contra Italia.'),
      J('Andrés Iniesta', ['iniesta'], 'MED', 6, 'Barcelona', 'Jugaba por la banda.'),
      J('Fernando Torres', ['torres'], 'DEL', 9, 'Liverpool', 'Marcó el gol de la final con una vaselina.')
    ]),
    O('Alemania', 'Joachim Löw', 'seleccion', [
      J('Jens Lehmann', ['lehmann'], 'POR', 1, 'Arsenal', 'Portero veterano del Arsenal.'),
      J('Philipp Lahm', ['lahm'], 'DEF', 16, 'Bayern de Múnich', 'Lateral izquierdo; Torres le ganó la carrera del gol.'),
      J('Christoph Metzelder', ['metzelder'], 'DEF', 21, 'Real Madrid', 'Central que jugaba en el Real Madrid.'),
      J('Per Mertesacker', ['mertesacker'], 'DEF', 17, 'Werder Bremen', 'Central altísimo.'),
      J('Arne Friedrich', ['friedrich'], 'DEF', 3, 'Hertha de Berlín', 'Lateral derecho del Hertha.'),
      J('Lukas Podolski', ['podolski'], 'MED', 20, 'Bayern de Múnich', 'Zurdo nacido en Polonia.'),
      J('Thomas Hitzlsperger', ['hitzlsperger'], 'MED', 15, 'Stuttgart', 'Mediocentro con un gran disparo.'),
      J('Michael Ballack', ['ballack'], 'MED', 13, 'Chelsea', 'Capitán; perdió también la final de la Champions ese año.'),
      J('Torsten Frings', ['frings'], 'MED', 8, 'Werder Bremen', 'Mediocentro duro.'),
      J('Bastian Schweinsteiger', ['schweinsteiger'], 'MED', 7, 'Bayern de Múnich', 'Extremo derecho joven.'),
      J('Miroslav Klose', ['klose'], 'DEL', 11, 'Bayern de Múnich', 'Único delantero.')
    ])
  ] },
  { id: 'champions2009', partido: 'Final de la Champions 2009 · Barcelona 2-0 Manchester United', onces: [
    O('Barcelona', 'Pep Guardiola', 'club', [
      J('Víctor Valdés', ['valdes'], 'POR', 1, 'España', 'Portero de la cantera.'),
      J('Sylvinho', ['sylvinho'], 'DEF', 16, 'Brasil', 'Lateral izquierdo en su último partido con el club.'),
      J('Gerard Piqué', ['pique'], 'DEF', 3, 'España', 'Jugó contra su exequipo.'),
      J('Yaya Touré', ['toure', 'yaya'], 'DEF', 24, 'Costa de Marfil', 'Mediocentro que jugó de central.'),
      J('Carles Puyol', ['puyol'], 'DEF', 5, 'España', 'Capitán; jugó de lateral derecho.'),
      J('Andrés Iniesta', ['iniesta'], 'MED', 8, 'España', 'Llegó a la final tras el «iniestazo» de Stamford Bridge.'),
      J('Sergio Busquets', ['busquets'], 'MED', 28, 'España', 'Mediocentro en su primera temporada.'),
      J('Xavi Hernández', ['xavi'], 'MED', 6, 'España', 'Dio el pase del 2-0.'),
      J('Thierry Henry', ['henry'], 'DEL', 14, 'Francia', 'Leyenda del Arsenal.'),
      J("Samuel Eto'o", ['etoo', 'eto o'], 'DEL', 9, 'Camerún', 'Marcó el 1-0 en el minuto 10.'),
      J('Lionel Messi', ['messi', 'leo'], 'DEL', 10, 'Argentina', 'Marcó de cabeza el 2-0.')
    ]),
    O('Manchester United', 'Alex Ferguson', 'club', [
      J('Edwin van der Sar', ['van der sar'], 'POR', 1, 'Países Bajos', 'Portero holandés veterano.'),
      J('Patrice Evra', ['evra'], 'DEF', 3, 'Francia', 'Lateral izquierdo.'),
      J('Nemanja Vidić', ['vidic'], 'DEF', 15, 'Serbia', 'Central duro.'),
      J('Rio Ferdinand', ['ferdinand', 'rio'], 'DEF', 5, 'Inglaterra', 'Central elegante.'),
      J("John O'Shea", ['oshea', 'o shea'], 'DEF', 22, 'Irlanda', 'Defensa polivalente irlandés.'),
      J('Ryan Giggs', ['giggs'], 'MED', 11, 'Gales', 'Leyenda galesa.'),
      J('Michael Carrick', ['carrick'], 'MED', 16, 'Inglaterra', 'Mediocentro inglés.'),
      J('Anderson', ['anderson'], 'MED', 8, 'Brasil', 'Centrocampista brasileño llegado del Oporto.'),
      J('Wayne Rooney', ['rooney'], 'DEL', 10, 'Inglaterra', 'Jugó escorado a la banda.'),
      J('Cristiano Ronaldo', ['cristiano', 'ronaldo'], 'DEL', 7, 'Portugal', 'Fichó por el Real Madrid ese verano.'),
      J('Park Ji-sung', ['park', 'ji sung'], 'DEL', 13, 'Corea del Sur', 'Incansable surcoreano.')
    ])
  ] },
  { id: 'champions2016', partido: 'Final de la Champions 2016 · Real Madrid 1-1 Atlético (penaltis)', onces: [
    O('Real Madrid', 'Zinedine Zidane', 'club', [
      J('Keylor Navas', ['keylor', 'navas'], 'POR', 1, 'Costa Rica', 'Portero costarricense.'),
      J('Marcelo', ['marcelo'], 'DEF', 12, 'Brasil', 'Lateral izquierdo brasileño.'),
      J('Sergio Ramos', ['ramos'], 'DEF', 4, 'España', 'Marcó el 1-0 en fuera de juego.'),
      J('Pepe', ['pepe'], 'DEF', 3, 'Portugal', 'Central nacido en Brasil.'),
      J('Dani Carvajal', ['carvajal'], 'DEF', 15, 'España', 'Se lesionó en la primera parte.'),
      J('Toni Kroos', ['kroos'], 'MED', 8, 'Alemania', 'Centrocampista alemán.'),
      J('Casemiro', ['casemiro'], 'MED', 14, 'Brasil', 'Mediocentro defensivo brasileño.'),
      J('Luka Modrić', ['modric'], 'MED', 19, 'Croacia', 'Centrocampista croata.'),
      J('Cristiano Ronaldo', ['cristiano', 'ronaldo'], 'DEL', 7, 'Portugal', 'Marcó el último penalti.'),
      J('Karim Benzema', ['benzema'], 'DEL', 9, 'Francia', 'Delantero centro.'),
      J('Gareth Bale', ['bale'], 'DEL', 11, 'Gales', 'Extremo galés.')
    ]),
    O('Atlético de Madrid', 'Diego Simeone', 'club', [
      J('Jan Oblak', ['oblak'], 'POR', 13, 'Eslovenia', 'Portero esloveno.'),
      J('Filipe Luís', ['filipe', 'filipe luis'], 'DEF', 3, 'Brasil', 'Lateral izquierdo brasileño.'),
      J('Diego Godín', ['godin'], 'DEF', 2, 'Uruguay', 'Central uruguayo.'),
      J('Stefan Savić', ['savic'], 'DEF', 15, 'Montenegro', 'Central montenegrino.'),
      J('Juanfran Torres', ['juanfran'], 'DEF', 20, 'España', 'Falló el único penalti de la tanda.'),
      J('Saúl Ñíguez', ['saul'], 'MED', 17, 'España', 'Centrocampista ilicitano.'),
      J('Augusto Fernández', ['augusto'], 'MED', 12, 'Argentina', 'Mediocentro argentino; se lesionó en la final.'),
      J('Gabi Fernández', ['gabi'], 'MED', 14, 'España', 'Capitán del equipo.'),
      J('Koke', ['koke'], 'MED', 6, 'España', 'Centrocampista canterano.'),
      J('Antoine Griezmann', ['griezmann'], 'DEL', 7, 'Francia', 'Falló un penalti en el partido.'),
      J('Fernando Torres', ['torres'], 'DEL', 9, 'España', 'Volvió al club en su etapa final.')
    ])
  ] },
  { id: 'euro2016', partido: 'Final de la Eurocopa 2016 · Portugal 1-0 Francia', onces: [
    O('Portugal', 'Fernando Santos', 'seleccion', [
      J('Rui Patrício', ['patricio', 'rui patricio'], 'POR', 1, 'Sporting de Portugal', 'Portero; luego jugó en la Roma.'),
      J('Raphaël Guerreiro', ['guerreiro'], 'DEF', 5, 'Lorient', 'Lateral izquierdo nacido en Francia.'),
      J('José Fonte', ['fonte'], 'DEF', 4, 'Southampton', 'Central.'),
      J('Pepe', ['pepe'], 'DEF', 3, 'Real Madrid', 'Central nacido en Brasil.'),
      J('Cédric Soares', ['cedric'], 'DEF', 21, 'Southampton', 'Lateral derecho.'),
      J('João Mário', ['joao mario'], 'MED', 10, 'Sporting de Portugal', 'Fichó por el Inter ese verano.'),
      J('Adrien Silva', ['adrien'], 'MED', 23, 'Sporting de Portugal', 'Mediocentro nacido en Francia.'),
      J('William Carvalho', ['william', 'carvalho'], 'MED', 14, 'Sporting de Portugal', 'Mediocentro; luego jugó en el Betis.'),
      J('Renato Sanches', ['renato', 'sanches'], 'MED', 16, 'Benfica', 'Mejor jugador joven del torneo.'),
      J('Cristiano Ronaldo', ['cristiano', 'ronaldo'], 'DEL', 7, 'Real Madrid', 'Se lesionó en el minuto 25 y dirigió desde la banda.'),
      J('Nani', ['nani'], 'DEL', 17, 'Valencia', 'Extremo que había jugado en el United.')
    ]),
    O('Francia', 'Didier Deschamps', 'seleccion', [
      J('Hugo Lloris', ['lloris'], 'POR', 1, 'Tottenham', 'Capitán y portero.'),
      J('Patrice Evra', ['evra'], 'DEF', 3, 'Juventus', 'Lateral izquierdo veterano.'),
      J('Laurent Koscielny', ['koscielny'], 'DEF', 21, 'Arsenal', 'Central del Arsenal.'),
      J('Samuel Umtiti', ['umtiti'], 'DEF', 22, 'Olympique de Lyon', 'Central que fichó por el Barça ese verano.'),
      J('Bacary Sagna', ['sagna'], 'DEF', 19, 'Manchester City', 'Lateral derecho.'),
      J('Dimitri Payet', ['payet'], 'MED', 8, 'West Ham', 'Lesionó a Cristiano en una entrada.'),
      J('Blaise Matuidi', ['matuidi'], 'MED', 14, 'PSG', 'Centrocampista incansable.'),
      J('Paul Pogba', ['pogba'], 'MED', 15, 'Juventus', 'Fichó por el United por una cifra récord ese verano.'),
      J('Moussa Sissoko', ['sissoko'], 'MED', 18, 'Newcastle', 'Centrocampista potente; luego fue al Tottenham.'),
      J('Antoine Griezmann', ['griezmann'], 'MED', 7, 'Atlético', 'Máximo goleador del torneo.'),
      J('Olivier Giroud', ['giroud'], 'DEL', 9, 'Arsenal', 'Delantero centro.')
    ])
  ] },
  { id: 'champions2006', partido: 'Final de la Champions 2006 · Barcelona 2-1 Arsenal', onces: [
    O('Barcelona', 'Frank Rijkaard', 'club', [
      J('Víctor Valdés', ['valdes'], 'POR', 1, 'España', 'Paró un mano a mano decisivo a Henry.'),
      J('Giovanni van Bronckhorst', ['van bronckhorst', 'bronckhorst', 'gio'], 'DEF', 12, 'Países Bajos', 'Lateral izquierdo holandés.'),
      J('Rafael Márquez', ['marquez'], 'DEF', 4, 'México', 'Central mexicano, capitán de su selección.'),
      J('Carles Puyol', ['puyol'], 'DEF', 5, 'España', 'El capitán.'),
      J('Oleguer Presas', ['oleguer'], 'DEF', 23, 'España', 'Lateral derecho canterano.'),
      J('Mark van Bommel', ['van bommel', 'bommel'], 'MED', 17, 'Países Bajos', 'Mediocentro holandés; luego fue al Bayern.'),
      J('Edmílson', ['edmilson'], 'MED', 15, 'Brasil', 'Mediocentro brasileño; se lesionó y entró Iniesta.'),
      J('Deco', ['deco'], 'MED', 20, 'Portugal', 'Portugués nacido en Brasil; venía del Oporto.'),
      J('Ronaldinho', ['ronaldinho'], 'DEL', 10, 'Brasil', 'Balón de Oro de 2005.'),
      J("Samuel Eto'o", ['etoo', 'eto o'], 'DEL', 9, 'Camerún', 'Marcó el empate en el minuto 76.'),
      J('Ludovic Giuly', ['giuly'], 'DEL', 8, 'Francia', 'Extremo francés, pequeño y rápido.')
    ]),
    O('Arsenal', 'Arsène Wenger', 'club', [
      J('Jens Lehmann', ['lehmann'], 'POR', 1, 'Alemania', 'Fue expulsado en el minuto 18.'),
      J('Ashley Cole', ['cole', 'ashley cole'], 'DEF', 3, 'Inglaterra', 'Lateral izquierdo inglés.'),
      J('Sol Campbell', ['campbell'], 'DEF', 23, 'Inglaterra', 'Marcó de cabeza el 0-1.'),
      J('Kolo Touré', ['kolo', 'toure'], 'DEF', 28, 'Costa de Marfil', 'Central marfileño; hermano de Yaya.'),
      J('Emmanuel Eboué', ['eboue'], 'DEF', 27, 'Costa de Marfil', 'Lateral derecho marfileño.'),
      J('Robert Pirès', ['pires'], 'MED', 7, 'Francia', 'Fue sustituido por el portero suplente tras la expulsión.'),
      J('Gilberto Silva', ['gilberto'], 'MED', 19, 'Brasil', 'Mediocentro brasileño campeón del mundo.'),
      J('Cesc Fàbregas', ['cesc', 'fabregas'], 'MED', 15, 'España', 'Español de 19 años formado en La Masía.'),
      J('Freddie Ljungberg', ['ljungberg'], 'MED', 8, 'Suecia', 'Centrocampista sueco.'),
      J('Aleksandr Hleb', ['hleb'], 'MED', 13, 'Bielorrusia', 'Bielorruso; dos años después fichó por el Barça.'),
      J('Thierry Henry', ['henry'], 'DEL', 14, 'Francia', 'Máximo goleador de la historia del club.')
    ])
  ] },
  { id: 'champions2015', partido: 'Final de la Champions 2015 · Barcelona 3-1 Juventus', onces: [
    O('Barcelona', 'Luis Enrique', 'club', [
      J('Marc-André ter Stegen', ['ter stegen', 'stegen'], 'POR', 1, 'Alemania', 'Portero alemán que jugaba la Champions y la Copa.'),
      J('Jordi Alba', ['alba'], 'DEF', 18, 'España', 'Lateral izquierdo que volvió del Valencia.'),
      J('Javier Mascherano', ['mascherano'], 'DEF', 14, 'Argentina', 'Mediocentro reconvertido a central.'),
      J('Gerard Piqué', ['pique'], 'DEF', 3, 'España', 'Central canterano.'),
      J('Dani Alves', ['alves'], 'DEF', 22, 'Brasil', 'Lateral derecho brasileño.'),
      J('Andrés Iniesta', ['iniesta'], 'MED', 8, 'España', 'Dio el pase del 1-0.'),
      J('Sergio Busquets', ['busquets'], 'MED', 5, 'España', 'Mediocentro canterano.'),
      J('Ivan Rakitić', ['rakitic'], 'MED', 4, 'Croacia', 'Marcó el 1-0 en el minuto 4.'),
      J('Neymar', ['neymar'], 'DEL', 11, 'Brasil', 'Marcó el 3-1 en el descuento.'),
      J('Luis Suárez', ['suarez'], 'DEL', 9, 'Uruguay', 'Marcó el 2-1 tras un rechace.'),
      J('Lionel Messi', ['messi', 'leo'], 'DEL', 10, 'Argentina', 'Jugaba en la banda derecha del tridente.')
    ]),
    O('Juventus', 'Massimiliano Allegri', 'club', [
      J('Gianluigi Buffon', ['buffon'], 'POR', 1, 'Italia', 'Capitán veterano.'),
      J('Patrice Evra', ['evra'], 'DEF', 33, 'Francia', 'Lateral izquierdo francés que había jugado en el United.'),
      J('Leonardo Bonucci', ['bonucci'], 'DEF', 19, 'Italia', 'Central italiano.'),
      J('Andrea Barzagli', ['barzagli'], 'DEF', 15, 'Italia', 'Central campeón del mundo en 2006.'),
      J('Stephan Lichtsteiner', ['lichtsteiner'], 'DEF', 26, 'Suiza', 'Lateral derecho suizo.'),
      J('Paul Pogba', ['pogba'], 'MED', 6, 'Francia', 'Joven francés que había salido del United.'),
      J('Andrea Pirlo', ['pirlo'], 'MED', 21, 'Italia', 'Jugó su último gran partido europeo.'),
      J('Claudio Marchisio', ['marchisio'], 'MED', 8, 'Italia', 'Centrocampista turinés.'),
      J('Arturo Vidal', ['vidal'], 'MED', 23, 'Chile', 'Chileno; después jugó en el Barça.'),
      J('Carlos Tevez', ['tevez'], 'DEL', 10, 'Argentina', 'Delantero argentino.'),
      J('Álvaro Morata', ['morata'], 'DEL', 9, 'España', 'Español; marcó el 1-1.')
    ])
  ] },
  { id: 'champions2019', partido: 'Final de la Champions 2019 · Liverpool 2-0 Tottenham', onces: [
    O('Liverpool', 'Jürgen Klopp', 'club', [
      J('Alisson Becker', ['alisson'], 'POR', 13, 'Brasil', 'Portero brasileño fichado de la Roma.'),
      J('Andrew Robertson', ['robertson'], 'DEF', 26, 'Escocia', 'Lateral izquierdo escocés.'),
      J('Virgil van Dijk', ['van dijk', 'dijk'], 'DEF', 4, 'Países Bajos', 'Fue elegido mejor jugador de la final.'),
      J('Joël Matip', ['matip'], 'DEF', 32, 'Camerún', 'Central camerunés nacido en Alemania.'),
      J('Trent Alexander-Arnold', ['alexander arnold', 'trent', 'arnold'], 'DEF', 66, 'Inglaterra', 'Lateral derecho canterano con el dorsal 66.'),
      J('Georginio Wijnaldum', ['wijnaldum'], 'MED', 5, 'Países Bajos', 'Marcó dos goles al Barça en semifinales.'),
      J('Fabinho', ['fabinho'], 'MED', 3, 'Brasil', 'Mediocentro brasileño.'),
      J('Jordan Henderson', ['henderson'], 'MED', 14, 'Inglaterra', 'El capitán.'),
      J('Sadio Mané', ['mane'], 'DEL', 10, 'Senegal', 'Extremo senegalés.'),
      J('Roberto Firmino', ['firmino'], 'DEL', 9, 'Brasil', 'Delantero brasileño; volvía de lesión.'),
      J('Mohamed Salah', ['salah'], 'DEL', 11, 'Egipto', 'Marcó de penalti en el minuto 2.')
    ]),
    O('Tottenham', 'Mauricio Pochettino', 'club', [
      J('Hugo Lloris', ['lloris'], 'POR', 1, 'Francia', 'Capitán francés.'),
      J('Danny Rose', ['rose'], 'DEF', 3, 'Inglaterra', 'Lateral izquierdo.'),
      J('Jan Vertonghen', ['vertonghen'], 'DEF', 5, 'Bélgica', 'Central belga.'),
      J('Toby Alderweireld', ['alderweireld'], 'DEF', 4, 'Bélgica', 'Central belga que jugó en el Atlético.'),
      J('Kieran Trippier', ['trippier'], 'DEF', 2, 'Inglaterra', 'Lateral derecho; luego fichó por el Atlético.'),
      J('Moussa Sissoko', ['sissoko'], 'MED', 17, 'Francia', 'Le pitaron penalti por mano en el primer minuto.'),
      J('Harry Winks', ['winks'], 'MED', 8, 'Inglaterra', 'Mediocentro canterano.'),
      J('Son Heung-min', ['son'], 'MED', 7, 'Corea del Sur', 'Surcoreano; luego ganó la Europa League con el club.'),
      J('Christian Eriksen', ['eriksen'], 'MED', 23, 'Dinamarca', 'Danés; tenía un gran golpeo.'),
      J('Dele Alli', ['alli', 'dele'], 'MED', 20, 'Inglaterra', 'Mediapunta inglés.'),
      J('Harry Kane', ['kane'], 'DEL', 10, 'Inglaterra', 'Volvía de una lesión de tobillo.')
    ])
  ] }
];
