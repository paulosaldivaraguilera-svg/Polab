#!/bin/bash
# PauloARIS Public Access via Serveo.net (SSH Reverse Tunnel)
# Alternativa gratuita a ngrok/Cloudflare Tunnel

SERVICES=(
    "sistema-sur:8083:Sistema SUR Educativo"
    "la-unidad:8084:La Unidad Prensa Digital"
    "prompt-verse:3005:Prompt Automation"
    "economy:3108:Economy Gateway"
    "comenzar:8080:Comenzar Landing"
)

LOG_DIR="/home/pi/.openclaw/logs"
mkdir -p "$LOG_DIR"

# Función para iniciar tunnel serveo
start_serveo_tunnel() {
    local name=$1
    local port=$2
    local log_file="$LOG_DIR/${name}.serveo.log"
    
    # Verificar si ya está corriendo
    if pgrep -f "ssh.*serveo.*$port" > /dev/null; then
        echo "⏭️  $name ya está corriendo"
        return 0
    fi
    
    echo "🚀 Iniciando tunnel serveo para $name (puerto $port)..."
    
    # Iniciar tunnel SSH reverso a serveo.net
    ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=60 \
        -R 80:localhost:$port serveo.net \
        > "$log_file" 2>&1 &
    
    sleep 3
}

# Función para obtener URL de serveo
get_serveo_url() {
    local log_file=$1
    if [ -f "$log_file" ]; then
        grep -o 'https://[^[:space:]]*\.serveo\.net' "$log_file" | head -1
    fi
}

# Función para mostrar estado
status() {
    echo "📊 ESTADO DE TÚNELES SERVE0.NET"
    echo "================================"
    
    for service in "${SERVICES[@]}"; do
        IFS=':' read -r key port desc <<< "$service"
        
        local running=$(pgrep -f "ssh.*serveo.*$port" > /dev/null && echo "🟢" || echo "🔴")
        local url=$(get_serveo_url "$LOG_DIR/${key}.serveo.log")
        
        echo "$running $key ($desc): $port"
        if [ -n "$url" ]; then
            echo "   🔗 $url"
        fi
    done
}

# Iniciar todos los túneles
start_all() {
    echo "🌐 INICIANDO TÚNELES SERVE0.NET..."
    echo "=================================="
    
    for service in "${SERVICES[@]}"; do
        IFS=':' read -r key port desc <<< "$service"
        start_serveo_tunnel "$key" "$port"
    done
    
    echo ""
    echo "⏳ Esperando URLs públicas..."
    sleep 5
    
    echo ""
    status
}

# Mostrar URLs
show_urls() {
    echo "📋 URLs PÚBLICAS:"
    echo "================"
    
    for service in "${SERVICES[@]}"; do
        IFS=':' read -r key port desc <<< "$service"
        url=$(get_serveo_url "$LOG_DIR/${key}.serveo.log")
        if [ -n "$url" ]; then
            echo "$key: $url"
        fi
    done
}

# Generar HTML con todas las URLs
generate_html() {
    local html_file="/home/pi/.openclaw/workspace/public-urls.html"
    
    cat > "$html_file" << 'HEADER'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PauloARIS - URLs Públicas</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .gradient-bg { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); }
    </style>
</head>
<body class="gradient-bg text-white min-h-screen">
    <div class="container mx-auto px-4 py-12 max-w-5xl">
        <header class="text-center mb-12">
            <div class="text-6xl mb-4">🚀</div>
            <h1 class="text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                PauloARIS
            </h1>
            <p class="text-xl text-gray-300">Acceso público a todos los servicios</p>
            <p class="mono text-sm text-gray-500 mt-4">TIMESTAMP</p>
        </header>

        <div class="grid gap-4">
HEADER

    for service in "${SERVICES[@]}"; do
        IFS=':' read -r key port desc <<< "$service"
        url=$(get_serveo_url "$LOG_DIR/${key}.serveo.log")
        
        if [ -n "$url" ]; then
            # Generar emoji según servicio
            case $key in
                sistema-sur) emoji="📚" ;;
                la-unidad) emoji="📰" ;;
                prompt-verse) emoji="🎨" ;;
                economy) emoji="💰" ;;
                comenzar) emoji="🌐" ;;
                *) emoji="🔗" ;;
            esac
            
            cat >> "$html_file" << EOF
            <a href="$url" target="_blank" class="block bg-gray-800/50 hover:bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all group">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <span class="text-4xl">$emoji</span>
                        <div>
                            <h3 class="font-bold text-xl group-hover:text-blue-400 transition">$desc</h3>
                            <p class="text-gray-500 text-sm mono">Puerto $port</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <code class="mono text-green-400 text-lg">$url</code>
                        <span class="text-2xl group-hover:translate-x-2 transition">→</span>
                    </div>
                </div>
            </a>
EOF
        fi
    done

    cat >> "$html_file" << 'FOOTER'
        </div>

        <footer class="mt-12 text-center text-gray-500 text-sm">
            <p>🌐 Túneles generados automáticamente via Serveo.net</p>
            <p class="mono mt-2">./serveo-manager.sh status</p>
        </footer>
    </div>
</body>
</html>
FOOTER

    # Actualizar timestamp
    sed -i "s/TIMESTAMP/$(date '+%Y-%m-%d %H:%M:%S %Z')/" "$html_file"
    
    echo "📄 Generado: $html_file"
}

# Parsear comando
case "${1:-start}" in
    start)
        start_all
        show_urls
        generate_html
        ;;
    status)
        status
        ;;
    urls)
        show_urls
        ;;
    stop)
        pkill -f "ssh.*serveo" 2>/dev/null
        echo "🛑 Todos los túneles detenido"
        ;;
    html)
        generate_html
        ;;
    *)
        echo "Uso: $0 {start|status|urls|stop|html}"
        ;;
esac
