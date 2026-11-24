// client/src/components/Soporte.jsx
// · BotonReporte: «⚑ Avisar de un fallo» al pie de cada juego (fallo, sugerencia o contenido incorrecto).
// · AnuncioPortada: el aviso que el administrador pone en la portada (se puede cerrar; vuelve si cambia el anuncio).
// · AvisoMantenimiento: pantalla para un juego que el administrador ha puesto en mantenimiento.
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { enviarReporte, usePortada } from '../lib/soporte.js';
import './Soporte.css';

const TIPOS = [
  ['fallo', '🐞', 'Algo no funciona'],
  ['contenido', '📝', 'Una pregunta o dato está mal'],
  ['sugerencia', '💡', 'Tengo una idea']
];

export function BotonReporte({ juego }) {
  const [abierto, setAbierto] = useState(false);
  const [tipo, setTipo] = useState('fallo');
  const [mensaje, setMensaje] = useState('');
  const [estado, setEstado] = useState(''); // '' | 'enviando' | 'ok' | texto de error
  const cerrar = () => { setAbierto(false); if (estado === 'ok') { setEstado(''); setMensaje(''); } };
  const enviar = async (e) => {
    e.preventDefault();
    if (mensaje.trim().length < 5 || estado === 'enviando') return;
    setEstado('enviando');
    try { await enviarReporte({ juego, tipo, mensaje: mensaje.trim() }); setEstado('ok'); } catch (err) { setEstado(err.message); }
  };
  return (
    <>
      <button type="button" className="sop-boton" onClick={() => setAbierto(true)}>⚑ Avisar de un fallo o sugerir algo</button>
      {abierto && createPortal(
        <div className="rg-modal-fondo sop-fondo" onClick={cerrar}>
          <form className="sop-modal" role="dialog" aria-modal="true" aria-label="Avisar de un fallo" onClick={(e) => e.stopPropagation()} onSubmit={enviar}>
            <header><h2>¿Qué ha pasado?</h2><button type="button" className="sop-x" onClick={cerrar} aria-label="Cerrar">✕</button></header>
            {estado === 'ok' ? (
              <>
                <p className="sop-gracias">✅ ¡Gracias! Lo revisaremos lo antes posible.</p>
                <button type="button" className="sop-enviar" onClick={cerrar}>Cerrar</button>
              </>
            ) : (
              <>
                <div className="sop-tipos" role="radiogroup">
                  {TIPOS.map(([id, emoji, texto]) => (
                    <button type="button" key={id} role="radio" aria-checked={tipo === id} className={tipo === id ? 'activo' : ''} onClick={() => setTipo(id)}>
                      <span aria-hidden="true">{emoji}</span>{texto}
                    </button>
                  ))}
                </div>
                <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value.slice(0, 1500))} rows={5} autoFocus
                  placeholder={tipo === 'sugerencia' ? 'Cuéntanos tu idea…' : 'Qué estabas haciendo y qué ha fallado (ronda, pregunta, botón…)'} />
                <small className="sop-nota">No escribas datos personales. Se envía el juego y la pantalla en la que estás.</small>
                {estado && estado !== 'enviando' && <p className="sop-error" role="alert">{estado}</p>}
                <button type="submit" className="sop-enviar" disabled={mensaje.trim().length < 5 || estado === 'enviando'}>{estado === 'enviando' ? 'Enviando…' : 'Enviar'}</button>
              </>
            )}
          </form>
        </div>,
        document.body
      )}
    </>
  );
}

const CLAVE_CERRADO = 'minijuegos-anuncio-cerrado';
export function AnuncioPortada() {
  const portada = usePortada();
  const a = portada?.anuncio;
  const [cerrado, setCerrado] = useState(() => { try { return Number(localStorage.getItem(CLAVE_CERRADO)) || 0; } catch { return 0; } });
  if (!a || cerrado === a.id) return null;
  const quitar = () => { try { localStorage.setItem(CLAVE_CERRADO, String(a.id)); } catch { /* nada */ } setCerrado(a.id); };
  const icono = a.tipo === 'aviso' ? '⚠️' : a.tipo === 'novedad' ? '✨' : '📢';
  return (
    <div className={`sop-anuncio ${a.tipo}`} role="status">
      <span className="sop-anuncio-ico" aria-hidden="true">{icono}</span>
      <p>{a.texto}{a.enlace && <> <Link to={a.enlace}>Ver →</Link></>}</p>
      <button type="button" onClick={quitar} aria-label="Cerrar el aviso">✕</button>
    </div>
  );
}

export function AvisoMantenimiento({ nombre, esAdmin, onEntrar }) {
  return (
    <div className="sop-mant">
      <span aria-hidden="true">🛠️</span>
      <h2>{nombre || 'Este juego'} está en mantenimiento</h2>
      <p>Lo estamos arreglando para que vuelva cuanto antes. Mientras tanto, prueba otro juego de la portada.</p>
      <Link to="/" className="button">Ir a la portada</Link>
      {esAdmin && <button type="button" className="button secondary" onClick={onEntrar}>🛡️ Entrar igualmente (administrador)</button>}
    </div>
  );
}
