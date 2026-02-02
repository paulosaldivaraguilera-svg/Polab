#!/bin/bash
# Cloudflare Tunnel Manager para PauloARIS
# Expone servicios localhost a URLs públicas

# Configuración de túneles
SERVICES=(
    "sistema-sur:Sistema SUR Educativo:8083"
    "la-unidad:La Unidad Prensa Digital:8084"
    "prompt-verse:Prompt Automation:3005"
)

TUNNEL_CONFIG_DIR="/home/pi/.cloudflared"
TUNNEL_LOG_DIR="/home/pi/.openclaw/logs"

# Crear directorios
mkdir -p "$TUNNEL_CONFIG_DIR" "$TUNNEL_LOG_DIR"

# Función para obtener URL pública de un túnel
get_tunnel_url() {
    local name=$1
    local log_file="$TUNNEL_LOG_DIR/${name}.log"
    
    if [ -f "$log_file" ]; then
        grep -o 'https://[^[:space:]]*\.trycloudflare\.com' "$log_file" | head -1
    else
        echo ""
    fi
}

# Función para iniciar túnel
start_tunnel() {
    local name=$1
    local port=$2
    local log_file="$TUNNEL_LOG_DIR/${name}.log"
    
    # Verificar si ya está corriendo
    if pgrep -f "cloudflared.*--name.*$name" > /dev/null; then
        echo "⏭️  $name ya está corriendo"
        return 0
    fi
    
    echo "🚀 Iniciando túnel para $name en puerto $port..."
    
    cloudflared tunnel --name "$name" --url "http://localhost:$port" \
        > "$log_file" 2>&1 &
    
    sleep 3
    
    local url=$(get_tunnel_url "$name")
    if [ -n "$url" ]; then
        echo "✅ $name: $url"
    else
        echo "⏳ $name: Esperando URL..."
    fi
}

# Función para detener túnel
stop_tunnel() {
    local name=$1
    pkill -f "cloudflared.*--name.*$name" 2>/dev/null
    echo "🛑 $name detenido"
}

# Función para mostrar estado
status() {
    echo "📊 ESTADO DE TÚNELES CLOUDFLARE"
    echo "================================"
    
    for service in "${SERVICES[@]}"; do
        IFS=':' read -r key desc port <<< "$service"
        
        local url=$(get_tunnel_url "$key")
        local running=$(pgrep -f "cloudflared.*--name.*$key" > /dev/null && echo "🟢" || echo "🔴")
        
        echo "$running $key ($desc): $port"
        if [ -n "$url" ]; then
            echo "   🔗 $url"
        fi
    done
}

# Función para iniciar todos los túneles
start_all() {
    echo "🌐 INICIANDO TODOS LOS TÚNELES..."
    echo "================================"
    
    for service in "${SERVICES[@]}"; do
        IFS=':' read -r key desc port <<< "$service"
        start_tunnel "$key" "$port"
    done
    
    echo ""
    echo "📋 RESUMEN DE URLS PÚBLICAS:"
    echo "============================"
    status
}

# Parsear comando
case "${1:-status}" in
    start)
        start_all
        ;;
    start:name)
        start_tunnel "$2" "$3"
        ;;
    stop)
        stop_tunnel "$2"
        ;;
    status)
        status
        ;;
    urls)
        echo "📋 URLs PÚBLICAS:"
        for service in "${SERVICES[@]}"; do
            IFS=':' read -r key desc port <<< "$service"
            url=$(get_tunnel_url "$key")
            if [ -n "$url" ]; then
                echo "$key: $url"
            fi
        done
        ;;
    *)
        echo "Uso: $0 {start|stop|name port|status|urls}"
        echo ""
        echo "Comandos:"
        echo "  start        - Iniciar todos los túneles"
        echo "  stop <name>  - Detener un túnel específico"
        echo "  start <name> <port> - Iniciar un túnel específico"
        echo "  status       - Mostrar estado de túneles"
        echo "  urls         - Mostrar URLs públicas"
        ;;
esac
