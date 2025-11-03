// Cliente de CoinMarketCap
// - searchCoins: busca monedas (usa /map cuando es posible, con lista de respaldo)
// - getQuotesBySymbols: obtiene cotizaciones actuales en USD
import axios from 'axios';
import { config } from './config.js';
import { getCache, setCache } from './cache.js';

const CMC_BASE = 'https://pro-api.coinmarketcap.com/v1';

const client = axios.create({
  baseURL: CMC_BASE,
  timeout: 10_000,
  headers: { 'X-CMC_PRO_API_KEY': config.cmcApiKey }
});

const FALLBACK_COINS = [
  { cmc_id: 1, symbol: 'BTC', name: 'Bitcoin', slug: 'bitcoin' },
  { cmc_id: 1027, symbol: 'ETH', name: 'Ethereum', slug: 'ethereum' },
  { cmc_id: 1839, symbol: 'BNB', name: 'BNB', slug: 'bnb' },
  { cmc_id: 5426, symbol: 'SOL', name: 'Solana', slug: 'solana' },
  { cmc_id: 52, symbol: 'XRP', name: 'XRP', slug: 'xrp' },
  { cmc_id: 2010, symbol: 'ADA', name: 'Cardano', slug: 'cardano' },
  { cmc_id: 74, symbol: 'DOGE', name: 'Dogecoin', slug: 'dogecoin' },
  { cmc_id: 6636, symbol: 'DOT', name: 'Polkadot', slug: 'polkadot' },
  { cmc_id: 1975, symbol: 'LINK', name: 'Chainlink', slug: 'chainlink' },
  { cmc_id: 5805, symbol: 'AVAX', name: 'Avalanche', slug: 'avalanche' },
  { cmc_id: 3717, symbol: 'WBTC', name: 'Wrapped Bitcoin', slug: 'wrapped-bitcoin' },
  { cmc_id: 3890, symbol: 'MATIC', name: 'Polygon', slug: 'polygon' }
];

export async function searchCoins(query) {
  const key = `search:${query}`;
  const cached = getCache(key);
  if (cached) return cached;

  let filtered = [];
  try {
    const { data } = await client.get('/cryptocurrency/map', {
      params: { listing_status: 'active', aux: 'slug', sort: 'cmc_rank' }
    });
    const items = data.data || [];
    const q = (query || '').toLowerCase();
    filtered = items
      .filter((c) => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
      .slice(0, 20)
      .map((c) => ({ cmc_id: c.id, symbol: c.symbol, name: c.name, slug: c.slug }));
  } catch (e) {
    // Respaldo a lista estática si el plan/clave no permite /map
    const q = (query || '').toLowerCase();
    filtered = FALLBACK_COINS.filter((c) =>
      c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }

  setCache(key, filtered, config.cacheTtlMs);
  return filtered;
}

export async function getQuotesBySymbols(symbols = []) {
  if (!symbols.length) return {};
  const key = `quotes:${symbols.sort().join(',')}`;
  const cached = getCache(key);
  if (cached) return cached;

  const { data } = await client.get('/cryptocurrency/quotes/latest', {
    params: { symbol: symbols.join(','), convert: 'USD' }
  });
  const out = {};
  for (const [symbol, arr] of Object.entries(data.data || {})) {
    const c = Array.isArray(arr) ? arr[0] : arr; // proteger contra forma en array
    const q = c.quote?.USD || {};
    out[symbol] = {
      symbol,
      name: c.name,
      price: q.price,
      volume_24h: q.volume_24h,
      percent_change_24h: q.percent_change_24h,
      market_cap: q.market_cap,
      ts: Date.parse(c.last_updated)
    };
  }
  setCache(key, out, config.cacheTtlMs);
  return out;
}
