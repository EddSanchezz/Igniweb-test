// Ruta: historial de precios
// - Intenta leer desde DB
// - Si no hay datos o hay error, usa memoria como respaldo
import { Router } from 'express';
import { getHistory } from '../db.js';
import { queryHistoryMem } from '../memoryStore.js';

const router = Router();

// GET /api/history?symbol=BTC&start=2024-01-01T00:00:00Z&end=2025-12-31T23:59:59Z
router.get('/', async (req, res) => {
  const symbol = (req.query.symbol || '').toString().toUpperCase();
  const start = (req.query.start || '').toString();
  const end = (req.query.end || '').toString();
  if (!symbol || !start || !end) return res.status(400).json({ error: 'symbol, start, end are required' });
  try {
    const rows = await getHistory(symbol, start, end);
    if (rows && rows.length) return res.json(rows);
    // Si la DB no tiene datos, usar respaldo en memoria
    const mem = queryHistoryMem(symbol, start, end);
    return res.json(mem);
  } catch (err) {
    // Error en DB: usar respaldo en memoria
    try {
      const mem = queryHistoryMem(symbol, start, end);
      return res.json(mem);
    } catch (e) {
      return res.json([]);
    }
  }
});

export default router;
