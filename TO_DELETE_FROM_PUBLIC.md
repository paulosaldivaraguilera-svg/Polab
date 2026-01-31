# Archivos a Eliminar/Excluir del Repositorio Público

## Eliminación Inmediata (git rm)

```bash
# Archivos de identidad personal
docs/MEMORY.md       # Memoria personal, contactos, proyectos detallados
docs/USER.md         # Datos del usuario
docs/IDENTITY.md     # Identidad privada, quién es

# Notas sensibles
memory/reunion-celula-*.md  # Reuniones políticas
memory/heartbeat-state.json # Estado de monitoreo
memory/persistent/*.md      # Memoria persistente personal

# Backups y logs
backups/              # Backups de memoria
logs/                 # Logs con datos de actividad

# Proyectos sensibles
affiliate-polymarket.md    # Análisis de riesgo financiero
plan-negocio.md            # Estrategia comercial detallada
```

## No Hacer Commit (agregar a .gitignore)

```
# Archivos personales
agenda-*.md
notas-personales/

# Entorno local
.env
.env.local
*.local

# Temporales
*.tmp
*.swp
*~
.DS_Store
```

## Lo que SÍ puede staying público

- `dialectico-os/` - Código de sistema jurídico
- `projects/polab/` - Infraestructura POLAB
- `projects/gaming/elemental-pong/` - Juego público
- `projects/web-personal/` - Web personal (si es pública)
- `projects/tools/scripts/` - Scripts de utilidad general
- `docs/AGENTS.md` - Guías para agentes (público)
- `docs/SOUL.md` - Configuración del agente (público)
- `docs/TOOLS.md` - Notas de herramientas (público)
- `docs/README.md` - Documentación general
