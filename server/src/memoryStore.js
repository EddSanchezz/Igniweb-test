// Almacén simple de series de tiempo en memoria (modo desarrollo / sin DB)
// - Conserva ~48 horas de puntos por símbolo

const store = new Map(); // symbol -> [{ ts, price_usd, volume_24h, percent_change_24h, market_cap }]
const MAX_POINTS = 2880; // 48h if 1 point per minute
const MAX_AGE_MS = 1000 * 60 * 60 * 48;

// Inserta un punto de precio en memoria con poda por edad/tamaño
export function pushPricePointMem(symbol, point) {
  if (!symbol || !point?.ts) return;
  const arr = store.get(symbol) || [];
  arr.push({
    ts: point.ts,
    price_usd: point.price,
    volume_24h: point.volume_24h,
    percent_change_24h: point.percent_change_24h,
    market_cap: point.market_cap
  });
  // prune by age and size
  const cutoff = Date.now() - MAX_AGE_MS;
  while (arr.length && arr[0].ts < cutoff) arr.shift();
  if (arr.length > MAX_POINTS) arr.splice(0, arr.length - MAX_POINTS);
  store.set(symbol, arr);
}

// Consulta una ventana temporal en memoria
export function queryHistoryMem(symbol, startIso, endIso) {
  const arr = store.get(symbol) || [];
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return arr.filter(p => p.ts >= start && p.ts <= end).map(p => ({ ...p }));
}
