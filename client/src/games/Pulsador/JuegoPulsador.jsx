// client/src/games/Pulsador/JuegoPulsador.jsx
// Menú inicial común (online / un dispositivo) de los juegos de pulsador y de otros que comparten sus pantallas.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuInicioJuego } from '../../components/MenuJuego.jsx';
import PulsadorLocal from './PulsadorLocal.jsx';
import PulsadorOnline, { claveSesion } from './PulsadorOnline.jsx';
import { Ayuda } from './Vistas.jsx';
import { JUEGOS } from './juegos.js';
import { metaDe } from '../meta.js';

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
  const { titulo, descripcion } = metaDe(juegoId);
  const [modo, setModo] = useState(() => (haySesion(juegoId) ? 'online' : 'menu'));
  const [ayuda, setAyuda] = useState(false);
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      {modo === 'menu' && (
        <MenuInicioJuego juegoId={juegoId} local={juego.menuLocal} onOnline={() => setModo('online')} onLocal={() => setModo('local')} onAyuda={() => setAyuda(true)} onVolver={onVolverMenu} textoVolver={textoVolverMenu} />
      )}
      {modo === 'local' && <Local juego={juego} onVolver={() => setModo('menu')} onExit={irAPortada} onAbrirAyuda={() => setAyuda(true)} />}
      {modo === 'online' && <PulsadorOnline juego={juego} onVolver={() => setModo('menu')} onSalir={irAPortada} onAbrirAyuda={() => setAyuda(true)} />}
      {ayuda && <Ayuda titulo={titulo} descripcion={descripcion} reglas={juego.reglas} onCerrar={() => setAyuda(false)} />}
    </>
  );
}
