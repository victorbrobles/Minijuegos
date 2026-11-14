// server/lib/logros.js
// Logros e insignias de cada jugador, calculados a partir de sus partidas registradas (registros_resultados) y del
// reto diario. Función pura: recibe los datos ya leídos y devuelve la lista con el progreso de cada logro.
import { META } from '../../client/src/games/meta.js';
import { conVictorias } from '../../client/src/games/limites.js';

const enCategoria = (juego, cat) => (META[juego]?.categorias || []).includes(cat);

/**
 * filas: [{ juego, puntos, gana, fecha, jugadores }] ordenadas por fecha.
 * extra: { dias, rachaDias, reto: { superados, racha: { mejor } }, records: [{ juego, puesto }], companeros (nº distintos) }
 */
export function calcularLogros(filas, extra) {
  const total = filas.length;
  const juegos = new Set(filas.map((f) => f.juego));
  const competidas = filas.filter((f) => f.jugadores > 1 && conVictorias(f.juego));
  const victorias = competidas.filter((f) => f.gana).length;
  let racha = 0; let mejorRacha = 0;
  for (const f of competidas) { racha = f.gana ? racha + 1 : 0; mejorRacha = Math.max(mejorRacha, racha); }
  const porDia = {};
  const hora = (t) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: 'numeric', hourCycle: 'h23' }).format(new Date(t)));
  const dia = (t) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date(t));
  filas.forEach((f) => { porDia[dia(f.fecha)] = (porDia[dia(f.fecha)] || 0) + 1; });
  const maxDia = Math.max(0, ...Object.values(porDia));
  const de = (juego) => filas.filter((f) => f.juego === juego);
  const maxPuntos = (juego) => Math.max(0, ...de(juego).map((f) => Number(f.puntos) || 0));
  const futbol = filas.filter((f) => enCategoria(f.juego, 'futbol')).length;
  const cultura = filas.filter((f) => enCategoria(f.juego, 'prueba')).length;
  const solo = filas.filter((f) => enCategoria(f.juego, 'un_jugador')).length;
  const absolutos = extra.records.filter((r) => r.puesto === 1).length;
  const enPodio = new Set(extra.records.map((r) => r.juego)).size;

  const L = (id, emoji, nombre, desc, actual, objetivo) => ({ id, emoji, nombre, desc, actual: Math.min(actual, objetivo), objetivo, conseguido: actual >= objetivo });
  return [
    L('primera', '🎮', 'Primera partida', 'Juega tu primera partida.', total, 1),
    L('jugon', '🕹️', 'Jugón', 'Juega 50 partidas.', total, 50),
    L('leyenda', '👑', 'Leyenda del Hub', 'Juega 250 partidas.', total, 250),
    L('explorador', '🧭', 'Explorador', 'Prueba 10 juegos distintos.', juegos.size, 10),
    L('trotamundos', '🌍', 'Trotamundos', 'Prueba 30 juegos distintos.', juegos.size, 30),
    L('coleccionista', '🗂️', 'Coleccionista', 'Prueba 60 juegos distintos.', juegos.size, 60),
    L('ganador', '🥇', 'Primera victoria', 'Gana una partida contra otros jugadores.', victorias, 1),
    L('campeon', '🏆', 'Campeón', 'Gana 25 partidas contra otros jugadores.', victorias, 25),
    L('imbatible', '🔥', 'Imbatible', 'Gana 5 partidas seguidas contra otros jugadores.', mejorRacha, 5),
    L('maraton', '⏱️', 'Maratón', 'Juega 10 partidas en un mismo día.', maxDia, 10),
    L('constante', '📅', 'Constante', 'Juega 7 días seguidos.', extra.rachaDias, 7),
    L('madrugador', '☀️', 'Madrugador', 'Supera el reto diario 7 días seguidos.', extra.reto?.racha?.mejor || 0, 7),
    L('retador', '🎯', 'Rey del reto', 'Supera 20 retos diarios.', extra.reto?.superados || 0, 20),
    L('recordman', '⭐', 'Plusmarquista', 'Consigue el récord absoluto de un juego.', absolutos, 1),
    L('podio', '🥉', 'Habitual del podio', 'Entra en el top 3 histórico de 5 juegos.', enPodio, 5),
    L('social', '🤝', 'Alma de la fiesta', 'Juega con 10 personas distintas.', extra.companeros, 10),
    L('mentiroso', '🎲', 'Mentiroso profesional', 'Gana 10 partidas de Cuatro Cuatros.', de('cuatrocuatros').filter((f) => f.gana).length, 10),
    L('detective', '🔎', 'Detective', 'Resuelve 5 casos de Escena del Crimen.', de('crimen').length, 5),
    L('escalador', '🪜', 'Hasta arriba', 'Completa La Escalera (10.000 puntos).', maxPuntos('escalera') >= 10000 ? 1 : 0, 1),
    L('futbolero', '⚽', 'Futbolero', 'Juega 50 partidas de juegos de fútbol.', futbol, 50),
    L('cerebrito', '🧠', 'Cerebrito', 'Juega 30 partidas de juegos para ponerte a prueba.', cultura, 30),
    L('lobo', '🐺', 'Lobo solitario', 'Juega 30 partidas de juegos de un jugador.', solo, 30),
    L('buho', '🦉', 'Búho', 'Juega una partida entre las 2 y las 5 de la madrugada.', filas.some((f) => { const h = hora(f.fecha); return h >= 2 && h < 5; }) ? 1 : 0, 1)
  ];
}
