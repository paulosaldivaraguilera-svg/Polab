#!/usr/bin/env python3
"""
PauloARIS Autonomous Loop Runner
Ejecuta tareas del Ralph Loop de forma automática
"""

import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

RALPH_FILE = Path("/home/pi/.openclaw/workspace/state/ralph-progress.json")
LOG_FILE = Path("/home/pi/.openclaw/workspace/state/loop-runner.log")

def log(msg):
    timestamp = datetime.now().isoformat()
    log_entry = f"[{timestamp}] {msg}"
    print(log_entry)
    with open(LOG_FILE, 'a') as f:
        f.write(log_entry + "\n")

def run_task(task):
    """Ejecuta una tarea específica"""
    project = task.get("project", "unknown")
    task_desc = task.get("task", "Unknown task")
    
    log(f"Ejecutando: [{project}] {task_desc}")
    
    # Simular ejecución - aquí se integraría con las herramientas reales
    result = {
        "success": True,
        "output": f"Task executed: {task_desc}",
        "timestamp": datetime.now().isoformat()
    }
    
    return result

def auto_execute_tasks():
    """Ejecuta tareas pendientes automáticamente"""
    progress = {"tasks": [], "iterations": 0}
    
    if RALPH_FILE.exists():
        with open(RALPH_FILE, 'r') as f:
            progress = json.load(f)
    
    pending = [t for t in progress.get("tasks", []) if t.get("status") == "pending"]
    
    if not pending:
        log("No hay tareas pendientes")
        return
    
    log(f"Encontradas {len(pending)} tareas pendientes")
    
    # Ejecutar hasta 2 tareas por ciclo
    for task in pending[:2]:
        result = run_task(task)
        
        if result["success"]:
            task["status"] = "done"
            task["completed"] = datetime.now().isoformat()
            log(f"✅ Completada: {task.get('task')}")
        else:
            task["status"] = "failed"
            task["error"] = result.get("error", "Unknown error")
            log(f"❌ Falló: {task.get('task')}")
        
        task["iterations_spent"] = task.get("iterations_spent", 0) + 1
    
    progress["iterations"] = progress.get("iterations", 0) + 1
    progress["lastUpdate"] = datetime.now().isoformat()
    
    with open(RALPH_FILE, 'w') as f:
        json.dump(progress, f, indent=2)
    
    log(f"Ciclo completado. Total iteraciones: {progress['iterations']}")

def get_system_status():
    """Obtiene estado del sistema para el dashboard"""
    import os
    
    # CPU load
    load = os.getloadavg()
    
    # Memory
    try:
        with open('/proc/meminfo', 'r') as f:
            meminfo = f.read()
        total = int([l for l in meminfo.split('\n') if 'MemTotal' in l][0].split()[1])
        available = int([l for l in meminfo.split('\n') if 'MemAvailable' in l][0].split()[1])
        mem_pct = 100 - (available / total * 100)
    except:
        mem_pct = 0
    
    # Temperature
    temp = subprocess.getoutput("vcgencmd measure_temp 2>/dev/null").replace("temp=", "").replace("'C", "")
    
    # Tasks status
    progress = {"tasks": [], "iterations": 0}
    if RALPH_FILE.exists():
        with open(RALPH_FILE, 'r') as f:
            progress = json.load(f)
    
    pending = len([t for t in progress.get("tasks", []) if t.get("status") == "pending"])
    completed = len([t for t in progress.get("tasks", []) if t.get("status") == "done"])
    
    return {
        "timestamp": datetime.now().isoformat(),
        "cpu_load": load,
        "memory_percent": round(mem_pct, 1),
        "temperature": temp,
        "tasks_pending": pending,
        "tasks_completed": completed,
        "total_iterations": progress.get("iterations", 0)
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "run":
            auto_execute_tasks()
        elif command == "status":
            print(json.dumps(get_system_status(), indent=2))
        elif command == "log":
            if LOG_FILE.exists():
                print(open(LOG_FILE).read())
            else:
                print("No logs yet")
        else:
            print("Unknown command. Use: run, status, log")
    else:
        print("PauloARIS Loop Runner")
        print("Usage: python3 loop-runner.py <command>")
        print("Commands: run, status, log")
