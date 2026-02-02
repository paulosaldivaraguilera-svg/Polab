#!/usr/bin/env python3
"""
Learning System para PauloARIS
Detecta patrones y optimiza automáticamente
"""

import json
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict

STATE_FILE = Path("/home/pi/.openclaw/workspace/state/foundry-state.json")
PATTERNS_FILE = Path("/home/pi/.openclaw/workspace/state/patterns.json")
LEARNINGS_FILE = Path("/home/pi/.openclaw/workspace/state/learnings.json")

def load_json(path, default):
    if path.exists():
        with open(path, 'r') as f:
            return json.load(f)
    return default

def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

def analyze_patterns():
    """Analiza patrones de uso y rendimiento"""
    patterns = load_json(PATTERNS_FILE, {"detected": [], "metrics": []})
    learnings = load_json(LEARNINGS_FILE, {"insights": [], "optimizations": []})
    
    # Patrón 1: Tipos de tareas más frecuentes
    task_types = defaultdict(int)
    
    # Analizar progreso
    progress = load_json(Path("/home/pi/.openclaw/workspace/state/ralph-progress.json"), {})
    for task in progress.get("tasks", []):
        project = task.get("project", "unknown")
        task_types[project] += 1
    
    # Generar insight
    if task_types:
        top_project = max(task_types, key=task_types.get)
        insight = {
            "type": "frequency",
            "description": f"Project '{top_project}' has most tasks ({task_types[top_project]})",
            "recommendation": "Consider allocating more resources to this project",
            "timestamp": datetime.now().isoformat()
        }
        learnings["insights"].append(insight)
    
    # Patrón 2: Tiempo promedio por tarea
    completed = [t for t in progress.get("tasks", []) if t.get("status") == "done"]
    if completed:
        avg_iterations = sum(t.get("iterations_spent", 1) for t in completed) / len(completed)
        optimization = {
            "type": "performance",
            "metric": f"Avg iterations per task: {avg_iterations:.1f}",
            "recommendation": "Optimize for fewer iterations if above 3" if avg_iterations > 3 else "Performance is optimal",
            "timestamp": datetime.now().isoformat()
        }
        learnings["optimizations"].append(optimization)
    
    # Guardar aprendizajes
    save_json(PATTERNS_FILE, patterns)
    save_json(LEARNINGS_FILE, learnings)
    
    return {
        "success": True,
        "patterns_detected": len(patterns.get("detected", [])),
        "insights_generated": len(learnings.get("insights", [])),
        "optimizations": len(learnings.get("optimizations", []))
    }

def get_learnings():
    """Obtiene todos los aprendizajes acumulados"""
    learnings = load_json(LEARNINGS_FILE, {"insights": [], "optimizations": []})
    patterns = load_json(PATTERNS_FILE, {"detected": []})
    
    return {
        "success": True,
        "learnings": learnings,
        "patterns": patterns.get("detected", [])
    }

def apply_optimization(optimization_id: int):
    """Aplica una optimización específica"""
    learnings = load_json(LEARNINGS_FILE, {"insights": [], "optimizations": []})
    
    if optimization_id < len(learnings.get("optimizations", [])):
        opt = learnings["optimizations"][optimization_id]
        # Aquí se aplicaría la optimización real
        opt["applied"] = datetime.now().isoformat()
        save_json(LEARNINGS_FILE, learnings)
        return {"success": True, "applied": opt}
    
    return {"success": False, "error": "Optimization not found"}

def suggest_improvement():
    """Genera sugerencia de mejora basada en patrones"""
    learnings = load_json(LEARNINGS_FILE, {"insights": [], "optimizations": []})
    
    suggestions = []
    
    # Sugerencia basada en tareas pendientes
    progress = load_json(Path("/home/pi/.openclaw/workspace/state/ralph-progress.json"), {})
    pending = [t for t in progress.get("tasks", []) if t.get("status") == "pending"]
    
    if len(pending) > 5:
        suggestions.append({
            "type": "queue_manage",
            "message": f"High pending tasks ({len(pending)}). Consider completing some before adding new ones.",
            "priority": "medium"
        })
    
    # Sugerencia basada en iteraciones
    if progress.get("iterations", 0) > 20:
        suggestions.append({
            "type": "efficiency",
            "message": "High iteration count. Consider implementing more automated checks.",
            "priority": "high"
        })
    
    return {
        "success": True,
        "suggestions": suggestions
    }

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Learning System - Auto-optimization")
        print("Usage: python3 learning.py <command>")
        print("Commands: analyze, get-learnings, suggest, apply <id>")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "analyze":
        print(json.dumps(analyze_patterns(), indent=2))
    elif command == "get-learnings":
        print(json.dumps(get_learnings(), indent=2))
    elif command == "suggest":
        print(json.dumps(suggest_improvement(), indent=2))
    elif command == "apply" and len(sys.argv) > 2:
        print(json.dumps(apply_optimization(int(sys.argv[2])), indent=2))
    else:
        print("Unknown command")
