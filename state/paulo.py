#!/usr/bin/env python3
"""
PauloARIS CLI - Comandos útiles para gestión del sistema
"""

import json
import sys
from pathlib import Path
from datetime import datetime

STATE_DIR = Path("/home/pi/.openclaw/workspace/state")
RALPH_FILE = STATE_DIR / "ralph-progress.json"
FOUNDRY_FILE = STATE_DIR / "foundry-state.json"
CHECKPOINTS_FILE = STATE_DIR / "checkpoints.json"

def cmd_status():
    """Estado general del sistema"""
    # Load data
    ralph = {"tasks": [], "iterations": 0}
    if RALPH_FILE.exists():
        ralph = json.loads(RALPH_FILE.read_text())
    
    foundry = {"selfImproving": True}
    if FOUNDRY_FILE.exists():
        foundry = json.loads(FOUNDRY_FILE.read_text())
    
    # Count tasks
    pending = len([t for t in ralph.get("tasks", []) if t.get("status") == "pending"])
    completed = len([t for t in ralph.get("tasks", []) if t.get("status") == "done"])
    failed = len([t for t in ralph.get("tasks", []) if t.get("status") == "failed"])
    
    output = {
        "system": "PauloARIS v2.1",
        "selfImproving": foundry.get("selfImproving", True),
        "ralphLoop": {
            "status": "active",
            "iterations": ralph.get("iterations", 0),
            "tasks": {
                "pending": pending,
                "completed": completed,
                "failed": failed,
                "total": pending + completed + failed
            }
        },
        "timestamp": datetime.now().isoformat()
    }
    
    print(json.dumps(output, indent=2))
    return output

def cmd_tasks(filter_status="all"):
    """Lista tareas"""
    if RALPH_FILE.exists():
        tasks = json.loads(RALPH_FILE.read_text()).get("tasks", [])
    else:
        tasks = []
    
    if filter_status != "all":
        tasks = [t for t in tasks if t.get("status") == filter_status]
    
    for i, task in enumerate(tasks, 1):
        status_icon = {"pending": "⏳", "in_progress": "🔄", "done": "✅", "failed": "❌"}
        print(f"{i}. [{task.get('project', 'unknown')}] {task.get('task')}")
        print(f"   Status: {status_icon.get(task.get('status'), '?')} {task.get('status')}")
        print(f"   Priority: {task.get('priority', 1)}")
        print()

def cmd_add(project, task_desc, priority=1):
    """Añade una nueva tarea"""
    ralph = {"tasks": [], "iterations": 0}
    if RALPH_FILE.exists():
        ralph = json.loads(RALPH_FILE.read_text())
    
    ralph["tasks"].append({
        "project": project,
        "task": task_desc,
        "priority": priority,
        "status": "pending",
        "created": datetime.now().isoformat(),
        "iterations_spent": 0
    })
    
    RALPH_FILE.write_text(json.dumps(ralph, indent=2))
    print(f"✅ Tarea añadida: [{project}] {task_desc}")

def cmd_complete(task_index):
    """Marca tarea como completada"""
    if RALPH_FILE.exists():
        ralph = json.loads(RALPH_FILE.read_text())
    else:
        ralph = {"tasks": [], "iterations": 0}
    
    try:
        idx = int(task_index) - 1
        if 0 <= idx < len(ralph["tasks"]):
            ralph["tasks"][idx]["status"] = "done"
            ralph["tasks"][idx]["completed"] = datetime.now().isoformat()
            RALPH_FILE.write_text(json.dumps(ralph, indent=2))
            print(f"✅ Tarea completada: {ralph['tasks'][idx]['task']}")
        else:
            print(f"❌ Índice inválido: {task_index}")
    except ValueError:
        print("❌ Uso: complete <número>")

