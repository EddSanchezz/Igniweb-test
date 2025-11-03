// Tarjeta de moneda individual
// - Muestra símbolo, nombre, precio, cambio 24h y volumen
// - Al hacer click, selecciona la moneda para el gráfico
// - Botón "Quitar" elimina del watchlist (sin propagar el click a la selección)
export default function CoinCard({ data = {}, onRemove, onSelect }) {
  const symbol = data.symbol || '—';
  const name = data.name || symbol;
  const price = typeof data.price === 'number' ? data.price : null;
  const chg = typeof data.percent_change_24h === 'number' ? data.percent_change_24h : null;
  const vol = typeof data.volume_24h === 'number' ? data.volume_24h : null;

  const changeClass = chg == null ? '' : chg >= 0 ? 'change pos' : 'change neg';

  return (
    <div className="coin-card" onClick={() => onSelect?.(symbol)} role="button">
      <div className="coin-header">
        <strong>{symbol}</strong>
        <span className="name">{name}</span>
      </div>
      <div className="price">{price != null ? `$${price.toLocaleString()}` : '—'}</div>
      <div className="meta">
        <span className={changeClass}>{chg != null ? `${chg.toFixed(2)}%` : '—'}</span>
        <span className="volume">Vol 24h: {vol != null ? `$${Math.round(vol).toLocaleString()}` : '—'}</span>
      </div>
      <button className="remove" onClick={(e) => { e.stopPropagation(); onRemove?.(symbol); }}>Quitar</button>
    </div>
  );
}
