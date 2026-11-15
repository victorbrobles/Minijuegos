// client/src/ayudas/b.js — Ayudas estructuradas (2/4). Formato en ayudas/index.js.
export default {
  'reinos': {
    objetivo: 'Gobierna un reino y controla los **tronos** del mapa cumpliendo tus objetivos secretos… sin fiarte de nadie.',
    pasos: [
      'Cada uno tiene una **capital**, soldados, oro y alimento. El mapa tiene granjas (alimento), minas (oro), ciudades (de todo) y **siete tronos**.',
      'Al empezar cada ronda cobras lo que producen tus territorios. Cada **2 soldados comen 1** de alimento (si no hay, desertan).',
      'Das **2 órdenes en secreto** por ronda.',
      'Cuando todos han terminado (y respondido a las propuestas), **todo ocurre a la vez**.'
    ],
    secciones: [
      { icono: '📜', titulo: 'Órdenes', color: 'violeta', tabla: [['⚔️', '**Conquistar**: mueve soldados a un territorio vecino'], ['🛡️', '**Entrenar** tropas'], ['🧱', '**Fortificar**: +2 de defensa por nivel de muralla'], ['💰', '**Comerciar** en el mercado'], ['🤝', '**Negociar**: alianza, intercambio o romper una alianza']] },
      { icono: '⚔️', titulo: 'Batallas', color: 'rojo', items: ['Gana quien tiene **más fuerza**: soldados, y murallas si defiende.', 'Los **aliados** que atacan juntos suman fuerzas.', 'Atacar a un aliado es **traición**: rompe la alianza, todos lo ven y resta 2 puntos.'] }
    ],
    puntos: [['👑', 'Cada trono', '+3'], ['🗺️', 'Cada territorio', '+1'], ['🎯', 'Objetivo secreto cumplido', '+5'], ['🗡️', 'Traición', '-2']],
    gana: 'Quien más puntos tenga al final. Si alguien domina **4 tronos**, gana en el acto.'
  },
  'invento': {
    objetivo: 'Inventa el **producto más loco** combinando un objeto, un problema y una característica absurda, y conquista los votos.',
    pasos: [
      'Cada ronda recibes **tres cartas**: un objeto, un problema que resolver y una característica absurda. Puedes **cambiar una**.',
      'Inventa un producto que combine las tres: ponle **nombre** y explica cómo funciona (como en la teletienda).',
      'Se enseñan los inventos **sin autor** y cada uno vota en tres categorías. No te puedes votar.'
    ],
    secciones: [{ icono: '🗳️', titulo: 'Categorías de voto', color: 'violeta', tabla: [['🛒', '**Lo compraría**'], ['🤪', '**El más absurdo**'], ['🚀', '**Triunfará**']] }],
    puntos: [['🗳️', 'Cada voto', '+1'], ['🏅', 'Ganar una categoría', '+2']],
    notasPuntos: ['Si sois solo dos, entra también un **invento de la casa** (sus votos no dan puntos a nadie).'],
    gana: 'Quien más puntos sume al final.'
  },
  'director': {
    objetivo: 'Dirige un club con **presupuesto limitado**: ficha futbolistas reales en pujas secretas, monta una plantilla equilibrada y gana la liga.',
    pasos: [
      'Todos los clubes tienen el **mismo presupuesto**. Primero eliges **formación** (cuántos defensas, medios y delanteros).',
      'En cada **mercado** salen futbolistas con posición, edad, media, potencial y precio.',
      'Pujas **en secreto** (máximo 5 por mercado): se lo lleva la puja más alta y paga lo que pujó.',
      'Al final eliges **táctica** y se juega una liga a doble vuelta contra todos (y contra clubes de la máquina).'
    ],
    secciones: [
      { icono: '📋', titulo: 'Plantilla', color: 'cian', items: ['Máximo **16** jugadores.', 'Si te falta alguien en el once, juega otro **fuera de su sitio** (−8) o un canterano de media 60.'] },
      { icono: '🧠', titulo: 'No basta con fichar a los mejores', color: 'violeta', items: ['Cuenta cada **línea** del equipo.', '**Química**: compañeros del mismo club o país.', '**Edad**: los jóvenes crecen hacia su potencial y los veteranos bajan.', 'Tener **banquillo** y elegir bien la **táctica** frente a la del rival.'] }
    ],
    gana: 'El club que quede **primero en la liga**.'
  },
  'laberinto': {
    objetivo: 'Dos juegos de laberinto en uno: **El Minotauro** (caza en la niebla) y **Constructores y corredores** (diseña y recorre laberintos).',
    tituloPasos: 'Cómo empezar',
    pasos: ['Elige uno de los dos juegos.', 'Después decide si jugáis **online** (cada uno con su móvil) o en **un solo móvil**.'],
    secciones: [
      { icono: '🐂', titulo: 'El Minotauro', color: 'rojo', items: [
        'Laberinto de **11×11** con niebla: solo ves lo que tienes cerca (a 2 casillas por los pasillos) y recuerdas lo que ya has visto.',
        'A un jugador le toca en secreto ser el **Minotauro**: conoce todo el laberinto pero no ve a nadie que no tenga cerca. Los demás son **exploradores** y salen del centro.',
        'Cada turno todos trazáis a la vez vuestro recorrido: exploradores **2 pasos** (o 3 corriendo, pero hace ruido); el Minotauro, **3**. Luego os movéis a la vez.',
        'Si el Minotauro pisa a un explorador o se cruzan, lo **atrapa**: pasa a ser su ayudante 👹 y también caza.',
        'Las **3 llaves** 🔑 brillan para los exploradores. Con todas recogidas se abren las dos salidas 🚪.',
        'Cada explorador tiene **1 trampa** 🪤 (el cazador que la pisa pierde un turno) y hay antorchas 🔦 para ver más lejos.',
        'El Minotauro **oye** a quien corre o abre un candado; los exploradores oyen sus pasos cuando está cerca.',
        '**Ganan los exploradores** si escapa al menos un tercio de ellos (mínimo uno). Si no, gana el Minotauro con sus ayudantes.'
      ] },
      { icono: '🧱', titulo: 'Constructores y corredores', color: 'naranja', items: [
        '**Construir**: diseñas en secreto un laberinto de **9×9** para otro jugador, de 🚩 a 🏁, con 26 muros 🧱, 6 hielos 🧊, 4 flechas ➡️ y 2 portales 🌀. Tiene que tener salida (se comprueba solo).',
        '**Hielo**: resbalas hasta chocar. **Flecha**: te empuja en su dirección. **Portal**: apareces en el otro.',
        '**Carrera**: todos recorréis a la vez el laberinto que os han hecho, deslizando el dedo o con las flechas. Con niebla solo ves lo cercano.',
        'Puntos por puestos (**5, 3, 2, 1…**): suma más el corredor más rápido… y el constructor cuyo laberinto más tarda en resolverse. Quien no llega cuenta con el tiempo máximo.',
        'Cada ronda construyes para un rival distinto. Gana quien más puntos tenga al final.'
      ] }
    ]
  },
  'hemeroteca': {
    objetivo: 'Completa **titulares históricos** de periódico a los que les faltan palabras. Cuantas menos pistas necesites, más puntos.',
    pasos: [
      'Sale un titular con huecos: historia, deporte, cine, ciencia, música y actualidad.',
      'Las pistas se destapan solas cada **15 segundos**: el titular, la época, una pista con el año y al final las **iniciales** de lo que falta.',
      'Quien lo sepa, que pulse: tiene **20 segundos** para escribir lo que falta (basta con las palabras clave).'
    ],
    puntos: [['1️⃣', 'Con una pista', '+10'], ['2️⃣', 'Con dos', '+7'], ['3️⃣', 'Con tres', '+5'], ['🔤', 'Con todas', '+3'], ['❌', 'Fallo', '0 y fuera del titular']]
  },
  'acta': {
    objetivo: 'Adivina qué **partido histórico** es a partir de su acta incompleta, antes que nadie.',
    pasos: [
      'El acta muestra resultados parciales, minutos clave, tarjetas, estadio y algunos goleadores (nunca todos).',
      'Los datos se destapan solos cada **12 segundos**, de más vagos a más reveladores.',
      'Quien lo sepa, que pulse y escriba **los dos equipos y los goles** de cada uno. Tiene **45 segundos**.'
    ],
    secciones: [{ icono: '📝', titulo: 'Al responder', color: 'cian', items: ['Da igual qué equipo pongas primero.', 'En partidos con penaltis vale el resultado **tras la prórroga**.'] }],
    puntos: [['⚡', 'Cuanto antes aciertes', '+10, 8, 6, 4 o 2'], ['❌', 'Fallo', '0 y fuera del partido']]
  },
  'oncefantasma': {
    objetivo: 'Reconstruye la **alineación** de una final histórica a partir de dorsales, posiciones y pistas.',
    pasos: [
      'Cada partido tiene sus **dos onces** titulares. Por turnos, a cada uno le toca reconstruir un once (los dos de un partido van a jugadores seguidos).',
      'Al principio solo se ven la **posición y el dorsal** de cada hueco (y el entrenador).',
      'En tu turno solo adivinas tú: cada acierto destapa una **pista** de otro compañero (club o país, trayectoria e iniciales) y el reloj destapa otra cada **20 segundos**.',
      'Si se te acaba el tiempo o te plantas con huecos, hay **rebote**: los demás pueden adivinar los que faltan.'
    ],
    puntos: [['🎯', 'Hueco acertado (según pistas)', '+10, 7, 5 o 3'], ['🏆', 'Completar tú solo tu once', '+5 extra'], ['🔄', 'Acierto en rebote', '+5, 4, 3 o 2']],
    consejos: ['Las alineaciones se ven como en la tele: el lateral izquierdo, a la izquierda.']
  },
  'unapieza': {
    objetivo: 'Completa por turnos una **figura** con piezas geométricas: cierra filas, cumple tu objetivo secreto y pon la última pieza.',
    pasos: [
      'En el tablero hay una **silueta** incompleta (una casa, un cohete, un pez…). Tienes **3 piezas** en la mano.',
      'En tu turno coloca una pieza entera en los huecos libres: puedes **girarla** y darle la **vuelta**. Luego robas otra.',
      'También puedes **pasar** y cambiar una pieza.',
      'En cada figura tienes un **objetivo secreto** (arriba, se despliega al tocarlo): cerrar tú una fila o columna concreta.'
    ],
    puntos: [['🟦', 'Cada casilla', '+1'], ['📏', 'Cerrar fila o columna', '+2'], ['🧩', 'Poner la última pieza', '+5'], ['🎯', 'Cumplir tu objetivo', '+4'], ['❌', 'Figura acabada sin tu objetivo', '-2'], ['🚫', 'Dejar al siguiente sin sitio', '+2']],
    notasPuntos: ['Quien no puede colocar nada rellena una casilla suelta.'],
    gana: 'Quien más puntos sume al acabar **todas las figuras**.'
  },
  'datosobra': {
    objetivo: 'De cuatro afirmaciones sobre un futbolista, **una es mentira**. Señálala… o desafía al que responde.',
    pasos: [
      'Cada ronda sale un futbolista con **cuatro afirmaciones**: tres ciertas y una falsa.',
      'Por turnos, un jugador señala cuál es la **mentira**.',
      'Los demás deciden en secreto: **aceptar** su respuesta o **desafiarla** señalando otra.',
      'Al final se desvela la mentira y **por qué es falsa**.'
    ],
    puntos: [['✅', 'Quien responde acierta', '+3'], ['⚔️', 'Desafías y aciertas (el otro falló)', '+4'], ['❌', 'Desafías y el otro tenía razón', '-1'], ['🛡️', 'Quien responde aguanta un desafío', '+1 por desafío']]
  },
  'pareja': {
    objetivo: 'Encuentra la **pareja** de un actor, inventor, país, personaje, cantante o pintor entre cuatro opciones, antes que nadie.',
    pasos: [
      'Sale un elemento y **cuatro posibles parejas**: su película más famosa, su invento, su moneda, su creador, su grupo o su cuadro.',
      'El reloj corre **25 segundos**. Quien lo sepa, que pulse: tiene **10 segundos** para elegir.',
      'Las opciones falsas se parecen a la buena (mismo país, época o tipo): no vale descartar a ojo.'
    ],
    puntos: [['✅', 'Acierto', '+2'], ['❌', 'Fallo', '-1 y fuera de la ronda'], ['🟡', 'Parejas medias', 'Puntos ×2'], ['🔴', 'Parejas difíciles', 'Puntos ×3']],
    notasPuntos: ['La dificultad sube: primero unas pocas fáciles, luego medias y la mayor parte de la partida, difíciles.']
  },
  'tablero': {
    objetivo: 'Responde preguntas de un tablero con casillas de **100 a 500 puntos**. Si aciertas sumas; si fallas, restas… y el siguiente tiene rebote.',
    pasos: [
      'Hay **25 categorías** (cine, historia, fútbol, literatura, arte, videojuegos, mitología, espacio…). Por turnos, cada uno elige una que no haya elegido nadie hasta completar el tablero.',
      'Cada categoría tiene casillas de **100 a 500**: cuanto más valen, más difíciles.',
      'Quien tiene el turno elige casilla y responde entre **4 opciones**.',
      'El primer turno es al azar y después van en orden.'
    ],
    secciones: [
      { icono: '🔄', titulo: 'Rebote', color: 'cian', texto: 'Si fallas, el **siguiente jugador** responde la misma pregunta (sin la opción fallada): si acierta suma, y si falla **no resta**.' },
      { icono: '✨', titulo: 'Casilla doble', color: 'rosa', texto: 'Hay una casilla doble escondida: vale **el doble**… para bien y para mal.' }
    ],
    puntos: [['✅', 'Acierto', '+ valor de la casilla'], ['❌', 'Fallo', '- valor de la casilla'], ['🔄', 'Acierto en rebote', '+ valor (fallar no resta)']],
    gana: 'Cuando no quedan casillas, gana quien más puntos tenga.'
  },
  'musavanzado': {
    objetivo: 'Mus de **faroles** con baraja pactada: cada ronda es una categoría distinta y en cada una se envida, se sube o se echa un órdago.',
    chips: ['🃏 Baraja española de 40', '👤 Individual o 👥 por parejas'],
    pasos: [
      'A **8 reyes** como en el mus: los treses valen como reyes y los doses como ases. Se juega a 20, 30 o 40 puntos.',
      'Se reparten **5 cartas** y se juegan las categorías en orden: grande, chica, pares, escalera, color y juego (o las que elija el anfitrión). Comodines, bombas o espejos si todos aceptan.',
      'Antes de cada categoría puedes **tirar de 0 a 5 cartas** y robar otras tantas. Las que te quedas siguen para la siguiente: ¿vas a por la actual o te guardas cartas?',
      'Se habla como en el mus: **pasar, envidar** lo que quieras u **órdago**. Los demás quieren, suben, no quieren (se retiran) u órdago. Si nadie quiere, el que envidó se lleva lo que había (1 si era el primero).',
      'Al acabar la mano se enseñan, categoría a categoría, las cartas de quienes siguieron. Gana el mejor según el mus; a igualdad, el más cercano a la mano.'
    ],
    secciones: [
      { icono: '💥', titulo: 'Órdago', color: 'rojo', texto: 'Si se quiere, se enseñan las cartas y quien tenga la mejor jugada **gana la partida entera**. Si vas perdiendo es tu oportunidad… pero si lo pierdes, se acabó.' },
      { icono: '🎯', titulo: 'El juego', color: 'cian', items: ['Suma de las 5 cartas (figuras y treses 10, doses 1).', 'De **31 a 40** es juego (31 > 32 > 40 > 37 > … > 33).', 'Por debajo, **punto** (lo más cerca de 30). Más de 40, te pasas.'] }
    ],
    puntos: [['🤝', 'Lo querido', '+ lo apostado'], ['⬆️', 'Grande o chica en paso', '+1'], ['👯', 'Pareja / medias / duples / full / póker', '+1 / 2 / 3 / 4 / 5'], ['🪜', 'Escalera de 4 / de 5', '+2 / +5'], ['🎨', 'Color: 4 / 5 del mismo palo', '+1 / +5'], ['🎯', 'Juego de 31 / otro juego / punto', '+3 / +2 / +1']],
    notasPuntos: ['Los extras son para cada jugador del bando ganador. Orden de la escalera: A-4-5-6-7-S-C-R.'],
    gana: 'Quien llega antes a los puntos.'
  },
  'sumacero': {
    objetivo: 'Consigue que tu mano sume **exactamente 0** (o lo más cerca posible)… y plántate a tiempo.',
    pasos: [
      'Empiezas con **5 cartas** con valores del −10 al +10.',
      'En tu turno **roba** del mazo (a ciegas), coge la de arriba del **descarte**… o **plántate**.',
      'Después, **descarta** una carta o usa una **especial** (las especiales usadas salen del juego).'
    ],
    secciones: [
      { icono: '✋', titulo: 'Plantarse', color: 'verde', items: ['Cuando te plantas, cada rival juega **un último turno**… y puede destrozarte la mano.', 'Si te plantas y no tienes la mejor mano de la ronda: **+5** (salvo que te hayan cambiado la mano después).', 'Guárdate un 🛡️ **Escudo** para plantarte tranquilo, y usa 🔍 **Rayos X** para ver si alguien se guarda un Cambio de manos.'] },
      { icono: '🃏', titulo: 'Cartas especiales', color: 'violeta', tabla: [
        ['🫳', '**Mano rápida**: roba una carta al azar de otro jugador'],
        ['🔥', '**Purga**: otro descarta su carta más alta'],
        ['🔀', '**Cambio de manos**: intercambia tu mano con la de otro'],
        ['✖️', '**Doble**: duplica una de tus cartas (también si es negativa)'],
        ['🪞', '**Espejo**: cambia el signo de todas tus cartas'],
        ['❄️', '**Congelar**: ese jugador se salta su próximo turno'],
        ['🌊', '**Avalancha**: todos los demás roban 2 cartas'],
        ['🔍', '**Rayos X**: mira en secreto la mano de otro'],
        ['🛡️', '**Escudo**: no se juega; si te atacan, se gasta solo y lo anula']
      ] }
    ],
    tituloPuntos: 'Puntuación (menos es mejor)',
    puntos: [['📏', 'Distancia de tu mano a 0', '+ esa distancia'], ['🎯', 'Suma exacta 0', '-3'], ['🃏', 'Cada especial que te quede', '+2'], ['✋', 'Plantarte sin la mejor mano', '+5']],
    gana: 'Quien **menos puntos** acumule al final.'
  },
  'golpe': {
    objetivo: 'Toda la banda prepara el mismo golpe, pero cada uno sabe solo una parte… y **no todos quieren que salga bien**.',
    pasos: [
      '**El encargo**: una misión con 3 pasos (entrar, dar el golpe y huir) y 4 opciones en cada uno: segura ✅, peligrosa ⚠️ (funciona, pero arriesgada) o imposible ⛔ (el plan fracasa).',
      '**Información privada**: recibes pistas sobre algunas opciones y un **objetivo secreto**.',
      '**El plan**: cada uno propone uno eligiendo una opción por paso.',
      '**El debate**: cuestiona, defiende y, si te conviene, miente sobre tus pistas.',
      '**La votación**: votas en secreto el mejor plan (no el tuyo) y acusas a quien creas traidor.',
      '**La resolución**: se ejecuta el plan más votado y se revelan las condiciones reales y los objetivos de todos.'
    ],
    secciones: [{ icono: '🎭', titulo: 'Objetivos secretos (un traidor por misión)', color: 'rojo', tabla: [
      ['🗡️', '**El traidor**: que el golpe fracase (que gane un plan con algo imposible)'],
      ['👑', '**El ambicioso**: que gane tu plan'],
      ['🦊', '**El oportunista**: que gane el plan de otro y salga bien'],
      ['🎭', '**El manipulador**: que tres jugadores voten tu plan (si sois 3, los otros dos)'],
      ['🕶️', '**El infiltrado**: que gane un plan con algo peligroso… y salga bien']
    ] }],
    puntos: [['✅', 'Tu plan era viable', '+3'], ['🗳️', 'Alguien votó tu plan', '+2'], ['🎯', 'Cumples tu objetivo secreto', '+3'], ['🔎', 'Aciertas quién es el traidor', '+2'], ['🗡️', 'Traidor que sabotea sin que la mitad le acuse', '+2']]
  },
  'conoce': {
    objetivo: 'Todos responden a la misma pregunta… y luego cada uno adivina **quién dijo qué**. ¿Cuánto conoces a tus amigos?',
    pasos: [
      'Antes de empezar, cada uno elige en secreto a su **mejor amigo** de la mesa.',
      'Cada ronda aparece una **pregunta** cotidiana y cada uno escribe su respuesta en secreto.',
      'Se muestran las respuestas **desordenadas**. Si varios escriben lo mismo o algo muy parecido («Fútbol» y «Furbo»), aparece una vez y vale para cualquiera.',
      'Empareja a cada amigo con su respuesta. Partidas de 10, 15 o 20 rondas.'
    ],
    puntos: [['💚', 'Os acertáis mutuamente', '+3 cada uno (+6 con tu mejor amigo)'], ['💙', 'Solo uno acierta al otro', '+2 / -1'], ['💔', 'Ninguno acierta al otro', '-1 cada uno']]
  },
  'logos': {
    objetivo: 'Identifica la **marca** que se esconde tras el logo antes de que el reloj llegue a cero.',
    pasos: [
      'Cada ronda sale un logo y un reloj de **45 segundos**. Cada jugador responde **una sola vez**.',
      '**Online** respondéis todos a la vez; en **un dispositivo**, por turnos y cada uno con su reloj, sin ver lo que han dicho los demás.',
      'Se perdonan tildes, mayúsculas y erratas pequeñas.'
    ],
    puntos: [['✅', 'Acierto', '+ segundos que quedaban'], ['❌', 'Fallo', '- segundos que quedaban'], ['🤷', 'Pasar', '0 (no arriesgas)']]
  }
};
