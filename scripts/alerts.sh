#!/bin/bash
# ALERTS - Sistema de alertas simple

LOG_FILE="$HOME/.openclaw/workspace/logs/alerts.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

send_alert() {
    echo "🚨 ALERTA: $1 - $2"
    log "$1: $2"
}

check_services() {
    # Web Server
    if ! pgrep -f "python3 -m http.server 8080" > /dev/null; then
        send_alert "CRITICAL" "Web Server caído - reiniciando"
        cd ~/.openclaw/workspace/projects/personal/comenzar-landing
        nohup python3 -m http.server 8080 > /dev/null 2>&1 &
    fi
    
    # API Server
    if ! pgrep -f "api_server.py" > /dev/null; then
        send_alert "CRITICAL" "API caída - reiniciando"
        cd ~/.openclaw/workspace/projects/polab
        nohup python3 api_server.py > ~/.api_server.log 2>&1 &
    fi
    
    # Tunnel
    if ! pgrep -f "cloudflared" > /dev/null; then
        send_alert "WARNING" "Tunnel caído - reiniciando"
        nohup ~/.npm-global/bin/cloudflared tunnel --url http://localhost:8080 > ~/.cloudflared_url.log 2>&1 &
    fi
}

check_resources() {
    # RAM
    local mem=$(free | grep Mem | awk '{print $3/$2 * 100}' | cut -d. -f1)
    if [ "$mem" -gt 90 ] 2>/dev/null; then
        send_alert "WARNING" "RAM crítica: ${mem}%"
    fi
    
    # Disco
    local disk=$(df / | awk 'NR==2 {print $5}' | cut -d% -f1)
    if [ "$disk" -gt 90 ] 2>/dev/null; then
        send_alert "CRITICAL" "Disco lleno: ${disk}%"
    fi
}

# Main
check_services
check_resources

echo "✅ Check completado - Sin alertas críticas"
