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
    ['Gianluigi Buffon', 1978, 192], ['Thibaut Courtois', 1992, 200], ['Harry Kane', 1993, 188]
  ]),
  ...L('cine', [
    ['Leonardo DiCaprio', 1974, 183], ['Brad Pitt', 1963, 180], ['Tom Cruise', 1962, 170], ['Penélope Cruz', 1974, 168],
    ['Antonio Banderas', 1960, 174], ['Javier Bardem', 1969, 181], ['Scarlett Johansson', 1984, 160], ['Meryl Streep', 1949, 168],
    ['Tom Hanks', 1956, 183], ['Johnny Depp', 1963, 178], ['Angelina Jolie', 1975, 169], ['Will Smith', 1968, 188],
    ['Dwayne Johnson', 1972, 196], ['Keanu Reeves', 1964, 186], ['Zendaya', 1996, 178], ['Margot Robbie', 1990, 168],
    ['Jennifer Lawrence', 1990, 175], ['Nicole Kidman', 1967, 180], ['Robert De Niro', 1943, 177], ['Al Pacino', 1940, 168],
    ['Morgan Freeman', 1937, 188], ['Jackie Chan', 1954, 174], ['Arnold Schwarzenegger', 1947, 188], ['Emma Watson', 1990, 165],
    ['Daniel Radcliffe', 1989, 165], ['Ryan Gosling', 1980, 184], ['Timothée Chalamet', 1995, 178], ['Natalie Portman', 1981, 160],
    ['Julia Roberts', 1967, 175]
  ]),
  ...L('musica', [
    ['Shakira', 1977, 157], ['Rosalía', 1992, 164], ['Bad Bunny', 1994, 180], ['Taylor Swift', 1989, 180], ['Beyoncé', 1981, 169],
    ['Rihanna', 1988, 173], ['Lady Gaga', 1986, 155], ['Ed Sheeran', 1991, 173], ['Justin Bieber', 1994, 175],
    ['Michael Jackson', 1958, 175], ['Madonna', 1958, 163], ['Elvis Presley', 1935, 182], ['Freddie Mercury', 1946, 177],
    ['Paul McCartney', 1942, 180], ['Enrique Iglesias', 1975, 188], ['Julio Iglesias', 1943, 183], ['Alejandro Sanz', 1968, 174],
    ['Bruno Mars', 1985, 165], ['Dua Lipa', 1995, 173], ['Billie Eilish', 2001, 161], ['Ariana Grande', 1993, 153],
    ['Adele', 1988, 175], ['Eminem', 1972, 173], ['Drake', 1986, 182], ['The Weeknd', 1990, 173], ['Harry Styles', 1994, 183]
  ]),
  ...L('deporte', [
    ['Rafael Nadal', 1986, 185], ['Roger Federer', 1981, 185], ['Novak Djokovic', 1987, 188], ['Carlos Alcaraz', 2003, 183],
    ['Serena Williams', 1981, 175], ['Usain Bolt', 1986, 195], ['Michael Jordan', 1963, 198], ['LeBron James', 1984, 206],
    ['Pau Gasol', 1980, 213], ['Stephen Curry', 1988, 188], ['Michael Phelps', 1985, 193], ['Simone Biles', 1997, 142],
    ['Fernando Alonso', 1981, 171], ['Lewis Hamilton', 1985, 174], ['Max Verstappen', 1997, 181], ['Marc Márquez', 1993, 168],
    ['Valentino Rossi', 1979, 182], ['Tiger Woods', 1975, 185], ['Mike Tyson', 1966, 178], ['Muhammad Ali', 1942, 191],
    ['Kobe Bryant', 1978, 198], ["Shaquille O'Neal", 1972, 216], ['Carolina Marín', 1993, 172], ['Conor McGregor', 1988, 175],
    ['Garbiñe Muguruza', 1993, 182]
  ]),
  ...L('historia', [
    ['Albert Einstein', 1879], ['Isaac Newton', 1643], ['Leonardo da Vinci', 1452], ['Napoleón Bonaparte', 1769],
    ['Cristóbal Colón', 1451], ['Marie Curie', 1867], ['Charles Darwin', 1809], ['Galileo Galilei', 1564],
    ['William Shakespeare', 1564], ['Miguel de Cervantes', 1547], ['Pablo Picasso', 1881], ['Salvador Dalí', 1904],
    ['Frida Kahlo', 1907], ['Vincent van Gogh', 1853], ['Wolfgang Amadeus Mozart', 1756], ['Ludwig van Beethoven', 1770],
    ['Abraham Lincoln', 1809], ['Nelson Mandela', 1918], ['Mahatma Gandhi', 1869], ['Martin Luther King', 1929],
    ['Nikola Tesla', 1856], ['Isabel la Católica', 1451], ['Francisco de Goya', 1746], ['Federico García Lorca', 1898],
    ['Charles Chaplin', 1889], ['Neil Armstrong', 1930], ['Stephen Hawking', 1942], ['Steve Jobs', 1955], ['Bill Gates', 1955],
    ['Elon Musk', 1971], ['Mark Zuckerberg', 1984]
  ])
];
