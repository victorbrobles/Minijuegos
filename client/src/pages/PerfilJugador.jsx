// client/src/pages/PerfilJugador.jsx
// Perfil público de un jugador (/jugador/Nombre#1234): avatar, estadísticas, logros y récords.
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { AvatarJugador, EditarPerfil } from '../components/Perfil.jsx';
import { Personales, useJson } from './Estadisticas.jsx';
import { nombreCompleto, partirNombre } from '../lib/identidad.js';
import { metaDe } from '../games/meta.js';
import '../components/SalonFama.css';
import './Grupos.css';
import './Estadisticas.css';

export default function PerfilJugador() {
  const { nombre: param } = useParams();
  const nombre = decodeURIComponent(param || '');
  const valido = /^.{1,15}#\d{4}$/.test(nombre);
  const d = useJson(valido ? `/api/registros/jugador?nombre=${encodeURIComponent(nombre)}` : null);
  const [editar, setEditar] = useState(false);
  const esYo = nombre === nombreCompleto();
  const { nombre: visible, tag } = partirNombre(nombre);
  return (
    <div className="game-shell est-pagina">
      <Link to="/" className="back" aria-label="Volver a la portada"><Icon name="arrowLeft" size={20} strokeWidth={2.5} /><span>Portada</span></Link>
      <header className="pf-cab">
        <AvatarJugador nombre={nombre} tam={64} />
        <div><p>Perfil de jugador</p><h1>{visible} <small>#{tag}</small></h1></div>
        {esYo && <button type="button" onClick={() => setEditar(true)}>✏️ Avatar</button>}
      </header>
      {valido && !esYo && nombreCompleto() && <CaraACara yo={nombreCompleto()} rival={nombre} />}
      {esYo && <Link to="/grupos" className="nch-secundario grp-enlace">👥 Mis grupos de amigos</Link>}
      <section className="est-tarjeta">
        {valido ? <Personales d={d} yo={nombre} /> : <p className="slf-vacio">Ese jugador no existe.</p>}
      </section>
      {editar && <EditarPerfil jugador={nombre} onCerrar={() => setEditar(false)} />}
    </div>
  );
}

/** Historial «tú contra él/ella»: victorias de cada uno, por juego y últimas partidas juntos. */
function CaraACara({ yo, rival }) {
  const d = useJson(`/api/social/cara?a=${encodeURIComponent(yo)}&b=${encodeURIComponent(rival)}`);
  const n2 = partirNombre(rival).nombre;
  if (!d || d.error) return null;
  const total = d.ganaA + d.ganaB + d.empates;
  return (
    <section className="est-tarjeta">
      <h2>⚔️ Cara a cara</h2>
      {!d.partidas ? <p className="nch-nota">Todavía no habéis jugado juntos. ¡Reta a {n2}!</p> : (
        <>
          <div className="cac-marcador">
            <div className={`cac-lado${d.ganaA > d.ganaB ? ' gana' : ''}`}><AvatarJugador nombre={yo} tam={44} /><span>Tú</span><em>{d.ganaA}</em></div>
            <span className="cac-vs">VS</span>
            <div className={`cac-lado${d.ganaB > d.ganaA ? ' gana' : ''}`}><AvatarJugador nombre={rival} tam={44} /><span>{n2}</span><em>{d.ganaB}</em></div>
          </div>
          {total > 0 && (
            <div className="cac-barra" title={`${d.ganaA} – ${d.empates} – ${d.ganaB}`}>
              <i style={{ width: `${(d.ganaA / total) * 100}%`, background: '#7c3aed' }} />
              <i style={{ width: `${(d.empates / total) * 100}%`, background: '#cbd5e1' }} />
              <i style={{ width: `${(d.ganaB / total) * 100}%`, background: '#f97316' }} />
            </div>
          )}
          <p className="nch-nota">{d.partidas} partidas juntos{d.empates ? ` · ${d.empates} empates` : ''}. Gana quien queda por delante del otro (aunque gane un tercero).</p>
          <ul className="grp-noches">
            {d.porJuego.map((j) => (
              <li key={j.juego}><span>🎮</span><div><b>{metaDe(j.juego).titulo}</b><small>{j.partidas} {j.partidas === 1 ? 'partida' : 'partidas'}{j.a + j.b ? ` · Tú ${j.a} – ${j.b} ${n2}` : ''}</small></div></li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
