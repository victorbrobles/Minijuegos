// client/src/components/AvisoLogros.jsx
// Aviso flotante «🏅 ¡Logro desbloqueado!» (escucha el evento «minijuegos-logro»).
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { prepararLogros } from '../lib/logros.js';

export default function AvisoLogros() {
  const [cola, setCola] = useState([]);
  useEffect(() => {
    const f = (e) => setCola((c) => [...c, ...(e.detail || [])]);
    window.addEventListener('minijuegos-logro', f);
    prepararLogros();
    // Para probarlo (o enseñarlo) desde la consola: window.dispatchEvent(new CustomEvent('minijuegos-logro', { detail: [...] }))
    return () => window.removeEventListener('minijuegos-logro', f);
  }, []);
  useEffect(() => {
    if (!cola.length) return undefined;
    const t = setTimeout(() => setCola((c) => c.slice(1)), 4500);
    return () => clearTimeout(t);
  }, [cola]);
  const l = cola[0];
  if (!l) return null;
  return (
    <Link to="/estadisticas" className="lg-aviso" key={l.id} onClick={() => setCola((c) => c.slice(1))}>
      <span className="lg-aviso-emoji">{l.emoji}</span>
      <span><small>🏅 ¡Logro desbloqueado!</small><b>{l.nombre}</b><em>{l.desc}</em></span>
    </Link>
  );
}
