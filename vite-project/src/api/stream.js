// Suscripción vía Server-Sent Events (SSE) a precios en tiempo real
// - symbols: array de símbolos a escuchar
// - onMessage: callback para cada frame recibido { type: 'quotes', data: { SYMBOL: { ... } } }
export function streamPrices(symbols, onMessage) {
  if (!symbols?.length) return { close() {} };
  const url = (import.meta.env.VITE_API_BASE || 'http://localhost:3001') + '/api/stream/prices?symbols=' + symbols.join(',');
  const es = new EventSource(url);
  es.onmessage = (ev) => {
    try {
      const payload = JSON.parse(ev.data);
      onMessage?.(payload);
    } catch {
      /* ignore malformed frames */
    }
  };
  es.onerror = () => {
    // el consumidor puede hacer fallback a "polling" cuando esto ocurre
  };
  return es;
}
