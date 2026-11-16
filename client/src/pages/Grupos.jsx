// client/src/pages/Grupos.jsx
// Grupos de amigos: /grupos (tus grupos, crear y unirse con código) y /grupo/<código> (ranking interno,
// juegos favoritos del grupo, últimas partidas juntos e historial de Noches de juegos).
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { EnlacePerfil } from '../components/Perfil.jsx';
import { useJson } from './Estadisticas.jsx';
import { nombreCompleto, partirNombre } from '../lib/identidad.js';
import { metaDe } from '../games/meta.js';
import './Estadisticas.css';
import './Noche.css';
import './Grupos.css';
import '../components/SalaGrupo.css';
import { miniatura } from '../lib/portadas.js';

const MEDALLAS = ['🥇', '🥈', '🥉'];
const NOMBRE_MES = (k) => { const [a, m] = k.split('-').map(Number); return new Date(a, m - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }); };
// Medallas del mes: quien más gana en cada tipo de juego (categorías de la portada)
const TITULOS = {
  futbol: ['⚽', 'Rey del fútbol'], habilidad: ['🎮', 'Manos de oro'], cartas: ['🃏', 'Tahúr del mes'], estrategia: ['♟️', 'Gran estratega'],
  chill: ['🌴', 'Alma de la fiesta'], famosos: ['🌟', 'Experto en famosos'], prueba: ['🧠', 'Cerebrito del mes']
};
function medallasDe(clasificacion) {
  const out = [];
  for (const [cat, [emoji, titulo]] of Object.entries(TITULOS)) {
    let mejor = null;
    for (const j of clasificacion) {
      const v = Object.entries(j.porJuego || {}).filter(([juego]) => (metaDe(juego).categorias || []).includes(cat)).reduce((s, [, x]) => s + x.v, 0);
      if (v > 0 && (!mejor || v > mejor.v)) mejor = { jugador: j.jugador, v };
    }
    if (mejor) out.push({ emoji, titulo, jugador: mejor.jugador, texto: `${mejor.v} ${mejor.v === 1 ? 'victoria' : 'victorias'}` });
  }
  const juega = [...clasificacion].sort((a, b) => b.partidas - a.partidas)[0];
  if (juega?.partidas >= 3) out.push({ emoji: '🔥', titulo: 'Incansable', jugador: juega.jugador, texto: `${juega.partidas} partidas` });
  return out;
}

function Liga({ liga, yo }) {
  if (!liga) return null;
  const c = liga.clasificacion || [];
  const medallas = medallasDe(c);
  return (
    <section className="est-tarjeta grp-liga">
      <h2>🏅 Liga de {NOMBRE_MES(liga.mes)}</h2>
      {c.length ? (
        <ol className="nch-marcador">
          {c.map((r, i) => (
            <li key={r.jugador} className={i === 0 ? 'lider' : ''}>
              <span>{MEDALLAS[i] || `${i + 1}.`}</span>
              <b><EnlacePerfil nombre={r.jugador} tam={26}>{partirNombre(r.jugador).nombre}</EnlacePerfil>{r.jugador === yo && <small className="grp-tu"> (tú)</small>}</b>
              <span className="grp-stat"><em>{r.puntos}</em><small>pts · {r.victorias} v · {r.partidas} p.</small></span>
            </li>
          ))}
        </ol>
      ) : <p className="nch-nota">Aún no habéis jugado juntos este mes. ¡La liga empieza con la primera partida!</p>}
      {medallas.length > 0 && (
        <div className="grp-medallas">
          {medallas.map((m) => (
            <div key={m.titulo}><span>{m.emoji}</span><b>{m.titulo}</b><small>{partirNombre(m.jugador).nombre} · {m.texto}</small></div>
          ))}
        </div>
      )}
      <p className="nch-nota">3 puntos por victoria y 1 por partida jugada entre al menos dos del grupo. Se reinicia cada mes.</p>
      {liga.campeones?.length > 0 && (
        <p className="nch-nota grp-campeones">🏆 Campeones: {liga.campeones.map((x) => `${NOMBRE_MES(x.mes)}: ${partirNombre(x.jugador).nombre} (${x.puntos})`).join(' · ')}</p>
      )}
    </section>
  );
}
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


