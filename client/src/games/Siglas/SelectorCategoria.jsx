// client/src/games/Siglas/SelectorCategoria.jsx
import React, { useEffect, useState } from 'react';
import { leerRecord } from './records.js';
import Icon, { ICONO_CATEGORIA } from '../../components/Icon.jsx';
import './Siglas.css';
import { ChipJugadores } from '../../components/MenuJuego.jsx';

const COLORES_CATEGORIA = [
  ['#f97316', '#ef4444'],
  ['#8b5cf6', '#6366f1'],
  ['#06b6d4', '#3b82f6'],
  ['#ec4899', '#f43f5e'],
  ['#22c55e', '#84cc16'],
  ['#3b82f6', '#8b5cf6'],
  ['#f59e0b', '#f97316'],
  ['#14b8a6', '#22c55e']
];

export default function SelectorCategoria({
  tituloJuego = 'Siglas y acrónimos',
  descripcionJuego,
  onElegir,
  onSalir,
  onAyuda
}) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    let cancelado = false;
    setError(false);
    fetch('/api/siglas/categorias')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => !cancelado && setDatos(d))
      .catch(() => !cancelado && setError(true));
    return () => {
      cancelado = true;
    };
  }, [intento]);

  if (error) {
    return (
      <section className="game qqp-escena">
        <div className="panel center qq-menu-panel">
          <div className="qq-hero-icono">
            <Icon name="zap" size={42} strokeWidth={1.7} />
          </div>
          <h2 className="title qq-main-title">{tituloJuego}</h2>
          <ChipJugadores juegoId="siglas" />
          <p className="error" style={{ margin: '0.8rem 0' }}>
            No se pudo conectar con el servidor. ¿Está arrancado?
          </p>
          <button
            type="button"
            className="big full qq-btn-principal"
            onClick={() => setIntento((i) => i + 1)}
          >
            <Icon name="refresh" size={20} /> Reintentar
          </button>
        </div>
      </section>
    );
  }

  if (!datos) {
    return (
      <section className="game qqp-escena">
        <div className="qqp-tarjeta qqp-pasar">
          <span className="qqp-spinner" aria-hidden="true" />
          <p className="qqp-texto" style={{ marginTop: '0.75rem' }}>
            Cargando categorías…
          </p>
        </div>
      </section>
    );
  }

  const normalizar = (t) =>
    t
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const todasOpciones = [
    { nombre: 'Todas las categorías', esTodas: true, icono: 'star' },
    ...(datos.categorias || []).map((c) => ({
      ...c,
      esTodas: false,
      icono: ICONO_CATEGORIA?.[c.nombre] || 'star'
    }))
  ];

  const visibles = filtro.trim()
    ? todasOpciones.filter((c) => normalizar(c.nombre).includes(normalizar(filtro.trim())))
    : todasOpciones;

  const recordGlobal = leerRecord(null);

  return (
    <section className="game qqp-escena">
      <header className="qqp-hero">
        <span className="qqp-hero-deco" aria-hidden="true">
          <Icon name="zap" size={150} strokeWidth={1.4} />
        </span>

        <div className="qqp-hero-top">
          {onSalir ? (
            <button type="button" className="qqp-salir" onClick={onSalir}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Portada</span>
            </button>
          ) : (
            <span />
          )}

          <div className="qqp-hero-chips">
            <span className="qqp-chip">
              <Icon name="trophy" size={14} /> <span>Récord: {recordGlobal} pts</span>
            </span>
            <span className="qqp-chip">
              <Icon name="users" size={14} /> <span>1 jugador</span>
            </span>
            {onAyuda && (
              <button
                type="button"
                className="qqp-ayuda"
                onClick={onAyuda}
                title="Cómo jugar"
                aria-label="Cómo jugar"
              >
                ?
              </button>
            )}
          </div>
        </div>

        <p className="qqp-hero-etiqueta">{tituloJuego}</p>
        <h2 className="qqp-hero-titulo">Elige una categoría</h2>
        {descripcionJuego && <p className="qqp-hero-aviso">{descripcionJuego}</p>}

        <label className="qqp-buscador">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar categoría…"
            aria-label="Buscar categoría"
          />
        </label>
      </header>

      {visibles.length ? (
        <ul className="qqp-categorias">
          {visibles.map((cat, idx) => {
            const [c1, c2] = COLORES_CATEGORIA[idx % COLORES_CATEGORIA.length];
            const rec = leerRecord(cat.esTodas ? null : cat.nombre);
            return (
              <li key={cat.nombre}>
                <button
                  type="button"
                  className="qqp-categoria"
                  style={{ '--c1': c1, '--c2': c2 }}
                  onClick={() => onElegir(cat.esTodas ? null : cat.nombre)}
                >
                  <div className="siglas-cat-top">
                    <span className="qqp-categoria-icono">
                      <Icon name={cat.icono || 'star'} size={24} />
                    </span>
                    <span className="siglas-record-pill">
                      🏆 {rec} {rec === 1 ? 'pt' : 'pts'}
                    </span>
                  </div>

                  <span className="qqp-categoria-textos">
                    <span className="qqp-categoria-nombre">{cat.nombre}</span>
                    <span className="qqp-categoria-info">
                      {cat.esTodas
                        ? 'Mezcla todas las siglas'
                        : cat.total
                        ? `${cat.total} siglas · 20s por turno`
                        : '20s por sigla · Muerte súbita'}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="qqp-vacio">No hay ninguna categoría con «{filtro}».</p>
      )}
    </section>
  );
}