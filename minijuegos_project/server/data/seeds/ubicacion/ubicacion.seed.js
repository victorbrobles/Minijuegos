// Lugares emblemáticos para el minijuego «Ubica el lugar».
//
// Formato: l(id, nombre, país, latitud, longitud, artículo_de_Wikipedia)
//  - id: texto único y estable (sin espacios).
//  - artículo_de_Wikipedia: título del artículo en en.wikipedia.org (con guiones bajos).
//    La foto se saca de ahí en el navegador y SOLO se acepta si está alojada en Wikimedia
//    Commons (todo lo que hay en Commons tiene licencia libre). Si un artículo no tiene foto
//    de Commons, ese lugar simplemente se descarta en esa partida.
//  - Opcional: añade un 7.º argumento con la URL de una foto propia para forzarla.
//
// Para añadir un lugar basta con una línea nueva. El servidor valida el seed al arrancar.

export const l = (id, nombre, pais, lat, lng, wiki, imagen = null) => ({ id, nombre, pais, lat, lng, wiki, imagen });

export const LUGARES = [
  // ===================== EUROPA =====================
  l('torre-eiffel', 'Torre Eiffel', 'Francia', 48.8584, 2.2945, 'Eiffel_Tower'),
  l('coliseo', 'Coliseo', 'Italia', 41.8902, 12.4922, 'Colosseum'),
  l('sagrada-familia', 'Sagrada Familia', 'España', 41.4036, 2.1744, 'Sagrada_Família'),
  l('big-ben', 'Big Ben', 'Reino Unido', 51.5007, -0.1246, 'Big_Ben'),
  l('puerta-brandeburgo', 'Puerta de Brandeburgo', 'Alemania', 52.5163, 13.3777, 'Brandenburg_Gate'),
  l('torre-pisa', 'Torre inclinada de Pisa', 'Italia', 43.723, 10.3966, 'Leaning_Tower_of_Pisa'),
  l('partenon', 'Partenón', 'Grecia', 37.9715, 23.7267, 'Parthenon'),
  l('san-basilio', 'Catedral de San Basilio', 'Rusia', 55.7525, 37.6231, "Saint_Basil's_Cathedral"),
  l('stonehenge', 'Stonehenge', 'Reino Unido', 51.1789, -1.8262, 'Stonehenge'),
  l('alhambra', 'Alhambra', 'España', 37.177, -3.5886, 'Alhambra'),
  l('neuschwanstein', 'Castillo de Neuschwanstein', 'Alemania', 47.5576, 10.7498, 'Neuschwanstein_Castle'),
  l('mont-saint-michel', 'Mont Saint-Michel', 'Francia', 48.6361, -1.5115, 'Mont-Saint-Michel'),
  l('acueducto-segovia', 'Acueducto de Segovia', 'España', 40.948, -4.1184, 'Aqueduct_of_Segovia'),
  l('santa-sofia', 'Santa Sofía', 'Turquía', 41.0086, 28.9802, 'Hagia_Sophia'),
  l('catedral-colonia', 'Catedral de Colonia', 'Alemania', 50.9413, 6.9583, 'Cologne_Cathedral'),
  l('fontana-trevi', 'Fontana di Trevi', 'Italia', 41.9009, 12.4833, 'Trevi_Fountain'),
  l('duomo-florencia', 'Duomo de Florencia', 'Italia', 43.7731, 11.256, 'Florence_Cathedral'),
  l('san-marcos-venecia', 'Basílica de San Marcos', 'Italia', 45.4345, 12.3397, "St_Mark's_Basilica"),
  l('castillo-edimburgo', 'Castillo de Edimburgo', 'Reino Unido', 55.9486, -3.1999, 'Edinburgh_Castle'),
  l('tower-bridge', 'Tower Bridge', 'Reino Unido', 51.5055, -0.0754, 'Tower_Bridge'),
  l('versalles', 'Palacio de Versalles', 'Francia', 48.8049, 2.1204, 'Palace_of_Versailles'),
  l('preikestolen', 'Preikestolen (el Púlpito)', 'Noruega', 58.9863, 6.1904, 'Preikestolen'),
  l('sirenita', 'La Sirenita de Copenhague', 'Dinamarca', 55.6929, 12.5993, 'The_Little_Mermaid_(statue)'),
  l('puente-carlos', 'Puente de Carlos', 'Chequia', 50.0865, 14.4114, 'Charles_Bridge'),
  l('parlamento-budapest', 'Parlamento de Budapest', 'Hungría', 47.5071, 19.0456, 'Hungarian_Parliament_Building'),
  l('castillo-bran', 'Castillo de Bran', 'Rumanía', 45.515, 25.3672, 'Bran_Castle'),
  l('acantilados-moher', 'Acantilados de Moher', 'Irlanda', 52.9715, -9.4309, 'Cliffs_of_Moher'),
  l('calzada-gigante', 'Calzada del Gigante', 'Reino Unido', 55.2408, -6.5116, "Giant's_Causeway"),
  l('meteora', 'Meteora', 'Grecia', 39.7217, 21.6306, 'Meteora'),
  l('santorini', 'Santorini', 'Grecia', 36.3932, 25.4615, 'Santorini'),
  l('plaza-espana-sevilla', 'Plaza de España de Sevilla', 'España', 37.3772, -5.9869, 'Plaza_de_España,_Seville'),
  l('mezquita-cordoba', 'Mezquita-Catedral de Córdoba', 'España', 37.8789, -4.7794, 'Mosque–Cathedral_of_Córdoba'),
  l('ciudad-artes-ciencias', 'Ciudad de las Artes y las Ciencias', 'España', 39.454, -0.35, 'City_of_Arts_and_Sciences'),
  l('torre-belem', 'Torre de Belém', 'Portugal', 38.6916, -9.216, 'Belém_Tower'),
  l('palacio-pena', 'Palacio da Pena', 'Portugal', 38.7876, -9.3906, 'Pena_Palace'),
  l('catedral-santiago', 'Catedral de Santiago de Compostela', 'España', 42.8806, -8.5447, 'Santiago_de_Compostela_Cathedral'),
  l('matterhorn', 'Cervino (Matterhorn)', 'Suiza', 45.9763, 7.6586, 'Matterhorn'),
  l('kinderdijk', 'Molinos de Kinderdijk', 'Países Bajos', 51.883, 4.64, 'Kinderdijk'),
  l('grand-place', 'Grand-Place de Bruselas', 'Bélgica', 50.8467, 4.3525, 'Grand-Place'),
  l('hallgrimskirkja', 'Iglesia de Hallgrímur', 'Islandia', 64.1417, -21.9266, 'Hallgrímskirkja'),
  l('palacio-invierno', 'Palacio de Invierno (Hermitage)', 'Rusia', 59.9398, 30.3146, 'Winter_Palace'),
  l('murallas-dubrovnik', 'Murallas de Dubrovnik', 'Croacia', 42.641, 18.11, 'Walls_of_Dubrovnik'),
  l('plitvice', 'Lagos de Plitvice', 'Croacia', 44.8654, 15.582, 'Plitvice_Lakes_National_Park'),
  l('hallstatt', 'Hallstatt', 'Austria', 47.5622, 13.6493, 'Hallstatt'),
  l('schonbrunn', 'Palacio de Schönbrunn', 'Austria', 48.1845, 16.3122, 'Schönbrunn_Palace'),
  l('san-pedro-vaticano', 'Basílica de San Pedro', 'Ciudad del Vaticano', 41.9022, 12.4539, "St._Peter's_Basilica"),
  l('pompeya', 'Pompeya', 'Italia', 40.751, 14.4869, 'Pompeii'),
  l('mont-blanc', 'Mont Blanc', 'Francia / Italia', 45.8326, 6.8652, 'Mont_Blanc'),
  l('lago-bled', 'Lago Bled', 'Eslovenia', 46.3639, 14.0938, 'Lake_Bled'),

  // ===================== ASIA =====================
  l('taj-mahal', 'Taj Mahal', 'India', 27.1751, 78.0421, 'Taj_Mahal'),
  l('gran-muralla', 'Gran Muralla China (Badaling)', 'China', 40.4319, 116.5704, 'Great_Wall_of_China'),
  l('ciudad-prohibida', 'Ciudad Prohibida', 'China', 39.9163, 116.3972, 'Forbidden_City'),
  l('angkor-wat', 'Angkor Wat', 'Camboya', 13.4125, 103.867, 'Angkor_Wat'),
  l('monte-fuji', 'Monte Fuji', 'Japón', 35.3606, 138.7274, 'Mount_Fuji'),
  l('kinkaku-ji', 'Kinkaku-ji (Pabellón Dorado)', 'Japón', 35.0394, 135.7292, 'Kinkaku-ji'),
  l('petra', 'Petra', 'Jordania', 30.3285, 35.4444, 'Petra'),
  l('cupula-roca', 'Cúpula de la Roca', 'Jerusalén', 31.778, 35.2354, 'Dome_of_the_Rock'),
  l('templo-dorado', 'Templo Dorado de Amritsar', 'India', 31.62, 74.8765, 'Golden_Temple'),
  l('borobudur', 'Borobudur', 'Indonesia', -7.6079, 110.2038, 'Borobudur'),
  l('ha-long', 'Bahía de Ha Long', 'Vietnam', 20.9101, 107.1839, 'Ha_Long_Bay'),
  l('gran-palacio-bangkok', 'Gran Palacio de Bangkok', 'Tailandia', 13.75, 100.4913, 'Grand_Palace'),
  l('shwedagon', 'Pagoda Shwedagon', 'Myanmar', 16.7984, 96.1495, 'Shwedagon_Pagoda'),
  l('potala', 'Palacio de Potala', 'Tíbet (China)', 29.6578, 91.1175, 'Potala_Palace'),
  l('terracota', 'Ejército de Terracota', 'China', 34.3841, 109.2785, 'Terracotta_Army'),
  l('himeji', 'Castillo de Himeji', 'Japón', 34.8394, 134.6939, 'Himeji_Castle'),
  l('itsukushima', 'Santuario de Itsukushima', 'Japón', 34.2961, 132.3199, 'Itsukushima_Shrine'),
  l('gyeongbokgung', 'Palacio Gyeongbokgung', 'Corea del Sur', 37.5796, 126.977, 'Gyeongbokgung'),
  l('sigiriya', 'Sigiriya', 'Sri Lanka', 7.957, 80.7603, 'Sigiriya'),
  l('everest', 'Monte Everest', 'Nepal / Tíbet', 27.9881, 86.925, 'Mount_Everest'),
  l('capadocia', 'Capadocia', 'Turquía', 38.6431, 34.8289, 'Cappadocia'),
  l('pamukkale', 'Pamukkale', 'Turquía', 37.9203, 29.1211, 'Pamukkale'),
  l('mezquita-sheikh-zayed', 'Gran Mezquita Sheikh Zayed', 'Emiratos Árabes Unidos', 24.4128, 54.475, 'Sheikh_Zayed_Grand_Mosque'),
  l('petronas', 'Torres Petronas', 'Malasia', 3.1579, 101.7116, 'Petronas_Towers'),

  // ===================== ÁFRICA =====================
  l('piramides-giza', 'Pirámides de Guiza', 'Egipto', 29.9792, 31.1342, 'Giza_pyramid_complex'),
  l('abu-simbel', 'Templos de Abu Simbel', 'Egipto', 22.3372, 31.6258, 'Abu_Simbel_temples'),
  l('karnak', 'Templo de Karnak', 'Egipto', 25.7188, 32.6573, 'Karnak'),
  l('kilimanjaro', 'Monte Kilimanjaro', 'Tanzania', -3.0674, 37.3556, 'Mount_Kilimanjaro'),
  l('cataratas-victoria', 'Cataratas Victoria', 'Zambia / Zimbabue', -17.9243, 25.8572, 'Victoria_Falls'),
  l('table-mountain', 'Montaña de la Mesa', 'Sudáfrica', -33.9628, 18.4098, 'Table_Mountain'),
  l('mezquita-hassan-ii', 'Mezquita Hassan II', 'Marruecos', 33.6086, -7.6326, 'Hassan_II_Mosque'),
  l('chefchaouen', 'Chefchaouen', 'Marruecos', 35.1688, -5.2636, 'Chefchaouen'),
  l('ait-benhaddou', 'Ait Benhaddou', 'Marruecos', 31.0472, -7.1319, 'Aït_Benhaddou'),
  l('mezquita-djenne', 'Gran Mezquita de Djenné', 'Malí', 13.9058, -4.5556, 'Great_Mosque_of_Djenné'),
  l('lalibela', 'Iglesias de Lalibela', 'Etiopía', 12.0319, 39.0473, 'Lalibela'),
  l('serengeti', 'Serengeti', 'Tanzania', -2.3333, 34.8333, 'Serengeti'),

  // ===================== NORTEAMÉRICA Y CARIBE =====================
  l('estatua-libertad', 'Estatua de la Libertad', 'Estados Unidos', 40.6892, -74.0445, 'Statue_of_Liberty'),
  l('golden-gate', 'Puente Golden Gate', 'Estados Unidos', 37.8199, -122.4783, 'Golden_Gate_Bridge'),
  l('monte-rushmore', 'Monte Rushmore', 'Estados Unidos', 43.8791, -103.4591, 'Mount_Rushmore'),
  l('gran-canon', 'Gran Cañón del Colorado', 'Estados Unidos', 36.1069, -112.1129, 'Grand_Canyon'),
  l('casa-blanca', 'Casa Blanca', 'Estados Unidos', 38.8977, -77.0365, 'White_House'),
  l('capitolio-eeuu', 'Capitolio de EE. UU.', 'Estados Unidos', 38.8899, -77.0091, 'United_States_Capitol'),
  l('niagara', 'Cataratas del Niágara', 'Canadá / Estados Unidos', 43.0828, -79.0742, 'Niagara_Falls'),
  l('torre-cn', 'Torre CN', 'Canadá', 43.6426, -79.3871, 'CN_Tower'),
  l('chichen-itza', 'Chichén Itzá', 'México', 20.6843, -88.5678, 'Chichen_Itza'),
  l('empire-state', 'Empire State Building', 'Estados Unidos', 40.7484, -73.9857, 'Empire_State_Building'),
  l('gateway-arch', 'Gateway Arch', 'Estados Unidos', 38.6247, -90.1848, 'Gateway_Arch'),
  l('monument-valley', 'Monument Valley', 'Estados Unidos', 36.998, -110.0985, 'Monument_Valley'),
  l('old-faithful', 'Géiser Old Faithful', 'Estados Unidos', 44.4605, -110.8281, 'Old_Faithful'),
  l('lago-louise', 'Lago Louise', 'Canadá', 51.4254, -116.1773, 'Lake_Louise_(Alberta)'),
  l('teotihuacan', 'Teotihuacán', 'México', 19.6925, -98.8438, 'Teotihuacan'),
  l('canal-panama', 'Canal de Panamá', 'Panamá', 8.9961, -79.5897, 'Panama_Canal'),
  l('alcatraz', 'Isla de Alcatraz', 'Estados Unidos', 37.8267, -122.423, 'Alcatraz_Island'),
  l('hollywood', 'Letrero de Hollywood', 'Estados Unidos', 34.1341, -118.3215, 'Hollywood_Sign'),
  l('denali', 'Denali', 'Estados Unidos', 63.0692, -151.007, 'Denali'),
  l('capitolio-habana', 'Capitolio de La Habana', 'Cuba', 23.1352, -82.359, 'El_Capitolio'),

  // ===================== SUDAMÉRICA =====================
  l('machu-picchu', 'Machu Picchu', 'Perú', -13.1631, -72.545, 'Machu_Picchu'),
  l('cristo-redentor', 'Cristo Redentor', 'Brasil', -22.9519, -43.2105, 'Christ_the_Redeemer_(statue)'),
  l('iguazu', 'Cataratas del Iguazú', 'Argentina / Brasil', -25.6953, -54.4367, 'Iguazu_Falls'),
  l('salar-uyuni', 'Salar de Uyuni', 'Bolivia', -20.1338, -67.4891, 'Salar_de_Uyuni'),
  l('isla-pascua', 'Isla de Pascua', 'Chile', -27.1127, -109.3497, 'Easter_Island'),
  l('torres-paine', 'Torres del Paine', 'Chile', -50.9423, -73.4068, 'Torres_del_Paine_National_Park'),
  l('perito-moreno', 'Glaciar Perito Moreno', 'Argentina', -50.4967, -73.1378, 'Perito_Moreno_Glacier'),
  l('galapagos', 'Islas Galápagos', 'Ecuador', -0.9538, -90.9656, 'Galápagos_Islands'),
  l('salto-angel', 'Salto Ángel', 'Venezuela', 5.9701, -62.5362, 'Angel_Falls'),
  l('titicaca', 'Lago Titicaca', 'Perú / Bolivia', -15.9254, -69.3354, 'Lake_Titicaca'),
  l('obelisco-buenos-aires', 'Obelisco de Buenos Aires', 'Argentina', -34.5755, -58.3861, 'Obelisk_of_Buenos_Aires'),
  l('cartagena-indias', 'Cartagena de Indias', 'Colombia', 10.4236, -75.5253, 'Cartagena,_Colombia'),

  // ===================== OCEANÍA =====================
  l('opera-sidney', 'Ópera de Sídney', 'Australia', -33.8568, 151.2153, 'Sydney_Opera_House'),
  l('uluru', 'Uluru', 'Australia', -25.3444, 131.0369, 'Uluru'),
  l('gran-barrera-coral', 'Gran Barrera de Coral', 'Australia', -18.2871, 147.6992, 'Great_Barrier_Reef'),
  l('milford-sound', 'Milford Sound', 'Nueva Zelanda', -44.6414, 167.8974, 'Milford_Sound'),
  l('bora-bora', 'Bora Bora', 'Polinesia Francesa', -16.5004, -151.7415, 'Bora_Bora'),
  l('doce-apostoles', 'Los Doce Apóstoles', 'Australia', -38.6622, 143.1044, 'Twelve_Apostles,_Victoria'),
  l('puente-bahia-sidney', 'Puente de la Bahía de Sídney', 'Australia', -33.8523, 151.2108, 'Sydney_Harbour_Bridge'),
  l('aoraki', 'Aoraki / Monte Cook', 'Nueva Zelanda', -43.595, 170.1418, 'Aoraki_/_Mount_Cook')
];

// Validación: avisa nada más arrancar si hay un id repetido o unas coordenadas imposibles.
const ids = new Set();
for (const x of LUGARES) {
  if (ids.has(x.id)) throw new Error(`Lugar duplicado en el seed de Ubica el lugar: ${x.id}`);
  ids.add(x.id);
  if (!(x.lat >= -90 && x.lat <= 90 && x.lng >= -180 && x.lng <= 180)) {
    throw new Error(`Coordenadas fuera de rango en «${x.id}»: ${x.lat}, ${x.lng}`);
  }
  if (!x.imagen && !x.wiki) throw new Error(`«${x.id}» necesita artículo de Wikipedia o una imagen propia`);
}

export default LUGARES;
