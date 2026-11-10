// client/src/games/meta.js

// Categorías temáticas de la portada
export const CATEGORIAS_PORTADA = [
  { id: 'favoritos', titulo: '⭐ Favoritos del Creador', desc: 'Los juegos más destacados, adictivos y jugados' },
  { id: 'prueba', titulo: '🧠 Para ponerte a prueba', desc: 'Retos de ingenio, cultura, velocidad y memoria' },
  { id: 'estrategia', titulo: '♟️ Estratégicos y de deducción', desc: 'Roles ocultos, engaños, gestión de cartas y táctica' },
  { id: 'chill', titulo: '🌴 Para jugar de chill', desc: 'Risas, amigos, preguntas y pura diversión sin estrés' },
  { id: 'futbol', titulo: '⚽ Para amantes del fútbol', desc: 'Demuestra todo lo que sabes sobre el deporte rey' },
  { id: 'famosos', titulo: '🌟 De famosos y cultura pop', desc: 'Celebridades, cine, música, frases y televisión' },
  { id: 'dos_jugadores', titulo: '👥 Para dos jugadores', desc: 'Ideales para competir o cooperar frente a frente' },
  { id: 'un_jugador', titulo: '🎯 Para un jugador', desc: 'Retos en solitario: lógica, memoria, estrategia y reflejos' }
];

