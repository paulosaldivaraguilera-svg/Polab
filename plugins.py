#!/usr/bin/env python3
"""
ARIS Plugin System - Sistema de Plugins Expandible
===================================================

Permite agregar herramientas/funcionalidades sin modificar el core.

Uso:
    from plugins import PluginManager, plugin

    @plugin(name="mi_herramienta", version="1.0")
    def mi_funcion(arg):
        """Mi herramienta"""
        return resultado

    # Ejecutar
    python3 plugins.py run mi_herramienta --arg valor
"""

import os
import sys
import json
import importlib
import inspect
from pathlib import Path
from datetime import datetime
from typing import Callable, Any, Dict, List, Optional

# Importar sistema de logging
sys.path.insert(0, '/home/pi/.openclaw/workspace')
from logs import log_info, log_warning, log_error, logged_function

# Paths
WORKSPACE = '/home/pi/.openclaw/workspace'
PLUGINS_DIR = f'{WORKSPACE}/plugins'
CONFIG_PATH = f'{WORKSPACE}/config/plugins.json'
LOG_PATH = f'{WORKSPACE}/logs/plugins.log'

# ============ REGISTRY ============

PLUGIN_REGISTRY = {}

def plugin(name: str, version: str = "1.0.0", description: str = "", author: str = "ARIS"):
    """
    Decorador para registrar un plugin.
    
    Args:
        name: Identificador único del plugin
        version: Versión semántica
        description: Descripción corta
        author: Creador del plugin
    
    Usage:
        @plugin(name="mi_herramienta", version="1.0.0")
        def mi_herramienta(arg1, arg2):
            '''Descripción de la herramienta'''
            return resultado
    """
    def decorator(func: Callable):
        # Registrar en el registry
        PLUGIN_REGISTRY[name] = {
            'name': name,
            'version': version,
            'description': description,
            'author': author,
            'func': func,
            'module': func.__module__,
            'doc': func.__doc__,
            'signature': str(inspect.signature(func)),
            'enabled': True,
            'usage_count': 0,
            'last_used': None,
            'created_at': datetime.now().isoformat(),
        }
        return func
    return decorator

# ============ PLUGIN BASE ============

