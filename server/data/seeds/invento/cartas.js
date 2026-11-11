// server/data/seeds/invento/cartas.js
// Cartas de «El Invento del Siglo»: un objeto, un problema que resolver y una característica absurda.

export const OBJETOS = [
  'Una tostadora', 'Un paraguas', 'Una bicicleta', 'Un calcetín', 'Una lavadora', 'Un cepillo de dientes', 'Una silla de oficina',
  'Un microondas', 'Una almohada', 'Un frigorífico', 'Una bañera', 'Un sombrero', 'Unas gafas de sol', 'Un patinete', 'Una aspiradora',
  'Un reloj de pared', 'Una mochila', 'Una sartén', 'Una lámpara', 'Un mando a distancia', 'Una cafetera', 'Un taburete', 'Un globo',
  'Una escoba', 'Un secador de pelo', 'Un carrito de la compra', 'Una hamaca', 'Un ventilador', 'Una grapadora', 'Una tetera',
  'Un buzón', 'Una maleta', 'Una cortina', 'Un tenedor', 'Un saco de dormir', 'Un monopatín', 'Una regadera', 'Un ataúd',
  'Un sofá cama', 'Una tirita', 'Un casco de moto', 'Una pizarra', 'Unas zapatillas', 'Un despertador', 'Un tupper', 'Una peluca',
  'Un flotador', 'Una nevera portátil', 'Un piano', 'Un semáforo', 'Una barbacoa', 'Una cuna', 'Un bastón', 'Un exprimidor',
  'Una papelera', 'Una tienda de campaña', 'Un tobogán', 'Una brújula', 'Unos guantes', 'Una corbata', 'Un ascensor', 'Una vela',
  'Un cubo de basura', 'Una impresora', 'Un trampolín', 'Una caja fuerte', 'Un bolígrafo', 'Un acuario', 'Un columpio', 'Un dron',
  'Una mopa', 'Unos auriculares', 'Un llavero', 'Una batidora', 'Un perchero', 'Una caña de pescar', 'Un termo', 'Un rodillo de cocina'
];

export const PROBLEMAS = [
  'evitar los atascos', 'que los niños se coman la verdura', 'no olvidar nunca las llaves', 'dormir en el avión', 'acabar con las discusiones de pareja',
  'que el café no se enfríe', 'encontrar aparcamiento', 'no llegar tarde al trabajo', 'que las plantas no se mueran', 'cortar la cebolla sin llorar',
  'aguantar a los cuñados en Navidad', 'evitar las resacas', 'que el perro no ladre de noche', 'no perder los calcetines', 'aprender idiomas durmiendo',
  'que no te pille la lluvia', 'superar el miedo a volar', 'dejar de mirar el móvil', 'que los ronquidos no despierten a nadie', 'pasar la ITV a la primera',
  'ganar siempre al parchís', 'que la leche no se salga', 'sobrevivir a agosto sin aire acondicionado', 'no dejarse nada en el súper', 'quitarse el hipo',
  'que los mosquitos no piquen', 'hacer amigos en una ciudad nueva', 'ahorrar para la jubilación', 'estudiar la noche antes del examen', 'elegir qué ver en la tele',
  'que el bocadillo no se aplaste', 'evitar las colas del médico', 'no quemar las tostadas', 'que los vecinos no hagan ruido', 'ligar en una boda',
  'que la ropa se doble sola', 'reciclar sin equivocarse de contenedor', 'despertarse de buen humor', 'que no se escape el gato', 'encontrar el mando de la tele',
  'que las reuniones duren menos', 'ganar el concurso de paellas del pueblo', 'subir una montaña sin cansarse', 'que los zapatos no huelan', 'calmar a un bebé que llora',
  'saber si un melón está maduro', 'que la abuela entienda el WhatsApp', 'hacer deporte sin moverse del sofá', 'no mancharse comiendo spaghetti', 'repartir la cuenta en una cena',
  'que el wifi llegue a todas las habitaciones', 'que no se pierdan los tuppers prestados', 'saber qué piensa tu gato', 'mantener el pelo perfecto con viento', 'no quedarse dormido en clase',
  'que el móvil no se quede sin batería', 'mudarse de piso en un día', 'que no se derrita el helado', 'encontrar a Wally', 'organizar el armario'
];

