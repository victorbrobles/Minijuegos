// server/data/seeds/jugadas/jugadas.js
// Base de datos de 100 jugadas icónicas para recrear en 2D.
// Coordenadas del campo: X de 0 (portería propia) a 100 (portería rival, centro en Y=50), Y de 0 (banda sup.) a 100 (banda inf.).
// Formato de actores: 'A'+dorsal (atacante), 'PA'+dorsal (portero atacante), 'D'+dorsal (defensor), 'P'+dorsal (portero rival).
// Formato de cada frame: [msDesdeAnterior, [balonX, balonY], [xActor1, yActor1], [xActor2, yActor2], ...]

export const JUGADAS = [
  {
    id: 1,
    titulo: 'Maradona a Inglaterra — El Gol del Siglo (Mundial 1986)',
    pista: 'Mundial 1986',
    respuestas: ['maradona inglaterra', 'gol del siglo', 'maradona 1986', 'maradona 86', 'maradona'],
    colores: ['#75aadb', '#ffffff'],
    actores: ['A10', 'D16', 'D14', 'D6', 'P1'],
    frames: [
      [0, [45, 78], [44, 78], [47, 74], [62, 72], [80, 56], [96, 50]],
      [900, [52, 76], [51, 76], [49, 82], [60, 74], [78, 56], [96, 50]],
      [1100, [68, 70], [67, 70], [54, 80], [63, 76], [77, 55], [95, 50]],
      [1100, [82, 56], [81, 56], [60, 78], [68, 72], [79, 62], [90, 50]],
      [1000, [92, 44], [91, 44], [65, 76], [72, 68], [84, 58], [89, 54]],
      [800, [100, 50], [93, 46], [68, 74], [75, 65], [88, 54], [90, 56]]
    ]
  },
  {
    id: 2,
    titulo: 'Maradona a Inglaterra — La Mano de Dios (Mundial 1986)',
    pista: 'Mundial 1986',
    respuestas: ['mano de dios', 'maradona mano', 'maradona shilton', 'maradona inglaterra mano'],
    colores: ['#75aadb', '#ffffff'],
    actores: ['A10', 'A11', 'D18', 'P1'],
    frames: [
      [0, [70, 58], [69, 58], [78, 44], [80, 48], [96, 50]],
      [900, [78, 46], [76, 52], [78, 44], [80, 48], [95, 50]],
      [800, [88, 50], [86, 50], [79, 43], [82, 48], [91, 50]],
      [700, [90, 50], [89, 50], [80, 43], [84, 48], [90, 51]],
      [800, [100, 50], [91, 48], [81, 43], [86, 48], [91, 52]]
    ]
  },
  {
    id: 3,
    titulo: 'Iniesta a Países Bajos (Final Mundial 2010)',
    pista: 'Mundial 2010',
    respuestas: ['iniesta holanda', 'iniesta paises bajos', 'iniesta mundial', 'iniesta 2010', 'iniesta'],
    colores: ['#1e3a8a', '#f97316'],
    actores: ['A6', 'A9', 'A4', 'D5', 'P1'],
    frames: [
      [0, [74, 62], [73, 62], [68, 84], [76, 54], [84, 56], [96, 50]],
      [900, [69, 82], [78, 60], [68, 82], [77, 54], [84, 58], [96, 50]],
      [1000, [81, 54], [84, 60], [70, 80], [80, 54], [85, 50], [95, 50]],
      [900, [88, 60], [87, 60], [72, 76], [81, 54], [86, 50], [94, 52]],
      [800, [100, 47], [89, 60], [74, 74], [82, 54], [88, 52], [93, 53]]
    ]
  },
  {
    id: 4,
    titulo: 'Zidane al Bayer Leverkusen — La Volea de Glasgow (Final Champions 2002)',
    pista: 'Champions 2002',
    respuestas: ['zidane leverkusen', 'volea de zidane', 'zidane glasgow', 'zidane 2002', 'zidane'],
    colores: ['#ffffff', '#dc2626'],
    actores: ['A5', 'A21', 'A3', 'D6', 'P1'],
    frames: [
      [0, [62, 18], [76, 48], [62, 18], [68, 10], [84, 38], [96, 50]],
      [900, [86, 12], [80, 50], [66, 20], [85, 12], [86, 32], [96, 50]],
      [1200, [83, 48], [83, 48], [70, 24], [88, 14], [88, 42], [96, 50]],
      [800, [100, 46], [83, 48], [72, 26], [88, 16], [89, 45], [96, 51]]
    ]
  },
  {
    id: 5,
    titulo: 'Sergio Ramos al Atlético — El Minuto 93 (Final Champions 2014)',
    pista: 'Champions 2014',
    respuestas: ['ramos atletico', 'sergio ramos 93', 'minuto 93', 'ramos lisboa', 'sergio ramos'],
    colores: ['#ffffff', '#dc2626'],
    actores: ['A4', 'A19', 'A11', 'D2', 'P13'],
    frames: [
      [0, [99, 98], [84, 48], [99, 98], [88, 56], [88, 49], [96, 50]],
      [900, [94, 74], [87, 50], [98, 96], [89, 55], [89, 50], [96, 50]],
      [800, [89, 51], [89, 51], [97, 94], [90, 56], [90, 52], [96, 51]],
      [800, [100, 46], [90, 51], [96, 92], [91, 56], [90, 53], [96, 53]]
    ]
  },
  {
    id: 6,
    titulo: 'Messi al Getafe — El Gol Maradoniano (Copa del Rey 2007)',
    pista: 'Copa del Rey 2007',
    respuestas: ['messi getafe', 'messi maradona', 'messi copa 2007', 'messi 19 getafe'],
    colores: ['#a50044', '#1d4ed8'],
    actores: ['A19', 'D4', 'D21', 'D2', 'P13'],
    frames: [
      [0, [44, 80], [43, 80], [47, 76], [56, 74], [78, 56], [95, 50]],
      [900, [54, 75], [53, 75], [48, 80], [55, 78], [76, 55], [95, 50]],
      [1100, [74, 60], [73, 60], [55, 78], [62, 72], [76, 56], [93, 50]],
      [1000, [84, 52], [83, 52], [62, 74], [68, 68], [79, 60], [90, 50]],
      [900, [93, 42], [92, 42], [66, 70], [72, 64], [84, 56], [89, 52]],
      [800, [100, 49], [94, 44], [68, 68], [75, 62], [86, 54], [90, 54]]
    ]
  },
  {
    id: 7,
    titulo: 'Messi al Bayern Múnich — El Regate a Boateng (Champions 2015)',
    pista: 'Champions 2015',
    respuestas: ['messi boateng', 'messi bayern', 'messi neuer', 'boateng'],
    colores: ['#a50044', '#dc2626'],
    actores: ['A10', 'A4', 'D17', 'P1'],
    frames: [
      [0, [70, 68], [76, 66], [69, 68], [82, 58], [95, 50]],
      [800, [78, 64], [77, 64], [71, 68], [82, 58], [95, 50]],
      [900, [85, 58], [84, 58], [73, 66], [86, 57], [94, 50]],
      [700, [91, 62], [90, 62], [75, 65], [87, 54], [93, 52]],
      [800, [100, 48], [92, 60], [76, 65], [87, 54], [93, 53]]
    ]
  },
  {
    id: 8,
    titulo: 'Messi al Real Madrid en el Bernabéu (Semifinal Champions 2011)',
    pista: 'Champions 2011',
    respuestas: ['messi bernabeu', 'messi real madrid 2011', 'messi busquets', 'messi madrid champions'],
    colores: ['#a50044', '#ffffff'],
    actores: ['A10', 'A5', 'D10', 'D18', 'D4', 'P1'],
    frames: [
      [0, [62, 52], [61, 52], [65, 50], [68, 54], [76, 52], [82, 46], [96, 50]],
      [700, [65, 50], [64, 52], [65, 50], [67, 54], [76, 52], [82, 46], [96, 50]],
      [900, [75, 54], [74, 54], [65, 50], [69, 58], [75, 50], [82, 48], [95, 50]],
      [900, [87, 54], [86, 54], [65, 50], [72, 58], [78, 48], [84, 50], [94, 50]],
      [800, [100, 47], [89, 54], [65, 50], [74, 58], [80, 48], [86, 50], [94, 52]]
    ]
  },
  {
    id: 9,
    titulo: 'Messi al Athletic Club (Final Copa del Rey 2015)',
    pista: 'Copa del Rey 2015',
    respuestas: ['messi athletic', 'messi bilbao', 'messi final copa 2015', 'messi balenziaga'],
    colores: ['#a50044', '#dc2626'],
    actores: ['A10', 'D24', 'D17', 'D6', 'D4', 'P13'],
    frames: [
      [0, [56, 88], [55, 88], [60, 86], [64, 82], [63, 90], [84, 62], [96, 52]],
      [1000, [68, 86], [67, 86], [63, 88], [66, 84], [64, 92], [83, 62], [96, 52]],
      [1000, [82, 74], [81, 74], [70, 86], [72, 82], [68, 90], [84, 64], [95, 54]],
      [900, [88, 60], [87, 60], [74, 82], [76, 78], [72, 88], [86, 66], [95, 55]],
      [800, [100, 55], [89, 60], [76, 80], [78, 76], [74, 86], [87, 66], [95, 54]]
    ]
  },
  {
    id: 10,
    titulo: 'Messi al Real Betis — Vaselina en el Villamarín (LaLiga 2019)',
    pista: 'LaLiga 2019',
    respuestas: ['messi betis', 'messi vaselina betis', 'messi villamarin', 'messi pau lopez'],
    colores: ['#a50044', '#16a34a'],
    actores: ['A10', 'A4', 'D23', 'P13'],
    frames: [
      [0, [78, 30], [77, 30], [85, 22], [84, 36], [94, 48]],
      [800, [85, 23], [81, 34], [85, 22], [85, 34], [94, 46]],
      [800, [83, 38], [83, 38], [86, 24], [86, 36], [93, 47]],
      [1000, [100, 54], [83, 38], [86, 24], [87, 38], [95, 50]]
    ]
  },
  {
    id: 11,
    titulo: 'Cristiano Ronaldo a la Juventus — La Chilena de Turín (Champions 2018)',
    pista: 'Champions 2018',
    respuestas: ['cristiano juventus', 'chilena cristiano', 'ronaldo juventus', 'cr7 chilena', 'cristiano turin'],
    colores: ['#38bdf8', '#000000'],
    actores: ['A7', 'A2', 'D15', 'P1'],
    frames: [
      [0, [94, 82], [86, 44], [93, 82], [89, 48], [96, 50]],
      [900, [88, 78], [87, 46], [88, 78], [90, 50], [96, 50]],
      [900, [88, 48], [88, 48], [87, 76], [91, 52], [96, 50]],
      [800, [100, 54], [88, 48], [87, 76], [91, 52], [96, 50]]
    ]
  },
  {
    id: 12,
    titulo: 'Cristiano Ronaldo al Oporto — Misil desde 40 metros (Champions 2009)',
    pista: 'Champions 2009',
    respuestas: ['cristiano oporto', 'ronaldo oporto', 'cristiano porto', 'cr7 oporto'],
    colores: ['#dc2626', '#1d4ed8'],
    actores: ['A7', 'A8', 'D2', 'P1'],
    frames: [
      [0, [54, 48], [58, 54], [53, 48], [72, 52], [96, 50]],
      [800, [62, 54], [61, 54], [55, 48], [73, 52], [96, 50]],
      [700, [66, 55], [65, 55], [56, 48], [74, 53], [95, 50]],
      [900, [100, 46], [66, 55], [57, 48], [75, 53], [95, 48]]
    ]
  },
  {
    id: 13,
    titulo: 'Cristiano Ronaldo al Barça — Cabezazo en Mestalla (Final Copa 2011)',
    pista: 'Copa del Rey 2011',
    respuestas: ['cristiano mestalla', 'cristiano copa 2011', 'ronaldo barca copa', 'di maria cristiano'],
    colores: ['#ffffff', '#a50044'],
    actores: ['A7', 'A22', 'A12', 'D21', 'P13'],
    frames: [
      [0, [74, 16], [84, 58], [74, 16], [78, 22], [86, 56], [96, 50]],
      [800, [78, 22], [86, 60], [82, 14], [78, 22], [88, 58], [96, 50]],
      [800, [88, 16], [89, 58], [88, 16], [80, 22], [90, 56], [96, 50]],
      [900, [91, 57], [91, 57], [89, 18], [81, 22], [91, 55], [96, 50]],
      [700, [100, 53], [91, 57], [89, 18], [81, 22], [91, 55], [96, 52]]
    ]
  },
  {
    id: 14,
    titulo: 'Cristiano Ronaldo al Arsenal — Contraataque en 10 segundos (Champions 2009)',
    pista: 'Champions 2009',
    respuestas: ['cristiano arsenal', 'contraataque united arsenal', 'park rooney ronaldo', 'ronaldo arsenal 2009'],
    colores: ['#1d4ed8', '#dc2626'],
    actores: ['A7', 'A13', 'A10', 'D3', 'P1'],
    frames: [
      [0, [24, 68], [28, 76], [24, 68], [32, 34], [52, 50], [96, 50]],
      [800, [36, 74], [35, 74], [34, 62], [44, 30], [56, 48], [96, 50]],
      [900, [48, 58], [52, 66], [48, 58], [60, 26], [68, 46], [95, 50]],
      [1000, [78, 26], [78, 56], [64, 52], [78, 26], [80, 44], [95, 48]],
      [900, [89, 54], [89, 54], [74, 50], [82, 28], [86, 48], [94, 50]],
      [700, [100, 52], [90, 54], [76, 50], [83, 28], [87, 48], [94, 51]]
    ]
  },
  {
    id: 15,
    titulo: 'Cristiano Ronaldo a España — Falta del 3-3 (Mundial 2018)',
    pista: 'Mundial 2018',
    respuestas: ['cristiano espana', 'falta cristiano espana', 'ronaldo espana 2018', 'cr7 espana'],
    colores: ['#991b1b', '#ffffff'],
    actores: ['A7', 'D3', 'D4', 'D5', 'P1'],
    frames: [
      [0, [79, 46], [74, 42], [87, 45], [87, 47], [87, 49], [96, 52]],
      [900, [79, 46], [78, 45], [87, 45], [87, 47], [87, 49], [96, 52]],
      [600, [88, 44], [79, 46], [87, 45], [87, 47], [87, 49], [96, 52]],
      [600, [100, 45], [79, 46], [87, 45], [87, 47], [87, 49], [96, 51]]
    ]
  },
  {
    id: 16,
    titulo: 'Gareth Bale al Barça — La Carrera a Bartra (Final Copa del Rey 2014)',
    pista: 'Copa del Rey 2014',
    respuestas: ['bale bartra', 'bale barca', 'bale copa del rey', 'gareth bale'],
    colores: ['#ffffff', '#a50044'],
    actores: ['A11', 'A5', 'D15', 'P13'],
    frames: [
      [0, [36, 12], [44, 10], [35, 12], [48, 14], [95, 50]],
      [800, [58, 6], [48, 8], [38, 12], [54, 10], [95, 50]],
      [1000, [68, 8], [62, 1], [42, 12], [65, 8], [94, 48]],
      [1000, [82, 18], [81, 18], [46, 12], [76, 14], [93, 47]],
      [900, [91, 42], [90, 42], [50, 12], [84, 28], [92, 48]],
      [700, [100, 50], [92, 44], [52, 12], [86, 32], [92, 49]]
    ]
  },
  {
    id: 17,
    titulo: 'Gareth Bale al Liverpool — La Chilena de Kiev (Final Champions 2018)',
    pista: 'Champions 2018',
    respuestas: ['bale liverpool', 'chilena bale', 'bale kiev', 'bale 2018'],
    colores: ['#ffffff', '#dc2626'],
    actores: ['A11', 'A12', 'D4', 'P1'],
    frames: [
      [0, [78, 18], [84, 52], [77, 18], [86, 48], [96, 50]],
      [900, [82, 22], [85, 50], [81, 22], [87, 48], [96, 50]],
      [900, [86, 49], [86, 49], [82, 24], [88, 47], [96, 50]],
      [800, [100, 45], [86, 49], [82, 24], [88, 47], [96, 48]]
    ]
  },
  {
    id: 18,
    titulo: 'Roberto Carlos a Francia — El Efecto Imposible (1997)',
    pista: 'Amistoso 1997',
    respuestas: ['roberto carlos francia', 'falta roberto carlos', 'roberto carlos barthez', 'roberto carlos 1997'],
    colores: ['#facc15', '#1d4ed8'],
    actores: ['A6', 'D8', 'D7', 'D14', 'P16'],
    frames: [
      [0, [68, 52], [52, 52], [77, 49], [77, 51], [77, 53], [96, 50]],
      [1100, [68, 52], [67, 52], [77, 49], [77, 51], [77, 53], [96, 50]],
      [600, [84, 59], [69, 52], [77, 49], [77, 51], [77, 53], [96, 50]],
      [600, [100, 54], [69, 52], [77, 49], [77, 51], [77, 53], [96, 50]]
    ]
  },
  {
    id: 19,
    titulo: 'Roberto Carlos al Tenerife — El Gol Imposible sin Ángulo (1998)',
    pista: 'LaLiga 1998',
    respuestas: ['roberto carlos tenerife', 'roberto carlos sin angulo', 'roberto carlos 1998'],
    colores: ['#ffffff', '#1d4ed8'],
    actores: ['A3', 'A19', 'D5', 'P1'],
    frames: [
      [0, [74, 16], [82, 10], [73, 16], [86, 26], [96, 46]],
      [900, [98, 6], [97, 6], [76, 18], [90, 24], [96, 44]],
      [800, [100, 53], [98, 6], [78, 18], [92, 24], [96, 46]]
    ]
  },
  {
    id: 20,
    titulo: 'Ronaldinho al Real Madrid — Aplaudido en el Bernabéu (LaLiga 2005)',
    pista: 'LaLiga 2005',
    respuestas: ['ronaldinho bernabeu', 'ronaldinho madrid', 'ronaldinho ramos', 'ronaldinho 2005'],
    colores: ['#a50044', '#ffffff'],
    actores: ['A10', 'D4', 'D6', 'P1'],
    frames: [
      [0, [52, 18], [51, 18], [58, 22], [78, 36], [96, 50]],
      [900, [64, 16], [63, 16], [60, 22], [77, 34], [96, 49]],
      [1000, [78, 26], [77, 26], [68, 22], [79, 34], [95, 48]],
      [900, [88, 38], [87, 38], [74, 26], [82, 34], [94, 48]],
      [800, [100, 52], [89, 40], [76, 28], [84, 36], [94, 49]]
    ]
  },
  {
    id: 21,
    titulo: 'Ronaldinho al Chelsea — Punterazo Bailando en Stamford Bridge (2005)',
    pista: 'Champions 2005',
    respuestas: ['ronaldinho chelsea', 'punterazo ronaldinho', 'ronaldinho stamford bridge', 'ronaldinho cech'],
    colores: ['#fb923c', '#1d4ed8'],
    actores: ['A10', 'A9', 'D6', 'D26', 'P1'],
    frames: [
      [0, [74, 56], [81, 48], [73, 56], [84, 47], [85, 51], [96, 50]],
      [800, [81, 48], [81, 48], [75, 56], [84, 47], [85, 51], [96, 50]],
      [1000, [81, 48], [81, 48], [76, 56], [84, 46], [85, 52], [96, 50]],
      [700, [100, 46], [81, 48], [76, 56], [84, 46], [85, 52], [96, 50]]
    ]
  },
  {
    id: 22,
    titulo: 'Ronaldinho a Inglaterra — Falta a Seaman (Mundial 2002)',
    pista: 'Mundial 2002',
    respuestas: ['ronaldinho inglaterra', 'ronaldinho seaman', 'ronaldinho 2002', 'falta ronaldinho inglaterra'],
    colores: ['#1d4ed8', '#ffffff'],
    actores: ['A11', 'D5', 'D6', 'P1'],
    frames: [
      [0, [66, 76], [62, 78], [86, 48], [86, 52], [93, 49]],
      [900, [66, 76], [65, 76], [86, 48], [86, 52], [93, 49]],
      [900, [84, 62], [66, 76], [86, 48], [86, 52], [93, 48]],
      [900, [100, 46], [66, 76], [86, 48], [86, 52], [95, 48]]
    ]
  },
  {
    id: 23,
    titulo: 'Ronaldinho al Villarreal — Pecho y Chilena (LaLiga 2006)',
    pista: 'LaLiga 2006',
    respuestas: ['ronaldinho villarreal', 'chilena ronaldinho', 'ronaldinho 2006'],
    colores: ['#a50044', '#facc15'],
    actores: ['A10', 'A6', 'D2', 'P13'],
    frames: [
      [0, [74, 58], [87, 46], [73, 58], [86, 44], [96, 50]],
      [900, [88, 46], [88, 46], [74, 58], [86, 44], [96, 50]],
      [800, [88, 46], [88, 46], [75, 58], [87, 44], [96, 50]],
      [800, [100, 52], [88, 46], [75, 58], [87, 44], [96, 50]]
    ]
  },
  {
    id: 24,
    titulo: 'Ronaldo Nazário al Compostela (LaLiga 1996)',
    pista: 'LaLiga 1996',
    respuestas: ['ronaldo compostela', 'nazario compostela', 'ronaldo barca compostela', 'ronaldo 1996'],
    colores: ['#a50044', '#ffffff'],
    actores: ['A9', 'D10', 'D6', 'D4', 'P1'],
    frames: [
      [0, [42, 54], [41, 54], [43, 52], [58, 56], [82, 48], [96, 50]],
      [900, [54, 56], [53, 56], [46, 52], [56, 58], [80, 48], [96, 50]],
      [1000, [72, 54], [71, 54], [52, 54], [62, 58], [80, 50], [95, 50]],
      [900, [86, 46], [85, 46], [58, 54], [68, 56], [82, 52], [94, 50]],
      [800, [100, 52], [88, 48], [60, 54], [70, 56], [84, 52], [94, 51]]
    ]
  },
  {
    id: 25,
    titulo: 'Ronaldo Nazário a la Lazio — La Bicicleta en París (Final UEFA 1998)',
    pista: 'UEFA 1998',
    respuestas: ['ronaldo lazio', 'ronaldo marchegiani', 'ronaldo inter 1998', 'nazario lazio'],
    colores: ['#1e3a8a', '#38bdf8'],
    actores: ['A10', 'A8', 'D13', 'P1'],
    frames: [
      [0, [58, 52], [72, 48], [57, 52], [73, 46], [94, 50]],
      [900, [82, 48], [81, 48], [62, 52], [77, 46], [89, 50]],
      [800, [87, 48], [86, 48], [65, 52], [80, 46], [88, 52]],
      [700, [91, 44], [90, 44], [67, 52], [83, 46], [89, 54]],
      [700, [100, 50], [92, 45], [68, 52], [85, 46], [89, 54]]
    ]
  },
  {
    id: 26,
    titulo: 'Marco van Basten a la URSS — La Volea Imposible (Final Eurocopa 1988)',
    pista: 'Eurocopa 1988',
    respuestas: ['van basten', 'marco van basten', 'van basten urss', 'van basten 1988'],
    colores: ['#f97316', '#dc2626'],
    actores: ['A12', 'A7', 'D3', 'P1'],
    frames: [
      [0, [74, 14], [86, 72], [73, 14], [84, 52], [96, 48]],
      [1100, [92, 76], [92, 76], [76, 16], [88, 56], [96, 52]],
      [900, [100, 46], [92, 76], [77, 16], [89, 58], [96, 51]]
    ]
  },
  {
    id: 27,
    titulo: 'Zlatan Ibrahimović a Inglaterra — Chilena desde 30 metros (2012)',
    pista: 'Fase previa Mundial 2012',
    respuestas: ['ibrahimovic inglaterra', 'zlatan inglaterra', 'chilena zlatan', 'chilena ibrahimovic'],
    colores: ['#facc15', '#ffffff'],
    actores: ['A10', 'D4', 'P1'],
    frames: [
      [0, [68, 60], [78, 64], [79, 60], [88, 52]],
      [900, [81, 64], [77, 66], [80, 62], [81, 63]],
      [800, [73, 68], [73, 68], [80, 62], [82, 62]],
      [1100, [100, 50], [73, 68], [84, 58], [90, 56]]
    ]
  },
  {
    id: 28,
    titulo: 'Zlatan Ibrahimović al NAC Breda — Los 6 Amagos con el Ajax (2004)',
    pista: 'Eredivisie 2004',
    respuestas: ['ibrahimovic ajax', 'zlatan ajax', 'ibrahimovic breda', 'zlatan nac breda'],
    colores: ['#dc2626', '#facc15'],
    actores: ['A9', 'D3', 'D5', 'D4', 'P1'],
    frames: [
      [0, [74, 52], [73, 52], [76, 50], [82, 54], [86, 46], [95, 50]],
      [800, [78, 48], [77, 48], [76, 54], [81, 52], [86, 46], [95, 50]],
      [800, [82, 56], [81, 56], [78, 54], [81, 48], [85, 48], [94, 50]],
      [800, [87, 44], [86, 44], [80, 54], [83, 52], [85, 52], [93, 50]],
      [800, [92, 52], [91, 52], [82, 54], [85, 52], [87, 50], [92, 46]],
      [700, [100, 50], [92, 52], [83, 54], [86, 52], [88, 50], [92, 46]]
    ]
  },
  {
    id: 29,
    titulo: 'Dennis Bergkamp al Newcastle — El Giro ante Dabizas (Premier League 2002)',
    pista: 'Premier League 2002',
    respuestas: ['bergkamp newcastle', 'dennis bergkamp', 'bergkamp dabizas', 'bergkamp 2002'],
    colores: ['#facc15', '#000000'],
    actores: ['A10', 'A7', 'D34', 'P1'],
    frames: [
      [0, [68, 30], [81, 48], [67, 30], [83, 48], [96, 50]],
      [900, [82, 48], [81, 48], [72, 32], [83, 48], [96, 50]],
      [800, [88, 50], [86, 44], [74, 34], [85, 52], [95, 50]],
      [800, [90, 48], [89, 48], [75, 34], [86, 52], [94, 50]],
      [700, [100, 53], [90, 48], [76, 34], [87, 52], [94, 50]]
    ]
  },
  {
    id: 30,
    titulo: 'Dennis Bergkamp a Argentina (Cuartos Mundial 1998)',
    pista: 'Mundial 1998',
    respuestas: ['bergkamp argentina', 'bergkamp 1998', 'bergkamp ayala', 'holanda argentina 1998'],
    colores: ['#f97316', '#75aadb'],
    actores: ['A8', 'A4', 'D2', 'P1'],
    frames: [
      [0, [34, 32], [86, 62], [33, 32], [84, 56], [96, 50]],
      [1200, [89, 62], [89, 62], [38, 34], [87, 58], [96, 52]],
      [800, [88, 54], [87, 54], [40, 34], [89, 60], [95, 52]],
      [800, [100, 46], [88, 54], [42, 34], [89, 60], [95, 51]]
    ]
  },
  {
    id: 31,
    titulo: 'Thierry Henry al Real Madrid en el Bernabéu (Champions 2006)',
    pista: 'Champions 2006',
    respuestas: ['henry bernabeu', 'henry real madrid', 'thierry henry madrid', 'henry 2006'],
    colores: ['#facc15', '#ffffff'],
    actores: ['A14', 'D9', 'D24', 'D4', 'P1'],
    frames: [
      [0, [48, 46], [47, 46], [51, 48], [64, 42], [80, 44], [96, 50]],
      [900, [62, 38], [61, 38], [54, 46], [63, 42], [79, 44], [96, 50]],
      [900, [78, 36], [77, 36], [60, 44], [68, 42], [80, 42], [95, 49]],
      [800, [88, 38], [87, 38], [64, 44], [72, 42], [84, 44], [94, 48]],
      [800, [100, 54], [89, 40], [66, 44], [74, 42], [86, 44], [94, 50]]
    ]
  },
  {
    id: 32,
    titulo: 'Thierry Henry al Manchester United — Volea a la Media Vuelta (2000)',
    pista: 'Premier League 2000',
    respuestas: ['henry manchester united', 'volea henry', 'henry barthez', 'thierry henry united'],
    colores: ['#dc2626', '#ffffff'],
    actores: ['A14', 'A15', 'D5', 'P1'],
    frames: [
      [0, [70, 38], [79, 44], [69, 38], [81, 44], [96, 50]],
      [800, [79, 44], [79, 44], [71, 38], [81, 44], [96, 50]],
      [700, [79, 44], [79, 44], [72, 38], [81, 44], [95, 50]],
      [900, [100, 54], [79, 44], [72, 38], [81, 44], [95, 51]]
    ]
  },
  {
    id: 33,
    titulo: 'Wayne Rooney al Manchester City — La Chilena del Derbi (2011)',
    pista: 'Premier League 2011',
    respuestas: ['rooney city', 'chilena rooney', 'wayne rooney', 'rooney manchester city'],
    colores: ['#dc2626', '#38bdf8'],
    actores: ['A10', 'A17', 'D4', 'P25'],
    frames: [
      [0, [76, 78], [84, 48], [75, 78], [86, 50], [96, 50]],
      [900, [82, 74], [87, 48], [81, 74], [88, 50], [96, 50]],
      [900, [88, 48], [88, 48], [82, 72], [89, 50], [96, 50]],
      [700, [100, 46], [88, 48], [82, 72], [89, 50], [96, 50]]
    ]
  },
  {
    id: 34,
    titulo: 'David Beckham al Wimbledon — Gol desde el Medio Campo (1996)',
    pista: 'Premier League 1996',
    respuestas: ['beckham wimbledon', 'beckham medio campo', 'david beckham 1996', 'beckham'],
    colores: ['#dc2626', '#1d4ed8'],
    actores: ['A10', 'A18', 'P1'],
    frames: [
      [0, [42, 68], [46, 72], [41, 68], [84, 50]],
      [800, [47, 72], [46, 72], [42, 68], [84, 50]],
      [1400, [100, 50], [47, 72], [43, 68], [93, 50]]
    ]
  },
  {
    id: 35,
    titulo: 'David Beckham a Grecia — Falta en el 93\' (Clasificación Mundial 2002)',
    pista: 'Clasificación Mundial 2002',
    respuestas: ['beckham grecia', 'falta beckham grecia', 'beckham 2001', 'david beckham grecia'],
    colores: ['#ffffff', '#1d4ed8'],
    actores: ['A7', 'D5', 'D6', 'D4', 'P1'],
    frames: [
      [0, [74, 48], [68, 44], [83, 46], [83, 48], [83, 50], [96, 52]],
      [900, [74, 48], [73, 47], [83, 46], [83, 48], [83, 50], [96, 52]],
      [600, [85, 46], [74, 48], [83, 46], [83, 48], [83, 50], [96, 52]],
      [600, [100, 45], [74, 48], [83, 46], [83, 48], [83, 50], [96, 50]]
    ]
  },
  {
    id: 36,
    titulo: 'Steven Gerrard al Olympiacos (Champions 2004)',
    pista: 'Champions 2004',
    respuestas: ['gerrard olympiacos', 'steven gerrard olympiacos', 'gerrard 2004'],
    colores: ['#dc2626', '#ffffff'],
    actores: ['A8', 'A24', 'D5', 'P71'],
    frames: [
      [0, [76, 36], [70, 54], [83, 46], [85, 48], [96, 50]],
      [800, [83, 46], [74, 54], [83, 46], [85, 48], [96, 50]],
      [800, [77, 54], [76, 54], [84, 46], [85, 50], [96, 50]],
      [800, [100, 54], [77, 54], [84, 46], [86, 50], [96, 52]]
    ]
  },
  {
    id: 37,
    titulo: 'Steven Gerrard al West Ham (Final FA Cup 2006)',
    pista: 'FA Cup 2006',
    respuestas: ['gerrard west ham', 'gerrard fa cup', 'steven gerrard 2006', 'gerrard'],
    colores: ['#dc2626', '#7c2d12'],
    actores: ['A8', 'D5', 'D6', 'P34'],
    frames: [
      [0, [84, 42], [68, 54], [83, 44], [86, 50], [96, 50]],
      [900, [71, 54], [70, 54], [82, 46], [85, 50], [96, 50]],
      [800, [100, 47], [71, 54], [82, 46], [85, 50], [96, 48]]
    ]
  },
  {
    id: 38,
    titulo: 'Kun Agüero al QPR — El 93:20 ("Agüeroooo", Premier League 2012)',
    pista: 'Premier League 2012',
    respuestas: ['aguero qpr', 'kun aguero', '93 20', 'aguero 2012', 'aguero'],
    colores: ['#38bdf8', '#dc2626'],
    actores: ['A16', 'A45', 'D34', 'P1'],
    frames: [
      [0, [74, 54], [73, 54], [82, 50], [83, 50], [96, 50]],
      [800, [82, 50], [78, 56], [82, 50], [83, 50], [96, 50]],
      [700, [85, 56], [84, 56], [82, 51], [85, 52], [95, 52]],
      [700, [89, 57], [88, 57], [82, 51], [87, 53], [95, 53]],
      [700, [100, 54], [89, 57], [82, 51], [88, 54], [95, 53]]
    ]
  },
  {
    id: 39,
    titulo: 'Divock Origi al Barça — "Corner Taken Quickly" (Champions 2019)',
    pista: 'Champions 2019',
    respuestas: ['origi barca', 'corner taken quickly', 'alexander arnold origi', 'liverpool barca corner', 'origi'],
    colores: ['#dc2626', '#facc15'],
    actores: ['A27', 'A66', 'D3', 'D15', 'P1'],
    frames: [
      [0, [99, 98], [89, 50], [96, 94], [91, 54], [90, 44], [96, 50]],
      [800, [99, 98], [89, 50], [94, 92], [91, 54], [90, 44], [96, 50]],
      [600, [99, 98], [90, 50], [99, 97], [91, 54], [90, 44], [96, 50]],
      [700, [90, 50], [90, 50], [98, 96], [91, 53], [90, 45], [96, 50]],
      [700, [100, 48], [90, 50], [98, 96], [91, 52], [90, 46], [96, 50]]
    ]
  },
  {
    id: 40,
    titulo: 'Sergi Roberto al PSG — El 6-1 de la Remontada (Champions 2017)',
    pista: 'Champions 2017',
    respuestas: ['sergi roberto psg', 'remontada barca psg', 'sergi roberto', '6 1 psg'],
    colores: ['#a50044', '#1e3a8a'],
    actores: ['A20', 'A11', 'D6', 'D5', 'P1'],
    frames: [
      [0, [72, 34], [84, 52], [71, 34], [75, 36], [86, 50], [96, 50]],
      [900, [75, 42], [86, 50], [74, 42], [75, 38], [87, 50], [96, 50]],
      [900, [91, 50], [91, 50], [75, 42], [76, 40], [89, 48], [95, 50]],
      [700, [100, 50], [92, 50], [75, 42], [76, 40], [90, 48], [95, 50]]
    ]
  },
  {
    id: 41,
    titulo: 'Fernando Torres a Alemania (Final Eurocopa 2008)',
    pista: 'Eurocopa 2008',
    respuestas: ['torres alemania', 'fernando torres 2008', 'torres lahm', 'torres eurocopa'],
    colores: ['#dc2626', '#ffffff'],
    actores: ['A9', 'A6', 'D16', 'P1'],
    frames: [
      [0, [64, 54], [74, 56], [63, 54], [76, 54], [95, 50]],
      [900, [82, 58], [81, 60], [66, 54], [81, 56], [93, 50]],
      [900, [88, 56], [87, 57], [68, 54], [86, 54], [90, 52]],
      [800, [100, 47], [89, 56], [69, 54], [87, 54], [90, 53]]
    ]
  },
  {
    id: 42,
    titulo: 'Carlos Alberto a Italia (Final Mundial 1970)',
    pista: 'Mundial 1970',
    respuestas: ['carlos alberto', 'carlos alberto 1970', 'pele carlos alberto', 'brasil italia 1970'],
    colores: ['#facc15', '#1d4ed8'],
    actores: ['A4', 'A10', 'A7', 'D3', 'P1'],
    frames: [
      [0, [68, 28], [58, 86], [76, 48], [67, 28], [82, 46], [96, 50]],
      [900, [76, 48], [68, 82], [76, 48], [70, 32], [83, 48], [96, 50]],
      [900, [84, 68], [83, 68], [76, 48], [72, 34], [85, 52], [96, 52]],
      [800, [100, 46], [85, 66], [76, 48], [73, 34], [86, 54], [96, 52]]
    ]
  },
  {
    id: 43,
    titulo: 'Pelé a Suecia — El Sombrero en el Área (Final Mundial 1958)',
    pista: 'Mundial 1958',
    respuestas: ['pele suecia', 'pele 1958', 'sombrero de pele', 'pele mundial 58'],
    colores: ['#1d4ed8', '#facc15'],
    actores: ['A10', 'A6', 'D4', 'P1'],
    frames: [
      [0, [76, 18], [85, 52], [75, 18], [87, 50], [96, 50]],
      [900, [85, 52], [85, 52], [78, 20], [87, 50], [96, 50]],
      [800, [89, 48], [88, 48], [79, 20], [87, 52], [95, 50]],
      [800, [100, 53], [89, 48], [80, 20], [87, 52], [95, 51]]
    ]
  },
  {
    id: 44,
    titulo: 'Pelé a Uruguay — El Amago sin Tocar el Balón (Mundial 1970)',
    pista: 'Mundial 1970',
    respuestas: ['pele uruguay', 'pele mazurkiewicz', 'gol que no fue', 'amago de pele'],
    colores: ['#facc15', '#38bdf8'],
    actores: ['A10', 'A9', 'D4', 'P1'],
    frames: [
      [0, [66, 44], [76, 52], [65, 44], [78, 46], [93, 50]],
      [900, [84, 52], [83, 50], [68, 44], [81, 46], [86, 52]],
      [800, [90, 58], [88, 48], [70, 44], [84, 48], [85, 54]],
      [800, [91, 56], [90, 56], [72, 44], [86, 50], [85, 54]],
      [800, [100, 44], [91, 56], [73, 44], [88, 50], [87, 52]]
    ]
  },
  {
    id: 45,
    titulo: 'Iker Casillas a Arjen Robben — La Parada del Mundial (Final 2010)',
    pista: 'Mundial 2010',
    respuestas: ['casillas robben', 'parada de casillas', 'casillas 2010', 'iker casillas'],
    colores: ['#1e3a8a', '#f97316'],
    actores: ['PA1', 'A11', 'D5'],
    frames: [
      [0, [60, 50], [92, 50], [59, 50], [55, 52]],
      [900, [72, 50], [90, 50], [71, 50], [65, 52]],
      [800, [82, 50], [86, 50], [81, 50], [75, 52]],
      [700, [100, 46], [88, 47], [82, 50], [78, 52]],
      [500, [100, 38], [88, 47], [82, 50], [80, 52]]
    ]

  },
  {
    id: 46,
    titulo: 'Dibu Martínez a Kolo Muani — La Atajada del Siglo (Final Mundial 2022)',
    pista: 'Mundial 2022',
    respuestas: ['dibu kolo muani', 'dibu martinez', 'parada del dibu', 'dibu 123', 'kolo muani'],
    colores: ['#75aadb', '#1e3a8a'],
    actores: ['PA23', 'A12', 'D19'],
    frames: [
      [0, [60, 40], [96, 50], [78, 44], [72, 48]],
      [800, [75, 45], [94, 50], [82, 45], [78, 48]],
      [400, [86, 46], [92, 48], [84, 45], [80, 48]],
      [400, [94, 46], [94, 46], [85, 45], [82, 48]],
      [700, [70, 30], [94, 46], [85, 45], [84, 48]]
    ]

  },
  {

    id: 47,
    titulo: 'René Higuita a Inglaterra — El Escorpión en Wembley (1995)',
    pista: 'Amistoso 1995',
    respuestas: ['escorpion higuita', 'rene higuita', 'higuita wembley', 'higuita inglaterra'],
    colores: ['#facc15', '#ffffff'],
    actores: ['PA1', 'A11'],
    frames: [
      [0, [40, 20], [92, 50], [39, 20]],
      [800, [60, 35], [94, 50], [39, 20]],
      [800, [80, 45], [96, 50], [39, 20]],
      [600, [97, 50], [97, 50], [39, 20]],
      [800, [70, 50], [97, 50], [39, 20]]
    ]

  },
  {

    id: 48,
    titulo: 'Iker Casillas a Perotti — La Parada Imposible (LaLiga 2009)',
    pista: 'LaLiga 2009',
    respuestas: ['casillas perotti', 'parada casillas sevilla', 'iker casillas perotti'],
    colores: ['#ffffff', '#dc2626'],
    actores: ['PA1', 'A10', 'A9'],
    frames: [
      [0, [85, 20], [95, 30], [88, 70], [84, 20]],
      [800, [88, 45], [96, 45], [89, 70], [84, 20]],
      [600, [92, 70], [97, 60], [90, 70], [84, 20]],
      [400, [98, 70], [98, 68], [91, 70], [84, 20]],
      [600, [90, 80], [98, 68], [91, 70], [84, 20]]
    ]

  },
  {

    id: 49,
    titulo: 'Thibaut Courtois a Sadio Mané (Final Champions 2022)',
    pista: 'Champions 2022',
    respuestas: ['courtois mane', 'courtois liverpool', 'thibaut courtois', 'courtois 2022'],
    colores: ['#ffffff', '#dc2626'],
    actores: ['PA1', 'A10', 'D3'],
    frames: [
      [0, [80, 40], [96, 50], [79, 40], [83, 44]],
      [700, [82, 40], [96, 50], [80, 40], [83, 44]],
      [500, [90, 42], [97, 47], [81, 40], [84, 44]],
      [400, [99, 44], [98, 44], [81, 40], [84, 44]],
      [500, [95, 45], [96, 45], [81, 40], [84, 44]]
    ]

  },
  {
    id: 50,
    titulo: 'James Rodríguez a Uruguay — Pecho y Volea (Mundial 2014)',
    pista: 'Mundial 2014',
    respuestas: ['james uruguay', 'james rodriguez', 'james 2014', 'gol de james'],
    colores: ['#facc15', '#38bdf8'],
    actores: ['A10', 'A8', 'D17', 'P1'],
    frames: [
      [0, [70, 52], [78, 48], [69, 52], [82, 48], [96, 50]],
      [800, [78, 48], [78, 48], [71, 52], [82, 48], [96, 50]],
      [700, [78, 49], [78, 49], [72, 52], [82, 48], [96, 50]],
      [800, [100, 48], [78, 49], [72, 52], [82, 48], [96, 50]]
    ]
  },
  {
    id: 51,
    titulo: 'Robin van Persie a España — El Holandés Volador (Mundial 2014)',
    pista: 'Mundial 2014',
    respuestas: ['van persie espana', 'van persie', 'robin van persie', 'holandes volador'],
    colores: ['#1e3a8a', '#ffffff'],
    actores: ['A9', 'A5', 'D4', 'P1'],
    frames: [
      [0, [48, 12], [78, 48], [47, 12], [80, 48], [93, 50]],
      [1200, [83, 48], [83, 48], [52, 14], [82, 50], [92, 50]],
      [900, [100, 52], [85, 48], [54, 14], [83, 50], [93, 50]]
    ]
  },
  {
    id: 52,
    titulo: 'Mario Götze a Argentina (Final Mundial 2014)',
    pista: 'Mundial 2014',
    respuestas: ['gotze argentina', 'mario gotze', 'gotze 2014', 'alemania argentina 2014'],
    colores: ['#ffffff', '#1e3a8a'],
    actores: ['A19', 'A9', 'D15', 'P1'],
    frames: [
      [0, [74, 14], [84, 46], [73, 14], [85, 48], [96, 50]],
      [900, [88, 18], [88, 42], [87, 18], [87, 46], [96, 48]],
      [900, [90, 41], [90, 41], [89, 20], [89, 45], [95, 48]],
      [800, [100, 54], [91, 41], [89, 20], [90, 45], [95, 49]]
    ]
  },
  {
    id: 53,
    titulo: 'Benjamin Pavard a Argentina — Volea con Exterior (Mundial 2018)',
    pista: 'Mundial 2018',
    respuestas: ['pavard argentina', 'benjamin pavard', 'pavard 2018', 'pavard'],
    colores: ['#1e3a8a', '#75aadb'],
    actores: ['A2', 'A21', 'D3', 'P12'],
    frames: [
      [0, [84, 12], [76, 68], [83, 12], [86, 20], [96, 50]],
      [900, [95, 10], [80, 64], [94, 10], [90, 18], [96, 48]],
      [1100, [82, 62], [82, 62], [95, 12], [90, 22], [96, 50]],
      [800, [100, 46], [82, 62], [95, 12], [90, 22], [96, 50]]
    ]
  },
  {
    id: 54,
    titulo: 'Richarlison a Serbia — La Tijera Acrobática (Mundial 2022)',
    pista: 'Mundial 2022',
    respuestas: ['richarlison serbia', 'richarlison 2022', 'tijera richarlison', 'richarlison'],
    colores: ['#facc15', '#dc2626'],
    actores: ['A9', 'A20', 'D4', 'P23'],
    frames: [
      [0, [84, 22], [87, 50], [83, 22], [88, 52], [96, 50]],
      [900, [87, 50], [87, 50], [84, 24], [88, 52], [96, 50]],
      [700, [87, 49], [87, 49], [85, 24], [88, 52], [96, 50]],
      [800, [100, 47], [87, 49], [85, 24], [88, 52], [96, 50]]
    ]
  },
  {
    id: 55,
    titulo: 'Lionel Messi al Real Madrid — Celebración con la Camiseta (LaLiga 2017)',
    pista: 'LaLiga 2017',
    respuestas: ['messi bernabeu 2017', 'messi camiseta', 'messi real madrid 2017', 'messi 92'],
    colores: ['#a50044', '#ffffff'],
    actores: ['A10', 'A18', 'D12', 'P1'],
    frames: [
      [0, [34, 46], [44, 76], [33, 46], [48, 70], [96, 50]],
      [900, [68, 52], [67, 52], [46, 70], [60, 56], [96, 50]],
      [800, [84, 60], [83, 60], [68, 54], [80, 58], [95, 52]],
      [700, [100, 48], [84, 60], [68, 54], [81, 58], [95, 52]]
    ]
  },
  {
    id: 56,
    titulo: 'Kylian Mbappé a Argentina — La Volea del 2-2 (Final Mundial 2022)',
    pista: 'Mundial 2022',
    respuestas: ['mbappe argentina', 'volea mbappe', 'mbappe final 2022', 'kylian mbappe'],
    colores: ['#1e3a8a', '#75aadb'],
    actores: ['A10', 'A26', 'D19', 'P23'],
    frames: [
      [0, [76, 34], [75, 34], [79, 42], [84, 44], [96, 50]],
      [800, [79, 42], [82, 36], [79, 42], [85, 44], [96, 50]],
      [800, [86, 38], [86, 38], [80, 42], [87, 44], [96, 48]],
      [800, [100, 54], [86, 38], [80, 42], [87, 44], [96, 50]]
    ]
  },
  {
    id: 57,
    titulo: 'Wout Weghorst a Argentina — La Falta Ensayada en el 101\' (Mundial 2022)',
    pista: 'Mundial 2022',
    respuestas: ['weghorst argentina', 'falta holanda argentina', 'koopmeiners weghorst', 'weghorst'],
    colores: ['#f97316', '#75aadb'],
    actores: ['A19', 'A20', 'D19', 'D6', 'P23'],
    frames: [
      [0, [79, 52], [87, 49], [74, 52], [87, 51], [87, 53], [96, 50]],
      [900, [79, 52], [87, 49], [78, 52], [87, 51], [87, 53], [96, 50]],
      [800, [88, 49], [88, 49], [79, 52], [87, 51], [87, 53], [95, 50]],
      [700, [100, 53], [89, 49], [79, 52], [88, 50], [87, 53], [95, 50]]
    ]
  },
  {
    id: 58,
    titulo: 'Zinedine Zidane a España — Regate a Puyol (Mundial 2006)',
    pista: 'Mundial 2006',
    respuestas: ['zidane espana', 'zidane puyol', 'zidane 2006', 'francia espana 2006'],
    colores: ['#ffffff', '#dc2626'],
    actores: ['A10', 'A11', 'D5', 'P1'],
    frames: [
      [0, [68, 30], [74, 28], [67, 30], [78, 36], [96, 50]],
      [900, [78, 36], [77, 36], [70, 32], [82, 38], [96, 50]],
      [800, [84, 42], [83, 42], [71, 32], [81, 46], [95, 52]],
      [700, [100, 50], [84, 42], [72, 32], [82, 46], [95, 52]]
    ]
  },
  {
    id: 59,
    titulo: 'Messi a México — Zurdazo Raso desde la Frontal (Mundial 2022)',
    pista: 'Mundial 2022',
    respuestas: ['messi mexico', 'messi ochoa', 'argentina mexico 2022', 'messi 2022 mexico'],
    colores: ['#75aadb', '#16a34a'],
    actores: ['A10', 'A11', 'D16', 'P13'],
    frames: [
      [0, [76, 78], [76, 52], [75, 78], [82, 54], [96, 50]],
      [900, [76, 52], [76, 52], [76, 76], [81, 52], [96, 50]],
      [700, [77, 51], [77, 51], [76, 76], [81, 52], [96, 50]],
      [800, [100, 54], [77, 51], [76, 76], [82, 52], [96, 52]]
    ]
  },
  {
    id: 60,
    titulo: 'Messi y Julián Álvarez a Croacia — El Regate a Gvardiol (Mundial 2022)',
    pista: 'Mundial 2022',
    respuestas: ['messi gvardiol', 'messi croacia', 'messi julian croacia', 'gvardiol'],
    colores: ['#75aadb', '#1e293b'],
    actores: ['A10', 'A9', 'D20', 'P1'],
    frames: [
      [0, [54, 88], [53, 88], [62, 54], [56, 84], [96, 50]],
      [1000, [74, 88], [73, 88], [74, 52], [74, 84], [96, 50]],
      [900, [78, 86], [77, 86], [80, 52], [79, 82], [96, 52]],
      [900, [94, 78], [93, 78], [88, 52], [91, 80], [96, 54]],
      [800, [90, 52], [93, 76], [90, 52], [91, 78], [96, 52]],
      [700, [100, 50], [93, 76], [91, 52], [91, 78], [96, 51]]
    ]
  },
  {
    id: 61,
    titulo: 'Antonín Panenka a Alemania Federal — El Penalti a lo Panenka (Eurocopa 1976)',
    pista: 'Eurocopa 1976',
    respuestas: ['panenka', 'penalti panenka', 'antonin panenka', 'panenka 1976'],
    colores: ['#dc2626', '#ffffff'],
    actores: ['A7', 'P1'],
    frames: [
      [0, [88, 50], [80, 50], [99, 50]],
      [900, [88, 50], [87, 50], [99, 50]],
      [900, [95, 50], [88, 50], [99, 43]],
      [700, [100, 50], [88, 50], [99, 41]]
    ]
  },
  {
    id: 62,
    titulo: 'Paul Gascoigne a Escocia — El Sombrero a Hendry (Eurocopa 1996)',
    pista: 'Eurocopa 1996',
    respuestas: ['gascoigne escocia', 'paul gascoigne', 'gazza escocia', 'gascoigne 1996'],
    colores: ['#ffffff', '#1e3a8a'],
    actores: ['A8', 'A17', 'D4', 'P1'],
    frames: [
      [0, [70, 28], [78, 44], [69, 28], [82, 46], [96, 50]],
      [900, [82, 45], [81, 45], [72, 30], [83, 46], [96, 50]],
      [800, [87, 48], [86, 48], [73, 30], [84, 45], [95, 50]],
      [800, [100, 53], [87, 48], [74, 30], [85, 45], [95, 51]]
    ]
  },
  {

    id: 63,
    titulo: 'Lionel Messi al Manchester United — Suspendido en el Aire (Final Champions 2009)',
    pista: 'Champions 2009',
    respuestas: ['messi manchester united', 'cabezazo messi roma', 'messi roma 2009', 'messi van der sar'],
    colores: ['#a50044', '#ffffff'],
    actores: ['A10', 'A6', 'D5', 'P1'],
    frames: [
      [0, [70, 20], [82, 58], [69, 20], [84, 56], [96, 50]],
      [800, [78, 40], [84, 60], [70, 20], [85, 56], [96, 50]],
      [800, [88, 60], [88, 60], [71, 20], [87, 58], [95, 50]],
      [800, [100, 45], [88, 60], [71, 20], [87, 58], [95, 50]]
    ]

  },
  {
    id: 64,
    titulo: 'Angelos Charisteas a Portugal (Final Eurocopa 2004)',
    pista: 'Eurocopa 2004',
    respuestas: ['charisteas portugal', 'grecia portugal 2004', 'charisteas', 'grecia eurocopa'],
    colores: ['#1d4ed8', '#991b1b'],
    actores: ['A9', 'A20', 'D16', 'P1'],
    frames: [
      [0, [99, 98], [88, 48], [99, 98], [89, 49], [96, 50]],
      [900, [93, 50], [92, 50], [98, 96], [91, 51], [94, 52]],
      [800, [100, 48], [92, 50], [97, 94], [91, 51], [94, 52]]
    ]
  },
  {
    id: 65,
    titulo: 'Eder a Francia — Gol en la Prórroga (Final Eurocopa 2016)',
    pista: 'Eurocopa 2016',
    respuestas: ['eder francia', 'portugal francia 2016', 'eder 2016', 'eder'],
    colores: ['#991b1b', '#1e3a8a'],
    actores: ['A9', 'A8', 'D21', 'P1'],
    frames: [
      [0, [62, 34], [66, 38], [61, 34], [68, 40], [96, 50]],
      [800, [68, 42], [67, 42], [63, 34], [69, 40], [96, 50]],
      [900, [75, 48], [74, 48], [65, 36], [72, 42], [96, 50]],
      [800, [100, 46], [75, 48], [66, 36], [73, 43], [96, 48]]
    ]
  },
  {
    id: 66,
    titulo: 'Patrik Schick a Escocia — Gol desde el Centro del Campo (Eurocopa 2020)',
    pista: 'Eurocopa 2020',
    respuestas: ['schick escocia', 'patrik schick', 'schick medio campo', 'schick'],
    colores: ['#ffffff', '#1e3a8a'],
    actores: ['A10', 'D6', 'P1'],
    frames: [
      [0, [48, 52], [51, 54], [49, 50], [80, 50]],
      [700, [52, 54], [51, 54], [48, 50], [80, 50]],
      [1400, [100, 50], [52, 54], [50, 50], [96, 50]]
    ]
  },
  {
    id: 67,
    titulo: 'Lamine Yamal a Francia (Semifinal Eurocopa 2024)',
    pista: 'Eurocopa 2024',
    respuestas: ['lamine yamal francia', 'lamine yamal', 'yamal francia', 'yamal eurocopa'],
    colores: ['#dc2626', '#ffffff'],
    actores: ['A19', 'A7', 'D14', 'P16'],
    frames: [
      [0, [72, 66], [76, 64], [71, 66], [80, 60], [96, 50]],
      [800, [77, 64], [76, 64], [72, 66], [80, 60], [96, 50]],
      [800, [78, 58], [77, 58], [73, 66], [80, 61], [96, 50]],
      [900, [100, 46], [78, 58], [73, 66], [80, 61], [96, 48]]
    ]
  },
  {
    id: 68,
    titulo: 'Mikel Oyarzabal a Inglaterra (Final Eurocopa 2024)',
    pista: 'Eurocopa 2024',
    respuestas: ['oyarzabal inglaterra', 'mikel oyarzabal', 'cucurella oyarzabal', 'espana inglaterra 2024'],
    colores: ['#dc2626', '#ffffff'],
    actores: ['A21', 'A24', 'D5', 'P1'],
    frames: [
      [0, [68, 46], [67, 46], [72, 14], [78, 48], [96, 50]],
      [900, [84, 14], [80, 48], [83, 14], [84, 48], [96, 50]],
      [900, [91, 49], [91, 49], [86, 16], [90, 48], [95, 50]],
      [700, [100, 52], [92, 49], [87, 16], [91, 48], [95, 50]]
    ]
  },
  {
    id: 69,
    titulo: 'Jude Bellingham a Eslovaquia — Chilena en el 95\' (Eurocopa 2024)',
    pista: 'Eurocopa 2024',
    respuestas: ['bellingham eslovaquia', 'chilena bellingham', 'jude bellingham', 'bellingham 2024'],
    colores: ['#ffffff', '#1d4ed8'],
    actores: ['A10', 'A2', 'A6', 'D14', 'P1'],
    frames: [
      [0, [82, 99], [87, 52], [82, 99], [88, 62], [89, 50], [96, 50]],
      [900, [88, 62], [88, 50], [82, 97], [88, 62], [89, 50], [96, 50]],
      [800, [89, 50], [89, 50], [82, 96], [88, 62], [90, 51], [96, 50]],
      [700, [100, 48], [89, 50], [82, 96], [88, 62], [90, 51], [96, 50]]
    ]
  },
  {
    id: 70,
    titulo: 'Kaká al Manchester United — El Choque en Old Trafford (Champions 2007)',
    pista: 'Champions 2007',
    respuestas: ['kaka manchester united', 'kaka old trafford', 'kaka evra heinze', 'kaka 2007', 'kaka'],
    colores: ['#ffffff', '#dc2626'],
    actores: ['A22', 'D24', 'D4', 'D3', 'P1'],
    frames: [
      [0, [68, 28], [67, 28], [71, 30], [78, 34], [76, 24], [96, 50]],
      [800, [74, 30], [73, 30], [71, 32], [77, 32], [77, 28], [96, 50]],
      [800, [82, 34], [81, 34], [73, 32], [78, 30], [78, 30], [94, 48]],
      [800, [89, 44], [88, 44], [75, 32], [78, 30], [78, 30], [93, 49]],
      [700, [100, 53], [90, 45], [76, 32], [78, 30], [78, 30], [93, 50]]
    ]
  },
  {
    id: 71,
    titulo: 'Arjen Robben al Manchester United — Volea de Córner (Champions 2010)',
    pista: 'Champions 2010',
    respuestas: ['robben manchester united', 'volea robben', 'ribery robben', 'robben 2010'],
    colores: ['#dc2626', '#1e293b'],
    actores: ['A10', 'A7', 'D15', 'P1'],
    frames: [
      [0, [99, 2], [80, 66], [99, 2], [88, 50], [96, 50]],
      [1100, [83, 64], [83, 64], [97, 4], [88, 52], [96, 50]],
      [800, [100, 46], [83, 64], [96, 5], [88, 52], [96, 48]]
    ]
  },
  {
    id: 72,
    titulo: 'Arjen Robben al Borussia Dortmund (Final Champions 2013)',
    pista: 'Champions 2013',
    respuestas: ['robben dortmund', 'robben wembley', 'robben final 2013', 'arjen robben'],
    colores: ['#dc2626', '#facc15'],
    actores: ['A10', 'A7', 'D4', 'D15', 'P1'],
    frames: [
      [0, [74, 46], [78, 56], [79, 48], [81, 46], [82, 52], [95, 50]],
      [800, [79, 48], [80, 54], [79, 48], [81, 47], [82, 52], [95, 50]],
      [800, [86, 52], [85, 52], [79, 48], [82, 48], [83, 54], [92, 50]],
      [700, [91, 48], [90, 48], [79, 48], [84, 48], [85, 54], [91, 51]],
      [700, [100, 52], [91, 48], [79, 48], [85, 48], [86, 54], [91, 51]]
    ]
  },
  {
    id: 73,
    titulo: 'Didier Drogba al Bayern Múnich (Final Champions 2012)',
    pista: 'Champions 2012',
    respuestas: ['drogba bayern', 'didier drogba', 'drogba 2012', 'mata drogba'],
    colores: ['#1d4ed8', '#dc2626'],
    actores: ['A11', 'A10', 'D17', 'P1'],
    frames: [
      [0, [99, 98], [87, 56], [99, 98], [89, 55], [96, 50]],
      [900, [91, 56], [91, 56], [98, 96], [90, 55], [96, 52]],
      [700, [100, 54], [91, 56], [97, 94], [90, 55], [96, 53]]
    ]
  },
  {
    id: 74,
    titulo: 'Ole Gunnar Solskjær al Bayern Múnich (Final Champions 1999)',
    pista: 'Champions 1999',
    respuestas: ['solskjaer bayern', 'remontada united bayern', 'solskjaer 1999', 'solskjaer'],
    colores: ['#dc2626', '#94a3b8'],
    actores: ['A20', 'A10', 'A7', 'D4', 'P1'],
    frames: [
      [0, [99, 2], [94, 52], [91, 44], [99, 2], [92, 48], [96, 50]],
      [900, [91, 44], [94, 52], [91, 44], [98, 4], [92, 48], [96, 50]],
      [700, [95, 52], [95, 52], [91, 45], [97, 5], [93, 49], [96, 50]],
      [600, [100, 49], [95, 52], [91, 45], [97, 5], [93, 49], [96, 50]]
    ]
  },
  {
    id: 75,
    titulo: 'Fernando Torres al Barça en el Camp Nou (Semifinal Champions 2012)',
    pista: 'Champions 2012',
    respuestas: ['torres barca', 'fernando torres chelsea', 'torres camp nou', 'torres valdes'],
    colores: ['#ffffff', '#a50044'],
    actores: ['A9', 'A7', 'D14', 'P1'],
    frames: [
      [0, [34, 66], [48, 48], [33, 66], [38, 52], [88, 50]],
      [1000, [66, 48], [65, 48], [38, 64], [48, 52], [88, 50]],
      [1000, [84, 50], [83, 50], [42, 64], [58, 52], [88, 50]],
      [800, [92, 44], [91, 44], [44, 64], [64, 52], [89, 52]],
      [700, [100, 50], [93, 46], [46, 64], [68, 52], [89, 52]]
    ]
  },
  {
    id: 76,
    titulo: 'Dejan Stanković al Schalke 04 — Volea desde Medio Campo ante Neuer (2011)',
    pista: 'Champions 2011',
    respuestas: ['stankovic schalke', 'stankovic neuer', 'dejan stankovic', 'stankovic medio campo'],
    colores: ['#1e3a8a', '#ffffff'],
    actores: ['A5', 'A22', 'P1'],
    frames: [
      [0, [68, 48], [50, 52], [79, 48], [86, 50]],
      [900, [80, 48], [51, 52], [79, 48], [80, 48]],
      [900, [52, 52], [52, 52], [78, 48], [81, 48]],
      [1100, [100, 50], [52, 52], [78, 48], [88, 50]]
    ]
  },
  {

    id: 77,
    titulo: 'Neymar al Villarreal — Sombrero de Espaldas (LaLiga 2015)',
    pista: 'LaLiga 2015',
    respuestas: ['neymar villarreal', 'sombrero neymar', 'neymar 2015', 'neymar jr'],
    colores: ['#a50044', '#facc15'],
    actores: ['A11', 'A9', 'D2', 'P1'],
    frames: [
      [0, [70, 30], [82, 50], [69, 30], [84, 50], [96, 50]],
      [800, [82, 50], [82, 50], [72, 30], [84, 50], [96, 50]],
      [600, [85, 50], [86, 50], [73, 30], [84, 50], [96, 50]],
      [800, [100, 48], [86, 50], [74, 30], [84, 50], [96, 50]]
    ]

  },
  {

    id: 78,
    titulo: 'Robert Lewandowski al Wolfsburgo — El 5º Gol en 9 Minutos (2015)',
    pista: 'Bundesliga 2015',
    respuestas: ['lewandowski wolfsburgo', 'lewandowski 5 goles', 'lewy 5', 'robert lewandowski'],
    colores: ['#dc2626', '#16a34a'],
    actores: ['A9', 'A19', 'D4', 'P1'],
    frames: [
      [0, [75, 20], [82, 50], [74, 20], [84, 48], [96, 50]],
      [900, [82, 50], [82, 50], [75, 20], [85, 48], [96, 50]],
      [800, [100, 52], [82, 50], [76, 20], [86, 48], [96, 52]]
    ]

  },
  {
    id: 79,
    titulo: 'Gaizka Mendieta al Barça — Volea de Córner en el Camp Nou (1999)',
    pista: 'LaLiga 1999',
    respuestas: ['mendieta barca', 'gaizka mendieta', 'volea mendieta', 'mendieta camp nou'],
    colores: ['#ffffff', '#a50044'],
    actores: ['A6', 'A7', 'D4', 'P1'],
    frames: [
      [0, [99, 98], [79, 52], [99, 98], [88, 50], [96, 50]],
      [1000, [80, 52], [80, 52], [97, 96], [87, 50], [96, 50]],
      [800, [100, 46], [80, 52], [96, 95], [87, 50], [96, 48]]
    ]
  },
  {
    id: 80,
    titulo: 'Rivaldo al Valencia — Chilena desde la Frontal en el 89\' (LaLiga 2001)',
    pista: 'LaLiga 2001',
    respuestas: ['rivaldo valencia', 'chilena rivaldo', 'rivaldo 2001', 'rivaldo'],
    colores: ['#a50044', '#ffffff'],
    actores: ['A10', 'A4', 'D5', 'P1'],
    frames: [
      [0, [68, 44], [81, 50], [67, 44], [83, 50], [96, 50]],
      [900, [81, 50], [81, 50], [69, 44], [83, 50], [96, 50]],
      [700, [81, 50], [81, 50], [70, 44], [83, 50], [96, 50]],
      [800, [100, 54], [81, 50], [70, 44], [83, 50], [96, 52]]
    ]
  },
  {
    id: 81,
    titulo: 'Raúl González al Atlético — "La Noche del Aguanis" (LaLiga 1997)',
    pista: 'LaLiga 1997',
    respuestas: ['raul atletico', 'aguanis', 'raul aguanis', 'raul lopez', 'raul 1997'],
    colores: ['#ffffff', '#dc2626'],
    actores: ['A7', 'A10', 'D4', 'P1'],
    frames: [
      [0, [74, 34], [83, 28], [73, 34], [85, 32], [96, 48]],
      [800, [84, 28], [84, 28], [75, 34], [86, 32], [96, 48]],
      [800, [91, 22], [90, 22], [76, 34], [89, 26], [96, 46]],
      [800, [90, 32], [89, 32], [77, 34], [91, 24], [95, 48]],
      [700, [100, 52], [90, 34], [77, 34], [91, 24], [95, 49]]
    ]
  },
  {
    id: 82,
    titulo: 'Raúl González al Valencia (Final Champions 2000 en París)',
    pista: 'Champions 2000',
    respuestas: ['raul valencia', 'raul final 2000', 'raul canizares', 'raul paris'],
    colores: ['#000000', '#f97316'],
    actores: ['A7', 'A8', 'D20', 'P1'],
    frames: [
      [0, [34, 48], [46, 50], [33, 48], [42, 54], [88, 50]],
      [1000, [66, 50], [65, 50], [38, 48], [54, 54], [88, 50]],
      [1000, [84, 50], [83, 50], [42, 48], [66, 54], [88, 50]],
      [800, [92, 58], [91, 58], [44, 48], [72, 54], [89, 48]],
      [700, [100, 50], [93, 56], [46, 48], [76, 54], [89, 48]]
    ]
  },
  {
    id: 83,
    titulo: 'Fernando Redondo y Raúl al Manchester United — El Taconazo de Old Trafford (2000)',
    pista: 'Champions 2000',
    respuestas: ['redondo old trafford', 'taconazo redondo', 'fernando redondo', 'redondo raul'],
    colores: ['#000000', '#dc2626'],
    actores: ['A6', 'A7', 'D21', 'P17'],
    frames: [
      [0, [74, 8], [82, 48], [73, 8], [78, 12], [96, 50]],
      [900, [86, 4], [87, 48], [82, 10], [84, 8], [96, 48]],
      [900, [96, 20], [91, 50], [95, 20], [88, 12], [96, 46]],
      [800, [92, 50], [92, 50], [95, 22], [90, 16], [96, 48]],
      [600, [100, 50], [92, 50], [95, 22], [90, 16], [96, 48]]
    ]
  },
  {
    id: 84,
    titulo: 'Guti y Benzema en Riazor — "El Tacón de Dios" (LaLiga 2010)',
    pista: 'LaLiga 2010',
    respuestas: ['guti riazor', 'tacon de guti', 'guti benzema', 'tacon de dios', 'guti'],
    colores: ['#ffffff', '#1d4ed8'],
    actores: ['A14', 'A11', 'A8', 'D7', 'P1'],
    frames: [
      [0, [72, 48], [81, 44], [78, 56], [71, 48], [80, 40], [95, 50]],
      [900, [88, 46], [88, 46], [84, 54], [74, 48], [84, 40], [93, 48]],
      [800, [85, 54], [89, 45], [85, 54], [76, 48], [86, 42], [92, 47]],
      [700, [100, 52], [89, 45], [86, 54], [77, 48], [87, 42], [92, 47]]
    ]
  },
  {
    id: 85,
    titulo: 'Iniesta al Chelsea — "El Iniestazo" en Stamford Bridge (Champions 2009)',
    pista: 'Champions 2009',
    respuestas: ['iniesta chelsea', 'iniestazo', 'iniesta stamford bridge', 'iniesta 2009'],
    colores: ['#facc15', '#1d4ed8'],
    actores: ['A8', 'A10', 'D5', 'D26', 'P1'],
    frames: [
      [0, [84, 34], [79, 52], [84, 38], [85, 42], [87, 50], [96, 50]],
      [800, [84, 40], [80, 52], [83, 40], [85, 42], [87, 50], [96, 50]],
      [800, [81, 52], [81, 52], [83, 42], [84, 46], [87, 50], [96, 50]],
      [800, [100, 46], [81, 52], [83, 42], [84, 46], [87, 50], [96, 48]]
    ]
  },
  {

    id: 86,
    titulo: 'Luis Suárez al Mallorca — El Tacón Imposible (LaLiga 2019)',
    pista: 'LaLiga 2019',
    respuestas: ['suarez mallorca', 'tacon suarez', 'luis suarez tacon', 'luis suarez'],
    colores: ['#a50044', '#dc2626'],
    actores: ['A9', 'A21', 'D2', 'P1'],
    frames: [
      [0, [80, 40], [90, 35], [79, 40], [92, 38], [96, 50]],
      [800, [92, 35], [92, 35], [80, 40], [93, 38], [96, 50]],
      [900, [100, 55], [92, 35], [81, 40], [94, 38], [95, 45]]
    ]
  },
  {
    id: 87,
    titulo: 'Andrés Palop al Shakhtar Donetsk — Cabezazo del Portero en el 94\' (UEFA 2007)',
    pista: 'UEFA 2007',
    respuestas: ['palop', 'andres palop', 'palop shakhtar', 'sevilla shakhtar'],
    colores: ['#f97316', '#000000'],
    actores: ['PA1', 'A4', 'D5', 'P16'],
    frames: [
      [0, [99, 98], [88, 48], [99, 98], [89, 52], [96, 50]],
      [900, [91, 50], [91, 50], [98, 96], [90, 52], [96, 50]],
      [700, [100, 48], [91, 50], [97, 94], [90, 52], [96, 50]]
    ]
  },
  {
    id: 88,
    titulo: 'Alisson Becker al West Brom — Cabezazo del Portero en el 95\' (2021)',
    pista: 'Premier League 2021',
    respuestas: ['alisson', 'alisson becker', 'alisson west brom', 'gol de alisson'],
    colores: ['#dc2626', '#1e3a8a'],
    actores: ['PA1', 'A66', 'D6', 'P1'],
    frames: [
      [0, [99, 2], [87, 52], [99, 2], [89, 50], [96, 50]],
      [900, [91, 48], [91, 48], [98, 4], [90, 50], [96, 50]],
      [700, [100, 53], [91, 48], [97, 6], [90, 50], [96, 51]]
    ]
  },
  {
    id: 89,
    titulo: 'Son Heung-min al Burnley — Carrera de Área a Área (Premio Puskás 2020)',
    pista: 'Puskás 2020',
    respuestas: ['son burnley', 'son heung min', 'puskas son', 'son tottenham'],
    colores: ['#ffffff', '#7c2d12'],
    actores: ['A7', 'D4', 'D18', 'D5', 'D6', 'P1'],
    frames: [
      [0, [20, 48], [19, 48], [32, 46], [34, 54], [62, 46], [68, 54], [96, 50]],
      [1000, [44, 50], [43, 50], [38, 46], [40, 54], [60, 48], [66, 52], [96, 50]],
      [1000, [68, 48], [67, 48], [46, 46], [48, 54], [64, 48], [66, 52], [95, 50]],
      [900, [86, 48], [85, 48], [54, 46], [56, 54], [74, 48], [76, 52], [93, 50]],
      [700, [100, 52], [88, 48], [56, 46], [58, 54], [78, 48], [80, 52], [93, 50]]
    ]
  },
  {
    id: 90,
    titulo: 'Olivier Giroud al Crystal Palace — El Escorpión (Premier League 2017)',
    pista: 'Premier League 2017',
    respuestas: ['giroud escorpion', 'olivier giroud', 'giroud crystal palace', 'giroud'],
    colores: ['#dc2626', '#facc15'],
    actores: ['A12', 'A7', 'A23', 'D6', 'P13'],
    frames: [
      [0, [36, 54], [42, 52], [48, 28], [35, 54], [78, 50], [96, 50]],
      [800, [48, 28], [58, 50], [48, 28], [40, 54], [80, 50], [96, 50]],
      [1000, [78, 24], [84, 50], [77, 24], [52, 52], [85, 48], [96, 50]],
      [800, [88, 50], [89, 50], [79, 26], [58, 52], [88, 47], [96, 50]],
      [700, [100, 48], [90, 50], [80, 26], [60, 52], [89, 47], [96, 50]]
    ]
  },
  {
    id: 91,
    titulo: 'Jack Wilshere al Norwich — Tiki-Taka del Arsenal al Primer Toque (2013)',
    pista: 'Premier League 2013',
    respuestas: ['wilshere norwich', 'jack wilshere', 'gol colectivo arsenal', 'wilshere giroud'],
    colores: ['#dc2626', '#facc15'],
    actores: ['A10', 'A19', 'A12', 'D5', 'P1'],
    frames: [
      [0, [68, 46], [67, 46], [73, 38], [81, 48], [84, 50], [96, 50]],
      [600, [73, 38], [74, 46], [73, 38], [81, 48], [84, 50], [96, 50]],
      [600, [81, 48], [79, 46], [75, 38], [81, 48], [84, 50], [96, 50]],
      [600, [79, 46], [79, 46], [76, 38], [82, 48], [84, 50], [95, 50]],
      [600, [82, 48], [86, 46], [77, 38], [82, 48], [85, 50], [95, 50]],
      [600, [89, 46], [89, 46], [78, 38], [83, 48], [86, 50], [94, 50]],
      [600, [100, 52], [90, 46], [78, 38], [83, 48], [86, 50], [94, 50]]
    ]
  },
  {
    id: 92,
    titulo: 'Eden Hazard al Arsenal — Carrera desde el Círculo Central (2017)',
    pista: 'Premier League 2017',
    respuestas: ['hazard arsenal', 'eden hazard', 'hazard coquelin', 'hazard 2017'],
    colores: ['#1d4ed8', '#dc2626'],
    actores: ['A10', 'D34', 'D6', 'D20', 'P33'],
    frames: [
      [0, [48, 58], [47, 58], [52, 56], [76, 50], [80, 56], [96, 50]],
      [900, [58, 58], [57, 58], [54, 54], [76, 50], [79, 56], [96, 50]],
      [1000, [78, 54], [77, 54], [60, 54], [78, 50], [80, 58], [95, 50]],
      [900, [88, 52], [87, 52], [64, 54], [84, 48], [85, 56], [94, 50]],
      [700, [100, 50], [89, 52], [66, 54], [86, 48], [86, 56], [94, 50]]
    ]
  },
  {
    id: 93,
    titulo: 'Mohamed Salah al Manchester City — Regates en una Baldosa (2021)',
    pista: 'Premier League 2021',
    respuestas: ['salah city', 'mohamed salah', 'salah manchester city', 'salah laporte'],
    colores: ['#dc2626', '#38bdf8'],
    actores: ['A11', 'D27', 'D20', 'D14', 'P31'],
    frames: [
      [0, [76, 74], [75, 74], [78, 72], [77, 76], [85, 58], [96, 50]],
      [800, [81, 70], [80, 70], [79, 74], [78, 76], [85, 60], [96, 52]],
      [800, [86, 66], [85, 66], [81, 72], [80, 74], [86, 62], [95, 52]],
      [800, [90, 60], [89, 60], [83, 70], [82, 72], [88, 64], [95, 52]],
      [700, [100, 46], [90, 60], [84, 70], [83, 72], [89, 64], [95, 51]]
    ]
  },
  {
    id: 94,
    titulo: 'Alejandro Garnacho al Everton — La Chilena en Goodison Park (2023)',
    pista: 'Premier League 2023',
    respuestas: ['garnacho everton', 'chilena garnacho', 'alejandro garnacho', 'garnacho'],
    colores: ['#dc2626', '#1d4ed8'],
    actores: ['A17', 'A20', 'D6', 'P1'],
    frames: [
      [0, [76, 82], [84, 42], [75, 82], [86, 48], [96, 50]],
      [900, [82, 78], [86, 44], [81, 78], [87, 48], [96, 50]],
      [900, [86, 44], [86, 44], [82, 76], [88, 48], [96, 50]],
      [800, [100, 54], [86, 44], [82, 76], [88, 48], [96, 50]]
    ]
  },
  {
    id: 95,
    titulo: 'Lucas Moura al Ajax — Gol en el 96\' (Semifinal Champions 2019)',
    pista: 'Champions 2019',
    respuestas: ['lucas moura ajax', 'lucas moura', 'moura ajax', 'tottenham ajax 2019'],
    colores: ['#1e3a8a', '#dc2626'],
    actores: ['A27', 'A9', 'A20', 'D4', 'P24'],
    frames: [
      [0, [48, 52], [78, 48], [76, 54], [74, 44], [82, 50], [96, 50]],
      [900, [76, 54], [82, 48], [76, 54], [79, 44], [83, 50], [96, 50]],
      [700, [80, 44], [85, 48], [77, 54], [80, 44], [84, 50], [96, 50]],
      [700, [86, 48], [86, 48], [78, 54], [81, 44], [86, 50], [95, 50]],
      [700, [100, 54], [87, 48], [78, 54], [81, 44], [87, 50], [95, 51]]
    ]
  },
  {
    id: 96,
    titulo: 'Kostas Manolas al Barça — La Remontada de la Roma (Champions 2018)',
    pista: 'Champions 2018',
    respuestas: ['manolas barca', 'kostas manolas', 'roma barca', 'manolas 2018'],
    colores: ['#7c2d12', '#38bdf8'],
    actores: ['A44', 'A17', 'D20', 'P1'],
    frames: [
      [0, [99, 98], [88, 58], [99, 98], [89, 56], [96, 50]],
      [900, [92, 58], [92, 58], [98, 96], [91, 56], [96, 52]],
      [800, [100, 46], [92, 58], [97, 94], [91, 56], [96, 51]]
    ]
  },
  {
    id: 97,
    titulo: 'Cristiano Ronaldo al Portsmouth — La Falta Perfecta (Premier League 2008)',
    pista: 'Premier League 2008',
    respuestas: ['cristiano portsmouth', 'falta cristiano united', 'ronaldo portsmouth', 'cristiano 2008'],
    colores: ['#dc2626', '#1d4ed8'],
    actores: ['A7', 'D5', 'D6', 'D4', 'P1'],
    frames: [
      [0, [74, 48], [68, 44], [83, 46], [83, 48], [83, 50], [96, 50]],
      [900, [74, 48], [73, 47], [83, 46], [83, 48], [83, 50], [96, 50]],
      [600, [85, 40], [74, 48], [83, 46], [83, 48], [83, 50], [96, 50]],
      [600, [100, 42], [74, 48], [83, 46], [83, 48], [83, 50], [96, 50]]
    ]
  },
  {
    id: 98,
    titulo: 'Johan Cruyff al Atlético de Madrid — El Gol Imposible (LaLiga 1973)',
    pista: 'LaLiga 1973',
    respuestas: ['cruyff atletico', 'gol imposible cruyff', 'johan cruyff 1973', 'cruyff reina'],
    colores: ['#a50044', '#dc2626'],
    actores: ['A14', 'A9', 'D4', 'P1'],
    frames: [
      [0, [85, 15], [78, 70], [84, 15], [90, 45], [96, 50]],
      [900, [95, 75], [94, 75], [82, 40], [92, 60], [96, 52]],
      [700, [100, 52], [94, 75], [82, 40], [92, 60], [96, 52]]
    ]
  },
  {
    id: 99,
    titulo: 'Karim Benzema al Atlético — El Regate en la Línea del Calderón (Champions 2017)',
    pista: 'Champions 2017',
    respuestas: ['benzema calderon', 'benzema atletico', 'karim benzema 2017', 'benzema linea de fondo'],
    colores: ['#000000', '#dc2626'],
    actores: ['A9', 'A8', 'A22', 'D2', 'D15', 'D24', 'P13'],
    frames: [
      [0, [96, 12], [95, 12], [82, 42], [91, 48], [96, 15], [94, 10], [92, 16], [96, 48]],
      [900, [98, 16], [97, 16], [83, 42], [91, 48], [97, 12], [95, 10], [93, 14], [96, 48]],
      [800, [98, 24], [97, 24], [84, 42], [92, 48], [97, 14], [96, 12], [95, 18], [96, 48]],
      [700, [85, 42], [97, 26], [85, 42], [92, 48], [96, 16], [96, 14], [95, 20], [96, 48]],
      [700, [93, 48], [97, 26], [85, 42], [93, 48], [96, 18], [96, 16], [95, 22], [96, 50]],
      [600, [100, 50], [97, 26], [85, 42], [93, 48], [96, 18], [96, 16], [95, 22], [96, 50]]
    ]
  },
  {
    id: 100,
    titulo: 'Vinícius Jr. al Borussia Dortmund — Carrera de 70m (Champions 2024)',
    pista: 'Champions 2024',
    respuestas: ['vinicius dortmund', 'vini dortmund', 'vinicius 2024', 'vinicius jr'],
    colores: ['#ffffff', '#facc15'],
    actores: ['A7', 'D26', 'D4', 'D25', 'P1'],
    frames: [
      [0, [34, 12], [33, 12], [44, 16], [68, 32], [78, 44], [96, 50]],
      [1000, [58, 12], [57, 12], [52, 16], [70, 30], [79, 44], [96, 50]],
      [1000, [78, 22], [77, 22], [64, 18], [76, 28], [82, 42], [95, 48]],
      [900, [85, 38], [84, 38], [72, 22], [80, 32], [85, 44], [95, 50]],
      [800, [100, 46], [85, 38], [74, 24], [82, 34], [86, 44], [95, 49]]
    ]
  }
];