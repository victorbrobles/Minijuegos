// client/src/games/Habilidad/Prueba.jsx
// Solo en desarrollo: /prueba-habilidad/<id> juega un minijuego suelto (para probarlos de uno en uno).
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { POR_ID, MINIJUEGOS } from './minijuegos/index.js';
import { Minijuego, formatear } from './comun.jsx';
import './Habilidad.css';

export default function Prueba() {
  const { id } = useParams();
  const [res, setRes] = useState(null);
  const juego = POR_ID[id] || MINIJUEGOS[0];
  return (
    <div className="game-shell" style={{ padding: '0.5rem' }}>
      <Minijuego juego={juego} semilla={12345} onFin={(v) => setRes(v)} />
      <p id="resultado" style={{ color: '#fff' }}>{res == null ? '' : formatear(juego, res)}</p>
    </div>
  );
}
