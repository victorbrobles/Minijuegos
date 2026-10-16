// Composiciones recomendadas de roles. Cada receta es una lista «rol» o «rol:cantidad».
// Están pensadas para 8–12 jugadores; para 7, 13 y 14 se adaptan solas (ver `componer`).
// El equilibrio se ha contrastado con simulaciones (ver simulacion.js) y se vuelve a estimar en pantalla.

import { ROLES, ORDEN_ROLES } from './roles.js';

export const MIN_JUGADORES = 7;
export const MAX_JUGADORES = 14;

const expandir = (receta) => receta.split(/\s+/).filter(Boolean).flatMap((tok) => {
  const [rol, n] = tok.split(':');
  return Array(Number(n || 1)).fill(rol);
});

// Orden = prioridad en pantalla: primero las partidas con roles nuevos, la clásica al final.
// `mec` = mecánicas globales que encajan con ese estilo (solo una sugerencia: son opcionales).
export const TIPOS = {
  equilibrada: {
    id: 'equilibrada', nombre: 'Equilibrada', icono: 'shield', caos: 2, complejidad: 2, mec: { rumores: true },
    lema: 'La recomendada',
    descripcion: 'Viuda Negra, Eco, Banquero y compañía junto a un par de clásicos. Poderes nuevos sin perder el hilo.',
    tabla: {
      8:  'lobo lobo_alfa vidente bruja viuda eco banquero aldeano',
      9:  'lobo lobo_alfa vidente bruja viuda eco banquero aldeano:2',
      10: 'lobo:2 lobo_alfa vidente bruja protector viuda eco cartografo aldeano',
      11: 'lobo:2 lobo_alfa vidente bruja protector viuda eco cartografo martir notario',
      12: 'lobo:2 lobo_alfa vidente bruja viuda eco cartografo martir notario banquero aldeano'
    }
  },
  estrategica: {
    id: 'estrategica', nombre: 'Estratégica', icono: 'target', caos: 1, complejidad: 3, mec: { rumores: true },
    lema: 'Ingenio sobre suerte',
    descripcion: 'Notario, Eco, Cartógrafo, Falsificador y Lobo Sigiloso: información cruzada y muchos faroles, casi nada de azar.',
    tabla: {
      8:  'lobo_sigiloso falsificador vidente protector notario eco aldeano:2',
      9:  'lobo_sigiloso falsificador vidente notario eco cartografo juez aldeano:2',
      10: 'lobo lobo_sigiloso falsificador vidente bruja viuda eco cartografo notario aldeano',
      11: 'lobo lobo_sigiloso falsificador vidente bruja juez eco cartografo notario viuda aldeano',
      12: 'lobo lobo_sigiloso falsificador vidente juez eco cartografo notario viuda protector aldeano:2'
    }
  },
  traiciones: {
    id: 'traiciones', nombre: 'Traiciones', icono: 'mask', caos: 3, complejidad: 3, mec: { eventos: true, rumores: true },
    lema: 'Nadie es quien parece',
    descripcion: 'Agente Doble, Camaleón, Parásito y Cupido: lealtades que se sortean, cambian o se heredan. Paranoia garantizada.',
    tabla: {
      8:  'lobo vidente protector bruja agente_doble camaleon parasito aldeano',
      9:  'lobo lobo_alfa vidente protector bruja cazador cupido parasito agente_doble',
      10: 'lobo lobo_alfa vidente protector bruja agente_doble camaleon cazador aldeano:2',
      11: 'lobo lobo_alfa vidente protector bruja agente_doble camaleon cazador cupido parasito aldeano',
      12: 'lobo lobo_alfa vidente protector bruja agente_doble camaleon cazador cupido parasito aldeano:2'
    }
  },
  intrigas: {
    id: 'intrigas', nombre: 'Intrigas de palacio', icono: 'landmark', caos: 2, complejidad: 3, mec: { modif: true, objetos: true },
    lema: 'Dinero, votos y sentencias',
    descripcion: 'Banquero, Juez Corrupto, Ladrón de Voces y Notario: las votaciones se compran, se roban y se repiten.',
    tabla: {
      8:  'lobo lobo_alfa vidente bruja juez notario ladron aldeano',
      9:  'lobo lobo_alfa vidente bruja juez notario ladron banquero aldeano',
      10: 'lobo lobo_alfa vidente juez notario ladron banquero eco aldeano:2',
      11: 'lobo:2 lobo_alfa vidente bruja protector juez notario ladron eco aldeano',
      12: 'lobo:2 lobo_alfa vidente bruja juez notario ladron banquero eco viuda aldeano'
    }
  },
  plaga: {
    id: 'plaga', nombre: 'Plaga y destino', icono: 'flask', caos: 3, complejidad: 3, mec: { eventos: true, objetos: true },
    lema: 'Una epidemia en la aldea',
    descripcion: 'El Contagiado propaga la enfermedad, el Heredero Maldito busca que lo linchen y la Viuda lo cobra caro.',
    tabla: {
      8:  'lobo lobo_alfa vidente protector contagiado viuda hechicero aldeano',
      9:  'lobo lobo_alfa vidente contagiado viuda heredero eco aldeano:2',
      10: 'lobo:2 lobo_alfa vidente bruja contagiado viuda hechicero eco heredero',
      11: 'lobo:2 lobo_alfa vidente bruja contagiado viuda hechicero eco heredero aldeano',
      12: 'lobo:2 lobo_alfa vidente contagiado viuda hechicero eco heredero cazador aldeano:2'
    }
  },
  caotica: {
    id: 'caotica', nombre: 'Caótica', icono: 'dice', caos: 3, complejidad: 3, mec: { eventos: true, objetos: true, rumores: true, modif: true },
    lema: 'Todo puede pasar',
    descripcion: 'Rebobinados, votos robados, parásitos y, con más gente, pirómanos y herederos malditos. Giros constantes y risas aseguradas.',
    tabla: {
      8:  'lobo lobo_alfa vidente cazador cupido hechicero ladron eco',
      9:  'lobo lobo_alfa vidente cupido hechicero ladron parasito eco aldeano',
      10: 'lobo lobo_sigiloso lobo_alfa vidente bruja cazador cupido hechicero ladron protector',
      11: 'lobo lobo_sigiloso lobo_alfa vidente bruja cazador cupido hechicero ladron parasito piromano',
      12: 'lobo lobo_sigiloso lobo_alfa vidente bruja cazador cupido hechicero ladron parasito piromano heredero'
    }
  },
  clasica: {
    id: 'clasica', nombre: 'Clásica', icono: 'moon', caos: 1, complejidad: 1, mec: {},
    lema: 'La partida de siempre',
    descripcion: 'Solo roles de toda la vida, fáciles de explicar. Ideal para estrenar el juego con gente nueva.',
    tabla: {
      8:  'lobo:2 vidente cazador cupido aldeano:3',
      9:  'lobo:3 vidente bruja cazador cupido protector aldeano',
      10: 'lobo:3 vidente bruja cazador cupido aldeano:3',
      11: 'lobo:3 vidente bruja cazador cupido aldeano:4',
      12: 'lobo:3 vidente cazador cupido aldeano:6'
    }
  }
};