class PluginBase:
    """Clase base para plugins más complejos"""
    
    def __init__(self):
        self.name = self.__class__.__name__
        self.config = {}
    
    def load_config(self):
        """Cargar configuración desde archivo"""
        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH, 'r') as f:
                config = json.load(f)
                self.config = config.get(self.name, {})
        return self.config
    
    def save_config(self):
        """Guardar configuración"""
        os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH, 'r') as f:
                config = json.load(f)
        else:
            config = {}
        config[self.name] = self.config
        with open(CONFIG_PATH, 'w') as f:
            json.dump(config, f, indent=2)
    
    def log(self, message: str, level: str = 'INFO'):
        """Log del plugin"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
        with open(LOG_PATH, 'a') as f:
            f.write(f'[{timestamp}] [{self.name}] [{level}] {message}\n')

# ============ PLUGIN MANAGER ============

class PluginManager:
    """Gestiona plugins cargados"""
    
    def __init__(self):
        self.plugins = {}
        self.load_all()
    
    def load_all(self):
        """Cargar todos los plugins del directorio"""
        plugins_path = Path(PLUGINS_DIR)
        
        if not plugins_path.exists():
            os.makedirs(PLUGINS_DIR, exist_ok=True)
            # Crear plugin de ejemplo
            self._create_example_plugin()
        
        # Cargar plugins del registry global
        for name, info in PLUGIN_REGISTRY.items():
            self.plugins[name] = info
            self._log(f'Plugin cargado: {name} v{info["version"]}')
    
    def _create_example_plugin(self):
        """Crear plugin de ejemplo"""
        example = '''#!/usr/bin/env python3
"""
Plugin de ejemplo para ARIS
===========================
"""

from plugins import plugin, PluginBase

@plugin(name="saludar", version="1.0.0", description="Saluda a alguien")
def saludar(nombre: str = "Mundo") -> str:
    """
    Retorna un saludo.
    
    Args:
        nombre: Nombre a saludar
    
    Returns:
        String con el saludo
    """
    return f"Hola, {nombre}!"

@plugin(name="fecha_actual", version="1.0.0", description="Retorna la fecha actual")
def fecha_actual() -> str:
    """Retorna la fecha actual en formato YYYY-MM-DD"""
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d")
'''
        
        with open(f'{PLUGINS_DIR}/__init__.py', 'w') as f:
            f.write(example)
        
        # Importar para registrar
        sys.path.insert(0, PLUGINS_DIR)
        importlib.import_module('__init__')
    
    def _log(self, message: str):
        """Log interno"""
        print(f'[PluginManager] {message}')
    
    def list(self) -> List[Dict]:
        """Listar plugins cargados"""
        return [
            {
                'name': name,
                'version': info['version'],
                'description': info['description'],
                'enabled': info['enabled'],
                'usage_count': info['usage_count'],
            }
            for name, info in self.plugins.items()
        ]
    
    def get(self, name: str) -> Optional[Dict]:
        """Obtener plugin por nombre"""
        return self.plugins.get(name)
    
    def run(self, name: str, **kwargs) -> Any:
        """Ejecutar un plugin"""
        plugin = self.get(name)
        if not plugin:
            raise ValueError(f'Plugin no encontrado: {name}')
        
        if not plugin['enabled']:
            raise RuntimeError(f'Plugin deshabilitado: {name}')
        
        # Ejecutar
        plugin['usage_count'] += 1
        plugin['last_used'] = datetime.now().isoformat()
        
        return plugin['func'](**kwargs)
    
    def enable(self, name: str):
        """Habilitar plugin"""
        if name in self.plugins:
            self.plugins[name]['enabled'] = True
            self._log(f'Plugin habilitado: {name}')
    
    def disable(self, name: str):
        """Deshabilitar plugin"""
        if name in self.plugins:
            self.plugins[name]['enabled'] = False
            self._log(f'Plugin deshabilitado: {name}')
    
    def stats(self) -> Dict:
        """Estadísticas de uso"""
        total = len(self.plugins)
        enabled = sum(1 for p in self.plugins.values() if p['enabled'])
        total_uses = sum(p['usage_count'] for p in self.plugins.values())
        
        return {
            'total': total,
            'enabled': enabled,
            'disabled': total - enabled,
            'total_uses': total_uses,
        }

# ============ PLUGINS CORE ============

@plugin(name="contar_notas", version="1.0.0", description="Cuenta notas en memory/")
def contar_notas(directorio: str = None) -> Dict:
    """Cuenta archivos de notas en un directorio"""
    import glob
    
    dir_path = directorio or f'{WORKSPACE}/memory'
    archivos = glob.glob(f'{dir_path}/*.md')
    
    return {
        'directorio': dir_path,
        'total': len(archivos),
        'archivos': [os.path.basename(a) for a in archivos[-10:]]
    }

@plugin(name="ultima_nota", version="1.0.0", description="Lee la última nota creada")
def ultima_nota() -> str:
    """Retorna el contenido de la última nota"""
    import glob
    
    notas = glob.glob(f'{WORKSPACE}/memory/*.md')
    if not notas:
        return "No hay notas"
    
    ultima = max(notas, key=os.path.getmtime)
    with open(ultima, 'r') as f:
        return f.read()[:500]  # Primeros 500 chars

@plugin(name="buscar_en_notas", version="1.0.0", description="Busca texto en notas")
def buscar_en_notas(termino: str) -> List[str]:
    """Busca un término en todas las notas"""
    import glob
    
    resultados = []
    termino = termino.lower()
    
    for nota in glob.glob(f'{WORKSPACE}/memory/*.md'):
        with open(nota, 'r') as f:
            contenido = f.read().lower()
            if termino in contenido:
                resultados.append(os.path.basename(nota))
    
    return resultados

@plugin(name="git_status", version="1.0.0", description="Obtiene estado del repositorio")
def git_status() -> Dict:
    """Retorna estado de git"""
    import subprocess
    
    result = subprocess.run(['git', 'status', '--porcelain'], 
                          capture_output=True, text=True, cwd=WORKSPACE)
    untracked = subprocess.run(['git', 'status', '--porcelain', '--untracked-files=all'], 
                              capture_output=True, text=True, cwd=WORKSPACE)
    
    return {
        'modified': len(result.stdout.strip().split('\n')) if result.stdout.strip() else 0,
        'untracked': len([l for l in untracked.stdout.split('\n') if l and not l.startswith('!!')])
    }

@plugin(name="generar_reporte", version="1.0.0", description="Genera reporte del día")
def generar_reporte(dia: str = None) -> str:
    """Genera un reporte simple"""
    fecha = dia or datetime.now().strftime('%Y-%m-%d')
    
    return f"""
## Reporte ARIS - {fecha}

### Plugins usados hoy:
(count desde registry)

### Archivos modificados:
(git status)

### Notas del día:
(contar_notas)

---
Generado por ARIS Plugin System
"""

# ============ CLI ============

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='ARIS Plugin Manager')
    parser.add_argument('command', choices=['list', 'run', 'enable', 'disable', 'stats'],
                       help='Comando a ejecutar')
    parser.add_argument('plugin', nargs='?', help='Nombre del plugin')
    parser.add_argument('--args', nargs='*', help='Argumentos')
    
    args = parser.parse_args()
    
    manager = PluginManager()
    
    if args.command == 'list':
        print('\n📦 Plugins cargados:')
        for p in manager.list():
            estado = '✅' if p['enabled'] else '❌'
            print(f'  {estado} {p["name"]} v{p["version"]} - {p["description"]}')
            print(f'     Usos: {p["usage_count"]}')
    
    elif args.command == 'stats':
        stats = manager.stats()
        print(f'\n📊 Estadísticas:')
        print(f'  Total: {stats["total"]}')
        print(f'  Habilitados: {stats["enabled"]}')
        print(f'  Deshabilitados: {stats["disabled"]}')
        print(f'  Total usos: {stats["total_uses"]}')
    
    elif args.command == 'run':
        if not args.plugin:
            print('Error: Necesitas especificar un plugin')
            sys.exit(1)
        
        kwargs = {}
        if args.args:
            # Parsear argumentos clave=valor
            for arg in args.args:
                if '=' in arg:
                    k, v = arg.split('=', 1)
                    kwargs[k] = v
        
        try:
            result = manager.run(args.plugin, **kwargs)
            print(f'\n✅ Resultado de {args.plugin}:')
            print(result)
        except Exception as e:
            print(f'\n❌ Error: {e}')
            sys.exit(1)
    
    elif args.command == 'enable':
        if args.plugin:
            manager.enable(args.plugin)
    
    elif args.command == 'disable':
        if args.plugin:
            manager.disable(args.plugin)

if __name__ == '__main__':
    main()
