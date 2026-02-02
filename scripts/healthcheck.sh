#!/bin/bash
# PauloARIS Health Check Script
# Ejecutar cada 5 minutos via cron

STATE_DIR="/home/pi/.openclaw/workspace/state"
LOG_DIR="/home/pi/.openclaw/workspace/logs"

mkdir -p "$LOG_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "========================================="
log "PauloARIS Health Check Started"
log "========================================="

# Check web server
if curl -s --max-time 5 http://localhost:8080 > /dev/null 2>&1; then
    log "✅ Web Server (8080): UP"
else
    log "❌ Web Server (8080): DOWN"
fi

# Check API Leads
if curl -s --max-time 5 http://localhost:8081/api/stats > /dev/null 2>&1; then
    log "✅ API Leads (8081): UP"
else
    log "❌ API Leads (8081): DOWN"
fi

# Check API Metrics
if curl -s --max-time 5 http://localhost:8082/api/metrics > /dev/null 2>&1; then
    log "✅ API Metrics (8082): UP"
else
    log "❌ API Metrics (8082): DOWN"
fi

# CPU Load
LOAD=$(uptime | awk -F'load average:' '{print $2}' | sed 's/,//g')
log "📊 CPU Load: $LOAD"

# Memory
MEM=$(free -h | grep Mem | awk '{print $3"/"$2}')
log "💾 Memory: $MEM"

# Temperature
TEMP=$(vcgencmd measure_temp 2>/dev/null)
log "🌡️ Temperature: $TEMP"

# Ralph Loop
python3 "$STATE_DIR/loop-runner.py" status > /dev/null 2>&1
if [ $? -eq 0 ]; then
    log "✅ Ralph Loop: ACTIVE"
else
    log "⚠️ Ralph Loop: CHECK NEEDED"
fi

log "Health check completed"
