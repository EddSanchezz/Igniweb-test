// Job periódico para recolectar cotizaciones de símbolos en el watchlist
// - Inserta puntos en DB (si está disponible) y también en memoria
import { getWatchlistSymbols, insertPricePoint, upsertCoin } from '../db.js';
import { getQuotesBySymbols } from '../cmcClient.js';
import { pushPricePointMem } from '../memoryStore.js';

let timer;

export function startQuotesJob(intervalMs = 60_000) {
  if (timer) clearInterval(timer);
  timer = setInterval(async () => {
    try {
      const symbols = await getWatchlistSymbols();
      if (!symbols.length) return;
      const quotes = await getQuotesBySymbols(symbols);
      for (const q of Object.values(quotes)) {
        await upsertCoin({ cmc_id: q.cmc_id || 0, symbol: q.symbol, name: q.name || q.symbol, slug: q.symbol.toLowerCase() });
        try { await insertPricePoint(q.symbol, q); } catch {}
        pushPricePointMem(q.symbol, q);
      }
    } catch (e) {
      console.error('Error del job de cotizaciones:', e.message);
    }
  }, intervalMs);
}
