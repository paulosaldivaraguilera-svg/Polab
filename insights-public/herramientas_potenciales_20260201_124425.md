# Herramientas Potenciales para Foundry

## Basado en: Trading en Polymarket con OpenClaw

### Prioridad ALTA (Ingresos directos)

1. **polymarket_api.py**
   - Función: Consultar mercados, precios, posiciones
   - APIs: gamma-api.polymarket.com, clob.polymarket.com
   - WebSocket: ws-subscriptions-clob
   - Prioridad: CRÍTICA

2. **trading_executor.py**
   - Función: Colocar/cancelar órdenes con firma EIP-712
   - Input: JSON con parámetros de orden
   - Output: Order ID o error
   - Prioridad: CRÍTICA

3. **arbitrage_scanner.py**
   - Función: Buscar ineficiencias entre mercados
   - Fuentes: Polymarket, Kalshi, Binance
   - Output: Oportunidades ranked por ROI
   - Prioridad: ALTA

### Prioridad MEDIA (Optimización)

4. **latency_monitor.py**
   - Función: Medir RTT hacia endpoints
   - Output: Latencia en ms por endpoint
   - Uso: Decidir cuándo operar

5. **portfolio_manager.py**
   - Función: Calcular exposición, P&L
   - APIs: data-api.polymarket.com
   - Output: Dashboard de posiciones

6. **news_sentiment.py**
   - Función: Analizar noticias para trading
   - Fuentes: RSS, Twitter, Telegram
   - Output: Score de sentimiento (-1 a 1)

### Prioridad BAJA (Mejora continua)

7. **performance_analyzer.py**
   - Función: Analizar métricas de ejecución
   - Output: Recomendaciones de mejora

8. **tax_calculator.py**
   - Función: Calcular obligaciones tributarias (SII)
   - Input: Historial de trades
   - Output: Reporte para Operación Renta

## Métricas de Éxito para Herramientas
- Latencia de respuesta < 100ms
- Uptime > 99.5%
- Tasa de éxito > 95%
