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

// Cada uno de los 36 minijuegos tiene un icono único y una combinación de colores (degradado) única
export const META = {
  'bingoball': {
    titulo: 'Bingoball',
    imagen: '/covers/bingoball.webp',
    icono: 'bingocard',
    colores: ['#2563eb', '#0f172a'],
    etiquetas: 'futbol bingo cartones jugadores categorias online',
    descripcion: 'Rellena tu cartón de 4x3 relacionando futbolistas con categorías. Canta líneas y consigue el Bingo antes que nadie.',
    categorias: ['favoritos', 'futbol', 'chill']
  },
  'trayectoria': {
    titulo: 'Modo carrera',
    imagen: '/covers/trayectoria.webp',
    icono: 'careerpath',
    colores: ['#22c55e', '#14532d'],
    etiquetas: 'futbol futbolista clubes deportes equipos jugador',
    descripcion: 'Descubre al deportista a través de los clubes en los que jugó.',
    categorias: ['futbol', 'prueba', 'dos_jugadores']
  },
  'traiciones': {
    titulo: 'Traiciones',
    imagen: '/covers/traiciones.webp',
    icono: 'dagger',
    colores: ['#d97706', '#451a03'],
    etiquetas: 'traidores caravana desierto sabotaje mafia deduccion engano coartada votar roles online',
    descripcion: 'Una caravana cruza el desierto hacia el Oasis, pero hay traidores entre vosotros. Cumple tus tareas, vigila tus espaldas y descubre quién miente antes de que sea tarde.',
    categorias: ['favoritos', 'estrategia']
  },
  'fundadores': {
    titulo: 'Fundadores',
    imagen: '/covers/fundadores.webp',
    icono: 'landmark',
    colores: ['#ea580c', '#7c2d12'],
    etiquetas: 'pueblo construir oficios roles ocultos estrategia cartas edificios eleccion secreta online',
    descripcion: 'Levantad juntos un pueblo. Elige en secreto tu oficio cada ronda, adivina qué harán los demás y consigue el mejor barrio antes de que se inaugure.',
    categorias: ['favoritos', 'estrategia']
  },
  'coleccion': {
    titulo: 'Colecciona con cabeza',
    imagen: '/covers/coleccion.webp',
    icono: 'cards',
    colores: ['#06b6d4', '#1e40af'],
    etiquetas: 'cartas azar coleccion estrategia numeros baraja',
    descripcion: 'Consigue 5 cartas del mismo tipo antes que el resto. ¡Pero cuidado! Si acumulas 5 tipos distintos, quedarás eliminado.',
    categorias: ['favoritos', 'estrategia']
  },
  'cuentas': {
    titulo: 'Lleva la cuenta',
    imagen: '/covers/cuentas.webp',
    icono: 'numcards',
    colores: ['#38bdf8', '#0369a1'],
    etiquetas: 'numeros orden cartas mayor menor cuenta deduccion cartas accion',
    descripcion: 'Colocad los números del 1 al 100 de menor a mayor sin conocer las cartas de los demás. Gestiona cartas de acción y sé el primero en vaciar tu mano.',
    categorias: ['estrategia', 'dos_jugadores']
  },
  'descarte': {
    titulo: '¡Descarta y Elimina!',
    imagen: '/covers/descarte.webp',
    icono: 'x',
    colores: ['#f43f5e', '#881337'],
    etiquetas: 'palabra ingenio velocidad letras categorias',
    descripcion: 'Elige categoría, di una palabra que empiece por una letra libre antes de 30s y elimínala del abecedario. ¡Sobrevive a 5 tableros!',
    categorias: ['dos_jugadores', 'prueba']
  },
  'lobos': {
    titulo: 'Luna de Sangre',
    imagen: '/covers/lobos.webp',
    icono: 'moon',
    colores: ['#dc2626', '#1e1b4b'],
    etiquetas: 'hombres lobo roles pueblo noche narrador mafia',
    descripcion: 'Lobos contra pueblo, con roles inéditos y caos. De 8 a 12 jugadores, pasándoos el dispositivo.',
    categorias: ['favoritos', 'estrategia']
  },
  'impostor': {
    titulo: 'Miente como puedas',
    imagen: '/covers/impostor.webp',
    icono: 'mask',
    colores: ['#9333ea', '#3b0764'],
    etiquetas: 'impostor mentir engano restriccion hablar sospechoso',
    descripcion: 'Descubre al impostor antes de que se salga con la suya, pero ojo a la restricción que todos debéis cumplir al hablar.',
    categorias: ['chill']
  },
  'conecta': {
    titulo: 'Conecta 4',
    imagen: '/covers/conecta.webp',
    icono: 'connect',
    colores: ['#0284c7', '#1e3a8a'],
    etiquetas: 'conexiones grupos 16 elementos palabras relacionar',
    descripcion: 'Encuentra las 4 conexiones secretas entre los 16 elementos del tablero antes de quedarte sin vidas.',
    categorias: ['prueba', 'futbol']
  },
  'buscaminas': {
    titulo: 'Cuidado que explota',
    imagen: '/covers/buscaminas.webp',
    icono: 'bomb',
    colores: ['#64748b', '#090d16'],
    etiquetas: 'minas bombas casillas explota tablero suerte',
    descripcion: 'Un tablero de 15 casillas con 10 aciertos y 5 bombas ocultas. Elige por turnos, suma puntos según la dificultad y evita pisar la mina para no quedar eliminado de la ronda.',
    categorias: ['prueba', 'futbol']
  },
  'quien-es-quien': {
    titulo: '¿Sabes quién soy?',
    imagen: '/covers/quienesquien.webp',
    icono: 'whois',
    colores: ['#3b82f6', '#6d28d9'],
    etiquetas: 'personajes adivinar descartar rasgos clasico tablero preguntas',
    descripcion: 'Adivina el personaje secreto descartando rasgos antes que tus rivales.',
    categorias: ['favoritos', 'famosos', 'chill']
  },
  'rasgos': {
    titulo: 'El paparazzi',
    imagen: '/covers/rasgos.webp',
    icono: 'zoomface',
    colores: ['#f97316', '#9a3412'],
    etiquetas: 'famosos cara facciones zoom foto celebridades',
    descripcion: 'Reconoce al famoso descubriendo sus facciones paso a paso.',
    categorias: ['famosos', 'chill']
  },
  'adivina': {
    titulo: 'Luces, Cámara... ¡Música!',
    imagen: '/covers/adivina.webp',
    icono: 'clapperboard',
    colores: ['#ec4899', '#831843'],
    etiquetas: 'peliculas cine canciones musica actores frases audio',
    descripcion: 'Identifica la película o la canción con frases, fragmentos de audio de 20s y actores.',
    categorias: ['famosos', 'chill']
  },
  'cancion': {
    titulo: 'Afina ese oído',
    imagen: '/covers/cancion.webp',
    icono: 'music',
    colores: ['#a3e635', '#15803d'],
    etiquetas: 'musica canciones escuchar oido volumen adivinar tema',
    descripcion: 'Escucha la canción subiendo gradualmente de volumen. Pulsa el botón antes de los 30 segundos para adivinar el tema y sumar tantos puntos como segundos queden.',
    categorias: ['chill']
  },
  'frasescelebres': {
    titulo: 'Frases Célebres',
    imagen: '/covers/frasescelebres.webp',
    icono: 'quote',
    colores: ['#06b6d4', '#164e63'],
    etiquetas: 'citas autor quien dijo historia politica deporte famosos',
    descripcion: '¿Quién dijo qué? Adivina el autor de las frases más recordadas de la historia, la política, el deporte y el famoseo.',
    categorias: ['famosos', 'chill']
  },
  'colores': {
    titulo: 'La vida en colores',
    imagen: '/covers/colores.webp',
    icono: 'palette',
    colores: ['#f472b6', '#f59e0b'],
    etiquetas: 'colores marcas personajes logos combinacion',
    descripcion: 'Adivina la combinación exacta de colores de personajes, marcas y cosas míticas que todo el mundo ha visto.',
    categorias: ['favoritos', 'chill']
  },
  'siglas': {
    titulo: 'D.E.S.C.I.F.R.A',
    imagen: '/covers/siglas.webp',
    icono: 'letters',
    colores: ['#6366f1', '#312e81'],
    etiquetas: 'siglas acronimos significado palabras cultura general',
    descripcion: 'Averigua el significado real de las siglas más conocidas.',
    categorias: ['prueba', 'dos_jugadores']
  },
  'rankings': {
    titulo: 'Ranking oculto',
    imagen: '/covers/rankings.webp',
    icono: 'podium',
    colores: ['#facc15', '#a16207'],
    etiquetas: 'ranking ordenar puestos clasificacion mayor menor top',
    descripcion: 'Ordena de mayor a menor elementos de cultura, ciencia, cine y deportes.',
    categorias: ['prueba', 'favoritos']
  },
  'aproximacion': {
    titulo: 'Aproxímate',
    imagen: '/covers/aproximacion.webp',
    icono: 'target',
    colores: ['#8b5cf6', '#4c1d95'],
    etiquetas: 'numeros cifras calcular estimar aproximar cantidad',
    descripcion: 'Atrévete a calcular cifras astronómicas y llévate los puntos por ser el más cercano.',
    categorias: ['prueba', 'favoritos']
  },
  'velocidad': {
    titulo: 'Minuto de Infarto',
    imagen: '/covers/velocidad.webp',
    icono: 'stopwatch',
    colores: ['#84cc16', '#365314'],
    etiquetas: 'contrarreloj rapido 60 segundos preguntas tiempo test',
    descripcion: '60 segundos de adrenalina pura. Acierta a contrarreloj y supera la pregunta especial.',
    categorias: ['prueba', 'dos_jugadores']
  },
  'rapidfire': {
    titulo: 'Rápido y certero',
    imagen: '/covers/rapidfire.webp',
    icono: 'zap',
    colores: ['#ef4444', '#7f1d1d'],
    etiquetas: 'retos categorias cronometro rebote rapido 60 segundos',
    descripcion: 'Retos de 60 segundos por categoría: di todos los elementos antes de que se acabe el tiempo o pasa el rebote.',
    categorias: ['prueba', 'chill', 'dos_jugadores']
  },
  'pistas': {
    titulo: 'No seas des(pista)do',
    imagen: '/covers/pistas.webp',
    icono: 'sleuth',
    colores: ['#475569', '#1e293b'],
    etiquetas: 'detective enigma misterio pistas vidas adivinar',
    descripcion: 'Resuelve el enigma con 6 pistas progresivas. Juega por puntos o sobrevive con 3 vidas.',
    categorias: ['prueba', 'chill']
  },
  'ubicacion': {
    titulo: 'Test del viajero',
    imagen: '/covers/ubicacion.webp',
    icono: 'pin',
    colores: ['#10b981', '#064e3b'],
    etiquetas: 'mapa lugares monumentos geografia mundo foto',
    descripcion: 'Ubica monumentos y lugares en el mapa mundial esquivando los señuelos de los demás.',
    categorias: ['prueba', 'favoritos']
  },
  'masmenos': {
    titulo: 'Entre dos aguas',
    imagen: '/covers/masmenos.webp',
    icono: 'scale',
    colores: ['#3b82f6', '#1d4ed8'],
    etiquetas: 'comparar mayor menor datos numericos racha',
    descripcion: 'Compara dos datos numéricos frente a frente y elige el más grande para encadenar la racha de aciertos más larga.',
    categorias: ['prueba', 'dos_jugadores']
  },
  'conoce': {
    titulo: 'Conoce a tus amigos',
    imagen: '/covers/conoce.webp',
    icono: 'heartchat',
    colores: ['#818cf8', '#3730a3'],
    etiquetas: 'amigos conocer preguntas cotidiano sinceridad votar deducir parejas',
    descripcion: 'Responded a preguntas cotidianas y adivinad qué escribió cada compañero. ¡Descubre quién te conoce de verdad a 15 rondas!',
    categorias: ['favoritos', 'chill']
  },
  'ciegas': {
    titulo: 'Top a Ciegas',
    imagen: '/covers/ciegas.webp',
    icono: 'eyeoff',
    colores: ['#f59e0b', '#92400e'],
    etiquetas: 'ranking ordenar ciegas votar puntuar orden',
    descripcion: 'Ordena de 1 a 5 cada elemento sin saber qué saldrá después. Los rivales votan cuántos has acertado.',
    categorias: ['chill']
  },
  'unoadiez': {
    titulo: 'Del 1 al 10...',
    imagen: '/covers/unoadiez.webp',
    icono: 'dial10',
    colores: ['#c084fc', '#9d174d'],
    etiquetas: 'numero conocer amigos pareja ranking',
    descripcion: 'Adivina el número secreto del 1 al 10 guiándote por las pistas y opiniones de tus amigos. ¡El que menos puntos sume gana!',
    categorias: ['chill', 'dos_jugadores']
  },
  'quienmas': {
    titulo: '¿De verdad os conocéis?',
    imagen: '/covers/quienmas.webp',
    icono: 'users',
    colores: ['#fb7185', '#be123c'],
    etiquetas: 'amigos votar votacion preguntas picantes grupo conocer',
    descripcion: 'Votad quién encaja más con preguntas comprometidas o divertidas. Si votas al más votado te llevas punto, pero si hay empate... ¡cero puntos para todos!',
    categorias: ['chill']
  },
  'telepatia': {
    titulo: 'Telepatía',
    imagen: '/covers/telepatia.webp',
    icono: 'telepathy',
    colores: ['#2dd4bf', '#115e59'],
    etiquetas: 'telepatia azar coincidir amigos conocerse',
    descripcion: 'Pensad la misma palabra a la vez. ¡Conectad vuestras mentes y aumentad la racha de coincidencias consecutivas!',
    categorias: ['chill']
  },
  'confianzaciega': {
    titulo: 'Confianza Ciega',
    imagen: '/covers/confianzaciega.webp',
    icono: 'dice',
    colores: ['#14b8a6', '#0f766e'],
    etiquetas: 'apuesta apostar consigna retos amigos 2 minutos',
    descripcion: 'Elige una consigna en secreto, deja que tus amigos apuesten a ciegas sobre tu capacidad y demuestra cuántas puedes decir en 2 minutos.',
    categorias: ['chill']
  },
  'popular': {
    titulo: 'Sigue la moda',
    imagen: '/covers/popular.webp',
    icono: 'flame',
    colores: ['#fb923c', '#dc2626'],
    etiquetas: 'popular mayoria top 5 tendencia moda categorias encuesta',
    descripcion: '¿Qué es lo que respondería la mayoría? Adivina los 5 elementos más populares de cada categoría y suma desde 1 hasta 5 puntos por acierto.',
    categorias: ['chill', 'dos_jugadores']
  },
  'logos': {
    titulo: 'Logo Mania',
    imagen: '/covers/logos.webp',
    icono: 'logobadge',
    colores: ['#22d3ee', '#0284c7'],
    etiquetas: 'logos marcas empresas adivinar velocidad memoria simbolos',
    descripcion: 'Identifica la marca que se oculta tras el logo antes de que el cronómetro llegue a cero. Suma segundos al acertar y evita arriesgar si no estás seguro.',
    categorias: ['prueba', 'dos_jugadores']
  },
  'hipotesis': {
    titulo: 'La Hipótesis Ganadora',
    imagen: '/covers/hipotesis.webp',
    icono: 'bulb',
    colores: ['#60a5fa', '#1e3a8a'],
    etiquetas: 'hipotesis farol engano deduccion apostar laboratorio ciencia muestras mentir online',
    descripcion: 'Cada ronda el laboratorio esconde una verdad y tú solo conoces un trocito. Formula una hipótesis (cierta o de farol), apuesta por las de los demás y descubre quién miente.',
    categorias: ['favoritos', 'estrategia']
  },
  'trescientosuno': {
    titulo: '301 goles',
    imagen: '/covers/trescientosuno.webp',
    icono: 'goal301',
    colores: ['#34d399', '#047857'],
    etiquetas: 'futbol goles clubes goleadores asistencias partidos adivinar seleccion balon',
    descripcion: 'Llega al número objetivo de goles, asistencias o partidos y demuestra lo mucho que conoces al club escogido.',
    categorias: ['favoritos', 'futbol']
  },
  'jugadores': {
    titulo: '¿Con quién he jugado?',
    imagen: '/covers/jugadores.webp',
    icono: 'teammates',
    colores: ['#f97316', '#b91c1c'],
    etiquetas: 'futbol jugadores clubes compañero adivinar seleccion balon',
    descripcion: 'Sale una dupla de jugadores y tienes que encontrar un compañero común a ambos.',
    categorias: ['dos_jugadores', 'futbol']
  },
  'furbo': {
    titulo: 'Furbo!',
    imagen: '/covers/furbo.webp',
    icono: 'soccer',
    colores: ['#4ade80', '#166534'],
    etiquetas: 'futbol jugadores quiz clubes adivinar seleccion balon',
    descripcion: 'La prueba definitiva para poner a prueba tus conocimientos sobre fútbol. Explora las diversas categorías de este juego y humíllalos a todos!',
    categorias: ['favoritos', 'chill', 'futbol']
  },
  'futbolgrid': {
    titulo: 'Fútbol en raya',
    imagen: '/covers/futbolgrid.webp',
    icono: 'futbolgrid',
    colores: ['#a855f7', '#b91c1c'],
    etiquetas: 'futbol jugadores quiz clubes adivinar seleccion balon',
    descripcion: 'Cuadra categorías que cumplan tus jugadores y crea una línea completa con ellos antes que tu rival. Para jugar individual o por equipos.',
    categorias: ['favoritos', 'dos_jugadores', 'futbol']
  },
  'footballsplit': {
    titulo: 'FrankensFootball',
    imagen: '/covers/footballsplit.webp',
    icono: 'frankenstein',
    colores: ['#818cf8', '#0f172a'],
    etiquetas: 'futbol jugadores quiz clubes adivinar seleccion balon cara cabeza cuerpo',
    descripcion: 'Adivina de qué tres jugadores viene el híbrido que vas a ver por pantalla. Si eres buen futbolero lo sabrás a la primera, si no siempre puedes acudir a las pistas.',
    categorias: ['favoritos', 'dos_jugadores', 'futbol']
  },
  'jugadas': {
    titulo: '¡Qué jugadón!',
    imagen: '/covers/jugadas.webp',
    icono: 'tacticboard',
    colores: ['#fbbf24', '#b45309'],
    etiquetas: 'futbol jugadas quiz campo adivinar dorsales balon gol jugadon',
    descripcion: 'Pon a prueba tu conocimiento futbolístico sobre el campo y averigua qué jugada se está recreando en cada momento.',
    categorias: ['favoritos', 'dos_jugadores', 'futbol']
  },
  'cuatroclubes': {
    titulo: 'El club de los cuatro',
    imagen: '/covers/cuatroclubes.webp',
    icono: 'fourshields',
    colores: ['#e879f9', '#9d174d'],
    etiquetas: 'futbol clubes quiz enlazar jugadores trayectoria balon gol',
    descripcion: 'Cuatro clubes, un jugador. Decide qué jugador encaja en el mayor número posible de esos cuatro y a ver si consigues el pleno!',
    categorias: ['dos_jugadores', 'futbol']
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