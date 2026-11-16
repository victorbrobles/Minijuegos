// client/src/components/Identidad.jsx
// Identidad del jugador (Nombre#1234): pantalla de entrada, nombre con etiqueta y chip para cambiarla.
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import { AvatarJugador, EditarPerfil } from './Perfil.jsx';
import {
  useIdentidad, ultimaIdentidad, guardarIdentidad, olvidarIdentidad, tagAlAzar, limpiarNombre, partirNombre, textoIdentidad, MAX_NOMBRE
} from '../lib/identidad.js';
import { useCuenta, entrar, registrar, salir, nombreLibre } from '../lib/cuenta.js';
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

const MODO = 'minijuegos_entrada_modo';
const TUVO_CUENTA = 'minijuegos_tuvo_cuenta';
const leerLocal = (k) => { try { return localStorage.getItem(k); } catch { return null; } };

/** Campo «Nick # número» con el dado para un número al azar. */
function CamposNick({ nombre, setNombre, tag, setTag, limpiarError, autoFocus }) {
  return (
    <>
      <div className="idn-campos">
        <label className="idn-campo nombre">
          <span>Nick</span>
          <input value={nombre} onChange={(e) => { setNombre(e.target.value.replace(/[#|]/g, '')); limpiarError(); }} maxLength={MAX_NOMBRE} placeholder="Tu nick" autoComplete="nickname" autoFocus={autoFocus} />
        </label>
        <span className="idn-almohadilla">#</span>
        <label className="idn-campo tag">
          <span>Número</span>
          <input value={tag} onChange={(e) => { setTag(e.target.value.replace(/\D/g, '').slice(0, 4)); limpiarError(); }} inputMode="numeric" maxLength={4} placeholder="1234" />
        </label>
        <button type="button" className="idn-dado" onClick={() => setTag(tagAlAzar())} title="Número al azar" aria-label="Número al azar"><Icon name="dice" size={20} /></button>
      </div>
      {nombre.trim() && /^\d{4}$/.test(tag) && <p className="idn-vista">Te verán como <NombreTag texto={`${limpiarNombre(nombre)}#${tag}`} /></p>}
    </>
  );
}

function Entrada() {
  const ultima = ultimaIdentidad();
  const [modo, setModo] = useState(() => {
    try { const m = sessionStorage.getItem(MODO); if (m) { sessionStorage.removeItem(MODO); return m; } } catch { /* nada */ }
    return leerLocal(TUVO_CUENTA) ? 'entrar' : 'registro';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPw, setVerPw] = useState(false);
  const [nombre, setNombre] = useState(ultima?.nombre || '');
  const [tag, setTag] = useState(ultima?.tag || tagAlAzar());
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const limpiarError = () => setError('');
  const cambiarModo = (m) => { setModo(m); setError(''); };
  const marcarCuenta = () => { try { localStorage.setItem(TUVO_CUENTA, '1'); } catch { /* nada */ } };

  const enviar = async (e) => {
    e?.preventDefault();
    if (ocupado) return;
    setError('');
    const n = limpiarNombre(nombre);
    try {
      setOcupado(true);
      if (modo === 'entrar') {
        await entrar({ email, password });
        marcarCuenta();
      } else if (modo === 'registro') {
        if (!n) throw new Error('Elige un nick.');
        if (!/^\d{4}$/.test(tag)) throw new Error('El número son cuatro cifras.');
        await registrar({ email, password, nick: n, tag });
        marcarCuenta();
      } else {
        if (!n) throw new Error('Escribe tu nick.');
        if (!/^\d{4}$/.test(tag)) throw new Error('El número son cuatro cifras.');
        if (!(await nombreLibre(`${n}#${tag}`))) throw new Error(`«${n}#${tag}» tiene cuenta. Si es tuyo, inicia sesión; si no, elige otro número.`);
        guardarIdentidad(n, tag);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setOcupado(false);
    }
  };

  const campoEmail = <label className="idn-campo-l"><span>Correo</span><input type="email" value={email} onChange={(e) => { setEmail(e.target.value); limpiarError(); }} autoComplete="email" placeholder="tu@correo.com" required autoFocus /></label>;
  const campoPw = (
    <label className="idn-campo-l"><span>Contraseña{modo === 'registro' && ' (mín. 8 caracteres)'}</span>
      <span className="idn-pw">
        <input type={verPw ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); limpiarError(); }} autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'} minLength={modo === 'registro' ? 8 : undefined} required />
        <button type="button" onClick={() => setVerPw((v) => !v)} aria-label={verPw ? 'Ocultar contraseña' : 'Ver contraseña'}>{verPw ? '🙈' : '👁️'}</button>
      </span>
    </label>
  );

  return (
    <div className="idn-fondo">
      <form className="idn-caja" onSubmit={enviar}>
        <img className="idn-logo idn-logo-img" src="/logo.svg" alt="Al juego, juego" width="72" height="72" />
        <h1>{modo === 'entrar' ? '¡Hola de nuevo!' : modo === 'registro' ? 'Crea tu cuenta' : '¿Quién juega?'}</h1>
        <div className="idn-pestanas" role="tablist">
          <button type="button" role="tab" aria-selected={modo === 'entrar'} className={modo === 'entrar' ? 'activa' : ''} onClick={() => cambiarModo('entrar')}>Iniciar sesión</button>
          <button type="button" role="tab" aria-selected={modo === 'registro'} className={modo === 'registro' ? 'activa' : ''} onClick={() => cambiarModo('registro')}>Crear cuenta</button>
          <button type="button" role="tab" aria-selected={modo === 'invitado'} className={modo === 'invitado' ? 'activa' : ''} onClick={() => cambiarModo('invitado')}>Sin cuenta</button>
        </div>

        {modo === 'entrar' && (
          <>
            <p>Entra con tu correo y tu contraseña: tendrás tus récords, favoritos y grupos en cualquier móvil.</p>
            {campoEmail}
            {campoPw}
            <p className="idn-nota">¿Has olvidado la contraseña? Escribe al contacto de la web y te daremos una provisional.</p>
          </>
        )}
        {modo === 'registro' && (
          <>
            <p>Con cuenta, tus récords, favoritos, logros y grupos te siguen a cualquier móvil y nadie puede usar tu nick.</p>
            {campoEmail}
            {campoPw}
            <CamposNick nombre={nombre} setNombre={setNombre} tag={tag} setTag={setTag} limpiarError={limpiarError} />
            {ultima && <p className="idn-nota">💡 Si ya jugabas como <NombreTag texto={textoIdentidad(ultima)} />, déjalo así y conservarás tus récords.</p>}
          </>
        )}
        {modo === 'invitado' && (
          <>
            <p>Juega al momento con un nick y un número. Sin cuenta, lo que guardes se queda solo en este móvil.</p>
            {ultima && (
              <button type="button" className="idn-seguir" onClick={async () => {
                if (!(await nombreLibre(textoIdentidad(ultima)))) { cambiarModo('entrar'); setError(`«${textoIdentidad(ultima)}» tiene cuenta: inicia sesión para usarlo.`); return; }
                guardarIdentidad(ultima.nombre, ultima.tag);
              }}>
                Seguir como <NombreTag texto={textoIdentidad(ultima)} />
              </button>
            )}
            <CamposNick nombre={nombre} setNombre={setNombre} tag={tag} setTag={setTag} limpiarError={limpiarError} autoFocus={!ultima} />
          </>
        )}

        {error && <p className="idn-error">{error}</p>}
        <button type="submit" className="big full qq-btn-principal" disabled={ocupado}>
          <Icon name="play" size={20} /> {ocupado ? 'Un momento…' : modo === 'entrar' ? 'Entrar' : modo === 'registro' ? 'Crear cuenta y jugar' : 'Jugar sin cuenta'}
        </button>
        {modo === 'invitado' && <RecuperarDesdeEntrada />}
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
  const { cargando } = useCuenta();
  const { pathname } = useLocation();
  // Mientras se comprueba si hay sesión iniciada no se enseña la entrada (para no verla un instante y desaparecer)
  if (!yo && cargando && !/^\/(privacidad|creditos)\/?$/.test(pathname)) return <div className="idn-fondo" aria-busy="true" />;
  // La privacidad y los créditos se pueden leer sin elegir nombre
  if (!yo && !/^\/(privacidad|creditos)\/?$/.test(pathname)) return <Entrada />;
  return children;
}

/** Chip con la identidad y opción de cambiarla (portada). */
export function ChipIdentidad() {
  const yo = useIdentidad();
  const { usuario } = useCuenta();
  const [editar, setEditar] = useState(false);
  if (!yo) return null;
  return (
    <div className="idn-chip">
      <button type="button" className="pf-boton-avatar" onClick={() => setEditar(true)} title="Cambiar tu avatar"><AvatarJugador nombre={textoIdentidad(yo)} tam={24} /></button>
      {editar && <EditarPerfil jugador={textoIdentidad(yo)} onCerrar={() => setEditar(false)} />}
      <NombreTag texto={textoIdentidad(yo)} />
      {usuario && <span className="idn-verificado" title="Con cuenta">✓</span>}
      <button type="button" onClick={() => (usuario ? (window.confirm('¿Cerrar sesión?') && salir()) : olvidarIdentidad())} title={usuario ? 'Cerrar sesión' : 'Cambiar de jugador'}>{usuario ? 'Salir' : 'Cambiar'}</button>
    </div>
  );
}
