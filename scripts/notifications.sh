#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
#  NOTIFICATIONS - Sistema de notificaciones múltiples
# ═══════════════════════════════════════════════════════════════════════════
#  Soporta: Email, Webhook, WhatsApp (OpenClaw)
# ═══════════════════════════════════════════════════════════════════════════

WEBHOOK_URL=""  # Configurar webhook si quiere
EMAIL_TO=""     # Configurar email si quiere

send_notification() {
    local title="$1"
    local message="$2"
    local level="${3:-info}"
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $title: $message"
    
    # Log
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $title: $message" >> ~/.openclaw/workspace/logs/notifications.log
    
    # Webhook (si configurado)
    if [ -n "$WEBHOOK_URL" ]; then
        curl -s -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"title\":\"$title\",\"message\":\"$message\",\"level\":\"$level\"}" &
    fi
    
    # Email (si configurado)
    if [ -n "$EMAIL_TO" ]; then
        echo "$message" | mail -s "[POLAB $level] $title" "$EMAIL_TO" 2>/dev/null &
    fi
}

# Notificar nuevo lead
notify_new_lead() {
    local nombre="$1"
    local telefono="$2"
    local servicio="$3"
    
    send_notification "🎯 Nuevo Lead" "$nombre ($telefono) - $servicio" "success"
}

# Notificar alerta
notify_alert() {
    local servicio="$1"
    local estado="$2"
    
    send_notification "⚠️ Alerta de Servicio" "$servicio: $estado" "warning"
}

# Notificar sistema
notify_system() {
    local metric="$1"
    local value="$2"
    
    send_notification "📊 Sistema" "$metric: $value" "info"
}

# Mostrar ayuda
show_help() {
    echo "Usage: notifications.sh [lead|alert|system] [params]"
    echo ""
    echo "Ejemplos:"
    echo "  notifications.sh lead 'Juan' '+56912345678' 'pyme'"
    echo "  notifications.sh alert 'Web Server' 'CAÍDO'"
    echo "  notifications.sh system 'CPU' '85%'"
}

# Main
case "${1:-help}" in
    lead) notify_new_lead "$2" "$3" "$4" ;;
    alert) notify_alert "$2" "$3" ;;
    system) notify_system "$2" "$3" ;;
    *) show_help ;;
esac
