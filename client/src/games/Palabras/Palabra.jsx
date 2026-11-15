// client/src/games/Palabras/Palabra.jsx
// «Palabra oculta» (1 jugador): adivina palabras ocultas cada vez más largas (dos de 3 letras, dos de 4… hasta 8,
// y luego palabras de 8 sin fin). Seis intentos por palabra con pistas de colores. En cuanto fallas una, se acaba.
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { PortadaUnJugador, CabeceraPartida, FinUnJugador, ConfirmarSalida, useRecord } from '../../components/UnJugador.jsx';
import { cargarSolo, Cargando, RetoAmigo } from '../Solo/comun.jsx';
import { sonar, vibrar } from '../../lib/sonido.js';
import './Palabras.css';
import { useAbrirAyuda } from '../../lib/ayuda.js';

const ID = 'palabra';
const INTENTOS = 6;
const ESCALONES = 12; // 2 de cada longitud, de 3 a 8 letras; después, modo sin fin con palabras de 8
const fmt = (n) => n.toLocaleString('es-ES');
const TECLADO = ['qwertyuiop', 'asdfghjklñ', '↵zxcvbnm⌫'];
export const limpiar = (t) => String(t).toLowerCase().replace(/ñ/g, '\u0001').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\u0001/g, 'ñ').replace(/[^a-zñ]/g, '');

/** Colores de un intento: 'v' (bien colocada), 'a' (está en otro sitio) o 'g' (no está). Respeta las letras repetidas. */
export function colorear(intento, objetivo) {
  const res = Array(intento.length).fill('g');
  const quedan = {};
  for (let i = 0; i < objetivo.length; i++) {
    if (intento[i] === objetivo[i]) res[i] = 'v';
    else quedan[objetivo[i]] = (quedan[objetivo[i]] || 0) + 1;
  }
  for (let i = 0; i < intento.length; i++) {
    if (res[i] !== 'v' && quedan[intento[i]]) { res[i] = 'a'; quedan[intento[i]]--; }
  }
  return res;
}
/** Puntos por acertar: más por palabras largas y por intentos que sobren. */
export const puntosDe = (largo, intento) => largo * 10 + (INTENTOS - intento) * largo * 3;

