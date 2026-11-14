// client/src/components/Perfil.jsx
// Avatar de un jugador (emoji sobre su color; si no ha elegido, su inicial) y ventana para elegir el tuyo.
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { usePerfiles, cargarOpciones, guardarPerfil } from '../lib/perfil.js';
import { partirNombre } from '../lib/identidad.js';
import './Perfil.css';

export function AvatarJugador({ nombre, tam = 28, perfil: dado }) {
  const p = usePerfiles(dado === undefined ? [nombre] : [])[nombre];
  const per = dado === undefined ? p : dado;
  const ini = (partirNombre(nombre).nombre || '?').charAt(0).toUpperCase();
  return (
    <span className="pf-avatar" style={{ '--c': per?.color || '#94a3b8', width: tam, height: tam, fontSize: tam * (per ? 0.58 : 0.46) }} aria-hidden="true">
      {per?.avatar || ini}
    </span>
  );
}

/** Enlace al perfil público de un jugador, con su avatar. */
export function EnlacePerfil({ nombre, children, tam = 22 }) {
  if (!nombre?.includes('#')) return children;
  return (
    <Link to={`/jugador/${encodeURIComponent(nombre)}`} className="pf-enlace" onClick={(e) => e.stopPropagation()}>
      <AvatarJugador nombre={nombre} tam={tam} />{children}
    </Link>
  );
}

export function EditarPerfil({ jugador, onCerrar }) {
  const actual = usePerfiles([jugador])[jugador];
  const [ops, setOps] = useState(null);
  const [avatar, setAvatar] = useState(actual?.avatar || null);
  const [color, setColor] = useState(actual?.color || null);
  const [error, setError] = useState('');
  useEffect(() => { cargarOpciones().then((o) => { setOps(o); setAvatar((a) => a || o.avatares[0]); setColor((c) => c || o.colores[7]); }).catch(() => setError('Sin conexión.')); }, []);
  const guardar = async () => { try { await guardarPerfil(jugador, avatar, color); onCerrar(); } catch (e) { setError(e.message); } };
  return createPortal(
    <div className="rg-modal-fondo pf-fondo" onClick={onCerrar}>
      <div className="pf-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Tu avatar">
        <div className="pf-previa"><AvatarJugador nombre={jugador} tam={84} perfil={avatar && color ? { avatar, color } : null} /><b>{partirNombre(jugador).nombre}</b></div>
        {!ops ? <p className="pzp-nota">{error || 'Cargando…'}</p> : (
          <>
            <p className="pf-etiqueta">Elige tu avatar</p>
            <div className="pf-rejilla">{ops.avatares.map((a) => <button key={a} type="button" className={a === avatar ? 'sel' : ''} onClick={() => setAvatar(a)}>{a}</button>)}</div>
            <p className="pf-etiqueta">Y tu color</p>
            <div className="pf-colores">{ops.colores.map((c) => <button key={c} type="button" aria-label={c} className={c === color ? 'sel' : ''} style={{ '--c': c }} onClick={() => setColor(c)} />)}</div>
          </>
        )}
        {error && <p className="pf-error">{error}</p>}
        <div className="pf-acciones">
          <button type="button" className="pf-secundario" onClick={onCerrar}>Cancelar</button>
          <button type="button" className="pf-principal" disabled={!avatar || !color} onClick={guardar}>Guardar</button>
        </div>
        <Link to={`/jugador/${encodeURIComponent(jugador)}`} className="pf-ver" onClick={onCerrar}>👤 Ver mi perfil</Link>
      </div>
    </div>,
    document.body
  );
}