def cmd_checkpoint(name, action="save"):
    """Gestiona checkpoints"""
    checkpoints = {}
    if CHECKPOINTS_FILE.exists():
        checkpoints = json.loads(CHECKPOINTS_FILE.read_text())
    
    if action == "save":
        checkpoints[name] = {
            "timestamp": datetime.now().isoformat(),
            "ralph": json.loads(RALPH_FILE.read_text()) if RALPH_FILE.exists() else {}
        }
        CHECKPOINTS_FILE.write_text(json.dumps(checkpoints, indent=2))
        print(f"✅ Checkpoint guardado: {name}")
    
    elif action == "restore":
        if name in checkpoints:
            data = checkpoints[name]
            RALPH_FILE.write_text(json.dumps(data.get("ralph", {})))
            print(f"✅ Restaurado desde: {name}")
        else:
            print(f"❌ Checkpoint no encontrado: {name}")
    
    elif action == "list":
        print("📋 Checkpoints:")
        for name, data in checkpoints.items():
            print(f"  - {name}: {data['timestamp']}")
    
    else:
        print(f"❌ Acción inválida: {action}")

def cmd_metrics():
    """Métricas del sistema"""
    ralph = {"tasks": [], "iterations": 0}
    if RALPH_FILE.exists():
        ralph = json.loads(RALPH_FILE.read_text())
    
    tasks = ralph.get("tasks", [])
    
    # Calculate metrics
    total = len(tasks)
    completed = len([t for t in tasks if t.get("status") == "done"])
    failed = len([t for t in tasks if t.get("status") == "failed"])
    pending = total - completed - failed
    
    # Time metrics
    completed_tasks = [t for t in tasks if t.get("completed")]
    if completed_tasks:
        total_time = sum(t.get("iterations_spent", 0) for t in completed_tasks)
        avg_iterations = total_time / len(completed_tasks) if completed_tasks else 0
    else:
        avg_iterations = 0
    
    metrics = {
        "summary": {
            "total": total,
            "completed": completed,
            "pending": pending,
            "failed": failed,
            "success_rate": round(completed / total * 100, 1) if total > 0 else 0
        },
        "performance": {
            "total_iterations": ralph.get("iterations", 0),
            "avg_iterations_per_task": round(avg_iterations, 2)
        },
        "projects": {}
    }
    
    # By project
    projects = {}
    for task in tasks:
        proj = task.get("project", "unknown")
        if proj not in projects:
            projects[proj] = {"total": 0, "completed": 0}
        projects[proj]["total"] += 1
        if task.get("status") == "done":
            projects[proj]["completed"] += 1
    
    metrics["projects"] = projects
    
    print(json.dumps(metrics, indent=2))
    return metrics

def cmd_help():
    """Ayuda"""
    help_text = """
PauloARIS CLI v2.1
====================

USO: python3 paulo.py <comando> [argumentos]

COMANDOS:
  status              Estado general del sistema
  tasks [estado]      Lista tareas (pending/done/all)
  add <proy> <desc> [prio]  Añade tarea
  complete <n>        Completa tarea n
  checkpoint <nom> [save|restore|list]  Gestiona checkpoints
  metrics             Métricas del sistema
  help                Muestra esta ayuda

EJEMPLOS:
  python3 paulo.py status
  python3 paulo.py add "e-commerce" "Deploy VPS" 1
  python3 paulo.py tasks pending
  python3 paulo.py complete 1
  python3 paulo.py metrics

"""
    print(help_text)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        cmd_help()
    else:
        command = sys.argv[1]
        
        if command == "status":
            cmd_status()
        elif command == "tasks":
            filter_status = sys.argv[2] if len(sys.argv) > 2 else "all"
            cmd_tasks(filter_status)
        elif command == "add":
            if len(sys.argv) > 3:
                project = sys.argv[2]
                task_desc = sys.argv[3]
                priority = int(sys.argv[4]) if len(sys.argv) > 4 else 1
                cmd_add(project, task_desc, priority)
            else:
                print("❌ Uso: add <proyecto> <descripción> [prioridad]")
        elif command == "complete":
            if len(sys.argv) > 2:
                cmd_complete(sys.argv[2])
            else:
                print("❌ Uso: complete <número>")
        elif command == "checkpoint":
            name = sys.argv[2] if len(sys.argv) > 2 else "default"
            action = sys.argv[3] if len(sys.argv) > 3 else "save"
            cmd_checkpoint(name, action)
        elif command == "metrics":
            cmd_metrics()
        elif command in ["help", "--help", "-h"]:
            cmd_help()
        else:
            print(f"❌ Comando desconocido: {command}")
            print("Usa: python3 paulo.py help")
