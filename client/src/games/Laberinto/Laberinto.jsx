// client/src/games/Laberinto/Laberinto.jsx
// «El Laberinto»: dos juegos bajo la misma portada. Al entrar se elige uno y empieza el ciclo habitual
// (online o en un dispositivo) de ese juego: El Minotauro o Constructores y corredores.
import React, { useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import { PanelMenu, CabeceraJuego } from '../../components/MenuJuego.jsx';
import { claveSesion } from '../Pulsador/PulsadorOnline.jsx';
import { JUEGO_MINOTAURO } from './Minotauro.jsx';
import { JUEGO_CONSTRUCTORES } from './Constructores.jsx';
import './Laberinto.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';

const JUEGOS = { minotauro: JUEGO_MINOTAURO, constructores: JUEGO_CONSTRUCTORES };
const OPCIONES = [
  { id: 'minotauro', e: '🐂', titulo: 'El Minotauro', jugadores: '2 a 8 jugadores', texto: 'Uno caza en secreto. Los demás buscan las llaves y escapan en la niebla. Todos movéis a la vez.' },
  { id: 'constructores', e: '🧱', titulo: 'Constructores y corredores', jugadores: '2 a 8 jugadores', texto: 'Diseña el laberinto más retorcido para tu rival… y recorre el suyo antes que nadie.' }
];

/** Si hay una partida online a medias de uno de los dos juegos, se entra directamente en él. */
function sesionAbierta() {
  try { return Object.keys(JUEGOS).find((k) => sessionStorage.getItem(claveSesion(k))) || null; } catch { return null; }
}

export default function Laberinto({ onExit }) {
  const [elegido, setElegido] = useState(sesionAbierta);
  const abrirAyuda = useAbrirAyuda();
  if (elegido) {
    return <JuegoPulsador key={elegido} juego={JUEGOS[elegido]} onExit={onExit} onVolverMenu={() => setElegido(null)} textoVolverMenu="Elegir juego" />;
  }
  return (
    <>
      <section className="game qq-pantalla lbs-selector">
        <PanelMenu onAyuda={abrirAyuda}>
          <CabeceraJuego juegoId="laberinto" />
          <p className="lbs-pregunta">¿A cuál jugáis?</p>
          <div className="lbs-opciones">
            {OPCIONES.map((o) => (
              <button key={o.id} type="button" className={`lbs-opcion ${o.id}`} onClick={() => setElegido(o.id)}>
                <span className="lbs-arte" aria-hidden="true">{o.e}</span>
                <span className="lbs-txt"><b>{o.titulo}</b><small>{o.texto}</small><em>👥 {o.jugadores}</em></span>
              </button>
            ))}
          </div>
        </PanelMenu>
      </section>
    </>
  );
}
