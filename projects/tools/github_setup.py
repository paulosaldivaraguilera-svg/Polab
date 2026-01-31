#!/usr/bin/env python3
"""
GitHub Integration Script
=========================
Prepara el workspace para integración con GitHub.

Funciones:
- Configurar remote
- Crear commits automáticos
- Generar changelog
- Sincronizar cambios

Uso:
    python3 github_setup.py init          # Inicializar configuración
    python3 github_setup.py status        # Ver estado
    python3 github_setup.py commit        # Crear commit
    python3 github_setup.py sync          # Sincronizar con remoto
    python3 github_setup.py create-pr     # Crear PR (si hay remoto)
"""

import os
import sys
import json
import subprocess
import time
from datetime import datetime
from pathlib import Path

# ============ CONFIGURACIÓN ============

WORKSPACE = '/home/pi/.openclaw/workspace'
CONFIG_PATH = f'{WORKSPACE}/config/github.json'
LOG_PATH = f'{WORKSPACE}/logs/github.log'
STATE_PATH = f'{WORKSPACE}/state/github_state.json'

# Configuración por defecto
DEFAULT_CONFIG = {
    'remote_url': None,  # git@github.com:usuario/repo.git o https://github.com/...
    'branch': 'master',
    'auto_commit': True,
    'commit_interval_minutes': 60,
    'push_on_commit': False,
    'gpg_sign': False,
    'author': {
        'name': 'ARIS',
        'email': 'aris@paulosaldivar.cv'
    }
}

# ============ LOGGING ============

