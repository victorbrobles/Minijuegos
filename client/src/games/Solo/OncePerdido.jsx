// client/src/games/Solo/OncePerdido.jsx
// «El once perdido» (1 jugador): 5 alineaciones históricas con 4 titulares ocultos. Escribe sus nombres
// (vale el apellido). Cada hueco vale 3 puntos; las pistas (su club o país, y luego un dato) restan uno cada una.
// 90 segundos por alineación.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, useRecord, Barra, Aviso } from '../../components/UnJugador.jsx';
import { cargarSolo, useCuenta, Cargando, coincide } from './comun.jsx';
import './Solo.css';

const ID = 'onceperdido';
const SEGUNDOS = 90;
const LINEAS = ['DEL', 'MED', 'DEF', 'POR'];

export default function OncePerdido() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada');
  const [error, setError] = useState('');
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [rondas, setRondas] = useState([]);
  const [k, setK] = useState(0);
  const [hallados, setHallados] = useState([]); // índices
  const [pistas, setPistas] = useState({}); // índice → 0..2
  const [sel, setSel] = useState(null);
  const [texto, setTexto] = useState('');
  const [cerrada, setCerrada] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const [aviso, setAviso] = useState({ t: '', k: 0 });
  const cuenta = useCuenta(fase === 'jugando' && !cerrada, () => setCerrada(true));

  const empezar = async () => {
    setFase('cargando'); setError('');
    try {
      const d = await cargarSolo(ID);
      setRondas(d.rondas); setK(0); setPuntos(0); nuevaRonda(); setFase('jugando');
    } catch (e) { setError(e.message); }
  };
  function nuevaRonda() { setHallados([]); setPistas({}); setSel(null); setTexto(''); setCerrada(false); cuenta.empezar(SEGUNDOS); }
  const ronda = rondas[k];
  const ocultos = ronda ? ronda.jugadores.map((j, i) => (j.oculto ? i : -1)).filter((i) => i >= 0) : [];

  const enviar = (e) => {
    e.preventDefault();
    if (!texto.trim() || cerrada) return;
    const i = ocultos.find((x) => !hallados.includes(x) && coincide(texto, ronda.jugadores[x].nombre, ronda.jugadores[x].alias));
    setTexto('');
    if (i === undefined) { setAviso({ t: 'No es ninguno de los que faltan', k: Date.now(), tipo: 'malo' }); return; }
    const gana = Math.max(1, 3 - (pistas[i] || 0));
    const h = [...hallados, i]; setHallados(h); setPuntos((p) => p + gana);
    setAviso({ t: `✓ ${ronda.jugadores[i].nombre} · +${gana}`, k: Date.now(), tipo: 'bueno' });
    if (sel === i) setSel(null);
    if (h.length === ocultos.length) setCerrada(true);
  };
  const pedirPista = () => { if (sel != null && (pistas[sel] || 0) < 2) setPistas({ ...pistas, [sel]: (pistas[sel] || 0) + 1 }); };
  const siguiente = () => {
    if (k + 1 >= rondas.length) { setNuevoRecord(puntos > 0 && registrar(puntos)); setFase('fin'); return; }
    setK(k + 1); nuevaRonda();
  };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Verás <b>5 alineaciones</b> de partidos históricos con <b>4 titulares ocultos</b> (solo ves su dorsal y su puesto).</p>
      <p>Escribe sus nombres en cualquier orden; vale el apellido y se perdonan pequeñas erratas.</p>
      <p>Cada hueco acertado vale <b>3 puntos</b>. Toca un hueco y pide pista: la primera dice su club o su país y la segunda un dato. Cada pista resta 1 punto (mínimo 1).</p>
      <p>Tienes {SEGUNDOS} segundos por alineación.</p>
    </AyudaUnJugador>
  );
  if (fase === 'portada') return <><PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record} textoRecord={(r) => `${r.valor} puntos`} />{ayudaModal}</>;
  if (fase === 'cargando') return <Cargando error={error} onReintentar={empezar} />;
  if (fase === 'fin') {
    return (
      <FinUnJugador icono="trophy" etiqueta="Fin de las 5 alineaciones" titulo={puntos >= 45 ? '¡Memoria de utillero!' : puntos >= 25 ? '¡Muy bien!' : 'Fin de la partida'}
        puntos={puntos} unidad="puntos" nuevoRecord={nuevoRecord} record={record} textoRecord={(r) => `${r.valor} puntos`}
        exito={puntos > 0} onRepetir={empezar} onMenu={() => setFase('portada')}>
        <p className="uj-mini">Máximo posible: 60 puntos.</p>
      </FinUnJugador>
    );
  }

  const jSel = sel != null ? ronda.jugadores[sel] : null;
  return (
    <div className="qq-en-partida">
      <section className="game uj-escena rto-escena">
        <CabeceraPartida onSalir={() => setSalir(true)} chips={[<><Icon name="star" size={14} /> {puntos} pts</>, <>⚽ {k + 1}/5</>, <>🔎 {hallados.length}/4</>]}>
          <p className="op-partido"><b>{ronda.equipo}</b> · {ronda.partido}</p>
        </CabeceraPartida>
        <div className="rto-juego">
          {!cerrada && <Barra valor={cuenta.restante / SEGUNDOS} etiqueta={`${Math.ceil(cuenta.restante)} s`} invertida />}
          <div className="op-campo">
            {LINEAS.map((l) => (
              <div key={l} className="op-linea">
                {ronda.jugadores.map((j, i) => (j.pos !== l ? null : (
                  <button key={i} type="button" className={`op-jugador${j.oculto ? (hallados.includes(i) ? ' hallado' : cerrada ? ' perdido' : ' oculto') : ''}${sel === i ? ' sel' : ''}`}
                    onClick={() => j.oculto && !hallados.includes(i) && !cerrada && setSel(i)}>
                    <span className="op-dorsal">{j.dorsal}</span>
                    <span className="op-nombre">{!j.oculto || hallados.includes(i) || cerrada ? j.nombre.split(' ').slice(-1)[0] : '???'}</span>
                  </button>
                )))}
              </div>
            ))}
          </div>
          <p className="sl-nota sl-blanco">Entrenador: {ronda.entrenador}</p>
          {!cerrada ? (
            <div className="uj-tarjeta">
              <form onSubmit={enviar}>
                <input className="sl-input" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="¿Quién falta?" autoComplete="off" autoCorrect="off" spellCheck="false" enterKeyHint="send" />
              </form>
              {jSel ? (
                <div className="op-pistas">
                  <p className="sl-nota">Hueco del dorsal <b>{jSel.dorsal}</b> ({jSel.pos})</p>
                  {(pistas[sel] || 0) >= 1 && <p className="op-pista">🏷️ {jSel.dato}</p>}
                  {(pistas[sel] || 0) >= 2 && <p className="op-pista">💡 {jSel.pista}</p>}
                  {(pistas[sel] || 0) < 2 && <button type="button" className="uj-boton secundario" onClick={pedirPista}>💡 Pista (−1 punto)</button>}
                </div>
              ) : <p className="sl-nota" style={{ marginTop: '0.5rem' }}>Toca un hueco «???» si quieres una pista.</p>}
            </div>
          ) : (
            <div className="uj-tarjeta">
              <p className="rto-veredicto">{hallados.length === 4 ? '¡Alineación completa!' : `Has encontrado ${hallados.length} de 4.`}</p>
              {ocultos.filter((i) => !hallados.includes(i)).length > 0 && <p className="sl-nota">Faltaban: {ocultos.filter((i) => !hallados.includes(i)).map((i) => ronda.jugadores[i].nombre).join(', ')}.</p>}
            </div>
          )}
          {cerrada ? <button type="button" className="uj-boton grande" onClick={siguiente}><Icon name="forward" size={20} /> {k + 1 >= rondas.length ? 'Ver resultado' : 'Siguiente alineación'}</button>
            : <button type="button" className="uj-boton secundario" onClick={() => setCerrada(true)}>🏳️ Me rindo con esta</button>}
        </div>
      </section>
      <Aviso texto={aviso.t} clave={aviso.k} tipo={aviso.tipo} duracion={1300} />
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
