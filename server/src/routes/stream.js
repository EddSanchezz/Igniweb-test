// Ruta SSE para transmitir precios en tiempo real
// - Envia frames con tipo 'quotes' y datos de símbolos solicitados
// - Guarda puntos en DB y memoria (best-effort)
import { Router } from 'express';
import { getQuotesBySymbols } from '../cmcClient.js';
import { insertPricePoint, upsertCoin } from '../db.js';
import { pushPricePointMem } from '../memoryStore.js';

const router = Router();

// GET /api/stream/prices?symbols=BTC,ETH
router.get('/prices', async (req, res) => {
  const symbols = (req.query.symbols || '').toString().split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  if (!symbols.length) {
    res.status(400).end('symbols required');
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // Permitir a proxies CORS mantener la conexión
  res.flushHeaders?.();

  let alive = true;
  const send = (obj) => {
    if (!alive) return;
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
  };

  const tick = async () => {
    try {
      const quotes = await getQuotesBySymbols(symbols);
      for (const q of Object.values(quotes)) {
        try { await upsertCoin({ cmc_id: q.cmc_id || 0, symbol: q.symbol, name: q.name || q.symbol, slug: q.symbol.toLowerCase() }); } catch {}
        try { await insertPricePoint(q.symbol, q); } catch {}
        pushPricePointMem(q.symbol, q);
      }
      send({ type: 'quotes', data: quotes, ts: Date.now() });
    } catch (e) {
      send({ type: 'error', message: e.message || 'tick error' });
    }
  };

  // Primer envío inmediato y luego cada 10s
  await tick();
  const interval = setInterval(tick, 10_000);

  req.on('close', () => {
    alive = false;
    clearInterval(interval);
    res.end();
  });
});

export default router;
