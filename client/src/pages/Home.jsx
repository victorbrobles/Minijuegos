// client/src/pages/Home.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameCard from '../components/GameCard.jsx';
import Icon from '../components/Icon.jsx';
import AdminPanel from '../components/AdminPanel.jsx';
import { metaDe, CATEGORIAS_PORTADA } from '../games/meta.js';

const normalizar = (t) =>
  String(t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export default function Home() {
  const [games, setGames] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [fijo, setFijo] = useState(false);
  const inputRef = useRef(null);
  const centinelaRef = useRef(null);
  const navigate = useNavigate();

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
    const el = centinelaRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([e]) => setFijo(!e.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
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
          resto: normalizar(`${g.description ?? ''} ${m.descripcion} ${m.etiquetas ?? ''}`),
          categoria: m.categoria || 'chill'
        };
      }),
    [games]
  );

  const resultados = useMemo(() => {
    const palabras = normalizar(busqueda).split(' ').filter(Boolean);
    if (palabras.length === 0) return games;
    return indice
      .map((it) => {
        const enNombre = palabras.every((p) => it.nombre.includes(p));
        const enTodo = palabras.every((p) => it.nombre.includes(p) || it.resto.includes(p));
        return { it, puntos: enNombre ? 0 : enTodo ? 1 : -1 };
      })
      .filter((r) => r.puntos >= 0)
      .sort((a, b) => a.puntos - b.puntos)
      .map((r) => r.it.game);
  }, [busqueda, games, indice]);

  const hayBusqueda = busqueda.trim() !== '';

  // Agrupación por categorías para la vista por defecto
  const juegosPorCategoria = useMemo(() => {
    const grupos = {};
    CATEGORIAS_PORTADA.forEach((cat) => {
      grupos[cat.id] = [];
    });

    games.forEach((g) => {
      const m = metaDe(g.id);
      const catId = m.categoria || 'chill';
      if (grupos[catId]) {
        grupos[catId].push(g);
      } else {
        grupos['chill'] = grupos['chill'] || [];
        grupos['chill'].push(g);
      }
    });

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
      <header className="home-head">
        <span className="home-logo"><Icon name="gamepad" size={32} strokeWidth={1.9} /></span>
        <div>
          <h1 className="home-title">Minigames Hub</h1>
          <p className="home-sub">¡Elige un minijuego y a jugar!</p>
        </div>
      </header>

      <div ref={centinelaRef} className="search-sentinel" aria-hidden="true" />
      <div className={`search-wrap${fijo ? ' fijo' : ''}`}>
        <div className="search" role="search">
          <Icon name="search" size={20} className="search-icon" />
          <input
            ref={inputRef}
            type="search"
            className="search-input"
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
          {hayBusqueda && (
            <button type="button" className="search-clear" onClick={limpiar} aria-label="Borrar búsqueda">
              <Icon name="x" size={18} strokeWidth={2.4} />
            </button>
          )}
        </div>
        {!cargando && !error && (
          <p className="search-count" aria-live="polite">
            {hayBusqueda
              ? `${resultados.length} de ${games.length} juegos`
              : `${games.length} juegos organizados por categorías`}
          </p>
        )}
      </div>

      {error && <p className="error">{error}</p>}
      {cargando && !error && <p className="loading">Cargando juegos…</p>}

      {/* VISTA 1: CUANDO HAY UNA BÚSQUEDA ACTIVA (Cuadrícula tradicional filtrada) */}
      {!cargando && !error && hayBusqueda && resultados.length > 0 && (
        <ul className="game-grid">
          {resultados.map((g, i) => (
            <li key={g.id} style={{ '--i': Math.min(i, 14) }}><GameCard game={g} /></li>
          ))}
        </ul>
      )}

      {/* VISTA 2: PORTADA POR DEFECTO (Carruseles horizontales de 3 en 3 por categoría) */}
      {!cargando && !error && !hayBusqueda && (
        <div className="home-categorias-contenedor">
          {CATEGORIAS_PORTADA.map((cat) => {
            const juegosCat = juegosPorCategoria[cat.id] || [];
            if (juegosCat.length === 0) return null;

            return (
              <section key={cat.id} className="home-categoria-bloque">
                <div className="home-categoria-header">
                  <h2 className="home-categoria-titulo">{cat.titulo}</h2>
                  <p className="home-categoria-desc">{cat.desc}</p>
                </div>

                <ul className="home-carousel-track">
                  {juegosCat.map((g, i) => (
                    <li key={g.id} className="home-carousel-item" style={{ '--i': Math.min(i, 8) }}>
                      <GameCard game={g} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {!cargando && !error && hayBusqueda && resultados.length === 0 && (
        <div className="empty">
          <span className="empty-icon"><Icon name="search" size={30} /></span>
          <p className="empty-title">Ningún juego coincide con «{busqueda.trim()}»</p>
          <p className="empty-text">Prueba con otra palabra: «música», «fútbol», «cartas»…</p>
          <button type="button" className="secondary" onClick={limpiar}>Borrar búsqueda</button>
        </div>
      )}

      <AdminPanel />
    </div>
  );
}