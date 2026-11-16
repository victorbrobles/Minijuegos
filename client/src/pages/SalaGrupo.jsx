// client/src/pages/SalaGrupo.jsx
// Sala fija del grupo (/grupo/<código>/sala): quién está conectado, quién es el anfitrión (👑) y la partida en
// curso. El anfitrión elige el juego y la partida se crea sola; los demás entran en ella sin teclear el código.
// Al acabar, se vuelve aquí (pastilla «Volver a la sala») y el anfitrión elige el siguiente.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { AvatarJugador } from '../components/Perfil.jsx';
import { useJson } from './Estadisticas.jsx';
import { nombreCompleto, partirNombre } from '../lib/identidad.js';
import { useSalaGrupo, abrirParaElGrupo, entrarEnPartida } from '../lib/salaGrupo.js';
import { metaDe } from '../games/meta.js';
import { limitesOnline } from '../games/limites.js';
import registry from '../games/registry.js';
import { miniatura } from '../lib/portadas.js';
import { useVerOcultos, esOculto } from '../lib/ocultos.js';
import '../components/SalaGrupo.css';

const plano = (j) => partirNombre(j).nombre;
const sinTildes = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());

// Juegos que se pueden abrir para el grupo: los que tienen modo online (2 o más jugadores)
const JUEGOS_GRUPO = Object.keys(registry).filter((id) => {
  try { return limitesOnline(id).max >= 2; } catch { return false; }
});

function Elegir({ conectados, onElegir }) {
  const [q, setQ] = useState('');
  const [todos, setTodos] = useState(false);
  const n = conectados.length;
  const verOcultos = useVerOcultos();
  const lista = useMemo(() => JUEGOS_GRUPO.filter((id) => verOcultos || !esOculto(id)).map((id) => ({ id, m: metaDe(id), l: limitesOnline(id) }))
    .filter(({ m }) => !q || sinTildes(`${m.titulo} ${m.etiquetas}`).includes(sinTildes(q)))
    .filter(({ l }) => todos || (n >= l.min && n <= l.max) || n < 2)
    .sort((a, b) => {
      // Primero los que coinciden por el título; después, por orden alfabético
      const t = (x) => (q && sinTildes(x.m.titulo).includes(sinTildes(q)) ? 0 : 1);
      return t(a) - t(b) || a.m.titulo.localeCompare(b.m.titulo, 'es');
    }), [q, todos, n, verOcultos]);
  return (
    <section className="sg-tarjeta">
      <h2>🎮 Elige el juego</h2>
      <div className="sg-buscar">
        <Icon name="search" size={18} />
        <input type="search" placeholder="Buscar juego…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar juego" />
      </div>
      {n >= 2 && (
        <label className="sg-check"><input type="checkbox" checked={todos} onChange={(e) => setTodos(e.target.checked)} /> Ver también los que no son para {n} jugadores</label>
      )}
      <div className="sg-juegos">
        {lista.map(({ id, m, l }) => {
          const fuera = n >= 2 && (n < l.min || n > l.max);
          return (
            <button key={id} type="button" className={`sg-juego${fuera ? ' fuera' : ''}`} style={{ '--g1': m.colores[0], '--g2': m.colores[1] }} onClick={() => onElegir(id)}>
              {m.imagen ? <img src={miniatura(m.imagen)} alt="" loading="lazy" /> : <span className="sg-juego-ico"><Icon name={m.icono} size={30} /></span>}
              <b>{m.titulo}</b>
              <small>{l.min === l.max ? l.min : `${l.min}–${l.max}`} jug.{fuera ? (n < l.min ? ` · faltan ${l.min - n}` : ' · sobráis') : ''}</small>
            </button>
          );
        })}
        {!lista.length && <p className="sg-nota">Ningún juego coincide.</p>}
      </div>
    </section>
  );
}

