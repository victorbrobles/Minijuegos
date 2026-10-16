import { useEffect, useState } from 'react';
import { leerRecord } from './records.js';
import GameIntro from '../../components/GameIntro.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';

export default function SelectorCategoria({ onElegir }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setError(false);
    fetch('/api/siglas/categorias')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => !cancelado && setDatos(d))
      .catch(() => !cancelado && setError(true));
    return () => { cancelado = true; };
  }, [intento]);

  if (error) {
    return (
      <section className="game">
        <GameIntro gameId="siglas" titulo="Siglas y acrónimos" />
        <p className="error">No se pudo conectar con el servidor. ¿Está arrancado?</p>
        <button onClick={() => setIntento((i) => i + 1)}>Reintentar</button>
      </section>
    );
  }

  if (!datos) {
    return (
      <section className="game">
        <GameIntro gameId="siglas" titulo="Siglas y acrónimos" />
        <p className="loading">Cargando categorías…</p>
      </section>
    );
  }

  return (
    <section className="game">
      <GameIntro gameId="siglas" titulo="Siglas y acrónimos" />
      <div className="cat-grid">
        <CategoryCard todas nombre="Todas las categorías" record={leerRecord(null)} onClick={() => onElegir(null)} />
        {datos.categorias.map((c, i) => (
          <CategoryCard key={c.nombre} nombre={c.nombre} indice={i} record={leerRecord(c.nombre)} onClick={() => onElegir(c.nombre)} />
        ))}
      </div>
    </section>
  );
}
