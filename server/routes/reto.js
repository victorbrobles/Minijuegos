// server/routes/reto.js
// «Reto diario»: cada día un reto distinto de UN jugador (cultura, fútbol, habilidad…), el mismo para todos.
// Se genera la primera vez que alguien lo pide ese día (hora de España) y se guarda, así no cambia aunque el
// servidor se reinicie. Cada jugador (Nombre#1234) tiene UN intento: cuenta desde que pulsa «Empezar».
//   GET  /api/reto/hoy?jugador=…   reto de hoy + el intento del jugador (si lo hay) + estadísticas del día
//   POST /api/reto/empezar         { jugador }                       → empieza su único intento
//   POST /api/reto/terminar        { jugador, superado, puntos, resumen }
import express from 'express';
import db from '../db.js';
import { PREGUNTAS } from '../data/seeds/tablero/preguntas.js';
import { elegir as elegirPareja } from './pareja.js';
import { elegir as elegirIntruso } from './intruso.js';
import { elegir as elegirOrden } from './ponorden.js';
import { BASE as FUTBOLISTAS } from './fichajes.js';
import { CLUBES } from '../../client/src/games/Fichajes/engine.js';
import { TIPOS_EXTRA } from '../lib/retosExtra.js';

db.exec(`
  CREATE TABLE IF NOT EXISTS retos_diarios (fecha TEXT PRIMARY KEY, tipo TEXT NOT NULL, datos TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS retos_intentos (
    fecha TEXT NOT NULL, jugador TEXT NOT NULL, estado TEXT NOT NULL, puntos REAL, resumen TEXT,
    inicio INTEGER NOT NULL, fin INTEGER, PRIMARY KEY (fecha, jugador)
  );
`);

const barajar = (l) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/** Fecha de hoy en España (YYYY-MM-DD). */
export function fechaHoy(ahora = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(ahora);
}
/** Milisegundos hasta la medianoche de España. */
function hastaManana(ahora = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' })
    .formatToParts(ahora).map((x) => [x.type, Number(x.value)]));
  return ((23 - p.hour) * 3600 + (59 - p.minute) * 60 + (60 - p.second)) * 1000;
}

const preguntaTablero = (q) => ({ p: q.p, opciones: barajar(q.o), correcta: q.o[0], etiqueta: q.cat });
const ETIQUETAS_CAT = { cine: '🎬 Cine', historia: '📜 Historia', ciencia: '🔬 Ciencia', musica: '🎵 Música', deporte: '🏅 Deporte', geografia: '🌍 Geografía', futbol: '⚽ Fútbol', literatura: '📚 Literatura', arte: '🎨 Arte', gastronomia: '🍳 Gastronomía', animales: '🐾 Animales', tecnologia: '💻 Tecnología', videojuegos: '🎮 Videojuegos', television: '📺 Televisión', mitologia: '⚡ Mitología', lengua: '🔤 Lengua', espacio: '🚀 Espacio', cuerpo: '🫀 Cuerpo humano', espana: '🇪🇸 España', comics: '💥 Cómics', inventos: '💡 Inventos', capitales: '🏛️ Capitales', matematicas: '➗ Matemáticas', naturaleza: '🌿 Naturaleza', monumentos: '🗿 Monumentos' };