export default function SalaGrupo() {
  const { codigo: cod } = useParams();
  const codigo = String(cod || '').toUpperCase();
  const navigate = useNavigate();
  const yo = nombreCompleto();
  const [recarga, setRecarga] = useState(0);
  const g = useJson(`/api/social/grupos/${codigo}?r=${recarga}`);
  const sala = useSalaGrupo();
  const [copiado, setCopiado] = useState(false);
  const entrado = useRef('');
  const esMiembro = Boolean(g && !g.error && g.miembros.includes(yo));

  // Al abrir la página, esta pasa a ser tu sala activa
  useEffect(() => {
    if (esMiembro && sala.activa?.codigo !== codigo) sala.entrar(codigo, g.nombre);
  }, [esMiembro, codigo]); // eslint-disable-line react-hooks/exhaustive-deps

  const e = sala.activa?.codigo === codigo ? sala.estado : null;
  const juego = e?.juego;
  // Los demás entran solos en cuanto el anfitrión tiene la partida creada
  useEffect(() => {
    if (!juego?.codigo || sala.soyAnfitrion) return;
    const clave = `${juego.id}:${juego.codigo}:${juego.desde}`;
    if (entrado.current === clave) return;
    entrado.current = clave;
    entrarEnPartida(juego.id, juego.codigo, navigate, juego.api);
  }, [juego?.codigo, juego?.desde, sala.soyAnfitrion]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!g) return <div className="game-shell sg-pagina"><p className="loading">Cargando la sala…</p></div>;
  if (g.error) return <div className="game-shell sg-pagina"><section className="sg-tarjeta"><p>Ese grupo no existe.</p><Link to="/grupos">Ver tus grupos</Link></section></div>;

  const enlace = `${window.location.origin}/grupo/${codigo}/sala`;
  const compartir = async () => {
    try {
      if (navigator.share) await navigator.share({ title: `Sala de ${g.nombre}`, text: `Entra en la sala de «${g.nombre}»`, url: enlace });
      else { await navigator.clipboard.writeText(enlace); setCopiado(true); setTimeout(() => setCopiado(false), 2000); }
    } catch { /* cancelado */ }
  };
  const conectados = e?.conectados || [];
  const anfitrion = e?.anfitrion;
  const mj = juego ? metaDe(juego.id) : null;

  return (
    <div className="game-shell sg-pagina">
      <Link to={`/grupo/${codigo}`} className="back" aria-label="Volver al grupo"><Icon name="arrowLeft" size={20} strokeWidth={2.5} /><span>{g.nombre}</span></Link>
      <header className="sg-cab">
        <div className="sg-cab-txt">
          <small>Sala del grupo</small>
          <h1>{g.nombre}</h1>
          <p>Elegid juego sin volver a uniros: el anfitrión abre la partida y entráis solos.</p>
        </div>
        <button type="button" className="sg-codigo" onClick={compartir} title="Compartir el enlace de la sala">
          <small>{copiado ? '¡Copiado!' : 'Código'}</small><b>{codigo}</b><span><Icon name="share" size={14} /> Invitar</span>
        </button>
      </header>

      {!esMiembro ? (
        <section className="sg-tarjeta sg-centro">
          <p>Aún no eres de <b>{g.nombre}</b>.</p>
          <button type="button" className="sg-boton" onClick={() => post(`/api/social/grupos/${codigo}/unirse`, { jugador: yo }).then(() => setRecarga((n) => n + 1))}>👥 Unirme y entrar en la sala</button>
        </section>
      ) : (
        <>
          <section className="sg-tarjeta">
            <h2>🟢 En la sala <small>{conectados.length}</small></h2>
            <ul className="sg-gente">
              {conectados.map((j) => (
                <li key={j} className={j === anfitrion ? 'anfitrion' : ''}>
                  <AvatarJugador nombre={j} tam={34} />
                  <b>{plano(j)}{j === yo && <small> (tú)</small>}</b>
                  {j === anfitrion ? <span className="sg-corona" title="Anfitrión">👑</span>
                    : sala.soyAnfitrion && <button type="button" className="sg-pasar" onClick={() => sala.pasarCorona(j)}>Pasar 👑</button>}
                </li>
              ))}
              {!conectados.length && <li className="sg-nota">Conectando…</li>}
            </ul>
            {conectados.length === 1 && <p className="sg-nota">Comparte el enlace de la sala para que entren tus amigos.</p>}
          </section>

          {juego && (
            <section className="sg-tarjeta sg-ahora" style={{ '--g1': mj.colores[0], '--g2': mj.colores[1] }}>
              {mj.imagen && <img src={miniatura(mj.imagen)} alt="" />}
              <div>
                <small>{juego.codigo ? 'Jugando ahora' : 'Preparando la partida…'}</small>
                <h3>{mj.titulo}</h3>
                <p>Abierto por {plano(juego.por)}{juego.codigo ? ` · sala ${juego.codigo}` : ''}</p>
              </div>
              <div className="sg-ahora-acc">
                {sala.soyAnfitrion ? (
                  <>
                    <button type="button" className="sg-boton" onClick={() => navigate(`/juego/${juego.id}`)}>Ir a la partida</button>
                    <button type="button" className="sg-secundario" onClick={sala.cerrarJuego}>Terminar</button>
                  </>
                ) : juego.codigo && (
                  <button type="button" className="sg-boton" onClick={() => { entrado.current = ''; entrarEnPartida(juego.id, juego.codigo, navigate, juego.api); }}>Entrar</button>
                )}
              </div>
            </section>
          )}

          {sala.soyAnfitrion ? (
            <Elegir conectados={conectados} onElegir={(id) => abrirParaElGrupo(id, navigate)} />
          ) : (
            !juego && (
              <section className="sg-tarjeta sg-centro sg-esperando">
                <span className="sg-reloj">⏳</span>
                <p>Esperando a que <b>{anfitrion ? plano(anfitrion) : 'el anfitrión'}</b> elija juego…</p>
                <small className="sg-nota">Cuando lo abra, entrarás solo en la partida.</small>
              </section>
            )
          )}

          <button type="button" className="sg-salir" onClick={async () => { await sala.salir(); navigate(`/grupo/${codigo}`); }}>Salir de la sala</button>
        </>
      )}
    </div>
  );
}
