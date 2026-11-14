// server/lib/retosExtra.js
// Tipos de reto diario añadidos a los de routes/reto.js. Cada uno: { titulo, emoji, tema, descripcion, generar() }.
// Los de preguntas usan el modo 'quiz' (pregunta, opciones, respuesta correcta); el resto tienen su propio modo
// en client/src/reto/.
import { PREGUNTAS } from '../data/seeds/tablero/preguntas.js';
import { FAMOSOS, PREGUNTAS_FAMOSO } from '../data/seeds/reto/famosos.js';
import { PAISES, bandera } from '../data/seeds/reto/banderas.js';
import FRASES1 from '../data/seeds/frasescelebres/parte1.js';
import FRASES2 from '../data/seeds/frasescelebres/parte2.js';
import FRASES3 from '../data/seeds/frasescelebres/parte3.js';
import SIGLAS from '../data/seeds/siglas/siglas.seed.js';
import AFIRMACIONES from '../../client/src/games/VerdaderoFalso/afirmaciones.js';
import { FUTBOLISTAS as DATOSOBRA } from '../data/seeds/datosobra/futbolistas.js';
import { PARTIDOS as ONCES } from '../data/seeds/oncefantasma/onces.js';
import { PARTIDOS as ACTAS } from '../data/seeds/acta/partidos.js';
import { RETOS_TRAYECTORIAS } from '../data/seeds/trayectoria/trayectorias.seed.js';
import { PREGUNTAS as APROX } from '../data/seeds/aproximacion/aproximacion.seed.js';
import { TEMAS, separados } from '../data/seeds/ordenar/temas.js';
import { CATEGORIAS as PAREJAS } from '../data/seeds/pareja/parejas.js';
import { familiaDe } from '../data/seeds/pareja/familias.js';
import { CATEGORIAS as ESCONDITE } from '../data/seeds/escondite/categorias.js';

const barajar = (l) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const azar = (l) => l[Math.floor(Math.random() * l.length)];
const sinTildes = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

/** Preguntas del banco del Tablero de varias categorías, de dificultad media (200-300). */
function delTablero(cats, n, etiquetas) {
  const lista = barajar(PREGUNTAS.filter((q) => cats.includes(q.cat) && (q.v === 200 || q.v === 300)));
  const out = []; const usadas = new Set();
  for (const q of lista) { if (out.length >= n) break; if (usadas.has(q.p)) continue; usadas.add(q.p); out.push(q); }
  return out.map((q) => ({ p: q.p, opciones: barajar(q.o), correcta: q.o[0], etiqueta: etiquetas[q.cat] || q.cat }));
}
const quiz = (preguntas, segundos, umbral, extra = {}) => ({ modo: 'quiz', preguntas, segundos, umbral, ...extra });

const FRASES = [...FRASES1, ...FRASES2, ...FRASES3];
const TODAS_SIGLAS = Object.entries(SIGLAS).flatMap(([cat, l]) => l.map(([sigla, resp]) => ({ cat, sigla, resp })));
const CAPITALES = PAREJAS.find((c) => c.id === 'capital').parejas.map(([pais, cap]) => ({ pais, cap, fam: familiaDe('capital', pais, cap) }));

// Palabras para el ahorcado y los anagramas: respuestas de las categorías cerradas de «El Escondite»
const PALABRAS = ESCONDITE.flatMap((c) => c.opciones.map((o) => ({ palabra: String(o).split('|')[0], pista: c.titulo })))
  .filter(({ palabra }) => /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/.test(palabra) && palabra.replace(/ /g, '').length >= 6 && palabra.length <= 16);

// Firma de cada famoso con todas las preguntas (para elegir solo los que se pueden distinguir)
const firma = (f) => PREGUNTAS_FAMOSO.map(([, , fn]) => (fn(f) ? 1 : 0)).join('');
const FIRMAS = FAMOSOS.map(firma);
const DISTINGUIBLES = FAMOSOS.map((f, i) => i).filter((i) => FIRMAS.filter((x) => x === FIRMAS[i]).length === 1);

