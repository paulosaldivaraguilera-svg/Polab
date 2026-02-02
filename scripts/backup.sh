#!/bin/bash
# PauloARIS Auto-Backup Script
# Ejecutar diariamente via cron (ej: 3 AM)

BACKUP_DIR="/home/pi/.openclaw/backups"
REPO_DIR="/home/pi/.openclaw/workspace"
DATE=$(date '+%Y-%m-%d_%H-%M-%S')
LOG_FILE="$BACKUP_DIR/backup.log"

mkdir -p "$BACKUP_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========================================="
log "PauloARIS Auto-Backup Started: $DATE"
log "========================================="

# Crear backup de archivos críticos
cd "$REPO_DIR"

# Excluir archivos grandes que no son esenciales
EXCLUDE_FILE=$(cat <<EOF
--exclude=node_modules
--exclude=.git
--exclude=logs
--exclude=backups
--exclude=*.log
--exclude=.env
EOF
)

# Crear snapshot con git
log "Creating git snapshot..."
git add -A 2>/dev/null
git commit -m "Auto-backup: $DATE" 2>/dev/null

if [ $? -eq 0 ]; then
    log "✅ Git snapshot created"
else
    log "⚠️ No changes to commit or git error"
fi

# Backup de state critical files
log "Backing up state files..."
tar -czf "$BACKUP_DIR/state_$DATE.tar.gz" \
    -C "$REPO_DIR" \
    state/ \
    2>/dev/null

if [ $? -eq 0 ]; then
    log "✅ State backup: state_$DATE.tar.gz"
else
    log "❌ State backup failed"
fi

# Backup de config
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
    -C "$REPO_DIR" \
    --exclude=node_modules \
    *.md \
    *.json \
    2>/dev/null

if [ $? -eq 0 ]; then
    log "✅ Config backup: config_$DATE.tar.gz"
fi

# Limpiar backups antiguos (mantener últimos 7 días)
log "Cleaning old backups (keeping last 7 days)..."
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete 2>/dev/null

# Calcular tamaño total
SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "Total backup size: $SIZE"

# Contar snapshots
SNAPSHOTS=$(git rev-list --count --all 2>/dev/null || echo "N/A")
log "Total git snapshots: $SNAPSHOTS"

log "========================================="
log "Backup completed successfully"
log "========================================="

# Notificar si hay cambios significativos
NEW_FILES=$(git status --short 2>/dev/null | wc -l)
if [ "$NEW_FILES" -gt 10 ]; then
    log "⚠️ High activity: $NEW_FILES new/modified files"
fi
