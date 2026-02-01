"""
Self-metrics system for PauloARIS
Tracks agent performance, tool usage, and outcomes
"""

import json
from datetime import datetime
from pathlib import Path

class SelfMetrics:
    def __init__(self):
        self.metrics_dir = Path("~/.openclaw/workspace/system/metrics").expanduser()
        self.metrics_dir.mkdir(parents=True, exist_ok=True)
    
    def record_tool_usage(self, tool_name: str, duration_ms: int, success: bool):
        """Record tool usage for analysis"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "tool": tool_name,
            "duration_ms": duration_ms,
            "success": success
        }
        file_path = self.metrics_dir / "tool_usage.json"
        self._append(file_path, entry)
    
    def record_decision(self, decision: str, outcome: str = None):
        """Record significant decisions for learning"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "decision": decision,
            "outcome": outcome
        }
        file_path = self.metrics_dir / "decisions.json"
        self._append(file_path, entry)
    
    def get_tool_stats(self) -> dict:
        """Get tool usage statistics"""
        file_path = self.metrics_dir / "tool_usage.json"
        if not file_path.exists():
            return {}
        
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        stats = {}
        for entry in data:
            tool = entry["tool"]
            if tool not in stats:
                stats[tool] = {"count": 0, "total_ms": 0, "success": 0}
            stats[tool]["count"] += 1
            stats[tool]["total_ms"] += entry.get("duration_ms", 0)
            if entry.get("success"):
                stats[tool]["success"] += 1
        
        return stats
    
    def _append(self, file_path: Path, entry: dict):
        data = []
        if file_path.exists():
            with open(file_path, 'r') as f:
                data = json.load(f)
        data.append(entry)
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)

# Global instance
self_metrics = SelfMetrics()
print("SELF-METRICS SYSTEM activado")
