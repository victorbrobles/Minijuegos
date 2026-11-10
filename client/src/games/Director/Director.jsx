// client/src/games/Director/Director.jsx
// «Director Deportivo»: ficha con cabeza, cuadra el presupuesto y gana la liga. Usa la sala y las pantallas comunes
// de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import DirectorLocal from './DirectorLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';
import { AJUSTES } from './engine.js';

const JUEGO = {
  id: 'director',
  api: '/api/director',
  emoji: '⚽',
  config: { presupuesto: 200, mercados: 4 },
  Local: DirectorLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  notaSala: `⚽ Cada uno dirige su club desde su móvil. Si sois menos de ${AJUSTES.minClubes}, la liga se completa con clubes de la máquina.`,
  ganador: (n) => `¡${n.join(' y ')} campeón!`,
  reglas: [
    'Cada jugador dirige un club con el mismo presupuesto. Primero eliges formación: decide cuántos defensas, medios y delanteros necesitas.',
    `En cada mercado salen futbolistas reales con su posición, edad, media, potencial y precio. Pujas en secreto (como mucho ${AJUSTES.maxPujas} por mercado): se lo lleva la puja más alta y paga lo que pujó.`,
    `Si te falta alguien en el once, juega otro fuera de su sitio (−8) o un canterano de media ${AJUSTES.canterano}. La plantilla tiene un máximo de ${AJUSTES.maxPlantilla}.`,
    'Al final eliges táctica y se juega una liga a doble vuelta contra todos (y contra los clubes de la máquina).',
    'No basta con fichar a los mejores: cuenta cada línea del equipo, la química (compañeros del mismo club o país), la edad (los jóvenes crecen hacia su potencial y los veteranos bajan), tener banquillo y la táctica frente a la del rival.'
  ]
};

export default function Director({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
