// client/src/games/Lobos/Escena.jsx
// Piezas visuales comunes de la partida de «Luna de Sangre» (modo local y online):
// cabecera de noche/día, la aldea con todos los vecinos y la pantalla de «pasa el móvil».
import React from 'react';
import Icon from '../../components/Icon.jsx';
import { ROLES, BANDOS } from './roles.js';

export const inicial = (n = '?') => String(n).trim().charAt(0).toUpperCase() || '?';

// Color estable por jugador (según su asiento)
const COLORES = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#64748b', '#84cc16', '#6366f1', '#06b6d4', '#e11d48', '#0ea5e9'];
export const colorJugador = (id) => COLORES[Math.abs(Number(id) || 0) % COLORES.length];

function BotonSalir({ onClick }) {
  return (
    <button type="button" className="lbp-salir" onClick={onClick}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>Portada</span>
    </button>
  );
}

/**
 * Cabecera de la partida.
 * momento: 'noche' | 'dia' | 'fin'  ·  vivos/total: contador de la aldea
 */
export function CabeceraLobos({ momento = 'dia', etiqueta, titulo, vivos, total, onSalir, onMiRol, chips = [], children }) {
  return (
    <header className={`lbp-hero ${momento}`}>
      <span className="lbp-astro" aria-hidden="true">
        {momento === 'noche' ? <Icon name="moon" size={120} strokeWidth={1.2} /> : <Icon name="sun" size={130} strokeWidth={1.2} />}
      </span>
      {momento === 'noche' && <span className="lbp-estrellas" aria-hidden="true" />}
      <div className="lbp-hero-top">
        {onSalir ? <BotonSalir onClick={onSalir} /> : <span />}
        <div className="lbp-chips">
          {vivos != null && <span className="lbp-chip"><Icon name="users" size={14} /> {vivos}{total ? `/${total}` : ''} vivos</span>}
          {chips.filter(Boolean).map((c, i) => <span key={i} className="lbp-chip">{c}</span>)}
        </div>
      </div>
      <div className="lbp-hero-fila">
        <div>
          {etiqueta && <p className="lbp-hero-etiqueta">{etiqueta}</p>}
          {titulo && <h2 className="lbp-hero-titulo">{titulo}</h2>}
        </div>
        {onMiRol && (
          <button type="button" className="lbp-mirol" onClick={onMiRol}>
            <Icon name="eye" size={14} /> Mi rol
          </button>
        )}
      </div>
      {children}
    </header>
  );
}

/**
 * La aldea: todos los vecinos con su estado.
 * jugadores: [{ id, nombre, vivo, rolRevelado?, yo?, anfitrion?, bot?, conectado? }]
 */
export function Aldea({ jugadores, titulo = 'La aldea', compacta = false }) {
  const vivos = jugadores.filter((j) => j.vivo !== false).length;
  return (
    <div className={`lbp-tarjeta lbp-aldea${compacta ? ' compacta' : ''}`}>
      <p className="lbp-etiqueta">
        <Icon name="home" size={14} /> {titulo} · {vivos} {vivos === 1 ? 'superviviente' : 'supervivientes'}
      </p>
      <ul className="lbp-vecinos">
        {jugadores.map((j) => {
          const muerto = j.vivo === false;
          const rol = muerto && j.rolRevelado ? ROLES[j.rolRevelado] : null;
          return (
            <li
              key={j.id}
              className={`lbp-vecino${muerto ? ' muerto' : ''}${j.yo ? ' yo' : ''}`}
              style={{ '--c': colorJugador(j.id), '--rol': rol ? BANDOS[rol.bando].color : undefined }}
            >
              <span className="lbp-vecino-avatar">
                {muerto ? (rol ? <Icon name={rol.icono} size={18} /> : '✝') : inicial(j.nombre)}
                {j.conectado === false && !muerto && <i className="lbp-desconectado" title="Sin conexión" />}
              </span>
              <span className="lbp-vecino-nombre">
                {j.nombre}{j.yo ? ' (tú)' : ''}{j.anfitrion ? ' 👑' : ''}{j.bot ? ' 🤖' : ''}
              </span>
              {muerto && <span className="lbp-vecino-rol">{rol ? rol.nombre : 'Eliminado'}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Pantalla «Pasa el móvil a…» (modo local). */
export function PasaDispositivo({ id, nombre, etiqueta = 'Pasa el móvil a', emoji, texto, children }) {
  return (
    <div className="lbp-tarjeta lbp-pasa">
      <span className="lbp-pasa-avatar" style={{ '--c': colorJugador(id) }}>{emoji || inicial(nombre)}</span>
      <p className="lbp-etiqueta centrada">{etiqueta}</p>
      <h2 className="lbp-pasa-nombre">{nombre}</h2>
      {texto && <p className="lbp-texto">{texto}</p>}
      {children && <div className="lbp-pasa-botones">{children}</div>}
    </div>
  );
}

/** Modal de confirmación de salida. */
export function ModalSalirLobos({ titulo = '¿Salir de la partida?', texto, onSeguir, onSalir, textoSalir = 'Salir' }) {
  return (
    <div className="rg-modal-fondo" onClick={onSeguir}>
      <div className="rg-modal lbp-modal" onClick={(ev) => ev.stopPropagation()}>
        <div className="lbp-modal-icono">🚪</div>
        <h3>{titulo}</h3>
        <p className="hint">{texto}</p>
        <div className="lbp-fila">
          <button type="button" className="lbp-boton secundario" onClick={onSeguir}>Seguir</button>
          <button type="button" className="lbp-boton peligro" onClick={onSalir}>{textoSalir}</button>
        </div>
      </div>
    </div>
  );
}

/** Títulos e iconos del final según el bando ganador. */
export const FINAL = {
  lobos: { titulo: 'Ganan los Lobos', icono: 'paw', emoji: '🐺' },
  pueblo: { titulo: 'Gana el Pueblo', icono: 'home', emoji: '🏡' },
  solitario: { titulo: 'Gana el Solitario', icono: 'flame', emoji: '🔥' },
  amantes: { titulo: 'Ganan los Enamorados', icono: 'heart', emoji: '💘' },
  epidemia: { titulo: 'Gana la Epidemia', icono: 'flask', emoji: '🦠' },
  nadie: { titulo: 'Nadie gana', icono: 'skull', emoji: '💀' }
};
