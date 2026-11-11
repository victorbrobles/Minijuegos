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

// ---- Ampliación: más piezas para que las excusas no se repitan
SUJETOS.push(
  { texto: 'Mi perro salchicha', hecho: 'perro' }, { texto: 'El gato del vecino', hecho: 'vecino' }, { texto: 'Mi hija mayor', hecho: 'hijos' },
  { texto: 'Mi abuela, que ha venido de visita', hecho: 'abuela' }, { texto: 'El revisor del metro', hecho: 'metro' }, { texto: 'Mi suegro', hecho: 'suegra' },
  { texto: 'Un cartero despistado' }, { texto: 'Una gaviota de Benidorm' }, { texto: 'Mi profesor de autoescuela' }, { texto: 'Un repartidor de pizzas' },
  { texto: 'El presidente de la comunidad' }, { texto: 'Un grupo de turistas japoneses' }, { texto: 'Mi entrenador de pilates' }, { texto: 'Un mago de feria' },
  { texto: 'Mi robot aspirador' }, { texto: 'Un jabalí' }, { texto: 'La tuna de Derecho' }, { texto: 'Mi exnovio' }, { texto: 'Un cobrador del frac' },
  { texto: 'Mi asistente de voz' }, { texto: 'Un señor disfrazado de Spiderman' }, { texto: 'El butanero' }, { texto: 'Mi compañero de piso' },
  { texto: 'Una banda de música municipal' }, { texto: 'Mi dentista' }, { texto: 'Un pulpo del acuario' }, { texto: 'El párroco del barrio' },
  { texto: 'Mi primo el de Cuenca' }, { texto: 'Una máquina expendedora' }, { texto: 'El algoritmo de Instagram' }
);
ACCIONES.push(
  'ha metido en la lavadora', 'ha regalado', 'ha enterrado en el jardín', 'ha mandado por correo a Albacete', 'ha hipnotizado', 'ha bañado en gazpacho',
  'ha confiscado', 'ha subastado', 'ha atado con un lazo a', 'ha desmontado pieza a pieza', 'ha disfrazado de Papá Noel', 'ha llevado de excursión',
  'ha hecho la declaración de la renta con', 'ha cantado una jota a', 'ha cambiado de sitio', 'ha pegado con pegamento a', 'ha hervido', 'ha bautizado',
  'ha perdido en un concurso de la tele', 'ha escondido en el congelador', 'ha intentado comprar', 'ha puesto a dieta a', 'ha denunciado a', 'ha tatuado',
  'ha mandado al espacio', 'ha tejido una bufanda para', 'ha apuntado a clases de salsa a', 'ha cubierto de purpurina', 'ha rebozado', 'ha echado de casa'
);
OBJETOS.push(
  { texto: 'mi tarjeta de fichar' }, { texto: 'la llave del coche', hecho: 'coche' }, { texto: 'el casco de la bici', hecho: 'bici' }, { texto: 'mi bonobús', hecho: 'autobus' },
  { texto: 'las gafas de cerca', hecho: 'gafas' }, { texto: 'el cargador del portátil', hecho: 'portatil' }, { texto: 'el pienso del gato', hecho: 'gato' }, { texto: 'la correa del perro', hecho: 'perro' },
  { texto: 'el felpudo' }, { texto: 'mi agenda' }, { texto: 'los papeles del banco' }, { texto: 'el pendrive con la presentación' }, { texto: 'mi uniforme' },
  { texto: 'la cafetera' }, { texto: 'mis lentillas' }, { texto: 'el tupper de lentejas' }, { texto: 'la tarjeta de crédito' }, { texto: 'la escalera de la comunidad' },
  { texto: 'el router' }, { texto: 'mis calcetines de la suerte' }, { texto: 'el traje de la boda' }, { texto: 'la nevera' }, { texto: 'mi certificado de vacunación' },
  { texto: 'los auriculares' }, { texto: 'la persiana' }, { texto: 'el mando de la tele' }, { texto: 'mi peluca de carnaval' }, { texto: 'las llaves del trastero' },
  { texto: 'el árbol de Navidad' }, { texto: 'el regalo del amigo invisible' }
);
PREGUNTAS.push(
  '¿Por qué tu informe tiene dibujos de unicornios?', '¿Por qué has pedido la baja por «cansancio emocional del lunes»?', '¿Por qué has respondido «ok» a un correo de tres páginas?',
  '¿Por qué tienes el micro abierto y se oye a una gallina?', '¿Por qué llegas en bata?', '¿Por qué hay un perro en la sala de reuniones?',
  '¿Por qué has borrado la carpeta compartida?', '¿Por qué estás en la foto de Instagram de la playa si tenías gripe?', '¿Por qué has comprado 300 grapadoras?',
  '¿Por qué no has cerrado la oficina anoche?', '¿Por qué tu firma del correo dice «Rey del Universo»?', '¿Por qué se te ha visto cantando en un karaoke en horario laboral?',
  '¿Por qué hay una cabra en el parking?', '¿Por qué has llamado «mamá» al director?', '¿Por qué tu ordenador tiene doscientas pestañas abiertas?',
  '¿Por qué no has entregado el presupuesto?', '¿Por qué llevas gafas de sol dentro de la oficina?', '¿Por qué el cliente ha recibido un audio de nueve minutos?',
  '¿Por qué no te has conectado a la formación obligatoria?', '¿Por qué la impresora imprime solo memes?', '¿Por qué has reservado la sala de reuniones para echarte la siesta?',
  '¿Por qué tu coche ocupa tres plazas del parking?', '¿Por qué hay espuma saliendo de la cocina de la oficina?', '¿Por qué no fuiste al team building?',
  '¿Por qué has mandado el informe en Comic Sans?', '¿Por qué llevas tres días sin afeitarte la mitad de la cara?', '¿Por qué has contestado al cliente con un emoji de berenjena?',
  '¿Por qué no hiciste la copia de seguridad?', '¿Por qué estás comiendo en mitad de la videollamada?', '¿Por qué tu mesa huele a churros?'
);
