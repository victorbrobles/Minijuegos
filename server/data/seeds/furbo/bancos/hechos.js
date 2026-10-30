// server/data/seeds/furbo/bancos/hechos.js
// Tablas de hechos de fútbol. De aquí se generan automáticamente muchas preguntas (ver generador.js).
// Si corriges un dato aquí, se corrigen todas las preguntas que dependen de él.

// ---------------------------------------------------------------- Mundiales
export const MUNDIALES = [
  { a: 1930, sede: 'Uruguay', campeon: 'Uruguay', sub: 'Argentina', goleador: 'Guillermo Stábile', goles: 8 },
  { a: 1934, sede: 'Italia', campeon: 'Italia', sub: 'Checoslovaquia', goleador: 'Oldřich Nejedlý', goles: 5 },
  { a: 1938, sede: 'Francia', campeon: 'Italia', sub: 'Hungría', goleador: 'Leônidas', goles: 7 },
  { a: 1950, sede: 'Brasil', campeon: 'Uruguay', sub: null, goleador: 'Ademir', goles: 8 },
  { a: 1954, sede: 'Suiza', campeon: 'Alemania Occidental', sub: 'Hungría', goleador: 'Sándor Kocsis', goles: 11 },
  { a: 1958, sede: 'Suecia', campeon: 'Brasil', sub: 'Suecia', goleador: 'Just Fontaine', goles: 13 },
  { a: 1962, sede: 'Chile', campeon: 'Brasil', sub: 'Checoslovaquia', goleador: null, goles: null },
  { a: 1966, sede: 'Inglaterra', campeon: 'Inglaterra', sub: 'Alemania Occidental', goleador: 'Eusébio', goles: 9 },
  { a: 1970, sede: 'México', campeon: 'Brasil', sub: 'Italia', goleador: 'Gerd Müller', goles: 10 },
  { a: 1974, sede: 'Alemania Occidental', campeon: 'Alemania Occidental', sub: 'Países Bajos', goleador: 'Grzegorz Lato', goles: 7 },
  { a: 1978, sede: 'Argentina', campeon: 'Argentina', sub: 'Países Bajos', goleador: 'Mario Kempes', goles: 6 },
  { a: 1982, sede: 'España', campeon: 'Italia', sub: 'Alemania Occidental', goleador: 'Paolo Rossi', goles: 6 },
  { a: 1986, sede: 'México', campeon: 'Argentina', sub: 'Alemania Occidental', goleador: 'Gary Lineker', goles: 6 },
  { a: 1990, sede: 'Italia', campeon: 'Alemania Occidental', sub: 'Argentina', goleador: 'Salvatore Schillaci', goles: 6 },
  { a: 1994, sede: 'Estados Unidos', campeon: 'Brasil', sub: 'Italia', goleador: null, goles: null },
  { a: 1998, sede: 'Francia', campeon: 'Francia', sub: 'Brasil', goleador: 'Davor Šuker', goles: 6 },
  { a: 2002, sede: 'Corea del Sur y Japón', campeon: 'Brasil', sub: 'Alemania', goleador: 'Ronaldo Nazário', goles: 8 },
  { a: 2006, sede: 'Alemania', campeon: 'Italia', sub: 'Francia', goleador: 'Miroslav Klose', goles: 5 },
  { a: 2010, sede: 'Sudáfrica', campeon: 'España', sub: 'Países Bajos', goleador: 'Thomas Müller', goles: 5 },
  { a: 2014, sede: 'Brasil', campeon: 'Alemania', sub: 'Argentina', goleador: 'James Rodríguez', goles: 6 },
  { a: 2018, sede: 'Rusia', campeon: 'Francia', sub: 'Croacia', goleador: 'Harry Kane', goles: 6 },
  { a: 2022, sede: 'Catar', campeon: 'Argentina', sub: 'Francia', goleador: 'Kylian Mbappé', goles: 8 }
];

