#!/bin/bash
# Deploy v2 para POLAB

set -e

echo "======================================"
echo "  POLAB DEPLOY v2.0"
echo "======================================"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Funciones
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# Verificar servicios
log_info "Verificando servicios..."

check_service() {
    if curl -s "http://localhost:$1/health" > /dev/null 2>&1; then
        log_success "Puerto $1: Online"
        return 0
    else
        log_warn "Puerto $1: Offline"
        return 1
    fi
}

check_service 8081  # API Leads
check_service 8082  # API Metrics
check_service 9000  # Portainer
check_service 3001  # Uptime Kuma

# Docker status
log_info "Estado de Docker..."
docker ps --format "table {{.Names}}\t{{.Status}}" | head -5

# Backups
log_info "Verificando backups..."
BACKUP_COUNT=$(ls ~/.openclaw/backups/daily/*.gz 2>/dev/null | wc -l)
log_success "Backups disponibles: $BACKUP_COUNT"

# Git status
log_info "Estado de Git..."
cd ~/.openclaw/workspace
BRANCH=$(git rev-parse --abbrev-ref HEAD)
AHEAD=$(git log --oneline @{u}.. 2>/dev/null | wc -l)
BEHIND=$(git log --oneline ..@{u} 2>/dev/null | wc -l)

echo "   Branch: $BRANCH"
[ "$AHEAD" -gt 0 ] && echo "   Commits por push: $AHEAD"
[ "$BEHIND" -gt 0 ] && echo "   Commits por pull: $BEHIND"

echo ""
log_success "Deploy v2 completado!"
echo "======================================"
