#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
#  RESTORE COMPLETO DEL SERVIDOR
#  Restaura todo desde el último backup
# ═══════════════════════════════════════════════════════════════════════════

BACKUP_DIR="/home/pi/backups/full"
DATE=$(ls -1t "$BACKUP_DIR"/*workspace*.tar.gz 2>/dev/null | head -1 | grep -oE '[0-9]{8}_[0-9]{6}')

if [ -z "$DATE" ]; then
    echo "❌ No se encontró backup reciente"
    exit 1
fi

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                    RESTORE DEL SERVIDOR                                ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📅 Backup a restaurar: $DATE"
echo ""

read -p "¿Continuar? (s/n): " confirm
if [ "$confirm" != "s" ]; then
    echo "Cancelado"
    exit 0
fi

echo ""
echo "🐳 Restaurando Docker volumes..."
docker run --rm -v portainer_data:/data -v "$BACKUP_DIR":/backup alpine sh -c "tar xzf /backup/docker_portainer_$DATE.tar.gz -C /" 2>/dev/null
docker run --rm -v netdata_lib:/data -v "$BACKUP_DIR":/backup alpine sh -c "tar xzf /backup/docker_netdata_$DATE.tar.gz -C /" 2>/dev/null
echo "✅ Docker volumes restaurados"

echo ""
echo "📁 Restaurando workspace..."
tar -xzf "$BACKUP_DIR/workspace_$DATE.tar.gz" -C /home/pi/.openclaw/workspace/ 2>/dev/null
echo "✅ Workspace restaurado"

echo ""
echo "🗄️ Restaurando base de datos..."
cp "$BACKUP_DIR/leads_$DATE.db" ~/.openclaw/workspace/projects/polab/db/leads.db 2>/dev/null
echo "✅ Database restaurado"

echo ""
echo "⚙️ Restaurando configuraciones..."
cp "$BACKUP_DIR/.gitconfig" ~/.gitconfig 2>/dev/null
echo "✅ Configuraciones restauradas"

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ RESTORE COMPLETADO                               ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Reiniciar servicios: cd ~/.openclaw/workspace/services && docker compose restart"
echo "   2. Verificar: ~/.openclaw/workspace/projects/personal/comenzar-landing/deploy.sh status"
echo ""
