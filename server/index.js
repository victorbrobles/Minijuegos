// server/index.js

import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import basicAuth from 'express-basic-auth';

// Definición de __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas de juegos
import gamesRouter from './routes/games.js';
import siglasRouter from './routes/siglas.js';
import quienEsQuienRouter from './routes/quienesquien.js';
import adminRouter from './routes/admin.js';
import trayectoriaRoutes from './routes/trayectoria.js';
import rasgosRouter from './routes/rasgos.js';
import rankingsRouter from './routes/rankings.js';
import aproximacionRouter from './routes/aproximacion.js';
import ubicacionRouter from './routes/ubicacion.js';
import adivinaRouter from './routes/adivina.js';
import pistasRouter from './routes/pistas.js';
import velocidadRouter from './routes/velocidad.js';
import quienMasRouter from './routes/quienmas.js';
import confianzaCiegaRouter from './routes/confianzaciega.js';
import frasesCelebresRouter from './routes/frasescelebres.js';
import conectaRouter from './routes/conecta.js';
import impostorRouter from './routes/impostor.js';
import coloresRouter from './routes/colores.js';
import lobosRouter from './routes/lobos.js';
import buscaminasRouter from './routes/buscaminas.js';
import popularRouter from './routes/popular.js';
import masmenosRouter from './routes/masmenos.js';
import cancionRouter from './routes/cancion.js';
import ciegasRouter from './routes/ciegas.js';
import rapidfireRouter from './routes/rapidfire.js';
import traicionesRouter from './routes/traiciones.js';
import fundadoresRouter from './routes/fundadores.js';
import coleccionRouter from './routes/coleccion.js';
import sumaceroRouter from './routes/sumacero.js';
import golpeRouter from './routes/golpe.js';
import unoadiezRouter from './routes/unoadiez.js';
import telepatiaRouter from './routes/telepatia.js';
import descarteRouter from './routes/descarte.js';
import bingoballRoutes from './routes/bingoball.js';
import cuentasRoutes from './routes/cuentas.js';
import musRoutes from './routes/mus.js';
import reinosRoutes from './routes/reinos.js';
import inventoRoutes from './routes/invento.js';
import directorRoutes from './routes/director.js';
import minotauroRoutes from './routes/minotauro.js';
import constructoresRoutes from './routes/constructores.js';
import hemerotecaRoutes from './routes/hemeroteca.js';
import actaRoutes from './routes/acta.js';
import oncefantasmaRoutes from './routes/oncefantasma.js';
import unapiezaRoutes from './routes/unapieza.js';
import datosobraRoutes from './routes/datosobra.js';
import parejaRoutes from './routes/pareja.js';
import tableroRoutes from './routes/tablero.js';
import musavanzadoRoutes from './routes/musavanzado.js';
import conoceRoutes from './routes/conoce.js';
import logosRoutes from './routes/logos.js';
import hipotesisRoutes from './routes/hipotesis.js';
import trescientosunoRoutes from './routes/trescientosuno.js';
import jugadoresRoutes from './routes/jugadores.js';
import furboRoutes from './routes/furbo.js';
import futbolgridRoutes from './routes/futbolgrid.js';
import jugadasRoutes from './routes/jugadas.js';
import cuatroclubesRoutes from './routes/cuatroclubes.js';
import geoquizRoutes from './routes/geoquiz.js';
import fichajesRoutes from './routes/fichajes.js';
import soloRoutes from './routes/solo.js';
import perfilRoutes from './routes/perfil.js';
import socialRoutes from './routes/social.js';
import cuatrocuatrosRoutes from './routes/cuatrocuatros.js';
import garabatoRoutes from './routes/garabato.js';
import torreRoutes from './routes/torre.js';
import minigolfRoutes from './routes/minigolf.js';
import canicasRoutes from './routes/canicas.js';
import habilidadRoutes from './routes/habilidad.js';
import dragonRoutes from './routes/dragon.js';
import subastaRoutes from './routes/subasta.js';
import patataRoutes from './routes/patata.js';
import piramidesRoutes from './routes/piramides.js';
import transmisionRoutes from './routes/transmision.js';
import lapizRoutes from './routes/lapiz.js';
import intrusoRoutes from './routes/intruso.js';
import ponordenRoutes from './routes/ponorden.js';
import esconditeRoutes from './routes/escondite.js';
import registrosRoutes from './routes/registros.js';
import retoRoutes from './routes/reto.js';
import valoracionesRoutes from './routes/valoraciones.js';
import metricasRoutes from './routes/metricas.js';
import { cabecerasSeguridad, limitePeticiones, ES_ESCRITURA } from './lib/seguridad.js';

const app = express();
const PORT = process.env.PORT || 3001;

