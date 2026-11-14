// client/src/games/Solo/Escalera.jsx
// «La Escalera» (1 jugador): 15 preguntas de dificultad creciente. Cada escalón vale más; en el 5 y el 10 hay
// suelo seguro. Puedes plantarte cuando quieras y quedarte lo ganado; si fallas, bajas al último suelo.
// Tres comodines de un solo uso: 50/50, cambiar de pregunta y «lo que diría el público».
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, useRecord, Barra } from '../../components/UnJugador.jsx';
import { cargarSolo, useCuenta, Cargando } from './comun.jsx';
import '../../reto/Reto.css';
import './Solo.css';

const ID = 'escalera';
export const PREMIOS = [10, 20, 30, 50, 100, 150, 250, 400, 600, 1000, 1500, 2500, 4000, 6000, 10000];
const SEGUROS = [4, 9];
const SEGUNDOS = 30;
const LETRAS = ['A', 'B', 'C', 'D'];
const fmt = (n) => n.toLocaleString('es-ES');
const suelo = (k) => { const s = SEGUROS.filter((i) => i < k); return s.length ? PREMIOS[s.at(-1)] : 0; };

/** Votos simulados del público: aciertan más cuanto más fácil es la pregunta. */
function votosPublico(q) {
  const acierto = [0.72, 0.62, 0.5, 0.42, 0.34][q.nivel - 1] + Math.random() * 0.15;
  const resto = q.opciones.filter((o) => o !== q.correcta).map(() => Math.random());
  const suma = resto.reduce((a, b) => a + b, 0);
  let i = 0;
  const votos = q.opciones.map((o) => (o === q.correcta ? acierto : ((1 - acierto) * resto[i++]) / suma));
  // A veces el público se equivoca en las difíciles
  if (q.nivel >= 4 && Math.random() < 0.25) { const j = votos.findIndex((_, x) => q.opciones[x] !== q.correcta); [votos[j], votos[q.opciones.indexOf(q.correcta)]] = [votos[q.opciones.indexOf(q.correcta)], votos[j]]; }
  return votos.map((v) => Math.round(v * 100));
}

