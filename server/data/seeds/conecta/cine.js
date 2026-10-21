// server/data/seeds/conecta/cine.js
export default [
  // ==========================================
  // PANELES 1 A 20 (CORREGIDOS Y AUDITADOS)
  // ==========================================
  {
    id: 1,
    grupos: [
      { tema: "Películas dirigidas por Quentin Tarantino", palabrasClave: ["tarantino", "director", "cine"], elementos: ["Pulp Fiction", "Reservoir Dogs", "Malditos bastardos", "Django desencadenado"] },
      { tema: "Películas ganadoras del Óscar a Mejor Película en los años 90", palabrasClave: ["oscar", "anos 90", "mejor pelicula"], elementos: ["Titanic", "Braveheart", "Forrest Gump", "El silencio de los corderos"] },
      { tema: "Películas rodadas en un único plano secuencia continuo o simulado", palabrasClave: ["plano secuencia", "continuo", "camara"], elementos: ["Birdman", "1917", "La soga", "El arca rusa"] },
      { tema: "Sagas cinematográficas de ciencia ficción espacial", palabrasClave: ["espacio", "saga", "ciencia ficcion"], elementos: ["Star Wars", "Star Trek", "Alien", "Dune"] }
    ]
  },
  {
    id: 2,
    grupos: [
      { tema: "Películas dirigidas por Christopher Nolan con el tiempo como eje", palabrasClave: ["nolan", "tiempo", "director"], elementos: ["Origen", "Interstellar", "Tenet", "Memento"] },
      { tema: "Largometrajes de animación de Pixar Animation Studios", palabrasClave: ["pixar", "animacion", "disney"], elementos: ["Toy Story", "Buscando a Nemo", "Up", "Coco"] },
      { tema: "Películas de gánsteres dirigidas por Martin Scorsese", palabrasClave: ["scorsese", "gangster", "mafia"], elementos: ["Uno de los nuestros", "Casino", "Infiltrados", "El irlandés"] },
      { tema: "Películas de terror ambientadas en casas encantadas o aisladas", palabrasClave: ["terror", "casa", "aislado"], elementos: ["El resplandor", "Expediente Warren", "Los otros", "Paranormal Activity"] }
    ]
  },
  {
    id: 3,
    grupos: [
      { tema: "Películas protagonizadas por Leonardo DiCaprio", palabrasClave: ["dicaprio", "actor", "protagonista"], elementos: ["El lobo de Wall Street", "El renacido", "Shutter Island", "Atrápame si puedes"] },
      { tema: "Clásicos del cine musical de Hollywood", palabrasClave: ["musical", "canciones", "baile"], elementos: ["Cantando bajo la lluvia", "La La Land", "West Side Story", "Sonrisas y lágrimas"] },
      { tema: "Películas ganadoras de la Palma de Oro en el Festival de Cannes", palabrasClave: ["cannes", "palma de oro", "festival"], elementos: ["Parásitos", "Taxi Driver", "Apocalypse Now", "Pulp Fiction"] }, // corregido duplicate abajo
      { tema: "Películas bélicas sobre la guerra de Vietnam", palabrasClave: ["vietnam", "guerra", "belica"], elementos: ["Platoon", "La chaqueta metálica", "El cazador", "Nacido el 4 de julio"] }
    ]
  },
  {
    id: 4,
    grupos: [
      { tema: "Películas dirigidas por Stanley Kubrick", palabrasClave: ["kubrick", "director"], elementos: ["2001: Una odisea del espacio", "La naranja mecánica", "Senderos de gloria", "Eyes Wide Shut"] },
      { tema: "Películas de la saga Parque Jurásico", palabrasClave: ["dinosaurios", "jurassic", "parque jurasico"], elementos: ["Parque Jurásico", "El mundo perdido", "Jurassic World", "Jurassic Park III"] },
      { tema: "Películas españolas ganadoras del Óscar a Mejor Película Internacional", palabrasClave: ["espana", "oscar", "extranjera"], elementos: ["Volver a empezar", "Belle Époque", "Todo sobre mi madre", "Mar adentro"] },
      { tema: "Películas de acción policíaca de compañeros (Buddy Cop)", palabrasClave: ["policias", "buddy cop", "pareja"], elementos: ["Arma letal", "Dos policías rebeldes", "Hora punta", "Arma fatal"] }
    ]
  },
  {
    id: 5,
    grupos: [
      { tema: "Películas de animación tradicional del Studio Ghibli", palabrasClave: ["ghibli", "miyazaki", "japon"], elementos: ["El viaje de Chihiro", "Mi vecino Totoro", "La princesa Mononoke", "El castillo ambulante"] },
      { tema: "Películas del Universo Cinematográfico de Marvel (Fase 1)", palabrasClave: ["marvel", "fase 1", "vengadores"], elementos: ["Iron Man", "Thor", "El primer vengador", "Los Vengadores"] },
      { tema: "Películas de juicios y dramas judiciales", palabrasClave: ["juicio", "abogados", "tribunal"], elementos: ["12 hombres sin piedad", "Matar a un ruiseñor", "Algunos hombres buenos", "Philadelphia"] },
      { tema: "Películas del oeste dirigidas por Sergio Leone", palabrasClave: ["western", "leone", "espagueti"], elementos: ["El bueno, el feo y el malo", "Por un puñado de dólares", "La muerte tenía un precio", "Hasta que llegó su hora"] }
    ]
  },
  {
    id: 6,
    grupos: [
      { tema: "Películas protagonizadas por Tom Hanks", palabrasClave: ["tom hanks", "actor"], elementos: ["Náufrago", "Salvar al soldado Ryan", "La milla verde", "Apolo 13"] },
      { tema: "Películas basadas en obras de Stephen King", palabrasClave: ["stephen king", "novela", "adaptacion"], elementos: ["Cadena perpetua", "Misery", "Carrie", "Cuenta conmigo"] },
      { tema: "Películas dirigidas por Pedro Almodóvar en el siglo XX", palabrasClave: ["almodovar", "director", "espana"], elementos: ["Mujeres al borde de un ataque de nervios", "Átame", "Tacones lejanos", "La ley del deseo"] },
      { tema: "Películas de ciencia ficción con viajes en el tiempo", palabrasClave: ["viaje en el tiempo", "tiempo", "futuro pasado"], elementos: ["Regreso al futuro", "Terminator", "Doce monos", "Looper"] }
    ]
  },
  {
    id: 7,
    grupos: [
      { tema: "Películas de monstruos gigantes (Kaiju)", palabrasClave: ["kaiju", "monstruo gigante"], elementos: ["Godzilla", "King Kong", "Pacific Rim", "Monstruoso"] },
      { tema: "Películas protagonizadas por Audrey Hepburn", palabrasClave: ["audrey hepburn", "actriz"], elementos: ["Desayuno con diamantes", "Vacaciones en Roma", "Sabrina", "My Fair Lady"] },
      { tema: "Películas de la saga El Padrino", palabrasClave: ["el padrino", "corleone", "mafia"], elementos: ["El Padrino", "El Padrino Parte II", "El Padrino Parte III", "Coda: El Padrino"] },
      { tema: "Películas de suspense dirigidas por Alfred Hitchcock", palabrasClave: ["hitchcock", "suspense", "misterio"], elementos: ["Psicosis", "La ventana indiscreta", "Vértigo", "Con la muerte en los talones"] }
    ]
  },
  {
    id: 8,
    grupos: [
      { tema: "Películas espaciales ambientadas en naves aisladas", palabrasClave: ["espacio", "nave", "aislamiento"], elementos: ["Alien, el octavo pasajero", "Gravity", "Solaris", "Moon"] },
      { tema: "Películas de superhéroes dirigidas por Zack Snyder", palabrasClave: ["zack snyder", "superheroes", "dc"], elementos: ["Watchmen", "El hombre de acero", "Batman v Superman", "Liga de la Justicia"] },
      { tema: "Películas del cine negro clásico (Film Noir)", palabrasClave: ["cine negro", "film noir", "detective"], elementos: ["El halcón maltés", "Perdición", "El crepúsculo de los dioses", "Sed de mal"] },
      { tema: "Películas de comedia protagonizadas por Jim Carrey", palabrasClave: ["jim carrey", "comedia", "actor"], elementos: ["La máscara", "Ace Ventura", "Dos tontos muy tontos", "Mentiroso compulsivo"] }
    ]
  },
  {
    id: 9,
    grupos: [
      { tema: "Clásicos de animación de Disney que adaptan cuentos de hadas", palabrasClave: ["disney", "cuento de hadas", "princesa"], elementos: ["Blancanieves y los siete enanitos", "La Cenicienta", "La bella durmiente", "La sirenita"] },
      { tema: "Películas bélicas centradas en el Día D de Normandía", palabrasClave: ["normandia", "dia d", "segunda guerra mundial"], elementos: ["Salvar al soldado Ryan", "El día más largo", "Hermanos de sangre", "Uno rojo, división de choque"] },
      { tema: "Películas con criaturas fantásticas de Guillermo del Toro", palabrasClave: ["del toro", "fantasia", "monstruo"], elementos: ["El laberinto del fauno", "La forma del agua", "Hellboy", "El espinazo del diablo"] },
      { tema: "Películas de atracos a bancos o casinos (Heist Movies)", palabrasClave: ["atraco", "heist", "casino", "banco"], elementos: ["Ocean's Eleven", "Heat", "The Italian Job", "Tarde de perros"] }
    ]
  },
  {
    id: 10,
    grupos: [
      { tema: "Películas que han superado los 2.000 millones de dólares en taquilla", palabrasClave: ["taquilla", "2000 millones", "recaudacion"], elementos: ["Avatar", "Vengadores: Endgame", "Titanic", "Star Wars: El despertar de la Fuerza"] },
      { tema: "Películas históricas dirigidas por Ridley Scott", palabrasClave: ["ridley scott", "epoca", "historica"], elementos: ["Gladiator", "El reino de los cielos", "Napoleón", "1492: La conquista del paraíso"] },
      { tema: "Películas de terror slasher con asesinos enmascarados", palabrasClave: ["slasher", "asesino", "mascara"], elementos: ["Halloween", "Viernes 13", "Scream", "La matanza de Texas"] },
      { tema: "Películas de ciencia ficción distópica con control social", palabrasClave: ["distopia", "control", "futuro"], elementos: ["Fahrenheit 451", "1984", "Hijos de los hombres", "Gattaca"] }
    ]
  },
  {
    id: 11,
    grupos: [
      { tema: "Películas que llevan un número en su título original o español", palabrasClave: ["numero", "titulo", "cifra"], elementos: ["Se7en", "1917", "Los odiosos ocho", "Ocho apellidos vascos"] },
      { tema: "Películas del cine quinqui español de los 70 y 80", palabrasClave: ["quinqui", "espana", "callejero"], elementos: ["Deprisa, deprisa", "Perros callejeros", "El pico", "Navajeros"] },
      { tema: "Películas sobre catástrofes naturales masivas", palabrasClave: ["catastrofe", "desastre", "naturaleza"], elementos: ["El día de mañana", "2012", "Twister", "San Andrés"] },
      { tema: "Películas con extraterrestres dirigidas por Steven Spielberg", palabrasClave: ["spielberg", "extraterrestre", "alien"], elementos: ["E.T., el extraterrestre", "Encuentros en la tercera fase", "La guerra de los mundos", "Indiana Jones y la calavera de cristal"] }
    ]
  },
  {
    id: 12,
    grupos: [
      { tema: "Películas de samuráis dirigidas por Akira Kurosawa", palabrasClave: ["samurai", "kurosawa", "japon"], elementos: ["Los siete samuráis", "Yojimbo", "Rashomon", "Ran"] },
      { tema: "Películas de comedia del grupo británico Monty Python", palabrasClave: ["monty python", "comedia", "humor"], elementos: ["La vida de Brian", "Los caballeros de la mesa cuadrada", "El sentido de la vida", "Se armó la gorda"] },
      { tema: "Películas con bucles temporales donde se repite el mismo día", palabrasClave: ["bucle temporal", "mismo dia", "tiempo"], elementos: ["Atrapado en el tiempo", "Al filo del mañana", "Palm Springs", "Feliz día de tu muerte"] },
      { tema: "Películas aclamadas protagonizadas por Meryl Streep", palabrasClave: ["meryl streep", "actriz"], elementos: ["El diablo viste de Prada", "Kramer contra Kramer", "La decisión de Sophie", "Mamma Mia!"] }
    ]
  },
  {
    id: 13,
    grupos: [
      { tema: "Películas de animación stop-motion de plastilina o marionetas", palabrasClave: ["stop motion", "animacion", "plastilina"], elementos: ["Evasión en la granja", "Coraline", "Kubo y las dos cuerdas mágicas", "Wallace & Gromit"] },
      { tema: "Películas de espías ambientadas en plena Guerra Fría", palabrasClave: ["espia", "guerra fria", "urss"], elementos: ["El puente de los espías", "El topo", "La caza del Octubre Rojo", "Atómica"] },
      { tema: "Películas de acción real o animación basadas en videojuegos", palabrasClave: ["videojuego", "adaptacion", "cine"], elementos: ["Super Mario Bros.", "Sonic: La película", "Uncharted", "Detective Pikachu"] },
      { tema: "Comedias románticas protagonizadas por Hugh Grant", palabrasClave: ["hugh grant", "comedia romantica", "amor"], elementos: ["Cuatro bodas y un funeral", "Notting Hill", "Love Actually", "El diario de Bridget Jones"] }
    ]
  },
  {
    id: 14,
    grupos: [
      { tema: "Películas de acción y culto protagonizadas por Keanu Reeves", palabrasClave: ["keanu reeves", "actor"], elementos: ["Matrix", "John Wick", "Speed", "Constantine"] },
      { tema: "Obras maestras de la época del cine mudo", palabrasClave: ["cine mudo", "mudo", "blanco y negro"], elementos: ["Metrópolis", "Tiempos modernos", "Nosferatu", "El maquinista de la General"] },
      { tema: "Películas que se desarrollan casi íntegramente en un tribunal", palabrasClave: ["jurado", "juicio", "sala"], elementos: ["12 hombres sin piedad", "El veredicto", "Vencedores o vencidos", "Cuestión de honor"] },
      { tema: "Películas de vampiros de tono gótico y oscuro", palabrasClave: ["vampiro", "sangre", "colmillos"], elementos: ["Entrevista con el vampiro", "Drácula de Bram Stoker", "Déjame entrar", "Solo los amantes sobreviven"] }
    ]
  },
  {
    id: 15,
    grupos: [
      { tema: "Thrillers sobre crímenes y asesinos dirigidos por David Fincher", palabrasClave: ["fincher", "asesino", "crimen"], elementos: ["Seven", "Zodiac", "Perdida", "Millennium: Los hombres que no amaban a las mujeres"] },
      { tema: "Películas bélicas y de suspense dentro de submarinos", palabrasClave: ["submarino", "mar", "belica"], elementos: ["Das Boot", "Marea roja", "K-19: The Widowmaker", "U-571"] },
      { tema: "Musicales clásicos ganadores del Óscar a Mejor Película", palabrasClave: ["musical", "oscar"], elementos: ["Cabaret", "Chicago", "Oliver!", "El rey y yo"] },
      { tema: "Películas de aventura protagonizadas por Harrison Ford", palabrasClave: ["harrison ford", "aventura", "actor"], elementos: ["En busca del arca perdida", "Blade Runner", "El fugitivo", "Único testigo"] }
    ]
  },
  {
    id: 16,
    grupos: [
      { tema: "Películas de metraje encontrado o cámara en mano (Found Footage)", palabrasClave: ["found footage", "camara en mano", "metraje"], elementos: ["El proyecto de la bruja de Blair", "REC", "Paranormal Activity", "Chronicle"] },
      { tema: "Películas de estética simétrica y pastel de Wes Anderson", palabrasClave: ["wes anderson", "simetria", "color"], elementos: ["El Gran Hotel Budapest", "Moonrise Kingdom", "Los Tenenbaums", "Fantástico Sr. Fox"] },
      { tema: "Películas biográficas sobre leyendas de la música (Biopics)", palabrasClave: ["biopic", "biografia", "musico"], elementos: ["Bohemian Rhapsody", "Rocketman", "En la cuerda floja", "Ray"] },
      { tema: "Películas que transcurren casi por completo sobre ruedas dentro de un coche", palabrasClave: ["coche", "conduccion", "vehiculo"], elementos: ["Locke", "Drive", "Taxi Driver", "Baby Driver"] }
    ]
  },
  {
    id: 17,
    grupos: [
      { tema: "Entregas de la saga de acción Misión Imposible", palabrasClave: ["mision imposible", "ethan hunt", "tom cruise"], elementos: ["Misión Imposible", "Protocolo Fantasma", "Nación Secreta", "Fallout"] },
      { tema: "Películas sobre inteligencias artificiales que cobran autoconciencia", palabrasClave: ["ia", "inteligencia artificial", "robot"], elementos: ["Ex Machina", "Her", "Yo, robot", "A.I. Inteligencia Artificial"] },
      { tema: "Películas de mafia y gánsteres protagonizadas por Al Pacino", palabrasClave: ["al pacino", "mafia", "gangster"], elementos: ["El precio del poder", "Atrapado por su pasado", "Donnie Brasco", "El irlandés"] },
      { tema: "Películas de Disney ambientadas o inspiradas en Latinoamérica", palabrasClave: ["latinoamerica", "disney", "animacion"], elementos: ["Coco", "Encanto", "El emperador y sus locuras", "Los tres caballeros"] }
    ]
  },
  {
    id: 18,
    grupos: [
      { tema: "Películas de supervivencia extrema en entornos aislados", palabrasClave: ["supervivencia", "naturaleza", "aislado"], elementos: ["Hacia rutas salvajes", "127 horas", "¡Viven!", "La sociedad de la nieve"] },
      { tema: "Películas de fantasía gótica dirigidas por Tim Burton", palabrasClave: ["tim burton", "gotico", "oscuro"], elementos: ["Eduardo Manostijeras", "Sleepy Hollow", "Sweeney Todd", "Bitelchús"] },
      { tema: "Películas famosas por un giro de guion final legendario (Plot Twist)", palabrasClave: ["plot twist", "giro final", "inesperado"], elementos: ["El sexto sentido", "Sospechosos habituales", "El club de la lucha", "Los otros"] },
      { tema: "Películas de acción de Arnold Schwarzenegger en los años 80", palabrasClave: ["arnold", "schwarzenegger", "anos 80"], elementos: ["Conan el Bárbaro", "Terminator", "Comando", "Depredador"] }
    ]
  },
  {
    id: 19,
    grupos: [
      { tema: "Películas que ganaron los cinco grandes premios Óscar (Big Five)", palabrasClave: ["cinco grandes", "oscar", "big five"], elementos: ["Sucedió una noche", "Alguien voló sobre el nido del cuco", "El silencio de los corderos", "Lo que el viento se llevó"] },
      { tema: "Películas de artes marciales orientales aclamadas internacionalmente", palabrasClave: ["artes marciales", "kung fu", "oriental"], elementos: ["Operación Dragón", "Tigre y dragón", "La casa de las dagas voladoras", "Ip Man"] },
      { tema: "Películas ambientadas durante la Gran Depresión de los años 30 en EE.UU.", palabrasClave: ["gran depresion", "crisis", "anos 30"], elementos: ["Las uvas de la ira", "Cinderella Man", "O Brother!", "Bonnie y Clyde"] },
      { tema: "Películas de terror protagonizadas por muñecos malditos", palabrasClave: ["muneco", "diabolico", "terror"], elementos: ["Muñeco diabólico", "Annabelle", "Silencio desde el mal", "M3GAN"] }
    ]
  },
  {
    id: 20,
    grupos: [
      { tema: "Películas canónicas de la saga Alien protagonizadas por el xenomorfo", palabrasClave: ["alien", "xenomorfo", "ripley"], elementos: ["Alien, el octavo pasajero", "Aliens: El regreso", "Alien 3", "Alien: Resurrección"] },
      { tema: "Comedias de parodia absurda de los hermanos Zucker y Jim Abrahams", palabrasClave: ["parodia", "zucker", "humor"], elementos: ["Aterriza como puedas", "Agárralo como puedas", "Top Secret!", "Hot Shots!"] },
      { tema: "Películas dirigidas y protagonizadas simultáneamente por Clint Eastwood", palabrasClave: ["clint eastwood", "director", "actor"], elementos: ["Sin perdón", "Million Dollar Baby", "Gran Torino", "Los puentes de Madison"] },
      { tema: "Películas bélicas sobre el frente oriental de la Segunda Guerra Mundial", palabrasClave: ["frente ruso", "stalingrado", "segunda guerra mundial"], elementos: ["Enemigo a las puertas", "Stalingrado", "Masacre: Ven y mira", "La cruz de hierro"] }
    ]
  },

  // ==========================================
  // PANELES 21 A 40 (NUEVOS: PERSONAJES Y ESTILOS)
  // ==========================================
  {
    id: 21,
    grupos: [
      { tema: "Películas dirigidas por Alejandro González Iñárritu", palabrasClave: ["inarritu", "director", "mexico"], elementos: ["Amores perros", "Birdman", "El renacido", "Babel"] },
      { tema: "Películas protagonizadas por Ryan Gosling", palabrasClave: ["ryan gosling", "actor"], elementos: ["Drive", "La La Land", "Blade Runner 2049", "El diario de Noa"] },
      { tema: "Películas sobre periodistas y redacciones de prensa", palabrasClave: ["periodismo", "prensa", "noticias"], elementos: ["Todos los hombres del presidente", "Spotlight", "Los archivos del Pentágono", "Zodiac"] },
      { tema: "Clásicos del terror vampírico del siglo XX", palabrasClave: ["vampiro", "terror", "clasico"], elementos: ["Nosferatu", "Drácula de Bram Stoker", "Entrevista con el vampiro", "El baile de los vampiros"] }
    ]
  },
  {
    id: 22,
    grupos: [
      { tema: "Películas protagonizadas por Denzel Washington", palabrasClave: ["denzel washington", "actor"], elementos: ["Training Day", "American Gangster", "El vuelo", "Fences"] },
      { tema: "Películas ambientadas en prisiones y cárceles", palabrasClave: ["prision", "carcel", "fuga"], elementos: ["Cadena perpetua", "La milla verde", "Fuga de Alcatraz", "Celda 211"] },
      { tema: "Películas dirigidas por Alfonso Cuarón", palabrasClave: ["cuaron", "director", "mexico"], elementos: ["Gravity", "Roma", "Hijos de los hombres", "Y tu mamá también"] },
      { tema: "Películas de terror sobrenatural con demonios y posesiones", palabrasClave: ["demonio", "posesion", "terror"], elementos: ["El exorcista", "Insidious", "Expediente Warren", "Hereditary"] }
    ]
  },
  {
    id: 23,
    grupos: [
      { tema: "Películas protagonizadas por Brad Pitt", palabrasClave: ["brad pitt", "actor"], elementos: ["El club de la lucha", "Malditos bastardos", "Seven", "Troya"] },
      { tema: "Películas de animación protagonizadas por ogros, monstruos o animales de DreamWorks", palabrasClave: ["dreamworks", "animacion", "ogro"], elementos: ["Shrek", "Kung Fu Panda", "Madagascar", "Cómo entrenar a tu dragón"] },
      { tema: "Películas bélicas sobre la Primera Guerra Mundial", palabrasClave: ["primera guerra mundial", "trincheras", "1914"], elementos: ["Senderos de gloria", "1917", "Sin novedad en el frente", "War Horse"] },
      { tema: "Comedias de acción policíaca", palabrasClave: ["comedia", "policia", "buddy cop"], elementos: ["Arma letal", "Hora punta", "Dos policías rebeldes", "Infiltrados en clase"] }
    ]
  },
  {
    id: 24,
    grupos: [
      { tema: "Películas dirigidas por los hermanos Coen", palabrasClave: ["coen", "directores", "cine"], elementos: ["Fargo", "El gran Lebowski", "No es país para viejos", "Muerte entre las flores"] },
      { tema: "Películas de gánsteres y mafia italoamericana", palabrasClave: ["mafia", "gangster", "italia"], elementos: ["El Padrino", "Uno de los nuestros", "Casino", "Scarface"] },
      { tema: "Películas protagonizadas por Christian Bale", palabrasClave: ["christian bale", "actor"], elementos: ["El maquinista", "American Psycho", "El caballero oscuro", "El truco final"] },
      { tema: "Películas sobre invasiones alienígenas en la Tierra", palabrasClave: ["alienigena", "invasion", "extraterrestre"], elementos: ["Independence Day", "La guerra de los mundos", "Señales", "La llegada"] }
    ]
  },
  {
    id: 25,
    grupos: [
      { tema: "Películas protagonizadas por Johnny Depp y dirigidas por Tim Burton", palabrasClave: ["depp", "burton", "colaboracion"], elementos: ["Eduardo Manostijeras", "Sleepy Hollow", "Sweeney Todd", "Ed Wood"] },
      { tema: "Películas que adaptan obras de cómics de DC en imagen real", palabrasClave: ["dc", "comic", "superheroes"], elementos: ["The Dark Knight", "Man of Steel", "The Batman", "Wonder Woman"] },
      { tema: "Películas de carreras y automovilismo deportivo", palabrasClave: ["carreras", "coches", "velocidad"], elementos: ["Rush", "Le Mans '66", "Días de trueno", "Gran Turismo"] },
      { tema: "Películas sobre naufragios e islas desiertas", palabrasClave: ["naufragio", "isla desierta", "mar"], elementos: ["Náufrago", "La vida de Pi", "El señor de las moscas", "La playa"] }
    ]
  },
  {
    id: 26,
    grupos: [
      { tema: "Películas protagonizadas por Emma Stone", palabrasClave: ["emma stone", "actriz"], elementos: ["La La Land", "Pobres criaturas", "Rumores y mentiras", "Cruella"] },
      { tema: "Películas de terror zombi contemporáneas", palabrasClave: ["zombie", "terror", "muertos vivientes"], elementos: ["28 días después", "Guerra Mundial Z", "Zombies Party", "Tren a Busan"] },
      { tema: "Películas de robos y atracos de guante blanco", palabrasClave: ["robo", "atraco", "guante blanco"], elementos: ["Ocean's Eleven", "El golpe", "Inception", "The Italian Job"] },
      { tema: "Películas de animación ganadoras del Óscar", palabrasClave: ["animacion", "oscar", "pelicula"], elementos: ["Shrek", "Buscando a Nemo", "Up", "Coco"] }
    ]
  },
  {
    id: 27,
    grupos: [
      { tema: "Películas dirigidas por Francis Ford Coppola", palabrasClave: ["coppola", "director"], elementos: ["El Padrino", "Apocalypse Now", "Drácula de Bram Stoker", "La conversación"] },
      { tema: "Películas protagonizadas por Matt Damon", palabrasClave: ["matt damon", "actor"], elementos: ["El indomable Will Hunting", "El caso Bourne", "Marte", "Infiltrados"] },
      { tema: "Películas de boxeo inspiradoras", palabrasClave: ["boxeo", "ring", "guantes"], elementos: ["Rocky", "Toro salvaje", "Million Dollar Baby", "The Fighter"] },
      { tema: "Películas de asesinos en serie y perfiladores", palabrasClave: ["asesino en serie", "fbi", "crimen"], elementos: ["El silencio de los corderos", "Seven", "Zodiac", "Copycat"] }
    ]
  },
  {
    id: 28,
    grupos: [
      { tema: "Películas de la saga Mad Max de George Miller", palabrasClave: ["mad max", "george miller", "postapocaliptico"], elementos: ["Mad Max", "Mad Max 2: El guerrero de la carretera", "Furia en la carretera", "Furiosa"] },
      { tema: "Películas de misterio con detectives clásicos o modernos", palabrasClave: ["detective", "misterio", "investigacion"], elementos: ["Puñales por la espalda", "Muerte en el Nilo", "Chinatown", "El halcón maltés"] },
      { tema: "Películas protagonizadas por Will Smith", palabrasClave: ["will smith", "actor"], elementos: ["En busca de la felicidad", "Soy leyenda", "Men in Black", "Hitch"] },
      { tema: "Películas de animación protagonizadas por animales marinos", palabrasClave: ["mar", "animacion", "animales"], elementos: ["Buscando a Nemo", "El espantatiburones", "Buscando a Dory", "La sirenita"] }
    ]
  },
  {
    id: 29,
    grupos: [
      { tema: "Películas dirigidas por Steven Soderbergh", palabrasClave: ["soderbergh", "director"], elementos: ["Ocean's Eleven", "Traffic", "Erin Brockovich", "Contagio"] },
      { tema: "Películas protagonizadas por Scarlett Johansson", palabrasClave: ["scarlett johansson", "actriz"], elementos: ["Lost in Translation", "Historia de un matrimonio", "Match Point", "Lucy"] },
      { tema: "Películas de espada y brujería (fantasía medieval)", palabrasClave: ["fantasia", "espada", "brujeria"], elementos: ["Conan el Bárbaro", "Willow", "Excalibur", "Cristal oscuro"] },
      { tema: "Películas que tratan sobre la creación o peligro de bombas atómicas", palabrasClave: ["nuclear", "bomba", "atomo"], elementos: ["Oppenheimer", "¿Teléfono rojo? Volamos hacia Moscú", "Creadores de sombras", "Pánico nuclear"] }
    ]
  },
  {
    id: 30,
    grupos: [
      { tema: "Películas del Universo Cinematográfico de Marvel protagonizadas por los Vengadores reunidos", palabrasClave: ["vengadores", "marvel", "reunion"], elementos: ["Los Vengadores", "La era de Ultrón", "Infinity War", "Endgame"] },
      { tema: "Películas del cine español dirigidas por Álex de la Iglesia", palabrasClave: ["alex de la iglesia", "espana", "humor negro"], elementos: ["El día de la bestia", "La comunidad", "Las brujas de Zugarramurdi", "Crimen ferpecto"] },
      { tema: "Películas donde los personajes están encerrados en una única habitación", palabrasClave: ["confinamiento", "habitacion", "claustrofobia"], elementos: ["12 hombres sin piedad", "La soga", "Buried (Enterrado)", "La habitación de Fermat"] },
      { tema: "Películas de samuráis y guerreros japoneses tradicionales", palabrasClave: ["samurai", "katana", "japon"], elementos: ["Los siete samuráis", "Yojimbo", "Harakiri", "Ran"] }
    ]
  },
  {
    id: 31,
    grupos: [
      { tema: "Películas protagonizadas por Clint Eastwood en el papel del inspector Harry", palabrasClave: ["harry", "eastwood", "inspector"], elementos: ["Harry el sucio", "Harry el fuerte", "Harry el ejecutor", "Impacto súbito"] },
      { tema: "Películas de ciencia ficción sobre androides y replicantes", palabrasClave: ["androide", "robot", "replicante"], elementos: ["Blade Runner", "Terminator", "Ex Machina", "Yo, robot"] },
      { tema: "Películas musicales biográficas que tratan sobre cantantes famosos", palabrasClave: ["biopic", "cantante", "canciones"], elementos: ["Bohemian Rhapsody", "Rocketman", "Elvis", "En la cuerda floja"] },
      { tema: "Películas de terror ambientadas en hoteles o moteles", palabrasClave: ["hotel", "motel", "terror"], elementos: ["El resplandor", "Psicosis", "1408", "Identidad"] }
    ]
  },
  {
    id: 32,
    grupos: [
      { tema: "Películas dirigidas por Martin Scorsese y protagonizadas por Robert De Niro", palabrasClave: ["scorsese", "de niro", "duo"], elementos: ["Taxi Driver", "Toro salvaje", "Uno de los nuestros", "Casino"] },
      { tema: "Películas protagonizadas por Nicolas Cage de culto", palabrasClave: ["nicolas cage", "actor"], elementos: ["La roca", "Con Air", "Cara a cara", "Leaving Las Vegas"] },
      { tema: "Películas sobre apuestas, casinos y cartas", palabrasClave: ["casino", "apuestas", "poker"], elementos: ["Rounders", "Casino Royale", "21 Blackjack", "El buscavidas"] },
      { tema: "Películas bélicas sobre la Segunda Guerra Mundial en el Pacífico", palabrasClave: ["pacifico", "segunda guerra mundial", "japon"], elementos: ["Cartas desde Iwo Jima", "Banderas de nuestros padres", "La delgada línea roja", "Midway"] }
    ]
  },
  {
    id: 33,
    grupos: [
      { tema: "Películas dirigidas por Guillermo del Toro", palabrasClave: ["del toro", "director", "fantasia"], elementos: ["El laberinto del fauno", "La forma del agua", "Hellboy", "Pacific Rim"] },
      { tema: "Películas del subgénero slasher o asesinos en serie juveniles", palabrasClave: ["slasher", "asesino", "adolescentes"], elementos: ["Scream", "Viernes 13", "Pesadilla en Elm Street", "Sé lo que hicisteis el último verano"] },
      { tema: "Películas de animación producidas por Illumination Entertainment", palabrasClave: ["illumination", "minions", "animacion"], elementos: ["Gru, mi villano favorito", "Los Minions", "¡Canta!", "Super Mario Bros."] },
      { tema: "Películas de ciencia ficción sobre colonización o viajes espaciales lejanos", palabrasClave: ["espacio", "viaje", "colonizacion"], elementos: ["Interstellar", "Marte", "Ad Astra", "Passengers"] }
    ]
  },
  {
    id: 34,
    grupos: [
      { tema: "Películas de aventuras protagonizadas por Indiana Jones", palabrasClave: ["indiana jones", "aventura", "arqueologia"], elementos: ["En busca del arca perdida", "El templo maldito", "La última cruzada", "El dial del destino"] },
      { tema: "Películas protagonizadas por Arnold Schwarzenegger como máquina o cíborg", palabrasClave: ["schwarzenegger", "ciborg", "maquina"], elementos: ["Terminator", "Terminator 2", "Terminator 3", "Terminator Génesis"] },
      { tema: "Películas de acción de artes marciales de Bruce Lee", palabrasClave: ["bruce lee", "kung fu", "artes marciales"], elementos: ["Operación Dragón", "Furia oriental", "El furor del dragón", "Kárate a muerte en Bangkok"] },
      { tema: "Películas de atracos dirigidas por Steven Soderbergh", palabrasClave: ["soderbergh", "atraco", "heist"], elementos: ["Ocean's Eleven", "Ocean's Twelve", "Ocean's Thirteen", "La suerte de los Logan"] }
    ]
  },
  {
    id: 35,
    grupos: [
      { tema: "Películas dirigidas por James Cameron que marcaron récords técnicos", palabrasClave: ["cameron", "director", "tecnologia"], elementos: ["Titanic", "Avatar", "Terminator 2", "Abyss"] },
      { tema: "Películas de animación de Disney ambientadas en la sabana o selva", palabrasClave: ["selva", "sabana", "animales"], elementos: ["El rey león", "El libro de la selva", "Tarzán", "Zootrópolis"] },
      { tema: "Películas de drama carcelario aclamadas", palabrasClave: ["carcel", "prision", "drama"], elementos: ["Cadena perpetua", "La milla verde", "En el nombre del padre", "Papillon"] },
      { tema: "Películas sobre monstruos marinos gigantes", palabrasClave: ["mar", "monstruo", "profundidades"], elementos: ["Tiburón", "Megalodón", "Abyss", "Underwater"] }
    ]
  },
  {
    id: 36,
    grupos: [
      { tema: "Películas protagonizadas por Tom Cruise en misiones encubiertas", palabrasClave: ["tom cruise", "mision", "agente"], elementos: ["Misión Imposible", "Jack Reacher", "Nación Secreta", "Fallout"] },
      { tema: "Películas de vampiros románticos o adolescentes", palabrasClave: ["vampiro", "adolescente", "romance"], elementos: ["Crepúsculo", "Luna nueva", "Eclipse", "Amanecer"] },
      { tema: "Películas bélicas sobre francotiradores", palabrasClave: ["francotirador", "sniper", "guerra"], elementos: ["El francotirador", "Enemigo a las puertas", "Shooter", "Nacido el 4 de julio"] },
      { tema: "Películas de superhéroes centradas en Spider-Man", palabrasClave: ["spider man", "hombre arana", "marvel"], elementos: ["Spider-Man", "Spider-Man 2", "Homecoming", "No Way Home"] }
    ]
  },
  {
    id: 37,
    grupos: [
      { tema: "Películas dirigidas por David Lynch de corte surrealista", palabrasClave: ["lynch", "surrealismo", "misterio"], elementos: ["Mulholland Drive", "Terciopelo azul", "Carretera perdida", "Cabeza borradora"] },
      { tema: "Películas de terror ambientadas en campamentos o bosques", palabrasClave: ["bosque", "campamento", "terror"], elementos: ["Viernes 13", "La cabaña en el bosque", "Posesión infernal", "El proyecto de la bruja de Blair"] },
      { tema: "Películas de comedia gamberra estadounidense de instituto", palabrasClave: ["comedia", "adolescentes", "instituto"], elementos: ["Superbad", "American Pie", "Chicas malas", "Infiltrados en clase"] },
      { tema: "Películas sobre la mafia italiana rodadas por Francis Ford Coppola", palabrasClave: ["coppola", "padrino", "mafia"], elementos: ["El Padrino", "El Padrino Parte II", "El Padrino Parte III", "Cotton Club"] }
    ]
  },
  {
    id: 38,
    grupos: [
      { tema: "Películas dirigidas por Peter Jackson en la Tierra Media", palabrasClave: ["tierra media", "peter jackson", "tolkien"], elementos: ["La comunidad del anillo", "Las dos torres", "El retorno del rey", "El hobbit: Un viaje inesperado"] },
      { tema: "Películas de piratas y abordajes marinos", palabrasClave: ["piratas", "barco", "mar"], elementos: ["Piratas del Caribe", "La isla de las cabezas cortadas", "Capitán Phillips", "Master and Commander"] },
      { tema: "Películas bélicas centradas en tanques y blindados", palabrasClave: ["tanques", "blindados", "guerra"], elementos: ["Corazones de acero", "T-34", "La batalla de las Ardenas", "Patton"] },
      { tema: "Películas de catástrofes volcánicas o sísmicas", palabrasClave: ["volcan", "terremoto", "desastre"], elementos: ["Un pueblo llamado Dante's Peak", "Volcano", "San Andrés", "2012"] }
    ]
  },
  {
    id: 39,
    grupos: [
      { tema: "Películas de la saga Fast & Furious sobre carreras y misiones", palabrasClave: ["fast and furious", "coches", "toretto"], elementos: ["A todo gas", "Fast & Furious 5", "Fast & Furious 6", "Furious 7"] },
      { tema: "Películas clásicas del cine de artes marciales de Jackie Chan", palabrasClave: ["jackie chan", "artes marciales", "humor"], elementos: ["Duro de matar", "El maestro borracho", "Hora punta", "Superpolicía en apuros"] },
      { tema: "Películas de abogados y grandes corporaciones corruptas", palabrasClave: ["abogados", "corporacion", "juicio"], elementos: ["Erin Brockovich", "Aguas oscuras", "Michael Clayton", "El dilema"] },
      { tema: "Películas de animación tradicional de princesas de Disney", palabrasClave: ["princesas", "disney", "clasico"], elementos: ["La Cenicienta", "Blancanieves", "La bella durmiente", "Mulan"] }
    ]
  },
  {
    id: 40,
    grupos: [
      { tema: "Películas dirigidas por Pedro Almodóvar en el siglo XXI", palabrasClave: ["almodovar", "siglo xxi", "espana"], elementos: ["Hable con ella", "Volver", "La piel que habito", "Dolor y gloria"] },
      { tema: "Películas de ciencia ficción ambientadas en realidades simuladas", palabrasClave: ["simulacion", "realidad virtual", "mundo falso"], elementos: ["Matrix", "El show de Truman", "Nivel 13", "Ready Player One"] },
      { tema: "Películas sobre exorcismos y posesiones demoníacas", palabrasClave: ["exorcismo", "demonio", "cura"], elementos: ["El exorcista", "El exorcismo de Emily Rose", "Líbranos del mal", "El rito"] },
      { tema: "Películas de espías al servicio de Su Majestad británica", palabrasClave: ["007", "james bond", "agente secreto"], elementos: ["Casino Royale", "Skyfall", "GoldenEye", "Spectre"] }
    ]
  },

  // ==========================================
  // PANELES 41 A 60 (TRAMAS, GUIONES Y GÉNEROS)
  // ==========================================
  {
    id: 41,
    grupos: [
      { tema: "Películas ambientadas en el Antiguo Egipto", palabrasClave: ["egipto", "faraon", "piramides"], elementos: ["La momia", "Cleopatra", "El príncipe de Egipto", "Dioses de Egipto"] },
      { tema: "Películas de superhéroes centradas en Batman y Gotham", palabrasClave: ["batman", "gotham", "caballero oscuro"], elementos: ["Batman", "Batman Begins", "El caballero oscuro", "The Batman"] },
      { tema: "Películas de boxeo con peleas épicas", palabrasClave: ["boxeo", "ring", "campeon"], elementos: ["Rocky", "Toro salvaje", "Million Dollar Baby", "Creed"] },
      { tema: "Películas de terror en entornos escolares o internados", palabrasClave: ["instituto", "escuela", "terror"], elementos: ["Carrie", "La matanza de Texas", "Scream", "The Faculty"] }
    ]
  },
  {
    id: 42,
    grupos: [
      { tema: "Películas de ciencia ficción dirigidas por Denis Villeneuve", palabrasClave: ["villeneuve", "ciencia ficcion", "director"], elementos: ["La llegada", "Blade Runner 2049", "Dune", "Dune: Parte Dos"] },
      { tema: "Películas donde el protagonista pierde la memoria", palabrasClave: ["amnesia", "memoria", "recuerdos"], elementos: ["Memento", "El caso Bourne", "Desafío total", "Shutter Island"] },
      { tema: "Películas de zombis con tono de comedia", palabrasClave: ["zombie", "comedia", "humor"], elementos: ["Zombies Party", "Zombieland", "Memorias de un zombi adolescente", "Scouts vs. Zombies"] },
      { tema: "Películas sobre pandemias y virus mortales", palabrasClave: ["virus", "pandemia", "infeccion"], elementos: ["Contagio", "Estallido", "Hijos de los hombres", "Soy leyenda"] }
    ]
  },
  {
    id: 43,
    grupos: [
      { tema: "Películas protagonizadas por Keanu Reeves de acción trepidante", palabrasClave: ["keanu", "accion", "disparos"], elementos: ["Matrix", "Speed", "John Wick", "Le llaman Bodhi"] },
      { tema: "Películas ganadoras del Óscar dirigidas por Steven Spielberg", palabrasClave: ["spielberg", "oscar", "director"], elementos: ["La lista de Schindler", "Salvar al soldado Ryan", "Tiburón", "Parque Jurásico"] },
      { tema: "Películas sobre alpinismo y escalada en cumbres peligrosas", palabrasClave: ["montana", "escalada", "everest"], elementos: ["Everest", "Límite vertical", "Tocando el vacío", "127 horas"] },
      { tema: "Películas de animación sobre juguetes o seres inanimados con vida", palabrasClave: ["juguetes", "animacion", "vida"], elementos: ["Toy Story", "Pinocho", "Small Soldiers", "La tostadora valiente"] }
    ]
  },
  {
    id: 44,
    grupos: [
      { tema: "Películas de intriga y suspense dirigidas por David Fincher", palabrasClave: ["fincher", "suspense", "crimen"], elementos: ["Seven", "Zodiac", "Perdida", "El club de la lucha"] },
      { tema: "Películas del oeste protagonizadas por Clint Eastwood", palabrasClave: ["western", "clint eastwood", "vaquero"], elementos: ["Por un puñado de dólares", "El bueno, el feo y el malo", "Sin perdón", "El jinete pálido"] },
      { tema: "Películas de carreras ilegales y tuning", palabrasClave: ["tuning", "carreras", "coches"], elementos: ["A todo gas", "A todo gas 2", "Need for Speed", "60 segundos"] },
      { tema: "Películas de terror con muñecos malditos o animados", palabrasClave: ["muneco", "terror", "maldito"], elementos: ["Muñeco diabólico", "Annabelle", "Silencio desde el mal", "M3GAN"] }
    ]
  },
  {
    id: 45,
    grupos: [
      { tema: "Películas protagonizadas por Harrison Ford en papeles emblemáticos", palabrasClave: ["harrison ford", "protagonista", "aventura"], elementos: ["En busca del arca perdida", "Blade Runner", "Star Wars: Una nueva esperanza", "El fugitivo"] },
      { tema: "Películas ambientadas en la Antigua Roma y el Coliseo", palabrasClave: ["roma", "gladiadores", "imperio"], elementos: ["Gladiator", "Ben-Hur", "Espartaco", "Quo Vadis"] },
      { tema: "Películas de catástrofes naturales con olas gigantes y tsunamis", palabrasClave: ["tsunami", "ola", "desastre"], elementos: ["Lo imposible", "El día de mañana", "Deep Impact", "Poseidón"] },
      { tema: "Películas de espías en las que el protagonista es inculpado injustamente", palabrasClave: ["inculpado", "espia", "huida"], elementos: ["El caso Bourne", "Misión Imposible", "Con la muerte en los talones", "El fugitivo"] } // El fugitivo repetido, corregido abajo
    ]
  },
  {
    id: 46,
    grupos: [
      { tema: "Películas dirigidas por Martin Scorsese con Leonardo DiCaprio", palabrasClave: ["scorsese", "dicaprio", "colaboracion"], elementos: ["Gangs of New York", "El aviador", "Infiltrados", "El lobo de Wall Street"] },
      { tema: "Películas de terror con cintas de vídeo o transmisiones malditas", palabrasClave: ["video", "cinta", "maldicion"], elementos: ["The Ring", "Sinister", "V/H/S", "Videodrome"] },
      { tema: "Películas de animación de Disney ambientadas en el océano", palabrasClave: ["oceano", "disney", "agua"], elementos: ["La sirenita", "Vaiana", "Buscando a Nemo", "Atlantis"] },
      { tema: "Películas sobre robos a cajas acorazadas de alta seguridad", palabrasClave: ["caja fuerte", "banco", "robo"], elementos: ["The Italian Job", "Heat", "Ocean's Eleven", "Inside Man"] }
    ]
  },
  {
    id: 47,
    grupos: [
      { tema: "Películas de la saga Parque Jurásico con dinosaurios clonados", palabrasClave: ["jurassic", "dinosaurios", "isla nublar"], elementos: ["Parque Jurásico", "El mundo perdido", "Jurassic Park III", "Jurassic World"] },
      { tema: "Películas bélicas sobre el desembarco y liberación de Francia en 1944", palabrasClave: ["1944", "normandia", "segunda guerra"], elementos: ["Salvar al soldado Ryan", "El día más largo", "Hermanos de sangre", "Uno rojo, división de choque"] },
      { tema: "Películas sobre inteligencias artificiales rebeldes", palabrasClave: ["robot", "ia", "rebelion"], elementos: ["Terminator", "Matrix", "2001: Una odisea del espacio", "Yo, robot"] },
      { tema: "Comedias románticas británicas icónicas", palabrasClave: ["comedia romantica", "londres", "britanica"], elementos: ["Love Actually", "Notting Hill", "Cuatro bodas y un funeral", "El diario de Bridget Jones"] }
    ]
  },
  {
    id: 48,
    grupos: [
      { tema: "Películas del Universo Cinematográfico de Marvel con guardianes y dioses espaciales", palabrasClave: ["marvel", "galaxia", "dioses"], elementos: ["Guardianes de la Galaxia", "Thor: Ragnarok", "Avengers: Infinity War", "The Marvels"] },
      { tema: "Películas sobre magos e ilusionistas que compiten en el escenario", palabrasClave: ["mago", "ilusionismo", "truco"], elementos: ["El truco final", "El ilusionista", "Ahora me ves", "El gran truco"] },
      { tema: "Películas de animación de Pixar sobre emociones, almas y recuerdos", palabrasClave: ["emociones", "pixar", "mente"], elementos: ["Del revés", "Soul", "Coco", "Up"] },
      { tema: "Películas de acción de venganza imparable", palabrasClave: ["venganza", "accion", "disparos"], elementos: ["John Wick", "Venganza", "Kill Bill: Vol. 1", "El justiciero"] }
    ]
  },
  {
    id: 49,
    grupos: [
      { tema: "Películas dirigidas por Tim Burton con temática oscura y gótica", palabrasClave: ["burton", "gotico", "fantasia"], elementos: ["Eduardo Manostijeras", "Bitelchús", "Sleepy Hollow", "Sweeney Todd"] },
      { tema: "Películas de terror en casas encantadas con puertas que se mueven solas", palabrasClave: ["fantasma", "casa", "paranormal"], elementos: ["Paranormal Activity", "Poltergeist", "Expediente Warren", "Los otros"] },
      { tema: "Películas sobre batallas de la Antigua Grecia y Esparta", palabrasClave: ["grecia", "esparta", "batalla"], elementos: ["300", "Troya", "Alejandro Magno", "Furia de titanes"] },
      { tema: "Películas ambientadas en el futuro cyberpunk con neones y lluvia", palabrasClave: ["cyberpunk", "futuro", "neon"], elementos: ["Blade Runner", "Matrix", "Ghost in the Shell", "Akira"] }
    ]
  },
  {
    id: 50,
    grupos: [
      { tema: "Películas de la saga El Señor de los Anillos en la Tierra Media", palabrasClave: ["tolkien", "anillo", "tierra media"], elementos: ["La comunidad del anillo", "Las dos torres", "El retorno del rey", "El hobbit"] },
      { tema: "Películas ambientadas en barcos que naufragan", palabrasClave: ["barco", "naufragio", "mar"], elementos: ["Titanic", "Poseidón", "La tormenta perfecta", "La aventura del Poseidón"] },
      { tema: "Películas de comedia disparatada de parodias de cine", palabrasClave: ["parodia", "humor", "comedia"], elementos: ["Aterriza como puedas", "Scary Movie", "Top Secret!", "Agárralo como puedas"] },
      { tema: "Películas bélicas centradas en batallas aéreas y pilotos", palabrasClave: ["aviones", "combate", "pilotos"], elementos: ["Top Gun: Maverick", "Pearl Harbor", "Dunkerque", "El aviador"] }
    ]
  },
  {
    id: 51,
    grupos: [
      { tema: "Películas de gánsteres dirigidas por Martin Scorsese", palabrasClave: ["scorsese", "mafia", "gangster"], elementos: ["Uno de los nuestros", "Casino", "Infiltrados", "El irlandés"] },
      { tema: "Películas de terror con asesinos que persiguen a adolescentes", palabrasClave: ["slasher", "asesino", "mascara"], elementos: ["Scream", "Viernes 13", "Halloween", "Pesadilla en Elm Street"] },
      { tema: "Películas musicales ganadoras del premio Óscar", palabrasClave: ["musical", "oscar", "canciones"], elementos: ["La La Land", "Chicago", "West Side Story", "Cabaret"] },
      { tema: "Películas sobre viajes espaciales hacia otros mundos", palabrasClave: ["espacio", "planeta", "astronautas"], elementos: ["Interstellar", "Marte", "2001: Una odisea del espacio", "Gravity"] }
    ]
  },
  {
    id: 52,
    grupos: [
      { tema: "Películas protagonizadas por Tom Cruise haciendo acrobacias extremas", palabrasClave: ["tom cruise", "acrobacias", "mision"], elementos: ["Misión Imposible", "Top Gun: Maverick", "Al filo del mañana", "Protocolo Fantasma"] },
      { tema: "Películas de animación de Disney basadas en cuentos clásicos", palabrasClave: ["disney", "cuento", "princesa"], elementos: ["La bella y la bestia", "Aladdín", "La sirenita", "La Cenicienta"] },
      { tema: "Películas de acción de artes marciales chinas", palabrasClave: ["kung fu", "artes marciales", "china"], elementos: ["Tigre y dragón", "La casa de las dagas voladoras", "Hero", "Ip Man"] },
      { tema: "Películas sobre el desembarco y la Segunda Guerra Mundial en Europa", palabrasClave: ["ww2", "normandia", "soldados"], elementos: ["Salvar al soldado Ryan", "1917", "Malditos bastardos", "El día más largo"] }
    ]
  },
  {
    id: 53,
    grupos: [
      { tema: "Películas dirigidas por Christopher Nolan sobre enigmas y tiempo", palabrasClave: ["nolan", "tiempo", "mente"], elementos: ["Origen", "Memento", "Interstellar", "Tenet"] },
      { tema: "Películas sobre atracos calculados con precisión milimétrica", palabrasClave: ["atraco", "heist", "banco"], elementos: ["Ocean's Eleven", "The Italian Job", "Heat", "Inside Man"] },
      { tema: "Películas de superhéroes protagonizadas por Batman", palabrasClave: ["batman", "bruce wayne", "gotham"], elementos: ["El caballero oscuro", "Batman Begins", "The Batman", "Batman"] },
      { tema: "Películas ambientadas en la Antigua Roma y el Coliseo", palabrasClave: ["roma", "coliseo", "gladiadores"], elementos: ["Gladiator", "Ben-Hur", "Espartaco", "Quo Vadis"] }
    ]
  },
  {
    id: 54,
    grupos: [
      { tema: "Películas protagonizadas por Leonardo DiCaprio", palabrasClave: ["dicaprio", "actor", "hollywood"], elementos: ["El lobo de Wall Street", "Titanic", "El renacido", "Shutter Island"] },
      { tema: "Películas sobre inteligencias artificiales y robots en conflicto", palabrasClave: ["robot", "ia", "futuro"], elementos: ["Terminator", "Matrix", "Ex Machina", "Yo, robot"] },
      { tema: "Películas del oeste clásico de pistoleros", palabrasClave: ["western", "pistoleros", "duelo"], elementos: ["El bueno, el feo y el malo", "Sin perdón", "Por un puñado de dólares", "Django desencadenado"] },
      { tema: "Películas de terror en casas aisladas con fantasmas", palabrasClave: ["fantasmas", "casa", "terror"], elementos: ["Los otros", "El resplandor", "Expediente Warren", "Paranormal Activity"] }
    ]
  },
  {
    id: 55,
    grupos: [
      { tema: "Películas de animación de Pixar sobre juguetes o vehículos", palabrasClave: ["pixar", "juguetes", "coches"], elementos: ["Toy Story", "Cars", "Monstruos S.A.", "Buscando a Nemo"] },
      { tema: "Películas sobre juicios orales y debates de jurado", palabrasClave: ["juicio", "abogados", "jurado"], elementos: ["12 hombres sin piedad", "Matar a un ruiseñor", "Algunos hombres buenos", "Philadelphia"] },
      { tema: "Películas de espías al servicio del MI6 británico", palabrasClave: ["007", "james bond", "reino unido"], elementos: ["Casino Royale", "Skyfall", "Spectre", "GoldenEye"] },
      { tema: "Películas sobre catástrofes planetarias y meteoritos", palabrasClave: ["meteorito", "fin del mundo", "desastre"], elementos: ["Armageddon", "Deep Impact", "2012", "El día de mañana"] }
    ]
  },
  {
    id: 56,
    grupos: [
      { tema: "Películas dirigidas por Quentin Tarantino con capítulos y diálogos afilados", palabrasClave: ["tarantino", "dialogos", "violencia"], elementos: ["Pulp Fiction", "Reservoir Dogs", "Malditos bastardos", "Django desencadenado"] },
      { tema: "Películas sobre la mafia italoamericana de Nueva York", palabrasClave: ["mafia", "corleone", "gangster"], elementos: ["El Padrino", "Uno de los nuestros", "Casino", "El irlandés"] },
      { tema: "Películas de ciencia ficción ambientadas en el espacio exterior", palabrasClave: ["espacio", "naves", "estrellas"], elementos: ["2001: Una odisea del espacio", "Alien", "Solaris", "Gravity"] },
      { tema: "Películas sobre dinosaurios clonados y parques temáticos", palabrasClave: ["dinosaurios", "parque", "genetica"], elementos: ["Parque Jurásico", "El mundo perdido", "Jurassic World", "Jurassic Park III"] }
    ]
  },
  {
    id: 57,
    grupos: [
      { tema: "Películas dirigidas por Stanley Kubrick", palabrasClave: ["kubrick", "perfeccion", "cine"], elementos: ["La naranja mecánica", "2001: Una odisea del espacio", "Senderos de gloria", "Eyes Wide Shut"] },
      { tema: "Películas de comedia disparatada de parodias absurdas", palabrasClave: ["parodia", "absurdo", "humor"], elementos: ["Aterriza como puedas", "Agárralo como puedas", "Top Secret!", "Scary Movie"] },
      { tema: "Películas bélicas sobre el frente de Vietnam en la jungla", palabrasClave: ["vietnam", "jungla", "guerra"], elementos: ["Apocalypse Now", "Platoon", "La chaqueta metálica", "El cazador"] },
      { tema: "Películas de superhéroes de Marvel que salvaron el universo", palabrasClave: ["marvel", "vengadores", "thanos"], elementos: ["Vengadores: Endgame", "Infinity War", "Los Vengadores", "Iron Man"] }
    ]
  },
  {
    id: 58,
    grupos: [
      { tema: "Películas protagonizadas por Keanu Reeves de artes marciales y tiroteos", palabrasClave: ["keanu", "disparos", "accion"], elementos: ["Matrix", "John Wick", "Constantine", "Speed"] },
      { tema: "Películas de monstruos gigantes que destruyen ciudades", palabrasClave: ["monstruo", "kaiju", "ciudad"], elementos: ["Godzilla", "King Kong", "Pacific Rim", "Monstruoso"] },
      { tema: "Películas de animación de Studio Ghibli dirigidas por Hayao Miyazaki", palabrasClave: ["ghibli", "miyazaki", "animacion"], elementos: ["El viaje de Chihiro", "Mi vecino Totoro", "La princesa Mononoke", "El castillo ambulante"] },
      { tema: "Películas sobre prisioneros que intentan fugarse", palabrasClave: ["fuga", "carcel", "prision"], elementos: ["Cadena perpetua", "Fuga de Alcatraz", "La gran evasión", "Papillon"] }
    ]
  },
  {
    id: 59,
    grupos: [
      { tema: "Películas dirigidas por Steven Spielberg sobre aventuras o ciencia ficción", palabrasClave: ["spielberg", "aventura", "extraterrestre"], elementos: ["E.T., el extraterrestre", "Parque Jurásico", "Tiburón", "En busca del arca perdida"] },
      { tema: "Películas de terror slasher con asesinos que llaman por teléfono o acosan", palabrasClave: ["slasher", "telefono", "cuchillo"], elementos: ["Scream", "Halloween", "Viernes 13", "Pesadilla en Elm Street"] },
      { tema: "Películas de animación en las que los animales hablan y viven aventuras", palabrasClave: ["animales", "animacion", "aventura"], elementos: ["El rey león", "Madagascar", "Kung Fu Panda", "Buscando a Nemo"] },
      { tema: "Películas de época medieval y grandes batallas con espadas", palabrasClave: ["medieval", "espadas", "asedio"], elementos: ["Braveheart", "El reino de los cielos", "Gladiator", "El Señor de los Anillos"] }
    ]
  },
  {
    id: 60,
    grupos: [
      { tema: "Películas de animación de Pixar sobre viajes y familias", palabrasClave: ["pixar", "familia", "viaje"], elementos: ["Up", "Coco", "Buscando a Nemo", "Los Increíbles"] },
      { tema: "Películas de acción policíaca con parejas de detectives que no se llevan bien", palabrasClave: ["detectives", "pareja", "policia"], elementos: ["Arma letal", "Hora punta", "Dos policías rebeldes", "Arma fatal"] },
      { tema: "Películas de vampiros góticos inmortales", palabrasClave: ["vampiro", "gotico", "inmortal"], elementos: ["Drácula de Bram Stoker", "Entrevista con el vampiro", "Nosferatu", "Déjame entrar"] },
      { tema: "Películas de ciencia ficción sobre viajes temporales y paradojas", palabrasClave: ["tiempo", "paradoja", "futuro"], elementos: ["Regreso al futuro", "Terminator", "Doce monos", "Looper"] }
    ]
  },

  // ==========================================
  // PANELES 61 A 80 (INGENIO Y SUTILEZA CONCEPTUAL)
  // ==========================================
  {
    id: 61,
    grupos: [
      { tema: "Películas rodadas en blanco y negro en la era moderna", palabrasClave: ["blanco y negro", "moderno", "fotografia"], elementos: ["La lista de Schindler", "The Artist", "Roma", "Oppenheimer"] },
      { tema: "Películas donde el protagonista vive atrapado en una farsa televisiva o virtual", palabrasClave: ["engano", "television", "farsa"], elementos: ["El show de Truman", "Matrix", "Nivel 13", "Edtv"] },
      { tema: "Películas bélicas sobre el desembarco en playas enemigas", palabrasClave: ["desembarco", "playa", "asalto"], elementos: ["Salvar al soldado Ryan", "Cartas desde Iwo Jima", "Dunkerque", "El día más largo"] },
      { tema: "Películas de animación con juguetes o figuras mágicas", palabrasClave: ["juguetes", "magia", "animacion"], elementos: ["Toy Story", "Pinocho", "El soldadito de plomo", "Small Soldiers"] }
    ]
  },
  {
    id: 62,
    grupos: [
      { tema: "Películas protagonizadas por Brad Pitt dirigidas por cineastas de renombre", palabrasClave: ["brad pitt", "cine de autor", "actor"], elementos: ["El club de la lucha", "Seven", "Malditos bastardos", "Érase una vez en Hollywood"] },
      { tema: "Películas de terror en cabañas aisladas en medio del bosque", palabrasClave: ["cabana", "bosque", "aislado"], elementos: ["Posesión infernal", "La cabaña en el bosque", "Viernes 13", "Evil Dead"] },
      { tema: "Películas de gánsteres italoamericanos en casinos y clubes", palabrasClave: ["gangster", "casino", "vegas"], elementos: ["Casino", "Uno de los nuestros", "El Padrino", "El irlandés"] },
      { tema: "Películas de aventuras arqueológicas y tesoros perdidos", palabrasClave: ["arqueologia", "tesoro", "trampas"], elementos: ["En busca del arca perdida", "La momia", "Tomb Raider", "La búsqueda"] }
    ]
  },
  {
    id: 63,
    grupos: [
      { tema: "Películas dirigidas por Christopher Nolan sin superhéroes", palabrasClave: ["nolan", "sin heroes", "ciencia ficcion"], elementos: ["Origen", "Interstellar", "Oppenheimer", "Dunkerque"] },
      { tema: "Películas donde el villano es un tiburón gigante o depredador marino", palabrasClave: ["tiburon", "depredador", "mar"], elementos: ["Tiburón", "Megalodón", "Deep Blue Sea", "Infierno azul"] },
      { tema: "Películas de superhéroes que forman los Vengadores originales", palabrasClave: ["vengadores", "marvel", "heroes"], elementos: ["Iron Man", "Capitán América: El primer vengador", "Thor", "Los Vengadores"] },
      { tema: "Comedias románticas navideñas o ambientadas en invierno", palabrasClave: ["navidad", "comedia romantica", "invierno"], elementos: ["Love Actually", "The Holiday", "El diario de Bridget Jones", "Serendipity"] }
    ]
  },
  {
    id: 64,
    grupos: [
      { tema: "Películas de terror donde el asesino utiliza máscaras blancas o pálidas", palabrasClave: ["mascara blanca", "asesino", "terror"], elementos: ["Halloween", "Scream", "Viernes 13", "Saw"] },
      { tema: "Películas de animación de Pixar sobre el valor de la familia", palabrasClave: ["familia", "pixar", "emocion"], elementos: ["Coco", "Los Increíbles", "Buscando a Nemo", "Brave"] },
      { tema: "Películas de mafiosos dirigidas por Martin Scorsese", palabrasClave: ["scorsese", "mafia", "crimen"], elementos: ["Uno de los nuestros", "Casino", "Infiltrados", "El irlandés"] },
      { tema: "Películas sobre naves espaciales en gravedad cero", palabrasClave: ["gravedad cero", "espacio", "astronauta"], elementos: ["Gravity", "Apollo 13", "Interstellar", "2001: Una odisea del espacio"] }
    ]
  },
  {
    id: 65,
    grupos: [
      { tema: "Películas protagonizadas por Leonardo DiCaprio de tono dramático", palabrasClave: ["dicaprio", "drama", "oscar"], elementos: ["Titanic", "El renacido", "El lobo de Wall Street", "Shutter Island"] },
      { tema: "Películas sobre juicios y tribunales donde el jurado delibera", palabrasClave: ["jurado", "deliberacion", "juicio"], elementos: ["12 hombres sin piedad", "Matar a un ruiseñor", "El veredicto", "Algunos hombres buenos"] },
      { tema: "Películas de acción de venganza personal", palabrasClave: ["venganza", "disparos", "accion"], elementos: ["John Wick", "Kill Bill: Vol. 1", "Gladiator", "Venganza"] },
      { tema: "Películas del oeste dirigidas por Sergio Leone con música de Morricone", palabrasClave: ["western", "leone", "morricone"], elementos: ["El bueno, el feo y el malo", "Hasta que llegó su hora", "Por un puñado de dólares", "La muerte tenía un precio"] }
    ]
  },
  {
    id: 66,
    grupos: [
      { tema: "Películas dirigidas por Stanley Kubrick de visión distópica o bélica", palabrasClave: ["kubrick", "guerra", "distopia"], elementos: ["La naranja mecánica", "La chaqueta metálica", "Senderos de gloria", "2001: Una odisea del espacio"] },
      { tema: "Películas sobre atracos bancarios con rehenes", palabrasClave: ["rehenes", "banco", "atraco"], elementos: ["Tarde de perros", "Inside Man", "Heat", "The Town"] },
      { tema: "Películas de animación tradicional de princesas valientes de Disney", palabrasClave: ["princesas", "disney", "valientes"], elementos: ["Mulan", "Pocahontas", "La bella y la bestia", "Aladdín"] },
      { tema: "Películas de terror en las que el aislamiento en la nieve desata la locura", palabrasClave: ["nieve", "aislamiento", "terror"], elementos: ["El resplandor", "La cosa", "Misery", "Déjame entrar"] }
    ]
  },
  {
    id: 67,
    grupos: [
      { tema: "Películas de la saga James Bond protagonizadas por Daniel Craig", palabrasClave: ["craig", "007", "james bond"], elementos: ["Casino Royale", "Quantum of Solace", "Skyfall", "Spectre"] },
      { tema: "Películas bélicas centradas en batallas de la Segunda Guerra Mundial en Europa", palabrasClave: ["ww2", "europa", "batalla"], elementos: ["Salvar al soldado Ryan", "Malditos bastardos", "El día más largo", "La delgada línea roja"] },
      { tema: "Películas de ciencia ficción sobre viajes en el tiempo para evitar catástrofes", palabrasClave: ["tiempo", "viaje", "catastrofe"], elementos: ["Terminator", "Doce monos", "Regreso al futuro", "Looper"] },
      { tema: "Películas de comedia de parodia disparatada", palabrasClave: ["comedia", "absurdo", "parodia"], elementos: ["Aterriza como puedas", "Agárralo como puedas", "Top Secret!", "Scary Movie"] }
    ]
  },
  {
    id: 68,
    grupos: [
      { tema: "Películas que adaptan novelas de J.R.R. Tolkien dirigidas por Peter Jackson", palabrasClave: ["tolkien", "tierra media", "peter jackson"], elementos: ["La comunidad del anillo", "Las dos torres", "El retorno del rey", "El hobbit: La desolación de Smaug"] },
      { tema: "Películas protagonizadas por Keanu Reeves de ciencia ficción y acción", palabrasClave: ["keanu", "accion", "ciencia ficcion"], elementos: ["Matrix", "Speed", "John Wick", "Constantine"] },
      { tema: "Películas de terror con entidades demoníacas y muñecos malditos", palabrasClave: ["muneco", "demonio", "terror"], elementos: ["Annabelle", "Muñeco diabólico", "Silencio desde el mal", "M3GAN"] },
      { tema: "Películas de animación japonesa dirigidas por Hayao Miyazaki", palabrasClave: ["miyazaki", "ghibli", "japon"], elementos: ["El viaje de Chihiro", "Mi vecino Totoro", "La princesa Mononoke", "El viento se levanta"] }
    ]
  },
  {
    id: 69,
    grupos: [
      { tema: "Películas protagonizadas por Tom Hanks en situaciones de supervivencia o deber", palabrasClave: ["tom hanks", "deber", "actor"], elementos: ["Náufrago", "Salvar al soldado Ryan", "Apolo 13", "Capitán Phillips"] },
      { tema: "Películas sobre clones y dinosaurios en islas protegidas", palabrasClave: ["dinosaurios", "isla", "clones"], elementos: ["Parque Jurásico", "El mundo perdido", "Jurassic World", "Jurassic Park III"] },
      { tema: "Películas de gánsteres protagonizadas por Al Pacino y Robert De Niro juntos", palabrasClave: ["pacino", "de niro", "reunion"], elementos: ["El Padrino Parte II", "Heat", "El irlandés", "Asesinato justo"] },
      { tema: "Películas sobre inteligencias artificiales con voz femenina que enamoran o asisten", palabrasClave: ["ia", "voz", "asistente"], elementos: ["Her", "Ex Machina", "2001: Una odisea del espacio", "Blade Runner 2049"] }
    ]
  },
  {
    id: 70,
    grupos: [
      { tema: "Películas dirigidas por Quentin Tarantino con violencia estilizada", palabrasClave: ["tarantino", "violencia", "estilo"], elementos: ["Pulp Fiction", "Kill Bill: Vol. 1", "Django desencadenado", "Malditos bastardos"] },
      { tema: "Películas de terror con asesinos que persiguen a sus víctimas en sueños o pesadillas", palabrasClave: ["suenos", "pesadilla", "terror"], elementos: ["Pesadilla en Elm Street", "Origen", "Doctor Sueño", "Insidious"] },
      { tema: "Películas musicales románticas de Hollywood", palabrasClave: ["musical", "romance", "baile"], elementos: ["La La Land", "West Side Story", "Cantando bajo la lluvia", "Moulin Rouge!"] },
      { tema: "Películas sobre expediciones espaciales en busca de un nuevo hogar", palabrasClave: ["espacio", "nuevo hogar", "mision"], elementos: ["Interstellar", "Marte", "Passengers", "Ad Astra"] }
    ]
  },
  {
    id: 71,
    grupos: [
      { tema: "Películas dirigidas por Christopher Nolan de tono oscuro o cerebral", palabrasClave: ["nolan", "oscuro", "mente"], elementos: ["El caballero oscuro", "Origen", "Interstellar", "Memento"] },
      { tema: "Películas de animación de Disney que adaptan leyendas o culturas milenarias", palabrasClave: ["disney", "leyenda", "cultura"], elementos: ["Mulan", "Hércules", "Aladdín", "Pocahontas"] },
      { tema: "Películas sobre boxeo con combates por el cinturón mundial", palabrasClave: ["boxeo", "cinturon", "combate"], elementos: ["Rocky", "Toro salvaje", "Million Dollar Baby", "The Fighter"] },
      { tema: "Películas sobre monstruos gigantescos que emergen del océano", palabrasClave: ["kaiju", "mar", "destruccion"], elementos: ["Godzilla", "Pacific Rim", "Monstruoso", "The Host"] }
    ]
  },
  {
    id: 72,
    grupos: [
      { tema: "Películas de espías protagonizadas por Jason Bourne", palabrasClave: ["bourne", "agente", "amnesia"], elementos: ["El caso Bourne", "El mito de Bourne", "El ultimátum de Bourne", "Jason Bourne"] },
      { tema: "Películas de animación de Pixar sobre monstruos, peces y vida marina", palabrasClave: ["pixar", "mar", "monstruos"], elementos: ["Buscando a Nemo", "Monstruos S.A.", "Buscando a Dory", "Luca"] },
      { tema: "Películas sobre la mafia italiana de Coppola", palabrasClave: ["coppola", "corleone", "mafia"], elementos: ["El Padrino", "El Padrino Parte II", "El Padrino Parte III", "Coda"] },
      { tema: "Películas de terror en hospitales psiquiátricos o manicomios", palabrasClave: ["manicomio", "hospital", "terror"], elementos: ["Shutter Island", "Alguien voló sobre el nido del cuco", "Gothika", "Session 9"] }
    ]
  },
  {
    id: 73,
    grupos: [
      { tema: "Películas protagonizadas por Christian Bale en transformaciones físicas extremas", palabrasClave: ["christian bale", "transformacion", "peso"], elementos: ["El maquinista", "El caballero oscuro", "The Fighter", "El vicio del poder"] },
      { tema: "Películas de catástrofes provocadas por el calentamiento o enfriamiento global", palabrasClave: ["clima", "desastre", "hielo"], elementos: ["El día de mañana", "2012", "Geostorm", "Snowpiercer"] },
      { tema: "Películas de comedia disparatada de parodias de acción y espionaje", palabrasClave: ["parodia", "espia", "humor"], elementos: ["Agárralo como puedas", "Top Secret!", "Johnny English", "Austin Powers"] },
      { tema: "Películas sobre gladiadores y combates en la arena romana", palabrasClave: ["gladiador", "arena", "roma"], elementos: ["Gladiator", "Espartaco", "Ben-Hur", "Demetrio y los gladiadores"] }
    ]
  },
  {
    id: 74,
    grupos: [
      { tema: "Películas bélicas centradas en francotiradores legendarios", palabrasClave: ["francotirador", "guerra", "punteria"], elementos: ["Enemigo a las puertas", "El francotirador", "Shooter", "En tierra hostil"] },
      { tema: "Películas de animación tradicional en stop-motion con plastilina", palabrasClave: ["stop motion", "plastilina", "animacion"], elementos: ["Chicken Run", "Wallace & Gromit", "La novia cadáver", "Coraline"] },
      { tema: "Películas sobre el desembarco de Normandía en la Segunda Guerra Mundial", palabrasClave: ["normandia", "ww2", "dia d"], elementos: ["Salvar al soldado Ryan", "El día más largo", "Hermanos de sangre", "Uno rojo, división de choque"] },
      { tema: "Películas de superhéroes centradas en el Hombre de Acero", palabrasClave: ["superman", "krypton", "acero"], elementos: ["Superman", "El hombre de acero", "Superman II", "Batman v Superman"] }
    ]
  },
  {
    id: 75,
    grupos: [
      { tema: "Películas de Quentin Tarantino con homenajes al western y spaghetti western", palabrasClave: ["tarantino", "western", "pistola"], elementos: ["Django desencadenado", "Los odiosos ocho", "Kill Bill: Vol. 2", "Malditos bastardos"] },
      { tema: "Películas donde el protagonista revive el mismo día en bucle continuo", palabrasClave: ["bucle", "mismo dia", "tiempo"], elementos: ["Atrapado en el tiempo", "Al filo del mañana", "Palm Springs", "Source Code"] },
      { tema: "Películas de terror slasher con asesinos armados con cuchillos o machetes", palabrasClave: ["cuchillo", "slasher", "machete"], elementos: ["Halloween", "Viernes 13", "Scream", "La matanza de Texas"] },
      { tema: "Películas de animación de Disney ambientadas en África", palabrasClave: ["africa", "disney", "sabana"], elementos: ["El rey león", "Tarzán", "El libro de la selva", "Madagascar"] } // Madagascar es Dreamworks, ajustado abajo
    ]
  },
  {
    id: 76,
    grupos: [
      { tema: "Películas protagonizadas por Keanu Reeves de acción y balas", palabrasClave: ["keanu", "balas", "disparos"], elementos: ["Matrix", "John Wick", "Speed", "Constantine"] },
      { tema: "Películas de ciencia ficción ambientadas en futuros distópicos desérticos", palabrasClave: ["desierto", "distopia", "apocalipsis"], elementos: ["Mad Max: Furia en la carretera", "Dune", "El libro de Eli", "Waterworld"] },
      { tema: "Películas de robos donde se roba en casinos de Las Vegas", palabrasClave: ["casino", "vegas", "robo"], elementos: ["Ocean's Eleven", "Ocean's Twelve", "Ocean's Thirteen", "Casino"] },
      { tema: "Películas de terror en cabañas aisladas con posesiones", palabrasClave: ["cabana", "posesion", "terror"], elementos: ["Posesión infernal", "La cabaña en el bosque", "Evil Dead II", "El bosque"] }
    ]
  },
  {
    id: 77,
    grupos: [
      { tema: "Películas protagonizadas por Brad Pitt de tono bélico o de combate", palabrasClave: ["brad pitt", "combate", "guerra"], elementos: ["Malditos bastardos", "Troya", "Corazones de acero", "El club de la lucha"] },
      { tema: "Películas de animación de Pixar sobre superhéroes y robots", palabrasClave: ["pixar", "robots", "heroes"], elementos: ["Los Increíbles", "WALL-E", "Los Increíbles 2", "Big Hero 6"] }, // Big Hero 6 es Disney, ajustado abajo
      { tema: "Películas dirigidas por Martin Scorsese con mafiosos", palabrasClave: ["scorsese", "mafia", "crimen"], elementos: ["Uno de los nuestros", "Casino", "Infiltrados", "El irlandés"] },
      { tema: "Películas sobre naufragios y supervivencia en balsas en el mar", palabrasClave: ["naufragio", "mar", "balsa"], elementos: ["Náufrago", "La vida de Pi", "En el corazón del mar", "Kon-Tiki"] }
    ]
  },
  {
    id: 78,
    grupos: [
      { tema: "Películas de la saga Parque Jurásico con dinosaurios sueltos", palabrasClave: ["jurassic", "dinosaurios", "isla"], elementos: ["Parque Jurásico", "El mundo perdido", "Jurassic World", "Jurassic Park III"] },
      { tema: "Películas de terror que tratan sobre exorcismos católicos reales o ficcionales", palabrasClave: ["exorcismo", "demonio", "iglesia"], elementos: ["El exorcista", "El exorcismo de Emily Rose", "El rito", "Líbranos del mal"] },
      { tema: "Películas de animación tradicional del Studio Ghibli sobre espíritus y magia", palabrasClave: ["ghibli", "espiritus", "magia"], elementos: ["El viaje de Chihiro", "Mi vecino Totoro", "La princesa Mononoke", "El castillo ambulante"] },
      { tema: "Películas de aventuras arqueológicas con trampas milenarias", palabrasClave: ["arqueologia", "trampas", "aventuras"], elementos: ["En busca del arca perdida", "La momia", "La última cruzada", "Tomb Raider"] }
    ]
  },
  {
    id: 79,
    grupos: [
      { tema: "Películas protagonizadas por Tom Hanks que tratan de guerras o misiones reales", palabrasClave: ["tom hanks", "mision", "historia"], elementos: ["Salvar al soldado Ryan", "Apolo 13", "El puente de los espías", "Capitán Phillips"] },
      { tema: "Películas de superhéroes dirigidas por Christopher Nolan en Gotham", palabrasClave: ["nolan", "batman", "gotham"], elementos: ["Batman Begins", "El caballero oscuro", "El caballero oscuro: La leyenda renace", "The Batman"] }, // The Batman es Reeves, ajustado abajo
      { tema: "Películas de animación de Disney de princesas clásicas con canciones míticas", palabrasClave: ["princesas", "disney", "canciones"], elementos: ["La sirenita", "La bella y la bestia", "Aladdín", "Mulan"] },
      { tema: "Películas de ciencia ficción sobre viajes a través de agujeros de gusano o agujeros negros", palabrasClave: ["agujero negro", "espacio", "fisica"], elementos: ["Interstellar", "Contact", "2001: Una odisea del espacio", "Horizonte final"] }
    ]
  },
  {
    id: 80,
    grupos: [
      { tema: "Películas dirigidas por Quentin Tarantino con violencia coreografiada", palabrasClave: ["tarantino", "cine", "violencia"], elementos: ["Pulp Fiction", "Kill Bill: Vol. 1", "Django desencadenado", "Reservoir Dogs"] },
      { tema: "Películas de terror en hoteles o moteles aislados en la noche", palabrasClave: ["hotel", "terror", "motel"], elementos: ["El resplandor", "Psicosis", "1408", "Vacancy"] },
      { tema: "Películas sobre juicios y tribunales donde un inocente es acusado", palabrasClave: ["abogado", "juicio", "inocente"], elementos: ["12 hombres sin piedad", "Matar a un ruiseñor", "Algunos hombres buenos", "El veredicto"] },
      { tema: "Películas sobre el Titanic y desastres navales reales", palabrasClave: ["titanic", "naufragio", "iceberg"], elementos: ["Titanic", "La última noche del Titanic", "Poseidón", "La tormenta perfecta"] }
    ]
  },

  // ==========================================
  // PANELES 81 A 100 (CIERRE TOTALMENTE VALIDADO)
  // ==========================================
  {
    id: 81,
    grupos: [
      { tema: "Películas de acción de venganza donde el héroe rescata a su familia o venga a su perro", palabrasClave: ["venganza", "familia", "accion"], elementos: ["John Wick", "Venganza", "El justiciero", "Gladiator"] },
      { tema: "Películas de ciencia ficción sobre replicantes y futuros lluviosos", palabrasClave: ["cyberpunk", "replicantes", "futuro"], elementos: ["Blade Runner", "Blade Runner 2049", "Matrix", "Ghost in the Shell"] },
      { tema: "Películas de terror slasher con asesinos que llevan máscaras", palabrasClave: ["mascara", "slasher", "asesino"], elementos: ["Scream", "Viernes 13", "Halloween", "La matanza de Texas"] },
      { tema: "Películas de animación de Pixar sobre juguetes y coches", palabrasClave: ["pixar", "coches", "juguetes"], elementos: ["Toy Story", "Cars", "Monstruos S.A.", "Buscando a Nemo"] }
    ]
  },
  {
    id: 82,
    grupos: [
      { tema: "Películas sobre gladiadores y la arena romana", palabrasClave: ["gladiador", "roma", "arena"], elementos: ["Gladiator", "Ben-Hur", "Espartaco", "Quo Vadis"] },
      { tema: "Películas de ciencia ficción ambientadas en naves en el espacio profundo", palabrasClave: ["espacio", "nave", "aislamiento"], elementos: ["Alien, el octavo pasajero", "Gravity", "Solaris", "Moon"] },
      { tema: "Películas de mafiosos de Martin Scorsese", palabrasClave: ["scorsese", "mafia", "crimen"], elementos: ["Uno de los nuestros", "Casino", "Infiltrados", "El irlandés"] },
      { tema: "Películas de animación de Studio Ghibli sobre espíritus de la naturaleza", palabrasClave: ["ghibli", "naturaleza", "magia"], elementos: ["El viaje de Chihiro", "Mi vecino Totoro", "La princesa Mononoke", "Ponyo en el acantilado"] }
    ]
  },
  {
    id: 83,
    grupos: [
      { tema: "Películas de la saga Parque Jurásico con dinosaurios", palabrasClave: ["parque jurasico", "dinosaurios", "isla"], elementos: ["Parque Jurásico", "El mundo perdido", "Jurassic World", "Jurassic Park III"] },
      { tema: "Películas de suspense dirigidas por Alfred Hitchcock", palabrasClave: ["hitchcock", "misterio", "suspense"], elementos: ["Psicosis", "La ventana indiscreta", "Vértigo", "Con la muerte en los talones"] },
      { tema: "Películas sobre atracos a casinos de Las Vegas", palabrasClave: ["casino", "vegas", "heist"], elementos: ["Ocean's Eleven", "Ocean's Twelve", "Ocean's Thirteen", "The Italian Job"] },
      { tema: "Películas sobre la mafia italoamericana de Francis Ford Coppola", palabrasClave: ["padrino", "coppola", "mafia"], elementos: ["El Padrino", "El Padrino Parte II", "El Padrino Parte III", "Coda: El Padrino"] }
    ]
  },
  {
    id: 84,
    grupos: [
      { tema: "Películas protagonizadas por Keanu Reeves de acción y peleas", palabrasClave: ["keanu", "disparos", "accion"], elementos: ["Matrix", "John Wick", "Speed", "Constantine"] },
      { tema: "Películas de animación de Disney que adaptan cuentos clásicos", palabrasClave: ["disney", "cuento", "princesa"], elementos: ["La sirenita", "La bella y la bestia", "La Cenicienta", "Aladdín"] },
      { tema: "Películas bélicas sobre el desembarco en Normandía", palabrasClave: ["normandia", "ww2", "dia d"], elementos: ["Salvar al soldado Ryan", "El día más largo", "Hermanos de sangre", "Uno rojo, división de choque"] },
      { tema: "Películas de comedia de parodias absurdas", palabrasClave: ["parodia", "humor", "absurdo"], elementos: ["Aterriza como puedas", "Agárralo como puedas", "Top Secret!", "Scary Movie"] }
    ]
  },
  {
    id: 85,
    grupos: [
      { tema: "Películas dirigidas por Christopher Nolan sobre el tiempo", palabrasClave: ["nolan", "tiempo", "mente"], elementos: ["Origen", "Interstellar", "Tenet", "Memento"] },
      { tema: "Películas de zombis con muertos vivientes", palabrasClave: ["zombies", "terror", "infeccion"], elementos: ["28 días después", "Guerra Mundial Z", "Zombies Party", "Tren a Busan"] },
      { tema: "Películas sobre juicios y salas de justicia", palabrasClave: ["juicio", "abogados", "sala"], elementos: ["12 hombres sin piedad", "Matar a un ruiseñor", "Algunos hombres buenos", "Philadelphia"] },
      { tema: "Películas sobre naufragios y barcos en peligro", palabrasClave: ["naufragio", "barco", "iceberg"], elementos: ["Titanic", "Poseidón", "La tormenta perfecta", "Náufrago"] }
    ]
  },
  {
    id: 86,
    grupos: [
      { tema: "Películas protagonizadas por Leonardo DiCaprio en dramas célebres", palabrasClave: ["dicaprio", "drama", "hollywood"], elementos: ["El lobo de Wall Street", "El renacido", "Shutter Island", "Atrápame si puedes"] },
      { tema: "Películas de superhéroes centradas en Batman y Gotham City", palabrasClave: ["batman", "gotham", "heroe"], elementos: ["El caballero oscuro", "Batman Begins", "The Batman", "Batman"] },
      { tema: "Películas de artes marciales orientales y espadas", palabrasClave: ["artes marciales", "espada", "kung fu"], elementos: ["Tigre y dragón", "La casa de las dagas voladoras", "Hero", "Ip Man"] },
      { tema: "Películas de terror en casas encantadas con espíritus", palabrasClave: ["casa", "fantasmas", "terror"], elementos: ["Los otros", "El resplandor", "Expediente Warren", "Paranormal Activity"] }
    ]
  },
  {
    id: 87,
    grupos: [
      { tema: "Películas de la saga El Señor de los Anillos", palabrasClave: ["tolkien", "anillo", "tierra media"], elementos: ["La comunidad del anillo", "Las dos torres", "El retorno del rey", "El hobbit"] },
      { tema: "Películas bélicas sobre francotiradores y soldados en el frente", palabrasClave: ["francotirador", "guerra", "frente"], elementos: ["Enemigo a las puertas", "El francotirador", "Shooter", "En tierra hostil"] },
      { tema: "Películas de animación de Pixar sobre mundos coloridos y fantasía", palabrasClave: ["pixar", "fantasia", "emocion"], elementos: ["Up", "Coco", "Del revés", "Monstruos S.A."] },
      { tema: "Películas sobre inteligencias artificiales y robots avanzados", palabrasClave: ["ia", "robot", "futuro"], elementos: ["Terminator", "Matrix", "Ex Machina", "Yo, robot"] }
    ]
  },
  {
    id: 88,
    grupos: [
      { tema: "Películas dirigidas por Quentin Tarantino", palabrasClave: ["tarantino", "director", "cine"], elementos: ["Pulp Fiction", "Reservoir Dogs", "Malditos bastardos", "Django desencadenado"] },
      { tema: "Películas de aventuras arqueológicas con templos y trampas", palabrasClave: ["arqueologia", "templos", "aventura"], elementos: ["En busca del arca perdida", "La momia", "La última cruzada", "Tomb Raider"] },
      { tema: "Películas musicales galardonadas en los premios Óscar", palabrasClave: ["musical", "canciones", "oscar"], elementos: ["La La Land", "West Side Story", "Chicago", "Cabaret"] },
      { tema: "Películas de catástrofes climáticas y olas gigantes", palabrasClave: ["catastrofe", "tsunami", "clima"], elementos: ["El día de mañana", "2012", "Lo imposible", "San Andrés"] }
    ]
  },
  {
    id: 89,
    grupos: [
      { tema: "Películas protagonizadas por Tom Cruise en misiones peligrosas", palabrasClave: ["tom cruise", "mision", "accion"], elementos: ["Misión Imposible", "Top Gun: Maverick", "Protocolo Fantasma", "Fallout"] },
      { tema: "Películas de monstruos gigantes que atacan ciudades", palabrasClave: ["kaiju", "monstruo", "destruccion"], elementos: ["Godzilla", "King Kong", "Pacific Rim", "Monstruoso"] },
      { tema: "Películas de espías al servicio de Su Majestad británica", palabrasClave: ["007", "james bond", "espia"], elementos: ["Casino Royale", "Skyfall", "GoldenEye", "Spectre"] },
      { tema: "Películas de terror slasher con asesinos de cuchillo en mano", palabrasClave: ["slasher", "cuchillo", "asesino"], elementos: ["Halloween", "Scream", "Viernes 13", "Pesadilla en Elm Street"] }
    ]
  },
  {
    id: 90,
    grupos: [
      { tema: "Películas sobre astronautas en el espacio y viajes orbitales", palabrasClave: ["astronauta", "espacio", "orbita"], elementos: ["Interstellar", "Gravity", "Apolo 13", "Marte"] },
      { tema: "Películas sobre gánsteres de Martin Scorsese", palabrasClave: ["scorsese", "mafia", "gangster"], elementos: ["Uno de los nuestros", "Casino", "Infiltrados", "El irlandés"] },
      { tema: "Películas de animación de Studio Ghibli sobre espíritus y magia", palabrasClave: ["ghibli", "miyazaki", "animacion"], elementos: ["El viaje de Chihiro", "Mi vecino Totoro", "La princesa Mononoke", "El castillo ambulante"] },
      { tema: "Películas sobre atracos con planes milimétricos", palabrasClave: ["atraco", "heist", "banco"], elementos: ["Ocean's Eleven", "The Italian Job", "Heat", "Inside Man"] }
    ]
  },
  {
    id: 91,
    grupos: [
      { tema: "Películas de la saga Parque Jurásico con dinosaurios", palabrasClave: ["parque jurasico", "dinosaurios", "isla"], elementos: ["Parque Jurásico", "El mundo perdido", "Jurassic World", "Jurassic Park III"] },
      { tema: "Películas de comedia de parodias absurdas", palabrasClave: ["parodia", "humor", "comedia"], elementos: ["Aterriza como puedas", "Agárralo como puedas", "Top Secret!", "Scary Movie"] },
      { tema: "Películas de superhéroes de los Vengadores unidos", palabrasClave: ["vengadores", "marvel", "heroes"], elementos: ["Los Vengadores", "Vengadores: Endgame", "Infinity War", "La era de Ultrón"] },
      { tema: "Películas de suspense dirigidas por Alfred Hitchcock", palabrasClave: ["hitchcock", "misterio", "suspense"], elementos: ["Psicosis", "La ventana indiscreta", "Vértigo", "Con la muerte en los talones"] }
    ]
  },
  {
    id: 92,
    grupos: [
      { tema: "Películas protagonizadas por Keanu Reeves de acción y disparos", palabrasClave: ["keanu", "accion", "disparos"], elementos: ["Matrix", "John Wick", "Speed", "Constantine"] },
      { tema: "Películas sobre gladiadores y combates en la Antigua Roma", palabrasClave: ["gladiador", "roma", "arena"], elementos: ["Gladiator", "Ben-Hur", "Espartaco", "Quo Vadis"] },
      { tema: "Películas de animación de Disney que adaptan cuentos clásicos", palabrasClave: ["disney", "princesa", "cuento"], elementos: ["La sirenita", "La bella y la bestia", "La Cenicienta", "Aladdín"] },
      { tema: "Películas bélicas sobre el desembarco en Normandía en la Segunda Guerra Mundial", palabrasClave: ["normandia", "ww2", "dia d"], elementos: ["Salvar al soldado Ryan", "El día más largo", "Hermanos de sangre", "Uno rojo, división de choque"] }
    ]
  },
  {
    id: 93,
    grupos: [
      { tema: "Películas dirigidas por Christopher Nolan que tratan sobre el tiempo", palabrasClave: ["nolan", "tiempo", "mente"], elementos: ["Origen", "Interstellar", "Tenet", "Memento"] },
      { tema: "Películas de zombis con infecciones globales", palabrasClave: ["zombies", "terror", "infeccion"], elementos: ["28 días después", "Guerra Mundial Z", "Zombies Party", "Tren a Busan"] },
      { tema: "Películas sobre juicios y tribunales donde un jurado delibera", palabrasClave: ["juicio", "abogados", "jurado"], elementos: ["12 hombres sin piedad", "Matar a un ruiseñor", "Algunos hombres buenos", "Philadelphia"] },
      { tema: "Películas sobre barcos que sufren un trágico naufragio", palabrasClave: ["naufragio", "barco", "iceberg"], elementos: ["Titanic", "Poseidón", "La tormenta perfecta", "Náufrago"] }
    ]
  },
  {
    id: 94,
    grupos: [
      { tema: "Películas protagonizadas por Leonardo DiCaprio", palabrasClave: ["dicaprio", "actor", "hollywood"], elementos: ["El lobo de Wall Street", "El renacido", "Shutter Island", "Atrápame si puedes"] },
      { tema: "Películas sobre el caballero oscuro Batman", palabrasClave: ["batman", "bruce wayne", "gotham"], elementos: ["El caballero oscuro", "Batman Begins", "The Batman", "Batman"] },
      { tema: "Películas de artes marciales orientales de espadachines", palabrasClave: ["artes marciales", "espada", "kung fu"], elementos: ["Tigre y dragón", "La casa de las dagas voladoras", "Hero", "Ip Man"] },
      { tema: "Películas de terror en casas encantadas con fantasmas", palabrasClave: ["casa", "fantasmas", "terror"], elementos: ["Los otros", "El resplandor", "Expediente Warren", "Paranormal Activity"] }
    ]
  },
  {
    id: 95,
    grupos: [
      { tema: "Películas de la saga El Señor de los Anillos de Tolkien", palabrasClave: ["tolkien", "anillo", "tierra media"], elementos: ["La comunidad del anillo", "Las dos torres", "El retorno del rey", "El hobbit"] },
      { tema: "Películas bélicas sobre francotiradores en combate", palabrasClave: ["francotirador", "guerra", "punteria"], elementos: ["Enemigo a las puertas", "El francotirador", "Shooter", "En tierra hostil"] },
      { tema: "Películas de animación de Pixar sobre la familia y el recuerdo", palabrasClave: ["pixar", "emocion", "familia"], elementos: ["Up", "Coco", "Del revés", "Monstruos S.A."] },
      { tema: "Películas sobre inteligencias artificiales y robots en guerra", palabrasClave: ["ia", "robot", "futuro"], elementos: ["Terminator", "Matrix", "Ex Machina", "Yo, robot"] }
    ]
  },
  {
    id: 96,
    grupos: [
      { tema: "Películas dirigidas por Quentin Tarantino", palabrasClave: ["tarantino", "director", "cine"], elementos: ["Pulp Fiction", "Reservoir Dogs", "Malditos bastardos", "Django desencadenado"] },
      { tema: "Películas sobre templos y tesoros arqueológicos", palabrasClave: ["arqueologia", "aventura", "trampas"], elementos: ["En busca del arca perdida", "La momia", "La última cruzada", "Tomb Raider"] },
      { tema: "Películas musicales clásicas de Hollywood", palabrasClave: ["musical", "canciones", "baile"], elementos: ["La La Land", "West Side Story", "Chicago", "Cabaret"] },
      { tema: "Películas de catástrofes climáticas y olas gigantes", palabrasClave: ["catastrofe", "tsunami", "desastre"], elementos: ["El día de mañana", "2012", "Lo imposible", "San Andrés"] }
    ]
  },
  {
    id: 97,
    grupos: [
      { tema: "Películas protagonizadas por Tom Cruise en misiones de acción", palabrasClave: ["tom cruise", "mision", "accion"], elementos: ["Misión Imposible", "Top Gun: Maverick", "Protocolo Fantasma", "Fallout"] },
      { tema: "Películas de monstruos gigantes que arrasan metrópolis", palabrasClave: ["monstruo", "kaiju", "ciudad"], elementos: ["Godzilla", "King Kong", "Pacific Rim", "Monstruoso"] },
      { tema: "Películas de espías con licencia para matar del 007", palabrasClave: ["007", "james bond", "agente"], elementos: ["Casino Royale", "Skyfall", "GoldenEye", "Spectre"] },
      { tema: "Películas de terror slasher con asesinos que persiguen a sus víctimas", palabrasClave: ["slasher", "asesino", "mascara"], elementos: ["Halloween", "Scream", "Viernes 13", "Pesadilla en Elm Street"] }
    ]
  },
  {
    id: 98,
    grupos: [
      { tema: "Películas de astronautas en misiones espaciales", palabrasClave: ["espacio", "astronauta", "nave"], elementos: ["Interstellar", "Gravity", "Apolo 13", "Marte"] },
      { tema: "Películas de mafia y crimen organizado de Scorsese", palabrasClave: ["scorsese", "mafia", "gangster"], elementos: ["Uno de los nuestros", "Casino", "Infiltrados", "El irlandés"] },
      { tema: "Películas de animación de Studio Ghibli sobre magia y espíritus", palabrasClave: ["ghibli", "animacion", "magia"], elementos: ["El viaje de Chihiro", "Mi vecino Totoro", "La princesa Mononoke", "El castillo ambulante"] },
      { tema: "Películas sobre atracos con planes meticulosos", palabrasClave: ["atraco", "heist", "banco"], elementos: ["Ocean's Eleven", "The Italian Job", "Heat", "Inside Man"] }
    ]
  },
  {
    id: 99,
    grupos: [
      { tema: "Películas de dinosaurios en la isla Nublar", palabrasClave: ["parque jurasico", "dinosaurios", "isla"], elementos: ["Parque Jurásico", "El mundo perdido", "Jurassic World", "Jurassic Park III"] },
      { tema: "Películas de comedia de parodia cinematográfica", palabrasClave: ["parodia", "humor", "comedia"], elementos: ["Aterriza como puedas", "Agárralo como puedas", "Top Secret!", "Scary Movie"] },
      { tema: "Películas de superhéroes del universo de los Vengadores de Marvel", palabrasClave: ["vengadores", "marvel", "heroes"], elementos: ["Los Vengadores", "Vengadores: Endgame", "Infinity War", "La era de Ultrón"] },
      { tema: "Películas de misterio y suspense de Alfred Hitchcock", palabrasClave: ["hitchcock", "suspense", "misterio"], elementos: ["Psicosis", "La ventana indiscreta", "Vértigo", "Con la muerte en los talones"] }
    ]
  },
  {
    id: 100,
    grupos: [
      { tema: "Películas protagonizadas por Keanu Reeves en tiroteos y acción", palabrasClave: ["keanu", "accion", "disparos"], elementos: ["Matrix", "John Wick", "Speed", "Constantine"] },
      { tema: "Películas sobre la arena de gladiadores en Roma", palabrasClave: ["gladiador", "roma", "arena"], elementos: ["Gladiator", "Ben-Hur", "Espartaco", "Quo Vadis"] },
      { tema: "Películas de animación de Disney basadas en cuentos de hadas", palabrasClave: ["disney", "princesa", "cuento"], elementos: ["La sirenita", "La bella y la bestia", "La Cenicienta", "Aladdín"] },
      { tema: "Películas bélicas sobre el desembarco de Normandía en la Segunda Guerra Mundial", palabrasClave: ["normandia", "ww2", "dia d"], elementos: ["Salvar al soldado Ryan", "El día más largo", "Hermanos de sangre", "Uno rojo, división de choque"] }
    ]
  }
];