// IP real del visitante. En Render (que define RENDER=true) hay un proxy delante que la manda en X-Forwarded-For:
// se confía en ese único salto. Fuera de Render no se confía en la cabecera, porque cualquiera podría inventársela
// y saltarse los límites de intentos. TRUST_PROXY=<nº de proxies> lo ajusta a mano (0 = no confiar).
const trustProxy = process.env.TRUST_PROXY;
app.set('trust proxy', trustProxy !== undefined
  ? (Number.isNaN(Number(trustProxy)) ? trustProxy : Number(trustProxy))
  : (process.env.RENDER ? 1 : false));
app.disable('x-powered-by'); // no anunciar que el servidor es Express

app.use(cabecerasSeguridad);
// Comprime las respuestas (JS, CSS, JSON…): la web pesa unas 4 veces menos al cargar
app.use(compression());
// Sin CORS: la web y la API van en el mismo dominio, así que ninguna otra web puede leer la API

// Límites por IP: generoso para el uso normal (las salas consultan el estado cada segundo, y en una misma casa
// varios móviles comparten IP) y más estricto para lo que crea o guarda algo.
app.use('/api', limitePeticiones({ clave: 'api', maximo: 1500 }));
const limiteEscritura = limitePeticiones({ clave: 'escritura', maximo: 60, mensaje: 'Vas muy rápido. Espera un momento y vuelve a intentarlo.' });
app.use('/api', (req, res, next) => (ES_ESCRITURA(req) ? limiteEscritura(req, res, next) : next()));
// Los dibujos de «Garabato Encadenado» pesan más que una acción normal
app.use('/api/garabato', express.json({ limit: '300kb' }));
// La copia del perfil (récords, favoritos, logros…) puede pasar de los 100 KB normales
app.use('/api/perfil/copia', express.json({ limit: '1mb' }));
app.use(express.json());

// Contraseña de acceso a la web: solo si se define AUTH_PASSWORD (en Render, en las variables de entorno).
// Sin ella (p. ej. en localhost) la web queda abierta. No hay ninguna contraseña escrita en el código.
// Basta con AUTH_PASSWORD: si no se define AUTH_USER, el usuario es «admin» (como siempre ha sido).
const PASSWORD = process.env.AUTH_PASSWORD; // Evita el '#' si da problemas en el túnel
const USUARIO = process.env.AUTH_USER || 'admin';
const CON_CONTRASENA = Boolean(PASSWORD);
if (CON_CONTRASENA) console.log(`[acceso] Web protegida con contraseña (usuario «${USUARIO}»).`);
else console.warn(`[acceso] ${process.env.RENDER ? '⚠️ EN RENDER y s' : 'S'}in AUTH_PASSWORD: la web está abierta, sin contraseña.`);

// Archivos de la app instalable (PWA): el navegador los pide sin la contraseña, así que van antes de la autenticación.
// No contienen nada privado: manifiesto, iconos y service worker.
const PUBLICOS_PWA = ['/manifest.webmanifest', '/sw.js', '/icon-192.png', '/icon-512.png', '/icon-maskable-512.png', '/apple-touch-icon.png',
  '/favicon.svg', '/logo.svg', '/og-imagen.jpg'];
