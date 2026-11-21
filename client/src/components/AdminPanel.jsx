import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { activarAdmin, salirAdmin, useAdmin, comprobarSesionAdmin } from '../lib/admin.js';
import { useCuenta } from '../lib/cuenta.js';

// Pie de la portada: solo aparece si ESTA sesión está en modo administrador, con el botón para desactivarlo.
// Para activarlo hay que entrar en /admin (no hay ningún enlace en la web).
export default function AdminPanel() {
  const esAdmin = useAdmin();
  useEffect(() => { comprobarSesionAdmin(); }, []);
  if (!esAdmin) return null;
  return (
    <footer className="admin-foot">
      <div className="admin-panel on">
        <span className="admin-icon"><Icon name="shield" size={22} /></span>
        <div className="admin-text">
          <strong>Modo administrador activado</strong>
          <span>Ya puedes ver el contenido oculto.</span>
          <Link to="/admin/estadisticas" className="admin-stats-link">📊 Estadísticas de uso</Link>
        </div>
        <button type="button" className="secondary" onClick={salirAdmin}>Desactivar</button>
      </div>
    </footer>
  );
}

// Página /admin: código de 6 dígitos de la app de autenticación. Si es correcto, vuelve a la portada en modo admin.
export function PaginaAdmin() {
  const esAdmin = useAdmin();
  const { usuario } = useCuenta();
  const navegar = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  if (esAdmin) return <Navigate to="/" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    if (codigo.length !== 6 || cargando) return;
    setCargando(true);
    setError('');
    try {
      const ok = await activarAdmin(codigo);
      setCodigo('');
      if (ok) navegar('/', { replace: true });
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
