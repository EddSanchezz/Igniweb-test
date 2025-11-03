// Ruta: cotizaciones actuales
// - Devuelve mapa { SYMBOL: { price, percent_change_24h, volume_24h, ts, ... } }
// - Inserta punto de precio tanto en memoria como en DB (best-effort)
import { Router } from 'express';
import { getQuotesBySymbols } from '../cmcClient.js';
import { insertPricePoint, upsertCoin } from '../db.js';
import { pushPricePointMem } from '../memoryStore.js';

const router = Router();

// GET /api/prices?symbols=BTC,ETH
router.get('/', async (req, res) => {
  try {
    const symbols = (req.query.symbols || '').toString().split(',').map(s => s.trim()).filter(Boolean);
    if (!symbols.length) return res.json({});
    const quotes = await getQuotesBySymbols(symbols);
    // Ensure coins exist and store latest point (best-effort, ignore DB errors)
    await Promise.all(
      Object.values(quotes).map(async (q) => {
        try { await upsertCoin({ cmc_id: q.cmc_id || 0, symbol: q.symbol, name: q.name || q.symbol, slug: q.symbol.toLowerCase() }); } catch {}
        try { await insertPricePoint(q.symbol, q); } catch {}
        pushPricePointMem(q.symbol, q);
      })
    );
    res.json(quotes);
  } catch (err) {
    console.error(err);
    res.json({});
  }
});

export default router;
