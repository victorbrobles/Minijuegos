// server/data/seeds/geoquiz/humana.js — Cultura y geografía humana
import { O, E } from './_tipos.js';

export default {
  id: 'humana',
  nombre: 'Geografía humana',
  icono: 'users',
  preguntas: [
    E('Países con una característica', 'Países que tienen el euro como moneda oficial', [
      'Alemania', 'Austria', 'Bélgica', 'Bulgaria', 'Chipre', 'Croacia', 'Eslovaquia', 'Eslovenia', 'España', 'Estonia', 'Finlandia',
      'Francia', 'Grecia', 'Irlanda', 'Italia', 'Letonia', 'Lituania', 'Luxemburgo', 'Malta', 'Países Bajos|Holanda', 'Portugal',
      'Andorra', 'Mónaco', 'San Marino', 'Ciudad del Vaticano|Vaticano', 'Montenegro', 'Kosovo'
    ], 'Bulgaria se unió al euro el 1 de enero de 2026. Montenegro y Kosovo lo usan sin acuerdo formal.'),
    E('Países con una característica', 'Países donde se conduce por la izquierda', [
      'Reino Unido|Inglaterra', 'Irlanda', 'Malta', 'Chipre', 'Japón', 'India', 'Australia', 'Nueva Zelanda', 'Sudáfrica', 'Tailandia',
      'Indonesia', 'Malasia', 'Singapur', 'Kenia', 'Jamaica', 'Pakistán', 'Bangladés|Bangladesh', 'Sri Lanka', 'Nepal', 'Bután',
      'Tanzania', 'Uganda', 'Zimbabue|Zimbabwe', 'Zambia', 'Mozambique', 'Namibia', 'Botsuana|Botswana', 'Mauricio', 'Bahamas',
      'Barbados', 'Trinidad y Tobago', 'Guyana', 'Surinam', 'Brunéi|Brunei', 'Timor Oriental', 'Fiyi|Fiji', 'Papúa Nueva Guinea',
      'Lesoto', 'Esuatini|Suazilandia', 'Malaui|Malawi', 'Maldivas', 'Seychelles'
    ]),
    E('Países con una característica', 'Países sin ejército propio', [
      'Costa Rica', 'Panamá', 'Islandia', 'Andorra', 'Liechtenstein', 'Mónaco', 'Ciudad del Vaticano|Vaticano', 'Granada', 'Dominica',
      'Santa Lucía', 'San Vicente y las Granadinas', 'Samoa', 'Tuvalu', 'Nauru', 'Kiribati', 'Islas Marshall|Marshall', 'Micronesia',
      'Palaos|Palau', 'Islas Salomón|Salomón'
    ]),
    E('Países con una característica', 'Monarquías de Europa', [
      'España', 'Reino Unido', 'Noruega', 'Suecia', 'Dinamarca', 'Países Bajos|Holanda', 'Bélgica', 'Luxemburgo', 'Mónaco',
      'Liechtenstein', 'Andorra', 'Ciudad del Vaticano|Vaticano'
    ], 'Andorra tiene dos copríncipes y el Vaticano es una monarquía electiva.'),
    E('Países con una característica', 'Países con más de un idioma oficial', [
      'Suiza', 'Bélgica', 'Canadá', 'Finlandia', 'Irlanda', 'Luxemburgo', 'Malta', 'Singapur', 'India', 'Sudáfrica', 'Bolivia',
      'Paraguay', 'Perú', 'Nueva Zelanda', 'Camerún', 'Ruanda', 'Kenia', 'Filipinas', 'Pakistán', 'Afganistán', 'Chipre', 'Kosovo',
      'Bielorrusia', 'Kazajistán', 'Kirguistán', 'Sri Lanka', 'Haití', 'Madagascar', 'Seychelles', 'Burundi', 'Tanzania',
      'Guinea Ecuatorial', 'Yibuti', 'Chad', 'Comoras', 'Somalia', 'Timor Oriental', 'Samoa', 'Fiyi|Fiji', 'Vanuatu',
      'Papúa Nueva Guinea', 'Tuvalu', 'Palaos|Palau', 'Islas Marshall|Marshall', 'Bosnia y Herzegovina|Bosnia'
    ]),

    O('Récords humanos', '¿Qué país tiene más husos horarios contando sus territorios de ultramar?', 'Francia', ['Rusia', 'Estados Unidos', 'China'], 'Francia tiene 12 husos horarios gracias a sus territorios repartidos por el mundo.'),
    O('Récords humanos', '¿Qué país tiene la mayor densidad de población?', 'Mónaco', ['Singapur', 'Bangladés', 'Países Bajos']),
    O('Récords humanos', '¿Qué país tiene más islas?', 'Suecia', ['Indonesia', 'Filipinas', 'Grecia'], 'Suecia tiene más de 260.000 islas, aunque la mayoría son muy pequeñas.'),
    O('Récords humanos', '¿Qué país tiene más kilómetros de costa?', 'Canadá', ['Rusia', 'Australia', 'Noruega']),
    O('Récords humanos', '¿Cuántos husos horarios oficiales tiene China?', '1', ['3', '5', '6'], 'A pesar de su tamaño, toda China usa la hora de Pekín.'),
    O('Récords humanos', '¿Qué país tiene más hablantes nativos de español?', 'México', ['España', 'Colombia', 'Argentina']),
    O('Récords humanos', '¿Qué país es el menos poblado del mundo?', 'Ciudad del Vaticano', ['Mónaco', 'Tuvalu', 'San Marino']),
    O('Récords humanos', '¿En qué país se hablan más lenguas distintas?', 'Papúa Nueva Guinea', ['India', 'Indonesia', 'Nigeria'], 'Se hablan más de 800 lenguas.'),
    O('Récords humanos', '¿Cuál es el país más poblado de África?', 'Nigeria', ['Egipto', 'Etiopía', 'Sudáfrica']),
    O('Récords humanos', '¿Cuál es el país más poblado de la Unión Europea?', 'Alemania', ['Francia', 'Italia', 'España'])
  ]
};