// ---------------------------------------------------------------- Eurocopas
export const EUROS = [
  { a: 1960, sede: 'Francia', campeon: 'URSS', sub: 'Yugoslavia' },
  { a: 1964, sede: 'España', campeon: 'España', sub: 'URSS' },
  { a: 1968, sede: 'Italia', campeon: 'Italia', sub: 'Yugoslavia' },
  { a: 1972, sede: 'Bélgica', campeon: 'Alemania Occidental', sub: 'URSS' },
  { a: 1976, sede: 'Yugoslavia', campeon: 'Checoslovaquia', sub: 'Alemania Occidental' },
  { a: 1980, sede: 'Italia', campeon: 'Alemania Occidental', sub: 'Bélgica' },
  { a: 1984, sede: 'Francia', campeon: 'Francia', sub: 'España' },
  { a: 1988, sede: 'Alemania Occidental', campeon: 'Países Bajos', sub: 'URSS' },
  { a: 1992, sede: 'Suecia', campeon: 'Dinamarca', sub: 'Alemania' },
  { a: 1996, sede: 'Inglaterra', campeon: 'Alemania', sub: 'República Checa' },
  { a: 2000, sede: 'Bélgica y Países Bajos', campeon: 'Francia', sub: 'Italia' },
  { a: 2004, sede: 'Portugal', campeon: 'Grecia', sub: 'Portugal' },
  { a: 2008, sede: 'Austria y Suiza', campeon: 'España', sub: 'Alemania' },
  { a: 2012, sede: 'Polonia y Ucrania', campeon: 'España', sub: 'Italia' },
  { a: 2016, sede: 'Francia', campeon: 'Portugal', sub: 'Francia' },
  { a: 2020, sede: null, campeon: 'Italia', sub: 'Inglaterra' },
  { a: 2024, sede: 'Alemania', campeon: 'España', sub: 'Inglaterra' }
];

