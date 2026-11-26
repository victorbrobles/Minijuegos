// client/src/ayudas/a.js — Ayudas estructuradas (1/4). Formato en ayudas/index.js.
export default {
  'siglas': {
    objetivo: 'Encadena la racha más larga escribiendo el **significado** de siglas y acrónimos (ADN, UNESCO, RAE…).',
    pasos: [
      'Elige una **categoría** temática o juega con todas mezcladas.',
      'Aparece una sigla o acrónimo en pantalla.',
      'Escribe su significado exacto **antes de que acabe el tiempo**.'
    ],
    secciones: [{ icono: '💀', titulo: 'Muerte súbita', color: 'rojo', texto: 'Un solo **fallo** o dejar que el cronómetro llegue a cero termina la partida al instante.' }],
    puntos: [['✅', 'Cada sigla acertada', '+1 a la racha'], ['❌', 'Fallo o tiempo agotado', 'Fin de la partida']],
    gana: 'Se guarda tu **racha final**: intenta superar tu récord.'
  },
  'quien-es-quien': {
    objetivo: 'Adivina **tu propio elemento** antes que nadie. Ves el de todos los demás… menos el tuyo.',
    pasos: [
      'Hay una categoría común y cada jugador tiene un elemento secreto.',
      'Por turnos, haz al grupo preguntas que solo se respondan con **«Sí»** o **«No»**.',
      'Mantén pulsada la **cubierta** de tu pantalla para ver las tarjetas de tus compañeros y responder a sus preguntas.'
    ],
    gana: 'Quien adivina su elemento **antes que el resto**.',
    consejos: ['Empieza con preguntas amplias («¿Es real?», «¿Es una persona?») para descartar mucho de golpe.']
  },
  'rapidfire': {
    objetivo: 'Enumera en voz alta todos los elementos que pide la categoría en **60 segundos**. Si no lo completas, el siguiente puede robarte los puntos.',
    pasos: [
      'Al empezar la ronda se sortean **3 categorías** y el jugador en turno elige una.',
      'Tienes **3 segundos** para prepararte y luego empieza la cuenta atrás de **60 segundos**.',
      'Di los elementos en voz alta. Si fallas o se agota el tiempo, el turno pasa por **rebote** al siguiente jugador para que complete lo que falte.'
    ],
    puntos: [['🎯', 'Reto completado', '+2 por elemento'], ['🔄', 'Completado en rebote', 'Se lleva todos los puntos'], ['🏳️', 'Rendirse o nadie lo completa', '0 puntos']]
  },
  'trayectoria': {
    objetivo: 'Descubre al **futbolista** a partir de los clubes de su carrera. Cuantos menos clubes necesites, más puntos.',
    pasos: [
      'Los clubes aparecen **uno a uno, cada 6 segundos** (no sabes cuántos tiene hasta que salen todos).',
      'Si lo sabes, pulsa **«¡Lo sé!»**: el reloj se para y tienes **20 segundos** para escribirlo.',
      'Tras el último club quedan **15 segundos**.'
    ],
    secciones: [{ icono: '💡', titulo: 'Retos difíciles', color: 'cian', texto: 'Puedes pulsar **«Desvelar pista»**: da 15 segundos más, pero acertar vale menos.' }],
    puntos: [['⚡', 'Con pocos clubes a la vista', 'hasta +5'], ['📋', 'Con todos los clubes', '+2'], ['💡', 'Con la pista', '+1'], ['❌', 'Fallo', '-1 y fuera de ese futbolista']]
  },
  'rasgos': {
    objetivo: 'Reconoce a un **famoso** a partir de un recorte con uno de sus rasgos: unos ojos, una barbilla, un peinado…',
    pasos: [
      'Cada ronda aparece un **recorte** de la foto de un famoso.',
      'El reloj corre **60 segundos**. Quien lo sepa, que pulse: el reloj se para y tiene **15 segundos** para escribir el nombre.',
      'Al acabar la ronda se ve la **foto completa**.'
    ],
    puntos: [['✅', 'Acierto', '+ los segundos que quedaban'], ['❌', 'Fallo', '- esos mismos segundos y fuera de la ronda']],
    consejos: ['Pulsar pronto da más puntos… pero fallar pronto también resta más.']
  },
  'rankings': {
    objetivo: 'Completa un **ranking real de 5 elementos** en el que faltan 2 puestos.',
    pasos: [
      'Aparece el ranking con varios puestos **ocultos**.',
      'Escribe cualquier elemento que creas que falta: se coloca solo en su puesto.',
      'Tienes **90 segundos**. Si fallas o se agota el tiempo, el turno pasa por **rebote** al siguiente.',
      'La siguiente ronda la abre el jugador posterior a quien abrió la actual.'
    ],
    secciones: [{ icono: '💡', titulo: 'Pistas', color: 'cian', items: ['Puedes pedir la **pista** de un puesto antes de responder.', 'Si alguien falla o pasa sin haber pedido la pista de un puesto, esa pista queda **bloqueada** para los rebotes.'] }],
    puntos: [['🎯', 'Acierto sin pista', '+3'], ['💡', 'Acierto con pista', '+1'], ['❌', 'Fallo o tiempo agotado', '0 (rebote)']]
  },
  'aproximacion': {
    objetivo: 'Clava la respuesta a una **pregunta numérica** o acércate lo máximo posible. Si no te atreves, confía en la cifra de otro… pero ganarás menos.',
    pasos: [
      'Cada ronda sale una pregunta sobre récords, curiosidades o los propios jugadores (**30 s**).',
      'El primer jugador dice una cifra. Los siguientes ven las anteriores y escriben **otro número** o **confían** en el de un compañero.',
      'Al cerrar la vuelta, el primer jugador tiene **30 s** para mantener su cifra o confiar en la de otro.'
    ],
    puntos: [['🎯', 'Respuesta exacta', '+15 / +8 si confías'], ['🥇', 'La más cercana', '+6 / +3 si confías'], ['⚖️', 'Intermedia: mitad de arriba / de abajo', '+1 / -1 (autor)'], ['❌', 'La más lejana', '-5 (autor) / 0']],
    notasPuntos: ['Arriesgar con tu propia cifra da más puntos, pero también resta más si te alejas.']
  },
  'ubicacion': {
    objetivo: 'Sitúa en el **mapa del mundo** un lugar o monumento que solo verás unos segundos. Cada kilómetro de error es un punto: gana quien **menos** acumule.',
    pasos: [
      'Al empezar la ronda ves la **foto** del lugar durante **10 segundos**.',
      '**Toca el mapa** para colocar tu marcador. Puedes arrastrarlo para afinar y volver a ver la foto.'
    ],
    secciones: [
      { icono: '📱', titulo: 'En un dispositivo (por turnos)', color: 'violeta', items: ['Además de tu marcador real (★) colocas **2 señuelos**.', 'El siguiente verá tus 3 marcas con «?» sin saber cuál es la buena.', 'El último jugador solo coloca la real.'] },
      { icono: '🌐', titulo: 'Online (todos a la vez)', color: 'cian', texto: 'Cada **15 segundos** un radar enseña durante 1 segundo los marcadores de los rivales que aún no han confirmado.' }
    ],
    puntos: [['📏', 'Cada ronda', '+1 por km de error'], ['⏰', 'Sin marcador a tiempo', '+20.000']],
    gana: 'Quien tenga **menos puntos** al final. ¡Como en el golf!'
  },
  'adivina': {
    objetivo: 'Adivina **películas o canciones** con el menor número de pistas posible.',
    pasos: [
      'Elegid canciones (modernas, antiguas o de todo) o películas.',
      'Cada ronda tiene **3 pistas** que se destapan solas cada **20 segundos**.',
      'Quien lo sepa, que pulse: el reloj se para y tiene **20 segundos** para escribir el título.',
      'El anfitrión (o el grupo, en un dispositivo) puede adelantar la siguiente pista o rendirse.'
    ],
    secciones: [{ icono: '🔍', titulo: 'Las pistas', color: 'cian', tabla: [['🎵', '**Canciones**: un trozo de la letra, el artista y el fragmento de audio'], ['🎬', '**Películas**: protagonistas, género y sinopsis']] }],
    puntos: [['1️⃣', 'Con 1 pista', '+10'], ['2️⃣', 'Con 2 pistas', '+5'], ['3️⃣', 'Con 3 pistas', '+3'], ['❌', 'Fallo', '0 y fuera de la ronda']]
  },
  'pistas': {
    objetivo: 'Descubre el **personaje, película, lugar o canción** secreta antes que los demás.',
    pasos: [
      'Hay **6 pistas** progresivas: se descubre una nueva cada **10 segundos**.',
      'Escribe y envía tu respuesta **cuando quieras** desde tu móvil.',
      'Los demás solo ven un ✅ de que has respondido: nadie sabe qué has puesto ni si aciertas hasta el final de la ronda.',
      'Cuando todos han respondido o se acaba la 6.ª pista, se ven la **solución** y las puntuaciones.'
    ],
    consejos: ['Responder pronto vale más… pero no hay vuelta atrás: piénsalo bien.']
  },
  'velocidad': {
    objetivo: 'Acierta todas las preguntas que puedas en tu turno de **60 segundos** mientras los demás te siguen en directo.',
    pasos: [
      'El juego **sortea** quién empieza con una cuenta atrás de 10 segundos.',
      'Cada pregunta tiene **4 opciones**. Todos ven tus preguntas y aciertos en tiempo real.',
      'A los **30 segundos** el cronómetro se pausa y aparece una **pregunta especial** abierta.'
    ],
    puntos: [['✅', 'Cada acierto', '+1'], ['⭐', 'Pregunta especial acertada', '+30 segundos extra']]
  },
  'quienmas': {
    objetivo: '«¿Quién es más…?»: vota al compañero que mejor encaje y coincide con la **mayoría**.',
    pasos: [
      'Cada ronda sale una pregunta sobre la personalidad o anécdotas de los jugadores.',
      'Vota **en secreto** a la persona que mejor encaja antes de que pasen **30 segundos**.',
      'Cuando todos votan se revelan los votos.'
    ],
    puntos: [['🎯', 'Votar al más votado', '+1'], ['⚖️', 'Empate en primera posición', '0 (nadie suma)']]
  },
  'confianzaciega': {
    objetivo: 'Apuesta cuántas respuestas será capaz de decir un compañero sobre una categoría… **sin saber cuál ha elegido**.',
    pasos: [
      'El jugador activo recibe **dos consignas** y elige una en secreto.',
      'Los demás ven ambas y apuestan un **número** y si dirá **más** o **menos** de esa cantidad.',
      'Cuando el jugador activo está listo, tiene **60 segundos** para decir en voz alta todas las respuestas válidas que pueda mientras el grupo lleva la cuenta.'
    ],
    puntos: [['🎯', 'Clavar el número exacto', '+N+5'], ['✓', 'Acertar la apuesta (más / menos)', '+ según cercanía'], ['❌', 'Fallar la apuesta', '- según lejanía']]
  },
  'lobos': {
    objetivo: 'El **pueblo** debe destapar a los lobos; los **lobos** van cazando al pueblo en secreto. ¡Descúbrelos antes de ser cazado!',
    pasos: [
      '**Reparto de roles**: cada jugador descubre su identidad en secreto. Hay tres bandos: Lobos, Pueblo y Solitarios.',
      '**Noche**: todos los vivos actúan en secreto (en su móvil o pasándose el dispositivo sin delatar quién tiene poder).',
      '**Día**: se revelan las víctimas de la noche, el pueblo debate quién miente y se vota en secreto a quién linchar.'
    ],
    secciones: [{ icono: '🐺', titulo: 'Bandos', color: 'rojo', tabla: [['🏘️', '**Pueblo**: gana si elimina a todos los lobos (y al Pirómano)'], ['🐺', '**Lobos**: ganan al igualar en número al resto de supervivientes'], ['🎭', '**Solitarios**: juegan por su cuenta']] }],
    consejos: ['Por la noche, haz como que usas el móvil aunque no tengas poder: así nadie sabrá qué papel tienes.']
  },
  'frasescelebres': {
    objetivo: '¿Quién dijo qué? Adivina el **autor** de frases célebres de la historia, la política, el deporte y el famoseo.',
    pasos: [
      'Sale una frase célebre y **cuatro posibles autores**.',
      'El reloj corre **30 segundos**. Quien lo sepa, que pulse: tiene **10 segundos** para elegir.'
    ],
    puntos: [['✅', 'Acierto', '+3'], ['❌', 'Fallo', '-1 y fuera de esa frase']]
  },
  'conecta': {
    objetivo: 'Encuentra las **4 conexiones** ocultas entre los 16 elementos del tablero (de 4 en 4) y descubre qué las une.',
    pasos: [
      'Se sortea quién empieza; después el turno pasa en orden.',
      'En tu turno pulsa **Listo**: tienes **90 segundos**.',
      'Elige 4 elementos que formen una conexión y pulsa **Comprobar**.',
      'Si aciertas, sumas puntos y puedes adivinar **qué los une** para ganar un extra.',
      'Si fallas o se acaba el tiempo, pierdes una **vida** (3 por ronda). Sin vidas, quedas eliminado.'
    ],
    secciones: [{ icono: '🏁', titulo: 'La última conexión', color: 'verde', items: ['Con 3 conexiones descubiertas, solo queda adivinar qué une a los 4 últimos.', 'Lo intenta quien tenga el turno: si acierta, termina la ronda; si falla, pasa al siguiente.', 'Si nadie la adivina, se muestran las soluciones.', 'El anfitrión (o cualquiera en un dispositivo) puede terminar la ronda cuando quiera.'] }],
    puntos: [['🥇', '1.ª conexión descubierta', '+5'], ['🥈', '2.ª conexión', '+3'], ['🥉', '3.ª conexión', '+1'], ['💡', 'Adivinar qué los une', '+1'], ['🏁', 'Última conexión', '+2']]
  },
  'impostor': {
    objetivo: 'Todos tenéis la misma **palabra secreta**… menos el **impostor**. Descubridlo antes de que os haga expulsar a un inocente.',
    pasos: [
      'Todos reciben la palabra secreta excepto uno: el **Impostor**.',
      'Por turnos, dad **pistas** sin ser demasiado obvios (para que el impostor no adivine la palabra).',
      'Debatid y **votad** a quién expulsar.'
    ],
    secciones: [{ icono: '🎭', titulo: 'Modos de juego', color: 'violeta', tabla: [['🙈', '**Clásico**: el impostor va a ciegas'], ['💡', '**Con pista**: el impostor recibe una pista'], ['🦎', '**Camuflado**: el impostor tiene una palabra parecida'], ['❓', '**Preguntas**: turnos de preguntas de Sí/No']] }],
    puntos: [['🎭', 'Gana el impostor', '+10 (+3 por ronda)'], ['👥', 'Gana el pueblo', '+3 cada inocente']]
  },
  'colores': {
    objetivo: 'Adivina **qué colores** tiene algo que todo el mundo conoce: un logotipo, una bandera, un personaje…',
    pasos: [
      'Cada ronda aparece el elemento y **cuántos colores** tiene.',
      'Elígelos entre los **11 de la paleta**: rojo, azul, amarillo, verde, naranja, morado, marrón, blanco, negro, gris y rosa.',
      'Tienes **45 segundos**. Si se acaba el tiempo, cuenta lo que lleves elegido.'
    ],
    secciones: [{ icono: '📱', titulo: 'Modos', color: 'cian', items: ['**Online**: todos responden a la vez.', '**Un dispositivo**: os pasáis el móvil en secreto.', 'Partidas de 10, 15 o 20 rondas.'] }],
    puntos: [['🎨', 'Cada color acertado', '+1'], ['🌈', 'Todos los colores', '¡Pleno!']],
    gana: 'Quien más puntos tenga al final.'
  },
  'buscaminas': {
    objetivo: 'Elige respuestas correctas del tablero sin pisar ninguna **bomba**.',
    pasos: [
      'El tablero tiene **15 casillas**: 10 respuestas correctas y **5 bombas**.',
      'Por turnos, tienes **30 segundos** para elegir una casilla que cumpla la consigna (o pierdes el turno).',
      'Si pisas una bomba, quedas **eliminado** el resto de la ronda.'
    ],
    puntos: [['🟢', 'Elemento fácil', '+1'], ['🟡', 'Elemento medio', '+2'], ['🟣', 'Elemento difícil', '+3'], ['💣', 'Bomba', 'Eliminado de la ronda']]
  },
  'popular': {
    objetivo: 'Adivina las **5 respuestas más populares** de la gente sobre situaciones cotidianas. Las menos obvias valen más.',
    pasos: [
      'Cada ronda se plantea una situación cotidiana.',
      'Por turnos, tienes **45 segundos** para escribir una idea que creas que está en el Top 5.',
      'Todas las respuestas son de **una o dos palabras**: escribe la palabra o un sinónimo (se perdonan las faltas pequeñas).'
    ],
    secciones: [{ icono: '💡', titulo: 'Pistas (-1 punto)', color: 'cian', items: ['**💡 Pista** en una fila oculta: muestra los huecos de letras.', '**🔤 +Letras**: revela las letras iniciales.'] }],
    puntos: [['🥇', 'Puestos #1 y #2', '+2 / +4'], ['🥈', 'Puestos #3 y #4', '+6 / +8'], ['🏆', 'Puesto #5 (el menos obvio)', '+10']],
    consejos: ['Intenta ir primero a por las respuestas menos obvias: valen mucho más.']
  },
  'masmenos': {
    objetivo: 'Entre dos elementos con su cifra oculta, elige el que tenga **más**. Encadena aciertos y supera tu récord.',
    pasos: [
      'Elegid una categoría (o al azar). Cada jugador juega su turno.',
      'Salen dos elementos con su cifra oculta (población, taquilla, altura…). Toca el que tenga más: tienes **30 segundos**.',
      'Si aciertas, se revelan las cifras, sale el elemento que más tiempo llevaba y entra otro.',
      'Tu racha sigue hasta el **primer fallo**. Nunca salen dos cifras casi iguales.'
    ],
    gana: 'Quien consiga la **racha más larga**.'
  },
  'cancion': {
    objetivo: 'Reconoce la **canción** lo antes posible: empieza casi en silencio y va subiendo de volumen.',
    pasos: [
      'Suena un fragmento de **30 segundos** que va subiendo de volumen.',
      'Cuando la reconozcas, pulsa **«¡La sé!»**: se para y tienes **20 segundos** para escribir el título.',
      'Si fallas, quedas fuera de esa canción y sigue sonando para el resto (rebote).',
      'Si se acaba el fragmento y nadie la sabe, se revela la solución.'
    ],
    secciones: [{ icono: '📱', titulo: 'Modos', color: 'cian', items: ['**Online**: todos escucháis la misma canción a la vez en vuestro móvil.', '**Un dispositivo**: quien la sepa pulsa y elige su nombre.'] }],
    puntos: [['⚡', 'Acierto', '+10 a +3 (cuanto antes, más)'], ['❌', 'Fallo', '-3 (nunca baja de 0)']]
  },
  'ciegas': {
    objetivo: 'Ordena un **Top 5** colocando los elementos según salen… sin saber qué viene después.',
    pasos: [
      'El jugador activo recibe **5 elementos de uno en uno**.',
      'Cada elemento va a un puesto libre del 1.º al 5.º y **no se puede mover** después.',
      'Los demás ven el Top 5 final y lo **votan** de 0 a 5.',
      'En la siguiente ronda arma el Top el siguiente jugador.'
    ],
    puntos: [['🎯', 'Quien arma el Top 5', '+ los puntos que le dé el grupo']],
    consejos: ['No te apresures: guarda algún hueco alto por si sale algo mejor.']
  },
  'traiciones': {
    objetivo: 'Una caravana cruza el desierto: los **leales** completan tareas para llegar al Oasis; los **traidores** sabotean y eliminan sin ser descubiertos.',
    chips: ['📱 Cada uno en su móvil', '⏱️ En tiempo real'],
    pasos: [
      'La partida corre en tiempo real hasta que alguien **reporta un cuerpo** o toca la **campana**.',
      'Muévete por el campamento, cumple tu papel y vigila a los demás.',
      'En las **asambleas**, debatid y votad a quién expulsar.'
    ],
    secciones: [
      { icono: '🗺️', titulo: 'El campamento', color: 'naranja', items: ['Nueve lugares: la **Hoguera** en el centro y cuatro alas (norte, este, sur y oeste) de dos salas. Los fondos de alas vecinas se comunican formando un anillo.', 'Solo puedes ir a una sala **contigua** (4 s de camino; mientras caminas nadie te ve).', 'Solo ves a quien está en tu mismo lugar y quién entra o sale. Nadie sabe quién sigue vivo hasta que aparece un cuerpo o hay asamblea.', 'Desde la **Atalaya** ves cuánta gente hay en cada lugar (sin nombres).'] },
      { icono: '🧭', titulo: 'Viajeros (leales)', color: 'azul', items: ['Tienes **7 tareas** repartidas por el campamento: puntería, memoria, cálculo, pulso… Si te mueves, pierdes lo avanzado.', 'Si ves un cuerpo, **repórtalo**. Si sospechas de alguien, toca la **campana** (una vez por partida).', 'Ganáis si se completan **todas las tareas** o si expulsáis a todos los traidores.'] },
      { icono: '🗡️', titulo: 'Traidores', color: 'rojo', items: ['Solo podéis eliminar a alguien que esté **a solas** con vosotros, y hay que esperar entre muerte y muerte.', 'Cada muerte da un **atajo**: un salto rápido a una sala lejana (se pierde en la siguiente asamblea).', 'Sabotajes: **tormenta de arena** (25 s sin ver caras) e **incendio** (hay que apagar dos lugares antes de 45 s; mientras arde no se puede trabajar ni tocar la campana).', 'Ganáis al ser **tantos como los demás** vivos, o si el campamento arde.'] },
      { icono: '🔔', titulo: 'Asamblea', color: 'violeta', items: ['Todos vuelven a la Hoguera, debaten (chat o voz) y votan.', 'Se expulsa a quien más votos tenga si supera a los votos en blanco; con empate no sale nadie.', 'Los votos son públicos y se revela el papel del expulsado.'] },
      { icono: '🎭', titulo: 'Papeles especiales (opcionales)', color: 'rosa', tabla: [['👁️', '**Vigía** (5+): una vez por partida ve en directo quién hay en cualquier lugar'], ['🛡️', '**Protegido** (6+): sobrevive al primer ataque y descubre quién fue'], ['🃏', '**Bufón** (7+): gana él solo si la caravana lo expulsa']] },
      { icono: '👻', titulo: 'Eliminados', color: 'cian', texto: 'Son **espíritus**: lo ven todo y pueden seguir con sus tareas, pero no hablan.' }
    ],
    puntos: [['🧭', 'Leales ganan', '+3 (+1 si siguen vivos)'], ['🗡️', 'Traidores ganan', '+5 (+1 por víctima)'], ['🃏', 'Bufón expulsado', '+7']]
  },
  'coleccion': {
    objetivo: 'Reúne en tu **vitrina** la colección de tu encargo secreto antes que nadie. Puede que otro vaya a por lo mismo… sin que lo sepas.',
    pasos: [
      'Recibes un **encargo secreto** (por ejemplo, 4 dinosaurios, 2 planetas y 2 piratas, o 5 palos distintos).',
      'En tu turno **robas 2 cartas**.',
      'Tienes **2 jugadas**: poner una carta en tu vitrina (máx. 6), devolver una de la vitrina a la mano o jugar una carta de acción.',
      'Al terminar, no puedes tener más de **7 cartas** en la mano.'
    ],
    secciones: [
      { icono: '🃏', titulo: 'Cartas de acción', color: 'violeta', tabla: [
        ['🦝', '**Mapache**: roba una carta de la vitrina de otro y llévatela a tu mano'],
        ['💣', '**Bomba**: destruye una carta de la vitrina de otro'],
        ['🔄', '**Trueque**: cambia una carta de tu vitrina por una de otro'],
        ['🎁', '**Regalo envenenado**: pon una carta de tu mano en la vitrina de otro'],
        ['❄️', '**Congelar**: ese jugador se salta su próximo turno'],
        ['🔍', '**Espía**: mira en secreto el encargo de otro'],
        ['🎭', '**Cambiazo**: intercambia tu encargo con el de otro (a ciegas)'],
        ['📜', '**Nuevo encargo**: descarta el tuyo y roba otro'],
        ['🧲', '**Imán**: elige un palo; cada rival que tenga alguno en su vitrina te da uno'],
        ['🎲', '**Doble o nada**: di un palo y destapa 3 cartas; si sale, te quedas las 3; si no, pierdes una de tu vitrina'],
        ['🗑️', '**Rebuscar**: coge la carta que quieras de los descartes'],
        ['🌪️', '**Tornado**: todos pasan su mano entera al de su izquierda'],
        ['⚡', '**Turbo**: este turno tienes 2 jugadas más'],
        ['🛡️', '**Escudo**: no se juega; si te atacan, se gasta solo y anula la acción']
      ] },
      { icono: '🗂️', titulo: 'Palos', color: 'cian', texto: '🦖 Dinosaurios · 🪐 Planetas · 🏴‍☠️ Piratas · 🍬 Dulces · 🎸 Música · 🐞 Bichos · 🌟 **Comodín** (vale por cualquier palo)' }
    ],
    gana: 'En cuanto tu vitrina **cumple tu encargo**, ganas… aunque sea por culpa de otro.'
  },
  'unoadiez': {
    objetivo: 'Adivina un **número secreto del 1 al 10** a partir de los ejemplos que ponen tus compañeros.',
    pasos: [
      'Por turnos, cada jugador intenta adivinar un número secreto.',
      'Otro jugador ve el número y una **categoría** (series, frutas, futbolistas…) y pone un ejemplo que para él sea ese número: **1** lo que menos le gusta, **10** lo que más.',
      'Quien adivina dice un número o pide **otra pista** (otra persona y otra categoría), hasta 5 pistas.'
    ],
    puntos: [['🎯', 'Lo clavas', '+ pistas usadas'], ['↔️', 'A uno de distancia', '+ pistas + 1'], ['❌', 'Más lejos', '+ pistas + 10']],
    gana: 'Quien **menos puntos** tenga (puntuación de golf).'
  },
  'fundadores': {
    objetivo: 'Levanta el **mejor pueblo** con monedas y planos. Cada ronda eliges en secreto un oficio: cobrar, sabotear, construir más o llevarte la prioridad.',
    pasos: [
      'Empiezas con **2 monedas y 4 planos**.',
      'Cada ronda se retiran al azar algunos de los 10 oficios: quedan **tantos como jugadores** (los retirados se ven).',
      'Por orden, empezando por quien tiene el sello 👑, cada uno elige un **oficio en secreto**.',
      'Los oficios se llaman por número (1 → 10). Al llamarte se descubre tu oficio y juegas: **cobrar** (2 monedas, o robar 2 planos y quedarte 1), usar la **habilidad** de tu oficio (opcional) y **construir** un edificio pagando su coste (no puedes repetir).',
      'Cuando alguien completa su pueblo (**6, 7 u 8 edificios** según la duración) se acaba esa ronda.'
    ],
    secciones: [
      { icono: '📜', titulo: 'Los oficios', color: 'violeta', tabla: [
        ['1', '**Saboteadora**: nombra un oficio; quien lo tenga pierde su turno'],
        ['2', '**Cobrador**: nombra un oficio (no el saboteado); su dueño te da la mitad de sus monedas'],
        ['3', '**Cartógrafa**: roba 3 planos y quédate 2'],
        ['4', '**Heraldo**: te llevas el sello (eliges primero la próxima ronda) y cobras 1 por edificio Noble'],
        ['5', '**Guardiana**: el Capitán no puede derribar tus edificios; cobras 1 por Templo'],
        ['6', '**Mercader**: 1 moneda extra y 1 más por edificio de Comercio'],
        ['7', '**Maestra de obras**: roba 2 planos y construye hasta 3 edificios'],
        ['8', '**Capitán**: 1 por Guardia; puedes derribar un edificio ajeno pagando su coste −1 (no a pueblos completos ni protegidos)'],
        ['9', '**Prestamista**: 1 moneda por cada jugador con más edificios que tú (mínimo 2)'],
        ['10', '**Alcaldesa**: una medalla (+2 al final) y los Singulares te cuestan 2 menos']
      ] },
      { icono: '🏠', titulo: 'Edificios', color: 'naranja', items: ['**Noble, Templo, Comercio y Guardia**: cuestan lo que valen; hay oficios que cobran por ellos.', '**Singulares** (uno de cada): dan ventajas especiales.'] },
      { icono: '✨', titulo: 'Edificios singulares', color: 'cian', tabla: [
        ['📚', '**Archivo Real (5)**: al tomar planos te quedas uno más'],
        ['🗼', '**Atalaya (4)**: al tomar planos robas uno más para elegir'],
        ['🧱', '**Gremio de canteros (5)**: puedes construir repetidos'],
        ['🔐', '**Caja fuerte (4)**: al final, 1 punto cada 2 monedas'],
        ['🪵', '**Empalizada (4)**: el Capitán no puede derribarte'],
        ['⛲', '**Plaza mayor (3)**: cuenta como el tipo que te falte'],
        ['🖨️', '**Imprenta (4)**: una vez por turno, paga 1 y roba 1 plano'],
        ['🧺', '**Mercado de abastos (3)**: una vez por turno, descarta 1 plano y cobra 2'],
        ['⚓', '**Puerto (5)**: +1 por cada edificio de Comercio'],
        ['⛪', '**Catedral (6)**: vale 8 puntos'],
        ['💧', '**Fuente de la plaza (5)**: +1 por cada otro Singular'],
        ['🛏️', '**Posada (3)**: si eliges oficio el último, cobras 2']
      ] }
    ],
    puntos: [['🏠', 'Tus edificios', '+ su valor'], ['🌈', 'Los 5 tipos', '+3'], ['🥇', 'Primero en completar', '+3'], ['✅', 'Otros que completan', '+2'], ['🪙', 'Cada 3 monedas sobrantes', '+1'], ['🏅', 'Cada medalla', '+2']],
    gana: 'Quien tenga **más puntos**. Si hay empate, quien tenga más monedas.'
  },
  'telepatia': {
    objetivo: 'Di la primera palabra que te sugiera otra y **coincide** con algún compañero. Las rachas multiplican los puntos.',
    pasos: [
      'Cada ronda aparece una **palabra base** (online tenéis 5 segundos para escribir vuestra asociación).',
      'Si **2 o más** jugadores dicen exactamente la misma palabra, ¡conectan mentes y suman!',
      'La palabra coincidente pasa a ser la base de la siguiente ronda (10, 15 o 20 rondas).'
    ],
    puntos: [['⚡', '1.ª coincidencia', '+1'], ['🔥', 'Racha (2.ª, 3.ª…)', '+2, +3…'], ['💔', 'Sin coincidir', '0 (racha a 0)']]
  },
  'descarte': {
    objetivo: 'Di palabras que empiecen por las **letras que quedan** en el tablero. Las letras difíciles valen más.',
    pasos: [
      'El **retador** elige a un rival (que no haya jugado en esta vuelta) y una de **tres categorías**.',
      'El rival pulsa «listo», ve la categoría y tiene **30 segundos** para decir en voz alta una palabra que empiece por una letra del tablero.',
      'Puede acertar, fallar o **pasar** (cuenta como fallo). Después, el rival pasa a ser el nuevo retador.',
      'Si la palabra vale, su letra se **elimina** del tablero.'
    ],
    secciones: [{ icono: '📱', titulo: 'Online', color: 'cian', texto: 'El retado toca la letra en su móvil y el **anfitrión** decide si es correcta (si el retado es el anfitrión, decide el retador).' }],
    puntos: [['🅰️', 'A B C D E L M P R S T', '+1'], ['🅱️', 'F G H I N O U V', '+2'], ['🔠', 'J K Q W X Y Z', '+3']],
    gana: 'Un tablero acaba cuando no quedan letras o todos fallan seguidos. Gana quien más puntos tenga tras el **último tablero**.'
  },
  'bingoball': {
    objetivo: 'Un bingo de **futbolistas**: coloca a cada uno en una categoría de tu cartón y complétalo antes que nadie.',
    pasos: [
      'Cada jugador recibe un **cartón** con 12 categorías (4 filas de 3).',
      'Cada **15 segundos** sale un futbolista. Si encaja en una casilla abierta, **tócala** (una por futbolista).',
      'Con una fila completa aparece **«Cantar línea»**: el bingo se para mientras decides. Si la cantas, esa fila cambia por 3 categorías nuevas. Solo vale la **primera** línea.',
      'Quien completa el cartón canta **bingo** y termina la partida.'
    ],
    puntos: [['✅', 'Casilla acertada', '+2'], ['❌', 'Fallo', '-1 y sin marcar hasta el siguiente'], ['📏', 'Línea', '+5'], ['🎉', 'Bingo', '+20']],
    notasPuntos: ['Salen más los futbolistas que encajan en más casillas abiertas y los que hace más que no salen; los que no sirven a nadie ya no salen.']
  },
  'cuentas': {
    objetivo: 'Colocad entre todos vuestros números del 1 al 100 en **orden ascendente**… **sin hablar**. Gana quien se quede antes sin números.',
    pasos: [
      'Cada uno recibe unos números secretos del 1 al 100.',
      'En tu turno puedes **soltar** un número, **usar una carta de acción** o **pasar**.',
      'Si sueltas uno que no tocaba (había otro más bajo en alguna mano), pierdes una **vida** y el número vuelve a tu mano.',
      'Si pasas **dos turnos seguidos** teniendo tú el que tocaba, también pierdes una vida.',
      'Tienes **2 vidas**: al perderlas quedas eliminado y tus números salen del juego.'
    ],
    secciones: [{ icono: '🃏', titulo: 'Cartas de acción (3 por partida, salen al azar)', color: 'violeta', tabla: [
      ['🔔', '**Chivatazo**: te dice si tu número más bajo es el siguiente'],
      ['📡', '**Radar**: cuántos números ajenos hay por debajo del tuyo más bajo'],
      ['🛡️', '**Escudo**: tu próximo fallo no quita vida'],
      ['🎁', '**Encasquetar**: das tu número más alto al siguiente jugador'],
      ['🔥', '**Quemar**: tu número más alto sale del juego'],
      ['👀', '**Espía**: ves el número más bajo de un rival al azar'],
      ['❄️', '**Congelar**: el siguiente se salta su turno'],
      ['🎲', '**Ruleta**: cambias un número al azar con un rival al azar'],
      ['📦', '**Carga pesada** (mala suerte): robas un número nuevo'],
      ['🌑', '**Apagón** (mala suerte): pierdes otra carta de acción']
    ] }],
    puntos: [['🥇', 'Primero en quedarse sin números', '+3'], ['🥈', 'Segundo', '+2'], ['🥉', 'Tercero', '+1']]
  },
  'mus': {
    objetivo: 'El clásico **por parejas** (los de enfrente): mus o no hay mus, envites a grande, chica, pares y juego, faroles y órdagos.',
    chips: ['🃏 Baraja española de 40', '👑 A 8 reyes'],
    pasos: [
      'Los **treses** valen como reyes y los **doses** como ases.',
      '**Mus**: desde la mano, cada uno dice «mus» (quiere cambiar cartas) o «no hay mus». Si los cuatro piden mus, todos se descartan y se reparte otra vez.',
      'Se juegan los **lances** en orden, y en cada uno puedes pasar, envidar (2 o más), subir, querer, no querer o echar un **órdago**.'
    ],
    secciones: [
      { icono: '🎴', titulo: 'Los lances', color: 'verde', tabla: [['⬆️', '**Grande**: gana la mano más alta'], ['⬇️', '**Chica**: gana la más baja'], ['👯', '**Pares**: pareja < medias < duples'], ['🎯', '**Juego**: 31 o más (31 la mejor, luego 32, 40, 37…)'], ['📍', '**Punto**: si nadie tiene juego, lo más cerca de 30']] },
      { icono: '💥', titulo: 'Órdago', color: 'rojo', texto: 'Si se quiere, quien gane ese lance **gana el juego** entero.' }
    ],
    puntos: [['🙅', 'Envite no querido', '+ lo que había (1 si era el primero)'], ['🤝', 'Envite querido', 'Se cobra al final, cartas arriba'], ['👯', 'Pareja / medias / duples', '+1 / +2 / +3'], ['🎯', 'Juego / juego de 31', '+2 / +3']],
    notasPuntos: ['Los empates los gana quien está más cerca de la mano.'],
    gana: 'La pareja que llega antes a los puntos.'
  }
};
