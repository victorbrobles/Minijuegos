// server/data/seeds/ordenar/temas.js
// Temas con un valor numérico para «Ponlo en orden» (ordenar 6) y «El Intruso Histórico» (el que no es de su época).
// Cada tema: { id, titulo, emoji, criterio (de menor a mayor), mayor (al revés), unidad, epoca: 'siglo'|'decada'|null,
//   gap: diferencia mínima entre dos valores de la misma ronda (absoluta en años; si no, relativa 0-1), items: [[nombre, valor]] }.
// Los valores aproximados (pesos, poblaciones…) solo se juntan si se diferencian bastante (gap relativo).

const T = (id, titulo, emoji, criterio, mayor, unidad, epoca, gap, items) => ({ id, titulo, emoji, criterio, mayor, unidad, epoca, gap, items });

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
  ])
];

/** ¿Se pueden poner juntos en la misma ronda? (valores bien distintos) */
export function separados(tema, a, b) {
  if (tema.epoca) return Math.abs(a - b) >= tema.gap;
  if (!tema.gap) return a !== b;
  return Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b)) >= tema.gap;
}
