// client/src/pages/Grupos.jsx
// Grupos de amigos: /grupos (tus grupos, crear y unirse con código) y /grupo/<código> (ranking interno,
// juegos favoritos del grupo, últimas partidas juntos e historial de Noches de juegos).
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { EnlacePerfil } from '../components/Perfil.jsx';
import { useJson } from './Estadisticas.jsx';
import { nombreCompleto, partirNombre } from '../lib/identidad.js';
import { metaDe } from '../games/meta.js';
import './Estadisticas.css';
import './Noche.css';
import './Grupos.css';
import { miniatura } from '../lib/portadas.js';

const MEDALLAS = ['🥇', '🥈', '🥉'];
const fecha = (t) => new Date(t).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());

function Cabecera({ titulo, sub }) {
  return (
    <>
      <Link to="/" className="back" aria-label="Volver a la portada"><Icon name="arrowLeft" size={20} strokeWidth={2.5} /><span>Portada</span></Link>
      <header className="est-cab grp-cab"><span className="est-cab-ico">👥</span><div><p>{sub}</p><h1>{titulo}</h1></div></header>
    </>
  );
}

export default function Grupos() {
  const yo = nombreCompleto();
  const navigate = useNavigate();
  const d = useJson(`/api/social/grupos?jugador=${encodeURIComponent(yo)}`);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const crear = async (e) => {
    e.preventDefault(); setError('');
    const r = await post('/api/social/grupos', { nombre, jugador: yo }).catch(() => null);
    if (r?.codigo) navigate(`/grupo/${r.codigo}`); else setError(r?.error || 'No se ha podido crear.');
  };
  const unirse = async (e) => {
    e.preventDefault(); setError('');
    const c = codigo.trim().toUpperCase();
    const r = await post(`/api/social/grupos/${c}/unirse`, { jugador: yo }).catch(() => null);
    if (r?.success) navigate(`/grupo/${c}`); else setError(r?.error || 'No se ha podido entrar.');
  };
  return (
    <div className="game-shell est-pagina">
      <Cabecera titulo="Grupos de amigos" sub="Rankings privados" />
      <section className="est-tarjeta">
        <h2>👥 Tus grupos</h2>
        {!d ? <p className="nch-nota">Cargando…</p> : !d.grupos?.length ? <p className="nch-nota">Aún no estás en ningún grupo. Crea uno y comparte el código con tus amigos.</p> : (
          <div className="grp-lista">
            {d.grupos.map((g) => <Link key={g.codigo} to={`/grupo/${g.codigo}`}><b>{g.nombre}</b><small>{g.miembros} {g.miembros === 1 ? 'miembro' : 'miembros'} · {g.codigo}</small><span>›</span></Link>)}
          </div>
        )}
      </section>
      <section className="est-tarjeta">
        <h2>✨ Crear un grupo</h2>
        <form className="nch-anadir" onSubmit={crear}>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Los del pueblo" maxLength={30} />
          <button type="submit" disabled={!nombre.trim()}>Crear</button>
        </form>
        <h2 style={{ marginTop: '1.2rem' }}>🔑 Unirse con código</h2>
        <form className="nch-anadir" onSubmit={unirse}>
          <input value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="ABC234" maxLength={6} className="grp-codigo-input" />
          <button type="submit" disabled={codigo.trim().length < 6}>Entrar</button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>
    </div>
  );
}

