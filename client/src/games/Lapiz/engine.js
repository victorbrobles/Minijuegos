// client/src/games/Lapiz/engine.js
// «¡Lápiz fuera!»: sale una letra y ocho categorías (nombre, animal, país…). Cada uno escribe una palabra por categoría
// que empiece por esa letra. Cuando alguien termina y dice «¡lápiz fuera!», los demás tienen 10 segundos más.
// Después se revisan las respuestas entre todos (se anula por mayoría) y se puntúa: 10 si nadie más ha puesto lo
// mismo, 5 si está repetida y 20 si eres el único que ha escrito algo válido en esa categoría.
// Motor puro (servidor y modo un dispositivo). item: { letra, categorias: [8] }
import { crearMotor, base, compacto, distancia } from '../comun/simultaneo.js';

export const SEGUNDOS = 120;
export const CIERRE = 10;
export const SEGUNDOS_LOCAL = 90;
export const PUNTOS = { unica: 10, repetida: 5, sola: 20 };

const empiezaPor = (txt, letra) => base(txt).replace(/^(el|la|los|las|un|una) /, '').startsWith(base(letra));
/** ¿Es una respuesta con forma válida (no vacía y con la letra)? Lo demás lo decide la revisión. */
export const conLetra = (txt, letra) => Boolean(String(txt || '').trim()) && empiezaPor(txt, letra);
const iguales = (a, b) => {
  const x = compacto(a); const y = compacto(b);
  return x === y || (Math.min(x.length, y.length) >= 5 && distancia(x, y) <= 1);
};

export const M = crearMotor({
  segundos: () => SEGUNDOS,
  cierre: CIERRE,
  revision: true,
  validar(p, item, id, lista) {
    if (!Array.isArray(lista)) return { ok: false, error: 'Respuesta no válida.' };
    return { ok: true, valor: item.categorias.map((_, k) => String(lista[k] ?? '').trim().slice(0, 40)) };
  },
  puntuar(p, item, r, anuladas) {
    const puntos = {}; const aciertos = {}; const celdas = {};
    item.categorias.forEach((_, k) => {
      const validas = Object.entries(r)
        .filter(([id, l]) => l && conLetra(l[k], item.letra) && !anuladas.has(`${id}:${k}`))
        .map(([id, l]) => ({ id, txt: l[k] }));
      validas.forEach((x) => {
        const pts = validas.length === 1 ? PUNTOS.sola : validas.some((y) => y.id !== x.id && iguales(x.txt, y.txt)) ? PUNTOS.repetida : PUNTOS.unica;
        puntos[x.id] = (puntos[x.id] || 0) + pts;
        celdas[`${x.id}:${k}`] = pts;
      });
    });
    Object.keys(r).forEach((id) => { aciertos[id] = item.categorias.every((_, k) => celdas[`${id}:${k}`]); });
    return { puntos, aciertos, detalle: { celdas, respuestas: r } };
  },
  vistaItem(p, item, id, fase) {
    const ver = fase === 'revision' || fase === 'resuelta';
    return {
      letra: item.letra, categorias: item.categorias,
      respuestas: ver ? p.respuestas : null,
      mias: p.respuestas[id] ?? null,
      cierre: fase === 'jugando' && Object.keys(p.respuestas).length > 0
    };
  }
});
