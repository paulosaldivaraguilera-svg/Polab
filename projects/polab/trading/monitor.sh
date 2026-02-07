#!/bin/bash
# Script de Monitoreo de Trading Bot

BOT_DIR="/home/pi/.openclaw/workspace/projects/polab/trading"
LOG_FILE="$BOT_DIR/logs/trading-bot.log"
STATUS_FILE="$BOT_DIR/state/trading-bot-status.json"

echo "🤖 TRADING BOT MONITOR"
echo "======================"
echo ""

# Verificar si el bot está corriendo
if ps aux | grep -q "[m]arket_maker.py"; then
    echo "✅ Bot está corriendo"
    
    # Mostrar últimos logs
    echo ""
    echo "📊 Última actividad:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tail -5 "$LOG_FILE" | grep "INFO"
    
    # Mostrar estado si existe
    if [ -f "$STATUS_FILE" ]; then
        echo ""
        echo "📈 Estado actual:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        cat "$STATUS_FILE"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 Ver logs completos:"
    echo "   tail -f $LOG_FILE"
    echo ""
    
else
    echo "❌ Bot NO está corriendo"
    echo ""
    echo "Para iniciar:"
    echo "   cd $BOT_DIR"
    echo "   nohup python3 market_maker.py > logs/trading-bot.log 2>&1 &"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
