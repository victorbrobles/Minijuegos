// client/src/pages/Home.jsx
import { ChipIdentidad } from '../components/Identidad.jsx';
import { BannerReto } from '../reto/Banner.jsx';
import { Link } from 'react-router-dom';
import Recomendador from '../components/Recomendador.jsx';
import Instalar from '../components/Instalar.jsx';
import BotonSonido from '../components/Sonido.jsx';
import { useFavoritos, useJugados } from '../lib/favoritos.js';
import './Estadisticas.css';
import './Noche.css';
import './Creditos.css';
import './Portada.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useValoraciones, puntuacion } from '../lib/valoraciones.js';
import { useNavigate } from 'react-router-dom';
import GameCard from '../components/GameCard.jsx';
import { useFiltros, cuantosFiltros, cumpleFiltros, PanelFiltros } from '../components/FiltrosJuegos.jsx';
import { BotonAjustes } from '../components/Ajustes.jsx';
import Icon from '../components/Icon.jsx';
import AdminPanel from '../components/AdminPanel.jsx';
import { metaDe, TOP_CREADOR, CATEGORIAS_PORTADA as CATEGORIAS_EXPORTADAS } from '../games/meta.js';

// Lista de categorías por defecto de respaldo
const CATEGORIAS_DEFAULT = [
  { id: 'favoritos', titulo: '⭐ Top 15 del Creador', desc: 'Los juegos más destacados, adictivos y jugados' },
  { id: 'prueba', titulo: '🧠 Para ponerte a prueba', desc: 'Retos de ingenio, cultura, velocidad y memoria' },
  { id: 'estrategia', titulo: '♟️ Estratégicos y de deducción', desc: 'Roles ocultos, engaños, gestión de cartas y táctica' },
  { id: 'cartas', titulo: '🃏 Juegos de cartas', desc: 'Estrategia, faroles, apuestas y duelos con cartas' },
  { id: 'chill', titulo: '🌴 Para jugar de chill', desc: 'Risas, amigos, preguntas y pura diversión sin estrés' },
  { id: 'futbol', titulo: '⚽ Para amantes del fútbol', desc: 'Demuestra todo lo que sabes sobre el deporte rey' },
  { id: 'habilidad', titulo: '🎮 Juegos de habilidad', desc: 'Reflejos, precisión, coordinación y destreza para superar cualquier reto' },
  { id: 'famosos', titulo: '🌟 De famosos y cultura pop', desc: 'Celebridades, cine, música, frases y televisión' },
  { id: 'dos_jugadores', titulo: '👥 Para dos jugadores', desc: 'Ideales para competir o cooperar frente a frente' }
];

const CATEGORIAS_PORTADA = (Array.isArray(CATEGORIAS_EXPORTADAS) && CATEGORIAS_EXPORTADAS.length > 0)
  ? CATEGORIAS_EXPORTADAS
  : CATEGORIAS_DEFAULT;

