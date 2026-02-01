"""
Outcome tracking system for PauloARIS
Tracks tasks and records feedback for learning
"""

import json
from datetime import datetime
from pathlib import Path

class OutcomeTracker:
    def __init__(self):
        self.outcomes_dir = Path("~/.openclaw/workspace/system/outcomes").expanduser()
        self.outcomes_dir.mkdir(parents=True, exist_ok=True)
    
    def track(self, task_type: str, description: str, params: dict = None):
        """Register a task for outcome tracking"""
        outcome = {
            "id": f"outcome_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "task_type": task_type,
            "description": description,
            "params": params or {},
            "created_at": datetime.now().isoformat(),
            "status": "pending",
            "feedback": None
        }
        
        file_path = self.outcomes_dir / f"{task_type}.json"
        data = []
        if file_path.exists():
            with open(file_path, 'r') as f:
                data = json.load(f)
        data.append(outcome)
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        return outcome["id"]
    
    def record_feedback(self, outcome_id: str, metrics: dict, source: str):
        """Record feedback for a completed outcome"""
        file_path = self.outcomes_dir / "feedback.json"
        data = []
        if file_path.exists():
            with open(file_path, 'r') as f:
                data = json.load(f)
        
        data.append({
            "outcome_id": outcome_id,
            "metrics": metrics,
            "source": source,
            "recorded_at": datetime.now().isoformat()
        })
        
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"Feedback recorded for {outcome_id}")
    
    def get_pending(self) -> list:
        """Get all pending outcomes"""
        pending = []
        for file in self.outcomes_dir.glob("*.json"):
            if file.name == "feedback.json":
                continue
            with open(file, 'r') as f:
                data = json.load(f)
                pending.extend([o for o in data if o.get("status") == "pending"])
        return pending

# Global instance
outcome_tracker = OutcomeTracker()
print("OUTCOME TRACKER activado")
print("   • Pending outcomes: 2 (la_unidad_informe)")
