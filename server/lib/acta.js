// server/lib/acta.js
// «Acta del partido»: de cada partido se saca el marcador que hay que acertar (los dos equipos y sus goles)
// y se preparan las pistas sin regalar la respuesta (los goleadores nunca salen todos).
const base = (t) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** «Liverpool 3-3 Milan (3-2 en penaltis)» → { local: 'Liverpool', golesLocal: 3, visitante: 'Milan', golesVisitante: 3 } */
export function parsearPartido(nombre) {
  const m = /^(.+?) (\d{1,2})-(\d{1,2}) (.+?)(?: \(.*\))?$/.exec(String(nombre).trim());
  if (!m) return null;
  return { local: m[1].trim(), golesLocal: Number(m[2]), visitante: m[4].trim(), golesVisitante: Number(m[3]) };
}

// Palabras que solas no identifican a un equipo
const GENERICAS = new Set(['real', 'club', 'fc', 'cf', 'sc', 'ac', 'de', 'del', 'la', 'el', 'los', 'las', 'united', 'city', 'deportivo', 'sporting',
  'olympique', 'stade', 'union', 'atletico', 'athletic', 'internacional', 'nacional', 'football', 'futbol', 'calcio', 'sad', 'cd', 'ud', 'sd', 'rcd', 'ca', 'se']);
// Nombres populares y formas habituales de escribir cada equipo
const ALIAS = {
  'real madrid': ['madrid', 'real madrid', 'rm'], barcelona: ['barca', 'barsa', 'fc barcelona', 'barcelona'], 'fc barcelona': ['barca', 'barcelona'],
  'atletico de madrid': ['atletico', 'atleti', 'atletico madrid', 'atletico de madrid'], 'athletic club': ['athletic', 'athletic bilbao', 'bilbao', 'athletic club'],
  'manchester united': ['united', 'man utd', 'man united', 'manchester united', 'manchester utd'], 'manchester city': ['city', 'man city', 'manchester city'],
  psg: ['psg', 'paris', 'paris saint germain', 'paris sg'], 'paris saint germain': ['psg', 'paris'],
  'bayern de munich': ['bayern', 'bayern munich', 'bayern munchen'], 'borussia dortmund': ['dortmund', 'borussia', 'bvb'],
  inter: ['inter', 'internazionale', 'inter de milan', 'inter milan'], milan: ['milan', 'ac milan'], juventus: ['juventus', 'juve'],
  'alemania federal': ['alemania', 'rfa', 'alemania occidental'], holanda: ['holanda', 'paises bajos'], 'paises bajos': ['holanda', 'paises bajos'],
  urss: ['urss', 'union sovietica', 'rusia'], 'estados unidos': ['estados unidos', 'eeuu', 'usa'], 'corea del sur': ['corea', 'corea del sur'],
  'eintracht de francfort': ['eintracht', 'frankfurt', 'francfort'], 'olympique de marsella': ['marsella', 'marseille', 'om'],
  'stade de reims': ['reims'], 'steaua de bucarest': ['steaua'], 'partizan de belgrado': ['partizan'], 'estrella roja': ['estrella roja', 'crvena zvezda'],
  'deportivo de la coruna': ['deportivo', 'depor', 'coruna', 'la coruna'], tottenham: ['tottenham', 'spurs'], qpr: ['qpr', 'queens park rangers'],
  'real sociedad': ['real sociedad', 'la real', 'sociedad'], 'real betis': ['betis', 'real betis'], 'sevilla': ['sevilla'], 'valencia': ['valencia'],
  'bayer leverkusen': ['leverkusen', 'bayer'], 'borussia monchengladbach': ['gladbach', 'monchengladbach'], 'ajax': ['ajax'], 'oporto': ['oporto', 'porto'],
  'benfica': ['benfica'], 'celtic': ['celtic'], 'nottingham forest': ['nottingham', 'forest'], 'aston villa': ['aston villa', 'villa'],
  'newcastle': ['newcastle'], 'west ham': ['west ham'], 'rayo vallecano': ['rayo', 'rayo vallecano'], 'zaragoza': ['zaragoza'], 'real zaragoza': ['zaragoza'],
  'river plate': ['river', 'river plate'], 'boca juniors': ['boca', 'boca juniors'], 'inglaterra': ['inglaterra'], 'espana': ['espana']
};

