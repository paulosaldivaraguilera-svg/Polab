#!/usr/bin/env python3
"""
ARIS Logging System - Sistema de Logging Estructurado
======================================================

Logging en formato JSON para análisis, auditoría y debugging.

Características:
- Formato JSON estructurado
- Niveles: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Rotación de archivos automática
- Búsqueda en logs
- Métricas básicas

Uso:
    from logs import log, log_debug, log_info, log_warning, log_error

    log("Usuario conectado", level="INFO", user_id=123)
    log_error("Error crítico", error=str(e))
"""

import os
import sys
import json
import gzip
import glob
import time
from datetime import datetime
from pathlib import Path
from functools import wraps
from typing import Any, Dict, Optional

# ============ CONFIGURACIÓN ============

WORKSPACE = '/home/pi/.openclaw/workspace'
LOG_DIR = f'{WORKSPACE}/logs'
LOG_FILE = f'{LOG_DIR}/aris.log'
ARCHIVE_DIR = f'{LOG_DIR}/archive'

# Configuración
LOG_CONFIG = {
    'max_size_mb': 10,
    'max_files': 10,
    'level': 'DEBUG',  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    'echo': False,  # Imprimir a consola también
}

# ============ NIVELES ============

NIVELES = {
    'DEBUG': 10,
    'INFO': 20,
    'WARNING': 30,
    'ERROR': 40,
    'CRITICAL': 50,
}

NIVEL_ACTUAL = NIVELES.get(LOG_CONFIG['level'], 20)

# ============ CLASES ============

class LogEntry:
    """Entrada de log estructurada"""
    
    def __init__(self, message: str, level: str = 'INFO', **kwargs):
        self.timestamp = datetime.now().isoformat()
        self.timestamp_unix = time.time()
        self.level = level.upper()
        self.message = message
        self.extra = kwargs
        self.session_id = 'main'  # Para multi-session
    
    def to_dict(self) -> Dict:
        return {
            'timestamp': self.timestamp,
            'timestamp_unix': self.timestamp_unix,
            'level': self.level,
            'message': self.message,
            'session': self.session_id,
            **self.extra
        }
    
    def to_json(self) -> str:
        return json.dumps(self.to_dict())
    
    def __str__(self):
        return f"[{self.timestamp}] [{self.level}] {self.message}"

class ARISLogger:
    """Logger principal de ARIS"""
    
    def __init__(self, name: str = 'ARIS'):
        self.name = name
        self.log_dir = Path(LOG_DIR)
        self.log_file = Path(LOG_FILE)
        self.archive_dir = Path(ARCHIVE_DIR)
        
        # Crear directorios
        self.log_dir.mkdir(exist_ok=True)
        self.archive_dir.mkdir(exist_ok=True)
    
    def _should_log(self, level: str) -> bool:
        """Verificar si debe loguear según nivel"""
        return NIVELES.get(level, 0) >= NIVEL_ACTUAL
    
    def _rotate_if_needed(self):
        """Rotar archivo si excede tamaño"""
        if not self.log_file.exists():
            return
        
        size_mb = self.log_file.stat().st_size / (1024 * 1024)
        
        if size_mb > LOG_CONFIG['max_size_mb']:
            self._rotate()
    
    def _rotate(self):
        """Rotar archivo de log"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        archive_name = f'{self.name}_{timestamp}.log.gz'
        archive_path = self.archive_dir / archive_name
        
        # Comprimir archivo actual
        with open(self.log_file, 'rb') as f_in:
            with gzip.open(archive_path, 'wb') as f_out:
                f_out.write(f_in.read())
        
        # Limpiar archivo actual
        self.log_file.unlink()
        
        # Limpiar archivos antiguos
        self._cleanup_old_archives()
    
    def _cleanup_old_archives(self):
        """Eliminar archivos antiguos"""
        files = sorted(self.archive_dir.glob(f'{self.name}_*.log.gz'), 
                      key=lambda x: x.stat().st_mtime)
        
        if len(files) > LOG_CONFIG['max_files']:
            for f in files[:-LOG_CONFIG['max_files']]:
                f.unlink()
    
    def write(self, entry: LogEntry):
        """Escribir entrada al archivo"""
        if not self._should_log(entry.level):
            return
        
        self._rotate_if_needed()
        
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write(entry.to_json() + '\n')
        
        if LOG_CONFIG['echo']:
            print(str(entry))
    
    def log(self, message: str, level: str = 'INFO', **kwargs):
        """Log genérico"""
        entry = LogEntry(message, level, source=self.name, **kwargs)
        self.write(entry)
    
    def debug(self, message: str, **kwargs):
        """Log DEBUG"""
        self.log(message, 'DEBUG', **kwargs)
    
    def info(self, message: str, **kwargs):
        """Log INFO"""
        self.log(message, 'INFO', **kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log WARNING"""
        self.log(message, 'WARNING', **kwargs)
    
    def error(self, message: str, **kwargs):
        """Log ERROR"""
        self.log(message, 'ERROR', **kwargs)
    
    def critical(self, message: str, **kwargs):
        """Log CRITICAL"""
        self.log(message, 'CRITICAL', **kwargs)
    
    def exception(self, message: str, error: Exception, **kwargs):
        """Log de excepción con traceback"""
        import traceback
        self.log(message, 'ERROR', error=str(error), traceback=traceback.format_exc(), **kwargs)
    
    def search(self, query: str = None, level: str = None, 
               since: str = None, limit: int = 100) -> list:
        """
        Buscar en logs.
        
        Args:
            query: Término a buscar en mensaje
            level: Filtrar por nivel
            since: Filtrar desde fecha (ISO format)
            limit: Máximo resultados
        """
        results = []
        
        # Buscar en archivo actual
        if self.log_file.exists():
            with open(self.log_file, 'r') as f:
                for line in f:
                    try:
                        entry = json.loads(line)
                        
                        # Filtrar por query
                        if query and query.lower() not in entry.get('message', '').lower():
                            continue
                        
                        # Filtrar por nivel
                        if level and entry.get('level') != level.upper():
                            continue
                        
                        # Filtrar por fecha
                        if since and entry.get('timestamp') < since:
                            continue
                        
                        results.append(entry)
                        
                        if len(results) >= limit:
                            break
                    except json.JSONDecodeError:
                        continue
        
        return results
    
    def stats(self) -> Dict:
        """Estadísticas de logs"""
        stats = {
            'total_entries': 0,
            'by_level': {},
            'last_entry': None,
            'file_size_mb': 0,
        }
        
        if self.log_file.exists():
            stats['file_size_mb'] = round(self.log_file.stat().st_size / (1024 * 1024), 2)
            
            with open(self.log_file, 'r') as f:
                for line in f:
                    try:
                        entry = json.loads(line)
                        stats['total_entries'] += 1
                        
                        level = entry.get('level', 'UNKNOWN')
                        stats['by_level'][level] = stats['by_level'].get(level, 0) + 1
                        
                        stats['last_entry'] = entry.get('timestamp')
                    except json.JSONDecodeError:
                        continue
        
        return stats

