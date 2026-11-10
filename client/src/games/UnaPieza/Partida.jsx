// client/src/games/UnaPieza/Partida.jsx
// Pantallas de «Una Pieza Más» (online y en un dispositivo) con las piezas comunes de ../Pulsador.
import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { Hero, Cuenta, useRestante, Avatar, Pildoras, PantallaFin, colorDe } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { AJUSTES, OPCIONES, PIEZAS, celdasDe, colocadas, nombreLinea } from './engine.js';
import './UnaPieza.css';

const HERO = { emoji: '🧩' };
const nombreDe = (v, id) => v.jugadores.find((j) => j.id === id)?.nombre ?? '¿?';
const enLinea = (l, f, k) => (l ? (l[0] === 'f' ? f === Number(l.slice(1)) : k === Number(l.slice(1))) : false);

/** Una pieza pequeñita para la mano. */
function Mini({ tipo, rot = 0, espejo = false }) {
  const c = celdasDe(tipo, rot, espejo);
  const alto = Math.max(...c.map((x) => x[0])) + 1;
  const ancho = Math.max(...c.map((x) => x[1])) + 1;
  const set = new Set(c.map(([f, k]) => `${f},${k}`));
  return (
    <span className="upz-mini" style={{ gridTemplateColumns: `repeat(${ancho}, 1fr)`, aspectRatio: `${ancho} / ${alto}` }}>
      {Array.from({ length: alto * ancho }, (_, i) => <i key={i} className={set.has(`${Math.floor(i / ancho)},${i % ancho}`) ? 'on' : ''} />)}
    </span>
  );
}

function Tablero({ v, fantasma, valido, onTocar, objetivo }) {
  const ultimas = new Set((v.ultimo?.celdas || []).map(([f, k]) => `${f},${k}`));
  const sombra = new Set((fantasma || []).map(([f, k]) => `${f},${k}`));
  return (
    <div className="upz-tablero" role="grid" aria-label={`Figura: ${v.figura.nombre}`}>
      {v.tablero.map((fila, f) => fila.map((x, k) => {
        const clave = `${f},${k}`;
        const fuera = x === null;
        const cl = ['upz-celda', fuera ? 'fuera' : x === 0 ? 'libre' : 'llena'];
        if (ultimas.has(clave)) cl.push('ultima');
        if (sombra.has(clave)) cl.push(valido ? 'sombra' : 'sombra mal');
        if (!fuera && enLinea(objetivo, f, k)) cl.push('objetivo');
        return (
          <button key={clave} type="button" role="gridcell" className={cl.join(' ')} disabled={!onTocar}
            style={x ? { '--c': colorDe(x) } : undefined} onClick={() => onTocar?.(f, k)} aria-label={fuera ? 'Fuera' : x === 0 ? `Libre ${f + 1}-${k + 1}` : `De ${nombreDe(v, x)}`} />
        );
      }))}
    </div>
  );
}

function Mano({ v, sel, setSel, rot, espejo, deshabilitada }) {
  return (
    <div className="upz-mano">
      {v.yo.mano.map((t, i) => (
        <button key={`${i}-${t}`} type="button" disabled={deshabilitada}
          className={`upz-pieza${sel === i ? ' sel' : ''}${v.yo.cabe[i] ? '' : ' nocabe'}`} onClick={() => setSel(sel === i ? null : i)}>
          <Mini tipo={t} rot={sel === i ? rot : 0} espejo={sel === i ? espejo : false} />
          <span>{PIEZAS[t].nombre} · {PIEZAS[t].celdas.length}</span>
          {!v.yo.cabe[i] && <em>no cabe</em>}
        </button>
      ))}
    </div>
  );
}

function Objetivo({ v, local }) {
  const [ver, setVer] = useState(!local);
  useEffect(() => { setVer(!local); }, [v.turno, v.ronda, local]);
  const o = v.yo?.objetivo;
  if (!o) return null;
  return (
    <div className={`upz-objetivo${o.hecho ? ' hecho' : ''}`}>
      🎯 {ver ? <>Objetivo secreto: cierra tú <b>{nombreLinea(o.linea)}</b> (+{AJUSTES.ptsObjetivo}){o.hecho ? ' ✅' : ''}</>
        : <button type="button" className="pzp-enlace oscuro" onClick={() => setVer(true)}>Ver mi objetivo secreto (que no miren)</button>}
    </div>
  );
}

