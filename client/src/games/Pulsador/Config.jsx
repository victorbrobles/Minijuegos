// client/src/games/Pulsador/Config.jsx
// Opciones de la partida (sala de espera online y configuración en un dispositivo).
import React from 'react';
import { BloqueConfig } from '../../components/MenuJuego.jsx';
import { Pildoras, opcionesRondas } from './Vistas.jsx';
import { MODOS_ADIVINA, EPOCAS_ADIVINA } from './juegos.js';

/** onCambiar(parcial) o null si solo se puede mirar. */
export default function ConfigJuego({ juego, config, onCambiar }) {
  const cambiar = onCambiar ? (clave) => (valor) => onCambiar({ [clave]: valor }) : () => null;
  return (
    <>
      {config.modo && (
        <BloqueConfig titulo="¿Qué adivinamos?">
          <Pildoras opciones={MODOS_ADIVINA} valor={config.modo} onCambiar={onCambiar && cambiar('modo')} />
        </BloqueConfig>
      )}
      {config.modo === 'canciones' && (
        <BloqueConfig titulo="Canciones">
          <Pildoras opciones={EPOCAS_ADIVINA} valor={config.epoca} onCambiar={onCambiar && cambiar('epoca')} />
        </BloqueConfig>
      )}
      <BloqueConfig titulo={`Número de ${juego.unidad}`}>
        <Pildoras opciones={opcionesRondas(juego.unidad, juego.opcionesRondas)} valor={config.rondas} onCambiar={onCambiar && cambiar('rondas')} />
      </BloqueConfig>
    </>
  );
}
