// Punto de entrada del servidor Express
// - Expone rutas REST (/coins, /prices, /history, /watchlist)
// - Expone SSE (/stream/prices) para actualizaciones en tiempo real
// - Inicializa DB si está disponible y ejecuta un job para recolectar precios periódicamente
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { initDb } from './db.js';
import coinsRouter from './routes/coins.js';
import pricesRouter from './routes/prices.js';
import historyRouter from './routes/history.js';
import watchlistRouter from './routes/watchlist.js';
import streamRouter from './routes/stream.js';
import { startQuotesJob } from './jobs/fetchQuotes.js';

const app = express();
// CORS permisivo en desarrollo para permitir cualquier puerto de Vite
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'dev' });
});

app.use('/api/coins', coinsRouter);
app.use('/api/prices', pricesRouter);
app.use('/api/history', historyRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/stream', streamRouter);

const start = async () => {
  try {
    try {
      await initDb();
      console.log('Base de datos inicializada');
    } catch (dbErr) {
      console.warn('Inicio de DB falló o está deshabilitado, continuando sin DB:', dbErr.message);
    }
    const server = app.listen(config.port, () => {
      console.log(`Servidor API escuchando en http://localhost:${config.port}`);
    });
    startQuotesJob();
    process.on('SIGTERM', () => server.close());
    process.on('SIGINT', () => server.close());
  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
};

start();
