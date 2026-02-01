#!/usr/bin/env python3
"""
ARIS Auto-Agent v2.0 - Sistema de Automatización Completa
===========================================================
Agent autónomo con monitoreo, reportes y auto-reparación.

Funciones:
- Monitoreo de servicios (web, api, docker, tunnel)
- Verificación de recursos (CPU, RAM, Disco)
- Generación de reportes
- Auto-reparación de servicios caídos
- Integración con APIs existentes

Uso:
    python3 aris_agent.py start    # Iniciar daemon
    python3 aris_agent.py stop     # Detener
    python3 aris_agent.py status   # Ver estado
    python3 aris_agent.py report   # Generar reporte
    python3 aris_agent.py check    # Verificar servicios
    python3 aris_agent.py fix      # Reparar servicios
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

# Colores para output
GREEN = '\033[0;32m'
RED = '\033[0;31m'
YELLOW = '\033[1;33m'
BLUE = '\033[0;34m'
NC = '\033[0m'

def log(message, level='INFO'):
    """Log con timestamp y colores"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    color = {'INFO': BLUE, 'WARNING': YELLOW, 'ERROR': RED, 'SUCCESS': GREEN}.get(level, NC)
    log_line = f"[{timestamp}] [{level}] {message}"
    
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    with open(LOG_PATH, 'a') as f:
        f.write(log_line + '\n')
    
    print(f"{color}[{timestamp}] [{level}] {message}{NC}")

def get_state():
    """Obtener estado del agent"""
    if os.path.exists(STATE_PATH):
        with open(STATE_PATH, 'r') as f:
            return json.load(f)
    return {
        'status': 'stopped', 
        'start_time': None, 
        'checks': 0,
        'fixes': 0,
        'errors': []
    }

def save_state(state):
    """Guardar estado del agent"""
    with open(STATE_PATH, 'w') as f:
        json.dump(state, f, indent=2)

def check_services():
    """Verificar todos los servicios del sistema"""
    results = {
        'timestamp': datetime.now().isoformat(),
        'services': {},
        'all_up': True
    }
    
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
    
    # Cloudflare Tunnel
    tunnel = subprocess.run(['pgrep', '-f', 'cloudflared'], capture_output=True).returncode == 0
    results['services']['tunnel'] = tunnel
    
    # Docker
    try:
        docker = subprocess.run(['docker', 'ps'], capture_output=True, stderr=subprocess.DEVNULL).returncode == 0
    except:
        docker = False
    results['services']['docker'] = docker
    
    results['all_up'] = all(results['services'].values())
    return results

def fix_service(service_name):
    """Intentar reparar un servicio específico"""
    log(f"Intentando reparar {service_name}...", 'WARNING')
    
    fix_commands = {
        'web': [
            ('cd ~/.openclaw/workspace/projects/personal/comenzar-landing && nohup python3 -m http.server 8080 > /dev/null 2>&1 &', 'Web server'),
        ],
        'api_leads': [
            ('cd ~/.openclaw/workspace/projects/polab && nohup python3 api_server.py > ~/.api_server.log 2>&1 &', 'API Leads'),
        ],
        'tunnel': [
            ('nohup ~/.npm-global/bin/cloudflared tunnel --url http://localhost:8080 > ~/.cloudflared_url.log 2>&1 &', 'Cloudflare Tunnel'),
        ]
    }
    
    if service_name in fix_commands:
        for cmd, name in fix_commands[service_name]:
            try:
                subprocess.run(cmd, shell=True, check=False)
                log(f"✅ {name} reiniciado", 'SUCCESS')
                return True
            except Exception as e:
                log(f"❌ Error reiniciando {name}: {e}", 'ERROR')
                return False
    
    return False

def fix_all_services(services_check):
    """Reparar todos los servicios caídos"""
    fixed = []
    for svc, is_up in services_check['services'].items():
        if not is_up:
            if fix_service(svc):
                fixed.append(svc)
    
    return fixed

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
        return {'cpu': 'N/A', 'memory_percent': 'N/A', 'disk_percent': 'N/A'}

