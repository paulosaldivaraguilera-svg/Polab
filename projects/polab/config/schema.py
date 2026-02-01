"""
Configuración tipada para POLAB - Basado en nanobot architecture
"""

from pathlib import Path
from pydantic import BaseModel, Field
from typing import Optional

# ============ WhatsApp ============
class WhatsAppConfig(BaseModel):
    enabled: bool = False
    bridge_url: str = "ws://localhost:3001"
    allow_from: list[str] = Field(default_factory=list)
    owner_number: str = "+56974349077"

# ============ Leads ============
class LeadsConfig(BaseModel):
    db_path: str = "~/.openclaw/workspace/projects/polab/db/leads.db"
    auto_save: bool = True
    notify_on_new: bool = True

# ============ Landing Page ============
class LandingConfig(BaseModel):
    url: str = "https://gerald-internet-brought-discovered.trycloudflare.com"
    dashboard_path: str = "/dashboard.html"
    analytics_enabled: bool = False
    ga_tracking_id: Optional[str] = None

# ============ Services ============
class ServicesConfig(BaseModel):
    port_leads: int = 8081
    port_metrics: int = 8082
    health_check_interval: int = 300  # 5 minutos

# ============ Backup ============
class BackupConfig(BaseModel):
    enabled: bool = True
    daily_hour: int = 3  # 3 AM
    retention_days: int = 7
    include_docker: bool = True
    include_db: bool = True
    include_workspace: bool = True

# ============ Main Config ============
class POLABConfig(BaseModel):
    version: str = "1.0.0"
    workspace: str = "~/.openclaw/workspace"
    whatsapp: WhatsAppConfig = Field(default_factory=WhatsAppConfig)
    leads: LeadsConfig = Field(default_factory=LeadsConfig)
    landing: LandingConfig = Field(default_factory=LandingConfig)
    services: ServicesConfig = Field(default_factory=ServicesConfig)
    backup: BackupConfig = Field(default_factory=BackupConfig)

# Instancia global
config = POLABConfig()
