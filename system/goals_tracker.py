"""
Goals Tracker para PauloARIS
Sistema de metas y seguimiento de progreso
"""

import json
from datetime import datetime, timedelta
from pathlib import Path

class GoalsTracker:
    def __init__(self):
        self.goals_dir = Path("~/.openclaw/workspace/system/goals").expanduser()
        self.goals_dir.mkdir(parents=True, exist_ok=True)
        self.goals_file = self.goals_dir / "goals.json"
    
    def add_goal(self, goal: str, category: str = "general", deadline: str = None):
        """Agregar una nueva meta"""
        data = self._load()
        
        goal_entry = {
            "id": f"goal_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "goal": goal,
            "category": category,
            "deadline": deadline,
            "status": "pending",
            "progress": 0,
            "created_at": datetime.now().isoformat(),
            "completed_at": None,
            "checkpoints": []
        }
        
        data.append(goal_entry)
        self._save(data)
        return goal_entry["id"]
    
    def update_progress(self, goal_id: str, progress: int, checkpoint: str = None):
        """Actualizar progreso de una meta"""
        data = self._load()
        
        for goal in data:
            if goal["id"] == goal_id:
                goal["progress"] = min(100, max(0, progress))
                if goal["progress"] >= 100:
                    goal["status"] = "completed"
                    goal["completed_at"] = datetime.now().isoformat()
                if checkpoint:
                    goal["checkpoints"].append({
                        "checkpoint": checkpoint,
                        "progress": progress,
                        "at": datetime.now().isoformat()
                    })
                break
        
        self._save(data)
    
    def get_goals(self, category: str = None, status: str = None) -> list:
        """Obtener metas filtradas"""
        data = self._load()
        
        if category:
            data = [g for g in data if g["category"] == category]
        if status:
            data = [g for g in data if g["status"] == status]
        
        return sorted(data, key=lambda x: x.get("created_at", ""), reverse=True)
    
    def get_dashboard(self) -> dict:
        """Obtener dashboard de metas"""
        data = self._load()
        
        total = len(data)
        completed = len([g for g in data if g["status"] == "completed"])
        pending = total - completed
        
        by_category = {}
        for goal in data:
            cat = goal["category"]
            by_category[cat] = by_category.get(cat, 0) + 1
        
        return {
            "total": total,
            "completed": completed,
            "pending": pending,
            "completion_rate": (completed / total * 100) if total > 0 else 0,
            "by_category": by_category,
            "recent_completed": [g["goal"][:50] for g in data if g["status"] == "completed"][:5],
            "upcoming_deadlines": []
        }
    
    def _load(self) -> list:
        if self.goals_file.exists():
            with open(self.goals_file, 'r') as f:
                return json.load(f)
        return []
    
    def _save(self, data: list):
        with open(self.goals_file, 'w') as f:
            json.dump(data, f, indent=2)

# Ejemplo de uso
if __name__ == "__main__":
    tracker = GoalsTracker()
    
    # Agregar metas iniciales
    tracker.add_goal("Configurar Foundry", "system", "2026-02-02")
    tracker.add_goal("Publicar post en Moltbook", "content", "2026-02-01")
    tracker.add_goal("Mejorar juegos existentes", "games", "2026-02-03")
    tracker.add_goal("Sincronizar con GitHub", "devops", None)
    tracker.add_goal("Registrar feedback de outcomes", "learning", "2026-02-01")
    
    # Mostrar dashboard
    print("📊 GOALS DASHBOARD")
    print("="*50)
    dash = tracker.get_dashboard()
    print(f"Total goals: {dash['total']}")
    print(f"Completed: {dash['completed']}")
    print(f"Pending: {dash['pending']}")
    print(f"Completion rate: {dash['completion_rate']:.1f}%")
    print(f"By category: {dash['by_category']}")
