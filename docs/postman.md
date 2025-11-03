# Pruebas con Postman (API CoinMarketCap y Backend)

## CoinMarketCap

Configura una colección con variable de entorno `CMC_API_KEY`.

Headers comunes:

- `X-CMC_PRO_API_KEY: {{CMC_API_KEY}}`
- `Accept: application/json`

Requests útiles:

- GET https://pro-api.coinmarketcap.com/v1/cryptocurrency/map
- GET https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC,ETH&convert=USD

## Backend local (http://localhost:3001)

- GET /api/health
- GET /api/coins?search=btc
- GET /api/watchlist
- POST /api/watchlist { "symbol": "BTC" }
- DELETE /api/watchlist/BTC
- GET /api/prices?symbols=BTC,ETH
- GET /api/history?symbol=BTC&start=2025-11-01T00:00:00Z&end=2025-11-02T00:00:00Z
