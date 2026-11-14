// client/src/games/Solo/Misterioso.jsx
// «Futbolista misterioso» (1 jugador): adivina a un futbolista de la temporada 2025/26 en 8 intentos. Cada intento
// te dice si aciertas su país (o al menos el continente), liga, club, puesto, edad y media (más alto o más bajo).
// 3 misterios por partida; cada uno vale 9 menos los intentos que gastes.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { PortadaUnJugador, CabeceraPartida, FinUnJugador, AyudaUnJugador, ConfirmarSalida, useRecord, Aviso } from '../../components/UnJugador.jsx';
import { cargarSolo, Cargando, Buscador, norm } from './comun.jsx';
import './Solo.css';

const ID = 'misterioso';
const INTENTOS = 8;

/** Compara un intento con el secreto: verde (igual), amarillo (cerca) o gris, y flecha para los números. */
export function comparar(g, s) {
  const num = (a, b, cerca) => ({ v: a, c: a === b ? 'si' : Math.abs(a - b) <= cerca ? 'casi' : 'no', f: a === b ? '' : b > a ? '⬆' : '⬇' });
  return [
    { t: 'País', v: g.pais, c: g.pais === s.pais ? 'si' : g.cont === s.cont ? 'casi' : 'no' },
    { t: 'Liga', v: g.liga, c: g.liga === s.liga ? 'si' : 'no' },
    { t: 'Club', v: g.club, c: g.club === s.club ? 'si' : 'no' },
    { t: 'Puesto', v: g.pos, c: g.pos === s.pos ? 'si' : 'no' },
    { t: 'Edad', ...num(g.edad, s.edad, 2) },
    { t: 'Media', ...num(g.media, s.media, 2) }
  ];
}

export default function Misterioso() {
  const navigate = useNavigate();
  const [fase, setFase] = useState('portada');
  const [error, setError] = useState('');
  const [ayuda, setAyuda] = useState(false);
  const [salir, setSalir] = useState(false);
  const [record, registrar] = useRecord(ID);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [datos, setDatos] = useState(null);
  const [s, setS] = useState(0);
  const [intentos, setIntentos] = useState([]);
  const [estado, setEstado] = useState('jugando'); // jugando | ganado | perdido
  const [puntos, setPuntos] = useState(0);
  const [aviso, setAviso] = useState({ t: '', k: 0 });

  const empezar = async () => {
    setFase('cargando'); setError('');
    try {
      const d = await cargarSolo(ID);
      setDatos(d); setS(0); setIntentos([]); setEstado('jugando'); setPuntos(0); setFase('jugando');
    } catch (e) { setError(e.message); }
  };
  const secreto = datos?.futbolistas.find((f) => f.nombre === datos.secretos[s]);
  const probar = (texto) => {
    if (estado !== 'jugando') return;
    const g = datos.futbolistas.find((f) => norm(f.nombre) === norm(texto));
    if (!g) { setAviso({ t: 'No conozco a ese futbolista: elige uno de la lista', k: Date.now(), tipo: 'malo' }); return; }
    if (intentos.some((x) => x.nombre === g.nombre)) { setAviso({ t: 'Ya lo has probado', k: Date.now() }); return; }
    const l = [g, ...intentos]; setIntentos(l);
    if (g.nombre === secreto.nombre) { setEstado('ganado'); setPuntos((p) => p + (INTENTOS + 1 - l.length)); }
    else if (l.length >= INTENTOS) setEstado('perdido');
  };
  const siguiente = () => {
    if (s + 1 >= datos.secretos.length) { setNuevoRecord(puntos > 0 && registrar(puntos)); setFase('fin'); return; }
    setS(s + 1); setIntentos([]); setEstado('jugando');
  };

  const ayudaModal = ayuda && (
    <AyudaUnJugador titulo="¿Cómo se juega?" onCerrar={() => setAyuda(false)}>
      <p>Hay un <b>futbolista misterioso</b> de la temporada 2025/26 (de los buenos: media 83 o más). Tienes <b>{INTENTOS} intentos</b>.</p>
      <p>Escribe cualquier futbolista y verás cuánto se parece al misterioso:</p>
      <p>🟩 igual · 🟨 cerca (mismo continente, o edad/media a 2 o menos) · ⬜ distinto. Las flechas ⬆⬇ dicen si el misterioso tiene más o menos edad y media.</p>
      <p>Son <b>3 misterios</b>; cada uno vale 9 puntos menos los intentos que gastes.</p>
    </AyudaUnJugador>
  );
  if (fase === 'portada') return <><PortadaUnJugador juegoId={ID} onJugar={empezar} onAyuda={() => setAyuda(true)} record={record} textoRecord={(r) => `${r.valor} puntos`} />{ayudaModal}</>;
  if (fase === 'cargando') return <Cargando error={error} onReintentar={empezar} />;
  if (fase === 'fin') {
    return (
      <FinUnJugador icono="search" etiqueta="Fin de los 3 misterios" titulo={puntos >= 15 ? '¡Ojeador de élite!' : puntos >= 8 ? '¡Muy bien!' : 'Fin de la partida'}
        puntos={puntos} unidad="puntos" nuevoRecord={nuevoRecord} record={record} textoRecord={(r) => `${r.valor} puntos`}
        exito={puntos > 0} onRepetir={empezar} onMenu={() => setFase('portada')} />
    );
  }

  return (
    <div className="qq-en-partida">
      <section className="game uj-escena rto-escena">
        <CabeceraPartida onSalir={() => setSalir(true)} chips={[<><Icon name="star" size={14} /> {puntos} pts</>, <>🕵️ {s + 1}/3</>, <>🎯 {intentos.length}/{INTENTOS}</>]} />
        <div className="rto-juego">
          {estado === 'jugando' ? (
            <div className="uj-tarjeta">
              <Buscador lista={datos.futbolistas.map((f) => f.nombre)} onElegir={probar} placeholder="Escribe un futbolista…" />
              <p className="sl-nota" style={{ marginTop: '0.4rem' }}>🟩 igual · 🟨 cerca · ⬆⬇ el misterioso tiene más / menos</p>
            </div>
          ) : (
            <div className="uj-tarjeta sl-centro">
              <p className={`rto-veredicto ${estado === 'ganado' ? 'bien' : 'mal'}`}>{estado === 'ganado' ? `¡Era ${secreto.nombre}! +${INTENTOS + 1 - intentos.length}` : `Era ${secreto.nombre}.`}</p>
              <p className="sl-nota">{secreto.club} · {secreto.pais} · {secreto.pos} · {secreto.edad} años · media {secreto.media}</p>
              <button type="button" className="uj-boton grande" style={{ marginTop: '0.6rem', width: '100%' }} onClick={siguiente}><Icon name="forward" size={20} /> {s + 1 >= datos.secretos.length ? 'Ver resultado' : 'Siguiente misterio'}</button>
            </div>
          )}
          <ol className="ms-intentos">
            {intentos.map((g, i) => (
              <li key={g.nombre} className={i === 0 ? 'nuevo' : ''}>
                <b>{g.nombre}</b>
                <div className="ms-casillas">
                  {comparar(g, secreto).map((c) => <span key={c.t} className={c.c}><small>{c.t}</small>{c.v}{c.f && <i>{c.f}</i>}</span>)}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Aviso texto={aviso.t} clave={aviso.k} tipo={aviso.tipo} duracion={1500} />
      {salir && <ConfirmarSalida onSeguir={() => setSalir(false)} onSalir={() => navigate('/')} />}
    </div>
  );
}
