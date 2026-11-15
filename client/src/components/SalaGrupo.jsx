// client/src/components/SalaGrupo.jsx
// Presencia global de la sala del grupo (en toda la web): una pastilla para volver a la sala y el aviso
// «Ana ha abierto «Tablero»» cuando el anfitrión abre una partida y tú estás en otra pantalla.
// La página de la sala (pages/SalaGrupo.jsx) entra sola en las partidas; aquí solo se avisa.
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSalaGrupo, entrarEnPartida, partidaDelGrupo } from '../lib/salaGrupo.js';
import { salaActual } from '../lib/salaViva.js';
import { metaDe } from '../games/meta.js';
import { partirNombre } from '../lib/identidad.js';
import './SalaGrupo.css';

const plano = (j) => partirNombre(j)?.nombre || String(j || '').replace(/#\d{4}$/, '');

export default function SalaGrupoGlobal() {
  const { activa, estado, soyAnfitrion } = useSalaGrupo();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [descartado, setDescartado] = useState('');
  const seguirRef = useRef(null);
  const [, setN] = useState(0);
  useEffect(() => { const t = setInterval(() => setN((n) => n + 1), 2000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (seguirRef.current) { const j = seguirRef.current; seguirRef.current = null; entrarEnPartida(j.id, j.codigo, navigate, j.api); }
  });
  if (!activa) return null;
  const enSala = pathname === `/grupo/${activa.codigo}/sala`;
  if (enSala) return null;
  const juego = estado?.juego;
  const clave = juego ? `${juego.id}:${juego.codigo}:${juego.desde}` : '';
  const sala = salaActual();
  const mia = partidaDelGrupo(); // «juego:código» de la partida del grupo en la que entraste
  const enEsaPartida = Boolean(juego && pathname.startsWith(`/juego/${juego.id}`)
    && (soyAnfitrion || mia === `${juego.id}:${juego.codigo}` || (sala && sala.code === juego.codigo)));
  // Si sigues en la partida anterior del grupo, pasas sola a la nueva (sin aviso)
  const enLaAnterior = Boolean(mia && pathname.startsWith(`/juego/${mia.split(':')[0]}`));
  const seguir = juego?.codigo && !soyAnfitrion && !enEsaPartida && enLaAnterior;
  const aviso = juego?.codigo && !soyAnfitrion && !enEsaPartida && !enLaAnterior && descartado !== clave;
  if (seguir) seguirRef.current = juego;
  const conectados = estado?.conectados?.length || 0;
  return (
    <>
      <Link className={`sgg-pastilla${pathname.startsWith('/juego/') ? ' en-juego' : ''}`} to={`/grupo/${activa.codigo}/sala`}>
        <span aria-hidden="true">👥</span>
        <b>{pathname.startsWith('/juego/') ? 'Volver a la sala' : activa.nombre || 'Sala del grupo'}</b>
        {conectados > 0 && <small>{conectados} 🟢</small>}
      </Link>
      {aviso && (
        <div className="sgg-aviso" role="status">
          <span className="sgg-aviso-emoji">🎮</span>
          <p><b>{plano(juego.por)}</b> ha abierto <b>«{metaDe(juego.id).titulo}»</b> para el grupo</p>
          <div>
            <button type="button" className="sgg-entrar" onClick={() => { setDescartado(clave); entrarEnPartida(juego.id, juego.codigo, navigate, juego.api); }}>Entrar</button>
            <button type="button" className="sgg-luego" onClick={() => setDescartado(clave)} aria-label="Ahora no">✕</button>
          </div>
        </div>
      )}
    </>
  );
}
