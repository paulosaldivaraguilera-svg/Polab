#!/bin/bash
# Night Watch - Monitoreo nocturno
# Ejecuta cada 15 minutos mientras duermes

LOG_FILE="$HOME/.openclaw/workspace/system/logs/night_watch.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Checking systems..." >> $LOG_FILE

# Check Docker
if docker ps > /dev/null 2>&1; then
    echo "[$DATE] Docker: OK" >> $LOG_FILE
else
    echo "[$DATE] Docker: FAIL" >> $LOG_FILE
fi

# Check APIs
curl -s http://localhost:8081/health > /dev/null && echo "[$DATE] API 8081: OK" >> $LOG_FILE || echo "[$DATE] API 8081: FAIL" >> $LOG_FILE
curl -s http://localhost:8082/health > /dev/null && echo "[$DATE] API 8082: OK" >> $LOG_FILE || echo "[$DATE] API 8082: FAIL" >> $LOG_FILE

# Check Git sync
cd ~/.openclaw/workspace
git fetch origin main 2>/dev/null && echo "[$DATE] Git: OK" >> $LOG_FILE || echo "[$DATE] Git: FAIL" >> $LOG_FILE

echo "[$DATE] Night check complete" >> $LOG_FILE
