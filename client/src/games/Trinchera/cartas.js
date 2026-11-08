// client/src/games/Trinchera/cartas.js
// Cartas de «Trinchera 1914». Cada día llega una situación con dos decisiones.
// Efectos: m = moral, c = comida, u = munición, s = salud (de 0 a 10).
// requiere / activa: marcas para encadenar historias (p. ej. adoptar al perro).

export const RECURSOS = [
  { id: 'm', nombre: 'Moral', emoji: '🎖️' },
  { id: 'c', nombre: 'Comida', emoji: '🥫' },
  { id: 'u', nombre: 'Munición', emoji: '💥' },
  { id: 's', nombre: 'Salud', emoji: '🩹' }
];

export const FINALES = {
  m: { titulo: 'La compañía se rinde', texto: 'Sin esperanza, tus hombres dejan de obedecer. Una mañana la trinchera amanece vacía.' },
  c: { titulo: 'El hambre gana la guerra', texto: 'Sin comida, nadie aguanta el frío. Tenéis que abandonar la posición.' },
  u: { titulo: 'Sin balas', texto: 'Un ataque os encuentra sin munición. La trinchera cae.' },
  s: { titulo: 'La enfermedad', texto: 'El barro, el frío y las heridas acaban con la compañía antes que el enemigo.' }
};

