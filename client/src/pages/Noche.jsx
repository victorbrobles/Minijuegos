// client/src/pages/Noche.jsx
// «Noche de juegos»: eliges jugadores y juegos, los jugáis seguidos y un marcador acumula los puntos de la noche.
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { META, metaDe } from '../games/meta.js';
import { LIMITES } from '../games/limites.js';
import { nombreIdentidad, nombreCompleto } from '../lib/identidad.js';
import { useJson } from './Estadisticas.jsx';
import { useRecientes } from '../lib/registros.js';
import { useNoche, crearNoche, terminarNoche, avanzarNoche, saltarJuego, apuntarAMano, marcador } from '../lib/noche.js';
import './Estadisticas.css';
import './Noche.css';
import { miniatura } from '../lib/portadas.js';

const MEDALLAS = ['🥇', '🥈', '🥉'];
const norm = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const multijugador = Object.keys(META).filter((id) => (LIMITES[id]?.max ?? 1) > 1).sort((a, b) => metaDe(a).titulo.localeCompare(metaDe(b).titulo, 'es'));
const cabenTodos = (id, n) => { const l = LIMITES[id]; return l && n >= Math.max(2, l.local?.min ?? l.min) && n <= (l.local?.max ?? l.max); };

function Preparar() {
  const recientes = useRecientes();
  const [jugadores, setJugadores] = useState(() => [nombreIdentidad()].filter(Boolean));
  const [nuevo, setNuevo] = useState('');
  const [juegos, setJuegos] = useState([]);
  const [busca, setBusca] = useState('');
  const n = jugadores.length;
  const añadir = (nombre) => {
    const x = String(nombre || '').replace(/#.*/, '').trim().slice(0, 15);
    if (x && !jugadores.some((j) => j.toLowerCase() === x.toLowerCase())) setJugadores([...jugadores, x]);
    setNuevo('');
  };
  const disponibles = multijugador.filter((id) => cabenTodos(id, Math.max(2, n)) && (!busca || norm(metaDe(id).titulo).includes(norm(busca))));
  const alAzar = () => setJuegos([...disponibles].sort(() => Math.random() - 0.5).slice(0, 5));
  return (
    <>
      <section className="est-tarjeta">
        <h2>👥 ¿Quién juega esta noche?</h2>
        <div className="nch-jugadores">
          {jugadores.map((j) => <span key={j} className="nch-chip">{j}<button type="button" onClick={() => setJugadores(jugadores.filter((x) => x !== j))} aria-label={`Quitar a ${j}`}>✕</button></span>)}
        </div>
        <form className="nch-anadir" onSubmit={(e) => { e.preventDefault(); añadir(nuevo); }}>
          <input value={nuevo} onChange={(e) => setNuevo(e.target.value)} placeholder="Nombre de un jugador" maxLength={15} />
          <button type="submit" disabled={!nuevo.trim()}>Añadir</button>
        </form>
        {recientes.length > 0 && (
          <div className="nch-recientes">
            <small>Recientes:</small>
            {recientes.map((r) => String(r?.nombre ?? r).replace(/#.*/, '')).filter((r, i, a) => a.indexOf(r) === i && !jugadores.includes(r)).slice(0, 8)
              .map((r) => <button key={r} type="button" onClick={() => añadir(r)}>+ {r}</button>)}
          </div>
        )}
      </section>
      <section className="est-tarjeta">
        <h2>🎮 ¿A qué jugáis? <small className="nch-sub">{juegos.length} elegidos</small></h2>
        {juegos.length > 0 && (
          <ol className="nch-orden">
            {juegos.map((id, i) => <li key={id}><span>{i + 1}.</span><b>{metaDe(id).titulo}</b><button type="button" onClick={() => setJuegos(juegos.filter((x) => x !== id))} aria-label="Quitar">✕</button></li>)}
          </ol>
        )}
        <div className="nch-fila">
          <input className="nch-busca" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar juego…" />
          <button type="button" className="nch-azar" onClick={alAzar}>🎲 5 al azar</button>
        </div>
        <p className="nch-nota">Solo salen los juegos para {Math.max(2, n)} jugadores en un dispositivo.</p>
        <div className="nch-catalogo">
          {disponibles.map((id) => {
            const m = metaDe(id); const dentro = juegos.includes(id);
            return (
              <button key={id} type="button" className={dentro ? 'sel' : ''} style={{ '--g1': m.colores[0], '--g2': m.colores[1] }}
                onClick={() => setJuegos(dentro ? juegos.filter((x) => x !== id) : [...juegos, id])}>
                {m.imagen ? <img src={miniatura(m.imagen)} alt="" loading="lazy" /> : <Icon name={m.icono} size={26} />}
                <span>{m.titulo}</span>{dentro && <i>{juegos.indexOf(id) + 1}</i>}
              </button>
            );
          })}
        </div>
      </section>
      <button type="button" className="nch-empezar" disabled={n < 2 || juegos.length < 2} onClick={() => crearNoche(jugadores, juegos)}>
        🎉 {n < 2 ? 'Faltan jugadores (mínimo 2)' : juegos.length < 2 ? 'Elige al menos 2 juegos' : `¡Empieza la noche! (${juegos.length} juegos)`}
      </button>
    </>
  );
}

function AMano({ n }) {
  const [orden, setOrden] = useState([]);
  return (
    <div className="nch-amano">
      <p>Toca a los jugadores en el orden en que han quedado:</p>
      <div className="nch-jugadores">
        {n.jugadores.map((j) => {
          const i = orden.indexOf(j);
          return <button key={j} type="button" className={`nch-chip boton${i >= 0 ? ' sel' : ''}`} onClick={() => setOrden(i >= 0 ? orden.filter((x) => x !== j) : [...orden, j])}>{i >= 0 ? `${i + 1}.º ` : ''}{j}</button>;
        })}
      </div>
      <button type="button" className="nch-empezar" disabled={orden.length !== n.jugadores.length} onClick={() => apuntarAMano(orden)}>Guardar resultado</button>
    </div>
  );
}

/** Al acabar: guardar la noche en el historial de uno de tus grupos. */
function GuardarEnGrupo({ n, tabla }) {
  const yo = nombreCompleto();
  const d = useJson(yo ? `/api/social/grupos?jugador=${encodeURIComponent(yo)}` : null);
  const [hecho, setHecho] = useState(null);
  if (!d?.grupos?.length) return <p className="nch-nota">Crea un <Link to="/grupos">grupo de amigos</Link> para guardar el historial de vuestras noches.</p>;
  const guardar = (g) => fetch(`/api/social/grupos/${g.codigo}/noches`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noche: { marcador: tabla, juegos: n.juegos.filter((_, i) => !n.resultados[i]?.saltado) } })
  }).then((r) => r.ok && setHecho(g.nombre)).catch(() => {});
  if (hecho) return <p className="nch-nota">✅ Guardada en «{hecho}».</p>;
  return (
    <div className="nch-grupos">
      <p className="nch-nota">Guardar esta noche en el historial de un grupo:</p>
      <div className="nch-fila">{d.grupos.map((g) => <button key={g.codigo} type="button" className="nch-secundario" onClick={() => guardar(g)}>👥 {g.nombre}</button>)}</div>
    </div>
  );
}

