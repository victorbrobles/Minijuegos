// server/data/palabras/banco.js
// Palabras objetivo (comunes y conocidas) para «Palabra oculta» y raíces de 7 letras para «Letras en cadena».
// Sin tildes, en minúsculas (la ñ sí cuenta como letra). Todas están en el diccionario (lo comprueba la simulación).
const lista = (s) => s.trim().split(/\s+/);

export const OBJETIVOS = {
  3: lista(`
    sol mar pan luz sal ojo pie voz red rey ley mes gas oro ave uva ajo oso rio ola mil fin gol bar tos paz sur
    col dia fea gel hoy ida lio mal mas mio par pez res ron sed sin te tia tio tren
    van ver vez via yate zoo cal can cruz dos ego
  `).filter((p) => p.length === 3),
  4: lista(`
    casa mesa gato pato vaca sopa luna nube flor mano boca pelo cama silla puerta dedo tela isla playa
    rosa vino agua fuego hielo nieve lago mapa foto taza vaso pera kiwi coco miel leche nata cine baile
    tren auto moto barco avion bici rojo azul gris rata lobo leon foca mono puma toro mula sapo pavo
    hilo lana seda oro plata cobre roca arena polvo humo ruta pista cielo cara ojos nariz lazo bota
    tapa cola lata olla dado reloj nido pino hoja rama tallo arco flecha faro muro baul cuna rana pulpo
    sapo vela tiza goma lapiz papel bolsa caja mago hada rima nota coro piano
  `).filter((p) => p.length === 4),
  5: lista(`
    perro arbol playa nieve fuego queso huevo carne pollo fruta limon melon cereza fresa pasta arroz
    silla mesa banco piano guitarra tambor flauta disco radio libro papel lapiz goma regla mochila
    reloj llave cofre joyas perla oro plata cobre hierro piedra arena barro tierra campo monte selva
    playa costa barco velas remos ancla faro puerto calle plaza parque fuente jardin flores hojas
    ramas tigre cebra mosca abeja hormiga raton conejo gallo oveja cabra burro koala panda nutria
    nariz bocas dedos brazo pecho pierna rodilla cuello hombro sueño noche tarde fiesta baile canto
    risa broma juego carta dados mundo pais reino torre muralla puente camino viaje mapas brujula
    verde negro blanco dulce salado amargo suave grande joven feliz triste listo nuevo viejo claro
    lento rapido fuerte calma trueno lluvia viento nubes rayos tormenta clima verano otoño invierno
    museo teatro circo opera novela poema cuento verso letra drama
  `).filter((p) => p.length === 5),
  6: lista(`
    camion avion ventana puerta tejado escalera pasillo cocina comedor salon jardin terraza balcon
    pelota raqueta portero arbitro torneo equipo medalla podio carrera maraton bicicleta patines
    caballo tortuga ballena tiburon delfin pulpo medusa gaviota paloma aguila halcon buitre loro
    canario conejo ardilla castor zorro lobo oso camello jirafa elefante hipopotamo rinoceronte
    manzana platano naranja sandia cereza ciruela pomelo tomate patata cebolla lechuga pepino
    zanahoria pimiento calabaza garbanzo lenteja galleta tostada helado bombon pastel tarta churro
    planeta cometa estrella galaxia satelite cohete luna marte saturno
    pintor musico actor bombero cartero medico doctor abogado maestro alumno piloto marino soldado
    camisa jersey abrigo bufanda guante zapato sandalia sombrero gorra corbata vestido falda
    martillo tornillo clavo sierra taladro cuerda escoba cubo esponja jabon toalla espejo peine
    tijeras cuchara tenedor cuchillo plato sarten cazuela botella tetera jarra
    montaña volcan desierto bosque pradera colina valle cascada glaciar oceano laguna arroyo
    sonrisa abrazo silencio secreto sorpresa recuerdo aventura tesoro misterio
  `).filter((p) => p.length === 6),
  7: lista(`
    ventana cocinar caminar escribir pintura dibujos musical cantante bailarin escuela maestra
    alumnos pizarra cuaderno mochila estuche regalos navidad cumple fiestas familia hermano abuelos
    sobrino primos vecinos amistad caballo tortuga ballena tiburon gaviota ardilla canguro gorila
    leopardo pantera ciervo jabali manzana platano naranja cerezas ciruela tomates patatas cebolla
    lechuga pepinos galleta helados bombones pasteles tostada chorizo jamones quesos
    planeta cometas estrella galaxia satelite cohetes marciano
    montaña volcanes desierto bosques praderas colinas cascada glaciar oceanos laguna arroyos
    martillo tornillo taladro escoba esponja toallas espejos peines tijeras cuchara tenedor
    botella tetera sombrero zapatos guantes bufanda abrigos camisas vestido corbata
    bombero cartero medicos abogado piloto marinos soldado pintora musicos actores
    tormenta relampago granizo nevada sequia invierno verano otoño primavera mañanas
    ciudad pueblos aldea capital ciudades avenida rotonda semaforo autobus tranvia metro
    trenes avionetas barcos velero canoa piragua submarino
    guitarra violin trompeta tambores piano flautas acordeon bateria
    pelotas porteria arbitro torneos equipos medalla carrera maraton ciclismo natacion
    sorpresa recuerdo aventura tesoros misterio secreto silencio sonrisa abrazos
  `).filter((p) => p.length === 7),
  8: lista(`
    elefante cocodrilo mariposa escarabajo murcielago golondrina pinguino flamenco dinosaurio
    caracola langosta mejillon calamares sardinas boqueron
    zanahoria berenjena calabacin pimiento aguacate albaricoque melocoton frambuesa arandanos
    chocolate magdalena croqueta empanada tortilla ensalada lentejas garbanzo macarrones
    bicicleta autobuses camiones furgoneta tractores helicoptero aeropuerto estacion carretera
    autopista gasolina semaforo
    ordenador teclado pantalla impresora telefono internet mensajes cuaderno lapicero rotulador
    biblioteca diccionario enciclopedia periodico revistas
    montañas volcanes desiertos cascadas glaciares tormentas relampago terremoto huracanes
    primavera invierno estacion arcoiris amanecer atardecer
    hermanos abuelita sobrinos familias vecindad amistades
    medicina hospital enfermera farmacia dentista
    guitarra trompeta tambores acordeon orquesta conciertos canciones
    porteria jugadores entrenador campeonato estadio aficion
    sorpresas recuerdos aventuras misterios secretos sonrisas
    castillo princesa caballero dragones fantasma tesoreros piratas
    zapatilla sombreros calcetin pantalon cinturon chaqueta
    escalera ascensor terraza chimenea frigorifico lavadora microondas
    paraguas maletero mochilas cuadernos plastilina
  `).filter((p) => p.length === 8)
};

// Raíces para «Letras en cadena»: palabras de 7 letras con muchas palabras escondidas.
export const RAICES = lista(`
  pintura cantera retinas sentado cortina materia carpeta pelotas tomates platano marinos
  caminos naranja maestro cuadros rescate primero lentes oradores trucos pianista tensado
  ventana palomas recetas sonrisa partido cartones postres dientes pescado mentira cantos
  paredes tejados estrena carrito granate mineral saliente noticia recital torneos camiones
  lacteos esquina pierna anillos mercado barrios calores sabores ternera piratas almacen
  ensalada tardes colores pensar escalar soltera templos tortilla domingo aceites
`).filter((p) => p.length === 7);
