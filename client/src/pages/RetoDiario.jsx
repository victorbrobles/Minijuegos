// client/src/pages/RetoDiario.jsx
// «Reto diario»: un reto de un jugador distinto cada día (el mismo para todos). Un solo intento por jugador:
// cuenta desde que se pulsa «Empezar». Si ya se ha hecho, solo se ve si se superó o se falló.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { nombreCompleto, nombreIdentidad } from '../lib/identidad.js';
import Quiz from '../reto/Quiz.jsx';
import Ordenar from '../reto/Ordenar.jsx';
import Memoria from '../reto/Memoria.jsx';
import Calculo from '../reto/Calculo.jsx';
import Famoso from '../reto/Famoso.jsx';
import { Ahorcado, Anagramas } from '../reto/Palabras.jsx';
import { Stroop, Reflejos, Parejas } from '../reto/Habilidad.jsx';
import { Aproximar, Seleccionar } from '../reto/Varios.jsx';
import Crimen from '../games/Crimen/Crimen.jsx';
import '../components/UnJugador.css';
import '../reto/Reto.css';

const MODOS = {
  quiz: Quiz, ordenar: Ordenar, memoria: Memoria, calculo: Calculo, famoso: Famoso, ahorcado: Ahorcado, anagramas: Anagramas,
  stroop: Stroop, reflejos: Reflejos, parejas: Parejas, aproximar: Aproximar, seleccionar: Seleccionar
};
const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  .then(async (r) => ({ ok: r.ok, datos: await r.json().catch(() => ({})) }));

export function tiempoRestante(ms) {
  const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}
export const fechaLarga = (f) => new Date(`${f}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

/** Reto de hoy y el intento del jugador (para la portada y la página). */
export function useRetoHoy() {
  const [reto, setReto] = useState(null);
  const [error, setError] = useState('');
  const cargar = () => fetch(`/api/reto/hoy?jugador=${encodeURIComponent(nombreCompleto())}`)
    .then((r) => r.json()).then((d) => (d.success ? setReto(d) : setError(d.error || 'No se ha podido cargar el reto.')))
    .catch(() => setError('No se ha podido cargar el reto.'));
  useEffect(() => { cargar(); }, []);
  return [reto, setReto, error, cargar];
}

function Resultado({ reto, intento }) {
  const ok = intento.estado === 'superado';
  return (
    <div className={`uj-tarjeta rto-resultado ${ok ? 'ok' : 'mal'}`}>
      <span className="rto-sello">{ok ? '🏆' : '💥'}</span>
      <p className="uj-etiqueta">Reto diario · {fechaLarga(reto.fecha)}</p>
      <h2>{ok ? '¡Reto diario superado!' : 'Reto diario fallado'}</h2>
      <p className="rto-detalle">{reto.emoji} {reto.titulo}{intento.resumen ? ` · ${intento.resumen}` : ''}{intento.abandonado ? ' · lo dejaste a medias' : ''}</p>
      <p className="rto-siguiente"><Icon name="clock" size={16} /> El próximo reto llega en <b>{tiempoRestante(reto.siguienteEn)}</b></p>
      {reto.hoy?.intentos > 0 && <p className="rto-mini">Hoy lo han superado {reto.hoy.superados} de {reto.hoy.intentos} jugadores.</p>}
    </div>
  );
}

export default function RetoDiario() {
  const [reto, setReto, error, cargar] = useRetoHoy();
  const [fase, setFase] = useState('intro'); // intro | jugando
  const [aviso, setAviso] = useState('');
  const jugador = nombreCompleto();

  useEffect(() => {
    const e = document.body.style;
    e.setProperty('--g1', '#f59e0b'); e.setProperty('--g2', '#7c2d12');
    return () => { e.removeProperty('--g1'); e.removeProperty('--g2'); };
  }, []);

  const empezar = async () => {
    const r = await post('/api/reto/empezar', { jugador });
    if (!r.ok) { setAviso(r.datos.error || 'No se ha podido empezar.'); cargar(); return; }
    setFase('jugando');
  };
  const terminar = async (superado, puntos, resumen) => {
    const r = await post('/api/reto/terminar', { jugador, fecha: reto.fecha, superado, puntos, resumen });
    setReto((x) => ({ ...x, intento: r.datos.intento || { estado: superado ? 'superado' : 'fallado', resumen } }));
    setFase('intro');
    cargar();
  };

  let cuerpo;
  if (error) cuerpo = <p className="error">{error}</p>;
  else if (!reto) cuerpo = <p className="loading">Cargando el reto de hoy…</p>;
  else if (reto.intento && fase !== 'jugando') cuerpo = <Resultado reto={reto} intento={reto.intento} />;
  else if (fase === 'jugando') {
    if (reto.datos.modo === 'crimen') return <Crimen reto={{ ...reto.datos, onFin: (gana, s) => terminar(gana, s, gana ? `Resuelto en ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : 'Acusaste a quien no era') }} />;
    const Modo = MODOS[reto.datos.modo];
    cuerpo = (
      <>
        <header className="uj-hero rto-hero-mini"><span>{reto.emoji}</span><b>Reto diario · {reto.titulo}</b></header>
        <Modo datos={reto.datos} onFin={terminar} />
      </>
    );
  } else {
    cuerpo = (
      <div className="uj-tarjeta rto-intro">
        <span className="rto-emoji">{reto.emoji}</span>
        <p className="uj-etiqueta">Reto diario · {fechaLarga(reto.fecha)}</p>
        <h1>{reto.titulo}</h1>
        <span className="rto-tema">{reto.tema}</span>
        <p className="rto-desc">{reto.descripcion}</p>
        <p className="rto-unico">⚠️ Solo tienes <b>un intento</b>, {nombreIdentidad()}. Si sales a mitad, contará como fallado.</p>
        {aviso && <p className="error">{aviso}</p>}
        <button type="button" className="big full qq-btn-principal" onClick={empezar}><Icon name="play" size={22} /> Empezar el reto</button>
        {reto.hoy?.intentos > 0 && <p className="rto-mini">Hoy lo han superado {reto.hoy.superados} de {reto.hoy.intentos} jugadores.</p>}
      </div>
    );
  }

  return (
    <div className="game-shell rto-pagina" style={{ '--g1': '#f59e0b', '--g2': '#7c2d12' }}>
      {fase !== 'jugando' && (
        <Link to="/" className="back" aria-label="Volver a la portada"><Icon name="arrowLeft" size={20} strokeWidth={2.5} /><span>Portada</span></Link>
      )}
      <section className="game uj-escena rto-escena">{cuerpo}</section>
    </div>
  );
}
