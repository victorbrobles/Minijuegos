// client/src/games/Cuentas/Vistas.jsx
// Pantallas de «Lleva la cuenta» con el estilo de los juegos renovados.
// Reciben `v` (vista de un jugador que genera engine.vistaDe) y `enviar(tipo, datos)`.
import { useRegistrarPartida, resultadoDesdeFin } from '../../lib/registros.js';
import React, { useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { ACCIONES, AJUSTES } from './engine.js';
import './Cuentas.css';

export const COLORES = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#9333ea', '#ec4899', '#0d9488', '#ea580c'];
export const colorDe = (id) => COLORES[((Number(id) || 1) - 1) % COLORES.length];
const inicial = (n) => (n || '?').trim().charAt(0).toUpperCase();

export function Avatar({ id, nombre, grande = false }) {
  return <span className={`ctp-avatar${grande ? ' grande' : ''}`} style={{ '--c': colorDe(id) }}>{inicial(nombre)}</span>;
}

const Vidas = ({ n }) => <span className="ctp-vidas" title={`${n} vida${n === 1 ? '' : 's'}`}>{Array.from({ length: AJUSTES.vidas }, (_, k) => (k < n ? '❤️' : '🖤')).join('')}</span>;

function Hero({ v, onSalir, etiqueta, titulo, clase = '' }) {
  const t = v.turno;
  return (
    <header className={`ctp-hero ${clase}`}>
      <span className="ctp-numeros-fondo" aria-hidden="true">1 2 3</span>
      <div className="ctp-hero-top">
        <button type="button" className="ctp-salir" onClick={onSalir}><Icon name="door" size={15} /> Salir</button>
        <div className="ctp-chips">
          <span className="ctp-chip" title="Números que quedan en juego">🔢 Quedan {v.quedan}</span>
        </div>
      </div>
      <p className="ctp-hero-etiqueta">{etiqueta}</p>
      <h1 className="ctp-hero-titulo">{titulo}</h1>
      <div className="ctp-marcador">
        {v.jugadores.map((j) => (
          <span key={j.id} className={`ctp-marca${t?.jugadorId === j.id ? ' turno' : ''}${j.id === v.yo?.id ? ' yo' : ''}${j.eliminado || j.fuera ? ' fuera' : ''}`}>
            <Avatar id={j.id} nombre={j.nombre} />
            <span className="ctp-marca-nombre">{j.nombre}</span>
            {j.terminado ? <b>🏅{j.terminado}º</b> : j.eliminado ? <b>💀</b> : <><Vidas n={j.vidas} /><span className="ctp-marca-datos">🂠{j.nCartas} · 🃏{j.acciones}</span></>}
            {j.congelado && <b>❄️</b>}
          </span>
        ))}
      </div>
    </header>
  );
}

function Tablero({ v }) {
  return (
    <div className="ctp-tarjeta ctp-tablero">
      <p className="ctp-etiqueta">Último número colocado</p>
      <div className="ctp-ultimo-num">{v.ultimo || '—'}</div>
      {v.tablero.length > 0 && (
        <div className="ctp-secuencia">
          {v.tablero.map((t, k) => <span key={k} className={t.ok ? 'ok' : 'mal'} title={t.ok ? 'Bien colocado' : 'Fallo'}>{t.n}</span>)}
        </div>
      )}
      <p className="ctp-pista">Hay que colocar los números en orden ascendente, sin hablar. El siguiente es el más bajo que quede en alguna mano.</p>
    </div>
  );
}

export function PantallaJuego({ v, enviar, onSalir, admin = null }) {
  const [elegido, setElegido] = useState(null);
  const t = v.turno;
  const miTurno = Boolean(t && v.yo) && t.jugadorId === v.yo.id;
  const yo = v.jugadores.find((j) => j.id === v.yo.id);
  const quien = v.jugadores.find((j) => j.id === t?.jugadorId);
  const fuera = yo?.eliminado || yo?.terminado;
  const ultimoLog = v.log[v.log.length - 1];

  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta={fuera ? (yo.eliminado ? 'Estás eliminado' : `Terminaste en el puesto ${yo.terminado}`) : miTurno ? 'Tu turno' : 'Esperando'}
        titulo={miTurno ? '¿Sueltas, actúas o pasas?' : `Juega ${quien?.nombre ?? '…'}`} clase={miTurno ? 'mio' : ''} />

      {ultimoLog && <div className={`ctp-aviso ${ultimoLog.tipo || ''}`}>{ultimoLog.texto}</div>}

      <Tablero v={v} />

      {!fuera && (
        <div className="ctp-tarjeta">
          <p className="ctp-etiqueta">Tus números · <Vidas n={v.yo.vidas} />{v.yo.escudo ? ' · 🛡️ escudo activo' : ''}</p>
          <div className="ctp-mano">
            {v.yo.mano.map((n, k) => (
              <button key={n} type="button" className={`ctp-num${k === 0 ? ' bajo' : ''}${elegido === n ? ' sel' : ''}`} disabled={!miTurno} onClick={() => setElegido(elegido === n ? null : n)}>
                {n}
              </button>
            ))}
          </div>
          {miTurno && (
            <div className="ctp-acciones">
              <button type="button" className="ctp-boton grande" disabled={elegido == null} onClick={() => { enviar('soltar', { numero: elegido }); setElegido(null); }}>
                {elegido == null ? 'Elige un número para soltarlo' : `⬇️ Soltar el ${elegido}`}
              </button>
              <div className="ctp-dos">
                <button type="button" className="ctp-boton accion" disabled={v.yo.acciones <= 0} onClick={() => enviar('accion')}>
                  🃏 Carta de acción ({v.yo.acciones})
                </button>
                <button type="button" className="ctp-boton secundario" onClick={() => enviar('pasar')}>⏭️ Pasar</button>
              </div>
              <p className="ctp-pista">Soltar uno que no toca: −1 vida (vuelve a tu mano). La carta de acción no gasta tu turno. Pasar dos turnos seguidos teniendo tú el número que tocaba: −1 vida.</p>
            </div>
          )}
        </div>
      )}

      {v.yo?.privado?.length > 0 && (
        <div className="ctp-tarjeta">
          <p className="ctp-etiqueta">🤫 Solo para ti (tus cartas de acción)</p>
          <div className="ctp-privado">{[...v.yo.privado].reverse().map((p) => <p key={p.n}>{p.texto}</p>)}</div>
        </div>
      )}

      <details className="ctp-detalle">
        <summary>📖 Lo que ha pasado</summary>
        <div className="ctp-log">{[...v.log].reverse().map((l) => <p key={l.n} className={l.tipo || ''}>{l.texto}</p>)}</div>
      </details>

      {admin?.esAdmin && !miTurno && admin.desconectados?.includes(t?.jugadorId) && (
        <div className="ctp-barra estatica">
          <button type="button" className="ctp-enlace" onClick={admin.onForzar}><Icon name="forward" size={15} /> ¿No responde? Pasar el turno de {quien?.nombre}</button>
        </div>
      )}
    </>
  );
}

