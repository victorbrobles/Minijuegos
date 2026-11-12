// client/src/games/Lapiz/Lapiz.jsx
// «¡Lápiz fuera!»: interfaz sobre las pantallas comunes de rondas simultáneas (../comun/Simultaneo.jsx).
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import JuegoPulsador from '../Pulsador/JuegoPulsador.jsx';
import { crearJuegoSimultaneo, useCuentaLocal } from '../comun/Simultaneo.jsx';
import { Avatar, Cuenta } from '../Pulsador/Vistas.jsx';
import { M, SEGUNDOS, SEGUNDOS_LOCAL, CIERRE, PUNTOS, conLetra } from './engine.js';
import './Lapiz.css';

const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';

function Letra({ letra }) {
  return <div className="lpz-letra"><small>Letra</small><b>{letra}</b></div>;
}

function Responder({ v, enviarRespuesta, enviarBorrador, local }) {
  const it = v.item;
  const [txt, setTxt] = useState(() => it.categorias.map(() => ''));
  const ref = useRef(txt);
  ref.current = txt;
  const enviado = useRef(false);
  const tBorrador = useRef(null);
  const terminar = () => { if (!enviado.current) { enviado.current = true; enviarRespuesta(ref.current); } };
  const restante = useCuentaLocal(SEGUNDOS_LOCAL, terminar, Boolean(local));
  useEffect(() => () => clearTimeout(tBorrador.current), []);
  const cambiar = (k, valor) => {
    const nuevo = ref.current.map((x, i) => (i === k ? valor : x));
    setTxt(nuevo);
    if (local) enviarBorrador(nuevo);
    else { clearTimeout(tBorrador.current); tBorrador.current = setTimeout(() => enviarBorrador(nuevo), 700); }
  };
  const hechas = txt.filter((x) => conLetra(x, it.letra)).length;
  return (
    <div className="pzp-tarjeta">
      {local && <Cuenta ms={restante} total={SEGUNDOS_LOCAL * 1000} />}
      <div className="lpz-cab">
        <Letra letra={it.letra} />
        <p>Una palabra por categoría que empiece por <b>{it.letra}</b>. {it.cierre && !local ? <strong className="lpz-aviso">¡Alguien ya ha soltado el lápiz! Date prisa.</strong> : ''}</p>
      </div>
      <div className="lpz-campos">
        {it.categorias.map((c, k) => (
          <label key={c} className={`lpz-campo${conLetra(txt[k], it.letra) ? ' ok' : txt[k].trim() ? ' mal' : ''}`}>
            <span>{c}</span>
            <input value={txt[k]} onChange={(e) => cambiar(k, e.target.value)} placeholder={`${it.letra}…`} maxLength={40} autoComplete="off" autoCapitalize="sentences" />
          </label>
        ))}
      </div>
      <button type="button" className="pzp-boton grande lpz-fuera" onClick={terminar}>
        ✏️ ¡Lápiz fuera! <small>({hechas}/{it.categorias.length})</small>
      </button>
    </div>
  );
}

function Revision({ v, votar, local, yo }) {
  const it = v.item;
  const ids = Object.keys(it.respuestas).map(Number);
  return (
    <div className="pzp-tarjeta">
      <div className="lpz-cab"><Letra letra={it.letra} /><p>{local ? 'Tocad las respuestas que no valgan para anularlas.' : 'Toca las respuestas de los demás que no valgan. Se anulan si la mitad o más votáis en contra.'}</p></div>
      {it.categorias.map((c, k) => (
        <div key={c} className="lpz-rev">
          <p className="pzp-etiqueta">{c}</p>
          <div className="lpz-rev-fila">
            {ids.map((id) => {
              const txt = it.respuestas[id]?.[k] || '';
              const clave = `${id}:${k}`;
              const voto = v.votos?.[clave];
              if (!conLetra(txt, it.letra)) return <span key={id} className="lpz-resp vacia"><Avatar id={id} nombre={nombreDe(v, id)} /> {txt || '—'}</span>;
              const propia = !local && id === yo;
              return (
                <button key={id} type="button" disabled={propia} onClick={() => votar(clave)}
                  className={`lpz-resp${voto?.anulada ? ' anulada' : ''}${voto?.mio ? ' mio' : ''}`}>
                  <Avatar id={id} nombre={nombreDe(v, id)} /> {txt}
                  {!local && voto?.n ? <em>✗{voto.n}</em> : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Resultado({ v }) {
  const it = v.item;
  const r = v.resultado;
  const ids = Object.keys(r.respuestas).map(Number);
  return (
    <div className="pzp-tarjeta">
      <div className="lpz-cab"><Letra letra={it.letra} /><p>{PUNTOS.unica} si nadie más lo ha puesto, {PUNTOS.repetida} si está repetida y {PUNTOS.sola} si eres el único con respuesta válida.</p></div>
      {it.categorias.map((c, k) => (
        <div key={c} className="lpz-rev">
          <p className="pzp-etiqueta">{c}</p>
          <div className="lpz-rev-fila">
            {ids.map((id) => {
              const pts = r.celdas[`${id}:${k}`];
              const txt = r.respuestas[id]?.[k] || '—';
              return <span key={id} className={`lpz-resp${pts ? '' : ' anulada'}`}><Avatar id={id} nombre={nombreDe(v, id)} /> {txt} <b>{pts ? `+${pts}` : '0'}</b></span>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Previa({ v }) {
  return <div className="pzp-tarjeta"><div className="lpz-cab"><Letra letra={v.item.letra} /><p>Has soltado el lápiz. Esperando al resto…</p></div></div>;
}

const JUEGO = crearJuegoSimultaneo({
  id: 'lapiz',
  api: '/api/lapiz',
  emoji: '✏️',
  M,
  Responder,
  Previa,
  Revision,
  Resultado,
  etiqueta: (v) => (v.item ? `Letra ${v.item.letra}` : ''),
  tituloResponder: (v) => `¡Con la ${v.item?.letra}!`,
  textoTurno: () => `Tendrás ${SEGUNDOS_LOCAL} segundos para rellenar las ocho categorías.`,
  notaSala: `✏️ Cada uno escribe en su móvil. Cuando alguien suelta el lápiz, el resto tiene ${CIERRE} segundos.`,
  detalleFin: (j) => `${j.aciertos} ${j.aciertos === 1 ? 'ronda completa' : 'rondas completas'}`,
  ganador: (n) => (n.length > 1 ? `¡Empate entre ${n.join(' y ')}!` : `¡${n[0]} tiene el lápiz más rápido!`),
  reglas: [
    'Cada ronda sale una letra y ocho categorías: nombre, animal, país o ciudad, cosa… y cuatro más que cambian.',
    'Escribe una palabra por categoría que empiece por esa letra.',
    `Cuando termines, pulsa «¡Lápiz fuera!». Online, a los demás les quedan ${CIERRE} segundos (y lo que tengan escrito cuenta). Si nadie termina, la ronda dura ${SEGUNDOS} segundos.`,
    'Después se revisan las respuestas entre todos: las que no valgan se anulan (online, si la mitad o más votáis en contra).',
    `Puntos por categoría: ${PUNTOS.unica} si nadie más ha puesto lo mismo, ${PUNTOS.repetida} si está repetida y ${PUNTOS.sola} si eres el único que ha escrito algo válido.`,
    `En un dispositivo, cada uno escribe por turnos con ${SEGUNDOS_LOCAL} segundos.`
  ]
});

export default function Lapiz({ onExit }) {
  return <JuegoPulsador juego={JUEGO} onExit={onExit} />;
}
