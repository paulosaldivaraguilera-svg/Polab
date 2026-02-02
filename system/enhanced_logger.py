"""
Enhanced Logger para PauloARIS
Sistema de logging avanzado con rotación y análisis
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

class EnhancedLogger:
    def __init__(self, name: str = "PauloARIS"):
        self.name = name
        self.logs_dir = Path("~/.openclaw/workspace/system/logs").expanduser()
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        
        # Archivos de log
        self.main_log = self.logs_dir / "main.log"
        self.error_log = self.logs_dir / "errors.log"
        self.session_log = self.logs_dir / "session.json"
        
        # Configuración
        self.max_log_size = 10 * 1024 * 1024  # 10MB
        self.max_log_files = 5
        
    def log(self, level: str, message: str, data: Dict = None):
        """Loguear un mensaje"""
        timestamp = datetime.now().isoformat()
        entry = {
            "timestamp": timestamp,
            "level": level,
            "name": self.name,
            "message": message,
            "data": data or {}
        }
        
        # Escribir a main log
        with open(self.main_log, 'a') as f:
            f.write(json.dumps(entry) + '\n')
        
        # Si es error, también escribir a error log
        if level == "ERROR":
            with open(self.error_log, 'a') as f:
                f.write(json.dumps(entry) + '\n')
        
        # Rotar logs si es necesario
        self._check_rotation()
        
        return entry
    
    def info(self, message: str, data: Dict = None):
        return self.log("INFO", message, data)
    
    def warning(self, message: str, data: Dict = None):
        return self.log("WARNING", message, data)
    
    def error(self, message: str, data: Dict = None):
        return self.log("ERROR", message, data)
    
    def success(self, message: str, data: Dict = None):
        return self.log("SUCCESS", message, data)
    
    def _check_rotation(self):
        """Rotar logs si superan el tamaño máximo"""
        for log_file in [self.main_log, self.error_log]:
            if log_file.exists() and log_file.stat().st_size > self.max_log_size:
                # Renombrar archivo actual
                for i in range(self.max_log_files - 1, 0, -1):
                    old = log_file.with_suffix(f'.{i}.log')
                    new = log_file.with_suffix(f'.{i+1}.log')
                    if old.exists():
                        old.rename(new)
                
                # Mover archivo actual a .1.log
                log_file.rename(log_file.with_suffix('.1.log'))
                
                # Crear nuevo archivo vacío
                log_file.touch()
    
    def get_recent_logs(self, hours: int = 24, level: str = None) -> List[Dict]:
        """Obtener logs recientes"""
        logs = []
        cutoff = datetime.now().timestamp() - (hours * 3600)
        
        if self.main_log.exists():
            with open(self.main_log, 'r') as f:
                for line in f:
                    try:
                        entry = json.loads(line.strip())
                        ts = datetime.fromisoformat(entry["timestamp"]).timestamp()
                        if ts > cutoff:
                            if level is None or entry["level"] == level:
                                logs.append(entry)
                    except:
                        pass
        
        return logs[-100:]  # Últimos 100 logs
    
    def get_stats(self) -> Dict:
        """Obtener estadísticas de logging"""
        stats = {
            "total_logs": 0,
            "by_level": {},
            "last_activity": None
        }
        
        if self.main_log.exists():
            with open(self.main_log, 'r') as f:
                for line in f:
                    try:
                        entry = json.loads(line.strip())
                        stats["total_logs"] += 1
                        lvl = entry.get("level", "UNKNOWN")
                        stats["by_level"][lvl] = stats["by_level"].get(lvl, 0) + 1
                        stats["last_activity"] = entry.get("timestamp")
                    except:
                        pass
        
        return stats
    
    def clear_logs(self):
        """Limpiar logs"""
        for log_file in [self.main_log, self.error_log]:
            if log_file.exists():
                log_file.unlink()
        self.log("INFO", "Logs cleared")

# Instancia global
logger = EnhancedLogger("PauloARIS")

# Registrar en memoria
logger.success("Logger inicializado", {
    "logs_dir": str(logger.logs_dir),
    "version": "2.0"
})

print("✅ Enhanced Logger v2.0 activado")
print(f"   📁 Directorio: {logger.logs_dir}")
