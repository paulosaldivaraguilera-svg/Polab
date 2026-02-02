"""
Structured Logger v1.1 - PauloARIS
Logging estructurado avanzado con structlog
"""

import structlog
import sys

def setup_logger():
    """Configurar logger estructurado"""
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.dev.ConsoleRenderer(),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

# Configurar
setup_logger()

log = structlog.get_logger()

def log_info(message: str, **kwargs):
    log.info(message, **kwargs)

def log_error(message: str, **kwargs):
    log.error(message, **kwargs)

def log_warning(message: str, **kwargs):
    log.warning(message, **kwargs)

print("✅ Structured Logger configurado")

# Test
log_info("Logger inicializado", system="PauloARIS", version="2.1")
