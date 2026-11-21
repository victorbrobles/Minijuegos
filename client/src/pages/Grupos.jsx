// client/src/pages/Grupos.jsx
// Grupos de amigos (hace falta cuenta):
//  - /grupos: crear un grupo o unirte con su código; si ya tienes, «Ver mis grupos» (?ver=lista) con 👑 en los que
//    administras y en verde el activo. /grupos?unirse=CÓDIGO viene de un enlace compartido.
//  - /grupo/<código>: activar/desactivar, salir, miembros (online o no; el administrador puede sacar a alguien),
//    código para invitar, estadísticas (insignias, logros, liga, victorias, juegos, últimas partidas, noches) y, para
//    el administrador, las preguntas propias del grupo.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AvatarJugador } from '../components/Perfil.jsx';
import { useCuenta } from '../lib/cuenta.js';
import { refrescarGrupo } from '../lib/grupoActivo.js';
import '../components/Ajustes.css';
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
const post = (url, body) => fetch(url, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  .then(async (r) => ({ ok: r.ok, ...(await r.json().catch(() => ({}))) }));
const nombreDe = (j) => partirNombre(j).nombre;

function Cabecera({ titulo, sub, volver = '/', textoVolver = 'Portada' }) {
  return (
    <>
      <Link to={volver} className="back" aria-label={`Volver: ${textoVolver}`}><Icon name="arrowLeft" size={20} strokeWidth={2.5} /><span>{textoVolver}</span></Link>
      <header className="est-cab grp-cab"><span className="est-cab-ico">👥</span><div><p>{sub}</p><h1>{titulo}</h1></div></header>
    </>
  );
}

/** Ventana «¿Seguro?» */
function Confirmar({ titulo, texto, si, peligro, onSi, onNo }) {
  return createPortal(
    <div className="rg-modal-fondo aj-fondo" onClick={onNo}>
      <div className="aj-panel grp-confirmar" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>{titulo}</h2>
        <p>{texto}</p>
        <div className="grp-confirmar-botones">
          <button type="button" className="secondary" onClick={onNo}>Cancelar</button>
          <button type="button" className={peligro ? 'grp-peligro' : ''} onClick={onSi}>{si}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function SinCuenta() {
  return (
    <div className="game-shell est-pagina">
      <Cabecera titulo="Grupos de amigos" sub="Hace falta cuenta" />
      <section className="est-tarjeta grp-centro">
        <span className="grp-grande" aria-hidden="true">🔐</span>
        <p>Los grupos son para cuentas: así se sabe quién está online. Inicia sesión con tu cuenta (o créala) para crear o unirte a un grupo.</p>
      </section>
    </div>
  );
}

/* ───────── /grupos ───────── */
export default function Grupos() {
  const { usuario } = useCuenta();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [recarga, setRecarga] = useState(0);
  const d = useJson(usuario ? `/api/social/grupos?r=${recarga}` : null);
  const invitado = (params.get('unirse') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  const [abierto, setAbierto] = useState(invitado ? 'unirse' : null); // 'crear' | 'unirse'
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState(invitado);
  const [error, setError] = useState('');
  if (!usuario) return <SinCuenta />;
  const grupos = d?.grupos || [];
  const verLista = params.get('ver') === 'lista' && grupos.length > 0;

  const crear = async (e) => {
    e.preventDefault(); setError('');
    const r = await post('/api/social/grupos', { nombre }).catch(() => null);
    if (r?.codigo) navigate(`/grupo/${r.codigo}`); else setError(r?.error || 'No se ha podido crear.');
  };
  const unirse = async (e) => {
    e.preventDefault(); setError('');
    const c = codigo.trim().toUpperCase();
    const r = await post(`/api/social/grupos/${c}/unirse`, {}).catch(() => null);
    if (r?.success) navigate(`/grupo/${c}`); else setError(r?.error || 'No se ha podido entrar.');
  };

  if (verLista) {
    return (
      <div className="game-shell est-pagina">
        <Cabecera titulo="Mis grupos" sub={`${grupos.length} ${grupos.length === 1 ? 'grupo' : 'grupos'}`} volver="/grupos" textoVolver="Grupos" />
        <section className="est-tarjeta">
          <div className="grp-lista">
            {grupos.map((g) => (
              <Link key={g.codigo} to={`/grupo/${g.codigo}`} className={g.activo ? 'activo' : ''}>
                <b>{g.creador === usuario.jugador && <span className="grp-corona" title="Eres el administrador">👑</span>}{g.nombre}</b>
                <small>{g.miembros} {g.miembros === 1 ? 'miembro' : 'miembros'}{g.activo ? ' · ✅ Activo' : ''}</small>
                <span>›</span>
              </Link>
            ))}
          </div>
          <p className="nch-nota">👑 = eres el administrador · en verde, el grupo activo (solo puede haber uno).</p>
        </section>
        <button type="button" className="grp-volver-inicio" onClick={() => setParams({})}>➕ Crear o unirme a otro grupo</button>
      </div>
    );
  }

  return (
    <div className="game-shell est-pagina">
      <Cabecera titulo="Grupos de amigos" sub="Jugad juntos sin códigos" />
      {!d ? <p className="loading">Cargando…</p> : (
        <div className="grp-inicio">
          {grupos.length > 0 && (
            <button type="button" className="grp-gran-boton ver" onClick={() => setParams({ ver: 'lista' })}>
              <span aria-hidden="true">👥</span><b>Ver mis grupos</b><small>{grupos.length} {grupos.length === 1 ? 'grupo' : 'grupos'}{grupos.some((g) => g.activo) ? ` · activo: ${grupos.find((g) => g.activo).nombre}` : ''}</small>
            </button>
          )}
          <button type="button" className={`grp-gran-boton crear${abierto === 'crear' ? ' abierto' : ''}`} onClick={() => { setAbierto(abierto === 'crear' ? null : 'crear'); setError(''); }}>
            <span aria-hidden="true">✨</span><b>Crear un grupo</b><small>Elige un nombre y comparte el código</small>
          </button>
          {abierto === 'crear' && (
            <form className="nch-anadir grp-form" onSubmit={crear}>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del grupo (ej. Los del pueblo)" maxLength={30} autoFocus aria-label="Nombre del grupo" />
              <button type="submit" disabled={!nombre.trim()}>Crear</button>
            </form>
          )}
          <button type="button" className={`grp-gran-boton unirse${abierto === 'unirse' ? ' abierto' : ''}`} onClick={() => { setAbierto(abierto === 'unirse' ? null : 'unirse'); setError(''); }}>
            <span aria-hidden="true">🔑</span><b>Unirme a un grupo</b><small>Escribe el código que te han pasado</small>
          </button>
          {abierto === 'unirse' && (
            <form className="nch-anadir grp-form" onSubmit={unirse}>
              <input value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} placeholder="Código (ABC234)" maxLength={6} className="grp-codigo-input" autoFocus aria-label="Código del grupo" />
              <button type="submit" disabled={codigo.trim().length < 6}>Unirme</button>
            </form>
          )}
          {error && <p className="error">{error}</p>}
          <p className="nch-nota grp-explica">Con un grupo <b>activo</b>, cuando su administrador abre un juego online entráis todos los que estéis online directamente en su sala de espera.</p>
        </div>
      )}
    </div>
  );
}

/* ───────── /grupo/<código> ───────── */
export function GrupoDetalle() {
  const { codigo } = useParams();
  const { usuario } = useCuenta();
  const yo = usuario?.jugador || nombreCompleto();
  const navigate = useNavigate();
  const [recarga, setRecarga] = useState(0);
  const d = useJson(usuario ? `/api/social/grupos/${codigo}?r=${recarga}` : null);
  const [aviso, setAviso] = useState('');
  const [confirmar, setConfirmar] = useState(null);
  const [preguntas, setPreguntas] = useState(() => window.location.hash === '#preguntas');
  // La lista de miembros (quién está online) se refresca sola
  useEffect(() => { const t = setInterval(() => setRecarga((n) => n + 1), 15000); return () => clearInterval(t); }, []);
  if (!usuario) return <SinCuenta />;
  if (!d) return <div className="game-shell est-pagina"><Cabecera titulo="Grupo" sub="Cargando…" volver="/grupos?ver=lista" textoVolver="Mis grupos" /></div>;
  if (d.error) {
    return (
      <div className="game-shell est-pagina">
        <Cabecera titulo="Grupo" sub="No disponible" volver="/grupos" textoVolver="Grupos" />
        <section className="est-tarjeta grp-centro"><p>Ese grupo no existe o no formas parte de él.</p><Link to={`/grupos?unirse=${codigo}`}>Unirme con el código {codigo}</Link></section>
      </div>
    );
  }
  const recargar = () => { setRecarga((n) => n + 1); refrescarGrupo(); };
  const enlace = `${window.location.origin}/grupos?unirse=${d.codigo}`;
  const mostrar = (t) => { setAviso(t); setTimeout(() => setAviso(''), 2200); };
  const copiar = async () => { try { await navigator.clipboard.writeText(d.codigo); mostrar('Código copiado'); } catch { mostrar(d.codigo); } };
  const compartir = async () => {
    const texto = `Únete a mi grupo «${d.nombre}» en Los 100+ minijuegos con el código ${d.codigo}`;
    try {
      if (navigator.share) await navigator.share({ title: d.nombre, text: texto, url: enlace });
      else { await navigator.clipboard.writeText(`${texto}: ${enlace}`); mostrar('Invitación copiada'); }
    } catch { /* cancelado */ }
  };
  const activar = async () => { await post(`/api/social/grupos/${d.codigo}/activar`, { activo: !d.activo }); recargar(); };
  const salir = () => setConfirmar({
    titulo: `¿Salir de «${d.nombre}»?`,
    texto: d.soyCreador ? (d.miembros.length > 1 ? `Eres el administrador: el puesto pasará a ${nombreDe(d.miembros.find((m) => m !== yo))}, el miembro más antiguo.` : 'Eres el único miembro: el grupo se borrará.') : 'Podrás volver a entrar con el código.',
    si: 'Salir del grupo', peligro: true,
    onSi: async () => { await post(`/api/social/grupos/${d.codigo}/salir`, {}); refrescarGrupo(); navigate('/grupos'); }
  });
  const expulsar = (j) => setConfirmar({
    titulo: `¿Sacar a ${nombreDe(j)} del grupo?`,
    texto: 'No podrá volver a unirse con el código salvo que lo readmitas.',
    si: 'Sí, sacarle', peligro: true,
    onSi: async () => { const r = await post(`/api/social/grupos/${d.codigo}/expulsar`, { miembro: j }); setConfirmar(null); if (!r.ok) mostrar(r.error || 'No se ha podido.'); recargar(); }
  });
  const readmitir = async (j) => { await post(`/api/social/grupos/${d.codigo}/readmitir`, { miembro: j }); recargar(); };
  const online = d.gente.filter((m) => m.online).length;

  return (
    <div className="game-shell est-pagina">
      <Cabecera titulo={d.nombre} sub={`Grupo · ${d.miembros.length} ${d.miembros.length === 1 ? 'miembro' : 'miembros'} · ${online} online`} volver="/grupos?ver=lista" textoVolver="Mis grupos" />

      <section className={`est-tarjeta grp-estado${d.activo ? ' activo' : ''}`}>
        <div className="grp-estado-txt">
          <b>{d.activo ? '✅ Grupo activo' : 'Grupo inactivo'}</b>
          <small>{d.activo ? 'Al jugar online entraréis juntos en la sala del administrador.' : 'Actívalo para jugar online con el grupo. Si tienes otro activo, se desactivará.'}</small>
        </div>
        <div className="grp-estado-botones">
          <button type="button" className={d.activo ? 'grp-desactivar' : 'grp-activar'} onClick={activar}>{d.activo ? 'Desactivar' : 'Establecer como activo'}</button>
          <button type="button" className="grp-salir" onClick={salir}>Salir del grupo</button>
        </div>
      </section>

      <section className="est-tarjeta">
        <h2>👤 Miembros <small className="nch-sub">{online} online</small></h2>
        <ul className="grp-gente">
          {d.gente.map((m) => (
            <li key={m.jugador} className={m.online ? 'online' : ''}>
              <AvatarJugador nombre={m.jugador} tam={36} />
              <span className="grp-gente-nombre">
                <b>{nombreDe(m.jugador)}{m.jugador === yo && <small className="grp-tu"> (tú)</small>}</b>
                <small>{m.creador ? '👑 Administrador · ' : ''}{m.online ? (m.activo ? 'Online · con el grupo activo' : 'Online') : 'Desconectado'}</small>
              </span>
              <span className={`grp-punto${m.online ? ' on' : ''}`} title={m.online ? 'Online' : 'Desconectado'} aria-label={m.online ? 'Online' : 'Desconectado'} />
              {d.soyCreador && m.jugador !== yo && <button type="button" className="grp-quitar" onClick={() => expulsar(m.jugador)} aria-label={`Sacar a ${nombreDe(m.jugador)} del grupo`} title="Sacar del grupo">✕</button>}
            </li>
          ))}
        </ul>
        {d.soyCreador && d.expulsados.length > 0 && (
          <div className="grp-expulsados">
            <small>Sacados del grupo:</small>
            {d.expulsados.map((x) => <span key={x.jugador}>{nombreDe(x.jugador)} <button type="button" onClick={() => readmitir(x.jugador)}>Readmitir</button></span>)}
          </div>
        )}
      </section>

      <section className="est-tarjeta grp-invitar">
        <h2>🔑 Código del grupo</h2>
        <div className="grp-codigo-caja">
          <b className="grp-codigo">{d.codigo}</b>
          <button type="button" className="secondary" onClick={copiar}>📋 Copiar</button>
          <button type="button" onClick={compartir}>🔗 Compartir</button>
        </div>
        {aviso && <p className="grp-copiado" role="status">{aviso}</p>}
      </section>

      <h2 className="grp-seccion">📊 Estadísticas</h2>
      <Insignias d={d} />
      <Liga liga={d.liga} yo={yo} />
      <section className="est-tarjeta">
        <h2>🏆 Más victorias <small className="nch-sub">{d.partidasJuntos} partidas juntos</small></h2>
        <ol className="nch-marcador">
          {d.ranking.map((r, i) => (
            <li key={r.jugador} className={i === 0 && r.victorias > 0 ? 'lider' : ''}>
              <span>{MEDALLAS[i] || `${i + 1}.`}</span>
              <b><EnlacePerfil nombre={r.jugador} tam={26}>{nombreDe(r.jugador)}</EnlacePerfil>{r.jugador === yo && <small className="grp-tu"> (tú)</small>}</b>
              <span className="grp-stat"><em>{r.victorias}</em><small>{r.victorias === 1 ? 'victoria' : 'victorias'} · {r.partidas} p.</small></span>
            </li>
          ))}
        </ol>
        <p className="nch-nota">Cuentan las partidas jugadas entre al menos dos miembros del grupo.</p>
      </section>
      {d.juegos.length > 0 && (
        <section className="est-tarjeta">
          <h2>🎮 Juegos más jugados</h2>
          <div className="grp-juegos">{d.juegos.map((j) => <Link key={j.juego} to={`/juego/${j.juego}`} style={{ '--g1': metaDe(j.juego).colores[0], '--g2': metaDe(j.juego).colores[1] }}>{metaDe(j.juego).imagen && <img src={miniatura(metaDe(j.juego).imagen)} alt="" loading="lazy" />}<b>{metaDe(j.juego).titulo}</b><small>{j.n} {j.n === 1 ? 'partida' : 'partidas'}</small></Link>)}</div>
        </section>
      )}
      {d.ultimas.length > 0 && (
        <section className="est-tarjeta">
          <h2>🕑 Últimas partidas</h2>
          <ul className="grp-noches">
            {d.ultimas.map((p, i) => (
              <li key={i}><span>{p.resultados.some((r) => r.gana) ? '🏅' : '🎲'}</span><div><b>{metaDe(p.juego).titulo}</b>
                <small>{fecha(p.fecha)} · {p.resultados.map((r) => `${nombreDe(r.jugador)}${r.gana ? ' 🏆' : ''}${r.puntos != null ? ` (${r.puntos})` : ''}`).join(' · ')}</small></div></li>
            ))}
          </ul>
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

      {d.soyCreador && (
        preguntas ? <PreguntasPropias codigo={d.codigo} yo={yo} />
          : <button type="button" className="grp-gran-boton preguntas" onClick={() => setPreguntas(true)}><span aria-hidden="true">✍️</span><b>Crear preguntas</b><small>Para «¿Quién es más…?» y «Conoce a tus amigos»</small></button>
      )}
      {confirmar && <Confirmar {...confirmar} onNo={() => setConfirmar(null)} />}
    </div>
  );
}

function Insignias({ d }) {
  const conseguidos = d.logros.filter((l) => l.ok).length;
  return (
    <section className="est-tarjeta">
      <h2>🎖️ Logros e insignias</h2>
      {d.insignias.length > 0 ? (
        <div className="grp-medallas">
          {d.insignias.map((m) => <div key={m.titulo}><span>{m.emoji}</span><b>{m.titulo}</b><small>{nombreDe(m.jugador)} · {m.texto}</small></div>)}
        </div>
      ) : <p className="nch-nota">Las insignias aparecen al jugar juntos: el rey del grupo, el más incansable, el imparable…</p>}
      <h3 className="grp-sub">Logros del grupo <small>{conseguidos}/{d.logros.length}</small></h3>
      <div className="grp-logros">
        {d.logros.map((l) => <span key={l.titulo} className={l.ok ? 'ok' : ''} title={l.ok ? 'Conseguido' : 'Aún no'}><i aria-hidden="true">{l.emoji}</i>{l.titulo}</span>)}
      </div>
    </section>
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
    const r = await post(`/api/social/grupos/${codigo}/preguntas`, { juego, texto });
    if (r.error) { setError(r.error); return; }
    setTexto(''); setError(''); setRecarga((n) => n + 1);
  };
  const borrar = (id) => post(`/api/social/grupos/${codigo}/preguntas/${id}/borrar`, {}).then(() => setRecarga((n) => n + 1));
  return (
    <section className="est-tarjeta grp-preguntas" id="preguntas">
      <h2>✍️ Vuestras preguntas</h2>
      <p className="nch-nota">Preguntas con vuestras anécdotas y vuestra gente. Al jugar, elegid «Preguntas de vuestro grupo» en la configuración.</p>
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

