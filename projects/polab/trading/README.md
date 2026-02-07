# Market Maker Bot - PauloARIS
**Grid Trading + DCA Strategy**  
**Paper Mode (No real money)**

---

## 📖 Descripción

Bot de trading automatizado con estrategia de Grid Trading + Dollar Cost Average (DCA).

**Características:**
- Grid Trading: Órdenes de compra/venta en niveles alrededor del precio
- DCA: Compras periódicas para reducir volatilidad
- Paper Mode: Simulación sin dinero real
- Backtesting: Registro de todas las operaciones
- Análisis en tiempo real

---

## 🚀 Características

### Grid Trading
- 10 niveles de grid (configurable)
- Spread de 1% entre niveles (configurable)
- Órdenes automáticas de compra y venta
- Recalculación de niveles cuando el precio se mueve más de 2%

### Dollar Cost Average (DCA)
- Compra automática cada hora (configurable)
- Monto de $10 USDT por compra (configurable)
- Acumulación a largo plazo de BTC

### Paper Mode
- Simulación completa sin riesgo
- Balance virtual: 10,000 USDT
- Precios simulados con random walk
- Sin necesidad de API key real

### Live Mode (Opcional)
- Integración con Binance
- Trading con dinero real
- API key requerido (NO IMPLEMENTADO AÚN)

---

## 🛠️ Instalación

```bash
# Crear directorio
cd /home/pi/.openclaw/workspace/projects/polab/trading

# El script ya existe
# market_maker.py
```

### Dependencias

Python 3.8+ requerido. No hay dependencias externas en paper mode.

Para live mode:
```bash
pip install ccxt pandas numpy
```

---

## 🎮 Uso

### Ejecutar en Paper Mode (Seguro)

```bash
cd /home/pi/.openclaw/workspace/projects/polab/trading
python3 market_maker.py
```

### Ejecutar con Variables de Entorno

```bash
# Configurar parámetros
export GRID_LEVELS=10
export GRID_SPREAD=0.01  # 1%
export DCA_AMOUNT=10  # USDT
export DCA_INTERVAL=3600  # 1 hora
export MODE=paper

# Ejecutar
python3 market_maker.py
```

### Ejecutar en Background

```bash
cd /home/pi/.openclaw/workspace/projects/polab/trading
nohup python3 market_maker.py > logs/trading-bot.log 2>&1 &
```

### Ver Logs

```bash
# Ver logs en tiempo real
tail -f logs/trading-bot.log

# Ver último estado
cat state/trading-bot-status.json
```

---

## ⚙️ Configuración

### Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `MODE` | `paper` | Modo de operación: `paper` o `live` |
| `EXCHANGE` | `binance` | Exchange a usar: `binance` o `coinbase` |
| `TRADING_PAIR` | `BTC/USDT` | Par de trading |
| `GRID_LEVELS` | `10` | Número de niveles de grid |
| `GRID_SPREAD` | `0.01` | Spread entre niveles (1% = 0.01) |
| `DCA_AMOUNT` | `10` | Monto de DCA en USDT |
| `DCA_INTERVAL` | `3600` | Intervalo de DCA en segundos |
| `LOG_LEVEL` | `INFO` | Nivel de logging: `DEBUG`, `INFO`, `WARNING`, `ERROR` |

### Ejemplo de Configuración

```bash
# Grid Trading agresivo
export GRID_LEVELS=20
export GRID_SPREAD=0.005  # 0.5%

# DCA conservador
export DCA_AMOUNT=5
export DCA_INTERVAL=7200  # 2 horas

# Logging detallado
export LOG_LEVEL=DEBUG
```

---

## 📊 Estrategia

### Grid Trading

```
    $46,000 ━━━━━━━━━━━ SELL ORDERS
    $45,500 ━━━━━━━━━━━
    $45,000 ━━━━━━━━━━━ CURRENT PRICE
    $44,500 ━━━━━━━━━━━
    $44,000 ━━━━━━━━━━━ BUY ORDERS
```