/* ✍️ Preguntas propias del grupo para «¿Quién es más…?» y «Conoce a tus amigos» */
function PreguntasPropias({ codigo, yo }) {
  const [juego, setJuego] = useState('quienmas');
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');
  const [recarga, setRecarga] = useState(0);
  const d = useJson(`/api/social/grupos/${codigo}/preguntas?r=${recarga}`);
  // Si se llega con /grupo/XXXX#preguntas (desde un juego), se baja hasta aquí
  useEffect(() => {
    if (d && window.location.hash === '#preguntas') document.getElementById('preguntas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [Boolean(d)]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d || d.error) return null;
  const lista = d.preguntas.filter((p) => p.juego === juego);
  const info = d.juegos[juego];
  const anadir = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    const r = await post(`/api/social/grupos/${codigo}/preguntas`, { jugador: yo, juego, texto });
    if (r.error) { setError(r.error); return; }
    setTexto(''); setError(''); setRecarga((n) => n + 1);
  };
  const borrar = (id) => post(`/api/social/grupos/${codigo}/preguntas/${id}/borrar`, { jugador: yo }).then(() => setRecarga((n) => n + 1));
  return (
    <section className="est-tarjeta grp-preguntas" id="preguntas">
      <h2>✍️ Vuestras preguntas</h2>
      <p className="nch-nota">Preguntas con vuestras anécdotas y vuestra gente. Al jugar, elegid «Preguntas de vuestro grupo» en la configuración.{d.creador !== yo && ` Solo ${partirNombre(d.creador).nombre}, que creó el grupo, puede borrarlas.`}</p>
      <div className="grp-preg-pestanas" role="tablist">
        {Object.entries(d.juegos).map(([id, j]) => (
          <button key={id} type="button" role="tab" aria-selected={juego === id} className={juego === id ? 'activa' : ''} onClick={() => { setJuego(id); setError(''); }}>
            {j.nombre} <em>{d.preguntas.filter((p) => p.juego === id).length}</em>
          </button>
        ))}
      </div>
      <form className="grp-preg-form" onSubmit={anadir}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={160} placeholder={`Ej.: ${info.ejemplo}`} aria-label="Nueva pregunta" />
        <button type="submit" disabled={!texto.trim()}>Añadir</button>
      </form>
      {error && <p className="grp-preg-error">{error}</p>}
      {lista.length ? (
        <ul className="grp-preg-lista">
          {lista.map((p) => (
            <li key={p.id}>
              <span>{p.texto}</span>
              <small>{partirNombre(p.autor).nombre}</small>
              {d.creador === yo && <button type="button" onClick={() => borrar(p.id)} aria-label="Borrar pregunta" title="Borrar">✕</button>}
            </li>
          ))}
        </ul>
      ) : <p className="nch-nota">Aún no hay ninguna. ¡Estrenad la lista!</p>}
    </section>
  );
}

export function GrupoDetalle() {
  const { codigo } = useParams();
  const yo = nombreCompleto();
  const [recarga, setRecarga] = useState(0);
  const d = useJson(`/api/social/grupos/${codigo}?r=${recarga}`);
  const [copiado, setCopiado] = useState(false);
  const navigate = useNavigate();
  const salaViva = useJson(`/api/social/grupos/${codigo}/sala`);
  if (!d) return <div className="game-shell est-pagina"><Cabecera titulo="Grupo" sub="Cargando…" /></div>;
  if (d.error) return <div className="game-shell est-pagina"><Cabecera titulo="Grupo" sub="No encontrado" /><section className="est-tarjeta"><p>Ese grupo no existe.</p><Link to="/grupos">Ver tus grupos</Link></section></div>;
  const dentro = d.miembros.includes(yo);
  const enlace = `${window.location.origin}/grupo/${d.codigo}`;
  const invitar = async () => {
    try {
      if (navigator.share) await navigator.share({ title: d.nombre, text: `Únete a «${d.nombre}» en «Al juego, juego»`, url: enlace });
      else { await navigator.clipboard.writeText(enlace); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }
    } catch { /* cancelado */ }
  };
  const unirse = () => post(`/api/social/grupos/${d.codigo}/unirse`, { jugador: yo }).then(() => setRecarga((n) => n + 1));
  const salir = () => { if (window.confirm(`¿Salir de «${d.nombre}»?`)) post(`/api/social/grupos/${d.codigo}/salir`, { jugador: yo }).then(() => navigate('/grupos')); };
  return (
    <div className="game-shell est-pagina">
      <Cabecera titulo={d.nombre} sub={`Grupo · ${d.miembros.length} miembros`} />
      {dentro && (
        <Link className="grp-sala" to={`/grupo/${d.codigo}/sala`}>
          <span>🚪</span>
          <div><b>Entrar en la sala del grupo</b><small>El anfitrión elige juego y entráis todos sin códigos</small></div>
          {salaViva?.conectados?.length > 0 && <em>🟢 {salaViva.conectados.length} dentro</em>}
        </Link>
      )}
      {!dentro && (
        <section className="est-tarjeta grp-invitacion">
          <p>Te han invitado a <b>{d.nombre}</b>.</p>
          <button type="button" className="nch-empezar" onClick={unirse}>👥 Unirme al grupo</button>
        </section>
      )}
      <Liga liga={d.liga} yo={yo} />
      {dentro && <PreguntasPropias codigo={d.codigo} yo={yo} />}
      <section className="est-tarjeta">
        <h2>🏆 Ranking histórico <small className="nch-sub">{d.partidasJuntos} partidas juntos</small></h2>
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
