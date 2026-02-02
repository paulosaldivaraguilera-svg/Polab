"""
Smart Logger v2 - PauloARIS
Logger con análisis de patrones y predicciones
"""

import json
from datetime import datetime
from pathlib import Path
from collections import defaultdict

class SmartLogger:
    def __init__(self):
        self.logs_dir = Path("~/.openclaw/workspace/system/logs_v2").expanduser()
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        self.main_log = self.logs_dir / "smart_log.json"
        self.patterns_file = self.logs_dir / "patterns.json"
    
    def log(self, level, message, context=None):
        entry = {
            "timestamp": datetime.now().isoformat(),
            "level": level,
            "message": message,
            "context": context or {},
            "day_of_week": datetime.now().strftime("%A"),
            "hour": datetime.now().hour
        }
        
        data = self._load()
        data.append(entry)
        with open(self.main_log, 'w') as f:
            json.dump(data[-1000:], f, indent=2)
        
        self._detect_patterns(entry)
        return entry
    
    def _detect_patterns(self, entry):
        patterns = self._load_patterns()
        
        if entry["level"] == "ERROR":
            key = f"error_{entry['message'][:50]}"
            patterns["errors"][key] = patterns["errors"].get(key, 0) + 1
        
        hour = entry["hour"]
        patterns["activity_by_hour"][str(hour)] = patterns["activity_by_hour"].get(str(hour), 0) + 1
        
        msg = entry["message"].lower()
        if "github" in msg or "commit" in msg:
            patterns["categories"]["devops"] += 1
        elif "game" in msg or "pong" in msg:
            patterns["categories"]["games"] += 1
        elif "web" in msg or "html" in msg:
            patterns["categories"]["web"] += 1
        elif "api" in msg:
            patterns["categories"]["api"] += 1
        
        self._save_patterns(patterns)
    
    def get_analytics(self):
        data = self._load()
        patterns = self._load_patterns()
        
        by_level = defaultdict(int)
        by_hour = defaultdict(int)
        
        for entry in data:
            by_level[entry["level"]] += 1
            by_hour[str(entry["hour"])] += 1
        
        best_hour = max(by_hour.items(), key=lambda x: x[1])[0] if by_hour else "N/A"
        
        return {
            "total_entries": len(data),
            "by_level": dict(by_level),
            "best_hour": best_hour,
            "activity_by_hour": dict(patterns["activity_by_hour"]),
            "categories": dict(patterns["categories"]),
            "top_errors": sorted(patterns["errors"].items(), key=lambda x: x[1], reverse=True)[:5]
        }
    
    def _load(self):
        if self.main_log.exists():
            with open(self.main_log, 'r') as f:
                return json.load(f)
        return []
    
    def _load_patterns(self):
        if self.patterns_file.exists():
            with open(self.patterns_file, 'r') as f:
                return json.load(f)
        return {"errors": {}, "activity_by_hour": {}, "categories": defaultdict(int)}
    
    def _save_patterns(self, patterns):
        with open(self.patterns_file, 'w') as f:
            json.dump(patterns, f, indent=2)

# Test
logger = SmartLogger()
logger.log("INFO", "Smart Logger v2 inicializado", {"version": "2.0"})

analytics = logger.get_analytics()
print("Smart Logger v2 activated")
print(f"Total entries: {analytics['total_entries']}")
print(f"Best hour: {analytics['best_hour']}")
print(f"Categories: {analytics['categories']}")
