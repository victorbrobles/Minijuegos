// client/src/components/Ajustes.jsx
// Botón ⚙️ de la portada y su panel: accesibilidad (letra, contraste, animaciones) y modo sin conexión.
// También el aviso global «Sin conexión».
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LETRAS, leerAjustes, guardarAjustes } from '../lib/ajustes.js';
import { descargarTodo, descargadoEl, useEnLinea } from '../lib/sinConexion.js';
import { crearCopia, miCopia, recuperarCopia } from '../lib/copiaPerfil.js';
import { guardarIdentidad, ultimaIdentidad, leerIdentidad, olvidarIdentidad } from '../lib/identidad.js';
import { SeccionInstalar } from './Instalar.jsx';
import { useCuenta, salir, cambiarPassword, borrarCuenta } from '../lib/cuenta.js';
import './Ajustes.css';

function Opcion({ activo, onClick, children }) {
  return <button type="button" className={`aj-opcion${activo ? ' activo' : ''}`} aria-pressed={activo} onClick={onClick}>{children}</button>;
}

export function PanelAjustes({ onCerrar }) {
  const { usuario } = useCuenta();
  const [a, setA] = useState(leerAjustes);
  const [desc, setDesc] = useState(null); // { hechos, total } | 'ok' | 'error'
  const enLinea = useEnLinea();
  const cambiar = (k, v) => { const n = { ...a, [k]: v }; setA(n); guardarAjustes(n); };
  useEffect(() => {
    const tecla = (e) => { if (e.key === 'Escape') onCerrar(); };
    window.addEventListener('keydown', tecla); return () => window.removeEventListener('keydown', tecla);
  }, [onCerrar]);
  const descargar = async () => {
    setDesc({ hechos: 0, total: 1 });
    const fallos = await descargarTodo((hechos, total) => setDesc({ hechos, total }));
    setDesc(fallos ? 'error' : 'ok');
  };
  const ultima = descargadoEl();
  return (
    <div className="rg-modal-fondo aj-fondo" onClick={onCerrar}>
      <div className="aj-panel" role="dialog" aria-modal="true" aria-label="Ajustes" onClick={(e) => e.stopPropagation()}>
        <header><h2>⚙️ Ajustes</h2><button type="button" className="aj-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button></header>
        <SeccionCuenta onCerrar={onCerrar} />

        <section>
          <h3>🔠 Tamaño de letra</h3>
          <div className="aj-opciones">
            {LETRAS.map(([id, texto, tam]) => <Opcion key={id} activo={a.letra === id} onClick={() => cambiar('letra', id)}><span style={{ fontSize: tam === '100%' ? '1rem' : tam === '112.5%' ? '1.15rem' : '1.3rem' }}>Aa</span> {texto}</Opcion>)}
          </div>
        </section>
        <section>
          <h3>🌓 Contraste</h3>
          <div className="aj-opciones">
            <Opcion activo={!a.contraste} onClick={() => cambiar('contraste', false)}>Normal</Opcion>
            <Opcion activo={a.contraste} onClick={() => cambiar('contraste', true)}>Alto contraste</Opcion>
          </div>
        </section>
        <section>
          <h3>✨ Animaciones</h3>
          <div className="aj-opciones">
            <Opcion activo={a.animaciones === 'sistema'} onClick={() => cambiar('animaciones', 'sistema')}>Como el sistema</Opcion>
            <Opcion activo={a.animaciones === 'menos'} onClick={() => cambiar('animaciones', 'menos')}>Reducir</Opcion>
            <Opcion activo={a.animaciones === 'todas'} onClick={() => cambiar('animaciones', 'todas')}>Todas</Opcion>
          </div>
        </section>
        <section>
          <h3>😈 Ronda de castigo</h3>
          <p className="aj-texto">Al acabar una partida en grupo, una ruleta elige un castigo para el que ha perdido.</p>
          <div className="aj-opciones">
            <Opcion activo={a.castigo === 'familiar'} onClick={() => cambiar('castigo', 'familiar')}>👨‍👩‍👧 Para todos</Opcion>
            <Opcion activo={a.castigo === 'adultos'} onClick={() => cambiar('castigo', 'adultos')}>🍷 Para adultos</Opcion>
            <Opcion activo={a.castigo === 'no'} onClick={() => cambiar('castigo', 'no')}>Desactivada</Opcion>
          </div>
        </section>
        <SeccionInstalar />
        {!usuario && <PasarMovil />}
        <section>
          <h3>📴 Jugar sin conexión</h3>
          <p className="aj-texto">Descarga todos los juegos en este dispositivo (unos 3 MB). Después podrás abrir sin internet los juegos de un solo móvil. Lo online (salas, récords compartidos) sigue necesitando conexión.</p>
          {desc && typeof desc === 'object' ? (
            <div className="aj-progreso"><span style={{ width: `${Math.round((desc.hechos / desc.total) * 100)}%` }} /><b>{Math.round((desc.hechos / desc.total) * 100)} %</b></div>
          ) : (
            <button type="button" className="aj-descargar" onClick={descargar} disabled={!enLinea}>
              {desc === 'ok' ? '✅ Descargado · volver a descargar' : desc === 'error' ? '⚠️ Faltó algo · reintentar' : ultima ? '🔄 Actualizar la descarga' : '⬇️ Descargar todos los juegos'}
            </button>
          )}
          {ultima > 0 && desc !== 'ok' && <p className="aj-nota">Última descarga: {new Date(ultima).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p>}
          {!enLinea && <p className="aj-nota">Ahora no hay conexión.</p>}
        </section>
      </div>
    </div>
  );
}

/* 👤 Tu cuenta: datos, cambiar contraseña, cerrar sesión y borrar la cuenta (o, sin cuenta, crearla) */
function SeccionCuenta({ onCerrar }) {
  const { usuario } = useCuenta();
  const [abierto, setAbierto] = useState(null); // null | 'password' | 'borrar'
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [aviso, setAviso] = useState(null);
  const cerrarFormulario = () => { setAbierto(null); setA(''); setB(''); };
  if (!usuario) {
    const yo = leerIdentidad();
    const crear = () => {
      // Se abre la entrada en «Crear cuenta» con tu nick actual: así conservas tus récords
      try { sessionStorage.setItem('minijuegos_entrada_modo', 'registro'); } catch { /* nada */ }
      onCerrar(); olvidarIdentidad();
    };
    return (
      <section>
        <h3>👤 Tu cuenta</h3>
        <p className="aj-texto">Estás jugando sin cuenta{yo ? ` como ${yo.nombre}#${yo.tag}` : ''}. Crea una (correo y contraseña) para tener tus récords, favoritos y grupos en cualquier móvil y que nadie pueda usar tu nick.</p>
        <div className="aj-opciones">
          <button type="button" className="aj-descargar aj-instalar" onClick={crear}>✨ Crear cuenta {yo ? 'con mi nick' : ''}</button>
          <button type="button" className="aj-opcion" onClick={() => { try { sessionStorage.setItem('minijuegos_entrada_modo', 'entrar'); } catch { /* nada */ } onCerrar(); olvidarIdentidad(); }}>🔑 Ya tengo cuenta</button>
        </div>
      </section>
    );
  }
  const guardarPw = async (e) => {
    e.preventDefault();
    try { await cambiarPassword(a, b); setAviso({ ok: 'Contraseña cambiada. Se ha cerrado la sesión en tus otros móviles.' }); cerrarFormulario(); } catch (err) { setAviso({ error: err.message }); }
  };
  const borrar = async (e) => {
    e.preventDefault();
    if (!window.confirm('Se borrará tu cuenta y todo lo guardado con tu nick (récords, grupos, retos…). No se puede deshacer. ¿Seguro?')) return;
    try { await borrarCuenta(a); onCerrar(); } catch (err) { setAviso({ error: err.message }); }
  };
  return (
    <section>
      <h3>👤 Tu cuenta</h3>
      <div className="aj-cuenta">
        <b>{usuario.nick}<small>#{usuario.tag}</small></b>
        <span>{usuario.email}</span>
        <em>✓ Tus favoritos, récords, logros y ajustes se guardan en tu cuenta</em>
      </div>
      <div className="aj-opciones">
        <button type="button" className="aj-opcion" onClick={() => { setAviso(null); setAbierto(abierto === 'password' ? null : 'password'); }}>🔒 Cambiar contraseña</button>
        <button type="button" className="aj-opcion" onClick={async () => { await salir(); onCerrar(); }}>🚪 Cerrar sesión</button>
        <button type="button" className="aj-opcion aj-peligro" onClick={() => { setAviso(null); setAbierto(abierto === 'borrar' ? null : 'borrar'); }}>🗑️ Borrar cuenta</button>
      </div>
      {abierto === 'password' && (
        <form className="aj-form" onSubmit={guardarPw}>
          <input type="password" value={a} onChange={(e) => setA(e.target.value)} placeholder="Contraseña actual" autoComplete="current-password" required />
          <input type="password" value={b} onChange={(e) => setB(e.target.value)} placeholder="Nueva (mín. 8 caracteres)" autoComplete="new-password" minLength={8} required />
          <button type="submit">Guardar</button>
        </form>
      )}
      {abierto === 'borrar' && (
        <form className="aj-form" onSubmit={borrar}>
          <input type="password" value={a} onChange={(e) => setA(e.target.value)} placeholder="Tu contraseña, para confirmar" autoComplete="current-password" required />
          <button type="submit" className="aj-peligro">Borrar mi cuenta</button>
        </form>
      )}
      {aviso?.error && <p className="aj-nota aj-error">{aviso.error}</p>}
      {aviso?.ok && <p className="aj-nota aj-bien">✅ {aviso.ok}</p>}
    </section>
  );
}

/* 📲 Pasar tu perfil (nombre, favoritos, récords, logros, ajustes) a otro móvil con un código */
function PasarMovil() {
  const [copia, setCopia] = useState(miCopia);
  const [estado, setEstado] = useState(null); // null | 'guardando' | 'recuperando' | { error } | { ok }
  const [codigo, setCodigo] = useState('');
  const [abrirRecuperar, setAbrirRecuperar] = useState(false);
  const guardar = async () => {
    setEstado('guardando');
    try { setCopia(await crearCopia()); setEstado(null); } catch (e) { setEstado({ error: e.message }); }
  };
  const recuperar = async (e) => {
    e.preventDefault();
    if (!window.confirm('Se sustituirá lo que hay en este móvil por la copia. ¿Seguimos?')) return;
    setEstado('recuperando');
    try {
      const n = await recuperarCopia(codigo);
      const u = ultimaIdentidad(); // pasas a ser tú (el nombre de la copia)
      if (u?.nombre && u?.tag) guardarIdentidad(u.nombre, u.tag);
      setEstado({ ok: n }); setTimeout(() => window.location.reload(), 1200);
    } catch (err) { setEstado({ error: err.message }); }
  };
  return (
    <section>
      <h3>📲 Pasar a otro móvil</h3>
      <p className="aj-texto">Guarda tu nombre, favoritos, récords, logros y ajustes con un código. En el otro móvil, pulsa «Tengo un código» y escríbelo.</p>
      {copia && (
        <div className="aj-codigo">
          <small>Tu código</small>
          <b>{copia.codigo}</b>
          <small>Actualizado el {new Date(copia.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} · guárdalo bien</small>
        </div>
      )}
      <div className="aj-opciones">
        <button type="button" className="aj-descargar" onClick={guardar} disabled={estado === 'guardando'}>
          {estado === 'guardando' ? 'Guardando…' : copia ? '🔄 Actualizar la copia' : '☁️ Crear mi código'}
        </button>
        <button type="button" className="aj-opcion" onClick={() => setAbrirRecuperar((v) => !v)} aria-expanded={abrirRecuperar}>🔑 Tengo un código</button>
      </div>
      {abrirRecuperar && (
        <form className="aj-recuperar" onSubmit={recuperar}>
          <input value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))} placeholder="ABC123" aria-label="Código de la copia" autoCapitalize="characters" autoComplete="off" spellCheck="false" />
          <button type="submit" disabled={codigo.length !== 6 || estado === 'recuperando'}>{estado === 'recuperando' ? '…' : 'Recuperar'}</button>
        </form>
      )}
      {estado?.error && <p className="aj-nota aj-error">{estado.error}</p>}
      {estado?.ok != null && <p className="aj-nota aj-bien">✅ ¡Recuperado! Recargando…</p>}
    </section>
  );
}

export function BotonAjustes() {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <button type="button" className="aj-boton" onClick={() => setAbierto(true)} aria-label="Ajustes y accesibilidad" title="Ajustes y accesibilidad">⚙️</button>
      {abierto && createPortal(<PanelAjustes onCerrar={() => setAbierto(false)} />, document.body)}
    </>
  );
}

/** Aviso fijo cuando se pierde la conexión. */
export function AvisoSinConexion() {
  const enLinea = useEnLinea();
  if (enLinea) return null;
  return <p className="aj-offline" role="status">📴 Sin conexión · puedes seguir con los juegos de un solo móvil que ya tengas descargados</p>;
}
