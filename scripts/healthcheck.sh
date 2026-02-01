#!/bin/bash
# Health Check - polab Services
# Verifica que todos los servicios estén responding

ERRORS=0

check_service() {
    local name=$1
    local url=$2
    local status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url")
    
    if [ "$status" = "200" ] || [ "$status" = "302" ]; then
        echo "✅ $name (HTTP $status)"
    else
        echo "❌ $name (HTTP $status)"
        ERROR=$((ERROR + 1))
    fi
}

echo "🏥 Health Check - $(date)"
echo "================================"

check_service "Portainer" "http://localhost:9000"
check_service "Netdata" "http://localhost:19999"
check_service "Uptime Kuma" "http://localhost:3001"

# Check Docker services
echo ""
echo "🐳 Docker Services:"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -v "NAMES"

if [ $ERRORS -gt 0 ]; then
    echo ""
    echo "⚠️ $ERRORS servicios con problemas"
    exit 1
else
    echo ""
    echo "✅ Todos los servicios saludables"
    exit 0
fi