// --------------------------------------------- Copa de Europa / Champions
// a = año de la final · sede = ciudad
export const CHAMPIONS = [
  { a: 1956, c: 'Real Madrid', s: 'Stade de Reims', ciudad: 'París' },
  { a: 1957, c: 'Real Madrid', s: 'Fiorentina', ciudad: 'Madrid' },
  { a: 1958, c: 'Real Madrid', s: 'AC Milan', ciudad: 'Bruselas' },
  { a: 1959, c: 'Real Madrid', s: 'Stade de Reims', ciudad: 'Stuttgart' },
  { a: 1960, c: 'Real Madrid', s: 'Eintracht Frankfurt', ciudad: 'Glasgow' },
  { a: 1961, c: 'Benfica', s: 'FC Barcelona', ciudad: 'Berna' },
  { a: 1962, c: 'Benfica', s: 'Real Madrid', ciudad: 'Ámsterdam' },
  { a: 1963, c: 'AC Milan', s: 'Benfica', ciudad: 'Londres' },
  { a: 1964, c: 'Inter de Milán', s: 'Real Madrid', ciudad: 'Viena' },
  { a: 1965, c: 'Inter de Milán', s: 'Benfica', ciudad: 'Milán' },
  { a: 1966, c: 'Real Madrid', s: 'Partizan de Belgrado', ciudad: 'Bruselas' },
  { a: 1967, c: 'Celtic', s: 'Inter de Milán', ciudad: 'Lisboa' },
  { a: 1968, c: 'Manchester United', s: 'Benfica', ciudad: 'Londres' },
  { a: 1969, c: 'AC Milan', s: 'Ajax', ciudad: 'Madrid' },
  { a: 1970, c: 'Feyenoord', s: 'Celtic', ciudad: 'Milán' },
  { a: 1971, c: 'Ajax', s: 'Panathinaikos', ciudad: 'Londres' },
  { a: 1972, c: 'Ajax', s: 'Inter de Milán', ciudad: 'Róterdam' },
  { a: 1973, c: 'Ajax', s: 'Juventus', ciudad: 'Belgrado' },
  { a: 1974, c: 'Bayern de Múnich', s: 'Atlético de Madrid', ciudad: 'Bruselas' },
  { a: 1975, c: 'Bayern de Múnich', s: 'Leeds United', ciudad: 'París' },
  { a: 1976, c: 'Bayern de Múnich', s: 'Saint-Étienne', ciudad: 'Glasgow' },
  { a: 1977, c: 'Liverpool', s: 'Borussia Mönchengladbach', ciudad: 'Roma' },
  { a: 1978, c: 'Liverpool', s: 'Brujas', ciudad: 'Londres' },
  { a: 1979, c: 'Nottingham Forest', s: 'Malmö', ciudad: 'Múnich' },
  { a: 1980, c: 'Nottingham Forest', s: 'Hamburgo', ciudad: 'Madrid' },
  { a: 1981, c: 'Liverpool', s: 'Real Madrid', ciudad: 'París' },
  { a: 1982, c: 'Aston Villa', s: 'Bayern de Múnich', ciudad: 'Róterdam' },
  { a: 1983, c: 'Hamburgo', s: 'Juventus', ciudad: 'Atenas' },
  { a: 1984, c: 'Liverpool', s: 'Roma', ciudad: 'Roma' },
  { a: 1985, c: 'Juventus', s: 'Liverpool', ciudad: 'Bruselas' },
  { a: 1986, c: 'Steaua de Bucarest', s: 'FC Barcelona', ciudad: 'Sevilla' },
  { a: 1987, c: 'Oporto', s: 'Bayern de Múnich', ciudad: 'Viena' },
  { a: 1988, c: 'PSV Eindhoven', s: 'Benfica', ciudad: 'Stuttgart' },
  { a: 1989, c: 'AC Milan', s: 'Steaua de Bucarest', ciudad: 'Barcelona' },
  { a: 1990, c: 'AC Milan', s: 'Benfica', ciudad: 'Viena' },
  { a: 1991, c: 'Estrella Roja', s: 'Olympique de Marsella', ciudad: 'Bari' },
  { a: 1992, c: 'FC Barcelona', s: 'Sampdoria', ciudad: 'Londres' },
  { a: 1993, c: 'Olympique de Marsella', s: 'AC Milan', ciudad: 'Múnich' },
  { a: 1994, c: 'AC Milan', s: 'FC Barcelona', ciudad: 'Atenas' },
  { a: 1995, c: 'Ajax', s: 'AC Milan', ciudad: 'Viena' },
  { a: 1996, c: 'Juventus', s: 'Ajax', ciudad: 'Roma' },
  { a: 1997, c: 'Borussia Dortmund', s: 'Juventus', ciudad: 'Múnich' },
  { a: 1998, c: 'Real Madrid', s: 'Juventus', ciudad: 'Ámsterdam' },
  { a: 1999, c: 'Manchester United', s: 'Bayern de Múnich', ciudad: 'Barcelona' },
  { a: 2000, c: 'Real Madrid', s: 'Valencia', ciudad: 'París' },
  { a: 2001, c: 'Bayern de Múnich', s: 'Valencia', ciudad: 'Milán' },
  { a: 2002, c: 'Real Madrid', s: 'Bayer Leverkusen', ciudad: 'Glasgow' },
  { a: 2003, c: 'AC Milan', s: 'Juventus', ciudad: 'Mánchester' },
  { a: 2004, c: 'Oporto', s: 'Mónaco', ciudad: 'Gelsenkirchen' },
  { a: 2005, c: 'Liverpool', s: 'AC Milan', ciudad: 'Estambul' },
  { a: 2006, c: 'FC Barcelona', s: 'Arsenal', ciudad: 'París' },
  { a: 2007, c: 'AC Milan', s: 'Liverpool', ciudad: 'Atenas' },
  { a: 2008, c: 'Manchester United', s: 'Chelsea', ciudad: 'Moscú' },
  { a: 2009, c: 'FC Barcelona', s: 'Manchester United', ciudad: 'Roma' },
  { a: 2010, c: 'Inter de Milán', s: 'Bayern de Múnich', ciudad: 'Madrid' },
  { a: 2011, c: 'FC Barcelona', s: 'Manchester United', ciudad: 'Londres' },
  { a: 2012, c: 'Chelsea', s: 'Bayern de Múnich', ciudad: 'Múnich' },
  { a: 2013, c: 'Bayern de Múnich', s: 'Borussia Dortmund', ciudad: 'Londres' },
  { a: 2014, c: 'Real Madrid', s: 'Atlético de Madrid', ciudad: 'Lisboa' },
  { a: 2015, c: 'FC Barcelona', s: 'Juventus', ciudad: 'Berlín' },
  { a: 2016, c: 'Real Madrid', s: 'Atlético de Madrid', ciudad: 'Milán' },
  { a: 2017, c: 'Real Madrid', s: 'Juventus', ciudad: 'Cardiff' },
  { a: 2018, c: 'Real Madrid', s: 'Liverpool', ciudad: 'Kiev' },
  { a: 2019, c: 'Liverpool', s: 'Tottenham', ciudad: 'Madrid' },
  { a: 2020, c: 'Bayern de Múnich', s: 'PSG', ciudad: 'Lisboa' },
  { a: 2021, c: 'Chelsea', s: 'Manchester City', ciudad: 'Oporto' },
  { a: 2022, c: 'Real Madrid', s: 'Liverpool', ciudad: 'París' },
  { a: 2023, c: 'Manchester City', s: 'Inter de Milán', ciudad: 'Estambul' },
  { a: 2024, c: 'Real Madrid', s: 'Borussia Dortmund', ciudad: 'Londres' },
  { a: 2025, c: 'PSG', s: 'Inter de Milán', ciudad: 'Múnich' }
];

