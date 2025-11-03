// Rutas de Watchlist (lista de seguimiento)
// - GET devuelve símbolos guardados
// - POST agrega símbolo (usa memoria si no hay DB)
// - DELETE elimina símbolo
import { Router } from 'express';
import { addToWatchlistBySymbol, getWatchlistSymbols, removeFromWatchlistBySymbol, upsertCoin } from '../db.js';
import { searchCoins } from '../cmcClient.js';

// Respaldo en memoria cuando la DB no está disponible
const memoryWatchlist = new Set();

const router = Router();

// GET /api/watchlist
router.get('/', async (_req, res) => {
  try {
    const symbols = await getWatchlistSymbols();
    res.json({ symbols });
  } catch (err) {
    // Fallback to memory
    res.json({ symbols: Array.from(memoryWatchlist.values()) });
  }
});

// POST /api/watchlist { symbol: "BTC" }
router.post('/', async (req, res) => {
  try {
    const symbol = (req.body?.symbol || '').toString().toUpperCase();
    if (!symbol) return res.status(400).json({ error: 'symbol required' });

    // Asegurar que la moneda exista localmente; buscar si falta
    const found = await searchCoins(symbol);
    const coin = found.find((c) => c.symbol === symbol) || found[0];
    try { if (coin) await upsertCoin(coin); } catch {}
    try { await addToWatchlistBySymbol(symbol); } catch { memoryWatchlist.add(symbol); }
    res.status(201).json({ ok: true });
  } catch (err) {
    // Respaldo a memoria en caso de error
    const symbol = (req.body?.symbol || '').toString().toUpperCase();
    if (symbol) memoryWatchlist.add(symbol);
    res.status(201).json({ ok: true });
  }
});

// DELETE /api/watchlist/:symbol
router.delete('/:symbol', async (req, res) => {
  try {
    const symbol = (req.params.symbol || '').toString().toUpperCase();
    try { await removeFromWatchlistBySymbol(symbol); } catch { memoryWatchlist.delete(symbol); }
    res.json({ ok: true });
  } catch (err) {
    // Respaldo a memoria en caso de error
    const symbol = (req.params.symbol || '').toString().toUpperCase();
    memoryWatchlist.delete(symbol);
    res.json({ ok: true });
  }
});

export default router;
