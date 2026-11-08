// client/src/games/Encadenada/Encadenada.jsx
// Palabra Encadenada — de una palabra a otra cambiando una sola letra en cada paso.
// Cada paso tiene que ser una palabra de verdad. Medalla de oro si igualas el camino más corto.
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import {
  PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, Aviso, useRecord
} from '../../components/UnJugador.jsx';
import { DICCIONARIO, difiereEnUna, caminoMinimo, generarReto } from './motor.js';
import './Encadenada.css';

const ID = 'encadenada';
const PASOS_RETOS = [3, 3, 4, 4, 5, 6];
const LETRAS = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');

function medallaDe(pasos, optimo) {
  if (pasos <= optimo) return { nombre: 'Oro', emoji: '🥇', puntos: 200 };
  if (pasos === optimo + 1) return { nombre: 'Plata', emoji: '🥈', puntos: 150 };
  return { nombre: 'Bronce', emoji: '🥉', puntos: 100 };
}

export default function Encadenada() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | juego | resuelto | fin
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [ronda, setRonda] = useState(0);
  const [reto, setReto] = useState(null);
  const [cadena, setCadena] = useState([]);
  const [posicion, setPosicion] = useState(null);
  const [pistas, setPistas] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [ganados, setGanados] = useState(null);
  const [error, setError] = useState(0);
  const [aviso, setAviso] = useState({ texto: '', tipo: 'info', clave: 0 });
  const [nuevoRecord, setNuevoRecord] = useState(false);

  const avisar = (texto, tipo = 'info') => setAviso((a) => ({ texto, tipo, clave: a.clave + 1 }));

  const prepararRonda = (r) => {
    const nuevo = generarReto(PASOS_RETOS[r]);
    setRonda(r);
    setReto(nuevo);
    setCadena([nuevo.inicio]);
    setPosicion(null);
    setPistas(0);
    setGanados(null);
    setFase('juego');
  };

  const empezar = () => {
    setPuntos(0);
    setNuevoRecord(false);
    prepararRonda(0);
  };

  const actual = cadena[cadena.length - 1];

  const probar = (palabra) => {
    if (!difiereEnUna(actual, palabra)) return;
    if (cadena.includes(palabra)) { avisar('Esa palabra ya está en tu cadena.'); setError((e) => e + 1); return; }
    if (!DICCIONARIO.has(palabra)) { avisar(`«${palabra}» no está en el diccionario del juego.`, 'malo'); setError((e) => e + 1); return; }
    const nueva = [...cadena, palabra];
    setCadena(nueva);
    setPosicion(null);
    if (palabra === reto.fin) {
      const pasos = nueva.length - 1;
      const optimo = reto.optimo.length - 1;
      const m = medallaDe(pasos, optimo);
      const total = Math.max(20, m.puntos - pistas * 50);
      setGanados({ ...m, total, pasos, optimo });
      setPuntos((p) => p + total);
      if (navigator.vibrate) navigator.vibrate([15, 30, 15]);
      setFase('resuelto');
    }
  };

  const pulsarLetra = (letra) => {
    if (fase !== 'juego') return;
    if (posicion == null) { avisar('Primero toca la letra de la palabra que quieres cambiar.'); return; }
    if (actual[posicion] === letra) return;
    probar(actual.slice(0, posicion) + letra + actual.slice(posicion + 1));
  };

  const deshacer = () => {
    if (cadena.length > 1) { setCadena(cadena.slice(0, -1)); setPosicion(null); }
  };

  const pista = () => {
    const camino = caminoMinimo(actual, reto.fin);
    if (!camino || camino.length < 2) { avisar('Desde aquí no hay camino: deshaz algún paso.', 'malo'); return; }
    setPistas((p) => p + 1);
    const sig = camino[1];
    const i = [...sig].findIndex((c, k) => c !== actual[k]);
    setPosicion(i);
    avisar(`Pista: cambia la ${i + 1}.ª letra por «${sig[i]}» (−50 puntos)`, 'bueno');
  };

  const rendirse = () => {
    setGanados({ nombre: 'Sin medalla', emoji: '🏳️', total: 0, pasos: null, optimo: reto.optimo.length - 1, rendido: true });
    setFase('resuelto');
  };

  const siguiente = () => {
    if (ronda + 1 >= PASOS_RETOS.length) {
      setNuevoRecord(puntos > 0 && registrar(puntos));
      setFase('fin');
    } else prepararRonda(ronda + 1);
  };

  useEffect(() => {
    if (fase !== 'juego') return undefined;
    const onKey = (e) => {
      const k = e.key.toUpperCase();
      if (/^[A-Z]$/.test(k)) pulsarLetra(k);
      else if (e.key === 'ArrowLeft') setPosicion((p) => (p == null ? 0 : Math.max(0, p - 1)));
      else if (e.key === 'ArrowRight') setPosicion((p) => (p == null ? 0 : Math.min(3, p + 1)));
      else if (e.key === 'Backspace') deshacer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Tienes que llegar de una palabra a otra <strong>cambiando una sola letra en cada paso</strong>. Cada paso tiene que ser una palabra que exista.</p>
      <p>Ejemplo: <strong>CASA → CAPA → COPA → COLA</strong></p>
      <ul>
        <li>Toca la letra que quieres cambiar y después la nueva letra en el teclado.</li>
        <li>🥇 Oro si llegas en el mínimo de pasos, 🥈 plata con uno más y 🥉 bronce con más.</li>
        <li>Cada <strong>pista</strong> te dice el siguiente cambio, pero cuesta 50 puntos.</li>
        <li>Son {PASOS_RETOS.length} retos, cada vez más largos.</li>
      </ul>
    </AyudaUnJugador>
  );

  if (fase === 'portada') {
    return (
      <div className="ec-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record} textoRecord={(r) => `${r.valor} puntos`} />
        {ayudaModal}
      </div>
    );
  }

  if (fase === 'fin') {
    return (
      <div className="ec-contenedor">
        <FinUnJugador
          icono="letters"
          etiqueta={`${PASOS_RETOS.length} retos completados`}
          titulo={puntos >= 1100 ? '¡Maestro de las palabras!' : puntos >= 800 ? '¡Muy bien encadenado!' : 'Fin de la partida'}
          puntos={puntos}
          unidad="puntos"
          nuevoRecord={nuevoRecord}
          record={record}
          textoRecord={(r) => `${r.valor} puntos`}
          onRepetir={empezar}
          onMenu={() => setFase('portada')}
        />
      </div>
    );
  }

  const resuelto = fase === 'resuelto';
  const optimo = reto.optimo.length - 1;

  return (
    <div className="ec-contenedor qq-en-partida">
      <Aviso {...aviso} />
      <section className="game uj-escena">
        <CabeceraPartida
          onSalir={() => setSalir(true)}
          chips={[<><Icon name="flag" size={14} /> Reto {ronda + 1}/{PASOS_RETOS.length}</>, <><Icon name="star" size={14} /> {puntos}</>]}
        >
          <div className="ec-objetivo">
            <span>{reto.inicio}</span>
            <Icon name="forward" size={18} />
            <strong>{reto.fin}</strong>
            <em>mínimo {optimo} pasos</em>
          </div>
        </CabeceraPartida>

        <div className="ec-cadena">
          {cadena.slice(0, -1).map((p, i) => <span key={i} className="ec-eslabon">{p}</span>)}
          <span className="ec-pasos">{cadena.length - 1} {cadena.length - 1 === 1 ? 'paso' : 'pasos'}</span>
        </div>

        <div key={`${actual}-${error}`} className={`ec-actual${error ? ' error' : ''}${resuelto ? ' resuelto' : ''}`}>
          {[...actual].map((c, i) => (
            <button
              key={i}
              type="button"
              className={`ec-ficha${posicion === i ? ' activa' : ''}${c === reto.fin[i] ? ' bien' : ''}`}
              onClick={() => !resuelto && setPosicion(i)}
              aria-pressed={posicion === i}
            >
              {c}
            </button>
          ))}
        </div>

        {resuelto ? (
          <div className="uj-tarjeta ec-resultado">
            <p className="ec-medalla">{ganados.emoji}</p>
            <h3>{ganados.rendido ? 'Te has rendido' : `${ganados.nombre}: ${ganados.pasos} pasos`}</h3>
            <p className="uj-mini">Camino más corto: {reto.optimo.join(' → ')}</p>
            {!ganados.rendido && <p className="ec-ganados">+{ganados.total} puntos{pistas ? ` (con ${pistas} ${pistas === 1 ? 'pista' : 'pistas'})` : ''}</p>}
            <button type="button" className="uj-boton grande" onClick={siguiente}>
              {ronda + 1 >= PASOS_RETOS.length ? <><Icon name="flagFinish" size={20} /> Ver resultado</> : <><Icon name="forward" size={20} /> Siguiente reto</>}
            </button>
          </div>
        ) : (
          <>
            <p className="uj-texto-claro">{posicion == null ? 'Toca la letra que quieres cambiar' : `Elige la nueva ${posicion + 1}.ª letra`}</p>
            <div className="ec-teclado">
              {LETRAS.map((l) => (
                <button key={l} type="button" className="ec-tecla" onClick={() => pulsarLetra(l)} disabled={posicion == null}>{l}</button>
              ))}
            </div>
            <div className="ec-controles">
              <button type="button" className="uj-boton secundario" onClick={deshacer} disabled={cadena.length < 2}><Icon name="refresh" size={16} /> Deshacer</button>
              <button type="button" className="uj-boton secundario" onClick={pista}><Icon name="bulb" size={16} /> Pista</button>
              <button type="button" className="uj-enlace ec-rendirse" onClick={rendirse}>Rendirse</button>
            </div>
          </>
        )}
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