function MiTurno({ v, enviar, local }) {
  const [sel, setSel] = useState(null);
  const [rot, setRot] = useState(0);
  const [espejo, setEspejo] = useState(false);
  const [ancla, setAncla] = useState(null);
  const [verObj, setVerObj] = useState(!local);
  useEffect(() => { setSel(null); setAncla(null); setRot(0); setEspejo(false); setVerObj(!local); }, [v.turno, v.ronda, local]);
  const atascado = !v.yo.cabe.some(Boolean);
  const suelta = sel === -1;
  const tipo = suelta ? 'P1' : sel !== null ? v.yo.mano[sel] : null;
  const fantasma = useMemo(() => (tipo && ancla ? colocadas(tipo, rot, espejo, ancla[0], ancla[1]) : null), [tipo, ancla, rot, espejo]);
  const valido = fantasma ? fantasma.every(([f, k]) => v.tablero[f]?.[k] === 0) : false;
  const colocar = () => {
    enviar('colocar', { pieza: sel, rot, espejo, fila: ancla[0], col: ancla[1] });
    setSel(null); setAncla(null); setRot(0); setEspejo(false);
  };
  return (
    <>
      <Tablero v={v} fantasma={fantasma} valido={valido} onTocar={tipo ? (f, k) => setAncla([f, k]) : null} objetivo={verObj ? v.yo.objetivo?.linea : null} />
      <p className="upz-ayuda">
        {atascado ? 'No te cabe ninguna pieza: rellena una casilla suelta o pasa y cambia una pieza.'
          : tipo ? (ancla ? (valido ? 'Pulsa «Colocar» o toca otra casilla para moverla.' : 'Ahí no cabe: tiene que ir entera dentro de los huecos libres.') : 'Toca una casilla libre: ahí irá la primera celda de la pieza.')
            : 'Elige una pieza de tu mano.'}
      </p>
      <Mano v={v} sel={sel} setSel={(i) => { setSel(i); setRot(0); setEspejo(false); }} rot={rot} espejo={espejo} />
      <div className="upz-acciones">
        <button type="button" className="pzp-boton secundario" disabled={sel === null || suelta} onClick={() => setRot((r) => (r + 1) % 4)}>⟳ Girar</button>
        <button type="button" className="pzp-boton secundario" disabled={sel === null || suelta} onClick={() => setEspejo((e) => !e)}>⇋ Voltear</button>
        <button type="button" className="pzp-boton" disabled={!fantasma || !valido} onClick={colocar}><Icon name="check" size={18} /> Colocar</button>
      </div>
      <div className="upz-acciones secundarias">
        {atascado && <button type="button" className={`pzp-enlace oscuro${suelta ? ' activo' : ''}`} onClick={() => { setSel(suelta ? null : -1); setAncla(null); }}>▪️ Rellenar una casilla suelta</button>}
        <button type="button" className="pzp-enlace oscuro" onClick={() => enviar('pasar', { cambiar: sel !== null && sel >= 0 ? sel : null })}>
          {sel !== null && sel >= 0 ? '🔄 Pasar y cambiar esta pieza' : '⏭️ Pasar'}
        </button>
      </div>
      {local && <ObjetivoLocal v={v} ver={verObj} onVer={() => setVerObj(true)} />}
    </>
  );
}

function ObjetivoLocal({ v, ver, onVer }) {
  const o = v.yo?.objetivo;
  if (!o) return null;
  return (
    <div className={`upz-objetivo${o.hecho ? ' hecho' : ''}`}>
      🎯 {ver ? <>Objetivo secreto: cierra tú <b>{nombreLinea(o.linea)}</b> (+{AJUSTES.ptsObjetivo}){o.hecho ? ' ✅' : ''}</>
        : <button type="button" className="pzp-enlace oscuro" onClick={onVer}>Ver mi objetivo secreto (que no miren)</button>}
    </div>
  );
}

