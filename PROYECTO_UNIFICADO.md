# PROYECTO UNIFICADO: EXO-CEREBRO + TRADING + FOUNDRY
# Plan de ejecución en paralelo - Iniciado: 2026-02-01
# Actualizado: 2026-02-01 13:30 - PRIORIDADES PERSONALES AGREGADAS

## NOTA DEL EQUIPO

**Prioridades Personales de Paulo (Orden de importancia):**
1. **paulosaldivar.cv** - Página web personal/profesional
2. **Comenzar** - Proyecto de landing page
3. Polab Core + Trading (en segundo plano)

---

## ═══════════════════════════════════════════════════════════════════
## FASE 0: PROYECTOS PERSONALES (PRIORIDAD ALTA)
## ═══════════════════════════════════════════════════════════════════

### 0.1 paulosaldivar.cv (Página Personal)
```bash
# Ubicación del proyecto
cd /home/pi/.openclaw/workspace/projects/personal/web-personal

# Estado actual
ls -la

# Dependencias (si tiene package.json)
npm install 2>/dev/null || true

# Verificar si hay archivos
find . -name "*.html" -o -name "*.jsx" -o -name "*.tsx" | head -10
```

**Acciones necesarias:**
- [ ] Revisar estructura actual
- [ ] Identificar framework (Next.js, React, plain HTML?)
- [ ] Configurar dominio paulosaldivar.cv
- [ ] Deploy (Vercel, Netlify, o Docker local)

---

### 0.2 Comenzar (Landing Page)
```bash
# Ubicación del proyecto
cd /home/pi/.openclaw/workspace/projects/personal/comenzar-landing

# Verificar archivos
ls -la

# Verificar package.json
cat package.json 2>/dev/null || echo "Sin package.json"

# Estado del desarrollo
git status 2>/dev/null || echo "Sin git"
```

**Acciones necesarias:**
- [ ] Revisar estado del código
- [ ] Terminar componentes faltantes
- [ ] Deploy a producción
- [ ] Configurar analytics

---

## ═══════════════════════════════════════════════════════════════════
## FASE 1: EXO-CEREBRO (Deploy Real en Raspberry Pi)
## ═══════════════════════════════════════════════════════════════════

## ═══════════════════════════════════════════════════════════════════
## FASE 1: EXO-CEREBRO (Deploy Real en Raspberry Pi)
## ═══════════════════════════════════════════════════════════════════

### 1.1 Preparación del Sistema
```bash
# Verificar estado actual
bash /home/pi/.openclaw/scripts/optimize-pi-v2.sh --dry-run

# Si está todo OK, ejecutar
sudo /home/pi/.openclaw/scripts/optimize-pi-v2.sh
```

### 1.2 Docker Hardening
```bash
# Backup de configuración actual
cp ~/.docker/config.json ~/.docker/config.json.backup

# Deploy del Polab Core
cd /home/pi/.openclaw
docker-compose -f docker-compose-Polab Core.yml up -d

# Verificar servicios
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### 1.3 Tailscale (Acceso Remoto Seguro)
```bash
# Si no está instalado
curl -fsSL https://tailscale.com/install.sh | sh

# Conectar
sudo tailscale up --operator=pi

# Configurar serve
bash /home/pi/.openclaw/scripts/tailscale-setup.sh
```

### 1.4 Verificación
```bash
# Tests de salud
curl http://127.0.0.1:18789/health

# Verificar puertos (solo localhost)
netstat -tlnp | grep -E "18789|8080|11434"
```

### Checklist Polab Core
- [ ] ZRAM activo
- [ ] Governor en performance
- [ ] Docker compose deployado
- [ ] Tailscale conectado
- [ ] Code-Server accesible via VPN
- [ ] memU corriendo

---

## ═══════════════════════════════════════════════════════════════════
## FASE 2: TRADING (Paper Trading de 2 Semanas)
## ═══════════════════════════════════════════════════════════════════

### 2.1 Instalación del Entorno
```bash
# Instalar dependencias
bash /home/pi/.openclaw/scripts/install-trading-v3.sh

