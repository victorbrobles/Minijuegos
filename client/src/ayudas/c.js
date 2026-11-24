// client/src/ayudas/c.js — Ayudas estructuradas (3/4). Formato en ayudas/index.js.
export default {
  'hipotesis': {
    objetivo: 'Solo conoces un trocito de la **verdad oculta**. Formula una hipótesis (cierta o de farol) y decide en cuáles de los demás confías.',
    pasos: [
      '**La verdad**: hay una fila de casillas ocultas (tubos, cartas, casas o dígitos). Tú solo ves unas pocas.',
      'Formula **en secreto** una hipótesis sobre la verdad. Puede ser cierta… o un farol.',
      '**Juicio**: se desvelan todas las hipótesis y decides en cada una si te fías ✅ o es mentira ❌. Marca una con ⭐ si estás seguro.',
      '**La hora de la verdad**: se descubre todo y se reparten los puntos.'
    ],
    secciones: [
      { icono: '🎲', titulo: 'Escenarios', color: 'cian', tabla: [['🧪', '**El laboratorio**: cada tubo contiene una sustancia'], ['🃏', '**La baraja**: cada carta tiene un número del 1 al 9'], ['🏘️', '**El barrio**: en cada casa vive una mascota'], ['🔐', '**La caja fuerte**: un dígito del 0 al 9 en cada posición']] },
      { icono: '🎁', titulo: 'Sorpresas de ronda', color: 'rosa', tabla: [
        ['☕', '**Ronda tranquila**: sin sorpresas'],
        ['✖️', '**Ronda doble**: todos los puntos valen el doble'],
        ['👂', '**Rumor**: una casilla se ha filtrado y todos la conocen'],
        ['🕵️', '**Hay un topo**: alguien debe mentir; +3 si engaña a la mayoría, −2 si dice la verdad'],
        ['😇', '**Ronda sincera**: una hipótesis falsa cuesta 2 puntos'],
        ['🙈', '**Juicio a ciegas**: no se sabe quién escribió cada hipótesis hasta el final'],
        ['🗣️', '**Chismorreo**: también conoces una casilla de tu vecino'],
        ['⚡', '**Relámpago**: medio tiempo para formular y juzgar']
      ] }
    ],
    puntos: [['⚖️', 'Aciertas tu juicio', '+1 (+2 con ⭐)'], ['⭐', 'Fallas con ⭐', '-1'], ['✅', 'Tu hipótesis cierta', '+1 por cada uno que la creyó'], ['🎭', 'Tu farol', '+2 por cada uno que picó'], ['🔎', 'Te pillan el farol', '-1 por cada uno'], ['🏆', 'Hipótesis más creída', '+1']]
  },
  'trescientosuno': {
    objetivo: 'Nombra futbolistas de un club para **restar** su estadística hasta llegar justo a **0**… sin pasarte.',
    pasos: [
      'Se elige un club o selección y una estadística: **goles, asistencias o partidos**.',
      'Por turnos (**60 s**), nombra futbolistas que hayan jugado en ese equipo: su cifra se resta de tu marcador.',
      'Puedes **plantarte** en cualquier turno para asegurar tu puntuación.'
    ],
    secciones: [
      { icono: '🃏', titulo: 'Comodines (4 por partida)', color: 'violeta', tabla: [['✖️', '**x2, x3 y x5**: multiplican tu resta'], ['🔍', '**Revelar**: elige entre respuestas sugeridas']] },
      { icono: '💀', titulo: 'Eliminación', color: 'rojo', items: ['Si te pasas de **0**, quedas eliminado.', 'Si nombras a un jugador con **0** en esa estadística, también.'] }
    ],
    gana: 'Quien **clave el 0** primero o quede más cerca.'
  },
  'jugadores': {
    objetivo: 'Encuentra a un futbolista que haya **coincidido con los dos** que salen en pantalla.',
    pasos: [
      'Cada ronda salen **dos futbolistas**. Busca un tercero que haya coincidido en algún club con los dos (con cada uno en un club distinto también vale). La selección no cuenta.',
      'Quien lo sepa pulsa **«¡Lo sé!»** y tiene **30 segundos** para escribirlo. Hay **120 segundos** por pareja.',
      'Si la respuesta está en nuestra lista, es acierto. Si no, decide el **anfitrión** (o el grupo, en un dispositivo).',
      'Al acabar se ven **ejemplos** de respuestas válidas.'
    ],
    puntos: [['✅', 'Acierto', '+3'], ['❌', 'Fallo', '-1 y fuera de esa pareja']]
  },
  'furbo': {
    objetivo: 'Un **quiz de fútbol** en cinco fases: vestuario, rebote, quiniela, prórroga y penaltis. Llega a la final con opciones.',
    chips: ['📱 Online: el anfitrión marca el ritmo'],
    pasos: ['Online, cada uno usa su móvil y el anfitrión marca el ritmo.', 'En un solo dispositivo, la pantalla avisa de a quién pasar el móvil cuando toca responder en secreto (sin cuenta atrás salvo en la Prórroga).'],
    tituloPasos: 'Cómo se juega',
    secciones: [
      { icono: '🧤', titulo: '1 · Vestuario: telepatía', color: 'azul', items: ['Sale una categoría muy abierta («Un jugador español que haya jugado en el Chelsea»).', 'Todos escriben a la vez un nombre en secreto: no se trata de decir el mejor, sino de **coincidir**.', '«Torres» y «Fernando Torres» cuentan como lo mismo.'] },
      { icono: '🎯', titulo: '2 · Rebote: dato exacto', color: 'verde', items: ['Una pregunta cuya respuesta es un número (un año o una cantidad).', 'Quien tiene el turno intenta **clavarlo**.', 'Si falla, rebota al siguiente, que solo dice si el dato real es **mayor o menor** (o antes o después).'] },
      { icono: '📋', titulo: '3 · Quiniela 1X2', color: 'naranja', items: ['Una pregunta con tres opciones: **1, X y 2**.', 'Todos eligen en secreto y a la vez. Vale la intuición o el descarte.'] },
      { icono: '🗣️', titulo: '4 · Prórroga: palabras prohibidas', color: 'rosa', items: ['Por turnos, uno ve una palabra y sus palabras prohibidas. Tiene **60 segundos**.', 'La describe en voz alta sin decir la palabra ni las prohibidas.', 'Puede pasar (0 puntos) y seguir con la siguiente hasta que acabe el tiempo.'] },
      { icono: '⚽', titulo: '5 · Penaltis: riesgo y recompensa', color: 'violeta', items: ['Eliges cómo lanzar **antes** de ver la pregunta: 🎯 **al centro** (fácil) o 🥅 **a la escuadra** (difícil).', 'Si fallas o se acaba el tiempo, el portero la para. Si vas perdiendo, ¡toca arriesgar!'] }
    ],
    puntos: [['🧤', 'Vestuario: coincidir con otro', '+2'], ['🎯', 'Rebote: clavar el dato / acertar el rebote', '+3 / +1'], ['📋', 'Quiniela: acertar', '+2'], ['🗣️', 'Prórroga: acertada (quien describe y quien adivina)', '+1'], ['🚫', 'Prórroga: palabra prohibida', '-1'], ['⚽', 'Penaltis: al centro / a la escuadra', '+1 / +3']]
  },
  'futbolgrid': {
    objetivo: 'Tres en raya futbolero: cada casilla exige un jugador que cumpla la categoría de su **fila** y de su **columna**.',
    pasos: [
      'Dos equipos: **Azul ✕** y **Rojo ◯**. Cada fila y columna es una categoría.',
      'Cada equipo tiene **120 segundos** por turno para elegir una casilla libre y decir un futbolista que cumpla las dos (puede cambiar de casilla sin que se pare el reloj).',
      'Si acierta, la casilla es suya. Acierte o falle, el turno pasa al otro equipo.',
      'Un futbolista **no puede repetirse** en el tablero.'
    ],
    secciones: [{ icono: '🏳️', titulo: 'Rendirse', color: 'cian', texto: 'Si nadie consigue la raya, podéis rendiros: se desvelan futbolistas válidos para cada casilla libre.' }],
    gana: 'El primero que hace **tres en raya**. Si se llena el tablero sin raya, es empate.',
    consejos: ['Vale el apellido o el nombre por el que se conoce al jugador, y se perdonan tildes y pequeñas erratas.']
  },
  'jugadas': {
    objetivo: 'Reconoce la **jugada histórica** que se recrea en una pizarra táctica, con colores y dorsales reales.',
    pasos: [
      'En la pizarra se repite **en bucle** una jugada histórica.',
      'Por turnos, cada jugador tiene **60 segundos** para escribir qué jugada es (por ejemplo, «Iniesta a Holanda» o «Maradona a Inglaterra»).',
      'Si fallas, pasas o se acaba el tiempo, hay **un único rebote** para el siguiente.',
      'Se juegan **5, 10 o 15** jugadas (lo elige el anfitrión); tras cada una se puede terminar antes.'
    ],
    puntos: [['✅', 'Acierto', '+ segundos que queden']]
  },
  'cuatroclubes': {
    objetivo: 'Di un futbolista que haya jugado en **el mayor número posible** de los cuatro clubes. ¡A por el pleno!',
    pasos: [
      'Cada ronda salen **cuatro clubes**.',
      'Por turnos, pulsa **«¡Listo!»** y tienes **90 segundos** para decir un futbolista.',
      'Si está en nuestra base, se puntúa solo. Si no, el **anfitrión** (o el grupo) marca en qué clubes jugó.',
      'No se puede repetir un futbolista ya dicho en la ronda. Al acabar se ven las **mejores respuestas** posibles.'
    ],
    puntos: [['⚽', 'Cada club en el que jugó', '+1'], ['🏆', 'Los cuatro', '¡Pleno! +4']]
  },
  'geoquiz': {
    objetivo: 'Un quiz de **geografía** por turnos: países, idiomas, capitales, ríos, banderas, monumentos, récords…',
    pasos: ['Se sortea quién empieza y luego se juega en orden.', 'Elegid uno de los cuatro **modos de juego**.'],
    tituloPasos: 'Cómo se juega',
    secciones: [{ icono: '🗺️', titulo: 'Modos de juego', color: 'verde', tabla: [['🎲', '**GeoMix**: preguntas de todas las categorías mezcladas'], ['🎓', '**Especialista**: todas de una sola categoría'], ['⏱️', '**Contrarreloj**: 60 s en tu turno para acertar todas las preguntas rápidas que puedas'], ['❤️', '**Supervivencia**: 3 vidas; cada fallo quita una. Gana el último en pie']] }],
    puntos: [['✍️', 'Respuesta única', '+2'], ['🔘', 'Test de opciones', '+1'], ['📝', 'Enumerar', '+1 por acierto'], ['🕵️', 'Pistas', '+5 a +1 según pistas'], ['↕️', 'Ordenar', '+1 por posición'], ['🔢', 'Aproximación', '+3, 2 o 1 según lo cerca']],
    consejos: [
      'No hace falta poner tildes ni mayúsculas, y se perdonan pequeñas erratas.',
      'En «Enumerar», escribe los elementos de uno en uno y pulsa **Intro** tras cada uno.',
      'En «Pistas», si fallas se descubre otra pista, pero cada pista resta un punto.',
      'En Supervivencia, enumerar cuenta como acierto con 3 elementos, ordenar con 3 posiciones y la aproximación si te desvías menos de un 10 %.'
    ]
  },
  'verdaderofalso': {
    objetivo: 'Di si cada afirmación de cultura general es **verdadera o falsa**… sin fallar ni una.',
    pasos: ['Aparecen afirmaciones una tras otra.', 'Tienes **3 segundos** para cada una y el reloj **nunca se detiene**.'],
    secciones: [{ icono: '💀', titulo: 'Muerte súbita', color: 'rojo', texto: 'Un solo **fallo**, o quedarte sin tiempo, termina la partida.' }],
    consejos: ['Muchas son **mitos populares** que casi todo el mundo cree… ¡cuidado!', 'Con teclado: **←** o **V** para verdadero, **→** o **F** para falso.']
  },
  'pecera': {
    objetivo: 'En la pecera hay 6 cosas: cinco tienen algo en común y **una no**. ¡Encuentra al intruso!',
    pasos: ['Tienes **20 segundos** por pecera.', 'Si fallas o se acaba el tiempo pierdes una **vida**. Tienes 3.'],
    puntos: [['⚡', 'Acierto', '+ más cuanto antes']],
    consejos: ['Casi siempre hay una **trampa**: algo que parece sobrar a simple vista pero sí encaja. Piensa dos veces.']
  },
  'criptohacker': {
    objetivo: 'Deduce el **código secreto** de cada servidor antes de que el rastreo te pille.',
    pasos: ['Prueba combinaciones de símbolos.', 'Las pistas te dicen cuántos aciertos hay, pero **no cuáles**: ¡dedúcelo!', 'Al hackear un servidor pasas al siguiente, más difícil.'],
    secciones: [
      { icono: '🔎', titulo: 'Las pistas', color: 'verde', tabla: [['🟩', '**Verde**: un símbolo correcto en su sitio'], ['🟨', '**Amarillo**: está en el código, pero en otra posición']] },
      { icono: '📡', titulo: 'El rastreo', color: 'rojo', items: ['Sube con cada intento y poco a poco con el tiempo. Si llega al **100 %**, te pillan.', 'El **escáner** revela un símbolo, pero dispara el rastreo un 15 %.', 'Al hackear un servidor, el rastreo baja (pero no del todo).'] }
    ]
  },
  'anomalias': {
    objetivo: 'Vigila una habitación con una cámara fija y detecta **qué ha cambiado**.',
    pasos: [
      'Observa la escena mientras dura la cuenta atrás.',
      'La señal se corta un momento y, al volver, algo habrá cambiado: un objeto que desaparece, aparece, se mueve, cambia de color, de tamaño, se inclina…',
      '**Toca el objeto** que ha cambiado antes de que acabe el tiempo. Si ha desaparecido, toca el hueco donde estaba.'
    ],
    secciones: [{ icono: '❤️', titulo: 'Vidas y niveles', color: 'rojo', texto: 'Cada nivel hay más objetos y los cambios son más sutiles. Tienes **3 vidas**.' }]
  },
  'trinchera': {
    objetivo: 'Invierno de 1914: mandas una pequeña compañía en el frente. **Llega a Navidad**.',
    pasos: [
      'Cada día llega una **situación** con dos decisiones.',
      'Debajo de cada decisión ves qué recursos se verán afectados (más grande = más efecto), pero **no si suben o bajan**.',
      'Cada **4 días** se reparte una ración extra de comida.'
    ],
    secciones: [{ icono: '🎒', titulo: 'Recursos', color: 'naranja', tabla: [['🎖️', '**Moral**'], ['🥫', '**Comida**'], ['💥', '**Munición**'], ['🩹', '**Salud**']] }],
    gana: 'Si cualquier recurso llega a **cero**, pierdes. El máximo de cada uno es 10.',
    consejos: ['Algunas decisiones tienen **consecuencias días después**…']
  },
  'ovejas': {
    objetivo: 'Una manada cruza el prado a toda velocidad: **cuenta** lo que pasa.',
    pasos: [
      'Al terminar te preguntaremos **cuántos animales** de un tipo han pasado… y no sabrás cuál hasta el final.',
      'Con cada acierto la manada es más grande y rápida: aparecen otros animales, arbustos que tapan y animales en sentido contrario.'
    ],
    secciones: [{ icono: '❤️', titulo: 'Vidas', color: 'rojo', texto: 'Si fallas pierdes una vida. Tienes **3**.' }],
    consejos: ['Cuenta todos los tipos a la vez: no sabes cuál te preguntarán.']
  },
  'segundero': {
    objetivo: 'Para el reloj **justo** en el tiempo que te piden… sin ver el contador.',
    pasos: [
      'Te diremos un tiempo, por ejemplo **7,3 segundos**.',
      'Pulsa para arrancar el reloj y vuelve a pulsar cuando creas que ha pasado justo ese tiempo.',
      'El contador **se oculta** al poco de empezar: tienes que sentir el tiempo.',
      'En cada ronda hay una **distracción** nueva: pulsos con otro ritmo, destellos, un contador mentiroso…'
    ],
    puntos: [['🎯', 'Cuanto más cerca', 'hasta +100 por ronda']],
    notasPuntos: ['Son **6 rondas**. Con teclado puedes usar la barra espaciadora.']
  },
  'encadenada': {
    objetivo: 'Llega de una palabra a otra **cambiando una sola letra** en cada paso. Cada paso tiene que ser una palabra que exista.',
    pasos: ['Ejemplo: **CASA → CAPA → COPA → COLA**.', 'Toca la letra que quieres cambiar y después la nueva letra en el teclado.', 'Los retos no se acaban y cada vez son más largos: la partida dura **hasta que te rindas**.', 'Tienes **una pista** por palabra.'],
    puntos: [['🥇', 'Oro: en el mínimo de pasos', 'Mejor'], ['🥈', 'Plata: con un paso más', 'Bien'], ['🥉', 'Bronce: con más pasos', 'Vale'], ['💡', 'La pista (te dice el siguiente cambio; una por palabra)', '-50']]
  },
  'mapamentiroso': {
    objetivo: 'Memoriza las indicaciones y toca la **casilla** donde terminas.',
    pasos: [
      'Empiezas en el lugar marcado con 📍.',
      'Lee las indicaciones (por ejemplo «2 casillas al Norte») y **memorízalas**: desaparecerán.',
      'Toca la casilla donde terminas. Tienes **15 segundos**.'
    ],
    secciones: [{ icono: '🧭', titulo: 'Trampas', color: 'rojo', items: ['Desde el **nivel 3** la brújula está girada: el Norte es hacia donde apunte la aguja roja, no hacia arriba.', 'Desde el **nivel 5** una indicación está invertida (te diremos cuál): haz justo lo contrario.', 'Si fallas pierdes una vida. Tienes **3**.'] }]
  },
  'ordenalos': {
    objetivo: 'Ordena las cajas de la **más ligera a la más pesada** usando la balanza el menor número de veces.',
    pasos: [
      'Toca **dos cajas** para ponerlas en la balanza: verás cuál pesa más (pero no cuánto).',
      'Las pesadas quedan apuntadas.',
      'Cuando lo tengas, pulsa **Ordenar**, toca las cajas en orden y comprueba.'
    ],
    puntos: [['⭐', 'Sin pasarte de las pesadas marcadas', '⭐⭐⭐'], ['⭐', 'Con hasta 2 más', '⭐⭐'], ['⭐', 'Si te pasas más', '⭐'], ['❌', 'Orden incorrecto', 'Pierdes una vida']],
    consejos: ['Usa la lógica: si A < B y B < C, no hace falta comparar A y C.']
  },
  'excusas': {
    objetivo: 'Tu jefe te pide explicaciones por el chat: monta **excusas** creíbles y aguanta **10 días** laborables sin que te despidan.',
    pasos: [
      'Monta cada excusa eligiendo **una ficha de cada fila**: quién, qué hizo y a qué.',
      'Cualquier locura vale… mientras **no contradiga** lo que el jefe sabe de ti.',
      'Lo que sabe está en tu **ficha de empleado**, y va descubriendo cosas nuevas.'
    ],
    secciones: [{ icono: '📉', titulo: 'Credibilidad', color: 'rojo', items: ['Si sabe que no tienes perro, **no culpes a tu perro**.', 'Repetir una ficha o decir algo absurdo («mi bici ha roto mi bici») también resta.', 'Si tu credibilidad llega a **0**, te despiden.'] }]
  },
  'semaforo': {
    objetivo: 'Toca la pantalla **solo cuando se cumpla la regla**… con palabras de colores pintadas de otro color.',
    pasos: [
      'Aparecen palabras de colores pintadas de otro color (por ejemplo, VERDE en rojo).',
      'Arriba tienes la **regla**: «toca si el COLOR es rojo», «toca si la PALABRA dice AZUL», «toca si NO coinciden»…',
      'Toca solo cuando se cumpla; si no, no hagas nada.',
      'La regla **cambia cada 10 segundos**. ¡Léela bien!'
    ],
    secciones: [{ icono: '❤️', titulo: 'Vidas', color: 'rojo', texto: 'Tocar cuando no toca o dejar escapar uno bueno cuesta una vida. Tienes **3**. Cada vez va más rápido.' }],
    consejos: ['Con teclado: barra espaciadora.']
  },
  'untrazo': {
    objetivo: 'Repasa todas las líneas de la figura en **un único recorrido**, sin pasar dos veces por la misma.',
    pasos: [
      'Arrastra el dedo de punto a punto (o ve tocando los puntos uno detrás de otro).',
      'Si te atascas, toca otro punto para empezar desde ahí o pulsa **Borrar**.',
      'Algunas figuras son **imposibles**: si lo descubres, pulsa **¡Es imposible!** Si en realidad se podía, pierdes una vida.'
    ],
    secciones: [{ icono: '❤️', titulo: 'Vidas', color: 'rojo', texto: 'Si se acaba el tiempo pierdes una vida. Tienes **3**.' }],
    consejos: ['Cuenta cuántas líneas salen de cada punto. Si hay **más de dos** puntos con un número impar, es imposible. Si hay **dos**, empieza en uno de ellos.']
  },
  'escondite': {
    objetivo: 'Escóndete en una respuesta que **nadie adivine**… o encuentra dónde se ha escondido otro.',
    pasos: [
      'Sale una categoría con **pocas respuestas posibles** (de 5 a 11): los ríos más largos de España, un once histórico, los planetas…',
      'Cada ronda un jugador **se esconde**: antes de responder puede **cambiar la categoría hasta 3 veces** si no le convence.',
      'Escribe en secreto dónde se esconde y su respuesta **se da por buena tal cual**: nadie le enseña las respuestas posibles, así que tiene que conocer la categoría.',
      'Cuando se ha escondido, los demás escriben dónde creen que está.',
      'Al final de la ronda se desvelan todas las respuestas posibles.'
    ],
    secciones: [{ icono: '⏱️', titulo: 'Rondas', color: 'cian', items: ['Online hay **60 segundos** por ronda.', 'Son 2, 3 o 4 rondas por jugador: todos se esconden las mismas veces.', 'Con muchos jugadores solo salen categorías con muchas respuestas.'] }],
    puntos: [['🙈', 'Nadie te encuentra', '+1 (escondido)'], ['🔎', 'Encuentras al escondido', '+1 cada uno'], ['🚫', 'El escondido pone algo que no es de la categoría', 'él 0 · todos los demás +1']]
  }
};
