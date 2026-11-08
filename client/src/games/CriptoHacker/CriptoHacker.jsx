// client/src/games/CriptoHacker/CriptoHacker.jsx
// Cripto-Hacker — adivina el código de cada servidor (deducción tipo «Mastermind»).
// Cada intento y cada segundo hacen subir el rastreo de seguridad; si llega al 100 %, te pillan.
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import {
  PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, Aviso, Barra, useRecord
} from '../../components/UnJugador.jsx';
import './CriptoHacker.css';

const ID = 'criptohacker';
const SIMBOLOS = ['A', 'B', 'C', 'D', 'E', 'F', '7', '9'];
const COLORES = { A: '#22d3ee', B: '#a78bfa', C: '#f472b6', D: '#facc15', E: '#4ade80', F: '#fb923c', 7: '#60a5fa', 9: '#f87171' };

/** Configuración del servidor n (1, 2, 3…) */
export function nivelServidor(n) {
  if (n <= 1) return { largo: 3, simbolos: 6, repetidos: false, intentos: 7 };
  if (n <= 3) return { largo: 4, simbolos: 6, repetidos: false, intentos: 8 };
  if (n <= 5) return { largo: 4, simbolos: 8, repetidos: false, intentos: 8 };
  if (n <= 7) return { largo: 4, simbolos: 6, repetidos: true, intentos: 9 };
  return { largo: 5, simbolos: 8, repetidos: n > 9, intentos: 10 };
}

function generarCodigo({ largo, simbolos, repetidos }) {
  const disp = SIMBOLOS.slice(0, simbolos);
  const out = [];
  while (out.length < largo) {
    const s = disp[Math.floor(Math.random() * disp.length)];
    if (repetidos || !out.includes(s)) out.push(s);
  }
  return out;
}

/** { exactos, descolocados } */
export function comparar(codigo, intento) {
  let exactos = 0;
  const restoC = {}; const restoI = {};
  codigo.forEach((c, i) => {
    if (c === intento[i]) exactos++;
    else { restoC[c] = (restoC[c] || 0) + 1; restoI[intento[i]] = (restoI[intento[i]] || 0) + 1; }
  });
  let descolocados = 0;
  Object.keys(restoI).forEach((k) => { descolocados += Math.min(restoI[k], restoC[k] || 0); });
  return { exactos, descolocados };
}

const RASTREO_POR_SEGUNDO = 0.3;
const COSTE_ESCANEO = 15;

