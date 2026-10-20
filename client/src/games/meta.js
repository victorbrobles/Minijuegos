// client/src/games/meta.js

// Categorías temáticas de la portada
export const CATEGORIAS_PORTADA = [
  { id: 'favoritos', titulo: '⭐ Favoritos del Creador', desc: 'Los juegos más destacados, adictivos y jugados' },
  { id: 'prueba', titulo: '🧠 Para ponerte a prueba', desc: 'Retos de ingenio, cultura, velocidad y memoria' },
  { id: 'estrategia', titulo: '♟️ Estratégicos y de deducción', desc: 'Roles ocultos, engaños, gestión de cartas y táctica' },
  { id: 'chill', titulo: '🌴 Para jugar de chill', desc: 'Risas, amigos, preguntas y pura diversión sin estrés' },
  { id: 'futbol', titulo: '⚽ Para amantes del fútbol', desc: 'Demuestra todo lo que sabes sobre el deporte rey' },
  { id: 'famosos', titulo: '🌟 De famosos y cultura pop', desc: 'Celebridades, cine, música, frases y televisión' },
  { id: 'dos_jugadores', titulo: '👥 Para dos jugadores', desc: 'Ideales para competir o cooperar frente a frente' }
];

export const META = {
  'bingoball': {
    titulo: 'Bingoball',
    icono: 'soccer',
    colores: ['#1d4ed8', '#0f172a'],
    etiquetas: 'futbol bingo cartones jugadores categorias online',
    descripcion: 'Rellena tu cartón de 4x5 relacionando futbolistas con categorías. Canta líneas y consigue el Bingo antes que nadie.',
    categorias: ['favoritos', 'futbol', 'chill']
  },
  'trayectoria': {
    titulo: 'Modo carrera',
    icono: 'soccer',
    colores: ['#22c55e', '#15803d'],
    etiquetas: 'futbol futbolista clubes deportes equipos jugador',
    descripcion: 'Descubre al deportista a través de los clubes en los que jugó.',
    categorias: ['futbol', 'prueba', 'dos_jugadores']
  },
  'traiciones': {
    titulo: 'Traiciones',
    icono: 'dagger',
    colores: ['#d97706', '#7c2d12'],
    etiquetas: 'traidores caravana desierto sabotaje mafia deduccion engano coartada votar roles online',
    descripcion: 'Una caravana cruza el desierto hacia el Oasis, pero hay traidores entre vosotros. Cumple tus tareas, vigila tus espaldas y descubre quién miente antes de que sea tarde.',
    categorias: ['favoritos', 'estrategia']
  },
  'fundadores': {
    titulo: 'Fundadores',
    icono: 'landmark',
    colores: ['#ea580c', '#7c2d12'],
    etiquetas: 'pueblo construir oficios roles ocultos estrategia cartas edificios eleccion secreta online',
    descripcion: 'Levantad juntos un pueblo. Elige en secreto tu oficio cada ronda, adivina qué harán los demás y consigue el mejor barrio antes de que se inaugure.',
    categorias: ['favoritos', 'estrategia']
  },
  'coleccion': {
    titulo: 'Colecciona con cabeza',
    icono: 'cards',
    colores: ['#06b6d4', '#1d4ed8'],
    etiquetas: 'cartas azar coleccion estrategia numeros baraja',
    descripcion: 'Consigue 5 cartas del mismo tipo antes que el resto. ¡Pero cuidado! Si acumulas 5 tipos distintos, quedarás eliminado.',
    categorias: ['favoritos', 'estrategia']
  },
  'cuentas': {
    titulo: 'Lleva la cuenta',
    icono: 'cards',
    colores: ['#0284c7', '#0369a1'],
    etiquetas: 'numeros orden cartas mayor menor cuenta deduccion cartas accion',
    descripcion: 'Colocad los números del 1 al 100 de menor a mayor sin conocer las cartas de los demás. Gestiona cartas de acción y sé el primero en vaciar tu mano.',
    categorias: ['estrategia', 'dos_jugadores']
  },
  'descarte': {
    titulo: '¡Descarta y Elimina!',
    icono: 'x',
    colores: ['#06b6d4', '#0e7490'],
    etiquetas: 'palabra ingenio velocidad letras categorias',
    descripcion: 'Elige categoría, di una palabra que empiece por una letra libre antes de 30s y elimínala del abecedario. ¡Sobrevive a 5 tableros!',
    categorias: ['dos_jugadores', 'prueba']
  },
  'lobos': {
    titulo: 'Luna de Sangre',
    icono: 'moon',
    colores: ['#b91c1c', '#1e1b4b'],
    etiquetas: 'hombres lobo roles pueblo noche narrador mafia',
    descripcion: 'Lobos contra pueblo, con roles inéditos y caos. De 8 a 12 jugadores, pasándoos el dispositivo.',
    categorias: ['favoritos', 'estrategia']
  },
  'impostor': {
    titulo: 'Miente como puedas',
    icono: 'mask',
    colores: ['#9333ea', '#3b0764'],
    etiquetas: 'impostor mentir engano restriccion hablar sospechoso',
    descripcion: 'Descubre al impostor antes de que se salga con la suya, pero ojo a la restricción que todos debéis cumplir al hablar.',
    categorias: ['chill']
  },
  'conecta': {
    titulo: 'Conecta 4',
    icono: 'connect',
    colores: ['#0ea5e9', '#0369a1'],
    etiquetas: 'conexiones grupos 16 elementos palabras relacionar',
    descripcion: 'Encuentra las 4 conexiones secretas entre los 16 elementos del tablero antes de quedarte sin vidas.',
    categorias: ['prueba', 'futbol']
  },
  'buscaminas': {
    titulo: 'Cuidado que explota',
    icono: 'bomb',
    colores: ['#52525b', '#18181b'],
    etiquetas: 'minas bombas casillas explota tablero suerte',
    descripcion: 'Un tablero de 15 casillas con 10 aciertos y 5 bombas ocultas. Elige por turnos, suma puntos según la dificultad y evita pisar la mina para no quedar eliminado de la ronda.',
    categorias: ['prueba', 'futbol']
  },
  'quien-es-quien': {
    titulo: '¿Sabes quién soy?',
    icono: 'whois',
    colores: ['#3b82f6', '#1d4ed8'],
    etiquetas: 'personajes adivinar descartar rasgos clasico tablero preguntas',
    descripcion: 'Adivina el personaje secreto descartando rasgos antes que tus rivales.',
    categorias: ['favoritos', 'famosos', 'chill']
  },
  'rasgos': {
    titulo: 'El paparazzi',
    icono: 'zoomface',
    colores: ['#f97316', '#9a3412'],
    etiquetas: 'famosos cara facciones zoom foto celebridades',
    descripcion: 'Reconoce al famoso descubriendo sus facciones paso a paso.',
    categorias: ['famosos', 'chill']
  },
  'adivina': {
    titulo: 'Luces, Cámara... ¡Música!',
    icono: 'clapperboard',
    colores: ['#ec4899', '#be185d'],
    etiquetas: 'peliculas cine canciones musica actores frases audio',
    descripcion: 'Identifica la película o la canción con frases, fragmentos de audio de 20s y actores.',
    categorias: ['famosos', 'chill']
  },
  'cancion': {
    titulo: 'Afina ese oído',
    icono: 'music',
    colores: ['#a3e635', '#16a34a'],
    etiquetas: 'musica canciones escuchar oido volumen adivinar tema',
    descripcion: 'Escucha la canción subiendo gradualmente de volumen. Pulsa el botón antes de los 30 segundos para adivinar el tema y sumar tantos puntos como segundos queden.',
    categorias: ['chill']
  },
  'frasescelebres': {
    titulo: 'Frases Célebres',
    icono: 'quote',
    colores: ['#06b6d4', '#0e7490'],
    etiquetas: 'citas autor quien dijo historia politica deporte famosos',
    descripcion: '¿Quién dijo qué? Adivina el autor de las frases más recordadas de la historia, la política, el deporte y el famoseo.',
    categorias: ['famosos', 'chill']
  },
  'colores': {
    titulo: 'La vida en colores',
    icono: 'palette',
    colores: ['#ec4899', '#f59e0b'],
    etiquetas: 'colores marcas personajes logos combinacion',
    descripcion: 'Adivina la combinación exacta de colores de personajes, marcas y cosas míticas que todo el mundo ha visto.',
    categorias: ['favoritos', 'chill']
  },
  'siglas': {
    titulo: 'D.E.S.C.I.F.R.A',
    icono: 'letters',
    colores: ['#6366f1', '#3730a3'],
    etiquetas: 'siglas acronimos significado palabras cultura general',
    descripcion: 'Averigua el significado real de las siglas más conocidas.',
    categorias: ['prueba', 'dos_jugadores']
  },
  'rankings': {
    titulo: 'Ranking oculto',
    icono: 'podium',
    colores: ['#eab308', '#a16207'],
    etiquetas: 'ranking ordenar puestos clasificacion mayor menor top',
    descripcion: 'Ordena de mayor a menor elementos de cultura, ciencia, cine y deportes.',
    categorias: ['prueba', 'favoritos']
  },
  'aproximacion': {
    titulo: 'Aproxímate',
    icono: 'target',
    colores: ['#8b5cf6', '#5b21b6'],
    etiquetas: 'numeros cifras calcular estimar aproximar cantidad',
    descripcion: 'Atrévete a calcular cifras astronómicas y llévate los puntos por ser el más cercano.',
    categorias: ['prueba', 'favoritos']
  },
  'velocidad': {
    titulo: 'Minuto de Infarto',
    icono: 'stopwatch',
    colores: ['#84cc16', '#4d7c0f'],
    etiquetas: 'contrarreloj rapido 60 segundos preguntas tiempo test',
    descripcion: '60 segundos de adrenalina pura. Acierta a contrarreloj y supera la pregunta especial.',
    categorias: ['prueba', 'dos_jugadores']
  },
  'rapidfire': {
    titulo: 'Rápido y certero',
    icono: 'zap',
    colores: ['#ef4444', '#b91c1c'],
    etiquetas: 'retos categorias cronometro rebote rapido 60 segundos',
    descripcion: 'Retos de 60 segundos por categoría: di todos los elementos antes de que se acabe el tiempo o pasa el rebote.',
    categorias: ['prueba', 'chill', 'dos_jugadores']
  },
  'pistas': {
    titulo: 'No seas des(pista)do',
    icono: 'sleuth',
    colores: ['#64748b', '#1e293b'],
    etiquetas: 'detective enigma misterio pistas vidas adivinar',
    descripcion: 'Resuelve el enigma con 6 pistas progresivas. Juega por puntos o sobrevive con 3 vidas.',
    categorias: ['prueba', 'chill']
  },
  'ubicacion': {
    titulo: 'Test del viajero',
    icono: 'pin',
    colores: ['#10b981', '#047857'],
    etiquetas: 'mapa lugares monumentos geografia mundo foto',
    descripcion: 'Ubica monumentos y lugares en el mapa mundial esquivando los señuelos de los demás.',
    categorias: ['prueba', 'favoritos']
  },
  'masmenos': {
    titulo: 'Entre dos aguas',
    icono: 'scale',
    colores: ['#2563eb', '#4f46e5'],
    etiquetas: 'comparar mayor menor datos numericos racha',
    descripcion: 'Compara dos datos numéricos frente a frente y elige el más grande para encadenar la racha de aciertos más larga.',
    categorias: ['prueba', 'dos_jugadores']
  },
  'conoce': {
    titulo: 'Conoce a tus amigos',
    icono: 'users',
    colores: ['#4f46e5', '#312e81'],
    etiquetas: 'amigos conocer preguntas cotidiano sinceridad votar deducir parejas',
    descripcion: 'Responded a preguntas cotidianas y adivinad qué escribió cada compañero. ¡Descubre quién te conoce de verdad a 15 rondas!',
    categorias: ['favoritos', 'chill']
  },
  'ciegas': {
    titulo: 'Top a Ciegas',
    icono: 'eyeoff',
    colores: ['#f59e0b', '#b45309'],
    etiquetas: 'ranking ordenar ciegas votar puntuar orden',
    descripcion: 'Ordena de 1 a 5 cada elemento sin saber qué saldrá después. Los rivales votan cuántos has acertado.',
    categorias: ['chill']
  },
  'unoadiez': {
    titulo: 'Del 1 al 10...',
    icono: 'target',
    colores: ['#8b5cf6', '#b91c1c'],
    etiquetas: 'numero conocer amigos pareja ranking',
    descripcion: 'Adivina el número secreto del 1 al 10 guiándote por las pistas y opiniones de tus amigos. ¡El que menos puntos sume gana!',
    categorias: ['chill', 'dos_jugadores']
  },
  'quienmas': {
    titulo: '¿De verdad os conocéis?',
    icono: 'users',
    colores: ['#f43f5e', '#be123c'],
    etiquetas: 'amigos votar votacion preguntas picantes grupo conocer',
    descripcion: 'Votad quién encaja más con preguntas comprometidas o divertidas. Si votas al más votado te llevas punto, pero si hay empate... ¡cero puntos para todos!',
    categorias: ['chill']
  },
  'telepatia': {
    titulo: 'Telepatía',
    icono: 'zap',
    colores: ['#84cc16', '#4d7c0f'],
    etiquetas: 'telepatia azar coincidir amigos conocerse',
    descripcion: 'Pensad la misma palabra a la vez. ¡Conectad vuestras mentes y aumentad la racha de coincidencias consecutivas!',
    categorias: ['chill']
  },
  'confianzaciega': {
    titulo: 'Confianza Ciega',
    icono: 'dice',
    colores: ['#14b8a6', '#0f766e'],
    etiquetas: 'apuesta apostar consigna retos amigos 2 minutos',
    descripcion: 'Elige una consigna en secreto, deja que tus amigos apuesten a ciegas sobre tu capacidad y demuestra cuántas puedes decir en 2 minutos.',
    categorias: ['chill']
  },
  'popular': {
    titulo: 'Sigue la moda',
    icono: 'flame',
    colores: ['#fb923c', '#dc2626'],
    etiquetas: 'popular mayoria top 5 tendencia moda categorias encuesta',
    descripcion: '¿Qué es lo que respondería la mayoría? Adivina los 5 elementos más populares de cada categoría y suma desde 1 hasta 5 puntos por acierto.',
    categorias: ['chill', 'dos_jugadores']
  }
};

export const META_POR_DEFECTO = {
  icono: 'star',
  colores: ['#8b5cf6', '#6366f1'],
  etiquetas: '',
  descripcion: '',
  categorias: ['chill']
};

export const metaDe = (id) => META[id] ?? META_POR_DEFECTO;