**Lógica:**
- Colocar órdenes BUY por debajo del precio actual
- Colocar órdenes SELL por encima del precio actual
- Cuando el precio toca un nivel, la orden se llena
- Generar beneficios de los spreads

### Dollar Cost Average

```
Hora 0:  Compra 0.00022 BTC @ $45,000
Hora 1:  Compra 0.00022 BTC @ $45,100
Hora 2:  Compra 0.00022 BTC @ $44,900
...
```

**Lógica:**
- Compra fija cada intervalo
- Promedio de precio de entrada
- Reduce impacto de volatilidad

---

## 📈 Monitoreo

### Estado del Bot

```bash
cat state/trading-bot-status.json
```

**Salida:**
```json
{
  "mode": "paper",
  "running": true,
  "current_price": 45000.50,
  "balance_usdt": 9500.25,
  "balance_btc": 0.01111,
  "portfolio_value": 10000.20,
  "pnl": 0.20,
  "pnl_pct": 0.002,
  "active_orders": 10,
  "filled_orders": 5
}
```

---

## 🛡️ Seguridad

### Paper Mode
- ✅ Sin riesgo financiero
- ✅ Simulación completa
- ✅ Balance virtual
- ✅ Sin necesidad de API key

### Live Mode (Futuro)
- ⚠️  Riesgo financiero real
- ⚠️  API key de Binance requerido
- ⚠️  Permite trading con dinero real
- ❌ NO IMPLEMENTADO AÚN

---

## 📝 Logs y Archivos

```
projects/polab/trading/
├── market_maker.py          # Bot principal
├── logs/                   # Logs
│   └── trading-bot.log     # Logs de ejecución
├── state/                  # Estado del bot
│   └── trading-bot-status.json  # Estado actual
└── README.md              # Este archivo
```

---

## 🚧 Debugging

### Ver logs detallados

```bash
export LOG_LEVEL=DEBUG
python3 market_maker.py
```

### Detener el bot

```bash
# Si está corriendo en foreground
Ctrl + C

# Si está en background
pkill -f "market_maker.py"
```

### Reiniciar el bot

```bash
cd /home/pi/.openclaw/workspace/projects/polab/trading
pkill -f "market_maker.py"
sleep 2
nohup python3 market_maker.py > logs/trading-bot.log 2>&1 &
```

---

## 📊 Métricas

### Métricas Disponibles

- **PnL (Profit and Loss):** Beneficio/pérdida total
- **PnL %:** Beneficio/pérdida en porcentaje
- **Active Orders:** Órdenes pendientes
- **Filled Orders:** Órdenes completadas
- **Portfolio Value:** Valor total del portafolio
- **Current Price:** Precio actual del activo

### Análisis Futuro

- Backtesting con datos históricos
- Comparación de estrategias
- Optimización de parámetros
- Visualización de resultados

---

## 🎯 Próximos Pasos

### Inmediatos
- [x] Crear bot básico (paper mode)
- [x] Implementar Grid Trading
- [x] Implementar DCA
- [ ] Probar bot (ejecutar y monitorear)
- [ ] Analizar resultados

### Futuros
- [ ] Integrar Binance API (live mode)
- [ ] Implementar backtesting
- [ ] Añadir más estrategias
- [ ] Dashboard web
- [ ] Alertas por Telegram/WhatsApp

---

## 📚 Referencias

- **Binance API:** https://binance-docs.github.io/apidocs/
- **ccxt Library:** https://github.com/ccxt/ccxt
- **Grid Trading:** https://www.investopedia.com/terms/g/grid-trading
- **DCA Strategy:** https://www.investopedia.com/terms/dollar-cost-averaging

---

## ⚠️ Disclaimer

**Este software es solo para propósitos educativos.**

- El trading de criptomonedas involucra alto riesgo
- Solo use paper mode para aprender
- Nunca invierta dinero que no puede permitirse perder
- El autor no es responsable de pérdidas financieras

---

**Desarrollado por:** PauloARIS  
**Fecha:** 2026-02-06  
**Licencia:** MIT
