// client/src/games/Conoce/Conoce.jsx
import React, { useState } from 'react';
import ConoceLocal from './ConoceLocal.jsx';
import ConoceOnline from './ConoceOnline.jsx';

export default function Conoce({ mode, onExit }) {
  const [modoInterno, setModoInterno] = useState(mode || 'online');

  if (modoInterno === 'local') {
    return <ConoceLocal onSalir={() => setModoInterno('online')} />;
  }

  return (
    <ConoceOnline
      onLocal={() => setModoInterno('local')}
      onSalir={onExit}
    />
  );
}