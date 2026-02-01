"""
Sistema de notificaciones para POLAB
"""

from datetime import datetime
from pathlib import Path
import json

class NotificationSystem:
    def __init__(self, workspace: str = "~/.openclaw/workspace"):
        self.workspace = Path(workspace)
        self.notifications_dir = self.workspace / "projects/polab/data/notifications"
        self.notifications_dir.mkdir(parents=True, exist_ok=True)
    
    def send(self, title: str, message: str, type: str = "info", priority: str = "normal") -> str:
        notification = {
            "id": f"notif_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "title": title,
            "message": message,
            "type": type,
            "priority": priority,
            "created_at": datetime.now().isoformat(),
            "read": False
        }
        file_path = self.notifications_dir / f"{notification['id']}.json"
        with open(file_path, 'w') as f:
            json.dump(notification, f, indent=2)
        return notification["id"]
    
    def get_all(self, unread_only: bool = False) -> list:
        notifications = []
        for file in self.notifications_dir.glob("*.json"):
            with open(file, 'r') as f:
                data = json.load(f)
            if not unread_only or not data.get('read'):
                notifications.append(data)
        return sorted(notifications, key=lambda x: x['created_at'], reverse=True)
    
    def get_unread_count(self) -> int:
        return len(self.get_all(unread_only=True))

notifications = NotificationSystem()
print("SISTEMA DE NOTIFICACIONES creado")
