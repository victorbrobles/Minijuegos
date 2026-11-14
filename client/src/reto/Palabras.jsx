// client/src/reto/Palabras.jsx — retos de palabras: Ahorcado y Anagramas
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Barra } from '../components/UnJugador.jsx';

const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''); // las palabras van sin tildes (la Ñ, como N)
const limpiar = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-ZÑ]/g, '');

export function Ahorcado({ datos, onFin }) {
  const { palabras, fallos: maxFallos, umbral } = datos;
  const [k, setK] = useState(0);
  const [letras, setLetras] = useState([]);
  const [hechas, setHechas] = useState([]); // true/false por palabra
  const w = palabras[k];
  const fallos = letras.filter((l) => !w.palabra.includes(l)).length;
  const completa = [...w.palabra].every((c) => c === ' ' || letras.includes(c));
  const terminada = completa || fallos >= maxFallos;
  useEffect(() => {
    if (terminada && hechas.length === k) setHechas((h) => [...h, completa]);
  }, [terminada]); // eslint-disable-line react-hooks/exhaustive-deps
  const seguir = () => {
    if (k + 1 >= palabras.length) { const n = hechas.filter(Boolean).length; onFin(n >= umbral, n, `${n} de ${palabras.length} palabras`); return; }
    setK(k + 1); setLetras([]);
  };
  return (
    <div className="rto-juego">
      <div className="rto-progreso"><span>Palabra {k + 1} de {palabras.length}</span><span>✅ {hechas.filter(Boolean).length} · necesitas {umbral}</span></div>
      <div className="uj-tarjeta rto-pregunta">
        <span className="rto-etiqueta">💡 {w.pista}</span>
        <div className="rto-ahorcado">
          {[...w.palabra].map((c, i) => (c === ' ' ? <span key={i} className="hueco" /> : <span key={i} className={terminada && !letras.includes(c) ? 'falta' : ''}>{letras.includes(c) || terminada ? c : ''}</span>))}
        </div>
        <p className="rto-vidas">{'❤️'.repeat(maxFallos - fallos)}{'🖤'.repeat(fallos)}</p>
        {!terminada ? (
          <div className="rto-teclado">
            {ABC.map((l) => <button key={l} type="button" disabled={letras.includes(l)} className={letras.includes(l) ? (w.palabra.includes(l) ? 'bien' : 'mal') : ''} onClick={() => setLetras((x) => [...x, l])}>{l}</button>)}
          </div>
        ) : <p className={`rto-veredicto ${completa ? 'bien' : 'mal'}`}>{completa ? '¡Adivinada!' : `Era «${w.palabra}»`}</p>}
      </div>
      {terminada && <button type="button" className="uj-boton grande" onClick={seguir}>{k + 1 >= palabras.length ? <><Icon name="flagFinish" size={20} /> Ver resultado</> : <><Icon name="forward" size={20} /> Siguiente palabra</>}</button>}
    </div>
  );
}

export function Anagramas({ datos, onFin }) {
  const { palabras, segundos, umbral } = datos;
  const [k, setK] = useState(0);
  const [texto, setTexto] = useState('');
  const [bien, setBien] = useState(0);
  const [restante, setRestante] = useState(segundos);
  const fin = useRef(Date.now() + segundos * 1000);
  const acabado = useRef(false);
  const bienRef = useRef(0);
  const terminar = (n) => { if (acabado.current) return; acabado.current = true; onFin(n >= umbral, n, `${n} de ${palabras.length} palabras`); };
  useEffect(() => {
    const t = setInterval(() => { const r = Math.max(0, (fin.current - Date.now()) / 1000); setRestante(r); if (r <= 0) terminar(bienRef.current); }, 100);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const w = palabras[k];
  const avanzar = (acierto) => {
    const n = bienRef.current + (acierto ? 1 : 0);
    bienRef.current = n; setBien(n); setTexto('');
    if (k + 1 >= palabras.length) terminar(n); else setK(k + 1);
  };
  const escribir = (v) => {
    setTexto(v);
    if (limpiar(v) === limpiar(w.palabra)) avanzar(true);
  };
  return (
    <div className="rto-juego">
      <div className="rto-progreso"><span>Palabra {k + 1} de {palabras.length}</span><span>✅ {bien} · necesitas {umbral}</span></div>
      <Barra valor={restante / segundos} etiqueta={`${Math.ceil(restante)} s`} invertida />
      <div className="uj-tarjeta rto-pregunta">
        <span className="rto-etiqueta">💡 {w.pista}</span>
        <div className="rto-letras">{[...w.desordenada].map((c, i) => <span key={i}>{c}</span>)}</div>
        <input className="rto-input" value={texto} onChange={(e) => escribir(e.target.value)} placeholder="Escribe la palabra" autoFocus autoComplete="off" autoCapitalize="characters" />
        <button type="button" className="uj-boton secundario" style={{ marginTop: '0.6rem', width: '100%' }} onClick={() => avanzar(false)}>Saltar esta palabra</button>
      </div>
    </div>
  );
}
