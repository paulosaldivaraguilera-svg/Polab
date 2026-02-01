#!/bin/bash
# ============================================
# AUTOMATIZACIÓN DIARIA - La Unidad
# Cron: 0 6 * * * (6:00 AM cada día)
# ============================================

cd /home/pi/.openclaw/workspace/projects/polab/la-unidad

echo "========================================"
echo "📰 PAUTA DIARIA - La Unidad"
echo "Fecha: $(date '+%Y-%m-%d %H:%M')"
echo "========================================"

# 1. Ejecutar monitoreo
echo ""
echo "1️⃣ Ejecutando monitoreo de fuentes..."
python3 pauta/monitor_v2.py > /tmp/monitor.log 2>&1

# 2. Verificar si hay reporte nuevo
FECHA=$(date +%Y-%m-%d)
REPORTE="pauta/reporte_${FECHA}.html"

if [ -f "$REPORTE" ]; then
    echo ""
    echo "2️⃣ Reporte generado exitosamente"
    echo "   Archivo: $REPORTE"
    
    # 3. Git commit y push
    echo ""
    echo "3️⃣ Actualizando repositorio..."
    git add $REPORTE
    git commit -m "Pauta automática $(date '+%Y-%m-%d %H:%M')" 2>/dev/null
    git push origin main 2>/dev/null || echo "   (Sin cambios que empujar)"
    
    echo ""
    echo "✅ TODO COMPLETADO"
else
    echo ""
    echo "❌ Error: No se generó el reporte"
    cat /tmp/monitor.log
fi

echo ""
echo "========================================"
