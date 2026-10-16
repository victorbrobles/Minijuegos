import { useState } from 'react';
import SelectorCategoria from './SelectorCategoria.jsx';
import Partida from './Partida.jsx';

// undefined = eligiendo categoría · null = todas mezcladas · string = categoría concreta
export default function Siglas() {
  const [categoria, setCategoria] = useState(undefined);
  const [modalAyuda, setModalAyuda] = useState(false);

  if (categoria === undefined) {
    return (
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Botón flotante de ayuda */}
        <button
          type="button"
          className="btn-ayuda-flotante"
          onClick={() => setModalAyuda(true)}
          title="Reglas y sistema de puntuación"
        >
          <span className="btn-ayuda-flotante-signo">?</span>
        </button>

        {/* Modal explicativo */}
        {modalAyuda && (
          <div className="rg-modal-fondo" onClick={() => setModalAyuda(false)}>
            <div className="rg-modal modal-ayuda-juego" onClick={(e) => e.stopPropagation()}>
              <div className="modal-ayuda-header">
                <span className="modal-ayuda-signo-title">?</span>
                <h3>¿Cómo se juega a Siglas y Acrónimos?</h3>
              </div>

              <div className="modal-ayuda-cuerpo">
                <p><strong>1. Dinámica del juego:</strong></p>
                <ul>
                  <li>Elige una categoría temática de siglas o juega con todas mezcladas.</li>
                  <li>Aparecerá una sigla o acrónimo en pantalla (ej. <em>ADN</em>, <em>UNESCO</em>, <em>RAE</em>).</li>
                  <li>Dispones de un tiempo límite para escribir su significado exacto.</li>
                  <li><strong>¡Muerte súbita!</strong> Un solo fallo o dejar que el cronómetro llegue a cero terminará la partida inmediatamente.</li>
                </ul>

                <p><strong>2. Sistema de puntuación:</strong></p>
                <div className="tabla-ayuda-puntos">
                  <div className="fila-ayuda-puntos verde">
                    <span>✅ Cada sigla acertada</span>
                    <strong>+1 punto a tu racha consecutiva</strong>
                  </div>
                  <div className="fila-ayuda-puntos rojo">
                    <span>❌ Fallo o tiempo agotado</span>
                    <strong>Fin de la partida (se registra tu racha final)</strong>
                  </div>
                </div>
              </div>

              <div className="rg-modal-acciones">
                <button className="big full" onClick={() => setModalAyuda(false)}>
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        <SelectorCategoria onElegir={setCategoria} />
      </div>
    );
  }

  return (
    <Partida
      key={categoria ?? 'todas'}
      categoria={categoria}
      onCambiarCategoria={() => setCategoria(undefined)}
    />
  );
}