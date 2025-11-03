// Aplicación principal (SPA)
// - Muestra buscador + lista de seguimiento (izquierda)
// - Muestra la gráfica del activo seleccionado (derecha)
import { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar.jsx';
import Watchlist from './components/Watchlist.jsx';
import PriceChart from './components/PriceChart.jsx';

function App() {
  // símbolo actualmente seleccionado para el gráfico
  const [selected, setSelected] = useState('');
  // contador para forzar recarga del watchlist al agregar una moneda
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="container">
      <header>
        <h1>CryptoInvestment</h1>
        <p className="subtitle">Seguimiento en tiempo real de tu portafolio</p>
      </header>

      {/* Layout de dos columnas en desktop: izquierda (buscador + lista), derecha (gráfica) */}
      <div className="layout">
        <div className="left">
          <SearchBar onAdded={(sym) => { setRefreshKey(k => k + 1); if (!selected) setSelected(sym); }} />
          <Watchlist onSelect={setSelected} refreshKey={refreshKey} />
        </div>
        <div className="right">
          <section>
            <h2>Gráfico: {selected || '—'}</h2>
            <PriceChart symbol={selected} />
          </section>
        </div>
      </div>
    </div>
  );
}

export default App