// ------------------------------------------------------------- Balón de Oro
export const BALONES = [
  [1956, 'Stanley Matthews'], [1957, 'Alfredo Di Stéfano'], [1958, 'Raymond Kopa'], [1959, 'Alfredo Di Stéfano'],
  [1960, 'Luis Suárez Miramontes'], [1961, 'Omar Sívori'], [1962, 'Josef Masopust'], [1963, 'Lev Yashin'],
  [1964, 'Denis Law'], [1965, 'Eusébio'], [1966, 'Bobby Charlton'], [1967, 'Flórián Albert'],
  [1968, 'George Best'], [1969, 'Gianni Rivera'], [1970, 'Gerd Müller'], [1971, 'Johan Cruyff'],
  [1972, 'Franz Beckenbauer'], [1973, 'Johan Cruyff'], [1974, 'Johan Cruyff'], [1975, 'Oleg Blokhin'],
  [1976, 'Franz Beckenbauer'], [1977, 'Allan Simonsen'], [1978, 'Kevin Keegan'], [1979, 'Kevin Keegan'],
  [1980, 'Karl-Heinz Rummenigge'], [1981, 'Karl-Heinz Rummenigge'], [1982, 'Paolo Rossi'], [1983, 'Michel Platini'],
  [1984, 'Michel Platini'], [1985, 'Michel Platini'], [1986, 'Igor Belanov'], [1987, 'Ruud Gullit'],
  [1988, 'Marco van Basten'], [1989, 'Marco van Basten'], [1990, 'Lothar Matthäus'], [1991, 'Jean-Pierre Papin'],
  [1992, 'Marco van Basten'], [1993, 'Roberto Baggio'], [1994, 'Hristo Stoichkov'], [1995, 'George Weah'],
  [1996, 'Matthias Sammer'], [1997, 'Ronaldo Nazário'], [1998, 'Zinedine Zidane'], [1999, 'Rivaldo'],
  [2000, 'Luis Figo'], [2001, 'Michael Owen'], [2002, 'Ronaldo Nazário'], [2003, 'Pavel Nedvěd'],
  [2004, 'Andriy Shevchenko'], [2005, 'Ronaldinho'], [2006, 'Fabio Cannavaro'], [2007, 'Kaká'],
  [2008, 'Cristiano Ronaldo'], [2009, 'Leo Messi'], [2010, 'Leo Messi'], [2011, 'Leo Messi'],
  [2012, 'Leo Messi'], [2013, 'Cristiano Ronaldo'], [2014, 'Cristiano Ronaldo'], [2015, 'Leo Messi'],
  [2016, 'Cristiano Ronaldo'], [2017, 'Cristiano Ronaldo'], [2018, 'Luka Modrić'], [2019, 'Leo Messi'],
  [2021, 'Leo Messi'], [2022, 'Karim Benzema'], [2023, 'Leo Messi'], [2024, 'Rodri Hernández'],
  [2025, 'Ousmane Dembélé']
];

