// client/src/reto/Banner.jsx — acceso al reto diario desde la portada, con su estado para el jugador
import React from 'react';
import { Link } from 'react-router-dom';
import { useRetoHoy } from './hoy.js';
// Antes la página del reto se importaba aquí entera; ahora solo su CSS, en el mismo orden (no cambia el aspecto)
import '../components/Perfil.css';
import '../components/Identidad.css';
import '../components/SalonFama.css';
import '../components/MenuJuego.css';
import '../components/UnJugador.css';
import '../games/Solo/Solo.css';
import '../games/Crimen/Crimen.css';
import './Reto.css';

export function BannerReto() {
  const [reto] = useRetoHoy();
  if (!reto) return null;
  const i = reto.intento;
  const estado = !i ? null : i.estado === 'superado' ? ['ok', '✅ Superado'] : ['mal', '❌ Fallado'];
  return (
    <Link to="/reto" className="rto-banner">
      <span className="rto-banner-emoji">{reto.emoji}</span>
      <span className="rto-banner-textos"><small>Reto diario</small><b>{reto.titulo}</b></span>
      <span className={`rto-banner-estado ${estado ? estado[0] : ''}`}>{estado ? estado[1] : '¡Juega!'}</span>
    </Link>
  );
}
