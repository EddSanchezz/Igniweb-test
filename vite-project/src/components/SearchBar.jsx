// Barra de búsqueda de criptomonedas
// - Autocompleta con resultados (hasta 8)
// - Permite agregar al watchlist y notifica al padre mediante onAdded
import { useEffect, useMemo, useState } from 'react';
import { searchCoins, addToWatchlist } from '../api/client';

export default function SearchBar({ onAdded }) {
  // término de búsqueda (controlado)
  const [q, setQ] = useState('');
  // resultados devueltos por la API
  const [results, setResults] = useState([]);
  // estado de carga para mostrar feedback
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // debounce de 300ms para evitar saturar la API
    const t = setTimeout(async () => {
      if (!q.trim()) { setResults([]); return; }
      setLoading(true);
      try {
        const data = await searchCoins(q.trim());
        setResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  // limitar a 8 resultados visibles
  const limited = useMemo(() => results.slice(0, 8), [results]);

  return (
    <div className="search">
      <input
        className="search-input"
        placeholder="Buscar por nombre o símbolo (p.ej., BTC)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {loading && <div className="hint">Buscando…</div>}
      {!!limited.length && (
        <ul className="results">
          {limited.map(r => (
            <li key={r.symbol}>
              <span>{r.symbol} · {r.name}</span>
              <button onClick={async () => {
                // agrega al watchlist y limpia la búsqueda
                await addToWatchlist(r.symbol);
                setQ('');
                setResults([]);
                onAdded?.(r.symbol);
              }}>Agregar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
