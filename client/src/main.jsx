import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';
import { instalarEfectos } from './lib/efectos.js';
import { instalarSalaViva } from './lib/salaViva.js';
import { aplicarAjustes } from './lib/ajustes.js';
import { autodescargarSiApp } from './lib/sinConexion.js';
import './styles/accesibilidad.css';
import { iniciarMetricas } from './lib/metricas.js';

// Accesibilidad (letra, contraste, animaciones) antes de pintar nada
aplicarAjustes();
instalarEfectos();
instalarSalaViva();
iniciarMetricas();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Instalable como app: el service worker solo en producción (en desarrollo estorbaría a Vite)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
    autodescargarSiApp(); // instalada como app: los juegos se descargan solos para jugar sin conexión
  });
}