# ============ INSTANCIA GLOBAL ============

logger = ARISLogger('ARIS')

# ============ FUNCIONES DE CONVENIENCIA ============

def log(message: str, level: str = 'INFO', **kwargs):
    """Función de log global"""
    logger.log(message, level, **kwargs)

def log_debug(message: str, **kwargs):
    """Log DEBUG"""
    logger.debug(message, **kwargs)

def log_info(message: str, **kwargs):
    """Log INFO"""
    logger.info(message, **kwargs)

def log_warning(message: str, **kwargs):
    """Log WARNING"""
    logger.warning(message, **kwargs)

def log_error(message: str, **kwargs):
    """Log ERROR"""
    logger.error(message, **kwargs)

def log_critical(message: str, **kwargs):
    """Log CRITICAL"""
    logger.critical(message, **kwargs)

def log_exception(message: str, error: Exception, **kwargs):
    """Log de excepción"""
    logger.exception(message, error, **kwargs)

# ============ DECORADORES ============

def logged_function(func):
    """Decorador para loguear ejecución de funciones"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        log_info(f"Ejecutando: {func.__name__}", function=func.__name__)
        try:
            result = func(*args, **kwargs)
            log_info(f"Completado: {func.__name__}", function=func.__name__)
            return result
        except Exception as e:
            log_exception(f"Error en {func.__name__}", error=e, function=func.__name__)
            raise
    return wrapper

def timed_function(func):
    """Decorador para medir tiempo de ejecución"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        duration = round(time.time() - start, 3)
        log_debug(f"{func.__name__} completó en {duration}s", function=func.__name__, duration=duration)
        return result
    return wrapper

# ============ CLI ============

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='ARIS Logging System')
    parser.add_argument('command', choices=['search', 'stats', 'tail', 'archive'],
                       help='Comando')
    parser.add_argument('--query', '-q', help='Término a buscar')
    parser.add_argument('--level', '-l', help='Filtrar por nivel')
    parser.add_argument('--limit', '-n', type=int, default=100, help='Límite de resultados')
    
    args = parser.parse_args()
    
    if args.command == 'search':
        results = logger.search(query=args.query, level=args.level, limit=args.limit)
        for r in results:
            print(f"[{r.get('level')}] {r.get('timestamp')}: {r.get('message')}")
    
    elif args.command == 'stats':
        stats = logger.stats()
        print(f"\n📊 Estadísticas de Logs:")
        print(f"  Total entradas: {stats['total_entries']}")
        print(f"  Por nivel: {stats['by_level']}")
        print(f"  Último: {stats['last_entry']}")
        print(f"  Tamaño: {stats['file_size_mb']} MB")
    
    elif args.command == 'tail':
        results = logger.search(limit=args.limit or 20)
        for r in results:
            print(f"[{r.get('level')}] {r.get('message')}")
    
    elif args.command == 'archive':
        logger._rotate()
        print("✅ Logs archivados")

if __name__ == '__main__':
    main()
