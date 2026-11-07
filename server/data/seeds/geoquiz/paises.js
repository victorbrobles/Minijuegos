// server/data/seeds/geoquiz/paises.js — Países y fronteras
import { R, O, E, P, ORD } from './_tipos.js';

export default {
  id: 'paises',
  nombre: 'Países y fronteras',
  icono: 'globe',
  preguntas: [
    // Capitales
    R('Capitales', '¿Cuál es la capital de Australia?', 'Canberra', 'Muchos creen que es Sídney, pero Canberra se construyó como capital en 1913.'),
    R('Capitales', '¿Cuál es la capital de Canadá?', 'Ottawa'),
    R('Capitales', '¿Cuál es la capital de Turquía?', 'Ankara', 'Estambul es la ciudad más poblada, pero la capital es Ankara desde 1923.'),
    R('Capitales', '¿Cuál es la capital de Nueva Zelanda?', 'Wellington'),
    R('Capitales', '¿Cuál es la capital de Marruecos?', 'Rabat'),
    R('Capitales', '¿Cuál es la capital de Nigeria?', 'Abuya|Abuja'),
    R('Capitales', '¿Cuál es la capital de Kazajistán?', 'Astaná|Astana'),
    R('Capitales', '¿Cuál es la capital de Pakistán?', 'Islamabad'),
    R('Capitales', '¿Cuál es la capital de Myanmar?', 'Naipyidó|Naypyidaw|Nay Pyi Taw'),

    // Países vecinos
    E('Países vecinos', '¿Qué países tienen frontera terrestre con Alemania?', [
      'Dinamarca', 'Polonia', 'República Checa|Chequia', 'Austria', 'Suiza', 'Francia', 'Luxemburgo', 'Bélgica', 'Países Bajos|Holanda'
    ]),
    E('Países vecinos', '¿Qué países tienen frontera terrestre con Francia (en Europa)?', [
      'España', 'Andorra', 'Mónaco', 'Italia', 'Suiza', 'Alemania', 'Luxemburgo', 'Bélgica'
    ]),
    E('Países vecinos', '¿Qué países tienen frontera terrestre con Brasil?', [
      'Uruguay', 'Argentina', 'Paraguay', 'Bolivia', 'Perú', 'Colombia', 'Venezuela', 'Guyana', 'Surinam', 'Francia|Guayana Francesa'
    ], 'Francia también cuenta: la Guayana Francesa es territorio francés.'),
    E('Países vecinos', '¿Qué países tienen frontera terrestre con China?', [
      'Rusia', 'Mongolia', 'Kazajistán', 'Kirguistán', 'Tayikistán', 'Afganistán', 'Pakistán', 'India', 'Nepal', 'Bután',
      'Myanmar|Birmania', 'Laos', 'Vietnam', 'Corea del Norte'
    ], 'China limita con 14 países, igual que Rusia.'),
    E('Países vecinos', '¿Qué países tienen frontera terrestre con Austria?', [
      'Alemania', 'República Checa|Chequia', 'Eslovaquia', 'Hungría', 'Eslovenia', 'Italia', 'Suiza', 'Liechtenstein'
    ]),
    R('Países vecinos', '¿Con qué único país tiene frontera terrestre Dinamarca?', 'Alemania'),
    R('Países vecinos', '¿Con qué único país tiene frontera terrestre Haití?', 'República Dominicana|Dominicana'),
    R('Países vecinos', '¿Con qué único país tiene frontera terrestre Canadá?', 'Estados Unidos|EEUU|EE UU|USA'),

    // Fronteras imposibles
    R('Fronteras imposibles', '¿Qué país limita a la vez con España y con Francia?', 'Andorra'),
    R('Fronteras imposibles', '¿Qué país limita a la vez con Italia y con Hungría?', 'Austria|Eslovenia'),
    R('Fronteras imposibles', '¿Qué país limita a la vez con Colombia, Brasil y Ecuador?', 'Perú'),
    R('Fronteras imposibles', '¿Qué país europeo limita a la vez con Rusia y con Noruega?', 'Finlandia'),

    // Países sin costa
    E('Países sin costa', 'Países de África sin salida al mar', [
      'Malí|Mali', 'Níger', 'Chad', 'República Centroafricana|Centroafrica', 'Sudán del Sur', 'Etiopía', 'Uganda', 'Ruanda',
      'Burundi', 'Malaui|Malawi', 'Zambia', 'Zimbabue|Zimbabwe', 'Botsuana|Botswana', 'Lesoto', 'Esuatini|Suazilandia', 'Burkina Faso'
    ]),
    E('Países sin costa', 'Países de Europa sin salida al mar', [
      'Andorra', 'Austria', 'Bielorrusia', 'República Checa|Chequia', 'Hungría', 'Liechtenstein', 'Luxemburgo',
      'Macedonia del Norte|Macedonia', 'Moldavia', 'San Marino', 'Serbia', 'Eslovaquia', 'Suiza', 'Ciudad del Vaticano|Vaticano', 'Kosovo'
    ]),

    // Países insulares
    E('Países insulares', 'Países del Caribe formados por islas', [
      'Cuba', 'Jamaica', 'Haití', 'República Dominicana|Dominicana', 'Bahamas', 'Barbados', 'Trinidad y Tobago', 'Granada',
      'San Vicente y las Granadinas', 'Santa Lucía', 'Dominica', 'Antigua y Barbuda', 'San Cristóbal y Nieves'
    ]),

    // Países por letra
    E('Países por letra', 'Países que empiezan por M', [
      'Madagascar', 'Malasia', 'Malaui|Malawi', 'Maldivas', 'Malí|Mali', 'Malta', 'Marruecos', 'Mauricio', 'Mauritania', 'México',
      'Micronesia', 'Moldavia', 'Mónaco', 'Mongolia', 'Montenegro', 'Mozambique', 'Myanmar|Birmania'
    ]),
    E('Países por letra', 'Países que empiezan por S', [
      'Samoa', 'San Cristóbal y Nieves', 'San Marino', 'San Vicente y las Granadinas', 'Santa Lucía', 'Santo Tomé y Príncipe',
      'Senegal', 'Serbia', 'Seychelles', 'Sierra Leona', 'Singapur', 'Siria', 'Somalia', 'Sri Lanka', 'Sudáfrica', 'Sudán',
      'Sudán del Sur', 'Suecia', 'Suiza', 'Surinam'
    ]),

    // Países por continente
    E('Países por continente', 'Países de América del Sur', [
      'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay', 'Perú', 'Surinam', 'Uruguay', 'Venezuela'
    ]),
    O('Países por continente', '¿En qué continente está Surinam?', 'América', ['África', 'Asia', 'Oceanía']),

    // Superficie y población
    ORD('Países por superficie', 'Ordena estos países de mayor a menor superficie', ['Rusia', 'Canadá', 'Brasil', 'Australia', 'India'], 'de mayor a menor superficie'),
    ORD('Países por superficie', 'Ordena estos países de mayor a menor superficie', ['Argentina', 'Kazajistán', 'Argelia', 'México', 'España'], 'de mayor a menor superficie'),
    ORD('Países por población', 'Ordena estos países de más a menos habitantes', ['India', 'China', 'Estados Unidos', 'Indonesia', 'Brasil'], 'de más a menos habitantes'),
    ORD('Países por población', 'Ordena estos países de más a menos habitantes', ['Alemania', 'Francia', 'España', 'Portugal', 'Islandia'], 'de más a menos habitantes'),
    O('Países por superficie', '¿Cuál es el país más grande de África?', 'Argelia', ['Egipto', 'Nigeria', 'Sudáfrica'], 'Desde 2011, cuando Sudán se dividió en dos, el mayor es Argelia.'),

    // País misterioso
    P('País misterioso', [
      'Está en América del Sur',
      'No tiene salida al mar',
      'Limita con cinco países',
      'Comparte con Perú el lago Titicaca',
      'Su capital constitucional es Sucre'
    ], 'Bolivia'),
    P('País misterioso', [
      'Está en Asia',
      'No tiene salida al mar',
      'Solo limita con dos países',
      'Es el país con menos habitantes por kilómetro cuadrado del mundo',
      'Su capital es Ulán Bator'
    ], 'Mongolia'),
    P('País misterioso', [
      'Está en Europa',
      'No tiene salida al mar',
      'Tiene cuatro idiomas oficiales',
      'Es famoso por sus relojes, sus bancos y su neutralidad',
      'Su capital es Berna'
    ], 'Suiza'),
    P('País misterioso', [
      'Es un país insular',
      'Está en el Atlántico Norte',
      'Tiene más de 100 volcanes y muchos géiseres',
      'No tiene ejército propio',
      'Su capital es Reikiavik'
    ], 'Islandia'),
    P('País misterioso', [
      'Es uno de los países más largos y estrechos del mundo',
      'Tiene el desierto no polar más árido del planeta',
      'Limita con Perú, Bolivia y Argentina',
      'La isla de Pascua le pertenece',
      'Su capital es Santiago'
    ], 'Chile')
  ]
};
