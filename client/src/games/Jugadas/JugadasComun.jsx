// client/src/games/Jugadas/JugadasComun.jsx
import React, { useState } from 'react';
import './Jugadas.css';
import '../Adivina/Adivina.css';

// Con `abierto`/`onCerrar` se controla desde fuera (botón "?" de los menús unificados) y no pinta botón propio.
export function AyudaJugadas({ online = false, abierto: abiertoExterno, onCerrar }) {
  const [abiertoInterno, setAbiertoInterno] = useState(false);
  const controlado = abiertoExterno !== undefined;
  const abierto = controlado ? abiertoExterno : abiertoInterno;
  const setAbierto = (v) => (controlado ? (!v && onCerrar?.()) : setAbiertoInterno(v));

  return (
    <>
      {!controlado && <button
        type="button"
        className={online ? 'btn-ayuda-flotante' : 'aprox-btn-ayuda'}
        onClick={() => setAbierto(true)}
        title="Reglas del juego"
      >
        <span className={online ? 'btn-ayuda-flotante-signo' : 'aprox-btn-ayuda-signo'}>?</span>
      </button>}

      {abierto && (
        <div className="rg-modal-fondo" onClick={() => setAbierto(false)}>
          <div className="rg-modal aprox-modal-ayuda" onClick={(e) => e.stopPropagation()}>
            <div className="aprox-modal-header">
              {online && <span className="aprox-modal-signo-title">?</span>}
              <h3>¿Cómo se juega a Jugadas Icónicas?</h3>
            </div>

            <div className="aprox-modal-cuerpo">
              <p>
                <strong>Jugadas Icónicas</strong> recrea en una pizarra táctica 2D grandes goles y jugadas históricas del fútbol mundial con las fichas y dorsales de sus protagonistas.
              </p>

              <ul>
                <li>
                  <strong>Turnos secuenciales:</strong> Se juega de 2 a 12 jugadores manteniendo el orden de inscripción durante <strong>3 rondas por jugador</strong>.
                </li>
                <li>
                  <strong>60 segundos en bucle:</strong> En tu turno verás la recreación repetirse en bucle mientras corre el cronómetro de 60 segundos.
                </li>
                <li>
                  <strong>Puntuación por velocidad:</strong> Si aciertas la jugada (por ejemplo, <em>«Maradona a Inglaterra»</em> o <em>«Iniesta a Holanda»</em>), sumas <strong>tantos puntos como segundos queden en el reloj</strong>.
                </li>
                <li>
                  <strong>Un único rebote:</strong> Si fallas tu respuesta, pulsas <strong>Pasar</strong> o se agota tu tiempo, el turno rebota exclusivamente al <strong>siguiente jugador</strong>.
                </li>
                <li>
                  <strong>Finalizar al acabar vuelta:</strong> Al completarse una vuelta entera de todos los jugadores, el anfitrión puede dar por finalizado el partido o continuar hasta completar las 3 vueltas.
                </li>
              </ul>

              <div className="aprox-tabla-puntos">
                <div className="aprox-puntos-fila acierto">
                  <span>⏱️ Acertar en tu turno o en el rebote</span>
                  <strong>+Segundos restantes</strong>
                </div>
                <div className="aprox-puntos-fila intermedia" style={{ background: '#fef3c7', color: '#92400e' }}>
                  <span>↩️ Fallar o pulsar Pasar</span>
                  <strong>Rebote al siguiente jugador</strong>
                </div>
              </div>
            </div>

            <div className="rg-modal-acciones">
              <button className="big full" onClick={() => setAbierto(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}