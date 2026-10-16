import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { activarAdmin, salirAdmin, useAdmin, comprobarSesionAdmin } from '../lib/admin.js';

// Panel de la portada para activar / desactivar el modo administrador
export default function AdminPanel() {
  const esAdmin = useAdmin();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => { comprobarSesionAdmin(); }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (codigo.length !== 6 || cargando) return;
    setCargando(true);
    setError('');
    try {
      const ok = await activarAdmin(codigo);
      setCodigo('');
      if (!ok) setError('Código incorrecto.');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  if (esAdmin) {
    return (
      <div className="admin-panel on">
        <span className="admin-icon"><Icon name="shield" size={26} /></span>
        <div className="admin-text">
          <strong>Modo administrador activado</strong>
          <span>Ya puedes ver las categorías ocultas.</span>
        </div>
        <button className="secondary" onClick={salirAdmin}>Salir</button>
      </div>
    );
  }

  return (
    <form className="admin-panel" onSubmit={onSubmit}>
      <span className="admin-icon"><Icon name="key" size={26} /></span>
      <div className="admin-text">
        <label htmlFor="codigo-admin"><strong>Modo administrador</strong></label>
        <input
          id="codigo-admin"
          className="code-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Código de 6 dígitos"
          autoComplete="one-time-code"
          spellCheck="false"
        />
        {error && <span className="admin-error" role="alert">{error}</span>}
      </div>
      <button type="submit" disabled={cargando || codigo.length !== 6}>
        {cargando ? 'Comprobando…' : 'Activar'}
      </button>
    </form>
  );
}
