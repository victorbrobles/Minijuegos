// client/src/components/GameSheet.jsx
// Ficha del juego: hoja inferior en móvil, diálogo centrado en escritorio.
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { metaDe } from '../games/meta.js';

export default function GameSheet({ game, categorias = [], onClose }) {
  const navigate = useNavigate();
  const m = metaDe(game.id);
  const titulo = m?.titulo || game.name;
  const descripcion = m?.descripcion || game?.description || 'Sin descripción disponible.';

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previo;
    };
  }, [onClose]);

  return (
    <div className="gs-fondo" onClick={onClose}>
      <div
        className="gs-hoja"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        style={{ '--g1': m.colores[0], '--g2': m.colores[1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="gs-asa" aria-hidden="true" />
        <button type="button" className="gs-cerrar" onClick={onClose} aria-label="Cerrar">
          <Icon name="x" size={18} strokeWidth={2.6} />
        </button>

        <div className="gs-cabecera">
          {m?.imagen ? (
            <img className="gs-img" src={m.imagen} alt="" width="512" height="512" />
          ) : (
            <span className="gs-img gs-img-icono"><Icon name={m.icono} size={40} /></span>
          )}
          <div>
            <h2 className="gs-titulo">{titulo}</h2>
            {categorias.length > 0 && (
              <ul className="gs-cats">
                {categorias.map((c) => <li key={c}>{c}</li>)}
              </ul>
            )}
          </div>
        </div>

        <p className="gs-texto">{descripcion}</p>

        <button type="button" className="gs-jugar" onClick={() => navigate(`/juego/${game.id}`)}>
          <Icon name="play" size={20} /> Jugar ahora
        </button>
      </div>
    </div>
  );
}
