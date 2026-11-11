// client/src/games/Pecera/retos.js
// Cada reto: 6 elementos; 5 cumplen un criterio oculto y uno no (intruso).
// La «trampa» es el elemento que parece sobrar a simple vista pero sí cumple el criterio.
// items: [emoji, texto]; intruso y trampa son índices dentro de items.
const BASE = [
  {
    items: [['🐋', 'Ballena'], ['🐬', 'Delfín'], ['🦈', 'Tiburón'], ['🦭', 'Foca'], ['🦇', 'Murciélago'], ['🐄', 'Vaca']],
    intruso: 2, trampa: 4,
    criterio: 'Son mamíferos.',
    porQue: 'El tiburón es un pez: respira por branquias.',
    trampaTxt: 'El murciélago vuela, pero es un mamífero.'
  },
  {
    items: [['🐧', 'Pingüino'], ['🐔', 'Gallina'], ['🦅', 'Águila'], ['🦉', 'Búho'], ['🦋', 'Mariposa'], ['🦜', 'Loro']],
    intruso: 4, trampa: 0,
    criterio: 'Son aves.',
    porQue: 'La mariposa vuela, pero es un insecto.',
    trampaTxt: 'El pingüino no vuela, pero es un ave.'
  },
  {
    items: [['', '2'], ['', '3'], ['', '5'], ['', '7'], ['', '9'], ['', '11']],
    intruso: 4, trampa: 0,
    criterio: 'Son números primos.',
    porQue: 'El 9 se puede dividir entre 3.',
    trampaTxt: 'El 2 es par, pero es primo (el único primo par).'
  },
  {
    items: [['', '4'], ['', '9'], ['', '16'], ['', '25'], ['', '36'], ['', '48']],
    intruso: 5, trampa: 1,
    criterio: 'Son cuadrados perfectos (2², 3², 4², 5², 6²).',
    porQue: '48 no es el cuadrado de ningún número entero.',
    trampaTxt: 'El 9 es impar, pero es 3 × 3.'
  },
  {
    items: [['🇪🇸', 'Madrid'], ['🇵🇹', 'Lisboa'], ['🇫🇷', 'París'], ['🇮🇹', 'Roma'], ['🇦🇺', 'Sídney'], ['🇩🇪', 'Berlín']],
    intruso: 4, trampa: null,
    criterio: 'Son capitales de su país.',
    porQue: 'La capital de Australia es Canberra, no Sídney.',
    trampaTxt: ''
  },
  {
    items: [['🐔', 'Gallina'], ['🐢', 'Tortuga'], ['🐍', 'Serpiente'], ['🐊', 'Cocodrilo'], ['🐸', 'Rana'], ['🐬', 'Delfín']],
    intruso: 5, trampa: 4,
    criterio: 'Ponen huevos.',
    porQue: 'El delfín es un mamífero: sus crías nacen vivas.',
    trampaTxt: 'La rana no es ave ni reptil, pero también pone huevos.'
  },
  {
    items: [['🎸', 'Guitarra'], ['🎻', 'Violín'], ['🎹', 'Piano'], ['🪕', 'Banjo'], ['🎺', 'Trompeta'], ['🎼', 'Arpa']],
    intruso: 4, trampa: 2,
    criterio: 'Suenan gracias a cuerdas.',
    porQue: 'La trompeta es de viento.',
    trampaTxt: 'El piano parece de teclado, pero dentro tiene cuerdas que golpean unos martillos.'
  },
  {
    items: [['📅', 'Enero'], ['📅', 'Marzo'], ['📅', 'Mayo'], ['📅', 'Julio'], ['📅', 'Agosto'], ['📅', 'Junio']],
    intruso: 5, trampa: 4,
    criterio: 'Son meses de 31 días.',
    porQue: 'Junio tiene 30 días.',
    trampaTxt: 'Agosto va detrás de julio y también tiene 31.'
  },
  {
    items: [['🌳', 'árbol'], ['🎵', 'canción'], ['✏️', 'lápiz'], ['☕', 'café'], ['🛋️', 'sofá'], ['📝', 'examen']],
    intruso: 5, trampa: null,
    criterio: 'Llevan tilde.',
    porQue: '«Examen» es llana acabada en n: no lleva tilde (aunque «exámenes» sí).',
    trampaTxt: ''
  },
  {
    items: [['🐜', 'Hormiga'], ['🐝', 'Abeja'], ['🦋', 'Mariposa'], ['🐞', 'Mariquita'], ['🕷️', 'Araña'], ['🦟', 'Mosquito']],
    intruso: 4, trampa: 2,
    criterio: 'Son insectos (6 patas).',
    porQue: 'La araña tiene 8 patas: es un arácnido.',
    trampaTxt: 'La mariposa parece muy distinta, pero es un insecto.'
  },
  {
    items: [['🌍', 'África'], ['🌏', 'Asia'], ['🌍', 'Europa'], ['🌏', 'Oceanía'], ['🧊', 'Antártida'], ['🏝️', 'Groenlandia']],
    intruso: 5, trampa: 4,
    criterio: 'Son continentes.',
    porQue: 'Groenlandia es una isla (la más grande del mundo).',
    trampaTxt: 'La Antártida está casi vacía de gente, pero es un continente.'
  },
  {
    items: [['', '12'], ['', '21'], ['', '27'], ['', '33'], ['', '42'], ['', '52']],
    intruso: 5, trampa: 3,
    criterio: 'Son múltiplos de 3.',
    porQue: '52 no es múltiplo de 3 (5 + 2 = 7).',
    trampaTxt: 'El 33 parece de la tabla del 11, pero también es 3 × 11.'
  },
  {
    items: [['🇨🇭', 'Suiza'], ['🇦🇹', 'Austria'], ['🇧🇴', 'Bolivia'], ['🇵🇾', 'Paraguay'], ['🇭🇺', 'Hungría'], ['🇺🇾', 'Uruguay']],
    intruso: 5, trampa: 2,
    criterio: 'No tienen salida al mar.',
    porQue: 'Uruguay tiene costa en el Atlántico.',
    trampaTxt: 'Bolivia tuvo costa hace mucho, pero hoy no tiene salida al mar.'
  },
  {
    items: [['⚽', 'Fútbol'], ['🎾', 'Tenis'], ['🏀', 'Baloncesto'], ['🎳', 'Bolos'], ['⛳', 'Golf'], ['🏒', 'Hockey sobre hielo']],
    intruso: 5, trampa: 3,
    criterio: 'Se juegan con pelota o bola.',
    porQue: 'En el hockey sobre hielo se usa un disco.',
    trampaTxt: 'En los bolos no hay porterías, pero sí una bola.'
  },
  {
    items: [['🔩', 'Hierro'], ['🥇', 'Oro'], ['🥈', 'Plata'], ['🟠', 'Cobre'], ['🌡️', 'Mercurio'], ['✏️', 'Carbono']],
    intruso: 5, trampa: 4,
    criterio: 'Son metales.',
    porQue: 'El carbono no es un metal (es el del grafito de los lápices).',
    trampaTxt: 'El mercurio es líquido, pero es un metal.'
  },
  {
    items: [['🐺', 'Lobo'], ['🦁', 'León'], ['🐯', 'Tigre'], ['🐻‍❄️', 'Oso polar'], ['🐼', 'Panda'], ['🦅', 'Águila']],
    intruso: 4, trampa: 5,
    criterio: 'Se alimentan sobre todo de carne.',
    porQue: 'El panda come casi solo bambú.',
    trampaTxt: 'El águila no es un mamífero, pero es carnívora.'
  },
  {
    items: [['🐻', 'oso'], ['👧', 'Ana'], ['📡', 'radar'], ['🤔', 'reconocer'], ['🏛️', 'salas'], ['🐕', 'perro']],
    intruso: 5, trampa: 3,
    criterio: 'Se leen igual al derecho y al revés (palíndromos).',
    porQue: '«Perro» al revés es «orrep».',
    trampaTxt: '«Reconocer» es larga, pero también es un palíndromo.'
  },
  {
    items: [['🔺', 'Triángulo'], ['🟥', 'Cuadrado'], ['🔷', 'Rombo'], ['⬢', 'Hexágono'], ['⬟', 'Pentágono'], ['⚪', 'Círculo']],
    intruso: 5, trampa: 2,
    criterio: 'Tienen lados rectos (son polígonos).',
    porQue: 'El círculo no tiene lados.',
    trampaTxt: 'El rombo está «inclinado», pero tiene 4 lados rectos.'
  },
  {
    items: [['🔴', 'Rojo'], ['🟠', 'Naranja'], ['🟡', 'Amarillo'], ['🟢', 'Verde'], ['🔵', 'Azul'], ['🩷', 'Rosa']],
    intruso: 5, trampa: 1,
    criterio: 'Son colores del arcoíris.',
    porQue: 'El rosa no aparece en el arcoíris.',
    trampaTxt: 'El naranja sí está en el arcoíris, entre el rojo y el amarillo.'
  },
  {
    items: [['🐍', 'Serpiente'], ['🐢', 'Tortuga'], ['🐊', 'Cocodrilo'], ['🦎', 'Lagarto'], ['🐸', 'Rana'], ['🦖', 'Tiranosaurio']],
    intruso: 4, trampa: 1,
    criterio: 'Son reptiles.',
    porQue: 'La rana es un anfibio.',
    trampaTxt: 'La tortuga lleva caparazón, pero es un reptil.'
  },
  {
    items: [['🦴', 'Fémur'], ['🦴', 'Tibia'], ['🦴', 'Peroné'], ['🦴', 'Húmero'], ['📻', 'Radio'], ['💪', 'Bíceps']],
    intruso: 5, trampa: 4,
    criterio: 'Son huesos del cuerpo.',
    porQue: 'El bíceps es un músculo.',
    trampaTxt: 'El radio no es solo un aparato: es un hueso del antebrazo.'
  },
  {
    items: [['🇪🇸', 'Español'], ['🇫🇷', 'Francés'], ['🇮🇹', 'Italiano'], ['🇵🇹', 'Portugués'], ['🇷🇴', 'Rumano'], ['🇬🇧', 'Inglés']],
    intruso: 5, trampa: 4,
    criterio: 'Son lenguas que vienen del latín.',
    porQue: 'El inglés es una lengua germánica.',
    trampaTxt: 'El rumano se habla lejos, en el este de Europa, pero viene del latín.'
  },
  {
    items: [['🐩', 'Caniche'], ['🐶', 'Bulldog'], ['🐕', 'Chihuahua'], ['🐾', 'Dálmata'], ['🐕‍🦺', 'Beagle'], ['🐈', 'Siamés']],
    intruso: 5, trampa: 2,
    criterio: 'Son razas de perro.',
    porQue: 'El siamés es una raza de gato.',
    trampaTxt: 'Chihuahua también es un estado de México, pero aquí es la raza de perro.'
  },
  {
    items: [['🍅', 'Tomate'], ['🥒', 'Pepino'], ['🎃', 'Calabaza'], ['🫑', 'Pimiento'], ['🍆', 'Berenjena'], ['🥕', 'Zanahoria']],
    intruso: 5, trampa: 0,
    criterio: 'Para la botánica son frutos: tienen semillas dentro.',
    porQue: 'La zanahoria es una raíz.',
    trampaTxt: 'El tomate encaja: como los demás, es un fruto con semillas.'
  },
  {
    items: [['🍋', 'Limón'], ['🍊', 'Naranja'], ['🍊', 'Mandarina'], ['🟢', 'Lima'], ['🍈', 'Pomelo'], ['🥝', 'Kiwi']],
    intruso: 5, trampa: 3,
    criterio: 'Son cítricos.',
    porQue: 'El kiwi no es un cítrico, aunque sea ácido.',
    trampaTxt: 'La lima es verde, pero es un cítrico como el limón.'
  },
  {
    items: [['♚', 'Rey'], ['♛', 'Dama'], ['♜', 'Torre'], ['♝', 'Alfil'], ['♞', 'Caballo'], ['🃏', 'Comodín']],
    intruso: 5, trampa: 4,
    criterio: 'Son piezas de ajedrez.',
    porQue: 'El comodín es de la baraja de cartas.',
    trampaTxt: 'El caballo es un animal, pero también una pieza de ajedrez.'
  },
  {
    items: [['🎈', 'Helio'], ['💡', 'Neón'], ['🧪', 'Argón'], ['🦸', 'Kriptón'], ['⚗️', 'Xenón'], ['💧', 'Hidrógeno']],
    intruso: 5, trampa: 3,
    criterio: 'Son gases nobles.',
    porQue: 'El hidrógeno reacciona con facilidad: no es un gas noble.',
    trampaTxt: 'El kriptón suena a superhéroe, pero es un gas noble de verdad.'
  },
  {
    items: [['🪐', 'Mercurio'], ['🪐', 'Venus'], ['🌍', 'Tierra'], ['🔴', 'Marte'], ['🪐', 'Júpiter'], ['🌑', 'Luna']],
    intruso: 5, trampa: 0,
    criterio: 'Son planetas del sistema solar.',
    porQue: 'La Luna es un satélite de la Tierra.',
    trampaTxt: 'Mercurio también es un metal, pero aquí es el planeta más cercano al Sol.'
  },
  {
    items: [['🐳', 'Ballena azul'], ['🐘', 'Elefante'], ['🦒', 'Jirafa'], ['🦛', 'Hipopótamo'], ['🦏', 'Rinoceronte'], ['🦖', 'Tiranosaurio']],
    intruso: 5, trampa: 0,
    criterio: 'Son animales que viven hoy en día.',
    porQue: 'El tiranosaurio se extinguió hace 66 millones de años.',
    trampaTxt: 'La ballena azul es enorme, pero sigue viva en los océanos.'
  },
  {
    items: [['🟦', 'Atlántico'], ['🟦', 'Pacífico'], ['🟦', 'Índico'], ['🧊', 'Ártico'], ['🧊', 'Antártico'], ['🟦', 'Mediterráneo']],
    intruso: 5, trampa: 3,
    criterio: 'Son océanos.',
    porQue: 'El Mediterráneo es un mar.',
    trampaTxt: 'El Ártico está casi helado, pero es un océano.'
  },
  {
    items: [['🥛', 'Leche'], ['🧀', 'Queso'], ['🍦', 'Helado'], ['🧈', 'Mantequilla'], ['🥣', 'Yogur'], ['🥚', 'Huevo']],
    intruso: 5, trampa: 2,
    criterio: 'Son lácteos (se hacen con leche).',
    porQue: 'El huevo no viene de la leche, aunque se venda cerca en el súper.',
    trampaTxt: 'El helado es un postre, pero se hace con leche.'
  }
];

import EXTRA from './retosExtra.js';
import EXTRA2 from './retosExtra2.js';

export default [...BASE, ...EXTRA, ...EXTRA2];
