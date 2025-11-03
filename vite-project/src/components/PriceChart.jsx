// Componente de gráfico de precios
// - Carga histórico desde el backend (si hay datos persistidos)
// - Escucha actualizaciones en tiempo real vía SSE
// - Hace polling de respaldo cada 2s en caso de bloqueo del SSE
import { useEffect, useMemo, useRef, useState } from 'react';
import { getHistory, getPrices } from '../api/client';
import { streamPrices } from '../api/stream';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const ranges = [
  { key: '24h', label: '24H', ms: 24 * 60 * 60 * 1000 },
  { key: '7d', label: '7D', ms: 7 * 24 * 60 * 60 * 1000 },
  { key: '30d', label: '30D', ms: 30 * 24 * 60 * 60 * 1000 },
];

export default function PriceChart({ symbol }) {
  const [range, setRange] = useState('7d');
  // serverRows: lo que viene de la API /api/history
  const [serverRows, setServerRows] = useState([]);
  // sessionRows: puntos locales recolectados mientras el usuario está en la página
  const [sessionRows, setSessionRows] = useState([]);
  const poller = useRef();
  const sseRef = useRef();

  // Reset local series when symbol changes
  useEffect(() => {
    setServerRows([]);
    setSessionRows([]);
  }, [symbol]);

  useEffect(() => {
    const load = async () => {
      if (!symbol) return;
      const now = Date.now();
      const r = ranges.find(r => r.key === range) || ranges[1];
      const start = new Date(now - r.ms).toISOString();
      const end = new Date(now).toISOString();
      try {
        const data = await getHistory(symbol, start, end);
        setServerRows(Array.isArray(data) ? data : []);
        if (!data?.length) {
          // Bootstrap a first point so user sees the line immediately
          const quotes = await getPrices([symbol]);
          const q = quotes[symbol];
          if (q) setSessionRows(prev => [...prev, { ts: Date.now(), price_usd: q.price }]);
        }
      } catch (e) { console.error(e); }
    };
    load();

    // Prefer SSE for near-real-time; fallback to polling if SSE errors
  try { sseRef.current?.close?.(); } catch { /* ignorar */ }
    sseRef.current = streamPrices([symbol], (msg) => {
      if (msg?.type === 'quotes' && msg.data?.[symbol]) {
        const q = msg.data[symbol];
        setSessionRows(prev => [...prev, { ts: q.ts || Date.now(), price_usd: q.price }].slice(-1440));
      }
    });

    // Secondary polling fallback (keeps working if SSE is blocked)
    clearInterval(poller.current);
    poller.current = setInterval(async () => {
      if (!symbol) return;
      const quotes = await getPrices([symbol]);
      const q = quotes[symbol];
      if (q) setSessionRows(prev => [...prev, { ts: Date.now(), price_usd: q.price }].slice(-1440));
    }, 2_000);

  return () => { clearInterval(poller.current); try { sseRef.current?.close?.(); } catch { /* ignorar */ } };
  }, [symbol, range]);

  const chartData = useMemo(() => {
    const now = Date.now();
    const r = ranges.find(r => r.key === range) || ranges[1];
    // Preferir histórico del servidor si existe, de lo contrario usar la serie local
    const base = (serverRows && serverRows.length)
      ? serverRows
      : sessionRows.filter(p => (now - p.ts) <= r.ms);
    return base.map(r => ({
      ts: new Date(r.ts).toLocaleString(),
      price: Number(r.price_usd ?? r.price ?? 0),
    }));
  }, [serverRows, sessionRows, range]);

  if (!symbol) return <div className="hint">Selecciona una moneda para ver su gráfico.</div>;

  return (
    <div className="chart">
      <div className="chart-toolbar">
        {ranges.map(r => (
          <button key={r.key} className={range === r.key ? 'active' : ''} onClick={() => setRange(r.key)}>{r.label}</button>
        ))}
      </div>
      {/* Contenedor cuadrado (ancho = alto) */}
      <div className="chart-square">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="price" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ts" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis
              tickFormatter={(v) => `$${v.toLocaleString()}`}
              width={70}
              domain={[
                (dataMin) => Math.floor(Number(dataMin) * 0.995),
                (dataMax) => Math.ceil(Number(dataMax) * 1.005)
              ]}
              allowDecimals
              allowDataOverflow
            />
            <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
            <Area type="monotone" dataKey="price" stroke="#3b82f6" fill="url(#price)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