app.get(PUBLICOS_PWA, (req, res) => {
  if (req.path === '/sw.js') res.set('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, '../client/dist', req.path));
});

if (CON_CONTRASENA) {
  // Máximo 20 contraseñas fallidas por IP cada 10 minutos: probar contraseñas a lo bruto queda frenado
  const fallosAcceso = new Map(); // ip → [instantes de fallos]
  const recientesAcceso = (ip) => (fallosAcceso.get(ip) || []).filter((t) => Date.now() - t < 10 * 60_000);
  app.use((req, res, next) => {
    if (recientesAcceso(req.ip).length >= 20) return res.status(429).send('Demasiados intentos de acceso. Espera unos minutos.');
    next();
  });
  setInterval(() => { for (const ip of fallosAcceso.keys()) { const l = recientesAcceso(ip); if (l.length) fallosAcceso.set(ip, l); else fallosAcceso.delete(ip); } }, 10 * 60_000).unref();
  app.use(basicAuth({
    authorizer: (username, password) => {
      const userMatches = basicAuth.safeCompare(username, USUARIO);
      const passwordMatches = basicAuth.safeCompare(password, PASSWORD);
      return userMatches && passwordMatches;
    },
    challenge: true,
    realm: 'Acceso privado',
    unauthorizedResponse: (req) => {
      if (req.headers.authorization) fallosAcceso.set(req.ip, [...recientesAcceso(req.ip), Date.now()]); // contraseña mal puesta
      return 'Acceso privado';
    }
  }));
}

// 3. Servir frontend compilado. Los archivos de /assets llevan una huella en el nombre (cambian de nombre en cada
// versión), así que el navegador puede guardarlos un año. Las portadas, una semana. index.html, siempre fresco.
app.use(express.static(path.join(__dirname, '../client/dist'), {
  setHeaders: (res, ruta) => {
    if (/[\\/]assets[\\/]/.test(ruta)) res.set('Cache-Control', 'public, max-age=31536000, immutable');
    else if (/[\\/]covers[\\/]/.test(ruta)) res.set('Cache-Control', 'public, max-age=604800');
    else if (/\.html$/.test(ruta)) res.set('Cache-Control', 'no-cache');
  }
}));

app.use('/api/admin', adminRouter);
app.use('/api/games', gamesRouter);
app.use('/api/registros', registrosRoutes);
app.use('/api/reto', retoRoutes);
app.use('/api/valoraciones', valoracionesRoutes);
app.use('/api/metricas', metricasRoutes);
app.use('/api/siglas', siglasRouter);
app.use('/api/quienesquien', quienEsQuienRouter);
app.use('/api/trayectoria', trayectoriaRoutes);
app.use('/api/rasgos', rasgosRouter);
app.use('/api/rankings', rankingsRouter);
app.use('/api/aproximacion', aproximacionRouter);
app.use('/api/ubicacion', ubicacionRouter);
app.use('/api/adivina', adivinaRouter);
app.use('/api/pistas', pistasRouter);
app.use('/api/velocidad', velocidadRouter);
app.use('/api/quienmas', quienMasRouter);
app.use('/api/confianzaciega', confianzaCiegaRouter);
app.use('/api/frasescelebres', frasesCelebresRouter);
app.use('/api/conecta', conectaRouter);
app.use('/api/impostor', impostorRouter);
app.use('/api/colores', coloresRouter);
app.use('/api/lobos', lobosRouter);
app.use('/api/buscaminas', buscaminasRouter);
app.use('/api/popular', popularRouter);
app.use('/api/masmenos', masmenosRouter);
app.use('/api/cancion', cancionRouter);
app.use('/api/ciegas', ciegasRouter);
app.use('/api/rapidfire', rapidfireRouter);
app.use('/api/traiciones', traicionesRouter);
app.use('/api/fundadores', fundadoresRouter);
app.use('/api/coleccion', coleccionRouter);
app.use('/api/sumacero', sumaceroRouter);
app.use('/api/golpe', golpeRouter);
app.use('/api/unoadiez', unoadiezRouter);
app.use('/api/telepatia', telepatiaRouter);
app.use('/api/descarte', descarteRouter);
app.use('/api/bingoball', bingoballRoutes);
app.use('/api/cuentas', cuentasRoutes);
app.use('/api/mus', musRoutes);
app.use('/api/reinos', reinosRoutes);
app.use('/api/invento', inventoRoutes);
app.use('/api/director', directorRoutes);
app.use('/api/minotauro', minotauroRoutes);
app.use('/api/constructores', constructoresRoutes);
app.use('/api/hemeroteca', hemerotecaRoutes);
app.use('/api/acta', actaRoutes);
app.use('/api/oncefantasma', oncefantasmaRoutes);
app.use('/api/unapieza', unapiezaRoutes);
app.use('/api/datosobra', datosobraRoutes);
app.use('/api/pareja', parejaRoutes);
app.use('/api/tablero', tableroRoutes);
app.use('/api/musavanzado', musavanzadoRoutes);
app.use('/api/conoce', conoceRoutes);
app.use('/api/logos', logosRoutes);
app.use('/api/hipotesis', hipotesisRoutes);
app.use('/api/trescientosuno', trescientosunoRoutes);
app.use('/api/jugadores', jugadoresRoutes);
app.use('/api/furbo', furboRoutes);
app.use('/api/futbolgrid', futbolgridRoutes);
app.use('/api/jugadas', jugadasRoutes);
app.use('/api/cuatroclubes', cuatroclubesRoutes);
app.use('/api/geoquiz', geoquizRoutes);
app.use('/api/fichajes', fichajesRoutes);
app.use('/api/solo', soloRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/cuatrocuatros', cuatrocuatrosRoutes);
app.use('/api/garabato', garabatoRoutes);
app.use('/api/torre', torreRoutes);
app.use('/api/minigolf', minigolfRoutes);
app.use('/api/canicas', canicasRoutes);
app.use('/api/habilidad', habilidadRoutes);
app.use('/api/dragon', dragonRoutes);
app.use('/api/subasta', subastaRoutes);
app.use('/api/patata', patataRoutes);
app.use('/api/piramides', piramidesRoutes);
app.use('/api/transmision', transmisionRoutes);
app.use('/api/lapiz', lapizRoutes);
app.use('/api/intruso', intrusoRoutes);
app.use('/api/ponorden', ponordenRoutes);
app.use('/api/escondite', esconditeRoutes);

// 5. Redirección para React Router (Single Page Application)
app.get('*', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
});