# Configurar credenciales (L2 API Keys)
cp ~/.openclaw/skills/polymarket-trader/.env.example \
   ~/.openclaw/skills/polymarket-trader/.env

# Editar con API Keys reales (si se tienen)
nano ~/.openclaw/skills/polymarket-trader/.env
```

### 2.2 Modo Paper (2 semanas mínimo)
```bash
# Verificar que .env tenga: TRADING_MODE=paper

# Probar análisis
source ~/.openclaw/skills/polymarket-trader/venv/bin/activate
python ~/.openclaw/skills/polymarket-trader/market_maker.py \
  --market btc-price-dec-2025 --mode analyze

# Iniciar daemon
python ~/.openclaw/skills/polymarket-trader/market_maker.py \
  --market btc-price-dec-2025 --mode daemon
```

### 2.3 Servicio Systemd
```bash
# Habilitar servicio
sudo systemctl enable polybot
sudo systemctl start polybot

# Verificar
systemctl status polybot
journalctl -u polybot -f
```

### 2.4 Dashboard y Monitoreo
```bash
# Abrir dashboard
firefox /home/pi/.openclaw/workspace/trading-dashboard-v3.html &

# Verificar riesgos cada hora
bash /home/pi/.openclaw/scripts/risk-manager-v3.sh check

# Stats diarios
bash /home/pi/.openclaw/scripts/risk-manager-v3.sh stats
```

### 2.5 Tracking de Resultados
```bash
# Al final de cada día, registrar
grep "$(date +%Y-%m-%d)" /var/log/polybot.log | grep -E "SEÑAL|COMPRA|VENTA|P&L"

# Calcular métricas
python -c "
import re
log = open('/var/log/polybot.log').read()
signals = re.findall(r'SEÑAL\s+(\w+)', log)
wins = signals.count('COMPRA') + signals.count('VENTA')
print(f'Señales: {len(signals)}, Ganadoras: {wins}')
"
```

### Checklist Trading
- [ ] Dependencias instaladas
- [ ] .env configurado
- [ ] TRADING_MODE=paper
- [ ] Primer análisis ejecutado
- [ ] Servicio polybot corriendo
- [ ] Kill switch funcionando
- [ ] Dashboard accesible
- [ ] 14 días de paper completados

---

## ═══════════════════════════════════════════════════════════════════
## FASE 3: FOUNDRY (Crystallize Patrones)
## ═══════════════════════════════════════════════════════════════════

### 3.1 Analizar Patrones Emergentes
```bash
# Ver métricas actuales
cat ~/.openclaw/extensions/foundry-openclaw/stats.json

# Overseer analysis
foundry_overseer
```

### 3.2 Crystallize Candidates
```bash
# Identificar patrones重复
foundry_overseer | grep -A5 "Crystallize"

# Crystallize el primer patrón
# foundry_crystallize --patternId <id>
```

### 3.3 Evolve Herramientas
```bash
# Analizar herramientas underperforming
foundry_evolve --fitnessThreshold 0.7

