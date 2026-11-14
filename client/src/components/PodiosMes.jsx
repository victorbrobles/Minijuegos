// client/src/components/PodiosMes.jsx
// Podios de la portada: los 3 que más partidas han jugado y los 3 que más han ganado en el mes actual.
import React from 'react';
import { Podio } from './SalonFama.jsx';
import { usePodiosMes } from '../lib/registros.js';
import './SalonFama.css';

export default function PodiosMes() {
  const datos = usePodiosMes();
  if (!datos) return null;
  const mes = new Date().toLocaleDateString('es-ES', { month: 'long', timeZone: 'Europe/Madrid' });
  return (
    <section className="slf-home" aria-label={`Podios de ${mes}`}>
      <h2 className="slf-home-titulo">🏆 Los mejores de {mes}</h2>
      <div className="slf-home-podios">
        <Podio titulo="Más partidas jugadas" sub={`en ${mes}`} icono="gamepad" filas={datos.partidas} unidad={['partida', 'partidas']} vacio="Aún nadie ha jugado este mes." />
        <Podio titulo="Más victorias" sub={`en ${mes}`} icono="crown" filas={datos.victorias} unidad={['victoria', 'victorias']} vacio="Aún nadie ha ganado una partida este mes." />
      </div>
    </section>
  );
}
