import Icon from './Icon.jsx';
import { metaDe } from '../games/meta.js';

// Cabecera de cada minijuego: icono + nombre + pequeña descripción
export default function GameIntro({ gameId, titulo }) {
  const m = metaDe(gameId);
  return (
    <div className="intro" style={{ '--g1': m.colores[0], '--g2': m.colores[1] }}>
      <div className="intro-icon"><Icon name={m.icono} size={40} strokeWidth={1.700} /></div>
      <div>
        <h1 className="intro-title">{titulo}</h1>
        <p className="intro-desc">{m.descripcion}</p>
      </div>
    </div>
  );
}
