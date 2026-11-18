// client/src/ayudas/d.js — Ayudas estructuradas (4/4). Formato en ayudas/index.js.
export default {
  'ponorden': {
    objetivo: 'Ordena **seis elementos** por fecha, tamaño o distancia. El orden perfecto vale mucho más.',
    pasos: [
      'Cada ronda salen seis elementos de un tema: inventos, hechos históricos, películas, ríos, montañas, planetas, animales, edificios, países…',
      'Ordénalos según lo que se pida: del más antiguo al más moderno, del más corto al más largo, del más lejano al más cercano…'
    ],
    secciones: [{ icono: '📱', titulo: 'Modos', color: 'cian', items: ['**Online**: todos ordenan a la vez y hay **75 segundos**.', '**Un dispositivo**: os pasáis el móvil.'] }],
    puntos: [['✅', 'Cada elemento en su posición', '+1'], ['🏆', 'Orden completo perfecto', '+10']]
  },
  'intruso': {
    objetivo: 'De cinco elementos, **uno no encaja**: es de otra época o de otra categoría. Encuéntralo en 10 segundos.',
    pasos: [
      'Salen cinco elementos: inventos, obras, hechos históricos, películas, personajes…',
      'Tienes **10 segundos** para tocar al intruso.',
      'Al resolver se explica **por qué** era el intruso (con los años de cada uno, si era de época).'
    ],
    puntos: [['✅', 'Acierto', '+1'], ['⚡', 'En menos de 5 segundos', '+1 extra'], ['❌', 'Fallo', '0 (no resta)']]
  },
  'lapiz': {
    objetivo: 'Rellena las **ocho categorías** con palabras que empiecen por la letra… y suelta el lápiz antes que nadie.',
    pasos: [
      'Cada ronda sale una **letra** y ocho categorías: nombre, animal, país o ciudad, cosa… y cuatro más que cambian.',
      'Escribe una palabra por categoría que empiece por esa letra.',
      'Al terminar, pulsa **«¡Lápiz fuera!»**: online, a los demás les quedan **10 segundos**. Si nadie termina, la ronda dura 120 segundos.',
      'Se revisan las respuestas entre todos: las que no valgan se anulan (online, si la mitad o más votáis en contra).'
    ],
    secciones: [{ icono: '📱', titulo: 'En un dispositivo', color: 'cian', texto: 'Cada uno escribe por turnos con **90 segundos**.' }],
    puntos: [['🦄', 'Nadie más la ha puesto', '+10'], ['👯', 'Repetida', '+5'], ['🏆', 'Eres el único con algo válido', '+20']]
  },
  'fichajes': {
    objetivo: 'Di en qué **equipo juega ahora** cada futbolista y aguanta la racha más larga.',
    pasos: [
      'Sale un futbolista: di en qué equipo juega ahora (temporada 2025/26). Tienes **15 segundos**.',
      'Si aciertas, sale otro; si fallas o se acaba el tiempo, tu racha termina.',
      'Cuanto más aguantas, **menos conocidos** son los futbolistas.',
      'Cada ronda juegan todos, uno detrás de otro. Se juegan 5, 7 o 10 rondas.'
    ],
    puntos: [['🔥', 'Cada acierto seguido', '+1']],
    consejos: ['Vale el nombre del club o cómo se le conoce (Atleti, Barça, City, Napoli…).']
  },
  'eco': {
    objetivo: 'Repite la **secuencia de luces** en el mismo orden. Cada ronda tiene un paso más.',
    pasos: [
      'Mira la secuencia y repítela tocando los botones en orden.',
      'Empiezas con **4 botones**; desde la ronda 6 hay 6 y desde la 11, 9. Cada vez va más rápido.'
    ],
    secciones: [
      { icono: '🌀', titulo: 'Rondas especiales', color: 'violeta', tabla: [['↩️', '**Al revés**: repite la secuencia de atrás hacia delante'], ['⛔', '**Trampa**: los pasos en rojo con pitido grave no se repiten'], ['🔀', '**Barajado**: los botones cambian de sitio justo antes de tu turno; recuerda los colores, no las posiciones']] },
      { icono: '❤️', titulo: 'Vidas', color: 'rojo', texto: 'Tienes **3 vidas**: si fallas, se repite la ronda.' }
    ],
    puntos: [['🏁', 'Cada ronda superada', '+1']]
  },
  'crimen': {
    objetivo: 'Han asesinado a Víctor 💀. Coloca a todos en el plano de la casa y descubre al **asesino**.',
    pasos: [
      'Tienes el plano: habitaciones de colores y muebles.',
      'Usa las **pistas** para colocar a todos. Elige una persona y toca su casilla; toca otra vez para quitarla. Con **«Tachar»** descartas casillas.',
      'Cuando estén todos, comprueba la escena… o **acusa** directamente si lo tienes claro (si fallas, el asesino se escapa).'
    ],
    secciones: [
      { icono: '📐', titulo: 'Reglas de la escena', color: 'violeta', items: ['En cada **fila** y cada **columna** había exactamente una persona (la víctima incluida).', 'Nadie puede estar encima de una mesa 🍽️, una planta 🪴 o una estantería 📚. Sí en una silla 🪑, una alfombra 🧶 o una cama 🛏️.', 'El asesino es el **único sospechoso** que estaba en la misma habitación que la víctima.'] },
      { icono: '🧠', titulo: 'Nivel Experto (8×8)', color: 'rojo', texto: 'Solo hay una pista por personaje y una condición general al final («Además, …»). Hay que exprimir cada pista y la regla de una persona por fila y columna.' }
    ],
    gana: 'Cada caso es nuevo y tiene **una sola solución**. Tu récord es el **menor tiempo** en cada nivel.'
  },
  'escalera': {
    objetivo: 'Sube **15 preguntas** cada vez más difíciles hasta los **10.000 puntos**. Plántate a tiempo… o arriésgalo todo.',
    pasos: [
      'Cada escalón vale más puntos. Tienes **30 segundos** por pregunta.',
      '🛑 Puedes **plantarte** antes de responder y quedarte con lo que llevas.'
    ],
    secciones: [
      { icono: '🛟', titulo: 'Rellanos seguros', color: 'verde', items: ['Las preguntas **3, 7 y 11** son rellanos: si fallas después, te quedas con lo de ese escalón.', 'Si fallas antes del primero, te vas con **0**.'] },
      { icono: '🃏', titulo: 'Comodines (uno de cada)', color: 'violeta', tabla: [['✂️', '**Tijeras**: quita dos respuestas falsas'], ['🔄', '**Cambio**: otra pregunta del mismo nivel'], ['📊', '**Sondeo**: lo que respondería la gente (que no siempre acierta)']] }
    ]
  },
  'cronologia': {
    objetivo: 'Coloca cada acontecimiento en su sitio de la **línea del tiempo**. ¿Hasta dónde llegas?',
    pasos: [
      'Arriba aparece un acontecimiento: un invento, una película, un libro, un hecho histórico, un nacimiento…',
      'Pulsa el hueco **«Aquí»** donde creas que va: antes, entre o después de las cartas que ya tienes.',
      'Cuantas más cartas tengas, más finos son los huecos.'
    ],
    puntos: [['✅', 'Acierto', '+1'], ['❌', 'Fallo', 'Pierdes una vida (3 en total)']],
    notasPuntos: ['Si fallas, la carta se coloca en su sitio en rojo.']
  },
  'cadena': {
    objetivo: 'Escribe todas las respuestas que sepas de cada categoría y **encadena** categorías antes de quedarte sin tiempo.',
    pasos: [
      'Empiezas con **90 segundos**.',
      'Sale una categoría con una **lista cerrada** de respuestas: escribe todas las que sepas.',
      'Al llegar al **mínimo** (más o menos el 60 %), la categoría queda superada. Puedes seguir sumando o pasar a la siguiente.'
    ],
    puntos: [['✅', 'Cada respuesta correcta', '+1'], ['⏱️', 'Categoría superada', '+15 s'], ['⏭️', 'Pasar sin llegar al mínimo', '-10 s']],
    consejos: ['Se aceptan apellidos y pequeñas erratas.']
  },
  'quiensoy': {
    objetivo: 'La máquina piensa en un **famoso** de la lista: adivínalo con preguntas de sí o no. Tienes **3 minutos**.',
    pasos: [
      'Haz preguntas de **sí o no**: cada una cuesta 4 segundos.',
      'Los famosos que ya no encajan **se tachan solos**.',
      'Cuando lo tengas, **tócalo**.'
    ],
    puntos: [['✅', 'Acierto', '+8 s y sale otro'], ['❌', 'Fallo', '-15 s'], ['❓', 'Cada pregunta', '-4 s']],
    consejos: ['Pregunta bien: ¡con pocas preguntas puedes descartar a la mitad!']
  },
  'onceperdido': {
    objetivo: 'Completa **5 alineaciones históricas** con 4 titulares ocultos cada una.',
    pasos: [
      'De cada oculto solo ves su **dorsal** y su **puesto**.',
      'Escribe sus nombres en cualquier orden: vale el apellido y se perdonan pequeñas erratas.',
      'Tienes **90 segundos** por alineación.'
    ],
    secciones: [{ icono: '💡', titulo: 'Pistas', color: 'cian', items: ['Toca un hueco y pide pista: la primera dice su **club o país** y la segunda **un dato**.'] }],
    puntos: [['✅', 'Cada hueco acertado', '+3'], ['💡', 'Cada pista', '-1 (mínimo 1)']]
  },
  'conexion': {
    objetivo: 'Une a dos futbolistas con una **cadena de compañeros** de equipo.',
    pasos: [
      'Escribe un jugador que haya coincidido con el último de la cadena (en un club o como titulares en un partido histórico).',
      'Cuando el último de tu cadena haya jugado con el **destino**, ¡la cadena se cierra sola!',
      'Hay **5 retos**: los dos primeros se cierran con un jugador en medio y los demás con dos.'
    ],
    puntos: [['🔗', 'Cada reto', 'hasta +5'], ['➖', 'Eslabones de más, fallos y pista', 'Restan'], ['🏳️', 'Rendirse', '0']],
    consejos: ['Solo valen las coincidencias de los datos del juego: los grandes partidos y trayectorias de la web y las plantillas de 2025/26.']
  },
  'duelofutbol': {
    objetivo: 'Elige entre dos futbolistas según la pregunta y aguanta la **racha** más larga.',
    pasos: [
      'Salen dos futbolistas y una pregunta: ¿quién ha jugado en más clubes?, ¿quién debutó antes?, ¿quién es mayor?, ¿quién vale más?…',
      'Toca al que creas. Tienes **10 segundos**.',
      'Los duelos se van **igualando**. El primer fallo acaba la partida.'
    ],
    puntos: [['🔥', 'Cada acierto', '+1 a la racha']],
    consejos: ['Edad, media y valor son los de la temporada 2025/26 de «Director Deportivo».']
  },
  'manager': {
    objetivo: 'Con **220 M€**, ficha un once y gana todos los puntos posibles en una liga de 38 jornadas.',
    pasos: [
      'Ficha **1 portero, 4 defensas, 3 medios y 3 delanteros**.',
      'Hay **3 mercados** con 12 ofertas: ves nombre, puesto, edad, club y precio… pero **no su media**. Ahí entra tu ojo de ojeador.',
      'Si te falta algún puesto, lo cubre un canterano (media 60).',
      'Se juega una liga de **20 equipos** a 38 jornadas.'
    ],
    puntos: [['🏟️', 'Tu puntuación', 'Los puntos de liga']],
    consejos: ['Los jóvenes con potencial rinden algo más y los veteranos, algo menos.']
  },
  'misterioso': {
    objetivo: 'Adivina el **futbolista misterioso** (2025/26, media 83 o más) en 8 intentos.',
    pasos: ['Escribe cualquier futbolista y verás cuánto se parece al misterioso.', 'Son **3 misterios** por partida.'],
    secciones: [{ icono: '🔎', titulo: 'Las pistas', color: 'verde', tabla: [['🟩', '**Igual**'], ['🟨', '**Cerca**: mismo continente, o edad/media a 2 o menos'], ['⬜', '**Distinto**'], ['⬆️', 'Las **flechas** dicen si el misterioso tiene más o menos edad y media']] }],
    puntos: [['🕵️', 'Cada misterio', '+9 − intentos gastados']]
  },
  'patata': {
    objetivo: 'Quítate de encima la **bomba** jugando cartas… antes de que se acabe la mecha secreta.',
    pasos: [
      'La bomba tiene una **mecha secreta** (entre 20 y 50 segundos) y pasa de mano en mano.',
      'Tienes **5 cartas**: números del 1 al 12 en cuatro colores y cartas especiales.',
      'Para pasar la bomba cumple la condición: **superar la cifra** anterior (con una carta o dos del mismo color sumadas), jugar el **color pedido** o, si está libre, lo que quieras.',
      'Lo que juegas marca la condición del siguiente: si sumas 15, tendrá que superar 15.',
      'Si no puedes (o no quieres) jugar, **roba** una carta… pero el tiempo sigue corriendo.'
    ],
    secciones: [{ icono: '🃏', titulo: 'Especiales (se pueden jugar siempre)', color: 'violeta', tabla: [['🔄', '**Invertir** el sentido'], ['⏭️', '**Saltar** al siguiente'], ['🎯', '**Pasarla** a quien quieras'], ['🌶️', '**Calentar**: +4 a la cifra'], ['🧊', '**Enfriar**: vale cualquier carta'], ['🎨', '**Elegir color**']] }],
    puntos: [['💥', 'Tener la bomba cuando explota', 'Pierdes una vida']],
    gana: 'El **último** que siga en pie.'
  },
  'subasta': {
    objetivo: 'Puja a ciegas por **lotes misteriosos**: pueden ser un tesoro, un trasto o una maldición.',
    pasos: [
      'Todos empezáis con **100 monedas**. Cada ronda sale un lote con una **tasación** orientativa (que puede engañar).',
      'Algunos reciben en secreto el **soplo** de su experto sobre ese lote.',
      'Todos pujáis **a la vez y en secreto**: la más alta se lleva el lote y lo paga.',
      'Si hay **empate** arriba, nadie se lo lleva y los empatados pagan la mitad.'
    ],
    secciones: [{ icono: '📦', titulo: 'Qué puede haber en un lote', color: 'naranja', tabla: [['💰', '**Tesoro**: vale monedas'], ['🗑️', '**Trasto**: no vale casi nada'], ['💀', '**Maldición**'], ['🦹', '**Ladrón**'], ['✨', '**Varita duplicadora**'], ['🔍', '**Lupa**'], ['💸', '**Garantía**'], ['🎁', '**Regalo para todos**']] }],
    notasPuntos: ['Los efectos se aplican al momento; el valor de tesoros y trastos solo lo conoce quien los gana… hasta el final.'],
    gana: 'Al final se abren todos los lotes: gana quien sume más **monedas + valor** de sus objetos.'
  },
  'dragon': {
    objetivo: 'Explorad juntos una mazmorra llena de tesoros. Tras cada sala: **¿sigues o vuelves** con tu botín?',
    pasos: [
      'Entráis todos. En cada sala hay un **tesoro** que se reparte a partes iguales entre los que siguen dentro; lo que sobra se queda en el suelo.',
      'Tras cada sala, todos decidís **a la vez y en secreto**: seguir explorando o volver.',
      'Los que vuelven guardan su mochila en el **cofre** (ya no se puede perder) y se reparten lo del suelo. Si vuelve uno solo, se lleva también las **reliquias** 🏺.'
    ],
    secciones: [{ icono: '🐉', titulo: 'El dragón', color: 'rojo', items: ['Cada sala nueva aumenta la probabilidad de que aparezca (la veis en pantalla).', 'Si aparece, los que siguen dentro **pierden toda su mochila** de esa expedición.'] }],
    gana: 'Tras todas las expediciones, quien tenga **más oro en el cofre**.'
  },
  'piramides': {
    objetivo: 'Adivina las **categorías secretas** de los demás para eliminarlos… y sé el último en pie.',
    pasos: [
      'Cada uno recibe una **categoría secreta** sobre futbolistas (de un banco de 240): «Ha ganado la Champions», «Es zurdo»… Puedes consultar la tuya cuando quieras.',
      'En tu turno, primero decides si intentas **adivinar la categoría** de un rival (un intento por rival en toda la partida).',
      'Después, cada rival te dice en voz alta un **futbolista**. Tú lo apuntas y dices, honradamente, si encaja ✅ o no ❌ en tu categoría. Todo queda en tu pirámide, a la vista.',
      'Cuando todos te han dicho su futbolista, pasa el turno.'
    ],
    puntos: [['🎯', 'Adivinar la categoría de un rival', '+2 y queda eliminado'], ['❌', 'Fallar el intento', '-1'], ['🏆', 'Puesto final', '2 × jugadores, y uno menos por puesto']],
    notasPuntos: ['Si aciertas, puedes seguir intentándolo con otro rival. Si fallas, todos verán que no es esa.', 'Si se acaban las vueltas, los que siguen vivos comparten el primer puesto.'],
    gana: 'Quien más puntos tenga al final.'
  },
  'transmision': {
    objetivo: 'Vuestra nave se cae a pedazos: **coordinaos** para reparar las averías y aguantad hasta enviar la última transmisión.',
    chips: ['🤝 Cooperativo'],
    pasos: [
      'Cada uno controla una o dos **secciones** (motores, oxígeno, navegación…), con tres palancas, un dial del 0 al 9 y un botón de color.',
      'Van saltando **averías**: todos veis qué falla y dónde, pero el **manual** con la solución («dial al 7, palanca B arriba…») lo tiene otro, y nadie sabe quién.',
      '**Hablad**: quien tiene el manual lo lee en voz alta y el dueño de la sección lo ejecuta.',
      'En cuanto el panel cumple el manual, la avería queda **reparada**.'
    ],
    secciones: [{ icono: '🛰️', titulo: 'El casco', color: 'rojo', items: ['Cada avería tiene su **cuenta atrás**: si se acaba, el casco pierde un punto.', 'Con el casco a **cero**, la nave se pierde.'] }],
    gana: 'Si aguantáis hasta que acabe el tiempo, la transmisión llega a la Tierra y **ganáis todos**.'
  },
  'cuatrocuatros': {
    objetivo: 'Dados de **farol**: apuesta cuántos dados de un valor hay en toda la mesa… viendo solo los tuyos.',
    pasos: [
      'Cada uno tira en secreto sus dados (**5** por defecto).',
      'Por turnos se apuesta cuántos dados de un valor hay en **toda la mesa**: «al menos cuatro cuatros». Los **unos son comodines**.',
      'El siguiente **sube** la apuesta (más cantidad, o la misma de un valor más alto) o **canta**.',
      'A unos se pasa con la mitad de la cantidad (redondeando hacia arriba); de unos a otro valor, con el doble más uno.'
    ],
    secciones: [{ icono: '📣', titulo: 'Cantar', color: 'rojo', tabla: [['🤥', '**«¡Mentiroso!»**: si hay menos de lo apostado, pierde un dado quien apostó; si hay lo apostado o más, quien dudó'], ['🎯', '**«¡Exacto!»**: si hay justo lo apostado, recuperas un dado; si no, pierdes uno']] }],
    notasPuntos: ['Quien pierde un dado empieza la ronda siguiente. Sin dados, quedas eliminado.'],
    gana: 'El **último** que conserve dados.'
  },
  'garabato': {
    objetivo: 'El teléfono escacharrado con **dibujos**: de la frase original al desastre final.',
    pasos: [
      'Cada uno empieza una cadena escribiendo una **frase absurda** (o pide una idea).',
      'La frase pasa a otro, que la **dibuja**. Ese dibujo pasa a otro, que lo **describe** sin ver la frase. Y así: frase, dibujo, frase, dibujo…',
      'Cada uno solo ve **lo último** de la cadena que le toca.',
      'Al final se destapan las cadenas **paso a paso**.'
    ],
    secciones: [{ icono: '📱', titulo: 'Modos', color: 'cian', items: ['**Online**: todos juegan a la vez y con reloj.', '**Un móvil**: cada uno hace su parte en secreto y lo pasa.'] }],
    puntos: [['🎨', 'Cada voto al mejor dibujo', '+3'], ['✍️', 'Cada voto a la mejor frase', '+2'], ['🎯', 'Describir con una palabra de la frase original', '+1']]
  },
  'torre': {
    objetivo: 'Construid una **torre** pieza a pieza en 3D… y que no sea tu pieza la que la derribe.',
    pasos: [
      'Por turnos, cada uno recibe una **pieza**: cubo, viga, losa, cilindro, cuña, cruz, rueda…',
      '**Muévela** arrastrando el dedo por el recuadro, **gírala** (⟲ ⟳) o túmbala, y suéltala encima de la torre. La línea amarilla marca dónde caerá.',
      'La física es real: las piezas pesan, resbalan y ruedan.',
      'Las piezas son cada vez más **pequeñas y raras**. Online tienes **40 segundos** por turno; si se acaba, tu pieza cae en el centro tal cual.'
    ],
    secciones: [{ icono: '💥', titulo: 'Derribo', color: 'rojo', texto: 'Si alguna pieza cae de la plataforma, quien soltó la **última** ha derribado la torre. Se vuelve a empezar desde cero.' }],
    puntos: [['🧱', 'Cuando otro derriba la torre', '+1 los demás']],
    gana: 'Quien más puntos tenga al acabar las rondas.'
  },
  'minigolf': {
    objetivo: 'Minigolf en 3D: termina el recorrido con **menos golpes** que nadie.',
    pasos: [
      'Para golpear, **arrastra el dedo hacia atrás** desde cualquier punto (como un tirachinas) y suelta: cuanto más arrastres, más fuerte.',
      'Con ⟲ ⟳ giras la cámara y con 🗺️ ves el hoyo entero desde arriba.',
      'Cada partida elige **6, 9 o 18 hoyos** de dificultad creciente (de 200 originales); el último siempre es de los más difíciles.'
    ],
    secciones: [
      { icono: '⛳', titulo: 'Obstáculos', color: 'verde', items: ['Molinos, bloques móviles, **arena** (frena), **turbos**, puentes sin barandilla, agua y saltos.', 'Si la bola cae al agua o fuera, vuelve a donde estaba y **sumas un golpe**.', 'Como mucho se apuntan **10 golpes** por hoyo.'] },
      { icono: '📱', titulo: 'Modos', color: 'cian', items: ['**Online**: todos juegan el mismo hoyo a la vez y ves las bolas de los demás.', '**Un móvil**: por turnos, golpe a golpe.'] }
    ],
    gana: 'Quien termine con **menos golpes**.'
  },
  'canicas': {
    objetivo: 'Carreras de canicas al estilo kart: **3 vueltas** a circuitos con atajos, saltos, turbos y objetos. ¡El primero en meta gana!',
    pasos: [
      'Antes de cada carrera eliges **canica**. Cada una tiene su habilidad: más punta, más peso, salto, imán de objetos, atravesar rivales, turbos más largos, agarre total o un objeto gratis cada 12 segundos.',
      'La canica **acelera sola**. Pon el dedo en la mitad izquierda: aparece un **joystick**; desliza a los lados para girar y hacia abajo para frenar (o ir marcha atrás). En ordenador: flechas, espacio para derrapar y E para el objeto.',
      'Si entras muy deprisa en una curva, la canica **se va hacia fuera**: frena un poco o derrapa. Donde no hay barandilla (bordes rojos y blancos) puedes caerte.',
      'Si te caes vuelves un poco más atrás. El **minimapa** muestra a todos y los caminos alternativos (en amarillo).'
    ],
    secciones: [
      { icono: '🌀', titulo: 'Derrape y miniturbo', color: 'azul', items: ['Mantén **DERRAPE** mientras giras: la canica gira más cerrado y se desliza.', 'Cuanto más aguantes, más carga: **azul**, **naranja** y **morado**. Al soltar, miniturbo (más largo cuanto más carga).', 'Ir pegado detrás de otra canica un rato da **rebufo**: un turbo corto.'] },
      { icono: '🛤️', titulo: 'El circuito', color: 'naranja', items: ['Cada circuito tiene **caminos alternativos**: atajos estrechos sin barandilla, rutas de turbos más largas y **saltos sobre el vacío** (las rampas azules te lanzan: entra recto).', 'Las **flechas naranjas** dan turbo y las cajas ❓ dan un objeto: quien va detrás recibe objetos mejores.'] },
      { icono: '🎁', titulo: 'Objetos', color: 'violeta', tabla: [['🚀', '**Turbo** (o triple turbo)'], ['🎯', '**Misil**: persigue a quien va justo delante'], ['🛢️', '**Aceite**: quien lo pisa trompea'], ['⚡', '**Rayo**: frena a todos los de delante'], ['🛡️', '**Escudo**: para el próximo golpe'], ['🌀', '**Muelle**: gran salto'], ['⭐', '**Estrella**: invencible y más rápida']] }
    ],
    puntos: [['🏁', 'Puesto en cada carrera', '10, 8, 6, 5, 4, 3, 2, 1']],
    gana: 'Quien más puntos sume. Sin rivales a mano, juega la **práctica contra bots**.'
  },
  'habilidad': {
    objetivo: '**30 minijuegos** de habilidad en 3D de un par de minutos: gana el más hábil.',
    pasos: [
      'El anfitrión elige **cuántos** minijuegos se juegan y **cuáles**, en orden (los que no elija salen al azar).',
      'Hay 30 para elegir: reflejos, puntería, memoria, precisión, ritmo, equilibrio…',
      'Cada minijuego dura como mucho un par de minutos y antes de empezar se explica cómo se juega.',
      'Al terminar cada minijuego se ve su **clasificación**.'
    ],
    secciones: [{ icono: '📱', titulo: 'Modos', color: 'cian', items: ['**Online**: todos juegan a la vez el mismo minijuego (exactamente igual para todos).', '**Un móvil**: por turnos, el móvil pasa de mano en mano.'] }],
    puntos: [['🏁', 'Puesto en cada minijuego', '10, 8, 6, 5, 4, 3, 2, 1']],
    notasPuntos: ['Los empates comparten puesto.'],
    gana: 'Quien más puntos acumule al final.'
  },
  'vialibre': {
    objetivo: 'Gira las piezas de vía para unir las dos estaciones **antes de que salga el tren**.',
    pasos: [
      '🚂 El tren sale de la estación **verde** cuando se acaba la cuenta atrás y tiene que llegar a la **roja** (la de la bandera).',
      '**Toca una casilla** para girar su pieza. Las vías ya unidas desde la salida se ven **doradas**.',
      'Cuando la ruta esté completa, pulsa **¡Salida!** para que salga ya.'
    ],
    secciones: [{ icono: '⚠️', titulo: 'Cuidado', color: 'rojo', items: ['Hay **piezas señuelo** que no llevan a ninguna parte.', 'Desde el **nivel 4** aparecen **cruces** (no se giran).', 'Si el tren **descarrila**, se acabó.', 'Cada nivel el tablero crece o el tiempo se acorta.'] }],
    puntos: [['🚉', 'Nivel superado', '+50 + 10 × nivel'], ['⏱️', 'Cada segundo que sobre', '+5']],
    gana: '¿Hasta qué **nivel** llegarás?'
  },
  'rascacielos': {
    objetivo: 'Apila plantas **lo más alto posible**: lo que sobresale se corta y cae.',
    pasos: [
      'Cada planta entra deslizándose de un lado a otro.',
      '**Toca la pantalla** (o pulsa Espacio) para soltarla encima de la anterior.',
      'Lo que sobresale se corta: la siguiente planta será **más estrecha**. Si no toca nada, el edificio se acaba.',
      'Cada planta va un poco **más rápida**. Al subir verás el atardecer, la noche… y las estrellas.'
    ],
    puntos: [['🏢', 'Cada planta', '+1'], ['✨', 'Planta perfecta', '+2 extra'], ['🏆', 'Planta dorada clavada (cada 10)', '+5 extra']],
    notasPuntos: ['Una perfecta no pierde nada. Con **3 perfectas seguidas**, la planta vuelve a crecer.']
  },
  'letras': {
    objetivo: 'Con **7 letras** y **2 minutos**, forma todas las palabras que puedas.',
    pasos: [
      'Forma palabras de **3 a 7 letras**, usando cada letra una sola vez por palabra.',
      'Valen las formas de los verbos, los plurales y los femeninos («cantas», «rojas»). Las tildes no cuentan.',
      '🔎 Siempre hay al menos una palabra que usa **las 7 letras**. ¡Búscala!'
    ],
    puntos: [['3️⃣', '3 letras', '+1'], ['4️⃣', '4 letras', '+2'], ['5️⃣', '5 letras', '+4'], ['6️⃣', '6 letras', '+7'], ['7️⃣', '7 letras', '+12 y +10 de premio']],
    consejos: ['Con teclado: escribe, **Intro** para enviar y **Espacio** para mezclar.', 'Mezclar las letras ayuda a ver palabras nuevas.']
  },
  'palabra': {
    objetivo: 'Adivina palabras ocultas cada vez **más largas**, de 3 a 8 letras. Si fallas una, se acabó.',
    pasos: [
      'Tienes **6 intentos** por palabra y cada intento tiene que ser una palabra que exista.',
      'Empiezas con palabras de **3 letras** y cada dos aciertos son una letra más, hasta **8**. Después, palabras de 8 sin fin.',
      'Las tildes no cuentan: «raton» vale por «ratón».'
    ],
    secciones: [
      { icono: '🎨', titulo: 'Los colores', color: 'verde', tabla: [['🟩', '**Verde**: la letra está en su sitio'], ['🟨', '**Amarillo**: está en la palabra, pero en otro sitio'], ['⬜', '**Gris**: no está']] },
      { icono: '💀', titulo: 'Muerte súbita', color: 'rojo', texto: 'Si agotas los intentos de una palabra, **se acaba la partida**.' }
    ],
    puntos: [['📏', 'Cada palabra acertada', '+10 por letra'], ['⚡', 'Cada intento que te sobre', '+3 por letra']]
  }
};
