# Pruebas manuales

Este documento describe cómo validar los criterios solicitados:

- Adaptabilidad en diferentes resoluciones y presentación del front end
- Actualización dinámica de datos según necesidad del cliente
- Trabajo en tiempo real con monedas

## 1) Adaptabilidad (responsive)

Preparación

- Inicia el frontend (Vite) y el backend (API). Puedes usar `npm run dev` en la raíz.

Pasos

1. Abre la app en el navegador (http://localhost:5173 por defecto de Vite).
2. Cambia el ancho de la ventana:
   - ≥ 900px: verifica que el layout tenga dos columnas (izquierda: buscador + lista; derecha: gráfica).
   - < 900px: verifica que el layout cambie a una sola columna (la gráfica queda debajo del watchlist).
3. Prueba en inspector (DevTools) los presets de móvil/tablet (iPhone, iPad, etc.).

Resultado esperado

- El contenido se adapta sin solaparse ni generar scroll horizontal.
- La tipografía y los paneles conservan legibilidad.

## 2) Actualización dinámica de datos

Preparación

- Agrega al menos 2 monedas al watchlist (p. ej., BTC y ETH).

Pasos

1. Observa las tarjetas del watchlist.
2. Verifica que los precios y cambios 24h se actualicen cada ~2 segundos (polling de respaldo).
3. Quita y vuelve a agregar una moneda para confirmar que la lista se refresca inmediatamente.

Resultado esperado

- Las tarjetas cambian valores sin recargar la página.
- Al agregar o quitar, la UI se actualiza de inmediato.

## 3) Trabajo en tiempo real (SSE)

Preparación

- Selecciona una moneda del watchlist para mostrar su gráfica.

Pasos

1. Observa la gráfica durante ~30–60 segundos.
2. Deberías ver que se añaden puntos nuevos en tiempo real (SSE). Si el SSE es bloqueado, el polling de respaldo cada 2 s mantiene la gráfica en movimiento.
3. Cambia el rango (24H, 7D, 30D) y valida que el histórico se recarga y la escala del eje Y se ajusta automáticamente.

Resultado esperado

- Nuevos puntos aparecen sin interacción del usuario.
- El rango afecta la ventana temporal mostrada en la gráfica.

## Notas

- En modo sin DB, el histórico usa un respaldo en memoria (se conserva aprox. 48 horas en RAM). Con DB configurada, la gráfica de 7D/30D mostrará historial persistente.
- El servidor aplica cache para evitar exceder límites de la API de CoinMarketCap.
