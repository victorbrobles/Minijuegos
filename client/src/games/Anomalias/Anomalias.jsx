// client/src/games/Anomalias/Anomalias.jsx
// Inspector de Anomalías — una cámara fija vigila una habitación. Memoriza la escena,
// la señal se corta un instante… y algo ha cambiado. Tócalo antes de que acabe la cuenta atrás.
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import {
  PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, Barra, useRecord
} from '../../components/UnJugador.jsx';
import { crearEscena, aplicarAnomalia, tiempos } from './salas.js';
import './Anomalias.css';

const ID = 'anomalias';
const VIDAS = 3;
const ESTATICA_MS = 700;

function Sala({ sala, objetos, onTocar, objetivo, revelar, fallo, interactiva }) {
  const v = sala.ventana;
  return (
    <div className="an-sala" style={{ '--pared1': sala.pared[0], '--pared2': sala.pared[1], '--suelo1': sala.suelo[0], '--suelo2': sala.suelo[1] }}>
      <div className="an-ventana" style={{ left: `${v.x}%`, top: `${v.y}%`, width: `${v.w}%`, height: `${v.h}%` }} />
      {objetos.map((o) => {
        const estilo = {
          left: `${o.x}%`,
          top: `${o.y}%`,
          fontSize: `calc(var(--ancho) * ${o.t / 100})`,
          transform: `translate(-50%, -50%) rotate(${o.giro}deg) scale(${o.volteo ? -o.escala : o.escala}, ${o.escala})`,
          filter: o.tono ? `hue-rotate(${o.tono}deg) saturate(1.6)` : undefined
        };
        const clase = `an-obj${o.oculto ? ' oculto' : ''}${revelar && o.id === objetivo ? ' objetivo' : ''}${fallo === o.id ? ' fallo' : ''}`;
        return (
          <button key={o.id} type="button" className={clase} style={estilo} disabled={!interactiva} onClick={() => onTocar?.(o.id)} aria-label="Objeto">
            <span>{o.emoji}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function Anomalias() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | observar | estatica | buscar | resultado | fin
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nivel, setNivel] = useState(1);
  const [vidas, setVidas] = useState(VIDAS);
  const [encontradas, setEncontradas] = useState(0);
  const [escena, setEscena] = useState(null);
  const [cambio, setCambio] = useState(null);
  const [acierto, setAcierto] = useState(false);
  const [fallo, setFallo] = useState(null);
  const [restante, setRestante] = useState(1);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [hora, setHora] = useState('');
  const finRef = useRef(0);
  const duracionRef = useRef(1);

  const reloj = (segundos) => {
    duracionRef.current = segundos;
    finRef.current = Date.now() + segundos * 1000;
    setRestante(segundos);
  };

  const nuevaRonda = (nv) => {
    const e = crearEscena(nv);
    setEscena(e);
    setCambio(null);
    setFallo(null);
    reloj(tiempos(nv).observar);
    setFase('observar');
  };

  const empezar = () => {
    setNivel(1);
    setVidas(VIDAS);
    setEncontradas(0);
    setNuevoRecord(false);
    nuevaRonda(1);
  };

  // Hora de la cámara
  useEffect(() => {
    const t = () => setHora(new Date().toLocaleTimeString('es-ES', { hour12: false }));
    t();
    const id = setInterval(t, 1000);
    return () => clearInterval(id);
  }, []);

  // Temporizadores de las fases
  useEffect(() => {
    if (fase !== 'observar' && fase !== 'buscar') return undefined;
    const id = setInterval(() => {
      const r = (finRef.current - Date.now()) / 1000;
      if (r > 0) { setRestante(r); return; }
      clearInterval(id);
      if (fase === 'observar') {
        setFase('estatica');
      } else {
        setAcierto(false);
        setVidas((v) => v - 1);
        setFase('resultado');
      }
    }, 100);
    return () => clearInterval(id);
  }, [fase]);

  useEffect(() => {
    if (fase !== 'estatica') return undefined;
    const id = setTimeout(() => {
      setCambio(aplicarAnomalia(escena, nivel));
      reloj(tiempos(nivel).buscar);
      setFase('buscar');
    }, ESTATICA_MS);
    return () => clearTimeout(id);
  }, [fase, escena, nivel]);

  const tocar = (idObj) => {
    if (fase !== 'buscar') return;
    const ok = idObj === cambio.objetivo;
    setAcierto(ok);
    if (ok) {
      setEncontradas((e) => e + 1);
      if (navigator.vibrate) navigator.vibrate(15);
    } else {
      setFallo(idObj);
      setVidas((v) => v - 1);
      if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    }
    setFase('resultado');
  };

  const siguiente = () => {
    if (vidas <= 0) {
      setNuevoRecord(encontradas > 0 && registrar(encontradas));
      setFase('fin');
      return;
    }
    const nv = acierto ? nivel + 1 : nivel;
    setNivel(nv);
    nuevaRonda(nv);
  };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Vigilas una habitación con una <strong>cámara fija</strong>.</p>
      <ul>
        <li><strong>Observa</strong> la escena mientras dura la cuenta atrás.</li>
        <li>La señal se corta un momento y, al volver, <strong>algo habrá cambiado</strong>: un objeto que desaparece, aparece, se mueve, cambia de color, de tamaño, se inclina…</li>
        <li><strong>Toca el objeto</strong> que ha cambiado antes de que acabe el tiempo. Si ha desaparecido, toca el hueco donde estaba.</li>
        <li>Cada nivel hay más objetos y los cambios son más sutiles. Tienes 3 vidas.</li>
      </ul>
    </AyudaUnJugador>
  );

  if (fase === 'portada') {
    return (
      <div className="an-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record}
          textoRecord={(r) => `${r.valor} ${r.valor === 1 ? 'anomalía' : 'anomalías'}`} textoBoton="Empezar la guardia" iconoBoton="eye" />
        {ayudaModal}
      </div>
    );
  }

  if (fase === 'fin') {
    return (
      <div className="an-contenedor">
        <FinUnJugador
          icono="eye"
          etiqueta="Fin de la guardia"
          titulo={encontradas >= 15 ? '¡Ojo de halcón!' : encontradas >= 7 ? '¡Gran inspector!' : 'Turno terminado'}
          puntos={encontradas}
          unidad={encontradas === 1 ? 'anomalía detectada' : 'anomalías detectadas'}
          nuevoRecord={nuevoRecord}
          record={record}
          textoRecord={(r) => `${r.valor} anomalías`}
          exito={encontradas > 0}
          onRepetir={empezar}
          onMenu={() => setFase('portada')}
        />
      </div>
    );
  }

  const objetosVisibles = fase === 'observar' || fase === 'estatica' ? escena.objetos : cambio.objetos;
  const etiquetaFase = {
    observar: 'Memoriza la habitación',
    estatica: 'Señal perdida…',
    buscar: '¿Qué ha cambiado? ¡Tócalo!',
    resultado: acierto ? '¡Anomalía detectada!' : 'Se te ha escapado'
  }[fase];

  return (
    <div className="an-contenedor qq-en-partida">
      <section className="game uj-escena">
        <CabeceraPartida
          onSalir={() => setSalir(true)}
          chips={[
            <><Icon name="eye" size={14} /> {encontradas}</>,
            <>{Array.from({ length: VIDAS }, (_, i) => (i < vidas ? '❤️' : '🖤')).join('')}</>
          ]}
          titulo={etiquetaFase}
        />

        {(fase === 'observar' || fase === 'buscar') && (
          <Barra valor={restante / duracionRef.current} etiqueta={`${Math.ceil(restante)} s`} invertida icono={fase === 'observar' ? 'eye' : 'clock'} />
        )}

        <div className={`an-camara fase-${fase}`}>
          <Sala
            sala={escena.sala}
            objetos={objetosVisibles}
            onTocar={tocar}
            objetivo={cambio?.objetivo}
            revelar={fase === 'resultado'}
            fallo={fallo}
            interactiva={fase === 'buscar'}
          />
          <div className="an-hud">
            <span><i className="an-rec" /> REC</span>
            <span>CAM 0{((nivel - 1) % 3) + 1} · {escena.sala.nombre}</span>
            <span>{hora}</span>
          </div>
          <div className="an-hud abajo">
            <span>NIVEL {nivel}</span>
            <span>{escena.objetos.length} objetos</span>
          </div>
          {fase === 'estatica' && <div className="an-ruido" />}
        </div>

        {fase === 'resultado' && (
          <>
            <div className={`uj-tarjeta an-resultado ${acierto ? 'ok' : 'mal'}`}>
              <p className="uj-etiqueta">{acierto ? '¡Bien visto!' : 'La anomalía era…'}</p>
              <p className="an-cambio">{cambio.texto}</p>
            </div>
            <div className="uj-acciones">
              <button type="button" className="uj-boton grande" onClick={siguiente}>
                {vidas <= 0 ? <><Icon name="flagFinish" size={20} /> Ver resultado</> : <><Icon name="forward" size={20} /> {acierto ? 'Siguiente nivel' : 'Reintentar nivel'}</>}
              </button>
            </div>
          </>
        )}
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