function EnJuego({ n }) {
  const navigate = useNavigate();
  const [manoEn, setManoEn] = useState(-1);
  const aMano = manoEn === n.actual;
  const tabla = useMemo(() => marcador(n), [n]);
  const fin = n.actual >= n.juegos.length;
  const id = n.juegos[n.actual];
  const res = n.resultados[n.actual];
  return (
    <>
      <section className="est-tarjeta">
        <h2>🏆 Marcador de la noche</h2>
        <ol className="nch-marcador">
          {tabla.map((t, i) => <li key={t.nombre} className={i === 0 && t.puntos > 0 ? 'lider' : ''}><span>{MEDALLAS[i] || `${i + 1}.`}</span><b>{t.nombre}</b><em>{t.puntos}</em></li>)}
        </ol>
      </section>
      {fin ? (
        <section className="est-tarjeta nch-final">
          <span className="nch-trofeo">🏆</span>
          <h2>¡{tabla.filter((t) => t.puntos === tabla[0].puntos).map((t) => t.nombre).join(' y ')} {tabla.filter((t) => t.puntos === tabla[0].puntos).length > 1 ? 'son los campeones' : 'es el campeón'} de la noche!</h2>
          <GuardarEnGrupo n={n} tabla={tabla} />
          <button type="button" className="nch-empezar" onClick={terminarNoche}>🎉 Terminar y preparar otra noche</button>
        </section>
      ) : (
        <section className="est-tarjeta nch-actual" style={{ '--g1': metaDe(id).colores[0], '--g2': metaDe(id).colores[1] }}>
          <p className="nch-nota">Juego {n.actual + 1} de {n.juegos.length}</p>
          <h2>{metaDe(id).titulo}</h2>
          {res ? (
            <>
              <ul className="nch-res">{res.clasif.map((c) => <li key={c.nombre}><span>{c.posicion}.º</span><b>{c.nombre}</b><em>+{res.puntos[c.nombre]}</em></li>)}</ul>
              <button type="button" className="nch-empezar" onClick={avanzarNoche}>{n.actual + 1 >= n.juegos.length ? '🏁 Ver el campeón' : `➡️ Siguiente: ${metaDe(n.juegos[n.actual + 1]).titulo}`}</button>
            </>
          ) : aMano ? <AMano n={n} /> : (
            <>
              <button type="button" className="nch-empezar" onClick={() => navigate(`/juego/${id}`)}>▶️ Jugar ahora</button>
              <p className="nch-nota">Al terminar la partida, el resultado se apunta solo (con los mismos nombres que aquí).</p>
              <div className="nch-fila">
                <button type="button" className="nch-secundario" onClick={() => setManoEn(n.actual)}>✍️ Apuntar el resultado a mano</button>
                <button type="button" className="nch-secundario" onClick={saltarJuego}>⏭️ Saltar este juego</button>
              </div>
            </>
          )}
        </section>
      )}
      <section className="est-tarjeta">
        <h2>📋 Programa</h2>
        <ol className="nch-orden">{n.juegos.map((j, i) => <li key={j} className={i < n.actual ? 'hecho' : i === n.actual ? 'actual' : ''}><span>{i < n.actual ? '✓' : `${i + 1}.`}</span><b>{metaDe(j).titulo}</b>{n.resultados[i]?.saltado && <small>saltado</small>}</li>)}</ol>
        {!fin && <button type="button" className="nch-secundario" onClick={() => { if (window.confirm('¿Terminar la noche? Se perderá el marcador.')) terminarNoche(); }}>Terminar la noche</button>}
      </section>
    </>
  );
}

export default function Noche() {
  const n = useNoche();
  return (
    <div className="game-shell est-pagina">
      <Link to="/" className="back" aria-label="Volver a la portada"><Icon name="arrowLeft" size={20} strokeWidth={2.5} /><span>Portada</span></Link>
      <header className="est-cab nch-cab">
        <span className="est-cab-ico">🎉</span>
        <div><p>Modo torneo</p><h1>Noche de juegos</h1></div>
      </header>
      {n ? <EnJuego n={n} /> : <Preparar />}
    </div>
  );
}
