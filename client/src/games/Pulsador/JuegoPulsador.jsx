// client/src/games/Pulsador/JuegoPulsador.jsx
// Menú inicial común (online / un dispositivo) de los juegos de pulsador y de otros que comparten sus pantallas.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import PulsadorLocal from './PulsadorLocal.jsx';
import PulsadorOnline, { claveSesion } from './PulsadorOnline.jsx';
import { JUEGOS } from './juegos.js';
import { useAbrirAyuda } from '../../lib/ayuda.js';

const haySesion = (id) => {
  try {
    return Boolean(sessionStorage.getItem(claveSesion(id)));
  } catch {
    return false;
  }
};

/** `juegoId` para los de pulsador; otros juegos pasan su propio `juego` (con `Local`, `Partida`, `Config`…). */
export default function JuegoPulsador({ juegoId: id, juego: propio, onExit, onVolverMenu, textoVolverMenu }) {
  const juego = propio || JUEGOS[id];
  const juegoId = juego.id;
  const Local = juego.Local || PulsadorLocal;
  const [modo, setModo] = useState(() => (haySesion(juegoId) ? 'online' : 'menu'));
  const abrirAyuda = useAbrirAyuda();
  const [inicial, setInicial] = useState('menu');
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego juegoId={juegoId} local={juego.menuLocal} onOnline={() => setModo('online')} onLocal={juego.sinLocal ? undefined : () => setModo('local')}
          onCrear={() => { setInicial('crear'); setModo('online'); }} onUnirse={() => { setInicial('unirse'); setModo('online'); }} onAyuda={abrirAyuda} onVolver={onVolverMenu} textoVolver={textoVolverMenu} />
      )}
      {modo === 'local' && <Local juego={juego} onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={abrirAyuda} />}
      {modo === 'online' && <PulsadorOnline juego={juego} inicial={inicial} onVolver={() => { setInicial('menu'); setModo('menu'); }} onSalir={irAPortada} onAbrirAyuda={abrirAyuda} />}
    </>
  );
}
