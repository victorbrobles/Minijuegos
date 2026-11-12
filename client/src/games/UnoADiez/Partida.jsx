// client/src/games/UnoADiez/Partida.jsx
// Pantallas de «Del 1 al 10...» (online y en un dispositivo) con las piezas comunes de ../Pulsador.
import React, { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Hero, TurnoDe, Cuenta, useRestante, Avatar, Pildoras } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { AJUSTES, OPCIONES_VUELTAS } from './engine.js';

const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';
const JUEGO_HERO = { emoji: '🔢' };

function Pistas({ v }) {
  if (!v.pistas.length) return null;
  return (
    <div className="pzp-tarjeta">
      <p className="pzp-etiqueta">Pistas de este turno ({v.pistas.length}/{v.maxPistas})</p>
      <ul className="pzp-lista-pistas">
        {v.pistas.map((x, i) => (
          <li key={i}>
            <Avatar id={x.pistador} nombre={nombreDe(v, x.pistador)} />
            <div><small>{nombreDe(v, x.pistador)} · {x.categoria}</small><strong>{x.texto ? `«${x.texto}»` : 'La dijo en voz alta'}</strong></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** El número y la categoría (para quien da la pista o mira). */
function Secreto({ v, children }) {
  return (
    <div className="pzp-tarjeta pzp-centro">
      <p className="pzp-etiqueta centrada">El número secreto es</p>
      <div className="pzp-secreto">{v.numero}</div>
      <p className="pzp-etiqueta centrada" style={{ marginTop: '0.6rem' }}>Categoría</p>
      <p className="pzp-categoria">{v.categoria}</p>
      <p className="pzp-escala"><span>1 = lo que menos te gusta</span><span>10 = lo que más</span></p>
      {children}
    </div>
  );
}

function FormPista({ v, enviar, restante }) {
  const [texto, setTexto] = useState('');
  return (
    <Secreto v={v}>
      <form className="pzp-form" style={{ marginTop: '0.8rem', border: 'none', padding: 0 }} onSubmit={(e) => { e.preventDefault(); if (texto.trim()) enviar('pista', { texto: texto.trim() }); }}>
        <Cuenta ms={restante} total={AJUSTES.segPista * 1000} />
        <input className="pzp-input" value={texto} maxLength={80} onChange={(e) => setTexto(e.target.value)} placeholder={`Un ejemplo de «${v.categoria}» que sea un ${v.numero}`} autoComplete="off" />
        <button type="submit" className="pzp-boton" disabled={!texto.trim()}><Icon name="check" size={20} /> Enviar mi ejemplo</button>
      </form>
    </Secreto>
  );
}

function Adivinar({ v, enviar, restante, local }) {
  const [num, setNum] = useState(null);
  const quedan = v.pistas.length < v.maxPistas;
  return (
    <div className="pzp-tarjeta">
      <p className="pzp-etiqueta">¿Qué número es? · {v.pistas.length} {v.pistas.length === 1 ? 'pista' : 'pistas'}</p>
      {!local && <Cuenta ms={restante} total={AJUSTES.segAdivinar * 1000} />}
      <div className="pzp-numeros" style={{ marginTop: '0.6rem' }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button key={n} type="button" className={`pzp-num${num === n ? ' activo' : ''}`} onClick={() => setNum(n)}>{n}</button>
        ))}
      </div>
      <div className="pzp-dos" style={{ marginTop: '0.8rem' }}>
        <button type="button" className="pzp-boton secundario" disabled={!quedan} onClick={() => enviar('otra')}>{quedan ? 'Otra pista (+1)' : 'Sin más pistas'}</button>
        <button type="button" className="pzp-boton" disabled={!num} onClick={() => enviar('adivinar', { numero: num })}><Icon name="check" size={18} /> Es el {num ?? '…'}</button>
      </div>
      <p className="pzp-nota" style={{ marginTop: '0.5rem' }}>Exacto: tantos puntos como pistas. A uno de distancia: +1. Más lejos: +10. ¡Menos es mejor!</p>
    </div>
  );
}

function Resultado({ v }) {
  const r = v.resultado;
  const exacto = r.diferencia === 0;
  return (
    <div className="pzp-tarjeta pzp-centro">
      <p className="pzp-etiqueta centrada">Era el</p>
      <div className="pzp-secreto">{r.numero}</div>
      <h2 className="pzp-solucion-titulo" style={{ marginTop: '0.4rem' }}>
        {r.dijo == null ? 'No dijo ningún número' : exacto ? '¡Clavado!' : r.diferencia === 1 ? `Dijo ${r.dijo}: ¡casi!` : `Dijo ${r.dijo}`}
      </h2>
      <p className="pzp-mensaje bien" style={!exacto ? { background: r.diferencia === 1 ? '#fef3c7' : '#fee2e2', color: r.diferencia === 1 ? '#92400e' : '#991b1b' } : undefined}>
        +{r.puntos} para {nombreDe(v, r.adivinador)} ({r.pistas} {r.pistas === 1 ? 'pista' : 'pistas'}{exacto ? '' : r.diferencia === 1 ? ' + 1' : ' + 10'})
      </p>
    </div>
  );
}

/**
 * Partida (todo salvo el final). Online: `v.yo`. Local: el móvil se pasa; `pasado` dice si ya lo tiene la persona
 * que toca (el que da la pista o el que adivina) para que el otro no vea el número.
 */
export function Partida({ v, enviar, offset = 0, onSalir, local = false, puedeSeguir = true }) {
  const restante = useRestante(v.hasta, offset);
  const [pasado, setPasado] = useState(null);
  const yo = v.yo?.id;
  const clave = `${v.turnoN}-${v.fase}-${v.pistas.length}-${v.pistador}`;
  const listoLocal = pasado === clave;
  const hero = (
    <Hero v={v} juego={JUEGO_HERO} onSalir={onSalir} chip={`🔢 Turno ${v.turnoN}/${v.turnos}`} orden="asc"
      etiqueta={v.fase === 'resultado' ? 'Resultado' : `Adivina ${v.adivinador === yo ? 'tú' : nombreDe(v, v.adivinador)}`}
      titulo={v.fase === 'resultado' ? '¿Lo ha clavado?' : v.fase === 'pista' ? 'Toca dar pista' : '¿Qué número es?'}
      turno={v.fase === 'pista' ? v.pistador : v.adivinador} />
  );

  let cuerpo;
  if (v.fase === 'resultado') {
    cuerpo = (
      <>
        <Resultado v={v} />
        <Pistas v={v} />
        <div className="pzp-barra estatica">
          {puedeSeguir ? <button type="button" className="pzp-boton grande" onClick={() => enviar('siguiente')}><Icon name="play" size={20} /> Siguiente turno</button>
            : <p className="pzp-esperando">⏳ Esperando a que se pase al siguiente turno…</p>}
        </div>
      </>
    );
  } else if (v.fase === 'pista') {
    if (local) {
      cuerpo = !listoLocal ? (
        <TurnoDe local v={v} id={v.pistador} puedo onListo={() => setPasado(clave)} boton={`Soy ${nombreDe(v, v.pistador)}: ver el número`}
          texto={`Pásale el móvil a ${nombreDe(v, v.pistador)}. ¡Que ${nombreDe(v, v.adivinador)} no mire!`} />
      ) : (
        <Secreto v={v}>
          <p className="pzp-texto">Di en voz alta un ejemplo de esta categoría que para ti sea un <strong>{v.numero}</strong>.</p>
          <button type="button" className="pzp-boton" onClick={() => enviar('pista')}><Icon name="check" size={20} /> Ya lo he dicho</button>
        </Secreto>
      );
    } else if (v.pistador === yo) {
      cuerpo = <FormPista v={v} enviar={enviar} restante={restante} />;
    } else if (v.adivinador === yo) {
      cuerpo = (
        <div className="pzp-tarjeta pzp-centro">
          <p className="pzp-etiqueta centrada">Categoría</p>
          <p className="pzp-categoria">{v.categoria}</p>
          <p className="pzp-esperando-txt">✍️ {nombreDe(v, v.pistador)} está pensando un ejemplo…</p>
          <Cuenta ms={restante} total={AJUSTES.segPista * 1000} />
        </div>
      );
    } else {
      cuerpo = <Secreto v={v}><p className="pzp-esperando-txt">✍️ {nombreDe(v, v.pistador)} está pensando un ejemplo…</p></Secreto>;
    }
    cuerpo = <>{cuerpo}<Pistas v={v} /></>;
  } else {
    if (local && !listoLocal) {
      cuerpo = <TurnoDe local v={v} id={v.adivinador} puedo onListo={() => setPasado(clave)} boton="Ver las pistas y adivinar" texto={`Pásale el móvil a ${nombreDe(v, v.adivinador)}.`} />;
    } else if (local || v.adivinador === yo) {
      cuerpo = <><Pistas v={v} /><Adivinar key={v.pistas.length} v={v} enviar={enviar} restante={restante} local={local} /></>;
    } else {
      cuerpo = (
        <>
          <Pistas v={v} />
          <div className="pzp-tarjeta pzp-centro">
            <p className="pzp-etiqueta centrada">El número es el {v.numero}</p>
            <p className="pzp-esperando-txt">🤔 {nombreDe(v, v.adivinador)} está decidiendo…</p>
            <Cuenta ms={restante} total={AJUSTES.segAdivinar * 1000} />
          </div>
        </>
      );
    }
  }
  return <>{hero}{cuerpo}</>;
}

export function Config({ config, onCambiar }) {
  return (
    <BloqueConfig titulo="Veces que adivina cada uno">
      <Pildoras opciones={OPCIONES_VUELTAS.map((n) => [n, n === 1 ? '1 vez' : `${n} veces`])} valor={config.vueltas} onCambiar={onCambiar && ((vueltas) => onCambiar({ vueltas }))} />
    </BloqueConfig>
  );
}

export function PartidaOnline({ v, sala, enviar, offset, onSalir }) {
  return (
    <>
      <Partida v={v} enviar={enviar} offset={offset} onSalir={onSalir} puedeSeguir={sala.esAdmin || v.adivinador === sala.yoId} />
      {sala.esAdmin && v.fase === 'resultado' && (
        <div className="pzp-barra estatica">
          <button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}><Icon name="flagFinish" size={15} /> Terminar la partida ya</button>
        </div>
      )}
    </>
  );
}
