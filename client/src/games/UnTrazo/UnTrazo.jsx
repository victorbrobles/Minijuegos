// client/src/games/UnTrazo/UnTrazo.jsx
// Un Solo Trazo — repasa todas las líneas de la figura en un único recorrido, sin pasar dos veces
// por la misma. Algunas figuras son imposibles: descúbrelo y pulsa «¡Es imposible!».
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import {
  PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, Aviso, Barra, useRecord
} from '../../components/UnJugador.jsx';
import { COLS, FILAS, posNodo, generarFigura, grados, clave } from './motor.js';
import './UnTrazo.css';

const ID = 'untrazo';
const VIDAS = 3;
const ESP = 100;
const MARGEN = 45;
const RADIO_TOQUE = 34;
const xy = (id) => { const [x, y] = posNodo(id); return [MARGEN + x * ESP, MARGEN + y * ESP]; };
const ANCHO = MARGEN * 2 + (COLS - 1) * ESP;
const ALTO = MARGEN * 2 + (FILAS - 1) * ESP;

const segundosPara = (nivel) => Math.max(25, 50 - nivel * 2);

export default function UnTrazo() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada'); // portada | juego | resultado | fin
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nivel, setNivel] = useState(1);
  const [figura, setFigura] = useState(null);
  const [camino, setCamino] = useState([]); // lista de nodos
  const [puntero, setPuntero] = useState(null);
  const [vidas, setVidas] = useState(VIDAS);
  const [resueltas, setResueltas] = useState(0);
  const [resultado, setResultado] = useState(null); // { ok, motivo }
  const [restante, setRestante] = useState(1);
  const [aviso, setAviso] = useState({ texto: '', tipo: 'info', clave: 0 });
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const svgRef = useRef(null);
  const arrastrando = useRef(false);
  const finRef = useRef(0);

  const preparar = (n) => {
    const imposible = n >= 3 && Math.random() < 0.3;
    setFigura(generarFigura(n, imposible));
    setCamino([]);
    setResultado(null);
    finRef.current = Date.now() + segundosPara(n) * 1000;
    setRestante(segundosPara(n));
    setFase('juego');
  };

  const empezar = () => {
    setNivel(1);
    setVidas(VIDAS);
    setResueltas(0);
    setNuevoRecord(false);
    preparar(1);
  };

  const usadas = new Set();
  for (let i = 1; i < camino.length; i++) usadas.add(clave(camino[i - 1], camino[i]));
  const total = figura ? figura.aristas.length : 0;
  const nodos = figura ? [...grados(new Set(figura.aristas)).keys()] : [];

  const resolver = (ok, motivo) => {
    setResultado({ ok, motivo });
    if (ok) setResueltas((r) => r + 1);
    else setVidas((v) => v - 1);
    if (navigator.vibrate) navigator.vibrate(ok ? [15, 30, 15] : [30, 40, 30]);
    setFase('resultado');
  };

  // Reloj
  useEffect(() => {
    if (fase !== 'juego') return undefined;
    const id = setInterval(() => {
      const r = (finRef.current - Date.now()) / 1000;
      if (r > 0) setRestante(r);
      else { clearInterval(id); resolver(false, 'tiempo'); }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, figura]);

  // Comprueba si ha terminado
  useEffect(() => {
    if (fase === 'juego' && figura && usadas.size === total && total > 0) {
      arrastrando.current = false;
      resolver(true, figura.posible ? 'dibujada' : 'dibujada');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camino]);

  const coordenadas = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * ANCHO, ((e.clientY - r.top) / r.height) * ALTO];
  };

  const nodoEn = ([px, py]) => {
    let mejor = null; let dist = RADIO_TOQUE;
    for (const n of nodos) {
      const [x, y] = xy(n);
      const d = Math.hypot(px - x, py - y);
      if (d < dist) { dist = d; mejor = n; }
    }
    return mejor;
  };

  const intentarIr = (n) => {
    setCamino((c) => {
      if (!c.length) return [n];
      const ultimo = c[c.length - 1];
      if (n === ultimo) return c;
      const k = clave(ultimo, n);
      const usadasAhora = new Set();
      for (let i = 1; i < c.length; i++) usadasAhora.add(clave(c[i - 1], c[i]));
      if (figura.aristas.includes(k) && !usadasAhora.has(k)) return [...c, n];
      return c;
    });
  };

  const alPulsar = (e) => {
    if (fase !== 'juego') return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = coordenadas(e);
    const n = nodoEn(p);
    arrastrando.current = true;
    setPuntero(p);
    if (n == null) return;
    const ultimo = camino[camino.length - 1];
    // Si toca un punto conectado con el último, sigue; si no, empieza de nuevo desde ahí
    if (camino.length && (n === ultimo || (figura.aristas.includes(clave(ultimo, n)) && !usadas.has(clave(ultimo, n))))) intentarIr(n);
    else setCamino([n]);
  };

  const alMover = (e) => {
    if (!arrastrando.current || fase !== 'juego') return;
    const p = coordenadas(e);
    setPuntero(p);
    const n = nodoEn(p);
    if (n != null) intentarIr(n);
  };

  const alSoltar = () => { arrastrando.current = false; setPuntero(null); };

  const reiniciar = () => setCamino([]);

  const imposible = () => {
    if (fase !== 'juego') return;
    if (!figura.posible) resolver(true, 'imposible');
    else {
      setAviso((a) => ({ texto: '¡Sí se puede dibujar de un trazo!', tipo: 'malo', clave: a.clave + 1 }));
      resolver(false, 'eraPosible');
    }
  };

  const siguiente = () => {
    if (vidas <= 0) {
      setNuevoRecord(resueltas > 0 && registrar(resueltas));
      setFase('fin');
      return;
    }
    const n = resultado?.ok ? nivel + 1 : nivel;
    setNivel(n);
    preparar(n);
  };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Repasa <strong>todas las líneas</strong> de la figura en un único recorrido, sin pasar dos veces por la misma línea.</p>
      <ul>
        <li>Arrastra el dedo de punto a punto (o ve tocando los puntos uno detrás de otro).</li>
        <li>Si te atascas, toca otro punto para empezar desde ahí o pulsa <strong>Borrar</strong>.</li>
        <li>Algunas figuras son <strong>imposibles</strong>. Si lo descubres, pulsa <strong>¡Es imposible!</strong> Si en realidad se podía, pierdes una vida.</li>
        <li>💡 El truco: cuenta cuántas líneas salen de cada punto. Si hay más de dos puntos con un número impar de líneas, es imposible. Si hay dos, empieza en uno de ellos.</li>
        <li>Si se acaba el tiempo pierdes una vida. Tienes 3.</li>
      </ul>
    </AyudaUnJugador>
  );

  if (fase === 'portada') {
    return (
      <div className="ut-contenedor">
        <PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record}
          textoRecord={(r) => `${r.valor} ${r.valor === 1 ? 'figura' : 'figuras'}`} />
        {ayudaModal}
      </div>
    );
  }

  if (fase === 'fin') {
    return (
      <div className="ut-contenedor">
        <FinUnJugador
          icono="edit"
          etiqueta="Te has quedado sin vidas"
          titulo={resueltas >= 15 ? '¡Pulso de cirujano!' : resueltas >= 7 ? '¡Gran trazo!' : 'Fin de la partida'}
          puntos={resueltas}
          unidad={resueltas === 1 ? 'figura resuelta' : 'figuras resueltas'}
          nuevoRecord={nuevoRecord}
          record={record}
          textoRecord={(r) => `${r.valor} figuras`}
          exito={resueltas > 0}
          onRepetir={empezar}
          onMenu={() => setFase('portada')}
        />
      </div>
    );
  }

  const ultimo = camino[camino.length - 1];
  const enResultado = fase === 'resultado';
  const textoResultado = resultado && {
    dibujada: '¡Dibujada de un solo trazo!',
    imposible: '¡Bien visto! Era imposible.',
    eraPosible: 'Se podía dibujar…',
    tiempo: '¡Se acabó el tiempo!'
  }[resultado.motivo];

  return (
    <div className="ut-contenedor qq-en-partida">
      <Aviso {...aviso} />
      <section className="game uj-escena">
        <CabeceraPartida
          onSalir={() => setSalir(true)}
          chips={[
            <><Icon name="check" size={14} /> {resueltas}</>,
            <>{Array.from({ length: VIDAS }, (_, i) => (i < vidas ? '❤️' : '🖤')).join('')}</>
          ]}
        >
          <div className="ut-progreso">
            <span>Figura {nivel}</span>
            <span>{usadas.size} / {total} líneas</span>
          </div>
        </CabeceraPartida>

        {!enResultado && <Barra valor={restante / segundosPara(nivel)} etiqueta={`${Math.ceil(restante)} s`} invertida />}

        <div className={`ut-lienzo${enResultado ? (resultado.ok ? ' ok' : ' mal') : ''}`}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${ANCHO} ${ALTO}`}
            onPointerDown={alPulsar}
            onPointerMove={alMover}
            onPointerUp={alSoltar}
            onPointerCancel={alSoltar}
          >
            {figura.aristas.map((k) => {
              const [a, b] = k.split('-').map(Number);
              const [x1, y1] = xy(a); const [x2, y2] = xy(b);
              return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} className={`ut-linea${usadas.has(k) ? ' usada' : ''}`} />;
            })}
            {puntero && ultimo != null && fase === 'juego' && (
              <line x1={xy(ultimo)[0]} y1={xy(ultimo)[1]} x2={puntero[0]} y2={puntero[1]} className="ut-goma" />
            )}
            {nodos.map((n) => {
              const [x, y] = xy(n);
              return (
                <g key={n} className={`ut-nodo${n === ultimo ? ' actual' : ''}${n === camino[0] ? ' inicio' : ''}`}>
                  <circle cx={x} cy={y} r="17" />
                </g>
              );
            })}
          </svg>
          {enResultado && <div className="ut-cartel">{textoResultado}</div>}
        </div>

        <div className="uj-acciones">
          {enResultado ? (
            <button type="button" className="uj-boton grande" onClick={siguiente}>
              {vidas <= 0 ? <><Icon name="flagFinish" size={20} /> Ver resultado</> : <><Icon name="forward" size={20} /> Siguiente figura</>}
            </button>
          ) : (
            <div className="uj-fila">
              <button type="button" className="uj-boton secundario" onClick={reiniciar} disabled={!camino.length}><Icon name="refresh" size={18} /> Borrar</button>
              <button type="button" className="uj-boton peligro" onClick={imposible}><Icon name="x" size={18} /> ¡Es imposible!</button>
            </div>
          )}
        </div>
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
