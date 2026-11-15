// server/data/seeds/ordenar/temas.js
// Temas con un valor numérico para «Ponlo en orden» (ordenar 6) y «El Intruso Histórico» (el que no es de su época).
// Cada tema: { id, (abs: gap absoluto sin época), (soloOrden: solo para «Ponlo en orden»), (items con 3.º valor = etiqueta a mostrar), titulo, emoji, criterio (de menor a mayor), mayor (al revés), unidad, epoca: 'siglo'|'decada'|null,
//   gap: diferencia mínima entre dos valores de la misma ronda (absoluta en años; si no, relativa 0-1), items: [[nombre, valor]] }.
// Los valores aproximados (pesos, poblaciones…) solo se juntan si se diferencian bastante (gap relativo).

const T = (id, titulo, emoji, criterio, mayor, unidad, epoca, gap, items, extra = {}) => ({ id, titulo, emoji, criterio, mayor, unidad, epoca, gap, items, ...extra });
// Años que no son para «El intruso histórico» (por épocas): diferencia mínima absoluta en años.
const A = (id, titulo, emoji, criterio, mayor, unidad, gap, items) => T(id, titulo, emoji, criterio, mayor, unidad, null, gap, items, { abs: true });

export const TEMAS = [
  T('inventos', 'Inventos', '💡', 'Del más antiguo al más moderno', 'Del más moderno al más antiguo', 'año', 'siglo', 4, [
    ['La imprenta de Gutenberg', 1450], ['El telescopio', 1608], ['El pararrayos', 1752], ['La máquina de vapor de Watt', 1769],
    ['La vacuna contra la viruela', 1796], ['La pila eléctrica', 1800], ['La fotografía', 1826], ['El telégrafo de Morse', 1837],
    ['La dinamita', 1867], ['El teléfono', 1876], ['La bombilla de Edison', 1879], ['El automóvil de Benz', 1886],
    ['El cinematógrafo', 1895], ['El avión de los hermanos Wright', 1903], ['La televisión', 1926], ['La penicilina', 1928],
    ['El bolígrafo', 1938], ['El ordenador ENIAC', 1945], ['El transistor', 1947], ['La fregona', 1956], ['El Chupa Chups', 1958],
    ['El láser', 1960], ['Internet (ARPANET)', 1969], ['El teléfono móvil', 1973], ['El cubo de Rubik', 1974], ['El walkman', 1979],
    ['El CD', 1982], ['La World Wide Web', 1989], ['El DVD', 1995], ['El iPhone', 2007]
  ]),
  T('hechos', 'Hechos históricos', '📜', 'Del más antiguo al más reciente', 'Del más reciente al más antiguo', 'año', 'siglo', 4, [
    ['Caída del Imperio romano de Occidente', 476], ['Batalla de las Navas de Tolosa', 1212], ['Conquista de Constantinopla por los otomanos', 1453],
    ['Llegada de Colón a América', 1492], ['Las 95 tesis de Lutero', 1517], ['Independencia de Estados Unidos', 1776],
    ['Toma de la Bastilla', 1789], ['Batalla de Trafalgar', 1805], ['Primer tren en España (Barcelona-Mataró)', 1848],
    ['Abolición de la esclavitud en Estados Unidos', 1865], ['Hundimiento del Titanic', 1912], ['Comienzo de la Primera Guerra Mundial', 1914],
    ['Revolución rusa', 1917], ['Comienzo de la Guerra Civil española', 1936], ['Comienzo de la Segunda Guerra Mundial', 1939],
    ['Asesinato de John F. Kennedy', 1963], ['Llegada del hombre a la Luna', 1969], ['Muerte de Franco', 1975],
    ['Aprobación de la Constitución española', 1978], ['Entrada de España en la CEE', 1986], ['Caída del muro de Berlín', 1989],
    ['Juegos Olímpicos de Barcelona', 1992], ['Atentados del 11 de septiembre', 2001], ['Llegada del euro en monedas y billetes', 2002],
    ['Comienzo de la pandemia de COVID-19', 2020]
  ]),
  T('peliculas', 'Películas', '🎬', 'De la más antigua a la más reciente', 'De la más reciente a la más antigua', 'año de estreno', 'decada', 2, [
    ['Blancanieves y los siete enanitos (Disney)', 1937], ['Lo que el viento se llevó', 1939], ['Ciudadano Kane', 1941], ['Casablanca', 1942],
    ['Psicosis', 1960], ['El padrino', 1972], ['Tiburón', 1975], ['Rocky', 1976], ['La guerra de las galaxias', 1977], ['Alien', 1979],
    ['E.T., el extraterrestre', 1982], ['Terminator', 1984], ['Regreso al futuro', 1985], ['Top Gun', 1986], ['Parque Jurásico', 1993],
    ['El rey león', 1994], ['Toy Story', 1995], ['Titanic', 1997], ['Matrix', 1999], ['Gladiator', 2000], ['Shrek', 2001],
    ['Buscando a Nemo', 2003], ['El laberinto del fauno', 2006], ['Avatar', 2009], ['Origen', 2010], ['Frozen', 2013],
    ['Interstellar', 2014], ['Joker', 2019], ['Oppenheimer', 2023]
  ]),
  T('consolas', 'Videoconsolas', '🎮', 'De la más antigua a la más moderna', 'De la más moderna a la más antigua', 'año de lanzamiento', 'decada', 2, [
    ['Atari 2600', 1977], ['NES (Famicom)', 1983], ['Game Boy', 1989], ['Super Nintendo', 1990], ['PlayStation', 1994],
    ['Nintendo 64', 1996], ['Dreamcast', 1998], ['PlayStation 2', 2000], ['Xbox', 2001], ['Nintendo DS', 2004], ['Xbox 360', 2005],
    ['Wii', 2006], ['Wii U', 2012], ['PlayStation 4', 2013], ['Nintendo Switch', 2017], ['PlayStation 5', 2020], ['Nintendo Switch 2', 2025]
  ]),
  T('libros', 'Libros', '📚', 'Del más antiguo al más reciente', 'Del más reciente al más antiguo', 'año de publicación', 'siglo', 4, [
    ['La Divina Comedia', 1320], ['La Celestina', 1499], ['El Lazarillo de Tormes', 1554], ['Romeo y Julieta', 1597], ['El Quijote (primera parte)', 1605],
    ['Orgullo y prejuicio', 1813], ['Frankenstein', 1818], ['Don Juan Tenorio', 1844], ['Moby Dick', 1851], ['Los miserables', 1862],
    ['Crimen y castigo', 1866], ['Guerra y paz', 1869], ['Las aventuras de Tom Sawyer', 1876], ['La Regenta', 1884], ['Drácula', 1897],
    ['El principito', 1943], ['1984', 1949], ['El señor de los anillos', 1954], ['Rayuela', 1963], ['Cien años de soledad', 1967],
    ['El nombre de la rosa', 1980], ['Harry Potter y la piedra filosofal', 1997], ['La sombra del viento', 2001], ['El código Da Vinci', 2003]
  ]),
  T('arte', 'Obras de arte', '🖼️', 'De la más antigua a la más reciente', 'De la más reciente a la más antigua', 'año', 'siglo', 4, [
    ['El nacimiento de Venus (Botticelli)', 1485], ['La última cena (Leonardo)', 1498], ['La bóveda de la Capilla Sixtina', 1512],
    ['Las meninas (Velázquez)', 1656], ['La joven de la perla (Vermeer)', 1665], ['El 3 de mayo en Madrid (Goya)', 1814],
    ['La libertad guiando al pueblo (Delacroix)', 1830], ['Impresión, sol naciente (Monet)', 1872], ['La noche estrellada (Van Gogh)', 1889],
    ['El grito (Munch)', 1893], ['Las señoritas de Avignon (Picasso)', 1907], ['La persistencia de la memoria (Dalí)', 1931],
    ['Guernica (Picasso)', 1937], ['Díptico de Marilyn (Warhol)', 1962], ['El hijo del hombre (Magritte)', 1964]
  ]),
  T('personajes', 'Personajes históricos', '👤', 'Del que nació antes al que nació después', 'Del que nació después al que nació antes', 'año de nacimiento', 'siglo', 5, [
    ['Julio César', -100], ['Cleopatra', -69], ['Carlomagno', 742], ['Cristóbal Colón', 1451], ['Miguel Ángel', 1475], ['Miguel de Cervantes', 1547],
    ['William Shakespeare', 1564], ['Isaac Newton', 1643], ['Francisco de Goya', 1746], ['Wolfgang Amadeus Mozart', 1756], ['Napoleón Bonaparte', 1769],
    ['Charles Darwin', 1809], ['Sigmund Freud', 1856], ['Marie Curie', 1867], ['Albert Einstein', 1879], ['Pablo Picasso', 1881],
    ['Federico García Lorca', 1898], ['Frida Kahlo', 1907], ['Martin Luther King', 1929], ['Steve Jobs', 1955]
  ]),
  T('mundiales', 'Mundiales de fútbol', '⚽', 'Del más antiguo al más reciente', 'Del más reciente al más antiguo', 'año', 'decada', 4, [
    ['Mundial de Uruguay', 1930], ['Mundial de Suiza', 1954], ['Mundial de Suecia', 1958], ['Mundial de Chile', 1962], ['Mundial de Inglaterra', 1966],
    ['Mundial de Argentina', 1978], ['Mundial de España', 1982], ['Mundial de Estados Unidos', 1994], ['Mundial de Corea y Japón', 2002],
    ['Mundial de Sudáfrica', 2010], ['Mundial de Rusia', 2018], ['Mundial de Catar', 2022]
  ]),
  T('rios', 'Ríos', '🏞️', 'Del más corto al más largo', 'Del más largo al más corto', 'km', null, 0.08, [
    ['Nilo', 6650], ['Yangtsé', 6300], ['Río Amarillo', 5464], ['Paraná', 4880], ['Congo', 4700], ['Mekong', 4350], ['Níger', 4180],
    ['Misuri', 3767], ['Volga', 3530], ['Indo', 3180], ['Danubio', 2850], ['Ganges', 2525], ['Orinoco', 2140], ['Rin', 1233],
    ['Elba', 1094], ['Tajo', 1007], ['Ebro', 930], ['Ródano', 812], ['Sena', 777], ['Guadiana', 744], ['Guadalquivir', 657], ['Támesis', 346]
  ]),
  T('montanas', 'Montañas', '⛰️', 'De la más baja a la más alta', 'De la más alta a la más baja', 'metros', null, 0.05, [
    ['Everest', 8849], ['K2', 8611], ['Aconcagua', 6961], ['Chimborazo', 6263], ['Denali', 6190], ['Kilimanjaro', 5895], ['Elbrus', 5642],
    ['Mont Blanc', 4806], ['Cervino', 4478], ['Mauna Kea', 4207], ['Monte Fuji', 3776], ['Teide', 3715], ['Mulhacén', 3479],
    ['Monte Olimpo', 2918], ['Almanzor', 2591], ['Moncayo', 2314], ['Ben Nevis', 1345], ['Vesubio', 1281]
  ]),
  T('planetas', 'Distancia al Sol', '🪐', 'Del más cercano al Sol al más lejano', 'Del más lejano al Sol al más cercano', 'millones de km', null, 0.1, [
    ['Mercurio', 58], ['Venus', 108], ['Tierra', 150], ['Marte', 228], ['Ceres', 414], ['Júpiter', 778], ['Saturno', 1434],
    ['Urano', 2871], ['Neptuno', 4495], ['Plutón', 5906]
  ]),
  T('animales', 'Animales (peso de un adulto)', '🐘', 'Del más ligero al más pesado', 'Del más pesado al más ligero', 'kg (aprox.)', null, 0.3, [
    ['Ballena azul', 150000], ['Elefante africano', 6000], ['Rinoceronte blanco', 2300], ['Hipopótamo', 1500], ['Jirafa', 1000],
    ['Vaca', 700], ['Caballo', 500], ['Oso polar', 450], ['Tigre', 220], ['Gorila', 160], ['Avestruz', 120], ['Ser humano', 70],
    ['Lobo', 40], ['Águila real', 5], ['Gato doméstico', 4], ['Conejo', 2], ['Ratón', 0.02], ['Colibrí', 0.004]
  ]),
  T('edificios', 'Construcciones (altura)', '🏙️', 'De la más baja a la más alta', 'De la más alta a la más baja', 'metros', null, 0.08, [
    ['Burj Khalifa', 828], ['Merdeka 118', 679], ['Shanghai Tower', 632], ['Torre CN', 553], ['One World Trade Center', 541],
    ['Taipei 101', 508], ['Torres Petronas', 452], ['Empire State Building', 443], ['Torre Eiffel', 330], ['Torre de Cristal (Madrid)', 249],
    ['Sagrada Familia', 172], ['Torre Agbar', 145], ['Gran Pirámide de Guiza', 139], ['La Giralda', 104], ['Big Ben', 96],
    ['Estatua de la Libertad (con pedestal)', 93], ['Torre de Pisa', 56]
  ]),
  T('superficie', 'Países (superficie)', '🗺️', 'Del más pequeño al más grande', 'Del más grande al más pequeño', 'km²', null, 0.1, [
    ['Rusia', 17098000], ['Canadá', 9985000], ['China', 9597000], ['Brasil', 8516000], ['Australia', 7692000], ['India', 3287000],
    ['Argentina', 2780000], ['Argelia', 2382000], ['México', 1964000], ['Perú', 1285000], ['Egipto', 1002000], ['España', 506000],
    ['Japón', 378000], ['Alemania', 357000], ['Italia', 301000], ['Reino Unido', 243000], ['Portugal', 92000], ['Suiza', 41000],
    ['Bélgica', 30500], ['Luxemburgo', 2586], ['Andorra', 468], ['Mónaco', 2]
  ]),
  T('poblacion', 'Países (población)', '👥', 'Del menos poblado al más poblado', 'Del más poblado al menos poblado', 'millones (2024, aprox.)', null, 0.15, [
    ['India', 1441], ['Estados Unidos', 340], ['Indonesia', 280], ['Nigeria', 230], ['Brasil', 212], ['Rusia', 144], ['México', 130],
    ['Japón', 124], ['Alemania', 84], ['Francia', 68], ['Italia', 59], ['Colombia', 52], ['España', 48.6], ['Canadá', 40],
    ['Perú', 34], ['Chile', 19.7], ['Países Bajos', 17.9], ['Portugal', 10.4], ['Suiza', 8.9], ['Uruguay', 3.4], ['Islandia', 0.39]
  ]),
  T('ciudades', 'Ciudades españolas (población)', '🏘️', 'De la menos poblada a la más poblada', 'De la más poblada a la menos poblada', 'habitantes (aprox.)', null, 0.12, [
    ['Madrid', 3400000], ['Barcelona', 1700000], ['Valencia', 800000], ['Málaga', 590000], ['Murcia', 470000], ['Palma', 430000],
    ['Las Palmas de Gran Canaria', 380000], ['Córdoba', 320000], ['Valladolid', 300000], ['Gijón', 268000], ['Granada', 230000],
    ['Burgos', 175000], ['Salamanca', 144000], ['Toledo', 86000], ['Soria', 40000]
  ]),
  T('velocidad', 'Velocidad máxima', '💨', 'Del más lento al más rápido', 'Del más rápido al más lento', 'km/h (aprox.)', null, 0.2, [
    ['Caracol', 0.05], ['Tortuga terrestre', 0.3], ['Usain Bolt', 44.7], ['Caballo de carreras', 70], ['Guepardo', 110],
    ['Halcón peregrino en picado', 320], ['Avión comercial', 900], ['Sonido en el aire', 1235], ['Concorde', 2180],
    ['Estación Espacial Internacional', 27600]
  ]),
  T('elementos', 'Elementos químicos', '⚗️', 'Del menor número atómico al mayor', 'Del mayor número atómico al menor', 'número atómico', null, 0, [
    ['Hidrógeno', 1], ['Helio', 2], ['Carbono', 6], ['Nitrógeno', 7], ['Oxígeno', 8], ['Sodio', 11], ['Aluminio', 13], ['Silicio', 14],
    ['Cloro', 17], ['Calcio', 20], ['Hierro', 26], ['Cobre', 29], ['Plata', 47], ['Estaño', 50], ['Oro', 79], ['Mercurio', 80],
    ['Plomo', 82], ['Uranio', 92], ['Plutonio', 94]
  ]),
  // ───────── Más variedad ─────────
  A('clubes', 'Clubes de fútbol (fundación)', '🛡️', 'Del más antiguo al más joven', 'Del más joven al más antiguo', 'año de fundación', 3, [
    ['Manchester United', 1878], ['Arsenal', 1886], ['Recreativo de Huelva', 1889], ['Sevilla FC', 1890], ['Liverpool', 1892], ['Juventus', 1897],
    ['Athletic Club', 1898], ['FC Barcelona', 1899], ['Bayern de Múnich', 1900], ['River Plate', 1901], ['Real Madrid', 1902], ['Atlético de Madrid', 1903],
    ['Chelsea', 1905], ['Real Betis', 1907], ['Inter de Milán', 1908], ['Real Sociedad', 1909], ['Valencia CF', 1919], ['Villarreal', 1923],
    ['Paris Saint-Germain', 1970], ['Getafe', 1983]
  ]),
  T('estadios', 'Estadios (aforo)', '🏟️', 'Del de menos aforo al de más', 'Del de más aforo al de menos', 'espectadores (aprox.)', null, 0.07, [
    ['Camp Nou', 105000], ['Wembley', 90000], ['Estadio Azteca', 87500], ['Santiago Bernabéu', 83000], ['Signal Iduna Park (Dortmund)', 81000],
    ['San Siro', 75800], ['Metropolitano', 70500], ['Anfield', 61000], ['La Cartuja', 57600], ['San Mamés', 53300], ['Mestalla', 49400],
    ['Parc des Princes', 48000], ['Anoeta (Reale Arena)', 39500], ['Montilivi', 14600], ['Vallecas', 14700], ['Ipurua', 8200]
  ]),
  T('goleadores_mundial', 'Goles en Mundiales', '🥅', 'Del que menos marcó al que más', 'Del que más marcó al que menos', 'goles en Mundiales', null, 0, [
    ['Miroslav Klose', 16], ['Ronaldo Nazário', 15], ['Gerd Müller', 14], ['Lionel Messi', 13], ['Pelé', 12], ['Sándor Kocsis', 11],
    ['Gary Lineker', 10], ['David Villa', 9], ['Diego Maradona', 8], ['Cristiano Ronaldo', 8], ['Paolo Rossi', 9], ['Zinedine Zidane', 5],
    ['Fernando Torres', 4], ['Andrés Iniesta', 2]
  ]),
  T('equipo_campo', 'Deportes (jugadores por equipo en el campo)', '🏉', 'Del que menos al que más', 'Del que más al que menos', 'jugadores', null, 0, [
    ['Tenis (individual)', 1], ['Vóley playa', 2], ['Polo', 4], ['Baloncesto', 5], ['Voleibol', 6], ['Balonmano', 7], ['Béisbol', 9],
    ['Fútbol', 11], ['Rugby', 15], ['Fútbol australiano', 18]
  ]),
  A('olimpiadas', 'Juegos Olímpicos de verano', '🏅', 'De los más antiguos a los más recientes', 'De los más recientes a los más antiguos', 'año', 4, [
    ['Estocolmo', 1912], ['Amberes', 1920], ['Ámsterdam', 1928], ['Berlín', 1936], ['Helsinki', 1952], ['Melbourne', 1956], ['Roma', 1960],
    ['México', 1968], ['Múnich', 1972], ['Montreal', 1976], ['Moscú', 1980], ['Seúl', 1988], ['Barcelona', 1992], ['Atlanta', 1996],
    ['Sídney', 2000], ['Pekín', 2008], ['Río de Janeiro', 2016]
  ]),
  A('series', 'Series de televisión', '📺', 'De la más antigua a la más reciente', 'De la más reciente a la más antigua', 'año de estreno', 3, [
    ['Star Trek', 1966], ['Dallas', 1978], ['Verano azul', 1981], ['Los Simpson', 1989], ['Farmacia de guardia', 1991], ['Friends', 1994],
    ['Médico de familia', 1995], ['Los Soprano', 1999], ['Cuéntame cómo pasó', 2001], ['Aquí no hay quien viva', 2003], ['Perdidos', 2004],
    ['Prison Break', 2005], ['The Big Bang Theory', 2007], ['Breaking Bad', 2008], ['Juego de tronos', 2011], ['El ministerio del tiempo', 2015],
    ['Stranger Things', 2016], ['La casa de papel', 2017], ['El juego del calamar', 2021], ['The Last of Us', 2023]
  ]),
  A('canciones', 'Canciones', '🎵', 'De la más antigua a la más reciente', 'De la más reciente a la más antigua', 'año', 3, [
    ['Rock Around the Clock', 1954], ['Yesterday (The Beatles)', 1965], ['Hey Jude', 1968], ['Imagine', 1971], ['Bohemian Rhapsody', 1975],
    ['Stayin\' Alive', 1977], ['Like a Virgin', 1984], ['Smells Like Teen Spirit', 1991], ['Macarena', 1993], ['Wannabe (Spice Girls)', 1996],
    ['Livin\' la Vida Loca', 1999], ['Aserejé', 2002], ['Hips Don\'t Lie', 2006], ['Waka Waka', 2010], ['Gangnam Style', 2012],
    ['Happy (Pharrell Williams)', 2013], ['Despacito', 2017], ['Blinding Lights', 2019]
  ]),
  A('empresas', 'Empresas (fundación)', '🏢', 'De la más antigua a la más joven', 'De la más joven a la más antigua', 'año de fundación', 3, [
    ['Coca-Cola', 1886], ['Nintendo', 1889], ['Ford', 1903], ['Disney', 1923], ['Telefónica', 1924], ['LEGO', 1932], ['Toyota', 1937],
    ['El Corte Inglés', 1940], ['IKEA', 1943], ['Sony', 1946], ['Adidas', 1949], ['SEAT', 1950], ['Nike', 1964], ['Microsoft', 1975],
    ['Mercadona', 1977], ['Amazon', 1994], ['Netflix', 1997], ['Google', 1998], ['Tesla', 2003], ['Facebook', 2004], ['Spotify', 2006],
    ['WhatsApp', 2009], ['Instagram', 2010]
  ]),
  A('ficcion', 'Personajes de ficción (primera aparición)', '🦸', 'Del más antiguo al más reciente', 'Del más reciente al más antiguo', 'año', 3, [
    ['Mickey Mouse', 1928], ['Tintín', 1929], ['Superman', 1938], ['Bugs Bunny', 1940], ['Snoopy', 1950], ['Mortadelo y Filemón', 1958],
    ['Astérix', 1959], ['Spider-Man', 1962], ['Garfield', 1978], ['Pac-Man', 1980], ['Mario (en Donkey Kong)', 1981], ['Goku', 1984],
    ['Homer Simpson', 1987], ['Shin Chan', 1990], ['Sonic', 1991], ['Pikachu', 1996], ['Bob Esponja', 1999], ['Shrek', 2001]
  ]),
  A('monumentos', 'Monumentos (construcción)', '🏛️', 'Del más antiguo al más moderno', 'Del más moderno al más antiguo', 'año', 15, [
    ['Pirámide de Keops', -2560], ['Stonehenge', -2500], ['Partenón', -438], ['Coliseo de Roma', 80], ['Mezquita de Córdoba (inicio)', 786],
    ['Catedral de Notre Dame (inicio)', 1163], ['Machu Picchu', 1450], ['El Escorial (terminado)', 1584], ['Taj Mahal (terminado)', 1653],
    ['Puerta de Alcalá', 1778], ['Sagrada Familia (inicio)', 1882], ['Torre Eiffel', 1889], ['Empire State Building', 1931],
    ['Puente Golden Gate', 1937], ['Ópera de Sídney', 1973], ['Museo Guggenheim de Bilbao', 1997], ['Burj Khalifa', 2010]
  ]),
  T('ccaa_superficie', 'Comunidades autónomas (superficie)', '🇪🇸', 'De la más pequeña a la más grande', 'De la más grande a la más pequeña', 'km²', null, 0.12, [
    ['Castilla y León', 94226], ['Andalucía', 87599], ['Castilla-La Mancha', 79461], ['Aragón', 47720], ['Extremadura', 41634],
    ['Cataluña', 32108], ['Galicia', 29575], ['Comunidad Valenciana', 23255], ['Región de Murcia', 11313], ['Asturias', 10604],
    ['Navarra', 10391], ['Comunidad de Madrid', 8028], ['Canarias', 7447], ['País Vasco', 7234], ['Cantabria', 5321], ['La Rioja', 5045]
  ]),
  T('ccaa_poblacion', 'Comunidades autónomas (población)', '🏘️', 'De la menos poblada a la más poblada', 'De la más poblada a la menos poblada', 'millones de habitantes', null, 0.14, [
    ['Andalucía', 8.6], ['Cataluña', 8.0], ['Comunidad de Madrid', 7.0], ['Comunidad Valenciana', 5.3], ['Galicia', 2.7], ['Castilla y León', 2.38],
    ['Castilla-La Mancha', 2.1], ['Región de Murcia', 1.56], ['Aragón', 1.35], ['Extremadura', 1.05], ['Navarra', 0.68], ['Cantabria', 0.59],
    ['La Rioja', 0.32]
  ]),
  T('continentes', 'Continentes (superficie)', '🌍', 'Del más pequeño al más grande', 'Del más grande al más pequeño', 'millones de km²', null, 0.15, [
    ['Oceanía', 8.5], ['Europa', 10.2], ['Antártida', 14.2], ['América del Sur', 17.8], ['América del Norte', 24.7], ['África', 30.3], ['Asia', 44.6]
  ]),
  T('idiomas', 'Idiomas (hablantes nativos)', '🗣️', 'Del que menos hablantes nativos tiene al que más', 'Del que más hablantes nativos tiene al que menos', 'millones de hablantes nativos (aprox.)', null, 0.18, [
    ['Chino mandarín', 940], ['Español', 485], ['Inglés', 380], ['Portugués', 236], ['Ruso', 147], ['Japonés', 123], ['Alemán', 75],
    ['Italiano', 64], ['Polaco', 40], ['Neerlandés', 24], ['Griego', 13], ['Catalán', 4.1], ['Gallego', 2.4], ['Euskera', 0.75], ['Islandés', 0.33]
  ]),
  T('planetas_tamano', 'Astros (diámetro)', '🌕', 'Del más pequeño al más grande', 'Del más grande al más pequeño', 'km de diámetro', null, 0.1, [
    ['Plutón', 2377], ['La Luna', 3474], ['Mercurio', 4879], ['Marte', 6779], ['Venus', 12104], ['Neptuno', 49244], ['Saturno', 116460],
    ['Júpiter', 139820], ['El Sol', 1392700]
  ]),
  T('vida_animal', 'Animales (esperanza de vida)', '🐢', 'Del que menos vive al que más', 'Del que más vive al que menos', 'años (aprox.)', null, 0.3, [
    ['Mosca común', 0.08], ['Ratón', 2], ['Conejo', 9], ['Perro', 13], ['Gato', 15], ['Caballo', 28], ['Chimpancé', 40], ['Elefante africano', 65],
    ['Tortuga gigante de Galápagos', 150], ['Ballena de Groenlandia', 200]
  ]),
  T('gestacion', 'Animales (embarazo)', '🍼', 'Del embarazo más corto al más largo', 'Del embarazo más largo al más corto', 'días de gestación (aprox.)', null, 0.2, [
    ['Ratón', 20], ['Conejo', 31], ['Perro', 63], ['Cerdo', 114], ['Oveja', 150], ['Ser humano', 280], ['Caballo', 340], ['Jirafa', 450],
    ['Elefante africano', 650]
  ]),
  T('calorias', 'Alimentos (calorías)', '🍫', 'Del que menos engorda al que más', 'Del que más engorda al que menos', 'kcal por 100 g (aprox.)', null, 0.25, [
    ['Lechuga', 15], ['Manzana', 52], ['Plátano', 89], ['Arroz cocido', 130], ['Huevo', 155], ['Pan blanco', 265], ['Queso curado', 400],
    ['Chocolate negro', 550], ['Mantequilla', 717], ['Aceite de oliva', 884]
  ]),
  T('temperaturas', 'Temperaturas', '🌡️', 'De la más fría a la más caliente', 'De la más caliente a la más fría', '°C (aprox.)', null, 0.3, [
    ['Nitrógeno líquido', -196], ['Hielo seco', -78], ['Congelador de casa', -18], ['Cuerpo humano', 37], ['Agua hirviendo', 100],
    ['Horno de cocina al máximo', 250], ['Superficie de Venus', 465], ['Lava de un volcán', 1100], ['Hierro fundiéndose', 1538], ['Superficie del Sol', 5500]
  ]),
  T('fiestas', 'Fechas del calendario', '📅', 'De la primera del año a la última', 'De la última del año a la primera', 'fecha', null, 0, [
    ['Día de Reyes', 6, '6 de enero'], ['San Valentín', 45, '14 de febrero'], ['Día de la Mujer', 67, '8 de marzo'], ['San José', 78, '19 de marzo'],
    ['Día del Libro', 113, '23 de abril'], ['Día del Trabajo', 121, '1 de mayo'], ['Noche de San Juan', 175, '24 de junio'],
    ['San Fermín', 188, '7 de julio'], ['Día de la Asunción', 227, '15 de agosto'], ['Día de la Hispanidad', 285, '12 de octubre'],
    ['Halloween', 304, '31 de octubre'], ['Día de la Constitución', 340, '6 de diciembre'], ['Navidad', 359, '25 de diciembre'],
    ['Nochevieja', 365, '31 de diciembre']
  ], { soloOrden: true }),
  T('distancias', 'Distancia desde Madrid', '🚗', 'De la más cercana a la más lejana', 'De la más lejana a la más cercana', 'km por carretera (aprox.)', null, 0.15, [
    ['Toledo', 72], ['Segovia', 92], ['Salamanca', 212], ['Zaragoza', 315], ['Valencia', 355], ['Bilbao', 400], ['Sevilla', 530],
    ['Barcelona', 620], ['Lisboa', 625], ['Cádiz', 660], ['París', 1270], ['Roma', 1950], ['Berlín', 2300], ['Moscú', 3900]
  ]),
  T('records_atletismo', 'Pruebas de atletismo', '🏃', 'De la más corta a la más larga', 'De la más larga a la más corta', 'metros', null, 0.3, [
    ['60 metros (pista cubierta)', 60], ['100 metros', 100], ['400 metros', 400], ['1.500 metros', 1500], ['5.000 metros', 5000],
    ['10.000 metros', 10000], ['Media maratón', 21097], ['Maratón', 42195], ['50 km marcha', 50000]
  ], { soloOrden: true }),
  T('profundidad', 'Lugares por altitud', '🧗', 'Del más bajo al más alto', 'Del más alto al más bajo', 'metros sobre el nivel del mar', null, 0.25, [
    ['Mar Muerto', -430], ['Ámsterdam', -2], ['Madrid', 657], ['Andorra la Vella', 1023], ['Sierra Nevada (Veleta)', 3396],
    ['La Paz (Bolivia)', 3640], ['Mont Blanc', 4806], ['Kilimanjaro', 5895], ['Aconcagua', 6961], ['Everest', 8849]
  ]),
  T('peso_objetos', 'Objetos (peso)', '⚖️', 'Del más ligero al más pesado', 'Del más pesado al más ligero', 'kilos (aprox.)', null, 0.4, [
    ['Una moneda de 1 euro', 0.0075], ['Una pelota de tenis', 0.058], ['Un balón de fútbol', 0.43], ['Un portátil', 1.8], ['Una bici de carretera', 8],
    ['Una lavadora', 70], ['Un piano de cola', 400], ['Un coche utilitario', 1200], ['Un autobús', 12000], ['Un Boeing 747 vacío', 180000]
  ], { soloOrden: true }),
  T('huesos', 'Cuerpo humano: ¿cuántos hay?', '🫀', 'Del que menos al que más', 'Del que más al que menos', 'unidades', null, 0, [
    ['Corazones', 1], ['Pulmones', 2], ['Cámaras del corazón', 4], ['Sentidos clásicos', 5], ['Huesos de un dedo de la mano (no el pulgar)', 3],
    ['Vértebras', 33], ['Dientes de un adulto', 32], ['Dientes de leche', 20], ['Costillas', 24], ['Huesos de una mano', 27], ['Huesos en total (adulto)', 206]
  ], { soloOrden: true })
];

/** ¿Se pueden poner juntos en la misma ronda? (valores bien distintos) */
export function separados(tema, a, b) {
  if (tema.epoca || tema.abs) return Math.abs(a - b) >= tema.gap;
  if (!tema.gap) return a !== b;
  return Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b)) >= tema.gap;
}
