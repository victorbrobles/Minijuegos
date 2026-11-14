// server/lib/solo.js
// Contenido de los juegos de un jugador de trivia y fútbol (se sirve en /api/solo/:juego):
//   escalera · cronologia · cadena · quiensoy · onceperdido · conexion · duelofutbol · escudo · manager · misterioso
// Todo sale de semillas que ya existen (Tablero, Ponlo en orden, Escondite, famosos del reto, Once Fantasma,
// Modo carrera, Cuatro clubes y Director Deportivo).
import { PREGUNTAS, CATEGORIAS as CATS_TABLERO } from '../data/seeds/tablero/preguntas.js';
import { TEMAS } from '../data/seeds/ordenar/temas.js';
import { TODAS as CATEGORIAS_ESCONDITE } from '../data/seeds/escondite/index.js';
import { FAMOSOS, PREGUNTAS_FAMOSO } from '../data/seeds/reto/famosos.js';
import { PARTIDOS } from '../data/seeds/oncefantasma/onces.js';
import { RETOS_TRAYECTORIAS } from '../data/seeds/trayectoria/trayectorias.seed.js';
import { CLUBES_INFO } from '../data/seeds/cuatroclubes/cuatroclubes.js';
import { FUTBOLISTAS } from '../data/seeds/director/futbolistas.js';
import { precio, mediaTemporada } from '../../client/src/games/Director/engine.js';