// ----------------------------------------------------------------- Pichichi
// [temporada, jugador, goles, club]
export const PICHICHIS = [
  ['1996/97', 'Ronaldo Nazário', 34, 'FC Barcelona'], ['1997/98', 'Christian Vieri', 24, 'Atlético de Madrid'],
  ['1998/99', 'Raúl González', 25, 'Real Madrid'], ['1999/00', 'Salva Ballesta', 27, 'Racing de Santander'],
  ['2000/01', 'Raúl González', 24, 'Real Madrid'], ['2001/02', 'Diego Tristán', 21, 'Deportivo de La Coruña'],
  ['2002/03', 'Roy Makaay', 29, 'Deportivo de La Coruña'], ['2004/05', 'Diego Forlán', 25, 'Villarreal'],
  ['2005/06', "Samuel Eto'o", 26, 'FC Barcelona'], ['2006/07', 'Ruud van Nistelrooy', 25, 'Real Madrid'],
  ['2007/08', 'Daniel Güiza', 27, 'Mallorca'], ['2008/09', 'Diego Forlán', 32, 'Atlético de Madrid'],
  ['2009/10', 'Leo Messi', 34, 'FC Barcelona'], ['2010/11', 'Cristiano Ronaldo', 40, 'Real Madrid'],
  ['2011/12', 'Leo Messi', 50, 'FC Barcelona'], ['2012/13', 'Leo Messi', 46, 'FC Barcelona'],
  ['2013/14', 'Cristiano Ronaldo', 31, 'Real Madrid'], ['2014/15', 'Cristiano Ronaldo', 48, 'Real Madrid'],
  ['2015/16', 'Luis Suárez', 40, 'FC Barcelona'], ['2016/17', 'Leo Messi', 37, 'FC Barcelona'],
  ['2017/18', 'Leo Messi', 34, 'FC Barcelona'], ['2018/19', 'Leo Messi', 36, 'FC Barcelona'],
  ['2019/20', 'Leo Messi', 25, 'FC Barcelona'], ['2020/21', 'Leo Messi', 30, 'FC Barcelona'],
  ['2021/22', 'Karim Benzema', 27, 'Real Madrid'], ['2022/23', 'Robert Lewandowski', 23, 'FC Barcelona'],
  ['2023/24', 'Artem Dovbyk', 24, 'Girona'], ['2024/25', 'Kylian Mbappé', 31, 'Real Madrid']
];

// -------------------------------------------------------- Campeones de Liga
export const LIGAS_ESP = [
  ['1995/96', 'Atlético de Madrid'], ['1996/97', 'Real Madrid'], ['1997/98', 'FC Barcelona'], ['1998/99', 'FC Barcelona'],
  ['1999/00', 'Deportivo de La Coruña'], ['2000/01', 'Real Madrid'], ['2001/02', 'Valencia'], ['2002/03', 'Real Madrid'],
  ['2003/04', 'Valencia'], ['2004/05', 'FC Barcelona'], ['2005/06', 'FC Barcelona'], ['2006/07', 'Real Madrid'],
  ['2007/08', 'Real Madrid'], ['2008/09', 'FC Barcelona'], ['2009/10', 'FC Barcelona'], ['2010/11', 'FC Barcelona'],
  ['2011/12', 'Real Madrid'], ['2012/13', 'FC Barcelona'], ['2013/14', 'Atlético de Madrid'], ['2014/15', 'FC Barcelona'],
  ['2015/16', 'FC Barcelona'], ['2016/17', 'Real Madrid'], ['2017/18', 'FC Barcelona'], ['2018/19', 'FC Barcelona'],
  ['2019/20', 'Real Madrid'], ['2020/21', 'Atlético de Madrid'], ['2021/22', 'Real Madrid'], ['2022/23', 'FC Barcelona'],
  ['2023/24', 'Real Madrid'], ['2024/25', 'FC Barcelona']
];

