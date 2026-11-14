// client/src/pages/PerfilJugador.jsx
// Perfil público de un jugador (/jugador/Nombre#1234): avatar, estadísticas, logros y récords.
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { AvatarJugador, EditarPerfil } from '../components/Perfil.jsx';
import { Personales, useJson } from './Estadisticas.jsx';
import { nombreCompleto, partirNombre } from '../lib/identidad.js';
import '../components/SalonFama.css';
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
      <section className="est-tarjeta">
        {valido ? <Personales d={d} yo={nombre} /> : <p className="slf-vacio">Ese jugador no existe.</p>}
      </section>
      {editar && <EditarPerfil jugador={nombre} onCerrar={() => setEditar(false)} />}
    </div>
  );
}
