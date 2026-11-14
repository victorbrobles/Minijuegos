// server/data/seeds/footballsplit/split.js
// «FrankensFootball»: un futbolista DIBUJADO con tres trozos (cabeza, camiseta y piernas) de tres futbolistas distintos.
// No se usan fotos: cada trozo se pinta con los colores del club actual del futbolista (sin escudo) y lleva su
// bandera, su edad y su puesto. La pista (de pago) es el nombre de su club.
// Datos: futbolistas de la temporada 2025/26 de «Director Deportivo» (los más conocidos: media 80 o más).
import { FUTBOLISTAS } from '../director/futbolistas.js';

// Colores de la primera equipación [principal, secundario] de cada club
export const COLORES = {
  'Real Madrid': ['#ffffff', '#1e3a8a'], Barcelona: ['#a50044', '#004d98'], 'Atlético': ['#cb3524', '#ffffff'], Athletic: ['#ee2523', '#ffffff'],
  'Real Sociedad': ['#0067b1', '#ffffff'], Celta: ['#8ac3ee', '#ffffff'], Betis: ['#0bb363', '#ffffff'], Villarreal: ['#ffe667', '#005187'],
  Osasuna: ['#d91a21', '#0a346f'], Valencia: ['#ffffff', '#000000'], Mallorca: ['#e20613', '#000000'], 'Rayo Vallecano': ['#ffffff', '#e53027'],
  Girona: ['#cd2534', '#ffffff'], Espanyol: ['#007fc8', '#ffffff'], Sevilla: ['#ffffff', '#d4021d'],
  Liverpool: ['#c8102e', '#ffffff'], 'Man City': ['#6cabdd', '#ffffff'], Arsenal: ['#ef0107', '#ffffff'], Tottenham: ['#ffffff', '#132257'],
  'Aston Villa': ['#670e36', '#95bfe5'], Burnley: ['#6c1d45', '#99d6ea'], Chelsea: ['#034694', '#ffffff'], 'Man United': ['#da291c', '#000000'],
  Newcastle: ['#241f20', '#ffffff'], Sunderland: ['#eb172b', '#ffffff'], 'West Ham': ['#7a263a', '#1bb1e7'], Brighton: ['#0057b8', '#ffffff'],
  Everton: ['#003399', '#ffffff'], 'Nottingham Forest': ['#dd0000', '#ffffff'], 'Crystal Palace': ['#1b458f', '#c4122e'], Fulham: ['#ffffff', '#000000'],
  Milan: ['#fb090b', '#000000'], Inter: ['#0068a8', '#000000'], Juventus: ['#ffffff', '#000000'], 'Nápoles': ['#12a0d7', '#ffffff'],
  Atalanta: ['#1e71b8', '#000000'], Como: ['#1d4f91', '#ffffff'], Fiorentina: ['#482e92', '#ffffff'], Roma: ['#8e1f2f', '#f0bc42'],
  Lazio: ['#87d8f7', '#ffffff'], Bolonia: ['#1a2f48', '#a21c26'],
  Dortmund: ['#fde100', '#000000'], Bayern: ['#dc052d', '#ffffff'], Leverkusen: ['#e32221', '#000000'], Hoffenheim: ['#1c63b7', '#ffffff'],
  Stuttgart: ['#ffffff', '#e32219'], Leipzig: ['#ffffff', '#dd0741'], 'Eintracht Fráncfort': ['#e1000f', '#000000'],
  PSG: ['#004170', '#da291c'], 'Paris FC': ['#1b2a4a', '#ffffff'],
  'Fenerbahçe': ['#ffed00', '#00205b'], Trabzonspor: ['#a41d36', '#5ab4e5'], Galatasaray: ['#a90432', '#fdb912'], Oporto: ['#003893', '#ffffff'],
  Sporting: ['#00804a', '#ffffff'], 'Al Hilal': ['#0f4ea2', '#ffffff'], 'Al Nassr': ['#ffe600', '#003a8c'], 'Al Ittihad': ['#000000', '#ffd400'],
  'Los Angeles FC': ['#000000', '#c39e6d'], 'Inter Miami': ['#f7b5cd', '#000000'], Santos: ['#ffffff', '#000000']
};

// Banderas (códigos de país de la FIFA)
const BANDERA = {
  BEL: '🇧🇪', BRA: '🇧🇷', ITA: '🇮🇹', GER: '🇩🇪', SVN: '🇸🇮', FRA: '🇫🇷', ESP: '🇪🇸', SUI: '🇨🇭', POR: '🇵🇹', CMR: '🇨🇲', GEO: '🇬🇪', MAR: '🇲🇦',
  UKR: '🇺🇦', NED: '🇳🇱', CRO: '🇭🇷', ECU: '🇪🇨', ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', URU: '🇺🇾', KOR: '🇰🇷', CAN: '🇨🇦', SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', HUN: '🇭🇺', SVK: '🇸🇰', ARG: '🇦🇷',
  AUT: '🇦🇹', NOR: '🇳🇴', TUR: '🇹🇷', EGY: '🇪🇬', POL: '🇵🇱', SWE: '🇸🇪', GHA: '🇬🇭', JPN: '🇯🇵', COL: '🇨🇴', USA: '🇺🇸', NGA: '🇳🇬', SRB: '🇷🇸',
  DEN: '🇩🇰', GUI: '🇬🇳', CZE: '🇨🇿', KOS: '🇽🇰', CIV: '🇨🇮', BFA: '🇧🇫', UZB: '🇺🇿', ALG: '🇩🇿', VEN: '🇻🇪', ARM: '🇦🇲', SEN: '🇸🇳', IRL: '🇮🇪',
  MEX: '🇲🇽', BIH: '🇧🇦', WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', COD: '🇨🇩', NZL: '🇳🇿', GAM: '🇬🇲'
};
const PUESTO = { POR: 'Portero', DEF: 'Defensa', MED: 'Centrocampista', DEL: 'Delantero' };

export const JUGADORES_SPLIT = FUTBOLISTAS
  .filter((f) => f.media >= 80 && COLORES[f.club] && BANDERA[f.pais])
  .map((f) => ({
    id: f.id, jugador: f.nombre,
    dibujo: { colores: COLORES[f.club], bandera: BANDERA[f.pais], edad: f.edad, puesto: PUESTO[f.pos] },
    pista: `Juega en el ${f.club}`
  }));

const barajar = (l) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const parte = (x) => ({ id: x.id, jugador: x.jugador, pista: x.pista, dibujo: x.dibujo });

/** `n` retos de tres futbolistas distintos cada uno. */
export function generarRetos(n) {
  const copia = barajar(JUGADORES_SPLIT);
  const retos = [];
  for (let k = 0; k < n; k++) {
    const [top, middle, bottom] = [0, 1, 2].map((x) => copia[(k * 3 + x) % copia.length]);
    retos.push({ id: `split_${top.id}_${middle.id}_${bottom.id}`, partes: { top: parte(top), middle: parte(middle), bottom: parte(bottom) } });
  }
  return retos;
}
