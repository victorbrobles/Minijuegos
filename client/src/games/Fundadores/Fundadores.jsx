// client/src/games/Fundadores/Fundadores.jsx
import React, { useState } from 'react';
import FundadoresLocal from './FundadoresLocal.jsx';
import FundadoresOnline from './FundadoresOnline.jsx';

export default function Fundadores({ mode }) {
  const [modo, setModo] = useState(mode || 'online');
  if (modo === 'local') return <FundadoresLocal onVolver={() => setModo('online')} />;
  return <FundadoresOnline onLocal={() => setModo('local')} />;
}
