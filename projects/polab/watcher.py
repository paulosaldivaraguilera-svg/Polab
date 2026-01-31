#!/usr/bin/env python3
"""
File Watcher - Detecta cambios y ejecuta acciones
==================================================
Monitorea archivos y ejecuta comandos cuando cambian.

Uso:
    python3 watcher.py start  # Inicia modo daemon
    python3 watcher.py status # Ver estado
"""

import os
import time
import hashlib
import subprocess
import json
from datetime import datetime

WATCH_DIRS = [
    '/home/pi/.openclaw/workspace/proyectos-paulo/produccion',
    '/home/pi/.openclaw/workspace/proyectos-paulo/polab',
]

STATE_FILE = '/home/pi/.openclaw/workspace/proyectos-paulo/polab/watcher_state.json'
LOG_FILE = '/home/pi/.openclaw/workspace/proyectos-paulo/polab/watcher.log'

def get_file_hash(filepath):
    """Calcula hash MD5 de un archivo"""
    if not os.path.exists(filepath):
        return None
    with open(filepath, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f)

def log_change(filepath, action='modified'):
    msg = f"[{datetime.now().isoformat()}] {action}: {filepath}\n"
    with open(LOG_FILE, 'a') as f:
        f.write(msg)

def scan_files():
    """Escanea todos los archivos y devuelve sus hashes"""
    state = {}
    for watch_dir in WATCH_DIRS:
        if not os.path.exists(watch_dir):
            continue
        for root, dirs, files in os.walk(watch_dir):
            for f in files:
                if f.endswith(('.md', '.txt', '.py', '.js', '.json')):
                    path = os.path.join(root, f)
                    state[path] = get_file_hash(path)
    return state

def check_changes():
    """Detecta cambios desde el último escaneo"""
    current_state = scan_files()
    previous_state = load_state()
    
    changes = {
        'new': [],
        'modified': [],
        'deleted': []
    }
    
    # Archivos nuevos o modificados
    for path, h in current_state.items():
        if path not in previous_state:
            changes['new'].append(path)
        elif previous_state[path] != h:
            changes['modified'].append(path)
    
    # Archivos eliminados
    for path in previous_state:
        if path not in current_state:
            changes['deleted'].append(path)
    
    return changes, current_state

def run_action(changes):
    """Ejecuta acciones según los cambios"""
    for path in changes['new']:
        log_change(path, 'new')
        print(f"🆕 Nuevo: {path}")
    
    for path in changes['modified']:
        log_change(path, 'modified')
        print(f"📝 Modificado: {path}")
        
        # Auto-commit en git
        try:
            subprocess.run(['git', 'add', path], cwd='/home/pi/.openclaw/workspace', capture_output=True)
            subprocess.run(['git', 'commit', '-m', f'Auto-commit: {os.path.basename(path)}'], 
                          cwd='/home/pi/.openclaw/workspace', capture_output=True)
        except:
            pass

def start_watching(interval=10):
    """Modo daemon: vigila cambios continuamente"""
    print(f"👀 Watcher iniciado en segundo plano")
    print(f"📂 Monitoreando: {WATCH_DIRS}")
    print(f"⏱️ Intervalo: {interval}s")
    
    previous_state = load_state()
    
    while True:
        changes, current_state = check_changes()
        
        if any(changes.values()):
            run_action(changes)
            save_state(current_state)
        
        previous_state = current_state
        time.sleep(interval)

def status():
    """Muestra estado del watcher"""
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r') as f:
            state = json.load(f)
        print(f"📊 Archivos monitoreados: {len(state)}")
        print(f"📁 Directorios: {WATCH_DIRS}")
        
        if os.path.exists(LOG_FILE):
            with open(LOG_FILE, 'r') as f:
                lines = f.readlines()
            print(f"📝 Últimos cambios: {len(lines)}")
    else:
        print("⚠️ Watcher no inicializado")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        
        if cmd == 'start':
            interval = int(sys.argv[2]) if len(sys.argv) > 2 else 10
            # Inicializar estado primero
            save_state(scan_files())
            start_watching(interval)
        elif cmd == 'status':
            status()
        elif cmd == 'scan':
            changes, state = check_changes()
            print(f"🆕 Nuevos: {len(changes['new'])}")
            print(f"📝 Modificados: {len(changes['modified'])}")
            print(f"🗑️ Eliminados: {len(changes['deleted'])}")
        else:
            print("Comandos: start, status, scan")
    else:
        print("File Watcher ARIS")
        print()
        print("Uso:")
        print("  python3 watcher.py start [intervalo_segundos]")
        print("  python3 watcher.py status")
        print("  python3 watcher.py scan")
