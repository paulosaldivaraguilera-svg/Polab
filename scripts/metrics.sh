#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
#  METRICS - Recopila métricas del sistema
# ═══════════════════════════════════════════════════════════════════════════

API_URL="http://localhost:8081"
LOG_FILE="$HOME/.openclaw/workspace/logs/metrics.log"

collect() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Leads stats
    local leads_stats=$(curl -s "$API_URL/api/stats" 2>/dev/null || echo '{}')
    local total=$(echo "$leads_stats" | grep -o '"total":[0-9]*' | cut -d: -f2 || echo 0)
    local nuevos=$(echo "$leads_stats" | grep -o '"nuevos":[0-9]*' | cut -d: -f2 || echo 0)
    
    # System stats
    local cpu=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d% -f1 || echo 0)
    local mem=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}' || echo 0)
    local disk=$(df -h / | awk 'NR==2 {print $5}' | cut -d% -f1 || echo 0)
    
    # Services status
    local web_status=$(pgrep -f "python3 -m http.server 8080" > /dev/null && echo "UP" || echo "DOWN")
    local api_status=$(pgrep -f "api_server.py" > /dev/null && echo "UP" || echo "DOWN")
    local tunnel_status=$(pgrep -f "cloudflared" > /dev/null && echo "UP" || echo "DOWN")
    
    # JSON output
    local json=$(cat <<JSON
{
    "timestamp": "$timestamp",
    "leads": { "total": $total, "nuevos": $nuevos },
    "system": { "cpu": $cpu, "mem": $mem, "disk": $disk },
    "services": { "web": "$web_status", "api": "$api_status", "tunnel": "$tunnel_status" }
}
JSON
)
    
    echo "$json" >> "$LOG_FILE"
    echo "$json" | python3 -m json.tool 2>/dev/null || echo "$json"
}

# Run
case "${1:-collect}" in
    collect) collect ;;
    json) curl -s "$API_URL/api/stats" ;;
    *) echo "Usage: metrics.sh [collect|json]" ;;
esac
