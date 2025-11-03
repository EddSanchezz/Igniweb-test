// Cliente HTTP para la API del backend
// Proporciona funciones de alto nivel para el frontend (buscar, watchlist, precios, historial)
import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_BASE || 'http://localhost:3001') + '/api';
export const api = axios.create({ baseURL, timeout: 10000 });

// Buscar monedas por nombre/símbolo (devuelve una lista breve)
export async function searchCoins(query) {
  const { data } = await api.get('/coins', { params: { search: query } });
  return data;
}

// Obtener símbolos guardados en el watchlist
export async function getWatchlist() {
  const { data } = await api.get('/watchlist');
  return data.symbols || [];
}

// Agregar símbolo al watchlist
export async function addToWatchlist(symbol) {
  await api.post('/watchlist', { symbol });
}

// Eliminar símbolo del watchlist
export async function removeFromWatchlist(symbol) {
  await api.delete(`/watchlist/${encodeURIComponent(symbol)}`);
}

// Obtener cotizaciones actuales para una lista de símbolos
export async function getPrices(symbols) {
  if (!symbols?.length) return {};
  const { data } = await api.get('/prices', { params: { symbols: symbols.join(',') } });
  return data;
}

// Obtener historial de precios de un símbolo entre fechas ISO
export async function getHistory(symbol, start, end) {
  const { data } = await api.get('/history', { params: { symbol, start, end } });
  return data;
}
