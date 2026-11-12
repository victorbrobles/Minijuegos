// client/src/games/Furbo/FurboInfo.js
// Textos de las fases: se usan en la ayuda de los menús y en la pantalla de presentación de cada fase.

export const FASES_INFO = {
  vestuario: {
    nombre: 'Vestuario',
    emoji: '🧤',
    lema: 'Telepatía de vestuario',
    resumen: 'Todos escriben a la vez un nombre. Gana puntos quien coincide con otro jugador.',
    reglas: [
      'Aparece una categoría muy abierta (por ejemplo, «Un jugador español que haya jugado en el Chelsea»).',
      'Todos escriben a la vez un nombre en secreto. No se trata de decir el mejor, sino de <strong>coincidir</strong>.',
      'Si tu respuesta coincide con la de al menos otro jugador, sumas <strong>+2 puntos</strong>.',
      'Da igual cómo lo escribas: «Torres» y «Fernando Torres» cuentan como lo mismo.'
    ]
  },
  rebote: {
    nombre: 'Rebote',
    emoji: '🎯',
    lema: 'Dato exacto y rebote',
    resumen: 'Pregunta de dato exacto. Si el primero falla, el siguiente solo debe decir si es más o menos.',
    reglas: [
      'Cada ronda hay una pregunta cuya respuesta es un número (un año o una cantidad).',
      'El jugador con el turno responde: si <strong>clava el número</strong>, suma <strong>+3 puntos</strong>.',
      'Si falla, la pregunta <strong>rebota</strong> al siguiente jugador, que solo debe decir si el dato real es <strong>mayor o menor</strong> (o antes o después) que lo que dijo el primero: <strong>+1 punto</strong>.'
    ]
  },
  quiniela: {
    nombre: 'Quiniela 1X2',
    emoji: '📋',
    lema: 'Tres opciones, una verdad',
    resumen: 'Pregunta con tres opciones al estilo quiniela. Todos eligen a la vez.',
    reglas: [
      'Aparece una pregunta con tres opciones: <strong>1</strong>, <strong>X</strong> y <strong>2</strong>.',
      'Todos eligen una opción en secreto y a la vez.',
      'Cada acierto suma <strong>+2 puntos</strong>. Puedes jugar por intuición o por descarte.'
    ]
  },
  prorroga: {
    nombre: 'Prórroga',
    emoji: '🗣️',
    lema: 'Palabras prohibidas',
    resumen: 'Un jugador describe un concepto de fútbol sin decir las palabras prohibidas.',
    reglas: [
      'Por turnos, un jugador ve en su pantalla una palabra y sus <strong>palabras prohibidas</strong>. Tiene <strong>60 segundos</strong>.',
      'Debe describirla en voz alta para que los demás la adivinen, sin decir ni la palabra ni las prohibidas.',
      '<strong>✅ Acertada:</strong> +1 para quien describe y +1 para quien la adivinó. <strong>⏭️ Pasar:</strong> 0 puntos. <strong>🚫 Prohibida:</strong> si dice una palabra prohibida, resta −1.',
      'Se avanza a la siguiente palabra hasta que se acabe el tiempo.'
    ]
  },
  penaltis: {
    nombre: 'Penaltis',
    emoji: '⚽',
    lema: 'Riesgo y recompensa',
    resumen: 'En tu turno eliges dónde tirar: fácil al centro o difícil a la escuadra.',
    reglas: [
      'En tu turno eliges cómo lanzar el penalti antes de ver la pregunta.',
      '<strong>🎯 Al centro:</strong> pregunta fácil. Si aciertas, <strong>1 gol</strong>.',
      '<strong>🥅 A la escuadra:</strong> pregunta difícil. Si aciertas, <strong>3 goles</strong>.',
      'Si fallas o se acaba el tiempo, el portero la para. Si vas perdiendo, ¡te toca arriesgar!'
    ]
  }
};

export const DURACIONES_INFO = {
  corto: { nombre: '×2 por jugador', detalle: '2 rondas por jugador en cada fase' },
  normal: { nombre: '×3 por jugador', detalle: '3 rondas por jugador en cada fase' },
  largo: { nombre: '×5 por jugador', detalle: '5 rondas por jugador en cada fase' }
};

export const ORDEN_FASES = ['vestuario', 'rebote', 'quiniela', 'prorroga', 'penaltis'];

export const PUNTOS_INFO = [
  ['🧤 Vestuario: coincidir con otro jugador', '+2'],
  ['🎯 Rebote: clavar el dato / acertar el rebote', '+3 / +1'],
  ['📋 Quiniela: acertar la opción', '+2'],
  ['🗣️ Prórroga: palabra acertada (quien describe y quien adivina) / palabra prohibida', '+1 / −1'],
  ['⚽ Penaltis: gol al centro / gol a la escuadra', '+1 / +3']
];
