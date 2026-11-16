// client/src/games/Logos/LogosInfo.js
// Textos de las fases de «Logomanía»: se usan al elegir las fases y en la presentación de cada una.

export const FASES_INFO = {
  logomaniaco: {
    nombre: 'El logomaníaco',
    emoji: '🗣️',
    lema: 'Di marcas sin parar',
    resumen: 'Por turnos: di en voz alta tantas marcas que cumplan el requisito como pide, antes de que acabe el tiempo.',
    reglas: [
      'En tu turno sale un requisito (por ejemplo, «Logos con un animal» o «Marcas de coches alemanas») y cuántas marcas tienes que decir: <strong>5 si es fácil, 4 si es media y 3 si es difícil</strong>.',
      'Al pulsar «¡Empezar!» tienes <strong>25 segundos</strong> para decirlas en voz alta.',
      'Validan los demás: si lo consigues, alguien pulsa <strong>✅ Lo ha conseguido</strong> y sumas <strong>+2</strong>. Si repites o dices una que no vale, <strong>❌ Ha fallado</strong>.',
      'Si fallas o se acaba el tiempo, hay <strong>rebote</strong> para el siguiente jugador, y solo para él: si lo consigue, <strong>+1</strong>.'
    ]
  },
  pintor: {
    nombre: 'El pintor',
    emoji: '🎨',
    lema: 'Dibuja logos a contrarreloj',
    resumen: 'Solo online. Uno dibuja logos durante 60 segundos y los demás escriben de qué marca son.',
    soloOnline: true,
    reglas: [
      'Por turnos, un jugador ve una marca y dibuja su logo en su móvil. Tiene <strong>60 segundos</strong> para que le adivinen todos los que pueda.',
      'Los demás ven el dibujo en directo y escriben la marca en su pantalla.',
      'El primero que acierta suma <strong>+1</strong> y el pintor también <strong>+1</strong>; entonces sale otra marca.',
      'Si una marca es imposible, el pintor puede <strong>pasar</strong> (sin puntos). No vale escribir letras en el dibujo.'
    ]
  },
  retrato: {
    nombre: 'El retrato robot',
    emoji: '🕵️',
    lema: 'Adivina el logo por su descripción',
    resumen: 'Todos a la vez: se describe un logo y cada uno escribe en su móvil de qué marca es.',
    reglas: [
      'Aparece la descripción de un logo, sin decir la marca.',
      'Todos escribís en secreto de qué marca es. Tenéis <strong>45 segundos</strong>.',
      'Cada acierto suma <strong>+2</strong>. Se perdonan tildes, mayúsculas y erratas pequeñas.'
    ]
  },
  pasaporte: {
    nombre: 'El pasaporte',
    emoji: '🛂',
    lema: '¿De dónde es esta marca?',
    resumen: 'Todos a la vez: sale una marca y elegís de qué país es entre cuatro.',
    reglas: [
      'Aparece una marca y cuatro países. Cuenta el país donde nació la marca.',
      'Todos elegís en secreto. Tenéis <strong>20 segundos</strong>.',
      'Cada acierto suma <strong>+1</strong>. ¡Ojo, que hay marcas que engañan!'
    ]
  },
  mentiroso: {
    nombre: 'El mentiroso',
    emoji: '🤥',
    lema: '¿Te fías de lo que dice?',
    resumen: 'Por turnos: uno dice si una curiosidad es verdad o mentira y los demás deciden si se fían.',
    reglas: [
      'En tu turno sale una curiosidad sobre una marca o un logo y respondes si es <strong>verdad o mentira</strong>. Si aciertas, <strong>+1</strong>.',
      'Después, los demás ven tu respuesta y deciden en secreto si <strong>confían</strong> o <strong>desconfían</strong> de ti.',
      'Confías y acierta: <strong>0</strong>. Confías y falla: <strong>−1</strong>.',
      'Desconfías y falla: <strong>+1</strong>. Desconfías y acierta: <strong>0</strong>.'
    ]
  },
  eslogan: {
    nombre: 'El eslogan',
    emoji: '📢',
    lema: '¿Quién dice eso?',
    resumen: 'Todos a la vez: sale un eslogan y cada uno escribe en su móvil de qué marca es.',
    reglas: [
      'Aparece un eslogan publicitario (el nombre de la marca se tapa con «…»).',
      'Todos escribís en secreto de qué marca es. Tenéis <strong>30 segundos</strong>.',
      'Cada acierto suma <strong>+2</strong>. Se perdonan tildes, mayúsculas y erratas pequeñas.'
    ]
  },
  experto: {
    nombre: 'El experto',
    emoji: '🎓',
    lema: 'Elige marca y arriesga',
    resumen: 'Por turnos: eliges entre dos marcas rivales; una esconde una pregunta difícil (+3) y la otra una fácil (+1).',
    reglas: [
      'En tu turno ves dos marcas rivales (por ejemplo, McDonald\'s y Burger King) y eliges una.',
      'Una esconde una pregunta <strong>muy difícil</strong> que vale <strong>+3</strong> y la otra, una <strong>fácil</strong> que vale <strong>+1</strong>. No sabes cuál es cuál.',
      'Contestas tú solo, eligiendo entre cuatro opciones. Sin rebote.'
    ]
  }
};

export const DURACIONES_INFO = {
  corto: { nombre: '×2 por jugador', detalle: '2 rondas por jugador en cada fase' },
  normal: { nombre: '×3 por jugador', detalle: '3 rondas por jugador en cada fase' },
  largo: { nombre: '×5 por jugador', detalle: '5 rondas por jugador en cada fase' }
};

export const ORDEN_FASES = ['logomaniaco', 'pintor', 'retrato', 'pasaporte', 'mentiroso', 'eslogan', 'experto'];
export const fasesDe = (local) => ORDEN_FASES.filter((f) => !(local && FASES_INFO[f].soloOnline));
