// client/src/games/Escondite/Escondite.jsx
// «El Escondite»: interfaz sobre las pantallas comunes de rondas simultáneas (../comun/Simultaneo.jsx).
import React from 'react';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import { crearJuegoSimultaneo, FormTexto } from '../comun/Simultaneo.jsx';
import { Avatar } from '../Pulsador/Vistas.jsx';
import { M } from './engine.js';

const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';

function Categoria({ item }) {
  return (
    <div className="smx-cat">
      <span className="smx-cat-emoji" aria-hidden="true">{item.emoji}</span>
      <div><h2>{item.titulo}</h2><small>{item.nOpciones} respuestas posibles</small></div>
    </div>
  );
}

function Responder({ v, enviarRespuesta, accion }) {
  const it = v.item;
  const esc = nombreDe(v, it.escondido);
  if (!it.soyEscondido && !it.escondidoListo) {
    return (
      <div className="pzp-tarjeta">
        <Categoria item={it} />
        <p className="smx-rol">⏳ {esc} se está escondiendo… (aún puede cambiar la categoría). En cuanto elija, te toca buscarle.</p>
      </div>
    );
  }
  return (
    <div className="pzp-tarjeta">
      <Categoria item={it} />
      <p className="smx-rol">
        {it.soyEscondido
          ? '🙈 Te escondes tú: escribe una respuesta de la categoría que creas que NADIE va a decir. Ojo: si no es una respuesta válida de la categoría, sumarán todos los demás.'
          : `🔎 ${esc} se ha escondido: ¿qué respuesta crees que ha elegido?`}
      </p>
      {it.soyEscondido && it.cambiosQuedan > 0 && (
        <button type="button" className="pzp-boton secundario" style={{ marginBottom: '0.6rem' }} onClick={() => accion?.('cambiar')}>
          🔄 Cambiar la categoría ({it.cambiosQuedan === 1 ? 'queda 1 cambio' : `quedan ${it.cambiosQuedan} cambios`})
        </button>
      )}
      <FormTexto key={it.titulo} placeholder={it.soyEscondido ? 'Tu escondite…' : `Lo que ha dicho ${esc}…`} boton={it.soyEscondido ? 'Esconderme aquí' : 'Esta es mi apuesta'}
        onEnviar={enviarRespuesta} />
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
  const norm = (t) => String(t ?? '').trim().toLowerCase();
  const enLista = new Set((it.opciones || []).map(norm));
  const quien = (op) => Object.entries(r.respuestas).filter(([, x]) => x != null && norm(x) === norm(op)).map(([id]) => Number(id));
  // Respuestas que no están en la lista (agrupadas por texto)
  const otras = [...new Set(Object.values(r.respuestas).filter((x) => x != null && !enLista.has(norm(x))).map(norm))]
    .map((t) => ({ t: Object.values(r.respuestas).find((x) => norm(x) === t), ids: quien(t) }));
  const pilladores = (r.acertantes || []).map((id) => nombreDe(v, id));
  return (
    <div className="pzp-tarjeta">
      <Categoria item={it} />
      <p className="smx-veredicto" style={{ marginTop: '0.8rem' }}>
        {r.sinRespuesta ? `${esc} no llegó a esconderse.`
          : r.fueraDeLista ? `🚫 ${esc} se escondió en «${r.elegida}», que no es una respuesta de la categoría: no suma y todos los demás suman 1.`
            : r.pillado ? `🔎 ¡Pillado! ${esc} se escondió en «${r.elegida}» y lo encontró ${pilladores.join(', ')}.`
              : `🙈 ¡Nadie encontró a ${esc}! Se escondió en «${r.elegida}».`}
      </p>
      <ul className="smx-lista">
        {it.opciones.map((op) => (
          <li key={op} className={norm(op) === norm(r.elegida) ? 'destacada' : ''}>
            {norm(op) === norm(r.elegida) ? '🙈 ' : ''}{op}
            <span className="smx-quienes">{quien(op).map((id) => <Avatar key={id} id={id} nombre={nombreDe(v, id)} />)}</span>
          </li>
        ))}
        {otras.map((o) => (
          <li key={`x-${o.t}`} className={norm(o.t) === norm(r.elegida) ? 'destacada' : ''} style={{ opacity: 0.8 }}>
            {norm(o.t) === norm(r.elegida) ? '🙈 ' : '✗ '}{o.t} <small>(no está en la lista)</small>
            <span className="smx-quienes">{o.ids.map((id) => <Avatar key={id} id={id} nombre={nombreDe(v, id)} />)}</span>
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
  textoTurno: (v, id) => (v.item?.escondido === id ? 'Te toca esconderte (puedes cambiar la categoría hasta 3 veces). Que nadie mire la pantalla.' : `Intenta adivinar dónde se ha escondido ${nombreDe(v, v.item?.escondido)}. Que nadie más mire.`),
  notaSala: '🙈 Primero se esconde uno (puede cambiar la categoría hasta 3 veces) y luego los demás lo buscan, cada uno en secreto desde su móvil.',
  detalleFin: (j) => `${j.aciertos} ${j.aciertos === 1 ? 'ronda ganada' : 'rondas ganadas'}`,
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} es el rey del escondite!`),
});

export default function Escondite({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
