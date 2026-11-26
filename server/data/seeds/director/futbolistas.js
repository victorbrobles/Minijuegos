// server/data/seeds/director/futbolistas.js
// Futbolistas de «Director Deportivo» (temporada 2026/27). Media y potencial son valoraciones aproximadas de juego;
// la edad es la de la temporada. El precio lo calcula el motor (media, edad y potencial).
// Formato: Nombre|posición|edad|media|potencial|país|club

const DATOS = `
Thibaut Courtois|POR|34|89|89|BEL|Real Madrid
Alisson Becker|POR|33|89|89|BRA|Liverpool
Gianluigi Donnarumma|POR|27|88|90|ITA|Man City
Marc-André ter Stegen|POR|34|86|86|GER|Ajax
Jan Oblak|POR|33|87|87|SVN|Atlético
Mike Maignan|POR|31|87|88|FRA|Milan
Ederson|POR|32|85|85|BRA|Fenerbahçe
David Raya|POR|31|86|87|ESP|Arsenal
Joan García|POR|25|82|87|ESP|Barcelona
Unai Simón|POR|29|85|86|ESP|Athletic
Yann Sommer|POR|37|84|84|SUI|Club Brujas
Gregor Kobel|POR|28|85|87|SUI|Dortmund
Guglielmo Vicario|POR|30|84|85|ITA|Juventus
Diogo Costa|POR|27|84|87|POR|Oporto
Manuel Neuer|POR|40|85|85|GER|Bayern
André Onana|POR|30|80|81|CMR|Trabzonspor
Álex Remiro|POR|31|82|82|ESP|Real Sociedad
Lucas Chevalier|POR|25|82|87|FRA|PSG
Giorgi Mamardashvili|POR|26|82|87|GEO|Liverpool
Yassine Bounou|POR|35|83|83|MAR|Al Hilal
Andriy Lunin|POR|27|79|83|UKR|Real Madrid
Kepa Arrizabalaga|POR|32|79|79|ESP|Arsenal
Virgil van Dijk|DEF|35|89|89|NED|Liverpool
William Saliba|DEF|25|87|90|FRA|Arsenal
Rúben Dias|DEF|29|87|88|POR|Man City
Joško Gvardiol|DEF|24|85|89|CRO|Man City
Marquinhos|DEF|32|86|86|BRA|PSG
Achraf Hakimi|DEF|27|87|88|MAR|PSG
Nuno Mendes|DEF|24|86|90|POR|PSG
Willian Pacho|DEF|24|83|87|ECU|PSG
Antonio Rüdiger|DEF|33|86|86|GER|Real Madrid
Éder Militão|DEF|28|84|86|BRA|Real Madrid
Dean Huijsen|DEF|21|81|89|ESP|Real Madrid
Dani Carvajal|DEF|34|84|84|ESP|Getafe
Trent Alexander-Arnold|DEF|27|86|87|ENG|Real Madrid
Álvaro Carreras|DEF|23|81|86|ESP|Real Madrid
Pau Cubarsí|DEF|19|82|91|ESP|Barcelona
Ronald Araujo|DEF|27|84|86|URU|Liverpool
Jules Koundé|DEF|27|85|87|FRA|Barcelona
Alejandro Balde|DEF|22|82|87|ESP|Barcelona
Kim Min-jae|DEF|29|85|86|KOR|Bayern
Dayot Upamecano|DEF|27|84|86|FRA|Bayern
Alphonso Davies|DEF|25|84|87|CAN|Bayern
Jonathan Tah|DEF|30|85|85|GER|Bayern
Theo Hernández|DEF|28|85|86|FRA|Al Hilal
Alessandro Bastoni|DEF|27|86|88|ITA|Inter
Federico Dimarco|DEF|28|85|86|ITA|Inter
Gleison Bremer|DEF|29|85|86|BRA|Juventus
Riccardo Calafiori|DEF|24|82|86|ITA|Arsenal
Gabriel Magalhães|DEF|28|86|87|BRA|Arsenal
Ben White|DEF|28|83|84|ENG|Arsenal
Jurriën Timber|DEF|25|83|86|NED|Arsenal
Piero Hincapié|DEF|24|82|86|ECU|Arsenal
Ibrahima Konaté|DEF|27|84|86|FRA|Real Madrid
Andrew Robertson|DEF|32|84|84|SCO|Tottenham
Jeremie Frimpong|DEF|25|84|87|NED|Liverpool
Milos Kerkez|DEF|22|80|86|HUN|Liverpool
Álex Grimaldo|DEF|30|85|85|ESP|Atlético
Robin Le Normand|DEF|30|82|82|ESP|Atlético
José María Giménez|DEF|31|83|83|URU|Deportivo
Dávid Hancko|DEF|28|82|83|SVK|Atlético
Marcos Llorente|DEF|31|84|84|ESP|Atlético
Pau Torres|DEF|29|82|83|ESP|Aston Villa
Aymeric Laporte|DEF|32|82|82|ESP|Athletic
Dani Vivian|DEF|27|80|82|ESP|Athletic
Kyle Walker|DEF|36|80|80|ENG|Burnley
John Stones|DEF|32|84|84|ENG|Inter
Marc Cucurella|DEF|28|83|84|ESP|Real Madrid
Reece James|DEF|26|83|86|ENG|Chelsea
Levi Colwill|DEF|23|81|86|ENG|Chelsea
Lisandro Martínez|DEF|28|83|84|ARG|Man United
Matthijs de Ligt|DEF|27|82|84|NED|Man United
Cristian Romero|DEF|28|85|86|ARG|Atlético
Micky van de Ven|DEF|25|83|87|NED|Tottenham
Pedro Porro|DEF|26|83|85|ESP|Tottenham
Nico Schlotterbeck|DEF|26|83|86|GER|Dortmund
David Alaba|DEF|34|79|79|AUT|Udinese
Íñigo Martínez|DEF|35|82|82|ESP|Al Nassr
Óscar Mingueza|DEF|27|79|81|ESP|Crystal Palace
Rodri|MED|30|90|90|ESP|Barcelona
Jude Bellingham|MED|23|89|92|ENG|Real Madrid
Pedri|MED|23|89|92|ESP|Barcelona
Federico Valverde|MED|28|88|89|URU|Real Madrid
Kevin De Bruyne|MED|35|86|86|BEL|Nápoles
Joshua Kimmich|MED|31|87|87|GER|Bayern
Declan Rice|MED|27|87|88|ENG|Arsenal
Martin Ødegaard|MED|27|87|88|NOR|Arsenal
Florian Wirtz|MED|23|88|92|GER|Liverpool
Jamal Musiala|MED|23|88|92|GER|Bayern
Vitinha|MED|26|87|89|POR|PSG
João Neves|MED|21|85|91|POR|PSG
Fabián Ruiz|MED|30|84|84|ESP|PSG
Nicolò Barella|MED|29|86|86|ITA|Inter
Hakan Çalhanoğlu|MED|32|85|85|TUR|Inter
Alexis Mac Allister|MED|27|86|87|ARG|Liverpool
Dominik Szoboszlai|MED|25|84|87|HUN|Liverpool
Ryan Gravenberch|MED|24|84|88|NED|Liverpool
Frenkie de Jong|MED|29|86|86|NED|Barcelona
Gavi|MED|22|84|90|ESP|Barcelona
Fermín López|MED|23|81|86|ESP|Barcelona
Dani Olmo|MED|28|85|86|ESP|Barcelona
Aurélien Tchouaméni|MED|26|85|87|FRA|Real Madrid
Eduardo Camavinga|MED|23|84|88|FRA|Real Madrid
Arda Güler|MED|21|82|90|TUR|Real Madrid
Luka Modrić|MED|41|83|83|CRO|Milan
Bruno Fernandes|MED|32|87|87|POR|Man United
Kobbie Mainoo|MED|21|80|87|ENG|Man United
Enzo Fernández|MED|25|84|87|ARG|Man City
Moisés Caicedo|MED|24|86|88|ECU|Chelsea
Cole Palmer|MED|24|87|90|ENG|Chelsea
Bernardo Silva|MED|32|86|86|POR|Real Madrid
Phil Foden|MED|26|86|88|ENG|Man City
Tijjani Reijnders|MED|28|84|85|NED|Al Qadsiah
Martín Zubimendi|MED|27|85|86|ESP|Arsenal
Mikel Merino|MED|30|83|83|ESP|Arsenal
Koke|MED|34|82|82|ESP|Atlético
Pablo Barrios|MED|23|81|86|ESP|Atlético
Álex Baena|MED|25|84|86|ESP|Atlético
Conor Gallagher|MED|26|81|83|ENG|Tottenham
Isco|MED|34|82|82|ESP|Betis
Brais Méndez|MED|29|80|80|ESP|Columbus Crew
Oihan Sancet|MED|26|81|84|ESP|Athletic
Sandro Tonali|MED|26|84|86|ITA|Tottenham
Bruno Guimarães|MED|28|86|86|BRA|Arsenal
Scott McTominay|MED|29|84|84|SCO|Nápoles
Stanislav Lobotka|MED|31|83|83|SVK|Nápoles
Teun Koopmeiners|MED|28|82|83|NED|Juventus
Granit Xhaka|MED|33|83|83|SUI|Sunderland
Mateo Kovačić|MED|32|82|82|CRO|Man City
James Maddison|MED|29|83|83|ENG|Tottenham
Kylian Mbappé|DEL|27|91|92|FRA|Real Madrid
Erling Haaland|DEL|26|91|92|NOR|Man City
Vinícius Júnior|DEL|26|89|91|BRA|Real Madrid
Lamine Yamal|DEL|19|88|95|ESP|Barcelona
Mohamed Salah|DEL|34|89|89|EGY|Trabzonspor
Harry Kane|DEL|33|90|90|ENG|Bayern
Robert Lewandowski|DEL|38|86|86|POL|Chicago Fire
Raphinha|DEL|29|88|88|BRA|Barcelona
Ousmane Dembélé|DEL|29|89|89|FRA|PSG
Khvicha Kvaratskhelia|DEL|25|87|89|GEO|PSG
Lautaro Martínez|DEL|29|88|88|ARG|Inter
Marcus Thuram|DEL|29|84|85|FRA|Inter
Bukayo Saka|DEL|25|88|90|ENG|Arsenal
Viktor Gyökeres|DEL|28|85|86|SWE|Arsenal
Gabriel Martinelli|DEL|25|83|85|BRA|Al Hilal
Alexander Isak|DEL|27|87|89|SWE|Liverpool
Hugo Ekitike|DEL|24|83|87|FRA|Liverpool
Cody Gakpo|DEL|27|84|85|NED|Liverpool
Julián Álvarez|DEL|26|87|89|ARG|Atlético
Antoine Griezmann|DEL|35|85|85|FRA|Orlando City
Alexander Sørloth|DEL|30|83|83|NOR|Atlético
Rodrygo|DEL|25|85|88|BRA|Real Madrid
Endrick|DEL|20|77|88|BRA|Real Madrid
Nico Williams|DEL|24|85|88|ESP|Athletic
Iñaki Williams|DEL|32|81|81|GHA|Athletic
Mikel Oyarzabal|DEL|29|84|84|ESP|Real Sociedad
Takefusa Kubo|DEL|25|82|85|JPN|Real Sociedad
Ferran Torres|DEL|26|81|82|ESP|PSG
Michael Olise|DEL|24|86|89|FRA|Bayern
Luis Díaz|DEL|29|85|85|COL|Bayern
Serge Gnabry|DEL|31|81|81|GER|Bayern
Rafael Leão|DEL|27|85|86|POR|Galatasaray
Christian Pulisic|DEL|28|84|84|USA|Milan
Victor Osimhen|DEL|27|85|86|NGA|Galatasaray
Ademola Lookman|DEL|28|84|84|NGA|Atlético
Dušan Vlahović|DEL|26|82|84|SRB|Beşiktaş
Kenan Yıldız|DEL|21|83|89|TUR|Juventus
Rasmus Højlund|DEL|23|80|85|DEN|Nápoles
Romelu Lukaku|DEL|33|82|82|BEL|Fenerbahçe
Son Heung-min|DEL|34|84|84|KOR|Los Angeles FC
Mohammed Kudus|DEL|26|81|83|GHA|Tottenham
Benjamin Šeško|DEL|23|82|87|SVN|Man United
Matheus Cunha|DEL|27|82|83|BRA|Man United
Bryan Mbeumo|DEL|27|83|84|CMR|Man United
Jérémy Doku|DEL|24|82|86|BEL|Man City
Omar Marmoush|DEL|27|83|84|EGY|Tottenham
João Pedro|DEL|24|82|85|BRA|Chelsea
Pedro Neto|DEL|26|81|83|POR|Chelsea
Ollie Watkins|DEL|30|84|84|ENG|Al Hilal
Morgan Rogers|DEL|23|81|86|ENG|Chelsea
Jarrod Bowen|DEL|29|83|83|ENG|West Ham
Kaoru Mitoma|DEL|29|81|81|JPN|Brighton
Serhou Guirassy|DEL|30|85|85|GUI|Dortmund
Loïs Openda|DEL|26|82|84|BEL|Lyon
Patrik Schick|DEL|30|83|83|CZE|Leverkusen
Lionel Messi|DEL|39|86|86|ARG|Inter Miami
Cristiano Ronaldo|DEL|41|84|84|POR|Al Nassr
Neymar|DEL|34|80|80|BRA|Santos
Álvaro Morata|DEL|33|79|79|ESP|Leganés
Ayoze Pérez|DEL|33|80|80|ESP|Villarreal
Gerard Moreno|DEL|34|80|80|ESP|Villarreal
Antony|DEL|26|80|82|BRA|Betis
Ante Budimir|DEL|34|80|80|CRO|Osasuna
Iago Aspas|DEL|39|79|79|ESP|Celta
Borja Iglesias|DEL|33|77|77|ESP|Celta
Emiliano Martínez|POR|34|86|86|ARG|Chelsea
Bart Verbruggen|POR|24|82|86|NED|Brighton
Robert Sánchez|POR|28|80|82|ESP|Como
Jordan Pickford|POR|32|83|83|ENG|Everton
Nick Pope|POR|34|82|82|ENG|Newcastle
Wojciech Szczęsny|POR|36|82|82|POL|Barcelona
Juan Musso|POR|32|78|78|ARG|Atlético
Sergio Herrera|POR|33|78|78|ESP|Osasuna
Rui Silva|POR|32|79|79|POR|Sporting
David de Gea|POR|35|82|82|ESP|Fiorentina
Raúl Asencio|DEF|23|78|84|ESP|Real Madrid
Ferland Mendy|DEF|31|81|81|FRA|Real Madrid
Fran García|DEF|27|78|79|ESP|Betis
Eric García|DEF|25|79|82|ESP|Barcelona
Andreas Christensen|DEF|30|80|80|DEN|Barcelona
Clément Lenglet|DEF|31|78|78|FRA|Benfica
Nahuel Molina|DEF|28|79|80|ARG|Roma
Aitor Paredes|DEF|26|78|81|ESP|Athletic
Lucas Hernández|DEF|30|82|82|FRA|PSG
Destiny Udogie|DEF|23|80|85|ITA|Tottenham
Leny Yoro|DEF|20|78|87|FRA|Man United
Dani Ceballos|MED|30|79|79|ESP|Betis
Marc Casadó|MED|23|77|82|ESP|Deportivo
Javi Guerra|MED|23|79|85|ESP|Valencia
Pepelu|MED|28|78|79|ESP|Valencia
Sergi Darder|MED|32|78|78|ESP|Mallorca
Mikel Jauregizar|MED|23|76|83|ESP|Athletic
Santi Comesaña|MED|30|77|77|ESP|Villarreal
Rodrigo De Paul|MED|32|81|81|ARG|Inter Miami
Nico González|MED|24|79|83|ESP|Newcastle
Leon Goretzka|MED|31|81|81|GER|Aston Villa
Aleksandar Pavlović|MED|22|81|87|GER|Bayern
Warren Zaïre-Emery|MED|20|80|88|FRA|PSG
Brahim Díaz|MED|27|80|81|MAR|Real Madrid
Franco Mastantuono|MED|19|75|88|ARG|Fiorentina
Thiago Almada|MED|25|78|82|ARG|River Plate
Johnny Cardoso|MED|25|78|82|USA|Atlético
Nico Paz|MED|22|78|85|ARG|Como
Isi Palazón|MED|31|77|77|ESP|Rayo Vallecano
Désiré Doué|DEL|21|82|89|FRA|PSG
Bradley Barcola|DEL|24|81|85|FRA|Liverpool
Gonçalo Ramos|DEL|25|79|82|POR|Milan
Samu Omorodion|DEL|22|78|84|ESP|Oporto
Giuliano Simeone|DEL|23|78|82|ARG|Atlético
Jorge de Frutos|DEL|29|77|77|ESP|Rayo Vallecano
Marcus Rashford|DEL|28|80|80|ENG|Man United
Roony Bardghji|DEL|20|72|84|SWE|Barcelona
Vanja Milinković-Savić|POR|29|81|82|SRB|Nápoles
Alex Meret|POR|29|80|80|ITA|Nápoles
Mile Svilar|POR|27|84|86|SRB|Roma
Michele Di Gregorio|POR|29|81|82|ITA|Bournemouth
Josep Martínez|POR|28|78|81|ESP|Inter
Ivan Provedel|POR|32|80|80|ITA|Inter
Filip Jörgensen|POR|24|76|82|DEN|Estrasburgo
Matz Sels|POR|34|81|81|BEL|Nottingham Forest
Dean Henderson|POR|29|81|82|ENG|Crystal Palace
Bernd Leno|POR|34|81|81|GER|Fulham
Senne Lammens|POR|24|77|84|BEL|Man United
Kevin Trapp|POR|36|79|79|GER|Paris FC
Oliver Baumann|POR|36|80|80|GER|Hoffenheim
Alexander Nübel|POR|30|81|82|GER|Beşiktaş
Paulo Gazzaniga|POR|34|77|77|ARG|Girona
Augusto Batalla|POR|30|78|79|ARG|Rayo Vallecano
Julen Agirrezabala|POR|25|77|83|ESP|Racing de Santander
Marko Dmitrović|POR|34|77|77|SRB|Espanyol
Federico Gatti|DEF|28|80|81|ITA|Juventus
Pierre Kalulu|DEF|26|81|83|FRA|Juventus
Andrea Cambiaso|DEF|26|82|85|ITA|Juventus
Alessandro Buongiorno|DEF|27|83|85|ITA|Nápoles
Giovanni Di Lorenzo|DEF|33|83|83|ITA|Nápoles
Amir Rrahmani|DEF|32|81|81|KOS|Nápoles
Denzel Dumfries|DEF|30|83|83|NED|Real Madrid
Yann Bisseck|DEF|25|80|84|GER|Inter
Fikayo Tomori|DEF|28|81|82|ENG|Milan
Strahinja Pavlović|DEF|25|79|83|SRB|Milan
Evan Ndicka|DEF|27|81|83|CIV|Roma
Gianluca Mancini|DEF|30|81|81|ITA|Roma
Josip Stanišić|DEF|26|80|83|CRO|Bayern
Hiroki Ito|DEF|27|79|81|JPN|Bayern
Waldemar Anton|DEF|30|80|80|GER|Dortmund
Julian Ryerson|DEF|28|80|81|NOR|Dortmund
Edmond Tapsoba|DEF|27|82|84|BFA|Leverkusen
David Raum|DEF|28|81|82|GER|Leipzig
Castello Lukeba|DEF|24|81|86|FRA|Leipzig
Maximilian Mittelstädt|DEF|29|80|81|GER|Stuttgart
Nathaniel Brown|DEF|23|78|84|GER|Bayern
Lucas Beraldo|DEF|23|78|84|BRA|PSG
Illia Zabarnyi|DEF|24|81|85|UKR|PSG
Ezri Konsa|DEF|29|82|82|ENG|Arsenal
Lucas Digne|DEF|33|80|80|FRA|PSG
Marc Guéhi|DEF|26|83|86|ENG|Man City
Daniel Muñoz|DEF|30|82|82|COL|Nottingham Forest
Tyrick Mitchell|DEF|27|79|80|ENG|Crystal Palace
Murillo|DEF|24|82|86|BRA|Nottingham Forest
Nikola Milenković|DEF|29|81|81|SRB|Nottingham Forest
Ola Aina|DEF|30|80|80|NGA|Nottingham Forest
Tino Livramento|DEF|24|81|85|ENG|Newcastle
Sven Botman|DEF|26|81|84|NED|Newcastle
Malick Thiaw|DEF|25|80|84|GER|Newcastle
Lewis Hall|DEF|22|80|86|ENG|Newcastle
Diogo Dalot|DEF|27|80|81|POR|Man United
Luke Shaw|DEF|31|79|79|ENG|Man United
Antonee Robinson|DEF|29|81|81|USA|Fulham
Wesley Fofana|DEF|25|80|83|FRA|Chelsea
Trevoh Chalobah|DEF|27|80|81|ENG|Como
Malo Gusto|DEF|23|81|85|FRA|Chelsea
Abdukodir Khusanov|DEF|22|78|85|UZB|Man City
Rayan Aït-Nouri|DEF|25|82|84|ALG|Man City
Nathan Aké|DEF|31|81|81|NED|Fenerbahçe
Djed Spence|DEF|26|78|80|ENG|Inter
Jon Aramburu|DEF|24|79|83|VEN|Real Sociedad
Igor Zubeldia|DEF|29|80|80|ESP|Real Sociedad
Juan Foyth|DEF|28|80|81|ARG|Villarreal
Sergi Cardona|DEF|27|78|79|ESP|Villarreal
Renato Veiga|DEF|23|79|84|POR|Villarreal
Natan|DEF|25|78|81|BRA|Betis
Diego Llorente|DEF|33|78|78|ESP|Betis
Héctor Bellerín|DEF|31|77|77|ESP|Betis
José Gayà|DEF|31|79|79|ESP|Valencia
César Tárrega|DEF|24|78|83|ESP|Valencia
Javi Rodríguez|DEF|23|76|82|ESP|Celta
Kike Salas|DEF|24|77|81|ESP|Sevilla
Daley Blind|DEF|36|77|77|NED|Ajax
Manuel Locatelli|MED|28|82|82|ITA|Juventus
Khéphren Thuram|MED|25|81|85|FRA|Juventus
Weston McKennie|MED|28|79|79|USA|Juventus
Frank Anguissa|MED|30|82|82|CMR|Nápoles
Billy Gilmour|MED|25|79|82|SCO|Nápoles
Henrikh Mkhitaryan|MED|37|80|80|ARM|Inter
Davide Frattesi|MED|26|81|83|ITA|Lazio
Petar Sučić|MED|23|77|84|CRO|Inter
Youssouf Fofana|MED|27|80|81|FRA|Sevilla
Samuele Ricci|MED|25|79|83|ITA|Como
Ruben Loftus-Cheek|MED|30|78|78|ENG|Milan
Bryan Cristante|MED|31|79|79|ITA|Roma
Manu Koné|MED|25|81|85|FRA|Roma
Matías Soulé|MED|23|80|85|ARG|Roma
Marten de Roon|MED|35|79|79|NED|Roma
Charles De Ketelaere|MED|25|82|85|BEL|Atalanta
Nicolò Rovella|MED|24|80|84|ITA|Lazio
Mattéo Guendouzi|MED|27|80|81|FRA|Fenerbahçe
Felix Nmecha|MED|25|80|84|GER|Dortmund
Julian Brandt|MED|30|81|81|GER|Ajax
Marcel Sabitzer|MED|32|79|79|AUT|Dortmund
Exequiel Palacios|MED|28|81|82|ARG|Ipswich
Xavi Simons|MED|23|83|88|NED|Tottenham
Lucas Paquetá|MED|29|81|81|BRA|Flamengo
Morgan Gibbs-White|MED|26|82|84|ENG|Nottingham Forest
Elliot Anderson|MED|23|81|86|ENG|Man City
Adam Wharton|MED|22|80|87|ENG|Crystal Palace
Eberechi Eze|MED|28|84|85|ENG|Arsenal
Christian Nørgaard|MED|32|79|79|DEN|Everton
Joelinton|MED|30|80|80|BRA|Newcastle
Youri Tielemans|MED|29|82|82|BEL|Man United
Boubacar Kamara|MED|26|81|83|FRA|Aston Villa
John McGinn|MED|31|80|80|SCO|Aston Villa
Amadou Onana|MED|25|80|84|BEL|Aston Villa
Carlos Baleba|MED|22|80|86|CMR|Man United
Mason Mount|MED|27|79|80|ENG|Man United
Manuel Ugarte|MED|25|79|82|URU|Man United
Casemiro|MED|34|80|80|BRA|Inter Miami
Rodrigo Bentancur|MED|29|80|80|URU|Tottenham
Pape Matar Sarr|MED|24|79|83|SEN|Juventus
João Palhinha|MED|31|81|81|POR|Benfica
Andrey Santos|MED|22|77|84|BRA|Man United
Romeo Lavia|MED|22|78|85|BEL|Chelsea
Rayan Cherki|MED|23|82|87|FRA|Man City
Iñigo Ruiz de Galarreta|MED|33|79|79|ESP|Athletic
Beñat Prados|MED|25|77|81|ESP|Athletic
Luka Sučić|MED|24|78|83|CRO|Real Sociedad
Pape Gueye|MED|27|79|80|SEN|Villarreal
Thomas Partey|MED|33|80|80|GHA|Al Shabab
Pablo Fornals|MED|30|80|80|ESP|Betis
Giovani Lo Celso|MED|30|80|80|ARG|Betis
Sergi Altimira|MED|25|77|81|ESP|Sporting
Djibril Sow|MED|29|77|77|SUI|Genoa
Nemanja Gudelj|MED|34|77|77|SRB|Getafe
Pablo Torre|MED|23|76|82|ESP|Mallorca
Unai López|MED|30|77|77|ESP|Rayo Vallecano
Óscar Valentín|MED|32|77|77|ESP|Rayo Vallecano
Paulo Dybala|DEL|32|82|82|ARG|Roma
Artem Dovbyk|DEL|29|81|81|UKR|Bolonia
Evan Ferguson|DEL|21|76|84|IRL|Brighton
Gianluca Scamacca|DEL|27|80|81|ITA|Atalanta
Jonathan David|DEL|26|82|84|CAN|Atlético
Francisco Conceição|DEL|24|80|84|POR|Juventus
Santiago Giménez|DEL|25|80|83|MEX|Oporto
Christopher Nkunku|DEL|28|81|81|FRA|Leipzig
Ange-Yoan Bonny|DEL|22|77|84|FRA|Inter
Moise Kean|DEL|26|82|83|ITA|Como
Mattia Zaccagni|DEL|31|80|80|ITA|Lazio
Taty Castellanos|DEL|27|79|80|ARG|West Ham
Riccardo Orsolini|DEL|29|80|80|ITA|Bolonia
Nick Woltemade|DEL|24|80|85|GER|Juventus
Ermedin Demirović|DEL|28|80|80|BIH|Stuttgart
Deniz Undav|DEL|30|80|80|GER|Stuttgart
Karim Adeyemi|DEL|24|80|84|GER|Barcelona
Maximilian Beier|DEL|23|79|84|GER|Dortmund
Jonathan Burkardt|DEL|26|80|82|GER|Eintracht Fráncfort
Nicolas Jackson|DEL|25|80|83|SEN|Aston Villa
Dominic Solanke|DEL|29|80|80|ENG|Tottenham
Richarlison|DEL|29|79|79|BRA|Tottenham
Brennan Johnson|DEL|25|80|82|WAL|Everton
Anthony Gordon|DEL|25|82|85|ENG|Barcelona
Harvey Barnes|DEL|28|79|79|ENG|Newcastle
Yoane Wissa|DEL|30|81|81|COD|Newcastle
Chris Wood|DEL|34|80|80|NZL|Nottingham Forest
Callum Hudson-Odoi|DEL|25|79|81|ENG|Nottingham Forest
Jean-Philippe Mateta|DEL|29|81|81|FRA|Crystal Palace
Ismaïla Sarr|DEL|28|80|80|SEN|Crystal Palace
Yeremy Pino|DEL|23|79|84|ESP|Crystal Palace
Danny Welbeck|DEL|35|77|77|ENG|Chelsea
Yankuba Minteh|DEL|22|78|84|GAM|Brighton
Liam Delap|DEL|23|79|85|ENG|Nottingham Forest
Jamie Gittens|DEL|22|80|86|ENG|Chelsea
Estêvão|DEL|19|78|89|BRA|Chelsea
Noni Madueke|DEL|24|81|84|ENG|Arsenal
Leandro Trossard|DEL|31|82|82|BEL|Beşiktaş
Kai Havertz|DEL|27|83|84|GER|Arsenal
Gabriel Jesus|DEL|29|80|80|BRA|Barcelona
Federico Chiesa|DEL|28|79|79|ITA|Liverpool
Savinho|DEL|22|80|86|BRA|Tottenham
Joshua Zirkzee|DEL|25|78|81|NED|Man United
Amad Diallo|DEL|24|81|85|CIV|Man United
Niclas Füllkrug|DEL|33|78|78|GER|Werder Bremen
Raúl Jiménez|DEL|35|78|78|MEX|Wolves
Thierno Barry|DEL|23|78|83|FRA|Everton
Vedat Muriqi|DEL|32|79|79|KOS|Fenerbahçe
Kike García|DEL|36|76|76|ESP|Espanyol
Javi Puado|DEL|28|78|78|ESP|Espanyol
Álex Berenguer|DEL|31|78|78|ESP|Athletic
Gorka Guruzeta|DEL|30|78|78|ESP|Athletic
Ander Barrenetxea|DEL|24|79|82|ESP|Real Sociedad
Nicolas Pépé|DEL|31|79|79|CIV|Villarreal
Tajon Buchanan|DEL|27|78|79|CAN|Villarreal
Cucho Hernández|DEL|27|80|81|COL|Betis
Abde Ezzalzouli|DEL|24|80|83|MAR|Betis
Rodrigo Riquelme|DEL|26|79|81|ESP|Betis
Hugo Duro|DEL|26|78|79|ESP|Valencia
Diego López|DEL|24|78|82|ESP|Valencia
Isaac Romero|DEL|26|77|79|ESP|Sevilla
Cristhian Stuani|DEL|39|76|76|URU|Girona
Sergio Camello|DEL|25|77|79|ESP|Rayo Vallecano
Álvaro García|DEL|34|77|77|ESP|Rayo Vallecano
`;

export const FUTBOLISTAS = DATOS.trim().split('\n').map((l, i) => {
  const [nombre, pos, edad, media, potencial, pais, club] = l.split('|');
  return { id: i + 1, nombre, pos, edad: Number(edad), media: Number(media), potencial: Number(potencial), pais, club };
});
