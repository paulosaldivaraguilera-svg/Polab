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
