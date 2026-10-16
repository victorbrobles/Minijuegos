import { pt } from './helper.js';

export const PARTE_1 = [
  // --- OBJETOS Y UTENSILIOS (p1 - p10) ---
  pt('p1', 'Frigorífico', ['nevera', 'refrigerador'], [
    'Es un objeto artificial.',
    'Suele encontrarse en interiores cerrados.',
    'Requiere conexión continua a una fuente de energía.',
    'Modifica de forma constante el ambiente de su interior.',
    'Se sitúa en la cocina y tiene bandejas con una puerta vertical.',
    'Electrodoméstico que mantiene fríos y frescos los alimentos.'
  ]),
  pt('p2', 'Paraguas', ['sombrilla'], [
    'Es un objeto portátil.',
    'Está fabricado con una combinación de piezas rígidas y flexibles.',
    'Su empleo depende de factores atmosféricos.',
    'Dispone de un mecanismo manual o automático de varillas desplegables.',
    'Tiene un mango para sostenerlo y una cúpula de tela sobre la cabeza.',
    'Se abre para evitar mojarse cuando caen precipitaciones de lluvia.'
  ]),
  pt('p3', 'Espejo', ['espejos'], [
    'Es un elemento sólido.',
    'Posee una superficie plana muy pulida.',
    'Guarda una relación directa con el comportamiento de la luz.',
    'Se suele colocar en paredes y puertas de armarios.',
    'Se empaña con el vapor de agua y refleja lo que tiene delante.',
    'Superficie de cristal que muestra el reflejo idéntico de tu imagen.'
  ]),
  pt('p4', 'Cafetera', ['cafetera italiana', 'cafetera express'], [
    'Es un utensilio de uso diario.',
    'Funciona aplicando calor o presión a un líquido.',
    'Se ubica en espacios de preparación de bebidas.',
    'Procesa granos triturados de origen vegetal desprendiendo vapor.',
    'Prepara una bebida oscura caliente y aromática con cafeína.',
    'Aparato que sirve específicamente para elaborar café.'
  ]),
  pt('p5', 'Gafas', ['lentes', 'anteojos'], [
    'Es un artículo ligero.',
    'Diseñado para colocarse directamente sobre el cuerpo humano.',
    'Tiene piezas transparentes montadas sobre una montura.',
    'Se apoya en las orejas y en el puente de la nariz.',
    'Puede tener cristales oscuros para el sol o lentes graduadas.',
    'Accesorio con dos cristales que ayuda a corregir problemas de visión.'
  ]),
  pt('p6', 'Tijeras', ['las tijeras'], [
    'Es una herramienta manual.',
    'Consta de dos piezas metálicas móviles cruzadas.',
    'Mecánicamente funciona mediante el principio de palancas.',
    'Tiene dos orificios en un extremo para colocar los dedos.',
    'Las usan sastres, peluqueros y escolares para separar materiales.',
    'Herramienta con dos hojas afiladas que corta al juntar los dedos.'
  ]),
  pt('p7', 'Cepillo de dientes', ['el cepillo de dientes'], [
    'Es un utensilio de uso privado.',
    'Tiene una estructura alargada y compacta.',
    'Se guarda normalmente cerca de un grifo en el aseo.',
    'Se acompaña de una pasta o crema aromática para frotar.',
    'Posee un cabezal con cerdas finas para la higiene bucal.',
    'Objeto con mango y cerdas que sirve para lavarse los dientes.'
  ]),
  pt('p8', 'Sartén', ['la sarten'], [
    'Es un recipiente resistente.',
    'Está elaborado con materiales metálicos conductores.',
    'Se utiliza directamente sobre fuentes de calor elevadas.',
    'Tiene una base circular plana y un mango largo lateral.',
    'Cuenta con una capa antiadherente para cocinar tortillas o carnes.',
    'Utensilio metálico de cocina con mango que sirve para freír y saltear.'
  ]),
  pt('p9', 'Reloj', ['el reloj', 'relojes'], [
    'Es un instrumento de medición.',
    'Presenta divisiones regulares en su superficie.',
    'Puede ser mecánico, analógico o electrónico.',
    'Muchos modelos emiten una cadencia regular de sonido.',
    'Tiene manecillas numeradas del 1 al 12 o dígitos que marcan minutos.',
    'Aparato que se lleva en la muñeca o se cuelga para saber qué hora es.'
  ]),
  pt('p10', 'Llave', ['las llaves'], [
    'Es una pieza pequeña sólida.',
    'Suele estar fabricada en aleaciones de metal.',
    'Posee estrías y ranuras con un patrón geométrico específico.',
    'Muchos ejemplares se transportan juntos agrupados en un llavero.',
    'Encaja en una ranura específica y se gira para accionar un pestillo.',
    'Pieza metálica dentada que se introduce en una cerradura para abrir puertas.'
  ]),

  // --- CIUDADES Y LUGARES (p11 - p20) ---
  pt('p11', 'París', ['paris'], [
    'Es una entidad geográfica concreta.',
    'Se encuentra en el continente europeo.',
    'Está cruzada por un curso fluvial navegable.',
    'Es conocida internacionalmente como la Ciudad de la Luz.',
    'El río que la baña es el Sena y alberga el Museo del Louvre.',
    'Capital de Francia coronada por la famosa Torre Eiffel.'
  ]),
  pt('p12', 'Tokio', ['tokyo'], [
    'Es un asentamiento urbano.',
    'Se encuentra situado en territorio insular.',
    'Es una de las metrópolis con mayor densidad demográfica del mundo.',
    'Combina rascacielos vanguardistas con el epicentro del manga y el anime.',
    'Tiene el cruce peatonal de Shibuya y se divisa el monte Fuji.',
    'Capital de Japón.'
  ]),
  pt('p13', 'Nueva York', ['new york', 'nyc'], [
    'Es una urbe costera.',
    'Situada en América del Norte.',
    'Está dividida en cinco grandes distritos o distritos metropolitanos.',
    'Es apodada mundialmente con el nombre de La Gran Manzana.',
    'Tiene rascacielos como el Empire State y el parque de Central Park.',
    'Metrópolis estadounidense famosa por Times Square y Wall Street.'
  ]),
  pt('p14', 'Roma', ['roma'], [
    'Es un núcleo urbano milenario.',
    'Su relieve se asienta sobre suaves colinas.',
    'Es apodada históricamente con el título de La Ciudad Eterna.',
    'Alberga en su interior el estado independiente del Vaticano.',
    'Por ella discurre el río Tíber y cuenta con la Fontana di Trevi.',
    'Capital de Italia, donde se encuentra el anfiteatro del Coliseo.'
  ]),
  pt('p15', 'Egipto', ['republica arabe de egipto'], [
    'Es un país soberano.',
    'La mayor parte de su superficie es árida y seca.',
    'Su desarrollo histórico dependió de una gran arteria fluvial.',
    'Sus antiguos monarcas recibían el título de faraones.',
    'El río Nilo lo cruza y sus templos tienen jeroglíficos.',
    'País africano famoso por las pirámides de Guiza y la Esfinge.'
  ]),
  pt('p16', 'Londres', ['london'], [
    'Es una gran capital.',
    'Se ubica en una masa insular europea.',
    'Un río navegable divide su territorio en dos mitades.',
    'En sus calles circulan icónicos autobuses de dos plantas de color rojo.',
    'El río que la cruza es el Támesis y tiene la torre del Big Ben.',
    'Capital de Inglaterra y del Reino Unido.'
  ]),
  pt('p17', 'Madrid', ['villa de madrid'], [
    'Es una población interior.',
    'Situada sobre una meseta a gran altitud.',
    'Su escudo oficial luce un animal junto a un árbol con frutos.',
    'Sus celebraciones populares se realizan en fuentes como Cibeles.',
    'En su centro se halla la Puerta del Sol y el Museo del Prado.',
    'Capital de España.'
  ]),
  pt('p18', 'Brasil', ['brasil'], [
    'Es un país soberano de gran extensión.',
    'Se sitúa en la mitad sur del continente americano.',
    'Su idioma oficial es de origen europeo pero no es el español.',
    'Alberga la mayor parte de la selva y cuenca del río Amazonas.',
    'Es la selección con más Mundiales de fútbol y celebra el carnaval en Río.',
    'El país más grande de América del Sur, cuya lengua es el portugués.'
  ]),
  pt('p19', 'Venecia', ['venezia'], [
    'Es una localidad europea.',
    'Se alza sobre una formación pantanosa costera.',
    'Carece por completo de carreteras y de tráfico de coches.',
    'Sus calles son canales cruzados por puentes de piedra.',
    'Es famosa por sus máscaras de carnaval y la Plaza de San Marcos.',
    'Ciudad italiana donde los turistas pasean en góndolas por los canales.'
  ]),
  pt('p20', 'Monte Everest', ['everest'], [
    'Es un accidente orográfico.',
    'Se sitúa en el continente asiático.',
    'Está permanentemente cubierto de nieve y temperaturas gélidas.',
    'Forma parte de la imponente cordillera del Himalaya.',
    'Supera los ocho mil ochocientos metros de altitud.',
    'La montaña más alta de todo el planeta Tierra.'
  ]),

  // --- PERSONAJES FAMOSOS E HISTÓRICOS (p21 - p30) ---
  pt('p21', 'Albert Einstein', ['einstein'], [
    'Es una figura histórica real.',
    'Vivió a caballo entre los siglos XIX y XX.',
    'Se dedicó al estudio teórico de las leyes físicas.',
    'Fue galardonado con el Premio Nobel de su disciplina.',
    'Formuló la famosa ecuación de masa y energía E = mc².',
    'El físico más famoso del siglo XX, padre de la Teoría de la Relatividad.'
  ]),
  pt('p22', 'Leonardo da Vinci', ['da vinci'], [
    'Es un personaje del pasado.',
    'Nació en el sur del continente europeo.',
    'Es considerado el modelo ideal del hombre del Renacimiento.',
    'Diseñó bocetos de artefactos voladores y dibujó el Hombre de Vitruvio.',
    'Pintó el fresco de La Última Cena en Milán.',
    'Genio renacentista italiano que pintó el cuadro de La Gioconda.'
  ]),
  pt('p23', 'Lionel Messi', ['messi', 'leo messi'], [
    'Es una persona viva en la actualidad.',
    'Nació en América del Sur.',
    'Se dedica profesionalmente al deporte de competición.',
    'Compite como atacante zurdo vistiendo habitualmente el dorsal 10.',
    'Ha ganado ocho Balones de Oro y jugó muchos años en el Barcelona.',
    'Astro del fútbol argentino que ganó el Mundial en Qatar 2022.'
  ]),
  pt('p24', 'William Shakespeare', ['shakespeare'], [
    'Es un creador del mundo literario.',
    'Vivió entre los siglos XVI y XVII en Europa.',
    'Escribió en lengua inglesa dramas, sonetos y comedias.',
    'Muchas de sus obras se estrenaban en el teatro The Globe.',
    'Autor de monólogos célebres como "Ser o no ser" y de Hamlet.',
    'El dramaturgo inglés más famoso de la historia, autor de Romeo y Julieta.'
  ]),
  pt('p25', 'Cleopatra', ['cleopatra vii'], [
    'Es una persona del pasado remoto.',
    'Vivió en el siglo I antes de Cristo.',
    'Gobernó un territorio en el norte de África.',
    'Mantuvo vínculos políticos y sentimentales con Julio César y Marco Antonio.',
    'La tradición clásica vincula su trágico final a una serpiente áspid.',
    'La reina más famosa y poderosa del Antiguo Egipto.'
  ]),
  pt('p26', 'Cristiano Ronaldo', ['cr7'], [
    'Es un deportista profesional en activo.',
    'Nació en un territorio insular europeo.',
    'Destaca por una estricta preparación física y potencia de salto.',
    'Es reconocido internacionalmente por lucir el dorsal 7.',
    'Goleador histórico del Real Madrid con cinco Balones de Oro.',
    'Astro del fútbol portugués apodado CR7 famoso por su grito de "¡Siuuu!".'
  ]),
  pt('p27', 'Marie Curie', ['madame curie'], [
    'Es una figura pionera de la ciencia.',
    'Desarrolló su labor en Europa entre los siglos XIX y XX.',
    'Investigó elementos atómicos con emisiones invisibles de energía.',
    'Fue la primera persona en lograr dos premios Nobel en áreas distintas.',
    'Descubrió junto a su esposo elementos como el polonio y el radio.',
    'Científica de origen polaco pionera en el estudio de la radiactividad.'
  ]),
  pt('p28', 'Napoleón Bonaparte', ['napoleon'], [
    'Es un personaje histórico militar.',
    'Nació en una isla del mar Mediterráneo.',
    'Ascendió al mando tras un proceso revolucionario.',
    'Se proclamó emperador y conquistó gran parte de Europa.',
    'Sufrió una desastrosa retirada en Rusia y cayó en Waterloo.',
    'Emperador militar francés derrotado definitivamente en Waterloo.'
  ]),
  pt('p29', 'Pablo Picasso', ['picasso'], [
    'Es una personalidad del mundo del arte.',
    'Nació en el sur de Europa a finales del siglo XIX.',
    'Rompió con las normas de perspectiva con sus etapas Azul y Rosa.',
    'Fue el fundador y máximo representante del movimiento cubista.',
    'Nació en Málaga y pintó rostros vistos de frente y perfil.',
    'Pintor español malagueño creador del cubismo y autor del Guernica.'
  ]),
  pt('p30', 'Michael Jackson', ['rey del pop'], [
    'Es un artista musical del siglo XX.',
    'Comenzó a actuar ante el público desde su niñez.',
    'Fue coronado por el público como el Rey del Pop.',
    'Publicó en 1982 el álbum más vendido de la historia: Thriller.',
    'Vestía un guante blanco y popularizó el paso de baile moonwalk.',
    'Cantante estadounidense apodado el Rey del Pop, autor de Billie Jean.'
  ]),

  // --- ANIMALES (p31 - p40) ---
  pt('p31', 'León', ['leones', 'el leon'], [
    'Es un organismo vertebrado.',
    'Pertenece al grupo de los mamíferos carnívoros.',
    'Habita en llanuras y sabanas del continente africano.',
    'Vive y caza en manadas donde las hembras capturan las presas.',
    'Los machos adultos poseen una frondosa melena alrededor del cuello.',
    'Gran felino africano conocido tradicionalmente como el rey de la selva.'
  ]),
  pt('p32', 'Delfín', ['delfines', 'el delfin'], [
    'Es una criatura que vive en el agua.',
    'No es un pez; respira aire y amamanta a sus crías.',
    'Utiliza emisiones de sonido y ecos para orientarse bajo el mar.',
    'Es considerado uno de los animales marinos con mayor inteligencia.',
    'Tiene piel lisa gris, aleta dorsal y nada dando saltos acrobáticos.',
    'Mamífero marino inteligente de morro curvado que salta en el agua.'
  ]),
  pt('p33', 'Camaleón', ['camaleones'], [
    'Es un animal de sangre fría.',
    'Pertenece al grupo de los reptiles escamosos.',
    'Habita en ramas de zonas cálidas y tiene cola prensil.',
    'Sus dos ojos pueden moverse en direcciones totalmente independientes.',
    'Caza insectos lanzando una lengua muy larga y pegajosa.',
    'Reptil que cambia de color para camuflarse en su entorno.'
  ]),
  pt('p34', 'Pingüino', ['pinguinos', 'el pinguino'], [
    'Es un animal con plumas.',
    'Pertenece a las aves pero carece de vuelo por el aire.',
    'Habita en aguas frías de regiones del hemisferio sur.',
    'Sus alas funcionan como aletas hidrodinámicas bajo el agua.',
    'Tiene plumaje blanco en el pecho, dorso negro y anda torpemente.',
    'Ave marina que no vuela y vive en las zonas heladas de la Antártida.'
  ]),
  pt('p35', 'Elefante', ['elefantes', 'el elefante'], [
    'Es un mamífero cuadrúpedo.',
    'Su alimentación es estrictamente herbívora.',
    'Es el mayor animal que pisa la tierra firme en la actualidad.',
    'Posee dos orejas gigantescas que abanica y colmillos de marfil.',
    'Cuenta con una memoria prodigiosa y vive en manadas familiares.',
    'El animal terrestre más grande del mundo, dotado de una larga trompa.'
  ]),
  pt('p36', 'Perro', ['el perro', 'can'], [
    'Es un mamífero terrestre.',
    'Fue el primer animal domesticado a partir del lobo.',
    'Posee un sentido del olfato sumamente desarrollado.',
    'Convive en los hogares familiares como animal de compañía.',
    'Mueve la cola al estar contento y avisa emitiendo ladridos.',
    'Mascota doméstica de cuatro patas conocida como el mejor amigo del hombre.'
  ]),
  pt('p37', 'Tiburón', ['tiburon', 'el tiburon'], [
    'Es una criatura marina con branquias.',
    'Su esqueleto no está formado por huesos, sino por cartílago.',
    'Puede detectar disoluciones mínimas de sangre a gran distancia.',
    'Posee varias hileras de dientes afilados que se renuevan solas.',
    'Su aleta triangular asomando sobre el agua asusta en la playa.',
    'Gran pez carnívoro del océano temido por sus dientes como el tiburón blanco.'
  ]),
  pt('p38', 'Caballo', ['el caballo', 'equino'], [
    'Es un mamífero herbívoro de gran porte.',
    'Fue domesticado en las estepas hace miles de años.',
    'Apoya sus patas sobre pezuñas protegidas por herraduras.',
    'Se desplaza cambiando de ritmo entre paso, trote y galope.',
    'Tiene crines en el cuello, se monta con silla y relincha.',
    'Animal de campo y granja que se monta con riendas y galopa.'
  ]),
  pt('p39', 'Serpiente', ['serpientes', 'la serpiente'], [
    'Es un reptil de sangre fría.',
    'Carece por completo de extremidades o patas.',
    'Muda su piel escamosa alargada de una sola pieza.',
    'Saca una lengua bífida dividida en dos puntas para oler el aire.',
    'Se desplaza reptando por el suelo y algunas inoculan veneno.',
    'Reptil alargado sin patas que se arrastra por el suelo y sisea.'
  ]),
  pt('p40', 'Ballena azul', ['la ballena azul'], [
    'Es un habitante permanente del mar.',
    'No es un pez; amamanta a sus crías y respira aire.',
    'No tiene dientes, sino barbas filtradoras con las que come kril.',
    'Expulsa un potente chorro de vapor por su lomo al respirar.',
    'Puede superar los treinta metros de largo y ciento cincuenta toneladas.',
    'El animal más grande que jamás ha existido en la Tierra.'
  ]),

  // --- SENTIMIENTOS Y CONCEPTOS ABSTRACTOS (p41 - p50) ---
  pt('p41', 'Amor', ['el amor'], [
    'Es un concepto intangible.',
    'Ha inspirado obras de arte y poemas a lo largo de la historia.',
    'Se acompaña de una sensación descrita como mariposas en el estómago.',
    'Tiene una festividad internacional el 14 de febrero.',
    'En los mitos clásicos se representa con el arquero Cupido.',
    'Sentimiento de afecto y cariño simbolizado con un corazón rojo.'
  ]),
  pt('p42', 'Miedo', ['el miedo', 'temor'], [
    'Es una emoción primaria.',
    'Presente tanto en seres humanos como en animales.',
    'Cumple una función vital para alertar y huir ante peligros.',
    'Provoca aceleración del pulso, temblor y piel de gallina.',
    'Es la reacción que buscan provocar las películas de terror.',
    'Emoción que sentimos cuando algo nos asusta o estamos en peligro.'
  ]),
  pt('p43', 'Nostalgia', ['la nostalgia'], [
    'Es un estado de ánimo abstracto.',
    'Etimológicamente une la idea de regreso con la de dolor.',
    'Combina una mezcla agridulce entre alegría y pena.',
    'Suele despertarse al escuchar canciones viejas o ver fotos antiguas.',
    'Se asocia con la frase de que cualquier tiempo pasado fue mejor.',
    'Sentimiento de tristeza y añoranza por momentos felices del pasado.'
  ]),
  pt('p44', 'Esperanza', ['la esperanza'], [
    'Es una actitud mental positiva.',
    'Figura como una de las virtudes clásicas tradicionales.',
    'Ayuda a mantener la entereza en momentos de incertidumbre.',
    'Se simboliza habitualmente mediante el color verde.',
    'Un dicho popular asegura que es lo último que se pierde.',
    'Sentimiento de confianza en que algo bueno va a suceder.'
  ]),
  pt('p45', 'Envidia', ['la envidia'], [
    'Es una emoción humana.',
    'Forma parte de la lista de los siete pecados capitales.',
    'Suele considerarse un sentimiento difícil de admitir en público.',
    'Consiste en desear lo que otra persona tiene o sus logros.',
    'Se asocia a menudo con tener los ojos verdes o bilis amarilla.',
    'Sentimiento de disgusto o rabia por el éxito o los bienes ajenos.'
  ]),
  pt('p46', 'Felicidad', ['la felicidad', 'alegria'], [
    'Es un estado emocional.',
    'Muchos pensadores la consideraron la meta de la vida humana.',
    'Se asocia a la vivencia de plenitud, bienestar y satisfacción.',
    'Su reflejo exterior más contagioso y claro es una sonrisa.',
    'Provoca ganas de reír, cantar y celebrar.',
    'Sentimiento de alegría plena, dicha y bienestar con la vida.'
  ]),
  pt('p47', 'Ira', ['la ira', 'rabia', 'enfado'], [
    'Es una reacción emocional vehemente.',
    'Está incluida entre los siete pecados capitales.',
    'Se desata ante una ofensa, engaño o injusticia.',
    'Hace que la persona apriete los puños y los dientes con furia.',
    'Se describe diciendo que hace hervir la sangre o ver todo rojo.',
    'Emoción intensa de furia, rabia y enfado descontrolado.'
  ]),
  pt('p48', 'Vergüenza', ['la verguenza'], [
    'Es una emoción social.',
    'Nace de la percepción de haber cometido una torpeza en público.',
    'Provoca una reacción involuntaria en la que las mejillas enrojecen.',
    'Hace que la persona baje la cabeza y esquive la mirada.',
    'Se expresa con la frase de desear que la tierra te trague.',
    'Emoción de sonrojo e incomodidad que se siente al hacer el ridículo.'
  ]),
  pt('p49', 'Paz', ['la paz'], [
    'Es una condición social.',
    'Describe asimismo un estado de quietud interior.',
    'Tiene un Premio Nobel específico entregado en la ciudad de Oslo.',
    'Se simboliza con una paloma blanca con una rama de olivo en el pico.',
    'Se representa con dos dedos levantados en forma de V.',
    'Situación de calma y tranquilidad donde no hay guerras ni violencia.'
  ]),
  pt('p50', 'Libertad', ['la libertad'], [
    'Es una aspiración filosófica fundamental.',
    'Figura como el primer término del lema republicano de Francia.',
    'Se define como la capacidad de decidir y obrar sin coacciones.',
    'Su privación en una celda es la sanción penitenciaria que impone la ley.',
    'Tiene un gigantesco monumento con antorcha en Nueva York.',
    'Derecho de las personas a actuar según su voluntad sin estar prisioneras.'
  ]),

  // --- EVENTOS HISTÓRICOS Y EFEMÉRIDES (p51 - p60) ---
  pt('p51', 'Llegada a la Luna', ['alunizaje', 'apolo 11'], [
    'Es un acontecimiento histórico moderno.',
    'Se produjo durante la segunda mitad del siglo XX.',
    'Fue la cumbre de una carrera tecnológica entre dos potencias.',
    'La misión espacial responsable se llamó Apolo 11 en 1969.',
    'Neil Armstrong descendió por la escalerilla y pisó suelo gris.',
    'El momento histórico en que el ser humano pisó la superficie lunar.'
  ]),
  pt('p52', 'Hundimiento del Titanic', ['el titanic', 'naufragio del titanic'], [
    'Es un desastre marítimo histórico.',
    'Ocurrió a principios del siglo XX, en abril de 1912.',
    'Sucedió en aguas del océano Atlántico Norte.',
    'Se decía erróneamente que era un barco prácticamente insumergible.',
    'Colisionó en la noche contra un enorme bloque de hielo flotante.',
    'El famoso naufragio del gran barco que chocó contra un iceberg.'
  ]),
  pt('p53', 'Caída del Muro de Berlín', ['muro de berlin', 'caida del muro'], [
    'Es un suceso geopolítico europeo.',
    'Marcó el declive visible de la división de la Guerra Fría.',
    'Una barrera física había dividido una ciudad durante casi tres décadas.',
    'Ocurrió en la noche del 9 de noviembre de 1989.',
    'Miles de ciudadanos comenzaron a derribarlo pacíficamente con picos.',
    'El derribo en 1989 del muro que dividía la capital alemana en dos.'
  ]),
  pt('p54', 'Revolución Francesa', ['la revolucion francesa'], [
    'Es un alzamiento sociopolítico.',
    'Tuvo lugar en Europa occidental a finales del siglo XVIII.',
    'Difundió la consigna de Libertad, Igualdad y Fraternidad.',
    'El hecho detonante fue la toma de la prisión de la Bastilla en 1789.',
    'Puso fin al absolutismo y ejecutó a los reyes en la guillotina.',
    'Levantamiento popular en Francia en 1789 que derrocó la monarquía.'
  ]),
  pt('p55', 'Halloween', ['noche de brujas'], [
    'Es una fecha señalada del calendario.',
    'Posee raíces vinculadas al cambio estacional celta de Samhain.',
    'Se celebra anualmente en la noche del 31 de octubre.',
    'La gente se disfraza con atuendos de monstruos o brujas.',
    'Los niños piden caramelos diciendo "Truco o trato".',
    'Noche de brujas con disfraces de miedo y calabazas iluminadas.'
  ]),
  pt('p56', 'Juegos Olímpicos', ['olimpiadas', 'jjoo'], [
    'Es una cita deportiva internacional.',
    'Nació en la antigua Grecia en honor a los dioses.',
    'Se celebra de forma ordinaria una vez cada cuatro años.',
    'Su logotipo está formado por cinco anillos entrelazados de colores.',
    'Un fuego sagrado viaja en una antorcha hasta encender un pebetero.',
    'La mayor competición deportiva mundial donde se entregan medallas.'
  ]),
  pt('p57', 'Año Nuevo', ['nochevieja', 'ano nuevo'], [
    'Es una festividad cíclica.',
    'Se produce en el paso de un mes a otro en el calendario.',
    'Tiene lugar en la medianoche del 31 de diciembre al 1 de enero.',
    'En España se toman doce uvas siguiendo el ritmo de las campanadas.',
    'Al finalizar la cuenta se brinda con champán o cava festejando.',
    'Celebración de Nochevieja para despedir el año y dar la bienvenida al nuevo.'
  ]),
  pt('p58', 'Primera Guerra Mundial', ['la gran guerra', 'i guerra mundial'], [
    'Es un conflicto bélico de gran escala.',
    'Se conoció durante décadas simplemente como La Gran Guerra.',
    'Comenzó en 1914 tras un magnicidio en Sarajevo.',
    'Los combatientes permanecían atrincherados en zanjas de barro.',
    'Se utilizaron por primera vez tanques y gases tóxicos.',
    'Guerra mundial librada en trincheras en Europa entre 1914 y 1918.'
  ]),
  pt('p59', 'Segunda Guerra Mundial', ['ii guerra mundial'], [
    'Es el conflicto militar más destructivo de la historia.',
    'Comenzó en septiembre de 1939 tras el ataque sobre Polonia.',
    'Enfrentó a los Aliados contra las fuerzas totalitarias del Eje.',
    'Tuvo un gran desembarco en las costas de Normandía el Día D.',
    'Concluyó en 1945 tras el lanzamiento de dos bombas atómicas.',
    'La gran guerra mundial librada entre 1939 y 1945 contra Hitler y el nazismo.'
  ]),
  pt('p60', 'San Valentín', ['dia de san valentin', 'dia de los enamorados'], [
    'Es una jornada festiva recurrente.',
    'Lleva el nombre de un mártir de la época romana.',
    'Tiene fijada su fecha en el calendario cada 14 de febrero.',
    'Es conocida popularmente como el Día de los Enamorados.',
    'Las parejas se regalan bombones, corazones y rosas rojas.',
    'El día de los enamorados que se celebra en pareja el 14 de febrero.'
  ]),

  // --- ALIMENTOS Y BEBIDAS (p61 - p70) ---
  pt('p61', 'Pizza', ['la pizza'], [
    'Es una receta culinaria.',
    'Tiene sus antecedentes históricos en el sur de Italia.',
    'Su base está hecha con una masa de harina fermentada.',
    'Lleva una capa de tomate triturado y queso que se funde al horno.',
    'Suele cortarse en porciones triangulares para comerla con la mano.',
    'Comida italiana redonda al horno con base de masa, tomate y mozzarella.'
  ]),
  pt('p62', 'Chocolate', ['el chocolate'], [
    'Es una sustancia comestible procesada.',
    'Su materia prima se utilizaba en culturas mesoamericanas.',
    'Se elabora a partir de los granos tostados del fruto del cacao.',
    'Contiene teobromina y se presenta en tabletas o bombones.',
    'Puede ser negro puro, con leche o blanco y se derrite al calor.',
    'Delicioso dulce elaborado a partir del cacao que se come en tabletas.'
  ]),
  pt('p63', 'Paella', ['la paella'], [
    'Es un preparado gastronómico tradicional.',
    'Procede de la cuenca mediterránea de la península ibérica.',
    'Toma su nombre del recipiente metálico ancho con dos asas donde se cocina.',
    'Se le añade azafrán para darle su característico tono amarillo.',
    'La costra de grano crujiente que queda en el fondo se llama socarrat.',
    'Plato típico valenciano de arroz amarillo cocinado en sartén con marisco o carne.'
  ]),
  pt('p64', 'Cerveza', ['la cerveza', 'birra', 'cana'], [
    'Es una bebida obtenida por fermentación.',
    'Se consume desde la Antigüedad en civilizaciones como Mesopotamia.',
    'Se elabora empleando agua, cebada malteada y levaduras.',
    'La planta que le proporciona su gusto amargo es el lúpulo.',
    'En los bares de España se suele pedir servida fría de grifo como caña.',
    'Bebida alcohólica dorada elaborada con cebada y lúpulo con espuma blanca.'
  ]),
  pt('p65', 'Helado', ['el helado'], [
    'Es un preparado alimenticio dulce.',
    'Se consume de manera masiva durante los meses más calurosos.',
    'Se elabora batiendo crema, leche y azúcar a temperaturas bajo cero.',
    'Entre sus sabores clásicos destacan el chocolate, la vainilla y la nata.',
    'Se sirve en tarrinas o sobre un cucurucho de barquillo y se derrite al calor.',
    'Postre frío y dulce que se toma en cucurucho de barquillo en verano.'
  ]),
  pt('p66', 'Café', ['el cafe'], [
    'Es una bebida extendida por todo el planeta.',
    'Se obtiene a partir de semillas tostadas de un arbusto tropical.',
    'Posee un sabor amargo y un contrastado efecto estimulante.',
    'Contiene una sustancia alcaloide natural llamada cafeína.',
    'Puede pedirse solo, cortado, con leche o descafeinado.',
    'Bebida caliente negra y amarga que se toma para despertar por las mañanas.'
  ]),
  pt('p67', 'Vino', ['el vino'], [
    'Es una bebida alcohólica de larga historia.',
    'En la mitología clásica estaba consagrada al dios Baco.',
    'Se obtiene a través de la fermentación del mosto de una fruta.',
    'Madura reposando en barricas de madera dentro de bodegas.',
    'Se clasifica por su color en variedades como tinto, blanco o rosado.',
    'Bebida alcohólica elaborada a partir de uvas que puede ser tinta o blanca.'
  ]),
  pt('p68', 'Pan', ['el pan'], [
    'Es un alimento fundamental en la historia humana.',
    'Se elabora mezclando harina molida, agua, sal y levaduras.',
    'La masa reposa para fermentar y se introduce después en un horno.',
    'Posee una corteza exterior tostada y una masa interior blanda llamada miga.',
    'Se adquiere en panaderías en formato de barra para preparar bocadillos.',
    'Alimento básico horneado de harina y levadura con corteza y miga.'
  ]),
  pt('p69', 'Tortilla de patatas', ['tortilla espanola', 'la tortilla'], [
    'Es una elaboración gastronómica de origen ibérico.',
    'Se prepara empleando ingredientes básicos del campo.',
    'Sus componentes indispensables son tubérculos cortados y huevos batidos.',
    'Se cuaja dentro de una sartén circular y exige voltearla con un plato.',
    'Genera debate eterno entre partidarios y detractores de la cebolla.',
    'Famoso plato español de sartén elaborado con patatas y huevo, con o sin cebolla.'
  ]),
  pt('p70', 'Sushi', ['el sushi'], [
    'Es una preparación culinaria de origen oriental.',
    'Procede de las tradiciones gastronómicas de Japón.',
    'Tiene como base principal granos de arroz aderezados con vinagre.',
    'Suele presentarse acompañado de piezas de pescado crudo como atún o salmón.',
    'Con frecuencia viene envuelto en láminas de alga negra llamadas nori.',
    'Plato japonés de rollitos de arroz con pescado crudo que se toma con palillos.'
  ]),

  // --- NATURALEZA Y FENÓMENOS (p71 - p80) ---
  pt('p71', 'Volcán', ['volcanes', 'el volcan'], [
    'Es una formación orográfica de la Tierra.',
    'Suele situarse en puntos de fricción entre placas tectónicas.',
    'Tiene un conducto o abertura superior llamado cráter.',
    'Acumula material rocoso fundido en una cámara en su interior.',
    'Al entrar en erupción arroja ceniza y ríos de roca fundida.',
    'Montaña con un cráter que entra en erupción expulsando lava y cenizas.'
  ]),
  pt('p72', 'Arcoíris', ['arco iris', 'el arcoiris'], [
    'Es un fenómeno visual que ocurre en la atmósfera.',
    'Fue estudiado por Newton al experimentar con prismas de cristal.',
    'Se origina por la descomposición y refracción de la luz solar.',
    'Precisa que haya diminutas gotas de agua suspendidas en el aire.',
    'Dibuja una franja curvada luminosa con siete tonalidades cromáticas.',
    'Arco multicolor que se forma en el cielo cuando llueve y sale el sol a la vez.'
  ]),
  pt('p73', 'Terremoto', ['seismo', 'sismo'], [
    'Es un suceso geológico repentino.',
    'Nace por la brusca liberación de energía en fallas subterráneas.',
    'El punto interno de fractura se llama hipocentro y el superficial epicentro.',
    'Su intensidad se mide habitualmente utilizando la escala de Richter.',
    'Hace temblar el terreno y si ocurre bajo el mar puede originar tsunamis.',
    'Temblor violento de tierra que hace temblar los edificios y el suelo.'
  ]),
  pt('p74', 'Desierto', ['los desiertos', 'el desierto'], [
    'Es una demarcación geográfica natural.',
    'Se define por registrar niveles mínimos de precipitaciones al año.',
    'Padece bruscas variaciones térmicas entre el día y la noche.',
    'El viento arrastra arena formando colinas onduladas llamadas dunas.',
    'Los pequeños manantiales con vegetación y agua se llaman oasis.',
    'Territorio árido y sin apenas agua cubierto de arena y dunas como el Sahara.'
  ]),
  pt('p75', 'Luna', ['la luna'], [
    'Es un cuerpo celeste del espacio.',
    'Se encuentra en rotación orbital continua en torno a la Tierra.',
    'Atraviesa cuatro fases visibles: nueva, creciente, llena y menguante.',
    'Su fuerza gravitacional provoca el ciclo de las mareas en los mares.',
    'Fue pisada por astronautas en misiones de exploración en 1969.',
    'El satélite natural de la Tierra que brilla en el cielo nocturno.'
  ]),
  pt('p76', 'Nieve', ['la nieve'], [
    'Es agua en estado sólido.',
    'Cae desde la atmósfera cuando las temperaturas son muy bajas.',
    'Se precipita flotando de manera pausada en forma de copos blancos.',
    'Al acumularse cubre el paisaje de un manto blanco uniforme.',
    'Permite esquiar y los niños la moldean para hacer muñecos con zanahorias.',
    'Copos blancos de agua congelada que caen en invierno y cubren el suelo de blanco.'
  ]),
  pt('p77', 'Huracán', ['huracanes', 'tifon', 'ciclon'], [
    'Es un fenómeno climático de extrema potencia.',
    'Se origina sobre masas de agua oceánica cálida en regiones tropicales.',
    'La rotación de la Tierra lo hace girar como un gigantesco vórtice de nubes.',
    'En el centro de su estructura existe una zona en calma llamada el ojo.',
    'Genera vientos destructivos de más de doscientos kilómetros por hora.',
    'Enorme tormenta tropical con vientos destructivos y un ojo en calma en el centro.'
  ]),
  pt('p78', 'Océano', ['oceanos', 'el oceano'], [
    'Es una masa líquida continua del planeta.',
    'Ocupa más de dos tercios de toda la superficie terrestre.',
    'Sus aguas contienen una elevada concentración mineral de sal y no se pueden beber.',
    'Se subdivide geográficamente en cinco grandes masas, siendo el Pacífico la mayor.',
    'Separa a los continentes de la Tierra.',
    'Masa gigante de agua salada que cubre el 70% de la superficie de la Tierra.'
  ]),
  pt('p79', 'Marte', ['el planeta rojo', 'marte'], [
    'Es un cuerpo astronómico del sistema solar.',
    'Ocupa la cuarta posición en orden de distancia desde el Sol.',
    'Cuenta con dos diminutos satélites irregulares llamados Fobos y Deimos.',
    'Acoge el volcán más elevado del sistema solar, el Monte Olimpo.',
    'Posee abundantes minerales de óxido de hierro en su suelo rocoso.',
    'El cuarto planeta del sistema solar, conocido como el Planeta Rojo.'
  ]),
  pt('p80', 'Bosque', ['los bosques', 'el bosque'], [
    'Es una formación vegetal sobre tierra firme.',
    'Ocupa amplias extensiones de los continentes.',
    'Se caracteriza por una densa y tupida agrupación de árboles.',
    'El suelo suele acumular hojas secas, ramas, musgos y setas.',
    'Es el entorno natural donde habitan ciervos, zorros, lobos y ardillas.',
    'Extensión de terreno poblada de muchos árboles donde viven animales salvajes.'
  ]),

  // --- ELEMENTOS, TRANSPORTE Y OBJETOS (p81 - p90) ---
  pt('p81', 'Lavadora', ['la lavadora', 'lavarropas'], [
    'Es un artefacto para el hogar.',
    'Tiene un volumen considerable y peso elevado.',
    'Precisa conectarse a la red eléctrica y a tuberías de agua.',
    'Tiene un tambor metálico cilíndrico lleno de pequeños agujeros.',
    'Incorpora un cajetín para detergente y realiza el centrifugado.',
    'Electrodoméstico con tambor giratorio que sirve para lavar la ropa.'
  ]),
  pt('p82', 'Lámpara', ['lamparas', 'la lampara'], [
    'Es un objeto doméstico.',
    'Suele estar enchufada o conectada a un circuito de cables.',
    'Puede colocarse sobre mesas, colgar del techo o apoyarse en el suelo.',
    'Dispone de un interruptor para activarla a voluntad.',
    'Suele estar cubierta por una pantalla que suaviza el resplandor de la bombilla.',
    'Objeto que da luz a una estancia mediante una bombilla.'
  ]),
  pt('p83', 'Televisión', ['television', 'la television', 'tele', 'televisor'], [
    'Es un aparato tecnológico.',
    'Comenzó a difundirse en blanco y negro a mediados del siglo XX.',
    'Ha evolucionado hacia formatos de pantalla plana LED u OLED.',
    'Su tamaño se cuantifica mediante la longitud de su diagonal en pulgadas.',
    'Se ubica en el salón y se maneja a distancia con un mando.',
    'Aparato electrónico de salón con pantalla para ver series, películas y noticias.'
  ]),
  pt('p84', 'Auriculares', ['audifonos', 'cascos'], [
    'Es un complemento electrónico.',
    'Diseñado para ser utilizado por una sola persona.',
    'Puede tener formato de diadema exterior o de botón intrauditivo.',
    'Muchos modelos modernos se enlazan sin cables por Bluetooth.',
    'Se introducen o apoyan directamente en los oídos.',
    'Dispositivo que te pones en las orejas para escuchar música en privado.'
  ]),
  pt('p85', 'Submarino', ['submarinos'], [
    'Es un vehículo de transporte.',
    'Diseñado para desplazarse por el medio marino.',
    'Utiliza tanques de lastre que se llenan de agua para bajar o aire para subir.',
    'Cuenta con un tubo óptico extensible llamado periscopio para ver la superficie.',
    'Existen modelos militares de propulsión nuclear que pasan meses bajo el agua.',
    'Embarcación marina capaz de navegar por debajo del agua.'
  ]),
  pt('p86', 'Guitarra', ['guitarra española', 'guitarra clasica'], [
    'Es un objeto musical.',
    'Perteneciente a la familia de los instrumentos de cuerda.',
    'Consta de una caja de resonancia de madera con una boca circular.',
    'Tiene un mástil dividido por barritas metálicas llamadas trastes.',
    'Es el instrumento protagonista e indispensable de la música flamenca.',
    'Instrumento musical de seis cuerdas que se toca rasgueando con los dedos.'
  ]),
  pt('p87', 'Teléfono móvil', ['smartphone', 'celular'], [
    'Es un dispositivo electrónico.',
    'Apareció en formatos voluminosos en el último tercio del siglo XX.',
    'Funciona mediante tarjetas SIM comunicadas con repetidores de señal.',
    'Ha concentrado funciones de reloj, cámara fotográfica, linterna y mapa.',
    'Tiene una pantalla táctil de cristal y se transporta dentro del bolsillo.',
    'Dispositivo táctil de bolsillo que usamos para llamar, chatear y navegar.'
  ]),
  pt('p88', 'Fuego', ['el fuego'], [
    'Es una manifestación física y química.',
    'Resulta de una reacción de oxidación rápida con desprendimiento de energía.',
    'Precisa para su existencia de calor, material combustible y oxígeno.',
    'En los mitos clásicos el titán Prometeo lo robó a los dioses para el hombre.',
    'Produce humo, residuos de ceniza y altas temperaturas ardientes.',
    'Llamas ardientes que producen luz y calor al quemar algo.'
  ]),
  pt('p89', 'Bicicleta', ['la bicicleta', 'bici'], [
    'Es un medio mecánico de locomoción.',
    'Funciona enteramente gracias al esfuerzo muscular de quien la monta.',
    'Consta de un cuadro tubular ligero, sillín y frenos en un manillar.',
    'Posee pedales unidos a platos que transmiten el giro mediante una cadena.',
    'Es la protagonista de competiciones célebres como el Tour de Francia.',
    'Vehículo de dos ruedas con pedales, cadena y manillar para desplazarse.'
  ]),
  pt('p90', 'Avión', ['aviones', 'aeroplano'], [
    'Es una máquina de desplazamiento.',
    'Fue lograda con motor controlado por primera vez por los hermanos Wright.',
    'Posee una cabina presurizada con asientos para los viajeros.',
    'Requiere circular a gran velocidad por pistas de asfalto para despegar.',
    'Lleva grandes alas laterales con turbinas y vuela sobre las nubes.',
    'Vehículo con alas y motores que transporta pasajeros volando por el aire.'
  ]),

  // --- ANIMALES, CULTURA Y VARIOS (p91 - p100) ---
  pt('p91', 'Lobo', ['lobos', 'el lobo'], [
    'Es un mamífero terrestre.',
    'Pertenece a la familia de los cánidos carnívoros.',
    'Es el ancestro genético directo del perro doméstico.',
    'Vive y colabora en manadas jerarquizadas bajo una pareja alfa.',
    'Es el antagonista tradicional en fábulas como Caperucita Roja.',
    'Cánido salvaje que vive en manadas en los bosques y aúlla a la luna.'
  ]),
  pt('p92', 'Jirafa', ['jirafas', 'la jirafa'], [
    'Es un mamífero cuadrúpedo.',
    'Habita en llanuras y sabanas del continente africano.',
    'Se alimenta arrancando hojas en copas de árboles con su lengua larga.',
    'Su cuerpo luce un patrón de manchas pardas sobre fondo claro.',
    'Duerme casi siempre de pie y apenas unas pocas horas.',
    'Animal africano de cuello larguísimo y manchas marrones.'
  ]),
  pt('p93', 'Canguro', ['canguros', 'el canguro'], [
    'Es un mamífero propio de Oceanía.',
    'Pertenece a la subclase de los marsupiales.',
    'Tiene unas extremidades traseras elásticas de gran envergadura.',
    'Se traslada a gran velocidad dando continuos saltos.',
    'Figura en el escudo nacional oficial de Australia.',
    'Animal marsupial de Australia que salta y lleva a su cría en una bolsa en la barriga.'
  ]),
  pt('p94', 'Oso polar', ['el oso polar'], [
    'Es un mamífero del orden de los carnívoros.',
    'Habita en los confines helados del hemisferio norte.',
    'Su piel debajo del pelaje es totalmente negra para retener calor.',
    'Su pelaje parece completamente blanco para mimetizarse con el hielo.',
    'Se alimenta casi en exclusiva cazando focas en respiraderos.',
    'Gran mamífero carnívoro de pelaje blanco que vive en el hielo del Ártico.'
  ]),
  pt('p95', 'Murciélago', ['murcielagos'], [
    'Es un ser vivo vertebrado.',
    'Pertenece a la clase de los mamíferos.',
    'Desarrolla su actividad de forma preferente durante la noche.',
    'Duerme colgado boca abajo en el interior de cuevas o grietas.',
    'Caza en la oscuridad emitiendo impulsos ultrasónicos por ecolocalización.',
    'Único mamífero que vuela, duerme boca abajo y caza insectos de noche.'
  ]),
  pt('p96', 'Tortuga', ['tortugas', 'la tortuga'], [
    'Es un animal vertebrado de sangre fría.',
    'Pertenece al grupo de los reptiles.',
    'Carece de dientes y posee un pico córneo afilado.',
    'Su cuerpo está protegido permanentemente por un caparazón óseo.',
    'Puede retraer las patas y la cabeza dentro del caparazón ante una amenaza.',
    'Reptil lento con caparazón duro en la espalda.'
  ]),
  pt('p97', 'Hormiga', ['hormigas', 'la hormiga'], [
    'Es un animal invertebrado.',
    'Pertenece a la clase de los insectos himenópteros.',
    'Vive en comunidades organizadas compuestas por miles de miembros.',
    'Se comunican siguiendo rastros químicos invisibles de feromonas.',
    'Suele marchar en largas filas transportando fragmentos de hojas o comida.',
    'Insecto pequeño y fuerte que vive en colonias dentro de un hormiguero.'
  ]),
  pt('p98', 'Vaca', ['las vacas', 'la vaca'], [
    'Es un mamífero herbívoro de cuatro patas.',
    'Su aparato digestivo cuenta con cuatro compartimentos para rumiar.',
    'El macho de su especie se llama toro y su cría es el ternero.',
    'En la religión hinduista de la India es respetada como animal sagrado.',
    'Dispone de glándulas mamarias colgantes en el vientre llamadas ubres.',
    'Animal doméstico de granja que da leche y hace mu.'
  ]),
  pt('p99', 'Steve Jobs', ['jobs'], [
    'Es una figura del ámbito empresarial contemporáneo.',
    'Nació en California a mediados del siglo XX.',
    'Comenzó su proyecto en el garaje de su familia junto a un socio.',
    'Vestía de manera fija con vaqueros y un jersey negro de cuello vuelto.',
    'Lanzó al mercado dispositivos de éxito masivo como el iPod y el iPad.',
    'Cofundador de Apple que presentó el primer iPhone en 2007.'
  ]),
  pt('p100', 'Frida Kahlo', ['frida'], [
    'Es una artista plástica latinoamericana.',
    'Sufrió un grave accidente en su juventud que marcó su salud.',
    'Vivió en la conocida Casa Azul en la localidad de Coyoacán.',
    'La gran mayoría de sus lienzos son autorretratos cargados de dolor.',
    'Es un icono del arte mexicano y un referente del feminismo.',
    'Pintora mexicana de autorretratos reconocible por su uniceja y flores en el pelo.'
  ])
];