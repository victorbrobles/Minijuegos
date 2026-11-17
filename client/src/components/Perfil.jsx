// client/src/components/Perfil.jsx
// Avatar de un jugador (dibujado con sus piezas, o el emoji de antes, sobre su color; si no ha elegido, su inicial)
// y el editor para crear el tuyo: piel, peinado, ojos, boca, barba, gafas, ropa y complementos.
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { usePerfiles, cargarOpciones, guardarPerfil } from '../lib/perfil.js';
import { partirNombre } from '../lib/identidad.js';
import AvatarSVG from './AvatarSVG.jsx';
import { PIEZAS, PIEZAS_CARA, PIEZAS_ROPA, AVATAR_INICIAL, leerAvatar, textoAvatar, avatarAleatorio } from '../lib/avatarPartes.js';
import './Perfil.css';

export function AvatarJugador({ nombre, tam = 28, perfil: dado }) {
  const p = usePerfiles(dado === undefined ? [nombre] : [])[nombre];
  const per = dado === undefined ? p : dado;
  const ini = (partirNombre(nombre).nombre || '?').charAt(0).toUpperCase();
  const dibujo = leerAvatar(per?.avatar);
  if (dibujo) {
    return <span className="pf-avatar dibujo" style={{ width: tam, height: tam }} aria-hidden="true"><AvatarSVG a={dibujo} fondo={per.color} tam={tam} modo="cara" /></span>;
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

/** Escena con el avatar de cuerpo entero (editor y página de perfil). */
export function EscenaAvatar({ a, fondo, alto = 230, titulo }) {
  return <div className="pf-escena" style={{ '--c': fondo }}><AvatarSVG a={a} modo="cuerpo" tam={alto} titulo={titulo} /></div>;
}

const BLOQUES = [
  { id: 'cara', nombre: 'Cara', emoji: '😀', piezas: PIEZAS_CARA },
  { id: 'ropa', nombre: 'Ropa', emoji: '👕', piezas: PIEZAS_ROPA },
  { id: 'fondo', nombre: 'Fondo', emoji: '🎨', piezas: [] }
];

export function EditarPerfil({ jugador, onCerrar }) {
  const actual = usePerfiles([jugador])[jugador];
  const [ops, setOps] = useState(null);
  const [a, setA] = useState(() => leerAvatar(actual?.avatar) || AVATAR_INICIAL);
  const [color, setColor] = useState(actual?.color || null);
  const [bloque, setBloque] = useState('cara');
  const [pieza, setPieza] = useState('pelo');
  const [error, setError] = useState('');
  useEffect(() => { cargarOpciones().then((o) => { setOps(o); setColor((c) => c || o.colores[7]); }).catch(() => setError('Sin conexión.')); }, []);
  const guardar = async () => { try { await guardarPerfil(jugador, textoAvatar(a), color); onCerrar(); } catch (e) { setError(e.message); } };
  const cambiarBloque = (b) => { setBloque(b.id); if (b.piezas.length) setPieza(b.piezas[b.id === 'cara' ? 1 : 0]); };
  const def = PIEZAS.find((p) => p.id === pieza);
  const fondo = color || '#6366f1';
  const enRopa = PIEZAS_ROPA.includes(pieza);
  const piezasBloque = BLOQUES.find((b) => b.id === bloque).piezas;
  return createPortal(
    <div className="rg-modal-fondo pf-fondo" onClick={onCerrar}>
      <div className="pf-modal pf-editor" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Tu avatar">
        <div className="pf-previa">
          <EscenaAvatar a={a} fondo={fondo} titulo="Tu avatar" />
          <div className="pf-previa-pie">
            <b>{partirNombre(jugador).nombre}</b>
            <button type="button" className="pf-azar" onClick={() => setA(avatarAleatorio())}>🎲 Aleatorio</button>
          </div>
        </div>
        <div className="pf-bloques" role="tablist">
          {BLOQUES.map((b) => (
            <button key={b.id} type="button" role="tab" aria-selected={b.id === bloque} className={b.id === bloque ? 'sel' : ''} onClick={() => cambiarBloque(b)}>
              <span aria-hidden="true">{b.emoji}</span>{b.nombre}
            </button>
          ))}
        </div>
        {piezasBloque.length > 0 && (
          <div className="pf-pestanas" role="tablist">
            {piezasBloque.map((id) => {
              const p = PIEZAS.find((x) => x.id === id);
              return <button key={id} type="button" role="tab" aria-selected={id === pieza} className={id === pieza ? 'sel' : ''} onClick={() => setPieza(id)}>{p.nombre}</button>;
            })}
          </div>
        )}
        {bloque === 'fondo' ? (
          !ops ? <p className="pzp-nota">{error || 'Cargando…'}</p> : (
            <div className="pf-colores">{ops.colores.map((c) => <button key={c} type="button" aria-label={`Fondo ${c}`} className={c === color ? 'sel' : ''} style={{ '--c': c }} onClick={() => setColor(c)} />)}</div>
          )
        ) : def.colores ? (
          <div className="pf-colores">{def.colores.map((c, i) => <button key={c} type="button" aria-label={`${def.nombre} ${i + 1}`} className={i === a[pieza] ? 'sel' : ''} style={{ '--c': c }} onClick={() => setA({ ...a, [pieza]: i })} />)}</div>
        ) : (
          <div className={`pf-opciones${enRopa ? ' ropa' : ''}`}>
            {def.opciones.map((nom, i) => (
              <button key={nom} type="button" className={i === a[pieza] ? 'sel' : ''} onClick={() => setA({ ...a, [pieza]: i })} title={nom}>
                {enRopa ? <AvatarSVG a={{ ...a, [pieza]: i }} modo="cuerpo" tam={112} /> : <AvatarSVG a={{ ...a, [pieza]: i }} fondo={fondo} tam={58} />}
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
