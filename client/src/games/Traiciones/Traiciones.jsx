// client/src/games/Traiciones/Traiciones.jsx
// Traiciones es un juego en tiempo real y necesita un móvil por jugador, así que solo existe el modo online.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TraicionesOnline from './TraicionesOnline.jsx';
import { AJUSTES } from './engine.js';
import './Traiciones.css';
import { metaDe } from '../meta.js';

// Título y descripción: siempre los de meta.js
const { titulo: TITULO_JUEGO, descripcion: DESCRIPCION_JUEGO } = metaDe('traiciones');
const s = (ms) => Math.round(ms / 1000);

export function AyudaTraiciones({ onCerrar }) {
  return (
    <div className="rg-modal-fondo" onClick={onCerrar}>
      <div className="rg-modal qq-modal-ayuda" onClick={(e) => e.stopPropagation()}>
        <div className="qq-modal-ayuda-header">
          <span className="qq-ayuda-badge">❓ Cómo jugar</span>
          <h3>{TITULO_JUEGO}</h3>
        </div>
        <div className="qq-modal-ayuda-body">
          <p>{DESCRIPCION_JUEGO} Cada jugador usa su propio móvil y la partida es <strong>en tiempo real</strong>: no se detiene hasta que alguien reporta un cuerpo o toca la campana.</p>
          <p className="tr-ayuda-sub">🗺️ El campamento</p>
          <ul>
            <li>Nueve lugares: la Hoguera en el centro y cuatro alas (norte, este, sur y oeste) de dos salas cada una. Los fondos de alas vecinas se comunican formando un anillo.</li>
            <li>Solo puedes ir a una sala <strong>contigua</strong> ({s(AJUSTES.viajeMs)} s de camino; mientras caminas nadie te ve).</li>
            <li>Solo ves a quien está <strong>en tu mismo lugar</strong> y quién entra o sale. Nadie sabe quién sigue vivo hasta que aparece un cuerpo o hay asamblea.</li>
            <li>Desde la <strong>Atalaya</strong> ves cuánta gente hay en cada lugar (sin nombres).</li>
          </ul>
          <p className="tr-ayuda-sub">🧭 Viajeros (leales)</p>
          <ul>
            <li>Tienes {AJUSTES.tareasPorJugador} tareas repartidas por el campamento. Cada sala tiene su propia prueba (puntería, memoria, cálculo, pulso…). Si te mueves, pierdes lo avanzado.</li>
            <li>Si ves un cuerpo, <strong>repórtalo</strong>. Si sospechas de alguien, toca la <strong>campana</strong> (una vez por partida).</li>
            <li>Ganáis si se completan todas las tareas o si expulsáis a todos los traidores.</li>
          </ul>
          <p className="tr-ayuda-sub">🗡️ Traidores</p>
          <ul>
            <li>Solo podéis eliminar a alguien que esté <strong>a solas</strong> con vosotros, y hay que esperar entre muerte y muerte.</li>
            <li>Cada muerte os da un <strong>atajo</strong>: un salto rápido a una sala lejana (se pierde en la siguiente asamblea).</li>
            <li>Sabotajes: <strong>tormenta de arena</strong> ({s(AJUSTES.tormentaMs)} s sin ver caras) e <strong>incendio</strong> (hay que apagar dos lugares antes de {s(AJUSTES.incendioMs)} s; mientras arde no se puede trabajar ni tocar la campana).</li>
            <li>Ganáis al ser tantos como los demás vivos, o si el campamento arde.</li>
          </ul>
          <p className="tr-ayuda-sub">🔔 Asamblea</p>
          <ul>
            <li>Todos vuelven a la Hoguera, debaten (por chat o en voz alta) y votan. Se expulsa a quien más votos tenga si supera a los votos en blanco; con empate no sale nadie.</li>
            <li>Los votos son públicos y se revela el papel del expulsado.</li>
          </ul>
          <p className="tr-ayuda-sub">🎭 Papeles especiales (opcionales)</p>
          <ul>
            <li><strong>Vigía</strong> (5+ jugadores): una vez por partida ve en directo quién hay en cualquier lugar.</li>
            <li><strong>Protegido</strong> (6+): sobrevive al primer ataque y descubre quién fue.</li>
            <li><strong>Bufón</strong> (7+): gana él solo si la caravana lo expulsa.</li>
            <li>Los eliminados son <strong>espíritus</strong>: lo ven todo y pueden seguir con sus tareas, pero no hablan.</li>
          </ul>
          <p className="tr-ayuda-sub">🏆 Puntos</p>
          <ul>
            <li>Leales: +3 si ganan (+1 si siguen vivos). Traidores: +5 si ganan (+1 por víctima). Bufón: +7.</li>
          </ul>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>
          ¡Entendido!
        </button>
      </div>
    </div>
  );
}

export default function Traiciones({ onExit }) {
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const navigate = useNavigate();
  const irAPortada = () => (typeof onExit === 'function' ? onExit() : navigate('/'));

  return (
    <>
      <TraicionesOnline onSalir={irAPortada} onAbrirAyuda={() => setMostrarAyuda(true)} />
      {mostrarAyuda && <AyudaTraiciones onCerrar={() => setMostrarAyuda(false)} />}
    </>
  );
}
