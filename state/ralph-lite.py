#!/usr/bin/env python3
"""
Ralph Loop Lite para PauloARIS
Sistema de auto-mejora y tracking de progreso
"""

import json
import os
from datetime import datetime
from pathlib import Path

STATE_FILE = Path("/home/pi/.openclaw/workspace/state/foundry-state.json")
CHECKPOINTS_FILE = Path("/home/pi/.openclaw/workspace/state/checkpoints.json")
RALPH_FILE = Path("/home/pi/.openclaw/workspace/state/ralph-progress.json")

def load_state():
    if STATE_FILE.exists():
        with open(STATE_FILE, 'r') as f:
            return json.load(f)
    return {"version": "1.0", "selfImproving": True}

def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def add_task(project: str, task: str, priority: int = 1):
    """Añade una tarea al Ralph Loop"""
    state = load_state()
    
    progress = {
        "tasks": [],
        "iterations": 0,
        "lastUpdate": datetime.now().isoformat()
    }
    if RALPH_FILE.exists():
        with open(RALPH_FILE, 'r') as f:
            progress = json.load(f)
    
    progress["tasks"].append({
        "project": project,
        "task": task,
        "priority": priority,
        "status": "pending",
        "created": datetime.now().isoformat(),
        "iterations_spent": 0
    })
    
    with open(RALPH_FILE, 'w') as f:
        json.dump(progress, f, indent=2)
    
    return {"success": True, "task": task, "project": project}

def next_task(project: str = None):
    """Obtiene la siguiente tarea pendiente"""
    if RALPH_FILE.exists():
        with open(RALPH_FILE, 'r') as f:
            progress = json.load(f)
        
        tasks = progress.get("tasks", [])
        
        if project:
            tasks = [t for t in tasks if t["project"] == project]
        
        pending = [t for t in tasks if t["status"] == "pending"]
        if pending:
            # Ordenar por prioridad
            pending.sort(key=lambda x: (-x["priority"], x["created"]))
            return pending[0]
    
    return None

def complete_task(task_id: str, success: bool = True):
    """Marca una tarea como completada"""
    if RALPH_FILE.exists():
        with open(RALPH_FILE, 'r') as f:
            progress = json.load(f)
        
        for task in progress["tasks"]:
            if task["task"] == task_id:
                task["status"] = "done" if success else "failed"
                task["completed"] = datetime.now().isoformat()
                break
        
        progress["iterations"] += 1
        progress["lastUpdate"] = datetime.now().isoformat()
        
        with open(RALPH_FILE, 'w') as f:
            json.dump(progress, f, indent=2)
    
    return {"success": True}

def status():
    """Muestra el estado actual del sistema"""
    state = load_state()
    
    progress = {"tasks": [], "iterations": 0}
    if RALPH_FILE.exists():
        with open(RALPH_FILE, 'r') as f:
            progress = json.load(f)
    
    return {
        "version": state.get("version"),
        "selfImproving": state.get("selfImproving", True),
        "totalTasks": len(progress.get("tasks", [])),
        "completed": len([t for t in progress.get("tasks", []) if t["status"] == "done"]),
        "pending": len([t for t in progress.get("tasks", []) if t["status"] == "pending"]),
        "iterations": progress.get("iterations", 0),
        "lastUpdate": progress.get("lastUpdate")
    }

def checkpoint(session_key: str, action: str = "save"):
    """Sistema de checkpoints para recuperación"""
    checkpoints = {}
    if CHECKPOINTS_FILE.exists():
        with open(CHECKPOINTS_FILE, 'r') as f:
            checkpoints = json.load(f)
    
    if action == "save":
        checkpoints[session_key] = {
            "timestamp": datetime.now().isoformat(),
            "state": load_state()
        }
        with open(CHECKPOINTS_FILE, 'w') as f:
            json.dump(checkpoints, f, indent=2)
        return {"success": True, "action": "saved", "session": session_key}
    
    elif action == "restore":
        if session_key in checkpoints:
            return {"success": True, "checkpoint": checkpoints[session_key]}
        return {"success": False, "error": "checkpoint not found"}
    
    elif action == "list":
        return {"success": True, "checkpoints": list(checkpoints.keys())}
    
    return {"success": False, "error": "invalid action"}

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Ralph Loop Lite - Auto-mejora system")
        print("Usage: python3 ralph-lite.py <command> [args]")
        print("Commands: status, add-task, next-task, complete-task, checkpoint")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "status":
        print(json.dumps(status(), indent=2))
    elif command == "add-task":
        project = sys.argv[2] if len(sys.argv) > 2 else "default"
        task = sys.argv[3] if len(sys.argv) > 3 else "Unknown task"
        print(json.dumps(add_task(project, task), indent=2))
    elif command == "next-task":
        project = sys.argv[2] if len(sys.argv) > 2 else None
        print(json.dumps(next_task(project), indent=2))
    elif command == "complete-task":
        task_id = sys.argv[2] if len(sys.argv) > 2 else None
        print(json.dumps(complete_task(task_id), indent=2))
    elif command == "checkpoint":
        session = sys.argv[2] if len(sys.argv) > 2 else "default"
        action = sys.argv[3] if len(sys.argv) > 3 else "save"
        print(json.dumps(checkpoint(session, action), indent=2))
    else:
        print("Unknown command")
