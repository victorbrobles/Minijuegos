// server/data/seeds/acta/partidos.js
// Partidos de «Acta del Partido». `acta`: líneas del acta de más vaga a más reveladora (se destapan poco a poco).
// `claves`: grupos de palabras que bastan para dar la respuesta por buena.

export const PARTIDOS = [
  { nombre: 'Liverpool 3-3 Milan (3-2 en penaltis)', detalle: 'Final de la Champions 2005 · Estambul', claves: [['liverpool', 'milan'], ['estambul']],
    acta: ['Final europea · Descanso: 0-3', 'Minutos 54, 56 y 60: tres goles seguidos del equipo que perdía', 'Prórroga y penaltis: el portero ganador para dos lanzamientos', 'Goles: Maldini (1), Crespo (39, 44), Gerrard (54), Šmicer (56), Xabi Alonso (60)', 'Estadio Olímpico Atatürk'] },
  { nombre: 'España 1-0 Holanda', detalle: 'Final del Mundial 2010 · Johannesburgo', claves: [['espana', 'holanda'], ['espana', 'paises', 'bajos']],
    acta: ['Final de un Mundial · 0-0 al acabar los 90 minutos', '14 tarjetas amarillas; roja a un defensa en la prórroga', 'Gol en el minuto 116', 'Un portero le gana un mano a mano decisivo a Robben', 'Gol de Iniesta · Soccer City'] },
  { nombre: 'Brasil 1-7 Alemania', detalle: 'Semifinal del Mundial 2014 · Belo Horizonte', claves: [['brasil', 'alemania'], ['mineirazo']],
    acta: ['Semifinal de un Mundial · 0-5 en el minuto 29', 'Cuatro goles en seis minutos', 'Un delantero bate el récord de goles en Mundiales en este partido', 'El gol del honor llega en el minuto 90', 'Goles: Müller, Klose, Kroos (2), Khedira, Schürrle (2) · Oscar'] },
  { nombre: 'Manchester United 2-1 Bayern de Múnich', detalle: 'Final de la Champions 1999 · Camp Nou', claves: [['united', 'bayern'], ['manchester', 'bayern']],
    acta: ['Final europea · 0-1 desde el minuto 6', 'El equipo que perdía estrella dos balones en los palos rivales', 'Goles en el minuto 90+1 y 90+3, los dos tras un córner', 'Los dos goleadores salieron desde el banquillo', 'Goles: Basler · Sheringham, Solskjær · Barcelona'] },
  { nombre: 'Argentina 3-3 Francia (4-2 en penaltis)', detalle: 'Final del Mundial 2022 · Lusail', claves: [['argentina', 'francia']],
    acta: ['Final de un Mundial · 2-0 en el minuto 36', 'Dos goles del equipo que perdía en 97 segundos (80 y 81)', 'Un jugador marca un hat-trick y pierde la final', '3-3 en la prórroga y penaltis', 'Goles: Messi (2), Di María · Mbappé (3) · Estadio de Lusail'] },
  { nombre: 'Real Madrid 4-1 Atlético de Madrid', detalle: 'Final de la Champions 2014 · Lisboa', claves: [['madrid', 'atletico'], ['decima']],
    acta: ['Final europea entre dos equipos de la misma ciudad', '0-1 en el minuto 36', 'Empate de cabeza en el minuto 92:48', 'Tres goles en la prórroga', 'Goles: Godín · Sergio Ramos, Bale, Marcelo, Cristiano Ronaldo · Estádio da Luz'] },
  { nombre: 'Argentina 2-1 Inglaterra', detalle: 'Cuartos del Mundial 1986 · Estadio Azteca', claves: [['argentina', 'inglaterra'], ['mano', 'dios']],
    acta: ['Cuartos de un Mundial · 0-0 al descanso', 'Gol en el minuto 51 que el árbitro no debió dar', 'Gol en el minuto 55 después de regatear a medio equipo', 'Recorta Lineker en el 81', 'Los dos goles del ganador son de Maradona · Ciudad de México'] },
  { nombre: 'Barcelona 6-1 PSG', detalle: 'Octavos de la Champions 2017 · Camp Nou', claves: [['barcelona', 'psg'], ['barcelona', 'paris'], ['remontada']],
    acta: ['Vuelta de octavos europeos · La ida acabó 4-0 para el visitante', '3-1 en el minuto 62: hacen falta tres goles más', 'Tres goles entre el minuto 88 y el 95', 'El último gol, de Sergi Roberto en el 95', 'Goles: Suárez, Kurzawa (p.p.), Messi, Neymar (2), Sergi Roberto · Cavani'] },
  { nombre: 'Francia 3-0 Brasil', detalle: 'Final del Mundial 1998 · Saint-Denis', claves: [['francia', 'brasil']],
    acta: ['Final de un Mundial en casa del anfitrión', 'Dos goles de cabeza tras córner antes del descanso', 'El defensa Desailly es expulsado en el 68', 'Gol en el 90+3 de Petit', 'Doblete de Zidane · Stade de France'] },
  { nombre: 'España 4-0 Italia', detalle: 'Final de la Eurocopa 2012 · Kiev', claves: [['espana', 'italia']],
    acta: ['Final de una Eurocopa · 2-0 al descanso', 'El rival se queda con diez por lesión, sin cambios', 'El campeón defendía título', 'Goles: Silva, Jordi Alba, Torres, Mata', 'Estadio Olímpico de Kiev'] },
  { nombre: 'Italia 1-1 Francia (5-3 en penaltis)', detalle: 'Final del Mundial 2006 · Berlín', claves: [['italia', 'francia']],
    acta: ['Final de un Mundial · 1-1 en el minuto 19', 'Un penalti marcado a lo Panenka en el minuto 7', 'Expulsión en el 110 por un cabezazo en el pecho', 'Penaltis: falla Trezeguet', 'Goles: Zidane · Materazzi · Olympiastadion'] },
  { nombre: 'Liverpool 4-0 Barcelona', detalle: 'Semifinal de la Champions 2019 · Anfield', claves: [['liverpool', 'barcelona']],
    acta: ['Vuelta de semifinales europeas · La ida acabó 3-0 para el visitante', 'Juegan sin Salah ni Firmino', 'El cuarto gol llega de un córner sacado en un despiste', 'Dos dobletes: Origi y Wijnaldum', 'Anfield'] },
  { nombre: 'Uruguay 2-1 Brasil', detalle: 'Mundial 1950 · El Maracanazo', claves: [['uruguay', 'brasil'], ['maracanazo']],
    acta: ['Último partido de un Mundial · Al anfitrión le valía el empate', '0-1 en el minuto 47', 'Empate en el 66 y gol de la victoria en el 79', 'Más de 170.000 personas en las gradas', 'Goles: Friaça · Schiaffino, Ghiggia · Maracaná'] },
  { nombre: 'Portugal 1-0 Francia', detalle: 'Final de la Eurocopa 2016 · Saint-Denis', claves: [['portugal', 'francia']],
    acta: ['Final de una Eurocopa contra el anfitrión', 'La estrella del equipo ganador se retira lesionada en el minuto 25', '0-0 en los 90 minutos', 'Gol en el minuto 109 desde fuera del área', 'Gol de Éder · Cristiano dirige desde la banda'] },
  { nombre: 'Real Madrid 2-6 Barcelona', detalle: 'Liga 2008/09 · Santiago Bernabéu', claves: [['madrid', 'barcelona'], ['2', '6']],
    acta: ['Partido de Liga en mayo · El local marca primero', 'Seis goles del visitante', 'Un jugador de banda juega de «falso nueve»', 'El campeón sale casi decidido de este partido', 'Goles: Higuaín, Ramos · Henry (2), Messi (2), Puyol, Piqué'] },
  { nombre: 'Real Madrid 1-0 Barcelona', detalle: 'Final de la Copa del Rey 2011 · Mestalla', claves: [['madrid', 'barcelona', 'copa'], ['mestalla']],
    acta: ['Final de Copa · 0-0 en los 90 minutos', 'Un gol anulado a Pedro por fuera de juego', 'Gol de cabeza en el minuto 103', 'En la celebración se cae el trofeo desde un autobús', 'Gol de Cristiano Ronaldo · Valencia'] },
  { nombre: 'Corea del Sur 0-0 España (5-3 en penaltis)', detalle: 'Cuartos del Mundial 2002 · Gwangju', claves: [['corea', 'espana']],
    acta: ['Cuartos de un Mundial · 0-0', 'Dos goles anulados al equipo que perdió', 'Polémica arbitral que aún se recuerda', 'Penaltis: falla Joaquín', 'Árbitro: Gamal Ghandour'] },
  { nombre: 'Chelsea 1-1 Bayern de Múnich (4-3 en penaltis)', detalle: 'Final de la Champions 2012 · Múnich', claves: [['chelsea', 'bayern']],
    acta: ['Final europea en el estadio de uno de los finalistas', 'Gol en el 83 y empate de cabeza en el 88', 'Penalti fallado en la prórroga por Robben', 'El último penalti lo marca Drogba', 'Goles: Müller · Drogba · Allianz Arena'] },
  { nombre: 'Inglaterra 4-2 Alemania Federal', detalle: 'Final del Mundial 1966 · Wembley', claves: [['inglaterra', 'alemania']],
    acta: ['Final de un Mundial · 2-2 tras los 90 minutos', 'Un gol en la prórroga que quizá no entró', 'Un jugador marca un hat-trick en la final', 'El anfitrión gana su único Mundial', 'Goles: Hurst (3), Peters · Wembley'] },
  { nombre: 'Real Madrid 3-1 Manchester City', detalle: 'Semifinal de la Champions 2022 · Bernabéu', claves: [['madrid', 'city']],
    acta: ['Vuelta de semifinales europeas · 0-1 en el minuto 73', 'Dos goles en el 90 y el 90+1', 'El mismo jugador marca los dos goles', 'Penalti en la prórroga para pasar a la final', 'Goles: Mahrez · Rodrygo (2), Benzema'] },
  { nombre: 'Barcelona 1-1 Atlético de Madrid', detalle: 'Última jornada de Liga 2013/14 · Camp Nou', claves: [['barcelona', 'atletico']],
    acta: ['Última jornada de Liga: el que gane es campeón', 'El visitante pierde a dos jugadores lesionados en la primera parte', '1-0 al descanso', 'Empate de cabeza en el 49 tras un córner', 'Goles: Alexis · Godín · el visitante es campeón'] },
  { nombre: 'Manchester City 3-2 QPR', detalle: 'Última jornada de la Premier 2011/12', claves: [['city', 'qpr'], ['city', 'queens']],
    acta: ['Última jornada de liga: el local necesita ganar', '1-2 en el minuto 90', 'Gol en el 90+2 y otro en el 93:20', 'El ganador no era campeón de liga desde 1968', 'Goles: Zabaleta, Džeko, Agüero'] },
  { nombre: 'Barcelona 2-8 Bayern de Múnich', detalle: 'Cuartos de la Champions 2020 · Lisboa', claves: [['barcelona', 'bayern']],
    acta: ['Eliminatoria europea a partido único', '1-4 al descanso', 'Un exjugador del equipo goleado marca dos goles', 'Diez goles en total', 'Goles: Müller (2), Coutinho (2), Lewandowski, Kimmich… · Estádio da Luz'] },
  { nombre: 'Alemania 1-0 Argentina', detalle: 'Final del Mundial 2014 · Maracaná', claves: [['alemania', 'argentina']],
    acta: ['Final de un Mundial · 0-0 en los 90 minutos', 'Un gol anulado a Higuaín por fuera de juego', 'Gol en el minuto 113 tras un pase de Schürrle', 'El goleador había salido desde el banquillo', 'Gol de Götze · Río de Janeiro'] }
];

// Ampliaciones: se añaden sin repetir partido
import EXTRA1 from './extra1.js';
import EXTRA2 from './extra2.js';
for (const x of [...EXTRA1, ...EXTRA2]) if (!PARTIDOS.some((p) => p.nombre === x.nombre)) PARTIDOS.push(x);
