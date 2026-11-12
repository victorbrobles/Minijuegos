// client/src/games/Escondite/Escondite.jsx
// «El Escondite»: interfaz sobre las pantallas comunes de rondas simultáneas (../comun/Simultaneo.jsx).
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import { crearJuegoSimultaneo, FormTexto } from '../comun/Simultaneo.jsx';
import { Avatar } from '../Pulsador/Vistas.jsx';
import { M, SEGUNDOS } from './engine.js';

const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';

function Categoria({ item }) {
  return (
    <div className="smx-cat">
      <span className="smx-cat-emoji" aria-hidden="true">{item.emoji}</span>
      <div><h2>{item.titulo}</h2><small>{item.nOpciones} respuestas posibles</small></div>
    </div>
  );
}

function Responder({ v, enviarRespuesta }) {
  const it = v.item;
  const esc = nombreDe(v, it.escondido);
  return (
    <div className="pzp-tarjeta">
      <Categoria item={it} />
      <p className="smx-rol">
        {it.soyEscondido
          ? '🙈 Te escondes tú: elige una respuesta que creas que NADIE va a decir.'
          : `🔎 ${esc} se esconde: ¿qué respuesta crees que ha elegido?`}
      </p>
      <FormTexto placeholder={it.soyEscondido ? 'Tu escondite…' : `Lo que ha dicho ${esc}…`} boton={it.soyEscondido ? 'Esconderme aquí' : 'Esta es mi apuesta'}
        onEnviar={enviarRespuesta}>
        {(datos) => datos?.opciones && (
          <>
            <p style={{ color: '#7f1d1d', fontWeight: 700 }}>Las respuestas posibles son:</p>
            <div className="smx-chips">{datos.opciones.map((o) => <span key={o} className="smx-chip">{o}</span>)}</div>
          </>
        )}
      </FormTexto>
    </div>
  );
}

function Previa({ v }) {
  const it = v.item;
  return (
    <div className="pzp-tarjeta">
      <Categoria item={it} />
      {it.mia && <p className="smx-rol">{it.soyEscondido ? `🙈 Te has escondido en: ${it.mia}` : `🔎 Tu apuesta: ${it.mia}`}</p>}
    </div>
  );
}

function Resultado({ v }) {
  const it = v.item;
  const r = v.resultado;
  const esc = nombreDe(v, r.escondido);
  const quien = (op) => Object.entries(r.respuestas).filter(([, x]) => x === op).map(([id]) => Number(id));
  const pilladores = Object.entries(r.respuestas).filter(([id, x]) => Number(id) !== r.escondido && x != null && x === r.respuestas[r.escondido]).map(([id]) => nombreDe(v, Number(id)));
  return (
    <div className="pzp-tarjeta">
      <Categoria item={it} />
      <p className="smx-veredicto" style={{ marginTop: '0.8rem' }}>
        {r.sinRespuesta ? `${esc} no llegó a esconderse.`
          : r.pillado ? `🔎 ¡Pillado! ${esc} se escondió en «${r.respuestas[r.escondido]}» y lo encontró ${pilladores.join(', ')}.`
            : `🙈 ¡Nadie encontró a ${esc}! Se escondió en «${r.respuestas[r.escondido]}».`}
      </p>
      <ul className="smx-lista">
        {it.opciones.map((op) => (
          <li key={op} className={op === r.respuestas[r.escondido] ? 'destacada' : ''}>
            {op === r.respuestas[r.escondido] ? '🙈 ' : ''}{op}
            <span className="smx-quienes">{quien(op).map((id) => <Avatar key={id} id={id} nombre={nombreDe(v, id)} />)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const JUEGO = crearJuegoSimultaneo({
  id: 'escondite',
  api: '/api/escondite',
  emoji: '🙈',
  M,
  Responder,
  Previa,
  Resultado,
  primero: (v) => v.item?.escondido,
  etiqueta: (v) => (v.item ? `Se esconde ${nombreDe(v, v.item.escondido)}` : ''),
  tituloResponder: (v, id) => (v.item?.escondido === id ? '¡Escóndete!' : '¡A buscar!'),
  textoTurno: (v, id) => (v.item?.escondido === id ? 'Te toca esconderte. Que nadie mire la pantalla.' : `Intenta adivinar dónde se ha escondido ${nombreDe(v, v.item?.escondido)}. Que nadie más mire.`),
  notaSala: '🙈 Cada uno responde en secreto desde su móvil.',
  detalleFin: (j) => `${j.aciertos} ${j.aciertos === 1 ? 'ronda ganada' : 'rondas ganadas'}`,
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} es el rey del escondite!`),
  reglas: [
    'Sale una categoría con pocas respuestas posibles, de 5 a 11: los ríos más largos de España, un once histórico, los planetas…',
    'Cada ronda un jugador se esconde: escribe en secreto una de esas respuestas intentando que nadie la adivine. Los demás escriben cuál creen que ha elegido.',
    'Si nadie la adivina, el escondido suma 1 punto. Si alguien la adivina, el escondido no suma y cada uno de los que la adivinan suma 1.',
    'Si escribes algo que no está entre las respuestas posibles, no vale: se te muestran las posibles y vuelves a intentarlo.',
    `Online hay ${SEGUNDOS} segundos por ronda. Con muchos jugadores solo salen categorías con muchas respuestas posibles.`,
    'Las rondas son 2, 3 o 4 por jugador, así que todos se esconden las mismas veces.'
  ]
});

export default function Escondite({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
