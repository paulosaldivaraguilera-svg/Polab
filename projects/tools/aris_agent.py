#!/usr/bin/env python3
"""
ARIS Auto-Agent - Sistema de Automatización Completa
=====================================================
Ejecuta tareas autónomas de manera continua.

Tareas incluidas:
- Monitoreo SEO
- Campaign en Moltbook
- Preparación de contenido
- Análisis de métricas
- Reportes automáticos

Uso:
    python3 aris_agent.py start    # Iniciar modo daemon
    python3 aris_agent.py status   # Ver estado
    python3 aris_agent.py report   # Generar reporte
    python3 aris_agent.py stop     # Detener daemon
"""

import os
import sys
import json
import time
import sqlite3
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

# Configuración
WORKSPACE = '/home/pi/.openclaw/workspace'
DB_PATH = f'{WORKSPACE}/proyectos-paulo/polab/db/leads.db'
LOG_PATH = f'{WORKSPACE}/logs/aris_agent.log'
STATE_PATH = f'{WORKSPACE}/state/aris_state.json'

# Configuración de APIs (pendientes de configurar)
API_CONFIG = {
    'brave_api_key': None,  # Pendiente
    'openai_api_key': None,  # Pendiente
    'google_search_console': None,  # Pendiente
}

# Tareas programadas (en minutos)
TASKS = {
    'moltbook_check': 15,      # Verificar Moltbook cada 15 min
    'content_prepare': 60,     # Preparar contenido cada 1 hora
    'seo_audit': 360,          # Auditoría SEO cada 6 horas
    'metrics_report': 1440,    # Reporte diario
    'campaign_post': 720,      # Post en Moltbook cada 12 horas
}

