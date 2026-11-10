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
`;

export const FUTBOLISTAS = DATOS.trim().split('\n').map((l, i) => {
  const [nombre, pos, edad, media, potencial, pais, club] = l.split('|');
  return { id: i + 1, nombre, pos, edad: Number(edad), media: Number(media), potencial: Number(potencial), pais, club };
});