export const PREMIER = [
  ['2003/04', 'Arsenal'], ['2004/05', 'Chelsea'], ['2005/06', 'Chelsea'], ['2006/07', 'Manchester United'],
  ['2007/08', 'Manchester United'], ['2008/09', 'Manchester United'], ['2009/10', 'Chelsea'], ['2010/11', 'Manchester United'],
  ['2011/12', 'Manchester City'], ['2012/13', 'Manchester United'], ['2013/14', 'Manchester City'], ['2014/15', 'Chelsea'],
  ['2015/16', 'Leicester City'], ['2016/17', 'Chelsea'], ['2017/18', 'Manchester City'], ['2018/19', 'Manchester City'],
  ['2019/20', 'Liverpool'], ['2020/21', 'Manchester City'], ['2021/22', 'Manchester City'], ['2022/23', 'Manchester City'],
  ['2023/24', 'Manchester City'], ['2024/25', 'Liverpool']
];

// --------------------------------------------------- Fundación de clubes
export const FUNDACIONES = [
  ['el Real Madrid', 1902], ['el FC Barcelona', 1899], ['el Atlético de Madrid', 1903], ['el Athletic Club', 1898],
  ['el Valencia CF', 1919], ['el Sevilla FC', 1890], ['el Real Betis', 1907], ['la Real Sociedad', 1909],
  ['el Villarreal CF', 1923], ['el RCD Espanyol', 1900], ['el Deportivo de La Coruña', 1906], ['el Celta de Vigo', 1923],
  ['Osasuna', 1920], ['el Rayo Vallecano', 1924], ['el RCD Mallorca', 1916], ['el Elche CF', 1923],
  ['el Deportivo Alavés', 1921], ['el Cádiz CF', 1910], ['el Girona FC', 1930], ['la SD Eibar', 1940],
  ['el Real Zaragoza', 1932], ['el Real Oviedo', 1926], ['el Sporting de Gijón', 1905], ['el Racing de Santander', 1913],
  ['el Levante UD', 1909], ['el Getafe CF', 1983], ['el Bayern de Múnich', 1900], ['el Borussia Dortmund', 1909],
  ['la Juventus', 1897], ['el AC Milan', 1899], ['el Inter de Milán', 1908], ['la AS Roma', 1927],
  ['el Ajax', 1900], ['el Benfica', 1904], ['el Oporto', 1893], ['el Arsenal', 1886],
  ['el Chelsea', 1905], ['el Liverpool', 1892], ['el Tottenham', 1882], ['el Boca Juniors', 1905],
  ['el River Plate', 1901], ['el Santos FC', 1912]
];

export const INAUGURACIONES = [
  ['el estadio Santiago Bernabéu', 1947], ['el Camp Nou', 1957], ['el estadio de Mestalla', 1923],
  ['el estadio de Maracaná', 1950], ['el estadio Azteca', 1966], ['el Allianz Arena', 2005],
  ['el estadio Vicente Calderón', 1966], ['el Riyadh Air Metropolitano (Metropolitano)', 2017],
  ['el nuevo San Mamés', 2013], ['el estadio Ramón Sánchez-Pizjuán', 1958], ['el estadio Old Trafford', 1910],
  ['el nuevo estadio de Wembley', 2007]
];

