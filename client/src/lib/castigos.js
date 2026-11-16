// client/src/lib/castigos.js
// Ronda de castigo: «…y el que pierda paga el vino». Dos listas: para todos los públicos y para adultos.
export const CASTIGOS_FAMILIAR = [
  ['🦆', 'Imita a un animal durante 10 segundos'],
  ['🎤', 'Canta el estribillo de una canción que elijan los demás'],
  ['🤖', 'Habla como un robot hasta la próxima partida'],
  ['🎭', 'Imita a alguien del grupo hasta que adivinen quién es'],
  ['🗣️', 'Habla con acento andaluz, gallego o argentino durante 1 minuto'],
  ['💃', 'Baila 15 segundos sin música'],
  ['🙇', 'Haz una reverencia al ganador y llámale «majestad» hasta la próxima partida'],
  ['☕', 'Invitas al próximo café o refresco'],
  ['🧹', 'Te toca recoger la mesa'],
  ['🤳', 'Haz un selfi con la peor cara posible y compártelo en el grupo'],
  ['🐔', 'Cacarea como una gallina cada vez que alguien diga tu nombre (5 minutos)'],
  ['📢', 'Di un trabalenguas de corrido: «Tres tristes tigres tragaban trigo en un trigal»'],
  ['🎬', 'Cuenta una película solo con mímica hasta que la adivinen'],
  ['😂', 'Cuenta un chiste malo… y tiene que hacer gracia'],
  ['🫡', 'El ganador elige tu próximo apodo durante la noche'],
  ['🧘', 'Aguanta 20 segundos a la pata coja'],
  ['🙊', 'No puedes decir «sí» ni «no» hasta la próxima partida'],
  ['🎶', 'Tararea una canción y que los demás adivinen cuál es'],
  ['🌟', 'Di algo bonito de cada persona del grupo'],
  ['🥸', 'Ponte algo raro en la cabeza hasta la próxima partida'],
  ['📱', 'El ganador escribe un mensaje en tu nombre al grupo (sin pasarse)'],
  ['🕺', 'Haz tu mejor paso de baile de los 90'],
  ['👑', 'El ganador elige el próximo juego… y tú no puedes protestar'],
  ['🔁', 'Repite la última frase de cada persona durante 2 minutos'],
  ['🍪', 'Te toca traer el picoteo la próxima vez'],
  ['🧑‍🏫', 'Explica las reglas del próximo juego como si fueras un presentador de la tele'],
  ['🤐', 'Tienes que hablar susurrando hasta la próxima partida'],
  ['🎯', 'Te libras… ¡esta vez!']
];
export const CASTIGOS_ADULTOS = [
  ['🍷', '¡Pagas el vino! (o la próxima ronda)'],
  ['🥂', 'Brinda por el ganador y bebe un trago'],
  ['🍻', 'Reparte 3 tragos entre los demás… y tú te bebes 2'],
  ['🍾', 'Te toca servir las copas hasta la próxima partida'],
  ['🥃', 'Trago corto y a seguir jugando'],
  ['🍷', 'Bebes cada vez que alguien diga «juego» hasta la próxima partida'],
  ['🧾', 'La próxima ronda corre de tu cuenta'],
  ['🍋', 'Sostén tu copa con la mano que no usas hasta la próxima partida'],
  ...CASTIGOS_FAMILIAR.filter(([e]) => e !== '☕' && e !== '🎯')
];

/** Número pseudoaleatorio estable a partir de un texto: todos los móviles de la partida sacan el mismo castigo. */
export function semilla(texto) {
  let h = 2166136261;
  for (const c of String(texto)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
}
