// client/src/reto/Habilidad.jsx — retos de habilidad: colores trampa (Stroop), reflejos y parejas de cartas
import React, { useEffect, useRef, useState } from 'react';
import { Barra } from '../components/UnJugador.jsx';

const COLOR = { rojo: '#ef4444', azul: '#3b82f6', verde: '#22c55e', amarillo: '#eab308' };

export function Stroop({ datos, onFin }) {
  const { items, segundos, umbral } = datos;
  const [i, setI] = useState(0);
  const [bien, setBien] = useState(0);
  const [flash, setFlash] = useState(null);
  const [restante, setRestante] = useState(segundos);
  const fin = useRef(Date.now() + segundos * 1000);
  const acabado = useRef(false); const bienRef = useRef(0);
  const terminar = (n) => { if (acabado.current) return; acabado.current = true; onFin(n >= umbral, n, `${n} de ${items.length} colores`); };
  useEffect(() => {
    const t = setInterval(() => { const r = Math.max(0, (fin.current - Date.now()) / 1000); setRestante(r); if (r <= 0) terminar(bienRef.current); }, 100);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const tocar = (c) => {
    const ok = c === items[i].tinta;
    const n = bienRef.current + (ok ? 1 : 0); bienRef.current = n; setBien(n);
    setFlash({ ok, k: Math.random() });
    if (i + 1 >= items.length) terminar(n); else setI(i + 1);
  };
  const it = items[i];
  return (
    <div className="rto-juego">
      <div className="rto-progreso"><span>{i + 1} de {items.length}</span><span>✅ {bien} · necesitas {umbral}</span></div>
      <Barra valor={restante / segundos} etiqueta={`${Math.ceil(restante)} s`} invertida />
      <div className="uj-tarjeta rto-stroop">
        <p className="uj-etiqueta">Toca el color de la TINTA</p>
        <p key={i} className="rto-stroop-palabra" style={{ color: COLOR[it.tinta] }}>{it.palabra.toUpperCase()}</p>
        {flash && <span key={flash.k} className={`rto-flash ${flash.ok ? 'bien' : 'mal'}`}>{flash.ok ? '✓' : '✗'}</span>}
      </div>
      <div className="rto-stroop-botones">
        {Object.keys(COLOR).map((c) => <button key={c} type="button" style={{ '--c': COLOR[c] }} onClick={() => tocar(c)}>{c}</button>)}
      </div>
    </div>
  );
}

export function Reflejos({ datos, onFin }) {
  const { esperas, objetivo } = datos;
  const [k, setK] = useState(0);
  const [estado, setEstado] = useState('listo'); // listo | espera | ya | resultado
  const [tiempos, setTiempos] = useState([]);
  const [pronto, setPronto] = useState(false);
  const t0 = useRef(0); const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const arrancar = () => {
    setEstado('espera');
    timer.current = setTimeout(() => { t0.current = performance.now(); setEstado('ya'); }, esperas[k]);
  };
  const tocar = () => {
    if (estado === 'listo' || estado === 'resultado') { if (k < esperas.length) arrancar(); return; }
    let ms;
    const antes = estado === 'espera'; setPronto(antes);
    if (antes) { clearTimeout(timer.current); ms = 1000; } else ms = Math.min(1000, Math.round(performance.now() - t0.current));
    const l = [...tiempos, ms]; setTiempos(l);
    if (l.length >= esperas.length) {
      const media = Math.round(l.reduce((a, b) => a + b, 0) / l.length);
      setEstado('fin');
      setTimeout(() => onFin(media < objetivo, media, `Media de ${media} ms`), 900);
      return;
    }
    setK(k + 1); setEstado('resultado');
  };
  const ultimo = tiempos.at(-1);
  const texto = {
    listo: 'Toca para empezar',
    espera: 'Espera al verde…',
    ya: '¡TOCA!',
    resultado: pronto ? '¡Demasiado pronto! (1000 ms) · Toca para seguir' : `${ultimo} ms · Toca para el siguiente`,
    fin: `Media: ${Math.round(tiempos.reduce((a, b) => a + b, 0) / Math.max(1, tiempos.length))} ms`
  }[estado];
  return (
    <div className="rto-juego">
      <div className="rto-progreso"><span>Intento {Math.min(k + 1, esperas.length)} de {esperas.length}</span><span>Objetivo: media &lt; {objetivo} ms</span></div>
      <button type="button" className={`rto-reflejos ${estado}`} onPointerDown={(e) => { e.preventDefault(); tocar(); }}>{texto}</button>
      {tiempos.length > 0 && <p className="rto-estado">{tiempos.map((t) => `${t} ms`).join(' · ')}</p>}
    </div>
  );
}

export function Parejas({ datos, onFin }) {
  const { cartas, maxIntentos } = datos;
  const [abiertas, setAbiertas] = useState([]);
  const [hechas, setHechas] = useState([]);
  const [intentos, setIntentos] = useState(0);
  const bloqueo = useRef(false);
  const tocar = (i) => {
    if (bloqueo.current || abiertas.includes(i) || hechas.includes(i)) return;
    const a = [...abiertas, i]; setAbiertas(a);
    if (a.length < 2) return;
    const n = intentos + 1; setIntentos(n);
    bloqueo.current = true;
    const pareja = cartas[a[0]] === cartas[a[1]];
    setTimeout(() => {
      const h = pareja ? [...hechas, ...a] : hechas;
      setHechas(h); setAbiertas([]); bloqueo.current = false;
      if (h.length === cartas.length) onFin(true, n, `${n} intentos`);
      else if (n >= maxIntentos) onFin(false, n, `${h.length / 2} de ${cartas.length / 2} parejas`);
    }, pareja ? 350 : 800);
  };
  return (
    <div className="rto-juego">
      <div className="rto-progreso"><span>Parejas: {hechas.length / 2} de {cartas.length / 2}</span><span>Intentos: {intentos} de {maxIntentos}</span></div>
      <div className="rto-cartas">
        {cartas.map((c, i) => {
          const vista = abiertas.includes(i) || hechas.includes(i);
          return <button key={i} type="button" className={`rto-carta${vista ? ' vista' : ''}${hechas.includes(i) ? ' hecha' : ''}`} onClick={() => tocar(i)}>{vista ? c : '?'}</button>;
        })}
      </div>
    </div>
  );
}
