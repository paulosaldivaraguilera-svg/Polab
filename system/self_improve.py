#!/usr/bin/env python3
"""
Self-improvement script for PauloARIS
Analyzes performance and suggests improvements
"""

import json
from pathlib import Path
from datetime import datetime, timedelta

class SelfImprove:
    def __init__(self):
        self.metrics_dir = Path("~/.openclaw/workspace/system/metrics")
        self.outcomes_dir = Path("~/.openclaw/workspace/system/outcomes")
    
    def analyze(self) -> dict:
        """Analyze current performance and suggest improvements"""
        suggestions = []
        
        # Check tool usage
        tool_file = self.metrics_dir / "tool_usage.json"
        if tool_file.exists():
            with open(tool_file, 'r') as f:
                tools = json.load(f)
            
            # Find underperforming tools
            slow_tools = [t for t in tools if t.get("duration_ms", 0) > 5000]
            if slow_tools:
                suggestions.append({
                    "type": "performance",
                    "message": f"{len(slow_tools)} tools taking >5s",
                    "action": "Consider caching or optimizing"
                })
        
        # Check pending outcomes
        outcomes_dir = Path("~/.openclaw/workspace/system/outcomes")
        pending = 0
        for file in outcomes_dir.glob("*.json"):
            if file.name == "feedback.json":
                continue
            with open(file, 'r') as f:
                data = json.load(f)
                pending += len([o for o in data if o.get("status") == "pending"])
        
        if pending > 0:
            suggestions.append({
                "type": "outcomes",
                "message": f"{pending} outcomes pending feedback",
                "action": "Record feedback to improve future performance"
            })
        
        # Memory check
        memory_file = Path("~/.openclaw/workspace/memory/2026-02-01.md")
        if memory_file.exists():
            with open(memory_file, 'r') as f:
                content = f.read()
            if "Próximos Pasos" in content:
                suggestions.append({
                    "type": "tasks",
                    "message": "Unfinished tasks in memory",
                    "action": "Review and complete or defer"
                })
        
        return {
            "timestamp": datetime.now().isoformat(),
            "suggestions": suggestions,
            "health_score": max(0, 100 - len(suggestions) * 20)
        }
    
    def run(self):
        """Run self-improvement analysis"""
        analysis = self.analyze()
        
        print(f"\n{'='*50}")
        print("   AUTO-ANÁLISIS DE PAULOARIS")
        print(f"{'='*50}")
        print(f"Timestamp: {analysis['timestamp']}")
        print(f"Health Score: {analysis['health_score']}/100")
        print(f"Suggestions: {len(analysis['suggestions'])}")
        
        for i, s in enumerate(analysis['suggestions'], 1):
            print(f"\n{i}. [{s['type'].upper()}] {s['message']}")
            print(f"   Action: {s['action']}")
        
        print(f"\n{'='*50}")
        
        return analysis

if __name__ == "__main__":
    si = SelfImprove()
    si.run()
