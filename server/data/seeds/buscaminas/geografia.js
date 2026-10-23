// server/data/seeds/buscaminas/geografia.js

const plantillas = [
  // 1 - 10: Países, Fronteras y Geopolítica Europea
  {
    c: 'Países miembros oficiales de la Unión Europea',
    f: ['España', 'Francia', 'Alemania', 'Italia'],
    m: ['Polonia', 'Portugal', 'Grecia'],
    d: ['Eslovaquia', 'Estonia', 'Luxemburgo'],
    t: ['Suiza', 'Noruega', 'Islandia', 'Andorra', 'Serbia']
  },
  {
    c: 'Capitales de países soberanos del continente europeo',
    f: ['Madrid', 'París', 'Berlín', 'Roma'],
    m: ['Lisboa', 'Viena', 'Ámsterdam'],
    d: ['Liubliana', 'Vilna', 'Skopie'],
    t: ['Ginebra', 'Zúrich', 'Milán', 'Múnich', 'Barcelona']
  },
  {
    c: 'Países que limitan por tierra con la República Francesa',
    f: ['España', 'Alemania', 'Italia', 'Bélgica'],
    m: ['Suiza', 'Luxemburgo', 'Mónaco'],
    d: ['Andorra', 'Brasil', 'Surinam'],
    t: ['Portugal', 'Países Bajos', 'Austria', 'Liechtenstein', 'Dinamarca']
  },
  {
    c: 'Países que forman parte de la península balcánica',
    f: ['Grecia', 'Serbia', 'Croacia', 'Albania'],
    m: ['Bosnia y Herzegovina', 'Bulgaria', 'Macedonia del Norte'],
    d: ['Montenegro', 'Eslovenia', 'Kosovo'],
    t: ['Hungría', 'Eslovaquia', 'Rumanía', 'Austria', 'República Checa']
  },
  {
    c: 'Países ribereños con costa en el Mar Báltico',
    f: ['Suecia', 'Finlandia', 'Polonia', 'Alemania'],
    m: ['Estonia', 'Letonia', 'Lituania'],
    d: ['Dinamarca', 'Rusia', 'Letonia'],
    t: ['Noruega', 'Países Bajos', 'Bélgica', 'Reino Unido', 'Islandia']
  },
  {
    c: 'Estados europeos sin salida al mar (sin litoral)',
    f: ['Suiza', 'Austria', 'República Checa', 'Hungría'],
    m: ['Eslovaquia', 'Luxemburgo', 'Bielorrusia'],
    d: ['Liechtenstein', 'Andorra', 'San Marino'],
    t: ['Bélgica', 'Dinamarca', 'Eslovenia', 'Polonia', 'Portugal']
  },
  {
    c: 'Países europeos cuya moneda oficial es el Euro',
    f: ['España', 'Francia', 'Alemania', 'Italia'],
    m: ['Portugal', 'Grecia', 'Irlanda'],
    d: ['Finlandia', 'Eslovaquia', 'Croacia'],
    t: ['Polonia', 'Suecia', 'República Checa', 'Dinamarca', 'Hungría']
  },
  {
    c: 'Países soberanos de la península escandinava y nórdicos',
    f: ['Noruega', 'Suecia', 'Dinamarca', 'Finlandia'],
    m: ['Islandia', 'Estonia', 'Letonia'],
    d: ['Lituania', 'Polonia', 'Alemania'],
    t: ['Irlanda', 'Reino Unido', 'Bélgica', 'Países Bajos', 'Francia']
  },
  {
    c: 'Países europeos por donde discurre o delimita el río Danubio',
    f: ['Alemania', 'Austria', 'Hungría', 'Serbia'],
    m: ['Eslovaquia', 'Rumanía', 'Bulgaria'],
    d: ['Croacia', 'Moldavia', 'Ucrania'],
    t: ['Polonia', 'República Checa', 'Eslovenia', 'Suiza', 'Bielorrusia']
  },
  {
    c: 'Países transcontinentales con territorio en Europa y Asia',
    f: ['Rusia', 'Turquía', 'Kazajistán', 'Georgia'],
    m: ['Azerbaiyán', 'Armenia', 'Chipre'],
    d: ['Egipto', 'Indonesia', 'Yemen'],
    t: ['Grecia', 'Ucrania', 'Siria', 'Irán', 'Irak']
  },

  // 11 - 20: Ríos, Lagos y Accidentes Hidrográficos Mundiales
  {
    c: 'Ríos más largos del mundo (longitud superior a 4.000 km)',
    f: ['Amazonas', 'Nilo', 'Yangtsé', 'Misisipi'],
    m: ['Yeniséi', 'Río Amarillo', 'Mekong'],
    d: ['Lena', 'Irtish', 'Paraná'],
    t: ['Danubio', 'Rin', 'Volga', 'Ganges', 'Sena']
  },
  {
    c: 'Grandes lagos naturales del mundo por superficie de agua',
    f: ['Mar Caspio', 'Lago Superior', 'Lago Victoria', 'Lago Hurón'],
    m: ['Lago Míchigan', 'Lago Tanganica', 'Lago Baikal'],
    d: ['Gran Lago del Oso', 'Lago Malaui', 'Gran Lago del Esclavo'],
    t: ['Mar Muerto', 'Lago Titicaca', 'Lago de Ginebra', 'Lago Balatón', 'Lago Nahuel Huapi']
  },
  {
    c: 'Lagos situados en el continente africano',
    f: ['Lago Victoria', 'Lago Tanganica', 'Lago Malaui', 'Lago Chad'],
    m: ['Lago Alberto', 'Lago Turkana', 'Lago Kivu'],
    d: ['Lago Eduardo', 'Lago Naivasha', 'Lago Kyoga'],
    t: ['Lago Baikal', 'Lago Titicaca', 'Lago Maracaibo', 'Mar Muerto', 'Lago Onega']
  },
  {
    c: 'Ríos de la península ibérica que desembocan en el océano Atlántico',
    f: ['Tajo', 'Duero', 'Guadalquivir', 'Guadiana'],
    m: ['Miño', 'Sil', 'Navia'],
    d: ['Mondego', 'Sado', 'Ulla'],
    t: ['Ebro', 'Júcar', 'Segura', 'Turia', 'Llobregat']
  },
  {
    c: 'Ríos de la península ibérica que desembocan en el mar Mediterráneo',
    f: ['Ebro', 'Júcar', 'Segura', 'Turia'],
    m: ['Llobregat', 'Ter', 'Mijares'],
    d: ['Almanzora', 'Guadalfeo', 'Muga'],
    t: ['Tajo', 'Duero', 'Guadalquivir', 'Guadiana', 'Miño']
  },
  {
    c: 'Mares marginales y dependientes del océano Pacífico',
    f: ['Mar de Japón', 'Mar de Bering', 'Mar de Coral', 'Mar de la China Meridional'],
    m: ['Mar de Ojotsk', 'Mar de Filipinas', 'Mar de Tasmania'],
    d: ['Mar de Java', 'Mar de Banda', 'Mar de Célebes'],
    t: ['Mar Báltico', 'Mar del Norte', 'Mar Rojo', 'Mar Negro', 'Mar Caribe']
  },
  {
    c: 'Cascadas y saltos de agua naturales del mundo',
    f: ['Cataratas del Niágara', 'Cataratas del Iguazú', 'Cataratas Victoria', 'Salto Ángel'],
    m: ['Salto del Tugela', 'Cataratas Kaieteur', 'Cascada de Gullfoss'],
    d: ['Cataratas de Yosemite', 'Cataratas Sutherland', 'Salto Gocta'],
    t: ['Gran Cañón', 'Fosa de las Marianas', 'Cueva de Postojna', 'Garganta del Verdon', 'Glaciar Perito Moreno']
  },
  {
    c: 'Estrechos y canales navegables situados en el hemisferio norte',
    f: ['Estrecho de Gibraltar', 'Canal de Suez', 'Estrecho del Bósforo', 'Canal de Panamá'],
    m: ['Estrecho de Malaca', 'Estrecho de Ormuz', 'Estrecho de Bering'],
    d: ['Estrecho de los Dardanelos', 'Paso de Calais', 'Estrecho de Bab el-Mandeb'],
    t: ['Estrecho de Magallanes', 'Paso de Drake', 'Estrecho de Cook', 'Estrecho de Bass', 'Estrecho de Torres']
  },
  {
    c: 'Mares y lagos salados endorreicos o cerrados del mundo',
    f: ['Mar Caspio', 'Mar Muerto', 'Mar de Aral', 'Gran Lago Salado'],
    m: ['Lago Baljash', 'Lago Van', 'Lago Urmía'],
    d: ['Lago Eyre', 'Lago Natron', 'Lago Torrens'],
    t: ['Mar Mediterráneo', 'Mar Báltico', 'Mar Rojo', 'Mar Negro', 'Mar del Norte']
  },
  {
    c: 'Ríos europeos con una longitud superior a los 1.000 km',
    f: ['Volga', 'Danubio', 'Ural', 'Dniéper'],
    m: ['Don', 'Pechora', 'Rin'],
    d: ['Dniéster', 'Vístula', 'Tajo'],
    t: ['Sena', 'Támesis', 'Po', 'Ebro', 'Ródano']
  },

  // 21 - 30: Montañas, Volcanes y Orografía
  {
    c: 'Cumbres y montañas que superan los 8.000 metros de altitud (Ochomiles)',
    f: ['Everest', 'K2', 'Kangchenjunga', 'Lhotse'],
    m: ['Makalu', 'Cho Oyu', 'Nanga Parbat'],
    d: ['Dhaulagiri', 'Manaslu', 'Annapurna'],
    t: ['Aconcagua', 'Mont Blanc', 'Kilimanjaro', 'Elbrús', 'Denali']
  },
  {
    c: 'Picos que representan la cumbre más alta de un país soberano',
    f: ['Everest', 'Aconcagua', 'Mont Blanc', 'Mulhacén'],
    m: ['Kilimanjaro', 'Elbrús', 'Ben Nevis'],
    d: ['Monte Olimpo', 'Pico Teide', 'Zugspitze'],
    t: ['K2', 'Matterhorn', 'Annapurna', 'Nanga Parbat', 'Monte Rosa']
  },
  {
    c: 'Volcanes activos conocidos del planeta Tierra',
    f: ['Vesubio', 'Etna', 'Kilauea', 'Krakatoa'],
    m: ['Popocatépetl', 'Monte Fuji', 'Teide'],
    d: ['Cotopaxi', 'Mauna Loa', 'Eyjafjallajökull'],
    t: ['Everest', 'Mont Blanc', 'Matterhorn', 'Aconcagua', 'Anapurna']
  },
  {
    c: 'Grandes cordilleras continentales de la Tierra',
    f: ['Himalaya', 'Cordillera de los Andes', 'Montañas Rocosas', 'Alpes'],
    m: ['Pirineos', 'Montes Urales', 'Cordillera del Cáucaso'],
    d: ['Montes Apalaches', 'Cordillera del Atlas', 'Gran Cordillera Divisoria'],
    t: ['Meseta del Tíbet', 'Valle de la Muerte', 'Fosa de las Marianas', 'Gran Llanura Europea', 'Escudo Guayanés']
  },
  {
    c: 'Montañas y picos situados en territorio español',
    f: ['Teide', 'Mulhacén', 'Aneto', 'Veleta'],
    m: ['Posets', 'Monte Perdido', 'Almanzor'],
    d: ['Torre Cerredo', 'Peñalara', 'Pico de Peñagolosa'],
    t: ['Mont Blanc', 'Aconcagua', 'Matterhorn', 'Ben Nevis', 'Monte Olimpo']
  },
  {
    c: 'Picos montañosos pertenecientes a la cordillera de los Alpes',
    f: ['Mont Blanc', 'Matterhorn', 'Jungfrau', 'Eiger'],
    m: ['Monte Rosa', 'Grandes Jorasses', 'Finsteraarhorn'],
    d: ['Gran Paradiso', 'Piz Bernina', 'Ortles'],
    t: ['Mulhacén', 'Aneto', 'Elbrús', 'Ben Nevis', 'Pico Posets']
  },
  {
    c: 'Grandes penínsulas del continente europeo',
    f: ['Península ibérica', 'Península itálica', 'Península escandinava', 'Península balcánica'],
    m: ['Península de Jutlandia', 'Península de Kola', 'Península de Crimea'],
    d: ['Península de Bretaña', 'Península de Peloponeso', 'Península de Crimea'],
    t: ['Península de Florida', 'Península de Kamchatka', 'Península de Yucatán', 'Península de Sinaí', 'Península de Corea']
  },
  {
    c: 'Grandes desiertos cálidos y áridos del planeta',
    f: ['Desierto del Sáhara', 'Desierto de Arabia', 'Desierto de Kalahari', 'Desierto de Atacama'],
    m: ['Gran Desierto de Victoria', 'Desierto de Sonora', 'Desierto de Namibia'],
    d: ['Desierto de Thar', 'Desierto de Mojave', 'Desierto de Simpson'],
    t: ['Desierto de Gobi', 'Desierto de Taklamakán', 'Desierto de la Patagonia', 'Desierto del Colorado', 'Desierto Antártico']
  },
  {
    c: 'Islas de gran tamaño del planeta Tierra',
    f: ['Groenlandia', 'Nueva Guinea', 'Borneo', 'Madagascar'],
    m: ['Isla de Baffin', 'Sumatra', 'Gran Bretaña'],
    d: ['Honshu', 'Isla Victoria', 'Isla de Ellesmere'],
    t: ['Australia', 'Península de Florida', 'Península ibérica', 'Cabo de Hornos', 'Península de Indochina']
  },
  {
    c: 'Fosas oceánicas submarinas del planeta',
    f: ['Fosa de las Marianas', 'Fosa de Tonga', 'Fosa de Puerto Rico', 'Fosa de Filipinas'],
    m: ['Fosa de las Kuriles', 'Fosa de Kermadec', 'Fosa de Japón'],
    d: ['Fosa de Perú-Chile', 'Fosa de las Aleutianas', 'Fosa de las Sandwich del Sur'],
    t: ['Dorsal Mesoatlántica', 'Gran Barrera de Coral', 'Canal de la Mancha', 'Cueva de Cristales', 'Arrecife de Ningaloo']
  },

  // 31 - 40: América: Países, Capitales y Regiones
  {
    c: 'Países soberanos e independientes de América del Sur',
    f: ['Brasil', 'Argentina', 'Colombia', 'Chile'],
    m: ['Perú', 'Uruguay', 'Ecuador'],
    d: ['Bolivia', 'Paraguay', 'Surinam'],
    t: ['México', 'Costa Rica', 'Panamá', 'Cuba', 'Jamaica']
  },
  {
    c: 'Capitales estatales de países de América del Sur',
    f: ['Buenos Aires', 'Bogotá', 'Santiago de Chile', 'Lima'],
    m: ['Montevideo', 'Brasilia', 'Caracas'],
    d: ['Asunción', 'Quito', 'Paramaribo'],
    t: ['Río de Janeiro', 'São Paulo', 'Medellín', 'Guayaquil', 'Santa Cruz de la Sierra']
  },
  {
    c: 'Países soberanos que forman la región de América Central',
    f: ['Costa Rica', 'Panamá', 'Guatemala', 'Honduras'],
    m: ['El Salvador', 'Nicaragua', 'Belice'],
    d: ['México', 'Colombia', 'Cuba'],
    t: ['Jamaica', 'Haití', 'República Dominicana', 'Bahamas', 'Barbados']
  },
  {
    c: 'Países insulares soberanos del Mar Caribe',
    f: ['Cuba', 'República Dominicana', 'Jamaica', 'Haití'],
    m: ['Bahamas', 'Trinidad y Tobago', 'Barbados'],
    d: ['Santa Lucía', 'San Cristóbal y Nieves', 'Antigua y Barbuda'],
    t: ['Panamá', 'Belice', 'Costa Rica', 'Surinam', 'Guyana']
  },
  {
    c: 'Estados federados pertenecientes a Estados Unidos',
    f: ['California', 'Texas', 'Florida', 'Nueva York'],
    m: ['Illinois', 'Washington', 'Pensilvania'],
    d: ['Wyoming', 'Vermont', 'Dakota del Norte'],
    t: ['Ontario', 'Quebec', 'Nuevo León', 'Jalisco', 'Columbia Británica']
  },
  {
    c: 'Provincias oficiales que integran Canadá',
    f: ['Ontario', 'Quebec', 'Columbia Británica', 'Alberta'],
    m: ['Manitoba', 'Saskatchewan', 'Nueva Escocia'],
    d: ['Nuevo Brunswick', 'Terranova y Labrador', 'Isla del Príncipe Eduardo'],
    t: ['Yukón', 'Nunavut', 'Alaska', 'Washington', 'Groenlandia']
  },
  {
    c: 'Estados que forman la federación de México',
    f: ['Jalisco', 'Nuevo León', 'Puebla', 'Veracruz'],
    m: ['Yucatán', 'Oaxaca', 'Chihuahua'],
    d: ['Zacatecas', 'Tlaxcala', 'Nayarit'],
    t: ['Texas', 'California', 'Guatemala', 'Sonora Sur', 'Panamá']
  },
  {
    c: 'Capitales oficiales de países de Centroamérica y el Caribe',
    f: ['La Habana', 'Santo Domingo', 'San José', 'Ciudad de Panamá'],
    m: ['Kingston', 'San Salvador', 'Ciudad de Guatemala'],
    d: ['Managua', 'Tegucigalpa', 'Nassau'],
    t: ['Punta Cana', 'Cancún', 'San Pedro Sula', 'Santiago de Cuba', 'Montego Bay']
  },
  {
    c: 'Departamentos administrativos de la República de Colombia',
    f: ['Antioquia', 'Cundinamarca', 'Valle del Cauca', 'Bolívar'],
    m: ['Santander', 'Atlántico', 'Boyacá'],
    d: ['Chocó', 'Amazonas', 'Vaupés'],
    t: ['Pichincha', 'Guayas', 'Zulia', 'Táchira', 'Arequipa']
  },
  {
    c: 'Provincias que componen la República Argentina',
    f: ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza'],
    m: ['Salta', 'Tucumán', 'Misiones'],
    d: ['Jujuy', 'La Pampa', 'Neuquén'],
    t: ['Montevideo', 'Punta del Este', 'Canelones', 'Maldonado', 'Colonia']
  },

  // 41 - 50: África: Países, Geografía y Capitales
  {
    c: 'Países soberanos situados en el continente africano',
    f: ['Egipto', 'Marruecos', 'Sudáfrica', 'Nigeria'],
    m: ['Kenia', 'Senegal', 'Camerún'],
    d: ['Botsuana', 'Eritrea', 'Madagascar'],
    t: ['Yemen', 'Jordania', 'Guyana', 'Surinam', 'Omán']
  },
  {
    c: 'Capitales estatales de países del continente africano',
    f: ['El Cairo', 'Rabat', 'Nairobi', 'Dakar'],
    m: ['Pretoria', 'Abuya', 'Túnez'],
    d: ['Adís Abeba', 'Luanda', 'Maputo'],
    t: ['Johannesburgo', 'Casablanca', 'Lagos', 'Alejandría', 'Marrakech']
  },
  {
    c: 'Países del mundo atravesados por la línea del Ecuador',
    f: ['Ecuador', 'Colombia', 'Brasil', 'Kenia'],
    m: ['Indonesia', 'Uganda', 'República Democrática del Congo'],
    d: ['Gabón', 'Somalia', 'Santo Tomé y Príncipe'],
    t: ['Perú', 'Venezuela', 'Argentina', 'Tanzania', 'México']
  },
  {
    c: 'Países situados en el norte de África y Magreb',
    f: ['Marruecos', 'Argelia', 'Túnez', 'Egipto'],
    m: ['Libia', 'Mauritania', 'Sudán'],
    d: ['Chad', 'Níger', 'Malí'],
    t: ['Senegal', 'Nigeria', 'Kenia', 'Etiopía', 'Sudáfrica']
  },
  {
    c: 'Países con territorio continental en la península arábiga',
    f: ['Arabia Saudita', 'Emiratos Árabes Unidos', 'Omán', 'Yemen'],
    m: ['Kuwait', 'Qatar', 'Baréin'],
    d: ['Jordania', 'Irak', 'Siria'],
    t: ['Irán', 'Egipto', 'Sudán', 'Turquía', 'Israel']
  },
  {
    c: 'Ciudades más pobladas del continente africano',
    f: ['El Cairo', 'Lagos', 'Kinshasa', 'Johannesburgo'],
    m: ['Casablanca', 'Nairobi', 'Alejandría'],
    d: ['Adís Abeba', 'Abiyán', 'Luanda'],
    t: ['Pretoria', 'Dakar', 'Windhoek', 'Gaborone', 'Mascate']
  },
  {
    c: 'Países insulares soberanos situados en el océano Índico',
    f: ['Madagascar', 'Mauricio', 'Seychelles', 'Comoras'],
    m: ['Maldivas', 'Sri Lanka', 'Indonesia'],
    d: ['Timor Oriental', 'Brunéi', 'Singapur'],
    t: ['Cabo Verde', 'Santo Tomé y Príncipe', 'Fiyi', 'Samoa', 'Tonga']
  },
  {
    c: 'Países con costa directa en el mar Mediterráneo',
    f: ['España', 'Francia', 'Italia', 'Grecia'],
    m: ['Marruecos', 'Argelia', 'Túnez'],
    d: ['Egipto', 'Turquía', 'Croacia'],
    t: ['Portugal', 'Alemania', 'Reino Unido', 'Jordania', 'Arabia Saudita']
  },
  {
    c: 'Parques nacionales y reservas de fauna protegida de África',
    f: ['Serengueti', 'Kruger', 'Masái Mara', 'Ngorongoro'],
    m: ['Amboseli', 'Chobe', 'Etosha'],
    d: ['Virunga', 'Bwindi', 'Hwange'],
    t: ['Yellowstone', 'Yosemite', 'Doñana', 'Banff', 'Galápagos']
  },
  {
    c: 'Países por los que transcurre la cuenca del río Nilo',
    f: ['Egipto', 'Sudán', 'Uganda', 'Etiopía'],
    m: ['Sudán del Sur', 'Ruanda', 'Burundi'],
    d: ['Tanzania', 'República Democrática del Congo', 'Kenia'],
    t: ['Marruecos', 'Nigeria', 'Sudáfrica', 'Argelia', 'Senegal']
  },

  // 51 - 60: Asia y Oriente Medio
  {
    c: 'Países soberanos pertenecientes al continente asiático',
    f: ['Japón', 'Corea del Sur', 'China', 'India'],
    m: ['Tailandia', 'Vietnam', 'Filipinas'],
    d: ['Bután', 'Kazajistán', 'Mongolia'],
    t: ['Australia', 'Egipto', 'Nueva Zelanda', 'Madagascar', 'Fiyi']
  },
  {
    c: 'Capitales estatales de países de Asia',
    f: ['Tokio', 'Pekín', 'Nueva Delhi', 'Bangkok'],
    m: ['Seúl', 'Yakarta', 'Hanoi'],
    d: ['Ulán Bator', 'Katmandú', 'Timbu'],
    t: ['Sídney', 'El Cairo', 'Dubái', 'Shanghái', 'Bombay']
  },
  {
    c: 'Países pertenecientes a la región del Sudeste Asiático',
    f: ['Tailandia', 'Vietnam', 'Indonesia', 'Filipinas'],
    m: ['Malasia', 'Singapur', 'Camboya'],
    d: ['Laos', 'Myanmar', 'Brunéi'],
    t: ['Corea del Sur', 'Bangladés', 'Nepal', 'Sri Lanka', 'Mongolia']
  },
  {
    c: 'Países ribereños con costas en el Golfo Pérsico',
    f: ['Arabia Saudita', 'Irán', 'Irak', 'Kuwait'],
    m: ['Emiratos Árabes Unidos', 'Qatar', 'Baréin'],
    d: ['Omán', 'Yemen', 'Jordania'],
    t: ['Egipto', 'Siria', 'Líbano', 'Israel', 'Turquía']
  },
  {
    c: 'Repúblicas independientes de la región de Asia Central',
    f: ['Kazajistán', 'Uzbekistán', 'Turkmenistán', 'Kirguistán'],
    m: ['Tayikistán', 'Afganistán', 'Pakistán'],
    d: ['Mongolia', 'Azerbaiyán', 'Armenia'],
    t: ['Georgia', 'Irak', 'Siria', 'Jordania', 'Turquía']
  },
  {
    c: 'Estados soberanos organizados totalmente como archipiélagos o islas',
    f: ['Japón', 'Filipinas', 'Indonesia', 'Reino Unido'],
    m: ['Islandia', 'Madagascar', 'Cuba'],
    d: ['Nueva Zelanda', 'Sri Lanka', 'Chipre'],
    t: ['Italia', 'Grecia', 'Dinamarca', 'Noruega', 'Chile']
  },
  {
    c: 'Mares marginales que rodean el continente asiático',
    f: ['Mar Rojo', 'Mar de Arabia', 'Mar de Japón', 'Mar de China Meridional'],
    m: ['Mar de Ojotsk', 'Mar Amarillo', 'Mar de Andamán'],
    d: ['Mar de Bering', 'Mar de Filipinas', 'Mar de Célebes'],
    t: ['Mar Báltico', 'Mar del Norte', 'Mar Negro', 'Mar Tirreno', 'Mar de Irlanda']
  },
  {
    c: 'Grandes ríos del continente asiático',
    f: ['Yangtsé', 'Río Amarillo', 'Ganges', 'Mekong'],
    m: ['Indo', 'Brahmaputra', 'Tigris'],
    d: ['Éufrates', 'Amur', 'Irawadi'],
    t: ['Danubio', 'Amazonas', 'Congo', 'Rin', 'Misisipi']
  },
  {
    c: 'Grandes aglomeraciones urbanas y metrópolis de Asia',
    f: ['Tokio', 'Delhi', 'Shanghái', 'Dacca'],
    m: ['Bombay', 'Pekín', 'Karachi'],
    d: ['Manila', 'Yakarta', 'Seúl'],
    t: ['Londres', 'Nueva York', 'París', 'Sídney', 'Madrid']
  },
  {
    c: 'Países situados en la región del Cáucaso',
    f: ['Georgia', 'Armenia', 'Azerbaiyán', 'Rusia'],
    m: ['Turquía', 'Irán', 'Irak'],
    d: ['Siria', 'Kazajistán', 'Turkmenistán'],
    t: ['Ucrania', 'Rumanía', 'Bulgaria', 'Grecia', 'Jordania']
  },

  // 61 - 70: Oceanía y Territorios Insulares
  {
    c: 'Países soberanos e independientes de Oceanía',
    f: ['Australia', 'Nueva Zelanda', 'Fiyi', 'Papúa Nueva Guinea'],
    m: ['Samoa', 'Tonga', 'Vanuatu'],
    d: ['Kiribati', 'Tuvalu', 'Palaos'],
    t: ['Filipinas', 'Indonesia', 'Madagascar', 'Sri Lanka', 'Seychelles']
  },
  {
    c: 'Estados y territorios oficiales que integran Australia',
    f: ['Nueva Gales del Sur', 'Victoria', 'Queensland', 'Australia Occidental'],
    m: ['Australia Meridional', 'Tasmania', 'Territorio del Norte'],
    d: ['Territorio de la Capital Australiana', 'Isla Norfolk', 'Isla de Navidad'],
    t: ['Auckland', 'Canterbury', 'Otago', 'Waikato', 'Tasman']
  },
  {
    c: 'Ciudades metropolitanas principales de Australia',
    f: ['Sídney', 'Melbourne', 'Brisbane', 'Perth'],
    m: ['Adelaida', 'Canberra', 'Gold Coast'],
    d: ['Hobart', 'Darwin', 'Newcastle'],
    t: ['Auckland', 'Wellington', 'Christchurch', 'Port Moresby', 'Suva']
  },
  {
    c: 'Ciudades y núcleos urbanos de Nueva Zelanda',
    f: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton'],
    m: ['Tauranga', 'Dunedin', 'Palmerston North'],
    d: ['Nelson', 'Rotorua', 'Napier'],
    t: ['Sídney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaida']
  },
  {
    c: 'Territorios y estados insulares de la región de Polinesia',
    f: ['Hawái', 'Samoa', 'Tonga', 'Tuvalu'],
    m: ['Tahití', 'Islas Cook', 'Isla de Pascua'],
    d: ['Niue', 'Tokelau', 'Wallis y Futuna'],
    t: ['Fiyi', 'Palaos', 'Guam', 'Islas Salomón', 'Vanuatu']
  },
  {
    c: 'Territorios y estados insulares de la región de Micronesia',
    f: ['Palaos', 'Guam', 'Nauru', 'Kiribati'],
    m: ['Islas Marshall', 'Estados Federados de Micronesia', 'Islas Marianas del Norte'],
    d: ['Yap', 'Chuuk', 'Pohnpei'],
    t: ['Samoa', 'Tonga', 'Tahití', 'Tuvalu', 'Fiyi']
  },
  {
    c: 'Mares marginales que rodean el continente de Oceanía',
    f: ['Mar del Coral', 'Mar de Tasmania', 'Mar de Timor', 'Mar de Arafura'],
    m: ['Mar de Salomón', 'Mar de Bismarck', 'Mar de Fiyi'],
    d: ['Mar de Filipinas', 'Mar de Java', 'Mar de Flores'],
    t: ['Mar Báltico', 'Mar del Norte', 'Mar Rojo', 'Mar Negro', 'Mar Caspio']
  },
  {
    c: 'Territorios y bases situadas en el continente antártico',
    f: ['Península Antártica', 'Base Esperanza', 'Base McMurdo', 'Polo Sur'],
    m: ['Montes Transantárticos', 'Tierra de Marie Byrd', 'Base Amundsen-Scott'],
    d: ['Glaciar Thwaites', 'Monte Vinson', 'Barrera de Ross'],
    t: ['Groenlandia', 'Islas Svalbard', 'Isla Baffin', 'Nueva Zembla', 'Tierra de Fuego']
  },
  {
    c: 'Islas y archipiélagos del océano Atlántico Sur',
    f: ['Islas Malvinas', 'Islas Georgias del Sur', 'Isla Ascensión', 'Santa Elena'],
    m: ['Tristán de Acuña', 'Islas Sandwich del Sur', 'Isla Bouvet'],
    d: ['Isla de Gough', 'Rocas San Pedro y San Pablo', 'Isla Trinidad'],
    t: ['Islas Canarias', 'Islas Baleares', 'Azores', 'Madeira', 'Hawái']
  },
  {
    c: 'Capitales oficiales de países de Oceanía',
    f: ['Canberra', 'Wellington', 'Suva', 'Port Moresby'],
    m: ['Apia', 'Nukualofa', 'Port Vila'],
    d: ['Honiara', 'Tarawa', 'Funafuti'],
    t: ['Auckland', 'Sídney', 'Melbourne', 'Brisbane', 'Honolulú']
  },

  // 71 - 85: Geografía de España: Autonomías, Provincias y Relieve
  {
    c: 'Provincias que integran la comunidad autónoma de Andalucía',
    f: ['Sevilla', 'Málaga', 'Granada', 'Cádiz'],
    m: ['Córdoba', 'Huelva', 'Almería'],
    d: ['Jaén', 'Badajoz', 'Murcia'],
    t: ['Albacete', 'Ciudad Real', 'Cáceres', 'Toledo', 'Alicante']
  },
  {
    c: 'Provincias que componen la comunidad de Castilla y León',
    f: ['Valladolid', 'Salamanca', 'Burgos', 'León'],
    m: ['Segovia', 'Ávila', 'Zamora'],
    d: ['Palencia', 'Soria', 'Madrid'],
    t: ['Toledo', 'Guadalajara', 'Cuenca', 'Ourense', 'Lugo']
  },
  {
    c: 'Provincias que componen la comunidad de Castilla-La Mancha',
    f: ['Toledo', 'Ciudad Real', 'Albacete', 'Cuenca'],
    m: ['Guadalajara', 'Madrid', 'Ávila'],
    d: ['Cáceres', 'Jaén', 'Valencia'],
    t: ['Badajoz', 'Córdoba', 'Murcia', 'Teruel', 'Alicante']
  },
  {
    c: 'Comunidades autónomas uniprovinciales de España',
    f: ['Comunidad de Madrid', 'Principado de Asturias', 'Cantabria', 'Región de Murcia'],
    m: ['Comunidad Foral de Navarra', 'La Rioja', 'Islas Baleares'],
    d: ['Ceuta', 'Melilla', 'País Vasco'],
    t: ['Galicia', 'Extremadura', 'Aragón', 'Castilla y León', 'Andalucía']
  },
  {
    c: 'Provincias que forman la comunidad autónoma de Cataluña',
    f: ['Barcelona', 'Girona', 'Tarragona', 'Lleida'],
    m: ['Huesca', 'Zaragoza', 'Castellón'],
    d: ['Teruel', 'Baleares', 'Navarra'],
    t: ['Valencia', 'Alicante', 'Soria', 'Guadalajara', 'Cuenca']
  },
  {
    c: 'Provincias que integran la comunidad de Galicia',
    f: ['A Coruña', 'Pontevedra', 'Lugo', 'Ourense'],
    m: ['Asturias', 'León', 'Zamora'],
    d: ['Cantabria', 'Palencia', 'Salamanca'],
    t: ['Burgos', 'Valladolid', 'Ávila', 'Segovia', 'Soria']
  },
  {
    c: 'Provincias que integran la Comunidad Valenciana',
    f: ['Valencia', 'Alicante', 'Castellón', 'Murcia'],
    m: ['Albacete', 'Teruel', 'Cuenca'],
    d: ['Tarragona', 'Zaragoza', 'Baleares'],
    t: ['Almería', 'Granada', 'Jaén', 'Ciudad Real', 'Toledo']
  },
  {
    c: 'Comunidades autónomas de España con costa marítima',
    f: ['Andalucía', 'Cataluña', 'Galicia', 'Comunidad Valenciana'],
    m: ['Asturias', 'Cantabria', 'País Vasco'],
    d: ['Islas Baleares', 'Islas Canarias', 'Región de Murcia'],
    t: ['Comunidad de Madrid', 'Castilla-La Mancha', 'Extremadura', 'Aragón', 'Castilla y León']
  },
  {
    c: 'Grandes sistemas montañosos de la península ibérica',
    f: ['Pirineos', 'Sistema Central', 'Cordillera Cantábrica', 'Sistemas Béticos'],
    m: ['Sistema Ibérico', 'Sierra Morena', 'Montes de Toledo'],
    d: ['Macizo Galaico', 'Sierra de Guadarrama', 'Sierra de Gredos'],
    t: ['Alpes', 'Cárpatos', 'Apeninos', 'Montes Urales', 'Balcanes']
  },
  {
    c: 'Islas habitadas del archipiélago de las Islas Canarias',
    f: ['Tenerife', 'Gran Canaria', 'Lanzarote', 'Fuerteventura'],
    m: ['La Palma', 'La Gomera', 'El Hierro'],
    d: ['La Graciosa', 'Lobos', 'Alegranza'],
    t: ['Mallorca', 'Menorca', 'Ibiza', 'Formentera', 'Cabrera']
  },
  {
    c: 'Islas principales del archipiélago de las Islas Baleares',
    f: ['Mallorca', 'Menorca', 'Ibiza', 'Formentera'],
    m: ['Cabrera', 'Dragonera', 'Conejera'],
    d: ['Espalmador', 'Tagomago', 'Es Vedrà'],
    t: ['Tenerife', 'Gran Canaria', 'Lanzarote', 'Fuerteventura', 'La Palma']
  },
  {
    c: 'Provincias que componen la comunidad autónoma de Aragón',
    f: ['Zaragoza', 'Huesca', 'Teruel', 'Navarra'],
    m: ['Lleida', 'Guadalajara', 'Soria'],
    d: ['Tarragona', 'Castellón', 'La Rioja'],
    t: ['Cuenca', 'Madrid', 'Burgos', 'Valencia', 'Barcelona']
  },
  {
    c: 'Provincias que componen la comunidad del País Vasco',
    f: ['Bizkaia', 'Gipuzkoa', 'Álava', 'Navarra'],
    m: ['Cantabria', 'Burgos', 'La Rioja'],
    d: ['Huesca', 'Zaragoza', 'Lleida'],
    t: ['Asturias', 'Soria', 'Valladolid', 'Palencia', 'León']
  },
  {
    c: 'Provincias que componen la comunidad de Extremadura',
    f: ['Badajoz', 'Cáceres', 'Toledo', 'Ciudad Real'],
    m: ['Huelva', 'Sevilla', 'Córdoba'],
    d: ['Salamanca', 'Ávila', 'Madrid'],
    t: ['Jaén', 'Albacete', 'Cádiz', 'Málaga', 'Granada']
  },
  {
    c: 'Cabos geográficos situados en la costa de España',
    f: ['Cabo de Finisterre', 'Cabo de Gata', 'Cabo de Creus', 'Cabo de Palos'],
    m: ['Cabo Peñas', 'Cabo de la Nao', 'Cabo Ortegal'],
    d: ['Cabo Machichaco', 'Cabo Trafalgar', 'Cabo de San Antonio'],
    t: ['Cabo de Buena Esperanza', 'Cabo de Hornos', 'Cabo Cañaveral', 'Cabo Blanco', 'Cabo Froward']
  },

  // 86 - 100: Monumentos Naturales, Demografía y Fenómenos Globales
  {
    c: 'Países más extensos del planeta por superficie territorial',
    f: ['Rusia', 'Canadá', 'China', 'Estados Unidos'],
    m: ['Brasil', 'Australia', 'India'],
    d: ['Argentina', 'Kazajistán', 'Argelia'],
    t: ['Francia', 'Alemania', 'España', 'Reino Unido', 'Italia']
  },
  {
    c: 'Países más poblados del planeta Tierra',
    f: ['India', 'China', 'Estados Unidos', 'Indonesia'],
    m: ['Pakistán', 'Nigeria', 'Brasil'],
    d: ['Bangladés', 'Rusia', 'México'],
    t: ['Alemania', 'Reino Unido', 'Francia', 'Italia', 'España']
  },
  {
    c: 'Países con mayor cantidad de islas en su territorio',
    f: ['Suecia', 'Noruega', 'Finlandia', 'Canadá'],
    m: ['Indonesia', 'Japón', 'Filipinas'],
    d: ['Grecia', 'Reino Unido', 'Chile'],
    t: ['Suiza', 'Austria', 'Bolivia', 'Hungría', 'Paraguay']
  },
  {
    c: 'Países del mundo atravesados por el meridiano de Greenwich (0°)',
    f: ['Reino Unido', 'Francia', 'España', 'Argelia'],
    m: ['Malí', 'Burkina Faso', 'Ghana'],
    d: ['Togo', 'Noruega', 'Marruecos'],
    t: ['Portugal', 'Italia', 'Alemania', 'Bélgica', 'Irlanda']
  },
  {
    c: 'Grandes deltas fluviales del mundo',
    f: ['Delta del Nilo', 'Delta del Misisipi', 'Delta del Amazonas', 'Delta del Ebro'],
    m: ['Delta del Ganges', 'Delta del Mekong', 'Delta del Danubio'],
    d: ['Delta del Níger', 'Delta del Okavango', 'Delta del Rin'],
    t: ['Gran Cañón', 'Fosa de las Marianas', 'Cataratas del Niágara', 'Falla de San Andrés', 'Glaciar Perito Moreno']
  },
  {
    c: 'Grandes golfos y bahías marítimas del mundo',
    f: ['Golfo de México', 'Golfo Pérsico', 'Golfo de Guinea', 'Golfo de Bengala'],
    m: ['Golfo de Vizcaya', 'Golfo de California', 'Golfo de Adén'],
    d: ['Golfo de Omán', 'Golfo de Botnia', 'Bahía de Hudson'],
    t: ['Estrecho de Gibraltar', 'Canal de la Mancha', 'Cabo de Buena Esperanza', 'Península arábiga', 'Cabo de Hornos']
  },
  {
    c: 'Países cuya bandera nacional contiene rojo, blanco y azul (y ningún otro color)',
    f: ['Francia', 'Reino Unido', 'Estados Unidos', 'Rusia'],
    m: ['Países Bajos', 'Chile', 'Cuba'],
    d: ['República Checa', 'Noruega', 'Islandia'],
    t: ['España', 'Alemania', 'Italia', 'Brasil', 'México']
  },
  {
    c: 'Países con costa continental en el océano Ártico',
    f: ['Rusia', 'Canadá', 'Estados Unidos', 'Noruega'],
    m: ['Dinamarca', 'Islandia', 'Suecia'],
    d: ['Finlandia', 'Reino Unido', 'Irlanda'],
    t: ['Alemania', 'Polonia', 'Países Bajos', 'Bélgica', 'Francia']
  },
  {
    c: 'Países que cuentan con más de una capital oficial o sede de gobierno',
    f: ['Sudáfrica', 'Bolivia', 'Países Bajos', 'Chile'],
    m: ['Costa de Marfil', 'Malasia', 'Sri Lanka'],
    d: ['Benín', 'Tanzania', 'Suazilandia'],
    t: ['España', 'Francia', 'Alemania', 'Italia', 'Portugal']
  },
  {
    c: 'Espacios naturales declarados Patrimonio de la Humanidad por la UNESCO',
    f: ['Gran Barrera de Coral', 'Parque Nacional de Yellowstone', 'Islas Galápagos', 'Gran Cañón'],
    m: ['Parque Nacional de Doñana', 'Parque Nacional de Yosemite', 'Cataratas del Iguazú'],
    d: ['Parque Nacional de Komodo', 'Parque Nacional del Teide', 'Fiordos de Noruega'],
    t: ['Torre Eiffel', 'Coliseo de Roma', 'Estatua de la Libertad', 'Big Ben', 'Sagrada Familia']
  },
  {
    c: 'Países costeros ribereños del océano Índico',
    f: ['India', 'Sudáfrica', 'Australia', 'Indonesia'],
    m: ['Kenia', 'Tanzania', 'Madagascar'],
    d: ['Mozambique', 'Omán', 'Sri Lanka'],
    t: ['España', 'Brasil', 'Canadá', 'Chile', 'Japón']
  },
  {
    c: 'Países soberanos con costa en el Mar Caribe',
    f: ['Colombia', 'Venezuela', 'México', 'Costa Rica'],
    m: ['Panamá', 'Cuba', 'República Dominicana'],
    d: ['Honduras', 'Nicaragua', 'Jamaica'],
    t: ['Ecuador', 'Perú', 'Chile', 'Brasil', 'Argentina']
  },
  {
    c: 'Islas y atolones situados en la Polinesia',
    f: ['Tahití', 'Bora Bora', 'Hawái', 'Samoa'],
    m: ['Tonga', 'Moorea', 'Islas Cook'],
    d: ['Isla de Pascua', 'Tuvalu', 'Raiatea'],
    t: ['Fiyi', 'Palaos', 'Guam', 'Nueva Caledonia', 'Vanuatu']
  },
  {
    c: 'Ciudades capitales que comparten nombre con su propio estado o país',
    f: ['Ciudad de México', 'Ciudad de Panamá', 'Ciudad de Guatemala', 'Mónaco'],
    m: ['San Marino', 'Ciudad del Vaticano', 'Luxemburgo'],
    d: ['Singapur', 'Andorra la Vella', 'Argel'],
    t: ['Buenos Aires', 'Madrid', 'París', 'Tokio', 'Berlín']
  },
  {
    c: 'Estados soberanos que son enclaves (rodeados por un único país)',
    f: ['San Marino', 'Ciudad del Vaticano', 'Lesoto', 'Mónaco'],
    m: ['Liechtenstein', 'Andorra', 'Suazilandia'],
    d: ['Brunéi', 'Gambia', 'Portugal'],
    t: ['Suiza', 'Austria', 'Bélgica', 'Luxemburgo', 'Alemania']
  }
];

export default Array.from({ length: 100 }, (_, idx) => {
  const p = plantillas[idx];
  return {
    id: `geografia_${idx + 1}`,
    consigna: p.c,
    correctos: { faciles: p.f, medios: p.m, dificiles: p.d },
    trampas: p.t
  };
});