def generate_report():
    """Generar reporte completo del sistema"""
    services = check_services()
    leads = get_leads_stats()
    metrics = get_system_metrics()
    
    report = f"""
╔══════════════════════════════════════════════════════════════════════════╗
║                    ARIS AGENT v2.0 - REPORTE COMPLETO                    ║
╚══════════════════════════════════════════════════════════════════════════╝

📅 Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

🔧 ESTADO DE SERVICIOS: {'✅ TODOS OPERATIVOS' if services['all_up'] else '⚠️ ALGUNOS SERVICIOS CAÍDOS'}
"""
    
    for svc, up in services['services'].items():
        status = '✅' if up else '❌'
        report += f"   {status} {svc.upper().replace('_', ' ')}\n"
    
    report += f"""

🎯 LEADS (API)
   • Total: {leads.get('total', 0)}
   • Nuevos: {leads.get('nuevos', 0)}
   • Contactados: {leads.get('total', 0) - leads.get('nuevos', 0)}

💻 RECURSOS DEL SISTEMA
   • CPU: {metrics.get('cpu', 'N/A')}%
   • RAM: {metrics.get('memory_percent', 'N/A')}%
   • Disco: {metrics.get('disk_percent', 'N/A')}%

🌐 URLs DE ACCESO
   • Landing: https://gerald-internet-brought-discovered.trycloudflare.com
   • Dashboard: .../dashboard.html
   • Analytics: .../analytics.html

📂 ESTADO DEL AGENT
   • Estado: {get_state().get('status', 'unknown')}
   • Checks realizados: {get_state().get('checks', 0)}
   • Reparaciones: {get_state().get('fixes', 0)}

══════════════════════════════════════════════════════════════════════════
"""
    return report

def run_daemon():
    """Modo daemon con auto-reparación"""
    state = get_state()
    state['status'] = 'running'
    state['start_time'] = datetime.now().isoformat()
    save_state(state)
    
    log("🚀 ARIS Agent v2.0 iniciado en modo daemon", 'SUCCESS')
    
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
                log("⚠️ Servicios caídos detectados, intentando reparar...", 'WARNING')
                fixed = fix_all_services(services)
                if fixed:
                    state['fixes'] += len(fixed)
                    log(f"✅ {len(fixed)} servicios reparados: {', '.join(fixed)}", 'SUCCESS')
                else:
                    state['errors'].append({
                        'time': datetime.now().isoformat(),
                        'services': {k: v for k, v in services['services'].items() if not v}
                    })
            
            save_state(state)
            time.sleep(300)  # 5 minutos entre checks
            
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
        log("Agent detenido", 'SUCCESS')
    elif cmd == 'status':
        state = get_state()
        print(f"""
╔══════════════════════════════════════════════════════════════════╗
║                    ARIS AGENT v2.0 - ESTADO                      ║
╚══════════════════════════════════════════════════════════════════╝
   Estado: {state.get('status', 'unknown')}
   Iniciado: {state.get('start_time', 'nunca')}
   Checks: {state.get('checks', 0)}
   Reparaciones: {state.get('fixes', 0)}
   Errores: {len(state.get('errors', []))}
        """)
    elif cmd == 'check':
        result = check_services()
        print(json.dumps(result, indent=2))
    elif cmd == 'fix':
        services = check_services()
        fixed = fix_all_services(services)
        if fixed:
            print(f"✅ Reparados: {', '.join(fixed)}")
        else:
            print("✅ No había servicios que reparar")
    elif cmd == 'report':
        print(generate_report())
    else:
        print("""
╔══════════════════════════════════════════════════════════════════╗
║                    ARIS AGENT v2.0                              ║
╚══════════════════════════════════════════════════════════════════╝
Uso: aris_agent.py [start|stop|status|check|fix|report]

Comandos:
  start   - Iniciar modo daemon con auto-reparación
  stop    - Detener el daemon
  status  - Ver estado actual
  check   - Verificar servicios
  fix     - Reparar servicios caídos
  report  - Generar reporte completo
        """)

if __name__ == '__main__':
    main()
