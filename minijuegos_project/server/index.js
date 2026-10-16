// server/index.js
import express from 'express';
import cors from 'cors';

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
import lobosRouter from './routes/lobos.js'; // Tu API de salas para los lobos

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Endpoints
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

app.listen(PORT, '0.0.0.0', () => console.log(`API lista en http://localhost:${PORT}`));