export default [
  {
    quien: '🧑‍🍳 El cocinero', texto: 'Las ratas se han metido en el almacén. Podemos salvar parte de la comida si la repartimos hoy mismo.',
    a: { texto: 'Repartirla ya', ef: { c: -1, m: 1 } },
    b: { texto: 'Cazar las ratas', ef: { c: -2, s: -1 } }
  },
  {
    quien: '🪖 Soldado Martín', texto: 'Un soldado enemigo herido grita en tierra de nadie desde hace horas. Martín quiere ir a por él.',
    a: { texto: 'Dejarle ir', ef: { m: 2, s: -1, u: -1 }, activa: 'herido' },
    b: { texto: 'Prohibirlo', ef: { m: -2 } }
  },
  {
    quien: '📮 El cartero', texto: 'Ha llegado el correo, pero el camino está bajo fuego. ¿Mandamos a alguien a por él?',
    a: { texto: 'Ir a por las cartas', ef: { m: 2, s: -1 } },
    b: { texto: 'Esperar a mañana', ef: { m: -1 } }
  },
  {
    quien: '🎖️ El capitán', texto: 'El Estado Mayor ordena un ataque de prueba al amanecer para medir las defensas enemigas.',
    a: { texto: 'Obedecer', ef: { u: -2, s: -2, m: -1 } },
    b: { texto: 'Fingir que se hizo', ef: { m: 1, u: -1 } }
  },
  {
    quien: '🐕 Un perro', texto: 'Un perro flaco ha aparecido en la trinchera. Los soldados ya le han puesto nombre: Galleta.',
    a: { texto: 'Adoptarlo', ef: { m: 2, c: -1 }, activa: 'perro' },
    b: { texto: 'Echarlo', ef: { m: -1 } }
  },
  {
    quien: '🐕 Galleta', texto: 'Galleta ha olido algo extraño y no para de ladrar hacia el sur. Puede ser gas.',
    requiere: 'perro',
    a: { texto: 'Poneos las máscaras', ef: { s: 1, m: 1 } },
    b: { texto: 'Hacer callar al perro', ef: { s: -3 } }
  },
  {
    quien: '🩺 El médico', texto: 'Hay casos de «pie de trinchera». Necesito calcetines secos y grasa de ballena.',
    a: { texto: 'Usar las provisiones', ef: { c: -1, s: 2 } },
    b: { texto: 'Que aguanten', ef: { s: -2, m: -1 } }
  },
  {
    quien: '🔧 El sargento', texto: 'La lluvia ha derrumbado un tramo de trinchera. Repararlo nos tendrá toda la noche en pie.',
    a: { texto: 'Repararlo', ef: { s: -1, m: -1, u: 1 } },
    b: { texto: 'Dejarlo así', ef: { u: -1, s: -1 } }
  },
  {
    quien: '🕵️ Un desertor', texto: 'Hemos atrapado a un chico de tu compañía intentando huir. Está temblando.',
    a: { texto: 'Perdonarlo en secreto', ef: { m: 1 } },
    b: { texto: 'Entregarlo', ef: { m: -2, u: 1 } }
  },
  {
    quien: '🚛 El intendente', texto: 'Puedo cambiarte munición por latas de carne. Es un trato justo.',
    a: { texto: 'Cambiar munición por comida', ef: { u: -2, c: 2 } },
    b: { texto: 'Cambiar comida por munición', ef: { c: -2, u: 2 } }
  },
  {
    quien: '🎻 Soldado Iván', texto: 'Iván ha encontrado un violín en una granja abandonada. Quiere tocar esta noche.',
    a: { texto: '¡Que toque!', ef: { m: 2, u: -1 } },
    b: { texto: 'Silencio, nos oirán', ef: { m: -1 } }
  },
  {
    quien: '🌧️ La lluvia', texto: 'Lleva tres días lloviendo. El agua os llega a las rodillas.',
    a: { texto: 'Achicar agua sin parar', ef: { s: 1, m: -1 } },
    b: { texto: 'Subir a la parte seca', ef: { s: -1, u: -1 } }
  },
  {
    quien: '📰 Un periodista', texto: 'Un periodista quiere fotos de la trinchera para los periódicos de casa.',
    a: { texto: 'Mostrar la verdad', ef: { m: -1, c: 1 } },
    b: { texto: 'Preparar una foto bonita', ef: { m: 1 } }
  },
  {
    quien: '🧓 Un granjero', texto: 'Un viejo granjero de la zona ofrece patatas a cambio de que no le requisemos la vaca.',
    a: { texto: 'Aceptar las patatas', ef: { c: 1, m: 1 } },
    b: { texto: 'Requisar la vaca', ef: { c: 3, m: -2 } }
  },
  {
    quien: '💣 El zapador', texto: 'Hemos encontrado un proyectil sin explotar junto al refugio.',
    a: { texto: 'Desactivarlo', ef: { u: 1, s: -1 } },
    b: { texto: 'Evacuar el refugio', ef: { s: -1, m: -1 } }
  },
  {
    quien: '🎖️ El capitán', texto: 'Hay una medalla para repartir. ¿Para el que más ha luchado o para el que más ha ayudado?',
    a: { texto: 'Al más valiente', ef: { u: 1, m: 1 } },
    b: { texto: 'Al que más ayudó', ef: { m: 2, s: 1, u: -1 } }
  },
  {
    quien: '🔭 El vigía', texto: 'Hay movimiento al otro lado. Podría ser un relevo… o un ataque.',
    a: { texto: 'Disparar por si acaso', ef: { u: -2, m: 1 } },
    b: { texto: 'Esperar y observar', ef: { s: -1 } }
  },
  {
    quien: '🧑‍🍳 El cocinero', texto: 'Queda poco café. ¿Lo guardo para los centinelas de noche o lo reparto en el desayuno?',
    a: { texto: 'Para los centinelas', ef: { u: 1 } },
    b: { texto: 'Para todos', ef: { m: 1, c: -1 } }
  },
  {
    quien: '✉️ Una carta', texto: 'Al soldado Pérez le ha llegado la noticia de que ha nacido su hija. Pide permiso para ir a verla.',
    a: { texto: 'Concederle permiso', ef: { m: 2, s: -1 } },
    b: { texto: 'Denegarlo', ef: { m: -2 } }
  },
  {
    quien: '🪖 Soldado Martín', texto: 'Martín ha traído al alemán herido. Se llama Klaus y tiene 17 años. ¿Qué hacemos con él?',
    requiere: 'herido',
    a: { texto: 'Curarlo', ef: { s: -1, m: 1 }, activa: 'klaus' },
    b: { texto: 'Mandarlo a retaguardia', ef: { m: -1, u: 1 } }
  },
  {
    quien: '🧑 Klaus', texto: 'Klaus, ya recuperado, os cuenta en un mal español dónde guardan su munición los suyos.',
    requiere: 'klaus',
    a: { texto: 'Hacer una incursión', ef: { u: 3, s: -2 } },
    b: { texto: 'No queremos más muertes', ef: { m: 2 } }
  },
  {
    quien: '🐀 Las ratas', texto: 'Las ratas son tan grandes como gatos. Proponen un concurso de caza de ratas.',
    a: { texto: '¡Concurso!', ef: { m: 1, s: 1, u: -1 } },
    b: { texto: 'Veneno', ef: { c: -1, s: 1 } }
  },
  {
    quien: '🥶 El frío', texto: 'Esta noche helará. Podemos quemar las cajas de munición vacías… y algunas llenas.',
    a: { texto: 'Quemar solo las vacías', ef: { s: -1 } },
    b: { texto: 'Quemar lo necesario', ef: { u: -2, s: 2, m: 1 } }
  },
  {
    quien: '🎖️ El coronel', texto: 'Viene el coronel de inspección. Quiere ver la trinchera impecable.',
    a: { texto: 'Limpiar toda la noche', ef: { s: -1, c: 1, m: -1 } },
    b: { texto: 'Recibirle tal cual', ef: { m: 1, u: -1 } }
  },
  {
    quien: '🃏 Soldado Rubio', texto: 'Rubio está ganando a las cartas las raciones de los demás. Hay tensión.',
    a: { texto: 'Prohibir las apuestas', ef: { m: -1, c: 1 } },
    b: { texto: 'No meterse', ef: { m: -1, s: -1 } }
  },
  {
    quien: '📦 Un paquete', texto: 'Ha llegado un paquete de la Cruz Roja: vendas o chocolate, solo cabe uno en el siguiente envío.',
    a: { texto: 'Vendas', ef: { s: 2 } },
    b: { texto: 'Chocolate', ef: { m: 1, c: 1 } }
  },
  {
    quien: '🌫️ La niebla', texto: 'Una niebla espesa cubre tierra de nadie. Sería perfecta para reparar las alambradas.',
    a: { texto: 'Salir a repararlas', ef: { u: 1, s: -1 } },
    b: { texto: 'Aprovechar para dormir', ef: { s: 1, m: 1, u: -1 } }
  },
  {
    quien: '🪖 Un recluta', texto: 'Ha llegado un recluta nuevo que nunca ha disparado un fusil.',
    a: { texto: 'Entrenarle con munición real', ef: { u: -1, m: 1 } },
    b: { texto: 'Mandarle a la cocina', ef: { c: 1 } }
  },
  {
    quien: '🕯️ El capellán', texto: 'El capellán quiere celebrar una misa al aire libre. Sería un blanco fácil.',
    a: { texto: 'Celebrarla', ef: { m: 2, s: -1 } },
    b: { texto: 'Hacerla en el refugio', ef: { m: 1 } }
  },
  {
    quien: '📻 El telegrafista', texto: 'Se rumorea que la guerra acabará antes de Navidad. ¿Lo confirmamos a los hombres?',
    a: { texto: 'Darles esperanza', ef: { m: 2 }, activa: 'rumor' },
    b: { texto: 'Ser sinceros', ef: { m: -1, u: 1 } }
  },
  {
    quien: '📻 El telegrafista', texto: 'Los hombres se han dado cuenta de que el rumor era falso. Están furiosos.',
    requiere: 'rumor',
    a: { texto: 'Pedir perdón', ef: { m: -1 } },
    b: { texto: 'Culpar al Estado Mayor', ef: { m: -2, u: 1 } }
  },
  {
    quien: '🍲 El cocinero', texto: 'Puedo hacer un guiso con lo que queda, pero tendré que encender fuego y se verá el humo.',
    a: { texto: 'Guiso caliente', ef: { m: 1, s: 1, u: -1 } },
    b: { texto: 'Comida fría', ef: { m: -1 } }
  },
  {
    quien: '🔫 El armero', texto: 'Muchos fusiles se encasquillan por el barro. Puedo limpiarlos usando el aceite de las lámparas.',
    a: { texto: 'Limpiar los fusiles', ef: { u: 2, m: -1 } },
    b: { texto: 'Mantener la luz', ef: { m: 1, u: -1 } }
  },
  {
    quien: '🎄 Soldado Iván', texto: 'Iván propone decorar la trinchera con ramas y latas para que parezca Navidad.',
    a: { texto: '¡Adelante!', ef: { m: 2, c: -1 } },
    b: { texto: 'No es momento', ef: { m: -1 } }
  },
  {
    quien: '🩺 El médico', texto: 'Tengo morfina para dos heridos graves, pero hay tres.',
    a: { texto: 'Repartirla entre los tres', ef: { s: -1, m: 1 } },
    b: { texto: 'Pedir más a retaguardia', ef: { s: 1, c: -1, m: -1 } }
  },
  {
    quien: '🚂 El tren de suministros', texto: 'El tren llega con retraso. Podemos ir a buscarlo a medio camino.',
    a: { texto: 'Ir a buscarlo', ef: { c: 2, u: 1, s: -2 } },
    b: { texto: 'Esperar', ef: { c: -1 } }
  }
];

/** Carta final del 25 de diciembre */
export const NAVIDAD = {
  quien: '🎄 25 de diciembre',
  texto: 'Al amanecer se oyen villancicos desde la trinchera enemiga. Alguien levanta un árbol con velas. Un soldado alemán sale a tierra de nadie con las manos vacías.',
  a: { texto: 'Salir a su encuentro', ef: {} },
  b: { texto: 'Quedarse a cubierto', ef: {} }
};