const r = (n) => Math.floor(Math.random() * n);
export const barajar = (l) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = r(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const norm = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();

// ------------------------------------------------------------------ Escalera de la fortuna
const CAT = Object.fromEntries(CATS_TABLERO.map((c) => [c.id, c]));
const preguntaDe = (q) => ({ p: q.p, opciones: barajar(q.o), correcta: q.o[0], cat: `${CAT[q.cat]?.emoji || '❓'} ${CAT[q.cat]?.nombre || q.cat}`, nivel: q.v / 100 });
export function escalera() {
  const usadas = new Set();
  const una = (v) => {
    const q = barajar(PREGUNTAS.filter((x) => x.v === v && !usadas.has(x.p)))[0];
    usadas.add(q.p); return preguntaDe(q);
  };
  const valores = [100, 100, 100, 200, 200, 200, 300, 300, 300, 400, 400, 400, 500, 500, 500];
  return { preguntas: valores.map(una), reservas: [100, 200, 300, 400, 500].map(una) };
}

// ------------------------------------------------------------------ Línea del tiempo
const FRASE_TEMA = {
  personajes: (t) => `Nace ${t}`,
  peliculas: (t) => `Se estrena «${t}»`,
  libros: (t) => `Se publica «${t}»`,
  consolas: (t) => `Sale a la venta la ${t}`,
  arte: (t) => `Se pinta o crea «${t}»`,
  inventos: (t) => `Invento: ${t}`,
  mundiales: (t) => t,
  hechos: (t) => t
};
export function cronologia() {
  const items = TEMAS.filter((t) => FRASE_TEMA[t.id]).flatMap((t) => t.items.map(([texto, anio]) => ({ texto: FRASE_TEMA[t.id](texto), anio, emoji: t.emoji })));
  return { cartas: barajar(items).slice(0, 80) };
}

// ------------------------------------------------------------------ Categorías encadenadas
export function cadena() {
  const cats = barajar(CATEGORIAS_ESCONDITE).slice(0, 60).map((c) => ({
    titulo: c.titulo, emoji: c.emoji,
    opciones: c.opciones.map((o) => { const [nombre, ...alias] = o.split('|'); return { nombre, alias }; })
  }));
  return { categorias: cats };
}

// ------------------------------------------------------------------ ¿Quién soy? contrarreloj
const firma = (f) => PREGUNTAS_FAMOSO.map(([, , fn]) => (fn(f) ? 1 : 0)).join('');
export function quiensoy() {
  const cuenta = {};
  FAMOSOS.forEach((f) => { const s = firma(f); cuenta[s] = (cuenta[s] || 0) + 1; });
  const unicos = FAMOSOS.map((f, i) => i).filter((i) => cuenta[firma(FAMOSOS[i])] === 1);
  return {
    candidatos: FAMOSOS.map((f) => ({ nombre: f.nombre, campo: f.campo })),
    preguntas: PREGUNTAS_FAMOSO.map(([id, texto, fn]) => ({ id, texto, si: FAMOSOS.map((f, k) => (fn(f) ? k : -1)).filter((k) => k >= 0) })),
    objetivos: barajar(unicos)
  };
}

// ------------------------------------------------------------------ El once perdido
export function onceperdido() {
  const rondas = barajar(PARTIDOS.flatMap((p) => p.onces.map((o) => ({ p, o })))).slice(0, 5).map(({ p, o }) => {
    const ocultos = barajar(o.jugadores.map((_, i) => i)).slice(0, 4).sort((a, b) => a - b);
    return {
      partido: p.partido, equipo: o.equipo, entrenador: o.entrenador,
      jugadores: o.jugadores.map((j, i) => ({ nombre: j.nombre, alias: j.alias, pos: j.pos, dorsal: j.dorsal, dato: j.dato, pista: j.pista, oculto: ocultos.includes(i) }))
    };
  });
  return { rondas };
}

// ------------------------------------------------------------------ Conexión de jugadores (grafo de compañeros)
const anioFin = (t) => (/presente/i.test(t) ? 2025 : Number(t));
function construirGrafo() {
  const nodos = new Map(); // clave → { nombre, alias:Set, famoso }
  const enlaces = new Map(); // clave → Map(clave → motivo)
  const nodo = (nombre, alias = [], famoso = false) => {
    const k = norm(nombre);
    if (!nodos.has(k)) nodos.set(k, { nombre, alias: new Set(), famoso: false });
    const n = nodos.get(k); alias.forEach((a) => n.alias.add(norm(a))); if (famoso) n.famoso = true;
    return k;
  };
  const unir = (a, b, motivo) => {
    if (a === b) return;
    for (const [x, y] of [[a, b], [b, a]]) {
      if (!enlaces.has(x)) enlaces.set(x, new Map());
      if (!enlaces.get(x).has(y)) enlaces.get(x).set(y, motivo);
    }
  };
  // 1) Titulares en el mismo once de un partido histórico
  for (const p of PARTIDOS) {
    for (const o of p.onces) {
      const ks = o.jugadores.map((j) => nodo(j.nombre, j.alias));
      const nombrePartido = p.partido.split(' · ')[0];
      ks.forEach((a) => ks.forEach((b) => unir(a, b, `Titulares juntos con ${o.equipo} (${nombrePartido})`)));
    }
  }
  // 2) Coincidieron en un club (Modo carrera): periodos que se solapan al menos una temporada
  const porClub = new Map();
  for (const t of RETOS_TRAYECTORIAS) {
    const k = nodo(t.nombre, t.alias || [], t.dificultad === 'baja');
    for (const c of t.clubes) {
      const [a, b] = String(c.periodo).split('-').map((x) => x.trim());
      const ini = Number(a); const fin = anioFin(b || a);
      if (!Number.isFinite(ini) || !Number.isFinite(fin)) continue;
      if (!porClub.has(c.nombre)) porClub.set(c.nombre, []);
      porClub.get(c.nombre).push({ k, ini, fin });
    }
  }
  for (const [club, l] of porClub) {
    for (let i = 0; i < l.length; i++) {
      for (let j = i + 1; j < l.length; j++) {
        const desde = Math.max(l[i].ini, l[j].ini); const hasta = Math.min(l[i].fin, l[j].fin);
        if (hasta - desde >= 1) unir(l[i].k, l[j].k, `Coincidieron en el ${club} (${desde}-${hasta})`);
      }
    }
  }
  // 3) Compañeros esta temporada (Director Deportivo, 2025/26)
  const actuales = new Map();
  for (const f of FUTBOLISTAS) {
    const k = nodo(f.nombre, [], f.media >= 85);
    if (!actuales.has(f.club)) actuales.set(f.club, []);
    actuales.get(f.club).push(k);
  }
  for (const [club, ks] of actuales) ks.forEach((a) => ks.forEach((b) => unir(a, b, `Compañeros en el ${club} (2025/26)`)));
  return { nodos, enlaces };
}
let GRAFO = null;
const grafo = () => (GRAFO ||= construirGrafo());

/** Busca a un jugador por lo que se escribe: nombre completo, alias o apellido único. */
export function buscarJugador(texto) {
  const { nodos } = grafo();
  const t = norm(texto);
  if (!t) return null;
  if (nodos.has(t)) return t;
  const por = [...nodos.entries()].filter(([k, n]) => n.alias.has(t) || k.split(' ').slice(-1)[0] === t);
  return por.length === 1 ? por[0][0] : null;
}
function caminoMasCorto(a, b) {
  const { enlaces } = grafo();
  const prev = new Map([[a, null]]); const cola = [a];
  while (cola.length) {
    const x = cola.shift();
    if (x === b) break;
    for (const y of enlaces.get(x)?.keys() || []) if (!prev.has(y)) { prev.set(y, x); cola.push(y); }
  }
  if (!prev.has(b)) return null;
  const camino = []; for (let x = b; x; x = prev.get(x)) camino.unshift(x);
  return camino;
}
const describir = (camino) => {
  const { nodos, enlaces } = grafo();
  return camino.map((k, i) => ({ nombre: nodos.get(k).nombre, motivo: i ? enlaces.get(camino[i - 1]).get(k) : null }));
};
export function conexion() {
  const { nodos, enlaces } = grafo();
  const famosos = [...nodos.entries()].filter(([k, n]) => n.famoso && (enlaces.get(k)?.size || 0) >= 3).map(([k]) => k);
  const retos = []; const usados = new Set();
  for (let intento = 0; intento < 4000 && retos.length < 5; intento++) {
    const a = famosos[r(famosos.length)]; const b = famosos[r(famosos.length)];
    if (a === b || usados.has(a) || usados.has(b)) continue;
    const c = caminoMasCorto(a, b);
    const minimo = retos.length < 2 ? 3 : 4; // los dos primeros con 1 eslabón; luego con 2
    if (!c || c.length !== minimo) continue;
    usados.add(a); usados.add(b);
    retos.push({ desde: nodos.get(a).nombre, hasta: nodos.get(b).nombre, eslabones: c.length - 2, solucion: describir(c) });
  }
  return { retos, nombres: [...nodos.values()].map((n) => n.nombre).sort((x, y) => x.localeCompare(y, 'es')) };
}
/** ¿Son compañeros? Devuelve el motivo o null. */
export function enlace(a, b) {
  const ka = buscarJugador(a); const kb = buscarJugador(b);
  if (!ka || !kb) return { ok: false, error: !kb ? 'No conozco a ese jugador.' : 'Jugador desconocido.' };
  const motivo = grafo().enlaces.get(ka)?.get(kb);
  return motivo ? { ok: true, nombre: grafo().nodos.get(kb).nombre, motivo } : { ok: false, nombre: grafo().nodos.get(kb).nombre };
}

// ------------------------------------------------------------------ Más o menos fútbol
const AHORA = 2025;
export function duelofutbol() {
  const tray = RETOS_TRAYECTORIAS.map((t) => {
    const anios = t.clubes.map((c) => Number(String(c.periodo).split('-')[0])).filter(Number.isFinite);
    return { nombre: t.nombre, sub: t.nacionalidad, clubes: t.clubes.length, debut: Math.min(...anios), dificultad: t.dificultad };
  }).filter((t) => Number.isFinite(t.debut));
  const actuales = FUTBOLISTAS.filter((f) => f.media >= 78).map((f) => ({ nombre: f.nombre, sub: `${f.club} · ${f.pos}`, edad: f.edad, media: f.media, valor: precio(f) }));
  const TIPOS = [
    { id: 'clubes', pregunta: '¿Quién ha jugado en MÁS clubes en su carrera?', lista: tray, campo: 'clubes', unidad: (v) => `${v} clubes`, mayor: true },
    { id: 'debut', pregunta: '¿Quién empezó ANTES su carrera profesional?', lista: tray, campo: 'debut', unidad: (v) => `debutó en ${v}`, mayor: false },
    { id: 'edad', pregunta: '¿Quién es MAYOR? (temporada 2025/26)', lista: actuales, campo: 'edad', unidad: (v) => `${v} años`, mayor: true },
    { id: 'media', pregunta: '¿Quién tiene MÁS media en Director Deportivo? (2025/26)', lista: actuales, campo: 'media', unidad: (v) => `media ${v}`, mayor: true },
    { id: 'valor', pregunta: '¿Quién vale MÁS en el mercado de Director Deportivo?', lista: actuales, campo: 'valor', unidad: (v) => `${v} M€`, mayor: true }
  ];
  const duelos = [];
  for (let n = 0; duelos.length < 120 && n < 5000; n++) {
    const t = TIPOS[r(TIPOS.length)];
    const a = t.lista[r(t.lista.length)]; const b = t.lista[r(t.lista.length)];
    if (a === b || a[t.campo] === b[t.campo]) continue;
    const dif = Math.abs(a[t.campo] - b[t.campo]);
    duelos.push({
      pregunta: t.pregunta, tipo: t.id, dif,
      a: { nombre: a.nombre, sub: a.sub, valor: t.unidad(a[t.campo]) },
      b: { nombre: b.nombre, sub: b.sub, valor: t.unidad(b[t.campo]) },
      gana: (t.mayor ? a[t.campo] > b[t.campo] : a[t.campo] < b[t.campo]) ? 'a' : 'b'
    });
  }
  // De más fácil (mucha diferencia relativa) a más difícil
  const rel = (d) => d.dif / ({ clubes: 4, debut: 8, edad: 8, media: 8, valor: 60 }[d.tipo]);
  const ordenados = duelos.sort((x, y) => rel(y) - rel(x));
  const tercio = Math.floor(ordenados.length / 3);
  return { duelos: [...barajar(ordenados.slice(0, tercio)), ...barajar(ordenados.slice(tercio, 2 * tercio)), ...barajar(ordenados.slice(2 * tercio))] };
}

// ------------------------------------------------------------------ Escudo borroso
const miniatura = (url) => {
  const m = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/(commons|en)\/([0-9a-f])\/([0-9a-f]{2})\/([^/]+\.svg)$/i.exec(url || '');
  return m ? `https://upload.wikimedia.org/wikipedia/${m[1]}/thumb/${m[2]}/${m[3]}/${m[4]}/240px-${m[4]}.png` : url;
};
const NOMBRE_CLUB = { 'Inter de Milán': 'Inter de Milán', 'Paris Saint-Germain': 'PSG (Paris Saint-Germain)' };
export function escudo() {
  const clubes = new Map();
  for (const t of RETOS_TRAYECTORIAS) for (const c of t.clubes) if (c.logo && !clubes.has(c.nombre)) clubes.set(c.nombre, { nombre: NOMBRE_CLUB[c.nombre] || c.nombre, logo: c.logo.replace('/120px-', '/240px-'), color: c.colores?.[0] });
  for (const c of Object.values(CLUBES_INFO)) {
    const ya = [...clubes.keys()].some((k) => norm(k).includes(norm(c.nombre)) || norm(c.nombre).includes(norm(k)));
    if (c.escudo && !ya) clubes.set(c.nombre, { nombre: c.nombre, logo: miniatura(c.escudo), color: c.colores?.[0] });
  }
  const lista = [...clubes.values()];
  const rondas = barajar(lista).slice(0, 10).map((c) => ({
    logo: c.logo, correcta: c.nombre,
    opciones: barajar([c.nombre, ...barajar(lista.filter((x) => x !== c)).slice(0, 3).map((x) => x.nombre)])
  }));
  return { rondas };
}

// ------------------------------------------------------------------ Manager por un día
const RIVALES = ['Real Gamonal', 'Atlético Patatal', 'Unión Gazpacho', 'Sporting Tortilla', 'Deportivo Siesta', 'Racing Churros', 'CD Botijo',
  'Real Chistorra', 'UD Botafumeiro', 'CF Paella Mixta', 'Olímpico Pimentón', 'Club Croqueta', 'Recreativo Turrón', 'SD Migas', 'Inter de Lentejas',
  'Athletic Mojo Picón', 'Real Ensaimada', 'Celta de Pulpo', 'Betis Salmorejo'];
export function manager() {
  const jugadores = FUTBOLISTAS.map((f) => ({ nombre: f.nombre, pos: f.pos, edad: f.edad, club: f.club, pais: f.pais, precio: precio(f), m: mediaTemporada(f) }));
  const porPos = (p) => barajar(jugadores.filter((j) => j.pos === p));
  const P = { POR: porPos('POR'), DEF: porPos('DEF'), MED: porPos('MED'), DEL: porPos('DEL') };
  // Tres mercados de 12 ofertas (3 por puesto), con estrellas, normales y gangas mezcladas
  const mercados = [0, 1, 2].map((k) => barajar(['POR', 'DEF', 'MED', 'DEL'].flatMap((p) => P[p].slice(k * 3, k * 3 + 3))));
  const rivales = barajar(RIVALES).map((nombre, i) => ({ nombre, fuerza: 70 + Math.round((i / (RIVALES.length - 1)) * 14 + Math.random() * 2) }));
  return { presupuesto: 220, mercados, rivales };
}

// ------------------------------------------------------------------ Futbolista misterioso
const LIGA = {
  'Real Madrid': 'LaLiga', Barcelona: 'LaLiga', 'Atlético': 'LaLiga', Athletic: 'LaLiga', 'Real Sociedad': 'LaLiga', Celta: 'LaLiga', Betis: 'LaLiga', Villarreal: 'LaLiga',
  Osasuna: 'LaLiga', Valencia: 'LaLiga', Mallorca: 'LaLiga', 'Rayo Vallecano': 'LaLiga', Girona: 'LaLiga', Espanyol: 'LaLiga', Sevilla: 'LaLiga',
  Liverpool: 'Premier League', 'Man City': 'Premier League', Arsenal: 'Premier League', Tottenham: 'Premier League', 'Aston Villa': 'Premier League', Burnley: 'Premier League',
  Chelsea: 'Premier League', 'Man United': 'Premier League', Newcastle: 'Premier League', Sunderland: 'Premier League', 'West Ham': 'Premier League', Brighton: 'Premier League',
  Everton: 'Premier League', 'Nottingham Forest': 'Premier League', 'Crystal Palace': 'Premier League', Fulham: 'Premier League',
  Milan: 'Serie A', Inter: 'Serie A', Juventus: 'Serie A', 'Nápoles': 'Serie A', Atalanta: 'Serie A', Como: 'Serie A', Fiorentina: 'Serie A', Roma: 'Serie A', Lazio: 'Serie A', Bolonia: 'Serie A',
  Dortmund: 'Bundesliga', Bayern: 'Bundesliga', Leverkusen: 'Bundesliga', Hoffenheim: 'Bundesliga', Stuttgart: 'Bundesliga', Leipzig: 'Bundesliga', 'Eintracht Fráncfort': 'Bundesliga',
  PSG: 'Ligue 1', 'Paris FC': 'Ligue 1',
  'Fenerbahçe': 'Liga turca', Trabzonspor: 'Liga turca', Galatasaray: 'Liga turca', Oporto: 'Liga portuguesa', Sporting: 'Liga portuguesa',
  'Al Hilal': 'Liga saudí', 'Al Nassr': 'Liga saudí', 'Al Ittihad': 'Liga saudí', 'Los Angeles FC': 'MLS', 'Inter Miami': 'MLS', Santos: 'Liga brasileña'
};
const PAIS = {
  BEL: ['Bélgica', 'eu'], BRA: ['Brasil', 'am'], ITA: ['Italia', 'eu'], GER: ['Alemania', 'eu'], SVN: ['Eslovenia', 'eu'], FRA: ['Francia', 'eu'], ESP: ['España', 'eu'],
  SUI: ['Suiza', 'eu'], POR: ['Portugal', 'eu'], CMR: ['Camerún', 'af'], GEO: ['Georgia', 'eu'], MAR: ['Marruecos', 'af'], UKR: ['Ucrania', 'eu'], NED: ['Países Bajos', 'eu'],
  CRO: ['Croacia', 'eu'], ECU: ['Ecuador', 'am'], ENG: ['Inglaterra', 'eu'], URU: ['Uruguay', 'am'], KOR: ['Corea del Sur', 'as'], CAN: ['Canadá', 'am'], SCO: ['Escocia', 'eu'],
  HUN: ['Hungría', 'eu'], SVK: ['Eslovaquia', 'eu'], ARG: ['Argentina', 'am'], AUT: ['Austria', 'eu'], NOR: ['Noruega', 'eu'], TUR: ['Turquía', 'eu'], EGY: ['Egipto', 'af'],
  POL: ['Polonia', 'eu'], SWE: ['Suecia', 'eu'], GHA: ['Ghana', 'af'], JPN: ['Japón', 'as'], COL: ['Colombia', 'am'], USA: ['Estados Unidos', 'am'], NGA: ['Nigeria', 'af'],
  SRB: ['Serbia', 'eu'], DEN: ['Dinamarca', 'eu'], GUI: ['Guinea', 'af'], CZE: ['Chequia', 'eu'], KOS: ['Kosovo', 'eu'], CIV: ['Costa de Marfil', 'af'], BFA: ['Burkina Faso', 'af'],
  UZB: ['Uzbekistán', 'as'], ALG: ['Argelia', 'af'], VEN: ['Venezuela', 'am'], ARM: ['Armenia', 'eu'], SEN: ['Senegal', 'af'], IRL: ['Irlanda', 'eu'], MEX: ['México', 'am'],
  BIH: ['Bosnia', 'eu'], WAL: ['Gales', 'eu'], COD: ['RD Congo', 'af'], NZL: ['Nueva Zelanda', 'oc'], GAM: ['Gambia', 'af']
};
export function misterioso() {
  const todos = FUTBOLISTAS.map((f) => ({ nombre: f.nombre, pais: PAIS[f.pais]?.[0] || f.pais, cont: PAIS[f.pais]?.[1] || '?', club: f.club, liga: LIGA[f.club] || 'Otra', pos: f.pos, edad: f.edad, media: f.media }));
  const secretos = barajar(todos.filter((f) => f.media >= 83)).slice(0, 3).map((f) => f.nombre);
  return { futbolistas: todos, secretos };
}

export const JUEGOS_SOLO = { escalera, cronologia, cadena, quiensoy, onceperdido, conexion, duelofutbol, escudo, manager, misterioso };
