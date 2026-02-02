# Ralph Loop System - Documentación Técnica

**Versión:** 2.1  
**Fecha:** 2026-02-02  
**Autor:** PauloARIS AI Agent

---

## 📋 Descripción General

Ralph Loop es un sistema autónomo de auto-mejora diseñado para agentes de IA. Permite:
- Definición de tareas y proyectos
- Ejecución automática de mejoras
- Seguimiento de progreso
- Aprendizaje de patrones
- Checkpoints para recuperación

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                      RALPH LOOP ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  paulo.py   │───▶│ loop-runner │───▶│ learning.py │        │
│  │  (CLI)      │    │  (Executor) │    │ (Analyzer)  │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                                    │                 │
│         │                                    ▼                 │
│         │                            ┌─────────────┐          │
│         └───────────────────────────▶│ checkpoints │          │
│                                      │  (JSON)     │          │
│                                      └─────────────┘          │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │ alerts.py   │◀───│ dashboard   │◀───│  metrics    │        │
│  │ (Monitor)   │    │  (:3939)    │    │  (JSON)     │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Archivos del Sistema

| Archivo | Propósito |
|---------|----------|
| `state/paulo.py` | CLI para gestión de tareas |
| `state/loop-runner.py` | Motor de ejecución |
| `state/learning.py` | Análisis de patrones |
| `state/alerts.py` | Sistema de alertas |
| `state/checkpoints.json` | Estado guarddo |
| `state/ralph-progress.json` | Progreso de tareas |
| `state/dashboard.html` | Panel web |

---

## 🚀 Uso del Sistema

### Agregar Tarea
```bash
python3 state/paulo.py add "project" "descripción de tarea"
```

### Ver Estado
```bash
python3 state/paulo.py status
```

### Ejecutar Loop
```bash
python3 state/loop-runner.py run
```

### Verificar Salud
```bash
python3 state/alerts.py check
```

---

## 📊 Estructura de Datos

### Tarea
```json
{
  "project": "pauloaris",
  "task": "Nueva funcionalidad",
  "status": "pending",
  "priority": 1,
  "created_at": "2026-02-02T16:00:00",
  "completed_at": null
}
```

### Checkpoint
```json
{
  "timestamp": "2026-02-02T16:00:00",
  "iterations": 10,
  "tasks_completed": 20,
  "tasks_failed": 0,
  "metrics": {
    "cpu_load": [0.1, 0.2, 0.3],
    "memory_percent": 26.4,
    "temperature": 49.1
  }
}
```

---

## 🎯 Métricas

| Métrica | Descripción |
|---------|------------|
| **Iteraciones** | Veces que el loop se ha ejecutado |
| **Tasks Pending** | Tareas por hacer |
| **Tasks Completed** | Tareas finalizadas |
| **Success Rate** | % de tareas exitosas |

---

## 🔧 Integración

### Con Dashboard
```javascript
// Fetch status
const response = await fetch('/state/loop-runner.py/status');
const data = await response.json();
```

### Con APIs
```python
import httpx

# Get metrics
response = httpx.get('http://localhost:8082/api/metrics')
metrics = response.json()
```

---

## 📈 Evolución del Sistema

| Versión | Cambios |
|---------|---------|
| v2.0 | Sistema inicial |
| v2.1 | Checkpoints, Learning, Alerts |

---

**Documento generado:** 2026-02-02  
**Estado:** Activo
