import { pt } from './helper.js';

export const PARTE_2 = [
  // =========================================================================
  // 1. OBJETOS, HERRAMIENTAS E INSTALACIONES (p101 - p110)
  // =========================================================================
  pt('p101', 'Ordenador', ['computadora', 'pc', 'computador'], [
    'Es una creación artificial.',
    'Se encuentra presente en casi cualquier entorno laboral contemporáneo.',
    'Consta de módulos físicos combinados con instrucciones lógicas internas.',
    'Su funcionamiento interno se basa en el tratamiento secuencial de impulsos binarios.',
    'Suele requerir periféricos auxiliares como teclado, pantalla y puntero o ratón.',
    'Máquina electrónica digital que procesa datos, ejecuta programas y permite navegar por internet.'
  ]),
  pt('p102', 'Cama', ['la cama'], [
    'Es un elemento manufacturado.',
    'Ocupa un lugar asignado de forma fija en interiores.',
    'Está concebido para soportar peso corporal en posición horizontal estática.',
    'Se recubre con diferentes piezas textiles en función de la estación del año.',
    'Cuenta con una base rígida, un soporte acolchado y una pieza para apoyar la nuca.',
    'Mueble con colchón y almohada sobre el que nos tumbamos a dormir cada noche.'
  ]),
  pt('p103', 'Martillo', ['el martillo'], [
    'Es una herramienta manual.',
    'Su diseño básico apenas ha variado desde la Edad de los Metales.',
    'Consta de una sección longitudinal de agarre y un bloque de gran densidad en el extremo.',
    'Aprovecha el principio de la inercia para concentrar un impacto seco sobre un punto.',
    'En labores manuales actúa golpeando espigas metálicas o piezas de sujeción.',
    'Herramienta de mango con cabeza de hierro que sirve para golpear y clavar clavos.'
  ]),
  pt('p104', 'Libro', ['los libros', 'el libro'], [
    'Es un soporte material de comunicación.',
    'Ha evolucionado a través de diferentes materias primas a lo largo de los siglos.',
    'Se compone de múltiples láminas delgadas unidas ordenadamente por uno de sus bordes.',
    'Contiene información codificada mediante símbolos gráficos para su interpretación secuencial.',
    'Posee cubiertas protectoras, lomo y páginas numeradas organizadas en capítulos.',
    'Conjunto de hojas de papel impresas encuadernadas que forman una obra para leer.'
  ]),
  pt('p105', 'Ascensor', ['elevador', 'el ascensor'], [
    'Es una instalación mecánica.',
    'Se ubica en el interior o fachada de construcciones arquitectónicas.',
    'Opera mediante cables de tracción, contrapesos o sistemas de presión hidráulica.',
    'Permite el traslado vertical de personas y cargas a través de un hueco cerrado.',
    'Dispone de una cabina con botonera para seleccionar el nivel o rellano deseado.',
    'Cabina móvil que sube y baja entre los diferentes pisos de un edificio pulsando un botón.'
  ]),
  pt('p106', 'Microondas', ['horno microondas', 'el microondas'], [
    'Es un artefacto técnico cerrado.',
    'Su descubrimiento práctico ocurrió a mediados del siglo XX de forma accidental.',
    'Funciona emitiendo ondas electromagnéticas que hacen vibrar moléculas de agua.',
    'No admite la introducción de envases metálicos o láminas de aluminio en su interior.',
    'Tiene un plato circular giratorio en la base y una rueda o panel con temporizador en minutos.',
    'Electrodoméstico de cocina que calienta comida y líquidos rápidamente mediante radiación.'
  ]),
  pt('p107', 'Peine', ['el peine', 'cepillo del pelo'], [
    'Es un utensilio de aseo personal.',
    'Se fabrica comúnmente en plástico, madera, concha o metal.',
    'Posee una hilera continua de púas paralelas fijadas a un mismo soporte.',
    'Se pasa con la mano mediante pasadas repetidas sobre el cuerpo.',
    'Se utiliza frente al espejo para desenredar y ordenar las fibras de la cabeza.',
    'Utensilio alargado con púas que sirve para desenredar y peinarse el pelo.'
  ]),
  pt('p108', 'Puerta', ['las puertas', 'la puerta'], [
    'Es un elemento arquitectónico.',
    'Permite separar o comunicar dos espacios físicos contiguos.',
    'Se apoya en un marco fijo mediante bisagras laterales o rieles deslizantes.',
    'Dispone a menudo de herrajes como manillas, pomos, mirillas o cerrojos.',
    'Se empuja, se tira de ella o se desliza para entrar o salir de una estancia.',
    'Estructura de madera o metal con cerradura que se abre y cierra para acceder a un lugar.'
  ]),
  pt('p109', 'Ventana', ['las ventanas', 'la ventana'], [
    'Forma parte de la envolvente de un edificio.',
    'Se coloca integrada en las paredes o muros exteriores de una estancia.',
    'Permite el paso selectivo de luz natural hacia el interior sin dejar entrar la intemperie.',
    'Dispone de un marco con hojas practicables, correderas o abatibles.',
    'Lleva paneles transparentes de vidrio que se pueden cubrir con cortinas o persianas.',
    'Abertura acristalada en la pared que se abre para ventilar y mirar a la calle.'
  ]),
  pt('p110', 'Vela', ['velas', 'la vela', 'cirio'], [
    'Es una fuente portátil de energía.',
    'Fabricada a base de materias grasas, parafinas o ceras sólidas.',
    'Contiene una mecha de fibra vegetal trenzada que recorre su eje longitudinal.',
    'Se consume lentamente desprendiendo una pequeña llama luminosa y cera derretida.',
    'Se coloca sobre candelabros en apagones o sobre pasteles de cumpleaños para soplarla.',
    'Cilindro de cera con una mecha que se enciende con fuego para iluminar o pedir deseos.'
  ]),

  // =========================================================================
  // 2. ACCESORIOS, OBJETOS PERSONALES E INSTRUMENTOS (p111 - p120)
  // =========================================================================
  pt('p111', 'Mochila', ['la mochila', 'morral'], [
    'Es un complemento de transporte.',
    'Elaborado con telas resistentes, lona o materiales sintéticos.',
    'Permite trasladar pertenencias dejando ambas manos totalmente libres.',
    'Se sostiene sobre el cuerpo mediante dos correas ajustables que cruzan los hombros.',
    'Cuenta con cremalleras, bolsillos laterales y un compartimento para libros o portátiles.',
    'Bolsa con correas que se cuelga a la espalda y usan los estudiantes para llevar el material escolar.'
  ]),
  pt('p112', 'Cuchara', ['la cuchara'], [
    'Es un utensilio de uso manual.',
    'Presente en mesas y hogares de casi todas las culturas.',
    'Se compone de un mango recto unido a un extremo redondeado.',
    'El extremo funcional presenta una concavidad para recoger y retener sustancias.',
    'Forma parte de la cubertería clásica junto al tenedor y al cuchillo.',
    'Pieza de cubertería cóncava que se utiliza para comer sopas, caldos y postres líquidos.'
  ]),
  pt('p113', 'Termómetro', ['el termometro'], [
    'Es un aparato de registro científico.',
    'Se basa en la dilatación física de materiales o en la variación de resistencia eléctrica.',
    'Muestra lecturas expresadas numéricamente en escalas como Celsius o Fahrenheit.',
    'Históricamente contenía una fina columna de mercurio líquido plateado en su interior.',
    'Se coloca bajo la axila, en la boca o en la frente para comprobar la temperatura corporal.',
    'Instrumento médico que sirve para medir la temperatura y saber si alguien tiene fiebre.'
  ]),
  pt('p114', 'Anillo', ['los anillos', 'el anillo', 'sortija'], [
    'Es un accesorio corporal ornamental.',
    'Fabricado tradicionalmente con metales maleables como plata, oro o platino.',
    'Presenta una silueta circular hueca adaptada a la anatomía de las extremidades.',
    'Puede llevar engarzadas piedras preciosas o inscripciones conmemorativas en su cara interna.',
    'Se intercambia tradicionalmente en ceremonias nupciales como símbolo de compromiso.',
    'Aro metálico que se lleva puesto en los dedos de la mano como adorno o alianza de boda.'
  ]),
  pt('p115', 'Maleta', ['las maletas', 'la maleta', 'valija'], [
    'Es un contenedor móvil.',
    'Diseñado para resguardar objetos durante trayectos y desplazamientos.',
    'Tiene forma de prisma rectangular con paredes rígidas o de tela reforzada.',
    'Suele incorporar un asa extensible telescópica y ruedas en la base para arrastrarla.',
    'Se factura en aeropuertos antes de volar o se guarda en el maletero del coche.',
    'Bulto con ruedas y asa que se utiliza para transportar la ropa cuando se viaja.'
  ]),
  pt('p116', 'Violín', ['el violin'], [
    'Es un instrumento musical de origen clásico.',
    'Se construye artesanalmente con maderas nobles seleccionadas.',
    'Carece de divisiones o trastes en su diapasón, exigiendo afinación milimétrica de oído.',
    'Consta de cuatro cuerdas afinadas por intervalos de quintas.',
    'Se sostiene entre la mandíbula y el hombro frotando las cuerdas con un arco de crines.',
    'Instrumento musical de cuerda frotada que se toca con un arco apoyado bajo la barbilla.'
  ]),
  pt('p117', 'Piano', ['el piano'], [
    'Es una pieza instrumental de grandes dimensiones.',
    'Mecánicamente pertenece a la familia de cuerda percutida.',
    'Contiene en su interior macillos de fieltro que impactan contra cuerdas tensadas.',
    'Dispone de pedales inferiores para sostener o amortiguar la resonancia del sonido.',
    'Consta de un teclado de ochenta y ocho piezas con teclas blancas y negras alternadas.',
    'Gran instrumento musical con teclado de 88 teclas blancas y negras que se toca sentado.'
  ]),
  pt('p118', 'Trompeta', ['la trompeta'], [
    'Es un instrumento musical metálico.',
    'Pertenece a la familia de viento-metal.',
    'El sonido se origina al hacer vibrar los labios contra una boquilla circular cóncava.',
    'Consta de un tubo largo de latón doblado sobre sí mismo que termina en una campana ancha.',
    'Modifica las notas musicales mediante el accionamiento de únicamente tres pistones o válvulas.',
    'Instrumento brillante de metal con tres pistones que emite un sonido agudo al soplar.'
  ]),
  pt('p119', 'Batería', ['la bateria', 'bateria musical'], [
    'Es un conjunto musical complejo.',
    'Reúne varios instrumentos diferenciados montados sobre herrajes metálicos.',
    'Es la pieza indispensable para marcar el compás y el ritmo en formaciones de rock y jazz.',
    'El intérprete se sienta sobre un sillín coordinando manos y pies simultáneamente.',
    'Consta de tambores como la caja y toms, platos metálicos y un pedal de bombo.',
    'Instrumento de percusión con tambores, platillos y baquetas que marca el ritmo en un grupo.'
  ]),
  pt('p120', 'Moneda', ['las monedas', 'la moneda'], [
    'Es un objeto estandarizado emitido por una autoridad.',
    'Está elaborado con aleaciones metálicas resistentes al desgaste continuado.',
    'Lleva grabados motivos conmemorativos, efigies y un valor cuantitativo de cambio.',
    'La disciplina encargada de su catalogación y coleccionismo se llama numismática.',
    'Tiene dos caras planas llamadas cara y cruz que se lanzan al aire para sortear.',
    'Pieza metálica redonda y plana que sirve como dinero físico de curso legal.'
  ]),

  // =========================================================================
  // 3. TRANSPORTE Y VÍAS (p121 - p130)
  // =========================================================================
  pt('p121', 'Tren', ['el tren', 'ferrocarril'], [
    'Es un sistema de transporte masivo.',
    'Surgió durante la Revolución Industrial como símbolo del progreso técnico.',
    'Se desplaza de forma obligatoria y guiada a lo largo de carriles metálicos paralelos.',
    'Consta de una unidad motriz o locomotora acoplada a una hilera sucesiva de vagones.',
    'Los modelos de alta velocidad circulan a más de trescientos kilómetros por hora entre estaciones.',
    'Vehículo ferroviario compuesto por una locomotora y vagones que circula sobre raíles.'
  ]),
  pt('p122', 'Coche', ['automovil', 'auto', 'el coche', 'carro'], [
    'Es un medio de transporte terrestre motorizado.',
    'Revolucionó el desplazamiento individual a lo largo del siglo XX.',
    'Funciona mediante propulsión térmica de combustión o motores eléctricos.',
    'Dispone de un habitáculo cerrado con asientos, pedales de aceleración y un volante para guiarlo.',
    'Circula sobre cuatro ruedas con neumáticos de goma por calles, carreteras y autopistas.',
    'Vehículo a motor de cuatro ruedas con volante que se utiliza a diario para viajar por carretera.'
  ]),
  pt('p123', 'Barco', ['los barcos', 'el barco', 'embarcacion'], [
    'Es un medio de locomoción acuático.',
    'Existe desde las etapas más remotas de la civilización humana.',
    'Se sostiene a flote sobre la superficie marina siguiendo el principio de Arquímedes.',
    'Tiene una parte delantera llamada proa y una trasera llamada popa.',
    'Lleva un timón para cambiar de rumbo y un ancla pesada para quedarse fijado en el puerto.',
    'Vehículo flotante con casco diseñado para navegar sobre el agua del mar o de ríos.'
  ]),
  pt('p124', 'Helicóptero', ['el helicoptero'], [
    'Es una aeronave a motor.',
    'Fue diseñada conceptualmente en bocetos renacentistas antes de lograrse en el siglo XX.',
    'No precisa de pistas de rodadura largas para ganar velocidad y despegar.',
    'Obtiene su sustentación mediante alas giratorias móviles llamadas palas de rotor.',
    'Puede quedarse suspendido quieto en el aire y despegar o aterrizar en vertical.',
    'Aeronave con grandes hélices giratorias en el techo que vuela y aterriza en vertical.'
  ]),
  pt('p125', 'Cohete', ['el cohete', 'cohete espacial'], [
    'Es un artefacto de propulsión mecánica.',
    'Su funcionamiento práctico se fundamenta en la ley física de acción y reacción.',
    'Genera empuje expulsando gases ardientes a gran velocidad por sus toberas inferiores.',
    'Lleva su propio oxidante o comburente para operar sin oxígeno atmosférico.',
    'Es el único vehículo humano capaz de romper la gravedad y viajar al espacio exterior.',
    'Aparato alargado cilíndrico de gran potencia que despega en vertical hacia el espacio.'
  ]),
  pt('p126', 'Globo aerostático', ['globo aerostatico', 'el globo aerostatico'], [
    'Es un aparato de vuelo.',
    'Los hermanos Montgolfier lograron la primera ascensión tripulada en el siglo XVIII.',
    'Asciende en el aire aprovechando que el gas caliente es menos denso que el aire frío.',
    'Consta de una inmensa bolsa de tela resistente conectada a quemadores de gas propano.',
    'Los pasajeros viajan de pie al aire libre dentro de una cesta o barquilla de mimbre suspendida.',
    'Bolsa gigante de tela llena de aire caliente con una cesta de mimbre para viajar flotando en el cielo.'
  ]),
  pt('p127', 'Satélite artificial', ['satelite', 'el satelite'], [
    'Es un dispositivo tecnológico orbital.',
    'El primero fue puesto en órbita en 1957 por la Unión Soviética bajo el nombre de Sputnik.',
    'Se mantiene en caída libre orbital continua fuera de la atmósfera terrestre.',
    'Dispone de paneles solares fotovoltaicos orientables para recargar sus baterías.',
    'Permite las emisiones de televisión, la predicción del clima y la navegación GPS.',
    'Aparato lanzado al espacio que orbita alrededor de la Tierra para emitir señales y telecomunicaciones.'
  ]),
  pt('p128', 'Puente', ['los puentes', 'el puente'], [
    'Es una obra de ingeniería civil.',
    'Construida desde la Antigüedad con piedra, hormigón armado o tirantes de acero.',
    'Permite salvar un obstáculo natural como un río, un barranco o una bahía marítima.',
    'Sostiene una calzada por la que circulan vehículos o peatones en su parte superior.',
    'Puede tener diseño de arco, sustentarse sobre pilares o estar suspendido por cables.',
    'Construcción que cruza por encima de un río o abismo para permitir pasar al otro lado.'
  ]),
  pt('p129', 'Semáforo', ['el semaforo', 'los semaforos'], [
    'Es un dispositivo vial señalizador.',
    'Se instala en cruces transitados y pasos peatonales urbanos.',
    'Funciona mediante secuencias lumínicas automáticas reguladas por tiempos.',
    'Emite tres colores universales que indican parada, precaución o autorización.',
    'El verde autoriza el paso, el ámbar avisa y el rojo obliga a detenerse por completo.',
    'Poste con luces de colores roja, amarilla y verde que regula el tráfico en la calle.'
  ]),
  pt('p130', 'Ducha', ['la ducha', 'regadera'], [
    'Es una instalación de saneamiento.',
    'Se sitúa dentro del cuarto de baño de las viviendas.',
    'Consta de un plato inferior impermeable y un sumidero con desagüe.',
    'Proyecta chorros de agua sobre la cabeza a través de una alcachofa perforada.',
    'Permite el aseo corporal diario de pie detrás de una mampara o cortina protectora.',
    'Instalación del baño donde cae agua en forma de lluvia fina sobre el cuerpo para lavarse.'
  ]),

  // =========================================================================
  // 4. CIUDADES DEL MUNDO (p131 - p140)
  // =========================================================================
  pt('p131', 'Berlín', ['berlin'], [
    'Es una capital del continente europeo.',
    'Está bañada por las aguas del río Spree.',
    'Quedó partida en sectores ideológicos antagónicos tras un conflicto bélico.',
    'Conserva la monumental Puerta de Brandeburgo y el edificio del Reichstag.',
    'Un telón de hormigón armado dividió su trazado hasta su derribo en noviembre de 1989.',
    'Capital de Alemania famosa por su histórico muro divisorio.'
  ]),
  pt('p132', 'Moscú', ['moscu', 'moscow'], [
    'Es un gran núcleo metropolitano.',
    'Se ubica en la franja oriental de Europa.',
    'Fue el centro neurálgico de mando de la desaparecida Unión Soviética.',
    'Su red de transporte subterráneo es célebre por sus estaciones decoradas como palacios.',
    'Alberga en su centro la gran Plaza Roja y la fortaleza amurallada del Kremlin.',
    'Capital de Rusia coronada por las cúpulas de colores de San Basilio.'
  ]),
  pt('p133', 'Sídney', ['sydney', 'sidney'], [
    'Es una urbe costera.',
    'Situada en el hemisferio sur frente a una gran bahía.',
    'Aunque es la más poblada y famosa de su nación, no ostenta la capitalidad oficial.',
    'Cuenta con un emblemático puente metálico de un solo arco en su puerto.',
    'Alberga un vanguardista auditorio con tejados curvados que parecen velas o conchas marinas.',
    'La ciudad más famosa de Australia, donde se ubica el edificio de la Ópera de Sídney.'
  ]),
  pt('p134', 'Buenos Aires', ['caba', 'capital federal'], [
    'Es una metrópolis costera sudamericana.',
    'Se asienta junto al ancho estuario del Río de la Plata.',
    'Sus habitantes locales reciben el gentilicio coloquial de porteños.',
    'Es la cuna indiscutible de un género musical y baile melancólico llamado tango.',
    'Tiene un gran Obelisco blanco en la Avenida 9 de Julio y el barrio de La Boca.',
    'Capital de Argentina, tierra del tango y de la Casa Rosada.'
  ]),
  pt('p135', 'El Cairo', ['cairo', 'el cairo'], [
    'Es una aglomeración urbana africana.',
    'Está atravesada de sur a norte por el caudal del río Nilo.',
    'Es la urbe más poblada de todo el mundo árabe.',
    'Cuenta con el histórico y laberíntico mercado tradicional de Jan el-Jalili.',
    'En sus afueras inmediatas se divisan en el horizonte tres gigantescas pirámides.',
    'Capital de Egipto situada a orillas del Nilo junto a la meseta de Guiza.'
  ]),
  pt('p136', 'Pekín', ['beijing', 'pekin'], [
    'Es un centro de poder asiático.',
    'Ha ejercido la sede de gobierno imperial durante varias dinastías.',
    'Albergó los Juegos Olímpicos de verano en 2008 en el estadio Nido de Pájaro.',
    'Cuenta con la inmensa plaza monumental de Tiananmén.',
    'Alberga en su corazón amurallado el complejo palaciego de la Ciudad Prohibida.',
    'Capital de la República Popular China.'
  ]),
  pt('p137', 'Atenas', ['athenas'], [
    'Es un asentamiento milenario.',
    'Ubicado en el sur del continente europeo.',
    'Es considerada la cuna de la filosofía clásica, el teatro y la democracia.',
    'Albergó en 1896 la primera edición de los Juegos Olímpicos modernos.',
    'Sobre una colina rocosa se alza la Acrópolis con las columnas del Partenón.',
    'Capital de Grecia, hogar del Partenón.'
  ]),
  pt('p138', 'Ámsterdam', ['amsterdam'], [
    'Es una localidad europea.',
    'Creció en torno a una presa sobre el curso del río Amstel.',
    'Posee un trazado caracterizado por canales concéntricos en semicírculo.',
    'La bicicleta es el medio de transporte predominante entre sus habitantes.',
    'Alberga museos de Van Gogh, el Rijksmuseum y el Barrio Rojo.',
    'Capital de los Países Bajos famosa por sus canales, puentes y bicicletas.'
  ]),
  pt('p139', 'La Habana', ['habana'], [
    'Es una ciudad portuaria caribeña.',
    'Fue una plaza estratégica comercial entre España y América durante siglos.',
    'En sus calles circulan coloridos coches clásicos estadounidenses de los años 50.',
    'Cuenta con un emblemático paseo marítimo de varios kilómetros llamado el Malecón.',
    'Alberga el edificio del Capitolio y plazas históricas como la de la Revolución.',
    'Capital de Cuba.'
  ]),
  pt('p140', 'Estambul', ['istanbul'], [
    'Es una urbe bicontinental.',
    'Ha sido conocida históricamente como Bizancio y Constantinopla.',
    'Está dividida en dos orillas por el estrecho marítimo del Bósforo.',
    'Fue la capital sucesiva del Imperio Romano de Oriente y del Imperio Otomano.',
    'Alberga templos majestuosos como Santa Sofía y la Mezquita Azul.',
    'La ciudad más grande y famosa de Turquía que une Europa y Asia.'
  ]),

  // =========================================================================
  // 5. MONUMENTOS Y MARAVILLAS NATURALES (p141 - p150)
  // =========================================================================
  pt('p141', 'Cataratas del Niágara', ['cataratas del niagara', 'niagara'], [
    'Es un accidente geográfico hídrico.',
    'Marca una frontera internacional entre dos países norteamericanos.',
    'Separa los territorios de la provincia de Ontario y el estado de Nueva York.',
    'Produce un estruendoso caudal de caída que genera abundante energía hidroeléctrica.',
    'Los visitantes contemplan su caída navegando en barcos con impermeables como el Maid of the Mist.',
    'Famosas y caudalosas cataratas situadas en la frontera entre Canadá y Estados Unidos.'
  ]),
  pt('p142', 'Gran Cañón', ['gran canon', 'gran canon del colorado'], [
    'Es una formación del relieve geológico.',
    'Se localiza en el suroeste de los Estados Unidos, en Arizona.',
    'Ha sido esculpida a lo largo de millones de años por la erosión de un río.',
    'Expone estratos rocosos de tonos ocres y rojizos de gran profundidad.',
    'El río que serpentea por su fondo desgastando la roca es el Colorado.',
    'Inmensa y profunda garganta natural rojiza excavada por el río Colorado.'
  ]),
  pt('p143', 'Machu Picchu', ['machupicchu'], [
    'Es un enclave arqueológico en altura.',
    'Está emplazado a más de dos mil cuatrocientos metros de altitud en los Andes.',
    'Permaneció oculto al conocimiento occidental hasta su redescubrimiento en 1911.',
    'Sus muros de piedra fueron tallados y encajados a la perfección sin emplear mortero.',
    'Tiene terrazas de cultivo verdes y la montaña Huayna Picchu al fondo.',
    'Famosa ciudadela de piedra de la civilización inca situada en lo alto de Perú.'
  ]),
  pt('p144', 'Torre de Pisa', ['torre inclinada de pisa', 'torre inclinada'], [
    'Es un monumento arquitectónico exento.',
    'Comenzó a levantarse en el siglo XII como campanario de una catedral.',
    'Se asienta sobre un terreno arcilloso poco estable que cedió durante las obras.',
    'Tiene planta circular con galerías exteriores de arcos de mármol blanco.',
    'Es famosa mundialmente porque su estructura presenta una llamativa inclinación lateral.',
    'Famosa torre campanario de mármol de Italia conocida por estar torcida e inclinada.'
  ]),
  pt('p145', 'Coliseo romano', ['el coliseo', 'coliseo'], [
    'Es un monumento de la Antigüedad clásica.',
    'Fue levantado en el siglo I bajo la dinastía imperial Flavia.',
    'Tenía capacidad para albergar a más de cincuenta mil espectadores.',
    'Acogía combates a muerte entre fieras salvajes y hombres armados.',
    'Los gladiadores luchaban sobre la arena ante el emperador en su interior.',
    'El gran anfiteatro romano de piedra situado en Roma donde luchaban los gladiadores.'
  ]),
  pt('p146', 'Gran Muralla China', ['muralla china'], [
    'Es una monumental obra defensiva.',
    'Se extiende a lo largo de crestas montañosas en el norte de Asia.',
    'Fue levantada y reconstruida a lo largo de diversas dinastías imperiales.',
    'Tenía como objetivo contener las incursiones de tribus nómadas del norte.',
    'Cuenta con miles de kilómetros de longitud protegidos por torres de vigilancia de piedra.',
    'Mítica y gigantesca fortificación de piedra que cruza el norte de China.'
  ]),
  pt('p147', 'Estatua de la Libertad', ['la estatua de la libertad'], [
    'Es una colosal escultura exenta.',
    'Fue entregada a finales del siglo XIX como regalo de una nación europea a otra.',
    'Está recubierta exteriormente por finas placas de cobre con pátina verdosa.',
    'Lleva una corona de siete rayos, sostiene una tabla de leyes y pisa cadenas rotas.',
    'Sostiene una antorcha dorada alzada con la mano derecha en la bahía de Nueva York.',
    'Monumento con antorcha que da la bienvenida a los barcos en la bahía de Nueva York.'
  ]),
  pt('p148', 'Taj Mahal', ['el taj mahal'], [
    'Es un complejo funerario monumental.',
    'Fue mandado construir en el siglo XVII por el emperador mogol Shah Jahan.',
    'Fue levantado como homenaje de amor eterno a su esposa favorita fallecida.',
    'Está edificado enteramente en mármol blanco con incrustaciones de piedras semipreciosas.',
    'Cuenta con cuatro estilizados minaretes y una gran cúpula reflejada en un estanque.',
    'Espectacular mausoleo de mármol blanco situado en Agra, la joya de la India.'
  ]),
  pt('p149', 'Río Amazonas', ['el amazonas', 'rio amazonas', 'amazonas'], [
    'Es un curso de agua natural.',
    'Nace en las altas cumbres de la cordillera de los Andes.',
    'Desemboca en el océano Atlántico vertiendo una quinta parte del agua fluvial del mundo.',
    'Atraviesa de oeste a este la mayor selva tropical húmeda del planeta.',
    'Es el curso fluvial más largo y con mayor caudal de la Tierra.',
    'El río más caudaloso y largo del mundo que cruza la selva de Sudamérica.'
  ]),
  pt('p150', 'Desierto del Sahara', ['sahara', 'el sahara'], [
    'Es una inmensa región natural.',
    'Ocupa la mayor parte de la mitad norte del continente africano.',
    'Presenta una extensión comparable a la superficie de los Estados Unidos o China.',
    'Está dominado por llanuras pedregosas y mares de dunas onduladas por el viento.',
    'Los nómadas y tuaregs lo cruzan tradicionalmente montados en camellos.',
    'El desierto cálido más grande del mundo, situado en el norte de África.'
  ]),

  // =========================================================================
  // 6. PERSONAJES HISTÓRICOS Y CIENTÍFICOS (p151 - p160)
  // =========================================================================
  pt('p151', 'Charles Darwin', ['darwin'], [
    'Es un científico del siglo XIX.',
    'Nació en las islas británicas y estudió ciencias naturales.',
    'Realizó una célebre expedición de cinco años alrededor del mundo en el barco HMS Beagle.',
    'Estudió las diferencias de picos en los pinzones de las islas Galápagos.',
    'Publicó en 1859 su trascendental obra El origen de las especies.',
    'Naturalista británico que formuló la Teoría de la Evolución por selección natural.'
  ]),
  pt('p152', 'Ludwig van Beethoven', ['beethoven'], [
    'Es una figura cumbre de la música europea.',
    'Nació en Bonn a finales del siglo XVIII y residió en Viena.',
    'Representa la transición entre el Clasicismo y el Romanticismo musical.',
    'Sufrió una sordera progresiva que no le impidió seguir componiendo obras maestras.',
    'Su Novena Sinfonía culmina con los coros del Himno a la Alegría.',
    'Genio de la música clásica que compuso sordo la Novena Sinfonía.'
  ]),
  pt('p153', 'Wolfgang Amadeus Mozart', ['mozart'], [
    'Es un compositor clásico del pasado.',
    'Nació en la ciudad austriaca de Salzburgo a mediados del siglo XVIII.',
    'Fue un asombroso niño prodigio que tocaba y componía piezas ante reyes con cinco años.',
    'Autor de óperas universales como Las bodas de Fígaro y Don Giovanni.',
    'Murió a los 35 años dejando inacabada su célebre misa de difuntos Réquiem.',
    'Genio precoz de la música clásica autor de La flauta mágica.'
  ]),
  pt('p154', 'Isaac Newton', ['newton'], [
    'Es una figura fundacional de la física moderna.',
    'Vivió en Inglaterra entre los siglos XVII y XVIII.',
    'Formuló las tres leyes fundamentales de la dinámica del movimiento.',
    'Descompuso la luz blanca en los colores del arcoíris mediante un prisma.',
    'La anécdota popular dice que una manzana cayó de un árbol haciéndole pensar en la gravedad.',
    'Científico británico que descubrió la Ley de la Gravitación Universal.'
  ]),
  pt('p155', 'Stephen Hawking', ['hawking'], [
    'Es un físico teórico contemporáneo.',
    'Nació en Oxford y fue diagnosticado de ELA en su juventud.',
    'Desafió los pronósticos médicos viviendo décadas casi completamente paralizado.',
    'Describió teóricamente la emisión de radiación térmica en los agujeros negros.',
    'Se comunicaba con un sintetizador de voz y escribió Breve historia del tiempo.',
    'Famoso físico británico en silla de ruedas que investigó los agujeros negros.'
  ]),
  pt('p156', 'Nelson Mandela', ['mandela', 'madiba'], [
    'Es un líder político del siglo XX.',
    'Nació en el sur del continente africano y era conocido como Madiba.',
    'Luchó pacíficamente contra el régimen de discriminación racial del apartheid.',
    'Pasó veintisiete años encarcelado en una pequeña celda de Robben Island.',
    'Recibió el Premio Nobel de la Paz y se convirtió en presidente de su país en 1994.',
    'Líder sudafricano que derrotó el apartheid tras casi tres décadas en prisión.'
  ]),
  pt('p157', 'Mahatma Gandhi', ['gandhi'], [
    'Es una personalidad histórica del siglo XX.',
    'Desarrolló su labor en el continente asiático.',
    'Lideró la oposición pacífica frente al dominio colonial británico.',
    'Popularizó métodos de protesta basados en la no violencia y la Marcha de la Sal.',
    'Vestía una túnica tradicional hilada a mano y ayunaba como método de presión.',
    'Líder pacifista indio que logró la independencia de la India sin usar armas.'
  ]),
  pt('p158', 'Cristóbal Colón', ['colon'], [
    'Es un navegante del siglo XV.',
    'La tesis mayoritaria sitúa su nacimiento en la república de Génova.',
    'Buscaba una ruta comercial hacia las Indias orientales navegando hacia el oeste.',
    'Obtuvo la financiación de los Reyes Católicos partiendo con tres carabelas.',
    'Desembarcó en la isla de Guanahaní el 12 de octubre de 1492 creyendo estar en Asia.',
    'Navegante que al servicio de la corona española descubrió el continente americano.'
  ]),
  pt('p159', 'Julio César', ['cesar'], [
    'Es un líder militar y político de la Antigüedad.',
    'Vivió en el siglo I antes de Cristo.',
    'Conquistó la Galia y cruzó en desafío el río Rubicón pronunciando alea iacta est.',
    'Fue nombrado dictador vitalicio acumulando el poder supremo del Estado.',
    'Fue asesinado a puñaladas por senadores en los idus de marzo en el senado.',
    'Famoso general y dictador romano que conquistó la Galia y fue traicionado por Bruto.'
  ]),
  pt('p160', 'Alejandro Magno', ['alejandro el grande'], [
    'Es un legendario conquistador de la Antigüedad.',
    'Hijo del rey Filipo II, fue educado de joven por el filósofo Aristóteles.',
    'Montaba a su mítico caballo Bucéfalo al frente de sus falanges invencibles.',
    'Derrotó al poderoso Imperio persa del rey Darío III en batallas como Issos.',
    'Creó un inmenso imperio que llegó hasta las fronteras de la India antes de morir a los 32 años.',
    'Joven rey de Macedonia que conquistó el Imperio persa y fundó Alejandría.'
  ]),

  // =========================================================================
  // 7. CULTURA, DEPORTE Y FICCIÓN (p161 - p170)
  // =========================================================================
  pt('p161', 'Rafael Nadal', ['nadal', 'rafa nadal'], [
    'Es un deportista profesional español.',
    'Nació en las Islas Baleares y fue entrenado por su tío Toni.',
    'Compite como jugador zurdo aunque es naturalmente diestro.',
    'Formó el histórico Big Three junto a Roger Federer y Novak Djokovic.',
    'Ganó veintidós títulos de Grand Slam, catorce de ellos en Roland Garros.',
    'Tenista español histórico apodado el Rey de la Tierra Batida.'
  ]),
  pt('p162', 'Michael Jordan', ['jordan', 'air jordan'], [
    'Es un atleta legendario estadounidense.',
    'Revolucionó el deporte profesional en las décadas de 1980 y 1990.',
    'Llevaba el dorsal número 23 y destacaba por sus vuelos acrobáticos hacia el aro.',
    'Lideró a los Chicago Bulls para conquistar seis campeonatos en dos tandas.',
    'Creó una icónica línea de zapatillas con su silueta suspendida en el aire.',
    'Considerado el mejor jugador de baloncesto de la historia, estrella de los Chicago Bulls.'
  ]),
  pt('p163', 'Pelé', ['edson arantes do nascimento', 'pele'], [
    'Es una leyenda histórica del deporte.',
    'Nació en Brasil en 1940 bajo el nombre de Edson Arantes do Nascimento.',
    'Debutó como adolescente deslumbrante en un torneo mundial con solo 17 años.',
    'Vistió el dorsal 10 de la canarinha y jugó casi toda su carrera en el Santos.',
    'Es el único futbolista de la historia que ha ganado tres Copas del Mundo.',
    'Astro del fútbol brasileño apodado O Rei, campeón de tres Mundiales.'
  ]),
  pt('p164', 'Freddie Mercury', ['mercury', 'queen'], [
    'Es un cantante y compositor del siglo XX.',
    'Nació en la isla de Zanzíbar y creció en la Inglaterra de los años sesenta.',
    'Poseía un portentoso registro vocal de cuatro octavas y carisma teatral en el escenario.',
    'Lideró al piano la legendaria banda británica de rock Queen.',
    'Compuso himnos como Bohemian Rhapsody, We Are the Champions y Don\'t Stop Me Now.',
    'Carismático vocalista y líder de la banda de rock Queen.'
  ]),
  pt('p165', 'Vincent van Gogh', ['van gogh'], [
    'Es un artista plástico del siglo XIX.',
    'Nació en los Países Bajos y desarrolló su etapa madura en el sur de Francia.',
    'Utilizaba pinceladas gruesas, empastadas y colores amarillos y azules muy vivos.',
    'Apenas vendió un cuadro en vida y mantuvo correspondencia con su hermano Theo.',
    'En un ataque de locura se cortó una oreja y pintó obras como La noche estrellada.',
    'Pintor postimpresionista neerlandés que pintó Los girasoles y se cortó la oreja.'
  ]),
  pt('p166', 'Walt Disney', ['disney'], [
    'Es un pionero de la industria del entretenimiento.',
    'Comenzó creando cortometrajes de animación dibujados a mano en los años 20.',
    'Estrenó en 1937 el primer largometraje animado sonoro en color con Blancanieves.',
    'Ostenta el récord histórico absoluto de haber ganado veintidós premios Óscar.',
    'Creó un ratón de dibujos llamado Mickey Mouse y fundó parques temáticos.',
    'Creador de Mickey Mouse y fundador del mayor imperio cinematográfico de animación.'
  ]),
  pt('p167', 'Neil Armstrong', ['armstrong'], [
    'Es un aviador y explorador del siglo XX.',
    'Fue piloto de pruebas antes de ingresar en el cuerpo de astronautas.',
    'Comandó la misión Apolo 11 en julio del año 1969.',
    'Bajó por la escalerilla del módulo Eagle posando su bota sobre polvo lunar.',
    'Pronunció la frase de "un pequeño paso para el hombre, un gran salto para la humanidad".',
    'El primer astronauta de la historia que pisó la Luna.'
  ]),
  pt('p168', 'J.K. Rowling', ['rowling'], [
    'Es una escritora británica contemporánea.',
    'Ideó su historia más célebre mientras viajaba en un tren retrasado hacia Londres.',
    'Escribió los primeros capítulos en cafeterías de Edimburgo mientras criaba a su hija sola.',
    'Creó un universo mágico centrado en un colegio castillo llamado Hogwarts.',
    'Es la creadora literaria del joven aprendiz de mago con cicatriz de rayo.',
    'Autora británica que escribió la saga de novelas de Harry Potter.'
  ]),
  pt('p169', 'Miguel de Cervantes', ['cervantes'], [
    'Es la máxima figura de las letras españolas.',
    'Luchó en la batalla naval de Lepanto en 1571 donde perdió la movilidad de un brazo.',
    'Estuvo preso durante cinco años por corsarios berberiscos en Argel.',
    'Escribió novelas ejemplares, entremeses y obras teatrales en el Siglo de Oro.',
    'Creó la historia de un hidalgo enloquecido por leer libros de caballerías.',
    'Escritor español apodado el Manco de Lepanto, autor de Don Quijote de la Mancha.'
  ]),
  pt('p170', 'Don Quijote de la Mancha', ['don quijote', 'el quijote'], [
    'Es un personaje ficticio de la literatura clásica.',
    'Perdió el juicio de tanto leer novelas de aventuras y caballeros andantes.',
    'Decidió armarse caballero con una armadura vieja y un caballo flaco llamado Rocinante.',
    'Iba acompañado por su leal y glotón escudero campesino Sancho Panza.',
    'Confundió gigantes con molinos de viento contra los que arremetió con su lanza.',
    'Hidalgo loco protagonista de la gran novela de Cervantes que luchaba contra molinos.'
  ]),

  // =========================================================================
  // 8. ANIMALES VARIADOS (p171 - p180)
  // =========================================================================
  pt('p171', 'Águila', ['aguilas', 'el aguila'], [
    'Es una criatura con plumas.',
    'Pertenece al grupo de las aves de presa rapaces diurnas.',
    'Posee una vista prodigiosa capaz de detectar presas a más de dos kilómetros.',
    'Construye nidos de ramas en altos riscos rocosos inaccesibles.',
    'Tiene un pico curvado afilado y garras ganchudas para cazar conejos o peces.',
    'Gran ave rapaz de mirada penetrante y garras afiladas, símbolo del poder imperial.'
  ]),
  pt('p172', 'Búho', ['buhos', 'el buho', 'lechuza'], [
    'Es una rapaz con alas.',
    'Desarrolla su actividad de caza casi exclusivamente durante la noche.',
    'Sus plumas aterciopeladas le permiten volar en el más absoluto silencio.',
    'Tiene dos ojos frontales gigantescos y puede girar el cuello doscientos setenta grados.',
    'Muchas especies tienen dos penachos de plumas en la cabeza que parecen orejas.',
    'Ave rapaz nocturna con grandes ojos redondos que ulula en la noche.'
  ]),
  pt('p173', 'Pulpo', ['el pulpo', 'pulpos'], [
    'Es un invertebrado que vive bajo el agua.',
    'Pertenece a la clase de los moluscos cefalópodos marinos.',
    'Carece por completo de huesos o concha y posee tres corazones con sangre azul.',
    'Puede cambiar de color de piel para camuflarse y expulsa una nube de tinta para huir.',
    'Tiene un cuerpo blando con cabeza redonda y ocho brazos provistos de ventosas.',
    'Molusco marino inteligente con ocho tentáculos y ventosas que expulsa tinta.'
  ]),
  pt('p174', 'Koala', ['los koalas', 'el koala'], [
    'Es un mamífero terrestre.',
    'Es un animal marsupial endémico exclusivo de Australia.',
    'Pasa prácticamente toda su existencia viviendo en las ramas altas de los árboles.',
    'Se alimenta casi exclusivamente de hojas duras de eucalipto.',
    'Duerme entre dieciocho y veintidós horas diarias debido a su lenta digestión.',
    'Marsupial australiano de pelo gris y orejas peludas que come hojas de eucalipto.'
  ]),
  pt('p175', 'Abeja', ['abejas', 'la abeja'], [
    'Es un animal invertebrado volador.',
    'Pertenece a la clase de los insectos himenópteros.',
    'Vive en colonias muy organizadas con obreras, zánganos y una reina fértil.',
    'Cumple una función vital transportando polen de flor en flor en la naturaleza.',
    'Fabrica celdas hexagonales de cera y defiende su nido clavando un aguijón.',
    'Insecto volador con franjas amarillas y negras que poliniza flores y produce miel.'
  ]),
  pt('p176', 'Cocodrilo', ['cocodrilos', 'el cocodrilo'], [
    'Es un reptil de gran tamaño.',
    'Lleva habitando humedales y ríos tropicales desde la época de los dinosaurios.',
    'Posee una piel acorazada protegida por duras placas escamosas.',
    'Permanece inmóvil semisumergido con solo los ojos y las fosas nasales asomando.',
    'Tiene una cola potente para nadar y una mandíbula alargada con dientes afilados.',
    'Gran reptil carnívoro de piel rugosa y enormes mandíbulas que acecha en ríos.'
  ]),
  pt('p177', 'Gorila', ['gorilas', 'el gorila'], [
    'Es un mamífero vertebrado.',
    'Es el primate de mayor tamaño y musculatura de todo el planeta.',
    'Habita en selvas nubosas y tropicales del centro de África.',
    'Las manadas familiares están lideradas por un macho dominante de espalda plateada.',
    'Se desplaza apoyando los nudillos de las manos y se golpea el pecho en desafío.',
    'El primate más grande y fuerte del mundo, que vive en las selvas de África.'
  ]),
  pt('p178', 'Cebra', ['cebras', 'la cebra'], [
    'Es un mamífero herbívoro de cuatro patas.',
    'Está emparentada biológicamente de cerca con el caballo y el asno.',
    'Habita en manadas en las sabanas abiertas y pastizales de África.',
    'Tiene que cruzar ríos esquivando cocodrilos durante sus migraciones anuales.',
    'Su cuerpo luce un inconfundible patrón de rayas verticales blancas y negras.',
    'Animal africano de la familia del caballo famoso por sus rayas blancas y negras.'
  ]),
  pt('p179', 'Oso panda', ['el panda', 'oso panda', 'panda'], [
    'Es un gran mamífero.',
    'Pertenece a la familia de los úrsidos y es nativo de las montañas de China.',
    'Es pacífico y pasa casi doce horas al día sentado comiendo sin descanso.',
    'Su dieta se compone casi al cien por cien de tallos y hojas de bambú.',
    'Su cuerpo es blanco con las orejas, los hombros y las patas completamente negras.',
    'Oso blanco y negro de China que se alimenta casi exclusivamente de bambú.'
  ]),
  pt('p180', 'Medusa', ['medusas', 'la medusa'], [
    'Es una criatura marina primitiva.',
    'Su cuerpo está formado en más de un noventa y cinco por ciento por agua.',
    'Carece de cerebro, corazón y huesos; flota dejándose llevar por las corrientes.',
    'Tiene forma de paraguas o campana gelatinosa casi transparente.',
    'Lleva largos tentáculos colgantes con células urticantes que provocan quemaduras.',
    'Animal marino gelatinoso y transparente con tentáculos que pican a los bañistas.'
  ]),

  // =========================================================================
  // 9. EMOCIONES, ACTITUDES Y VIRTUDES (p181 - p190)
  // =========================================================================
  pt('p181', 'Tristeza', ['la tristeza', 'pena'], [
    'Es un estado emocional primario.',
    'Aparece habitualmente como respuesta a una pérdida, decepción o duelo.',
    'Reduce temporalmente los niveles de energía y la actividad de la persona.',
    'Empuja a la búsqueda de consuelo, introspección y apoyo en los demás.',
    'Su manifestación física más visible y desahogante es el llanto con lágrimas.',
    'Emoción de pena y dolor anímico contraria a la alegría que nos hace llorar.'
  ]),
  pt('p182', 'Celos', ['los celos'], [
    'Es una emoción interpersonal compleja.',
    'Nace del temor a que alguien querido prefiera a otra persona.',
    'Provoca desconfianza, conductas de vigilancia y necesidad de control.',
    'Aparece con frecuencia en la pareja sentimental o entre hermanos por atención.',
    'Shakespeare la definió en su tragedia Otelo como el monstruo de ojos verdes.',
    'Sentimiento de desconfianza y miedo a perder el cariño de la pareja frente a otro.'
  ]),
  pt('p183', 'Soledad', ['la soledad'], [
    'Es una circunstancia física o interior.',
    'Algunos creadores la buscan voluntariamente para reflexionar o trabajar.',
    'Cuando se impone sin desearla se convierte en una fuente dolorosa de malestar.',
    'Describe la falta de compañía y la ausencia de contacto con otras personas.',
    'Aparece en el célebre título de la novela Cien años de... de García Márquez.',
    'Estado o sentimiento de estar solo sin la compañía de nadie alrededor.'
  ]),
  pt('p184', 'Orgullo', ['el orgullo'], [
    'Es una emoción de doble vertiente.',
    'En su lado negativo es la soberbia y la incapacidad de admitir errores.',
    'En su vertiente sana es la satisfacción por un logro obtenido con esfuerzo.',
    'Es lo que siente una familia al ver a un hijo alcanzar una meta difícil.',
    'Acompaña a la palabra prejuicio en el título de una famosa novela de Jane Austen.',
    'Sentimiento de satisfacción personal por un logro o vanidad arrogante.'
  ]),
  pt('p185', 'Culpa', ['la culpa'], [
    'Es una vivencia moral interna.',
    'Surge tras percibir que se ha cometido una acción contraria a la propia ética.',
    'En el derecho penal es necesaria para imputar una responsabilidad legal.',
    'Provoca un continuo malestar llamado remordimiento de conciencia.',
    'Impulsa a confesar lo sucedido, pedir disculpas o reparar el daño.',
    'Sentimiento de remordimiento que se siente tras saber que has hecho algo malo.'
  ]),
  pt('p186', 'Sorpresa', ['la sorpresa'], [
    'Es una emoción súbita y fugaz.',
    'Dura apenas unos segundos antes de transformarse en alegría o miedo.',
    'Se desencadena ante un acontecimiento totalmente inesperado o imprevisto.',
    'Hace que los ojos se abran desmesuradamente y la boca tome forma de O.',
    'Es lo que se busca al organizar una fiesta secreta donde todos se esconden.',
    'Reacción de asombro repentino que experimentamos ante algo que no esperábamos.'
  ]),
  pt('p187', 'Valentía', ['el valor', 'la valentia', 'coraje'], [
    'Es una cualidad humana admirable.',
    'No significa no sentir miedo, sino actuar a pesar de tenerlo.',
    'Ha sido ensalzada en mitos heroicos y relatos de caballería de todas las culturas.',
    'Permite afrontar peligros, adversidades o injusticias sin retroceder.',
    'En El Mago de Oz es la virtud que el león cobarde busca desesperadamente.',
    'Cualidad de tener coraje y valor para afrontar peligros o situaciones difíciles.'
  ]),
  pt('p188', 'Aburrimiento', ['el aburrimiento', 'hastio'], [
    'Es una sensación anímica.',
    'Surge ante la falta de estímulos novedosos o actividades atractivas.',
    'Hace que el tiempo parezca transcurrir a una lentitud desesperante.',
    'Suele provocar bostezos repetidos, apatía y mirar continuamente el reloj.',
    'Empuja a la mente a buscar entretenimiento para salir de la monotonía.',
    'Sensación de desgana y cansancio que sentimos cuando no tenemos nada que hacer.'
  ]),
  pt('p189', 'Curiosidad', ['la curiosidad'], [
    'Es un impulso cognitivo natural.',
    'Estimula el aprendizaje en niños y la investigación en los científicos.',
    'Consiste en el deseo continuo de indagar, averiguar y saber más sobre algo.',
    'Un refrán popular advierte en tono de broma que fue lo que mató al gato.',
    'Es el motor que lleva a hacer preguntas o a abrir puertas secretas.',
    'Deseo e interés por enterarse o aprender cosas nuevas y desconocidas.'
  ]),
  pt('p190', 'Gratitud', ['el agradecimiento', 'la gratitud'], [
    'Es una actitud ética positiva.',
    'Nace al reconocer un beneficio, ayuda o favor recibido de otra persona.',
    'Fortalece los vínculos afectivos y la empatía en la convivencia social.',
    'Se manifiesta diciendo de corazón la palabra gracias a quien te ha ayudado.',
    'Tiene una conocida fiesta festiva con pavo en Estados Unidos llamada Acción de Gracias.',
    'Sentimiento de agradecimiento hacia alguien que ha hecho algo bueno por ti.'
  ]),

  // =========================================================================
  // 10. ALIMENTOS Y ELEMENTOS BÁSICOS (p191 - p200)
  // =========================================================================
  pt('p191', 'Hamburguesa', ['la hamburguesa', 'burger'], [
    'Es un preparado alimenticio rápido.',
    'Toma su nombre de una ciudad portuaria del norte de Alemania.',
    'La pieza central es un disco de carne picada cocinado a la plancha.',
    'Se encaja en el interior de un panecillo redondo tierno con sésamo.',
    'Suele llevar lonchas de queso fundido, lechuga, tomate y patatas fritas.',
    'Sándwich redondo de carne picada a la plancha entre dos panes con queso.'
  ]),
  pt('p192', 'Queso', ['el queso'], [
    'Es un alimento sólido elaborado.',
    'Se obtiene a partir de la coagulación y fermentación de la leche.',
    'Puede elaborarse con leche de vaca, oveja, cabra o búfala.',
    'Pasa por procesos de salado, prensado y maduración en cámaras.',
    'Se derrite sobre pizzas y es el manjar favorito de los ratones de dibujos.',
    'Alimento lácteo derivado de la leche cuajada que madura en cuñas o piezas.'
  ]),
  pt('p193', 'Manzana', ['la manzana', 'manzanas'], [
    'Es un fruto comestible vegetal.',
    'Crece en las ramas de árboles caducifolios en climas templados.',
    'En el relato bíblico se representa como el fruto prohibido del Edén.',
    'En el cuento de Blancanieves la bruja le ofrece una envenenada.',
    'Es la materia prima con la que se hace sidra y el logo mordido de Apple.',
    'Fruta redonda y crujiente que puede ser roja o verde con un rabito arriba.'
  ]),
  pt('p194', 'Plátano', ['platano', 'banana', 'el platano'], [
    'Es un fruto de origen tropical.',
    'Crece en grandes racimos colgantes en una hierba gigante.',
    'Es muy apreciado por los deportistas por su aporte de energía y potasio.',
    'Su pulpa es tierna y blanquecina y su piel cambia de verde a amarillo.',
    'Tiene forma alargada curvada y es el alimento favorito de los monos.',
    'Fruta amarilla alargada y curvada rica en potasio que se pela con la mano.'
  ]),
  pt('p195', 'Arroz', ['el arroz'], [
    'Es un cereal vegetal.',
    'Se cultiva en campos artificialmente inundados de agua llamados arrozales.',
    'Es el alimento básico diario para más de la mitad de la población mundial.',
    'Sus granos son pequeños y duros y se ablandan al hervirlos en caldo.',
    'Es el ingrediente protagonista de la paella valenciana y del sushi.',
    'Cereal de pequeños granos blancos que se hierve para hacer paella o sushi.'
  ]),
  pt('p196', 'Miel', ['la miel'], [
    'Es un alimento viscoso natural.',
    'Es uno de los pocos productos que prácticamente nunca caduca.',
    'Se almacena en el interior de celdas hexagonales de cera en panales.',
    'La recolectan los apicultores protegidos con trajes de careta.',
    'Es el alimento favorito del oso animado Winnie the Pooh.',
    'Sustancia dulce y dorada que fabrican las abejas en sus colmenas.'
  ]),
  pt('p197', 'Té', ['el te'], [
    'Es una bebida consumida globalmente.',
    'Se obtiene exclusivamente por infusión de hojas de Camellia sinensis.',
    'Puede clasificarse en verde, negro, rojo o blanco según su oxidación.',
    'Tiene una solemne ceremonia tradicional en Japón con polvo matcha.',
    'En el Reino Unido es tradición tomarlo caliente a las cinco de la tarde con leche.',
    'Infusión caliente de hojas secas que los británicos toman a las cinco de la tarde.'
  ]),
  pt('p198', 'Sal', ['la sal'], [
    'Es un mineral cristalino comestible.',
    'Químicamente está compuesto por cloruro de sodio (NaCl).',
    'Se extrae en minas de roca o evaporando agua de mar en salinas.',
    'Fue utilizada en la Antigüedad como moneda de pago, dando origen a la palabra salario.',
    'Se guarda en un salero y es el condimento básico para dar sabor a la comida.',
    'Condimento mineral blanco que se echa a la comida para que no esté sosa.'
  ]),
  pt('p199', 'Azúcar', ['el azucar', 'azucar'], [
    'Es una sustancia soluble cristalina.',
    'Se extrae industrialmente de la remolacha o de la caña.',
    'Es el compuesto químico responsable de activar el sabor dulce en la lengua.',
    'Se presenta en pequeños granos blancos o morenos y endulza cafés y postres.',
    'Su consumo excesivo provoca caries dentales y problemas de diabetes.',
    'Sustancia blanca y granulada que se echa al café o a los postres para endulzar.'
  ]),
  pt('p200', 'Huevo', ['huevos', 'el huevo'], [
    'Es un cuerpo orgánico ovíparo.',
    'Contiene en su interior los nutrientes para el desarrollo de un embrión.',
    'Está recubierto exteriormente por una cáscara frágil de carbonato cálcico.',
    'Consta en su interior de una parte transparente viscosa llamada clara y un núcleo amarillo.',
    'El núcleo amarillo es la yema y se come frito, cocido o en tortilla.',
    'Alimento ovalado con cáscara que ponen las gallinas con yema y clara.'
  ])
];