export function GrupoDetalle() {
  const { codigo } = useParams();
  const yo = nombreCompleto();
  const [recarga, setRecarga] = useState(0);
  const d = useJson(`/api/social/grupos/${codigo}?r=${recarga}`);
  const [copiado, setCopiado] = useState(false);
  const navigate = useNavigate();
  if (!d) return <div className="game-shell est-pagina"><Cabecera titulo="Grupo" sub="Cargando…" /></div>;
  if (d.error) return <div className="game-shell est-pagina"><Cabecera titulo="Grupo" sub="No encontrado" /><section className="est-tarjeta"><p>Ese grupo no existe.</p><Link to="/grupos">Ver tus grupos</Link></section></div>;
  const dentro = d.miembros.includes(yo);
  const enlace = `${window.location.origin}/grupo/${d.codigo}`;
  const invitar = async () => {
    try {
      if (navigator.share) await navigator.share({ title: d.nombre, text: `Únete a «${d.nombre}» en Minijuegos`, url: enlace });
      else { await navigator.clipboard.writeText(enlace); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }
    } catch { /* cancelado */ }
  };
  const unirse = () => post(`/api/social/grupos/${d.codigo}/unirse`, { jugador: yo }).then(() => setRecarga((n) => n + 1));
  const salir = () => { if (window.confirm(`¿Salir de «${d.nombre}»?`)) post(`/api/social/grupos/${d.codigo}/salir`, { jugador: yo }).then(() => navigate('/grupos')); };
  return (
    <div className="game-shell est-pagina">
      <Cabecera titulo={d.nombre} sub={`Grupo · ${d.miembros.length} miembros`} />
      {!dentro && (
        <section className="est-tarjeta grp-invitacion">
          <p>Te han invitado a <b>{d.nombre}</b>.</p>
          <button type="button" className="nch-empezar" onClick={unirse}>👥 Unirme al grupo</button>
        </section>
      )}
      <section className="est-tarjeta">
        <h2>🏆 Ranking del grupo <small className="nch-sub">{d.partidasJuntos} partidas juntos</small></h2>
        <ol className="nch-marcador">
          {d.ranking.map((r, i) => (
            <li key={r.jugador} className={i === 0 && r.victorias > 0 ? 'lider' : ''}>
              <span>{MEDALLAS[i] || `${i + 1}.`}</span>
              <b><EnlacePerfil nombre={r.jugador} tam={26}>{partirNombre(r.jugador).nombre}</EnlacePerfil>{r.jugador === yo && <small className="grp-tu"> (tú)</small>}</b>
              <span className="grp-stat"><em>{r.victorias}</em><small>{r.victorias === 1 ? 'victoria' : 'victorias'} · {r.partidas} p.</small></span>
            </li>
          ))}
        </ol>
        <p className="nch-nota">Cuentan las partidas jugadas entre al menos dos miembros del grupo.</p>
      </section>
      {d.juegos.length > 0 && (
        <section className="est-tarjeta">
          <h2>🎮 A lo que más jugáis</h2>
          <div className="grp-juegos">{d.juegos.map((j) => <Link key={j.juego} to={`/juego/${j.juego}`} style={{ '--g1': metaDe(j.juego).colores[0], '--g2': metaDe(j.juego).colores[1] }}>{metaDe(j.juego).imagen && <img src={miniatura(metaDe(j.juego).imagen)} alt="" loading="lazy" />}<b>{metaDe(j.juego).titulo}</b><small>{j.n} {j.n === 1 ? 'partida' : 'partidas'}</small></Link>)}</div>
        </section>
      )}
      {d.noches.length > 0 && (
        <section className="est-tarjeta">
          <h2>🎉 Noches de juegos</h2>
          <ul className="grp-noches">
            {d.noches.map((n) => (
              <li key={n.id}><span>🏆</span><div><b>{n.marcador[0]?.nombre}</b><small>{fecha(n.fecha)} · {n.juegos.length} juegos · {n.marcador.map((m) => `${m.nombre} ${m.puntos}`).join(' · ')}</small></div></li>
            ))}
          </ul>
        </section>
      )}
      {d.ultimas.length > 0 && (
        <section className="est-tarjeta">
          <h2>🕑 Últimas partidas juntos</h2>
          <ul className="grp-noches">
            {d.ultimas.map((p, i) => (
              <li key={i}><span>{p.resultados.some((r) => r.gana) ? '🏅' : '🎲'}</span><div><b>{metaDe(p.juego).titulo}</b>
                <small>{fecha(p.fecha)} · {p.resultados.map((r) => `${partirNombre(r.jugador).nombre}${r.gana ? ' 🏆' : ''}${r.puntos != null ? ` (${r.puntos})` : ''}`).join(' · ')}</small></div></li>
            ))}
          </ul>
        </section>
      )}
      <section className="est-tarjeta">
        <h2>➕ Invita a tus amigos</h2>
        <p className="nch-nota">Código del grupo: <b className="grp-codigo">{d.codigo}</b></p>
        <div className="nch-fila">
          <button type="button" className="nch-secundario" onClick={invitar}>🔗 {copiado ? '¡Enlace copiado!' : 'Compartir enlace'}</button>
          {dentro && <button type="button" className="nch-secundario" onClick={salir}>Salir del grupo</button>}
        </div>
        <p className="nch-nota">Miembros: {d.miembros.map((m) => partirNombre(m).nombre).join(', ')}</p>
      </section>
    </div>
  );
}