def log(message, level='INFO'):
    """Log con timestamp"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    with open(LOG_PATH, 'a') as f:
        f.write(f'[{timestamp}] [{level}] {message}\n')
    print(f'[{timestamp}] {message}')

# ============ GIT UTILS ============

def run_git_command(args, cwd=None):
    """Ejecutar comando git"""
    try:
        result = subprocess.run(
            ['git'] + args,
            cwd=cwd or WORKSPACE,
            capture_output=True,
            text=True,
            timeout=30
        )
        return {
            'success': result.returncode == 0,
            'stdout': result.stdout,
            'stderr': result.stderr
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def get_git_status() -> dict:
    """Obtener estado del repositorio"""
    status = run_git_command(['status', '--porcelain'])
    diff = run_git_command(['diff', '--stat'])
    log_result = run_git_command(['log', '--oneline', '-5'])
    
    # Contar archivos
    changed_files = []
    if status['success']:
        for line in status['stdout'].strip().split('\n'):
            if line.strip():
                # Formato: XY filename
                status_code = line[:2]
                filename = line[3:].strip()
                changed_files.append({
                    'status': status_code,
                    'file': filename
                })
    
    # Últimos commits
    commits = []
    if log_result['success']:
        for line in log_result['stdout'].strip().split('\n'):
            if line.strip():
                parts = line.split(' ', 1)
                if len(parts) >= 2:
                    commits.append({
                        'hash': parts[0],
                        'message': parts[1] if len(parts) > 1 else ''
                    })
    
    return {
        'has_changes': len(changed_files) > 0,
        'changed_files': changed_files,
        'total_changed': len(changed_files),
        'recent_commits': commits
    }

def get_current_branch() -> str:
    """Obtener rama actual"""
    result = run_git_command(['rev-parse', '--abbrev-ref', 'HEAD'])
    return result['stdout'].strip() if result['success'] else 'unknown'

def get_remote_url() -> str:
    """Obtener URL del remoto"""
    result = run_git_command(['remote', 'get-url', 'origin'])
    return result['stdout'].strip() if result['success'] else None

def has_uncommitted_changes() -> bool:
    """Verificar si hay cambios sin commit"""
    status = run_git_command(['status', '--porcelain'])
    return bool(status['stdout'].strip()) if status['success'] else False

def create_commit(message: str) -> dict:
    """Crear commit"""
    # Add all changes
    add = run_git_command(['add', '-A'])
    if not add['success']:
        return {'success': False, 'message': add['stderr']}
    
    # Check if there's anything to commit
    status = run_git_command(['status', '--porcelain'])
    if not status['stdout'].strip():
        return {'success': False, 'message': 'No hay cambios para commitear'}
    
    # Create commit
    commit_args = ['commit', '-m', message]
    
    # Add author if configured
    config = load_config()
    if config.get('author'):
        commit_args.extend([
            '--author', f'{config["author"]["name"]} <{config["author"]["email"]}>'
        ])
    
    # GPG sign if configured
    if config.get('gpg_sign'):
        commit_args.extend(['-S'])
    
    commit = run_git_command(commit_args)
    
    if commit['success']:
        return {'success': True, 'message': 'Commit creado', 'output': commit['stdout']}
    else:
        return {'success': False, 'message': commit['stderr']}

def push_to_remote() -> dict:
    """Hacer push al remoto"""
    config = load_config()
    branch = config.get('branch', 'master')
    
    push = run_git_command(['push', 'origin', branch])
    
    if push['success']:
        return {'success': True, 'message': 'Push exitoso', 'output': push['stdout']}
    else:
        return {'success': False, 'message': push['stderr']}

def pull_from_remote() -> dict:
    """Hacer pull del remoto"""
    config = load_config()
    branch = config.get('branch', 'master')
    
    pull = run_git_command(['pull', 'origin', branch])
    
    if pull['success']:
        return {'success': True, 'message': 'Pull exitoso', 'output': pull['stdout']}
    else:
        return {'success': False, 'message': pull['stderr']}

# ============ CONFIG ============

def load_config() -> dict:
    """Cargar configuración"""
    os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, 'r') as f:
            return json.load(f)
    return DEFAULT_CONFIG.copy()

def save_config(config: dict):
    """Guardar configuración"""
    with open(CONFIG_PATH, 'w') as f:
        json.dump(config, f, indent=2)

def init_repo():
    """Inicializar repositorio git"""
    # Verificar si ya es repo git
    is_git = os.path.exists(f'{WORKSPACE}/.git')
    
    if is_git:
        log('📦 Repositorio ya inicializado')
        return {'success': True, 'message': 'Repo ya existe'}
    
    # Inicializar
    result = run_git_command(['init'])
    if not result['success']:
        return {'success': False, 'message': result['stderr']}
    
    log('✅ Repositorio inicializado')
    return {'success': True, 'message': 'Repo creado'}

def set_remote(url: str):
    """Configurar remoto"""
    config = load_config()
    config['remote_url'] = url
    save_config(config)
    
    # Verificar si ya hay remote
    current_remote = get_remote_url()
    
    if current_remote:
        if current_remote == url:
            log(f'🔗 Remote ya configurado: {url}')
        else:
            run_git_command(['remote', 'set-url', 'origin', url'])
            log(f'🔗 Remote actualizado: {url}')
    else:
        run_git_command(['remote', 'add', 'origin', url])
        log(f'🔗 Remote agregado: {url}')
    
    return {'success': True, 'message': 'Remote configurado'}

# ============ AUTO COMMIT ============

def get_auto_commit_message() -> str:
    """Generar mensaje de commit automático"""
    now = datetime.now()
    return f"ARIS Update - {now.strftime('%Y-%m-%d %H:%M')}"

def should_auto_commit() -> bool:
    """Verificar si debe hacer commit automático"""
    config = load_config()
    if not config.get('auto_commit', False):
        return False
    
    state = load_state()
    last_commit = state.get('last_commit')
    
    if not last_commit:
        return True
    
    last_commit_time = datetime.fromisoformat(last_commit)
    interval_minutes = config.get('commit_interval_minutes', 60)
    
    return (datetime.now() - last_commit_time).total_seconds() >= interval_minutes * 60

def update_state(state: dict):
    """Actualizar estado"""
    os.makedirs(os.path.dirname(STATE_PATH), exist_ok=True)
    with open(STATE_PATH, 'w') as f:
        json.dump(state, f, indent=2)

def load_state() -> dict:
    """Cargar estado"""
    if os.path.exists(STATE_PATH):
        with open(STATE_PATH, 'r') as f:
            return json.load(f)
    return {}

def auto_commit_cycle():
    """Ejecutar ciclo de auto commit"""
    if not should_auto_commit():
        return {'action': 'waiting', 'message': 'Aún no es hora de commitear'}
    
    if not has_uncommitted_changes():
        return {'action': 'nothing', 'message': 'No hay cambios'}
    
    message = get_auto_commit_message()
    result = create_commit(message)
    
    if result['success']:
        state = load_state()
        state['last_commit'] = datetime.now().isoformat()
        update_state(state)
        
        # Push si está configurado
        config = load_config()
        if config.get('push_on_commit', False):
            push_result = push_to_remote()
            return {'action': 'committed_pushed', 'message': result['message'], 'push': push_result}
        
        return {'action': 'committed', 'message': result['message']}
    else:
        return {'action': 'failed', 'message': result['message']}

# ============ CHANGELOG ============

def generate_changelog() -> str:
    """Generar changelog desde commits"""
    result = run_git_command(['log', '--pretty=format:%h|%s|%an|%ai', '-20'])
    
    if not result['success']:
        return 'No se pudo generar changelog'
    
    changelog_lines = ['# Changelog\n']
    current_date = None
    
    for line in result['stdout'].strip().split('\n'):
        if line:
            parts = line.split('|')
            if len(parts) >= 4:
                hash_, msg, author, date = parts[0], parts[1], parts[2], parts[3][:10]
                
                if date != current_date:
                    current_date = date
                    changelog_lines.append(f'\n## {date}')
                
                changelog_lines.append(f'- [{hash_}] {msg} (@{author})')
    
    return '\n'.join(changelog_lines)

# ============ CLI ============

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='GitHub Integration for ARIS')
    parser.add_argument('command', choices=[
        'init', 'status', 'remote', 'commit', 'auto', 
        'push', 'pull', 'sync', 'changelog', 'setup'
    ], help='Comando')
    parser.add_argument('--message', '-m', help='Mensaje de commit')
    parser.add_argument('--url', '-u', help='URL del remoto')
    parser.add_argument('--auto', action='store_true', help='Modo automático')
    
    args = parser.parse_args()
    
    if args.command == 'setup':
        print("""
