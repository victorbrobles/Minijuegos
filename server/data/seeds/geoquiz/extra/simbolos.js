// GeoQuiz · Banderas y símbolos (ampliación)
import { R, O } from '../_tipos.js';

const band = (desc, pais, otras) => O('Banderas', `¿Qué país tiene ${desc}?`, pais, otras);
const mon = (pais, moneda) => R('Monedas', `¿Cuál es la moneda de ${pais}?`, moneda);
const gent = (g, pais) => R('Gentilicios', `¿De qué país es alguien «${g}»?`, pais);
const dom = (d, pais) => R('Dominios de Internet', `¿De qué país es el dominio «${d}»?`, pais);
const pref = (p, pais) => R('Prefijos telefónicos', `¿De qué país es el prefijo telefónico ${p}?`, pais);
const mat = (m, pais) => R('Matrículas internacionales', `¿Qué país usa el código de matrícula «${m}»?`, pais);

export default [
  band('una bandera con un dragón rojo sobre blanco y verde', 'Gales', ['Bután', 'Malta', 'Escocia']),
  band('un dragón blanco en su bandera amarilla y naranja', 'Bután', ['Gales', 'Nepal', 'Sri Lanka']),
  band('la única bandera nacional que no es rectangular', 'Nepal', ['Suiza', 'Vaticano', 'Bután']),
  band('una bandera con un águila devorando una serpiente sobre un nopal', 'México', ['Albania', 'Egipto', 'Bolivia']),
  band('una bandera con un águila bicéfala negra sobre fondo rojo', 'Albania', ['Montenegro', 'Serbia', 'Rusia']),
  band('una bandera azul con la Cruz del Sur y la bandera británica', 'Australia', ['Nueva Zelanda', 'Fiyi', 'Tuvalu']),
  band('una bandera con un sol de mayo en la franja blanca central, entre dos celestes', 'Argentina', ['Uruguay', 'Guatemala', 'El Salvador']),
  band('una bandera con franjas blancas y azules y un sol en la esquina', 'Uruguay', ['Argentina', 'Grecia', 'Kiribati']),
  band('una bandera verde con un rombo amarillo y un globo azul', 'Brasil', ['Portugal', 'Jamaica', 'Gabón']),
  band('una bandera con una cruz amarilla en diagonal sobre verde y negro', 'Jamaica', ['Sudáfrica', 'Tanzania', 'Brasil']),
  band('una bandera con una estrella de David azul', 'Israel', ['Grecia', 'Finlandia', 'Somalia']),
  band('una bandera con un escudo con una llave, en amarillo y blanco', 'Vaticano', ['San Marino', 'Malta', 'Mónaco']),
  band('una bandera roja con una luna creciente y una estrella blancas', 'Turquía', ['Túnez', 'Argelia', 'Pakistán']),
  band('una bandera verde con una luna creciente y una estrella, con una franja blanca a la izquierda', 'Pakistán', ['Argelia', 'Turquía', 'Mauritania']),
  band('una bandera con un círculo amarillo sobre fondo azul claro (la luna)', 'Palaos', ['Japón', 'Bangladés', 'Laos']),
  band('una bandera verde con un círculo rojo', 'Bangladés', ['Japón', 'Palaos', 'Maldivas']),
  band('un fusil AK-47 en su bandera', 'Mozambique', ['Angola', 'Zimbabue', 'Kenia']),
  band('una bandera con un machete y una rueda dentada', 'Angola', ['Mozambique', 'Kenia', 'Zambia']),
  band('una bandera con un escudo masái y dos lanzas', 'Kenia', ['Uganda', 'Tanzania', 'Etiopía']),
  band('una bandera con una grulla coronada', 'Uganda', ['Kenia', 'Zambia', 'Ruanda']),
  band('una bandera con las franjas tricolor rojo, blanco y verde en vertical', 'Italia', ['México', 'Irlanda', 'Hungría']),
  band('una bandera tricolor vertical verde, blanco y naranja', 'Irlanda', ['Costa de Marfil', 'India', 'Italia']),
  band('una bandera tricolor vertical naranja, blanco y verde', 'Costa de Marfil', ['Irlanda', 'Níger', 'India']),
  band('una bandera con la rueda de Ashoka en el centro', 'India', ['Níger', 'Sri Lanka', 'Bangladés']),
  band('un león con una espada en su bandera', 'Sri Lanka', ['India', 'Bután', 'Irán']),
  band('una bandera con un árbol de cedro', 'Líbano', ['Canadá', 'Israel', 'Chipre']),
  band('una bandera con el mapa del país en color cobre', 'Chipre', ['Kosovo', 'Malta', 'Grecia']),
  mon('Japón', 'Yen'), mon('China', 'Yuan|Renminbi'), mon('India', 'Rupia'), mon('Rusia', 'Rublo'), mon('Suiza', 'Franco suizo|Franco'),
  mon('Reino Unido', 'Libra esterlina|Libra'), mon('Suecia', 'Corona sueca|Corona'), mon('Brasil', 'Real'), mon('México', 'Peso mexicano|Peso'),
  mon('Turquía', 'Lira turca|Lira'), mon('Polonia', 'Esloti|Zloty'), mon('Corea del Sur', 'Won'), mon('Sudáfrica', 'Rand'),
  mon('Israel', 'Séquel|Shekel|Nuevo séquel'), mon('Tailandia', 'Baht'), mon('Perú', 'Sol'), mon('Guatemala', 'Quetzal'), mon('Venezuela', 'Bolívar'),
  gent('neozelandés', 'Nueva Zelanda'), gent('malgache', 'Madagascar'), gent('monegasco', 'Mónaco'), gent('salvadoreño', 'El Salvador'),
  gent('costarricense', 'Costa Rica'), gent('nicaragüense', 'Nicaragua'), gent('guineano o ecuatoguineano', 'Guinea Ecuatorial'), gent('chipriota', 'Chipre'),
  gent('maltés', 'Malta'), gent('islandés', 'Islandia'), gent('luxemburgués', 'Luxemburgo'), gent('etíope', 'Etiopía'),
  gent('beliceño', 'Belice'), gent('nepalí', 'Nepal'), gent('saudí', 'Arabia Saudí'), gent('omaní', 'Omán'),
  dom('.es', 'España'), dom('.fr', 'Francia'), dom('.de', 'Alemania'), dom('.it', 'Italia'), dom('.pt', 'Portugal'),
  dom('.uk', 'Reino Unido'), dom('.ch', 'Suiza'), dom('.mx', 'México'), dom('.ar', 'Argentina'), dom('.jp', 'Japón'),
  dom('.cn', 'China'), dom('.br', 'Brasil'), dom('.tv', 'Tuvalu'), dom('.ad', 'Andorra'), dom('.at', 'Austria'),
  pref('+34', 'España'), pref('+33', 'Francia'), pref('+39', 'Italia'), pref('+351', 'Portugal'), pref('+44', 'Reino Unido'),
  pref('+49', 'Alemania'), pref('+52', 'México'), pref('+54', 'Argentina'), pref('+81', 'Japón'), pref('+86', 'China'),
  mat('E', 'España'), mat('F', 'Francia'), mat('D', 'Alemania'), mat('I', 'Italia'), mat('CH', 'Suiza'), mat('NL', 'Países Bajos|Holanda'),
  mat('GB', 'Reino Unido'), mat('IRL', 'Irlanda'), mat('P', 'Portugal'), mat('A', 'Austria')
];
