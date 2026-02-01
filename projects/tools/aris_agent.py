#!/usr/bin/env python3
"""
ARIS Auto-Agent - Sistema de Automatización
=============================================
Agent simple que ejecuta tareas automáticamente.

Funciones:
- Monitoreo de servicios
- Verificación de leads
- Reportes automáticos
- Auto-sync con GitHub

Uso:
    python3 aris_agent.py start    # Iniciar daemon
    python3 aris_agent.py status   # Ver estado
    python3 aris_agent.py report   # Generar reporte
    python3 aris_agent.py check    # Verificar servicios
    python3 aris_agent.py stop     # Detener
"""

import os
import sys
import json
import time
import subprocess
import requests
from datetime import datetime, timedelta
from pathlib import Path

# Configuración
WORKSPACE = '/home/pi/.openclaw/workspace'
STATE_PATH = f'{WORKSPACE}/state/aris_agent.json'
LOG_PATH = f'{WORKSPACE}/logs/aris_agent.log'
LEADS_API = 'http://localhost:8081'
METRICS_API = 'http://localhost:8082'

def log(message, level='INFO'):
    """Log con timestamp"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    with open(LOG_PATH, 'a') as f:
        f.write(f'[{timestamp}] [{level}] {message}\n')
    print(f'[{timestamp}] {message}')

def get_state():
    """Obtener estado"""
    if os.path.exists(STATE_PATH):
        with open(STATE_PATH, 'r') as f:
            return json.load(f)
    return {'status': 'stopped', 'start_time': None, 'checks': 0}

def save_state(state):
    """Guardar estado"""
    with open(STATE_PATH, 'w') as f:
        json.dump(state, f, indent=2)

def check_services():
    """Verificar servicios del sistema"""
    results = {'services': {}, 'timestamp': datetime.now().isoformat()}
    
    # Web Server
    web = subprocess.run(['pgrep', '-f', 'python3 -m http.server 8080'], capture_output=True).returncode == 0
    results['services']['web'] = web
    
    # API Leads
    try:
        api_leads = requests.get(f'{LEADS_API}/health', timeout=2).status_code == 200
    except:
        api_leads = False
    results['services']['api_leads'] = api_leads
    
    # API Metrics
    try:
        api_metrics = requests.get(f'{METRICS_API}/health', timeout=2).status_code == 200
    except:
        api_metrics = False
    results['services']['api_metrics'] = api_metrics
    
    # Docker
    docker = subprocess.run(['docker', 'ps'], capture_output=True).returncode == 0
    results['services']['docker'] = docker
    
    results['all_up'] = all(results['services'].values())
    return results

def get_leads_stats():
    """Obtener estadísticas de leads"""
    try:
        r = requests.get(f'{LEADS_API}/api/stats', timeout=5)
        return r.json()
    except:
        return {'total': 0, 'nuevos': 0}

def get_system_metrics():
    """Obtener métricas del sistema"""
    try:
        r = requests.get(f'{METRICS_API}/api/metrics', timeout=5)
        return r.json()
    except:
        return {'cpu': '0', 'memory_percent': '0'}

def generate_report():
    """Generar reporte"""
    services = check_services()
    leads = get_leads_stats()
    metrics = get_system_metrics()
    
    report = f"""
╔══════════════════════════════════════════════════════════════════╗
║                    ARIS AGENT - REPORTE                          ║
╚══════════════════════════════════════════════════════════════════╝

📅 Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

🔧 SERVICIOS: {'✅ TODOS UP' if services['all_up'] else '❌ ALGUNOS CAÍDOS'}
"""
    
    for svc, up in services['services'].items():
        status = '✅' if up else '❌'
        report += f"   {status} {svc.upper()}\n"
    
    report += f"""
🎯 LEADS
   Total: {leads.get('total', 0)}
   Nuevos: {leads.get('nuevos', 0)}

💻 SISTEMA
   CPU: {metrics.get('cpu', 'N/A')}%
   RAM: {metrics.get('memory_percent', 'N/A')}%
   Disco: {metrics.get('disk_percent', 'N/A')}%
"""
    return report

def run_daemon():
    """Modo daemon"""
    state = get_state()
    state['status'] = 'running'
    state['start_time'] = datetime.now().isoformat()
    save_state(state)
    
    log("ARIS Agent iniciado en modo daemon")
    
    while True:
        try:
            state = get_state()
            if state['status'] != 'running':
                break
            
            # Verificar servicios
            services = check_services()
            state['checks'] += 1
            state['last_check'] = datetime.now().isoformat()
            
            if not services['all_up']:
                log("SERVICIOS CAÍDOS DETECTADOS", 'WARNING')
                # Aquí se podrían agregar notificaciones
            
            save_state(state)
            
            time.sleep(300)  # 5 minutos
            
        except Exception as e:
            log(f"Error en daemon: {e}", 'ERROR')
            time.sleep(60)

def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'status'
    
    if cmd == 'start':
        run_daemon()
    elif cmd == 'stop':
        state = get_state()
        state['status'] = 'stopped'
        save_state(state)
        log("Agent detenido")
    elif cmd == 'status':
        state = get_state()
        print(f"Estado: {state.get('status', 'unknown')}")
        print(f"Iniciado: {state.get('start_time', 'nunca')}")
        print(f"Checks: {state.get('checks', 0)}")
    elif cmd == 'check':
        result = check_services()
        print(json.dumps(result, indent=2))
    elif cmd == 'report':
        print(generate_report())
    else:
        print("Uso: aris_agent.py [start|stop|status|check|report]")

if __name__ == '__main__':
    main()
