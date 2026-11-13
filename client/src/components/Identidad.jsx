// client/src/components/Identidad.jsx
// Identidad del jugador (Nombre#1234): pantalla de entrada, nombre con etiqueta y chip para cambiarla.
import React, { useState } from 'react';
import Icon from './Icon.jsx';
import {
  useIdentidad, ultimaIdentidad, guardarIdentidad, olvidarIdentidad, tagAlAzar, limpiarNombre, partirNombre, textoIdentidad, MAX_NOMBRE
} from '../lib/identidad.js';
import './Identidad.css';

/** «Ana#1234» con el nombre destacado y la etiqueta discreta. Sirve también para nombres sin etiqueta. */
export function NombreTag({ texto, className = '' }) {
  const { nombre, tag } = partirNombre(texto);
  return (
    <span className={`idn-nt ${className}`}>
      <span className="idn-nt-nombre">{nombre}</span>
      {tag && <span className="idn-nt-tag">#{tag}</span>}
    </span>
  );
}

function Entrada({ onListo }) {
  const ultima = ultimaIdentidad();
  const [nombre, setNombre] = useState(ultima?.nombre || '');
  const [tag, setTag] = useState(ultima?.tag || tagAlAzar());
  const [error, setError] = useState('');
  const entrar = (e) => {
    e?.preventDefault();
    const n = limpiarNombre(nombre);
    if (!n) return setError('Escribe tu nombre.');
    if (!/^\d{4}$/.test(tag)) return setError('El tag son cuatro números.');
    guardarIdentidad(n, tag);
    onListo?.();
    return undefined;
  };
  return (
    <div className="idn-fondo">
      <form className="idn-caja" onSubmit={entrar}>
        <span className="idn-logo"><Icon name="gamepad" size={40} strokeWidth={1.9} /></span>
        <h1>¿Quién juega?</h1>
        <p>Elige tu nombre y un tag de cuatro números. Así aparecerás en los récords y en los podios de cada juego.</p>
        {ultima && (
          <button type="button" className="idn-seguir" onClick={() => { guardarIdentidad(ultima.nombre, ultima.tag); onListo?.(); }}>
            Seguir como <NombreTag texto={textoIdentidad(ultima)} />
          </button>
        )}
        <div className="idn-campos">
          <label className="idn-campo nombre">
            <span>Nombre</span>
            <input value={nombre} onChange={(e) => { setNombre(e.target.value.replace(/[#|]/g, '')); setError(''); }} maxLength={MAX_NOMBRE} placeholder="Tu nombre" autoComplete="nickname" autoFocus={!ultima} />
          </label>
          <span className="idn-almohadilla">#</span>
          <label className="idn-campo tag">
            <span>Tag</span>
            <input value={tag} onChange={(e) => { setTag(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }} inputMode="numeric" maxLength={4} placeholder="1234" />
          </label>
          <button type="button" className="idn-dado" onClick={() => setTag(tagAlAzar())} title="Tag al azar" aria-label="Tag al azar"><Icon name="dice" size={20} /></button>
        </div>
        {nombre.trim() && /^\d{4}$/.test(tag) && <p className="idn-vista">Te verán como <NombreTag texto={`${limpiarNombre(nombre)}#${tag}`} /></p>}
        {error && <p className="idn-error">{error}</p>}
        <button type="submit" className="big full qq-btn-principal"><Icon name="play" size={20} /> Entrar</button>
      </form>
    </div>
  );
}

/** Pide la identidad antes de mostrar la aplicación (una vez por sesión). */
export function PuertaIdentidad({ children }) {
  const yo = useIdentidad();
  if (!yo) return <Entrada />;
  return children;
}

/** Chip con la identidad y opción de cambiarla (portada). */
export function ChipIdentidad() {
  const yo = useIdentidad();
  if (!yo) return null;
  return (
    <div className="idn-chip">
      <Icon name="users" size={15} />
      <NombreTag texto={textoIdentidad(yo)} />
      <button type="button" onClick={olvidarIdentidad} title="Cambiar de jugador">Cambiar</button>
    </div>
  );
}
