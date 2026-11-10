// client/src/games/Mus/Mus.jsx
// Mus clásico: online (de 2 a 4 personas; los huecos los ocupa la máquina) o contra la máquina en tu móvil.
// Usa la sala y las pantallas comunes de ../Pulsador.
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import MusLocal from './MusLocal.jsx';
import { PartidaOnline, Fin, Config } from './Mesa.jsx';

const JUEGO = {
  id: 'mus',
  api: '/api/mus',
  emoji: '🂡',
  config: { objetivo: 40, vacas: 1, companero: null },
  Local: MusLocal,
  menuLocal: { icono: 'gamepad', titulo: 'Jugar contra la máquina', texto: 'Tú y tu pareja 🤖 contra dos 🤖, en tu móvil' },
  Partida: PartidaOnline,
  Fin,
  Config,
  notaSala: '🂡 Dos parejas: el anfitrión y su compañero contra los otros dos. Si faltan jugadores, juega la máquina.',
  ganador: (n) => `¡Gana ${n.join(' y ')}!`,
  reglas: [
    'Se juega por parejas (los de enfrente) con la baraja española de 40 cartas, a 8 reyes: los treses valen como reyes y los doses como ases.',
    'Mus: desde la mano, cada uno dice «mus» (quiere cambiar cartas) o «no hay mus». Si los cuatro piden mus, todos se descartan y se reparte otra vez.',
    'Lances, por orden: Grande (gana la mano más alta), Chica (la más baja), Pares (pareja < medias < duples) y Juego (31 o más: la 31 es la mejor, luego 32, 40, 37…). Si nadie tiene juego, se juega al Punto (lo más cerca de 30).',
    'En cada lance puedes pasar, envidar (2 o más), subir, querer, no querer o echar un órdago (si se quiere, quien gane el lance gana el juego).',
    'Si no quieren tu envite, cobras en el momento lo que había (1 si era el primero). Lo querido se cobra al final de la mano, con las cartas boca arriba. Pares y juego cobran además por lo que se lleva: pareja 1, medias 2, duples 3; juego 2 (31: 3).',
    'Los empates los gana quien está más cerca de la mano. Gana la pareja que llega antes a los puntos.'
  ]
};

export default function Mus({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
