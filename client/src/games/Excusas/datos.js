// client/src/games/Excusas/datos.js
// Piezas para construir excusas. `hecho` indica qué afirmas al usar esa pieza
// (por ejemplo, «Mi perro…» afirma que tienes perro). Si el jefe sabe que no es así, te pilla.

export const HECHOS = {
  perro: 'Odias los perros: no tienes perro.',
  gato: 'Eres alérgico a los gatos: no tienes gato.',
  coche: 'No tienes carné de conducir ni coche.',
  bici: 'No sabes montar en bici.',
  hijos: 'No tienes hijos.',
  abuela: 'Tus abuelas viven en Australia.',
  ascensor: 'Vives en un bajo: en tu edificio no hay ascensor.',
  gafas: 'Tienes vista de lince: no usas gafas.',
  metro: 'En tu ciudad no hay metro.',
  suegra: 'No tienes pareja (ni suegra).',
  vecino: 'Vives en una casa en mitad del campo, sin vecinos.',
  portatil: 'Nunca te llevas el portátil del trabajo a casa.',
  autobus: 'Siempre vas andando al trabajo.',
  loro: 'En tu casa no hay más animales que una planta.'
};

export const SUJETOS = [
  { texto: 'Mi perro', hecho: 'perro' },
  { texto: 'Mi gato', hecho: 'gato' },
  { texto: 'Mi abuela', hecho: 'abuela' },
  { texto: 'Mi vecino del quinto', hecho: 'vecino' },
  { texto: 'Mi hijo pequeño', hecho: 'hijos' },
  { texto: 'Mi suegra', hecho: 'suegra' },
  { texto: 'El conductor del autobús', hecho: 'autobus' },
  { texto: 'Mi loro', hecho: 'loro' },
  { texto: 'Un señor con bigote' },
  { texto: 'Una paloma muy grande' },
  { texto: 'El fontanero' },
  { texto: 'Un influencer' },
  { texto: 'Mi horóscopo' },
  { texto: 'Un mimo' },
  { texto: 'La Guardia Civil' },
  { texto: 'Mi yo del futuro' }
];

export const ACCIONES = [
  'se ha comido', 'ha escondido', 'se ha sentado encima de', 'ha roto', 'ha confundido',
  'ha llenado de espuma', 'ha vendido en Wallapop', 'se ha enamorado de', 'ha cerrado con llave',
  'ha pintado de rosa', 'ha tirado al río', 'ha subido a TikTok', 'ha bendecido', 'ha secuestrado',
  'ha congelado', 'ha cambiado por un pollo'
];

export const OBJETOS = [
  { texto: 'mis llaves' },
  { texto: 'el coche', hecho: 'coche' },
  { texto: 'mi bici', hecho: 'bici' },
  { texto: 'el ascensor', hecho: 'ascensor' },
  { texto: 'el portátil del trabajo', hecho: 'portatil' },
  { texto: 'mi despertador' },
  { texto: 'la puerta de casa' },
  { texto: 'mi única camisa limpia' },
  { texto: 'el abono del metro', hecho: 'metro' },
  { texto: 'mis gafas', hecho: 'gafas' },
  { texto: 'el informe' },
  { texto: 'mis zapatos' },
  { texto: 'el móvil' },
  { texto: 'la tortilla de mi abuela', hecho: 'abuela' },
  { texto: 'la mochila de mi hijo', hecho: 'hijos' },
  { texto: 'la contraseña del wifi' }
];

export const PREGUNTAS = [
  '¿Por qué llegas tarde otra vez?',
  '¿Por qué no has venido a la reunión de las 9?',
  '¿Dónde está el informe que te pedí el lunes?',
  '¿Por qué no contestabas al teléfono?',
  '¿Por qué te fuiste a las 12 sin avisar?',
  '¿Por qué llevas el pijama puesto en la videollamada?',
  '¿Por qué no has enviado el correo al cliente?',
  '¿Por qué hueles a pescado?',
  '¿Por qué el cliente dice que le colgaste?',
  '¿Por qué hay purpurina en tu mesa?',
  '¿Por qué no fuiste a la cena de empresa?',
  '¿Por qué has pedido otro día libre?',
  '¿Por qué tu cámara enseña una pared?',
  '¿Por qué apareces dormido en la foto del equipo?'
];

export const REACCIONES_OK = [
  'Mmm… vale. Que no se repita.', 'Increíble. Literalmente: no me lo creo, pero vale.', 'Eso le pasa a todo el mundo, supongo.',
  'Lo apunto en tu ficha. Sigue trabajando.', 'Vaya semana llevas, ¿eh?', 'Bueno… tiene sentido. Más o menos.',
  'No sé qué decir. Vuelve al trabajo.', 'Esa no me la sabía. Te la compro.', 'Se lo contaré a Recursos Humanos. Les encantará.'
];

export const AVISOS_JEFE = [
  'Por cierto, he hablado con Recursos Humanos y me han contado algo de ti:',
  'He estado mirando tus redes sociales…',
  'Me lo ha dicho tu compañera de mesa:',
  'Lo pone en tu ficha de empleado:'
];
