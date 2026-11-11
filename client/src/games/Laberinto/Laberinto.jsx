// client/src/games/Laberinto/Laberinto.jsx
// «El Laberinto»: dos juegos bajo la misma portada. Al entrar se elige uno y empieza el ciclo habitual
// (online o en un dispositivo) de ese juego: El Minotauro o Constructores y corredores.
import React, { useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import { PanelMenu, CabeceraJuego } from '../../components/MenuJuego.jsx';
import { Ayuda } from '../Pulsador/Vistas.jsx';
import { claveSesion } from '../Pulsador/PulsadorOnline.jsx';
import { metaDe } from '../meta.js';
import { JUEGO_MINOTAURO } from './Minotauro.jsx';
import { JUEGO_CONSTRUCTORES } from './Constructores.jsx';
import './Laberinto.css';

const JUEGOS = { minotauro: JUEGO_MINOTAURO, constructores: JUEGO_CONSTRUCTORES };
const OPCIONES = [
  { id: 'minotauro', e: '🐂', titulo: 'El Minotauro', jugadores: '3 a 8 jugadores', texto: 'Uno caza en secreto. Los demás buscan las llaves y escapan en la niebla. Todos movéis a la vez.' },
  { id: 'constructores', e: '🧱', titulo: 'Constructores y corredores', jugadores: '2 a 8 jugadores', texto: 'Diseña el laberinto más retorcido para tu rival… y recorre el suyo antes que nadie.' }
];

/** Si hay una partida online a medias de uno de los dos juegos, se entra directamente en él. */
function sesionAbierta() {
  try { return Object.keys(JUEGOS).find((k) => sessionStorage.getItem(claveSesion(k))) || null; } catch { return null; }
}

export default function Laberinto({ onExit }) {
  const [elegido, setElegido] = useState(sesionAbierta);
  const [ayuda, setAyuda] = useState(false);
  if (elegido) {
    return <JuegoPulsador key={elegido} juego={JUEGOS[elegido]} onExit={onExit} onVolverMenu={() => setElegido(null)} textoVolverMenu="Elegir juego" />;
  }
  const m = metaDe('laberinto');
  return (
    <>
      <section className="game qq-pantalla lbs-selector">
        <PanelMenu onAyuda={() => setAyuda(true)}>
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
      {ayuda && (
        <Ayuda titulo={m.titulo} descripcion={m.descripcion} onCerrar={() => setAyuda(false)}
          reglas={['Bajo esta portada hay dos juegos distintos. Elige uno y después decide si jugáis online (cada uno con su móvil) o en un solo móvil.',
            ...JUEGO_MINOTAURO.reglas.slice(0, 2).map((r) => `🐂 ${r}`), ...JUEGO_CONSTRUCTORES.reglas.slice(0, 1).map((r) => `🧱 ${r}`)]} />
      )}
    </>
  );
}
