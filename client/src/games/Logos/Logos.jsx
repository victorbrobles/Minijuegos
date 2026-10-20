// client/src/games/Logos/Logos.jsx
import React, { useState } from 'react';
import LogosLocal from './LogosLocal.jsx';
import LogosOnline from './LogosOnline.jsx';

export default function Logos({ mode, onExit }) {
  const [modoInterno, setModoInterno] = useState(mode || 'online');

  if (modoInterno === 'local') {
    return <LogosLocal onSalir={() => setModoInterno('online')} />;
  }

  return (
    <LogosOnline
      onLocal={() => setModoInterno('local')}
      onSalir={onExit}
    />
  );
}