#!/usr/bin/env python3
"""
Auto-Alerts System para PauloARIS
Notifica cuando el progreso se estanca o hay problemas
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path

RALPH_FILE = Path("/home/pi/.openclaw/workspace/state/ralph-progress.json")
ALERTS_FILE = Path("/home/pi/.openclaw/workspace/state/alerts.json")
STATE_FILE = Path("/home/pi/.openclaw/workspace/state/foundry-state.json")

THRESHOLDS = {
    "max_iterations_per_task": 10,
    "max_pending_tasks": 10,
    "stagnation_hours": 24,
    "failed_ratio": 0.3  # 30% failures = alert
}

def load_json(path, default=None):
    if path.exists():
        with open(path, 'r') as f:
            return json.load(f)
    return default if default is not None else {}

def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

def check_alerts():
    """Verifica condiciones de alerta"""
    alerts = load_json(ALERTS_FILE, {"active": [], "resolved": [], "last_check": None})
    new_alerts = []
    
    # Cargar datos
    progress = load_json(RALPH_FILE, {"tasks": [], "iterations": 0})
    
    # 1. Tareas pendientes altas
    pending = [t for t in progress.get("tasks", []) if t.get("status") == "pending"]
    if len(pending) >= THRESHOLDS["max_pending_tasks"]:
        new_alerts.append({
            "type": "queue_full",
            "severity": "medium",
            "message": f"High pending tasks: {len(pending)}",
            "timestamp": datetime.now().isoformat()
        })
    
    # 2. Tareas atascadas (muchas iteraciones)
    stuck_tasks = [t for t in progress.get("tasks", []) 
                   if t.get("status") == "in_progress" and t.get("iterations_spent", 0) >= THRESHOLDS["max_iterations_per_task"]]
    if stuck_tasks:
        for task in stuck_tasks:
            new_alerts.append({
                "type": "stuck_task",
                "severity": "high",
                "message": f"Task stuck: {task.get('task')} ({task.get('iterations_spent')} iterations)",
                "task_id": task.get("task"),
                "timestamp": datetime.now().isoformat()
            })
    
    # 3. Alta tasa de fallos
    completed = [t for t in progress.get("tasks", []) if t.get("status") in ["done", "failed"]]
    failed = [t for t in completed if t.get("status") == "failed"]
    if completed and len(failed) / len(completed) > THRESHOLDS["failed_ratio"]:
        new_alerts.append({
            "type": "high_failure_rate",
            "severity": "high",
            "message": f"Failure rate: {len(failed)}/{len(completed)} ({100*len(failed)/len(completed):.1f}%)",
            "timestamp": datetime.now().isoformat()
        })
    
    # 4. Estancamiento (sin progreso por horas)
    last_update = progress.get("lastUpdate")
    if last_update:
        last_time = datetime.fromisoformat(last_update)
        if datetime.now() - last_time > timedelta(hours=THRESHOLDS["stagnation_hours"]):
            new_alerts.append({
                "type": "stagnation",
                "severity": "low",
                "message": f"No progress since {last_update}",
                "timestamp": datetime.now().isoformat()
            })
    
    # Añadir nuevas alertas
    for alert in new_alerts:
        if not any(a.get("type") == alert.get("type") and a.get("message") == alert.get("message") 
                   for a in alerts.get("active", [])):
            alerts["active"].append(alert)
    
    alerts["last_check"] = datetime.now().isoformat()
    save_json(ALERTS_FILE, alerts)
    
    return {
        "success": True,
        "new_alerts": len(new_alerts),
        "total_active": len(alerts.get("active", [])),
        "alerts": new_alerts
    }

def list_alerts(severity=None):
    """Lista alertas activas"""
    alerts = load_json(ALERTS_FILE, {"active": []})
    
    active = alerts.get("active", [])
    if severity:
        active = [a for a in active if a.get("severity") == severity]
    
    return {
        "success": True,
        "count": len(active),
        "alerts": active
    }

def resolve_alert(alert_type: str):
    """Resuelve una alerta específica"""
    alerts = load_json(ALERTS_FILE, {"active": [], "resolved": []})
    
    for i, alert in enumerate(alerts.get("active", [])):
        if alert.get("type") == alert_type:
            alert["resolved"] = datetime.now().isoformat()
            alerts["resolved"].append(alerts["active"].pop(i))
            save_json(ALERTS_FILE, alerts)
            return {"success": True, "resolved": alert}
    
    return {"success": False, "error": "Alert not found"}

def get_status():
    """Resumen del sistema de alertas"""
    alerts = load_json(ALERTS_FILE, {"active": [], "resolved": []})
    
    return {
        "success": True,
        "status": "healthy" if not alerts.get("active") else "needs_attention",
        "active_count": len(alerts.get("active", [])),
        "resolved_count": len(alerts.get("resolved", [])),
        "last_check": alerts.get("last_check")
    }

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Auto-Alerts System")
        print("Usage: python3 alerts.py <command>")
        print("Commands: check, list, resolve, status")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "check":
        print(json.dumps(check_alerts(), indent=2))
    elif command == "list":
        severity = sys.argv[2] if len(sys.argv) > 2 else None
        print(json.dumps(list_alerts(severity), indent=2))
    elif command == "resolve":
        if len(sys.argv) > 2:
            print(json.dumps(resolve_alert(sys.argv[2]), indent=2))
        else:
            print("Usage: alerts.py resolve <alert_type>")
    elif command == "status":
        print(json.dumps(get_status(), indent=2))
    else:
        print("Unknown command")
