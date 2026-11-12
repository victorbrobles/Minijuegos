// client/src/games/PonOrden/PonOrden.jsx
// «Ponlo en orden»: interfaz sobre las pantallas comunes de rondas simultáneas (../comun/Simultaneo.jsx).
import React, { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import { crearJuegoSimultaneo } from '../comun/Simultaneo.jsx';
import { Avatar } from '../Pulsador/Vistas.jsx';
import { M, SEGUNDOS, PERFECTO } from './engine.js';
import './PonOrden.css';

const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';
const numero = (x) => (typeof x === 'number' ? x.toLocaleString('es-ES', { maximumFractionDigits: 3 }) : x);
const ano = (unidad, x) => (/año/.test(unidad) && x < 0 ? `${-x} a. C.` : /año/.test(unidad) ? String(x) : numero(x));

function Cabecera({ it }) {
  return (
    <div className="smx-cat">
      <span className="smx-cat-emoji" aria-hidden="true">{it.emoji}</span>
      <div><h2>{it.titulo}</h2><small>Ordena: {it.criterio.toLowerCase()}</small></div>
    </div>
  );
}

function Responder({ v, enviarRespuesta }) {
  const it = v.item;
  const [orden, setOrden] = useState([]);
  const tocar = (i) => setOrden((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]));
  return (
    <div className="pzp-tarjeta">
      <Cabecera it={it} />
      <p className="pno-ayuda">Toca los elementos en orden: primero el que va arriba. Vuelve a tocar uno para quitarlo.</p>
      <div className="pno-lista">
        {it.elementos.map((e, i) => {
          const pos = orden.indexOf(i);
          return (
            <button key={e.nombre} type="button" className={`pno-elemento${pos >= 0 ? ' puesto' : ''}`} onClick={() => tocar(i)}>
              <b>{pos >= 0 ? pos + 1 : ''}</b><span>{e.nombre}</span>
            </button>
          );
        })}
      </div>
      {orden.length > 0 && (
        <ol className="pno-orden">
          {orden.map((i) => <li key={i}>{it.elementos[i].nombre}</li>)}
        </ol>
      )}
      <div className="pno-botones">
        <button type="button" className="pzp-boton secundario" disabled={!orden.length} onClick={() => setOrden([])}><Icon name="refresh" size={16} /> Empezar de nuevo</button>
        <button type="button" className="pzp-boton grande" disabled={orden.length !== it.elementos.length} onClick={() => enviarRespuesta(orden)}><Icon name="check" size={20} /> Enviar mi orden</button>
      </div>
    </div>
  );
}

function Previa({ v }) {
  const it = v.item;
  return (
    <div className="pzp-tarjeta">
      <Cabecera it={it} />
      {it.mio && <ol className="pno-orden">{it.mio.map((i) => <li key={i}>{it.elementos[i].nombre}</li>)}</ol>}
    </div>
  );
}

function Resultado({ v }) {
  const it = v.item;
  const r = v.resultado;
  const jug = Object.entries(r.porJugador).map(([id, x]) => ({ id: Number(id), ...x })).sort((a, b) => b.aciertos - a.aciertos);
  return (
    <div className="pzp-tarjeta">
      <Cabecera it={it} />
      <p className="pzp-etiqueta" style={{ marginTop: '0.8rem' }}>El orden correcto</p>
      <ol className="pno-solucion">
        {r.solucion.map((i, k) => (
          <li key={i}>
            <b>{k + 1}</b><span>{it.elementos[i].nombre}</span><small>{ano(it.unidad, it.elementos[i].valor)} {/año/.test(it.unidad) ? '' : it.unidad}</small>
            <span className="smx-quienes">{jug.filter((j) => j.orden?.[k] === i).map((j) => <Avatar key={j.id} id={j.id} nombre={nombreDe(v, j.id)} />)}</span>
          </li>
        ))}
      </ol>
      <div className="smx-chips" style={{ marginTop: '0.6rem' }}>
        {jug.map((j) => <span key={j.id} className={`smx-chip${j.aciertos === it.elementos.length ? ' elegida' : ''}`}>{nombreDe(v, j.id)}: {j.orden ? `${j.aciertos}/6` : 'sin respuesta'}</span>)}
      </div>
    </div>
  );
}

const JUEGO = crearJuegoSimultaneo({
  id: 'ponorden',
  api: '/api/ponorden',
  emoji: '📊',
  M,
  Responder,
  Previa,
  Resultado,
  etiqueta: (v) => v.item?.criterio ?? '',
  tituloResponder: () => '¡Ponlo en orden!',
  textoTurno: () => 'Ordena los seis elementos sin que nadie te vea.',
  notaSala: '📊 Todos ordenan a la vez desde su móvil.',
  detalleFin: (j) => `${j.aciertos} ${j.aciertos === 1 ? 'orden perfecto' : 'órdenes perfectos'}`,
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} lo tiene todo en su sitio!`),
  reglas: [
    'Cada ronda salen seis elementos de un tema: inventos, hechos históricos, películas, ríos, montañas, planetas, animales, edificios, países…',
    'Hay que ordenarlos según lo que se pida: del más antiguo al más moderno, del más corto al más largo, del más lejano al más cercano…',
    `Cada elemento en su posición correcta es 1 punto. Si aciertas el orden completo te llevas ${PERFECTO}.`,
    `Online todos ordenan a la vez y hay ${SEGUNDOS} segundos. En un dispositivo, os pasáis el móvil.`
  ]
});

export default function PonOrden({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
