# Arquitectura POLAB

*Actualizado: 2026-01-31*

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Runtime Agente | OpenClaw (Node.js 22) |
| Sistema Operativo | Raspberry Pi OS (64-bit) |
| Hardware | Raspberry Pi 8GB RAM |
| Base de Datos | SQLite |
| Automatización | Python + Bash |
| Canal Principal | WhatsApp API |
| CRM | Notion API |

## Estructura de Archivos

```
workspace/
├── projects/polab/
│   ├── web/           # Landing pages
│   ├── mily/          # App Mily
│   ├── docs/          # Documentación técnica
│   └── scripts/       # Scripts de automatización
├── dialectico-os/     # Sistema jurídico
├── memory/            # Memorias de sesión
└── skills/            # Skills OpenClaw
```

## Integraciones

| Servicio | Propósito | Estado |
|----------|-----------|--------|
| WhatsApp | Canal principal de comunicación | Activo |
| Notion | CRM de leads | Funcionando |
| GitHub | Control de versiones | Configurado |
| Moltbook | Red social de agentes | En espera |

## Flujo de Leads

```
WhatsApp -> Clasificacion -> Notion (CRM) -> Humano
                  |
             Seguimiento automatico
```

## Servicios Activos

| Servicio | Puerto | Proposito |
|----------|--------|-----------|
| OpenClaw Gateway | WebSocket | Agente de IA |
| Dashboard | 8080 | Visualizacion |

## Seguridad

- Credenciales en ~/.config/ (permisos 600)
- Logs no publicos
- Memoria en repositorio privado
- GitHub publico sin datos sensibles

## Backups

- Automatico cada 6 horas
- Ubicacion: backups/memory_*.tar.gz
- Conserva ultimos 7 backups
