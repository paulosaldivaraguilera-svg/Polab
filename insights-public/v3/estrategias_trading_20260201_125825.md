# Estrategias de Trading - Polymarket

## Estrategia 1: Arbitraje de Pánico (Risk-Free)

### Concepto
Cuando $P(SÍ) + P(NO) < 1.00$, comprar ambos lados y locked profit.

### Condición
```
Costo_Total = Ask_SÍ + Ask_NO
Si Costo_Total < (1.00 - Comisiones):
    → EJECUTAR ARBITRAJE
```

### Requisitos
- Velocidad de ejecución (milisegundos)
- Liquidez suficiente en el order book
- Capital para ambas piernas simultáneas

### Riesgo
- Baja frecuencia de oportunidades
- Necesita conexión de baja latencia

---

## Estrategia 2: Reversión a la Media (Mean Reversion)

### Indicadores
1. **Bandas de Bollinger**
   - SMA 20 períodos
   - Bandas a ±2 desviaciones estándar
   
2. **RSI (14)**
   - Umbral sobreventa: < 30
   - Umbral sobrecompra: > 70

### Señales de Entrada

| Condición | Acción | Confirmación |
|-----------|--------|--------------|
| Precio < BB_Lower | BUY | RSI < 30 |
| Precio > BB_Upper | SELL | RSI > 70 |

### Salida
- Precio cruza SMA 20
- Stop loss activado
- take profit (target return)

---

## Estrategia 3: Mention Trading (Sentiment)

### Fuentes
- Twitter/X trending topics
- News APIs (RSS)
- Polymarket volume spikes

### Activadores
Keywords + Volume surge = Signal
