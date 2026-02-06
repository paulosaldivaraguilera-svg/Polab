#!/bin/bash
# Deploy script para paulosaldivar.cl

PORT=8083
PID_FILE="/tmp/pauloserver.pid"
LOG_FILE="/tmp/pauloserver.log"

start() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo "✅ Servidor ya ejecutando (PID: $PID) en puerto $PORT"
            return 0
        else
            rm "$PID_FILE"
        fi
    fi

    echo "🚀 Iniciando servidor en puerto $PORT..."
    
    # Usar Python simple HTTP server
    nohup python3 -m http.server $PORT > "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    
    sleep 2
    
    if ps -p $PID > /dev/null 2>&1; then
        echo "✅ Servidor iniciado (PID: $PID)"
        echo "📂 URL Local: http://localhost:$PORT"
        echo ""
        echo "🌐 Para acceso público, crea un Cloudflare Tunnel:"
        echo "   cloudflared tunnel --url http://localhost:$PORT"
        return 0
    else
        echo "❌ Error iniciando servidor"
        rm "$PID_FILE"
        return 1
    fi
}

stop() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo "🛑 Deteniendo servidor (PID: $PID)..."
            kill $PID
            rm "$PID_FILE"
            echo "✅ Servidor detenido"
        else
            echo "⚠️  Servidor no encontrado"
            rm "$PID_FILE"
        fi
    else
        echo "⚠️  PID file no encontrado"
    fi
}

status() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo "✅ Servidor ejecutando"
            echo "📍 PID: $PID"
            echo "🌐 URL: http://localhost:$PORT"
            echo ""
            echo "📊 Uso de recursos:"
            ps -p $PID -o pid,pcpu,pmem,etime,cmd
            return 0
        else
            echo "❌ Servidor no ejecutando (PID file stale)"
            rm "$PID_FILE"
            return 1
        fi
    else
        echo "❌ Servidor no ejecutando"
        return 1
    fi
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        sleep 1
        start
        ;;
    status)
        status
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac

exit $?
