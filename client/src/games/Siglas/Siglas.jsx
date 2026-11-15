import { useState } from 'react';
import SelectorCategoria from './SelectorCategoria.jsx';
import Partida from './Partida.jsx';
import { useAbrirAyuda } from '../../lib/ayuda.js';

// undefined = eligiendo categoría · null = todas mezcladas · string = categoría concreta
export default function Siglas() {
  const [categoria, setCategoria] = useState(undefined);
  const abrirAyuda = useAbrirAyuda();

  if (categoria === undefined) {
    return (
      <div style={{ position: 'relative', width: '100%' }}>

        {/* Modal explicativo */}

        <SelectorCategoria onElegir={setCategoria} onAyuda={abrirAyuda} />
      </div>
    );
  }

  return (
    <Partida
      key={categoria ?? 'todas'}
      categoria={categoria}
      onCambiarCategoria={() => setCategoria(undefined)}
    />
  );
}