export const RASGOS = [
  'que sea invisible', 'que funcione con lágrimas', 'que cante ópera', 'que sea del tamaño de un garbanzo', 'que solo funcione los martes',
  'que tenga patas', 'que hable en verso', 'que sea comestible', 'que funcione con energía solar de la luna', 'que dé abrazos',
  'que tenga mal carácter', 'que sea de chocolate', 'que solo lo puedan usar los abuelos', 'que flote', 'que huela a churros',
  'que se pueda doblar como un pañuelo', 'que se ponga celoso', 'que cuente chistes malos', 'que sea gigantesco', 'que cambie de color con tu humor',
  'que funcione al revés', 'que tenga wifi y opine de todo', 'que sea hecho de queso', 'que solo funcione si bailas', 'que tenga su propio canal de YouTube',
  'que necesite que lo riegues', 'que se pueda montar como un caballo', 'que tenga acento gallego', 'que vuele', 'que haga la declaración de la renta',
  'que esté embrujado', 'que sea de lego', 'que funcione con pedales', 'que dure solo cinco minutos', 'que tenga sentimientos',
  'que sea resistente a todo menos al agua', 'que dé consejos amorosos', 'que pese una tonelada', 'que vibre cuando mientes', 'que sea fosforito',
  'que funcione con palmas', 'que se reproduzca', 'que sea portátil pero mida tres metros', 'que tenga barba', 'que imite a famosos',
  'que solo funcione con música de Camela', 'que sea de cartón', 'que se desmonte en 300 piezas', 'que tenga cola de sirena', 'que funcione a pilas de botón',
  'que sea antiguo, del siglo XV', 'que haga ruido de vaca', 'que tenga su propio horóscopo', 'que necesite dormir la siesta', 'que sea para gatos',
  'que solo se pueda usar en grupo', 'que deje purpurina por todas partes', 'que se teletransporte', 'que tenga un ojo que te mira', 'que funcione con gazpacho'
];

