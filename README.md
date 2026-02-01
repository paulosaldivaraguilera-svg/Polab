# 🎯 POLAB - Infrastructure & Automation

**Sistema completo de infraestructura personal con automatización.**

## 📊 Estado General

| Componente | Estado | Descripción |
|------------|--------|-------------|
| **Comenzar** | ✅ Operativo | Landing page con captación de leads |
| **Docker Services** | ✅ 3 servicios | Portainer, Netdata, Uptime Kuma |
| **APIs** | ✅ Funcionando | Leads + Métricas |
| **Scripts** | ✅ 8 activos | Backup, Alerts, Health, etc. |
| **GitHub** | ✅ Sincronizado | Commits automáticos |

## 🚀 Quick Start

```bash
# Ver estado de servicios Comenzar
cd ~/.openclaw/workspace/projects/personal/comenzar-landing
./deploy.sh status

# Verificar todo el sistema
python3 ~/.openclaw/workspace/projects/tools/aris_agent.py report

# Verificar servicios
~/.openclaw/workspace/scripts/healthcheck.sh
```

## 📁 Estructura

```
~/.openclaw/workspace/
├── projects/
│   ├── personal/comenzar-landing/  # Landing + Dashboard + Analytics
│   ├── polab/                       # APIs (Leads, Métricas)
│   ├── gaming/elemental-pong/       # Juego WebGPU
│   ├── tools/                       # Scripts de automatización
│   └── craft/                       # Por definir
├── scripts/                         # Scripts de utilidad
│   ├── backup.sh                    # Backup diario (3AM)
│   ├── backup-full.sh               # Backup completo semanal
│   ├── restore.sh                   # Restore desde backup
│   ├── alerts.sh                    # Sistema de alertas
│   ├── healthcheck.sh               # Verificar servicios
│   └── metrics.sh                   # Métricas
├── services/                        # Docker
│   └── docker-compose.yml           # Portainer, Netdata, Uptime Kuma
├── state/                           # Estados
├── logs/                            # Logs
└── backups/                         # Backups
```

## 🌐 URLs de Acceso

| Servicio | URL/Puerto | Descripción |
|----------|------------|-------------|
| Landing | https://gerald-internet-brought-discovered.trycloudflare.com | Página principal |
| Dashboard | .../dashboard.html | Admin de leads |
| Analytics | .../analytics.html | Métricas |
| Portainer | http://localhost:9000 | Gestión Docker |
| Netdata | http://localhost:19999 | Monitoreo |
| Uptime Kuma | http://localhost:3001 | Uptime |

## 🔧 APIs

### API Leads (Puerto 8081)
- `POST /api/lead` - Recibir lead
- `GET /api/leads` - Listar leads
- `GET /api/stats` - Estadísticas

### API Métricas (Puerto 8082)
- `GET /api/metrics` - Métricas del sistema

## 📋 Scripts de Gestión

| Script | Uso | Frecuencia |
|--------|-----|------------|
| `./deploy.sh start/stop/restart/status` | Gestionar Comenzar | Manual |
| `aris_agent.py start` | Iniciar daemon monitoreo | Auto |
| `backup.sh` | Backup diario | 3AM |
| `backup-full.sh` | Backup completo | Domingos 4AM |
| `restore.sh` | Restore completo | Manual |
| `alerts.sh` | Verificar alertas | Cada 5 min |

## 🛡️ Recuperación

Si algo falla:
```bash
# 1. Verificar estado
./deploy.sh status

# 2. Reiniciar servicios
./deploy.sh restart

# 3. Ver logs
./deploy.sh logs

# 4. Restaurar desde backup (si es necesario)
./scripts/restore.sh
```

## 📈 Métricas Actuales

- Leads: 1
- CPU: ~4%
- RAM: ~19%
- Disco: 52%
- Uptime: 55+ minutos
- Servicios: 7/7 activos

## 🔒 Seguridad

- Secrets limpiados del historial de Git
- Backups automáticos
- Monitoreo 24/7

## 📝 Historial

Ver `CHANGELOG.md` para historial completo de cambios.

---

**Generado:** 2026-02-01 15:46 GMT-3
**Versión:** 2.0
**Estado:** ✅ Operativo
