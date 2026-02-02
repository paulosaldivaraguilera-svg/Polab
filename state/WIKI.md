# PauloARIS Technical Wiki

**Versión:** 1.0  
**Fecha:** 2026-02-02  
**Estado:** En desarrollo

---

## 📋 Índice

1. [Arquitectura del Sistema](#arquitectura)
2. [Componentes Principales](#componentes)
3. [Flujos de Trabajo](#flujos)
4. [Configuración](#configuracion)
5. [Despliegue](#despliegue)
6. [Mantenimiento](#mantenimiento)
7. [Solución de Problemas](#problemas)

---

## 1. Arquitectura del Sistema {#arquitectura}

```
┌─────────────────────────────────────────────────────────────┐
│                    PAULOARIS ECOSYSTEM                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   GATEWAY   │───▶│   AGENT     │───▶│   SKILLS    │     │
│  │  (WebSocket)│    │  (Runtime)  │    │  (Modules)  │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                 │                  │              │
│         ▼                 ▼                  ▼              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              MEMORY (Persisted)                     │   │
│  │  SOUL.md | USER.md | AGENTS.md | MEMORY.md         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              AUTO-IMPROVEMENT LAYER                 │   │
│  │  Ralph Loop | Learning | Alerts | Checkpoints       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tecnologías Base

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| Runtime | Node.js + TypeScript | Core del sistema |
| OS | Raspberry Pi OS 64-bit | Sistema operativo |
| Hardware | Raspberry Pi 5 (8GB) | Servidor |
| Storage | SD Card + SSD USB3 | Persistencia |

---

## 2. Componentes Principales {#componentes}

### 2.1 Gateway (Puerto Variable)

El Gateway gestiona la comunicación entre canales y el agente.

**Archivos clave:**
- Configuración: `~/.openclaw/config/`
- Logs: `~/.openclaw/workspace/logs/`

### 2.2 Agent Runtime

Ejecuta las instrucciones del LLM y gestiona herramientas.

**Herramientas disponibles:**
- `read` - Leer archivos
- `write` - Escribir archivos
- `exec` - Ejecutar comandos shell
- `message` - Enviar mensajes
- `web_search` - Búsqueda web
- `web_fetch` - Obtener contenido web

### 2.3 Memory System

Sistema de memoria jerárquica:

| Tipo | Archivo | Propósito |
|------|---------|-----------|
| SOUL.md | Personalidad del agente |
| USER.md | Preferencias del usuario |
| AGENTS.md | Instrucciones operativas |
| MEMORY.md | Memoria a largo plazo |
| memory/YYYY-MM-DD.md | Notas diarias |

### 2.4 Auto-Improvement Layer

Sistema Ralph Loop para mejora continua:

```
state/
├── ralph-lite.py        ← CLI de gestión
├── loop-runner.py       ← Ejecutor automático
├── learning.py          ← Análisis de patrones
├── alerts.py            ← Sistema de alertas
├── checkpoints.json     ← Puntos de recovery
└── ralph-progress.json  ← Estado de tareas
```

---

## 3. Flujos de Trabajo {#flujos}

### 3.1 Flujo de Mensajes

```
Usuario → WhatsApp/Telegram → Gateway → Agent → LLM → Response → Usuario
```

### 3.2 Flujo de Mejora Continua

```
1. Tarea añadida a cola (paulo.py add)
2. Loop runner ejecuta (loop-runner.py run)
3. Learning analiza patrones (learning.py analyze)
4. Insights guardados (learnings.json)
5. Estado persistido (ralph-progress.json)
```

### 3.3 Flujo de Backup

```
Script (scripts/backup.sh) → Git snapshot + Tar backups → Limpieza automática
```

---

## 4. Configuración {#configuracion}

### 4.1 Variables de Entorno

```bash
~/.openclaw/.env
```

### 4.2 Archivos de Configuración

| Archivo | Propósito |
|---------|-----------|
| `~/.openclaw/config/channels.json` | Configuración de canales |
| `~/.openclaw/config/models.json` | Configuración de LLMs |

### 4.3 Channels Habilitados

- WhatsApp (Meta Cloud API)
- Telegram (Bot API)
- WebChat

---

## 5. Despliegue {#despliegue}

### 5.1 Iniciar Servicios

```bash
# Ver estado
python3 state/paulo.py status

# Ver tareas
python3 state/paulo.py tasks

# Ejecutar loop
python3 state/loop-runner.py run
```

### 5.2 Verificar Servicios

```bash
# Health check
./scripts/healthcheck.sh

# Ver métricas
python3 state/paulo.py metrics
```

### 5.3 Dashboard

Acceso: `http://localhost:3939` (si está configurado)

---

## 6. Mantenimiento {#mantenimiento}

### 6.1 Tareas Programadas

| Frecuencia | Tarea | Comando |
|------------|-------|---------|
| Cada 5 min | Health check | `scripts/healthcheck.sh` |
| Diario 3AM | Backup | `scripts/backup.sh` |
| Manual | Mejoras | `state/loop-runner.py run` |

### 6.2 Monitoreo

```bash
# Estado del sistema
python3 state/paulo.py status

# Métricas
python3 state/paulo.py metrics

# Alertas
python3 state/alerts.py check
```

### 6.3 Recuperación

```bash
# Restaurar checkpoint
python3 state/paulo.py checkpoint <nombre> restore
```

---

## 7. Solución de Problemas {#problemas}

### 7.1 Servicios Caídos

```bash
# Verificar servicios
./scripts/healthcheck.sh

# Revisar logs
tail -f ~/.openclaw/workspace/logs/*.log
```

### 7.2 Ralph Loop Atascado

```bash
# Ver estado
python3 state/paulo.py status

# Forzar nueva iteración
python3 state/loop-runner.py run
```

### 7.3 Pérdida de Datos

```bash
# Listar checkpoints
python3 state/paulo.py checkpoint list

# Restaurar
python3 state/paulo.py checkpoint <nombre> restore
```

---

## 📚 Documentación Relacionada

| Documento | Descripción |
|-----------|-------------|
| `state/openclaw-architecture-reference.md` | Arquitectura OpenClaw |
| `state/legaltech-architecture-2026.md` | Contexto Legaltech |
| `state/edge-ai-raspberry-pi-reference.md` | Hardware AI |
| `HEARTBEAT.md` | Rutinas autónomas |

---

**Última actualización:** 2026-02-02  
**Mantenedor:** Sistema PauloARIS (auto-generado)