async function existe(p) {
  try {
    const r = await fetch('/api/solo/palabras/existe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ palabra: p }) });
    const d = await r.json();
    return !!d.existe;
  } catch { return true; } // sin conexión: no bloqueamos al jugador
}

export default function Palabra() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada');
  const [error, setError] = useState('');
  const abrirAyuda = useAbrirAyuda();
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [lista, setLista] = useState([]);
  const [k, setK] = useState(0);
  const [intentos, setIntentos] = useState([]);
  const [actual, setActual] = useState('');
  const [aviso, setAviso] = useState(null);
  const [agita, setAgita] = useState(false);
  const [estado, setEstado] = useState('jugando'); // jugando · acierto · fallo
  const [puntos, setPuntos] = useState(0);
  const [comprobando, setComprobando] = useState(false);

  const objetivo = lista[k] || '';
  const largo = objetivo.length;

  const empezar = async () => {
    setFase('cargando'); setError('');
    try {
      const d = await cargarSolo(ID);
      setLista(d.palabras); setK(0); setIntentos([]); setActual(''); setPuntos(0); setEstado('jugando'); setAviso(null);
      setFase('jugando');
    } catch (e) { setError(e.message); }
  };
  const avisar = (texto) => { setAviso(texto); setAgita(true); setTimeout(() => setAgita(false), 450); setTimeout(() => setAviso((a) => (a === texto ? null : a)), 1600); };

  const terminar = useCallback((pts, aciertos) => {
    setNuevoRecord(pts > 0 && registrar(pts, { palabras: aciertos }));
    setFase('fin');
  }, [registrar]);

  const enviar = async () => {
    if (estado !== 'jugando' || comprobando) return;
    if (actual.length < largo) { avisar(`Faltan letras: son ${largo}`); return; }
    if (actual !== objetivo) {
      setComprobando(true);
      const ok = await existe(actual);
      setComprobando(false);
      if (!ok) { avisar('No está en el diccionario'); sonar('fallo'); return; }
    }
    const nuevos = [...intentos, actual];
    setIntentos(nuevos); setActual('');
    if (actual === objetivo) {
      const p = puntosDe(largo, nuevos.length);
      setPuntos((x) => x + p); setEstado('acierto'); sonar('acierto'); vibrar(30);
    } else if (nuevos.length >= INTENTOS) {
      setEstado('fallo'); sonar('fallo'); vibrar([60, 40, 60]);
    } else sonar('toque');
  };
  const siguiente = () => { setK((x) => x + 1); setIntentos([]); setActual(''); setEstado('jugando'); };
  const pulsar = (t) => {
    if (estado !== 'jugando') return;
    if (t === '⌫') setActual((a) => a.slice(0, -1));
    else if (t === '↵') enviar();
    else setActual((a) => (a.length < largo ? a + t : a));
  };

  // Teclado físico
  useEffect(() => {
    if (fase !== 'jugando') return undefined;
    const tecla = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') { e.preventDefault(); if (estado === 'acierto') siguiente(); else pulsar('↵'); }
      else if (e.key === 'Backspace') pulsar('⌫');
      else { const l = limpiar(e.key); if (l.length === 1) pulsar(l); }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });

  // Colores del teclado: el mejor color visto para cada letra
  const teclas = {};
  for (const intento of intentos) {
    colorear(intento, objetivo).forEach((c, i) => {
      const l = intento[i]; const ant = teclas[l];
      if (c === 'v' || (c === 'a' && ant !== 'v') || (!ant)) teclas[l] = c;
    });
  }

  if (fase === 'portada' || fase === 'cargando') {
    if (fase === 'cargando') return <Cargando error={error} onReintentar={empezar} />;
    return <><PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={abrirAyuda} record={record}
      textoRecord={(r) => `${fmt(r.valor)} puntos${r.palabras != null ? ` · ${r.palabras} palabras` : ''}`} /></>;
  }
  const aciertos = k + (estado === 'acierto' ? 1 : 0);
  if (fase === 'fin') {
    return (
      <FinUnJugador icono={aciertos >= ESCALONES ? 'crown' : 'trophy'} etiqueta={`La palabra era «${objetivo.toUpperCase()}»`}
        titulo={aciertos >= ESCALONES ? '¡Leyenda de las palabras!' : aciertos >= 8 ? '¡Gran racha!' : aciertos >= 4 ? 'Nada mal' : 'A la próxima'}
        puntos={fmt(puntos)} unidad="puntos" nuevoRecord={nuevoRecord} record={record} textoRecord={(r) => `${fmt(r.valor)} puntos`}
        exito={aciertos > 0} onRepetir={empezar} onMenu={() => setFase('portada')}>
        <p className="uj-mini">Acertaste {aciertos} {aciertos === 1 ? 'palabra' : 'palabras'}{aciertos >= ESCALONES ? ` (${aciertos - ESCALONES} en el modo sin fin)` : ''}.</p>
        <RetoAmigo juego={ID} puntos={puntos} formato={(x) => `${fmt(x)} puntos`} />
      </FinUnJugador>
    );
  }

  const filas = Array.from({ length: INTENTOS }, (_, i) => intentos[i] ?? (i === intentos.length && estado === 'jugando' ? actual : ''));
  return (
    <div className="qq-en-partida">
      <section className="game uj-escena pal-escena">
        <CabeceraPartida onSalir={() => setSalir(true)} chips={[
          <>🔤 Nº {k + 1} · {largo} letras</>,
          <><Icon name="star" size={14} /> {fmt(puntos)}</>
        ]} />
        <div className="pal-escalones" aria-label="Progreso">
          {Array.from({ length: ESCALONES }, (_, i) => {
            const n = 3 + Math.floor(i / 2);
            return <span key={i} className={i < aciertos ? 'hecho' : i === k ? 'actual' : ''}>{n}</span>;
          })}
          {k >= ESCALONES && <span className="actual sinfin">∞ {k - ESCALONES + 1}</span>}
        </div>
        <div className={`pal-tablero largo-${largo}`} style={{ '--n': largo }}>
          {filas.map((f, i) => {
            const colores = i < intentos.length ? colorear(intentos[i], objetivo) : null;
            return (
              <div key={i} className={`pal-fila${agita && i === intentos.length ? ' agita' : ''}`}>
                {Array.from({ length: largo }, (_, j) => (
                  <span key={j} className={`pal-casilla${colores ? ` ${colores[j]} girada` : f[j] ? ' llena' : ''}`} style={colores ? { animationDelay: `${j * 0.09}s` } : undefined}>
                    {(f[j] || '').toUpperCase()}
                  </span>
                ))}
              </div>
            );
          })}
          {aviso && <p className="pal-aviso">{aviso}</p>}
        </div>
        {estado === 'jugando' ? (
          <div className="pal-teclado">
            {TECLADO.map((fila) => (
              <div key={fila}>
                {[...fila].map((t) => (
                  <button key={t} type="button" className={`${t === '↵' || t === '⌫' ? 'ancha ' : ''}${teclas[t] || ''}`} onClick={() => pulsar(t)} disabled={comprobando}>
                    {t === '↵' ? 'ENVIAR' : t === '⌫' ? <Icon name="close" size={18} /> : t.toUpperCase()}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className={`uj-tarjeta pal-resultado ${estado}`}>
            {estado === 'acierto' ? (
              <>
                <h3>¡Correcto! +{puntosDe(largo, intentos.length)}</h3>
                <p>{intentos.length === 1 ? '¡A la primera!' : `En ${intentos.length} intentos.`}{k + 1 === ESCALONES ? ' Has completado la escalera: ahora, palabras de 8 sin fin.' : ''}</p>
                <button type="button" className="uj-boton grande" onClick={siguiente}>
                  <Icon name="forward" size={20} /> Siguiente: {(lista[k + 1] || '').length} letras
                </button>
              </>
            ) : (
              <>
                <h3>Era «{objetivo.toUpperCase()}»</h3>
                <p>Se acabaron los intentos.</p>
                <button type="button" className="uj-boton grande" onClick={() => terminar(puntos, k)}>Ver resultado</button>
              </>
            )}
          </div>
        )}
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
      
    </div>
  );
}
