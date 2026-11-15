// client/src/pages/Tele.jsx
// Modo tele: /tele/<juego>/<código>. Para poner en la tele o en el portátil mientras se juega con los móviles:
// QR y código para entrar, marcador en grande y la lluvia de reacciones de la sala.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { metaDe } from '../games/meta.js';
import { useLluviaReacciones, Globos } from '../components/Reacciones.jsx';
import { fetchOriginal } from '../lib/salaViva.js';
import './Tele.css';

const ESTADOS = { lobby: '⏳ Sala de espera', jugando: '🎮 En juego', fin: '🏁 Partida terminada' };
const MEDALLAS = ['🥇', '🥈', '🥉'];

export default function Tele() {
  const { juego, code } = useParams();
  const m = metaDe(juego);
  const navigate = useNavigate();
  // Volver: si se abrió en otra pestaña, se cierra; si no, a la página anterior (o al juego)
  const volver = () => { if (window.opener) { window.close(); return; } if (window.history.length > 1) navigate(-1); else navigate(`/juego/${juego}`); };
  const [d, setD] = useState(null);
  const [qr, setQr] = useState('');
  const enlace = `${window.location.origin}/juego/${juego}?sala=${code}`;
  const { globos } = useLluviaReacciones(juego, code);

  useEffect(() => {
    let vivo = true;
    const leer = () => fetchOriginal(`/api/social/sala/${encodeURIComponent(juego)}/${code}`).then((r) => (r.ok ? r.json() : null)).then((x) => { if (vivo && x) setD(x); }).catch(() => {});
    leer();
    const t = setInterval(leer, 1500);
    return () => { vivo = false; clearInterval(t); };
  }, [juego, code]);
  useEffect(() => { QRCode.toDataURL(enlace, { margin: 1, width: 520 }).then(setQr).catch(() => {}); }, [enlace]);
  useEffect(() => { document.title = `📺 ${m.titulo} · ${code}`; }, [m.titulo, code]);

  const estado = d?.estado || 'lobby';
  const conPuntos = (d?.jugadores || []).some((j) => j.puntos != null);
  const tabla = useMemo(() => {
    const l = [...(d?.jugadores || [])];
    return conPuntos ? l.sort((a, b) => (b.puntos ?? -Infinity) - (a.puntos ?? -Infinity)) : l;
  }, [d, conPuntos]);
  const conectado = (n) => (d?.conectados || []).some((c) => c.replace(/#\d{4}$/, '').toLowerCase() === n.replace(/#\d{4}$/, '').toLowerCase());
  const pantallaCompleta = () => { (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.())?.catch?.(() => {}); };

  return (
    <div className={`tv tv-${estado}`} style={{ '--g1': m.colores[0], '--g2': m.colores[1] }}>
      <header className="tv-cab">
        <button type="button" className="tv-volver" onClick={volver} aria-label="Volver">←</button>
        {m.imagen && <img src={m.imagen} alt="" />}
        <div><p>{ESTADOS[estado] || ESTADOS.jugando}</p><h1>{m.titulo}</h1></div>
        <button type="button" className="tv-pc" onClick={pantallaCompleta}>⛶ Pantalla completa</button>
      </header>
      <section className="tv-cuerpo">
        <aside className="tv-unete">
          <p>Únete desde tu móvil</p>
          {qr ? <img src={qr} alt={`QR de la sala ${code}`} /> : <div className="tv-qr-vacio" />}
          <b className="tv-codigo">{code}</b>
          <small>{window.location.host}</small>
        </aside>
        <div className="tv-marcador">
          <h2>{estado === 'lobby' ? `Jugadores (${tabla.length})` : 'Marcador'}</h2>
          {!d?.existe || !tabla.length ? (
            <p className="tv-espera">Esperando a que los jugadores entren en la sala…<br /><small>Escanead el QR o entrad con el código <b>{code}</b>.</small></p>
          ) : (
            <ol>
              {tabla.map((j, i) => (
                <li key={j.nombre} className={`${conPuntos && i === 0 && estado !== 'lobby' ? 'lider' : ''}${conectado(j.nombre) ? '' : ' desconectado'}`} style={{ animationDelay: `${i * 60}ms` }}>
                  <span className="tv-pos">{conPuntos && estado !== 'lobby' ? (MEDALLAS[i] || `${i + 1}.`) : '•'}</span>
                  <span className="tv-ini">{j.nombre.slice(0, 1).toUpperCase()}</span>
                  <b>{j.nombre}</b>
                  {conPuntos && <em>{j.puntos ?? '–'}</em>}
                </li>
              ))}
            </ol>
          )}
          <p className="tv-pista">Las reacciones 😂🔥👏 que mandéis desde los móviles salen aquí.</p>
        </div>
      </section>
      <Globos globos={globos} grande />
    </div>
  );
}
