// client/src/games/Solo/Escudo.jsx
// «Escudo borroso» (1 jugador): 10 escudos que empiezan muy borrosos y en gris y se van aclarando en 15 s.
// Elige el club entre cuatro: cuanto antes aciertes, más puntos (hasta 100 por escudo).
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, useRecord } from '../../components/UnJugador.jsx';
import { cargarSolo, useCuenta, Cargando } from './comun.jsx';
import '../../reto/Reto.css';
import './Solo.css';

const ID = 'escudo';
const SEGUNDOS = 15;
const LETRAS = ['A', 'B', 'C', 'D'];

export default function Escudo() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada');
  const [error, setError] = useState('');
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [rondas, setRondas] = useState([]);
  const [k, setK] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [ganados, setGanados] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [cargada, setCargada] = useState(false);
  const cuenta = useCuenta(fase === 'jugando' && elegida === null && cargada, () => responder(''));

  const empezar = async () => {
    setFase('cargando'); setError('');
    try {
      const d = await cargarSolo(ID);
      setRondas(d.rondas); setK(0); setPuntos(0); setAciertos(0); setElegida(null); setCargada(false); setFase('jugando');
    } catch (e) { setError(e.message); }
  };
  function responder(o) {
    if (elegida !== null) return;
    const r = rondas[k];
    setElegida(o);
    const pts = o === r.correcta ? Math.max(10, Math.round((cuenta.restante / SEGUNDOS) * 100)) : 0;
    setGanados(pts); setPuntos((p) => p + pts); if (pts) setAciertos((a) => a + 1);
  }
  const siguiente = () => {
    if (k + 1 >= rondas.length) { setNuevoRecord(puntos > 0 && registrar(puntos)); setFase('fin'); return; }
    setK(k + 1); setElegida(null); setCargada(false);
  };
  const alCargar = () => { setCargada(true); cuenta.empezar(SEGUNDOS); };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Verás <b>10 escudos</b> de clubes muy borrosos y en blanco y negro. Poco a poco se van aclarando y cogiendo color.</p>
      <p>Elige el club entre las cuatro opciones: cuanto antes aciertes, más puntos (hasta <b>100</b> por escudo). Si fallas, 0.</p>
      <p>Tienes {SEGUNDOS} segundos por escudo.</p>
    </AyudaUnJugador>
  );
  if (fase === 'portada') return <><PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record} textoRecord={(r) => `${r.valor} puntos`} />{ayudaModal}</>;
  if (fase === 'cargando') return <Cargando error={error} onReintentar={empezar} />;
  if (fase === 'fin') {
    return (
      <FinUnJugador icono="shield" etiqueta={`${aciertos} de 10 escudos`} titulo={puntos >= 700 ? '¡Ojo de halcón!' : puntos >= 400 ? '¡Muy bien!' : 'Fin de la partida'}
        puntos={puntos} unidad="puntos" nuevoRecord={nuevoRecord} record={record} textoRecord={(r) => `${r.valor} puntos`}
        exito={puntos > 0} onRepetir={empezar} onMenu={() => setFase('portada')} />
    );
  }

  const r = rondas[k];
  const t = elegida !== null ? 0 : cargada ? cuenta.restante / SEGUNDOS : 1; // 1 = muy borroso, 0 = nítido
  return (
    <div className="qq-en-partida">
      <section className="game uj-escena rto-escena">
        <CabeceraPartida onSalir={() => setSalir(true)} chips={[<><Icon name="star" size={14} /> {puntos}</>, <>🛡️ {k + 1}/10</>]} />
        <div className="rto-juego">
          <div className="esd-marco">
            <img key={r.logo} src={r.logo} alt="Escudo" referrerPolicy="no-referrer" onLoad={alCargar} onError={() => { setCargada(true); setElegida('—'); }}
              style={{ filter: `blur(${(t * 22).toFixed(1)}px) grayscale(${Math.min(1, t * 1.6).toFixed(2)})`, transform: `scale(${1 + t * 0.25})` }} />
            {elegida === null && cargada && <span className="esd-tiempo">{Math.ceil(cuenta.restante)} s · {Math.max(10, Math.round(t * 100))} pts</span>}
            {!cargada && <span className="esd-tiempo">Cargando escudo…</span>}
          </div>
          <div className="rto-opciones">
            {r.opciones.map((o, i) => {
              const clase = elegida === null ? '' : o === r.correcta ? ' bien' : o === elegida ? ' mal' : ' apagada';
              return <button key={o} type="button" className={`rto-opcion${clase}`} disabled={elegida !== null || !cargada} onClick={() => responder(o)}><i>{LETRAS[i]}</i><span>{o}</span></button>;
            })}
          </div>
          {elegida !== null && (
            <>
              <p className={`rto-veredicto sl-blanco`}>{elegida === '—' ? 'No se pudo cargar este escudo (no cuenta).' : ganados ? `¡Correcto! +${ganados}` : `Era el ${r.correcta}.`}</p>
              <button type="button" className="uj-boton grande" onClick={siguiente}><Icon name="forward" size={20} /> {k + 1 >= rondas.length ? 'Ver resultado' : 'Siguiente escudo'}</button>
            </>
          )}
        </div>
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
