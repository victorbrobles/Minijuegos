// client/src/components/Identidad.jsx
// Identidad del jugador (Nombre#1234): pantalla de entrada, nombre con etiqueta y chip para cambiarla.
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import { AvatarJugador, EditarPerfil } from './Perfil.jsx';
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
        <img className="idn-logo idn-logo-img" src="/logo.svg" alt="Al juego, juego" width="72" height="72" />
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
        <RecuperarDesdeEntrada />
        <p className="idn-legal">Puedes usar un apodo. <Link to="/privacidad">Privacidad y aviso legal</Link></p>
      </form>
    </div>
  );
}

/* «¿Vienes de otro móvil?»: recupera nombre, favoritos, récords… con el código de «Pasar a otro móvil» */
function RecuperarDesdeEntrada() {
  const [abierto, setAbierto] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [estado, setEstado] = useState(null);
  const recuperar = async () => {
    setEstado('…');
    try {
      const { recuperarCopia } = await import('../lib/copiaPerfil.js');
      await recuperarCopia(codigo);
      // Se entra directamente con el nombre que tenías en el otro móvil
      const u = ultimaIdentidad();
      if (u?.nombre && u?.tag) guardarIdentidad(u.nombre, u.tag);
      setEstado('✅ ¡Recuperado!');
      setTimeout(() => window.location.reload(), 800);
    } catch (e) { setEstado(e.message); }
  };
  if (!abierto) return <button type="button" className="idn-otro-movil" onClick={() => setAbierto(true)}>📲 ¿Vienes de otro móvil? Tengo un código</button>;
  return (
    <div className="idn-recuperar">
      <input value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))} placeholder="ABC123" aria-label="Código para recuperar tu perfil" autoCapitalize="characters" autoComplete="off" spellCheck="false" autoFocus
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (codigo.length === 6) recuperar(); } }} />
      <button type="button" onClick={recuperar} disabled={codigo.length !== 6}>Recuperar</button>
      {estado && <p>{estado}</p>}
    </div>
  );
}

/** Pide la identidad antes de mostrar la aplicación (una vez por sesión). */
export function PuertaIdentidad({ children }) {
  const yo = useIdentidad();
  const { pathname } = useLocation();
  // La privacidad y los créditos se pueden leer sin elegir nombre
  if (!yo && !/^\/(privacidad|creditos)\/?$/.test(pathname)) return <Entrada />;
  return children;
}

/** Chip con la identidad y opción de cambiarla (portada). */
export function ChipIdentidad() {
  const yo = useIdentidad();
  const [editar, setEditar] = useState(false);
  if (!yo) return null;
  return (
    <div className="idn-chip">
      <button type="button" className="pf-boton-avatar" onClick={() => setEditar(true)} title="Cambiar tu avatar"><AvatarJugador nombre={textoIdentidad(yo)} tam={24} /></button>
      {editar && <EditarPerfil jugador={textoIdentidad(yo)} onCerrar={() => setEditar(false)} />}
      <NombreTag texto={textoIdentidad(yo)} />
      <button type="button" onClick={olvidarIdentidad} title="Cambiar de jugador">Cambiar</button>
    </div>
  );
}
