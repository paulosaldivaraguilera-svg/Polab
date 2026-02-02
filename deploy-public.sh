#!/bin/bash
# PauloARIS Deploy & Public URLs Generator
# Inicia servicios y genera URLs públicas

set -e

echo "🚀 PAULOARIS - DEPLOY SCRIPT"
echo "============================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Función para esperar y obtener URL
wait_for_url() {
    local name=$1
    local max_attempts=30
    local attempt=0
    
    echo -n "⏳ Esperando URL para $name..."
    
    while [ $attempt -lt $max_attempts ]; do
        local url=$(grep -o 'https://[^[:space:]]*\.trycloudflare\.com' "/home/pi/.openclaw/logs/${name}.log" 2>/dev/null | head -1)
        
        if [ -n "$url" ]; then
            echo -e "${GREEN} OK${NC}"
            echo "$url"
            return 0
        fi
        
        sleep 1
        attempt=$((attempt + 1))
        echo -n "."
    done
    
    echo -e "${YELLOW} TIMEOUT${NC}"
    echo ""
    return 1
}

# Función para iniciar servicio
start_service() {
    local name=$1
    local port=$2
    local command=$3
    
    echo -e "${BLUE}📦 Iniciando $name (puerto $port)...${NC}"
    
    # Verificar si ya está corriendo
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        echo "   ⏭️  $name ya está corriendo"
    else
        if [ -n "$command" ]; then
            $command > /dev/null 2>&1 &
            sleep 2
        fi
    fi
    
    # Verificar
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ $name corriendo en puerto $port${NC}"
    else
        echo -e "   ${YELLOW}⚠️  $name no respondió${NC}"
    fi
}

echo "1️⃣  INICIANDO SERVICIOS..."
echo "=========================="

# Sistema SUR (Puerto 8083)
start_service "Sistema SUR" 8083 "cd /home/pi/.openclaw/workspace/projects/personal/sistema-sur && node server.js &"

# La Unidad (Puerto 8084 - cuando esté listo)
# start_service "La Unidad" 8084 "cd /home/pi/.openclaw/workspace && node server-la-unidad.js &"

# Prompt Verse (Puerto 3005)
start_service "Prompt Verse" 3005 ""

echo ""
echo "2️⃣  INICIANDO TÚNELES CLOUDFLARE..."
echo "=================================="

# Iniciar túneles
/home/pi/.openclaw/workspace/tunnel-manager.sh start

echo ""
echo "3️⃣  GENERANDO RESUMEN DE URLs..."
echo "================================"
echo ""

# Generar HTML con URLs
cat > /home/pi/.openclaw/workspace/public-urls.html << 'EOF'
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
    </style>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <div class="container mx-auto px-4 py-12 max-w-4xl">
        <header class="text-center mb-12">
            <h1 class="text-4xl font-black mb-2">🚀 PauloARIS</h1>
            <p class="text-gray-400">Acceso público a todos los servicios</p>
            <p class="text-xs text-gray-500 mono mt-2">Generado: TIMESTAMP</p>
        </header>

        <div class="space-y-4">
EOF

# Actualizar timestamp
sed -i "s/TIMESTAMP/$(date '+%Y-%m-%d %H:%M:%S %Z')/" /home/pi/.openclaw/workspace/public-urls.html

# Agregar cada servicio
for service in "Sistema SUR:8083:sistema-sur" "La Unidad:8084:la-unidad" "Prompt Verse:3005:prompt-verse" "Economy Gateway:3108:economy-gateway" "Comenzar:8080:comenzar"; do
    IFS=':' read -r name port key <<< "$service"
    
    url=$(grep -o 'https://[^[:space:]]*\.trycloudflare\.com' "/home/pi/.openclaw/logs/${key}.log" 2>/dev/null | head -1)
    
    if [ -n "$url" ]; then
        cat >> /home/pi/.openclaw/workspace/public-urls.html << EOF
            <div class="bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-700">
                <div>
                    <h3 class="font-bold text-lg">$name</h3>
                    <p class="text-gray-400 text-sm">Puerto $port</p>
                </div>
                <div class="flex items-center gap-3">
                    <code class="mono text-green-400 text-sm">$url</code>
                    <a href="$url" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold transition">
                        Abrir →
                    </a>
                </div>
            </div>
EOF
    fi
done

# Cerrar HTML
cat >> /home/pi/.openclaw/workspace/public-urls.html << 'EOF'
        </div>

        <footer class="mt-12 text-center text-gray-500 text-sm">
            <p>💡 Los enlaces se generan automáticamente via Cloudflare Tunnel</p>
            <p class="mono mt-2">Ejecuta: ./tunnel-manager.sh status</p>
        </footer>
    </div>
</body>
</html>
EOF

echo "📄 Generado: /home/pi/.openclaw/workspace/public-urls.html"

echo ""
echo "4️⃣  RESUMEN FINAL..."
echo "==================="
echo ""

# Mostrar URLs
/home/pi/.openclaw/workspace/tunnel-manager.sh urls

echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "================="
echo "• Copia las URLs públicas de arriba"
echo "• Abre cualquiera en tu navegador"
echo "• Los túneles funcionan aunque reinicies el Raspberry"
echo ""
echo "💡 Para detener: ./tunnel-manager.sh stop <nombre>"
echo "📊 Para estado: ./tunnel-manager.sh status"
echo ""
