// Lista de seguimiento (Watchlist)
// - Carga símbolos guardados
// - Consulta precios periódicamente (cada 2s) para actualizaciones dinámicas
// - Permite eliminar y seleccionar una moneda
import { useEffect, useRef, useState } from 'react';
import { getWatchlist, getPrices, removeFromWatchlist } from '../api/client';
import CoinCard from './CoinCard';

export default function Watchlist({ onSelect, refreshKey }) {
  const [symbols, setSymbols] = useState([]); // símbolos en la lista
  const [data, setData] = useState({}); // mapa symbol -> quote
  const timer = useRef();

  const load = async () => {
    try {
      const s = await getWatchlist();
      setSymbols(s);
      if (s.length) {
        const quotes = await getPrices(s);
        setData(quotes);
      } else {
        setData({});
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
    // Refresco periódico de tarjetas cada 2s
    // (el backend implementa cache/batching para no exceder límites de API)
    timer.current = setInterval(load, 2_000);
    return () => clearInterval(timer.current);
  }, []);

  useEffect(() => {
    // recargar cuando el padre notifica (después de agregar)
    if (refreshKey !== undefined) load();
  }, [refreshKey]);

  const handleRemove = async (symbol) => {
    await removeFromWatchlist(symbol);
    await load();
  };

  return (
    <div className="watchlist">
      {!symbols.length && <div className="hint">Agrega monedas a tu lista para comenzar.</div>}
      {symbols.map((s) => (
        <CoinCard key={s} data={data[s]} onRemove={handleRemove} onSelect={onSelect} />
      ))}
    </div>
  );
}
