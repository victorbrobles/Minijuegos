// Aspecto de cada minijuego: icono, colores y descripción corta (se usa en portada y dentro del juego)
export const META = {
  'quien-es-quien': {
    titulo: '¿Quién Anda Ahí?',
    icono: 'whois',
    colores: ['#3b82f6', '#1d4ed8'],
    descripcion: 'Adivina el personaje secreto descartando rasgos antes que tus rivales.'
  },
  'rasgos': {
    titulo: 'Zoom a la Fama',
    icono: 'users',
    colores: ['#f97316', '#ea580c'],
    descripcion: 'Reconoce al famoso descubriendo sus facciones paso a paso.'
  },
  'rankings': {
    titulo: 'Ponte en Orden',
    icono: 'trophy',
    colores: ['#eab308', '#ca8a04'],
    descripcion: 'Ordena de mayor a menor elementos de cultura, ciencia, cine y deportes.'
  },
  'aproximacion': {
    titulo: 'A Ojo de Buen Cubero',
    icono: 'target',
    colores: ['#8b5cf6', '#6d28d9'],
    descripcion: 'Atrévete a calcular cifras astronómicas y llévate los puntos por ser el más cercano.'
  },
  'ubicacion': {
    titulo: '¿Dónde Diablos Está?',
    icono: 'globe',
    colores: ['#10b981', '#059669'],
    descripcion: 'Ubica monumentos y lugares en el mapa mundial esquivando los señuelos de los demás.'
  },
  'siglas': {
    titulo: 'Descifra el Código',
    icono: 'letters',
    colores: ['#06b6d4', '#0891b2'],
    descripcion: 'Averigua el significado real de las siglas más conocidas.'
  },
  'rapidfire': {
    titulo: 'A Quemarropa',
    icono: 'zap',
    colores: ['#ef4444', '#dc2626'],
    descripcion: 'Responde preguntas a toda velocidad sin dudar ni un segundo.'
  },
  'trayectoria': {
    titulo: 'El Currículum Oculto',
    icono: 'trophy',
    colores: ['#6366f1', '#4338ca'],
    descripcion: 'Descubre al deportista a través de los clubes en los que jugó.'
  },
  'adivina': {
    titulo: 'Luces, Cámara... ¡Música!',
    icono: 'clapperboard',
    colores: ['#ec4899', '#db2777'],
    descripcion: 'Identifica la película o la canción con frases, fragmentos de audio de 20s y actores.'
  },
  'pistas': {
    titulo: 'Seis Bajo Sospecha',
    icono: 'detective',
    colores: ['#a855f7', '#7e22ce'],
    descripcion: 'Resuelve el enigma con 6 pistas progresivas. Juega por puntos o sobrevive con 3 vidas.'
  },
  'velocidad': {
    titulo: 'Minuto de Infarto',
    icono: 'speedometer',
    colores: ['#3b82f6', '#2563eb'],
    descripcion: '60 segundos de adrenalina pura. Acierta a contrarreloj y supera la pregunta especial.'
  },
  'quienmas' : {
    titulo: '¿De verdad os conocéis?',
    icono: 'users',
    colores: ['#3b82f6', '#2563eb'],
    descripcion: 'Votad quién encaja más con preguntas comprometidas o divertidas. Si votas al más votado te llevas punto, pero si hay empate... ¡cero puntos para todos!'
  },
  'confianzaciega' : {
    titulo: 'Confianza Ciega',
    icono: 'detective',
    colores: ['#ef4444', '#4338ca'],
    descripcion: 'Elige una consigna en secreto, deja que tus amigos apuesten a ciegas sobre tu capacidad y demuestra cuántas puedes decir en 2 minutos.'
  }
  ,'lobos': {
    titulo: 'Luna de Sangre',
    icono: 'moon',
    colores: ['#4338ca', '#7e22ce'],
    descripcion: 'Lobos contra pueblo, con roles inéditos y caos. De 8 a 12 jugadores, pasándoos el dispositivo.'
  },
  'frasescelebres': {
    titulo: 'Frases Célebres',
    icono: 'letters',
    colores: ['#ec4899', '#8b5cf6'],
    descripcion: '¿Quién dijo qué? Adivina el autor de las frases más recordadas de la historia, la política, el deporte y el famoseo.'
  },
  'conecta': {
    titulo: 'Conecta 4',
    icono: 'target',
    colores: ['#3b82f6', '#1d4ed8'],
    descripcion: 'Encuentra las 4 conexiones secretas entre los 16 elementos del tablero antes de quedarte sin vidas.'
  },
  'impostor': {
    titulo: 'Miente como puedas',
    icono: 'whois',
    colores: ['#6366f1', '#a855f7'],
    descripcion: 'Descubre al impostor antes de que se salga con la suya, pero ojo a la restricción que todos debéis cumplir al hablar.'
  },
  'colores': {
    titulo: 'La vida en colores',
    icono: 'brush',
    colores: ['#f43f5e', '#8b5cf6'],
    descripcion: 'Adivina la combinación exacta de colores de personajes, marcas y cosas míticas que todo el mundo ha visto.'
  },
  'buscaminas': {
    titulo: 'Cuidado que explota',
    icono: 'bomb',
    colores: ['#3b82f6', '#2563eb'],
    descripcion: 'Un tablero de 15 casillas con 10 aciertos y 5 bombas ocultas. Elige por turnos, suma puntos según la dificultad y evita pisar la mina para no quedar eliminado de la ronda.'
  },
  'popular': {
    titulo: 'Sigue la moda',
    icono: 'fashion',
    colores: ['#f43f5e', '#8b5cf6'],
    descripcion: '¿Qué es lo que respondería la mayoría? Adivina los 5 elementos más populares de cada categoría y suma desde 1 hasta 5 puntos por acierto.'
  },
  'masmenos': {
    titulo: 'Entre dos aguas',
    icono: 'scale',
    colores: ['#4338ca', '#7e22ce'],
    descripcion: 'Compara dos datos numéricos frente a frente y elige el más grande para encadenar la racha de aciertos más larga.'
  },
  'cancion': {
    titulo: 'Afina ese oído',
    icono: 'music',
    colores: ['#10b981', '#059669'],
    descripcion: 'Escucha la canción subiendo gradualmente de volumen. Pulsa el botón antes de los 30 segundos para adivinar el tema y sumar tantos puntos como segundos queden.'
  }
};
export const META_POR_DEFECTO = { icono: 'star', colores: ['#8b5cf6', '#6366f1'], descripcion: '' };
export const metaDe = (id) => META[id] ?? META_POR_DEFECTO;