export const TIPOS_EXTRA = {
  // ------------------------------------------------------------ Preguntas temáticas
  cine: {
    titulo: 'Cine y televisión', emoji: '🎬', tema: 'Cultura',
    descripcion: 'Siete preguntas de cine y series. 20 segundos por pregunta. Necesitas 5 aciertos.',
    generar: () => quiz(delTablero(['cine', 'television'], 7, { cine: '🎬 Cine', television: '📺 Televisión' }), 20, 5)
  },
  historia: {
    titulo: 'Historia', emoji: '📜', tema: 'Cultura',
    descripcion: 'Siete preguntas de historia, mitología y monumentos. 20 segundos por pregunta. Necesitas 5 aciertos.',
    generar: () => quiz(delTablero(['historia', 'mitologia', 'monumentos'], 7, { historia: '📜 Historia', mitologia: '⚡ Mitología', monumentos: '🗿 Monumentos' }), 20, 5)
  },
  ciencia: {
    titulo: 'Ciencia y naturaleza', emoji: '🔬', tema: 'Cultura',
    descripcion: 'Siete preguntas de ciencia, espacio, cuerpo humano y naturaleza. 20 segundos por pregunta. Necesitas 5 aciertos.',
    generar: () => quiz(delTablero(['ciencia', 'espacio', 'cuerpo', 'naturaleza', 'animales'], 7, { ciencia: '🔬 Ciencia', espacio: '🚀 Espacio', cuerpo: '🫀 Cuerpo humano', naturaleza: '🌿 Naturaleza', animales: '🐾 Animales' }), 20, 5)
  },
  musica: {
    titulo: 'Música', emoji: '🎵', tema: 'Cultura',
    descripcion: 'Siete preguntas de música de todas las épocas. 20 segundos por pregunta. Necesitas 5 aciertos.',
    generar: () => quiz(delTablero(['musica'], 7, { musica: '🎵 Música' }), 20, 5)
  },
  frases: {
    titulo: 'Frases célebres', emoji: '💬', tema: 'Cultura',
    descripcion: '¿Quién lo dijo? Seis frases famosas con cuatro posibles autores. 15 segundos por frase. Necesitas 4 aciertos.',
    generar: () => quiz(barajar(FRASES).slice(0, 6).map((f) => ({ p: `«${f.frase}»`, opciones: barajar(f.opciones), correcta: f.autor, etiqueta: '💬 ¿Quién lo dijo?' })), 15, 4)
  },
  siglas: {
    titulo: 'Siglas', emoji: '🔠', tema: 'Cultura general',
    descripcion: '¿Qué significan? Seis siglas con cuatro opciones. 20 segundos por sigla. Necesitas 4 aciertos.',
    generar: () => quiz(barajar(TODAS_SIGLAS).slice(0, 6).map((x) => {
      const otras = barajar(TODAS_SIGLAS.filter((y) => y.cat === x.cat && y.resp !== x.resp)).slice(0, 3).map((y) => y.resp);
      return { p: `¿Qué significa ${x.sigla}?`, opciones: barajar([x.resp, ...otras]), correcta: x.resp, etiqueta: `🔠 ${x.cat}` };
    }), 20, 4)
  },
  banderas: {
    titulo: 'Banderas', emoji: '🚩', tema: 'Geografía',
    descripcion: 'Ocho banderas: ¿de qué país son? Las opciones son del mismo continente. 10 segundos por bandera. Necesitas 6 aciertos.',
    generar: () => quiz(barajar(PAISES).slice(0, 8).map((x) => {
      const otras = barajar(PAISES.filter((y) => y.cont === x.cont && y.iso !== x.iso)).slice(0, 3).map((y) => y.nombre);
      return { p: '¿De qué país es esta bandera?', grande: bandera(x.iso), opciones: barajar([x.nombre, ...otras]), correcta: x.nombre, etiqueta: '🚩 Banderas' };
    }), 10, 6)
  },
  capitales: {
    titulo: 'Capitales', emoji: '🏛️', tema: 'Geografía',
    descripcion: 'Ocho países: elige su capital entre cuatro del mismo continente. 12 segundos por país. Necesitas 6 aciertos.',
    generar: () => quiz(barajar(CAPITALES).slice(0, 8).map((x) => {
      const otras = barajar(CAPITALES.filter((y) => y.fam === x.fam && y.cap !== x.cap)).slice(0, 3).map((y) => y.cap);
      while (otras.length < 3) otras.push(azar(CAPITALES.filter((y) => y.cap !== x.cap && !otras.includes(y.cap))).cap);
      return { p: `¿Cuál es la capital de ${x.pais}?`, opciones: barajar([x.cap, ...otras]), correcta: x.cap, etiqueta: '🏛️ Capitales' };
    }), 12, 6)
  },
  verdadero: {
    titulo: 'Verdadero o falso', emoji: '✅', tema: 'Curiosidades',
    descripcion: 'Diez afirmaciones sorprendentes: ¿verdad o mentira? 10 segundos cada una. Necesitas 8 aciertos.',
    generar: () => quiz(barajar(AFIRMACIONES).slice(0, 10).map(([texto, v, porque]) => ({
      p: texto, opciones: ['Verdadero', 'Falso'], correcta: v ? 'Verdadero' : 'Falso', etiqueta: '✅ ¿Verdad o mentira?', explicacion: porque
    })), 10, 8, { sinBarajar: true })
  },
  datosobra: {
    titulo: 'El dato que sobra', emoji: '🧐', tema: 'Fútbol',
    descripcion: 'Cuatro futbolistas con cuatro datos: tres son ciertos y uno es mentira. Encuéntralo. 30 segundos por futbolista. Necesitas 3 aciertos.',
    generar: () => quiz(barajar(DATOSOBRA).slice(0, 4).map((f) => ({
      p: `¿Qué dato de ${f.nombre} es FALSO?`, opciones: barajar([...f.ciertas.slice(0, 3), f.falsa]), correcta: f.falsa, etiqueta: '⚽ Dato que sobra'
    })), 30, 3)
  },
  once: {
    titulo: 'Onces históricos', emoji: '👻', tema: 'Fútbol',
    descripcion: 'Seis partidos históricos: ¿cuál de los cuatro jugadores fue titular? 15 segundos por pregunta. Necesitas 4 aciertos.',
    generar() {
      const preguntas = [];
      for (const p of barajar(ONCES)) {
        if (preguntas.length >= 6) break;
        const o = azar(p.onces); const j = azar(o.jugadores.filter((x) => x.pos !== 'POR'));
        const en = new Set(o.jugadores.map((x) => x.nombre));
        const otros = barajar([...new Set(ONCES.flatMap((q) => q.onces.flatMap((oo) => oo.jugadores.filter((x) => x.pos === j.pos).map((x) => x.nombre))))].filter((n) => !en.has(n))).slice(0, 3);
        preguntas.push({ p: `¿Quién fue titular con ${o.equipo}? (${p.partido})`, opciones: barajar([j.nombre, ...otros]), correcta: j.nombre, etiqueta: '👻 Once titular' });
      }
      return quiz(preguntas, 15, 4);
    }
  },
  acta: {
    titulo: 'Acta del partido', emoji: '📋', tema: 'Fútbol',
    descripcion: 'Cuatro partidos históricos contados con su acta (resultado al descanso, minutos clave, tarjetas…): ¿qué partido es? 30 segundos cada uno. Necesitas 3 aciertos.',
    generar() {
      const elegidos = barajar(ACTAS).slice(0, 4);
      return quiz(elegidos.map((x) => {
        const otros = barajar(ACTAS.filter((y) => y.nombre !== x.nombre)).slice(0, 3).map((y) => `${y.nombre} (${y.detalle.split(' · ')[0]})`);
        const bueno = `${x.nombre} (${x.detalle.split(' · ')[0]})`;
        return { p: x.acta.slice(0, 4).join(' · '), opciones: barajar([bueno, ...otros]), correcta: bueno, etiqueta: '📋 ¿Qué partido es?' };
      }), 30, 3);
    }
  },
  trayectoria: {
    titulo: 'Trayectorias', emoji: '🧭', tema: 'Fútbol',
    descripcion: 'Cinco carreras de futbolistas, club a club: ¿de quién es cada una? 20 segundos por carrera. Necesitas 4 aciertos.',
    generar() {
      const pool = RETOS_TRAYECTORIAS.filter((t) => t.clubes?.length >= 3);
      return quiz(barajar(pool.filter((t) => t.dificultad !== 'baja')).slice(0, 5).map((t) => {
        const otros = barajar(pool.filter((y) => y.nombre !== t.nombre && y.nacionalidad === t.nacionalidad)).slice(0, 3).map((y) => y.nombre);
        while (otros.length < 3) otros.push(azar(pool.filter((y) => y.nombre !== t.nombre && !otros.includes(y.nombre))).nombre);
        return { p: t.clubes.map((c) => c.nombre).join(' → '), opciones: barajar([t.nombre, ...otros]), correcta: t.nombre, etiqueta: `🧭 Futbolista de ${t.nacionalidad}` };
      }), 20, 4);
    }
  },
  secuencias: {
    titulo: 'Series numéricas', emoji: '🔢', tema: 'Lógica',
    descripcion: 'Seis series de números: ¿cuál es el siguiente? 25 segundos por serie. Necesitas 5 aciertos.',
    generar() {
      const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
      const gens = [
        () => { const a = r(2, 20); const d = r(3, 12); return Array.from({ length: 6 }, (_, i) => a + d * i); },
        () => { const a = r(1, 4); const k = r(2, 3); return Array.from({ length: 6 }, (_, i) => a * k ** i); },
        () => { const a = r(1, 5); const b = r(2, 6); const s = [a, b]; while (s.length < 6) s.push(s.at(-1) + s.at(-2)); return s; },
        () => { const o = r(1, 4); return Array.from({ length: 6 }, (_, i) => (i + o) ** 2); },
        () => { const a = r(1, 9); const s = [a]; for (let i = 1; i < 6; i++) s.push(s.at(-1) + i * r(2, 2)); return s; },
        () => { const x = r(5, 9); const y = r(2, 4); const s = [r(10, 30)]; while (s.length < 6) s.push(s.at(-1) + (s.length % 2 ? x : -y)); return s; },
        () => { const a = r(2, 6); return Array.from({ length: 6 }, (_, i) => a * (i + 1) + i); }
      ];
      const preguntas = barajar(gens).slice(0, 6).map((g) => {
        const s = g(); const sig = s.pop();
        const malas = new Set();
        while (malas.size < 3) { const x = sig + azar([-3, -2, -1, 1, 2, 4, 5, 6]) * Math.max(1, Math.round(Math.abs(sig) / 20)); if (x !== sig) malas.add(x); }
        return { p: `${s.join(', ')}, …?`, opciones: barajar([String(sig), ...[...malas].map(String)]), correcta: String(sig), etiqueta: '🔢 ¿Qué número sigue?' };
      });
      return quiz(preguntas, 25, 5);
    }
  },
  masmenos: {
    titulo: '¿Cuál va antes?', emoji: '⚖️', tema: 'Cultura general',
    descripcion: 'Diez parejas (inventos, ríos, montañas, películas…): elige cuál va primero según el criterio. 8 segundos cada una. Necesitas 8 aciertos.',
    generar() {
      const preguntas = Array.from({ length: 10 }, () => {
        const t = azar(TEMAS);
        let a; let b;
        do { [a, b] = barajar(t.items).slice(0, 2); } while (!separados(t, a[1], b[1]));
        const primero = a[1] < b[1] ? a : b;
        return { p: `${t.criterio}: ¿cuál va primero?`, opciones: [a[0], b[0]], correcta: primero[0], etiqueta: `${t.emoji} ${t.titulo}`, explicacion: `${a[0]}: ${a[1].toLocaleString('es-ES')} · ${b[0]}: ${b[1].toLocaleString('es-ES')} (${t.unidad})` };
      });
      return quiz(preguntas, 8, 8, { sinBarajar: true });
    }
  },

  // ------------------------------------------------------------ Modos propios
  famoso: {
    titulo: '¿Quién es?', emoji: '🕵️‍♀️', tema: 'Deducción',
    descripcion: 'He pensado en un famoso de la lista. Hazme preguntas de sí o no (como mucho 7) para descartar y, cuando lo tengas, señálalo. Solo puedes señalar una vez.',
    generar() {
      const i = azar(DISTINGUIBLES);
      return {
        modo: 'famoso', maxPreguntas: 7,
        candidatos: FAMOSOS.map((f) => ({ nombre: f.nombre, campo: f.campo })),
        preguntas: PREGUNTAS_FAMOSO.map(([id, texto, fn]) => ({ id, texto, si: FAMOSOS.map((f, k) => (fn(f) ? k : -1)).filter((k) => k >= 0) })),
        objetivo: i
      };
    }
  },
  ahorcado: {
    titulo: 'Ahorcado', emoji: '🪢', tema: 'Palabras',
    descripcion: 'Tres palabras escondidas con su pista. En cada una puedes fallar 6 letras. Necesitas adivinar 2 de las 3.',
    generar() { return { modo: 'ahorcado', palabras: barajar(PALABRAS).slice(0, 3).map((x) => ({ palabra: sinTildes(x.palabra), pista: x.pista })), fallos: 6, umbral: 2 }; }
  },
  anagramas: {
    titulo: 'Anagramas', emoji: '🔀', tema: 'Palabras',
    descripcion: 'Seis palabras con las letras desordenadas y una pista: ordénalas. Tienes 2 minutos en total. Necesitas 5.',
    generar() {
      const palabras = barajar(PALABRAS.filter((x) => !x.palabra.includes(' ') && x.palabra.length <= 11)).slice(0, 6).map((x) => {
        const p = sinTildes(x.palabra);
        let d; do { d = barajar([...p]).join(''); } while (d === p);
        return { palabra: p, desordenada: d, pista: x.pista };
      });
      return { modo: 'anagramas', palabras, segundos: 120, umbral: 5 };
    }
  },
  aproximar: {
    titulo: 'Afina el número', emoji: '🎯', tema: 'Cultura general',
    descripcion: 'Cinco preguntas con respuesta numérica. Vale si te quedas a menos de un 15 % del valor real. Necesitas 3.',
    generar: () => ({ modo: 'aproximar', preguntas: barajar(APROX.filter((q) => !q.manual && q.respuesta > 10)).slice(0, 5).map((q) => ({ p: q.pregunta, respuesta: q.respuesta })), margen: 0.15, umbral: 3 })
  },
  seleccionar: {
    titulo: 'El once', emoji: '📝', tema: 'Fútbol',
    descripcion: 'Un once histórico escondido entre 16 nombres: marca a los 11 titulares. Necesitas acertar al menos 9.',
    generar() {
      const p = azar(ONCES); const o = azar(p.onces);
      const en = new Set(o.jugadores.map((x) => x.nombre));
      const mismos = ONCES.flatMap((q) => q.onces.filter((oo) => oo.equipo === o.equipo).flatMap((oo) => oo.jugadores.map((x) => x.nombre))).filter((n) => !en.has(n));
      const resto = ONCES.flatMap((q) => q.onces.filter((oo) => oo.tipo === o.tipo).flatMap((oo) => oo.jugadores.map((x) => x.nombre))).filter((n) => !en.has(n));
      const falsos = [...new Set([...barajar(mismos), ...barajar(resto)])].slice(0, 5);
      return { modo: 'seleccionar', titulo: `${o.equipo} · ${p.partido}`, nombres: barajar([...en, ...falsos]), correctos: [...en], umbral: 9 };
    }
  },
  stroop: {
    titulo: 'Colores trampa', emoji: '🎨', tema: 'Habilidad',
    descripcion: 'Sale el nombre de un color pintado de otro color. Toca el color de la TINTA, no lo que pone. 20 palabras en 35 segundos. Necesitas 17 bien.',
    generar() {
      const C = ['rojo', 'azul', 'verde', 'amarillo'];
      return { modo: 'stroop', items: Array.from({ length: 20 }, () => { const palabra = azar(C); let tinta; do { tinta = azar(C); } while (tinta === palabra && Math.random() < 0.8); return { palabra, tinta }; }), segundos: 35, umbral: 17 };
    }
  },
  reflejos: {
    titulo: 'Reflejos', emoji: '⚡', tema: 'Habilidad',
    descripcion: 'Toca en cuanto la pantalla se ponga verde. Cinco intentos: tu media tiene que bajar de 380 ms. Si tocas antes de tiempo, ese intento cuenta como 1 segundo.',
    generar: () => ({ modo: 'reflejos', esperas: Array.from({ length: 5 }, () => 1200 + Math.floor(Math.random() * 2600)), objetivo: 380 })
  },
  parejas: {
    titulo: 'Parejas', emoji: '🃏', tema: 'Memoria',
    descripcion: 'Dieciséis cartas boca abajo: encuentra las 8 parejas levantando dos cada vez. Tienes como mucho 22 intentos.',
    generar() {
      const grupos = [['🍎', '🍌', '🍇', '🍓', '🍍', '🥝', '🍒', '🍑', '🥥', '🍋'], ['⚽', '🏀', '🎾', '🏐', '🏈', '⚾', '🏓', '🥊', '⛳', '🏒'], ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐯', '🐵', '🐧', '🐙']];
      const em = barajar(azar(grupos)).slice(0, 8);
      return { modo: 'parejas', cartas: barajar([...em, ...em]), maxIntentos: 22 };
    }
  }
};
