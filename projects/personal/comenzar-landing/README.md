# 🌐 Comenzar - Landing Page & Sistema de Leads

Sistema completo para captación de clientes con integración WhatsApp.

## 🚀 Quick Start

```bash
# Ver estado
./deploy.sh status

# Iniciar servicios
./deploy.sh start

# Ver logs
./deploy.sh logs
```

## 📂 Estructura

```
comenzar-landing/
├── index.html          # Landing page principal
├── dashboard.html      # Panel de administración
├── deploy.sh           # Script de gestión
├── .gitignore
└── README.md
```

## 🔗 URLs de Acceso

| Servicio | URL | Puerto |
|----------|-----|--------|
| Landing Page | http://localhost:8080 | 8080 |
| Dashboard | http://localhost:8080/dashboard.html | 8080 |
| API Stats | http://localhost:8081/api/stats | 8081 |
| API Leads | http://localhost:8081/api/lead | 8081 |

## 🔧 API Endpoints

### POST /api/lead
Recibe datos del formulario.

```bash
curl -X POST http://localhost:8081/api/lead \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","telefono":"+56999999999","email":"juan@email.com","servicio":"pyme"}'
```

### GET /api/leads
Lista todos los leads.

```bash
curl http://localhost:8081/api/leads
```

### GET /api/stats
Estadísticas rápidas.

```bash
curl http://localhost:8081/api/stats
# {"total":5,"nuevos":3}
```

## 🛠️ Comandos de Gestión

| Comando | Descripción |
|---------|-------------|
| `./deploy.sh start` | Iniciar web + API + tunnel |
| `./deploy.sh stop` | Detener todos los servicios |
| `./deploy.sh restart` | Reiniciar servicios |
| `./deploy.sh update` | Actualizar código desde Git |
| `./deploy.sh status` | Ver estado actual |
| `./deploy.sh logs` | Ver logs en tiempo real |
| `./deploy.sh backup` | Crear backup |

## 🔄 Mantenimiento Automático

El sistema incluye:
- **Cloudflare Tunnel**: URL pública automática
- **Auto-restart**: Si algún servicio cae, se reinicia
- **Backup diario**: A las 3 AM (`/home/pi/backups`)

## 📊 Database

- **Ubicación**: `/home/pi/.openclaw/workspace/projects/polab/db/leads.db`
- **Tipo**: SQLite
- **Tablas**: `leads` (id, nombre, telefono, email, servicio, fuente, estado, fecha)

## 🐳 Docker Services

Los servicios de monitoreo están disponibles:

| Servicio | Puerto | URL |
|----------|--------|-----|
| Portainer | 9000 | http://localhost:9000 |
| Netdata | 19999 | http://localhost:19999 |
| Uptime Kuma | 3001 | http://localhost:3001 |

## 📱 Flujo de Leads

```
1. Cliente completa formulario en landing
2. POST /api/lead → Guarda en DB SQLite
3. Genera URL WhatsApp con datos del cliente
4. Notificación instantanea a Paulo
5. Dashboard muestra leads en tiempo real
```

## 🔒 Seguridad

- API solo acepta conexiones locales por defecto
- Para producción, configurar dominio y SSL
- Cambiar passwords de Uptime Kuma en primer acceso

## 📈 Próximos Pasos (Producción)

1. [ ] Configurar dominio propio (ej: comenzar.cl)
2. [ ] Conectar a Vercel/Netlify para hosting permanente
3. [ ] Configurar SSL/HTTPS
4. [ ] Cambiar password de Uptime Kuma
5. [ ] Configurar alertas de notificaciones

---

**Última actualización**: 2026-02-01
**Estado**: ✅ Operativo