// Cada tipo: { titulo, emoji, tema, descripcion, generar() → datos }
export const TIPOS = {
  cultura: {
    titulo: 'Cultura general', emoji: '🧠', tema: 'Cultura general',
    descripcion: 'Siete preguntas de temas variados. Tienes 20 segundos para cada una. Necesitas acertar al menos 5.',
    generar() {
      const cats = barajar([...new Set(PREGUNTAS.map((q) => q.cat))].filter((c) => c !== 'futbol')).slice(0, 7);
      const preguntas = cats.map((c) => preguntaTablero(barajar(PREGUNTAS.filter((q) => q.cat === c && (q.v === 200 || q.v === 300)))[0]))
        .map((q) => ({ ...q, etiqueta: ETIQUETAS_CAT[q.etiqueta] || q.etiqueta }));
      return { modo: 'quiz', preguntas, segundos: 20, umbral: 5 };
    }
  },
  futbol: {
    titulo: 'Fútbol', emoji: '⚽', tema: 'Fútbol',
    descripcion: 'Seis preguntas de fútbol: historia y en qué equipo juega cada futbolista. 20 segundos por pregunta. Necesitas 4 aciertos.',
    generar() {
      const historia = barajar(PREGUNTAS.filter((q) => q.cat === 'futbol' && q.v >= 200 && q.v <= 400)).slice(0, 3).map(preguntaTablero)
        .map((q) => ({ ...q, etiqueta: '⚽ Fútbol' }));
      const nombreClub = (c) => CLUBES[c].split('|')[0];
      const fichajes = barajar(FUTBOLISTAS.filter((f) => f.media >= 80 && f.media <= 85)).slice(0, 3).map((f) => {
        const otros = barajar([...new Set(FUTBOLISTAS.map((x) => x.club))].filter((c) => c !== f.club)).slice(0, 3);
        return { p: `¿En qué equipo juega ${f.nombre} (temporada 2025/26)?`, opciones: barajar([f.club, ...otros].map(nombreClub)), correcta: nombreClub(f.club), etiqueta: '🔁 Fichajes' };
      });
      return { modo: 'quiz', preguntas: barajar([...historia, ...fichajes]), segundos: 20, umbral: 4 };
    }
  },
  pareja: {
    titulo: 'La pareja perfecta', emoji: '💞', tema: 'Cultura general',
    descripcion: 'Seis parejas de nivel medio y difícil: actores y películas, países y monedas, cantantes y grupos… 15 segundos por pareja. Necesitas 4 aciertos.',
    generar() {
      const items = elegirPareja(new Set(), 20).filter((x) => x.multiplicador >= 2);
      const preguntas = barajar(items).slice(0, 6).map((x) => ({
        p: `${x.pistas[0].valor} → ${x.pregunta}`, opciones: x.opciones, correcta: x.correcta, etiqueta: x.pistas[0].etiqueta.split(' · ')[0]
      }));
      return { modo: 'quiz', preguntas, segundos: 15, umbral: 4 };
    }
  },
  intruso: {
    titulo: 'El intruso', emoji: '🕵️', tema: 'Historia y cultura',
    descripcion: 'Cinco grupos de cinco: en cada uno, uno no encaja por época o por categoría. 12 segundos por grupo. Necesitas 4 aciertos.',
    generar() {
      const preguntas = elegirIntruso(5).map((x) => ({ p: x.pregunta, opciones: x.opciones, correcta: x.opciones[x.intruso], etiqueta: `${x.emoji} ${x.titulo}`, explicacion: x.explicacion }));
      return { modo: 'quiz', preguntas, segundos: 12, umbral: 4, sinBarajar: true };
    }
  },
  ordenar: {
    titulo: 'Ponlo en orden', emoji: '📊', tema: 'Cultura general',
    descripcion: 'Dos series de seis elementos para ordenar (por fecha, tamaño, distancia…). Necesitas al menos 8 de las 12 posiciones bien.',
    generar() { return { modo: 'ordenar', series: elegirOrden(2), umbral: 8 }; }
  },
  memoria: {
    titulo: 'Memoria de colores', emoji: '🔴', tema: 'Habilidad',
    descripcion: 'Repite la secuencia de luces, que crece un paso cada ronda. Sin vidas extra: un fallo y se acaba. Llega a una secuencia de 9 para superarlo.',
    generar() { return { modo: 'memoria', secuencia: Array.from({ length: 12 }, () => Math.floor(Math.random() * 4)), objetivo: 9 }; }
  },
  calculo: {
    titulo: 'Cálculo mental', emoji: '➗', tema: 'Habilidad',
    descripcion: 'Doce operaciones en 75 segundos, sin calculadora. Necesitas acertar al menos 10.',
    generar() {
      const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
      const ops = Array.from({ length: 12 }, (_, i) => {
        const t = i % 4;
        if (t === 0) { const a = r(27, 98); const b = r(16, 89); return { texto: `${a} + ${b}`, res: a + b }; }
        if (t === 1) { const a = r(60, 150); const b = r(17, a - 5); return { texto: `${a} − ${b}`, res: a - b }; }
        if (t === 2) { const a = r(6, 19); const b = r(4, 12); return { texto: `${a} × ${b}`, res: a * b }; }
        const b = r(3, 12); const res = r(4, 15); return { texto: `${b * res} ÷ ${b}`, res };
      });
      return { modo: 'calculo', operaciones: barajar(ops), segundos: 75, umbral: 10 };
    }
  },
  crimen: {
    titulo: 'Escena del crimen', emoji: '🔎', tema: 'Lógica',
    descripcion: 'Un caso de 5×5: coloca a todos con las pistas y descubre al asesino. Si acusas a quien no es, el reto se da por fallado.',
    generar() { return { modo: 'crimen', semilla: Math.floor(Math.random() * 1e9), nivel: 'facil' }; }
  }
};
Object.assign(TIPOS, TIPOS_EXTRA);
// Orden fijo de la rotación: 31 tipos, uno por cada día del mes, alternando conocimiento y habilidad
// (dos días seguidos nunca repiten tipo)
const ROTACION = [
  'cultura', 'memoria', 'futbol', 'famoso', 'ordenar', 'stroop', 'pareja', 'ahorcado', 'cine', 'calculo', 'banderas',
  'seleccionar', 'intruso', 'reflejos', 'frases', 'anagramas', 'historia', 'parejas', 'trayectoria', 'masmenos', 'siglas',
  'crimen', 'ciencia', 'aproximar', 'datosobra', 'secuencias', 'verdadero', 'acta', 'capitales', 'once', 'musica'
];
const tipoDe = (fecha) => ROTACION[Math.floor(Date.parse(`${fecha}T12:00:00Z`) / 86400000) % ROTACION.length];

