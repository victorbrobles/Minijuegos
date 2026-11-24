import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import './Ajustes.css';
import Icon from './Icon.jsx';
import { activarAdmin, salirAdmin, useAdmin, useAdminComprobado, comprobarSesionAdmin } from '../lib/admin.js';
import { useCuenta } from '../lib/cuenta.js';

// Botón 🛡️ en la cabecera de la portada (junto a Grupos, sonido y ajustes): solo aparece si ESTA sesión está en modo
// administrador y abre su panel. Para activarlo hay que entrar en /admin (no hay ningún enlace en la web).
export default function BotonAdmin() {
  const esAdmin = useAdmin();
  const [abierto, setAbierto] = useState(false);
  useEffect(() => { comprobarSesionAdmin(); }, []);
  useEffect(() => {
    if (!abierto) return undefined;
    const tecla = (e) => { if (e.key === 'Escape') setAbierto(false); };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [abierto]);
  if (!esAdmin) return null;
  return (
    <>
      <button type="button" className="aj-boton adm-boton" onClick={() => setAbierto(true)} aria-label="Modo administrador" title="Modo administrador">🛡️</button>
      {abierto && createPortal(
        <div className="rg-modal-fondo aj-fondo" onClick={() => setAbierto(false)}>
          <div className="aj-panel adm-modal" role="dialog" aria-modal="true" aria-label="Modo administrador" onClick={(e) => e.stopPropagation()}>
            <header><h2>🛡️ Modo administrador</h2><button type="button" className="aj-cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar">✕</button></header>
            <p className="adm-estado"><span aria-hidden="true">✅</span> Activado: ya puedes ver el contenido oculto.</p>
            <Link to="/admin/panel" className="adm-opcion" onClick={() => setAbierto(false)}><span aria-hidden="true">🛠️</span><b>Panel de control</b><small>Salas en directo, buzón, errores, juegos, anuncio, moderación, cuentas, servidor y reto</small></Link>
            <Link to="/admin/estadisticas" className="adm-opcion" onClick={() => setAbierto(false)}><span aria-hidden="true">📊</span><b>Estadísticas de uso</b><small>Visitas, juegos, cuentas y base de datos</small></Link>
            <button type="button" className="adm-desactivar" onClick={() => { salirAdmin(); setAbierto(false); }}>Desactivar modo administrador</button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// Página /admin: código de 6 dígitos de la app de autenticación. Si es correcto, vuelve a la portada en modo admin.
export function PaginaAdmin() {
  const esAdmin = useAdminComprobado();
  const { usuario } = useCuenta();
  const navegar = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Ya en modo administrador: directamente al panel de control
  if (esAdmin) return <Navigate to="/admin/panel" replace />;
  if (esAdmin === null) return <div className="admin-pagina"><p className="loading">Comprobando…</p></div>;

  async function onSubmit(e) {
    e.preventDefault();
    if (codigo.length !== 6 || cargando) return;
    setCargando(true);
    setError('');
    try {
      const ok = await activarAdmin(codigo);
      setCodigo('');
      if (ok) navegar('/admin/panel', { replace: true });
      else setError('Código incorrecto.');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="admin-pagina">
      {!usuario ? (
        <div className="admin-panel">
          <span className="admin-icon"><Icon name="key" size={22} /></span>
          <div className="admin-text">
            <strong>Inicia sesión primero</strong>
            <span>El modo administrador se activa en la sesión de tu cuenta.</span>
          </div>
          <Link to="/" className="button secondary">Volver</Link>
        </div>
      ) : (
        <form className="admin-panel" onSubmit={onSubmit}>
          <span className="admin-icon"><Icon name="key" size={22} /></span>
          <div className="admin-text">
            <label htmlFor="codigo-admin"><strong>Código de verificación</strong></label>
            <input
              id="codigo-admin"
              className="code-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6 dígitos"
              autoComplete="one-time-code"
              spellCheck="false"
              autoFocus
            />
            {error && <span className="admin-error" role="alert">{error}</span>}
          </div>
          <button type="submit" disabled={cargando || codigo.length !== 6}>
            {cargando ? 'Comprobando…' : 'Entrar'}
          </button>
          <Link to="/" className="button secondary">Cancelar</Link>
        </form>
      )}
    </div>
  );
}
