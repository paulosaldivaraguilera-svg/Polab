# Arquitectura de Trading Algorítmico - Polymarket

## Componentes del Sistema

### 1. Capa de Datos (Data Layer)
- **Polymarket CLOB**: Central Limit Order Book
- **WebSocket**: Conexión en tiempo real para precios
- **py-clob-client**: Librería oficial de integración

### 2. Capa de Análisis (Analysis Layer)
- **Bandas de Bollinger (BB)**: SMA 20, ±2σ
- **RSI (14)**: Confirmación de sobrecompra/sobreventa
- **Mean Reversion**: Comprar bajo BB_lower + RSI < 30

### 3. Capa de Ejecución (Execution Layer)
- **Autenticación L2**: API Keys para velocidad
- **Systemd**: Servicio persistente 24/7
- **Kill Switch**: Detención automática por riesgos

### 4. Capa de Gestión (Management Layer)
- **Kelly Criterion**: Dimensionamiento de posiciones
- **Paper Trading**: Simulación antes de capital real
- **OpenClaw Skill**: Orquestación conversacional

## Flujo de Operación

```
WebSocket → Parser → BB+RSI Analysis → Kelly Sizing → Order Execution
                                                        ↓
                                              Kill Switch (risks)
                                                        ↓
                                              Log & Notify (OpenClaw)
```

## Métricas Objetivo

| Métrica | Target | Notas |
|---------|--------|-------|
| Latencia | < 200ms | Chile → US East |
| Drawdown Max | 15% | Kill switch |
| Kelly Fraccional | 0.25x | Conservador |
| Paper Period | 2 semanas | Validación |

## Diferencias vs Trading Tradicional

| Aspecto | Forex/Crypto | Polymarket |
|---------|--------------|------------|
| Activo | Par de divisas | Opción binaria |
| Liquidación | Continua | $0 o $1 |
| Spread | Variable |Maker/Taker |
| Información | Precio | Probabilidad |
