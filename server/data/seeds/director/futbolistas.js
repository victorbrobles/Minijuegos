// server/data/seeds/director/futbolistas.js
// Futbolistas de «Director Deportivo» (temporada 2025/26). Media y potencial son valoraciones aproximadas de juego;
// la edad es la de la temporada. El precio lo calcula el motor (media, edad y potencial).
// Formato: Nombre|posición|edad|media|potencial|país|club

const DATOS = `
Thibaut Courtois|POR|33|89|89|BEL|Real Madrid
Alisson Becker|POR|32|89|89|BRA|Liverpool
Gianluigi Donnarumma|POR|26|88|90|ITA|Man City
Marc-André ter Stegen|POR|33|86|86|GER|Barcelona
Jan Oblak|POR|32|87|87|SVN|Atlético
Mike Maignan|POR|30|87|88|FRA|Milan
Ederson|POR|31|85|85|BRA|Fenerbahçe
David Raya|POR|30|86|87|ESP|Arsenal
Joan García|POR|24|82|87|ESP|Barcelona
Unai Simón|POR|28|85|86|ESP|Athletic
Yann Sommer|POR|36|84|84|SUI|Inter
Gregor Kobel|POR|27|85|87|SUI|Dortmund
Guglielmo Vicario|POR|29|84|85|ITA|Tottenham
Diogo Costa|POR|26|84|87|POR|Oporto
Manuel Neuer|POR|39|85|85|GER|Bayern
André Onana|POR|29|80|81|CMR|Trabzonspor
Álex Remiro|POR|30|82|82|ESP|Real Sociedad
Lucas Chevalier|POR|24|82|87|FRA|PSG
Giorgi Mamardashvili|POR|25|82|87|GEO|Liverpool
Yassine Bounou|POR|34|83|83|MAR|Al Hilal
Andriy Lunin|POR|26|79|83|UKR|Real Madrid
Kepa Arrizabalaga|POR|31|79|79|ESP|Arsenal
Virgil van Dijk|DEF|34|89|89|NED|Liverpool
William Saliba|DEF|24|87|90|FRA|Arsenal
Rúben Dias|DEF|28|87|88|POR|Man City
Joško Gvardiol|DEF|23|85|89|CRO|Man City
Marquinhos|DEF|31|86|86|BRA|PSG
Achraf Hakimi|DEF|26|87|88|MAR|PSG
Nuno Mendes|DEF|23|86|90|POR|PSG
Willian Pacho|DEF|23|83|87|ECU|PSG
Antonio Rüdiger|DEF|32|86|86|GER|Real Madrid
Éder Militão|DEF|27|84|86|BRA|Real Madrid
Dean Huijsen|DEF|20|81|89|ESP|Real Madrid
Dani Carvajal|DEF|33|84|84|ESP|Real Madrid
Trent Alexander-Arnold|DEF|26|86|87|ENG|Real Madrid
Álvaro Carreras|DEF|22|81|86|ESP|Real Madrid
Pau Cubarsí|DEF|18|82|91|ESP|Barcelona
Ronald Araujo|DEF|26|84|86|URU|Barcelona
Jules Koundé|DEF|26|85|87|FRA|Barcelona
Alejandro Balde|DEF|21|82|87|ESP|Barcelona
Kim Min-jae|DEF|28|85|86|KOR|Bayern
Dayot Upamecano|DEF|26|84|86|FRA|Bayern
Alphonso Davies|DEF|24|84|87|CAN|Bayern
Jonathan Tah|DEF|29|85|85|GER|Bayern
Theo Hernández|DEF|27|85|86|FRA|Al Hilal
Alessandro Bastoni|DEF|26|86|88|ITA|Inter
Federico Dimarco|DEF|27|85|86|ITA|Inter
Gleison Bremer|DEF|28|85|86|BRA|Juventus
Riccardo Calafiori|DEF|23|82|86|ITA|Arsenal
Gabriel Magalhães|DEF|27|86|87|BRA|Arsenal
Ben White|DEF|27|83|84|ENG|Arsenal
Jurriën Timber|DEF|24|83|86|NED|Arsenal
Piero Hincapié|DEF|23|82|86|ECU|Arsenal
Ibrahima Konaté|DEF|26|84|86|FRA|Liverpool
Andrew Robertson|DEF|31|84|84|SCO|Liverpool
Jeremie Frimpong|DEF|24|84|87|NED|Liverpool
Milos Kerkez|DEF|21|80|86|HUN|Liverpool
Álex Grimaldo|DEF|29|85|85|ESP|Leverkusen
Robin Le Normand|DEF|29|82|82|ESP|Atlético
José María Giménez|DEF|30|83|83|URU|Atlético
Dávid Hancko|DEF|27|82|83|SVK|Atlético
Marcos Llorente|DEF|30|84|84|ESP|Atlético
Pau Torres|DEF|28|82|83|ESP|Aston Villa
Aymeric Laporte|DEF|31|82|82|ESP|Athletic
Dani Vivian|DEF|26|80|82|ESP|Athletic
Kyle Walker|DEF|35|80|80|ENG|Burnley
John Stones|DEF|31|84|84|ENG|Man City
Marc Cucurella|DEF|27|83|84|ESP|Chelsea
Reece James|DEF|25|83|86|ENG|Chelsea
Levi Colwill|DEF|22|81|86|ENG|Chelsea
Lisandro Martínez|DEF|27|83|84|ARG|Man United
Matthijs de Ligt|DEF|26|82|84|NED|Man United
Cristian Romero|DEF|27|85|86|ARG|Tottenham
Micky van de Ven|DEF|24|83|87|NED|Tottenham
Pedro Porro|DEF|25|83|85|ESP|Tottenham
Nico Schlotterbeck|DEF|25|83|86|GER|Dortmund
David Alaba|DEF|33|79|79|AUT|Real Madrid
Íñigo Martínez|DEF|34|82|82|ESP|Al Nassr
Óscar Mingueza|DEF|26|79|81|ESP|Celta
Rodri|MED|29|90|90|ESP|Man City
Jude Bellingham|MED|22|89|92|ENG|Real Madrid
Pedri|MED|22|89|92|ESP|Barcelona
Federico Valverde|MED|27|88|89|URU|Real Madrid
Kevin De Bruyne|MED|34|86|86|BEL|Nápoles
Joshua Kimmich|MED|30|87|87|GER|Bayern
Declan Rice|MED|26|87|88|ENG|Arsenal
Martin Ødegaard|MED|26|87|88|NOR|Arsenal
Florian Wirtz|MED|22|88|92|GER|Liverpool
Jamal Musiala|MED|22|88|92|GER|Bayern
Vitinha|MED|25|87|89|POR|PSG
João Neves|MED|20|85|91|POR|PSG
Fabián Ruiz|MED|29|84|84|ESP|PSG
Nicolò Barella|MED|28|86|86|ITA|Inter
Hakan Çalhanoğlu|MED|31|85|85|TUR|Inter
Alexis Mac Allister|MED|26|86|87|ARG|Liverpool
Dominik Szoboszlai|MED|24|84|87|HUN|Liverpool
Ryan Gravenberch|MED|23|84|88|NED|Liverpool
Frenkie de Jong|MED|28|86|86|NED|Barcelona
Gavi|MED|21|84|90|ESP|Barcelona
Fermín López|MED|22|81|86|ESP|Barcelona
Dani Olmo|MED|27|85|86|ESP|Barcelona
Aurélien Tchouaméni|MED|25|85|87|FRA|Real Madrid
Eduardo Camavinga|MED|22|84|88|FRA|Real Madrid
Arda Güler|MED|20|82|90|TUR|Real Madrid
Luka Modrić|MED|40|83|83|CRO|Milan
Bruno Fernandes|MED|31|87|87|POR|Man United
Kobbie Mainoo|MED|20|80|87|ENG|Man United
Enzo Fernández|MED|24|84|87|ARG|Chelsea
Moisés Caicedo|MED|23|86|88|ECU|Chelsea
Cole Palmer|MED|23|87|90|ENG|Chelsea
Bernardo Silva|MED|31|86|86|POR|Man City
Phil Foden|MED|25|86|88|ENG|Man City
Tijjani Reijnders|MED|27|84|85|NED|Man City
Martín Zubimendi|MED|26|85|86|ESP|Arsenal
Mikel Merino|MED|29|83|83|ESP|Arsenal
Koke|MED|33|82|82|ESP|Atlético
Pablo Barrios|MED|22|81|86|ESP|Atlético
Álex Baena|MED|24|84|86|ESP|Atlético
Conor Gallagher|MED|25|81|83|ENG|Atlético
Isco|MED|33|82|82|ESP|Betis
Brais Méndez|MED|28|80|80|ESP|Real Sociedad
Oihan Sancet|MED|25|81|84|ESP|Athletic
Dani Parejo|MED|36|79|79|ESP|Villarreal
Sandro Tonali|MED|25|84|86|ITA|Newcastle
Bruno Guimarães|MED|27|86|86|BRA|Newcastle
Scott McTominay|MED|28|84|84|SCO|Nápoles
Stanislav Lobotka|MED|30|83|83|SVK|Nápoles
Teun Koopmeiners|MED|27|82|83|NED|Juventus
Granit Xhaka|MED|32|83|83|SUI|Sunderland
Mateo Kovačić|MED|31|82|82|CRO|Man City
James Maddison|MED|28|83|83|ENG|Tottenham
Kylian Mbappé|DEL|26|91|92|FRA|Real Madrid
Erling Haaland|DEL|25|91|92|NOR|Man City
Vinícius Júnior|DEL|25|89|91|BRA|Real Madrid
Lamine Yamal|DEL|18|88|95|ESP|Barcelona
Mohamed Salah|DEL|33|89|89|EGY|Liverpool
Harry Kane|DEL|32|90|90|ENG|Bayern
Robert Lewandowski|DEL|37|86|86|POL|Barcelona
Raphinha|DEL|28|88|88|BRA|Barcelona
Ousmane Dembélé|DEL|28|89|89|FRA|PSG
Khvicha Kvaratskhelia|DEL|24|87|89|GEO|PSG
Lautaro Martínez|DEL|28|88|88|ARG|Inter
Marcus Thuram|DEL|28|84|85|FRA|Inter
Bukayo Saka|DEL|24|88|90|ENG|Arsenal
Viktor Gyökeres|DEL|27|85|86|SWE|Arsenal
Gabriel Martinelli|DEL|24|83|85|BRA|Arsenal
Alexander Isak|DEL|26|87|89|SWE|Liverpool
Hugo Ekitike|DEL|23|83|87|FRA|Liverpool
Cody Gakpo|DEL|26|84|85|NED|Liverpool
Julián Álvarez|DEL|25|87|89|ARG|Atlético
Antoine Griezmann|DEL|34|85|85|FRA|Atlético
Alexander Sørloth|DEL|29|83|83|NOR|Atlético
Rodrygo|DEL|24|85|88|BRA|Real Madrid
Endrick|DEL|19|77|88|BRA|Real Madrid
Nico Williams|DEL|23|85|88|ESP|Athletic
Iñaki Williams|DEL|31|81|81|GHA|Athletic
Mikel Oyarzabal|DEL|28|84|84|ESP|Real Sociedad
Takefusa Kubo|DEL|24|82|85|JPN|Real Sociedad
Ferran Torres|DEL|25|81|82|ESP|Barcelona
Michael Olise|DEL|23|86|89|FRA|Bayern
Luis Díaz|DEL|28|85|85|COL|Bayern
Serge Gnabry|DEL|30|81|81|GER|Bayern
Rafael Leão|DEL|26|85|86|POR|Milan
Christian Pulisic|DEL|27|84|84|USA|Milan
Victor Osimhen|DEL|26|85|86|NGA|Galatasaray
Ademola Lookman|DEL|27|84|84|NGA|Atalanta
Dušan Vlahović|DEL|25|82|84|SRB|Juventus
Kenan Yıldız|DEL|20|83|89|TUR|Juventus
Rasmus Højlund|DEL|22|80|85|DEN|Nápoles
Romelu Lukaku|DEL|32|82|82|BEL|Nápoles
Son Heung-min|DEL|33|84|84|KOR|Los Angeles FC
Mohammed Kudus|DEL|25|81|83|GHA|Tottenham
Benjamin Šeško|DEL|22|82|87|SVN|Man United
Matheus Cunha|DEL|26|82|83|BRA|Man United
Bryan Mbeumo|DEL|26|83|84|CMR|Man United
Jérémy Doku|DEL|23|82|86|BEL|Man City
Omar Marmoush|DEL|26|83|84|EGY|Man City
João Pedro|DEL|23|82|85|BRA|Chelsea
Pedro Neto|DEL|25|81|83|POR|Chelsea
Ollie Watkins|DEL|29|84|84|ENG|Aston Villa
Morgan Rogers|DEL|22|81|86|ENG|Aston Villa
Jarrod Bowen|DEL|28|83|83|ENG|West Ham
Kaoru Mitoma|DEL|28|81|81|JPN|Brighton
Serhou Guirassy|DEL|29|85|85|GUI|Dortmund
Loïs Openda|DEL|25|82|84|BEL|Juventus
Patrik Schick|DEL|29|83|83|CZE|Leverkusen
Lionel Messi|DEL|38|86|86|ARG|Inter Miami
Cristiano Ronaldo|DEL|40|84|84|POR|Al Nassr
Neymar|DEL|33|80|80|BRA|Santos
Karim Benzema|DEL|37|85|85|FRA|Al Ittihad
Álvaro Morata|DEL|32|79|79|ESP|Como
Ayoze Pérez|DEL|32|80|80|ESP|Villarreal
Gerard Moreno|DEL|33|80|80|ESP|Villarreal
Antony|DEL|25|80|82|BRA|Betis
Ante Budimir|DEL|33|80|80|CRO|Osasuna
Iago Aspas|DEL|38|79|79|ESP|Celta
Borja Iglesias|DEL|32|77|77|ESP|Celta
Emiliano Martínez|POR|33|86|86|ARG|Aston Villa
Bart Verbruggen|POR|23|82|86|NED|Brighton
Robert Sánchez|POR|27|80|82|ESP|Chelsea
Jordan Pickford|POR|31|83|83|ENG|Everton
Nick Pope|POR|33|82|82|ENG|Newcastle
Wojciech Szczęsny|POR|35|82|82|POL|Barcelona
Juan Musso|POR|31|78|78|ARG|Atlético
Sergio Herrera|POR|32|78|78|ESP|Osasuna
Rui Silva|POR|31|79|79|POR|Sporting
David de Gea|POR|34|82|82|ESP|Fiorentina
Raúl Asencio|DEF|22|78|84|ESP|Real Madrid
Ferland Mendy|DEF|30|81|81|FRA|Real Madrid
Fran García|DEF|26|78|79|ESP|Real Madrid
Eric García|DEF|24|79|82|ESP|Barcelona
Andreas Christensen|DEF|29|80|80|DEN|Barcelona
Clément Lenglet|DEF|30|78|78|FRA|Atlético
Nahuel Molina|DEF|27|79|80|ARG|Atlético
Aitor Paredes|DEF|25|78|81|ESP|Athletic
Lucas Hernández|DEF|29|82|82|FRA|PSG
Destiny Udogie|DEF|22|80|85|ITA|Tottenham
Leny Yoro|DEF|19|78|87|FRA|Man United
Dani Ceballos|MED|29|79|79|ESP|Real Madrid
Marc Casadó|MED|22|77|82|ESP|Barcelona
Javi Guerra|MED|22|79|85|ESP|Valencia
Pepelu|MED|27|78|79|ESP|Valencia
Sergi Darder|MED|31|78|78|ESP|Mallorca
Mikel Jauregizar|MED|22|76|83|ESP|Athletic
Santi Comesaña|MED|29|77|77|ESP|Villarreal
Rodrigo De Paul|MED|31|81|81|ARG|Inter Miami
Nico González|MED|23|79|83|ESP|Man City
Leon Goretzka|MED|30|81|81|GER|Bayern
Aleksandar Pavlović|MED|21|81|87|GER|Bayern
Warren Zaïre-Emery|MED|19|80|88|FRA|PSG
Brahim Díaz|MED|26|80|81|MAR|Real Madrid
Franco Mastantuono|MED|18|75|88|ARG|Real Madrid
Thiago Almada|MED|24|78|82|ARG|Atlético
Johnny Cardoso|MED|24|78|82|USA|Atlético
Nico Paz|MED|21|78|85|ARG|Como
Isi Palazón|MED|30|77|77|ESP|Rayo Vallecano
Désiré Doué|DEL|20|82|89|FRA|PSG
Bradley Barcola|DEL|23|81|85|FRA|PSG
Gonçalo Ramos|DEL|24|79|82|POR|PSG
Samu Omorodion|DEL|21|78|84|ESP|Oporto
Giuliano Simeone|DEL|22|78|82|ARG|Atlético
Jorge de Frutos|DEL|28|77|77|ESP|Rayo Vallecano
Marcus Rashford|DEL|27|80|80|ENG|Barcelona
Roony Bardghji|DEL|19|72|84|SWE|Barcelona
Vanja Milinković-Savić|POR|28|81|82|SRB|Nápoles
Alex Meret|POR|28|80|80|ITA|Nápoles
Mile Svilar|POR|26|84|86|SRB|Roma
Michele Di Gregorio|POR|28|81|82|ITA|Juventus
Josep Martínez|POR|27|78|81|ESP|Inter
Ivan Provedel|POR|31|80|80|ITA|Lazio
Filip Jörgensen|POR|23|76|82|DEN|Chelsea
Matz Sels|POR|33|81|81|BEL|Nottingham Forest
Dean Henderson|POR|28|81|82|ENG|Crystal Palace
Bernd Leno|POR|33|81|81|GER|Fulham
Senne Lammens|POR|23|77|84|BEL|Man United
Kevin Trapp|POR|35|79|79|GER|Paris FC
Oliver Baumann|POR|35|80|80|GER|Hoffenheim
Alexander Nübel|POR|29|81|82|GER|Stuttgart
Paulo Gazzaniga|POR|33|77|77|ARG|Girona
Augusto Batalla|POR|29|78|79|ARG|Rayo Vallecano
Julen Agirrezabala|POR|24|77|83|ESP|Valencia
Marko Dmitrović|POR|33|77|77|SRB|Espanyol
Federico Gatti|DEF|27|80|81|ITA|Juventus
Pierre Kalulu|DEF|25|81|83|FRA|Juventus
Andrea Cambiaso|DEF|25|82|85|ITA|Juventus
Alessandro Buongiorno|DEF|26|83|85|ITA|Nápoles
Giovanni Di Lorenzo|DEF|32|83|83|ITA|Nápoles
Amir Rrahmani|DEF|31|81|81|KOS|Nápoles
Francesco Acerbi|DEF|37|80|80|ITA|Inter
Denzel Dumfries|DEF|29|83|83|NED|Inter
Yann Bisseck|DEF|24|80|84|GER|Inter
Fikayo Tomori|DEF|27|81|82|ENG|Milan
Strahinja Pavlović|DEF|24|79|83|SRB|Milan
Evan Ndicka|DEF|26|81|83|CIV|Roma
Gianluca Mancini|DEF|29|81|81|ITA|Roma
Josip Stanišić|DEF|25|80|83|CRO|Bayern
Hiroki Ito|DEF|26|79|81|JPN|Bayern
Waldemar Anton|DEF|29|80|80|GER|Dortmund
Julian Ryerson|DEF|27|80|81|NOR|Dortmund
Edmond Tapsoba|DEF|26|82|84|BFA|Leverkusen
David Raum|DEF|27|81|82|GER|Leipzig
Castello Lukeba|DEF|23|81|86|FRA|Leipzig
Maximilian Mittelstädt|DEF|28|80|81|GER|Stuttgart
Nathaniel Brown|DEF|22|78|84|GER|Eintracht Fráncfort
Lucas Beraldo|DEF|22|78|84|BRA|PSG
Illia Zabarnyi|DEF|23|81|85|UKR|PSG
Ezri Konsa|DEF|28|82|82|ENG|Aston Villa
Lucas Digne|DEF|32|80|80|FRA|Aston Villa
Marc Guéhi|DEF|25|83|86|ENG|Crystal Palace
Daniel Muñoz|DEF|29|82|82|COL|Crystal Palace
Tyrick Mitchell|DEF|26|79|80|ENG|Crystal Palace
Murillo|DEF|23|82|86|BRA|Nottingham Forest
Nikola Milenković|DEF|28|81|81|SRB|Nottingham Forest
Ola Aina|DEF|29|80|80|NGA|Nottingham Forest
Tino Livramento|DEF|23|81|85|ENG|Newcastle
Sven Botman|DEF|25|81|84|NED|Newcastle
Malick Thiaw|DEF|24|80|84|GER|Newcastle
Lewis Hall|DEF|21|80|86|ENG|Newcastle
Diogo Dalot|DEF|26|80|81|POR|Man United
Luke Shaw|DEF|30|79|79|ENG|Man United
Antonee Robinson|DEF|28|81|81|USA|Fulham
Wesley Fofana|DEF|24|80|83|FRA|Chelsea
Trevoh Chalobah|DEF|26|80|81|ENG|Chelsea
Malo Gusto|DEF|22|81|85|FRA|Chelsea
Abdukodir Khusanov|DEF|21|78|85|UZB|Man City
Rayan Aït-Nouri|DEF|24|82|84|ALG|Man City
Nathan Aké|DEF|30|81|81|NED|Man City
Djed Spence|DEF|25|78|80|ENG|Tottenham
Jon Aramburu|DEF|23|79|83|VEN|Real Sociedad
Igor Zubeldia|DEF|28|80|80|ESP|Real Sociedad
Juan Foyth|DEF|27|80|81|ARG|Villarreal
Sergi Cardona|DEF|26|78|79|ESP|Villarreal
Renato Veiga|DEF|22|79|84|POR|Villarreal
Natan|DEF|24|78|81|BRA|Betis
Diego Llorente|DEF|32|78|78|ESP|Betis
Héctor Bellerín|DEF|30|77|77|ESP|Betis
José Gayà|DEF|30|79|79|ESP|Valencia
César Tárrega|DEF|23|78|83|ESP|Valencia
Javi Rodríguez|DEF|22|76|82|ESP|Celta
Kike Salas|DEF|23|77|81|ESP|Sevilla
Daley Blind|DEF|35|77|77|NED|Girona
Manuel Locatelli|MED|27|82|82|ITA|Juventus
Khéphren Thuram|MED|24|81|85|FRA|Juventus
Weston McKennie|MED|27|79|79|USA|Juventus
Frank Anguissa|MED|29|82|82|CMR|Nápoles
Billy Gilmour|MED|24|79|82|SCO|Nápoles
Henrikh Mkhitaryan|MED|36|80|80|ARM|Inter
Davide Frattesi|MED|25|81|83|ITA|Inter
Petar Sučić|MED|22|77|84|CRO|Inter
Youssouf Fofana|MED|26|80|81|FRA|Milan
Samuele Ricci|MED|24|79|83|ITA|Milan
Ruben Loftus-Cheek|MED|29|78|78|ENG|Milan
Bryan Cristante|MED|30|79|79|ITA|Roma
Manu Koné|MED|24|81|85|FRA|Roma
Matías Soulé|MED|22|80|85|ARG|Roma
Marten de Roon|MED|34|79|79|NED|Atalanta
Charles De Ketelaere|MED|24|82|85|BEL|Atalanta
Nicolò Rovella|MED|23|80|84|ITA|Lazio
Mattéo Guendouzi|MED|26|80|81|FRA|Lazio
Felix Nmecha|MED|24|80|84|GER|Dortmund
Julian Brandt|MED|29|81|81|GER|Dortmund
Marcel Sabitzer|MED|31|79|79|AUT|Dortmund
Exequiel Palacios|MED|27|81|82|ARG|Leverkusen
Xavi Simons|MED|22|83|88|NED|Tottenham
Lucas Paquetá|MED|28|81|81|BRA|West Ham
Morgan Gibbs-White|MED|25|82|84|ENG|Nottingham Forest
Elliot Anderson|MED|22|81|86|ENG|Nottingham Forest
Adam Wharton|MED|21|80|87|ENG|Crystal Palace
Eberechi Eze|MED|27|84|85|ENG|Arsenal
Christian Nørgaard|MED|31|79|79|DEN|Arsenal
Joelinton|MED|29|80|80|BRA|Newcastle
Youri Tielemans|MED|28|82|82|BEL|Aston Villa
Boubacar Kamara|MED|25|81|83|FRA|Aston Villa
John McGinn|MED|30|80|80|SCO|Aston Villa
Amadou Onana|MED|24|80|84|BEL|Aston Villa
Carlos Baleba|MED|21|80|86|CMR|Brighton
Mason Mount|MED|26|79|80|ENG|Man United
Manuel Ugarte|MED|24|79|82|URU|Man United
Casemiro|MED|33|80|80|BRA|Man United
Rodrigo Bentancur|MED|28|80|80|URU|Tottenham
Pape Matar Sarr|MED|23|79|83|SEN|Tottenham
João Palhinha|MED|30|81|81|POR|Tottenham
Andrey Santos|MED|21|77|84|BRA|Chelsea
Romeo Lavia|MED|21|78|85|BEL|Chelsea
Rayan Cherki|MED|22|82|87|FRA|Man City
Iñigo Ruiz de Galarreta|MED|32|79|79|ESP|Athletic
Beñat Prados|MED|24|77|81|ESP|Athletic
Luka Sučić|MED|23|78|83|CRO|Real Sociedad
Pape Gueye|MED|26|79|80|SEN|Villarreal
Thomas Partey|MED|32|80|80|GHA|Villarreal
Pablo Fornals|MED|29|80|80|ESP|Betis
Giovani Lo Celso|MED|29|80|80|ARG|Betis
Sergi Altimira|MED|24|77|81|ESP|Betis
Djibril Sow|MED|28|77|77|SUI|Sevilla
Nemanja Gudelj|MED|33|77|77|SRB|Sevilla
Pablo Torre|MED|22|76|82|ESP|Mallorca
Unai López|MED|29|77|77|ESP|Rayo Vallecano
Óscar Valentín|MED|31|77|77|ESP|Rayo Vallecano
Paulo Dybala|DEL|31|82|82|ARG|Roma
Artem Dovbyk|DEL|28|81|81|UKR|Roma
Evan Ferguson|DEL|20|76|84|IRL|Roma
Gianluca Scamacca|DEL|26|80|81|ITA|Atalanta
Jonathan David|DEL|25|82|84|CAN|Juventus
Francisco Conceição|DEL|23|80|84|POR|Juventus
Santiago Giménez|DEL|24|80|83|MEX|Milan
Christopher Nkunku|DEL|27|81|81|FRA|Milan
Ange-Yoan Bonny|DEL|21|77|84|FRA|Inter
Moise Kean|DEL|25|82|83|ITA|Fiorentina
Mattia Zaccagni|DEL|30|80|80|ITA|Lazio
Taty Castellanos|DEL|26|79|80|ARG|Lazio
Riccardo Orsolini|DEL|28|80|80|ITA|Bolonia
Nick Woltemade|DEL|23|80|85|GER|Newcastle
Ermedin Demirović|DEL|27|80|80|BIH|Stuttgart
Deniz Undav|DEL|29|80|80|GER|Stuttgart
Karim Adeyemi|DEL|23|80|84|GER|Dortmund
Maximilian Beier|DEL|22|79|84|GER|Dortmund
Jonathan Burkardt|DEL|25|80|82|GER|Eintracht Fráncfort
Nicolas Jackson|DEL|24|80|83|SEN|Bayern
Dominic Solanke|DEL|28|80|80|ENG|Tottenham
Richarlison|DEL|28|79|79|BRA|Tottenham
Brennan Johnson|DEL|24|80|82|WAL|Tottenham
Anthony Gordon|DEL|24|82|85|ENG|Newcastle
Harvey Barnes|DEL|27|79|79|ENG|Newcastle
Yoane Wissa|DEL|29|81|81|COD|Newcastle
Chris Wood|DEL|33|80|80|NZL|Nottingham Forest
Callum Hudson-Odoi|DEL|24|79|81|ENG|Nottingham Forest
Jean-Philippe Mateta|DEL|28|81|81|FRA|Crystal Palace
Ismaïla Sarr|DEL|27|80|80|SEN|Crystal Palace
Yeremy Pino|DEL|22|79|84|ESP|Crystal Palace
Danny Welbeck|DEL|34|77|77|ENG|Brighton
Yankuba Minteh|DEL|21|78|84|GAM|Brighton
Liam Delap|DEL|22|79|85|ENG|Chelsea
Jamie Gittens|DEL|21|80|86|ENG|Chelsea
Estêvão|DEL|18|78|89|BRA|Chelsea
Noni Madueke|DEL|23|81|84|ENG|Arsenal
Leandro Trossard|DEL|30|82|82|BEL|Arsenal
Kai Havertz|DEL|26|83|84|GER|Arsenal
Gabriel Jesus|DEL|28|80|80|BRA|Arsenal
Federico Chiesa|DEL|27|79|79|ITA|Liverpool
Savinho|DEL|21|80|86|BRA|Man City
Joshua Zirkzee|DEL|24|78|81|NED|Man United
Amad Diallo|DEL|23|81|85|CIV|Man United
Niclas Füllkrug|DEL|32|78|78|GER|West Ham
Raúl Jiménez|DEL|34|78|78|MEX|Fulham
Thierno Barry|DEL|22|78|83|FRA|Everton
Vedat Muriqi|DEL|31|79|79|KOS|Mallorca
Kike García|DEL|35|76|76|ESP|Espanyol
Javi Puado|DEL|27|78|78|ESP|Espanyol
Álex Berenguer|DEL|30|78|78|ESP|Athletic
Gorka Guruzeta|DEL|29|78|78|ESP|Athletic
Ander Barrenetxea|DEL|23|79|82|ESP|Real Sociedad
Nicolas Pépé|DEL|30|79|79|CIV|Villarreal
Tajon Buchanan|DEL|26|78|79|CAN|Villarreal
Cucho Hernández|DEL|26|80|81|COL|Betis
Abde Ezzalzouli|DEL|23|80|83|MAR|Betis
Rodrigo Riquelme|DEL|25|79|81|ESP|Betis
Hugo Duro|DEL|25|78|79|ESP|Valencia
Diego López|DEL|23|78|82|ESP|Valencia
Isaac Romero|DEL|25|77|79|ESP|Sevilla
Cristhian Stuani|DEL|38|76|76|URU|Girona
Sergio Camello|DEL|24|77|79|ESP|Rayo Vallecano
Álvaro García|DEL|33|77|77|ESP|Rayo Vallecano
`;

export const FUTBOLISTAS = DATOS.trim().split('\n').map((l, i) => {
  const [nombre, pos, edad, media, potencial, pais, club] = l.split('|');
  return { id: i + 1, nombre, pos, edad: Number(edad), media: Number(media), potencial: Number(potencial), pais, club };
});
