# CryptoInvestment – Análisis de Requisitos (RF/RNF) y Modelo de Datos

## Resumen

Aplicación SPA para monitorear un portafolio de criptomonedas con: selección de activos, precios y variaciones en tiempo casi real, volumen, persistencia histórica y consulta por rangos de fechas; accesible desde distintos dispositivos.

## Requisitos Funcionales (RF)

- RF1. Búsqueda y selección de criptomonedas por nombre o símbolo.
- RF2. Gestión de una lista de seguimiento (watchlist): agregar y eliminar símbolos.
- RF3. Visualización de datos actuales por activo: precio USD, % cambio 24h, volumen 24h, market cap.
- RF4. Actualización automática de datos sin recargar la página (polling ~60s).
- RF5. Persistencia de historial de precios en BD para consulta posterior.
- RF6. Consulta de historial por rango de fechas y visualización en gráficos.
- RF7. Interfaz responsiva (móvil, tablet, desktop).
- RF8. API backend propia que oculte la API key de CoinMarketCap.

## Requisitos No Funcionales (RNF)

- RNF1. SPA con React (Vite) para tiempos de carga rápidos.
- RNF2. Backend Node.js (Express) como proxy + persistencia MySQL.
- RNF3. Seguridad: no exponer la API key en el frontend; usar variables de entorno.
- RNF4. Escalabilidad ligera: cache en memoria y polling con límite de tasa (>=60s).
- RNF5. Observabilidad básica: endpoint de health-check.
- RNF6. Mantenibilidad: separación por capas (rutas, cliente CMC, DB, jobs).
- RNF7. Portabilidad: configuración mediante .env; Dockerizable a futuro.

## Estructura de Datos (entidades principales)

- Coin: { id, cmc_id, symbol, name, slug }
- Watchlist: { id, coin_id, added_at }
- PriceHistory: { id, coin_id, ts, price_usd, volume_24h, percent_change_24h, market_cap }

## Casos de uso clave

1. Usuario busca “BTC” y lo agrega a su watchlist.
2. La app muestra tarjetas con precio/variación/volumen y se actualiza cada 60s.
3. Usuario abre el gráfico de BTC y consulta últimos 7 días o un rango personalizado.
4. El backend persiste puntos de datos periódicos para construir el histórico.

## Consideraciones de API (CoinMarketCap)

- Búsqueda: `v1/cryptocurrency/map` (filtrado local por nombre/símbolo).
- Cotizaciones: `v1/cryptocurrency/quotes/latest` (param: symbol, convert=USD).
- Límite/gratuidad: cache 60s y batch por símbolos para ahorrar llamadas.

## Estrategia de actualización y persistencia

- Job cada 60s: toma watchlist, obtiene cotizaciones en lote y guarda en MySQL.
- Consulta de histórico: se sirve desde BD propia (no depende de histórico de CMC free).

## Criterios de aceptación

- SPA responsiva y sin recargas de página.
- Watchlist funcional con precios actualizados cada ~60s.
- Gráfico de líneas con zoom o presets de rango.
- API key segura, sin exponerla en el cliente.
