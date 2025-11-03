// Cache en memoria con TTL simple para evitar llamadas repetidas a CMC
const cache = new Map();

// Guarda un valor en cache con tiempo de expiración (ms)
export function setCache(key, value, ttlMs) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

// Obtiene un valor de cache si no ha expirado
export function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}
