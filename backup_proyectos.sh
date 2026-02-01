#!/bin/bash
# Script de Backup - Proyectos de Videojuegos
# ===========================================
# Uso: ./backup_proyectos.sh

BACKUP_DIR="/home/pi/.openclaw/backups"
DATE=$(date +%Y-%m-%d_%H-%M)

mkdir -p "$BACKUP_DIR"

echo "🗃️  Backup de proyectos - $DATE"
echo "================================"

# Juegos
echo ""
echo "🎮 Respaldo de juegos..."
tar -czf "$BACKUP_DIR/games_$DATE.tar.gz" \
    projects/gaming/elemental-pong/ \
    projects/gaming/recta-provincia/ \
    2>/dev/null && echo "  ✅ games_$DATE.tar.gz"

# DELITOS
echo ""
echo "📚 Respaldo de DELITOS..."
tar -czf "$BACKUP_DIR/delitos_$DATE.tar.gz" \
    projects/polab/videojuegos/delitos/ \
    2>/dev/null && echo "  ✅ delitos_$DATE.tar.gz"

# Documentación
echo ""
echo "📖 Respaldo de documentación..."
tar -czf "$BACKUP_DIR/docs_$DATE.tar.gz" \
    memory/ \
    PROYECTOS_MEJORAS.md \
    2>/dev/null && echo "  ✅ docs_$DATE.tar.gz"

# AI Stack
echo ""
echo "🧠 Respaldo de AI Stack..."
tar -czf "$BACKUP_DIR/ai_stack_$DATE.tar.gz" \
    ai_modules/ \
    Polab/ \
    2>/dev/null && echo "  ✅ ai_stack_$DATE.tar.gz"

# Dashboards
echo ""
echo "📊 Respaldo de dashboards..."
tar -czf "$BACKUP_DIR/dashboards_$DATE.tar.gz" \
    DASHBOARD.html \
    2>/dev/null && echo "  ✅ dashboards_$DATE.tar.gz"

# Mantener solo los últimos 5 backups
echo ""
echo "🧹 Limpiando backups antiguos..."
ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm -f

echo ""
echo "✅ Backup completado!"
echo "📁 Ubicación: $BACKUP_DIR"
echo "📦 Backups disponibles:"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -5
