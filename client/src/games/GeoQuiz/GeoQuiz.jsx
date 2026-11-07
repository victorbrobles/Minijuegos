// client/src/games/GeoQuiz/GeoQuiz.jsx
// Punto de entrada: modo online (por defecto, con el menú común) o un solo dispositivo.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GeoQuizLocal from './GeoQuizLocal.jsx';
import GeoQuizOnline from './GeoQuizOnline.jsx';
import './GeoQuiz.css';

export default function GeoQuiz({ onExit }) {
  const [modo, setModo] = useState('online');
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const navigate = useNavigate();

  const irAPortada = () => {
    if (typeof onExit === 'function') onExit();
    else {
      try {
        navigate('/');
      } catch {
        window.location.href = '/';
      }
    }
  };

  return (
    <>
      {modo === 'local' ? (
        <GeoQuizLocal onVolver={() => setModo('online')} onExit={irAPortada} onAbrirAyuda={() => setMostrarAyuda(true)} />
      ) : (
        <GeoQuizOnline onLocal={() => setModo('local')} onSalir={irAPortada} onAbrirAyuda={() => setMostrarAyuda(true)} />
      )}

      {mostrarAyuda && (
        <div className="rg-modal-fondo" onClick={() => setMostrarAyuda(false)}>
          <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="aprox-modal-header">
              <span className="aprox-modal-signo-title">?</span>
              <h3>¿Cómo se juega a GeoQuiz?</h3>
            </div>

            <div className="aprox-modal-cuerpo">
              <p>
                Un quiz de geografía por turnos con pruebas de todo tipo: países, idiomas, capitales, ríos, banderas,
                monumentos, récords… Se sortea quién empieza y luego se juega en orden.
              </p>

              <p><strong>1. Modos de juego</strong></p>
              <ul>
                <li><strong>GeoMix:</strong> preguntas de todas las categorías mezcladas.</li>
                <li><strong>Especialista:</strong> todas las preguntas de una sola categoría.</li>
                <li><strong>Contrarreloj:</strong> en tu turno tienes 60 s para acertar tantas preguntas rápidas como puedas.</li>
                <li><strong>Supervivencia:</strong> 3 vidas; cada fallo quita una. Gana el último que siga en pie.</li>
              </ul>

              <p><strong>2. Tipos de prueba y puntos</strong></p>
              <div className="aprox-tabla-puntos">
                <div className="aprox-puntos-fila acierto"><span>✍️ Respuesta única</span><strong>+2 puntos</strong></div>
                <div className="aprox-puntos-fila intermedia" style={{ background: '#e0f2fe', color: '#075985' }}><span>🔘 Test de opciones</span><strong>+1 punto</strong></div>
                <div className="aprox-puntos-fila intermedia" style={{ background: '#dcfce7', color: '#166534' }}><span>📝 Enumerar</span><strong>+1 por cada acierto</strong></div>
                <div className="aprox-puntos-fila intermedia" style={{ background: '#fef3c7', color: '#92400e' }}><span>🕵️ Pistas</span><strong>5 a 1 según las pistas usadas</strong></div>
                <div className="aprox-puntos-fila intermedia" style={{ background: '#f3e8ff', color: '#6b21a8' }}><span>↕️ Ordenar</span><strong>+1 por cada posición correcta</strong></div>
                <div className="aprox-puntos-fila intermedia" style={{ background: '#ffe4e6', color: '#9f1239' }}><span>🔢 Aproximación</span><strong>3, 2 o 1 según lo cerca</strong></div>
              </div>

              <p><strong>3. Consejos</strong></p>
              <ul>
                <li>No hace falta poner tildes ni mayúsculas, y se perdonan pequeñas erratas.</li>
                <li>En «Enumerar» escribe los elementos de uno en uno y pulsa Intro tras cada uno.</li>
                <li>En «Pistas», si fallas se descubre otra pista, pero cada pista resta un punto.</li>
                <li>En Supervivencia, enumerar cuenta como acierto con 3 elementos, ordenar con 3 posiciones y la aproximación si te desvías menos de un 10%.</li>
              </ul>
            </div>

            <button type="button" className="big full qq-btn-principal" onClick={() => setMostrarAyuda(false)}>
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
