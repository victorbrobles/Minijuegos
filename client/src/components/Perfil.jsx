// client/src/components/Perfil.jsx
// Avatar de un jugador (dibujado con sus piezas, o el emoji de antes, sobre su color; si no ha elegido, su inicial)
// y el editor para crear el tuyo: piel, peinado, ojos, boca, barba, gafas, ropa y complementos.
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { usePerfiles, cargarOpciones, guardarPerfil } from '../lib/perfil.js';
import { partirNombre } from '../lib/identidad.js';
import AvatarSVG from './AvatarSVG.jsx';
import { PIEZAS, AVATAR_INICIAL, leerAvatar, textoAvatar, avatarAleatorio } from '../lib/avatarPartes.js';
import './Perfil.css';

export function AvatarJugador({ nombre, tam = 28, perfil: dado }) {
  const p = usePerfiles(dado === undefined ? [nombre] : [])[nombre];
  const per = dado === undefined ? p : dado;
  const ini = (partirNombre(nombre).nombre || '?').charAt(0).toUpperCase();
  const dibujo = leerAvatar(per?.avatar);
  if (dibujo) {
    return <span className="pf-avatar dibujo" style={{ width: tam, height: tam }} aria-hidden="true"><AvatarSVG a={dibujo} fondo={per.color} tam={tam} /></span>;
  }
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
  const [a, setA] = useState(() => leerAvatar(actual?.avatar) || AVATAR_INICIAL);
  const [color, setColor] = useState(actual?.color || null);
  const [pieza, setPieza] = useState('pelo');
  const [error, setError] = useState('');
  useEffect(() => { cargarOpciones().then((o) => { setOps(o); setColor((c) => c || o.colores[7]); }).catch(() => setError('Sin conexión.')); }, []);
  const guardar = async () => { try { await guardarPerfil(jugador, textoAvatar(a), color); onCerrar(); } catch (e) { setError(e.message); } };
  const def = PIEZAS.find((p) => p.id === pieza);
  const fondo = color || '#6366f1';
  return createPortal(
    <div className="rg-modal-fondo pf-fondo" onClick={onCerrar}>
      <div className="pf-modal pf-editor" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Tu avatar">
        <div className="pf-previa">
          <span className="pf-previa-dibujo"><AvatarSVG a={a} fondo={fondo} tam={108} titulo="Tu avatar" /></span>
          <b>{partirNombre(jugador).nombre}</b>
          <button type="button" className="pf-azar" onClick={() => setA(avatarAleatorio())}>🎲 Aleatorio</button>
        </div>
        <div className="pf-pestanas" role="tablist">
          {PIEZAS.map((p) => (
            <button key={p.id} type="button" role="tab" aria-selected={p.id === pieza} className={p.id === pieza ? 'sel' : ''} onClick={() => setPieza(p.id)}>
              <span aria-hidden="true">{p.emoji}</span>{p.nombre}
            </button>
          ))}
          <button type="button" role="tab" aria-selected={pieza === 'fondo'} className={pieza === 'fondo' ? 'sel' : ''} onClick={() => setPieza('fondo')}><span aria-hidden="true">🟣</span>Fondo</button>
        </div>
        {pieza === 'fondo' ? (
          !ops ? <p className="pzp-nota">{error || 'Cargando…'}</p> : (
            <div className="pf-colores">{ops.colores.map((c) => <button key={c} type="button" aria-label={`Fondo ${c}`} className={c === color ? 'sel' : ''} style={{ '--c': c }} onClick={() => setColor(c)} />)}</div>
          )
        ) : def.colores ? (
          <div className="pf-colores">{def.colores.map((c, i) => <button key={c} type="button" aria-label={`${def.nombre} ${i + 1}`} className={i === a[pieza] ? 'sel' : ''} style={{ '--c': c }} onClick={() => setA({ ...a, [pieza]: i })} />)}</div>
        ) : (
          <div className="pf-opciones">
            {def.opciones.map((nom, i) => (
              <button key={nom} type="button" className={i === a[pieza] ? 'sel' : ''} onClick={() => setA({ ...a, [pieza]: i })} title={nom}>
                <AvatarSVG a={{ ...a, [pieza]: i }} fondo={fondo} tam={58} />
                <small>{nom}</small>
              </button>
            ))}
          </div>
        )}
        {error && <p className="pf-error">{error}</p>}
        <div className="pf-acciones">
          <button type="button" className="pf-secundario" onClick={onCerrar}>Cancelar</button>
          <button type="button" className="pf-principal" disabled={!color} onClick={guardar}>Guardar</button>
        </div>
        <Link to={`/jugador/${encodeURIComponent(jugador)}`} className="pf-ver" onClick={onCerrar}>👤 Ver mi perfil</Link>
      </div>
    </div>,
    document.body
  );
}
