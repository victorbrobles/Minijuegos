// client/src/components/CuerpoJugador.jsx
// El personaje de cuerpo entero de un jugador (pantallas de «pasa el móvil», podio final…): su avatar si lo tiene;
// si no, uno inventado a partir de su nombre (siempre el mismo).
import React from 'react';
import AvatarSVG from './AvatarSVG.jsx';
import { useJugadorCompleto } from '../lib/caras.js';
import { usePerfiles } from '../lib/perfil.js';
import { leerAvatar, avatarDeNombre } from '../lib/avatarPartes.js';
import './CuerpoJugador.css';

export default function CuerpoJugador({ nombre, alto = 150, baile = 'flota', titulo }) {
  const completo = useJugadorCompleto(nombre);
  const perfil = usePerfiles(completo ? [completo] : [])[completo];
  const a = leerAvatar(perfil?.avatar) || avatarDeNombre(nombre || '?').a;
  return (
    <span className={`cuerpo-jugador cj-${baile}`} style={{ height: alto }}>
      <AvatarSVG a={a} modo="cuerpo" tam={alto} titulo={titulo} />
    </span>
  );
}
