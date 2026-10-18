// Aspecto de cada minijuego: icono, colores, descripción corta y etiquetas de búsqueda.
// Se usa en la portada (tarjetas + buscador) y dentro de cada juego.
// - icono: nombre de un icono de components/Icon.jsx (cada juego tiene el suyo, sin repetirse)
// - colores: degradado [claro, oscuro]; con texto/icono blanco encima
// - etiquetas: palabras extra para el buscador (sin tildes, en minúsculas)
export const META = {
  'quien-es-quien': {
    titulo: '¿Sabes quién soy?',
    icono: 'whois',
    colores: ['#3b82f6', '#1d4ed8'],
    etiquetas: 'personajes adivinar descartar rasgos clasico tablero preguntas',
    descripcion: 'Adivina el personaje secreto descartando rasgos antes que tus rivales.'
  },
  'rasgos': {
    titulo: 'El paparazzi',
    icono: 'zoomface',
    colores: ['#f97316', '#9a3412'],
    etiquetas: 'famosos cara facciones zoom foto celebridades',
    descripcion: 'Reconoce al famoso descubriendo sus facciones paso a paso.'
  },
  'rankings': {
    titulo: 'Ranking oculto',
    icono: 'podium',
    colores: ['#eab308', '#a16207'],
    etiquetas: 'ranking ordenar puestos clasificacion mayor menor top',
    descripcion: 'Ordena de mayor a menor elementos de cultura, ciencia, cine y deportes.'
  },
  'aproximacion': {
    titulo: 'Aproxímate',
    icono: 'target',
    colores: ['#8b5cf6', '#5b21b6'],
    etiquetas: 'numeros cifras calcular estimar aproximar cantidad',
    descripcion: 'Atrévete a calcular cifras astronómicas y llévate los puntos por ser el más cercano.'
  },
  'ubicacion': {
    titulo: 'Test del viajero',
    icono: 'pin',
    colores: ['#10b981', '#047857'],
    etiquetas: 'mapa lugares monumentos geografia mundo foto',
    descripcion: 'Ubica monumentos y lugares en el mapa mundial esquivando los señuelos de los demás.'
  },
  'siglas': {
    titulo: 'D.E.S.C.I.F.R.A',
    icono: 'letters',
    colores: ['#6366f1', '#3730a3'],
    etiquetas: 'siglas acronimos significado palabras cultura general',
    descripcion: 'Averigua el significado real de las siglas más conocidas.'
  },
  'rapidfire': {
    titulo: 'Rápido y certero',
    icono: 'zap',
    colores: ['#ef4444', '#b91c1c'],
    etiquetas: 'retos categorias cronometro rebote rapido 60 segundos',
    descripcion: 'Retos de 60 segundos por categoría: di todos los elementos antes de que se acabe el tiempo o pasa el rebote.'
  },
  'trayectoria': {
    titulo: 'Modo carrera',
    icono: 'soccer',
    colores: ['#22c55e', '#15803d'],
    etiquetas: 'futbol futbolista clubes deportes equipos jugador',
    descripcion: 'Descubre al deportista a través de los clubes en los que jugó.'
  },
  'adivina': {
    titulo: 'Luces, Cámara... ¡Música!',
    icono: 'clapperboard',
    colores: ['#ec4899', '#be185d'],
    etiquetas: 'peliculas cine canciones musica actores frases audio',
    descripcion: 'Identifica la película o la canción con frases, fragmentos de audio de 20s y actores.'
  },
  'pistas': {
    titulo: 'No seas des(pista)do',
    icono: 'sleuth',
    colores: ['#64748b', '#1e293b'],
    etiquetas: 'detective enigma misterio pistas vidas adivinar',
    descripcion: 'Resuelve el enigma con 6 pistas progresivas. Juega por puntos o sobrevive con 3 vidas.'
  },
  'velocidad': {
    titulo: 'Minuto de Infarto',
    icono: 'stopwatch',
    colores: ['#84cc16', '#4d7c0f'],
    etiquetas: 'contrarreloj rapido 60 segundos preguntas tiempo test',
    descripcion: '60 segundos de adrenalina pura. Acierta a contrarreloj y supera la pregunta especial.'
  },
  'quienmas': {
    titulo: '¿De verdad os conocéis?',
    icono: 'users',
    colores: ['#f43f5e', '#be123c'],
    etiquetas: 'amigos votar votacion preguntas picantes grupo conocer',
    descripcion: 'Votad quién encaja más con preguntas comprometidas o divertidas. Si votas al más votado te llevas punto, pero si hay empate... ¡cero puntos para todos!'
  },
  'confianzaciega': {
    titulo: 'Confianza Ciega',
    icono: 'dice',
    colores: ['#14b8a6', '#0f766e'],
    etiquetas: 'apuesta apostar consigna retos amigos 2 minutos',
    descripcion: 'Elige una consigna en secreto, deja que tus amigos apuesten a ciegas sobre tu capacidad y demuestra cuántas puedes decir en 2 minutos.'
  },
  'lobos': {
    titulo: 'Luna de Sangre',
    icono: 'moon',
    colores: ['#b91c1c', '#1e1b4b'],
    etiquetas: 'hombres lobo roles pueblo noche narrador mafia',
    descripcion: 'Lobos contra pueblo, con roles inéditos y caos. De 8 a 12 jugadores, pasándoos el dispositivo.'
  },
  'frasescelebres': {
    titulo: 'Frases Célebres',
    icono: 'quote',
    colores: ['#06b6d4', '#0e7490'],
    etiquetas: 'citas autor quien dijo historia politica deporte famosos',
    descripcion: '¿Quién dijo qué? Adivina el autor de las frases más recordadas de la historia, la política, el deporte y el famoseo.'
  },
  'conecta': {
    titulo: 'Conecta 4',
    icono: 'connect',
    colores: ['#0ea5e9', '#0369a1'],
    etiquetas: 'conexiones grupos 16 elementos palabras relacionar',
    descripcion: 'Encuentra las 4 conexiones secretas entre los 16 elementos del tablero antes de quedarte sin vidas.'
  },
  'impostor': {
    titulo: 'Miente como puedas',
    icono: 'mask',
    colores: ['#9333ea', '#3b0764'],
    etiquetas: 'impostor mentir engano restriccion hablar sospechoso',
    descripcion: 'Descubre al impostor antes de que se salga con la suya, pero ojo a la restricción que todos debéis cumplir al hablar.'
  },
  'colores': {
    titulo: 'La vida en colores',
    icono: 'palette',
    colores: ['#ec4899', '#f59e0b'],
    etiquetas: 'colores marcas personajes logos combinacion',
    descripcion: 'Adivina la combinación exacta de colores de personajes, marcas y cosas míticas que todo el mundo ha visto.'
  },
  'buscaminas': {
    titulo: 'Cuidado que explota',
    icono: 'bomb',
    colores: ['#52525b', '#18181b'],
    etiquetas: 'minas bombas casillas explota tablero suerte',
    descripcion: 'Un tablero de 15 casillas con 10 aciertos y 5 bombas ocultas. Elige por turnos, suma puntos según la dificultad y evita pisar la mina para no quedar eliminado de la ronda.'
  },
  'popular': {
    titulo: 'Sigue la moda',
    icono: 'flame',
    colores: ['#fb923c', '#dc2626'],
    etiquetas: 'popular mayoria top 5 tendencia moda categorias encuesta',
    descripcion: '¿Qué es lo que respondería la mayoría? Adivina los 5 elementos más populares de cada categoría y suma desde 1 hasta 5 puntos por acierto.'
  },
  'masmenos': {
    titulo: 'Entre dos aguas',
    icono: 'scale',
    colores: ['#2563eb', '#4f46e5'],
    etiquetas: 'comparar mayor menor datos numericos racha',
    descripcion: 'Compara dos datos numéricos frente a frente y elige el más grande para encadenar la racha de aciertos más larga.'
  },
  'cancion': {
    titulo: 'Afina ese oído',
    icono: 'music',
    colores: ['#a3e635', '#16a34a'],
    etiquetas: 'musica canciones escuchar oido volumen adivinar tema',
    descripcion: 'Escucha la canción subiendo gradualmente de volumen. Pulsa el botón antes de los 30 segundos para adivinar el tema y sumar tantos puntos como segundos queden.'
  },
  'ciegas': {
    titulo: 'Top a Ciegas',
    icono: 'eyeoff',
    colores: ['#f59e0b', '#b45309'],
    etiquetas: 'ranking ordenar ciegas votar puntuar orden',
    descripcion: 'Ordena de 1 a 5 cada elemento sin saber qué saldrá después. Los rivales votan cuántos has acertado.'
  },
  'traiciones': {
    titulo: 'Traiciones',
    icono: 'dagger',
    colores: ['#d97706', '#7c2d12'],
    etiquetas: 'traidores caravana desierto sabotaje mafia deduccion engano coartada votar roles online',
    descripcion: 'Una caravana cruza el desierto hacia el Oasis, pero hay traidores entre vosotros. Cumple tus tareas, vigila tus espaldas y descubre quién miente antes de que sea tarde.'
  },
  'coleccion': {
    titulo: 'Colecciona con cabeza',
    icono: 'cards', 
    colores: ['#06b6d4', '#1d4ed8'],
    etiquetas: 'cartas azar coleccion estrategia numeros baraja',
    descripcion: 'Consigue 5 cartas del mismo tipo antes que el resto. ¡Pero cuidado! Si acumulas 5 tipos distintos, quedarás eliminado.'
  },
  'unoadiez': {
    titulo: 'Del 1 al 10...',
    icono: 'target',
    colores: ['#8b5cf6', '#b91c1c'],
    etiquetas: 'numero conocer amigos pareja ranking',
    descripcion: 'Adivina el número secreto del 1 al 10 guiándote por las pistas y opiniones de tus amigos. ¡El que menos puntos sume gana!'
  }
};
export const META_POR_DEFECTO = { icono: 'star', colores: ['#8b5cf6', '#6366f1'], etiquetas: '', descripcion: '' };
export const metaDe = (id) => META[id] ?? META_POR_DEFECTO;