// Roles que se retiran primero cuando sobran huecos (juegos de 7)
const PRESCINDIBLES = ['aldeano', 'heredero', 'piromano', 'parasito', 'juez', 'hechicero', 'ladron', 'cartografo', 'martir', 'cupido', 'eco', 'notario', 'banquero'];

export function componer(tipo, n) {
  const t = TIPOS[tipo];
  const base = expandir(t.tabla[Math.min(12, Math.max(8, n))]);
  let roles = [...base];
  if (n > 12) {
    if (n >= 14) roles.push('lobo');
    while (roles.length < n) roles.push('aldeano');
  }
  while (roles.length > n) {
    const quitar = PRESCINDIBLES.find((r) => roles.includes(r));
    roles.splice(roles.lastIndexOf(quitar), 1);
  }
  return roles;
}

export const aRecuento = (roles) => roles.reduce((m, r) => ({ ...m, [r]: (m[r] || 0) + 1 }), {});
export const deRecuento = (rec) => ORDEN_ROLES.flatMap((r) => Array(rec[r] || 0).fill(r));

// Validación de una composición (recomendada o personalizada)
export function validar(roles, n) {
  const errores = [];
  const avisos = [];
  const rec = aRecuento(roles);
  const lobos = roles.filter((r) => ROLES[r].bando === 'lobos').length;
  const solitarios = roles.filter((r) => ROLES[r].bando === 'solitario' && !ROLES[r].neutral).length + (rec.contagiado || 0);

  if (roles.length !== n) errores.push(`Hay ${roles.length} roles para ${n} jugadores.`);
  if (lobos === 0) errores.push('Tiene que haber al menos un lobo.');
  Object.entries(rec).forEach(([r, c]) => { if (ROLES[r].unico && c > 1) errores.push(`«${ROLES[r].nombre}» solo puede aparecer una vez.`); });

  if (lobos > 0) {
    if (lobos > Math.ceil(n * 0.4)) avisos.push('Demasiados lobos: el pueblo lo tendrá muy difícil.');
    else if (lobos < Math.floor(n / 5)) avisos.push('Pocos lobos para tantos jugadores: la partida puede quedar sosa.');
    if (lobos >= n / 2) errores.push('Los lobos ya serían mitad de la mesa: ganarían de inicio.');
  }
  if (solitarios > 2) avisos.push('Con más de dos roles solitarios la partida se vuelve muy impredecible.');
  if (solitarios > 0 && n < 9) avisos.push('Los roles solitarios funcionan mejor a partir de 9 jugadores.');
  if (rec.parasito && roles.filter((r) => ROLES[r].bando === 'pueblo').length < 4) avisos.push('El Parásito necesita varios roles de pueblo con poder para ser interesante.');
  if (rec.cupido && rec.hechicero && n < 9) avisos.push('Cupido + Hechicero en pocos jugadores puede resultar caótico en exceso.');
  if (rec.piromano && rec.contagiado) avisos.push('Pirómano y Contagiado juntos: dos victorias en solitario compiten con lobos y pueblo.');
  const lobosEfectivos = lobos + (rec.agente_doble ? 0.5 : 0) + (rec.camaleon ? 0.6 : 0);
  if (lobosEfectivos > Math.ceil(n * 0.4)) avisos.push('Con el Agente Doble y el Camaleón, los lobos pueden ser muchos más de lo que parece.');
  if ((rec.camaleon || rec.agente_doble) && !rec.vidente) avisos.push('Camaleón y Agente Doble brillan con un Vidente en la partida.');
  const complejos = roles.filter((r) => ROLES[r].complejidad === 3).length;
  if (complejos >= 5) avisos.push('Hay muchos roles avanzados: asegúrate de que todos conocen las reglas.');
  return { errores, avisos };
}

export const complejidadTotal = (roles) => {
  const m = roles.reduce((s, r) => s + ROLES[r].complejidad, 0) / roles.length;
  return m < 1.4 ? 'Fácil' : m < 1.9 ? 'Media' : 'Avanzada';
};