// Normalización de texto para búsquedas (sin tildes ni símbolos)
const normalizar = (t) =>
  String(t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Extrae las categorías admitiendo arrays, strings o nombres separados por comas
const obtenerCategorias = (g, m) => {
  const fuentes = [m?.categorias, m?.categoria, g?.categorias, g?.categoria].filter(Boolean);
  const lista = [];
  fuentes.forEach((val) => {
    if (Array.isArray(val)) {
      val.flat(Infinity).forEach((v) => {
        if (typeof v === 'string') v.split(',').forEach((s) => lista.push(s.trim()));
      });
    } else if (typeof val === 'string') {
      val.split(',').forEach((s) => lista.push(s.trim()));
    }
  });
  return lista.filter(Boolean);
};

// Compara categorías por ID corto ('favoritos') o título ('favoritos del creador')
const coincideCategoria = (catDeseada, catPortada) => {
  const cNorm = normalizar(catDeseada);
  const idNorm = normalizar(catPortada.id);
  const titNorm = normalizar(catPortada.titulo);
  if (!cNorm) return false;
  if (cNorm === idNorm || cNorm === titNorm) return true;
  if (titNorm.includes(cNorm) || cNorm.includes(titNorm)) return true;
  if (cNorm.includes(idNorm)) return true;
  return false;
};

// Componente carrusel horizontal con soporte de rueda de ratón, arrastre y flechas
function FilaCarrusel({ cat, juegos, compacta = false }) {
  const trackRef = useRef(null);
  const [rejilla, setRejilla] = useState(false);
  // «⭐ Top 15 del Creador» → emoji en su cuadradito de color y el texto como título
  const [, emoji = '', texto = cat.titulo] = cat.titulo.match(/^(\S+)\s+(.*)$/) || [];
  const desc = cat.id === 'favoritos' ? 'Mi ranking personal, del 1 al 15' : cat.desc;
  const [arrastrando, setArrastrando] = useState(false);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const haMovido = useRef(false);

  // Convierte el scroll de rueda vertical en horizontal
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll <= 0) return;
        if ((e.deltaY > 0 && el.scrollLeft < maxScroll - 2) || (e.deltaY < 0 && el.scrollLeft > 2)) {
          e.preventDefault();
          el.scrollBy({ left: e.deltaY * 1.3, behavior: 'auto' });
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    isDown.current = true;
    haMovido.current = false;
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeftStart.current = trackRef.current.scrollLeft;
  };

  const onMouseMove = (e) => {
    if (!isDown.current) return;
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = x - startX.current;
    if (Math.abs(walk) > 6) {
      haMovido.current = true;
      setArrastrando(true);
      trackRef.current.scrollLeft = scrollLeftStart.current - walk;
    }
  };

  const onMouseUpOrLeave = () => {
    isDown.current = false;
    setArrastrando(false);
  };

  const onClickCapture = (e) => {
    if (haMovido.current) {
      e.preventDefault();
      e.stopPropagation();
      haMovido.current = false;
    }
  };

  const deslizar = (direccion) => {
    if (!trackRef.current) return;
    const salto = trackRef.current.clientWidth * 0.95;
    trackRef.current.scrollBy({
      left: direccion === 'der' ? salto : -salto,
      behavior: 'smooth'
    });
  };

  return (
    <section className={`home-categoria-bloque cat-${cat.id}${compacta ? ' compacta' : ''}${rejilla ? ' abierta' : ''}`}>
      <div className="home-categoria-header">
        <div className="hc-cab">
          {emoji && <span className="hc-ico" aria-hidden="true">{emoji}</span>}
          <div className="hc-textos">
            <h2 className="home-categoria-titulo">{texto}</h2>
            {desc && <p className="home-categoria-desc">{desc}</p>}
          </div>
        </div>
        <div className="home-carousel-nav">
          {juegos.length > 4 && (
            <button type="button" className="hc-todos" onClick={() => setRejilla((v) => !v)} aria-expanded={rejilla}>
              {rejilla ? <span>Ver menos</span> : <><span className="hc-todos-txt">Ver todos</span><b>{juegos.length}</b></>}
            </button>
          )}
          {!rejilla && (
            <>
              <button type="button" className="carousel-nav-btn" onClick={() => deslizar('izq')} aria-label="Anterior" title="Anterior">‹</button>
              <button type="button" className="carousel-nav-btn" onClick={() => deslizar('der')} aria-label="Siguiente" title="Siguiente">›</button>
            </>
          )}
        </div>
      </div>

      <ul
        ref={trackRef}
        className={`home-carousel-track ${arrastrando ? 'arrastrando' : ''}${rejilla ? ' en-rejilla' : ''}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
        onClickCapture={onClickCapture}
      >
        {juegos.map((g, i) => (
          <li
            key={`${cat.id}-${g.id}`}
            className={`home-carousel-item${cat.id === 'favoritos' ? ' top-item' : ''}`}
            style={{ '--i': Math.min(i, 8) }}
          >
            {cat.id === 'favoritos' && <span className={`top-num${i < 3 ? ` podio p${i + 1}` : ''}`} aria-label={`Número ${i + 1}`}>{i + 1}</span>}
            <GameCard game={g} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Home() {
  const [games, setGames] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const favoritos = useFavoritos();
  const jugados = useJugados();

  useEffect(() => {
    fetch('/api/games')
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setGames)
      .catch(() => setError('No se pudo cargar el catálogo. ¿Está arrancado el servidor?'))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const enCampo = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (e.key === '/' && !enCampo && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const indice = useMemo(
    () =>
      games.map((g) => {
        const m = metaDe(g.id);
        return {
          game: g,
          nombre: normalizar(g.name),
          resto: normalizar(`${g.description ?? ''} ${m.descripcion} ${m.etiquetas ?? ''}`)
        };
      }),
    [games]
  );

  // Filtros (cuántos sois, modo, duración, tipo, favoritos): se combinan con la búsqueda
  const [filtros, setFiltros] = useFiltros();
  const [verFiltros, setVerFiltros] = useState(false);
  const nFiltros = cuantosFiltros(filtros);
  const resultados = useMemo(() => {
    const palabras = normalizar(busqueda).split(' ').filter(Boolean);
    const pasa = (g) => cumpleFiltros(g.id, filtros, favoritos);
    if (palabras.length === 0) return games.filter(pasa);
    return indice.filter((it) => pasa(it.game))
      .map((it) => {
        const enNombre = palabras.every((p) => it.nombre.includes(p));
        const enTodo = palabras.every((p) => it.nombre.includes(p) || it.resto.includes(p));
        return { it, puntos: enNombre ? 0 : enTodo ? 1 : -1 };
      })
      .filter((r) => r.puntos >= 0)
      .sort((a, b) => a.puntos - b.puntos)
      .map((r) => r.it.game);
  }, [busqueda, games, indice, filtros, favoritos]);

  const hayBusqueda = busqueda.trim() !== '' || nFiltros > 0;

  // 👍 Los mejor valorados: al menos 3 votos y ordenados sin premiar a los que tienen muy pocos
  const valoraciones = useValoraciones();
  const mejorValorados = useMemo(() => (valoraciones ? games
    .filter((g) => { const v = valoraciones[g.id]; return v && v.si + v.no >= 3 && v.si > v.no; })
    .sort((a, b) => puntuacion(valoraciones[b.id]) - puntuacion(valoraciones[a.id]))
    .slice(0, 12) : []), [valoraciones, games]);

  const juegosPorCategoria = useMemo(() => {
    const grupos = {};
    CATEGORIAS_PORTADA.forEach((cat) => {
      grupos[cat.id] = [];
    });

    games.forEach((g) => {
      const m = metaDe(g.id);
      const categoriasDelJuego = obtenerCategorias(g, m);

      if (categoriasDelJuego.length === 0) {
        if (grupos['chill']) grupos['chill'].push(g);
        return;
      }

      CATEGORIAS_PORTADA.forEach((cat) => {
        if (categoriasDelJuego.some((c) => coincideCategoria(c, cat))) {
          grupos[cat.id].push(g);
        }
      });
    });

    // El top del creador va en su orden
    if (grupos.favoritos) grupos.favoritos.sort((a, b) => TOP_CREADOR.indexOf(a.id) - TOP_CREADOR.indexOf(b.id));
    return grupos;
  }, [games]);

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      setBusqueda('');
    } else if (e.key === 'Enter' && hayBusqueda && resultados.length === 1) {
      navigate(`/juego/${resultados[0].id}`);
    }
  }

  const limpiar = () => {
    setBusqueda('');
    inputRef.current?.focus();
  };

  return (
    <div className="home-view">
      <header className="hub-head">
        <Icon name="gamepad" className="hub-bg" aria-hidden="true" />
        <div className="hub-barra">
          <div className="hub-yo"><ChipIdentidad /></div>
          <nav className="hub-iconos" aria-label="Opciones">
            <Link to="/grupos" className="hub-grupos" aria-label="Grupos" title="Grupos"><span aria-hidden="true">👥</span><em>Grupos</em></Link>
            <BotonSonido clase="en-portada" />
            <BotonAjustes />
          </nav>
        </div>

        <div className="hub-top">
          <img className="hub-logo hub-logo-img" src="/logo.svg" alt="" width="68" height="68" />
          <div>
            <h1 className="hub-title">Al juego, juego</h1>
            <p className="hub-sub">…y el que pierda paga el vino 🍷</p>
            <p className="hub-lema">Más de 100 juegos para jugar con amigos</p>
          </div>
        </div>

        <div className="hub-search" role="search">
          <Icon name="search" size={22} className="hub-search-icon" />
          <input
            ref={inputRef}
            type="search"
            className="hub-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar juego…"
            aria-label="Buscar juego"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          <div className="hub-search-acc">
            {busqueda.trim() !== '' && (
              <button type="button" className="hub-clear" onClick={limpiar} aria-label="Borrar búsqueda">
                <Icon name="x" size={18} strokeWidth={2.6} />
              </button>
            )}
            <button type="button" className={`fj-boton${nFiltros ? ' activo' : ''}`} onClick={() => setVerFiltros((v) => !v)} aria-expanded={verFiltros} aria-label="Filtros">
              <Icon name="filtros" size={19} strokeWidth={2.4} /><span>Filtros</span>{nFiltros > 0 && <em>{nFiltros}</em>}
            </button>
          </div>
        </div>
        {verFiltros && <PanelFiltros filtros={filtros} onCambiar={setFiltros} resultados={resultados.length} onCerrar={() => setVerFiltros(false)} />}

        {!cargando && !error && hayBusqueda && (
          <p className="hub-count" aria-live="polite">{resultados.length} de {games.length} juegos</p>
        )}
      </header>

      {!hayBusqueda && (
        <div className="home-accesos">
          <BannerReto />
          <div className="home-atajos">
            <Recomendador ids={games.map((g) => g.id)} />
            <Link to="/noche" className="est-boton noche" aria-label="Noche de juegos"><span>🎉</span>Noche de juegos</Link>
            <Link to="/estadisticas" className="est-boton" aria-label="Estadísticas"><span>📊</span>Estadísticas</Link>
          </div>
        </div>
      )}
      {!hayBusqueda && <Instalar />}

      {error && <p className="error">{error}</p>}
      {cargando && !error && <p className="loading">Cargando juegos…</p>}

      {/* Vista de resultados filtrados por búsqueda */}
      {!cargando && !error && hayBusqueda && resultados.length > 0 && (
        <ul className="game-grid">
          {resultados.map((g, i) => (
            <li key={g.id} style={{ '--i': Math.min(i, 14) }}><GameCard game={g} /></li>
          ))}
        </ul>
      )}

      {/* Vista principal con carruseles horizontales por categoría */}
      {!cargando && !error && !hayBusqueda && (
        <div className="home-categorias-contenedor">
          {(() => {
            const deIds = (ids) => ids.map((id) => games.find((g) => g.id === id)).filter(Boolean);
            const favs = deIds(favoritos); const recientes = deIds(jugados);
            return (
              <>
                {recientes.length > 0 && <FilaCarrusel cat={{ id: 'seguir', titulo: '🕹️ Seguir jugando' }} juegos={recientes} compacta />}
                {favs.length > 0 && <FilaCarrusel cat={{ id: 'favs', titulo: '❤️ Tus favoritos' }} juegos={favs} />}
              </>
            );
          })()}
          {CATEGORIAS_PORTADA.map((cat) => {
            const juegosCat = juegosPorCategoria[cat.id] || [];
            if (juegosCat.length === 0) return null;
            // Justo después del Top 15: los mejor valorados por todos (si ya hay votos suficientes)
            if (cat.id === 'favoritos' && mejorValorados.length >= 4) {
              return (
                <React.Fragment key={cat.id}>
                  <FilaCarrusel cat={cat} juegos={juegosCat} />
                  <FilaCarrusel cat={{ id: 'valorados', titulo: '👍 Los mejor valorados', desc: 'Lo que más gusta a los que juegan aquí' }} juegos={mejorValorados} />
                </React.Fragment>
              );
            }

            return <FilaCarrusel key={cat.id} cat={cat} juegos={juegosCat} />;
          })}
        </div>
      )}

      {!cargando && !error && hayBusqueda && resultados.length === 0 && (
        <div className="empty">
          <span className="empty-icon"><Icon name="search" size={30} /></span>
          <p className="empty-title">{busqueda.trim() ? `Ningún juego coincide con «${busqueda.trim()}»` : 'Ningún juego cumple los filtros'}</p>
          <p className="empty-text">{nFiltros ? 'Prueba a quitar algún filtro.' : 'Prueba con otra palabra: «música», «fútbol», «cartas»…'}</p>
          <button type="button" className="secondary" onClick={() => { limpiar(); setFiltros({ ...filtros, jugadores: null, modo: 'todos', duracion: null, tipos: [], favoritos: false }); }}>Borrar búsqueda y filtros</button>
        </div>
      )}

      <AdminPanel />

      {/* Pie de página con información y contacto */}
      <footer className="home-footer">
        <Icon name="gamepad" className="foot-bg" aria-hidden="true" />
        <div className="footer-content">
          <div className="footer-col about">
            <div className="footer-brand">
              <span className="footer-logo footer-logo-img">
                <img src="/logo.svg" alt="" width="40" height="40" />
              </span>
              <h3>Al juego, juego</h3>
            </div>
            <p className="footer-text">
              Tu plataforma definitiva de minijuegos sociales y de mesa interactivos. Diseñada para jugar en grupo, ya sea en un solo dispositivo pasando el móvil o cada uno desde el suyo con salas online en tiempo real.
            </p>
          </div>

          <div className="footer-col contact">
            <h4>Contacto y Redes</h4>
            <p className="footer-subtext">¿Tienes sugerencias o ideas para un nuevo juego? ¡Hablemos!</p>
            <div className="footer-links">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="footer-btn"
                title="Instagram"
              >
                <span className="footer-btn-icon">📷</span>
                <span>Instagram</span>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="footer-btn"
                title="X (Twitter)"
              >
                <span className="footer-btn-icon">𝕏</span>
                <span>X (Twitter)</span>
              </a>
              <a
                href="mailto:contacto@minigameshub.com"
                className="footer-btn email"
                title="Correo electrónico"
              >
                <span className="footer-btn-icon">✉️</span>
                <span>contacto@minigameshub.com</span>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Al juego, juego · Hecho para jugar con amigos y familia · <Link to="/creditos" className="footer-legal">Créditos y avisos legales</Link></p>
          <button
            type="button"
            className="footer-top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span aria-hidden="true">↑</span> Volver arriba
          </button>
        </div>
      </footer>
    </div>
  );
}