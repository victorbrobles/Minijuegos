// client/src/games/Intruso/Intruso.jsx
// «El Intruso Histórico»: interfaz sobre las pantallas comunes de rondas simultáneas (../comun/Simultaneo.jsx).
import React, { useRef, useState } from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import { crearJuegoSimultaneo, useCuentaLocal } from '../comun/Simultaneo.jsx';
import { Avatar, Cuenta } from '../Pulsador/Vistas.jsx';
import { M, SEGUNDOS, RAPIDO_MS } from './engine.js';
import './Intruso.css';

const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';
const LETRAS = ['A', 'B', 'C', 'D', 'E'];

function Pregunta({ it }) {
  return (
    <div className="smx-cat">
      <span className="smx-cat-emoji" aria-hidden="true">{it.emoji}</span>
      <div><h2>{it.pregunta}</h2><small>{it.titulo}</small></div>
    </div>
  );
}

function Responder({ v, enviarRespuesta, local }) {
  const it = v.item;
  const t0 = useRef(Date.now());
  const [elegida, setElegida] = useState(null);
  const restante = useCuentaLocal(SEGUNDOS, () => { if (elegida == null) enviarRespuesta(null); }, Boolean(local));
  const elegir = (i) => {
    if (elegida != null) return;
    setElegida(i);
    enviarRespuesta({ i, ms: Date.now() - t0.current });
  };
  return (
    <div className="pzp-tarjeta">
      {local && <Cuenta ms={restante} total={SEGUNDOS * 1000} />}
      <Pregunta it={it} />
      <div className="itr-opciones">
        {it.opciones.map((o, i) => (
          <button key={o} type="button" className={`itr-opcion${elegida === i ? ' elegida' : ''}`} disabled={elegida != null} onClick={() => elegir(i)}>
            <i>{LETRAS[i]}</i><span>{o}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Previa({ v }) {
  const it = v.item;
  return (
    <div className="pzp-tarjeta">
      <Pregunta it={it} />
      {it.mia != null && <p className="smx-rol">Tu elección: {it.opciones[it.mia]}</p>}
    </div>
  );
}

function Resultado({ v }) {
  const it = v.item;
  const e = v.resultado.elegidas;
  return (
    <div className="pzp-tarjeta">
      <Pregunta it={it} />
      <div className="itr-opciones">
        {it.opciones.map((o, i) => (
          <div key={o} className={`itr-opcion resuelta${i === it.intruso ? ' intruso' : ''}`}>
            <i>{i === it.intruso ? '!' : LETRAS[i]}</i><span>{o}</span>
            <span className="smx-quienes">{Object.entries(e).filter(([, x]) => x === i).map(([id]) => <Avatar key={id} id={Number(id)} nombre={nombreDe(v, Number(id))} />)}</span>
          </div>
        ))}
      </div>
      <p className="itr-explica">💡 {it.explicacion}</p>
    </div>
  );
}

const JUEGO = crearJuegoSimultaneo({
  id: 'intruso',
  api: '/api/intruso',
  emoji: '🕵️',
  M,
  Responder,
  Previa,
  Resultado,
  etiqueta: (v) => v.item?.titulo ?? '',
  tituloResponder: () => '¿Quién es el intruso?',
  textoTurno: () => `Tendrás ${SEGUNDOS} segundos en cuanto pulses el botón.`,
  notaSala: '🕵️ Todos responden a la vez desde su móvil: 10 segundos por ronda.',
  detalleFin: (j) => `${j.aciertos} ${j.aciertos === 1 ? 'intruso encontrado' : 'intrusos encontrados'}`,
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} huele a los intrusos!`),
  reglas: [
    'Salen cinco elementos (inventos, obras, hechos históricos, películas, personajes…) y uno no encaja: es de otra época o no pertenece a la categoría.',
    `Tienes ${SEGUNDOS} segundos para encontrarlo.`,
    `Acertar da 1 punto, y 1 más si respondes en menos de ${RAPIDO_MS / 1000} segundos. Fallar no resta.`,
    'Al resolver se explica por qué era el intruso (con los años de cada uno, si era de época).'
  ]
});

export default function Intruso({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
