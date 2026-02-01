#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
#  BACKUP COMPLETO DEL SERVIDOR
#  Incluye: Docker, Configs, Datos, y imagen del sistema
# ═══════════════════════════════════════════════════════════════════════════

BACKUP_DIR="/home/pi/backups/full"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/backup_$DATE.log"

mkdir -p "$BACKUP_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🚀 INICIANDO BACKUP COMPLETO"

# 1. Backup de Docker volumes
log "📦 Volúmenes Docker..."
docker run --rm -v portainer_data:/data -v "$BACKUP_DIR":/backup alpine tar czf "/backup/docker_portainer_$DATE.tar.gz" -C /data . 2>/dev/null
docker run --rm -v netdata_lib:/data -v "$BACKUP_DIR":/backup alpine tar czf "/backup/docker_netdata_$DATE.tar.gz" -C /data . 2>/dev/null
log "✅ Docker volumes respaldados"

# 2. Backup de workspace
log "📁 Workspace..."
tar -czf "$BACKUP_DIR/workspace_$DATE.tar.gz" -C /home/pi/.openclaw/workspace . --exclude=node_modules --exclude=.git 2>/dev/null
log "✅ Workspace respaldado"

# 3. Backup de Docker Compose
log "🐳 Docker configs..."
cp ~/.openclaw/workspace/services/docker-compose.yml "$BACKUP_DIR/" 2>/dev/null
log "✅ Docker configs respaldados"

# 4. Backup de configuraciones del sistema
log "⚙️ Configuraciones..."
cp -r ~/.openclaw/workspace/.gitconfig "$BACKUP_DIR/" 2>/dev/null
cp ~/.ssh/authorized_keys "$BACKUP_DIR/" 2>/dev/null
log "✅ Configuraciones respaldadas"

# 5. Backup de la base de datos de leads
log "🗄️ Base de datos leads..."
cp ~/.openclaw/workspace/projects/polab/db/leads.db "$BACKUP_DIR/" 2>/dev/null
log "✅ Database respaldado"

# 6. Listar archivos
log "📂 Archivos de backup:"
ls -lh "$BACKUP_DIR"/*$DATE* 2>/dev/null | awk '{print $5, $9}'

# 7. Calcular tamaño total
SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
log "💾 Tamaño total: $SIZE"

# 8. Limpiar backups antiguos (más de 7 días)
find "$BACKUP_DIR" -name "*tar.gz" -mtime +7 -delete 2>/dev/null
find "$BACKUP_DIR" -name "*.log" -mtime +7 -delete 2>/dev/null
log "🧹 Limpieza de backups antiguos completada"

log "✅ BACKUP COMPLETO TERMINADO"
echo ""
echo "📂 Ubicación: $BACKUP_DIR"
echo "📅 Fecha: $DATE"
