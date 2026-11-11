// client/src/games/DatoSobra/Partida.jsx
// Pantallas de «El Dato que Sobra» (online y en un dispositivo) con las piezas comunes de ../Pulsador.
import React, { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Hero, Cuenta, useRestante, Avatar, Pildoras, PantallaFin, AvisoTurno } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { AJUSTES, OPCIONES, LETRAS } from './engine.js';
import './DatoSobra.css';

const HERO = { emoji: '🕵️' };
const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';

function Afirmaciones({ v, marcada, onElegir, bloqueada = [], resultado }) {
  return (
    <ol className="dsx-lista">
      {v.afirmaciones.map((a, i) => {
        const cl = ['dsx-afirmacion'];
        if (marcada === i) cl.push('marcada');
        if (v.respuesta === i) cl.push('respuesta');
        if (resultado) cl.push(i === resultado.falsa ? 'falsa' : 'cierta');
        return (
          <li key={i}>
            <button type="button" className={cl.join(' ')} disabled={!onElegir || bloqueada.includes(i)} onClick={() => onElegir?.(i)}>
              <span className="dsx-letra">{LETRAS[i]}</span>
              <span className="dsx-texto">{a}</span>
              {resultado && <span className="dsx-sello">{i === resultado.falsa ? '❌ Falsa' : '✓'}</span>}
              {!resultado && v.respuesta === i && <span className="dsx-sello">👉 {nombreDe(v, v.turno).split(' ')[0]}</span>}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function Responder({ v, enviar }) {
  const [marcada, setMarcada] = useState(null);
  return (
    <>
      <Afirmaciones v={v} marcada={marcada} onElegir={setMarcada} />
      <button type="button" className="pzp-boton" disabled={marcada === null} onClick={() => enviar('responder', { indice: marcada })}>
        <Icon name="check" size={20} /> {marcada === null ? 'Señala la mentira' : `La falsa es la ${LETRAS[marcada]}`}
      </button>
    </>
  );
}

/** Online: cada retador decide en su móvil. */
function Desafiar({ v, enviar }) {
  const [marcada, setMarcada] = useState(null);
  const decision = v.yo?.decision;
  if (decision !== null && decision !== undefined) {
    return (
      <>
        <Afirmaciones v={v} marcada={decision === 'acepto' ? null : decision} />
        <p className="dsx-nota">{decision === 'acepto' ? '🤝 Has aceptado su respuesta.' : `⚔️ Has desafiado: crees que la falsa es la ${LETRAS[decision]}.`} Esperando a los demás…</p>
      </>
    );
  }
  return (
    <>
      <Afirmaciones v={v} marcada={marcada} onElegir={setMarcada} bloqueada={v.respuesta === null ? [] : [v.respuesta]} />
      <div className="dsx-botones">
        <button type="button" className="pzp-boton secundario" onClick={() => enviar('desafiar', { indice: null })}>🤝 Acepto</button>
        <button type="button" className="pzp-boton" disabled={marcada === null} onClick={() => enviar('desafiar', { indice: marcada })}>
          ⚔️ {marcada === null ? 'Desafiar' : `Desafiar: la ${LETRAS[marcada]}`}
        </button>
      </div>
      <p className="dsx-nota">Si desafías y aciertas la mentira (y {nombreDe(v, v.turno)} no), ganas {AJUSTES.desafioGanado}. Si {nombreDe(v, v.turno)} tenía razón, pierdes {Math.abs(AJUSTES.desafioPerdido)}.</p>
    </>
  );
}

function Resultado({ v, enviar, puedeSeguir }) {
  const r = v.resultado;
  const textos = { acepta: '🤝 aceptó', gana: '⚔️ ganó el desafío', pierde: '⚔️ perdió el desafío', falla: '⚔️ desafió, pero tampoco era esa' };
  return (
    <>
      <Afirmaciones v={v} resultado={r} />
      <div className="pzp-tarjeta">
        <p className="pzp-etiqueta">{v.respuesta === null ? `${nombreDe(v, v.turno)} no respondió a tiempo` : r.bien ? `✅ ${nombreDe(v, v.turno)} la cazó` : `❌ ${nombreDe(v, v.turno)} se equivocó`}</p>
        <p className="dsx-porque">{r.porque}</p>
        <ul className="dsx-detalle">
          {v.jugadores.filter((j) => !j.fuera).map((j) => (
            <li key={j.id}>
              <Avatar id={j.id} nombre={j.nombre} /> <span>{j.nombre}</span>
              <small>{j.id === v.turno ? `señaló la ${v.respuesta === null ? '—' : LETRAS[v.respuesta]}` : `${textos[r.detalle[j.id]] || '🤝 aceptó'}${typeof v.decisiones?.[j.id] === 'number' ? ` (${LETRAS[v.decisiones[j.id]]})` : ''}`}</small>
              <b className={v.sumas[j.id] < 0 ? 'menos' : ''}>{v.sumas[j.id] ? `${v.sumas[j.id] > 0 ? '+' : ''}${v.sumas[j.id]}` : '0'}</b>
            </li>
          ))}
        </ul>
        <div className="pzp-barra estatica">
          {puedeSeguir ? (
            <>
              <button type="button" className="pzp-boton grande" onClick={() => enviar('siguiente')}>
                <Icon name="play" size={20} /> {v.ronda >= v.rondas ? 'Ver resultado final' : 'Siguiente futbolista'}
              </button>
              {v.ronda < v.rondas && <button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}>Terminar la partida ya</button>}
            </>
          ) : <p className="pzp-esperando">⏳ El anfitrión pasará al siguiente futbolista…</p>}
        </div>
      </div>
    </>
  );
}

export function Partida({ v, enviar, offset = 0, onSalir, local = false, admin = true }) {
  const restante = useRestante(v.hasta, offset);
  const quien = nombreDe(v, v.turno);
  const esTurno = v.yo && v.yo.id === v.turno;
  const titulo = v.fase === 'responder' ? (esTurno ? '¿Cuál es la mentira?' : `${quien} busca la mentira`)
    : v.fase === 'desafiar' ? (esTurno ? 'Los demás deciden…' : '¿Aceptas o desafías?') : 'La verdad';
  return (
    <>
      <Hero v={v} juego={HERO} onSalir={onSalir} chip={`🕵️ ${v.ronda}/${v.rondas}`} etiqueta={`Tres verdades y una mentira sobre…`} titulo={titulo}
        turno={v.fase !== 'resultado' ? v.turno : undefined}
        extra={v.fase === 'desafiar' ? (j) => (j.decidido ? <span className="dsx-listo" aria-label="Ha decidido">✓</span> : null) : undefined} />
      {!local && v.yo && (
        <AvisoTurno id={v.yo.id} emoji={v.fase === 'responder' ? '🕵️' : '⚔️'}
          clave={v.fase === 'responder' && esTurno ? `r${v.ronda}` : v.fase === 'desafiar' && !esTurno && v.yo.decision === null ? `d${v.ronda}` : null}
          texto={v.fase === 'responder' ? '¡Te toca!' : '¿Aceptas o desafías?'}
          sub={v.fase === 'responder' ? `Busca la mentira sobre ${v.futbolista}.` : `${quien} dice que la falsa es la ${v.respuesta === null ? '…' : LETRAS[v.respuesta]}.`} />
      )}
      <div className="pzp-tarjeta dsx-futbolista"><span>⚽</span><strong>{v.futbolista}</strong></div>
      {v.hasta && v.fase !== 'resultado' && <Cuenta ms={restante} total={v.segundos * 1000} />}
      {v.fase === 'responder' && (esTurno ? <Responder key={v.ronda} v={v} enviar={enviar} /> : (
        <>
          <Afirmaciones v={v} />
          <p className="dsx-nota">Piensa cuál es la falsa: cuando {quien} responda, podrás aceptar o desafiar.</p>
        </>
      ))}
      {v.fase === 'desafiar' && (esTurno ? (
        <>
          <Afirmaciones v={v} />
          <p className="dsx-nota">Los demás están decidiendo si te desafían…</p>
        </>
      ) : <Desafiar key={`${v.ronda}-${v.yo?.id}`} v={v} enviar={enviar} />)}
      {v.fase === 'resultado' && <Resultado v={v} enviar={enviar} puedeSeguir={admin} />}
    </>
  );
}

export function PartidaOnline({ v, sala, enviar, offset, onSalir }) {
  return <Partida v={v} enviar={enviar} offset={offset} onSalir={onSalir} admin={sala.esAdmin} />;
}

export function Fin({ v, juego, onSalir, children }) {
  return <PantallaFin v={v} juego={juego} onSalir={onSalir}>{children}</PantallaFin>;
}

export function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Futbolistas">
      <Pildoras opciones={OPCIONES.rondas.map((n) => [n, `${n}`])} valor={config.rondas} onCambiar={onCambiar && ((rondas) => onCambiar({ rondas }))} />
    </BloqueConfig>
  );
}
