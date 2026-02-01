#!/bin/bash
# Backup semanal mejorado - POLAB

BACKUP_DIR="/home/pi/.openclaw/backups/weekly"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_NAME="polab_weekly_${DATE}"

echo "📦 Iniciando backup semanal..."

# Crear directorio
mkdir -p "$BACKUP_DIR"

# Backup de Docker volumes
echo "🐳 Backup de Docker volumes..."
docker run --rm -v polab_data:/data -v ~/.openclaw/workspace:/workspace alpine tar czf - /data /workspace 2>/dev/null | \
    gzip > "$BACKUP_DIR/${BACKUP_NAME}_docker.tar.gz" || echo "   ⚠️ Docker volume backup failed"

# Backup de configuraciones
echo "⚙️ Backup de configuraciones..."
tar czf "$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz" \
    ~/.openclaw/workspace/projects/polab/config/ \
    ~/.openclaw/config/ \
    ~/.config/moltbook/ 2>/dev/null || echo "   ⚠️ Config backup failed"

# Backup de base de datos
echo "🗄️ Backup de base de datos..."
cp ~/.openclaw/workspace/projects/polab/db/leads.db "$BACKUP_DIR/${BACKUP_NAME}_leads.db" 2>/dev/null || echo "   ⚠️ DB backup failed"

# Limpiar backups antiguos (más de 4 semanas)
echo "🧹 Limpiando backups antiguos..."
find "$BACKUP_DIR" -name "polab_weekly_*.tar.gz" -mtime +28 -delete
find "$BACKUP_DIR" -name "polab_weekly_*.db" -mtime +28 -delete

# Métricas
SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
FILES=$(ls -1 "$BACKUP_DIR" 2>/dev/null | wc -l)

echo ""
echo "✅ Backup semanal completado"
echo "   📁 Directorio: $BACKUP_DIR"
echo "   📊 Tamaño: $SIZE"
echo "   📄 Archivos: $FILES"
echo "   🗓️ Fecha: $DATE"

# Notificar si está configurado
if command -v curl &> /dev/null; then
    curl -s "http://localhost:8082/metric/backup_weekly" \
        -X POST -H "Content-Type: application/json" \
        -d "{\"status\": \"completed\", \"size\": \"$SIZE\", \"files\": $FILES}" 2>/dev/null || true
fi
