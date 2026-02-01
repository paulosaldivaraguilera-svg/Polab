# 🎯 COMENZAR - RESUMEN DE PROYECTO

**Fecha:** 2026-02-01  
**Estado:** ✅ OPERATIVO  
**IP del servidor:** 192.168.1.31

---

## 🌐 URLs DE ACCESO

| Servicio | URL | Puerto | Descripción |
|----------|-----|--------|-------------|
| Landing Page | https://gerald-internet-brought-discovered.trycloudflare.com | 8080 | Página principal |
| Dashboard Leads | .../dashboard.html | 8080 | Ver leads captados |
| Métricas | .../metrics.html | 8080 | Panel de métricas |
| API Leads | http://localhost:8081 | 8081 | Recibe formularios |
| API Métricas | http://localhost:8082/api/metrics | 8082 | Stats del sistema |

---

## 🏗️ ARQUITECTURA

```
Internet (Cloudflare Tunnel)
        ↓
    :8080 - Python HTTP Server (Landing Page)
        ↓
    :8081 - API Python (Leads) → WhatsApp
        ↓
    :8082 - API Python (Métricas)
        ↓
    SQLite DB (/home/pi/.openclaw/workspace/projects/polab/db/leads.db)
```

---

## 🔧 SERVICIOS ACTIVOS

### Propios
| Servicio | Puerto | Estado | Script |
|----------|--------|--------|--------|
| Web Server | 8080 | ✅ UP | start |
| API Leads | 8081 | ✅ UP | api_server.py |
| API Métricas | 8082 | ✅ UP | api_metrics.py |
| Cloudflare Tunnel | -- | ✅ UP | Tunnel público |

### Docker
| Servicio | Puerto | URL | Propósito |
|----------|--------|-----|-----------|
| Portainer | 9000 | http://localhost:9000 | Gestión Docker |
| Netdata | 19999 | http://localhost:19999 | Monitoreo |
| Uptime Kuma | 3001 | http://localhost:3001 | Uptime |

---

## 📊 BASES DE DATOS

### Leads (SQLite)
- **Path:** `/home/pi/.openclaw/workspace/projects/polab/db/leads.db`
- **Tabla:** `leads`
- **Campos:** id, nombre, telefono, email, servicio, fuente, estado, fecha

---

## 🔄 FLUJO DE CAPTACIÓN

```
1. Cliente visita landing
2. Completa formulario
3. POST /api/lead
4. Guarda en SQLite
5. Genera URL WhatsApp
6. Notificación a Paulo
7. Dashboard muestra lead
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
~/.openclaw/workspace/
├── projects/
│   ├── personal/comenzar-landing/
│   │   ├── index.html          # Landing
│   │   ├── dashboard.html      # Leads admin
│   │   ├── metrics.html        # System metrics
│   │   ├── deploy.sh           # Gestión
│   │   └── README.md
│   │
│   └── polab/
│       ├── api_leads.py        # API original
│       ├── api_server.py       # API mejorada
│       ├── api_metrics.py      # Métricas
│       └── db/leads.db         # SQLite
│
├── scripts/
│   ├── backup.sh               # Backup diario 3AM
│   ├── healthcheck.sh          # Verificar servicios
│   ├── alerts.sh               # Sistema de alertas
│   └── metrics.sh              # Recopilar métricas
│
├── services/
│   └── docker-compose.yml      # Portainer, Netdata, Uptime Kuma
│
└── logs/                       # Logs de servicios
```

---

## ⚙️ SCRIPTS DE GESTIÓN

| Script | Uso | Frecuencia |
|--------|-----|------------|
| `./deploy.sh start` | Iniciar todos | Manual |
| `./deploy.sh stop` | Detener todos | Manual |
| `./deploy.sh status` | Ver estado | Manual |
| `./deploy.sh logs` | Ver logs | Manual |
| `~/.comenzar-keepalive.sh` | Auto-restart | Cada 5 min |
| `~/.openclaw/workspace/scripts/backup.sh` | Backup | Diario 3AM |
| `~/.openclaw/workspace/scripts/alerts.sh` | Alertas | Cada 5 min |

---

## 🚨 TROUBLESHOOTING

### Ver estado rápido
```bash
./deploy.sh status
~/.openclaw/workspace/scripts/healthcheck.sh
```

### Ver logs
```bash
./deploy.sh logs
tail -f ~/.openclaw/workspace/logs/*.log
```

### Reiniciar todo
```bash
./deploy.sh restart
```

### Verificar servicios
```bash
curl http://localhost:8081/api/stats  # Leads
curl http://localhost:8082/api/metrics  # Sistema
```

---

## 📈 MÉTRICAS ACTUALES

- **Leads Total:** 1
- **Leads Nuevos:** 1
- **CPU:** ~2%
- **RAM:** ~19%
- **Disco:** 52%
- **Uptime:** 45+ minutos

---

## 🔮 PRÓXIMOS PASOS (OPCIONALES)

1. **Dominio propio:** Registrar comenzar.cl (~10 USD/año)
2. **Hosting permanente:** Conectar a Vercel/Netlify
3. **SSL:** HTTPS automático con Vercel
4. **Alertas:** Configurar email/SMS para notificaciones
5. **Analytics:** Google Analytics en landing

---

## 📞 SOPORTE

- **Dashboard Leads:** http://localhost:8080/dashboard.html
- **Métricas:** http://localhost:8080/metrics.html
- **Portainer:** http://localhost:9000
- **Netdata:** http://localhost:19999
- **Uptime Kuma:** http://localhost:3001

---

**Generado:** 2026-02-01 15:33 GMT-3
**Versión:** 1.0