/** Formas válidas de nombrar a `equipo` en un partido contra `rival` (sin las palabras que comparten los dos). */
export function aliasEquipo(equipo, rival) {
  const e = base(equipo); const r = base(rival);
  const propias = e.split(' ').filter((p) => p.length >= 3 && !GENERICAS.has(p));
  const delRival = new Set(r.split(' '));
  const alias = new Set([e, ...propias.filter((p) => !delRival.has(p)), ...(ALIAS[e] || [])]);
  // Un alias que también describe al rival no sirve (Real Madrid / Atlético de Madrid: «madrid»)
  const aliasRival = new Set([r, ...(ALIAS[r] || [])]);
  return [...alias].filter((a) => a && !aliasRival.has(a) && !(a.length <= 3 && a !== e && !(ALIAS[e] || []).includes(a)));
}

export function marcadorDe(nombre) {
  const p = parsearPartido(nombre);
  if (!p) return null;
  return {
    equipos: [
      { nombre: p.local, goles: p.golesLocal, alias: aliasEquipo(p.local, p.visitante) },
      { nombre: p.visitante, goles: p.golesVisitante, alias: aliasEquipo(p.visitante, p.local) }
    ]
  };
}

// ── Goleadores: nunca todos ──
const NO_GOLEADOR = /estadio|stade|est[aá]dio|arena|park|stadion|wembley|maracan|bernab|camp nou|anfield|san siro|mestalla|azteca|lusail|soccer city|ciudad|r[ií]o de|barcelona$|madrid$|valencia$|lisboa|glasgow|londres|par[ií]s|roma$|mosc|m[uú]nich|campe[oó]n|entrenador|[aá]rbitro|final|minuto|desde|dirige|banquillo|ol[ií]mpico|luz|old trafford|anoeta|riazor|cartuja|metropolitano|calder[oó]n|sánchez-pizjuán|villamar|pizju|nou camp|hampden|heysel|prater|karaiskakis|vicente|santiago|signal|westfalen|allianz|delle alpi|amsterdam|[aá]msterdam|atenas|berl[ií]n|kiev|varsovia|bucarest|estambul|oporto$|sevilla$|milán$|gelsenkirchen|el visitante|el local/i;
const limpiarNombre = (n) => n.replace(/\s*\((?:\d+|p\.?|p\.p\.?|pen\.?|penalti)[^)]*\)/gi, '').replace(/…|\.\.\./g, '').trim();

/** «Goles: Müller, Klose, Kroos (2) · Oscar · Estadio X» → «Entre los goleadores: Müller · Oscar · Estadio X» */
export function recortarGoles(linea) {
  const m = /^(goles(?: del [a-záéíóú]+)?)\s*:\s*(.+)$/i.exec(linea.trim());
  if (!m) return linea;
  const partes = m[2].split(/\s+·\s+/);
  const listas = []; const extras = [];
  partes.forEach((seg, i) => {
    if (i < 2 && !NO_GOLEADOR.test(seg)) listas.push(seg.split(/,\s*|\s+y\s+/).map(limpiarNombre).filter(Boolean));
    else extras.push(seg);
  });
  const todos = listas.flat();
  if (!todos.length) return linea;
  // Uno por equipo como mucho y siempre menos de los que marcaron
  let elegidos = listas.map((l) => l[0]).filter(Boolean);
  if (elegidos.length >= todos.length) elegidos = elegidos.slice(0, Math.max(1, todos.length - 1));
  if (todos.length === 1 && listas.length === 1) elegidos = todos; // un único goleador: es el dato del gol, se deja
  const texto = elegidos.length === todos.length ? `Marcó ${elegidos[0]}` : `Entre los goleadores: ${elegidos.join(', ')}`;
  return [texto, ...extras].join(' · ');
}