// --------------------------------------------------- Estadios y clubes
// Solo estadios que pertenecen a un único club.
export const ESTADIOS = [
  ['Santiago Bernabéu', 'Real Madrid'], ['Camp Nou', 'FC Barcelona'], ['Mestalla', 'Valencia'],
  ['San Mamés', 'Athletic Club'], ['Ramón Sánchez-Pizjuán', 'Sevilla'], ['Benito Villamarín', 'Real Betis'],
  ['Anoeta', 'Real Sociedad'], ['El Sadar', 'Osasuna'], ['Balaídos', 'Celta de Vigo'], ['Riazor', 'Deportivo de La Coruña'],
  ['Mendizorroza', 'Deportivo Alavés'], ['Estadio de la Cerámica', 'Villarreal'], ['Ipurua', 'Eibar'],
  ['Montilivi', 'Girona'], ['El Molinón', 'Sporting de Gijón'], ['La Romareda', 'Real Zaragoza'],
  ['La Rosaleda', 'Málaga'], ['Nuevo Los Cármenes', 'Granada'], ['Martínez Valero', 'Elche'],
  ['Estadio de Vallecas', 'Rayo Vallecano'], ['Son Moix', 'Mallorca'], ['Carlos Tartiere', 'Real Oviedo'],
  ['El Sardinero', 'Racing de Santander'], ['José Zorrilla', 'Real Valladolid'], ['Ciutat de València', 'Levante'],
  ['Nuevo Mirandilla', 'Cádiz'], ['Coliseum', 'Getafe'], ['Butarque', 'Leganés'],
  ['Anfield', 'Liverpool'], ['Old Trafford', 'Manchester United'], ['Stamford Bridge', 'Chelsea'],
  ['Emirates Stadium', 'Arsenal'], ['Etihad Stadium', 'Manchester City'], ['Goodison Park', 'Everton'],
  ["St James' Park", 'Newcastle United'], ['Allianz Arena', 'Bayern de Múnich'], ['Signal Iduna Park', 'Borussia Dortmund'],
  ['Parc des Princes', 'PSG'], ['Stade Vélodrome', 'Olympique de Marsella'], ['Estádio da Luz', 'Benfica'],
  ['Estádio do Dragão', 'Oporto'], ['La Bombonera', 'Boca Juniors'], ['Johan Cruyff Arena', 'Ajax'],
  ['Estadio Diego Armando Maradona', 'Nápoles'], ['Celtic Park', 'Celtic'], ['Ibrox', 'Rangers'],
  ['Vila Belmiro', 'Santos']
];

export const APODOS = [
  ['«Los Leones»', 'Athletic Club'], ['«El Submarino Amarillo»', 'Villarreal'], ['«Los Verdiblancos»', 'Real Betis'],
  ['«Los Che»', 'Valencia'], ['«Los Rojillos»', 'Osasuna'], ['«Los Azulones»', 'Getafe'],
  ['«Los Franjirrojos»', 'Rayo Vallecano'], ['«Los Periquitos»', 'RCD Espanyol'], ['«Los Babazorros»', 'Deportivo Alavés'],
  ['«Los Armeros»', 'Eibar'], ['«Los Colchoneros»', 'Atlético de Madrid'], ['«Los Merengues»', 'Real Madrid'],
  ['«Los Culés»', 'FC Barcelona'], ['«La Vecchia Signora»', 'Juventus'], ['«I Rossoneri»', 'AC Milan'],
  ['«Los Gunners»', 'Arsenal'], ['«Los Toffees»', 'Everton'], ['«Los Spurs»', 'Tottenham']
];

export const APODOS_PERSONAS = [
  ['«El Bicho»', 'Cristiano Ronaldo'], ['«La Pulga»', 'Leo Messi'], ['«El Pibe de Oro»', 'Diego Maradona'],
  ['«El Fenómeno»', 'Ronaldo Nazário'], ['«El Kun»', 'Sergio Agüero'], ['«El Cholo»', 'Diego Simeone'],
  ['«El Apache»', 'Carlos Tévez'], ['«La Araña Negra»', 'Lev Yashin'], ['«El Káiser»', 'Franz Beckenbauer'],
  ['«Il Divin Codino»', 'Roberto Baggio'], ['«El Niño»', 'Fernando Torres'], ['«El Guaje»', 'David Villa'],
  ['«La Perla Negra»', 'Eusébio'], ['«El Matador»', 'Mario Kempes'], ['«Zizou»', 'Zinedine Zidane'],
  ['«El Loco»', 'Marcelo Bielsa'], ['«San Iker»', 'Iker Casillas'], ['«Batigol»', 'Gabriel Batistuta'],
  ['«Il Capitano»', 'Francesco Totti'], ['«La Saeta Rubia»', 'Alfredo Di Stéfano']
];

