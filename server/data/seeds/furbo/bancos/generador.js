// server/data/seeds/furbo/bancos/generador.js
// Genera preguntas a partir de las tablas de hechos.js.
// Es DETERMINISTA: el banco es idéntico en cada arranque (el modo local guarda
// los índices de las preguntas ya usadas, así que el orden no puede cambiar).

import {
  MUNDIALES, EUROS, CHAMPIONS, BALONES, PICHICHIS, LIGAS_ESP, PREMIER,
  FUNDACIONES, INAUGURACIONES, ESTADIOS, APODOS, APODOS_PERSONAS, FICHAJES
} from './hechos.js';

// ------------------------------------------------------------------ azar fijo
function semilla(texto) {
  let h = 1779033703 ^ texto.length;
  for (let i = 0; i < texto.length; i++) {
    h = Math.imul(h ^ texto.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function barajaFija(arr, clave) {
  const rnd = mulberry32(semilla(clave)());
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

// «Alemania» y «Alemania Occidental» no pueden ser distractor una de otra; «Bélgica y Países Bajos»
// tampoco puede tener como distractor «Bélgica» o «Países Bajos» (serían también correctas).
function partes(t) {
  return String(t).split(/\sy\s|,/).map((p) => (p.startsWith('Alemania') ? 'Alemania' : p.trim()));
}
function solapan(a, b) {
  const pa = partes(a);
  return partes(b).some((p) => pa.includes(p));
}

function distractores(pool, correcta, n, clave, preferidos = [], extraExcluir = [], cercanos = []) {
  const excluir = [correcta, ...extraExcluir].filter(Boolean);
  const salida = [];
  const valido = (x) => x && !excluir.some((e) => solapan(x, e)) && !salida.some((s) => solapan(x, s));
  // 1º los fijos (p. ej. el otro finalista), 2º los de la misma época, 3º el resto
  for (const x of [...preferidos, ...barajaFija(cercanos, clave + '#c'), ...barajaFija(pool, clave)]) {
    if (valido(x) && !salida.includes(x)) salida.push(x);
    if (salida.length === n) break;
  }
  return salida;
}

// ---------------------------------------------------------------- pools
const PAISES_MUNDIAL = ['Brasil', 'Alemania Occidental', 'Italia', 'Argentina', 'Francia', 'Uruguay', 'España', 'Inglaterra', 'Alemania', 'Países Bajos', 'Hungría', 'Croacia', 'Suecia', 'Checoslovaquia'];
const SEDES_MUNDIAL = ['Uruguay', 'Italia', 'Francia', 'Brasil', 'Suiza', 'Suecia', 'Chile', 'Inglaterra', 'México', 'Alemania Occidental', 'Argentina', 'España', 'Estados Unidos', 'Corea del Sur y Japón', 'Alemania', 'Sudáfrica', 'Rusia', 'Catar'];
const PAISES_EURO = ['España', 'Alemania', 'Italia', 'Francia', 'Países Bajos', 'Portugal', 'Dinamarca', 'Grecia', 'Checoslovaquia', 'URSS', 'Inglaterra', 'Croacia', 'Bélgica', 'Alemania Occidental', 'Rusia', 'Suecia'];
const SEDES_EURO = ['Francia', 'España', 'Italia', 'Bélgica', 'Yugoslavia', 'Alemania Occidental', 'Suecia', 'Inglaterra', 'Portugal', 'Alemania', 'Austria y Suiza', 'Polonia y Ucrania', 'Bélgica y Países Bajos', 'Países Bajos', 'Rusia'];
const CLUBES_EU = ['Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Bayern de Múnich', 'Borussia Dortmund', 'Juventus', 'AC Milan', 'Inter de Milán', 'Roma', 'Liverpool', 'Manchester United', 'Manchester City', 'Chelsea', 'Arsenal', 'Tottenham', 'Ajax', 'PSV Eindhoven', 'Benfica', 'Oporto', 'PSG', 'Olympique de Marsella', 'Valencia', 'Sevilla', 'Celtic', 'Leeds United', 'Hamburgo', 'Brujas', 'Mónaco', 'Bayer Leverkusen', 'Feyenoord'];
const CLUBES_ES = ['Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Valencia', 'Sevilla', 'Deportivo de La Coruña', 'Villarreal', 'Athletic Club', 'Real Betis', 'Real Sociedad'];
const CLUBES_PL = ['Manchester United', 'Manchester City', 'Chelsea', 'Arsenal', 'Liverpool', 'Leicester City', 'Tottenham', 'Newcastle United', 'Everton'];
const CIUDADES = ['Londres', 'Madrid', 'París', 'Roma', 'Milán', 'Múnich', 'Viena', 'Atenas', 'Ámsterdam', 'Barcelona', 'Berlín', 'Lisboa', 'Glasgow', 'Estambul', 'Moscú', 'Mánchester', 'Cardiff', 'Kiev', 'Gelsenkirchen', 'Stuttgart', 'Bruselas', 'Róterdam', 'Sevilla', 'Bari', 'Oporto'];
const EXTRA_BALON = ['Zlatan Ibrahimović', 'Thierry Henry', 'Xavi Hernández', 'Andrés Iniesta', 'Franck Ribéry', 'Wesley Sneijder', 'Neymar', 'Robert Lewandowski', 'Mohamed Salah', 'Kylian Mbappé', 'Erling Haaland', 'Vinícius Júnior', 'Gianluigi Buffon', 'Diego Maradona', 'Pelé', 'Roberto Baggio', 'Eric Cantona', 'Didier Drogba', 'Iker Casillas', 'Samuel Eto\'o'];
const EXTRA_PICHICHI = ['Fernando Torres', 'David Villa', 'Diego Costa', 'Gareth Bale', 'Antoine Griezmann', 'Radamel Falcao', 'Iago Aspas', 'Raúl Tamudo', 'Hugo Sánchez', 'Predrag Mijatović', 'Fernando Morientes', 'Kiko Narváez'];
const EXTRA_GOLEADORES = ['Pelé', 'Diego Maradona', 'Johan Cruyff', 'Michel Platini', 'Zinedine Zidane', 'Romário', 'Gabriel Batistuta', 'Hristo Stoichkov', 'Roberto Baggio', 'Cristiano Ronaldo', 'Leo Messi', 'Thierry Henry', 'Karl-Heinz Rummenigge', 'Franz Beckenbauer', 'Rivaldo', 'Bobby Charlton'];

const CLUBES_PERSONAS_EXTRA = ['Pep Guardiola', 'José Mourinho', 'Carlo Ancelotti', 'Johan Cruyff', 'Luis Aragonés', 'Vicente del Bosque', 'Arsène Wenger', 'Alex Ferguson'];

// --------------------------------------------------------------- utilidades
const ARTICULO = {
  'Real Madrid': 'el Real Madrid', Liverpool: 'el Liverpool', 'AC Milan': 'el AC Milan', 'Bayern de Múnich': 'el Bayern de Múnich',
  Ajax: 'el Ajax', 'FC Barcelona': 'el FC Barcelona', 'Manchester United': 'el Manchester United', 'Inter de Milán': 'el Inter de Milán',
  Juventus: 'la Juventus', Chelsea: 'el Chelsea', Benfica: 'el Benfica', Oporto: 'el Oporto', 'Nottingham Forest': 'el Nottingham Forest',
  Feyenoord: 'el Feyenoord', Celtic: 'el Celtic', 'Aston Villa': 'el Aston Villa', Hamburgo: 'el Hamburgo',
  'Steaua de Bucarest': 'el Steaua de Bucarest', 'PSV Eindhoven': 'el PSV Eindhoven', 'Estrella Roja': 'el Estrella Roja',
  'Olympique de Marsella': 'el Olympique de Marsella', 'Borussia Dortmund': 'el Borussia Dortmund',
  'Manchester City': 'el Manchester City', PSG: 'el PSG'
};
const ORDINAL = ['primera', 'segunda', 'tercera', 'cuarta', 'quinta', 'sexta', 'séptima', 'octava', 'novena', 'décima', 'undécima', 'duodécima', 'decimotercera', 'decimocuarta', 'decimoquinta'];
const nombreCopa = (a) => (a >= 1993 ? 'Champions League' : 'Copa de Europa');

// ------------------------------------------------------------------- salida
export function generar() {
  const eleccion = []; // { q, c, pool, nivel, prefer, extra }
  const rebote = []; // [pregunta, número, 'anio' | 'cantidad']

  const E = (q, c, pool, nivel, prefer = [], extra = [], cercanos = []) => eleccion.push({ q, c, pool, nivel, prefer, extra, cercanos });

  // ---- Mundiales
  const cerca = (lista, a, w) => lista.filter((x) => Math.abs(x.a - a) <= w);
  for (const m of MUNDIALES) {
    const vecinos = cerca(MUNDIALES, m.a, 16);
    const selecciones = [...new Set(vecinos.flatMap((x) => [x.campeon, x.sub]).filter(Boolean))];
    E(`¿Quién ganó el Mundial de ${m.a}?`, m.campeon, PAISES_MUNDIAL, m.a >= 1986 ? 'media' : 'alta', m.sub ? [m.sub] : [], [], selecciones);
    E(`¿Qué país organizó el Mundial de ${m.a}?`, m.sede, SEDES_MUNDIAL, m.a >= 1982 ? 'media' : 'alta', [], [], vecinos.map((x) => x.sede));
    if (m.sub) E(`¿Qué selección perdió la final del Mundial de ${m.a}?`, m.sub, PAISES_MUNDIAL, 'alta', [m.campeon], [], selecciones);
    if (m.goleador && m.a !== 2010) {
      E(`¿Quién fue el máximo goleador del Mundial de ${m.a}?`, m.goleador,
        [...MUNDIALES.map((x) => x.goleador).filter(Boolean), ...EXTRA_GOLEADORES], 'alta', [], [],
        vecinos.map((x) => x.goleador).filter(Boolean));
      if (m.a !== 1998) {
        rebote.push([`¿Cuántos goles marcó ${m.goleador} para ser el máximo goleador del Mundial de ${m.a}?`, m.goles, 'cantidad']);
      }
    }
  }
  for (const [sede, a] of [['Uruguay', 1930], ['Suiza', 1954], ['Suecia', 1958], ['Chile', 1962], ['Inglaterra', 1966], ['Argentina', 1978], ['Estados Unidos', 1994], ['Corea del Sur y Japón', 2002], ['Sudáfrica', 2010], ['Rusia', 2018], ['Catar', 2022]]) {
    rebote.push([`¿En qué año se celebró el Mundial de ${sede}?`, a, 'anio']);
  }

  // ---- Eurocopas
  for (const e of EUROS) {
    const vecinos = cerca(EUROS, e.a, 16);
    const selecciones = [...new Set(vecinos.flatMap((x) => [x.campeon, x.sub]))];
    E(`¿Quién ganó la Eurocopa de ${e.a}?`, e.campeon, PAISES_EURO, e.a >= 2000 ? 'media' : 'alta', [e.sub], [], selecciones);
    E(`¿Qué selección perdió la final de la Eurocopa de ${e.a}?`, e.sub, PAISES_EURO, 'alta', [e.campeon], [], selecciones);
    if (e.sede) E(`¿Qué país (o países) organizó la Eurocopa de ${e.a}?`, e.sede, SEDES_EURO, 'alta', [], [], vecinos.map((x) => x.sede).filter(Boolean));
  }
  for (const [c, a] of [['la URSS', 1960], ['Checoslovaquia', 1976], ['Países Bajos', 1988], ['Dinamarca', 1992], ['Portugal', 2016]]) {
    rebote.push([`¿En qué año ganó ${c} la Eurocopa?`, a, 'anio']);
  }

  // ---- Copa de Europa / Champions
  for (const f of CHAMPIONS) {
    const copa = nombreCopa(f.a);
    const vecinos = CHAMPIONS.filter((x) => Math.abs(x.a - f.a) <= 10);
    const finalistas = [...new Set(vecinos.flatMap((x) => [x.c, x.s]))];
    E(`¿Quién ganó la ${copa} de ${f.a}?`, f.c, CLUBES_EU, f.a >= 1998 ? 'media' : 'alta', [f.s], [], finalistas);
    if (f.a >= 1980) {
      E(`¿Qué equipo perdió la final de la ${copa} de ${f.a}?`, f.s, CLUBES_EU, 'alta', [f.c], [], finalistas);
      E(`¿En qué ciudad se jugó la final de la ${copa} de ${f.a}?`, f.ciudad, CIUDADES, f.a >= 1998 ? 'media' : 'alta', [], [], vecinos.map((x) => x.ciudad));
    }
  }
  // Títulos n-ésimos de cada club (se calculan desde la tabla)
  const titulos = {};
  for (const f of CHAMPIONS) (titulos[f.c] = titulos[f.c] || []).push(f.a);
  for (const [club, anios] of Object.entries(titulos)) {
    const art = ARTICULO[club];
    if (!art) continue;
    anios.forEach((a, i) => {
      const esDecima = club === 'Real Madrid' && i === 9;
      const esPrimeraBarca = club === 'FC Barcelona' && i === 0;
      if (esDecima || esPrimeraBarca) return; // ya están en la base de preguntas
      if (anios.length === 1 && i === 0) {
        rebote.push([`¿En qué año ganó ${art} su única Copa de Europa hasta 2025?`, a, 'anio']);
      } else {
        rebote.push([`¿En qué año ganó ${art} su ${ORDINAL[i]} Copa de Europa?`, a, 'anio']);
      }
    });
  }

  // ---- Balón de Oro
  const nombresBalon = [...new Set(BALONES.map((b) => b[1]))];
  const poolBalon = [...nombresBalon, ...EXTRA_BALON];
  // Figuras de cada época para que los distractores sean creíbles
  const extrasPorEpoca = (a) => {
    if (a < 1975) return ['Pelé', 'Ferenc Puskás', 'Bobby Moore', 'Garrincha', 'Jimmy Greaves', 'Gordon Banks', 'Giacinto Facchetti', 'Alfredo Di Stéfano'];
    if (a < 1995) return ['Diego Maradona', 'Zico', 'Gary Lineker', 'Rudi Völler', 'Emilio Butragueño', 'Hugo Sánchez', 'Franco Baresi', 'Frank Rijkaard', 'Dino Zoff'];
    if (a < 2008) return ['Thierry Henry', 'Zlatan Ibrahimović', 'Iker Casillas', 'Gianluigi Buffon', 'Raúl González', 'Francesco Totti', 'Dennis Bergkamp', 'Paolo Maldini', 'Roberto Carlos'];
    if (a < 2018) return ['Xavi Hernández', 'Andrés Iniesta', 'Franck Ribéry', 'Wesley Sneijder', 'Neymar', 'Zlatan Ibrahimović', 'Manuel Neuer', 'Gareth Bale', 'Luis Suárez', 'Robert Lewandowski'];
    return ['Robert Lewandowski', 'Mohamed Salah', 'Kylian Mbappé', 'Erling Haaland', 'Vinícius Júnior', 'Kevin De Bruyne', 'Neymar', 'Virgil van Dijk', 'Sadio Mané', 'Lamine Yamal'];
  };
  for (const [a, j] of BALONES) {
    const cercanos = [
      ...BALONES.filter(([y]) => Math.abs(y - a) <= 10).map((b) => b[1]),
      ...extrasPorEpoca(a)
    ];
    E(`¿Quién ganó el Balón de Oro en ${a}?`, j, poolBalon, a >= 2000 ? 'media' : 'alta', [], [], cercanos);
  }
  const victorias = {};
  for (const [a, j] of BALONES) (victorias[j] = victorias[j] || []).push(a);
  for (const [j, anios] of Object.entries(victorias)) {
    rebote.push([anios.length === 1 ? `¿En qué año ganó ${j} el Balón de Oro?` : `¿En qué año ganó ${j} su primer Balón de Oro?`, anios[0], 'anio']);
  }

  // ---- Pichichis
  const poolPichichi = [...new Set(PICHICHIS.map((p) => p[1])), ...EXTRA_PICHICHI];
  for (const [temp, j, goles] of PICHICHIS) {
    const anio = Number(temp.slice(0, 4));
    const cercanos = [
      ...PICHICHIS.filter(([t]) => Math.abs(Number(t.slice(0, 4)) - anio) <= 6).map((x) => x[1]),
      ...(anio >= 2005 ? ['Fernando Torres', 'David Villa', 'Diego Costa', 'Antoine Griezmann', 'Radamel Falcao', 'Gareth Bale'] : ['Hugo Sánchez', 'Predrag Mijatović', 'Fernando Morientes', 'Raúl Tamudo', 'Kiko Narváez'])
    ];
    E(`¿Quién fue el Pichichi de LaLiga en la temporada ${temp}?`, j, poolPichichi, anio >= 2005 ? 'media' : 'alta', [], [], cercanos);
    if (temp !== '2014/15' && temp !== '2011/12') {
      rebote.push([`¿Cuántos goles marcó ${j} para ser Pichichi en la temporada ${temp}?`, goles, 'cantidad']);
    }
  }

  // ---- Campeones de liga
  for (const [temp, c] of LIGAS_ESP) {
    E(`¿Quién ganó LaLiga en la temporada ${temp}?`, c, CLUBES_ES, Number(temp.slice(0, 4)) >= 2008 ? 'media' : 'alta', ['Real Madrid', 'FC Barcelona']);
  }
  for (const [temp, c] of PREMIER) {
    const era = Number(temp.slice(0, 4));
    const pool = CLUBES_PL.filter((x) => x !== 'Leicester City' || era >= 2015);
    E(`¿Quién ganó la Premier League en la temporada ${temp}?`, c, pool, era >= 2010 ? 'media' : 'alta', [], [], ['Manchester United', 'Chelsea', 'Arsenal', 'Manchester City', 'Liverpool']);
  }

  // ---- Fundaciones e inauguraciones
  const yaEnBase = ['el Real Madrid', 'el FC Barcelona', 'el Atlético de Madrid'];
  for (const [club, a] of FUNDACIONES) {
    if (!yaEnBase.includes(club)) rebote.push([`¿En qué año se fundó ${club}?`, a, 'anio']);
  }
  for (const [lugar, a] of INAUGURACIONES) {
    rebote.push([`¿En qué año se inauguró ${lugar}?`, a, 'anio']);
  }

  // ---- Estadios y apodos
  const grupoDe = (i) => (i < 28 ? 'es' : i < 35 ? 'en' : 'otros');
  const clubesGrupo = { es: [], en: [], otros: [] };
  const estadiosGrupo = { es: [], en: [], otros: [] };
  ESTADIOS.forEach(([e, c], i) => { clubesGrupo[grupoDe(i)].push(c); estadiosGrupo[grupoDe(i)].push(e); });
  const famosos = ['Real Madrid', 'FC Barcelona', 'Valencia', 'Athletic Club', 'Sevilla', 'Real Betis', 'Liverpool', 'Manchester United', 'Chelsea', 'Arsenal', 'Bayern de Múnich', 'PSG', 'Boca Juniors', 'Ajax'];
  ESTADIOS.forEach(([est, club], i) => {
    const g = grupoDe(i);
    const nivel = famosos.includes(club) ? 'media' : 'alta';
    if (i % 2 === 0) E(`¿Qué equipo juega en el estadio ${est}?`, club, clubesGrupo[g], nivel);
    else E(`¿Cuál es el estadio del ${club.startsWith('el ') ? club.slice(3) : club}?`, est, estadiosGrupo[g], nivel);
  });
  const poolApodosClubes = [...APODOS.map((a) => a[1]), ...CLUBES_ES];
  for (const [ap, club] of APODOS) E(`¿A qué club se le conoce como ${ap}?`, club, poolApodosClubes, 'media');
  const poolPersonas = [...APODOS_PERSONAS.map((a) => a[1]), ...CLUBES_PERSONAS_EXTRA, 'Xavi Hernández', 'Andrés Iniesta', 'Raúl González', 'Iker Casillas'];
  for (const [ap, p] of APODOS_PERSONAS) {
    const pool = poolPersonas.filter((x) => x !== 'Iker Casillas' || p === 'Iker Casillas');
    E(`¿Quién es conocido como ${ap}?`, p, pool, 'media');
  }

  // ---- Fichajes
  const poolClubesFichajes = ['Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Bayern de Múnich', 'Borussia Dortmund', 'Juventus', 'AC Milan', 'Inter de Milán', 'PSG', 'Manchester United', 'Manchester City', 'Chelsea', 'Liverpool', 'Arsenal', 'Tottenham'];
  for (const [j, o, d, a] of FICHAJES) {
    E(`¿A qué club fichó ${j} en ${a}, procedente del ${o.replace(/^el /, '')}?`, d, poolClubesFichajes, a >= 2010 ? 'media' : 'alta', [], [o]);
  }

  // --------------------------------------------- reparto entre bancos
  // Cada pregunta de elección va a UN solo banco (alternando) para que no se repita
  // la misma dentro de una partida: 'q' = Quiniela, 'p' = Penaltis.
  const quiniela = [];
  const penaltisMedio = [];
  const penaltisAlto = [];
  eleccion.forEach((it, i) => {
    const clave = it.q;
    if (i % 2 === 0) {
      quiniela.push([it.q, it.c, ...distractores(it.pool, it.c, 2, clave, it.prefer, it.extra, it.cercanos)]);
    } else {
      const fila = [it.q, it.c, ...distractores(it.pool, it.c, 3, clave, it.prefer, it.extra, it.cercanos)];
      (it.nivel === 'media' ? penaltisMedio : penaltisAlto).push(fila);
    }
  });

  return { quiniela, penaltisMedio, penaltisAlto, rebote };
}
