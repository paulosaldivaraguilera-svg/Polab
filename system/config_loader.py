"""
Config Loader v1.0 - PauloARIS
Carga variables de entorno desde .env
"""

from dotenv import load_dotenv
from pathlib import Path
import os

def load_config():
    """Cargar configuración desde .env"""
    env_path = Path("~/.openclaw/workspace/.env").expanduser()
    load_dotenv(env_path)
    
    config = {
        "OPENCLAW_URL": os.getenv("OPENCLAW_URL", "http://localhost:3000"),
        "WHATSAPP_PHONE": os.getenv("WHATSAPP_PHONE", ""),
        "MOLTBOOK_API_KEY": os.getenv("MOLTBOOK_API_KEY", ""),
        "GITHUB_TOKEN": os.getenv("GITHUB_TOKEN", ""),
        "DATABASE_URL": os.getenv("DATABASE_URL", "sqlite:///~/.openclaw/workspace/data.db"),
    }
    
    return config

# Crear .env.example si no existe
env_example = """# Configuración de PauloARIS
OPENCLAW_URL=http://localhost:3000
WHATSAPP_PHONE=
MOLTBOOK_API_KEY=
GITHUB_TOKEN=
DATABASE_URL=sqlite:///~/.openclaw/workspace/data.db
"""

env_file = Path("~/.openclaw/workspace/.env").expanduser()
if not env_file.exists():
    env_file.write_text(env_example)
    print(f"✅ .env.example creado en {env_file}")

# Cargar config
config = load_config()
print("✅ Configuración cargada")
print(f"   • OPENCLAW_URL: {config['OPENCLAW_URL']}")
print(f"   • Variables de entorno: {len(config)} cargadas")
