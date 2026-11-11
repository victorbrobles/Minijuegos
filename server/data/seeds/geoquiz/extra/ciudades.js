// GeoQuiz · Ciudades (ampliación)
import { R, O, E, P } from '../_tipos.js';

const monu = (m, c) => R('Monumentos y ciudades', `¿En qué ciudad está ${m}?`, c);
const gent = (g, c) => R('Gentilicios', `¿De qué ciudad es un «${g}»?`, c);
const norte = (a, b, dato) => O('Norte o sur', '¿Qué ciudad está más al norte?', a, [b], dato);
const sur = (a, b, dato) => O('Norte o sur', '¿Qué ciudad está más al sur?', a, [b], dato);
const capDe = (ciudad, pais, otras) => O('Capitales del mundo', `¿De qué país es capital ${ciudad}?`, pais, otras);

export default [
  monu('el Big Ben', 'Londres'), monu('la Puerta de Brandeburgo', 'Berlín'), monu('el Coliseo', 'Roma'), monu('la Sagrada Familia', 'Barcelona'),
  monu('la Torre de Belém', 'Lisboa'), monu('el Atomium', 'Bruselas'), monu('el puente Golden Gate', 'San Francisco'), monu('la Ciudad Prohibida', 'Pekín|Beijing'),
  monu('las Torres Petronas', 'Kuala Lumpur'), monu('el Burj Khalifa', 'Dubái|Dubai'), monu('Santa Sofía', 'Estambul|Istanbul'), monu('el Partenón', 'Atenas'),
  monu('la Torre CN', 'Toronto'), monu('el puente de Carlos', 'Praga'), monu('la Sirenita', 'Copenhague'), monu('la pirámide del Louvre', 'París'),
  monu('el Duomo de Santa María del Fiore', 'Florencia'), monu('la plaza de San Marcos', 'Venecia'), monu('la Torre del Oro', 'Sevilla'), monu('la Torre de Hércules', 'A Coruña|La Coruña|Coruña'),
  monu('el acueducto romano más famoso de España', 'Segovia'), monu('la Ciudad de las Artes y las Ciencias', 'Valencia'), monu('el Museo Guggenheim', 'Bilbao'), monu('la basílica del Pilar', 'Zaragoza'),
  monu('la Casa de las Conchas', 'Salamanca'), monu('la playa de La Concha', 'San Sebastián|Donostia'), monu('la catedral gótica junto al río Arlanzón donde está enterrado el Cid', 'Burgos'), monu('la Puerta de Alcalá', 'Madrid'),
  monu('el Templo de Debod', 'Madrid'), monu('la Mezquita Azul', 'Estambul|Istanbul'), monu('el Muro de las Lamentaciones', 'Jerusalén'), monu('la Ópera más famosa de Australia', 'Sídney|Sydney'),
  gent('gaditano', 'Cádiz'), gent('onubense', 'Huelva'), gent('abulense', 'Ávila'), gent('oscense', 'Huesca'), gent('conquense', 'Cuenca'),
  gent('salmantino', 'Salamanca'), gent('pacense', 'Badajoz'), gent('emeritense', 'Mérida'), gent('tarraconense', 'Tarragona'), gent('hispalense', 'Sevilla'),
  gent('complutense', 'Alcalá de Henares'), gent('londinense', 'Londres'), gent('neoyorquino', 'Nueva York'), gent('moscovita', 'Moscú'), gent('vienés', 'Viena'),
  gent('bogotano', 'Bogotá'), gent('regiomontano', 'Monterrey'), gent('tapatío', 'Guadalajara'), gent('carioca', 'Río de Janeiro|Rio'), gent('quiteño', 'Quito'),
  gent('paceño', 'La Paz'), gent('montevideano', 'Montevideo'), gent('florentino', 'Florencia'), gent('lisboeta', 'Lisboa'), gent('ateniense', 'Atenas'),
  norte('Roma', 'Barcelona', 'Roma está a 41,9º N y Barcelona a 41,4º N.'), norte('Montreal', 'Venecia', 'Montreal está a 45,5º N y Venecia a 45,4º N.'),
  norte('Florencia', 'Toronto', 'Florencia está a 43,8º N y Toronto a 43,7º N.'), norte('Berlín', 'Londres', 'Berlín está a 52,5º N y Londres a 51,5º N.'),
  norte('Dublín', 'Ámsterdam', 'Dublín está a 53,3º N y Ámsterdam a 52,4º N.'), norte('Washington', 'Lisboa', 'Washington está a 38,9º N y Lisboa a 38,7º N.'),
  norte('Atenas', 'Sevilla', 'Atenas está a 38,0º N y Sevilla a 37,4º N.'), norte('Pekín', 'Valencia', 'Pekín está a 39,9º N y Valencia a 39,5º N.'),
  norte('Málaga', 'Tokio', 'Málaga está a 36,7º N y Tokio a 35,7º N.'), norte('Edimburgo', 'Moscú', 'Edimburgo está a 55,95º N y Moscú a 55,75º N.'),
  norte('Helsinki', 'Oslo', 'Helsinki está a 60,2º N y Oslo a 59,9º N.'), norte('Toronto', 'Bilbao', 'Toronto está a 43,7º N y Bilbao a 43,3º N.'),
  norte('Las Palmas de Gran Canaria', 'Miami', 'Las Palmas está a 28,1º N y Miami a 25,8º N.'), norte('La Habana', 'Ciudad de México', 'La Habana está a 23,1º N y Ciudad de México a 19,4º N.'),
  sur('Buenos Aires', 'Sídney', 'Buenos Aires está a 34,6º S y Sídney a 33,9º S.'), sur('Ciudad del Cabo', 'Santiago de Chile', 'Ciudad del Cabo está a 33,9º S y Santiago a 33,4º S.'),
  sur('Wellington', 'Melbourne', 'Wellington está a 41,3º S y Melbourne a 37,8º S.'),
  capDe('Canberra', 'Australia', ['Nueva Zelanda', 'Canadá', 'Sudáfrica']), capDe('Bratislava', 'Eslovaquia', ['Eslovenia', 'República Checa', 'Croacia']),
  capDe('Liubliana', 'Eslovenia', ['Eslovaquia', 'Croacia', 'Serbia']), capDe('Tiflis', 'Georgia', ['Armenia', 'Azerbaiyán', 'Turquía']),
  capDe('Montevideo', 'Uruguay', ['Paraguay', 'Argentina', 'Chile']), capDe('Asunción', 'Paraguay', ['Uruguay', 'Bolivia', 'Ecuador']),
  capDe('Managua', 'Nicaragua', ['Honduras', 'Guatemala', 'El Salvador']), capDe('Tegucigalpa', 'Honduras', ['Nicaragua', 'Guatemala', 'Costa Rica']),
  capDe('Hanói', 'Vietnam', ['Laos', 'Camboya', 'Tailandia']), capDe('Nom Pen', 'Camboya', ['Laos', 'Vietnam', 'Myanmar']),
  capDe('Windhoek', 'Namibia', ['Botsuana', 'Zambia', 'Angola']), capDe('Bamako', 'Malí', ['Níger', 'Senegal', 'Burkina Faso']),
  R('Ciudades singulares', '¿Qué ciudad italiana está construida sobre más de cien islas y canales?', 'Venecia'),
  R('Ciudades singulares', '¿Qué ciudad es a la vez un país dentro de Roma?', 'El Vaticano|Vaticano|Ciudad del Vaticano'),
  R('Ciudades singulares', '¿Qué capital sudamericana es la más alta del mundo (sede de Gobierno)?', 'La Paz'),
  R('Ciudades singulares', '¿Qué ciudad española es famosa por sus casas colgadas sobre la hoz del Huécar?', 'Cuenca'),
  R('Ciudades singulares', '¿Qué ciudad brasileña fue construida desde cero para ser capital en 1960?', 'Brasilia'),
  R('Ciudades singulares', '¿Qué ciudad de Estados Unidos es conocida como «la Gran Manzana»?', 'Nueva York'),
  R('Ciudades singulares', '¿Qué ciudad francesa acoge el Parlamento Europeo?', 'Estrasburgo'),
  R('Ciudades singulares', '¿Qué ciudad es conocida como «la ciudad de las tres culturas» en España?', 'Toledo'),
  E('Capitales por inicial', 'Capitales del mundo que empiezan por B', ['Berlín', 'Bruselas', 'Berna', 'Belgrado', 'Bratislava', 'Budapest', 'Bucarest', 'Bogotá', 'Buenos Aires', 'Brasilia', 'Bangkok', 'Bagdad', 'Beirut', 'Bakú', 'Bamako', 'Bangui', 'Bisáu', 'Bridgetown', 'Bandar Seri Begawan', 'Bujumbura', 'Basseterre', 'Belmopán']),
  E('Capitales por inicial', 'Capitales del mundo que empiezan por M', ['Madrid', 'Moscú', 'Minsk', 'Mónaco', 'Montevideo', 'Managua', 'Manila', 'Mascate', 'Maputo', 'Malabo', 'Malé', 'Mogadiscio', 'Monrovia', 'Maseru', 'Majuro', 'Mbabane', 'Moroni', 'Ciudad de México|México']),
  P('Ciudad por pistas', ['Es la antigua capital imperial de Japón.', 'Tiene más de mil templos.', 'Allí está el santuario de Fushimi Inari.', 'Es famosa por las geishas del barrio de Gion.', 'Su nombre se parece a Tokio con las sílabas al revés.'], 'Kioto|Kyoto'),
  P('Ciudad por pistas', ['Fue capital de Rusia durante dos siglos.', 'La fundó Pedro el Grande.', 'Tiene el museo del Hermitage.', 'Se llamó Leningrado.', 'Allí hay «noches blancas» en verano.'], 'San Petersburgo'),
  P('Ciudad por pistas', ['Está en Marruecos.', 'La llaman «la ciudad roja».', 'Tiene la plaza de Yamaa el Fna.', 'No es la capital del país.', 'Sus zocos son famosos en todo el mundo.'], 'Marrakech|Marrakesh'),
  P('Ciudad por pistas', ['Está en Estados Unidos.', 'Es la cuna del jazz.', 'La golpeó el huracán Katrina.', 'Celebra el Mardi Gras.', 'Tiene un Barrio Francés.'], 'Nueva Orleans'),
  P('Ciudad por pistas', ['Está en Escocia.', 'Tiene un castillo sobre un volcán apagado.', 'Celebra el mayor festival de artes del mundo.', 'Es la capital escocesa.', 'Su calle principal es la Royal Mile.'], 'Edimburgo'),
  P('Ciudad por pistas', ['Está en España.', 'Tiene una catedral que antes fue mezquita.', 'Fue capital del califato.', 'Es famosa por sus patios en mayo.', 'Está a orillas del Guadalquivir.'], 'Córdoba')
];
