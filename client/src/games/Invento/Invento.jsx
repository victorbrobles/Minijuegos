// client/src/games/Invento/Invento.jsx
// «El Invento del Siglo»: combina un objeto, un problema y una característica absurda; el resto vota.
// Usa la sala y las pantallas comunes de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import InventoLocal from './InventoLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';
import { AJUSTES, CATEGORIAS } from './engine.js';

const JUEGO = {
  id: 'invento',
  api: '/api/invento',
  emoji: '💡',
  config: { rondas: 3, segundos: 180 },
  Local: InventoLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  notaSala: '💡 Cada uno inventa desde su móvil; luego se vota sin saber de quién es cada invento.',
  detalleFin: (j) => Object.entries(CATEGORIAS).map(([c, C]) => (j.titulos[c] ? `${C.e}×${j.titulos[c]}` : '')).filter(Boolean).join(' ') || 'Sin categorías ganadas',
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} es el inventor del siglo!`),
  reglas: [
    'Cada ronda recibes tres cartas: un objeto, un problema que tiene que resolver y una característica absurda. Puedes cambiar una de ellas.',
    'Inventa un producto que combine las tres: ponle nombre y explica cómo funciona (como en la teletienda).',
    `Después se enseñan todos los inventos sin autor y cada uno vota en tres categorías: ${Object.values(CATEGORIAS).map((c) => `${c.e} ${c.nombre.toLowerCase()}`).join(', ')}. No te puedes votar. Si sois solo dos, entra también un invento de la casa (sus votos no dan puntos a nadie).`,
    `Cada voto da 1 punto y ganar una categoría, ${AJUSTES.bonusCategoria} más. Gana quien más puntos sume al final.`
  ]
};

export default function Invento({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
