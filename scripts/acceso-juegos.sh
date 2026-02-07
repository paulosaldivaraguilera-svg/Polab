#!/bin/bash
# Script de Acceso a Servicios PauloARIS
# Acceso remoto a través de túneles Cloudflare

echo "🌐 SERVICIOS PAULOARIS - ACCESO REMOTO"
echo "======================================"
echo ""
echo "📅 Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo "📍 Acceso: A través de túnel SSH desde computador de Camila"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Enlaces
GAMES_URL="https://accepts-dayton-warranties-reply.trycloudflare.com"
ELEMENTAL_PONG="$GAMES_URL/elemental-pong/prototype_v2.2.html"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎮 JUEGOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📋 Índice de Juegos${NC}"
echo "   URL: $GAMES_URL"
echo ""
echo -e "${GREEN}⚡ Elemental Pong v2.2${NC} (✅ LISTO PARA JUGAR)"
echo "   URL: $ELEMENTAL_PONG"
echo ""
echo "   Características:"
echo "   - WebGPU Renderer (THREE.WebGPURenderer)"
echo "   - ECS Pattern para escalabilidad"
echo "   - 100K partículas con InstancedMesh"
echo "   - Sistema elemental (Fuego/Hielo/Veneno)"
echo "   - Audio procedural (Web Audio API)"
echo ""
echo "   Controles:"
echo "   - W/S o ↑/↓: Mover pala"
echo "   - Space: Iniciar/Pausar"
echo "   - Esc: Menú"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏳ JUEGOS QUE REQUIEREN COMPILACIÓN LOCAL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌲 Recta Provincia v2.2"
echo "   - Aventura Mapuche procedural"
echo "   - Combate lanza bola Mapuche"
echo "   - Quests Mapuche (relatos, sitios sagrados)"
echo ""
echo "🏙️ Delitos v2.2"
echo "   - GTA 2D chileno"
echo "   - Sistema notoriedad (5 niveles)"
echo "   - 5 distritos urbanos"
echo "   - IA policía perseguidora"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 ESTADO DE SERVICIOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar servidor de juegos
if ps aux | grep -q "python3 -m http.server 8084"; then
    echo -e "${GREEN}✅ Servidor de juegos activo${NC} (puerto 8084)"
else
    echo -e "${YELLOW}⚠️  Servidor de juegos inactivo${NC}"
fi

# Verificar túnel de juegos
if ps aux | grep -q "cloudflared.*8084"; then
    TUNNEL_PID=$(ps aux | grep "cloudflared.*8084" | grep -v grep | awk '{print $2}')
    echo -e "${GREEN}✅ Túnel Cloudflare activo${NC} (PID: $TUNNEL_PID)"
    echo "   URL: $GAMES_URL"
else
    echo -e "${YELLOW}⚠️  Túnel Cloudflare inactivo${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 COMANDOS ÚTILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Ver estado de túneles:"
echo "  ps aux | grep cloudflared"
echo ""
echo "Ver logs del túnel de juegos:"
echo "  tail -f /home/pi/.openclaw/workspace/logs/games-tunnel.log"
echo ""
echo "Reiniciar túnel de juegos:"
echo "  pkill -f 'cloudflared.*8084'"
echo "  nohup cloudflared tunnel --url http://localhost:8084 > logs/games-tunnel.log 2>&1 &"
echo ""
echo "Compilar juegos Raylib:"
echo "  cd /home/pi/.openclaw/workspace/scripts"
echo "  ./build-raylib-games.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 ABRIR ENLACES EN EL NAVEGADOR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Para abrir los enlaces automáticamente:"
echo ""
echo "  # En Linux (xdg-open)"
echo "  xdg-open $GAMES_URL"
echo ""
echo "  # En macOS (open)"
echo "  open $GAMES_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🎮 ¡Listo para jugar Elemental Pong!${NC}"
echo ""
