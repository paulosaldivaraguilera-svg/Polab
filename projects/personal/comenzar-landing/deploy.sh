#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
#  COMENZAR - SCRIPT DE DEPLOY Y MANTENIMIENTO
# ═══════════════════════════════════════════════════════════════════════════
#  Uso: ./deploy.sh [start|stop|restart|update|status|logs|backup]
# ═══════════════════════════════════════════════════════════════════════════

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
WORKSPACE="$HOME/.openclaw/workspace"
LANDING_DIR="$WORKSPACE/projects/personal/comenzar-landing"
POLAB_DIR="$WORKSPACE/projects/polab"
BACKUP_DIR="$HOME/backups"
LOG_DIR="$WORKSPACE/logs"

# Functions
log_info() { echo -e "${BLUE}[INFO]${NC} $(date '+%H:%M:%S') $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

# Check if process is running
is_running() {
    pgrep -f "$1" > /dev/null 2>&1
}

# Start all services
start() {
    log_info "Iniciando servicios..."
    
    # Web Server
    if ! is_running "python3 -m http.server 8080"; then
        cd "$LANDING_DIR"
        nohup python3 -m http.server 8080 > "$LOG_DIR/web.log" 2>&1 &
        log_success "Web server iniciado (puerto 8080)"
    else
        log_warn "Web server ya estaba ejecutándose"
    fi
    
    # API Server
    if ! is_running "api_server.py"; then
        cd "$POLAB_DIR"
        nohup python3 api_server.py > "$LOG_DIR/api.log" 2>&1 &
        log_success "API server iniciada (puerto 8081)"
    else
        log_warn "API server ya estaba ejecutándose"
    fi
    
    # Cloudflare Tunnel
    if ! is_running "cloudflared.*8080"; then
        nohup ~/.npm-global/bin/cloudflared tunnel --url http://localhost:8080 > "$LOG_DIR/tunnel.log" 2>&1 &
        sleep 3
        TUNNEL_URL=$(cat ~/.cloudflared_url.log 2>/dev/null | grep -o 'https://[^[:space:]]*trycloudflare.com' | head -1)
        if [ -n "$TUNNEL_URL" ]; then
            log_success "Tunnel creado: $TUNNEL_URL"
        fi
    fi
    
    show_status
}

# Stop all services
stop() {
    log_info "Deteniendo servicios..."
    pkill -f "python3 -m http.server 8080" && log_success "Web server detenido" || true
    pkill -f "api_server.py" && log_success "API detenida" || true
    pkill -f "cloudflared" && log_success "Tunnel detenido" || true
}

# Restart all services
restart() {
    stop
    sleep 2
    start
}

# Update from Git
update() {
    log_info "Actualizando desde Git..."
    cd "$WORKSPACE"
    git pull origin main
    log_success "Código actualizado"
    restart
}

# Show status
show_status() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║              📊 ESTADO DE SERVICIOS COMENZAR                     ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Web
    if is_running "python3 -m http.server 8080"; then
        echo -e "  🌐 Web Server      ${GREEN}●${NC} Ejecutando (puerto 8080)"
    else
        echo -e "  🌐 Web Server      ${RED}○${NC} Detenido"
    fi
    
    # API
    if is_running "api_server.py"; then
        echo -e "  🔌 API Server      ${GREEN}●${NC} Ejecutando (puerto 8081)"
    else
        echo -e "  🔌 API Server      ${RED}○${NC} Detenido"
    fi
    
    # Tunnel
    if is_running "cloudflared.*8080"; then
        TUNNEL_URL=$(cat ~/.cloudflared_url.log 2>/dev/null | grep -o 'https://[^[:space:]]*trycloudflare.com' | head -1)
        if [ -n "$TUNNEL_URL" ]; then
            echo -e "  🔗 Public URL      ${GREEN}●${NC} $TUNNEL_URL"
        else
            echo -e "  🔗 Public URL      ${YELLOW}●${NC} Iniciando..."
        fi
    else
        echo -e "  🔗 Public URL      ${RED}○${NC} Tunnel detenido"
    fi
    
    echo ""
    
    # Stats from API
    if is_running "api_server.py"; then
        TOTAL=$(curl -s http://localhost:8081/api/stats 2>/dev/null | grep -o '"total":[0-9]*' | cut -d: -f2)
        NUEVOS=$(curl -s http://localhost:8081/api/stats 2>/dev/null | grep -o '"nuevos":[0-9]*' | cut -d: -f2)
        echo "  📈 Leads Total: ${TOTAL:-0} | Nuevos: ${NUEVOS:-0}"
    fi
    
    echo ""
    echo "  📂 URLs:"
    echo "     • Página:      http://localhost:8080"
    echo "     • Dashboard:   http://localhost:8080/dashboard.html"
    echo "     • API:         http://localhost:8081/api/stats"
    echo ""
}

# Show logs
logs() {
    echo "📜 Mostrando logs (Ctrl+C para salir):"
    tail -f "$LOG_DIR"/*.log 2>/dev/null || echo "No hay logs aún"
}

# Backup
backup() {
    log_info "Creando backup..."
    mkdir -p "$BACKUP_DIR"
    DATE=$(date +%Y%m%d_%H%M%S)
    
    # Backup DB
    cp "$POLAB_DIR/db/leads.db" "$BACKUP_DIR/leads_$DATE.db"
    
    # Backup workspace (selective)
    tar -czf "$BACKUP_DIR/landing_$DATE.tar.gz" -C "$LANDING_DIR" . --exclude=node_modules --exclude=.git
    
    log_success "Backup creado: $BACKUP_DIR"
    ls -lh "$BACKUP_DIR" | tail -5
}

# Help
help() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║              COMENZAR - SCRIPT DE GESTIÓN                        ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "  ./deploy.sh start    - Iniciar todos los servicios"
    echo "  ./deploy.sh stop     - Detener todos los servicios"
    echo "  ./deploy.sh restart  - Reiniciar servicios"
    echo "  ./deploy.sh update   - Actualizar código y reiniciar"
    echo "  ./deploy.sh status   - Ver estado de servicios"
    echo "  ./deploy.sh logs     - Ver logs en tiempo real"
    echo "  ./deploy.sh backup   - Crear backup"
    echo "  ./deploy.sh help     - Mostrar esta ayuda"
    echo ""
}

# Main
case "${1:-status}" in
    start)    start ;;
    stop)     stop ;;
    restart)  restart ;;
    update)   update ;;
    status)   show_status ;;
    logs)     logs ;;
    backup)   backup ;;
    *)        help ;;
esac
