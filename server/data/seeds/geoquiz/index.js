// server/data/seeds/geoquiz/index.js — Banco de preguntas de GeoQuiz
// Para añadir preguntas basta con editar el fichero de su categoría (ver _tipos.js) o su ampliación en extra/.
// Para añadir una categoría nueva: crea el fichero y añádelo a esta lista.
import paises from './paises.js';
import idiomas from './idiomas.js';
import ciudades from './ciudades.js';
import fisica from './fisica.js';
import simbolos from './simbolos.js';
import mapas from './mapas.js';
import humana from './humana.js';
import monumentos from './monumentos.js';
import logica from './logica.js';
import records from './records.js';
import * as extra from './extra/index.js';

const CATEGORIAS = [paises, idiomas, ciudades, fisica, simbolos, mapas, humana, monumentos, logica, records];
// Ampliaciones: se añaden sin repetir enunciado (ni el mismo enunciado con la misma respuesta)
for (const c of CATEGORIAS) {
  const mas = extra[c.id] || [];
  const vistas = new Set(c.preguntas.map((q) => `${q.pregunta}|${JSON.stringify(q.respuestas || q.correcta || q.elementos || q.orden || q.valor || q.pistas)}`));
  for (const q of mas) {
    const k = `${q.pregunta}|${JSON.stringify(q.respuestas || q.correcta || q.elementos || q.orden || q.valor || q.pistas)}`;
    if (!vistas.has(k)) { vistas.add(k); c.preguntas.push(q); }
  }
}

export default CATEGORIAS;
