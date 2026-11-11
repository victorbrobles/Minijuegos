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
  },
  hemeroteca: {
    id: 'hemeroteca',
    api: '/api/hemeroteca',
    emoji: '📰',
    unidad: 'titulares',
    config: { rondas: 10 },
    etiqueta: (v) => (v.fase === 'jugando' ? `Pista ${v.pistas.length} de ${v.totalPistas}` : ''),
    pregunta: () => '¿Qué falta en el titular?',
    era: 'El titular era…',
    placeholder: 'Las palabras que faltan',
    notaRespuesta: 'Basta con las palabras clave de lo que falta. Se perdonan tildes y erratas.',
    textoPulsador: '¡Lo sé!',
    ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} es una hemeroteca andante!`),
    reglas: [
      'Sale un titular de periódico al que le faltan palabras: historia, deporte, cine, ciencia, música y actualidad.',
      `Las pistas se destapan solas cada ${r.hemeroteca.segPistas[1]} segundos: primero el titular con huecos, luego la época, después una pista con el año y al final las iniciales de lo que falta.`,
      `Quien lo sepa, que pulse: tiene ${r.hemeroteca.segRespuesta} segundos para escribir lo que falta (basta con las palabras clave).`,
      `Acertar con una pista da ${r.hemeroteca.puntosPista[0]} puntos; con dos, ${r.hemeroteca.puntosPista[1]}; con tres, ${r.hemeroteca.puntosPista[2]}; con todas, ${r.hemeroteca.puntosPista[3]}. Fallar no resta, pero te deja fuera de ese titular.`
    ]
  },
  pareja: {
    id: 'pareja',
    pantallaTurno: true,
    api: '/api/pareja',
    emoji: '💞',
    unidad: 'parejas',
    config: { rondas: 10 },
    etiqueta: (v) => v.pistas[0]?.etiqueta?.replace(/^\S+ /, '') || '',
    pregunta: () => '¿Cuál es su pareja?',
    era: 'Su pareja era…',
    placeholder: '',
    notaRespuesta: '',
    textoPulsador: '¡La sé!',
    ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} encuentra pareja a todo!`),
    reglas: [
      'Sale un elemento (un actor, un inventor, un país, un personaje, un cantante o un pintor) y cuatro posibles parejas: su película más famosa, su invento, su moneda, su creador, su grupo o su cuadro.',
      `El reloj corre ${r.pareja.segRonda} segundos. Quien lo sepa, que pulse: tiene ${r.pareja.segRespuesta} segundos para elegir la pareja.`,
      `Acertar suma ${r.pareja.acierto} puntos y fallar resta ${r.pareja.fallo} (y te deja fuera de esa ronda).`,
      'La dificultad sube: el primer tercio de la partida son parejas fáciles, luego medias (los puntos valen ×2) y al final difíciles (×3).'
    ]
  },
  acta: {
    id: 'acta',
    pantallaTurno: true,
    api: '/api/acta',
    emoji: '📋',
    unidad: 'partidos',
    config: { rondas: 10 },
    etiqueta: (v) => (v.fase === 'jugando' ? `Dato ${v.pistas.length} de ${v.totalPistas}` : ''),
    pregunta: () => '¿Qué partido es?',
    era: 'Era…',
    placeholder: 'Los dos equipos (o el nombre del partido)',
    notaRespuesta: 'Escribe los dos equipos (por ejemplo «Liverpool Milan») o el nombre con el que se conoce el partido.',
    textoPulsador: '¡Lo sé!',
    ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} se sabe todas las actas!`),
    reglas: [
      'Se presenta un partido histórico mediante su acta incompleta: resultados parciales, minutos clave, tarjetas, cambios, estadio y goleadores.',
      `Los datos se destapan solos cada ${r.acta.segPistas[1]} segundos, de más vagos a más reveladores.`,
      `Quien lo sepa, que pulse y escriba los dos equipos (o el nombre del partido, como «Maracanazo»). Tiene ${r.acta.segRespuesta} segundos.`,
      `Cuanto antes aciertes, más puntos: ${r.acta.puntosPista.join(', ')} según los datos que se hayan visto. Fallar no resta, pero te deja fuera de ese partido.`
    ]
  }
};

export const MODOS_ADIVINA = [['canciones', '🎵 Canciones'], ['peliculas', '🎬 Películas']];
export const EPOCAS_ADIVINA = [['moderna', 'Modernas'], ['antigua', 'Antiguas'], ['todas', 'De todo']];

/** URL para pedir las rondas del modo «un solo dispositivo». */
export const urlLocal = (juego, c) => `${juego.api}/local?n=${c.rondas}${c.modo ? `&modo=${c.modo}&epoca=${c.epoca}` : ''}`;