export default function CriptoHacker() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | juego | hackeado | fin
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [servidor, setServidor] = useState(1);
  const [conf, setConf] = useState(nivelServidor(1));
  const [codigo, setCodigo] = useState([]);
  const [intento, setIntento] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [rastreo, setRastreo] = useState(0);
  const [revelados, setRevelados] = useState([]);
  const [aviso, setAviso] = useState({ texto: '', tipo: 'info', clave: 0 });
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const rastreoRef = useRef(0);
  const historialRef = useRef(null);

  const subirRastreo = (cantidad) => {
    rastreoRef.current = Math.min(100, rastreoRef.current + cantidad);
    setRastreo(rastreoRef.current);
  };

  const prepararServidor = (n, rastreoInicial) => {
    const c = nivelServidor(n);
    setServidor(n);
    setConf(c);
    setCodigo(generarCodigo(c));
    setIntento([]);
    setHistorial([]);
    setRevelados([]);
    rastreoRef.current = rastreoInicial;
    setRastreo(rastreoInicial);
    setFase('juego');
  };

  const empezar = () => {
    setNuevoRecord(false);
    prepararServidor(1, 0);
  };

  const terminar = () => {
    const hackeados = servidor - 1;
    setNuevoRecord(hackeados > 0 && registrar(hackeados));
    setFase('fin');
  };

  // El rastreo sube solo con el tiempo
  useEffect(() => {
    if (fase !== 'juego') return undefined;
    const id = setInterval(() => {
      subirRastreo(RASTREO_POR_SEGUNDO / 4);
      if (rastreoRef.current >= 100) { clearInterval(id); terminar(); }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, servidor]);

  useEffect(() => {
    historialRef.current?.scrollTo({ top: historialRef.current.scrollHeight, behavior: 'smooth' });
  }, [historial.length]);

  const pulsar = (s) => {
    if (fase !== 'juego' || intento.length >= conf.largo) return;
    if (!conf.repetidos && intento.includes(s)) {
      setAviso((a) => ({ texto: 'En este servidor no se repiten símbolos.', tipo: 'info', clave: a.clave + 1 }));
      return;
    }
    setIntento([...intento, s]);
  };

  const borrar = () => setIntento(intento.slice(0, -1));

  const enviar = () => {
    if (intento.length !== conf.largo) return;
    const res = comparar(codigo, intento);
    const nuevo = [...historial, { intento, ...res }];
    setHistorial(nuevo);
    setIntento([]);
    if (res.exactos === conf.largo) {
      if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
      setFase('hackeado');
      return;
    }
    subirRastreo(100 / conf.intentos);
    if (rastreoRef.current >= 100) terminar();
  };

  const escanear = () => {
    const ocultas = codigo.map((_, i) => i).filter((i) => !revelados.includes(i));
    if (!ocultas.length || fase !== 'juego') return;
    const i = ocultas[Math.floor(Math.random() * ocultas.length)];
    setRevelados([...revelados, i]);
    subirRastreo(COSTE_ESCANEO);
    setAviso((a) => ({ texto: `Escáner: la posición ${i + 1} es «${codigo[i]}»`, tipo: 'bueno', clave: a.clave + 1 }));
    if (rastreoRef.current >= 100) terminar();
  };

  // Teclado físico
  useEffect(() => {
    if (fase !== 'juego') return undefined;
    const onKey = (e) => {
      const k = e.key.toUpperCase();
      if (SIMBOLOS.slice(0, conf.simbolos).includes(k)) pulsar(k);
      else if (e.key === 'Backspace') borrar();
      else if (e.key === 'Enter') enviar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Cada servidor está protegido por un <strong>código secreto</strong>. Prueba combinaciones y deduce cuál es.</p>
      <ul>
        <li><span className="ch-ayuda-led ok" /> <strong>Verde</strong>: un símbolo correcto en su sitio.</li>
        <li><span className="ch-ayuda-led medio" /> <strong>Amarillo</strong>: un símbolo que está en el código, pero en otra posición.</li>
        <li>No te decimos cuáles son: ¡dedúcelo!</li>
        <li>El <strong>rastreo</strong> sube con cada intento y poco a poco con el tiempo. Si llega al 100 %, te pillan.</li>
        <li>El <strong>escáner</strong> revela un símbolo, pero dispara el rastreo un {COSTE_ESCANEO} %.</li>
        <li>Al hackear un servidor, el rastreo baja (pero no del todo) y pasas al siguiente, más difícil.</li>
      </ul>
    </AyudaUnJugador>
  );

  if (fase === 'portada') {
    return (
      <div className="ch-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record}
          textoRecord={(r) => `${r.valor} ${r.valor === 1 ? 'servidor' : 'servidores'}`} textoBoton="Iniciar intrusión" iconoBoton="lock" />
        {ayudaModal}
      </div>
    );
  }

  if (fase === 'fin') {
    const hackeados = servidor - 1;
    return (
      <div className="ch-contenedor">
        <FinUnJugador
          icono="lock"
          etiqueta="Rastreo al 100 % · Te han localizado"
          titulo={hackeados >= 8 ? '¡Hacker de élite!' : hackeados >= 4 ? '¡Buen trabajo!' : 'Conexión cortada'}
          puntos={hackeados}
          unidad={hackeados === 1 ? 'servidor hackeado' : 'servidores hackeados'}
          nuevoRecord={nuevoRecord}
          record={record}
          textoRecord={(r) => `${r.valor} servidores`}
          exito={hackeados > 0}
          onRepetir={empezar}
          onMenu={() => setFase('portada')}
        >
          <p className="uj-mini">El código del servidor {servidor} era</p>
          <div className="ch-fila centrada">
            {codigo.map((s, i) => <span key={i} className="ch-celda" style={{ '--c': COLORES[s] }}>{s}</span>)}
          </div>
        </FinUnJugador>
      </div>
    );
  }

  const hackeado = fase === 'hackeado';
  const disponibles = SIMBOLOS.slice(0, conf.simbolos);

  return (
    <div className="ch-contenedor qq-en-partida">
      <Aviso {...aviso} />
      <section className="game uj-escena">
        <CabeceraPartida
          onSalir={() => setSalir(true)}
          chips={[<><Icon name="lock" size={14} /> Servidor {servidor}</>, record ? <><Icon name="trophy" size={14} /> {record.valor}</> : null]}
        >
          <div className="ch-config">
            <span>{conf.largo} símbolos</span>
            <span>{conf.simbolos} posibles</span>
            <span>{conf.repetidos ? 'Pueden repetirse' : 'Sin repetir'}</span>
          </div>
        </CabeceraPartida>

        <div className="ch-rastreo">
          <span className="ch-rastreo-tit"><Icon name="eye" size={15} /> Rastreo</span>
          <Barra valor={rastreo / 100} etiqueta={`${Math.floor(rastreo)} %`} peligroDesde={0.75} icono="target" />
        </div>

        <div className="ch-terminal" ref={historialRef}>
          {!historial.length && <p className="ch-vacio">&gt; Esperando primer intento_</p>}
          {historial.map((h, k) => (
            <div key={k} className="ch-intento">
              <span className="ch-num">{String(k + 1).padStart(2, '0')}</span>
              <div className="ch-fila">
                {h.intento.map((s, i) => <span key={i} className="ch-celda" style={{ '--c': COLORES[s] }}>{s}</span>)}
              </div>
              <div className="ch-leds" aria-label={`${h.exactos} en su sitio, ${h.descolocados} descolocados`}>
                {Array.from({ length: conf.largo }, (_, i) => (
                  <span key={i} className={`ch-led ${i < h.exactos ? 'ok' : i < h.exactos + h.descolocados ? 'medio' : ''}`} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {hackeado ? (
          <div className="uj-tarjeta ch-exito">
            <p className="uj-etiqueta">Acceso concedido</p>
            <h3>🔓 ¡Servidor {servidor} hackeado en {historial.length} {historial.length === 1 ? 'intento' : 'intentos'}!</h3>
            <p className="uj-mini">Al cambiar de servidor el rastreo baja, pero conserva parte de lo acumulado.</p>
            <button type="button" className="uj-boton grande exito" onClick={() => prepararServidor(servidor + 1, Math.round(rastreoRef.current * 0.4))}>
              <Icon name="forward" size={20} /> Siguiente servidor
            </button>
          </div>
        ) : (
          <div className="ch-consola">
            <div className="ch-fila ch-actual">
              {Array.from({ length: conf.largo }, (_, i) => {
                const s = intento[i];
                return (
                  <span key={i} className={`ch-celda${s ? '' : ' vacia'}${revelados.includes(i) ? ' pista' : ''}`} style={s ? { '--c': COLORES[s] } : undefined}>
                    {s || (revelados.includes(i) ? <small>{codigo[i]}</small> : '·')}
                  </span>
                );
              })}
            </div>
            <div className={`ch-teclado n${disponibles.length}`}>
              {disponibles.map((s) => (
                <button key={s} type="button" className="ch-tecla" style={{ '--c': COLORES[s] }} onClick={() => pulsar(s)}>{s}</button>
              ))}
            </div>
            <div className="ch-controles">
              <button type="button" className="uj-boton secundario" onClick={escanear} disabled={revelados.length >= conf.largo - 1}>
                <Icon name="eye" size={18} /> Escáner
              </button>
              <button type="button" className="uj-boton secundario" onClick={borrar} disabled={!intento.length}>⌫</button>
              <button type="button" className="uj-boton" onClick={enviar} disabled={intento.length !== conf.largo}>
                <Icon name="play" size={18} /> Probar
              </button>
            </div>
          </div>
        )}
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
