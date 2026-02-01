# Arquitectura Polab Core - Resumen Técnico

## Capas Funcionales del Sistema

### 1. Presencia Omnicanal
- WhatsApp: Interacción rápida y móvil
- Panel Web (Brave): Control rico en datos
- Transición fluida manteniendo contexto

### 2. Memoria Proactiva (memU)
- Memoria Episódica: Registra interacciones como vectores semánticos
- Memoria Semántica: Extrae hechos y preferencias ("el usuario prefiere reuniones por la tarde")
- Disparadores Proactivos: "Si usuario siempre pregunta X a las 9AM, generar anticipadamente"

### 3. Ejecución Soberana (Local)
- Raspberry Pi 5 + NVMe: Velocidad y privacidad
- Docker endurecido: Aislamiento y seguridad
- Tailscale: Acceso remoto seguro sin puertos abiertos

## Componentes Clave

| Componente | Función | Integración |
|------------|---------|-------------|
| OpenClaw Core | Agente principal | Docker (puertos 127.0.0.1) |
| Ollama (Qwen 2.5) | Inferencia local | Docker (modo lectura) |
| memU | Memoria proactiva | Red interna |
| Code-Server | IDE en navegador | Docker (127.0.0.1:8080) |
| Tailscale | VPN mesh segura | Acceso externo |

## Métricas de Rendimiento Objetivo

| Métrica | Objetivo | Implementación |
|---------|----------|----------------|
| Latencia respuesta | < 500ms | Ollama local + caché |
| Uptime | > 99.9% | Auto-reinicio Docker |
| Memoria usada | < 6GB | Límites en Docker |
| Inferencia local | 10-12 t/s | Qwen 2.5 1.5B |

## Flujo de Trabajo Proactivo: Informe Matutino

```
07:00: Cron activa habilidad
     ↓
Consulta: Calendario (Composio) + Gmail + Weather + Sistema
     ↓
Claude 3.5: Sintetiza datos → Resumen ejecutivo
     ↓
WhatsApp: Envío automático al usuario
```

## Ventajas sobre VPS tradicional

| Aspecto | VPS | Polab Core (Pi) |
|---------|-----|------------------|
| Costo mensual | $10-30 | $0.40 (luz) |
| Privacidad | Terceros | Local |
| Hardware | Limitado | Controlado |
| Latencia local | N/A | 0ms (dispositivos LAN) |