// ---- Ampliación: más cartas para que las partidas no se repitan ----
OBJETOS.push(
  'Una nevera de playa', 'Un cortaúñas', 'Un tendedero', 'Una plancha', 'Un abrelatas', 'Una persiana', 'Un sacacorchos', 'Una cuchara de palo',
  'Un rallador', 'Una olla exprés', 'Una freidora de aire', 'Un colador', 'Un delantal', 'Un mantel', 'Un salero', 'Una tabla de cortar',
  'Un cucharón', 'Un molinillo de pimienta', 'Un bol', 'Un vaso de chupito', 'Una jarra de cerveza', 'Una botella de agua', 'Un abanico',
  'Un botijo', 'Una manta eléctrica', 'Una bolsa de agua caliente', 'Un edredón', 'Una mesilla de noche', 'Un armario', 'Un espejo',
  'Una alfombra', 'Un cojín', 'Un puf', 'Una mecedora', 'Un banco del parque', 'Una farola', 'Una fuente', 'Un buzón de correos',
  'Un contenedor de reciclaje', 'Una papelera de oficina', 'Un archivador', 'Un clip', 'Una regla', 'Un compás', 'Una calculadora',
  'Un sacapuntas', 'Una goma de borrar', 'Un estuche', 'Una agenda', 'Un post-it', 'Un portátil', 'Un ratón de ordenador', 'Un teclado',
  'Una webcam', 'Un altavoz', 'Un tocadiscos', 'Una guitarra', 'Una pandereta', 'Un silbato', 'Un metrónomo', 'Un micrófono',
  'Una cámara de fotos', 'Unos prismáticos', 'Una linterna', 'Una navaja suiza', 'Una cantimplora', 'Un hornillo de camping', 'Una nevera de camping',
  'Un saco de boxeo', 'Una pesa', 'Una cinta de correr', 'Una esterilla de yoga', 'Una comba', 'Un balón de fútbol', 'Una raqueta',
  'Unos patines', 'Una tabla de surf', 'Unas aletas de buceo', 'Unas gafas de bucear', 'Un esquí', 'Un trineo', 'Una bicicleta estática',
  'Un carrito de bebé', 'Un chupete', 'Un biberón', 'Un sonajero', 'Un parque infantil', 'Un peluche', 'Una muñeca', 'Un cochecito teledirigido',
  'Un yoyó', 'Una peonza', 'Un cubo de playa', 'Una sombrilla', 'Una toalla', 'Un bañador', 'Unas chanclas', 'Un gorro de piscina',
  'Un tenderete', 'Una caravana', 'Una furgoneta', 'Un tractor', 'Un carrito de golf', 'Un ascensor de obra', 'Una grúa', 'Una carretilla',
  'Una escalera', 'Un martillo', 'Un destornillador', 'Una llave inglesa', 'Un taladro', 'Una cinta métrica', 'Una motosierra', 'Un cortacésped',
  'Una manguera', 'Una maceta', 'Un invernadero', 'Una caseta de perro', 'Una jaula de pájaro', 'Un rascador de gato', 'Una correa de perro',
  'Un comedero', 'Un collar', 'Un pendiente', 'Un anillo', 'Una pulsera', 'Un reloj de pulsera', 'Un paraguas plegable', 'Un chubasquero',
  'Unas botas de agua', 'Un abrigo', 'Una bufanda', 'Un gorro de lana', 'Una chaqueta vaquera', 'Unos pantalones', 'Un pijama', 'Una bata',
  'Unas zapatillas de estar por casa', 'Una mascarilla', 'Un termómetro', 'Una báscula', 'Un tensiómetro', 'Un bastón de esquí',
  'Una urna de votación', 'Un atril', 'Una pancarta', 'Un megáfono', 'Un confesionario', 'Un trono', 'Una corona', 'Una armadura'
);
PROBLEMAS.push(
  'no dejarse el fuego encendido', 'que no se quemen las lentejas', 'que el helado no gotee', 'hacer la cama en diez segundos', 'que los niños se duerman a su hora',
  'que la siesta dure lo justo', 'no llegar tarde a la boda', 'que nadie copie en el examen', 'que el jefe no te vea dormir', 'aguantar una reunión de vecinos',
  'que el gato no arañe el sofá', 'que el perro no se coma los zapatos', 'que las palomas no ensucien el balcón', 'que no se cuelen en la cola', 'pagar menos de luz',
  'que el móvil no se quede sin batería', 'no perder el autobús', 'saber cuándo pasa el autobús de verdad', 'encontrar pareja de baile', 'quedar bien en las fotos',
  'que el flequillo no se rebele', 'quitar las manchas de tomate', 'que la paella no se pegue', 'que las patatas fritas salgan crujientes', 'hacer la compra sin salir de casa',
  'elegir regalo para la suegra', 'organizar la mudanza', 'montar un mueble sin que sobren tornillos', 'colgar un cuadro recto', 'que los niños recojan sus juguetes',
  'saber dónde has aparcado', 'que no te multen por exceso de velocidad', 'cambiar una rueda en la autovía', 'no marearse en el coche', 'que no te piquen las medusas',
  'que la arena no se meta en el bocadillo', 'tostarse sin quemarse', 'no perder a los niños en la playa', 'que la sombrilla no salga volando', 'pescar algo de verdad',
  'que los turistas no te pregunten el camino', 'hablar con los extraterrestres', 'que las tostadas caigan por el lado bueno', 'ganar la lotería de Navidad', 'que los villancicos no se te peguen',
  'colocar la mesa de Nochebuena', 'que no se acabe el turrón', 'envolver regalos sin cinta adhesiva', 'cumplir los propósitos de año nuevo', 'ir al gimnasio en enero y en febrero',
  'que las rebajas no te arruinen', 'encontrar tu talla', 'probarse ropa sin probador', 'no perderse en el Ikea', 'que el bebé no llore en el avión',
  'cruzar la ciudad en hora punta', 'subir cuestas en bici', 'que no te roben la bici', 'no despertar a nadie al llegar tarde', 'que el despertador no se apague solo',
  'no olvidar los cumpleaños', 'aprender a cocinar', 'que la tortilla se dé la vuelta sola', 'que nadie se coma tu yogur de la nevera de la oficina', 'compartir piso sin peleas',
  'que la caldera no se estropee en invierno', 'que el piso no huela a fritanga', 'que entre el sofá por la puerta', 'subir la compra a un quinto sin ascensor', 'que la lavadora no destiña',
  'planchar camisas sin arrugas', 'saber si el pescado es fresco', 'abrir los botes de mermelada', 'pelar una naranja de una vez', 'que no se derrame el café en el coche',
  'que el abuelo oiga la tele sin volumen al máximo', 'hacer los deberes de matemáticas', 'recordar las contraseñas', 'que no te espíen por la webcam', 'desconectar en vacaciones',
  'que la videollamada no se congele', 'no salir con cara rara en la videollamada', 'escribir sin faltas de ortografía', 'hablar en público sin temblar', 'decir que no sin quedar mal',
  'que no se te olvide lo que ibas a decir', 'saber si te están mintiendo', 'que no se pierda el mando de la consola', 'ganar a los videojuegos', 'que el árbitro no se equivoque',
  'que tu equipo no baje a Segunda', 'conseguir entradas para el concierto', 'ver el concierto sin una cabeza delante', 'no perder la voz cantando', 'que no se acabe la cerveza en la fiesta',
  'que el gazpacho esté siempre frío', 'que las uvas de Nochevieja se coman a tiempo', 'que el niño deje el pañal', 'que los dientes de leche se caigan sin dolor', 'que el ratoncito Pérez sea puntual',
  'que los zapatos nuevos no hagan rozaduras', 'caminar con tacones', 'llevar muchas bolsas a la vez', 'que no se arrugue la ropa en la maleta', 'no pagar exceso de equipaje',
  'encontrar las gafas que llevas puestas', 'que los mosquitos se vayan al vecino', 'dormir con calor', 'que las sábanas no se salgan del colchón', 'que el niño no se despierte a las seis',
  'que la abuela no te ponga más comida', 'terminarse el plato', 'cocinar para veinte personas', 'que la barbacoa no eche humo a los vecinos', 'que la piscina esté siempre limpia',
  'que las hojas del otoño se barran solas', 'quitar la nieve de la puerta', 'que el coche arranque en invierno', 'secar la ropa cuando llueve', 'no resbalar en el hielo',
  'aprender a nadar', 'quitarse el miedo a las arañas', 'que el dentista no duela', 'tomarse las pastillas a su hora', 'que las vacunas no den miedo',
  'saber qué tiempo va a hacer', 'que no te alcance una tormenta', 'encontrar setas sin envenenarse', 'que las hormigas no entren en la cocina', 'que el pan no se ponga duro'
);
RASGOS.push(
  'que vuele', 'que solo funcione si le cantas', 'que tenga wifi', 'que se enfade si no le das las gracias', 'que funcione con pedales',
  'que se pueda comer de postre', 'que brille en la oscuridad', 'que tenga su propio canal de YouTube', 'que pese una tonelada', 'que esté hecho de gominola',
  'que solo funcione en agosto', 'que se maree', 'que tenga mascota', 'que cobre por usarlo', 'que funcione con monedas de 20 céntimos',
  'que se pueda llevar en el bolsillo', 'que sea de lana', 'que tenga acento gallego', 'que solo hable en inglés', 'que dé consejos de amor',
  'que cotillee', 'que tenga tres ruedas', 'que sea transparente', 'que se derrita al sol', 'que se tenga que regar',
  'que haga la ola', 'que se ría de ti', 'que sea antiguo, del siglo XVIII', 'que funcione a pilas de botón', 'que se cargue con aplausos',
  'que tenga GPS y se pierda igual', 'que esté siempre de vacaciones', 'que necesite dormir la siesta', 'que tenga alergia al polvo', 'que solo funcione al revés',
  'que sea de piedra', 'que se pueda montar', 'que tenga bigote', 'que lleve sombrero', 'que tenga un botón rojo que nadie debe pulsar',
  'que imite voces', 'que tenga nombre propio', 'que sea de color fosforito', 'que dé premios', 'que solo lo entiendan los adolescentes',
  'que se apague si lo miras', 'que cuente los pasos', 'que se esconda cuando lo buscas', 'que tenga un ojo', 'que se pueda inflar',
  'que haga ruido de vaca', 'que sea biodegradable', 'que esté bendecido', 'que tenga fecha de caducidad', 'que dé descargas eléctricas suaves',
  'que se deshaga en el agua', 'que sea del tamaño de un autobús', 'que cante en el karaoke', 'que tenga horario de oficina', 'que haga pompas de jabón',
  'que lance confeti', 'que solo funcione con luna llena', 'que tenga teletrabajo', 'que sea de oro macizo', 'que pida perdón',
  'que se pueda programar con la voz', 'que tenga cola', 'que esté aburrido de todo', 'que sepa hacer croquetas', 'que vibre como un móvil',
  'que esté patrocinado por una marca de chorizo', 'que lo haya diseñado un niño de cinco años', 'que funcione con agua de mar', 'que sea plegable como un origami', 'que tenga tu cara',
  'que eche purpurina', 'que funcione con las palmas', 'que tenga miedo a la oscuridad', 'que sea fan del Real Madrid', 'que se enamore de otros aparatos',
  'que solo funcione si estás contento', 'que hable con los animales', 'que tenga instrucciones en sueco', 'que haga la declaración de la renta', 'que sea a prueba de abuelas',
  'que tenga cuernos', 'que esté hecho de cartón', 'que se lleve como un collar', 'que funcione con vapor', 'que tenga un modo turbo',
  'que se parezca a un famoso', 'que salga en las noticias', 'que juegue al ajedrez', 'que se pueda poner en la nevera', 'que sea a prueba de bombas',
  'que dé la hora en voz alta cada minuto', 'que sea de terciopelo', 'que funcione con café', 'que tenga sus propias redes sociales', 'que haga la cama',
  'que tenga un cajón secreto', 'que lleve ruedas de tractor', 'que se encoja con el frío', 'que tenga muelles', 'que hable con refranes',
  'que esté hecho de queso', 'que dure mil años', 'que solo se pueda usar una vez', 'que se pueda alquilar por horas', 'que tenga suscripción mensual',
  'que funcione con la mente', 'que eche humo de colores', 'que sea de juguete', 'que esté prohibido en tres países', 'que tenga su propio himno',
  'que sea muy dramático', 'que lleve purpurina y luces de Navidad', 'que tenga hipo', 'que haga ruido de cascabel', 'que se pueda plantar',
  'que imprima fotos', 'que esté siempre caliente', 'que se ponga de moda en TikTok', 'que tenga marcha atrás', 'que sea capaz de saltar',
  'que se pueda lavar en el lavavajillas', 'que funcione con chistes', 'que solo lo puedan usar zurdos', 'que tenga un ayudante robot', 'que sea mágico'
);
PROBLEMAS.push(
  'que no te toque fregar', 'saber qué hay de cenar', 'que la pizza llegue caliente', 'aparcar en paralelo', 'que el niño coma pescado',
  'que la radio sintonice en el túnel', 'que no se corte la mayonesa', 'que el bizcocho suba', 'que las gafas no se empañen', 'que no se te duerma el pie',
  'dejar de morderse las uñas', 'que el jardín no tenga topos', 'que no se cuelen jabalíes en el pueblo', 'encontrar trabajo', 'pedir un aumento de sueldo'
);
RASGOS.push(
  'que estornude', 'que solo funcione de noche', 'que tenga alas de mariposa', 'que sea de porcelana', 'que tenga cremallera',
  'que lo puedas tejer tú mismo', 'que se pueda usar como sombrero', 'que dé masajes', 'que tenga radio incorporada', 'que funcione con ketchup',
  'que tenga un reloj de arena', 'que sea capaz de nadar', 'que tenga la voz de tu madre', 'que pite como un camión marcha atrás', 'que se ilumine al aplaudir',
  'que solo funcione si no lo miras', 'que se cambie de sitio solo', 'que tenga barba', 'que sea a prueba de niños', 'que hable con acento andaluz'
);
// Sin repetidas (por si alguna se cuela al ampliar)
for (const lista of [OBJETOS, PROBLEMAS, RASGOS]) {
  const vistas = new Set();
  const unicas = lista.filter((x) => { const k = x.toLowerCase(); if (vistas.has(k)) return false; vistas.add(k); return true; });
  lista.splice(0, lista.length, ...unicas);
}
