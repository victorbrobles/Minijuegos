// server/data/seeds/trayectoria/escudos.js
// Colores (principal y secundario) de cada club de «Modo carrera». Sirven para dibujar un escudo propio
// cuando el club no tiene imagen o la imagen no carga, así todos los clubes se ven en pantalla.
// Siglas: se calculan solas a partir del nombre salvo las que aparecen en SIGLAS.

const T = `
1860 Múnich|#0b5fa5 #ffffff
AC Milan|#e2001a #111111
AC Monza|#e2001a #ffffff
AEK Atenas|#f5c400 #111111
AFC Ajax|#d2122e #ffffff
AFC Bournemouth|#da291c #111111
AIK Estocolmo|#000000 #f6d211
AS Cannes|#e2001a #ffffff
AS Mónaco|#e2001a #ffffff
AS Roma|#8e1f2f #f0bc42
Adana Demirspor|#1c3f94 #4fa8e0
Al Ahli|#00843d #ffffff
Al Arabi|#e2001a #ffffff
Al Duhail|#7a1f3d #ffffff
Al Ettifaq|#00843d #e2001a
Al Gharafa|#f5c400 #1c3f94
Al Hilal|#1d4fa0 #ffffff
Al Ittihad|#f5c400 #111111
Al Jazira|#e2001a #111111
Al Mokawloon|#f5c400 #00843d
Al Nassr|#f5c400 #1c3f94
Al Qadsiah|#f5c400 #e2001a
Al Rayyan|#e2001a #111111
Al Sadd SC|#ffffff #111111
Al Shabab|#ffffff #111111
Alania Vladikavkaz|#e2001a #f5c400
Albacete Balompié|#ffffff #e2001a
América Mineiro|#00843d #111111
América de Cali|#e2001a #ffffff
Anderlecht|#4b2a85 #ffffff
Anzhi Makhachkala|#f5c400 #00843d
Argentinos Juniors|#e2001a #ffffff
Arsenal FC|#ef0107 #ffffff
Arsenal de Sarandí|#4fa8e0 #e2001a
Aston Villa|#670e36 #95bfe5
Atalanta|#1e71b8 #111111
Athletic Club|#ee2523 #ffffff
Athletico Paranaense|#e2001a #111111
Atlético Celaya|#1c3f94 #ffffff
Atlético Mineiro|#111111 #ffffff
Atlético de Madrid|#cb3524 #272e61
Austria Viena|#4b2a85 #ffffff
Bahia|#1c3f94 #e2001a
Banfield|#00843d #ffffff
Bari|#e2001a #ffffff
Barnsley FC|#e2001a #ffffff
Bayer Leverkusen|#e32221 #111111
Bayern Múnich|#dc052d #0066b2
Beijing Guoan|#00843d #f5c400
Belgrano|#4fa8e0 #ffffff
Besiktas|#111111 #ffffff
Beveren|#f5c400 #1c3f94
Birmingham City|#1c3f94 #ffffff
Blackburn Rovers|#1c3f94 #ffffff
Boca Juniors|#103f79 #f3b229
Bolton Wanderers|#ffffff #1c3f94
Borussia Dortmund|#fde100 #111111
Borussia Mönchengladbach|#111111 #00843d
Boston River|#e2001a #00843d
Botafogo|#111111 #ffffff
Bragantino|#ffffff #e2001a
Brentford FC|#e30613 #ffffff
Brescia|#1c3f94 #ffffff
Brighton & Hove Albion|#0057b8 #ffffff
Bryne FK|#e2001a #ffffff
CA Osasuna|#d91a21 #0a346f
CD Leganés|#1c3f94 #ffffff
CD Tenerife|#ffffff #1c3f94
CE Sabadell|#1c3f94 #ffffff
CF Extremadura|#00843d #ffffff
CF Monterrey|#0b2853 #ffffff
CS Marítimo|#00843d #e2001a
CSKA Moscú|#e2001a #1c3f94
CSKA Sofia|#e2001a #ffffff
Cagliari|#a50026 #002350
Catania|#e2001a #4fa8e0
Celta de Vigo|#8ac3ee #e2001a
Celtic FC|#018749 #ffffff
Cerro|#4fa8e0 #ffffff
Charleroi|#111111 #ffffff
Chelsea FC|#034694 #ffffff
Chicago Fire|#e2001a #1c3f94
Chivas de Guadalajara|#e2001a #1c3f94
Club América|#f5c400 #1c3f94
Club Brujas|#0057a0 #111111
Cobreloa|#f47b20 #ffffff
Cobresal|#f47b20 #ffffff
Colo-Colo|#ffffff #111111
Como 1907|#1c3f94 #ffffff
Corinthians|#ffffff #111111
Coritiba|#00843d #ffffff
Coventry City|#6cb4ee #ffffff
Cruzeiro|#1c3f94 #ffffff
Cádiz CF|#f5c400 #1c3f94
D.C. United|#111111 #e2001a
Dalian Aerbin|#1c3f94 #ffffff
Dalian Pro|#1c3f94 #ffffff
Danubio FC|#ffffff #111111
Defensa y Justicia|#00843d #f5c400
Delhi Dynamos|#e2001a #111111
Deportivo Alavés|#0761af #ffffff
Deportivo Cali|#00843d #ffffff
Deportivo La Coruña|#0067b1 #ffffff
Deportivo Saprissa|#6b2c91 #ffffff
Derby County|#ffffff #111111
Dinamo Batumi|#1c3f94 #ffffff
Dinamo Zagreb|#0a4ea2 #ffffff
Dinamo de Kiev|#ffffff #1c3f94
Dorados de Sinaloa|#f5c400 #111111
EA Guingamp|#e2001a #111111
Eintracht Frankfurt|#e1000f #111111
Elazığspor|#800020 #ffffff
Elche CF|#ffffff #00843d
Emirates Club|#e2001a #ffffff
Envigado FC|#f47b20 #00843d
Esbjerg fB|#1c3f94 #ffffff
Estrella Roja|#e2001a #ffffff
Estudiantes (BA)|#111111 #ffffff
Estudiantes de La Plata|#e2001a #ffffff
Everton FC|#003399 #ffffff
FC Barcelona|#a50044 #004d98
FC Basilea|#e2001a #1c3f94
FC Groningen|#00843d #ffffff
FC Halifax Town|#1c3f94 #ffffff
FC Kaiserslautern|#e2001a #ffffff
FC Lorient|#f47b20 #111111
FC Metz|#800020 #ffffff
FC Nantes|#fcd405 #00843d
FC Nuremberg|#9d1c20 #111111
FC Porto|#003893 #ffffff
FC Sion|#ffffff #e2001a
FC Sochaux|#f5c400 #1c3f94
FC St. Gallen|#00843d #ffffff
FC Twente|#e2001a #ffffff
FC Utrecht|#e2001a #ffffff
FK Teplice|#f5c400 #1c3f94
Fenerbahçe|#002d72 #f5c400
Feyenoord|#e2001a #ffffff
Figueirense|#111111 #ffffff
Fiorentina|#482e92 #ffffff
Flamengo|#c4161c #111111
Fleetwood Town|#e2001a #ffffff
Fluminense|#870a28 #00613c
Fortaleza|#1c3f94 #e2001a
Fulham FC|#ffffff #111111
Galatasaray|#a90432 #fdb912
Genoa|#a50026 #002350
Getafe CF|#005999 #ffffff
Gimnàstic de Tarragona|#e2001a #111111
Girona FC|#e2001a #ffffff
Girondins de Burdeos|#1c2a4d #ffffff
Granada CF|#e2001a #ffffff
Grenoble|#1c3f94 #ffffff
Grêmio|#0d80bf #111111
Guarani|#00843d #ffffff
Hajduk Split|#ffffff #1c3f94
Hamburgo SV|#0a3e8f #ffffff
Hebei China Fortune|#e2001a #f5c400
Hellas Verona|#1c3f94 #f5c400
Hertha Berlín|#005ca9 #ffffff
Huracán|#ffffff #e2001a
Hércules CF|#1c3f94 #ffffff
Independiente|#e2001a #ffffff
Independiente Medellín|#e2001a #1c3f94
Instituto de Córdoba|#e2001a #ffffff
Inter Miami|#f7b5cd #231f20
Inter de Milán|#010e80 #111111
Internacional|#e2001a #ffffff
Ipswich Town|#1c3f94 #ffffff
Istanbul Basaksehir|#f47b20 #1c3f94
Jiangsu Suning|#1c3f94 #ffffff
Juventude|#00843d #ffffff
Juventus|#111111 #ffffff
KRC Genk|#1c3f94 #ffffff
Karlsruher SC|#1c3f94 #ffffff
LA Galaxy|#00245d #ffd200
LASK Linz|#111111 #ffffff
Lazio|#87d8f7 #ffffff
Le Havre|#4fa8e0 #1c3f94
Le Mans|#e2001a #f5c400
Lecce|#f5c400 #e2001a
Lech Poznan|#1c3f94 #ffffff
Leeds United|#ffffff #1d428a
Leicester City|#003090 #fdbe11
Levante UD|#004b9d #b4053f
Lille OSC|#e2001a #1c2a4d
Liverpool FC|#c8102e #00b2a9
Livorno|#8b0000 #ffffff
Los Angeles Aztecs|#f47b20 #1c3f94
Los Angeles FC|#111111 #c39e6d
Lumezzane|#e2001a #111111
Mainz 05|#ed1c24 #ffffff
Malmö FF|#7fb7e5 #ffffff
Manchester City|#6cabdd #1c2c5b
Manchester United|#da291c #fbe122
Marbella FC|#1c3f94 #ffffff
Melbourne City|#6cabdd #ffffff
Metalist Kharkiv|#f5c400 #1c3f94
Metalurh Donetsk|#f5c400 #1c3f94
Middlesbrough FC|#e2001a #ffffff
Millonarios FC|#1c3f94 #ffffff
Molde FK|#1c3f94 #ffffff
Montpellier HSC|#1c3f94 #f47b20
Montreal Impact|#1c3f94 #111111
Málaga CF|#4fa8e0 #ffffff
Nacional|#ffffff #1c3f94
New York City FC|#6cace4 #041e42
New York Cosmos|#00843d #f5c400
New York Red Bulls|#ed1e36 #23326a
Newcastle United|#241f20 #ffffff
Newell's Old Boys|#e2001a #111111
Nottingham Forest|#dd0000 #ffffff
Notts County|#111111 #ffffff
Novara|#4fa8e0 #ffffff
OGC Niza|#e2001a #111111
Olimpija Ljubljana|#00843d #ffffff
Olympiacos|#e2001a #ffffff
Olympique de Lyon|#ffffff #1c3f94
Olympique de Marsella|#2faee0 #ffffff
Orlando City|#633492 #fdd116
PSV Eindhoven|#ed1c24 #ffffff
Padova|#e2001a #ffffff
Palermo|#f5a9c4 #111111
Palmeiras|#006437 #ffffff
Paris Saint-Germain|#004170 #da291c
Parma|#f5c400 #1c3f94
Parma Calcio|#f5c400 #1c3f94
Partizán de Belgrado|#111111 #ffffff
Perugia|#e2001a #ffffff
Pescara|#4fa8e0 #ffffff
Peñarol|#f5c400 #111111
Piacenza|#e2001a #ffffff
Pisa|#1c3f94 #111111
Portsmouth|#1c3f94 #ffffff
Preston North End|#ffffff #1c3f94
Pumas UNAM|#1c3f94 #c39e6d
Qatar SC|#f5c400 #1c3f94
Queens Park Rangers|#1d5ba4 #ffffff
Querétaro FC|#111111 #1c3f94
RB Leipzig|#dd0741 #ffffff
RC Estrasburgo|#1c7ac0 #ffffff
RC Lens|#ffe600 #e2001a
RCD Espanyol|#007fc8 #ffffff
RCD Mallorca|#e20613 #111111
Racing Club|#4fa8e0 #ffffff
Racing Murcia|#1c3f94 #ffffff
Racing de Santander|#ffffff #00843d
Rangers FC|#1b458f #ffffff
Rayo Vallecano|#ffffff #e2001a
Reading FC|#1c3f94 #ffffff
Real Betis|#0bb363 #ffffff
Real Madrid|#ffffff #00529f
Real Oviedo|#1c3f94 #ffffff
Real Sociedad|#0067b1 #ffffff
Real Valladolid|#5d2d91 #ffffff
Real Zaragoza|#ffffff #1c3f94
Recreativo de Huelva|#1c3f94 #ffffff
Red Bull Salzburg|#ffffff #e2001a
Rentistas|#e2001a #ffffff
Rio Ave|#00843d #ffffff
River Plate|#ffffff #e2001a
Rosario Central|#1c3f94 #f5c400
Rosenborg BK|#ffffff #111111
Rot Weiss Ahlen|#e2001a #ffffff
Royal Antwerp|#e2001a #ffffff
Rubin Kazán|#8b0000 #00843d
SC Bastia|#1c3f94 #ffffff
SC Heerenveen|#1c3f94 #ffffff
SD Eibar|#1c3f94 #a50044
SL Benfica|#e2001a #ffffff
SM Caen|#1c3f94 #e2001a
SSC Napoli|#12a0d7 #ffffff
Sagan Tosu|#4fa8e0 #f5a9c4
Saint-Étienne|#00843d #ffffff
Salernitana|#800020 #ffffff
Sampdoria|#1b5497 #ffffff
San Lorenzo|#1c3f94 #e2001a
Santos FC|#ffffff #111111
Sassuolo|#00843d #111111
Schalke 04|#004d9d #ffffff
Sevilla FC|#ffffff #d4001f
Shakhtar Donetsk|#f47b20 #111111
Shanghai Port|#e2001a #ffffff
Shanghai Shenhua|#1c3f94 #ffffff
Sheffield United|#e2001a #ffffff
Southampton FC|#d71920 #ffffff
Sparta Praga|#8b0000 #ffffff
Spartak de Moscú|#e2001a #ffffff
Sporting CP|#008057 #ffffff
Sporting de Gijón|#e2001a #ffffff
Stade Brestois|#e2001a #ffffff
Stade Rennais|#e2001a #111111
Standard de Lieja|#e2001a #ffffff
Steaua Bucarest|#e2001a #1c3f94
Stocksbridge Park Steels|#f5c400 #111111
Stoke City|#e03a3e #ffffff
Strømsgodset|#1c3f94 #ffffff
Sunderland|#eb172b #ffffff
Swansea City|#ffffff #111111
Sydney FC|#4fa8e0 #1c3f94
São Caetano|#1c3f94 #ffffff
São Paulo FC|#ffffff #e2001a
TSG Hoffenheim|#1c63b7 #ffffff
Talleres RE|#e2001a #ffffff
Tianjin Tianhai|#1c3f94 #ffffff
Torino|#881f19 #ffffff
Toronto FC|#e2001a #1c3f94
Tottenham Hotspur|#ffffff #132257
Toulouse FC|#5b2a86 #ffffff
Tours FC|#1c3f94 #ffffff
Trabzonspor|#800020 #4fa8e0
UD Almería|#e2001a #ffffff
UD Las Palmas|#ffe400 #0067b1
UD Salamanca|#ffffff #111111
US Boulogne|#e2001a #111111
Udinese|#111111 #ffffff
Union Berlín|#e2001a #f5c400
Valencia CF|#ffffff #ff6600
Vasco da Gama|#111111 #ffffff
Vejle Boldklub|#e2001a #ffffff
VfB Stuttgart|#e32219 #ffffff
VfL Wolfsburg|#65b32e #ffffff
Villarreal CF|#ffe667 #005187
Vissel Kobe|#8b0000 #ffffff
Vitesse Arnhem|#f5c400 #111111
Vitória de Guimarães|#ffffff #111111
Vélez Sarsfield|#ffffff #1c3f94
Watford FC|#fbee23 #ed2127
Werder Bremen|#1d9053 #ffffff
West Bromwich Albion|#122f67 #ffffff
West Ham United|#7a263a #1bb1e7
Western Sydney Wanderers|#e2001a #111111
Willem II|#e2001a #1c3f94
Wolverhampton|#fdb913 #231f20
Wydad Casablanca|#e2001a #ffffff
Znicz Pruszków|#e2001a #ffffff
`;

