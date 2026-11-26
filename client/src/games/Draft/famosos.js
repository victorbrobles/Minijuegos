// client/src/games/Draft/famosos.js
// Famosos del «Draft de Estrellas» por categoría: año de nacimiento (a) y altura en cm (h, aproximada; null si no se
// sabe con fiabilidad). Solo datos públicos y estables (nada de seguidores o premios, que cambian cada año).
export const CATEGORIAS = {
  futbol: { nombre: 'Futbolistas', emoji: '⚽' },
  cine: { nombre: 'Cine', emoji: '🎬' },
  musica: { nombre: 'Música', emoji: '🎤' },
  deporte: { nombre: 'Otros deportes', emoji: '🏅' },
  historia: { nombre: 'Historia, arte y ciencia', emoji: '📜' }
};

const L = (c, lista) => lista.map(([n, a, h = null]) => ({ n, c, a, h }));

export const FAMOSOS = [
  ...L('futbol', [
    ['Lionel Messi', 1987, 170], ['Cristiano Ronaldo', 1985, 187], ['Kylian Mbappé', 1998, 178], ['Erling Haaland', 2000, 195],
    ['Luka Modrić', 1985, 172], ['Sergio Ramos', 1986, 184], ['Andrés Iniesta', 1984, 171], ['Xavi Hernández', 1980, 170],
    ['Iker Casillas', 1981, 182], ['Fernando Torres', 1984, 186], ['Zinedine Zidane', 1972, 185], ['Ronaldinho', 1980, 181],
    ['Ronaldo Nazário', 1976, 183], ['Neymar', 1992, 175], ['Robert Lewandowski', 1988, 185], ['Mohamed Salah', 1992, 175],
    ['Kevin De Bruyne', 1991, 181], ['Vinícius Júnior', 2000, 176], ['Jude Bellingham', 2003, 186], ['Lamine Yamal', 2007, 180],
    ['Pedri', 2002, 174], ['Gerard Piqué', 1987, 194], ['Zlatan Ibrahimović', 1981, 195], ['Diego Maradona', 1960, 165],
    ['Pelé', 1940, 173], ['Johan Cruyff', 1947, 178], ['Thierry Henry', 1977, 188], ['David Beckham', 1975, 183],
    ['Antoine Griezmann', 1991, 176], ['Raúl González', 1977, 180], ['Karim Benzema', 1987, 185], ['Manuel Neuer', 1986, 193],
    ['Gianluigi Buffon', 1978, 192], ['Thibaut Courtois', 1992, 200], ['Harry Kane', 1993, 188],
    ['Carles Puyol', 1978, 178], ['Sergio Busquets', 1988, 189], ['David Villa', 1981, 175], ['Xabi Alonso', 1981, 183],
    ['Paolo Maldini', 1968, 186], ['Franz Beckenbauer', 1945, 181], ['Alfredo Di Stéfano', 1926, 178], ['Kaká', 1982, 186],
    ['Wayne Rooney', 1985, 176], ['Steven Gerrard', 1980, 183], ['Frank Lampard', 1978, 184], ['Andrea Pirlo', 1979, 177],
    ['Francesco Totti', 1976, 180], ['Didier Drogba', 1978, 189], ["Samuel Eto'o", 1981, 180], ['Luis Suárez', 1987, 182],
    ['Gareth Bale', 1989, 185], ['Eden Hazard', 1991, 175], ['Virgil van Dijk', 1991, 193], ['Rodri', 1996, 191],
    ['Gavi', 2004, 173], ['Luis Figo', 1972, 180], ['Roberto Carlos', 1973, 168], ['Marcelo', 1988, 174],
    ['Jordi Alba', 1989, 170], ['Toni Kroos', 1990, 183], ['Son Heung-min', 1992, 183], ['Peter Crouch', 1981, 201],
    ['Fernando Hierro', 1968, 187], ['Iker Muniain', 1992, 169], ['Jesús Navas', 1985, 172], ['Joaquín Sánchez', 1981, 181]
  ]),
  ...L('cine', [
    ['Leonardo DiCaprio', 1974, 183], ['Brad Pitt', 1963, 180], ['Tom Cruise', 1962, 170], ['Penélope Cruz', 1974, 168],
    ['Antonio Banderas', 1960, 174], ['Javier Bardem', 1969, 181], ['Scarlett Johansson', 1984, 160], ['Meryl Streep', 1949, 168],
    ['Tom Hanks', 1956, 183], ['Johnny Depp', 1963, 178], ['Angelina Jolie', 1975, 169], ['Will Smith', 1968, 188],
    ['Dwayne Johnson', 1972, 196], ['Keanu Reeves', 1964, 186], ['Zendaya', 1996, 178], ['Margot Robbie', 1990, 168],
    ['Jennifer Lawrence', 1990, 175], ['Nicole Kidman', 1967, 180], ['Robert De Niro', 1943, 177], ['Al Pacino', 1940, 168],
    ['Morgan Freeman', 1937, 188], ['Jackie Chan', 1954, 174], ['Arnold Schwarzenegger', 1947, 188], ['Emma Watson', 1990, 165],
    ['Daniel Radcliffe', 1989, 165], ['Ryan Gosling', 1980, 184], ['Timothée Chalamet', 1995, 178], ['Natalie Portman', 1981, 160],
    ['Julia Roberts', 1967, 175],
    ['George Clooney', 1961, 180], ['Matt Damon', 1970, 178], ['Robert Downey Jr.', 1965, 174], ['Chris Hemsworth', 1983, 190],
    ['Hugh Jackman', 1968, 188], ['Denzel Washington', 1954, 185], ['Harrison Ford', 1942, 185], ['Sylvester Stallone', 1946, 177],
    ['Clint Eastwood', 1930, 188], ['Jim Carrey', 1962, 188], ['Adam Sandler', 1966, 177], ['Ben Stiller', 1965, 170],
    ['Anne Hathaway', 1982, 173], ['Sandra Bullock', 1964, 171], ['Cameron Diaz', 1972, 175], ['Charlize Theron', 1975, 177],
    ['Kate Winslet', 1975, 169], ['Emma Stone', 1988, 168], ['Gal Gadot', 1985, 178], ['Salma Hayek', 1966, 157],
    ['Danny DeVito', 1944, 147], ['Vin Diesel', 1967, 182], ['Jason Statham', 1967, 178], ['Tom Holland', 1996, 173],
    ['Pedro Pascal', 1975, 180], ['Úrsula Corberó', 1989, 163], ['Paz Vega', 1976, 163], ['Mario Casas', 1986, 179],
    ['Liam Neeson', 1952, 193], ['Christopher Lee', 1922, 196], ['Marilyn Monroe', 1926, 166], ['Audrey Hepburn', 1929, 170]
  ]),
  ...L('musica', [
    ['Shakira', 1977, 157], ['Rosalía', 1992, 164], ['Bad Bunny', 1994, 180], ['Taylor Swift', 1989, 180], ['Beyoncé', 1981, 169],
    ['Rihanna', 1988, 173], ['Lady Gaga', 1986, 155], ['Ed Sheeran', 1991, 173], ['Justin Bieber', 1994, 175],
    ['Michael Jackson', 1958, 175], ['Madonna', 1958, 163], ['Elvis Presley', 1935, 182], ['Freddie Mercury', 1946, 177],
    ['Paul McCartney', 1942, 180], ['Enrique Iglesias', 1975, 188], ['Julio Iglesias', 1943, 183], ['Alejandro Sanz', 1968, 174],
    ['Bruno Mars', 1985, 165], ['Dua Lipa', 1995, 173], ['Billie Eilish', 2001, 161], ['Ariana Grande', 1993, 153],
    ['Adele', 1988, 175], ['Eminem', 1972, 173], ['Drake', 1986, 182], ['The Weeknd', 1990, 173], ['Harry Styles', 1994, 183],
    ['John Lennon', 1940, 179], ['Mick Jagger', 1943, 178], ['Bob Marley', 1945, 170], ['David Bowie', 1947, 178],
    ['Elton John', 1947, 173], ['Prince', 1958, 157], ['Whitney Houston', 1963, 170], ['Celine Dion', 1968, 171],
    ['Jennifer Lopez', 1969, 164], ['Britney Spears', 1981, 163], ['Katy Perry', 1984, 170], ['Miley Cyrus', 1992, 165],
    ['Selena Gomez', 1992, 165], ['Karol G', 1991, 160], ['J Balvin', 1985, 177], ['Daddy Yankee', 1977, 169],
    ['Ricky Martin', 1971, 188], ['Luis Miguel', 1970, 175], ['Marc Anthony', 1968, 170], ['Snoop Dogg', 1971, 193],
    ['Kanye West', 1977, 173], ['Post Malone', 1995, 183], ['Aitana', 1999, 164], ['Pablo Alborán', 1989, 175],
    ['David Bisbal', 1979, 174], ['Raphael', 1943, 167], ['Rocío Jurado', 1944, 163], ['Camilo Sesto', 1946, 182],
    ['Chris Martin', 1977, 186], ['Bon Jovi', 1962, 175], ['Kurt Cobain', 1967, 175], ['Amy Winehouse', 1983, 159]
  ]),
  ...L('deporte', [
    ['Rafael Nadal', 1986, 185], ['Roger Federer', 1981, 185], ['Novak Djokovic', 1987, 188], ['Carlos Alcaraz', 2003, 183],
    ['Serena Williams', 1981, 175], ['Usain Bolt', 1986, 195], ['Michael Jordan', 1963, 198], ['LeBron James', 1984, 206],
    ['Pau Gasol', 1980, 213], ['Stephen Curry', 1988, 188], ['Michael Phelps', 1985, 193], ['Simone Biles', 1997, 142],
    ['Fernando Alonso', 1981, 171], ['Lewis Hamilton', 1985, 174], ['Max Verstappen', 1997, 181], ['Marc Márquez', 1993, 168],
    ['Valentino Rossi', 1979, 182], ['Tiger Woods', 1975, 185], ['Mike Tyson', 1966, 178], ['Muhammad Ali', 1942, 191],
    ['Kobe Bryant', 1978, 198], ["Shaquille O'Neal", 1972, 216], ['Carolina Marín', 1993, 172], ['Conor McGregor', 1988, 175],
    ['Garbiñe Muguruza', 1993, 182],
    ['Andy Murray', 1987, 190], ['Maria Sharapova', 1987, 188], ['Venus Williams', 1980, 185], ['Arantxa Sánchez Vicario', 1971, 169],
    ['Jannik Sinner', 2001, 191], ['Victor Wembanyama', 2004, 224], ['Luka Dončić', 1999, 201], ['Giannis Antetokounmpo', 1994, 211],
    ['Magic Johnson', 1959, 206], ['Larry Bird', 1956, 206], ['Yao Ming', 1980, 229], ['Dennis Rodman', 1961, 201],
    ['Juan Carlos Navarro', 1980, 192], ['Ricky Rubio', 1990, 191], ['Carl Lewis', 1961, 188], ['Mo Farah', 1983, 175],
    ['Eliud Kipchoge', 1984, 167], ['Ayrton Senna', 1960, 176], ['Michael Schumacher', 1969, 174], ['Carlos Sainz', 1994, 178],
    ['Jorge Lorenzo', 1987, 170], ['Dani Pedrosa', 1985, 158], ['Miguel Induráin', 1964, 188], ['Alberto Contador', 1982, 176],
    ['Tadej Pogačar', 1998, 176], ['Floyd Mayweather', 1977, 173], ['Ilia Topuria', 1997, 170], ['Mireia Belmonte', 1990, 173],
    ['Ona Carbonell', 1990, 174], ['Sergio García', 1980, 178], ['Seve Ballesteros', 1957, 183], ['Tom Brady', 1977, 193]
  ]),
  ...L('historia', [
    ['Albert Einstein', 1879], ['Isaac Newton', 1643], ['Leonardo da Vinci', 1452], ['Napoleón Bonaparte', 1769],
    ['Cristóbal Colón', 1451], ['Marie Curie', 1867], ['Charles Darwin', 1809], ['Galileo Galilei', 1564],
    ['William Shakespeare', 1564], ['Miguel de Cervantes', 1547], ['Pablo Picasso', 1881], ['Salvador Dalí', 1904],
    ['Frida Kahlo', 1907], ['Vincent van Gogh', 1853], ['Wolfgang Amadeus Mozart', 1756], ['Ludwig van Beethoven', 1770],
    ['Abraham Lincoln', 1809], ['Nelson Mandela', 1918], ['Mahatma Gandhi', 1869], ['Martin Luther King', 1929],
    ['Nikola Tesla', 1856], ['Isabel la Católica', 1451], ['Francisco de Goya', 1746], ['Federico García Lorca', 1898],
    ['Charles Chaplin', 1889], ['Neil Armstrong', 1930], ['Stephen Hawking', 1942], ['Steve Jobs', 1955], ['Bill Gates', 1955],
    ['Elon Musk', 1971], ['Mark Zuckerberg', 1984],
    ['Julio César', -100], ['Cleopatra', -69], ['Aristóteles', -384], ['Platón', -428], ['Sócrates', -470],
    ['Alejandro Magno', -356], ['Carlomagno', 748], ['Juana de Arco', 1412], ['Miguel Ángel', 1475], ['Hernán Cortés', 1485],
    ['Carlos I de España', 1500], ['Felipe II', 1527], ['Diego Velázquez', 1599], ['Rembrandt', 1606], ['Johann Sebastian Bach', 1685],
    ['Benjamin Franklin', 1706], ['George Washington', 1732], ['Simón Bolívar', 1783], ['Reina Victoria', 1819], ['Louis Pasteur', 1822],
    ['Thomas Edison', 1847], ['Sigmund Freud', 1856], ['Santiago Ramón y Cajal', 1852], ['Antoni Gaudí', 1852], ['Winston Churchill', 1874],
    ['Coco Chanel', 1883], ['Walt Disney', 1901], ['Ana Frank', 1929], ['John F. Kennedy', 1917], ['Isabel II', 1926],
    ['Jacques Cousteau', 1910], ['Clara Campoamor', 1888]
  ])
];
