"""
Goals Tracker v2 - PauloARIS
Sistema de metas avanzado con análisis predictivo
"""

import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

class GoalsTrackerV2:
    def __init__(self):
        self.goals_dir = Path("~/.openclaw/workspace/system/goals_v2").expanduser()
        self.goals_dir.mkdir(parents=True, exist_ok=True)
        self.goals_file = self.goals_dir / "goals.json"
        self.analytics_file = self.goals_dir / "analytics.json"
    
    def add_goal(self, goal: str, category: str = "general", 
                 deadline: str = None, priority: str = "medium") -> str:
        """Agregar nueva meta con prioridad"""
        data = self._load()
        
        goal_entry = {
            "id": f"goal_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "goal": goal,
            "category": category,
            "priority": priority,  # low, medium, high, critical
            "deadline": deadline,
            "status": "pending",
            "progress": 0,
            "created_at": datetime.now().isoformat(),
            "completed_at": None,
            "subtasks": [],
            "dependencies": [],
            "history": [{"action": "created", "at": datetime.now().isoformat()}]
        }
        
        data.append(goal_entry)
        self._save(data)
        return goal_entry["id"]
    
    def add_subtask(self, goal_id: str, subtask: str):
        """Añadir subtarea a una meta"""
        data = self._load()
        for goal in data:
            if goal["id"] == goal_id:
                goal["subtasks"].append({
                    "task": subtask,
                    "completed": False,
                    "created_at": datetime.now().isoformat()
                })
                goal["history"].append({
                    "action": "subtask_added",
                    "task": subtask,
                    "at": datetime.now().isoformat()
                })
                break
        self._save(data)
    
    def update_progress(self, goal_id: str, progress: int, checkpoint: str = None):
        """Actualizar progreso"""
        data = self._load()
        for goal in data:
            if goal["id"] == goal_id:
                old_progress = goal["progress"]
                goal["progress"] = min(100, max(0, progress))
                goal["history"].append({
                    "action": "progress_update",
                    "from": old_progress,
                    "to": goal["progress"],
                    "checkpoint": checkpoint,
                    "at": datetime.now().isoformat()
                })
                if goal["progress"] >= 100:
                    goal["status"] = "completed"
                    goal["completed_at"] = datetime.now().isoformat()
                break
        self._save(data)
    
    def get_analytics(self) -> Dict:
        """Análisis predictivo de metas"""
        data = self._load()
        
        now = datetime.now()
        total = len(data)
        completed = len([g for g in data if g["status"] == "completed"])
        pending = total - completed
        
        # Calcular velocidad promedio
        completion_times = []
        for g in data:
            if g["completed_at"]:
                created = datetime.fromisoformat(g["created_at"])
                completed_dt = datetime.fromisoformat(g["completed_at"])
                completion_times.append((completed_dt - created).total_seconds())
        
        avg_completion_hours = sum(completion_times) / len(completion_times) / 3600 if completion_times else 24
        
        # Metas críticas (high priority, soon deadline)
        critical = []
        for g in data:
            if g["priority"] in ["high", "critical"] and g["status"] == "pending":
                if g["deadline"]:
                    deadline = datetime.fromisoformat(g["deadline"])
                    days_left = (deadline - now).days
                    if days_left < 3:
                        critical.append(g)
        
        # Predicción de completitud
        predicted_completion = now + timedelta(hours=avg_completion_hours * pending)
        
        return {
            "total": total,
            "completed": completed,
            "pending": pending,
            "completion_rate": (completed / total * 100) if total > 0 else 0,
            "avg_completion_hours": avg_completion_hours,
            "critical_goals": len(critical),
            "critical_list": [{"goal": g["goal"], "deadline": g["deadline"]} for g in critical],
            "predicted_completion": predicted_completion.isoformat(),
            "by_category": self._count_by_category(data),
            "by_priority": self._count_by_priority(data)
        }
    
    def _count_by_category(self, data: List) -> Dict:
        counts = {}
        for g in data:
            counts[g["category"]] = counts.get(g["category"], 0) + 1
        return counts
    
    def _count_by_priority(self, data: List) -> Dict:
        counts = {}
        for g in data:
            counts[g["priority"]] = counts.get(g["priority"], 0) + 1
        return counts
    
    def _load(self) -> List:
        if self.goals_file.exists():
            with open(self.goals_file, 'r') as f:
                return json.load(f)
        return []
    
    def _save(self, data: List):
        with open(self.goals_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        # Actualizar analytics
        analytics = self.get_analytics()
        with open(self.analytics_file, 'w') as f:
            json.dump(analytics, f, indent=2)

# Instancia global
goals_v2 = GoalsTrackerV2()

# Añadir algunos goals de auto-mejora
goals_v2.add_goal("Configurar Foundry para self-modification", "system", "2026-02-02", "high")
goals_v2.add_goal("Implementar vector memory para búsqueda semántica", "system", "2026-02-03", "medium")
goals_v2.add_goal("Mejorar sistema de logging con análisis", "system", "2026-02-02", "medium")
goals_v2.add_goal("Crear nuevo juego o herramienta", "project", "2026-02-03", "high")

print("✅ Goals Tracker v2 activado")
print(f"📁 Analytics: {goals_v2.analytics_file}")

# Mostrar analytics
analytics = goals_v2.get_analytics()
print(f"\n📊 ANALYTICS:")
print(f"   Total goals: {analytics['total']}")
print(f"   Completed: {analytics['completed']}")
print(f"   Pending: {analytics['pending']}")
print(f"   Rate: {analytics['completion_rate']:.1f}%")
print(f"   Avg completion: {analytics['avg_completion_hours']:.1f} horas")
print(f"   Critical: {analytics['critical_goals']}")