export const COLORES_CLUB = Object.fromEntries(
  T.trim().split('\n').map((l) => {
    const [nombre, cols] = l.split('|');
    return [nombre, cols.trim().split(/\s+/)];
  })
);

const SIGLAS = {
  'FC Barcelona': 'FCB', 'Real Madrid': 'RMA', 'Atlético de Madrid': 'ATM', 'Paris Saint-Germain': 'PSG', 'Manchester United': 'MUN',
  'Manchester City': 'MCI', 'Bayern Múnich': 'FCB', 'Borussia Dortmund': 'BVB', 'Inter de Milán': 'INT', 'AC Milan': 'ACM',
  'Juventus': 'JUV', 'Liverpool FC': 'LIV', 'Chelsea FC': 'CHE', 'Arsenal FC': 'ARS', 'Tottenham Hotspur': 'TOT',
  'Sevilla FC': 'SFC', 'Valencia CF': 'VCF', 'Real Betis': 'RBB', 'Athletic Club': 'ATH', 'RB Leipzig': 'RBL',
  'Bayer Leverkusen': 'B04', 'Schalke 04': 'S04', 'Mainz 05': 'M05', '1860 Múnich': '1860', 'Como 1907': 'COM',
  'Boca Juniors': 'CABJ', 'River Plate': 'CARP', 'SSC Napoli': 'NAP', 'AS Roma': 'ROM', 'Olympique de Marsella': 'OM',
  'Olympique de Lyon': 'OL', 'West Ham United': 'WHU', 'Newcastle United': 'NEW', 'PSV Eindhoven': 'PSV', 'AFC Ajax': 'AJA',
  'Inter Miami': 'MIA', 'LA Galaxy': 'LAG', 'Los Angeles FC': 'LAFC', 'New York City FC': 'NYC', 'New York Red Bulls': 'NYRB',
  'Queens Park Rangers': 'QPR', 'West Bromwich Albion': 'WBA', 'Brighton & Hove Albion': 'BHA', 'D.C. United': 'DCU'
};
const VACIAS = new Set(['fc', 'cf', 'cd', 'ud', 'sd', 'rc', 'rcd', 'ac', 'as', 'sc', 'fk', 'bk', 'de', 'del', 'la', 'el', 'da', 'do', 'y', '&', 'club', 'ca', 'afc', 'ssc', 'sl', 'cs', 'us', 'sm', 'krc', 'tsg', 'vfl', 'vfb', 'ogc', 'hsc', 'osc', 'ea']);

export function siglasDe(nombre) {
  if (SIGLAS[nombre]) return SIGLAS[nombre];
  const palabras = nombre.replace(/[().]/g, ' ').split(/[\s-]+/).filter(Boolean);
  const utiles = palabras.filter((p) => !VACIAS.has(p.toLowerCase()));
  const base = utiles.length ? utiles : palabras;
  if (base.length === 1) return base[0].slice(0, 3).toUpperCase();
  return base.slice(0, 3).map((p) => p[0]).join('').toUpperCase();
}