export function PantallaFin({ v, onSalir, children }) {
  useRegistrarPartida('cuentas', resultadoDesdeFin(v));
  const f = v.fin;
  const g = v.jugadores.find((j) => j.id === f.ganadorId);
  return (
    <>
      <Hero v={v} onSalir={onSalir} etiqueta="Fin de la partida" titulo={`¡Gana ${g?.nombre ?? '—'}!`} clase="fin" />
      <Tablero v={v} />
      <div className="ctp-tarjeta">
        <p className="ctp-etiqueta">Clasificación</p>
        <ol className="ctp-ranking">
          {f.tabla.map((x) => {
            const j = v.jugadores.find((q) => q.id === x.id);
            return (
              <li key={x.id} className={x.puesto === 1 ? 'lider' : ''}>
                <span className="ctp-pos">{x.eliminado || x.fuera ? '💀' : x.puesto}</span>
                <Avatar id={x.id} nombre={x.nombre} />
                <span className="ctp-ranking-nombre">{x.nombre}{x.id === v.yo?.id ? ' (tú)' : ''}
                  <small>{x.eliminado ? 'eliminado' : x.fuera ? 'abandonó' : x.cartas ? `le quedaron: ${j?.mano?.join(', ')}` : 'sin cartas'}</small>
                </span>
                <strong>{x.puntos ? `+${x.puntos}` : ''}</strong>
              </li>
            );
          })}
        </ol>
      </div>
      {children}
    </>
  );
}

export function Ayuda({ onCerrar, titulo, descripcion }) {
  return (
    <div className="rg-modal-fondo" onClick={onCerrar}>
      <div className="rg-modal qq-modal-ayuda" onClick={(e) => e.stopPropagation()}>
        <div className="qq-modal-ayuda-header">
          <span className="qq-ayuda-badge">❓ Cómo jugar</span>
          <h3>{titulo}</h3>
        </div>
        <div className="qq-modal-ayuda-body">
          {descripcion && <p>{descripcion}</p>}
          <p className="ctp-ayuda-sub">🎯 Objetivo</p>
          <ul>
            <li>Cada uno recibe unos números del 1 al {AJUSTES.maxNumero} (secretos). Entre todos hay que colocarlos en <strong>orden ascendente, sin hablar</strong>.</li>
            <li>Gana quien se queda antes sin números. Puntos de la sala: {AJUSTES.puntos.join(', ')} para los tres primeros.</li>
          </ul>
          <p className="ctp-ayuda-sub">🔁 Tu turno</p>
          <ul>
            <li><strong>Soltar un número.</strong> Si no era el que tocaba (había uno más bajo en alguna mano), pierdes una vida y el número vuelve a tu mano.</li>
            <li><strong>Usar una carta de acción</strong> (tienes {AJUSTES.accionesPorJugador} en toda la partida): sale una al azar, se resuelve y <strong>sigues en tu turno</strong>.</li>
            <li><strong>Pasar.</strong> Pero si pasas dos turnos seguidos teniendo tú el número que tocaba, pierdes una vida.</li>
          </ul>
          <p>Tienes {AJUSTES.vidas} vidas: al perderlas quedas eliminado y tus números salen del juego.</p>
          <p className="ctp-ayuda-sub">🃏 Cartas de acción (al azar)</p>
          <ul>{Object.values(ACCIONES).map((a) => <li key={a.nombre}>{a.e} <strong>{a.nombre}</strong>{a.tipo === 'mala' ? ' (mala suerte)' : ''}: {a.desc}</li>)}</ul>
        </div>
        <button type="button" className="big full qq-btn-principal" onClick={onCerrar}>¡Entendido!</button>
      </div>
    </div>
  );
}
