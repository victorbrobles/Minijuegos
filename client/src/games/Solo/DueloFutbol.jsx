// client/src/games/Solo/DueloFutbol.jsx
// «Más o menos fútbol» (1 jugador): dos futbolistas y una pregunta (¿quién ha jugado en más clubes?, ¿quién es
// mayor?, ¿quién vale más?…). 10 segundos por duelo; cada acierto alarga la racha y los duelos se van igualando.
// El primer fallo acaba la partida.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, useRecord, Barra } from '../../components/UnJugador.jsx';
import { cargarSolo, useCuenta, Cargando } from './comun.jsx';
import './Solo.css';

const ID = 'duelofutbol';
const SEGUNDOS = 10;

export default function DueloFutbol() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada');
  const [error, setError] = useState('');
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [duelos, setDuelos] = useState([]);
  const [i, setI] = useState(0);
  const [elegido, setElegido] = useState(null);
  const [racha, setRacha] = useState(0);
  const cuenta = useCuenta(fase === 'jugando' && elegido === null, () => elegir(''));

  const empezar = async () => {
    setFase('cargando'); setError('');
    try {
      const d = await cargarSolo(ID);
      setDuelos(d.duelos); setI(0); setRacha(0); setElegido(null); cuenta.empezar(SEGUNDOS); setFase('jugando');
    } catch (e) { setError(e.message); }
  };
  function elegir(lado) {
    if (elegido !== null) return;
    setElegido(lado);
    const d = duelos[i];
    if (lado === d.gana) {
      const r = racha + 1; setRacha(r);
      setTimeout(() => {
        if (i + 1 >= duelos.length) { setNuevoRecord(registrar(r)); setFase('fin'); return; }
        setI(i + 1); setElegido(null); cuenta.empezar(SEGUNDOS);
      }, 1300);
    } else {
      setTimeout(() => { setNuevoRecord(racha > 0 && registrar(racha)); setFase('fin'); }, 2000);
    }
  }

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Salen <b>dos futbolistas</b> y una pregunta: ¿quién ha jugado en más clubes?, ¿quién debutó antes?, ¿quién es mayor?, ¿quién vale más?…</p>
      <p>Toca al que creas. Tienes <b>{SEGUNDOS} segundos</b>.</p>
      <p>Cada acierto suma uno a tu <b>racha</b> y los duelos se van igualando. El primer fallo acaba la partida.</p>
      <p>Los datos de edad, media y valor son los de la temporada 2025/26 de «Director Deportivo».</p>
    </AyudaUnJugador>
  );
  if (fase === 'portada') return <><PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record} textoRecord={(r) => `racha de ${r.valor}`} />{ayudaModal}</>;
  if (fase === 'cargando') return <Cargando error={error} onReintentar={empezar} />;
  if (fase === 'fin') {
    return (
      <FinUnJugador icono="flame" etiqueta={elegido === '' ? 'Se acabó el tiempo' : 'Fallaste'} titulo={racha >= 15 ? '¡Enciclopedia del fútbol!' : racha >= 7 ? '¡Gran racha!' : 'Fin de la racha'}
        puntos={racha} unidad={racha === 1 ? 'acierto seguido' : 'aciertos seguidos'} nuevoRecord={nuevoRecord} record={record}
        textoRecord={(r) => `racha de ${r.valor}`} exito={racha > 0} onRepetir={empezar} onMenu={() => setFase('portada')} />
    );
  }

  const d = duelos[i];
  const carta = (lado) => {
    const x = d[lado];
    const clase = elegido === null ? '' : lado === d.gana ? ' bien' : lado === elegido ? ' mal' : ' apagada';
    return (
      <button type="button" className={`df-carta${clase}`} disabled={elegido !== null} onClick={() => elegir(lado)}>
        <span className="df-avatar">{x.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
        <b>{x.nombre}</b>
        <small>{x.sub}</small>
        {elegido !== null && <em>{x.valor}</em>}
      </button>
    );
  };
  return (
    <div className="qq-en-partida">
      <section className="game uj-escena rto-escena">
        <CabeceraPartida onSalir={() => setSalir(true)} chips={[<>🔥 Racha {racha}</>, record && <><Icon name="trophy" size={14} /> {record.valor}</>]}>
          <h2 className="df-pregunta" key={i}>{d.pregunta}</h2>
        </CabeceraPartida>
        <div className="rto-juego">
          {elegido === null && <Barra valor={cuenta.restante / SEGUNDOS} etiqueta={`${Math.ceil(cuenta.restante)} s`} invertida />}
          <div className="df-duelo" key={i}>
            {carta('a')}
            <span className="df-vs">VS</span>
            {carta('b')}
          </div>
        </div>
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
