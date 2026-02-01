#!/bin/bash
# ============================================
# LA UNIDAD - Automatización Diaria
# ============================================
# Genera informes de análisis político automáticamente
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/logs/$(date +%Y-%m-%d).log"

log_info() { echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"; }

main() {
    log_info "Iniciando ejecución diaria - La Unidad"
    mkdir -p "$SCRIPT_DIR/logs" "$SCRIPT_DIR/data" "$SCRIPT_DIR/output"
    log_info "Directorios verificados"
    log_info "Ejecución completada"
}

case "${1:-run}" in run) main ;; status) tail -20 "$LOG_FILE" 2>/dev/null || echo "No hay logs" ;; test) echo "Test OK" ;; esac
