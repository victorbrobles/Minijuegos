// server/index.js

import express from 'express';
import cors from 'cors';
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
import laberintoRoutes from './routes/laberinto.js';
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
import footballsplitRoutes from './routes/footballsplit.js';
import jugadasRoutes from './routes/jugadas.js';
import cuatroclubesRoutes from './routes/cuatroclubes.js';
import geoquizRoutes from './routes/geoquiz.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Detrás de un proxy/túnel (ngrok, Render, Railway, Nginx...) la IP real del visitante llega en
// X-Forwarded-For. Sin esto todos compartirían la IP del proxy y el límite de intentos del login de
// administrador bloquearía a todo el mundo a la vez. TRUST_PROXY=<nº de proxies> lo ajusta (0 = desactivar).
const trustProxy = process.env.TRUST_PROXY;
app.set('trust proxy', trustProxy === undefined ? 1 : Number.isNaN(Number(trustProxy)) ? trustProxy : Number(trustProxy));

app.use(cors());
app.use(express.json());

// 2. Permitir peticiones OPTIONS (CORS preflight) antes de autenticar
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  next();
});

// 3. Autenticación tolerante con ngrok y proxys
const USUARIO = process.env.AUTH_USER || 'admin';
const PASSWORD = process.env.AUTH_PASSWORD || 'miniJuegos123'; // Evita el '#' si da problemas en el túnel

app.use(basicAuth({
  authorizer: (username, password) => {
    const userMatches = basicAuth.safeCompare(username, USUARIO);
    const passwordMatches = basicAuth.safeCompare(password, PASSWORD);
    return userMatches && passwordMatches;
  },
  challenge: true,
  realm: 'Acceso privado'
}));

// 3. Servir frontend compilado
app.use(express.static(path.join(__dirname, '../client/dist')));

app.use('/api/admin', adminRouter);
app.use('/api/games', gamesRouter);
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
app.use('/api/laberinto', laberintoRoutes);
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
app.use('/api/footballsplit', footballsplitRoutes);
app.use('/api/jugadas', jugadasRoutes);
app.use('/api/cuatroclubes', cuatroclubesRoutes);
app.use('/api/geoquiz', geoquizRoutes);

// 5. Redirección para React Router (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
});