// ------------------------------------------------------------------ Fichajes
// [jugador, origen, destino, año]
export const FICHAJES = [
  ['Neymar', 'FC Barcelona', 'PSG', 2017], ['Kylian Mbappé', 'PSG', 'Real Madrid', 2024],
  ['Cristiano Ronaldo', 'Real Madrid', 'Juventus', 2018], ['Cristiano Ronaldo', 'Juventus', 'Manchester United', 2021],
  ['Leo Messi', 'FC Barcelona', 'PSG', 2021], ['Leo Messi', 'PSG', 'Inter Miami', 2023],
  ['Ronaldo Nazário', 'FC Barcelona', 'Inter de Milán', 1997], ['Ronaldo Nazário', 'Inter de Milán', 'Real Madrid', 2002],
  ['David Beckham', 'Manchester United', 'Real Madrid', 2003], ['Zinedine Zidane', 'Juventus', 'Real Madrid', 2001],
  ['Luis Figo', 'FC Barcelona', 'Real Madrid', 2000], ["Samuel Eto'o", 'FC Barcelona', 'Inter de Milán', 2009],
  ['Zlatan Ibrahimović', 'Inter de Milán', 'FC Barcelona', 2009], ['Cesc Fàbregas', 'Arsenal', 'FC Barcelona', 2011],
  ['Fernando Torres', 'Atlético de Madrid', 'Liverpool', 2007], ['Fernando Torres', 'Liverpool', 'Chelsea', 2011],
  ['Xabi Alonso', 'Liverpool', 'Real Madrid', 2009], ['Mesut Özil', 'Real Madrid', 'Arsenal', 2013],
  ['Ángel Di María', 'Real Madrid', 'Manchester United', 2014], ['Robert Lewandowski', 'Bayern de Múnich', 'FC Barcelona', 2022],
  ['Jude Bellingham', 'Borussia Dortmund', 'Real Madrid', 2023], ['Erling Haaland', 'Borussia Dortmund', 'Manchester City', 2022],
  ['Harry Kane', 'Tottenham', 'Bayern de Múnich', 2023], ['Luis Suárez', 'Liverpool', 'FC Barcelona', 2014],
  ['Luis Suárez', 'FC Barcelona', 'Atlético de Madrid', 2020], ['Antoine Griezmann', 'Atlético de Madrid', 'FC Barcelona', 2019],
  ['Thibaut Courtois', 'Chelsea', 'Real Madrid', 2018], ['Eden Hazard', 'Chelsea', 'Real Madrid', 2019],
  ['Mohamed Salah', 'Roma', 'Liverpool', 2017], ['Virgil van Dijk', 'Southampton', 'Liverpool', 2018],
  ['Paul Pogba', 'Juventus', 'Manchester United', 2016], ['Ousmane Dembélé', 'Borussia Dortmund', 'FC Barcelona', 2017],
  ['Philippe Coutinho', 'Liverpool', 'FC Barcelona', 2018], ['Kaká', 'AC Milan', 'Real Madrid', 2009],
  ['Gareth Bale', 'Tottenham', 'Real Madrid', 2013], ['Dani Alves', 'Sevilla', 'FC Barcelona', 2008],
  ['Gerard Piqué', 'Manchester United', 'FC Barcelona', 2008], ['Thiago Alcántara', 'FC Barcelona', 'Bayern de Múnich', 2013],
  ['Raphaël Varane', 'Real Madrid', 'Manchester United', 2021], ['Sergio Ramos', 'Real Madrid', 'PSG', 2021],
  ['Luka Modrić', 'Tottenham', 'Real Madrid', 2012], ['Casemiro', 'Real Madrid', 'Manchester United', 2022],
  ['Karim Benzema', 'Real Madrid', 'Al-Ittihad', 2023], ['Neymar', 'Santos', 'FC Barcelona', 2013],
  ['Michael Owen', 'Liverpool', 'Real Madrid', 2004], ['Arjen Robben', 'Chelsea', 'Real Madrid', 2007],
  ['Arjen Robben', 'Real Madrid', 'Bayern de Múnich', 2009], ['Luis Figo', 'Real Madrid', 'Inter de Milán', 2005],
  ['Roberto Carlos', 'Real Madrid', 'Fenerbahçe', 2007], ['David Beckham', 'Real Madrid', 'LA Galaxy', 2007],
  ['Raúl González', 'Real Madrid', 'Schalke 04', 2010]
];
