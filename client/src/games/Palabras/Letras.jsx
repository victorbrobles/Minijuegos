// client/src/games/Palabras/Letras.jsx
// «Letras en cadena» (1 jugador): con 7 letras, forma todas las palabras que puedas (de 3 a 7 letras) en 2 minutos.
// Cada letra se usa una vez por palabra. Las palabras largas valen mucho más y usar las 7 letras da premio.
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, useRecord, Barra } from '../../components/UnJugador.jsx';
import { cargarSolo, useCuenta, Cargando, RetoAmigo } from '../Solo/comun.jsx';
import { sonar, vibrar } from '../../lib/sonido.js';
import { limpiar } from './Palabra.jsx';
import './Palabras.css';

const ID = 'letras';
const fmt = (n) => n.toLocaleString('es-ES');
export const VALOR = { 3: 1, 4: 2, 5: 4, 6: 7, 7: 12 };
export const PREMIO_SIETE = 10;
export const valorDe = (p) => (VALOR[p.length] || 0) + (p.length === 7 ? PREMIO_SIETE : 0);
const barajar = (l) => { const b = [...l]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export default function Letras() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada');
  const [error, setError] = useState('');
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [datos, setDatos] = useState(null);
  const [orden, setOrden] = useState([]); // índices de las letras en el orden en que se muestran
  const [elegidas, setElegidas] = useState([]); // índices pulsados
  const [halladas, setHalladas] = useState([]);
  const [aviso, setAviso] = useState(null);
  const cuenta = useCuenta(fase === 'jugando', () => acabar());

  const validas = useMemo(() => new Set(datos?.validas || []), [datos]);
  const puntos = halladas.reduce((s, p) => s + valorDe(p), 0);
  const palabra = elegidas.map((i) => datos.letras[i]).join('');

  const empezar = async () => {
    setFase('cargando'); setError('');
    try {
      const d = await cargarSolo(ID);
      setDatos(d); setOrden(d.letras.map((_, i) => i)); setElegidas([]); setHalladas([]); setAviso(null);
      cuenta.empezar(d.segundos || 120); setFase('jugando');
    } catch (e) { setError(e.message); }
  };
  function acabar() {
    setFase((f) => {
      if (f !== 'jugando') return f;
      return 'fin';
    });
  }
  useEffect(() => {
    if (fase === 'fin' && datos) setNuevoRecord(puntos > 0 && registrar(puntos, { palabras: halladas.length }));
  }, [fase]); // eslint-disable-line react-hooks/exhaustive-deps

  const avisar = (texto, tipo) => { setAviso({ texto, tipo }); setTimeout(() => setAviso((a) => (a?.texto === texto ? null : a)), 1300); };
  const enviar = () => {
    if (!palabra) return;
    if (palabra.length < 3) avisar('Mínimo 3 letras', 'mal');
    else if (halladas.includes(palabra)) avisar('Ya la tienes', 'mal');
    else if (!validas.has(palabra)) { avisar('No vale', 'mal'); sonar('fallo'); vibrar(40); }
    else {
      setHalladas((h) => [palabra, ...h]);
      const v = valorDe(palabra);
      avisar(palabra.length === 7 ? `¡Las 7 letras! +${v}` : `+${v}`, palabra.length === 7 ? 'top' : 'bien');
      sonar(palabra.length === 7 ? 'victoria' : 'acierto'); vibrar(20);
    }
    setElegidas([]);
  };
  const pulsarLetra = (i) => { if (!elegidas.includes(i)) { setElegidas((e) => [...e, i]); sonar('toque', { vibrar: false }); } };

  // Teclado físico: escribe usando las letras disponibles
  useEffect(() => {
    if (fase !== 'jugando') return undefined;
    const tecla = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') { e.preventDefault(); enviar(); return; }
      if (e.key === 'Backspace') { setElegidas((x) => x.slice(0, -1)); return; }
      if (e.key === ' ') { e.preventDefault(); setOrden((o) => barajar(o)); return; }
      const l = limpiar(e.key);
      if (l.length !== 1) return;
      const i = datos.letras.findIndex((x, j) => x === l && !elegidas.includes(j));
      if (i >= 0) pulsarLetra(i);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Tienes <b>7 letras</b> y <b>2 minutos</b>. Forma todas las palabras que puedas de <b>3 a 7 letras</b>, usando cada letra una sola vez por palabra.</p>
      <p>Valen: 3 letras <b>1</b> · 4 letras <b>2</b> · 5 letras <b>4</b> · 6 letras <b>7</b> · 7 letras <b>12 + {PREMIO_SIETE} de premio</b>.</p>
      <p>🔎 Siempre hay al menos una palabra que usa <b>las 7 letras</b>. ¡Búscala!</p>
      <p>Valen las formas de los verbos, los plurales y los femeninos (por ejemplo «cantas», «rojas»). Las tildes no cuentan.</p>
      <p>Con teclado: escribe, <b>Intro</b> para enviar, <b>Espacio</b> para mezclar.</p>
    </AyudaUnJugador>
  );

  if (fase === 'portada' || fase === 'cargando') {
    if (fase === 'cargando') return <Cargando error={error} onReintentar={empezar} />;
    return <><PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record}
      textoRecord={(r) => `${fmt(r.valor)} puntos${r.palabras != null ? ` · ${r.palabras} palabras` : ''}`} />{ayudaModal}</>;
  }
  if (fase === 'fin') {
    const siete = halladas.filter((p) => p.length === 7);
    const escapadas = (datos.validas || []).filter((p) => p.length >= 5 && !halladas.includes(p)).sort((a, b) => b.length - a.length).slice(0, 18);
    return (
      <FinUnJugador icono="trophy" etiqueta="¡Tiempo!" titulo={puntos >= 80 ? '¡Maestro de las letras!' : puntos >= 40 ? '¡Muy bien!' : puntos > 0 ? 'Buen intento' : 'Sin palabras'}
        puntos={fmt(puntos)} unidad="puntos" nuevoRecord={nuevoRecord} record={record} textoRecord={(r) => `${fmt(r.valor)} puntos`}
        exito={puntos > 0} onRepetir={empezar} onMenu={() => setFase('portada')}>
        <p className="uj-mini">{halladas.length} palabras de {datos.validas.length} posibles.</p>
        <p className="let-secreta">{siete.length ? '🔎 ¡Encontraste la de 7 letras!' : '🔎 Con las 7 letras:'} <b>{(siete[0] || datos.secretas[0] || '').toUpperCase()}</b>
          {datos.secretas.length > 1 && <small> (y {datos.secretas.length - 1} más)</small>}</p>
        {escapadas.length > 0 && (
          <div className="let-escapadas"><small>Algunas que se te escaparon:</small><p>{escapadas.map((p) => <span key={p}>{p}</span>)}</p></div>
        )}
        <RetoAmigo juego={ID} puntos={puntos} formato={(x) => `${fmt(x)} puntos`} />
      </FinUnJugador>
    );
  }

  const grupos = [7, 6, 5, 4, 3].map((n) => [n, halladas.filter((p) => p.length === n)]).filter(([, l]) => l.length);
  return (
    <div className="qq-en-partida">
      <section className="game uj-escena let-escena">
        <CabeceraPartida onSalir={() => setSalir(true)} chips={[
          <><Icon name="star" size={14} /> {fmt(puntos)}</>,
          <>📚 {halladas.length}/{datos.validas.length}</>
        ]} />
        <Barra valor={cuenta.restante / (datos.segundos || 120)} etiqueta={`${Math.ceil(cuenta.restante)} s`} invertida />
        <div className="uj-tarjeta let-mesa">
          <div className={`let-palabra${aviso ? ` ${aviso.tipo}` : ''}`}>
            {aviso ? aviso.texto : palabra ? palabra.toUpperCase() : <span>Toca las letras</span>}
          </div>
          <div className="let-fichas">
            {orden.map((i) => (
              <button key={i} type="button" className={elegidas.includes(i) ? 'usada' : ''} disabled={elegidas.includes(i)} onClick={() => pulsarLetra(i)}>
                {datos.letras[i].toUpperCase()}
              </button>
            ))}
          </div>
          <div className="let-acciones">
            <button type="button" onClick={() => setElegidas((x) => x.slice(0, -1))} disabled={!elegidas.length}><Icon name="close" size={16} /> Borrar</button>
            <button type="button" onClick={() => setOrden((o) => barajar(o))}><Icon name="refresh" size={16} /> Mezclar</button>
            <button type="button" className="enviar" onClick={enviar} disabled={elegidas.length < 3}><Icon name="check" size={16} /> Enviar</button>
          </div>
        </div>
        <div className="uj-tarjeta let-halladas">
          {grupos.length ? grupos.map(([n, l]) => (
            <div key={n}><small>{n} letras · {VALOR[n]} pt{VALOR[n] > 1 ? 's' : ''}</small><p>{l.map((p) => <span key={p} className={n === 7 ? 'siete' : ''}>{p}</span>)}</p></div>
          )) : <p className="uj-mini">Aquí irán tus palabras.</p>}
        </div>
      </section>
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
      {ayudaModal}
    </div>
  );
}
