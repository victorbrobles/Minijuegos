// client/src/games/GeoQuiz/GeoQuizConfig.jsx
// Configuración de la partida: modo, categoría (modo Especialista) y rondas.
// Se usa en el selector de jugadores (local) y en la sala de espera (online).
import React from 'react';
import Icon from '../../components/Icon.jsx';
import { MODOS } from './engine.js';

export const INFO_MODOS = [
  { id: 'geomix', icono: 'dice', texto: 'Todas las categorías mezcladas' },
  { id: 'especialista', icono: 'target', texto: 'Una sola categoría' },
  { id: 'contrarreloj', icono: 'stopwatch', texto: '60 s por turno, preguntas rápidas' },
  { id: 'supervivencia', icono: 'heart', texto: '3 vidas, gana el último en pie' }
];

export function configPorDefecto() {
  return { modo: 'geomix', rondas: MODOS.geomix.rondasPorDefecto, categoria: 'paises' };
}

export function resumenConfig(config, categorias = []) {
  const modo = MODOS[config.modo]?.nombre || config.modo;
  const partes = [modo];
  if (config.modo === 'especialista') partes.push(categorias.find((c) => c.id === config.categoria)?.nombre || '');
  if (config.rondas) {
    const unidad = config.modo === 'contrarreloj' ? (config.rondas === 1 ? 'turno' : 'turnos') : (config.rondas === 1 ? 'pregunta' : 'preguntas');
    partes.push(`${config.rondas} ${unidad} por jugador`);
  }
  return partes.filter(Boolean).join(' · ');
}

export default function GeoQuizConfig({ config, onCambiar, categorias = [], soloLectura = false }) {
  const cambiar = (cambios) => {
    if (soloLectura) return;
    const nuevo = { ...config, ...cambios };
    if (cambios.modo) {
      const info = MODOS[cambios.modo];
      nuevo.rondas = info.rondas ? (info.rondas.includes(config.rondas) ? config.rondas : info.rondasPorDefecto) : null;
    }
    onCambiar(nuevo);
  };
  const info = MODOS[config.modo] || MODOS.geomix;

  return (
    <div className="gq-config">
      <span className="qq-label-destacado">Modo de juego</span>
      <div className="gq-modos">
        {INFO_MODOS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`gq-modo${config.modo === m.id ? ' activo' : ''}`}
            onClick={() => cambiar({ modo: m.id })}
            disabled={soloLectura}
            aria-pressed={config.modo === m.id}
          >
            <span className="gq-modo-icono"><Icon name={m.icono} size={22} /></span>
            <span className="gq-modo-nombre">{MODOS[m.id].nombre}</span>
            <span className="gq-modo-texto">{m.texto}</span>
          </button>
        ))}
      </div>

      {config.modo === 'especialista' && (
        <>
          <span className="qq-label-destacado" style={{ marginTop: '1rem' }}>Categoría</span>
          <div className="gq-categorias">
            {categorias.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`gq-categoria${config.categoria === c.id ? ' activo' : ''}`}
                onClick={() => cambiar({ categoria: c.id })}
                disabled={soloLectura}
                aria-pressed={config.categoria === c.id}
              >
                <Icon name={c.icono || 'globe'} size={18} />
                <span>{c.nombre}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {info.rondas && (
        <>
          <span className="qq-label-destacado" style={{ marginTop: '1rem' }}>
            {config.modo === 'contrarreloj' ? 'Turnos por jugador' : 'Preguntas por jugador'}
          </span>
          <div className="qq-chips">
            {info.rondas.map((r) => (
              <button
                key={r}
                type="button"
                className={`qq-chip ${config.rondas === r ? 'activo' : ''}`}
                onClick={() => cambiar({ rondas: r })}
                disabled={soloLectura}
              >
                {r}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
