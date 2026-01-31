#!/usr/bin/env python3
"""
Migrate Projects to Separate Repositories
==========================================

Migra los proyectos a sus repositorios específicos.

Uso:
    python3 migrate_repos.py all     # Migrar todo
    python3 migrate_repos.py elemental-pong
    python3 migrate_repos.py paulosaldivar-web
    python3 migrate_repos.py comenzar
    python3 migrate_repos.py dialectico-os
"""

import os
import subprocess
import shutil
from datetime import datetime

WORKSPACE = '/home/pi/.openclaw/workspace'
REPOS = {
    'elemental-pong': {
        'url': 'https://github.com/paulosaldivaraguilera-svg/elemental-pong.git',
        'source': f'{WORKSPACE}/proyectos-paulo/elemental-pong',
        'temp': '/tmp/elemental-pong-temp'
    },
    'paulosaldivar-web': {
        'url': 'https://github.com/paulosaldivaraguilera-svg/paulosaldivar-web.git',
        'source': f'{WORKSPACE}/proyectos-paulo/web-personal',
        'temp': '/tmp/paulosaldivar-web-temp'
    },
    'comenzar': {
        'url': 'https://github.com/paulosaldivaraguilera-svg/comenzar-landing.git',
        'source': f'{WORKSPACE}/proyectos-paulo/comenzar',
        'temp': '/tmp/comenzar-landing-temp'
    },
    'dialectico-os': {
        'url': 'https://github.com/paulosaldivaraguilera-svg/dialectico-os.git',
        'source': f'{WORKSPACE}/dialectico-os',
        'temp': '/tmp/dialectico-os-temp'
    }
}

def run(cmd, cwd=None):
    result = subprocess.run(cmd, shell=True, cwd=cwd or WORKSPACE, capture_output=True, text=True)
    return result.returncode == 0, result.stdout, result.stderr

def migrate_project(name):
    config = REPOS[name]
    
    print(f"\n🔄 Migrando {name}...")
    
    # 1. Clonar repo vacío
    print(f"   📥 Clonando {config['url']}")
    if os.path.exists(config['temp']):
        shutil.rmtree(config['temp'])
    success, out, err = run(f'git clone {config["url"]} {config["temp"]}')
    if not success:
        print(f"   ❌ Error clonando: {err}")
        return False
    
    # 2. Copiar archivos
    print(f"   📂 Copiando desde {config['source']}")
    if os.path.exists(config['source']):
        for item in os.listdir(config['source']):
            src = os.path.join(config['source'], item)
            dst = os.path.join(config['temp'], item)
            if os.path.isdir(src):
                shutil.copytree(src, dst)
            else:
                shutil.copy2(src, dst)
    else:
        print(f"   ⚠️  Directorio fuente no existe: {config['source']}")
    
    # 3. Commit y push
    print(f"   📤 Commit y push...")
    success, out, err = run('git add -A', cwd=config['temp'])
    success, out, err = run(f'git commit -m "Import from Polab - {datetime.now().strftime("%Y-%m-%d %H:%M")}"', cwd=config['temp'])
    if not success:
        if 'nothing to commit' in err:
            print(f"   ℹ️  No hay cambios que migrar")
            return True
        print(f"   ❌ Error en commit: {err}")
        return False
    
    success, out, err = run('git push origin main', cwd=config['temp'])
    if not success:
        print(f"   ❌ Error en push: {err}")
        return False
    
    print(f"   ✅ {name} migrado exitosamente")
    return True

def main():
    import sys
    project = sys.argv[1] if len(sys.argv) > 1 else 'all'
    
    if project == 'all':
        for name in REPOS.keys():
            migrate_project(name)
    else:
        migrate_project(project)

if __name__ == '__main__':
    main()
