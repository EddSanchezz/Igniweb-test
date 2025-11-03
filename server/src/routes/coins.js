// Ruta: búsqueda de monedas
// - Devuelve una lista corta de { cmc_id, symbol, name }
// - Intenta guardar/actualizar los metadatos en DB (best-effort)
import { Router } from 'express';
import { searchCoins } from '../cmcClient.js';
import { upsertCoin } from '../db.js';

const router = Router();

// GET /api/coins?search=btc
router.get('/', async (req, res) => {
  try {
    const q = (req.query.search || '').toString();
    const list = await searchCoins(q);
    // Persistencia best-effort: no falla aunque la DB no esté disponible
    await Promise.all(
      list.map(async (c) => {
        try { await upsertCoin(c); } catch { /* ignorar errores de DB */ }
      })
    );
    res.json(list);
  } catch (err) {
    console.error(err);
    // Devuelve lista vacía (no 500) para mantener la UI operativa
    res.json([]);
  }
});

export default router;
