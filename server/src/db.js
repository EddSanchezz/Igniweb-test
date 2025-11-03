// Utilidades de acceso a MySQL (DAO)
// - Maneja pool de conexiones y consultas helper
import mysql from 'mysql2/promise';
import { config } from './config.js';

let pool;

export const initDb = async () => {
  pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    connectionLimit: 10,
    timezone: 'Z'
  });
  // Simple sanity check
  await pool.query('SELECT 1');
  return pool;
};

export const getDb = () => {
  if (!pool) throw new Error('DB not initialized. Call initDb() first.');
  return pool;
};

// Consultas helper
export async function upsertCoin({ cmc_id, symbol, name, slug }) {
  const db = getDb();
  await db.execute(
    `INSERT INTO coins (cmc_id, symbol, name, slug)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug)`,
    [cmc_id, symbol, name, slug]
  );
}

export async function addToWatchlistBySymbol(symbol) {
  const db = getDb();
  const [rows] = await db.execute('SELECT id FROM coins WHERE symbol = ?', [symbol]);
  if (!rows.length) throw new Error('Coin not found for symbol: ' + symbol);
  const coinId = rows[0].id;
  await db.execute(
    `INSERT IGNORE INTO watchlist (coin_id) VALUES (?)`,
    [coinId]
  );
}

export async function removeFromWatchlistBySymbol(symbol) {
  const db = getDb();
  const [rows] = await db.execute('SELECT id FROM coins WHERE symbol = ?', [symbol]);
  if (!rows.length) return;
  const coinId = rows[0].id;
  await db.execute('DELETE FROM watchlist WHERE coin_id = ?', [coinId]);
}

export async function getWatchlistSymbols() {
  const db = getDb();
  const [rows] = await db.query(
    `SELECT c.symbol, c.name FROM watchlist w
     JOIN coins c ON c.id = w.coin_id
     ORDER BY c.symbol ASC`
  );
  return rows.map(r => r.symbol);
}

export async function insertPricePoint(symbol, data) {
  const db = getDb();
  const { price, volume_24h, percent_change_24h, market_cap, ts } = data;
  const [rows] = await db.execute('SELECT id FROM coins WHERE symbol = ?', [symbol]);
  if (!rows.length) return;
  const coinId = rows[0].id;
  await db.execute(
    `INSERT INTO price_history (coin_id, ts, price_usd, volume_24h, percent_change_24h, market_cap)
     VALUES (?, FROM_UNIXTIME(?), ?, ?, ?, ?)`,
    [coinId, Math.floor(ts / 1000), price, volume_24h, percent_change_24h, market_cap]
  );
}

export async function getHistory(symbol, startIso, endIso) {
  const db = getDb();
  const [coinRows] = await db.execute('SELECT id FROM coins WHERE symbol = ?', [symbol]);
  if (!coinRows.length) return [];
  const coinId = coinRows[0].id;
  const [rows] = await db.execute(
    `SELECT UNIX_TIMESTAMP(ts) * 1000 AS ts, price_usd, volume_24h, percent_change_24h, market_cap
     FROM price_history
     WHERE coin_id = ? AND ts BETWEEN ? AND ?
     ORDER BY ts ASC`,
    [coinId, new Date(startIso), new Date(endIso)]
  );
  return rows;
}
