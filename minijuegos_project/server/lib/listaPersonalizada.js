// Validación de la "categoría personalizada" de Quién es Quién (modo administrador).
// IMPORTANTE: el texto del usuario NUNCA se evalúa como código (nada de eval / Function / JSON5).
// Un analizador propio solo acepta un array de cadenas literales: ['a', 'b', 'c'].

export const LIMITES = {
  textoMax: 20000,   // caracteres del texto pegado
  nombreMax: 30,     // caracteres del nombre de la categoría
  elementoMax: 60,   // caracteres de cada elemento
  elementosMin: 2,
  elementosMax: 300
};

// Comillas rectas y tipográficas (el teclado del móvil suele poner las segundas)
const CIERRE = { "'": "'", '"': '"', '‘': '’', '“': '”' };
const ESCAPES_PERMITIDOS = new Set(['\\', "'", '"', '’', '”']);

class ErrorFormato extends Error {}

// Devuelve un array de strings o lanza ErrorFormato con un mensaje para el usuario
function analizarArray(texto) {
  let i = 0;
  const saltar = () => { while (i < texto.length && /\s/.test(texto[i])) i++; };
  const fallo = (msg) => { throw new ErrorFormato(`${msg} (posición ${i + 1}).`); };

  saltar();
  if (texto[i] !== '[') fallo('Debe empezar por «[»');
  i++;

  const items = [];
  for (;;) {
    saltar();
    if (texto[i] === ']') { i++; break; }                       // vacío o coma final
    const apertura = texto[i];
    if (!(apertura in CIERRE)) fallo('Se esperaba un elemento entre comillas, p. ej. \'a\'');
    const cierre = CIERRE[apertura];
    i++;
    let valor = '';
    for (;;) {
      if (i >= texto.length) fallo('Falta cerrar unas comillas');
      const c = texto[i];
      if (c === '\\') {
        const sig = texto[i + 1];
        if (!ESCAPES_PERMITIDOS.has(sig)) fallo('Secuencia con «\\» no permitida');
        valor += sig;
        i += 2;
      } else if (c === cierre) { i++; break; }
      else if (c === '\n' || c === '\r') fallo('Un elemento no puede ocupar varias líneas');
      else { valor += c; i++; }
    }
    items.push(valor);
    saltar();
    if (texto[i] === ',') { i++; continue; }
    if (texto[i] === ']') { i++; break; }
    fallo('Se esperaba «,» o «]»');
  }
  saltar();
  if (texto[i] === ';') { i++; saltar(); }                       // tolera el «;» al pegar código
  if (i < texto.length) fallo('Hay texto sobrante después de «]»');
  return items;
}

// \p{C}: caracteres de control/formato/invisibles. Fuera también < > { } ` y \ (nada de HTML ni código).
const PROHIBIDOS = /[\p{C}<>{}`\\]/u;
const NOMBRE_VALIDO = /^[\p{L}\p{N} .,'’&!¡?¿():_-]+$/u;

const limpiar = (s) => s.normalize('NFC').replace(/\s+/g, ' ').trim();

// Devuelve { ok: true, nombre, elementos, duplicados } o { ok: false, error }
export function validarCategoriaPersonalizada(nombreEntrada, datosEntrada) {
  if (typeof nombreEntrada !== 'string' || typeof datosEntrada !== 'string') {
    return { ok: false, error: 'Datos con formato incorrecto.' };
  }
  if (datosEntrada.length > LIMITES.textoMax) {
    return { ok: false, error: `Los datos son demasiado largos (máximo ${LIMITES.textoMax} caracteres).` };
  }

  const nombre = limpiar(nombreEntrada);
  if (!nombre) return { ok: false, error: 'Escribe un nombre para la categoría.' };
  if (nombre.length > LIMITES.nombreMax) {
    return { ok: false, error: `El nombre no puede pasar de ${LIMITES.nombreMax} caracteres.` };
  }
  if (!NOMBRE_VALIDO.test(nombre)) {
    return { ok: false, error: 'El nombre solo puede llevar letras, números, espacios y signos básicos.' };
  }

  let crudos;
  try {
    crudos = analizarArray(datosEntrada);
  } catch (e) {
    if (e instanceof ErrorFormato) return { ok: false, error: `Formato incorrecto: ${e.message}` };
    throw e;
  }
  if (crudos.length > LIMITES.elementosMax) {
    return { ok: false, error: `Demasiados elementos (máximo ${LIMITES.elementosMax}).` };
  }

  const vistos = new Set();
  const elementos = [];
  let duplicados = 0;
  for (const crudo of crudos) {
    const el = limpiar(crudo);
    if (!el) return { ok: false, error: 'Hay un elemento vacío.' };
    if (el.length > LIMITES.elementoMax) {
      return { ok: false, error: `El elemento «${el.slice(0, 20)}…» pasa de ${LIMITES.elementoMax} caracteres.` };
    }
    if (PROHIBIDOS.test(el)) {
      return { ok: false, error: `El elemento «${el}» contiene caracteres no permitidos (< > { } \` \\ o de control).` };
    }
    const clave = el.toLocaleLowerCase('es');
    if (vistos.has(clave)) { duplicados++; continue; }
    vistos.add(clave);
    elementos.push(el);
  }
  if (elementos.length < LIMITES.elementosMin) {
    return { ok: false, error: `Necesitas al menos ${LIMITES.elementosMin} elementos distintos.` };
  }
  return { ok: true, nombre, elementos, duplicados };
}