🚀 GitHub Setup para ARIS

Para conectar con GitHub:

1. Crear repositorio en GitHub.com
2. Obtener Personal Access Token (PAT):
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Permisos: repo, workflow
3. Ejecutar:
   python3 github_setup.py init
   python3 github_setup.py remote https://github.com/usuario/repo.git
   python3 github_setup.py sync
        """)
        return
    
    config = load_config()
    
    if args.command == 'init':
        result = init_repo()
        print(f"✅ {result['message']}")
    
    elif args.command == 'status':
        status = get_git_status()
        branch = get_current_branch()
        remote = get_remote_url()
        
        print(f"\n📊 Estado de Git:")
        print(f"   Rama: {branch}")
        print(f"   Remote: {remote or '❌ No configurado'}")
        print(f"   Cambios: {status['total_changed']} archivos")
        
        if status['has_changes']:
            print(f"\n📝 Archivos modificados:")
            for f in status['changed_files'][:5]:
                print(f"   {f['status']} {f['file']}")
        
        print(f"\n📜 Últimos commits:")
        for c in status['recent_commits'][:3]:
            print(f"   {c['hash']} {c['message']}")
    
    elif args.command == 'remote':
        if not args.url:
            print("❌ Necesitas especificar URL: --url <url>")
            return
        result = set_remote(args.url)
        print(f"✅ {result['message']}")
    
    elif args.command == 'commit':
        message = args.message or get_auto_commit_message()
        result = create_commit(message)
        print(f"✅ {result['message']}" if result['success'] else f"❌ {result['message']}")
    
    elif args.command == 'auto':
        # Modo automático: verificar y commitear si corresponde
        state = load_state()
        print(f"\n🤖 Modo Automático:")
        print(f"   Auto-commit: {'✅' if config.get('auto_commit') else '❌'}")
        print(f"   Intervalo: {config.get('commit_interval_minutes', 60)} min")
        print(f"   Último commit: {state.get('last_commit', 'Nunca')}")
        
        result = auto_commit_cycle()
        print(f"\n🔄 Resultado: {result['message']}")
    
    elif args.command == 'push':
        result = push_to_remote()
        print(f"✅ {result['message']}" if result['success'] else f"❌ {result['message']}")
    
    elif args.command == 'pull':
        result = pull_from_remote()
        print(f"✅ {result['message']}" if result['success'] else f"❌ {result['message']}")
    
    elif args.command == 'sync':
        print(f"\n🔄 Sincronizando...")
        pull_result = pull_from_remote()
        if pull_result['success']:
            print(f"   📥 {pull_result['message']}")
        
        if has_uncommitted_changes():
            commit_result = create_commit(args.message or get_auto_commit_message())
            if commit_result['success']:
                print(f"   📝 {commit_result['message']}")
                push_result = push_to_remote()
                print(f"   📤 {push_result['message']}")
        else:
            print(f"   ✅ Todo al día")
    
    elif args.command == 'changelog':
        changelog = generate_changelog()
        print(f"\n📜 Changelog:")
        print(changelog)

if __name__ == '__main__':
    main()