const leerReto = db.prepare('SELECT * FROM retos_diarios WHERE fecha = ?');
const guardarReto = db.prepare('INSERT OR IGNORE INTO retos_diarios (fecha, tipo, datos) VALUES (?, ?, ?)');
const leerIntento = db.prepare('SELECT estado, puntos, resumen, inicio, fin FROM retos_intentos WHERE fecha = ? AND jugador = ?');
const crearIntento = db.prepare("INSERT OR IGNORE INTO retos_intentos (fecha, jugador, estado, inicio) VALUES (?, ?, 'jugando', ?)");
const cerrarIntento = db.prepare("UPDATE retos_intentos SET estado = ?, puntos = ?, resumen = ?, fin = ? WHERE fecha = ? AND jugador = ? AND estado = 'jugando'");
const estadisticas = db.prepare("SELECT SUM(estado = 'superado') AS superados, COUNT(*) AS intentos FROM retos_intentos WHERE fecha = ?");

/** El reto del día (lo crea si aún no existe). */
export function retoDe(fecha) {
  let fila = leerReto.get(fecha);
  if (!fila) {
    const tipo = tipoDe(fecha);
    guardarReto.run(fecha, tipo, JSON.stringify(TIPOS[tipo].generar()));
    fila = leerReto.get(fecha);
  }
  const t = TIPOS[fila.tipo];
  return { fecha, tipo: fila.tipo, titulo: t.titulo, emoji: t.emoji, tema: t.tema, descripcion: t.descripcion, datos: JSON.parse(fila.datos) };
}

const jugadorValido = (j) => /^.{1,15}#\d{4}$/.test(String(j || ''));
// Un intento que se empezó y no se terminó (se cerró la página) cuenta como fallado
const comoFallado = (i) => (i && i.estado === 'jugando' ? { ...i, estado: 'fallado', abandonado: true } : i);

const router = express.Router();

router.get('/hoy', (req, res) => {
  const fecha = fechaHoy();
  const reto = retoDe(fecha);
  const jugador = String(req.query.jugador || '');
  const intento = jugadorValido(jugador) ? leerIntento.get(fecha, jugador) || null : null;
  const st = estadisticas.get(fecha);
  res.json({
    success: true, ...reto, siguienteEn: hastaManana(),
    intento: req.query.enCurso === '1' ? intento : comoFallado(intento),
    hoy: { intentos: st.intentos || 0, superados: st.superados || 0 }
  });
});

router.post('/empezar', (req, res) => {
  const jugador = String(req.body?.jugador || '');
  if (!jugadorValido(jugador)) return res.status(400).json({ error: 'Necesitas entrar con tu nombre y tag.' });
  const fecha = fechaHoy();
  const previo = leerIntento.get(fecha, jugador);
  if (previo) return res.status(409).json({ error: 'Ya has hecho el reto de hoy.', intento: comoFallado(previo) });
  crearIntento.run(fecha, jugador, Date.now());
  res.json({ success: true, fecha });
});

router.post('/terminar', (req, res) => {
  const jugador = String(req.body?.jugador || '');
  const fecha = String(req.body?.fecha || fechaHoy());
  if (!jugadorValido(jugador)) return res.status(400).json({ error: 'Jugador no válido.' });
  const r = cerrarIntento.run(req.body?.superado ? 'superado' : 'fallado', Number(req.body?.puntos) || 0, String(req.body?.resumen || '').slice(0, 120), Date.now(), fecha, jugador);
  if (!r.changes) return res.status(409).json({ error: 'Este intento ya estaba cerrado.' });
  res.json({ success: true, intento: leerIntento.get(fecha, jugador) });
});

export default router;
