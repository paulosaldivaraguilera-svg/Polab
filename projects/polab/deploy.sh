#!/bin/bash
# Deploy Script - POLAB Landing
# ==============================
# Publica la landing page con un comando

echo "🚀 Deploy POLAB - Comenzar Landing"
echo "=================================="

# Directorios
APP_DIR="/home/pi/.openclaw/workspace/proyectos-paula/polab/comenzar-landing"
DEST_DIR="/var/www/html/comenzar"

# 1. Verificar que existe el código
if [ ! -f "$APP_DIR/App.jsx" ]; then
    echo "❌ Error: No se encontró App.jsx en $APP_DIR"
    exit 1
fi

# 2. Compilar (aquí iría el build de React si fuera necesario)
echo "📦 Preparando archivos..."

# 3. Copiar a destino
if [ -d "$DEST_DIR" ]; then
    echo "📂 Actualizando destino..."
    cp -r $APP_DIR/* $DEST_DIR/
else
    echo "📂 Creando destino..."
    mkdir -p $DEST_DIR
    cp -r $APP_DIR/* $DEST_DIR/
fi

# 4. Git commit
echo "💾 Guardando en git..."
cd /home/pi/.openclaw/workspace
git add proyectos-paulo/polab/comenzar-landing/
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M')" 2>/dev/null || echo "  (sin cambios que commitear)"

# 5. Verificar
echo ""
echo "✅ Deploy completado!"
echo "🌐 Landing disponible en: http://192.168.1.31/comenzar/"
echo ""

# Opcional: restart server si es necesario
# systemctl restart nginx 2>/dev/null || true
