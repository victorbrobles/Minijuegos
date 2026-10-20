// server/data/seeds/buscaminas/geografia.js

const plantillas = [
  // 1 - 10: Países, Fronteras y Geopolítica Europea
  {
    c: 'Países miembros oficiales de la Unión Europea',
    f: ['España', 'Francia', 'Alemania', 'Italia'],
    m: ['Polonia', 'Portugal', 'Grecia'],
    d: ['Eslovaquia', 'Estonia', 'Luxemburgo'],
    t: ['Reino Unido', 'Suiza', 'Noruega', 'Islandia', 'Andorra']
  },
  {
    c: 'Capitales de países del continente europeo',
    f: ['Madrid', 'París', 'Berlín', 'Roma'],
    m: ['Lisboa', 'Viena', 'Ámsterdam'],
    d: ['Liubliana', 'Vilna', 'Skopie'],
    t: ['Barcelona', 'Milán', 'Ginebra', 'Múnich', 'Zúrich']
  },
  {
    c: 'Países que limitan territorialmente por tierra con España',
    f: ['Francia', 'Portugal', 'Andorra', 'Reino Unido (Gibraltar)'],
    m: ['Marruecos (Ceuta y Melilla)', 'Francia (Llívia)', 'Portugal (La Raya)'],
    d: ['Marruecos (Peñón de Vélez)', 'Portugal (río Miño)', 'Andorra (Pirineos)'],
    t: ['Italia', 'Argelia', 'Túnez', 'Mauritania', 'Bélgica']
  },
  {
    c: 'Países que componen la península balcánica',
    f: ['Grecia', 'Serbia', 'Croacia', 'Albania'],
    m: ['Bosnia y Herzegovina', 'Bulgaria', 'Macedonia del Norte'],
    d: ['Montenegro', 'Eslovenia', 'Kosovo'],
    t: ['Hungría', 'Austria', 'Eslovaquia', 'Polonia', 'República Checa']
  },
  {
    c: 'Países ribereños bañados por el Mar Báltico',
    f: ['Suecia', 'Finlandia', 'Polonia', 'Alemania'],
    m: ['Estonia', 'Letonia', 'Lituania'],
    d: ['Dinamarca', 'Rusia', 'Suecia (Gotland)'],
    t: ['Noruega', 'Islandia', 'Países Bajos', 'Bélgica', 'Reino Unido']
  },
  {
    c: 'Estados europeos sin salida directa al mar (sin litoral)',
    f: ['Suiza', 'Austria', 'República Checa', 'Hungría'],
    m: ['Eslovaquia', 'Luxemburgo', 'Bielorrusia'],
    d: ['Liechtenstein', 'Andorra', 'San Marino'],
    t: ['Polonia', 'Bélgica', 'Portugal', 'Dinamarca', 'Rumanía']
  },
  {
    c: 'Microestados soberanos reconocidos del continente europeo',
    f: ['Mónaco', 'Andorra', 'Ciudad del Vaticano', 'San Marino'],
    m: ['Liechtenstein', 'Malta', 'Luxemburgo'],
    d: ['San Marino (Titano)', 'Mónaco (Montecarlo)', 'Andorra la Vella'],
    t: ['Gibraltar (territorio)', 'Islas Feroe', 'Isla de Man', 'Guernsey', 'Jersey']
  },
  {
    c: 'Países nórdicos y escandinavos de Europa Septentrional',
    f: ['Noruega', 'Suecia', 'Dinamarca', 'Finlandia'],
    m: ['Islandia', 'Islas Feroe (región)', 'Groenlandia (reino)'],
    d: ['Åland (región)', 'Svalbard (territorio)', 'Jan Mayen'],
    t: ['Irlanda', 'Reino Unido', 'Estonia', 'Letonia', 'Lituania']
  },
  {
    c: 'Capitales europeas atravesadas por el río Danubio',
    f: ['Viena', 'Budapest', 'Belgrado', 'Bratislava'],
    m: ['Viena (Austria)', 'Budapest (Hungría)', 'Belgrado (Serbia)'],
    d: ['Bratislava (Eslovaquia)', 'Budapest (Buda)', 'Budapest (Pest)'],
    t: ['Praga', 'Varsovia', 'Berlín', 'Bucarest', 'Sofía']
  },
  {
    c: 'Países transcontinentales situados entre Europa y Asia',
    f: ['Rusia', 'Turquía', 'Kazajistán', 'Georgia'],
    m: ['Azerbaiyán', 'Armenia', 'Chipre'],
    d: ['Rusia (Urales)', 'Turquía (Tracia)', 'Kazajistán occidental'],
    t: ['Grecia', 'Ucrania', 'Siria', 'Irak', 'Irán']
  },

  // 11 - 20: Ríos, Lagos y Accidentes Hidrográficos Mundiales
  {
    c: 'Ríos más largos del mundo (longitud superior a 4.000 km)',
    f: ['Amazonas', 'Nilo', 'Yangtsé', 'Misisipi'],
    m: ['Yeniséi', 'Río Amarillo (Huang He)', 'Mekong'],
    d: ['Lena', 'Irtish', 'Paraná'],
    t: ['Danubio', 'Rin', 'Sena', 'Támesis', 'Ebro']
  },
  {
    c: 'Grandes lagos de América del Norte (cuenca Laurentina)',
    f: ['Lago Superior', 'Lago Míchigan', 'Lago Hurón', 'Lago Erie'],
    m: ['Lago Ontario', 'Lago Superior (aguas dulces)', 'Lago Míchigan-Hurón'],
    d: ['Lago San Martín', 'Lago St. Clair', 'Lago Nipigon'],
    t: ['Gran Lago del Oso', 'Gran Lago del Esclavo', 'Lago Winnipeg', 'Lago Baikal', 'Lago Titicaca']
  },
  {
    c: 'Lagos tectónicos y milenarios del Gran Valle del Rift en África',
    f: ['Lago Victoria', 'Lago Tanganica', 'Lago Malaui (Niassa)', 'Lago Alberto'],
    m: ['Lago Kivu', 'Lago Eduardo', 'Lago Turkana'],
    d: ['Lago Naivasha', 'Lago Baringo', 'Lago Manyara'],
    t: ['Lago Chad', 'Lago Volta', 'Lago Kariba', 'Lago Nasser', 'Mar Muerto']
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
    c: 'Mares marginales y abiertos pertenecientes al océano Pacífico',
    f: ['Mar de Japón', 'Mar de Bering', 'Mar de la China Meridional', 'Mar de Coral'],
    m: ['Mar de Ojotsk', 'Mar de Filipinas', 'Mar de Tasmania'],
    d: ['Mar de Java', 'Mar de Banda', 'Mar de Sulú'],
    t: ['Mar Báltico', 'Mar Negro', 'Mar Rojo', 'Mar del Norte', 'Mar Caspio']
  },
  {
    c: 'Grandes cascadas y saltos de agua del mundo',
    f: ['Cataratas del Niágara', 'Cataratas del Iguazú', 'Cataratas Victoria', 'Salto Ángel'],
    m: ['Salto del Tugela', 'Cataratas Kaieteur', 'Cascada de Gullfoss'],
    d: ['Cataratas de Yosemite', 'Cataratas Sutherland', 'Salto de Browne'],
    t: ['Gran Cañón', 'Fosa de las Marianas', 'Falla de San Andrés', 'Garganta del Tolok', 'Cueva de Altamira']
  },
  {
    c: 'Estrechos y canales marítimos de gran importancia estratégica',
    f: ['Estrecho de Gibraltar', 'Canal de Panamá', 'Canal de Suez', 'Estrecho del Bósforo'],
    m: ['Estrecho de Malaca', 'Estrecho de Ormuz', 'Estrecho de Magallanes'],
    d: ['Estrecho de los Dardanelos', 'Estrecho de Bab el-Mandeb', 'Paso de Calais'],
    t: ['Golfo Pérsico', 'Bahía de Hudson', 'Mar Rojo', 'Cabo de Buena Esperanza', 'Península del Sinaí']
  },
  {
    c: 'Mares cerrados, endorreicos o interiores del planeta',
    f: ['Mar Caspio', 'Mar Muerto', 'Mar de Aral', 'Mar de Galilea'],
    m: ['Gran Lago Salado', 'Lago Baljash', 'Lago Van'],
    d: ['Lago Urmía', 'Lago Eyres', 'Lago Natron'],
    t: ['Mar Mediterráneo', 'Mar Caribe', 'Mar del Norte', 'Mar de Japón', 'Mar Céltico']
  },
  {
    c: 'Ríos de Europa con curso superior a 1.000 kilómetros',
    f: ['Volga', 'Danubio', 'Ural', 'Dniéper'],
    m: ['Don', 'Pechora', 'Rin'],
    d: ['Dniéster', 'Vístula', 'Tajo'],
    t: ['Sena', 'Támesis', 'Tíber', 'Po', 'Ebro']
  },

  // 21 - 30: Montañas, Volcanes y Orografía
  {
    c: 'Montañas y picos que superan los 8.000 metros de altitud (Ochomiles)',
    f: ['Everest', 'K2', 'Kangchenjunga', 'Lhotse'],
    m: ['Makalu', 'Cho Oyu', 'Nanga Parbat'],
    d: ['Dhaulagiri', 'Annapurna I', 'Manaslu'],
    t: ['Aconcagua', 'Mont Blanc', 'Kilimanjaro', 'Elbrús', 'Denali (McKinley)']
  },
  {
    c: 'Picos más altos de cada continente (Las Siete Cumbres)',
    f: ['Everest (Asia)', 'Aconcagua (América del Sur)', 'Kilimanjaro (África)', 'Elbrús (Europa)'],
    m: ['Denali (América del Norte)', 'Vinson (Antártida)', 'Puncak Jaya (Oceanía)'],
    d: ['Monte Kosciuszko (Australia)', 'Aconcagua (6.961 m)', 'Denali (6.190 m)'],
    t: ['K2', 'Mont Blanc', 'Fuji', 'Teide', 'Matterhorn']
  },
  {
    c: 'Volcanes activos conocidos del planeta Tierra',
    f: ['Vesubio', 'Etna', 'Kilauea', 'Krakatoa'],
    m: ['Popocatépetl', 'Fuji', 'Teide'],
    d: ['Cotopaxi', 'Mauna Loa', 'Eyjafjallajökull'],
    t: ['Everest', 'Aconcagua', 'Mont Blanc', 'Matterhorn', 'K2']
  },
  {
    c: 'Grandes cordilleras y cadenas montañosas de la Tierra',
    f: ['Himalaya', 'Cordillera de los Andes', 'Montañas Rocosas', 'Alpes'],
    m: ['Pirineos', 'Montes Urales', 'Cordillera del Cáucaso'],
    d: ['Montes Apalaches', 'Cordillera Atlas', 'Gran Cordillera Divisoria'],
    t: ['Gran Cañón', 'Desierto del Sahara', 'Fosa de las Marianas', 'Valle del Rift', 'Meseta del Tíbet']
  },
  {
    c: 'Montañas y picos más altos de la península ibérica y archipiélagos españoles',
    f: ['Teide', 'Mulhacén', 'Aneto', 'Veleta'],
    m: ['Posets', 'Monte Perdido', 'Almanzor'],
    d: ['Torre Cerredo', 'Peñalara', 'Pico de Piqueras'],
    t: ['Mont Blanc', 'Aconcagua', 'Matterhorn', 'Ben Nevis', 'Olimpo']
  },
  {
    c: 'Picos emblemáticos de la cordillera de los Alpes',
    f: ['Mont Blanc', 'Matterhorn (Cervino)', 'Jungfrau', 'Eiger'],
    m: ['Monte Rosa', 'Grandes Jorasses', 'Finsteraarhorn'],
    d: ['Gran Paradiso', 'Piz Bernina', 'Ortles'],
    t: ['Mulhacén', 'Aneto', 'Elbrús', 'Olimpo', 'Ben Nevis']
  },
  {
    c: 'Penínsulas geográficas más extensas del planeta',
    f: ['Península arábiga', 'Península ibérica', 'Península de Indochina', 'Península escandinava'],
    m: ['Península del Labrador', 'Península de Anatolia', 'Península de Kamchatka'],
    d: ['Península de Corea', 'Península de Florida', 'Península itálica'],
    t: ['Isla de Groenlandia', 'Madagascar', 'Isla de Borneo', 'Gran Bretaña', 'Isla de Cuba']
  },
  {
    c: 'Desiertos más extensos y áridos del planeta Tierra',
    f: ['Desierto del Sáhara', 'Desierto de Arabia', 'Desierto de Gobi', 'Desierto de Kalahari'],
    m: ['Gran Desierto de Victoria', 'Desierto de Atacama', 'Desierto de Sonora'],
    d: ['Desierto de Taklamakán', 'Desierto de Thar', 'Desierto de Namib'],
    t: ['Selva amazónica', 'Taiga siberiana', 'Gran Cañón', 'Estepa rusa', 'Valle de Aosta']
  },
  {
    c: 'Islas más extensas del mundo por superficie terrestre',
    f: ['Groenlandia', 'Nueva Guinea', 'Borneo', 'Madagascar'],
    m: ['Isla de Baffin', 'Sumatra', 'Gran Bretaña'],
    d: ['Honshu', 'Isla Victoria', 'Isla de Ellesmere'],
    t: ['Australia (continente)', 'Islandia', 'Cuba', 'Mallorca', 'Tenerife']
  },
  {
    c: 'Fosas oceánicas con mayor profundidad submarina',
    f: ['Fosa de las Marianas', 'Fosa de Tonga', 'Fosa de Puerto Rico', 'Fosa de las Filipinas'],
    m: ['Fosa de las Kuriles', 'Fosa de Kermadec', 'Fosa de Japón'],
    d: ['Fosa de Perú-Chile (Atacama)', 'Fosa de las Aleutianas', 'Fosa de Sandwich del Sur'],
    t: ['Falla de San Andrés', 'Dorsal Mesoatlántica', 'Gran Arrecife de Coral', 'Valle del Rift', 'Canal de Suez']
  },

  // 31 - 40: América: Países, Capitales y Regiones
  {
    c: 'Países soberanos e independientes de América del Sur',
    f: ['Brasil', 'Argentina', 'Colombia', 'Chile'],
    m: ['Perú', 'Uruguay', 'Ecuador'],
    d: ['Bolivia', 'Paraguay', 'Surinam'],
    t: ['México', 'Costa Rica', 'Panamá', 'Cuba', 'Puerto Rico (territorio)']
  },
  {
    c: 'Capitales estatales de América del Sur',
    f: ['Buenos Aires', 'Bogotá', 'Santiago de Chile', 'Lima'],
    m: ['Montevideo', 'Brasilia', 'Caracas'],
    d: ['Asunción', 'Quito', 'Georgetown'],
    t: ['Río de Janeiro', 'São Paulo', 'Medellín', 'Guayaquil', 'Santa Cruz de la Sierra']
  },
  {
    c: 'Países soberanos de América Central ístmica',
    f: ['Costa Rica', 'Panamá', 'Guatemala', 'Honduras'],
    m: ['El Salvador', 'Nicaragua', 'Belice'],
    d: ['Guatemala (capital)', 'Belmopán', 'Tegucigalpa'],
    t: ['México', 'Colombia', 'Cuba', 'Jamaica', 'Haití']
  },
  {
    c: 'Países insulares soberanos del Mar Caribe (Antillas)',
    f: ['Cuba', 'República Dominicana', 'Jamaica', 'Haití'],
    m: ['Bahamas', 'Trinidad y Tobago', 'Barbados'],
    d: ['Santa Lucía', 'San Cristóbal y Nieves', 'Antigua y Barbuda'],
    t: ['Puerto Rico (EEUU)', 'Guadalupe (Francia)', 'Martinica (Francia)', 'Curazao (Países Bajos)', 'Aruba']
  },
  {
    c: 'Estados federados de los Estados Unidos de América',
    f: ['California', 'Texas', 'Florida', 'Nueva York'],
    m: ['Illinois', 'Washington', 'Pensilvania'],
    d: ['Wyoming', 'Vermont', 'Dakota del Norte'],
    t: ['Puerto Rico', 'Washington D.C. (distrito)', 'Guam', 'Samoa Americana', 'Islas Vírgenes']
  },
  {
    c: 'Provincias confederadas del territorio de Canadá',
    f: ['Ontario', 'Quebec', 'Columbia Británica', 'Alberta'],
    m: ['Manitoba', 'Saskatchewan', 'Nueva Escocia'],
    d: ['Nuevo Brunswick', 'Terranova y Labrador', 'Isla del Príncipe Eduardo'],
    t: ['Yukón (territorio)', 'Territorios del Noroeste (territorio)', 'Nunavut (territorio)', 'Alaska', 'Groenlandia']
  },
  {
    c: 'Estados que componen la República Mexicana',
    f: ['Jalisco', 'Nuevo León', 'Puebla', 'Veracruz'],
    m: ['Yucatán', 'Oaxaca', 'Chihuahua'],
    d: ['Baja California Sur', 'Zacatecas', 'Tlaxcala'],
    t: ['Ciudad de México (entidad federativa)', 'Guatemala', 'Belice', 'Texas', 'California']
  },
  {
    c: 'Capitales de los países de América Central y el Caribe',
    f: ['La Habana', 'Santo Domingo', 'San José', 'Ciudad de Panamá'],
    m: ['Kingston', 'Ciudad de Guatemala', 'San Salvador'],
    d: ['Managua', 'Tegucigalpa', 'Nassau'],
    t: ['San Juan (territorio)', 'Punta Cana', 'Cancún', 'San Pedro Sula', 'Santiago de Cuba']
  },
  {
    c: 'Regiones y departamentos de Colombia',
    f: ['Antioquia', 'Cundinamarca', 'Valle del Cauca', 'Bolívar'],
    m: ['Santander', 'Atlántico', 'Boyacá'],
    d: ['Chocó', 'Amazonas', 'Vaupés'],
    t: ['Caracas', 'Pichincha', 'Guayas', 'Zulia', 'Táchira']
  },
  {
    c: 'Provincias que componen la República Argentina',
    f: ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza'],
    m: ['Salta', 'Tucumán', 'Misiones'],
    d: ['Tierra del Fuego', 'Jujuy', 'La Pampa'],
    t: ['Ciudad Autónoma de Buenos Aires (CABA)', 'Montevideo', 'Punta del Este', 'Santiago', 'Asunción']
  },

  // 41 - 50: África: Países, Geografía y Capitales
  {
    c: 'Países soberanos del continente africano',
    f: ['Egipto', 'Marruecos', 'Sudáfrica', 'Nigeria'],
    m: ['Kenia', 'Senegal', 'Camerún'],
    d: ['Botsuana', 'Eritrea', 'Madagascar'],
    t: ['Yemen', 'Guyana', 'Jordania', 'Surinam', 'Papúa Nueva Guinea']
  },
  {
    c: 'Capitales de países del continente africano',
    f: ['El Cairo', 'Rabat', 'Nairobi', 'Dakar'],
    m: ['Pretoria', 'Abuya', 'Túnez'],
    d: ['Adís Abeba', 'Luanda', 'Maputo'],
    t: ['Johannesburgo', 'Casablanca', 'Lagos', 'Alejandría', 'Marrakech']
  },
  {
    c: 'Países por los que cruza la línea del ecuador terrestre (paralelo 0°)',
    f: ['Ecuador', 'Colombia', 'Brasil', 'Kenia'],
    m: ['Indonesia', 'Uganda', 'República Democrática del Congo'],
    d: ['Gabón', 'Somalia', 'Santo Tomé y Príncipe'],
    t: ['Perú', 'Venezuela', 'Argentina', 'Tanzania', 'México']
  },
  {
    c: 'Países de la región del Magreb y norte de África',
    f: ['Marruecos', 'Argelia', 'Túnez', 'Egipto'],
    m: ['Libia', 'Mauritania', 'Sahara Occidental (territorio)'],
    d: ['Sudán', 'Chad', 'Níger'],
    t: ['Senegal', 'Nigeria', 'Kenia', 'Etiopía', 'Sudáfrica']
  },
  {
    c: 'Países que componen el Cuerno de África',
    f: ['Etiopía', 'Somalia', 'Eritrea', 'Yibuti'],
    m: ['Etiopía (Tierras Altas)', 'Somalia (Puntlandia)', 'Eritrea (Asmara)'],
    d: ['Somalilandia (de facto)', 'Yibuti (Bab el-Mandeb)', 'Ogadén (región)'],
    t: ['Kenia', 'Sudán', 'Yemen', 'Uganda', 'Tanzania']
  },
  {
    c: 'Grandes urbes y ciudades más pobladas de África',
    f: ['El Cairo', 'Lagos', 'Kinshasa', 'Johannesburgo'],
    m: ['Casablanca', 'Nairobi', 'Alejandría'],
    d: ['Adís Abeba', 'Abiyán', 'Luanda'],
    t: ['Pretoria', 'Dakar', 'Túnez', 'Windhoek', 'Gaborone']
  },
  {
    c: 'Países insulares soberanos del océano Índico africano',
    f: ['Madagascar', 'Mauricio', 'Seychelles', 'Comoras'],
    m: ['Cabo Verde (Atlántico)', 'Santo Tomé y Príncipe (Atlántico)', 'Zanzíbar (región)'],
    d: ['Madagascar (Antananarivo)', 'Seychelles (Victoria)', 'Comoras (Moroni)'],
    t: ['Maldivas (Asia)', 'Sri Lanka (Asia)', 'Reunión (Francia)', 'Mayotte (Francia)', 'Santa Elena']
  },
  {
    c: 'Países africanos que tienen costas en el mar Mediterráneo',
    f: ['Marruecos', 'Argelia', 'Túnez', 'Egipto'],
    m: ['Libia', 'Egipto (delta del Nilo)', 'Túnez (Golfo de Túnez)'],
    d: ['Argelia (Orán)', 'Marruecos (Tánger-Med)', 'Libia (Trípoli)'],
    t: ['Sudán', 'Mauritania', 'Senegal', 'Etiopía', 'Somalia']
  },
  {
    c: 'Parques nacionales y reservas naturales emblemáticas de África',
    f: ['Parque Nacional Serengueti', 'Parque Nacional Kruger', 'Masái Mara', 'Cráter de Ngorongoro'],
    m: ['Parque Nacional Amboseli', 'Delta del Okavango', 'Parque Nacional Chobe'],
    d: ['Parque Nacional de Virunga', 'Reserva de Bwindi', 'Etosha'],
    t: ['Yellowstone', 'Yosemite', 'Doñana', 'Kruger (ciudad)', 'Galápagos']
  },
  {
    c: 'Países africanos atravesados por el río Nilo (cuenca hidrográfica)',
    f: ['Egipto', 'Sudán', 'Uganda', 'Etiopía'],
    m: ['Sudán del Sur', 'Ruanda', 'Burundi'],
    d: ['Tanzania', 'República Democrática del Congo', 'Kenia'],
    t: ['Marruecos', 'Argelia', 'Nigeria', 'Sudáfrica', 'Angola']
  },

  // 51 - 60: Asia y Oriente Medio
  {
    c: 'Países pertenecientes al continente asiático',
    f: ['Japón', 'Corea del Sur', 'China', 'India'],
    m: ['Tailandia', 'Vietnam', 'Filipinas'],
    d: ['Bután', 'Kazajistán', 'Mongolia'],
    t: ['Madagascar', 'Australia', 'Egipto (mayoría)', 'Nueva Zelanda', 'Fiyi']
  },
  {
    c: 'Capitales de países del continente asiático',
    f: ['Tokio', 'Pekín', 'Nueva Delhi', 'Bangkok'],
    m: ['Seúl', 'Yakarta', 'Hanoi'],
    d: ['Ulán Bator', 'Katmandú', 'Timbu'],
    t: ['Sídney', 'El Cairo', 'Dubái', 'Shanghái', 'Bombay']
  },
  {
    c: 'Países que conforman la región del Sudeste Asiático (ASEAN)',
    f: ['Tailandia', 'Vietnam', 'Indonesia', 'Filipinas'],
    m: ['Malasia', 'Singapur', 'Camboya'],
    d: ['Laos', 'Birmania (Myanmar)', 'Brunéi'],
    t: ['Corea del Sur', 'Taiwán', 'Bangladés', 'Nepal', 'Sri Lanka']
  },
  {
    c: 'Países que integran la península arábiga y el Golfo Pérsico',
    f: ['Arabia Saudita', 'Emiratos Árabes Unidos', 'Qatar', 'Omán'],
    m: ['Kuwait', 'Baréin', 'Yemen'],
    d: ['Riad', 'Abu Dabi', 'Mascate'],
    t: ['Irán', 'Irak', 'Jordania', 'Siria', 'Egipto']
  },
  {
    c: 'Repúblicas exsoviéticas de Asia Central (los «Stanes»)',
    f: ['Kazajistán', 'Uzbekistán', 'Turkmenistán', 'Kirguistán'],
    m: ['Tayikistán', 'Kazajistán (Astaná)', 'Uzbekistán (Taskent)'],
    d: ['Samarcanda (ciudad)', 'Biskek', 'Asjabad'],
    t: ['Afganistán', 'Pakistán', 'Azerbaiyán', 'Armenia', 'Georgia']
  },
  {
    c: 'Archipiélagos e islas soberanas de Asia Oriental y Meridional',
    f: ['Japón', 'Filipinas', 'Indonesia', 'Sri Lanka'],
    m: ['Maldivas', 'Singapur', 'Taiwán (de facto)'],
    d: ['Timor Oriental', 'Brunéi', 'Borneo (territorio)'],
    t: ['Madagascar', 'Seychelles', 'Mauricio', 'Hawái', 'Guam']
  },
  {
    c: 'Mares marginales que rodean el continente asiático',
    f: ['Mar Rojo', 'Mar de Arabia', 'Mar de la China Meridional', 'Mar de Japón'],
    m: ['Mar de Ojotsk', 'Mar Amarillo', 'Mar de Andamán'],
    d: ['Mar de Joló', 'Mar de Banda', 'Mar de Flores'],
    t: ['Mar Báltico', 'Mar del Norte', 'Mar Caspio', 'Mar de Irlanda', 'Mar Tirreno']
  },
  {
    c: 'Grandes ríos de la cuenca hidrográfica de Asia',
    f: ['Yangtsé', 'Río Amarillo (Huang He)', 'Ganges', 'Mekong'],
    m: ['Indo', 'Brahmaputra', 'Tigris'],
    d: ['Éufrates', 'Amur', 'Irawadi'],
    t: ['Danubio', 'Amazonas', 'Congo', 'Rin', 'Volga']
  },
  {
    c: 'Ciudades y metrópolis con mayor densidad demográfica de Asia',
    f: ['Tokio', 'Delhi', 'Shanghái', 'Dacca'],
    m: ['Bombay (Mumbai)', 'Pekín', 'Karachi'],
    d: ['Manila', 'Yakarta', 'Seúl'],
    t: ['Londres', 'Nueva York', 'París', 'Sídney', 'Madrid']
  },
  {
    c: 'Países de la región del Cáucaso transcaucásico',
    f: ['Georgia', 'Armenia', 'Azerbaiyán', 'Rusia (Cáucaso Norte)'],
    m: ['Tiflis', 'Ereván', 'Bakú'],
    d: ['Nagorno Karabaj (territorio)', 'Abjasia (disputado)', 'Osetia del Sur (disputado)'],
    t: ['Turquía', 'Irán', 'Irak', 'Siria', 'Jordania']
  },

  // 61 - 70: Oceanía y Territorios Insulares
  {
    c: 'Países soberanos e independientes de Oceanía',
    f: ['Australia', 'Nueva Zelanda', 'Fiyi', 'Papúa Nueva Guinea'],
    m: ['Samoa', 'Tonga', 'Vanuatu'],
    d: ['Kiribati', 'Tuvalu', 'Palaos'],
    t: ['Filipinas', 'Indonesia', 'Hawái (EEUU)', 'Guam', 'Madagascar']
  },
  {
    c: 'Territorios y estados que conforman la Mancomunidad de Australia',
    f: ['Nueva Gales del Sur', 'Victoria', 'Queensland', 'Australia Occidental'],
    m: ['Australia Meridional', 'Tasmania', 'Territorio del Norte'],
    d: ['Territorio de la Capital Australiana', 'Isla Norfolk', 'Isla de Navidad'],
    t: ['Auckland', 'Isla Sur', 'Papúa', 'Fiyi', 'Polinesia']
  },
  {
    c: 'Ciudades metropolitanas principales de Australia',
    f: ['Sídney', 'Melbourne', 'Brisbane', 'Perth'],
    m: ['Adelaida', 'Canberra (capital)', 'Gold Coast'],
    d: ['Hobart', 'Darwin', 'Newcastle'],
    t: ['Auckland', 'Wellington', 'Christchurch', 'Port Moresby', 'Suva']
  },
  {
    c: 'Regiones y ciudades principales de Nueva Zelanda',
    f: ['Auckland', 'Wellington', 'Christchurch', 'Isla Norte'],
    m: ['Isla Sur', 'Queenstown', 'Dunedin'],
    d: ['Hamilton', 'Tauranga', 'Estrecho de Cook'],
    t: ['Sídney', 'Melbourne', 'Brisbane', 'Hobart', 'Cairns']
  },
  {
    c: 'Regiones tradicionales en las que se divide Oceanía',
    f: ['Polinesia', 'Micronesia', 'Melanesia', 'Australasia'],
    m: ['Nueva Zelanda (Polinesia)', 'Fiyi (Melanesia)', 'Guam (Micronesia)'],
    d: ['Islas Marianas', 'Islas Carolinas', 'Islas Marshall'],
    t: ['Indochina', 'Insulindia', 'Siberia', 'Magreb', 'Antillas']
  },
  {
    c: 'Atolones, archipiélagos y territorios de ultramar en la Polinesia',
    f: ['Hawái (EEUU)', 'Tahití (Francia)', 'Bora Bora', 'Isla de Pascua (Chile)'],
    m: ['Samoa Americana', 'Islas Cook', 'Tonga'],
    d: ['Tuvalu', 'Tokelau', 'Niue'],
    t: ['Fiyi', 'Palaos', 'Guam', 'Islas Salomón', 'Nueva Caledonia']
  },
  {
    c: 'Mares marginales que bañan las costas de Oceanía',
    f: ['Mar del Coral', 'Mar de Tasmania', 'Mar de Timor', 'Mar de Arafura'],
    m: ['Mar de Salomón', 'Mar de Bismarck', 'Gran Bahía Australiana'],
    d: ['Golfo de Carpentaria', 'Estrecho de Bass', 'Mar de Fiyi'],
    t: ['Mar de Japón', 'Mar de Bering', 'Mar Rojo', 'Mar Negro', 'Mar Caspio']
  },
  {
    c: 'Accidentes geográficos del continente antártico',
    f: ['Península Antártica', 'Montes Transantárticos', 'Barrera de hielo de Ross', 'Polo Sur geográfico'],
    m: ['Barrera de hielo Filchner-Ronne', 'Tierra de Marie Byrd', 'Meseta Antártica'],
    d: ['Glaciar Thwaites', 'Monte Vinson', 'Mar de Weddell'],
    t: ['Groenlandia', 'Círculo Polar Ártico', 'Svalbard', 'Isla de Baffin', 'Estrecho de Bering']
  },
  {
    c: 'Islas subantárticas situadas en el océano Austral',
    f: ['Islas Malvinas', 'Islas Georgias del Sur', 'Islas Sandwich del Sur', 'Isla Kerguelen'],
    m: ['Isla Bouvet', 'Islas Heard y McDonald', 'Isla Macquarie'],
    d: ['Islas Crozet', 'Isla de San Pablo', 'Islas Diego Ramírez'],
    t: ['Islas Canarias', 'Islas Baleares', 'Azores', 'Hawái', 'Galápagos']
  },
  {
    c: 'Capitales de los microestados insulares de Oceanía',
    f: ['Suva (Fiyi)', 'Nukualofa (Tonga)', 'Apia (Samoa)', 'Port Moresby (Papúa Nueva Guinea)'],
    m: ['Port Vila (Vanuatu)', 'Honiara (Islas Salomón)', 'Tarawa (Kiribati)'],
    d: ['Funafuti (Tuvalu)', 'Yaren (Nauru de facto)', 'Ngerulmud (Palaos)'],
    t: ['Auckland', 'Christchurch', 'Canberra', 'Honolulú', 'Papeete']
  },

  // 71 - 85: Geografía de España: Autonomías, Provincias y Relieve
  {
    c: 'Provincias que integran la comunidad autónoma de Andalucía',
    f: ['Sevilla', 'Málaga', 'Granada', 'Cádiz'],
    m: ['Córdoba', 'Huelva', 'Almería'],
    d: ['Jaén', 'Sevilla (Guadalquivir)', 'Cádiz (Tarifa)'],
    t: ['Badajoz', 'Murcia', 'Albacete', 'Ciudad Real', 'Cáceres']
  },
  {
    c: 'Provincias que componen la comunidad autónoma de Castilla y León',
    f: ['Valladolid', 'Salamanca', 'Burgos', 'León'],
    m: ['Segovia', 'Ávila', 'Zamora'],
    d: ['Palencia', 'Soria', 'León (Bierzo)'],
    t: ['Toledo', 'Guadalajara', 'Madrid', 'Ourense', 'Cantabria']
  },
  {
    c: 'Provincias que componen la comunidad autónoma de Castilla-La Mancha',
    f: ['Toledo', 'Ciudad Real', 'Albacete', 'Cuenca'],
    m: ['Guadalajara', 'Toledo (Tajo)', 'Ciudad Real (Almagro)'],
    d: ['Cuenca (Serranía)', 'Albacete (Hellín)', 'Guadalajara (Alcarria)'],
    t: ['Madrid', 'Ávila', 'Cáceres', 'Jaén', 'Valencia']
  },
  {
    c: 'Comunidades autónomas uniprovinciales de España',
    f: ['Comunidad de Madrid', 'Principado de Asturias', 'Cantabria', 'Región de Murcia'],
    m: ['Comunidad Foral de Navarra', 'La Rioja', 'Islas Baleares'],
    d: ['Navarra (Pamplona)', 'La Rioja (Logroño)', 'Asturias (Oviedo)'],
    t: ['País Vasco', 'Galicia', 'Extremadura', 'Aragón', 'Castilla y León']
  },
  {
    c: 'Provincias catalanas que integran Cataluña',
    f: ['Barcelona', 'Girona (Gerona)', 'Tarragona', 'Lleida (Lérida)'],
    m: ['Barcelona (Costa Central)', 'Girona (Costa Brava)', 'Tarragona (Costa Dorada)'],
    d: ['Lleida (Pirineo)', 'Tarragona (Delta del Ebro)', 'Girona (Pirineo)'],
    t: ['Huesca', 'Zaragoza', 'Castellón', 'Teruel', 'Baleares']
  },
  {
    c: 'Provincias gallegas que integran la comunidad de Galicia',
    f: ['A Coruña (La Coruña)', 'Pontevedra', 'Lugo', 'Ourense (Orense)'],
    m: ['A Coruña (Rías Altas)', 'Pontevedra (Rías Baixas)', 'Lugo (Mariña Lucense)'],
    d: ['Ourense (Ribeira Sacra)', 'Lugo (río Miño)', 'Pontevedra (Vigo)'],
    t: ['Asturias', 'León', 'Zamora', 'Cantabria', 'Braga']
  },
  {
    c: 'Provincias que integran la Comunidad Valenciana',
    f: ['Valencia', 'Alicante', 'Castellón', 'Valencia (capital)'],
    m: ['Alicante (Costa Blanca)', 'Castellón (Costa del Azahar)', 'Valencia (Albufera)'],
    d: ['Castellón (Maestrazgo)', 'Alicante (Vega Baja)', 'Valencia (Requena)'],
    t: ['Murcia', 'Albacete', 'Teruel', 'Cuenca', 'Tarragona']
  },
  {
    c: 'Comunidades autónomas españolas con litoral costero marítimo',
    f: ['Andalucía', 'Cataluña', 'Galicia', 'Comunidad Valenciana'],
    m: ['Principado de Asturias', 'Cantabria', 'País Vasco'],
    d: ['Islas Baleares', 'Islas Canarias', 'Región de Murcia'],
    t: ['Comunidad de Madrid', 'Castilla-La Mancha', 'Extremadura', 'Aragón', 'Castilla y León']
  },
  {
    c: 'Sistemas montañosos que vertebran la península ibérica',
    f: ['Pirineos', 'Sistema Central', 'Cordillera Cantábrica', 'Sistemas Béticos'],
    m: ['Sistema Ibérico', 'Sierra Morena', 'Montes de Toledo'],
    d: ['Macizo Galaico-Leonés', 'Sierra de Guadarrama', 'Sierra de Gredos'],
    t: ['Alpes', 'Cárpatos', 'Urales', 'Apeninos', 'Balcanes']
  },
  {
    c: 'Islas principales que componen el archipiélago de las Islas Canarias',
    f: ['Tenerife', 'Gran Canaria', 'Lanzarote', 'Fuerteventura'],
    m: ['La Palma', 'La Gomera', 'El Hierro'],
    d: ['La Graciosa (octava)', 'Alegranza (islote)', 'Lobos (islote)'],
    t: ['Mallorca', 'Menorca', 'Ibiza', 'Formentera', 'Cabrera']
  },
  {
    c: 'Islas principales que componen el archipiélago de las Islas Baleares',
    f: ['Mallorca', 'Menorca', 'Ibiza', 'Formentera'],
    m: ['Cabrera (parque nacional)', 'Conejera (islote)', 'Dragonera (islote)'],
    d: ['S\'Espalmador', 'Tagomago', 'Es Vedrà'],
    t: ['Tenerife', 'Gran Canaria', 'Lanzarote', 'Fuerteventura', 'La Palma']
  },
  {
    c: 'Provincias que integran la comunidad autónoma de Aragón',
    f: ['Zaragoza', 'Huesca', 'Teruel', 'Zaragoza (capital)'],
    m: ['Huesca (Pirineo aragonés)', 'Teruel (Albarracín)', 'Zaragoza (Ebro)'],
    d: ['Huesca (Ordesa)', 'Teruel (Bajo Aragón)', 'Zaragoza (Calatayud)'],
    t: ['Navarra', 'Lleida', 'Guadalajara', 'Soria', 'Castellón']
  },
  {
    c: 'Provincias que integran la comunidad autónoma del País Vasco',
    f: ['Bizkaia (Vizcaya)', 'Gipuzkoa (Guipúzcoa)', 'Álava (Araba)', 'Bizkaia (Bilbao)'],
    m: ['Gipuzkoa (San Sebastián)', 'Álava (Vitoria-Gasteiz)', 'Bizkaia (Urdaibai)'],
    d: ['Gipuzkoa (Zarautz)', 'Álava (Rioja Alavesa)', 'Bizkaia (Gernika)'],
    t: ['Navarra', 'Cantabria', 'Burgos', 'La Rioja', 'Huesca']
  },
  {
    c: 'Provincias que integran la comunidad autónoma de Extremadura',
    f: ['Badajoz', 'Cáceres', 'Badajoz (capital)', 'Cáceres (capital)'],
    m: ['Cáceres (Trujillo)', 'Badajoz (Mérida)', 'Cáceres (Plasencia)'],
    d: ['Cáceres (Valle del Jerte)', 'Badajoz (Zafra)', 'Cáceres (La Vera)'],
    t: ['Toledo', 'Ciudad Real', 'Sevilla', 'Huelva', 'Córdoba']
  },
  {
    c: 'Cabos geográficos destacados de la costa española',
    f: ['Cabo de Finisterre', 'Cabo de Gata', 'Cabo de Creus', 'Cabo de Palos'],
    m: ['Cabo de San Vicente (histórico/cercano)', 'Cabo Peñas', 'Cabo de la Nao'],
    d: ['Cabo Ortegal', 'Cabo Machichaco', 'Cabo Trafalgar'],
    t: ['Cabo de Buena Esperanza', 'Cabo de Hornos', 'Cabo Cañaveral', 'Cabo Verde', 'Cabo York']
  },

  // 86 - 100: Monumentos Naturales, Demografía y Fenómenos Globales
  {
    c: 'Países más extensos del planeta por superficie territorial total',
    f: ['Rusia', 'Canadá', 'China', 'Estados Unidos'],
    m: ['Brasil', 'Australia', 'India'],
    d: ['Argentina', 'Kazajistán', 'Argelia'],
    t: ['Francia', 'Alemania', 'Japón', 'España', 'Reino Unido']
  },
  {
    c: 'Países más poblados del planeta Tierra',
    f: ['India', 'China', 'Estados Unidos', 'Indonesia'],
    m: ['Pakistán', 'Nigeria', 'Brasil'],
    d: ['Bangladés', 'Rusia', 'México'],
    t: ['Alemania', 'Francia', 'Reino Unido', 'Italia', 'Canadá']
  },
  {
    c: 'Países con mayor cantidad de islas en su territorio nacional',
    f: ['Suecia', 'Noruega', 'Finlandia', 'Canadá'],
    m: ['Indonesia', 'Japón', 'Filipinas'],
    d: ['Grecia', 'Reino Unido', 'Chile'],
    t: ['Bolivia', 'Suiza', 'Austria', 'Paraguay', 'Hungría']
  },
  {
    c: 'Países atravesados por el meridiano de Greenwich (meridiano 0°)',
    f: ['Reino Unido', 'Francia', 'España', 'Argelia'],
    m: ['Malí', 'Burkina Faso', 'Ghana'],
    d: ['Togo', 'España (Castellón)', 'Reino Unido (Londres)'],
    t: ['Portugal', 'Italia', 'Alemania', 'Bélgica', 'Marruecos']
  },
  {
    c: 'Grandes deltas fluviales del mundo',
    f: ['Delta del Nilo', 'Delta del Misisipi', 'Delta del Amazonas', 'Delta del Ebro'],
    m: ['Delta del Ganges-Brahmaputra', 'Delta del Mekong', 'Delta del Danubio'],
    d: ['Delta del Níger', 'Delta del Okavango (interior)', 'Delta del Rin-Mosa'],
    t: ['Fosa de las Marianas', 'Cataratas del Niágara', 'Gran Cañón', 'Falla de San Andrés', 'Estrecho de Bering']
  },
  {
    c: 'Grandes golfos marinos del planeta',
    f: ['Golfo de México', 'Golfo Pérsico', 'Golfo de Guinea', 'Golfo de Bengala'],
    m: ['Golfo de Vizcaya', 'Golfo de California', 'Golfo de Adén'],
    d: ['Golfo de Omán', 'Golfo de Carpentaria', 'Golfo de Botnia'],
    t: ['Península arábiga', 'Canal de la Mancha', 'Estrecho de Gibraltar', 'Mar Muerto', 'Cabo de Hornos']
  },
  {
    c: 'Países cuya bandera nacional contiene los colores rojo, blanco y azul (típicos tricolores)',
    f: ['Estados Unidos', 'Francia', 'Reino Unido', 'Rusia'],
    m: ['Países Bajos', 'Chile', 'Cuba'],
    d: ['República Checa', 'Noruega', 'Australia'],
    t: ['Alemania', 'España', 'Italia', 'Brasil', 'México']
  },
  {
    c: 'Países soberanos que tienen costas en el océano Ártico',
    f: ['Rusia', 'Canadá', 'Estados Unidos (Alaska)', 'Noruega'],
    m: ['Dinamarca (Groenlandia)', 'Islandia (límite sur)', 'Rusia (Siberia)'],
    d: ['Noruega (Svalbard)', 'Canadá (Territorios del Noroeste)', 'Estados Unidos (Mar de Beaufort)'],
    t: ['Suecia (sin costa ártica)', 'Finlandia (sin costa ártica)', 'Reino Unido', 'Alemania', 'Irlanda']
  },
  {
    c: 'Países que tienen más de una capital oficial o constitucional/administrativa',
    f: ['Sudáfrica (Pretoria/Ciudad del Cabo/Bloemfontein)', 'Bolivia (Sucre/La Paz)', 'Países Bajos (Ámsterdam/La Haya)', 'Chile (Santiago/Valparaíso)'],
    m: ['Costa de Marfil (Yamusukro/Abiyán)', 'Malasia (Kuala Lumpur/Putrajaya)', 'Sri Lanka (Colombo/Sri Jayawardenepura Kotte)'],
    d: ['Benín (Porto Novo/Cotonú)', 'Tanzania (Dodoma/Dar es Salaam)', 'Suazilandia (Mbabane/Lobamba)'],
    t: ['España', 'Francia', 'Alemania', 'Italia', 'Estados Unidos']
  },
  {
    c: 'Patrimonios Naturales de la Humanidad declarados por la UNESCO',
    f: ['Gran Barrera de Coral', 'Parque Nacional de Yellowstone', 'Islas Galápagos', 'Parque Nacional del Gran Cañón'],
    m: ['Parque Nacional de Doñana', 'Parque Nacional de Yosemite', 'Cataratas del Iguazú'],
    d: ['Parque Nacional de Komodo', 'Fiordos occidentales de Noruega', 'Parque Nacional del Teide'],
    t: ['Torre Eiffel', 'Coliseo de Roma', 'Estatua de la Libertad', 'Big Ben', 'Sagrada Familia']
  },
  {
    c: 'Países con costas en el océano Índico',
    f: ['India', 'Sudáfrica', 'Australia', 'Indonesia'],
    m: ['Kenia', 'Tanzania', 'Madagascar'],
    d: ['Mozambique', 'Omán', 'Sri Lanka'],
    t: ['España', 'Brasil', 'Japón', 'Chile', 'Canadá']
  },
  {
    c: 'Países con costas en el mar Caribe',
    f: ['Colombia', 'Venezuela', 'México', 'Costa Rica'],
    m: ['Panamá', 'Cuba', 'República Dominicana'],
    d: ['Honduras', 'Nicaragua', 'Jamaica'],
    t: ['Ecuador', 'Perú', 'Chile', 'Brasil', 'Argentina']
  },
  {
    c: 'Poblaciones e islas que forman el archipiélago de la Polinesia Francesa',
    f: ['Tahití', 'Bora Bora', 'Moorea', 'Islas Marquesas'],
    m: ['Papeete (capital)', 'Raiatea', 'Huahine'],
    d: ['Rangiroa', 'Fakarava', 'Nuku Hiva'],
    t: ['Fiyi', 'Samoa', 'Tonga', 'Guam', 'Nueva Caledonia']
  },
  {
    c: 'Países cuyos nombres coinciden o derivan directamente de sus capitales o viceversa',
    f: ['Ciudad de México (México)', 'Ciudad de Panamá (Panamá)', 'Ciudad de Guatemala (Guatemala)', 'Mónaco (Mónaco)'],
    m: ['San Marino (San Marino)', 'Ciudad del Vaticano (Vaticano)', 'Luxemburgo (Luxemburgo)'],
    d: ['Singapur (Singapur)', 'Argel (Argelia)', 'Túnez (Túnez)'],
    t: ['Buenos Aires', 'Madrid', 'París', 'Tokio', 'Berlín']
  },
  {
    c: 'Enclaves y exclaves territoriales soberanos del mundo',
    f: ['Lesoto (dentro de Sudáfrica)', 'San Marino (dentro de Italia)', 'Ciudad del Vaticano (dentro de Italia)', 'Llívia (enclave español en Francia)'],
    m: ['Kaliningrado (exclave ruso)', 'Ceuta (España en África)', 'Melilla (España en África)'],
    d: ['Campione d\'Italia (enclave italiano en Suiza)', 'Büsingen am Hochrhein (enclave alemán en Suiza)', 'Cabinda (exclave de Angola)'],
    t: ['Gibraltar (territorio de ultramar, no enclave rodeado)', 'Andorra', 'Mónaco', 'Portugal', 'Bélgica']
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