// client/src/games/Ovejas/Ovejas.jsx
// Cuenta Ovejas — pasa una manada a toda prisa (con cerdos, cabras y arbustos que tapan).
// Al final te preguntan cuántos animales de un tipo han pasado. ¡Cuenta rápido!
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import {
  PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, useRecord
} from '../../components/UnJugador.jsx';
import { ANIMALES, generarRonda } from './motor.js';
import './Ovejas.css';

const ID = 'ovejas';
const VIDAS = 3;
const CARRILES = 5;

export default function Ovejas() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | listo | desfile | pregunta | resultado | fin
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nivel, setNivel] = useState(1);
  const [ronda, setRonda] = useState(null);
  const [vidas, setVidas] = useState(VIDAS);
  const [aciertos, setAciertos] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [clave, setClave] = useState(0);
  const [nuevoRecord, setNuevoRecord] = useState(false);

  const preparar = (n) => {
    setRonda(generarRonda(n));
    setElegida(null);
    setClave((k) => k + 1);
    setFase('listo');
  };

  const empezar = () => {
    setNivel(1);
    setVidas(VIDAS);
    setAciertos(0);
    setNuevoRecord(false);
    preparar(1);
  };

  useEffect(() => {
    if (fase === 'listo') {
      const id = setTimeout(() => setFase('desfile'), 1300);
      return () => clearTimeout(id);
    }
    if (fase === 'desfile') {
      const id = setTimeout(() => setFase('pregunta'), ronda.duracionTotal * 1000);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [fase, ronda]);

  const responder = (n) => {
    if (fase !== 'pregunta') return;
    setElegida(n);
    if (n === ronda.respuesta) {
      setAciertos((a) => a + 1);
      if (navigator.vibrate) navigator.vibrate(15);
    } else {
      setVidas((v) => v - 1);
      if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    }
    setFase('resultado');
  };

  const siguiente = () => {
    if (vidas <= 0) {
      setNuevoRecord(aciertos > 0 && registrar(aciertos));
      setFase('fin');
      return;
    }
    const n = elegida === ronda.respuesta ? nivel + 1 : nivel;
    setNivel(n);
    preparar(n);
  };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Una manada va a cruzar el prado a toda velocidad. <strong>Cuenta</strong> lo que pasa.</p>
      <ul>
        <li>Al terminar te preguntaremos cuántos animales de <strong>un tipo</strong> han pasado… y no sabrás cuál hasta el final.</li>
        <li>Con cada acierto la manada es más grande y más rápida, aparecen otros animales, arbustos que tapan y animales que van en sentido contrario.</li>
        <li>Si fallas pierdes una vida. Tienes 3.</li>
      </ul>
    </AyudaUnJugador>
  );

  if (fase === 'portada') {
    return (
      <div className="ov-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record}
          textoRecord={(r) => `${r.valor} ${r.valor === 1 ? 'ronda' : 'rondas'}`} />
        {ayudaModal}
      </div>
    );
  }

  if (fase === 'fin') {
    return (
      <div className="ov-contenedor">
        <FinUnJugador
          icono="eye"
          etiqueta="Te has quedado sin vidas"
          titulo={aciertos >= 12 ? '¡Pastor legendario!' : aciertos >= 6 ? '¡Buen ojo!' : 'Fin de la partida'}
          puntos={aciertos}
          unidad={aciertos === 1 ? 'ronda acertada' : 'rondas acertadas'}
          nuevoRecord={nuevoRecord}
          record={record}
          textoRecord={(r) => `${r.valor} rondas`}
          exito={aciertos > 0}
          onRepetir={empezar}
          onMenu={() => setFase('portada')}
        />
      </div>
    );
  }

  const animalPregunta = ANIMALES[ronda.pregunta];
  const resultado = fase === 'resultado';
  const ok = resultado && elegida === ronda.respuesta;

  return (
    <div className="ov-contenedor qq-en-partida">
      <section className="game uj-escena">
        <CabeceraPartida
          onSalir={() => setSalir(true)}
          chips={[
            <><Icon name="flag" size={14} /> Nivel {nivel}</>,
            <>{Array.from({ length: VIDAS }, (_, i) => (i < vidas ? '❤️' : '🖤')).join('')}</>
          ]}
          titulo={fase === 'listo' ? '¡Atento, que vienen!' : fase === 'desfile' ? '¡Cuenta!' : `¿${animalPregunta.cuantos} ${animalPregunta.nombre} han pasado?`}
        />

        <div className="ov-prado" key={clave}>
          {Array.from({ length: CARRILES }, (_, i) => <div key={i} className="ov-carril" style={{ top: `${(i / CARRILES) * 100}%`, height: `${100 / CARRILES}%` }} />)}
          {fase === 'desfile' && ronda.animales.map((a) => (
            <span
              key={a.id}
              className={`ov-animal${a.sentido < 0 ? ' izquierda' : ''}`}
              style={{
                top: `${((a.carril + 0.5) / CARRILES) * 100}%`,
                animationDuration: `${a.duracion}s`,
                animationDelay: `${a.retraso}s`
              }}
            >
              <span>{ANIMALES[a.tipo].emoji}</span>
            </span>
          ))}
          {ronda.arbustos.map((b, i) => (
            <span key={i} className="ov-arbusto" style={{ left: `${b.x}%`, top: `${((b.carril + 0.5) / CARRILES) * 100}%` }}>🌳</span>
          ))}
          {fase === 'listo' && <div className="ov-cartel">3… 2… 1…</div>}
          {(fase === 'pregunta' || resultado) && (
            <div className="ov-cartel pregunta">
              <span className="ov-grande">{animalPregunta.emoji}</span>
              {resultado && <span>Eran <strong>{ronda.respuesta}</strong></span>}
            </div>
          )}
        </div>

        {(fase === 'pregunta' || resultado) && (
          <div className="ov-opciones">
            {ronda.opciones.map((o) => {
              let clase = '';
              if (resultado) clase = o === ronda.respuesta ? ' correcta' : o === elegida ? ' incorrecta' : ' apagada';
              return (
                <button key={o} type="button" className={`ov-opcion${clase}`} onClick={() => responder(o)} disabled={resultado}>{o}</button>
              );
            })}
          </div>
        )}

        {resultado && (
          <div className="uj-acciones">
            <p className={`ov-veredicto ${ok ? 'ok' : 'mal'}`}>{ok ? '¡Bien contado!' : `Eran ${ronda.respuesta} ${animalPregunta.nombre}.`}</p>
            <button type="button" className="uj-boton grande" onClick={siguiente}>
              {vidas <= 0 ? <><Icon name="flagFinish" size={20} /> Ver resultado</> : <><Icon name="forward" size={20} /> {ok ? 'Siguiente manada' : 'Otra manada'}</>}
            </button>
          </div>
        )}
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
