// server/data/seeds/futbolgrid/clubes.js
// Clubes que usan los tableros de «Fútbol en raya» (código → nombre y país de su liga) y entrenadores con sus etapas.
// Los clubes menores se anotan en la base de jugadores solo por país (es, en, it…), que basta para las categorías
// de liga («Jugó en la Premier League», «Jugó en Italia»…). `en2` = fútbol inglés fuera de la Premier.

export const CLUBES = {
  // España
  RMA: ['Real Madrid', 'es'], BAR: ['FC Barcelona', 'es'], ATM: ['Atlético de Madrid', 'es'], SEV: ['Sevilla', 'es'],
  VAL: ['Valencia', 'es'], VIL: ['Villarreal', 'es'], BET: ['Real Betis', 'es'], RSO: ['Real Sociedad', 'es'],
  CEL: ['Celta de Vigo', 'es'], ATH: ['Athletic Club', 'es'], MLG: ['Málaga', 'es'], DEP: ['Deportivo', 'es'],
  // Inglaterra
  CHE: ['Chelsea', 'en'], MUN: ['Manchester United', 'en'], LIV: ['Liverpool', 'en'], ARS: ['Arsenal', 'en'],
  TOT: ['Tottenham', 'en'], MCI: ['Manchester City', 'en'], AVL: ['Aston Villa', 'en'], NEW: ['Newcastle United', 'en'],
  EVE: ['Everton', 'en'],
  // Italia
  JUV: ['Juventus', 'it'], MIL: ['AC Milan', 'it'], INT: ['Inter de Milán', 'it'], ROM: ['AS Roma', 'it'],
  NAP: ['Napoli', 'it'], FIO: ['Fiorentina', 'it'], LAZ: ['Lazio', 'it'],
  // Alemania
  BAY: ['Bayern Múnich', 'de'], BVB: ['Borussia Dortmund', 'de'], B04: ['Bayer Leverkusen', 'de'], RBL: ['RB Leipzig', 'de'],
  SGE: ['Eintracht Frankfurt', 'de'],
  // Francia
  PSG: ['PSG', 'fr'], OL: ['Olympique Lyon', 'fr'], ASM: ['AS Monaco', 'fr'], OM: ['Olympique Marsella', 'fr'],
  LIL: ['Lille', 'fr'], REN: ['Stade Rennais', 'fr'],
  // Países Bajos, Portugal, Turquía
  AJA: ['Ajax', 'nl'], PSV: ['PSV', 'nl'], FEY: ['Feyenoord', 'nl'],
  POR: ['FC Porto', 'pt'], BEN: ['Benfica', 'pt'], SCP: ['Sporting CP', 'pt'],
  GAL: ['Galatasaray', 'tr'], FEN: ['Fenerbahce', 'tr'], BES: ['Besiktas', 'tr'],
  // Sudamérica
  RIV: ['River Plate', 'ar'], BOC: ['Boca Juniors', 'ar'], SAN: ['Santos', 'br'], FLA: ['Flamengo', 'br'], PAL: ['Palmeiras', 'br'],
  // Otros que aparecen en categorías de país/liga
  MIA: ['Inter Miami', 'us'], LAG: ['LA Galaxy', 'us'], NAS: ['Al Nassr', 'sa'], HIL: ['Al Hilal', 'sa'], ITT: ['Al Ittihad', 'sa']
};

export const EUROPA = new Set(['es', 'en', 'en2', 'it', 'de', 'fr', 'nl', 'pt', 'tr', 'be', 'gr', 'ru', 'ua', 'sc', 'at', 'ch', 'hr', 'rs', 'dk', 'se', 'no', 'cz', 'pl']);

// Etapas de cada entrenador: [club (código) o 'SEL:País', desde, hasta] (temporadas: 2016-2019 = de 2016/17 a 2018/19).
export const ENTRENADORES = {
  'Pep Guardiola': [['BAR', 2008, 2012], ['BAY', 2013, 2016], ['MCI', 2016, 2027]],
  'Jürgen Klopp': [['BVB', 2008, 2015], ['LIV', 2015, 2024]],
  'José Mourinho': [['POR', 2002, 2004], ['CHE', 2004, 2008], ['INT', 2008, 2010], ['RMA', 2010, 2013], ['CHE', 2013, 2016], ['MUN', 2016, 2019], ['TOT', 2019, 2021], ['ROM', 2021, 2024], ['FEN', 2024, 2025], ['BEN', 2025, 2026], ['RMA', 2026, 2027]],
  'Carlo Ancelotti': [['JUV', 1999, 2001], ['MIL', 2001, 2009], ['CHE', 2009, 2011], ['PSG', 2011, 2013], ['RMA', 2013, 2015], ['BAY', 2016, 2018], ['NAP', 2018, 2020], ['EVE', 2020, 2021], ['RMA', 2021, 2025], ['SEL:Brasil', 2025, 2027]],
  'Diego Simeone': [['ATM', 2011, 2027]],
  'Antonio Conte': [['JUV', 2011, 2014], ['SEL:Italia', 2014, 2016], ['CHE', 2016, 2018], ['INT', 2019, 2021], ['TOT', 2021, 2023], ['NAP', 2024, 2027]],
  'Arsene Wenger': [['ASM', 1987, 1994], ['ARS', 1996, 2018]],
  'Luis Enrique': [['ROM', 2011, 2012], ['CEL', 2013, 2014], ['BAR', 2014, 2017], ['SEL:España', 2018, 2022], ['PSG', 2023, 2027]],
  'Manuel Pellegrini': [['VIL', 2004, 2009], ['RMA', 2009, 2010], ['MLG', 2010, 2013], ['MCI', 2013, 2016], ['BET', 2020, 2027]],
  'Marcelo Bielsa': [['SEL:Argentina', 1998, 2004], ['SEL:Chile', 2007, 2011], ['ATH', 2011, 2013], ['OM', 2014, 2015], ['LIL', 2017, 2018], ['SEL:Uruguay', 2023, 2027]],
  'Mauricio Pochettino': [['TOT', 2014, 2019], ['PSG', 2021, 2022], ['CHE', 2023, 2024]],
  'Thomas Tuchel': [['BVB', 2015, 2017], ['PSG', 2018, 2021], ['CHE', 2021, 2022], ['BAY', 2023, 2025], ['SEL:Inglaterra', 2025, 2027]],
  'Unai Emery': [['VAL', 2008, 2012], ['SEV', 2013, 2016], ['PSG', 2016, 2018], ['ARS', 2018, 2020], ['VIL', 2020, 2022], ['AVL', 2022, 2027]],
  'Xabi Alonso': [['B04', 2022, 2025], ['RMA', 2025, 2026]], // Mourinho en el Real Madrid desde 2026: dato aportado por el usuario
  'Zinedine Zidane': [['RMA', 2015, 2018], ['RMA', 2019, 2021]]
};