export default function Escalera() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada');
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [k, setK] = useState(0);
  const [q, setQ] = useState(null);
  const [elegida, setElegida] = useState(null);
  const [comodines, setComodines] = useState({ mitad: true, cambio: true, publico: true });
  const [quitadas, setQuitadas] = useState([]);
  const [votos, setVotos] = useState(null);
  const [final, setFinal] = useState(null); // { puntos, motivo }
  const cuenta = useCuenta(fase === 'jugando' && elegida === null, () => responder(''));

  const empezar = async () => {
    setFase('cargando'); setError('');
    try {
      const d = await cargarSolo(ID);
      setDatos(d); setK(0); setQ(d.preguntas[0]); setElegida(null); setQuitadas([]); setVotos(null);
      setComodines({ mitad: true, cambio: true, publico: true }); setFinal(null);
      cuenta.empezar(SEGUNDOS); setFase('jugando');
    } catch (e) { setError(e.message); }
  };
  const terminar = (puntos, motivo) => {
    setFinal({ puntos, motivo }); setNuevoRecord(puntos > 0 && registrar(puntos)); setFase('fin');
  };
  function responder(o) {
    if (elegida !== null) return;
    setElegida(o);
    if (o !== q.correcta) setTimeout(() => terminar(suelo(k), o === '' ? 'Se acabó el tiempo' : 'Respuesta equivocada'), 1800);
    else if (k === PREMIOS.length - 1) setTimeout(() => terminar(PREMIOS[k], '¡Has llegado a lo más alto!'), 1500);
  }
  const siguiente = () => {
    const n = k + 1; setK(n); setQ(datos.preguntas[n]); setElegida(null); setQuitadas([]); setVotos(null); cuenta.empezar(SEGUNDOS);
  };
  const usar = (c) => {
    if (!comodines[c] || elegida !== null) return;
    setComodines((x) => ({ ...x, [c]: false }));
    if (c === 'mitad') setQuitadas(q.opciones.filter((o) => o !== q.correcta).sort(() => Math.random() - 0.5).slice(0, 2));
    if (c === 'publico') setVotos(votosPublico(q));
    if (c === 'cambio') { setQ(datos.reservas[q.nivel - 1]); setQuitadas([]); setVotos(null); cuenta.empezar(SEGUNDOS); }
  };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Responde <b>15 preguntas</b> cada vez más difíciles. Cada escalón vale más puntos, hasta <b>10.000</b>.</p>
      <p>🛟 Las preguntas 5 y 10 son <b>suelo seguro</b>: si fallas después, te quedas con lo de ese escalón. Si fallas antes, te vas con 0.</p>
      <p>🛑 Puedes <b>plantarte</b> antes de responder y quedarte con lo que llevas.</p>
      <p>Comodines (uno de cada): <b>50/50</b> quita dos respuestas falsas, <b>🔄 Cambiar</b> pone otra pregunta del mismo nivel y <b>👥 Público</b> muestra lo que votaría la gente (que no siempre acierta).</p>
      <p>Tienes {SEGUNDOS} segundos por pregunta.</p>
    </AyudaUnJugador>
  );

  if (fase === 'portada' || fase === 'cargando') {
    if (fase === 'cargando') return <Cargando error={error} onReintentar={empezar} />;
    return <><PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record} textoRecord={(r) => `${fmt(r.valor)} puntos`} />{ayudaModal}</>;
  }
  if (fase === 'fin') {
    return (
      <FinUnJugador icono="trophy" etiqueta={final.motivo} titulo={final.puntos >= 10000 ? '¡Escalera completa!' : final.puntos >= 1000 ? '¡Gran subida!' : final.puntos > 0 ? 'Algo es algo' : 'Te caíste de la escalera'}
        puntos={fmt(final.puntos)} unidad="puntos" nuevoRecord={nuevoRecord} record={record} textoRecord={(r) => `${fmt(r.valor)} puntos`}
        exito={final.puntos > 0} onRepetir={empezar} onMenu={() => setFase('portada')}>
        <p className="uj-mini">Llegaste a la pregunta {k + 1} de 15.</p>
      </FinUnJugador>
    );
  }

  const acierto = elegida !== null && elegida === q.correcta;
  return (
    <div className="qq-en-partida">
      <section className="game uj-escena rto-escena">
        <CabeceraPartida onSalir={() => setSalir(true)} chips={[
          <><Icon name="star" size={14} /> Pregunta {k + 1}/15</>,
          <>🎯 Por {fmt(PREMIOS[k])}</>,
          <>🛟 {fmt(suelo(k + (acierto ? 1 : 0)))}</>
        ]} />
        <div className="esc-escalera" aria-hidden="true">
          {PREMIOS.map((p, i) => <span key={p} className={`${i < k || (i === k && acierto) ? 'hecho' : ''}${i === k ? ' actual' : ''}${SEGUROS.includes(i) ? ' seguro' : ''}`} />)}
        </div>
        <div className="rto-juego">
          {elegida === null && <Barra valor={cuenta.restante / SEGUNDOS} etiqueta={`${Math.ceil(cuenta.restante)} s`} invertida />}
          <div className="uj-tarjeta rto-pregunta">
            <span className="rto-etiqueta">{q.cat} · nivel {q.nivel}</span>
            <h2>{q.p}</h2>
            <div className="rto-opciones">
              {q.opciones.map((o, i) => {
                const fuera = quitadas.includes(o);
                const clase = elegida === null ? (fuera ? ' apagada' : '') : o === q.correcta ? ' bien' : o === elegida ? ' mal' : ' apagada';
                return (
                  <button key={o} type="button" className={`rto-opcion${clase}`} disabled={elegida !== null || fuera} onClick={() => responder(o)}>
                    <i>{LETRAS[i]}</i><span>{fuera ? '—' : o}</span>{votos && !fuera && <small>👥 {votos[i]} %</small>}
                  </button>
                );
              })}
            </div>
            {elegida !== null && <p className={`rto-veredicto ${acierto ? 'bien' : 'mal'}`}>{acierto ? `¡Correcto! Llevas ${fmt(PREMIOS[k])} puntos.` : elegida === '' ? `Se acabó el tiempo. Era «${q.correcta}».` : `No. Era «${q.correcta}».`}</p>}
          </div>
          {elegida === null && (
            <div className="esc-comodines">
              <button type="button" disabled={!comodines.mitad} onClick={() => usar('mitad')}>50/50</button>
              <button type="button" disabled={!comodines.cambio} onClick={() => usar('cambio')}>🔄 Cambiar</button>
              <button type="button" disabled={!comodines.publico} onClick={() => usar('publico')}>👥 Público</button>
            </div>
          )}
          {elegida === null && k > 0 && <button type="button" className="uj-boton secundario" onClick={() => terminar(PREMIOS[k - 1], 'Te plantaste')}>🛑 Me planto con {fmt(PREMIOS[k - 1])} puntos</button>}
          {acierto && k < PREMIOS.length - 1 && <button type="button" className="uj-boton grande" onClick={siguiente}><Icon name="forward" size={20} /> Subir a la pregunta {k + 2} ({fmt(PREMIOS[k + 1])})</button>}
        </div>
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
