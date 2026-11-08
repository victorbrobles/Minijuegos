// client/src/games/Catador/motor.js
// Generador de casos de «El Catador de Mentiras».
// Cada sospechoso hace una declaración; sabemos cuántas son verdad. Solo un culpable encaja.
// Se resuelve por fuerza bruta (culpable × combinación de verdades), así que cada caso
// generado tiene exactamente una solución y una única forma de repartir verdades y mentiras.

export const PERSONAJES = [
  { nombre: 'Rosa', avatar: '👩‍🍳', oficio: 'la cocinera' },
  { nombre: 'Bruno', avatar: '🧔', oficio: 'el jardinero' },
  { nombre: 'Clara', avatar: '👩‍🔬', oficio: 'la científica' },
  { nombre: 'Dimas', avatar: '🕵️', oficio: 'el detective retirado' },
  { nombre: 'Elena', avatar: '👩‍🎤', oficio: 'la cantante' },
  { nombre: 'Fede', avatar: '👨‍🚀', oficio: 'el astronauta' },
  { nombre: 'Gala', avatar: '👸', oficio: 'la condesa' },
  { nombre: 'Hugo', avatar: '🤵', oficio: 'el mayordomo' },
  { nombre: 'Irene', avatar: '👩‍🎨', oficio: 'la pintora' },
  { nombre: 'Julio', avatar: '👨‍🌾', oficio: 'el granjero' },
  { nombre: 'Lola', avatar: '👵', oficio: 'la abuela' },
  { nombre: 'Marco', avatar: '🧑‍✈️', oficio: 'el piloto' }
];

export const MISTERIOS = [
  '¿Quién se ha comido la tarta de cumpleaños?',
  '¿Quién ha robado el collar de perlas?',
  '¿Quién ha dejado la puerta del gallinero abierta?',
  '¿Quién ha escondido el mando de la tele?',
  '¿Quién ha pintado bigotes al retrato del abuelo?',
  '¿Quién se ha bebido el último zumo?',
  '¿Quién ha roto el jarrón chino?',
  '¿Quién ha cambiado la contraseña del wifi?',
  '¿Quién ha soltado al loro?',
  '¿Quién ha cogido la llave de la bodega?',
  '¿Quién ha puesto sal en el café?',
  '¿Quién ha borrado la partida guardada?'
];

const azar = (n) => Math.floor(Math.random() * n);
const elegir = (lista) => lista[azar(lista.length)];

/** Valor de verdad de la declaración i, dado el culpable y el vector de verdades supuesto. */
function evaluar(d, culpable, verdades) {
  switch (d.tipo) {
    case 'culpable': return culpable === d.x;
    case 'inocente': return culpable !== d.x;
    case 'uno_de': return culpable === d.x || culpable === d.y;
    case 'miente': return !verdades[d.x];
    case 'verdad': return verdades[d.x];
    default: return false;
  }
}

/** Todas las soluciones consistentes: [{ culpable, verdades }] */
export function resolver(declaraciones, numVerdad) {
  const n = declaraciones.length;
  const soluciones = [];
  for (let c = 0; c < n; c++) {
    for (let m = 0; m < 1 << n; m++) {
      const v = Array.from({ length: n }, (_, i) => Boolean(m & (1 << i)));
      if (v.filter(Boolean).length !== numVerdad) continue;
      if (declaraciones.every((d, i) => evaluar(d, c, v) === v[i])) soluciones.push({ culpable: c, verdades: v });
    }
  }
  return soluciones;
}

function declaracionAlAzar(i, n, dificil) {
  const otro = () => { let x; do { x = azar(n); } while (x === i); return x; };
  const r = Math.random();
  if (r < 0.2) return { tipo: 'inocente', x: i };
  if (r < 0.38) return { tipo: 'culpable', x: otro() };
  if (r < 0.54) return { tipo: 'inocente', x: otro() };
  if (r < 0.68) {
    const x = azar(n); let y; do { y = azar(n); } while (y === x);
    return { tipo: 'uno_de', x: Math.min(x, y), y: Math.max(x, y) };
  }
  if (r < (dificil ? 0.9 : 0.85)) return { tipo: 'miente', x: otro() };
  return { tipo: 'verdad', x: otro() };
}

/** Genera un caso con solución única. nivel: número de sospechosos (3 a 5). */
export function generarCaso(numSospechosos = 3) {
  const n = numSospechosos;
  for (let intento = 0; intento < 5000; intento++) {
    const decl = Array.from({ length: n }, (_, i) => declaracionAlAzar(i, n, n >= 5));
    // Evita declaraciones repetidas exactas: queda más variado
    const firmas = decl.map((d) => JSON.stringify(d));
    if (new Set(firmas).size < n) continue;
    const numVerdad = azar(n + 1);
    const sol = resolver(decl, numVerdad);
    if (sol.length !== 1) continue;
    // Que no sea trivial: al menos una declaración de referencia (miente/verdad) a partir de 4 sospechosos
    if (n >= 4 && !decl.some((d) => d.tipo === 'miente' || d.tipo === 'verdad')) continue;
    const personajes = [...PERSONAJES].sort(() => Math.random() - 0.5).slice(0, n);
    return {
      misterio: elegir(MISTERIOS),
      personajes,
      declaraciones: decl,
      numVerdad,
      culpable: sol[0].culpable,
      verdades: sol[0].verdades
    };
  }
  throw new Error('No se pudo generar un caso');
}

/** Texto de la declaración del sospechoso i. */
export function textoDeclaracion(d, i, personajes) {
  const nom = (x) => personajes[x].nombre;
  switch (d.tipo) {
    case 'culpable': return d.x === i ? 'He sido yo.' : `Ha sido ${nom(d.x)}.`;
    case 'inocente': return d.x === i ? 'Yo no he sido.' : `${nom(d.x)} no ha sido.`;
    case 'uno_de':
      if (d.x === i) return `He sido yo o ${nom(d.y)}.`;
      if (d.y === i) return `He sido yo o ${nom(d.x)}.`;
      return `Ha sido ${nom(d.x)} o ${nom(d.y)}.`;
    case 'miente': return `${nom(d.x)} miente.`;
    case 'verdad': return `${nom(d.x)} dice la verdad.`;
    default: return '';
  }
}

export function textoPista(numVerdad, n) {
  if (numVerdad === 0) return 'Todos mienten.';
  if (numVerdad === n) return 'Todos dicen la verdad.';
  if (numVerdad === 1) return 'Solo uno dice la verdad.';
  if (numVerdad === n - 1) return 'Solo uno miente.';
  return `Exactamente ${numVerdad} dicen la verdad.`;
}
