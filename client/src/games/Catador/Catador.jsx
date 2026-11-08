// client/src/games/Catador/Catador.jsx
// El Catador de Mentiras — cada sospechoso hace una declaración y sabes cuántas son verdad.
// Deduce quién es el culpable. 3 vidas; los casos se complican con más sospechosos.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import {
  PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, useRecord
} from '../../components/UnJugador.jsx';
import { generarCaso, textoDeclaracion, textoPista } from './motor.js';
import './Catador.css';

const ID = 'catador';
const VIDAS = 3;
const NOTAS = ['', 'verdad', 'mentira'];

const sospechososPara = (resueltos) => (resueltos < 3 ? 3 : resueltos < 7 ? 4 : 5);

export default function Catador() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | caso | veredicto | fin
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [caso, setCaso] = useState(null);
  const [notas, setNotas] = useState([]);
  const [elegido, setElegido] = useState(null);
  const [vidas, setVidas] = useState(VIDAS);
  const [resueltos, setResueltos] = useState(0);
  const [acierto, setAcierto] = useState(false);
  const [nuevoRecord, setNuevoRecord] = useState(false);

  const nuevoCaso = (num) => {
    const c = generarCaso(sospechososPara(num));
    setCaso(c);
    setNotas(c.declaraciones.map(() => 0));
    setElegido(null);
    setFase('caso');
  };

  const empezar = () => {
    setVidas(VIDAS);
    setResueltos(0);
    setNuevoRecord(false);
    nuevoCaso(0);
  };

  const acusar = () => {
    if (elegido == null) return;
    const ok = elegido === caso.culpable;
    setAcierto(ok);
    if (ok) setResueltos((r) => r + 1);
    else setVidas((v) => v - 1);
    setFase('veredicto');
  };

  const siguiente = () => {
    if (vidas <= 0) {
      setNuevoRecord(resueltos > 0 && registrar(resueltos));
      setFase('fin');
      return;
    }
    nuevoCaso(resueltos);
  };

  const ciclarNota = (i) => setNotas((ns) => ns.map((v, k) => (k === i ? (v + 1) % NOTAS.length : v)));

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Ha pasado algo y cada sospechoso hace <strong>una declaración</strong>. Te diremos <strong>cuántos dicen la verdad</strong>. Solo hay un culpable.</p>
      <ul>
        <li>Prueba con cada sospechoso: «si fuera el culpable, ¿cuántas declaraciones serían verdad?». Solo uno encaja.</li>
        <li>Toca el círculo de cada declaración para apuntar si crees que es <strong>verdad</strong> o <strong>mentira</strong>.</li>
        <li>Elige al culpable y pulsa <strong>Acusar</strong>. Si fallas pierdes una vida (tienes 3).</li>
        <li>Cuantos más casos resuelvas, más sospechosos habrá.</li>
      </ul>
    </AyudaUnJugador>
  );

  if (fase === 'portada') {
    return (
      <div className="ct-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record}
          textoRecord={(r) => `${r.valor} ${r.valor === 1 ? 'caso' : 'casos'}`} />
        {ayudaModal}
      </div>
    );
  }

  if (fase === 'fin') {
    return (
      <div className="ct-contenedor">
        <FinUnJugador
          icono="sleuth"
          etiqueta="Te has quedado sin vidas"
          titulo={resueltos >= 10 ? '¡Detective legendario!' : resueltos >= 5 ? '¡Gran olfato!' : 'Caso cerrado'}
          puntos={resueltos}
          unidad={resueltos === 1 ? 'caso resuelto' : 'casos resueltos'}
          nuevoRecord={nuevoRecord}
          record={record}
          textoRecord={(r) => `${r.valor} casos`}
          exito={resueltos > 0}
          onRepetir={empezar}
          onMenu={() => setFase('portada')}
        />
      </div>
    );
  }

  const n = caso.personajes.length;
  const veredicto = fase === 'veredicto';

  return (
    <div className="ct-contenedor qq-en-partida">
      <section className="game uj-escena">
        <CabeceraPartida
          onSalir={() => setSalir(true)}
          chips={[
            <><Icon name="check" size={14} /> {resueltos}</>,
            <>{Array.from({ length: VIDAS }, (_, i) => (i < vidas ? '❤️' : '🖤')).join('')}</>
          ]}
          titulo={caso.misterio}
        >
          <p className="ct-pista"><Icon name="bulb" size={16} /> {textoPista(caso.numVerdad, n)}</p>
        </CabeceraPartida>

        {veredicto && (
          <div className={`uj-tarjeta ct-veredicto ${acierto ? 'ok' : 'mal'}`}>
            <p className="uj-etiqueta">{acierto ? '¡Caso resuelto!' : 'Te has equivocado'}</p>
            <h3>
              {caso.personajes[caso.culpable].avatar} {acierto ? 'Has pillado a' : 'Quien lo hizo fue'} {caso.personajes[caso.culpable].nombre}
            </h3>
            <p className="uj-mini">Debajo tienes quién decía la verdad y quién mentía.</p>
          </div>
        )}

        <div className="ct-lista">
          {caso.personajes.map((p, i) => {
            const d = caso.declaraciones[i];
            const nota = NOTAS[notas[i]];
            const real = caso.verdades[i] ? 'verdad' : 'mentira';
            return (
              <div
                key={p.nombre}
                className={`ct-sospechoso${elegido === i ? ' elegido' : ''}${veredicto && caso.culpable === i ? ' culpable' : ''}`}
              >
                <button type="button" className="ct-persona" disabled={veredicto} onClick={() => setElegido(i)} aria-pressed={elegido === i}>
                  <span className="ct-avatar">{p.avatar}</span>
                  <span className="ct-nombre">{p.nombre}<small>{p.oficio}</small></span>
                </button>
                <div className="ct-bocadillo">
                  <span>«{textoDeclaracion(d, i, caso.personajes)}»</span>
                  {veredicto ? (
                    <span className={`ct-nota ${real}`}>{real === 'verdad' ? '✓ Verdad' : '✗ Mentira'}</span>
                  ) : (
                    <button type="button" className={`ct-nota ${nota}`} onClick={() => ciclarNota(i)} aria-label="Apuntar verdad o mentira">
                      {nota === 'verdad' ? '✓ Verdad' : nota === 'mentira' ? '✗ Mentira' : 'Apuntar'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="uj-acciones">
          {veredicto ? (
            <button type="button" className="uj-boton grande" onClick={siguiente}>
              {vidas <= 0 ? <><Icon name="flagFinish" size={20} /> Ver resultado</> : <><Icon name="forward" size={20} /> Siguiente caso</>}
            </button>
          ) : (
            <button type="button" className="uj-boton grande peligro" disabled={elegido == null} onClick={acusar}>
              <Icon name="target" size={20} /> {elegido == null ? 'Toca a un sospechoso' : `Acusar a ${caso.personajes[elegido].nombre}`}
            </button>
          )}
        </div>
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
