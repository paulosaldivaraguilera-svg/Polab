#!/usr/bin/env python3
"""
ARIS Auto-Sync - Sincronización automática con GitHub
======================================================

Ejecuta commit + push automáticamente cada hora.

Uso:
    python3 auto_sync.py start    # Iniciar daemon
    python3 auto_sync.py stop     # Detener
    python3 auto_sync.py status   # Ver estado
    python3 auto_sync.py sync     # Forzar sync ahora
"""

import os
import sys
import time
import subprocess
import json
from datetime import datetime
from pathlib import Path

# ============ CONFIGURACIÓN ============

WORKSPACE = '/home/pi/.openclaw/workspace'
STATE_PATH = f'{WORKSPACE}/state/auto_sync.json'
LOG_PATH = f'{WORKSPACE}/logs/auto_sync.log'
GITHUB_REPO = 'https://github.com/paulosaldivaraguilera-svg/Polab.git'

# Intervalo (segundos) - 1 hora
INTERVAL = 3600

# ============ LOGGING ============

def log(message, level='INFO'):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    with open(LOG_PATH, 'a') as f:
        f.write(f'[{timestamp}] [{level}] {message}\n')
    print(f'[{timestamp}] {message}')

# ============ GIT OPERATIONS ============

def git_add_all():
    """git add -A"""
    result = subprocess.run(['git', 'add', '-A'], cwd=WORKSPACE, capture_output=True, text=True)
    return result.returncode == 0

def git_commit(message=None):
    """Crear commit automático"""
    if not message:
        message = f"Auto-sync {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    
    result = subprocess.run(['git', 'commit', '-m', message], cwd=WORKSPACE, capture_output=True, text=True)
    if result.returncode == 0:
        log(f"Commit creado: {message}")
        return True
    elif 'nothing to commit' in result.stderr:
        log("No hay cambios para commitear", 'DEBUG')
        return None
    else:
        log(f"Error en commit: {result.stderr}", 'ERROR')
        return False

def git_push():
    """git push origin main"""
    result = subprocess.run(['git', 'push', 'origin', 'main'], cwd=WORKSPACE, capture_output=True, text=True)
    if result.returncode == 0:
        log("Push exitoso a GitHub")
        return True
    else:
        log(f"Error en push: {result.stderr}", 'ERROR')
        return False

def git_status():
    """Verificar estado"""
    result = subprocess.run(['git', 'status', '--porcelain'], cwd=WORKSPACE, capture_output=True, text=True)
    has_changes = bool(result.stdout.strip())
    return {'has_changes': has_changes, 'files': result.stdout.strip().split('\n') if has_changes else []}

def has_remote_updates():
    """Verificar si hay updates remotos"""
    result = subprocess.run(['git', 'fetch'], cwd=WORKSPACE, capture_output=True, text=True)
    result = subprocess.run(['git', 'rev-list', '--count', 'HEAD..origin/main'], cwd=WORKSPACE, capture_output=True, text=True)
    try:
        count = int(result.stdout.strip())
        return count > 0
    except:
        return False

def sync():
    """Ejecutar sync completo"""
    status = git_status()
    
    if has_remote_updates():
        log("Hay cambios remotos, haciendo pull primero...")
        result = subprocess.run(['git', 'pull', 'origin', 'main'], cwd=WORKSPACE, capture_output=True, text=True)
        if result.returncode == 0:
            log("Pull exitoso")
        else:
            log(f"Error en pull: {result.stderr}", 'WARNING')
    
    if not status['has_changes']:
        return {'action': 'nothing', 'message': 'Todo al día'}
    
    # Commit
    commit_result = git_commit()
    if commit_result is False:
        return {'action': 'failed', 'message': 'Error en commit'}
    
    if commit_result is None:
        return {'action': 'nothing', 'message': 'Sin cambios'}
    
    # Push
    push_result = git_push()
    if push_result:
        return {'action': 'synced', 'message': 'Commit + Push exitoso'}
    else:
        return {'action': 'failed', 'message': 'Error en push'}

# ============ ESTADO ============

def load_state():
    if os.path.exists(STATE_PATH):
        with open(STATE_PATH, 'r') as f:
            return json.load(f)
    return {'running': False, 'last_sync': None, 'total_syncs': 0}

def save_state(state):
    os.makedirs(os.path.dirname(STATE_PATH), exist_ok=True)
    with open(STATE_PATH, 'w') as f:
        json.dump(state, f, indent=2)

# ============ DAEMON ============

def run_daemon():
    state = load_state()
    state['running'] = True
    state['started'] = datetime.now().isoformat()
    save_state(state)
    
    log("🤖 ARIS Auto-Sync iniciado")
    log(f"📁 Workspace: {WORKSPACE}")
    log(f"🔄 Intervalo: {INTERVAL} segundos ({INTERVAL//60} minutos)")
    
    try:
        while state['running']:
            result = sync()
            
            state['last_sync'] = datetime.now().isoformat()
            if result['action'] == 'synced':
                state['total_syncs'] += 1
            save_state(state)
            
            # Dormir hasta el próximo ciclo
            time.sleep(INTERVAL)
            
    except KeyboardInterrupt:
        log("🛑 Detenido por usuario")
        state['running'] = False
        save_state(state)

# ============ CLI ============

def main():
    import argparse
    parser = argparse.ArgumentParser(description='ARIS Auto-Sync')
    parser.add_argument('command', choices=['start', 'stop', 'status', 'sync', 'once'],
                       help='Comando')
    
    args = parser.parse_args()
    
    if args.command == 'start':
        run_daemon()
    
    elif args.command == 'stop':
        state = load_state()
        state['running'] = False
        save_state(state)
        log("Deteniendo...")
    
    elif args.command == 'status':
        state = load_state()
        status = git_status()
        print(f"\n🤖 Auto-Sync Status:")
        print(f"   Corriendo: {'✅' if state['running'] else '❌'}")
        print(f"   Último sync: {state.get('last_sync', 'Nunca')}")
        print(f"   Total syncs: {state.get('total_syncs', 0)}")
        print(f"   Cambios pendientes: {'✅' if status['has_changes'] else '❌'}")
    
    elif args.command == 'sync' or args.command == 'once':
        result = sync()
        print(f"\n🔄 Resultado: {result['action']} - {result['message']}")

if __name__ == '__main__':
    main()