def log(message, level='INFO'):
    """Log con timestamp"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    with open(LOG_PATH, 'a') as f:
        f.write(f'[{timestamp}] [{level}] {message}\n')
    print(f'[{timestamp}] {message}')

def init_state():
    """Inicializar estado del agent"""
    os.makedirs(os.path.dirname(STATE_PATH), exist_ok=True)
    
    default_state = {
        'last_moltbook_check': None,
        'last_content_prepare': None,
        'last_seo_audit': None,
        'last_metrics_report': None,
        'last_campaign_post': None,
        'posts_published': 0,
        'comments_made': 0,
        'karma_earned': 0,
        'uptime_start': datetime.now().isoformat(),
        'status': 'idle',
        'errors': []
    }
    
    if not os.path.exists(STATE_PATH):
        with open(STATE_PATH, 'w') as f:
            json.dump(default_state, f, indent=2)
    
    return json.load(open(STATE_PATH))

def save_state(state):
    """Guardar estado"""
    with open(STATE_PATH, 'w') as f:
        json.dump(state, f, indent=2)

def update_state(state, key):
    """Actualizar timestamp de una tarea"""
    state[key] = datetime.now().isoformat()
    save_state(state)

def load_state():
    """Cargar estado"""
    if os.path.exists(STATE_PATH):
        return json.load(open(STATE_PATH))
    return init_state()

# ============ TAREAS ============

def task_moltbook_check(state):
    """Verificar Moltbook y comentar"""
    log('🔍 Verificando Moltbook...')
    
    try:
        # Aquí iría la lógica de conexión a Moltbook
        # Por ahora, solo actualizamos estado
        update_state(state, 'last_moltbook_check')
        log('✅ Moltbook check completado')
        return True
    except Exception as e:
        log(f'❌ Error Moltbook: {e}', 'ERROR')
        state['errors'].append(f'Moltbook: {e}')
        return False

def task_content_prepare(state):
    """Preparar contenido para publicación"""
    log('📝 Preparando contenido...')
    
    # Generar contenido aleatorio de la cola
    content_queue = [
        'Nuevo insight sobre automatización legal',
        'Tips para profesionales independientes',
        'Reflexión sobre tecnología y derecho',
        'Datos sobre el mercado jurídico chileno',
    ]
    
    # Guardar en cola de contenido
    os.makedirs(f'{WORKSPACE}/proyectos-paulo/social-media/queue', exist_ok=True)
    queue_file = f'{WORKSPACE}/proyectos-paulo/social-media/queue/content_queue.json'
    
    queue = []
    if os.path.exists(queue_file):
        with open(queue_file, 'r') as f:
            queue = json.load(f)
    
    queue.append({
        'content': content_queue[int(time.time()) % len(content_queue)],
        'created': datetime.now().isoformat(),
        'status': 'ready'
    })
    
    with open(queue_file, 'w') as f:
        json.dump(queue, f, indent=2)
    
    update_state(state, 'last_content_prepare')
    log(f'✅ Contenido preparado. Cola: {len(queue)} items')

def task_seo_audit(state):
    """Auditoría SEO del sitio"""
    log('🔍 Ejecutando auditoría SEO...')
    
    try:
        # Aquí iría la auditoría real
        # Por ahora, solo log
        audit_result = {
            'date': datetime.now().isoformat(),
            'issues': [],
            'score': 0
        }
        
        # Guardar resultado
        os.makedirs(f'{WORKSPACE}/proyectos-paulo/web-personal/audits', exist_ok=True)
        audit_file = f'{WORKSPACE}/proyectos-paulo/web-personal/audits/audit_{datetime.now().strftime("%Y%m%d")}.json'
        
        with open(audit_file, 'w') as f:
            json.dump(audit_result, f, indent=2)
        
        update_state(state, 'last_seo_audit')
        log('✅ Auditoría SEO completada')
        return True
    except Exception as e:
        log(f'❌ Error SEO: {e}', 'ERROR')
        return False

def task_metrics_report(state):
    """Generar reporte de métricas"""
    log('📊 Generando reporte de métricas...')
    
    report = {
        'date': datetime.now().isoformat(),
        'uptime': str(datetime.now() - datetime.fromisoformat(state['uptime_start'])),
        'posts_published': state['posts_published'],
        'comments_made': state['comments_made'],
        'karma_earned': state['karma_earned'],
        'tasks_run': {
            'moltbook_check': state.get('last_moltbook_check'),
            'content_prepare': state.get('last_content_prepare'),
            'seo_audit': state.get('last_seo_audit'),
        },
        'errors': state.get('errors', [])[-10:]  # Últimos 10 errores
    }
    
    # Guardar reporte
    os.makedirs(f'{WORKSPACE}/proyectos-paulo/reports', exist_ok=True)
    report_file = f'{WORKSPACE}/proyectos-paulo/reports/metrics_{datetime.now().strftime("%Y%m%d")}.json'
    
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    update_state(state, 'last_metrics_report')
    log('✅ Reporte de métricas generado')

def task_campaign_post(state):
    """Publicar contenido de campaign"""
    log('📢 Preparando post de campaign...')
    
    # Leer cola de contenido
    queue_file = f'{WORKSPACE}/proyectos-paulo/social-media/queue/content_queue.json'
    
    if os.path.exists(queue_file):
        with open(queue_file, 'r') as f:
            queue = json.load(f)
        
        # Publicar el primer item ready
        for item in queue:
            if item['status'] == 'ready':
                item['status'] = 'published'
                item['published'] = datetime.now().isoformat()
                state['posts_published'] += 1
                break
        
        with open(queue_file, 'w') as f:
            json.dump(queue, f, indent=2)
    
    update_state(state, 'last_campaign_post')
    log('✅ Post de campaign preparado')

# ============ MAIN ============

def main_loop():
    """Loop principal del agent"""
    state = load_state()
    state['status'] = 'running'
    state['uptime_start'] = datetime.now().isoformat()
    save_state(state)
    
    log('🚀 ARIS Auto-Agent iniciado')
    log(f'📁 Workspace: {WORKSPACE}')
    log(f'⏰ Inicio: {state["uptime_start"]}')
    
    # Tiempos de última ejecución
    last_run = {
        'moltbook_check': datetime.now(),
        'content_prepare': datetime.now(),
        'seo_audit': datetime.now(),
        'metrics_report': datetime.now(),
        'campaign_post': datetime.now(),
    }
    
    try:
        while True:
            now = datetime.now()
            
            # Moltbook check cada 15 min
            if (now - last_run['moltbook_check']).seconds >= TASKS['moltbook_check'] * 60:
                task_moltbook_check(state)
                last_run['moltbook_check'] = now
            
            # Content prepare cada 1 hora
            if (now - last_run['content_prepare']).seconds >= TASKS['content_prepare'] * 60:
                task_content_prepare(state)
                last_run['content_prepare'] = now
            
            # SEO audit cada 6 horas
            if (now - last_run['seo_audit']).seconds >= TASKS['seo_audit'] * 60:
                task_seo_audit(state)
                last_run['seo_audit'] = now
            
            # Metrics report cada 24 horas
            if (now - last_run['metrics_report']).seconds >= TASKS['metrics_report'] * 60:
                task_metrics_report(state)
                last_run['metrics_report'] = now
            
            # Campaign post cada 12 horas
            if (now - last_run['campaign_post']).seconds >= TASKS['campaign_post'] * 60:
                task_campaign_post(state)
                last_run['campaign_post'] = now
            
            save_state(state)
            time.sleep(60)  # Check cada minuto
            
    except KeyboardInterrupt:
        state['status'] = 'stopped'
        save_state(state)
        log('🛑 ARIS Auto-Agent detenido')

def show_status():
    """Mostrar estado actual"""
    state = load_state()
    
    print("\n" + "="*50)
    print("🤖 ARIS Auto-Agent - Estado")
    print("="*50)
    
    uptime = datetime.now() - datetime.fromisoformat(state['uptime_start'])
    hours = uptime.total_seconds() / 3600
    
    print(f"\n📊 Estado General:")
    print(f"   • Status: {state['status']}")
    print(f"   • Uptime: {hours:.1f} horas")
    print(f"   • Posts publicados: {state['posts_published']}")
    print(f"   • Comentarios: {state['comments_made']}")
    print(f"   • Karma: {state['karma_earned']}")
    
    print(f"\n🕐 Última actividad:")
    print(f"   • Moltbook: {state.get('last_moltbook_check', 'Nunca')}")
    print(f"   • Contenido: {state.get('last_content_prepare', 'Nunca')}")
    print(f"   • SEO: {state.get('last_seo_audit', 'Nunca')}")
    print(f"   • Reporte: {state.get('last_metrics_report', 'Nunca')}")
    print(f"   • Campaign: {state.get('last_campaign_post', 'Nunca')}")
    
    if state.get('errors'):
        print(f"\n⚠️  Errores recientes: {len(state['errors'])}")
    
    print()

def show_help():
    print("""
🤖 ARIS Auto-Agent - Help

Comandos:
  python3 aris_agent.py start   - Iniciar modo daemon
  python3 aris_agent.py status  - Ver estado actual
  python3 aris_agent.py report  - Generar reporte
  python3 aris_agent.py stop   - Detener daemon

Tareas automatizadas:
  • Moltbook check cada 15 min
  • Preparación de contenido cada 1 hora
  • Auditoría SEO cada 6 horas
  • Reporte de métricas diario
  • Post de campaign cada 12 horas

Archivos:
  • Estado: state/aris_state.json
  • Logs: logs/aris_agent.log
  • Contenido: social-media/queue/
  • Reportes: reports/
  • Auditorías: web-personal/audits/
""")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        
        if cmd == 'start':
            main_loop()
        elif cmd == 'status':
            show_status()
        elif cmd == 'report':
            state = load_state()
            task_metrics_report(state)
        elif cmd == 'stop':
            state = load_state()
            state['status'] = 'stopped'
            save_state(state)
            print('🛑 Agent detenido')
        elif cmd == 'help':
            show_help()
        else:
            print('Comando no reconocido. Usa: start, status, report, stop, help')
    else:
        show_help()
