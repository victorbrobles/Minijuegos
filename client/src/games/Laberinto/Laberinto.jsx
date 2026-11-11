// client/src/games/Laberinto/Laberinto.jsx
// «El Laberinto»: descubre las salas, consigue el Corazón y escapa antes que nadie. Usa la sala y las pantallas
// comunes de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import LaberintoLocal from './LaberintoLocal.jsx';
import { PartidaOnline, Fin, Config } from './Partida.jsx';
import { AJUSTES, PERSONAJES } from './engine.js';

const JUEGO = {
  id: 'laberinto',
  api: '/api/laberinto',
  emoji: '🗝️',
  config: { rondasMax: 30 },
  Local: LaberintoLocal,
  Partida: PartidaOnline,
  Fin,
  Config,
  notaSala: '🗝️ De 2 a 4 exploradores, por turnos. A cada uno le toca un personaje distinto.',
  ganador: (n) => `¡${n.join(' y ')}!`,
  reglas: [
    'El laberinto tiene 7×7 salas que se descubren al entrar. En el centro está el 💎 Corazón del Laberinto; las salidas 🚪 son las cuatro esquinas. Gana quien saque el Corazón por una salida.',
    `En tu turno das pasos (3; con el Corazón, uno menos) a salas vecinas sin pared. Entrar en una sala nueva te detiene. Las puertas cerradas (marrones) se abren con una 🔑.`,
    'Hay trampas 🕳️ (−1 vida), tesoros 💰, llaves 🔑, pociones 🧪, mapas 📜 que descubren lo de alrededor, cepos 🪤 y barricadas 🚧. Sin vidas, caes aturdido: sueltas el Corazón y la mitad del oro y vuelves a tu entrada.',
    'Además puedes hacer una acción por turno: robar a quien esté en tu sala (el Corazón o 3 de oro; gana el que tiene más vidas), dejar un cepo escondido, bloquear un pasillo o proponer un pacto (unas rondas sin robos ni trampas entre vosotros).',
    `Quien roba el Corazón queda protegido 🛡️ durante ${AJUSTES.rondasEscudo} rondas: nadie puede robarle, así que tiene tiempo de huir hacia una salida. Para pararle, córtale el paso con barricadas y cepos o llega antes a su salida.`,
    ...Object.values(PERSONAJES).map((p) => `${p.e} ${p.nombre}: ${p.desc}`),
    'El Mago no puede teletransportarse a una sala donde haya otro jugador.',
    `Si pasan ${AJUSTES.rondasMax} rondas (configurable) sin que nadie escape, gana quien tenga más oro.`
  ]
};

export default function Laberinto({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
