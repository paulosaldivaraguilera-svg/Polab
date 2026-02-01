#!/bin/bash
# Backup Automático - polab
# Objetivo: Respaldo de datos importantes

BACKUP_DIR="/home/pi/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "📦 Iniciando backup: $DATE"

# 1. Backup de Docker volumes
echo "💾 Volúmenes Docker..."
docker run --rm -v portainer_data:/data -v "$BACKUP_DIR":/backup alpine tar czf "/backup/portainer_$DATE.tar.gz" -C /data .
docker run --rm -v netdata_lib:/data -v "$BACKUP_DIR":/backup alpine tar czf "/backup/netdata_$DATE.tar.gz" -C /data .

# 2. Backup de workspace
echo "📁 Workspace..."
tar czf "$BACKUP_DIR/workspace_$DATE.tar.gz" -C /home/pi/.openclaw/workspace .

# 3. Backup de configs SSH
echo "🔑 SSH Config..."
tar czf "$BACKUP_DIR/ssh_$DATE.tar.gz" -C /home/pi/.ssh .

# Limpieza: mantener solo últimos 7 días
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup completo: $DATE"
echo "📂 Ubicación: $BACKUP_DIR"
ls -lh "$BACKUP_DIR" | tail -5
