// client/src/games/Pulsador/juegos.js
// Lo que cambia entre los tres juegos de pulsador: textos, opciones de la sala y cómo se piden las rondas.
import { REGLAS } from './engine.js';

const r = REGLAS;

export const JUEGOS = {
  rasgos: {
    id: 'rasgos',
    api: '/api/rasgos',
    emoji: '📸',
    unidad: 'famosos',
    config: { rondas: 10 },
    etiqueta: () => 'Recorte de la foto',
    pregunta: () => '¿Quién es?',
    era: 'Era…',
    placeholder: '¿Quién es?',
    notaRespuesta: 'Vale el nombre o el apellido por el que se le conoce. Se perdonan tildes y erratas pequeñas.',
    textoPulsador: '¡Lo sé!',
    ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} tiene ojo de paparazzi!`),
    reglas: [
      'Cada ronda aparece un recorte de la foto de un famoso: unos ojos, una barbilla, un peinado…',
      `El reloj corre ${r.rasgos.segRonda} segundos. Quien lo sepa, que pulse: el reloj se para y tiene ${r.rasgos.segRespuesta} segundos para escribir el nombre.`,
      'Si aciertas, sumas tantos puntos como segundos quedaban. Si fallas, restas lo mismo y quedas fuera de esa ronda.',
      'Al acabar la ronda se ve la foto completa.'
    ]
  },
  adivina: {
    id: 'adivina',
    api: '/api/adivina',
    emoji: '🎬',
    unidad: 'rondas',
    config: { rondas: 10, modo: 'canciones', epoca: 'moderna' },
    etiqueta: (v) => (v.fase === 'jugando' ? `Pista ${v.pistas.length} de ${v.totalPistas}` : ''),
    pregunta: (v) => (v.pistas[0]?.etiqueta === 'Protagonistas' ? '¿Qué película es?' : '¿Qué canción es?'),
    era: 'Era…',
    placeholder: 'El título',
    notaRespuesta: 'Basta con el título. Se perdonan tildes y erratas pequeñas.',
    textoPulsador: '¡La sé!',
    ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} se lo sabe todo!`),
    reglas: [
      'Elegid canciones (modernas, antiguas o de todo) o películas.',
      `Cada ronda tiene tres pistas que se destapan solas cada ${r.adivina.segPistas[1]} segundos. En canciones: un trozo de la letra, el artista y, al final, el fragmento de audio. En películas: protagonistas, género y sinopsis.`,
      `Quien lo sepa, que pulse: el reloj se para y tiene ${r.adivina.segRespuesta} segundos para escribir el título.`,
      `Acertar con una pista da ${r.adivina.puntosPista[0]} puntos, con dos ${r.adivina.puntosPista[1]} y con tres ${r.adivina.puntosPista[2]}. Fallar no resta, pero te deja fuera de esa ronda.`,
      'El anfitrión (o el grupo, en un dispositivo) puede adelantar la siguiente pista o rendirse.'
    ]
  },
  frasescelebres: {
    id: 'frasescelebres',
    api: '/api/frasescelebres',
    emoji: '💬',
    unidad: 'frases',
    config: { rondas: 10 },
    etiqueta: () => 'Una frase célebre',
    pregunta: () => '¿Quién lo dijo?',
    era: 'Lo dijo…',
    placeholder: '',
    notaRespuesta: '',
    textoPulsador: '¡Lo sé!',
    ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} tiene memoria histórica!`),
    reglas: [
      'Sale una frase célebre y cuatro posibles autores.',
      `El reloj corre ${r.frasescelebres.segRonda} segundos. Quien lo sepa, que pulse: tiene ${r.frasescelebres.segRespuesta} segundos para elegir el autor.`,
      `Acertar suma ${r.frasescelebres.acierto} puntos. Fallar resta ${r.frasescelebres.fallo} y te deja fuera de esa frase.`
    ]
  }
};

export const MODOS_ADIVINA = [['canciones', '🎵 Canciones'], ['peliculas', '🎬 Películas']];
export const EPOCAS_ADIVINA = [['moderna', 'Modernas'], ['antigua', 'Antiguas'], ['todas', 'De todo']];

/** URL para pedir las rondas del modo «un solo dispositivo». */
export const urlLocal = (juego, c) => `${juego.api}/local?n=${c.rondas}${c.modo ? `&modo=${c.modo}&epoca=${c.epoca}` : ''}`;
