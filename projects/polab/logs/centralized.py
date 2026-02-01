"""
Sistema de logs centralizado para POLAB
"""

import logging
import json
from datetime import datetime
from pathlib import Path
from typing import Optional

class POLABLogger:
    def __init__(self, name: str = "POLAB"):
        self.logs_dir = Path("~/.openclaw/workspace/projects/polab/logs").expanduser()
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.DEBUG)
        
        # File handler
        file_handler = logging.FileHandler(
            self.logs_dir / f"{datetime.now().strftime('%Y-%m-%d')}.log"
        )
        file_handler.setLevel(logging.DEBUG)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        
        # Format
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)
    
    def info(self, message: str, **kwargs):
        self.logger.info(self._format(message, kwargs))
    
    def error(self, message: str, **kwargs):
        self.logger.error(self._format(message, kwargs))
    
    def warning(self, message: str, **kwargs):
        self.logger.warning(self._format(message, kwargs))
    
    def debug(self, message: str, **kwargs):
        self.logger.debug(self._format(message, kwargs))
    
    def _format(self, message: str, kwargs: dict) -> str:
        if kwargs:
            return f"{message} | {json.dumps(kwargs)}"
        return message
    
    def get_recent_logs(self, lines: int = 50) -> list:
        today_log = self.logs_dir / f"{datetime.now().strftime('%Y-%m-%d')}.log"
        if today_log.exists():
            with open(today_log, 'r') as f:
                return f.readlines()[-lines:]
        return []

# Instancia global
logger = POLABLogger()
print("CENTRALIZED LOGGING SYSTEM creado")