function Registro({ v }) {
  if (!v.registro.length) return null;
  return (
    <ul className="upz-registro">
      {v.registro.slice(0, 3).map((r, i) => (
        <li key={i}><b style={{ color: colorDe(r.id) }}>{nombreDe(v, r.id)}</b> {r.tipo ? `coloca ${PIEZAS[r.tipo].nombre.toLowerCase()}: +${r.puntos} (${r.detalle})` : r.detalle}</li>
      ))}
    </ul>
  );
}

function Resultado({ v, enviar, puedeSeguir }) {
  return (
    <div className="pzp-tarjeta">
      <p className="pzp-etiqueta">{v.motivo === 'completa' ? `¡${v.figura.nombre} completa!` : 'La figura se ha quedado atascada'}</p>
      <div className="upz-sumas">
        {v.jugadores.filter((j) => !j.fuera).sort((a, b) => (v.sumas[b.id] || 0) - (v.sumas[a.id] || 0)).map((j) => {
          const o = v.objetivos?.[j.id];
          return (
            <div key={j.id}>
              <Avatar id={j.id} nombre={j.nombre} /> <span>{j.nombre}</span> <b>+{v.sumas[j.id] || 0}</b>
              {o && <small>{o.hecho ? '✅' : '❌'} {nombreLinea(o.linea)}</small>}
            </div>
          );
        })}
      </div>
      <div className="pzp-barra estatica">
        {puedeSeguir ? (
          <>
            <button type="button" className="pzp-boton grande" onClick={() => enviar('siguiente')}>
              <Icon name="play" size={20} /> {v.ronda >= v.rondas ? 'Ver resultado final' : 'Siguiente figura'}
            </button>
            {v.ronda < v.rondas && <button type="button" className="pzp-enlace" onClick={() => enviar('terminar')}>Terminar la partida ya</button>}
          </>
        ) : <p className="pzp-esperando">⏳ El anfitrión pasará a la siguiente figura…</p>}
      </div>
    </div>
  );
}

/** Partida (todo salvo el final). */
export function Partida({ v, enviar, offset = 0, onSalir, local = false, admin = true }) {
  const restante = useRestante(v.hasta, offset);
  const miTurno = v.fase === 'jugando' && v.yo && v.turno === v.yo.id;
  const titulo = v.fase !== 'jugando' ? `${v.figura.e} ${v.figura.nombre}` : miTurno ? (local ? `Turno de ${nombreDe(v, v.turno)}` : '¡Te toca!') : `Turno de ${nombreDe(v, v.turno)}`;
  return (
    <>
      <Hero v={v} juego={HERO} onSalir={onSalir} chip={`🧩 Figura ${v.ronda}/${v.rondas}`} etiqueta={`${v.figura.e} ${v.figura.nombre} · ${v.huecos} huecos`} titulo={titulo}
        turno={v.fase === 'jugando' ? v.turno : undefined} />
      {v.fase === 'jugando' && !local && v.hasta && <Cuenta ms={restante} total={v.segundos * 1000} />}
      {v.fase === 'jugando' && miTurno && <MiTurno key={`${v.ronda}-${v.turno}`} v={v} enviar={enviar} local={local} />}
      {v.fase === 'jugando' && !miTurno && (
        <>
          <Tablero v={v} />
          {v.yo && (
            <>
              <p className="upz-ayuda">Tus piezas (puedes ir pensando dónde ponerlas):</p>
              <Mano v={v} sel={null} setSel={() => {}} deshabilitada />
              <Objetivo v={v} local={local} />
            </>
          )}
        </>
      )}
      {v.fase === 'jugando' && <Registro v={v} />}
      {v.fase === 'resultado' && (
        <>
          <Tablero v={v} />
          <Resultado v={v} enviar={enviar} puedeSeguir={admin} />
        </>
      )}
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
    <>
      <BloqueConfig titulo="Figuras">
        <Pildoras opciones={OPCIONES.rondas.map((n) => [n, `${n} figuras`])} valor={config.rondas} onCambiar={onCambiar && ((rondas) => onCambiar({ rondas }))} />
      </BloqueConfig>
      <BloqueConfig titulo="Tiempo por turno (online)">
        <Pildoras opciones={OPCIONES.segundos.map((n) => [n, `${n} s`])} valor={config.segundos} onCambiar={onCambiar && ((segundos) => onCambiar({ segundos }))} />
      </BloqueConfig>
    </>
  );
}
