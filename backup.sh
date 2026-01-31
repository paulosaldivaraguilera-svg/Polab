#!/bin/bash
# Backup Automático - Proyectos Paulo
# Ejecutar: crontab -e → 0 3 * * * /home/pi/.openclaw/workspace/backup.sh

BACKUP_DIR="/home/pi/.openclaw/workspace/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Git commit y push automático
cd /home/pi/.openclaw/workspace
git add -A
git commit -m "Backup automático: $DATE" 2>/dev/null
git push origin main 2>/dev/null || echo "No hay cambios que subir"

#zip de proyectos
zip -r "$BACKUP_DIR/proyectos_$DATE.zip" proyectos-paulo/ -q

# Mantener solo últimos 7 backups
ls -t $BACKUP_DIR/proyectos_*.zip | tail -n +8 | xargs -r rm

echo "✅ Backup completado: $DATE"
