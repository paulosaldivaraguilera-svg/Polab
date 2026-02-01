# POLAB - Sistema de Gestión Integral

**Versión:** 2.0  
**Fecha:** 2026-02-01

## 📊 Resumen

POLAB es un sistema completo para la gestión de un bufete de abogados independientes, con integración de IA, automatización de captación de clientes y gestión de casos.

## 🏗️ Arquitectura

```
POLAB/
├── api_leads.py        # API para leads (puerto 8081)
├── api_metrics.py      # API para métricas (puerto 8082)
├── api_metrics_v2.py   # API metrics mejorada
├── whatsapp_notifier.py # Notificaciones WhatsApp
├── calendar.py         # Gestión de calendario
├── deploy.sh           # Deploy original
├── deploy_v2.sh        # Deploy mejorado v2
├── config/
│   └── schema.py       # Configuración Pydantic
├── notifications/
│   └── system.py       # Sistema de notificaciones
├── templates/
│   └── dashboard_v2.html # Dashboard v2.0
├── db/
│   └── leads.db        # Base de datos de leads
└── data/
    └── notifications/  # Notificaciones guardadas
```

## 🚀 Servicios

| Puerto | Servicio | Estado |
|--------|----------|--------|
| 8081 | API Leads | ✅ Online |
| 8082 | API Metrics | ✅ Online |
| 9000 | Portainer | ✅ Online |
| 19999 | Netdata | ✅ Online |
| 3001 | Uptime Kuma | ✅ Online |

## 📈 Métricas

- **Leads capturados:** 1+ (en DB)
- **Servicios activos:** 5+
- **Commits hoy:** 25+
- **Juegos mejorados:** 3 (v2.x → v2.4)

## 🎮 Juegos del Proyecto

| Juego | Versión | Casos/Locaciones |
|-------|---------|------------------|
| Elemental Pong | v2.4 | Power-ups, Leaderboard |
| Recta Provincia | v2.4 | 7 locaciones, 5 rituales, bosses |
| Delitos | v2.4 | 5 casos de investigación |

## 🔧 Scripts de Automatización

- `backup.sh` - Backup diario (3 AM)
- `backup-weekly-enhanced.sh` - Backup semanal
- `deploy_v2.sh` - Deploy con verificación
- `healthcheck.sh` - Verificación de salud
- `alerts.sh` - Sistema de alertas
- `notifications.sh` - Notificaciones

## 📱 Canales

- **WhatsApp:** +56974349077
- **Web:** https://gerald-internet-brought-discovered.trycloudflare.com
- **Dashboard:** .../dashboard.html
- **Analytics:** .../analytics.html

## 🔗 Links

- **GitHub:** https://github.com/paulosaldivaraguilera-svg/Polab
- **Moltbook:** @PauloARIS
- **Sitio web:** paulosaldivar.cv

## 🛡️ Seguridad

- API keys guardadas en `~/.config/moltbook/`
- Backups automáticos
- Permisos 600 en archivos sensibles

---

*Documentación generada automáticamente - POLAB v2.0*
