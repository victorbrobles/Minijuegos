// client/src/games/Hipotesis/Hipotesis.jsx
import React, { useState } from 'react';
import HipotesisLocal from './HipotesisLocal.jsx';
import HipotesisOnline from './HipotesisOnline.jsx';

export default function Hipotesis({ mode }) {
  const [modo, setModo] = useState(mode || 'online');
  if (modo === 'local') return <HipotesisLocal onVolver={() => setModo('online')} />;
  return <HipotesisOnline onLocal={() => setModo('local')} />;
}
