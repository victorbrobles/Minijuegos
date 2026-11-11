// client/src/games/Mus/MusLocal.jsx
// Contra la máquina: tú y tu pareja 🤖 contra dos 🤖. El motor corre en el navegador.
import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import * as E from './engine.js';
import { Mesa, Fin, Config } from './Mesa.jsx';
import { ModalSalir } from '../Pulsador/Vistas.jsx';
import { BloqueConfig } from '../../components/MenuJuego.jsx';

export default function MusLocal({ juego, onVolver, onExit, onAbrirAyuda }) {
  const [paso, setPaso] = useState('config');
  const [nombre, setNombre] = useState('');
  const [config, setConfig] = useState({ objetivo: 40, vacas: 1 });
  const [modal, setModal] = useState(false);
  const [aviso, setAviso] = useState(null);
  const estRef = useRef(null);
  const [, setVer] = useState(0);
  const refrescar = () => setVer((x) => x + 1);

  useEffect(() => {
    if (paso !== 'juego') return undefined;
    const i = setInterval(() => { if (estRef.current && E.tick(estRef.current, Date.now())) refrescar(); }, 250);
    return () => clearInterval(i);
  }, [paso]);

  const empezar = () => {
    const yo = nombre.trim() || 'Tú';
    estRef.current = E.crearPartida([
      { id: 1, nombre: yo }, { id: 2, nombre: 'Paco 🤖', bot: true }, { id: 3, nombre: 'Maite 🤖', bot: true }, { id: 4, nombre: 'Ramón 🤖', bot: true }
    ], config, Date.now());
    setPaso('juego');
  };

  if (paso === 'config') {
    return (
      <div className={`pzp-contenedor ${juego.id}`}>
        <section className="game qq-pantalla">
          <div className="panel qq-menu-panel">
            <button type="button" className="qq-link-volver" onClick={onVolver}><Icon name="arrowLeft" size={16} /> Volver</button>
            <h2 className="qq-sala-titulo" style={{ marginTop: '0.6rem' }}>🂡 Contra la máquina</h2>
            <p className="hint">Juegas con Maite 🤖 de pareja contra Paco 🤖 y Ramón 🤖.</p>
            <BloqueConfig titulo="Tu nombre">
              <input className="pzp-input" value={nombre} maxLength={20} placeholder="Tú" onChange={(e) => setNombre(e.target.value)} />
            </BloqueConfig>
            <Config config={config} onCambiar={(c) => setConfig((x) => ({ ...x, ...c }))} />
            <button type="button" className="big full qq-btn-principal" onClick={empezar}><Icon name="play" size={22} /> ¡A jugar!</button>
            <button type="button" className="qq-link-volver" style={{ marginTop: '0.6rem' }} onClick={onAbrirAyuda}>❓ Cómo se juega</button>
          </div>
        </section>
      </div>
    );
  }

  const est = estRef.current;
  const v = E.vistaDe(est, 1);
  const enviar = (tipo, d = {}) => {
    const t = Date.now();
    let r;
    if (tipo === 'mus') r = E.mus(est, 0, d.pide, t);
    else if (tipo === 'descartar') r = E.descartar(est, 0, d.ids, t);
    else if (tipo === 'hablar') r = E.hablar(est, 0, { tipo: d.accion, cantidad: d.cantidad }, t);
    else if (tipo === 'seguir' || tipo === 'forzar') r = E.seguir(est, 0, t);
    else if (tipo === 'verPuntos') r = E.verPuntos(est);
    if (r && !r.ok) { setAviso(r.error); setTimeout(() => setAviso(null), 2500); }
    refrescar();
  };
  return (
    <div className={`pzp-contenedor ${juego.id} qq-en-partida`}>
      {aviso && <p className="pzp-toast" role="alert">{aviso}</p>}
      <section className="game pzp-escena">
        {est.fase === 'fin' ? (
          <Fin v={v} onSalir={() => setModal(true)}>
            <div className="pzp-barra estatica">
              <button type="button" className="pzp-boton grande" onClick={() => setPaso('config')}><Icon name="refresh" size={20} /> Otra partida</button>
              <button type="button" className="pzp-boton secundario" onClick={() => onExit?.()}><Icon name="door" size={18} /> Salir a la portada</button>
            </div>
          </Fin>
        ) : <Mesa v={v} enviar={enviar} onSalir={() => setModal(true)} anfitrion />}
      </section>
      {modal && (
        <ModalSalir titulo="¿Salir de la partida?" texto="Se perderá la partida en curso y volverás a la portada."
          onSeguir={() => setModal(false)} onSalir={() => { setModal(false); onExit?.(); }} />
      )}
    </div>
  );
}
