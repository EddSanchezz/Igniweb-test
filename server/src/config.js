// Configuración centralizada de la aplicación
// - Lee variables de entorno con valores por defecto para desarrollo
export const config = {
  port: Number(process.env.PORT || 3001),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  cmcApiKey: process.env.CMC_API_KEY,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crypto_investment'
  },
  cacheTtlMs: 60_000,
  dbDisabled: String(process.env.DB_DISABLED || '').toLowerCase() === 'true'
};
