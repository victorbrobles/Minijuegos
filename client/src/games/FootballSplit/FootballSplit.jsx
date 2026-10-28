// client/src/games/FootballSplit/FootballSplit.jsx
import React, { useState } from 'react';
import FootballSplitLocal from './FootballSplitLocal.jsx';
import FootballSplitOnline from './FootballSplitOnline.jsx';

export default function FootballSplit({ onExit }) {
  const [modo, setModo] = useState('online');
  if (modo === 'local') return <FootballSplitLocal onVolver={() => setModo('online')} onExit={onExit} />;
  return <FootballSplitOnline onLocal={() => setModo('local')} onSalir={onExit} />;
}
