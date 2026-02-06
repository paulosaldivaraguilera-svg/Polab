#!/bin/bash
# Heartbeat System - PauloARIS
# Configura cron jobs para checks automáticos

CRON_DIR="/home/pi/.openclaw/workspace/scripts"
LOG_DIR="/home/pi/.openclaw/logs/heartbeat"
STATE_FILE="/home/pi/.openclaw/workspace/state/heartbeat-state.json"

# Crear directorios
mkdir -p "$LOG_DIR"
mkdir -p "$CRON_DIR"
mkdir -p "$(dirname "$STATE_FILE")"

# Crear estado inicial si no existe
if [ ! -f "$STATE_FILE" ]; then
    cat > "$STATE_FILE" << EOF
{
    "lastChecks": {
        "email": null,
        "calendar": null,
        "weather": null,
        "services": null,
        "outcomes": null
    }
}
EOF
fi

echo "📋 Configurando Heartbeat System..."

# Script de check general
cat > "$CRON_DIR/heartbeat-check.sh" << 'EOF'
#!/bin/bash
# Heartbeat Check Principal

LOG_DIR="/home/pi/.openclaw/logs/heartbeat"
STATE_FILE="/home/pi/.openclaw/workspace/state/heartbeat-state.json"
HOUR=$(date +%H)
DAY_OF_WEEK=$(date +%u)

echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] Heartbeat check..."

# Función para actualizar last check
update_check() {
    local key=$1
    local timestamp=$(date +%s)
    python3 << PYTHON
import json
import sys

key = "$key"
timestamp = int("$timestamp")
state_file = "$STATE_FILE"

with open(state_file, 'r') as f:
    state = json.load(f)

state['lastChecks'][key] = timestamp

with open(state_file, 'w') as f:
    json.dump(state, f, indent=2)
PYTHON
}

# Rotación de checks (cada 30 min)
# 0:00 - Email
# 0:30 - Calendario
# 1:00 - Servicios
# 1:30 - Weather
# 2:00 - Outcomes

CHECK_INDEX=$(( (HOUR * 2 + $(date +%M) / 30) % 5 ))

case $CHECK_INDEX in
    0)
        echo "📧 Checking emails..."
        update_check "email"
        # Comando de check de email (por implementar)
        ;;
    1)
        echo "📅 Checking calendar..."
        update_check "calendar"
        # Comando de check de calendario (por implementar)
        ;;
    2)
        echo "🔧 Checking services..."
        update_check "services"
        bash /home/pi/.openclaw/workspace/projects/polab/deploy.sh status >> "$LOG_DIR/services-$(date +%Y%m%d).log" 2>&1
        ;;
    3)
        echo "🌤 Checking weather..."
        update_check "weather"
        # Comando de check de weather (por implementar)
        ;;
    4)
        echo "📊 Checking outcomes..."
        update_check "outcomes"
        # Comando de check de outcomes (por implementar)
        ;;
esac

echo "✅ Check completado ($CHECK_INDEX/5)"
EOF

chmod +x "$CRON_DIR/heartbeat-check.sh"

# Configurar crontab
echo ""
echo "⚙️  Configurando crontab..."

# Comentar entradas existentes de heartbeat
crontab -l 2>/dev/null | grep -v "heartbeat-check.sh" > /tmp/crontab-temp

# Añadir nueva entrada (cada 30 min)
cat >> /tmp/crontab-temp << EOF
# Heartbeat System - PauloARIS
*/30 * * * * $CRON_DIR/heartbeat-check.sh >> $LOG_DIR/heartbeat.log 2>&1
EOF

# Instalar nuevo crontab
crontab /tmp/crontab-temp

# Limpiar
rm /tmp/crontab-temp

echo ""
echo "✅ Heartbeat System configurado exitosamente"
echo ""
echo "📊 Checks programados (cada 30 min, rotativo):"
echo "   0:00, 2:00, 4:00...  📧 Email"
echo "   0:30, 2:30, 4:30...  📅 Calendar"
echo "   1:00, 3:00, 5:00...  🔧 Services"
echo "   1:30, 3:30, 5:30...  🌤 Weather"
echo "   2:00, 4:00, 6:00...  📊 Outcomes"
echo ""
echo "📂 Logs: $LOG_DIR"
echo "📄 Estado: $STATE_FILE"
echo ""
echo "Para ver crontab actual:  crontab -l"
echo "Para editar crontab:      crontab -e"
echo "Para detener:             crontab -e (comentar la línea de heartbeat)"
echo ""

# Mostrar cron activo
echo "🔄 Cron jobs activos:"
crontab -l | grep -v "^#" | grep -v "^$"
