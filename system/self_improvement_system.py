"""
Self Improvement System v1.0 - PauloARIS
Sistema integrado de auto-mejora usando todos los paquetes instalados
"""

import json
from datetime import datetime
from pathlib import Path
from system.semantic_memory import SemanticMemory
from system.structured_logger import log_info, log_error
from system.config_loader import load_config

class SelfImprovementSystem:
    def __init__(self):
        self.memory = SemanticMemory()
        self.config = load_config()
        self.goals_file = Path("~/.openclaw/workspace/system/goals_v3.json").expanduser()
        self.metrics_file = Path("~/.openclaw/workspace/system/metrics_v3.json").expanduser()
        
        log_info("SelfImprovementSystem inicializado", version="1.0")
    
    def track_metric(self, metric_name: str, value: float):
        """Registrar métrica"""
        self.memory.add(
            text=f"Métrica: {metric_name} = {value}",
            metadata={"type": "metric", "name": metric_name, "value": value}
        )
        
        # Guardar en archivo
        metrics = self._load_json(self.metrics_file)
        if metric_name not in metrics:
            metrics[metric_name] = []
        metrics[metric_name].append({
            "value": value,
            "timestamp": datetime.now().isoformat()
        })
        self._save_json(self.metrics_file, metrics)
        
        return True
    
    def add_goal(self, goal: str, deadline: str = None):
        """Agregar meta"""
        self.memory.add(
            text=f"Meta: {goal} (deadline: {deadline})",
            metadata={"type": "goal", "goal": goal, "deadline": deadline}
        )
        
        goals = self._load_json(self.goals_file)
        goals.append({
            "goal": goal,
            "deadline": deadline,
            "created": datetime.now().isoformat(),
            "status": "pending"
        })
        self._save_json(self.goals_file, goals)
        
        return True
    
    def analyze_performance(self) -> dict:
        """Analizar rendimiento"""
        # Obtener métricas de memoria
        all_memories = self.memory.get_all(limit=100)
        
        # Contar por tipo
        types = {}
        for doc in all_memories.get('metadatas', []):
            t = doc.get('type', 'unknown')
            types[t] = types.get(t, 0) + 1
        
        return {
            "total_memories": self.memory.count(),
            "memories_by_type": types,
            "config_loaded": len(self.config),
            "timestamp": datetime.now().isoformat()
        }
    
    def _load_json(self, path):
        if path.exists():
            with open(path, 'r') as f:
                return json.load(f)
        return {}
    
    def _save_json(self, path, data):
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)

# Inicializar sistema
system = SelfImprovementSystem()

# Tracking de métricas del día
system.track_metric("iterations", 13)
system.track_metric("commits", 45)
system.track_metric("packages_installed", 6)
system.track_metric("health_score", 100)

# Agregar metas
system.add_goal("Implementar RAG con langchain", "2026-02-02")
system.add_goal("Mejorar sistema de memoria", "2026-02-03")
system.add_goal("Configurar Foundry", "2026-02-04")

# Análisis
analysis = system.analyze_performance()

print()
print("╔════════════════════════════════════════════════════════════════╗")
print("║           SELF-IMPROVEMENT SYSTEM v1.0                    ║")
print("╚════════════════════════════════════════════════════════════════╝")
print()
print(f"📊 Métricas del sistema:")
print(f"   • Total memorias: {analysis['total_memories']}")
print(f"   • Por tipo: {analysis['memories_by_type']}")
print(f"   • Config cargada: {analysis['config_loaded']} vars")
print()
print("✅ Sistema de auto-mejora integrado activo")
