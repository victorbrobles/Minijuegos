import { pt } from './helper.js';

export const PARTE_2 = [
  // =========================================================================
  // 1. OBJETOS, HERRAMIENTAS E INSTALACIONES (p101 - p110)
  // =========================================================================
  pt('p101', 'Ordenador', ['computadora', 'pc', 'computador'], [
    'Es un sistema complejo de origen artificial.',
    'Ha transformado drásticamente la forma en que el ser humano interactúa en las últimas décadas.',
    'Su funcionamiento interno depende del procesamiento casi instantáneo de secuencias lógicas.',
    'Está compuesto por módulos tangibles de hardware y rutinas invisibles de software.',
    'Requiere periféricos de entrada como un teclado y un puntero para poder controlarlo.',
    'Máquina electrónica con pantalla que utilizamos para navegar por internet o trabajar.'
  ]),
  pt('p102', 'Cama', ['la cama'], [
    'Es un elemento fundamental del mobiliario humano.',
    'Su diseño anatómico está pensado para proporcionar un soporte pasivo y prolongado.',
    'Su uso diario está estrechamente vinculado a un estado fisiológico de desconexión.',
    'Suele recubrirse con capas de distintos materiales textiles según la temperatura ambiental.',
    'Dispone de un soporte acolchado inferior y una pieza ergonómica para elevar la cabeza.',
    'Mueble compuesto por un colchón y una almohada sobre el que nos acostamos a dormir.'
  ]),
  pt('p103', 'Martillo', ['el martillo'], [
    'Es un instrumento manual de diseño muy antiguo.',
    'Su utilidad se fundamenta en la aplicación de principios básicos de la física y la inercia.',
    'Concentra la energía cinética de un movimiento acelerado en una superficie de contacto reducida.',
    'Consta de un eje longitudinal de sujeción unido a una pesada masa contundente.',
    'Se utiliza para aplicar impactos precisos o introducir piezas puntiagudas a presión.',
    'Herramienta de mango con cabeza de hierro que se utiliza habitualmente para clavar clavos.'
  ]),
  pt('p104', 'Libro', ['los libros', 'el libro'], [
    'Es un artefacto cultural de almacenamiento.',
    'Su evolución material ha estado ligada al progreso de las civilizaciones y del pensamiento.',
    'Codifica y preserva información compleja mediante sistemas de símbolos gráficos estructurados.',
    'Se compone de múltiples láminas delgadas de celulosa unidas firmemente por uno de sus bordes.',
    'Contiene páginas numeradas, se divide en capítulos y está resguardado por cubiertas.',
    'Objeto de papel impreso y encuadernado que contiene una novela o texto para ser leído.'
  ]),
  pt('p105', 'Ascensor', ['elevador', 'el ascensor'], [
    'Es un sistema de infraestructura estática.',
    'Fue diseñado para solucionar los problemas logísticos derivados del crecimiento urbano.',
    'Funciona mediante complejos mecanismos de contrapesos, poleas de tracción o fuerza hidráulica.',
    'Su desplazamiento está estrictamente restringido al interior de un hueco estructural cerrado.',
    'Consiste en una cabina móvil equipada con una botonera para seleccionar niveles.',
    'Aparato que sube y baja transportando personas entre los distintos pisos de un edificio.'
  ]),
  pt('p106', 'Microondas', ['horno microondas', 'el microondas'], [
    'Es un dispositivo de tecnología doméstica.',
    'Su principio operativo fue descubierto accidentalmente durante investigaciones militares con radares.',
    'Emite una radiación electromagnética que provoca la agitación térmica de las moléculas de agua.',
    'Su manual de seguridad prohíbe terminantemente la introducción de metales en su interior.',
    'Dispone de un plato circular de cristal giratorio y un temporizador para programar los minutos.',
    'Electrodoméstico de cocina con puerta transparente utilizado para calentar rápido la comida.'
  ]),
  pt('p107', 'Peine', ['el peine', 'cepillo del pelo'], [
    'Es un objeto de manipulación diaria.',
    'Se fabrica en piezas rígidas pero ligeramente flexibles, históricamente de carey o madera.',
    'Su aplicación física persigue mantener el orden estético y la higiene personal superficial.',
    'Presenta un perfil dentado con numerosos salientes paralelos alineados en uno de sus bordes.',
    'Se sostiene con una mano para deslizarlo rítmicamente sobre el cuero cabelludo.',
    'Utensilio plano con púas que sirve para desenredar y arreglar el pelo frente al espejo.'
  ]),
  pt('p108', 'Puerta', ['las puertas', 'la puerta'], [
    'Es un elemento constructivo articulado.',
    'Cumple la doble función de comunicar espacios transitables y de actuar como barrera de aislamiento.',
    'Se integra en los muros mediante sistemas de sujeción pivotantes o rieles de desplazamiento.',
    'Suele incorporar herrajes de seguridad o bloqueos mecánicos para limitar su apertura.',
    'Se acciona tirando o empujando de un pomo o manilla metálica para acceder a una estancia.',
    'Panel de madera que se abre y cierra en la entrada de las casas o habitaciones.'
  ]),
  pt('p109', 'Ventana', ['las ventanas', 'la ventana'], [
    'Es una estructura integrada en la envolvente de edificaciones.',
    'Fue concebida para atenuar el aislamiento interior conectándolo con el entorno exterior.',
    'Permite regular variables climáticas y lumínicas mediante secciones móviles o practicables.',
    'Utiliza láminas de material vítreo transparente fijadas a un marco perimetral.',
    'Se suele cubrir por la parte interior con cortinas y por fuera con persianas.',
    'Hueco acristalado en la pared de una casa que se abre para asomarse y dejar entrar la luz.'
  ]),
  pt('p110', 'Vela', ['velas', 'la vela', 'cirio'], [
    'Es un objeto físico transformable.',
    'Durante siglos fue un elemento logístico indispensable antes de quedar relegado a usos rituales.',
    'Consiste en un bloque moldeado de materia grasa, cera o parafina de consistencia sólida.',
    'En su eje longitudinal alberga una pequeña hebra de material fibroso que actúa como mecha.',
    'Al consumirse derrama gotas líquidas y emite una luz tenue y cálida en la oscuridad.',
    'Cilindro de cera con un cordelito que se enciende con fuego para iluminar o soplar en cumpleaños.'
  ]),

  // =========================================================================
  // 2. ACCESORIOS, OBJETOS PERSONALES E INSTRUMENTOS (p111 - p120)
  // =========================================================================
  pt('p111', 'Mochila', ['la mochila', 'morral'], [
    'Es un contenedor estructurado portátil.',
    'Su diseño busca optimizar el transporte de carga distribuyendo el peso de forma simétrica.',
    'Permite a su portador mantener la total libertad de movimiento en sus extremidades superiores.',
    'Cuenta con correas longitudinales que se ajustan y cruzan por encima de los hombros.',
    'Suele estar llena de cremalleras y compartimentos para guardar apuntes, estuches o un portátil.',
    'Bolsa de equipaje que los estudiantes se cuelgan a la espalda para llevar los libros.'
  ]),
  pt('p112', 'Cuchara', ['la cuchara'], [
    'Es un instrumento de interacción cotidiana.',
    'Es una de las herramientas de asistencia alimentaria más antiguas de las civilizaciones.',
    'Su anatomía combina una sección de agarre con una terminal ensanchada y curvada.',
    'Su diseño facilita la recogida y retención temporal de sustancias fluidas o granulares.',
    'Forma el grupo clásico de la cubertería occidental de mesa junto al cuchillo y el tenedor.',
    'Utensilio ovalado y hueco que nos llevamos a la boca para tomar sopas o yogures.'
  ]),
  pt('p113', 'Termómetro', ['el termometro'], [
    'Es un instrumento de medición cuantitativa.',
    'Su desarrollo permitió estandarizar la observación objetiva de fenómenos invisibles.',
    'Se basa en la dilatación térmica de materiales o en variaciones de resistencia electrónica.',
    'Presenta marcadores visuales correspondientes a escalas métricas universales como los grados Celsius.',
    'En su versión médica, se sitúa bajo la axila o en la frente para registrar el calor corporal.',
    'Aparato alargado o digital que sirve para comprobar si una persona tiene fiebre.'
  ]),
  pt('p114', 'Anillo', ['los anillos', 'el anillo', 'sortija'], [
    'Es un elemento de ornamentación personal.',
    'Tradicionalmente se moldea utilizando aleaciones de metales valorados por su inalterabilidad.',
    'Su geometría continua y cerrada ha sido utilizada históricamente como metáfora de la eternidad.',
    'Puede llevar engarzada una gema preciosa o contar con inscripciones ocultas en su cara interna.',
    'Es el símbolo universal que se intercambian dos personas durante una ceremonia de boda.',
    'Joya circular de pequeño tamaño que se lleva puesta como adorno alrededor del dedo.'
  ]),
  pt('p115', 'Maleta', ['las maletas', 'la maleta', 'valija'], [
    'Es un receptáculo de almacenamiento móvil.',
    'Su evolución ha estado fuertemente condicionada por el desarrollo de la industria del turismo.',
    'Presenta una forma prismática diseñada para apilarse y soportar impactos en la bodega de carga.',
    'Modernamente incorpora un sistema de tracción basado en un asa telescópica y ruedas inferiores.',
    'Se utiliza casi en exclusiva para trasladar ropa y enseres personales fuera del domicilio.',
    'Bulto de equipaje que arrastramos por el aeropuerto y guardamos en el maletero del coche.'
  ]),
  pt('p116', 'Violín', ['el violin'], [
    'Es un objeto de creación y expresión artística.',
    'Su construcción se perfeccionó mediante patrones artesanales de madera en el norte de Italia.',
    'Al carecer de marcas o trastes en su mástil, exige una memoria muscular y afinación auditiva extremas.',
    'Genera sus ondas sonoras cuando sus cuatro cuerdas son estimuladas rítmicamente por un elemento externo.',
    'Se toca apoyando su base firmemente entre el hombro y la barbilla del intérprete, usando un arco.',
    'Pequeño instrumento clásico de cuerda frotada muy agudo que lidera las orquestas sinfónicas.'
  ]),
  pt('p117', 'Piano', ['el piano'], [
    'Es una estructura mecánica de producción sonora.',
    'Combina en su diseño características de diferentes familias organológicas tradicionales.',
    'Su amplia caja alberga un complejo sistema de macillos de fieltro que percuten una red de cuerdas.',
    'Incorpora unos pedales en su base que permiten al músico prolongar o amortiguar la vibración.',
    'Posee un teclado frontal extenso compuesto por la clásica alternancia de piezas blancas y negras.',
    'Gran instrumento musical de ochenta y ocho teclas que se toca sentado pulsando con ambas manos.'
  ]),
  pt('p118', 'Trompeta', ['la trompeta'], [
    'Es un conducto vibratorio especializado.',
    'Ha sido empleado históricamente tanto en la expresión musical como en la señalización militar de ataque.',
    'Su sonido surge de la resonancia generada por los labios del intérprete presionados contra una boquilla.',
    'Consiste en un tubo de latón brillante doblado sobre sí mismo que remata en una apertura acampanada.',
    'El músico altera las notas mediante la pulsación combinada de únicamente tres válvulas o pistones.',
    'Instrumento de viento-metal dorado que se sopla fuerte para emitir notas agudas en el jazz.'
  ]),
  pt('p119', 'Batería', ['la bateria', 'bateria musical'], [
    'Es una agrupación de dispositivos percusivos.',
    'Su consolidación moderna estuvo estrictamente ligada a la explosión del jazz y del rock and roll.',
    'Requiere del intérprete una compleja disociación rítmica y motriz entre sus cuatro extremidades.',
    'Su ejecutante trabaja siempre sentado, accionando mecanismos de pie mientras golpea con las manos.',
    'Combina cilindros huecos con parches tensados, como la caja y el bombo, junto a platos de bronce.',
    'Instrumento musical que se toca golpeando tambores y platillos con un par de baquetas.'
  ]),
  pt('p120', 'Moneda', ['las monedas', 'la moneda'], [
    'Es un artefacto sólido y estandarizado.',
    'Nació en la antigüedad como una solución abstracta para simplificar los intercambios y el trueque.',
    'Es el objeto central de una disciplina de estudio y catalogación conocida como numismática.',
    'Está labrada sobre discos metálicos e incluye grabados heráldicos, efigies y valores numéricos.',
    'Consta de dos superficies planas denominadas coloquialmente por el público como "cara" y "cruz".',
    'Pequeña pieza redonda de metal que utilizamos como dinero en efectivo para pagar.'
  ]),

  // =========================================================================
  // 3. TRANSPORTE Y VÍAS (p121 - p130)
  // =========================================================================
  pt('p121', 'Tren', ['el tren', 'ferrocarril'], [
    'Es un sistema infraestructural dinámico.',
    'Se erigió como el motor principal de la Revolución Industrial y la expansión territorial en el siglo XIX.',
    'Su desplazamiento está confinado a una ruta física de guías de acero paralelas preestablecidas.',
    'Está compuesto por una unidad de tracción motriz que arrastra un conjunto articulado de módulos.',
    'Circula sobre rieles a velocidades que, en los modelos modernos, superan los trescientos kilómetros por hora.',
    'Largo vehículo compuesto de vagones y una locomotora que recoge pasajeros en las estaciones.'
  ]),
  pt('p122', 'Coche', ['automovil', 'auto', 'el coche', 'carro'], [
    'Es una maquinaria compleja de uso generalmente individual o familiar.',
    'Transformó radicalmente la planificación del asfalto urbano y las distancias en el último siglo.',
    'Convierte la energía química de un combustible o la electricidad en movimiento mecánico rotatorio.',
    'Se controla en marcha coordinando unos pedales en el suelo con un aro de dirección manejado con las manos.',
    'Consta de un habitáculo cerrado y se apoya directamente sobre cuatro ruedas con neumáticos de goma.',
    'Vehículo a motor con volante que usamos a diario para desplazarnos por calles y carreteras.'
  ]),
  pt('p123', 'Barco', ['los barcos', 'el barco', 'embarcacion'], [
    'Es una estructura de ingeniería móvil.',
    'Ha sido el principal vehículo de migración, comercio y guerra desde la prehistoria hasta la era aeronáutica.',
    'Su viabilidad física explota de manera directa el principio de Arquímedes para vencer la gravedad.',
    'Está conformado por un casco cóncavo con terminaciones direccionales específicas llamadas proa y popa.',
    'Utiliza un timón sumergido para maniobrar el rumbo y arroja pesadas anclas de hierro para estabilizarse.',
    'Vehículo flotante diseñado para navegar y transportar gente y mercancías sobre el mar.'
  ]),
  pt('p124', 'Helicóptero', ['el helicoptero'], [
    'Es un aparato tecnológico de desplazamiento libre.',
    'Fue teorizado mediante bocetos por genios renacentistas siglos antes de poder materializarse.',
    'Su diseño mecánico le exime de la necesidad de contar con largas pistas de asfalto para operar.',
    'Genera su propia sustentación al hacer girar violentamente perfiles aerodinámicos largos sobre su eje.',
    'Tiene la capacidad de mantener un vuelo estacionario y realizar aterrizajes de manera totalmente vertical.',
    'Aeronave sin alas pero con un gran aspa giratoria en el techo que vuela y realiza rescates.'
  ]),
  pt('p125', 'Cohete', ['el cohete', 'cohete espacial'], [
    'Es un artefacto de propulsión extrema.',
    'Fue concebido como la única solución viable para superar los límites gravitatorios de nuestro planeta.',
    'Su movimiento aplica de manera espectacular la tercera ley de la dinámica de Newton: acción y reacción.',
    'Almacena su propio oxidante, lo que le permite mantener una combustión violenta en el vacío.',
    'Despega en posición vertical soltando toneladas de fuego por sus toberas inferiores.',
    'Vehículo espacial cilíndrico diseñado por la NASA y otras agencias para viajar a las estrellas.'
  ]),
  pt('p126', 'Globo aerostático', ['globo aerostatico', 'el globo aerostatico'], [
    'Es un ingenio de navegación atmosférica.',
    'Fue el responsable de elevar a seres humanos por primera vez en la historia de manera prolongada.',
    'Su método de ascenso se basa en la alteración artificial de la densidad térmica de un gas.',
    'Emplea potentes quemadores de fuego para calentar el aire confinado bajo una enorme cúpula de tela.',
    'Los turistas vuelan flotando suavemente sobre el paisaje metidos dentro de una barquilla de mimbre.',
    'Enorme bolsa de aire caliente redonda y colorida con una cesta debajo para pasear por el cielo.'
  ]),
  pt('p127', 'Satélite artificial', ['satelite', 'el satelite'], [
    'Es un sistema robótico orbital.',
    'El lanzamiento del primer modelo de la historia desató una crisis mundial en plena Guerra Fría.',
    'Su trayectoria describe un estado perpetuo de caída libre compensada por su altísima velocidad inercial.',
    'Despliega paneles solares orientables para obtener la energía necesaria y sobrevivir en el entorno cósmico.',
    'Se utiliza constantemente desde el espacio para facilitar la señal de televisión, el clima y las rutas GPS.',
    'Aparato de telecomunicaciones enviado por el hombre que gira alrededor del planeta Tierra.'
  ]),
  pt('p128', 'Puente', ['los puentes', 'el puente'], [
    'Es una megaestructura de obra civil.',
    'Su diseño ha evolucionado desde el uso rudimentario de troncos y lianas hasta los tirantes de acero.',
    'Resuelve el obstáculo logístico de conectar dos franjas de tierra separadas por una depresión del terreno.',
    'Sostiene una plataforma longitudinal rígida soportada por arcos, pilares enterrados o tensores de suspensión.',
    'Soporta el tránsito continuo de vehículos o vías de tren atravesando por el aire precipicios o masas de agua.',
    'Construcción arquitectónica que permite a los coches y viandantes cruzar un río de una orilla a otra.'
  ]),
  pt('p129', 'Semáforo', ['el semaforo', 'los semaforos'], [
    'Es un sistema de señalización electromecánico.',
    'Apareció como una medida ineludible para orquestar los conflictos de movilidad en el asfalto.',
    'Basa su eficacia psicológica en la rotación automatizada de estímulos visuales universales.',
    'Se instala verticalmente en las intersecciones viales y junto a los pasos de cebra para ordenar el turno de paso.',
    'Aplica una convención cromática que exige avanzar con un tono, alertar con otro y detenerse por completo con un tercero.',
    'Poste de las calles con luces roja, amarilla y verde que indica a los coches cuándo parar o seguir.'
  ]),
  pt('p130', 'Ducha', ['la ducha', 'regadera'], [
    'Es un elemento de la infraestructura sanitaria.',
    'Su expansión en las viviendas mejoró radicalmente las rutinas higiénicas de la sociedad contemporánea.',
    'Requiere conexión directa a la red de presurización hidráulica y cuenta con un sumidero gravitatorio en su base.',
    'Atomiza un flujo continuo de líquido a través de un cabezal o rociador multiperforado fijado en altura.',
    'Se utiliza para el aseo corporal completo manteniendo una postura erguida tras una mampara o cortina de plástico.',
    'Instalación del cuarto de baño donde cae agua desde arriba en forma de lluvia fina para lavarnos.'
  ]),

  // =========================================================================
  // 4. CIUDADES DEL MUNDO (p131 - p140)
  // =========================================================================
  pt('p131', 'Berlín', ['berlin'], [
    'Es un importante nodo de población y poder.',
    'Se ubica en la geografía de la vasta llanura central del continente europeo.',
    'Experimentó la partición radical de sus barrios debido a diferencias ideológicas durante la Guerra Fría.',
    'Conserva lugares de memoria histórica como el Checkpoint Charlie y el monumental edificio del Reichstag.',
    'Un inmenso muro de hormigón armado dividió su plano urbano hasta que fue derribado en noviembre de 1989.',
    'Capital de Alemania famosa por su histórica Puerta de Brandeburgo.'
  ]),
  pt('p132', 'Moscú', ['moscu', 'moscow'], [
    'Es un núcleo metropolitano de proporciones colosales.',
    'Se asienta en las gélidas latitudes de la franja oriental de Europa.',
    'Ejerció durante décadas como la sede indiscutible del bloque geopolítico soviético.',
    'Su extensa red de metro subterráneo es conocida internacionalmente por estaciones decoradas como palacios.',
    'Alberga en su corazón histórico el gigantesco recinto amurallado del Kremlin y la mítica Plaza Roja.',
    'Capital de Rusia coronada por las cúpulas coloridas y bulbosas de la catedral de San Basilio.'
  ]),
  pt('p133', 'Sídney', ['sydney', 'sidney'], [
    'Es una floreciente urbe portuaria.',
    'Fue fundada en las antípodas geográficas del mundo occidental, frente a un inmenso océano.',
    'Pese a ser el motor demográfico y financiero más famoso de su nación, no ejerce como capital estatal.',
    'Gran parte del transporte y la estética de la ciudad giran en torno al espectacular puente de su bahía.',
    'En uno de sus cabos se erige un icónico y modernista auditorio blanco con tejados que parecen conchas marinas.',
    'La ciudad más turística de Australia, mundialmente conocida por su edificio de la Ópera.'
  ]),
  pt('p134', 'Buenos Aires', ['caba', 'capital federal'], [
    'Es una metrópolis costera de gran influencia cultural.',
    'Se asienta de manera plana sobre la orilla occidental del Río de la Plata.',
    'Su trazado combina herencia colonial con una marcada influencia de la arquitectura parisina y española.',
    'Los habitantes de sus populosos barrios periféricos y céntricos son conocidos coloquialmente como porteños.',
    'Es la cuna del tango, alberga la famosa avenida 9 de Julio y cuenta con la pintoresca barriada de La Boca.',
    'Capital de Argentina, reconocible por su gran Obelisco blanco y la Casa Rosada.'
  ]),
  pt('p135', 'El Cairo', ['cairo', 'el cairo'], [
    'Es una aglomeración urbana de crecimiento expansivo.',
    'Constituye el principal foco demográfico y cultural de su área continental septentrional.',
    'Ha evolucionado históricamente prosperando en los fértiles márgenes del río más largo de su hemisferio.',
    'En su centro late un laberíntico bazar histórico tradicional conocido como Jan el-Jalili.',
    'En el horizonte de sus afueras se recorta nítidamente la imponente silueta de tres tumbas colosales.',
    'Capital de Egipto situada a escasa distancia de las pirámides de Guiza y la Esfinge.'
  ]),
  pt('p136', 'Pekín', ['beijing', 'pekin'], [
    'Es un centro de poder administrativo y demográfico.',
    'Ha actuado como sede del gobierno imperial y político de Oriente a lo largo de varias dinastías.',
    'Mostró su extrema capacidad organizativa organizando unos deslumbrantes Juegos Olímpicos de verano en 2008.',
    'En su distrito central se expande la gigantesca plaza monumental de Tiananmén, lugar de protestas históricas.',
    'Alberga un inmenso y laberíntico complejo palaciego fortificado y vetado al pueblo llamado la Ciudad Prohibida.',
    'Capital de la República Popular China.'
  ]),
  pt('p137', 'Atenas', ['athenas'], [
    'Es un enclave urbano de antigüedad excepcional.',
    'Su geografía se enmarca en la soleada y accidentada orografía del Mediterráneo oriental.',
    'Los libros de historia la designan como la cuna original del pensamiento filosófico y el sistema democrático.',
    'Fue la sede elegida en el siglo XIX para reanudar la antigua tradición de las competiciones olímpicas.',
    'Una colina rocosa central domina la ciudad coronada por las enormes columnas de mármol del Partenón.',
    'Capital de Grecia y núcleo principal de la civilización helénica clásica.'
  ]),
  pt('p138', 'Ámsterdam', ['amsterdam'], [
    'Es una localidad muy activa del norte europeo.',
    'Su fisonomía urbana se adaptó a un terreno ganado laboriosamente al agua y las mareas.',
    'Su estructura viaria se articula mediante un sistema concéntrico y semicircular de vías navegables.',
    'A nivel de transporte y sonido, el repiqueteo de los pedales y timbres supera al ruido de los motores de coche.',
    'Cuenta con reclamos turísticos peculiares como el Barrio Rojo o el museo pictórico de Van Gogh.',
    'Capital de los Países Bajos, muy famosa por estar llena de bicicletas y canales de agua.'
  ]),
  pt('p139', 'La Habana', ['habana'], [
    'Es una población insular y caribeña.',
    'Actuó durante siglos como una de las plazas comerciales más protegidas del Imperio español en ultramar.',
    'Su arquitectura colonial y colorida presenta un evidente desgaste debido al bloqueo y el clima salino.',
    'Su paseo marítimo empedrado, donde rompen violentamente las olas del mar, se conoce como el Malecón.',
    'Por sus calles siguen circulando a diario y a modo de taxi multitud de enormes coches clásicos americanos de los años 50.',
    'Capital de Cuba, famosa por sus puros, su ron y su revolución.'
  ]),
  pt('p140', 'Estambul', ['istanbul'], [
    'Es un enclave urbano de ubicación privilegiada y dividida.',
    'En épocas pasadas dominó el mundo bajo nomenclaturas clásicas como Bizancio y Constantinopla.',
    'Es el único gran asentamiento del planeta situado estratégicamente sobre dos continentes distintos a la vez.',
    'Una franja de agua navegable conocida como el estrecho del Bósforo separa su parte europea de su parte asiática.',
    'Su paisaje aéreo está salpicado por los altos minaretes de la Mezquita Azul y la basílica de Santa Sofía.',
    'La urbe turística más grande e importante de Turquía.'
  ]),

  // =========================================================================
  // 5. MONUMENTOS Y ACCIDENTES NATURALES (p141 - p150)
  // =========================================================================
  pt('p141', 'Cataratas del Niágara', ['cataratas del niagara', 'niagara'], [
    'Es una impresionante anomalía del relieve hídrico.',
    'Actúa como una delimitación política natural entre dos importantes naciones soberanas.',
    'El violento flujo de su cauce se explota industrialmente para generar energía mediante turbinas hidroeléctricas.',
    'Divide las tierras de la provincia de Ontario de las pertenecientes al estado de Nueva York.',
    'Los turistas se acercan al estruendoso impacto del agua montados en barcos, vistiendo chubasqueros azules o rojos.',
    'Famosas y amplias caídas de agua situadas en la frontera directa entre Canadá y Estados Unidos.'
  ]),
  pt('p142', 'Gran Cañón', ['gran canon', 'gran canon del colorado'], [
    'Es una cicatriz geológica de proporciones gigantescas.',
    'Se ubica en los áridos paisajes desérticos de la zona suroeste de América del Norte.',
    'Muestra a simple vista millones de años de historia geológica a través de las capas de sus paredes escarpadas.',
    'Es el resultado del persistente y destructivo poder de erosión del cauce de un único río durante milenios.',
    'Desde sus miradores de vértigo se aprecian inmensas formaciones rocosas de color rojizo y ocre en el estado de Arizona.',
    'Inmensa y profunda garganta natural excavada por el serpenteante río Colorado.'
  ]),
  pt('p143', 'Machu Picchu', ['machupicchu'], [
    'Es un asentamiento humano en ruinas de difícil acceso.',
    'Se construyó en una ubicación estratégica rodeada por la imponente orografía de la cordillera de los Andes.',
    'Sus creadores lograron ensamblar inmensos bloques de roca pulida sin utilizar ningún tipo de mortero.',
    'Quedó abandonada y oculta bajo la espesura vegetal hasta su redescubrimiento científico internacional en 1911.',
    'Cuenta con un complejo sistema de verdes terrazas agrícolas escalonadas y está vigilada por el pico del Huayna Picchu.',
    'Famosa ciudadela sagrada de piedra de la civilización inca situada en las alturas de Perú.'
  ]),
  pt('p144', 'Torre de Pisa', ['torre inclinada de pisa', 'torre inclinada'], [
    'Es una edificación europea de carácter histórico.',
    'Fue proyectada durante la Edad Media para cumplir una función exclusivamente religiosa y acústica.',
    'Su grave problema estructural se originó de forma casi inmediata debido a la inestabilidad arcillosa de sus cimientos.',
    'Tiene forma de cilindro hueco rodeado de arcos ciegos y galerías exteriores hechas íntegramente de mármol blanco.',
    'Los ingenieros han trabajado durante décadas inyectando cemento para evitar que la plomada de su estructura se desplome.',
    'Famoso campanario de una ciudad de Italia mundialmente conocido por estar notablemente torcido.'
  ]),
  pt('p145', 'Coliseo romano', ['el coliseo', 'coliseo'], [
    'Es una obra cumbre de la ingeniería de la Antigüedad.',
    'Fue edificado empleando una red de arcos y bóvedas de hormigón revestidas originalmente de travertino.',
    'Representaba el centro absoluto del entretenimiento masivo y la propaganda imperial de su época.',
    'Bajo su enorme plataforma elíptica se ocultaba un complejo laberinto de jaulas y montacargas para fieras salvajes.',
    'Llegó a albergar a más de cincuenta mil espectadores sedientos de sangre en el mismo corazón de Italia.',
    'El gigantesco anfiteatro de piedra situado en Roma donde luchaban a muerte los gladiadores.'
  ]),
  pt('p146', 'Gran Muralla China', ['muralla china'], [
    'Es un proyecto arquitectónico de escala continental.',
    'Sus trazados zigzaguean adaptándose a la escarpada orografía montañosa de su región asiática.',
    'Fue unificada y fortificada sucesivamente por varias dinastías imperiales a lo largo de los siglos.',
    'Se concibió como un interminable sistema defensivo de aislamiento frente a las incursiones de las caballerías nómadas.',
    'Está salpicada a intervalos regulares por sólidas torres de vigilancia y fortalezas conectadas por pasillos de ladrillo.',
    'Mítica y larguísima fortificación de miles de kilómetros que cruza las montañas para proteger China.'
  ]),
  pt('p147', 'Estatua de la Libertad', ['la estatua de la libertad'], [
    'Es una colosal figura figurativa exenta.',
    'Cruzó el océano desmontada en cientos de piezas como símbolo de la amistad política entre dos repúblicas.',
    'Su estructura interna fue diseñada por el ingeniero Gustave Eiffel para soportar los fuertes vientos costeros.',
    'Su capa exterior de placas de cobre ha adquirido una característica tonalidad verde turquesa por la oxidación natural.',
    'Sostiene una tabla con la fecha de la independencia americana y eleva un faro luminoso con la mano derecha.',
    'Monumento de una mujer con corona y antorcha que da la bienvenida a los barcos en la bahía de Nueva York.'
  ]),
  pt('p148', 'Taj Mahal', ['el taj mahal'], [
    'Es un complejo arquitectónico y paisajístico.',
    'Se inscribe dentro de la tradición constructiva y estética del apogeo de un gran imperio asiático.',
    'A pesar de su apariencia de palacio, su propósito original y exclusivo es el de ser una tumba monumental.',
    'El emperador mogol Shah Jahan ordenó su levantamiento al quedar desolado por la muerte de su esposa favorita.',
    'Destaca por su asombrosa simetría perfecta, coronada por una gran cúpula de mármol blanco reflejada en el agua.',
    'Precioso mausoleo de mármol con cuatro torres situado en la ciudad de Agra, símbolo de la India.'
  ]),
  pt('p149', 'Río Amazonas', ['el amazonas', 'rio amazonas', 'amazonas'], [
    'Es un enorme accidente hidrográfico.',
    'Inicia su recorrido geográfico como un torrente de deshielo en las grandes altitudes de la cordillera andina.',
    'A lo largo de su inmenso trayecto hacia el Atlántico recibe el agua de miles de potentes afluentes.',
    'Su volumen de agua es tan descomunal que representa una quinta parte del agua fluvial de todo el globo terrestre.',
    'Discurre de oeste a este atravesando y dando vida a la mayor franja de selva tropical del planeta.',
    'El río más largo y caudaloso del mundo, que atraviesa la densa jungla de América del Sur.'
  ]),
  pt('p150', 'Desierto del Sahara', ['sahara', 'el sahara'], [
    'Es una vasta franja de territorio natural.',
    'La escasez extrema de humedad atmosférica provoca variaciones de temperatura radicales entre la noche y el día.',
    'Su extensión total es casi equiparable al tamaño geográfico de superpotencias como China o los Estados Unidos.',
    'Está dominado alternativamente por desoladas mesetas pedregosas y ondulantes mares de arena barridos por el viento.',
    'Ocupa la mayor parte de la mitad norte del continente africano y sus nómadas viajan montados en camellos.',
    'El desierto cálido de arena más grande de la Tierra.'
  ]),

  // =========================================================================
  // 6. PERSONAJES HISTÓRICOS Y CIENTÍFICOS (p151 - p160)
  // =========================================================================
  pt('p151', 'Charles Darwin', ['darwin'], [
    'Es un analista de la naturaleza del siglo XIX.',
    'Procedente de las islas británicas, cuestionó profundamente los dogmas inmutables de su tiempo.',
    'Su capacidad deductiva se encendió tras realizar un viaje de investigación de cinco años a bordo del buque Beagle.',
    'La observación de sutiles variaciones en los picos de los pinzones del archipiélago de Galápagos fue clave en su tesis.',
    'Plasmó sus revolucionarias y polémicas ideas publicando el ensayo titulado El origen de las especies.',
    'Científico británico que postuló la Teoría de la Evolución de los seres vivos mediante la selección natural.'
  ]),
  pt('p152', 'Ludwig van Beethoven', ['beethoven'], [
    'Es una personalidad cumbre de la cultura europea.',
    'Desarrolló su vocación artística a caballo entre las convenciones del Clasicismo y el ímpetu del Romanticismo.',
    'Dejó un legado monumental de sonatas y conciertos pese a poseer un carácter hosco y atormentado.',
    'Una tragedia biológica paulatina lo sumió en el silencio absoluto, pero no detuvo su capacidad creativa.',
    'Añadió de forma rompedora un coro vocal en el movimiento final de su monumental Novena Sinfonía.',
    'Genio de la música clásica nacido en Alemania que compuso obras maestras estando completamente sordo.'
  ]),
  pt('p153', 'Wolfgang Amadeus Mozart', ['mozart'], [
    'Es un creador artístico de la época clásica.',
    'Su biografía está marcada por una vida errante de exhibición cortesana que se apagó prematuramente a los 35 años.',
    'Apenas siendo un infante, memorizaba partituras complejas y actuaba asombrando a las monarquías europeas.',
    'Tiene en su haber un extenso y alegre catálogo que incluye la popular Serenata nocturna y óperas cómicas.',
    'Falleció agotado y en la miseria mientras intentaba finalizar el encargo anónimo de un Réquiem.',
    'El más famoso niño prodigio de la historia de la música austriaca, autor de La flauta mágica.'
  ]),
  pt('p154', 'Isaac Newton', ['newton'], [
    'Es uno de los intelectos fundacionales del mundo moderno.',
    'Nació en Inglaterra y contribuyó de manera vital al cálculo matemático y al comportamiento de la óptica.',
    'Demostró que la luz blanca común estaba formada en realidad por todo el espectro de colores del arcoíris.',
    'Sintetizó en tres leyes universales los principios que rigen la dinámica y el movimiento físico de las masas.',
    'Un mito muy extendido asocia el momento de su mayor inspiración a la caída de una fruta desde un árbol.',
    'Científico que formuló la Ley de la Gravitación Universal tras supuestamente ver caer una manzana.'
  ]),
  pt('p155', 'Stephen Hawking', ['hawking'], [
    'Es un influyente pensador teórico contemporáneo.',
    'Su aportación investigadora se enfocó en comprender el inicio y los límites físicos del universo observable.',
    'Desafió de manera asombrosa un diagnóstico médico neurológico que le auguraba apenas dos años de supervivencia.',
    'Planteó que ciertas regiones supermasivas del espacio emitían una débil radiación que acabaría por evaporarlas.',
    'Escribió "Breve historia del tiempo" interactuando con un ordenador mediante leves movimientos musculares de su mejilla.',
    'Famoso físico británico que investigó los agujeros negros postrado en una silla de ruedas con un sintetizador de voz.'
  ]),
  pt('p156', 'Nelson Mandela', ['mandela', 'madiba'], [
    'Es un símbolo moral y político del siglo XX.',
    'Ejerció un liderazgo basado en la resistencia cívica que acabó derribando un sistema institucionalizado.',
    'Pese a su formación como abogado, el régimen gobernante lo catalogó como terrorista y lo alejó de la sociedad.',
    'Pasó veintisiete años de su vida confinado realizando trabajos forzados en la prisión de Robben Island.',
    'Tras ser liberado, evitó la revancha, ganó el Nobel de la Paz y fue elegido presidente de su país en 1994.',
    'Líder negro sudafricano que derrotó pacíficamente el Apartheid racista.'
  ]),
  pt('p157', 'Mahatma Gandhi', ['gandhi'], [
    'Es una figura histórica de dimensión global.',
    'Rechazó las comodidades materiales en favor de un ascetismo que inspiró a millones de sus compatriotas.',
    'Desafió abiertamente a una gran potencia colonial europea sin utilizar jamás armamento ni explosivos.',
    'Organizó la Marcha de la Sal y protagonizó huelgas de hambre públicas para presionar a las autoridades.',
    'Iba vestido invariablemente con unas sencillas gafas redondas y una túnica de algodón blanco hilada por él mismo.',
    'Líder espiritual y pacifista indio que logró la independencia de la India frente al Imperio británico.'
  ]),
  pt('p158', 'Cristóbal Colón', ['colon'], [
    'Es un protagonista absoluto de los mapas de la historia.',
    'El lugar exacto de su nacimiento sigue generando intensos debates, aunque la versión más aceptada apunta a Génova.',
    'Se basó en cálculos erróneos sobre el perímetro del planeta para justificar un atajo comercial por vía marítima.',
    'Obtuvo la difícil financiación económica de los Reyes Católicos para pertrechar sus naves en el puerto de Palos.',
    'El 12 de octubre de 1492 pisó tierra firme convencido erróneamente de haber llegado a las Indias.',
    'Famoso almirante y navegante que lideró las carabelas y descubrió el continente americano.'
  ]),
  pt('p159', 'Julio César', ['cesar'], [
    'Es un estadista militar del mundo antiguo.',
    'Forjó su reputación táctica al someter por completo los territorios tribales que rodeaban a su nación.',
    'Al regresar vencedor, cruzó el río Rubicón con sus legiones iniciando una guerra civil con la frase "la suerte está echada".',
    'Logró ser nombrado dictador vitalicio, lo que despertó el miedo monárquico en las élites conservadoras de su senado.',
    'Fue brutalmente apuñalado en los idus de marzo por una conspiración que incluía a su protegido Bruto.',
    'General de Roma que conquistó la Galia, tuvo romances con Cleopatra y fue asesinado por senadores.'
  ]),
  pt('p160', 'Alejandro Magno', ['alejandro el grande'], [
    'Es un genio de la estrategia militar de la Antigüedad.',
    'Hijo de un rey asesinado, tuvo como tutor personal al mismísimo filósofo Aristóteles durante su infancia.',
    'Logró una hazaña logística impensable llevando sus tropas desde el Mediterráneo hasta los márgenes de la India.',
    'Montando a su mítico caballo Bucéfalo, humilló y destruyó por completo al todopoderoso Imperio persa de Darío III.',
    'No perdió ni una sola de sus batallas, pero falleció víctima de una fiebre misteriosa con apenas 32 años.',
    'Joven e invencible rey de Macedonia que forjó uno de los mayores imperios del mundo antes de Cristo.'
  ]),

  // =========================================================================
  // 7. CULTURA, DEPORTE Y FICCIÓN (p161 - p170)
  // =========================================================================
  pt('p161', 'Rafael Nadal', ['nadal', 'rafa nadal'], [
    'Es un profesional del ámbito deportivo en activo.',
    'Su progresión estuvo tutelada estrechamente en el plano físico y mental por un estricto pariente cercano.',
    'Obligó a modificar sus esquemas musculares para competir en una lateralidad que no era la suya natural.',
    'Destaca por un ritual casi obsesivo de orden de sus botellas y gestos en la pista antes de efectuar un saque.',
    'Forjó una legendaria rivalidad tricéfala junto a los talentos de Roger Federer y Novak Djokovic.',
    'Histórico tenista español, catorce veces campeón de Roland Garros y apodado el Rey de la Tierra Batida.'
  ]),
  pt('p162', 'Michael Jordan', ['jordan', 'air jordan'], [
    'Es una leyenda global del atletismo competitivo.',
    'Transformó la dimensión mediática y comercial de su disciplina a finales del pasado siglo.',
    'Su innegable capacidad anotadora y su gen hipercompetitivo le llevaron a abandonar el deporte para probar el béisbol.',
    'Es venerado por sus vuelos acrobáticos hacia la red, lo que impulsó una lucrativa y famosísima línea de zapatillas.',
    'Lideró a los Chicago Bulls de la década de 1990 consiguiendo seis anillos de campeonato.',
    'El jugador estadounidense con el dorsal 23 considerado unánimemente el mejor jugador de baloncesto de la historia.'
  ]),
  pt('p163', 'Pelé', ['edson arantes do nascimento', 'pele'], [
    'Es una de las figuras más reverenciadas del deporte mundial.',
    'Nacido en 1940 en la pobreza, lustraba zapatos en su infancia antes de encandilar al mundo con un balón.',
    'Su impacto global comenzó tras asombrar al planeta ganando un gran campeonato internacional con solo 17 años.',
    'Consolidó la mística del dorsal número 10 y jugó la inmensa mayoría de su carrera en un club llamado Santos.',
    'Es el único profesional del fútbol que puede presumir de haber levantado el trofeo del Mundial en tres ocasiones.',
    'Fallecido astro brasileño del balompié al que los aficionados coronaron con el título de "O Rei".'
  ]),
  pt('p164', 'Freddie Mercury', ['mercury', 'queen'], [
    'Es un creador e intérprete del entorno musical moderno.',
    'Su compleja ascendencia vital mezclaba un nacimiento africano, orígenes parsis e identidad británica.',
    'Destacó por fusionar el rock de estadios con arreglos teatrales operísticos de tremenda ambición armónica.',
    'Dominaba el escenario con movimientos enérgicos, vistiendo llamativas chaquetas o tirantes y cantando con un registro prodigioso.',
    'Compuso y cantó de manera inmortal piezas generacionales como "Bohemian Rhapsody" y "We Are the Champions".',
    'El inolvidable y carismático vocalista principal que lideró la banda de rock Queen.'
  ]),
  pt('p165', 'Vincent van Gogh', ['van gogh'], [
    'Es un trabajador de la creatividad plástica y visual.',
    'Se aproximó al arte de manera tardía, influenciado por su inicial y fallida vocación religiosa.',
    'No logró el más mínimo reconocimiento en vida, dependiendo económicamente del afecto constante de su hermano Theo.',
    'Su estilo inconfundible se basa en la superposición gruesa de óleos puros, utilizando amarillos vibrantes y trazos en espiral.',
    'Pintó febrilmente obras maestras como Los girasoles y La noche estrellada desde la habitación de un manicomio.',
    'Pintor postimpresionista neerlandés famoso por su pincelada ondulante y por haberse mutilado una oreja.'
  ]),
  pt('p166', 'Walt Disney', ['disney'], [
    'Es un pionero absoluto en una rama del entretenimiento audiovisual.',
    'Superó varias quiebras empresariales y pérdidas de derechos de autor antes de fundar un estudio independiente.',
    'Revolucionó el cine asumiendo el riesgo inmenso de producir el primer largometraje sonoro pintado a mano a todo color.',
    'Expulsó de la pantalla a los actores reales para construir un inmenso y lucrativo parque de atracciones temático.',
    'Inició su gigantesco imperio multimedia diseñando a lápiz los bocetos de un roedor con pantalones cortos rojos.',
    'El célebre cineasta estadounidense creador del dibujo animado de Mickey Mouse.'
  ]),
  pt('p167', 'Neil Armstrong', ['armstrong'], [
    'Es un aviador militar y científico del siglo pasado.',
    'Demostró un temple de acero al lograr aterrizar vehículos experimentales que perdían peligrosamente el control.',
    'Superó un exigente proceso de selección de su gobierno para comandar la misión de exploración más atrevida de la humanidad.',
    'En el mes de julio de 1969 maniobró manualmente un módulo de descenso para no estrellarse en el Mar de la Tranquilidad.',
    'Su voz pasó a la posteridad retransmitiendo por radio que el descenso era un "pequeño paso para el hombre".',
    'El famoso astronauta estadounidense que pasó a la historia como la primera persona en pisar la Luna.'
  ]),
  pt('p168', 'J.K. Rowling', ['rowling'], [
    'Es una creadora del mundo de la escritura contemporánea.',
    'Su biografía destaca cómo concibió su idea más brillante mientras aguardaba aburrida el retraso de un convoy ferroviario.',
    'Atravesó penurias económicas redactando borradores en las servilletas de distintas cafeterías de Edimburgo.',
    'Su talento narrativo consolidó un inmenso universo centrado en varitas, pociones mágicas y un colegio oscuro en Escocia.',
    'Inventó el peligroso y trepidante deporte sobre escobas voladoras conocido como el Quidditch.',
    'Autora británica que se hizo inmensamente famosa escribiendo la saga de libros de Harry Potter.'
  ]),
  pt('p169', 'Miguel de Cervantes', ['cervantes'], [
    'Es la máxima cima representativa del Siglo de Oro.',
    'Tuvo una vida aventurera llena de fracasos, desempeñando oficios como recaudador de impuestos y soldado de infantería.',
    'Estuvo sometido a un largo y severo cautiverio encadenado en Argel a manos de corsarios berberiscos.',
    'En la batalla naval de Lepanto sufrió heridas de arcabuz que le arrebataron para siempre la movilidad del brazo izquierdo.',
    'Redactó desde una celda la inmortal obra cumbre sobre un hidalgo que enloquece por exceso de lecturas caballerescas.',
    'Escritor español apodado el Manco de Lepanto, padre y autor literario de Don Quijote de la Mancha.'
  ]),
  pt('p170', 'Don Quijote de la Mancha', ['don quijote', 'el quijote'], [
    'Es una construcción argumental literaria.',
    'Encarna el idealismo absoluto estrellándose repetidamente de forma cómica contra la tozuda realidad.',
    'Su cordura se resquebraja al no poder distinguir los relatos fantásticos de caballería de su aburrida vida en una aldea.',
    'Bautiza a un escuálido caballo de trabajo con un nombre noble e impone sus servicios a la imaginaria señora Dulcinea del Toboso.',
    'Sale en busca de aventuras armado con una lanza mohosa en compañía de un realista y glotón escudero llamado Sancho Panza.',
    'El hidalgo loco y espigado de Cervantes que se enfrentó a unos simples molinos de viento creyendo que eran gigantes.'
  ]),

  // =========================================================================
  // 8. ANIMALES VARIADOS (p171 - p180)
  // =========================================================================
  pt('p171', 'Águila', ['aguilas', 'el aguila'], [
    'Es un vertebrado perfectamente adaptado al vuelo.',
    'Se sitúa en la cúspide indiscutible de su cadena trófica debido a su agresividad y fuerza estructural.',
    'La anatomía de sus ojos le confiere una resolución óptica capaz de detectar movimientos diminutos a dos kilómetros de distancia.',
    'Para su cría elabora plataformas de ramajes muy sólidas situadas en las cornisas de inaccesibles acantilados rocosos.',
    'Ha sido utilizada históricamente en escudos heráldicos e imperios como símbolo de supremacía, desde Roma hasta Estados Unidos.',
    'Gran ave rapaz de pico curvo, majestuoso vuelo y afiladas garras cazadoras.'
  ]),
  pt('p172', 'Búho', ['buhos', 'el buho', 'lechuza'], [
    'Es un animal alado depredador.',
    'Ha evolucionado especializándose en un nicho ecológico donde reinan la oscuridad y el silencio.',
    'La estructura aserrada de los bordes de sus plumas le permite abatir el aire sin generar ni el más mínimo murmullo acústico.',
    'Su visión estereoscópica está fija, lo que le obliga a rotar su cuello hasta doscientos setenta grados para observar el entorno.',
    'La mitología clásica y los dibujos infantiles suelen atribuirle injustificadamente la virtud de la sabiduría.',
    'Ave rapaz nocturna provista de enormes ojos redondos que emite un profundo ulular en el bosque.'
  ]),
  pt('p173', 'Pulpo', ['el pulpo', 'pulpos'], [
    'Es un organismo que desarrolla su vida en el fondo marino.',
    'Pertenece al sofisticado linaje biológico de los moluscos, aunque carece por completo de caparazón.',
    'Su red neuronal no se centraliza solo en su cabeza, sino que se distribuye a lo largo de sus extremidades contráctiles.',
    'Dispone de sacos de pigmentos en su dermis que le permiten mimetizar la textura y color exacto de cualquier roca en segundos.',
    'Su anatomía consta de un manto bulboso central del que nacen ocho brazos cubiertos de fuertes ventosas adhesivas.',
    'Invertebrado oceánico sin huesos capaz de expulsar nubes de tinta negra oscura para huir de sus enemigos.'
  ]),
  pt('p174', 'Koala', ['los koalas', 'el koala'], [
    'Es una especie cuadrúpeda terrestre.',
    'El aislamiento milenario de su isla continental propició un modelo evolutivo de reproducción muy singular.',
    'Casi la totalidad de su metabolismo se destina a procesar y desintoxicar las hojas fibrosas de las que se alimenta.',
    'Para reducir su gasto calórico al mínimo absoluto, descansa encaramado a las horquillas de las ramas hasta veintidós horas diarias.',
    'Presenta una enorme nariz negra aplastada, orejas peludas y carece de cola visible al agarrarse fuertemente a los árboles.',
    'Tranquilo y simpático marsupial de Australia que se alimenta estrictamente mordisqueando hojas de eucalipto.'
  ]),
  pt('p175', 'Abeja', ['abejas', 'la abeja'], [
    'Es un espécimen zoológico de pequeño tamaño.',
    'Desempeña un rol sistémico de incalculable valor para la reproducción vegetal de todo el planeta.',
    'Su modelo de convivencia se rige por un colectivismo extremo y jerarquizado donde los individuos carecen de interés propio.',
    'Recoge el polen revoloteando de flor en flor y construye perfectos habitáculos de diseño hexagonal para la cría.',
    'Cuando clava el aguijón para defender su colonia sufre un desgarro abdominal que le provoca la muerte inmediata.',
    'Insecto volador de rayas amarillas y negras que elabora la miel en el interior de los panales.'
  ]),
  pt('p176', 'Cocodrilo', ['cocodrilos', 'el cocodrilo'], [
    'Es un animal ligado fuertemente al agua dulce y salobre.',
    'Es un verdadero fósil viviente que comparte linaje directo con criaturas extintas hace millones de años.',
    'Su anatomía se ha especializado en el ahorro de energía, regulando su temperatura interna tumbándose inmóvil bajo el sol.',
    'Se camufla acechando sumergido en los ríos fangosos africanos asomando exclusivamente sus protuberancias nasales y oculares.',
    'Tienen un hocico en forma de V donde se aprecian perfectamente sus dientes inferiores aun cuando cierran la boca.',
    'Inmenso y agresivo reptil acorazado con una letal y larguísima mandíbula dentada.'
  ]),
  pt('p177', 'Gorila', ['gorilas', 'el gorila'], [
    'Es un componente del reino animal de gran corpulencia.',
    'Mantiene una altísima coincidencia genética con la especie biológica a la que pertenecemos nosotros.',
    'La estructura jerárquica de su clan familiar suele ser custodiada y liderada por un único macho adulto dominante.',
    'A pesar de su temible apariencia, es un ser pacífico y eminentemente vegetariano que deambula apoyando los nudillos.',
    'Alcanza su fase de máxima madurez cuando los pelos oscuros de su ancha espalda se vuelven de tono plateado.',
    'El primate y simio salvaje más grande, musculoso y pesado del mundo selvático.'
  ]),
  pt('p178', 'Cebra', ['cebras', 'la cebra'], [
    'Es una especie vertebrada adaptada a la carrera rápida.',
    'Su morfología indica un parentesco innegable con otros animales muy populares en entornos de granja o de hípica.',
    'Debe protagonizar épicas y mortales migraciones estacionales buscando pastos frescos por las llanuras africanas.',
    'La comunidad biológica debate si su asombroso pelaje rayado actúa como sistema de refrigeración o como camuflaje óptico.',
    'Presenta una pequeña crin tiesa sobre el cuello y su ladrido o relincho es agudo y áspero.',
    'Herbívoro africano similar a un caballo pequeño pero inconfundible por sus rayas blancas y negras.'
  ]),
  pt('p179', 'Oso panda', ['el panda', 'oso panda', 'panda'], [
    'Es un enorme mamífero terrestre.',
    'Su hábitat salvaje ha quedado restringido a unas pocas formaciones montañosas aisladas y brumosas en Asia oriental.',
    'La pérdida paulatina de interés reproductor y su estrecha dieta complican severamente la conservación de su especie.',
    'Su dentadura carnívora tritura sin descanso cañas leñosas vegetales a las que dedica más de diez horas de masticación diaria.',
    'Su pelaje desarrolla unas inconfundibles ojeras oscuras que contrastan fuertemente con el blanco del resto del cráneo.',
    'El rechoncho y entrañable oso blanco y negro de China que vive comiendo bambú constantemente.'
  ]),
  pt('p180', 'Medusa', ['medusas', 'la medusa'], [
    'Es un ser vivo muy primitivo.',
    'La inmensa mayoría de la composición estructural de su masa depende exclusivamente del agua marina.',
    'Posee un diseño biológico tan rudimentario que carece totalmente de corazón, estructura ósea o sistema nervioso central.',
    'Se propaga dejándose arrastrar por las corrientes mediante una campana o sombrilla de aspecto frágil y gelatinoso.',
    'En la zona inferior de su cuerpo arrastra unos largos tentáculos equipados con potentes células venenosas.',
    'El animal transparente y temido de las playas marinas cuyas largas tiras provocan graves picaduras y urticaria al bañista.'
  ]),

  // =========================================================================
  // 9. EMOCIONES, ACTITUDES Y VIRTUDES (p181 - p190)
  // =========================================================================
  pt('p181', 'Tristeza', ['la tristeza', 'pena'], [
    'Es una experiencia psicológica primaria y universal.',
    'Actúa biológicamente forzando al organismo a reducir su metabolismo para obligarle a procesar una realidad adversa.',
    'Se desencadena de manera natural cuando se experimentan rupturas sentimentales o la frustración de expectativas importantes.',
    'Se reconoce facialmente por el arqueo de las cejas y un hundimiento involuntario de las comisuras de los labios.',
    'En el popular filme de animación "Del Revés", este concepto es encarnado por un melancólico personaje de color azul.',
    'Emoción de decaimiento y pena profunda que provoca aflicción y suele manifestarse en forma de llanto con lágrimas.'
  ]),
  pt('p182', 'Celos', ['los celos'], [
    'Es una respuesta emocional muy destructiva en las interacciones.',
    'Tiene raíces psicológicas fundadas en profundas inseguridades personales y falta de madurez.',
    'Brota en relaciones humanas ante la amenaza imaginaria o real de ser sustituido en los afectos del otro.',
    'El gran escritor inglés Shakespeare la inmortalizó trágicamente en la obra "Otelo", llamándola "el monstruo de ojos verdes".',
    'Conduce invariablemente a comportamientos tóxicos de dominación, sospecha e invasión a la privacidad del teléfono.',
    'Sentimiento posesivo de desconfianza profunda y rabia al creer que tu pareja puede estar con otra persona.'
  ]),
  pt('p183', 'Soledad', ['la soledad'], [
    'Es una circunstancia que puede ser física o meramente psicológica.',
    'Ciertos pensadores e inventores aseguran necesitarla como un requisito imprescindible para encontrar la paz y la creatividad.',
    'Cuando se instaura de forma obligatoria y continuada, constituye uno de los mayores factores de riesgo para la depresión.',
    'Se define directamente como el estado de aislamiento frente al resto de la comunidad humana.',
    'Es el concepto protagonista del título de una de las grandes novelas de Gabriel García Márquez ambientada en Macondo.',
    'Es la dura sensación de desamparo y tristeza que experimentamos al sentirnos completamente aislados o sin compañía alguna.'
  ]),
  pt('p184', 'Orgullo', ['el orgullo'], [
    'Es una valoración de corte subjetivo.',
    'Las doctrinas clásicas advierten que, cuando se descontrola, ciega al individuo y le impide enmendar sus propios fallos.',
    'En su justa medida, es el aliento sano que se siente interiormente tras superar un desafío de enorme dificultad técnica.',
    'Conforma, junto con el prejuicio, el título de un inolvidable y punzante relato británico costumbrista escrito por Jane Austen.',
    'Es lo que sienten los progenitores al observar a un vástago levantando su diploma de licenciatura universitaria.',
    'Sentimiento de excesiva vanidad arrogante por uno mismo o de satisfacción feliz tras lograr una meta muy dura.'
  ]),
  pt('p185', 'Culpa', ['la culpa'], [
    'Es un fenómeno propio de la conciencia.',
    'Opera como un mecanismo judicial de la psique diseñado para corregir comportamientos contrarios a nuestro sistema de valores.',
    'Dentro de la nomenclatura del derecho penal y civil, es la atribución de que un sujeto cometió un hecho sancionable.',
    'Su persistencia interior cuando el tiempo pasa desencadena lo que popularmente denominamos como "remordimientos".',
    'Su malestar empuja a las personas nobles a agachar la cabeza y pronunciar frases sinceras de arrepentimiento y disculpa.',
    'Es el agudo dolor ético y la vergüenza que sentimos tras darnos cuenta de que nuestras acciones han provocado daño a alguien.'
  ]),
  pt('p186', 'Sorpresa', ['la sorpresa'], [
    'Es un evento del estado mental.',
    'Se destaca por tener la duración temporal más breve de todo el espectro de afectos de la cognición.',
    'Actúa borrando la actividad del cerebro durante un instante para obligarlo a asimilar un suceso que rompe los esquemas previstos.',
    'Su respuesta somática universal fuerza a los párpados a abrirse desmesuradamente mientras la mandíbula se afloja y cae.',
    'Da su nombre a los regalos inesperados que están envueltos en papel para que nadie adivine su contenido oculto.',
    'Emoción de asombro y sobresalto repentino al encontrarte algo increíble que no te esperabas en absoluto.'
  ]),
  pt('p187', 'Valentía', ['el valor', 'la valentia', 'coraje'], [
    'Es un rasgo de resiliencia humana.',
    'Toda la literatura épica de la historia se ha cimentado sobre figuras legendarias que exhiben esta virtud de forma superlativa.',
    'Su verdadera naturaleza no consiste en la temeridad de ignorar el miedo, sino en la entereza de actuar cargando con él.',
    'Permite mantener el tipo y plantar cara sin acobardarse ante amenazas directas o en situaciones de tremenda adversidad.',
    'Es exactamente el atributo existencial y moral que el famoso León acobardado del Mago de Oz ansiaba obtener a toda costa.',
    'La gran capacidad de mostrar arrojo y coraje para no huir cuando hay un peligro grave acechando.'
  ]),
  pt('p188', 'Aburrimiento', ['el aburrimiento', 'hastio'], [
    'Es una condición de inactividad mental.',
    'Surge inevitablemente cuando el entorno es incapaz de ofrecer estímulos capaces de mantener el umbral mínimo de atención.',
    'Somete a quien lo padece a una percepción subjetiva que hace que cada minuto parezca dilatarse agónicamente en el reloj.',
    'Provoca apatía profunda y un cansancio irreal que se manifiesta mediante reiterados y prolongados bostezos involuntarios.',
    'Es el enemigo principal de los niños de viaje, que suelen exclamar con frecuencia que se están muriendo de esto.',
    'Sensación de letargo, hartazgo y pesadez que notamos al llevar un buen rato sin poder hacer nada interesante o divertido.'
  ]),
  pt('p189', 'Curiosidad', ['la curiosidad'], [
    'Es una tendencia instintiva muy productiva.',
    'Ha servido como la principal bujía de ignición de todos los descubrimientos y expediciones científicas de los humanos.',
    'El proceso de crecimiento en la etapa infantil depende enteramente de este insaciable apetito por explorar y comprender.',
    'Es el impulso incontrolable que nos invita a mirar por la rendija de las cerraduras o a desmontar los aparatos mecánicos.',
    'En los clásicos proverbios de advertencia se dice en tono siniestro que esta fue la responsable de aniquilar al gato.',
    'Las ganas constantes de averiguar cotilleos, saber cómo funcionan las cosas y aprender lo que está oculto.'
  ]),
  pt('p190', 'Gratitud', ['el agradecimiento', 'la gratitud'], [
    'Es un sentimiento de valoración prosocial.',
    'Funciona de manera óptima como un cohesionador de vínculos cívicos, fomentando círculos de favores y de empatía mutua.',
    'Despierta tras tomar conciencia plena de que una persona externa se ha sacrificado y nos ha entregado su tiempo o esfuerzo.',
    'Se manifiesta devolviendo el gesto, obsequiando o expresando de viva voz un sincero "muchísimas gracias".',
    'Da nombre en inglés a la festividad de otoño en los Estados Unidos donde las familias norteamericanas se reúnen a trinchar un pavo.',
    'El sentimiento de afecto y deuda moral que sientes cuando quieres devolverle a alguien la ayuda y el apoyo que te dio.'
  ]),

  // =========================================================================
  // 10. ALIMENTOS Y ELEMENTOS BÁSICOS (p191 - p200)
  // =========================================================================
  pt('p191', 'Hamburguesa', ['la hamburguesa', 'burger'], [
    'Es una elaboración de alta popularidad.',
    'La estandarización industrial de su receta la convirtió en el estandarte culinario estadounidense del siglo pasado.',
    'Etimológicamente, su nombre hace referencia a una dinámica e histórica ciudad de la costa septentrional alemana.',
    'Consiste en someter un disco cárnico prensado y especiado al calor intenso de una plancha metálica caliente.',
    'Se introduce entre dos partes de un panecillo tierno circular y suele coronarse con queso fundido y rodajas de tomate y lechuga.',
    'La reina de la comida rápida, acompañada casi siempre por patatas fritas y salsa kétchup.'
  ]),
  pt('p192', 'Queso', ['el queso'], [
    'Es una preparación de larga conservación.',
    'Nació de la necesidad de los pastores nómadas antiguos de preservar la frescura de un líquido perecedero.',
    'Para que la receta tenga éxito, requiere desencadenar un proceso de coagulación añadiendo la enzima del cuajo.',
    'Se elabora y prensa en moldes cilíndricos que se almacenan celosamente en oscuras bodegas para madurarlos.',
    'Es de color amarillo o blanco, se derrite en la pizza y huele de forma muy peculiar.',
    'Alimento graso derivado estrictamente de la leche de animales como vacas, ovejas o cabras.'
  ]),
  pt('p193', 'Manzana', ['la manzana', 'manzanas'], [
    'Es una parte del desarrollo botánico.',
    'Se extrae tradicionalmente de árboles de hoja caduca que pueblan grandes vergeles en climas muy templados.',
    'En la teología bíblica ha quedado asociada en la memoria visual colectiva como el fatídico "fruto prohibido" del jardín del Edén.',
    'En los cuentos centroeuropeos tradicionales, un disfrazado personaje oscuro envenena una de color rojo para entregarla a Blancanieves.',
    'Se fermenta en Asturias para obtener una bebida alcohólica local y es el famoso logotipo que identifica a los dispositivos iPhone.',
    'Fruta de contorno redondo, crujiente por dentro y de piel roja o verde, con un diminuto rabito en la zona superior.'
  ]),
  pt('p194', 'Plátano', ['platano', 'banana', 'el platano'], [
    'Es un recurso alimenticio muy energético.',
    'Prolifera de manera explosiva y casi exclusiva en archipiélagos y llanuras con alto nivel de humedad y clima tropical.',
    'Crece agrupado colgando de inmensas piñas amontonadas y no se almacena en el frigorífico para evitar que ennegrezca.',
    'Los médicos y deportistas de élite recomiendan fervientemente su ingesta debido a los altísimos niveles de potasio que contiene.',
    'Su piel exterior protectora muda de color desde un verde intenso hacia el amarillo brillante antes de llenarse de motas marrones.',
    'Fruta carnosa de forma muy alargada y algo curvada que puede pelarse fácilmente tirando con las manos de su cáscara.'
  ]),
  pt('p195', 'Arroz', ['el arroz'], [
    'Es un cultivo de ciclo agrícola esencial.',
    'El método clásico y óptimo para asegurar su maduración implica sumergir y ahogar amplias parcelas agrarias en balsas de agua.',
    'Según estudios demográficos, es el sustento calórico básico e inamovible de más de la mitad de todos los seres humanos.',
    'Su estado seco es duro, pero gana una tremenda textura blanda e hidratada si se hierve durante varios minutos en cacerolas.',
    'Es el soporte indiscutible e insustituible sobre el que la gastronomía nipona apoya sus diferentes preparaciones de sushi crudo.',
    'Cereal de granitos de color blanco pequeñísimos indispensable para cocinar un risotto italiano o una auténtica paella valenciana.'
  ]),
  pt('p196', 'Miel', ['la miel'], [
    'Es una materia espesa de propiedades notables.',
    'Constituye uno de los poquísimos alimentos conocidos por la humanidad que es científicamente incapaz de pudrirse o caducar con los siglos.',
    'Es una solución que no es elaborada por el hombre, sino que requiere una recolección pautada y cuidadosa mediante un traje de malla.',
    'Se extrae abriendo y limpiando marcos extraídos de cientos de diminutas celdas hexagonales construidas en paneles de cera pura.',
    'Cualquier relato infantil o serie de dibujos animados establece que esta es la perdición y golosina absoluta de los osos del bosque.',
    'Sustancia extremadamente dulce, muy pegajosa y de intenso tono dorado que es secretada artificialmente por las abejas.'
  ]),
  pt('p197', 'Té', ['el te'], [
    'Es un preparado líquido de inmensa trascendencia histórica.',
    'Provocó revoluciones comerciales y dio origen a incidentes y motines portuarios que desembocaron en la independencia norteamericana.',
    'Sus variedades como blanco, rojo o verde no provienen de especies diferentes, sino del nivel de oxidación de las mismas hojas.',
    'En los hogares burgueses japoneses, se somete su polvo matcha a una solemne, rigurosa y silenciosa ceremonia tradicional.',
    'Las normas de la alta sociedad del Reino Unido determinan con precisión y rigor que debe beberse exactamente a las cinco de la tarde.',
    'Bebida aromática ligeramente estimulante que se elabora reposando hojas vegetales deshidratadas y secas en una tetera con agua hirviendo.'
  ]),
  pt('p198', 'Sal', ['la sal'], [
    'Es un compuesto de interés fundamental.',
    'Ejerció un papel económico tan crucial en la Edad Antigua que los legionarios romanos recibían sus honorarios mensuales pagados con ella.',
    'Es originaria de la minería de depósitos rocosos fosilizados o del secado metódico y de evaporación forzosa en humedales costeros.',
    'Químicamente está estructurada por la perfecta combinación a nivel atómico de elementos de cloro y de iones de sodio.',
    'Pese a ser vital y potenciar las recetas de los chefs, los cardiólogos alertan reiteradamente de que abusa de ella eleva mucho la tensión arterial.',
    'Mineral culinario granulado de aspecto totalmente blanco y sabor salado que utilizamos en los platos para que la comida no esté sosa.'
  ]),
  pt('p199', 'Azúcar', ['el azucar', 'azucar'], [
    'Es un ingrediente cristalino soluble.',
    'Su explotación histórica provocó la colonización brutal de multitud de islas y naciones cálidas mediante regímenes de trabajo esclavista.',
    'En su proceso final se aísla tanto del espeso jugo triturado de cañas tropicales como de las enormes raíces blanquecinas de la remolacha.',
    'Actúa biológicamente engañando al cerebro con una descarga química adictiva, pero sus excesos colapsan por completo la insulina del cuerpo.',
    'Los recetarios de repostería casera, pasteleros y creadores de tartas no podrían hornear dulces ni bollos sin derramar enormes tazas de ella.',
    'Polvo compuesto por diminutos cristalitos muy dulces y de color puramente blanco que se echan directamente sobre el café para quitarle el amargor.'
  ]),
  pt('p200', 'Huevo', ['huevos', 'el huevo'], [
    'Es un receptáculo orgánico y biológico.',
    'Guarda encapsulados absolutamente todos los nutrientes vitales y proteínas necesarias para permitir una división embrionaria celular acelerada.',
    'Dispone de una cubierta esférica o apaisada forjada asombrosamente en materiales porosos y sumamente frágiles de carbonato cálcico.',
    'En la cocina se fractura contra el borde del plato revelando un contenido transparente o clara, y una densa mancha amarilla llamada yema.',
    'Constituye el paso previo y el aglutinante viscoso indispensable con el que se logra cuajar la sartén para obtener una esponjosa tortilla de patatas.',
    'Alimento popular crudo que es puesto repetidamente a diario en los nidos de las aves y las granjas de gallinas cluecas.'
  ])
];