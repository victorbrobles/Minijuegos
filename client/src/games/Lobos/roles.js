// Catálogo de roles de «Luna de Sangre».
// Todo lo que el juego muestra sobre un rol (nombre, bando, ayuda y guía de turno) sale de aquí.
//
//  bando:     'lobos' | 'pueblo' | 'solitario'
//  unico:     solo puede haber una copia en la partida
//  accion:    cuándo actúa → 'noche' (turno nocturno), 'pasivo' (se activa solo), 'noche1' (solo la primera noche)
//  complejidad: 1 (fácil) · 2 (media) · 3 (avanzada), para recomendar a grupos nuevos
//  guiaNoche: instrucciones claras para su turno (función del estado del jugador para ser dinámica)

export const BANDOS = {
  lobos:     { nombre: 'Lobos',     color: '#ef4444', texto: 'Ganan cuando igualan en número al resto de jugadores vivos.' },
  pueblo:    { nombre: 'Pueblo',    color: '#3b82f6', texto: 'Gana cuando no queda ningún lobo ni ningún Pirómano con vida.' },
  solitario: { nombre: 'Solitario', color: '#f59e0b', texto: 'Juega por su cuenta, con su propia condición de victoria.' }
};

export const ROLES = {
  // ───────────── LOBOS ─────────────
  lobo: {
    id: 'lobo', nombre: 'Lobo', bando: 'lobos', icono: 'paw', complejidad: 1, accion: 'noche',
    resumen: 'Cada noche, la manada devora a un aldeano.',
    detalle: 'Cada noche los lobos eligen una víctima entre los que no son lobos. Si hay empate en la votación de la manada, se elige al azar entre los más votados. De día, haz pasar tu mentira por verdad.',
    guiaNoche: () => 'Mira quiénes son tus compañeros lobos y elige a la víctima de esta noche.',
    guiaDia: 'Pasa desapercibido. Acusa con cabeza: si el pueblo te descubre, te linchará.'
  },
  lobo_alfa: {
    id: 'lobo_alfa', nombre: 'Lobo Alfa', bando: 'lobos', icono: 'crown', unico: true, complejidad: 2, accion: 'noche',
    resumen: 'Una vez por partida, convierte a la víctima en lobo en lugar de matarla.',
    detalle: 'Actúa como un lobo normal, pero una vez por partida puedes usar tu mordisco infectado: la víctima que elijas tú (tu elección manda sobre la votación de la manada) no muere, sino que se convierte en lobo (lo sabrá al empezar su próximo turno de noche). Si la víctima está protegida o salvada, la infección falla y se gasta igualmente.',
    guiaNoche: (est) => est.infeccionUsada
      ? 'Elige a la víctima junto a tu manada. Ya has gastado tu mordisco infectado.'
      : 'Elige a la víctima junto a tu manada. Además puedes activar tu mordisco infectado (un solo uso): la víctima final se convertirá en lobo en vez de morir.',
    guiaDia: 'Si infectas, nadie muere esa noche: el pueblo se confundirá. Úsalo cuando necesites aliados.'
  },
  lobo_sigiloso: {
    id: 'lobo_sigiloso', nombre: 'Lobo Sigiloso', bando: 'lobos', icono: 'mask', unico: true, complejidad: 1, accion: 'noche',
    resumen: 'Un lobo al que el Vidente ve como Pueblo.',
    detalle: 'Funciona como un lobo normal, pero si el Vidente te investiga verá "Pueblo". Es tu mejor coartada: úsala con cuidado, porque un Vidente engañado puede convencer a todos de tu inocencia.',
    guiaNoche: () => 'Mira a tus compañeros lobos y elige a la víctima. Recuerda: el Vidente te verá como Pueblo.',
    guiaDia: 'Si un Vidente dice que eres del pueblo, o miente él o está engañado. Aprovéchalo.'
  },
  falsificador: {
    id: 'falsificador', nombre: 'Falsificador', bando: 'lobos', icono: 'edit', unico: true, complejidad: 3, accion: 'noche',
    resumen: 'Un lobo que, una vez, cambia el rol que se revelará cuando muera alguien.',
    detalle: 'Funciona como un lobo normal. Además, una vez por partida, de noche, eliges a un jugador y un rol: cuando ese jugador muera, el pueblo verá revelado el rol falso que elegiste. Sirve para proteger a un lobo caído o para sembrar dudas sobre los muertos del pueblo. Al final de la partida se muestran los roles verdaderos.',
    guiaNoche: (est) => est.falsificacionUsada
      ? 'Elige a la víctima junto a tu manada. Ya has usado tu falsificación.'
      : 'Elige a la víctima junto a tu manada. Además puedes preparar tu falsificación (un solo uso): elige a un jugador y el rol que se revelará cuando muera.',
    guiaDia: 'Si uno de los tuyos cae, su rol revelado puede no ser el verdadero. Decide a quién protegerás.'
  },

  // ───────────── PUEBLO ─────────────
  aldeano: {
    id: 'aldeano', nombre: 'Aldeano', bando: 'pueblo', icono: 'home', complejidad: 1, accion: 'pasivo',
    resumen: 'Sin poderes: tu arma es tu voto y tu intuición.',
    detalle: 'No tienes habilidades especiales. Observa, razona y vota con cabeza. Un aldeano que no se deja manipular vale tanto como un Vidente.',
    guiaNoche: () => 'Esta noche no tienes nada que hacer. Duerme tranquilo… y espera a que pase el turno.',
    guiaDia: 'Escucha las acusaciones y detecta las contradicciones.'
  },
  vidente: {
    id: 'vidente', nombre: 'Vidente', bando: 'pueblo', icono: 'orb', complejidad: 1, accion: 'noche',
    resumen: 'Cada noche descubres el bando de un jugador.',
    detalle: 'Cada noche eliges a un jugador y averiguas si es Lobo, Pueblo o Solitario. Ojo: el Lobo Sigiloso aparece como Pueblo. Si hablas demasiado, los lobos te cazarán.',
    guiaNoche: () => 'Elige a un jugador vivo para descubrir su bando (Lobo, Pueblo o Solitario).',
    guiaDia: 'Tu información es oro, pero revelarte te pone una diana encima.'
  },
  bruja: {
    id: 'bruja', nombre: 'Bruja', bando: 'pueblo', icono: 'flask', unico: true, complejidad: 2, accion: 'noche',
    resumen: 'Una poción para salvar y otra para envenenar, una vez cada una.',
    detalle: 'Cada noche tienes un botón para envenenar (una vez por partida, a cualquier jugador vivo) y otro para salvar, que se activa cuando los lobos atacan a alguien: al pulsarlo ves quién es la víctima y puedes salvarla con tu poción de vida (una vez por partida). Puedes usar las dos en la misma noche. Cuando has gastado las dos pociones ya no puedes ver a quién atacan los lobos.',
    guiaNoche: (est) => {
      const v = est.pocionVida, p = est.pocionVeneno;
      if (!v && !p) return 'Ya has gastado ambas pociones. Ya no puedes ver a quién atacan los lobos.';
      return `${p ? 'Pulsa «Envenenar» si quieres envenenar a alguien. ' : 'Tu poción de veneno ya está gastada. '}${v ? 'El botón de salvar se activa cuando los lobos atacan a alguien: púlsalo para ver a la víctima y salvarla.' : 'Tu poción de vida ya está gastada.'}`;
    },
    guiaDia: 'Si salvaste a alguien, sabes algo que el pueblo ignora. Decide cuándo contarlo.'
  },
  cazador: {
    id: 'cazador', nombre: 'Cazador', bando: 'pueblo', icono: 'target', unico: true, complejidad: 1, accion: 'pasivo',
    resumen: 'Si mueres, te llevas a alguien por delante.',
    detalle: 'Cuando mueras, sea cual sea la causa (lobos, linchamiento, veneno, amor…), disparas inmediatamente y eliges a un jugador vivo que morirá contigo.',
    guiaNoche: () => 'Esta noche no tienes acción. Si mueres, podrás disparar a un jugador vivo.',
    guiaDia: 'Tu amenaza protege al pueblo: nadie quiere matarte a la ligera.'
  },
  cupido: {
    id: 'cupido', nombre: 'Cupido', bando: 'pueblo', icono: 'heart', unico: true, complejidad: 2, accion: 'noche1',
    resumen: 'La primera noche enamoras a dos jugadores.',
    detalle: 'La primera noche eliges a dos jugadores (puedes elegirte a ti). Quedan enamorados: si uno muere, el otro muere de pena. Si son de bandos distintos y sobreviven los dos hasta el final, ganan juntos.',
    guiaNoche: (est, ronda) => ronda === 1
      ? 'Elige a los dos enamorados. Ambos sabrán quién es su pareja en su turno.'
      : 'Tu flecha ya está lanzada. Esta noche no tienes nada que hacer.',
    guiaDia: 'Tu pareja de enamorados puede ser tu mayor aliado… o tu mayor problema.'
  },
  protector: {
    id: 'protector', nombre: 'Protector', bando: 'pueblo', icono: 'shield', unico: true, complejidad: 1, accion: 'noche',
    resumen: 'Cada noche proteges a alguien del ataque de los lobos.',
    detalle: 'Cada noche eliges a un jugador (puedes protegerte a ti): si los lobos le atacan, sobrevive. No puedes proteger a la misma persona dos noches seguidas. No frena el veneno ni otros peligros.',
    guiaNoche: (est) => est.ultimoProtegido != null
      ? 'Elige a quién proteger esta noche. No puedes repetir con la misma persona que protegiste anoche.'
      : 'Elige a quién proteger esta noche. Puedes protegerte a ti mismo.',
    guiaDia: 'Si nadie murió, quizá acertaste. No lo cuentes demasiado pronto.'
  },
  cartografo: {
    id: 'cartografo', nombre: 'Cartógrafo', bando: 'pueblo', icono: 'pin', unico: true, complejidad: 2, accion: 'noche',
    resumen: 'Cada noche mides la distancia entre dos asientos… sin saber quién es quién.',
    detalle: 'Cada noche eliges a dos jugadores y recibes la distancia entre sus asientos en el círculo (1 = vecinos). No ves sus roles, pero cruzando datos noche tras noche puedes triangular dónde se esconden los lobos. Los asientos siguen el orden de la lista de jugadores.',
    guiaNoche: () => 'Elige a dos jugadores y conocerás cuántos asientos les separan en el círculo. Apunta los datos: son tu arma.',
    guiaDia: 'Tu información es indirecta: compártela con astucia.'
  },
  martir: {
    id: 'martir', nombre: 'Mártir', bando: 'pueblo', icono: 'bell', unico: true, complejidad: 1, accion: 'pasivo',
    resumen: 'Si el pueblo te linchara, los lobos no podrán atacar la noche siguiente.',
    detalle: 'Si mueres linchado por votación, la noche siguiente la manada no puede atacar (ni infectar). Morir de otra forma no activa nada. Puedes revelarte para que el pueblo valore tu sacrificio… o callar.',
    guiaNoche: () => 'Esta noche no tienes acción. Tu poder se activa solo si el pueblo te linchara.',
    guiaDia: 'Que te linchen te sale a cuenta si no te queda otra: tu muerte compra una noche de paz.'
  },
  juez: {
    id: 'juez', nombre: 'Juez Corrupto', bando: 'pueblo', icono: 'landmark', unico: true, complejidad: 3, accion: 'noche',
    resumen: 'Una vez por partida, anulas una votación y la repites.',
    detalle: 'Una vez por partida, de noche, puedes armar tu veredicto. Al día siguiente, cuando se conozca el resultado de la votación, esta se repite en secreto una vez. Si la segunda votación señala al mismo jugador, muere ese jugador y también el Juez. Si cambia, se aplica el nuevo resultado. Nadie sabrá quién armó el veredicto.',
    guiaNoche: (est) => est.juezUsado
      ? 'Ya has usado tu veredicto. Esta noche no tienes acción.'
      : 'Puedes armar tu veredicto para mañana (un solo uso). Si lo haces, la votación de mañana se repetirá una vez.',
    guiaDia: 'Úsalo cuando dudes del resultado… pero recuerda que puede costarte la vida.'
  },
  ladron: {
    id: 'ladron', nombre: 'Ladrón de Voces', bando: 'pueblo', icono: 'mic', unico: true, complejidad: 2, accion: 'noche',
    resumen: 'Cada noche eliges a alguien: mañana su voto lo emites tú.',
    detalle: 'Cada noche eliges a un jugador (no puedes elegirte). Durante la votación del día siguiente, su voto no cuenta: lo emites tú en su lugar (votas dos veces). La víctima no sabrá que le han robado el voto hasta ver el recuento.',
    guiaNoche: () => 'Elige a un jugador. Mañana, además de tu voto, emitirás el suyo.',
    guiaDia: 'En la votación tendrás dos votos: tuyo y el robado. Úsalos para empujar al sospechoso.'
  },
  hechicero: {
    id: 'hechicero', nombre: 'Hechicero del Tiempo', bando: 'pueblo', icono: 'hourglass', unico: true, complejidad: 3, accion: 'noche',
    resumen: 'Una vez por partida, rebobinas la noche: todo se anula.',
    detalle: 'Una vez por partida, de noche, puedes rebobinar el tiempo: todas las acciones de esa noche (las tuyas y las de los demás) quedan anuladas y amanece sin muertos. Nadie sabe qué ha pasado, solo que "ha ocurrido algo raro". Las habilidades de un solo uso que se iban a gastar esa noche no se gastan. Solo se libran la elección de Cupido y la del Parásito de la primera noche.',
    guiaNoche: (est) => est.hechizoUsado
      ? 'Ya has usado tu hechizo. Esta noche no tienes acción.'
      : 'Puedes rebobinar esta noche (un solo uso): se anulan todas las acciones y nadie muere. Hazlo si crees que te van a atacar, o si sospechas de una noche crucial.',
    guiaDia: 'Si amaneció sin muertos y "pasó algo raro", ya sabes qué ha ocurrido.'
  },
  parasito: {
    id: 'parasito', nombre: 'Parásito', bando: 'pueblo', icono: 'leaf', unico: true, complejidad: 3, accion: 'noche1',
    resumen: 'Te atas a un huésped: cuando muera, heredas su rol.',
    detalle: 'La primera noche eliges un huésped. Cuando ese jugador muera, heredas su rol y sus habilidades (con los usos que le quedaran). Si era un lobo, pasas a ser lobo. Hasta entonces, juegas con el pueblo y sin poderes.',
    guiaNoche: (est, ronda) => ronda === 1
      ? 'Elige a tu huésped. Cuando muera, heredarás su rol (y su bando).'
      : (est.huesped != null ? 'Tu huésped sigue vivo. Esta noche no tienes acción.' : 'Esta noche no tienes acción.'),
    guiaDia: 'Protege a un huésped poderoso… o espera a que lo maten.'
  },
  eco: {
    id: 'eco', nombre: 'Eco', bando: 'pueblo', icono: 'speech', unico: true, complejidad: 2, accion: 'pasivo',
    resumen: 'Recibes un mensaje anónimo escrito por quien muere de noche.',
    detalle: 'Cada noche, si alguien ha muerto la noche anterior, esa persona puede dejar un mensaje de texto anónimo. Tú lo lees en tu turno de noche. El mensaje puede ser verdad, pista o mentira: los muertos tienen voz, pero no tienen por qué ser sinceros (¡un lobo caído también puede escribir!).',
    guiaNoche: () => 'Lee el mensaje de los difuntos (si hay). Recuerda que puede ser cierto o una trampa.',
    guiaDia: 'Decide si compartes lo que te susurran los muertos. Quien escribe puede estar mintiendo.'
  },
  notario: {
    id: 'notario', nombre: 'Notario', bando: 'pueblo', icono: 'book', unico: true, complejidad: 2, accion: 'noche',
    resumen: 'Deja cartas selladas sobre jugadores; se abren cuando mueras.',
    detalle: 'Cada noche (hasta 3 cartas en total) puedes elegir a un jugador y sellar una carta que diga «es del Pueblo» o «NO es del Pueblo». Tú decides qué escribir, sea verdad o mentira. Las cartas se leen en voz alta cuando mueras. Tu muerte será tu último gran alegato.',
    guiaNoche: (est) => est.notarioCartas >= 3
      ? 'Ya has sellado tus 3 cartas. Esta noche no tienes acción.'
      : `Puedes sellar una carta sobre un jugador («es del Pueblo» o «NO es del Pueblo»). Llevas ${est.notarioCartas}/3. Se abrirán cuando mueras.`,
    guiaDia: 'Tus cartas son tu testamento: escríbelas pensando en quién te va a matar.'
  },
  banquero: {
    id: 'banquero', nombre: 'Banquero', bando: 'pueblo', icono: 'briefcase', unico: true, complejidad: 2, accion: 'noche',
    resumen: 'Reparte fichas de favor que anulan una votación en contra de su dueño.',
    detalle: 'Dispones de 3 fichas de favor en toda la partida. Cada noche puedes dar una a un jugador (se entera, pero no sabe quién se la dio). Si el pueblo fuera a linchar a quien tiene una ficha, esta se gasta y se libra. Tú decides quién tiene poder… y a quién le pides lealtad.',
    guiaNoche: (est) => est.fichasBanquero > 0
      ? `Puedes entregar una ficha de favor a un jugador (te quedan ${est.fichasBanquero}). Protegerá a su dueño de un linchamiento.`
      : 'Has repartido tus 3 fichas. Esta noche no tienes acción.',
    guiaDia: 'Tus fichas compran lealtades. Elige bien a quién proteges.'
  },
  viuda: {
    id: 'viuda', nombre: 'Viuda Negra', bando: 'pueblo', icono: 'mask', unico: true, complejidad: 2, accion: 'noche',
    resumen: 'Marca a alguien: si los lobos lo matan, ella cae… y se lleva a un lobo.',
    detalle: 'Cada noche marcas a un jugador. Si los lobos matan precisamente a esa persona, tú mueres también, pero arrastras a un lobo al azar contigo. Una amenaza de doble filo: los lobos ganan una víctima y el pueblo pierde una aliada, pero la manada pierde un miembro.',
    guiaNoche: () => 'Marca a un jugador. Si los lobos lo matan esta noche, morirás junto a un lobo elegido al azar.',
    guiaDia: 'Si amaneces viva, nadie ha caído sobre tu marca. Si no, ya sabes qué pasó.'
  },
  contagiado: {
    id: 'contagiado', nombre: 'Contagiado', bando: 'pueblo', icono: 'flask', unico: true, complejidad: 3, accion: 'noche',
    resumen: 'Contagia a otros: si más de la mitad de los vivos enferma, ganáis la epidemia.',
    detalle: 'Cada noche eliges a un jugador: tiene un 50 % de probabilidad de contagiarse (lo notará, pero conserva su rol y su bando). Si en algún momento más de la mitad de los jugadores vivos están contagiados, la epidemia gana en solitario y termina la partida: ganan todos los contagiados vivos, sean del bando que sean. Si el pueblo gana antes, tú ganas con el pueblo.',
    guiaNoche: () => 'Elige a un jugador para visitarle: tiene un 50 % de probabilidad de contagiarse. Si más de la mitad de los vivos enferman, ganáis.',
    guiaDia: 'Cuantos más enfermos, más cerca estás. Pero los enfermos saben que lo están…'
  },
  agente_doble: {
    id: 'agente_doble', nombre: 'Agente Doble', bando: 'pueblo', icono: 'mask', unico: true, complejidad: 3, accion: 'pasivo', incierto: true,
    resumen: 'Tu lealtad real se sortea en secreto; el Vidente te ve siempre del bando contrario.',
    detalle: 'Al empezar, una moneda decide en secreto si eres del Pueblo o de los Lobos (solo tú lo sabes). El Vidente te ve siempre del bando contrario al verdadero. Si eres lobo, actúas como tal de noche y verás a la manada. Si eres del pueblo, no tienes poderes… pero el Vidente te verá como Lobo.',
    guiaNoche: () => 'Mira tu ficha: ahí verás tu lealtad real. Si eres del bando de los lobos, votarás víctima con la manada; si no, no tienes acción.',
    guiaDia: 'El Vidente te ve al revés. Si él te acusa, puede ser tu mejor coartada… o tu sentencia.'
  },

  // ───────────── SOLITARIOS ─────────────
  piromano: {
    id: 'piromano', nombre: 'Pirómano', bando: 'solitario', icono: 'flame', unico: true, complejidad: 3, accion: 'noche',
    resumen: 'Rocía de gasolina y prende fuego a todos a la vez. Gana siendo el último en pie.',
    detalle: 'Cada noche puedes rociar de gasolina a un jugador. Una sola vez por partida, en lugar de rociar, puedes prender fuego: mueren todos los rociados que sigan vivos. Ganas si eres el último jugador con vida (o si quedáis dos y no hay lobos).',
    guiaNoche: (est) => est.incendioUsado
      ? 'Ya has prendido fuego. Sigue rociando… o espera tu momento.'
      : 'Elige: rociar a un jugador nuevo, o prender fuego a todos los ya rociados (un solo uso).',
    guiaDia: 'Tu victoria es solitaria. Mantente vivo y deja que lobos y pueblo se desgasten.'
  },
  camaleon: {
    id: 'camaleon', nombre: 'Camaleón', bando: 'solitario', icono: 'dice', unico: true, complejidad: 3, accion: 'pasivo', neutral: true,
    resumen: 'Empieza sin bando: se une al contrario de quien le vote primero.',
    detalle: 'Empiezas sin bando (cuentas como Pueblo si la partida acaba, y el Vidente te ve como Solitario). La primera vez que alguien vote contra ti en una votación (si hay varios, se elige uno al azar), te unes al bando contrario al suyo: si te acusó un Lobo pasas al Pueblo; si te acusó el Pueblo, pasas a los Lobos. Te enterarás de quién fue y de tu nuevo bando.',
    guiaNoche: (est) => est.bando
      ? `Ya te has unido al bando: ${est.bando === 'lobos' ? 'Lobos (votarás víctima con la manada)' : 'Pueblo'}.`
      : 'Todavía no tienes bando. Esta noche no tienes acción: espera a que alguien vote contra ti.',
    guiaDia: 'Cuidado: que te acusen te hará elegir bando… y el bando contrario al de tu acusador.'
  },
  heredero: {
    id: 'heredero', nombre: 'Heredero Maldito', bando: 'solitario', icono: 'skull', unico: true, complejidad: 2, accion: 'pasivo',
    resumen: 'Consigues tu victoria personal si el pueblo te lincha a partir de la ronda 3.',
    detalle: 'Cumples tu destino (victoria personal) si el pueblo te lincha en una votación de la ronda 3 o posterior. La partida continúa para los demás. Si mueres antes, o por otra causa (lobos, veneno…), pierdes. Tienes que sobrevivir… y luego conseguir que te linchen.',
    guiaNoche: (est, ronda) => ronda < 3
      ? `Esta noche no tienes acción. Todavía es la ronda ${ronda}: debes sobrevivir hasta la ronda 3.`
      : 'Esta noche no tienes acción. Ya estás en la ronda 3 o más: ¡ahora te conviene que el pueblo te linche!',
    guiaDia: 'Hasta la ronda 3, pasa desapercibido. Después, haz que el pueblo vote contra ti.'
  }
};

export const ORDEN_ROLES = [
  'aldeano', 'vidente', 'bruja', 'cazador', 'cupido', 'protector',
  'cartografo', 'martir', 'juez', 'ladron', 'hechicero', 'parasito', 'eco', 'notario', 'banquero', 'viuda', 'contagiado', 'agente_doble',
  'lobo', 'lobo_alfa', 'lobo_sigiloso', 'falsificador',
  'piromano', 'heredero', 'camaleon'
];

// Roles «clásicos»: el resto son invenciones de este juego (se priorizan en las recomendaciones)
export const CLASICOS = ['aldeano', 'lobo', 'vidente', 'bruja', 'cazador', 'cupido', 'protector'];

export const rolDe = (id) => ROLES[id];

// Estado inicial de las habilidades de cada rol
export const estadoInicial = () => ({
  pocionVida: true, pocionVeneno: true,
  infeccionUsada: false,
  hechizoUsado: false,
  juezUsado: false,
  ultimoProtegido: null,
  rociados: [], incendioUsado: false,
  huesped: null,
  falsificacionUsada: false,
  notarioCartas: 0,
  fichasBanquero: 3,
  contagiado: false,
  objeto: null,
  bando: null // Camaleón y Agente Doble: bando real
});
