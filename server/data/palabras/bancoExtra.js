// server/data/palabras/bancoExtra.js
// Ampliación de palabras para «Palabra oculta» y «Letras en cadena». Sin tildes y en minúsculas.
// No hace falta separarlas por longitud: banco.js las reparte y lib/palabras.js descarta las que no estén en el
// diccionario (y, en las raíces, las que esconden pocas palabras).
const lista = (s) => s.trim().split(/\s+/);

export const PALABRAS_EXTRA = lista(`
  ala ama ana ate bus cal cae cia dar dio don eco eje era fan fax fe fui gen ira kilo len lima
  mal mia mil mis moda nos nuez ojo oso pan pie pis pon que ron rol sal ser sol son sur tal tan ten ti tu uno uso
  ves vio yo zar
  alma amor anda ancla arpa asno ateo atun aula ave azar baja bala bata beso boda bola bota buey bus cabo cafe
  caja cal cama cana capa cara caro casa cebo ceja cena cera cero cesta cien cita club codo cola copa coro corte
  cosa cubo cuna dama dato debe dios doce dona dura duda ejes enano ente faro feria fila fino foca foto fresa gafa
  gala gama gana gato gira golf gota gris grua guia haba hada hijo hilo hora hoyo hueso idea isla jaula jefe
  juez jugo kilo lado lago lata lava leon lima liso loco lobo loro lote luna malo mama mapa mar masa mate mayo
  menta mesa meta miel mina miro mito moda mole mono moto muro nabo nada nana neon nido nieto niña nota nube
  nuca ocho ola olor once onda oreja oro oso oveja pala pana papa paso pata pavo peca pena pera perro peso
  piña pino pipa piso pista poco polo pomo poro pozo puma pupa queso rabo rama rana rata raya reja remo rico
  rima rio risa roca rojo rosa rubi ruda rueda ruta saco sala salsa seda sello seta silla sitio sobre soga sopa
  suma taco tapa tarta taza techo tela tema tenis tigre tinta tio tiza toro torre trigo tubo tuna uña uva vaca
  vado valle vaso vela vena verde vida vino viola yoga yema zapato zona zumo
  abeja abril aceite acero actor agosto aguja ahora alero algas altar ambos ancho angel anillo antes apodo arbol
  arena aroma arroz asado astro atlas avena aviso ayuda azote bahia balon banco banda barba barco barro bello
  bingo bocas bolsa bosque brazo brisa broma bruja buzon caballo cable cabra cacao cadena calle calor campo
  canal canoa canto carne carta casco catre causa cebra cerdo cesta chapa chico chino chiste cielo cinta circo
  clase clavo cobre coche cofre colmo combo comer conde copia coral corto costa crema cubo cuero cuento cueva
  dardo deber dedal delta diente disco doble dolor drama ducha dueño enero enojo error esqui falda fama farol
  feliz fibra fiera finca firma flaco flota fondo forma fruta fuego fuerte gallo ganso garra gente globo gorra
  grano grito grupo guapo guiso habla hacha harina helado hielo hierba higo hongo horno hotel huevo humo
  joven joya juego julio junio justo karma kiosco labio lapiz largo latin lazo leche lente lento libro
  lider limon linea lista litro llama llave lluvia lobo lucha lugar madre magia mango manta marco marzo
  medio menor metal metro miedo milla mismo mitad monte moral mosca motor mueble mujer museo musica nacion
  nariz negro nieve noche norte novia nuevo obra oeste orden oruga otoño padre pagar pajaro palma panda papel
  parque pasta pausa pecho pedal peine perla piano piedra pinta pirata pizza plata playa plaza pluma poema
  poeta pollo potro prado precio premio primo prisa punto queso radio ramo rayo razon regla reina reloj resto
  ritmo robot rodeo ronda rubio rumbo sabio sable salmon salud santo selva señal siglo signo silla soldado
  sorpresa suelo sueño tabla talla tambor tanque tarde tecla tejado tienda tierra tijera tinta titulo toalla
  tomate traje trapo trato tribu trono truco tumba turno ultimo union vagon valor vapor vecino venda verano
  viaje video viento virus visita viuda volcan zorro
  abuelo acento aceite adorno afecto alarma alegre almeja amigos animal antena apoyo armario arrugas asiento
  azucar balcon bandeja baraja barrio basura batido bebida bellota besugo biblia bodega boligrafo bombilla
  bufanda burbuja caballo cabeza cadera cajero camion camisa campana canela cangrejo cantante capitan caracol
  carbon cartel castaña cebolla cereza cerebro charco chocolate cohete colegio collar conejo corazon cordero
  cortina cuaderno cuchara cuchillo cuento delfin deporte desierto destino diamante dibujo dinero domingo
  dragon edificio elefante enfermo escoba espada espejo estrella examen fabrica familia fantasma farola
  flamenco frontera galleta garbanzo gigante girasol gorila granja guitarra hermano hormiga huerto iglesia
  isla jabon jardin jirafa juguete ladrillo lagarto langosta lechuga leopardo libreta linterna lombriz
  lunes madera maestro maleta manzana mariposa martes martillo medalla melocoton mercado mermelada
  mochila molino montaña mosquito muñeca naranja nevera ombligo ordenador orquesta paloma pantalla
  pañuelo paraguas pasillo patata pegatina pelota perfume periodico pescado pestaña pijama pimiento
  pintura planeta platano plumero pradera puente pulsera rapido raqueta ratones recreo refresco regalo
  semana serpiente sombrero sorpresa tiburon tortuga tractor trompeta tulipan ventana verdura viernes
  vestido volante zanahoria zapatilla
`);

export const RAICES_EXTRA = lista(`
  cartera paletas tormenta pantera piratas corales tesoro maletas tortilla cometas pastora
  camisetas cerdito tareas pasteles salteado entradas portales cantera colorado marcador
  rastreo sentir torneos mercado plateado cuidado aceitunas espinas pantalon estrella
  pirata canteras secreto despiste carteles pradera planeta caminata relatos colinas
  galletas novelas pelador parientes trineos maestras sonatas rosales tenores lanzador
  monedas soltera canario retratos piraguas cocinas termina costales potencia alertas
  estatua dorados retirada nocturna repartos antenas pescador cornetas lotes moteles
  arenales camareta plantones resaltado tostadas porteras lectores ratones ladrones
`);
