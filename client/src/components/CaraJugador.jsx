// client/src/components/CaraJugador.jsx
// Lo que va dentro del circulito de un jugador en las salas y en los juegos: su avatar si lo tiene y se sabe quién
// es; si no, uno inventado a partir de su nombre (siempre el mismo); sin nombre, el número o la inicial.
// Ocupa todo el círculo que lo contiene.
import React from 'react';
import AvatarSVG from './AvatarSVG.jsx';
import { useJugadorCompleto } from '../lib/caras.js';
import { usePerfiles } from '../lib/perfil.js';
import { leerAvatar, avatarDeNombre } from '../lib/avatarPartes.js';
import './CaraJugador.css';

const inicial = (n) => String(n || '?').trim().charAt(0).toUpperCase() || '?';

export default function CaraJugador({ nombre, texto }) {
  const completo = useJugadorCompleto(nombre);
  const perfil = usePerfiles(completo ? [completo] : [])[completo];
  const dibujo = leerAvatar(perfil?.avatar);
  if (dibujo) return <span className="cara-jugador"><AvatarSVG a={dibujo} fondo={perfil.color} modo="cara" tam="100%" /></span>;
  if (perfil?.avatar) return <span className="cara-jugador emoji" style={{ background: perfil.color }}>{perfil.avatar}</span>;
  // Sin avatar propio (p. ej. los demás jugadores en un solo móvil): uno al azar, fijo para ese nombre
  if (String(nombre || '').trim()) {
    const inventado = avatarDeNombre(nombre);
    return <span className="cara-jugador"><AvatarSVG a={inventado.a} fondo={inventado.color} modo="cara" tam="100%" /></span>;
  }
  return <>{texto ?? inicial(nombre)}</>;
}