// Cada uno de los minijuegos tiene un icono único y una combinación de colores (degradado) única
export const META = {
  'bingoball': {
    titulo: 'Bingoball',
    imagen: '/covers/bingoball.webp',
    icono: 'bingocard',
    colores: ['#2563eb', '#0f172a'],
    etiquetas: 'futbol bingo cartones jugadores categorias online',
    descripcion: 'Una versión del bingo clásico pero con futbolistas. Coloca a los futbolistas en las categorias que encajen según vayan saliendo y completa el tablero antes que nadie.',
    categorias: ['futbol']
  },
  'trayectoria': {
    titulo: 'Modo carrera',
    imagen: '/covers/trayectoria.webp',
    icono: 'careerpath',
    colores: ['#22c55e', '#14532d'],
    etiquetas: 'futbol futbolista clubes deportes equipos jugador',
    descripcion: 'Descubre al futbolista a través de los clubes en los que jugó durante su carrera. Cuantos menos clubes necesites, más puntos obtendrás.',
    categorias: ['futbol']
  },
  'traiciones': {
    titulo: 'Traiciones',
    imagen: '/covers/traiciones.webp',
    icono: 'dagger',
    colores: ['#d97706', '#451a03'],
    etiquetas: 'traidores caravana desierto sabotaje mafia deduccion engano coartada votar roles online',
    descripcion: 'Una caravana cruza el desierto hacia el Oasis, dos bandos: buenos y traidores. Los buenos deben completar misiones para llegar al objetivo, los traidores deben sabotear y matar a todos sin ser descubiertos.',
    categorias: ['estrategia', 'favoritos']
  },
  'fundadores': {
    titulo: 'Fundadores',
    imagen: '/covers/fundadores.webp',
    icono: 'landmark',
    colores: ['#ea580c', '#7c2d12'],
    etiquetas: 'pueblo construir oficios roles ocultos estrategia cartas edificios eleccion secreta online',
    descripcion: 'Cada fundador levanta su propio pueblo con monedas y planos. Cada ronda eliges en secreto uno de los oficios que quedan: cobrar, sabotear, construir más o llevarte la prioridad. Quien levante el mejor pueblo gana.',
    categorias: ['estrategia']
  },
  'coleccion': {
    titulo: 'Colecciona con cabeza',
    imagen: '/covers/coleccion.webp',
    icono: 'cards',
    colores: ['#06b6d4', '#1e40af'],
    etiquetas: 'cartas azar coleccion estrategia numeros baraja',
    descripcion: 'Cada uno tiene un encargo secreto: la colección que debe reunir antes que nadie. Puede que otro vaya a por la misma sin que lo sepas. Roba, bombardea, espía, cambia encargos y arriésgate con las cartas de acción.',
    categorias: ['estrategia']
  },
  'golpe': {
    titulo: 'El Golpe',
    imagen: '/covers/golpe.webp',
    icono: 'lock',
    colores: ['#fbbf24', '#1c1917'],
    etiquetas: 'golpe atraco robo plan traidor objetivos secretos debate votar engano online',
    descripcion: 'Toda la banda participa en el mismo golpe, pero cada uno conoce solo parte de la información y tiene un objetivo secreto… y no todos quieren que salga bien. Propón un plan, convence a los demás, detecta faroles y descubre al traidor.',
    categorias: ['estrategia']
  },
  'sumacero': {
    titulo: 'Suma Cero',
    imagen: '/covers/sumacero.webp',
    icono: 'scale',
    colores: ['#a78bfa', '#312e81'],
    etiquetas: 'cartas numeros suma cero sabotaje plantarse online',
    descripcion: 'Empiezas con 5 cartas positivas y negativas: consigue que tu mano sume exactamente 0. Roba, descarta, usa cartas especiales para fastidiar al resto y plántate a tiempo… porque te pueden destrozar la mano justo antes del final.',
    categorias: ['estrategia']
  },
  'invento': {
    titulo: 'El Invento del Siglo',
    imagen: '/covers/invento.webp',
    icono: 'bulb',
    colores: ['#a78bfa', '#5b21b6'],
    etiquetas: 'inventos creatividad humor absurdo votar objeto problema teletienda risas',
    descripcion: 'Recibes un objeto, un problema y una característica absurda, y tienes que inventar un producto que combine los tres. Después todos votan qué invento comprarían, cuál es más absurdo y cuál triunfará.',
    categorias: ['chill']
  },
  'director': {
    titulo: 'Director Deportivo',
    imagen: '/covers/director.webp',
    icono: 'soccer',
    colores: ['#38bdf8', '#0c4a6e'],
    etiquetas: 'futbol fichajes mercado presupuesto plantilla manager liga tactica pujas',
    descripcion: 'Dirige un club con presupuesto limitado: puja en secreto por futbolistas reales, monta una plantilla equilibrada, elige táctica y compite en una liga simulada. No basta con fichar a los mejores.',
    categorias: ['futbol', 'estrategia']
  },
  'datosobra': {
    titulo: 'El Dato que Sobra',
    imagen: '/covers/datosobra.webp',
    icono: 'detective',
    colores: ['#f97316', '#431407'],
    etiquetas: 'dato sobra mentira verdad futbolista afirmaciones desafiar falsa trayectoria futbol',
    descripcion: 'Cuatro afirmaciones sobre un futbolista: tres son ciertas y una es mentira. Por turnos, uno la señala y los demás pueden desafiar su respuesta para ganar puntos extra.',
    categorias: ['futbol']
  },
  'pareja': {
    titulo: 'La Pareja Perfecta',
    imagen: '/covers/pareja.webp',
    icono: 'heart',
    colores: ['#ec4899', '#500724'],
    etiquetas: 'pareja relacionar actor pelicula inventor invento pais moneda personaje creador cantante grupo pintor cuadro',
    descripcion: 'Sale un actor, un inventor, un país, un personaje, un cantante o un pintor: encuentra su pareja entre cuatro opciones antes que nadie. La dificultad sube y los puntos se multiplican.',
    categorias: ['prueba']
  },
  'tablero': {
    titulo: 'El Tablero de Puntos',
    imagen: '/covers/tablero.webp',
    icono: 'target',
    colores: ['#8b5cf6', '#1e1b4b'],
    etiquetas: 'tablero puntos casillas preguntas cultura general cine historia ciencia musica deporte geografia arriesgar',
    descripcion: 'Un tablero de preguntas de cultura general con casillas de 100, 200, 300 y 500 puntos. Elige cuánto arriesgas: si aciertas sumas y si fallas restas. Hay una casilla doble escondida.',
    categorias: ['prueba']
  },
  'hemeroteca': {
    titulo: 'La Hemeroteca',
    imagen: '/covers/hemeroteca.webp',
    icono: 'book',
    colores: ['#a8a29e',  '#292524'],
    etiquetas: 'hemeroteca titulares periodico noticias historia huecos pistas actualidad prensa',
    descripcion: 'Titulares históricos de periódico a los que les faltan palabras. Las pistas se destapan poco a poco (época, contexto, iniciales): cuanto antes completes el titular, más puntos.',
    categorias: ['prueba']
  },
  'acta': {
    titulo: 'Acta del Partido',
    imagen: '/covers/acta.webp',
    icono: 'edit',
    colores: ['#22c55e',  '#052e16'],
    etiquetas: 'acta partido futbol historico resultado goleadores tarjetas estadio minutos final',
    descripcion: 'Un partido histórico contado con su acta incompleta: resultados parciales, minutos clave, tarjetas, estadio y goleadores. Adivina de qué partido se trata antes que nadie.',
    categorias: ['futbol']
  },
  'oncefantasma': {
    titulo: 'El Once Fantasma',
    imagen: '/covers/oncefantasma.webp',
    icono: 'soccer',
    colores: ['#3b82f6',  '#0b1437'],
    etiquetas: 'once alineacion titular final historica futbolistas dorsal posicion entrenador pistas mundial champions',
    descripcion: 'La alineación oculta de una final histórica: reconstruye el once a partir del dorsal, la posición, el club o el país y la trayectoria. Cada futbolista que descubres destapa una pista de otro compañero.',
    categorias: ['futbol']
  },
  'unapieza': {
    titulo: 'Una Pieza Más',
    imagen: '/covers/unapieza.webp',
    icono: 'box',
    colores: ['#f59e0b',  '#78350f'],
    etiquetas: 'piezas tablero silueta figura encajar tetris puzle geometria turnos bloquear objetivo',
    descripcion: 'Un tablero compartido con una figura incompleta. Por turnos, cada jugador coloca una pieza geométrica (girándola o volteándola): cierra filas, cumple tu objetivo secreto, pon la última pieza o deja al siguiente sin sitio.',
    categorias: ['estrategia']
  },
  'laberinto': {
    titulo: 'El Laberinto',
    imagen: '/covers/laberinto.webp',
    icono: 'key',
    colores: ['#2dd4bf', '#134e4a'],
    etiquetas: 'laberinto tablero explorar tesoro trampas llaves personajes robar escapar mazmorra',
    descripcion: 'Un laberinto de salas que se descubren poco a poco, con trampas, tesoros y puertas cerradas. Cada jugador tiene un personaje con habilidades distintas: roba, deja trampas, bloquea pasillos y escapa con el tesoro antes que nadie.',
    categorias: ['estrategia']
  },
  'mus': {
    titulo: 'Mus',
    imagen: '/covers/mus.webp',
    icono: 'cards',
    colores: ['#16a34a', '#14532d'],
    etiquetas: 'mus cartas baraja española parejas envido ordago grande chica pares juego clasico bar',
    descripcion: 'El clásico juego de cartas español por parejas: mus o no hay mus, envites a grande, chica, pares y juego, faroles y órdagos. Juega online con tus amigos o contra la máquina.',
    categorias: ['estrategia', 'favoritos']
  },
  'reinos': {
    titulo: 'Los Siete Reinos',
    imagen: '/covers/reinos.webp',
    icono: 'shield',
    colores: ['#b45309', '#451a03'],
    etiquetas: 'reinos estrategia conquista territorios mapa diplomacia alianzas traicion comercio oro soldados simultaneo',
    descripcion: 'Cada jugador gobierna un reino con territorios, soldados, oro y alimento. Cada ronda das dos órdenes en secreto: conquistar, comerciar, fortificar, entrenar tropas o negociar alianzas, y todas se resuelven a la vez. Controla los tronos y cumple tus objetivos secretos… sin fiarte de nadie.',
    categorias: ['estrategia']
  },
  'cuentas': {
    titulo: 'Lleva la cuenta',
    imagen: '/covers/cuentas.webp',
    icono: 'numcards',
    colores: ['#38bdf8', '#0369a1'],
    etiquetas: 'numeros orden cartas mayor menor cuenta deduccion cartas accion',
    descripcion: 'Colocad números del 1 al 100 en orden ascendente sin comunicaros. En tu turno sueltas un número, usas una carta de acción al azar o pasas. Si sueltas uno que no tocaba o retienes el que tocaba, pierdes una vida. Gana quien se quede antes sin números.',
    categorias: ['estrategia']
  },
  'descarte': {
    titulo: '¡Descarta y Elimina!',
    imagen: '/covers/descarte.webp',
    icono: 'x',
    colores: ['#f43f5e', '#881337'],
    etiquetas: 'palabra ingenio velocidad letras categorias',
    descripcion: 'El retador elige rival y una de tres categorías; el rival tiene 30 segundos para decir una palabra que empiece por una letra que siga en el tablero. Cada acierto elimina su letra y suma 1, 2 o 3 puntos. Online, el anfitrión valida cada respuesta.',
    categorias: ['prueba']
  },
  'lobos': {
    titulo: 'Luna de Sangre',
    imagen: '/covers/lobos.webp',
    icono: 'moon',
    colores: ['#dc2626', '#1e1b4b'],
    etiquetas: 'hombres lobo roles pueblo noche narrador mafia',
    descripcion: 'Lobos contra el pueblo, con multitud de rol y caos infinito. El pueblo trata de destapar a los lobos, mientras que los lobos van matando al pueblo en secreto. ¡Descúbrelos antes de ser cazado!',
    categorias: ['estrategia', 'favoritos']
  },
  'impostor': {
    titulo: 'Miente como puedas',
    imagen: '/covers/impostor.webp',
    icono: 'mask',
    colores: ['#9333ea', '#3b0764'],
    etiquetas: 'impostor mentir engano restriccion hablar sospechoso',
    descripcion: 'Una palabra, un impostor que trata de engañar a los demás. Descubrid al impostor antes de que consiga que expulséis a un inocente en su lugar.',
    categorias: ['chill']
  },
  'conecta': {
    titulo: 'Conecta 4',
    imagen: '/covers/conecta.webp',
    icono: 'connect',
    colores: ['#0284c7', '#1e3a8a'],
    etiquetas: 'conexiones grupos 16 elementos palabras relacionar',
    descripcion: 'Encuentra las 4 conexiones que existen entre los 16 elementos del tablero (de 4 en 4). Descubre qué conexión les une y gana puntos extra.',
    categorias: ['prueba', 'favoritos']
  },
  'buscaminas': {
    titulo: 'Cuidado que explota',
    imagen: '/covers/buscaminas.webp',
    icono: 'bomb',
    colores: ['#64748b', '#090d16'],
    etiquetas: 'minas bombas casillas explota tablero suerte',
    descripcion: 'Un tablero, 10 respuestas correctas y 5 bombas. Elige una respuesta y evita topar con una de las bombas para no quedar eliminado de la ronda.',
    categorias: ['prueba', 'favoritos']
  },
  'quien-es-quien': {
    titulo: '¿Sabes quién soy?',
    imagen: '/covers/quienesquien.webp',
    icono: 'whois',
    colores: ['#3b82f6', '#6d28d9'],
    etiquetas: 'personajes adivinar descartar rasgos clasico tablero preguntas',
    descripcion: 'Una categoría conjunta, un elemento a adivinar para cada uno de los jugadores. Cada jugador sabe el elemento de todos los demás menos el suyo. Adivina tu elemento antes que nadie haciendo preguntas de \'sí\' o \'no\'.',
    categorias: ['famosos', 'favoritos']
  },
  'rasgos': {
    titulo: 'El paparazzi',
    imagen: '/covers/rasgos.webp',
    icono: 'zoomface',
    colores: ['#f97316', '#9a3412'],
    etiquetas: 'famosos cara facciones zoom foto celebridades',
    descripcion: 'Reconoce a una persona famosa a través de un recorte que muestra uno de sus rasgos característicos. Pon a prueba tu conocimiento y fíjate en los pequeños detalles.',
    categorias: ['famosos']
  },
  'adivina': {
    titulo: 'Luces, Cámara... ¡Música!',
    imagen: '/covers/adivina.webp',
    icono: 'clapperboard',
    colores: ['#ec4899', '#831843'],
    etiquetas: 'peliculas cine canciones musica actores frases audio',
    descripcion: 'Adivina películas o canciones a través de una serie de pistas. Presta atención a las pistas, tales como actores o genero en caso de películas, cantante o reproducción en caso de canciones. Cuantas menos pistas necesites, más puntos te llevarás.',
    categorias: ['famosos']
  },
  'cancion': {
    titulo: 'Afina ese oído',
    imagen: '/covers/cancion.webp',
    icono: 'music',
    colores: ['#a3e635', '#15803d'],
    etiquetas: 'musica canciones escuchar oido volumen adivinar tema',
    descripcion: 'Adivina una canción mediante su reproducción. La canción aumenta progresivamente de volumen, cuanto antes aciertes, más puntos podrás conseguir.',
    categorias: ['famosos', 'favoritos']
  },
  'frasescelebres': {
    titulo: 'Frases Célebres',
    imagen: '/covers/frasescelebres.webp',
    icono: 'quote',
    colores: ['#06b6d4', '#164e63'],
    etiquetas: 'citas autor quien dijo historia politica deporte famosos',
    descripcion: '¿Quién dijo qué? Adivina el autor de las frases más recordadas de la historia, la política, el deporte y el famoseo.',
    categorias: ['famosos']
  },
  'colores': {
    titulo: 'La vida en colores',
    imagen: '/covers/colores.webp',
    icono: 'palette',
    colores: ['#f472b6', '#f59e0b'],
    etiquetas: 'colores marcas personajes logos combinacion',
    descripcion: 'Algo que todo el mundo conoce, once colores disponibles. Adivina la combinación de colores presente en cada elemento.',
    categorias: ['chill', 'favoritos']
  },
  'siglas': {
    titulo: 'D.E.S.C.I.F.R.A',
    imagen: '/covers/siglas.webp',
    icono: 'letters',
    colores: ['#6366f1', '#312e81'],
    etiquetas: 'siglas acronimos significado palabras cultura general',
    descripcion: 'Adivina el significado real de las siglas y acrónimos más conocidos del mundo. No falles y supera tu propio récord.',
    categorias: ['dos_jugadores']
  },
  'rankings': {
    titulo: 'Ranking oculto',
    imagen: '/covers/rankings.webp',
    icono: 'podium',
    colores: ['#facc15', '#a16207'],
    etiquetas: 'ranking ordenar puestos clasificacion mayor menor top',
    descripcion: 'Para los amantes de los rankings. Un ranking real de 5 elementos con 2 de ellos ocultos aleatoriamente. Descubre los elementos que falten y completa el ranking. Podrás acceder a las pistas si no te ves capaz.',
    categorias: ['prueba']
  },
  'aproximacion': {
    titulo: 'Aproxímate',
    imagen: '/covers/aproximacion.webp',
    icono: 'target',
    colores: ['#8b5cf6', '#4c1d95'],
    etiquetas: 'numeros cifras calcular estimar aproximar cantidad',
    descripcion: 'Una pregunta, una respuesta numérica. Trata de clavar la respuesta o aproximarte lo máximo posible a ello. Si no te atreves, confía en la respuesta de otro rival. Cuanto más te arriesgues más ganarás, pero más perderás en caso de fallo.',
    categorias: ['chill']
  },
  'velocidad': {
    titulo: 'Minuto de Infarto',
    imagen: '/covers/velocidad.webp',
    icono: 'stopwatch',
    colores: ['#84cc16', '#365314'],
    etiquetas: 'contrarreloj rapido 60 segundos preguntas tiempo test',
    descripcion: 'Acierta todas las respuetas que puedas en 60 segundos. Sé el que más aciertos haya conseguido al finalizar el crono. Aprovecha la pregunta especial de mitad de ronda para sumar otros 30s extra.',
    categorias: ['dos_jugadores']
  },
  'rapidfire': {
    titulo: 'Rápido y certero',
    imagen: '/covers/rapidfire.webp',
    icono: 'zap',
    colores: ['#ef4444', '#7f1d1d'],
    etiquetas: 'retos categorias cronometro rebote rapido 60 segundos',
    descripcion: 'Elige una categoría y enfréntate al reto de enumerar determinados elementos sobre ella. Dilos todos o le dejarás el rebote al siguiente jugador para que complete ¡y se lleve todos los puntos!',
    categorias: ['prueba']
  },
  'pistas': {
    titulo: 'No seas des(pista)do',
    imagen: '/covers/pistas.webp',
    icono: 'sleuth',
    colores: ['#475569', '#1e293b'],
    etiquetas: 'detective enigma misterio pistas vidas adivinar',
    descripcion: 'Recibe hasta seis pistas diferentes para adivinar un elemento cualquiera. Las pistas irán aumentando de calidad, pero cuantas menos necesites mejor para tu puntuación.',
    categorias: ['prueba']
  },
  'ubicacion': {
    titulo: 'Test del viajero',
    imagen: '/covers/ubicacion.webp',
    icono: 'pin',
    colores: ['#10b981', '#064e3b'],
    etiquetas: 'mapa lugares monumentos geografia mundo foto',
    descripcion: 'Sitúa en el mapa del mundo un lugar o monumento icónico que solo verás unos segundos. Cada kilómetro de error suma un punto y gana quien menos acumule. En un solo dispositivo, además, deja señuelos para engañar al siguiente jugador.',
    categorias: ['chill', 'favoritos']
  },
  'masmenos': {
    titulo: 'Entre dos aguas',
    imagen: '/covers/masmenos.webp',
    icono: 'scale',
    colores: ['#3b82f6', '#1d4ed8'],
    etiquetas: 'comparar mayor menor datos numericos racha',
    descripcion: 'Dos cantidades ocultas enfrentadas, elige la mayor de ellas. Si aciertas, una de las cantidades desaparecerá y será sustituida por otra. Encadena aciertos consecutivos y supera tu récord.',
    categorias: ['dos_jugadores']
  },
  'conoce': {
    titulo: 'Conoce a tus amigos',
    imagen: '/covers/conoce.webp',
    icono: 'heartchat',
    colores: ['#818cf8', '#3730a3'],
    etiquetas: 'amigos conocer preguntas cotidiano sinceridad votar deducir parejas',
    descripcion: 'Todos los jugadores responden a una pregunta común. Cuando todos responden, se muestran todas las respuestas y cada uno tendrá que adivinar las respuestas del resto de jugadores. ¿Cuánto conoces a tus amigos?',
    categorias: ['chill']
  },
  'ciegas': {
    titulo: 'Top a Ciegas',
    imagen: '/covers/ciegas.webp',
    icono: 'eyeoff',
    colores: ['#f59e0b', '#92400e'],
    etiquetas: 'ranking ordenar ciegas votar puntuar orden',
    descripcion: 'Coloca cinco elementos en orden de preferencia. Los elementos salen de uno en uno, por lo que tendrás que ir colocándolos sin saber qué viene detrás. ¡No te apresures y guárdate algún hueco para lo que pueda venir!',
    categorias: ['chill']
  },
  'unoadiez': {
    titulo: 'Del 1 al 10...',
    imagen: '/covers/unoadiez.webp',
    icono: 'dial10',
    colores: ['#c084fc', '#9d174d'],
    etiquetas: 'numero conocer amigos pareja ranking',
    descripcion: 'Adivina el número secreto del 1 al 10. Para ello tus compañeros opinarán sobre ciertas categorías dando ejemplos basados en ese número secreto. Guíate por tu intuición y los gustos de tus amigos, y acierta el número.',
    categorias: ['dos_jugadores']
  },
  'quienmas': {
    titulo: 'Quién es más...',
    imagen: '/covers/quienmas.webp',
    icono: 'users',
    colores: ['#fb7185', '#be123c'],
    etiquetas: 'amigos votar votacion preguntas picantes grupo conocer',
    descripcion: 'Preguntas del estilo Quién es más...? Elige al compañero que mejor encaje en la descripción y llévate los puntos si coincides con la mayoría. Si tu opción no es la más votada, te quedas sin puntos.',
    categorias: ['chill']
  },
  'telepatia': {
    titulo: 'Telepatía',
    imagen: '/covers/telepatia.webp',
    icono: 'telepathy',
    colores: ['#2dd4bf', '#115e59'],
    etiquetas: 'telepatia azar coincidir amigos conocerse',
    descripcion: 'Una palabra sale en la pantalla, di la primera palabra que se te ocurra sobre ella. Si coincides con la de otro jugador, sumaréis puntos; si coincidís varias veces, multiplicaréis vuestros puntos.',
    categorias: ['chill']
  },
  'confianzaciega': {
    titulo: 'Confianza Ciega',
    imagen: '/covers/confianzaciega.webp',
    icono: 'dice',
    colores: ['#14b8a6', '#0f766e'],
    etiquetas: 'apuesta apostar consigna retos amigos 2 minutos',
    descripcion: 'Dos categorías, un jugador selecciona una de las dos en secreto, el resto apuesta a los elementos que cree que podrá enumerar dicho jugador sobre la categoría elegida. ¡Demuestra lo que confías en tus compañeros y acierta tus apuestas!',
    categorias: ['chill']
  },
  'popular': {
    titulo: 'Sigue la moda',
    imagen: '/covers/popular.webp',
    icono: 'flame',
    colores: ['#fb923c', '#dc2626'],
    etiquetas: 'popular mayoria top 5 tendencia moda categorias encuesta',
    descripcion: 'Adivina las 5 cosas que más repsonde la gente sobre cuestiones típicas y cotidianas. Intenta averiguar primero las últimas, más difíciles pero más valiosas.',
    categorias: ['chill']
  },
  'logos': {
    titulo: 'Logo Mania',
    imagen: '/covers/logos.webp',
    icono: 'logobadge',
    colores: ['#22d3ee', '#0284c7'],
    etiquetas: 'logos marcas empresas adivinar velocidad memoria simbolos',
    descripcion: 'Identifica la marca que se oculta tras el logo antes de que el cronómetro llegue a cero. Suma segundos al acertar y evita arriesgar si no estás seguro.',
    categorias: ['dos_jugadores']
  },
  'hipotesis': {
    titulo: 'La Hipótesis Ganadora',
    imagen: '/covers/hipotesis.webp',
    icono: 'bulb',
    colores: ['#60a5fa', '#1e3a8a'],
    etiquetas: 'hipotesis farol engano deduccion apostar laboratorio ciencia muestras mentir online',
    descripcion: 'Cada ronda hay una verdad oculta y tú solo conoces un trocito. Formula una hipótesis, cierta o de farol, y después decide en qué hipótesis de los demás confías. Escenarios distintos y sorpresas en cada ronda.',
    categorias: ['estrategia']
  },
  'trescientosuno': {
    titulo: '301 goles',
    imagen: '/covers/trescientosuno.webp',
    icono: 'goal301',
    colores: ['#34d399', '#047857'],
    etiquetas: 'futbol goles clubes goleadores asistencias partidos adivinar seleccion balon',
    descripcion: 'Un club, un número objetivo y una estadística elegida (goles, asistencias o partidos). Di jugadores de ese club hasta llegar al número objetivo de la estadística elegida. Sé el primero en llegar a 0 o el que más cerca quede, pero ojo, no te pases de la cifra.',
    categorias: ['futbol', 'favoritos']
  },
  'jugadores': {
    titulo: '¿Con quién he jugado?',
    imagen: '/covers/jugadores.webp',
    icono: 'teammates',
    colores: ['#f97316', '#b91c1c'],
    etiquetas: 'futbol jugadores clubes compañero adivinar seleccion balon',
    descripcion: 'Dos jugadores, un tercero que los conecta. Descubre al jugador que haya jugado con los dos jugadores que aparezcan en pantalla en algún momento de su carrera. No tienen por qué haber jugado los tres juntos, pero él debe haber coincidido con los dos.',
    categorias: ['futbol']
  },
  'furbo': {
    titulo: 'Furbo!',
    imagen: '/covers/furbo.webp',
    icono: 'soccer',
    colores: ['#4ade80', '#166534'],
    etiquetas: 'futbol jugadores quiz clubes adivinar seleccion balon',
    descripcion: 'Un verdadero quiz de fútbol dividido en diversas fases. Calienta con el vestuario, ponte a punto con la quiniela o cierra el partido con los penaltis. No te desenganches de los primeros puestos y llega con opciones a la final.',
    categorias: ['futbol', 'favoritos']
  },
  'futbolgrid': {
    titulo: 'Fútbol en raya',
    imagen: '/covers/futbolgrid.webp',
    icono: 'futbolgrid',
    colores: ['#a855f7', '#b91c1c'],
    etiquetas: 'futbol jugadores quiz clubes adivinar seleccion balon',
    descripcion: 'El típico juego de tres en raya versión fútbol. Cada fila y cada columna marcan una categoría. Coloca jugadores que encajen en las categorías de la fila y columna de la casilla elegida, y haz tres en raya antes que tu rival.',
    categorias: ['futbol']
  },
  'footballsplit': {
    titulo: 'FrankensFootball',
    imagen: '/covers/footballsplit.webp',
    icono: 'frankenstein',
    colores: ['#818cf8', '#0f172a'],
    etiquetas: 'futbol jugadores quiz clubes adivinar seleccion balon cara cabeza cuerpo',
    descripcion: 'Una cara híbrida formada por tres partes de diferentes futbolistas (pelo, ojos y barbilla). Descubre a qué futbolista pertenece cada parte de la imagen antes de que acabe el tiempo.',
    categorias: ['futbol']
  },
  'jugadas': {
    titulo: '¡Qué jugadón!',
    imagen: '/covers/jugadas.webp',
    icono: 'tacticboard',
    colores: ['#fbbf24', '#b45309'],
    etiquetas: 'futbol jugadas quiz campo adivinar dorsales balon gol jugadon',
    descripcion: 'Un campo de fútbol en dos dimensiones con fichas de dos equipos y los dorsales reales de los jugadores. Descubre qué jugada icónica del fútbol se está recreando sobre ese campo y adelántate al resto.',
    categorias: ['futbol']
  },
  'cuatroclubes': {
    titulo: 'El club de los cuatro',
    imagen: '/covers/cuatroclubes.webp',
    icono: 'fourshields',
    colores: ['#e879f9', '#9d174d'],
    etiquetas: 'futbol clubes quiz enlazar jugadores trayectoria balon gol',
    descripcion: 'Cuatro clubes, un jugador. Decide qué jugador encaja en el mayor número posible de esos cuatro y a ver si consigues el pleno!',
    categorias: ['futbol']
  },
  'geoquiz': {
    titulo: 'GeoQuiz',
    imagen: '/covers/geoquiz.webp',
    icono: 'geoquiz',
    colores: ['#0ea5e9', '#047857'],
    etiquetas: 'geografia paises capitales fronteras idiomas banderas monumentos rios montañas mapas quiz trivial',
    descripcion: 'El quiz definitivo de geografía: capitales, fronteras, idiomas, banderas, ríos, monumentos y récords. Responde, enumera, ordena o deduce con pistas en cuatro modos de juego, ¡y demuestra quién conoce mejor el mundo!',
    categorias: ['prueba']
  },
  'verdaderofalso': {
    titulo: '¿Verdadero o falso? Exprés',
    imagen: '/covers/verdaderofalso.webp',
    icono: 'verdaderofalso',
    colores: ['#22c55e', '#be123c'],
    etiquetas: 'verdadero falso rapido mitos cultura general reflejos un jugador solitario racha',
    descripcion: 'Tres segundos por afirmación y el reloj nunca se detiene. ¿Verdadero o falso? Un solo fallo y se acabó: ¿hasta dónde llega tu racha?',
    categorias: ['un_jugador']
  },
  'pecera': {
    titulo: '¿Qué sobra en la pecera?',
    imagen: '/covers/pecera.webp',
    icono: 'pecera',
    colores: ['#67e8f9', '#1d4ed8'],
    etiquetas: 'intruso sobra criterio oculto trampa observacion cultura un jugador solitario',
    descripcion: 'Seis cosas en la pecera, cinco comparten un criterio secreto. Encuentra al intruso sin caer en la trampa: el que parece sobrar casi nunca es.',
    categorias: ['un_jugador']
  },
  'criptohacker': {
    titulo: 'Cripto-Hacker',
    imagen: '/covers/criptohacker.webp',
    icono: 'criptohacker',
    colores: ['#4ade80', '#020617'],
    etiquetas: 'codigo hacker deduccion mastermind rastreo logica servidores un jugador solitario',
    descripcion: 'Descifra el código de cada servidor con pura deducción antes de que el rastreo de seguridad llegue al 100 %. Cada intento te delata un poco más.',
    categorias: ['un_jugador']
  },
  'anomalias': {
    titulo: 'Inspector de Anomalías',
    imagen: '/covers/anomalias.webp',
    icono: 'anomalias',
    colores: ['#f59e0b', '#27272a'],
    etiquetas: 'camara vigilancia diferencias memoria observacion anomalia habitacion un jugador solitario',
    descripcion: 'Vigilas una habitación con una cámara fija. Memoriza la escena: cuando vuelva la señal, algo habrá cambiado. Tócalo antes de que acabe el tiempo.',
    categorias: ['un_jugador']
  },
  'trinchera': {
    titulo: 'Trinchera 1914',
    imagen: '/covers/trinchera.webp',
    icono: 'trinchera',
    colores: ['#a3a380', '#3f2d1c'],
    etiquetas: 'gestion recursos cartas decisiones moral guerra historia supervivencia un jugador solitario',
    descripcion: 'Invierno de 1914. Gestiona la moral, la comida, la munición y la salud de tu compañía decisión a decisión. ¿Llegaréis vivos a Navidad?',
    categorias: ['un_jugador']
  },
  'ovejas': {
    titulo: 'Cuenta Ovejas',
    imagen: '/covers/ovejas.webp',
    icono: 'ovejas',
    colores: ['#86efac', '#15803d'],
    etiquetas: 'contar animales rapidez percepcion granja ovejas memoria un jugador solitario',
    descripcion: 'Una manada cruza el prado a toda velocidad, con cerdos, cabras y arbustos que tapan. Al final te preguntamos cuántos de un tipo han pasado. ¡Cuenta rápido!',
    categorias: ['un_jugador']
  },
  'segundero': {
    titulo: 'El Segundero Interior',
    imagen: '/covers/segundero.webp',
    icono: 'segundero',
    colores: ['#38bdf8', '#312e81'],
    etiquetas: 'tiempo reloj cronometro segundos percepcion calculo un jugador solitario',
    descripcion: 'Para el reloj en el tiempo exacto… sin verlo. El contador se esconde enseguida y cada ronda trae una distracción nueva para engañar a tu reloj interno.',
    categorias: ['un_jugador']
  },
  'encadenada': {
    titulo: 'Palabra Encadenada',
    imagen: '/covers/encadenada.webp',
    icono: 'encadenada',
    colores: ['#fb7185', '#7e22ce'],
    etiquetas: 'palabras letras escalera vocabulario cambiar una letra puzle un jugador solitario',
    descripcion: 'De CASA a COLA cambiando una sola letra en cada paso, y cada paso tiene que ser una palabra de verdad. ¿Igualarás el camino más corto?',
    categorias: ['un_jugador']
  },
  'mapamentiroso': {
    titulo: 'El Mapa Mentiroso',
    imagen: '/covers/mapamentiroso.webp',
    icono: 'mapamentiroso',
    colores: ['#fbbf24', '#9a3412'],
    etiquetas: 'mapa orientacion brujula direcciones norte sur memoria espacial un jugador solitario',
    descripcion: 'Memoriza las indicaciones y señala dónde acabas. Pero ojo: a veces la brújula está girada y alguna indicación miente.',
    categorias: ['un_jugador']
  },
  'ordenalos': {
    titulo: 'Ordénalos sin mirar',
    imagen: '/covers/ordenalos.webp',
    icono: 'ordenalos',
    colores: ['#2dd4bf', '#1e3a8a'],
    etiquetas: 'ordenar pesos balanza logica comparar cajas deduccion un jugador solitario',
    descripcion: 'Cajas con pesos secretos y una balanza que solo compara de dos en dos. Ordénalas de la más ligera a la más pesada con el menor número de pesadas.',
    categorias: ['un_jugador']
  },
  'excusas': {
    titulo: 'Excusas a Domicilio',
    imagen: '/covers/excusas.webp',
    icono: 'excusas',
    colores: ['#25d366', '#075e54'],
    etiquetas: 'excusas humor jefe chat trabajo coherencia historias un jugador solitario',
    descripcion: 'Tu jefe te pide explicaciones por el chat y tú montas excusas con fichas. Todo vale… salvo contradecir lo que ya sabe de ti. ¿Aguantarás dos semanas sin que te despidan?',
    categorias: ['un_jugador']
  },
  'semaforo': {
    titulo: 'Semáforo Invertido',
    imagen: '/covers/semaforo.webp',
    icono: 'semaforo',
    colores: ['#ef4444', '#1e293b'],
    etiquetas: 'colores palabras reflejos atencion reglas stroop rapidez un jugador solitario',
    descripcion: 'La palabra VERDE pintada de rojo… ¿tocas o no? La regla cambia cada diez segundos y cada vez va más rápido. Reflejos y cabeza fría.',
    categorias: ['un_jugador']
  },
  'untrazo': {
    titulo: 'Un Solo Trazo',
    imagen: '/covers/untrazo.webp',
    icono: 'untrazo',
    colores: ['#f472b6', '#0f766e'],
    etiquetas: 'dibujar trazo figuras lineas puntos logica euler puzle un jugador solitario',
    descripcion: 'Repasa todas las líneas de la figura sin levantar el dedo ni pasar dos veces por la misma. Y si es imposible… ¡demuéstralo!',
    categorias: ['un_jugador']
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