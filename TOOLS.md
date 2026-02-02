# TOOLS.md - Local Notes

## Hardware

### Raspberry Pi 5 (Polab Core)
- **Modelo:** BCM2712 (Cortex-A76 64-bit quad-core @ 2.4GHz)
- **RAM:** 8GB LPDDR4X (7.6GB disponibles)
- **Almacenamiento:** SD Card + SSD USB3
- **Temperatura:** 48.7°C (bajo load)
- **Swap:** 2GB configurado
- **Hostname:** polab
- **IP:** 192.168.1.31

### Estado Térmico
- ✅ Active Cooler funcionando
- ✅ Temperatura estable bajo 50°C
- ⚠️ Monitorizar bajo carga de IA

---

## Software & Servicios

### Servicios Activos

| Servicio | Puerto | URL | Propósito |
|----------|--------|-----|-----------|
| **Comenzar Landing** | 8080 | Cloudflare Tunnel | Landing page principal |
| **API Leads** | 8081 | localhost | Recepción de leads |
| **API Métricas** | 8082 | localhost | Dashboard metrics |
| **Portainer** | 9000 | localhost | Gestión Docker |
| **Netdata** | 19999 | localhost | Monitoreo |
| **Uptime Kuma** | 3001 | localhost | Uptime |

### Docker Services
```bash
# Ver estado
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## APIs & Configuraciones

### APIs Configuradas

| API | Key/Token | Uso |
|-----|-----------|-----|
| **Moltbook** | moltbook_sk_... | Social network agents |
| **WhatsApp Business** | Meta Cloud API | Messaging |
| **Anthropic Claude** | API Key configurada | LLM inference |
| **OpenAI** | Por configurar | LLM backup |

### Archivos de Configuración
- `~/.openclaw/.env` - Variables de entorno
- `~/.openclaw/config/` - Configuraciones específicas

---

## Raspberry Pi 5 - Optimización AI

### Rendimiento LLM Local

| Framework | Modelo | Estado | Notas |
|-----------|--------|--------|-------|
| **Ollama** | Por instalar | ⏳ Pendiente | API local para LLMs |
| **llamafile** | Por evaluar | ⏳ Pendiente | Menor overhead |
| **Whisper** | Por instalar | ⏳ Pendiente | Transcripción voz |

### Aceleración NPU

| Hardware | Estado | Uso |
|----------|--------|-----|
| **Hailo-8L** | ⏳ No instalado | Vision AI (13 TOPS) |
| **Hailo-8** | ⏳ No instalado | Multi-model (26 TOPS) |

---

## Proyectos & Paths

### Proyectos Activos

| Proyecto | Path | Estado |
|----------|------|--------|
| **Comenzar** | `projects/personal/comenzar-landing/` | ✅ Operativo |
| **E-commerce PyME** | `projects/polab/e-commerce-pyme-chile.md` | 📋 Planificado |
| **Web Personal** | `projects/personal/paulosaldivar-cv/` | ✅ Mejorado |
| **Polab APIs** | `projects/polab/` | ✅ Funcionando |

### Scripts Útiles

| Script | Uso |
|--------|-----|
| `./deploy.sh start/stop/status` | Gestionar Comenzar |
| `state/ralph-lite.py status` | Ver estado Ralph Loop |
| `state/learning.py analyze` | Analizar patrones |
| `state/alerts.py check` | Verificar alertas |

---

## Contactos Importantess

| Contacto | Canal | Propósito |
|----------|-------|-----------|
| **+56974349077** | WhatsApp | Propietario (Paulo) |
| **+56992203278** | WhatsApp | Javier (Polab co-founder) |
| **+56984349077** | WhatsApp | Pablo (Polab co-founder) |

---

## Notas de Seguridad

- **Usuario:** pi (no root)
- **SSH:** Habilitado con keys
- **Tailscale:** Por configurar (acceso remoto seguro)
- **Ejecución:** `security.executionPolicy: "ask"`

---

## Recursos del Sistema (Live)

```
CPU:     BCM2712 @ 2.4GHz (4 cores)
RAM:     7.6GB total, 5.6GB disponible
Temp:    48.7°C
Disk:    Verificar con df -h
```

---

*Actualizado: 2026-02-02*
