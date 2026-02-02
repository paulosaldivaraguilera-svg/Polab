# HEARTBEAT.md - PauloARIS Autonomous Routines

**Versión:** 1.0  
**Fecha:** 2026-02-02  
**Propósito:** Instrucciones para operación autónoma periódica

---

## 📋 Periodic Checks (Rotate through these)

| Frecuencia | Check | Archivo de Estado |
|------------|-------|-------------------|
| **Cada 30 min** | Mensajes pendientes | `check_messages.sh` |
| **Cada 4 horas** | Métricas proyectos | `state/foundry-state.json` |
| **Diario (9:00)** | Resumen del día anterior | `memory/YYYY-MM-DD.md` |
| **Diario (18:00)** | Próximos eventos | `memory/YYYY-MM-DD.md` |
| **Semanal (Dom)** | Revisión MEMORY.md | MEMORY.md |

---

## 🔔 When to Reach Out

### ✅ Contactar al humano SI:

- **Email urgente** detectado (palabras clave: urgente, importante, deadline)
- **Evento de calendario** en menos de 2 horas
- **Error crítico** en servicios (Comenzar abajo, API fallando)
- **Feedback recibido** de tareas importantes (leads nuevos, mensajes de Javier)
- **Han pasado más de 8 horas** sin interacción humana

### ❌ NO contactar (solo HEARTBEAT_OK):

- Es de noche (23:00-08:00) a menos que sea urgente
- El humano está ocupado (contexto de "trabajando", "reuniones")
- Ya-checkeó hace menos de 30 minutos
- Solo hay mensajes casuales entre terceros

---

## 📊 Métricas a Recopilar en Cada Check

### Sistema

```bash
# Verificar servicios activos
./deploy.sh status

# CPU y RAM
htop -n 1 -b

# Verificar APIs
curl -s http://localhost:8081/api/stats
curl -s http://localhost:8082/api/metrics
```

### Proyectos

| Proyecto | Check |
|----------|-------|
| **Comenzar** | Leads nuevos en db? |
| **E-commerce** | Feedback de Javier? |
| **Web Personal** | Deploy completado? |
| **Foundry** | Outcomes pendientes? |

---

## 🧠 Memory Maintenance (Weekly)

Cada domingo, ejecutar:

```bash
# 1. Leer日记 de la semana
cat memory/YYYY-MM-DD/*.md

# 2. Identificar insights clave
# - Decisiones importantes
# - Patrones recurrentes  
# - Errores a evitar

# 3. Actualizar MEMORY.md
```

---

## 🔄 Resumen Automático (Template)

```markdown
## Resumen [FECHA]

### ✅ Completado
- 

### 🔄 En Progreso
- 

### ⏳ Pendiente
- 

### 📊 Métricas
- Leads: X
- Servicios: Y activos
- Last check: HH:MM
```

---

## 📝 Protocolo de Check

```bash
#!/bin/bash
# check-heartbeat.sh

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %Z')
echo "[$TIMESTAMP] Heartbeat check..."

# 1. Verificar servicios
if ./deploy.sh status | grep -q "UP"; then
    echo "✅ Servicios activos"
else
    echo "⚠️ Revisar servicios"
fi

# 2. Verificar memoria
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100}')
echo "📊 RAM: ${MEMORY_USAGE}%"

# 3. Verificar messages pendientes
PENDING=$(curl -s http://localhost:8081/api/leads 2>/dev/null | grep -c "nuevo" || echo "0")
echo "📬 Leads nuevos: $PENDING"

# 4. Decidir outreach
HOUR=$(date +%H)
if [ "$HOUR" -ge 8 ] && [ "$HOUR" -lt 23 ]; then
    if [ "$PENDING" -gt 0 ]; then
        echo "🔔 Notificar humano"
    else
        echo "💤 HEARTBEAT_OK"
    fi
else
    echo "😴 Fuera de horario - HEARTBEAT_OK"
fi
```

---

## 🎯 Tareas Automáticas por Prioridad

### Alta Prioridad (Inmediato)

- [ ] Notificar leads nuevos
- [ ] Alertar servicios caídos
- [ ] Recordar eventos < 2h

### Media Prioridad (4 horas)

- [ ] Revisar反馈 de tasks
- [ ] Actualizar métricas
- [ ] Checkear mensajes importantes

### Baja Prioridad (Diario)

- [ ] Resumir progreso
- [ ] Actualizar MEMORY.md
- [ ] Planificar siguiente día

---

## 📦 Dependencies

- `deploy.sh` - Script de gestión de servicios
- `state/foundry-state.json` - Estado del sistema
- `memory/YYYY-MM-DD.md` - Notas diarias
- `MEMORY.md` - Memoria a largo plazo

---

**Última actualización:** 2026-02-02  
**Próxima revisión:** 2026-02-09
