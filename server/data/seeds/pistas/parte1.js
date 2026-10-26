import { pt } from './helper.js';

export const PARTE_1 = [
  // --- OBJETOS Y UTENSILIOS (p1 - p10) ---
  pt('p1', 'Frigorífico', ['nevera', 'refrigerador'], [
    'Es un elemento material de fabricación humana.',
    'Su funcionamiento depende de una conexión a una fuente de energía externa.',
    'Fue diseñado para ralentizar procesos naturales de degradación.',
    'Mantiene un clima artificial constante en los distintos compartimentos de su interior.',
    'Es un mueble grande con una puerta vertical que suele ubicarse en la cocina.',
    'Electrodoméstico que enfría y congela los alimentos para que no se estropeen.'
  ]),
  pt('p2', 'Paraguas', ['sombrilla'], [
    'Es un utensilio portátil diseñado para el uso individual.',
    'Su estructura combina materiales rígidos con partes flexibles.',
    'Su utilidad está estrictamente ligada a las condiciones atmosféricas del momento.',
    'Posee un mecanismo que le permite expandirse y retraerse según la necesidad.',
    'Se sostiene por un mango inferior y crea una cúpula de tela sobre la cabeza.',
    'Accesorio que se abre para protegerse de la lluvia y no mojarse.'
  ]),
  pt('p3', 'Espejo', ['espejos'], [
    'Es un objeto sólido inanimado.',
    'Se encuentra habitualmente fijado a paredes o integrado en mobiliario.',
    'Su principal función depende completamente de la presencia de luz ambiental.',
    'Posee una superficie plana, lisa y extremadamente pulida que a menudo es frágil.',
    'La gente lo utiliza a diario para comprobar su aspecto antes de salir de casa.',
    'Superficie de cristal que refleja de manera idéntica la imagen de quien se pone delante.'
  ]),
  pt('p4', 'Cafetera', ['cafetera italiana', 'cafetera express'], [
    'Es un aparato de uso cotidiano.',
    'Requiere líquidos y variaciones térmicas para cumplir su propósito.',
    'Forma parte de la rutina matutina de millones de personas en todo el mundo.',
    'Funciona sometiendo un producto vegetal molido a agua a alta temperatura o presión.',
    'Al funcionar desprende un aroma intenso y produce una bebida oscura y estimulante.',
    'Máquina o utensilio que sirve específicamente para preparar café.'
  ]),
  pt('p5', 'Gafas', ['lentes', 'anteojos'], [
    'Es un objeto personal de tamaño reducido.',
    'Está fabricado combinando una estructura de soporte con elementos transparentes.',
    'Su uso modifica directamente la forma en la que el usuario percibe el entorno.',
    'Se apoya en tres puntos específicos del rostro humano para mantenerse estable.',
    'Consiste en una montura con dos lentes que se coloca delante de los ojos.',
    'Accesorio que mejora la visión de quienes tienen miopía o protege del sol.'
  ]),
  pt('p6', 'Tijeras', ['las tijeras'], [
    'Es un instrumento mecánico simple.',
    'Su diseño se basa en el principio físico de la palanca.',
    'Requiere la aplicación de fuerza manual coordinada para realizar su función.',
    'Se compone de dos piezas metálicas cruzadas sobre un eje central.',
    'Tiene dos orificios en un extremo para introducir los dedos y hojas afiladas en el otro.',
    'Herramienta manual que sirve para cortar papel, tela o el pelo.'
  ]),
  pt('p7', 'Cepillo de dientes', ['el cepillo de dientes'], [
    'Es un utensilio de uso estrictamente individual.',
    'Está presente en prácticamente todos los hogares modernos.',
    'Su utilización está ligada a los hábitos de higiene diaria.',
    'Suele requerir el uso complementario de una pasta aromática e interactuar con agua.',
    'Posee un mango alargado y un cabezal cubierto de cerdas sintéticas cortas.',
    'Objeto que se usa frotándolo en la boca para limpiar la dentadura tras las comidas.'
  ]),
  pt('p8', 'Sartén', ['la sarten'], [
    'Es un artículo resistente a condiciones extremas.',
    'Está compuesto por materiales con alta conductividad térmica.',
    'Juega un papel fundamental en la alteración química de otros productos.',
    'Tiene una base circular ancha y plana acompañada de un mango lateral largo.',
    'Suele estar recubierta de teflón u otros materiales antiadherentes y usa aceite.',
    'Utensilio metálico de cocina donde se fríen los huevos o se hace la tortilla.'
  ]),
  pt('p9', 'Reloj', ['el reloj', 'relojes'], [
    'Es un dispositivo de medición.',
    'Puede estar basado en principios mecánicos, analógicos o electrónicos.',
    'Sirve para cuantificar y organizar una magnitud física invisible.',
    'En los modelos clásicos, su funcionamiento emite un sonido rítmico y constante.',
    'Lleva números grabados y manecillas, o una pantalla digital, y se lleva en la muñeca.',
    'Aparato que sirve para consultar la hora, los minutos y los segundos.'
  ]),
  pt('p10', 'Llave', ['las llaves'], [
    'Es un objeto sólido de pequeño tamaño.',
    'Suele estar fabricado a partir de aleaciones metálicas duras.',
    'Su diseño incorpora un patrón geométrico único destinado a encajar en un único lugar.',
    'Garantiza la seguridad y restringe el acceso a espacios o contenedores privados.',
    'A menudo se transportan varias agrupadas en una anilla dentro del bolsillo.',
    'Pieza metálica dentada que se introduce en una cerradura para abrir puertas.'
  ]),

  // --- CIUDADES Y LUGARES (p11 - p20) ---
  pt('p11', 'París', ['paris'], [
    'Es un asentamiento humano de gran tamaño.',
    'Se encuentra geográficamente en el hemisferio norte.',
    'Ha sido el epicentro de movimientos culturales y revoluciones históricas.',
    'Su trazado urbano está dividido en dos grandes mitades por el cauce de un río.',
    'Es conocida mundialmente como la Ciudad de la Luz y alberga el Museo del Louvre.',
    'Capital de Francia coronada por la famosa Torre Eiffel.'
  ]),
  pt('p12', 'Tokio', ['tokyo'], [
    'Es un núcleo de población excepcionalmente denso.',
    'Se ubica en un territorio de naturaleza insular.',
    'Destaca por un enorme contraste entre rascacielos tecnológicos y templos antiguos.',
    'Es el epicentro mundial de las industrias del manga, el anime y los videojuegos.',
    'Alberga el famoso y caótico cruce peatonal de Shibuya.',
    'Capital de Japón.'
  ]),
  pt('p13', 'Nueva York', ['new york', 'nyc'], [
    'Es un foco de aglomeración urbana internacional.',
    'Se desarrolló históricamente como un importante puerto comercial.',
    'Su estructura administrativa se divide en cinco grandes distritos diferentes.',
    'Es el corazón financiero de Estados Unidos gracias a la bolsa de Wall Street.',
    'Se la apoda "La Gran Manzana" y cuenta con el parque Central Park.',
    'Gran metrópolis estadounidense famosa por Times Square y la Estatua de la Libertad.'
  ]),
  pt('p14', 'Roma', ['roma'], [
    'Es una urbe de origen milenario.',
    'Su geografía original se asienta sobre un relieve de suaves colinas.',
    'Fue el centro administrativo de uno de los mayores imperios de la Antigüedad.',
    'En su interior alberga el territorio soberano más pequeño del mundo: el Vaticano.',
    'Cuenta con ruinas famosas, foros y la turística Fontana di Trevi.',
    'Capital de Italia apodada "La Ciudad Eterna", donde se sitúa el Coliseo.'
  ]),
  pt('p15', 'Egipto', ['republica arabe de egipto'], [
    'Es una nación soberana.',
    'Su climatología se caracteriza por la aridez y las altas temperaturas.',
    'El desarrollo de su civilización dependió vitalmente de las crecidas de un río.',
    'Sus antiguos monarcas recibían un título específico y eran considerados dioses.',
    'A orillas del río Nilo se asientan enormes templos llenos de jeroglíficos.',
    'País africano famoso por las momias, los faraones y las pirámides de Guiza.'
  ]),
  pt('p16', 'Londres', ['london'], [
    'Es un gran centro metropolitano.',
    'Su localización geográfica pertenece al continente europeo.',
    'Sufrió devastadores incendios en el pasado y soportó asedios aéreos en el siglo XX.',
    'Es conocida por su densa niebla, sus guardias reales y sus autobuses de dos pisos.',
    'La atraviesa el río Támesis y tiene una gran torre de reloj llamada Big Ben.',
    'Capital de Inglaterra y del Reino Unido.'
  ]),
  pt('p17', 'Madrid', ['villa de madrid'], [
    'Es un núcleo urbano de interior.',
    'Se sitúa sobre una meseta a una altitud considerable sobre el nivel del mar.',
    'Su emblema oficial incluye la figura de un animal interactuando con un árbol.',
    'Las victorias deportivas se celebran habitualmente en torno a la fuente de Cibeles.',
    'En su centro neurálgico se encuentra el kilómetro cero en la Puerta del Sol.',
    'Capital de España.'
  ]),
  pt('p18', 'Brasil', ['brasil'], [
    'Es un Estado soberano de gran extensión.',
    'Su territorio ocupa una enorme porción del hemisferio sur.',
    'Es mundialmente reconocido por su biodiversidad y su exportación de café.',
    'Alberga en sus fronteras la mayor cuenca fluvial y selva tropical del planeta.',
    'Es una potencia del fútbol mundial y celebra un inmenso carnaval en Río de Janeiro.',
    'El país más grande de América del Sur, cuya lengua oficial es el portugués.'
  ]),
  pt('p19', 'Venecia', ['venezia'], [
    'Es un asentamiento humano histórico.',
    'Se desarrolló en un entorno geográfico de gran fragilidad y nivel freático alto.',
    'La peculiaridad de sus calles imposibilita por completo el tráfico rodado.',
    'Está conformada por decenas de islas pequeñas conectadas por cientos de puentes.',
    'Es célebre por su carnaval de máscaras, la Plaza de San Marcos y sus góndolas.',
    'Ciudad italiana donde no hay coches, sino canales de agua para navegar.'
  ]),
  pt('p20', 'Monte Everest', ['everest'], [
    'Es una prominencia geográfica natural.',
    'Se encuentra en el continente asiático.',
    'Sus condiciones ambientales son hostiles e imposibilitan la vida permanente.',
    'Forma parte de la cordillera montañosa más imponente de todo el globo.',
    'Miles de alpinistas intentan escalar su cumbre enfrentándose a la falta de oxígeno.',
    'La montaña más alta y famosa de todo el planeta Tierra.'
  ]),

  // --- PERSONAJES FAMOSOS E HISTÓRICOS (p21 - p30) ---
  pt('p21', 'Albert Einstein', ['einstein'], [
    'Es una figura histórica real.',
    'Dedicó su vida a intentar comprender el funcionamiento de la naturaleza.',
    'Sus aportaciones cambiaron por completo los paradigmas científicos de su época.',
    'Su imagen icónica, a menudo desaliñada y sacando la lengua, es mundialmente famosa.',
    'Estableció la equivalencia entre masa y energía con la ecuación E = mc².',
    'Físico que formuló la Teoría de la Relatividad y ganó el Premio Nobel en 1921.'
  ]),
  pt('p22', 'Leonardo da Vinci', ['da vinci'], [
    'Es un personaje del pasado europeo.',
    'Sobresalió por dominar simultáneamente multitud de disciplinas muy dispares.',
    'Es el arquetipo histórico de lo que se conoce como un hombre del Renacimiento.',
    'Llenó cuadernos con bocetos de máquinas voladoras, anatomía y botánica.',
    'Pintó el famoso mural de La Última Cena y dibujó el Hombre de Vitruvio.',
    'Genio italiano del Renacimiento que pintó el célebre cuadro de La Gioconda.'
  ]),
  pt('p23', 'Lionel Messi', ['messi', 'leo messi'], [
    'Es una figura pública contemporánea.',
    'Su trayectoria está vinculada al esfuerzo físico y a la competición al máximo nivel.',
    'Abandonó su país natal sudamericano en su juventud para forjar su carrera en Europa.',
    'Se ha caracterizado por su baja estatura, su regate imparable y llevar el dorsal 10.',
    'Ha ganado múltiples Balones de Oro y pasó la mayor parte de su carrera en el Barcelona.',
    'Astro del fútbol argentino que ganó la Copa del Mundo en Qatar 2022.'
  ]),
  pt('p24', 'William Shakespeare', ['shakespeare'], [
    'Es un exponente clave de la cultura humana.',
    'Produjo su obra en Europa durante los siglos XVI y XVII.',
    'Su legado se centra en la representación dramática y el estudio de las pasiones.',
    'Sus obras se estrenaban habitualmente en un famoso teatro circular llamado The Globe.',
    'Escribió frases inmortales como "Ser o no ser, esa es la cuestión".',
    'El dramaturgo inglés más famoso de la historia, autor de Romeo y Julieta.'
  ]),
  pt('p25', 'Cleopatra', ['cleopatra vii'], [
    'Es una personalidad del pasado remoto.',
    'Ejerció el poder supremo sobre una de las naciones más ricas de la Antigüedad.',
    'Dominaba varios idiomas y utilizó la diplomacia para proteger la soberanía de su tierra.',
    'Tuvo sonados romances políticos y personales con Julio César y Marco Antonio.',
    'La leyenda cuenta que se quitó la vida dejándose morder por una serpiente venenosa.',
    'La reina más famosa del Antiguo Egipto.'
  ]),
  pt('p26', 'Cristiano Ronaldo', ['cr7'], [
    'Es una figura internacional en activo.',
    'Ha dedicado su vida a la disciplina deportiva y al entrenamiento estricto.',
    'Sus saltos atléticos y su potencia física han marcado su trayectoria profesional.',
    'Es conocido mundialmente por llevar el número 7 en la espalda de sus camisetas.',
    'Logró cinco Balones de Oro y es el máximo goleador histórico del Real Madrid.',
    'Astro del fútbol portugués famoso por su grito de celebración "¡Siuuu!".'
  ]),
  pt('p27', 'Marie Curie', ['madame curie'], [
    'Es una pionera en el campo de la investigación.',
    'Su trabajo sentó las bases para importantes descubrimientos del siglo XX.',
    'Su constante exposición a su propio objeto de estudio acabó deteriorando su salud.',
    'Descubrió nuevos elementos químicos y fue la primera persona en ganar dos premios Nobel.',
    'Junto a su marido, logró aislar el polonio y el radio en su laboratorio.',
    'Famosa científica de origen polaco pionera en el estudio de la radiactividad.'
  ]),
  pt('p28', 'Napoleón Bonaparte', ['napoleon'], [
    'Es un personaje clave de la historia militar.',
    'Ascendió al poder aprovechando la inestabilidad de un gran proceso revolucionario.',
    'Redactó un código civil que sigue siendo la base del derecho en muchos países.',
    'Conquistó gran parte del continente europeo pero fracasó en su invasión a Rusia.',
    'Fue exiliado a una isla tras ser derrotado de manera definitiva en la batalla de Waterloo.',
    'Famoso emperador militar francés que solía ser retratado con la mano en el chaleco.'
  ]),
  pt('p29', 'Pablo Picasso', ['picasso'], [
    'Es un individuo influyente del mundo del arte.',
    'Vivió la mayor parte de su carrera creativa fuera de su país de nacimiento.',
    'Pasó por distintas etapas creativas, conocidas por colores como el azul y el rosa.',
    'Destruyó las normas clásicas de la perspectiva mostrando varios ángulos a la vez.',
    'Fue el fundador del movimiento vanguardista conocido como el cubismo.',
    'Pintor español malagueño autor del cuadro antibelicista Guernica.'
  ]),
  pt('p30', 'Michael Jackson', ['rey del pop'], [
    'Es una estrella mundial de la industria del entretenimiento.',
    'Conoció la fama desde que era un niño actuando junto a sus hermanos.',
    'Cambió la forma de concebir los videoclips, convirtiéndolos en pequeñas películas.',
    'Llevaba guantes blancos, sombreros y popularizó un paso de baile que simulaba caminar hacia atrás.',
    'Lanzó Thriller, que sigue siendo el álbum más vendido de toda la historia de la música.',
    'Cantante estadounidense coronado como el Rey del Pop, autor de Billie Jean.'
  ]),

  // --- ANIMALES (p31 - p40) ---
  pt('p31', 'León', ['leones', 'el leon'], [
    'Es un organismo vivo y vertebrado.',
    'Sus hábitats naturales se encuentran en zonas de altas temperaturas.',
    'Basa su supervivencia en el consumo de la carne de otros animales.',
    'Cuenta con una jerarquía social estricta donde las hembras realizan la caza.',
    'Los machos adultos lucen una imponente y frondosa melena alrededor del cuello.',
    'Gran felino africano conocido tradicionalmente como el rey de la selva.'
  ]),
  pt('p32', 'Delfín', ['delfines', 'el delfin'], [
    'Es una criatura ligada a entornos acuáticos.',
    'A pesar del medio en el que vive, necesita asomarse a la superficie para respirar.',
    'Es objeto de estudio científico debido a su compleja estructura cerebral.',
    'Utiliza un avanzado sistema de chasquidos y ecos para navegar y cazar.',
    'Posee un espiráculo, piel gris lisa y fama de ser muy amigable con los humanos.',
    'Mamífero marino muy inteligente de morro curvado que salta sobre las olas.'
  ]),
  pt('p33', 'Camaleón', ['camaleones'], [
    'Es un ser vivo de sangre fría.',
    'Pertenece a un gran grupo de especies provistas de piel cubierta por escamas.',
    'Su anatomía incluye patas prensiles adaptadas para sujetarse fuertemente a las ramas.',
    'Puede mover sus dos ojos en direcciones opuestas de manera totalmente independiente.',
    'Es capaz de modificar la pigmentación de su piel para mimetizarse con el entorno.',
    'Reptil que caza insectos lanzando una lengua muy larga y cambia de color para camuflarse.'
  ]),
  pt('p34', 'Pingüino', ['pinguinos', 'el pinguino'], [
    'Es una especie perteneciente a la clase de las aves.',
    'Su organismo está biológicamente adaptado para soportar climas gélidos extremos.',
    'A lo largo de su evolución ha perdido por completo la capacidad de volar por el aire.',
    'Sus alas se han transformado en eficientes aletas para bucear a gran velocidad.',
    'Camina torpemente erguido y su plumaje blanco y negro recuerda a un traje de esmoquin.',
    'Ave marina incapaz de volar que vive en las zonas heladas de la Antártida.'
  ]),
  pt('p35', 'Elefante', ['elefantes', 'el elefante'], [
    'Es un animal vertebrado cuadrúpedo.',
    'Es capaz de consumir diariamente decenas de kilos de vegetación.',
    'Organiza su estructura familiar en manadas matriarcales de gran cohesión.',
    'Posee unos incisivos alargados que forman dos valiosos colmillos de marfil.',
    'Tiene unas orejas inmensas para disipar el calor y un apéndice nasal alargado.',
    'El animal terrestre más grande del mundo, famoso por su larga trompa.'
  ]),
  pt('p36', 'Perro', ['el perro', 'can'], [
    'Es un mamífero de costumbres terrestres.',
    'Ha estado estrechamente ligado al desarrollo humano desde la prehistoria.',
    'Fue utilizado históricamente para tareas de pastoreo, vigilancia y caza.',
    'Posee un sistema olfativo miles de veces más desarrollado que el nuestro.',
    'Mueve su cola cuando experimenta alegría y emite ladridos para alertar.',
    'Mascota doméstica de cuatro patas conocida mundialmente como el mejor amigo del hombre.'
  ]),
  pt('p37', 'Tiburón', ['tiburon', 'el tiburon'], [
    'Es una forma de vida adaptada al medio marino.',
    'Su fisiología interna carece por completo de estructura ósea dura.',
    'Es un depredador clave para mantener el equilibrio en los océanos.',
    'Su dentadura está dispuesta en varias hileras que se renuevan continuamente.',
    'Detecta mínimas gotas de sangre a distancia y su aleta dorsal aterra en las playas.',
    'Gran pez cartilaginoso temido por su agresividad, como la variedad del gran blanco.'
  ]),
  pt('p38', 'Caballo', ['el caballo', 'equino'], [
    'Es un vertebrado de gran porte.',
    'Su domesticación cambió para siempre las comunicaciones y la guerra en el mundo antiguo.',
    'Apoya su considerable peso sobre un único dedo protegido por una pezuña dura.',
    'Dispone de un paso rítmico que puede acelerar pasando del trote al galope.',
    'Lleva herraduras, crines en el cuello y se controla mediante riendas y montura.',
    'Animal de granja y campo que se monta para cabalgar y emite relinchos.'
  ]),
  pt('p39', 'Serpiente', ['serpientes', 'la serpiente'], [
    'Es un animal que depende del calor ambiental.',
    'Su anatomía se ha especializado mediante la pérdida de ciertas estructuras óseas.',
    'Crece mediante un proceso de ecdisis, donde abandona su antigua piel de una pieza.',
    'Saca repetidamente una lengua bífida para recoger partículas químicas del aire.',
    'Carece por completo de patas y se desplaza reptando o inyecta veneno al morder.',
    'Reptil alargado que sisea y se arrastra por el suelo.'
  ]),
  pt('p40', 'Ballena azul', ['la ballena azul'], [
    'Es una especie que habita el medio acuático.',
    'Pertenece biológicamente a un grupo muy distante al de los peces.',
    'No utiliza dientes para alimentarse, sino que filtra el agua para atrapar pequeños crustáceos.',
    'Sale a la superficie para respirar expulsando un enorme chorro de vapor húmedo.',
    'Su tamaño puede alcanzar los treinta metros y su corazón pesa como un coche pequeño.',
    'El mamífero marino más colosal y el animal más grande que ha existido en la Tierra.'
  ]),

  // --- SENTIMIENTOS Y CONCEPTOS ABSTRACTOS (p41 - p50) ---
  pt('p41', 'Amor', ['el amor'], [
    'Es una experiencia conceptual humana.',
    'Está profundamente arraigada en el funcionamiento psicológico y biológico.',
    'Su intensidad ha inspirado grandes sacrificios y obras maestras a lo largo de la historia.',
    'Provoca reacciones físicas como nerviosismo y lo que se describe como mariposas en el estómago.',
    'La cultura popular le dedica una celebración específica cada catorce de febrero.',
    'Sentimiento de afecto y cariño intenso que se simboliza habitualmente con un corazón.'
  ]),
  pt('p42', 'Miedo', ['el miedo', 'temor'], [
    'Es una respuesta del sistema nervioso.',
    'Está presente como instinto de supervivencia en múltiples especies animales.',
    'Prepara al organismo inyectando adrenalina para luchar o huir frente a un peligro.',
    'Sus síntomas físicos incluyen sudoración, aceleración del pulso y temblores.',
    'Es la sensación que los directores de cine buscan provocar en las películas de terror.',
    'Emoción de angustia que sentimos cuando algo nos asusta o nos amenaza.'
  ]),
  pt('p43', 'Nostalgia', ['la nostalgia'], [
    'Es un estado anímico abstracto.',
    'Se nutre casi en su totalidad de elementos pertenecientes a la memoria.',
    'Suele evocar una sensación agridulce que mezcla alegría y una sutil pena.',
    'Se activa frecuentemente al escuchar una vieja canción o revisar un cajón con fotografías.',
    'Conecta con la famosa creencia de que cualquier tiempo pasado siempre fue mejor.',
    'Sentimiento de tristeza o añoranza por momentos felices o personas del pasado.'
  ]),
  pt('p44', 'Esperanza', ['la esperanza'], [
    'Es una disposición mental y emocional.',
    'Figura históricamente entre los grandes pilares de la virtud humana.',
    'Se convierte en el último refugio psicológico cuando las circunstancias son muy adversas.',
    'En la simbología clásica de los colores, suele representarse con el tono verde.',
    'Un refrán muy popular asegura que es lo último que se debe perder.',
    'Sentimiento de confianza plena en que algo bueno sucederá en el futuro.'
  ]),
  pt('p45', 'Envidia', ['la envidia'], [
    'Es una emoción catalogada como negativa.',
    'Surge de la constante comparación social entre individuos.',
    'Es un sentimiento que casi nadie reconoce sentir en público por su mala fama.',
    'Se fundamenta en desear ardientemente las posesiones o los éxitos que otra persona disfruta.',
    'Se asocia metafóricamente con tener la mirada de color verde o morderse de rabia.',
    'Sentimiento de celos, disgusto o rencor por los logros y bienes de los demás.'
  ]),
  pt('p46', 'Felicidad', ['la felicidad', 'alegria'], [
    'Es un estado psicológico subjetivo.',
    'Muchos sistemas filosóficos la han definido como el propósito final de la existencia.',
    'Se asocia con periodos de bienestar sostenido y profunda satisfacción personal.',
    'Cuando es intensa, empuja a las personas a celebrar, saltar o reír a carcajadas.',
    'Su signo exterior más universal y reconocible es esbozar una gran sonrisa.',
    'Sentimiento de alegría plena y dicha con la propia vida.'
  ]),
  pt('p47', 'Ira', ['la ira', 'rabia', 'enfado'], [
    'Es una reacción visceral intensa.',
    'Históricamente ha sido clasificada entre los peores vicios o defectos de carácter.',
    'Se desencadena como respuesta directa a una ofensa, engaño o injusticia.',
    'Físicamente provoca que la persona apriete los puños, los dientes y frunza el ceño.',
    'Coloquialmente se describe como que a uno le hierve la sangre o lo ve todo rojo.',
    'Emoción destructiva de furia, rabia y enfado descontrolado.'
  ]),
  pt('p48', 'Vergüenza', ['la verguenza'], [
    'Es una emoción de naturaleza estrictamente social.',
    'Aparece cuando el individuo siente que ha vulnerado las expectativas de un grupo.',
    'Desata una reacción involuntaria que aumenta el flujo sanguíneo hacia el rostro.',
    'Hace que la persona esquive la mirada, baje la cabeza y sienta mucho bochorno.',
    'Provoca que quien la sufre exprese el deseo de que "la tierra se lo trague".',
    'Sensación de sonrojo e incomodidad que se experimenta al hacer el ridículo.'
  ]),
  pt('p49', 'Paz', ['la paz'], [
    'Es un concepto relacional y de orden.',
    'Puede referirse tanto a la quietud interior como a un escenario político.',
    'Tiene dedicado un prestigioso premio internacional que se entrega cada año en Oslo.',
    'Suele representarse iconográficamente con los dedos índice y corazón en forma de V.',
    'Su símbolo más universal y antiguo es una paloma blanca con una rama en el pico.',
    'Situación de calma, tranquilidad y concordia donde no hay conflictos ni guerras.'
  ]),
  pt('p50', 'Libertad', ['la libertad'], [
    'Es una cualidad existencial y política.',
    'Ha sido el reclamo central de innumerables revoluciones a lo largo de los siglos.',
    'Constituye el primer término del famoso lema de la República Francesa.',
    'A nivel jurídico, su privación en una celda es el máximo castigo antes de la pena de muerte.',
    'Tiene un gigantesco monumento en forma de mujer con antorcha en Nueva York.',
    'Derecho de las personas a decidir por sí mismas sin estar prisioneras ni oprimidas.'
  ]),

  // --- EVENTOS HISTÓRICOS Y EFEMÉRIDES (p51 - p60) ---
  pt('p51', 'Llegada a la Luna', ['alunizaje', 'apolo 11'], [
    'Es un suceso documentado de la era moderna.',
    'Tuvo lugar durante la segunda mitad del convulso siglo XX.',
    'Fue el punto culminante de una carrera tecnológica e ideológica entre dos superpotencias.',
    'Logró que tres astronautas viajaran en la famosa misión conocida como Apolo 11.',
    'Inmortalizó la imagen de una bota dejando una huella gris y la frase "un pequeño paso...".',
    'El acontecimiento histórico de 1969 donde el ser humano caminó por primera vez en el satélite terrestre.'
  ]),
  pt('p52', 'Hundimiento del Titanic', ['el titanic', 'naufragio del titanic'], [
    'Es un desastre que conmocionó a la opinión pública.',
    'Ocurrió en los albores del siglo XX, marcando el fin de una era de optimismo tecnológico.',
    'La magnitud de la tragedia obligó a reescribir las normativas internacionales de salvamento marítimo.',
    'El suceso tuvo lugar en las heladas aguas del océano Atlántico en plena noche.',
    'Fue provocado por el impacto de un supuesto buque "insumergible" contra un bloque de hielo.',
    'Famoso naufragio de 1912 del mayor barco de pasajeros del mundo tras chocar contra un iceberg.'
  ]),
  pt('p53', 'Caída del Muro de Berlín', ['muro de berlin', 'caida del muro'], [
    'Es un acontecimiento de enorme peso geopolítico.',
    'Representó visualmente el principio del fin de la Guerra Fría en Europa.',
    'Surgió tras el anuncio precipitado de la apertura de fronteras en un país dividido.',
    'Ocurrió en noviembre de 1989 ante la mirada atónita de millones de telespectadores.',
    'Miles de ciudadanos se subieron a una barrera de hormigón armado y la destrozaron con picos.',
    'El histórico derribo de la pared que dividía la capital de Alemania en dos mitades.'
  ]),
  pt('p54', 'Revolución Francesa', ['la revolucion francesa'], [
    'Es un alzamiento sociopolítico clave en la historia.',
    'Ocurrió en Europa occidental durante las últimas décadas del siglo XVIII.',
    'Inauguró la Edad Contemporánea y extendió las ideas de la Ilustración.',
    'El evento que marcó su estallido oficial fue la violenta toma de la prisión de la Bastilla.',
    'Acabó con la monarquía absolutista y llevó a los reyes Luis XVI y María Antonieta a la guillotina.',
    'Rebelión popular de 1789 que cambió Francia bajo el lema "Libertad, Igualdad y Fraternidad".'
  ]),
  pt('p55', 'Halloween', ['noche de brujas'], [
    'Es un evento cíclico del calendario.',
    'Sus orígenes se remontan a festivales paganos celtas que celebraban el fin de las cosechas.',
    'Ha evolucionado hacia una festividad moderna de marcado carácter comercial y lúdico.',
    'Se celebra cada año durante la víspera del primero de noviembre.',
    'Los barrios se llenan de calabazas talladas y niños que piden golosinas puerta por puerta.',
    'La noche de brujas donde la gente se disfraza de monstruos y dice "truco o trato".'
  ]),
  pt('p56', 'Juegos Olímpicos', ['olimpiadas', 'jjoo'], [
    'Es una congregación de escala mundial.',
    'Sus primeras ediciones se remontan a competiciones en honor a los dioses de la Antigüedad.',
    'Tras su restauración moderna, se celebra de manera regular una vez cada cuatro años.',
    'Comienza siempre con el encendido de un fuego que viaja por el mundo mediante una antorcha.',
    'Su logotipo está formado por cinco anillos de colores entrelazados sobre fondo blanco.',
    'La mayor competición multideportiva mundial donde los atletas compiten por medallas de oro.'
  ]),
  pt('p57', 'Año Nuevo', ['nochevieja', 'ano nuevo'], [
    'Es un rito de transición temporal.',
    'Las civilizaciones lo calculan siguiendo los ciclos de sus respectivos calendarios.',
    'Reúne a multitudes en plazas emblemáticas como Times Square para hacer cuentas atrás.',
    'En España, la tradición dicta celebrarlo al ritmo de doce campanadas desde la Puerta del Sol.',
    'La gente se felicita, brinda con champán y come doce uvas de la suerte a medianoche.',
    'La fiesta de Nochevieja donde se despide a diciembre y se da la bienvenida a enero.'
  ]),
  pt('p58', 'Primera Guerra Mundial', ['la gran guerra', 'i guerra mundial'], [
    'Es un enfrentamiento bélico de proporciones inéditas.',
    'Introdujo cambios aterradores en la forma de combatir gracias a la industrialización.',
    'Durante décadas fue conocida en los libros de historia simplemente como La Gran Guerra.',
    'El detonante fue el asesinato del archiduque de Austria en la ciudad de Sarajevo en 1914.',
    'Los soldados pasaron años estancados luchando en el barro y las enfermedades de las trincheras.',
    'Conflicto armado que arrasó Europa entre 1914 y 1918 empleando gases tóxicos y tanques.'
  ]),
  pt('p59', 'Segunda Guerra Mundial', ['ii guerra mundial'], [
    'Es el conflicto con mayor índice de mortalidad de todos los tiempos.',
    'Su estallido oficial se desencadenó tras la invasión de Polonia en el año 1939.',
    'Enfrentó al bloque de los Países Aliados contra las potencias del llamado Eje.',
    'Vivió episodios decisivos como el desembarco del Día D en las playas de Normandía.',
    'Culminó en 1945 con el lanzamiento de dos bombas atómicas sobre territorio japonés.',
    'La guerra global donde el mundo entero luchó para derrotar a Hitler y al nazismo.'
  ]),
  pt('p60', 'San Valentín', ['dia de san valentin', 'dia de los enamorados'], [
    'Es una jornada temática anual.',
    'Toma su nombre del martirologio romano y de la figura de un sacerdote antiguo.',
    'Se ha consolidado como una de las fechas con mayores picos de ventas florales.',
    'Tiene fijado su espacio en el calendario de cada año en el ecuador del mes de febrero.',
    'Ese día las parejas tienen citas románticas y se regalan bombones y corazones rojos.',
    'Festividad del 14 de febrero conocida universalmente como el Día de los Enamorados.'
  ]),

  // --- ALIMENTOS Y BEBIDAS (p61 - p70) ---
  pt('p61', 'Pizza', ['la pizza'], [
    'Es un preparado de la industria culinaria.',
    'Sus raíces históricas se encuentran en la cuenca mediterránea europea.',
    'Es uno de los productos más estandarizados y exportados mediante franquicias.',
    'Se construye partiendo de un disco plano de masa fermentada horneado a alta temperatura.',
    'Se cubre obligatoriamente con salsa de tomate y queso mozzarella fundido.',
    'Famosa comida italiana redonda que se corta en porciones triangulares.'
  ]),
  pt('p62', 'Chocolate', ['el chocolate'], [
    'Es una sustancia comestible procesada.',
    'Fue utilizado inicialmente por culturas mesoamericanas como bebida ceremonial.',
    'La revolución de su sabor se produjo al combinar su polvo amargo con azúcar y lácteos.',
    'Se elabora tostando y moliendo las semillas extraídas del interior del fruto del cacao.',
    'Su variante en tabletas oscuras o bombones se derrite fácilmente con el calor de las manos.',
    'Delicioso dulce de cacao que encanta a los niños y sirve para hacer postres.'
  ]),
  pt('p63', 'Paella', ['la paella'], [
    'Es una elaboración gastronómica arraigada.',
    'Su origen se sitúa en entornos agrícolas cercanos a la costa este de la Península Ibérica.',
    'Curiosamente recibe el mismo nombre que el recipiente ancho y plano donde se cocina.',
    'Debe su característico tono amarillento al uso de hebras de azafrán o colorante alimentario.',
    'Sus puristas defienden que la auténtica lleva pollo, conejo y garrofón, y no lleva marisco.',
    'El plato valenciano y español más famoso, hecho a base de arroz cocinado en sartén.'
  ]),
  pt('p64', 'Cerveza', ['la cerveza', 'birra', 'cana'], [
    'Es un brebaje de consumo generalizado.',
    'Se elabora mediante un proceso bioquímico ancestral de fermentación controlada.',
    'Sus componentes base exigen una fuente de almidón vegetal, agua y agentes biológicos levaduriformes.',
    'El uso de las flores del lúpulo le otorga su persistente amargor característico.',
    'Se sirve muy fría en jarras o vasos, generando una espesa corona de espuma blanca.',
    'Bebida alcohólica dorada elaborada con cebada que en los bares se pide como "caña".'
  ]),
  pt('p65', 'Helado', ['el helado'], [
    'Es un producto de la industria alimentaria.',
    'Su estado óptimo de consumo depende estrechamente del control de su temperatura.',
    'Su elaboración requiere batir enérgicamente ingredientes líquidos mientras se congelan.',
    'Suele consumirse de forma masiva para refrescarse durante los meses más cálidos del año.',
    'Se despacha en tarrinas con cucharilla o montado sobre un cucurucho crujiente de barquillo.',
    'Postre muy frío y dulce de diferentes sabores que se derrite rápidamente al sol.'
  ]),
  pt('p66', 'Café', ['el cafe'], [
    'Es una bebida extendida a nivel global.',
    'Se obtiene a partir de materias primas procedentes de climas tropicales y subtropicales.',
    'Su consumo es habitual en los descansos laborales debido a sus propiedades estimulantes.',
    'Se elabora filtrando agua caliente a través de semillas molidas de color marrón oscuro.',
    'Posee un alcaloide que ayuda a despertarse y se puede servir cortado, solo o con leche.',
    'Bebida caliente negra, amarga y aromática indispensable para muchos por la mañana.'
  ]),
  pt('p67', 'Vino', ['el vino'], [
    'Es un producto líquido destinado al consumo.',
    'Ha tenido un papel central en ceremonias religiosas e imperios desde la Antigüedad.',
    'Su calidad mejora y se estabiliza al dejarlo reposar en el interior de barricas de roble.',
    'Su proceso de creación transforma los azúcares del mosto de las frutas en alcohol.',
    'Se clasifica visualmente en distintas categorías, siendo las más comunes el blanco y el tinto.',
    'Bebida alcohólica que se elabora pisando y fermentando las uvas de la vid.'
  ]),
  pt('p68', 'Pan', ['el pan'], [
    'Es un alimento de preparación básica.',
    'Surgió hace milenios al dominar el fuego y el procesamiento inicial de la agricultura.',
    'El volumen final de su masa se consigue gracias a la acción de gases durante la fermentación.',
    'Presenta dos texturas muy contrastadas: una corteza exterior dura y una parte interna esponjosa.',
    'Se compra a diario en formato de barra redonda o alargada para acompañar comidas o hacer bocadillos.',
    'Alimento horneado elaborado a partir de harina de trigo, agua, sal y levadura.'
  ]),
  pt('p69', 'Tortilla de patatas', ['tortilla espanola', 'la tortilla'], [
    'Es una preparación de la cocina tradicional.',
    'Utiliza ingredientes extremadamente básicos y asequibles para generar un plato contundente.',
    'La pericia del cocinero se demuestra en el momento crítico de darle la vuelta sobre la sartén.',
    'Su base consiste en freír finas láminas de tubérculo para luego cuajarlas junto a huevos batidos.',
    'En España existe un enorme debate popular sobre si su receta original debe incluir o no cebolla.',
    'Plato redondo y grueso muy típico de la gastronomía española hecho de huevos y papas.'
  ]),
  pt('p70', 'Sushi', ['el sushi'], [
    'Es un alimento originario del continente asiático.',
    'Inició como un antiguo método de conservación fermentada antes de ser un plato de consumo rápido.',
    'La base de todas sus preparaciones es el grano corto cocido y aderezado con vinagre dulce.',
    'Suele presentarse en pequeños rollos envueltos en algas negras u oscuras secas.',
    'Incluye pequeñas porciones de atún o salmón completamente crudos y se come con palillos.',
    'Famoso plato de la gastronomía de Japón compuesto por arroces y pescado fresco crudo.'
  ]),

  // --- NATURALEZA Y FENÓMENOS (p71 - p80) ---
  pt('p71', 'Volcán', ['volcanes', 'el volcan'], [
    'Es una formación que altera el relieve geográfico.',
    'Suele surgir en zonas de inestabilidad tectónica del manto del planeta.',
    'Actúa como una válvula de escape natural para la inmensa presión subterránea.',
    'En su cima presenta un cráter o caldera por el que expulsa gases y proyecciones de ceniza.',
    'Al entrar en erupción de manera violenta arroja corrientes de roca fundida roja incandescente.',
    'Montaña que expulsa fuego y ríos de lava desde las entrañas de la Tierra.'
  ]),
  pt('p72', 'Arcoíris', ['arco iris', 'el arcoiris'], [
    'Es una percepción óptica transitoria.',
    'Para que ocurra, el observador debe encontrarse posicionado entre la fuente de luz y la humedad.',
    'Isaac Newton lo estudió utilizando primas de vidrio transparente en un cuarto oscuro.',
    'Se produce cuando los rayos del sol atraviesan y se refractan en finas gotas de agua suspendidas.',
    'Traza una semicircunferencia colorida en el cielo mezclando rojo, amarillo, verde, azul y violeta.',
    'Banda de múltiples colores que aparece en el cielo cuando sale el sol tras haber llovido.'
  ]),
  pt('p73', 'Terremoto', ['seismo', 'sismo'], [
    'Es un suceso originado por la dinámica del planeta.',
    'Puede sentirse a miles de kilómetros del punto donde se ha desencadenado.',
    'Es causado por la ruptura y choque repentino de las grandes fallas tectónicas.',
    'Su punto de origen subterráneo se llama hipocentro y el superficial epicentro.',
    'Se mide científicamente utilizando los sismógrafos y la conocida escala de Richter.',
    'Fuerte sacudida y temblor violento del suelo que derrumba edificios.'
  ]),
  pt('p74', 'Desierto', ['los desiertos', 'el desierto'], [
    'Es una clasificación del paisaje físico.',
    'Su principal rasgo distintivo es un déficit extremo y prolongado de precipitaciones.',
    'Soporta una amplitud térmica inmensa, con días abrasadores y noches casi heladas.',
    'El escaso agua se concentra en oasis subterráneos rodeados de algunas palmeras.',
    'El viento modela enormes extensiones de arena creando colinas cambiantes llamadas dunas.',
    'Vasto territorio árido sin apenas agua ni vida, como el conocido ecosistema del Sahara.'
  ]),
  pt('p75', 'Luna', ['la luna'], [
    'Es un objeto material que orbita en el vacío.',
    'Carece de atmósfera propia, por lo que su superficie conserva cráteres de antiguos impactos.',
    'Su gravedad invisible ejerce la fuerza que provoca el movimiento de las mareas oceánicas.',
    'Pasa periódicamente por diferentes fases de iluminación: nueva, creciente, llena y menguante.',
    'A finales de los años sesenta fue pisada por las botas de astronautas estadounidenses.',
    'El satélite natural de la Tierra que brilla de color blanco en el cielo de noche.'
  ]),
  pt('p76', 'Nieve', ['la nieve'], [
    'Es una manifestación atmosférica.',
    'Depende enteramente de unas condiciones termodinámicas concretas en altura.',
    'Modifica drásticamente el comportamiento acústico y el paisaje de las zonas donde precipita.',
    'Se compone de intrincados cristales geométricos de hielo que caen suavemente desde las nubes.',
    'Cuando se acumula en invierno, permite practicar el esquí o amasar bolas redondas.',
    'Precipitación en forma de copos blancos fríos que cubre las montañas y el suelo.'
  ]),
  pt('p77', 'Huracán', ['huracanes', 'tifon', 'ciclon'], [
    'Es un fenómeno meteorológico masivo.',
    'Solo puede formarse y retroalimentarse sobre la superficie cálida de océanos tropicales.',
    'La rotación terrestre le confiere una característica forma de espiral espumosa de nubes.',
    'Paradójicamente, en su mismo centro de rotación existe un "ojo" despejado y totalmente en calma.',
    'Lanza lluvias torrenciales y vientos devastadores que superan los doscientos kilómetros por hora.',
    'Enorme tormenta en forma de remolino gigante que arrasa las costas con fuertes vientos.'
  ]),
  pt('p78', 'Océano', ['oceanos', 'el oceano'], [
    'Es una demarcación superficial del globo terráqueo.',
    'Es el principal responsable de la regulación climática de todo el planeta Tierra.',
    'Ocupa aproximadamente el setenta por ciento del área total y alberga fosas abisales insondables.',
    'Sus líquidos presentan una alta concentración de salinidad, haciéndolos intomables para los humanos.',
    'Separan las enormes masas de los continentes y sus aguas experimentan mareas regulares.',
    'La inmensa extensión de agua salada marina, como el Pacífico, el Atlántico o el Índico.'
  ]),
  pt('p79', 'Marte', ['el planeta rojo', 'marte'], [
    'Es un astro de nuestro vecindario cósmico.',
    'La exploración de su superficie se ha realizado con sondas robóticas y vehículos rover.',
    'Alberga tanto el volcán más alto conocido como uno de los cañones más grandes del sistema.',
    'Su órbita y proximidad lo convierten en el siguiente gran objetivo de las misiones espaciales humanas.',
    'Su tono oxidado característico se debe a la abundancia de hierro en sus llanuras de polvo.',
    'El cuarto planeta del sistema solar, mundialmente conocido por su apodo de el "Planeta Rojo".'
  ]),
  pt('p80', 'Bosque', ['los bosques', 'el bosque'], [
    'Es una agrupación de organismos vegetales.',
    'Representa uno de los sumideros de dióxido de carbono más importantes del clima.',
    'Sus formaciones pueden variar desde especies de hoja perenne hasta caducifolios en otoño.',
    'El suelo está oscurecido y cubierto por musgos, setas, matorrales y hojas caídas.',
    'Es el ecosistema característico de los cuentos donde habitan lobos, osos, ciervos y ardillas.',
    'Gran extensión de tierra poblada tupidamente de árboles de la que se saca madera.'
  ]),

  // --- ELEMENTOS, TRANSPORTE Y OBJETOS (p81 - p90) ---
  pt('p81', 'Lavadora', ['la lavadora', 'lavarropas'], [
    'Es un aparato mecánico de dimensiones considerables.',
    'Ha supuesto un inmenso ahorro de tiempo en las tareas de mantenimiento rutinario.',
    'Requiere conexiones independientes de suministro hídrico y de electricidad.',
    'Utiliza la fuerza centrífuga a altas revoluciones para expulsar la humedad de su interior.',
    'Se compone de un tambor cilíndrico metálico rotatorio donde se introduce detergente.',
    'Electrodoméstico del hogar diseñado para frotar, enjuagar y lavar la ropa sucia.'
  ]),
  pt('p82', 'Lámpara', ['lamparas', 'la lampara'], [
    'Es una herramienta artificial.',
    'Depende de un circuito eléctrico cerrado para ofrecer alguna utilidad.',
    'Existen variaciones diseñadas para colgar, sostenerse sobre mesas o afirmarse en el suelo.',
    'Incorpora materiales reflectantes o pantallas de tela para suavizar su impacto.',
    'Consta de un soporte, un cable con interruptor y un casquillo para una bombilla.',
    'Objeto que enchufas y enciendes para aportar luz y claridad a las habitaciones.'
  ]),
  pt('p83', 'Televisión', ['television', 'la television', 'tele', 'televisor'], [
    'Es un dispositivo tecnológico de consumo.',
    'Su historia comercial masiva comenzó con transmisiones monocromáticas en tubo de rayos catódicos.',
    'La evolución técnica ha sustituido su volumen posterior por paneles planos y ligeros.',
    'Su tamaño se mide estableciendo la distancia diagonal de esquina a esquina en pulgadas.',
    'Suele presidir los salones modernos y se controla utilizando un mando a distancia.',
    'Pantalla electrónica en la que se sintonizan programas, telediarios y películas.'
  ]),
  pt('p84', 'Auriculares', ['audifonos', 'cascos'], [
    'Es un dispositivo electrónico perimetral.',
    'Fue ideado para independizar una experiencia aislando al usuario de su entorno.',
    'Puede presentarse en formato de almohadillas unidas por diadema o pequeñas piezas intrauditivas.',
    'Las versiones actuales evitan el enredo de cables sincronizándose mediante Bluetooth.',
    'Posee dos diminutos altavoces que se acercan o introducen en las orejas.',
    'Aparato que te pones para poder escuchar música sin que nadie más la oiga.'
  ]),
  pt('p85', 'Submarino', ['submarinos'], [
    'Es una máquina diseñada para la movilidad.',
    'Afronta retos de ingeniería excepcionales debido a la presión ambiental constante.',
    'Logra su maniobra vertical inundando o vaciando con aire comprimido sus tanques de lastre.',
    'Cuando no asoma a la superficie depende de radares acústicos o sonares para navegar a ciegas.',
    'Permite ver por encima del agua utilizando un tubo óptico cilíndrico llamado periscopio.',
    'Embarcación marina que puede cerrarse herméticamente para navegar por debajo del agua.'
  ]),
  pt('p86', 'Guitarra', ['guitarra española', 'guitarra clasica'], [
    'Es un objeto utilizado en el ámbito cultural.',
    'Su construcción depende de la selección y tensión precisa de varios componentes.',
    'Su diseño clásico incorpora un diapasón atravesado por divisiones metálicas llamadas trastes.',
    'El sonido se amplifica al vibrar sobre la boca circular de su caja de resonancia de madera.',
    'Es el elemento indispensable, junto a las palmas y el cajón, del folclore flamenco.',
    'Instrumento musical de seis cuerdas que se toca punteando y rasgueando con las manos.'
  ]),
  pt('p87', 'Teléfono móvil', ['smartphone', 'celular'], [
    'Es una herramienta tecnológica contemporánea.',
    'Sus primeros modelos comerciales apenas cabían en un maletín por el tamaño de las baterías.',
    'Su popularización ha relegado al olvido a dispositivos como las cámaras compactas y mapas de papel.',
    'Carece de botones físicos frontales, operando íntegramente mediante un panel táctil luminoso.',
    'Se lleva siempre en el bolsillo para mantener conexión a internet mediante tarjetas SIM o WiFi.',
    'Aparato que usamos constantemente para chatear, enviar fotos, consultar redes y llamar.'
  ]),
  pt('p88', 'Fuego', ['el fuego'], [
    'Es un fenómeno desencadenado por una reacción físico-química.',
    'Su domesticación por los homínidos primitivos marcó el despegue evolutivo de nuestra especie.',
    'En los mitos helénicos, Prometeo fue castigado por robárselo a los dioses para darlo a los mortales.',
    'Produce de manera simultánea dos tipos de emisión medibles: radiación luminosa y térmica.',
    'Necesita oxígeno, combustible y calor para mantenerse y emite humo que sube hacia el cielo.',
    'Llamas ardientes de color naranja que desprenden un calor intenso y queman lo que tocan.'
  ]),
  pt('p89', 'Bicicleta', ['la bicicleta', 'bici'], [
    'Es un vehículo mecánico articulado.',
    'Constituye uno de los sistemas de transporte energéticamente más eficientes jamás inventados.',
    'Carece de motor y su impulso proviene enteramente de la fuerza y el equilibrio humano.',
    'Su tracción se transfiere desde un plato dentado a un piñón trasero a través de una cadena engrasada.',
    'Sus dos ruedas están alineadas y el corredor va sentado en un sillín agarrando el manillar.',
    'Transporte sostenible que se mueve utilizando las piernas para hacer girar unos pedales.'
  ]),
  pt('p90', 'Avión', ['aviones', 'aeroplano'], [
    'Es una creación pesada de la ingeniería moderna.',
    'Venció las leyes de la física aprovechando los principios de la sustentación aerodinámica.',
    'Para iniciar su funcionamiento requiere acelerar largamente sobre extensas pistas asfaltadas.',
    'Presuriza su habitáculo interior para permitir a la gente respirar a diez mil metros de altitud.',
    'Las turbinas de sus grandes alas metálicas le proporcionan el empuje para cruzar los cielos.',
    'Gran vehículo volador capaz de transportar a cientos de pasajeros de un continente a otro.'
  ]),

  // --- ANIMALES, CULTURA Y VARIOS (p91 - p100) ---
  pt('p91', 'Lobo', ['lobos', 'el lobo'], [
    'Es un ser vivo vertebrado.',
    'Sus poblaciones se han reducido en Europa al competir históricamente por el territorio.',
    'Se comunica mediante vocalizaciones corales de largo alcance que fortalecen el vínculo del grupo.',
    'Es el ancestro genético directo de los animales de compañía que tenemos en casa.',
    'Caza en manadas jerárquicas y tiene un largo hocico con el que aúlla de noche a la luna.',
    'Cánido salvaje del bosque que aparece como el feroz villano en el cuento de Caperucita Roja.'
  ]),
  pt('p92', 'Jirafa', ['jirafas', 'la jirafa'], [
    'Es un animal perteneciente a los mamíferos.',
    'Ha evolucionado adaptando su esqueleto para poder alimentarse sin apenas competencia.',
    'Su lengua prensil es áspera y azulada para resistir las espinas de las copas de las acacias.',
    'Para beber agua en una charca debe separar sus extremidades delanteras de forma muy incómoda.',
    'Luce un pelaje pardo organizado en polígonos manchados sobre fondo claro amarillento.',
    'El mamífero más alto del mundo que destaca en la sabana por su larguísimo cuello.'
  ]),
  pt('p93', 'Canguro', ['canguros', 'el canguro'], [
    'Es una criatura del reino animal.',
    'Pertenece a una rama de mamíferos que prosperó tras aislarse un continente hace millones de años.',
    'Sus extremidades delanteras son cortas y débiles, contrastando con una cola gruesa y musculosa.',
    'Logra desplazarse a gran velocidad encadenando saltos sobre sus poderosas patas traseras.',
    'Al nacer siendo minúsculos, sus crías trepan y acaban de desarrollarse en una bolsa del abdomen materno.',
    'Marsupial saltarín típico de Australia que lleva a sus bebés metidos en un bolsillo del vientre.'
  ]),
  pt('p94', 'Oso polar', ['el oso polar'], [
    'Es un enorme mamífero carnívoro.',
    'Su hábitat se encuentra amenazado por el aumento global progresivo de las temperaturas.',
    'Tiene la piel real de color negro bajo una gruesa capa de grasa para absorber mejor el calor solar.',
    'Sus presas favoritas son focas a las que acecha pacientemente desde orificios en el hielo marino.',
    'Los pelos translúcidos de su denso pelaje reflejan la luz haciéndolo parecer blanco intenso.',
    'El oso de color blanco que vive en los hielos del Ártico y domina el Polo Norte.'
  ]),
  pt('p95', 'Murciélago', ['murcielagos'], [
    'Es un organismo vertebrado y volador.',
    'Pese a su apariencia, no tiene ninguna relación taxonómica con la familia de las aves.',
    'Sus alas están formadas por una membrana elástica de piel estirada entre huesos de dedos alargados.',
    'Pasa sus jornadas de inactividad descansando boca abajo en el techo oscuro de grutas y cuevas.',
    'Caza polillas en completa oscuridad guiándose por los ecos ultrasónicos de sus agudos chillidos.',
    'El único mamífero que vuela y al que la leyenda y la cultura asocian con los vampiros.'
  ]),
  pt('p96', 'Tortuga', ['tortugas', 'la tortuga'], [
    'Es un animal ligado al medio terrestre y acuático.',
    'Pertenece a uno de los órdenes evolutivos más antiguos que han logrado llegar a nuestros días.',
    'Carece totalmente de dentición, supliendo esa carencia con un pico córneo fuerte y afilado.',
    'Toda la estructura de su tórax y columna está fusionada dentro de un abultado escudo calcáreo protector.',
    'Al sentirse en peligro, recoge de manera defensiva su cabeza rugosa y sus extremidades.',
    'Reptil lento que carga continuamente con un duro caparazón sobre su espalda a modo de casa.'
  ]),
  pt('p97', 'Hormiga', ['hormigas', 'la hormiga'], [
    'Es un animal invertebrado.',
    'Constituye una parte asombrosa de toda la biomasa animal del planeta debido a su enorme número.',
    'Se comunican e identifican trazando sofisticadas pistas químicas de feromonas en el suelo.',
    'Se organizan en complejas estructuras jerárquicas con soldados, obreras estériles y reinas ponedoras.',
    'Se las ve marchando en largas filas recogiendo alimentos o trozos de hoja en fila india.',
    'Pequeño insecto muy trabajador y fuerte que excava colonias subterráneas llamadas hormigueros.'
  ]),
  pt('p98', 'Vaca', ['las vacas', 'la vaca'], [
    'Es un mamífero cuadrúpedo.',
    'La ganadería basó en su domesticación gran parte del desarrollo nutricional humano en Occidente.',
    'Posee un sistema gástrico compuesto por cuatro cámaras que le permite regurgitar y rumiar pastos duros.',
    'Tiene un marcado estatus sagrado e intocable dentro de las tradiciones religiosas de la India.',
    'Tiene cuernos cortos, una cola con mechón y unas prominentes ubres para alimentar a los terneros.',
    'Gran animal doméstico que hace "mu", pasta en los prados y nos da la leche.'
  ]),
  pt('p99', 'Steve Jobs', ['jobs'], [
    'Es un líder destacado de la era de la información.',
    'Su carácter perfeccionista y exigente le valió críticas a pesar de su innegable talento visionario.',
    'Cimentó los inicios de su imperio ensamblando circuitos en un modesto garaje californiano.',
    'Infundió un diseño pulido y minimalista a dispositivos que alteraron las rutinas de la sociedad global.',
    'Pronunciaba recordados discursos vestido invariablemente con zapatillas, vaqueros y jersey negro de cuello alto.',
    'El carismático empresario fundador de la marca Apple y presentador original del iPhone.'
  ]),
  pt('p100', 'Frida Kahlo', ['frida'], [
    'Es una creadora artística del siglo XX.',
    'Una tragedia física en el inicio de su juventud condicionó para siempre su obra y su movilidad.',
    'Vivió y pintó en un icónico inmueble de color intenso en el barrio de Coyoacán.',
    'Pintó de forma visceral sobre el lienzo sus sufrimientos, abortos y su tormentoso matrimonio con Diego Rivera.',
    'Plasmó repetidamente su propio rostro acentuando con orgullo un entrecejo poblado y tupido.',
    'Pintora mexicana de autorretratos surrealistas famosa por sus diademas de flores y su uniceja.'
  ])
];