# Si hay suggestions, aplicar
# foundry_apply_improvement --taskType <tipo>
```

### 3.4 Publicar Abilities (Opcional)
```bash
# Si tenemos patrones validados
# foundry_publish_ability --type pattern --name "docker-hardening" ...
```

### Checklist Foundry
- [ ] Overseer ejecutado
- [ ] Patrones identificados
- [ ] Al menos 1 patrón crystallized
- [ ] Herramientas evolveadas si es necesario
- [ ] Métricas actualizadas

---

## ═══════════════════════════════════════════════════════════════════
## ORDEN DE EJECUCIÓN RECOMENDADO
## ═══════════════════════════════════════════════════════════════════

### SESIÓN 1: Fundamentos (Hoy/Mañana)
1. [ ] Revisar estado actual del sistema
2. [ ] Backup de config existente
3. [ ] Deploy Polab Core Docker compose
4. [ ] Instalar Trading environment

### SESIÓN 2: Conexión (Esta semana)
1. [ ] Configurar Tailscale
2. [ ] Probar Paper Trading
3. [ ] Configurar polybot service
4. [ ] Verificar kill switch

### SESIÓN 3: Observación (2 semanas)
1. [ ] Daily checks de trading
2. [ ] Recopilar métricas
3. [ ] foundry_overseer
4. [ ] Ajustar parámetros

### SESIÓN 4: Optimización (Tras paper trading)
1. [ ] Ajustar Kelly fraccional
2. [ ] foundry_evolve
3. [ ] Crystallize patrones
4. [ ] Considerar transición a live

---

## ═══════════════════════════════════════════════════════════════════
## DASHBOARD UNIFICADO
## ═══════════════════════════════════════════════════════════════════

```bash
#!/bin/bash
# dashboard-unificado.sh - Ver estado de los 3 proyectos

echo "╔════════════════════════════════════════════════════╗"
echo "║       DASHBOARD UNIFICADO - $(date +%H:%M)                 ║"
echo "╚════════════════════════════════════════════════════╝"

echo ""
echo "🧠 EXO-CEREBRO"
echo "─────────────"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "NAME|openclaw|ollama|memu|code" || echo "  No corriendo"
echo "  Tailscale: $(tailscale status 2>/dev/null | grep -c "100\.") dispositivos"
echo "  ZRAM: $(cat /sys/block/zram0/disksize 2>/dev/null | awk '{print int($1/1024/1024)" MB"}' || echo 'N/A')"

echo ""
echo "📈 TRADING"
echo "──────────"
systemctl is-active polybot 2>/dev/null && echo "  ✅ polybot ACTIVO" || echo "  ❌ polybot inactivo"
echo "  Modo: $(grep TRADING_MODE ~/.openclaw/skills/polymarket-trader/.env 2>/dev/null | cut -d= -f2 || echo 'N/A')"
echo "  P&L Hoy: $(grep "$(date +%Y-%m-%d)" /var/log/polybot.log 2>/dev/null | grep -c "SEÑAL") señales"

echo ""
echo "🛠️ FOUNDRY"
echo "──────────"
cat ~/.openclaw/extensions/foundry-openclaw/stats.json 2>/dev/null | jq -r '"\n  Tools: \(.tools_written)\n  Patterns: \(.patterns_total)\n  Fitness: \(.avg_fitness)"' || echo "  Sin métricas"

echo ""
echo "⚡ PRÓXIMOS PASOS"
echo "─────────────────"
echo "  1. bash /home/pi/.openclaw/scripts/risk-manager-v3.sh check"
echo "  2. docker logs -f openclaw_core"
echo "  3. tail -f /var/log/polybot.log"
```

---

## ═══════════════════════════════════════════════════════════════════
## NOTAS DE ESTADO
## ═══════════════════════════════════════════════════════════════════

### Actualizado: 2026-02-01
### Por: Equipo Polab Core

### Pendiente de decisión:
- ¿Qué mercado(s) priorizar para paper trading?
- ¿Configurar Tailscale con cuenta nueva o existente?
- ¿Cuántas semanas de paper antes de considerar live?

### Dependencies:
- Raspberry Pi 5 con 8GB mínimo
- Docker + Docker Compose
- Cuenta Polymarket con API Keys L2
- Cuenta Tailscale

### Documentación relacionada:
- /home/pi/.openclaw/.foundry/insights/v2/ (Polab Core)
- /home/pi/.openclaw/.foundry/insights/v3/ (Trading)
- /home/pi/.openclaw/workspace/memory/2026-02-01-mega.md
